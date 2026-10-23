# ตารางเดิม: PGTGradeDetail

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** ผลคะแนนรายนักเรียนในหัวใบคะแนน รวม JSON คะแนนรายช่องและค่ารวมที่ระบบเดิมเก็บไว้

**SchoolBot ใช้อย่างไร:** SchoolBotScorePreviewItem.Snapshot.cells[].grade_detail_id → nGradeDetailId; LearnerId → sID; GradeSlot.NGradeId → nGradeId พร้อม SchoolId; ช่องย่อยจับคู่ GradeSlot.AssessmentId/ScoreIdentifier ภายใน ScoreData

**ขอบเขตอ่าน/เขียน:** อ่าน; เขียนแบบมีเงื่อนไขตาม DES-009 หลังผ่าน gates ครบ โดยแก้เฉพาะช่องที่ถือครองและคำนวณ derived fields ด้วยสูตรที่พิสูจน์แล้ว; งานนี้ไม่มีการเขียน

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `nGradeDetailId (NGradeDetailId)` | int PK ของแถวคะแนนรายนักเรียน |
| `nGradeId (NGradeId)` | หัวใบคะแนน PGTGrade ของแถวนี้ |
| `SchoolID (SchoolId)` | โรงเรียนของคะแนน |
| `sID (SId)` | รหัสนักเรียน ไม่ใช่ Master AccountId |
| `ScoreData` | string? ที่ reader deserialize เป็น JSON array; รายการมี ScoreIdentifier, Score, AssessmentId ซึ่งเป็น JSON keys ไม่ใช่ physical columns แยก |
| `getScore100 (GetScore100)` | string? คะแนนรวมที่ reader นำมาใช้; ห้ามแทนด้วยผลรวม SchoolBot โดยตรง |
| `getGradeLabel (GetGradeLabel)` | string? ผลเกรดที่ระบบเดิมเก็บ |
| `getSpecial (GetSpecial)` | string? รหัสผลพิเศษ; ไม่แปลงเป็น 0 หรือ clear อัตโนมัติ |
| `scoreMidTerm (ScoreMidTerm)` | string? คะแนนกลางภาคที่เก็บไว้ |
| `scoreFinalTerm (ScoreFinalTerm)` | string? คะแนนปลายภาคที่เก็บไว้ |
| `ScoreBeforeMidTerm` | string? คะแนนเก็บก่อนกลางภาค; physical name ใช้ตัว S ใหญ่ตาม mapping ที่ตรวจ |
| `ScoreAfterMidTerm` | string? คะแนนเก็บหลังกลางภาค |
| `scoreBeforeAfterMidTerm (ScoreBeforeAfterMidTerm)` | string? ค่ารวมก่อน/หลังกลางภาค; สูตร persist ยังไม่พิสูจน์ |
| `getQuiz100 (GetQuiz100)` | string? ค่ารวมหมวดคะแนนเก็บที่ reader อ่าน; ไม่ใช่ SchoolBot Quiz โดยอัตโนมัติ |
| `getMid100 (GetMid100)` | string? ค่ารวมหมวดกลางภาคที่ reader อ่าน |
| `getFinal100 (GetFinal100)` | string? ค่ารวมหมวดปลายภาคที่ reader อ่าน |
| `getBeforeQuiz100 (GetBeforeQuiz100)` | string? ค่ารวมคะแนนเก็บก่อนกลางภาคตามระบบเดิม |
| `getAfterQuiz100 (GetAfterQuiz100)` | string? ค่ารวมคะแนนเก็บหลังกลางภาคตามระบบเดิม |
| `cDel (CDel)` | bool สถานะลบแถวคะแนน |
| `xmin (PostgreSQL system column; ไม่มี CLR property ใน mapping ที่ตรวจ)` | DES-009 กำหนดใช้เป็น CAS ระยะสั้นคู่ before_document_hash; ยังไม่ใช่หลักฐานว่า writer เดิมใช้จริง |

## หลักฐานและข้อจำกัด

[PgtgradeDetail.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/PgtgradeDetail.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:529](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:529>); [GradeService.cs:114](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:114>); [GradeService.cs:225](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:225>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
