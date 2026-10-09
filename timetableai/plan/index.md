# timetableai — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-003, FE-002, FE-005, FE-003, FE-004, BE-004, FE-006, BE-001, BE-002, FE-001, BE-005, FE-007, FE-008, FE-009, BE-006, BE-007, BE-008, BE-009, FE-017, FE-010, FE-011, FE-012, FE-013, FE-014, FE-015, FE-016, FE-018, FE-019, FE-020, UX-007, BE-010, FE-021, UX-008, BE-011, FE-022, UX-009, FE-023, UX-010, BE-012, FE-024, UX-011, BE-013, FE-025, UX-012, FE-026, UX-013, BE-014, FE-027
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Module B — Generate Results: Course Intensity (DES-019) + Shortfall Report (DES-020) | BE-003, FE-002, FE-005, FE-003, FE-004 | — |
| 2 | Module H — Legacy Removal, Code Only (DES-021) | BE-004, FE-006 | — |
| 3 | Module G — API Authentication + Authorization (REQ-021, DES-018) 🔒 Security gate | BE-001, BE-002, FE-001 | 🔒 security gate |
| 4 | Module B — BR-77 Raw-Thai Group Matching, Shared T_c, Recommendations, Manual-Edit Warning Data (DES-019 Rev 11/13) | BE-005, FE-007, FE-008, FE-009 | — |
| 5 | Module G — Sidebar Menu Permission Source (DES-022) 🔒 Security gate | BE-006, BE-007, BE-008, BE-009, FE-017, FE-010 | 🔒 security gate |
| 6 | UI on Signed UX Artifacts (UX-001..UX-004, UX-006) 🔒 Security gate | FE-011, FE-012, FE-013, FE-014, FE-015, FE-016 | 🔒 security gate |
| 7 | Module G — Frontend Request-Failure Rules (DES-018 §43.2b, SA-Q19 = A) + Request Hygiene 🔒 Security gate | FE-018, FE-019, FE-020 | 🔒 security gate |
| 8 | REQ-012 — Term Dimension (DES-009) 🔒 Security gate | UX-007, BE-010, FE-021 | 🔒 security gate |
| 9 | REQ-013 — Copy Across Term/Year (DES-010) 🔒 Security gate | UX-008, BE-011, FE-022 | 🔒 security gate |
| 10 | REQ-015 — Class Continuity + Subject Groups as hard constraints (DES-012, DES-017) | UX-009, FE-023 | — |
| 11 | REQ-016 — Subject Rooms, Capacity, Cross-/academic Usage (DES-013) 🔒 Security gate | UX-010, BE-012, FE-024 | 🔒 security gate |
| 12 | REQ-017 + REQ-018 + REQ-014 — Teaching Caps (Hours), Homeroom Restriction, Generate Precheck (DES-014, DES-015, DES-011) 🔒 Security gate | UX-011, BE-013, FE-025, UX-012, FE-026 | 🔒 security gate |
| 13 | REQ-019 — Push Timetable to `/academic` (DES-016) 🔒 Security gate | UX-013, BE-014, FE-027 | 🔒 security gate |

