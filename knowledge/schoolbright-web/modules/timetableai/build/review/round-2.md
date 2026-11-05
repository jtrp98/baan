# review/phase-5.md — timetableai (archived review rounds, Phase 5)

Closed rounds moved verbatim from `review.md`. The Open Findings table stays in `review.md`.

## Review Round 1 — Phase 5 (BE-006, BE-007, FE-017, FE-010)

**Verdict:** ✅ Approved

Independent code review by `reviewer`, 2026-10-01. I read the code only and ran nothing. The test/build results below are the caller's evidence (dotnet test 42/42, vitest 74/74, tsc/build/eslint clean on the Phase-5 files). They are not results from this review, and this is not QA verification. No blocking findings; RV-1..RV-4 are non-blocking.

**BE-006: shared resolver (AC-062, BR-74..BR-76, VR-20)**
- The permission queries for `TGroupPermissionUser`/`TGroupPermissionMenu` and the admin rule `TAdmin`/`TCompany` now live only in `Security/TimetableMenuPermissionResolver.cs:61-137`. Grep found no other query on these tables in `AITimeTableBackend`, and the filter calls only the resolver (`TimetableAuthorizationFilter.cs:166`). ✔
- The resolver separates "no row" from "lookup failed": no row → `HasUserGroup=false` (:99-116); an exception propagates (no catch in the resolver). The filter turns both into 403 (`TimetableAuthorizationFilter.cs:180-184`, `:205-210`). VR-20 fail-closed ✔
- BR-75: read = any active row; write = `Type` equal to 'W' (case-insensitive, :132-133); `Role` is not read; unknown `Type` = no write. ✔ Identity comes only from claims (`NCompany`, `user_id`, `admin_id`). Read-only via `AsNoTracking`. ✔
- Cache is per request: DI `AddScoped` (`Startup.cs:87`). See RV-1.
- The §43.2a mapping table (`TimetableEndpointPolicy.cs:53-126`) keeps every existing row; only the `GetMenuPermissions` row (:122) was added. Unmapped actions and non-WebAPI controllers → 403 (`TimetableAuthorizationFilter.cs:143-154`). ✔
- "No behaviour change" could not be proven by reading: the pre-refactor version of the filter is not available (worktree not committed, no shell), and there is no AC-062 baseline from before the refactor (TP-D1: `AuthTests` not found). See RV-2.

**BE-007: `GET WebAPI/MenuPermissions/Get` (AC-064, BR-88)**
- Endpoint at `WebAPIController.cs:2837-2866`: no parameters, identity from `User` claims, returns `{status:1, message:"", data:{lstMenus:[{nMenuID,isRead,isWrite}]}}` with exactly the 5 MenuIDs from `TimetableMenuSettings` (resolver :52-59). No other SB menu leaks: `RawPermissions` is not returned. ✔
- Authenticated-only policy: only one action uses it (`TimetableEndpointPolicy.cs:122`; asserted by `IntegrationTests.cs:236-243` against every method of `WebAPIController`). It still requires BR-72 (fallback policy `Startup.cs:80-85` + `[Authorize]` `WebAPIController.cs:33`) and BR-73 (tenant binding runs before the bypass, `TimetableAuthorizationFilter.cs:51-132` then `:157-161`). ✔
- No row → 200 + all false (resolver :99-116). Admin failing BR-76 → 200 + all false (:77-88, `IsRead = isAdminValid`), not 403. Lookup exception → 403 (`WebAPIController.cs:2861-2865`). ✔
- The menu result matches the filter's decision: the filter uses `HasReadPermissionAny`/`HasWritePermission` over the same `MenuPermissions` list (`ITimetableMenuPermissionResolver.cs:24-40`). For admins, `IsAdminValid` drives both. ✔
- MenuIDs match across repos: `appsettings.json:17-21` = `TimetableMenuSettings.cs:5-9` = `src/config/timetable-menu-permissions.ts:5`. ✔

**FE-017: additive opt-out on `timetableFetch` (AC-063 regression, BR-89)**
- `src/lib/authHeaders.ts:27-54`: `TimetableFetchInit extends RequestInit` adds the optional `suppressSessionExpired`. The 2-argument signature is unchanged; the default (option absent/false) still calls `notifySessionExpired()` (:49-51). The Bearer header is attached the same way (:38-42). The option is stripped before `fetch` (:43). `notifySessionExpired` is untouched. ✔
- The plan suggested a third argument; putting the option on `init` is just a different shape of the same additive opt-out. It still compiles for every existing caller (tsc clean per caller evidence). ✔
- Grep for `suppressSessionExpired` under `src/`: the only caller is `src/hooks/useTimetableMenuPermissions.ts:107`. No existing caller changed. ✔ See RV-3 (missing test-plan coverage).

**FE-010: proxy + hook + 4 states (AC-064, BR-86, BR-89)**
- Proxy `src/app/api/menu-permissions/get/route.ts:3-5` uses the existing `proxyToBackend` (forwards `Authorization`, passes 401/403 status through — `src/lib/backendProxy.ts:72-76,100-107`). `backendProxy.ts` is not modified. ✔
- The hook calls `timetableFetch` with the opt-out; no direct `fetch` (:106-109). Timeout is a single 10 s `AbortController` constant (`timetable-menu-permissions.ts:41`; the timer is cleared only after the body is read, :111/:145). ✔
- `ready` only for HTTP 200 + `status===1` + exactly the 5-MenuID set with boolean `isRead`/`isWrite`. Missing, extra, duplicate or malformed → `checkFailed` + `console.error` (:41-93, :112-143). ✔
- Called once per full page load per `(schoolId, empId)` via a module-level Map + in-flight dedupe (:23-24, :152-180). `checkFailed` is cached too, so no automatic retry and no focus/interval refetch. ✔ No `localStorage` write in this path. ✔
- BR-86 mapping lives in one place (`timetable-menu-permissions.ts:14-28`) and matches the Sidebar hrefs (`Sidebar.tsx:894-914`). Per-item function `getItemPermissionState` (:50-73): unknown item → `checkFailed` (fail-closed). ✔
- Additive types `SidebarSubItem.disabled?`/`disabledReason?` and `SidebarChild.headerIndicator?` (`Sidebar.tsx:98-99,107`). No JSX/render change found: grep found no use of the new fields or the hook in `Sidebar.tsx`. ✔

**Could not review / outside the reviewer's scope**
- Before/after AC-062 baseline of BE-006 (S1-A): there is no pre-refactor code or baseline to compare against (TP-D1). QA should handle this per the plan.
- S1 with real U0–U6 accounts (TP-D2 not provided): the real `TGroupPermission*`/`TAdmin` data and SA-Q14 cannot be checked from the code.
- The `security` round of DES-018 (including the BR-74 exception of BE-007 and SEC-01) is a mandatory human gate before production. This review does not stand in for it.
- I could not run `sta context` (`$STA_CONTEXT_CMD`) because this run has no shell tool. Module/phase came from the caller's packet.

### Reviewed (Round 1)

- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableMenuPermissionResolver.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\ITimetableMenuPermissionResolver.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableAuthorizationFilter.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableEndpointPolicy.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableMenuSettings.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Controllers\WebAPIController.cs (25-59, 2825-2868)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Startup.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\appsettings.json (grep MenuId 17-21)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\IntegrationTests.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\FilterTests.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\ResolverTests.cs
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\TestSupport.cs
- C:\src\sb-tech-upgrade-web-system\src\lib\authHeaders.ts
- C:\src\sb-tech-upgrade-web-system\src\hooks\useTimetableMenuPermissions.ts
- C:\src\sb-tech-upgrade-web-system\src\config\timetable-menu-permissions.ts
- C:\src\sb-tech-upgrade-web-system\src\app\api\menu-permissions\get\route.ts
- C:\src\sb-tech-upgrade-web-system\src\components\layout\Sidebar.tsx (88-109, grep 894-914)
- C:\src\sb-tech-upgrade-web-system\src\lib\backendProxy.ts (grep)
- C:\src\sb-tech-upgrade-web-system\tests\lib\authHeaders.test.ts
- C:\src\sb-tech-upgrade-web-system\tests\hooks\useTimetableMenuPermissions.test.tsx
- C:\src\sb-tech-upgrade-web-system\tests\app\api\menu-permissions.test.ts
- C:\src\sb-tech-upgrade-web-system\tests\config\timetable-menu-permissions.test.ts

## Review Round 2 — FE-001

**Verdict:** ❌ Changes requested

Independent re-review by `reviewer`, 2026-10-01, of the FIND-P5-01 fix for FE-001 (Phase 3, re-checked in Phase 5; AC-063, DES-018 §43.2). I read the code only and ran nothing. The caller's evidence is vitest 287/287, tsc exit 0, build exit 0, eslint 0 errors (6 warnings I did not inspect). Those are not results from this review, and this is not QA verification. Round 1 was moved verbatim to `review/phase-5.md`.

**The seven FIND-P5-01 sites: fixed as asked ✔**
- `TeacherGroupsTab.tsx:81` add-teacher → `timetableFetch` with default options. A non-OK response or network error → `rollback` (:75-80, :95-98): restores `teachers` + `teacherCount` and shows one toast. ✔ The 403 now shows a visible toast and rolls back instead of staying silent. See RV-7 for rapid edits.
- `create-class-period-form.tsx:255, :283, :468` (plans, level-classes, `class-period/set`) → `timetableFetch` with default options, and `!r.ok` throws into the existing toast (:259, :287, :477). The 403 is no longer read as an empty list. ✔ The file has no importer (RV-9).
- `add-class-period-modal.tsx:183` → `timetableFetch` with default options, `!res.ok` → toast (:191, :197). `isSaving` guard intact (:153). ✔
- `manage-teaching-schedule/page.tsx:1146, :1149, :1153` (setting/get, get-by-class, plan subjects) → `timetableFetch` with default options plus `readJsonOrNotify` (:1134-1140). 401 → `null` without a toast (SessionExpired comes from the wrapper). 403/other → one toast deduplicated by `id: "restore-schedule-data"`. Network/parse error → `notifyFailed` (:1141-1144). The `null` fallback to the placed-subject courses is unchanged (:1158-1170, :1180). ✔
- Bearer kept at every site: the explicit `Authorization: Bearer ${user.token}` stays, and `timetableFetch` does not overwrite it (`authHeaders.ts:40`). ✔
- Grep for `suppressSessionExpired` under `src/` → the only caller is still `useTimetableMenuPermissions.ts:107`. All fixed sites use default options. ✔
- Success paths: by reading, the JSON handling and state updates after a 200 match the existing shape (`status === 1` checks unchanged). I could not diff against the earlier version (no shell; uncommitted worktree).
- `authHeaders.ts` matches Round 1 exactly (:27-54). I did not open `backendProxy.ts` or `AuthContext.tsx` this round, so whether they are untouched is not verified by diff (no shell for `git diff`). The only remaining raw `fetch(` in `AuthContext.tsx` is the existing parsetoken call (:57).

