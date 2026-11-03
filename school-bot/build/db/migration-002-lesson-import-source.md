# Migration 002 — ที่มาและการอนุมัติจากต้นทางราย Lesson

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (มติ 2026-11-03 — เพิ่มเฉพาะคอลัมน์)

ผลทบทวน: [forward SQL](migration-002-lesson-import-source.sql) เพิ่มเฉพาะ `SchoolBotLesson.ImportSource jsonb NULL` ตามมติผู้ใช้ ไม่มี DEFAULT, CHECK, unique/partial index, trigger หรือวัตถุอื่น รูปทรง JSON การกันนำเข้าซ้ำและรหัสคงเดิมเป็นหน้าที่ application ตาม [physical delta และรายการให้ arch ตรึง](migration-002-lesson-import-source-contract.md) ความเสี่ยงจากการไม่มี DB constraint ยังเปิด ไม่ใช่ผลรับรอง implementation

หนึ่ง Lesson เป็นหนึ่งบทเรียนใน curriculum revision หนึ่ง จึงเก็บ snapshot ที่มาและ D (การอนุมัติจากต้นทางรายแถว) ใน Lesson เดิมได้โดยไม่สร้างตารางหรือรหัสใหม่ ข้อเสนอ Rev1 ที่เพิ่ม CHECK/index ถูกแทนด้วย Rev2 นี้ ห้ามใช้ Rev1 ต่อ หากเคยรัน Rev1 หรือมีวัตถุชื่อเดิม ให้หยุดและส่ง schema จริงให้ vault ทบทวนจากเอกสาร ห้ามถอนวัตถุเอง

## ผลต่อข้อมูลเดิมและขอบเขต

- แถวเดิมทั้งหมดรวม published/retired อ่าน ImportSource เป็น SQL NULL ไม่มี backfill หรือ DEFAULT expression ที่ทำให้ rewrite ตาราง ไม่แตะ UpdateDate, LessonKey, กิจกรรม หรือสถานะเผยแพร่
- SQL NULL หมายถึงไม่มี provenance ที่ยืนยันได้ ไม่แปลว่าต้นทางไม่อนุมัติ application ต้องแยก source_approved เป็น true/false/JSON null และตรวจ object สี่ key ก่อนเขียน
- PostgreSQL บังคับเพียงชนิด jsonb/nullable; ไม่มีข้อบังคับรูปทรง ความตรงกับ LessonKey หรือความไม่ซ้ำเพิ่ม ทุก writer ต้องใช้ validation และ coordination เดียวกัน รวม idempotency-001 Rev2 และค้นก่อนเขียนในหน่วยเดียว
- ไม่แก้ schoolbot_db.sql/rollback เดิม ไม่สร้าง FK หรืออ่าน/เขียน legacy ไม่ใช้ Text, SourceRef envelope หรือ Audit.Reason แทน provenance

## เงื่อนไขก่อนมนุษย์รัน

1. ผู้ใช้อนุญาตเพิ่มเฉพาะคอลัมน์แล้วตามมติ 2026-11-03; arch ต้องตรึง application contract ก่อนเปิด writer การเลือกฐาน/เวลารันและการรันทุกคำสั่งเป็นหน้าที่มนุษย์
2. เจ้าของยืนยัน connection ไป SchoolBot DB ที่ถูกต้อง, PostgreSQL 15+, schema public, ตารางเดิมตรง baseline และสิทธิ์ DDL ห้ามเดา connection จากชื่อในเอกสาร
3. หยุด writer ตรวจ backup/วิธีกู้และเลือกช่วงที่รับ ACCESS EXCLUSIVE lock ได้ แม้ไม่มี table rewrite จาก DEFAULT ก็ยังมีความเสี่ยงรอ lock ให้มนุษย์ตั้ง session lock_timeout/statement_timeout ตามนโยบายก่อนรัน SQL ไฟล์นี้ไม่มีคำสั่งตั้งค่า session
4. ต้องยังไม่มี ImportSource และไม่มีวัตถุจากข้อเสนอ Rev1 หรือ migration อื่น ตรวจหลักฐานก่อนรัน forward มีคำสั่ง ADD COLUMN เดียวที่ atomic แต่ไม่ใช่ idempotent: รันซ้ำจะ error ห้ามใช้ IF NOT EXISTS กลบ schema drift หาก connection ขาดหลังส่งคำสั่งให้มนุษย์ตรวจ catalog ก่อนตัดสินใจ retry

## ขั้นที่ผู้ใช้ต้องรันเอง

คำสั่งต่อไปนี้เป็นคำสั่งส่งมอบ ยังไม่ได้รัน ห้ามใส่ credential ลงไฟล์หรือหลักฐานส่งกลับ

```powershell
# ใช้ connection/service ที่เจ้าของยืนยันและตั้ง timeout ก่อนแล้ว
psql -X -v ON_ERROR_STOP=1 -f .\migration-002-lesson-import-source.sql
```

