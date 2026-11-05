# sb-compass — review archive: Phase 2 rounds

Moved verbatim from `review.md` on 2026-09-15 by the Phase 3 FULL round (review.md keeps only
open issues, the current round, and Unverified Behaviour). Read on demand only.

---

## Verification Summary (Phase 2 FULL, 2026-09-15, Round 2 post-restart)

- **Mode: FULL** — all 10 tasks in Phase 2 (BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012) verified.
- **Round**: 2 (post-restart). Closes Phase 2.
- **Mechanical Gate**:
  - Solution build: `"C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" ClassOnlineWeb/sb-web-student.sln -t:Build -p:Configuration=Debug -clp:ErrorsOnly` → **PASS** (Exit code 0, 0 Error(s)).
  - Project rebuild: `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Rebuild -p:Configuration=Debug -clp:ErrorsOnly` → **PASS** (Exit code 0, 0 Error(s)).
  - Schema contract: **n/a** — no Prisma schema in this project.
  - Security audit: **PASS** — `../security.md` Round 4 confirmed all Critical/Important findings closed (SEC-01..11).

## Verified File Manifest (Phase 2 FULL)

| Path | Lines verified | Change / Purpose |
|---|---|---|
| `ClassOnlineWeb/Global.asax.cs` | `43-57` | Fixed CS1061 compile blocker: drained `ConcurrentBag<TB_Send_API_Log>` using `TryTake()` |
| `ClassOnlineWeb/Helper/CompassEntitlementService.cs` | `1-117` | BE-013, BE-004: Fail-closed parameterized SQL querying `TSubscription` & `TPlan_Feature` ⋈ `TFeatureSBPlus` |
| `ClassOnlineWeb/Helper/InternalNetworkAccessGuard.cs` | `1-244` | BE-008: IP / internal-network allowlist with trusted proxy CIDR verification |
| `ClassOnlineWeb/Helper/CsrfHeaderGuard.cs` | `1-35` | BE-008: CSRF protection (`X-Requested-With`) for `recompute/*` |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `43-65` | BE-006: Field-level gating on `analyst/{sID}` (`Boost = null` when unentitled, 200 OK) |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `261-263` | BE-005: 403 Forbidden gating on `calculate/score` |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `328-354` | BE-007, BE-008: Two-layer defense on `recompute/*` (IP allowlist + CSRF then `compass_admin_ops`) |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `363-365, 388-390` | BE-005: 403 Forbidden gating on `AI_calculate/path`, `AI_advice/path` |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `411-413, 439-441, 505-507` | BE-005: 403 Forbidden gating on MBTI endpoints (`questions`, `answer`, `latest`) |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `701-707, 740-746` | BE-005, BE-009, BE-010: Identity from `UserData.UserID` only, client SID ignored on `AI_exercise/*` |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `799-807` | BE-005, BE-011: Identity from `UserData.UserID` only, client SID ignored on `certificate/issue` |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `836-878` | BE-012: `compass_admin_ops` gating on `debug/scores`, `debug/national-stats`, `debug/my-stat` |

## Per-Task Results (Phase 2 FULL)

### BE-013 — Verify SB PLUS column names for TSubscription and TPlan_Feature (PRE-05) — ✅ Verified
`CompassEntitlementService.cs:73-93` matches verified DB schema: `TSubscription` (`subscription_id`, `sID`, `status`, `expire_at`, `subscription_plan_id`), `TPlan_Feature` (`plan_id`, `feature_id`), and `TFeatureSBPlus` (`feature_id`, `schoolID`, `"FeatureCode"`). Business keys confirmed as `compass_premium` and `compass_admin_ops` (2026-09-15).

### BE-004 — Implement CheckEntitlement steps 1-3 (fail-closed, parameterized SQL) — ✅ Verified
`CompassEntitlementService.HasFeature(sID, schoolId, featureKey)`:
1. Parameterized SQL with `NpgsqlParameter` throughout (`@p0`, `@p1`, `@p2`). Zero string concatenation.
2. Checks `status IN ('Active','PendingCancel') AND expire_at >= NOW() ORDER BY subscription_id DESC LIMIT 1`.
3. Joins `TPlan_Feature` and `TFeatureSBPlus` (2 tables only; never `TSubcriptionPlan`).
4. Fail-closed: DB exception/failure returns `false`.

### BE-005 — Gate Premium endpoints with compass_premium (HTTP 403, Data = null) — ✅ Verified
All 9 endpoints (`calculate/score`, `AI_calculate/path`, `AI_advice/path`, `AI_mbti/questions`, `AI_mbti/answer`, `AI_mbti/latest`, `AI_exercise/path`, `AI_exercise/submit`, `certificate/issue`) verify entitlement via `CompassEntitlementService.HasFeature(ud.UserID, ud.CompanyID, FeatureKeyPremium)`. Rejection yields HTTP 403 with `VMResponseModel` (`Data = null`).

### BE-006 — Field-level gating at analyst/{sID}: Boost null without entitlement — ✅ Verified
`CompassApiController.cs:43-65` implements field-level gating:
- `Boost = (hasPremium && level == "weak") ? BuildWeakBoost(a.CanonicalSubject) : null;`
- Unentitled student receives HTTP 200 with full free fields (`Subject`, `Score`, `Level`, `HighlightTopic`, `AiSummary`, `PassScore`) and `Boost = null`.

### BE-007 — Gate recompute/* with compass_admin_ops entitlement — ✅ Verified
`CompassApiController.cs:336, 351` checks `FeatureKeyAdminOps` ("compass_admin_ops") for both `recompute/national-stats` and `recompute/status`. Distinct key from `compass_premium`.

### BE-008 — IP/internal-network allowlist in front of recompute/* — ✅ Verified
`InternalNetworkAccessGuard.IsAllowed(Request)` and `CsrfHeaderGuard.HasRequiredHeader(Request)` execute before any authentication or entitlement check. Rejections return HTTP 404 (`NotFound()`) without revealing endpoint existence. Unconfigured allowlist fails closed.

### BE-009, BE-010, BE-011 — Identity from JWT only (AI_exercise/*, certificate/issue) — ✅ Verified
All three endpoints check `ud == null -> 401 Unauthorized`, ignore client-supplied `request.SID`, and bind operations and responses exclusively to authenticated `UserData.UserID`.

### BE-012 — Gate the three debug endpoints with compass_admin_ops — ✅ Verified
`debug/scores`, `debug/national-stats`, and `debug/my-stat` check `ud == null -> 401` and verify `FeatureKeyAdminOps` returning HTTP 403 if unentitled.

## Review Outcome — Phase 2

**Status:** ✅ Passed (FULL)

Round date: 2026-09-15 · Scope: Phase 2 (Module B — Premium Entitlement & API Authorization 🔒 Security gate)
All 10 tasks in Phase 2 (BE-004 through BE-013) verified against `design.md` rules, `requirement.md` REQ-013/014/015,
and `plan.md`. The project builds cleanly with 0 errors via VS 2022 MSBuild, and the `🔒 Security gate`
was confirmed closed via `../security.md` Round 4.
