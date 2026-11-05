# timetableai — QA Round 15 — FE-021

> qa-engineer · solo · Phase 8 · วันที่ผู้ใช้ 2026-10-11 / jtrp98 · additional fixture-only round ตามคำตอบ “ทำตามคำแนะนำเลย”; ไม่ reset fix1/fix2 หรือ third-failure history
> F = C:/src/schoolbright/target/sb-tech-upgrade-web-system; B = C:/src/schoolbright/target/sb-api-academic-timetable-ai. Code evidence resolve ใต้ F เว้นแต่ระบุ B. ใช้ templates/qa-round.md; ผู้ใช้ยกเลิกงบเอกสารแล้ว.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | resolved ด้าน fixture — session-expired 43/43 และ full suite 1049/1049 ผ่านจริงรอบนี้; build environment hold แยก ยังทำ task blocked |

## Round 15

**Status:** ❌ Failed

Fixture correction PASS แต่ required build exit1 ก่อน compile จึง output FAIL / FE-021 blocked. ไม่พบ app defect ใหม่จากการตรวจนี้; ไม่อนุญาตแก้ code ต่ออัตโนมัติ. review13 PASS เป็น static review ไม่แทน QA.

### Checks run

อ่าน scripts จาก F/package.json และรันเองจาก F; ไม่ใช้ implementer logs เป็นผลตน.

| Check | Command | Result |
|---|---|---|
| typecheck | `npm run type-check` | pass exit0 — tsc --noEmit ไม่มี diagnostics |
| scoped lint | `npm run lint -- tests/integration/timetable-session-expired.test.tsx` | pass exit0 — 1 changed fixture เท่านั้น; ไม่ใช่ full-project lint |
| full tests | `npm test` | pass exit0 — 93 files / 1049 tests passed, 38.49s; sandbox attempt แรก exit1 EPERM เขียน node_modules/.vite-temp ก่อนเริ่ม tests แล้วรันซ้ำด้วย narrow escalation เพื่อ temporary test cache |
| fixture tests | `npm test -- tests/integration/timetable-session-expired.test.tsx` | pass exit0 — 1 file / 43 tests passed, 8.54s; narrow escalation เช่นเดียวกัน |
| default build | `npm run build` | fail exit1 — Next.js16.3.8 โหลด next.config.mjs ไม่สำเร็จ: Failed to load native binding; missing ./swc.win32-x64-msvc.node และ ERR_SWC_NATIVE_CACHE / sandbox AppData cache DACL grants replacement rights 0x1f01ff; ก่อน compile |
| custom cache / retry | — | NOT RUN — คำถาม custom SWC cache ยังไม่มีคำตอบจริง; ไม่ retry env0, ไม่แก้ ACL/deps/config |
| backend / browser / live DB | — | NOT RUN — fixture-only scope |

jsdom scrollTo/navigation/canvas “Not implemented” warnings มีใน full suite แต่ tests ทุกตัวผ่าน; ไม่ใช้คำเตือนนี้รับรอง browser behaviour. Default build รันครั้งเดียวตาม brief; environment hold เป็นของเจ้าของเครื่อง/DevOps ไม่ใช่ข้อพิสูจน์ production defect.

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| FE-021 | blocked | fixture/full tests/typecheck/scoped lint ผ่าน; required build exit1 ก่อน compile; คง plan Status blocked และ Phase8 security gate |

### Feature QA flows

ไม่ใช่ Feature QA; test-plan/index.md มี TP-001 Phase1 ไม่มี FE-021 case. `S` = tests/integration/timetable-session-expired.test.tsx, `T` = tests/integration/timetable-fe021-term-context.test.tsx. Results ด้านล่างจำกัด mocked integration/source ไม่ใช่ live acceptance.

