# ตารางเดิม: PGTGrade

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** PGGradeDB

**หน้าที่เดิม:** หัวใบคะแนนของวิชา/เทอม/ห้อง พร้อมคะแนนเต็ม สัดส่วน และสถานะการปิดเกรด

**SchoolBot ใช้อย่างไร:** SchoolBotGradeSlot.NGradeId → nGradeId; ตรวจ SchoolId/NTerm/CourseId/ClassroomId และ PlanId ที่ resolve ผ่าน TPlanCourse; TargetSnapshot เก็บ fingerprint/token ของหัว

**ขอบเขตอ่าน/เขียน:** อ่านเพื่อ resolve target และตรวจล็อก; สัญญา export ไม่เรียก submit/close-grade หรือเปลี่ยนหัวใบคะแนนโดยปริยาย

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `nGradeId (NGradeId)` | int PK ของหัวใบคะแนน |
| `SchoolID (SchoolId)` | โรงเรียนของหัวใบคะแนน |
| `nTerm (NTerm)` | string เทอมของใบคะแนน |
| `sPlaneID (SPlaneId)` | int? รหัสวิชาปลายทาง |
| `nTermSubLevel2 (NTermSubLevel2)` | int? ห้อง; GradeService ถือ null เป็นกรณีเทียบโอนในเส้นทางที่อ่าน |
| `PlanId` | int? รหัสแผน ไม่ใช่ PlanCourseId |
| `fRatioQuiz (FRatioQuiz)` | double สัดส่วนคะแนนเก็บเดิม; สูตรและหน่วยที่ writer ใช้ยังไม่พิสูจน์ |
| `fRatioMidTerm (FRatioMidTerm)` | double สัดส่วนกลางภาคเดิม; ไม่ใช้เดาสูตรใหม่ |
| `fRatioLateTerm (FRatioLateTerm)` | double สัดส่วนปลายภาคเดิม |
| `fRatioBeforeMidTerm (FRatioBeforeMidTerm)` | double? สัดส่วนคะแนนเก็บก่อนกลางภาค |
| `fRatioAfterMidTerm (FRatioAfterMidTerm)` | double? สัดส่วนคะแนนเก็บหลังกลางภาค |
| `maxMidTerm (MaxMidTerm)` | string? คะแนนเต็มหมวดกลางภาค ต้อง parse ตามระบบเดิม |
| `maxFinalTerm (MaxFinalTerm)` | string? คะแนนเต็มหมวดปลายภาค |
| `maxBeforeMidTerm (MaxBeforeMidTerm)` | string? คะแนนเต็มเก็บก่อนกลางภาค |
| `maxAfterMidTerm (MaxAfterMidTerm)` | string? คะแนนเต็มเก็บหลังกลางภาค |
| `GradeCloseGrade` | string? สถานะปิดเกรด; ยังไม่มีหลักฐาน writer ยืนยัน transition/รหัสครบ |
| `GradeCloseBehaviorReadWrite` | string? สถานะปิดส่วนพฤติกรรม/อ่านเขียน; ไม่เหมารวมเป็น lock ของทุกช่อง |
| `GradeCloseSamattana` | string? สถานะปิดส่วนสมรรถนะ |
| `optionMid (OptionMid)` | string? ตัวเลือกกลางภาคที่อาจมีผลกับการแก้ไข; ความหมายรหัสยังไม่ยืนยัน |
| `optionFinal (OptionFinal)` | string? ตัวเลือกปลายภาค; ความหมายรหัสยังไม่ยืนยัน |
| `cDel (CDel)` | bool สถานะลบหัวใบคะแนน |

## หลักฐานและข้อจำกัด

[Pgtgrade.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/Pgtgrade.cs:8>); [PGGradeDBPostgreSQLDBContext.cs:373](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:373>); [GradeService.cs:137](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:137>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
