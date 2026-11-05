# BE-020 — RIASEC question bank CRUD

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

CRUD endpoint คลังคำถาม RIASEC กลาง (`public."TCompassRiasecQuestion"`: `"DisplayOrder"`, `"Prompt"`, **`"DimensionID"` — v9: `integer` FK ชี้ `public."TCompassRiasecDimension"("DimensionID")` แทนคอลัมน์ `dimension_code` เดิม (และก่อนหน้านั้นคือ `trait_code`/แกนพฤติกรรม)**, `"ReverseScored"`, `"IsActive"`) บน Curriculum Service หลัง SSO เดียวกับ console — **สัญญาฝั่ง API รับ/คืนเป็น `"DimensionCode"` (`R`/`I`/`A`/`S`/`E`/`C`) แล้ว resolve เป็น `"DimensionID"` ที่ชั้น service · เช่นเดียวกันกับ `public."TCompassRiasecRankOption"."DimensionID"` ของคำถามแบบเรียงลำดับ** — ชุดคำถามเป็นชุดกลางชุดเดียวที่ทั้งฝั่ง authoring และฝั่งนักเรียนอ่าน — โครงคอลัมน์ต้องตรงกับกติกาการคำนวณของฝั่งนักเรียน (reverse-scoring, is_active, display_order)

## References

REQ-012, AC-012.3, DES-023, DEC-023, DES-018, DEC-018

## Scope

CRUD บนตารางคลังคำถามของ Curriculum Service (เจ้าของตารางตามสัญญา) · ทุก operation ผ่าน SSO · คลังต้องรองรับทั้งแบบ Likert (มี reverse_scored) และบล็อกเรียงลำดับ (แยกตารางของตัวเอง) ให้ครบสองรูปแบบ

- Security-sensitive: no

## Out of Scope

ตารางบล็อกเรียงลำดับ/ตัวเลือก (คนละตาราง — อย่ายุบรวม) · คำตอบ/ผลที่เก็บแล้วของนักเรียน · สคีมาอื่น

## Expected Output

none

## Acceptance

AC-012.3 (ฐานคลัง): คลังคำถามรองรับทั้งแบบให้คะแนนแยกข้อ (1-5) และแบบเรียงลำดับอยู่คู่กันตามที่แบบทดสอบต้องใช้ — CRUD เพิ่ม/แก้/ปิดใช้ข้อคำถามได้จริงหลัง SSO

## Dependencies

BE-013

## Handoff

ตรวจ AC-012.3 (ฐานคลัง) ด้วยการ CRUD จริงผ่าน endpoint (ส่งมิติเป็น `"DimensionCode"`) + ตรวจแถวที่เก็บ (คอลัมน์ครบ, `"DimensionID"` เป็น Id ที่ resolve มาจาก code, is_active/display_order ทำงาน) + ส่ง code ที่ไม่ใช่ 1 ใน 6 ต้องถูกปฏิเสธ + 401 เมื่อไม่ผ่าน SSO — เก็บผลเป็นหลักฐาน
endpoint CRUD additive — revert ได้ · คำถามที่ถูกใช้ไปแล้วห้ามลบแบบทำผลเก่าตีความไม่ได้ (ปิดใช้ด้วย is_active)
ส่งต่อ reviewer

Back-links: `INDEX.md`
