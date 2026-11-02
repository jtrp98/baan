# ตารางเดิม: TPlanCourseTerm

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ระบุว่ารายวิชาในแผนเปิดใช้กับเทอมใด

**SchoolBot ใช้อย่างไร:** เชื่อม SchoolBotCourseRun.PlanCourseIds[] กับ CourseRun.NTerm โดยตรวจ SchoolId เดียวกัน

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อยืนยันวิชาเปิดในเทอมนั้น; ไม่เขียน

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนของความสัมพันธ์รายวิชา/เทอม |
| `PlanCourseTermId` | รหัสแถวความสัมพันธ์ เป็น PK ร่วมกับ SchoolID |
| `PlanCourseId` | อ้างรายวิชาใน TPlanCourse |
| `nTerm (NTerm)` | string key ของเทอมที่ต้องตรงกับเทอม CourseRun |
| `IsActive` | bool? ต้องเป็น true ใน query ที่ตรวจ |
| `cDel (CDel)` | bool ต้องเป็น false ใน query ที่ตรวจ |

## หลักฐานและข้อจำกัด

[TplanCourseTerm.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourseTerm.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7921](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7921>); [TeacherRepository.cs:111](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:111>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
