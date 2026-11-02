# กฎข้อมูลและ HTTP contract ร่วม — Rev11

แยกจาก logical data contract ของ SA เพื่อคุมขนาดเอกสาร ชนิด `K`, `I`, `U`, `N`, `Tn` และตารางอ้าง [data-model.md](data-model.md) (Rev5 — ตรงกับ [db/schoolbot_db.sql](../db/schoolbot_db.sql) และ [db/review-005.md](../db/review-005.md) ตามมติ [decisions-026.md](../requirement/decisions-026.md)..[decisions-030.md](../requirement/decisions-030.md))

## Relations / uniqueness / invariants

Canonical เพิ่มเติม: [ผลเรียน/policy](learning-rules-032-034.md), [mapping/export](grade-rules-032-034.md); เป็น application invariants เพิ่มจาก SQL ด้านล่าง โดยกฎไม่ซ้ำเฉพาะ active ไม่เท่ากับกฎล็อกประวัติ

ร่าง SQL ปัจจุบันคง PRIMARY KEY 32 รายการ; UNIQUE/FK/CHECK เป็น 0. ความสัมพันธ์ ความไม่ซ้ำ และเงื่อนไขข้อมูลเดิมเป็นกฎเชิงตรรกะของ application; งานนี้ไม่เพิ่มหรือพิสูจน์ implementation ทดแทน (NOT_IMPLEMENTED). ชนิดข้อมูลและ identity เดิมคงอยู่; CreateBy/CreateDate/UpdateBy/UpdateDate รับ NULL และ DEFAULT NULL ทุกตาราง; ฟิลด์อื่นคง nullability/default เดิม; ยังไม่ได้รันฐานจริง

application/repository ต้องใช้ transaction-scoped lock บน stable key ที่ serialize ทุก writer ของ logical scope เดียวกันข้าม process รวมกรณียังไม่มีแถว: ล็อกก่อนอ่านตรวจซ้ำและถือจน commit/rollback. ทุกเส้นทาง create/update/restore/เปลี่ยนสถานะต้องใช้ protocol เดียวกัน; key มี namespace/canonical encoding และแยก global (`SchoolId=null`) จาก tenant; หลาย locks ใช้ลำดับเดียวกัน. select-before-insert, row lock ของแถวที่ยังไม่มี และ `If-Match` เพียงอย่างเดียวไม่ป้องกัน create race

lock ของ finalized proposal และ successor ใช้ namespace/key ของ CourseRun ต้นทางร่วมกัน ไม่ล็อกเฉพาะ proposal ID. คง predicates เดิม: active run = `Lifecycle IN ('planned','active','closing') AND IsDelete=false`; successor ของ run = `PreviousRunId IS NOT NULL AND IsDelete=false`; finalized proposal = `State IN ('promoted','retained','max_level') AND IsDelete=false`; successor ของ proposal = `SuccessorRunId IS NOT NULL AND IsDelete=false`. GradeSlot ownership ใช้ `RetiredAt=null` โดยไม่กรอง `IsDelete`; active mapping ใช้ `RetiredAt=null AND IsDelete=false`. กฎห้ามหลบประวัติด้วย retire/soft-delete/hard-delete ยังคงแยกจาก predicates เหล่านี้

