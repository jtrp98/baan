# FE-429 — เมนู จัดการบทบาทพนักงาน CRM AI

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-10`

## Goal

เพิ่มเมนู "จัดการบทบาทพนักงาน CRM AI" (`news: true`) ใน `sidebar-component.tsx` (ตั้งค่า ไม่ใช่หน้า workflow หลัก) — หน้าบทบาทเป็น settings — ทางเข้าต้องอยู่กลุ่มตั้งค่าตามลักษณะงาน

## References

REQ-016, AC-016.1, DES-006, DEC-006

## Scope

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

- Security-sensitive: no

## Out of Scope

เมนูอื่นทั้งหมด · route ของหน้า

## Expected Output

none

## Acceptance

AC-016.1: ทางเข้าหน้าบทบาทปรากฏบนเมนูและพาไปถึงหน้าจริง

## Dependencies

—

## Handoff

ตรวจ AC-016.1 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
entry เมนู additive — ลบรายบรรทัดคืนได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
