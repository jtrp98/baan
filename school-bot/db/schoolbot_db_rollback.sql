-- =============================================================================
-- Rollback: schoolbot_db_rollback.sql — ย้อนกลับ schoolbot_db.sql ทั้งหมด (Rev7 — 32 ตาราง, PRIMARY KEY only)
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- สถานะ: รอคน review/รันเท่านั้น; ไม่มีผล rollback runtime
-- ใช้เฉพาะการสร้างใหม่รอบเดียวที่มีหลักฐานก่อนสร้างว่าไม่มีทั้ง32ตาราง และยังไม่เปิด writer
-- ห้ามใช้กับฐานที่สร้างไว้ตาม decisions-045 หรือฐานที่มีข้อมูล/ไม่ทราบ baseline
-- Baseline: decisions-026, decisions-027, decisions-028 · ที่มา: DBA (agy) review-005 (2026-10-22)
-- ทั้งไฟล์รันใน transaction เดียว: ส่วนใดล้ม = rollback ทั้งหมด
-- DESTRUCTIVE: DROP โครงสร้าง SchoolBot ทั้ง32ตาราง (006 → 001) ได้เฉพาะเมื่อว่างทั้งหมด
-- แนวทาง DROP พร้อมข้อมูลของฉบับเดิมถูกแทนที่แล้ว: guard ด้านล่างหยุดทันทีเมื่อมีข้อมูล/ตารางขาด/ไม่มีสิทธิ์
-- ไม่ใช้ CASCADE; ไม่ย้อนผลใน legacy DB; ถ้า guard หยุดให้คงตารางและส่งออกแบบวิธีกู้โดยไม่สูญข้อมูล
-- =============================================================================

-- Change Log:
-- 2026-10-29 — ใบงาน094: เพิ่ม lock+ตรวจว่างครบ32ก่อน DROP; ไม่มีการรันหรือรับรองว่า rollback สำเร็จ

BEGIN;

SET LOCAL row_security = off;
DO $rollback_guard$
DECLARE
    target_name text;
    has_rows boolean;
BEGIN
    FOR target_name IN
        SELECT unnest(ARRAY[
        'SchoolBotActivity',
        'SchoolBotAssessment',
        'SchoolBotAttempt',
        'SchoolBotAuditEvent',
        'SchoolBotCourseRun',
        'SchoolBotCourseRunActivity',
        'SchoolBotCriteria',
        'SchoolBotCurriculum',
        'SchoolBotGradeSlot',
        'SchoolBotGradingJob',
        'SchoolBotIdempotency',
        'SchoolBotLesson',
        'SchoolBotLevel',
        'SchoolBotLevelPromotionPolicy',
        'SchoolBotLevelProposal',
        'SchoolBotLicense',
        'SchoolBotLicenseBinding',
        'SchoolBotMission',
        'SchoolBotProject',
        'SchoolBotProjectRevision',
        'SchoolBotQuestionBank',
        'SchoolBotRelease',
        'SchoolBotRetakeGrant',
        'SchoolBotScoreExport',
        'SchoolBotScoreMapping',
        'SchoolBotScoreOutbox',
        'SchoolBotScorePreview',
        'SchoolBotScorePreviewItem',
        'SchoolBotScoringPolicy',
        'SchoolBotSession',
        'SchoolBotStaffRole',
        'SchoolBotSubmission'
        ]::text[]) ORDER BY 1
    LOOP
        -- ล็อกค้างถึง COMMIT; กัน writer แทรกหลังตรวจว่าง และตารางขาดทำให้ abort
        EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', target_name);
        EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I)', target_name) INTO has_rows;
        IF has_rows THEN
            RAISE EXCEPTION 'หยุด rollback: ตาราง % มีข้อมูล; ต้องคงข้อมูลและส่งออกแบบวิธีกู้', target_name;
        END IF;
    END LOOP;
END;
$rollback_guard$;


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


DROP TABLE IF EXISTS public."SchoolBotProjectRevision";
DROP TABLE IF EXISTS public."SchoolBotProject";
DROP TABLE IF EXISTS public."SchoolBotStaffRole";
DROP TABLE IF EXISTS public."SchoolBotSession";


-- #############################################################################
-- Section 001 Rollback: Base, License, Release, Idempotency, Audit (5 tables)
-- #############################################################################


DROP TABLE IF EXISTS public."SchoolBotAuditEvent";
DROP TABLE IF EXISTS public."SchoolBotIdempotency";
DROP TABLE IF EXISTS public."SchoolBotRelease";
DROP TABLE IF EXISTS public."SchoolBotLicenseBinding";
DROP TABLE IF EXISTS public."SchoolBotLicense";


COMMIT;