เมื่อ error ให้คง writer ปิดและตรวจสาเหตุ ไม่ข้ามข้อผิดพลาด หลังสำเร็จให้มนุษย์บันทึกผล catalog และทดสอบ rollback บนฐานทดสอบที่อนุมัติ ก่อนใช้จริง ต้องพิสูจน์ทั้งกรณีไม่มี provenance และกรณี guard ปฏิเสธเมื่อมีข้อมูลหรือ dependency ยังไม่มีผล runtime ของชุดนี้

## คำสั่งตรวจหลังรัน (มนุษย์รันเอง)

```sql
-- คาด ImportSource=jsonb, nullable=true, default_expr=NULL, generated='', identity=''
SELECT a.attname, format_type(a.atttypid,a.atttypmod) AS type,
       NOT a.attnotnull AS nullable, a.attgenerated AS generated,
       a.attidentity AS identity,
       pg_get_expr(d.adbin,d.adrelid) AS default_expr
FROM pg_attribute a
LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE a.attrelid='public."SchoolBotLesson"'::regclass
  AND a.attname='ImportSource' AND NOT a.attisdropped;

-- คาดไม่มี dependency: migration นี้ไม่เพิ่ม constraint/index
SELECT d.classid::regclass AS object_catalog, d.objid, d.objsubid, d.deptype
FROM pg_depend d
JOIN pg_attribute a ON a.attrelid=d.refobjid AND a.attnum=d.refobjsubid
WHERE d.refclassid='pg_class'::regclass
  AND a.attrelid='public."SchoolBotLesson"'::regclass
  AND a.attname='ImportSource' AND NOT a.attisdropped;
```

เทียบ constraint/index inventory ก่อนและหลังด้วยวิธีของเจ้าของ: ต้องไม่เพิ่มจาก migration นี้ หาก baseline ตรงผลตรวจเดิม คาด 32 ตาราง/451 ฟิลด์, PK32, FK0, CHECK0, unique constraint0 และ index32 (เฉพาะ PK) ตัวเลขนี้อ้าง baseline จากผลตรวจ Rev1 ไม่ใช่ catalog ที่ deploy แล้ว และไม่ครอบคลุม migration อื่น

## Rollback ที่ไม่สูญข้อมูล

**DESTRUCTIVE ต่อโครงสร้าง:** [rollback SQL](migration-002-lesson-import-source-rollback.sql) ถอนเฉพาะ ImportSource เมื่อทุกแถวเป็น SQL NULL ชนิด/NULL/default/generated ตรงแบบ และไม่มี dependency ใด ตรวจใต้ ACCESS EXCLUSIVE lock และ row_security=off ถ้าข้อมูลถูก RLS ซ่อน สิทธิ์ไม่พอ มี provenance แม้ JSON null หรือมี dependency จะหยุด transaction ไม่มี CASCADE ไม่ล้าง provenance ไม่ลบ Lesson

ไม่มี COMMENT marker ตามมติที่เพิ่มเฉพาะคอลัมน์ มนุษย์ต้องยืนยันจากหลักฐานรันว่าเป็นคอลัมน์ที่ migration นี้เพิ่มและไม่มี consumer ใช้งานแล้ว การตรวจ catalog ไม่พิสูจน์ที่มาของคอลัมน์หรือ dependency ของ application นอกฐาน หากไม่แน่ใจให้คง schema และข้อมูลไว้

```powershell
# มนุษย์รันหลังหยุด writer และยืนยันที่มาคอลัมน์/ไม่มี consumer หรือ migration ใหม่พึ่ง
psql -X -v ON_ERROR_STOP=1 -f .\migration-002-lesson-import-source-rollback.sql
```

หลังถอนสำเร็จคำสั่งตรวจคอลัมน์ต้องคืนศูนย์แถว rollback ซ้ำเป็น no-op เมื่อไม่มีคอลัมน์ หาก guard หยุดให้ใช้ forward fix ที่ทบทวนใหม่ ห้ามล้างข้อมูลหรือถอน dependency เพื่อบังคับให้ผ่าน

## หลักฐาน

- มติผู้ใช้ในใบงาน 097 วันที่ 2026-11-03: "เพิ่ม column ได้ แต่ไม่เพิ่ม index หรืออะไรทั้งนั้น เพิ่มได้ คอลลั่ม" และกติการ่วม normal-097/_common.txt
- อ่าน forward/rollback/เอกสาร migration ทั้งห้าไฟล์และรายงานรอบก่อน normal-097/vault-A.out; รายการผลตรวจ baseline ของรอบก่อนแยกใน [ผลทบทวน](migration-002-lesson-import-source-review.md)
- อ่าน [idempotency-001 Rev2](../design/idempotency-001.md) เพื่อเสนอ application contract; ไม่ตรวจ importer implementation หรือรัน SQL รวม SELECT
