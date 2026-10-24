# PII Inventory 001 — ตารางจำแนกข้อมูลส่วนบุคคลรายคอลัมน์ ใน 32 ตาราง SchoolBot

วันที่: 2026-10-24
บทบาท: vault — ทำจาก DDL ร่าง db/schoolbot_db.sql (Rev5 DRAFT) + ความหมายฟิลด์จาก design/data-model.md Rev7
ขอบเขต: เฉพาะคอลัมน์ที่เป็น PII/identifier ของบุคคล — คอลัมน์อื่นไม่ลิสต์ · ปิดท้ายด้วย flag ส่งต่อ jpo
ตอบ finding: [SEC001-010](../security.md) (data inventory/retention/masking ของข้อมูลผู้เยาว์ — owner DBA-002/005 ตาม routing ของ security.md)

## 1. สรุปก่อนรายละเอียด

- **ไม่มีคอลัมน์เฉพาะสำหรับ direct identifier** (ชื่อ-นามสกุล/เลขบัตร/อีเมล/เบอร์โทร) ใน 32 ตาราง — แต่ free-text (Reason/Feedback/Name/note) และ jsonb ยังบรรจุข้อมูลเหล่านี้ได้ (แก้ไขตาม jpo 060f: สรุปเดิม "ไม่มี direct identifier" เกินหลักฐาน); ตัวตนจริงของบุคคลอยู่ใน legacy DB (Master/School) ตาม data-model.md
- ตัวตนบุคคลใน SchoolBot DB เป็น **pseudonymous identifier** (integer ชี้ sId/sEmp/AccountId ใน legacy) และ **quasi-identifier** (สตริง principal/actor ของระบบ auth)
- ตารางที่เก็บข้อมูลเด็ก: **ตรง 8 ตาราง + ทางอ้อม 5 ตาราง = อย่างน้อย 13 ตาราง** (รายการ §4 — เพิ่มจากเดิมตาม jpo 060f: ScorePreview.Context.roster, LevelProposal.Snapshot.roster, GradingJob, ScoreExport ทางอ้อม) — นักเรียน=เด็ก เป็นข้อสันนิษฐานเชิงประชากร (สมมติฐาน — ยังไม่ยืนยัน; การเป็นนักเรียนไม่ได้พิสูจน์อายุ)

## 2. คอลัมน์ร่วมทุก 32 ตาราง (PII เชิง pseudonymous)

| คอลัมน์ | ชนิด | ประเภท | หมายเหตุ |
|---|---|---|---|
| CreateBy | integer NULL | pseudonymous identifier | sEmp (พนักงาน/ครู) หรือ sId (นักเรียน=เด็ก) ของผู้ทำ; NULL=ระบบ (หัวไฟล์ SQL บรรทัด 14) |
| UpdateBy | integer NULL | pseudonymous identifier | เช่นเดียวกัน |

## 3. รายตาราง — เฉพาะคอลัมน์ที่เป็น PII/identifier ของบุคคล

| ตาราง | คอลัมน์ | ชนิด | ประเภทข้อมูล | หมายเหตุ |
|---|---|---|---|---|
| SchoolBotIdempotency | Principal | varchar(512) | quasi-identifier | สตริงตัวตนผู้เรียก operation |
| SchoolBotIdempotency | ResultCipher | bytea | secret (ciphertext ของ response) | เก็บ response เข้ารหัสของ **ทุก operation** ที่ใช้ idempotency ไม่ใช่เฉพาะ create-license (ที่มี license key ตาม SEC001-009) — ต้องพิจารณาเนื้อหาตาม operation จริง (แก้ตาม jpo 060f) |
| SchoolBotAuditEvent | Actor | varchar(512) | quasi-identifier | ตัวตนผู้กระทำทุก audit event |
| SchoolBotAuditEvent | Reason | varchar(1000) | free-text อาจซ้อน PII | ห้ามกรอกชื่อบุคคล (คุมที่ application) |
| SchoolBotSession | AccountId | integer NULL | pseudonymous identifier | บัญชี legacy (Master DB) — เป็น NULL ได้ตาม DDL (SQL:219); แก้ตาม jpo 060f (เดิมระบุเสมือนบังคับมีค่า) |
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
| SchoolBotLevelProposal | Snapshot | jsonb | **เด็ก** | `LevelSnapshot.roster[]` มี `learner_id`+`total` รายคน + average/threshold ผูกผู้เรียนทั้งห้อง (contract-003:49 — เพิ่มตาม jpo 060f; แก้เลขบรรทัดตาม check 060f) |
| SchoolBotScorePreview | Context | jsonb | **เด็ก** (ทางอ้อม→ตรง) | `PreviewContext.roster:I[]` คือรายชื่อนักเรียนรายห้อง (contract-003:46 — เพิ่มตาม jpo 060f) |
| SchoolBotLevelPromotionPolicy | Reason | varchar(1000) NOT NULL | free-text อาจซ้อน PII | (SQL:379 — ตกจากฉบับแรก เพิ่มตาม jpo 060f) |
| SchoolBotGradeSlot | OwnershipReason | varchar(1000) NOT NULL | free-text อาจซ้อน PII | (SQL:889 — ตกจากฉบับแรก เพิ่มตาม jpo 060f) |
| SchoolBotSubmission | Evidence (jsonb ช่อง `note`) | jsonb | free-text — บริบท**เด็ก** | `ArmEvidence.note:T4000` คือหมายเหตุผู้ส่งงาน (contract-003 — เพิ่มตาม jpo 060f) |
| SchoolBotAssessment | Outcome | varchar(16) NOT NULL | ผลประเมินผูกผู้เรียน — บริบท**เด็ก** | คอลัมน์จริงตาม SQL:747 (แยกจาก RuleResults ตาม check 060f) |
| SchoolBotAssessment | EarnedScore / MaxScore | numeric(18,6) NULL | คะแนนรายบุคคล — บริบท**เด็ก** | SQL:748–749 |
| SchoolBotAssessment | RuleResults | jsonb NOT NULL | ผล rule การประเมินผูกผู้เรียน | SQL:750 (เดิมรวมเป็น "ผ่าน jsonb" ผิดแหล่ง — แก้ตาม check 060f) |

