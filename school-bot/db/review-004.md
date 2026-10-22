# SQL Review Rev4 — ย้ายตาราง SchoolBot ไป SchoolBot DB

> หมายเหตุ MYCELIUM 2026-10-22: ผู้ใช้สั่งไม่แตะ School DB / PGGradeDB — ไฟล์ grants สองคู่ย้ายไป `archive/grants-not-used/` ตาม [decisions-029](../requirement/decisions-029.md); เหลือไฟล์ SchoolBot DB คู่เดียว

วันที่: 2026-10-22 · ผู้บันทึก: MYCELIUM ตาม [decisions-027](../requirement/decisions-027.md) · สถานะ: DRAFT — ยังไม่เคยรัน

## คำสั่งผู้ใช้

"SchoolBot ใน 10.0.0.128 Port 9499 อันนี้นะ ไม่ใช่ SchoolDB"

## ไฟล์ปัจจุบัน (หนึ่งไฟล์ต่อหนึ่ง database + rollback)

| Database | Migration | Rollback | เนื้อหา |
|---|---|---|---|
| SchoolBot DB — 10.0.0.128:9499 (ชื่อ DB `SchoolBot` เป็นสมมติฐาน) | [schoolbot_db.sql](schoolbot_db.sql) | [schoolbot_db_rollback.sql](schoolbot_db_rollback.sql) | สร้าง role `schoolbot_app` + ตาราง SchoolBot 33 ตาราง; rollback DROP ตารางและข้อมูลทั้งหมด |
| School DB (JabjaiSchoolSingleDB) | [schoolbot_schooldb_grants.sql](schoolbot_schooldb_grants.sql) | [schoolbot_schooldb_grants_rollback.sql](schoolbot_schooldb_grants_rollback.sql) | สร้าง role ถ้ายังไม่มี + GRANT SELECT ตาราง legacy 12 ตาราง (TUser, TEmployees, TPlan*, TTerm*, TStudentClassroomHistory ฯลฯ) |
| PGGradeDB | [schoolbot_pggradedb_grants.sql](schoolbot_pggradedb_grants.sql) | [schoolbot_pggradedb_grants_rollback.sql](schoolbot_pggradedb_grants_rollback.sql) | GRANT เท่านั้น ห้ามรันจนผ่าน 5 gates ของ DES-009 |

## สิ่งที่เปลี่ยนจาก Rev3 ([review-003](review-003.md))

- `schoolbot_schooldb.sql` → `schoolbot_db.sql`: เปลี่ยนเฉพาะ comment ที่ระบุ target database; เอา block GRANT SELECT ตาราง legacy (เดิมใน section 006) ออก เพราะตาราง legacy ไม่อยู่ใน SchoolBot DB
- block GRANT/REVOKE ตาราง legacy ย้ายไปไฟล์ใหม่ `schoolbot_schooldb_grants*.sql` ที่รันบน School DB
- PGGradeDB ไม่เปลี่ยนเนื้อหา แก้แค่ชื่อไฟล์ใน comment
- ฉบับก่อนหน้าเก็บที่ `archive/schooldb-placement/`

## ผลต่อการรัน

- ลำดับ: `schoolbot_db.sql` (SchoolBot DB) → `schoolbot_schooldb_grants.sql` (School DB) → `schoolbot_pggradedb_grants.sql` (PGGradeDB หลังผ่าน gates) — แต่ละไฟล์ใช้ transaction ของ DB ตัวเอง ไม่มี transaction ครอบข้าม DB
- role `schoolbot_app` เป็นระดับ cluster: ถ้า 3 DB อยู่คนละ cluster ต้องสร้าง role (และ LOGIN/รหัสผ่านของ app user) แยกทุก cluster — ทุกไฟล์มี `CREATE ROLE ... IF NOT EXISTS` แบบ NOLOGIN แล้ว; การสร้าง login user และรหัสผ่านเป็นงานของคนดูแล DB ไม่อยู่ใน SQL นี้
- ยังไม่มี GRANT สำหรับ Master DB (อ่านบัญชีตาม decisions-011/DES-004) — DBA ต้องเพิ่มถ้าแบบยังอ่าน Master ตรง

## ผลต่อแบบ (ส่ง SA)

- ข้อความ "ทุกตาราง SchoolBot อยู่ School DB / commit ใน School transaction เดียว" ใน data-model/DES-004/005/008–012 ไม่ถูกแล้ว — การอ่านสิทธิ์/roster/term จาก School DB กับการเขียน SchoolBot DB ไม่อยู่ใน transaction เดียว ต้อง re-check ก่อน commit และระบุ consistency ที่ยอมรับได้
- DBML/schema-notes ต้องระบุ database ใหม่

## Change Log

- 2026-10-22 — ถอนไฟล์ grants School DB/PGGradeDB ตาม decisions-029
- 2026-10-22 — CreateBy/UpdateBy ทุกตารางใน schoolbot_db.sql เป็น `integer NULL` ตาม [decisions-028](../requirement/decisions-028.md)
- 2026-10-22 — MYCELIUM แยก SQL ตาม decisions-027; เนื้อหา DDL ของตาราง SchoolBot ไม่เปลี่ยน
