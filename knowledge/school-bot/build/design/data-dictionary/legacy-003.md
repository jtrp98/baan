# ตารางเดิม: masterdb_schema.TCompany

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** School context และ Master context; deployment/การวางข้อมูลจริงยังไม่ยืนยัน

**หน้าที่เดิม:** ข้อมูลโรงเรียนและสถานะสำหรับตรวจ tenant ก่อนให้ใช้งาน

**SchoolBot ใช้อย่างไร:** SchoolBotSession.SchoolId และ SchoolId ของข้อมูล tenant เทียบ nCompany; SchoolBotLicense.SchoolName เป็นข้อความประกอบ ไม่ใช่ key

**ขอบเขตอ่าน/เขียน:** อ่านสถานะโรงเรียน; ไม่เขียนทะเบียนโรงเรียน และไม่รับรอง physical FK จาก keyless mapping

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `nCompany (NCompany)` | int รหัสโรงเรียนที่ใช้เทียบ SchoolId; EF กำหนด entity นี้เป็น keyless |
| `sCompany (SCompany)` | ชื่อโรงเรียนจากทะเบียนเดิม |
| `isActive (IsActive)` | bool? สถานะใช้งาน; DES-012 ต้องการโรงเรียน active แต่ความหมาย null ต้องไม่เดาเป็นอนุญาต |
| `cDel (CDel)` | bool? สถานะลบโรงเรียน; ไม่ใช่ char แบบ TUser |

## หลักฐานและข้อจำกัด

[Tcompany.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tcompany.cs:8>); [Tcompany.cs:152](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiSchoolSingleDB/Tcompany.cs:152>); [JabjaiSchoolSingleDBPostgreSQLDBContext.cs:4572](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:4572>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
