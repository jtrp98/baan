# SB Compass — จับคู่คณะ/หลักสูตรจริง (Faculty Match) — QA Review

> **Workspace**: DEV (`C:\src\sb-web-student`), three-repo mode. Knowledge root
> (`C:\src\schoolbright-knowledge`) is read-only from here — `plan.md` **cannot** be written
> by `qa-engineer` in this role (`role: dev` denies it unconditionally). Task Status changes
> are relayed via `## Knowledge sync — three-repo mode` below for a BA-workspace session to
> apply. That table is a relay of a decision already made here, not a request for a second review.
>
> **Round 1 provenance (recorded 2026-09-15, discovered this round)**: a prior FULL round dated
> 2026-09-14 exists **mislocated** in the DEV repo at
> `C:\src\sb-web-student\_docs\module\sb-compass-faculty-match\review.md` — a local `_docs/`
> path this workspace must never carry. Per three-repo rules it was **not** written or updated;
> it is quoted/attributed here and reported. This file is the module's canonical review record.
> Round 2 scope was Phase 1 only; Round 1's Phases 5/6 verdicts were **not re-verified**.

## Review Outcome

**Status (Round 4, 2026-09-16): ✅ Pass — TARGETED (BE-003 + BE-004). BE-003 verified (static — the first real-DB run stays the `Human gate: schema`). BE-004 tooling verified; the task itself is blocked on the user (AC-001.1 needs ≥3 real KMUTT PDFs — RISK-F02 verdict pending). Phase 2 still open — 🔒 security gate + human migration gate pending.**

**Status (Round 3, 2026-09-15): ✅ Pass — TARGETED (ISS-F01 + ISS-F02 re-verify) + BE-002 verified. Phase 1 closed (Round 2). Phase 2 does NOT close — BE-003/BE-004 unimplemented.**

**Status (Round 2, 2026-09-15): ✅ Pass — Phase 1 only. BE-001 verified; Phase 1 closes.**

Round 2 scope: Phase 1 (Module E — Shared Score Access), single task BE-001. Round 3 scope:
TARGETED re-verify of ISS-F01 + ISS-F02, BE-002 (Phase 2 Module F scaffold), blast radius,
MSBuild gate. The module as a whole
still carries Round 1's open Critical issues and open 🔒 security gates (see Open Issues) —
they are untouched by, and do not gate, Phase 1's closure. Nothing in this module may deploy
until those are resolved; that remains `devops`' gate, not this round's.

---

## Open Issues — all phases

ISS-F01..ISS-F12 are carried **verbatim-in-substance** from the Round 1 record (2026-09-14,
mislocated in DEV local `_docs/`) — not re-verified this round except where a re-check note says
so. Only `security` closes 🔒 items; only the named owner closes the rest.

