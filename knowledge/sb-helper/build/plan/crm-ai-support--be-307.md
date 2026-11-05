# BE-307 — ตรวจ model TCrmMenuRelation

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-07`

## Goal

ตรวจ model `TCrmMenuRelation` ใน `prisma/jabjai-master-single-db/schema.prisma` ตรงกับ § Data Model — ความสัมพันธ์เมนูรองรับทั้ง DECLARED และ AI_SUGGESTED — โครงตารางต้องตรง design ก่อน endpoints อ้าง

## References

REQ-014, AC-014.1, DES-007, DEC-007

## Scope

งานยืนยัน/แก้ mapping ใน schema เท่านั้น — ไม่มี DDL ใหม่

- Security-sensitive: no

## Out of Scope

DDL/ตารางใน DB · model อื่น · การเพิ่ม field นอก § Data Model

## Expected Output

none

## Acceptance

AC-014.1: โครงตารางรองรับแหล่งที่มา `DECLARED`/`AI_SUGGESTED` และ `RelationType` ใน 3 ค่าที่กำหนด

## Dependencies

—

## Handoff

ตรวจ AC-014.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema
ส่งต่อ reviewer

Back-links: `INDEX.md`
