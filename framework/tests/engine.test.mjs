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
import { callSession, resolveWorkerTier, resolveVerifierTier } from "../src/session.mjs";
import { evidence, counts, testNames } from "../src/gate.mjs";
import { persist, loadRun, save } from "../src/store.mjs";
import { verification } from "../src/triage.mjs";
import { integrate } from "../src/integrate.mjs";
import { approvalBasis, documentBasis } from "../src/packet.mjs";
import { applyPlanning } from "../src/planner.mjs";
import { looksLikeCommandEnvironmentFailure } from "../src/failure-class.mjs";

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
    const input = JSON.parse(prompt.split("## Input Data (JSON)\n")[1].split("\n\n## Output Requirement")[0]);
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
  for (const agent of ["codex", "claude", "agy", "custom-fixture"]) {
    const p = packet(repo), run = runAt(root, [p]); run.agent = agent;
    const agents = { agents: { [agent]: { promptVia: "stdin", writeArgs: ["exec", "-"], answerFrom: "stdout" } }, tiers: { t5: { [agent]: {} } } };
    const native = ["codex", "claude", "agy"].includes(agent);
    const runner = async (def, args, via, prompt) => {
      assert.equal(prompt.includes(JSON.stringify(schema)), !native);
      if (native) {
        const flag = agent === "codex" ? "--output-schema" : "--json-schema";
        const supplied = args[args.indexOf(flag) + 1];
        assert.ok(args.includes(flag));
        const { $schema, ...withoutMeta } = schema;
        assert.deepEqual(agent === "claude" ? JSON.parse(supplied) : JSON.parse(readFileSync(supplied, "utf8")), agent === "claude" ? withoutMeta : schema);
      }
      return { ok: true, answer: JSON.stringify(good), durationMs: 1 };
    };
    assert.deepEqual(await callSession(run, p, "worker", agents, { runner }), good);
    await assert.rejects(callSession(run, p, "worker", agents, { runner: async () => ({ ok: true, answer: '{"state":"DONE"}', durationMs: 1 }) }), /required/);
  }
});

test("engine reads the final structured answer from Claude and agy stream-json, not the first stream event", async (t) => {
  const { root, repo } = fixture(t);
  const streams = {
    claude: [{ type: "system", subtype: "init", session_id: "s1", tools: ["Read"] }, { type: "assistant", message: { content: [{ type: "text", text: "{\"note\":1}" }] } },
      { type: "result", subtype: "success", is_error: false, result: JSON.stringify(good), structured_output: good, session_id: "s1" }],
    agy: [{ type: "init", conversation_id: "c1" }, { status: "SUCCESS", response: JSON.stringify(good), conversation_id: "c1" }],
  };
  for (const [agent, events] of Object.entries(streams)) {
    const p = packet(repo), run = runAt(root, [p]); run.agent = agent;
    const agents = { agents: { [agent]: { promptVia: "stdin", writeArgs: ["exec", "-"], answerFrom: "stdout" } }, tiers: { t5: { [agent]: {} } } };
    const stdout = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
    const runner = async (def, args, via, prompt, cwd, timeout, file, opts) => { opts.onStdout(stdout); return { ok: true, stdout, answer: stdout.trim(), durationMs: 1 }; };
    assert.deepEqual(await callSession(run, p, "worker", agents, { runner }), good, agent);
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

test("engine docs hybrid verification skips LLM verifier for routine docs but requires it for critical docs", (t) => {
  const { repo } = fixture(t);
  const routineDocs = { ...packet(repo, "DOC-1"), kind: "docs", goal: "สรุปข้อมูลการประชุม", risk: "low" };
  assert.deepEqual(verification(routineDocs, [routineDocs]), []);

  const criticalDocs = { ...packet(repo, "DOC-2"), kind: "docs", goal: "ออกแบบ ADR Architecture และ DB Schema", risk: "high" };
  assert.deepEqual(verification(criticalDocs, [criticalDocs]), ["acceptance"]);

  const contractDocs = { ...packet(repo, "DOC-3"), kind: "docs", goal: "เขียนสัญญา API", risk: "low", contracts: [{ ref: "api.md" }] };
  assert.deepEqual(verification(contractDocs, [contractDocs]), ["acceptance"]);
});

test("engine resolveWorkerTier respects code vs docs tier rules", () => {
  const run = { tier: "t3", plannerTier: "t3" };
  
  // Docs routine defaults to docs t2
  assert.equal(resolveWorkerTier(run, { kind: "docs", goal: "summary", risk: "low" }), "t2");

  // Docs critical defaults to docs t1
  assert.equal(resolveWorkerTier(run, { kind: "docs", goal: "ADR for auth schema", risk: "low" }), "t1");

  // Docs with explicit worker_tier
  assert.equal(resolveWorkerTier(run, { kind: "docs", worker_tier: "t3", risk: "low" }), "t3");

  // Code high risk cannot step-down below t2
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "high", worker_tier: "t4" }), "t2");

  // Code low risk without contracts cannot step-down
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "low", worker_tier: "t4" }), "t3");

  // Code low risk with contracts allows step-down
  assert.equal(resolveWorkerTier(run, { kind: "code", risk: "low", worker_tier: "t4", contracts: [{ ref: "api.md" }] }), "t4");
});

