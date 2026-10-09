# sb-compass — QA Review (DEV workspace, three-repo mode)

Workspace: `C:\src\sb-web-student` (`role: dev`) · Knowledge root (read-only):
`C:\src\schoolbright-knowledge` · Contract source: `<knowledge>/_docs/module/sb-compass/design.md`
+ `plan.md` + `requirement.md`.

**Three-repo note**: this workspace cannot write `plan.md` (the `role: dev` hook denies it
unconditionally). Task Status changes are recorded in `## Knowledge sync — three-repo mode`
below for a BA-workspace session to apply verbatim — that relay is not a second review.

## Open Issues — all phases

| id | Phase | Severity | Issue | Owner | Status |
|---|---|---|---|---|---|
| ISS-01 | 1 → design gap | Important | `CompassPathCatalog.BuildAdvice` re-rounded the shared weighted subject value to **0 dp** for `VMGapItem.Current` (Premium endpoint `AI_advice/path`, REQ-006 vs `design.md` rule 5 bullet 2). **Fixed and TARGETED-verified 2026-09-15** — see `## TARGETED Round — BE-003 part 2` below. | system-analyst | **Closed** |
| ISS-02 | 1 × 3 | Important (sequencing) | `calculate/score` pairs **weighted** student subject scores with **unweighted** network mean/rank until Phase 3 (BE-014/BE-017) is implemented. **Closed 2026-09-15**: the Phase 3 FULL round verified BE-014 (batch weighted) and BE-017 (request-time weighted) — both sides now derive from `AggregateByCanonicalSubjectWeighted`, the mismatch no longer exists in code. The release condition itself is now trivially satisfiable (bundle Phase 1+3, which is the same tree); the remaining obligation on `devops` is PRE-04: network-wide recompute (`?limit=0`) after deploy before opening Premium. | project-manager / devops | **Closed** |
| ISS-03 | repo-wide tooling | Minor | `.agent-team/config.yaml` sets every stack command to `dotnet msbuild …`, which cannot build .NET Framework 4.x web sln. `static-analysis-gate.js` reports environmental FAIL on every run; VS 2022 MSBuild is used as the real mechanical gate. | devops | open |
| ISS-04 | 3 (informational) | Minor | `CompassRankingService.GetStudentStatDiagnosticAsync` (`debug/my-stat`) still uses the unweighted method. **Closed 2026-09-15**: intent confirmed deliberate — `design.md` DES-015 rule-0 caller table does **not** list the diagnostic as a weighted consumer (only `analyst/{sID}` free tier is raw, by design), and `CompassRankingService.cs:250-252` documents the choice in-code ("Deliberately still the RAW average … it exists to expose the underlying per-course layer"). Endpoint is `compass_admin_ops`-gated (BE-012), so no Premium data path is affected. | system-analyst | **Closed** |
| ISS-05 | 2 | 🔒 Security gate | Phase 2 `🔒 Security gate` in `plan.md`. All 6 security findings (SEC-01, 02, 03, 08, 10, 11) were resolved in `security.md` Round 4. Functional gating confirmed this round. | security | **Closed** |
| ISS-06 | process | Important | Concurrent Phase 2 edits in-flight during Round 1. This round formally inspects and verifies all Phase 2 work. | qa-engineer | **Closed** |
| ISS-07 | repo-wide tooling | Minor | `generate-status.js` is not three-repo aware. Generator needs to resolve `AGENTCLAUDE_KNOWLEDGE_ROOT`. | devops | open |
| ISS-08 | compile fix | Minor | `Global.asax.cs(53,57)` compile error CS1061 (`ConcurrentBag.Clear()`) caused by upstream update in `schoolbright-backend/JabjaiMainClass`. Fixed via `TryTake()` queue draining. | backend-engineer | **Closed** |
| ISS-09 | 5 | Minor (cosmetic copy) | Lock-overlay **title** at `compass-design.js:394` keeps the old `สถิติเทียบเครือข่ายอยู่ใน SB Plus`; the signed UXUI C6 copy is `สถิติเทียบเครือข่าย SchoolBright อยู่ใน SB Plus`. WORD-01-compliant as-is (no nationwide claim; the artifact's own fallback rule accepts keeping compliant current wording) — but not the exact signed string. One-word edit, non-blocking. | frontend-engineer | open |
| ISS-10 | 5 → scope ruling | Minor | `compass.js:225` (live REQ-004 screen, **outside FE-002's file list**) renders `อันดับใน ป.5 · ทั้งเครือข่าย` — the same bare `ทั้งเครือข่าย` pattern the signed UXUI artifact (C4) judged "borderline" and renamed to `เครือข่าย SchoolBright` in `compass-design.js:384`. Needs a DES-020 ruling whether it is a WORD-01 semantic equivalent, and a routing decision (same precedent as the 2026-09-15 Analytics.cshtml scope amend). Not counted against FE-002 — grep found no forbidden words in any in-scope file. | system-analyst | open |


## Verification Summary — Phase 5 (current round)

- **Mode: FULL** — the single task in Phase 5 (FE-002) verified. Closes Phase 5, and with it every phase of the module's plan.
- **Round**: 5, 2026-09-15. (The Phase 4 FULL round moved verbatim to `review/phase-4.md` by this round.)
- **Mechanical Gate**: `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -p:Configuration=Debug -clp:ErrorsOnly -nologo` (VS 2022 `Community/MSBuild/Current/Bin/MSBuild.exe`) from `C:\src\sb-web-student` → **PASS** (exit code 0).
- **Schema contract: n/a** — zero DB/schema surface touched (see AC-019.2 below).
- **Security**: Phase 5 heading carries `🔒 Security gate n/a` — confirmed accurate: the round's entire diff is display strings in 2 files; no auth, data, payload, or input-handling code touched (see blast-radius).
- **Forbidden-wording sweep**: grep of the whole tree (`*.cshtml`, `*.js` under `ClassOnlineWeb`) for `ทั่วประเทศ` / `ระดับประเทศ` / `ทั้งประเทศ` / `ทั้ง 9 โรงเรียน` → **zero matches**. Semantic-equivalent review of the 5 in-scope files: all comparison copy now names the `เครือข่าย SchoolBright` base (one borderline bare `ทั้งเครือข่าย` remains at `compass.js:225`, outside FE-002's file list → ISS-10).

## Verified File Manifest — Phase 5 (FE-002)

| Path | Lines verified | Change / Purpose |
|---|---|---|
| `ClassOnlineWeb/assets/js/compass-design.js` | `307`, `384`, `394` (context `295-400`) | statTitle ternary collapsed; ranking panel title; lock-overlay desc |
| `ClassOnlineWeb/Views/Compass/Analytics.cshtml` | `75`, `110` | premium stat title; gate upsell list item |
| `ClassOnlineWeb/Views/Compass/MyCompass.cshtml`, `assets/js/compass-design-data.js`, `assets/js/compass-design-engine.js` | whole file (grep) | no WORD-01-relevant wording present — nothing to change, nothing changed |

## Per-Task Results — Phase 5

### FE-002 — WORD-01 wording fix (REQ-019 / AC-019.2, DES-020) — ✅ Verified

Diff-review (`git diff` working tree, unstaged = this run's work): exactly **4 string hunks in 2 files** — nothing else in the FE-002 files changed. The other unstaged hunks in the tree (`compass.js`/`compass.css` Table-in-Card, `.gitignore` sta block) are the already-FULL-verified Phase 4 FE-001 work and framework-managed bootstrap lines respectively, not this run's changes.

**Copy vs the signed UXUI artifact (`uxui/design.md` FE-002 final copy table, signed off by `dev` 2026-09-15, Q1/Q2/Q3 resolved "ทำตามคำแนะนำ"):**

| # | Point | Signed final copy | Tree | Match |
|---|---|---|---|---|
| C1/C2 | `compass-design.js:307` statTitle | `Stat เทียบเครือข่าย SchoolBright` (both tiers; mock count dropped) | ternary collapsed to exactly that string | ✅ |
| C3 | subtitle `:382` | keep as-is | unchanged (`…ป.5 ทั้งเครือข่าย SchoolBright · เทียบค่าเฉลี่ยรายวิชา`) | ✅ |
| C4 | ranking panel title `:384` | `อันดับใน ป.5 · เครือข่าย SchoolBright` | exact | ✅ |
| C5 | compare footnote `:391` | keep as-is | unchanged (`ค่าเฉลี่ยจากเครือข่ายโรงเรียน SchoolBright … ไม่ใช่เกณฑ์คัดควดเลือก…`) | ✅ |
| C6 desc | lock overlay `:394` desc | `อัปเกรดเพื่อดูอันดับและค่าเฉลี่ยเทียบเครือข่าย SchoolBright` | exact | ✅ |
| C6 title | lock overlay `:394` title | `สถิติเทียบเครือข่าย SchoolBright อยู่ใน SB Plus` | still old `สถิติเทียบเครือข่ายอยู่ใน SB Plus` | ⚠️ ISS-09 (compliant, non-blocking) |
| — | `Analytics.cshtml:75` | `Stat เทียบเครือข่าย SchoolBright` (Q1(a) suggested copy) | exact | ✅ |
| — | `Analytics.cshtml:110` | `อันดับ + percentile เทียบเครือข่าย SchoolBright` (Q1(a) suggested copy) | exact | ✅ |

**AC-019.2 (display-text change only, mockup intact):** the 4 hunks replace display strings only. Mock numbers untouched (`ดีกว่าเพื่อน 12%`, `อันดับ 3,693 จาก 4,191 คน`, histogram, `conic-gradient` ring all still at `compass-design.js:385-387`); ranking/mock logic, `compass-design-data.js`, `compass-design-engine.js`, schema/payload untouched (zero hunks); the statTitle ternary collapse removes only the branch that chose between two title strings — both tiers now show the one signed title, which is the Q2-resolved copy, not a feature cut. The lock overlay itself still fires on `!s.isPlus` (`compass-design.js:393-394`) — tier gating intact.

**`MyCompass.cshtml` / data / engine files:** grep for `เครือข่าย` (and the forbidden terms) returns nothing in these three — no WORD-01-relevant wording exists there; correctly left unmodified.

**Human gate (`business`) — BA-check status:** FE-002's plan row gates final copy on `business-analyst` checking it does not overclaim the real data base. No BA-lane check is recorded. The **substance** is satisfied by records this round verified: the copy names only the `เครือข่าย SchoolBright` base (DES-020 meaning table), drops the mock `9 โรงเรียน` count from headings (Q2), and keeps the anti-overclaim footnote C5 verbatim — no string on screen claims nationwide coverage. The **formal BA record is still owed** (or explicitly waived by the user) before deploy; it does not block plan closure because the wording cannot overclaim as shipped.

## Blast-radius / do-not-modify checks — all ✅

- Only 2 files, 4 display-string hunks changed in this run; nothing outside FE-002's (amended) file list touched.
- No numbers, formulas, mock structures, schema, payload, or gating logic altered (hunk-by-hunk read).
- Security-sensitive surfaces untouched: no auth/entitlement/CSRF/IP-guard code in the diff; `🔒 Security gate n/a` confirmed.
- Mechanical gate: MSBuild Debug Build → exit code 0.

## Review Outcome — Phase 5

**Status:** ✅ Passed (FULL)

Round date: 2026-09-15 · Scope: Phase 5 (FE-002 — WORD-01 wording, REQ-019/AC-019.2, DES-020).
All forbidden and semantically-equivalent nationwide wording is gone from the tree; copy matches the signed UXUI
artifact at every claimed point (one cosmetic deviation → ISS-09); AC-019.2 display-only constraint holds; MSBuild exit 0.
**Phase 5 closes — all five phases of the module's plan are now verified.** Open items before deploy: PRE-04 network-wide
recompute, PRE-06 feature seeding, ISS-03/ISS-07 (tooling), ISS-10 (DES-020 scope ruling for `compass.js:225`), the owed
BA-check record (or user waiver), and the `devops` pre-deploy gate (Unverified Behaviour list review included).

## Unverified Behaviour — undeployed phases

Phase 1 and Phase 2 have no automated test suite (org policy). The following were verified by static analysis, read-through, unit harness execution, and compile check — never by running the shipped application against live databases and auth infrastructure. `devops` must review this list before deploying.

### Phase 1 (Module A)
1. **End-to-end `POST /calculate/score`** with real grade-DB data was never executed (no runtime, no DB, no auth context in this workspace).
2. **End-to-end `AI_calculate/path` / `AI_advice/path`** Fit% and Gap numbers computed from the new weighted dictionary were not executed.
3. **Rule 5's strong/normal/weak cut** on the Premium side is applied by consumers of `StudentScore`.
4. **How often the fallback actually fires in production** (OQ-12 data-quality) is unmeasured.
5. **Banker's rounding at exact midpoints** (`MidpointRounding.ToEven`).
6. **Free-tier non-regression** rests on diff and clean compile.

### Phase 2 (Module B)
1. **Live PostgreSQL queries to SB PLUS tables** (`TSubscription`, `TPlan_Feature`, `TFeatureSBPlus`) were not executed against a live DB instance.
2. **Reverse proxy / ingress header forwarding** (`X-Forwarded-For`) behaviour with real trusted CIDR ranges must be verified in staging.
3. **Mobile app client error handling** on receiving HTTP 403 with `Data = null` must be verified by frontend QA.
4. **Data seeding script (PRE-06)** for `FeatureCode` column and rows must be applied by devops/DBA before enabling features in production.

### Phase 3 (Module C)
1. **`RecomputeAsync` batch was never executed** against any real database — no `EnsureTables` DDL run, no `TRUNCATE`/INSERT cycle, no `?limit=0` network-wide run (that is devops' PRE-04). Table shapes and row contents are verified by reading only.
2. **Population stddev values** (`NULL` when n<30, `0` when all equal, `/n` divisor) verified by reading the formula, never by comparing computed rows against hand math on real data.
3. **Request-time rank agreement with the stored pile** (`GetStudentNationalStatsAsync` weighted overall vs `TCompassStudentLevelScore."OverallAvg"`) — the two formulas are textually identical, but the end-to-end rank was never observed live.
4. **Cross-school level canonicalisation** (`NormalizeToMasterCode` Thai-name → `mc:` mapping) — unchanged legacy behaviour, never executed against real `TSubLevel` data in this round.
5. **PostgreSQL identifier quoting** — every occurrence is quoted in source, but only a real `EnsureTables` run proves no quoting/folding slip (RISK-10's silent-failure mode).
6. **`CompassClusterService` (Module K consumer)** reading `"MeanScore"`/`"StddevScore"` — out of this module's scope, unverified here.

### Phase 4 (Module D)
1. **Visual outcome of the Table-in-Card screen** — layout, spacing, and the muted-italic `ไม่มีข้อมูลหน่วยกิต` cell were verified by reading `compass.js`/`compass.css` against the signed UXUI spec, never in a rendered browser (no runtime in this workspace).
2. **Runtime response shape of `calculate/score` with `Courses`** — the JSON actually serialized (null `Credit` as JSON `null`, per-term rows, sort order) verified by reading the projection only; no live request was executed.
3. **The 403 path for a non-Premium caller** — verified by code order (assembly strictly after the gate), never by a live unauthorized request.
4. **Real multi-term / no-credit / fallback-group payloads** — no live grade-DB data was queried, so AC-016.1–016.4 row rules were verified structurally, not against observed responses.

### Phase 5 (Module E — wording)
1. **Visual rendering of the reworded strings** — the five copy points were verified by reading `compass-design.js`/`Analytics.cshtml` against the signed UXUI copy table, never in a rendered browser (no runtime in this workspace). This is the only Phase 5 unverified item — the change is display text.

## Knowledge sync — three-repo mode

For a **BA-workspace** session to apply verbatim to
`C:\src\schoolbright-knowledge\_docs\module\sb-compass\plan.md` → `## Phase 5` (FE-002) Status cell
(relay of this round's decisions — not a second review). The Phase 1/Phase 2/Phase 3 tables below were
already applied (see `plan.md` Change Log 2026-09-14/2026-09-15) and are kept for traceability.

| Task id | Current Status in `plan.md` | New Status | Basis |
|---|---|---|---|
| FE-002 | `pending` | `verified` | Phase 5 FULL — `## Per-Task Results — Phase 5` → FE-002 |

Phase 4 (already applied; kept for traceability):

| Task id | Current Status in `plan.md` | New Status | Basis |
|---|---|---|---|
| BE-018 | `pending` | `verified` | Phase 4 FULL (applied) — `review/phase-4.md` → BE-018 |
| BE-019 | `pending` | `verified` | Phase 4 FULL (applied) — `review/phase-4.md` → BE-019 |
| FE-001 | `pending` | `verified` | Phase 4 FULL (applied) — `review/phase-4.md` → FE-001 |

| Task id | Current Status in `plan.md` | New Status | Basis |
|---|---|---|---|
| BE-014 | `pending` | `verified` | Phase 3 FULL (applied) — `review/phase-3.md` → BE-014 |
| BE-015 | `pending` | `verified` | Phase 3 FULL (applied) — `review/phase-3.md` → BE-015 |
| BE-016 | `pending` | `verified` | Phase 3 FULL (applied) — `review/phase-3.md` → BE-016 |
| BE-017 | `pending` | `verified` | Phase 3 FULL (applied) — `review/phase-3.md` → BE-017 |

| Task id | Current Status in `plan.md` | New Status | Basis |
|---|---|---|---|
| BE-013 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-013 |
| BE-004 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-004 |
| BE-005 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-005 |
| BE-006 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-006 |
| BE-007 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-007 |
| BE-008 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-008 |
| BE-009 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-009 |
| BE-010 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-010 |
| BE-011 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-011 |
| BE-012 | `pending` | `verified` | Phase 2 FULL — `## Per-Task Results` → BE-012 |

Phase 1 (apply to `## Phase 1` Status cells; relay of the 2026-09-15 TARGETED decision — not a re-review):

| Task id | Current Status in `plan.md` | New Status | Basis |
|---|---|---|---|
| BE-003 | `pending` | `verified` | Both parts: call swap FULL-verified 2026-09-02 (`review/phase-1.md` → BE-003) + Gap Report 2-dp fix TARGETED-verified 2026-09-15 (`## TARGETED Round — BE-003 part 2`) |

## Archived rounds

- `_docs/module/sb-compass/review/phase-1.md` — Phase 1 rounds: original (2026-08-25), Round 1 post-restart (2026-09-02), and the BE-003 part-2 TARGETED round (2026-09-15, appended 2026-09-15).
- `_docs/module/sb-compass/review/phase-2.md` — Phase 2 FULL round (2026-09-15), moved out of review.md by the Phase 3 round.
- `_docs/module/sb-compass/review/phase-3.md` — Phase 3 round (2026-08-26, pre-restart — historical, superseded by this plan restart) + the Phase 3 FULL round (2026-09-15, moved out of review.md by the Phase 4 round).
- `_docs/module/sb-compass/review/phase-4.md` — Phase 4 FULL round (2026-09-15, moved out of review.md by the Phase 5 round).

## Change Log

- 2026-09-15 — **Round 5, Phase 5 FULL verification (FE-002, WORD-01 wording, REQ-019/AC-019.2, DES-020).** Tree-wide grep for `ทั่วประเทศ`/`ระดับประเทศ`/`ทั้งประเทศ`/`ทั้ง 9 โรงเรียน` → zero matches; the run's diff is exactly 4 display-string hunks in `compass-design.js` (`:307` statTitle collapsed to the signed copy, `:384` panel title, `:394` lock-overlay desc) and `Analytics.cshtml` (`:75`, `:110`); subtitle `:382` and footnote `:391` correctly kept; every signed-copy point matches except the lock-overlay **title** (compliant but not the signed string → ISS-09, Minor, frontend-engineer). AC-019.2 holds: mock numbers/ranking logic/schema untouched, tier gating intact. `MyCompass.cshtml`/`compass-design-data.js`/`compass-design-engine.js` carry no WORD-01 wording — correctly unmodified. Found `compass.js:225` bare `ทั้งเครือข่าย` on the live REQ-004 screen, outside FE-002's file list → ISS-10 (DES-020 scope ruling, system-analyst). MSBuild Debug Build exit 0; security gate `n/a` confirmed (text-only diff). BA-check (`business` human gate): substantively covered by the signed UXUI record and bounded wording, but no BA-lane check is recorded — owed (or user-waived) before deploy. Archived the Phase 4 FULL round to `review/phase-4.md`; added Phase 5 Knowledge-sync row (FE-002 `pending` → `verified`) and Phase 5 Unverified Behaviour (visual rendering only). **Phase 5 closes — the module's plan is fully verified.**

- 2026-09-15 — **Round 4, Phase 4 FULL verification.** All 3 tasks (BE-018, BE-019, FE-001) verified against DES-018 (`## Premium Subject Breakdown Contract`), REQ-016 AC-016.1–016.7, and the signed UXUI artifact: VM shape/`double? Credit` exact, row rules (non-core/no-score hidden, per-term rows, score-desc/name-ties sort, fallback groups with all-null credits), `Courses` assembled strictly after the 403 entitlement gate (no build-then-strip anywhere), FE reads `Courses` only with Table-in-Card layout and exact `ไม่มีข้อมูลหน่วยกิต` null-credit copy, free tier and `AggregateByCanonicalSubjectWeighted` unchanged, EVD-013/014 line/symbol references still current, MSBuild exit 0. No new issues. Archived the inline Phase 3 FULL round to `review/phase-3.md`. Added Phase 4 Knowledge-sync rows (BE-018/BE-019/FE-001 `pending` → `verified`) and Phase 4 Unverified Behaviour. **Phase 4 closes** — next: Phase 5 FE-002 (scope now includes `Analytics.cshtml:75,110`).

- 2026-09-15 — **Round 3, Phase 3 FULL verification.** All 4 tasks (BE-014..BE-017) verified against DES-011/DES-012/DES-015/DES-021 and REQ-004/REQ-012/REQ-017: batch + request-time both on `AggregateByCanonicalSubjectWeighted`, `"StddevScore"` population stddev (÷n, MinN=30, NULL-not-0, same-pass TRUNCATE+rewrite), 22/22 PascalCase rename points quoted with zero snake_case remnants, free tier and both aggregation methods unchanged vs their FULL-verified forms, MSBuild exit 0. Closed ISS-02 (mismatch resolved in code; PRE-04 recompute remains devops' deploy prerequisite) and ISS-04 (diagnostic deliberately raw — not in DES-015's caller table, documented in-code). Archived the inline Phase 2 FULL round to `review/phase-2.md` and the BE-003 TARGETED round to `review/phase-1.md`. Added Phase 3 Knowledge-sync rows (BE-014..BE-017 `pending` → `verified`) and Phase 3 Unverified Behaviour.

- 2026-09-02 — **Round 1 (post-restart), Phase 1 FULL verification.** BE-001/BE-002/BE-003 verified against `design.md` rules 0-5 and REQ-012 AC1-AC4.
- 2026-09-15 — **Round 2 (post-restart), Phase 2 FULL verification.** Fixed `Global.asax.cs` CS1061 compile blocker. Verified BE-004 through BE-013 (10 tasks). Confirmed Phase 2 `🔒 Security gate` closed via `security.md` Round 4 and functional gating. Clean MSBuild Rebuild (0 errors). Closed ISS-05, ISS-06, ISS-08.
- 2026-09-15 — **TARGETED round, BE-003 part 2 (Gap Report 0-dp re-round).** ISS-01 fix verified (2-dp `Current`/`Gap`, truthful advice text, all do-not-modify invariants intact, MSBuild exit 0). ISS-01 closed. Added Phase 1 Knowledge-sync row: BE-003 `pending` → `verified`.

