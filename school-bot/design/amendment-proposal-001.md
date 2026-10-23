# Amendment proposal 001 — DES-005 / data-model / data-contract-rules / DBML

สถานะ: APPLIED — อนุมัติเป็น baseline ใหม่ตาม [decisions-026.md](../requirement/decisions-026.md) (2026-10-22) ร่วมกับ [amendment-proposal-002.md](amendment-proposal-002.md) และ sync เข้า `data-model.md` Rev4, `data-contract-rules.md` Rev4, `des-005.md` Rev4, `schoolbot.dbml` Rev2 และ `schema-notes.md` Rev2 แล้ว (ฉบับก่อน amend เก็บ verbatim ที่ `design/archive/2026-10-22-before-rev4/`)

ที่มา: SA (codex t1) 2026-10-22 รายงานเต็ม `C:/src/AICode/baan/baan/reports/2026-10-22-07-35-43-sa-tier-t1-1agents-6X8T00` ส่วนที่ 6–9 คัดลอกด้านล่างโดยไม่แก้เนื้อหา

หมายเหตุ นายช่าง: SA ร่างก่อน [decisions-022](../requirement/decisions-022.md) — หน้า admin อยู่ Next.js ใน school-bot-v2/web, หน้าครูอยู่ web-system; endpoint `/v2/admin/*` และ teacher endpoints ต้องออกแบบ auth ข้ามระบบเพิ่ม

---

**6. ข้อความ amend `DES-005` เฉพาะจุด — Rev3 → Rev4**

ให้เก็บ Rev3 เดิมทั้งไฟล์ลง `archive.md` แบบ verbatim ก่อน amend จริง งานนี้ไม่ได้เขียน archive

| จุดเดิม | ข้อความแทน/เพิ่ม |
|---|---|
| บรรทัด 3 | เพิ่มอ้าง `decisions-020/021, DES-008–011` โดยยังไม่เพิ่ม REQ/AC ที่ BA ไม่ได้จัดสรร |
| บรรทัด 14 | เปลี่ยน Content author เป็น SchoolBright ส่วนกลาง โรงเรียนเลือก published revision แต่แก้เนื้อหาไม่ได้ |
| บรรทัด 20 | แทนด้วยข้อความด้านล่าง |
| บรรทัด 41 | `GET /curricula` ใช้ `level_id`, `recommended_grade`, `subject_key`, `mode` เป็นตัวกรอง โดย mode หมายถึงมี Activity โหมดนั้น ไม่ใช่ Curriculum.Mode |
| บรรทัด 43 | request สร้างหลักสูตรเป็น `{curriculum_key,revision,level_id,title,source_ref,recommended_grades,subjects}` |
| บรรทัด 52–53 | เพิ่ม ActivityInput ตามด้านล่าง ไม่ลบ Mission/Criteria เดิมทิ้ง |
| บรรทัด 65 | ProgressView เพิ่ม `course_run_id`, `level_id`, `activities`; เลิกบังคับ mode เดียวทั้ง curriculum |
| บรรทัด 77 | ตรวจ project mode ตรง `Activity.Mode` ของ project activity แทนตรง Curriculum.Mode |
| หลังบรรทัด 87 | เพิ่ม numeric assessment และการอ้าง DES-008–011 |
| Change Log | `2026-10-22 — Rev4: แยก Activity/Mode, เพิ่ม Level และหลักสูตรกลาง; ผูก Question Bank, ScoringPolicy, mapping/export และ whole-room progression; breaking/schema amendments ยังรออนุมัติ` |

ข้อความแทน content contract:

