# BE-404 — bottlenecks endpoints

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P4-04`

## Goal

`GET/POST /api/v2/support/crm-case/insights/bottlenecks` + `[id]` PATCH/ARCHIVE — guard `CRM_AI_SA` (write) / `MENU_SUPPORT_CRM` (read) — การเขียน insight bottleneck สงวนให้ SA เท่านั้น — การแยก guard read/write ต้องตรงตามสิทธิ์ที่ design กำหนด

## References

REQ-006, AC-006.1, AC-006.2, DES-006, DES-007, DEC-007

## Scope

guard แยกไฟล์ตาม contract API — write ใช้ `CRM_AI_SA`, read ใช้ `MENU_SUPPORT_CRM` — POST/PATCH ต้อง validate ผ่าน schema ของ kind นี้และ error ผ่าน `handleError(err, "[CRM_CASE_DASHBOARD_...]")`

- Security-sensitive: no

## Out of Scope

ค่า permission เดิม (ไม่สร้าง permission ใหม่) · repository ของ kind อื่น · สคีมาใด ๆ

## Expected Output

none

## Acceptance

AC-006.1: bottleneck ถูกกรอก/แก้ผ่าน endpoint ได้จริง (ฟอร์มฝั่ง SA จะใช้ endpoint นี้) — ไม่มี auto-detect
AC-006.2: ทุก write ผ่าน Zod ตาม contract และเก็บบน `TCrmKnowledgeEntry` Category `INSIGHT_BOTTLENECK` ด้วย workflow เดิม

## Dependencies

—

## Handoff

ตรวจ AC-006.1/AC-006.2 ด้วย dev server: 401/403 เมื่อสิทธิ์ไม่พอ (ทั้ง read/write), 400 เมื่อ AnswerBody ไม่ผ่าน Zod, CRUD สำเร็จเก็บถูก Category — เก็บผลเป็นหลักฐานก่อนปิด task
endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบข้อมูลเดิม
ส่งต่อ reviewer

Back-links: `INDEX.md`