การบังคับทดแทนด้วย application/repository locks: **NOT_IMPLEMENTED — ไม่มี runtime evidence**; domain mutation/idempotency/audit ยังต้อง atomic ใน SchoolBot DB transaction เดียว ไม่เปลี่ยน replay window/tombstone/nonce/ownership/promotion semantics. สำหรับคู่ข้อมูลแม่–ลูกและ pointer ที่ต้องสอดคล้องกันเสมอ (เช่น `SchoolBotProject` คู่กับ `SchoolBotProjectRevision` และ `CurrentRevision` ตาม [decisions-051](../requirement/decisions-051.md) / [project-api-001](project-api-001.md) Rev2) ต้องบันทึกผ่านหน่วย commit ร่วมของ backing store/DB transaction (`CommitProjectAsync`): **ห้ามเผยแพร่แถว `SchoolBotProject` หรือเลื่อน `CurrentRevision` ลง store หรือ in-memory cache ก่อนที่แถว `SchoolBotProjectRevision` เป้าหมายจะ commit สำเร็จพร้อมกัน และห้ามใช้การเขียนแยกสองขั้นแล้วตามด้วยโค้ดชดเชย/ลบย้อนหลัง (compensation write/rollback in catch) เป็นหลักประกัน atomicity**; หากล้มเหลวก่อนจุด commit ต้องคงสถานะเดิมทั้งใน store และ cache และหากผลของจุด commit ไม่ทราบแน่ชัดต้อง invalidate/reload cache จากสถานะ authoritative ของ store