**Tests ✔ (by reading)**
- `tests/integration/timetable-session-expired.test.tsx:296-567`: each case fails only the call site under test (`installRoutedFetch`, all other requests 200) inside the real `AuthProvider` + `Toaster`. 401 → real SessionExpired + token/`sb_user_data` cleared. 403 → visible toast + token kept. Control 200 → optimistic add kept with no toast (:361-378). This tests the real mechanism, not a mock of `timetableFetch`. ✔
- The S10-A block (:133-256) is unchanged in what it asserts. `tests/lib/authHeaders.test.ts` still has the original cases (:63-157) plus S10 (:159-250). Nothing was weakened. ✔ The tests do not cover rapid edits (RV-7) or `LinkSubjectsModal`/`TimetableGrid` (RV-5/RV-6).
- RV-3 → **resolved**: I read the S10-A #4/#6, S10-B #2/#5 cases and the S10-A integration test.

**Blocking — raw `fetch(` to timetable routes still present (grep `\bfetch\(` under `src/`)**
- RV-5: `LinkSubjectsModal.tsx:167, 174, 181, 188` on `/timetable/subject-settings/[year]`.
- RV-6: `TimetableGrid.tsx:457` on `/timetable/manage-teaching-schedule`.
- Both break AC-063 "every call of the 7 routes" in the same way as FIND-P5-01. FIND-P5-01 listed only sites under `src/app/[locale]/timetable`, but the routes also render these components from `src/components`. The other raw `fetch(` hits are outside the 7 routes or are proxies/other modules: `ClassDropdown.tsx:32` is used only by `CourseInformationTimetablePage.tsx`, which has no importer, plus `services/*`, `app/api/*` route handlers, `RoleGuard.tsx:107` and `AuthContext.tsx:57`. Those are not in scope.

**Non-blocking follow-ups (known/outside FIND-P5-01)**: RV-7 (rollback race/StrictMode double POST), RV-8 (other `timetableFetch` calls with `.catch(() => {})`, so a 403 stays silent; includes `set-times` writes), RV-9 (`create-class-period-form.tsx` has no importer), RV-10 (401 also shows a "Request failed: 401" toast on the class-period paths → system-analyst). FIND-P5-03 (race in `AuthContext`) stays tracked in `qa.md`. I did not read `AuthContext.tsx:88-90` this round, so I am not adding an RV for it.

**RV-1, RV-2, RV-4**: no change this round. They are outside FE-001 and I read no fix for them, so they stay **open** (backend-engineer / system-analyst / backend-engineer).

**Could not review**
- No diff against the earlier version: no shell, uncommitted worktree. I judged "success path unchanged" and "backendProxy/AuthContext untouched" by reading only.
- I could not run `sta context` (`$STA_CONTEXT_CMD`) because this run has no shell tool. Module/phase came from the caller's packet.

### Reviewed (Round 2)

- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-timetable\[year]\TeacherGroupsTab.tsx
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\create-class-period\[year]\_components\create-class-period-form.tsx (1-40, 240-499)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\create-class-period\[year]\_components\add-class-period-modal.tsx (1-220)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-teaching-schedule\page.tsx (198-211, 1095-1184, 1450-1509)
- C:\src\sb-tech-upgrade-web-system\src\lib\authHeaders.ts
- C:\src\sb-tech-upgrade-web-system\tests\integration\timetable-session-expired.test.tsx
- C:\src\sb-tech-upgrade-web-system\tests\lib\authHeaders.test.ts (test index)
- C:\src\sb-tech-upgrade-web-system\src\components\modals\home\create-teaching-schedule\LinkSubjectsModal.tsx (155-199)
- C:\src\sb-tech-upgrade-web-system\src\components\layout\home\manage-teaching-schedule\TimetableGrid.tsx (440-479, grep props)

## Review Round 3 — FE-001

**Verdict:** ✅ Approved

Independent re-review by `reviewer`, 2026-10-01, of the RV-5/RV-6 fix for FE-001 (AC-063, DES-018 §43.2). I read the code only and ran nothing. The caller's evidence is vitest 300/300, tsc exit 0, build exit 0, eslint 0 errors/9 warnings. Those are not results from this review, and this is not QA verification. Round 2 was moved verbatim to `review/phase-5.md`. FIND-P5-01 in `qa.md` stays QA's to close.

**RV-5 → resolved: `LinkSubjectsModal.tsx`**
- All four loaders (years :183, `class-period/get` :189, `years/{id}/plans` :195, `level-classes` :201) go through one local `loadJson` (:172-179) → `timetableFetch(url, { headers: authHeaders })` with default options. There is no `suppressSessionExpired`; grep under `src/` finds it only at `useTimetableMenuPermissions.ts:107`. ✔ There is no other `fetch(` in the file.
- Bearer is kept: the explicit header from `user.token` (:161-164) is unchanged, and `timetableFetch` does not overwrite it (`authHeaders.ts:40`). ✔
- 401: the wrapper calls `notifySessionExpired`, the loader returns `null` and shows no toast (:175). 403/other: `toast.error("Request failed: <status>", { id: "link-subjects-modal-load" })`. The shared id means four failures show one toast. Network/parse errors → `onLoadError`, same id (:180-181). This is the same "Request failed" pattern as the Round 2 sites, so no new copy (FE-016 scope respected). ✔
- Success path: the `status === 1 && Array.isArray(...)` guards and the setters, including the `level-classes` mapping, keep their shape. `null` → no setState, so the lists stay empty as before, but the failure is now visible. ✔
- Stale closures and unmount: the effect deps (`[user, yearId]`, :215) are unchanged and `authHeaders` is memoised on `user`, so the closure and headers line up. The four loads have no abort/ignore flag, so a late response after unmount (or after a `yearId` change) can still call setState or show a toast. That was already true of the raw chains it replaced (no guard before), so this is not a regression. No new finding.

**RV-6 → resolved: `TimetableGrid.tsx`**
- `/api/class-period/get` → `timetableFetch` with default options (:462-465). The explicit Bearer is kept (:463) and `signal: controller.signal` is kept (:464). The wrapper passes `signal` through: it is spread from `fetchInit` (`authHeaders.ts:43-47`). Cleanup still calls `controller.abort()` (:574), and an `AbortError` does not call `onReady` (:573). ✔
- 401 → SessionExpired via the wrapper, no toast (:468). 403/other → one toast with `id: "timetable-grid-period-load"`, deduplicated across the per-class grids and skipped when aborted (:468-470), then `null` → `onReady` (:477). ✔
- Success path and gate: the 200 branch (:478-571) and the `onReady` calls are unchanged. The `periodGridData` skip (:454) is untouched. Effect deps unchanged (:576). ✔
- **403 → `onReady`: can Generate run on an incomplete grid? Yes.** A grid whose period load fails keeps `DEFAULT_ROWS`/`DEFAULT_TIMES`. `handleGridReady` counts it (`use-timetable-generation.ts:931-935`), and `fireGeneration` then runs Generate against the placeholder rows. The same happens on a network error (:573). This is not introduced by the fix: before it, a 403 body `{status:0}` hit the same `onReady`, and FE-001 asked that the generate gate stay unchanged. AC-063 asks only that the failure not be silent, and the toast now meets that. Whether Generate should be held or cancelled is a design rule §43.2 does not settle, so I logged it as **RV-11 (non-blocking, system-analyst)** instead of blocking FE-001.

**Tests ✔ (by reading): `tests/integration/timetable-session-expired.test.tsx:570-680`**
- They test the real mechanism: real `AuthProvider` + `Toaster` + real `timetableFetch`, with only global `fetch` stubbed via `installRoutedFetch` (:270-284, unmatched → 200). The modal/grid mount only after the user resolves, as in the app.
- Modal: one 401 per endpoint → real SessionExpired + token/user data cleared, and the failing URL was called (:590-595). The rule order for `/years` vs `/years/…/plans` is correct (:584). One 403 per endpoint → visible toast, no SessionExpired, token kept (:604-609). All four 403 → exactly one toast (:611-620). Control 200 → the loaded period renders, no error, and every loader request carries `Bearer` (:622-638).
- Grid: 401 → SessionExpired, and the URL has `nLevelClassID=11` (:653-658). 403 → toast + `onReady` still called + token kept (:660-668); this pins the RV-11 behaviour as it stands today. Control 200 → ready, no toast, Bearer sent (:670-679).
- Limits: the Bearer assertions would pass even if the explicit header were dropped, because the wrapper adds Bearer from `localStorage`. They prove Bearer is sent, not where it came from. There is no grid case with real periods returned and no multi-grid toast dedupe case. Neither is a blocker.
- No existing assertion weakened: S10-A (:135-258) and the FIND-P5-01 block (:298-568) assert the same as in Round 2. Lines shifted by +2 only because of the two new imports at :57-58. The routed default still gives 200 for the grid's `class-period/get` in the restore tests (:516-521), so the new grid toast cannot produce their `Request failed: 403` match.

**Independent re-grep: raw `fetch(` across all of `src/`** (pattern `(^|[^A-Za-z_])fetch\(`)
- No remaining raw `fetch(` to a timetable proxy route on a rendered path. Remaining hits:
  - `lib/authHeaders.ts:44` (the wrapper itself), `AuthContext.tsx:57` (parsetoken), `RoleGuard.tsx:107` (generic wrapper)
  - `app/api/*` server route handlers
  - `services/*` for other modules (portfolio, medical, directory, collection, attendance, payment, budget, `academic/client.academic.ts` → `/api/gateway/service-academic`)
  - `utils/testProxy.js`, `store/slices/authSlice.example.ts`
