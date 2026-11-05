# sb-compass — review archive, Phase 4 (moved verbatim from review.md, 2026-09-15)

## Verification Summary

- **Mode: FULL** — all 3 tasks in Phase 4 (BE-018, BE-019, FE-001) verified. Closes Phase 4.
- **Round**: 4 (post-restart), 2026-09-15.
- **Mechanical Gate**:
  - `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -p:Configuration=Debug -clp:ErrorsOnly -nologo` (VS 2022, `Current/Bin/MSBuild.exe`) from `C:\src\sb-web-student` → **PASS** (exit code 0).
  - Schema contract: **n/a** — no DB change in Phase 4 (additive view-model + UI only; plan.md BE-018 rollback notes "no schema touched").
  - Security: Phase 4 carries no `🔒 Security gate` in `plan.md` (T5, additive VM + UI); the one security-relevant invariant (breakdown assembled strictly after the 403 entitlement gate — BE-019 / AC-016.5) is verified below.
  - EVD-013/014 re-check: `design.md` cites `VMCourseBreakdown` at `CompassApiController.cs:290` and `Courses` at `:286`, revision b7747bd — the current working tree still matches both symbols at exactly those lines (grep this round).
- **Closed-round archive**: the Phase 3 FULL round previously inline here moved verbatim to `review/phase-3.md` (appended) by this round, per review.md's own archiving discipline.

## Verified File Manifest — Phase 4

| Path | Lines verified | Change / Purpose |
|---|---|---|
| `ClassOnlineWeb/VMModels/Compass/VMCompass.cs` | `59-88` | BE-018: `VMCourseBreakdown` class + `VMSubjectStat.Courses` field |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `260-322` | BE-018/BE-019: `CalculateScore` — breakdown assembly inside the post-gate projection |
| `ClassOnlineWeb/Helper/CompassScoreService.cs` | `214-287` | Blast radius: both aggregation methods unchanged vs FULL-verified forms |
| `ClassOnlineWeb/assets/js/compass.js` | `241-277` | FE-001: `courseBreakdownHtml` + `tablePanelHtml` (Table in Card) |
| `ClassOnlineWeb/assets/css/compass.css` | `1036-1124` | FE-001: `cp-group-*` / `cp-course-*` / `is-no-credit` styles |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `30-95` | Blast radius: free tier `analyst/{sID}` untouched |

## Per-Task Results — Phase 4

