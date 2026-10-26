-- =============================================================================
-- Migration: schoolbot_db.sql — ตาราง SchoolBot ทั้งหมด (32 ตาราง) ใน SchoolBot DB (Rev6 — standalone indexes removed)
-- Target Database: SchoolBot DB (host 10.0.0.128 port 9499, database SchoolBot — ชื่อ DB เป็นสมมติฐาน), schema: public
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน; คนเป็นผู้รันบนฐานทดสอบแล้วส่ง DBA-003 ตรวจ
-- Baseline: decisions-026, decisions-027, decisions-028 · ที่มา: DBA (agy) review-005 (2026-10-22)
-- การตัดทอนตามคำสั่งผู้ใช้ 2026-10-26:
--   1. ไม่ประกาศ standalone indexes: CREATE INDEX และ CREATE UNIQUE INDEX รวม 0 ตัว
--   2. คง PK 32, UNIQUE constraints 24, FK 40 และ CHECK 80; backing indexes ของ PK/UNIQUE ยังคงมี
--      กฎธุรกิจเดิมที่เคยบังคับด้วย partial unique indexes 13 ตัวเป็นหน้าที่ application
--      การป้องกัน concurrency ของกฎเหล่านี้ยังไม่ได้ implement หรือยืนยันในงานตรวจนี้
--   3. ตัด composite UNIQUE (SchoolId, ...) ที่ใช้ทำ composite FK ออกทั้งหมด เปลี่ยนเป็น single-column FK ชี้ PK
--   4. ไม่มีคอลัมน์ Version — optimistic concurrency ใช้ UpdateDate (server ตั้งด้วย clock_timestamp(); decisions-030); AuditEvent ไม่เก็บ Previous/NewVersion
--   5. ตัดตาราง SchoolBotTeacherGrant (ยังไม่มีมติให้สร้างตาม decisions-026) และตัดคอลัมน์ซ้ำซ้อนที่ derive ได้ (ScoringPolicy.CurriculumId, ScoreOutbox.ScorePreviewId)
--   6. คงเฉพาะ CHECK ที่กันข้อมูลผิดความหมาย (enum, คู่ค่าที่ต้องมาด้วยกัน, ช่วงคะแนน/เวลา, SchoolId scope)
-- ทั้งไฟล์รันใน transaction เดียว: ส่วนใดล้ม = rollback ทั้งหมด
-- CreateBy/UpdateBy = integer NULL: sEmp (พนักงาน/ครู) หรือ sId (นักเรียน) ของผู้ทำ, NULL = ระบบทำเอง (decisions-028)
-- =============================================================================

BEGIN;


-- #############################################################################
-- Section 001: Base, License, Release, Idempotency, Audit (5 tables)
-- References: DES-002, DES-007, data-model.md Rev4.1, data-contract-rules.md
-- #############################################################################

-- 1. Create least-privilege application role if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        CREATE ROLE schoolbot_app NOLOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO schoolbot_app;

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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotLicense" PRIMARY KEY ("SchoolBotLicenseId"),
    CONSTRAINT "UQ_SchoolBotLicense_KeyHash" UNIQUE ("KeyHash"),
    CONSTRAINT "CK_SchoolBotLicense_SchoolId_Pos" CHECK ("SchoolId" > 0)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotLicenseBinding" PRIMARY KEY ("SchoolBotLicenseBindingId"),
    CONSTRAINT "UQ_SchoolBotLicenseBinding_LicenseId_Epoch" UNIQUE ("LicenseId", "Epoch"),
    CONSTRAINT "FK_SchoolBotLicenseBinding_License" FOREIGN KEY ("LicenseId")
        REFERENCES public."SchoolBotLicense" ("SchoolBotLicenseId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLicenseBinding_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotLicenseBinding_LeaseWindow" CHECK (
        "LastEntitlementExpiresAt" <= "LastCheckedAt" + interval '259200 seconds'
    )
);

