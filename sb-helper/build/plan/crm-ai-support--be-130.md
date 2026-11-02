# BE-130 — เขียนผลจำแนกเมนูลง assessment/เคส

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-18`

## Goal

แก้ `classification.service.ts`: เขียน `MenuConfidence`/`MenuReasoning`/`MenuReviewStatus` ลง `TCrmCaseAiAssessment` และ `MenuId` ลง `TCrmSupport` — ใช้ threshold เดียวกับ category (`CRM_AI_CONFIDENCE_THRESHOLD`) ตัดสิน `NEEDS_HUMAN` ของมิตินี้แยกอิสระจากมิติอื่น — ผลจำแนกเมนูต้องถูกเก็บและถูกตัดสินด้วยเกณฑ์ของมิติตัวเอง — ยืมสถานะข้ามมิติทำให้คิวตรวจเพี้ยนเงียบ

## References

REQ-006, AC-006.1, REQ-009, AC-009.1, DES-002, DEC-002, DES-003, DEC-003

## Scope

เขียนผลทั้ง 3 ค่าบน assessment + MenuId บนเคส ณ จุด classify เดียว — ตัดสิน NEEDS_HUMAN ของมิติเมนูจาก menuConfidence เทียบ threshold เดียวกัน

- Security-sensitive: yes

## Out of Scope

สถานะมิติอื่น (ตัดสินแยกอิสระ) · schema · การเขียน `*ReviewedBy`/`*ReviewedAt` จากกลไกอัตโนมัติ

## Expected Output

none

## Acceptance

AC-006.1: ทุกเคสที่ classify สำเร็จมีผลเมนูเก็บครบ (MenuId + confidence/reasoning/สถานะรีวิว)
AC-009.1: สถานะรีวิวมิติเมนูตัดสินจากความมั่นใจของมิตินี้เอง — ไม่ยืมจากประเภทเคส/ความรุนแรง

## Dependencies

—

## Handoff

ตรวจ AC-006.1/AC-009.1 ด้วยกรณี confidence สูง/ต่ำของมิติเมนูเทียบสถานะที่เขียน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
เพิ่มการเขียน field ใหม่ใน service เดิม — revert ได้ ข้อมูลที่เขียนแล้วคงอยู่
ส่งต่อ reviewer

Back-links: `INDEX.md`
