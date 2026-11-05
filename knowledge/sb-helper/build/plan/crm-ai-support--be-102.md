# BE-102 — model TCrmCaseAiAssessment

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-02`

## Goal

เพิ่ม model `TCrmCaseAiAssessment` ใน `prisma/jabjai-master-single-db/schema.prisma` ครบตาม § Data Model — ผลจำแนก/confidence/reasoning, คอลัมน์ review status แยกมิติ, `IssueId`, `SlaRuleVersion`/`ComputedPriorityScore` — เป็นตารางกลางที่ classify/review-queue/backfill/priority ทุกเส้นทางอ่าน-เขียนร่วมกัน โครงต้องตรง design ทุก field จึงไม่เกิดสองแหล่งความจริง

## References

REQ-002, AC-002.2, DES-001, DEC-001

## Scope

เพิ่ม model เดียวตรง § Data Model ทุก field — ไม่มี `@relation` (reference เป็น logical ref ที่ app layer ตามธรรมเนียม DB นี้)

- Security-sensitive: yes

## Out of Scope

model/ตารางอื่น · field เดิมของ `TCrmSupport` · การเพิ่ม `@relation`/FK ใน DB ที่ตั้งใจไม่ใช้

## Expected Output

none

## Acceptance

AC-002.2: โครงตารางเก็บเหตุผลและความมั่นใจของ AI ครบ (`AiReasoning`/`AiConfidence` ฯลฯ) — audit ย้อนหลังได้ตาม § Data Model

## Dependencies

—

## Handoff

ตรวจ AC-002.2 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
model additive — ลบออกจาก schema ได้โดยข้อมูลเดิมใน DB ไม่กระทบ
ส่งต่อ reviewer

Back-links: `INDEX.md`
