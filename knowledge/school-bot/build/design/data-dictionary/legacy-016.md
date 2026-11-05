# ตารางเดิม: TPlanCourseStudent

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** เก็บการผูกนักเรียนกับรายวิชาในแผน พร้อมบริบทเทอมและห้อง

**SchoolBot ใช้อย่างไร:** เทียบ CourseRun.PlanCourseIds[]/ClassroomId/NTerm/SchoolId กับ LearnerId; เป็นแหล่งสมาชิกวิชาที่ต้องพิจารณาร่วมกับประวัติห้องและ section

**ขอบเขตอ่าน/เขียน:** อ่าน; หลักฐานยังไม่พอที่จะประกาศว่าตารางนี้เป็น roster หลักในทุกกรณี

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนของรายการลงเรียน |
| `PlanCourseStudentId` | รหัสรายการผูกนักเรียนกับรายวิชา |
| `PlanCourseId` | รายวิชาในแผนที่นักเรียนลงเรียน |
| `sID (SId)` | รหัสนักเรียนใน TUser |
| `nTerm (NTerm)` | string? เทอมที่รายการมีผล |
| `nTermSubLevel2 (NTermSubLevel2)` | int? ห้องในบริบทการลงเรียน |
| `nTSubLevel (NTsubLevel)` | int ระดับชั้นของรายการลงเรียน |
| `IsActive` | bool สถานะใช้งานรายการ |
| `cDel (CDel)` | bool สถานะลบรายการ |

## หลักฐานและข้อจำกัด

[TplanCourseStudent.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourseStudent.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7860](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7860>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
