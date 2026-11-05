# FE-219 — เมนู จัดการเรื่อง/ความรู้ AI

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P2-08`

## Goal

เพิ่มเมนู "จัดการเรื่อง/ความรู้ AI" (`news: true`) ใน `sidebar-component.tsx` (แยก 2 เมนูย่อย "จัดการเรื่อง (Issue)" และ "คลังความรู้ (AI)" ใน `sidebar-menu-constant.tsx`) — สองหน้าใหม่ต้องมีทางเข้าจากเมนูปกติ — แยกเมนูย่อยตามผู้ใช้ (SA/PM กับ CS)

## References

REQ-010, AC-010.1, DES-008, DEC-008

## Scope

เพิ่ม 2 เมนูย่อยใน sidebar constant — ไม่แตะเมนูอื่น

- Security-sensitive: no

## Out of Scope

เมนูอื่นทั้งหมด · route ของหน้า

## Expected Output

none

## Acceptance

AC-010.1: ทางเข้าหน้าเรื่อง/ความรู้ปรากฏบนเมนูและพาไปถึงหน้าจริงได้

## Dependencies

—

## Handoff

ตรวจ AC-010.1 ด้วยการคลิกเมนูจริงทั้งสองทางเข้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
entry เมนู additive — ลบรายบรรทัดคืนได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
