import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fixture, packet, runAt, cfg, good, passing, session } from "./helpers.mjs";
import { approvalBasis, readiness, fromPlan, validatePacket } from "../src/packet.mjs";
import { cli, decide, parse, report } from "../src/cli.mjs";
import { schedule } from "../src/scheduler.mjs";
import { save, loadRun } from "../src/store.mjs";
import { callSession } from "../src/session.mjs";
import { integrate } from "../src/integrate.mjs";
import { evidence } from "../src/gate.mjs";
import { git, snapshot } from "../src/snapshot.mjs";
import { repoLock } from "../src/repolock.mjs";
import { applyPlanning } from "../src/planner.mjs";
import { resolveTimeout } from "../src/timeout.mjs";
import { looksLikeLimitError, looksLikeMissingCli, looksLikeCapacityError, looksLikeStartupError } from "../src/failure-class.mjs";

test("CLI rejects ambiguous inputs, invalid bounds, missing values and discarded flags", () => {
  for (const argv of [["--timeout", "0"], ["--timeout", "Infinity"], ["--timeout", "1.5"], ["--max-parallel", "0"], ["--goal"], ["--write"], ["--packet", "a", "--plan", "b"], ["run", "oops"], ["--init", "--goal", "x"], ["--cancel", "A", "--dry-run"]]) assert.throws(() => parse(argv));
  assert.equal(resolveTimeout({ timeoutSec: 100 }, { _timeoutSec: 200 }), 200);
  assert.equal(resolveTimeout({ timeoutSec: 100, timeoutSet: true }, { _timeoutSec: 200 }), 100);
});
test("provider fallback classifiers ignore success, timeouts, answer-only CLI errors and late startup failures", () => {
  assert.equal(looksLikeLimitError({ ok: false, error: "rate limit" }), true);
  assert.equal(looksLikeLimitError({ ok: true, answer: "rate limit" }), false);
  assert.equal(looksLikeLimitError({ ok: false, timedOut: true, error: "rate limit" }), false);
  assert.equal(looksLikeMissingCli({ ok: false, answer: "command not found" }), false);
  assert.equal(looksLikeMissingCli({ ok: false, error: "spawn codex ENOENT" }), true);
  assert.equal(looksLikeCapacityError({ ok: false, stderr: "ERROR: model is at capacity" }), true);
  assert.equal(looksLikeCapacityError({ ok: false, stderr: "task mentions at capacity" }), false);
  assert.equal(looksLikeStartupError({ ok: false, durationMs: 1000, error: "ENOTFOUND" }), true);
  assert.equal(looksLikeStartupError({ ok: false, durationMs: 70000, error: "ENOTFOUND" }), false);
});
test("approval binds acceptance, scope, commands and sources; unrelated decisions cannot refresh it", (t) => {
  const { root, repo } = fixture(t); const p = packet(repo); const run = runAt(root, [p]);
  assert.deepEqual(readiness(p), []);
  p.acceptance[0].text = "changed rule";
  assert.match(readiness(p).join(), /stale approval/);
  assert.throws(() => decide(run, p.id, { decision: "yes", source: "chat" }), /by user/);
  decide(run, p.id, { decision: "answer only", source: "fixture", by: "user" });
  assert.match(readiness(p).join(), /stale approval/);
  decide(run, p.id, { approve: true, decision: "approve revised acceptance", source: "fixture", by: "user" });
  assert.deepEqual(readiness(p), []);
  p.commands.test_full = "different command";
  assert.match(readiness(p).join(), /stale approval/);
});
test("legacy task gates survive normalization and require separate human decisions", (t) => {
  const { root, repo } = fixture(t); const source = packet(repo);
  const [p] = fromPlan({ commands: source.commands, tasks: [{ id: "BE-1", owner: "be", owns: ["code.mjs"], gate_ids: ["G-UX"], acceptance: source.acceptance }] }, { repo });
  const run = runAt(root, [p]);
  decide(run, p.id, { approve: true, by: "user", decision: "fixture acceptance", source: "fixture" });
  assert.match(readiness(p).join(), /G-UX/);
  decide(run, p.id, { gate: "G-UX", by: "user", decision: "fixture signed handoff", source: "fixture" });
  assert.deepEqual(readiness(p), []);
  assert.throws(() => decide(run, p.id, { gate: "G-OTHER", by: "user", decision: "yes", source: "fixture" }), /unknown human gate/);
});
test("packet validation rejects malformed budgets, duplicate AC, unsafe scopes and incompatible task groups", (t) => {
  const { repo } = fixture(t);
  for (const extra of [{ budget: { max_rework: -1 } }, { contracts: "bad" }, { owns: [".GIT/config"] }, { depends_on: ["WP-1"] }, { acceptance: [packet(repo).acceptance[0], packet(repo).acceptance[0]] }]) assert.throws(() => validatePacket(packet(repo, "WP-1", extra)));
  assert.throws(() => fromPlan({ tasks: [{ ...packet(repo, "T1"), package: "A" }, { ...packet(repo, "T2"), package: "A", owns: ["outside"] }] }), /incompatible/);
  const [p] = fromPlan({ packages: [{ ...packet(repo), before: { head: "forged" }, result: good, rework: -999 }] });
  assert.equal(p.before, undefined); assert.equal(p.result, undefined); assert.equal(p.rework, undefined);
});
test("cancelled queued packages never start, including after resume", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]); save(path.join(run.dir, "cancel-WP-1.json"), {});
  let calls = 0;
  await schedule(run, cfg, { execute: passing, session: async () => { calls++; } });
  await schedule(loadRun(root, run.dir), cfg, { execute: passing, session: async () => { calls++; } });
  assert.equal(calls, 0); assert.equal(run.packages[0].state, "cancelled");
});
test("linked worktrees share one writer lock", (t) => {
  const { root, repo } = fixture(t); const linked = path.join(root, "linked");
  git(repo, "worktree", "add", "-b", "fixture-linked", linked);
  const release = repoLock(root, repo);
  try { assert.throws(() => repoLock(root, linked), /LOCK_BUSY/); } finally { release(); }
});
test("fallback drops the prior provider session and never retries after edits or Git state changes", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { session: { agent: "codex", id: "codex-thread" } }); const run = runAt(root, [p]);
  const agents = { agents: Object.fromEntries(["codex", "claude"].map((name) => [name, { command: name, promptVia: "stdin", writeArgs: ["exec", "-"], answerFrom: "stdout" }])), tiers: { t5: { codex: {}, claude: {}, _fallback: ["codex", "claude"] } } };
  const tried = [];
  await callSession(run, p, "worker", agents, { runner: async (def, args) => {
    tried.push(def.command);
    if (def.command === "codex") return { ok: false, error: "rate limit" };
    assert.ok(!args.includes("codex-thread")); assert.ok(args.includes("--session-id"));
    return { ok: true, answer: JSON.stringify(good) };
  } });
  assert.deepEqual(tried, ["codex", "claude"]);
  delete p.session; tried.length = 0;
  await assert.rejects(callSession(run, p, "worker", agents, { runner: async (def) => {
    tried.push(def.command); writeFileSync(path.join(repo, "code.mjs"), "partial"); return { ok: false, error: "rate limit" };
  } }));
  assert.deepEqual(tried, ["codex"]);
});
test("read-only verifier mutations cannot pass and rework receives verifier findings", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { risk: "high", budget: { max_rework: 1 } }); const run = runAt(root, [p]);
  let workers = 0, reviews = 0;
  await schedule(run, cfg, { execute: passing, session: async (r, assignment, role) => {
    if (role === "worker") { if (workers++) assert.deepEqual(assignment.verdict.findings, ["fix value"]); return session(r, assignment, role); }
    if (!reviews++) return { verdict: "FAIL", failure_class: "IMPLEMENTATION_FAILURE", findings: ["fix value"], acceptance: [] };
    writeFileSync(path.join(repo, "code.mjs"), "verifier changed code");
    return { verdict: "PASS", failure_class: "", findings: [], acceptance: [{ id: "AC-1", passed: true, proof: ["value test"] }] };
  } });
  assert.equal(workers, 2); assert.equal(p.state, "waiting_human"); assert.equal(p.failureClass, "SCOPE_VIOLATION");
});
test("integration changes cannot retain done evidence; bounded failures return to the worker", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { state: "done", before: snapshot(repo) }); const run = runAt(root, [p]);
  run.integration = [{ packages: [p.id], command: "contract" }];
  await integrate(run, { execute: async () => ({ ok: false, code: 1, output: "contract failure" }) });
  assert.equal(p.state, "pending"); assert.equal(p.before, undefined); assert.equal(p.previous_attempts.length, 1);
  p.state = "done";
  await integrate(run, { execute: async () => { writeFileSync(path.join(repo, "code.mjs"), "mutation"); return passing("contract"); } });
  assert.equal(p.state, "waiting_human"); assert.equal(p.failureClass, "SCOPE_VIOLATION");
});
test("invalid planning does not mutate trusted packages or accept unknown question ids", (t) => {
  const { repo } = fixture(t); const p = packet(repo); const original = structuredClone(p);
  assert.throws(() => applyPlanning([p], { packages: [], questions: [{ text: "?", blocks: ["unknown"] }], decisions: [] }), /unknown/);
  assert.deepEqual(p, original);
});
test("empty plans fail before creating a successful run and help/version work without workspace config", async (t) => {
  const { root } = fixture(t); const file = path.join(root, "empty.json"); save(file, { packages: [] });
  await assert.rejects(cli(["run", "--plan", file, "--workspace", root], { cfg }), /at least one/);
  assert.match(await cli(["--help"]), /BAAN/); assert.equal(await cli(["--version"]), "0.29.0");
});

