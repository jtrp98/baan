# การเก็บหลักฐานอนุมัติและเผยแพร่ใน AuditEvent

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 095 — DBA-005 และ DBA-006)

เอกสารนี้เสนอ storage ร่วมให้ [DES-005 (หลักสูตรและผลประเมิน)](des-005.md), [DES-010 (คลังข้อสอบและ Attempt)](des-010.md) และ [DES-007 (Release และ trusted update)](des-007.md): ขยาย `public."SchoolBotAuditEvent"."Reason"` จาก `varchar(1000)` เป็น `varchar(2048)` โดยไม่เพิ่มตารางหรือ field ต้องให้มนุษย์อนุมัติก่อนใช้เป็น schema contract; baseline ยังเป็น 1,000 ตาม [พจนานุกรม](data-dictionary/table-005.md) และ [แบบเต็ม](schoolbot.dbml)

`approval_ref` และ `evidence_ref` คงเป็น Unicode string ไม่เกิน 2,048 ตัวอักษร ไม่ใช่ bytes เก็บตรงตัว ไม่ trim/normalize, hash แทนข้อความ, ใส่ JSON wrapper หรือแบ่งหลายแถว API bounds ของ operation อื่นคงเดิม แม้ column จุเพิ่ม

## Mapping ที่เสนอเมื่ออนุมัติ

หนึ่งแถวคือหนึ่งเหตุการณ์ append-only ของ resource หนึ่งรายการ API เขียนและ reader ที่มีสิทธิ์ตาม DES อ่านใน SchoolBot DB เดียวกัน คีย์ resource ต้องมี `EntityType + EntityId + SchoolId` ไม่ใช้เลข ID เดี่ยว

| การกระทำ | Event / EntityType | Reason และการอ่านกลับ |
|---|---|---|
| Publish curriculum revision | `Curriculum.Published` / `SchoolBotCurriculum` | `Reason=approval_ref`; คืนผ่าน `CurriculumDraftView.approval.approval_ref` |
| Publish bank revision | `QuestionBank.Published` / `SchoolBotQuestionBank` | `Reason=approval_ref`; คืนผ่าน `QuestionBankDraftView.approval.approval_ref` |
| Publish release | `Release.Published` / `SchoolBotRelease` | `Reason=evidence_ref`; trusted-release reader และ audit reader อ่านเพื่อ resolve immutable CI registry |
| Withdraw release | `Release.Withdrawn` / `SchoolBotRelease` | `Reason` เป็นเหตุผลถอนตาม bound เดิมไม่เกิน 1,000; evidence อ่านจาก `Release.Published` เดิมของ release นี้ ไม่ต่อสองข้อความลงช่องเดียว |

`EntityId` เป็น PK int4 ของ revision/resource จริง ไม่ใช่ CurriculumKey/BankKey หรือเลข Revision; `SchoolBotAuditEventId` เป็นรหัสเหตุการณ์ที่ฐานสร้าง เนื้อหากลางใช้ `SchoolId=NULL`; release ใช้ scope ของ release จริง แยก global NULL จาก tenant ID ไม่แทนด้วย 0 เป็น application mapping ไม่มี SQL FK

`Actor` มาจาก authenticated server context ตาม [ชนิดตัวตนกลาง](data-dictionary/contract-001.md) ไม่เชื่อ body; `RequestId` เป็น UUID ของคำขอ `CreateDate` ต้องมี UTC จาก server แม้ SQL รับ NULL โดยใช้ instant เดียวกับ `PublishedAt` หรือ `WithdrawnAt` ของเหตุการณ์นั้น Learning approval อ่าน actor/approved_at จาก Actor/CreateDate ของ publish event เท่านั้น Common fields อื่นไม่เปลี่ยน NULL/default

ตัวอย่างสมมติ: curriculum PK 42, SchoolId=NULL, PublishedAt=2026-11-03T03:00:00Z มี audit Event=Curriculum.Published, EntityId=42, CreateDate เวลาเดียวกัน และ Reason=`approval:curriculum-42-r3` ต้องอ่าน approval_ref กลับเหมือนเดิมทุกตัวอักษร

## Transaction, reader และข้อผิดพลาด

