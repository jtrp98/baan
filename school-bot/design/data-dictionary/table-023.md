# SchoolBotAssessment

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บผลตรวจโครงงานใน SchoolBot แบบมีประวัติ ไม่ใช่หัวช่องคะแนน PGTAssessment

**หนึ่งแถว:** ผลประเมินหนึ่งครั้งของ Submission หนึ่ง

**ใช้ตอนไหน/ใครใช้:** evaluator หรือครูสร้างผล; Submission ชี้ผลปัจจุบัน; progress/mapping/export อ่านผล

**ตัวอย่างสมมติ:** สมมติ: ครูตรวจงาน Arm ได้ 8 จาก 10 แล้วตรวจใหม่เป็นผลอีกแถวที่อ้างผลเดิม

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotAssessmentId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotAssessment (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `SubmissionId` | `integer` | ไม่ได้ | FK ไป SchoolBotSubmission ที่ผลนี้ประเมิน |
| `Sequence` | `integer` | ไม่ได้ | ลำดับผลประเมินภายใน Submission; จัดสรรภายใต้ lock แถว Submission ไม่ใช่เลข Attempt |
| `Method` | `varchar(16)` | ไม่ได้ | automatic=ระบบตรวจ, teacher=ครูตรวจ; ใช้กำหนดว่าจะระบุตัวตรวจใน GraderVersion หรือ AssessorId |
| `Outcome` | `varchar(16)` | ไม่ได้ | passed=ผ่านเกณฑ์, not_yet=ยังไม่ผ่าน; ไม่แปลงเป็นคะแนนเต็มหรือศูนย์เอง |
| `EarnedScore` | `numeric(18,6)` | ได้ | คะแนนที่ได้ชนิด numeric(18,6); null พร้อม MaxScore เมื่อมีเฉพาะผลผ่าน/ยังไม่ผ่าน; เมื่อมีค่าต้องอยู่ระหว่าง 0 ถึง MaxScore |
| `MaxScore` | `numeric(18,6)` | ได้ | คะแนนเต็มชนิด numeric(18,6) ต้องมากกว่า 0 เมื่อมีคะแนน; null พร้อม EarnedScore และกรณีนี้ส่งเป็นคะแนนตัวเลขไม่ได้ |
| `RuleResults` | `jsonb` | ไม่ได้ | JSON array ของ rule_id กับ matched ระบุว่าผ่านเงื่อนไขหรือ rubric รายข้อหรือไม่ |
| `Feedback` | `varchar(4000)` | ไม่ได้ | คำอธิบายผลหรือข้อเสนอแนะต่อผู้เรียน ความยาวไม่เกิน 4000 ตัวอักษร |
| `GraderVersion` | `varchar(128)` | ได้ | รุ่น evaluator ที่ใช้ตรวจเพื่อย้อนทำความเข้าใจผล; ต้องมีเมื่อ automatic และ null เมื่อ teacher |
| `AssessorId` | `integer` | ได้ | TEmployees.sEmp ของครูผู้ตรวจพร้อม SchoolId; ต้องมีเมื่อ teacher และ null เมื่อ automatic |
| `SupersedesId` | `integer` | ได้ | FK ไป Assessment เดิมที่ผลใหม่นี้แทน ต้องเป็น Submission เดียวกัน; null เมื่อไม่ได้แทนผลเดิม |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `SubmissionId` | [SchoolBotSubmission](table-021.md) (`SchoolBotSubmissionId`) |
| `SupersedesId` | [SchoolBotAssessment](table-023.md) (`SchoolBotAssessmentId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotSubmission](table-021.md) (CurrentAssessmentId), [SchoolBotAssessment](table-023.md) (SupersedesId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TEmployees](legacy-005.md) · [TPlanCourseTeacher](legacy-010.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `RuleResults`: RuleResult[]; JSON array ของ rule_id กับ matched ระบุว่าผ่านเงื่อนไขหรือ rubric รายข้อหรือไม่

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:674) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
