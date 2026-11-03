# สัญญาการเก็บเลขอ้างอิงการอนุมัติและหลักฐาน release

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — เลขอ้างอิงไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)

[มติ 054 (จำกัดเลขอ้างอิงโดยไม่ขยายฐานข้อมูล)](../../shared/decisions/decisions-054.md) กำหนดให้ `approval_ref` ของ curriculum/bank publish และ `evidence_ref` ของ release publish เป็น `T1000`: Unicode string ไม่เกิน 1,000 ตัวอักษร ไม่ใช่ bytes เก็บตรงตัวใน `public."SchoolBotAuditEvent"."Reason" varchar(1000) NOT NULL` ไม่มี default ไม่เพิ่มตาราง/ฟิลด์หรือเปลี่ยน schema และ [ไม่มี migration](audit-evidence-migration-001.md)

## การเขียนและการอ่านกลับ

หนึ่งแถวคือหนึ่งเหตุการณ์ append-only ของ resource หนึ่งรายการใน SchoolBot DB; API เขียนและ reader ที่มีสิทธิ์ตาม [DES-005 (หลักสูตร/ผลประเมิน)](des-005.md), [DES-010 (คลังข้อสอบ/Attempt)](des-010.md) และ [DES-007 (release/trusted update)](des-007.md) อ่านในฐานเดียวกัน ใช้ `Event + EntityType + EntityId + SchoolId` ระบุเหตุการณ์ ไม่ใช้เลข ID เดี่ยว

| การกระทำ | Event / EntityType | ค่าที่เขียนใน Reason และผู้อ่าน |
|---|---|---|
| Publish curriculum revision | `Curriculum.Published` / `SchoolBotCurriculum` | `approval_ref` ตรงตัว; คืนผ่าน `CurriculumDraftView.approval.approval_ref:T1000` |
| Publish bank revision | `QuestionBank.Published` / `SchoolBotQuestionBank` | `approval_ref` ตรงตัว; คืนผ่าน `QuestionBankDraftView.approval.approval_ref:T1000` |
| Publish release | `Release.Published` / `SchoolBotRelease` | `evidence_ref` ตรงตัว; trusted-release/audit reader ใช้ resolve immutable CI registry |
| Withdraw release | `Release.Withdrawn` / `SchoolBotRelease` | เหตุผลถอนไม่เกิน 1,000 ตัวอักษรตาม bound เดิม; evidence อ่านจาก publish event เดิม ไม่ต่อสองข้อความในช่องเดียว |

`EntityId` คือ PK int4 ของ revision/resource จริง ไม่ใช่ CurriculumKey/BankKey หรือเลข Revision; `SchoolBotAuditEventId` คือรหัสเหตุการณ์ที่ฐานสร้าง Scope ของเนื้อหากลางใช้ `SchoolId=NULL`; release ใช้ scope ของ release จริง แยก global NULL จาก tenant ID ไม่แทนด้วย 0 ความสัมพันธ์นี้เป็น application mapping ไม่มี SQL FK

`Actor` มาจาก authenticated server context ตาม [ชนิดตัวตนกลาง](data-dictionary/contract-001.md) ไม่เชื่อ body; `RequestId` เป็น UUID ของคำขอ; `CreateDate` ต้องมี UTC จาก server และใช้ instant เดียวกับ `PublishedAt`/`WithdrawnAt` แม้ SQL รับ NULL ได้ Learning approval อ่าน actor/approved_at จาก Actor/CreateDate ของ publish event เท่านั้น Common fields อื่นคง NULL/default เดิมตาม [พจนานุกรม AuditEvent](data-dictionary/table-005.md)

ตัวอย่างสมมติ: curriculum PK 42, SchoolId=NULL, PublishedAt=2026-11-03T03:00:00Z มี Event=Curriculum.Published, EntityType=SchoolBotCurriculum, EntityId=42, CreateDate เวลาเดียวกัน และ Reason=`approval:curriculum-42-r3` ต้องอ่าน approval_ref กลับเหมือนเดิมทุกตัวอักษร

## Validation, transaction และข้อผิดพลาด

ตรวจชนิดและความยาวก่อน sign หรือเปลี่ยนข้อมูล ผิดชนิด/เกิน 1,000 ตัวอักษร → `400 INVALID_INPUT`; ไม่ trim/normalize, truncate, เก็บ hash แทน, ใส่ JSON wrapper หรือแบ่งหลายแถว Bound ของ operation อื่นคงเดิม

