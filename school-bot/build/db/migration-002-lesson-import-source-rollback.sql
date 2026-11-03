-- Rollback 002: ถอนเฉพาะโครงสร้าง provenance ที่ยังไม่มีข้อมูล
-- Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 097)
-- DESTRUCTIVE ต่อโครงสร้าง: DROP CHECK/index/column; ห้ามทำหากมี ImportSource
-- ไม่มีการลบ/เปลี่ยน Lesson หรือสำรองข้อมูลแล้ว DROP; ไม่มี CASCADE
-- มนุษย์อนุมัติและรันเอง หลังหยุด writer; อ่านคู่มือก่อนใช้
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;
SET LOCAL row_security = off;
LOCK TABLE public."SchoolBotLesson" IN ACCESS EXCLUSIVE MODE;

DO $rollback_002$
DECLARE
    migration_tag constant text := 'schoolbot:migration-002:rev1';
    lesson_oid oid := 'public."SchoolBotLesson"'::regclass;
    column_record record;
    has_provenance boolean;
BEGIN
    SELECT a.*, pg_catalog.col_description(a.attrelid, a.attnum) AS marker
      INTO column_record FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = lesson_oid AND a.attname = 'ImportSource' AND NOT a.attisdropped;
    IF NOT FOUND THEN
        IF EXISTS (SELECT 1 FROM pg_catalog.pg_constraint
                    WHERE conrelid = lesson_oid AND conname = 'CK_SchoolBotLesson_ImportSource_v1')
           OR pg_catalog.to_regclass('public."UX_SchoolBotLesson_ImportSource_Row_v1"') IS NOT NULL THEN
            RAISE EXCEPTION 'หยุด: ไม่พบคอลัมน์แต่มีวัตถุชื่อ migration-002 ค้างอยู่';
        END IF;
        RETURN;
    END IF;
    IF column_record.atttypid <> 'jsonb'::regtype OR column_record.attnotnull
       OR column_record.atthasdef OR column_record.attgenerated <> ''
       OR column_record.marker IS DISTINCT FROM migration_tag
       OR NOT EXISTS (
           SELECT 1 FROM pg_catalog.pg_constraint c
            WHERE c.conrelid = lesson_oid AND c.conname = 'CK_SchoolBotLesson_ImportSource_v1'
              AND c.contype = 'c' AND c.convalidated
              AND pg_catalog.obj_description(c.oid, 'pg_constraint') = migration_tag
       ) OR NOT EXISTS (
           SELECT 1 FROM pg_catalog.pg_index i
            WHERE i.indrelid = lesson_oid
              AND i.indexrelid = pg_catalog.to_regclass('public."UX_SchoolBotLesson_ImportSource_Row_v1"')
              AND i.indisunique AND i.indisvalid
              AND pg_catalog.obj_description(i.indexrelid, 'pg_class') = migration_tag
       ) THEN
        RAISE EXCEPTION 'หยุด: โครงสร้าง/marker ไม่ตรง migration-002 ให้เจ้าของตรวจ';
    END IF;
    -- dynamic SQL ทำให้กรณีคอลัมน์ถูกถอนไปแล้วเป็น no-op ได้
    -- row_security=off ให้หยุดเมื่อ RLS ซ่อนข้อมูล แทนการสรุปผิดว่าว่าง
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public."SchoolBotLesson" WHERE "ImportSource" IS NOT NULL)'
       INTO has_provenance;
    IF has_provenance THEN
        RAISE EXCEPTION 'หยุด rollback: มี ImportSource ต้องคงข้อมูลและใช้ forward fix';
    END IF;
    -- DROP COLUMN อาจถอน index/CHECK ที่พึ่งคอลัมน์อัตโนมัติแม้ RESTRICT
    -- จึงหยุดเมื่อมี dependency อื่น เพื่อคงโครงสร้างที่เพิ่มภายหลัง
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
         WHERE d.refclassid = 'pg_class'::regclass AND d.refobjid = lesson_oid
           AND d.refobjsubid = column_record.attnum
           AND NOT (
               (d.classid = 'pg_constraint'::regclass AND d.objid = (
                   SELECT oid FROM pg_catalog.pg_constraint
                    WHERE conrelid = lesson_oid AND conname = 'CK_SchoolBotLesson_ImportSource_v1'))
               OR (d.classid = 'pg_class'::regclass AND d.objid =
                   'public."UX_SchoolBotLesson_ImportSource_Row_v1"'::regclass)
           )
    ) THEN
        RAISE EXCEPTION 'หยุด rollback: มี dependency เพิ่ม ให้เจ้าของออกแบบ forward fix';
    END IF;
    ALTER TABLE public."SchoolBotLesson" DROP CONSTRAINT "CK_SchoolBotLesson_ImportSource_v1";
    DROP INDEX public."UX_SchoolBotLesson_ImportSource_Row_v1";
    ALTER TABLE public."SchoolBotLesson" DROP COLUMN "ImportSource" RESTRICT;
END;
$rollback_002$;
COMMIT;
