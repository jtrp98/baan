# ตารางเดิม: TYear

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School DB — JabjaiSchoolSingleDB

**หน้าที่เดิม:** แยกรหัสปีการศึกษาที่ใช้เชื่อมข้อมูลออกจากเลขปีที่แสดงแก่ผู้ใช้

**SchoolBot ใช้อย่างไร:** SchoolBotCourseRun.NYear และ TargetSnapshot.n_year → nYear พร้อม SchoolId; TTerm.nYear ใช้เชื่อมปีของเทอม

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อ resolve ปี; ไม่สร้างปีถัดไปให้ระบบเดิม

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `SchoolID (SchoolId)` | โรงเรียนเจ้าของข้อมูลปี |
| `nYear (NYear)` | int รหัสปี เป็น PK ร่วมกับ SchoolID |
| `numberYear (NumberYear)` | int? เลขปีที่แสดง; ไม่ควรใช้แทน nYear โดยไม่ resolve |
| `YearStatus` | char? สถานะปีเดิม; ความหมายแต่ละรหัสยังไม่ยืนยันจาก source ที่อนุญาต |
| `cDel (CDel)` | bool สถานะลบปี |

## หลักฐานและข้อจำกัด

[Tyear.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tyear.cs:8>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10728](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:10728>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
