# DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright — HTTP

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 044 — SQL constraints เหลือเฉพาะ Primary Key)

ส่วนต่อของ [DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright](des-008.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `I` = signed int32 ของระบบเดิม; `U` = UUID; `B` = boolean; `D` = UTC instant; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## HTTP

ใช้ headers/envelope/limits/pagination ตาม data-contract-rules
mutation มี Idempotency-Key และ X-Request-Id
update มี `If-Match` (ใช้ opaque `ETag` จาก `UpdateDate` ที่ server ตั้งด้วย `clock_timestamp()` ตาม [decisions-030](../../shared/decisions/decisions-030.md)); body ไม่รับ `UpdateDate`/`Version` แทน header
ทุก endpoint ต้องมี SchoolBot session channel `school_web` ([DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md))

| Endpoint | สิทธิ์ |
|---|---|
| GET /v2/course-runs/{id}/mapping-sources | school_admin หรือครูรายวิชาของ CourseRun |
| GET /v2/grade-targets | school_admin หรือครูของ plan_course_id ที่ query (อ่าน) |
| POST /v2/course-runs/{id}/grade-slots | school_admin |
| POST /v2/course-runs/{id}/score-mappings | school_admin |
| PUT /v2/score-mappings/{id} | school_admin |
| GET /v2/course-runs/{id}/score-mappings | school_admin หรือครูรายวิชาของ CourseRun |
| POST /v2/score-mappings/{id}/retire | school_admin |

GET /v2/course-runs/{id}/mapping-sources
query: lesson_id:K?, indicator_key:U?, limit,cursor
200 {items:[{activity_id,lesson_id,lesson_key,activity_key,type,mode,indicator_keys,has_numeric_score}],next_cursor}

GET /v2/grade-targets
query: year:I, term:T64, classroom_id:I, plan_course_id:I, limit,cursor
200 {items:[TargetView],next_cursor}

TargetView={
n_grade_id:I,assessment_id:I,score_identifier:T128,
course_id:I,plan_course_id:I,year:I,term:T64,
classroom_id:I,category:before_midterm|after_midterm|midterm|final,
name:T512,max_score:DecimalString,
editable:B,owned:B,block_code:T64|null,target_token:T512
}

year/term ใน query เป็นบริบทผู้ใช้ตามระบบเดิม server resolve เป็น NYear/NTerm และบันทึกค่าที่ resolve ได้ด้วย ห้ามใช้ term "1" แทน legacy NTerm โดยไม่ resolve

POST /v2/course-runs/{id}/grade-slots
{assessment_id:I,n_grade_id:I,plan_course_id:I,target_token:T512,ownership_reason:T1000}
201 {id:K,update_date:D,target:TargetView} (+ ETag)
server derive identifier/context จากข้อมูลจริง ไม่รับ identifier ที่ client ประกอบขึ้นเอง การเรียกนี้ไม่เขียน PGGradeDB

POST /v2/course-runs/{id}/score-mappings
{grade_slot_id:K,sources:Source[]}
201 MappingView (+ ETag)

PUT /v2/score-mappings/{id}
{sources:Source[]} + If-Match (`ETag`)
200 MappingView (+ ETag)

GET /v2/course-runs/{id}/score-mappings
query: limit,cursor
200 {items:[MappingView],next_cursor}

POST /v2/score-mappings/{id}/retire
{reason:T1000} + If-Match (`ETag`)
200 {id:K,update_date:D,retired_at:D} (+ ETag)

MappingView={
id:K,course_run_id:K,grade_slot_id:K,sources:Source[],
update_date:D,retired_at:D|null
}

GradeSlot/Mapping IDs เป็น K; legacy IDs เป็น I; target_token เป็น opaque snapshot token ไม่ใช่ auth credential

