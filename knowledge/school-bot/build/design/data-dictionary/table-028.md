# SchoolBotScorePreview

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บใบตรวจคะแนนเดิม→ใหม่และบริบทที่ตรึงไว้ก่อนครูยืนยัน

**หนึ่งแถว:** หนึ่งชุด preview ของ CourseRun ที่ผู้กระทำหนึ่งคนสร้าง

**ใช้ตอนไหน/ใครใช้:** สร้าง/อ่าน preview, resolve ความขัดแย้งเป็นใบใหม่ และ confirm เป็น Export

**ตัวอย่างสมมติ:** สมมติ: ครูตรวจคะแนนที่จะส่งให้นักเรียน 30 คน โดยยังไม่มีการเขียน PGGradeDB

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotScorePreviewId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotScorePreview (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun ของชุดคะแนน |
| `Principal` | `varchar(512)` | ไม่ได้ | ตัวตนครูผู้สร้าง preview แบบมีชนิดและโรงเรียน ใช้ผูกสิทธิ์กับ snapshot |
| `SnapshotHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของ canonical snapshot ทั้งชุด ใช้ยืนยันว่าครูกำลังยืนยันข้อมูลชุดที่เห็น |
| `ExpiresAt` | `timestamptz` | ไม่ได้ | เวลา UTC หมดอายุ preview; DES-009 เสนอ bound 15 นาที ไม่ใช่ SLA ที่พิสูจน์จากระบบจริง |
| `State` | `varchar(16)` | ไม่ได้ | open=รอยืนยัน, conflicted=มีความขัดแย้ง, confirmed=ยืนยันแล้ว, superseded=ถูกใบใหม่แทน, expired=หมดอายุ |
| `SupersedesId` | `integer` | ได้ | FK ไป preview เดิมที่ใบนี้แทน เช่น หลัง resolve; null เมื่อไม่ได้แทนใบเดิม |
| `Context` | `jsonb` | ไม่ได้ | JSON ของ mapping IDs/update_date, policy_id, roster นักเรียน, writer_version, calculator_version และเวลา authorization_checked_at เพื่อใช้ตรวจว่าบริบทเปลี่ยนก่อนยืนยันหรือไม่ |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `CourseRunId` | [SchoolBotCourseRun](table-018.md) (`SchoolBotCourseRunId`) |
| `SupersedesId` | [SchoolBotScorePreview](table-028.md) (`SchoolBotScorePreviewId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotScorePreview](table-028.md) (SupersedesId), [SchoolBotScorePreviewItem](table-029.md) (ScorePreviewId), [SchoolBotScoreExport](table-030.md) (ScorePreviewId)

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Context`: PreviewContext; JSON ของ mapping IDs/update_date, policy_id, roster นักเรียน, writer_version, calculator_version และเวลา authorization_checked_at เพื่อใช้ตรวจว่าบริบทเปลี่ยนก่อนยืนยันหรือไม่

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/build/db/schoolbot_db.sql:571) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
