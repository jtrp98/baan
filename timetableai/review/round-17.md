# timetableai — Review Round 17 — BE-013

> เขียนโดย `reviewer` · วันที่ผู้ใช้ jtrp98 2026-10-11 · independent static review ของ BE-013 bounded unit · ใช้ `templates/review-round.md` · ผู้ใช้ยกเลิก document size budgets ตาม brief

## Findings

### REV-017

- **Severity:** Minor → backlog
- **Task:** BE-013
- **Location:** `C:/src/schoolbright/target/sb-api-academic-timetable-ai/AITimeTableBackend/Controllers/WebAPIController.cs:2015`; `AITimeTableBackend/Helpers/SubjectContinuityWarnings.cs:210`
- **Problem:** catch ของ responsibility/diagnostic support คืน unavailable/reason ที่ปลอดภัยและไม่ทำลาย primary success แต่ไม่มี log ของ scope/read-state/reason/correlation ตาม quality contract จึงตามสาเหตุ support read failure ใน production ไม่ได้จาก instrumentation ของ unit นี้. ไม่ต้องเพิ่ม exception text/roster/blob/cap/PII ลง response หรือ logs. ส่ง PM append backlog และจัด owner ในรอบถัดไป; ไม่เปิดงานแก้ใน frozen release จาก Minor นี้.
- **Reference:** DES-015 §40.3a Trust/quality/compatibility; DES-012 §37.2a Readiness/quality/security; policies/coding.md §4 Observability
- **Owner:** backend-engineer (PM รับบันทึก backlog)

ไม่พบ Critical/Important ของ BE-013 ใน task delta ที่ตรวจ. ไม่ใช้ข้อสังเกตของ unchanged endpoints หรือ staged baseline เป็น defect ใหม่.

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-017 | Minor | AITimeTableBackend/Controllers/WebAPIController.cs:2015; AITimeTableBackend/Helpers/SubjectContinuityWarnings.cs:210 | backend-engineer | → backlog |

## Round 17

**Verdict:** PASS

| Task | Verdict |
|---|---|
| BE-013 (full bounded backend unit; static) | PASS |

B = `C:/src/schoolbright/target/sb-api-academic-timetable-ai`; M = `C:/src/schoolbright/knowledge/timetableai`.

หลักฐานจากโค้ดจริง:

