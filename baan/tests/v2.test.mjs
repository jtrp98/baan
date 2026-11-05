import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { git, snapshot, changedFiles, matches } from "../src/v2/snapshot.mjs";
import { repoLock } from "../src/v2/repolock.mjs";
import { cli, decide } from "../src/v2/cli.mjs";
import { fromPlan, validatePacket } from "../src/v2/packet.mjs";
import { schedule } from "../src/v2/scheduler.mjs";
import { callSession } from "../src/v2/session.mjs";
import { evidence, counts, testNames } from "../src/v2/gate.mjs";
import { persist, loadRun, save } from "../src/v2/store.mjs";
import { verification } from "../src/v2/triage.mjs";
import { integrate } from "../src/v2/integrate.mjs";
import { documentBasis } from "../src/v2/packet.mjs";
import { applyPlanning } from "../src/v2/planner.mjs";

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "baan-v2-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const makeRepo = (name) => {
    const repo = path.join(root, name); mkdirSync(repo);
    git(repo, "init"); git(repo, "config", "user.email", "test@invalid"); git(repo, "config", "user.name", "test");
    git(repo, "config", "core.autocrlf", "false");
    writeFileSync(path.join(repo, "code.mjs"), "export const value = 1;\n");
    writeFileSync(path.join(repo, ".gitignore"), ".baan/\n");
    git(repo, "add", "."); git(repo, "commit", "-m", "initial");
    return repo;
  };
  const repo = makeRepo("repo");
  return { root, repo, makeRepo };
}
const cfg = { agents: { codex: {}, claude: {} }, tiers: { t5: { codex: {}, claude: {} }, t2: { codex: {}, claude: {} } } };
function packet(repo, id = "WP-1", overrides = {}) {
  return { id, title: "tiny change", goal: "change a value", tasks: [id], repo: { path: repo }, owns: ["code.mjs"], read_first: [], depends_on: [], risk: "low",
    acceptance: [{ id: "AC-1", text: "value is 2", source: "user" }], commands: { build: "build", test_targeted: "test", test_full: "test" },
    acceptance_approved: true, approved_by: "user", approved_at: "2026-11-05", state: "pending", ...overrides };
}
function runAt(root, packages) {
  const run = { version: 2, id: "test", root, dir: path.join(root, ".baan", "runs", "test"), packages, tier: "t5", plannerTier: "t2", agent: "codex", maxParallel: 3, timeoutSec: 10, direct: true };
  mkdirSync(run.dir, { recursive: true }); persist(run); return run;
}
const good = { state: "DONE", summary: "completed", acceptance: [{ id: "AC-1", proof: ["value test"] }], test_changes: [], questions: [], failure_class: "" };
const passing = async (cmd) => ({ command: cmd, code: 0, ok: true, output: "# Subtest: value test\n# pass 1\n# fail 0\n", timedOut: false });
const session = async (run, p, role) => {
  if (role === "verifier") return { verdict: "PASS", findings: [], failure_class: "", acceptance: p.acceptance.map((a) => ({ id: a.id, passed: true, proof: ["value test"] })) };
  if (role === "planner") return { packages: run.packages.map((p) => ({ id: p.id, depends_on: p.depends_on })), questions: [], decisions: [] };
  writeFileSync(path.join(p.repo.path, "code.mjs"), "export const value = 2;\n");
  return structuredClone(good);
};