| กลุ่ม | กฎ |
|---|---|
| License | `KeyHash` unique ทั้งระบบ (`RULE_UNIQUE_SchoolBotLicense_KeyHash`); `CurrentBindingId` ต้องเป็น binding ของ License/School เดียวกันและ `DetachedAt=null` (`LOGICAL_SchoolBotLicense_CurrentBinding` ในเชิงตรรกะ (ไม่มี FK ใน SQL)); มี current ได้หนึ่งเดียว; **ทั้งช่อง `desktop` และช่อง `school_web` ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ไม่หมดอายุและ `RevokedAt=null`)** โดยช่อง `school_web` ไม่ต้องมี device binding (decisions-025/026) |
| Binding | unique `(LicenseId,Epoch)` (`RULE_UNIQUE_SchoolBotLicenseBinding_LicenseId_Epoch`); active binding (`DetachedAt=null, IsDelete=false`) มีได้ไม่เกินหนึ่งต่อ License (กฎ active binding ผ่าน transaction lock บน `LicenseId`); epoch เพิ่มเมื่อเปลี่ยน binding; `LastEntitlementExpiresAt` ≤ `License.ExpiresAt` และ ≤ `LastCheckedAt+259200` วินาที |
| Identity/Session | `TokenHash` unique (`RULE_UNIQUE_SchoolBotSession_TokenHash`); `Channel` ∈ `desktop\|school_web\|staff_admin` (ค่าเริ่ม `'desktop'`); `Channel=desktop` ⇔ `DeviceJkt` not null และ `AccountId` not null; `Channel IN ('school_web','staff_admin')` ⇒ `DeviceJkt=null`; `ProfileKind/ProfileId` null พร้อมกันก่อน bind (หรือกรณี legacy admin ที่ไม่มี employee row); **Desktop (`Channel=desktop`) bind ได้ทั้ง `student` และ `employee` (ใช้เรียน/ลองเท่านั้น ไม่มีเมนูครู/ส่งคะแนนใน Desktop ตาม decisions-025/026)**; expiry/revocation ตาม DES-004 และ DES-012 |
| StaffRole | live unique `(SchoolId,EmployeeId,Role)` เมื่อ `IsDelete=false` (กฎ live role ผ่าน transaction lock บน `(SchoolId,EmployeeId,Role)`); `ValidUntil>ValidFrom` เมื่อมีค่า; `SchoolId` คือโรงเรียนต้นสังกัดของบัญชีพนักงาน |
| TeacherGrant | (ทางสำรองตาม DES-004 — ยังไม่ได้ตัดสินให้สร้างใน `db/schoolbot_db.sql` ตาม decisions-026 และ db/review-005) หากเปิดใช้ในอนาคต: live unique `(SchoolId,TeacherId,LearnerId,Mode)` เมื่อ `IsDelete=false`; `CanAssess` ต้อง `CanView`; ผู้ให้/ผู้รับอยู่โรงเรียนเดียวกัน; `ValidUntil>ValidFrom` |
| Project | เจ้าของ (`student` หรือ `employee`)/`Mode` เปลี่ยนไม่ได้; unique `(ProjectId,Revision)` (`RULE_UNIQUE_SchoolBotProjectRevision_ProjectId_Revision`); `CurrentRevision` ชี้ `(ProjectId,Revision)` จริงใน `SchoolId` เดียวกัน (`LOGICAL_SchoolBotProject_CurrentRevision` ในเชิงตรรกะ (ไม่มี FK ใน SQL)); revision immutable; การสร้างหรือบันทึกงาน (`CommitProjectAsync` ตาม [decisions-051](../requirement/decisions-051.md)) ต้อง commit `SchoolBotProject` และ `SchoolBotProjectRevision` เป็นหน่วยเดียวกัน ห้ามเผยแพร่ Project หรือเลื่อน `CurrentRevision` ก่อน Revision commit สำเร็จ และห้ามใช้ compensation write แทนการ commit ร่วม |
| Level / PromotionPolicy | global (`SchoolId=null`); `LevelKey`, `Code`, `Ordinal` unique (`RULE_UNIQUE_SchoolBotLevel_*`); `LevelPromotionPolicy` unique `(LevelId,Revision)` (`RULE_UNIQUE_SchoolBotLevelPromotionPolicy_Level_Revision`), `Threshold` ช่วง `0..100`, Level ใหม่ต้องมี revision 1 = `70`; immutable ต่อ revision |
| Curriculum | global (`SchoolId=null`); ถอน `Curriculum.Mode`; unique `(CurriculumKey,Revision)` (`RULE_UNIQUE_SchoolBotCurriculum_Key_Revision`); อ้าง `LevelId`; published content และ children immutable; publish ต้องผ่าน four-eyes (ผู้สร้างอนุมัติเองไม่ได้ ตาม decisions-025) |
| Lesson/Mission/Activity | global (`SchoolId=null`); unique `(CurriculumId,LessonKey)`, `(CurriculumId,Ordinal)`, `(LessonId,MissionKey)`, `(LessonId,Ordinal)`, `(LessonId,ActivityKey)`, `(LessonId,Ordinal)` ของ Activity; `Activity.Type=project` ⇔ `Mode` not null (`instruction\|quiz\|test` ใช้ `Mode=null`) |
| Criteria | global (`SchoolId=null`); unique `(MissionId,Revision)` (`RULE_UNIQUE_SchoolBotCriteria_Mission_Revision`); publish ต้อง `ApprovedBy/At` ครบและ `Method` ตรง `Activity.Mode` ของ project mission; numeric rubric ต้องมี approved scorer ก่อนใช้ส่งคะแนน; immutable เมื่อถูก publish/ใช้ส่งงาน |
| QuestionBank | global (`SchoolId=null`); unique `(BankKey,Revision)` (`RULE_UNIQUE_SchoolBotQuestionBank_BankKey_Revision`); ชนิดข้อสอบรุ่นแรก `single_choice\|boolean`; publish ต้องผ่าน four-eyes; immutable เมื่อ publish |
| CourseRun / Policy / RunActivity | tenant (`SchoolId>0`); `PlanCourseIds` มี ≥1 รายการ ไม่ซ้ำ ไม่มี `NULL` และอยู่ในห้อง/เทอมของ run; มี active run (`planned\|active\|closing`) ได้หนึ่งเดียวต่อ `(SchoolId,ClassroomId,NYear,NTerm)` (กฎ active run ผ่าน transaction lock บน `(SchoolId,ClassroomId,NYear,NTerm)`) และมี successor ได้หนึ่งเดียวต่อ `PreviousRunId` (กฎ successor ผ่าน transaction lock บน CourseRun ต้นทางที่ `PreviousRunId` อ้าง); `ScoringPolicy` (ไม่มี `CurriculumId` เพราะอ่านจาก `CourseRun.CurriculumId` ตาม review-005) unique `(CourseRunId,Revision)` (`RULE_UNIQUE_SchoolBotScoringPolicy_CourseRun_Revision`) และ immutable; `CourseRunActivity` unique `(CourseRunId,ActivityId)` (`RULE_UNIQUE_SchoolBotCourseRunActivity_Run_Activity`) และ `ClosesAt>OpensAt` เมื่อมีทั้งคู่ |
| Submission / GradingJob | tenant (`SchoolId>0`); ใน schema ปัจจุบันอนุญาตเฉพาะนักเรียน (`ProfileKind=student`, `LearnerId=sId`) โดย application ต้องตรวจว่า `ProjectRevisionId` เป็นของ `SchoolBotProject` ที่ `OwnerKind='student'`, `OwnerId=LearnerId` และ `SchoolId` เดียวกัน (เพื่อป้องกัน `sEmp` ของครูบน Desktop ชนกับ `sId` นักเรียน — ดูข้อเสนอทางเลือกใน `db/proposal-learnerkind.md`), ตรวจว่า `CriteriaId` เป็นของ `MissionId` เดียวกัน และ `Project.Mode` ตรง `Activity.Mode` ของ mission นั้น; `GradingJob` unique `SubmissionId` (`RULE_UNIQUE_SchoolBotGradingJob_SubmissionId`) |
| Assessment | tenant (`SchoolId>0`); การสร้างผลประเมินใหม่ต้องล็อกแถวแม่ `SchoolBotSubmission` (`SELECT ... FOR UPDATE`) เพื่อกำหนด `Sequence` ถัดไปและตรวจว่า `SupersedesId` อยู่ `SubmissionId` เดียวกันและ `SchoolId` เดียวกัน (ใน SQL ตัด `RULE_UNIQUE_SchoolBotAssessment_Submission_Sequence` ตาม review-005); `CurrentAssessmentId` ชี้ผลล่าสุด (ตรวจในแอป ไม่ใช่ FK); `EarnedScore/MaxScore` ต้อง null พร้อมกัน หรือ `0<=EarnedScore<=MaxScore` และ `MaxScore>0`; automatic มี `GraderVersion` และ `AssessorId=null`; teacher กลับกัน |
| Attempt / RetakeGrant | tenant (`SchoolId>0`); ใน schema ปัจจุบันอนุญาตเฉพาะนักเรียน (`ProfileKind=student`, `LearnerId=sId` ในห้องของ `CourseRun`) เพื่อกัน `sEmp` ครูชน `sId` นักเรียน; ก่อนเริ่ม `Attempt` ต้องล็อกแถว/counter ของผู้เรียนเพื่อตรวจเพดานและกำหนด `Sequence` ถัดไป (ใน SQL ตัด `RULE_UNIQUE_SchoolBotAttempt_Learner_Seq` ตาม review-005), `Snapshot` immutable; `RetakeGrant` เพิ่มสิทธิ์สอบซ่อม 1 ครั้งต่อใบ โดยสอบซ่อม Test ใช้คะแนนสูงสุดระหว่างครั้งจริงกับครั้งซ่อม ไม่มีเพดาน (decisions-025) |
| GradeSlot / ScoreMapping | tenant (`SchoolId>0`); หนึ่ง active `GradeSlot` ต่อ `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` เมื่อ `RetiredAt=null` (กฎ ownership ผ่าน transaction lock บน `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` — **ไม่กรอง `IsDelete=false` เพื่อห้ามหลบ ownership ด้วย soft-delete**); หนึ่ง active `ScoreMapping` ต่อ `(CourseRunId,GradeSlotId)` เมื่อ `RetiredAt=null` และ `IsDelete=false` (กฎ active mapping ผ่าน transaction lock บน `(CourseRunId,GradeSlotId)` ร่วมกับ lock ช่อง ownership) |
| Preview / Export / Outbox | tenant (`SchoolId>0`); CourseRun/Policy/Slot/Mapping/Preview/Export/Outbox ต้องอยู่ `SchoolId` เดียวกัน (ตรวจใน application คู่กับ single-column FK ชี้ PK ตาม review-005; `ScoreOutbox` ไม่เก็บ `ScorePreviewId` ซ้ำซ้อน); unique `(ScorePreviewId,LearnerId)` (`RULE_UNIQUE_SchoolBotScorePreviewItem_Preview_Learner`), unique `ScoreExport.ScorePreviewId` (`RULE_UNIQUE_SchoolBotScoreExport_ScorePreviewId`), unique `Outbox.OperationKey` (`RULE_UNIQUE_SchoolBotScoreOutbox_OperationKey`), unique `(ScoreExportId,ScorePreviewItemId)` (`RULE_UNIQUE_SchoolBotScoreOutbox_Export_Item`); immutable snapshot ห้ามแก้ business data แม้ workflow `State/UpdateDate` เปลี่ยน; ห้าม hard delete ของ receipt linkage, preview ที่ยืนยัน หรือผลประเมินเพื่อทำให้ส่งซ้ำได้ |
| LevelProposal | tenant (`SchoolId>0`); หนึ่ง finalized proposal (`promoted\|retained\|max_level`) ต่อ `CourseRunId` (กฎ finalized proposal ผ่าน transaction lock บน `CourseRunId` ต้นทาง) และ `SuccessorRunId` ไม่ซ้ำ (กฎ successor ไม่ซ้ำผ่าน transaction lock บน CourseRun ที่ `SuccessorRunId` อ้าง); snapshot immutable |
| Release | unique `(SchoolId,VersionText,Channel,Platform)` รวม null-global; application/repository serialize ด้วย transaction lock บน `(global,VersionText,Channel,Platform)` หรือ `(tenant,SchoolId,VersionText,Channel,Platform)` แล้วตรวจซ้ำก่อนเขียน ไม่มี partial unique index บังคับ |
| Idempotency | unique `(SchoolId,Principal,Operation,RequestKey)` โดย transaction lock แยก global/tenant; `NonceHash` เมื่อมีต้องไม่ซ้ำทั้งระบบและมี transaction lock ของ nonce ร่วมด้วย ตรวจ request hash/replay/expiry/สิทธิ์ภายใต้ lock ตามสัญญาเดิม; ผล, domain mutation และ audit commit ใน transaction เดียวกันบน SchoolBot DB ไม่มี partial unique index บังคับ |
| Audit | append-only; `Event` เป็นชื่อ operation ใน DES; ไม่มี `PreviousVersion`/`NewVersion` (decisions-030); `Reason` ไม่เก็บ key/token/claims ทั้งก้อน/password/source นักเรียน; common columns ยังครบ |

