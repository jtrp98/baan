# ตารางเดิม: TPlanCourseSectionEnrollment

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** รายการนักเรียนลงทะเบียนใน section

**SchoolBot ใช้อย่างไร:** LearnerId → sID พร้อม SchoolId; ผ่าน TPlanCourseSection เพื่อเทียบ CourseRun.PlanCourseIds[]/NTerm

**ขอบเขตอ่าน/เขียน:** อ่านเป็นข้อมูลประกอบ roster; ยังไม่ยืนยันกฎรวมกับ TPlanCourseStudent และประวัติห้อง

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `PlanCourseEnrollmentId` | int PK ของการลงทะเบียน |
| `SchoolID (SchoolId)` | โรงเรียนของการลงทะเบียน |
| `sID (SId)` | นักเรียนผู้ลงทะเบียน |
| `PlanCourseSectionId` | section ที่ลงเรียน |
| `EnrollStatus` | string? สถานะลงทะเบียน; ค่าใดนับเป็นสมาชิกต้องตรวจ logic ที่เกี่ยวข้องเพิ่มเติม ไม่เดา |
| `ApprovedByEmp` | int? ผู้อนุมัติรายการตามชื่อฟิลด์; ยังไม่พิสูจน์ workflow อนุมัติจาก entity อย่างเดียว |
| `cDel (CDel)` | bool? สถานะลบรายการ |

## หลักฐานและข้อจำกัด

[TplanCourseSectionEnrollment.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourseSectionEnrollment.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7803](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7803>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
