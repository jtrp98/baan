# SchoolBotSubmission

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บการส่งโครงงานฉบับแน่นอนให้ตรวจภารกิจ แยกจากการทำข้อสอบใน Attempt

**หนึ่งแถว:** นักเรียนหนึ่งคนส่ง ProjectRevision หนึ่งเพื่อ Mission และ Criteria ฉบับหนึ่ง

**ใช้ตอนไหน/ใครใช้:** นักเรียนส่งงาน; worker/ครูตรวจ; progress และ export อ่านผลประเมินปัจจุบัน

**ตัวอย่างสมมติ:** สมมติ: นักเรียนส่งโครงงาน Arm revision 3 ให้ครูตรวจ และสถานะเป็น awaiting_teacher

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotSubmissionId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotSubmission (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `LearnerId` | `integer` | ไม่ได้ | TUser.sID ของนักเรียนพร้อม SchoolId; schema ปัจจุบันไม่ใช้ sEmp ของครูแทน |
| `MissionId` | `integer` | ไม่ได้ | FK ไป SchoolBotMission ที่ส่งงานตอบ |
| `CriteriaId` | `integer` | ไม่ได้ | FK ไป SchoolBotCriteria ฉบับที่ใช้ตรวจ ต้องเป็นของ MissionId เดียวกัน |
| `ProjectRevisionId` | `integer` | ไม่ได้ | FK ไป SchoolBotProjectRevision ที่ส่งจริง ต้องเป็นของนักเรียนคนนี้และโรงเรียนเดียวกัน ไม่ใช่ local UUID |
| `SubmittedAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่ server รับการส่งงานนี้ |
| `State` | `varchar(24)` | ไม่ได้ | queued=รอระบบตรวจ, grading=กำลังตรวจ, awaiting_teacher=รอครู, evaluated=มีผลแล้ว, error=กระบวนการตรวจผิดพลาด ซึ่งไม่เท่ากับสอบไม่ผ่าน |
| `CurrentAssessmentId` | `integer` | ได้ | FK ไป SchoolBotAssessment ผลปัจจุบันของ Submission นี้; null เมื่อยังไม่มีผลที่ชี้ใช้งาน |
| `Evidence` | `jsonb` | ได้ | JSON หลักฐานประกอบงาน Arm มี profile_hash, acceptance_ref และ note; null เมื่อไม่มีหลักฐานประกอบ ไม่ใช้ข้อมูลนี้ยืนยันว่าหุ่นเคลื่อนไหวสำเร็จโดยลำพัง |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `MissionId` | [SchoolBotMission](table-014.md) (`SchoolBotMissionId`) |
| `CriteriaId` | [SchoolBotCriteria](table-015.md) (`SchoolBotCriteriaId`) |
| `ProjectRevisionId` | [SchoolBotProjectRevision](table-009.md) (`SchoolBotProjectRevisionId`) |
| `CurrentAssessmentId` | [SchoolBotAssessment](table-023.md) (`SchoolBotAssessmentId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotGradingJob](table-022.md) (SubmissionId), [SchoolBotAssessment](table-023.md) (SubmissionId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TUser](legacy-004.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Evidence`: ArmEvidence; JSON หลักฐานประกอบงาน Arm มี profile_hash, acceptance_ref และ note; null เมื่อไม่มีหลักฐานประกอบ ไม่ใช้ข้อมูลนี้ยืนยันว่าหุ่นเคลื่อนไหวสำเร็จโดยลำพัง

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:680) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
