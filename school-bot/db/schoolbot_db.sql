-- =============================================================================
-- Migration: schoolbot_db.sql — ตาราง SchoolBot ทั้งหมด (32 ตาราง) ใน SchoolBot DB (Rev7 — PRIMARY KEY only)
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน; คนเป็นผู้รันบนฐานทดสอบแล้วส่ง DBA-003 ตรวจ
-- Baseline: decisions-026, decisions-027, decisions-028 · ที่มา: DBA (agy) review-005 (2026-10-22)
-- ตามคำสั่งผู้ใช้ 2026-10-26: คงเฉพาะ PRIMARY KEY 32 รายการ; ถอน UNIQUE 24, FOREIGN KEY 40 และ CHECK 80
-- คง450คอลัมน์และ identity; CreateBy/CreateDate/UpdateBy/UpdateDate เป็น NULL DEFAULT NULL ทุกตาราง (คำสั่งผู้ใช้ 2026-10-26)
-- ไม่ประกาศ standalone indexes ไม่สร้าง role และไม่กำหนดสิทธิ์ฐานข้อมูล
-- กฎไม่ซ้ำ/การอ้างอิง/validation เดิมที่ถอนออกไม่ถูกบังคับด้วย SQL; งานนี้ไม่เพิ่ม implementation ฝั่งแอป
-- ทั้งไฟล์รันใน transaction เดียว: ส่วนใดล้ม = rollback ทั้งหมด
-- CreateBy/UpdateBy = integer NULL: sEmp (พนักงาน/ครู) หรือ sId (นักเรียน) ของผู้ทำ, NULL = ระบบทำเอง (decisions-028)
-- =============================================================================

BEGIN;


-- #############################################################################
-- Section 001: Base, License, Release, Idempotency, Audit (5 tables)
-- References: DES-002, DES-007, data-model.md Rev4.1, data-contract-rules.md
-- #############################################################################


-- 2. Table: SchoolBotLicense (DES-002) — Mutable (If-Match on revoke/unbind)
CREATE TABLE IF NOT EXISTS public."SchoolBotLicense" (
    "SchoolBotLicenseId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "SchoolName" varchar(200) NOT NULL,
    "KeyHash" varchar(64) NOT NULL,
    "KeyHint" varchar(32) NOT NULL,
    "ExpiresAt" timestamptz NOT NULL,
    "RevokedAt" timestamptz NULL,
    "CurrentBindingId" integer NULL,
    "BindingEpoch" integer NOT NULL,
    "AllowedNextJkt" varchar(64) NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotLicense" PRIMARY KEY ("SchoolBotLicenseId")
);

-- 3. Table: SchoolBotLicenseBinding (DES-002) — Mutable (validate/detach)
CREATE TABLE IF NOT EXISTS public."SchoolBotLicenseBinding" (
    "SchoolBotLicenseBindingId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LicenseId" integer NOT NULL,
    "DeviceJkt" varchar(64) NOT NULL,
    "PublicJwk" jsonb NOT NULL,
    "Epoch" integer NOT NULL,
    "ActivatedAt" timestamptz NOT NULL,
    "DetachedAt" timestamptz NULL,
    "LastCheckedAt" timestamptz NOT NULL,
    "LastEntitlementExpiresAt" timestamptz NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotLicenseBinding" PRIMARY KEY ("SchoolBotLicenseBindingId")
);


-- 4. Table: SchoolBotRelease (DES-007) — Mutable (publish/withdraw with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotRelease" (
    "SchoolBotReleaseId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "VersionText" varchar(32) NOT NULL,
    "Channel" varchar(16) NOT NULL,
    "Platform" varchar(32) NOT NULL,
    "Manifest" varchar(16384) NOT NULL,
    "ArtifactHash" varchar(64) NOT NULL,
    "Lifecycle" varchar(16) NOT NULL,
    "PublishedAt" timestamptz NULL,
    "WithdrawnAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotRelease" PRIMARY KEY ("SchoolBotReleaseId")
);