```text
Curriculum revision เป็นเนื้อหากลางของ SchoolBright สำหรับหนึ่ง Level
และการเรียนประมาณหนึ่งภาคเรียน จำนวน 22 สัปดาห์เป็นบริบทเนื้อหา
ไม่เป็น hardcoded จำนวน Lesson

Curriculum ไม่มี Mode เดียว; Mode อยู่ที่ Activity
Level มี logical key ถาวรและลำดับ Beginner → Expert ที่จัดการผ่านข้อมูล
ระดับชั้น ป.1–ม.6 เป็นคำแนะนำเริ่มต้น ไม่ใช้เป็นข้อห้ามเข้า Level
Subjects เป็นรหัสวิชากลาง ไม่ใส่ Tplane/Pgtassessment ของโรงเรียน
ใน curriculum กลาง

LessonKey เป็น U ถาวรของบทเรียนข้าม revision
Ordinal เป็นลำดับภายใน curriculum revision เปลี่ยนลำดับแล้วไม่เปลี่ยน key
ActivityKey และ IndicatorKey ใช้หลักเดียวกัน
row ID เป็น K ใหม่เมื่อสร้าง content revision ใหม่
Published curriculum และ children immutable
```

สัญญา Activity ที่เพิ่ม:

```text
ActivityInput={
activity_key:U,ordinal:N,title:Text,
type:instruction|project|quiz|test,
mode:block|arm|code|null,
indicators:[{indicator_key:U,code:T128,title:Text}],
config:ActivityConfig
}

ActivityConfig =
{kind:"instruction-v1",instructions:Text,media_refs:T2048[]}
| {kind:"project-v1",mission_id:K}
| {kind:"question-v1",bank_id:K,question_keys:U[],
   shuffle_questions:B,shuffle_options:B}

project ต้องมี Mode; instruction/quiz/test ใช้ mode=null
project mission อยู่ Lesson เดียวกันและมีเจ้าของ Activity เดียว
Method ของ mission ต้องตรง Activity.Mode ตามกฎ Code/Block/Arm เดิม
ไม่เพิ่มชนิด config ที่ server ไม่มี validator/evaluator

SchoolBotAssessment เพิ่ม EarnedScore/MaxScore nullable
ต้อง null พร้อมกัน หรือ 0<=EarnedScore<=MaxScore และ MaxScore>0
ค่าเหล่านี้มาจาก approved numeric rubric/evaluator เท่านั้น
ผลเดิมที่มีแค่ Outcome ยังคงอ่านได้ แต่ส่งคะแนนไม่ได้
Question/Attempt/ScoringPolicy ตาม DES-010
Mapping/export ตาม DES-008/009
Level progression ตาม DES-011
```

**Breaking ที่ต้องระบุชัด:** การถอน `Curriculum.Mode`, เปลี่ยน public content/progress shape, เปลี่ยน scope เนื้อหาเป็น global และแก้ FK ที่เคยบังคับ SchoolId เดียวกัน ไม่ใช่ additive change ทั้งหมด ต้องตรวจ consumer และ migration โดย DBA ก่อนนำไปใช้

---

**7. ข้อความ amend `data-model.md` — Rev3 → Rev4**

คงชนิด `K/I/U/N/A/D/H/Text` และ common columns เดิมทั้งหมด เพิ่ม:

```text
DecimalString = JSON string ของเลขฐานสิบไม่ติดลบ
ไม่มี exponent/เครื่องหมายบวก; ไม่เกิน 6 ตำแหน่งทศนิยม
เก็บ domain score เป็น numeric(18,6)
ค่าติดลบ/NaN/Infinity ถูกปฏิเสธ
API ไม่ใช้ float สำหรับคะแนนหรือน้ำหนัก
weight_bps เป็น int4 ช่วง 0..10000

Category = before_midterm|after_midterm|midterm|final
Legacy term identifier ใช้ T64 ไม่ใช่ K หรือเลขภาคเรียนที่เดาเอง
PGGradeDB GradeAuditLogId เป็น int8; API ใช้ decimal string
```

แก้ตารางเดิม:

