# FE-409 — ผูกสิทธิ์หน้าแทรกคิว

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-05`

## Goal

ผูกสิทธิ์เข้า `src/app/pages/admin/permission/page.tsx` — หน้าแทรกคิวควบคุมสิทธิ์จากหน้า permission กลางด้วยค่าเดิมของโมดูล

## References

REQ-016, AC-016.2, DES-006, DEC-006

## Scope

ผูก label/ค่า permission เข้าหน้า permission — reuse constant เดิม (Phase 3 เพิ่ม CRM_AI_PM ไว้แล้ว)

- Security-sensitive: no

## Out of Scope

ค่า permission constant (ห้ามเพิ่มใหม่) · หน้า workflow อื่น · guard ฝั่ง API

## Expected Output

none

## Acceptance

AC-016.2: สิทธิ์เข้าถึงหน้าแทรกคิวควบคุมจากหน้า permission กลางด้วยค่าเดิม

## Dependencies

—

## Handoff

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
