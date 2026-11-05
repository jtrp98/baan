# Learning write RPC 001 — ส่งงานภารกิจและทำ Quiz/Test ผ่าน gRPC + Gateway

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย arch · ขอโดย ผู้ใช้ (กำหนดสัญญาให้ BE-015 และ BE-031 บนสถาปัตยกรรม Gateway → gRPC)

สิ่งที่ตกลงแล้ว: ไม่มี schema/migration ใหม่ (ใช้ SchoolBotSubmission, SchoolBotGradingJob, SchoolBotAttempt ที่มีอยู่) · เพิ่ม 5 RPC ใน AssessmentService (CreateSubmission, GetSubmission, StartAttempt, SaveAttemptAnswers, SubmitAttempt — รวมเป็น 40 RPC) · เพิ่ม field `id` แบบ optional ให้ Lesson/Mission/Criteria/Activity ใน response ของหลักสูตร · ซ่อน `trace_equals.commands` (เฉลย) จากหลักสูตรที่ส่งให้นักเรียน · HTTP ของ Gateway อยู่ใน AssessmentsController ใต้ `/api/service-school-bot` · ลำดับงาน: writer SchoolBot BE-015 → BE-031 (ต่อกัน) → ผู้ใช้ commit school-bot → writer Gateway sync proto (hash ตรงทุกไบต์) แล้วเพิ่ม action

สถานะ: มติของสถาปนิก ยังไม่ได้ implement · สัญญาที่โค้ดเป็นอยู่วันนี้คือ [Gateway–gRPC Rev4](gateway-grpc-contract-001.md) (35 RPC) จนกว่างานนี้จะลงโค้ด

## ปัญหาที่พบในโค้ดจริงซึ่งต้องแก้ไปพร้อมกัน

1. **ส่งงานไม่ได้จริงจาก Desktop:** หน้าหลักสูตรที่เผยแพร่แล้วไม่คืน id ของ Lesson, Mission, Criteria และ Activity (คืนเฉพาะ key) Desktop จึงไม่มี `mission_id`/`criteria_id` ที่จะใช้ส่งงาน
2. **เฉลยรั่ว:** หน้าหลักสูตรที่ส่งให้นักเรียนคืน `rules` ของเกณฑ์ทั้งก้อน รวมลำดับคำสั่งเฉลยของ `trace_equals` ซึ่งขัดกับ DES-005 API ที่บอกว่าห้ามส่ง secret tests ให้ Desktop
3. **`POLICY_NOT_CONFIGURED` ได้ 400:** code นี้ไม่อยู่ในตาราง `ErrorStatus.For` จึงตกไปที่ค่า default 400 ทั้งที่ DES-010 กำหนด 409
4. **`latest_submission` เป็น null เสมอ** ใน `GetProgress` (ฮาร์ดโค้ดไว้)
5. **ETag ผิดตัวเมื่อชนเวอร์ชัน:** ตัวจับ `VERSION_CONFLICT` ใน `AssessmentGrpcService.Run` ไปค้น question bank ด้วย routeId ถ้า RPC ของ attempt ใช้ตัวเดิม จะคืน `current_etag` ของ bank แทนของ attempt
6. **ไม่มี repository ที่เขียน attempt/submission และไม่มีตัวสุ่มลำดับ:** snapshot ของ stub store ยังไม่มีชุด `submissions`/`grading_jobs`
7. **ไม่มีสคริปต์ sync proto ฝั่ง school-bot** ทั้งที่กฎของ gateway อ้างถึง `sync-proto-to-gateway` จึงต้อง copy ไฟล์เอง


## 1. RPC ใหม่และ RPC เดิมที่ต้องแก้

