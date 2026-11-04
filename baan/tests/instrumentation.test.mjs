// WP0 instrumentation: ledger (append จากหลาย process), จัดประเภทเหตุล้ม, แกะ token usage, ตัวชี้วัดจาก report
// ใช้ข้อมูลจำลอง ไม่เรียก AI CLI จริง
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appendEvent, readEvents } from "../src/ledger.mjs";
import { classifyFailure } from "../src/failure-class.mjs";
import { buildArgs, parseUsageOutput } from "../src/runner.mjs";
import { parseRoleArgs } from "../src/role-session.mjs";
import { dirStartMs, loadReports, slotUsage, summarize } from "../src/metrics.mjs";

const LEDGER = fileURLToPath(new URL("../src/ledger.mjs", import.meta.url));
const tmp = (p) => mkdtempSync(path.join(tmpdir(), p));

test("ledger: หลาย process append พร้อมกัน — ทุกบรรทัดครบและ parse ได้", async () => {
  const dir = tmp("baan-ledger-");
  try {
    const PROCS = 6;
    const LINES = 150;
    const script = `import { appendEvent } from ${JSON.stringify(`file:///${LEDGER.replaceAll("\\", "/")}`)};
for (let i = 0; i < ${LINES}; i++) appendEvent(process.argv[1], { type: "x", i, pad: "ก".repeat(200) });`;
    await Promise.all(Array.from({ length: PROCS }, () => new Promise((res, rej) => {
      const c = spawn(process.execPath, ["--input-type=module", "-e", script, dir], { stdio: "ignore" });
      c.on("exit", (code) => (code === 0 ? res() : rej(new Error(`exit ${code}`))));
    })));
    const events = readEvents(dir);
    assert.equal(events.length, PROCS * LINES);
    assert.equal(new Set(events.map((e) => `${e.pid}:${e.i}`)).size, PROCS * LINES);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("ledger: บรรทัดเสียถูกข้าม · dir ว่าง/เขียนไม่ได้ไม่ throw", () => {
  const dir = tmp("baan-ledger-");
  try {
    assert.equal(appendEvent(dir, { type: "a" }, new Date("2026-11-04T05:00:00Z")), true);
    writeFileSync(path.join(dir, "2026-11-05.jsonl"), '{"type":"b"}\n{"type":"c"\n', "utf8");
    assert.deepEqual(readEvents(dir).map((e) => e.type), ["a", "b"]);
    assert.equal(appendEvent("", { type: "x" }), false);
    const file = path.join(dir, "not-a-dir");
    writeFileSync(file, "x");
    assert.equal(appendEvent(path.join(file, "sub"), { type: "x" }), false, "path ใต้ไฟล์ = เขียนไม่ได้ ต้องคืน false");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("classifyFailure: แยกสภาพแวดล้อมออกจากผลงาน · ดูเฉพาะ error + ท้ายคำตอบ", () => {
  assert.equal(classifyFailure({ state: "completed" }), null);
  assert.equal(classifyFailure({ state: "timeout" }), "TIMEOUT");
  assert.equal(classifyFailure({ state: "failed", error: "Error: failed to initialize in-process app-server client: Access is denied. (os error 5)" }), "ENVIRONMENT_FAILURE");
  assert.equal(classifyFailure({ state: "blocked", answer: "ปลายทางอยู่นอกขอบเขตเขียนของ sandbox BLOCKED" }), "ENVIRONMENT_FAILURE");
  assert.equal(classifyFailure({ state: "failed", error: 'dial tcp: lookup x.googleapis.com: getaddrinfow: The requested name is valid, but no data of the requested type was found.' }), "ENVIRONMENT_FAILURE");
  assert.equal(classifyFailure({ state: "fail", answer: "AC-001 ไม่ผ่าน\nFAIL" }), "VERDICT_FAIL");
  assert.equal(classifyFailure({ state: "needs_design_change", answer: "ต้องให้ arch ตัดสิน\nNEEDS_DESIGN_CHANGE" }), "NEEDS_DESIGN");
  const longHead = `ใบงานพูดถึง sandbox ตรงนี้\n${"x".repeat(5000)}\nBLOCKED`;
  assert.equal(classifyFailure({ state: "blocked", answer: longHead }), "BLOCKED_OTHER", "คำที่อยู่ต้นคำตอบยาวๆ ไม่ใช่อาการของงาน");
});

test("buildArgs usage: claude แทนที่ --output-format เดิม · codex ใส่ --json ก่อน '-' · ค่ายที่ไม่ประกาศ usage ไม่เปลี่ยน", () => {
  const claude = { readArgs: ["-p", "--output-format", "text", "--allowedTools", "Read"], writeArgs: [], usage: { args: ["--output-format", "json"], replaces: ["--output-format"], format: "claude-json" } };
  assert.deepEqual(buildArgs(claude, "", "", false, "a.txt", "", true), ["-p", "--allowedTools", "Read", "--output-format", "json"]);
  assert.deepEqual(buildArgs(claude, "", "", false, "a.txt", "", false), ["-p", "--output-format", "text", "--allowedTools", "Read"]);
  const codex = { readArgs: ["exec", "-s", "read-only", "-o", "<ANSWER>", "-"], writeArgs: [], usage: { args: ["--json"], insertBefore: "-", format: "codex-jsonl" } };
  assert.deepEqual(buildArgs(codex, "", "", false, "a.txt", "", true), ["exec", "-s", "read-only", "-o", "a.txt", "--json", "-"]);
  const agy = { readArgs: ["--agent", "baan-readonly", "--print"], writeArgs: [], usage: { args: ["--output-format", "json"], insertBefore: "--print", format: "agy-json" } };
  assert.deepEqual(buildArgs(agy, "", "", false, "a.txt", "", true), ["--agent", "baan-readonly", "--output-format", "json", "--print"], "--print ต้องอยู่ท้ายเพราะกลืน arg ถัดไปเป็น prompt");
  const none = { readArgs: ["run"], writeArgs: [] };
  assert.deepEqual(buildArgs(none, "", "", false, "a.txt", "", true), ["run"]);
});

test("agents.json: ทุกค่ายที่ประกาศ usage มี format ที่ parser รู้จัก และ insertBefore ตรงกับ arg ท้ายของทั้งสองโหมด", async () => {
  const cfg = JSON.parse(readFileSync(fileURLToPath(new URL("../agents.json", import.meta.url)), "utf8"));
  for (const [name, def] of Object.entries(cfg.agents)) {
    if (!def.usage) continue;
    assert.ok(["claude-json", "codex-jsonl", "agy-json"].includes(def.usage.format), `${name}: format ไม่รู้จัก`);
    for (const args of [def.readArgs, def.writeArgs]) {
      const built = buildArgs(def, "m", "e", args === def.writeArgs, "a.txt", "", true);
      if (def.usage.insertBefore) assert.equal(built.at(-1), def.usage.insertBefore, `${name}: ${built.join(" ")}`);
      for (const a of def.usage.args) assert.ok(built.includes(a), `${name}: ไม่มี ${a}`);
    }
  }
});

test("parseUsageOutput: รูปแบบจริงของ agy json", () => {
  const a = parseUsageOutput("agy-json", '{"conversation_id":"c1","status":"SUCCESS","response":"ok\\n","num_turns":1,"usage":{"input_tokens":6949,"output_tokens":1,"thinking_tokens":2,"cache_read_tokens":5,"total_tokens":6950}}');
  assert.equal(a.answer, "ok");
  assert.equal(a.isError, false);
  assert.deepEqual(a.usage, { inputTokens: 6949, cacheReadTokens: 5, cacheWriteTokens: 0, outputTokens: 3, costUsd: null, turns: 1, sessionId: "c1" });
  assert.equal(parseUsageOutput("agy-json", '{"status":"ERROR","response":"credits balance too low"}').isError, true);
});

test("parseUsageOutput: รูปแบบจริงของ claude json และ codex jsonl", () => {
  const c = parseUsageOutput("claude-json", JSON.stringify({ type: "result", is_error: false, result: " ok ", num_turns: 1, session_id: "s1", total_cost_usd: 0.0036, usage: { input_tokens: 2, cache_read_input_tokens: 29809, cache_creation_input_tokens: 16874, output_tokens: 22 } }));
  assert.equal(c.answer, "ok");
  assert.deepEqual(c.usage, { inputTokens: 2, cacheReadTokens: 29809, cacheWriteTokens: 16874, outputTokens: 22, costUsd: 0.0036, turns: 1, sessionId: "s1" });
  assert.equal(parseUsageOutput("claude-json", "not json"), null, "parse ไม่ได้ = ให้ runner ใช้ stdout ดิบ");
  const lines = [
    '{"type":"thread.started","thread_id":"t1"}',
    '{"type":"turn.started"}',
    '{"type":"item.completed","item":{"id":"item_0","type":"agent_message","text":"ok"}}',
    '{"type":"turn.completed","usage":{"input_tokens":19345,"cached_input_tokens":11776,"cache_write_input_tokens":0,"output_tokens":5,"reasoning_output_tokens":3}}',
    '{"type":"error","message":"You\'ve hit your usage limit."}',
  ].join("\n");
  const x = parseUsageOutput("codex-jsonl", lines);
  assert.equal(x.answer, null, "codex อ่านคำตอบจากไฟล์ -o เหมือนเดิม");
  assert.deepEqual(x.usage, { inputTokens: 19345, cacheReadTokens: 11776, cacheWriteTokens: 0, outputTokens: 8, costUsd: null, turns: 1, sessionId: "t1" });
  assert.deepEqual(x.errors, ["You've hit your usage limit."]);
  assert.equal(parseUsageOutput("codex-jsonl", "plain text"), null);
});

test("baan-role: --task-id รับหลายตัว (ซ้ำ flag หรือคั่น ,) · ว่าง = error · --usage", () => {
  assert.deepEqual(parseRoleArgs(["--task-id", "BE-031, BE-032", "--task-id", "FE-021"]).taskIds, ["BE-031", "BE-032", "FE-021"]);
  assert.deepEqual(parseRoleArgs([]).taskIds, []);
  assert.throws(() => parseRoleArgs(["--task-id", " , "]), /--task-id/);
  assert.equal(parseRoleArgs(["--usage"]).usage, true);
  assert.equal(parseRoleArgs([]).usage, false);
});

test("metrics: slotUsage นับช่วงทับกัน ขนานเฉลี่ย และช่วงว่าง", () => {
  const m = 60_000;
  const u = slotUsage([
    { startMs: 0, durationMs: 10 * m },
    { startMs: 5 * m, durationMs: 10 * m },
    { startMs: 30 * m, durationMs: 10 * m },
  ]);
  assert.equal(u.spanMs, 40 * m);
  assert.equal(u.busyMs, 25 * m);
  assert.equal(u.agentMs, 30 * m);
  assert.equal(u.maxConcurrency, 2);
  assert.equal(u.idleMs, 15 * m);
  assert.equal(u.avgParallel, 30 / 25);
});

test("metrics: อ่าน report รุ่นเก่า (เวลาจากชื่อโฟลเดอร์) และรุ่นใหม่ (startedAt/taskIds/failureClass)", () => {
  const dir = tmp("baan-reports-");
  try {
    const put = (name, report) => { mkdirSync(path.join(dir, name)); writeFileSync(path.join(dir, name, "report.json"), JSON.stringify(report)); };
    put("2026-11-03-01-00-00-sys-tier-t2-1agents-AAAAAA", { role: "sys", tier: "t2", mode: "write", task: "ใบงาน rework 1/2 ของ BE-003", results: [{ agent: "codex", state: "blocked", durationMs: 120_000, answer: "รัน testhost ใน sandbox ไม่ได้ BLOCKED", fallback: [] }] });
    put("2026-11-03-01-01-00-check-tier-t2-1agents-BBBBBB", { role: "check", tier: "t2", mode: "write", task: "ตรวจ BE-004", startedAt: "2026-11-03T01:01:30.000Z", taskIds: ["BE-004"], results: [{ agent: "agy", state: "completed", durationMs: 60_000, fallback: ["codex→agy"], failureClass: null, usage: { inputTokens: 10, cacheReadTokens: 0, outputTokens: 5, costUsd: 0.01 } }] });
    mkdirSync(path.join(dir, "empty-run"));
    assert.equal(dirStartMs("2026-11-03-01-00-00-sys"), Date.UTC(2026, 10, 3, 1, 0, 0));
    const rows = loadReports(dir);
    assert.equal(rows.length, 2);
    const byRole = Object.fromEntries(rows.map((r) => [r.role, r]));
    assert.equal(byRole.sys.failureClass, "ENVIRONMENT_FAILURE", "รุ่นเก่าไม่มี failureClass → จัดจากคำตอบ");
    assert.equal(byRole.check.startMs, Date.parse("2026-11-03T01:01:30.000Z"), "รุ่นใหม่ใช้ startedAt");
    const s = summarize(rows, { tzOffsetMin: -420 });
    assert.equal(s.total, 2);
    assert.equal(s.completed, 1);
    assert.equal(s.environment.calls, 1);
    assert.equal(s.rework.calls, 1);
    assert.equal(s.fallbacks, 1);
    assert.equal(s.withTaskIds, 1);
    assert.equal(s.usage.calls, 1);
    assert.deepEqual(Object.keys(s.days), ["2026-11-03"], "วันตามเวลาไทย (UTC+7)");
    assert.equal(s.days["2026-11-03"].maxConcurrency, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("metrics: script รันกับโฟลเดอร์ว่างแล้วจบ exit 1 พร้อมข้อความ", async () => {
  const dir = tmp("baan-reports-");
  const SCRIPT = fileURLToPath(new URL("../scripts/metrics.mjs", import.meta.url));
  try {
    const code = await new Promise((res) => spawn(process.execPath, [SCRIPT, dir], { stdio: "ignore" }).on("exit", res));
    assert.equal(code, 1);
    assert.ok(readFileSync(SCRIPT, "utf8").includes("loadReports"));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("runCli: มี startedAt เสมอ · โหมด usage แกะคำตอบและ token จาก stdout JSON", async () => {
  const { runCli } = await import("../src/runner.mjs");
  const def = { command: process.execPath, useShell: false, promptVia: "stdin", answerFrom: "stdout", usage: { format: "claude-json" } };
  const out = JSON.stringify({ result: "สวัสดี", is_error: false, num_turns: 1, usage: { input_tokens: 1, output_tokens: 2 } });
  const args = ["-e", `process.stdin.resume();process.stdin.on("end",()=>process.stdout.write(${JSON.stringify(out)}))`];
  const r = await runCli(def, args, "stdin", "prompt", tmpdir(), 30, undefined, { usage: true });
  assert.equal(r.ok, true);
  assert.equal(r.answer, "สวัสดี");
  assert.equal(r.usage.outputTokens, 2);
  assert.ok(!Number.isNaN(Date.parse(r.startedAt)));
  const plain = await runCli(def, args, "stdin", "prompt", tmpdir(), 30);
  assert.equal(plain.usage, null, "ไม่เปิด usage = ไม่แกะ JSON");
  assert.equal(plain.answer, out);
});

test("execute: summary/checkpoint มี startedAt + failureClass และเขียน task_result ลง ledger", async () => {
  const { execute } = await import("../src/scheduler.mjs");
  const runDir = tmp("baan-run-");
  const ledgerDir = tmp("baan-ledger-");
  try {
    const plan = { tasks: [{ id: "A", role: "sys", tier: "t2", agent: "codex", title: "a", task: "ทำ A", dependsOn: [] }, { id: "B", role: "sys", tier: "t2", agent: "codex", title: "b", task: "ทำ B", dependsOn: [] }] };
    const runner = async (_c, _o, _d, t) => (t.id === "A"
      ? { ok: true, exitCode: 0, durationMs: 5, timedOut: false, answer: "เสร็จ\nDONE", error: "", stdout: "", stderr: "" }
      : { ok: true, exitCode: 0, durationMs: 5, timedOut: false, answer: "sandbox เขียนไฟล์ไม่ได้\nBLOCKED", error: "", stdout: "", stderr: "" });
    const opts = { cwd: tmpdir(), maxParallel: 2, dryRun: false, write: false, timeoutSec: 60, projectCtx: "", ledgerDir };
    const res = await execute(plan, opts, runDir, { agents: {}, tiers: {} }, new Map(), runner);
    const byId = Object.fromEntries(res.summary.tasks.map((t) => [t.id, t]));
    assert.ok(byId.A.startedAt && byId.B.startedAt);
    assert.equal(byId.A.failureClass, null);
    assert.equal(byId.B.failureClass, "ENVIRONMENT_FAILURE");
    const ev = readEvents(ledgerDir).filter((e) => e.type === "task_result");
    assert.deepEqual(ev.map((e) => e.taskIds[0]).sort(), ["A", "B"]);
  } finally {
    rmSync(runDir, { recursive: true, force: true });
    rmSync(ledgerDir, { recursive: true, force: true });
  }
});
