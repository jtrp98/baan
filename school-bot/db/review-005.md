# SQL Review Rev5 — ตัดทอน Index, Composite FK, Version, ตาราง/คอลัมน์ และ CHECK ที่ไม่จำเป็น

> หมายเหตุ MYCELIUM 2026-10-22: ไฟล์ grants ของ School DB/PGGradeDB ที่อ้างในเอกสารนี้ถูกถอนตาม [decisions-029](../requirement/decisions-029.md) (archive/grants-not-used/) — receipt ใน PGTGradeAuditLog ขึ้นกับสิทธิ์ของบัญชี DB เดิม

วันที่: 2026-10-22
บทบาท: Database Advisor (`dba`)
อ้างอิง: คำสั่งผู้ใช้ 2026-10-22, [decisions-025](../requirement/decisions-025.md)..[decisions-028](../requirement/decisions-028.md), [data-model.md](../design/data-model.md) (Rev4.1), [data-contract-rules.md](../design/data-contract-rules.md), [review-001.md](review-001.md)..[review-004.md](review-004.md)
สถานะ: DRAFT — เขียนอย่างเดียว ยังไม่เคยรัน (รอคนรันบนฐานทดสอบ)

---

## 1. สรุปจำนวนก่อน–หลังการตัดทอน

| หมวดหมู่ | ก่อนตัด (Rev4) | หลังตัด (Rev5) | เปลี่ยนแปลง |
|---|---|---|---|
| **จำนวนตาราง (`SchoolBot*`)** | 33 ตาราง | **32 ตาราง** | **-1 ตาราง** (ตัด `SchoolBotTeacherGrant`) |
| **Non-unique Indexes (`ix_*`)** | 10 ตัว | **0 ตัว** | **-10 ตัว (ตัดออก 100%)** |
| **Composite UNIQUE สำหรับรองรับ Composite FK** | 13 ตัว | **0 ตัว** | **-13 ตัว (ตัดออก 100%)** |
| **Business Table UNIQUE (`UQ_*`)** | 25 ตัว | **23 ตัว** | **-2 ตัว** (ตัด sequence uniqueness ที่คุมในโค้ดได้) |
| **Business Partial Unique Indexes (`ux_*`)** | 14 ตัว | **13 ตัว** | **-1 ตัว** (ตามการตัด `SchoolBotTeacherGrant`) |
| **Foreign Keys (`FK_*`)** | 27 เส้น (20 composite + 7 single) | **27 เส้น (26 single + 1 natural composite)** | เปลี่ยนเป็น single-column FK ชี้ PK ทั้งหมด (ยกเว้น `CurrentRevision` ที่เป็นเลขลำดับ) |
| **คอลัมน์ `Version` (Optimistic Concurrency)** | 33 ตาราง | **17 ตาราง** | **-16 ตาราง** (ตัด 15 ตาราง immutable/append-only + 1 ตารางที่ตัดออก) |
| **คอลัมน์ซ้ำซ้อนในตารางที่คงไว้** | มี 2 คอลัมน์ซ้ำซ้อน | **ตัดออก 2 คอลัมน์** | ตัด `ScoringPolicy.CurriculumId` และ `ScoreOutbox.ScorePreviewId` |
| **`CHECK` Constraints (`CK_*`)** | 117 ข้อ | **53 ข้อ** | **-64 ข้อ** (ตัด hash length, `jsonb_typeof`, `Version >= 1`, positive number ยิบย่อย) |
| **จำนวนบรรทัดใน `schoolbot_db.sql`** | 1,404 บรรทัด | **~855 บรรทัด** | ลดความซับซ้อนลง ~39% |

---

## 2. หมวดที่ 1: Non-Unique Indexes (`ix_*`) — ตัดออกทั้งหมด (10 → 0)

ตามคำสั่งผู้ใช้ *"เรื่อง index ด้วย เอาออก ข้อมูลมันไม่ได้เยอะขนาดนั้น"* จึงตัด non-unique index ที่มีไว้เพื่อเร่งความเร็วการค้นหาอย่างเดียวออกทั้งหมด 10 ตัว:

| ชื่อ Index ที่ตัดออก | ตาราง | คอลัมน์เดิม | เหตุผลที่ตัดได้ |
|---|---|---|---|
| `ix_schoolbot_license_binding_school_license` | `SchoolBotLicenseBinding` | `(SchoolId, LicenseId)` | ข้อมูลน้อย (1 โรงเรียนมีไม่กี่ binding) และมี `UQ_SchoolBotLicenseBinding_LicenseId_Epoch` ที่มี `LicenseId` เป็น leading column อยู่แล้ว |
| `ix_schoolbot_release_lookup` | `SchoolBotRelease` | `(Channel, Platform, Lifecycle)` | จำนวน release ทั้งระบบมีน้อยมาก (หลักสิบ/ร้อยแถว) Seq Scan เร็วกว่าการดูแล index |
| `ix_schoolbot_idempotency_replay_expiry` | `SchoolBotIdempotency` | `(ReplayUntil) WHERE ResultCipher IS NOT NULL` | งาน background ล้าง cipher รันเป็นรอบๆ ข้อมูลไม่เยอะ ไม่จำเป็นต้องมี index เฉพาะ |
| `ix_schoolbot_auditevent_entity` | `SchoolBotAuditEvent` | `(SchoolId, EntityType, EntityId, CreateDate DESC)` | เป็น index เพื่อความเร็วในการดูประวัติอย่างเดียว ไม่มีผลต่อความถูกต้องของข้อมูล |
| `ix_schoolbot_auditevent_request` | `SchoolBotAuditEvent` | `(RequestId)` | ใช้ค้นหาเมื่อ debug ตาม `RequestId` เท่านั้น ไม่กระทบ business invariant |
| `ix_schoolbot_session_principal_lookup` | `SchoolBotSession` | `(SchoolId, Channel, ProfileKind, ProfileId)` | ใช้ค้นหาตอน revoke รายคน ซึ่งเกิดไม่บ่อย ข้อมูลน้อย |
| `ix_schoolbot_session_legacy_admin` | `SchoolBotSession` | `(SchoolId, LegacyAdminId)` | ใช้ค้นหาตอน revoke legacy admin ซึ่งเกิดน้อยมาก |
| `ix_schoolbot_project_owner_list` | `SchoolBotProject` | `(SchoolId, OwnerKind, OwnerId, Mode, UpdateDate DESC)` | เป็น index สำหรับเรียงหน้า list โปรเจกต์ของนักเรียน/ครู ข้อมูลต่อโรงเรียนไม่เยอะ |
| `ix_schoolbot_curriculum_level_lifecycle` | `SchoolBotCurriculum` | `(LevelId, Lifecycle)` | หลักสูตรกลางทั้งระบบมีเพียงไม่กี่ Level / ไม่กี่สิบแถว |
| `ix_schoolbot_submission_learner_mission` | `SchoolBotSubmission` | `(SchoolId, LearnerId, MissionId, SubmittedAt DESC)` | ใช้加速การดึงผลส่งงานล่าสุดเท่านั้น ไม่ใช่ unique constraint |
| `ix_schoolbot_gradingjob_due_queue` | `SchoolBotGradingJob` | `(State, NextAttemptAt)` | ตารางคิวงานขนาดเล็ก ข้อมูลไม่เยอะ |
| `ix_schoolbot_retakegrant_lookup` | `SchoolBotRetakeGrant` | `(SchoolId, CourseRunId, ActivityId, LearnerId)` | สิทธิ์สอบซ่อมเกิดเฉพาะรายคนที่ครูเปิดให้ ข้อมูลน้อยมาก |
| `ix_schoolbot_scoreoutbox_due_queue` | `SchoolBotScoreOutbox` | `(State, NextAttemptAt)` | คิวส่งออกคะแนนรายคน ข้อมูลไม่เยอะ (และคง `UQ_SchoolBotScoreOutbox_OperationKey` กับ `Export_Item` ไว้แล้ว) |

