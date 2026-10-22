-- =============================================================================
-- Rollback: schoolbot_schooldb_grants_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Purpose: ให้ role schoolbot_app อ่านตาราง legacy ที่ SchoolBot ต้องใช้ตรวจตัวตน/สิทธิ์ครู/roster/เทอม
--   (DES-004/008/009/011/012) — ตาราง SchoolBot อยู่ SchoolBot DB ตาม decisions-027
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน · ที่มา: section 006 ของ DBA Rev1 ย้ายมาตาม decisions-027
-- STRICT: ไม่สร้าง/แก้ table, column, index, trigger, function ใน School DB — GRANT/REVOKE เท่านั้น
-- Data Impact: ไม่ลบข้อมูล; ถอนสิทธิ์อ่านตาราง legacy ของ schoolbot_app ทันที (ไม่ DROP role)
-- =============================================================================

BEGIN;

DO $$
DECLARE
    legacy_tbl text;
BEGIN
    FOREACH legacy_tbl IN ARRAY ARRAY[
        'TUser',
        'TEmployees',
        'TPlan',
        'TPlanCourse',
        'TPlanCourseTeacher',
        'TPlanCourseTerm',
        'TPlanTermSubLevel2',
        'TPlane',
        'TTerm',
        'TTermSubLevel2',
        'TStudentClassroomHistory',
        'TPlanCourseStudent'
    ]
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = legacy_tbl
              AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app')
        ) THEN
            EXECUTE format('REVOKE SELECT ON TABLE public.%I FROM schoolbot_app;', legacy_tbl);
        END IF;
    END LOOP;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        REVOKE USAGE ON SCHEMA public FROM schoolbot_app;
    END IF;
END
$$;

COMMIT;
