// Regression: ลำดับสลับตัวรัน (_fallback ต่อ tier) — สลับเฉพาะเมื่อติดโควตา/limit เท่านั้น
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fallbackChainFor } from "../src/plan.mjs";
import { execute, looksLikeLimitError } from "../src/scheduler.mjs";

const cfg = {
  agents: { codex: {}, agy: {}, claude: {} },
  tiers: {
    t1: { _fallback: ["codex", "agy", "claude"], codex: { model: "m" }, agy: { model: "m" }, claude: { model: "m" } },
    t5: { _fallback: ["agy", "codex", "claude"], codex: { model: "m" }, agy: { model: "m" }, claude: { model: "m" } },
    tX: { codex: { model: "m" }, agy: null, claude: null }, // ไม่มี _fallback + มี null
  },
};

test("fallbackChainFor: ตัวที่เลือกมาเป็นตัวแรกเสมอ แล้วไล่ตาม _fallback ของ tier", () => {
  assert.deepEqual(fallbackChainFor(cfg, "t1", "codex"), ["codex", "agy", "claude"]);
  assert.deepEqual(fallbackChainFor(cfg, "t1", "agy"), ["agy", "codex", "claude"], "สั่ง agy = agy ก่อน แล้วตามลำดับที่เหลือของ tier");
  assert.deepEqual(fallbackChainFor(cfg, "t5", "codex"), ["codex", "agy", "claude"], "tier bulk ที่ตั้ง agy ก่อน ก็ยังเริ่มจากตัวที่สั่ง");
  assert.deepEqual(fallbackChainFor(cfg, "tX", "codex"), ["codex"], "ไม่มี _fallback = ใช้ default order · agent null ถูกตัดออก");
  assert.deepEqual(fallbackChainFor(cfg, "tX", "agy"), ["codex"], "ตัวที่สั่งเป็น null ใน tier = เริ่มจากตัวแรกที่ใช้ได้");
});

test("looksLikeLimitError: จับข้อความ limit ของทั้งสาม CLI แต่ไม่จับความล้มเหลวทั่วไป", () => {
  const base = { ok: false, timedOut: false, answer: "", error: "" };
  assert.equal(looksLikeLimitError({ ...base, stderr: "⚠️  usage limit reached | resets at 7am UTC" }), true, "claude");
  assert.equal(looksLikeLimitError({ ...base, stderr: "ERROR: usage limit reached, use /status" }), true, "codex");
  assert.equal(looksLikeLimitError({ ...base, stderr: "Your AI credits balance is too low to continue." }), true, "agy");
  assert.equal(looksLikeLimitError({ ...base, stderr: "rate limit exceeded, retry later" }), true);
  assert.equal(looksLikeLimitError({ ...base, stderr: "boom หรือ error อื่นทั่วไป" }), false, "fail ธรรมดาต้องไม่สลับ");
  assert.equal(looksLikeLimitError({ ...base, stderr: "usage limit reached", ok: true }), false, "ok อยู่แล้ว");
  assert.equal(looksLikeLimitError({ ...base, stderr: "usage limit reached", timedOut: true }), false, "timeout ไม่ใช่ limit");
});

const okRun = (answer = "ผลลัพธ์\nDONE") => ({ ok: true, exitCode: 0, durationMs: 5, timedOut: false, answer, error: "", stdout: "", stderr: "" });
const limitRun = () => ({ ok: false, exitCode: 1, durationMs: 5, timedOut: false, answer: "", error: "", stdout: "", stderr: "usage limit reached — resets in 3h" });
const T = (id, tier, agent) => ({ id, role: "qa", agent, tier, title: `งาน ${id}`, task: `ทำ ${id}`, dependsOn: [] });
const mkOpts = (over = {}) => ({ cwd: tmpdir(), maxParallel: 3, dryRun: false, write: false, timeoutSec: 60, projectCtx: "", ...over });

test("execute: ตัวแรกติดโควตา → สลับตัวถัดไปตาม _fallback งานสำเร็จ และบันทึกว่าสลับด้วยอะไร", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "mycelium-test-"));
  try {
    const seen = [];
    const runner = async (_cfg, _opts, _d, t, _ctx, agent) => {
      seen.push(agent);
      return agent === "codex" ? limitRun() : okRun();
    };
    const plan = { summary: "s", tasks: [T("A", "t1", "codex")], humanGates: [] };
    const res = await execute(plan, mkOpts(), runDir, cfg, new Map(), runner);
    assert.deepEqual(seen, ["codex", "agy"], "ต้องลอง codex แล้วสลับไป agy แล้วหยุดเพราะสำเร็จ");
    assert.equal(res.ok, true);
    const cp = JSON.parse(readFileSync(path.join(runDir, "A.status.json"), "utf8"));
    assert.equal(cp.agent, "agy", "checkpoint บันทึกตัวรันจริง");
    assert.deepEqual(cp.fallback, ["codex→agy"]);
    assert.equal(res.summary.tasks[0].agent, "agy");
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("execute: fail ด้วยเหตุอื่น (ไม่ใช่ limit) ต้องไม่สลับ — กันเผาโควตาซ้ำ", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "mycelium-test-"));
  try {
    const seen = [];
    const runner = async (_cfg, _opts, _d, t, _ctx, agent) => { seen.push(agent); return { ...limitRun(), stderr: "module not found บรรทัด 429 ของโค้ด" }; };
    const plan = { summary: "s", tasks: [T("A", "t1", "codex")], humanGates: [] };
    const res = await execute(plan, mkOpts(), runDir, cfg, new Map(), runner);
    assert.deepEqual(seen, ["codex"], "ลองตัวเดียวพอ");
    assert.equal(res.ok, false);
    assert.equal(res.summary.tasks[0].state, "failed");
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("execute: ทั้ง chain ติดโควตาหมด = งาน failed (ไม่วนซ้ำ ไม่ปล่อยผ่าน)", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "mycelium-test-"));
  try {
    const seen = [];
    const runner = async (_cfg, _opts, _d, t, _ctx, agent) => { seen.push(agent); return limitRun(); };
    const plan = { summary: "s", tasks: [T("A", "t1", "codex")], humanGates: [] };
    const res = await execute(plan, mkOpts(), runDir, cfg, new Map(), runner);
    assert.deepEqual(seen, ["codex", "agy", "claude"], "ไล่ครบ chain แล้วหยุด");
    assert.equal(res.ok, false);
    const cp = JSON.parse(readFileSync(path.join(runDir, "A.status.json"), "utf8"));
    assert.equal(cp.state, "failed");
    assert.equal(cp.agent, "claude", "ตัวสุดท้ายที่ลอง");
    assert.deepEqual(cp.fallback, ["codex→agy", "agy→claude"]);
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});
