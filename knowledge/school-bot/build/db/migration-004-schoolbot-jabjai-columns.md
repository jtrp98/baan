# Migration 004 · รูปแบบคอลัมน์และผลสำรวจการใช้ schema SchoolBot

Rev 2 · 2026-11-05 · บันทึกโดย นายช่าง · พักร่างเปลี่ยนชื่อตามผู้ใช้ยืนยันให้ใช้คำของ SchoolBot เพื่อให้ระบบเป็นเอกเทศ

[ร่างเปลี่ยนชื่อ](migration-004-schoolbot-jabjai-columns.draft.sql) · [ร่างย้อนชื่อ](migration-004-schoolbot-jabjai-columns-rollback.draft.sql) · [Migration 003 สำหรับสองตารางใหม่](migration-003-lessons-missions.md)

ผลสำรวจการใช้ 32 ตารางด้านล่างยังใช้ตรวจผู้สมัครถอดได้ ส่วน mapping ไปใช้ชื่อ Jabjai และ SQL คู่กันเก็บเป็นร่างที่พักไว้

## รูปแบบที่เสนอให้ใช้ร่วมกัน

อิงชื่อคอลัมน์จาก Jabjai School Single DB และคงชื่อ `SchoolBot…` สำหรับทุกตาราง PK ใช้ชื่อเดิมของตารางเดิมและ `…Id` สำหรับตารางใหม่ ชนิดเป็น `int4` identity ฟิลด์ audit เวลาทั้งสอง migration ใช้ `timestamptz` ตามฐาน SchoolBot เพราะ `UpdateDate` ใช้สร้าง ETag และการลด precision อาจทำให้การแก้ไขที่เกิดใกล้กันได้ ETag เดียวกัน [Jabjai mapping](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs) · [ETag](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Domain/Concurrency/OpaqueConcurrencyToken.cs)

| ชื่อเดิม | ชื่อในร่าง | ขอบเขต |
|---|---|---|
| `SchoolId`, `IsDelete` | `SchoolID`, `cDel` | ทั้ง 32 ตารางตาม baseline |
| `CreateBy`, `CreateDate`, `UpdateBy`, `UpdateDate` | `CreatedBy`, `CreatedDate`, `UpdatedBy`, `UpdatedDate` | ทั้ง 32 ตารางตาม baseline |
| `ClassroomId` | `nTermSubLevel2` | `SchoolBotCourseRun` ซึ่งเทียบกับรหัสห้องนี้อยู่แล้ว |
| `LearnerId` | `sID` | `SchoolBotSubmission`, `SchoolBotAttempt`, `SchoolBotRetakeGrant`, `SchoolBotScorePreviewItem` ซึ่งเก็บรหัสนักเรียนในเส้นทางการเรียนและการประเมิน |

รวม 197 รายการเปลี่ยนชื่อใน transaction เดียว ร่างนี้เป็น `RENAME COLUMN` เท่านั้น จึงรักษาข้อมูล ชนิด nullable/default และ PK ที่มีอยู่ คงฟิลด์กลางอย่าง `OwnerId`, `ProfileId`, `AccountId` ตามความหมายจริงของแต่ละตาราง ส่วน `SchoolID` ของตารางกลางยังรับ `NULL` ตามเดิม [DDL baseline](schoolbot_db.sql) · [การตรวจสิทธิ์และรหัสห้อง](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases/SchoolAssessmentAuthority.cs)

## การใช้งานตารางเดิม

สำรวจ DDL 32 ตาราง 450 คอลัมน์ เทียบกับ `DbSet` และจุดอ่าน/เขียนใน repository ของ checkout `sb-web-school-robot` การพบทางโค้ดพิสูจน์ dependency ใน checkout นี้ ส่วนความถี่ใช้งานและผู้ใช้นอก checkout ต้องใช้ catalog และหลักฐานเพิ่ม [SchoolBotDbContext](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Common/Databases/SchoolBotDbContext.cs) · [Repositories](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases)

