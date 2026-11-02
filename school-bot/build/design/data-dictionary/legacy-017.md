# ตารางเดิม: TPlanCourseSection

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** กลุ่มเรียนย่อยของรายวิชาในเทอม ซึ่งอาจมีการลงทะเบียนแยกจากห้องประจำ

**SchoolBot ใช้อย่างไร:** เชื่อมบริบท CourseRun.PlanCourseIds[]/NTerm/SchoolId ผ่าน section และ enrollment; ไม่มี SchoolBot SectionId โดยตรง

**ขอบเขตอ่าน/เขียน:** อ่านเป็นข้อมูลประกอบสมาชิกวิชา; กฎเลือกใช้กับ roster SchoolBot ยังไม่ยืนยันครบ

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `PlanCourseSectionId` | int PK ของ section |
| `SchoolID (SchoolId)` | โรงเรียนของ section |
| `PlanCourseId` | รายวิชาในแผนของ section |
| `nTerm (NTerm)` | string เทอมของ section |
| `SectionNumber` | string? เลขหรือชื่อกลุ่มเรียนที่แสดง |
| `sEmp (SEmp)` | รหัสบุคลากรที่ section ระบุ; ไม่ให้สิทธิ์ SchoolBot แทนกฎ TPlanCourseTeacher โดยอัตโนมัติ |
| `IsLocked` | bool? สถานะล็อก section; ไม่ใช่หลักฐานล็อกคะแนนใน PGGradeDB |
| `IsActive` | bool? สถานะใช้งาน section |
| `cDel (CDel)` | bool? สถานะลบ section |

## หลักฐานและข้อจำกัด

[TplanCourseSection.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourseSection.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7761](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7761>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
