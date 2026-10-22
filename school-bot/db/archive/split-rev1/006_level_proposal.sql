-- =============================================================================
-- Migration: 006_level_proposal.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers: DES-011 (SchoolBotLevelProposal) + Read-only grants on legacy School DB tables
-- References: DES-011 Rev2, DES-012, amendment-proposal-001/002
-- Preconditions:
--   1. Migrations 001..004 have been applied.
-- Data Impact: Additive only. Creates SchoolBotLevelProposal and grants SELECT on
--   existing legacy tables in School DB to schoolbot_app.
-- =============================================================================

BEGIN;

-- 1. Table: SchoolBotLevelProposal (DES-011 Rev2 / amendment-proposal-002)
CREATE TABLE IF NOT EXISTS public."SchoolBotLevelProposal" (
    "SchoolBotLevelProposalId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "TargetCurriculumId" integer NOT NULL,
    "SnapshotHash" varchar(64) NOT NULL,
    "Snapshot" jsonb NOT NULL,
    "State" varchar(16) NOT NULL,
    "DecisionBy" varchar(512) NULL,
    "DecisionAt" timestamptz NULL,
    "Reason" varchar(1000) NULL,
    "SuccessorRunId" integer NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotLevelProposal" PRIMARY KEY ("SchoolBotLevelProposalId"),
    CONSTRAINT "FK_SchoolBotLevelProposal_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotLevelProposal_TargetCurriculum" FOREIGN KEY ("TargetCurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotLevelProposal_SuccessorRun" FOREIGN KEY ("SchoolId", "SuccessorRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLevelProposal_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotLevelProposal_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotLevelProposal_SnapshotHash_Len" CHECK (char_length("SnapshotHash") = 64),
    CONSTRAINT "CK_SchoolBotLevelProposal_State" CHECK (
        "State" IN ('proposed', 'promoted', 'retained', 'max_level', 'stale')
    ),
    CONSTRAINT "CK_SchoolBotLevelProposal_DecisionPair" CHECK (
        ("DecisionBy" IS NULL AND "DecisionAt" IS NULL)
        OR ("DecisionBy" IS NOT NULL AND "DecisionAt" IS NOT NULL)
    ),
    CONSTRAINT "CK_SchoolBotLevelProposal_NoSelfSuccessor" CHECK (
        "SuccessorRunId" IS NULL OR "SuccessorRunId" <> "CourseRunId"
    ),
    CONSTRAINT "CK_SchoolBotLevelProposal_Snapshot_Obj" CHECK (jsonb_typeof("Snapshot") = 'object')
);

-- At most ONE finalized (promoted/retained/max_level) proposal per CourseRunId
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_levelproposal_confirmed_per_run"
    ON public."SchoolBotLevelProposal" ("CourseRunId")
    WHERE "State" IN ('promoted', 'retained', 'max_level') AND "IsDelete" = false;

-- Each SuccessorRunId can only be linked to at most one non-deleted proposal
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_levelproposal_successor_unique"
    ON public."SchoolBotLevelProposal" ("SuccessorRunId")
    WHERE "SuccessorRunId" IS NOT NULL AND "IsDelete" = false;

GRANT SELECT, INSERT, UPDATE ON public."SchoolBotLevelProposal" TO schoolbot_app;

-- 2. Read-only SELECT grants on legacy School DB tables required for DES-004/008/009/011/012
DO $$
DECLARE
    legacy_tbl text;
BEGIN
    FOREACH legacy_tbl IN ARRAY ARRAY[
        'TUser',
        'TEmployees',
        'TPlan',
        'TPlanCourse',
        'TPlanCourseTeacher',
        'TPlanCourseTerm',
        'TPlanTermSubLevel2',
        'TPlane',
        'TTerm',
        'TTermSubLevel2',
        'TStudentClassroomHistory',
        'TPlanCourseStudent'
    ]
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = legacy_tbl
        ) THEN
            EXECUTE format('GRANT SELECT ON TABLE public.%I TO schoolbot_app;', legacy_tbl);
        END IF;
    END LOOP;
END
$$;

COMMIT;
