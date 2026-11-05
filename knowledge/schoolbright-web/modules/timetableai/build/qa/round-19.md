# timetableai — QA Round 19 — BE-013

> qa-engineer · clean independent session · solo · Phase 12 · วันที่ผู้ใช้ jtrp98 2026-10-11 · templates/qa-round.md · ผู้ใช้ยกเลิก document size budgets
> B = C:/src/schoolbright/target/sb-api-academic-timetable-ai; M = C:/src/schoolbright/knowledge/timetableai. อ่าน index-first/data-model.md เต็ม และ actual 13 paths; ไม่รับ implementer conversation/logs และไม่ใช้ reviewer PASS แทนผลตรวจจริง.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | resolved carry QA16/18; ไม่ตรวจหรือเปลี่ยน verdict FE-021 ซ้ำ |

ไม่มี QA defect ใหม่ของ BE-013; review:REV-017 Minor → backlog (support failure ไม่มี scope/state/reason/correlation log) คงส่ง PM โดยไม่เปิด in-scope fix. ไม่เผย exception/roster/blob/cap/PII แทน logging. BE-012/full room support และ release prerequisites เป็น holds เดิม ไม่ใช่ API-unit defect หรือ failed fix round.

## Round 19

**Status:** ✅ Verified

OutputState PASS · BE-013 verified เฉพาะ full bounded backend unit ตาม plan/be-013.md Independent done-check. Formal failed rounds ของ BE-013 = 0 (review17 PASS + QA19 PASS); ไม่มี Critical/third-failure gate4. QA เขียนเฉพาะ BE-013 Status pending→verified; Phase12 🔒 คงเดิม. Frozen R1 หลังเปลี่ยน = 48 tasks, 39 verified / 9 pending / 0 blocked; ไม่แก้ PM notes/graph/Waiting on Human/Change Log ของ plan และไม่ใช่ released.

### Checks run

| Check | Command | Result |
|---|---|---|
| stack/check discovery | อ่าน actual AITimeTableBackend.csproj / AITimeTableBackend.Tests.csproj | net10.0; xUnit2.9.2/MVC.Testing9.0.11/EF InMemory9.0.11 ตาม manifest จริง |
| typecheck / lint | — | NOT RUN แยก: manifest ไม่มี dedicated commands; compilerอยู่ใน build |
| build | dotnet build AITimeTableBackend.sln --no-restore --verbosity quiet | PASS exit0: Build succeeded, 0 Warning(s), 0 Error(s), elapsed0.95s |
| full solution test | dotnet test AITimeTableBackend.sln --no-build --no-restore --verbosity quiet | PASS exit0: Passed251 / Failed0 / Skipped0 / Total251, Duration15s, net10.0; 1 test assembly |
| code/contract/data-model review | actual source + be-013-review.diff เทียบ INDEX baseline; REQ/DES/TP/review17 | inspected bounded13 paths; staged baselineแยกจากtask delta ไม่สร้างfindingให้ preexisting code |
| document preservation | exact replacement guards + content/status-table comparison + SHA256 | planเปลี่ยน1Statusเท่านั้น; qa indexเพิ่มround19/Change Log; closed QA18/review17 และ13 source filesคงเดิม |

Build/test รันครั้งเดียวจาก B โดย narrow filesystem escalation; no restore/live DB/SQL/migration/deploy/git. HTTP factoryใช้ real Startup/ApiController/System.Text.Json/auth handler/filter แต่ permission resolverเป็น fixture และ DataContext/StudentDataContextเป็น InMemory. ไม่มี focused repeat/frontend phase checks.

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-013 | verified | full build+251tests PASS; Request:133, Tbl_Setting:16, TeachingSettingsValidation:11, Startup:96; WebAPIController:1917/2024/2083/2305/2513; four new test files |

### Feature QA flows

ไม่ใช่ Feature QA ของทั้ง Phase12; ตารางนี้คือ backend API/unit flows ที่ execute ใน full suite. TP-011/TP-012 ส่วน frontend และ full FE-023/FE-025 ไม่ได้ execute.

