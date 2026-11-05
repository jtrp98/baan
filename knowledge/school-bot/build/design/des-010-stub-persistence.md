# DES-010 — การเก็บคลังข้อสอบ, CourseRunActivity และ Attempt บน stub store

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (BE-030 — คลังข้อสอบ revision/policy ส่วนกลางต้องมีที่เก็บบน memory/file store และใช้ idempotency ส่วนกลาง)

ส่วนต่อของ [DES-010 — Question Bank, Attempt และนโยบายคะแนน](des-010.md)

ไฟล์นี้กำหนดว่า Question Bank, CourseRun, CourseRunActivity และ Attempt เก็บที่ไหนใน backing store ที่ใช้ระหว่างพัฒนา (`MemorySchoolBotBackingStore` และ `FileSchoolBotBackingStore`) ก่อนมี PostgreSQL จริง และ mutation ของคลังข้อสอบใช้ [idempotency ส่วนกลาง](idempotency-001.md) อย่างไร ไม่เพิ่มตาราง คอลัมน์ state หรือ API ใหม่: ทุก record สะท้อนตารางที่มีอยู่แล้วใน `schoolbot_db.sql` และ [แบบข้อมูล](data-model.md)

## 1. ที่เก็บ: ขยาย snapshot หลักสูตรเดิมเป็นหน่วยเดียว

**คำตัดสิน:** เพิ่ม collection สี่ชุดต่อท้าย `CurriculumStoreSnapshot` (ไฟล์ `curricula_snapshot.json` ตัวเดิม) ไม่สร้าง snapshot หรือไฟล์ใหม่

| key ใน JSON | record (namespace `SchoolBot.Domain.Assessment`) | ตาราง | งานที่เขียน |
|---|---|---|---|
| `question_banks` | `SchoolBotQuestionBankRecord` | `SchoolBotQuestionBank` | BE-030 (create/PUT/publish) |
| `course_runs` | `SchoolBotCourseRunRecord` | `SchoolBotCourseRun` | BE-029 ในอนาคต; BE-030 อ่านอย่างเดียว |
| `course_run_activities` | `SchoolBotCourseRunActivityRecord` | `SchoolBotCourseRunActivity` | BE-029/BE-032 ในอนาคต; BE-030 อ่านอย่างเดียว |
| `attempts` | `SchoolBotAttemptRecord` | `SchoolBotAttempt` | BE-031 ในอนาคต; BE-030 อ่านอย่างเดียว |

เหตุผลหลัก: audit (`audit_events`) และ ledger (`idempotency`) อยู่ใน snapshot นี้แล้ว การเก็บ bank ไว้ที่เดียวกันทำให้ bank + audit + ledger + ผล idempotency ลงในการ swap (memory) หรือ `File.Move` (file) ครั้งเดียวโดยไม่ต้องแก้ helper ที่ BE-027 ผ่านแล้ว ชื่อไฟล์ `curricula_snapshot.json` คงเดิมแม้เนื้อหากว้างขึ้น เพราะเปลี่ยนชื่อมีต้นทุน regression โดยไม่ได้ประโยชน์

**รูป record** — ชื่อ property ตรงชื่อคอลัมน์ใน DDL ทุกตัว (รวม `IsDelete`, `CreateBy`, `CreateDate`, `UpdateBy`, `UpdateDate`, `SchoolId`) ตามแบบ `SchoolBotCurriculumRecord` เดิม:

