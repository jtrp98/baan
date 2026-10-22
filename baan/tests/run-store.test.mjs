// Regression: run manifest (run.json) คืน target/cwd/write/projectCtx ตอน --resume (AUDIT ข้อ 3)
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { writeManifest, readManifest, applyManifestToOpts } from "../src/run-store.mjs";

function mkOpts(over = {}) {
  return {
    goal: "เป้าหมายทดสอบ", target: "", cwd: "", write: false, projectCtx: "",
    agent: "codex", plannerTier: "t2", maxParallel: 3, timeoutSec: 600,
    explicit: new Set(),
    ...over,
  };
}

test("เขียน/อ่าน manifest ครบถ้วน (round-trip)", () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const opts = mkOpts({ target: "sb-api-gateway", cwd: "C:/repo/gateway", write: true, projectCtx: "บริบทโปรเจกต์" });
    writeManifest(runDir, opts);
    const m = readManifest(runDir);
    assert.equal(m.version, 1);
    assert.equal(m.target, "sb-api-gateway");
    assert.equal(m.cwd, "C:/repo/gateway");
    assert.equal(m.write, true);
    assert.equal(m.projectCtx, "บริบทโปรเจกต์");
    assert.equal(m.goal, "เป้าหมายทดสอบ");
    assert.ok(m.createdAt);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("อ่าน manifest จาก directory ที่ไม่มี = null (run เก่าก่อน v0.3)", () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    assert.equal(readManifest(runDir), null);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("resume ไม่ได้ส่ง flag มาเอง → คืน cwd/write/projectCtx จาก manifest", () => {
  const realDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const manifest = { cwd: realDir, write: true, target: "sb-api-gateway", projectCtx: "บริบทเดิม" };
    const opts = applyManifestToOpts(mkOpts(), manifest);
    assert.equal(opts.cwd, realDir);
    assert.equal(opts.write, true);
    assert.equal(opts.projectCtx, "บริบทเดิม");
  } finally { rmSync(realDir, { recursive: true, force: true }); }
});

test("flag ที่ผู้ใช้ส่งเองชนะ manifest เสมอ (explicit ชนะ / cwd ตั้งไว้ชนะ / write=false ใน manifest ไม่เปิด write)", () => {
  const realDir = mkdtempSync(path.join(tmpdir(), "baan-test-"));
  try {
    const manifest = { cwd: realDir, write: true, target: "sb-api-gateway", projectCtx: "บริบทเดิม" };
    const explicitCwd = applyManifestToOpts(mkOpts({ explicit: new Set(["cwd"]), cwd: "C:/อื่น" }), manifest);
    assert.equal(explicitCwd.cwd, "C:/อื่น");
    assert.equal(explicitCwd.write, true, "write ไม่ได้ explicit จึงยังคืนจาก manifest");
    const explicitWriteOff = applyManifestToOpts(mkOpts({ explicit: new Set(["write"]), write: true }), { write: true });
    assert.equal(explicitWriteOff.write, true, "ส่ง --write มาเอง = write ไม่ว่า manifest ว่าอะไร");
    const manifestNoWrite = applyManifestToOpts(mkOpts(), { write: false });
    assert.equal(manifestNoWrite.write, false, "manifest read-only ต้องไม่เปิด write");
    // target ระบุเอง = จะ resolve ใหม่ตามปกติ จึงไม่ต้องคืน projectCtx เดิม
    const explicitTarget = applyManifestToOpts(mkOpts({ target: "อื่น" }), manifest);
    assert.equal(explicitTarget.projectCtx, "");
  } finally { rmSync(realDir, { recursive: true, force: true }); }
});

test("cwd ของ run เดิมถูกลบไปแล้ว → โยน error ไม่ใช่เงียบๆ เขียนผิดที่", () => {
  const gone = path.join(tmpdir(), "baan-test-แน่นอนว่าไม่มีจริง");
  assert.throws(() => applyManifestToOpts(mkOpts(), { cwd: gone }), /ไม่มีอยู่อีกแล้ว/);
});
