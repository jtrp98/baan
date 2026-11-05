# BE-203 — POST /issues (SA/PM)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P2-03`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/issues` — สร้างเรื่องใหม่ (SA/PM) ตาม design § Classification & Safety Override Rules ข้อ 6 ที่ระบุ SA/PM เป็นคน group เข้า `TCrmIssue` เอง (แก้จาก SA เท่านั้น เดิม) — การ group เป็นการตัดสินใจของคนสองบทบาทตาม design — ล็อกสิทธิ์ตรง design จึงไม่มีทางต่างกันระหว่างเอกสารกับโค้ด

## References

REQ-010, AC-010.1, DES-008, DEC-008

## Scope

route/service ตาม pattern โมดูล — guard สิทธิ์ SA/PM (`CRM_AI_SA`/`CRM_AI_PM`) · ไม่แตะ schema

- Security-sensitive: no

## Out of Scope

schema · permission constant · endpoint อื่น

## Expected Output

none

## Acceptance

AC-010.1: สร้างเรื่องใหม่ผ่าน endpoint ได้โดย SA/PM — เคสยังไม่ถูกผูกจนกว่าจะใช้ link-case

## Dependencies

—

## Handoff

ตรวจ AC-010.1 ด้วย dev server: สร้างเรื่องสำเร็จ + 403 เมื่อสิทธิ์ไม่ใช่ SA/PM — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
