// WP1 quick wins: สลับตัวรันเมื่อ CLI เริ่มไม่ได้, idle timeout, เติม slot ทันทีที่ว่าง, CONVENTIONS ต่อ role,
// ไม่มีขั้น PM, probe สภาพแวดล้อม — ใช้ตัวรันจำลอง ไม่เรียก AI CLI จริง
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execute, runWithFallback, switchReasonText } from "../src/scheduler.mjs";
import { runCli } from "../src/runner.mjs";
import { plannerPrompt, readConventions, roleDirective } from "../src/prompts.mjs";
import { looksLikeEnvironmentFailure } from "../src/failure-class.mjs";
import { runProbe } from "../src/probe.mjs";
import { parseRoleArgs } from "../src/role-session.mjs";

const noWait = { retryDelaysMs: [], sleep: async () => {}, onRetry: () => {} };
const fail = (over) => ({ ok: false, exitCode: 1, timedOut: false, answer: "", stdout: "", stderr: "", error: "", durationMs: 0, ...over });
const okRun = () => ({ ok: true, exitCode: 0, timedOut: false, answer: "เสร็จ\nDONE", stdout: "", stderr: "", error: "", durationMs: 1 });

async function chainFor(first) {
  const tried = [];
  const res = await runWithFallback(["codex", "agy"], async (a) => { tried.push(a); return a === "codex" ? first : okRun(); }, () => {}, noWait);
  return { tried, res };
}

test("fallback: CLI เริ่มไม่ได้ (codex Access is denied / claude org settings) = สลับตัวถัดไป", async () => {
  const a = await chainFor(fail({ error: "Error: failed to initialize in-process app-server client: Access is denied. (os error 5)" }));
  assert.deepEqual(a.tried, ["codex", "agy"]);
  assert.deepEqual(a.res.trail, ["codex→agy"]);
  const b = await chainFor(fail({ durationMs: 17_000, stderr: "Claude Code couldn't reach Anthropic to load your organization's settings" }));
  assert.deepEqual(b.tried, ["codex", "agy"]);
  assert.match(switchReasonText("startup"), /เริ่มทำงานไม่ได้/);
});

test("fallback: DNS ล้มเร็ว = สลับ · ล้มหลังทำงานไปนาน = ไม่สลับ (อาจแก้ไฟล์ไปแล้ว) · fail ทั่วไป = ไม่สลับ", async () => {
  const dns = "dial tcp: lookup x.googleapis.com: getaddrinfow: The requested name is valid, but no data of the requested type was found.";
  assert.deepEqual((await chainFor(fail({ durationMs: 5_000, error: dns }))).tried, ["codex", "agy"]);
  assert.deepEqual((await chainFor(fail({ durationMs: 120_000, error: dns }))).tried, ["codex"]);
  assert.deepEqual((await chainFor(fail({ error: "Error: test failed" }))).tried, ["codex"]);
});

const fakeCli = { command: process.execPath, useShell: false, promptVia: "stdin", answerFrom: "stdout" };

test("idle timeout: เงียบเกินกำหนด = หยุดทันที ไม่รอ wall timeout", async () => {
  const t0 = Date.now();
  const r = await runCli(fakeCli, ["-e", "console.log('start'); setTimeout(() => {}, 5000)"], "stdin", "", tmpdir(), 30, undefined, { idleTimeoutSec: 1 });
  assert.equal(r.timedOut, true);
  assert.equal(r.idle, true);
  assert.match(r.error, /idle timeout/);
  assert.ok(Date.now() - t0 < 4000, `ใช้ ${Date.now() - t0} ms`);
});

test("idle timeout: พิมพ์ความคืบหน้าสม่ำเสมอ = ไม่ถูกหยุดแม้รวมนานกว่า idle", async () => {
  const script = "let n = 0; const t = setInterval(() => { console.log(n++); if (n > 6) { clearInterval(t); } }, 300)";
  const r = await runCli(fakeCli, ["-e", script], "stdin", "", tmpdir(), 30, undefined, { idleTimeoutSec: 1 });
  assert.equal(r.ok, true);
  assert.equal(r.idle, false);
});

const T = (id, dependsOn = []) => ({ id, role: "sys", tier: "t2", agent: "codex", title: id, task: `ทำ ${id}`, dependsOn });
const opts = (maxParallel) => ({ cwd: tmpdir(), maxParallel, dryRun: false, write: false, timeoutSec: 60, projectCtx: "" });

