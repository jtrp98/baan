// Regression (2026-10-26): ตัวรันล้มแต่ report.json มี error ว่าง — codex "at capacity" และ agy ถูกปฏิเสธสิทธิ์อ่าน
// ต้องไปเปิด stderr เองถึงรู้เหตุ · และสิทธิ์อ่านนอก cwd ของ agy โหมดเขียนให้ผ่าน read_file rule
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { summarizeStderr } from "../src/runner.mjs";
import { applyRules, readRule } from "../setup/agy/grant-read.mjs";

const AGY_DENIED = 'jetski: no output produced — a tool required the "read_file" permission that headless mode cannot prompt for, so it was auto-denied.';

test("summarizeStderr: ดึงบรรทัด ERROR ของ codex ออกจาก transcript ที่ปนอยู่", () => {
  const stderr = [
    "exec powershell -Command Get-Content x",
    "- **no permission to run a command** = `BLOCKED`",
    "2026-10-26T08:33:46Z  WARN codex_otel::auth_storage: fallback",
    "ERROR: Selected model is at capacity. Please try a different model.",
    "ERROR: Selected model is at capacity. Please try a different model.",
    "tokens used",
    "5,171",
  ].join("\n").padEnd(2000, " ");
  assert.equal(summarizeStderr(stderr), "ERROR: Selected model is at capacity. Please try a different model.", "ไม่เอาบรรทัด prompt ที่บังเอิญมีคำว่า permission · ซ้ำเอาครั้งเดียว");
});

test("summarizeStderr: agy ถูกปฏิเสธสิทธิ์อ่าน = ข้อความเดิม + ชี้ทางแก้ที่ไม่เปิดสิทธิ์เขียน", () => {
  const s = summarizeStderr(`${AGY_DENIED}\n`);
  assert.ok(s.startsWith("jetski: no output produced"));
  assert.match(s, /grant-read\.mjs/);
  assert.match(s, /อย่าใช้ --add-dir/);
});

test("summarizeStderr: stderr สั้นที่ไม่มีบรรทัด error ใช้ทั้งก้อน · ยาวโดยไม่มี error = ว่าง (ดูไฟล์ stderr เอง) · ไม่มีอะไร = ว่าง", () => {
  assert.equal(summarizeStderr("something odd\nhappened"), "something odd | happened");
  assert.equal(summarizeStderr("x".repeat(5000)), "");
  assert.equal(summarizeStderr(""), "");
  assert.equal(summarizeStderr(undefined), "");
});

test("grant-read: read_file rule เป็น absolute path · ไม่ยอมทั้ง drive · เพิ่ม/ถอนแบบ idempotent ไม่แตะ rule อื่น", () => {
  const dir = path.resolve("C:/src/schoolbright");
  assert.equal(readRule(dir), `read_file(${dir})`);
  assert.throws(() => readRule(path.parse(dir).root), /ทั้ง drive/);

  const base = { model: "m", permissions: { allow: ["command(git status)"] } };
  const added = applyRules(base, [readRule(dir)]);
  assert.deepEqual(added.permissions.allow, ["command(git status)", `read_file(${dir})`]);
  assert.deepEqual(applyRules(added, [readRule(dir)]), added, "เพิ่มซ้ำไม่เกิดรายการซ้ำ");
  assert.deepEqual(applyRules(added, [readRule(dir)], true), base, "ถอนแล้วกลับเหมือนเดิม");
  assert.equal(added.model, "m", "setting อื่นอยู่ครบ");
  assert.deepEqual(applyRules({}, [readRule(dir)]).permissions.allow, [`read_file(${dir})`], "ยังไม่มี permissions เลยก็ได้");
});

test("grant-read CLI: เขียนลง settings ที่ระบุและสำรองไฟล์เดิม", async () => {
  const { execFileSync } = await import("node:child_process");
  const d = mkdtempSync(path.join(tmpdir(), "baan-agy-"));
  try {
    const file = path.join(d, "settings.json");
    writeFileSync(file, JSON.stringify({ permissions: { allow: [] } }), "utf8");
    const script = new URL("../setup/agy/grant-read.mjs", import.meta.url);
    execFileSync(process.execPath, [script.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "--settings", file, d], { encoding: "utf8" });
    assert.deepEqual(JSON.parse(readFileSync(file, "utf8")).permissions.allow, [`read_file(${path.resolve(d)})`]);
    assert.deepEqual(JSON.parse(readFileSync(`${file}.baan-bak`, "utf8")).permissions.allow, []);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
