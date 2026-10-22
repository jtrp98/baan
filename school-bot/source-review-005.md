# Source review 005 — writer คะแนนเดิม (score-record)

SA (codex t1) ตรวจ 2026-10-22 แบบ static read-only ใน `C:/src/schoolbright/target` ตาม [decisions-021](requirement/decisions-021.md) ไม่แก้ไฟล์ ไม่รัน SQL/build ไม่อ่าน secret · handoff: BLOCKED (ขาด source writer) · รายงานเต็ม `C:/src/AICode/baan/baan/reports/2026-10-22-07-35-43-sa-tier-t1-1agents-6X8T00`

สรุป: เว็บ score-record → gateway → gRPC `academicscorerecordservice.AssessmentService.SaveAssessmentDraft` ของ service `sb-service-academic-score-record` ซึ่ง **ไม่อยู่ใน workspace** จึงยังยืนยันการ merge ScoreData, สูตรคำนวณ, CAS (`xmin`), การตรวจสิทธิ์/ล็อก และ audit ไม่ได้ — ห้ามเปิดการเขียนคะแนนจนตรวจ source นี้

**1. ผลตรวจ writer — ข้อเท็จจริงและข้อจำกัด**

พาธย่อสำหรับหลักฐาน:

- `W` = `C:/src/schoolbright/target/sb-tech-upgrade-web-system`
- `G` = `C:/src/schoolbright/target/sb-api-gateway`
- `A` = `C:/src/schoolbright/target/sb-tech-upgrade-academic`
- `B` = `C:/src/schoolbright/target/school-bot-v2`

| ประเด็น | ข้อเท็จจริงจาก checkout |
|---|---|
| เว็บเรียกอะไร | `W/src/app/[locale]/pages/academic/score-record/_shared/_api/score-record-client.ts:12,69` ใช้ `/api/gateway/academic/score-record` และ `webSessionAuthHeaders()` |
| บันทึกคะแนน | `…/assessments/[planCourseId]/_api/assessment-api.ts:21` เรียก `PUT /assessments/{planCourseId}/draft` พร้อมบริบทปี/เทอม/ห้อง |
| รูปแบบ request จริง | `…/_hooks/use-sheet-writer.ts:107` ส่ง `cells`, `results`, `curricular`, `expectedRowVersions` ของนักเรียนที่แก้ ไม่ส่ง ScoreData ทั้งก้อนจากเว็บ |
| Gateway | `G/src/ApiGateway.API/Controllers/Academic/ScoreRecord/AssessmentsController.cs:50` รับ draft แล้วเรียก `SaveAssessmentDraftAsync`; `:43` เป็นการแก้หัวช่อง; `:58` เป็น submit |
| ไป service ใด | `G/src/ApiGateway.Infrastructure/Repositories/Services/ServiceAcademicScoreRecord/ScoreRecordGrpcRepositories.g.cs:24,41` ส่งต่อ gRPC `academicscorerecordservice.AssessmentService.SaveAssessmentDraft` |
| service แยกจาก academic | `G/src/ApiGateway.Infrastructure/Extensions/InfrastructureServiceExtensions.cs:400` ระบุ proto มาจาก `sb-service-academic-score-record`; ลงทะเบียน client `ServiceAcademicScoreRecord` แบบ optional |
| writer อยู่ที่ไหน | ไม่พบ `target/sb-service-academic-score-record` และไม่พบ implementation ของ writer จากการค้น source ที่เกี่ยวข้องใน target ไม่ได้ค้นต่อออกนอก workspace |
| SchoolBot ปัจจุบัน | `B/web/src/SchoolBot.Api/Program.cs:43` ยังใช้ `InMemoryManagementStore`; routes ที่ตรวจเป็น license/release `/v1` ไม่มี mapping/export/learning `/v2` |

เส้นทางที่ยืนยันได้:

```text
score-record UI
  → /api/gateway/academic/score-record/assessments/{planCourseId}/draft
  → gateway AssessmentsController.Draft
  → ScoreRecordAssessmentGrpcRepository
  → gRPC AssessmentService.SaveAssessmentDraft
  → implementation ของ ServiceAcademicScoreRecord: ไม่พบใน target
```

