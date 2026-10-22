# SQL Review Rev3 — ถอน index และรวมไฟล์ต่อ database

> หมายเหตุ MYCELIUM 2026-10-22: ตาราง SchoolBot ย้ายไป SchoolBot DB (10.0.0.128:9499) ตาม decisions-027 — ไฟล์ปัจจุบันดู [review-004](review-004.md)

วันที่: 2026-10-22 · ผู้บันทึก: MYCELIUM ตามคำสั่งผู้ใช้ · สถานะ: DRAFT — ยังไม่เคยรัน

## คำสั่งผู้ใช้

"เอา index ออกนะ ไม่ต้องใช้ แล้วก็ไฟล์ sql ขออันเดียว ถ้าอยู่ใน database เดียวกัน"

## สิ่งที่เปลี่ยนจาก Rev2 ([review-002](review-002.md))

- ถอน partial index `ix_schoolbot_license_active_school` ที่ DBA เพิ่มใน Rev2 — ส่วน 001 กลับเป็นเนื้อหา Rev1 ทุกประการ; การตรวจ License active ของโรงเรียนสำหรับ `school_web` (decisions-025/026) ยังต้องทำในชั้น application โดยไม่มี index เฉพาะ
- รวม 001–006 (School DB) เป็นไฟล์เดียว ไม่แก้เนื้อหา SQL — ตัดเฉพาะ `BEGIN;`/`COMMIT;` ของแต่ละไฟล์ แล้วครอบทั้งไฟล์ด้วย transaction เดียว; คงหัวข้อ section และ comment เดิมของแต่ละส่วน
- PGGradeDB มีไฟล์เดียวอยู่แล้ว เปลี่ยนแค่ชื่อไฟล์ เนื้อหาเหมือน `007_*` เดิม
- ไฟล์แยกเดิมเก็บที่ `archive/split-rev1/` (001 ฉบับ Rev2 ที่มี index อยู่ที่ `archive/rev1/` ไม่ได้ใช้แล้ว — Rev1 ของ 001 ถูกคืนมาใช้)

## ไฟล์ปัจจุบัน

| Database | Migration | Rollback | หมายเหตุ |
|---|---|---|---|
| School DB (JabjaiSchoolSingleDB) | [schoolbot_schooldb.sql](schoolbot_schooldb.sql) | [schoolbot_schooldb_rollback.sql](schoolbot_schooldb_rollback.sql) | 33 ตาราง; rollback เรียง 006 → 001 และ DROP ข้อมูล SchoolBot ทั้งหมด |
| PGGradeDB | [schoolbot_pggradedb_grants.sql](schoolbot_pggradedb_grants.sql) | [schoolbot_pggradedb_grants_rollback.sql](schoolbot_pggradedb_grants_rollback.sql) | GRANT เท่านั้น ห้ามรันจนผ่าน 5 gates ของ DES-009 |

## ผลต่อการรันและ DBA-003

- School DB รันครั้งเดียวจบ: ส่วนใดล้ม = rollback ทั้งไฟล์ ไม่มีสถานะครึ่งทาง (ต่างจากไฟล์แยกที่รันได้ทีละส่วน)
- เช็กลิสต์ DBA-003 ใน review-001 §7 ยังใช้ได้; ตัดข้อตรวจ `ix_schoolbot_license_active_school` ใน review-002 §4 ข้อ 1 ออก (ข้อ 2 เรื่อง CHECK ของ Session ยังใช้)
- role `schoolbot_app` เป็นระดับ cluster: rollback ของ School DB ไม่ DROP role (REVOKE สิทธิ์ schema เท่านั้น) จึงไม่ชนกับ GRANT ใน PGGradeDB ถ้าอยู่ cluster เดียวกัน
- ยังไม่ได้ตรวจ syntax ด้วย parser หรือฐานทดสอบ

## Change Log

- 2026-10-22 — MYCELIUM ถอน index ตามคำสั่งผู้ใช้และรวมไฟล์ต่อ database; เนื้อหา SQL ส่วนอื่นไม่เปลี่ยน
