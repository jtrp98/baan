# SchoolBotGradingJob

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** จัดคิวตรวจโครงงานอัตโนมัติและติดตามการ retry ของ worker

**หนึ่งแถว:** งานคิวหนึ่งรายการต่อ Submission หนึ่ง โดย retry ใช้แถวเดิม

**ใช้ตอนไหน/ใครใช้:** การส่งงานสร้างคิว; worker claim lease ตรวจงาน และบันทึกผล/ข้อผิดพลาด

**ตัวอย่างสมมติ:** สมมติ: worker ตรวจ Block ขัดข้องชั่วคราว จึงเลื่อนเวลา retry โดยไม่สร้าง Submission ใหม่

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotGradingJobId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotGradingJob (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `SubmissionId` | `integer` | ไม่ได้ | FK ไป SchoolBotSubmission ที่ต้องตรวจ; ไม่ซ้ำเพื่อไม่สร้างคิวซ้อนสำหรับการส่งเดียวกัน |
| `State` | `varchar(16)` | ไม่ได้ | queued=รอทำ, running=กำลังทำ, completed=งานคิวเสร็จ, failed=งานคิวล้มเหลว; completed ไม่ได้แปลว่า Outcome=passed |
| `Attempts` | `integer` | ไม่ได้ | จำนวนครั้งที่ worker พยายามประมวลผล หน่วยเป็นครั้ง ไม่ใช่จำนวนครั้งที่นักเรียนส่งงาน |
| `LeaseOwner` | `varchar(128)` | ได้ | รหัส worker ที่ถือสิทธิ์ทำงานชั่วคราว; null พร้อม LeaseUntil เมื่อไม่มี lease |
| `LeaseUntil` | `timestamptz` | ได้ | เวลา UTC สิ้นสุด lease ของ worker; null พร้อม LeaseOwner |
| `NextAttemptAt` | `timestamptz` | ไม่ได้ | เวลา UTC เร็วที่สุดที่คิวนี้ถึงกำหนดให้ลองประมวลผล |
| `LastErrorCode` | `varchar(64)` | ได้ | รหัสข้อผิดพลาดล่าสุดของงานคิว; null เมื่อไม่มีรหัสที่บันทึกไว้ ไม่ใช้แทนผลการเรียน |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `SubmissionId` | [SchoolBotSubmission](table-021.md) (`SchoolBotSubmissionId`) |

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:713) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