| Task / AC / flow | Result | Evidence |
|---|---|---|
| FE-021 / AC-026 term context | ⚠️ Partial | S:187–204 สาม targets ส่ง nSchoolID7/nYear2569/opaque sTermID จริง; T:191/219/269 term-scoped loads รวม bridge/conflict อยู่ใน full green suite; live 7 routes ไม่รัน |
| FE-021 / AC-027 Terms แหล่งเดียว | ✅ Verified automated | S:90–113 Terms200 สอง opaque keys/current school-year cache; S:209–233 empty/multiple-no-choice/malformed ไม่เดา/ไม่อ่าน target/ไม่ส่ง POST; hook:78–99 validate Terms ก่อนเลือก; Terms401 route S:177 ยังไม่ bypass |
| FE-021 / AC-063 auth regression | ✅ Verified automated | S:193/419 ยืนยัน target401 ถูกเรียกจริง + token/user data cleared; S:435 target403 visible/rollback0/token kept; S:452 success count1/no error; auth-headers:99–121 ใช้ wrapper จริง |
| FE-021 / AC-066 401 silent | ✅ Verified automated | S:146/206/357/366 Toaster+ToastProbe นอก AuthProvider ยังคงตรวจไม่มี toast หลัง SessionExpired; auth-context:143–156 receiver จริง; 43 fixture tests และ full suite ผ่าน |
| FE-021 / AC-067 required failure viewable | ✅ Verified automated | T:298/320 header คง/ไม่มี spinner/empty/mutation เมื่อ missing-term หรือ class-period status0/-1; tests รวมอยู่ใน full suite passed |
| FE-021 / AC-068 fail-closed writes | ✅ Verified automated | S:222–232 alert → Save disabled/คลิกแล้วไม่มี setting/set หรือ POST; settings:230/274/755; teacher-groups:211–217/354 ต้องโหลด shape ถูกก่อนเปิด action; T:439 ผ่าน |
| FE-021 / AC-069 cancel pending Generate | ⚠️ Partial | full existing regression suiteผ่าน; รอบนี้ไม่ walk pending Generate/live grid โดยเฉพาะ; QA9 guard evidence คง carry ไม่ใช้แทน executable acceptance ใหม่ |
| FE-021 / AC-070 reload/no auto retry | ⚠️ Partial source | required-load helperไม่ retry; changed diffไม่สร้าง retry control; browser recoveryไม่รันและ signed retry UX ยังไม่มี |
| FE-021 / AC-065 paired cutover | ⚠️ Partial | frontendส่งคีย์ตรง contract; paired BE-010/FE-021 release window, DDL/backfill/SA-Q8 ยังholdและไม่ deploy |
| FE-021 / URL/cache/preselect/dirty/stale | ✅ Verified automated | T:378/389/399/407/421/452/469/486/497 opaque/query retention/invalid singleton/wrong school-year/late response/dirty cancel-history/VR literals ผ่าน full suite; manual multi-tab และ all locales ยังไม่รัน |

### Review findings

| Finding | Result | Evidence |
|---|---|---|
| REV-006 | ✅ Verified automated regression | T:432 list status-1 visible อยู่ใน full passed suite; carry resolved review13 |
| REV-007 | ✅ Verified automated regression | T:421 four localized VR8/9 literals; timetable-request-failure.ts:43–50 match exact literals; review13 resolved |
| REV-008 | ✅ Verified automated regression | T:439 required status-1 blocks writes; caller settings/subject/period/groups guards อ่านจริง; review13 resolved |
| REV-009 | ✅ Verified automated regression | T:452/469/486 dirty cancel/confirm/history ไม่สูญเสีย draft ก่อนยืนยัน; review13 resolved |
| REV-015 | ✅ Verified automated regression | T:320 restore fail viewable/no spinner/no writes ผ่าน suite; review11/13 resolved ไม่เกิดการแก้ production ใหม่ |
| REV-010 | ⚠️ Partial backlog carry | review13 Minor hub/year navigation; ไม่เปิดแก้ |
| REV-011 | ⚠️ Partial backlog carry | review13 Minor create-class-period-form; ไม่เปิดแก้ |
| REV-012 | ⚠️ Partial backlog carry | review13 Minor timetable-grid; ไม่เปิดแก้ |
| REV-013 | ⚠️ Partial backlog carry | review13 Minor settings; ไม่เปิดแก้ |
| REV-014 | ⚠️ Partial backlog carry | review13 UX-007 draft metadata; ไม่ใช่ full sign-off |
| REV-016 | ⚠️ Partial backlog carry | review13 UX-009 historical Minor; signed UX-009 ไม่เท่ากับปิด finding แทน owner |

