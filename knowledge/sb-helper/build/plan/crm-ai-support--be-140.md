# BE-140 — menu-only path (Mode B)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-25`

## Goal

แยก menu-only classification path ออกจาก `classificationService.classify()` เต็มรูปแบบ — เขียนเฉพาะ `MenuId` (บน `TCrmSupport`) + `MenuConfidence`/`MenuReasoning`/`MenuReviewStatus` (บน assessment) + แถว log `MENU_CLASSIFICATION` เท่านั้น ห้ามแตะ `AiCategory`/`Severity`/`AiConfidence`/`AiReasoning`/`ReviewStatus`/`SeverityReviewStatus`/`SafetyOverride`/`ComputedPriorityScore`/คอลัมน์ `*ReviewedBy`/`*ReviewedAt` ใด ๆ (Mode B) ใช้ `classifyMenuOnlyWithGemini()` ที่มีอยู่แล้ว — กวาดเมนูซ้ำต้องไม่เขียนทับผลจำแนกหลักที่คนตรวจแก้ไว้แล้ว — path แยกเด็ดขาดจึงเป็นเกราะของ Mode B

## References

REQ-007, AC-007.1, REQ-006, AC-006.3, DES-004, DEC-004, DES-002, DEC-002

## Scope

path ใหม่แยกจาก classify เต็ม — ขอบเขตเขียนล็อกเฉพาะ field เมนูทุกจุด · error จัดการแบบ best-effort แยก (DEC-002) ไม่ retry ในจุดเดียวกัน

- Security-sensitive: yes

## Out of Scope

`AiCategory`/`Severity`/`ReviewStatus`/`SeverityReviewStatus`/`SafetyOverride`/`ComputedPriorityScore`/`*ReviewedBy`/`*ReviewedAt` — ห้ามเขียนเด็ดขาด · schema

## Expected Output

none

## Acceptance

AC-007.1: กวาดเมนูที่ล้มได้ผ่าน path menu-only จริง — กลไกเดียวกับ backfill
AC-006.3: การกวาดซ้ำไม่แตะผลจำแนกหลัก/สถานะที่คนตัดสินไว้ — MenuId เท่านั้นที่เปลี่ยน

## Dependencies

—

## Handoff

ตรวจ AC-007.1/AC-006.3 ด้วยการรัน Mode B บนชุดทดสอบแล้ว diff ทุกคอลัมน์ — ต้องเปลี่ยนเฉพาะ field เมนู — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
path แยก additive — revert ได้ (ผลที่เขียนเป็นค่าเมนูปกติ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
