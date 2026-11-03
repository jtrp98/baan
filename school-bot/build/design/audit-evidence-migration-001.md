# Physical delta ของ audit reference

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 095 — DBA-005 และ DBA-006)

เอกสารนี้ระบุ delta ที่เสนอให้ vault เตรียม SQL/rollback หลังมนุษย์อนุมัติ ตาม [storage contract](audit-evidence-storage-001.md) ขณะรอคำตอบ baseline dictionary/DBML/SQL ยังไม่เปลี่ยน

## ขอบเขตที่ขออนุมัติ

เปลี่ยนเฉพาะ `public."SchoolBotAuditEvent"."Reason"` จาก `varchar(1000) NOT NULL` ไม่มี default เป็น `varchar(2048) NOT NULL` ไม่มี default ใน SchoolBot DB เดิม คงค่าเดิมทุกแถว ไม่มี backfill ตาราง/fields คง 32/450, PK32, SQL FK/UNIQUE/CHECK/standalone indexes0 ไม่เปลี่ยน common fields/identity ไม่แตะ Master/School/Logs/PGGradeDB API bounds ของ operation อื่นคงเดิม

## สิ่งส่ง vault หลังอนุมัติ

- Migration สำหรับตารางที่มีอยู่แล้ว แยกจาก full CREATE; ตรวจฐาน/scope และชนิด/NULL/default จาก catalog ถ้าไม่ตรง baseline ให้หยุด ไม่เดาว่า revision ในไฟล์คือฐานที่ deploy
- Rollback ลดกลับ 1000 เฉพาะเมื่อไม่มีค่าใดยาวเกิน 1,000 ตัวอักษร ต้องกัน concurrent writer ระหว่างตรวจและเปลี่ยนชนิดด้วย lock/transaction เดียวกัน ไม่ตรวจล่วงหน้าคนละครั้งกับ ALTER
- ถ้ามีข้อความยาวกว่า 1,000 ให้หยุด rollback ทั้งหมด คง schema/data ไว้ ห้าม substring/hash/ลบ audit/DROP ตาราง มนุษย์ต้องเลือกคง schema ที่ขยายแล้วหรือแผนเก็บรักษาข้อมูลใหม่
- ระบุผลกระทบของ lock และช่วงปิด writer จาก PostgreSQL version/catalog จริง ไม่อ้าง zero downtime จากไฟล์ SQL ห้ามเปิด writer รุ่นเก่าที่รับได้เพียง 1,000 ขณะมีข้อมูลยาวเกิน bound เดิม

Rollback เดิม `schoolbot_db_rollback.sql` เป็น DROP 32 ตารางแบบ empty-guard ไม่ใช่ rollback ของ delta นี้และห้ามใช้กับฐานปัจจุบัน

## เอกสารและการพิสูจน์หลังอนุมัติ

Arch ปรับ data-dictionary/table-005.md, แถว AuditEvent ใน data-dictionary/contract-002.md, schoolbot.dbml, data-model.md และ index-data.md ให้ตรง SQL ของ vault โดยคง 14 fields ของ AuditEvent ตรวจว่า integration subset มี field นี้หรือไม่ก่อนแก้ ไม่เพิ่มเส้นอ้างอิงที่ไม่จำเป็น

ต้องใช้ parser จริงกับ full DBML รายงาน tool/version/dialect/32 tables/450 fields/physical FK0 และ structural diff ที่เปลี่ยนเฉพาะ Reason 1000→2048 พร้อม Notes ที่เกี่ยวข้อง Keys/NULL/defaults/enum/FK endpoints/actions ต้องเดิม งานนี้ยังไม่แก้ DBML จึงไม่มี parser result ของ revision ใหม่ Parser ผ่านไม่ใช่ catalog parity/runtime acceptance

หลังได้รับอนุญาตต่อฐานทดสอบ ตรวจ round-trip 1000/1001/2048 ตัวอักษร รวมไทย/Unicode นอก BMP, ปฏิเสธ 2049, rollback เมื่อ audit ล้มเหลว, retry ไม่เพิ่ม event, read-back ตรง revision/tenant และ withdraw อ่าน ref เต็มจาก publish event พร้อม reason แยก ตรวจ downgrade ทั้งกรณีสำเร็จและกรณีหยุดโดยไม่เปลี่ยนข้อมูลเมื่อมีค่ายาวกว่า 1000

## คำถามถึงผู้มีอำนาจ

Task: DBA-005/DBA-006 · Reference: DES-005/DES-010/DES-007 · Reason: ความจุ physical ไม่รองรับ API 2048 ตัวอักษร ผู้ใช้อนุมัติให้ขยายเฉพาะ Reason เป็น varchar(2048) ตาม delta นี้ โดยคง API bounds และ rollback แบบไม่ตัดข้อมูลหรือไม่?

คำตอบปลดล็อก arch ปรับ canonical model/DBML และ vault เตรียม SQL คู่ ไม่ใช่อนุญาตรัน migration บน shared environment ทางเลือกคือ field/table evidence ใหม่ หรือให้ spec เสนอ business bound 1000 ทั้งสอง reference ซึ่งต้องตัดสินเพิ่ม ไม่มีตัวเลือกใดอนุมัติแทนผู้ใช้ในเอกสารนี้

## หลักฐาน

- `knowledge/school-bot/build/db/schoolbot_db.sql:116–130`; dba-005-learning-review.md/dba-095-review.md/dba-095-schema-parity.md ยืนยัน baseline/mismatch
- [มติ 044 (คง constraints เฉพาะ PK)](../../shared/decisions/decisions-044.md) คง types เดิม ไม่ได้อนุมัติขยาย Reason; [มติ 053 (เปิดงานบน stub)](../../shared/decisions/decisions-053.md) ให้คนรัน SELECT ไม่ได้อนุมัติ migration นี้
