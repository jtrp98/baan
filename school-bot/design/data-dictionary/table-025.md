# SchoolBotRetakeGrant

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** ให้สิทธิ์สอบซ่อมหรือทำเพิ่มเป็นรายนักเรียน โดยติดตามว่าใช้สิทธิ์แล้วกับ Attempt ใด

**หนึ่งแถว:** สิทธิ์เพิ่มหนึ่ง Attempt สำหรับนักเรียน/กิจกรรม/run ที่ระบุ

**ใช้ตอนไหน/ใครใช้:** ครูรายวิชาออกสิทธิ์; เริ่ม Attempt ใช้สิทธิ์ภายใต้ lock

**ตัวอย่างสมมติ:** สมมติ: ครูให้สิทธิ์สอบซ่อม Test เพิ่ม 1 ครั้งแก่ผู้เรียนคนหนึ่ง

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotRetakeGrantId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotRetakeGrant (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `CourseRunId` | `integer` | ไม่ได้ | FK ไป SchoolBotCourseRun ที่สิทธิ์นี้มีผล |
| `ActivityId` | `integer` | ไม่ได้ | FK ไป SchoolBotActivity ที่อนุญาตให้ทำเพิ่ม ไม่ใช้ข้ามกิจกรรม |
| `LearnerId` | `integer` | ไม่ได้ | TUser.sID ของนักเรียนผู้รับสิทธิ์ พร้อม SchoolId |
| `Reason` | `varchar(1000)` | ไม่ได้ | เหตุผลที่ครูอนุญาตให้ทำเพิ่ม เพื่อย้อนตรวจการให้สิทธิ์ |
| `ConsumedAttemptId` | `integer` | ได้ | FK ไป SchoolBotAttempt ที่ใช้สิทธิ์ใบนี้; null หมายถึงยังไม่ได้ผูกกับ Attempt ที่ใช้สิทธิ์ |
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
| `ActivityId` | [SchoolBotActivity](table-016.md) (`SchoolBotActivityId`) |
| `ConsumedAttemptId` | [SchoolBotAttempt](table-024.md) (`SchoolBotAttemptId`) |

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TUser](legacy-004.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:767) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
