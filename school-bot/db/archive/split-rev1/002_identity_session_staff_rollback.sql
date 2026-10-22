-- =============================================================================
-- Rollback: 002_identity_session_staff_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
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
-- =============================================================================

BEGIN;

ALTER TABLE IF EXISTS public."SchoolBotProject"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotProject_CurrentRevision";

DROP TABLE IF EXISTS public."SchoolBotProjectRevision";
DROP TABLE IF EXISTS public."SchoolBotProject";
DROP TABLE IF EXISTS public."SchoolBotTeacherGrant";
DROP TABLE IF EXISTS public."SchoolBotStaffRole";
DROP TABLE IF EXISTS public."SchoolBotSession";

COMMIT;
