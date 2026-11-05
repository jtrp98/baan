# timetableai — QA Round 9 — FE-021

> Budget ≤ 10 KB · qa-engineer · solo หลัง fix2/review11 · วันที่ผู้ใช้ jtrp98 09/10/2026
> F = C:/src/schoolbright/target/sb-tech-upgrade-web-system; B = C:/src/schoolbright/target/sb-api-academic-timetable-ai. Evidence paths ด้านล่าง resolve ใต้ F เว้นแต่ระบุ B.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | open — auth regression fixtures ทำ full suite ล้ม; gate 4 พัก |

## Round 9

**Status:** ❌ Failed

### Checks run

อ่าน scripts จริง; รันเองจาก F ไม่มี code/dependency/config fix.

| Check | Command | Result |
|---|---|---|
| typecheck | `npm run type-check` | pass exit 0; ไม่มี warning |
| scoped lint | `npm run lint -- 'src/app/[locale]/timetable/page.tsx' 'src/app/[locale]/timetable/[year]/page.tsx' 'src/app/[locale]/timetable/settings/[year]/page.tsx' 'src/app/[locale]/timetable/subject-settings/[year]/page.tsx' 'src/app/[locale]/timetable/create-class-period/[year]/page.tsx' 'src/app/[locale]/timetable/manage-timetable/[year]/page.tsx' 'src/app/[locale]/timetable/manage-timetable/[year]/teacher-groups-tab.tsx' 'src/app/[locale]/timetable/manage-timetable/[year]/main-teaching-grade-tab.tsx' 'src/app/[locale]/timetable/manage-teaching-schedule/page.tsx' 'src/app/[locale]/timetable/_hooks/use-timetable-terms.ts' 'src/app/[locale]/timetable/_components/timetable-term-context-bar.tsx' 'src/lib/timetable-required-load.ts' 'src/lib/timetable-request-failure.ts' 'tests/integration/timetable-fe021-term-context.test.tsx' 'tests/integration/timetable-401-silent-subject-settings.test.tsx' 'tests/integration/timetable-401-silent-manage-timetable.test.tsx' 'tests/integration/timetable-403-visible.test.tsx'` | pass exit 0; 0 errors/6 warnings ที่ workspace page:97,226,865,872 (2),1524 — unused vars/hook dependencies |
| build | `npm run build` | exit 1 ก่อน compile: Failed to load next.config.mjs / Failed to load native binding / ERR_SWC_NATIVE_CACHE; AppData/Local DACL grants replacement rights |
| build environment retry | `$env:SWC_NATIVE_BINDING_CACHE='0'; npm run build` | exit 1 error เดิม; documented temporary mode จาก installed @swc/core-win32-x64-msvc/README.md ไม่แก้สภาพเครื่อง |
| full tests | `npm test` | exit 1; 93 files = 92 passed/1 failed; 1046 tests = 1040 passed/6 failed/0 skipped; 36.43s |

Build environment blocker แยกจาก QA-006; SWC probe รับ env0 แต่ใช้ AppData cache เดิม. Tests มี jsdom scrollTo/navigation/canvas warnings. Backend/browser/manual E2E not run.

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| FE-021 | blocked | ❌ Failed full suite (QA-006); build environment blocked; review11 PASS ไม่แทน checks |

### Feature QA flows

ไม่ใช่ Feature QA; test-plan/index.md ไม่มี Phase8 TP. หลักฐาน = mocked integration/source; T = tests/integration/timetable-fe021-term-context.test.tsx, W = src/app/[locale]/timetable/manage-teaching-schedule/page.tsx.

| AC / flow | Result | Evidence |
|---|---|---|
| AC-026 UI term/bridge/S1 | ⚠️ Partial | T:191,219,269 ผ่าน; W:835,991,1426,1451; B WebAPIController.cs:2818 same-term/NULL; live DB ไม่รัน |
| AC-027 Terms/no guessed term | ✅ Verified automated | hook:79–99; T:129–170 ผ่าน fail/empty/singleton/scoped selection |
| AC-065 paired cutover | ⚠️ Partial | frontend พร้อมส่ง term; QA6 BE-010 readiness; DDL/backfill/deploy hold |
| AC-066 401 silent | ⚠️ Partial | changed silent suites ผ่าน; request-failure:16/auth-headers:109; existing auth suiteแดงจาก prerequisites QA-006 |
| AC-067 loading ends | ✅ Verified automated | T:298–342 + 403-visible:286–324 ผ่าน; W:1626/1757 ไม่มี spinner/empty หลัง failed |
| AC-068 disabled/no writes | ✅ Verified automated | T:439–449; settings:274,755; tab fieldsets:354/157; W:720,1641 |
| AC-069 cancel pending Generate | ✅ Verified automated/source | FE-019 guards suiteไม่ล้ม; use-timetable-generation:1036–1051 cancels/denies beginGeneration; liveไม่รัน |
| AC-070 reload/no retry | ✅ Verified source | required-load guards; call sitesไม่ส่ง onRetry; unsigned retry/copy ยังพัก |
| URL/cache/preselect | ✅ Verified automated | T:378–419 opaque/query retention/school-year/invalid singleton/late Terms |
| Dirty cancel/confirm/history | ✅ Verified automated | T:452–495 settings/wizard; subject/class-period modal guard source-only |
| Stale VR rejection | ✅ Verified automated | T:497–514; required-load:25–36 staleไม่clear/toastบริบทใหม่ |

### Review findings

