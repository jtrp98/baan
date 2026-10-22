# Logical data contract — Rev4

อ้าง REQ-011, 027–029, 033–039, 040–052; decisions-012, 013, 020–026; อ้าง physical design ใน [db/review-001.md](../db/review-001.md) ชุดนี้เป็น CONFIRMED logical baseline ตาม [decisions-026.md](../requirement/decisions-026.md)

## ชนิดและกฎร่วม

`K` = PostgreSQL int4, 1–2147483647; `U` = UUID ที่ไม่ใช่ table key; `N` = integer ≥1; `B` = boolean; `Tn` = Unicode string ยาวไม่เกิน n; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `?` = nullable; `[]` = array; ค่าอื่น non-null ไม่มี implicit default

`I` = signed int32; `S` = SchoolId:I (JSON integer); ชนิดยืนยันจาก source ([source-review-002.md](../source-review-002.md) และ [db/review-001.md](../db/review-001.md))

`DecimalString` = JSON string ของเลขฐานสิบไม่ติดลบ ไม่มี exponent/เครื่องหมายบวก ไม่เกิน 6 ตำแหน่งทศนิยม; เก็บคะแนนใน DB เป็น `numeric(18,6)` (และเกณฑ์เลื่อน Level เป็น `numeric(9,6)` ช่วง `0..100`); ค่าติดลบ/NaN/Infinity ถูกปฏิเสธ; API ไม่ใช้ float สำหรับคะแนนหรือน้ำหนัก; `weight_bps` เป็น `int4` ช่วง `0..10000`

Legacy term identifier (`NTerm`) ใช้ `T64` ไม่ใช่ `K` หรือเลขภาคเรียนที่เดาเอง; PGGradeDB `GradeAuditLogId` (`ReceiptId`) เป็น `int8` และส่งใน API เป็น decimal string

`P={school_id:S,kind:student|employee,profile_id:I}`; student → `TUser(SchoolId,SId)`, employee → `TEmployees(SchoolId,SEmp)`. `AccountId:I` → `TMasterDBUser.sID` แยกจาก `P`; ห้ามเดา link

`A` = string ≤512:
- ช่อง `desktop`: `account:<S>:<AccountId>:none` ก่อนเลือก `P` หรือ `account:<S>:<AccountId>:<kind>:<profile_id>` หลังเลือก (`kind` เป็น `student` หรือ `employee` ตาม decisions-025/026)
- ช่อง `school_web`: `web:<S>:employee:<I>` หรือ `web:<S>:admin:<T64>`
- ช่อง `staff_admin`: `staff:<S>:<I>`
- อุปกรณ์/บริการ: `device:<H>`, `service:<name>`
โดย integer ใช้ canonical decimal และ `name` ตรง `[A-Za-z0-9._-]{1,128}` จาก server เท่านั้น

**ทุกตาราง** ด้านล่างมี common columns จริง (ไม่มี Version — optimistic concurrency ใช้ `UpdateDate` เป็น ETag/If-Match ตาม [decisions-030](../requirement/decisions-030.md)):

| Column | ชนิด/กฎ |
|---|---|
| IsDelete | B; เริ่ม false; soft delete โดย authorized operation |
| CreateBy | I?; server กำหนด — sEmp ของพนักงาน/ครู หรือ sId ของนักเรียนที่ทำ; null = ระบบทำเอง (job/worker); ชนิดผู้ทำดูจากตารางและ AuditEvent.Actor ตาม [decisions-028](../requirement/decisions-028.md) |
| CreateDate | D; server UTC |
| UpdateBy | I?; เริ่มเท่ากับ CreateBy; กฎเดียวกับ CreateBy |
| UpdateDate | D; เริ่มเท่ากับ CreateDate |
| SchoolId | S?; non-null (`SchoolId > 0`) ยกเว้น global rows ที่กำหนดให้ `SchoolId = null` ด้านล่าง |

ทุกตาราง SchoolBot มี PK `SchoolBot<Entity>Id:K` ที่ server จัดสรร (`GENERATED ALWAYS AS IDENTITY`); FK/current pointer ที่ชี้ PK ภายใน tenant เดียวกันใช้ `K` และตรวจ `(SchoolId,XId)` ส่วนการอ้าง global content (`SchoolId=null`) จาก school rows ใช้ PK จริงโดยไม่ใช้ composite FK ที่มี nullable `SchoolId`; legacy refs:I ไม่เป็น physical FK ข้าม DB

