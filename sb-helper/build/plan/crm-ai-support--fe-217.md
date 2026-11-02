# FE-217 — knowledge table + form modal

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P2-06`

## Goal

`_components/knowledge-table.component.tsx`, `_components/knowledge-form-modal.component.tsx` — จัดการความรู้ต้องผ่าน Form Workflow มาตรฐานเดียวกันทั้งโมดูล

## References

REQ-008, AC-008.1, DES-008, DEC-008

## Scope

component ตาราง + ฟอร์ม modal — สร้าง/แก้ผ่าน endpoint ของ area เดียวกัน

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

## Expected Output

none

## Acceptance

AC-008.1: เพิ่ม/แก้ความรู้ผ่านฟอร์มบนหน้าได้จริงตาม Form Workflow มาตรฐาน

## Dependencies

—

## Handoff

ตรวจ AC-008.1 ด้วย CRUD จริงบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