### Data Model check

อ่าน design/data-model.md เต็ม 213 lines; SHA256 AFB17E1DCDF0862310CD1EBB0982EB77B7F12273140024C1635CC1B7C4D50E86. ไม่มี changed entity/schema ใน fixture diff; เทียบ §27.5 fields กับ real backend/FE/fixture:

| Field / relation | Result / actual evidence |
|---|---|
| Tbl_Setting.nYear / sTermID | ✅ Verified source — B Models/Tbl_Setting.cs:12–13 int? / string (legacy NULL semantics); settings page:233/294 ส่ง string |
| Tbl_ClassPeriod.nYear / sTermID | ✅ Verified source — B Models/Tbl_ClassPeriod.cs:12–13 int? / string; class-period page:62/111 |
| Tbl_TeacherClassAssignment.nYear / sTermID | ✅ Verified source — B Models/Tbl_TeacherClassAssignment.cs:11–12 int? / string; B Request.cs:311 |
| Tbl_Timetable.nYear / sTermID | ✅ Verified source — B Models/Tbl_Timetable.cs:12–13 int / string; workspace:834–835 |
| TTerm.nTerm / SchoolID / nYear / cDel | ✅ Verified source — B Models/TTerm.cs:16/20/25/32; B WebAPIController.cs:170–181 tenant/year/nondeleted Terms lookup; ValidateTerm:56–66 VR9/VR8 ไม่แปลง stringเป็นnumber |
| TermItem.sTermID / sTermNumber / dStart / dEnd | ✅ Verified source/fixture — types/timetable.ts:188–193 string/string/optional nullable dates; B Terms:178; S:90–96 opaque keys/labels/null dates ตรง; malformed null label S:212 fail-closed |
| Request sTermID string | ✅ Verified source — B Request.cs:131/163/196/262/311/343/373/397/414/421 ใช้ชื่อเดิม; fixture target query assertions S:199–201 |
| Derived group/link/grid | ✅ Verified source structure — B Models/Tbl_TeacherSchedule.cs:20 nClassPeriodID, Tbl_LinkSubjectSetting.cs:10–11 nSettingID/nPeriodID, Tbl_TimetableClass.cs:12 nTimetableID ไม่เพิ่ม term ซ้ำ; live joins/DB ไม่รัน |
| class-period prerequisite data.lstPeriods | ✅ Verified automated — S:411/427/444 ส่ง status1 + object + array[] ตาม DES-018 §43.2b5.1; teacher-groups:211/216 ยอมรับempty arrayและเปิด action เมื่อ group loadสำเร็จ |

§27.6 future room/caps/homeroom/T1 schema และ §27.7 intensity/legacy ไม่มีการเปลี่ยนในรอบนี้ จึงไม่รับรอง runtime/DDL ของงานเหล่านั้น. วันที่คำอนุมัติ dev BE-013/M1 จาก driverไม่เปลี่ยน Data Model provenance หรือให้สิทธิ์ shared migration/deploy.

### Issues Found (defect packet)

#### QA-006 — resolved ด้าน fixture

- **Task:** FE-021 · **Severity:** Important (เดิม) · **Owner:** frontend-engineer.
- **Expected:** valid Terms school/year-scoped context ก่อน target401 เดิม และ valid class-period shapeก่อน add-teacher401/403/200; คง no-term/malformed/Terms401 fail-closed/auth semantics.
- **Actual:** S:90–113/187–233/408–457 ให้ prerequisitesถูก shape/context; target calls/statuses/assertionsยังคงอยู่. Targeted43/43 และ full1049/1049 ผ่านจริง; six failed casesของ QA9ไม่ล้มแล้ว.
- **Reproduce:** TP=null; fixture/full commands ใน Checks run; Terms empty/multiple no-choice/malformed + wrong-school/year caches รอ alertแล้วคลิก Saveไม่ส่ง POST.
- **Evidence:** authorized diff C:/Users/jabja/AppData/Local/Temp/codex-fe021-fixture3-20261011.diff มี test fileเดียว 69 additions/7 deletions; อ่าน current fileเต็ม + real auth/helper/callers. ไม่รัน git; diffนี้ไม่ยืนยัน global tree scopeแทน driver audit.