`K` เป็น JSON integer; create ไม่รับ PK จาก client และคืน `K` หลัง commit เท่านั้น ห้าม wrap/reuse เมื่อเต็ม; `CurrentRevision`, `Revision`, `Sequence`, `BindingEpoch` เป็น `N` ไม่ใช่ row ID

Default reads ตัด `IsDelete=true`; unique keys ที่ระบุไม่ถูกคืนให้ใช้ใหม่เมื่อ soft delete เว้นแต่ระบุ “live” ห้าม cascade hard delete ผลเรียน/ประวัติ/receipt; Immutable rows ไม่แก้ business fields หลังสร้าง

## ตารางครบทุก field นอก common columns/PK (33 ตาราง)

| ตาราง | Fields |
|---|---|
| **SchoolBotLicense** | SchoolName:T200, KeyHash:H, KeyHint:T32, ExpiresAt:D, RevokedAt:D?, CurrentBindingId:K?, BindingEpoch:N, AllowedNextJkt:H? |
| **SchoolBotLicenseBinding** | LicenseId:K, DeviceJkt:H, PublicJwk:Jwk, Epoch:N, ActivatedAt:D, DetachedAt:D?, LastCheckedAt:D, LastEntitlementExpiresAt:D |
| **SchoolBotSession** | Channel:SessionChannel, AccountId:I?, TokenHash:H, ProfileKind:(student\|employee)?, ProfileId:I?, DeviceJkt:H?, LegacyAdminId:T64?, SourceTokenExpiresAt:D?, ExpiresAt:D, RevokedAt:D? |
| **SchoolBotStaffRole** | EmployeeId:I, Role:StaffRole, ValidFrom:D, ValidUntil:D?, Reason:T1000 |
| **SchoolBotTeacherGrant** | TeacherId:I, LearnerId:I, Mode:Mode, CanView:B, CanAssess:B, ValidFrom:D, ValidUntil:D? |
| **SchoolBotProject** | OwnerKind:student\|employee, OwnerId:I, Mode:Mode, Name:T200, CurrentRevision:N |
| **SchoolBotProjectRevision** | ProjectId:K, Revision:N, Content:ProjectContent, ContentHash:H |
| **SchoolBotLevel** | LevelKey:U, Code:T64, Ordinal:N, Title:Text |
| **SchoolBotLevelPromotionPolicy** | LevelId:K, Revision:N, Threshold:numeric(9,6), Reason:T1000 |
| **SchoolBotCurriculum** | CurriculumKey:U, Revision:N, LevelId:K, Title:Text, SourceRef:T2048, RecommendedGrades:T16[], Subjects:CurriculumSubject[], Lifecycle:ContentState, PublishedAt:D? |
| **SchoolBotLesson** | CurriculumId:K, LessonKey:U, Ordinal:N, Title:Text, Objective:Text, Instructions:Text |
| **SchoolBotMission** | LessonId:K, MissionKey:U, Ordinal:N, Title:Text, Instructions:Text, Method:AssessmentMethod |
| **SchoolBotCriteria** | MissionId:K, Revision:N, Rules:CriteriaRules, SourceRef:T2048, ApprovedBy:A?, ApprovedAt:D? |
| **SchoolBotActivity** | LessonId:K, ActivityKey:U, Ordinal:N, Title:Text, Type:ActivityType, Mode:Mode?, Indicators:Indicator[], Config:ActivityConfig |
| **SchoolBotQuestionBank** | BankKey:U, Revision:N, Title:Text, Questions:Question[], SourceRef:T2048, Lifecycle:ContentState, PublishedAt:D? |
| **SchoolBotCourseRun** | CurriculumId:K, ClassroomId:I, NYear:I, NTerm:T64, PlanCourseIds:I[], CurrentPolicyId:K?, PreviousRunId:K?, EffectiveAt:D, Lifecycle:CourseRunState |
| **SchoolBotScoringPolicy** | CourseRunId:K, CurriculumId:K, Revision:N, Policy:ScoringPolicy |
| **SchoolBotCourseRunActivity** | CourseRunId:K, ActivityId:K, OpensAt:D?, ClosesAt:D?, PolicyOverride:AssessmentPolicy? |
| **SchoolBotSubmission** | LearnerId:I, MissionId:K, CriteriaId:K, ProjectRevisionId:K, SubmittedAt:D, State:SubmissionState, CurrentAssessmentId:K?, Evidence:ArmEvidence? |
| **SchoolBotGradingJob** | SubmissionId:K, State:JobState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, LastErrorCode:T64? |
| **SchoolBotAssessment** | SubmissionId:K, Sequence:N, Method:AssessmentMethod, Outcome:Outcome, RuleResults:RuleResult[], EarnedScore:numeric(18,6)?, MaxScore:numeric(18,6)?, Feedback:T4000, GraderVersion:T128?, AssessorId:I?, SupersedesId:K?→Assessment |
| **SchoolBotAttempt** | CourseRunId:K, ActivityId:K, LearnerId:I, Sequence:N, State:AttemptState, StartedAt:D, DeadlineAt:D?, SubmittedAt:D?, Snapshot:AttemptSnapshot, Answers:Answer[], EarnedScore:numeric(18,6)?, MaxScore:numeric(18,6) |
| **SchoolBotRetakeGrant** | CourseRunId:K, ActivityId:K, LearnerId:I, Reason:T1000, ConsumedAttemptId:K? |
| **SchoolBotGradeSlot** | CourseRunId:K, PlanCourseId:I, CourseId:I, NGradeId:I, AssessmentId:I, ScoreIdentifier:T128, Category:Category, TargetSnapshot:TargetSnapshot, OwnershipReason:T1000, RetiredAt:D? |
| **SchoolBotScoreMapping** | CourseRunId:K, GradeSlotId:K, Sources:MappingSource[], RetiredAt:D? |
| **SchoolBotScorePreview** | CourseRunId:K, Principal:A, SnapshotHash:H, ExpiresAt:D, State:PreviewState, SupersedesId:K?, Context:PreviewContext |
| **SchoolBotScorePreviewItem** | ScorePreviewId:K, LearnerId:I, State:PreviewItemState, ReasonCodes:T64[], Snapshot:PreviewItemSnapshot |
| **SchoolBotScoreExport** | ScorePreviewId:K, ConfirmedBy:A, ConfirmedAt:D, State:ExportState |
| **SchoolBotScoreOutbox** | ScoreExportId:K, ScorePreviewItemId:K, OperationKey:U, PayloadHash:H, State:OutboxState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, ReceiptId:int8?, ReceiptHash:H?, LastErrorCode:T64? |
| **SchoolBotLevelProposal** | CourseRunId:K, TargetCurriculumId:K, SnapshotHash:H, Snapshot:LevelSnapshot, State:LevelProposalState, DecisionBy:A?, DecisionAt:D?, Reason:T1000?, SuccessorRunId:K? |
| **SchoolBotRelease** | VersionText:T32, Channel:Channel, Platform:Platform, Manifest:T16384, ArtifactHash:H, Lifecycle:ReleaseState, PublishedAt:D?, WithdrawnAt:D? |
| **SchoolBotIdempotency** | Principal:A, Operation:T200, RequestKey:U, RequestHash:H, NonceHash:H?, HttpStatus:integer100–599, ResultCipher:bytes?, ResultKeyId:T128?, ResourceId:K?, CompletedAt:D, ReplayUntil:D |
| **SchoolBotAuditEvent** | Actor:A, Event:T64, EntityType:T64, EntityId:K, RequestId:U, Reason:T1000 |

