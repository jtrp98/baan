# BE-031 — Incompatibility points + alternatives

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

ตรวจจุดไม่เข้ากัน (`desiredLevel − studentLevel ≥ 2` เท่านั้น — ทิศตรงข้ามไม่ใช่จุดไม่เข้ากัน ห้ามเตือน) เรียงส่วนต่างมากไปน้อย เสมอกันเรียงตาม display order, เสนอสาขาทางเลือกใน cluster เดียวกันที่ desiredLevel ของมิตินั้นต่ำกว่า ไม่เกิน 3 รายการเรียงตาม % — การแนะนำต้องเอ่ยชื่อมิติที่ไม่เข้ากันอันดับ 1 ออกมาตรง ๆ — ตัวอย่าง acceptance ของผู้ใช้ (อยากเป็น SA แต่ไม่ชอบงานเอกสาร) ผ่านได้ด้วยการเอ่ยชื่อมิติตรง ๆ — ตัวเลข % อย่างเดียวไม่ผ่านสิ่งที่ผู้ใช้ต้องการ

## References

REQ-007, AC-007.1, DES-025, DEC-025, DES-018, DEC-018

## Scope

เกณฑ์ ≥ 2 คงตามสัญญา · ทิศตรงข้ามห้ามแจ้งเตือนเด็ดขาด · ทางเลือกจำกัด 3 รายการจาก cluster เดียวกัน

- Security-sensitive: yes

## Out of Scope

โปรไฟล์สาขา (อ่านอย่างเดียว) · สูตร % ของ BE-030 · สคีมา

## Expected Output

none

## Acceptance

AC-007.1: ผลแสดงจุดไม่เข้ากันพร้อมเอ่ยชื่อมิติที่ไม่เข้ากันอันดับ 1 ตรง ๆ และแนะนำทางเลือกอื่นภายใน cluster เดียวกัน — ไม่ตัดสินว่าเด็กทำไม่ได้

## Dependencies

BE-030

## Handoff

ตรวจ AC-007.1 ด้วยชุดทดสอบเลียนแบบตัวอย่างของผู้ใช้: มีมิติต่าง ≥2 / ต่าง <2 / ทิศตรงข้าม — ตรวจรายการที่ชี้ เรียง และทางเลือก ≤3 — เก็บผลเป็นหลักฐาน
เป็นขั้นคำนวณ — revert ได้ ไม่เขียนข้อมูลถาวร
ส่งต่อ reviewer

Back-links: `INDEX.md`