test("engine resolveVerifierTier: packet raises freely, lowers only outside risk high, CLI flags win", () => {
  const run = { tier: "t3", verifierTier: "t2" };
  assert.equal(resolveVerifierTier(run, { risk: "high" }), "t2");
  assert.equal(resolveVerifierTier(run, { risk: "high", verifier_tier: "t1" }), "t1");
  assert.equal(resolveVerifierTier(run, { risk: "high", verifierTier: "T1" }), "t1");
  assert.equal(resolveVerifierTier(run, { risk: "high", verifier_tier: "t3" }), "t2");
  assert.equal(resolveVerifierTier(run, { risk: "low", verifier_tier: "t3" }), "t3");
  assert.equal(resolveVerifierTier(run, { risk: "high", verifier_tier: "bogus" }), "t2");
  assert.equal(resolveVerifierTier({ ...run, explicitTier: true }, { verifier_tier: "t1" }), "t3");
  assert.equal(resolveVerifierTier({ ...run, verifierTier: "t3", explicitVerifierTier: true, explicitTier: true }, { verifier_tier: "t1" }), "t3");
});

test("engine dry-run shows per-package verifier route from packet verifier_tier", async (t) => {
  const { root, repo } = fixture(t); const file = path.join(root, "plan.json");
  save(file, { packages: [packet(repo, "A", { risk: "high", verifier_tier: "t1" }), packet(repo, "B", { risk: "high" })] });
  const local = { agents: { codex: true, claude: false, agy: false } };
  const result = await cli(["run", "--plan", file, "--workspace", root, "--dry-run"], { localConfig: local });
  const byId = Object.fromEntries(result.packages.map((p) => [p.id, p.verifier_route]));
  assert.equal(byId.A.role, "verifier"); assert.equal(byId.A.tier, "t1");
  assert.equal(byId.B.tier, "t2");
  const forced = await cli(["run", "--plan", file, "--workspace", root, "--verifier-tier", "t3", "--dry-run"], { localConfig: local });
  assert.equal(forced.resolved_routes.verifier.tier, "t3");
  assert.ok(forced.packages.every((p) => p.verifier_route.tier === "t3"));
  assert.ok(!existsSync(path.join(root, ".baan", "runs")));
});

const commitFile = (repo, name, text) => { writeFileSync(path.join(repo, name), text); git(repo, "add", name); git(repo, "commit", "-m", `add ${name}`); };

