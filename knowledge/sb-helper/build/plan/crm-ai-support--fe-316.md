# FE-316 — scaffold menu-relations page

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P3-06`

## Goal

scaffold `src/app/pages/support/crm-ai/menu-relations/page.tsx` (SA/UX-UI-facing — สร้าง Declared + confirm/reject คิว Pending) — หน้าเดียวรวมการประกาศและคิวยืนยัน — คนตัดสินเห็นทั้งสองส่วนในที่เดียว

## References

REQ-014, AC-014.2, DES-007, DEC-007

## Scope

scaffold โครงหน้า — คิว Pending แสดงเฉพาะแถว PENDING_REVIEW · ตาราง/ฟอร์มแตกเป็น task ถัดไป

- Security-sensitive: no

## Out of Scope

หน้าอื่น · endpoint ฝั่ง BE · permission constant

## Expected Output

none

## Acceptance

AC-014.2: หน้าความสัมพันธ์เปิดได้จริง — คิวแถว PENDING_REVIEW พร้อมให้ยืนยัน/ปฏิเสธ

## Dependencies

—

## Handoff

ตรวจ AC-014.2 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
