# ตารางเดิม: TStudentClassroomHistory

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** เก็บประวัตินักเรียนอยู่ห้องใดในเทอมใด รวมการย้ายเข้าออก

**SchoolBot ใช้อย่างไร:** ใช้ตรวจ CourseRun.ClassroomId/NTerm/SchoolId กับ LearnerId และ snapshot roster; GradeService มีการเลือกประวัติของเทอมตาม NHistoryId สำหรับกรณีเทียบโอน แต่ไม่พิสูจน์กฎ roster สิ้นเทอมของ SchoolBot

**ขอบเขตอ่าน/เขียน:** อ่านเป็นแหล่งข้อมูลประกอบ roster; กฎเลือกสมาชิก ณ สิ้นเทอมยังมีหลักฐานไม่พอ; ไม่เขียน

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `nHistoryId (NHistoryId)` | int รหัสประวัติ เป็น PK ร่วมกับ SchoolID |
| `SchoolID (SchoolId)` | โรงเรียนของประวัติ |
| `sID (SId)` | int? รหัสนักเรียนที่ประวัตินี้อ้าง |
| `nTerm (NTerm)` | string? เทอมของประวัติ |
| `nTermSubLevel2 (NTermSubLevel2)` | int? ห้องในเทอมนั้น |
| `MoveInDate` | DateTime? วันที่ย้ายเข้า; timezone/กฎตัดสมาชิกยังไม่ยืนยัน |
| `MoveOutDate` | DateTime? วันที่ย้ายออก; null ไม่พิสูจน์สมาชิก ณ ทุกช่วงเวลาโดยลำพัง |
| `nStudentStatus (NStudentStatus)` | int? สถานะนักเรียนในประวัติ; enum ยังไม่ยืนยัน |
| `IsActive` | bool? สถานะใช้งานของประวัติ |
| `cDel (CDel)` | bool สถานะลบประวัติ |

## หลักฐานและข้อจำกัด

[TstudentClassroomHistory.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TstudentClassroomHistory.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:9435](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:9435>); [GradeService.cs:148](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:148>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