**Auth ที่พบ**

เว็บใช้:

```text
JabjaiWebKey-<NCompany>-<user_id>: <SchoolBright web-session token>
```

หลักฐาน `W/src/lib/auth-headers.ts:57,69–76` ระบุชัดว่า token นี้ไม่ใช่ JWT ที่ gateway ออกให้ จึงไม่ควรนำ token เดียวกันไปใส่ Bearer โดยเปลี่ยน header เฉย ๆ

`G/src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:43` ส่ง token ให้ `GetWebSessionPrincipal`; gateway ส่ง school/employee/admin context ต่อทาง metadata ที่ `GatewayCallMetadataInterceptor.cs:67–77`

controller ใช้ `MenuPermission(MenuKeys.ScoreRecordScores)` ที่ `AssessmentsController.cs:18` โดย access เริ่มต้นคือ View ตาม `Authorization/MenuPermission.cs:21` ส่วน handler ยอมรับ View หรือ Modify ตาม `:711–712` ดังนั้น **menu gate นี้เพียงอย่างเดียวไม่พิสูจน์สิทธิ์เขียนรายวิชา** ต้องตรวจ service ที่ยังไม่พบ

**สิ่งที่ proto ระบุ แต่ยังไม่ใช่หลักฐาน implementation**

ไฟล์หลักคือ `G/src/ApiGateway.Infrastructure/Protos/ServiceAcademicScoreRecord/Assessment.proto`

| ประเด็น | หลักฐานใน contract | สิ่งที่ยังยืนยันไม่ได้ |
|---|---|---|
| แก้รายช่อง | `:296–325` มี `student_id`, `column_id`, `score` และ expected row version | backend merge JSON รายช่องหรือ replace ทั้งก้อนอย่างไร |
| คำนวณคะแนน | `:4,29,328` ระบุ service คำนวณแล้วคืนแถว; `:174–201` มี computed totals | สูตรจริงและฟิลด์ที่ persist |
| concurrency | `:6,215,257` ระบุ row version เป็น `xmin` | CAS ถูกใช้ใน write predicate/transaction จริงหรือไม่ |
| ช่องคะแนน | `:27` บอกช่องถูกสร้างตามปีอยู่แล้ว; `:283` การแก้รับ `column_id` เดิม | วิธีสร้าง `Pgtassessment` และจัดสรร identifier |
| submit | `:31` ระบุล็อกผ่าน `SubmitPeriod="-1"` | transition และเงื่อนไขที่ enforce จริง |
| soft lock | controller `:134` ระบุ advisory; proto `:234` มีผู้ถือ/วันหมดอายุ | lock กัน write ได้จริงหรือเป็นเพียงข้อความแจ้ง |
| audit | proto `:459` มี activity log และ submit reason `:336` | เขียน `PgtgradeAuditLog` จริงหรือไม่ |

**ข้อเท็จจริงฝั่ง reader/schema**

