BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;

DO $schoolbot_columns$
DECLARE
    table_name text;
    source_column text;
    target_column text;
BEGIN
    FOR table_name, source_column, target_column IN
        SELECT schoolbot.name, mapping.source_name, mapping.target_name
        FROM (VALUES
            ('SchoolBotLicense'),
            ('SchoolBotLicenseBinding'),
            ('SchoolBotRelease'),
            ('SchoolBotIdempotency'),
            ('SchoolBotAuditEvent'),
            ('SchoolBotSession'),
            ('SchoolBotStaffRole'),
            ('SchoolBotProject'),
            ('SchoolBotProjectRevision'),
            ('SchoolBotLevel'),
            ('SchoolBotLevelPromotionPolicy'),
            ('SchoolBotCurriculum'),
            ('SchoolBotLesson'),
            ('SchoolBotMission'),
            ('SchoolBotCriteria'),
            ('SchoolBotActivity'),
            ('SchoolBotQuestionBank'),
            ('SchoolBotCourseRun'),
            ('SchoolBotScoringPolicy'),
            ('SchoolBotCourseRunActivity'),
            ('SchoolBotSubmission'),
            ('SchoolBotGradingJob'),
            ('SchoolBotAssessment'),
            ('SchoolBotAttempt'),
            ('SchoolBotRetakeGrant'),
            ('SchoolBotGradeSlot'),
            ('SchoolBotScoreMapping'),
            ('SchoolBotScorePreview'),
            ('SchoolBotScorePreviewItem'),
            ('SchoolBotScoreExport'),
            ('SchoolBotScoreOutbox'),
            ('SchoolBotLevelProposal')
        ) AS schoolbot(name)
        CROSS JOIN (VALUES
            ('SchoolID', 'SchoolId'),
            ('cDel', 'IsDelete'),
            ('CreatedBy', 'CreateBy'),
            ('CreatedDate', 'CreateDate'),
            ('UpdatedBy', 'UpdateBy'),
            ('UpdatedDate', 'UpdateDate')
        ) AS mapping(source_name, target_name)
        UNION ALL
        VALUES
            ('SchoolBotCourseRun', 'nTermSubLevel2', 'ClassroomId'),
            ('SchoolBotSubmission', 'sID', 'LearnerId'),
            ('SchoolBotAttempt', 'sID', 'LearnerId'),
            ('SchoolBotRetakeGrant', 'sID', 'LearnerId'),
            ('SchoolBotScorePreviewItem', 'sID', 'LearnerId')
        ORDER BY 1, 2
    LOOP
        EXECUTE format(
            'ALTER TABLE public.%I RENAME COLUMN %I TO %I',
            table_name,
            source_column,
            target_column
        );
    END LOOP;
END;
$schoolbot_columns$;

COMMIT;