test("engine judges scope from the attempt start: a human fix made while the package waited is not the Worker's", async (t) => {
  const { root, repo } = fixture(t); commitFile(repo, "other.txt", "v1\n");
  const run = runAt(root, [packet(repo)]);
  await schedule(run, cfg, { session, execute: async (cmd) => ({ command: cmd, code: null, ok: false, output: "spawn dotnet ENOENT", timedOut: false }) });
  assert.equal(run.packages[0].state, "env_failed");
  writeFileSync(path.join(repo, "other.txt"), "fixed by a human\n");
  await schedule(run, cfg, { session, execute: passing });
  assert.equal(run.packages[0].state, "done", run.packages[0].questions?.join(" "));
  assert.deepEqual(run.packages[0].gate.outside, []);
});

test("engine a sibling package finishing in the same repo while another waits does not count against the waiting one", async (t) => {
  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo, "B", { owns: ["b.txt"], budget: { expected_minutes: 50 } }), packet(repo, "A")]);
  let asked = false;
  const work = async (r, p, role) => {
    if (role === "planner") return { packages: [], questions: [{ text: "which payload?", blocks: ["B"] }], decisions: [] };
    if (role === "worker" && p.id === "B" && !asked) { asked = true; return { ...structuredClone(good), state: "NEEDS_DECISION", acceptance: [{ id: "AC-1", proof: [] }], questions: ["which payload?"] }; }
    if (role === "worker" && p.id === "B") { writeFileSync(path.join(repo, "b.txt"), "b\n"); return structuredClone(good); }
    return session(r, p, role);
  };
  await schedule(run, cfg, { session: work, execute: passing });
  assert.deepEqual(run.packages.map((p) => p.state), ["waiting_human", "done"]);
  decide(run, "B", { by: "user", decision: "use payload v2", source: "chat" });
  await schedule(run, cfg, { session: work, execute: passing });
  const b = run.packages.find((p) => p.id === "B");
  assert.equal(b.state, "done", b.questions?.join(" "));
  assert.ok(b.gate.changed.includes("code.mjs"), "the recovery diff still spans the whole package history");
  assert.deepEqual(b.gate.outside, []);
});

test("engine a docs package that edits a markdown file it also reads first finishes instead of going stale", async (t) => {
  const { root, repo } = fixture(t); commitFile(repo, "doc.md", "# v1\n");
  const run = runAt(root, [packet(repo, "D", { kind: "docs", owns: ["doc.md"], read_first: [{ path: "doc.md" }] })]);
  const writer = async (r, p, role) => role === "worker" ? (writeFileSync(path.join(repo, "doc.md"), "# v2\n"), structuredClone(good)) : session(r, p, role);
  await schedule(run, cfg, { session: writer, execute: passing });
  assert.equal(run.packages[0].state, "done", run.packages[0].questions?.join(" "));
  assert.ok(!Object.keys(run.packages[0].basis.docs).some((f) => f.endsWith("doc.md")));
});

test("engine environment failure means toolchain/OS errors, not domain words in test or compiler output", async (t) => {
  assert.equal(looksLikeCommandEnvironmentFailure({ code: 1, output: "Access is denied." }), true);
  assert.equal(looksLikeCommandEnvironmentFailure({ code: 1, output: "Requested registry access is not allowed." }), true);
  assert.equal(looksLikeCommandEnvironmentFailure({ code: null, output: "" }), true);
  assert.equal(looksLikeCommandEnvironmentFailure({ code: 1, output: "", timedOut: true }), true);
  assert.equal(looksLikeCommandEnvironmentFailure({ code: 1, output: "error CS0246: The type or namespace name 'PermissionService' could not be found", counts: {} }), false);
  assert.equal(looksLikeCommandEnvironmentFailure({ code: 1, output: "Access is denied in the permission test", counts: { passed: 3, failed: 1 } }), false);

  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo, "A", { budget: { max_rework: 0 } })]);
  let workerCalls = 0;
  const red = async (cmd) => cmd === "build" ? { command: cmd, code: 0, ok: true, output: "built", timedOut: false }
    : { command: cmd, code: 1, ok: false, output: "# Subtest: ครูที่ไม่มีสิทธิ์แก้คะแนนไม่ได้\nnot ok 1 - ครูที่ไม่มีสิทธิ์แก้คะแนนไม่ได้ (permission)\n# pass 0\n# fail 1\n", timedOut: false };
  await schedule(run, cfg, { session: async (r, p, role) => { if (role === "worker") workerCalls++; return session(r, p, role); }, execute: red });
  assert.equal(workerCalls, 1, "a red test before implementation must not stop the Worker");
  assert.equal(run.packages[0].failureClass, "IMPLEMENTATION_FAILURE");
});

