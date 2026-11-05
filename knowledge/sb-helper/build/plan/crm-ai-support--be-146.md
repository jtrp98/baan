# BE-146 — overrideReviewStatuses เฉพาะมิติรอตรวจ

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-30`

## Goal

แก้ `overrideReviewStatuses()` ใน `backfill.repository.ts` (Mode A) ให้ครอบทั้ง 3 มิติ แต่เขียนทับเฉพาะมิติที่สถานะปัจจุบันเป็น `PENDING_REVIEW` หรือ `NEEDS_HUMAN` เท่านั้น (โดยไม่ดูว่ามิตินั้นมีค่าหรือไม่) — ห้ามแตะสถานะ `NULL`/`NO_MENU` และห้ามแตะมิติที่ `{Dim}ReviewedAt IS NOT NULL` (คงเกราะเดิม) · `Status` NULL หรือนอก 4 ค่าของ `BACKFILL_CLOSED_ALIASES` → นับเป็น ยังไม่ปิด เสมอ — ปิดช่องเคสปิดแล้วที่ Severity=NULL ค้าง NEEDS_HUMAN ตลอดไป โดยไม่ทำลายเกราะห้ามทับสิ่งที่คนตัดสินแล้ว — hard prerequisite ก่อนกด backfill กับข้อมูลจริง

## References

REQ-007, AC-007.2, AC-007.3, DES-004, DEC-004

## Scope

แก้ฟังก์ชัน override จุดเดียว — เงื่อนไขเขียนทับล็อกตามสถานะปัจจุบันต่อมิติ · กรณีอื่นคงเดิมทุกคอลัมน์

- Security-sensitive: yes

## Out of Scope

สถานะ NULL/NO_MENU (ความหมายตาม DES-002) · มิติที่คนรีวิวแล้ว (`*ReviewedAt IS NOT NULL`) · ค่านอก alias 4 ตัว (นับยังไม่ปิดเสมอ)

## Expected Output

none

## Acceptance

AC-007.2: เคสปิดแล้วตาม alias ได้รับการตัดสินอัตโนมัติเฉพาะมิติที่ยังรอตรวจ — สิ่งที่คนตัดสินแล้วไม่ถูกทับ
AC-007.3: เคสสถานะว่าง/นอก 4 ค่าถูกบังคับ NEEDS_HUMAN ตามกติกา — ไม่เคยถูกเชื่อผลอัตโนมัติ

## Dependencies

—

## Handoff

ตรวจ AC-007.2/AC-007.3 ด้วยชุดทดสอบ: มิติ PENDING_REVIEW/NEEDS_HUMAN/NULL/NO_MENU/ReviewedAt มีค่า × สถานะเคสปิด/ไม่ปิด — เทียบผลทับ/ไม่ทับรายมิติ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แก้ฟังก์ชันเดียว — revert ได้ แต่เป็น hard prerequisite ก่อนกด backfill กับข้อมูลจริง ~70k ครั้งแรก (ดู Sequencing Notes)
ส่งต่อ reviewer

Back-links: `INDEX.md`
