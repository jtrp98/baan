# BE-017 — GetStudentNationalStatsAsync: request-time overall matches batch formula

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

`GetStudentNationalStatsAsync` (`:175`): เปลี่ยนการคำนวณ `overall` แบบสดตอน request จาก `agg.Average(a => a.AverageScore)` เป็นสูตรเดียวกับที่ batch ใช้ (`AggregateByCanonicalSubjectWeighted`) เพื่อไม่ให้อันดับเพี้ยนจากการเทียบเลขถ่วงน้ำหนักกับเลขไม่ถ่วงน้ำหนัก — `RankInLevel` เทียบค่าสดตอน request กับกองค่า overall ในตาราง — ถ้าเปลี่ยนแค่ฝั่ง batch จะกลายเป็นการเอาเลขถ่วงน้ำหนักไปเทียบกับกองเลขไม่ถ่วงน้ำหนัก อันดับเพี้ยนอย่างเป็นระบบ (DES-021 "ทำไมต้องเปลี่ยนทั้งคู่พร้อมกัน")

## References

REQ-004, AC-004.1, DES-021

## Scope

แก้เฉพาะสูตร `overall` ที่ใช้จัดอันดับตอน request — ต้องเป็นเมธอดกลางเดียวกับ batch ไม่ใช่สูตรเลียนแบบ;
ค่าที่เทียบกับตารางต้องมาจากสูตรเดียวกันทุกประการ

- Security-sensitive: no

## Out of Scope

ห้ามใช้สูตรคู่ขนานที่คล้ายแต่ไม่ใช่เมธอดกลาง; ห้ามแตะกฎการนับอันดับ (จำนวนคนที่สูงกว่า + 1); ห้ามแตะพฤติกรรมตารางว่าง (คืนค่าว่าง/0 ไม่ล้ม)

## Expected Output

none

## Acceptance

AC-004.1: อันดับตอน request คำนวณจากค่า overall ที่ใช้สูตรถ่วงน้ำหนักเดียวกับ batch — เลขสองฝั่งเทียบกันได้โดยตรง

## Dependencies

BE-001

## Handoff

ตรวจ AC-004.1 ด้วยชุดข้อมูลที่ค่าถ่วงน้ำหนักต่างจากค่าดิบชัดเจน — เทียบอันดับที่ request คืนกับการนับจากตารางโดยตรง ต้องตรงกัน;
บันทึกหลักฐานการเทียบก่อน/หลังแก้
คืนสูตรเดิมได้เดี่ยว แต่ห้ามคืนฝั่ง request โดยที่ฝั่ง batch ยังใช้สูตรใหม่ (หรือกลับกัน) — สองฝั่งต้องเปลี่ยน/ถอดพร้อมกันและตามด้วย recompute (ดู Sequencing Notes)
ส่งต่อ reviewer

Back-links: `INDEX.md`
