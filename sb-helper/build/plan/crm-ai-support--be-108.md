# BE-108 — GET /safety-keywords list

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-08`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/safety-keywords` — list พร้อม pagination — หน้าจัดการคำสำคัญต้องอ่านรายการผ่าน API เดียวกับที่เขียน — pagination บังคับทุก list ตาม contract ของโมดูล

## References

REQ-004, AC-004.1, DES-001, DEC-001

## Scope

read endpoint เดียว พร้อม pagination — ไม่มี write path ใน route นี้

- Security-sensitive: yes

## Out of Scope

ค่า keyword ใน DB (อ่านอย่างเดียว) · schema · endpoint อื่น

## Expected Output

none

## Acceptance

AC-004.1: อ่านรายการคำสำคัญทั้งหมดผ่าน endpoint แบ่งหน้าได้ — ข้อมูลตรงตารางจริง

## Dependencies

—

## Handoff

ตรวจ AC-004.1 ด้วย dev server: list สำเร็จ + pagination ทำงาน + 401 เมื่อไม่ล็อกอิน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
