# Source review 004 — ระบบเกรด SchoolBright (PGGradeDB)

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

รายงานนี้อ่าน schema และ reader เกรด SchoolBright ใน Academic พบช่องคะแนนใน ScoreData และความเสี่ยงจาก ค่าที่ใช้ทับคะแนนเดิม/ผลพิเศษ แต่ไม่พบ writer ที่ยืนยันการคำนวณ การล็อก และ audit ได้ ผลนี้จึงยังไม่เพียงพอให้เปิด export

ตรวจ 2026-10-22 แบบ static read-only ใน หลักฐาน E12 ตาม [มติ 020 (มติหลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../requirement/decisions-020.md) และ [OQ-012 (ปลายทางคะแนนใน SchoolBright)](../open-questions/oq-012.md) ไม่แก้ไฟล์ ไม่รัน SQL/build ไม่อ่าน secret ผลยืนยันโค้ดใน checkout เท่านั้น ไม่ยืนยัน schema/trigger/พฤติกรรม production


พาธอ้างจาก academic root

## ข้อเท็จจริง as-built

- หัวเกรด `Pgtgrade` ตามหลักฐาน E13 (NGradeId, SchoolId, NTerm, SPlaneId, NTermSubLevel2, PlanId) · ผลรายนักเรียน `PgtgradeDetail` ตามหลักฐาน E14 (NGradeId, SId, SchoolId)
- 4 หมวดตาม identifier ใน `ScoreData`: `scoreGrade` = คะแนนเก็บก่อนกลางภาค, `scoreCheewat` = คะแนนเก็บหลังกลางภาค, `scoreMid` = กลางภาค, `scoreFinal` = ปลายภาค — ยืนยันจาก หลักฐาน E15; มีฟิลด์รวม/คะแนนเต็ม/สัดส่วนแยกหมวดใน Pgtgrade/PgtgradeDetail แต่ยังไม่พบสูตรน้ำหนักที่ใช้จริง (หลักฐาน E02)
- คะแนนย่อย: `Pgtassessment` = หัวข้อคะแนนต่อโรงเรียน/ปี/เทอม/ชั้น/ห้อง/วิชา (หลักฐาน E03); คะแนนนักเรียนอยู่ใน `PgtgradeDetail.ScoreData` เป็น JSON array (`ScoreIdentifier`, `Score`, `AssessmentId`) (หลักฐาน E04); reader ใช้ `int.TryParse` คะแนนทศนิยมอ่านเป็น null (หลักฐาน E05); ไม่พบกฎจำนวนช่องสูงสุดหรือการสร้าง identifier
- `Pgtassessment` เป็น “ช่องคะแนน” ไม่ใช่ตารางตัวชี้วัดมาตรฐาน หมวดหลังกลางภาคใช้ชื่อ `scoreCheewat` (คะแนนตัวชี้วัด)
- ปลายทางวิชา/ห้อง/เทอม: `Tplane` (รายวิชา) → `TplanCourse` → `TplanCourseTerm` / `TplanTermSubLevel2`; ครูรายวิชา `TplanCourseTeacher`; ครูประจำห้อง `TclassMember`; นักเรียน `TstudentClassroomHistory`, `TplanCourseStudent`, `TplanCourseSection*` — join จริงที่ หลักฐาน E16
- ล็อก/สถานะ: มี GradeClose*/Option* เป็น string ไม่พบ writer ยืนยัน transition; `PgtgradeSetting.IsLocked` เป็นล็อกการตั้งค่า (หลักฐาน E06)
- ความเสี่ยง: `PgtgradeEdit.GetScore100` ค่าที่ใช้ทับคะแนนเดิม คะแนนเดิมเมื่อมีค่า (หลักฐาน E07) — ส่งคะแนนใหม่อาจไม่เปลี่ยนผลที่แสดง; รหัสผลพิเศษ (รอผล/ขาดสอบ ฯลฯ) ห้ามแปลงเป็นศูนย์ (หลักฐาน E08); index `(SchoolId,NGradeId,SId,CDel)` ไม่ unique และไม่มี concurrency token (หลักฐาน E09)
- API: repo นี้ **ไม่มี API บันทึกคะแนน** — มีแต่ read/report (หลักฐาน E10); ไม่พบ authentication ใน API (หลักฐาน E11) ยังไม่ตรวจ gateway
- Compass: `CompassStudentLevelScore` PK (SchoolId,SId) ไม่มี Level/เทอม/วิชา; `CompassLevelSubjectStat` PK (LevelCode,Subject) ไม่มีห้อง/เทอม; ไม่พบโค้ดคำนวณ — ใช้แนวคิดค่าเฉลี่ยได้ แต่ไม่ควรเขียนทับหรือถือว่า LevelCode = Level ของ SchoolBot

## ทางเลือกที่เสนอจากผลอ่าน ณ 2026-10-22

| ทาง | รูปแบบ | ข้อดี | ความเสี่ยง |
|---|---|---|---|
| A | หัวข้อย่อยเฉพาะ SchoolBot ต่อกิจกรรม/หน่วย ในคะแนนเก็บ | ตรวจย้อนกลับง่าย ไม่แตะหัวข้อครู · รองรับแมพคาบ→หลาย Pgtassessment ตามคำชี้แจงผู้ใช้ | ช่องเยอะ ยังไม่รู้เพดานจำนวนช่อง; เขียน JSON ทั้งก้อนอาจทับหัวข้ออื่น |
| B | คะแนนรวมหนึ่งช่องต่อหมวด/ช่วง | ง่ายที่สุด ส่งซ้ำง่าย (มุมมอง ผู้ตรวจ: ซับซ้อนต่ำสุด) | รายละเอียดอยู่ใน SchoolBot เท่านั้น ต้องตกลงสูตรรวม/ปัดเศษ |
| C | Quiz/ภารกิจ → เก็บ, Test → กลาง/ปลายภาค | ตรงแนวคิดตั้งต้นของผู้ใช้ | เสี่ยงนับซ้ำหรือแทนคะแนนสอบครู |

ปัดตก: SchoolBot เขียน PGGradeDB ตรง หรือแทน `GetScore100` — ยังไม่ครอบคลุมล็อก/ค่าที่ใช้ทับคะแนนเดิม/คำนวณใหม่/audit

ทุกทางต้องมี: preview เดิม→ใหม่ก่อนครูยืนยัน, แก้เฉพาะช่องที่ SchoolBot ดูแล, ส่งซ้ำไม่บวกซ้ำ, ตรวจว่าครูไม่ได้แก้หลัง preview (ชนแล้วหยุด), ตรวจสิทธิ์ครูรายวิชา/ล็อกฝั่ง server, writer ที่ทำการคำนวณและ audit ครบ

## ข้อที่ผลอ่านเดิมยังตอบไม่ได้

เลือก A/B/C · เจ้าของ writer เดิมและการอนุมัติช่องทางเขียน · กติกาเมื่อคะแนนชน/เกรดล็อก · เกณฑ์และช่วงเวลาเลื่อน Level


## ยังไม่ยืนยัน

ยังไม่ยืนยันว่าโรงเรียนใช้ช่องคะแนนแทนตัวชี้วัด ต้องให้เจ้าของระบบเกรดยืนยันการใช้งานจริง

## หลักฐาน

- E01 — รายงานเต็มเดิม: `C:\src\AICode\baan\baan\reports\2026-10-22-07-18-30-sa-tier-t1-1agents-3h2Tl5`
- E02 — `Pgtgrade.cs:24`, `PgtgradeDetail.cs:50`
- E03 — `Pgtassessment.cs:8`
- E04 — `GradeService.cs:225`
- E05 — `GradeService.cs:270`
- E06 — `Pgtgrade.cs:62`
- E07 — `GradeService.cs:167`
- E08 — `GradeSpecialConstants.cs:10`
- E09 — `PGGradeDBPostgreSQLDBContext.cs:529`
- E10 — `GradeTranscript.proto:9`, `SchoolGradeSummary.proto:7`, `GradeService.cs:54`, `LegacyReportRepository.cs:19`
- E11 — `src/ServiceAcademic.API/Program.cs:62`
- E12 — `target/sb-tech-upgrade-academic`
- E13 — `src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/Pgtgrade.cs:8`
- E14 — `PgtgradeDetail.cs:8`
- E15 — `src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:317`
- E16 — `src/ServiceAcademic.Infrastructure/Repositories/Databases/PlanCourseRepository.cs:194`