ตารางที่ไม่มีคอลัมน์ PII เฉพาะตัว (นอกจาก CreateBy/UpdateBy ร่วม): SchoolBotLicense, SchoolBotLicenseBinding, SchoolBotRelease, SchoolBotLevel, SchoolBotCurriculum, SchoolBotLesson, SchoolBotMission, SchoolBotActivity, SchoolBotQuestionBank, SchoolBotCourseRun, SchoolBotScoringPolicy, SchoolBotCourseRunActivity, SchoolBotGradingJob, SchoolBotGradeSlot, SchoolBotScoreMapping (แก้ตาม check 060f: ถอน SchoolBotLevelPromotionPolicy และ SchoolBotGradeSlot ออกจากรายการนี้เพราะมี Reason/OwnershipReason เป็น free-text ที่จำแนกไว้ §3 แล้ว)

ไม่ใช่ PII บุคคล (ระบุกันเข้าใจผิด — ไม่นับใน inventory): `SchoolId`/`SchoolName` (องค์กร), `License.KeyHash/KeyHint/AllowedNextJkt` (credential องค์กร), `DeviceJkt`/`PublicJwk` (อุปกรณ์), `NonceHash/RequestHash/RequestKey/ContentHash/SnapshotHash/PayloadHash/ArtifactHash` (ค่า crypto), `LeaseOwner` (worker instance), `GraderVersion`

## 4. ตารางที่เก็บข้อมูลเด็ก

| แบบ | ตาราง | จุดข้อมูล |
|---|---|---|
| ตรง | SchoolBotSession | ProfileKind='student' + ProfileId |
| ตรง | SchoolBotProject | OwnerKind='student' + OwnerId |
| ตรง | SchoolBotSubmission | LearnerId, Evidence (รวม note) |
| ตรง | SchoolBotAttempt | LearnerId, Snapshot, Answers |
| ตรง | SchoolBotRetakeGrant | LearnerId |
| ตรง | SchoolBotScorePreviewItem | LearnerId, Snapshot |
| ตรง | SchoolBotScorePreview | Context.roster (PreviewContext.roster:I[]) — เพิ่มตาม jpo 060f |
| ตรง | SchoolBotLevelProposal | Snapshot.roster[].learner_id/total — เพิ่มตาม jpo 060f |
| ทางอ้อม | SchoolBotProjectRevision | Content — ผ่าน Project.Owner |
| ทางอ้อม | SchoolBotAssessment | Feedback/ผลตรวจ (รวม RuleResults/Outcome/คะแนน) — ผ่าน Submission.LearnerId |
| ทางอ้อม | SchoolBotScoreOutbox | คะแนนรายคน — ผ่าน ScorePreviewItem.LearnerId |
| ทางอ้อม | SchoolBotGradingJob | SubmissionId (SQL:715) — ผ่าน Submission.LearnerId เพิ่มตาม jpo 060f |
| ทางอ้อม | SchoolBotScoreExport | ScorePreviewId (SQL:1001) — ผ่าน ScorePreviewItem.LearnerId เพิ่มตาม jpo 060f |

รวมอย่างน้อย **13 ตาราง** ตามนิยามตรง/อ้อม (ยังไม่นับ AuditEvent/Idempotency ที่ขึ้นกับ operation ว่าใส่อะไร)

## 5. Flag ส่งต่อ jpo

