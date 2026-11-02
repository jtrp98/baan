# Source review 005 — reader และ schema คะแนนเดิม

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [ผลอ่าน writer คะแนนเดิม](source-review-005.md) บันทึกผลอ่าน Academic reader/schema ณ 2026-10-22 พบว่ามีค่ารวมและ ค่าที่ใช้ทับคะแนนเดิม อยู่แล้ว แต่การมี field หรือ entity ไม่พิสูจน์การเขียน การคำนวณใหม่ หรือ concurrency ของ writer

## ข้อเท็จจริงฝั่ง reader/schema

- หลักฐาน E01 มี `GetScore100`, `GetQuiz100`, `GetMid100`, `GetFinal100` และฟิลด์รวมก่อน/หลังกลางภาคอยู่แล้ว
- หลักฐาน E02 อ่านค่ารวมจาก detail มาใช้ ไม่ใช่หลักฐานการคำนวณและบันทึกค่ารวมใหม่หลัง export
- หลักฐาน E03 อ่าน JSON array ที่มี `ScoreIdentifier`, `Score`, `AssessmentId`; หลักฐาน E04 ใช้ `int.TryParse` ทำให้ค่าทศนิยมใน reader เส้นนี้เป็น null
- หลักฐาน E05 แยก `scoreGrade`, `scoreMid`, `scoreCheewat`, `scoreFinal` เป็นสี่หมวดคะแนน
- หลักฐาน E06 ใช้ `PgtgradeEdit.GetScore100` ทับค่าที่แสดงเมื่อมีค่า จึงห้ามถือว่าการแก้ ScoreData จะเปลี่ยนผลที่ผู้ใช้เห็นเสมอ
- หลักฐาน E07 กำหนด none เป็น `"-1"` และผลพิเศษ `"1"`–`"13"` การพบ null/ค่าว่างต้องตรวจความหมายจาก writer ห้ามตีความเป็น none เอง
- หลักฐาน E08 เรียก `getstudentgradebysid(studentId,schoolId)` เพื่ออ่านรายงาน ไม่พบนิยาม function และไม่มีหลักฐานว่าการเรียกนี้อัปเดตค่ารวม
- หลักฐาน E09 มี assessment context, identifiers, `SubmitPeriod`, `IsActive`, `CDel` แต่ไม่มี `ScoreIdentifier` เป็น property โดยตรง จึงห้ามสร้างค่าด้วยการต่อเลขเอง
- หลักฐาน E10 มี `GradeAuditLogId:long`, `MethodName`, `Parameter`, `Application`, `Logdate`, `SchoolId`, `SEmp`; การมี entity ไม่พิสูจน์ว่ามี writer ใช้งาน
- หลักฐาน E11 มี index ของ `(SchoolId,NGradeId,SId,CDel)` ที่ไม่ได้ประกาศ unique และ mapping detail ที่ หลักฐาน E12 ไม่ได้ประกาศ concurrency token ทั้งนี้ไม่ใช่หลักฐานว่า service อื่นไม่ได้ใช้ `xmin`
- หลักฐาน E13 อ่านครูจาก `TplanCourseTeachers` ที่ SchoolId ตรง, ไม่ถูกลบ และ active แต่เป็น lookup ไม่ใช่หลักฐาน authorization ของ writer

## หลักฐาน

- E01 — `C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/PgtgradeDetail.cs:18,30,32,34,50–64`
- E02 — `C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:114–123`
- E03 — `GradeService.cs:225–300`
- E04 — `:270`
- E05 — `GradeService.cs:317–331`
- E06 — `GradeService.cs:171–182`
- E07 — `…/Constants/GradeSpecialConstants.cs:10–50`
- E08 — `C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/GradeTranscriptReportRepository.cs:114–125`
- E09 — `…/Entities/PGGradeDB/Pgtassessment.cs:8–48`
- E10 — `…/Entities/PGGradeDB/PgtgradeAuditLog.cs:8–20`
- E11 — `…/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:546`
- E12 — `:529–585`
- E13 — `C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:24–32`
