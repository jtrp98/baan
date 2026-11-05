# LUX-07 — typed HTTP API Gateway → SchoolBot gRPC service manifest delta

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

รายการ RPC/package และ prefix ด้านล่างเป็นข้อเสนอรุ่นก่อน ไม่ตรง proto ปัจจุบันที่มี CurriculumService/AssessmentService ใน package ServiceSchoolBot และ versionless routes รายการที่ยังไม่มี RPC ไม่ถือว่า implementแล้ว อ่าน [contract ปัจจุบัน](gateway-grpc-contract-001.md) และ [หลักฐาน/ข้อแตกต่าง](gateway-integration-evidence.md)

เอกสารนี้เป็นสัญญาทางเทคนิคสำหรับพัฒนาและทดสอบ local โดยใช้ขอบเขตและเงื่อนไขหยุดร่วมเดิม ยังไม่ใช่การอนุมัติ schema หรือหลักฐาน runtime ของระบบจริง

คง `SchoolBotSession.proto` และ wire fields เดิมทุกตัว เพิ่มภายหลังเป็นไฟล์ learning แยก เช่น `SchoolBotLearning.proto`, package `schoolbot.learning.v2` โดย SchoolBot gRPC service เป็นเจ้าของ ไม่ copy/redefine session error messages

Remote Procedure Call (RPC) และ Data Transfer Object (DTO) ด้านล่างเป็น manifest draft สำหรับ owner review; `Q=/api/service-school-bot/v2`:

| HTTP หลัง Q | RPC ที่เสนอ | สำเร็จ |
|---|---|---|
| `GET /admin/curricula` | `SchoolBotContentService.ListCurricula` | 200 list |
| `GET /admin/curricula/{id}` | `GetCurriculum` | 200 detail + ETag |
| `POST /admin/curricula` | `CreateCurriculum` | 201 |
| `PUT /admin/curricula/{id}` | `UpdateCurriculumMetadata` | 200 + ETag |
| `PUT /admin/curricula/{id}/content` | `ReplaceCurriculumContent` | 200 + ETag |
| `POST /admin/curricula/{id}/publish` | `PublishCurriculum` | 200; storage gate |
| `GET /admin/question-banks` | `ListQuestionBanks` | 200 list |
| `GET /admin/question-banks/{id}` | `GetQuestionBank` | 200 detail + ETag |
| `POST /admin/question-banks` | `CreateQuestionBank` | 201 |
| `PUT /admin/question-banks/{id}` | `ReplaceQuestionBankDraft` | 200 + ETag |
| `POST /admin/question-banks/{id}/publish` | `PublishQuestionBank` | 200; storage gate |
| `GET /course-runs/{id}/activities/{activity_id}` | `SchoolBotLearningService.GetActivityPolicy` | 200 |
| `POST /attempts` | `StartAttempt` | 201 + ETag |
| `GET /attempts` | `ListAttempts` | 200 list |
| `GET /attempts/{id}` | `GetAttempt` | 200 + ETag |
| `PUT /attempts/{id}/answers` | `SaveAttemptAnswers` | 200 + ETag |
| `POST /attempts/{id}/submit` | `SubmitAttempt` | 200 + ETag |
| `GET /progress` | `GetProgress` | 200 |
| `GET /learners/{id}/progress` | `GetLearnerProgress` | 200 |
| `GET /level-proposals/{id}` | `GetLevelProposal` | 200 + ETag |
| `GET /level-proposals/{id}/snapshot` | `GetLevelProposalSnapshot` | 200 + ETag |

แต่ละ RPC มี request/reply ที่ระบุชื่อ fields ตามสัญญาย่อยข้างต้นและ DTO เดิมของ DES ไม่รับ arbitrary method/path/JSON blob; route อื่น เช่น policy writes/retake/proposal confirm ยังคงต้องมี exact manifest ของงานนั้นก่อนเปิด ไม่ได้เปิดโดยรายการนี้

Wire mapping:

- K/I/N → int32 โดยตรวจ range/presence; U/H/DecimalString → string ที่ตรวจ canonical format
- nullable scalar ใช้ explicit presence; D → Timestamp รักษา microsecond
- `ActivityConfig` ใช้ typed variants; Text/Question/Answer/Policy ใช้ named messages ไม่ใช้ `Struct` เป็นทางลัด
- `if-match`/`idempotency-key` ส่ง lossless metadata; ETag ส่ง `schoolbot-etag`; replay รักษา HTTP status/body/ETag เดิม
- เพิ่ม allowlist codes ตาม domain: `ANSWER_INVALID` → InvalidArgument/400; expiry/state/policy conflicts → Aborted/409; `GRADER_UNAVAILABLE` → Unavailable/503; 412/428 ใช้ mapping เดิม
- malformed trailer/response ห้ามเดา code จาก message; deadline หลัง mutation คือ outcome unknown ไม่ใช่ rollback
- GET ที่อาจเรียก expiry recovery เช่น List/GetAttempt ต้องระบุพฤติกรรมนี้ใน manifest; ห้าม auto-retry เพียงเพราะ HTTP verb เป็น GET ก่อนพิสูจน์ finalizer idempotence
- mutation ไม่ auto-retry; caller ใช้ key เดิมและ GET read-back ตามผล unknown

**ผู้รับผิดชอบที่ต้องตรวจสัญญา**

- **SchoolBot gRPC service:** DTO/validation/authorization/transaction, proto/codegen และ compatibility
- **HTTP API Gateway (`sb-api-gateway`):** exact routes, method allowlist, metadata, deadlines, limits, error mapping และ no-store
- **Light:** protected pipeline/opaque-session exception, tenant spoofing, middleware/interceptor changes, logs และ public/private exposure
- H5/infra: transport peer/private reachability ตาม gate เดิม

ทำ local DTO/mapper fixtures ได้ แต่ยังไม่อ้าง HTTP API Gateway/Light/SchoolBot gRPC service review ผ่าน ไม่เปิด generic proxy, public SchoolBot gRPC service หรือ production registration

## ชนิดข้อมูลที่ใช้

ชนิดย่ออ้าง [สัญญาชนิดข้อมูลกลาง](data-dictionary/contract-001.md): `K` คือรหัส int4 ช่วง 1–2147483647; `I` คือ signed int32; `N` คือ integer ≥1; `U` คือ UUID; `B` คือ boolean; `D` คือเวลา UTC; `H` คือ SHA-256 hex 64 ตัว; `Tn` คือ Unicode string ยาวไม่เกิน n; `A` คือตัวตนผู้ทำรายการตามช่องทาง; `?`/`null` คือค่าว่าง และ `[]` คือ array ส่วน `DecimalString` เป็นเลขฐานสิบไม่ติดลบใน JSON string ไม่เกินหกตำแหน่งทศนิยม

## หลักฐาน

- E01 — ที่มาของขอบเขตและเงื่อนไขร่วม: planning/arch-091-learning-001.md (memory) เอกสารนี้คงข้อเสนอเดิม ไม่ได้ตรวจ source หรือ runtime ใหม่