test("v2 snapshot preserves staged/unstaged files, index and stash; detects untracked deletion", (t) => {
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
test("v2 lock rejects a second writer and releases for the next run", (t) => {
  const { root, repo } = fixture(t); const release = repoLock(root, repo);
  assert.throws(() => repoLock(root, repo), /LOCK_BUSY/);
  assert.throws(() => repoLock(path.join(root, "second-workspace"), repo), /LOCK_BUSY/);
  release(); repoLock(root, repo)();
});
test("v2 packet rejects traversal and dependencies are checked before execution", (t) => {
  const { repo } = fixture(t);
  assert.throws(() => validatePacket(packet(repo, "../escape")), /invalid/);
  assert.throws(() => validatePacket(packet(repo, "WP-1", { owns: ["../secret"] })), /relative/);
  assert.throws(() => fromPlan({ packages: [packet(repo, "A", { depends_on: ["B"] }), packet(repo, "B", { depends_on: ["A"] })] }), /cycle/);
  assert.ok(matches("src/file.mjs", "src/**/*.mjs")); assert.ok(!matches("src/else/file.mjs", "src/*.mjs"));
});
test("v2 direct runs snapshot -> worker -> machine gate -> done without committing", async (t) => {
  const { root, repo } = fixture(t); const head = git(repo, "rev-parse", "HEAD"); const run = runAt(root, [packet(repo)]);
  await schedule(run, cfg, { session, execute: passing });
  assert.equal(run.packages[0].state, "done"); assert.equal(run.packages[0].gate.snapshot, snapshot(repo).id);
  assert.equal(git(repo, "rev-parse", "HEAD"), head); assert.ok(existsSync(path.join(run.dir, "status.md")));
});
test("v2 no approval = no provider call, decide persists approval and resumes", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo, "A", { acceptance_approved: false })]);
  let calls = 0;
  await schedule(run, cfg, { session: async () => { calls++; }, execute: passing });
  assert.equal(calls, 0); assert.equal(run.packages[0].state, "waiting_human");
  assert.throws(() => decide(run, "A", { approve: true, source: "chat", decision: "yes" }), /by user/);
  decide(run, "A", { approve: true, by: "user", source: "chat", decision: "yes" });
  await schedule(run, cfg, { session, execute: passing }); assert.equal(run.packages[0].state, "done");
});
test("v2 environment failure blocks before opening worker", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]); let calls = 0;
  await schedule(run, cfg, { session: async () => { calls++; }, execute: async () => ({ code: 1, ok: false, output: "Access is denied", timedOut: false }) });
  assert.equal(calls, 0); assert.equal(run.packages[0].state, "env_failed");
});
test("v2 scope violation is reworked, never automatically reverted", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo, "A", { budget: { max_rework: 0 } })]);
  await schedule(run, cfg, { execute: passing, session: async () => { writeFileSync(path.join(repo, "outside.txt"), "keep"); return structuredClone(good); } });
  assert.equal(run.packages[0].failureClass, "SCOPE_VIOLATION"); assert.equal(run.packages[0].state, "waiting_human"); assert.equal(readFileSync(path.join(repo, "outside.txt"), "utf8"), "keep");
});
test("v2 one writer per repo; cross-repo writers overlap; dependencies start after done", async (t) => {
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
test("v2 cancelled package keeps edits and does not start dependent", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo, "A"), packet(repo, "B", { depends_on: ["A"] })]);
  await schedule(run, cfg, { execute: passing, session: async (r, p, role, c, opts) => {
    writeFileSync(path.join(repo, "code.mjs"), "partial"); save(path.join(run.dir, "cancel-A.json"), {});
    await new Promise((resolve) => opts.signal.addEventListener("abort", resolve, { once: true })); throw new Error("cancelled");
  } });
  assert.equal(run.packages[0].state, "cancelled"); assert.equal(run.packages[1].state, "blocked"); assert.equal(readFileSync(path.join(repo, "code.mjs"), "utf8"), "partial");
});
test("v2 verifier is independent, no worker summary in prompt; high-risk overlay", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { risk: "high", result: { summary: "SECRET SUMMARY" } });
  const run = runAt(root, [p]); const localCfg = { agents: { codex: { command: "fake", promptVia: "stdin", readArgs: ["exec", "-"], writeArgs: [], answerFrom: "answerFile", usage: { args: [], format: "codex-jsonl" } } }, tiers: { t5: { codex: {} } } };
  await callSession(run, p, "verifier", localCfg, { runner: async (def, args, via, prompt) => {
    assert.ok(!prompt.includes("SECRET SUMMARY")); assert.ok(prompt.includes("acceptance"));
    return { ok: true, answer: JSON.stringify({ verdict: "PASS", failure_class: "", findings: [], acceptance: [] }), durationMs: 1 };
  } });
  assert.deepEqual(verification(p, [p]), ["acceptance"]);
});
test("v2 evidence reused only for unchanged snapshot + command; parses test counts", async (t) => {
  const { root, repo } = fixture(t); const run = runAt(root, [packet(repo)]); let calls = 0;
  const execute = async (cmd) => { calls++; return passing(cmd); };
  await evidence(run, repo, "test", { execute }); await evidence(run, repo, "test", { execute }); assert.equal(calls, 1);
  writeFileSync(path.join(repo, "code.mjs"), "changed"); await evidence(run, repo, "test", { execute }); assert.equal(calls, 2);
  assert.equal(counts("Passed: 1,234 Failed: 0 Skipped: 2").passed, 1234);
});
test("v2 dry-run never creates run or calls provider; legacy tasks grouped by explicit package", async (t) => {
  const { root, repo } = fixture(t); const file = path.join(root, "plan.json"); save(file, { packages: [packet(repo)] });
  const result = await cli(["run", "--plan", file, "--workspace", root, "--dry-run"], { cfg });
  assert.equal(result.packages.length, 1); assert.ok(!existsSync(path.join(root, ".baan", "runs")));
});
test("v2 crash checkpoint resumes original worker session and retains before snapshot", async (t) => {
  const { root, repo } = fixture(t);
  const before = snapshot(repo); const run = runAt(root, [packet(repo, "A", { state: "running", session: { agent: "codex", id: "saved-session" }, before })]);
  const restored = loadRun(root, run.dir);
  await schedule(restored, cfg, { execute: passing, session: async (r, p, role) => {
    if (role === "worker") { assert.equal(p.session.id, "saved-session"); assert.equal(p.before.id, before.id); }
    return session(r, p, role);
  } });
  assert.equal(restored.packages[0].state, "done");
});
test("v2 stale source prevents worker and requires renewed human approval", async (t) => {
  const { root, repo } = fixture(t); writeFileSync(path.join(repo, "req.md"), "old"); git(repo, "add", "."); git(repo, "commit", "-qm", "req");
  const p = packet(repo, "A", { read_first: [{ path: "req.md" }] }); p.basis = { docs: documentBasis(p) };
  const run = runAt(root, [p]); writeFileSync(path.join(repo, "req.md"), "changed");
  let calls = 0; await schedule(run, cfg, { execute: passing, session: async () => { calls++; } });
  assert.equal(calls, 0); assert.equal(p.state, "stale"); assert.equal(p.acceptance_approved, false);
});
test("v2 known dirty ownership is presented before any independent package starts", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other");
  writeFileSync(path.join(repo, "code.mjs"), "user change"); const run = runAt(root, [packet(repo, "A"), packet(other, "B")]);
  let calls = 0; await schedule(run, cfg, { execute: passing, session: async () => { calls++; } });
  assert.equal(calls, 0); assert.match(run.packages[0].questions.join(" "), /allow-dirty/);
});
test("v2 mid-run human question parks dependents while independent repository completes", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other");
  const run = runAt(root, [packet(repo, "A"), packet(repo, "B", { depends_on: ["A"] }), packet(other, "C")]);
  await schedule(run, cfg, { execute: passing, session: async (r, p, role) => p.id === "A" && role === "worker" ? { ...good, state: "NEEDS_HUMAN", questions: ["policy?"] } : session(r, p, role) });
  assert.deepEqual(run.packages.map((p) => p.state), ["waiting_human", "blocked", "done"]);
});
test("v2 integration evidence invalidated when either repository changes", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other");
  const run = runAt(root, [packet(repo, "A", { state: "done" }), packet(other, "B", { state: "done" })]);
  run.integration = [{ packages: ["A", "B"], command: "contract" }]; let calls = 0;
  const execute = async (cmd) => { calls++; return passing(cmd); };
  await integrate(run, { execute }); await integrate(run, { execute }); assert.equal(calls, 1);
  writeFileSync(path.join(other, "code.mjs"), "new contract"); await integrate(run, { execute }); assert.equal(calls, 2);
});
test("v2 CLI retries malformed planner once and never dispatches invalid plan", async (t) => {
  const { root, repo } = fixture(t); const plan = path.join(root, "plan.json"); save(plan, { packages: [packet(repo, "WP-1", { needs_planning: true })] });
  let calls = 0;
  const r = await cli(["run", "--plan", plan, "--workspace", root, "--tier", "t5"], { cfg, session: async () => { calls++; throw new Error("invalid schema"); }, execute: passing });
  assert.equal(calls, 2); assert.equal(r.packages[0].state, "blocked");
});
test("v2 shared contract mismatch goes to Planner, cited shared decision resumes Worker", async (t) => {
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
test("v2 legacy tasks merge same module/files; AC copied verbatim from knowledge", (t) => {
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
test("v2 busy repo does not crash or stop independent work", async (t) => {
  const { root, repo, makeRepo } = fixture(t); const other = makeRepo("other"); const held = repoLock(root, repo);
  const run = runAt(root, [packet(repo, "A"), packet(other, "B")]);
  try { await schedule(run, cfg, { session, execute: passing }); } finally { held(); }
  assert.equal(run.packages[0].state, "env_failed"); assert.equal(run.packages[1].state, "done");
});
test("v2 initial planner questions are gathered before dispatch; no independent writer starts", async (t) => {
  const { root, repo } = fixture(t); const plan = path.join(root, "plan.json"); save(plan, { packages: [packet(repo, "WP-1", { needs_planning: true })] }); const roles = [];
  const result = await cli(["run", "--plan", plan, "--workspace", root, "--tier", "t5"], { cfg, execute: passing, session: async (r, p, role) => {
    roles.push(role); return { packages: [{ id: "WP-1", depends_on: [] }], questions: [{ text: "confirm policy", blocks: ["WP-1"] }], decisions: [] };
  } });
  assert.deepEqual(roles, ["planner"]); assert.equal(result.packages[0].state, "waiting_human");
});
test("v2 Planner splits approved scope without changing commands or inventing AC/owns", (t) => {
  const { repo } = fixture(t); const parent = packet(repo, "A", { tasks: ["T1", "T2"] });
  const slices = ["T1", "T2"].map((id, i) => ({ id: `A-${i}`, title: id, goal: id, tasks: [id], owns: ["code.mjs"], acceptance_ids: ["AC-1"], depends_on: i ? ["A-0"] : [] }));
  const result = { packages: [{ id: "A", depends_on: [], subpackages: slices }], questions: [], decisions: [] };
  const split = applyPlanning([parent], result); assert.equal(split.length, 2); assert.deepEqual(split[1].depends_on, ["A-0"]); assert.deepEqual(split[0].commands, parent.commands);
  result.packages[0].subpackages[0].owns = ["**"];
  assert.throws(() => applyPlanning([parent], result), /expanded owns/);
});
test("v2 maps exact test names rather than arbitrary output substrings", () => {
  const names = testNames("# Subtest: first test\n✔ second test (4ms)\n  Passed Namespace.Third [1 ms]\n# pass 3\n");
  assert.ok(names.has("first test")); assert.ok(names.has("second test")); assert.ok(names.has("Namespace.Third")); assert.ok(!names.has("")); assert.ok(!names.has("pass"));
});
test("v2 persists Codex thread id before the provider completes, allowing crash recovery", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo); const run = runAt(root, [p]);
  const agents = { agents: { codex: { command: "fake", promptVia: "stdin", readArgs: ["exec", "-"], writeArgs: ["exec", "-"], answerFrom: "answerFile" } }, tiers: { t5: { codex: {} } } };
  await assert.rejects(callSession(run, p, "worker", agents, { runner: async (def, args, via, prompt, cwd, timeout, file, opts) => {
    opts.onStdout('{"type":"thread.started","thread_id":"persisted-thread"}\n'); throw new Error("core disappeared");
  } }), /core disappeared/);
  assert.equal(loadRun(root, run.dir).packages[0].session.id, "persisted-thread");
});
test("v2 agy schema and conversation resume are inserted before --print", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo, "A", { session: { agent: "agy", id: "existing-conversation" } }); const run = runAt(root, [p]); run.agent = "agy";
  const agents = { agents: { agy: { command: "fake", promptVia: "arg", readArgs: ["--print"], writeArgs: ["--print"], answerFrom: "stdout" } }, tiers: { t5: { agy: {} } } };
  await callSession(run, p, "worker", agents, { runner: async (def, args) => {
    const at = args.indexOf("--print"); assert.ok(args.indexOf("--json-schema") < at); assert.ok(args.indexOf("--conversation") < at); assert.equal(args[args.indexOf("--conversation") + 1], "existing-conversation");
    return { ok: true, answer: JSON.stringify(good), durationMs: 1, usage: { sessionId: "existing-conversation" } };
  } });
});
