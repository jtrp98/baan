// Regression ของ baan-role (โหมดหลัก): cwd เริ่มต้น, runDir ไม่ชนเมื่อรันขนาน, สถานะงานจาก output state + fallback
// ใช้ attempt จำลองแทนการเรียก AI CLI จริง ไม่ใช้โควตา
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRunDir, parseRoleArgs, runRoleAgents } from "../src/role-session.mjs";

const BIN = fileURLToPath(new URL("../bin/baan-role.mjs", import.meta.url));
const cfg = {
  agents: { codex: {}, agy: {}, claude: {} },
  tiers: { t2: { _fallback: ["codex", "agy", "claude"], codex: { model: "m" }, agy: { model: "m" }, claude: { model: "m" } } },
};
const okRun = (answer = "ผลลัพธ์\nDONE") => ({ ok: true, exitCode: 0, durationMs: 5, timedOut: false, answer, error: "", stdout: "", stderr: "" });
const limitRun = () => ({ ok: false, exitCode: 1, durationMs: 5, timedOut: false, answer: "", error: "", stdout: "", stderr: "usage limit reached" });
const mkOpts = (over = {}) => ({ tier: "t2", fallback: true, seq: false, ...over });

test("cwd เริ่มต้น = ไดเรกทอรีที่เรียก ไม่ใช่โฟลเดอร์แม่ของ package (P1 ข้อ 1)", () => {
  const base = path.resolve("C:/src/schoolbright/target");
  assert.equal(parseRoleArgs(["--agent", "codex"], base).cwd, base);
  assert.equal(parseRoleArgs(["--cwd", "sb-api"], base).cwd, path.join(base, "sb-api"), "--cwd แบบ relative อิงจากที่เรียก");
  assert.equal(parseRoleArgs([]).cwd, process.cwd());
});

test("parseRoleArgs: --date ตรวจรูปแบบและวันที่จริง · flag ไม่รู้จัก = error", () => {
  assert.equal(parseRoleArgs(["--date", "2026-10-17"]).date, "2026-10-17");
  assert.throws(() => parseRoleArgs(["--date", "2026-02-30"]), /YYYY-MM-DD/, "วันที่ไม่มีจริง");
  assert.throws(() => parseRoleArgs(["--date", "17/10/2026"]), /YYYY-MM-DD/);
  assert.throws(() => parseRoleArgs(["--date"]), /YYYY-MM-DD/, "ลืมใส่ค่า");
  assert.equal(parseRoleArgs(["--no-fallback"]).fallback, false);
  assert.throws(() => parseRoleArgs(["--bogus"]), /อาร์กิวเมนต์ไม่รู้จัก/);
});

test("createRunDir: เรียกพร้อมกันในวินาทีเดียว role/tier เดียวกันได้คนละโฟลเดอร์ (P1 ข้อ 2)", () => {
  const reports = mkdtempSync(path.join(tmpdir(), "baan-reports-"));
  try {
    const now = new Date("2026-10-17T04:11:59Z");
    const spec = { role: "spec", tier: "t2", write: false, count: 1 };
    const a = createRunDir(reports, spec, now);
    const b = createRunDir(reports, spec, now);
    assert.notEqual(a, b);
    assert.ok(existsSync(a) && existsSync(b));
    assert.match(path.basename(a), /^2026-10-17-04-11-59-spec-tier-t2-1agents-/, "ชื่อบอก role ด้วย");
    const nested = createRunDir(path.join(reports, "ยังไม่มี"), { role: "", tier: "", write: true, count: 2 }, now);
    assert.match(path.basename(nested), /-write-2agents-/, "สร้าง reports dir ให้ถ้ายังไม่มี");
  } finally { rmSync(reports, { recursive: true, force: true }); }
});

test("runRoleAgents: role ตอบ NEEDS_HUMAN แม้ exit 0 = งานไม่สำเร็จ (P1 ข้อ 3)", async () => {
  const [r] = await runRoleAgents({ cfg, opts: mkOpts(), selected: ["codex"], attempt: async () => okRun("ต้องถามผู้ใช้ก่อน\n\n**NEEDS_HUMAN**"), log: () => {} });
  assert.equal(r.ok, false);
  assert.equal(r.cliOk, true, "CLI รันจบปกติ");
  assert.equal(r.state, "needs_human");
  assert.equal(r.marker, "NEEDS_HUMAN");
  const [d] = await runRoleAgents({ cfg, opts: mkOpts(), selected: ["codex"], attempt: async () => okRun(), log: () => {} });
  assert.equal(d.state, "completed");
  assert.equal(d.ok, true);
});

