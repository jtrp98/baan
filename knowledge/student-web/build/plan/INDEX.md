# แผน student-web

แผนเดียวของ project; Task ID และ Depends ใช้คู่กับ module ในแถวเดียวกันเพื่อแยก ID เดิมที่ซ้ำกัน รายละเอียดขอบเขตและประวัติเดิม:

- [sb-compass](sb-compass--index.md)
- [sb-compass-faculty-match](sb-compass-faculty-match--index.md)

## Tasks

| module | Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|---|
| student-web/sb-compass | BE-001 | Add AggregateByCanonicalSubjectWeighted to CompassScoreService | backend-engineer | 1 | — | verified |
| student-web/sb-compass | BE-002 | Switch calculate/score to the weighted method with 2-decimal rounding | backend-engineer | 1 | BE-001 | verified |
| student-web/sb-compass | BE-003 | Switch GetSubjectAveragesAsync to the weighted method and preserve 2-decimal rounding in Gap Report (ISS-01) | backend-engineer | 1 | BE-001 | verified |
| student-web/sb-compass | BE-013 | Verify SB PLUS column names for TSubscription and TPlan_Feature (PRE-05) | backend-engineer | 2 | — | verified |
| student-web/sb-compass | BE-004 | Implement CheckEntitlement steps 1-3 (fail-closed, parameterized SQL) | backend-engineer | 2 | BE-013 | verified |
| student-web/sb-compass | BE-005 | Gate Premium endpoints with compass_premium (HTTP 403, Data = null) | backend-engineer | 2 | BE-004 | verified |
| student-web/sb-compass | BE-006 | Field-level gating at analyst/{sID}: Boost null without entitlement | backend-engineer | 2 | BE-004 | verified |
| student-web/sb-compass | BE-007 | Gate recompute/* with compass_admin_ops entitlement | backend-engineer | 2 | BE-004 | verified |
| student-web/sb-compass | BE-008 | IP/internal-network allowlist in front of recompute/* | backend-engineer | 2 | — | verified |
| student-web/sb-compass | BE-009 | AI_exercise/path: identity from JWT only | backend-engineer | 2 | — | verified |
| student-web/sb-compass | BE-010 | AI_exercise/submit: identity from JWT only | backend-engineer | 2 | — | verified |
| student-web/sb-compass | BE-011 | certificate/issue: identity-only fix | backend-engineer | 2 | — | verified |
| student-web/sb-compass | BE-012 | Gate the three debug endpoints with compass_admin_ops | backend-engineer | 2 | BE-004 | verified |
| student-web/sb-compass | BE-014 | Batch recompute: weighted scores + StddevScore + PascalCase rename | backend-engineer | 3 | BE-001 | verified |
| student-web/sb-compass | BE-015 | RecomputeAsync OverallAvg from already-weighted values | backend-engineer | 3 | BE-014 | verified |
| student-web/sb-compass | BE-016 | RecomputeAsync MeanScore per level x subject from weighted values | backend-engineer | 3 | BE-014 | verified |
| student-web/sb-compass | BE-017 | GetStudentNationalStatsAsync: request-time overall matches batch formula | backend-engineer | 3 | BE-001 | verified |
| student-web/sb-compass | BE-018 | Add VMCourseBreakdown and VMSubjectStat.Courses | backend-engineer | 4 | BE-001 | verified |
| student-web/sb-compass | BE-019 | Assemble Courses in calculate/score after the premium check | backend-engineer | 4 | BE-018, BE-005 | verified |
| student-web/sb-compass | FE-001 | Premium subject-breakdown screen reading Courses | frontend-engineer | 4 | BE-019 | verified |
| student-web/sb-compass | FE-002 | Fix WORD-01-violating wording in the MyCompass mockup | frontend-engineer | 5 | — | verified |
| student-web/sb-compass-faculty-match | BE-001 | Lift GetSubjectAveragesAsync to CompassScoreService | backend-engineer | 1 | — | verified |
| student-web/sb-compass-faculty-match | BE-002 | Scaffold Curriculum Service (FastAPI) | backend-engineer | 2 | — | verified |
| student-web/sb-compass-faculty-match | BE-003 | First migration of catalog tables + seeds | backend-engineer | 2 | BE-002 | verified |
| student-web/sb-compass-faculty-match | BE-004 | markitdown conversion spike (PRE-F08) | backend-engineer | 2 | — | blocked |
| student-web/sb-compass-faculty-match | BE-005 | PDF upload endpoint with sha256 dedup | backend-engineer | 2 | BE-003 | pending |
| student-web/sb-compass-faculty-match | BE-006 | markitdown conversion pipeline (sandboxed) | backend-engineer | 2 | BE-004, BE-005 | pending |
| student-web/sb-compass-faculty-match | BE-007 | Split document per program before AI | backend-engineer | 2 | BE-006 | pending |
| student-web/sb-compass-faculty-match | BE-008 | glm-5.2 integration with secret-store key | backend-engineer | 2 | BE-007 | pending |
| student-web/sb-compass-faculty-match | BE-009 | Exact-match validation of AI output | backend-engineer | 2 | BE-008 | pending |
| student-web/sb-compass-faculty-match | BE-010 | Deterministic multi-chunk merge | backend-engineer | 2 | BE-009 | pending |
| student-web/sb-compass-faculty-match | BE-011 | dedup_key + intake write | backend-engineer | 2 | BE-009 | pending |
| student-web/sb-compass-faculty-match | BE-012 | AI-failure intake path (ai_incomplete) | backend-engineer | 2 | BE-008 | pending |
| student-web/sb-compass-faculty-match | BE-013 | Staff auth middleware | backend-engineer | 3 | — | pending |
| student-web/sb-compass-faculty-match | BE-014 | Review queue endpoints | backend-engineer | 3 | BE-013 | pending |
| student-web/sb-compass-faculty-match | BE-015 | Edit AI results endpoint | backend-engineer | 3 | BE-013 | pending |
| student-web/sb-compass-faculty-match | BE-016 | Resolution endpoint (new/replace/discard) | backend-engineer | 3 | BE-013, BE-011 | pending |
| student-web/sb-compass-faculty-match | BE-017 | Approval endpoint with 6 server-side conditions | backend-engineer | 3 | BE-013, BE-015 | pending |
| student-web/sb-compass-faculty-match | BE-018 | Replace-path data swap transaction | backend-engineer | 3 | BE-017 | pending |
| student-web/sb-compass-faculty-match | BE-019 | Retire program endpoint | backend-engineer | 3 | BE-013 | pending |
| student-web/sb-compass-faculty-match | FE-001 | Review queue screens | frontend-engineer | 3 | BE-014 | pending |
| student-web/sb-compass-faculty-match | FE-002 | AI-result edit screen | frontend-engineer | 3 | BE-015 | pending |
| student-web/sb-compass-faculty-match | FE-003 | Resolution + approval console screen | frontend-engineer | 3 | BE-016, BE-017 | pending |
| student-web/sb-compass-faculty-match | BE-020 | RIASEC question bank CRUD | backend-engineer | 4 | BE-013 | pending |
| student-web/sb-compass-faculty-match | BE-021 | Quest bank CRUD + state machine | backend-engineer | 4 | BE-013 | pending |
| student-web/sb-compass-faculty-match | FE-004 | Question bank screen | frontend-engineer | 4 | BE-020 | pending |
| student-web/sb-compass-faculty-match | FE-005 | Quest bank screen | frontend-engineer | 4 | BE-021 | pending |
| student-web/sb-compass-faculty-match | BE-027 | Read active RIASEC questions endpoint | backend-engineer | 5 | — | verified |
| student-web/sb-compass-faculty-match | BE-028 | Submit answers endpoint (100% complete) | backend-engineer | 5 | BE-027 | verified |
| student-web/sb-compass-faculty-match | BE-029 | studentLevel mixed Likert+ranking formula | backend-engineer | 5 | BE-028 | blocked |
| student-web/sb-compass-faculty-match | BE-504 | ConsistencyScore column + calculation | backend-engineer | 5 | BE-029 | verified |
| student-web/sb-compass-faculty-match | BE-030 | RIASEC match percent formula | backend-engineer | 5 | BE-029 | blocked |
| student-web/sb-compass-faculty-match | BE-031 | Incompatibility points + alternatives | backend-engineer | 5 | BE-030 | blocked |
| student-web/sb-compass-faculty-match | BE-032 | Guided wording enforcement | backend-engineer | 5 | BE-031 | verified |
| student-web/sb-compass-faculty-match | BE-033 | Quest suggestion endpoint | backend-engineer | 5 | BE-031 | verified |
| student-web/sb-compass-faculty-match | BE-034 | Quest attempt endpoint | backend-engineer | 5 | BE-033 | verified |
| student-web/sb-compass-faculty-match | BE-035 | Profile-only mode (no program) | backend-engineer | 5 | BE-029 | verified |
| student-web/sb-compass-faculty-match | BE-036 | Module I-b ownership/IDOR enforcement | backend-engineer | 5 | BE-028, BE-034 | blocked |
| student-web/sb-compass-faculty-match | FE-007 | RIASEC test screen (round 2) | frontend-engineer | 5 | BE-028 | pending |
| student-web/sb-compass-faculty-match | FE-008 | RIASEC results screen | frontend-engineer | 5 | BE-030, BE-031, BE-032 | pending |
| student-web/sb-compass-faculty-match | FE-009 | Quest screen | frontend-engineer | 5 | BE-033, BE-034 | pending |
| student-web/sb-compass-faculty-match | FE-010 | Profile-only screen | frontend-engineer | 5 | BE-035 | pending |
| student-web/sb-compass-faculty-match | BE-040 | TCompassTargetProgram migration | backend-engineer | 5 | — | verified |
| student-web/sb-compass-faculty-match | BE-041 | CanSetAsTarget gate | backend-engineer | 5 | BE-040 | verified |
| student-web/sb-compass-faculty-match | BE-042 | Set-target endpoint | backend-engineer | 5 | BE-041 | verified |
| student-web/sb-compass-faculty-match | BE-043 | Supersede-target endpoint | backend-engineer | 5 | BE-041 | verified |
| student-web/sb-compass-faculty-match | BE-044 | Target Major Rules ownership enforcement | backend-engineer | 5 | BE-042, BE-043, BE-036 | blocked |
| student-web/sb-compass-faculty-match | FE-011 | Set-as-target button | frontend-engineer | 5 | BE-042 | pending |
| student-web/sb-compass-faculty-match | BE-054 | Development Plan calculation & recommendations | backend-engineer | 5 | BE-042 | pending |
| student-web/sb-compass-faculty-match | FE-013 | Development Plan screen (tab=gap in MyCompass) | frontend-engineer | 5 | BE-054, FE-011 | pending |
| student-web/sb-compass-faculty-match | BE-045 | Cluster run/score tables migration | backend-engineer | 6 | BE-003 | verified |
| student-web/sb-compass-faculty-match | BE-046 | Cluster weight seeds | backend-engineer | 6 | BE-045 | pending |
| student-web/sb-compass-faculty-match | BE-047 | T-Score per subject group | backend-engineer | 6 | BE-001 | blocked |
| student-web/sb-compass-faculty-match | BE-048 | StddevScore fallback rules | backend-engineer | 6 | BE-047 | verified |
| student-web/sb-compass-faculty-match | BE-049 | Cluster combined score formula | backend-engineer | 6 | BE-048, BE-046, BE-029 | blocked |
| student-web/sb-compass-faculty-match | BE-050 | ClarityIndex/ClarityBand | backend-engineer | 6 | BE-049 | verified |
| student-web/sb-compass-faculty-match | BE-051 | Confidence shrinkage + DisplayScore | backend-engineer | 6 | BE-050 | blocked |
| student-web/sb-compass-faculty-match | BE-052 | Read cluster results endpoint | backend-engineer | 6 | BE-051 | blocked |
| student-web/sb-compass-faculty-match | BE-053 | Module K ownership enforcement | backend-engineer | 6 | BE-052 | blocked |
| student-web/sb-compass-faculty-match | FE-012 | Cluster results screen | frontend-engineer | 6 | BE-052 | pending |
| student-web/sb-compass-faculty-match | BE-022 | First-filter endpoint (Module K results) | backend-engineer | 7 | BE-001, BE-052 | pending |
| student-web/sb-compass-faculty-match | BE-023 | Program match percent (TARGET_SCORE) | backend-engineer | 7 | BE-022 | pending |
| student-web/sb-compass-faculty-match | BE-024 | Module H edge cases | backend-engineer | 7 | BE-023 | pending |
| student-web/sb-compass-faculty-match | BE-025 | Per-program advice | backend-engineer | 7 | BE-023 | pending |
| student-web/sb-compass-faculty-match | BE-026 | Module H identity enforcement | backend-engineer | 7 | BE-022 | pending |
| student-web/sb-compass-faculty-match | FE-006 | Top-10 screen | frontend-engineer | 7 | BE-024, BE-025 | pending |
| student-web/sb-compass-faculty-match | BE-037 | Premium entitlement wiring (Module H) | backend-engineer | 8 | BE-022 | pending |
| student-web/sb-compass-faculty-match | BE-038 | Premium entitlement wiring (Module I-b) | backend-engineer | 8 | BE-027, BE-041 | pending |
| student-web/sb-compass-faculty-match | BE-039 | Final identity/entitlement audit | backend-engineer | 8 | BE-037, BE-038, BE-044 | pending |
