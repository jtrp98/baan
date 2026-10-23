# SchoolBotProject

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บตัวโครงงาน Cloud ชื่อ เจ้าของ โหมด และ pointer ไปฉบับปัจจุบัน

**หนึ่งแถว:** หนึ่งโครงงานของหนึ่ง profile โดยมี revision เนื้อหาได้หลายฉบับ

**ใช้ตอนไหน/ใครใช้:** สร้าง เปิด เปลี่ยนชื่อ บันทึก สำเนา และ soft delete โครงงาน

**ตัวอย่างสมมติ:** สมมติ: นักเรียนมีโครงงาน Block ชื่อ เดินไปถึงธง และบันทึกแล้ว 3 revision

**ขอบเขต:** ข้อมูลรายโรงเรียน: SchoolId ต้องมากกว่า 0 และอ่าน/เขียนภายใต้โรงเรียนนั้น

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotProjectId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotProject (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `OwnerKind` | `varchar(16)` | ไม่ได้ | student หรือ employee เพื่อบอกว่ารหัส OwnerId อยู่ในทะเบียนใด; เปลี่ยนเจ้าของชนิดนี้ไม่ได้ |
| `OwnerId` | `integer` | ไม่ได้ | รหัส profile เจ้าของ: TUser.sID หรือ TEmployees.sEmp ตาม OwnerKind พร้อม SchoolId |
| `Mode` | `varchar(16)` | ไม่ได้ | block, arm หรือ code กำหนดชนิดเนื้อหาและเครื่องมือเปิดงาน; เปลี่ยนโหมดของโครงงานเดิมไม่ได้ |
| `Name` | `varchar(200)` | ไม่ได้ | ชื่อที่ผู้ใช้เห็น ความยาวไม่เกิน 200 ตัวอักษร ไม่ใช้เป็น filesystem path |
| `CurrentRevision` | `integer` | ไม่ได้ | เลขลำดับ Revision ปัจจุบันใน SchoolBotProjectRevision ของ Project นี้; ไม่ใช่ SchoolBotProjectRevisionId |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ไม่ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `SchoolBotProjectId` + `CurrentRevision` | [SchoolBotProjectRevision](table-009.md) (`ProjectId` + `Revision`) |

**ตารางที่อ้างกลับมา:** [SchoolBotProjectRevision](table-009.md) (ProjectId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ข้อมูลเดิมที่เกี่ยวข้อง

[TUser](legacy-004.md) · [TEmployees](legacy-005.md)

กดชื่อตารางเดิมเพื่อดูคอลัมน์จริงและเส้นทางเชื่อม; เป็น logical reference/การตรวจบริบทข้าม DB ไม่ใช่ FK ที่สร้างใน SQL SchoolBot

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:284) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
