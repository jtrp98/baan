# FE-341 — scaffold ai-suggestions inbox page

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P3-11`

## Goal

scaffold `src/app/pages/support/crm-ai/ai-suggestions/page.tsx` (Support Lead/SA/PM-facing inbox, กรองตาม role ที่มีสิทธิ์ตัดสินใจ `SuggestionType` นั้น) — inbox แสดงข้อเสนอที่ตัวเองมีสิทธิ์ตัดสิน — ลดคิวที่กดไม่ได้ปนมาให้เห็น

## References

REQ-011, AC-011.1, DES-008, DEC-008

## Scope

scaffold โครงหน้า — กรองตามบทบาทผู้ใช้ที่ log in · ตาราง/drawer แตกเป็น task ถัดไป

- Security-sensitive: no

## Out of Scope

หน้าอื่น · endpoint ฝั่ง BE · permission constant

## Expected Output

none

## Acceptance

AC-011.1: inbox เปิดได้จริงและกรองข้อเสนอตามสิทธิ์ตัดสินของผู้ใช้

## Dependencies

—

## Handoff

ตรวจ AC-011.1 ด้วยบัญชีแต่ละบทบาทเทียบรายการที่เห็น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
