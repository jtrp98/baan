# BE-143 — SeverityReviewStatus จาก confidence ตัวเอง

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-28`

## Goal

แก้ `classification.service.ts` ให้ `SeverityReviewStatus` ที่ classify-time คำนวณจาก `severityConfidence` ของตัวเองเทียบ `CRM_AI_CONFIDENCE_THRESHOLD` (0.6) เท่านั้น — เลิกยืมจาก `reviewStatus` ของมิติประเภทเคส (`severity` มีค่า + confidence ≥ 0.6 หรือ NULL → `PENDING_REVIEW`, < 0.6 → `NEEDS_HUMAN`, `severity` NULL → `SeverityReviewStatus = NULL`) — เส้นทาง Safety Override ตั้ง `SeverityReviewStatus = NEEDS_HUMAN` เสมอ (CRITICAL มาจากกฎ keyword ไม่ใช่การประเมิน AI จริง) — คิวตรวจต้องจับเคสที่ความรุนแรงไม่มั่นใจได้เอง — ยืมสถานะข้ามมิติทำให้เคสเสี่ยงหลุดคิวเงียบ ๆ

## References

REQ-004, AC-004.2, REQ-009, AC-009.2, DES-003, DEC-003

## Scope

แก้การตัดสินมิติความรุนแรงที่ classify เท่านั้น — กติกา 3 กรณี + override เป็น NEEDS_HUMAN เสมอ ตาม design § Per-Dimension Review (ส่วน 2026-08-17)

- Security-sensitive: yes

## Out of Scope

สถานะมิติอื่น (ตัดสินแยกอยู่แล้ว) · threshold 0.6 (แก้ผ่าน constant + version) · schema

## Expected Output

none

## Acceptance

AC-004.2: ความรุนแรงที่ AI ไม่มั่นใจถูกส่งคนตรวจเสมอ — ไม่หลุดคิวจากการยืมสถานะข้ามมิติ
AC-009.2: สถานะมิติความรุนแรงตัดสินจากของตัวเอง — ตรงกติกา 3 กรณี + override

## Dependencies

—

## Handoff

ตรวจ AC-004.2/AC-009.2 ด้วยชุดทดสอบครบ 3 กรณี + เส้นทาง override — เทียบสถานะที่เขียน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แก้ฟังก์ชันตัดสินจุดเดียว — revert ได้ แต่การ revert ทำให้กลับไปยืมสถานะข้ามมิติ (ช่องโหว่เดิม) จึงต้องมีทางเลือกแทนก่อน
ส่งต่อ reviewer

Back-links: `INDEX.md`
