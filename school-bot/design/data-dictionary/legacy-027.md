# ตารางเดิม: compass_level_subject_stat

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** สถิติ Compass แยกตามระดับและวิชา ไม่ใช่ค่าเฉลี่ยห้องรายเทอมของ SchoolBot

**SchoolBot ใช้อย่างไร:** ไม่มี SchoolBot field ที่ยืนยันให้เชื่อมโดยตรง; ไม่ใช้แทน LevelProposal.Snapshot.average เพราะไม่มี key ห้อง/เทอม

**ขอบเขตอ่าน/เขียน:** หลักฐานยังไม่พอสำหรับ use case SchoolBot; ไม่เขียนหรือรวมสูตรเข้ากับ LevelProposal

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `level_code (LevelCode)` | รหัสระดับ Compass เป็นส่วนหนึ่งของ PK |
| `subject (Subject)` | วิชาของสถิติ เป็นส่วนหนึ่งของ PK |
| `mean_score (MeanScore)` | double คะแนนเฉลี่ยของสถิติเดิม; สูตรและประชากรยังไม่พิสูจน์ |
| `student_count (StudentCount)` | จำนวนผู้เรียนในสถิติ หน่วยเป็นคน |
| `school_count (SchoolCount)` | จำนวนโรงเรียนในสถิติ หน่วยเป็นโรงเรียน |
| `updated_at (UpdatedAt)` | เวลาปรับสถิติ |

## หลักฐานและข้อจำกัด

[CompassLevelSubjectStat.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/CompassLevelSubjectStat.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:129](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:129>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
