# BE-011 — dedup_key + intake write

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

คำนวณ `dedup_key` จาก `raw_program_name` ตามลำดับขั้นที่กำหนด (ตัดช่องว่าง/ยุบช่องว่างติดกัน → ตัดอักขระที่ระบุ → ตัดคำนำหน้า/คำลงท้ายซ้ำจนหมด → lowercase ตัวละติน) แล้วเขียน `public."TCompassProgramIntake"` พร้อม `matched_program_id` เป็นข้อเสนอเท่านั้น (DES-019 §8) — ชื่อสาขาเขียนไม่เหมือนกันข้ามมหาวิทยาลัย — dedup ที่ชนต้องเป็นข้อเสนอให้คนตัดสินใน `resolution` ไม่ใช่ merge อัตโนมัติ ซึ่งจะรวมสาขาผิดคู่เงียบ ๆ แล้วเด็กเห็นสาขาเดียวกันสองครั้งใน top-10

## References

REQ-006, AC-006.2, DES-019, DEC-019

## Scope

ลำดับขั้นคำนวณ dedup_key คงตามสัญญาเป๊ะ ห้ามเพิ่ม/ลดขั้น · การชนไม่ merge อัตโนมัติเด็ดขาด — ตั้ง matched_program_id แล้วให้คนตัดสิน

- Security-sensitive: yes

## Out of Scope

ตาราง `public."TCompassProgram"` (ยังไม่แตะใน task นี้) · ลำดับขั้น dedup_key · validator ของ BE-009

## Expected Output

none

## Acceptance

AC-006.2 (ฐานกันซ้ำ): สาขาที่ชื่อเขียนต่างกันแต่ตรงกันจริงถูกเสนอคู่กันผ่าน matched_program_id เพื่อให้คนตัดสิน — ระบบไม่มีทางสร้างสาขาซ้ำเงียบ ๆ จนไปโผล่ซ้ำในผลของเด็กภายหลัง

## Dependencies

BE-009

## Handoff

ตรวจ AC-006.2 (ฐานกันซ้ำ) ด้วยชุดชื่อทดสอบ: เหมือนเป๊ะ/ต่างช่องว่าง/มีคำนำหน้า/ต่างมหาวิทยาลัย — เทียบ dedup_key ที่ได้กับลำดับขั้นสัญญาทีละขั้น + ตรวจแถว intake ที่เขียน — เก็บผลเป็นหลักฐาน
utility + เขียน intake ใหม่ — revert ได้ · แถว intake ที่เขียนไปแล้วเป็นประวัติ ไม่ถูกลบ
ส่งต่อ reviewer

Back-links: `INDEX.md`
