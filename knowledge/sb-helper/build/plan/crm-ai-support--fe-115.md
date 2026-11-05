# FE-115 — เมนู ตรวจสอบการจำแนกเคส AI

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-01`

## Goal

เพิ่มเมนู "ตรวจสอบการจำแนกเคส AI" (`news: true`) ใน `sidebar-component.tsx` — คนตรวจต้องมีทางเข้าคิวจากเมนูปกติ — ไม่สร้างทางเข้านอกโครง sidebar เดิม

## References

REQ-004, AC-004.2, DES-001, DEC-001

## Scope

เพิ่ม 1 entry ใน sidebar constant ใต้กลุ่มเมนูที่กำหนด — ไม่แตะเมนูอื่นและไม่แก้โครง sidebar

- Security-sensitive: yes

## Out of Scope

เมนูอื่นทั้งหมด · route ของหน้า (สร้างที่ task scaffold)

## Expected Output

none

## Acceptance

AC-004.2: ทางเข้าคิวตรวจสอบปรากฏบนเมนูและพาไปถึงหน้า review-queue ได้จริง

## Dependencies

—

## Handoff

ตรวจ AC-004.2 ด้วยการคลิกเมนูจริงเข้าหน้าคิว — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
entry เมนู additive — ลบรายบรรทัดคืนได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
