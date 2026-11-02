# BE-324 — accept ซ้ำ → AppError(409)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-15`

## Goal

แก้เส้นทาง accept กรณีแถว `Status != 'PENDING'` แล้ว (กดซ้ำ) ให้ตอบ `AppError(409)` — ไม่เขียนทั้งผลจริงและ decision log รอบสอง (append-only ลบแถวซ้ำทีหลังไม่ได้) — แถว audit append-only ล้างซ้ำไม่ได้ — กันซ้ำที่ปากทางจึงไม่มี audit ปลอมเกิดเลย

## References

REQ-011, AC-011.1, DES-008, DEC-008

## Scope

เช็คสถานะปัจจุบันก่อนทรานแซกชัน — ไม่ใช่ PENDING → 409 ทันที ไม่เขียนอะไรทั้งสองตาราง

- Security-sensitive: no

## Out of Scope

แถวที่ตัดสินไปแล้ว (ห้ามแก้) · การเขียน log รอบสองในทางใด · schema

## Expected Output

none

## Acceptance

AC-011.1: กด accept ซ้ำถูกปฏิเสธ 409 — ไม่มีแถว audit ซ้ำเกิดขึ้นในตาราง append-only

## Dependencies

—

## Handoff

ตรวจ AC-011.1 ด้วยการกด accept สองครั้งจริง — ครั้งสอง 409 + นับแถว log ไม่เพิ่ม — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
เงื่อนไข branch เดียว — revert ได้ (แต่ต้องคงกันซ้ำเพราะ append-only)
ส่งต่อ reviewer

Back-links: `INDEX.md`
