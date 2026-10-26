-- =============================================================================
-- Rollback: schoolbot_db_rollback.sql — ย้อนกลับ schoolbot_db.sql ทั้งหมด (Rev5 Slimmed — 32 ตาราง)
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน; คนเป็นผู้รันบนฐานทดสอบแล้วส่ง DBA-003 ตรวจ
-- Baseline: decisions-026, decisions-027, decisions-028 · ที่มา: DBA (agy) review-005 (2026-10-22)
-- ทั้งไฟล์รันใน transaction เดียว: ส่วนใดล้ม = rollback ทั้งหมด
-- DESTRUCTIVE: DROP ตาราง SchoolBot* ทั้ง 32 ตารางและข้อมูลทั้งหมด (ลำดับย้อนกลับ 006 → 001); ตาราง legacy ไม่ได้รับผลกระทบ
-- =============================================================================

BEGIN;


-- #############################################################################
-- Section 006 Rollback: Level Proposal (1 table)
-- #############################################################################

DROP TABLE IF EXISTS public."SchoolBotLevelProposal";


-- #############################################################################
-- Section 005 Rollback: GradeSlot, ScoreMapping, ScorePreview, Export, Outbox (6 tables)
-- #############################################################################

DROP TABLE IF EXISTS public."SchoolBotScoreOutbox";
DROP TABLE IF EXISTS public."SchoolBotScoreExport";
DROP TABLE IF EXISTS public."SchoolBotScorePreviewItem";
DROP TABLE IF EXISTS public."SchoolBotScorePreview";
DROP TABLE IF EXISTS public."SchoolBotScoreMapping";
DROP TABLE IF EXISTS public."SchoolBotGradeSlot";


-- #############################################################################
-- Section 004 Rollback: CourseRun, Policy, Attempt, Submission, Grading (8 tables)
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
-- Section 003 Rollback: Global Learning Content & Question Bank (8 tables)
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
-- Section 002 Rollback: Identity, Session, StaffRole, Projects (4 tables)
-- #############################################################################

ALTER TABLE IF EXISTS public."SchoolBotProject"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotProject_CurrentRevision";

DROP TABLE IF EXISTS public."SchoolBotProjectRevision";
DROP TABLE IF EXISTS public."SchoolBotProject";
DROP TABLE IF EXISTS public."SchoolBotStaffRole";
DROP TABLE IF EXISTS public."SchoolBotSession";


-- #############################################################################
-- Section 001 Rollback: Base, License, Release, Idempotency, Audit (5 tables)
-- #############################################################################

ALTER TABLE IF EXISTS public."SchoolBotLicense"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotLicense_CurrentBinding";

DROP TABLE IF EXISTS public."SchoolBotAuditEvent";
DROP TABLE IF EXISTS public."SchoolBotIdempotency";
DROP TABLE IF EXISTS public."SchoolBotRelease";
DROP TABLE IF EXISTS public."SchoolBotLicenseBinding";
DROP TABLE IF EXISTS public."SchoolBotLicense";


COMMIT;
