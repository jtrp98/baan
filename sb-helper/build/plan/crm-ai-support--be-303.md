# BE-303 — POST /product-features (PM)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-03`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/product-features` — สร้าง feature ใหม่ (auth + `CRM_AI_PM` เท่านั้น) — แคตตาล็อกเป็นของ PM (`OwnerAdminId`) — จุดสร้างเดียวล็อกสิทธิ์และสถานะเริ่มต้นของ registry ตามสัญญา

## References

REQ-013, AC-013.1, DES-007, DEC-007

## Scope

route/service ตาม pattern โมดูล — guard `CRM_AI_PM` · สถานะเริ่ม PLANNED ตามสัญญา · ไม่แตะ schema

- Security-sensitive: no

## Out of Scope

สถานะเริ่มต้นนอก PLANNED · schema · permission constant (task BE-crm-ai-support-P3-01)

## Expected Output

Contract:CrmAiFeatureMenuRelation.v1

## Acceptance

AC-013.1: สร้างฟีเจอร์ใหม่ได้โดย PM เท่านั้น — สถานะเริ่มต้นตามชุดที่กำหนด ไม่มีค่า AVAILABLE

## Dependencies

—

## Handoff

ตรวจ AC-013.1 ด้วย dev server: สร้างสำเร็จ + 403 non-PM + สถานะเริ่มต้นถูกต้อง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
