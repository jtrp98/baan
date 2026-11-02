# FE-340 — เมนู กล่องข้อเสนอ AI

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P3-10`

## Goal

เพิ่มเมนู "กล่องข้อเสนอ AI" (`news: true`) ใน `sidebar-component.tsx` — inbox ข้อเสนอต้องมีทางเข้าจากเมนูปกติสำหรับ reviewer ทุกบทบาท

## References

REQ-011, AC-011.1, DES-008, DEC-008

## Scope

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

- Security-sensitive: no

## Out of Scope

เมนูอื่นทั้งหมด · route ของหน้า

## Expected Output

none

## Acceptance

AC-011.1: ทางเข้ากล่องข้อเสนอปรากฏบนเมนูและพาไปถึงหน้า inbox จริง

## Dependencies

—

## Handoff

ตรวจ AC-011.1 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
entry เมนู additive — ลบรายบรรทัดคืนได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
