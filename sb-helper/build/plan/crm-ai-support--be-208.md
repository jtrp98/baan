# BE-208 — POST /knowledge (DRAFT)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P2-08`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/knowledge` — สร้าง knowledge entry (`Status=DRAFT`) — ความรู้ใหม่ต้องเริ่ม DRAFT เสมอ — ไม่ถูก AI ดึงไปตอบจนกว่าจะ approve ตาม workflow ของตาราง

## References

REQ-008, AC-008.1, DES-008, DEC-008

## Scope

route/service ตาม pattern โมดูล — create ตั้ง `Status=DRAFT` เสมอ ไม่รับค่าสถานะจาก client

- Security-sensitive: no

## Out of Scope

workflow ของตาราง (DRAFT→APPROVED) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-008.1: ความรู้ใหม่ถูกสร้างเป็น DRAFT เสมอ — ยังไม่ถูกใช้ตอบ QA จนกว่าจะ approve

## Dependencies

—

## Handoff

ตรวจ AC-008.1 ด้วย dev server: สร้างแล้วได้ DRAFT เสมอ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
