-- =============================================================================
-- Rollback: 003_learning_content_global_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
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
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS public."SchoolBotQuestionBank";
DROP TABLE IF EXISTS public."SchoolBotActivity";
DROP TABLE IF EXISTS public."SchoolBotCriteria";
DROP TABLE IF EXISTS public."SchoolBotMission";
DROP TABLE IF EXISTS public."SchoolBotLesson";
DROP TABLE IF EXISTS public."SchoolBotCurriculum";
DROP TABLE IF EXISTS public."SchoolBotLevelPromotionPolicy";
DROP TABLE IF EXISTS public."SchoolBotLevel";

COMMIT;
