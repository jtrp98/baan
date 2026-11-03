# DES-010 — Question Bank, Attempt และนโยบายคะแนน — API

> Rev 6 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — approval_ref/evidence_ref ไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)

ส่วนต่อของ [DES-010 — Question Bank, Attempt และนโยบายคะแนน](des-010.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `I` = signed int32 ของระบบเดิม; `U` = UUID; `N` = integer ≥1; `B` = boolean; `D` = UTC instant; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร; `P` = profile ที่ระบุโรงเรียน kind และ id ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## API

| Endpoint | session / สิทธิ์ |
|---|---|
| POST /v2/admin/question-banks | staff_admin channel, role content_author |
| POST /v2/admin/question-banks/{id}/publish | staff_admin, role content_approver (four-eyes) |
| POST /v2/course-runs/{id}/scoring-policies | school_web, ครูรายวิชาของ CourseRun |
| GET /v2/course-runs/{id}/scoring-policy | school_web, ครูรายวิชา หรือ school_admin |
| PUT /v2/course-runs/{id}/activities/{activity_id} | school_web, ครูรายวิชา |
| POST /v2/course-runs/{id}/activities/{activity_id}/retake-grants | school_web, ครูรายวิชา |
| POST/GET/PUT /v2/attempts… | desktop channel, เฉพาะ `P=student` (ป้องกัน `sEmp` ครูชน `sId` นักเรียน) |

POST /v2/admin/question-banks
{bank_key:U,revision:N,title:Text,questions:Question[],source_ref:T2048} → 201 {id:K,update_date:D} (+ ETag)

POST /v2/admin/question-banks/{id}/publish
{approval_ref:T1000} + If-Match (`ETag`) → 200 {id:K,update_date:D,published_at:D} (+ ETag)
ต้องผ่าน four-eyes (`CreateBy/UpdateBy` ของร่างต้องไม่ใช่ `sEmp` ของผู้อนุมัติ ไม่งั้น `409 FOUR_EYES_REQUIRED`); `approval_ref` ผิดชนิดหรือเกิน 1,000 ตัวอักษร → `400 INVALID_INPUT` ก่อนเปลี่ยนข้อมูล เก็บข้อความตรงตัวใน audit `Reason` ตาม [สัญญา storage](audit-evidence-storage-001.md) และ [มติ 054 (จำกัดเลขอ้างอิงไม่เกิน 1,000 ตัวอักษรโดยไม่ขยาย schema)](../../shared/decisions/decisions-054.md) ห้ามตัดข้อความหรือเก็บ hash แทน

POST /v2/course-runs/{id}/scoring-policies
{policy:ScoringPolicy} + If-Match (`ETag` ของ CourseRun) → 201 {id:K,revision:N,course_run_update_date:D} (+ ETag ของ CourseRun)

GET /v2/course-runs/{id}/scoring-policy → 200 {id:K,revision:N,policy:ScoringPolicy,update_date:D}

PUT /v2/course-runs/{id}/activities/{activity_id}
{opens_at:D|null,closes_at:D|null,policy_override:AssessmentPolicy|null} + If-Match (`ETag`) → 200 {course_run_id:K,activity_id:K,update_date:D,effective_policy:AssessmentPolicy} (+ ETag)

POST /v2/course-runs/{id}/activities/{activity_id}/retake-grants
{learner_id:I,reason:T1000} → 201 {id:K,update_date:D}

POST /v2/attempts
{course_run_id:K,activity_id:K} → 201 AttemptView (+ ETag)

GET /v2/attempts/{id} → 200 AttemptView (+ ETag)
PUT /v2/attempts/{id}/answers: {answers:[{question_key:U,selected_option_keys:U[]}]} + If-Match (`ETag`) → 200 AttemptView (+ ETag)
POST /v2/attempts/{id}/submit: {answers:[{question_key:U,selected_option_keys:U[]}]} + If-Match (`ETag`) → 200 AttemptView (+ ETag)

AttemptView={
id:K,update_date:D,sequence:N,
state:started|submitted|expired|voided,
activity_id:K,course_run_id:K,
started_at:D,deadline_at:D|null,submitted_at:D|null,
questions:PublicQuestion[],
earned:DecimalString|null,max_score:DecimalString,
feedback:{question_key:U,correct:B,correct_option_keys:U[]}[]|null
}

## Transaction การตรวจโรงเรียน และผลลัพธ์

- ฐานปัจจุบันในschoolbot_db.sqlคงเฉพาะPK ไม่มีSQL FK/UQ/CHECK; applicationต้องserializeความสัมพันธ์/ความไม่ซ้ำ/state/boundsด้วยtransactionlocksและตรวจเอง:
  1. ชั้น application ต้องตรวจว่า `CourseRun`, `ScoringPolicy`, `CourseRunActivity`, `Attempt`, `RetakeGrant` อยู่ `SchoolId` เดียวกับ session และ `Activity` อยู่ใน `CourseRun.CurriculumId`
  2. ก่อนสร้าง `Attempt` ต้อง re-check จาก **School DB** ว่านักเรียน (`P=student`, `LearnerId=sId`) อยู่ในห้องเรียน (`ClassroomId`/`NYear`/`NTerm`) ของ `CourseRun` จริง แล้วจึงเปิด **SchoolBot DB transaction** ล็อก counter/แถวของผู้เรียนสำหรับ `(SchoolId, CourseRunId, ActivityId, LearnerId)` เพื่อคำนวณ `Sequence` ถัดไป, ตรวจเพดาน `max_attempts` (และผูก `ConsumedAttemptId` ของ `SchoolBotRetakeGrant` หากเป็นการใช้สิทธิ์สอบซ่อม)
- ตอน `submit` ทำ validate/evaluate/freeze answers/result (`UpdateDate = clock_timestamp()`)/audit/idempotency ใน **SchoolBot DB transaction เดียว**

## หลักฐาน

- `knowledge/school-bot/shared/decisions/decisions-054.md`: มติผู้ใช้วันที่ 2026-11-03 กำหนด bound T1000 และ `400 INVALID_INPUT` เมื่อเกิน โดยไม่ขยาย schema
- `knowledge/school-bot/build/db/schoolbot_db.sql:123`: Reason varchar(1000) NOT NULL; ข้อจำกัด source/implementation และ mapping/reader/transaction อยู่ใน [สัญญา storage ร่วม](audit-evidence-storage-001.md)
