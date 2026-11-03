# Migration 002 — ที่มาและการอนุมัติจากต้นทางราย Lesson

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 097 — ทบทวน schema ของ BE-028 การนำเข้าแผนรายวิชา)

ผลทบทวน: รูปทรง `SchoolBotLesson.ImportSource` ใช้ได้เมื่อเพิ่ม CHECK และ unique index ตาม [forward SQL](migration-002-lesson-import-source.sql) แต่ยังรอผู้ใช้อนุมัติ schema และ arch ตรึงสัญญา API/transaction ก่อนใช้จริง การอนุมัติส่งทบทวนวันที่ 2026-11-03 ไม่ใช่การอนุมัติรัน SQL

เหตุผล: หนึ่ง Lesson เป็นหนึ่งบทเรียนใน curriculum revision หนึ่ง จึงเก็บ snapshot ที่มาและ D ของแถวต้นทางใน Lesson เดิมได้โดยไม่สร้างตาราง/รหัสใหม่ รายละเอียดฟิลด์ ข้อจำกัด และสิ่งที่ arch ต้องแก้อยู่ใน [physical delta และสัญญาที่เสนอ](migration-002-lesson-import-source-contract.md)

## ผลต่อข้อมูลเดิมและขอบเขต

- เพิ่ม `ImportSource jsonb NULL` ไม่มี DEFAULT expression; ค่าเริ่มต้นที่อ่านได้เป็น SQL NULL ทุกแถวเดิม รวม published/retired ไม่มี backfill และไม่แตะ `UpdateDate`, LessonKey, กิจกรรม หรือสถานะเผยแพร่
- SQL NULL หมายถึงไม่มี provenance ที่ยืนยันได้ ไม่แปลว่าต้นทางไม่อนุมัติ; JSON object ต้องมีทั้งสี่ key โดย `source_approved` แยก true/false/JSON null
- SQL บังคับโครงสร้าง, identity ตรง LessonKey, global SchoolId และความไม่ซ้ำเฉพาะแถวที่มี ImportSource รวม soft-deleted rows ความสัมพันธ์กับ parent และการห้ามแก้ published children ยังเป็น application checks ตามฐานเดิม
- ไม่แก้ `schoolbot_db.sql`/rollback เดิม ไม่สร้าง FK ข้ามฐาน ไม่อ่าน/เขียน legacy table ไม่ใช้ Text, SourceRef envelope หรือ Audit.Reason เป็นที่เก็บ provenance

## เงื่อนไขก่อนมนุษย์รัน

1. ผู้ใช้อนุมัติ field/constraint/index และ arch ตรึง delta ใน DES-005 (หลักสูตรและการนำเข้า) รวมกฎ lock/publish/read-back ก่อนเปิด writer
2. เจ้าของยืนยัน connection ไป SchoolBot DB ที่ถูกต้อง, PostgreSQL 15+, schema `public`, ตาราง/ฟิลด์เดิมตรง baseline และผู้รันเป็นเจ้าของตารางหรือมีสิทธิ์ DDL อย่านำชื่อฐานจากเอกสารไปเดา connection
3. หยุด writer ชั่วคราว ตรวจ backup/การกู้ตามวิธีของเจ้าของ และเลือกช่วงที่รับ ACCESS EXCLUSIVE lock ได้ ทั้ง CHECK validation และการสร้าง index ปกติอาจสแกนตารางเดิม; timeout ไม่ใช่ผลสำเร็จ
4. ต้องไม่มี ImportSource/วัตถุชื่อเดียวกันจาก migration อื่น กรณีรันซ้ำต้องมีชนิด/marker/องค์ประกอบเดิมครบ สคริปต์ไม่ซ่อม schema drift โดยเดา; marker ไม่ทดแทนการเทียบ definition จาก catalog

## ขั้นที่ผู้ใช้ต้องรันเอง

คำสั่งต่อไปนี้เป็นคำสั่งส่งมอบ ยังไม่ได้รัน ห้ามใส่ credential ลงไฟล์หรือหลักฐานส่งกลับ

```powershell
# ใช้ connection/service ที่เจ้าของตั้งไว้แล้วผ่าน PG* หรือวิธีขององค์กร
psql -X -v ON_ERROR_STOP=1 -f .\migration-002-lesson-import-source.sql
```

ทั้งไฟล์เป็น transaction เดียว ตั้ง lock timeout 5 วินาทีและ statement timeout 60 วินาที ถ้า error ให้คง writer ปิด ตรวจสาเหตุ และ retry ทั้งไฟล์หลัง transaction ถูก rollback ห้ามข้ามคำสั่งที่ล้ม การรันซ้ำหลังสำเร็จเป็น no-op; วัตถุชื่อชนหรือองค์ประกอบขาดจะหยุด

