# SchoolBotMission

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** นิยามโจทย์โครงงานที่จะส่งให้ตรวจ พร้อมวิธีประเมิน

**หนึ่งแถว:** ภารกิจโครงงานหนึ่งภายใต้บทเรียน; project Activity อ้างภารกิจนี้ผ่าน Config

**ใช้ตอนไหน/ใครใช้:** จัดโจทย์และ Criteria; นักเรียนสร้าง Submission; ระบบหรือครูเลือกวิธีตรวจ

**ตัวอย่างสมมติ:** สมมติ: ภารกิจให้เขียน Block เดินขวา 3 ช่อง แล้วส่งโครงงานให้ตรวจ

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotMissionId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotMission (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `LessonId` | `integer` | ไม่ได้ | FK ไป SchoolBotLesson ที่ภารกิจอยู่ |
| `MissionKey` | `uuid` | ไม่ได้ | UUID ถาวรของโจทย์ข้าม curriculum revision |
| `Ordinal` | `integer` | ไม่ได้ | ลำดับภารกิจภายใน Lesson; ไม่ใช่ ActivityId หรือเลขช่องคะแนน |
| `Title` | `jsonb` | ไม่ได้ | ชื่อโจทย์หลายภาษาแบบ Text เพื่อให้ผู้เรียนรู้ว่าจะทำงานอะไร |
| `Instructions` | `jsonb` | ไม่ได้ | คำสั่งและข้อกำหนดของงานที่ต้องส่ง เป็น Text หลายภาษา |
| `Method` | `varchar(16)` | ไม่ได้ | automatic=ระบบตรวจงาน Block/Code, teacher=ครูตรวจงาน Arm; ต้องสอดคล้องกับ Mode ของ project Activity |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `LessonId` | [SchoolBotLesson](table-013.md) (`SchoolBotLessonId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotCriteria](table-015.md) (MissionId), [SchoolBotSubmission](table-021.md) (MissionId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Title`: Text; ชื่อโจทย์หลายภาษาแบบ Text เพื่อให้ผู้เรียนรู้ว่าจะทำงานอะไร
- `Instructions`: Text; คำสั่งและข้อกำหนดของงานที่ต้องส่ง เป็น Text หลายภาษา

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:424) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
