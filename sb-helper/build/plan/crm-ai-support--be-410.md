# BE-410 — ตรวจ model TCrmCustomerPromise

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-05`

## Goal

ตรวจ model `TCrmCustomerPromise` ตรงกับ § Data Model — คำสัญญาลูกค้าเป็นข้อมูล Sales-facing — โครงตารางต้องตรง design ก่อน endpoints อ้าง

## References

REQ-015, AC-015.1, DES-010, DEC-010

## Scope

งานยืนยัน mapping/schema เท่านั้น — ไม่มี DDL ใหม่ (ตารางมีอยู่จริง)

- Security-sensitive: no

## Out of Scope

DDL/ตารางใน DB · model อื่น · การเพิ่ม field นอก § Data Model

## Expected Output

none

## Acceptance

AC-015.1: โครงตารางรองรับ `PromiseType` 5 ค่าและผูกกับฟีเจอร์/เมนูได้ — ตรง § Data Model

## Dependencies

—

## Handoff

ตรวจ AC-015.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema
ส่งต่อ reviewer

Back-links: `INDEX.md`