- `A/src/ServiceAcademic.Infrastructure/Entities/PGGradeDB/PgtgradeDetail.cs:18,30,32,34,50–64` มี `GetScore100`, `GetQuiz100`, `GetMid100`, `GetFinal100` และฟิลด์รวมก่อน/หลังกลางภาคอยู่แล้ว
- `A/src/ServiceAcademic.Application/Features/GradeCalculation/Services/Implementations/GradeService.cs:114–123` อ่านค่ารวมจาก detail มาใช้ ไม่ใช่หลักฐานการคำนวณและบันทึกค่ารวมใหม่หลัง export
- `GradeService.cs:225–300` อ่าน JSON array ที่มี `ScoreIdentifier`, `Score`, `AssessmentId`; `:270` ใช้ `int.TryParse` ทำให้ค่าทศนิยมใน reader เส้นนี้เป็น null
- `GradeService.cs:317–331` แยก `scoreGrade`, `scoreMid`, `scoreCheewat`, `scoreFinal` เป็นสี่หมวดคะแนน
- `GradeService.cs:171–182` ใช้ `PgtgradeEdit.GetScore100` ทับค่าที่แสดงเมื่อมีค่า จึงห้ามถือว่าการแก้ ScoreData จะเปลี่ยนผลที่ผู้ใช้เห็นเสมอ
- `…/Constants/GradeSpecialConstants.cs:10–50` กำหนด none เป็น `"-1"` และผลพิเศษ `"1"`–`"13"` การพบ null/ค่าว่างต้องตรวจความหมายจาก writer ห้ามตีความเป็น none เอง
- `A/src/ServiceAcademic.Infrastructure/Repositories/Databases/GradeTranscriptReportRepository.cs:114–125` เรียก `getstudentgradebysid(studentId,schoolId)` เพื่ออ่านรายงาน ไม่พบนิยาม function และไม่มีหลักฐานว่าการเรียกนี้อัปเดตค่ารวม
- `…/Entities/PGGradeDB/Pgtassessment.cs:8–48` มี assessment context, identifiers, `SubmitPeriod`, `IsActive`, `CDel` แต่ไม่มี `ScoreIdentifier` เป็น property โดยตรง จึงห้ามสร้างค่าด้วยการต่อเลขเอง
- `…/Entities/PGGradeDB/PgtgradeAuditLog.cs:8–20` มี `GradeAuditLogId:long`, `MethodName`, `Parameter`, `Application`, `Logdate`, `SchoolId`, `SEmp`; การมี entity ไม่พิสูจน์ว่ามี writer ใช้งาน
- `…/Common/Databases/PGGradeDBPostgreSQLDBContext.cs:546` มี index ของ `(SchoolId,NGradeId,SId,CDel)` ที่ไม่ได้ประกาศ unique และ mapping detail ที่ `:529–585` ไม่ได้ประกาศ concurrency token ทั้งนี้ไม่ใช่หลักฐานว่า service อื่นไม่ได้ใช้ `xmin`
- `A/src/ServiceAcademic.Infrastructure/Repositories/Databases/TeacherRepository.cs:24–32` อ่านครูจาก `TplanCourseTeachers` ที่ SchoolId ตรง, ไม่ถูกลบ และ active แต่เป็น lookup ไม่ใช่หลักฐาน authorization ของ writer

**ข้อสรุปการใช้ writer เดิม**

มี API surface ที่เหมาะกับการเขียนรายช่อง แต่ยังรับรองว่า SchoolBot เรียกได้ครบสัญญาไม่ได้ เพราะ:

1. ไม่พบ implementation/deployment ของ service
2. SchoolBot session กับ web-session token เป็นคนละสัญญา
3. ยังไม่พิสูจน์การรักษา override/ผลพิเศษ การคำนวณรวม และการกันชน
4. draft contract ที่พบไม่มี operation key หรือ durable receipt สำหรับ replay ข้าม DB

ข้อเสนอ SA คือให้ public API และ orchestration อยู่ใน `school-bot-v2/web` ตามมติ และทำ grade adapter ภายในนั้น ส่วนการ reuse writer/calculator เดิมเป็น implementation choice หลังตรวจ source จริง หากจำเป็นต้องย้าย logic มา SchoolBot ต้องย้ายจาก implementation ที่พิสูจน์แล้ว พร้อม parity fixtures ห้ามสร้างสูตรขึ้นจากชื่อฟิลด์หรือ proto comments

ไม่เรียก `/submit` เป็นขั้นตอนปกติของ export เพราะ contract ระบุว่ามันล็อกช่องคะแนนทั้งใบ

**ข้อสมมติฐานที่ยังไม่ยืนยัน**

- writer ใช้ GradeCalculator ตาม comment ใน proto จริง
- writer บังคับ `xmin`, ตรวจครูรายวิชา และเขียน audit ครบจริง
- `PgtgradeAuditLog.Parameter` ใช้เก็บ durable receipt ได้โดยไม่กระทบ consumer/retention เดิม
- writer อื่นทั้งหมดตรวจ concurrency ก่อน replace ScoreData

ข้อสมมติฐานเหล่านี้เป็นเงื่อนไขก่อนเปิด write ไม่ใช่ฐานให้ engineer implement โดยเดา

## Change Log

- 2026-10-22 — MYCELIUM บันทึกผล SA ส่วนที่ 1 จาก output role