| ID | Sev | Phase | Issue | Owner | Status |
|---|---|---|---|---|---|
| ISS-F01 | **Critical** | out-of-plan | `/Compass/MyCompass` + `compass-design*.js` ship a **second client-side scoring engine over mock data** wired into the student nav. No plan task authorizes it. **Closed 2026-09-15 (Round 3)** on the user's decision "revert = remove from student navigation" (files stay): the `เข็มทิศของฉัน` nav `<li>` is removed (`_Layout.cshtml` unstaged diff, −8 lines at 627-634); repo-wide sweep finds **zero** student-facing links — only `CompassController.cs:39-41` (route, intentionally retained) and `ClassOnlineWeb.csproj:760` (packaging entry for the retained page) remain. Direct URL `/Compass/MyCompass` stays reachable by decision → residual recorded as ISS-F15. | frontend-engineer | **Closed** (2026-09-15, user-decided remediation, verified this round) |
| ISS-F02 | **Critical** | 5 | `studentLevel` divisor is always `W_LIKERT + W_RANK` even when a format is absent — halves the level, can breach the `[1,5]` floor. **Closed 2026-09-15 (Round 3)**: the defect is NOT in the current tree — `CompassRiasecService.cs:370-386` implements §3.4's conditional divisor exactly (single format → own value; both → weighted/(W+W); neither → excluded); fixed by a prior run (file mtime 2026-09-15 08:36, after Round 1's snapshot); verified independently this round incl. the `[1,5]` invariant end-to-end (`:206` Likert validation → `:340` reverse → `:363` rank conversion → `:370-386` combine). Same read surfaced a separate contract gap → new ISS-F14. | backend-engineer | **Closed** (2026-09-15, verified this round) |
| ISS-F03 | **Critical** | 6 | Module K cannot produce any score: `TryGetCreditPercentile` always `false`; cluster weight tables unseeded; every run resolves to `ScoreBasis = 'none'`. Design gap routed to `system-analyst`. | backend-engineer / system-analyst | **Open** (2026-09-16 note: design side answered — `## DES-022` §1a + §4a; implementation side still open pending the real-DB run that lands 0002's §4a seeds (`Human gate: schema` + devops) and the `sb-compass`-side OQ-F19 option-A amend + implement) |
| ISS-F04 | **Important** | 6 | `ScoreBasis = "none"` written to a column the Data Model declares as `'combined' \| 'academic_only' \| 'interest_only'` — undeclared enum value. | system-analyst | **Open** (not re-verified) |
| ISS-F05 | **Important** | 5 | `PGCompass_*` in `prod.config` + bootstrap DDL target `SB_Compass`, but no code reads it — both services use `PGGradeDBEntities`. `PGCompass_Password` empty. | devops | **Open** (2026-09-16: design v12 hardens PRE-F10 into a hard prerequisite of *every* Compass runtime path incl. `sb-compass` Phases 1-3 — `PGGradeDB` has **no** Compass tables at all, so a runtime without the `PGCompass_*` connection now re-creates Compass tables in the wrong DB silently; finding strengthened, stays with devops) |
| ISS-F06 | **Important** | 5 | `GetLatestRoundAsync` re-derives stored rounds against the **current** question bank, contradicting RIASEC Fit §7. | backend-engineer | **Open** (not re-verified) |
| ISS-F07 | **Important** | 6 | `ScorePercentile_s` estimated via normal-CDF approximation; contract does not authorize a normality assumption. | system-analyst | **Open** (not re-verified) |
| ISS-F08 | **Important** | env | Project did not build: `Global.asax.cs(53,57) CS1061` (`ConcurrentBag<T>.Clear()` on .NET FW 4.8). Re-check 2026-09-15: the call is **gone** (replaced by a `TryTake` drain loop, `Global.asax.cs:45-48`) and VS 2022 MSBuild exits 0 (this round's gate). | backend-engineer / devops | **Closed** (2026-09-15, this round's evidence) |
| ISS-F09 | **Minor** | 6 | `CompassClusterService.GetLatestResult` has no caller — `cluster/results` always recomputes. | backend-engineer | **Open** (not re-verified) |
| ISS-F10 | **Minor** | 5 | Rank-block submit demands a complete permutation even for blocks outside 5..7 active options. | backend-engineer | **Open** (not re-verified) |
| ISS-F11 | **Minor** | 6 | §6.2 vs §6.3 disagree whether `MeanOwn`/`SdOwn`/`GapTop` come from raw `CombinedScore` or the selected `ScoreBasis`. | system-analyst | **Open** (not re-verified) |
| ISS-F12 | Environmental | env | `static-analysis-gate.js` FAIL was confined to a different repository (`schoolbright-backend/MasterEntity`); same class as `sb-compass` ISS-03. Not a defect of this module. | devops | **Open** (environmental; not re-verified) |
| ISS-F13 | **Minor** | process | Round 1's record was written to DEV local `_docs/` (wrong repo) and its `## Knowledge sync` table (24 rows: BE-001, BE-027..BE-036, BE-040..BE-053) was **never applied** — `plan.md` Status cells still read `pending` (verified 2026-09-15). A BA-lane session must apply Round 1's relay table from the mislocated record (verdicts already made; do not re-review) plus this round's table. | project-manager (BA lane) | **Open** |
| ISS-F14 | **Important** | 5 | §3.4/RISK-F18 **mandate** logging which dimension got its value from a single format ("ต้อง log ว่ามิติใดได้ค่ามาจากรูปแบบเดียว" — ipsative-vs-normative visibility, RISK-F18: "สัญญาบังคับให้ log") — **not implemented**: `DimensionLevel` carries `HasLikert`/`HasRank` (`CompassRiasecService.cs:394-395`) but nothing logs them; the service's only Trace call is the block-size warning (`:354`); no consumer of the flags outside the service (repo-wide grep). Surfaced in Round 3 while re-reading the fixed function — Round 1 failed on the divisor itself before reaching this. Found 2026-09-15 (NEW). | backend-engineer | **Open** |
| ISS-F15 | Minor | out-of-plan | ISS-F01 residual — accepted-risk note: direct URL `/Compass/MyCompass` still serves the page (`CompassController.cs:40`; route + files intentionally retained per user decision 2026-09-15 "revert = remove from student navigation, files stay"). A route-level block is **unassigned** — needs an owner ruling (project-manager, with security input) whether to schedule one; deliberately not fixed this round. Found 2026-09-15 (NEW). | project-manager (routing; security input) | **Open** (accepted-risk note) |
| ISS-F16 | Minor | 2 (doc) | `## DES-018`'s ownership table is stale vs the Data Model's 31-table inventory: row 1 (catalog, 24 named) omits `public."TCompassRiasecRankBlock"`/`public."TCompassRiasecRankOption"` (created by BE-003's 0001 as catalog group per the Data Model § seed) and row 2 (student, 4 named) omits `public."TCompassStudentClusterRun"` (group 2 "ผลนักเรียน" per the Data Model; BE-045 owns it). The engineer's placement of all 26+5 tables matched the intent (judged this round), but DES-018 is the module's "most important contract" and should enumerate all 31 so later tasks don't re-derive ownership. Doc amend only — no code change. Found 2026-09-16 (NEW). | system-analyst | **Open** |
| ISS-F17 | Minor | 2 | `curriculum_service/conversion/spike.py:9` points readers to `tests/fixtures/spike-pdfs/README.md` for the fixtures' synthetic-only justification, but the directory contains only the 3 PDFs (whose "SYNTHETIC FIXTURE" banner lives inside the PDF text). Fix the reference or add the README. Found 2026-09-16 (NEW). | backend-engineer | **Open** |

🔒 **Security gates open** — Phases 2, 5, 6, 7, 8 carry 🔒 in `plan.md`; RIASEC/quest/target/
cluster endpoints are reachable without entitlement until Phase 8 wires it (REQ-009). Only
`security` may audit and close these. Carried unchanged from Round 1.

---

## Verification Summary (Round 2 — 2026-09-15, Phase 1 FULL)

Mode: **FULL** for Phase 1 (its only task). Deterministic gate: `.Codex/scripts/static-analysis-gate.js`
does not exist in this DEV repo (this workspace carries no `.Codex/` tooling), so the real build is
the mechanical gate, run interactively as in Round 1.

| Check | Result | Evidence |
|---|---|---|
| VS 2022 MSBuild, `ClassOnlineWeb.csproj`, Debug | **exit 0** | `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -p:Configuration=Debug -clp:ErrorsOnly` from `C:\src\sb-web-student` |
| `GetSubjectAveragesAsync` repo-wide (all file types, excl `.git/bin/obj/packages`) | **0 code hits** | remaining hits are doc/design references only (both modules' `_docs`, sb-compass history docs) |
| `GetCanonicalSubjectAveragesAsync` call sites | definition + exactly 2 callers | `CompassScoreService.cs:282` (definition); `CompassApiController.cs:368`, `:392` |
| Former private definition removed | ✅ | `git show HEAD:…CompassApiController.cs` has it at `:801` (callers `:319`, `:341`); working tree has neither |
| Weighted-sum numerator (`Score100.Value * …Credit`) repo-wide | **exactly 1 site** | `CompassScoreService.cs:259`, inside `AggregateByCanonicalSubjectWeighted` |
| Fallback (`totalCredit == 0 → plain average`) at any caller | **none** | rule lives only at `CompassScoreService.cs:255-260` |
| Shared aggregator vs sb-compass FULL-verified form | ✅ unchanged | `AggregateByCanonicalSubject` at `214-231` and `AggregateByCanonicalSubjectWeighted` at `245-272` match the line ranges and content pinned by `sb-compass/review/phase-1.md:204,222` and re-affirmed by that module's Round 3 (2026-09-15: "unchanged vs their FULL-verified forms") |
| Automated tests | **none exist** | org policy — every verdict below is read-only inspection; see Unverified Behaviour |

### AC-005.2 judgment — "verbatim move" vs the weighted call (explicit reasoning)

The task contract says "ย้ายเนื้อในครบทุกบรรทัด ห้ามเขียนสูตรใหม่". The literal pre-move body at
HEAD (`CompassApiController.cs:801`) called **`AggregateByCanonicalSubject`** (unweighted); the
lifted method calls **`AggregateByCanonicalSubjectWeighted`**. This delta is **not** judged a
formula rewrite, for three reasons, and AC-005.2 is **passed** on intent:

1. **The design contract's own baseline is the weighted form.** This module's `design.md` DES-020
   §1 quotes the code-to-be-moved as already calling `AggregateByCanonicalSubjectWeighted`
   (design.md:1186-1192) and locates the REQ-012 fallback inside it. The contract was written
   against the post-sb-compass tree, not against the stale Aug-3 HEAD.
2. **The unweighted→weighted switch predates this move and is sb-compass's verified work** —
   that module's BE-003 (`sb-compass/plan.md:108-110`, "ห้ามเพิ่ม fallback ที่ caller"),
   verified in `sb-compass/review/phase-1.md:92-93,258`. BE-001's move is byte-faithful against
   that post-switch state: same three-line delegation, same `ToDictionary` projection, only the
   class qualifier dropped (mechanical consequence of moving into the service class) plus
   `private`→`public` and the rename — which is exactly what the task ordered.
3. **The weighted form is the only one that satisfies AC-005.2's intent** — one shared subject-group
   score set with sb-compass (which computes weighted everywhere for Fit/Gap consumers), fallback
   inside the aggregator, no second copy. An unweighted copy would itself have been a second formula.

Verified state: `CompassScoreService.cs:274-287` — `public static async Task<Dictionary<string, double>>
GetCanonicalSubjectAveragesAsync(int schoolId, int sID)`, doc comment naming the move (Module E /
BE-001), body delegating to `GetSubjectScoresAsync` (`:85`, same class) + `AggregateByCanonicalSubjectWeighted`.
Both former call sites (`AI_calculate/path`, `AI_advice/path`) repointed in the same changeset;
no stale reference; no leftover private helper.

### Cross-module status context (not a Phase 1 gate)

- **DEP-F05** (sequence with sb-compass Phase 1 on the same file) — moot: sb-compass Phase 1
  closed 2026-09-15; this move landed after, on the shared post-sb-compass state.
- **DEP-F09** (`"StddevScore"` column, Phases 6/7 runtime dependency): sb-compass Phase 3/BE-014
  **landed** the PascalCase `"StddevScore"` work and was FULL-verified 2026-09-15 (that module's
  Round 3). The column still needs **deploy + the PRE-04 network-wide recompute** to exist in a
  real database — recorded here as status context for Phases 6/7 planning; it does not gate Phase 1.

---

## Verification Summary (Round 3 — 2026-09-15, TARGETED ISS-F01/ISS-F02 + BE-002)

Mode: **TARGETED** — re-checks of the two named Criticals plus their blast radius, BE-002 task
verification, whole-tree `git status` attribution, MSBuild gate. TARGETED precondition satisfied:
Round 2 (FULL) left a file manifest to compare against.

### ISS-F01 — nav removal (user decision 2026-09-15: "revert = remove from student navigation", files stay)

| Check | Result | Evidence |
|---|---|---|
| `เข็มทิศของฉัน` → MyCompass nav `<li>` removed | ✅ | `_Layout.cshtml` unstaged diff = exactly −8 lines at 627-634 (the `<li>` block); nothing else in the file |
| Student-facing link sweep (`MyCompass`, views/assets/controllers, all file types) | **0 links** | only `CompassController.cs:39-41` (route definition, intentionally retained) + `ClassOnlineWeb.csproj:760` (`<Content Include>` packaging entry for the retained page) |
| Thai label sweep (`เข็มทิศ`) | **0 links** | remaining hits are page/controller titles only (`CompassController.cs:43`, `MyCompass.cshtml:3-4`) |
| Page / controller / design assets untouched by this run | ✅ | `Views/Compass/MyCompass.cshtml`, `Controllers/CompassController.cs`, `assets/js/compass-design-data.js`, `compass-design-engine.js`, `assets/css/compass-design.css` — all staged-only, no unstaged changes (mtimes 2026-09-02) |
| Closure judgment | ✅ **Closed** | remediation matches the user's decision verbatim; the reachable direct URL is the decision's accepted outcome → ISS-F15 (accepted-risk/Minor follow-up; route-level block unassigned, owner ruling needed — project-manager + security; deliberately not fixed here) |

### ISS-F02 — §3.4 conditional divisor (defect absent from current tree; fixed by a prior run, mtime 2026-09-15 08:36 — verified independently from the code and the contract, not from the report)

| Check | Result | Evidence (`ClassOnlineWeb/Helper/CompassRiasecService.cs` vs design §3.4, `design.md:1404-1425`) |
|---|---|---|
| Likert-only → own value (never halved) | ✅ | `:383-384` `else if (hasLikert) studentLevel = likertLevel.Value;` |
| Rank-only → own value | ✅ | `:385-386` `else studentLevel = rankLevel.Value;` |
| Both present → `(W_L·L + W_R·R)/(W_L+W_R)` | ✅ | `:381-382` |
| Neither → dimension excluded, not 3 | ✅ | `:370-372` `if (!hasLikert && !hasRank) continue;` |
| Per-format average before cross-format combine | ✅ | `:374-375` nullable per-format averages |
| Named constants, not hardcoded `1` (OQ-F11(ก)) | ✅ | `:32-33` `WLikert = 1.0` / `WRank = 1.0` |
| Rank conversion linear equidistant (OQ-F11(ข)) | ✅ | `:363` `1 + 4.0 * (k - rank) / (k - 1)` — rank 1 → 5.0, last → 1.0 |
| Block guard 5..7, cut + log, never an adapted formula (§3.2) | ✅ | `:351-358` `Trace.TraceWarning` + `continue` |
| Reverse-scored on Likert only, `6 − answer` (§3.3) | ✅ | `:340`; rank options carry no reverse flag |
| Incomplete rank block never contributes | ✅ | `:359` |
| No `[1,5]` violation path | ✅ | Likert answers validated 1..5 at submit (`:206`) → LikertLevel ∈ [1,5]; RankLevel ∈ [1,5] by construction; weighted mean of [1,5] values ∈ [1,5] |
| Single computation site | ✅ | repo-wide grep for `WLikert + WRank`/`W_LIKERT` outside this file: none |
| Verdict | ✅ **Closed** | §3.4 implemented as written. NEW finding from the same read: the §3.4-mandated single-format log is missing → ISS-F14 (does not reopen the divisor fix) |

### BE-002 — Module F scaffold (Phase 2)

| Check | Result | Evidence |
|---|---|---|
| Service-own secret/config mechanism, no `prod.config` coupling | ✅ | `curriculum_service/settings.py:33-64` — pydantic-settings, `CURRICULUM_*` env prefix + optional `.env`; grep for `curriculum` in `prod.config`/`configSource-prod.config`: no matches |
| No pipeline / migration / AI code (later tasks own them) | ✅ | no markitdown dependency in `pyproject.toml` (deliberate — BE-004 spike owns the pinning decision); no DB connection anywhere (`settings.py:50-52` slot only); only routes are `/healthz` + `/readyz` (`api/health.py:18-35`) |
| DES-019 import-order constraints documented, not violated | ✅ | docstrings restate the DES-019 §1 sequence (`curriculum_service/__init__.py`, `main.py:1-10`, `api/__init__.py`); nothing implemented to violate it |
| `.env.example` placeholders only, no real secret | ✅ | `CURRICULUM_DATABASE_URL=postgresql://user:password@localhost:5432/curriculum` (canonical placeholder); `CURRICULUM_GLM_API_KEY=` empty with DO-NOT-SET comment (`:25-30`); no `sk-`/real DSN anywhere; no real `.env` present; service-local `.gitignore` excludes `.env` |
| `/readyz` leaks no secret values | ✅ | presence booleans only (`api/health.py:29-35`) |
| ClassOnlineWeb untouched by this workstream | ✅ | blast radius below — no ClassOnlineWeb change attributable to BE-002 |
| Gate: `uv run ruff check .` | **exit 0** | "All checks passed!" |
| Gate: `uv run mypy` (strict, `files=["curriculum_service"]`) | **exit 0** | "no issues found in 6 source files" |
| Boot evidence | engineer-reported | engineer boot-tested with env + `.env` config; QA did not boot servers this round (static verification + gates only) — see Unverified Behaviour |
| Verdict | ✅ **Verified** | AC-001.1 (ฐานรองรับ) met: skeleton ready as the base for the markitdown conversion step (REQ-001); config loads through the service's own mechanism |

### Blast radius (git status, read-only)

- ISS-F01: `_Layout.cshtml` (unstaged −8) — accounted.
- ISS-F02: `CompassRiasecService.cs` (staged-new, mtime 2026-09-15 08:36) — accounted.
- BE-002: `curriculum-service/` (untracked) — accounted.
- Previously-verified sb-compass work (unstaged, that module's scope): `Analytics.cshtml` + `compass-design.js` copy fixes to the signed `เครือข่าย SchoolBright` wording (`sb-compass/review.md` ISS-09 / C1-C5 rows) and `compass.js` + `compass.css` Table-in-Card restructure (`sb-compass/review/phase-4.md:21,42-43` — FE-001 / OQ-16). Verified there, not here.
- Framework artifact (unstaged): `.gitignore` +12 lines (`sta:gitignore-start` managed block).
- Known legacy: untracked local `_docs/` = the mislocated Round 1 record (ISS-F13, already reported).
- **No unexpected files.**

| Mechanical gate | Result |
|---|---|
| VS 2022 MSBuild 17.14, `ClassOnlineWeb/ClassOnlineWeb.csproj`, `-t:Build -p:Configuration=Debug` | **exit 0** — ISS-F08 stays closed |

---

## Verification Summary (Round 4 — 2026-09-16, TARGETED BE-003 + BE-004)

Mode: **TARGETED** — BE-003/BE-004 task verification against the real files plus blast radius.
TARGETED precondition satisfied: Round 2 (FULL) left a file manifest and Round 3 extended it.
Read against design **Contract Version 12** (2026-09-16 — `PGGradeDB` holds no Compass tables at
all; `SB_Compass` is the only Compass DB) and the Data Model's seed rules (v9) + `## DES-022` §4a.
No automated test suite exists (org policy) — every verdict below is read-only inspection plus the
mechanical gates listed. The migration was **not executed** anywhere this round (human gate; see
Unverified Behaviour).

### BE-003 — first migration + seeds (curriculum-service/)

| Check | Result | Evidence |
|---|---|---|
| 0001 creates exactly the catalog group — 26 tables | ✅ | `db/migrations/0001_create_catalog_tables.sql` — `grep -c "^CREATE TABLE"` = **26** (groups 1 + 1b, `:40-342`); matches the Data Model's 31-table split "กลุ่ม 1 คลังหลักสูตร + กลุ่ม 2 ผลนักเรียน" (design.md:319): 26 catalog + 5 student-result |
| Exclusion of the 5 student-result tables — **scoping judged contract-correct, not a gap** | ✅ | 0001 header `:8-14` documents it. AC-015.1 scopes to "กลุ่มตารางคลัง" only; DES-018 row 2 (`design.md:994`) assigns `TCompassRiasecResult`/`TCompassStudentClusterScore`/`TCompassQuestAttempt`/`TCompassTargetProgram` to ClassOnlineWeb as sole writer with Curriculum Service ห้ามอ่าน; DES-018 กฎ #2 (`:1006-1009`) is the REQ-010 architectural enforcement — a Curriculum Service migration creating student tables would make the service's own credentials their creator. `TCompassTargetProgram` has its own task BE-040 (plan.md:1627, Status already `verified` via Round 1 relay); `TCompassStudentClusterRun` + `TCompassStudentClusterScore` belong to BE-045 (plan.md:1948) |
| Quoting rules (DES-018, "engineer may not get these wrong") | ✅ | every table `public."T<PascalCase>"`, every column `"PascalCase"`, indexes `"IX_…"`/`"UX_…"` — full-file read, incl. inside `ON CONFLICT` targets; `UNIQUE INDEX … WHERE "IsActive"` partial index on RankOption `:235-236` |
| PK/FK shapes per OQ-F17 (closed: `serial`/`integer`) + v9 masters | ✅ | all 7 masters carry `serial "<Name>ID" PK` + code `text NOT NULL UNIQUE` (`:41-42` University, `:52-53` Cluster, `:63-64` FacultyGroup, `:79-80` Dimension, `:263-264` Track, `:273-274` StudyPlan, `:330-331` Career); every FK `integer … REFERENCES …("…ID")`; no `bigserial`/`bigint` anywhere; no `ALTER TABLE` |
| Program-before-Intake creation order | ✅ documented deviation, shapes unchanged | header `:25-27` + comment `:106-107` — Intake's FK targets Program; order follows the bootstrap script's own swap; column sets match the Data Model |
| 0002 masters: plain `INSERT` + `ON CONFLICT(code)`, no PK values | ✅ | `:40-42` (UniversityCode), `:45-52` (DimensionCode), `:55-57` (TrackCode), `:60-72` (ClusterCode), `:75-102` (FacultyGroupCode) |
| 0002 junctions: `INSERT … SELECT … JOIN` code→Id | ✅ | ClusterFacultyGroup `:112-147` (JOIN on ClusterCode/FacultyGroupCode), ClusterSubjectWeight `:154-192`, ClusterRiasecWeight `:196-224` (JOIN on DimensionCode) |
| Zero numeric Id literals in seeds (task AC grep) | ✅ | `grep -E "VALUES\s*\('?[0-9]"` over 0002 → 0 hits; only code strings ('KMUTT', 'C1'…'C11', 'FG01'…'FG26', 'R'…'C', 'upper_secondary') and weights 1-3 appear |
| Seed counts vs claims + Data Model § seed | ✅ | table below |
| §4a weight values — **all 88 + all 66 rows verified value-by-value** (not only the named locked rows) | ✅ | every C1-C11 row of both matrices compared against design.md `## DES-022` §4a tables (`design.md:2014-2042`): 88/88 subject-weight and 66/66 RIASEC-weight cells identical. Locked rows exact: C1 + C9 subject (`0002:158-159,182-183`), C1 + C3 + C10 RIASEC (`0002:200,204,218`). No invented values — 0002 header cites §4a as the sole numeric source; the bootstrap script deliberately refused to guess them (`bootstrap-sb-compass-db.sql:583-587`), so §4a is indeed the first confirmed source |
| Subject strings = the canonical 8 the rest of the system writes/reads | ✅ | 0002 `:150-153` claim verified against `ClassOnlineWeb/Helper/CompassScoreService.cs:305-320` (`MapCanonicalSubject` returns exactly 'คณิตศาสตร์', 'วิทยาศาสตร์', 'ภาษาอังกฤษ', 'ภาษาไทย', 'สังคมศึกษา', 'สุขศึกษาและพลศึกษา', 'ศิลปะ', 'การงานอาชีพและเทคโนโลยี') |
| Masters + 90-row ClusterFacultyGroup mapping identical to the recorded ground truth | ✅ | bootstrap script `:478-533` (University/Dimension/Track/Cluster/FacultyGroup INSERTs) and `:546-573` (90 VALUES rows, FG01-FG26 all present, FG12/FG23 dual-primary, FG17 secondary C1-C10) — pairings identical to 0002 (formatting only differs) |
| Deliberately unseeded tables stay empty | ✅ | 8 INSERT statements total in 0002; `TCompassRiasecQuestion`/`RankBlock`/`RankOption` (uxui-designer review first, Data Model § seed `design.md:938-941`) and `StudyPlan*`/`ProgramSubjectRequirement`/`Career`/`ProgramCareer` (`:942-944`) receive none — matches AC "ระบบต้องยังทำงานได้ปกติเมื่อตารางเนื้อหายังว่าง" |
| migrator.py applied-once semantics + failure behaviour | ✅ | `db/migrator.py` — ledger `public."TServiceMigration"` (`:37-44`, Version UNIQUE); applied versions skipped (`:83-84`); each file + its ledger row in ONE transaction (`:86-88`) on an `autocommit` connection so it is a real BEGIN/COMMIT (`:77-89`) — a failed file rolls back with no ledger row and is retried next run; rollback contract ("never edit applied files, write a new migration") matches BE-003's notes |
| Empty-DSN guard exit 2 | ✅ | `main()` `:96-104` — empty `CURRICULUM_DATABASE_URL` → refusal message naming the human gate, return 2; DSN comes **only** from settings (`:95-96`), no default anywhere |
| Ledger `IF NOT EXISTS` judged acceptable | ✅ | runner docstring `:20-24` — the ledger is the migration mechanism's own bookkeeping (service-internal `TServiceMigration`, not a `TCompass*` catalog table); DES-018 กฎ #4 names this migration path as the legitimate owner of schema change; does not reinstate the banned app-runtime `CREATE TABLE IF NOT EXISTS` pattern |
| settings.py / .env.example amended to SB_Compass facts | ✅ | `settings.py:14-20,53-57` + `.env.example:18-25` now state the v11/v12 facts (target = `SB_Compass`, RISK-F22 closed, wiring = devops PRE-F10/ISS-F05); DSN stays the localhost placeholder; `database_url` default `""`. Nit: `settings.py:54` comment says "IIS-F05" for ISS-F05 (trivial typo, no action) |
| No code path reaches a real host / no secrets | ✅ | sweeps over `*.py`/`*.toml`/`*.sql`/`.env.example`: `10.0.0.` → 0; `9499` → 0; `postgres(ql)://` in .py → 0 (only the `.env.example:25` localhost placeholder); `glm`/`sk-`/`password` → prose references and the placeholder only; no real `.env` present |

Seed-count verification (claims vs file):

| Table | Design/claim | In 0002 | Parity source |
|---|---|---|---|
| `TCompassUniversity` | 1 ('KMUTT') | 1 (`:40-42`) | bootstrap `:478-480` identical |
| `TCompassInterestCluster` | 11 (C1-C11) | 11 (`:60-72`) | bootstrap `:498-510` identical (taxonomy §C) |
| `TCompassFacultyGroup` | 26 (FG01-FG26) | 26 (`:75-102`) | bootstrap `:513-540` identical (taxonomy §A.5/D) |
| `TCompassClusterFacultyGroup` | 90 (26/26 covered) | **90** VALUES tuples (counted; all FG01-FG26 present) | bootstrap `:546-573` identical |
| `TCompassRiasecDimension` | 6 (R/I/A/S/E/C) | 6 (`:45-52`) | bootstrap `:483-490` identical |
| `TCompassEducationTrack` | 1 ('upper_secondary') | 1 (`:55-57`) | bootstrap `:493-495` identical |
| `TCompassClusterSubjectWeight` | 88 (11×8) | **88** VALUES tuples | §4a `design.md:2014-2026` — all rows value-identical |
| `TCompassClusterRiasecWeight` | 66 (11×6) | **66** VALUES tuples | §4a `design.md:2030-2042` — all rows value-identical |
| question/rank/studyplan/requirement/career tables | 0 rows | 0 (no INSERT for them) | Data Model § seed `:938-944` (deliberate) |

### BE-004 — markitdown pin + PDF→Markdown spike (PRE-F08)

| Check | Result | Evidence |
|---|---|---|
| `markitdown[pdf]==0.1.3` pinned | ✅ | `pyproject.toml:12`; `uv.lock` `:439` (`specifier = "==0.1.3"`, extra `pdf`) + `:648-649` (`version = "0.1.3"`) |
| Statuses = DES-019 §2 exactly | ✅ | `conversion/markitdown_converter.py` — 'ok' = converted AND trimmed ≥ 200 (`:77-89`); 'empty' = converted, < 200, never to AI (`:79-88`); 'failed' = raise/broken/not-PDF with note (`:59-75`); matches the §2 table verbatim (`design.md:1095-1099`); `note` maps to `ConversionNote` |
| `MIN_OK_CHARS = 200` documented as the doc's constant, not a local decision | ✅ | `:13-14` quotes DES-019 §2 ("ตัวเลข 200 เป็นค่าที่เอกสารนี้กำหนด" — design.md:1103); constant at `:27` |
| `%PDF-` header guard | ✅ + justified | `:54-64` — 'failed' on missing `%PDF-` header; comment records the observed 0.1.3 behaviour (content-type fallback converts garbage as text, which would leak file bytes into markdown); DES-019 §2 lists "ไม่ใช่ PDF" as a 'failed' condition, so the guard implements the contract rather than adding to it |
| Spike is measurement-only (writes nothing, calls no AI) | ✅ | `conversion/spike.py` — prints per-file status + summary only; BE-004 scope note in `conversion/__init__.py` (no DB writes / no AI calls — those are BE-005+/BE-006+) |
| Spike reproduced by QA on the synthetic fixtures | ✅ | run this round: `kmutt-curriculum-synthetic-blank.pdf` → empty (0 chars), `-broken.pdf` → failed (PSEOF), `-text.pdf` → ok (644 chars); summary `ok=1 empty=1 failed=1`, exit 0 — all three statuses exercised |
| Fixtures are synthetic and honest about it | ✅ | 3 PDFs in `tests/fixtures/spike-pdfs/`, each `%PDF-1.4`, text fixture opens "SYNTHETIC FIXTURE … not a real KMUTT document"; spike.py docstring states synthetic-only pending real PDFs (but see ISS-F17 — the README it cites doesn't exist) |
| AC-001.1 (≥3 real KMUTT files + RISK-F02 verdict) | 🟡 **pending the user** | no real KMUTT PDF exists in this workspace; the AC's measurement cannot be made — task **blocked**, RISK-F02 close-vs-add-OCR verdict honestly pending |

### Gates (Round 4)

| Gate | Result |
|---|---|
| `uv run ruff check .` (from `curriculum-service/`) | **exit 0** — "All checks passed!" |
| `uv run mypy` (strict, `files=["curriculum_service"]`) | **exit 0** — "no issues found in 11 source files" (6 files at BE-002 → 11 now) |
| Spike reproduction on synthetic fixtures | **exit 0** — statuses ok/empty/failed all produced |
| MSBuild `ClassOnlineWeb.csproj` | **not needed** — no .NET source changed this round (below); the only .NET-adjacent diff is comment-only |

### Blast radius (git status, read-only)

Delta since Round 3:

- `curriculum-service/` (untracked) — all BE-003/BE-004 files, accounted above.
- `bootstrap-sb-compass-db.sql` — unstaged diff is **comment-only** (header `:6-14`): replaces "(ของเดิมใน PGGradeDB ไม่ย้าย)" with the v12 user fact — the exact fix design.md v12 itself recommended (design.md:2893-2894). No DDL/seed change; verified via `git diff`.
- Unchanged from Round 3's attribution: the sb-compass FE copy/Table-in-Card unstaged work (`Analytics.cshtml`, `_Layout.cshtml`, `compass.css`, `compass.js`, `compass-design.js` — same sizes), the framework `.gitignore` block, untracked framework/tooling files (`.agent-team/`, `.agents/`, `AGENTS.md`, `contracts/`, `workflows/` ฯลฯ — workspace tooling, not module work product), the mislocated local `_docs/` (ISS-F13), and the whole tree still sitting uncommitted on HEAD `b7747bd`.
- **No unexpected files; no .NET source (.cs/.csproj/.cshtml) changed by this delivery.**

---

## Verified File Manifest (Round 2)

| File | Reviewed |
|---|---|
| `ClassOnlineWeb/Helper/CompassScoreService.cs` | `274-287` (lifted method + doc), `245-272` (weighted aggregator + fallback), `214-231` (free-tier unweighted, unchanged), `85` (`GetSubjectScoresAsync` signature) |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `:368`, `:392` (new call sites, endpoints `AI_calculate/path` / `AI_advice/path`); HEAD `:319`, `:341`, `:801` compared via `git show` |
| Repo-wide greps | `GetSubjectAveragesAsync`, `GetCanonicalSubjectAveragesAsync`, `AggregateByCanonicalSubject*`, `Score100.Value *`, `totalCredit` |
| (cross-reference) `sb-compass/review.md`, `sb-compass/review/phase-1.md` | archived verified forms + BE-003 weighted-switch sanction |

## Verified File Manifest (Round 3)

| File | Reviewed |
|---|---|
| `ClassOnlineWeb/Views/Shared/_Layout.cshtml` | unstaged diff (nav `<li>` removal, 627-634) + surrounding nav block 615-650 |
| `ClassOnlineWeb/Controllers/CompassController.cs` | `:39-43` (retained route + page title) |
| `ClassOnlineWeb/Helper/CompassRiasecService.cs` | `:32-38` (weight/block constants), `:196-240` (submit validation incl. `:206` Likert range), `:324-399` (`ComputeDimensionLevels` in full), `:404-409` (consistency §7.2) |
| `ClassOnlineWeb/Controllers/Api/CompassRiasecController.cs` | `:195-230` (Trace call context — cluster degradation, unrelated to §3.4 logging) |
| `ClassOnlineWeb/ClassOnlineWeb.csproj` | `:760` (packaging entry for retained page — metadata, not a link) |
| `curriculum-service/` (all source files) | `pyproject.toml`, `uv.lock` (presence), `.env.example`, `.gitignore`, `curriculum_service/{__init__,__main__,main,settings}.py`, `curriculum_service/api/{__init__,health}.py` |
| Repo-wide greps | `MyCompass`, `เข็มทิศ`, `WLikert + WRank`/`W_LIKERT`, `HasLikert`/`HasRank` consumers, `glm`/`sk-`/`password`/DSN sweep over `curriculum-service` |
| `git status --porcelain` + unstaged diffs | whole-tree attribution (blast radius above) |

## Verified File Manifest (Round 4)

| File | Reviewed |
|---|---|
| `curriculum-service/curriculum_service/db/migrations/0001_create_catalog_tables.sql` | full file — 26 CREATE TABLE + indexes (`:40-342`), header scope/quoting/order notes (`:1-33`) |
| `curriculum-service/curriculum_service/db/migrations/0002_seed_catalog.sql` | full file — 8 INSERT statements (`:40-224`), all 88+66 §4a cells + 90 mapping rows compared value-by-value |
| `curriculum-service/curriculum_service/db/migrator.py` | full file (`:1-121`) — ledger DDL, applied-once, per-file transaction, empty-DSN guard |
| `curriculum-service/curriculum_service/settings.py` | full file (`:1-70`, amended this round — SB_Compass facts, slots unchanged) |
| `curriculum-service/.env.example` | full file (SB_Compass note `:18-25`, GLM DO-NOT-SET `:27-32`, storage placeholder `:34-38`) |
| `curriculum-service/pyproject.toml` + `uv.lock` | pin `markitdown[pdf]==0.1.3` (`pyproject.toml:12`; `uv.lock:439,648-649`), `psycopg[binary]>=3.2`, ruff/mypy config |
| `curriculum-service/curriculum_service/conversion/markitdown_converter.py` | full file (`:1-96`) vs DES-019 §2 |
| `curriculum-service/curriculum_service/conversion/spike.py` + `conversion/__init__.py` + `db/__init__.py` | full files — measurement-only scope, docstring claims |
| `curriculum-service/tests/fixtures/spike-pdfs/` | 3 synthetic PDFs (headers + text banner); directory listing (no README — ISS-F17) |
| `ClassOnlineWeb/Helper/CompassScoreService.cs` | `:305-320` (`MapCanonicalSubject` canonical strings) |
| `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql` | seed blocks `:477-587` (parity source) + unstaged header diff (comment-only, v12 fix) |
| design.md (Knowledge root, read-only) | v12 Change Log `:2866-2895`, DES-018 `:970-1068`, Data Model § seed `:913-944` + ที่อยู่ table `:317-321`, DES-019 §2 `:1093-1103`, DES-022 §4a `:2000-2042` |
| plan.md (Knowledge root, read-only) | BE-003 `:94-131`, BE-004 `:133-170`, BE-040 `:1627-1664`, BE-045 `:1948-1985` |
| Sweeps | `grep -c "^CREATE TABLE"` (0001)=26; INSERT count (0002)=8; Id-literal grep=0; `10.0.0.`/`9499`/DSN-default/secret sweeps over the service=clean; `git status --porcelain` + `git diff` whole tree |

---

## Per-Task Results

### Phase 1 — Module E — Shared Score Access

| Task | Result | Evidence |
|---|---|---|
| BE-001 — Lift `GetSubjectAveragesAsync` to `CompassScoreService` | ✅ **Verified** | See Verification Summary: AC-005.2 judgment (3 points), caller completeness, single-formula sweep, MSBuild exit 0. `plan.md` says `pending`; the code says otherwise, and the code wins. |

No other Phase 1 tasks exist. Phase 1 closes.

### Phase 2 — Module F — Curriculum Import Service

| Task | Result | Evidence |
|---|---|---|
| BE-002 — Scaffold Curriculum Service (FastAPI) | ✅ **Verified** | Round 3 BE-002 table: service-own config mechanism, zero `prod.config` coupling, no pipeline/migration/AI code, DES-019 constraints documented and unviolated, placeholders-only `.env.example`, `uv run ruff check .` exit 0 + `uv run mypy` (strict) exit 0. Boot test is engineer-reported; QA static-only this round. |
| BE-003 — First migration of catalog tables + seeds | ✅ **Verified** (static) | Round 4 BE-003 table: 26 catalog tables verbatim vs Data Model/DES-018 (quoting, serial/int PKs per OQ-F17, masters code-UNIQUE, FKs integer→Id), §4a weights 88+66 value-exact, seeds identical to the bootstrap ground truth (90-row mapping included), zero Id literals, migrator applied-once + empty-DSN exit 2, ruff + mypy strict exit 0. Exclusion of the 5 student-result tables judged contract-correct (DES-018 row 2 + กฎ #2; BE-040/BE-045 own them) — not a gap. The first real-DB run is untouched: it is the task's `Human gate: schema` (+ devops PRE-F10/ISS-F05 wiring) and is recorded in Unverified Behaviour. |
| BE-004 — markitdown conversion spike (PRE-F08) | 🟡 **Blocked** (tooling verified) | Round 4 BE-004 table: `markitdown[pdf]==0.1.3` pinned (pyproject + lock), converter = DES-019 §2 exact incl. `%PDF-` guard + documented `MIN_OK_CHARS = 200`, spike is measurement-only and was reproduced by QA on the synthetic fixtures (ok=1/empty=1/failed=1, exit 0). AC-001.1's "≥3 real KMUTT files" conversion report cannot be made yet — no real PDF exists in this workspace; blocked on the user. RISK-F02 verdict honestly pending. |

Phase 2 still does not close: the 🔒 security gate and the human migration gate are pending (see Review Outcome).

---

## Unverified Behaviour — undeployed phases

No automated test suite exists (org policy). The Phase 1 evidence above is entirely read-only;
`devops` must put this list in front of a person before any deploy:

- **Phase 1**: `GetCanonicalSubjectAveragesAsync` has never been **executed** — no request has
  run through the repointed `AI_calculate/path` / `AI_advice/path` endpoints against a real
  database since the move. The aggregator's behaviour (incl. the `totalCredit = 0` fallback) is
  sb-compass FULL-verified code, but the new public path itself is read-verified only.
- **Whole tree is uncommitted**: HEAD is still `b7747bd` (2026-08-03); everything this module and
  sb-compass shipped sits as staged working-tree changes. Nothing in any review exists in a commit.
- **Phase 2 / BE-002**: the scaffold has never been **booted by QA** — the start-up + config-load
  evidence is the engineer's report (boot-tested with env + `.env` config); this round verified the
  mechanism by reading it and via ruff/mypy only. The first real boot/migration run (BE-003) must
  re-demonstrate it.
- **Phase 2 / BE-003**: the migration has **never been executed against any database** — 0001/0002
  are verified by reading and by static comparison against `## Data Model`, `## DES-022` §4a and the
  bootstrap ground truth only. The task's own "Required validation" evidence (run on an empty DB,
  compare tables/columns/PK/UNIQUE/FK/index + seed rows, keep the query output) is still outstanding
  and is the `Human gate: schema`; the target (`SB_Compass`) additionally waits on devops wiring
  (PRE-F10 / ISS-F05). Related: the services have never been booted end-to-end against a real DB.
- **Phase 2 / BE-004**: the spike ran on **synthetic fixtures only** (the engineer's run, plus this
  round's QA reproduction — ok=1/empty=1/failed=1). No real KMUTT curriculum PDF exists in this
  workspace yet; AC-001.1's per-file real conversion report and the RISK-F02 close-vs-add-OCR
  verdict stay pending until the user supplies real files.
- **Phase 5** (ISS-F02's formula in the RIASEC endpoints): the fixed `ComputeDimensionLevels` has
  never been **executed** — verdicts on it are read-only code inspection, now including this round's
  §3.4 trace. No automated test suite exists to exercise it.
- **Inherited from Round 1** (mislocated record, not re-verified): every RIASEC formula, the
  rank-permutation/100% gates, the quest state machine, `CheckTargetGateAsync`'s windowed SQL,
  all of Module K (inert until ISS-F03 resolves), all group-2 DDL, and the `PGGradeDB` vs
  `SB_Compass` split (ISS-F05) — read, never executed.

---

## Knowledge sync — three-repo mode

Apply to `C:\src\schoolbright-knowledge\_docs\module\sb-compass-faculty-match\plan.md` from a
BA workspace. **T-LV3 relay — the verdict is already made; do not re-review.**

| Task | Phase | Current | New Status | Reason |
|---|---|---|---|---|
| BE-001 | 1 | pending | **verified** | Lifted to `CompassScoreService.cs:282`; both callers repointed (`:368`, `:392`); AC-005.2 met — verbatim against the post-sb-compass state (DES-020 §1 baseline), weighted call sanctioned by sb-compass BE-003; fallback stays inside `AggregateByCanonicalSubjectWeighted`; no second formula anywhere (repo-wide sweep); MSBuild exit 0 |
| BE-002 | 2 | pending | **verified** | Service-own secret/config mechanism via pydantic-settings (`CURRICULUM_*` + optional `.env`, `settings.py:33-64`); zero `prod.config` coupling; no pipeline/migration/AI code (markitdown deliberately unpinned — BE-004 spike owns it); DES-019 import-order constraints documented and unviolated; `.env.example` placeholders only; `uv run ruff check .` exit 0, `uv run mypy` (strict) exit 0 |
| BE-003 | 2 | pending | **verified** | 0001 = exactly 26 catalog tables (groups 1+1b), quoting verbatim (`public."T<PascalCase>"`, `"PascalCase"`, `"IX_/UX_"`), `serial`/`integer` PKs per OQ-F17, 7 masters with `"<Name>ID" serial` PK + code `text NOT NULL UNIQUE`, all FKs integer→Id; 0002 = masters `INSERT…ON CONFLICT(code)` + junctions `INSERT…SELECT…JOIN` code→Id, zero Id literals (grep); all 88+66 §4a weight rows value-identical to design.md §4a (locked C1/C9 subject + C1/C3/C10 RIASEC rows exact); masters + 90-row ClusterFacultyGroup mapping identical to the bootstrap ground truth (bootstrap-sb-compass-db.sql:478-573); subject strings = `MapCanonicalSubject`'s 8 canonical names; 5 student-result tables correctly excluded (DES-018 row 2 + กฎ #2 — REQ-010 architectural enforcement; BE-040/BE-045 own them); migrator: empty-DSN guard exit 2, per-file transaction with atomic `TServiceMigration` row, applied-once; no real host/DSN/secret anywhere; ruff + mypy strict exit 0. Real-DB run = `Human gate: schema` — recorded in Unverified Behaviour, does not gate this verdict |
| BE-004 | 2 | pending | **blocked** | Tooling verified: `markitdown[pdf]==0.1.3` (pyproject.toml:12 · uv.lock:439,648-649); converter statuses = DES-019 §2 exact incl. `%PDF-` header guard + `MIN_OK_CHARS = 200` documented as the doc's constant; spike is measurement-only and QA reproduced it on the synthetic fixtures (ok=1/empty=1/failed=1, exit 0). AC-001.1 requires ≥3 **real** KMUTT curriculum PDFs — none exist in this workspace; RISK-F02 (close vs add-OCR) verdict honestly pending. Unblock: user supplies real files → re-run spike, attach per-file evidence |

All other tasks stay as they are. **Note for the BA session**: Round 1's mislocated record
(ISS-F13) carries a further 24-row relay table (BE-027..BE-036, BE-040..BE-053 — `verified`/
`blocked` verdicts made 2026-09-14) that was never applied; apply it from that record without
re-reviewing, alongside this row.

---

## Change Log

| Date | Change |
|---|---|
| 2026-09-16 | Round 4 (TARGETED: BE-003 + BE-004, against design Contract Version 12). **BE-003 verified (static)**: 0001 creates exactly the 26 catalog tables quoting-verbatim (serial/int per OQ-F17, masters code-UNIQUE, FKs integer→Id); the engineer's exclusion of the 5 student-result tables judged **contract-correct, not a gap** (DES-018 row 2 + กฎ #2 = REQ-010 architectural enforcement; BE-040/BE-045 own them); 0002 seeds value-identical to the §4a matrices (all 88+66 cells, locked rows exact — no invented values) and to the bootstrap ground truth (90-row ClusterFacultyGroup mapping, 26/26 groups, byte-parity modulo formatting); zero Id literals; migrator: empty-DSN exit 2, per-file transaction with atomic ledger row, applied-once; no real host/DSN/secret anywhere. **BE-004 blocked (tooling verified)**: pin `markitdown[pdf]==0.1.3`, converter = DES-019 §2 exact with `%PDF-` guard + documented `MIN_OK_CHARS=200`, QA reproduced the spike on synthetic fixtures (ok=1/empty=1/failed=1); AC-001.1 awaits ≥3 real KMUTT PDFs from the user — RISK-F02 verdict pending. Gates: ruff exit 0, mypy strict exit 0 (11 files); MSBuild not needed — no .NET source changed (bootstrap header comment-only fix = design v12's own recommendation). New: **ISS-F16** (Minor, system-analyst — DES-018 ownership-table enumeration stale vs the 31-table Data Model: RankBlock/RankOption missing from row 1, StudentClusterRun from row 2), **ISS-F17** (Minor, backend-engineer — spike.py cites a nonexistent fixtures README). ISS-F03 note updated (design answered via §1a/§4a; open pending real-DB run + sb-compass OQ-F19-A), ISS-F05 strengthened by v12/PRE-F10 wording. **Phase 2 still open — 🔒 security gate + human migration gate pending.** |
| 2026-09-15 | Round 3 (TARGETED: ISS-F01 + ISS-F02 re-verify + BE-002 task verification). **ISS-F01 closed** on the user's 2026-09-15 decision ("revert = remove from student navigation", files stay): nav `<li>` gone (`_Layout.cshtml` 627-634, −8 lines), zero student-facing links remain (sweeps `MyCompass` + `เข็มทิศ`), page/controller/design assets untouched; direct-URL residual recorded as ISS-F15 (accepted-risk, owner ruling needed). **ISS-F02 closed**: §3.4 conditional divisor verified independently in the current tree (`CompassRiasecService.cs:370-386`; fixed by a prior run, mtime 08:36), `[1,5]` invariant traced end-to-end; new **ISS-F14** (Important) opened — the §3.4/RISK-F18-mandated single-format log was never implemented. **BE-002 verified**: service-own config mechanism, no `prod.config` coupling, placeholders-only `.env.example`, ruff + mypy strict exit 0 (boot evidence engineer-reported). Blast radius clean — remaining unstaged diffs attributed to sb-compass's verified FE-001/ISS-09 copy+Table-in-Card work and the framework `.gitignore` block. MSBuild exit 0 (ISS-F08 stays closed). **Phase 2 does NOT close — BE-003/BE-004 unimplemented.** Remaining open Critical: ISS-F03. |
| 2026-09-15 | Round 2 (first round recorded in the Knowledge repo; establishing this file). FULL verification of Phase 1 (BE-001) only: lifted method verified against DES-020/DEC-020, AC-005.2 passed on intent with explicit reasoning (weighted call = sb-compass BE-003's verified redesign, design baseline is the weighted form), caller completeness + single-formula + no-fallback-at-caller sweeps clean, MSBuild exit 0. Discovered Round 1 (2026-09-14, ❌ Failed, whole-tree scope) mislocated in DEV local `_docs/` — reported per three-repo rules, its 12 issues carried into Open Issues (ISS-F08 closed this round with fresh evidence; ISS-F13 opened for the unapplied sync relay). Phase 1 closes; module-wide deploy remains blocked by Round 1's Criticals and 🔒 gates. |
