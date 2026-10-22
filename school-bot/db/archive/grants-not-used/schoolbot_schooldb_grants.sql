-- =============================================================================
-- Migration: schoolbot_schooldb_grants.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Purpose: ให้ role schoolbot_app อ่านตาราง legacy ที่ SchoolBot ต้องใช้ตรวจตัวตน/สิทธิ์ครู/roster/เทอม
--   (DES-004/008/009/011/012) — ตาราง SchoolBot อยู่ SchoolBot DB ตาม decisions-027
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน · ที่มา: section 006 ของ DBA Rev1 ย้ายมาตาม decisions-027
-- STRICT: ไม่สร้าง/แก้ table, column, index, trigger, function ใน School DB — GRANT/REVOKE เท่านั้น
-- Data Impact: ไม่มีการเปลี่ยนข้อมูล
-- =============================================================================

BEGIN;

-- 1. Ensure role schoolbot_app exists on the School DB cluster
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        CREATE ROLE schoolbot_app NOLOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO schoolbot_app;

-- 2. Read-only SELECT grants on legacy tables
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
        ) THEN
            EXECUTE format('GRANT SELECT ON TABLE public.%I TO schoolbot_app;', legacy_tbl);
        END IF;
    END LOOP;
END
$$;

COMMIT;
