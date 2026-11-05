# BE-021 — Quest bank CRUD + state machine

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

CRUD endpoint คลัง quest (`public."TCompassQuest"`: **`"DimensionID"` — v9: `integer` FK ชี้ `public."TCompassRiasecDimension"` แทนคอลัมน์ `dimension_code` เดิม · API รับ/คืนเป็น `"DimensionCode"` แล้ว resolve ที่ชั้น service**, `"Title"`, `"Description"`, `"Status"` — `"ProgramID"` ต้องเป็น NULL เสมอรอบนี้) พร้อม state machine `pending_review`→`approved`→`retired` (DES-023 + `## DES-025 — RIASEC Fit Rules` §9) — quest ที่เสนอให้เด็กต้องมาจากคลังที่ผ่านการอนุมัติเท่านั้น — state machine เดียวกับ console ทำให้คุมคุณภาพเนื้อหาได้จุดเดียว

## References

REQ-008, AC-008.1, DES-023, DEC-023, DES-018, DEC-018

## Scope

state machine ทางเดียว ห้ามถอยกลับ · `"ProgramID"` เป็น NULL เสมอรอบนี้ (quest ระดับมิติ ไม่ผูกสาขา) · ทุก operation ผ่าน SSO · **มิติอ้างด้วย code ที่สัญญาฝั่งนอก แปลงเป็น `"DimensionID"` ที่ชั้น service — ห้ามให้ client ส่งเลข Id**

- Security-sensitive: no

## Out of Scope

`TCompassQuestAttempt` (ฝั่งนักเรียน — คนละตาราง) · state machine ของ program · สคีมา

## Expected Output

none

## Acceptance

AC-008.1 (ฐานคลัง): คลัง quest ระดับมิติถูกจัดการผ่าน CRUD จริงและมีเพียง quest ที่ผ่าน 'approved' เท่านั้นที่มีสิทธิ์ถูกเสนอให้เด็กภายหลัง

## Dependencies

BE-013

## Handoff

ตรวจ AC-008.1 (ฐานคลัง) ด้วยการเดิน state machine จริง (สร้าง→อนุมัติ→retire + พยายามถอยกลับต้องถูกปฏิเสธ) + ตรวจ `"ProgramID"` NULL ตลอด + ตรวจว่า `"DimensionID"` ที่เก็บ resolve มาจาก `"DimensionCode"` ที่ส่งเข้ามา — เก็บผลเป็นหลักฐาน
endpoint CRUD additive — revert ได้ · quest ที่ retire คงประวัติตามสถานะ
ส่งต่อ reviewer

Back-links: `INDEX.md`
