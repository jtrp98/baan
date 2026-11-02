# BE-333 — POST /ai-suggestions/detect

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-24`

## Goal

เพิ่ม `POST /api/v2/support/crm-ai/ai-suggestions/detect` — endpoint กดเอง สิทธิ์ `CRM_AI_SA`/`CRM_AI_PM` ครอบด้วย Postgres advisory lock คนละ key กับ backfill กันกดซ้อน คืนจำนวนที่สร้าง/อัปเดต/ข้ามแยกตาม `SuggestionType` — ไม่เรียก Gemini เลย (rule-based ล้วน) ตาม design § ข้อ 7.4 — detection เป็นงานหนักที่กดเองตามจังหวะ — lock กันซ้อนและตอบสรุปรายกฎจึงคุมได้ว่ารอบนี้เกิดอะไร

## References

REQ-011, AC-011.1, AC-011.2, DES-008, DEC-008

## Scope

endpoint กดเอง — advisory lock คนละ key กับ backfill (unlock ใน finally เสมอ) · ไม่มีการเรียก AI ใด · สร้างแถว PENDING เท่านั้น ไม่ auto-apply

- Security-sensitive: no

## Out of Scope

key ของ backfill (คนละ key ตาม design) · การเรียก Gemini ในรอบ detect · การ auto-apply แถวใด

## Expected Output

none

## Acceptance

AC-011.1: แถวที่ detect สร้างเป็น PENDING เสมอ — ห้าม auto-apply เด็ดขาด
AC-011.2: รอบกดตอบสรุปสร้าง/อัปเดต/ข้ามแยกตามกฎ — ตรวจย้อนรอบได้จริง

## Dependencies

—

## Handoff

ตรวจ AC-011.1/AC-011.2 ด้วยการกดจริง: สรุปรายกฎ + กดซ้อนต้องถูก lock กัน + ไม่มีการเรียก Gemini — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
endpoint ใหม่ additive — revert รายไฟล์ได้ (แถวที่สร้างเป็น PENDING ปกติ)
ส่งต่อ reviewer

Back-links: `INDEX.md`