- **H1/hour/M1:** `B/AITimeTableBackend/Models/Request.cs:133` และ `Models/Tbl_Setting.cs:15` เพิ่มสอง int hours และ jsonb H1 โดยคง legacy columns; `Helpers/TeachingSettingsValidation.cs:11` ตรวจรวม/รายคนเป็น integer≥0 และ day≤week เมื่อทั้งคู่>0, missing additive keys=0 ไม่มีแปลง legacy periods. H1 รับเฉพาะ [{nTeacherID}] และ `Controllers/WebAPIController.cs:2088` ตรวจ term/VR-12/VR-13 ก่อน mutation; query teacher ownership/active roster และ reject missing/foreign teacher ก่อน SaveChanges. Set ไม่เขียนทับ legacy flags/period values.
- **HTTP binding:** `Models/TeachingCapJsonConverter.cs:11` ไม่ coerce fractional/string/null/bool/overflow เป็น0; `Startup.cs:96` เก็บ original InvalidModelStateResponseFactory และแปล cap errors เฉพาะ action parameter RequestSetting เป็น status0 InvalidTeachingCap; non-cap errors ใช้ original. `TeachingSettingsHttpTests.cs:371` มี real host binding/no-write cases รวม malformed/inverted และ `:507` ตรวจ non-cap400/other-action400. เป็นการอ่าน test source ไม่ใช่ผลรัน.
- **Settings responsibility:** `Controllers/WebAPIController.cs:2029` เรียก ValidateTerm ก่อน setting/projection query; omitted/null/blank request term คืน VR-9 ไม่มี projection และ foreign year/term คืน errorเดิม. FindSettingForRead `:80` exact termก่อน legacy setting NULL; projectionใช้ request termที่ valid เสมอ ไม่มี ContextNotSelected/whole-year fallback.
- **Scoped shared source:** `Controllers/WebAPIController.cs:1917` ใช้ batch/no-tracking query ชุดเดียวกับ generator `:2513`: SchoolID ทุก join, cm/cls termตรงกัน, active cm/cls/lv/trm, request year/term, head+assist1+assist2; dedupe teacher/class และ sort class. `:1995` rosterครู selectableทั้งหมดของโรงเรียน cDel=NULL/sort teacher ไม่อิง flags/assignment; ชื่อห้องมาจาก localized real name parts ขาดส่วนชื่อ→null. Carrierเผยเฉพาะ teacher ID/class ID/name ไม่มี teacher PII/subject/group/config/wizard fields.
- **Absence/error:** `Controllers/WebAPIController.cs:2005` successful no-roomเป็น [] ต่อครู; invalid owned ID→InvalidResponsibilityData/list=null `:2011`, query failure→ResponsibilityReadFailed/list=null `:2015` โดย primary settingsที่อ่านสำเร็จยัง status1. ไม่มี Setting rowคืน defaultsพร้อม projectionจริง. `TeachingSettingsHttpTests.cs:194`–`:369` ครอบ 403-only/402-only/401, shared room dataset, roster/read faults, malformed IDs, empty roster, legacy fallback, VR-9 และ locale/null name.
- **Generator paired dev contract:** `Controllers/WebAPIController.cs:2320` ใช้ school active roster และเรียก GetTeacherInfos(useLegacyAssignments:false); responseมี lstRestrictedClasses จาก shared source และไม่มี lstClassTaught. ไม่ query/write/ลบ Tbl_TeacherClassAssignment ใน path นี้; default legacy helper branchยังคงสำหรับ other callers. `TeachingSettingsHttpTests.cs:473` มี unparseable wizard fixtureเพื่อแยกการไม่อ่านแหล่งเก่า. การเปิดใช้ต้อง paired BE-013/FE-025/DES-011 ตาม SA-Q8.
- **Four warning responses:** `Controllers/WebAPIController.cs:1089,1098,1236` ประเมิน GETจาก persisted blob; `:1212,1286` ประเมิน SETจาก request blobที่ primary SaveChangesสำเร็จแล้ว. Wrapper `:1066` แยก helper failureจาก primary save. Blobยังเก็บ/คืน verbatim; DTO `Models/SubjectContinuityWarningAssessment.cs:5` คืน outcome/contextเท่านั้น ไม่มี caps/teacher IDs/H1.
- **BR-9/final eligibility/unknown:** `Helpers/SubjectContinuityWarnings.cs:32` parse ephemeral array/object, first matching code, integer N≥2; invalid→InvalidContinuityBlob. `:115` ใช้ consecutive periodsเท่านั้น present individual0=unlimited ไม่ใช้ hours; invalid chosen caps→unknown. `:164` scoped active plan/curriculum/course/class/teacher queries. `:193`–`:205` H1/three-role intersectionไม่ขยายสิทธิ์; BR-41/42 subsetว่างที่ยืนยันได้ยังว่างภายใต้ BR-71. Nonempty subsetไม่ใช่ final eligible proofเมื่อ room/caretakerยังไม่มี: actual readerคืน EligibilityUnavailable ไม่ false complete[]; pure helperรับ known final subsetsได้และแยก complete/partial/unavailable `:64`–`:112`. Fixture known subsetไม่ใช่ live readiness.
- **Permissions/tests source:** `Security/TimetableEndpointPolicy.cs:80` คง Setting403/401, subject/ClassContinuity422/401 และ class-teachers402/401. ไม่แก้ resolver/filter/auth. `SubjectContinuityWarningsHttpTests.cs:59`–`:258` ครอบ422-only/deniedSetting, pendingN/verbatim/groups/links, supportfailureหลังSaveไม่มีre-save, primaryfailure, plan/class/tenant/year/term scopesและconservativeunknown. Test factoryใช้ real Startup/ApiFactory และ InMemory contextsเดิม ไม่มี live DBใน fixture pathsที่อ่าน.

