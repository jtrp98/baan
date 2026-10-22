-- =============================================================================
-- Migration: 002_identity_session_staff.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-002 (Session/TeacherGrant), DBA-004 (Projects), H4 (DES-012)
-- References: DES-003, DES-004, DES-012, amendment-proposal-002.md
-- Preconditions:
--   1. Migration 001_base_license_release_atomic.sql has been applied.
--   2. Human approval for H4 (Session channel & StaffRole) and conditional TeacherGrant.
-- Data Impact: Additive only. Creates 5 tables in School DB.
-- =============================================================================

BEGIN;

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

COMMIT;
