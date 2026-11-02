# BE-321 — GET /ai-suggestions inbox

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-12`

## Goal

เพิ่ม `GET /api/v2/support/crm-ai/ai-suggestions` — inbox list พร้อม pagination + filter (`SuggestionType`/`Status=PENDING` default) — คิวข้อเสนอต้องดึงเฉพาะแถวที่รอคนตัดสินเป็นค่าเริ่มต้น — แถวที่ตัดสินแล้วไม่ปนคิว

## References

REQ-011, AC-011.1, DES-008, DEC-008

## Scope

read endpoint — default filter `Status=PENDING` · pagination + filter ตาม pattern โมดูล

- Security-sensitive: no

## Out of Scope

แถว suggestion (อ่านอย่างเดียว) · schema · endpoint อื่น

## Expected Output

Contract:CrmAiLearningLoop.v1

## Acceptance

AC-011.1: ทุกสัญญาณที่ตรวจพบปรากฏใน inbox เป็น PENDING — ไม่มีแถวถูก auto-apply ก่อนคนตัดสิน

## Dependencies

—

## Handoff

ตรวจ AC-011.1 ด้วย dev server: inbox เห็นเฉพาะ PENDING เป็นค่าเริ่มต้น + filter/pagination ทำงาน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