| ตาราง | Amendment |
|---|---|
| SchoolBotCurriculum | ถอน `Mode`; เพิ่ม `LevelId:K`, `RecommendedGrades:T16[]`, `Subjects:{subject_key:U,code:T64,title:Text}[]` |
| SchoolBotLesson | คง `LessonKey/Ordinal`; ระบุ key ถาวรข้าม revision และเปลี่ยน scope ตาม curriculum |
| SchoolBotMission | คงตาราง/IDs; project Activity อ้าง Mission; validation Mode มาจาก Activity |
| SchoolBotCriteria | คง rubric เดิม; numeric rubric ต้องมี approved scorer ก่อนใช้ส่งคะแนน |
| SchoolBotAssessment | เพิ่ม `EarnedScore:numeric(18,6)?`, `MaxScore:numeric(18,6)?`; null พร้อมกัน |
| SchoolBotSubmission | เปลี่ยนการตรวจ mode/criteria scope ให้ตรวจ published global content และ project owner ของ school ที่ส่ง |
| Placement บรรทัด 84 | แทนข้อห้ามเขียนเกรดด้วย “SchoolBot เขียนเฉพาะช่องที่เป็นเจ้าของตาม DES-009 หลัง DBA/มนุษย์อนุมัติ ไม่เปลี่ยน schema PGGradeDB และไม่เพิ่ม DB ที่ห้า” |

Global rows ที่เสนอให้ `SchoolId=null` เพิ่มเติม ได้แก่ `Level`, `Curriculum`, `Lesson`, `Mission`, `Criteria`, `Activity`, `QuestionBank` รวม audit/idempotency ของ central content operations เท่านั้น ไม่ใช้ SchoolId=0 แทน global

การอ้าง global content จาก school rows ใช้ PK จริงและตรวจ content scope ห้ามใช้ composite FK ที่มี nullable SchoolId แล้วถือว่า enforce ความสัมพันธ์ครบ

ตารางใหม่ทุกตารางมี PK `SchoolBot<Name>Id:K` และ common columns เดิมครบ:

| ตาราง | Fields นอก PK/common |
|---|---|
| **SchoolBotLevel** | `LevelKey:U, Code:T64, Ordinal:N, Title:Text` |
| **SchoolBotActivity** | `LessonId:K, ActivityKey:U, Ordinal:N, Title:Text, Type:ActivityType, Mode:Mode?, Indicators:Indicator[], Config:ActivityConfig` |
| **SchoolBotCourseRun** | `CurriculumId:K, ClassroomId:I, NYear:I, NTerm:T64, CurrentPolicyId:K?, PreviousRunId:K?, EffectiveAt:D, Lifecycle:planned\|active\|closed` |
| **SchoolBotScoringPolicy** | `CourseRunId:K, CurriculumId:K, Revision:N, Policy:ScoringPolicy` |
| **SchoolBotQuestionBank** | `BankKey:U, Revision:N, Title:Text, Questions:Question[], SourceRef:T2048, Lifecycle:ContentState, PublishedAt:D?` |
| **SchoolBotAttempt** | `CourseRunId:K, ActivityId:K, LearnerId:I, Sequence:N, State:AttemptState, StartedAt:D, DeadlineAt:D?, SubmittedAt:D?, Snapshot:AttemptSnapshot, Answers:Answer[], EarnedScore:numeric(18,6)?, MaxScore:numeric(18,6)` |
| **SchoolBotGradeSlot** | `CourseRunId:K, PlanCourseId:I, CourseId:I, NGradeId:I, AssessmentId:I, ScoreIdentifier:T128, Category:Category, TargetSnapshot:TargetSnapshot, OwnershipReason:T1000, RetiredAt:D?` |
| **SchoolBotScoreMapping** | `CourseRunId:K, GradeSlotId:K, Sources:MappingSource[], RetiredAt:D?` |
| **SchoolBotScorePreview** | `CourseRunId:K, Principal:A, SnapshotHash:H, ExpiresAt:D, State:open\|conflicted\|confirmed\|superseded\|expired, SupersedesId:K?, Context:PreviewContext` |
| **SchoolBotScorePreviewItem** | `ScorePreviewId:K, LearnerId:I, State:ready\|conflict\|blocked, ReasonCodes:T64[], Snapshot:PreviewItemSnapshot` |
| **SchoolBotScoreExport** | `ScorePreviewId:K, ConfirmedBy:A, ConfirmedAt:D, State:ExportState` |
| **SchoolBotScoreOutbox** | `ScoreExportId:K, ScorePreviewItemId:K, OperationKey:U, PayloadHash:H, State:OutboxState, Attempts:integer≥0, LeaseOwner:T128?, LeaseUntil:D?, NextAttemptAt:D, ReceiptId:int8?, ReceiptHash:H?, LastErrorCode:T64?` |
| **SchoolBotLevelProposal** | `CourseRunId:K, TargetCurriculumId:K, SnapshotHash:H, Snapshot:LevelSnapshot, State:proposed\|confirmed\|declined\|stale, DecisionBy:A?, DecisionAt:D?, Reason:T1000?, SuccessorRunId:K?` |

