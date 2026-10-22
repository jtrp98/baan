# กฎข้อมูลและ HTTP contract ร่วม — Rev4

แยกจาก logical data contract ของ SA เพื่อคุมขนาดเอกสาร ชนิด `K`, `I`, `U`, `N`, `Tn` และตารางอ้าง [data-model.md](data-model.md) (CONFIRMED baseline ตาม [decisions-026.md](../requirement/decisions-026.md))

## Relations / uniqueness / invariants

| กลุ่ม | กฎ |
|---|---|
| License | `KeyHash` unique ทั้งระบบ; `CurrentBindingId` ต้องเป็น binding ของ License/School เดียวกันและ `DetachedAt=null`; มี current ได้หนึ่งเดียว; **ทั้งช่อง `desktop` และช่อง `school_web` ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ไม่หมดอายุและ `RevokedAt=null`)** โดยช่อง `school_web` ไม่ต้องมี device binding (decisions-025/026) |
| Binding | unique `(LicenseId,Epoch)`; active binding (`DetachedAt=null, IsDelete=false`) มีได้ไม่เกินหนึ่งต่อ License; epoch เพิ่มเมื่อเปลี่ยน binding; `LastEntitlementExpiresAt` ≤ `License.ExpiresAt` และ `LastCheckedAt+259200` วินาที |
| Identity/Session | `TokenHash` unique; `Channel` ∈ `desktop\|school_web\|staff_admin`; `Channel=desktop` ⇔ `DeviceJkt` not null และ `AccountId` not null; `Channel IN ('school_web','staff_admin')` ⇒ `DeviceJkt=null`; `ProfileKind/ProfileId` null พร้อมกันก่อน bind (หรือกรณี legacy admin ที่ไม่มี employee row); **Desktop (`Channel=desktop`) bind ได้ทั้ง `student` และ `employee` (ใช้เรียน/ลองเท่านั้น ไม่มีเมนูครู/ส่งคะแนนใน Desktop ตาม decisions-025/026)**; expiry/revocation ตาม DES-004 และ DES-012 |
| StaffRole | live unique `(SchoolId,EmployeeId,Role)` เมื่อ `IsDelete=false`; `ValidUntil>ValidFrom` เมื่อมีค่า; `SchoolId` คือโรงเรียนต้นสังกัดของบัญชีพนักงาน |
| TeacherGrant | (ทางสำรองตาม DES-004 — ยังไม่ได้ตัดสินให้สร้างตาม decisions-026) live unique `(SchoolId,TeacherId,LearnerId,Mode)` เมื่อ `IsDelete=false`; `CanAssess` ต้อง `CanView`; ผู้ให้/ผู้รับอยู่โรงเรียนเดียวกัน; `ValidUntil>ValidFrom` |
| Project | เจ้าของ (`student` หรือ `employee`)/`Mode` เปลี่ยนไม่ได้; unique `(ProjectId,Revision)`; `CurrentRevision` ต้องมี revision จริง; revision immutable |
| Level / PromotionPolicy | global (`SchoolId=null`); `LevelKey`, `Code`, `Ordinal` unique; `LevelPromotionPolicy` unique `(LevelId,Revision)`, `Threshold` ช่วง `0..100`, Level ใหม่ต้องมี revision 1 = `70`; immutable ต่อ revision |
| Curriculum | global (`SchoolId=null`); ถอน `Curriculum.Mode`; unique `(CurriculumKey,Revision)` ภายใต้ global scope; อ้าง `LevelId`; published content และ children immutable; publish ต้องผ่าน four-eyes (ผู้สร้างอนุมัติเองไม่ได้ ตาม decisions-025) |
| Lesson/Mission/Activity | global (`SchoolId=null`); unique `(CurriculumId,LessonKey)`, `(CurriculumId,Ordinal)`, `(LessonId,MissionKey)`, `(LessonId,Ordinal)`, `(LessonId,ActivityKey)`, `(LessonId,Ordinal)` ของ Activity; `Activity.Type=project` ⇔ `Mode` not null (`instruction\|quiz\|test` ใช้ `Mode=null`) |
| Criteria | global (`SchoolId=null`); unique `(MissionId,Revision)`; publish ต้อง `ApprovedBy/At` ครบและ `Method` ตรง `Activity.Mode` ของ project mission; numeric rubric ต้องมี approved scorer ก่อนใช้ส่งคะแนน; immutable เมื่อถูก publish/ใช้ส่งงาน |
| QuestionBank | global (`SchoolId=null`); unique `(BankKey,Revision)`; ชนิดข้อสอบรุ่นแรก `single_choice\|boolean`; publish ต้องผ่าน four-eyes; immutable เมื่อ publish |
| CourseRun / Policy / RunActivity | tenant (`SchoolId>0`); `PlanCourseIds` มี ≥1 รายการ ไม่ซ้ำ และอยู่ในห้อง/เทอมของ run; มี active run (`planned\|active\|closing`) ได้หนึ่งเดียวต่อ `(SchoolId,ClassroomId,NYear,NTerm)` และมี successor ได้หนึ่งเดียวต่อ `PreviousRunId`; `ScoringPolicy` unique `(CourseRunId,Revision)` และ immutable; `CourseRunActivity` unique `(CourseRunId,ActivityId)` และ `ClosesAt>OpensAt` เมื่อมีทั้งคู่ |
| Submission | tenant (`SchoolId>0`); learner `P` ตรง `(SchoolId,student,OwnerId)`, `OwnerKind=student`; อ้าง published global `Mission`/`Criteria`; project `Mode` ตรง `Activity.Mode` ของ mission นั้น |
| Assessment | tenant (`SchoolId>0`); unique `(SubmissionId,Sequence)`; `SupersedesId` อยู่ submission เดิม; `CurrentAssessmentId` ชี้ผลล่าสุด; `EarnedScore/MaxScore` ต้อง null พร้อมกัน หรือ `0<=EarnedScore<=MaxScore` และ `MaxScore>0`; automatic มี `GraderVersion` และ `AssessorId=null`; teacher กลับกัน |
| Attempt / RetakeGrant | tenant (`SchoolId>0`); `Attempt` unique `(SchoolId,CourseRunId,ActivityId,LearnerId,Sequence)`, `Snapshot` immutable; `RetakeGrant` เพิ่มสิทธิ์สอบซ่อม 1 ครั้งต่อใบ โดยสอบซ่อม Test ใช้คะแนนสูงสุดระหว่างครั้งจริงกับครั้งซ่อม ไม่มีเพดาน (decisions-025) |
| GradeSlot / ScoreMapping | tenant (`SchoolId>0`); หนึ่ง active `GradeSlot` ต่อ `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` เมื่อ `RetiredAt=null` (**ไม่กรอง `IsDelete=false` เพื่อห้ามหลบ ownership ด้วย soft-delete**); หนึ่ง active `ScoreMapping` ต่อ `(CourseRunId,GradeSlotId)` เมื่อ `RetiredAt=null` และ `IsDelete=false` |
| Preview / Export / Outbox | tenant (`SchoolId>0`); CourseRun/Policy/Slot/Mapping/Preview/Export/Outbox ต้องอยู่ `SchoolId` เดียวกัน; unique `(ScorePreviewId,LearnerId)`, unique `ScoreExport.ScorePreviewId`, unique `Outbox.OperationKey`, unique `(ScoreExportId,ScorePreviewItemId)`; immutable snapshot ห้ามแก้ business data แม้ workflow `State/Version` เปลี่ยน; ห้าม hard delete ของ receipt linkage, preview ที่ยืนยัน หรือผลประเมินเพื่อทำให้ส่งซ้ำได้ |
| LevelProposal | tenant (`SchoolId>0`); หนึ่ง finalized proposal (`promoted\|retained\|max_level`) ต่อ `CourseRunId` และ `SuccessorRunId` ไม่ซ้ำ; snapshot immutable |
| Release | unique `(SchoolId,VersionText,Channel,Platform)` รวม null-global ด้วย partial unique index แยกจาก tenant rows; ไม่ให้ null semantics เปิดช่องซ้ำ |
| Idempotency | unique `(SchoolId,Principal,Operation,RequestKey)` (แยก global/tenant partial unique index) และ `NonceHash` เมื่อมี; ผลกับ domain mutation commit transaction เดียวกัน |
| Audit | append-only; `Event` เป็นชื่อ operation ใน DES; `Reason` ไม่เก็บ key/token/claims ทั้งก้อน/password/source นักเรียน; common columns ยังครบ |

