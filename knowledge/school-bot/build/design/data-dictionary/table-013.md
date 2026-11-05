# SchoolBotLesson

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 097 — เพิ่ม `ImportSource` จาก migration-002 Rev2)

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** จัดเนื้อหาในหลักสูตรให้เป็นบทหรือหน่วยการเรียนที่มีกิจกรรมและภารกิจ

**หนึ่งแถว:** บทเรียนหนึ่งบทภายใน curriculum revision หนึ่ง

**ใช้ตอนไหน/ใครใช้:** ส่วนกลางจัดเนื้อหา (content PUT แทนบทเรียนทั้งชุด; importer BE-028 เพิ่มบทเรียนจาก Course Plan Sheet); ผู้เรียนเปิดบทเรียน; mapping ใช้บทเรียนช่วยเลือกกลุ่มกิจกรรม

**ตัวอย่างสมมติ:** สมมติ: บทเรียน ลำดับคำสั่ง มีกิจกรรมอ่านคำแนะนำ ทำโครงงาน และทำ Quiz

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotLessonId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotLesson (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CurriculumId` | `integer` | ไม่ได้ | FK ไป SchoolBotCurriculum ฉบับที่บทเรียนนี้สังกัด |
| `LessonKey` | `uuid` | ไม่ได้ | UUID ของบทเรียนที่คงตัวตนข้าม revision ของหลักสูตร แม้ row ID เปลี่ยน |
| `Ordinal` | `integer` | ไม่ได้ | ลำดับแสดงบทเรียนภายใน curriculum revision; เริ่มจาก 1 และไม่ซ้ำในฉบับเดียวกัน |
| `Title` | `jsonb` | ไม่ได้ | ชื่อบทเรียนหลายภาษาแบบ Text |
| `Objective` | `jsonb` | ไม่ได้ | ผลการเรียนรู้ที่บทนี้มุ่งให้ผู้เรียนทำได้ เป็น Text หลายภาษา |
| `Instructions` | `jsonb` | ไม่ได้ | คำอธิบายหรือแนวทางเรียนระดับบท เป็น Text หลายภาษา แยกจากโจทย์ภารกิจเฉพาะ |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |
| `ImportSource` | `jsonb` | ได้ | ที่มาและค่า D (อนุมัติจากต้นทาง) ของแถว Course Plan ณ เวลานำเข้า เป็น snapshot ไม่ใช่ event log; NULL = ไม่มีหลักฐานนำเข้าที่ยืนยันได้ (สร้างผ่าน content PUT หรือแถวก่อน migration) ไม่แปลว่าต้นทางไม่อนุมัติ; ไม่มี DEFAULT/CHECK/index; เขียนได้เฉพาะ importer และ content PUT คัดลอกค่าเดิมตาม LessonKey; เพิ่มโดย [migration-002 Rev2](../../db/migration-002-lesson-import-source.md) ซึ่งยังไม่รันบนฐานใด และยังไม่อยู่ใน `schoolbot_db.sql` baseline |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `CurriculumId` | [SchoolBotCurriculum](table-012.md) (`SchoolBotCurriculumId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotMission](table-014.md) (LessonId), [SchoolBotActivity](table-016.md) (LessonId)

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และกฎอื่นนอกจากข้อต่อไปนี้ยังไม่มี implementation ทดแทน ความไม่ซ้ำของ `LessonKey` ต่อ curriculum สำหรับบทเรียนที่นำเข้าใช้การค้นก่อนเขียนใต้ lock ของ curriculum แม่ตาม [persisted state ของ importer](../des-005-import-state.md). ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Title`: Text; ชื่อบทเรียนหลายภาษาแบบ Text
- `Objective`: Text; ผลการเรียนรู้ที่บทนี้มุ่งให้ผู้เรียนทำได้ เป็น Text หลายภาษา
- `Instructions`: Text; คำอธิบายหรือแนวทางเรียนระดับบท เป็น Text หลายภาษา แยกจากโจทย์ภารกิจเฉพาะ
- `ImportSource`: SQL NULL หรือ object สี่ key พอดี ฐานไม่ตรวจรูปทรง application ตรวจด้วย codec เดียวตาม [สัญญา importer](../des-005-import.md#1-importsource-เก็บอะไร-และอ่านกลับทางไหน)
  - `source_ref` string 1–2048 ไม่ว่างหลัง trim — ที่มาของ batch เก็บตรงตัว
  - `source_row_key` string UUID lowercase — ต้องเท่ากับ `LessonKey` ของแถวเดียวกัน
  - `source_approved` true / false / null (key ต้องมี) — D=TRUE / D=FALSE / ต้นทางไม่ระบุ; ไม่ใช่การอนุมัติหรือเผยแพร่ของ SchoolBot
  - `row_hash` string SHA-256 hex lowercase 64 ตัว — server คำนวณจากแถวที่ normalize แล้ว ไม่รวมตำแหน่ง/ลำดับ/คอลัมน์ O; ไม่ใช่ unique key
  - ตัวอย่างสมมติ: `{"source_ref":"fixture:course-plan-096","source_row_key":"00000000-0000-4000-8000-000000000003","source_approved":true,"row_hash":"<64 hex>"}`

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/build/db/schoolbot_db.sql:267) — ตารางและฟิลด์จริงในร่าง SQL; `../../db/migration-002-lesson-import-source.sql:6` — คำสั่งเพิ่ม `ImportSource jsonb NULL` (ยังไม่รัน); [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
