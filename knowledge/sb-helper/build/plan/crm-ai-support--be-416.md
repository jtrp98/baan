# BE-416 — ตรวจ model TCrmStaffRole

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-11`

## Goal

ตรวจ model `TCrmStaffRole` ตรงกับ § Data Model — บทบาทหน้าที่ใช้มอบหมายงาน/แสดงรายชื่อ — โครงตารางต้องตรง design ก่อน endpoints/งาน sync อ้าง

## References

REQ-016, AC-016.1, DES-006, DEC-006

## Scope

งานยืนยัน mapping/schema เท่านั้น — ไม่มี DDL ใหม่ (ตารางมีอยู่จริง)

- Security-sensitive: no

## Out of Scope

DDL/ตารางใน DB · model อื่น · การเพิ่ม unique constraint บน AdminId+FunctionalRole (ห้าม — ขัด DEC-006)

## Expected Output

none

## Acceptance

AC-016.1: โครงตารางรองรับหลายแถวต่อคน — `FunctionalRole` ครบ 6 ค่าที่กำหนด

## Dependencies

—

## Handoff

ตรวจ AC-016.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema
ส่งต่อ reviewer

Back-links: `INDEX.md`
