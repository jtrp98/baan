// Regression ของ scheduler: dependency ผ่านเฉพาะงานสำเร็จ, งานอิสระทำต่อ, dry-run ห้ามเรียก provider, resume ข้ามเฉพาะ completed
// (AUDIT ข้อ 1, 2, 4) — ใช้ runTask จำลองแทนการเรียก AI CLI จริง ไม่ใช้โควตา
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execute } from "../src/scheduler.mjs";
import { preloadDone, writeCheckpoint } from "../src/run-store.mjs";

const cfg = { agents: {}, tiers: {} };
const T = (id, dependsOn = [], extra = {}) => ({ id, role: "check", agent: "codex", tier: "t5", title: `งาน ${id}`, task: `ทำ ${id}`, dependsOn, ...extra });
const mkPlan = (tasks) => ({ summary: "แผนทดสอบ", tasks, humanGates: [] });
const okRun = (answer = "ผลลัพธ์ของงาน\nDONE") => ({ ok: true, exitCode: 0, durationMs: 5, timedOut: false, answer, error: "", stdout: "", stderr: "" });
const failRun = () => ({ ok: false, exitCode: 1, durationMs: 5, timedOut: false, answer: "", error: "", stdout: "", stderr: "boom" });

function mkOpts(over = {}) {
  return { cwd: tmpdir(), maxParallel: 3, dryRun: false, write: false, timeoutSec: 60, projectCtx: "", ...over };
}