Embedded shapes เพิ่มเติม:

```text
Indicator={indicator_key:U,code:T128,title:Text}
MappingSource={activity_id:K,indicator_key:U|null,weight_bps:int0..10000}
Answer={question_key:U,selected_option_keys:U[]}

AttemptSnapshot={
bank_id:K,bank_revision:N,activity_version:N,
policy_id:K,evaluator_version:T128,
questions:Question[],question_order:U[],
option_order:[{question_key:U,option_keys:U[]}]
}
Snapshot เป็น server-only; API คืนเฉพาะ PublicQuestion

TargetSnapshot={
n_year:I,n_term:T64,classroom_id:I,plan_course_id:I,course_id:I,
n_grade_id:I,assessment_id:I,score_identifier:T128,
max_score:DecimalString,
header_token:T512,assessment_token:T512,settings_hash:H
}

PreviewContext={
mapping_versions:[{id:K,version:N}],
policy_id:K,roster:I[],
writer_version:T128,calculator_version:T128,
authorization_checked_at:D
}

SourceResultRef={
kind:assessment|attempt,id:K,version:N,
activity_id:K,earned:DecimalString,max_score:DecimalString,
weight_bps:int0..10000
}

PreviewItemSnapshot={
cells:[{
mapping_id:K,grade_slot_id:K,target:TargetSnapshot,
grade_detail_id:I,row_token:T512,
old_score:T128|null,last_exported_score:T128|null,
raw_target:DecimalString,new_score:integer>=0,
source_hash:H,sources:SourceResultRef[],
special_result:T128|null,grade_edit_fingerprint:H,
before_document_hash:H,
decision:apply|keep_destination|replace_owned
}],
reason_codes:T64[]
}

LevelSnapshot={
promotion_policy_ref:T2048,policy_hash:H,scoring_policy_id:K,
roster:[{learner_id:I,total:DecimalString|null,source_hash:H}],
average:DecimalString|null,threshold:DecimalString,
eligible:B,effective_at:D,target_n_year:I,target_n_term:T64
}

ExportState =
queued|running|paused_conflict|reconciling|completed|
completed_with_skips|failed

OutboxState =
queued|running|applied|skipped|conflict|blocked|unknown
```

กฎ integrity ที่ต้องเพิ่มใน `data-contract-rules.md` เป็น amendment ที่เสนอด้วย:

- PK/FK ของ SchoolBot เป็น K; legacy IDs ไม่เป็น FK ข้าม DB
- global keys/revisions ต้อง unique จริงภายใต้ null scope
- CourseRun/Policy/Slot/Mapping/Preview/Export/Outbox ต้อง school เดียวกัน
- unique `(CourseRunId,Revision)` ของ policy
- unique `(SchoolId,CourseRunId,ActivityId,LearnerId,Sequence)` ของ attempt
- หนึ่ง GradeSlot active ต่อ `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` และห้ามหลบ ownership ด้วย soft-delete
- หนึ่ง active mapping ต่อ `(CourseRunId,GradeSlotId)`
- unique `(ScorePreviewId,LearnerId)`, unique `ScoreExport.ScorePreviewId`
- unique `Outbox.OperationKey`, `(ScoreExportId,ScorePreviewItemId)`
- immutable snapshot ห้ามแก้ business data แม้ workflow State/Version เปลี่ยน
- live/partial uniqueness และ FK scope ให้ DBA ออกแบบ ไม่ถือว่า diagram notes enforce แล้ว
- ไม่มี hard delete ของ receipt linkage, preview ที่ยืนยัน หรือผลประเมินเพื่อทำให้ส่งซ้ำได้
- เพิ่ม domain errors จาก DES-008–011 โดยไม่เปลี่ยน error envelope เดิม

