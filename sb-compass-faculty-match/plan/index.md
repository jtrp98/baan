# sb-compass-faculty-match — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-001, BE-002, BE-003, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012, BE-013, BE-014, BE-015, BE-016, BE-017, BE-018, BE-019, FE-001, FE-002, FE-003, BE-020, BE-021, FE-004, FE-005, BE-027, BE-028, BE-029, BE-504, BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, BE-036, FE-007, FE-008, FE-009, FE-010, BE-040, BE-041, BE-042, BE-043, BE-044, FE-011, BE-054, FE-013, BE-045, BE-046, BE-047, BE-048, BE-049, BE-050, BE-051, BE-052, BE-053, FE-012, BE-022, BE-023, BE-024, BE-025, BE-026, FE-006, BE-037, BE-038, BE-039
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Module E — Shared Score Access | BE-001 | — |
| 2 | Module F — Curriculum Import Service (REQ-001, REQ-002, REQ-004) 🔒 Security gate | BE-002, BE-003, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012 | 🔒 security gate |
| 3 | Module G — Review & Approval Console (REQ-003, REQ-004) 🔒 Security gate | BE-013, BE-014, BE-015, BE-016, BE-017, BE-018, BE-019, FE-001, FE-002, FE-003 | 🔒 security gate |
| 4 | Module I-a — RIASEC Content Authoring (REQ-007, REQ-008 ฝั่งคลังข้อมูล) | BE-020, BE-021, FE-004, FE-005 | — |
| 5 | Module I-b — RIASEC Test & Quest, ฝั่งนักเรียน (REQ-007, REQ-008, REQ-012, REQ-017, REQ-018) 🔒 Security gate | BE-027, BE-028, BE-029, BE-504, BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, BE-036, FE-007, FE-008, FE-009, FE-010, BE-040, BE-041, BE-042, BE-043, BE-044, FE-011, BE-054, FE-013 | 🔒 security gate |
| 6 | Module K — Cluster Determination, T-Score + RIASEC (REQ-011, REQ-013) 🔒 Security gate | BE-045, BE-046, BE-047, BE-048, BE-049, BE-050, BE-051, BE-052, BE-053, FE-012 | 🔒 security gate |
| 7 | Module H — Program Matching & Top-10 (REQ-005, REQ-006, REQ-011) 🔒 Security gate | BE-022, BE-023, BE-024, BE-025, BE-026, FE-006 | 🔒 security gate |
| 8 | Module H + I-b — Entitlement Wiring & Ownership Audit (cross-module) 🔒 Security gate | BE-037, BE-038, BE-039 | 🔒 security gate |

