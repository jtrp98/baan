# SchoolBotGradeSlot

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** บันทึกว่าช่องคะแนนเดิมใดได้รับการยืนยันให้ SchoolBot ดูแล โดยไม่ได้สร้างหัวช่องคะแนนเดิมขึ้นใหม่

**หนึ่งแถว:** สิทธิ์ดูแลช่องปลายทางหนึ่งช่องที่ระบุด้วย SchoolId/NGradeId/AssessmentId/ScoreIdentifier

**ใช้ตอนไหน/ใครใช้:** ผู้ดูแลโรงเรียนยืนยัน ownership; mapping เลือกปลายทาง; preview/worker ตรวจสิทธิ์ช่องก่อนใช้

**ตัวอย่างสมมติ:** สมมติ: ผู้ดูแลเลือกช่องคะแนนเก็บที่ว่างและยืนยันให้ใช้รับผลจากกิจกรรม SchoolBot

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotGradeSlotId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotGradeSlot (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun ที่ได้รับสิทธิ์ใช้ช่องนี้ |
| `PlanCourseId` | `integer` | ไม่ได้ | TPlanCourse.PlanCourseId ของวิชาในแผน ต้องอยู่ใน CourseRun.PlanCourseIds |
| `CourseId` | `integer` | ไม่ได้ | รหัสรายวิชา TPlane.sPlaneID ที่ resolve จากแผน ไม่ใช่ PlanCourseId |
| `NGradeId` | `integer` | ไม่ได้ | PGTGrade.nGradeId ของหัวใบคะแนนปลายทาง พร้อมบริบทโรงเรียน/เทอม/ห้อง/วิชา |
| `AssessmentId` | `integer` | ไม่ได้ | PGTAssessment.AssessmentId ของหัวช่องคะแนนเดิม ไม่ใช่ SchoolBotAssessmentId |
| `ScoreIdentifier` | `varchar(128)` | ไม่ได้ | ตัวระบุช่องจริงใน JSON PGTGradeDetail.ScoreData ใช้คู่ AssessmentId; ห้ามสร้างจากเลข Ordinal หรือชื่อช่องเอง |
| `Category` | `varchar(32)` | ไม่ได้ | before_midterm=เก็บก่อนกลางภาค, after_midterm=เก็บหลังกลางภาค, midterm=กลางภาค, final=ปลายภาค |
| `TargetSnapshot` | `jsonb` | ไม่ได้ | JSON บริบทปลายทาง ณ ยืนยันช่อง: ปี เทอม ห้อง แผน วิชา หัวเกรด assessment identifier คะแนนเต็ม และ token/hash ของหัว/การตั้งค่า เพื่อจับการเปลี่ยนภายหลัง |
| `OwnershipReason` | `varchar(1000)` | ไม่ได้ | เหตุผลและหลักฐานประกอบที่ผู้ดูแลยืนยันว่าช่องนี้เป็นช่องเฉพาะ SchoolBot |
| `RetiredAt` | `timestamptz` | ได้ | เวลา UTC ยุติ ownership; null หมายถึงยังถือครองอยู่ การตั้ง IsDelete อย่างเดียวไม่ทำให้ช่องว่างสำหรับเจ้าของใหม่ |
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

**ตารางที่อ้างกลับมา:** [SchoolBotScoreMapping](table-027.md) (GradeSlotId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TPlane](legacy-006.md) · [TPlanCourse](legacy-007.md) · [PGTGrade](legacy-020.md) · [PGTAssessment](legacy-021.md) · [PGTGradeDetail](legacy-022.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `TargetSnapshot`: TargetSnapshot; JSON บริบทปลายทาง ณ ยืนยันช่อง: ปี เทอม ห้อง แผน วิชา หัวเกรด assessment identifier คะแนนเต็ม และ token/hash ของหัว/การตั้งค่า เพื่อจับการเปลี่ยนภายหลัง

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:879) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
