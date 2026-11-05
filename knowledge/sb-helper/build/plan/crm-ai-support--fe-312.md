# FE-312 — scaffold product-features page

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P3-02`

## Goal

scaffold `src/app/pages/support/crm-ai/product-features/page.tsx` (PM CRUD เต็มรูปแบบ, Sales เห็นแบบ read-only ไม่มีปุ่มแก้ไข) — สองบทบาทใช้หน้าเดียวกันต่างสิทธิ์ — ซ่อนปุ่มแก้จาก Sales ตามสัญญา read-only

## References

REQ-013, AC-013.2, DES-007, DEC-007

## Scope

scaffold โครงหน้า — สิทธิ์กำหนดปุ่มแก้ (PM เท่านั้น) · ตาราง/ฟอร์มแตกเป็น task ถัดไป

- Security-sensitive: no

## Out of Scope

หน้าอื่น · endpoint ฝั่ง BE · permission constant

## Expected Output

none

## Acceptance

AC-013.2: หน้าแคตตาล็อกเปิดได้จริง — PM เห็นปุ่มแก้ Sales อ่านอย่างเดียว

## Dependencies

—

## Handoff

ตรวจ AC-013.2 ด้วยบัญชี PM และ Sales จริงเทียบปุ่มที่เห็น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