-- 5. Table: SchoolBotIdempotency (data-model.md)
CREATE TABLE IF NOT EXISTS public."SchoolBotIdempotency" (
    "SchoolBotIdempotencyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "Principal" varchar(512) NOT NULL,
    "Operation" varchar(200) NOT NULL,
    "RequestKey" uuid NOT NULL,
    "RequestHash" varchar(64) NOT NULL,
    "NonceHash" varchar(64) NULL,
    "HttpStatus" integer NOT NULL,
    "ResultCipher" bytea NULL,
    "ResultKeyId" varchar(128) NULL,
    "ResourceId" integer NULL,
    "CompletedAt" timestamptz NOT NULL,
    "ReplayUntil" timestamptz NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotIdempotency" PRIMARY KEY ("SchoolBotIdempotencyId")
);


-- 6. Table: SchoolBotAuditEvent (data-model.md)
CREATE TABLE IF NOT EXISTS public."SchoolBotAuditEvent" (
    "SchoolBotAuditEventId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "Actor" varchar(512) NOT NULL,
    "Event" varchar(64) NOT NULL,
    "EntityType" varchar(64) NOT NULL,
    "EntityId" integer NOT NULL,
    "RequestId" uuid NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotAuditEvent" PRIMARY KEY ("SchoolBotAuditEventId")
);


-- #############################################################################
-- Section 002: Identity, Session, StaffRole, Projects (4 tables)
-- Note: SchoolBotTeacherGrant removed (conditional fallback not approved in decisions-026)
-- References: DES-003, DES-004, DES-012
-- #############################################################################

-- 1. Table: SchoolBotSession (DES-004, DES-012) — Mutable (PUT /v2/auth/session with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotSession" (
    "SchoolBotSessionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "Channel" varchar(16) NOT NULL DEFAULT 'desktop',
    "AccountId" integer NULL,
    "TokenHash" varchar(64) NOT NULL,
    "ProfileKind" varchar(16) NULL,
    "ProfileId" integer NULL,
    "LegacyAdminId" varchar(64) NULL,
    "DeviceJkt" varchar(64) NULL,
    "SourceTokenExpiresAt" timestamptz NULL,
    "ExpiresAt" timestamptz NOT NULL,
    "RevokedAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotSession" PRIMARY KEY ("SchoolBotSessionId")
);

-- 2. Table: SchoolBotStaffRole (DES-012) — Mutable (DELETE /v2/admin/staff-roles/{id} with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotStaffRole" (
    "SchoolBotStaffRoleId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "EmployeeId" integer NOT NULL,
    "Role" varchar(32) NOT NULL,
    "ValidFrom" timestamptz NOT NULL,
    "ValidUntil" timestamptz NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotStaffRole" PRIMARY KEY ("SchoolBotStaffRoleId")
);


-- 3. Table: SchoolBotProject (DES-003) — Mutable (save/rename/delete with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotProject" (
    "SchoolBotProjectId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "OwnerKind" varchar(16) NOT NULL,
    "OwnerId" integer NOT NULL,
    "Mode" varchar(16) NOT NULL,
    "Name" varchar(200) NOT NULL,
    "CurrentRevision" integer NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotProject" PRIMARY KEY ("SchoolBotProjectId")
);

-- 4. Table: SchoolBotProjectRevision (DES-003) — Immutable snapshot
CREATE TABLE IF NOT EXISTS public."SchoolBotProjectRevision" (
    "SchoolBotProjectRevisionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ProjectId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Content" jsonb NOT NULL,
    "ContentHash" varchar(64) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotProjectRevision" PRIMARY KEY ("SchoolBotProjectRevisionId")
);


-- #############################################################################
-- Section 003: Global Learning Content & Question Bank (8 tables, SchoolId IS NULL)
-- References: DES-005 Rev4, DES-010, DES-011
-- #############################################################################

-- 1. Table: SchoolBotLevel (DES-005, DES-011; Global only) — Mutable (If-Match when adding policy)
CREATE TABLE IF NOT EXISTS public."SchoolBotLevel" (
    "SchoolBotLevelId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LevelKey" uuid NOT NULL,
    "Code" varchar(64) NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotLevel" PRIMARY KEY ("SchoolBotLevelId")
);

