# PII Inventory 001 — ตารางจำแนกข้อมูลส่วนบุคคลรายคอลัมน์ ใน 32 ตาราง SchoolBot

วันที่: 2026-10-24
บทบาท: vault — ทำจาก DDL ร่าง db/schoolbot_db.sql (Rev5 DRAFT) + ความหมายฟิลด์จาก design/data-model.md Rev7
ขอบเขต: เฉพาะคอลัมน์ที่เป็น PII/identifier ของบุคคล — คอลัมน์อื่นไม่ลิสต์ · ปิดท้ายด้วย flag ส่งต่อ jpo
ตอบ finding: [SEC001-010](../security.md) (data inventory/retention/masking ของข้อมูลผู้เยาว์ — owner DBA-002/005 ตาม routing ของ security.md)

## 1. สรุปก่อนรายละเอียด

- **ไม่มี direct identifier** (ชื่อ-นามสกุล/เลขบัตร/อีเมล/เบอร์โทร) ใน 32 ตาราง — ตัวตนจริงของบุคคลอยู่ใน legacy DB (Master/School) ตาม data-model.md
- ตัวตนบุคคลใน SchoolBot DB เป็น **pseudonymous identifier** (integer ชี้ sId/sEmp/AccountId ใน legacy) และ **quasi-identifier** (สตริง principal/actor ของระบบ auth)
- ตารางที่เก็บข้อมูลเด็ก: **ตรง 6 ตาราง + ทางอ้อม 3 ตาราง** (รายการ §4) — นักเรียน=เด็ก เป็นข้อสันนิษฐานเชิงประชากรของระบบโรงเรียน (สมมติฐาน — ยังไม่ยืนยัน)

## 2. คอลัมน์ร่วมทุก 32 ตาราง (PII เชิง pseudonymous)

| คอลัมน์ | ชนิด | ประเภท | หมายเหตุ |
|---|---|---|---|
| CreateBy | integer NULL | pseudonymous identifier | sEmp (พนักงาน/ครู) หรือ sId (นักเรียน=เด็ก) ของผู้ทำ; NULL=ระบบ (หัวไฟล์ SQL บรรทัด 14) |
| UpdateBy | integer NULL | pseudonymous identifier | เช่นเดียวกัน |

## 3. รายตาราง — เฉพาะคอลัมน์ที่เป็น PII/identifier ของบุคคล

| ตาราง | คอลัมน์ | ชนิด | ประเภทข้อมูล | หมายเหตุ |
|---|---|---|---|---|
| SchoolBotIdempotency | Principal | varchar(512) | quasi-identifier | สตริงตัวตนผู้เรียก operation |
| SchoolBotIdempotency | ResultCipher | bytea | secret (ciphertext ของ response) | response ของ create-license มี license key — อ่อนไหวตาม SEC001-009; ไม่ใช่ PII บุคคลแต่เป็น secret |
| SchoolBotAuditEvent | Actor | varchar(512) | quasi-identifier | ตัวตนผู้กระทำทุก audit event |
| SchoolBotAuditEvent | Reason | varchar(1000) | free-text อาจซ้อน PII | ห้ามกรอกชื่อบุคคล (คุมที่ application) |
| SchoolBotSession | AccountId | integer | pseudonymous identifier | บัญชี legacy (Master DB) |
| SchoolBotSession | TokenHash | varchar(64) | credential-derived | hash ของ session token ของบุคคล — ห้าม log |
| SchoolBotSession | ProfileKind + ProfileId | varchar(16) + integer | pseudonymous identifier — **เด็ก** เมื่อ 'student' | คู่นี้ระบุตัวนักเรียน/พนักงาน |
| SchoolBotSession | LegacyAdminId | varchar(64) | quasi-identifier | แอดมิน legacy |
| SchoolBotStaffRole | EmployeeId | integer | pseudonymous identifier (พนักงาน) | = sEmp ใน School DB |
| SchoolBotStaffRole | Reason | varchar(1000) | free-text อาจซ้อน PII | |
| SchoolBotProject | OwnerKind + OwnerId | varchar(16) + integer | pseudonymous identifier — **เด็ก** เมื่อ 'student' | |
| SchoolBotProject | Name | varchar(200) | free-text อาจซ้อน PII | ชื่อโปรเจกต์ ผู้ใช้ตั้งเอง |
| SchoolBotProjectRevision | Content | jsonb | ผลงานผู้เรียน — **เด็ก** (ทาง Project) | อาจฝัง metadata ผู้สร้างใน JSON |
| SchoolBotCriteria | ApprovedBy | varchar(512) | quasi-identifier (พนักงาน) | ผู้อนุมัติเกณฑ์ตรวจ |
| SchoolBotSubmission | LearnerId | integer | pseudonymous identifier — **เด็ก** | |
| SchoolBotSubmission | Evidence | jsonb | หลักฐานผลงาน — **เด็ก** | อาจอ้างไฟล์/ภาพ/ชื่อ ขึ้นกับ serializer |
| SchoolBotAssessment | AssessorId | integer | pseudonymous identifier (ครู) | NULL เมื่อ Method='automatic' |
| SchoolBotAssessment | Feedback | varchar(4000) | free-text — บริบท**เด็ก** | ความเห็นผู้ตรวจต่อผลงานผู้เรียน |
| SchoolBotAttempt | LearnerId | integer | pseudonymous identifier — **เด็ก** | |
| SchoolBotAttempt | Snapshot | jsonb | **เด็ก** | บริบทการทำข้อสอบรายบุคคล |
| SchoolBotAttempt | Answers | jsonb | **เด็ก** | คำตอบรายบุคคล |
| SchoolBotRetakeGrant | LearnerId | integer | pseudonymous identifier — **เด็ก** | |
| SchoolBotRetakeGrant | Reason | varchar(1000) | free-text อาจซ้อน PII | |
| SchoolBotScorePreview | Principal | varchar(512) | quasi-identifier | ครู/ผู้สร้าง preview |
| SchoolBotScorePreviewItem | LearnerId | integer | pseudonymous identifier — **เด็ก** | |
| SchoolBotScorePreviewItem | Snapshot | jsonb | **เด็ก** | สรุปคะแนนรายบุคคล อาจมีชื่อ/รหัสนักเรียน/เลขที่ ขึ้นกับ serializer |
| SchoolBotScoreExport | ConfirmedBy | varchar(512) | quasi-identifier | ครูผู้ยืนยันส่งคะแนน |
| SchoolBotScoreOutbox | ScorePreviewItemId | integer | pseudonymous — **เด็ก** ทางอ้อม | 1 แถว = คะแนนนักเรียน 1 คนใน PGGradeDB |
| SchoolBotLevelProposal | DecisionBy | varchar(512) | quasi-identifier | ผู้ตัดสินเลื่อน Level |
| SchoolBotLevelProposal | Reason | varchar(1000) | free-text อาจซ้อน PII | |

