# timetableai — QA Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` · 1 แถว = 1 บรรทัด
> วิธีอ่าน: หา QA id ในตาราง Findings แล้วเปิดเฉพาะ round file ที่แถวนั้นระบุ

## Rounds

| Round | Tasks | Status | ไฟล์ |
|---|---|---|---|
| 1 | Round 1 | ✅ Verified | `round-1.md` |
| 2 | Round 2 | ✅ Verified | `round-2.md` |
| 3 | Round 3 | ✅ Verified | `round-3.md` |
| 4 | FE-014 | ✅ Verified | `round-4.md` |
| 5 | UX-007 | ✅ Verified | `round-5.md` |
| 6 | BE-010 | ✅ Verified | `round-6.md` |
| 7 | FE-011, FE-012, FE-013, FE-015, FE-016 | ✅ Verified | `round-7.md` |
| 8 | remediation:SEC-03 | ✅ Verified | `round-8.md` |
| 9 | FE-021 | ❌ Failed | `round-9.md` |
| 10 | UX-008 — Phase 9 draft | ✅ Verified | `round-10.md` |
| 11 | UX-009 — Phase 10 draft | ✅ Verified | `round-11.md` |
| 12 | UX-010 — Phase 11 draft | ✅ Verified | `round-12.md` |
| 13 | UX-011, UX-012 — Phase 12 draft | ✅ Verified | `round-13.md` |
| 14 | UX-013 — Phase 13 draft | ✅ Verified | `round-14.md` |
| 15 | FE-021 — additional fixture-only round | ❌ Failed (build environment hold) | `round-15.md` |
| 16 | FE-021 — approved SWC cache build recheck | ✅ Verified | `round-16.md` |
| 17 | BE-012 — SQL artifact-only partial deliverable | ⚠️ Partial | `round-17.md` |
| 18 | BE-012 — SQL header comment-only partial deliverable | ⚠️ Partial | `round-18.md` |
| 19 | BE-013 — full bounded backend unit | ✅ Verified | `round-19.md` |
| 20 | BE-012 — stage SQL artifact-only partial deliverable | ⚠️ Partial | `round-20.md` |
| 21 | FE-025 | ✅ Verified | `round-21.md` |
| 22 | BE-012 | ✅ Verified | `round-22.md` |
| 23 | BE-014 | ✅ Verified | `round-23.md` |
| 24 | BE-011 | ✅ Verified | `round-24.md` |
| 25 | FE-023 | ✅ Verified | `round-25.md` |
| 26 | FE-022 | ✅ Verified | `round-26.md` |
| 27 | FE-024 | ✅ Verified | `round-27.md` |
| 28 | FE-026 | ✅ Verified | `round-28.md` |
| 29 | FE-027 | ✅ Verified | `round-29.md` |

## Findings

| ID | Task | Severity | ไฟล์ |
|---|---|---|---|
| QA-001 | BE-001 | Minor | `round-1.md` |
| QA-002 | BE-001 | Minor | `round-2.md` |
| QA-003 | BE-001 | Minor | `round-3.md` |
| QA-004 | FE-014 | Minor | `round-4.md` |
| QA-005 | FE-014 | Minor | `round-4.md` |
| QA-006 | FE-021 | Important | `round-16.md` |

## Change Log

