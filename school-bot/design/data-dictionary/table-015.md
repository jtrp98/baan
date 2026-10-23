# SchoolBotCriteria

[ตารางทั้งหมด](index.md) · [คู่มือภาพรวม](../data-model.md) · [ตารางเดิม](../data-legacy-001.md)

**หน้าที่:** เก็บเกณฑ์ตรวจภารกิจเป็นราย revision พร้อมหลักฐานอนุมัติ

**หนึ่งแถว:** เกณฑ์ตรวจหนึ่งฉบับของ Mission หนึ่ง

**ใช้ตอนไหน/ใครใช้:** ส่วนกลางจัดทำ/อนุมัติเกณฑ์; Submission ตรึงเกณฑ์; evaluator หรือครูใช้ตรวจ

**ตัวอย่างสมมติ:** สมมติ: เกณฑ์กำหนดให้ trace ตรงกับคำสั่งที่คาดไว้ และใช้จำนวนก้าวไม่เกินกำหนด

**ขอบเขต:** ข้อมูลส่วนกลาง: SchoolId ต้องเป็น NULL; โรงเรียนใช้เนื้อหาร่วมกัน

## ทุกฟิลด์ในตาราง

เรียงตาม SQL; “ว่างได้” หมายถึงเก็บ NULL ได้ ค่าจาก server ยังต้องผ่านกฎใน [สัญญาข้อมูล](../data-contract-rules.md)

| ฟิลด์ | ชนิดจริงใน SQL | ว่างได้ | เก็บอะไร / ใช้ทำอะไร |
|---|---|---|---|
| `SchoolBotCriteriaId` | `integer` | ไม่ได้ | รหัสแถวของ SchoolBotCriteria (PK); ฐานข้อมูลสร้างให้ ไม่รับรหัสจาก client; เป็น Primary Key ของตารางนี้; สร้างอัตโนมัติแบบ identity |
| `MissionId` | `integer` | ไม่ได้ | FK ไป SchoolBotMission ที่เกณฑ์นี้ใช้ตรวจ; ต้องตรงกับ MissionId ของ Submission |
| `Revision` | `integer` | ไม่ได้ | เลขฉบับเกณฑ์ภายใน Mission; ฉบับเผยแพร่หรือถูกใช้แล้วไม่ย้อนแก้ |
| `Rules` | `jsonb` | ไม่ได้ | JSON เกณฑ์ตาม DES-005: automatic-v1 ใช้ combine all/any กับ trace_equals, steps_at_most, uses_op; teacher-v1 ใช้รายการ rubric; กติกานี้ยังไม่ใช่สูตรแปลงผ่านเป็นคะแนนเต็ม |
| `SourceRef` | `varchar(2048)` | ไม่ได้ | เอกสารหรือหลักฐานต้นทางของกฎที่ใช้ตัดสินผลงาน |
| `ApprovedBy` | `varchar(512)` | ได้ | ตัวตนผู้อนุมัติแบบ Actor; null พร้อม ApprovedAt เมื่อยังไม่มีการอนุมัติ |
| `ApprovedAt` | `timestamptz` | ได้ | เวลา UTC อนุมัติเกณฑ์; null พร้อม ApprovedBy และต้องอนุมัติก่อน publish/use ตามสัญญา |
| `IsDelete` | `boolean` | ไม่ได้ | ระบุว่าแถวถูกลบแบบเก็บประวัติหรือไม่; false = ยังใช้, true = ซ่อนจากการอ่านตามปกติ ไม่ใช่การลบข้อมูลถาวร; ค่าเริ่มต้นใน SQL = false |
| `CreateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้สร้างรายการ; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ เลขอย่างเดียวไม่บอกชนิดคน ให้ดู Actor ใน AuditEvent ประกอบ |
| `CreateDate` | `timestamptz` | ไม่ได้ | วันเวลาสร้างรายการตามเวลา UTC จาก server |
| `UpdateBy` | `integer` | ได้ | รหัสนักเรียน sId หรือบุคลากร sEmp ผู้แก้ล่าสุด; NULL = ระบบ/ผู้ทำที่ไม่มีรหัส profile นี้ ใช้กฎเดียวกับ CreateBy |
| `UpdateDate` | `timestamptz` | ไม่ได้ | วันเวลาแก้ล่าสุด UTC จาก server; ใช้ตรวจว่ามีคนแก้แทรกก่อนบันทึกผ่าน ETag/If-Match แทนคอลัมน์ Version |
| `SchoolId` | `integer` | ได้ | รหัสโรงเรียนที่ข้อมูลแถวนี้สังกัด; ไม่ใช่รหัสผู้ใช้ ดูขอบเขตส่วนกลาง/รายโรงเรียนที่ต้นหน้านี้ |

## ความสัมพันธ์ที่ SQL บังคับจริง

| ฟิลด์ฝั่งนี้ | อ้างไปที่ |
|---|---|
| `MissionId` | [SchoolBotMission](table-014.md) (`SchoolBotMissionId`) |

**ตารางที่อ้างกลับมา:** [SchoolBotSubmission](table-021.md) (CriteriaId)

การมี FK ภายใน SchoolBot ไม่ได้ตรวจ SchoolId ให้ทุกคู่โดยอัตโนมัติ ชั้น application ต้องตรวจโรงเรียนและบริบทของข้อมูลด้วย การอ้างฐานเดิมข้าม DB ดู [แผนที่ legacy](../data-legacy-001.md)

## ฟิลด์ JSON

JSON เป็นข้อมูลหลายฟิลด์ซ้อนกัน ต้องตรวจตามโครงสร้างที่กำหนด:

- `Rules`: CriteriaRules; JSON เกณฑ์ตาม DES-005: automatic-v1 ใช้ combine all/any กับ trace_equals, steps_at_most, uses_op; teacher-v1 ใช้รายการ rubric; กติกานี้ยังไม่ใช่สูตรแปลงผ่านเป็นคะแนนเต็ม

อ่าน [คำอธิบาย JSON พร้อมตัวอย่าง](../data-json-001.md) แล้วดูรูปแบบฟิลด์ย่อยและ enum ที่ [สัญญาชนิดข้อมูล/JSON](contract-index.md) และ [CriteriaRules](../des-005.md)

## หลักฐาน

[schoolbot_db.sql](C:/src/schoolbright/knowledge/school-bot/db/schoolbot_db.sql:473) — ตารางและฟิลด์จริงในร่าง SQL; [สัญญาเดิม](contract-index.md) และแบบ DES ที่สารบัญ [design](../index.md) ระบุ


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
