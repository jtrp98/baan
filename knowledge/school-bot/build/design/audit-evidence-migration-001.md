# ผลทบทวน physical delta ของ audit reference

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — ไม่มี migration สำหรับ DBA-005/DBA-006)

**ไม่มี migration ตามมติ 054** ทั้ง DBA-005 (ฐานข้อมูล learning) และ DBA-006 (ฐานข้อมูล release) ใช้ [สัญญา storage ร่วม](audit-evidence-storage-001.md) โดย `approval_ref:T1000` และ `evidence_ref:T1000` เก็บตรงตัวใน `public."SchoolBotAuditEvent"."Reason" varchar(1000) NOT NULL` ไม่มี default ตรงกับ SQL และพจนานุกรมเดิม

## ข้อสรุปสำหรับ vault

- Physical delta = ไม่มี ไม่ขยาย column ไม่เพิ่ม field/table ไม่เปลี่ยน NULL/default, identity, keys/indexes, constraints หรือ common fields; คงฐาน 32 ตาราง/450 ฟิลด์และ Primary Key 32 รายการ ไม่มี SQL FK/UNIQUE/CHECK/standalone indexes ตาม baseline เดิม
- ไม่ต้องเตรียม migration, rollback, backfill หรือ SQL คู่ใหม่สำหรับสอง reference นี้ และไม่ใช้ `schoolbot_db_rollback.sql` ซึ่งเป็น DROP ตารางแบบ empty-guard กับงานนี้
- ทบทวน DBA-005/DBA-006 ใหม่ว่า API bound ตรง Reason 1,000 ตัวอักษรและไม่มี schema delta; mapping Event/EntityType, reader และ transaction คงตาม storage contract
- ไม่แก้ canonical dictionary/full DBML/integration DBML เพราะ physical model เดิมไม่เปลี่ยน ไม่มี parser revision ใหม่ในงานนี้ ไม่อ้าง parser pass หรือ catalog parity จากเอกสาร amendment

## การตรวจ implementation ที่ต้องทำต่อ

กรณีที่ต้องพิสูจน์คือข้อความ 1,000 ตัวอักษรเก็บและอ่านกลับตรงตัว; 1,001 ตัวอักษรคืน `400 INVALID_INPUT` ก่อน sign/domain mutation/audit โดยไม่ truncate/hash/split รวมไทยและ Unicode นอก Basic Multilingual Plane (BMP) ตรวจ rollback เมื่อ audit ล้มเหลว, retry ไม่เพิ่ม event, read-back ตรง revision/tenant และ withdraw อ่าน evidence จาก publish event เดิมแยกจาก reason ถอน

รายการนี้เป็นเกณฑ์ตรวจต่อสำหรับ implementation ไม่ใช่ผลทดสอบที่รันแล้ว งานนี้ไม่เชื่อมฐาน ไม่รัน SQL และไม่รับรอง release/runtime; เงื่อนไข trust/custody/authority และระบบจริงเดิมยังคงอยู่ สถานะปัจจุบันดู [สารบัญ design](index.md)

## หลักฐาน

- [มติ 054 (reference ไม่เกิน 1,000 ตัวอักษรและไม่ขยายฐานข้อมูล)](../../shared/decisions/decisions-054.md): คำตัดสินผู้ใช้วันที่ 2026-11-03
- `knowledge/school-bot/build/db/schoolbot_db.sql:116–130`: Reason varchar(1000) NOT NULL และคอลัมน์ AuditEvent เดิม
- `knowledge/school-bot/build/design/data-dictionary/table-005.md:21–33`: พจนานุกรมฟิลด์เดิม; การตรวจ source และข้อจำกัด implementation อยู่ในหัวข้อหลักฐานของ [สัญญา storage](audit-evidence-storage-001.md)