test("engine an unreadable Verifier reply is an output-contract failure and resume re-verifies without a new Worker run", async (t) => {
  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo, "A", { risk: "high" })]);
  let workerCalls = 0, verifierCalls = 0;
  const flaky = async (r, p, role) => {
    if (role === "worker") workerCalls++;
    if (role === "verifier" && ++verifierCalls === 1) throw Object.assign(new Error("ไม่พบ JSON ในคำตอบของผู้ให้บริการ"), { failureClass: "OUTPUT_CONTRACT" });
    return session(r, p, role);
  };
  await schedule(run, cfg, { session: flaky, execute: passing });
  assert.equal(run.packages[0].state, "waiting_human");
  assert.equal(run.packages[0].failureClass, "OUTPUT_CONTRACT");
  decide(run, "A", { by: "user", decision: "retry verification", source: "chat" });
  await schedule(run, cfg, { session: flaky, execute: passing });
  assert.equal(run.packages[0].state, "done");
  assert.deepEqual([workerCalls, verifierCalls], [1, 2]);

  // If the tree moved since the gate, the old evidence is void and the Worker runs again.
  const again = runAt(root, [packet(repo, "B", { risk: "high", owns: ["b.txt"] })]);
  let againWorker = 0, againVerifier = 0;
  const flaky2 = async (r, p, role) => {
    if (role === "worker") { againWorker++; writeFileSync(path.join(repo, "b.txt"), `b${againWorker}\n`); return structuredClone(good); }
    if (++againVerifier === 1) throw Object.assign(new Error("garbled"), { failureClass: "OUTPUT_CONTRACT" });
    return session(r, p, role);
  };
  await schedule(again, cfg, { session: flaky2, execute: passing });
  writeFileSync(path.join(repo, "b.txt"), "edited by a human\n");
  decide(again, "B", { by: "user", decision: "retry", source: "chat", "allow-dirty": true });
  await schedule(again, cfg, { session: flaky2, execute: passing });
  assert.equal(againWorker, 2);
});

test("engine a provider reply without JSON is tagged OUTPUT_CONTRACT, not ENVIRONMENT_FAILURE", async (t) => {
  const { root, repo } = fixture(t); const p = packet(repo); const run = runAt(root, [p]);
  const agents = { agents: { codex: { promptVia: "stdin", writeArgs: ["exec", "-"], answerFrom: "answerFile" } }, tiers: { t5: { codex: {} } } };
  await assert.rejects(callSession(run, p, "worker", agents, { runner: async () => ({ ok: true, answer: "I finished, all good!", durationMs: 1 }) }),
    (e) => e.failureClass === "OUTPUT_CONTRACT");
});

