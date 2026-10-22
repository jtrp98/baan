-- =============================================================================
-- Rollback: schoolbot_db_rollback.sql — ย้อนกลับ schoolbot_db.sql ทั้งหมด
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน; คนเป็นผู้รันบนฐานทดสอบแล้วส่ง DBA-003 ตรวจ
-- Baseline: decisions-026 (amendment-proposal-001/002) · ที่มา: DBA (agy) review-001 / review-002
-- รวมจากไฟล์แยกเดิม (db/archive/split-rev1/) หนึ่งไฟล์ต่อหนึ่ง database; ย้ายไป SchoolBot DB ตาม decisions-027
-- ทั้งไฟล์รันใน transaction เดียว: ส่วนใดล้ม = rollback ทั้งหมด
-- DESTRUCTIVE: DROP ตาราง SchoolBot* ทั้ง 33 ตารางและข้อมูลทั้งหมด (ลำดับย้อนกลับ 006 → 001); ตาราง legacy ไม่ได้รับผลกระทบ
-- =============================================================================

BEGIN;


-- #############################################################################
-- Section: 006_level_proposal_rollback.sql
-- Rollback: 006_level_proposal_rollback.sql
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotLevelProposal
-- #############################################################################


DROP TABLE IF EXISTS public."SchoolBotLevelProposal";


-- #############################################################################
-- Section: 005_grade_slot_mapping_preview_export_rollback.sql
-- Rollback: 005_grade_slot_mapping_preview_export_rollback.sql
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Preconditions:
--   1. Migration 006 has been rolled back (or can be rolled back independently).
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotScoreOutbox (including ReceiptId linkage to PGGradeDB)
--   - SchoolBotScoreExport
--   - SchoolBotScorePreviewItem
--   - SchoolBotScorePreview
--   - SchoolBotScoreMapping
--   - SchoolBotGradeSlot (including slot ownership records)
-- #############################################################################

DROP TABLE IF EXISTS public."SchoolBotScoreOutbox";
DROP TABLE IF EXISTS public."SchoolBotScoreExport";
DROP TABLE IF EXISTS public."SchoolBotScorePreviewItem";
DROP TABLE IF EXISTS public."SchoolBotScorePreview";
DROP TABLE IF EXISTS public."SchoolBotScoreMapping";
DROP TABLE IF EXISTS public."SchoolBotGradeSlot";


-- #############################################################################
-- Section: 004_course_run_policy_attempt_submission_rollback.sql
-- Rollback: 004_course_run_policy_attempt_submission_rollback.sql
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Preconditions:
--   1. Migrations 005 and 006 must have been rolled back first.
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotRetakeGrant
--   - SchoolBotAttempt
--   - SchoolBotAssessment
--   - SchoolBotGradingJob
--   - SchoolBotSubmission
--   - SchoolBotCourseRunActivity
--   - SchoolBotScoringPolicy
--   - SchoolBotCourseRun
-- #############################################################################

ALTER TABLE IF EXISTS public."SchoolBotSubmission"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotSubmission_CurrentAssessment";

ALTER TABLE IF EXISTS public."SchoolBotCourseRun"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotCourseRun_CurrentPolicy";

DROP TABLE IF EXISTS public."SchoolBotRetakeGrant";
DROP TABLE IF EXISTS public."SchoolBotAttempt";
DROP TABLE IF EXISTS public."SchoolBotAssessment";
DROP TABLE IF EXISTS public."SchoolBotGradingJob";
DROP TABLE IF EXISTS public."SchoolBotSubmission";
DROP TABLE IF EXISTS public."SchoolBotCourseRunActivity";
DROP TABLE IF EXISTS public."SchoolBotScoringPolicy";
DROP TABLE IF EXISTS public."SchoolBotCourseRun";


-- #############################################################################
-- Section: 003_learning_content_global_rollback.sql
-- Rollback: 003_learning_content_global_rollback.sql
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Preconditions:
--   1. Migrations 004..006 must have been rolled back first.
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotQuestionBank
--   - SchoolBotActivity
--   - SchoolBotCriteria
--   - SchoolBotMission
--   - SchoolBotLesson
--   - SchoolBotCurriculum
--   - SchoolBotLevelPromotionPolicy
--   - SchoolBotLevel
-- #############################################################################

DROP TABLE IF EXISTS public."SchoolBotQuestionBank";
DROP TABLE IF EXISTS public."SchoolBotActivity";
DROP TABLE IF EXISTS public."SchoolBotCriteria";
DROP TABLE IF EXISTS public."SchoolBotMission";
DROP TABLE IF EXISTS public."SchoolBotLesson";
DROP TABLE IF EXISTS public."SchoolBotCurriculum";
DROP TABLE IF EXISTS public."SchoolBotLevelPromotionPolicy";
DROP TABLE IF EXISTS public."SchoolBotLevel";


-- #############################################################################
-- Section: 002_identity_session_staff_rollback.sql
-- Rollback: 002_identity_session_staff_rollback.sql
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Preconditions:
--   1. Migrations 004..006 must have been rolled back first (SchoolBotSubmission
--      references SchoolBotProjectRevision).
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotProjectRevision
--   - SchoolBotProject
--   - SchoolBotTeacherGrant
--   - SchoolBotStaffRole
--   - SchoolBotSession
-- #############################################################################

ALTER TABLE IF EXISTS public."SchoolBotProject"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotProject_CurrentRevision";

DROP TABLE IF EXISTS public."SchoolBotProjectRevision";
DROP TABLE IF EXISTS public."SchoolBotProject";
DROP TABLE IF EXISTS public."SchoolBotTeacherGrant";
DROP TABLE IF EXISTS public."SchoolBotStaffRole";
DROP TABLE IF EXISTS public."SchoolBotSession";


-- #############################################################################
-- Section: 001_base_license_release_atomic_rollback.sql
-- Rollback: 001_base_license_release_atomic_rollback.sql
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
--Preconditions:
--   1. Migrations 002..006 must have been rolled back first.
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotAuditEvent
--   - SchoolBotIdempotency
--   - SchoolBotRelease
--   - SchoolBotLicenseBinding
--   - SchoolBotLicense
--   Existing legacy SchoolBright tables are NOT affected.
-- #############################################################################

ALTER TABLE IF EXISTS public."SchoolBotLicense"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotLicense_CurrentBinding";

DROP TABLE IF EXISTS public."SchoolBotAuditEvent";
DROP TABLE IF EXISTS public."SchoolBotIdempotency";
DROP TABLE IF EXISTS public."SchoolBotRelease";
DROP TABLE IF EXISTS public."SchoolBotLicenseBinding";
DROP TABLE IF EXISTS public."SchoolBotLicense";

-- Drop role only if it owns no objects and has no remaining privileges in current DB
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        REVOKE ALL PRIVILEGES ON SCHEMA public FROM schoolbot_app;
    END IF;
END
$$;


COMMIT;