ไม่มี Critical/Important app findingใหม่. Required buildยังแดง → FAILตาม qa role verifyข้อ1, task blocked; environment blockerเดิมไม่ตั้ง QA id ใหม่. Gate4 history review8+10+QA9/fix1+fix2ไม่reset; รอบเพิ่มที่คนอนุญาตเพียง1รอบจบแล้ว. ส่ง machine owner/DevOps แก้ environment/มนุษย์ตัดสิน build recheck; ไม่ส่ง frontendแก้ fixtureใหม่อัตโนมัติ. 🔒 Phase8 auth/untrusted URL/storage gateมีอยู่แล้ว คงเดิม; ไม่ปิด SEC-01/02.

## Unverified Behaviour — undeployed phases

- Carry QA14/QA9 Phase8: live BE-010/sharedDB, DDL4tables/backfill AC-028/legacy NULL/paired cutover AC-065/SA-Q8/manual7routes ไม่รัน; build artifactยังholdแม้ QA-006 resolved. QAไม่อนุมัติ migration/deploy/sharedDDL.
- Multi-tab/live school-switch/staleHTTPทุกlocale, keyboard/focus/contrast/responsive/extreme text และ browser/manual E2E ไม่ตรวจ; jsdom regressionไม่ใช่visual/a11y acceptance. School Bright skill ใช้ประกอบตรวจ states/disabled assertionsเท่านั้น.
- UX-007 approved subset jtrp98 09/10/2026 คงเดิม; precise copy/details/retry/UX-005/full sign-offยังhold. UX-009 signedทั้งฉบับแล้วตามdriver/READMEวันที่2026-10-11; runtime solverไม่รัน. UX-011 userapprovedfullตามdriverแต่artifact recordpending; UX-008/010/012/013 ยังunsigned — ไม่สร้าง sign-offเอง.
- Carry QA10..14: Phase9 Copy/token/transaction, Phase10 solver/whole-block/groups, Phase11 mapping/capacity/caretaker/Academic usage และ Phase12 caps/eligibility/precheck/recheck ยังไม่รัน live; Minor review:REV-016 backlogคงเดิม.
- Phase13 purePreview/atomic T1/replacement/concurrency/receipt/replay/unknown outcome/record recovery/defaultattendance/roommappingไม่รัน. A+atomicT1 direction approved onlyตามdriver; ไม่ใช่owner/runtime/schema/deployapproval.
- BE-013 devschemaapproved/M1 re-enterตามdriver; ไม่มีDDLexecution/sharedmigration. SchoolDB capacity/caretaker อ่านอย่างเดียว/SQLโดยผู้ใช้เท่านั้น; ไม่ตีความเป็น module writeapproval. Otherowner gates C2/C1′/X1/X2/cutover/mapping/runtimeยังคงรอหลักฐานเจ้าของ.
- Carry QA8 ผ่าน QA14: live menu upstream/periodJSON/DB/deepJSONไม่E2E; SA-Q14 MenuID401..404/422/permissions/Type/Role + TP-D2/authmasterdataรอDevOps/owner; SEC-03 proofไม่แทนFE-021/live acceptance.
- data-model §27.5/§27.6 approvalprovenance archive:2717ไม่ใช่คำตอบจริง; ไม่ปิดschema/owner/breaking/T1/default/transaction holdsจาก QA. SEC-01/SEC-02 productionholdคงเดิม; ไม่rotate/ยอมรับrisk/อนุมัติreleasedแทนคน.

## Change Log

- 2026-10-11 — Round15 FE-021 fixturePASS (43/43, full1049/1049), QA-006 resolvedด้านfixture; required defaultbuildFAIL/SWCenvironmenthold → outputFAIL/taskblocked. คงfailed-roundhistory/liveholds; no customretry/code/ACL/deps/config/git/deploy/DDL.

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
