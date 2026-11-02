# BE-412 — GET /customer-promises list

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-07`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/customer-promises` — list พร้อม pagination + filter (`SchoolId`/`Status`/`TargetDate`) — Sales ทบทวนคำสัญญาที่ตัวเองเคยบันทึกได้จาก API เดียว

## References

REQ-015, AC-015.1, DES-010, DEC-010

## Scope

read endpoint — pagination + filter 3 field ตาม pattern โมดูล

- Security-sensitive: no

## Out of Scope

แถวคำสัญญา (อ่านอย่างเดียว) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-015.1: อ่านรายการคำสัญญาแบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

## Dependencies

—

## Handoff

ตรวจ AC-015.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
