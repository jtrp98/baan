# SchoolBotLevelPromotionPolicy

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บเกณฑ์ค่าเฉลี่ยสำหรับเสนอเลื่อน Level โดยเก็บประวัติการเปลี่ยนเกณฑ์

**หนึ่งแถว:** เกณฑ์หนึ่ง revision สำหรับ Level หนึ่ง

**ใช้ตอนไหน/ใครใช้:** ส่วนกลางเพิ่ม revision เกณฑ์; LevelProposal อ่าน revision ที่ใช้ประเมิน

**ตัวอย่างสมมติ:** สมมติ: เกณฑ์ 70 หมายถึงค่าเฉลี่ย 70 ยังไม่ผ่าน แต่ค่าที่สูงกว่า 70 จึงเข้าเงื่อนไข

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotLevelPromotionPolicyId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotLevelPromotionPolicy (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `LevelId` | `integer` | ไม่ได้ | FK ไป SchoolBotLevel ที่ใช้เกณฑ์นี้ |
| `Revision` | `integer` | ไม่ได้ | เลขรุ่นเกณฑ์ภายใน Level; เปลี่ยนเกณฑ์สร้างแถวใหม่ ไม่ย้อนแก้ใบเสนอเก่า |
| `Threshold` | `numeric(9,6)` | ไม่ได้ | คะแนนเกณฑ์บนฐาน 0–100 เก็บ numeric(9,6); สัญญาใช้ average > threshold และเกณฑ์ revision แรกของ Level ใหม่เป็น 70 |
| `Reason` | `varchar(1000)` | ไม่ได้ | เหตุผลที่กำหนดหรือเปลี่ยนเกณฑ์ เพื่ออธิบายว่าทำไมแต่ละรุ่นต่างกัน |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `LevelId` | [SchoolBotLevel](table-010.md) (`SchoolBotLevelId`) |

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:374) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
