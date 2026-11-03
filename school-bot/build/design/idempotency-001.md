# สัญญา idempotency ส่วนกลาง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (รวมการกันคำขอซ้ำที่ adapter/backing store)

adapter จองคำสั่ง/ตรวจ replay และ commit ผลพร้อม domain/audit; BE-027 (หลักสูตรกลาง) ใช้ทั้ง create, metadata, content, publish ในครั้งนี้ [ขอบเขตทดสอบ/การย้าย](data-contract-rules-cross-database.md#การพิสูจน์และขอบเขตการย้าย)

คงฟิลด์ [SchoolBotIdempotency](data-dictionary/table-004.md) และ [กฎความไม่ซ้ำ](data-contract-rules-grades.md) ไม่เปลี่ยน schema/DBML ข้อ 1–4 เป็นแบบที่ต้องทำ หลักฐาน source อยู่ท้ายไฟล์

## 1. ขอบเขตและผลตอบ

ใช้ `(SchoolId, Principal, Operation, RequestKey)`; SchoolId=NULL คือส่วนกลาง แยกจากโรงเรียนเลขบวก Principal จาก server มี namespace ช่องทาง/ชนิดผู้กระทำ ไม่รับจาก body หรือเทียบ account/student/employee ด้วยเลขอย่างเดียว

BE-027 ใช้ SchoolId=NULL และ Principal=`staff_admin:{PrincipalId}` จาก session ที่ผ่านสิทธิ์ เทียบ Principal/Operation แบบ ordinal; RequestKey เทียบ UUID ที่ parse แล้ว Operation คงชื่อ `create_curriculum`, `update_curriculum_metadata`, `update_curriculum_content`, `publish_curriculum`

| กรณีหลังตรวจสิทธิ์ปัจจุบัน | ผลบังคับ |
|---|---|
| tuple/hash เดิม ยัง replay ได้ | คืน status/body/resource ID/ETag เดิม ไม่ mutate หรือเพิ่ม domain audit |
| tuple เดิม hash ต่าง แม้หมดอายุแล้ว | `409 IDEMPOTENCY_CONFLICT` ไม่เปิดเผยผลเดิม |
| UUID เดิม แต่ actor, operation หรือ SchoolId ต่าง | คนละขอบเขต ทำคำสั่งของตนตามสิทธิ์/domain rules ไม่ค้นหรือคืนผลของอีกขอบเขต |
| tuple/hash เดิม หมดหน้าต่าง | `409 IDEMPOTENCY_EXPIRED`; resource_id เฉพาะเมื่อเห็นได้ ไม่ทำซ้ำ |
| สิทธิ์ถูกถอน/session หมดอายุ | error สิทธิ์เดิมของ endpoint ก่อนเปิดเผย replay |

ตัวอย่างสมมติ: A/B ใช้ UUID เดียวได้ผลของตน; revision ซ้ำยังถูก domain uniqueness ปฏิเสธ

RequestHash เป็น SHA-256 ของ UTF-8 ตัวพิมพ์เล็ก 64 ตัว BE-027 คงสูตรเดิม: create ใช้ `JsonSerializer.Serialize(request)`; metadata/content ใช้ `id + "|" + JsonSerializer.Serialize(request)`; publish ใช้ `id + "|" + ApprovalRef` ใช้ DTO/options เดิมคงที่รวม nested data ไม่รวมเวลาปัจจุบัน/request ID/token; If-Match เป็น precondition ของ mutation ใหม่ ไม่ตรวจ stale ETag ก่อน replay ที่ถูกต้อง

## 2. คำขอซ้อน

เลือก **รอ store lock** โดยรองรับ CancellationToken แล้วอ่านผลใหม่ก่อนตรวจ domain preconditions คำขอแรก commit สำเร็จ: hash เดิมต้อง replay; hash ต่างต้อง conflict ไม่คืน STATE_CONFLICT เพียงเพราะ revision ถูกสร้างแล้ว ถ้าคำขอแรก rollback ทั้งหน่วยและไม่มีผลบันทึก ผู้รอจึงเริ่ม mutation ได้

ใช้ cancellation/deadline เดิม ไม่เพิ่ม code/pending row ยกเลิกผู้รอไม่ยกเลิกคำขอแรกหรือข้าม lock response ขาดหลัง commit ให้ retry tuple/hash เดิม ห้ามลบผลที่ commit แล้ว

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

backing store เป็นเจ้าของ lock/จุด commit จริง ลำดับใต้ lock: อ่าน snapshot สด → re-check สิทธิ์ด้วย TimeProvider สด → lookup tuple รวม tombstone/IsDelete → เทียบ hash → ตรวจ expiry/สิทธิ์ resource → replay หรือทำ domain checks/mutation → สร้างและเข้ารหัสผล → commit domain+audit+idempotency พร้อมกัน → ปลด lock

callback รับ transaction-scoped facade: อ่าน snapshot เดียว เขียน candidate ห้าม root adapter/commit ซ้อน/network/hardware effect exception ก่อน commit ไม่เหลือทั้งสามส่วน ไม่ publish cache ก่อนเก็บสำเร็จ

ห้าม wrapper ที่ commit ก่อนจำผลหรือ fallback ไป dictionary ทุก snapshot writer รวมคำขอภายในไม่มี key ต้องใช้ coordination เดียวและรักษา ledger; ไม่มี key ไม่รับประกัน replay

## 4. การเก็บผลและทางเลือก

CompletedAt/ReplayUntil มาจาก store ตอนจบคำสั่ง ResultCipher/ResultKeyId เก็บ encrypted MutationResult รวม body/ETag; HttpStatus/ResourceId ตรงผลนั้น ไม่มี plaintext response ใน ledger อายุและ tombstone ตาม [กฎ replay](data-contract-rules-cross-database.md#อายุและความลับของผล-replay)

File stub เพิ่ม collection `idempotency` ใน `curricula_snapshot.json` เดียวกับ domain/audit แต่ละสมาชิกใช้ฟิลด์ตาม dictionary; bytea เป็น base64 และเวลาเป็น UTC อ่าน snapshot เก่าที่ไม่มี collection เป็นว่าง แต่กู้ key ที่อยู่เฉพาะ process ไม่ได้ Memory swap candidate ทั้งชุดใต้ lock เดียว fake cipher ใช้เฉพาะ tests; production ใช้ custody เดิม เข้ารหัส/serialize ไม่สำเร็จต้อง fail ก่อน commit; decode ไม่สำเร็จคืน STATE_CONFLICT เดิม ไม่ทำ mutation ซ้ำ

| ทางเลือก | คำตัดสิน/ต้นทุน |
|---|---|
| รอใต้ store lock | เลือกเพื่อให้ retry ได้ผลเดิม แลกกับเวลารอภายใน deadline |
| ตอบ 409 ระหว่าง in-flight | ไม่เลือก แม้มี IDEMPOTENCY_CONFLICT เพราะ hash เดิมตามเกณฑ์ต้อง replay |
| static dictionary/service lock หรือ ledger คนละไฟล์ | ไม่เลือก: ผูกอายุ process หรือหลุดหน่วย atomic |
| เพิ่ม pending column/unique index | ไม่จำเป็นต่อ stub และ SQL ปัจจุบันไม่มี; เปลี่ยนจริงต้องผ่านคน/vault |
| ย้ายทุก consumer พร้อมกัน | ไม่เลือก: ขยาย regression ของงานที่ผ่านแล้ว ใช้ interface เพิ่มและย้าย BE-027 ก่อน |

## หลักฐาน

Source ใต้ `C:/src/schoolbright/target/school-bot/` ตรวจอ่าน 2026-11-03:

- `web/src/SchoolBot.Application/Curriculum/CurriculumService.cs:25,50,103,107,134,208,375` — static lookup/commit/จำผลแยกกัน และสูตร hash
- `web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Curriculum.cs:168,177,190` — domain/audit ไม่มี idempotency
- `web/src/SchoolBot.Infrastructure/Persistence/FileSchoolBotBackingStore.cs:14,29,241,267` — lock ต่อ directory และ replace snapshot; ยังไม่มี ledger
- `web/src/SchoolBot.Application/Abstractions/ISchoolBotDbAdapter.cs:8,50` — ไม่มี interface กลาง; `web/src/SchoolBot.Domain/ErrorCodes.cs:28` — codes เดิม
- `../db/schoolbot_db.sql:92` — ฟิลด์เดิม ไม่มี pending state/unique constraint

