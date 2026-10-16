// การประกอบ prompt: ไฟล์ role + CONVENTIONS.md (สัญญากลาง) + บริบทโปรเจกต์ + คำสั่งงาน
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROLES_DIR, TEAM_DIR, listRoles, tierMatrixText } from "./config.mjs";
import { FIXED_ROLE_TIER } from "./plan.mjs";

// CONVENTIONS.md เป็นสัญญาบังคับของทุก role — อ่านไม่ได้ให้หยุด ไม่ข้ามเงียบๆ
// (มิฉะนั้น package ที่ติดตั้งแล้วขาดไฟล์นี้จะทำงานโดยไร้กติกากลางโดยไม่มีใครรู้)
export function readConventions() {
  const file = path.join(TEAM_DIR, "CONVENTIONS.md");
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    console.error(`อ่าน CONVENTIONS.md ไม่ได้ (${file}) — ไฟล์นี้เป็นสัญญาบังคับของทุก role ระบบจึงหยุด (ติดตั้ง package ให้ครบ หรือรันจากตำแหน่งที่มีไฟล์นี้)`);
    process.exit(2);
  }
}

export function roleDirective(roleName, task, ctxBlocks, projectCtx) {
  const roleContent = readFileSync(path.join(ROLES_DIR, `${roleName}.md`), "utf8").trim();
  const conv = `\n\n---\n\n## กติกากลางทุก role ต้องถือ (ถือเป็นสัญญา):\n${readConventions()}`;
  const pc = projectCtx ? `\n\n---\n\n## บริบทโปรเจกต์:\n${projectCtx}` : "";
  const ctx = ctxBlocks?.length ? `\n\n---\n\n## ข้อมูลจากงานก่อนหน้า:\n${ctxBlocks.join("\n\n")}` : "";
  return `คุณกำลังปฏิบัติหน้าที่ในทีมพัฒนาซอฟต์แวร์ตามบทบาทต่อไปนี้อย่างเคร่งครัด:\n\n${roleContent}${conv}${pc}\n\n---\n\n## งานที่ได้รับมอบหมาย:\n${task}${ctx}`;
}

export function pmPrompt(goal, projectCtx) {
  return `${roleDirective("project-manager", `ผู้ใช้ส่งเป้าหมายมาถึงคุณ (PM) จงประมวลเป้าหมายนี้แล้วเขียน "คำมอบหมายให้ planner" แบบกระชับ (ไม่เกิน 10 บรรทัด): สิ่งที่ต้องได้, ขอบเขต in/out, ข้อจำกัดที่รู้ และสิ่งที่ต้องระวัง — อย่าวางแผนเอง หน้าที่นี้เป็นของ planner\n\n## เป้าหมายจากผู้ใช้:\n${goal}`, null, projectCtx)}

ตอบกลับเฉพาะข้อความคำมอบหมาย (ไม่ต้องเป็น JSON)`;
}

export function plannerPrompt(pmDirective, goal, cfg, projectCtx) {
  const roleContent = readFileSync(path.join(ROLES_DIR, "planner.md"), "utf8").trim();
  const roles = listRoles().map((r) => `- ${r.name} — ${r.title}${FIXED_ROLE_TIER[r.name] ? ` (tier คงที่ ${FIXED_ROLE_TIER[r.name]})` : " (planner เลือก tier)"}`).join("\n");
  const matrix = tierMatrixText(cfg.tiers, cfg.agents);
  const conv = `\n## กติกากลางทุก role ต้องถือ (ถือเป็นสัญญา):\n${readConventions()}\n`;
  const pc = projectCtx ? `\n## บริบทโปรเจกต์ (ใส่ให้ทุก task ที่เกี่ยวกับโค้ด/เอกสาร):\n${projectCtx}\n` : "";
  return `คุณกำลังปฏิบัติหน้าที่ planner ตามบทบาทต่อไปนี้อย่างเคร่งครัด:

${roleContent}

---

## เป้าหมายจากผู้ใช้:
${goal}

## คำมอบหมายจาก PM:
${pmDirective}
${conv}${pc}
## ทีมที่เรียกใช้ได้ (role):
${roles}

## ตัวรัน (agent) และ tier ที่ใช้ได้จริง:
${matrix}

## กติกาการวางแผน (สำคัญ):
1. งานง่าย = จำนวน task น้อย (อาจ 1–2 task หรือ task เดียว) — เลือกเฉพาะ role ที่จำเป็น ไม่ต้องใช้ทั้งทีม
2. **tier ของ task เลือกได้เฉพาะ role = frontend-engineer / backend-engineer** (งาน implement ที่ผ่านการออกแบบจาก system-analyst มาแล้ว) — role อื่นทุกตัวใช้ tier คงที่ตามรายการด้านบน
3. task ที่ไม่พึ่งกัน (dependsOn ว่าง) จะถูกรันขนานกัน — จัด dependency ให้ตรงความจำเป็นจริงเท่านั้น
4. ทุก task ทำงานแบบ read-only (ยังไม่แก้ไฟล์) — output เป็นเอกสาร/ข้อความ
5. สิ่งที่ต้องเป็น "ประตูมนุษย์" (เช่น sign-off UX, การรัน SQL, การตัดสินธุรกิจ) ใส่ใน humanGates

## ตอบกลับเป็น JSON เท่านั้น (ไม่มีข้อความอื่นนอก JSON):
{
  "summary": "สรุปแผนหนึ่งบรรทัด",
  "tasks": [
    {
      "id": "T1",
      "role": "business-analyst",
      "tier": "t2",
      "title": "ชื่อสั้นของงาน",
      "task": "คำสั่งงานเต็มให้ role นี้ทำ (ภาษาไทย ชัดเจน ระบุ output ที่ต้องส่งออก)",
      "dependsOn": []
    }
  ],
  "humanGates": ["สิ่งที่ต้องให้ผู้ใช้ตัดสิน (ถ้าไม่มีใช้ [])"]
}
(ไม่ต้องระบุ agent — ระบบกำหนดให้ทุก task เอง)`;
}