test("engine diff for the Verifier includes files the Worker created, without touching the index", async (t) => {
  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo, "A", { owns: ["code.mjs", "tests/new.test.mjs"] })]);
  const writer = async (r, p, role) => {
    if (role !== "worker") return session(r, p, role);
    writeFileSync(path.join(repo, "code.mjs"), "export const value = 2;\n");
    mkdirSync(path.join(repo, "tests"), { recursive: true });
    writeFileSync(path.join(repo, "tests", "new.test.mjs"), "NEW TEST BODY\n");
    return structuredClone(good);
  };
  const index = git(repo, "write-tree");
  await schedule(run, cfg, { session: writer, execute: passing });
  const diff = readFileSync(run.packages[0].gate.diff_file, "utf8");
  assert.match(diff, /code\.mjs/);
  assert.match(diff, /tests\/new\.test\.mjs/);
  assert.match(diff, /\+NEW TEST BODY/);
  assert.equal(git(repo, "write-tree"), index);
  assert.match(git(repo, "status", "--porcelain"), /\?\? tests\//);
});

test("engine warns about dotnet test without per-test names, at dry-run and when mapping fails", async (t) => {
  const { commandWarnings } = await import("../src/gate.mjs");
  assert.equal(commandWarnings({ commands: { test_targeted: "dotnet test src/X.Tests", test_full: "dotnet test src/X.Tests" } }).length, 1);
  assert.deepEqual(commandWarnings({ commands: { test_targeted: 'dotnet test --logger "console;verbosity=normal"', test_full: "npm test" } }), []);

  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo, "A", { commands: { build: "dotnet build", test_targeted: "dotnet test", test_full: "dotnet test" } })]);
  const summaryOnly = async (cmd) => ({ command: cmd, code: 0, ok: true, output: "Passed!  - Failed:     0, Passed:    12, Skipped:     0, Total:    12\n", timedOut: false });
  await schedule(run, cfg, { session, execute: summaryOnly });
  const gateResult = run.packages[0].gate;
  assert.deepEqual(gateResult.unmapped, ["AC-1"]);
  assert.match(gateResult.unmapped_hint, /verbosity=normal/);
});

test("engine persisted state keeps snapshot maps and raw command output out of run.json copies", async (t) => {
  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo)]);
  const noisy = async (cmd) => ({ command: cmd, code: 0, ok: true, output: `# Subtest: value test\n${"LOG ".repeat(5000)}\n# pass 1\n# fail 0\n`, timedOut: false });
  await schedule(run, cfg, { session, execute: noisy });
  const saved = JSON.parse(readFileSync(path.join(run.dir, "run.json"), "utf8"));
  const p = saved.packages[0];
  assert.equal(p.state, "done");
  assert.deepEqual(Object.keys(saved.baselines[p.repo.path]), ["preexisting_changes"]);
  assert.ok(p.gate.results.every((r) => r.output === undefined && r.output_file), "output stays in output_file only");
  const packetCopy = JSON.parse(readFileSync(path.join(run.dir, "packets", "WP-1.json"), "utf8"));
  assert.equal(packetCopy.before.files, undefined); assert.equal(packetCopy.after.files, undefined);
  assert.ok(packetCopy.before.tracked, "the recovery point is still referenced");
  assert.ok(existsSync(p.gate.snapshots_file));
});

test("engine snapshot hash cache never hides a change: same size and restored mtime are still detected", async (t) => {
  const { fileHash } = await import("../src/snapshot.mjs");
  const { utimesSync, statSync } = await import("node:fs");
  const { repo } = fixture(t);
  const file = path.join(repo, "code.mjs");
  const old = new Date(Date.now() - 60_000);
  utimesSync(file, old, old);
  const first = snapshot(repo);
  assert.equal(snapshot(repo).id, first.id, "unchanged repo gives the same snapshot");

  const before = statSync(file);
  writeFileSync(file, "export const value = 9;\n");
  assert.equal(statSync(file).size, before.size, "the trick needs an edit of the same size");
  utimesSync(file, before.atime, before.mtime);
  assert.notEqual(snapshot(repo).id, first.id, "ctime still changes, so the cached hash is not reused");

  // Files touched within the racy window are always re-read.
  writeFileSync(file, "export const value = 8;\n");
  const h1 = fileHash(file);
  writeFileSync(file, "export const value = 7;\n");
  assert.notEqual(fileHash(file), h1);
});

