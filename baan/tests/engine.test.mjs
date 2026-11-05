import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { git, snapshot, changedFiles, matches } from "../src/snapshot.mjs";
import { repoLock } from "../src/repolock.mjs";
import { cli, decide } from "../src/cli.mjs";
import { fromPlan, validatePacket, schemaFor } from "../src/packet.mjs";
import { schedule } from "../src/scheduler.mjs";
import { callSession } from "../src/session.mjs";
import { evidence, counts, testNames } from "../src/gate.mjs";
import { persist, loadRun, save } from "../src/store.mjs";
import { verification } from "../src/triage.mjs";
import { integrate } from "../src/integrate.mjs";
import { approvalBasis, documentBasis } from "../src/packet.mjs";
import { applyPlanning } from "../src/planner.mjs";

import { fixture, cfg, packet, runAt, good, passing, session } from "./helpers.mjs";

test("engine snapshot preserves staged/unstaged files, index and stash; detects untracked deletion", (t) => {
  const { repo } = fixture(t);
  writeFileSync(path.join(repo, "code.mjs"), "staged"); git(repo, "add", "code.mjs");
  writeFileSync(path.join(repo, "code.mjs"), "unstaged");
  writeFileSync(path.join(repo, "new.txt"), "new");
  const status = git(repo, "status", "--porcelain"), index = git(repo, "write-tree"), stash = git(repo, "stash", "list");
  const before = snapshot(repo);
  assert.equal(git(repo, "status", "--porcelain"), status); assert.equal(git(repo, "write-tree"), index); assert.equal(git(repo, "stash", "list"), stash);
  assert.ok(before.preexisting_changes.includes("code.mjs"));
  assert.equal(git(repo, "show", before.untracked_blobs["new.txt"]), "new");
  rmSync(path.join(repo, "new.txt")); assert.deepEqual(changedFiles(before, snapshot(repo)), ["new.txt"]);
});
test("engine lock rejects a second writer and releases for the next run", (t) => {
  const { root, repo } = fixture(t); const release = repoLock(root, repo);
  assert.throws(() => repoLock(root, repo), /LOCK_BUSY/);
  assert.throws(() => repoLock(path.join(root, "second-workspace"), repo), /LOCK_BUSY/);
  release(); repoLock(root, repo)();
});
test("engine packet rejects traversal and dependencies are checked before execution", (t) => {
  const { repo } = fixture(t);
  assert.throws(() => validatePacket(packet(repo, "../escape")), /invalid/);
  assert.throws(() => validatePacket(packet(repo, "WP-1", { owns: ["../secret"] })), /relative/);
  assert.throws(() => fromPlan({ packages: [packet(repo, "A", { depends_on: ["B"] }), packet(repo, "B", { depends_on: ["A"] })] }), /cycle/);
  assert.ok(matches("src/file.mjs", "src/**/*.mjs")); assert.ok(!matches("src/else/file.mjs", "src/*.mjs"));
});
test("engine direct runs snapshot -> worker -> machine gate -> done without committing", async (t) => {
  const { root, repo } = fixture(t); const head = git(repo, "rev-parse", "HEAD"); const run = runAt(root, [packet(repo)]);
  await schedule(run, cfg, { session, execute: passing });
  assert.equal(run.packages[0].state, "done"); assert.equal(run.packages[0].gate.snapshot, snapshot(repo).id);
  assert.ok(existsSync(run.packages[0].gate.diff_file));
  assert.ok(existsSync(run.packages[0].gate.snapshots_file));
  assert.ok(!readFileSync(run.packages[0].gate.snapshots_file, "utf8").includes('"summary"'));
  assert.equal(git(repo, "rev-parse", "HEAD"), head); assert.ok(existsSync(path.join(run.dir, "status.md")));
});
test("engine no approval = no provider call, decide persists approval and resumes", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo, "A", { acceptance_approved: false })]);
  let calls = 0;
  await schedule(run, cfg, { session: async () => { calls++; }, execute: passing });
  assert.equal(calls, 0); assert.equal(run.packages[0].state, "waiting_human");
  assert.throws(() => decide(run, "A", { approve: true, source: "chat", decision: "yes" }), /by user/);
  decide(run, "A", { approve: true, by: "user", source: "chat", decision: "yes" });
  await schedule(run, cfg, { session, execute: passing }); assert.equal(run.packages[0].state, "done");
});
test("engine environment failure blocks before opening worker", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]); let calls = 0;
  await schedule(run, cfg, { session: async () => { calls++; }, execute: async () => ({ code: 1, ok: false, output: "Access is denied", timedOut: false }) });
  assert.equal(calls, 0); assert.equal(run.packages[0].state, "env_failed");
});
test("engine scope violation is reworked, never automatically reverted", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo, "A", { budget: { max_rework: 0 } })]);
  await schedule(run, cfg, { execute: passing, session: async () => { writeFileSync(path.join(repo, "outside.txt"), "keep"); return structuredClone(good); } });
  assert.equal(run.packages[0].failureClass, "SCOPE_VIOLATION"); assert.equal(run.packages[0].state, "waiting_human"); assert.equal(readFileSync(path.join(repo, "outside.txt"), "utf8"), "keep");
});
test("engine one writer per repo; cross-repo writers overlap; dependencies start after done", async (t) => {
  const { root, repo, makeRepo } = fixture(t), other = makeRepo("other");
  const packages = [packet(repo, "A"), packet(other, "B"), packet(repo, "C", { depends_on: ["A"], dirty_approved: true })];
  const run = runAt(root, packages); const busy = new Set(), starts = []; let concurrent = 0;
  await schedule(run, cfg, { execute: passing, session: async (r, p, role) => {
    if (role !== "worker") return session(r, p, role);
    assert.ok(!busy.has(p.repo.path)); busy.add(p.repo.path); concurrent = Math.max(concurrent, busy.size); starts.push(p.id);
    if (p.id === "C") assert.equal(packages[0].state, "done");
    await new Promise((resolve) => setTimeout(resolve, 30));
    const result = await session(r, p, role); busy.delete(p.repo.path); return result;
  } });
  assert.equal(concurrent, 2); assert.deepEqual(starts, ["A", "B", "C"]); assert.ok(packages.every((p) => p.state === "done"));
});
test("engine cancelled package keeps edits and does not start dependent", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo, "A"), packet(repo, "B", { depends_on: ["A"] })]);
  await schedule(run, cfg, { execute: passing, session: async (r, p, role, c, opts) => {
    writeFileSync(path.join(repo, "code.mjs"), "partial"); save(path.join(run.dir, "cancel-A.json"), {});
    await new Promise((resolve) => opts.signal.addEventListener("abort", resolve, { once: true })); throw new Error("cancelled");
  } });
  assert.equal(run.packages[0].state, "cancelled"); assert.equal(run.packages[1].state, "blocked"); assert.equal(readFileSync(path.join(repo, "code.mjs"), "utf8"), "partial");
});
test("engine verifier is independent, no worker summary in prompt; high-risk overlay", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { risk: "high", result: { summary: "SECRET SUMMARY" } });
  const run = runAt(root, [p]); const localCfg = { agents: { codex: { command: "fake", promptVia: "stdin", readArgs: ["exec", "-"], writeArgs: [], answerFrom: "answerFile", usage: { args: [], format: "codex-jsonl" } } }, tiers: { t5: { codex: {} } } };
  await callSession(run, p, "verifier", localCfg, { runner: async (def, args, via, prompt) => {
    assert.ok(!prompt.includes("SECRET SUMMARY")); assert.ok(prompt.includes("acceptance"));
    return { ok: true, answer: JSON.stringify({ verdict: "PASS", failure_class: "", findings: [], acceptance: [] }), durationMs: 1 };
  } });
  assert.deepEqual(verification(p, [p]), ["acceptance"]);
});
test("engine evidence reused only for unchanged snapshot + command; parses test counts", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]); let calls = 0;
  const execute = async (cmd) => { calls++; return passing(cmd); };
  await evidence(run, repo, "test", { execute }); await evidence(run, repo, "test", { execute }); assert.equal(calls, 1);
  writeFileSync(path.join(repo, "code.mjs"), "changed"); await evidence(run, repo, "test", { execute }); assert.equal(calls, 2);
  assert.equal(counts("Passed: 1,234 Failed: 0 Skipped: 2").passed, 1234);
});
test("engine dry-run never creates run or calls provider; legacy tasks grouped by explicit package", async (t) => {
  const { root, repo } = fixture(t); const file = path.join(root, "plan.json"); save(file, { packages: [packet(repo)] });
  const result = await cli(["run", "--plan", file, "--workspace", root, "--dry-run"], { cfg });
  assert.equal(result.packages.length, 1); assert.ok(!existsSync(path.join(root, ".baan", "runs")));
});
test("engine crash checkpoint resumes original worker session and retains before snapshot", async (t) => {
  const { root, repo } = fixture(t);
  const before = snapshot(repo); const run = runAt(root, [packet(repo, "A", { state: "running", session: { agent: "codex", id: "saved-session" }, before })]);
  const restored = loadRun(root, run.dir);
  await schedule(restored, cfg, { execute: passing, session: async (r, p, role) => {
    if (role === "worker") { assert.equal(p.session.id, "saved-session"); assert.equal(p.before.id, before.id); }
    return session(r, p, role);
  } });
  assert.equal(restored.packages[0].state, "done");
});
test("engine stale source prevents worker and requires renewed human approval", async (t) => {
  const { root, repo } = fixture(t); writeFileSync(path.join(repo, "req.md"), "old"); git(repo, "add", "."); git(repo, "commit", "-qm", "req");
  const p = packet(repo, "A", { read_first: [{ path: "req.md" }] }); p.basis = { docs: documentBasis(p) };
  const run = runAt(root, [p]); writeFileSync(path.join(repo, "req.md"), "changed");
  let calls = 0; await schedule(run, cfg, { execute: passing, session: async () => { calls++; } });
  assert.equal(calls, 0); assert.equal(p.state, "stale"); assert.equal(p.acceptance_approved, false);
});
test("engine dirty ownership waits while approved independent work completes", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other");
  writeFileSync(path.join(repo, "code.mjs"), "user change"); const run = runAt(root, [packet(repo, "A"), packet(other, "B")]);
  let calls = 0; await schedule(run, cfg, { execute: passing, session: async (r, p, role) => { calls++; return session(r, p, role); } });
  assert.equal(calls, 1); assert.match(run.packages[0].questions.join(" "), /allow-dirty/); assert.equal(run.packages[1].state, "done");
});
test("engine mid-run human question parks dependents while independent repository completes", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other");
  const run = runAt(root, [packet(repo, "A"), packet(repo, "B", { depends_on: ["A"] }), packet(other, "C")]);
  await schedule(run, cfg, { execute: passing, session: async (r, p, role) => p.id === "A" && role === "worker" ? { ...good, state: "NEEDS_HUMAN", questions: ["policy?"] } : session(r, p, role) });
  assert.deepEqual(run.packages.map((p) => p.state), ["waiting_human", "blocked", "done"]);
});
test("engine integration evidence invalidated when either repository changes", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other");
  const run = runAt(root, [packet(repo, "A", { state: "done" }), packet(other, "B", { state: "done" })]);
  run.integration = [{ packages: ["A", "B"], command: "contract" }]; let calls = 0;
  const execute = async (cmd) => { calls++; return passing(cmd); };
  await integrate(run, { execute }); await integrate(run, { execute }); assert.equal(calls, 1);
  writeFileSync(path.join(other, "code.mjs"), "new contract"); await integrate(run, { execute }); assert.equal(calls, 2);
});
test("engine CLI retries malformed planner once and never dispatches invalid plan", async (t) => {
  const { root, repo } = fixture(t); const plan = path.join(root, "plan.json"); save(plan, { packages: [packet(repo, "WP-1", { needs_planning: true })] });
  let calls = 0;
  const r = await cli(["run", "--plan", plan, "--workspace", root, "--tier", "t5"], { cfg, session: async () => { calls++; throw new Error("invalid schema"); }, execute: passing });
  assert.equal(calls, 2); assert.equal(r.packages[0].state, "blocked");
});
test("engine shared contract mismatch goes to Planner, cited shared decision resumes Worker", async (t) => {
  const { root, repo } = fixture(t); writeFileSync(path.join(repo, "contract.md"), "value is twice input"); git(repo, "add", "."); git(repo, "commit", "-qm", "contract");
  const run = runAt(root, [packet(repo, "A", { read_first: [{ path: "contract.md" }] })]);
  const roles = []; let writerCalls = 0;
  await schedule(run, cfg, { execute: passing, session: async (r, p, role) => {
    roles.push(role);
    if (role === "worker" && !writerCalls++) return { ...good, state: "NEEDS_DECISION", questions: ["what is value?"] };
    if (role === "planner") return { packages: [], questions: [], decisions: [{ text: "twice input", source: "contract.md", scope: "shared", blocks: ["A"] }] };
    return session(r, p, role);
  } });
  assert.deepEqual(roles.slice(0, 3), ["worker", "planner", "worker"]); assert.equal(run.packages[0].state, "done");
});
test("engine legacy tasks merge same module/files; AC copied verbatim from knowledge", (t) => {
  const { root, repo } = fixture(t); const knowledge = path.join(root, "knowledge"); mkdirSync(knowledge);
  const row = "| AC-001-01 | Exact original acceptance, including punctuation. |";
  writeFileSync(path.join(knowledge, "req-001.md"), `# Requirement\n${row}\n`);
  const plan = { commands: packet(repo).commands, tasks: [
    { id: "BE-1", module: "quiz", owner: "be", owns: ["code.mjs"], ac_ids: ["AC-001-01"] },
    { id: "BE-2", module: "quiz", owner: "be", owns: ["code.mjs"], ac_ids: ["AC-001-01"], depends_on: ["BE-1"] },
  ] };
  const [p] = fromPlan(plan, { repo, knowledgeRoot: knowledge, select: "BE-1,BE-2" });
  assert.deepEqual(p.tasks, ["BE-1", "BE-2"]); assert.deepEqual(p.depends_on, []); assert.equal(p.acceptance[0].text, row); assert.match(p.acceptance[0].source, /#L2$/);
});
test("engine busy repo does not crash or stop independent work", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other"); const held = repoLock(root, repo);
  const run = runAt(root, [packet(repo, "A"), packet(other, "B")]);
  try { await schedule(run, cfg, { session, execute: passing }); } finally { held(); }
  assert.equal(run.packages[0].state, "env_failed"); assert.equal(run.packages[1].state, "done");
});
test("engine initial planner questions are gathered before dispatch; no independent writer starts", async (t) => {
  const { root, repo } = fixture(t); const plan = path.join(root, "plan.json"); save(plan, { packages: [packet(repo, "WP-1", { needs_planning: true })] }); const roles = [];
  const result = await cli(["run", "--plan", plan, "--workspace", root, "--tier", "t5"], { cfg, execute: passing, session: async (r, p, role) => {
    roles.push(role); return { packages: [{ id: "WP-1", depends_on: [], subpackages: [] }], questions: [{ text: "confirm policy", blocks: ["WP-1"] }], decisions: [] };
  } });
  assert.deepEqual(roles, ["planner"]); assert.equal(result.packages[0].state, "waiting_human");
});
test("engine Planner splits approved scope without changing commands or inventing AC/owns", (t) => {
  const { repo } = fixture(t); const parent = packet(repo, "A", { tasks: ["T1", "T2"] });
  const slices = ["T1", "T2"].map((id, i) => ({ id: `A-${i}`, title: id, goal: id, tasks: [id], owns: ["code.mjs"], acceptance_ids: ["AC-1"], depends_on: i ? ["A-0"] : [] }));
  const result = { packages: [{ id: "A", depends_on: [], subpackages: slices }], questions: [], decisions: [] };
  const split = applyPlanning([parent], result); assert.equal(split.length, 2); assert.deepEqual(split[1].depends_on, ["A-0"]); assert.deepEqual(split[0].commands, parent.commands);
  result.packages[0].subpackages[0].owns = ["**"];
  assert.throws(() => applyPlanning([parent], result), /expanded owns/);
});
test("engine maps exact test names rather than arbitrary output substrings", () => {
  const names = testNames("# Subtest: first test\n✔ second test (4ms)\n  Passed Namespace.Third [1 ms]\n# pass 3\n");
  assert.ok(names.has("first test")); assert.ok(names.has("second test")); assert.ok(names.has("Namespace.Third")); assert.ok(!names.has("")); assert.ok(!names.has("pass"));
});
test("engine persists Codex thread id before the provider completes, allowing crash recovery", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo); const run = runAt(root, [p]);
  const agents = { agents: { codex: { command: "fake", promptVia: "stdin", readArgs: ["exec", "-"], writeArgs: ["exec", "-"], answerFrom: "answerFile" } }, tiers: { t5: { codex: {} } } };
  await assert.rejects(callSession(run, p, "worker", agents, { runner: async (def, args, via, prompt, cwd, timeout, file, opts) => {
    opts.onStdout('{"type":"thread.started","thread_id":"persisted-thread"}\n'); throw new Error("core disappeared");
  } }), /core disappeared/);
  assert.equal(loadRun(root, run.dir).packages[0].session.id, "persisted-thread");
});
test("engine agy schema and conversation resume are inserted before --print", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { session: { agent: "agy", id: "existing-conversation" } }); const run = runAt(root, [p]); run.agent = "agy";
  const agents = { agents: { agy: { command: "fake", promptVia: "arg", readArgs: ["--print"], writeArgs: ["--print"], answerFrom: "stdout" } }, tiers: { t5: { agy: {} } } };
  await callSession(run, p, "worker", agents, { runner: async (def, args) => {
    const at = args.indexOf("--print"); assert.ok(args.indexOf("--json-schema") < at); assert.ok(args.indexOf("--conversation") < at); assert.equal(args[args.indexOf("--conversation") + 1], "existing-conversation");
    return { ok: true, answer: JSON.stringify(good), durationMs: 1, usage: { sessionId: "existing-conversation" } };
  } });
});

