# LUX-07 — typed G→B manifest delta — Rev1

วันที่2026-10-26 · archCodexT1 runGN9DS5 · technicalproposal/localcontract ไม่schemaapproval/runtimeproof. ใช้sharedboundaryและstoplines (memory: planning/arch-091-learning-001.md)ร่วมกับสัญญานี้.

คง `SchoolBotSession.proto` และ wire fields เดิมทุกตัว เพิ่มภายหลังเป็นไฟล์ learning แยก เช่น `SchoolBotLearning.proto`, package `schoolbot.learning.v2` โดย B เป็นเจ้าของ ไม่ copy/redefine session error messages

ชื่อด้านล่างเป็น manifest draft สำหรับ owner review; `Q=/api/school-bot/service/v2`:

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

**owner ที่ต้อง review จริง**

- **B:** DTO/validation/authorization/transaction, proto/codegen และ compatibility
- **G:** exact routes, method allowlist, metadata, deadlines, limits, error mapping และ no-store
- **Light:** protected pipeline/opaque-session exception, tenant spoofing, middleware/interceptor changes, logs และ public/private exposure
- H5/infra: transport peer/private reachability ตาม gate เดิม

ทำ local DTO/mapper fixtures ได้ แต่ยังไม่อ้าง G/Light/B review ผ่าน ไม่เปิด generic proxy, public B หรือ production registration

## Change Log

- 2026-10-26 — นายช่างสกัดสัญญาย่อยจากarchGN9DS5; schema/sourceidentity/owner/H5 gatesคงอยู่ ไม่เพิ่มfieldphysicalbaselineหรือexecuteSQL.