test("execute: งานที่ dependency ผ่านเริ่มทันทีที่ slot ว่าง ไม่รองานยาวสุดของรอบเดียวกัน", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-wp1-"));
  try {
    const times = {};
    const delay = { A: 400, B: 20, C: 20 };
    const runner = async (_c, _o, _d, t) => {
      times[t.id] = { start: Date.now() };
      await new Promise((r) => setTimeout(r, delay[t.id]));
      times[t.id].end = Date.now();
      return okRun();
    };
    const res = await execute({ tasks: [T("A"), T("B"), T("C", ["B"])] }, opts(2), runDir, { agents: {}, tiers: {} }, new Map(), runner);
    assert.equal(res.ok, true);
    assert.ok(times.C.start < times.A.end, "C ต้องเริ่มก่อน A จบ");
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("execute: slot เดียว — งานที่มีงานอื่นพึ่งได้ก่อน แม้อยู่ท้ายในแผน", async () => {
  const runDir = mkdtempSync(path.join(tmpdir(), "baan-wp1-"));
  try {
    const order = [];
    const runner = async (_c, _o, _d, t) => { order.push(t.id); return okRun(); };
    await execute({ tasks: [T("X"), T("Y"), T("Z", ["Y"])] }, opts(1), runDir, { agents: {}, tiers: {} }, new Map(), runner);
    assert.ok(order.indexOf("Y") < order.indexOf("X"), order.join(","));
  } finally { rmSync(runDir, { recursive: true, force: true }); }
});

test("CONVENTIONS ต่อ role: sys/front ไม่ได้ §3 §10 §12 §13 · check ไม่ได้ §3 · role อื่นได้ทั้งไฟล์", () => {
  const sys = roleDirective("sys", "แก้บั๊ก", null, "", "2026-11-04");
  assert.doesNotMatch(sys, /## 3\. Knowledge files/);
  assert.doesNotMatch(sys, /## 12\. Readable data documentation/);
  assert.match(sys, /## 8\. Output state/);
  assert.match(sys, /Sections §3, §10, §12, §13 of the shared conventions are omitted/);
  const check = roleDirective("check", "ตรวจ", null, "", "2026-11-04");
  assert.doesNotMatch(check, /## 3\. Knowledge files/);
  assert.match(check, /## 12\. Readable data documentation/);
  assert.match(check, /## 10\. Finish rules/);
  const spec = roleDirective("spec", "เขียน REQ", null, "", "2026-11-04");
  for (let n = 1; n <= 13; n++) assert.match(spec, new RegExp(`## ${n}\\. `), `spec ขาด §${n}`);
  assert.equal(readConventions("spec"), readConventions());
});

test("CONVENTIONS ต่อ role: ส่วนที่แนบให้ sys เล็กลงอย่างน้อย 40%", () => {
  const full = Buffer.byteLength(readConventions(), "utf8");
  const sys = Buffer.byteLength(readConventions("sys"), "utf8");
  assert.ok(sys <= full * 0.6, `sys ${sys} B จากทั้งหมด ${full} B`);
});

test("plannerPrompt: รับ goal ตรง ไม่มี brief ของ PM แล้ว · แนบ CONVENTIONS ทั้งไฟล์", () => {
  const cfg = { tiers: { t2: { codex: { model: "m" } } }, agents: { codex: {} } };
  const p = plannerPrompt("ทำหน้า export", cfg, "", "2026-11-04");
  assert.doesNotMatch(p, /Brief from the site manager/);
  assert.match(p, /## Goal from the user:\nทำหน้า export/);
  assert.match(p, /## 3\. Knowledge files/);
  const src = readFileSync(fileURLToPath(new URL("../bin/baan.mjs", import.meta.url)), "utf8");
  assert.doesNotMatch(src, /pmPrompt|pm\.answer\.txt/);
});

test("probe: ผ่าน · ล้มเพราะสภาพแวดล้อม (feed) · ล้มเพราะงาน (test แดง)", async () => {
  const node = `"${process.execPath}"`;
  const ok = await runProbe(`${node} -e "console.log('ok')"`, tmpdir(), 30);
  assert.equal(ok.code, 0);
  assert.equal(ok.env, false);
  const feed = await runProbe(`${node} -e "console.error('warning NU1900: Error occurred while getting package vulnerability data: unable to load the service index for source feed'); process.exit(1)"`, tmpdir(), 30);
  assert.equal(feed.code, 1);
  assert.equal(feed.env, true);
  assert.match(feed.output, /NU1900/);
  const red = await runProbe(`${node} -e "console.error('Assert.Equal() Failure: expected 1 actual 2'); process.exit(1)"`, tmpdir(), 30);
  assert.equal(red.code, 1);
  assert.equal(red.env, false);
});

test("looksLikeEnvironmentFailure + --probe", () => {
  assert.equal(looksLikeEnvironmentFailure("apply_patch: Failed to write file"), true);
  assert.equal(looksLikeEnvironmentFailure("1 test failed"), false);
  assert.equal(parseRoleArgs(["--probe", "npm test"]).probe, "npm test");
  assert.equal(parseRoleArgs([]).probe, "");
  assert.throws(() => parseRoleArgs(["--probe", " "]), /--probe/);
});