**ขอบเขต/ข้อจำกัด:** อ่าน driver diff ที่ isolate unstaged BE-013 delta จาก preexisting staged changes, actualทั้ง 13 pathsตาม coverageด้านล่าง และ contract sectionsที่เกี่ยว. ไม่รัน git/build/tests/checks/SQL/DB/network; ไม่รับ implementer logs หรืออ้าง testsผ่าน. ไม่อ่าน qa/security artifacts. Static PASS ของ full bounded BE-013 unitไม่ใช่ runtime/production/security verdict หรือ full FE-023/BE-012 approval; full BR-53 room-dependent assessmentยังรอ BE-012/live final eligibility. DDL/shared DB/cutover/SA-Q5/SA-Q10/module mapping/schema/production holdsคงเดิม. ไม่แก้ code/plan Status/dependencies/closed review rounds.

**Next:** clean qa-engineer ตรวจ full BE-013 actual HTTP binding/scopes/error/save semanticsและcarrierใหม่ด้วย build/testตาม task; QA เป็นเจ้าของ verdict/Status ตามโหมด. PM รับ review:REV-017 เข้า backlogโดยไม่ขยาย release; independent securityก่อน FE-025 consume/releaseตาม pipelineเดิม.

## Reviewed

- `M/index.md` (22บรรทัดแรก); `plan/index.md` (Waiting on Human/BE-013/sequence); `plan/be-013.md`
- `M/design/index.md`; `design/data-model.md` (§27.1–27.7); `design/des-009.md` (§34.1–34.4); `design/des-012.md` (§37 รวม§37.2a); `design/des-013.md` (§38.0–38.5/BR-71); `design/des-014.md`; `design/des-015.md` (§40 รวม corrected§40.3a); `design/des-018.md` (§43.1/§43.2/endpoint policiesและderived/responsibility boundaries)
- `M/requirement/index.md`; `requirement/req-015.md`; `requirement/req-017.md`; `requirement/req-018.md`; `requirement/req-021.md` (business auth/AC-060..062และrequired-load ACที่เกี่ยว)
- `M/test-plan/index.md`; `test-plan/round-1.md`; `M/review/index.md`; `review/round-16.md` (latest metadata/Open Findings)
- `B/AITimeTableBackend/Models/Request.cs`, `Models/Tbl_Setting.cs`, `Models/TeachingCapJsonConverter.cs`, `Models/SubjectContinuityWarningAssessment.cs` (ทั้งไฟล์)
- `B/AITimeTableBackend/Helpers/Messages.cs`, `Helpers/TeachingSettingsValidation.cs`, `Helpers/SubjectContinuityWarnings.cs`; `B/AITimeTableBackend/Startup.cs` (ทั้งไฟล์)
- `B/AITimeTableBackend/Controllers/WebAPIController.cs` (driver task diffทั้งหมด + actual imports/ValidateTerm/FindSettingForRead, four SubjectSettings/ClassContinuity Get/Set, shared responsibility query/projector, SettingGet/Set, GetTeachersByClass/GetTeacherInfos)
- `B/AITimeTableBackend.Tests/TeachingSettingsTests.cs`, `TeachingSettingsHttpTests.cs`, `SubjectContinuityWarningsTests.cs`, `SubjectContinuityWarningsHttpTests.cs` (ทั้งไฟล์)
- `B/AITimeTableBackend/Security/TimetableEndpointPolicy.cs`; `Models/TClassMember.cs`, `TTermSubLevel2.cs`, `TEmployees.cs`, `TSubLevel.cs`, `TLevel.cs`, `TTerm.cs` (source neighbors)
- `B/AITimeTableBackend.Tests/IntegrationTests.cs` (ApiFactory/convention); `TermValidationTests.cs` (InMemory contexts)
- `C:/Users/jabja/.codex/visualizations/2026/10/09/01a1201c-fd22-72d1-8682-50bca437e488/be-013-review.diff` (ทั้งไฟล์)
- `C:/src/schoolbright/rong-ngang-workspace/AGENTS.md`, `CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/README.md`, `policies/coding.md` §§4–6, `policies/documentation.md` และ `templates/review-round.md`

## Change Log

- 2026-10-11 — Round17 BE-013 full bounded unit PASS static; REV-017 Minor→backlog; ไม่มี Critical/Importantใหม่ ไม่รันtests/git/DDL ไม่แก้Status/closed rounds และ remaining release holdsคงเดิม

Back-links: `plan\index.md` · `..\index.md`
