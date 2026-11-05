# ตารางเดิม: PGTGradeEdits

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** เก็บการแก้หรือ override คะแนน/เกรดเดิม ซึ่งอาจมีผลเหนือค่าจาก PGTGradeDetail

**SchoolBot ใช้อย่างไร:** เชื่อมผ่าน ScorePreviewItem.Snapshot.cells[].grade_detail_id และ SchoolId; snapshot เก็บ grade_edit_fingerprint เพื่อจับการเปลี่ยน override

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อ block/re-check; SchoolBot ไม่แก้หรือล้าง override

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `GradeEditsID (GradeEditsId)` | int PK ของรายการแก้เกรด |
| `GradeDetailID (GradeDetailId)` | รหัสแถว PGTGradeDetail ที่ถูกแก้ |
| `SchoolID (SchoolId)` | โรงเรียนของรายการแก้ |
| `getScore100 (GetScore100)` | string? คะแนนรวม override; GradeService ใช้ทับค่าที่แสดงเมื่อไม่ว่าง |
| `GradeSet` | decimal? เกรดที่ตั้งแก้ไข; reader นำไปประกอบการแสดงผล |
| `UseGradeSet` | int? ตัวเลือกใช้ค่าที่ตั้ง; กฎเลือกแถว/ค่าทั้งหมดยังไม่พิสูจน์จาก writer |
| `getSpecial (GetSpecial)` | string? ผลพิเศษในรายการแก้; ห้ามล้างเพื่อให้ export ผ่าน |
| `UserUpdate` | int? ผู้แก้ตามทะเบียนเดิม; ไม่อนุมานว่าเป็น SchoolBot AccountId |
| `DateUpdate` | เวลาแก้เดิมแบบ timestamp without time zone; timezone จริงยังไม่ยืนยัน |
| `cDel (CDel)` | bool สถานะลบรายการแก้ |

## หลักฐานและข้อจำกัด

[PgtgradeEdit.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/PgtgradeEdit.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:737](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:737>); [GradeService.cs:167](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:167>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
