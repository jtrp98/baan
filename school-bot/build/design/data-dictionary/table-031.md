# SchoolBotScoreOutbox

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บงานเขียนคะแนนรายนักเรียนและหลักฐานปลายทาง เพื่อ retry/reconcile ข้ามฐานข้อมูลโดยไม่เขียนซ้ำ

**หนึ่งแถว:** งานของนักเรียนหนึ่งคนใน Export หนึ่งใบ อ้าง PreviewItem ที่ยืนยันแล้ว

**ใช้ตอนไหน/ใครใช้:** confirm สร้างงานรายคน; worker claim/apply/retry; reconciliation ตรวจ receipt

**ตัวอย่างสมมติ:** สมมติ: PGGradeDB commit คะแนนสำเร็จแต่ worker หยุดก่อนอัปเดต SchoolBot จึงอ่าน receipt เพื่อกระทบยอด

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotScoreOutboxId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotScoreOutbox (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `ScoreExportId` | `integer` | ไม่ได้ | FK ไป SchoolBotScoreExport เจ้าของงานส่งออก |
| `ScorePreviewItemId` | `integer` | ไม่ได้ | FK ไป SchoolBotScorePreviewItem ของนักเรียนและ snapshot ที่จะส่ง; application ต้องตรวจว่าอยู่ใน preview ของ export เดียวกัน |
| `OperationKey` | `uuid` | ไม่ได้ | UUID ไม่ซ้ำของการเขียนรายคน ใช้ตรวจ durable receipt และกัน replay ข้าม DB |
| `PayloadHash` | `varchar(64)` | ไม่ได้ | SHA-256 ของ payload ที่ยืนยัน ใช้ตรวจว่า OperationKey เดิมไม่ได้ถูกใช้กับข้อมูลคนละชุด |
| `State` | `varchar(16)` | ไม่ได้ | queued=รอ, running=กำลังทำ, applied=ยืนยันว่าปลายทางรับแล้ว, skipped=ข้ามตามการตัดสิน, conflict=ข้อมูลชน, blocked=เงื่อนไขห้ามเขียน, unknown=ผลยังไม่แน่ชัดต้อง reconcile |
| `Attempts` | `integer` | ไม่ได้ | จำนวนครั้งที่ worker พยายามดำเนินงาน หน่วยเป็นครั้ง ไม่ใช่จำนวนครั้งที่บวกคะแนน |
| `LeaseOwner` | `varchar(128)` | ได้ | รหัส worker ที่ถือ lease; null พร้อม LeaseUntil เมื่อไม่มีผู้ถือ lease |
| `LeaseUntil` | `timestamptz` | ได้ | เวลา UTC หมดอายุ lease เพื่อให้จัดการ worker ที่หยุดทำงานได้; null พร้อม LeaseOwner |
| `NextAttemptAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่งานนี้ถึงกำหนดให้ลองทำครั้งถัดไป |
| `ReceiptId` | `bigint` | ได้ | logical reference ไป PGTGradeAuditLog.GradeAuditLogId ชนิด bigint/int8; API ส่งเป็น decimal string; null เมื่อยังไม่มี receipt ID ที่บันทึกยืนยัน |
| `ReceiptHash` | `varchar(64)` | ได้ | hash สำหรับตรวจความตรงกันของ receipt ที่ใช้ยืนยันผล; null เมื่อยังไม่มี hash ที่บันทึก |
| `LastErrorCode` | `varchar(64)` | ได้ | รหัสปัญหาล่าสุดของการส่งหรือกระทบยอด; null เมื่อไม่มีรหัสที่บันทึกไว้ |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `ScoreExportId` | [SchoolBotScoreExport](table-030.md) (`SchoolBotScoreExportId`) |
| `ScorePreviewItemId` | [SchoolBotScorePreviewItem](table-029.md) (`SchoolBotScorePreviewItemId`) |

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[PGTGradeAuditLog](legacy-025.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/build/db/schoolbot_db.sql:623) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