test("completed evidence cannot be reused after external edits to owned files", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]);
  await schedule(run, cfg, { session, execute: passing });
  writeFileSync(path.join(repo, "code.mjs"), "external user edit");
  let calls = 0;
  const result = await cli(["run", "--resume", run.dir], { cfg, session: async () => { calls++; }, execute: passing });
  assert.equal(result.ok, false); assert.equal(calls, 0);
  assert.match(result.packages[0].questions.join(), /allow-dirty/);
});
test("Planner cannot mutate another repository before the first writer baseline", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other"); const file = path.join(root, "plan.json");
  save(file, { packages: [packet(repo, "A", { needs_planning: true }), packet(other, "B")] });
  let calls = 0;
  const result = await cli(["run", "--plan", file, "--workspace", root], { cfg, session: async (r, p, role) => {
    calls++; assert.equal(role, "planner"); writeFileSync(path.join(other, "code.mjs"), "unauthorized planner write");
    return { packages: r.packages.map((p) => ({ id: p.id, depends_on: [], subpackages: [] })), questions: [], decisions: [] };
  } });
  assert.equal(result.ok, false); assert.equal(calls, 1);
  assert.match(result.packages[0].questions.join(), /Planner changed/);
});
test("failed command retries retain separate output and result records", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]); let attempt = 0;
  const execute = async () => ({ code: 1, ok: false, output: `failed attempt ${++attempt}`, timedOut: false });
  const first = await evidence(run, repo, "failing command", { execute });
  const second = await evidence(run, repo, "failing command", { execute });
  assert.notEqual(first.output_file, second.output_file);
  assert.equal(readFileSync(first.output_file, "utf8"), "failed attempt 1");
  assert.equal(JSON.parse(readFileSync(first.result_file, "utf8")).ok, false);
  assert.equal(readFileSync(second.output_file, "utf8"), "failed attempt 2");
});
test("report cannot claim success before required integration evidence exists", () => {
  const run = { id: "fixture", dir: "fixture", packages: [{ id: "A", state: "done" }], integration: [{ packages: ["A"], command: "contract" }] };
  assert.equal(report(run).ok, false);
  run.integration[0].evidence = { ok: true };
  assert.equal(report(run).ok, true);
});