### BE-018 — VMCourseBreakdown + VMSubjectStat.Courses — ✅ Verified
- **VM shape matches the DES-018 contract verbatim** (`VMCompass.cs:65-72`): `CourseName`/`CourseCode` (`string`, may be null)/`Term` (`string`)/`Score` (`double`)/`Credit` (**`double?`**) — field names and types exactly as `## Premium Subject Breakdown Contract`; `VMSubjectStat` (`:74-81`) adds only `Courses` (`List<VMCourseBreakdown>`) — existing fields untouched (Subject/StudentScore/Mean/Percentile).
- **No null→0 coercion anywhere**: `Credit = s.Credit` passes the nullable straight through (`CompassApiController.cs:295`); grep finds no `Credit ?? 0` on the breakdown path (the only `?? 0` is `TotalCredit` inside the Phase-1 aggregation, which is that method's own contract).
- **Row rules** (`CompassApiController.cs:286-296`):
  - non-core hidden — breakdown lives inside `studentAgg` (from `AggregateByCanonicalSubjectWeighted`, `CompassScoreService.cs:251` filters `CanonicalSubject` non-empty), so non-core courses never reach any group (DES-018 non-core rule).
  - no-numeric-score hidden — `Where(s => s.Score100.HasValue)` (`:287`, AC-016.3).
  - per-term rows not merged — one `VMCourseBreakdown` per `CompassSubjectScore` record with its own `Term = s.NTerm`; no `GroupBy` on the breakdown path (DES-018 multi-term rule).
  - sort — `OrderByDescending(Score100).ThenBy(CourseName)` (`:288-289`) = score desc, name ties (DES-018 sort rule).
  - single-course group shows (AC-016.2) and no-credit course still shows with `Credit` JSON `null` (AC-016.4) — nothing in the projection drops rows on credit; fallback groups render because the group comes from `studentAgg` (fallback = plain average inside the aggregation, `CompassScoreService.cs:258-261`) with every row's `Credit` null (total credit 0 means no row had usable credit) — DES-018 last rule satisfied structurally.
  - `StudentScore`/`Mean`/`Percentile` computation unchanged (still `Math.Round(a.AverageScore, 2)` / mean lookup / `0`).

### BE-019 — Courses assembled strictly after the premium check — ✅ Verified
Code order in `CalculateScore` (`CompassApiController.cs:261-270`): (1) `UserData` null → 401; (2) `CompassEntitlementService.HasFeature(...FeatureKeyPremium)` fails → **`return ApiFail("Forbidden", 403)`** (`:265-266`); only then (3) `GetSubjectScoresAsync` → `AggregateByCanonicalSubjectWeighted` → the `Select` that builds `Courses` (`:286`). The breakdown object is never created on the 403 path — the `return` precedes any assembly (AC-016.5). No full-payload-then-filter pattern exists anywhere in the method (single projection, built once, after the gate); the in-code comment states the invariant explicitly.

### FE-001 — Premium Table-in-Card breakdown screen — ✅ Verified
- **Reads `Courses` only** (`compass.js:241-277`): `courseBreakdownHtml(s.Courses)` maps backend rows straight to `<tr>`; no computation, no aggregation, no re-sort client-side (plan FE-001 constraint + signed UXUI spec "never computes, re-aggregates, or infers").
- **Table in Card per signed spec (AC-016.7)**: `tablePanelHtml` renders one `cp-group-card` per subject group — group head (name / `ค่าเฉลี่ย` mean / weighted score, is-better/is-below preserved) with the per-course `cp-course-table` inside the same card; columns รายวิชา (with `(เทอม N)` suffix) / คะแนนดิบ / หน่วยกิต (`compass.js:269-277`).
- **Null Credit copy exact (AC-016.4)**: `NO_CREDIT_LABEL = 'ไม่มีข้อมูลหน่วยกิต'` (`:250`); null/undefined → that exact string with `is-no-credit` class — never `0`, never blank, row never hidden (`:253-256`). CSS: muted color + italic, text content of the cell not a tooltip (`compass.css:1117-1121`) — matches the signed spec verbatim.
- **Free tier untouched (AC-016.6)**: `analyst/{sID}` action unchanged (`CompassApiController.cs:30-95` — still `AggregateByCanonicalSubject(raw)`, 0-dp round, 60/80 thresholds); `git diff` shows zero hunks touching `renderAnalyst` or any free-tier selector; breakdown styles live in their own `cp-group-*`/`cp-course-*` selectors, no shared class visually altered (signed spec constraint).
- **No `ทั่วประเทศ` introduced**: grep of `compass.js` + `compass.css` for `ทั่วประเทศ`/`ระดับประเทศ` → no matches. (`Views/Compass/Analytics.cshtml:75,110` still carries the known pre-existing violations — moved into FE-002 scope by the 2026-09-15 plan amend; not counted against Phase 4.)

## Blast-radius / do-not-modify checks — all ✅

- **`AggregateByCanonicalSubjectWeighted` unchanged**: `CompassScoreService.cs:245-272` matches the FULL-verified 2026-09-02 form (Phase 4 only *calls* it, unchanged).
- **Free tier unchanged**: see FE-001 above — endpoint, JS render path, and thresholds all identical to the Phase-3-verified state.
- **UXUI lane**: FE-001 verified against the signed artifact `../uxui/design.md` (signed off by `dev` 2026-09-15) — layout, null-credit copy, muted-italic treatment, own-namespace CSS, free-page non-regression all conform; no deviation found.
- **Mechanical gate**: MSBuild project Build → exit code 0 (ISS-03's accepted gate).

## Review Outcome — Phase 4

**Status:** ✅ Passed (FULL)

Round date: 2026-09-15 · Scope: Phase 4 (Module D — Premium Subject Breakdown, REQ-016 / DES-018 / AC-016.1-016.7).
All 3 tasks verified against `design.md` `## DES-018 — Premium Subject Breakdown Contract`, `requirement.md` REQ-016,
and the signed UXUI artifact. Plan-vs-tree note (same as Phase 3): BE-018/BE-019 landed without a relayed handoff record —
this round verified the real code, as required. No new issues opened; ISS-03/ISS-07 remain the only open items (tooling, devops).
**Phase 4 closes.** Next: Phase 5 FE-002 — note its scope now includes `Views/Compass/Analytics.cshtml:75,110` per the
2026-09-15 plan amend (UXUI sign-off Q1).
