# FE-122 — scaffold safety-keywords page

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-08`

## Goal

scaffold `src/app/pages/support/crm-ai/settings/safety-keywords/page.tsx` (Filter → Table CRUD) — หน้าจัดการคำสำคัญต้องเป็น CRUD มาตรฐานเดียวกับทั้งโมดูล — SA/PM จัดการเองได้โดยไม่แก้โค้ด

## References

REQ-004, AC-004.1, DES-001, DEC-001

## Scope

scaffold โครงหน้า CRUD ตาม /table skill — ตาราง/ฟอร์มแตกเป็น task ถัดไป

- Security-sensitive: yes

## Out of Scope

หน้าอื่น · endpoint ฝั่ง BE · permission constant

## Expected Output

none

## Acceptance

AC-004.1: หน้าจัดการคำสำคัญเปิดได้จริงด้วยโครง CRUD มาตรฐาน — พร้อมต่อข้อมูลจาก API

## Dependencies

—

## Handoff

ตรวจ AC-004.1 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
