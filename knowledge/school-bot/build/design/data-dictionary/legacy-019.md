# ตารางเดิม: TPlanCourseSectionAllowedRoom

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ระบุห้องที่ section อนุญาต ไม่ใช่หลักฐานว่านักเรียนทุกคนในห้องลงทะเบียนแล้ว

**SchoolBot ใช้อย่างไร:** CourseRun.ClassroomId เทียบ nTermSubLevel2 พร้อม SchoolId; รายวิชา/เทอมอ่านผ่าน section ไม่ใช้ตารางนี้สร้าง roster โดยตรง

**ขอบเขตอ่าน/เขียน:** อ่านประกอบการตรวจห้อง; หลักฐานกฎ enrollment ยังไม่พอ

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `PlanCourseAllowedRoomId` | int PK ของรายการห้องที่อนุญาต |
| `SchoolID (SchoolId)` | โรงเรียนของรายการ |
| `PlanCourseSectionId` | section ที่กำหนดห้องรับเข้า |
| `nTermSubLevel2 (NTermSubLevel2)` | รหัสห้องที่ section อนุญาต |
| `cDel (CDel)` | bool? สถานะลบรายการ |

## หลักฐานและข้อจำกัด

[TplanCourseSectionAllowedRoom.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TplanCourseSectionAllowedRoom.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7786](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7786>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
