# BE-328 — ค่าที่เหลือของแถวคู่

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-19`

## Goal

ค่าที่เหลือของทุกแถวคู่ decision log (บังคับไม่มีข้อยกเว้น ตาม design § ข้อ 4): `AiOutput = { suggestionId, suggestionType, payload }` copy `Payload` มาทั้งก้อน (ไม่ join ตอนอ่านทีหลัง), `Confidence`/`ModelVersion` = ค่าที่ detection ใช้ตอนสร้าง — rule-based ให้ `Confidence=null`/`ModelVersion="rule-based"` (ห้ามใส่ 1.0 ลอย ๆ), `ReviewStatus="CONFIRMED"`, `ReviewedBy`/`ReviewedAt` = คนกด/เวลากด accept, `ReviewReason` ไม่บังคับ — แถว audit ต้องอ่านยืนยันตัวเองได้โดยไม่ต้อง join ตาราง suggestion ที่ payload เปลี่ยนได้ — ค่า rule-based ต้องไม่ปลอมเป็นค่า AI

## References

REQ-011, AC-011.1, AC-011.2, DES-008, DEC-008

## Scope

กำหนดค่าตายตัวของแถวคู่ทุกกลุ่ม SuggestionType — ผ่าน `createDecisionLog` เดียวกัน · ห้ามค่าปลอม (1.0 ลอย ๆ)

- Security-sensitive: no

## Out of Scope

ค่า confidence ปลอม (ห้าม 1.0 ลอย ๆ) · การ join ตอนอ่านทีหลังแทนการ copy · แถว log เดิม

## Expected Output

none

## Acceptance

AC-011.1: แถวคู่ทุกกลุ่มมีตัวตนผู้ accept/เวลา/สถานะ CONFIRMED ครบ
AC-011.2: แถวคู่เก็บหลักฐานที่ detection ใช้จริง (AiOutput copy Payload + เวอร์ชัน/ชนิดของกฎ)

## Dependencies

—

## Handoff

ตรวจ AC-011.1/AC-011.2 ด้วยการ accept จริงทุกกลุ่ม type — เทียบค่าแถวคู่กับ Payload ต้นทาง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
กำหนดค่าในจุดเขียนเดียว — revert ได้ (แถวเดิม append-only ไม่แตะ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
