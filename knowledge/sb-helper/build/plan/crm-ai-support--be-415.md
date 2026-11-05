# BE-415 — ContractRenewalAlertDate กรอกเอง + validate อนาคต

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-10`

## Goal

ปลดล็อกแล้ว (2026-08-18): `ContractRenewalAlertDate` **ไม่มีสูตรคำนวณ — Sales กรอกวันที่เอง** เสมอ (ห้ามอนุมานจาก `TargetDate`/`PromisedDate`) คอลัมน์ nullable/ไม่บังคับ — ที่ `POST`/`PATCH` เพิ่ม validation: ถ้ากรอกต้องเป็นวันที่**ในอนาคตนับจากวันที่บันทึก** ไม่งั้น `AppError(422)` (ยืนยันว่า `GET .../renewal-alerts` เป็นรายการ pull ตามที่ต้องการแล้ว ไม่ต้องมี job เพิ่ม) — ระบบไม่มีวันหมดสัญญาเก็บอยู่เลยจึงคำนวณอัตโนมัติไม่ได้ (มติ 2026-08-18) — validate วันอนาคตกันข้อมูลเตือนที่ผ่านมาแล้วตั้งแต่ปากทาง

## References

REQ-015, AC-015.2, AC-015.3, DES-010, DEC-010

## Scope

validation ที่ POST/PATCH เดิม — nullable ไม่บังคับ · วันปัจจุบัน/ย้อนหลัง → 422 · ห้าม default วันแทน Sales

- Security-sensitive: no

## Out of Scope

การอนุมานวันจาก field อื่น (ห้ามตาม DEC-010) · การบังคับกรอก (nullable คงเดิม) · schema

## Expected Output

none

## Acceptance

AC-015.2: วันเตือนมาจาก Sales เท่านั้น — กรอกอดีต/วันนี้ถูกปฏิเสธ 422
AC-015.3: ไม่กรอกได้ — แถวนั้นไม่มีการเตือนใดตลอดไป (ผลที่ยอมรับแล้ว)

## Dependencies

—

## Handoff

ตรวจ AC-015.2/AC-015.3 ด้วย dev server: กรอกอนาคตผ่าน / อดีต-วันนี้ 422 / ไม่กรอกผ่าน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
validation เพิ่มที่ schema/service — revert ได้ (แถวเก่าที่ผ่านมาแล้วไม่ถูกตรวจย้อน)
ส่งต่อ reviewer

Back-links: `INDEX.md`