| Flow / AC / reviewer | Result | หลักฐาน actual B-relative path:line / TP |
|---|---|---|
| AC-041 backend integer hour/VR-12 | ✅ Verified | TeachingSettingsHttpTests.cs:380/399/415 รวม/รายคน fractional/string/null/bool/overflow/root/malformed/negative/day>week status0+SaveCount0; converter:11 ไม่coerce, Startup:96 แปลเฉพาะ RequestSetting; TP-002 |
| AC-042 weekly backendรับ/คืน | ✅ Verified | TeachingSettingsHttpTests.cs:444 0/positive day/week roundtrip; Request:135/Tbl_Setting:17; enforcementอยู่ FE-025 |
| AC-043 backend individual/global fields | ✅ Verified | TeachingSettingsTests.cs:33 และ HTTP:444 เก็บindividual hours verbatim; ไม่มี apply/except dependency; effective enforcement FE-025 ยังไม่ตรวจ |
| AC-043a ต่อฟิลด์ backend preparation | ✅ Verified | TeachingSettingsValidation.cs:35 missing key=0 ไม่อ่านlegacy periods; HTTP:444 individualday0/week12 preserved; fallbackการคำนวณจริง FE-025 ยังไม่ตรวจ |
| AC-043b M1 | ✅ Verified | TeachingSettingsTests.cs:54 defaults0; HTTP:444 oldperiod8/flags/CSV retained; WebAPIController:2104/2124 ไม่convert/backfill |
| AC-044 backend H1+responsibility | ✅ Verified | HTTP:194/222/473 head+assist1+assist2/samegenerator/dedupe; fixtureknownH1empty=complete no capwarning warningHTTP:198; finalsolver enforcementอยู่ FE-025 |
| AC-045 backend preparation | ✅ Verified | WebAPIController:2320 school active roster, sharedresponsibility:2513 และ no lstClassTaught; HTTP:222/473; ไม่อ้าง teacher catalogว่าเป็นfinal eligible subset |
| AC-046 flag/VR-13 | ✅ Verified | HTTP:429 wrongschool99/missing900/wrongshape status0+SaveCount0, validH1verbatim:444; validationก่อนmutation:2088 |
| AC-046a oldwizard retention | ✅ Verified | HTTP:473 unparseable oldassignmentไม่ถูกอ่าน/เขียน/ลบ; useLegacyAssignments:false:2324; legacyhelper branchคงสำหรับothercallers; TP-013 devส่วนนี้ |
| DES-015 §40.3a all-selectable teacher carrier | ✅ Verified | HTTP:194 rows1..4รวมunflagged/noassignment, sorted/dedupclasses100/105, exactkeysไม่มีPII/wizard; WebAPIController:1995 allroster cDelNULL; TP-004 |
| §40.3a absence/readfailure/invalid | ✅ Verified | HTTP:249 primaryhour/H1ยังstatus1+unavailable/listnull; :269/279 invalidowned IDs→InvalidResponsibilityData; :288 emptyrostercomplete[]; noSettingdefaults+realprojection:194; no School DB writes in source |
| §40.3a mandatoryrequestterm/legacyNULL | ✅ Verified | HTTP:316 omitted/empty/whitespace→VR9ก่อนfaultyroster/responsibility queries/no data; :329 wrongyear/termno projection; :298 legacyrowNULLonlyvalidrequest scope=t1; Controller:2029 ValidateTermก่อนFindSetting/read; ไม่มีContextNotSelected |
| §40.3a localized names | ✅ Verified | HTTP:340 Thai/Englishactualparts; :355 missingrealnameparts→null ไม่มีinvented ID/name; projector:1964 |
| AC-060 boundary regression | ✅ Verified | HTTP:532 / warningHTTP:240 auth401; existing IntegrationTests อยู่ใน full251; ไม่แทน live token/master verification |
| AC-061 tenant/audit | ✅ Verified | HTTP:532 requestforeignschool403/no write; warningHTTP:240 foreignGET/POST403; :444/59 audit UpdatedBy5 replaces999; scopedcatalog:174 |
| AC-062 unchanged menu policies | ✅ Verified | HTTP:194 403-onlySettingpass/classdenied; :237 402-onlySettingdenied/classpass; :222 401both; warningHTTP:59 422fouractionsผ่านแต่SettingGet403; policy:80/84/113 unchanged; TP-006 |
| narrow model-binding translation | ✅ Verified | HTTP:513 noncapSettingerrors400/SaveCount0, :523 otheraction400; Startup originalfactory preserved; capinvalid200/status0; TP-002 |
| AC-037b derived transport + pendingN | ✅ Verified | warningHTTP:59 GETpersistedN1complete → SETnewN3EligibilityUnavailable; allfourresponses preserve blob/subjectGroups/unknownextensions/nID; actualwrapper/controller:1066/1089/1212/1236/1286; TP-007 |
| AC-037b BR-9 unit semantics | ✅ Verified | warningunit:21/33 finitecaps/allfinaleligible/individual0unlimited ignoreshourvalues; :46 finalsubset+plan/class/dedupe, :60 knownemptyไม่capwarning; helper:115ใช้consecutiveperiodsไม่×60; TP-005/008 |
| conservativefinaleligibility/coverage | ✅ Verified | warningHTTP:174/198 actualreaderไม่ประกาศassignedlistcomplete; roomunknown→EligibilityUnavailable; unit:70 partialonlyprovedwarnings/:102 invalidblob/:117 invalidcaps/:133CourseNotFound/:143nosettingonlysuccessfulread; TP-009/014 |
| diagnostic vs primary save | ✅ Verified | warningHTTP:91 supportfaultหลังSaveยังstatus1/nID+unavailable/SupportReadFailed/SaveCount1, GETprimaryblobสำเร็จยังดูได้; :117 primaryFailSave status-1/no data; :131 link/group regression; TP-010 |
| review:REV-017 | ⚠️ Partial — Minor→backlog | review17:REV-017; Controller:2015/helper:210ไม่มีscope/reason/correlationlog; fallback/privacy verified แต่loggingยังไม่implement; ไม่ขยายfrozenrelease |

