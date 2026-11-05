# Source review 005 — writer คะแนนเดิม (score-record)

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

รายงานนี้อ่านเว็บ score-record, HTTP API Gateway และ Academic reader เพื่อหา writer คะแนนเดิม พบเส้นทาง gRPC แต่ไม่พบ implementation ของ service จึงยังพิสูจน์การ merge คะแนน การกันชน และ audit ไม่ได้

ตรวจ 2026-10-22 แบบ static read-only ใน หลักฐาน E02 ตาม [มติ 021 (การส่งคะแนนเข้าระบบเกรด SchoolBright)](../../shared/decisions/decisions-021.md) ไม่แก้ไฟล์ ไม่รัน SQL/build ไม่อ่าน secret

สรุป: เว็บ score-record → gateway → gRPC `academicscorerecordservice.AssessmentService.SaveAssessmentDraft` ของ service `sb-service-academic-score-record` ซึ่ง **ไม่อยู่ใน workspace** จึงยังยืนยันการ merge ScoreData, สูตรคำนวณ, Compare-and-swap (CAS) ด้วย `xmin`, การตรวจสิทธิ์/ล็อก และ audit ไม่ได้ — ห้ามเปิดการเขียนคะแนนจนตรวจ source นี้

## เส้นทาง writer และข้อจำกัด


| ประเด็น | ข้อเท็จจริงจาก checkout |
|---|---|
| เว็บเรียกอะไร | หลักฐาน E03 ใช้ `/api/gateway/academic/score-record` และ `webSessionAuthHeaders()` |
| บันทึกคะแนน | หลักฐาน E04 เรียก `PUT /assessments/{planCourseId}/draft` พร้อมบริบทปี/เทอม/ห้อง |
| รูปแบบ request จริง | หลักฐาน E05 ส่ง `cells`, `results`, `curricular`, `expectedRowVersions` ของนักเรียนที่แก้ ไม่ส่ง ScoreData ทั้งก้อนจากเว็บ |
| Gateway | หลักฐาน E06 รับ draft แล้วเรียก `SaveAssessmentDraftAsync`; หลักฐาน E07 เป็นการแก้หัวช่อง; หลักฐาน E08 เป็น submit |
| ไป service ใด | หลักฐาน E09 ส่งต่อ gRPC `academicscorerecordservice.AssessmentService.SaveAssessmentDraft` |
| service แยกจาก academic | หลักฐาน E10 ระบุ proto มาจาก `sb-service-academic-score-record`; ลงทะเบียน client `ServiceAcademicScoreRecord` แบบ optional |
| writer อยู่ที่ไหน | ไม่พบ หลักฐาน E11 และไม่พบ implementation ของ writer จากการค้น source ที่เกี่ยวข้องใน target ไม่ได้ค้นต่อออกนอก workspace |
| SchoolBot ปัจจุบัน | หลักฐาน E12 ยังใช้ `InMemoryManagementStore`; routes ที่ตรวจเป็น license/release `/v1` ไม่มี mapping/export/learning `/v2` |

เส้นทางที่ยืนยันได้:

```text
score-record UI
  → /api/gateway/academic/score-record/assessments/{planCourseId}/draft
  → gateway AssessmentsController.Draft
  → ScoreRecordAssessmentGrpcRepository
  → gRPC AssessmentService.SaveAssessmentDraft
  → implementation ของ ServiceAcademicScoreRecord: ไม่พบใน target
```

## Authentication ที่พบ

เว็บใช้:

```text
JabjaiWebKey-<NCompany>-<user_id>: <SchoolBright web-session token>
```

หลักฐาน E13 ระบุชัดว่า token นี้ไม่ใช่ JWT ที่ gateway ออกให้ จึงไม่ควรนำ token เดียวกันไปใส่ Bearer โดยเปลี่ยน header เฉย ๆ

หลักฐาน E14 ส่ง token ให้ `GetWebSessionPrincipal`; gateway ส่ง school/employee/admin context ต่อทาง metadata ที่ หลักฐาน E15

controller ใช้ `MenuPermission(MenuKeys.ScoreRecordScores)` ที่ หลักฐาน E16 โดย access เริ่มต้นคือ View ตาม หลักฐาน E17 ส่วน handler ยอมรับ View หรือ Modify ตาม หลักฐาน E18 ดังนั้น **menu gate นี้เพียงอย่างเดียวไม่พิสูจน์สิทธิ์เขียนรายวิชา** ต้องตรวจ service ที่ยังไม่พบ