**กฎ Foreign Key, การแยก DB และการ Re-check ก่อน Commit (decisions-027, 029, review-005):**
- ใน `db/schoolbot_db.sql` คง PRIMARY KEY32; ไม่มี UNIQUE/FK/CHECK. application ต้องตรวจแถวอ้างอิง ความไม่ซ้ำ SchoolId และ MissionId/CriteriaId เอง ไม่ใช้ FK หรือ constraint error เป็นหลักประกัน
- ทุกตารางของ SchoolBot (32 ตาราง) อยู่บน **SchoolBot DB (`10.0.0.128:9499`)** จึง commit domain + `SchoolBotIdempotency` + `SchoolBotAuditEvent` แบบ atomic ใน transaction เดียวของ SchoolBot DB
- ข้อมูล legacy ใน **Master DB** และ **School DB** (`TUser`, `TEmployees`, `TCompany`, `TPlanCourse*`, `TTerm`, `TStudentClassroomHistory`) อ่านผ่าน connection แยกด้วย**บัญชี DB เดิม** (ไม่สร้าง role/GRANT ใหม่ใน School DB หรือ PGGradeDB ตาม decisions-029) จึงไม่มี transaction เดียวครอบข้าม DB; ทุกคำสั่งแก้ไขที่ขึ้นกับสิทธิ์ครู/ผู้ดูแล, รายชื่อนักเรียนในห้อง (roster) หรือสถานะภาคเรียน (term) ต้อง **re-check ข้อมูลจาก School DB (และสถานะ `SchoolBotLicense` ใน SchoolBot DB) ณ จุดก่อนเปิด/commit transaction ใน SchoolBot DB**
- การเขียนคะแนนลง **PGGradeDB** ใช้บัญชี DB เดิมผ่าน `SchoolBotScoreOutbox` + durable receipt ใน `PGTGradeAuditLog` + `xmin` CAS ของตาราง PGGradeDB ตาม [des-009.md](des-009.md) (เปิดเขียนได้หลังผ่าน release gates ทั้งห้า)