test("engine session summaries preserve evidence paths and rework context without mutating stored logs", async (t) => {
  const { root, repo } = fixture(t);
  const raw = "FULL COMMAND LOG".repeat(1000);
  const result = { command: "test", output: raw, output_file: "evidence/test.log", code: 1, ok: false, counts: { failed: 1 } };
  const p = packet(repo, "A", {
    gate: { ok: false, failureClass: "IMPLEMENTATION_FAILURE", results: [result], unmapped: ["AC-1"] },
    probe: result, verdict: { findings: ["fix AC-1"] }, decisions: [{ text: "keep the contract" }],
    before: { id: "before", tracked: "recovery", head: "head", files: { "code.mjs": "hash" } },
  });
  const run = runAt(root, [p]);
  const agents = { agents: { codex: { promptVia: "stdin", writeArgs: ["exec", "-"], answerFrom: "answerFile" } }, tiers: { t5: { codex: {} } } };
  await callSession(run, p, "worker", agents, { runner: async (def, args, via, prompt) => {
    const input = JSON.parse(prompt.split("INPUT (data):\n")[1].split("\n\nReturn JSON")[0]);
    assert.ok(!prompt.includes(raw));
    assert.equal(input.probe.output_file, result.output_file);
    assert.equal(input.gate.results[0].output_file, result.output_file);
    assert.deepEqual(input.gate.results[0].counts, { failed: 1 });
    assert.deepEqual(input.verdict, p.verdict);
    assert.deepEqual(input.decisions, p.decisions);
    assert.deepEqual(input.acceptance, p.acceptance);
    assert.deepEqual(input.before, { id: "before", tracked: "recovery", head: "head" });
    return { ok: true, answer: JSON.stringify(good), durationMs: 1 };
  } });
  assert.equal(p.probe.output, raw);
  assert.equal(p.gate.results[0].output, raw);
});