### Data Model check

อ่าน design/data-model.md §27.1–27.7 เต็ม; เทียบ CLR/DTO field-by-fieldกับ §27.6 ข/ค/จ + DES-012/015. ตารางนี้คือ code+InMemory proof ไม่อ้าง SQL default/actual live DDL. DB int NOT NULL DEFAULT0 และ jsonb NULL shapeยืนยันเฉพาะdevโดย jtrp98; DDLไม่ได้รันใน task นี้.

| Entity/field | Actual source | Result |
|---|---|---|
| Tbl_Setting.nID int PK | Models/Tbl_Setting.cs:9 | ✅ unchanged Key |
| nSchoolID int | :11 | ✅ scoped tenant |
| nYear int? | :12 | ✅ existing nullable schema, request yearint |
| sTermID string/legacyNULL | :13; Controller:80 | ✅ opaque TTerm.nTerm; exactfirst/legacyfallback |
| nMaxTeachingHoursPerDay int | :16; Request:133 | ✅ nonnullable CLR/default0/newfield |
| nMaxTeachingHoursPerWeek int | :17; Request:135 | ✅ nonnullable CLR/default0/newfield |
| jHomeroomRestrictedTeachers string/jsonb NULL | :18–19; Request:136 | ✅ H1 [{nTeacherID}], nullable; no roompairs |
| jSetMaxPeriodIndividually string/jsonb | :26–27; validation:35 | ✅ newday/hourweek keysinteger; missing0; blobverbatim |
| nMaxTeachingPeriodPerDay int | :22 | ✅ retained, no M1 conversion |
| isApplyMaxPeriodToAllTeachers bool | :23 | ✅ columnretained, newSetไม่overwrite |
| isExceptMaxPeriodTeachers bool | :24 | ✅ columnretained |
| sMaxPeriodExceptTeacherIDs string | :25 | ✅ columnretained; oldCSVไม่อ่านในnewGet |
| nConsecutiveTeachingPeriodWithoutBreak int | :30 | ✅ BR9หน่วยคาบ unchanged |
| nCourseIntensity int | :31 | ✅ retained |
| jSetSubjectsClassContinuity string/jsonb | :34–35 | ✅ array/object verbatim ephemeralassessmentonly |
| isUseAllHomeroomTeachers bool | :38 | ✅ retained ไม่ใช้newflow |
| isExceptHomeroomTeachers bool | :39 | ✅ retained |
| sHomeroomExceptTeacherIDs string | :40 | ✅ retained |
| isUseOnlyKindergartenHomeroomTeachers bool | :41 | ✅ retained |
| isUseOnlyPrimaryHomeroomTeachers bool | :42 | ✅ retained |
| isUseOnlyLowerSecondaryHomeroomTeachers bool | :43 | ✅ retained |
| isUseOnlyUpperSecondaryHomeroomTeachers bool | :44 | ✅ retained |
| CreatedBy int | :46 | ✅ authenticatedaudit onnewSet; HTTPexistingauditproof |
| CreatedAt DateTime | :47 | ✅ UTCexistingpattern/DataContextconverter |
| UpdatedBy int | :48 | ✅ HTTPclaim5 ไม่999 |
| UpdatedAt DateTime | :49 | ✅ UTCexistingpattern |
| Tbl_TeacherClassAssignment/schema/data | Controller:2324/2515; HTTP:473 | ✅ ไม่แก้/ไม่ลบ/no migrationtoH1 |
| homeroomResponsibility transient | Controller:1990/2034; TeachingSettingsTests:47 | ✅ ไม่มี RequestSetting/Tbl_Setting property; GETonly |
| responsibility.scope.nSchoolID int | Controller:1992; HTTP:143 | ✅ requesttenantvalidated |
| responsibility.scope.nYear int | same | ✅ requestyearvalidated |
| responsibility.scope.sTermID string mandatory | same; :2029 | ✅ validatedrequest ไม่legacyNULL/noContextNotSelected |
| responsibility.state | :2001/2011/2016 | ✅ complete/unavailable only |
| responsibility.lstTeacherResponsibilities | :2002/2011/2016 | ✅ arrayonsuccess/nullonfailure |
| responsibility.reason | :2008/2011/2016 | ✅ null/InvalidResponsibilityData/ResponsibilityReadFailed only |
| TeacherResponsibility.nTeacherID int | :2004 | ✅ selectableownedroster |
| TeacherResponsibility.lstRestrictedClasses array | :2005 | ✅ emptyvalidroomsได้ |
| ResponsibilityClass.nClassID int | :2006 | ✅ TTermSubLevel2.nTermSubLevel2 |
| ResponsibilityClass.sClassName string|null | :1964/2006 | ✅ reallocalizedparts/null |
| assessment.scope.nSchoolID int | Models/SubjectContinuityWarningAssessment.cs:15 | ✅ scopedunit |
| assessment.scope.nYear int | :16 | ✅ scopedunit |
| assessment.scope.sTermID string | :17 | ✅ validatedterm |
| assessment.state string | :8; helper:111 | ✅ complete/partial/unavailable |
| assessment.lstWarnings array | :9 | ✅ initializedlist/outcomeonly |
| assessment.lstUnassessed array | :10 | ✅ initializedlist/no private config |
| Warning.code | :22 | ✅ ContinuityExceedsTeacherCap |
| Warning.sCourseCode string | :23 | ✅ scopedcatalogcontext |
| Warning.nContinuousPeriod int | :24 | ✅ integerN≥2 |
| Warning.nPlanID int | :25 | ✅ TPlan.PlanId |
| Warning.nClassID int | :26 | ✅ TTermSubLevel2.nTermSubLevel2 |
| Unassessed.sCourseCode string|null | :31 | ✅ globalfailure null/knowncontextcode |
| Unassessed.nPlanID int? | :32 | ✅ null/global or ownedplan |
| Unassessed.nClassID int? | :33 | ✅ null/global or ownedclass |
| Unassessed.reason string | :34; helper | ✅ InvalidContinuityBlob/InvalidTeacherCapData/SupportReadFailed/CourseNotFound/EligibilityUnavailable |

