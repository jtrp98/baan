# DB Safe Evidence 001 — ชุดคำขอหลักฐานจากผู้ดูแลฐานข้อมูล legacy (รวบชุดเดียว)

วันที่: 2026-10-24 · ผู้เตรียม: vault · ผู้ขอต้นทาง: arch (TR-AUTH-03..06 ตาม design/auth-evidence-001.md Rev4) · ผู้ตอบ: เจ้าของ/DBA ของ Master DB และ School DB (ตารางเก่าอยู่อีก DB ที่ทีมยังไม่มี DDL)

หลักปลอดภัยของชุดนี้ (ทุกรายการ):

1. ขอเฉพาะโครงสร้าง (schema-only) และผลนับ aggregate — **ไม่ขอค่าจริงที่เป็น PII** (ไม่ขอ username, hash รายแถว, ชื่อ, เลขบัตร ฯลฯ)
2. กลุ่มไหนนับได้ < 5 แถว ให้ผู้ตอบรวมเป็น "<5"/"other" ก่อนส่ง (กัน re-identify จากกลุ่มเล็ก) และต้องใช้**กลุ่มที่ไม่ทับซ้อนกัน** พร้อมตรวจ complementary suppression ทั้งชุดก่อนส่ง — ยอดรวมลบกลุ่มที่เปิดเผยต้องไม่ย้อนหาจำนวนกลุ่มที่ซ่อนได้ (เพิ่มตาม jpo 060f)
3. การรันทุกคำสั่งเป็นพระราชกิจของมนุษย์ (CONVENTIONS §9) — vault เขียนตัวอย่างได้ แต่ห้ามรันเด็ดขาด
4. ผลลัพธ์ต้องผ่านการตรวจว่าปลอด PII รายแถวก่อนบันทึกเข้า knowledge ใดๆ
5. ชื่อคอลัมน์ที่อ้าง (nSystemID, sID, sEmp, cType, cDel, PasswordHash, WorkStatus) มาจาก as-built port ที่ auth-evidence-001 อ้าง — (สมมติฐาน — ยังไม่ยืนยัน) จนกว่าจะได้ DDL จริงจาก EV-01..03
6. DDL (EV-01..03) ส่งเฉพาะ metadata ตามรายการอนุญาต (ชื่อคอลัมน์/ชนิด/NULL/DEFAULT/index/constraint) — DEFAULT/CHECK/index expression/comment อาจมี literal ที่ไม่ควรเปิดเผย จึงต้องตรวจ literal ก่อนส่ง และ**ห้ามส่ง raw dump โดยไม่ทบทวน** (แก้ตาม jpo 060f — ยกเลิกข้อความ "ปลอด PII 100%" เดิม)

## EV-01 — DDL (schema-only) ของ Master.TUser

- เหตุผล: TR-AUTH-04 — M3 (case/collation ของ username และ unique index ยัง unproven), C5 (trim/case), C6 (ความหมาย CDel: null กับ '1'), ชนิดจริงของ cType/cDel (เช่น char nullable) กระทบ query adapter ของ SchoolBot
- ผู้ขอ: arch (SA-001/BE-001) ผ่าน นายช่าง · ผู้ตอบ: เจ้าของ Master DB
- รูปแบบผลลัพธ์ที่ยอมรับ: `pg_dump --schema-only` เฉพาะตาราง / `\d+` / output ของ information_schema.columns + pg_indexes + pg_constraint — ต้องเห็น: ชื่อคอลัมน์ ชนิด NULL-able DEFAULT collation index/constraint ทั้งหมด
- ไม่ขอ: ข้อมูลแถวใดๆ ทั้งสิ้น

## EV-02 — DDL (schema-only) ของ TEmployees

- เหตุผล: TR-AUTH-04 + M8/C10 — การใช้ nSystemID กับ sID กับ sEmp ต่างกันในแต่ละจุดตรวจ (identity ใช้ nSystemID แต่ WorkStatus ใช้ sID; comment ว่า user_id = TEmployees.sEmp) — ต้องเห็น key และชนิดจริงเพื่อฟันธง
- ผู้ขอ/ผู้ตอบ/รูปแบบที่ยอมรับ: เช่น EV-01 (เพิ่ม: ชนิด/NULL ของ sEmp, sID, nSystemID, WorkStatus, CDel)
- ไม่ขอ: ข้อมูลแถวใดๆ

## EV-03 — DDL (schema-only) ของ TEmpSalaries

- เหตุผล: TR-AUTH-04 + M6/BL-002/BL-004 — การตรวจพนักงานพ้นสภาพของ legacy อ่าน TempSalary โดยไม่กรอง SchoolId — SchoolBot ต้องรู้ key/column จริงเพื่อเขียน query ตรวจสถานะพนักงานที่ถูกต้องและไม่ลอกช่องโหว่
- ผู้ขอ/ผู้ตอบ/รูปแบบที่ยอมรับ: เช่น EV-01
- ไม่ขอ: ข้อมูลแถวใดๆ (เงินเดือนเป็นข้อมูลอ่อนไหวมาก)

## EV-04 — Aggregate ปลอด PII: ความสัมพันธ์ nSystemID ↔ sEmp/sID (TR-AUTH-03 + M8/C10)