*(หมายเหตุ: นับรวมในไฟล์เดิมมี `ix_*` ทั้งหมด 10 ตัว — ตัดออกครบทุกตัว)*

---

## 3. หมวดที่ 2: Business Unique Constraints & Partial Unique Indexes — คงเฉพาะที่กันข้อมูลพังจริง

### 3.1 Partial Unique Indexes (`ux_*`) — คง 13 ตัว / ตัด 1 ตัว

| ชื่อ Partial Unique Index | ตาราง | การตัดสินใจ | เหตุผล |
|---|---|---|---|
| `ux_schoolbot_license_binding_active` | `SchoolBotLicenseBinding` | **คงไว้** | บังคับกฎเหล็ก 1 License มีเครื่องที่ผูก active (`DetachedAt IS NULL AND IsDelete = false`) ได้ไม่เกิน 1 เครื่อง กัน race condition ตอน 2 เครื่องกด activate พร้อมกัน (DES-002) |
| `ux_schoolbot_release_global` | `SchoolBotRelease` | **คงไว้** | ใน PostgreSQL ค่า `NULL` ใน `UNIQUE` ปกติไม่ถือว่าเท่ากัน ถ้าไม่มีตัวนี้จะสร้าง global release (`SchoolId IS NULL`) เวอร์ชัน/แพลตฟอร์มซ้ำได้ |
| `ux_schoolbot_release_tenant` | `SchoolBotRelease` | **คงไว้** | คู่กับตัวบน บังคับไม่ให้สร้าง release รายโรงเรียน (`SchoolId IS NOT NULL`) เวอร์ชันซ้ำ |
| `ux_schoolbot_idempotency_global` | `SchoolBotIdempotency` | **คงไว้** | หัวใจของ Idempotency เมื่อ `SchoolId IS NULL` กันการรันคำสั่งซ้ำเมื่อ retry พร้อมกัน |
| `ux_schoolbot_idempotency_tenant` | `SchoolBotIdempotency` | **คงไว้** | หัวใจของ Idempotency รายโรงเรียน (`SchoolId IS NOT NULL`) กันการสร้าง resource/ตัดสิทธิ์ซ้ำจาก retry |
| `ux_schoolbot_idempotency_nonce` | `SchoolBotIdempotency` | **คงไว้** | กัน replay ของ device challenge nonce (`NonceHash IS NOT NULL`) ตาม DES-002 |
| `ux_schoolbot_staff_role_live` | `SchoolBotStaffRole` | **คงไว้** | กันการมอบ role เดิมซ้ำให้พนักงานคนเดิมในขณะที่ยังไม่ถูกลบ (`IsDelete = false`) |
| `ux_schoolbot_teacher_grant_live` | `SchoolBotTeacherGrant` | **ตัดออก** | ตัดออกพร้อมตาราง `SchoolBotTeacherGrant` (ยังไม่มีมติให้สร้างตาม `decisions-026`) |
| `ux_schoolbot_courserun_active_room` | `SchoolBotCourseRun` | **คงไว้** | บังคับกฎธุรกิจ 1 ห้องเรียน/ปี/เทอม เปิดใช้ CourseRun ที่ active (`planned/active/closing`) ได้ชุดเดียว |
| `ux_schoolbot_courserun_one_successor` | `SchoolBotCourseRun` | **คงไว้** | กันการสร้าง CourseRun เทอมถัดไป (successor) ซ้อนกัน 2 อันจาก `PreviousRunId` เดียวกันตอนเลื่อน Level (DES-011) |
| `ux_schoolbot_gradeslot_active_ownership` | `SchoolBotGradeSlot` | **คงไว้** | **สำคัญมาก (DES-008/009)**: บังคับว่า 1 ช่องคะแนนใน PGGradeDB (`SchoolId, NGradeId, AssessmentId, ScoreIdentifier` ที่ `RetiredAt IS NULL`) มีเจ้าของ active ได้เพียงหนึ่งเดียว และไม่กรอง `IsDelete = false` เพื่อห้ามหลบประวัติ ownership ด้วย soft-delete |
| `ux_schoolbot_scoremapping_active` | `SchoolBotScoreMapping` | **คงไว้** | บังคับ 1 active mapping ต่อ `(CourseRunId, GradeSlotId)` กันการผูกส่งคะแนนเข้าช่องเดิมซ้ำสองเส้นทาง |
| `ux_schoolbot_levelproposal_confirmed_per_run` | `SchoolBotLevelProposal` | **คงไว้** | กันครู 2 คนกดยืนยันผลเลื่อน Level ของ `CourseRunId` เดียวกันซ้ำ (DES-011) |
| `ux_schoolbot_levelproposal_successor_unique` | `SchoolBotLevelProposal` | **คงไว้** | บังคับ 1 `SuccessorRunId` ผูกกับใบเสนอเลื่อน Level ได้ใบเดียว |