Change Log เสนอ:

```text
2026-10-22 — Rev4: เพิ่ม global learning content, Activity/Attempt,
mapping ownership, preview/export/outbox และ Level proposal;
เปลี่ยน placement permission ตาม decisions-021 เฉพาะ owned grade cells;
schema/breaking amendments รอ DBA และมนุษย์
```

---

**8. ส่วนเพิ่ม/แก้ของ `schoolbot.dbml` — ข้อเสนอ Rev2**

แก้เฉพาะจุดเดิม:

- `SchoolBotCurriculum`: ลบ `Mode`; เพิ่ม `LevelId int4`, `RecommendedGrades jsonb`, `Subjects jsonb`
- เปลี่ยน SchoolId เป็น nullable เฉพาะ global content tables ที่ระบุข้างต้น
- ถอน index `(SchoolId,Mode,Lifecycle)` ของ Curriculum แล้วออกแบบ index ใหม่ตาม Level/Lifecycle
- `SchoolBotAssessment`: เพิ่ม `EarnedScore numeric(18,6) [null]`, `MaxScore numeric(18,6) [null]`
- ปรับ refs `lesson_curriculum`, `mission_lesson`, `criteria_mission`, `submission_mission`, `submission_criteria` ให้รองรับ global content ตามข้อกำหนดข้างต้น ห้ามปล่อย composite nullable FK แล้วเข้าใจว่าตรวจ scope ได้ครบ
- เปลี่ยน note จากจำนวน “16 ตาราง” เป็นจำนวนหลังรวม amendment จริง
- เพิ่ม Change Log วันที่ 2026-10-22 และ archive Rev1 verbatim ก่อน amend

บล็อกตารางใหม่ต่อไปนี้เป็น logical DBML ไม่ใช่ SQL ไม่ได้รัน parser ในงานนี้:

```dbml
// Amendment Rev2 — 2026-10-22
// ทุกตารางอยู่ School DB; ไม่เพิ่ม schema object ใน PGGradeDB.
// JSON shapes/constraints ตาม DES-005,008–011 และ data-model Rev4.
// Notes ไม่ใช่ constraint; DBA ต้องทำ scope/partial uniqueness ให้จริง.

Table SchoolBotLevel {
  SchoolBotLevelId int4 [pk, increment, not null]
  LevelKey uuid [not null, unique]
  Code varchar(64) [not null, unique]
  Ordinal int4 [not null, unique]
  Title jsonb [not null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [null, note: 'Global only; must be NULL']
  Version int4 [not null, default: 1]
}

Table SchoolBotActivity {
  SchoolBotActivityId int4 [pk, increment, not null]
  LessonId int4 [not null]
  ActivityKey uuid [not null]
  Ordinal int4 [not null]
  Title jsonb [not null]
  Type varchar(16) [not null, note: 'instruction|project|quiz|test']
  Mode SchoolBotMode [null]
  Indicators jsonb [not null]
  Config jsonb [not null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [null, note: 'Global content only']
  Version int4 [not null, default: 1]
  indexes {
    (LessonId, ActivityKey) [unique]
    (LessonId, Ordinal) [unique]
  }
}

Table SchoolBotCourseRun {
  SchoolBotCourseRunId int4 [pk, increment, not null]
  CurriculumId int4 [not null]
  ClassroomId int4 [not null]
  NYear int4 [not null]
  NTerm varchar(64) [not null]
  CurrentPolicyId int4 [null]
  PreviousRunId int4 [null]
  EffectiveAt timestamptz [not null]
  Lifecycle varchar(16) [not null, note: 'planned|active|closed']
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  Note: 'Legacy room/year/term refs are logical, no cross-DB FK. Active-run overlap and one successor require DBA constraints.'
}

Table SchoolBotScoringPolicy {
  SchoolBotScoringPolicyId int4 [pk, increment, not null]
  CourseRunId int4 [not null]
  CurriculumId int4 [not null]
  Revision int4 [not null]
  Policy jsonb [not null, note: 'DES-010 ScoringPolicy; immutable']
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  indexes {
    (CourseRunId, Revision) [unique]
  }
}

Table SchoolBotQuestionBank {
  SchoolBotQuestionBankId int4 [pk, increment, not null]
  BankKey uuid [not null]
  Revision int4 [not null]
  Title jsonb [not null]
  Questions jsonb [not null, note: 'Question[]; contains protected answers']
  SourceRef varchar(2048) [not null]
  Lifecycle SchoolBotContentState [not null]
  PublishedAt timestamptz [null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [null, note: 'Global content only']
  Version int4 [not null, default: 1]
  indexes {
    (BankKey, Revision) [unique]
  }
}

Table SchoolBotAttempt {
  SchoolBotAttemptId int4 [pk, increment, not null]
  CourseRunId int4 [not null]
  ActivityId int4 [not null]
  LearnerId int4 [not null]
  Sequence int4 [not null]
  State varchar(16) [not null, note: 'started|submitted|expired|voided']
  StartedAt timestamptz [not null]
  DeadlineAt timestamptz [null]
  SubmittedAt timestamptz [null]
  Snapshot jsonb [not null, note: 'Immutable AttemptSnapshot; server-only']
  Answers jsonb [not null]
  EarnedScore numeric(18,6) [null]
  MaxScore numeric(18,6) [not null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  indexes {
    (SchoolId, CourseRunId, ActivityId, LearnerId, Sequence) [unique]
  }
}

Table SchoolBotGradeSlot {
  SchoolBotGradeSlotId int4 [pk, increment, not null]
  CourseRunId int4 [not null]
  PlanCourseId int4 [not null]
  CourseId int4 [not null]
  NGradeId int4 [not null]
  AssessmentId int4 [not null]
  ScoreIdentifier varchar(128) [not null]
  Category varchar(32) [not null]
  TargetSnapshot jsonb [not null]
  OwnershipReason varchar(1000) [not null]
  RetiredAt timestamptz [null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  indexes {
    (SchoolId, NGradeId, AssessmentId, ScoreIdentifier)
      [note: 'Active ownership must be unique; DBA partial constraint']
  }
}

Table SchoolBotScoreMapping {
  SchoolBotScoreMappingId int4 [pk, increment, not null]
  CourseRunId int4 [not null]
  GradeSlotId int4 [not null]
  Sources jsonb [not null, note: 'MappingSource[]; weights sum 10000']
  RetiredAt timestamptz [null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  indexes {
    (CourseRunId, GradeSlotId)
      [note: 'One active mapping; DBA partial constraint']
  }
}

Table SchoolBotScorePreview {
  SchoolBotScorePreviewId int4 [pk, increment, not null]
  CourseRunId int4 [not null]
  Principal varchar(512) [not null]
  SnapshotHash varchar(64) [not null]
  ExpiresAt timestamptz [not null]
  State varchar(16) [not null]
  SupersedesId int4 [null]
  Context jsonb [not null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  Note: 'Hash covers immutable context/items and ordering; workflow state excluded.'
}

Table SchoolBotScorePreviewItem {
  SchoolBotScorePreviewItemId int4 [pk, increment, not null]
  ScorePreviewId int4 [not null]
  LearnerId int4 [not null]
  State varchar(16) [not null, note: 'ready|conflict|blocked']
  ReasonCodes jsonb [not null]
  Snapshot jsonb [not null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  indexes {
    (ScorePreviewId, LearnerId) [unique]
  }
}

Table SchoolBotScoreExport {
  SchoolBotScoreExportId int4 [pk, increment, not null]
  ScorePreviewId int4 [not null, unique]
  ConfirmedBy varchar(512) [not null]
  ConfirmedAt timestamptz [not null]
  State varchar(32) [not null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
}

Table SchoolBotScoreOutbox {
  SchoolBotScoreOutboxId int4 [pk, increment, not null]
  ScoreExportId int4 [not null]
  ScorePreviewItemId int4 [not null]
  OperationKey uuid [not null, unique]
  PayloadHash varchar(64) [not null]
  State varchar(16) [not null]
  Attempts int4 [not null]
  LeaseOwner varchar(128) [null]
  LeaseUntil timestamptz [null]
  NextAttemptAt timestamptz [not null]
  ReceiptId int8 [null, note: 'Legacy PG audit ID; no cross-DB FK']
  ReceiptHash varchar(64) [null]
  LastErrorCode varchar(64) [null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  indexes {
    (ScoreExportId, ScorePreviewItemId) [unique]
    (State, NextAttemptAt)
  }
}

Table SchoolBotLevelProposal {
  SchoolBotLevelProposalId int4 [pk, increment, not null]
  CourseRunId int4 [not null]
  TargetCurriculumId int4 [not null]
  SnapshotHash varchar(64) [not null]
  Snapshot jsonb [not null]
  State varchar(16) [not null]
  DecisionBy varchar(512) [null]
  DecisionAt timestamptz [null]
  Reason varchar(1000) [null]
  SuccessorRunId int4 [null]
  IsDelete boolean [not null, default: false]
  CreateBy varchar(512) [not null]
  CreateDate timestamptz [not null]
  UpdateBy varchar(512) [not null]
  UpdateDate timestamptz [not null]
  SchoolId int4 [not null]
  Version int4 [not null, default: 1]
  Note: 'One confirmed successor per run; DBA conditional constraint.'
}

// Logical relations; tenant/global and parent ownership constraints
// in data-model remain mandatory beyond these single-column refs.
Ref: SchoolBotCurriculum.LevelId > SchoolBotLevel.SchoolBotLevelId
Ref: SchoolBotActivity.LessonId > SchoolBotLesson.SchoolBotLessonId
Ref: SchoolBotCourseRun.CurriculumId > SchoolBotCurriculum.SchoolBotCurriculumId
Ref: SchoolBotCourseRun.PreviousRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotCourseRun.CurrentPolicyId > SchoolBotScoringPolicy.SchoolBotScoringPolicyId
Ref: SchoolBotScoringPolicy.CourseRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotScoringPolicy.CurriculumId > SchoolBotCurriculum.SchoolBotCurriculumId
Ref: SchoolBotAttempt.CourseRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotAttempt.ActivityId > SchoolBotActivity.SchoolBotActivityId
Ref: SchoolBotGradeSlot.CourseRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotScoreMapping.CourseRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotScoreMapping.GradeSlotId > SchoolBotGradeSlot.SchoolBotGradeSlotId
Ref: SchoolBotScorePreview.CourseRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotScorePreview.SupersedesId > SchoolBotScorePreview.SchoolBotScorePreviewId
Ref: SchoolBotScorePreviewItem.ScorePreviewId > SchoolBotScorePreview.SchoolBotScorePreviewId
Ref: SchoolBotScoreExport.ScorePreviewId > SchoolBotScorePreview.SchoolBotScorePreviewId
Ref: SchoolBotScoreOutbox.ScoreExportId > SchoolBotScoreExport.SchoolBotScoreExportId
Ref: SchoolBotScoreOutbox.ScorePreviewItemId > SchoolBotScorePreviewItem.SchoolBotScorePreviewItemId
Ref: SchoolBotLevelProposal.CourseRunId > SchoolBotCourseRun.SchoolBotCourseRunId
Ref: SchoolBotLevelProposal.TargetCurriculumId > SchoolBotCurriculum.SchoolBotCurriculumId
Ref: SchoolBotLevelProposal.SuccessorRunId > SchoolBotCourseRun.SchoolBotCourseRunId
```

