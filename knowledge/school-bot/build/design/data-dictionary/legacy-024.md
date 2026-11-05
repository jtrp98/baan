# ตารางเดิม: PGTGradeSetting

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** เก็บการตั้งค่าระบบเกรดตามโรงเรียน ปี และระดับชั้น รวมการล็อกการตั้งค่า

**SchoolBot ใช้อย่างไร:** ใช้บริบท CourseRun.SchoolId/NYear และระดับชั้นที่ resolve จากห้อง; TargetSnapshot.settings_hash ตรึงการตั้งค่าที่เกี่ยวข้อง ไม่มี FK โดยตรงจาก GradeSlot

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อตรวจ target/settings; ไม่แก้การตั้งค่าหรือปลดล็อก

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `GradeSettingId` | int PK ของชุดตั้งค่า |
| `SchoolID (SchoolId)` | โรงเรียนเจ้าของการตั้งค่า |
| `NYear (Nyear)` | int รหัสปี; CLR สะกด Nyear แต่ physical เป็น NYear |
| `NumberYear` | string เลขปีที่แสดง แยกจากรหัส NYear |
| `ClassLevelId` | int รหัสระดับชั้นที่ใช้ชุดตั้งค่า; ไม่ใช่ SchoolBotLevel |
| `GradeTemplateId` | int รหัส template เกรดเดิม |
| `TemplateGrades` | string ข้อมูลเกณฑ์เกรด; รูปแบบและสูตรใช้งานจริงยังไม่ได้พิสูจน์ในขอบเขตนี้ |
| `SettingMode` | string โหมดการตั้งค่า; mapping มีค่าเริ่ม Separate แต่ยังไม่ยืนยันความหมายทุกค่า |
| `IsLocked` | bool ล็อกการตั้งค่า ไม่ควรใช้แทนข้อสรุปว่าคะแนนทุกช่องถูกล็อก |
| `cDel (CDel)` | bool สถานะลบชุดตั้งค่า |

## หลักฐานและข้อจำกัด

[PgtgradeSetting.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/PgtgradeSetting.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:888](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:888>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
