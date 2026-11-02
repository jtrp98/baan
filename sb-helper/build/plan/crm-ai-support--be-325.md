# BE-325 — accept NEW_MENU_RELATION → แถว + log คู่

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-16`

## Goal

เมื่อ accept `SuggestionType=NEW_MENU_RELATION` — สร้างแถวใหม่ `TCrmMenuRelation` (`Source=AI_SUGGESTED`, `Status=PENDING_REVIEW` เสมอ ไม่ auto-confirm) ให้ไหลเข้าคิว confirm ของ Phase 3a **และ** ในทรานแซกชันเดียวกันเขียนแถวคู่ `TCrmAiDecisionLog` (`SubjectType=MENU_RELATION`, `SubjectId=CrmMenuRelationId` ที่เพิ่งสร้าง, `DecisionType=MENU_CLASSIFICATION`) — log ล้ม rollback การ accept ทั้งก้อน — ข้อเสนอความสัมพันธ์ต้องเกิดทั้งแถวรอยืนยันและ audit คู่กันในทรานแซกชันเดียว — ขาดใดขาดหนึ่ง audit ไม่ครบ

## References

REQ-011, AC-011.1, REQ-014, AC-014.2, DES-008, DEC-008, DES-007, DEC-007

## Scope

ทรานแซกชันเดียว: สร้างแถว AI_SUGGESTED/PENDING_REVIEW + แถวคู่ log ตามตารางแมป — ใช้ payload ที่ขาด menu_a_id/menu_b_id/relation_type → AppError(422) ตาม DEC-007

- Security-sensitive: no

## Out of Scope

การ auto-confirm แถวใหม่ (ห้ามเด็ดขาด ต้องผ่านคิว 3a) · แถว log เดิม · schema

## Expected Output

none

## Acceptance

AC-011.1: accept ข้อเสนอสร้างแถวรอยืนยัน + audit คู่กันในทรานแซกชันเดียว — ไม่มี auto-apply
AC-014.2: แถวที่สร้างเป็น AI_SUGGESTED เริ่ม PENDING_REVIEW เสมอ

## Dependencies

—

## Handoff

ตรวจ AC-011.1/AC-014.2 ด้วย accept จริง: แถว relation + log คู่กัน, log ล้ม rollback ทั้งก้อน, payload ขาด 422 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
branch ของเส้นทาง accept — revert ได้ราย branch (แถวที่สร้างแล้วเป็นข้อมูล PENDING_REVIEW ปกติ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