| ตาราง | ทางใช้งานที่พบ | สถานะร่าง |
|---|---|---|
| `SchoolBotLicense` | `LicenseRepository` อ่านและแก้ใบอนุญาต | เก็บ |
| `SchoolBotLicenseBinding` | `LicenseRepository` อ่านและเขียนการผูกเครื่อง | เก็บ |
| `SchoolBotRelease` | `ReleaseRepository` อ่าน manifest และเผยแพร่ Desktop release | เก็บ |
| `SchoolBotIdempotency` | `IdempotencyRepository` อ่านและเขียนใบตอบซ้ำ | เก็บ |
| `SchoolBotAuditEvent` | `SchoolBotUnitOfWork`, `CurriculumRepository` เขียนและอ่านประวัติ | เก็บ |
| `SchoolBotSession` | `WebSessionRepository` จัดการ session | เก็บ |
| `SchoolBotStaffRole` | พบ EF scaffold และ `DatabaseSelfCheck` ตรวจโครงสร้าง | ผู้สมัครถอด |
| `SchoolBotProject` | `ProjectRepository` อ่านและเขียนโปรเจกต์ | เก็บ |
| `SchoolBotProjectRevision` | `ProjectRepository`, `AssessmentRepository` อ่านและเขียนฉบับโปรเจกต์ | เก็บ |
| `SchoolBotLevel` | `AssessmentRepository` อ่านรายการระดับ | เก็บ |
| `SchoolBotLevelPromotionPolicy` | `AssessmentRepository` อ่านกติกาเลื่อนระดับ | เก็บ |
| `SchoolBotCurriculum` | `CurriculumRepository`, `AssessmentRepository` จัดหลักสูตรและตรวจเผยแพร่ | เก็บ |
| `SchoolBotLesson` | `CurriculumRepository`, `AssessmentRepository` จัดบทเรียนและอ่านก่อนตรวจ | เก็บ |
| `SchoolBotMission` | `CurriculumRepository`, `AssessmentRepository` จัดภารกิจและเกณฑ์ | เก็บ |
| `SchoolBotCriteria` | `CurriculumRepository`, `AssessmentRepository` จัดและอนุมัติเกณฑ์ | เก็บ |
| `SchoolBotActivity` | `CurriculumRepository` อ่านและบันทึกกิจกรรม | เก็บ |
| `SchoolBotQuestionBank` | `AssessmentRepository` อ่านและเผยแพร่คลังข้อสอบ | เก็บ |
| `SchoolBotCourseRun` | `AssessmentRepository` จัดการรอบเรียน | เก็บ |
| `SchoolBotScoringPolicy` | `AssessmentRepository` อ่านและบันทึกนโยบายคะแนน | เก็บ |
| `SchoolBotCourseRunActivity` | `AssessmentRepository` อ่านและบันทึกช่วงเวลาของกิจกรรม | เก็บ |
| `SchoolBotSubmission` | `AssessmentRepository` รับงานและอ่านงานส่ง | เก็บ |
| `SchoolBotGradingJob` | `AssessmentRepository` เข้าคิวและเปลี่ยนสถานะงานตรวจ | เก็บ |
| `SchoolBotAssessment` | `AssessmentRepository` อ่านและเขียนผลตรวจ | เก็บ |
| `SchoolBotAttempt` | `AssessmentRepository` อ่านและบันทึกรอบสอบ | เก็บ |
| `SchoolBotRetakeGrant` | `AssessmentRepository` จัดสิทธิ์สอบซ้ำ | เก็บ |
| `SchoolBotGradeSlot` | `ScoreExportRepository` อ่านและเขียนช่องคะแนน | เก็บ |
| `SchoolBotScoreMapping` | `ScoreExportRepository` อ่านและเขียนการจับคู่คะแนน | เก็บ |
| `SchoolBotScorePreview` | `ScoreExportRepository` อ่านและบันทึกตัวอย่างผลส่ง | เก็บ |
| `SchoolBotScorePreviewItem` | `ScoreExportRepository` อ่านและบันทึกรายการของนักเรียน | เก็บ |
| `SchoolBotScoreExport` | `ScoreExportRepository` ติดตามรายการส่ง | เก็บ |
| `SchoolBotScoreOutbox` | `ScoreExportRepository` เข้าคิว ประมวลผล และตรวจใบรับ | เก็บ |
| `SchoolBotLevelProposal` | `AssessmentRepository` อ่านและบันทึกข้อเสนอเลื่อนระดับ | เก็บ |