### 3.2 Table UNIQUE Constraints (`UQ_*` ทางธุรกิจ) — คง 23 ตัว / ตัด 2 ตัว

| ตาราง | Constraint | การตัดสินใจ | เหตุผล |
|---|---|---|---|
| `SchoolBotLicense` | `UQ_SchoolBotLicense_KeyHash` | **คงไว้** | ห้ามมี License Key ซ้ำกันในระบบ |
| `SchoolBotLicenseBinding` | `UQ_SchoolBotLicenseBinding_LicenseId_Epoch` | **คงไว้** | ลำดับ `Epoch` ของการย้ายเครื่องต่อ License ห้ามชนกัน |
| `SchoolBotSession` | `UQ_SchoolBotSession_TokenHash` | **คงไว้** | ใช้ lookup bearer token และรับประกันว่า session token ไม่ชนกัน |
| `SchoolBotProjectRevision` | `UQ_SchoolBotProjectRevision_ProjectId_Revision` | **คงไว้** | กันเลข revision ของโปรเจกต์ชนกัน และ**จำเป็นต้องใช้เป็นปลายทางของ FK** `FK_SchoolBotProject_CurrentRevision` |
| `SchoolBotLevel` | `UQ_SchoolBotLevel_LevelKey`, `Code`, `Ordinal` (3 ตัว) | **คงไว้** | ตารางแม่ของลำดับชั้นเรียน (Beginner..Expert) ห้ามมีรหัสหรือลำดับซ้ำ |
| `SchoolBotLevelPromotionPolicy` | `UQ_SchoolBotLevelPromotionPolicy_Level_Revision` | **คงไว้** | กันเลข revision ของเกณฑ์ผ่านต่อ Level ชนกัน |
| `SchoolBotCurriculum` | `UQ_SchoolBotCurriculum_Key_Revision` | **คงไว้** | กันเลข revision ของหลักสูตรเดียวกันชนกัน |
| `SchoolBotLesson` | `UQ_SchoolBotLesson_Curriculum_LessonKey`, `Curriculum_Ordinal` (2 ตัว) | **คงไว้** | ใน 1 หลักสูตร ห้ามมีบทเรียน key ซ้ำหรือลำดับที่ (`Ordinal`) ซ้ำ |
| `SchoolBotMission` | `UQ_SchoolBotMission_Lesson_MissionKey`, `Lesson_Ordinal` (2 ตัว) | **คงไว้** | ใน 1 บทเรียน ห้ามมีภารกิจ key ซ้ำหรือลำดับซ้ำ |
| `SchoolBotCriteria` | `UQ_SchoolBotCriteria_Mission_Revision` | **คงไว้** | กันเลข revision ของเกณฑ์ตรวจในภารกิจเดียวกันชนกัน |
| `SchoolBotActivity` | `UQ_SchoolBotActivity_Lesson_ActivityKey`, `Lesson_Ordinal` (2 ตัว) | **คงไว้** | ใน 1 บทเรียน ห้ามมีกิจกรรม key ซ้ำหรือลำดับซ้ำ |
| `SchoolBotQuestionBank` | `UQ_SchoolBotQuestionBank_BankKey_Revision` | **คงไว้** | กันเลข revision ของคลังข้อสอบชนกัน |
| `SchoolBotScoringPolicy` | `UQ_SchoolBotScoringPolicy_CourseRun_Revision` | **คงไว้** | กันเลข revision ของนโยบายคะแนนใน CourseRun เดียวกันชนกัน |
| `SchoolBotCourseRunActivity` | `UQ_SchoolBotCourseRunActivity_Run_Activity` | **คงไว้** | 1 กิจกรรมใน 1 CourseRun มีแถวตั้งค่าเวลา/override ได้แถวเดียว |
| `SchoolBotGradingJob` | `UQ_SchoolBotGradingJob_SubmissionId` | **คงไว้** | 1 การส่งงาน (`SubmissionId`) มีงานตรวจในคิวได้แถวเดียว (1:1) |
| `SchoolBotAssessment` | `UQ_SchoolBotAssessment_Submission_Sequence` | **ตัดออก** | `Sequence` เป็นเพียงลำดับผลการประเมินภายใน `Submission` ที่ล็อกแถวแม่ (`SchoolBotSubmission`) ก่อนสร้างอยู่แล้ว ไม่จำเป็นต้องแบก B-tree index แยก |
| `SchoolBotAttempt` | `UQ_SchoolBotAttempt_Learner_Seq` | **ตัดออก** | เป็น composite 5 คอลัมน์ `(SchoolId, CourseRunId, ActivityId, LearnerId, Sequence)` ซึ่ง DES-010 กำหนดให้ lock counter ของผู้เรียนก่อนเริ่มทำข้อสอบอยู่แล้ว ตัดออกเพื่อลดภาระ index |
| `SchoolBotScorePreviewItem` | `UQ_SchoolBotScorePreviewItem_Preview_Learner` | **คงไว้** | ใน 1 Preview ห้ามมีนักเรียนคนเดิมซ้ำ 2 แถว (ป้องกันการสร้างงานส่งออกคะแนนซ้ำคนเดิม) |
| `SchoolBotScoreExport` | `UQ_SchoolBotScoreExport_ScorePreviewId` | **คงไว้** | **สำคัญตาม DES-009**: 1 Preview ยืนยันเป็นใบส่งออก (`ScoreExport`) ได้เพียงครั้งเดียวเท่านั้น แม้ส่งด้วย `Idempotency-Key` คนละค่า |
| `SchoolBotScoreOutbox` | `UQ_SchoolBotScoreOutbox_OperationKey` | **คงไว้** | **ห้ามตัดตามหลักการข้อ 7 (DES-009)**: ใช้กันการสร้าง/ส่งงานเขียนคะแนนด้วย `OperationKey` ซ้ำเข้า PGGradeDB |
| `SchoolBotScoreOutbox` | `UQ_SchoolBotScoreOutbox_Export_Item` | **คงไว้** | **ห้ามตัดตามหลักการข้อ 7 (DES-009)**: บังคับ 1 แถว outbox ต่อ 1 นักเรียนในใบ export เดียวกัน |