test("งาน fail (exit 1) → งานลูกถูก block, งานอิสระยังทำต่อ, run ไม่ ok (AUDIT ข้อ 1)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const calls = [];
    const runner = async (_cfg, _opts, _runDir, t) => { calls.push(t.id); return t.id === "A" ? failRun() : okRun(); };
    const res = await execute(mkPlan([T("A"), T("B", ["A"]), T("C")]), mkOpts(), runDir, cfg, new Map(), runner);
    assert.deepEqual([...calls].sort(), ["A", "C"], "B ที่ขึ้นกับ A ต้องไม่ถูกเรียก");
    assert.equal(res.ok, false);
    const byId = new Map(res.summary.tasks.map((t) => [t.id, t]));
    assert.equal(byId.get("A").state, "failed");
    assert.equal(byId.get("B").state, "blocked");
    assert.deepEqual(byId.get("B").blockedBy, ["A"]);
    assert.equal(byId.get("C").state, "completed");
    const cp = JSON.parse(readFileSync(path.join(runDir, "B.status.json"), "utf8"));
    assert.equal(cp.state, "blocked");
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("role ตอบ NEEDS_HUMAN (exit 0) → งานนั้นไม่สำเร็จ งานลูกถูก block และ exit ไม่ใช่ 0 (AUDIT ข้อ 1)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const runner = async (_cfg, _opts, _runDir, t) =>
      t.id === "A" ? okRun("ต้องถามผู้ใช้เรื่องขอบเขตก่อน\n\n**NEEDS_HUMAN**") : okRun();
    const res = await execute(mkPlan([T("A"), T("B", ["A"])]), mkOpts(), runDir, cfg, new Map(), runner);
    assert.equal(res.ok, false);
    const byId = new Map(res.summary.tasks.map((t) => [t.id, t]));
    assert.equal(byId.get("A").state, "needs_human");
    assert.equal(byId.get("A").marker, "NEEDS_HUMAN");
    assert.equal(byId.get("B").state, "blocked");
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("ทุกงานสำเร็จ → ok=true, ลูกโซ่ A→B รันเป็นคลื่นตามลำดับ, context ส่งต่อพร้อมสถานะและ path ฉบับเต็ม", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const seen = [];
    const runner = async (_cfg, _opts, _runDir, t, ctxBlocks) => { seen.push({ id: t.id, ctx: ctxBlocks ?? [] }); return okRun(`ผลของ ${t.id}\nDONE`); };
    const res = await execute(mkPlan([T("A"), T("B", ["A"])]), mkOpts(), runDir, cfg, new Map(), runner);
    assert.equal(res.ok, true);
    assert.deepEqual(seen.map((s) => s.id), ["A", "B"], "B ต้องรันหลัง A เสร็จเท่านั้น");
    const bCtx = seen[1].ctx.join("\n");
    assert.match(bCtx, /สถานะ: completed/);
    assert.match(bCtx, /ผลของ A/);
    assert.match(bCtx, /A\.answer\.txt/);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("context ที่ถูกตัดต้องแจ้งว่าถูกตัดและชี้ path ฉบับเต็ม (AUDIT ข้อ 8)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    let bCtx = "";
    const runner = async (_cfg, _opts, _runDir, t, ctxBlocks) => {
      if (t.id === "B") bCtx = (ctxBlocks ?? []).join("\n");
      return okRun(t.id === "A" ? `${"x".repeat(7000)}\nDONE` : "ผล\nDONE");
    };
    await execute(mkPlan([T("A"), T("B", ["A"])]), mkOpts(), runDir, cfg, new Map(), runner);
    assert.match(bCtx, /ถูกตัดจากฉบับเต็ม/);
    assert.match(bCtx, /A\.answer\.txt/);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("--dry-run ต้องไม่เรียก provider เลยและไม่เขียน checkpoint (AUDIT ข้อ 4)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    let invoked = 0;
    const runner = async () => { invoked++; return okRun(); };
    const res = await execute(mkPlan([T("A"), T("B", ["A"])]), mkOpts({ dryRun: true }), runDir, cfg, new Map(), runner);
    assert.equal(invoked, 0, "dry-run ต้องไม่มีการเรียก provider");
    assert.equal(res.dryRun, true);
    assert.equal(existsSync(path.join(runDir, "A.status.json")), false);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("preloadDone ข้ามเฉพาะ completed ที่มีคำตอบจริง — fail/timeout รันใหม่ (AUDIT ข้อ 2)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    writeCheckpoint(runDir, { id: "A", state: "completed", ok: true, exitCode: 0, marker: "DONE", attempt: 1, durationMs: 9 });
    writeFileSync(path.join(runDir, "A.answer.txt"), "ผลเก่าของ A", "utf8");
    writeCheckpoint(runDir, { id: "B", state: "timeout", ok: false, marker: null, attempt: 2 });
    writeFileSync(path.join(runDir, "B.answer.txt"), "Partial output: NEEDS_HUMAN", "utf8"); // output บางส่วน ≠ สำเร็จ
    writeCheckpoint(runDir, { id: "D", state: "completed", ok: true, marker: "DONE", attempt: 1 }); // completed แต่ไฟล์คำตอบหาย

    const plan = mkPlan([T("A"), T("B"), T("C"), T("D")]);
    const done = preloadDone(runDir, plan, () => {});
    assert.deepEqual([...done.keys()], ["A"], "มีแต่ A ที่เชื่อถือได้");
    assert.equal(done.get("A").state, "completed");
    assert.equal(done.get("A").answer, "ผลเก่าของ A");

    const calls = [];
    const runner = async (_cfg, _opts, _runDir, t) => { calls.push(t.id); return okRun(); };
    await execute(plan, mkOpts(), runDir, cfg, done, runner);
    assert.deepEqual([...calls].sort(), ["B", "C", "D"], "งาน timeout/ไม่มี checkpoint/คำตอบหาย ต้องรันใหม่");
    const bCp = JSON.parse(readFileSync(path.join(runDir, "B.status.json"), "utf8"));
    assert.equal(bCp.state, "completed");
    assert.equal(bCp.attempt, 3, "attempt สะสมจาก checkpoint เดิม (2) + 1");
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("run เก่าก่อน v0.3 (มีแต่ answer.txt ไม่มี checkpoint) ต้องรันใหม่ทั้งหมด ไม่ถือว่าสำเร็จ (AUDIT ข้อ 2)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    writeFileSync(path.join(runDir, "A.answer.txt"), "คำตอบเก่าที่ไม่รู้สถานะ", "utf8");
    const plan = mkPlan([T("A"), T("B", ["A"])]);
    const done = preloadDone(runDir, plan, () => {});
    assert.equal(done.size, 0, "ไม่มี checkpoint = ไม่เชื่อไฟล์คำตอบ");
    const calls = [];
    const runner = async (_cfg, _opts, _runDir, t) => { calls.push(t.id); return okRun(); };
    const res = await execute(plan, mkOpts(), runDir, cfg, done, runner);
    assert.deepEqual(calls, ["A", "B"]);
    assert.equal(res.ok, true);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("checkpoint เขียนทันทีทีละงานพร้อม artifact references", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const runner = async (_cfg, _opts, _runDir, t) => t.id === "A" ? failRun() : okRun();
    await execute(mkPlan([T("A"), T("B", ["A"]), T("C")]), mkOpts({ maxParallel: 1 }), runDir, cfg, new Map(), runner);
    const cp = JSON.parse(readFileSync(path.join(runDir, "A.status.json"), "utf8"));
    assert.equal(cp.state, "failed");
    assert.equal(cp.exitCode, 1);
    assert.equal(cp.attempt, 1);
    assert.ok(cp.finishedAt);
    assert.equal(cp.answerFile, path.join(runDir, "A.answer.txt"));
    assert.equal(cp.stderrFile, path.join(runDir, "A.stderr.txt"));
    assert.ok(existsSync(cp.stderrFile));
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});
