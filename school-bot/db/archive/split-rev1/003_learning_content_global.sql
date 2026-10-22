-- =============================================================================
-- Migration: 003_learning_content_global.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-005 (Global Learning Content & Question Bank)
-- References: DES-005 Rev3/Rev4, DES-010, DES-011, amendment-proposal-001/002
-- Preconditions:
--   1. Migration 001_base_license_release_atomic.sql has been applied.
--   2. Human approval of amendment-proposal-001 and amendment-proposal-002.
-- Data Impact: Additive only. Creates 8 global content tables (SchoolId IS NULL).
-- =============================================================================

BEGIN;

-- 1. Table: SchoolBotLevel (Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotLevel" (
    "SchoolBotLevelId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LevelKey" uuid NOT NULL,
    "Code" varchar(64) NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotLevel" PRIMARY KEY ("SchoolBotLevelId"),
    CONSTRAINT "UQ_SchoolBotLevel_LevelKey" UNIQUE ("LevelKey"),
    CONSTRAINT "UQ_SchoolBotLevel_Code" UNIQUE ("Code"),
    CONSTRAINT "UQ_SchoolBotLevel_Ordinal" UNIQUE ("Ordinal"),
    CONSTRAINT "CK_SchoolBotLevel_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotLevel_Ordinal_Pos" CHECK ("Ordinal" >= 1),
    CONSTRAINT "CK_SchoolBotLevel_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotLevel_Title_Obj" CHECK (jsonb_typeof("Title") = 'object')
);