| Finding | Result | Evidence |
|---|---|---|
| REV-006 | ✅ Verified automated | T:432 status -1 visible; [year]/page:105 |
| REV-007 | ✅ Verified automated | T:421 four localized VR8/9 literals; request-failure:43/B Messages:39–40 |
| REV-008 | ✅ Verified automated | T:439; subject-settings:208/class-period:61/groups:211 gates |
| REV-009 | ✅ Verified automated | T:452–495; settings:219 + parent keyed tabs:128–131 |
| REV-015 | ✅ Verified automated | T:320/403-visible:286; W:1626/1757/1641 failure stops loading and disables writes |
| REV-010 | ⚠️ Partial backlog carry | review11 → hub/year navigation Minor from review8; ไม่เปิดแก้ |
| REV-011 | ⚠️ Partial backlog carry | review11 → create-class-period-form:223 Minor; ไม่เปิดแก้ |
| REV-012 | ⚠️ Partial backlog carry | review11 → timetable-grid:459 Minor; ไม่เปิดแก้ |
| REV-013 | ⚠️ Partial backlog carry | review11 → settings:745 Minor; ไม่เปิดแก้ |
| REV-014 | ⚠️ Partial backlog carry | review11 → UX-007 draft metadata; ไม่ใช่ full sign-off |

### Data Model check

อ่าน data-model.mdเต็ม. FE-021ไม่แก้schema/DDL; sourceตรง §27.5:

| Field | Result / actual evidence (B Models/) |
|---|---|
| Tbl_Setting.sTermID/nYear | ✅ Verified source; Tbl_Setting.cs:12–13 string (legacy NULL)/int? |
| Tbl_ClassPeriod.sTermID/nYear | ✅ Verified source; Tbl_ClassPeriod.cs:12–13 string/int? |
| Tbl_TeacherClassAssignment.sTermID/nYear | ✅ Verified source; Tbl_TeacherClassAssignment.cs:11–12 string/int? |
| Tbl_Timetable.sTermID/nYear | ✅ Verified source; Tbl_Timetable.cs:12–13 string/int |
| Request sTermID | ✅ Verified source; Request.cs:131,163,262,311,343 ↔ settings:294/period:111/assignment:597/W:835 |
| TermItem | ✅ Verified source; types/timetable.ts:188–193 ↔ B Terms:178–181 stringkey/label/dates; null label fail-closed |
| Derived children | ⚠️ Partial; groups/link/grid deriveparent ไม่เพิ่มtermซ้ำ; realDBไม่รัน |

§27.6 future schema/§27.7 intensity-legacy ไม่รับรองงานนอกscope. Provenance correctionไม่ใช่schema approval; dev≠DDL/deploy approval.

### Issues Found (defect packet)

#### QA-006

- **Task:** FE-021 · **Severity:** Important · **Owner:** frontend-engineer; gate4 parked.
- **Expected:** full auth suiteผ่าน พร้อม valid term/required-load preconditions; ไม่ปลด app gates เพื่อผ่าน test.
- **Actual:** session-expired.test.tsx failed6: 3 routesเห็น SessionExpiredแล้วแต่ expected endpoint:172 false; add-teacher401/403/200 ติดdisabled:345.
- **Reproduce:** TP=null; full test commandข้างบน. installFetch:91–104 denies /terms401; global sTermID:144 ไม่ใช่ scoped candidate. routed default:285 data=[] ทำclass-periodผิดรูป; cases:349–390 ขาดperiod rule.
- **Evidence:** 6 failed/1040 passed; hook:79–86 และ groups:211–217/354 fail-closedถูกต้อง. Failureนี้ไม่พิสูจน์production auth bug.
- **Proposed remedy (ไม่เขียน):** ขอ humanขยาย test Write path `tests/integration/timetable-session-expired.test.tsx`: setup Terms200/scoped termก่อนยิง401endpointเดิม; add-teacher setupperiod `{status:1,data:{lstPeriods:[]}}`; คง Terms401/no-term/malformed fail-closed tests.

**Gate4:** review8 + review10 + QA9 = third failed FE-021round หลังfix2; SEC-03review9/QA8ไม่นับ. No autonomousfix; driverถาม accept / send back (fixture scope) / re-scope. Buildenvironmentให้ownerเครื่อง/DevOpsแก้แยก.
🔒 Phase8 markerมีอยู่แล้ว คงเดิม; auth/untrusted URL/storage. QAไม่ปิดSEC-01/02หรืออนุมัติproduction.

## Unverified Behaviour — undeployed phases

- CarryQA6 Phase8: liveBE-010/sharedDB, DDL4tables/backfillAC-028/NULLlegacy/pairedcutoverAC-065/SA-Q8/manual7routes ไม่รัน; buildartifactblocked.
- Multi-tab/live school-switch/staleHTTPทุกlocale + keyboard/focus/contrast/responsive/extremetext ไม่ตรวจ.
- UX-007 approvedsubset jtrp98 09/10/2026; precise copy/details/retry/UX-005/fullsignoffยังhold.
- CarryQA8 SEC-03: menu upstream/periodJSON/liveDB/deepJSON ไม่E2E; DLLversionไม่พิสูจน์production. SEC-03ไม่ใช่FE-021proof.
- CarryQA8 Phase6 FE-011: SA-Q14 master MenuID401..404,422/permissions/Type/Role + TP-D2/authmasterdata รอDevOps/ownerตรวจ.
- SEC-01/02 production + DDL/deploy/schema-owner holdsคงเดิม; ไม่released/รับงานแทนคน.

## Change Log

- 2026-10-09 — Round9 FE-021 ❌ Failed: full suite6 failures (QA-006), SWC build environment blocked; plan Status blocked; gate4 parked. วันที่ผู้ใช้ jtrp98 09/10/2026.

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