Progress เป็น read model จาก `Submission`/`Assessment`/`Attempt` ไม่มีตาราง Progress ที่แก้คะแนนเอง ผลต่าง curriculum revision ไม่รวมอัตโนมัติ

Idempotency ทั่วไปคง encrypted replay window 24 ชั่วโมง; **ข้อยกเว้นเฉพาะ create-license** 15 นาที (ผู้ใช้อนุมัติตาม decisions-046), `ReplayUntil ≤ CompletedAt+900 วินาที` ตาม [DES-002](des-002.md). ตอนอ่านต้องตรวจเวลาฝั่ง server: `now >= ReplayUntil` คืน `409 IDEMPOTENCY_EXPIRED` พร้อม `details.resource_id` เมื่อเปิดเผยได้ แม้ purge ยังไม่รัน. ล้าง `ResultCipher`/`ResultKeyId` พร้อมกันเมื่อหมดหน้าต่าง และคง tombstone/ResourceId ป้องกันซ้ำ; ไม่ต่ออายุจาก retry และไม่ลบหลังอ่านครั้งแรก. ตรวจ Principal/RequestKey/RequestHash/สิทธิ์ปัจจุบันก่อน replay; create-license ตรวจ license ไม่ถูก revoke เพิ่มด้วย. envelope key แยกจาก DB และการหมดอายุของ backup ตาม [custody](signing-custody-001.md); ไม่อ้างว่าการล้าง live DB ลบ backup แล้ว. Retention tombstone/audit รอเจ้าของข้อมูล ไม่ purge โดยพลการ. DDL เดิม ตาราง `SchoolBotIdempotency` ใน `db/schoolbot_db.sql` รองรับโดยไม่เพิ่มคอลัมน์

