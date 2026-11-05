# timetableai — Review Round 26 — FE-024

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (FE-024 implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 26

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-024 | PASS |

ผลการตรวจสอบ FE-024 (Phase 11 Rooms Frontend — Room constraints engine, mapping UI, caretaker filter, readiness, solver integration):
- `Proxy Routes & Types`:
  - `/api/school/[schoolId]/rooms` proxy ไปยัง School DB (`/WebAPI/School/{schoolId}/Rooms`)
  - `/api/subject-room/get` และ `/api/subject-room/set` proxy ไปยัง Module DB (`/WebAPI/SubjectRoom/...`)
  - `/api/timetable/academic-sync-results` proxy ไปยัง `/WebAPI/Timetable/GetAcademicSyncResults` (BR-56)
  - `/api/gateway/timetables/room-usage` ผ่าน gateway catch-all route ครบถ้วน
- `Room Constraints Engine (subject-rooms.ts)`:
  - `canUseRoom`: interval sweep real clock minutes, same-class deduplication to 1 count, Link Subject multi-class counting, capacity $K$ checks (fallback $K=1$ per BR-54), abutting intervals do not overlap.
  - `buildExcludedAcademicScheduleIds`: BR-56 sync-read exclusion / fallback to count all academic rows when sync results missing.
  - `checkRoomCaretaker` & `filterTeachersByRoomCaretaker`: $T_R = \{ t \in lstCaretakers : t.isInPlan \}$, empty set no restriction (OQ-45 จ), candidate teachers restricted to $T_R$.
  - `checkRoomCaretakerLink`: multi-class concurrent usage on rooms with counted caretakers requires shared `linkGroupId`; academic rows excluded per BR-49.
- `4-Level Check Hierarchy in Grid & Solver (DES-013 §38.5a item 3)`:
  1. Room readiness: `!isAcademicRoomUsageReady` -> `academicRoomUsageUnavailable` (unmapped subjects bypass per AC-040).
  2. Caretaker check: teacher not in $T_R$ -> `roomCaretakerMismatch`.
  3. Capacity check: peak concurrency $> K$ -> `roomCapacityExceeded`.
  4. Caretaker link check: concurrent classes in module without linkGroupId -> `roomCaretakerLinkRequired`.
  - Wired into `validateDrop`, `validateProspectiveRows`, and `useTimetableGeneration` (solver / CP search).
- `Subject Settings Room Mapping UI (subject-settings/[year]/page.tsx)`:
  - Table 1: Subject-Room mapping dropdown + Save calling `/api/subject-room/set`.
  - Table 2: Read-only room capacity & caretakers with C1' badges ("ไม่อยู่ในแผน — ไม่นับ" for $!isInPlan$).
- `Timetable Cell & Grid Integration`:
  - `timetable-cell.tsx` renders room badge `[sRoomName ?? sRoomID]` with tooltip and conflict highlighting.
  - `handleSave` saves `sRoomID` and `sRoomName` snapshot; `tryRestore` restores them accurately.
- `Checks & Verification`:
  - `npm run type-check` ผ่าน exit 0 (0 errors)
  - Scoped `eslint` บน changed files ผ่าน exit 0 (0 errors)
  - Approved SWC cache `npm run build` ผ่าน exit 0
  - Vitest test suite ผ่านครบ 14/14 tests ใน `timetable-fe024-rooms.test.tsx` และ 56 regression tests ผ่านทั้งหมด

## Reviewed

- `src/types/timetable.ts`
- `src/app/api/school/[schoolId]/rooms/route.ts`
- `src/app/api/subject-room/get/route.ts`
- `src/app/api/subject-room/set/route.ts`
- `src/app/api/timetable/academic-sync-results/route.ts`
- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/subject-rooms.ts`
- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts`
- `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`
- `src/app/[locale]/timetable/subject-settings/[year]/page.tsx`
- `src/components/layout/home/manage-teaching-schedule/timetable-grid.tsx`
- `src/components/layout/home/manage-teaching-schedule/timetable-cell.tsx`
- `tests/integration/timetable-fe024-rooms.test.tsx`
