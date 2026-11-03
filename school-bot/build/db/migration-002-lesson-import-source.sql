-- Migration 002: provenance และ D ราย Lesson (ข้อเสนอสำหรับมนุษย์รันเท่านั้น)
-- Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 097)
-- PostgreSQL 15+; public ใน SchoolBot DB ที่เจ้าของยืนยัน; ไม่เชื่อม legacy DB
-- อ่าน migration-002-lesson-import-source.md; ขออนุมัติ schema/เวลารันก่อนใช้
-- ไม่ backfill/UPDATE/DELETE แถวเดิม; rollback หยุดเมื่อมี provenance แม้หนึ่งแถว
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;
LOCK TABLE public."SchoolBotLesson" IN ACCESS EXCLUSIVE MODE;

DO $migration_002$
DECLARE
    migration_tag constant text := 'schoolbot:migration-002:rev1';
    lesson_oid oid := 'public."SchoolBotLesson"'::regclass;
    column_record record;
BEGIN
    SELECT a.*, pg_catalog.col_description(a.attrelid, a.attnum) AS marker
      INTO column_record FROM pg_catalog.pg_attribute a
     WHERE a.attrelid = lesson_oid AND a.attname = 'ImportSource' AND NOT a.attisdropped;
    IF FOUND THEN
        -- ไม่ยอมรับคอลัมน์ชื่อชนจากข้อเสนออื่นว่าเคย migrate สำเร็จแล้ว
        IF column_record.atttypid <> 'jsonb'::regtype OR column_record.attnotnull
           OR column_record.attgenerated <> '' OR column_record.atthasdef
           OR column_record.marker IS DISTINCT FROM migration_tag THEN
            RAISE EXCEPTION 'หยุด: ImportSource ไม่ตรง migration-002 Rev1';
        END IF;
    ELSE
        ALTER TABLE public."SchoolBotLesson" ADD COLUMN "ImportSource" jsonb NULL;
        COMMENT ON COLUMN public."SchoolBotLesson"."ImportSource"
            IS 'schoolbot:migration-002:rev1';
        ALTER TABLE public."SchoolBotLesson"
          ADD CONSTRAINT "CK_SchoolBotLesson_ImportSource_v1" CHECK (
            CASE
              WHEN "ImportSource" IS NULL THEN true
              WHEN jsonb_typeof("ImportSource") <> 'object' THEN false
              ELSE (
                "SchoolId" IS NULL
                AND "ImportSource" ?& ARRAY['source_ref','source_row_key','source_approved','row_hash']
                AND ("ImportSource" - ARRAY['source_ref','source_row_key','source_approved','row_hash']) = '{}'::jsonb
                AND jsonb_typeof("ImportSource" -> 'source_ref') = 'string'
                AND char_length("ImportSource" ->> 'source_ref') BETWEEN 1 AND 2048
                AND btrim("ImportSource" ->> 'source_ref') <> ''
                AND jsonb_typeof("ImportSource" -> 'source_row_key') = 'string'
                AND ("ImportSource" ->> 'source_row_key') = "LessonKey"::text
                AND jsonb_typeof("ImportSource" -> 'source_approved') IN ('boolean','null')
                AND jsonb_typeof("ImportSource" -> 'row_hash') = 'string'
                AND ("ImportSource" ->> 'row_hash') ~ '^[0-9a-f]{64}$'
              ) IS TRUE
            END
          );
        COMMENT ON CONSTRAINT "CK_SchoolBotLesson_ImportSource_v1" ON public."SchoolBotLesson"
            IS 'schoolbot:migration-002:rev1';
        -- query: WHERE CurriculumId=$1 AND LessonKey=$2 AND ImportSource IS NOT NULL
        -- ไม่กรอง IsDelete: soft delete ไม่คืน identity ให้นำเข้าซ้ำ
        CREATE UNIQUE INDEX "UX_SchoolBotLesson_ImportSource_Row_v1"
            ON public."SchoolBotLesson" ("CurriculumId", "LessonKey")
            WHERE "ImportSource" IS NOT NULL;
        COMMENT ON INDEX public."UX_SchoolBotLesson_ImportSource_Row_v1"
            IS 'schoolbot:migration-002:rev1';
    END IF;
    -- rerun เป็น no-op เมื่อองค์ประกอบเดิมครบ; ของขาด/ชื่อชนหยุด ไม่ซ่อมโดยเดา
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_constraint c
         WHERE c.conrelid = lesson_oid AND c.conname = 'CK_SchoolBotLesson_ImportSource_v1'
           AND c.contype = 'c' AND c.convalidated AND NOT c.connoinherit
           AND pg_catalog.obj_description(c.oid, 'pg_constraint') = migration_tag
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_index i
        JOIN pg_catalog.pg_class x ON x.oid = i.indexrelid
        JOIN pg_catalog.pg_am am ON am.oid = x.relam
         WHERE i.indrelid = lesson_oid
           AND x.oid = pg_catalog.to_regclass('public."UX_SchoolBotLesson_ImportSource_Row_v1"')
           AND i.indisunique AND i.indisvalid AND i.indisready
           AND i.indnkeyatts = 2 AND i.indnatts = 2 AND am.amname = 'btree'
           AND pg_catalog.pg_get_indexdef(x.oid, 1, true) = '"CurriculumId"'
           AND pg_catalog.pg_get_indexdef(x.oid, 2, true) = '"LessonKey"'
           AND pg_catalog.pg_get_expr(i.indpred, i.indrelid) = '("ImportSource" IS NOT NULL)'
           AND pg_catalog.obj_description(x.oid, 'pg_class') = migration_tag
    ) THEN
        RAISE EXCEPTION 'หยุด: CHECK/index ของ migration-002 ไม่ครบหรือต่างจากแบบ';
    END IF;
END;
$migration_002$;
COMMIT;
