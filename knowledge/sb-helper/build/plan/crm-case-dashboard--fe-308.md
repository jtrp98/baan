# FE-308 — sidebar path check after refactor

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-case-dashboard-P3-04`

## Goal

ตรวจ sidebar entries เดิม (`sidebar-menu-constant.tsx` ใต้ `MENU_SUPPORT_CRM`) ยังชี้ path ถูกหลัง refactor — ไม่เพิ่มเมนูใหม่ (มีอยู่แล้ว) — การ rename route/ผูกหน้าใหม่ต้องไม่ทำให้ทางเข้าเดิมในเมนูพัง — เป็นการตรวจเท่านั้น ไม่เพิ่มของใหม่

## References

REQ-002, REQ-003, AC-002.3, AC-003.1, DES-008

## Scope

เป็น task ตรวจ/แก้ path ใน constant เท่านั้น — ห้ามเพิ่ม/ลบเมนู (โครงเมนูเดิมคงอยู่)

- Security-sensitive: no

## Out of Scope

โครง sidebar ส่วนอื่นที่ไม่ใช่ crm · route ของหน้า

## Expected Output

none

## Acceptance

AC-002.3: ทางเข้าหน้ากลุ่ม/เคสจาก sidebar เดิน drill-down ได้ครบหลัง refactor
AC-003.1: ทางเข้าหน้าโรงเรียนจาก sidebar ชี้ `[schoolId]` ถูกต้อง

## Dependencies

—

## Handoff

ตรวจ AC-002.3 และ AC-003.1 ด้วยการคลิกทางเข้าจาก sidebar จริงทุก entry ใต้ MENU_SUPPORT_CRM — เก็บผลเป็นหลักฐานก่อนปิด task
แก้เฉพาะค่า path ใน constant — revert รายบรรทัดได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
