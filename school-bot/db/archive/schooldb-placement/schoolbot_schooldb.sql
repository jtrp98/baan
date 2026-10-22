-- =============================================================================
-- Migration: schoolbot_schooldb.sql — SchoolBot ทั้งหมดใน School DB (33 ตาราง)
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Status: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน; คนเป็นผู้รันบนฐานทดสอบแล้วส่ง DBA-003 ตรวจ
-- Baseline: decisions-026 (amendment-proposal-001/002) · ที่มา: DBA (agy) review-001 / review-002
-- รวมจากไฟล์แยกเดิม (เก็บที่ db/archive/split-rev1/) ตามคำสั่งผู้ใช้ 2026-10-22: หนึ่งไฟล์ต่อหนึ่ง database
-- ทั้งไฟล์รันใน transaction เดียว: ส่วนใดล้ม = rollback ทั้งหมด
-- =============================================================================

BEGIN;


-- #############################################################################
-- Section: 001_base_license_release_atomic.sql
-- Migration: 001_base_license_release_atomic.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-001, DBA-002 (core license/idempotency/audit), DBA-006 (release)
-- References: DES-002, DES-007, data-model.md Rev3/Rev4, data-contract-rules.md
-- Preconditions:
--   1. Connected to School DB (JabjaiSchoolSingleDB) as migration admin/superuser.
--   2. Human approval of physical schema design (db/review-001.md).
-- Data Impact: Additive only. Creates role schoolbot_app and 5 core tables.
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

-- 2. Table: SchoolBotLicense (DES-002)
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
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotLicense" PRIMARY KEY ("SchoolBotLicenseId"),
    CONSTRAINT "UQ_SchoolBotLicense_KeyHash" UNIQUE ("KeyHash"),
    CONSTRAINT "UQ_SchoolBotLicense_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotLicenseId"),
    CONSTRAINT "CK_SchoolBotLicense_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotLicense_BindingEpoch_Pos" CHECK ("BindingEpoch" >= 1),
    CONSTRAINT "CK_SchoolBotLicense_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotLicense_KeyHash_Len" CHECK (char_length("KeyHash") = 64),
    CONSTRAINT "CK_SchoolBotLicense_AllowedNextJkt_Len" CHECK ("AllowedNextJkt" IS NULL OR char_length("AllowedNextJkt") = 64)
);