## HTTP contract ร่วม

HTTP paths/JSON/status/headers ด้านล่างและใน DES-002..005/007..012 เป็น client-facing semantics ผ่าน G; G→B ใช้ gRPC ตาม [Gateway Rev3](gateway-integration-001.md). ยังไม่มี RPC/metadata/error mapping ที่ยืนยัน; ไม่แปลง HTTP status เป็น gRPC status โดยตรง. คง ETag/If-Match, idempotency และ device proof เดิม; การรักษา canonical method/path/body ข้าม G ต้องออกแบบก่อน implement. Login HTTP เดิมของ G และ local IPC/hardware ไม่เปลี่ยน.

ผลสำเร็จตามแต่ละ DES; failures:
`{error:{code:T64,message:T512,request_id:U,details:{field:T128?,current_etag:T64?,retry_after_seconds:integer≥0?,resource_id:K?}?}}`

| HTTP | Codes |
|---|---|
| 400 | INVALID_REQUEST, INVALID_INPUT, INVALID_QUERY |
| 401 / 403 | UNAUTHORIZED, SESSION_EXPIRED / FORBIDDEN, SCHOOL_MISMATCH, CHANNEL_NOT_ALLOWED, PROFILE_NOT_ALLOWED, SCHOOL_ADMIN_REQUIRED, SUBJECT_PERMISSION_REQUIRED, STAFF_ROLE_REQUIRED, ORIGIN_NOT_ALLOWED, LICENSE_REQUIRED |
| 404 / 405 | NOT_FOUND / METHOD_NOT_ALLOWED |
| 409 | IDEMPOTENCY_CONFLICT, IDEMPOTENCY_EXPIRED, STATE_CONFLICT |
| 412 / 428 | VERSION_CONFLICT / PRECONDITION_REQUIRED |
| 413 / 415 | PAYLOAD_TOO_LARGE / UNSUPPORTED_MEDIA_TYPE |
| 426 / 429 | UPGRADE_REQUIRED / RATE_LIMITED |
| 500 / 503 | INTERNAL_ERROR / SERVICE_UNAVAILABLE, ADMIN_NOT_CONFIGURED, AUTH_NOT_CONFIGURED, AUTH_UNAVAILABLE |

