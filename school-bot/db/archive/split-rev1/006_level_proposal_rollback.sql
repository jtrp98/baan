-- =============================================================================
-- Rollback: 006_level_proposal_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotLevelProposal
--    Also revokes SELECT on legacy School DB tables from schoolbot_app.
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

DROP TABLE IF EXISTS public."SchoolBotLevelProposal";

COMMIT;