Source neighbors: TClassMember:11–18 nullablehead/assist1/assist2/class/term + SchoolID/cDel; TTermSubLevel2:15–27 integerclass/stringterm/school/cDel; TEmployees:14/22/24 teacherint/schoolnullable/cDelNULL; TTerm:16/25/32 stringterm/intschool/int?year. Sharedbatch joins Controller:1934–1956 checkschoolทุกด้าน/cls-term=cm-term/requestyear/term/activecm-cls-lv-trm, ไม่มีN+1ต่อครู/SchoolDBSaveChanges. Plain getters/Helpers/Models/xUnit/realApiFactory/InMemory placementsตรงneighborsและwhycommentsอ้างVR/BR/DES. ไม่มี newroommodel/roomquery/DDL/schemawriter ใน13-path unit; data-modelส่วนrooms/T1/§27.5 migrationเป็นexistingholds.

### Issues Found (defect packet — 1 ข้อ = 1 QA-NNN)

ไม่มี Critical/Important in-scope defectใหม่ ไม่สร้าง QA ID ให้ Minorเดิม/prerequisite holds. No code/config/dependency/testfixture repair. review:REV-017ส่ง PM/backlog; QA-006คงresolved. Reviewer/QA formalfailedcounterของ BE-013ไม่เพิ่ม.