## Tasks

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-003 | `Tbl_Timetable.nCourseIntensity` in model + `Timetable/Set/Get/GetAllByYear` | backend-engineer | 1 | — | verified |
| FE-002 | Heavy/light course classification (BR-77) — group matching corrected by FE-007 | frontend-engineer | 1 | — | verified |
| FE-005 | Shortfall report data after Generate (DES-020) | frontend-engineer | 1 | — | verified |
| FE-003 | Solver soft intensity goal (BR-78..BR-80) | frontend-engineer | 1 | BE-003, FE-002, FE-005 | verified |
| FE-004 | Per-timetable intensity summary data (BR-81 counts; recommendations added by FE-008) | frontend-engineer | 1 | BE-003, FE-002 | verified |
| BE-004 | Remove legacy `Schedule*` endpoints and models from backend | backend-engineer | 2 | — | verified |
| FE-006 | Remove legacy `schedule(s)` proxy routes from frontend | frontend-engineer | 2 | — | verified |
| BE-001 | Bearer JWT authentication scheme + global fallback policy + tenant binding | backend-engineer | 3 | — | verified |
| BE-002 | Per-page MenuID authorization policy (P2 server-side lookup) | backend-engineer | 3 | BE-001 | verified |
| FE-001 | Bearer coverage on every timetable call + 401/403 handling | frontend-engineer | 3 | BE-001, BE-002 | verified |
| BE-005 | Additive `sCourseGroupDescTh` on `GetSubjectsByPlan` (BR-77) | backend-engineer | 4 | — | verified |
| FE-007 | Fix BR-77 group matching (raw Thai `sCourseGroupDescTh`, no `sCourseTypeDesc` fallback) + FE-002 re-verification | frontend-engineer | 4 | BE-005, FE-002 | verified |
| FE-008 | Single T_c function + single D_c counter (BR-81a/BR-81b) shared by solver, warning and summary + `lstRecommendations` (BR-81) | frontend-engineer | 4 | FE-003, FE-004 | verified |
| FE-009 | Manual-edit non-blocking intensity warning data (BR-80, no UI) | frontend-engineer | 4 | FE-008 | verified |
| BE-006 | Extract shared menu-permission resolver from `TimetableAuthorizationFilter` (BR-74..BR-76, no behavior change) | backend-engineer | 5 | BE-002 | verified |
| BE-007 | `GET WebAPI/MenuPermissions/Get` with authenticated-only policy (DES-022 BR-88, the single BR-74 exception) | backend-engineer | 5 | BE-006 | verified |
| BE-008 | School found, active and not deleted check on the regular-user path of the shared resolver (DES-018 BR-74 (ข), SA-Q20, OQ-41 = A) + tests for BR-74 (ข) / BR-76 (ก) | backend-engineer | 5 | BE-006, BE-007 | verified |
| BE-009 | Resolver hardening: identity-keyed per-request cache (RV-1) + real-resolver integration coverage (RV-4) | backend-engineer | 5 | BE-008 | verified |
| FE-017 | Additive session-expired opt-out on `timetableFetch` (DES-022 BR-89, FE-001 wrapper) | frontend-engineer | 5 | FE-001 | verified |
| FE-010 | `MenuPermissions/Get` proxy + `useTimetableMenuPermissions` hook + per-item state (DES-022 BR-86/BR-89, no visual change) | frontend-engineer | 5 | BE-007, FE-017 | verified |
| FE-011 | Sidebar disabled / loading / checkFailed rendering (UX-006, DES-022) | frontend-engineer | 6 | FE-010 | pending |
| FE-012 | Post-Generate shortfall report UI (UX-001, DES-020) | frontend-engineer | 6 | FE-005 | pending |
| FE-013 | Intensity summary + recommendations UI after Generate and on open (UX-001, DES-019) | frontend-engineer | 6 | FE-012, FE-008, FE-007 | pending |
| FE-014 | `nCourseIntensity` selector in timetable create/edit modal + settings level labels (UX-002, DES-019 D51) | frontend-engineer | 6 | BE-003 | verified |
| FE-015 | Non-blocking intensity warning toast on manual edit (UX-003, BR-80) | frontend-engineer | 6 | FE-009 | pending |
| FE-016 | Dedicated 403 copy + page-level 403 (UX-004, DES-018) | frontend-engineer | 6 | FE-001 | pending |
| FE-018 | 401 = SessionExpired only: remove page toasts / Alerts / `saveError` on 401 (DES-018 §43.2b item 1, RV-10) | frontend-engineer | 7 | FE-001 | verified |
| FE-019 | Required-load failure blocks Generate / Regenerate / Save, cancels a pending Generate, page stays viewable (DES-018 §43.2b item 4 (a)–(d), SA-Q19 = A, RV-11/RV-12) | frontend-engineer | 7 | FE-001, FE-018 | verified |
| FE-020 | Frontend request hygiene on the 7 routes (RV-7, RV-13, RV-14, RV-15) + missing 403 tests | frontend-engineer | 7 | FE-018, FE-019 | verified |
| UX-007 | UX artifact: term context/selector across the 7 routes (DES-009 §34.6, REQ-012 AC-027) | uxui-designer | 8 | — | verified |
| BE-010 | Term dimension backend: additive `sTermID` + VR-8/VR-9 + BR-17a conflict scope (DES-009) | backend-engineer | 8 | — | pending |
| FE-021 | Term dimension frontend: Terms proxy + term context on 7 routes + bridge + conflict scope S1 (DES-009) | frontend-engineer | 8 | BE-010, UX-007 | pending |
| UX-008 | UX artifact: Copy entry points + Preview/Apply flow on 5 pages (DES-010, REQ-013 AC-029..AC-032, AC-050, AC-051) | uxui-designer | 9 | UX-007 | pending |
| BE-011 | `Timetable/Copy/Preview/Apply` — cross-term/year copy, single transaction (DES-010 §35, BR-66..BR-70) | backend-engineer | 9 | BE-010, BE-012, BE-013 | pending |
| FE-022 | Copy UI on 5 entry points + proxies, read real results (DES-010, REQ-013 AC-029..AC-032, AC-050, AC-051) | frontend-engineer | 9 | BE-011, FE-021, UX-008 | pending |
| UX-009 | UX artifact: continuity block UX + config warnings (DES-012 BR-31/BR-53, DES-017 BR-65) | uxui-designer | 10 | UX-007 | pending |
| FE-023 | Solver/validateDrop enforce continuity + subjectGroups, single parser, BR-53 warnings (DES-012, DES-017) | frontend-engineer | 10 | UX-009 | pending |
| UX-010 | UX artifact: room mapping + per-unit room settings on subject-settings (DES-013, REQ-016 AC-038..AC-040) | uxui-designer | 11 | UX-007 | pending |
| BE-012 | Rooms backend: `Tbl_SubjectRoom` + `Tbl_RoomSetting` + Rooms/RoomSetting/SubjectRoom endpoints (DES-013 §38.3) | backend-engineer | 11 | BE-010 | pending |
| FE-024 | Rooms frontend: mapping/setting UI + `canUseRoom` + /academic usage (fail-closed) + caretaker filter (DES-013 §38.3, BR-36..BR-57, BR-71) | frontend-engineer | 11 | BE-012, BE-014, FE-021, FE-025, UX-010 | pending |
| UX-011 | UX artifact: hour-based caps + homeroom-restricted card on settings (DES-014, DES-015, REQ-017/REQ-018) | uxui-designer | 12 | UX-007 | pending |
| BE-013 | Settings additive: `nMaxTeachingHoursPerDay/Week` + VR-12, `jHomeroomRestrictedTeachers` + VR-13, `lstRestrictedClasses` from `TClassMember` (DES-014 §39.2, DES-015 §40.3) | backend-engineer | 12 | BE-010 | pending |
| FE-025 | Caps in real teaching minutes + homeroom-restricted eligibility, single shared function (DES-014 §39, DES-015 §40) | frontend-engineer | 12 | BE-013, FE-021, UX-011 | pending |
| UX-012 | UX artifact: generate precheck blocker panel + warnings (DES-011, REQ-014 AC-033..AC-035) | uxui-designer | 12 | UX-007 | pending |
| FE-026 | Generate precheck: blockers + warnings + shortcut, no silent drop (DES-011, REQ-014 AC-033..AC-035) | frontend-engineer | 12 | FE-023, FE-024, FE-025, UX-012 | pending |
| UX-013 | UX artifact: "ใช้งานตารางสอน" push flow (DES-016, REQ-019 AC-047..AC-049, AC-052, AC-053) | uxui-designer | 13 | UX-007 | pending |
| BE-014 | Academic sync record backend: `Tbl_TimetableAcademicSync` + `Timetable/SetAcademicSyncResult/GetAcademicSyncResults` (DES-016 §41.4) | backend-engineer | 13 | BE-010 | pending |
| FE-027 | Push orchestration (option A) + push UI per contract (DES-016, REQ-019 AC-047..AC-049, AC-052, AC-053) | frontend-engineer | 13 | BE-014, FE-021, FE-024, UX-013 | pending |

## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