-- Circular FK from SchoolBotLicense.CurrentBindingId -> SchoolBotLicenseBinding (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotLicense_CurrentBinding'
    ) THEN
        ALTER TABLE public."SchoolBotLicense"
            ADD CONSTRAINT "FK_SchoolBotLicense_CurrentBinding"
            FOREIGN KEY ("CurrentBindingId")
            REFERENCES public."SchoolBotLicenseBinding" ("SchoolBotLicenseBindingId")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;


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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotRelease" PRIMARY KEY ("SchoolBotReleaseId"),
    CONSTRAINT "CK_SchoolBotRelease_SchoolId_Scope" CHECK ("SchoolId" IS NULL OR "SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotRelease_Channel" CHECK ("Channel" IN ('stable', 'beta')),
    CONSTRAINT "CK_SchoolBotRelease_Platform" CHECK ("Platform" IN ('windows-amd64', 'darwin-amd64', 'darwin-arm64')),
    CONSTRAINT "CK_SchoolBotRelease_Lifecycle" CHECK ("Lifecycle" IN ('draft', 'published', 'withdrawn')),
    CONSTRAINT "CK_SchoolBotRelease_PublishedAt" CHECK ("Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotIdempotency" PRIMARY KEY ("SchoolBotIdempotencyId"),
    CONSTRAINT "CK_SchoolBotIdempotency_SchoolId_Scope" CHECK ("SchoolId" IS NULL OR "SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotIdempotency_CipherKeyPair" CHECK (
        ("ResultCipher" IS NULL AND "ResultKeyId" IS NULL)
        OR ("ResultCipher" IS NOT NULL AND "ResultKeyId" IS NOT NULL)
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotAuditEvent" PRIMARY KEY ("SchoolBotAuditEventId"),
    CONSTRAINT "CK_SchoolBotAuditEvent_SchoolId_Scope" CHECK ("SchoolId" IS NULL OR "SchoolId" > 0)
);

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotLicense",
    public."SchoolBotLicenseBinding",
    public."SchoolBotRelease",
    public."SchoolBotIdempotency",
    public."SchoolBotAuditEvent"
TO schoolbot_app;


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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotSession" PRIMARY KEY ("SchoolBotSessionId"),
    CONSTRAINT "UQ_SchoolBotSession_TokenHash" UNIQUE ("TokenHash"),
    CONSTRAINT "CK_SchoolBotSession_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotSession_Channel" CHECK ("Channel" IN ('desktop', 'school_web', 'staff_admin')),
    CONSTRAINT "CK_SchoolBotSession_ProfileKind" CHECK ("ProfileKind" IS NULL OR "ProfileKind" IN ('student', 'employee')),
    CONSTRAINT "CK_SchoolBotSession_ProfilePair" CHECK (
        ("ProfileKind" IS NULL AND "ProfileId" IS NULL)
        OR ("ProfileKind" IS NOT NULL AND "ProfileId" IS NOT NULL)
    ),
    CONSTRAINT "CK_SchoolBotSession_ChannelDesktopFields" CHECK (
        ("Channel" = 'desktop' AND "DeviceJkt" IS NOT NULL AND "AccountId" IS NOT NULL)
        OR ("Channel" IN ('school_web', 'staff_admin') AND "DeviceJkt" IS NULL)
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotStaffRole" PRIMARY KEY ("SchoolBotStaffRoleId"),
    CONSTRAINT "CK_SchoolBotStaffRole_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotStaffRole_Role" CHECK (
        "Role" IN (
            'content_author',
            'content_approver',
            'level_policy_admin',
            'license_admin',
            'release_publisher',
            'dashboard_viewer',
            'staff_admin'
        )
    ),
    CONSTRAINT "CK_SchoolBotStaffRole_ValidWindow" CHECK ("ValidUntil" IS NULL OR "ValidUntil" > "ValidFrom")
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotProject" PRIMARY KEY ("SchoolBotProjectId"),
    CONSTRAINT "CK_SchoolBotProject_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotProject_OwnerKind" CHECK ("OwnerKind" IN ('student', 'employee')),
    CONSTRAINT "CK_SchoolBotProject_Mode" CHECK ("Mode" IN ('block', 'arm', 'code'))
);

-- 4. Table: SchoolBotProjectRevision (DES-003) — Immutable snapshot
CREATE TABLE IF NOT EXISTS public."SchoolBotProjectRevision" (
    "SchoolBotProjectRevisionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ProjectId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Content" jsonb NOT NULL,
    "ContentHash" varchar(64) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotProjectRevision" PRIMARY KEY ("SchoolBotProjectRevisionId"),
    CONSTRAINT "UQ_SchoolBotProjectRevision_ProjectId_Revision" UNIQUE ("ProjectId", "Revision"),
    CONSTRAINT "FK_SchoolBotProjectRevision_Project" FOREIGN KEY ("ProjectId")
        REFERENCES public."SchoolBotProject" ("SchoolBotProjectId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotProjectRevision_SchoolId_Pos" CHECK ("SchoolId" > 0)
);

-- Circular FK from SchoolBotProject.(SchoolBotProjectId, CurrentRevision) -> SchoolBotProjectRevision (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotProject_CurrentRevision'
    ) THEN
        ALTER TABLE public."SchoolBotProject"
            ADD CONSTRAINT "FK_SchoolBotProject_CurrentRevision"
            FOREIGN KEY ("SchoolBotProjectId", "CurrentRevision")
            REFERENCES public."SchoolBotProjectRevision" ("ProjectId", "Revision")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotSession",
    public."SchoolBotStaffRole",
    public."SchoolBotProject",
    public."SchoolBotProjectRevision"
TO schoolbot_app;


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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotLevel" PRIMARY KEY ("SchoolBotLevelId"),
    CONSTRAINT "UQ_SchoolBotLevel_LevelKey" UNIQUE ("LevelKey"),
    CONSTRAINT "UQ_SchoolBotLevel_Code" UNIQUE ("Code"),
    CONSTRAINT "UQ_SchoolBotLevel_Ordinal" UNIQUE ("Ordinal"),
    CONSTRAINT "CK_SchoolBotLevel_GlobalOnly" CHECK ("SchoolId" IS NULL)
);

-- 2. Table: SchoolBotLevelPromotionPolicy (DES-011; Global only) — Immutable revision
CREATE TABLE IF NOT EXISTS public."SchoolBotLevelPromotionPolicy" (
    "SchoolBotLevelPromotionPolicyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "LevelId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Threshold" numeric(9,6) NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotLevelPromotionPolicy" PRIMARY KEY ("SchoolBotLevelPromotionPolicyId"),
    CONSTRAINT "UQ_SchoolBotLevelPromotionPolicy_Level_Revision" UNIQUE ("LevelId", "Revision"),
    CONSTRAINT "FK_SchoolBotLevelPromotionPolicy_Level" FOREIGN KEY ("LevelId")
        REFERENCES public."SchoolBotLevel" ("SchoolBotLevelId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLevelPromotionPolicy_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotLevelPromotionPolicy_Threshold_Range" CHECK ("Threshold" >= 0 AND "Threshold" <= 100)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotCurriculum" PRIMARY KEY ("SchoolBotCurriculumId"),
    CONSTRAINT "UQ_SchoolBotCurriculum_Key_Revision" UNIQUE ("CurriculumKey", "Revision"),
    CONSTRAINT "FK_SchoolBotCurriculum_Level" FOREIGN KEY ("LevelId")
        REFERENCES public."SchoolBotLevel" ("SchoolBotLevelId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCurriculum_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotCurriculum_Lifecycle" CHECK ("Lifecycle" IN ('draft', 'published', 'retired')),
    CONSTRAINT "CK_SchoolBotCurriculum_PublishedAt" CHECK ("Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotLesson" PRIMARY KEY ("SchoolBotLessonId"),
    CONSTRAINT "UQ_SchoolBotLesson_Curriculum_LessonKey" UNIQUE ("CurriculumId", "LessonKey"),
    CONSTRAINT "UQ_SchoolBotLesson_Curriculum_Ordinal" UNIQUE ("CurriculumId", "Ordinal"),
    CONSTRAINT "FK_SchoolBotLesson_Curriculum" FOREIGN KEY ("CurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLesson_GlobalOnly" CHECK ("SchoolId" IS NULL)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotMission" PRIMARY KEY ("SchoolBotMissionId"),
    CONSTRAINT "UQ_SchoolBotMission_Lesson_MissionKey" UNIQUE ("LessonId", "MissionKey"),
    CONSTRAINT "UQ_SchoolBotMission_Lesson_Ordinal" UNIQUE ("LessonId", "Ordinal"),
    CONSTRAINT "FK_SchoolBotMission_Lesson" FOREIGN KEY ("LessonId")
        REFERENCES public."SchoolBotLesson" ("SchoolBotLessonId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotMission_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotMission_Method" CHECK ("Method" IN ('automatic', 'teacher'))
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotCriteria" PRIMARY KEY ("SchoolBotCriteriaId"),
    CONSTRAINT "UQ_SchoolBotCriteria_Mission_Revision" UNIQUE ("MissionId", "Revision"),
    CONSTRAINT "FK_SchoolBotCriteria_Mission" FOREIGN KEY ("MissionId")
        REFERENCES public."SchoolBotMission" ("SchoolBotMissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCriteria_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotCriteria_ApprovalPair" CHECK (
        ("ApprovedBy" IS NULL AND "ApprovedAt" IS NULL)
        OR ("ApprovedBy" IS NOT NULL AND "ApprovedAt" IS NOT NULL)
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotActivity" PRIMARY KEY ("SchoolBotActivityId"),
    CONSTRAINT "UQ_SchoolBotActivity_Lesson_ActivityKey" UNIQUE ("LessonId", "ActivityKey"),
    CONSTRAINT "UQ_SchoolBotActivity_Lesson_Ordinal" UNIQUE ("LessonId", "Ordinal"),
    CONSTRAINT "FK_SchoolBotActivity_Lesson" FOREIGN KEY ("LessonId")
        REFERENCES public."SchoolBotLesson" ("SchoolBotLessonId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotActivity_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotActivity_Type" CHECK ("Type" IN ('instruction', 'project', 'quiz', 'test')),
    CONSTRAINT "CK_SchoolBotActivity_Mode" CHECK ("Mode" IS NULL OR "Mode" IN ('block', 'arm', 'code')),
    CONSTRAINT "CK_SchoolBotActivity_TypeModePair" CHECK (
        ("Type" = 'project' AND "Mode" IS NOT NULL)
        OR ("Type" IN ('instruction', 'quiz', 'test') AND "Mode" IS NULL)
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    CONSTRAINT "PK_SchoolBotQuestionBank" PRIMARY KEY ("SchoolBotQuestionBankId"),
    CONSTRAINT "UQ_SchoolBotQuestionBank_BankKey_Revision" UNIQUE ("BankKey", "Revision"),
    CONSTRAINT "CK_SchoolBotQuestionBank_GlobalOnly" CHECK ("SchoolId" IS NULL),
    CONSTRAINT "CK_SchoolBotQuestionBank_Lifecycle" CHECK ("Lifecycle" IN ('draft', 'published', 'retired')),
    CONSTRAINT "CK_SchoolBotQuestionBank_PublishedAt" CHECK ("Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotCourseRun" PRIMARY KEY ("SchoolBotCourseRunId"),
    CONSTRAINT "FK_SchoolBotCourseRun_Curriculum" FOREIGN KEY ("CurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotCourseRun_PreviousRun" FOREIGN KEY ("PreviousRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCourseRun_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotCourseRun_Lifecycle" CHECK ("Lifecycle" IN ('planned', 'active', 'closing', 'closed')),
    CONSTRAINT "CK_SchoolBotCourseRun_NoSelfPrev" CHECK ("PreviousRunId" IS NULL OR "PreviousRunId" <> "SchoolBotCourseRunId"),
    CONSTRAINT "CK_SchoolBotCourseRun_PlanCourseIds_NonEmpty" CHECK (
        cardinality("PlanCourseIds") >= 1
        AND array_position("PlanCourseIds", NULL) IS NULL
    )
);


-- 2. Table: SchoolBotScoringPolicy (DES-010) — Immutable revision (CurriculumId removed as redundant with CourseRun.CurriculumId)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoringPolicy" (
    "SchoolBotScoringPolicyId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Policy" jsonb NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoringPolicy" PRIMARY KEY ("SchoolBotScoringPolicyId"),
    CONSTRAINT "UQ_SchoolBotScoringPolicy_CourseRun_Revision" UNIQUE ("CourseRunId", "Revision"),
    CONSTRAINT "FK_SchoolBotScoringPolicy_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoringPolicy_SchoolId_Pos" CHECK ("SchoolId" > 0)
);

-- Circular FK from SchoolBotCourseRun.CurrentPolicyId -> SchoolBotScoringPolicy (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotCourseRun_CurrentPolicy'
    ) THEN
        ALTER TABLE public."SchoolBotCourseRun"
            ADD CONSTRAINT "FK_SchoolBotCourseRun_CurrentPolicy"
            FOREIGN KEY ("CurrentPolicyId")
            REFERENCES public."SchoolBotScoringPolicy" ("SchoolBotScoringPolicyId")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

-- 3. Table: SchoolBotCourseRunActivity (DES-010) — Mutable (PUT override/window with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotCourseRunActivity" (
    "SchoolBotCourseRunActivityId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "ActivityId" integer NOT NULL,
    "OpensAt" timestamptz NULL,
    "ClosesAt" timestamptz NULL,
    "PolicyOverride" jsonb NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotCourseRunActivity" PRIMARY KEY ("SchoolBotCourseRunActivityId"),
    CONSTRAINT "UQ_SchoolBotCourseRunActivity_Run_Activity" UNIQUE ("CourseRunId", "ActivityId"),
    CONSTRAINT "FK_SchoolBotCourseRunActivity_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotCourseRunActivity_Activity" FOREIGN KEY ("ActivityId")
        REFERENCES public."SchoolBotActivity" ("SchoolBotActivityId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotCourseRunActivity_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotCourseRunActivity_Window" CHECK (
        "ClosesAt" IS NULL OR "OpensAt" IS NULL OR "ClosesAt" > "OpensAt"
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotSubmission" PRIMARY KEY ("SchoolBotSubmissionId"),
    CONSTRAINT "FK_SchoolBotSubmission_Mission" FOREIGN KEY ("MissionId")
        REFERENCES public."SchoolBotMission" ("SchoolBotMissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotSubmission_Criteria" FOREIGN KEY ("CriteriaId")
        REFERENCES public."SchoolBotCriteria" ("SchoolBotCriteriaId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotSubmission_ProjectRevision" FOREIGN KEY ("ProjectRevisionId")
        REFERENCES public."SchoolBotProjectRevision" ("SchoolBotProjectRevisionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotSubmission_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotSubmission_State" CHECK (
        "State" IN ('queued', 'grading', 'awaiting_teacher', 'evaluated', 'error')
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotGradingJob" PRIMARY KEY ("SchoolBotGradingJobId"),
    CONSTRAINT "UQ_SchoolBotGradingJob_SubmissionId" UNIQUE ("SubmissionId"),
    CONSTRAINT "FK_SchoolBotGradingJob_Submission" FOREIGN KEY ("SubmissionId")
        REFERENCES public."SchoolBotSubmission" ("SchoolBotSubmissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotGradingJob_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotGradingJob_State" CHECK ("State" IN ('queued', 'running', 'completed', 'failed')),
    CONSTRAINT "CK_SchoolBotGradingJob_LeasePair" CHECK (
        ("LeaseOwner" IS NULL AND "LeaseUntil" IS NULL)
        OR ("LeaseOwner" IS NOT NULL AND "LeaseUntil" IS NOT NULL)
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotAssessment" PRIMARY KEY ("SchoolBotAssessmentId"),
    CONSTRAINT "FK_SchoolBotAssessment_Submission" FOREIGN KEY ("SubmissionId")
        REFERENCES public."SchoolBotSubmission" ("SchoolBotSubmissionId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotAssessment_Supersedes" FOREIGN KEY ("SupersedesId")
        REFERENCES public."SchoolBotAssessment" ("SchoolBotAssessmentId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotAssessment_SchoolId_Pos" CHECK ("SchoolId" > 0),
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
    CONSTRAINT "CK_SchoolBotAssessment_NoSelfSupersede" CHECK ("SupersedesId" IS NULL OR "SupersedesId" <> "SchoolBotAssessmentId")
);

-- Circular FK from SchoolBotSubmission.CurrentAssessmentId -> SchoolBotAssessment (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotSubmission_CurrentAssessment'
    ) THEN
        ALTER TABLE public."SchoolBotSubmission"
            ADD CONSTRAINT "FK_SchoolBotSubmission_CurrentAssessment"
            FOREIGN KEY ("CurrentAssessmentId")
            REFERENCES public."SchoolBotAssessment" ("SchoolBotAssessmentId")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotAttempt" PRIMARY KEY ("SchoolBotAttemptId"),
    CONSTRAINT "FK_SchoolBotAttempt_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotAttempt_Activity" FOREIGN KEY ("ActivityId")
        REFERENCES public."SchoolBotActivity" ("SchoolBotActivityId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotAttempt_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotAttempt_State" CHECK ("State" IN ('started', 'submitted', 'expired', 'voided')),
    CONSTRAINT "CK_SchoolBotAttempt_ScoreBounds" CHECK (
        "MaxScore" > 0
        AND ("EarnedScore" IS NULL OR ("EarnedScore" >= 0 AND "EarnedScore" <= "MaxScore"))
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotRetakeGrant" PRIMARY KEY ("SchoolBotRetakeGrantId"),
    CONSTRAINT "FK_SchoolBotRetakeGrant_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotRetakeGrant_Activity" FOREIGN KEY ("ActivityId")
        REFERENCES public."SchoolBotActivity" ("SchoolBotActivityId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotRetakeGrant_ConsumedAttempt" FOREIGN KEY ("ConsumedAttemptId")
        REFERENCES public."SchoolBotAttempt" ("SchoolBotAttemptId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotRetakeGrant_SchoolId_Pos" CHECK ("SchoolId" > 0)
);

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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotGradeSlot" PRIMARY KEY ("SchoolBotGradeSlotId"),
    CONSTRAINT "FK_SchoolBotGradeSlot_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotGradeSlot_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotGradeSlot_Category" CHECK (
        "Category" IN ('before_midterm', 'after_midterm', 'midterm', 'final')
    )
);


-- 2. Table: SchoolBotScoreMapping (DES-008) — Mutable (PUT / POST retire with If-Match)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreMapping" (
    "SchoolBotScoreMappingId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "CourseRunId" integer NOT NULL,
    "GradeSlotId" integer NOT NULL,
    "Sources" jsonb NOT NULL,
    "RetiredAt" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoreMapping" PRIMARY KEY ("SchoolBotScoreMappingId"),
    CONSTRAINT "FK_SchoolBotScoreMapping_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScoreMapping_GradeSlot" FOREIGN KEY ("GradeSlotId")
        REFERENCES public."SchoolBotGradeSlot" ("SchoolBotGradeSlotId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoreMapping_SchoolId_Pos" CHECK ("SchoolId" > 0)
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScorePreview" PRIMARY KEY ("SchoolBotScorePreviewId"),
    CONSTRAINT "FK_SchoolBotScorePreview_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScorePreview_Supersedes" FOREIGN KEY ("SupersedesId")
        REFERENCES public."SchoolBotScorePreview" ("SchoolBotScorePreviewId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScorePreview_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScorePreview_State" CHECK (
        "State" IN ('open', 'conflicted', 'confirmed', 'superseded', 'expired')
    ),
    CONSTRAINT "CK_SchoolBotScorePreview_NoSelfSupersede" CHECK (
        "SupersedesId" IS NULL OR "SupersedesId" <> "SchoolBotScorePreviewId"
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScorePreviewItem" PRIMARY KEY ("SchoolBotScorePreviewItemId"),
    CONSTRAINT "UQ_SchoolBotScorePreviewItem_Preview_Learner" UNIQUE ("ScorePreviewId", "LearnerId"),
    CONSTRAINT "FK_SchoolBotScorePreviewItem_Preview" FOREIGN KEY ("ScorePreviewId")
        REFERENCES public."SchoolBotScorePreview" ("SchoolBotScorePreviewId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScorePreviewItem_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScorePreviewItem_State" CHECK ("State" IN ('ready', 'conflict', 'blocked'))
);

-- 5. Table: SchoolBotScoreExport (DES-009) — Mutable state (worker progression)
CREATE TABLE IF NOT EXISTS public."SchoolBotScoreExport" (
    "SchoolBotScoreExportId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ScorePreviewId" integer NOT NULL,
    "ConfirmedBy" varchar(512) NOT NULL,
    "ConfirmedAt" timestamptz NOT NULL,
    "State" varchar(32) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoreExport" PRIMARY KEY ("SchoolBotScoreExportId"),
    CONSTRAINT "UQ_SchoolBotScoreExport_ScorePreviewId" UNIQUE ("ScorePreviewId"),
    CONSTRAINT "FK_SchoolBotScoreExport_Preview" FOREIGN KEY ("ScorePreviewId")
        REFERENCES public."SchoolBotScorePreview" ("SchoolBotScorePreviewId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoreExport_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScoreExport_State" CHECK (
        "State" IN ('queued', 'running', 'paused_conflict', 'reconciling', 'completed', 'completed_with_skips', 'failed')
    )
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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotScoreOutbox" PRIMARY KEY ("SchoolBotScoreOutboxId"),
    CONSTRAINT "UQ_SchoolBotScoreOutbox_OperationKey" UNIQUE ("OperationKey"),
    CONSTRAINT "UQ_SchoolBotScoreOutbox_Export_Item" UNIQUE ("ScoreExportId", "ScorePreviewItemId"),
    CONSTRAINT "FK_SchoolBotScoreOutbox_Export" FOREIGN KEY ("ScoreExportId")
        REFERENCES public."SchoolBotScoreExport" ("SchoolBotScoreExportId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotScoreOutbox_PreviewItem" FOREIGN KEY ("ScorePreviewItemId")
        REFERENCES public."SchoolBotScorePreviewItem" ("SchoolBotScorePreviewItemId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotScoreOutbox_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotScoreOutbox_State" CHECK (
        "State" IN ('queued', 'running', 'applied', 'skipped', 'conflict', 'blocked', 'unknown')
    ),
    CONSTRAINT "CK_SchoolBotScoreOutbox_LeasePair" CHECK (
        ("LeaseOwner" IS NULL AND "LeaseUntil" IS NULL)
        OR ("LeaseOwner" IS NOT NULL AND "LeaseUntil" IS NOT NULL)
    )
);

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotGradeSlot",
    public."SchoolBotScoreMapping",
    public."SchoolBotScorePreview",
    public."SchoolBotScorePreviewItem",
    public."SchoolBotScoreExport",
    public."SchoolBotScoreOutbox"
TO schoolbot_app;


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
    "CreateBy" integer NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" integer NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    CONSTRAINT "PK_SchoolBotLevelProposal" PRIMARY KEY ("SchoolBotLevelProposalId"),
    CONSTRAINT "FK_SchoolBotLevelProposal_CourseRun" FOREIGN KEY ("CourseRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotLevelProposal_TargetCurriculum" FOREIGN KEY ("TargetCurriculumId")
        REFERENCES public."SchoolBotCurriculum" ("SchoolBotCurriculumId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_SchoolBotLevelProposal_SuccessorRun" FOREIGN KEY ("SuccessorRunId")
        REFERENCES public."SchoolBotCourseRun" ("SchoolBotCourseRunId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLevelProposal_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotLevelProposal_State" CHECK (
        "State" IN ('proposed', 'promoted', 'retained', 'max_level', 'stale')
    ),
    CONSTRAINT "CK_SchoolBotLevelProposal_DecisionPair" CHECK (
        ("DecisionBy" IS NULL AND "DecisionAt" IS NULL)
        OR ("DecisionBy" IS NOT NULL AND "DecisionAt" IS NOT NULL)
    ),
    CONSTRAINT "CK_SchoolBotLevelProposal_NoSelfSuccessor" CHECK (
        "SuccessorRunId" IS NULL OR "SuccessorRunId" <> "CourseRunId"
    )
);


GRANT SELECT, INSERT, UPDATE ON public."SchoolBotLevelProposal" TO schoolbot_app;


COMMIT;