- เหตุผล: TR-AUTH-03 (key ของ staff bootstrap คือ (school_id, user_id)) ยังขาดข้อมูลจริง — ต้องรู้ว่า nSystemID ของ TUser ตรงกับ TEmployees.sEmp มากน้อยเพียงใด เพื่อยืนยันว่า user_id ที่ใช้เป็น key ได้จริง
- สิ่งที่ขอ (count รวมเท่านั้น):
  (a) จำนวนแถว TUser ทั้งหมด แยกตาม cType แต่ละค่า
  (b) จำนวนแถวที่ nSystemID IS NULL และ NOT NULL
  (c) จำนวนแถวที่ nSystemID ตรงกับ TEmployees.sEmp / ตรงกับ sID ของแถวตัวเอง / ตรงทั้งคู่ / ไม่ตรงอะไรเลย
- ตัวอย่างรูปแบบ (ผู้ดูแลปรับได้ ต้องคงคุณสมบัติ aggregate-only):
  `SELECT cType, count(*) FROM ... GROUP BY cType;`
  `SELECT count(*) FILTER (WHERE ...), count(*) FILTER (WHERE ...) FROM ...;` (join/เทียบแบบ count เท่านั้น)
- รูปแบบผลลัพธ์ที่ยอมรับ: ตาราง count รวมรายกลุ่ม — ไม่มีค่ารายแถว ไม่มี username/id จริง
- ไม่ขอ: ค่า nSystemID/sEmp/sID รายแถว

## EV-05 — Aggregate ปลอด PII: รูปแบบชนิดของ PasswordHash (TR-AUTH-03/05 + M4/C2/C3)

- เหตุผล: ต้องยืนยันสัดส่วนรูปแบบ hash (SHA-1 hex ยาว 40 อักษร / prefix 'v2:' / อื่น) เพื่อเลือก verifier อ้างอิงของ Desktop login (C1–C3) โดยไม่ต้องเห็น hash จริง
- สิ่งที่ขอ (count รวมเท่านั้น): **ป้ายประเภทคงที่ที่คำนวณภายใน DB** เช่น `SHA1_HEX_40`, `V2_FORMAT`, `NULL_OR_EMPTY`, `OTHER` — ความยาวใช้ช่วงที่กำหนดล่วงหน้า (เช่น `LEN_40`, `LEN_OTHER`) ไม่ใช่ค่ารายแถว
- ตัวอย่างรูปแบบ: `SELECT CASE WHEN PasswordHash IS NULL OR PasswordHash='' THEN 'NULL_OR_EMPTY' WHEN PasswordHash LIKE 'v2:%' THEN 'V2_FORMAT' WHEN PasswordHash ~ '^[0-9a-fA-F]{40}$' THEN 'SHA1_HEX_40' ELSE 'OTHER' END AS kind, count(*) FROM ... GROUP BY 1;` (ตรวจรูปแบบ hex ครบ 40 ตัวอักษรด้วย — length=40 อย่างเดียวยังแยก SHA-1 hex ไม่ถูกต้อง ตามข้อสังเกต check 060f)
- รูปแบบผลลัพธ์ที่ยอมรับ: ตาราง (kind, count) — กลุ่ม < 5 รวมเป็น "other"
- **ห้ามส่ง prefix/suffix จริงของ hash ไม่ว่าส่วนใด** (แก้ตาม jpo 060f: `left(PasswordHash,3)` เดิมเปิดเผยส่วนของ credential จริง แม้แสดงเป็นกลุ่ม ≥5)

## EV-06 — (เสริม, optional) Aggregate กลุ่มบัญชีนักเรียน (ช่วย TR-AUTH-06)

- เหตุผล: TR-AUTH-06 (เส้นทาง login นักเรียน) ไม่มีหลักฐาน source/runtime — การรู้ว่ามีบัญชี TUser กลุ่มนักเรียนอยู่จริงเท่าใด (นับตาม cType ที่ระบุนักเรียน หรือ sID ที่ชี้นักเรียน) ช่วยประกอบพิจารณา
- สิ่งที่ขอ: count รวมตามกลุ่ม — aggregate-only เช่น EV-04
- ไม่ขอ: ค่ารายแถวใดๆ

## ลำดับที่แนะนำ

EV-01..03 ก่อน (schema-only พร้อมตรวจ literal ตามหลักข้อ 6 และปลดล็อก TR-AUTH-04 รวมทั้งยืนยันชื่อคอลัมน์ให้ EV-04..06 แม่นขึ้น) → EV-04/05 (ปลดล็อก TR-AUTH-03/05) → EV-06 (เสริม TR-AUTH-06)
ผลที่ได้ทั้งหมดส่งเข้า design/auth-evidence-001.md revision ถัดไป โดย arch ตรวจก่อนว่าปลอด PII รายแถวจริง

## Change Log

- 2026-10-24 — สร้างครั้งแรก (ใบงาน060c): รวบคำขอหลักฐาน TR-AUTH-03..06 เป็นชุดเดียวแบบปลอด PII — รันโดย นายช่าง solo (subagent role vault)
- 2026-10-24 — แก้ตามผลตรวจ jpo ใบงาน060f (สวมบท vault โดยนายช่าง solo ตรง): EV-05 เลิกขอ raw prefix เปลี่ยนเป็นป้ายประเภทคงที่ที่คำนวณใน DB, เพิ่มกฎกลุ่มไม่ทับซ้อน + complementary suppression, ถอนข้อความ "ปลอด PII 100%" ของ EV-01..03 พร้อมบังคับตรวจ literal/ห้าม raw dump
