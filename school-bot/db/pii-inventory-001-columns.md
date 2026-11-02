# PII รายคอลัมน์ของ 32 ตาราง SchoolBot

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](pii-inventory-001.md)

## 3. รายตาราง — เฉพาะคอลัมน์ที่เป็น PII/identifier ของบุคคล

| ตาราง | คอลัมน์ | ชนิด | ประเภทข้อมูล | หมายเหตุ |
|---|---|---|---|---|
| SchoolBotIdempotency | Principal | varchar(512) | quasi-identifier | สตริงตัวตนผู้เรียก operation |
| SchoolBotIdempotency | ResultCipher | bytea | secret (ciphertext ของ response) | เก็บ response เข้ารหัสของ **ทุก operation** ที่ใช้ idempotency ไม่ใช่เฉพาะ create-license (ที่มี license key ตาม SEC001-009) — ต้องพิจารณาเนื้อหาตาม operation จริง |
| SchoolBotAuditEvent | Actor | varchar(512) | quasi-identifier | ตัวตนผู้กระทำทุก audit event |
| SchoolBotAuditEvent | Reason | varchar(1000) | free-text อาจซ้อน PII | ห้ามกรอกชื่อบุคคล (คุมที่ application) |
| SchoolBotSession | AccountId | integer NULL | pseudonymous identifier | บัญชี legacy (Master DB) — เป็น NULL ได้ตาม DDL (SQL:219) |
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
| SchoolBotLevelProposal | Snapshot | jsonb | **เด็ก** | `LevelSnapshot.roster[]` มี `learner_id`+`total` รายคน + average/threshold ผูกผู้เรียนทั้งห้อง (contract-003:49; แก้เลขบรรทัดตาม check 060f) |
| SchoolBotScorePreview | Context | jsonb | **เด็ก** | `PreviewContext.roster:I[]` คือรายชื่อนักเรียนรายห้อง (contract-003:46) |
| SchoolBotLevelPromotionPolicy | Reason | varchar(1000) NOT NULL | free-text อาจซ้อน PII | (SQL:379 — ตกจากฉบับแรก) |
| SchoolBotGradeSlot | OwnershipReason | varchar(1000) NOT NULL | free-text อาจซ้อน PII | (SQL:889 — ตกจากฉบับแรก) |
| SchoolBotSubmission | Evidence (jsonb ช่อง `note`) | jsonb | free-text — บริบท**เด็ก** | `ArmEvidence.note:T4000` คือหมายเหตุผู้ส่งงาน (contract-003) |
| SchoolBotAssessment | Outcome | varchar(16) NOT NULL | ผลประเมินผูกผู้เรียน — บริบท**เด็ก** | คอลัมน์จริงตาม SQL:747 |
| SchoolBotAssessment | EarnedScore / MaxScore | numeric(18,6) NULL | คะแนนรายบุคคล — บริบท**เด็ก** | SQL:748–749 |
| SchoolBotAssessment | RuleResults | jsonb NOT NULL | ผล rule การประเมินผูกผู้เรียน | SQL:750 |

ตารางที่ไม่มีคอลัมน์ PII เฉพาะตัว (นอกจาก CreateBy/UpdateBy ร่วม): SchoolBotLicense, SchoolBotLicenseBinding, SchoolBotRelease, SchoolBotLevel, SchoolBotCurriculum, SchoolBotLesson, SchoolBotMission, SchoolBotActivity, SchoolBotQuestionBank, SchoolBotCourseRun, SchoolBotScoringPolicy, SchoolBotCourseRunActivity, SchoolBotGradingJob, SchoolBotScoreMapping

การจำแนก device/crypto identifiers มีข้อความเดิมขัดกัน ต้องให้ jpo และเจ้าของข้อมูลตัดสินตามรายการที่ยังไม่ยืนยันท้ายไฟล์
