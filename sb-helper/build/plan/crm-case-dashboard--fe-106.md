# FE-106 — settings/csat page display-only

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-case-dashboard-P1-02`

## Goal

เขียนใหม่ `settings/csat/page.tsx` เป็น display-only (scale/rules/channels + preview card คงไว้เป็นตัวอย่าง static) + hint เดียวกับหน้า SLA — เหตุผลเดียวกับหน้า SLA — มติ Rev 2 ทำให้หน้า CSAT เป็นการแสดงผลล้วน

## References

REQ-005, AC-005.1, DES-005, DES-008, DEC-008

## Scope

แก้เฉพาะหน้า settings/csat + component ประกอบ — คง preview card เป็น static ตามแถวงาน ไม่มีฟอร์มแก้ค่า

- Security-sensitive: no

## Out of Scope

CSAT constant · endpoint settings/csat · ลูปส่ง/เก็บ CSAT เดิม

## Expected Output

none

## Acceptance

AC-005.1: หน้าแสดงชุด default ตาม constant ครบ (scale/rules/channels) และไม่มีทางแก้ค่าบนหน้าเว็บ

## Dependencies

—

## Handoff

ตรวจ AC-005.1 ด้วยการเทียบข้อมูลที่ render กับ API/constant + tsc/eslint — บันทึกเป็นหลักฐาน (verified แล้วตามแถวเดิม)
revert commit ของหน้านี้ได้เป็นเอกภาพ — ไม่กระทบ endpoint
ส่งต่อ reviewer

Back-links: `INDEX.md`
