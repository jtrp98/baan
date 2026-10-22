-- =============================================================================
-- Rollback: 005_grade_slot_mapping_preview_export_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
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
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS public."SchoolBotScoreOutbox";
DROP TABLE IF EXISTS public."SchoolBotScoreExport";
DROP TABLE IF EXISTS public."SchoolBotScorePreviewItem";
DROP TABLE IF EXISTS public."SchoolBotScorePreview";
DROP TABLE IF EXISTS public."SchoolBotScoreMapping";
DROP TABLE IF EXISTS public."SchoolBotGradeSlot";

COMMIT;
