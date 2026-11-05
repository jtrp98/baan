# BE-306 — PATCH /product-features/[id]

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-06`

## Goal

เพิ่ม `PATCH /api/v2/support/crm-ai/product-features/[id]` — แก้ `Status`/`StatusReason`/`OwnerAdminId`/`MenuId` (`CRM_AI_PM`) — บังคับ `StatusReason` ที่ app layer เมื่อ `Status=DECLINED` ตาม design § Feature Registry & Menu Relation Rules ข้อ 1 — สถานะแคตตาล็อกเดินตามลำดับที่สัญญากำหนด — การปฏิเสธต้องมีเหตุผล และการ ship จริงผูก MenuId กลับมาที่แถวฟีเจอร์

## References

REQ-013, AC-013.1, AC-013.3, DES-007, DEC-007

## Scope

update field ที่อนุญาตโดย PM — `StatusReason` บังคับเมื่อ DECLINED · `MenuId` ผูกเมื่อ ship จริง

- Security-sensitive: no

## Out of Scope

ชุดสถานะ (ไม่มี AVAILABLE/DORMANT) · schema · permission constant

## Expected Output

none

## Acceptance

AC-013.1: สถานะเปลี่ยนภายในชุด 4 ค่าที่กำหนด — DECLINED มี StatusReason เสมอ
AC-013.3: เมื่อฟีเจอร์ ship จริง ระบบผูก `MenuId` กลับมาที่แถวฟีเจอร์นั้นได้จริง

## Dependencies

—

## Handoff

ตรวจ AC-013.1/AC-013.3 ด้วย dev server: เปลี่ยนสถานะทุกทาง + DECLINED ไม่มี reason ต้อง 4xx — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