- `services/academic/schedule-ocr-import-service.ts:60` → `/api/timetable-pdf-import`. That proxy targets `TIMETABLE_OCR_BACKEND_URL` (legacy `api-grade.schoolbright.co`, `app/api/timetable-pdf-import/route.ts:11-15`), not the timetable-ai backend. Its only importer is `app/[locale]/academic/schedule/schedule-import-modal.tsx:20`, outside the 7 routes. **Exclusion correct.**
- `services/import-timetable-service.ts` → `/api/import-timetable` (sb-api-kruai). It is imported only from `academic/import-timetable/**`. Out of scope.
- `components/ui/ClassDropdown.tsx:32` → `/api/school/{id}/level/{levelId}/level-classes`. This is a timetable proxy route, but its only importer is `CourseInformationTimetablePage.tsx:6`, and grep finds no importer of that page. **Exclusion correct today**, but it is latent: if anyone wires it in, it brings back the RV-5 defect. It belongs with the RV-9 dead-code cleanup; no separate finding.
- No axios/XHR path: `lib/api/client.ts` (axios) is referenced only from READMEs.

**`authHeaders.ts` / `backendProxy.ts` / `AuthContext.tsx` not modified in this round**: `authHeaders.ts` matches Round 1/2 exactly (:27-54). The Glob mtime order (backendProxy < AuthContext < authHeaders) fits the caller's mtimes: Phase 3 work for the first two, FE-017 at 16:05 for authHeaders. I did not diff (no shell, uncommitted worktree), so "not modified" rests on that content match and the caller's mtimes, not on `git diff`.

**Other findings**: RV-1, RV-2, RV-4, RV-7, RV-8, RV-9, RV-10 are unchanged this round; I read no fix for them, so they stay open with the same owners. New: RV-11 (non-blocking, system-analyst).

**Could not review**
- No diff against the pre-fix version. "Success path unchanged" and "not a regression" for RV-11 are judged by reading the current code against the Round 2 description of the raw calls.
- I could not run `sta context` (`$STA_CONTEXT_CMD`) because this run has no shell tool. Module/phase came from the caller's packet.

### Reviewed (Round 3)

- C:\src\sb-tech-upgrade-web-system\src\components\modals\home\create-teaching-schedule\LinkSubjectsModal.tsx (1-320)
- C:\src\sb-tech-upgrade-web-system\src\components\layout\home\manage-teaching-schedule\TimetableGrid.tsx (1-40, 420-576)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-teaching-schedule\_lib\use-timetable-generation.ts (grep 909-973)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-teaching-schedule\page.tsx (grep handleGridReady/onReady)
- C:\src\sb-tech-upgrade-web-system\tests\integration\timetable-session-expired.test.tsx (1-680)
- C:\src\sb-tech-upgrade-web-system\src\lib\authHeaders.ts
- C:\src\sb-tech-upgrade-web-system\src\app\api\timetable-pdf-import\route.ts
- C:\src\sb-tech-upgrade-web-system\src\ (grep raw `fetch(`, `suppressSessionExpired`, axios, importers of ClassDropdown/CourseInformationTimetablePage/OCR/import-timetable services)

## Review Round 4 — FE-001

**Verdict:** ✅ Approved

Independent re-review by `reviewer`, 2026-10-01, of the fix for QA finding FIND-P5-04 (RV-8 raised to blocking by QA) on FE-001 (AC-063, DES-018 §43.2). I read the code only and ran nothing. The caller's evidence is vitest 313/313, tsc exit 0, build exit 0, and eslint of the helper + `tests/integration` with no errors. Those are not results from this review, and this is not QA verification. Round 3 was moved verbatim to `review/phase-5.md`. FIND-P5-04 in `qa.md` stays QA's to close.

**Full call-site list, re-derived** (grep `timetableFetch\(` across `src/`): 62 hits = the definition `authHeaders.ts:37` + **61 call sites**. That matches the engineer's 61. I read every call site's handling:
- **Loaders: 403/other visible via `readJsonOrNotify` or an inline check, 401 silent (SessionExpired). 36 sites:** `timetable-year-list-page.tsx:58` · `[year]/page.tsx:92` (existing Thai 403 message kept; other statuses → helper) · `subject-settings/[year]/page.tsx:184, 203` · `settings/[year]/page.tsx:167, 200` · `TeacherGroupsTab.tsx:159, 173, 174` · `MainTeachingGradeTab.tsx:55, 74, 86, 374, 445` · `use-timetable-generation.ts:91, 120` · `use-select-curriculum.ts:52, 107, 113` · `manage-teaching-schedule/page.tsx:122` (fail-closed), `592, 877, 901, 919, 996, 1168, 1171, 1175, 1264, 1287, 1352` · `create-class-period/[year]/page.tsx:39, 63` (existing Thai 403 kept, other → helper), `88` · `TimetableGrid.tsx:462` · `LinkSubjectsModal.tsx:173` (one site, 4 URLs). Every chain ends in a `.catch` that toasts (or a try/catch at :996-1012), so a network failure or unreadable body is visible too.
- **Writes: non-OK → rollback/toast/Alert. 24 sites:** `[year]/page.tsx:132, 167` · `subject-settings/[year]/page.tsx:265, 351, 365, 423, 443, 457` · `settings/[year]/page.tsx:280` · `TeacherGroupsTab.tsx:86, 131, 540, 751, 801, 994` · `MainTeachingGradeTab.tsx:197, 552` · `manage-teaching-schedule/page.tsx:710` · `add-class-period-modal.tsx:183` · `create-class-period-form.tsx:255, 283, 468` (no importer, RV-9) · `create-class-period/[year]/page.tsx:109, 133`. **"Already handled" claims checked:** `add-multiple` (:761-762) and `update` (:1006-1007) read the body, and a 403 body `{status:-1}` reaches `toast.error` ✔. `class-continuity/set` and `setting/set` throw into the page Alert on `!res.ok` ✔. The deletes and toggles roll back + toast ✔.
- **Opt-out by contract: 1 site:** `useTimetableMenuPermissions.ts:106` (§43.2 Rev 15 / BR-89).
- A grep for `.catch(() => {})`, `.catch(() => null)` and `catch {}` on the 7 routes plus `TimetableGrid`/`LinkSubjectsModal` finds no silent swallow of a fetch left. The remaining `catch {}` are at `page.tsx:1258` (a processing guard around fetches that each already `.catch(notifyFailed)`) and `TimetableGrid.tsx:1127, 1134, 1204` (drag-and-drop JSON parsing). **No call site stays silent or shows success on 403.** The one exception is the 200-with-`status≠1` gap logged as RV-15, which AC-063 does not cover.

**(1) `set-times` rollback: RV-8 → resolved**
- Modal (`TeacherGroupsTab.tsx:489-563`): the snapshot is `currentTimes` (the map entry at save time) plus `previousGroup.schedule`/`scheduleStatus`. On `!res.ok` or a network error, `rollbackTimes()` restores both the `groupTimesMap` entry and the `active/total` label. It spreads `g`, so a teacher change made in the meantime is not overwritten. There is exactly one toast (`SET_TIMES_TOAST_ID`; 401 → none) and no double toast ✔. Test `timetable-403-visible.test.tsx:162-174` pins label "0 • 1/1" → optimistic "0/1" → back to "1/1". The rapid double-save race is the RV-7 pattern; I appended it to RV-7 rather than opening a new finding.
- Wizard (:799-842): each group's result is collected. Only the failed groups are rolled back to `wizardTimesTemplate` (all slots on). There is one toast for the batch, the success summary is **not** shown, and the wizard closes. **Acceptable, with no inconsistent data:** `add-multiple` has already committed the groups, and `set-times` did not save, so the server holds those groups with empty day lists. `fetchData` rebuilds them from the period template with all slots on (`:241`), which is exactly what the rollback shows. Closing prevents a second "record" from creating duplicate groups (the test asserts `add-multiple` was called once, :240). What is lost is the user's blocked-slot selection. The generic `Request failed: 403` toast also does not say the groups were created. The no-new-copy rule (FE-016) explains both, so I did not log a finding. Cosmetic drift: rollback uses the count of flattened times and gives `'error'` for 0 slots, while `fetchData` uses `slotCount` and gives `'warning'` for 0 slots (:259-262 vs :833). This corrects itself on refresh.

**(2) `manage-teaching-schedule` `setting/get` fail-closed (`page.tsx:120-159`)**
- Success path unchanged: the same setters run, and a 200 with `status≠1` (e.g. no settings row yet) still sets `settingsLoaded=true`, as `.finally` did before. A new school is not locked out ✔. Non-OK → `false` + toast (401 → none). Network error or unreadable body → `false` + toast ✔. The gate flips correctly: a failure also clears a `true` left over from a previous year.
- Stuck page: on any failure `isScheduleDataReady` stays false. The **whole page** then stays on the "loading" spinner (:1426), including the new-schedule entry and restore (the pendingMount effect at :1315 never fires), and there is no retry. For a 403 this is correct fail-closed: under §43.2a, `Setting/Get` is readable with menu 401, so a user who is denied it cannot use the page anyway. A legitimate user who hits a transient 5xx/network error sees the toast fade, then "loading" until they reload. This is visible, so AC-063 holds. Whether the page should block entirely or only Generate (with retry) is not in the contract → **RV-12 (non-blocking, system-analyst)**.

**(3) Helper `src/lib/timetableRequestFailure.ts`**
- `notifyRequestFailed` never toasts on 401 (:16) ✔. `notifyRequestError` covers network/parse (:20-22).
- Shared toast id: react-hot-toast replaces a toast with the same id instead of stacking. The tests assert exactly one toast for three 403 loaders (:335-351). Side effect: within one id the latest status wins (403 then 500 → shows "500"). That is acceptable.
- `readJsonOrNotify(): Promise<any | null>` (:29) is untyped, with a disabled lint rule. Every caller I read guards with `json?.status === 1` / `Array.isArray`, so `null` and odd shapes are safe. The typing is no weaker than the `r.json()` it replaced. No finding.
- Unreadable body: on non-OK the body is not read. On OK, a `res.json()` rejection propagates to each caller's `.catch` → `notifyRequestError`. Every caller has one ✔. The local copy at `page.tsx:1156` shadows the import → **RV-14 (non-blocking)**.

