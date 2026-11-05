# FE-215 — issue store + service

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P2-04`

## Goal

`_stores/use-issue-store.ts`, `_api/issue-service.ts` — state และการเรียก API ของหน้าเรื่องรวมที่เดียวเหมือนทุกหน้าของโมดูล

## References

REQ-010, AC-010.1, DES-008, DEC-008

## Scope

store + service ของหน้า issues — pattern เดียวกับหน้าอื่น

- Security-sensitive: no

## Out of Scope

store/service ของหน้าอื่น · endpoint ฝั่ง BE

## Expected Output

none

## Acceptance

AC-010.1: หน้าเรื่องโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

## Dependencies

—

## Handoff

ตรวจ AC-010.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