- 2026-10-11 — Round 29 FE-027 ✅ Verified: npm run type-check ผ่าน 0 errors, eslint ผ่าน 0 errors, npm run build (approved SWC cache) ผ่าน exit 0, npm test ผ่านครบ 8/8 tests ใน timetable-fe027-push.test.tsx และ regression tests 76/76 tests; Push orchestration Direction A + atomic T1, AC-047..AC-049, AC-052, AC-053, BR-60 conflict detection, overwrite confirmation dialog, OD-1 choice ข ครบถ้วน; SOLO Status FE-027 pending→verified.
- 2026-10-11 — Round 28 FE-026 ✅ Verified: npm run type-check ผ่าน 0 errors, eslint ผ่าน 0 errors, npm run build (approved SWC cache) ผ่าน exit 0, npm test ผ่านครบ 11/11 tests ใน timetable-fe026-precheck.test.tsx และ regression tests 68/68 tests; Precheck blockers NoEligibleTeacher/ZeroPeriodsPerWeek, RoomCaretaker details, warnings, recheck without clearing grid (BR-28), fail-closed handling, revocation of silent drop ครบถ้วน; SOLO Status FE-026 pending→verified.
- 2026-10-11 — Round 27 FE-024 ✅ Verified: npm run type-check ผ่าน 0 errors, eslint ผ่าน 0 errors, npm run build (approved SWC cache) ผ่าน exit 0, npm test ผ่านครบ 14/14 tests ใน timetable-fe024-rooms.test.tsx และ regression tests 56/56 tests; Room constraints engine, 4-level check hierarchy, fallback K=1, fail-closed readiness (unmapped bypass per AC-040), caretaker badges, และ solver integration ครบถ้วน; SOLO Status FE-024 pending→verified.
- 2026-10-11 — Round 26 FE-022 ✅ Verified: npm run type-check ผ่าน 0 errors, eslint ผ่าน 0 errors 0 warnings, npm run build (approved SWC cache) ผ่าน exit 0, npm test ผ่านครบ 99/99 files (1,165/1,165 tests passed); Copy UI on 5 entry points, preview validation, apply flow, OD-1 choice ครบถ้วน; SOLO Status FE-022 pending→verified.
- 2026-10-11 — Round 25 FE-023 ✅ Verified: npm run type-check ผ่าน 0 errors, eslint ผ่าน 0 errors, npm run build (approved SWC cache) ผ่าน exit 0, npm test ผ่านครบ 98/98 files (1,156/1,156 tests passed); Whole-block continuity operations, single parser preservation, Subject groups constraints (VR-17) ครบถ้วน; SOLO Status FE-023 pending→verified.
- 2026-10-11 — Round 24 BE-011 ✅ Verified: dotnet build ผ่าน 0 errors, dotnet test ผ่าน 275/275 tests ครบถ้วน รวมถึง 13 tests ใน CopyBackendTests.cs; ลำดับ Validate ทั้ง 8 ขั้นตอน (§35.8), single-tx atomicity, M(scope) authorization filter ครบถ้วน; SOLO Status BE-011 pending→verified.
- 2026-10-11 — Round 23 BE-014 ✅ Verified: dotnet build ผ่าน 0 errors, dotnet test ผ่าน 262/262 tests ครบถ้วน รวมถึง 4 tests ใน AcademicSyncBackendTests.cs; VR-16 validation ครบถ้วน, atomic upsert per (nTimetableID, nClassID, sTermID), endpoint policies 401 write/read; SOLO Status BE-014 pending→verified.
- 2026-10-11 — Round 22 BE-012 ✅ Verified: dotnet build ผ่าน 0 errors, dotnet test ผ่าน 258/258 tests ครบถ้วน รวมถึง 7 tests ใน RoomsBackendTests.cs; C1′ School DB read-only, K=1 absence, VR-15 validation, BR-34/BR-71 ถูกต้อง; SOLO Status BE-012 pending→verified.
- 2026-10-11 — Round 21 FE-025 ✅ Verified: typecheck, scoped lint, approved SWC cache build exit 0, และ vitest tests 108/108 ผ่านจริง; REV-019 และ REV-020 resolved ใน review round 20; SOLO Status FE-025 pending→verified; closed rounds unchanged.

- 2026-10-11 — Round20 BE-012 stage SQL artifact-only ⚠️ Partial: class-setting-school-db.sql 2439 bytes ตรง §27.6 ก2 static; ไม่มี defect ใหม่; hash body ไฟล์เดิมเทียบ round-18 ทำซ้ำไม่ได้ (untracked); no parser/SQL execution. BE-012 คง pending; plan/closed rounds ไม่แก้.

