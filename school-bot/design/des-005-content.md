# DES-005 — หลักสูตร ภารกิจ และผลประเมิน — โครงสร้างเนื้อหาและเกณฑ์ประเมิน

> Rev 8 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-005 — หลักสูตร ภารกิจ และผลประเมิน](des-005.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `U` = UUID; `N` = integer ≥1; `D` = UTC instant; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร; `P` = profile ที่ระบุโรงเรียน kind และ id ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## โครงสร้างเนื้อหาและเกณฑ์ประเมิน

Curriculum revision เป็นเนื้อหากลางของ SchoolBright (`SchoolId=null` ตาม [มติ 020 (หลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../requirement/decisions-020.md) และ [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../requirement/decisions-026.md)) สำหรับหนึ่ง `Level` และการเรียนประมาณหนึ่งภาคเรียน (บริบท 22 สัปดาห์เป็นกรอบเนื้อหา ไม่ใช่ค่าคงที่จำนวน Lesson ในโค้ด); โรงเรียนเลือกใช้ published revision แต่แก้เนื้อหากลางไม่ได้

**โครงสร้าง Level และ Activity (ยืนยันตาม decisions-020, [มติ 021 (การส่งคะแนนเข้าระบบเกรด SchoolBright)](../requirement/decisions-021.md), [มติ 022 (ที่อยู่ของหน้าจอ Admin / ครู / Desktop)](../requirement/decisions-022.md), [มติ 023 (writer คะแนน, ปัดเศษ, นำเข้า Sheet และเจ้าของ mapping)](../requirement/decisions-023.md), [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../requirement/decisions-024.md), [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md), decisions-026):**
- ถอน `Curriculum.Mode` ออกจาก `SchoolBotCurriculum`; `Mode` (`block|arm|code|null`) อยู่ที่ `SchoolBotActivity`
- `SchoolBotLevel` มี `LevelKey:U` ถาวร, `Code:T64` และ `Ordinal:N` เรียงลำดับตั้งแต่ Beginner ถึง Expert ที่จัดการผ่านข้อมูล
- `RecommendedGrades:T16[]` (ป.1–ม.6) เป็นคำแนะนำเริ่มต้นของแต่ละ Level ไม่ใช้เป็นข้อห้ามเข้าเรียน
- `Subjects:CurriculumSubject[]` (`{subject_key:U,code:T64,title:Text}`) เป็นรหัสวิชากลาง ไม่ใส่ `TPlane` หรือ `Pgtassessment` ของโรงเรียนในตารางหลักสูตรกลาง
- การนำเข้า Course Plan Sheet ([REQ-045 (นำเข้า Course Plan Sheet)](../requirement/req-045.md), decisions-020 และ decisions-023): นำเข้าทุกแถวเป็น `draft` (`ContentState=draft`), แถวที่คอลัมน์ `D=TRUE` ติดป้ายว่าผ่านการตรวจจากต้นทางแต่ไม่ publish อัตโนมัติ, คอลัมน์ `O` ไม่นำเข้า, คอลัมน์ `P–X` เป็นสื่อชุดที่ 2 ของหน่วยเดิม
- `LessonKey`, `MissionKey`, `ActivityKey` และ `IndicatorKey` เป็น `U` ถาวรข้าม revision; `Ordinal` เป็นลำดับภายใน curriculum revision เปลี่ยนลำดับได้โดยไม่เปลี่ยน key; row ID เป็น `K` ใหม่เมื่อสร้าง content revision ใหม่
- Published curriculum และ children (`Lesson`, `Mission`, `Criteria`, `Activity`) เป็น immutable snapshots; เปลี่ยนเนื้อหาหรือเกณฑ์ต้องสร้าง revision ใหม่ ไม่ย้อนแก้ผลเก่า

สัญญา `ActivityInput` และ `ActivityConfig`:
```text
ActivityInput={
  activity_key:U, ordinal:N, title:Text,
  type:instruction|project|quiz|test,
  mode:block|arm|code|null,
  indicators:[{indicator_key:U,code:T128,title:Text}],
  config:ActivityConfig
}

ActivityConfig =
  {kind:"instruction-v1", instructions:Text, media_refs:T2048[]}
| {kind:"project-v1", mission_id:K}
| {kind:"question-v1", bank_id:K, question_keys:U[], default_policy:AssessmentPolicy}
```
- `type=project` ต้องมี `mode` (`block|arm|code`); `instruction|quiz|test` ใช้ `mode=null`
- project mission อยู่ `Lesson` เดียวกันและมีเจ้าของ `Activity` เดียว; `Method` ของ mission ต้องตรง `Activity.Mode` (`block|code` → `automatic`, `arm` → `teacher`)
- ไม่เพิ่มชนิด `config` ที่ server ไม่มี validator/evaluator

`CriteriaRules` เป็น union:
- automatic: `{kind:"automatic-v1",combine:"all"|"any",rules:AutoRule[]}`
- teacher: `{kind:"teacher-v1",items:[{id:U,instruction:Text}]}`

`AutoRule` มี `id:U` และหนึ่งรูปแบบ:
`{type:"trace_equals",commands:Command[]}`;
`{type:"steps_at_most",maximum:integer1–100}`;
`{type:"uses_op",op:"move_right"|"move_left"|"jump",minimum:integer1–64}`

`Command={op:"jump"}` หรือ `{op:"move_right"|"move_left",value:integer1–10}`
`rules/items` 1–64, IDs ไม่ซ้ำ; combine/ค่าที่ตั้งต้องมี `SourceRef` และ `ApprovedBy/At` จากมนุษย์ก่อน publish

`SchoolBotAssessment` เพิ่ม `EarnedScore:numeric(18,6)?` และ `MaxScore:numeric(18,6)?` โดยต้อง `null` พร้อมกัน หรือ `0 <= EarnedScore <= MaxScore` และ `MaxScore > 0`; ค่าคะแนนตัวเลขต้องมาจาก numeric rubric/evaluator ที่ได้รับอนุมัติเท่านั้น ผลประเมินเดิมที่มีเฉพาะ `Outcome` (`passed|not_yet`) ยังคงอ่านได้ แต่ใช้เป็นแหล่งส่งคะแนนออกตาม [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](des-008.md) และ [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md) ไม่ได้

ชุดนี้ประเมิน trace ของ bounded Domain-Specific Language (DSL); ไม่อ้างตรวจฟิสิกส์ใน Phaser หากหลักสูตรต้องวัด world/obstacle goals ต้องออก evaluator contract เพิ่มก่อน publish เกณฑ์นั้น
- Question Bank, Attempt และ `ScoringPolicy` ตาม [DES-010](des-010.md)
- การแมพตัวชี้วัด/กิจกรรมกับช่องคะแนนและการส่งคะแนนตาม [DES-008](des-008.md) และ [DES-009](des-009.md)
- การเสนอและยืนยันเลื่อน Level ทั้งห้องตาม [DES-011](des-011.md)