ขอบเขต `SchoolId` ตามมติ [decisions-026.md](../requirement/decisions-026.md):
- **Global เท่านั้น (`SchoolId = null` เสมอ — 8 ตาราง)**: `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank`
- **Mixed Global/Tenant (`SchoolId = null` เฉพาะ catalog/operation กลาง หรือ `SchoolId > 0` สำหรับรายการรายโรงเรียน — 3 ตาราง)**: `SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent`
- **Tenant เท่านั้น (`SchoolId > 0` เสมอ — 22 ตาราง)**: ตารางอื่นทั้งหมด (โดย `SchoolBotStaffRole.SchoolId` คือโรงเรียนต้นสังกัดของบัญชีพนักงาน)
ทุกแถวยังมีคอลัมน์มาตรฐานครบ ห้ามใช้ `SchoolId = 0` หรือค่าจำลองแทน global

`ResourceId:K?` ชี้ resource หลักที่ endpoint คืนตาม `Operation`; `EntityType` = ชื่อตารางที่ `EntityId:K` อ้าง. Web ตรวจชนิด/`SchoolId` เพราะไม่ใช่ FK เดี่ยวข้ามตาราง. Local UUID/receipts ไม่เป็น DB PK; ไม่เพิ่ม `ClientId`/public UUID

## Enums และ embedded types

