# FE-318 — menu-relation store + service

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P3-08`

## Goal

`_stores/use-menu-relation-store.ts`, `_api/menu-relation-service.ts` — state และการเรียก API ของหน้าความสัมพันธ์รวมที่เดียวเหมือนทุกหน้าของโมดูล

## References

REQ-014, AC-014.1, DES-007, DEC-007

## Scope

store + service ของหน้า menu-relations — pattern เดียวกับหน้าอื่น

- Security-sensitive: no

## Out of Scope

store/service ของหน้าอื่น · endpoint ฝั่ง BE

## Expected Output

none

## Acceptance

AC-014.1: หน้าความสัมพันธ์โหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

## Dependencies

—

## Handoff

ตรวจ AC-014.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
