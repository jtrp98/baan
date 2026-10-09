# review/phase-3.md — timetableai (archived review round, Phases 1, 2, 3)

Moved verbatim from `review.md` on 2026-10-04 (Review Round 9, size budget — `policies/documentation.md` §4). `## Open Issues` (SEC-01, PRE-01) and `## Unverified Behaviour` stay in `review.md`.

## Verification Summary — Phases 1, 2, and 3 (Current Round)

- **Mode: FULL** — All 10 tasks across Phase 1, Phase 2, and Phase 3 verified.
- **Round**: 1, 2026-09-29.
- **Mechanical Gate**:
  - Backend: `AITimeTableBackend` build and `AuthTests` suite (.NET 10.0) -> **PASS** (17/17 assertions green).
  - Frontend: TypeScript compilation, import integrity, and module contracts in `sb-tech-upgrade-web-system` -> **PASS**.
  - Grep sweep: Zero legacy routes or models found in either repository.
- **Security**: Phase 3 `🔒 Security gate` functionally verified (Bearer JWT authentication, tenant binding, menu authorization). SEC-01 logged in Open Issues for security sign-off.

## Verified File Manifest — Phases 1, 2, 3

| Target | File Path | Lines / Scope | Purpose |
|---|---|---|---|
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Models/Tbl_Timetable.cs` | 19 | Added `int? nCourseIntensity` |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Models/Request.cs` | 263, 342 | Added `nCourseIntensity` to requests; cleaned legacy models |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Controllers/WebAPIController.cs` | 32, 2445, 2472-2475, 2509-2511, 2635, 2686 | Added `[Authorize]`, intensity CRUD, removed legacy Schedule actions |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Helpers/DataContext.cs` | 57-65 | Removed legacy `Tbl_TeachingSchedule` and `Tbl_ClassPeriodDetail` |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Helpers/Messages.cs` | 38 | Added `InvalidCourseIntensity`; removed `ScheduleNotFound` |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Startup.cs` | 62-93, 136-137 | Fail-closed config check, Bearer auth, fallback policy, authorization filter |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Security/TokenAuthenticationHandler.cs` | 1-140 | Bearer JWT handler, 401/403 JSON challenge responses |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Security/TimetableEndpointPolicy.cs` | 1-119 | Endpoint to MenuID policy mapping table (§43.2a) |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Security/TimetableAuthorizationFilter.cs` | 1-249 | Tenant binding, audit override, admin check, DB menu authorization |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/Security/TimetableMenuSettings.cs` | 1-18 | Strongly-typed MenuID configuration |
| `sb-api-academic-timetable-ai` | `AITimeTableBackend/appsettings.json` | 16-22 | Configured MenuIDs (401, 402, 403, 404, 422) |
| `sb-tech-upgrade-web-system` | `src/app/[locale]/timetable/manage-teaching-schedule/_lib/course-weight.ts` | 1-262 | Course weight classification & SA-Q16 fallback (BR-77) |
| `sb-tech-upgrade-web-system` | `src/app/[locale]/timetable/manage-teaching-schedule/_lib/intensity-config.ts` | 1-83 | Central solver intensity config table (BR-78..BR-80) |
| `sb-tech-upgrade-web-system` | `src/app/[locale]/timetable/manage-teaching-schedule/_lib/intensity-summary.ts` | 1-115 | Intensity summary computation without recommendations (BR-81) |
| `sb-tech-upgrade-web-system` | `src/app/[locale]/timetable/manage-teaching-schedule/_lib/shortfall-report.ts` | 1-161 | Shortfall report data generator (DES-020, BR-82..BR-85) |
| `sb-tech-upgrade-web-system` | `src/app/[locale]/timetable/manage-teaching-schedule/_lib/timetable-helpers.ts` | Exports | Intensity helper functions and violation calculations |
| `sb-tech-upgrade-web-system` | `src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts` | 860-895 | Solver soft goal integration, attempt ranking, shortfall & intensity summary |
| `sb-tech-upgrade-web-system` | `src/lib/authHeaders.ts` | 27-48 | `timetableFetch` with automatic Bearer attachment & 401 session expiration |

## Per-Task Results — Phases 1, 2, 3

### Phase 1: Module B — Generate Results (DES-019, DES-020)
- **BE-003**: `Tbl_Timetable.nCourseIntensity` in model + `Timetable/Set|Get|GetAllByYear` — ✅ Verified
- **FE-002**: Heavy/light course classification (BR-77) with SA-Q16 fallback — ✅ Verified
- **FE-005**: Shortfall report data after Generate (DES-020) — ✅ Verified
- **FE-003**: Solver soft intensity goal (BR-78..BR-80) — ✅ Verified
- **FE-004**: Per-timetable intensity summary data (BR-81) — ✅ Verified

### Phase 2: Module H — Legacy Removal, Code Only (DES-021)
- **BE-004**: Remove legacy `Schedule*` endpoints and models from backend — ✅ Verified
- **FE-006**: Remove legacy `schedule(s)` proxy routes from frontend — ✅ Verified

### Phase 3: Module G — API Authentication & Authorization (REQ-021, DES-018) 🔒 Security gate
- **BE-001**: Bearer JWT authentication scheme + tenant binding + audit override — ✅ Verified
- **BE-002**: Per-page MenuID authorization policy (P2 server-side lookup) — ✅ Verified
- **FE-001**: Bearer coverage on timetable calls + 401/403 handling — ✅ Verified

## Review Outcome — Phase 1

**Status:** ✅ Verified (FULL)

Round 1 · 2026-09-29 · Scope: Phase 1 (BE-003, FE-002, FE-005, FE-003, FE-004).
Open item before deploy: PRE-01 (DDL execution by DevOps).

## Review Outcome — Phase 2

**Status:** ✅ Verified (FULL)

Round 1 · 2026-09-29 · Scope: Phase 2 (BE-004, FE-006).

## Review Outcome — Phase 3

**Status:** ✅ Verified (FULL)

Round 1 · 2026-09-29 · Scope: Phase 3 (BE-001, BE-002, FE-001). 🔒 Security gate.
Open item before deploy: SEC-01 (formal audit sign-off by security role).

All 10 tasks across Phases 1–3 meet requirements, design constraints, and acceptance criteria.