**(4) `subject-settings` link-subject-setting/delete (`subject-settings/[year]/page.tsx`)**
- Edit flow (:350-363): a failed delete now throws **before** the recreate loop, so a denied/failed delete cannot lose the existing link ✔. Group delete (:434) and detail delete (:454, :498-512) now throw into the existing `saveError` Alert (:1152-1154) instead of reporting success ✔.
- Data loss midway: a 403 cannot strike between delete and set, because both need the same 422 write. But delete-OK followed by set-failed (5xx/network/`status≠1`) still loses the original. The `catch` also does not reload, so the UI is stale. This existed before the change → **RV-13 (non-blocking, frontend-engineer)**.

**(5) The 3 open design questions the engineer raised**
- Generation loaders (`subject-settings/get` page.tsx:603, `get-all-by-year` and `teacher-group/get-all` use-timetable-generation.ts:103, :153) still set loaded in `finally`, so Generate can run after a failure. **Risk:** generation without link-subject priorities, cross-timetable conflicts or teacher unavailability, which a user can then save (double-booked teachers). **Should it block AC-063? No.** (a) Every failure is now visible, which is what AC-063 asks. (b) By §43.2a, a 403 on these three means no read on menu 401, so `Timetable/Set` (401 write) is also 403 and nothing can be persisted. The persistable risk comes only from transient non-403 errors, and that existed before (silently). (c) It is the same open question as RV-11 (grid period load).
- `settings/[year]` blank form: a 403 on `Setting/Get` implies no 403/401 read, and so no `Setting/Set` (403 write) → Save gets 403 → Alert, no overwrite. A transient failure plus a Save does overwrite the non-required fields with defaults (not new, now visible).
- Both are bundled into **RV-12 → system-analyst**: one rule for "a required load failed".

**(6) Tests: `tests/integration/timetable-403-visible.test.tsx` (1-353)**
- They test the real mechanism: real `AuthProvider` + `<Toaster/>` + real `timetableFetch` + the real components. Only global `fetch` is stubbed (`installRoutedFetch` :77-91, unmatched → 200). Every failure case has a 200 control (:192-203, :245-260, :301-309, :328-333), so the assertions are not vacuous. 401 cases assert SessionExpired and **no** `Request failed` toast (:292-299, :321-326).
- `matchMedia`: it is defined once at module level (:62-64) and not restored. `vitest.config.ts` keeps the default per-file isolation (no `isolate: false`/`singleThread`), so it cannot leak into other files. `fetch` is undone by `vi.unstubAllGlobals()` (:122) ✔.
- No existing assertion weakened: `timetable-session-expired.test.tsx`'s 403/401 expectations still read the same (:427-675). In the restore rules, the `setting/get` → 200 entry (:533) is redundant with the routed default (200 `{status:1,data:[]}` also opens the now fail-closed gate). Whether it was added this round or not, it removes no assertion. I could not diff to confirm.
- Gaps (not blockers): no 403 case for `subject-settings/[year]`, `settings/[year]`, `[year]` (other than the existing one), `create-class-period/[year]`, `use-select-curriculum`, or the two generation-hook loaders. The modal network-error case (:176-190) does not assert "not SessionExpired".

**`authHeaders.ts` / `backendProxy.ts` / `AuthContext.tsx` untouched**: `authHeaders.ts` (:1-54) reads the same as in Rounds 1-3, and no changed file edits it. The Glob mtime order is backendProxy < AuthContext < authHeaders < `timetableRequestFailure.ts`. That fits the caller's mtimes (AuthContext/backendProxy 2026-09-29 23:38, authHeaders 2026-10-01 16:05), with the new helper written after all three. I did not diff (no shell, uncommitted worktree), so "untouched" rests on reading plus mtime order, not on `git diff`.

**Blocking vs non-blocking:** no blocking finding is open. FIND-P5-04's requirement was that every call on the 7 routes show 403 as a visible failure, with nothing showing success or staying silent. I re-derived all 61 call sites and none violates it. The new findings RV-12 to RV-15 are either rules the contract does not settle (RV-12 → SA) or gaps that predate this change and fall outside AC-063's 401/403 scope (RV-13/RV-15), or a readability point (RV-14). None of them makes a 401/403 silent or shows success on one.

**Other findings**: RV-8 → resolved (above). RV-7 is still open, with the `set-times` modal snapshot appended. RV-1, RV-2, RV-4, RV-9, RV-10 and RV-11 are unchanged; I read no fix for them, so they stay open with the same owners. New: RV-12 (system-analyst), RV-13, RV-14, RV-15 (frontend-engineer), all non-blocking.

**Could not review**
- No diff against the pre-fix code. "Success path unchanged" and "not new" (RV-12/13/15) are judged by reading the current code, the QA FIND-P5-04 description and earlier rounds.
- Whether the backend returns a 200 with `status≠1`, or a 200 with no data, for `Setting/Get` when a school has no settings row. If it returned anything non-OK, new schools would hit the fail-closed spinner. DES-002 says "HTTP 200 always", so I assumed 200. QA should confirm against the backend.
- I could not run `sta context` (`$STA_CONTEXT_CMD`) because this run has no shell tool. Module/phase came from the caller's packet.

### Reviewed (Round 4)

- C:\src\sb-tech-upgrade-web-system\src\lib\timetableRequestFailure.ts (1-35)
- C:\src\sb-tech-upgrade-web-system\src\lib\authHeaders.ts (1-54)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-timetable\[year]\TeacherGroupsTab.tsx (1-1037)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-timetable\[year]\MainTeachingGradeTab.tsx (1-240, 360-599)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-teaching-schedule\page.tsx (1-175, 200-459, 580-749, 866-1015, 1150-1499; grep settingsLoaded/isScheduleDataReady/toast ids)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-teaching-schedule\_lib\use-timetable-generation.ts (1-175)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\manage-teaching-schedule\_lib\use-select-curriculum.ts (1-150)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\_components\timetable-year-list-page.tsx (1-95)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\[year]\page.tsx (80-199)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\subject-settings\[year]\page.tsx (160-533; grep toast id/saveError)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\settings\[year]\page.tsx (140-329)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\create-class-period\[year]\page.tsx (1-165)
- C:\src\sb-tech-upgrade-web-system\src\app\[locale]\timetable\create-class-period\[year]\_components\add-class-period-modal.tsx (178-202)
- C:\src\sb-tech-upgrade-web-system\src\components\layout\home\manage-teaching-schedule\TimetableGrid.tsx (440-579; grep `catch {}`)
- C:\src\sb-tech-upgrade-web-system\tests\integration\timetable-403-visible.test.tsx (1-353)
- C:\src\sb-tech-upgrade-web-system\tests\integration\timetable-session-expired.test.tsx (495-574; grep matchMedia/403/setting/get)
- C:\src\sb-tech-upgrade-web-system\vitest.config.ts
- C:\src\sb-tech-upgrade-web-system\src\ (grep `timetableFetch\(` — all 61 call sites; grep silent `.catch`/`catch {}` on the 7 routes)

## Review Round 7 — BE-008

**Verdict:** ❌ Changes requested

Independent review by `reviewer` of BE-008 (timetableai Phase 5; AC-072, AC-071, AC-062/AC-064 regression; DES-018 Rev 19 BR-74 (ข) / BR-76 (ก); OQ-39, OQ-41 = A, SA-Q23 closed), run `run-muqph7j6-269619fe`. Dated 2026-10-02, the date in the caller's packet, which the user did not state. I read the code only and ran nothing. The orchestrator reports `dotnet build` with 0 errors (69 pre-existing warnings) and `dotnet test` 109/109 passed. Its first run had 10 failures from duplicate seed keys in the shared class fixture; it fixed them in test setup only and the rerun was green. Those are not results from this review, and this is not QA verification. Round 6 (FE-018) was moved verbatim to `review/phase-7.md`. I did not read `qa.md` or `../security.md`.

**(1) The predicate matches the contract on its decision logic.** `IsSchoolEligible` (`TimetableMenuPermissionResolver.cs:161-162`) is `company != null && company.isActive != false && company.cDel != true`, exactly the OQ-39 rule: the three columns of plan.md:715/:729, with null = pass. It is the only school predicate. Grep finds `TCompany` read only in `SchoolPassesAsync` (:164-169), which the admin path (:68) and the regular-user path (:93) both call. The admin rule at :70-72 is `admin != null && active != false && del != true && schoolPasses`, and nothing reads `TAdmin.IsActive`. `TCompany.isActive`/`cDel` are now `bool?` (`TCompany.cs:25, :27`), so those two columns read NULL correctly. **But the lookup loads the whole entity, and two other non-nullable `bool` columns are `BOOLEAN NULL` in the dump. A NULL there still fails the row read → 403 → RV-19 (blocking).**

**(2) Order and outcomes.** On the regular-user path the school check (:93) runs before any `TGroupPermissionUser` query (:113-116), as BR-74 (ข) asks. "School does not pass" is a decision: it returns `HasUserGroup=false` and all 5 MenuIDs false (:95-109), which the filter turns into 403 `Forbidden` (`TimetableAuthorizationFilter.cs:180-184`) and `MenuPermissions/Get` returns as 200 + false (`WebAPIController.cs:2843-2859`). A lookup exception is not caught in the resolver, so it reaches the existing VR-20 `catch` blocks (filter :205-209, controller :2861-2865) → 403 on both. Not found (D3) and lookup failed (D4) therefore stay separate, as plan.md:715 requires. On the admin path, a failing school gives `IsAdminValid=false` → 403 (filter :170-174), and `MenuPermissions/Get` returns 200 + false. The claim `NCompany` is the school input, never a request parameter (filter :166, resolver :35-36). The per-request cache (:48-51) also caches the "school fails" result, which BR-74 allows; RV-1 is unchanged.

**(3) The do-not-modify list holds (by reading and mtime).** Glob mtime order puts `TimetableEndpointPolicy.cs`, `TimetableAuthorizationFilter.cs`, `TokenAuthenticationHandler.cs`, `Startup.cs`, `WebAPIController.cs`, `ITimetableMenuPermissionResolver.cs`, `IntegrationTests.cs`, `FilterTests.cs` and `TestSupport.cs` all **before** `TCompany.cs` < resolver < `ResolverTests.cs` < `SchoolPredicateTests.cs`. So BE-008 wrote only those last four files. The group lookup at :113-116 and the menu lookup at :137-140 keep the `IsActive`/`IsDel` conditions, which agree with SA-Q23 as closed. `appsettings.json` was not touched by this task, and the tests supply `Token_Secret` through config override (`SchoolPredicateTests.cs:452-455`). No DDL, and `MasterDataContext.cs` is unchanged.

