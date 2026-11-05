# BE-104 — model TCrmAiDecisionLog (append-only)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-04`

## Goal

เพิ่ม model `TCrmAiDecisionLog` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — audit trail append-only ของการตัดสินใจ AI/คน ทุก `SubjectType`/`DecisionType` — ทุกการตัดสินใจ (จำแนก/override/รีวิว/merge) ต้องมีแถว audit คู่กันเสมอ โครงตารางต้องรองรับชุดค่าที่ design ปิดครบไว้

## References

REQ-002, AC-002.2, DES-001, DEC-001

## Scope

เพิ่ม model เดียวตรง § Data Model — ธรรมชาติ append-only บังคับที่ app layer (`createDecisionLog` เท่านั้น ห้าม update คอลัมน์ตายตัว) ตาม DEC-001

- Security-sensitive: yes

## Out of Scope

model อื่น · การเปิด update คอลัมน์ append-only (ขัด DEC-001 โดยตรง)

## Expected Output

none

## Acceptance

AC-002.2: มี audit log เก็บทุกการตัดสินใจแบบ append-only — ตรวจย้อนหลังได้ว่าใคร/อะไร/เพราะอะไร

## Dependencies

—

## Handoff

ตรวจ AC-002.2 ด้วยการเทียบ schema กับ § Data Model + อ่านเส้นทางเขียนที่ผ่าน `createDecisionLog` เท่านั้น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
model additive — ลบออกได้ ไม่กระทบตารางอื่น
ส่งต่อ reviewer

Back-links: `INDEX.md`
