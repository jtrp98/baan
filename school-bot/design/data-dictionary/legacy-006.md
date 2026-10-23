# ตารางเดิม: TPlane

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ทะเบียนรายวิชาของโรงเรียน เช่น ชื่อและรหัสวิชา ไม่ใช่กิจกรรมหรือหลักสูตรกลาง SchoolBot

**SchoolBot ใช้อย่างไร:** SchoolBotGradeSlot.CourseId → TPlane.sPlaneID; TPlanCourse.sPlaneID เชื่อมวิชา; ตรวจ SchoolId และ resolve เทอมผ่าน TPlanCourseTerm

**ขอบเขตอ่าน/เขียน:** อ่านข้อมูลปลายทางวิชา; ไม่สร้างหรือแก้รายวิชาจาก mapping

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนเจ้าของวิชา |
| `sPlaneID (SPlaneId)` | int รหัสวิชา เป็น PK ร่วมกับ SchoolID |
| `courseCode (CourseCode)` | รหัสวิชาที่ใช้แสดง เช่น รหัสรายวิชาของโรงเรียน |
| `sPlaneName (SPlaneName)` | ชื่อรายวิชาภาษาไทย |
| `CourseNameEn` | ชื่อรายวิชาภาษาอังกฤษ |
| `nTSubLevel (NTsubLevel)` | string? ระดับชั้นที่ผูกกับวิชา; ไม่ใช่ SchoolBotLevel |
| `nTerm (NTerm)` | int? ใน entity นี้; ไม่ใช่ string key ของ TTerm.nTerm จึงห้ามนำมาแทนกันตรง ๆ |
| `cDel (CDel)` | char?; query รายวิชาที่ตรวจรับ null หรือ '0' เป็นไม่ถูกลบ |

## หลักฐานและข้อจำกัด

[Tplane.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tplane.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:8052](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:8052>); [PlanCourseRepository.cs:194](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/PlanCourseRepository.cs:194>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