**(4) Other consumers of `TCompany`.** Grep `TCompany` across `*.cs`: the only production uses are `MasterDataContext.cs:28` (the `DbSet`) and the resolver. Every other `isActive`/`cDel` hit belongs to a different entity (`Tbl_Timetable`, `TClassOnline`, `TPlan`, …). So changing `bool` → `bool?` breaks no other consumer. The only reads are `!= false` / `!= true`, which are well-defined for `bool?`.

**(5) Tests.** The U layer covers D1–D18 at `SchoolPredicateTests.cs:116-342`, including D3 as its own test (:142-150), D4 on both paths through a throwing query filter (:31-53, :153-173), D12 with `IsActive=false/null` (:221-232), D15 = A9, the 10-state theory (missing + 3×3 values) on both paths (:263-293), and A6. The filter layer runs the real filter + real resolver on the four S1-A representatives (:375-439). The I layer uses a real resolver in-process (:443-643) for D1/D2, D3, D4, D5–D7, D8/D9, D10/D11, D13, D16–D18, plus BR-73 `SchoolMismatch` first. Together that meets the minimum in test-plan.md:130. The null-pass rows go through `MenuPermissions/Get` only, because an allowed action would hit Postgres; the engineer disclosed this, and the filter layer covers "next called". The in-memory provider does not enforce column nullability, so "null does not fail the read" on Npgsql rests on reading the code, and that reading is exactly what RV-19 fails. **Existing tests:** `ResolverTests.cs` has 5 fixtures now seeding `ActiveSchool` (:50, :64, :78, :98, :160). `Group()` widened `del` to `bool?` (:28). `InvalidAdmin_Br76` (:123-144) and `LookupFailure_Throws` (:146-154) still hold. Every assertion I read matches its test's name. One test, `NoGroupRow…`, now passes through a different branch → RV-20 (non-blocking). "No assertion removed" rests on reading; I could not diff. The per-seed group ids (`Interlocked`, :58, :70) and per-test school ids (:477, :482) explain the first-run duplicate-key failures. The factory's `FailCompanyLookup` toggle is shared, but xUnit runs one class's tests sequentially, and D4 resets it in `finally` (:550).

**Blocking vs non-blocking:** RV-19 is blocking. A real master row with NULL `single_authen`/`double_authen` would lock every regular user of that school out of the module (403 + Sidebar `checkFailed`). That is a regression against the Rev 18 baseline that BE-008 introduces, and it breaks AC-072's "not 403 from a failed row read". The fix is a query projection inside the granted scope. RV-20 is a test-intent gap.

**Other findings:** RV-2 → resolved (contract settled by OQ-39 and SA-Q23 per design Rev 19; code matches). RV-4 → note appended (partly addressed; the rest goes to BE-009). RV-1 is unchanged and open (BE-009); the cache is now at :18 and :48-51. RV-7, RV-9, RV-11..RV-18 are frontend items not touched by this task. A doc slip, not a code finding: test-plan.md:132 says the null gap is MySQL `BOOLEAN NULL`, but the master provider is Npgsql (`MasterDataContext.cs:20`). The gap itself is real.

**Could not review**
- No diff against the pre-BE-008 tree (no shell, uncommitted worktree). "Do-not-modify untouched" and "no assertion reduced" rest on reading and Glob mtime order.
- I did not run the build or the tests. I cannot confirm 109/109, or that the first-run failures were in seed setup only.
- Real master DB nullability of `TCompany`/`TAdmin` (D24): the `TAdmin` DDL is not in `school_db.sql`. This is `devops`' pre-production check and the `security` gate, not evidence here.
- `[manual-API]` on real inactive school/admin accounts (TP-D2) is outside a code review.
- I could not run `sta context` (`$STA_CONTEXT_CMD`): this run has no shell tool. Module, phase and task came from the caller's packet.

### Reviewed (Round 7)

- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableMenuPermissionResolver.cs (1-171)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Models\TCompany.cs (1-36)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Models\TAdmin.cs (1-21)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Helpers\MasterDataContext.cs (1-61)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableAuthorizationFilter.cs (130-215)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Controllers\WebAPIController.cs (2830-2868)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Startup.cs (55-99)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\ResolverTests.cs (1-183)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\SchoolPredicateTests.cs (1-645)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\TestSupport.cs (45-69)
- C:\src\sb-api-academic-timetable-ai\school_db.sql (1178-1272 — `TCompany` DDL; grep `TAdmin` DDL: not present)
- C:\src\sb-api-academic-timetable-ai\ (grep `TCompany|isActive|cDel` across `*.cs`; grep `ResolvePermissionsAsync|catch|Forbidden`; grep resolver/`InMemoryMasterDataContext` registrations; Glob mtime order of `AITimeTableBackend*/**/*.cs`)

## Review Round 8 — BE-008

**Verdict:** ✅ Approved

Re-review by `reviewer` of BE-008 after Round 7's Changes requested (timetableai Phase 5; RV-19/RV-20 fix), run `run-muqpr53i-bc6acc03`, dated 2026-10-02 from the caller's packet. I read the code only and ran nothing. The orchestrator reports `dotnet build` with 0 errors and `dotnet test` 109/109 passed. Those are not results from this review, and this is not QA verification. Round 7 was moved verbatim to `review/phase-5.md`, because BE-008 is a Phase 5 task. I did not read `qa.md` or `../security.md`.

**(1) RV-19 is resolved.** `SchoolPassesAsync` (`TimetableMenuPermissionResolver.cs:166-177`) now uses `.Where(c => c.nCompany == schoolId).Select(c => new SchoolFlags(c.isActive, c.cDel)).FirstOrDefaultAsync()` (:172-175).
- `SchoolFlags(bool? IsActive, bool? CDel)` (:161) matches the `bool?` model columns (`TCompany.cs:25, :27`).
- EF builds the record in the final client-side projection, so only those two columns are read, and the NULL `single_authen`/`double_authen` (`TCompany.cs:18, :20`) are never materialized.
- With no row, `FirstOrDefaultAsync` returns `null`, so `IsSchoolEligible` is false. That is the not-found decision (D3), not an exception.
- A lookup exception still escapes the resolver into the unchanged VR-20 `catch` blocks → 403. That is the lookup-failed outcome (D4).
- The D4 tests still run through this path: `FailableCompanyMasterDataContext` throws from a `TCompany` global query filter (`SchoolPredicateTests.cs:45-51`), and EF applies that filter to projected queries too.
- The code note at :168-171 records why the projection is there and why no test covers it. That is the "test or code note" the finding asked for. A regression test is not possible on the in-memory provider.

**(2) The predicate and order have not regressed.** `IsSchoolEligible(SchoolFlags?)` (:163-164) is `company != null && IsActive != false && CDel != true`, the same OQ-39 rule as Round 7, with null = pass. :176 is its only caller.
- **Admin path:** `TAdmin` lookup (:65-66), then `SchoolPassesAsync` (:68), then `admin != null && active != false && del != true && schoolPasses` (:70-73). It is unchanged, and `TAdmin.IsActive` is still never read.
- **Regular-user path:** the school check (:93) still runs before the `TGroupPermissionUser` query (:113-116). "School fails" still returns `HasUserGroup=false` and all 5 MenuIDs false (:95-109).
- **Lookups and cache:** the group and menu lookups (:113-116, :137-140) are unchanged. The cache is still at :18 and :48-51 (RV-1 unchanged).

**(3) Do-not-modify and scope.** Glob mtime order puts `TimetableEndpointPolicy.cs`, `TimetableAuthorizationFilter.cs`, `TokenAuthenticationHandler.cs`, `Startup.cs`, `WebAPIController.cs`, `ITimetableMenuPermissionResolver.cs`, `TestSupport.cs`, `FilterTests.cs`, `IntegrationTests.cs`, `TAdmin.cs`, `MasterDataContext.cs` and `TCompany.cs` all before `SchoolPredicateTests.cs` < resolver < `ResolverTests.cs`. So this round wrote only the resolver and `ResolverTests.cs`, which agrees with the engineer's report. `TCompany.cs` is unchanged from Round 7: `single_authen`/`double_authen` are still `bool`, and `isActive`/`cDel` are `bool?`. That is fine, because the projection makes the two bools irrelevant to this lookup. `TAdmin.cs` is unchanged. No DDL.

**(4) RV-20 is resolved.** `ResolverTests.cs:38` seeds `ActiveSchool(db)`. The assertions at :42-45 are unchanged, and the test now runs the no-group-row branch. The other tests in the file (:48-183) are unchanged from Round 7 when read.

**Other findings:** New RV-21 (non-blocking, backend-engineer): the admin lookup at :65-66 still loads the whole `TAdmin`, with a non-nullable `id2`. This is the same class as RV-19, it predates BE-008, and the `TAdmin` DDL is unknown. Round 7 noted it inside RV-19; it now has its own row so it is not lost. RV-1 and RV-4 stay open for BE-009. Frontend items RV-7, RV-9, RV-11..RV-18 were not touched.

**Could not review**
- No diff (no shell). "Only the resolver and `ResolverTests.cs` changed" rests on reading and Glob mtime order.
- I did not run the build or the tests. I cannot confirm 109/109 myself.
- That the Npgsql provider translates `Select(new SchoolFlags(...))` into a two-column `SELECT` is EF Core's documented final-projection behaviour, not something I observed against a real master DB. Real `TCompany`/`TAdmin` nullability (D24) remains `devops`' pre-production check and the `security` gate.
- I could not run `sta context` (`$STA_CONTEXT_CMD`): this run has no shell tool. Module, phase and task came from the caller's packet.

### Reviewed (Round 8)

- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableMenuPermissionResolver.cs (1-179)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Models\TCompany.cs (1-36)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Models\TAdmin.cs (1-21)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\ResolverTests.cs (1-185)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\SchoolPredicateTests.cs (25-59; grep `FailCompanyLookup|HasQueryFilter|Throw`)
- C:\src\sb-api-academic-timetable-ai\ (Glob mtime order of `AITimeTableBackend*/**/*.cs`)

## Resolved findings — archived verbatim from `review.md` `## Open Findings` (2026-10-04, Round 9)