---

## 4. หมวดที่ 3: Composite UNIQUE `(SchoolId, ...)` และ Composite FK — ตัดและเปลี่ยนเป็น Single-Column FK ทั้งหมด

### การประเมินความคุ้มค่า
- ใน Rev1–Rev4 มีการสร้าง `UNIQUE ("SchoolId", "<PK>")` และ `UNIQUE ("SchoolId", "<ParentId>", "<PK>")` ถึง **13 ตัว** เพียงเพื่อเป็นปลายทางให้ PostgreSQL ยอมสร้าง Composite Foreign Key `FOREIGN KEY ("SchoolId", "<TargetId>")`
- **ผลเสีย**: ทุกตารางที่มี constraint นี้จะต้องสร้างและอัปเดต B-tree index ซ้ำซ้อนกับ Primary Key (`SchoolBot<Name>Id`) อีกหนึ่งตัวเต็มๆ ทั้งที่ PK มีค่าไม่ซ้ำทั้งตารางอยู่แล้ว และในโค้ด backend (`Authorize` / query filter ตาม `data-contract-rules.md`) บังคับตรวจ `SchoolId` ตรงกับ session ทุกครั้งอยู่แล้ว
- **ข้อสรุป**: **ไม่คุ้มค่า** — ตัด Composite UNIQUE ทั้ง 13 ตัวออกทั้งหมด และปรับ FK ทั้งหมดให้ชี้ไปที่ PK คอลัมน์เดียวอย่างสม่ำเสมอ

### รายการ Composite UNIQUE ที่ตัดออก (13 ตัว)
1. `UQ_SchoolBotLicense_SchoolId_Id` (`SchoolId, SchoolBotLicenseId`)
2. `UQ_SchoolBotLicenseBinding_Tenant_License_Id` (`SchoolId, LicenseId, SchoolBotLicenseBindingId`)
3. `UQ_SchoolBotProject_SchoolId_Id` (`SchoolId, SchoolBotProjectId`)
4. `UQ_SchoolBotProjectRevision_SchoolId_Id` (`SchoolId, SchoolBotProjectRevisionId`)
5. `UQ_SchoolBotProjectRevision_School_Project_Revision` (`SchoolId, ProjectId, Revision`) *(ซ้ำซ้อนกับ `UQ_SchoolBotProjectRevision_ProjectId_Revision`)*
6. `UQ_SchoolBotCriteria_Mission_CriteriaId` (`MissionId, SchoolBotCriteriaId`) *(มีไว้ทำ composite FK จาก `Submission` เท่านั้น)*
7. `UQ_SchoolBotCourseRun_SchoolId_Id` (`SchoolId, SchoolBotCourseRunId`)
8. `UQ_SchoolBotScoringPolicy_Tenant_Run_Id` (`SchoolId, CourseRunId, SchoolBotScoringPolicyId`)
9. `UQ_SchoolBotSubmission_SchoolId_Id` (`SchoolId, SchoolBotSubmissionId`)
10. `UQ_SchoolBotAssessment_Tenant_Submission_Id` (`SchoolId, SubmissionId, SchoolBotAssessmentId`)
11. `UQ_SchoolBotAttempt_SchoolId_Id` (`SchoolId, SchoolBotAttemptId`)
12. `UQ_SchoolBotGradeSlot_Tenant_Run_Id` (`SchoolId, CourseRunId, SchoolBotGradeSlotId`)
13. `UQ_SchoolBotScorePreview_SchoolId_Id` (`SchoolId, SchoolBotScorePreviewId`)
14. `UQ_SchoolBotScorePreviewItem_Tenant_Preview_Id` (`SchoolId, ScorePreviewId, SchoolBotScorePreviewItemId`)
15. `UQ_SchoolBotScoreExport_Tenant_Preview_ExportId` (`SchoolId, ScorePreviewId, SchoolBotScoreExportId`)
*(รวม 15 composite unique ที่สร้างมาเพื่อรองรับ composite FK — ตัดออกทั้งหมด)*