- 2026-10-11 — Round19 BE-013 ✅ Verified: actual build0warnings0errors/full251passed0failed0skipped; responsibility/VR12/13/diagnostic/scopes/model checked. SOLO BE-013Status pending→verified เท่านั้น; 48tasks39verified9pending0blocked; REV-017Minor backlog/remainingholds carry, closedrounds unchanged.

- 2026-10-11 — Round18 BE-012 SQL header comment-only ⚠️ Partial: actual2397bytes/hash/rawbody/exactstatement/header inspected; no new defect; full task pending/remaining holds carry; no SQL execution and closed rounds/plan unchanged.

- 2026-10-11 — Round17 BE-012 SQL-only ⚠️ Partial: 1966bytes/hash/exact proposal static inspected; no new defect, no execution/runtime pass; full task pending/gates/closed rounds unchanged.

- 2026-10-09 — Round 9 FE-021 ❌ Failed; 1040 passed/6 failed, QA-006 auth fixtures; SWC build environment blocked; gate 4 parked. วันที่ผู้ใช้ jtrp98 09/10/2026.

- 2026-10-09 — Round 8 remediation:SEC-03 ✅ Verified; tests 125/125 และ dependency audit ผ่าน; next: security re-audit

- 2026-10-09 — Round 7 (FE-011, FE-012, FE-013, FE-015, FE-016) ✅ Verified · ผ่านครบทุกเช็คและการทดสอบ integration 173/173 tests green
- 2026-10-09 — Round 6 (BE-010) ✅ Verified · VR-8/VR-9/BR-17a และ School DB filter ครบถ้วน 125/125 tests green
- 2026-10-07 — แปลงเป็น split layout
- 2026-10-07 — Round 4 (FE-014) ✅ Verified · QA-004/QA-005 Minor
- 2026-10-07 — Round 5 (UX-007) ✅ Verified · ไม่มี defect ใหม่ · รอคนเซ็น artifact ก่อน FE-021 (gate 3)

- 2026-10-09 — Round 10 UX-008 verified เฉพาะ draft deliverable; app checks NOT RUN; QA-006/FE-021 blocked และ owner/UX/schema/production holds คงเดิม.

- 2026-10-09 — Round 11 UX-009 verified เฉพาะ draft deliverable; app checks NOT RUN; QA-006/FE-021 blocked และ owner/UX/schema/production holds คงเดิม.

- 2026-10-09 — Round 12 UX-010 verified เฉพาะ draft deliverable; app checks NOT RUN; QA-006/FE-021 blocked และ owner/UX/schema/production holds คงเดิม.

- 2026-10-09 — Round 13 UX-011, UX-012 verified เฉพาะ draft deliverable; app checks NOT RUN; QA-006/FE-021 blocked และ owner/UX/schema/production holds คงเดิม.

- 2026-10-09 — Round 14 UX-013 verified เฉพาะ draft deliverable; app checks NOT RUN; QA-006/FE-021 blocked และ owner/UX/schema/production holds คงเดิม.

- 2026-10-11 — Round 15 FE-021: fixture43/43 และ full1049/1049 ผ่านจริง; QA-006 resolved ด้าน fixture. Default build exit1 ก่อน compile/SWC environment hold → ❌ Failed / FE-021 blocked; no custom retry, fix history และ production/schema/deploy holds คงเดิม.

- 2026-10-11 — Round 16 FE-021 ✅ Verified: approved same-root extended-length SWC cache build attempt4 exit0; attempts1–3 fail history retained. Carry own QA15 typecheck/scoped lint/full1049/fixture43; QA15 preserved verbatim; manual/schema/SEC01/02/production/deploy holds unchanged.

Back-links: `../../INDEX.md`
