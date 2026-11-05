# FE-008 — RIASEC results screen

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

หน้าจอผลลัพธ์ — % ความเหมาะสม, จุดไม่เข้ากัน (เอ่ยชื่อมิติ), สาขาทางเลือก, ถ้อยคำแบบไกด์ — แสดงจาก payload ของ BE-030/BE-031/BE-032 เท่านั้น — หน้าจอคือจุดที่เด็กอ่าน "ผล" — การเรียบเรียงที่เปลี่ยนความหมาย (เช่นแปลค่าว่างเป็น 0%) ทำลายกติกาถ้อยคำและค่า NULL ที่สัญญากำหนด

## References

REQ-007, AC-007.1, DES-025, DEC-025

## Scope

แสดงค่า NULL เป็นสถานะ "ยังประเมินด้านนี้ไม่ได้" ไม่ใช่ 0 · ไม่เพิ่มถ้อยคำตัดสินใน UI เอง · ทางเลือกแสดงไม่เกิน 3 ตาม payload

- Security-sensitive: yes

## Out of Scope

payload/สูตรฝั่ง BE · ถ้อยคำที่เซิร์ฟเวอร์สร้าง (แสดงตาม) · หน้าจออื่น

## Expected Output

none

## Acceptance

AC-007.1 (ฝั่งแสดงผล): เด็กเห็น % จุดไม่เข้ากันพร้อมชื่อมิติ ทางเลือก และถ้อยคำแบบไกด์ตรงตาม payload — ไม่มีการแปลค่าว่างเป็นตัวเลขหรือถ้อยคำตัดสินบนหน้าจอ

## Dependencies

BE-030, BE-031, BE-032

## Handoff

ตรวจ AC-007.1 (ฝั่งแสดงผล) ด้วยการเปิดผลจริงทั้งกรณีมี/ไม่มีจุดไม่เข้ากัน มี/ไม่มี % (NULL) — เทียบกับ payload ทีละค่า — เก็บผลเป็นหลักฐาน
หน้าจอใหม่ additive — revert ได้
ส่งต่อ reviewer

Back-links: `INDEX.md`