Domain codes จาก `DES-001..012` ใช้ envelope เดียวกัน Unknown fields/duplicate JSON keys ถูกปฏิเสธ; ห้ามตัดสินจาก message. Requests มี `X-Request-Id:U`; mutation มี `Idempotency-Key:U` (ยกเว้น login/web-sessions/logout ตาม DES-004/012).

**Optimistic Concurrency ด้วย `UpdateDate` (ยืนยันตาม [decisions-030.md](../requirement/decisions-030.md)):**
- ไม่มีคอลัมน์ `Version` ในตาราง SchoolBot; server ส่ง header `ETag` (และฟิลด์ `update_date:D` ใน body) โดยค่า `ETag` เป็น opaque string ที่เข้ารหัสจาก `UpdateDate` ความละเอียดระดับ microsecond ของ `timestamptz`
- ทุกคำสั่งแก้ไขแถวเดิมต้องส่ง header `If-Match: "<ETag>"` (ขาด header คืน `428 PRECONDITION_REQUIRED`); client **ห้าม parse ค่า ETag เป็นวันที่** (เช่น `new Date()` ของ JS ที่ตัดความละเอียดเหลือ millisecond)
- Server ทำ `UPDATE ... SET ..., "UpdateDate" = clock_timestamp() WHERE "SchoolBot<Entity>Id" = @id AND "UpdateDate" = @expected` (ห้ามใช้ `now()` เพื่อให้การแก้ซ้ำใน transaction เดียวได้ค่าใหม่เสมอ และห้ามรับ `UpdateDate` จาก client); หากได้ 0 แถว คืน `412 VERSION_CONFLICT` พร้อม `details.current_etag`

SchoolBot ไม่ส่ง `Access-Control-Allow-*` (ไม่เปิด CORS); request ที่มี header `Origin` นอก allow-list คืน `403 ORIGIN_NOT_ALLOWED`. ปิด `/v1/admin/*` static bearer และใช้ `/v2/admin/*` ด้วย `staff_admin` session ตาม [decisions-025.md](../requirement/decisions-025.md) และ [decisions-026.md](../requirement/decisions-026.md).

SchoolBot resource IDs ใช้ `K`; legacy ใช้ `I`; logical keys ใช้ `U`. JSON `K` รับ integer เท่านั้น; path/query ใช้ canonical decimal; ผิดชนิด/ช่วงคืน `400 INVALID_INPUT`. `IDEMPOTENCY_EXPIRED` คืน `error.details.resource_id:K?` เมื่อเปิดเผยได้.

List: `limit` 1–100 ค่าเริ่ม 50, `cursor` opaque; คืน `{items:[],next_cursor:string|null}` โดย cursor ผูก actor/school/filter.