ใช้ resource/scope lock เดิม ตรวจสิทธิ์ ETag lifecycle และ learning four-eyes รวมผู้แก้ทั้งหมด Release ตรวจ registry/trust ตาม [release trust](release-trust-001.md) Commit domain mutation, audit และ idempotency ใน transaction เดียวกัน Retry key เดิมคืนผลเดิม ไม่เพิ่ม publish event; audit ล้มเหลวห้ามเหลือ resource ที่ publish สำเร็จ

Reader เลือก publish event ที่ตรง Event/EntityType/EntityId/scope และ CreateDate=PublishedAt ต้องได้เพียงหนึ่งแถว ไม่เลือกแถวล่าสุดกลบความกำกวม ไม่เดาจาก UpdateBy/SourceRef/Manifest ไม่ให้การซ่อน audit เปลี่ยนหลักฐาน Learning detail ที่ไม่มีหลักฐานหรือพิสูจน์แถวเดียวไม่ได้คืน `approval=null` ไม่อนุมานสิทธิ์อนุมัติจาก null; contributors ไม่ครบยังเป็น `409 FOUR_EYES_REQUIRED`

Withdraw resolve evidence จาก publish event เดิม แม้ release ถูกถอนแล้ว PublishedAt และ audit เดิมต้องคงอยู่ หากไม่มี/กำกวม คืน `409 STATE_CONFLICT` ไม่เปลี่ยน lifecycle Registry tuple ไม่ผ่านใช้ `403 ARTIFACT_UNTRUSTED` ไม่เพิ่ม public endpoint หรือใส่ reference ใน public update-check/manifest

Input ผิดชนิด/เกิน bound → `400 INVALID_INPUT`; If-Match ขาด/ชน → `428 PRECONDITION_REQUIRED`/`412 VERSION_CONFLICT`; storage เขียนไม่ได้ → `503 SERVICE_UNAVAILABLE` และ rollback ทั้งหน่วย ใช้ [error envelope เดิม](data-contract-rules-http.md) ห้าม retry โดยตัดข้อความ

ก่อนอนุมัติและยืนยัน migration ห้ามเปิด full publish/read-back ที่ต้องรองรับ 2,048 ตัวอักษร งาน draft/fake เดิมทำต่อได้ ห้ามลด API bound เหลือ 1,000 โดยปริยาย

## ทางเลือกและเหตุผล

เสนอขยาย column เดิมเพราะ learning ใช้ Reason ตรงตัวอยู่แล้ว และ release อ่าน publish event เดิมได้ Field/table evidence ใหม่เพิ่ม writer/reader/relation โดยไม่จำเป็นวันนี้ ลด bound เป็น 1,000 เป็น business contract change ต้องส่ง spec/ผู้ใช้ ไม่เลือกเอง Truncate/hash-only/split ทำให้อ่าน reference เดิมกลับไม่ได้จึงใช้ไม่ได้

[Physical delta และ rollback](audit-evidence-migration-001.md) ระบุสิ่งส่ง vault; [การเทียบแบบ learning](learning-design-reconciliation-001.md) ระบุผลรับกฎที่เกี่ยวข้อง

## หลักฐาน

- Baseline: `knowledge/school-bot/build/db/schoolbot_db.sql:116–130`; dictionary/table-005.md; schoolbot.dbml:120–134 — Reason varchar(1000) NOT NULL
- เดิม: learning-curriculum-draft-001.md/learning-bank-draft-001.md กำหนด approval_ref/read-back; des-007-manifest.md กำหนด evidence_ref; release-trust-001.md ผูก audit กับ registry
- As-built ที่อ่านจริง: `target/school-bot/web/src/SchoolBot.Application/ManagementService.cs:74–95` เปลี่ยน Published flag; `SchoolBot.Infrastructure/Persistence/InMemoryManagementStore.cs:10–13,28–42` เก็บใน memory; `SchoolBot.Domain/Releases/DesktopRelease.cs:5–6,25` ไม่มี evidence และใช้ string GUID ไม่ใช่ int4 ตามแบบเป้าหมาย
- `target/school-bot/web/src/SchoolBot.Api/Program.cs:134–138` เป็น v1 publish ไม่มี evidence body ไม่ใช่ implementation ของข้อเสนอ; `SchoolBot.Infrastructure/Persistence/PostgresSessionLogoutStore.cs:30–72` มี audit transaction เฉพาะ logout ไม่ใช่ publish proof
