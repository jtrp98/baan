-- =============================================================================
-- Rollback: 001_base_license_release_atomic_rollback.sql
-- Target Database: School DB (JabjaiSchoolSingleDB), schema: public
--Preconditions:
--   1. Migrations 002..006 must have been rolled back first.
-- DESTRUCTIVE DATA WARNING:
--   Running this rollback permanently drops and destroys all data in:
--   - SchoolBotAuditEvent
--   - SchoolBotIdempotency
--   - SchoolBotRelease
--   - SchoolBotLicenseBinding
--   - SchoolBotLicense
--   Existing legacy SchoolBright tables are NOT affected.
-- =============================================================================

BEGIN;

ALTER TABLE IF EXISTS public."SchoolBotLicense"
    DROP CONSTRAINT IF EXISTS "FK_SchoolBotLicense_CurrentBinding";

DROP TABLE IF EXISTS public."SchoolBotAuditEvent";
DROP TABLE IF EXISTS public."SchoolBotIdempotency";
DROP TABLE IF EXISTS public."SchoolBotRelease";
DROP TABLE IF EXISTS public."SchoolBotLicenseBinding";
DROP TABLE IF EXISTS public."SchoolBotLicense";

-- Drop role only if it owns no objects and has no remaining privileges in current DB
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'schoolbot_app') THEN
        REVOKE ALL PRIVILEGES ON SCHEMA public FROM schoolbot_app;
    END IF;
END
$$;

COMMIT;
