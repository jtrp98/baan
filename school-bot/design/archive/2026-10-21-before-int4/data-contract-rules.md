# กฎข้อมูลและ HTTP contract ร่วม — Rev2

แยกจาก logical data contract ของ SA เพื่อคุมขนาดเอกสาร ชนิด `U`, `N`, `Tn` และตารางอ้าง [data-model.md](data-model.md)

## Relations / uniqueness / invariants

| กลุ่ม | กฎ |
|---|---|
| License | KeyHash unique ทั้งระบบ; CurrentBindingId ต้องเป็น binding ของ License/School เดียวกันและ DetachedAt=null; มี current ได้หนึ่งเดียว |
| Binding | unique `(LicenseId,Epoch)`; epoch เพิ่มเมื่อเปลี่ยน binding; ExpiresAt ของ entitlement ≤ License.ExpiresAt และ LastCheckedAt+259200 วินาที |
| Identity/Session | TokenHash unique; ProfileKind/ProfileId null พร้อมกันก่อน bind; ค่า non-null ประกอบ P ที่ verify แล้ว; AccountId แยกจาก profile; expiry/revocation ตาม DES-004 |
| TeacherGrant | live unique `(SchoolId,TeacherId,LearnerId,Mode)`; CanAssess ต้อง CanView; ผู้ให้/ผู้รับอยู่โรงเรียนเดียวกัน; ValidUntil>ValidFrom |
| Project | เจ้าของ/Mode เปลี่ยนไม่ได้; unique `(ProjectId,Revision)`; CurrentRevision ต้องมี revision จริง; revision immutable |
| Curriculum | unique `(SchoolId,CurriculumKey,Revision)`; published content และ children immutable |
| Lesson/Mission | unique `(CurriculumId,LessonKey)`, `(CurriculumId,Ordinal)`, `(LessonId,MissionKey)`, `(LessonId,Ordinal)` |
| Criteria | unique `(MissionId,Revision)`; publish ต้อง ApprovedBy/At ครบและ Method ตรง Mode; immutable เมื่อถูก publish/ใช้ส่งงาน |
| Submission | learner P ตรง (SchoolId,student,OwnerId), OwnerKind=student; mode ตรง curriculum; criteria อยู่ mission |
| Assessment | unique `(SubmissionId,Sequence)`; SupersedesId อยู่ submission เดิม; CurrentAssessmentId ชี้ผลล่าสุด; automatic มี GraderVersion และ AssessorId=null; teacher กลับกัน |
| Job | unique SubmissionId; worker ใช้ lease+Version; commit ผลได้เพียง worker ที่ถือ lease ปัจจุบัน |
| Release | unique `(SchoolId,VersionText,Channel,Platform)` รวม null-global แบบ unique จริง; ไม่ให้ null semantics เปิดช่องซ้ำ |
| Idempotency | unique `(SchoolId,Principal,Operation,RequestKey)` และ NonceHash เมื่อมี; ผลกับ domain mutation commit transaction เดียวกัน |
| Audit | append-only; Event เป็นชื่อ operation ใน DES; Reason ไม่เก็บ key/token/source นักเรียน; common columns ยังครบ |

Legacy lookup รวม SchoolId/kind; ไม่มีการรับรอง external FK จาก EF mapping ทุก atomic domain+idempotency+audit commit ใช้ transaction ใน School DB เดียวตาม placement ที่เสนอ ห้ามแยก audit ไป Logs โดยอ้าง atomic; หากเปลี่ยนต้องออก outbox contract ก่อน ไม่ครอบคลุม legacy reads ข้าม DB; login/logout ยกเว้นกฎ headers ตาม DES-004

Progress เป็น read model จาก Submission/Assessment ไม่มีตาราง Progress ที่แก้คะแนนเอง ผลต่าง curriculum revision ไม่รวมอัตโนมัติ

Idempotency เก็บ encrypted response 24 ชั่วโมงตามข้อเสนอ หลังนั้นลบเฉพาะ ciphertext และเก็บ tombstone ป้องกันสร้างซ้ำ; retry เก่าได้ `IDEMPOTENCY_EXPIRED` พร้อม resource_id เมื่อเปิดเผยได้ Retention ของ tombstone/audit รอเจ้าของข้อมูล ไม่ purge โดยพลการ

## HTTP contract ร่วม

ผลสำเร็จตามแต่ละ DES; failures:
`{error:{code:T64,message:T512,request_id:U,details:{field:T128?,current_version:N?,retry_after_seconds:integer≥0?}?}}`

| HTTP | Codes |
|---|---|
| 400 | INVALID_REQUEST, INVALID_INPUT, INVALID_QUERY |
| 401 / 403 | UNAUTHORIZED / FORBIDDEN, SCHOOL_MISMATCH |
| 404 / 405 | NOT_FOUND / METHOD_NOT_ALLOWED |
| 409 | IDEMPOTENCY_CONFLICT, IDEMPOTENCY_EXPIRED, STATE_CONFLICT |
| 412 / 428 | VERSION_CONFLICT / PRECONDITION_REQUIRED |
| 413 / 415 | PAYLOAD_TOO_LARGE / UNSUPPORTED_MEDIA_TYPE |
| 426 / 429 | UPGRADE_REQUIRED / RATE_LIMITED |
| 500 / 503 | INTERNAL_ERROR / SERVICE_UNAVAILABLE, ADMIN_NOT_CONFIGURED |

Domain codes เพิ่มใน DES โดยใช้ envelope เดียวกัน Unknown fields/duplicate JSON keys ถูกปฏิเสธ; ห้ามตัดสินจาก message Requests มี `X-Request-Id:U`; mutation มี `Idempotency-Key:U`; resource update มี `If-Match:"Version"`

List: `limit` 1–100 ค่าเริ่ม 50, `cursor` opaque; คืน `{items:[],next_cursor:string|null}` โดย cursor ผูก actor/school/filter

Control body ≤64 KiB; project/submission/curriculum body ≤2 MiB และ project document ≤1 MiB; response ≤2 MiB ต้องแก้ทั้ง proxy/API/host ให้ตรงกัน ไม่ยก limit ของ engine ตาม HTTP

## Change Log
- 2026-10-21 — Rev2: session/isolation และ single-DB commit
- 2026-10-21 — MYCELIUM แยก constraints และ HTTP จากคำตอบ SA Rev1 โดยคงข้อเสนอและสัญญาเดิม
