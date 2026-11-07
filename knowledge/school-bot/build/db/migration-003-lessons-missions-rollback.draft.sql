BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;
SET LOCAL row_security = off;

LOCK TABLE public."SchoolBotLessonMissionAttempt", public."SchoolBotLessonMissionAccessEvent"
    IN ACCESS EXCLUSIVE MODE;

DO $rollback_003$
BEGIN
    IF (
        SELECT count(*)
        FROM (VALUES
            ('public."SchoolBotLessonMissionAttempt"'::regclass::oid, 'SchoolBotLessonMissionAttemptId'),
            ('public."SchoolBotLessonMissionAccessEvent"'::regclass::oid, 'SchoolBotLessonMissionAccessEventId')
        ) AS expected(relation_id, key_column)
        JOIN pg_catalog.pg_attribute AS attribute
            ON attribute.attrelid = expected.relation_id
            AND attribute.attname::text = expected.key_column
        JOIN pg_catalog.pg_constraint AS pk
            ON pk.conrelid = expected.relation_id
            AND pk.contype = 'p'
            AND pk.conkey = ARRAY[attribute.attnum]
        WHERE attribute.atttypid = 'int4'::regtype
          AND attribute.attidentity = 'a'
          AND NOT attribute.attisdropped
    ) <> 2 THEN
        RAISE EXCEPTION 'Migration 003 primary keys do not match';
    END IF;

    IF EXISTS (SELECT 1 FROM public."SchoolBotLessonMissionAttempt")
       OR EXISTS (SELECT 1 FROM public."SchoolBotLessonMissionAccessEvent") THEN
        RAISE EXCEPTION 'Migration 003 has mission data; stop writers and retain the tables';
    END IF;
END;
$rollback_003$;

DROP TABLE public."SchoolBotLessonMissionAccessEvent" RESTRICT;
DROP TABLE public."SchoolBotLessonMissionAttempt" RESTRICT;

COMMIT;
