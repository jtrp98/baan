// Regression: วันที่ของงานต้องอยู่ใน prompt ทุกทาง — role รัน non-interactive ถามผู้ใช้ตาม CONVENTIONS §4 ไม่ได้
import test from "node:test";
import assert from "node:assert/strict";
import { localDate, plannerPrompt, pmPrompt, roleDirective } from "../src/prompts.mjs";

const cfg = { agents: { codex: {} }, tiers: { t2: { codex: { model: "m" } } } };

test("localDate ใช้เวลา local ในรูปแบบ YYYY-MM-DD", () => {
  assert.equal(localDate(new Date(2026, 0, 5, 1, 30)), "2026-01-05");
  assert.equal(localDate(new Date(2026, 9, 17, 23, 59)), "2026-10-17");
});

test("roleDirective / pmPrompt / plannerPrompt แนบวันที่ของงานที่ส่งมา", () => {
  for (const p of [
    roleDirective("check", "เขียน test", null, "", "2026-10-17"),
    pmPrompt("goal", "", "2026-10-17"),
    plannerPrompt("คำมอบหมาย", "goal", cfg, "", "2026-10-17"),
  ]) {
    assert.match(p, /## วันที่ของงาน \(date of work\): 2026-10-17/);
    assert.match(p, /do not ask the user again/);
  }
});

test("ไม่ส่งวันที่ = ใช้วันที่ของเครื่อง (ไม่มี prompt ไหนหลุดไปโดยไม่มีวันที่)", () => {
  assert.match(roleDirective("check", "เขียน test", null, ""), new RegExp(`## วันที่ของงาน \\(date of work\\): ${localDate()}`));
  assert.match(roleDirective("check", "เขียน test", null, "", undefined), new RegExp(`## วันที่ของงาน \\(date of work\\): ${localDate()}`));
});

test("roleDirective ใส่ระดับการตรวจเฉพาะ role ที่ระดับเปลี่ยนวิธีทำงาน", () => {
  for (const role of ["check", "inspect", "sys", "front"]) {
    assert.match(roleDirective(role, "งาน", null, "", "2026-11-03", "normal"), /## Test level of this assignment: normal/, role);
  }
  assert.doesNotMatch(roleDirective("spec", "งาน", null, "", "2026-11-03", "normal"), /Test level of this assignment/);
  assert.doesNotMatch(roleDirective("check", "งาน", null, "", "2026-11-03"), /Test level of this assignment/, "ไม่ส่งระดับ = ไม่เดาให้");
});