test("engine lock left by a crashed run is recovered when its PID now belongs to another program", async (t) => {
  const { lock } = await import("../src/repolock.mjs");
  const { spawn } = await import("node:child_process");
  const { createHash } = await import("node:crypto");
  const { root } = fixture(t);
  const other = process.platform === "win32" ? spawn("ping", ["-n", "30", "127.0.0.1"], { stdio: "ignore", windowsHide: true }) : spawn("sleep", ["30"], { stdio: "ignore" });
  t.after(() => other.kill());
  await new Promise((resolve) => other.once("spawn", resolve));
  mkdirSync(path.join(root, ".baan", "locks"), { recursive: true });
  const file = path.join(root, ".baan", "locks", `${createHash("sha256").update("run:x").digest("hex")}.lock`);

  writeFileSync(file, JSON.stringify({ pid: other.pid, token: "crashed", key: "run:x" }));
  const release = lock(root, "run:x");
  release();

  writeFileSync(file, JSON.stringify({ pid: process.pid, exe: path.basename(process.execPath), token: "live", key: "run:x" }));
  assert.throws(() => lock(root, "run:x"), /LOCK_BUSY/, "a live BAAN owner still holds the lock");

  rmSync(file);
  const again = lock(root, "run:x");
  rmSync(file);
  assert.doesNotThrow(again, "releasing a lock file that is already gone must not throw from a finally block");
});

test("engine package duration adds up across resumes and a resumed attempt does not show the old failure", async (t) => {
  const { root, repo } = fixture(t);
  const run = runAt(root, [packet(repo)]);
  const slowEnvFail = async (cmd) => { await new Promise((r) => setTimeout(r, 60)); return { command: cmd, code: null, ok: false, output: "Access is denied", timedOut: false }; };
  await schedule(run, cfg, { session, execute: slowEnvFail });
  const first = run.packages[0].durationMs;
  assert.ok(first >= 60);
  let seen;
  const watch = async (r, p, role) => { if (role === "worker") seen = { state: p.state, failureClass: p.failureClass, probe: p.probe }; return session(r, p, role); };
  await schedule(run, cfg, { session: watch, execute: passing });
  assert.equal(run.packages[0].state, "done");
  assert.ok(run.packages[0].durationMs > first, "the second attempt's time is added, not dropped");
  assert.deepEqual(seen, { state: "running", failureClass: "", probe: undefined });
  const ledger = readFileSync(path.join(run.dir, "ledger.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((e) => e.type === "duration");
  assert.equal(ledger.at(-1).actualMs, run.packages[0].durationMs);
});

test("engine never picks an agent switched off in local.json as the independent Verifier", async (t) => {
  const { root, repo } = fixture(t);
  const p = packet(repo, "A", { risk: "high" });
  const run = runAt(root, [p]);
  p.workerAgent = "codex";
  const agents = {
    agents: {
      claude: { command: "claude", enabled: false, promptVia: "stdin", readArgs: ["-p"], answerFrom: "stdout" },
      codex: { command: "codex", promptVia: "stdin", readArgs: ["exec", "-"], answerFrom: "answerFile" },
      agy: { command: "agy", promptVia: "stdin", readArgs: ["--print"], answerFrom: "stdout" },
    },
    tiers: { t5: { claude: {}, codex: {}, agy: {} }, t2: { claude: {}, codex: {}, agy: {} } },
  };
  let verifierCmd = "";
  await callSession(run, p, "verifier", agents, {
    runner: async (def) => {
      verifierCmd = def.command;
      return { ok: true, answer: JSON.stringify({ verdict: "PASS", findings: [], failure_class: "", acceptance: p.acceptance.map((a) => ({ id: a.id, passed: true, proof: ["value test"] })) }), durationMs: 1 };
    },
  });
  assert.equal(verifierCmd, "agy");
});
