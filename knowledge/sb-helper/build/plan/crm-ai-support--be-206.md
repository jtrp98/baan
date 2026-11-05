# BE-206 — PATCH /issues/[id] + DecisionReason

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P2-06`

## Goal

เพิ่ม `PATCH /api/v2/support/crm-ai/issues/[id]` — อัปเดต `Status`/`RootCause`/`Severity` — บังคับ `DecisionReason` ที่ app layer เมื่อ `Status=DECLINED` (PM เท่านั้นที่ approve/decline ได้) — การปฏิเสธเรื่องต้องมีเหตุผลตาม AC-008.3 — บังคับที่ app layer จึงไม่มีทางปิดเรื่องเงียบ ๆ

## References

REQ-008, AC-008.3, DES-008, DEC-008

## Scope

update field ที่อนุญาต — approve/decline สงวน PM · `DecisionReason` บังคับเมื่อ DECLINED

- Security-sensitive: no

## Out of Scope

เคส/assessment ที่ผูกอยู่ · schema · permission constant

## Expected Output

none

## Acceptance

AC-008.3: เรื่องที่ปฏิเสธ (DECLINED) มีเหตุผลบันทึกเสมอ และการตัดสินเป็นของ PM เท่านั้น

## Dependencies

—

## Handoff

ตรวจ AC-008.3 ด้วย dev server: DECLINED ไม่มี reason ต้องถูกปฏิเสธ + สิทธิ์ non-PM ต้อง 403 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