### รายการ Foreign Keys ที่ปรับเป็น Single-Column FK (20 เส้นที่เปลี่ยน + 7 เส้นที่เป็น single-column อยู่เดิม = 27 เส้น)
- `FK_SchoolBotLicenseBinding_License`: `("LicenseId") -> "SchoolBotLicense"("SchoolBotLicenseId")`
- `FK_SchoolBotLicense_CurrentBinding` (DEFERRABLE): `("CurrentBindingId") -> "SchoolBotLicenseBinding"("SchoolBotLicenseBindingId")`
- `FK_SchoolBotProjectRevision_Project`: `("ProjectId") -> "SchoolBotProject"("SchoolBotProjectId")`
- `FK_SchoolBotProject_CurrentRevision` (DEFERRABLE): `("SchoolBotProjectId", "CurrentRevision") -> "SchoolBotProjectRevision"("ProjectId", "Revision")` *(คง 2 คอลัมน์เพราะ `CurrentRevision` เก็บเลขลำดับ revision `N` ไม่ใช่ `ProjectRevisionId`)*
- `FK_SchoolBotCourseRun_PreviousRun`: `("PreviousRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotCourseRun_CurrentPolicy` (DEFERRABLE): `("CurrentPolicyId") -> "SchoolBotScoringPolicy"("SchoolBotScoringPolicyId")`
- `FK_SchoolBotScoringPolicy_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotCourseRunActivity_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotSubmission_Criteria`: `("CriteriaId") -> "SchoolBotCriteria"("SchoolBotCriteriaId")`
- `FK_SchoolBotSubmission_ProjectRevision`: `("ProjectRevisionId") -> "SchoolBotProjectRevision"("SchoolBotProjectRevisionId")`
- `FK_SchoolBotSubmission_CurrentAssessment` (DEFERRABLE): `("CurrentAssessmentId") -> "SchoolBotAssessment"("SchoolBotAssessmentId")`
- `FK_SchoolBotGradingJob_Submission`: `("SubmissionId") -> "SchoolBotSubmission"("SchoolBotSubmissionId")`
- `FK_SchoolBotAssessment_Submission`: `("SubmissionId") -> "SchoolBotSubmission"("SchoolBotSubmissionId")`
- `FK_SchoolBotAssessment_Supersedes`: `("SupersedesId") -> "SchoolBotAssessment"("SchoolBotAssessmentId")`
- `FK_SchoolBotAttempt_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotRetakeGrant_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotRetakeGrant_ConsumedAttempt`: `("ConsumedAttemptId") -> "SchoolBotAttempt"("SchoolBotAttemptId")`
- `FK_SchoolBotGradeSlot_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotScoreMapping_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotScoreMapping_GradeSlot`: `("GradeSlotId") -> "SchoolBotGradeSlot"("SchoolBotGradeSlotId")`
- `FK_SchoolBotScorePreview_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotScorePreview_Supersedes`: `("SupersedesId") -> "SchoolBotScorePreview"("SchoolBotScorePreviewId")`
- `FK_SchoolBotScorePreviewItem_Preview`: `("ScorePreviewId") -> "SchoolBotScorePreview"("SchoolBotScorePreviewId")`
- `FK_SchoolBotScoreExport_Preview`: `("ScorePreviewId") -> "SchoolBotScorePreview"("SchoolBotScorePreviewId")`
- `FK_SchoolBotScoreOutbox_Export`: `("ScoreExportId") -> "SchoolBotScoreExport"("SchoolBotScoreExportId")`
- `FK_SchoolBotScoreOutbox_PreviewItem`: `("ScorePreviewItemId") -> "SchoolBotScorePreviewItem"("SchoolBotScorePreviewItemId")`
- `FK_SchoolBotLevelProposal_CourseRun`: `("CourseRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`
- `FK_SchoolBotLevelProposal_SuccessorRun`: `("SuccessorRunId") -> "SchoolBotCourseRun"("SchoolBotCourseRunId")`

*(หมายเหตุ: การตรวจว่า parent กับ child อยู่ `SchoolId` เดียวกัน และ `CriteriaId` อยู่ใน `MissionId` เดียวกัน ให้ตรวจในชั้น application ตอนสร้าง/อัปเดตตาม `data-contract-rules.md`)*

---

## 5. หมวดที่ 4: คอลัมน์ `Version` — คง 17 ตาราง / ตัดออก 15 ตาราง

ตามหลักการข้อ 4: คง `Version` เฉพาะตารางที่มีการแก้ไขแถวเดิมพร้อมกันได้จริงและ API/worker ใช้ `If-Match` หรือ optimistic concurrency; ตัดออกจากตารางที่เป็น append-only หรือ immutable snapshot:

