# BE-417 — POST /staff-roles (PM)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P4-12`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/staff-roles` — assign functional role ให้ admin คนหนึ่ง (`CRM_AI_PM`) — อนุญาตหลายแถวต่อ `AdminId` ตาม design (คนละความหมายกับ Timesheet `User.role_id`) — หนึ่งคนถือได้หลายบทบาท — ห้ามอาศัย unique ต่อคนและห้ามสับสนกับระบบ role ของ Timesheet

## References

REQ-016, AC-016.1, AC-016.3, DES-006, DEC-006

## Scope

route/service ตาม pattern โมดูล — guard `CRM_AI_PM` · หลายแถวต่อ AdminId ได้ · ไม่เพิ่ม constraint ใด

- Security-sensitive: no

## Out of Scope

unique constraint ใหม่ (ห้ามเพิ่มเอง) · Timesheet `User.role_id` (คนละความหมาย) · schema

## Expected Output

none

## Acceptance

AC-016.1: assign หลายบทบาทให้คนเดียวได้จริง — แต่ละแถว FunctionalRole ใน 6 ค่าที่กำหนด
AC-016.3: ผู้ใช้ที่ยังไม่มีสิทธิ์ CRM AI จะไม่มีแถวบทบาทเกิดขึ้นผ่าน flow ปกติ (derive จากสิทธิ์)

## Dependencies

—

## Handoff

ตรวจ AC-016.1/AC-016.3 ด้วย dev server: assign สำเร็จ + หลายแถวต่อคน + 403 non-PM — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