| ID | Severity | Location | Owner | Status | Finding |
|---|---|---|---|---|---|
| RV-2 | non-blocking | sb-api-academic-timetable-ai: AITimeTableBackend/Security/TimetableMenuPermissionResolver.cs:70-72, :95 | system-analyst | resolved | *(Round 7, BE-008: the contract now settles this. OQ-39/SA-Q21 is closed by design Rev 19 BR-76 (ก), so admin passes ⇔ row found AND `active != false` AND `del != true` (null = pass), with no `IsActive`. SA-Q23 is closed by the user on 2026-10-02 (design :2429, :2431), so `TGroupPermissionUser.IsDel != true` with null = not deleted. I read the code against both: admin at `TimetableMenuPermissionResolver.cs:70-72`, group lookup at `:114` (`IsActive == true && (IsDel == null \|\| IsDel == false)` ≡ `IsDel != true`). Both match, and nothing reads `TAdmin.IsActive` — the only `IsActive` reads are on `TGroupPermissionUser`/`TGroupPermissionMenu` at `:114` and `:138`.)* The resolver is stricter than the contract text. BR-76 (design §43.1) asks only for "a `TAdmins.id = admin_id` row + `TCompanies` active and not deleted", but the code also requires `admin.active != false` and `admin.del != true`. BR-74 lists `TGroupPermissionUser` as [SchoolID, UserID, IsActive], but the code also filters `IsDel`. Both extras fail closed. The pre-refactor BE-002 filter is not available to read, so I cannot tell whether BE-006 added these conditions (a behaviour change) or carried them over. SA should confirm whether BR-74/BR-76 ("same rule as `BypassAcademic.LoginAdmin`") include these conditions and amend the text to match. If they do not, the code must change back via the engineer. |
| RV-3 | non-blocking | sb-tech-upgrade-web-system: tests/lib/authHeaders.test.ts:63-155 | frontend-engineer | resolved | test-plan §S10 is not fully covered. Missing: the S10-A integration test (render a representative existing caller per FE-001 route + the real `sb-session-expired` receiver, mock 401, including fire-and-forget and `Promise.all` calls). Also missing: S10-A #4 (default + 403/404/500 must not clear the token) and #6 (no token + 401). Also missing: S10-B #2 (opt-out + 403/404/500) and #5 (opt-out 401 then default 401 — no leaked state). The code itself (`src/lib/authHeaders.ts:37-54`) behaves correctly when read; this is an evidence gap for the AC-063 regression. |
| RV-5 | blocking | sb-tech-upgrade-web-system: src/components/modals/home/create-teaching-schedule/LinkSubjectsModal.tsx:167-199 | frontend-engineer | resolved | Four raw `fetch(` calls to timetable proxy routes are still on the `/timetable/subject-settings/[year]` route (the modal is imported by `subject-settings/[year]/page.tsx:16`, rendered at :1069): `/api/school/{id}/years`, `/api/class-period/get`, `/api/school/{id}/years/{year}/plans`, `/api/school/{id}/level-classes`. Each one sends Bearer from `user.token`. But a 401 never reaches `notifySessionExpired`, and each chain is `.then(r => r.json())` … `.catch(() => {})`, so a 401 or 403 leaves the modal with empty lists and no message. This is the same defect class as FIND-P5-01 on one of the 7 routes. It breaks AC-063 ("every call of the 7 routes … 401 → SessionExpired … nothing silent on 401/403") and DES-018 §43.2. FIND-P5-01's list missed these calls because they live under `src/components`. Fix: move them to `timetableFetch` with default options and make 403 visible through the modal's existing error path. |
| RV-6 | blocking | sb-tech-upgrade-web-system: src/components/layout/home/manage-teaching-schedule/TimetableGrid.tsx:457-464 | frontend-engineer | resolved | There is still a raw `fetch(` to `/api/class-period/get` on the `/timetable/manage-teaching-schedule` route (the grid is imported at `manage-teaching-schedule/page.tsx:12` and rendered for every class at :1455). The call is reachable: the class grids receive only `periodGridData` (:1459), and that is `null` until `selectedTimetableItem` resolves to a period (`page.tsx:204-208`). With `null`, the skip at `TimetableGrid.tsx:452` does not fire. A 401 is read as JSON with `status !== 1` and only calls `onReady` (:464), so there is no SessionExpired and a 403 renders the default grid without any message. This breaks AC-063 and DES-018 §43.2 in the same way as RV-5. Fix: use `timetableFetch` with default options, keep the `signal`, and make a non-OK response visible. |
| RV-8 | non-blocking | sb-tech-upgrade-web-system: src/app/[locale]/timetable/manage-timetable/[year]/TeacherGroupsTab.tsx:519-529, :765-775 | frontend-engineer | resolved | Known follow-up, outside FIND-P5-01. These calls already go through `timetableFetch` (so 401 → SessionExpired works), but they end in `.catch(() => {})` and never check `res.ok`. A 403 on the `teacher-group/set-times` write therefore stays silent while the UI already shows the new times or the success modal. The caller listed the same pattern on loaders: `manage-teaching-schedule/page.tsx` ~138, 582, 874, 923, 1340 and the `create-class-period/[year]/page.tsx` loaders. Those I did not re-read this round. The two `set-times` sites here are writes, so they come closest to "shows success on 403" (AC-063). |
| RV-10 | non-blocking | sb-tech-upgrade-web-system: src/app/[locale]/timetable/create-class-period/[year]/_components/add-class-period-modal.tsx:191-197; create-class-period-form.tsx:259, :287, :477-485 | system-analyst | resolved | *(Round 5, FE-018: SA ruled in design Rev 17 §43.2b item 1 / AC-066 that a 401 shows SessionExpired only. Fix read at `add-class-period-modal.tsx:191-192` and `create-class-period-form.tsx:259, :288, :479`, plus every other site on the 7 routes, re-derived in Round 5.)* On 401 these paths show SessionExpired (through `timetableFetch`) and also a "Request failed: 401" toast, because `!res.ok` throws into the existing toast. `manage-teaching-schedule/page.tsx:1136` suppresses the toast for 401, so the touched pages are now inconsistent. DES-018 §43.2 does not say whether a 401 may also show the page's error message. SA should decide; the engineer then aligns the sites. |
| RV-19 | blocking | sb-api-academic-timetable-ai: AITimeTableBackend/Security/TimetableMenuPermissionResolver.cs:164-169; AITimeTableBackend/Models/TCompany.cs:18, :20 | backend-engineer | resolved | *(Round 8, BE-008: fix read at `TimetableMenuPermissionResolver.cs:159-177`. `SchoolPassesAsync` now runs `.Where(c => c.nCompany == schoolId).Select(c => new SchoolFlags(c.isActive, c.cDel)).FirstOrDefaultAsync()` (:172-175). Only the two `bool?` predicate columns are selected, so `single_authen`/`double_authen` are never materialized. No row gives `null` → `IsSchoolEligible` false → not found (D3). The single predicate `IsSchoolEligible(SchoolFlags?)` (:163-164) is unchanged in logic, and :176 is its only caller for both paths. A code note at :168-171 states why the projection is there and that the in-memory provider cannot reproduce the failure. That meets the "test or code note" ask. The related `TAdmin` lookup is now tracked as RV-21.)* `SchoolPassesAsync` loads the **whole** `TCompany` entity (`FirstOrDefaultAsync` at :166-167). The model still maps `single_authen` and `double_authen` as non-nullable `bool` (`TCompany.cs:18, :20`), but `school_db.sql:1193-1194` declares both `BOOLEAN NULL DEFAULT NULL`. On Npgsql (`MasterDataContext.cs:20`), EF Core throws when it reads a NULL into a non-nullable property. So any school row with NULL in either column throws. The filter (`TimetableAuthorizationFilter.cs:205-209`) and `MenuPermissions/Get` (`WebAPIController.cs:2861-2865`) catch that as a lookup failure → 403 on every checked endpoint, plus 403 on `MenuPermissions/Get` (Sidebar `checkFailed`), **even when `isActive`/`cDel` pass**. Before BE-008 the regular-user path never read `TCompany`. So for regular users this is a new lockout of whole schools against the Rev 18 baseline (plan BE-008 AC-062/AC-064 regression, plan.md:731). It is the same defect class the task exists to remove: AC-072 / plan.md:729 say "ไม่ใช่ 403 จากการอ่านแถวล้ม", plan.md:715 says "ค่า null ต้องไม่ทำให้การอ่านแถวล้มกลายเป็น 403", and test-plan.md:132 rests that proof on reading the code ("query ไม่บังคับค่าเป็น non-null"), which this query fails. The in-memory tests cannot catch it: the fixtures leave both bools at `false`, and the provider does not enforce column nullability. The dump is stale (D24), so real nullability is unknown, and the contract asks for code that is correct either way. Fix, inside the allowed scope (model/query mapping, no DDL): project the lookup onto the predicate columns only, for example `.Where(c => c.nCompany == schoolId).Select(c => new { c.isActive, c.cDel }).FirstOrDefaultAsync()`, keeping `null` = not found, with `IsSchoolEligible` as the one decision. Alternatively make the two properties `bool?`. Either way, add a test or a code note showing the lookup reads only the nullable predicate columns. *(Related, pre-existing, not counted as blocking: the admin lookup at :65-66 also loads the whole `TAdmin`, whose `id2` is a non-nullable `int` (`TAdmin.cs:19`). The `TAdmin` DDL is not in `school_db.sql`, so I could not tell whether it is nullable. Projecting that lookup onto `active`/`del` would close the same class on the admin path.)* |
| RV-20 | non-blocking | sb-api-academic-timetable-ai: AITimeTableBackend.Tests/ResolverTests.cs:34-44 | backend-engineer | resolved | *(Round 8: `ResolverTests.cs:38` now seeds `ActiveSchool(db)`, so the test runs the no-group-row branch (`TimetableMenuPermissionResolver.cs:118-135`) again. Its assertions at :42-45 are unchanged.)* `NoGroupRow_ReturnsHasUserGroupFalse_AllMenusFalse` was not given `ActiveSchool(db)`. Since BE-008 it passes through the school-not-found branch (`TimetableMenuPermissionResolver.cs:93-110`), not the no-group-row branch (`:118-135`) its name describes. Its assertions are unchanged and still hold, so this is not a reduced assertion. But the test now duplicates D3 and no longer tests what its name says. The no-group branch with a passing school is still covered by `InactiveOrDeletedOrOtherSchoolGroupRow_CountsAsNoRow` (:47-58) and `D17_GroupRow_IsDelTrue_NotCounted` (`SchoolPredicateTests.cs:321-330`), so no behaviour is unprotected. Fix: add `ActiveSchool(db)` so the test exercises its own branch again. |