-- 3. Table: SchoolBotLicenseBinding (DES-002)
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
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotLicenseBinding" PRIMARY KEY ("SchoolBotLicenseBindingId"),
    CONSTRAINT "UQ_SchoolBotLicenseBinding_LicenseId_Epoch" UNIQUE ("LicenseId", "Epoch"),
    CONSTRAINT "UQ_SchoolBotLicenseBinding_Tenant_License_Id" UNIQUE ("SchoolId", "LicenseId", "SchoolBotLicenseBindingId"),
    CONSTRAINT "FK_SchoolBotLicenseBinding_License" FOREIGN KEY ("SchoolId", "LicenseId")
        REFERENCES public."SchoolBotLicense" ("SchoolId", "SchoolBotLicenseId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotLicenseBinding_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotLicenseBinding_Epoch_Pos" CHECK ("Epoch" >= 1),
    CONSTRAINT "CK_SchoolBotLicenseBinding_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotLicenseBinding_DeviceJkt_Len" CHECK (char_length("DeviceJkt") = 64),
    CONSTRAINT "CK_SchoolBotLicenseBinding_PublicJwk_Obj" CHECK (
        jsonb_typeof("PublicJwk") = 'object'
        AND ("PublicJwk" ->> 'kty') = 'EC'
        AND ("PublicJwk" ->> 'crv') = 'P-256'
        AND NOT ("PublicJwk" ? 'd')
    ),
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
            FOREIGN KEY ("SchoolId", "SchoolBotLicenseId", "CurrentBindingId")
            REFERENCES public."SchoolBotLicenseBinding" ("SchoolId", "LicenseId", "SchoolBotLicenseBindingId")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

-- Partial unique index: at most ONE active (non-detached, non-deleted) binding per License
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_license_binding_active"
    ON public."SchoolBotLicenseBinding" ("LicenseId")
    WHERE "DetachedAt" IS NULL AND "IsDelete" = false;

CREATE INDEX IF NOT EXISTS "ix_schoolbot_license_binding_school_license"
    ON public."SchoolBotLicenseBinding" ("SchoolId", "LicenseId");

-- 4. Table: SchoolBotRelease (DES-007 / DBA-006)
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
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotRelease" PRIMARY KEY ("SchoolBotReleaseId"),
    CONSTRAINT "CK_SchoolBotRelease_SchoolId_Scope" CHECK ("SchoolId" IS NULL OR "SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotRelease_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotRelease_Channel" CHECK ("Channel" IN ('stable', 'beta')),
    CONSTRAINT "CK_SchoolBotRelease_Platform" CHECK ("Platform" IN ('windows-amd64', 'darwin-amd64', 'darwin-arm64')),
    CONSTRAINT "CK_SchoolBotRelease_Lifecycle" CHECK ("Lifecycle" IN ('draft', 'published', 'withdrawn')),
    CONSTRAINT "CK_SchoolBotRelease_ArtifactHash_Len" CHECK (char_length("ArtifactHash") = 64),
    CONSTRAINT "CK_SchoolBotRelease_PublishedAt" CHECK ("Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL)
);

-- Null-safe uniqueness for global (SchoolId IS NULL) and tenant-specific releases
CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_release_global"
    ON public."SchoolBotRelease" ("VersionText", "Channel", "Platform")
    WHERE "SchoolId" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_release_tenant"
    ON public."SchoolBotRelease" ("SchoolId", "VersionText", "Channel", "Platform")
    WHERE "SchoolId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "ix_schoolbot_release_lookup"
    ON public."SchoolBotRelease" ("Channel", "Platform", "Lifecycle")
    WHERE "IsDelete" = false;

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
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotIdempotency" PRIMARY KEY ("SchoolBotIdempotencyId"),
    CONSTRAINT "CK_SchoolBotIdempotency_SchoolId_Scope" CHECK ("SchoolId" IS NULL OR "SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotIdempotency_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotIdempotency_HttpStatus" CHECK ("HttpStatus" >= 100 AND "HttpStatus" <= 599),
    CONSTRAINT "CK_SchoolBotIdempotency_RequestHash_Len" CHECK (char_length("RequestHash") = 64),
    CONSTRAINT "CK_SchoolBotIdempotency_NonceHash_Len" CHECK ("NonceHash" IS NULL OR char_length("NonceHash") = 64),
    CONSTRAINT "CK_SchoolBotIdempotency_CipherKeyPair" CHECK (
        ("ResultCipher" IS NULL AND "ResultKeyId" IS NULL)
        OR ("ResultCipher" IS NOT NULL AND "ResultKeyId" IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_idempotency_global"
    ON public."SchoolBotIdempotency" ("Principal", "Operation", "RequestKey")
    WHERE "SchoolId" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_idempotency_tenant"
    ON public."SchoolBotIdempotency" ("SchoolId", "Principal", "Operation", "RequestKey")
    WHERE "SchoolId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_idempotency_nonce"
    ON public."SchoolBotIdempotency" ("NonceHash")
    WHERE "NonceHash" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "ix_schoolbot_idempotency_replay_expiry"
    ON public."SchoolBotIdempotency" ("ReplayUntil")
    WHERE "ResultCipher" IS NOT NULL;

-- 6. Table: SchoolBotAuditEvent (data-model.md)
CREATE TABLE IF NOT EXISTS public."SchoolBotAuditEvent" (
    "SchoolBotAuditEventId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "Actor" varchar(512) NOT NULL,
    "Event" varchar(64) NOT NULL,
    "EntityType" varchar(64) NOT NULL,
    "EntityId" integer NOT NULL,
    "PreviousVersion" integer NOT NULL,
    "NewVersion" integer NOT NULL,
    "RequestId" uuid NOT NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotAuditEvent" PRIMARY KEY ("SchoolBotAuditEventId"),
    CONSTRAINT "CK_SchoolBotAuditEvent_SchoolId_Scope" CHECK ("SchoolId" IS NULL OR "SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotAuditEvent_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotAuditEvent_PrevVersion_NonNeg" CHECK ("PreviousVersion" >= 0),
    CONSTRAINT "CK_SchoolBotAuditEvent_NewVersion_Pos" CHECK ("NewVersion" >= 1),
    CONSTRAINT "CK_SchoolBotAuditEvent_EntityId_Pos" CHECK ("EntityId" >= 1)
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_auditevent_entity"
    ON public."SchoolBotAuditEvent" ("SchoolId", "EntityType", "EntityId", "CreateDate" DESC);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_auditevent_request"
    ON public."SchoolBotAuditEvent" ("RequestId");

-- 7. Grants to schoolbot_app (no DELETE/TRUNCATE)
GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotLicense",
    public."SchoolBotLicenseBinding",
    public."SchoolBotRelease",
    public."SchoolBotIdempotency",
    public."SchoolBotAuditEvent"
TO schoolbot_app;


-- #############################################################################
-- Section: 002_identity_session_staff.sql
-- Migration: 002_identity_session_staff.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-002 (Session/TeacherGrant), DBA-004 (Projects), H4 (DES-012)
-- References: DES-003, DES-004, DES-012, amendment-proposal-002.md
-- Preconditions:
--   1. Migration 001_base_license_release_atomic.sql has been applied.
--   2. Human approval for H4 (Session channel & StaffRole) and conditional TeacherGrant.
-- Data Impact: Additive only. Creates 5 tables in School DB.
-- #############################################################################

-- 1. Table: SchoolBotSession (DES-004 + DES-012 / amendment-proposal-002)
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
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotSession" PRIMARY KEY ("SchoolBotSessionId"),
    CONSTRAINT "UQ_SchoolBotSession_TokenHash" UNIQUE ("TokenHash"),
    CONSTRAINT "CK_SchoolBotSession_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotSession_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotSession_TokenHash_Len" CHECK (char_length("TokenHash") = 64),
    CONSTRAINT "CK_SchoolBotSession_Channel" CHECK ("Channel" IN ('desktop', 'school_web', 'staff_admin')),
    CONSTRAINT "CK_SchoolBotSession_ProfileKind" CHECK ("ProfileKind" IS NULL OR "ProfileKind" IN ('student', 'employee')),
    CONSTRAINT "CK_SchoolBotSession_ProfilePair" CHECK (
        ("ProfileKind" IS NULL AND "ProfileId" IS NULL)
        OR ("ProfileKind" IS NOT NULL AND "ProfileId" IS NOT NULL)
    ),
    CONSTRAINT "CK_SchoolBotSession_ChannelDesktopFields" CHECK (
        ("Channel" = 'desktop' AND "DeviceJkt" IS NOT NULL AND char_length("DeviceJkt") = 64 AND "AccountId" IS NOT NULL)
        OR ("Channel" IN ('school_web', 'staff_admin') AND "DeviceJkt" IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_session_principal_lookup"
    ON public."SchoolBotSession" ("SchoolId", "Channel", "ProfileKind", "ProfileId")
    WHERE "RevokedAt" IS NULL AND "IsDelete" = false;

CREATE INDEX IF NOT EXISTS "ix_schoolbot_session_legacy_admin"
    ON public."SchoolBotSession" ("SchoolId", "LegacyAdminId")
    WHERE "LegacyAdminId" IS NOT NULL AND "RevokedAt" IS NULL AND "IsDelete" = false;

-- 2. Table: SchoolBotStaffRole (DES-012 / amendment-proposal-002)
CREATE TABLE IF NOT EXISTS public."SchoolBotStaffRole" (
    "SchoolBotStaffRoleId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "EmployeeId" integer NOT NULL,
    "Role" varchar(32) NOT NULL,
    "ValidFrom" timestamptz NOT NULL,
    "ValidUntil" timestamptz NULL,
    "Reason" varchar(1000) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotStaffRole" PRIMARY KEY ("SchoolBotStaffRoleId"),
    CONSTRAINT "CK_SchoolBotStaffRole_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotStaffRole_Version_Pos" CHECK ("Version" >= 1),
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

CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_staff_role_live"
    ON public."SchoolBotStaffRole" ("SchoolId", "EmployeeId", "Role")
    WHERE "IsDelete" = false;

-- 3. Table: SchoolBotTeacherGrant (DES-004 Conditional Fallback)
CREATE TABLE IF NOT EXISTS public."SchoolBotTeacherGrant" (
    "SchoolBotTeacherGrantId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "TeacherId" integer NOT NULL,
    "LearnerId" integer NOT NULL,
    "Mode" varchar(16) NOT NULL,
    "CanView" boolean NOT NULL,
    "CanAssess" boolean NOT NULL,
    "ValidFrom" timestamptz NOT NULL,
    "ValidUntil" timestamptz NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotTeacherGrant" PRIMARY KEY ("SchoolBotTeacherGrantId"),
    CONSTRAINT "CK_SchoolBotTeacherGrant_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotTeacherGrant_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotTeacherGrant_Mode" CHECK ("Mode" IN ('block', 'arm', 'code')),
    CONSTRAINT "CK_SchoolBotTeacherGrant_AssessImpliesView" CHECK ((NOT "CanAssess") OR "CanView"),
    CONSTRAINT "CK_SchoolBotTeacherGrant_ValidWindow" CHECK ("ValidUntil" IS NULL OR "ValidUntil" > "ValidFrom")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ux_schoolbot_teacher_grant_live"
    ON public."SchoolBotTeacherGrant" ("SchoolId", "TeacherId", "LearnerId", "Mode")
    WHERE "IsDelete" = false;

-- 4. Table: SchoolBotProject (DES-003 / DBA-004)
CREATE TABLE IF NOT EXISTS public."SchoolBotProject" (
    "SchoolBotProjectId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "OwnerKind" varchar(16) NOT NULL,
    "OwnerId" integer NOT NULL,
    "Mode" varchar(16) NOT NULL,
    "Name" varchar(200) NOT NULL,
    "CurrentRevision" integer NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotProject" PRIMARY KEY ("SchoolBotProjectId"),
    CONSTRAINT "UQ_SchoolBotProject_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotProjectId"),
    CONSTRAINT "CK_SchoolBotProject_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotProject_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotProject_CurrentRevision_Pos" CHECK ("CurrentRevision" >= 1),
    CONSTRAINT "CK_SchoolBotProject_OwnerKind" CHECK ("OwnerKind" IN ('student', 'employee')),
    CONSTRAINT "CK_SchoolBotProject_Mode" CHECK ("Mode" IN ('block', 'arm', 'code'))
);

CREATE INDEX IF NOT EXISTS "ix_schoolbot_project_owner_list"
    ON public."SchoolBotProject" ("SchoolId", "OwnerKind", "OwnerId", "Mode", "UpdateDate" DESC)
    WHERE "IsDelete" = false;

-- 5. Table: SchoolBotProjectRevision (DES-003 / DBA-004)
CREATE TABLE IF NOT EXISTS public."SchoolBotProjectRevision" (
    "SchoolBotProjectRevisionId" integer GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 NO CYCLE) NOT NULL,
    "ProjectId" integer NOT NULL,
    "Revision" integer NOT NULL,
    "Content" jsonb NOT NULL,
    "ContentHash" varchar(64) NOT NULL,
    "IsDelete" boolean NOT NULL DEFAULT false,
    "CreateBy" varchar(512) NOT NULL,
    "CreateDate" timestamptz NOT NULL,
    "UpdateBy" varchar(512) NOT NULL,
    "UpdateDate" timestamptz NOT NULL,
    "SchoolId" integer NOT NULL,
    "Version" integer NOT NULL DEFAULT 1,
    CONSTRAINT "PK_SchoolBotProjectRevision" PRIMARY KEY ("SchoolBotProjectRevisionId"),
    CONSTRAINT "UQ_SchoolBotProjectRevision_SchoolId_Id" UNIQUE ("SchoolId", "SchoolBotProjectRevisionId"),
    CONSTRAINT "UQ_SchoolBotProjectRevision_ProjectId_Revision" UNIQUE ("ProjectId", "Revision"),
    CONSTRAINT "UQ_SchoolBotProjectRevision_School_Project_Revision" UNIQUE ("SchoolId", "ProjectId", "Revision"),
    CONSTRAINT "FK_SchoolBotProjectRevision_Project" FOREIGN KEY ("SchoolId", "ProjectId")
        REFERENCES public."SchoolBotProject" ("SchoolId", "SchoolBotProjectId")
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "CK_SchoolBotProjectRevision_SchoolId_Pos" CHECK ("SchoolId" > 0),
    CONSTRAINT "CK_SchoolBotProjectRevision_Revision_Pos" CHECK ("Revision" >= 1),
    CONSTRAINT "CK_SchoolBotProjectRevision_Version_Pos" CHECK ("Version" >= 1),
    CONSTRAINT "CK_SchoolBotProjectRevision_ContentHash_Len" CHECK (char_length("ContentHash") = 64),
    CONSTRAINT "CK_SchoolBotProjectRevision_Content_Obj" CHECK (jsonb_typeof("Content") = 'object')
);

-- Circular FK from SchoolBotProject.CurrentRevision -> SchoolBotProjectRevision (DEFERRABLE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'FK_SchoolBotProject_CurrentRevision'
    ) THEN
        ALTER TABLE public."SchoolBotProject"
            ADD CONSTRAINT "FK_SchoolBotProject_CurrentRevision"
            FOREIGN KEY ("SchoolId", "SchoolBotProjectId", "CurrentRevision")
            REFERENCES public."SchoolBotProjectRevision" ("SchoolId", "ProjectId", "Revision")
            ON DELETE NO ACTION ON UPDATE NO ACTION
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END
$$;

GRANT SELECT, INSERT, UPDATE ON
    public."SchoolBotSession",
    public."SchoolBotStaffRole",
    public."SchoolBotTeacherGrant",
    public."SchoolBotProject",
    public."SchoolBotProjectRevision"
TO schoolbot_app;


-- #############################################################################
-- Section: 003_learning_content_global.sql
-- Migration: 003_learning_content_global.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-005 (Global Learning Content & Question Bank)
-- References: DES-005 Rev3/Rev4, DES-010, DES-011, amendment-proposal-001/002
-- Preconditions:
--   1. Migration 001_base_license_release_atomic.sql has been applied.
--   2. Human approval of amendment-proposal-001 and amendment-proposal-002.
-- Data Impact: Additive only. Creates 8 global content tables (SchoolId IS NULL).
-- #############################################################################

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


-- #############################################################################
-- Section: 004_course_run_policy_attempt_submission.sql
-- Migration: 004_course_run_policy_attempt_submission.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-005 (Submissions/Assessments/CourseRun/Attempts/ScoringPolicy)
-- References: DES-005 Rev4, DES-008, DES-010, amendment-proposal-001/002
-- Preconditions:
--   1. Migrations 001, 002, and 003 have been applied.
-- Data Impact: Additive only. Creates 8 tenant-scoped learning execution tables.
-- #############################################################################

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


-- #############################################################################
-- Section: 005_grade_slot_mapping_preview_export.sql
-- Migration: 005_grade_slot_mapping_preview_export.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers: DES-008 (GradeSlot, ScoreMapping) & DES-009 (ScorePreview, Export, Outbox)
-- References: DES-008 Rev2, DES-009 Rev2, amendment-proposal-001/002
-- Preconditions:
--   1. Migrations 001..004 have been applied.
-- Data Impact: Additive only in School DB. Creates 6 tables. Does NOT touch PGGradeDB.
-- #############################################################################

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


-- #############################################################################
-- Section: 006_level_proposal.sql
-- Migration: 006_level_proposal.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers: DES-011 (SchoolBotLevelProposal) + Read-only grants on legacy School DB tables
-- References: DES-011 Rev2, DES-012, amendment-proposal-001/002
-- Preconditions:
--   1. Migrations 001..004 have been applied.
-- Data Impact: Additive only. Creates SchoolBotLevelProposal and grants SELECT on
--   existing legacy tables in School DB to schoolbot_app.
-- #############################################################################

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