-- 2. Table: SchoolBotLevelPromotionPolicy (DES-011 / amendment-proposal-002; Global only)
CREATE TABLE IF NOT EXISTS public."SchoolBotLevelPromotionPolicy" (
    "SchoolBotLevelPromotionPolicyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LevelId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Threshold" numeric(9,6) NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotLevelPromotionPolicy" PRIMARY KEY ("SchoolBotLevelPromotionPolicyId"),
    CONSTRAINT "UQ_SchoolBotLevelPromotionPolicy_Level_Revision" UNIQUE ("LevelId", "Revision"),
    CONSTRAINT "FK_SchoolBotLevelPromotionPolicy_Level" FOREIGN KEY ("LevelId")
        REFERENCES public."SchoolBotLevel" ("SchoolBotLevelId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLevelPromotionPolicy_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotLevelPromotionPolicy_Revision_Pos" CHECK ("Revision" >= 1),
    CONSTRAINT "CK_SchoolBotLevelPromotionPolicy_Threshold_Range" CHECK ("Threshold" >= 0 AND "Threshold" <= 100),
    CONSTRAINT "CK_SchoolBotLevelPromotionPolicy_Version_Pos" CHECK ("Version" >= 1)
);

-- 3. Table: SchoolBotCurriculum (DES-005 Rev4; Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotCurriculum" (
    "SchoolBotCurriculumId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CurriculumKey" uuid NOT NULL,
    "Revision" integer NOT NULL,
    "LevelId" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "RecommendedGrades" jsonb NOT NULL,
    "Subjects" jsonb NOT NULL,
    "SourceRef" varchar(2048) NOT NULL,
    "Lifecycle" varchar(16) NOT NULL,
    "PublishedAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotCurriculum" PRIMARY KEY ("SchoolBotCurriculumId"),
    CONSTRAINT "UQ_SchoolBotCurriculum_Key_Revision" UNIQUE ("CurriculumKey", "Revision"),
    CONSTRAINT "FK_SchoolBotCurriculum_Level" FOREIGN KEY ("LevelId")
        REFERENCES public."SchoolBotLevel" ("SchoolBotLevelId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCurriculum_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotCurriculum_Revision_Pos" CHECK ("Revision" >= 1),
    CONSTRAINT "CK_SchoolBotCurriculum_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotCurriculum_Lifecycle" CHECK ("Lifecycle" IN ('draft', 'published', 'retired')),
    CONSTRAINT "CK_SchoolBotCurriculum_PublishedAt" CHECK ("Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL),
    CONSTRAINT "CK_SchoolBotCurriculum_Title_Obj" CHECK (jsonb_typeof("Title") = 'object'),
    CONSTRAINT "CK_SchoolBotCurriculum_RecommendedGrades_Arr" CHECK (jsonb_typeof("RecommendedGrades") = 'array'),
    CONSTRAINT "CK_SchoolBotCurriculum_Subjects_Arr" CHECK (jsonb_typeof("Subjects") = 'array')
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_curriculum_level_lifecycle"
    ON public."SchoolBotCurriculum" ("LevelId", "Lifecycle")
    WHERE "IsDelete" = false;

-- 4. Table: SchoolBotLesson (DES-005 Rev4; Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotLesson" (
    "SchoolBotLessonId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CurriculumId" integer NOT NULL,
    "LessonKey" uuid NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "Objective" jsonb NOT NULL,
    "Instructions" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotLesson" PRIMARY KEY ("SchoolBotLessonId"),
    CONSTRAINT "UQ_SchoolBotLesson_Curriculum_LessonKey" UNIQUE ("CurriculumId", "LessonKey"),
    CONSTRAINT "UQ_SchoolBotLesson_Curriculum_Ordinal" UNIQUE ("CurriculumId", "Ordinal"),
    CONSTRAINT "FK_SchoolBotLesson_Curriculum" FOREIGN KEY ("CurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLesson_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotLesson_Ordinal_Pos" CHECK ("Ordinal" >= 1),
    CONSTRAINT "CK_SchoolBotLesson_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotLesson_Title_Obj" CHECK (jsonb_typeof("Title") = 'object'),
    CONSTRAINT "CK_SchoolBotLesson_Objective_Obj" CHECK (jsonb_typeof("Objective") = 'object'),
    CONSTRAINT "CK_SchoolBotLesson_Instructions_Obj" CHECK (jsonb_typeof("Instructions") = 'object')
);

-- 5. Table: SchoolBotMission (DES-005 Rev4; Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotMission" (
    "SchoolBotMissionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LessonId" integer NOT NULL,
    "MissionKey" uuid NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "Instructions" jsonb NOT NULL,
    "Method" varchar(16) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotMission" PRIMARY KEY ("SchoolBotMissionId"),
    CONSTRAINT "UQ_SchoolBotMission_Lesson_MissionKey" UNIQUE ("LessonId", "MissionKey"),
    CONSTRAINT "UQ_SchoolBotMission_Lesson_Ordinal" UNIQUE ("LessonId", "Ordinal"),
    CONSTRAINT "FK_SchoolBotMission_Lesson" FOREIGN KEY ("LessonId")
        REFERENCES public."SchoolBotLesson" ("SchoolBotLessonId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotMission_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotMission_Ordinal_Pos" CHECK ("Ordinal" >= 1),
    CONSTRAINT "CK_SchoolBotMission_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotMission_Method" CHECK ("Method" IN ('automatic', 'teacher')),
    CONSTRAINT "CK_SchoolBotMission_Title_Obj" CHECK (jsonb_typeof("Title") = 'object'),
    CONSTRAINT "CK_SchoolBotMission_Instructions_Obj" CHECK (jsonb_typeof("Instructions") = 'object')
);

-- 6. Table: SchoolBotCriteria (DES-005 Rev4; Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotCriteria" (
    "SchoolBotCriteriaId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "MissionId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Rules" jsonb NOT NULL,
    "SourceRef" varchar(2048) NOT NULL,
    "ApprovedBy" varchar(512) NULL,
    "ApprovedAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotCriteria" PRIMARY KEY ("SchoolBotCriteriaId"),
    CONSTRAINT "UQ_SchoolBotCriteria_Mission_Revision" UNIQUE ("MissionId", "Revision"),
    CONSTRAINT "UQ_SchoolBotCriteria_Mission_CriteriaId" UNIQUE ("MissionId", "SchoolBotCriteriaId"),
    CONSTRAINT "FK_SchoolBotCriteria_Mission" FOREIGN KEY ("MissionId")
        REFERENCES public."SchoolBotMission" ("SchoolBotMissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCriteria_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotCriteria_Revision_Pos" CHECK ("Revision" >= 1),
    CONSTRAINT "CK_SchoolBotCriteria_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotCriteria_ApprovalPair" CHECK (
        ("ApprovedBy" IS NULL AND "ApprovedAt" IS NULL)
        OR ("ApprovedBy" IS NOT NULL AND "ApprovedAt" IS NOT NULL)
    ),
    CONSTRAINT "CK_SchoolBotCriteria_Rules_Obj" CHECK (jsonb_typeof("Rules") = 'object')
);

-- 7. Table: SchoolBotActivity (DES-005 Rev4 / DES-010; Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotActivity" (
    "SchoolBotActivityId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LessonId" integer NOT NULL,
    "ActivityKey" uuid NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "Type" varchar(16) NOT NULL,
    "Mode" varchar(16) NULL,
    "Indicators" jsonb NOT NULL,
    "Config" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotActivity" PRIMARY KEY ("SchoolBotActivityId"),
    CONSTRAINT "UQ_SchoolBotActivity_Lesson_ActivityKey" UNIQUE ("LessonId", "ActivityKey"),
    CONSTRAINT "UQ_SchoolBotActivity_Lesson_Ordinal" UNIQUE ("LessonId", "Ordinal"),
    CONSTRAINT "FK_SchoolBotActivity_Lesson" FOREIGN KEY ("LessonId")
        REFERENCES public."SchoolBotLesson" ("SchoolBotLessonId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotActivity_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotActivity_Ordinal_Pos" CHECK ("Ordinal" >= 1),
    CONSTRAINT "CK_SchoolBotActivity_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotActivity_Type" CHECK ("Type" IN ('instruction', 'project', 'quiz', 'test')),
    CONSTRAINT "CK_SchoolBotActivity_Mode" CHECK ("Mode" IS NULL OR "Mode" IN ('block', 'arm', 'code')),
    CONSTRAINT "CK_SchoolBotActivity_TypeModePair" CHECK (
        ("Type" = 'project' AND "Mode" IS NOT NULL)
        OR ("Type" IN ('instruction', 'quiz', 'test') AND "Mode" IS NULL)
    ),
    CONSTRAINT "CK_SchoolBotActivity_Title_Obj" CHECK (jsonb_typeof("Title") = 'object'),
    CONSTRAINT "CK_SchoolBotActivity_Indicators_Arr" CHECK (jsonb_typeof("Indicators") = 'array'),
    CONSTRAINT "CK_SchoolBotActivity_Config_Obj" CHECK (jsonb_typeof("Config") = 'object')
);

-- 8. Table: SchoolBotQuestionBank (DES-010; Global only: SchoolId IS NULL)
CREATE TABLE IF NOT EXISTS public."SchoolBotQuestionBank" (
    "SchoolBotQuestionBankId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "BankKey" uuid NOT NULL,
    "Revision" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "Questions" jsonb NOT NULL,
    "SourceRef" varchar(2048) NOT NULL,
    "Lifecycle" varchar(16) NOT NULL,
    "PublishedAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotQuestionBank" PRIMARY KEY ("SchoolBotQuestionBankId"),
    CONSTRAINT "UQ_SchoolBotQuestionBank_BankKey_Revision" UNIQUE ("BankKey", "Revision"),
    CONSTRAINT "CK_SchoolBotQuestionBank_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotQuestionBank_Revision_Pos" CHECK ("Revision" >= 1),
    CONSTRAINT "CK_SchoolBotQuestionBank_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotQuestionBank_Lifecycle" CHECK ("Lifecycle" IN ('draft', 'published', 'retired')),
    CONSTRAINT "CK_SchoolBotQuestionBank_PublishedAt" CHECK ("Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL),
    CONSTRAINT "CK_SchoolBotQuestionBank_Title_Obj" CHECK (jsonb_typeof("Title") = 'object'),
    CONSTRAINT "CK_SchoolBotQuestionBank_Questions_Arr" CHECK (jsonb_typeof("Questions") = 'array')
);

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotLevel",
    public."SchoolBotLevelPromotionPolicy",
    public."SchoolBotCurriculum",
    public."SchoolBotLesson",
    public."SchoolBotMission",
    public."SchoolBotCriteria",
    public."SchoolBotActivity",
    public."SchoolBotQuestionBank"
TO schoolbot_app;

COMMIT;
