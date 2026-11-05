# ตารางเดิม: compass_student_level_score

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** ผลระดับและค่าเฉลี่ยรายนักเรียนของระบบ Compass เดิม ไม่ใช่ข้อมูล Level ของ SchoolBot

**SchoolBot ใช้อย่างไร:** ไม่มี mapping ที่ยืนยันกับ SchoolBotLevelProposal หรือ SchoolBotLevel; แม้เทียบโรงเรียน/นักเรียนได้ ตารางนี้ไม่มีบริบทเทอม/วิชาเพียงพอให้ใช้แทน CourseRun

**ขอบเขตอ่าน/เขียน:** หลักฐานยังไม่พอสำหรับ use case SchoolBot; DES-011 ระบุไม่เขียนตารางนี้

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `school_id (SchoolId)` | โรงเรียน เป็นส่วนหนึ่งของ PK |
| `s_id (SId)` | นักเรียน เป็นส่วนหนึ่งของ PK |
| `level_code (LevelCode)` | รหัสระดับ Compass; ไม่มีหลักฐานว่าใช้ชุดเดียวกับ SchoolBotLevel.Code |
| `overall_avg (OverallAvg)` | double ค่าเฉลี่ยเดิม; สูตรและหน่วยยังไม่พิสูจน์ |
| `updated_at (UpdatedAt)` | เวลาปรับข้อมูล Compass |

## หลักฐานและข้อจำกัด

[CompassStudentLevelScore.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/CompassStudentLevelScore.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:160](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:160>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
