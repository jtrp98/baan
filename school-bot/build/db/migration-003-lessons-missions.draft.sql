BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public;

CREATE TABLE public."SchoolBotLessonMissionAttempt" (
    "SchoolBotLessonMissionAttemptId" int4 GENERATED ALWAYS AS IDENTITY NOT NULL,
    "SchoolId" int4 NOT NULL,
    "AttemptKey" uuid NOT NULL,
    "LearnerId" int4 NOT NULL,
    "ClassroomId" int4 NOT NULL,
    "ActivityId" integer NOT NULL,
    "StartStatus" varchar(16) NOT NULL,
    "ProgressState" varchar(16) NOT NULL,
    "StartReceivedAt" timestamptz NOT NULL,
    "StartedAtLowerBound" timestamptz NULL,
    "StartedAtUpperBound" timestamptz NULL,
    "StartEvidence" jsonb NULL,
    "StartRequestHash" varchar(64) NOT NULL,
    "FinishReceivedAt" timestamptz NULL,
    "FinishRequestHash" varchar(64) NULL,
    "CompletionEvidence" jsonb NULL,
    "SubmissionId" integer NULL,
    "EarnedScore" numeric(18,6) NULL,
    "MaxScore" numeric(18,6) NULL,
    "Stars" smallint NULL,
    CONSTRAINT "PK_SchoolBotLessonMissionAttempt" PRIMARY KEY ("SchoolBotLessonMissionAttemptId")
);

CREATE TABLE public."SchoolBotLessonMissionAccessEvent" (
    "SchoolBotLessonMissionAccessEventId" int4 GENERATED ALWAYS AS IDENTITY NOT NULL,
    "SchoolId" int4 NOT NULL,
    "Origin" varchar(16) NOT NULL,
    "EventKey" uuid NOT NULL,
    "ClassroomId" int4 NOT NULL,
    "LevelNo" smallint NOT NULL,
    "TermNo" smallint NOT NULL,
    "StageKey" uuid NULL,
    "IsOpen" boolean NOT NULL,
    "OccurredAt" timestamptz NOT NULL,
    "Actor" varchar(512) NOT NULL,
    "RequestHash" varchar(64) NOT NULL,
    "ReopenedByAttemptKey" uuid NULL,
    CONSTRAINT "PK_SchoolBotLessonMissionAccessEvent" PRIMARY KEY ("SchoolBotLessonMissionAccessEventId")
);

COMMIT;