Legacy lookup รวม `SchoolId`/kind; ไม่มี physical FK ข้าม DB. ทุก atomic domain+idempotency+audit commit ใช้ transaction ใน School DB เดียวตาม placement; การเขียนคะแนนลง PGGradeDB ใช้ `SchoolBotScoreOutbox` + durable receipt ใน `PGTGradeAuditLog` + `xmin` CAS ตาม [des-009.md](des-009.md) (เปิดเขียนได้หลังผ่าน release gates ทั้งห้าและอนุมัติ `007_pggradedb_grants.sql`).

Progress เป็น read model จาก `Submission`/`Assessment`/`Attempt` ไม่มีตาราง Progress ที่แก้คะแนนเอง ผลต่าง curriculum revision ไม่รวมอัตโนมัติ

Idempotency เก็บ encrypted response 24 ชั่วโมง หลังนั้นลบเฉพาะ ciphertext (`UPDATE ResultCipher = NULL`) และเก็บ tombstone ป้องกันสร้างซ้ำ; retry เก่าได้ `IDEMPOTENCY_EXPIRED` พร้อม `resource_id` เมื่อเปิดเผยได้ Retention ของ tombstone/audit รอเจ้าของข้อมูล ไม่ purge โดยพลการ

## HTTP contract ร่วม