## รายการที่ต้องตรวจเพิ่มก่อนถอด

- **`SchoolBotStaffRole`** ไม่พบการอ่านหรือเขียนใน repository ของ SchoolBot หรือการอ้างชื่อตารางในโค้ดของ Gateway และเว็บ Helper ที่ตรวจ พบใน scaffold, `DatabaseSelfCheck` และเอกสาร ขณะที่เส้นทาง staff ปัจจุบันส่ง role ผ่าน assertion จึงเป็นผู้สมัครถอดหลังตรวจจำนวนแถว ผู้ใช้ฐานนอก checkout และหน้าที่เดิมที่อาจยังมีอยู่ ถ้าถอดจริงต้องปรับ scaffold กับ schema self-check ในชุดงานแยก [ตัวตรวจโครงสร้าง](../../../../target/sb-web-school-robot/backend/tools/ServiceSchoolBot.DatabaseSelfCheck/Program.cs) · [Gateway staff assertion](../../../../target/sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/SchoolBotStaffAssertionValidator.cs)
- **`SchoolBotLevel.LevelKey`** ยังไม่พบการใช้ค่าจาก property ในโค้ด runtime `ListLevelsAsync` อ่าน entity ทั้งแถวแล้วใช้ ID, code, ลำดับ และชื่อ จึงยังมี dependency ตอน EF materialize ต้องตรวจเครื่องมือ seed/import และผู้ใช้ภายนอกก่อนเปลี่ยน projection หรือถอดคอลัมน์ [จุดอ่าน Level](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases/AssessmentRepository.cs)
- **`SchoolBotRelease.SchoolBotReleaseId`** ไม่พบการเรียก property ตรง ๆ ใน repository แต่ EF ใช้เป็น PK เมื่ออ่านและบันทึก release จึงเป็นกรณีที่ค้นชื่อคอลัมน์อย่างเดียวอาจทำให้สรุปผิด [Release repository](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases/ReleaseRepository.cs)
- **`SchoolBotLesson.ImportSource`** เป็นคอลัมน์จาก Migration 002 แยกจาก baseline 450 ฟิลด์ มีเส้นทางอ่านและนำเข้าในโค้ด และบางเส้นทางยังหยุดเมื่อ scaffold ไม่มี field จึงต้องเทียบ catalog ของสภาพแวดล้อมจริงก่อนเปลี่ยน mapping [Migration 002](migration-002-lesson-import-source.md) · [Curriculum repository](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases/CurriculumRepository.cs)

## ขั้นตรวจรับก่อนนำไปใช้

1. ตรวจ catalog จริงเทียบ baseline และ migration ที่มีอยู่ ยืนยันว่าชื่อเก่าตรงและชื่อใหม่ว่าง รวมถึงตรวจผู้ใช้ schema รายอื่นก่อนตัดรายการใดออก
2. เมื่อ schema ผ่านการตรวจ ให้เตรียม EF database-first mapping ให้ตรงกับชื่อใหม่ โดยคงชื่อและรูปแบบ API ที่ผู้เรียกใช้อยู่ ตรวจเส้นทาง license, login, project, curriculum, assessment และ grade export รวมถึง ETag เดิมจากเวลาที่บันทึกไว้
3. เปลี่ยนชื่อคอลัมน์พร้อมสลับ application mapping ในช่วงที่หยุด writer ไว้ เพราะ mapping เดิมอ่านชื่อใหม่ไม่ได้ ร่างย้อนกลับเปลี่ยนชื่อกลับใน transaction เดียวก่อนสลับกลับไปใช้ mapping เดิม
4. แยกการถอดตารางหรือคอลัมน์เป็นชุดงานหลังยืนยัน dependency และข้อมูลจริง ร่าง 004 เก็บ `SchoolBotStaffRole` และ `LevelKey` ไว้ระหว่างตรวจ
