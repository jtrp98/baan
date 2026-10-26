# SchoolBotScoringPolicy

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บนโยบายนับคะแนนและน้ำหนักกิจกรรมของห้องเป็นราย revision

**หนึ่งแถว:** หนึ่งฉบับนโยบายคะแนนของ CourseRun หนึ่ง

**ใช้ตอนไหน/ใครใช้:** ครูเพิ่ม policy ฉบับใหม่; การเลือกแหล่งคะแนนและการคำนวณ Level อ่าน policy ที่อ้างอิง

**ตัวอย่างสมมติ:** สมมติ: ห้องกำหนดไม่เอาคะแนน Quiz มารวม จึงให้น้ำหนัก Quiz เป็น 0

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotScoringPolicyId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotScoringPolicy (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun; อ่าน CurriculumId ผ่าน run จึงไม่มีคอลัมน์ CurriculumId ซ้ำ |
| `Revision` | `integer` | ไม่ได้ | เลขฉบับนโยบายภายใน run; การเปลี่ยนสร้างแถวใหม่เพื่อรักษาประวัติ |
| `Policy` | `jsonb` | ไม่ได้ | JSON มี quiz_counts, activity_weights และ formula_version; weight_bps เป็น basis points 0–10000 โดย 10000=100% และน้ำหนักรวม 10000; formula_version=weighted-normalized-v1; null คือร่างก่อนเปิด; น้ำหนักใหม่หลังเริ่มใช้ run ใหม่ |
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

**ตารางที่อ้างกลับมา:** [SchoolBotCourseRun](table-018.md) (CurrentPolicyId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Policy`: ScoringPolicy; JSON มี quiz_counts, activity_weights และ formula_version; weight_bps เป็น basis points 0–10000 โดย 10000=100% และน้ำหนักรวม 10000; formula_version=weighted-normalized-v1; null คือร่างก่อนเปิด; น้ำหนักใหม่หลังเริ่มใช้ run ใหม่

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:548) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log
- 2026-10-23 — Rev2: sync032..034 ตาม [กฎผลเรียน](../learning-rules-032-034.md)

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
