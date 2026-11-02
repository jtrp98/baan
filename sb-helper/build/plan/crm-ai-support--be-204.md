# BE-204 — GET /issues list

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P2-04`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/issues` — list พร้อม pagination + filter (`Category`/`Status`/`MenuId`) — หน้าจัดการเรื่องต้องอ่านรายการผ่าน API เดียวแบ่งหน้าได้

## References

REQ-010, AC-010.1, DES-008, DEC-008

## Scope

read endpoint — pagination บังคับ + filter 3 field

- Security-sensitive: no

## Out of Scope

ข้อมูลเรื่อง (อ่านอย่างเดียว) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-010.1: อ่านรายการเรื่องแบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

## Dependencies

—

## Handoff

ตรวจ AC-010.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