**ไฟล์ `Assessment.proto` — เพิ่ม 5 RPC ใน `service AssessmentService`:**
```proto
rpc CreateSubmission (CreateSubmissionRequest) returns (SubmissionResponse);
rpc GetSubmission (GetSubmissionRequest) returns (SubmissionResponse);
rpc StartAttempt (StartAttemptRequest) returns (AttemptResponse);
rpc SaveAttemptAnswers (SaveAttemptAnswersRequest) returns (AttemptResponse);
rpc SubmitAttempt (SubmitAttemptRequest) returns (AttemptResponse);

message ArmEvidenceItem { string profile_hash = 1; string acceptance_ref = 2; string note = 3; }
message CreateSubmissionRequest {
  reserved 1; reserved "authorization";
  repeated string idempotency_key = 2;
  AssessmentBody body = 3;
  int32 mission_id = 4;
  int32 criteria_id = 5;
  int32 project_revision_id = 6;
  optional ArmEvidenceItem evidence = 7;
}
message GetSubmissionRequest { reserved 1; reserved "authorization"; int32 id = 2; }
message SubmissionResponse {
  int32 id = 1; int32 learner_id = 2; int32 mission_id = 3; int32 criteria_id = 4;
  int32 project_revision_id = 5; string submitted_at = 6; string state = 7; string update_date = 8;
  optional string assessment_json = 9;   // BE-015 ไม่มีค่า (null) เสมอ — BE-016/017 ค่อยกำหนดรูป
  string etag = 10;
}
message StartAttemptRequest {
  reserved 1; reserved "authorization";
  repeated string idempotency_key = 2; AssessmentBody body = 3;
  int32 course_run_id = 4; int32 activity_id = 5;
}
message AttemptAnswerList { repeated AssessmentAnswerItem items = 1; }   // ไม่มี list = ขาด member → 400
message SaveAttemptAnswersRequest {
  reserved 1; reserved "authorization";
  repeated string idempotency_key = 2; AssessmentBody body = 3;
  int32 id = 4; string if_match = 5; AttemptAnswerList answers = 6;
}
message SubmitAttemptRequest { /* field ชุดเดียวกับ SaveAttemptAnswersRequest */ }
```
Request ทุกตัวใช้รูปเดียวกับ question bank ที่มีอยู่ ได้แก่ `AssessmentBody`, `repeated idempotency_key` และ `if_match`

**ไฟล์ `Curriculum.proto` — เพิ่ม field แบบเพิ่มอย่างเดียว (ไม่ทำให้ผู้ใช้เดิมพัง):**
- `CriteriaItem.optional int32 id = 6`
- `MissionItem.optional int32 id = 7`
- `ActivityItem.optional int32 id = 8`
- `LessonItem.optional int32 id = 8`

กฎการใช้ field `id`:
- SchoolBot ใส่ค่าเฉพาะใน response ของ `GetPublishedCurriculum`/`GetAdminCurriculum` และไม่อ่านค่านี้จาก input
- Gateway ใช้ DTO แยกสำหรับ response; body ของ PUT content/import ที่มี `id` ยังได้ 400 เหมือนเดิม

**RPC เดิมที่ต้องแก้พฤติกรรม (proto ไม่เปลี่ยน):**

| RPC | ต้องเปลี่ยนอย่างไร | งาน |
|---|---|---|
| `GetPublishedCurriculum` | (1) ใส่ id ทั้งสี่ชนิด (2) ใน `automatic-v1` ทุก rule ที่เป็น `trace_equals` ให้เหลือแค่ `{id,type}` (ตัด `commands` ออก) ส่วนชนิดอื่นและ `teacher-v1` คงเดิม (3) admin view ไม่ตัดอะไร | BE-015 |
| `GetProgress` | (1) เติม `latest_submission_json` เป็น SubmissionView ล่าสุดตาม `SubmittedAt DESC, id DESC` ของ learner/mission ในโรงเรียนนี้ (2) ถ้าส่ง `course_run_id` มา ให้นับเฉพาะ submission ที่ audit `Submission.Accepted` มี Reason `course_run_id` ตรงกัน (3) เรียก finalizer ก่อนเลือก attempt | BE-015 / BE-031 |
| `GetAttempt` / `ListAttempts` | ถ้าเจอ attempt `started` ของผู้เรียนที่ถึง `deadline_at` ให้เรียก finalizer ก่อนสร้างผลที่คืน | BE-031 |
| `ErrorStatus.For` | ย้าย `POLICY_NOT_CONFIGURED` ไปกลุ่ม 409 และเพิ่ม code ใหม่ตามตารางถัดไป | BE-031 (POLICY) / ทั้งสองงาน |

**กติกาของ RPC ใหม่ — ลำดับการตรวจ:**
- **ก่อนเข้า commit:** body → `Idempotency-Key` → desktop + `P=student` → License → รูป input
- **ใน commit:** ตรวจสิทธิ์ซ้ำ → replay → `mutate`