Control body ≤64 KiB; project/submission/curriculum/question-bank body ≤2 MiB และ project document ≤1 MiB; response ≤2 MiB ต้องรักษาขอบเขตที่ client/G/B; gRPC message limits และ mapping ยัง design pending ไม่เท่ากับขนาด JSON โดยอัตโนมัติ และไม่ยก limit ของ engine ตาม HTTP.

## Change Log

- 2026-11-02 — Rev11: ใบงาน094 ออก delta ตาม [decisions-051](../requirement/decisions-051.md) และ [project-commit-proposal-001](project-commit-proposal-001.md) (ทาง A): กำหนดกฎห้ามเผยแพร่ `SchoolBotProject` หรือเลื่อน `CurrentRevision` ก่อน `SchoolBotProjectRevision` commit สำเร็จในหน่วยเดียวกัน (`CommitProjectAsync`) และห้ามใช้ compensation write เป็นหลักประกัน atomicity; ไม่แก้ schema/AC/TP

- 2026-10-26 — ตั้ง CreateBy/CreateDate/UpdateBy/UpdateDate เป็น nullable DEFAULT NULL ทุกตาราง

- 2026-10-26 — ตามคำสั่งเหลือเฉพาะ PK: ถอน UNIQUE/FK/CHECK จากร่าง SQL; ความสัมพันธ์และ validation เดิมเป็นกฎฝั่ง application ไม่ใช่การบังคับในฐานข้อมูล

- 2026-10-26 — Rev9: ถอน standalone indexes ตามคำสั่งผู้ใช้ คง PK/UQ/FK และกฎธุรกิจ; application/repository locks ทดแทนยัง NOT_IMPLEMENTED ไม่มี runtime evidence
- 2026-10-24 — Rev8: ใบงาน060a ระบุข้อยกเว้น replay TTL เฉพาะ create-license และ cleanup คู่ฟิลด์; schema/transport/gates คงเดิม
- 2026-10-24 — Rev7: ระบุ HTTP semantics ฝั่ง client G; ไม่เปลี่ยน schema/status/device proof
- 2026-10-23 — Rev6: sync032..034/review-006; SQL เดิม
- 2026-10-22 — Rev5: sync ตาม `db/schoolbot_db.sql` (32 ตาราง), `db/review-005.md` และมติ decisions-027..030; ปรับ placement เป็น SchoolBot DB (10.0.0.128:9499) คู่กับการอ่าน School DB/PGGradeDB ด้วยบัญชี DB เดิมและ re-check ก่อน commit; เปลี่ยน optimistic concurrency จาก `Version` เป็น `UpdateDate` (`clock_timestamp()`, opaque `ETag`/`If-Match`); ปรับกฎ single-column FK + application tenant check และตัด `UQ_SchoolBotAssessment_Submission_Sequence` / `UQ_SchoolBotAttempt_Learner_Seq` / `ScoringPolicy.CurriculumId`
- 2026-10-22 — Rev4: sync ตามมติอนุมัติ decisions-026 (รวม amendment-proposal-001/002 และแก้ 2 จุดตาม decisions-025: school_web ต้องมี License active ของโรงเรียน, Desktop bind ได้ทั้ง student และ employee); เพิ่มกฎ global/tenant uniqueness, CourseRun/Attempt/Retake/GradeSlot/Mapping/Preview/Export/Outbox/LevelProposal, กฎ Origin/Channel และการปิด /v1/admin
- 2026-10-21 — Rev3: แยก resource K จาก request/idempotency U
- 2026-10-21 — Rev2: session/isolation และ single-DB commit
- 2026-10-21 — MYCELIUM แยก constraints และ HTTP จากคำตอบ SA Rev1 โดยคงข้อเสนอและสัญญาเดิม

- 2026-10-26 — แก้ป้าย create-license TTL 15 นาทีตาม decisions-046 (แก้ตาม sweep); ไม่เปลี่ยน logic/ผลทดสอบ/สมมติฐานอื่น