- `Mode=block|arm|code`
- `ActivityType=instruction|project|quiz|test`
- `Role=student|teacher|school_admin` normalized โดย web; ไม่ใช่ค่า `cType`/`UserType` และ `employee` ไม่เท่ากับ `teacher`
- `SessionChannel=desktop|school_web|staff_admin`
- `StaffRole=content_author|content_approver|level_policy_admin|license_admin|release_publisher|dashboard_viewer|staff_admin`
- `AssessmentMethod=automatic|teacher`
- `ContentState=draft|published|retired`
- `CourseRunState=planned|active|closing|closed`
- `SubmissionState=queued|grading|awaiting_teacher|evaluated|error`
- `JobState=queued|running|completed|failed`
- `Outcome=passed|not_yet`
- `QuestionKind=single_choice|boolean`
- `AttemptState=started|submitted|expired|voided`
- `Category=before_midterm|after_midterm|midterm|final`
- `PreviewState=open|conflicted|confirmed|superseded|expired`
- `PreviewItemState=ready|conflict|blocked`
- `ExportState=queued|running|paused_conflict|reconciling|completed|completed_with_skips|failed`
- `OutboxState=queued|running|applied|skipped|conflict|blocked|unknown`
- `LevelProposalState=proposed|promoted|retained|max_level|stale`
- `ReleaseState=draft|published|withdrawn`
- `Channel=stable|beta`
- `Platform=windows-amd64|darwin-amd64|darwin-arm64`
- `Jwk={kty:"EC",crv:"P-256",x:base64url32,y:base64url32}`; ไม่มี private field
- `Text={default_locale:"th"|"en"|"zh",th:T8000?,en:T8000?,zh:T8000?}`; locale หลักต้องมีข้อความ เนื้อหาหลักสูตรไม่ใช่ UI catalog
- `CurriculumSubject={subject_key:U,code:T64,title:Text}`
- `Indicator={indicator_key:U,code:T128,title:Text}`
- `ActivityConfig`:
  - `{kind:"instruction-v1",instructions:Text,media_refs:T2048[]}`
  - `{kind:"project-v1",mission_id:K}`
  - `{kind:"question-v1",bank_id:K,question_keys:U[],default_policy:AssessmentPolicy}`
- `AssessmentPolicy={max_attempts:N|null,selection:best|first|latest,time_limit_seconds:integer>=1|null,reveal:after_submit|after_close,shuffle_questions:B,shuffle_options:B}`
- `ScoringPolicy={quiz_counts:B,activity_weights:[{activity_id:K,weight_bps:int0..10000}],formula_version:T64|null}`
- `Question={question_key:U,kind:QuestionKind,prompt:Text,options:[{option_key:U,text:Text}],correct_option_keys:U[],max_score:DecimalString}`
- `Answer={question_key:U,selected_option_keys:U[]}`
- `AttemptSnapshot={bank_id:K,bank_revision:N,activity_version:N,policy_id:K,evaluator_version:T128,questions:Question[],question_order:U[],option_order:[{question_key:U,option_keys:U[]}]}` (server-only; API คืนเฉพาะ `PublicQuestion` ที่ตัด `correct_option_keys`)
- `MappingSource={activity_id:K,indicator_key:U|null,weight_bps:int0..10000}`
- `TargetSnapshot={n_year:I,n_term:T64,classroom_id:I,plan_course_id:I,course_id:I,n_grade_id:I,assessment_id:I,score_identifier:T128,max_score:DecimalString,header_token:T512,assessment_token:T512,settings_hash:H}`
- `PreviewContext={mapping_versions:[{id:K,version:N}],policy_id:K,roster:I[],writer_version:T128,calculator_version:T128,authorization_checked_at:D}`
- `SourceResultRef={kind:assessment|attempt,id:K,version:N,activity_id:K,earned:DecimalString,max_score:DecimalString,weight_bps:int0..10000}`
- `PreviewItemSnapshot={cells:[{mapping_id:K,grade_slot_id:K,target:TargetSnapshot,grade_detail_id:I,row_token:T512,old_score:T128|null,last_exported_score:T128|null,raw_target:DecimalString,new_score:integer>=0,source_hash:H,sources:SourceResultRef[],special_result:T128|null,grade_edit_fingerprint:H,before_document_hash:H,decision:apply|keep_destination|replace_owned}],reason_codes:T64[]}`
- `LevelSnapshot={promotion_policy_id:K,promotion_policy_revision:N,formula_version:T64,policy_hash:H,scoring_policy_id:K,roster:[{learner_id:I,total:DecimalString|null,source_hash:H}],average:DecimalString|null,threshold:DecimalString,gap:DecimalString|null,member_count:integer>=0,missing_as_zero:true,eligible:B,effective_at:D,target_n_year:I,target_n_term:T64}`
- `RuleResult={rule_id:U,matched:B}`
- `ArmEvidence={profile_hash:H,acceptance_ref:T2048,note:T4000}`; เป็นข้อมูลประกอบ ไม่ยืนยันการเคลื่อนไหว
- `ProjectContent` นิยามครบใน [des-003.md](des-003.md); `CriteriaRules` ใน [des-005.md](des-005.md); `Manifest` เป็น JWS ตาม [des-007.md](des-007.md)

