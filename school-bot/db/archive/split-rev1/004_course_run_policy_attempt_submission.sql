-- =============================================================================
-- Migration: 004_course_run_policy_attempt_submission.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-005 (Submissions/Assessments/CourseRun/Attempts/ScoringPolicy)
-- References: DES-005 Rev4, DES-008, DES-010, amendment-proposal-001/002
-- Preconditions:
--   1. Migrations 001, 002, and 003 have been applied.
-- Data Impact: Additive only. Creates 8 tenant-scoped learning execution tables.
-- =============================================================================

BEGIN;

-- 1. Table: SchoolBotCourseRun (DES-008, DES-010, DES-011, amendment-proposal-002)
CREATE TABLE IF NOT EXISTS public."SchoolBotCourseRun" (
    "SchoolBotCourseRunId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CurriculumId" integer NOT NULL,
    "ClassroomId" integer NOT NULL,
    "NYear" integer NOT NULL,
    "NTerm" varchar(64) NOT NULL,
    "PlanCourseIds" integer[] NOT NULL,
    "CurrentPolicyId" integer NULL,
    "PreviousRunId" integer NULL,
    "EffectiveAt" timestamptz NOT NULL,
    "Lifecycle" varchar(16) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotCourseRun" PRIMARY KEY ("SchoolBotCourseRunId"),
    CONSTRAINT "UQ_SchoolBotCourseRun_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotCourseRunId"),
    CONSTRAINT "FK_SchoolBotCourseRun_Curriculum" FOREIGN KEY ("CurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotCourseRun_PreviousRun" FOREIGN KEY ("SchoolId", "PreviousRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCourseRun_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotCourseRun_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotCourseRun_Lifecycle" CHECK ("Lifecycle" IN ('planned', 'active', 'closing', 'closed')),
    CONSTRAINT "CK_SchoolBotCourseRun_NoSelfPrev" CHECK ("PreviousRunId" IS NULL OR "PreviousRunId" <> "SchoolBotCourseRunId"),
    CONSTRAINT "CK_SchoolBotCourseRun_PlanCourseIds_NonEmpty" CHECK (
        cardinality("PlanCourseIds") >= 1
        AND array_position("PlanCourseIds", NULL) IS NULL
    )
);

-- At most one non-closed, non-deleted CourseRun per (SchoolId, ClassroomId, NYear, NTerm)
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_courserun_active_room"
    ON public."SchoolBotCourseRun" ("SchoolId", "ClassroomId", "NYear", "NTerm")
    WHERE "Lifecycle" IN ('planned', 'active', 'closing') AND "IsDelete" = false;

-- At most one non-deleted successor CourseRun per PreviousRunId
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_courserun_one_successor"
    ON public."SchoolBotCourseRun" ("PreviousRunId")
    WHERE "PreviousRunId" IS NOT NULL AND "IsDelete" = false;

-- 2. Table: SchoolBotScoringPolicy (DES-010 / amendment-proposal-002)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoringPolicy" (
    "SchoolBotScoringPolicyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "CurriculumId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Policy" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotScoringPolicy" PRIMARY KEY ("SchoolBotScoringPolicyId"),
    CONSTRAINT "UQ_SchoolBotScoringPolicy_CourseRun_Revision" UNIQUE ("CourseRunId", "Revision"),
    CONSTRAINT "UQ_SchoolBotScoringPolicy_Tenant_Run_Id" UNIQUE ("SchoolId", "CourseRunId", "SchoolBotScoringPolicyId"),
    CONSTRAINT "FK_SchoolBotScoringPolicy_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScoringPolicy_Curriculum" FOREIGN KEY ("CurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoringPolicy_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScoringPolicy_Revision_Pos" CHECK ("Revision" >= 1),
    CONSTRAINT "CK_SchoolBotScoringPolicy_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotScoringPolicy_Policy_Obj" CHECK (jsonb_typeof("Policy") = 'object')
);

-- Circular FK from SchoolBotCourseRun.CurrentPolicyId -> SchoolBotScoringPolicy (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotCourseRun_CurrentPolicy'
    ) THEN
        ALTER TABLE public."SchoolBotCourseRun"
            ADD CONSTRAINT "FK_SchoolBotCourseRun_CurrentPolicy"
            FOREIGN KEY ("SchoolId", "SchoolBotCourseRunId", "CurrentPolicyId")
            REFERENCES public."SchoolBotScoringPolicy" ("SchoolId", "CourseRunId", "SchoolBotScoringPolicyId")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

-- 3. Table: SchoolBotCourseRunActivity (DES-010 / amendment-proposal-002)
CREATE TABLE IF NOT EXISTS public."SchoolBotCourseRunActivity" (
    "SchoolBotCourseRunActivityId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "ActivityId" integer NOT NULL,
    "OpensAt" timestamptz NULL,
    "ClosesAt" timestamptz NULL,
    "PolicyOverride" jsonb NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotCourseRunActivity" PRIMARY KEY ("SchoolBotCourseRunActivityId"),
    CONSTRAINT "UQ_SchoolBotCourseRunActivity_Run_Activity" UNIQUE ("CourseRunId", "ActivityId"),
    CONSTRAINT "FK_SchoolBotCourseRunActivity_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotCourseRunActivity_Activity" FOREIGN KEY ("ActivityId")
        REFERENCES public."SchoolBotActivity" ("SchoolBotActivityId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCourseRunActivity_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotCourseRunActivity_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotCourseRunActivity_Window" CHECK (
        "ClosesAt" IS NULL OR "OpensAt" IS NULL OR "ClosesAt" > "OpensAt"
    ),
    CONSTRAINT "CK_SchoolBotCourseRunActivity_PolicyOverride_Obj" CHECK (
        "PolicyOverride" IS NULL OR jsonb_typeof("PolicyOverride") = 'object'
    )
);

-- 4. Table: SchoolBotSubmission (DES-005 Rev4; references global Mission/Criteria and tenant ProjectRevision)
CREATE TABLE IF NOT EXISTS public."SchoolBotSubmission" (
    "SchoolBotSubmissionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LearnerId" integer NOT NULL,
    "MissionId" integer NOT NULL,
    "CriteriaId" integer NOT NULL,
    "ProjectRevisionId" integer NOT NULL,
    "SubmittedAt" timestamptz NOT NULL,
    "State" varchar(24) NOT NULL,
    "CurrentAssessmentId" integer NULL,
    "Evidence" jsonb NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotSubmission" PRIMARY KEY ("SchoolBotSubmissionId"),
    CONSTRAINT "UQ_SchoolBotSubmission_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotSubmissionId"),
    CONSTRAINT "FK_SchoolBotSubmission_Mission" FOREIGN KEY ("MissionId")
        REFERENCES public."SchoolBotMission" ("SchoolBotMissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotSubmission_Criteria" FOREIGN KEY ("MissionId", "CriteriaId")
        REFERENCES public."SchoolBotCriteria" ("MissionId", "SchoolBotCriteriaId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotSubmission_ProjectRevision" FOREIGN KEY ("SchoolId", "ProjectRevisionId")
        REFERENCES public."SchoolBotProjectRevision" ("SchoolId", "SchoolBotProjectRevisionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotSubmission_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotSubmission_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotSubmission_State" CHECK (
        "State" IN ('queued', 'grading', 'awaiting_teacher', 'evaluated', 'error')
    ),
    CONSTRAINT "CK_SchoolBotSubmission_Evidence_Obj" CHECK ("Evidence" IS NULL OR jsonb_typeof("Evidence") = 'object')
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_submission_learner_mission"
    ON public."SchoolBotSubmission" ("SchoolId", "LearnerId", "MissionId", "SubmittedAt" DESC)
    WHERE "IsDelete" = false;

-- 5. Table: SchoolBotGradingJob (DES-005)
CREATE TABLE IF NOT EXISTS public."SchoolBotGradingJob" (
    "SchoolBotGradingJobId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "SubmissionId" integer NOT NULL,
    "State" varchar(16) NOT NULL,
    "Attempts" integer NOT NULL,
    "LeaseOwner" varchar(128) NULL,
    "LeaseUntil" timestamptz NULL,
    "NextAttemptAt" timestamptz NOT NULL,
    "LastErrorCode" varchar(64) NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotGradingJob" PRIMARY KEY ("SchoolBotGradingJobId"),
    CONSTRAINT "UQ_SchoolBotGradingJob_SubmissionId" UNIQUE ("SubmissionId"),
    CONSTRAINT "FK_SchoolBotGradingJob_Submission" FOREIGN KEY ("SchoolId", "SubmissionId")
        REFERENCES public."SchoolBotSubmission" ("SchoolId", "SchoolBotSubmissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotGradingJob_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotGradingJob_Attempts_NonNeg" CHECK ("Attempts" >= 0),
    CONSTRAINT "CK_SchoolBotGradingJob_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotGradingJob_State" CHECK ("State" IN ('queued', 'running', 'completed', 'failed')),
    CONSTRAINT "CK_SchoolBotGradingJob_LeasePair" CHECK (
        ("LeaseOwner" IS NULL AND "LeaseUntil" IS NULL)
        OR ("LeaseOwner" IS NOT NULL AND "LeaseUntil" IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_gradingjob_due_queue"
    ON public."SchoolBotGradingJob" ("State", "NextAttemptAt")
    WHERE "State" IN ('queued', 'running') AND "IsDelete" = false;

-- 6. Table: SchoolBotAssessment (DES-005 Rev4; includes EarnedScore/MaxScore)
CREATE TABLE IF NOT EXISTS public."SchoolBotAssessment" (
    "SchoolBotAssessmentId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "SubmissionId" integer NOT NULL,
    "Sequence" integer NOT NULL,
    "Method" varchar(16) NOT NULL,
    "Outcome" varchar(16) NOT NULL,
    "EarnedScore" numeric(18,6) NULL,
    "MaxScore" numeric(18,6) NULL,
    "RuleResults" jsonb NOT NULL,
    "Feedback" varchar(4000) NOT NULL,
    "GraderVersion" varchar(128) NULL,
    "AssessorId" integer NULL,
    "SupersedesId" integer NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotAssessment" PRIMARY KEY ("SchoolBotAssessmentId"),
    CONSTRAINT "UQ_SchoolBotAssessment_Submission_Sequence" UNIQUE ("SubmissionId", "Sequence"),
    CONSTRAINT "UQ_SchoolBotAssessment_Tenant_Submission_Id" UNIQUE ("SchoolId", "SubmissionId", "SchoolBotAssessmentId"),
    CONSTRAINT "FK_SchoolBotAssessment_Submission" FOREIGN KEY ("SchoolId", "SubmissionId")
        REFERENCES public."SchoolBotSubmission" ("SchoolId", "SchoolBotSubmissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotAssessment_Supersedes" FOREIGN KEY ("SchoolId", "SubmissionId", "SupersedesId")
        REFERENCES public."SchoolBotAssessment" ("SchoolId", "SubmissionId", "SchoolBotAssessmentId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotAssessment_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotAssessment_Sequence_Pos" CHECK ("Sequence" >= 1),
    CONSTRAINT "CK_SchoolBotAssessment_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotAssessment_Method" CHECK ("Method" IN ('automatic', 'teacher')),
    CONSTRAINT "CK_SchoolBotAssessment_Outcome" CHECK ("Outcome" IN ('passed', 'not_yet')),
    CONSTRAINT "CK_SchoolBotAssessment_MethodActorPair" CHECK (
        ("Method" = 'automatic' AND "GraderVersion" IS NOT NULL AND "AssessorId" IS NULL)
        OR ("Method" = 'teacher' AND "AssessorId" IS NOT NULL AND "GraderVersion" IS NULL)
    ),
    CONSTRAINT "CK_SchoolBotAssessment_NumericScorePair" CHECK (
        ("EarnedScore" IS NULL AND "MaxScore" IS NULL)
        OR ("EarnedScore" IS NOT NULL AND "MaxScore" IS NOT NULL AND "MaxScore" > 0 AND "EarnedScore" >= 0 AND "EarnedScore" <= "MaxScore")
    ),
    CONSTRAINT "CK_SchoolBotAssessment_NoSelfSupersede" CHECK ("SupersedesId" IS NULL OR "SupersedesId" <> "SchoolBotAssessmentId"),
    CONSTRAINT "CK_SchoolBotAssessment_RuleResults_Arr" CHECK (jsonb_typeof("RuleResults") = 'array')
);

-- Circular FK from SchoolBotSubmission.CurrentAssessmentId -> SchoolBotAssessment (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotSubmission_CurrentAssessment'
    ) THEN
        ALTER TABLE public."SchoolBotSubmission"
            ADD CONSTRAINT "FK_SchoolBotSubmission_CurrentAssessment"
            FOREIGN KEY ("SchoolId", "SchoolBotSubmissionId", "CurrentAssessmentId")
            REFERENCES public."SchoolBotAssessment" ("SchoolId", "SubmissionId", "SchoolBotAssessmentId")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

-- 7. Table: SchoolBotAttempt (DES-010 / amendment-proposal-001)
CREATE TABLE IF NOT EXISTS public."SchoolBotAttempt" (
    "SchoolBotAttemptId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "ActivityId" integer NOT NULL,
    "LearnerId" integer NOT NULL,
    "Sequence" integer NOT NULL,
    "State" varchar(16) NOT NULL,
    "StartedAt" timestamptz NOT NULL,
    "DeadlineAt" timestamptz NULL,
    "SubmittedAt" timestamptz NULL,
    "Snapshot" jsonb NOT NULL,
    "Answers" jsonb NOT NULL,
    "EarnedScore" numeric(18,6) NULL,
    "MaxScore" numeric(18,6) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotAttempt" PRIMARY KEY ("SchoolBotAttemptId"),
    CONSTRAINT "UQ_SchoolBotAttempt_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotAttemptId"),
    CONSTRAINT "UQ_SchoolBotAttempt_Learner_Seq" UNIQUE ("SchoolId", "CourseRunId", "ActivityId", "LearnerId", "Sequence"),
    CONSTRAINT "FK_SchoolBotAttempt_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotAttempt_Activity" FOREIGN KEY ("ActivityId")
        REFERENCES public."SchoolBotActivity" ("SchoolBotActivityId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotAttempt_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotAttempt_Sequence_Pos" CHECK ("Sequence" >= 1),
    CONSTRAINT "CK_SchoolBotAttempt_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotAttempt_State" CHECK ("State" IN ('started', 'submitted', 'expired', 'voided')),
    CONSTRAINT "CK_SchoolBotAttempt_ScoreBounds" CHECK (
        "MaxScore" > 0
        AND ("EarnedScore" IS NULL OR ("EarnedScore" >= 0 AND "EarnedScore" <= "MaxScore"))
    ),
    CONSTRAINT "CK_SchoolBotAttempt_Snapshot_Obj" CHECK (jsonb_typeof("Snapshot") = 'object'),
    CONSTRAINT "CK_SchoolBotAttempt_Answers_Arr" CHECK (jsonb_typeof("Answers") = 'array')
);

-- 8. Table: SchoolBotRetakeGrant (DES-010 / amendment-proposal-002)
CREATE TABLE IF NOT EXISTS public."SchoolBotRetakeGrant" (
    "SchoolBotRetakeGrantId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "ActivityId" integer NOT NULL,
    "LearnerId" integer NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "ConsumedAttemptId" integer NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotRetakeGrant" PRIMARY KEY ("SchoolBotRetakeGrantId"),
    CONSTRAINT "FK_SchoolBotRetakeGrant_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotRetakeGrant_Activity" FOREIGN KEY ("ActivityId")
        REFERENCES public."SchoolBotActivity" ("SchoolBotActivityId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotRetakeGrant_ConsumedAttempt" FOREIGN KEY ("SchoolId", "ConsumedAttemptId")
        REFERENCES public."SchoolBotAttempt" ("SchoolId", "SchoolBotAttemptId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotRetakeGrant_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotRetakeGrant_Version_Pos" CHECK ("Version" >= 1)
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_retakegrant_lookup"
    ON public."SchoolBotRetakeGrant" ("SchoolId", "CourseRunId", "ActivityId", "LearnerId")
    WHERE "IsDelete" = false;

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotCourseRun",
    public."SchoolBotScoringPolicy",
    public."SchoolBotCourseRunActivity",
    public."SchoolBotSubmission",
    public."SchoolBotGradingJob",
    public."SchoolBotAssessment",
    public."SchoolBotAttempt",
    public."SchoolBotRetakeGrant"
TO schoolbot_app;

COMMIT;
