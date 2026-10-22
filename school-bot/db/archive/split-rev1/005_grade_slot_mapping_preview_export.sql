-- =============================================================================
-- Migration: 005_grade_slot_mapping_preview_export.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers: DES-008 (GradeSlot, ScoreMapping) & DES-009 (ScorePreview, Export, Outbox)
-- References: DES-008 Rev2, DES-009 Rev2, amendment-proposal-001/002
-- Preconditions:
--   1. Migrations 001..004 have been applied.
-- Data Impact: Additive only in School DB. Creates 6 tables. Does NOT touch PGGradeDB.
-- =============================================================================

BEGIN;

-- 1. Table: SchoolBotGradeSlot (DES-008)
CREATE TABLE IF NOT EXISTS public."SchoolBotGradeSlot" (
    "SchoolBotGradeSlotId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "PlanCourseId" integer NOT NULL,
    "CourseId" integer NOT NULL,
    "NGradeId" integer NOT NULL,
    "AssessmentId" integer NOT NULL,
    "ScoreIdentifier" varchar(128) NOT NULL,
    "Category" varchar(32) NOT NULL,
    "TargetSnapshot" jsonb NOT NULL,
    "OwnershipReason" varchar(1000) NOT NULL,
    "RetiredAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotGradeSlot" PRIMARY KEY ("SchoolBotGradeSlotId"),
    CONSTRAINT "UQ_SchoolBotGradeSlot_Tenant_Run_Id" UNIQUE ("SchoolId", "CourseRunId", "SchoolBotGradeSlotId"),
    CONSTRAINT "FK_SchoolBotGradeSlot_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotGradeSlot_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotGradeSlot_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotGradeSlot_Category" CHECK (
        "Category" IN ('before_midterm', 'after_midterm', 'midterm', 'final')
    ),
    CONSTRAINT "CK_SchoolBotGradeSlot_TargetSnapshot_Obj" CHECK (jsonb_typeof("TargetSnapshot") = 'object')
);

-- Critical invariant (amendment-proposal-001):
-- ONE active GradeSlot per (SchoolId, NGradeId, AssessmentId, ScoreIdentifier).
-- Predicate checks ONLY "RetiredAt" IS NULL (intentionally does NOT exclude "IsDelete" = true
-- so soft-delete cannot be used to bypass slot ownership history).
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_gradeslot_active_ownership"
    ON public."SchoolBotGradeSlot" ("SchoolId", "NGradeId", "AssessmentId", "ScoreIdentifier")
    WHERE "RetiredAt" IS NULL;

-- 2. Table: SchoolBotScoreMapping (DES-008)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreMapping" (
    "SchoolBotScoreMappingId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "GradeSlotId" integer NOT NULL,
    "Sources" jsonb NOT NULL,
    "RetiredAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotScoreMapping" PRIMARY KEY ("SchoolBotScoreMappingId"),
    CONSTRAINT "FK_SchoolBotScoreMapping_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScoreMapping_GradeSlot" FOREIGN KEY ("SchoolId", "CourseRunId", "GradeSlotId")
        REFERENCES public."SchoolBotGradeSlot" ("SchoolId", "CourseRunId", "SchoolBotGradeSlotId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoreMapping_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScoreMapping_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotScoreMapping_Sources_NonEmptyArr" CHECK (
        jsonb_typeof("Sources") = 'array' AND jsonb_array_length("Sources") >= 1
    )
);

-- One active mapping per (CourseRunId, GradeSlotId)
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_scoremapping_active"
    ON public."SchoolBotScoreMapping" ("CourseRunId", "GradeSlotId")
    WHERE "RetiredAt" IS NULL AND "IsDelete" = false;

