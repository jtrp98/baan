# FE-125 — ผูกสิทธิ์ 2 หน้าเข้า permission page

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P1-11`

## Goal

ผูกสิทธิ์หน้า review-queue และ settings/safety-keywords เข้า `src/app/pages/admin/permission/page.tsx` ตาม `PERMISSIONS.CRM_AI_*` (feature จริง ไม่ใช่ POC — ต้อง sync ตาม CLAUDE.md § 5.6) — สิทธิ์ที่ไม่ผูกหน้าจริงจะกลายเป็น POC — ผู้ดูแลต้องมอบ/ถอนสิทธิ์จากหน้า permission กลางได้จริง

## References

REQ-016, AC-016.2, DES-006, DEC-006

## Scope

แตะเฉพาะการผูก label/ค่า permission เข้าหน้า admin/permission — ไม่สร้าง permission ใหม่ (ใช้ constant จาก BE-crm-ai-support-P1-05)

- Security-sensitive: yes

## Out of Scope

ค่า permission constant (task BE-crm-ai-support-P1-05) · หน้า workflow อื่น · guard ฝั่ง API

## Expected Output

none

## Acceptance

AC-016.2: มอบ/ถอนสิทธิ์ CRM AI จากหน้า permission กลางแล้วผลถึงการเข้าถึงหน้าจอ 2 หน้านี้จริง

## Dependencies

—

## Handoff

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
การผูกเป็นข้อมูล/ไฟล์ของหน้า permission — revert รายจุดได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
