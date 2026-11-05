# BE-336 — กฎ NEW_KNOWLEDGE

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-27`

## Goal

implement กฎ `NEW_KNOWLEDGE` — เคส `AiCategory=QA` ≥5 เคส ที่ `MenuId` เดียวกัน และไม่มี `TCrmKnowledgeEntry` ที่ `Status=APPROVED`+`MenuId` เดียวกัน+`SupersededById IS NULL` ภายใน 30 วัน — คำถามซ้ำจากหลายโรงเรียนโดยไม่มีความรู้ครอบ = ควรเสนอเขียนความรู้ใหม่ — เงื่อนไข ไม่มี entry APPROVED กันเสนอซ้ำที่มีความรู้อยู่แล้ว

## References

REQ-011, AC-011.2, DES-008, DEC-008

## Scope

query กฎเดียวใน detection service — เงื่อนไข ไม่มี entry ตรวจจากตารางความรู้ตรง ๆ (APPROVED + เมนูเดียวกัน + ไม่ถูก supersede)

- Security-sensitive: no

## Out of Scope

ค่าเกณฑ์ (จาก constant) · workflow ของตารางความรู้ · กฎอื่น

## Expected Output

none

## Acceptance

AC-011.2: กฎ NEW_KNOWLEDGE ตรวจตรงเกณฑ์ (≥5 เคส/ไม่มีความรู้ APPROVED ครอบ/30 วัน) — ไม่เสนอเมื่อมีความรู้ครอบอยู่

## Dependencies

—

## Handoff

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (4/5 เคส, มี/ไม่มี entry APPROVED, supersede) — เทียบผลตรวจพบ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
กฎเป็นฟังก์ชันแยก — revert รายกฎได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
