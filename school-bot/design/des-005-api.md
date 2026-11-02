# DES-005 — หลักสูตร ภารกิจ และผลประเมิน — API `/v2`

> Rev 8 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-005 — หลักสูตร ภารกิจ และผลประเมิน](des-005.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `I` = signed int32 ของระบบเดิม; `U` = UUID; `N` = integer ≥1; `D` = UTC instant; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร; `P` = profile ที่ระบุโรงเรียน kind และ id; `A` = actor string ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## API `/v2`

| Endpoint | ช่องทาง / สิทธิ์ | Input | Result |
|---|---|---|---|
| GET /curricula | desktop, school_web, staff_admin | `level_id:K?, recommended_grade:T16?, subject_key:U?, mode:Mode?, pagination` | published curriculum summaries (กรอง `mode` จากการมี Activity โหมดนั้น) |
| GET /curricula/{id} | desktop, school_web, staff_admin | ID | curriculum พร้อม `level_id`, `recommended_grades`, `subjects`, ordered lessons/activities/missions และ public criteria (+ ETag จาก `UpdateDate`) |
| POST /admin/curricula | staff_admin (`content_author`) | `{curriculum_key,revision,level_id,title,source_ref,recommended_grades,subjects}` | 201 `{id,update_date}` |
| PUT /admin/curricula/{id}/content | staff_admin (`content_author`) | `{lessons:LessonInput[]}` + If-Match (`ETag`) | 200 `{id,update_date}` |
| POST /admin/curricula/{id}/publish | staff_admin (`content_approver`, four-eyes) | `{approval_ref:T2048}` + If-Match (`ETag`) | 200 `{id,update_date,published_at}` |
| POST /submissions | desktop (`P=student`) | `{mission_id:K,criteria_id:K,project_revision_id:K,evidence:ArmEvidence?}` | 201 SubmissionView |
| GET /submissions/{id} | desktop (เจ้าของ) หรือ school_web (ครูตามสิทธิ์) | ID | SubmissionView (+ ETag จาก `UpdateDate`) |
| POST /submissions/{id}/assessments | school_web (ครูรายวิชา/ผู้มีสิทธิ์ตรวจ Arm) | `{outcome,feedback,rule_results,earned_score:DecimalString?,max_score:DecimalString?,supersedes_id:K?}` + If-Match (`ETag`) | 201 AssessmentView |
| GET /progress | desktop | `course_run_id:K?, curriculum_id:K?, mode:Mode?` | ProgressView |
| GET /learners/{id}/progress | school_web (ครูตามสิทธิ์) | filters เดียวกัน | ProgressView |

`LessonInput={lesson_key:U,ordinal:N,title:Text,objective:Text,instructions:Text,missions:MissionInput[],activities:ActivityInput[]}`
`MissionInput={mission_key:U,ordinal:N,title:Text,instructions:Text,method:AssessmentMethod,criteria:{revision:N,rules:CriteriaRules,source_ref:T2048,approved_by:A?,approved_at:D?}}`
ตอน publish server ตรวจสิทธิ์ `content_approver` และบังคับกฎ four-eyes (ผู้อนุมัติต้องไม่ใช่ผู้สร้าง/ผู้แก้ร่างของ revision นั้นตาม [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md)) ไม่ยอมรับชื่อผู้อนุมัติที่ client อ้างเอง และบันทึก `approval_ref` ใน audit `Reason`

`learner_id:I = student.SId`; `assessor_id:I? = employee.SEmp` ใช้ `SchoolId` ของ session/resource ประกอบ `P` ตาม data-model; `/learners/{id}` รับ `I` ภายใต้ school ที่ตรวจแล้ว; IDs ของ SchoolBot เป็น `K`

Curriculum/Level/Lesson/Mission/Criteria/Activity/Submission/Assessment IDs เป็น `K`; `curriculum_key`/`lesson_key`/`mission_key`/`activity_key`/`indicator_key` และ rubric/rule IDs คง `U`. Server สร้างทุก PK; Submission ใช้ `project_revision_id` จาก CloudProjectDocument ไม่รับ Local UUID. `POST /submissions` และ retry ใช้ `Idempotency-Key:U` เดิม; commit submission/job/result/audit ร่วมกันแล้วคืน ID เดิมเมื่อ replay

`SubmissionView`:
`{id,learner_id,mission_id,criteria_id,project_revision_id,submitted_at,state,update_date,assessment:AssessmentView|null}`
`AssessmentView`:
`{id,sequence,method,outcome,rule_results,earned_score:DecimalString|null,max_score:DecimalString|null,feedback,grader_version,assessor_id,supersedes_id,update_date}`
`ProgressView`:
`{learner_id,course_run_id:K|null,curriculum_id,level_id:K,activities:[{activity_id:K,type:ActivityType,mode:Mode|null,latest_submission:SubmissionView|null,selected_attempt:{attempt_id:K,sequence:N,state:AttemptState,earned:DecimalString|null,max_score:DecimalString}|null}],missions:[{mission_id,latest_submission:SubmissionView|null}],computed_at}`

Public criteria ไม่คืน hidden expected traces หาก author กำหนดว่าเป็นข้อมูลตรวจฝั่ง server; response ใช้ `{criteria_id,method,instructions}` สำหรับส่วนดังกล่าว ไม่ส่ง secret tests ให้ Desktop