ผลสำเร็จตามแต่ละ DES; failures:
`{error:{code:T64,message:T512,request_id:U,details:{field:T128?,current_version:N?,retry_after_seconds:integer≥0?,resource_id:K?}?}}`

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

Domain codes จาก `DES-001..012` ใช้ envelope เดียวกัน Unknown fields/duplicate JSON keys ถูกปฏิเสธ; ห้ามตัดสินจาก message. Requests มี `X-Request-Id:U`; mutation มี `Idempotency-Key:U` (ยกเว้น login/web-sessions/logout ตาม DES-004/012); resource update มี `If-Match:"Version"`.

SchoolBot ไม่ส่ง `Access-Control-Allow-*` (ไม่เปิด CORS); request ที่มี header `Origin` นอก allow-list คืน `403 ORIGIN_NOT_ALLOWED`. ปิด `/v1/admin/*` static bearer และใช้ `/v2/admin/*` ด้วย `staff_admin` session ตาม [decisions-025.md](../requirement/decisions-025.md) และ [decisions-026.md](../requirement/decisions-026.md).

SchoolBot resource IDs ใช้ `K`; legacy ใช้ `I`; logical keys ใช้ `U`. JSON `K` รับ integer เท่านั้น; path/query ใช้ canonical decimal; ผิดชนิด/ช่วงคืน `400 INVALID_INPUT`. `IDEMPOTENCY_EXPIRED` คืน `error.details.resource_id:K?` เมื่อเปิดเผยได้.

List: `limit` 1–100 ค่าเริ่ม 50, `cursor` opaque; คืน `{items:[],next_cursor:string|null}` โดย cursor ผูก actor/school/filter.

Control body ≤64 KiB; project/submission/curriculum/question-bank body ≤2 MiB และ project document ≤1 MiB; response ≤2 MiB ต้องแก้ทั้ง proxy/API/host ให้ตรงกัน ไม่ยก limit ของ engine ตาม HTTP.

## Change Log
- 2026-10-22 — Rev4: sync ตามมติอนุมัติ decisions-026 (รวม amendment-proposal-001/002 และแก้ 2 จุดตาม decisions-025: school_web ต้องมี License active ของโรงเรียน, Desktop bind ได้ทั้ง student และ employee); เพิ่มกฎ global/tenant uniqueness, CourseRun/Attempt/Retake/GradeSlot/Mapping/Preview/Export/Outbox/LevelProposal, กฎ Origin/Channel และการปิด /v1/admin
- 2026-10-21 — Rev3: แยก resource K จาก request/idempotency U
- 2026-10-21 — Rev2: session/isolation และ single-DB commit
- 2026-10-21 — MYCELIUM แยก constraints และ HTTP จากคำตอบ SA Rev1 โดยคงข้อเสนอและสัญญาเดิม