-- 2. Table: SchoolBotLevelPromotionPolicy (DES-011; Global only) — Immutable revision
CREATE TABLE IF NOT EXISTS public."SchoolBotLevelPromotionPolicy" (
    "SchoolBotLevelPromotionPolicyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LevelId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Threshold" numeric(9,6) NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotLevelPromotionPolicy" PRIMARY KEY ("SchoolBotLevelPromotionPolicyId")
);

-- 3. Table: SchoolBotCurriculum (DES-005 Rev4; Global only) — Mutable while draft (PUT content / POST publish with If-Match)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotCurriculum" PRIMARY KEY ("SchoolBotCurriculumId")
);

-- 4. Table: SchoolBotLesson (DES-005 Rev4; Global only) — Replaced via parent Curriculum revision
CREATE TABLE IF NOT EXISTS public."SchoolBotLesson" (
    "SchoolBotLessonId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CurriculumId" integer NOT NULL,
    "LessonKey" uuid NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "Objective" jsonb NOT NULL,
    "Instructions" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotLesson" PRIMARY KEY ("SchoolBotLessonId")
);

-- 5. Table: SchoolBotMission (DES-005 Rev4; Global only) — Replaced via parent Curriculum revision
CREATE TABLE IF NOT EXISTS public."SchoolBotMission" (
    "SchoolBotMissionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LessonId" integer NOT NULL,
    "MissionKey" uuid NOT NULL,
    "Ordinal" integer NOT NULL,
    "Title" jsonb NOT NULL,
    "Instructions" jsonb NOT NULL,
    "Method" varchar(16) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotMission" PRIMARY KEY ("SchoolBotMissionId")
);

-- 6. Table: SchoolBotCriteria (DES-005 Rev4; Global only) — Immutable per revision
CREATE TABLE IF NOT EXISTS public."SchoolBotCriteria" (
    "SchoolBotCriteriaId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "MissionId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Rules" jsonb NOT NULL,
    "SourceRef" varchar(2048) NOT NULL,
    "ApprovedBy" varchar(512) NULL,
    "ApprovedAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotCriteria" PRIMARY KEY ("SchoolBotCriteriaId")
);

-- 7. Table: SchoolBotActivity (DES-005 Rev4 / DES-010; Global only) — Replaced via parent Curriculum revision
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotActivity" PRIMARY KEY ("SchoolBotActivityId")
);

-- 8. Table: SchoolBotQuestionBank (DES-010; Global only) — Mutable while draft (POST publish with If-Match)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotQuestionBank" PRIMARY KEY ("SchoolBotQuestionBankId")
);


-- #############################################################################
-- Section 004: CourseRun, Policy, Attempt, Submission, Grading (8 tables, SchoolId > 0)
-- References: DES-005 Rev4, DES-008, DES-010, DES-011
-- #############################################################################

-- 1. Table: SchoolBotCourseRun (DES-008, DES-010, DES-011) — Mutable (If-Match on policy update/lifecycle)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotCourseRun" PRIMARY KEY ("SchoolBotCourseRunId")
);


-- 2. Table: SchoolBotScoringPolicy (DES-010) — Immutable revision (CurriculumId removed as redundant with CourseRun.CurriculumId)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoringPolicy" (
    "SchoolBotScoringPolicyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Policy" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoringPolicy" PRIMARY KEY ("SchoolBotScoringPolicyId")
);


-- 3. Table: SchoolBotCourseRunActivity (DES-010) — Mutable (PUT override/window with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotCourseRunActivity" (
    "SchoolBotCourseRunActivityId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "ActivityId" integer NOT NULL,
    "OpensAt" timestamptz NULL,
    "ClosesAt" timestamptz NULL,
    "PolicyOverride" jsonb NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotCourseRunActivity" PRIMARY KEY ("SchoolBotCourseRunActivityId")
);

-- 4. Table: SchoolBotSubmission (DES-005 Rev4) — Mutable (POST /submissions/{id}/assessments with If-Match)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotSubmission" PRIMARY KEY ("SchoolBotSubmissionId")
);