- `timestamptz` → `DateTimeOffset`/`DateTimeOffset?`; `numeric(18,6)` → `decimal`/`decimal?`; `integer[]` → `IReadOnlyList<int>`; `SchoolId` ของ QuestionBank เป็น `int?` (ส่วนกลาง = NULL) ส่วนสามตารางที่เหลือเป็น `int` (โรงเรียน)
- jsonb ที่เป็นรายการมีโครงสร้างใช้ชนิดจริง: `Questions` = `IReadOnlyList<QuestionBankQuestion>` ตามรูป `Question` ใน [โครงสร้างคำถาม](des-010-question-bank.md#โครงสร้างคำถาม); `Title` = `string` แบบ curriculum
- jsonb ที่เป็น object เก็บเป็น JSON string แบบ `SchoolBotActivityRecord.Config`: `PolicyOverride` (`AssessmentPolicy` หรือ NULL), `Snapshot` (`AttemptSnapshot` ตาม [contract-003](data-dictionary/contract-003.md)), `Answers` (`Answer[]`)

**นโยบายสี่ด้านไม่มีที่เก็บใหม่:** ค่าส่วนกลางอยู่ใน `Activity.Config.default_policy` (curriculum เดิม) ค่าต่อห้องอยู่ใน `CourseRunActivity.PolicyOverride`/`OpensAt`/`ClosesAt` และ `effective_policy = PolicyOverride ?? default_policy` ตาม [Activity และนโยบายข้อสอบ](des-010-policy.md) ไม่ใช้ `SchoolBotScoringPolicy` ในงานนี้

**ความเข้ากันได้กับไฟล์เดิม:** property ใหม่มีค่า default เป็น `null` ต่อท้าย `Idempotency` และติด `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]`; `Empty` และ `Format = 1` คงเดิม ผู้อ่านใช้ `?? []` เสมอ ผลคือ snapshot ของ BE-027 ที่ไม่มีข้อมูลชุดใหม่ serialize เป็น bytes เดิม และไฟล์เก่าที่ไม่มี key อ่านได้เป็นรายการว่าง `CommitCurriculumUnitAsync` และ `MutateCurriculumUnitAsync` เดิมใช้ `current with {...}` อยู่แล้วจึงไม่ทำข้อมูลชุดใหม่หาย

**การอ่าน/reopen:** adapter ไม่ cache สี่ collection นี้ — ทุกการอ่านเรียก `LoadCurriculumUnitAsync()` ใหม่ ดังนั้น adapter ตัวที่สอง reader ตัวที่สาม และ `FileSchoolBotBackingStore` ที่สร้างใหม่บน directory เดิมเห็นสิ่งที่ commit แล้วทันที (file อ่านไฟล์ใต้ lock ต่อ directory ที่ใช้ร่วมทั้ง process; memory อ่าน object เดียวกัน) เมธอดอ่านที่เพิ่มใน `ISchoolBotDbAdapter` (ผู้ implement จริงมีเพียง `SchoolBotDbAdapter`; ตัวอื่นเป็น `DispatchProxy`):

| เมธอด | ผล |
|---|---|
| `GetQuestionBankByIdAsync(int id)` | แถวที่ `IsDelete=false` หรือ NULL |
| `ListQuestionBanksAsync(Guid? bankKey, string? lifecycle)` | เรียง `BankKey`, `Revision` |
| `GetCourseRunByIdAsync(int id)` | แถวหรือ NULL |
| `GetCourseRunActivityAsync(int courseRunId, int activityId)` | แถวหรือ NULL |
| `GetAttemptByIdAsync(int id)` | แถวหรือ NULL |
| `ListAttemptsAsync(int courseRunId, int? activityId, int learnerId)` | เรียง `StartedAt DESC, SchoolBotAttemptId DESC` |

## 2. Mutation ของคลังผ่าน helper ส่วนกลางเดิม

**คำตัดสิน:** ใช้ `IIdempotentSchoolBotCommit.CommitWithIdempotencyAsync` ตัวเดิม **ไม่แก้ helper และไม่ทำ helper แบบ generic** เพราะ bank อยู่ใน snapshot เดียวกับ audit/ledger แล้ว

- เมธอดเขียนใหม่ใน `ISchoolBotDbAdapter`: `CreateQuestionBankAsync(record, audit)`, `UpdateQuestionBankDraftAsync(id, title, questions, sourceRef, expectedETag, audit)`, `PublishQuestionBankAsync(id, expectedETag, audit)` ทำงานได้เฉพาะบน adapter ของหน่วย (transaction-scoped facade ที่ helper ส่งให้ callback) ถ้าเรียกบน root adapter ให้ throw `InvalidOperationException` — ไม่มีทางเขียน bank โดยไม่ผ่าน ledger
- เมธอดเหล่านี้อ่าน/เขียนผ่าน `MutateCurriculumUnitAsync` ของ store ในหน่วย ใส่ bank และ audit ลง candidate เดียวกัน; helper ต่อ ledger แล้ว commit ครั้งเดียว ID ใหม่ = ค่าสูงสุดในรายการของ snapshot นั้น + 1 (ไม่มี counter ใน adapter)
- `IdempotencyCommand`: `SchoolId = NULL`, `Principal = staff_admin:{PrincipalId}`, Operation และ RequestHash ตามตาราง (สูตรเดียวกับ BE-027):

| Endpoint | Operation | RequestHash (SHA-256 ของ) | ผลสำเร็จ |
|---|---|---|---|
| `POST /v2/admin/question-banks` | `create_question_bank` | `JsonSerializer.Serialize(request)` | 201, ResourceId = bank id |
| `PUT /v2/admin/question-banks/{id}` | `update_question_bank_draft` | `id + "\|" + JsonSerializer.Serialize(request)` | 200 |
| `POST /v2/admin/question-banks/{id}/publish` | `publish_question_bank` | `id + "\|" + approval_ref` | 200 |

ETag ของผล = `OpaqueConcurrencyToken.ToETag(UpdateDate)`; ไม่มี RequestKey ให้ใช้ `Guid.NewGuid()` แบบ BE-027 (ไม่รับประกัน replay)

- `recheckAccess`: create/PUT ต้องเป็น `staff_admin` ที่มี `content_author`; publish ต้องมี `content_approver` ใช้เวลาสดจาก helper ไม่ mutate
- `mutate` ตรวจจาก state ในหน่วย: create ซ้ำ `(BankKey, Revision)` ที่ยังไม่ลบ → `409 STATE_CONFLICT`; PUT/publish บนแถวที่ไม่ใช่ draft → `409 STATE_CONFLICT`; If-Match ไม่ตรง → `412 VERSION_CONFLICT`; ผู้อนุมัติเป็น `CreateBy`/`UpdateBy` ของร่าง → `409 FOUR_EYES_REQUIRED`; validation คำถามและ `approval_ref` ตาม [bank draft](learning-bank-draft-001.md) ตรวจก่อนเปลี่ยนข้อมูล ทุก error ไม่เขียน bank/audit/ledger
- audit หนึ่งแถวต่อ mutation ใน `audit_events` เดิม: `EntityType = SchoolBotQuestionBank`, Event `QuestionBank.Created` / `QuestionBank.Updated` / `QuestionBank.Published`; Reason ของ Published = `approval_ref` ตรงตัว
- publish เปลี่ยนเฉพาะแถว bank (`Lifecycle = published`, `PublishedAt`, `UpdateBy`, `UpdateDate`) **ไม่แตะ** `Activity.Config.bank_id`, CourseRun, CourseRunActivity หรือ Attempt — Attempt เดิมอ่าน `Snapshot` ของตัวเองเสมอ

## 3. ข้อมูลตั้งต้นของ test (seeded fixture)

- builder อยู่ในโปรเจกต์ test เท่านั้น สร้าง `CurriculumStoreSnapshot` ทั้งก้อนตาม setup ของ TP001-063 (อ่าน policy ที่กำหนด) และ TP001-064 (revision ใหม่ไม่เปลี่ยนประวัติ) แล้วเขียน **ครั้งเดียวก่อนสร้าง service/adapter** ด้วย `((ICurriculumBackingStore)store).MutateCurriculumUnitAsync((_, _) => Task.FromResult(new CurriculumStoreMutation<bool>(seed, true)))`
- memory: เขียนลง store object ที่ทุก adapter ใช้ร่วม; file: เขียนผ่าน `FileSchoolBotBackingStore` ตัวใดก็ได้ของ directory นั้น store ตัวที่สองและ reader อ่านจากไฟล์
- ใน seed ใส่ curriculum/lesson/activity (Config มี `bank_id` ของ v1 และ `default_policy` ตามค่าที่ test กำหนด), bank v1 published, CourseRun ของโรงเรียน (`Lifecycle = active`, `CurrentPolicyId = NULL`), CourseRunActivity ที่มี window และ `PolicyOverride = NULL`, Attempt พร้อม `Snapshot` ที่ตรึง bank/curriculum revision 1, audit ตามจำนวนที่ test กำหนด และ `idempotency = []` ค่า `policy_id`/`evaluator_version` ใน AttemptSnapshot เป็นค่าของ fixture งานนี้ไม่ตรวจว่ามีแถว ScoringPolicy
- ห้าม seed ผ่าน HTTP, service หรือเมธอดเขียนของ adapter และห้ามเพิ่ม ledger ใน seed; production ไม่มีเส้นทาง seed
- ไม่ลงทะเบียน worker/finalizer ใน harness เพื่อให้การอ่านหลังเลยเวลาปิดพิสูจน์เฉพาะการอ่าน Snapshot

## 4. stub รับประกันอะไร และอะไรรอ PostgreSQL จริง

| stub รับประกัน (ใน process เดียว) | รอ PostgreSQL (DBA-003 / G-CORE) |
|---|---|
| bank + audit + ledger + ผลเข้ารหัสลงพร้อมกันหรือไม่ลงเลย | transaction/row lock จริง (`SELECT … FOR UPDATE` ของ bank revision) และ isolation ข้าม host |
| store หลายตัวบน directory เดียวใน process เดียวรอ lock เดียวกัน | lock ข้าม process บนไฟล์เดียวกัน — ไม่รองรับ |
| reopen/adapter ใหม่อ่านกลับครบจากไฟล์หรือ object เดิม | identity `GENERATED ALWAYS`, `UpdateDate = clock_timestamp()`, ชนิด jsonb/numeric จริง |
| ความไม่ซ้ำ `(BankKey, Revision)` และกฎ draft/ETag ตรวจใน application | การ map key ใน snapshot → ตารางจริง และ durability (fsync) |
| Attempt เดิมไม่เปลี่ยนเมื่อมี bank revision ใหม่ | roster/สิทธิ์ครูจาก School DB จริง (stub ใช้ authority fake ที่เป็น test config เท่านั้น) |

ทั้งหมดนี้ไม่ใช่หลักฐาน schema หรือ runtime acceptance และไม่ปิด gate DBA-003/G-CORE

## ทางเลือกที่ไม่เลือก

| ทางเลือก | เหตุผลที่ไม่เลือก |
|---|---|
| snapshot/ไฟล์ใหม่ (`learning_snapshot.json`) + helper generic ต่อ snapshot | audit/ledger อยู่ใน curriculum snapshot; แยกไฟล์ต้อง commit สองไฟล์ (หลุด atomic) หรือย้าย ledger (แก้ BE-027 ที่ผ่านแล้ว) |
| เก็บเฉพาะ bank ไม่เก็บ CourseRun/CourseRunActivity/Attempt | อ่าน window/policy ต่อห้องและประวัติ Attempt หลัง reopen ไม่ได้ |
| cache ใน adapter แบบ curriculum | reader ตัวที่สาม/store ที่สองเห็นข้อมูลเก่า; โหลดสดง่ายกว่าและพอสำหรับ stub |
| เปลี่ยน `Format` เป็น 2 | ไม่มีผู้อ่านตรวจ format; property ใหม่เป็น optional อยู่แล้ว |

## หลักฐาน

Source ตรวจ 2026-11-03 ใต้ `C:/src/schoolbright/target/school-bot/web/`:

- `src/SchoolBot.Infrastructure/Persistence/ISchoolBotBackingStore.cs:8–43` — ไม่มีเมธอด Question Bank/CourseRun/Attempt
- `src/SchoolBot.Infrastructure/Persistence/CurriculumStoreSnapshot.cs:26–37` — snapshot มี curriculum, audit และ `idempotency` (default null) ในหน่วยเดียว
- `src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Idempotency.cs:40–73` — helper ส่ง adapter บน memory store ชั่วคราว แล้ว commit `candidate` (ทุก field ของ snapshot) + ledger ครั้งเดียว
- `src/SchoolBot.Infrastructure/Persistence/FileSchoolBotBackingStore.cs:13–14,21` และ `FileSchoolBotBackingStore.Curriculum.cs:23–49,97–106` — lock ต่อ directory แบบ static, เขียน temp แล้ว `File.Move`, commit เดิมใช้ `current with {...}`
- `src/SchoolBot.Infrastructure/Persistence/MemorySchoolBotBackingStore.Curriculum.cs:17–30` — swap ใต้ lock ของ object
- `src/SchoolBot.Application/Curriculum/CurriculumService.Commit.cs:20–21` — Principal `staff_admin:{PrincipalId}` และ `Guid.NewGuid()` เมื่อไม่มี key
- `tests/SchoolBot.Tests/IndependentCurriculumFixture.cs:24,35–60` — แบบอย่าง memory object เดียว/file store ใหม่ต่อครั้ง และอ่านเทียบ snapshot
- ไม่พบ `QuestionBank`, `CourseRun` หรือ `Attempt` ใน `src/` และ `tests/`
- `knowledge/school-bot/build/db/schoolbot_db.sql:347–363,372–390,410–424,490–511` — คอลัมน์ของสี่ตารางที่ record สะท้อน
- `knowledge/school-bot/build/design/data-dictionary/contract-003.md:16,21,43` — `CourseRunState`, `AttemptState`, `AttemptSnapshot`
