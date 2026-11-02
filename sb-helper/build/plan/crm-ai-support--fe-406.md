# FE-406 — scaffold queue-interrupts page

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-02`

## Goal

scaffold `src/app/pages/support/crm-ai/queue-interrupts/page.tsx` (PM-facing — ฟอร์มเดียวกรอก justification + ตัดสินใจ, ตาราง history) — ฟอร์มเดียวจบตรงกับข้อจำกัด schema (บันทึกคำขอ+ตัดสินพร้อมกัน) — ออกแบบ 2 ขั้นจะขัด NOT NULL ทันที

## References

REQ-012, AC-012.2, DES-009, DEC-009

## Scope

scaffold โครงหน้า — ฟอร์มเดียวรวม justification + ผลตัดสิน · ตาราง/ฟอร์มแตกเป็น task ถัดไป

- Security-sensitive: no

## Out of Scope

หน้าอื่น · endpoint ฝั่ง BE · การแตกฟอร์มเป็น 2 ขั้น (ขัด schema)

## Expected Output

none

## Acceptance

AC-012.2: หน้าแทรกคิวเปิดได้จริงด้วยฟอร์มเดียวจบ — พร้อมต่อ API บันทึกคำขอ+ตัดสินพร้อมกัน

## Dependencies

—

## Handoff

ตรวจ AC-012.2 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