## Legacy refs / placement

ถอน `SchoolBotUser` ไม่คัดลอกบัญชี/password หรือเพิ่ม identity mapping table; `SchoolBotSession` เก็บสิทธิ์เข้าใช้งานที่เพิกถอนได้แยกตาม `Channel` (`desktop|school_web|staff_admin`) ไม่ใช่บัญชีใหม่ ทุกตารางข้างต้นมี prefix/PK และ common columns ครบ

`Owner=(SchoolId,OwnerKind,OwnerId)`; `LearnerId` คือ `student`; `TeacherId`/`AssessorId`/`EmployeeId` คือ `employee` ใช้ `SchoolId` ของ row ประกอบ `P`; API legacy `*_id:I` ใช้ context/kind เดียวกัน (`owner` มี `owner_kind`); resource IDs ของ SchoolBot เป็น `K`

`SchoolBotTeacherGrant` เป็นทางสำรอง (conditional fallback) ตาม [des-004.md](des-004.md) ซึ่งยังไม่ได้ตัดสินให้สร้างตาม [decisions-026.md](../requirement/decisions-026.md)

ใช้ 4 DB เดิม: Master อ่านบัญชี; School อ่าน profile/แผนการเรียนและวาง **ทุกตาราง SchoolBot (33 ตาราง)** ใน physical target เดียว (`JabjaiSchoolSingleDB`, schema `public`) รวม `Session`/`Idempotency`/`AuditEvent`/`Release`; Logs ใช้ตามกรณีที่ระบุ; **PGGradeDB**: SchoolBot เขียนเฉพาะช่องเกรดที่เป็นเจ้าของตาม [des-009.md](des-009.md) หลังผ่าน release gates ทั้งห้า (`G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, `G-DB`) และมนุษย์อนุมัติการรัน `db/007_pggradedb_grants.sql` โดยไม่เปลี่ยน schema PGGradeDB และไม่เพิ่ม DB ที่ห้า (การรัน SQL `001–007` ทั้งหมดยังรอให้มนุษย์รันบนฐานทดสอบและส่ง `DBA-003` ตรวจตาม [decisions-026.md](../requirement/decisions-026.md))

## กฎข้อมูลและ HTTP contract ร่วม

อ่าน [data-contract-rules.md](data-contract-rules.md) ประกอบเสมอ: มี relations, uniqueness, invariants, error envelope, headers, pagination และขนาด payload ของ DES ทั้งชุด

## Change Log
- 2026-10-22 — Rev4.2: ถอน Version จาก common columns ใช้ UpdateDate เป็น concurrency token ตาม decisions-030 (ส่วนอื่นยังรอ SA sync กับ SQL Rev5/decisions-027/029)
- 2026-10-22 — Rev4.1: CreateBy/UpdateBy เป็น I? (sEmp/sId, null = ระบบ) ตาม decisions-028
- 2026-10-22 — Rev4: sync logical baseline 33 ตารางตามมติอนุมัติ decisions-026 (รวม amendment-proposal-001/002 และแก้ 2 จุดตาม decisions-025: Desktop bind ได้ทั้ง student/employee, school_web ต้องตรวจ License active ของโรงเรียน); ถอน Curriculum.Mode, เพิ่ม global content (SchoolId=null), Session.Channel, StaffRole, CourseRun/Activity/Attempt/Retake, GradeSlot/ScoreMapping/Preview/Export/Outbox และ LevelProposal
- 2026-10-21 — Rev3: PK/FK เป็น K; แยก legacy I และ logical UUID U
- 2026-10-21 — Rev2: legacy keys; ถอน User ซ้ำ เพิ่ม Session/placement
- 2026-10-21 — Rev1: เสนอ logical schema, audit/SchoolId ทุกตาราง, concurrency และ error contract เพื่อส่ง DBA หลังอนุมัติ
- 2026-10-21 — MYCELIUM แยกกฎข้อมูลและ HTTP contract เพื่อคุมขนาด โดยไม่เปลี่ยน fields หรือ IDs