---

## Review Round 9 — BE-009

**Verdict:** ✅ Approved

This is an independent review by `reviewer` of BE-009 (timetableai Phase 5; RV-1 + RV-4; AC-062 regression, AC-064 API part, AC-071/AC-072 coverage; DES-018 BR-74/BR-76, DES-022 BR-88). The user gave the session date, 2026-10-04. Scope is backend only: FE-019/FE-020 are out of scope, and their findings were not touched. I read the code and ran nothing. The engineer reports `dotnet build` with 0 errors and `dotnet test` 138/138 passed. Those are the engineer's results, not this review's, and this is not QA verification. I did not read `qa.md` or `../security.md`. Round 8 was moved verbatim to `review/phase-5.md`.

**(1) The cache key is right, and BE-008 has not regressed.**
- The cache is `Dictionary<(SchoolId, UserId, AdminId), …>` (`TimetableMenuPermissionResolver.cs:20`). The key at :50 folds null and `""` into one `adminId`. That is correct, because :74 uses `IsNullOrEmpty`, so both values take the same branch.
- Exceptions are not cached (:56-57), so a failed lookup is retried and still reaches the VR-20 `catch` blocks → 403.
- `ResolveUncachedAsync` (:61-160) has the same body as Round 8, shifted by 11 lines:
  - Admin: :76-84, `active != false && del != true && schoolPasses`.
  - School before group rows: :102.
  - Group `IsDel`: :121. Menu lookup: :143.
  - `IsSchoolEligible`/projection: :164-180.
- Nothing reads `TAdmin.IsActive`. The `ClaimsPrincipal` overload (:30-46) still delegates to the keyed overload.

**(2) The cache is scoped to one request.** The resolver is registered with `AddScoped` (`Startup.cs:87`). The filter is added by type (`Startup.cs:88, :92`), so it is built per request with the request-scoped resolver, and the controller takes the same scoped instance. Nothing is cached across requests, which BR-74 requires. The `Dictionary` is not shared between threads: one request scope, used one call at a time.

**(3) The tests would fail if the bugs came back.**
- **RV-1:** With the old single-slot cache, every test at `Be009Tests.cs:38-103` would fail its second assertion:
  - pass → school not found (:50-51)
  - not found → pass (:66-67)
  - admin → user without rows (:83-85)
  - same user, other school that is inactive (:101-102)

  `PerRequestCache_SecondCallDoesNotRequery` (`ResolverTests.cs:159-176`) is unchanged and covers S13-D (5).
- **RV-4:**
  - **Real filter vs. real resolver** (`Be009Tests.cs:167-201`): each single-menu user (all 5 MenuIDs, `W` and `R`) compares the real filter's decision on the §S1-C representative read and write actions with the real resolver's `isRead`/`isWrite`, and also checks the absolute values. I checked that every action name is in the policy table (`TimetableEndpointPolicy.cs:71-106`). An unmapped name would return 403 and fail `Assert.True(entry.IsRead)`.
  - **Negative case:** "402 only" is checked in-process (:203-215) and over HTTP (:298-308).
  - **`MenuPermissions/Get` over HTTP:** each single-menu user goes through the real resolver on `RealResolverApiFactory`, which keeps the real registration and swaps only the master DB (:272-296).
  - **Admin:** checked on the real resolver (:217-232, :310-321).
  - **Limit:** the per-page filter comparison drives the filter directly with a hand-built `ActionExecutingContext` (:136-152), not through HTTP routing. An allowed action would reach Postgres. Only the 402/`Setting/Get` denial goes end to end. I accept this as the in-process integration the plan asks for.
- **AC-071/AC-072:** integration coverage is BE-008's real-resolver I layer (`SchoolPredicateTests.cs:517-643`, reviewed in Rounds 7/8). The plan allows citing it. The AC-071 cache swap has no test → RV-22 (non-blocking).

**(4) No assertion was weakened, as far as reading shows.** `MenuPermissions_ValidAdmin_AllTrue` (`IntegrationTests.cs:174-185`) changes only its input: the result is now `IsAdmin=true`/`IsAdminValid=true`, and the token carries `admin_id`. The expectations are unchanged: `AssertFiveMenus` plus `isRead` true on every menu. I compared the other tests in `IntegrationTests.cs` with what Rounds 1/7 describe, not with a diff.

**(5) Do-not-modify.** In Glob mtime order, `TimetableEndpointPolicy.cs`, `TimetableAuthorizationFilter.cs`, `Startup.cs`, `WebAPIController.cs`, `ITimetableMenuPermissionResolver.cs`, `TestSupport.cs`, `FilterTests.cs`, `SchoolPredicateTests.cs` and `ResolverTests.cs` all come before the resolver < `IntegrationTests.cs` < `Be009Tests.cs`. That agrees with the engineer's list. The exception is `TCompany.cs`, which moved after `ResolverTests.cs` and was not reported → RV-23 (non-blocking; by reading, its meaning is unchanged). No DDL. No `appsettings.json` secret is used, because the tests go through the `RealResolverApiFactory` config override.

**(6) No scope creep.** The production change is only the cache key and the split into `ResolveUncachedAsync`. The why-comment at :18-19 cites RV-1/BR-74. RV-21 (whole-`TAdmin` load, now :76-77) was not touched, which is correct for this task. It moves to `→ backlog`.

**Could not review**
- I had no diff (no shell). "Only these files changed" and "no assertion weakened" rest on reading and Glob mtime. QA can confirm with `git diff 0beb200` on the three files plus `TCompany.cs`. If the `TCompany.cs` touch happened before that commit, the diff will be empty.
- I did not run the build or the tests, so I cannot confirm 138/138 myself.
- Real master DB behaviour (TP-D2, D24) is outside a code review.

## Reviewed

- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableMenuPermissionResolver.cs (1-183)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\Be009Tests.cs (1-324)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\IntegrationTests.cs (1-250)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\TestSupport.cs (1-114)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\SchoolPredicateTests.cs (25-94, 440-484)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend.Tests\ResolverTests.cs (155-184)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\TimetableAuthorizationFilter.cs (30-216)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Security\ITimetableMenuPermissionResolver.cs (1-49)
- C:\src\sb-api-academic-timetable-ai\AITimeTableBackend\Models\TCompany.cs (1-36)
- C:\src\sb-api-academic-timetable-ai\ (grep `Startup.cs` registrations; grep `ResolvePermissionsAsync`, `_cache`, policy action names in `TimetableEndpointPolicy.cs`; Glob mtime order of `AITimeTableBackend*/**/*.cs`; `.git/logs/HEAD`)

## Resolved findings — archived verbatim from `review.md` `## Open Findings` (2026-10-04, Round 10; RV-1/RV-4 resolved in Round 9, RV-11/RV-12/RV-14 resolved in Round 10, RV-21/RV-22 → backlog)

