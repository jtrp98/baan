# SchoolBotScoreExport

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** บันทึกการยืนยันส่งคะแนนหนึ่งใบและสถานะรวมของงานส่งออก

**หนึ่งแถว:** ใบงานส่งออกหนึ่งใบจาก preview ที่ยืนยันแล้วหนึ่งใบ

**ใช้ตอนไหน/ใครใช้:** confirm สร้างใบงาน; worker ปรับสถานะรวม; ครูและผู้ดูแลติดตามผล

**ตัวอย่างสมมติ:** สมมติ: ครูกดยืนยัน preview แล้วได้ export สถานะ queued ก่อน worker เริ่มเขียน

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotScoreExportId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotScoreExport (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `ScorePreviewId` | `integer` | ไม่ได้ | FK ไป SchoolBotScorePreview ที่ยืนยัน; unique เพื่อไม่ให้ preview เดียวเกิด export ซ้ำ |
| `ConfirmedBy` | `varchar(512)` | ไม่ได้ | ตัวตนครูผู้ยืนยันแบบ Actor ใช้ตรวจสิทธิ์ซ้ำตอน worker apply; ไม่ใช่ผู้ดูแลโรงเรียนโดยอัตโนมัติ |
| `ConfirmedAt` | `timestamptz` | ไม่ได้ | เวลา UTC ที่บันทึกการยืนยัน ไม่ใช่เวลาที่คะแนนทุกคนเขียนสำเร็จ |
| `State` | `varchar(32)` | ไม่ได้ | queued=รอ, running=กำลังส่ง, paused_conflict=หยุดเพราะชน, reconciling=กำลังกระทบยอดผลที่ไม่แน่ชัด, completed=เสร็จ, completed_with_skips=เสร็จโดยมีข้าม, failed=งานล้มเหลว |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ; ค่าเริ่มต้นใน DB = NULL |
| `CreateDate` | `timestamptz` | ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server; ค่าเริ่มต้นใน DB = NULL |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy; ค่าเริ่มต้นใน DB = NULL |
| `UpdateDate` | `timestamptz` | ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version; ค่าเริ่มต้นใน DB = NULL |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์เชิงตรรกะ (ไม่มี SQL FK)

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `ScorePreviewId` | [SchoolBotScorePreview](table-028.md) (`SchoolBotScorePreviewId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotScoreOutbox](table-031.md) (ScoreExportId)

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:607) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
