# ตารางเดิม: TPlanCourseTeacher

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ระบุครูที่ได้รับมอบหมายให้สอนรายวิชาในแผน

**SchoolBot ใช้อย่างไร:** SchoolBotSession.ProfileId เมื่อ employee และ SchoolBotAssessment.AssessorId เทียบ sEmp; ตรวจ PlanCourseId กับ CourseRun.PlanCourseIds[]/GradeSlot.PlanCourseId และ SchoolId; เทอมผ่าน TPlanCourseTerm

**ขอบเขตอ่าน/เขียน:** อ่านเป็นหลักฐานการมอบหมายวิชา; query lookup ที่พบยังไม่ใช่หลักฐานว่า writer คะแนนบังคับ authorization ครบ

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนของการมอบหมาย |
| `PlanCourseTeacherId` | รหัสรายการมอบหมายครู |
| `PlanCourseId` | รายวิชาในแผนที่ครูได้รับมอบหมาย |
| `sEmp (SEmp)` | รหัสครูใน TEmployees |
| `IsActive` | bool?; TeacherRepository ต้องเป็น true |
| `cDel (CDel)` | bool; TeacherRepository ต้องเป็น false |

## หลักฐานและข้อจำกัด

[TplanCourseTeacher.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourseTeacher.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7895](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7895>); [TeacherRepository.cs:24](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:24>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