**CreateSubmission:**
- `mutate` ตรวจตามลำดับ:
  1. Mission/Criteria/Activity/Curriculum ต้องมีอยู่และเป็นเนื้อหากลางที่ published
  2. `Criteria.MissionId == mission_id`
  3. ProjectRevision กับ Project เป็นของ `OwnerKind=student`, `OwnerId=LearnerId` และ `SchoolId` เดียวกับ session
  4. `Project.Mode == Activity.Mode` ของ activity แบบ `project-v1` ที่อ้าง mission นี้
  5. `evidence` ส่งได้เฉพาะโหมด arm
  6. resolve CourseRun ได้เพียงรอบเดียว: เงื่อนไขคือ school ของ session, `CurriculumId` = curriculum ของ mission, `Lifecycle=active`, `EffectiveAt<=now`, และ `authority.CanReadRunAsync` (roster)
- **สถานะที่บันทึก:** method `automatic` → `queued` และสร้าง GradingJob 1 แถว (`State=queued`, `Attempts=0`, `NextAttemptAt=SubmittedAt`, lease เป็น null) · method `teacher` → `awaiting_teacher` โดยไม่มี job
- `CreateBy`/`UpdateBy` = LearnerId
- **GetSubmission:** อ่านได้เฉพาะนักเรียนเจ้าของบน desktop; คนอื่นหรือคนละโรงเรียนได้ 404 ส่วนครูผ่าน school_web ยังไม่ทำในงานนี้ (ดู OQ)

**StartAttempt:**
- **ตรวจตามลำดับ:**
  1. Activity อยู่ใน `run.CurriculumId` และเป็น quiz/test (ไม่ใช่ → `409 STATE_CONFLICT`)
  2. resolve `effective_policy = PolicyOverride ?? default_policy` ด้วยตรรกะเดียวกับ `GetActivityPolicy` (แยกเป็นเมธอดใช้ร่วม)
  3. `run.CurrentPolicyId` เป็น null หรือ `reveal=after_close` แต่ไม่มี `closes_at` → `409 POLICY_NOT_CONFIGURED`
  4. หน้าต่างเวลา: `now<opens_at` → `ACTIVITY_NOT_OPEN` · `now>=closes_at` → `ACTIVITY_CLOSED`
  5. bank ต้อง published
  6. มีครั้งที่ `started` และยังไม่ถึง deadline → `409 STATE_CONFLICT` พร้อม `details.resource_id`
  7. จำนวนแถว (started/submitted/expired) ≥ `max_attempts` → `409 ATTEMPT_LIMIT_REACHED` (started ที่เลย deadline นับเป็นครั้งที่ใช้ไปแล้ว)
- **ค่าที่บันทึก:**
  - `Sequence` = max+1
  - `Snapshot`: questions ตาม `question_keys` · `question_order`/`option_order` ได้จาก `IAttemptShuffler` (seam ใหม่ใน Application; ค่าจริงใช้ `RandomNumberGenerator`, test ฉีดตัวกำหนดผลแน่นอนได้) · `policy_id=run.CurrentPolicyId` · `evaluator_version="question-v1"` · `effective_policy` · `opens_at`/`closes_at`
  - `deadline_at = min(started+limit, closes_at)` (ค่าที่เป็น null ข้ามไป)
  - `MaxScore` = ผลรวม `max_score` · `Answers="[]"`
- **ผลลัพธ์:** 201 พร้อม AttemptView

**SaveAttemptAnswers / SubmitAttempt:**
- ไม่มี `If-Match` → 428 (ตรวจก่อนเข้า commit)
- **`mutate` ตรวจตามลำดับนี้ ห้ามสลับ:**
  1. attempt ไม่มี หรือไม่ใช่ของผู้เรียน → 404
  2. `submitted` → `409 STATE_CONFLICT`
  3. `expired` หรือ `now>=deadline_at` → `409 ATTEMPT_EXPIRED`
  4. ETag ไม่ตรง → `412 VERSION_CONFLICT` พร้อม `current_etag` **ของ attempt**
  5. คำตอบไม่ผ่าน (key ไม่อยู่ใน snapshot / option ข้ามข้อ / ซ้ำ / เลือกเกิน 1) → `400 ANSWER_INVALID`
  - ข้อ 3 ต้องมาก่อนข้อ 4 เพราะ TP001-081 คาด 409 แม้ ETag เปลี่ยนไปแล้วหลัง finalize
- Save = แทนที่ `Answers` ทั้งชุด
- Submit = `submitted`, `SubmittedAt=t_accept`, `EarnedScore` = ผลรวมคะแนนเต็มของข้อที่เลือกตรง `correct_option_keys` ทุกตัว (ใช้ฟังก์ชันเดียวกับ feedback เดิม)
- evaluator version ที่ไม่รู้จัก → `503 GRADER_UNAVAILABLE`