## Tasks

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-001 | Lift GetSubjectAveragesAsync to CompassScoreService | backend-engineer | 1 | — | verified |
| BE-002 | Scaffold Curriculum Service (FastAPI) | backend-engineer | 2 | — | verified |
| BE-003 | First migration of catalog tables + seeds | backend-engineer | 2 | BE-002 | verified |
| BE-004 | markitdown conversion spike (PRE-F08) | backend-engineer | 2 | — | blocked |
| BE-005 | PDF upload endpoint with sha256 dedup | backend-engineer | 2 | BE-003 | pending |
| BE-006 | markitdown conversion pipeline (sandboxed) | backend-engineer | 2 | BE-004, BE-005 | pending |
| BE-007 | Split document per program before AI | backend-engineer | 2 | BE-006 | pending |
| BE-008 | glm-5.2 integration with secret-store key | backend-engineer | 2 | BE-007 | pending |
| BE-009 | Exact-match validation of AI output | backend-engineer | 2 | BE-008 | pending |
| BE-010 | Deterministic multi-chunk merge | backend-engineer | 2 | BE-009 | pending |
| BE-011 | dedup_key + intake write | backend-engineer | 2 | BE-009 | pending |
| BE-012 | AI-failure intake path (ai_incomplete) | backend-engineer | 2 | BE-008 | pending |
| BE-013 | Staff auth middleware | backend-engineer | 3 | — | pending |
| BE-014 | Review queue endpoints | backend-engineer | 3 | BE-013 | pending |
| BE-015 | Edit AI results endpoint | backend-engineer | 3 | BE-013 | pending |
| BE-016 | Resolution endpoint (new/replace/discard) | backend-engineer | 3 | BE-013, BE-011 | pending |
| BE-017 | Approval endpoint with 6 server-side conditions | backend-engineer | 3 | BE-013, BE-015 | pending |
| BE-018 | Replace-path data swap transaction | backend-engineer | 3 | BE-017 | pending |
| BE-019 | Retire program endpoint | backend-engineer | 3 | BE-013 | pending |
| FE-001 | Review queue screens | frontend-engineer | 3 | BE-014 | pending |
| FE-002 | AI-result edit screen | frontend-engineer | 3 | BE-015 | pending |
| FE-003 | Resolution + approval console screen | frontend-engineer | 3 | BE-016, BE-017 | pending |
| BE-020 | RIASEC question bank CRUD | backend-engineer | 4 | BE-013 | pending |
| BE-021 | Quest bank CRUD + state machine | backend-engineer | 4 | BE-013 | pending |
| FE-004 | Question bank screen | frontend-engineer | 4 | BE-020 | pending |
| FE-005 | Quest bank screen | frontend-engineer | 4 | BE-021 | pending |
| BE-027 | Read active RIASEC questions endpoint | backend-engineer | 5 | — | verified |
| BE-028 | Submit answers endpoint (100% complete) | backend-engineer | 5 | BE-027 | verified |
| BE-029 | studentLevel mixed Likert+ranking formula | backend-engineer | 5 | BE-028 | blocked |
| BE-504 | ConsistencyScore column + calculation | backend-engineer | 5 | BE-029 | verified |
| BE-030 | RIASEC match percent formula | backend-engineer | 5 | BE-029 | blocked |
| BE-031 | Incompatibility points + alternatives | backend-engineer | 5 | BE-030 | blocked |
| BE-032 | Guided wording enforcement | backend-engineer | 5 | BE-031 | verified |
| BE-033 | Quest suggestion endpoint | backend-engineer | 5 | BE-031 | verified |
| BE-034 | Quest attempt endpoint | backend-engineer | 5 | BE-033 | verified |
| BE-035 | Profile-only mode (no program) | backend-engineer | 5 | BE-029 | verified |
| BE-036 | Module I-b ownership/IDOR enforcement | backend-engineer | 5 | BE-028, BE-034 | blocked |
| FE-007 | RIASEC test screen (round 2) | frontend-engineer | 5 | BE-028 | pending |
| FE-008 | RIASEC results screen | frontend-engineer | 5 | BE-030, BE-031, BE-032 | pending |
| FE-009 | Quest screen | frontend-engineer | 5 | BE-033, BE-034 | pending |
| FE-010 | Profile-only screen | frontend-engineer | 5 | BE-035 | pending |
| BE-040 | TCompassTargetProgram migration | backend-engineer | 5 | — | verified |
| BE-041 | CanSetAsTarget gate | backend-engineer | 5 | BE-040 | verified |
| BE-042 | Set-target endpoint | backend-engineer | 5 | BE-041 | verified |
| BE-043 | Supersede-target endpoint | backend-engineer | 5 | BE-041 | verified |
| BE-044 | Target Major Rules ownership enforcement | backend-engineer | 5 | BE-042, BE-043, BE-036 | blocked |
| FE-011 | Set-as-target button | frontend-engineer | 5 | BE-042 | pending |
| BE-054 | Development Plan calculation & recommendations | backend-engineer | 5 | BE-042 | pending |
| FE-013 | Development Plan screen (tab=gap in MyCompass) | frontend-engineer | 5 | BE-054, FE-011 | pending |
| BE-045 | Cluster run/score tables migration | backend-engineer | 6 | BE-003 | verified |
| BE-046 | Cluster weight seeds | backend-engineer | 6 | BE-045 | pending |
| BE-047 | T-Score per subject group | backend-engineer | 6 | BE-001 | blocked |
| BE-048 | StddevScore fallback rules | backend-engineer | 6 | BE-047 | verified |
| BE-049 | Cluster combined score formula | backend-engineer | 6 | BE-048, BE-046, BE-029 | blocked |
| BE-050 | ClarityIndex/ClarityBand | backend-engineer | 6 | BE-049 | verified |
| BE-051 | Confidence shrinkage + DisplayScore | backend-engineer | 6 | BE-050 | blocked |
| BE-052 | Read cluster results endpoint | backend-engineer | 6 | BE-051 | blocked |
| BE-053 | Module K ownership enforcement | backend-engineer | 6 | BE-052 | blocked |
| FE-012 | Cluster results screen | frontend-engineer | 6 | BE-052 | pending |
| BE-022 | First-filter endpoint (Module K results) | backend-engineer | 7 | BE-001, BE-052 | pending |
| BE-023 | Program match percent (TARGET_SCORE) | backend-engineer | 7 | BE-022 | pending |
| BE-024 | Module H edge cases | backend-engineer | 7 | BE-023 | pending |
| BE-025 | Per-program advice | backend-engineer | 7 | BE-023 | pending |
| BE-026 | Module H identity enforcement | backend-engineer | 7 | BE-022 | pending |
| FE-006 | Top-10 screen | frontend-engineer | 7 | BE-024, BE-025 | pending |
| BE-037 | Premium entitlement wiring (Module H) | backend-engineer | 8 | BE-022 | pending |
| BE-038 | Premium entitlement wiring (Module I-b) | backend-engineer | 8 | BE-027, BE-041 | pending |
| BE-039 | Final identity/entitlement audit | backend-engineer | 8 | BE-037, BE-038, BE-044 | pending |

## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
