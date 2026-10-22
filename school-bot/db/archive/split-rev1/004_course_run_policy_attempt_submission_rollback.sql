-- =============================================================================
-- Rollback: 004_course_run_policy_attempt_submission_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
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
-- =============================================================================

BEGIN;

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

COMMIT;
