-- =============================================================================
-- Rollback: schoolbot_pggradedb_grants_rollback.sql (เดิม 007_pggradedb_grants_rollback.sql)
-- Target Database: PGGradeDB, schema: public
-- Data Impact: Non-destructive to data. Revokes all PGGradeDB table and sequence
--   privileges from schoolbot_app, immediately blocking SchoolBot from reading
--   or writing PGGradeDB.
-- =============================================================================

BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        REVOKE ALL PRIVILEGES ON TABLE
            public."PGTGrade",
            public."PGTGradeDetail",
            public."PGTAssessment",
            public."PGTGradeEdits",
            public."PGTGradeSetting",
            public."PGTAcademicSetting",
            public."PGTAcademicYearlySetting",
            public."PGTGradeShareInfo",
            public."PGTGradeAuditLog"
        FROM schoolbot_app;

        REVOKE ALL PRIVILEGES ON SEQUENCE
            public."PGTGradeAuditLog_GradeAuditLogId_seq"
        FROM schoolbot_app;

        REVOKE USAGE ON SCHEMA public FROM schoolbot_app;
    END IF;
END
$$;

COMMIT;