| ตาราง | การตัดสินใจ | เหตุผล |
|---|---|---|
| `SchoolBotLicense` | **คง `Version`** | ใช้ `If-Match` ตอน `revoke` / `unbind` และอัปเดต `CurrentBindingId` |
| `SchoolBotLicenseBinding` | **คง `Version`** | อัปเดต `LastCheckedAt`, `LastEntitlementExpiresAt`, `DetachedAt` |
| `SchoolBotRelease` | **คง `Version`** | ใช้ `If-Match` ตอน `publish` / `withdraw` |
| `SchoolBotIdempotency` | **ตัด `Version`** | เขียนตอนจบ request ครั้งเดียว (และ job ล้างเฉพาะ `ResultCipher = NULL` หลังหมดอายุ ไม่มีการแข่งกันแก้ด้วย `If-Match`) |
| `SchoolBotAuditEvent` | **ตัด `Version`** | Append-only 100% ห้ามแก้ไขแถวเดิม |
| `SchoolBotSession` | **คง `Version`** | ใช้ `If-Match` ใน `PUT /v2/auth/session` ตอน bind โปรไฟล์ |
| `SchoolBotStaffRole` | **คง `Version`** | ใช้ `If-Match` ใน `DELETE /v2/admin/staff-roles/{id}` |
| `SchoolBotProject` | **คง `Version`** | ใช้ `If-Match` ตอนบันทึกโปรเจกต์/เปลี่ยนชื่อ/ลบ (DES-003) |
| `SchoolBotProjectRevision` | **ตัด `Version`** | Immutable snapshot ของโค้ด/บล็อกในแต่ละ revision สร้างแล้วไม่แก้ |
| `SchoolBotLevel` | **คง `Version`** | ใช้ `If-Match` ของ Level ใน `POST /v2/admin/levels/{id}/promotion-policies` (DES-011) |
| `SchoolBotLevelPromotionPolicy` | **ตัด `Version`** | Immutable ต่อ revision เปลี่ยนเกณฑ์ต้องสร้าง revision ใหม่ |
| `SchoolBotCurriculum` | **คง `Version`** | ใช้ `If-Match` ใน `PUT /v2/admin/curricula/{id}/content` และ `POST .../publish` |
| `SchoolBotLesson` | **ตัด `Version`** | ลูกของ `Curriculum` แก้ไขผ่าน aggregate root (`PUT /curricula/{id}/content`) โดยใช้ `Version` ของ `SchoolBotCurriculum` |
| `SchoolBotMission` | **ตัด `Version`** | ลูกของ `Lesson`/`Curriculum` ไม่มี endpoint แก้แถวเดี่ยวด้วย `If-Match` |
| `SchoolBotCriteria` | **ตัด `Version`** | ลูกของ `Mission` เก็บแยกตาม `Revision`แบบ immutable |
| `SchoolBotActivity` | **ตัด `Version`** | ลูกของ `Lesson`/`Curriculum` ไม่มี endpoint แก้แถวเดี่ยวด้วย `If-Match` |
| `SchoolBotQuestionBank` | **คง `Version`** | ใช้ `If-Match` ใน `POST /v2/admin/question-banks/{id}/publish` |
| `SchoolBotCourseRun` | **คง `Version`** | ใช้ `If-Match` ตอนเพิ่ม `ScoringPolicy` และเปลี่ยนสถานะเปิด/ปิดเทอม |
| `SchoolBotScoringPolicy` | **ตัด `Version`** | Immutable ต่อ `Revision` (เมื่อครูเปลี่ยนนโยบายจะสร้าง `Revision` แถวใหม่และอัปเดต `CourseRun.CurrentPolicyId`) |
| `SchoolBotCourseRunActivity` | **คง `Version`** | ใช้ `If-Match` ใน `PUT /v2/course-runs/{id}/activities/{activity_id}` |
| `SchoolBotSubmission` | **คง `Version`** | ใช้ `If-Match` ใน `POST /v2/submissions/{id}/assessments` ตอนครูตรวจงาน Arm |
| `SchoolBotGradingJob` | **คง `Version`** | Worker ใช้ optimistic concurrency คู่กับ lease ตอนดึงงานไปตรวจ |
| `SchoolBotAssessment` | **ตัด `Version`** | Append-only / immutable (เมื่อครูตรวจใหม่จะสร้างแถว `Sequence` ใหม่พร้อม `SupersedesId` ไม่แก้แถวเดิม) |
| `SchoolBotAttempt` | **คง `Version`** | ใช้ `If-Match` ใน `PUT /v2/attempts/{id}/answers` และ `POST .../submit` |
| `SchoolBotRetakeGrant` | **ตัด `Version`** | สร้างแล้วใช้ครั้งเดียวตอนเริ่มสอบซ่อม (ผูก `ConsumedAttemptId` ภายใต้ lock ของผู้เรียน) ไม่มี endpoint แก้ด้วย `If-Match` |
| `SchoolBotGradeSlot` | **คง `Version`** | อัปเดตสถานะ `RetiredAt` เมื่อเลิกถือครองช่องคะแนน |
| `SchoolBotScoreMapping` | **คง `Version`** | ใช้ `If-Match` ใน `PUT /v2/score-mappings/{id}` และ `POST .../retire` |
| `SchoolBotScorePreview` | **คง `Version`** | ใช้ `If-Match` ใน `POST /v2/score-previews/{id}/confirm` และ `POST .../resolve` |
| `SchoolBotScorePreviewItem` | **ตัด `Version`** | Immutable snapshot รายนักเรียนภายในใบ Preview (การกด resolve จะสร้างใบ `ScorePreview` ใหม่ตาม DES-009) |
| `SchoolBotScoreExport` | **คง `Version`** | อัปเดตสถานะใบงานส่งออก (`queued -> running -> completed/...`) |
| `SchoolBotScoreOutbox` | **คง `Version`** | Worker ใช้ claim lease และบันทึก `ReceiptId`/`State` รายนักเรียน |
| `SchoolBotLevelProposal` | **คง `Version`** | ใช้ `If-Match` ใน `POST /v2/level-proposals/{id}/confirm` และ `POST .../decline` |

---

## 6. หมวดที่ 5: ตารางและคอลัมน์ที่ตัดออก พร้อมผลกระทบต่อ DES

| รายการที่ตัด | ประเภท | เหตุผล | ผลกระทบต่อเอกสารออกแบบ (ที่ SA ต้องตามแก้) |
|---|---|---|---|
| **`SchoolBotTeacherGrant`** | ตาราง (ทั้งตาราง) | เป็นตารางทางสำรอง (conditional fallback) ที่ `decisions-026` ระบุชัดเจนว่า **"ยังไม่ได้ตัดสินให้สร้าง"** การใส่สร้างจริงไว้ล่วงหน้าใน DDL จึงเกินความจำเป็น | `data-model.md`, `data-contract-rules.md`, `schoolbot.dbml`, `des-004.md`: ย้ายนิยามตาราง `SchoolBotTeacherGrant` ออกจากชุดตารางที่สร้างจริง (คงไว้เฉพาะหมายเหตุแนวทางสำรองหากอนาคตต้องการเปิดใช้) |
| **`SchoolBotScoringPolicy.CurriculumId`** | คอลัมน์ (และ FK) | ซ้ำซ้อน 100% เพราะ `SchoolBotScoringPolicy` ผูกกับ `CourseRunId` ซึ่งใน `SchoolBotCourseRun` มี `CurriculumId` ที่ห้ามเปลี่ยนตลอดอายุ run อยู่แล้ว | `data-model.md` (บรรทัด 62) และ `schoolbot.dbml`: ถอน `CurriculumId:K` ออกจาก `SchoolBotScoringPolicy` (สามารถ join หรืออ่านจาก `CourseRun.CurriculumId` ได้โดยตรง) |
| **`SchoolBotScoreOutbox.ScorePreviewId`** | คอลัมน์ | ใน SQL เดิมใส่เพิ่มเข้ามาเพื่อทำ composite FK 3 คอลัมน์ไปยัง `ScoreExport` และ `ScorePreviewItem` เท่านั้น (ใน `data-model.md` บรรทัด 74 ไม่มีคอลัมน์นี้อยู่แล้ว) เมื่อเปลี่ยนเป็น single-column FK จึงตัดออกได้ทันที | ไม่กระทบ `data-model.md` (เพราะ `data-model.md` ไม่ได้มีคอลัมน์นี้ตั้งแต่แรก); ปรับเฉพาะ `schoolbot.dbml` ถ้ามีคอลัมน์นี้ค้างอยู่ |

---

## 7. หมวดที่ 6: `CHECK` Constraints (`CK_*`) — ลดจาก 117 เหลือ 53 ข้อ

