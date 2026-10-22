-- =============================================================================
-- Migration: schoolbot_pggradedb_grants.sql (เดิม 007_pggradedb_grants.sql)
-- Target Database: PGGradeDB (แยกคนละ DB connection กับ SchoolBot DB และ School DB), schema: public
-- Covers: Release Gate G-DB of DES-009 (Least-Privilege Grants on PGGradeDB)
-- References: DES-008 Rev2, DES-009 Rev2, decisions-021, decisions-023
-- =============================================================================
-- ⛔ MANDATORY RELEASE GATE PRECONDITIONS (DO NOT RUN UNTIL ALL ARE SATISFIED):
--   1. G-PARITY passed 100% and signed off by Grade System Owner & QA.
--   2. G-COEXIST (xmin CAS coexistence with legacy writer) verified and signed off.
--   3. G-TARGET (ScoreData JSON shape & detail row existence) verified.
--   4. G-AUTHZ (SubmitPeriod/lock/override rules) verified.
--   5. G-DB approved by DBA, Data Owner (PDPA), and Human Release Gate.
--
-- STRICT RULE (decisions-021 / decisions-023):
--   This script creates NO tables, NO columns, NO indexes, NO triggers, and
--   NO functions in PGGradeDB. It grants ONLY the minimum required privileges.
-- =============================================================================

BEGIN;

-- 1. Ensure role schoolbot_app exists on the PGGradeDB cluster
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        CREATE ROLE schoolbot_app NOLOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO schoolbot_app;

-- 2. Read privileges (SELECT) for target resolution, lock checks, andFOR UPDATE locking
GRANT SELECT ON TABLE
    public."PGTGrade",
    public."PGTGradeDetail",
    public."PGTAssessment",
    public."PGTGradeEdits",
    public."PGTGradeSetting",
    public."PGTAcademicSetting",
    public."PGTAcademicYearlySetting",
    public."PGTGradeShareInfo",
    public."PGTGradeAuditLog"
TO schoolbot_app;

-- 3. Column-level UPDATE privileges on PGTGradeDetail (score & derived total columns only;
--    primary keys "nGradeDetailId", "nGradeId", "sID", "SchoolID", "cDel" cannot be updated)
GRANT UPDATE (
    "ScoreData",
    "ScoreBeforeMidTerm",
    "ScoreAfterMidTerm",
    "scoreBeforeAfterMidTerm",
    "scoreMidTerm",
    "scoreFinalTerm",
    "getBeforeQuiz100",
    "getAfterQuiz100",
    "getQuiz100",
    "getMid100",
    "getFinal100",
    "getScore100",
    "getGradeLabel",
    "GradeSymbol",
    "UpdatedBy",
    "UpdatedDate"
) ON TABLE public."PGTGradeDetail" TO schoolbot_app;

-- 4. Column-level UPDATE privileges on PGTGrade (audit timestamps/actor when grade sheet is updated)
GRANT UPDATE (
    "dUpdate",
    "nUserUpdate",
    "UpdatedBy",
    "UpdatedDate"
) ON TABLE public."PGTGrade" TO schoolbot_app;

-- 5. Append-only INSERT privilege on PGTGradeAuditLog for durable export receipts (DES-009)
GRANT INSERT (
    "MethodName",
    "Parameter",
    "Application",
    "Logdate",
    "SchoolId",
    "sEmp"
) ON TABLE public."PGTGradeAuditLog" TO schoolbot_app;

GRANT USAGE, SELECT ON SEQUENCE public."PGTGradeAuditLog_GradeAuditLogId_seq" TO schoolbot_app;

COMMIT;
