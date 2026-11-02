# BE-101 — SLA settings constant

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P1-01`

## Goal

สร้าง `src/constants/crm-case-sla-setting.constant.ts` ตาม design § Data Contracts A — `CRM_CASE_SLA_SETTING_VERSION="v1"` + `CRM_CASE_SLA_CLOCK` + `CRM_CASE_SLA_EXCLUSIONS` + `CRM_CASE_SLA_TARGETS` (default จาก `sla-mock.data.ts`: P1 15นาที/1วัน · P2 1ชม./3วัน · P3 4ชม./7วัน · P4 1วันทำการ/14วัน · จ.–ศ. 08:30–17:30 · Critical 24ชม.) พร้อม comment หัวไฟล์ว่าแก้ค่า = bump version + deploy — SLA targets/clock/นาฬิกาทำการต้องมีแหล่งเดียวเป็น versioned code constant ที่ settings API และหน้าแสดงผลอ่านจากค่าเดียวกัน

## References

REQ-004, AC-004.1, DES-001, DES-004, DEC-004

## Scope

สร้าง constant ใหม่เฉพาะไฟล์เดียว ค่า default ตาม mockup ที่ยืนยันแล้ว — comment หัวไฟล์ระบุวิธีแก้ค่า (แก้ constant → bump `*_VERSION` → deploy)

- Security-sensitive: no

## Out of Scope

`crm-sla-rule.constant.ts` ของ crm-ai-support (คนละ concept — ห้าม reuse/แก้) · สคีมา/ตารางใด ๆ · ไฟล์ constant อื่นของโมดูลอื่น

## Expected Output

Contract:CrmCaseSlaSetting.v1

## Acceptance

AC-004.1: ค่า default ใน constant ตรงชุด mockup ที่ยืนยันแล้วทุกแถว (targets/clock/exclusions) เป็นค่าเริ่มต้นจริง ไม่ใช่ placeholder

## Dependencies

—

## Handoff

ตรวจ AC-004.1 ด้วยการเทียบค่า constant กับ `sla-mock.data.ts` เดิมทีละแถว + `tsc`/`eslint` ผ่าน — บันทึก diff/ผลคำสั่งไว้เป็นหลักฐาน (งานนี้ verified แล้วตามแถวเดิม)
constant เป็นไฟล์ใหม่ additive — ลบไฟล์คืนสภาพเดิมได้ ไม่กระทบ consumer ภายนอก
ส่งต่อ reviewer

Back-links: `INDEX.md`
