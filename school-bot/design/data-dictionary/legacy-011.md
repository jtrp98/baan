# ตารางเดิม: TTermSubLevel2

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ทะเบียนห้องเรียนที่ใช้เชื่อมแผน นักเรียน และ CourseRun

**SchoolBot ใช้อย่างไร:** SchoolBotCourseRun.ClassroomId และ TargetSnapshot.classroom_id → nTermSubLevel2 พร้อม SchoolId; ตรวจปี/เทอมจาก run และข้อมูลเทอม/แผน

**ขอบเขตอ่าน/เขียน:** อ่านบริบทห้อง; การเลื่อน SchoolBot Level ไม่แก้ห้องนี้

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนเจ้าของห้อง |
| `nTermSubLevel2 (NTermSubLevel2)` | int รหัสห้อง เป็น PK ร่วมกับ SchoolID |
| `nTSubLevel (NTsubLevel)` | int รหัสระดับชั้นของห้อง ไม่ใช่ SchoolBotLevel |
| `nTSubLevel2 (NTsubLevel2)` | string? ข้อความระบุห้องย่อย; ไม่ใช่รหัส PK nTermSubLevel2 |
| `nTerm (NTerm)` | string? เทอมที่มีใน record; null ไม่ยืนยันว่าห้องใช้ได้กับทุกเทอม |
| `nWorkingStatus (NWorkingStatus)` | int?; PlanCourseRepository คัดค่า 1 |
| `cDel (CDel)` | bool; query ที่ตรวจต้องไม่ถูกลบ |

## หลักฐานและข้อจำกัด

[TtermSubLevel2.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TtermSubLevel2.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10076](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10076>); [PlanCourseRepository.cs:200](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/PlanCourseRepository.cs:200>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
