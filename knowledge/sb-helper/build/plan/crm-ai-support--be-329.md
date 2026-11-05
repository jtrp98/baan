# BE-329 — detection threshold — แถวเดิม (ปลดล็อกแล้ว)

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-20`

## Goal

แถวเดิมถูกแทนด้วยงาน detection job ใน "Phase 3b amendment — CR 2026-08-18" — ผู้ใช้ยืนยันชุด threshold ครบแล้วตาม design § AI Suggestion & Learning Loop Rules ข้อ 7 (งานจริงอยู่ที่ BE-crm-ai-support-P3-23..30) — แถวนี้เคยถูกบล็อกเพราะรอคำตอบ threshold — เมื่อปลดล็อกแล้ว งานจริงแตกเป็น task ชุด amendment แถวนี้จึงเป็นตัวชี้ทางเท่านั้น

## References

REQ-011, AC-011.2, DES-008, DEC-008

## Scope

แถวชี้ทาง — ไม่มีงานโค้ดใหม่ของตัวเอง (งานจริงครอบด้วย task P3-23..P3-30 ในกลุ่ม amendment เดียวกัน)

- Security-sensitive: no

## Out of Scope

โค้ดใด ๆ (แถวนี้ไม่มีงานโค้ดของตัวเอง) · threshold ที่ยืนยันแล้ว

## Expected Output

none

## Acceptance

AC-011.2: ชุดเกณฑ์ของทั้ง 5 SuggestionType ถูกยืนยันและ implement ตาม design § ข้อ 7 (ผ่าน task ชุด amendment)

## Dependencies

—

## Handoff

ตรวจ AC-011.2 ด้วยการติดตามงานจริงที่ task P3-23..P3-30 ของกลุ่มเดียวกัน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แถวชี้ทาง — ไม่มีผลต่อ runtime
ส่งต่อ reviewer

Back-links: `INDEX.md`