**Finalizer — ใช้ร่วมกันหนึ่งตัว:**
- เป็นเมธอด repository ใหม่ที่เขียนนอก idempotency facade ได้ ทำงานใต้ lock: อ่าน attempt ใหม่ แล้วเปลี่ยนเฉพาะกรณีที่ยัง `started` และ `now>=deadline_at`
- ผลที่บันทึก: `expired`, `SubmittedAt=null`, `EarnedScore` คิดจาก `Answers` ที่บันทึกไว้, audit `Attempt.Expired` (Actor `service:attempt-finalizer`, `CreateBy/UpdateBy=null`), ไม่บันทึก ledger
- Save/Submit ที่ช้าจะไม่ finalize เอง แค่คืน 409 แล้วปล่อยให้การอ่านครั้งถัดไป finalize
  - เหตุผล: helper ไม่ commit ผลที่เป็น error เรื่องนี้ต่างจาก learning-attempt-finalization-001 ขั้น 6 ต้องบันทึกใน DES

**ตาราง error ที่ต้องเพิ่มใน `ErrorCodes` และ `ErrorStatus.For`** (ฝั่ง Gateway ไม่ต้องแก้ เพราะ validator ตรวจแค่คู่ status)

| code | HTTP | gRPC |
|---|---|---|
| COURSE_RUN_NOT_RESOLVED, CONTENT_NOT_PUBLISHED, ASSESSMENT_METHOD_MISMATCH, ATTEMPT_LIMIT_REACHED, ATTEMPT_EXPIRED, ACTIVITY_NOT_OPEN, ACTIVITY_CLOSED, POLICY_NOT_CONFIGURED (ย้ายกลุ่ม) | 409 | Aborted |
| ANSWER_INVALID, INVALID_INPUT (รวมกรณีขาด/ผิดรูป `Idempotency-Key`, ส่ง evidence ในโหมดที่ไม่ใช่ arm) | 400 | InvalidArgument |
| PROFILE_NOT_ALLOWED, CHANNEL_NOT_ALLOWED, LICENSE_REQUIRED (มีอยู่แล้ว) | 403 | PermissionDenied |
| NOT_FOUND | 404 | NotFound |
| VERSION_CONFLICT / PRECONDITION_REQUIRED | 412 / 428 | FailedPrecondition |
| GRADER_UNAVAILABLE | 503 | Unavailable |

ส่งผิดโหมด → `409 ASSESSMENT_METHOD_MISMATCH` (`details.field=project_revision_id`) · criteria ต่างฉบับ → `409 STATE_CONFLICT` (`details.field=criteria_id`)

## 2. HTTP ของ Gateway (Q = `/api/service-school-bot`) — อยู่ใน `AssessmentsController`

| Method + path | RPC | ผลสำเร็จ | Endpoint | ต้องส่ง |
|---|---|---|---|---|
| POST Q/submissions | CreateSubmission | 201 + ETag | Control 64KiB, raw body | JWT full login + `X-Device-Entitlement` + `Idempotency-Key` |
| GET Q/submissions/{id:int} | GetSubmission | 200 + ETag | Control | JWT + entitlement |
| POST Q/attempts | StartAttempt | 201 + ETag | Control, raw | JWT + entitlement + `Idempotency-Key` |
| PUT Q/attempts/{id:int}/answers | SaveAttemptAnswers | 200 + ETag | Control, raw | + `If-Match` + `Idempotency-Key` |
| POST Q/attempts/{id:int}/submit | SubmitAttempt | 200 + ETag | Control, raw | + `If-Match` + `Idempotency-Key` |

- **ช่องทาง desktop:** SchoolBot ให้ principal เป็น desktop ก็ต่อเมื่อมี `X-Device-Entitlement` (`GatewayPrincipalResolver.cs:32,85`) ไม่มี = school_web → `403 CHANNEL_NOT_ALLOWED`
- **`Idempotency-Key` เป็นค่าบังคับ:** ทั้งห้า mutation ใหม่ต้องมี (ตาม data-contract-rules-http) ขาด → `400 INVALID_INPUT`
- **Ledger:**
  - Principal = `principal.Session.PrincipalId` (รูป `{school}:desktop:{kind}:{id}` ซึ่งมี namespace แยกกันอยู่แล้ว) · SchoolId = โรงเรียนของ session
  - ชื่อ Operation: `create_submission`, `start_attempt`, `save_attempt_answers`, `submit_attempt`
  - RequestHash ใช้สูตรเดิม: create/start = `Serialize(request)` · save/submit = `id + "|" + Serialize(request)`