มนุษย์รัน catalog queries ด้านล่างและบันทึก definition/ผลจริง จากนั้นทดสอบ forward ซ้ำ, rollback ก่อนมี provenance, forward อีกครั้ง และทดสอบ rollback ถูกปฏิเสธหลังมี provenance บนฐานทดสอบที่อนุมัติเท่านั้น ยังไม่มีผล runtime ของชุดนี้

## คำสั่งตรวจหลังรัน (มนุษย์รันเอง)

```sql
-- คาด ImportSource=jsonb, nullable=true, default_expr=NULL, generated=''
SELECT a.attname, format_type(a.atttypid,a.atttypmod) AS type,
       NOT a.attnotnull AS nullable, a.attgenerated AS generated,
       pg_get_expr(d.adbin,d.adrelid) AS default_expr,
       col_description(a.attrelid,a.attnum) AS marker
FROM pg_attribute a
LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
WHERE a.attrelid='public."SchoolBotLesson"'::regclass
  AND a.attname='ImportSource' AND NOT a.attisdropped;

-- คาด CHECK หนึ่งรายการ validated=true; เทียบ expression กับ forward SQL
SELECT conname, contype, convalidated, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid='public."SchoolBotLesson"'::regclass
  AND conname='CK_SchoolBotLesson_ImportSource_v1';

-- คาด unique/valid/ready=true; btree (CurriculumId,LessonKey)
-- predicate ImportSource IS NOT NULL; ไม่มีตัวกรอง IsDelete
SELECT i.indisunique, i.indisvalid, i.indisready,
       pg_get_indexdef(i.indexrelid) AS definition
FROM pg_index i
WHERE i.indexrelid=to_regclass('public."UX_SchoolBotLesson_ImportSource_Row_v1"');
```

หลัง forward คาด 32 ตาราง/451 ฟิลด์, PK32, FK0, CHECK1, unique constraint0 และ unique index เพิ่มหนึ่งรายการนอก PK (รวม index33) เฉพาะเมื่อฐานก่อนหน้าตรงไฟล์เดิมและไม่มี migration อื่น ตัวเลขนี้เป็น expected จากไฟล์ ไม่ใช่ผล catalog ที่ deploy แล้ว

## Rollback ที่ไม่สูญข้อมูล

**DESTRUCTIVE ต่อโครงสร้าง:** [rollback SQL](migration-002-lesson-import-source-rollback.sql) ถอน CHECK/index/column เฉพาะเมื่อทุกแถวเป็น SQL NULL ตรวจภายใต้ ACCESS EXCLUSIVE lock และ `row_security=off` หากมี provenance, สิทธิ์ไม่พอ หรือโครงสร้างผิดจะหยุดทั้ง transaction ไม่มี CASCADE และไม่ลบ Lesson

```powershell
# มนุษย์รันหลังหยุด writer และตรวจว่าไม่มี migration ใหม่พึ่งคอลัมน์นี้
psql -X -v ON_ERROR_STOP=1 -f .\migration-002-lesson-import-source-rollback.sql
```

หลังถอนสำเร็จ catalog queries ทั้งสามต้องคืนศูนย์แถว; rollback ซ้ำเป็น no-op เมื่อ column และวัตถุที่เกี่ยวถูกถอนไปแล้ว หากมี provenance ให้เก็บ schema และข้อมูลไว้ ใช้ forward fix ที่ทบทวนใหม่ ห้ามล้าง provenance เพื่อให้ guard ผ่าน

## หลักฐาน

- อ่าน `_common.txt` ของใบงาน 097, BE-028 และ acceptance ใน tasks-001.json; ขอบเขต AC-045-01..04 คือเก็บ D/ที่มา, ตัด O, สื่ออยู่ Lesson เดียว และ identity คงเดิม
- [SQL เดิม](schoolbot_db.sql), [rollback เดิม](schoolbot_db_rollback.sql), [พจนานุกรม Lesson](../design/data-dictionary/table-013.md) และ [DBML เต็ม](../design/schoolbot.dbml) เป็นหลักฐาน static เท่านั้น
- ผลตรวจไฟล์และรายการ mismatch ส่ง arch อยู่ท้าย [physical delta](migration-002-lesson-import-source-contract.md); ไม่เชื่อมฐานหรือรัน SQL รวมถึง SELECT