ก่อนนำ DBML ไปบันทึกจริง ควรแยกตามขนาดไฟล์ที่ convention กำหนด โดยคง `schoolbot.dbml` เป็น index/entry artifact และให้ DBA ตรวจความสามารถของ tooling ที่ใช้รวมไฟล์ ไม่ต่อไฟล์เดิมยาวโดยละเลยงบขนาด

---

**9. Amendment ของ `design/index.md` และประตูที่ต้องปิด**

เพิ่มรายการโดยเก็บสถานะเอกสารเฉพาะ index:

| เอกสาร | Rev เสนอ | สถานะเสนอใน index |
|---|---:|---|
| DES-005 | 4 | PROPOSED — รอ content/schema/breaking review |
| DES-008 | 1 | PROPOSED — รอ schema/slot allocation |
| DES-009 | 1 | PROPOSED — writer/calculator/receipt evidence ยังไม่ครบ |
| DES-010 | 1 | PROPOSED — รอ schema และ assessment policy |
| DES-011 | 1 | PROPOSED — รอ promotion business policy |
| data-model | 4 | PROPOSED amendment ต่อ confirmed Rev3 baseline |
| data-contract-rules | 4 | PROPOSED amendment |
| schoolbot.dbml | 2 | PROPOSED amendment ต่อ confirmed Rev1 baseline |