| ID | Severity | Location | Owner | Status | Finding |
|---|---|---|---|---|---|
| RV-1 | non-blocking | sb-api-academic-timetable-ai: AITimeTableBackend/Security/TimetableMenuPermissionResolver.cs:47-50 | backend-engineer | resolved | *(Round 9, BE-009: fix read at `TimetableMenuPermissionResolver.cs:20, :48-59`. The cache is now `Dictionary<(SchoolId, UserId, AdminId), UserMenuPermissions>`, keyed on all three arguments; null and empty `adminId` share one key, which matches the admin test `IsNullOrEmpty` at :74. The resolver is `AddScoped` (`Startup.cs:87`), so the cache lives one request. Tests at `Be009Tests.cs:38-116` would fail if the old single-slot cache came back.)* The per-request cache `_cachedPermissions` is returned whatever `(schoolId, userId, adminId)` is passed. The public overload at :45 takes identity arguments, so a second call in the same scope with different arguments would silently get the first caller's permissions. Today each request makes only one call (filter or endpoint), so the result is correct now. BR-74 asks for a per-request cache only. Key the cache on the arguments, or drop the argument overload, so the cache cannot hand out another identity's permissions. |
| RV-4 | non-blocking | sb-api-academic-timetable-ai: AITimeTableBackend.Tests/IntegrationTests.cs:33-38, :174-181 | backend-engineer | resolved | *(Round 9, BE-009: S1-C on the real resolver + real filter for all 5 MenuIDs, `W` and `R` rows (`Be009Tests.cs:167-201`); the negative case "402 only → `Setting/Get` denied, `isRead(403)=false`" in-process (:203-215) and over HTTP (:298-308); `MenuPermissions/Get` per single-menu user over HTTP on the real resolver (:272-296); the admin path on the real resolver (:217-232, :310-321). `MenuPermissions_ValidAdmin_AllTrue` now feeds an `IsAdmin=true`/`IsAdminValid=true` result with an `admin_id` token, and its assertions are the same (`IntegrationTests.cs:174-185`). AC-071/AC-072 integration stays on BE-008's real-resolver I layer (`SchoolPredicateTests.cs:517-643`).)* The integration host replaces the real resolver with a singleton `FakePermissionResolver`. AC-064 "`isRead`/`isWrite` match the filter's decision on that page's read/write endpoints" is therefore never checked end-to-end through the real resolver. Real-resolver logic is covered only by `ResolverTests.cs`. Also, `MenuPermissions_ValidAdmin_AllTrue` (:174-181) feeds `Grants(...)` (`IsAdmin=false`) rather than an admin result, so the integration layer never checks the admin path (BR-76). Add at least one in-process case with the real resolver on an in-memory `MasterDataContext`, plus an admin-shaped fake. *(Round 7, BE-008: partly addressed. `SchoolPredicateTests.cs:443-472` (`RealResolverApiFactory`) keeps the real resolver and swaps only the master DB. Its cases at `:517-643` run the admin path (D8–D11, D13) and school/`IsDel` cases end to end. Still open for BE-009: the S1-C per-MenuID matrix (`isRead`/`isWrite` = filter decision per page), and the `Grants(...)` input to `MenuPermissions_ValidAdmin_AllTrue` at `IntegrationTests.cs:174-181`, which is unchanged.)* |
| RV-11 | non-blocking | sb-tech-upgrade-web-system: src/components/layout/home/manage-teaching-schedule/TimetableGrid.tsx:466-477, :573; src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts:931-935 | system-analyst | resolved | *(Round 10, FE-019: SA-Q19 = A implemented and fix read — the grid now reports `onReady({ ok: false })` for a failed period load (`TimetableGrid.tsx:486, :561, :594`; 401 stays silent), `handleGridReady` records `gridLoadFailed` and cancels the pending Generate (`use-timetable-generation.ts:993-1003`, :1013-1016, :955-963), so Generate never runs on `DEFAULT_ROWS`; details in `review.md` Review Round 10 — FE-019.)* When the period load fails (403/other non-OK → `null` → `onReady` at :477; network error → `onReady` at :573), the grid still reports ready. It keeps `DEFAULT_ROWS`/`DEFAULT_TIMES` (the Figma placeholder 09:00–14:00, not the school's period structure). `handleGridReady` counts it as ready, and once every expected grid has reported, `fireGeneration` runs Generate on the placeholder rows. So yes: on 403 Generate can run on an incomplete grid. This is **not a regression**. Before the fix, a 403 body `{status:0}` reached the same `onReady`, and FE-001 asked that the generate gate stay unchanged. The fix only adds the visible toast, which meets AC-063 "not silent". DES-018 §43.2 does not say whether a failed period load should cancel or hold a pending Generate. SA should decide; the engineer then gates `fireGeneration` on a successful load (for example, report ready with a failed flag and abort the pending generation). |
| RV-12 | non-blocking | sb-tech-upgrade-web-system: src/app/[locale]/timetable/manage-teaching-schedule/page.tsx:120-159, :342, :1426; page.tsx:588-604; _lib/use-timetable-generation.ts:85-104, :114-154; src/app/[locale]/timetable/settings/[year]/page.tsx:198-231, :233-296 | system-analyst | resolved | *(Round 10, FE-019: SA-Q19 = A implemented and fix read — (a) the page no longer hangs on a failed load: the spinner gate is `isScheduleDataReady || requiredLoadFailed` (`page.tsx:1493`, :354) and each required load sets its own failed flag (`page.tsx:123, :222, :225-226`; `use-timetable-generation.ts:96-119, :127-181`); (b) no required load sets its loaded flag in `finally` any more (success-only: `page.tsx:158, :624`; hook :113, :172), and `generationBlocked` (`use-timetable-generation.ts:952`; composed with the page flags at `page.tsx:327`) gates the Generate/Save handlers (`page.tsx:462, :631`) and the disabled controls (`CourseListPanel.tsx:280, :296`); (c) `settings/[year]` Save is gated on `settingsLoaded` (`settings/[year]/page.tsx:202, :247, :713`) — details in `review.md` Review Round 10 — FE-019.)* When a required generation input fails to load, the pages now behave inconsistently. DES-018 §43.2 only says 401/403 must not be read as a normal `{status}`; it does not say what a failed load should do. (a) **Fail-closed:** `/api/setting/get` failing (non-OK or network) leaves `settingsLoaded=false`, so `isScheduleDataReady` stays false and the **whole page** shows the "loading" spinner (:1426) with no retry. That covers the new-schedule entry point and restore, not only Regenerate. A legitimate user who hits a transient 5xx/network error sees a toast that fades, then a page that says "loading" forever until they reload. (b) **Fail-open:** `subject-settings/get` (page.tsx:603), `timetable/get-all-by-year` (:103) and `teacher-group/get-all` (:153) still set their loaded flag in `finally`. Generate can then run without link-subject priorities, cross-timetable teacher conflicts and teacher unavailability, and the result can be saved. (c) `settings/[year]`: if `setting/get` fails, the form stays blank. A user who types the three required numbers (`isFormValid` :233-239) and presses Save overwrites the school's individual/exception/homeroom settings with defaults. **Why this does not block AC-063:** every one of these failures is now visible (toast). Under §43.2a, a 403 on these reads means the user lacks the page's read menu (`Setting/Get`=403/401, `Timetable/GetAllByYear`=401, `TeacherGroup/GetAll`=402/401, `SubjectSettings/Get`=422/401), so the matching writes (`Timetable/Set`, `Setting/Set`) also return 403 and nothing wrong can be saved. The data risk in (b)/(c) comes only from transient non-403 failures, and it existed before this change, silently. SA should set one rule: should a failed required load block Generate/Save (with retry) or the whole page? The engineer then aligns (a)–(c). Related to RV-11. |
| RV-14 | non-blocking | sb-tech-upgrade-web-system: src/app/[locale]/timetable/manage-teaching-schedule/page.tsx:1156-1166 | frontend-engineer | resolved | *(Round 10, FE-019: the restore block was rewritten onto `settleRequiredLoad` and the shared two-argument `readJsonOrNotify` — the local shadow no longer exists; the only uses are the import (:4) and the shared helper calls at `page.tsx:917, :941, :959, :1342, :1422`. FE-020's item (4) is thereby already satisfied; judge the final shape in FE-020's own round.)* The restore block declares a local `readJsonOrNotify = (r: Response) => …`. It shadows the `readJsonOrNotify(res, toastId)` imported at :4, which has a different signature and is used throughout the same file. Behaviour is the same (403/other → `Request failed: <status>` with id `restore-schedule-data`, 401 silent), so this is not a defect. But a later edit that calls the import inside this block would silently get the 1-argument local. Use the shared helper with id `"restore-schedule-data"` (as :999 already does), or rename the local. |
| RV-21 | non-blocking | sb-api-academic-timetable-ai: AITimeTableBackend/Security/TimetableMenuPermissionResolver.cs:65-66; AITimeTableBackend/Models/TAdmin.cs:19 | backend-engineer | → backlog | *(Round 9: still there, now at `TimetableMenuPermissionResolver.cs:76-77`. BE-009 did not grant this change.)* This is the defect class of RV-19, on the admin path, and it predates BE-008 (BE-006). The admin lookup `TAdmin.AsNoTracking().FirstOrDefaultAsync(a => a.id == adminId)` still loads the whole `TAdmin`, and `id2` is a non-nullable `int` (`TAdmin.cs:19`). If the real `TAdmin.id2` column allows NULL, an admin whose row has NULL there would throw on Npgsql → lookup failed → 403 on every endpoint plus `MenuPermissions/Get`, even when `active`/`del` pass. The `TAdmin` DDL is not in `school_db.sql`, so I cannot tell whether the column is nullable (D24). It is not blocking because BE-008 did not introduce it, and nothing shows the column is nullable. Fix, same as RV-19: project onto `active`/`del` only (keeping `null` = not found), or confirm `id2` is NOT NULL in the real master DB. |
| RV-22 | non-blocking | sb-api-academic-timetable-ai: AITimeTableBackend.Tests/Be009Tests.cs:26-117 | backend-engineer | → backlog | The cache-swap tests cover AC-072 (school not in the register :38-68, inactive school :88-103) and admin-then-user (:70-86). But no test covers the AC-071 swap the plan's BE-009 AC names: a passing identity, then an inactive or deleted admin in the same resolver instance, or the reverse. The code is right when read: `adminId` is part of the key (`TimetableMenuPermissionResolver.cs:50`), so a different admin can never get a cached result. This is an evidence gap, not a defect. Fix: add one `[Fact]` with `Admin(db, "a2", false, false)` after a passing identity, and the reverse order. |


## ประวัติข้อกำหนดเอกสารที่ยกเลิก — 2026-10-05

ข้อความต่อไปนี้เป็นประวัติเดิมเท่านั้น; ผู้ใช้ยกเลิกเพดานขนาดเอกสารแล้ว 2026-10-05

### review.md — Change Log เดิม

- 2026-10-04 (session date from the user) — `reviewer` Review Round 9 for BE-009 (RV-1 + RV-4; backend only): ✅ Approved. RV-1 resolved: the cache is keyed on `(schoolId, userId, adminId)` and is request-scoped (`AddScoped`). The BE-008 predicate, order and null rules are unchanged. RV-4 resolved: S1-C on the real resolver + real filter for all 5 MenuIDs, plus the 402-only negative case, `MenuPermissions/Get` over HTTP, and an admin-shaped `MenuPermissions_ValidAdmin_AllTrue` with its expectations kept. New non-blocking RV-22 (→ backlog: no test for the AC-071 cache swap) and RV-23 (`TCompany.cs` written after Round 8 but not reported; meaning unchanged by reading). RV-21 → backlog. Archived verbatim (size budget): Round 8 and the resolved rows RV-2/3/5/6/8/10/19/20 → `review/phase-5.md`; the Phases 1–3 verification sections → `review/phase-3.md`.

### review.md — Change Log เดิม

- 2026-10-04 (วันที่ผู้ใช้ระบุ) — `reviewer` Review Round 10 for FE-019 รอบแก้ (design Rev 20 §43.2b ข้อ 5; task ยัง pending): ✅ Approved. ข้อ 2–4 (a)–(d) ออกพร้อมกันต่อหน้า + 5.1–5.6 ครบตามการอ่านโค้ด; drift Rev 20 ทั้ง 7 จุดหาย · จุดที่ engineer ฝาก (premise ของ 5.1 กับ `localStorage.schedules` → `restoreLoadFailed` บน `timetable/get` ล้ม) ตัดสินว่าโค้ดถูกต้องตาม AC-068/AC-067 และ SA-Q24 = A — ไม่ใช่ contract gap ที่ขวางงาน; สิ่งที่เหลือเป็นงาน amend ถ้อยคำสัญญา → RV-24 ใหม่ (non-blocking, `system-analyst`) · ปิด RV-11, RV-12, RV-14 (resolved — อ่าน fix แล้ว) · ย้าย verbatim ไป `review/phase-5.md`: Round 9 + แถว RV-1, RV-4, RV-11, RV-12, RV-14, RV-21, RV-22 (งบขนาดไฟล์ §4) · `review.md` ยังเกินงบ 20 KB แม้ archive แล้ว (แถว open รวม ~10 KB) → รายงานเป็นประเด็น release-cut ให้ผู้ใช้ · ไม่รัน build/test; งาน FE-020 ที่อยู่ใน worktree เดียวกันไม่ได้ตัดสินในรอบนี้