### 7.1 กลุ่ม `CHECK` ที่ตัดออก (64 ข้อ)
1. **ตรวจ `Version >= 1` (`CK_*_Version_Pos` ทั้ง 33 ตาราง)**: ตัดออกทั้งหมด เพราะคอลัมน์มี `NOT NULL DEFAULT 1` และโค้ดสั่ง `Version = Version + 1` เสมอ
2. **ตรวจความยาว Hash / String (`char_length(...) = 64` รวม 10 ข้อ)**: ได้แก่ `KeyHash`, `AllowedNextJkt`, `DeviceJkt` (ใน Binding และ Session), `ArtifactHash`, `RequestHash`, `NonceHash`, `ContentHash`, `SnapshotHash` (ใน Preview และ LevelProposal), `PayloadHash`, `ReceiptHash` — ตัดออกเพราะเป็นรูปแบบข้อมูลที่ server เป็นผู้คำนวณ SHA-256 hex เอง ไม่ใช่ค่าที่ปล่อยให้ใส่ผิดความหมายทางธุรกิจ
3. **ตรวจชนิด JSONB (`jsonb_typeof(...)` รวม 18 ข้อ) และ `PublicJwk` shape**: ได้แก่ `Title`, `RecommendedGrades`, `Subjects`, `Objective`, `Instructions`, `Rules`, `Indicators`, `Config`, `Questions`, `Policy`, `PolicyOverride`, `Evidence`, `RuleResults`, `Snapshot`, `Answers`, `Sources`, `TargetSnapshot`, `Context`, `ReasonCodes`, `PublicJwk` — ตัดออกเพราะ serializer/validator ฝั่ง backend บังคับโครงสร้าง JSON ตาม DTO ก่อนเขียนลงคอลัมน์ `jsonb` อยู่แล้ว
4. **ตรวจเลขลำดับ/สถานะยิบย่อยที่โค้ดคุมเอง (14 ข้อ)**: ได้แก่ `BindingEpoch >= 1`, `Epoch >= 1`, `HttpStatus BETWEEN 100 AND 599`, `PreviousVersion >= 0`, `NewVersion >= 1`, `EntityId >= 1`, `CurrentRevision >= 1`, `Revision >= 1` (6 ตาราง), `Ordinal >= 1` (4 ตาราง), `Sequence >= 1` (2 ตาราง), `Attempts >= 0` (2 ตาราง)

### 7.2 กลุ่ม `CHECK` ที่คงไว้ (53 ข้อ)
1. **ขอบเขต `SchoolId` (32 ข้อ — ตารางละ 1 ข้อ)**:
   - ตาราง Tenant (21 ตาราง): `CHECK ("SchoolId" > 0)`
   - ตาราง Global (8 ตาราง): `CHECK ("SchoolId" IS NULL)`
   - ตาราง Mixed Global/Tenant (3 ตาราง): `CHECK ("SchoolId" IS NULL OR "SchoolId" > 0)`
2. **ค่า Enum / State / Lifecycle (16 ข้อ)**:
   - `SchoolBotRelease`: `Channel`, `Platform`, `Lifecycle`
   - `SchoolBotSession`: `Channel`, `ProfileKind`
   - `SchoolBotStaffRole`: `Role`
   - `SchoolBotProject`: `OwnerKind`, `Mode`
   - `SchoolBotCurriculum`: `Lifecycle`
   - `SchoolBotMission`: `Method`
   - `SchoolBotActivity`: `Type`, `Mode`
   - `SchoolBotQuestionBank`: `Lifecycle`
   - `SchoolBotCourseRun`: `Lifecycle`
   - `SchoolBotSubmission`: `State`
   - `SchoolBotGradingJob`: `State`
   - `SchoolBotAssessment`: `Method`, `Outcome`
   - `SchoolBotAttempt`: `State`
   - `SchoolBotGradeSlot`: `Category`
   - `SchoolBotScorePreview`: `State`
   - `SchoolBotScorePreviewItem`: `State`
   - `SchoolBotScoreExport`: `State`
   - `SchoolBotScoreOutbox`: `State`
   - `SchoolBotLevelProposal`: `State`
3. **คู่คอลัมน์ที่ต้องมาด้วยกัน / ช่วงคะแนนและเวลา / กันอ้างอิงตัวเอง (18 ข้อ)**:
   - `CK_SchoolBotLicenseBinding_LeaseWindow`: `"LastEntitlementExpiresAt" <= "LastCheckedAt" + interval '259200 seconds'` (DES-002)
   - `CK_SchoolBotRelease_PublishedAt`: `"Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL`
   - `CK_SchoolBotIdempotency_CipherKeyPair`: `ResultCipher` กับ `ResultKeyId` ต้อง NULL หรือ NOT NULL คู่กัน
   - `CK_SchoolBotSession_ProfilePair`: `ProfileKind` กับ `ProfileId` ต้องมาคู่กัน
   - `CK_SchoolBotSession_ChannelDesktopFields`: `desktop` ต้องมี `DeviceJkt` และ `AccountId`; `school_web`/`staff_admin` ต้อง `DeviceJkt IS NULL`
   - `CK_SchoolBotStaffRole_ValidWindow`: `"ValidUntil" IS NULL OR "ValidUntil" > "ValidFrom"`
   - `CK_SchoolBotLevelPromotionPolicy_Threshold_Range`: `"Threshold" >= 0 AND "Threshold" <= 100`
   - `CK_SchoolBotCurriculum_PublishedAt`: `"Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL`
   - `CK_SchoolBotCriteria_ApprovalPair`: `ApprovedBy` กับ `ApprovedAt` ต้องมาคู่กัน
   - `CK_SchoolBotActivity_TypeModePair`: `Type = 'project'` ต้องมี `Mode`; ชนิดอื่น `Mode IS NULL`
   - `CK_SchoolBotQuestionBank_PublishedAt`: `"Lifecycle" <> 'published' OR "PublishedAt" IS NOT NULL`
   - `CK_SchoolBotCourseRun_NoSelfPrev` และ `CK_SchoolBotCourseRun_PlanCourseIds_NonEmpty`
   - `CK_SchoolBotCourseRunActivity_Window`: `"ClosesAt" IS NULL OR "OpensAt" IS NULL OR "ClosesAt" > "OpensAt"`
   - `CK_SchoolBotGradingJob_LeasePair`: `LeaseOwner` กับ `LeaseUntil` ต้องมาคู่กัน
   - `CK_SchoolBotAssessment_MethodActorPair`, `CK_SchoolBotAssessment_NumericScorePair` (`0 <= EarnedScore <= MaxScore`, `MaxScore > 0`), `CK_SchoolBotAssessment_NoSelfSupersede`
   - `CK_SchoolBotAttempt_ScoreBounds`: `"MaxScore" > 0 AND ("EarnedScore" IS NULL OR ("EarnedScore" >= 0 AND "EarnedScore" <= "MaxScore"))`
   - `CK_SchoolBotScorePreview_NoSelfSupersede`
   - `CK_SchoolBotScoreOutbox_LeasePair`: `LeaseOwner` กับ `LeaseUntil` ต้องมาคู่กัน
   - `CK_SchoolBotLevelProposal_DecisionPair` และ `CK_SchoolBotLevelProposal_NoSelfSuccessor`

