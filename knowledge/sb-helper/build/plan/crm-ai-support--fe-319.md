# FE-319 — ผูกสิทธิ์หน้า feature/menu-relation

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P3-09`

## Goal

ผูกสิทธิ์ทั้งสองหน้าเข้า `src/app/pages/admin/permission/page.tsx` ตาม `PERMISSIONS.CRM_AI_*` ใหม่ — สิทธิ์ role ใหม่ 3 ตัวต้องผูกหน้าจอจริงจากหน้า permission กลาง — ไม่มีทางเข้านอกการมอบสิทธิ์

## References

REQ-016, AC-016.2, DES-006, DEC-006

## Scope

ผูก label/ค่า permission เข้าหน้า permission — ใช้ constant จาก BE-crm-ai-support-P3-01 เท่านั้น

- Security-sensitive: no

## Out of Scope

ค่า permission constant (task BE-crm-ai-support-P3-01) · หน้า workflow อื่น · guard ฝั่ง API

## Expected Output

none

## Acceptance

AC-016.2: มอบ/ถอนสิทธิ์ role ใหม่จากหน้า permission กลางแล้วผลถึงหน้าจอ 2 หน้าจริง

## Dependencies

—

## Handoff

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
