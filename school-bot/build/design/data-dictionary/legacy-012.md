# ตารางเดิม: TClassMember

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ข้อมูลครูประจำห้องและผู้ช่วยตามห้อง/เทอม ไม่ใช่รายชื่อนักเรียนในห้อง

**SchoolBot ใช้อย่างไร:** เทียบ SchoolBotCourseRun.ClassroomId/NTerm/SchoolId ได้เชิงบริบท แต่ไม่มี SchoolBot field ที่ใช้ตารางนี้ให้สิทธิ์ตรวจหรือส่งคะแนนอัตโนมัติ

**ขอบเขตอ่าน/เขียน:** หลักฐานยังไม่พอสำหรับ use case โดยตรง; DES-008 ไม่ให้สิทธิ์ส่งคะแนนเพิ่มจากการเป็นครูประจำห้อง

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนของรายการ |
| `nClassMemberid (NClassMemberid)` | รหัสรายการจัดครูประจำห้อง |
| `nTeacherHeadid (NTeacherHeadid)` | int? รหัสครูหัวหน้าห้องตามโครงสร้างเดิม; กฎสิทธิ์ SchoolBot ไม่ได้ตามมาจากฟิลด์นี้ |
| `nTeacherAssistOne (NTeacherAssistOne)` | int? รหัสผู้ช่วยคนที่หนึ่ง |
| `nTeacherAssistTwo (NTeacherAssistTwo)` | int? รหัสผู้ช่วยคนที่สอง |
| `nTermSubLevel2 (NTermSubLevel2)` | int? ห้องที่ได้รับมอบหมาย |
| `nTerm (NTerm)` | string? เทอมของการมอบหมาย |
| `cDel (CDel)` | bool สถานะลบรายการ |

## หลักฐานและข้อจำกัด

[TclassMember.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/TclassMember.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:4503](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:4503>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
