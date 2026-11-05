# FE-423 — customer-promise store + service

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-ai-support-P4-09`

## Goal

`_stores/use-customer-promise-store.ts`, `_api/customer-promise-service.ts` — state และการเรียก API ของหน้าคำสัญญารวมที่เดียวเหมือนทุกหน้าของโมดูล

## References

REQ-015, AC-015.1, DES-010, DEC-010

## Scope

store + service ของหน้า customer-promises (รวม renewal-alerts) — pattern เดียวกับหน้าอื่น

- Security-sensitive: no

## Out of Scope

store/service ของหน้าอื่น · endpoint ฝั่ง BE

## Expected Output

none

## Acceptance

AC-015.1: หน้าคำสัญญาโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

## Dependencies

—

## Handoff

ตรวจ AC-015.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
ไฟล์ใหม่ — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
