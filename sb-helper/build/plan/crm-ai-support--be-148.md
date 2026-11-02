# BE-148 — query นับ distinctSchoolCount

> module: sb-helper/crm-ai-support

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-ai-support-P1-32`

## Goal

เพิ่ม query นับ `distinctSchoolCount` ที่ repository layer: มี `IssueId` → นับ `SchoolId` ไม่ซ้ำไม่ NULL ของทุกเคสในเรื่องเดียวกัน (ไม่มีหน้าต่างเวลา) · ยังไม่มี `IssueId` → นับเคส `MenuId`+`AiCategory` เดียวกันใน 30 วันย้อนหลัง (นับตัวเองด้วย) · `MenuId IS NULL` และไม่มี `IssueId` → ตัวคูณ 1.0 · นับได้ 0 → ตัวคูณ 1.0 (ไม่ใช่ 0) · นับเฉพาะ `DeleteDate IS NULL` — ความแม่นของสูตร v2 ขึ้นกับนิยาม เรื่องเดียวกัน — นับผิดที่ใดสูตรเพี้ยนเงียบทั้งโมดูล

## References

REQ-003, AC-003.1, DES-005, DEC-005

## Scope

query ที่ repository layer เท่านั้น (ไม่ใช่ไฟล์ constant) — เงื่อนไขนับตามสัญญา v2 ทุกข้อ รวมกรณีขอบ 0 โรงเรียน/NULL MenuId

- Security-sensitive: yes

## Out of Scope

สูตรตัวคูณใน constant (task BE-crm-ai-support-P1-31) · schema · การนับเคสที่ `DeleteDate IS NOT NULL`

## Expected Output

none

## Acceptance

AC-003.1: ตัวคูณใช้จำนวนโรงเรียนที่นับตามนิยาม เรื่องเดียวกัน ของ v2 — ครบทุกกรณีขอบ (0 โรงเรียน/ไม่มีเมนู) ได้ ×1.0 ไม่ใช่ 0

## Dependencies

—

## Handoff

ตรวจ AC-003.1 ด้วยชุดข้อมูล: เคสมี/ไม่มี IssueId, MenuId NULL, 0 โรงเรียน, เคสลบ — เทียบจำนวนที่นับ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)
query ใหม่ใน repository — revert รายฟังก์ชันได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
