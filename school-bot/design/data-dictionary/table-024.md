# SchoolBotAttempt

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บการเริ่มทำและส่งคำตอบ Quiz/Test แต่ละครั้ง พร้อมข้อสอบที่ตรึงไว้

**หนึ่งแถว:** การทำกิจกรรมข้อสอบหนึ่งครั้งของนักเรียนหนึ่งคนใน CourseRun หนึ่ง

**ใช้ตอนไหน/ใครใช้:** เริ่มทำข้อสอบ บันทึกคำตอบ ส่งคำตอบ ตรวจคะแนน และเลือกผลตาม policy

**ตัวอย่างสมมติ:** สมมติ: นักเรียนเริ่ม Quiz ครั้งที่ 2 ได้ชุดคำถามตาม snapshot และส่งคำตอบได้ 4 จาก 5

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotAttemptId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotAttempt (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun ที่นักเรียนกำลังเรียน |
| `ActivityId` | `integer` | ไม่ได้ | FK ไป SchoolBotActivity ชนิด quiz/test ในหลักสูตรของ run |
| `LearnerId` | `integer` | ไม่ได้ | TUser.sID ของนักเรียนที่อยู่ใน roster พร้อม SchoolId; ไม่ใช่บัญชี Master หรือ sEmp |
| `Sequence` | `integer` | ไม่ได้ | ลำดับครั้งที่ทำในชุด SchoolId/CourseRunId/ActivityId/LearnerId; ใช้ตรวจเพดานจำนวนครั้ง |
| `State` | `varchar(16)` | ไม่ได้ | started=กำลังทำ, submitted=ส่งแล้ว, expired=หมดเวลาที่อนุญาต, voided=ยกเลิกความใช้ได้ของครั้งนั้น |
| `StartedAt` | `timestamptz` | ไม่ได้ | เวลา UTC เริ่ม Attempt จาก server |
| `DeadlineAt` | `timestamptz` | ได้ | เวลา UTC เส้นตายของ Attempt; null เมื่อไม่มีเส้นตายที่กำหนดไว้สำหรับครั้งนี้ |
| `SubmittedAt` | `timestamptz` | ได้ | เวลา UTC ส่งคำตอบ; null เมื่อยังไม่มีเวลาส่งที่บันทึก |
| `Snapshot` | `jsonb` | ไม่ได้ | JSON ตรึง bank_id/revision, curriculum_revision, policy_id, evaluator_version, คำถาม/เฉลย/คะแนนเต็ม และลำดับข้อ/ตัวเลือก; ข้อมูลเฉลยเป็น server-only และไม่เปลี่ยนตามการแก้คลังภายหลัง |
| `Answers` | `jsonb` | ไม่ได้ | JSON array ของ question_key และ selected_option_keys ที่ผู้เรียนเลือก ไม่รับคะแนนที่ client อ้าง |
| `EarnedScore` | `numeric(18,6)` | ได้ | คะแนนที่ server ประเมินชนิด numeric(18,6); null เมื่อยังไม่มีคะแนน ไม่ตีความทุกกรณีเป็น 0 |
| `MaxScore` | `numeric(18,6)` | ไม่ได้ | คะแนนเต็มของชุดข้อสอบใน Attempt ชนิด numeric(18,6) มากกว่า 0 และไม่เปลี่ยนตามคลังรุ่นใหม่ |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `CourseRunId` | [SchoolBotCourseRun](table-018.md) (`SchoolBotCourseRunId`) |
| `ActivityId` | [SchoolBotActivity](table-016.md) (`SchoolBotActivityId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotRetakeGrant](table-025.md) (ConsumedAttemptId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TUser](legacy-004.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Snapshot`: AttemptSnapshot; JSON ตรึง bank_id/revision, curriculum_revision, policy_id, evaluator_version, คำถาม/เฉลย/คะแนนเต็ม และลำดับข้อ/ตัวเลือก; ข้อมูลเฉลยเป็น server-only และไม่เปลี่ยนตามการแก้คลังภายหลัง
- `Answers`: Answer[]; JSON array ของ question_key และ selected_option_keys ที่ผู้เรียนเลือก ไม่รับคะแนนที่ client อ้าง

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:766) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
