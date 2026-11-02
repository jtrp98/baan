# ตารางเดิม: PGTAssessment

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** หัวช่องคะแนนเดิม เช่น ชื่อช่องและคะแนนเต็ม ไม่ใช่ผลตรวจโครงงานของนักเรียน

**SchoolBot ใช้อย่างไร:** SchoolBotGradeSlot.AssessmentId → AssessmentId พร้อม NGradeId/SchoolId และปี/เทอม/ห้อง/วิชา; ScoreIdentifier ต้อง resolve จาก ScoreData/หลักฐานปลายทางจริง เพราะ entity นี้ไม่มี property ScoreIdentifier

**ขอบเขตอ่าน/เขียน:** อ่านและยืนยันช่องเดิม; การสร้าง GradeSlot ไม่สร้าง PGTAssessment และงานนี้ไม่อนุมัติสร้างช่องใหม่

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `AssessmentId` | int PK ของหัวช่องคะแนน |
| `SchoolId` | โรงเรียนของหัวช่อง; EF ที่ตรวจใช้ชื่อ SchoolId ไม่ได้ map เป็น SchoolID |
| `AssessmentName` | ชื่อหัวช่องคะแนน |
| `AssessmentMaxScore` | string? คะแนนเต็มของช่อง; reader ที่ตรวจ parse เป็น int |
| `AssessmentTypeId` | int? ประเภทช่องตามระบบเดิม; enum ยังไม่ยืนยัน |
| `NameIdentifier` | string? identifier ของชื่อหัวช่อง; ไม่ใช่หลักฐานสูตรสร้าง ScoreIdentifier |
| `MaxScoreIdentifier` | string? identifier ของคะแนนเต็ม; ห้ามแปลงเป็น ScoreIdentifier ด้วยการเดา |
| `nGradeId (NGradeId)` | int? หัวใบคะแนนที่อ้าง |
| `nYear (NYear)` | int? รหัสปีของช่อง |
| `nTerm (NTerm)` | string รหัสเทอม |
| `nTSubLevel (NTsubLevel)` | int? ระดับชั้น |
| `nTermSubLevel2 (NTermSubLevel2)` | int? ห้อง |
| `sPlaneID (SPlaneId)` | int? รายวิชา |
| `SubmitPeriod` | string? สถานะ/ช่วงส่งคะแนน; source-review-005 อ้าง proto ว่า '-1' เกี่ยวกับการล็อก แต่ยังไม่พิสูจน์ writer จริง |
| `IsActive` | bool? สถานะใช้งานหัวช่อง |
| `cDel (CDel)` | bool สถานะลบหัวช่อง |

## หลักฐานและข้อจำกัด

[Pgtassessment.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/Pgtassessment.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:216](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:216>); [GradeService.cs:296](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:296>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