## 3. ตารางที่ใช้และหน่วย commit

| RPC | เขียน (PostgreSQL / key ใน stub snapshot) — หน่วยเดียวกัน |
|---|---|
| CreateSubmission | `SchoolBotSubmission` +1, `SchoolBotGradingJob` +1 (เฉพาะ automatic), `SchoolBotAuditEvent` `Submission.Accepted` (EntityType `SchoolBotSubmission`, Reason ตรงตัว `{"course_run_id":K}`), `SchoolBotIdempotency` +1 |
| StartAttempt | `SchoolBotAttempt` +1, audit `Attempt.Started`, ledger |
| SaveAttemptAnswers | Attempt (Answers/UpdateBy/UpdateDate), ledger — ไม่มี audit |
| SubmitAttempt | Attempt → submitted + คะแนน, audit `Attempt.Submitted`, ledger |
| finalizer | Attempt → expired + คะแนน, audit `Attempt.Expired` — ไม่มี ledger |

- **อ่านอย่างเดียว:** Curriculum/Lesson/Mission/Criteria/Activity, Project/ProjectRevision, CourseRun, CourseRunActivity, QuestionBank
- **ไม่แตะ:** `SchoolBotAssessment` (ต้องเป็น 0 ตลอด BE-015), RetakeGrant, ScoringPolicy
- **Stub:** เพิ่ม `submissions`/`grading_jobs` ใน `CurriculumStoreSnapshot` แบบ `WhenWritingNull` ตามแบบเดิม (des-010-stub-persistence) ใช้ record ชื่อคอลัมน์ตาม DDL
- **PostgreSQL:** lock CourseRun (`FOR UPDATE`) ใน transaction ของ helper สำหรับ submission/start และ lock แถว Attempt สำหรับ save/submit/finalize
- **อ่านเพิ่มที่ต้องมี:** `GetMissionById`, `GetCriteriaById`, `GetLessonById` (ICurriculumRepository) · `GetProjectRevisionById` (IProjectRepository) · `ListCourseRuns(schoolId, curriculumId)` และ submission read/write (IAssessmentRepository)
- **ทำครบทั้งสองชุด:** ต้อง implement ทั้ง Memory และ Databases เพราะ DI เลือกตาม `Storage`

## 4. การ sync proto และลำดับงาน writer

1. **writer SchoolBot BE-015:** แก้ Curriculum.proto + Assessment.proto (submission) และ service/repository แล้วรัน `dotnet test ServiceSchoolBot.slnx --disable-build-servers -m:1`
2. **writer SchoolBot BE-031:** ทำต่อจากข้อ 1 **แบบต่อกัน ไม่ทำขนาน** (แก้ไฟล์ชุดเดียวกัน: Assessment.proto, AssessmentGrpcService, IAssessmentRepository, snapshot) เพิ่ม attempt RPC แล้วรัน test ชุดเดิม
3. **ผู้ใช้ commit school-bot** (git ที่เปลี่ยน state เป็นของผู้ใช้) จะได้ commit sha C
4. **writer Gateway:**
   - ทำตามขั้น ack handbook ของ repo gateway ก่อน (hook บล็อกการแก้ `*.proto`)
   - `Copy-Item -LiteralPath` ไฟล์ทั้ง 6 จาก `school-bot/web/src/ServiceSchoolBot.Infrastructure/Protos/ServiceSchoolBot/` ไป `sb-api-gateway/src/ApiGateway.Infrastructure/Protos/ServiceSchoolBot/` ห้ามเปิดแก้
   - รัน `scripts/proto-hash.ps1 -ProtoDir <dir>` ทั้งสองฝั่ง ต้องได้ hash ตรงกันทุกไบต์
   - เขียน `.proto-hash` = `{hash, commit:C, dirty:false, syncedAt}` · ถ้ายังไม่มี C ห้ามใส่ `dirty:false` และงานยังไม่เสร็จ
5. **writer Gateway (ต่อ):** เพิ่ม action ทั้ง 5 + repository/DTO (รวม response DTO ที่มี id ของหลักสูตร) แล้ว build + test

## 5. Mapping เคส normal (ผลที่คาดไม่เปลี่ยน)

