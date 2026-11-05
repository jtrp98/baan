# FE-431 — staff-role table + form modal

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-12`

## Goal

`_components/staff-role-table.component.tsx`, `_components/staff-role-form-modal.component.tsx` — ดู/จัดการบทบาทผ่าน component มาตรฐานเดียวกันทั้งโมดูล

## References

REQ-016, AC-016.1, DES-006, DEC-006

## Scope

component ตาราง + ฟอร์ม modal — เรียก endpoints ของ area เดียวกัน (toggle Active ผ่าน PATCH)

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

## Expected Output

none

## Acceptance

AC-016.1: ดู/ปิด-เปิดบทบาทผ่านหน้าจอได้จริง — ไม่มีปุ่มลบแถว

## Dependencies

—

## Handoff

ตรวจ AC-016.1 ด้วยการใช้งานจริงบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