## ขอบเขตที่ proto ระบุ

ไฟล์หลักคือ หลักฐาน E19

| ประเด็น | หลักฐานใน contract | สิ่งที่ยังยืนยันไม่ได้ |
|---|---|---|
| แก้รายช่อง | หลักฐาน E20 มี `student_id`, `column_id`, `score` และ expected row version | backend merge JSON รายช่องหรือ replace ทั้งก้อนอย่างไร |
| คำนวณคะแนน | หลักฐาน E21 ระบุ service คำนวณแล้วคืนแถว; หลักฐาน E22 มี computed totals | สูตรจริงและฟิลด์ที่ persist |
| concurrency | หลักฐาน E23 ระบุ row version เป็น `xmin` | CAS ถูกใช้ใน write predicate/transaction จริงหรือไม่ |
| ช่องคะแนน | หลักฐาน E24 บอกช่องถูกสร้างตามปีอยู่แล้ว; หลักฐาน E25 การแก้รับ `column_id` เดิม | วิธีสร้าง `Pgtassessment` และจัดสรร identifier |
| submit | หลักฐาน E26 ระบุล็อกผ่าน `SubmitPeriod="-1"` | transition และเงื่อนไขที่ enforce จริง |
| soft lock | controller หลักฐาน E27 ระบุ advisory; proto หลักฐาน E28 มีผู้ถือ/วันหมดอายุ | lock กัน write ได้จริงหรือเป็นเพียงข้อความแจ้ง |
| audit | proto หลักฐาน E29 มี activity log และ submit reason หลักฐาน E30 | เขียน `PgtgradeAuditLog` จริงหรือไม่ |

## Reader และ schema

รายละเอียดอยู่ใน [ผลอ่าน reader/schema คะแนนเดิม](source-review-005-reader.md) ครอบค่ารวม ScoreData ผลพิเศษ audit indexes และ lookup ครู

## ข้อสรุปการใช้ writer เดิม

มี API surface ที่เหมาะกับการเขียนรายช่อง แต่ยังรับรองว่า SchoolBot เรียกได้ครบสัญญาไม่ได้ เพราะ:

1. ไม่พบ implementation/deployment ของ service
2. SchoolBot session กับ web-session token เป็นคนละสัญญา
3. ยังไม่พิสูจน์การรักษา ค่าที่ใช้ทับคะแนนเดิม/ผลพิเศษ การคำนวณรวม และการกันชน
4. draft contract ที่พบไม่มี operation key หรือ durable receipt สำหรับ replay ข้าม DB

ข้อเสนอจากผลอ่านคือให้ public API และ orchestration อยู่ใน `school-bot-v2/web` ตามมติ และทำ grade adapter ภายในนั้น ส่วนการ reuse writer/calculator เดิมเป็น implementation choice หลังตรวจ source จริง หากจำเป็นต้องย้าย logic มา SchoolBot ต้องย้ายจาก implementation ที่พิสูจน์แล้ว พร้อม parity fixtures ห้ามสร้างสูตรขึ้นจากชื่อฟิลด์หรือ proto comments

ไม่เรียก `/submit` เป็นขั้นตอนปกติของ export เพราะ contract ระบุว่ามันล็อกช่องคะแนนทั้งใบ

## ยังไม่ยืนยัน

- writer ใช้ GradeCalculator ตาม comment ใน proto จริง
- writer บังคับ `xmin`, ตรวจครูรายวิชา และเขียน audit ครบจริง
- `PgtgradeAuditLog.Parameter` ใช้เก็บ durable receipt ได้โดยไม่กระทบ consumer/retention เดิม
- writer อื่นทั้งหมดตรวจ concurrency ก่อน replace ScoreData

ข้อสมมติฐานเหล่านี้เป็นเงื่อนไขก่อนเปิด write ไม่ใช่ฐานให้ engineer implement โดยเดา

## หลักฐาน

ตำแหน่งอ้างอิง E แต่ละรายการอยู่ใน [หลักฐานของเอกสารนี้](source-review-005-evidence.md)