ตารางที่ไม่มีคอลัมน์ PII เฉพาะตัว (นอกจาก CreateBy/UpdateBy ร่วม): SchoolBotLicense, SchoolBotLicenseBinding, SchoolBotRelease, SchoolBotLevel, SchoolBotLevelPromotionPolicy, SchoolBotCurriculum, SchoolBotLesson, SchoolBotMission, SchoolBotActivity, SchoolBotQuestionBank, SchoolBotCourseRun, SchoolBotScoringPolicy, SchoolBotCourseRunActivity, SchoolBotGradingJob, SchoolBotGradeSlot, SchoolBotScoreMapping

ไม่ใช่ PII บุคคล (ระบุกันเข้าใจผิด — ไม่นับใน inventory): `SchoolId`/`SchoolName` (องค์กร), `License.KeyHash/KeyHint/AllowedNextJkt` (credential องค์กร), `DeviceJkt`/`PublicJwk` (อุปกรณ์), `NonceHash/RequestHash/RequestKey/ContentHash/SnapshotHash/PayloadHash/ArtifactHash` (ค่า crypto), `LeaseOwner` (worker instance), `GraderVersion`

## 4. ตารางที่เก็บข้อมูลเด็ก

| แบบ | ตาราง | จุดข้อมูล |
|---|---|---|
| ตรง | SchoolBotSession | ProfileKind='student' + ProfileId |
| ตรง | SchoolBotProject | OwnerKind='student' + OwnerId |
| ตรง | SchoolBotSubmission | LearnerId, Evidence |
| ตรง | SchoolBotAttempt | LearnerId, Snapshot, Answers |
| ตรง | SchoolBotRetakeGrant | LearnerId |
| ตรง | SchoolBotScorePreviewItem | LearnerId, Snapshot |
| ทางอ้อม | SchoolBotProjectRevision | Content — ผ่าน Project.Owner |
| ทางอ้อม | SchoolBotAssessment | Feedback/ผลตรวจ — ผ่าน Submission.LearnerId |
| ทางอ้อม | SchoolBotScoreOutbox | คะแนนรายคน — ผ่าน ScorePreviewItem.LearnerId |

## 5. Flag ส่งต่อ jpo

- F1 ไม่มี direct identifier ใน SchoolBot DB — ตัวตนจริงอยู่ legacy DB; การประเมิน PDPA ต้องครอบทั้งสองฝั่ง
- F2 pseudonymous IDs ทุกตัว (LearnerId/EmployeeId/ProfileId/AccountId/AssessorId/CreateBy/UpdateBy) re-identify ได้เมื่อ join กับ legacy DB ร่วมกับ SchoolId → ให้ถือเป็น PII ในทางปฏิบัติ
- F3 ข้อมูลเด็ก 9 ตาราง (§4) — พิจารณาข้อกำหนดผู้เยาว์ของ PDPA (ความยินยอมผู้ปกครอง/มาตรการเพิ่ม) — เป็นประเด็นให้ jpo ตัดสิน ไม่ใช่คำตัดสินของ vault
- F4 free-text 6 คอลัมน์ + jsonb serializer (AuditEvent.Reason, StaffRole.Reason, Project.Name, Assessment.Feedback, RetakeGrant.Reason, LevelProposal.Reason) เสี่ยงซ้อน PII โดยไม่ตั้งใจ — ต้องมีแนวทางการเขียน/ตรวจฝั่ง application
- F5 TokenHash (credential-derived ของบุคคล) และ ResultCipher (secret) — คุม log/backup/ETag ตาม SEC001-009 MUST-4/5
- F6 โครงสร้างภายใน jsonb (Evidence, Snapshot, Answers, ScorePreviewItem.Snapshot, ProjectRevision.Content, TargetSnapshot, Context, LevelProposal.Snapshot) ไม่ถูกบังคับที่ DDL — PII ฝังใน JSON ต้องคุมที่ serializer/DTO
- F7 retention: ปัจจุบันมีกลไกหมดอายุเฉพาะ Idempotency.ReplayUntil และ ScorePreview.ExpiresAt — Attempt.Answers/Evidence/ScorePreviewItem.Snapshot ของเด็กไม่มีนโยบายเก็บ/ลบใน schema — jpo กำหนดนโยบาย retention

## Change Log

- 2026-10-24 — สร้างครั้งแรก (ใบงาน060c): inventory รายคอลัมน์จาก DDL จริง + flag ส่งต่อ jpo — รันโดย นายช่าง solo (subagent role vault); นายช่างยืนยันพาธ SEC001-010 = security.md:188 แล้ว
