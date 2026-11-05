# FE-123 — safety-keyword table + form modal

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-09`

## Goal

`_components/safety-keyword-table.component.tsx` + `_components/safety-keyword-form-modal.component.tsx` (ใช้ `StatusModalComponent`/Form Workflow มาตรฐาน) — CRUD คำสำคัญต้องผ่าน Form Workflow เดียวกันทั้งโมดูล (Modal confirm → API → StatusModalComponent) — UX และ error path เดียวกัน

## References

REQ-004, AC-004.1, DES-001, DEC-001

## Scope

component ตาราง + ฟอร์ม modal เดี่ยว — เพิ่ม/แก้/ปิดใช้/ลบ ผ่าน endpoint ของ area เดียวกัน

- Security-sensitive: yes

## Out of Scope

endpoint ฝั่ง BE · หน้า scaffold (task อื่น)

## Expected Output

none

## Acceptance

AC-004.1: เพิ่ม/แก้ไข/ปิดใช้งานคำสำคัญผ่านฟอร์มบนหน้าได้จริงตาม Form Workflow มาตรฐาน

## Dependencies

—

## Handoff

ตรวจ AC-004.1 ด้วย CRUD จริงบนหน้า (สำเร็จ + error path) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
