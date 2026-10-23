# ตารางเดิม: PGTGradeAuditLog

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** ตาราง audit เดิมของฐานเกรด ซึ่ง DES-009 กำหนดให้ใช้เก็บ durable receipt ของการส่งคะแนน

**SchoolBot ใช้อย่างไร:** SchoolBotScoreOutbox.ReceiptId → GradeAuditLogId แบบ logical ข้าม DB; ตรวจ SchoolId/OperationKey/PayloadHash ตาม receipt contract

**ขอบเขตอ่าน/เขียน:** อ่านและ INSERT แบบมีเงื่อนไขตาม DES-009 หลังผ่าน gates และพิสูจน์บัญชี DB เดิม; คะแนนกับ receipt ต้อง commit ใน PGGradeDB transaction เดียว; การมี entity ยังไม่พิสูจน์ว่ากลไกนี้ทำงานแล้ว

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `GradeAuditLogId` | long/int8 PK ของ audit; ต้นทางของ SchoolBotScoreOutbox.ReceiptId |
| `SchoolId` | โรงเรียนของ audit; physical ใช้ SchoolId ตาม mapping ที่ตรวจ |
| `sEmp (SEmp)` | int? รหัสครูผู้กระทำ; สัญญา export ใช้ครูผู้ยืนยัน ไม่ใช่ identity ของ worker |
| `Application` | string? ชื่อระบบผู้เขียน; สัญญา export ระบุ SchoolBot |
| `MethodName` | string? ชื่อ operation; สัญญา export ระบุ ScoreExport.Apply |
| `Parameter` | string? ข้อมูลประกอบ audit ที่สัญญาจะใช้เก็บ receipt; ความเข้ากันได้กับ consumer/retention เดิมยังไม่พิสูจน์ |
| `Logdate` | DateTime? เวลา audit แบบ timestamp without time zone; timezone และการแปลงเวลาต้องยืนยัน |

## หลักฐานและข้อจำกัด

[PgtgradeAuditLog.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/PgtgradeAuditLog.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:445](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:445>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
