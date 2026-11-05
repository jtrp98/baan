# BE-334 — กฎ MERGE_ISSUE

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P3-25`

## Goal

implement กฎ `MERGE_ISSUE` — เคส `AiCategory=BUG` ที่ `MenuId` เดียวกัน (ไม่นับ NULL) จาก ≥3 `SchoolId` ต่างกัน (ไม่นับ NULL) ภายใน 30 วันย้อนหลัง นับเฉพาะ `DeleteDate IS NULL` ตาม design § ข้อ 7.1 — บั๊กเดียวกันจากหลายโรงเรียนคือสัญญาณควรรวมเป็นเรื่อง — เกณฑ์ต้องนับจากข้อมูลจริงตาม threshold ที่ยืนยัน

## References

REQ-011, AC-011.2, DES-008, DEC-008

## Scope

query กฎเดียวใน detection service — อ่านค่าเกณฑ์จาก constant ของ task ก่อนหน้า · สร้าง/อัปเดตแถว PENDING ผ่านกลไก group_key ร่วม

- Security-sensitive: no

## Out of Scope

ค่าเกณฑ์ (อ่านจาก constant เท่านั้น) · กฎอื่น · การนับเคสที่ `DeleteDate IS NOT NULL`

## Expected Output

none

## Acceptance

AC-011.2: กฎ MERGE_ISSUE ตรวจตรงเกณฑ์ (≥3 โรงเรียน/เมนูเดียว/30 วัน) — ทุกแถวที่ตรวจพบมี version กฎกำกับ

## Dependencies

—

## Handoff

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (2 โรงเรียน/3 โรงเรียน/เมนู NULL/เคสลบ/ข้าม 30 วัน) — เทียบผลตรวจพบ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
กฎเป็นฟังก์ชันแยก — revert รายกฎได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
