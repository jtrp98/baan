# BE-418 — GET /staff-roles list

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-13`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/staff-roles` — list พร้อม pagination + filter (`AdminId`/`FunctionalRole`/`Active`) — มอบหมายงาน/แสดงรายชื่อต้องอ่านรายการกรองตามคน/บทบาท/สถานะได้จาก API เดียว

## References

REQ-016, AC-016.1, DES-006, DEC-006

## Scope

read endpoint — pagination + filter 3 field ตาม pattern โมดูล

- Security-sensitive: no

## Out of Scope

แถวบทบาท (อ่านอย่างเดียว) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-016.1: อ่านรายการบทบาทแบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

## Dependencies

—

## Handoff

ตรวจ AC-016.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
