# BE-424 — constant map สิทธิ์→บทบาท 6 คู่

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-15`

## Goal

สร้าง constant map ตัวเดียว (map 6 คู่ตรงตัว): `CRM_AI_CS→CS` · `CRM_AI_SA→SA` · `CRM_AI_PM→PM` · `CRM_AI_UX_UI→UX_UI` · `CRM_AI_DEV→DEV` · `CRM_AI_SALES→SALES` — ใช้ร่วมกันทุกจุด sync ห้ามเขียน string ซ้ำ (`PERMISSIONS.ADMIN_ACCESS` ไม่ derive อะไรทั้งสิ้น) ตาม design § Staff Role Sync Rules ข้อ 1/2 — map ตรงตัวเป็นสัญญาของการ derive ทางเดียว — กระจาย string จะเพี้ยนจุดใดจุดหนึ่งโดยไม่รู้ตัว

## References

REQ-016, AC-016.1, DES-006, DEC-006

## Scope

ไฟล์ constant เดียว — map 6 คู่เท่านั้น · `ADMIN_ACCESS` ไม่อยู่ใน map · ทุกจุด sync import จากที่นี่เดียว

- Security-sensitive: no

## Out of Scope

ค่า permission constant (อ่านอย่างเดียว) · การเพิ่มคู่นอก 6 ค่า · Timesheet `User.role_id`

## Expected Output

Contract:CrmAiStaffRoleSync.v1

## Acceptance

AC-016.1: การแปลสิทธิ์เป็นบทบาทใช้ map ตรงตัว 6 คู่จากที่เดียว — `FunctionalRole` ตรงชุด 6 ค่าที่กำหนด

## Dependencies

—

## Handoff

ตรวจ AC-016.1 ด้วยการเทียบ map กับ design § ข้อ 1 ทีละคู่ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ใหม่ additive — แก้ map ภายหลังต้องผ่าน design amend ก่อน (เป็นสัญญา)
ส่งต่อ reviewer

Back-links: `INDEX.md`