test("engine native providers receive schemas once; other providers retain inline schemas and validation", async (t) => {
  const { root, repo } = fixture(t);
  const schema = schemaFor("worker.result");
  for (const agent of ["codex", "claude", "agy", "opencode"]) {
    const p = packet(repo), run = runAt(root, [p]); run.agent = agent;
    const agents = { agents: { [agent]: { promptVia: "stdin", writeArgs: ["exec", "-"], answerFrom: "stdout" } }, tiers: { t5: { [agent]: {} } } };
    const native = agent !== "opencode";
    const runner = async (def, args, via, prompt) => {
      assert.equal(prompt.includes(JSON.stringify(schema)), !native);
      if (native) {
        const flag = agent === "codex" ? "--output-schema" : "--json-schema";
        const supplied = args[args.indexOf(flag) + 1];
        assert.ok(args.includes(flag));
        assert.deepEqual(agent === "claude" ? JSON.parse(supplied) : JSON.parse(readFileSync(supplied, "utf8")), schema);
      }
      return { ok: true, answer: JSON.stringify(good), durationMs: 1 };
    };
    assert.deepEqual(await callSession(run, p, "worker", agents, { runner }), good);
    await assert.rejects(callSession(run, p, "worker", agents, { runner: async () => ({ ok: true, answer: '{"state":"DONE"}', durationMs: 1 }) }), /required/);
  }
});

test("engine legacy grouping preserves task dependencies and does not extend input read_first arrays", (t) => {
  const { repo } = fixture(t);
  const first = { ...packet(repo, "T1"), package: "A", read_first: [{ path: "first.md" }] };
  const second = { ...packet(repo, "T2"), package: "A", read_first: [{ path: "second.md" }], depends_on: ["T1"] };
  const third = { ...packet(repo, "T3"), package: "B", depends_on: ["T2"] };
  const plan = { tasks: [first, second, third] }, original = structuredClone(plan);
  const packages = fromPlan(plan);
  assert.deepEqual(packages.map((p) => [p.id, p.tasks, p.depends_on]), [["A", ["T1", "T2"], []], ["B", ["T3"], ["A"]]]);
  assert.deepEqual(packages[0].read_first, [{ path: "first.md" }, { path: "second.md" }]);
  assert.deepEqual(plan, original);
});
