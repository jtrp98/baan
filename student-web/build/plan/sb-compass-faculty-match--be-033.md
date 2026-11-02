# BE-033 — Quest suggestion endpoint

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint เสนอ quest — เฉพาะเมื่อมีจุดไม่เข้ากันอย่างน้อย 1 มิติ, เลือกจาก `public."TCompassQuest"` ที่ `"Status"='approved'` + `"ProgramID" IS NULL` + **`"DimensionID"` ตรงมิติที่ไม่เข้ากัน (v9 — เดิมเขียนว่า `dimension_code`; การจับคู่/แสดงผลต่อคนยังใช้ `"DimensionCode"`)**, ไม่เกิน 2 ชิ้นเรียงตามมิติที่ห่างมากที่สุดก่อน, มิติที่ไม่มี quest ในคลัง → ไม่เสนอ ห้าม error ห้ามแสดงช่องว่าง ห้ามเสนอ quest ของมิติอื่นมาแทน (`## DES-025 — RIASEC Fit Rules` §9) — quest ที่ไม่ตรงมิติหรือมาจาก quest ที่ยังไม่อนุมัติทำให้เด็กฝึกสิ่งที่ไม่ตรงปัญหา — คุณภาพของการเสนอคือคุณค่าของฟีเจอร์นี้ทั้งหมด

## References

REQ-008, AC-008.1, DES-025, DEC-025, DES-018, DEC-018

## Scope

อ่านคลัง quest (read-only) · เสนอเมื่อมีจุดไม่เข้ากันเท่านั้น · ตรวจ `"Status"='approved'` ที่เซิร์ฟเวอร์ทุกครั้ง · **การจับคู่มิติทำด้วย `"DimensionID"` ภายใน · ข้อความ/payload ที่ออกไปหาเด็กยังอ้างมิติด้วย code/ชื่อไทย ไม่ใช่เลข Id**

- Security-sensitive: yes

## Out of Scope

คลัง quest (อ่านอย่างเดียว) · ผล RIASEC · สคีมา

## Expected Output

none

## Acceptance

AC-008.1: เมื่อมีจุดไม่เข้ากัน ระบบเสนอ quest ให้เด็กลองทำจริงผ่านกลไก quest ของโมดูลนี้ — เฉพาะ quest ที่ approved ตรงมิติ ไม่เกิน 2 ชิ้น และมิติที่ไม่มี quest ไม่ถูกแทนด้วย quest อื่น

## Dependencies

BE-031

## Handoff

ตรวจ AC-008.1 ด้วยชุดทดสอบ: มี/ไม่มีจุดไม่เข้ากัน, คลังมี/ไม่มี quest ตรงมิติ, quest ยัง pending_review — เก็บผลเรียกทุกกรณีเป็นหลักฐาน
endpoint อ่าน/เสนอ — revert ได้ ไม่เขียนข้อมูลถาวรในตัวเอง
ส่งต่อ reviewer

Back-links: `INDEX.md`
