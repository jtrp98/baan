-- =============================================================================
-- Migration: 001_base_license_release_atomic.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
-- Covers Plan Tasks: DBA-001, DBA-002 (core license/idempotency/audit), DBA-006 (release)
-- References: DES-002, DES-007, data-model.md Rev3/Rev4, data-contract-rules.md
-- Preconditions:
--   1. Connected to School DB (JabjaiSchoolSingleDB) as migration admin/superuser.
--   2. Human approval of physical schema design (db/review-001.md).
-- Data Impact: Additive only. Creates role schoolbot_app and 5 core tables.
-- =============================================================================

BEGIN;

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

COMMIT;