อย่าเปลี่ยน confirmed baseline เดิมให้ดูเหมือนผู้ใช้อนุมัติ amendment แล้ว เพิ่ม feasibility ว่า “พบ gateway writer contract แต่ไม่พบ service implementation จึงยังเปิด export ไม่ได้” และเพิ่มวิธีอ่าน DES-005 → 010 → 008 → 009; การเลื่อน Level อ่าน 011 แยก

ข้อที่ขัดหรือปรับความเข้าใจจากเอกสารเดิม:

- ข้อห้าม SchoolBot เขียนเกรดใน data-model ถูกมติ decisions-021 แทนเฉพาะ owned cells แล้ว ไม่ต้องถามเรื่องสิทธิ์เชิงผลิตภัณฑ์นี้ซ้ำ
- source-review-004 ที่บอกไม่พบ writer ใน academic ยังสอดคล้องกับหลักฐาน แต่พบเพิ่มว่า gateway ส่งไป **อีก service**
- ข้อความ “ไม่มี concurrency token” ต้องจำกัดให้หมายถึง EF mapping ที่ตรวจ ไม่ใช่ทั้งระบบ เพราะ proto อีก service ประกาศ `xmin`
- DB function ที่พบเป็น read path ยังใช้รับรองการ recalculation หลังเขียนไม่ได้
- Curriculum.Mode เดียวและ content scope รายโรงเรียนใน baseline ไม่รองรับมติหลักสูตรกลางหลาย Activity แล้ว

| Task / Reference | เหตุผลที่หยุด | ผู้รับต่อ |
|---|---|---|
| ตรวจ writer / DES-009 | ขาด source `sb-service-academic-score-record` และนิยาม `getstudentgradebysid` จึงยังตอบ as-built เรื่อง mutation/formula/audit ได้ไม่ครบ | ผู้คุมจัด source ให้ SA ตรวจต่อ |
| Schema / data-model Rev4, DBML Rev2 | เพิ่มตาราง SchoolBot, global-null scope และเปลี่ยน FK/contract เป็น breaking บางส่วน | มนุษย์อนุมัติแบบ → DBA ออก physical design/SQL |
| Grade write / DES-009 | ต้องรับรอง calculator parity, writer ร่วม, row locking และ receipt โดยไม่เปลี่ยน PGGradeDB schema | DBA + เจ้าของ writer + มนุษย์ |
| Policy / DES-010/011 | จำนวนครั้งสอบ การเลือก attempt การเฉลย เกณฑ์/เวลาเลื่อน และ roster ยังไม่มีคำตอบครบ | BA กลับไปเก็บมติและ REQ/AC |
| Rounding / DES-009 | ผู้ใช้ยืนยันจำนวนเต็มแล้ว แต่ midpoint `.5` ยังไม่ระบุ เสนอ half-up เพื่ออนุมัติ | เจ้าของธุรกิจ |
| UX / DES-008/009 | ต้องแสดงข้ามวิชา, ค่าเดิม→ใหม่, protected results, partial completion และเลือก conflict รายคน | UX และมนุษย์ sign-off ก่อน FE |

## Change Log

- 2026-10-22 — APPLIED เข้า baseline Rev4 / DBML Rev2 ตามมติอนุมัติ decisions-026
- 2026-10-22 — MYCELIUM บันทึกข้อเสนอ SA โดยไม่ apply เข้า baseline

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
