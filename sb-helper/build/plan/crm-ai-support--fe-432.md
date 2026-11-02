# FE-432 — staff-role store + service

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-13`

## Goal

`_stores/use-staff-role-store.ts`, `_api/staff-role-service.ts` — state และการเรียก API ของหน้าบทบาทรวมที่เดียวเหมือนทุกหน้าของโมดูล

## References

REQ-016, AC-016.1, DES-006, DEC-006

## Scope

store + service ของหน้า settings/staff-roles — pattern เดียวกับหน้าอื่น

- Security-sensitive: no

## Out of Scope

store/service ของหน้าอื่น · endpoint ฝั่ง BE

## Expected Output

none

## Acceptance

AC-016.1: หน้าบทบาทโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

## Dependencies

—

## Handoff

ตรวจ AC-016.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