---

## 8. ยืนยันการคงกลไกป้องกันของ `DES-009` (หลักการข้อ 7)

ไม่ตัดสิ่งใดที่ `DES-009` ใช้ป้องกันการส่งคะแนนซ้ำหรือชนกับ writer เดิม:
1. **`UQ_SchoolBotScoreOutbox_OperationKey` (`UNIQUE ("OperationKey")`)**: **คงไว้**
2. **`UQ_SchoolBotScoreOutbox_Export_Item` (`UNIQUE ("ScoreExportId", "ScorePreviewItemId")`)**: **คงไว้**
3. **`UQ_SchoolBotScoreExport_ScorePreviewId` (`UNIQUE ("ScorePreviewId")`)**: **คงไว้**
4. **`UQ_SchoolBotScorePreviewItem_Preview_Learner` (`UNIQUE ("ScorePreviewId", "LearnerId")`)**: **คงไว้**
5. **`ux_schoolbot_gradeslot_active_ownership` และ `ux_schoolbot_scoremapping_active`**: **คงไว้**
6. **คอลัมน์ `ReceiptId bigint NULL` และ `ReceiptHash varchar(64) NULL` ใน `SchoolBotScoreOutbox` + สิทธิ์ `INSERT` ลง `PGTGradeAuditLog` ใน `schoolbot_pggradedb_grants.sql`**: **คงไว้ครบถ้วน**

---

## 9. สิ่งที่ `sa` ต้องตามแก้ใน `design/` ให้ตรงกับ SQL Rev5

1. **`design/data-model.md` และ `design/schoolbot.dbml`**:
   - ปรับจำนวนตารางที่สร้างจริงจาก 33 เป็น **32 ตาราง** (ระบุว่า `SchoolBotTeacherGrant` ยังไม่สร้างใน DB จนกว่าจะมีมติเปิดใช้ fallback)
   - ถอนคอลัมน์ `Version` ออกจาก 15 ตารางที่เป็น append-only/immutable (`SchoolBotIdempotency`, `SchoolBotAuditEvent`, `SchoolBotProjectRevision`, `SchoolBotLevelPromotionPolicy`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotScoringPolicy`, `SchoolBotAssessment`, `SchoolBotRetakeGrant`, `SchoolBotScorePreviewItem`) โดยปรับคำอธิบาย common columns ว่า `Version` มีเฉพาะตารางที่แก้ไขแถวเดิมได้ (17 ตาราง)
   - ถอนคอลัมน์ `CurriculumId` ออกจาก `SchoolBotScoringPolicy` (และถอน `ScorePreviewId` ออกจาก `SchoolBotScoreOutbox` ใน DBML ถ้ามี)
   - ปรับคำอธิบาย FK ภายใน tenant เดียวกัน จากเดิมที่ระบุว่าใช้ composite FK `(SchoolId, XId)` เป็น **ใช้ single-column FK ชี้ PK คอลัมน์เดียว และตรวจ `SchoolId` ตรงกันในชั้น application**
   - อัปเดตที่ตั้งฐานข้อมูลจาก `JabjaiSchoolSingleDB` เป็น **SchoolBot DB (`10.0.0.128:9499`, schema `public`)** ตาม `decisions-027`
2. **`design/data-contract-rules.md`, `des-004.md`, `des-005.md`, `des-008.md`..`des-012.md`**:
   - อัปเดตข้อความเรื่อง single-DB transaction ที่เคยอ้างว่าตาราง SchoolBot อยู่ใน School DB เดียวกับตาราง legacy ให้ตรงกับ `decisions-027` (ตาราง SchoolBot ทั้ง 32 ตาราง commit ใน transaction เดียวกันบน **SchoolBot DB** ส่วนการอ่านสิทธิ์/roster/term จาก **School DB** เป็นการอ่านข้าม DB connection ที่ต้อง re-check ก่อน commit)

## Change Log
- 2026-10-22 — MYCELIUM: ถอน Version ที่เหลือทั้งหมดและ AuditEvent.Previous/NewVersion ตาม decisions-030 (ใช้ UpdateDate) — ตัวเลข Version ในเอกสารนี้จึงไม่ใช้แล้ว
- 2026-10-22 — สร้างเอกสารรีวิว Rev5 ตามคำสั่งผู้ใช้: ตัด non-unique index (`ix_*`) ทั้งหมด 10 ตัว, ตัด composite UNIQUE สำหรับ FK ทั้งหมดและเปลี่ยนเป็น single-column FK, ตัด `Version` จาก 15 ตาราง immutable/append-only, ตัดตาราง `SchoolBotTeacherGrant` ที่ยังไม่มีมติสร้าง, ตัดคอลัมน์ซ้ำซ้อน 2 คอลัมน์ และลด `CHECK` constraint จาก 117 เหลือ 53 ข้อ
