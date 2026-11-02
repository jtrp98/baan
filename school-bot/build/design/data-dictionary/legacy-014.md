# ตารางเดิม: TTerm

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** ทะเบียนเทอมพร้อมปี ชื่อเทอม และช่วงวันที่

**SchoolBot ใช้อย่างไร:** SchoolBotCourseRun.NTerm/NYear และ LevelProposal.Snapshot.target_n_term/target_n_year ตรวจร่วม SchoolId; ไม่มีเทอมถัดไปต้องไม่สร้าง successor โดยเดา

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อตรวจบริบทและเทอมถัดไป; ไม่เขียนทะเบียนเทอม

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนเจ้าของเทอม |
| `nTerm (NTerm)` | string รหัสเทอม เป็น PK ร่วมกับ SchoolID |
| `nYear (NYear)` | int? รหัสปีที่เทอมสังกัด |
| `numberTerm (NumberTerm)` | int? เลขลำดับเทอม แยกจาก nTerm ซึ่งเป็น key |
| `sTerm (STerm)` | string? ชื่อเทอมสำหรับแสดง |
| `dStart (DStart)` | DateTime? วันเริ่มเทอม; mapping เป็น timestamp without time zone จึงยังไม่ยืนยัน timezone ของค่าจริง |
| `dEnd (DEnd)` | DateTime? วันสิ้นเทอม; การใช้ตัด roster/เลื่อน Level ยังต้องยืนยันกฎและค่าจริง |
| `TermStatus` | char? สถานะเทอม; ไม่เดาความหมายแต่ละรหัส |
| `cDel (CDel)` | char? สถานะลบเทอม |

## หลักฐานและข้อจำกัด

[Tterm.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tterm.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:9991](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:9991>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