| path เดิม | Gateway ใหม่ | RPC |
|---|---|---|
| GET /v2/curricula(?mode=) · /v2/curricula/{id} | GET Q/curricula · Q/curricula/{id} | ListPublishedCurricula · GetPublishedCurriculum (แก้) |
| POST /v2/submissions · GET /v2/submissions/{id} | POST Q/submissions · GET Q/submissions/{id} | CreateSubmission · GetSubmission |
| GET /v2/progress?… | GET Q/progress?… | GetProgress (แก้) |
| POST /v2/attempts | POST Q/attempts | StartAttempt |
| PUT /v2/attempts/{id}/answers · POST …/submit | PUT Q/attempts/{id}/answers · POST Q/attempts/{id}/submit | SaveAttemptAnswers · SubmitAttempt |
| GET /v2/attempts/{id} · GET /v2/attempts?… | GET Q/attempts/{id} · Q/attempts?… | GetAttempt · ListAttempts (แก้) |
| POST/GET โครงงาน Cloud (TP001-024) | POST Q/projects · GET Q/projects/{id} | ProjectService |

เคสที่กระทบ: TP001-054, TP001-116 (BE-015) · TP001-117, TP001-118, TP001-081, TP001-024 (BE-031)

- **ระดับ RPC:** "201/200" = gRPC OK ส่วน status จริงมาจาก controller · error ดู `SchoolBotError.http_status`
- **ต้องให้ inspect ชี้แจงในเอกสาร test (ผลที่คาดคงเดิม):**
  - TP001-054 ส่วนเทียบ cur2 ต้องเรียก `Q/progress?curriculum_id=cur2` โดยไม่ส่ง `course_run_id` เพราะ run1+cur2 ได้ 400 INVALID_QUERY ตามโค้ดจริง
  - Setup A ต้อง seed `run11.CurrentPolicyId` เป็นค่า fixture เช่น 901 ไม่งั้น StartAttempt ได้ 409 POLICY_NOT_CONFIGURED ตามกฎผลเรียนที่ว่า policy เป็น NULL = เปิดรอบไม่ได้
  - "400/409" ของการส่งผิดโหมด/ข้ามฉบับ ตอนนี้กำหนดชัดเป็น 409 ทั้งคู่ (ตามข้อ 1)

## 6. เรื่องที่เปิดไว้

ไม่มีเรื่องที่ต้องรอคนอนุมัติ: ไม่มี schema/migration, proto เพิ่มอย่างเดียว และ POLICY 409 เป็นการทำโค้ดให้ตรงสัญญาเดิม

- **OQ-a (เจ้าของเนื้อหา):** เกณฑ์ public ซ่อนเฉพาะ `trace_equals.commands` ตามค่าเริ่มที่ผมเลือก — ยืนยันว่า `steps_at_most`/`uses_op` แสดงให้นักเรียนเห็นได้ ไม่บล็อกงาน
- **OQ-b (PM/planner):** StartAttempt ยังไม่ใช้สิทธิ์สอบซ่อม (RetakeGrant) เพราะไม่มีที่เก็บใน stub และเคส normal ไม่ใช้ ต้องมีเจ้าของงานถัดไป
- **OQ-c (planner):** ครูอ่าน submission ผ่าน school_web ยังไม่ทำใน BE-015 (ตอนนี้ได้ 403 CHANNEL_NOT_ALLOWED) รอ BE-017
- **สิ่งที่ต้องมีคนทำ (ไม่ใช่ gate):** ผู้ใช้ commit school-bot ก่อนขั้น sync proto

## คำถามค้าง (ไม่บล็อกงาน)

- เจ้าของเนื้อหา: เกณฑ์ public ซ่อนเฉพาะ `trace_equals.commands` — ยืนยันว่า `steps_at_most`/`uses_op` ให้นักเรียนเห็นได้
- PM/planner: StartAttempt ยังไม่ใช้สิทธิ์สอบซ่อม (RetakeGrant) ต้องมีเจ้าของงานถัดไป
- planner: ครูอ่าน submission ผ่าน school_web ยังไม่ทำใน BE-015 (ได้ 403 CHANNEL_NOT_ALLOWED) รอ BE-017

## หลักฐาน

มติจาก arch 2026-11-04 (ใบงาน107 ใน memory) · อ้างโค้ด GatewayPrincipalResolver.cs:32,85 · ErrorStatus.For · AssessmentGrpcService.Run · สัญญา des-005-api, des-010-stub-persistence, idempotency-001, learning-attempt-finalization-001, data-contract-rules-http
