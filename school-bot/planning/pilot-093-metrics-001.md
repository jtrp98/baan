# ผลวัด pilot ตรวจตามความเสี่ยง (BAAN ข้อ 13) — SB-W1 ใบงาน093

วันที่ 2026-10-29 · นายช่าง · ที่มาตัวเลข: `report.json` ของ 12 run ใน workspace `reports/baan/2026-10-29-04-*` (ทุก run ที่ task อ้าง "ใบงาน 093")

## ผลลัพธ์

| Task | risk | ผล | รอบตรวจ |
|---|---|---|---|
| SA-001 | high | verified | L1 PASS รอบเดียว ([check](check-093-SA-001-001.md)) |
| SEC-001 | high | verified (review pack) | L1 PASS รอบเดียว ([check](check-093-SEC-001-001.md)) · writer จบ NEEDS_HUMAN — ข้อรอคน H1/H2/H4/H5 |
| BE-001 | high | verified | L1 FAIL 5 ข้อ → rework → FAIL 1 ข้อ → rework → PASS ([รอบ1](check-093-BE-001-001.md) · [รอบ2](check-093-BE-001-002.md) · [รอบ3](check-093-BE-001-003.md)) |
| TP-002 | low | verified | ไม่มี L1 · ตรวจครั้งเดียวที่ [wave gate](check-093-wave1-gate-001.md) PASS พร้อมความสอดคล้องข้าม task |

## ตัวเลขเทียบ baseline

| ตัววัด | pilot 093 | baseline school-bot (2026-10-21→28) |
|---|---|---|
| เวลา writer : check | 44.3 : 35.4 นาที (check = 0.80 ของ writer) | 453 : 451 นาที (≈ 1.0) |
| verdict FAIL | 2/6 (33%) — ทั้งสองเป็นหลักฐานผิดใน pack ของ task (ไม่ใช่เหตุนอก pack) | 18/31 (58%) |
| เคสโตข้ามรอบ | BE-001: 14 static checks → re-check 14 + เคสครอบ fix 2 (ไม่โต) | gRPC logout 101 → 150 → 2,234 |
| เคสเพิ่มนอก pack | ≤ 6 ต่อใบ (wave gate 6) | ไม่มีเพดาน |
| อ่าน docs ฉบับเต็ม | 0 ครั้ง (ทุกใบงานอ่านจาก oracle pack + หัวข้อที่ลิงก์) | ทุกใบงาน |
| ตรวจเชิงตัดสิน | 3 L1 + 2 re-check + 1 wave gate = 6 ใบ สำหรับ 4 task | ตรวจราย task ทุกตัว |
| wall clock | ≈ 40 นาที (04:03 → 04:42) | — |

## เทียบเกณฑ์สำเร็จที่ผู้ใช้รับ (แผน TASK-010)

1. นาที check < นาที writer — **ผ่าน** (35.4 < 44.3)
2. FAIL ด้วยเหตุนอก pack = 0 — **ผ่าน**
3. เคสเพิ่มนอก pack ≤ 20 ต่อ task — **ผ่าน** (สูงสุด 6)
4. ติดเพดาน rework แล้วถามทันที — **ไม่เกิด** (BE-001 ใช้ 2/2 รอบแล้วผ่านในรอบสุดท้าย)

## ข้อสังเกต

- งานเอกสาร/ตรวจหลักฐานที่มีของเดิมอยู่แล้ว ใช้ writer ปิดช่องว่างเทียบ pack ได้ใน 7–10 นาทีต่องาน
- ตรวจข้ามโมเดล (writer Codex → check AGY และกลับกัน) จับข้อผิดหลักฐานจริงได้ (hash fixture, token ไม่ canonical) ด้วยการรันของจริงเทียบ ไม่ใช่การขยายเคส
- เพดาน slot ของงานตรวจ: มีช่วงเดียวที่ check 2 ใบรันพร้อมกัน ตอนไม่มี writer รอคิว (ไม่แย่ง slot writer) — ตีความตามเจตนาข้อ 12
- งาน high ที่ปิดไม่ได้เพราะรอหลักฐานภายนอก (SEC-001) ให้ check ตัดสิน "ส่วนที่พิสูจน์ได้ + ข้อรอคนจัดถูก" แล้ว verified ตัว pack ส่วนข้อรอคนป้อน gate ที่ QA (G-AUTH/G-SEC) ตามข้อ 10 — งาน wave ถัดไปเดินบน stub ได้

## ข้อรอคนที่ pilot เปิด

| id | คำถาม (ย่อ) | ผู้ตัดสิน | ป้อน |
|---|---|---|---|
| H1 | secret แยก/peer/TLS/BFF CSRF/production registration ของ G | เจ้าของ G/Light/infra | G-AUTH (QA-001, BE-023) |
| H2 | effective privileges DB/infra · license_admin ที่ active | DB+infra · เจ้าของ admin | G-CORE, G-AUTH |
| H4 | ผู้ถือ OS cert/Team ID, pins, registry ACL, signer custody | release/infra | G-RELEASE-DB, G-DELIVERY |
| H5 | ฐานประมวลผล/retention/masking ข้อมูลครูและผู้เรียน | DPO | G-SEC |
| TR-AUTH-03 | `TUser.nSystemID` ↔ `TEmployees.sEmp`/`TUser.sID` จริงใน DB | DBA Master/School + gateway | BE-006, G-AUTH |
| TR-AUTH-04 | collation/unique ของ `TUser.username` | DBA Master | BE-006 |
| TR-AUTH-06 | baseline login นักเรียนของระบบเดิม | เจ้าของ legacy/วิชาการ | BE-006 |
| GAP-AUTH-006 | กฎเลือกแถว `TStudentClassroomHistory` เมื่อย้ายห้อง/ซ้ำ | วิชาการ/DBA | TP001-079, BE-006 |

## Change Log

- 2026-10-29 — สรุปผลวัด pilot 093 จาก 12 run
