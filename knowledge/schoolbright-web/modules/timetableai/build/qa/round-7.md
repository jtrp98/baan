# timetableai — QA Round 7 — FE-011, FE-012, FE-013, FE-015, FE-016

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ถูกแทนคงอยู่เป็นไฟล์ของตัวเอง verbatim (ไฟล์เก่า = archive) · live Open Issues / Unverified Behaviour ให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|

## Round 7

**Status:** ✅ Verified

### Checks run

| Check | Command | Result |
|---|---|---|
| test (integration) | `npx vitest run tests/integration/` | pass (173/173 passed across 9 test files) |
| test (naming) | `npx vitest run tests/project/file-naming.test.ts` | pass (22/22 passed) |
| test (permissions) | `npx vitest run tests/hooks/use-timetable-menu-permissions.test.tsx tests/config/timetable-menu-permissions.test.ts` | pass (28/28 passed) |
| lint (timetable) | `npx eslint "src/app/[locale]/timetable"` | pass (0 errors, 17 warnings) |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| FE-011 | verified | `src/components/layout/sidebar.tsx:324-326, 712-724, 893-895, 910-917`, `tests/hooks/use-timetable-menu-permissions.test.tsx` (21 passed), `tests/config/timetable-menu-permissions.test.ts` (7 passed) |
| FE-012 | verified | `src/app/[locale]/timetable/manage-teaching-schedule/_components/generate-result-panel.tsx:1-147`, `page.tsx:1574-1576` (shortfall table / excluded / unverifiable render logic) |
| FE-013 | verified | `src/app/[locale]/timetable/manage-teaching-schedule/_components/intensity-summary-block.tsx:1-193`, `page.tsx:1584-1588` (intensity summary, recommendations, L0..L2, Flow D restore) |
| FE-015 | verified | `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx:371-421`, `_lib/use-manual-edit-intensity-warning.ts:1-136` (non-blocking toast warning via `react-hot-toast` with max 3 pairs + "และอีก k คู่" per UX-003) |
| FE-016 | verified | 173 tests green in `tests/integration/` (`timetable-401-silent-loaders`, `timetable-401-silent`, `timetable-401-silent-settings`, `timetable-403-visible`, `timetable-session-expired`, `timetable-401-silent-schedule`, `timetable-401-silent-manage-timetable`, `timetable-401-silent-class-period`, `timetable-401-silent-subject-settings`) |

### Feature QA flows

| Flow | อ้าง (TP-NNN หรือ REQ/AC) | Result |
|---|---|---|
| Sidebar Menu Permission (loading, checkFailed, noPermission, ready) | UX-006 / DES-022 | pass |
| Shortfall Report Display after Generate/Regenerate | UX-001 / AC-056 / DES-020 | pass |
| Intensity Summary & Recommendations Display | UX-001 / AC-055 / DES-019 | pass |
| Non-blocking Intensity Warning Toast on Manual Edit | UX-003 / AC-054 / BR-80 | pass |
| 401 SessionExpired vs 403 Visible Copy on all 7 routes | UX-004 / AC-063 / AC-066 / DES-018 | pass |

### Data Model check

- UI presentational components & client hooks only — no database schema alterations in Phase 6 frontend tasks.

### Issues Found (defect packet)

None.

## Unverified Behaviour — undeployed phases

- Phase 6 (FE-011): Menu ID 401..404, 422 deployment cutover ใน master DB (`SA-Q14`) ต้องได้รับการตรวจสอบโดย DevOps/เจ้าของระบบ SB ก่อน deploy production

## Change Log

- 2026-10-09 — Round 7 (FE-011, FE-012, FE-013, FE-015, FE-016) — ✅ Verified ครบทั้ง 5 tasks

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
