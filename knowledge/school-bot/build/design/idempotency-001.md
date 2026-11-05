# สัญญา idempotency ส่วนกลาง

> Rev 4 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 097 — BE-028 importer เป็นผู้ใช้รายที่สามของ helper เดิม ด้วย Operation `import_curriculum_lessons`)

adapter จองคำสั่ง/ตรวจ replay และ commit ผลพร้อม domain/audit; ผู้ใช้ปัจจุบันคือ BE-027 (หลักสูตรกลาง: create, metadata, content, publish), BE-028 (นำเข้า Course Plan ลง draft) และ BE-030 (คลังข้อสอบ: create, PUT draft, publish) [ขอบเขตทดสอบ/การย้าย](data-contract-rules-cross-database.md#การพิสูจน์และขอบเขตการย้าย)

คงฟิลด์ [SchoolBotIdempotency](data-dictionary/table-004.md) และ [กฎความไม่ซ้ำ](data-contract-rules-grades.md) ไม่เปลี่ยน schema/DBML ของ ledger ข้อ 1–4 เป็นแบบที่ต้องทำ Rev3 เพิ่มผู้ใช้ BE-030 และ Rev4 เพิ่มผู้ใช้ BE-028 โดยไม่แก้ helper, ชื่อ Operation, สูตร hash หรือ bytes ของไฟล์ของ BE-027 จึงคงพฤติกรรม Rev2 และเส้นชัย BE-027 ตาม AC-043-01 (สิทธิ์แก้หลักสูตรกลาง), AC-044-03 (อนุมัติก่อนเผยแพร่), AC-044-05 (ฉบับเผยแพร่ไม่ถูกแก้ทับ); ชี้วิธีพิสูจน์โดยไม่เพิ่มกฎให้ writer หลักฐาน source อยู่ท้ายไฟล์

## 1. ขอบเขตและผลตอบ

ใช้ `(SchoolId, Principal, Operation, RequestKey)`; SchoolId=NULL คือส่วนกลาง แยกจากโรงเรียนเลขบวก Principal จาก server มี namespace ช่องทาง/ชนิดผู้กระทำ ไม่รับจาก body หรือเทียบ account/student/employee ด้วยเลขอย่างเดียว

BE-027 ใช้ SchoolId=NULL และ Principal=`staff_admin:{PrincipalId}` จาก session ที่ผ่านสิทธิ์ เทียบ Principal/Operation แบบ ordinal; RequestKey เทียบ UUID ที่ parse แล้ว Operation คงชื่อ `create_curriculum`, `update_curriculum_metadata`, `update_curriculum_content`, `publish_curriculum`

BE-030 ใช้ SchoolId=NULL และ Principal รูปเดียวกัน Operation `create_question_bank`, `update_question_bank_draft`, `publish_question_bank` ledger เป็นชุดเดียวกับ BE-027 (Operation อยู่ใน tuple จึงไม่ชนกัน) สิทธิ์ เงื่อนไข และ audit ของแต่ละ operation อยู่ใน [การเก็บบน stub store ของ DES-010](des-010-stub-persistence.md#2-mutation-ของคลังผ่าน-helper-ส่วนกลางเดิม)

BE-028 ใช้ SchoolId=NULL และ Principal รูปเดียวกัน Operation `import_curriculum_lessons` ผ่าน `CommitMutationAsync` เดิมของหลักสูตร RequestHash สูตรเดียวกับ content (`id + "|" + JsonSerializer.Serialize(request)`) ผลสำเร็จ 200 ResourceId = curriculum id ทุกผลสำเร็จบันทึก ledger แม้ไม่มีแถวใหม่ (`unchanged` ทั้ง batch) ledger กันเฉพาะ tuple ของคำขอ ส่วนการกันนำเข้าแถวเดิมด้วย key ใหม่เป็น domain dedup ใน `mutate` ตาม [สัญญา importer](des-005-import.md#2-operation-ของ-importer-และการกันนำเข้าซ้ำ) ไม่ใช่หน้าที่ ledger

| กรณีหลังตรวจสิทธิ์ปัจจุบัน | ผลบังคับ |
|---|---|
| tuple/hash เดิม ยัง replay ได้ | คืน status/body/resource ID/ETag เดิม ไม่ mutate หรือเพิ่ม domain audit |
| tuple เดิม hash ต่าง แม้หมดอายุแล้ว | `409 IDEMPOTENCY_CONFLICT` ไม่เปิดเผยผลเดิม |
| UUID เดิม แต่ actor, operation หรือ SchoolId ต่าง | คนละขอบเขต ทำคำสั่งของตนตามสิทธิ์/domain rules ไม่ค้นหรือคืนผลของอีกขอบเขต |
| tuple/hash เดิม หมดหน้าต่าง | `409 IDEMPOTENCY_EXPIRED`; resource_id เฉพาะเมื่อเห็นได้ ไม่ทำซ้ำ |
| สิทธิ์ถูกถอน/session หมดอายุ | error สิทธิ์เดิมของ endpoint ก่อนเปิดเผย replay |

ตัวอย่างสมมติ: A/B ใช้ UUID เดียวได้ผลของตน; revision ซ้ำยังถูก domain uniqueness ปฏิเสธ

**คำตัดสิน actor ต่าง:** ไม่ยอมรับ `IDEMPOTENCY_CONFLICT` เพียงเพราะ UUID ชนอีก actor และไม่รับทั้งสองแบบเป็นทางเลือก ต้องทำตาม domain rules ของ scope ใหม่; การไม่คืน replay คนอื่นอย่างเดียวไม่พอหากปฏิเสธ scope ใหม่ผิดเหตุผล

check ปรับ `AuthorizedActorCannotReceiveAnotherActorsReplay`: create revision ซ้ำคาด `409 STATE_CONFLICT`; metadata/content บน draft เดิมด้วย ETag ก่อน A แก้คาด `412 VERSION_CONFLICT`; publish ให้ใช้ `ApprovalRef` ต่างจากครั้งแรกเพื่อทดสอบ `409 STATE_CONFLICT` ทั้งสี่ fixture ที่ถูกปฏิเสธไม่เพิ่ม domain/audit/ledger โค้ดเดิมมี domain no-op เมื่อเผยแพร่แล้วด้วย `ApprovalRef` เดิม จึงห้ามใช้ body เท่ากันตัดสินว่าอ่าน replay ข้าม actor; ไม่เพิ่มกฎให้ writer เปลี่ยน no-op นี้ ทดสอบ scope ใหม่บนคนละ resource และ operation ต่างตาม TP001-085 (แยกขอบเขตคำสั่ง) ต่อไป

RequestHash เป็น SHA-256 ของ UTF-8 ตัวพิมพ์เล็ก 64 ตัว BE-027 คงสูตรเดิม: create ใช้ `JsonSerializer.Serialize(request)`; metadata/content ใช้ `id + "|" + JsonSerializer.Serialize(request)`; publish ใช้ `id + "|" + ApprovalRef` BE-030 ใช้สูตรเดียวกัน (create / PUT draft / publish ด้วย `approval_ref`) ใช้ Data Transfer Object (DTO)/options เดิมรวม nested data ไม่รวมเวลาปัจจุบัน/request ID/token; If-Match เป็น precondition ของ mutation ใหม่ ไม่ตรวจ stale ETag ก่อน replay ที่ถูกต้อง

## 2. คำขอซ้อน

เลือก **รอ store lock** รองรับ CancellationToken แล้วอ่านผลใหม่ก่อน domain preconditions เมื่อคำขอแรก commit: hash เดิม replay; hash ต่าง conflict ไม่คืน STATE_CONFLICT เพราะ revision ถูกสร้างแล้ว ถ้า rollback ทั้งหน่วย ผู้รอจึงเริ่ม mutation ได้

ใช้ cancellation/deadline เดิม ไม่เพิ่ม code/pending row ยกเลิกผู้รอไม่ยกเลิกคำขอแรกหรือข้าม lock response ขาดหลัง commit ให้ retry tuple/hash เดิม ห้ามลบผลที่ commit แล้ว

**คำตัดสินลำดับทดสอบ:** `ConcurrentCreateReservesKeyBeforeCommitting` ต้องพัก A ใต้ store lock → เริ่ม B → ยืนยัน B ถูกส่งเข้า commit และยังไม่จบ → ปล่อย A → รอทั้งคู่ภายใน timeout; ปลด barrier ใน finally เสมอ ห้ามรอ B จบก่อนปล่อย A เพราะ B เป็นผู้รอ hash เดิมต้องสำเร็จทั้งคู่ด้วยผลเดิม; hash ต่าง A สำเร็จ B ได้ `409 IDEMPOTENCY_CONFLICT`; domain/audit/ledger เพิ่มหนึ่ง success ไม่เพิ่ม conflict/in-progress เพื่อให้ test เดิมจบ

## 3. Interface และหน่วย atomic

เพิ่ม `IIdempotentSchoolBotCommit` ใน Application abstractions ให้ adapter จัดหา คง `ISchoolBotDbAdapter`/เมธอดเก่า ไม่บังคับแก้ consumer/fakes ทั้งหมด signature:

```csharp
Task<IdempotentCommitResult<T>> CommitWithIdempotencyAsync<T>(
    IdempotencyCommand command,
    Func<ISchoolBotDbAdapter, int?, DateTimeOffset,
        CancellationToken, Task> recheckAccess,
    Func<ISchoolBotDbAdapter, DateTimeOffset,
        CancellationToken, Task<MutationResult<T>>> mutate,
    CancellationToken ct = default);
```

| ชนิด/สมาชิก | ความหมาย |
|---|---|
| `IdempotencyCommand` | record: `int? SchoolId`, `string Principal`, `string Operation`, `Guid RequestKey`, `string RequestHash`; ขนาด/NULL ตาม dictionary; BE-027 ไม่ใช้ nonce |
| `MutationResult<T>` | record: `T Body`, `int HttpStatus`, `int? ResourceId`, `string? ETag`; ผลตาม endpoint เดิม NULL เมื่อไม่มี resource/ETag |
| `IdempotentCommitResult<T>` | record: `MutationResult<T> Result`, `bool Replayed`; bool ใช้ภายใน ไม่เพิ่ม HTTP field |
| `recheckAccess` | รับ adapter ของหน่วยนี้, resource ID ของผลเดิมหรือ NULL, เวลา UTC สดและ ct; ตรวจ session/channel/role/ownership/สิทธิ์เปิดเผยผล ไม่ mutate |
| `mutate` | รับ adapter ของหน่วยนี้ เวลา UTC สดและ ct; ตรวจ preconditions จาก state สด แล้วเรียก domain/audit เดิมเฉพาะเมื่อไม่มี tuple |

store ถือ lock จน commit: อ่าน snapshot สด → lookup tuple รวม tombstone/IsDelete → recheckAccess ด้วย TimeProvider สด → เทียบ hash → ตรวจ expiry → replay หรือ domain checks/mutate → เข้ารหัสผล → commit domain+audit+idempotency → ปลด lock บันทึกเฉพาะ success; errors ใช้ [envelope เดิม](data-contract-rules-http.md)

callback รับ transaction-scoped facade: อ่าน snapshot เดียว เขียน candidate ห้าม root adapter/commit ซ้อน/network/hardware effect exception ก่อน commit ไม่เหลือทั้งสามส่วน ไม่ publish cache ก่อนเก็บสำเร็จ

**คำตัดสินจุดดัก:** check ใช้ test wrapper ที่รองรับทั้ง `ISchoolBotDbAdapter` และ `IIdempotentSchoolBotCommit`; forward commit ไป target แล้วครอบ callback `mutate` ให้พักหลังได้ store lock ก่อนเรียก callback จริงด้วย facade ที่ target ส่งมา จุดนี้พิสูจน์ก่อน commit โดยไม่เรียก root mutation; proxy เฉพาะ interface เก่าหรือพักก่อนเข้า commit ไม่พิสูจน์ TP001-084 (คำขอซ้อนใต้ lock) writer ไม่ต้องบังคับเส้นทางใหม่ผ่าน root proxy หรือเพิ่ม production hook

check ปรับ `CurriculumGateProxy` และ `PendingPublishPreservesAnotherHostsNewRevision` ที่ใช้ helper ร่วมด้วย: ถ้าพักใต้ lock ให้เริ่ม create revision ใหม่ แล้วปล่อย publish ก่อนรอ create จบ; หากต้องการให้ create จบก่อนปล่อย publish ตาม TP001-061 (สอง instance รักษาทั้งสอง revision) ให้พัก publish **ก่อนเข้า store lock** และแยกจุดดักนี้จาก TP001-084

ห้าม wrapper ที่ commit ก่อนจำผลหรือ fallback ไป dictionary ทุก snapshot writer รวมคำขอภายในไม่มี key ต้องใช้ coordination เดียวและรักษา ledger; ไม่มี key ไม่รับประกัน replay

## 4. การเก็บผลและทางเลือก

store กำหนด CompletedAt/ReplayUntil ตอนจบ ResultCipher/ResultKeyId เก็บ encrypted MutationResult รวม body/ETag; HttpStatus/ResourceId ตรงผล ไม่เก็บ plaintext อายุ/tombstone ตาม [กฎ replay](data-contract-rules-cross-database.md#อายุและความลับของผล-replay)

File เพิ่ม `idempotency` ใน `curricula_snapshot.json` พร้อม domain/audit สมาชิกตาม dictionary; domain ของ BE-030 (`question_banks` และชุดที่อ่านอย่างเดียว) อยู่ในไฟล์เดียวกันจึง commit ครั้งเดียวกับ audit/ledger โดยไม่ต้องทำ helper แบบ generic; bytes เป็น base64 เวลา UTC ไม่มี collection อ่านเป็นว่างแต่กู้ key ใน process ไม่ได้ Memory swap ทั้งชุดใต้ lock เดียว fake cipher เฉพาะ tests; production ใช้ custody เดิม encode/serialize ล้มต้อง fail ก่อน commit; decode ล้มคืน STATE_CONFLICT ไม่ mutate ซ้ำ

| ทางเลือก | คำตัดสิน/ต้นทุน |
|---|---|
| รอใต้ store lock | เลือก: retry ได้ผลเดิม แลกกับเวลารอ |
| ตอบ 409 ระหว่าง in-flight | ไม่เลือก: hash เดิมต้อง replay |
| dictionary/service lock/ledger คนละไฟล์ | ไม่เลือก: ผูก process หรือหลุด atomic |
| เพิ่ม pending column/unique index | ไม่เลือก: stub ไม่ต้องใช้ เปลี่ยนต้องผ่านคน/vault |
| ย้ายทุก consumer | ไม่เลือก: ขยาย regression งานที่ผ่านแล้ว ย้าย BE-027 ก่อน |

**แบ่งงาน:** writer ทำข้อ 1–4 ครบสี่ operation บน memory/file store ร่วม เลิก static ledger และคง Projects/License; ไม่แก้ Independent tests ส่วน check แก้ actor assertions/fixture, ลำดับรอ และ wrapper ตามข้อ 1–3 แล้วพิสูจน์ setup/ผลเดิมใน oracle pack ไม่ลดเหลือ service เดียวหรือย้าย barrier ออกนอก lock ของกรณีคำขอซ้อน

## หลักฐาน

Source ตรวจ 2026-11-03 ใต้ `C:/src/schoolbright/target/school-bot/web/src/`:

- `SchoolBot.Application/Curriculum/CurriculumService.cs:25,50,103,107,134,208,375` — ตอนออกแบบ Rev2 (ก่อน BE-027 ย้าย) ยังใช้ static lookup/commit/จำผลแยกกัน; สูตร hash เดิมคงไว้
- `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Curriculum.cs:178,227,230,285,289,383,402` — create ซ้ำได้ STATE_CONFLICT; draft ที่ ETag เก่าได้ VERSION_CONFLICT; publish ตรวจ lifecycle ก่อน ETag
- `SchoolBot.Infrastructure/Persistence/FileSchoolBotBackingStore.cs:13–14` และ `FileSchoolBotBackingStore.Curriculum.cs:23–49` — lock ต่อ directory แบบ static และ replace snapshot ด้วย temp + `File.Move`; `MemorySchoolBotBackingStore.Curriculum.cs:17–30` — swap ใต้ lock ของ object
- ตรวจซ้ำสำหรับ BE-030 วันที่ 2026-11-03: `CurriculumStoreSnapshot.cs:34` มี `idempotency` แล้ว, `SchoolBotDbAdapter.Idempotency.cs:40–73` คือ helper ส่วนกลางที่ BE-027 ใช้อยู่ และ `SchoolBot.Application/Curriculum/CurriculumService.Commit.cs:20–39` สร้าง `IdempotencyCommand` ด้วย Principal `staff_admin:{PrincipalId}`
- `SchoolBot.Application/Abstractions/ISchoolBotDbAdapter.cs:8,52` — interface เดิมมี mutation แต่ไม่มีเมธอด commit กลาง; `SchoolBot.Domain/ErrorCodes.cs:28` — codes เดิม
- `../db/schoolbot_db.sql:92` — DDL เดิม ไม่มี pending state/composite unique constraint; ไม่มี schema delta ใน Rev2
- `SchoolBot.Application/Curriculum/CurriculumService.cs:396` และ `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Curriculum.cs:383` — published + ApprovalRef เดิมคืน domain no-op; ApprovalRef ต่างได้ STATE_CONFLICT

หลักฐานเกณฑ์ ภายใต้ `C:/src/schoolbright/` ตรวจ 2026-11-03:

- `target/school-bot/web/tests/SchoolBot.Tests/IndependentCurriculumReworkTests.cs:102,114,143,157,187,195,214` — assertion actor, proxy interface เก่า และรอ B ก่อนปล่อย A ทั้ง create/publish
- `reports/school-bot/normal-096/pack-B-BE-027.txt` §1–4 — AC และ Rev1 ที่ตรึง; TP001-084–087 กำหนด actor scope/รอใต้ lock/facade อยู่แล้ว; `sys-B.out` ส่วนท้าย — writer หยุดก่อนแก้โค้ดเพราะเกณฑ์ขัดกัน
