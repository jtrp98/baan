# SchoolBotScorePreviewItem

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บรายละเอียด preview รายนักเรียน โดยหนึ่งคนอาจมีหลายช่องคะแนน

**หนึ่งแถว:** นักเรียนหนึ่งคนใน ScorePreview หนึ่งใบ

**ใช้ตอนไหน/ใครใช้:** หน้า preview แสดงผลรายคน; confirm สร้าง Outbox; worker อ่าน snapshot ที่ยืนยัน

**ตัวอย่างสมมติ:** สมมติ: นักเรียน ก มีสองช่องพร้อมส่ง ส่วนนักเรียน ข ถูก block เพราะมี override

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotScorePreviewItemId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotScorePreviewItem (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `ScorePreviewId` | `integer` | ไม่ได้ | FK ไป SchoolBotScorePreview เจ้าของรายการ |
| `LearnerId` | `integer` | ไม่ได้ | TUser.sID ของนักเรียนใน roster พร้อม SchoolId; คู่ ScorePreviewId/LearnerId ไม่ซ้ำ |
| `State` | `varchar(16)` | ไม่ได้ | ready=พร้อมตามการตรวจ preview, conflict=ข้อมูลชนต้องตัดสินใจใหม่, blocked=ไม่ผ่านเงื่อนไขที่ห้ามเขียน |
| `ReasonCodes` | `jsonb` | ไม่ได้ | JSON array รหัสเหตุที่ conflict/blocked เช่นข้อมูลปลายทางเปลี่ยนหรือผลยังไม่พร้อม; ไม่ใช้ข้อความแสดงผลเป็นตัวตัดสิน |
| `Snapshot` | `jsonb` | ไม่ได้ | JSON cells รายช่อง เก็บ mapping/slot, TargetSnapshot, grade_detail_id, row_token, old_score, last_exported_score, raw_target, new_score, source refs/hash, ผลพิเศษ และ fingerprints; old_score/last_exported_score=null หมายถึงไม่มีค่าที่บันทึก ไม่ใช่ 0; new_score เป็นจำนวนเต็มหลังปัด half-up; decision เป็น apply/keep_destination/replace_owned |
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

**ตารางที่อ้างกลับมา:** [SchoolBotScoreOutbox](table-031.md) (ScorePreviewItemId)

ร่าง SQL คงเฉพาะ PK; ความสัมพันธ์/ความไม่ซ้ำ/เงื่อนไขข้อมูลในหน้านี้เป็นกฎฝั่ง application ไม่มี UNIQUE/FK/CHECK บังคับ และงานนี้ยังไม่เพิ่ม implementation ทดแทน. ชั้น application ต้องตรวจแถวอ้างอิง โรงเรียน และบริบทของข้อมูลเอง การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TUser](legacy-004.md) · [PGTGradeDetail](legacy-022.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `ReasonCodes`: ReasonCodes; JSON array รหัสเหตุที่ conflict/blocked เช่นข้อมูลปลายทางเปลี่ยนหรือผลยังไม่พร้อม; ไม่ใช้ข้อความแสดงผลเป็นตัวตัดสิน
- `Snapshot`: PreviewItemSnapshot; JSON cells รายช่อง เก็บ mapping/slot, TargetSnapshot, grade_detail_id, row_token, old_score, last_exported_score, raw_target, new_score, source refs/hash, ผลพิเศษ และ fingerprints; old_score/last_exported_score=null หมายถึงไม่มีค่าที่บันทึก ไม่ใช่ 0; new_score เป็นจำนวนเต็มหลังปัด half-up; decision เป็น apply/keep_destination/replace_owned

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:590) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ
