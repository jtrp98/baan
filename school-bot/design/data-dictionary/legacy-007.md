# ตารางเดิม: TPlanCourse

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ผูกวิชาเข้ากับแผนการเรียน ใช้เป็นหน่วยกำหนดครูรายวิชาและปลายทางคะแนน

**SchoolBot ใช้อย่างไร:** SchoolBotCourseRun.PlanCourseIds[] และ SchoolBotGradeSlot.PlanCourseId → PlanCourseId พร้อม SchoolId; ตรวจเทอมผ่าน TPlanCourseTerm และห้องผ่าน PlanId

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อตรวจบริบทและสิทธิ์; ไม่เขียนแผนรายวิชา

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนของแผนรายวิชา |
| `PlanCourseId` | int รหัสรายวิชาในแผน เป็น PK ร่วมกับ SchoolID |
| `PlanId` | รหัสแผน ใช้เชื่อมกับห้องผ่าน TPlanTermSubLevel2 |
| `sPlaneID (SPlaneId)` | รหัสวิชาใน TPlane |
| `nYear (NYear)` | int? รหัสปีของแผนรายวิชา ไม่ใช่เลขปีที่แสดงโดยอัตโนมัติ |
| `CourseStatus` | int?; repository ที่ตรวจคัดค่า 1 สำหรับรายวิชาที่ใช้ |
| `IsActive` | bool?; repository ต้องเป็น true |
| `cDel (CDel)` | bool; repository ต้องเป็น false |

## หลักฐานและข้อจำกัด

[TplanCourse.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourse.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7679](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7679>); [PlanCourseRepository.cs:194](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/PlanCourseRepository.cs:194>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
