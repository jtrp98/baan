# SchoolBotScoreMapping

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** กำหนดว่าจะนำคะแนนจากกิจกรรมใดไปใส่ GradeSlot ใด แยกจากการถือครองช่อง

**หนึ่งแถว:** ชุดแหล่งคะแนนหนึ่งชุดสำหรับ GradeSlot หนึ่งใน CourseRun หนึ่ง

**ใช้ตอนไหน/ใครใช้:** ผู้ดูแลสร้าง/แก้/retire mapping; ครูอ่านเพื่อ preview; server คำนวณคะแนนช่อง

**ตัวอย่างสมมติ:** สมมติ: ผล Test กิจกรรมหนึ่งถูกแมพเข้าช่องคะแนนปลายทางที่ผู้ดูแลเลือกไว้

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotScoreMappingId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotScoreMapping (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun และต้องตรงกับ run ของ GradeSlot |
| `GradeSlotId` | `integer` | ไม่ได้ | FK ไป SchoolBotGradeSlot ปลายทางที่มี ownership; active mapping ของ run/slot เดียวกันมีได้หนึ่งชุด |
| `Sources` | `jsonb` | ไม่ได้ | JSON array ของ activity_id, indicator_key และ weight_bps; indicator_key=null เมื่อไม่ระบุรายตัวชี้วัด, 10000 basis points=100%; หนึ่ง source น้ำหนัก10000ถาวร; confirm แล้วห้ามแก้/retire/soft-delete |
| `RetiredAt` | `timestamptz` | ได้ | เวลา UTC ยุติการใช้ mapping; null หมายถึงยังไม่ retire โดยประวัติ export เดิมคง snapshot เดิม |
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
| `GradeSlotId` | [SchoolBotGradeSlot](table-026.md) (`SchoolBotGradeSlotId`) |

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Sources`: MappingSource[]; JSON array ของ activity_id, indicator_key และ weight_bps; indicator_key=null เมื่อไม่ระบุรายตัวชี้วัด, 10000 basis points=100%; หนึ่ง source น้ำหนัก10000ถาวร; confirm แล้วห้ามแก้/retire/soft-delete

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:554) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log
- 2026-10-23 — Rev2: sync032/033 ตาม [กฎคะแนน](../grade-rules-032-034.md)

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
