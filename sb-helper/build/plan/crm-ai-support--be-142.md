# BE-142 — backfill query แยก Mode A/B

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-27`

## Goal

แก้ query เลือกเคสของ backfill (`backfillWhereClause()`/`countRemaining()` หรือชื่อเทียบเท่า) แยก 2 โหมดเด็ดขาด: **Mode A** = `AiCategory IS NULL` (full classify) · **Mode B** = `AiCategory IS NOT NULL AND MenuId IS NULL AND MenuReviewStatus IS NULL AND MenuReviewedAt IS NULL` (menu-only เท่านั้น) — `runBatch()` เลือก pipeline ตรงโหมดต่อเคส ห้ามใช้ `notIn` ยัด id หมื่นตัว (เริ่มจาก assessment แล้วกรอง `CrmSupportId IN (...)` ของชุด หรือ `$queryRaw` LEFT JOIN) — `remaining`/GET นับด้วยเงื่อนไข Mode A+B รวมกัน — query เดิม merge 2 เงื่อนไขทำให้กวาดเมนูซ้ำเรียก classify เต็มรูปแบบเขียนทับสิ่งที่คนตรวจแก้ไว้ — แยกโหมดจึงปิดช่องเขียนทับเงียบ ๆ

## References

REQ-007, AC-007.1, DES-004, DEC-004

## Scope

แก้ query/เลือก pipeline ใน backfill service/repository เดิม — โหมดตัดสินจากสถานะของเคสเอง ไม่รับจาก client · นับ remaining ตรง Mode A+B

- Security-sensitive: yes

## Out of Scope

เงื่อนไข Mode B ตามสัญญา (ทั้ง 4 เงื่อนไขพร้อมกัน) · pipeline ที่เลือกต่อโหมด · schema

## Expected Output

none

## Acceptance

AC-007.1: เคสแต่ละใบเข้า pipeline ตามโหมดของตัวเอง (A หรือ B) — กวาดซ้ำไม่เขียนทับมิติอื่นและ remaining ตรงเงื่อนไขรวม

## Dependencies

—

## Handoff

ตรวจ AC-007.1 ด้วยชุดทดสอบ 4 กลุ่ม (ยังไม่จำแนก / จำแนกแล้ว+เมนูครบ / เมนูล้ม / คนรีวิวแล้ว) — เทียบ pipeline ที่ถูกเรียกต่อเคส + remaining — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
แก้ query ใน backfill เท่านั้น — revert ได้ แต่เป็น hard prerequisite ก่อนกด backfill กับข้อมูลจริง (ดู Sequencing Notes)
ส่งต่อ reviewer

Back-links: `INDEX.md`
