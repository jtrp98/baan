# FE-213 — issue table + detail drawer

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P2-02`

## Goal

`_components/issue-table.component.tsx`, `_components/issue-detail-drawer.component.tsx` (ปุ่ม approve/decline ใช้ `StatusModalComponent` type "confirm"/"delete") — approve/decline เป็นการตัดสินของ PM — ต้องผ่าน confirm modal มาตรฐานและแสดงรายละเอียดครบก่อนกด

## References

REQ-008, AC-008.3, DES-008, DEC-008

## Scope

component ตาราง + drawer — ตาม Form Workflow มาตรฐานของโมดูล

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · หน้า scaffold (task อื่น)

## Expected Output

none

## Acceptance

AC-008.3: PM กด approve/decline จากหน้าจอได้จริงผ่าน modal มาตรฐาน — ข้อมูลเรื่องแสดงครบใน drawer

## Dependencies

—

## Handoff

ตรวจ AC-008.3 ด้วยการกดจริงทั้งสองทาง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