- F1 ไม่มีคอลัมน์เฉพาะสำหรับ direct identifier ใน SchoolBot DB — แต่ free-text/jsonb ยังบรรจุได้; ตัวตนจริงอยู่ legacy DB; การประเมิน PDPA ต้องครอบทั้งสองฝั่ง
- F2 pseudonymous IDs ทุกตัว re-identify ได้เมื่อ join กับ legacy DB ร่วมกับ SchoolId → ให้ถือเป็น PII ในทางปฏิบัติ · การยกเว้น "ไม่ใช่ PII" ของ device/crypto identifiers ไม่ถูกเสมอไป: `Session.DeviceJkt` อยู่ร่วมแถวกับ Account/Profile จึงเชื่อมถึงบุคคลโดยตรง ส่วน hash/request/resource identifiers ต้องจำแนกตามสิ่งที่เชื่อมถึงได้ (แก้ตาม jpo 060f)
- F3 ข้อมูลเด็กอย่างน้อย 13 ตาราง (§4) — พิจารณาข้อกำหนดผู้เยาว์ของ PDPA (มาตรา 20/24 เรื่องความยินยอม/ผู้ใช้อำนาจปกครอง) — ประเด็นให้ jpo และเจ้าของข้อมูลตัดสิน; การเป็นนักเรียนไม่ได้พิสูจน์อายุ และไม่บังคับ consent ทุกกิจกรรมโดยอัตโนมัติ — ต้องผูกฐานประมวลผลกับวัตถุประสงค์ก่อน
- F4 free-text 8 คอลัมน์ + jsonb serializer (AuditEvent.Reason, StaffRole.Reason, Project.Name, Assessment.Feedback, RetakeGrant.Reason, LevelProposal.Reason, LevelPromotionPolicy.Reason, GradeSlot.OwnershipReason, Evidence.note) เสี่ยงซ้อน PII โดยไม่ตั้งใจ — ต้องมีแนวทางการเขียน/ตรวจฝั่ง application (เพิ่ม 3 รายการตาม jpo 060f)
- F5 TokenHash (credential-derived ของบุคคล) และ ResultCipher (secret ของทุก operation) — คุม log/backup/ETag ตาม SEC001-009 MUST-4/5
- F6 โครงสร้างภายใน jsonb ไม่ถูกบังคับที่ DDL — PII ฝังใน JSON ต้องคุมที่ serializer/DTO · รายการที่ต้องลงเพิ่ม: PreviewContext(Context), LevelSnapshot(LevelProposal.Snapshot), ArmEvidence.note, Assessment.RuleResults (jsonb) และคอลัมน์ผลประเมิน Outcome/EarnedScore/MaxScore (แยกชนิดจริงตาม SQL:747–750 แล้วใน §3 — คะแนน/สถานะผูกผู้เรียน ไม่จำกัดเฉพาะคอลัมน์ระบุตัวตน)
- F7 retention: กลไกหมดอายุที่มี = Idempotency.ReplayUntil, ScorePreview.ExpiresAt และ Session.ExpiresAt (SQL:226 — เพิ่มตาม jpo 060f) — **expiry ไม่ใช่หลักฐานว่าลบข้อมูลแล้ว** และ IsDelete ไม่ใช่การทำลายข้อมูล; Attempt.Answers/Evidence/ScorePreviewItem.Snapshot ของเด็กไม่มีนโยบายเก็บ/ลบ — เจ้าของข้อมูล/กฎหมายต้องรับรองระยะเก็บ/จุดเริ่มนับ/วิธีลบ/ข้อยกเว้น/backup ตามมาตรา 23/37 (jpo เสนอและตรวจ ไม่กำหนดแทน)
- F8 สรุป jpo 060f: inventory นี้รับเป็นหลักฐานตั้งต้นได้ แต่ SEC001-010 ยังปิดไม่ได้ — ต้องเติมขอบเขต legacy/local files/logs พร้อมนโยบาย masking/encryption/access และเส้นทางลบ/ส่งออกข้อมูลรายคน

## Change Log

- 2026-10-24 — สร้างครั้งแรก (ใบงาน060c): inventory รายคอลัมน์จาก DDL จริง + flag ส่งต่อ jpo — รันโดย นายช่าง solo (subagent role vault); นายช่างยืนยันพาธ SEC001-010 = security.md:188 แล้ว
- 2026-10-24 — แก้ตามผลตรวจ jpo ใบงาน060f (สวมบท vault โดยนายช่าง solo ตรง): สรุป direct identifier, DeviceJkt/ResultCipher จำแนกใหม่, ข้อมูลเด็ก 9→13 ตาราง, free-text เพิ่ม 3, jsonb เพิ่มรายการผลประเมิน, F7 เพิ่ม Session.ExpiresAt + expiry≠deletion, AccountId NULL; ยังไม่ปิด SEC001-010
- 2026-10-24 — แก้ตามผลตรวจ check ใบงาน060f (สวมบท vault โดยนายช่าง solo ตรง): แยก Outcome/EarnedScore/MaxScore เป็นคอลัมน์จริงตาม SQL:747–750 (varchar/numeric), ถอน LevelPromotionPolicy/GradeSlot จากรายการ "ไม่มี PII เฉพาะตัว", แก้อ้างอิง LevelSnapshot เป็น contract-003:49