test("runRoleAgents: agent เดียว + tier ติดโควตา → สลับตัวถัดไป ตัวสำรองไม่ได้ --model ของตัวที่สั่ง (P1 ข้อ 3)", async () => {
  const seen = [];
  const attempt = async (agent, isRequested) => { seen.push([agent, isRequested]); return agent === "codex" ? limitRun() : okRun(); };
  const [r] = await runRoleAgents({ cfg, opts: mkOpts(), selected: ["codex"], attempt, log: () => {} });
  assert.deepEqual(seen, [["codex", true], ["agy", false]]);
  assert.equal(r.requested, "codex");
  assert.equal(r.agent, "agy");
  assert.deepEqual(r.fallback, ["codex→agy"]);
  assert.equal(r.state, "completed");
});

test("runRoleAgents: ไม่สลับเมื่อ --all / ไม่มี --tier / --no-fallback / fail ด้วยเหตุอื่น", async () => {
  const cases = [
    [mkOpts(), ["codex", "agy"], limitRun, "--all รันทุกตัวอยู่แล้ว"],
    [mkOpts({ tier: "" }), ["codex"], limitRun, "ไม่มี tier = ไม่รู้ model ของตัวสำรอง"],
    [mkOpts({ fallback: false }), ["codex"], limitRun, "--no-fallback"],
    [mkOpts(), ["codex"], () => ({ ...limitRun(), stderr: "module not found" }), "fail ธรรมดา"],
  ];
  for (const [opts, selected, run, why] of cases) {
    const seen = [];
    const results = await runRoleAgents({ cfg, opts, selected, attempt: async (a) => { seen.push(a); return run(); }, log: () => {} });
    assert.deepEqual(seen.sort(), [...selected].sort(), why);
    assert.ok(results.every((r) => r.state === "failed" && r.fallback.length === 0), why);
  }
});

test("runRoleAgents --seq รันทีละตัวตามลำดับ และแจ้งผลทันทีทีละตัว", async () => {
  const order = [];
  const results = await runRoleAgents({
    cfg, opts: mkOpts({ seq: true }), selected: ["codex", "agy"],
    attempt: async (a) => { order.push(`start:${a}`); return okRun(); },
    onResult: (r) => order.push(`done:${r.agent}`), log: () => {},
  });
  assert.deepEqual(order, ["start:codex", "done:codex", "start:agy", "done:agy"]);
  assert.equal(results.length, 2);
});

test("bin: ไม่ระบุ --agent ได้ข้อความที่ถูกเรื่อง · --date ผิดรูปแบบ exit 2 (ไม่เรียก provider)", () => {
  const noAgent = spawnSync(process.execPath, [BIN, "--task", "x"], { encoding: "utf8" });
  assert.equal(noAgent.status, 2);
  assert.match(noAgent.stderr, /ระบุ --agent/);
  const badDate = spawnSync(process.execPath, [BIN, "--agent", "codex", "--date", "2026-13-01", "--task", "x"], { encoding: "utf8" });
  assert.equal(badDate.status, 2);
  assert.match(badDate.stderr, /YYYY-MM-DD/);
});

test("runRoleAgents: --no-fallback ยัง retry ตัวเดิมเมื่อโมเดลเต็ม และ error ของ CLI ขึ้นใน log", async () => {
  const cap = { ...limitRun(), stderr: "ERROR: Selected model is at capacity. Please try a different model.", error: "ERROR: Selected model is at capacity. Please try a different model." };
  let n = 0;
  const logs = [];
  const [r] = await runRoleAgents({
    cfg, opts: mkOpts({ fallback: false }), selected: ["codex"], log: (m) => logs.push(m),
    attempt: async () => (++n < 2 ? cap : okRun()),
    retry: { sleep: async () => {} },
  });
  assert.equal(n, 2);
  assert.equal(r.state, "completed");
  assert.deepEqual(r.fallback, []);
  assert.match(logs.join("\n"), /codex โมเดลเต็มชั่วคราว/);
});
