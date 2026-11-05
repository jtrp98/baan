# FE-422 — customer-promise table + form (date picker)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-08`

## Goal

`_components/customer-promise-table.component.tsx`, `_components/customer-promise-form-modal.component.tsx` — ฟอร์มมีช่อง `ContractRenewalAlertDate` เป็น date picker แบบไม่บังคับ (nullable) พร้อม client-side validate ว่าต้องเป็นวันในอนาคตถ้ากรอก (สะท้อน validation ฝั่ง backend ไม่ใช่สูตรคำนวณอัตโนมัติ) — ฟอร์มต้องตรงกติกา backend (กรอกเอง/ไม่บังคับ/ต้องเป็นอนาคต) — client validate ให้ error เกิดก่อนยิง API

## References

REQ-015, AC-015.2, AC-015.3, DES-010, DEC-010

## Scope

component ตาราง + ฟอร์ม modal — date picker nullable + client validation ตรงกติกา backend · ไม่มีการคำนวณวันแทนผู้ใช้

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · การอนุมาน/default วันเตือน (ห้าม) · scaffold หน้า (task อื่น)

## Expected Output

none

## Acceptance

AC-015.2: กรอกวันเตือนผ่าน date picker ได้จริง — ค่าอดีต/วันนี้ถูกกันทั้งฝั่ง client และ backend
AC-015.3: ไม่กรอกได้จริง — ฟอร์มไม่บังคับและไม่มีค่า default แทนผู้ใช้

## Dependencies

—

## Handoff

ตรวจ AC-015.2/AC-015.3 ด้วยการกรอกจริงทั้ง 3 กรณี (อนาคต/อดีต/ไม่กรอก) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
component ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
