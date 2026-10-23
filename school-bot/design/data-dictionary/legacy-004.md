# ตารางเดิม: TUser

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB ตามสัญญา; Master context มี mapping ชื่อเดียวกันด้วย

**หน้าที่เดิม:** ข้อมูล profile เดิมที่ SchoolBot ใช้อ้างนักเรียน โดยต้องยืนยันชนิดและสิทธิ์ก่อนใช้

**SchoolBot ใช้อย่างไร:** SchoolBotSession.ProfileId เมื่อ ProfileKind=student; SchoolBotProject.OwnerId เมื่อ OwnerKind=student; LearnerId ใน Submission/Attempt/RetakeGrant/ScorePreviewItem ใช้ sID พร้อม SchoolId; roster ต้องประกอบ NTerm/ClassroomId

**ขอบเขตอ่าน/เขียน:** อ่าน profile และตรวจสมาชิก; ไม่แก้ทะเบียนนักเรียน

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | int รหัสโรงเรียน เป็นส่วนหนึ่งของ PK |
| `sID (SId)` | int รหัส profile เป็น PK ร่วมกับ SchoolID; ไม่ใช่ Master AccountId โดยอัตโนมัติ |
| `sName (SName)` | ชื่อสำหรับแสดง profile |
| `sLastname (SLastname)` | นามสกุลสำหรับแสดง profile |
| `cType (CType)` | char? ชนิดผู้ใช้ตามระบบเดิม; การแปลงเป็น student ต้องมีหลักฐาน directory |
| `cDel (CDel)` | char? สถานะลบ profile; ต้องใช้กฎของระบบเดิม |
| `nTermSubLevel2 (NTermSubLevel2)` | int? รหัสห้องบน profile; เพียงฟิลด์นี้ไม่พิสูจน์ roster ย้อนหลังรายเทอม |

## หลักฐานและข้อจำกัด

[Tuser.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tuser.cs:8>); [Tuser.cs:142](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tuser.cs:142>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10345](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10345>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