-- 5. Table: SchoolBotGradingJob (DES-005) — Mutable (worker lease & state transition)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotGradingJob" PRIMARY KEY ("SchoolBotGradingJobId")
);

-- 6. Table: SchoolBotAssessment (DES-005 Rev4) — Immutable append-only
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotAssessment" PRIMARY KEY ("SchoolBotAssessmentId")
);


-- 7. Table: SchoolBotAttempt (DES-010) — Mutable while started (PUT answers / POST submit with If-Match)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotAttempt" PRIMARY KEY ("SchoolBotAttemptId")
);

-- 8. Table: SchoolBotRetakeGrant (DES-010) — Consumed under learner attempt lock
CREATE TABLE IF NOT EXISTS public."SchoolBotRetakeGrant" (
    "SchoolBotRetakeGrantId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "ActivityId" integer NOT NULL,
    "LearnerId" integer NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "ConsumedAttemptId" integer NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotRetakeGrant" PRIMARY KEY ("SchoolBotRetakeGrantId")
);


-- #############################################################################
-- Section 005: GradeSlot, ScoreMapping, ScorePreview, Export, Outbox (6 tables, SchoolId > 0)
-- References: DES-008 Rev2, DES-009 Rev2
-- #############################################################################

-- 1. Table: SchoolBotGradeSlot (DES-008) — Mutable (retire/ownership lifecycle)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotGradeSlot" PRIMARY KEY ("SchoolBotGradeSlotId")
);


-- 2. Table: SchoolBotScoreMapping (DES-008) — Mutable (PUT / POST retire with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreMapping" (
    "SchoolBotScoreMappingId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "GradeSlotId" integer NOT NULL,
    "Sources" jsonb NOT NULL,
    "RetiredAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoreMapping" PRIMARY KEY ("SchoolBotScoreMappingId")
);


-- 3. Table: SchoolBotScorePreview (DES-009) — Mutable state (POST confirm / POST resolve with If-Match)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScorePreview" PRIMARY KEY ("SchoolBotScorePreviewId")
);

-- 4. Table: SchoolBotScorePreviewItem (DES-009) — Immutable snapshot per preview
CREATE TABLE IF NOT EXISTS public."SchoolBotScorePreviewItem" (
    "SchoolBotScorePreviewItemId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScorePreviewId" integer NOT NULL,
    "LearnerId" integer NOT NULL,
    "State" varchar(16) NOT NULL,
    "ReasonCodes" jsonb NOT NULL,
    "Snapshot" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScorePreviewItem" PRIMARY KEY ("SchoolBotScorePreviewItemId")
);

-- 5. Table: SchoolBotScoreExport (DES-009) — Mutable state (worker progression)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreExport" (
    "SchoolBotScoreExportId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScorePreviewId" integer NOT NULL,
    "ConfirmedBy" varchar(512) NOT NULL,
    "ConfirmedAt" timestamptz NOT NULL,
    "State" varchar(32) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoreExport" PRIMARY KEY ("SchoolBotScoreExportId")
);

-- 6. Table: SchoolBotScoreOutbox (DES-009) — Mutable (worker lease & receipt reconciliation; ScorePreviewId removed as redundant)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreOutbox" (
    "SchoolBotScoreOutboxId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScoreExportId" integer NOT NULL,
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoreOutbox" PRIMARY KEY ("SchoolBotScoreOutboxId")
);


-- #############################################################################
-- Section 006: Level Proposal (1 table, SchoolId > 0)
-- References: DES-011 Rev2, DES-012
-- #############################################################################

-- 1. Table: SchoolBotLevelProposal (DES-011 Rev2) — Mutable (POST confirm / POST decline with If-Match)
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
    "CreateBy" integer NULL DEFAULT NULL,
    "CreateDate" timestamptz NULL DEFAULT NULL,
    "UpdateBy" integer NULL DEFAULT NULL,
    "UpdateDate" timestamptz NULL DEFAULT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotLevelProposal" PRIMARY KEY ("SchoolBotLevelProposalId")
);


COMMIT;
