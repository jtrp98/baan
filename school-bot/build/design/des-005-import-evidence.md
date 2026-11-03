# DES-005 — ผลเทียบ Course Plan importer กับโค้ดจริง

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 097 — ตรวจ source ซ้ำหลังแยกไฟล์ CurriculumService และหลัง migration-002 Rev2)

ตรวจ source และ SQL แบบอ่านอย่างเดียววันที่ 2026-11-03 เพื่อใช้กับ [สัญญา importer](des-005-import.md) และ [persisted state](des-005-import-state.md) ข้อเท็จจริงด้านล่างคือสิ่งที่โค้ดเป็นอยู่ตอนนี้ ไม่ใช่ผลทดสอบ runtime ส่วน "ต้องเปลี่ยน" คือสิ่งที่ BE-028 ต้องทำตามสัญญา

## ข้อเท็จจริงจาก code และสิ่งที่ต้องเปลี่ยน

| เรื่อง | as-built | ต้องเปลี่ยนตามสัญญา |
|---|---|---|
| Lesson record | ไม่มี ImportSource | เพิ่ม `string? ImportSource = null` (WhenWritingNull) |
| raw row / transformer | input `SourceApproved` เป็น `bool?` และมี ColumnO; output ยุบเป็น `bool` (`== true`) ไม่มี source_ref; validator ตรวจแค่ key ว่างและตำแหน่ง ≤0 | normalizer ส่ง D แบบ `bool?`, ตัด O, สร้าง `LessonInput`; ตรวจ media URL ตามข้อ 2 |
| content PUT | hash `id\|Serialize(request)`; adapter ตัด Lesson ทั้งหมดของ curriculum แล้วสร้างใหม่ด้วย ID ใหม่ | คัดลอก ImportSource ตาม LessonKey |
| draft reader | admin และ public ใช้ `BuildDraftViewAsync` เดียว คืน `LessonInput` | admin เพิ่ม `import_source`; public คงเดิม |
| idempotency | helper ถือ store lock, ค้น ledger, เรียก mutate บน facade, ต่อ ledger แล้ว commit ครั้งเดียว; root path เดิมเขียนได้โดยไม่มี ledger | import เรียกได้เฉพาะบน facade |
| recheck สิทธิ์ | Operation ที่ไม่ใช่ create/publish ใช้ `EvaluateUpdateCurriculumContent` | `import_curriculum_lessons` ตกกรณีนี้โดยไม่ต้องแก้ switch |
| snapshot | curricula/lessons/missions/criteria/activities/audit_events/idempotency ในไฟล์เดียว | ไม่เพิ่ม collection |
| route | ไม่มี import route | เพิ่ม `POST /{id}/import` |
| error envelope | รองรับ `details` | ใช้ details ตามสัญญา |

## ความต่างกับเอกสารเดิม

- [supplied-row contract](learning-sheet-import-001.md) Rev1 ยังเขียนว่า ImportSource เป็นข้อเสนอที่รอ schema gate และกฎ dedup "ควรใช้" — ตอนนี้ผู้ใช้อนุญาตคอลัมน์แล้วและสัญญาตรึงใน des-005-import Rev2 ไฟล์นั้นต้องปรับให้ชี้มาที่นี่ (อยู่นอกขอบเขตไฟล์ของใบงานนี้)
- [idempotency-001](idempotency-001.md) Rev2 ที่ vault อ้างใน migration-002 ปัจจุบันเป็น Rev4 (เพิ่ม BE-028) helper และพฤติกรรม BE-027/BE-030 ไม่เปลี่ยน
- หลักฐาน Rev1 ของไฟล์นี้อ้าง `CurriculumService.cs` บรรทัด hash/writer ก่อนแยกไฟล์ ตอนนี้ย้ายไป `CurriculumService.Content.cs` และ `.Commit.cs`

## หลักฐาน

Source ทั้งหมดอยู่ใต้ `C:/src/schoolbright/target/school-bot/web/src/`:

- `SchoolBot.Domain/Curriculum/SchoolBotCurriculumRecords.cs:28–42` — `SchoolBotLessonRecord` ไม่มี ImportSource
- `SchoolBot.Application/Curriculum/CoursePlanSuppliedContracts.cs:9,19,40` — `bool? SourceApproved`, `ColumnO`, output `bool SourceApproved`
- `SchoolBot.Application/Curriculum/CoursePlanSuppliedRowTransformer.cs:33,37,70–86` — LessonKey=SourceRowKey, `SourceApproved == true`, validation สองข้อ
- `SchoolBot.Application/Curriculum/CurriculumContracts.cs:51–63,87–101` — `LessonInput`, content request, `CurriculumDraftView.Lessons` เป็น `LessonInput`
- `SchoolBot.Application/Curriculum/CurriculumService.Content.cs:32,130,143` — RequestHash ของ content, audit `Curriculum.ContentUpdated`, เรียก adapter
- `SchoolBot.Application/Curriculum/CurriculumService.Commit.cs:20–21,25–30` — Principal/`Guid.NewGuid()` เมื่อไม่มี key; switch recheck สิทธิ์
- `SchoolBot.Application/Curriculum/CurriculumService.cs:19–59,153` — admin และ public เรียก `BuildDraftViewAsync` เดียวกัน
- `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.CurriculumMutations.cs:113–213` — content PUT: ตรวจ draft/ETag (136–140), ตัด Lesson ของ curriculum และจัด ID ใหม่ (147–160)
- `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Idempotency.cs:23–74,76–84` — helper ส่วนกลาง และ root path ที่ไม่มี ledger
- `SchoolBot.Infrastructure/Persistence/CurriculumStoreSnapshot.cs:26–34` — สมาชิกของ snapshot
- `SchoolBot.Api/CurriculumEndpoints.cs:89,173,209` — admin GET, content PUT, publish; ไม่มี import route
- `SchoolBot.Api/V2Errors.cs:21–24` — envelope `{error:{code,message,request_id,details}}`

Knowledge ที่ตรวจ:

- `../db/migration-002-lesson-import-source.sql:6` — `ADD COLUMN "ImportSource" jsonb NULL` คำสั่งเดียว ยังไม่รัน
- `../db/schoolbot_db.sql:267` — SchoolBotLesson ในร่าง SQL baseline (PK เท่านั้น)
- [Lesson dictionary](data-dictionary/table-013.md), [ActivityConfig `instruction-v1`](data-dictionary/contract-003.md) (`media_refs:T2048[]`), [DES-010 stub](des-010-stub-persistence.md)
