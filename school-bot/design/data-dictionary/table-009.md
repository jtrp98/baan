# SchoolBotProjectRevision

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บเนื้อหาโครงงานแต่ละฉบับแบบ immutable เพื่อเปิดย้อนหลังและส่งงานฉบับที่แน่นอน

**หนึ่งแถว:** หนึ่ง snapshot ของโครงงานหนึ่ง ณ เลข Revision หนึ่ง

**ใช้ตอนไหน/ใครใช้:** การบันทึกสร้าง revision ใหม่; เปิดงาน/ทำสำเนา/ตรวจงานอ่าน snapshot

**ตัวอย่างสมมติ:** สมมติ: งานที่ส่งอ้าง revision 3 แม้เจ้าของจะบันทึก revision 4 ภายหลัง

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotProjectRevisionId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotProjectRevision (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `ProjectId` | `integer` | ไม่ได้ | FK ไป SchoolBotProject เจ้าของ snapshot |
| `Revision` | `integer` | ไม่ได้ | เลขลำดับฉบับภายใน Project เริ่มจาก 1; คู่ ProjectId/Revision ไม่ซ้ำ |
| `Content` | `jsonb` | ไม่ได้ | JSON เนื้อหาตาม DES-003: code เก็บ source, block เก็บ stacks/blocks, arm เก็บ poses/order/groups และค่าการเล่น; duration ของ Arm เป็น milliseconds ไม่เก็บสถานะเชื่อมต่อเป็นผลจริงถาวร |
| `ContentHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของเนื้อหา ใช้ระบุตรวจความตรงกันของ snapshot ไม่ใช่คะแนนหรือหลักฐานว่ารันผ่าน |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `ProjectId` | [SchoolBotProject](table-008.md) (`SchoolBotProjectId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotProject](table-008.md) (SchoolBotProjectId + CurrentRevision), [SchoolBotSubmission](table-021.md) (ProjectRevisionId)

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Content`: ProjectContent; JSON เนื้อหาตาม DES-003: code เก็บ source, block เก็บ stacks/blocks, arm เก็บ poses/order/groups และค่าการเล่น; duration ของ Arm เป็น milliseconds ไม่เก็บสถานะเชื่อมต่อเป็นผลจริงถาวร

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md) และ [ProjectContent](../des-003.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:192) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
