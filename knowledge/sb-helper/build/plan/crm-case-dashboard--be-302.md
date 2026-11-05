# BE-302 — GET /groups/[type]/[groupId] detail + cases

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P3-02`

## Goal

`GET /api/v2/support/crm-case/groups/[type]/[groupId]` — groupId = MenuId หรือ `"none"` · รายละเอียดกลุ่ม + เคส pagination บังคับ (`buildPagination`) ✅ — drill-down จากกลุ่มไปรายการเคสต้องระบุกลุ่มได้ทั้งกรณีมี/ไม่มี MenuId และ list ทุกใบต้อง pagination เสมอ

## References

REQ-002, AC-002.3, DES-002, DES-007

## Scope

groupId รับค่า `MenuId` หรือ literal `"none"` — pagination บังคับด้วย `buildPagination` ตาม contract API ของโมดูล

- Security-sensitive: no

## Out of Scope

นิยามกลุ่ม/อันดับ (task BE-crm-case-dashboard-P3-01) · สคีมาใด ๆ

## Expected Output

none

## Acceptance

AC-002.3: ไล่จากกลุ่มเข้ารายการเคสได้ทั้งกรณีกลุ่มมี MenuId และกลุ่ม "none" — รายการเคสแบ่งหน้าได้จริง

## Dependencies

—

## Handoff

ตรวจ AC-002.3 ด้วยการเรียก endpoint ทั้ง 2 รูปแบบ groupId + ตรวจ pagination params + tsc/eslint (verified แล้วตามแถวเดิม)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
