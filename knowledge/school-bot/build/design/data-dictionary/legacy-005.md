# ตารางเดิม: TEmployees

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB ตามสัญญา; Master context มี mapping ชื่อเดียวกันด้วย

**หน้าที่เดิม:** profile บุคลากรที่ใช้ระบุตัวครู ผู้ตรวจงาน และพนักงานส่วนกลาง; การมีแถวไม่ได้แปลว่ามีสิทธิ์สอนทุกวิชา

**SchoolBot ใช้อย่างไร:** SchoolBotSession.ProfileId/SchoolBotProject.OwnerId เมื่อ kind=employee, SchoolBotAssessment.AssessorId และ SchoolBotStaffRole.EmployeeId → sEmp พร้อม SchoolId; สิทธิ์วิชาต้องผ่าน TPlanCourseTeacher

**ขอบเขตอ่าน/เขียน:** อ่าน; ไม่เขียนทะเบียนบุคลากร; ไม่พบ WorkStatus ใน entity ที่ตรวจ

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | int โรงเรียนต้นสังกัด เป็นส่วนหนึ่งของ PK |
| `sEmp (SEmp)` | int รหัสบุคลากร เป็น PK ร่วมกับ SchoolID |
| `sName (SName)` | ชื่อบุคลากรที่ repository ใช้แสดงรายชื่อครู |
| `sLastname (SLastname)` | นามสกุลบุคลากร |
| `cDel (CDel)` | char?; TeacherRepository อ่านเฉพาะ null หรือ '0' |
| `cType (CType)` | string? ประเภทบุคลากรเดิม; ไม่ใช่หลักฐานสิทธิ์ครูรายวิชาของ SchoolBot |

## หลักฐานและข้อจำกัด

[Temployee.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Temployee.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:5381](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:5381>); [TeacherRepository.cs:24](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:24>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
