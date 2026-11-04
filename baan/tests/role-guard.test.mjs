// Regression: session ที่ถูกเปิดเป็น role ต้องไม่สวมบท นายช่าง ตาม CLAUDE.md/AGENTS.md ของ workspace
// (พบจาก smoke จริง 2026-10-17: codex ที่เปิดเป็น spec ใน C:\src\schoolbright พยายามเปิด charter ก่อนทำงาน)
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performInit } from "../src/init.mjs";
import { adhocDirective, plannerPrompt, roleDirective } from "../src/prompts.mjs";
import { ROLE_SESSION_RULE, roleMarker } from "../src/role-guard.mjs";

const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = { agents: { codex: {} }, tiers: { t2: { codex: { model: "m" } } } };

test("stub ของ --init มีข้อยกเว้นของ role ก่อนคำสั่งสวมบท นายช่าง", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-guard-"));
  try {
    performInit(dir, TEAM_DIR, () => {});
    for (const name of ["CLAUDE.md", "AGENTS.md"]) {
      const content = readFileSync(path.join(dir, name), "utf8");
      const ruleAt = content.indexOf(ROLE_SESSION_RULE);
      assert.ok(ruleAt !== -1, `${name}: ต้องมีประโยคข้อยกเว้นเดียวกับใน prompt`);
      assert.ok(ruleAt < content.indexOf("คุณคือ นายช่าง"), `${name}: ข้อยกเว้นต้องมาก่อนคำสั่งสวมบท`);
      assert.ok(ruleAt < content.indexOf("BAAN.md"), `${name}: ข้อยกเว้นต้องมาก่อนคำสั่งให้อ่าน charter`);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("prompt ของ role ขึ้นต้นด้วยป้าย role (ID สั้นแม้ส่งชื่อเดิม) + ประโยคเดียวกับ stub", () => {
  const p = roleDirective("business-analyst", "เขียน REQ", null, "", "2026-10-17");
  assert.ok(p.startsWith(`${roleMarker("spec")}\n${ROLE_SESSION_RULE}\n`), "ป้ายต้องอยู่บรรทัดแรก ก่อนเนื้อหาบทบาท");
  assert.ok(plannerPrompt("goal", cfg, "", "2026-10-17").startsWith(`${roleMarker("plan")}\n${ROLE_SESSION_RULE}`));
});

test("งานที่ไม่ผูก role ก็มีป้าย adhoc และคงคำสั่งงานเดิมไว้ครบ", () => {
  const p = adhocDirective("อ่าน demo-notes.md แล้วตอบคำลับ");
  assert.ok(p.startsWith(`${roleMarker("adhoc")}\n${ROLE_SESSION_RULE}`));
  assert.ok(p.endsWith("อ่าน demo-notes.md แล้วตอบคำลับ"));
});

test("ป้ายในข้อยกเว้นตรงรูปแบบกับป้ายที่ prompt ใส่จริง (สองฝั่งชี้กันเจอ)", () => {
  const pattern = ROLE_SESSION_RULE.match(/`(\[baan-role: <ID>\])`/)?.[1];
  assert.ok(pattern, "ข้อยกเว้นต้องบอกรูปแบบป้าย");
  assert.equal(roleMarker("<ID>"), pattern);
});