## Unverified Behaviour — undeployed phases

- Phase12 🔒 independent security ของ whole BE-013ยังต้องทำก่อน FE-025 consume/release: rawconfig/outputprivacy/tenant/roster/failureboundary; QA authHTTP testsไม่ใช่ securitysign-off. SEC-01/SEC-02 productionholdsเดิมและSEC-03 proofคง; ไม่มีriskacceptanceใหม่.
- Live PostgreSQL query translation/NULL handling/physicalintDEFAULT0/jsonb roundtrip/DDL/sharedDB/migration/backfill/manualAPIจริงไม่รัน. InMemoryไม่มีหลักฐานliveTRoom/Academic/masterDB. Batchshapeอ่านได้ แต่ peakvolume/latency/timeouts/performanceยังไม่วัด ไม่ตั้งตัวเลขสมมติ.
- Full BR41/42/71 room-dependent final eligible assessmentยังรอ full BE-012/live room mapping/caretaker/SA-Q5/SA-Q10/modulemapping schema§27.6ก. Actualreaderตอบunknownโดยเจตนา; knownfinalsubsetunitfixtureไม่ใช่roomreadinessหรือfullFE-023BR53pass. QA18 SQLPartial/fullBE-012pendingคง ไม่executeSQL.
- FE-025 hour→actualminutes/day/week/individualperfieldfallback/Linkcountonce/solver+validateDrop+Settingsrequired-load/staleprojection/flagsSave/BR9 enforcement และ FE-023 wholeblock/groups/UIwarning/staleN/oldbackendmalformedresponses/browsera11y/locales/runtime ยังไม่ตรวจ. TP-011/012 frontendไม่รัน; signedUX-009delta/UX-011จริง2026-10-11ใช้currentplan ไม่carryQA18 staleUXdeltahold.
- SA-Q8 paired BE-013+FE-025/DES-011 cutover/rollback ต้องreleasewindowเดิม ห้ามmixedunits/eligibility; newhoursdefault0/M1และBR41อาจกว้างขึ้นจนตั้งflagต้องแจ้งเมื่อเปิดใช้. Devverifiedไม่อนุมัติcutover/DDL/deploy/release.
- CarryQA18/16 Phase8: §27.5 schemaconfirmation/DDL4tables/backfill/legacyNULL/AC028/AC065/manual7routes/multi-tab/schoolswitch/staleHTTP/keyboardfocuscontrastresponsiveยังhold. FE-021verifiedคง; approvedsamecachebuildproofไม่แก้defaultcacheถาวร. UX-007precisedetails/UX-005/retryและotherdraftsตามWaitingHumanไม่ถือsign-offเพิ่ม.
- Phase9copy/transaction; Phase11rooms/capacity/caretaker/Academicusage; Phase12precheck; Phase13A+atomicT1directionapprovedแต่concreteownerroute/RPC/DTO/permission/default/mapping/revision/locks/receipt/schema/recovery/§27.6งยังhold. ไม่มีlivepreview/replace/replay/unknownoutcome/runtimeverification.
- Carry livepermissionupstream/periodJSON/deepJSON E2E/SA-Q14MenuID401..404/422+Type/Role/TP-D2และreleaseownerchecks; production/sharedmigration/deployยังพักตามWaitingHuman. Taskverifiedไม่เท่ากับreleased/humanacceptance.

## Change Log

- 2026-10-11 — Round19 BE-013 ✅ Verified/fullboundedunit PASS: build0warnings0errors/full251passed0failed0skipped; newresponsibility+diagnostic/VR12/13/scopes/modelchecked. BE-013Statuspending→verifiedเท่านั้น; frozen48tasks39verified9pending0blocked; reviewREV017Minor→backlogและremainingholdsคง. Next independent security Phase12.

Back-links: plan/index.md · ../index.md
