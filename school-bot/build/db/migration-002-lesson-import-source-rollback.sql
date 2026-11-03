-- Rollback 002: ถอนเฉพาะคอลัมน์ที่ยังไม่มีข้อมูล
-- Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (มติ 2026-11-03 — เพิ่มเฉพาะคอลัมน์)
-- DESTRUCTIVE ต่อโครงสร้าง: DROP COLUMN; ไม่มี CASCADE หรือการล้างข้อมูล
-- มนุษย์ต้องยืนยันว่าเป็นคอลัมน์จาก migration นี้และหยุด writer ก่อนรัน
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;
SET LOCAL row_security = off;
LOCK TABLE public."SchoolBotLesson" IN ACCESS EXCLUSIVE MODE;

DO $rollback_002$
DECLARE
    lesson_oid oid := 'public."SchoolBotLesson"'::regclass;
    column_record record;
    has_provenance boolean;
BEGIN
    SELECT a.* INTO column_record FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = lesson_oid AND a.attname = 'ImportSource' AND NOT a.attisdropped;
    IF NOT FOUND THEN
        RETURN;
    END IF;
    IF column_record.atttypid <> 'jsonb'::regtype OR column_record.attnotnull
       OR column_record.atthasdef OR column_record.attgenerated <> ''
       OR column_record.attidentity <> '' OR column_record.attinhcount <> 0
       OR NOT column_record.attislocal THEN
        RAISE EXCEPTION 'หยุด: โครงสร้างไม่ตรง migration-002 ให้เจ้าของตรวจ';
    END IF;
    -- ไม่มี marker ฝั่ง DB; การตรวจชนิดไม่ยืนยันว่า migration นี้เป็นผู้เพิ่ม
    -- row_security=off ให้หยุดเมื่อ RLS ซ่อนข้อมูล แทนการสรุปผิดว่าว่าง
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public."SchoolBotLesson" WHERE "ImportSource" IS NOT NULL)'
       INTO has_provenance;
    IF has_provenance THEN
        RAISE EXCEPTION 'หยุด rollback: มี ImportSource ต้องคงข้อมูลและใช้ forward fix';
    END IF;
    -- DROP COLUMN อาจถอน index/CHECK ที่พึ่งคอลัมน์อัตโนมัติแม้ RESTRICT
    -- หยุดทุก dependency รวมวัตถุจาก Rev1 ไม่ถอนสิ่งอื่นตามไปด้วย
    IF EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
         WHERE d.refclassid = 'pg_class'::regclass AND d.refobjid = lesson_oid
           AND d.refobjsubid = column_record.attnum
    ) THEN
        RAISE EXCEPTION 'หยุด rollback: มี dependency ให้เจ้าของออกแบบ forward fix';
    END IF;
    ALTER TABLE public."SchoolBotLesson" DROP COLUMN "ImportSource" RESTRICT;
END;
$rollback_002$;
COMMIT;
