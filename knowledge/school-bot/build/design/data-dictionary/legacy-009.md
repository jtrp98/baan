# ตารางเดิม: TPlanTermSubLevel2

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** เชื่อมแผนการเรียนกับห้องเรียน

**SchoolBot ใช้อย่างไร:** SchoolBotCourseRun.ClassroomId → nTermSubLevel2 และ CourseRun.PlanCourseIds[] → TPlanCourse.PlanId → PlanId; เทอมประกอบมาจาก TPlanCourseTerm เพราะตารางนี้ไม่มี NTerm

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อตรวจว่ารายวิชาอยู่ในแผนของห้อง; ไม่เขียน

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนเจ้าของความสัมพันธ์ |
| `PlanTermSubLevel2Id` | รหัสแถวเชื่อมแผนกับห้อง |
| `PlanId` | แผนที่นำไปเทียบ TPlanCourse.PlanId |
| `nTermSubLevel2 (NTermSubLevel2)` | รหัสห้องใน TTermSubLevel2 |
| `IsActive` | bool? ต้องเป็น true ใน query ห้อง/รายวิชาที่ตรวจ |
| `cDel (CDel)` | bool ต้องเป็น false ใน query ที่ตรวจ |

## หลักฐานและข้อจำกัด

[TplanTermSubLevel2.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanTermSubLevel2.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:8018](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:8018>); [PlanCourseRepository.cs:199](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/PlanCourseRepository.cs:199>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
