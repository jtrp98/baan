# SchoolBotLevelProposal

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บผลเสนอและการตัดสิน Level ของทั้งห้องสำหรับเทอมถัดไป โดยไม่แก้ทะเบียนชั้นเรียนเดิม

**หนึ่งแถว:** ใบเสนอหนึ่งชุดจาก CourseRun หนึ่ง พร้อมคะแนนและ roster ณ ตอนประเมิน

**ใช้ตอนไหน/ใครใช้:** สิ้นเทอมสร้างข้อเสนอ; ครู confirm/decline; ระบบสร้าง successor CourseRun

**ตัวอย่างสมมติ:** สมมติ: ค่าเฉลี่ยห้องสูงกว่าเกณฑ์ ระบบเสนอหลักสูตร Level ถัดไปให้ครูยืนยันทั้งห้อง

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotLevelProposalId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotLevelProposal (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun ต้นทางที่กำลังปิดหรือปิดแล้ว |
| `TargetCurriculumId` | `integer` | ไม่ได้ | FK ไป curriculum revision ที่กำหนดเป็นปลายทางของข้อเสนอ อาจเป็นระดับเดิมในกรณีคงระดับ ไม่ใช่รหัสชั้นเรียนใหม่ |
| `SnapshotHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของข้อมูลข้อเสนอที่ตรึงไว้ ใช้ตรวจตอน confirm/decline |
| `Snapshot` | `jsonb` | ไม่ได้ | JSON เก็บ promotion policy/revision, scoring policy, formula_version, roster/คะแนนรวมรายคน/source_hash, average, threshold, gap, member_count, eligible และปี/เทอม/เวลาที่มีผล; missing_as_zero=true ใช้เฉพาะการประเมิน Level; total/average/gap ที่ null หมายถึงไม่มีค่าตาม snapshot ไม่ควรเดาสูตรเติม |
| `State` | `varchar(16)` | ไม่ได้ | proposed=รอครูยืนยัน, promoted=ยืนยันเลื่อน, retained=คงระดับ, max_level=ถึงระดับสูงสุด, stale=ข้อมูลเปลี่ยนต้องเสนอใหม่ |
| `DecisionBy` | `varchar(512)` | ได้ | ตัวตนผู้ตัดสินเมื่อมีการบันทึกการตัดสิน; null พร้อม DecisionAt เมื่อยังไม่มีผู้ตัดสินที่บันทึก ห้ามแต่งชื่อผู้อนุมัติให้สถานะที่ระบบกำหนดเอง |
| `DecisionAt` | `timestamptz` | ได้ | เวลา UTC ของการตัดสินที่บันทึก; null พร้อม DecisionBy |
| `Reason` | `varchar(1000)` | ได้ | เหตุผลการตัดสิน เช่น ปฏิเสธการเลื่อน; null เมื่อยังไม่มีเหตุผลที่บันทึก ไม่ใช้ null แทนการอนุมัติ |
| `SuccessorRunId` | `integer` | ได้ | FK ไป CourseRun เทอมถัดไปที่สร้างจากผลนี้; null เมื่อยังไม่มี successor ที่ผูก และห้ามชี้ run ต้นทางเอง |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `CourseRunId` | [SchoolBotCourseRun](table-018.md) (`SchoolBotCourseRunId`) |
| `TargetCurriculumId` | [SchoolBotCurriculum](table-012.md) (`SchoolBotCurriculumId`) |
| `SuccessorRunId` | [SchoolBotCourseRun](table-018.md) (`SchoolBotCourseRunId`) |

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Snapshot`: LevelSnapshot; JSON เก็บ promotion policy/revision, scoring policy, formula_version, roster/คะแนนรวมรายคน/source_hash, average, threshold, gap, member_count, eligible และปี/เทอม/เวลาที่มีผล; missing_as_zero=true ใช้เฉพาะการประเมิน Level; total/average/gap ที่ null หมายถึงไม่มีค่าตาม snapshot ไม่ควรเดาสูตรเติม

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:653) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
