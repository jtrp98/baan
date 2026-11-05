# BE-209 — GET /knowledge list

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P2-09`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/knowledge` — list พร้อม pagination + filter (`Status`/`Category`/`MenuId`) — จัดการความรู้ต้องอ่านรายการกรองตามสถานะ/หมวดได้จาก API เดียว

## References

REQ-008, AC-008.1, DES-008, DEC-008

## Scope

read endpoint — pagination + filter 3 field ตาม pattern โมดูล

- Security-sensitive: no

## Out of Scope

ข้อมูลความรู้ (อ่านอย่างเดียว) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-008.1: อ่านรายการความรู้แบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

## Dependencies

—

## Handoff

ตรวจ AC-008.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
