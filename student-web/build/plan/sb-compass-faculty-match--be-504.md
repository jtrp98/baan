# BE-504 — ConsistencyScore column + calculation

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-029b`

## Goal

**ใหม่ทั้งหมดรอบนี้ (2026-09-02, Contract Version 8)**: เพิ่มคอลัมน์ `public."TCompassRiasecResult"."ConsistencyScore"` (numeric, nullable) และคำนวณ `ConsistencyScore = 1 − (Σ Disagreement(r) / (4 × R))` ต่อรอบทดสอบ โดยเทียบค่า Likert กับค่า ranking ที่คำนวณอยู่แล้วต่อมิติ (R ควรเท่ากับ 6 เพราะทุกมิติมีคำถามครบสองรูปแบบตาม BE-029) ตามสัญญา §7.2 — แทนที่กลไก Confidence/shrinkage ที่อิง "ตอบน้อยกว่า 50%": เกณฑ์นั้นไม่มีทาง trigger ได้จริงอีกต่อไปเพราะการส่งบังคับ 100% เสมอ (หลัง BE-028) — โครงสูตร shrinkage เดิมยังคงไว้ (`ConfidenceFactor`, `CONF_F_MIN=0.5`, `NEUTRAL_SCORE=50`, `CLARITY_F_MIN=0.5` — ปิดแล้วเป็น engineering default) แต่เปลี่ยนตัวแปรขับเคลื่อนเป็น `ConsistencyScore` เทียบ `CONSISTENCY_MIN` — ห้ามอ้าง `"AnsweredCount"`/`"ActiveItemCount"` เป็นตัวขับเคลื่อน Confidence อีกต่อไป (เก็บไว้เป็น diagnostic เท่านั้น) · คำนวณและบันทึกตอนส่งเท่านั้น ห้ามคำนวณย้อนหลัง — เกณฑ์ความมั่นใจเดิมตายตัวตั้งแต่กติกา "ตอบครบ 100%" ถูกคงไว้ — ความสอดคล้องข้ามรูปแบบคำตอบเป็นสัญญาณที่มีอยู่จริงและวัดได้ทุกรอบ

## References

REQ-012, AC-012.4, DES-022, DEC-022

## Scope

คอลัมน์ใหม่ additive — ไม่มีตารางใดถูกสร้างจริงจึงไม่มี migration/backfill · `R = 0` → ไม่มีค่า (NULL) + log เป็นปัญหาเนื้อหา ห้ามนับมิติขาดข้อมูลเป็น Disagreement = 0 · การเทียบกับ `CONSISTENCY_MIN` ที่ขั้นตัดสิน "ยังไม่มั่นใจ" ยังรอค่า (OQ-F16) — จนกว่าจะปิด ให้ implement การคำนวณ/บันทึกค่า และปล่อยขั้นตัดสินแสดงผลตาม fallback ของสัญญา

- Security-sensitive: yes

## Out of Scope

โครงสูตร studentLevel ของ BE-029 (อ่านค่าที่คำนวณแล้ว) · ค่าคงที่ที่ปิดแล้ว · แถวผลเก่า (ห้ามคำนวณย้อนหลัง)

## Expected Output

none

## Acceptance

AC-012.4 (ฐานสัญญาณ): ทุกรอบที่ส่งสำเร็จมี ConsistencyScore บันทึกไว้ตามสูตร (หรือ NULL เมื่อไม่มีมิติใดวัดครบสองรูปแบบ พร้อม log) — เป็นตัวแปรขับเคลื่อนความมั่นใจตัวใหม่ที่รองรับข้อกำหนด "คะแนนเท่ากันแต่ความชัดเจนต่างกันห้ามแสดงเหมือนกัน"

## Dependencies

BE-029

## Handoff

ตรวจ AC-012.4 (ฐานสัญญาณ) ด้วยชุดคำตอบที่ Likert กับ ranking สอดคล้อง/ขัดแย้ง/ขาดมิติ — เทียบค่า ConsistencyScore ที่บันทึกกับสูตรทีละมิติ + ตรวจ NULL/log กรณี R=0 — เก็บตารางเทียบเป็นหลักฐาน
คอลัมน์ใหม่ additive บนตารางของตัวเอง — revert ได้โดยค่า NULL ไม่พังปลายทาง (ต้องตรวจว่า consumer อ่าน NULL ได้)
ส่งต่อ reviewer

Back-links: `INDEX.md`