-- 3. Table: SchoolBotScorePreview (DES-009)
CREATE TABLE IF NOT EXISTS public."SchoolBotScorePreview" (
    "SchoolBotScorePreviewId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "Principal" varchar(512) NOT NULL,
    "SnapshotHash" varchar(64) NOT NULL,
    "ExpiresAt" timestamptz NOT NULL,
    "State" varchar(16) NOT NULL,
    "SupersedesId" integer NULL,
    "Context" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotScorePreview" PRIMARY KEY ("SchoolBotScorePreviewId"),
    CONSTRAINT "UQ_SchoolBotScorePreview_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotScorePreviewId"),
    CONSTRAINT "FK_SchoolBotScorePreview_CourseRun" FOREIGN KEY ("SchoolId", "CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolId", "SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScorePreview_Supersedes" FOREIGN KEY ("SchoolId", "SupersedesId")
        REFERENCES public."SchoolBotScorePreview" ("SchoolId", "SchoolBotScorePreviewId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScorePreview_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScorePreview_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotScorePreview_SnapshotHash_Len" CHECK (char_length("SnapshotHash") = 64),
    CONSTRAINT "CK_SchoolBotScorePreview_State" CHECK (
        "State" IN ('open', 'conflicted', 'confirmed', 'superseded', 'expired')
    ),
    CONSTRAINT "CK_SchoolBotScorePreview_NoSelfSupersede" CHECK (
        "SupersedesId" IS NULL OR "SupersedesId" <> "SchoolBotScorePreviewId"
    ),
    CONSTRAINT "CK_SchoolBotScorePreview_Context_Obj" CHECK (jsonb_typeof("Context") = 'object')
);

-- 4. Table: SchoolBotScorePreviewItem (DES-009)
CREATE TABLE IF NOT EXISTS public."SchoolBotScorePreviewItem" (
    "SchoolBotScorePreviewItemId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScorePreviewId" integer NOT NULL,
    "LearnerId" integer NOT NULL,
    "State" varchar(16) NOT NULL,
    "ReasonCodes" jsonb NOT NULL,
    "Snapshot" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotScorePreviewItem" PRIMARY KEY ("SchoolBotScorePreviewItemId"),
    CONSTRAINT "UQ_SchoolBotScorePreviewItem_Preview_Learner" UNIQUE ("ScorePreviewId", "LearnerId"),
    CONSTRAINT "UQ_SchoolBotScorePreviewItem_Tenant_Preview_Id" UNIQUE ("SchoolId", "ScorePreviewId", "SchoolBotScorePreviewItemId"),
    CONSTRAINT "FK_SchoolBotScorePreviewItem_Preview" FOREIGN KEY ("SchoolId", "ScorePreviewId")
        REFERENCES public."SchoolBotScorePreview" ("SchoolId", "SchoolBotScorePreviewId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScorePreviewItem_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScorePreviewItem_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotScorePreviewItem_State" CHECK ("State" IN ('ready', 'conflict', 'blocked')),
    CONSTRAINT "CK_SchoolBotScorePreviewItem_ReasonCodes_Arr" CHECK (jsonb_typeof("ReasonCodes") = 'array'),
    CONSTRAINT "CK_SchoolBotScorePreviewItem_Snapshot_Obj" CHECK (jsonb_typeof("Snapshot") = 'object')
);

-- 5. Table: SchoolBotScoreExport (DES-009)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreExport" (
    "SchoolBotScoreExportId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScorePreviewId" integer NOT NULL,
    "ConfirmedBy" varchar(512) NOT NULL,
    "ConfirmedAt" timestamptz NOT NULL,
    "State" varchar(32) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotScoreExport" PRIMARY KEY ("SchoolBotScoreExportId"),
    CONSTRAINT "UQ_SchoolBotScoreExport_ScorePreviewId" UNIQUE ("ScorePreviewId"),
    CONSTRAINT "UQ_SchoolBotScoreExport_Tenant_Preview_ExportId" UNIQUE ("SchoolId", "ScorePreviewId", "SchoolBotScoreExportId"),
    CONSTRAINT "FK_SchoolBotScoreExport_Preview" FOREIGN KEY ("SchoolId", "ScorePreviewId")
        REFERENCES public."SchoolBotScorePreview" ("SchoolId", "SchoolBotScorePreviewId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoreExport_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScoreExport_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotScoreExport_State" CHECK (
        "State" IN ('queued', 'running', 'paused_conflict', 'reconciling', 'completed', 'completed_with_skips', 'failed')
    )
);

-- 6. Table: SchoolBotScoreOutbox (DES-009)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreOutbox" (
    "SchoolBotScoreOutboxId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScoreExportId" integer NOT NULL,
    "ScorePreviewId" integer NOT NULL,
    "ScorePreviewItemId" integer NOT NULL,
    "OperationKey" uuid NOT NULL,
    "PayloadHash" varchar(64) NOT NULL,
    "State" varchar(16) NOT NULL,
    "Attempts" integer NOT NULL,
    "LeaseOwner" varchar(128) NULL,
    "LeaseUntil" timestamptz NULL,
    "NextAttemptAt" timestamptz NOT NULL,
    "ReceiptId" bigint NULL,
    "ReceiptHash" varchar(64) NULL,
    "LastErrorCode" varchar(64) NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotScoreOutbox" PRIMARY KEY ("SchoolBotScoreOutboxId"),
    CONSTRAINT "UQ_SchoolBotScoreOutbox_OperationKey" UNIQUE ("OperationKey"),
    CONSTRAINT "UQ_SchoolBotScoreOutbox_Export_Item" UNIQUE ("ScoreExportId", "ScorePreviewItemId"),
    CONSTRAINT "FK_SchoolBotScoreOutbox_Export" FOREIGN KEY ("SchoolId", "ScorePreviewId", "ScoreExportId")
        REFERENCES public."SchoolBotScoreExport" ("SchoolId", "ScorePreviewId", "SchoolBotScoreExportId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScoreOutbox_PreviewItem" FOREIGN KEY ("SchoolId", "ScorePreviewId", "ScorePreviewItemId")
        REFERENCES public."SchoolBotScorePreviewItem" ("SchoolId", "ScorePreviewId", "SchoolBotScorePreviewItemId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoreOutbox_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScoreOutbox_Attempts_NonNeg" CHECK ("Attempts" >= 0),
    CONSTRAINT "CK_SchoolBotScoreOutbox_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotScoreOutbox_PayloadHash_Len" CHECK (char_length("PayloadHash") = 64),
    CONSTRAINT "CK_SchoolBotScoreOutbox_ReceiptHash_Len" CHECK ("ReceiptHash" IS NULL OR char_length("ReceiptHash") = 64),
    CONSTRAINT "CK_SchoolBotScoreOutbox_State" CHECK (
        "State" IN ('queued', 'running', 'applied', 'skipped', 'conflict', 'blocked', 'unknown')
    ),
    CONSTRAINT "CK_SchoolBotScoreOutbox_LeasePair" CHECK (
        ("LeaseOwner" IS NULL AND "LeaseUntil" IS NULL)
        OR ("LeaseOwner" IS NOT NULL AND "LeaseUntil" IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_scoreoutbox_due_queue"
    ON public."SchoolBotScoreOutbox" ("State", "NextAttemptAt")
    WHERE "State" IN ('queued', 'running', 'unknown') AND "IsDelete" = false;

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotGradeSlot",
    public."SchoolBotScoreMapping",
    public."SchoolBotScorePreview",
    public."SchoolBotScorePreviewItem",
    public."SchoolBotScoreExport",
    public."SchoolBotScoreOutbox"
TO schoolbot_app;

COMMIT;