ใช้ resource/scope lock เดิม ตรวจสิทธิ์ ETag lifecycle และ learning four-eyes รวมผู้แก้ทั้งหมด; release ตรวจ registry/trust ตาม [release trust](release-trust-001.md) Commit domain mutation, audit และ idempotency ใน transaction เดียวกัน Retry key เดิมคืนผลเดิม ไม่เพิ่ม publish event; audit ล้มเหลวต้อง rollback ทั้งหน่วย

Reader เลือก publish event ที่ตรง Event/EntityType/EntityId/scope และ CreateDate=PublishedAt ต้องได้หนึ่งแถว ไม่เลือกแถวล่าสุดกลบความกำกวม ไม่เดาจาก UpdateBy/SourceRef/Manifest และไม่ให้การซ่อน audit เปลี่ยนหลักฐาน Learning detail ที่ไม่มีหลักฐานหรือพิสูจน์หนึ่งแถวไม่ได้คืน `approval=null`; null ไม่ได้ยืนยันสิทธิ์อนุมัติ และ contributors ไม่ครบยังเป็น `409 FOUR_EYES_REQUIRED`

Withdraw resolve evidence จาก publish event เดิมแม้ถูกถอนแล้ว; PublishedAt/audit เดิมต้องคงอยู่ หากไม่มี/กำกวม → `409 STATE_CONFLICT` โดยไม่เปลี่ยน lifecycle; registry tuple ไม่ผ่าน → `403 ARTIFACT_UNTRUSTED` ไม่เพิ่ม public endpoint หรือ reference ใน public update-check/manifest

If-Match ขาด/ชน → `428 PRECONDITION_REQUIRED`/`412 VERSION_CONFLICT`; storage เขียนไม่ได้ → `503 SERVICE_UNAVAILABLE` และ rollback ใช้ [error envelope เดิม](data-contract-rules-http.md) ห้าม retry โดยตัดข้อความ

## เหตุผลและขอบเขตหลักฐาน

เลือกใช้ Reason เดิมตรงตัว เพราะจุ reference ตามมติ 054 ได้ครบ ไม่เลือกขยาย column หรือเพิ่ม field/table เมื่อยังไม่มีความต้องการเกิน bound; truncate/hash-only/split ทำให้อ่าน reference เดิมกลับไม่ได้ ส่วน robot profile acceptance record ใน `des-006-platform.md` เป็น local signed record คนละ field ไม่อยู่ใน AuditEvent และคง bound เดิม

ข้อเท็จจริงจาก source: v1 release publish ที่อ่านเปลี่ยน Published flag ผ่าน memory store และไม่มี evidence body จึงยังไม่พิสูจน์ v2 publish/read-back/transaction ตามสัญญานี้ การมี audit transaction ของ logout ไม่ใช่ publish proof [การเทียบกฎ learning](learning-design-reconciliation-001.md) และ [สารบัญ](index.md) แยกผลทบทวนเอกสารออกจาก implementation/ฐานจริง

## หลักฐาน

- `knowledge/school-bot/shared/decisions/decisions-054.md`: มติผู้ใช้วันที่ 2026-11-03
- `knowledge/school-bot/build/db/schoolbot_db.sql:116–130`; `design/data-dictionary/table-005.md:21–33`; `design/schoolbot.dbml:120–134`: Reason varchar(1000) NOT NULL
- ตรวจ source 2026-11-03: `target/school-bot/web/src/SchoolBot.Application/ManagementService.cs:87–95`; `SchoolBot.Infrastructure/Persistence/InMemoryManagementStore.cs:10–13,35–42`; `SchoolBot.Domain/Releases/DesktopRelease.cs:5–6`; path สองรายการหลังอยู่ใต้ `target/school-bot/web/src/`
- `target/school-bot/web/src/SchoolBot.Api/Program.cs:59–62,149–153`: memory store และ v1 publish; `SchoolBot.Infrastructure/Persistence/PostgresSessionLogoutStore.cs:30–72` ใต้ source root เดียวกันมี audit transaction เฉพาะ logout งานนี้ไม่เชื่อม DB หรือทดสอบ runtime
