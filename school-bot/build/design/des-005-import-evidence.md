# DES-005 — ผลเทียบ Course Plan importer กับโค้ดจริง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 096 — หลักฐานตัดสิน storage/commit ของ BE-028)

ตรวจ source และ SQL แบบอ่านอย่างเดียววันที่ 2026-11-03 เพื่อใช้กับ [คำตัดสิน importer](des-005-import.md) ข้อเท็จจริงด้านล่างเป็น baseline ที่พบ ไม่ใช่ผลทดสอบ runtime

## ข้อเท็จจริงจาก schema และ code

| เรื่อง | สิ่งที่พบ |
|---|---|
| revision | SourceRef อยู่ที่ Curriculum; Lifecycle/PublishedAt รองรับ draft แต่ไม่มี provenance/D รายแถว |
| Lesson | มี LessonKey/Ordinal และ Text สามช่อง ไม่มี ImportSource/D; input/domain/read-back ไม่มี field นี้เช่นกัน |
| Transformer | LessonKey=SourceRowKey, IsDraft=true, SourceApproved=(D==true), เก็บ C เป็น SourceUnitReference; ไม่อ่าน ColumnO และไม่จัดสรร Course/Level |
| สื่อ | รวม slide/exercise สองชุด; LessonPlan แยกจาก AllMedia จึงยังไม่ใช่ media_refs 5 ค่าใน fixture |
| Validation | ตรวจ Guid.Empty และ SourcePosition≤0 เท่านั้น ไม่มี URL validation, source_ref หรือการสร้าง LessonInput/commit |
| content writer | map LessonInput ลง records; audit เป็น Curriculum.ContentUpdated; adapter แทน children ทั้งชุดและจัด row IDs ใหม่ ไม่ทำ source-row dedup |
| draft reader | ประกอบ LessonInput จาก children; approval อ่านเฉพาะ Curriculum.Published ไม่มี D รายแถว |
| idempotency | service ใช้ static ConcurrentDictionary; backing snapshot มี curricula/lessons/missions/criteria/activities/auditEvents ไม่มี ledger |
| file coordination | static semaphore ต่อ directory อยู่ใน process; lock การ replace snapshot ไม่พิสูจน์ transaction read–modify–write ข้าม adapter/process |

## ความต่างกับเอกสารและการตรวจที่ยังต้องทำ

supplied-row contract เป็น input/validator ที่ต้องพัฒนาเพิ่ม ไม่ใช่ DTO ของ transformer ปัจจุบัน: input รับ source_ref และ D nullable แต่ transformed output ไม่มี source_ref และรวม false/null เป็น false การอ่าน transformed object จึงไม่ใช่หลักฐานเก็บที่มาถาวร

TP001-062 (นำเข้า Sheet) และ TP001-093 (นำเข้าซ้ำ/แข่งกัน) ต้องแยก normalization กับ persistence ส่วน preview คาด zero writes ได้ ส่วน commit ยังไม่มี expected จนมนุษย์ตัดสิน storage ไม่เปลี่ยน AC-045-01..04 (draft พร้อมที่มา, ตัด O, สื่อชุดสอง, identity ถาวร) เพื่อให้ผ่านข้อจำกัด implementation

## หลักฐาน

Source ทั้งหมดอยู่ใต้ `C:/src/schoolbright/target/school-bot/`:

- `web/src/SchoolBot.Application/Curriculum/CoursePlanSuppliedContracts.cs:3–28,37–59` — input D nullable/ColumnO; output D boolean ไม่มี source_ref
- `web/src/SchoolBot.Application/Curriculum/CoursePlanSuppliedRowTransformer.cs:14–52,62–101` — สื่อ/identity/D และ validation ทั้งหมด
- `web/src/SchoolBot.Application/Curriculum/CurriculumContracts.cs:14–22,51–63,87–100` — create/content/read DTO
- `web/src/SchoolBot.Domain/Curriculum/SchoolBotCurriculumRecords.cs:9–42,76–107` — revision/Lesson/Activity/audit records
- `web/src/SchoolBot.Application/Curriculum/CurriculumService.cs:19–28,47–61,103–107,208–220,233–249,315–345,605–644` — hash/replay, writer และ reader
- `web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.Curriculum.cs:266–337` — replace children/IDs/audit; `FileSchoolBotBackingStore.cs:14–15,190–224` — process lock/snapshot replace
- `web/src/SchoolBot.Api/CurriculumEndpoints.cs:89–101,109–129,173–207` — draft read/create/content routes ไม่พบ import route ในไฟล์นี้

Knowledge ที่ตรวจ:

- `../db/schoolbot_db.sql:92–111,116–130,252–287,327–336` — ledger/audit/Curriculum/Lesson/Activity physical fields
- `data-dictionary/contract-003.md:32–38` — Text และ ActivityConfig มีโครงสร้างกำหนดแล้ว; [Curriculum](data-dictionary/table-012.md), [Lesson](data-dictionary/table-013.md), [Activity](data-dictionary/table-016.md) ระบุความหมาย field
- [data-model Rev8](data-model.md), [content](des-005-content.md), [API](des-005-api.md), [draft reader](learning-curriculum-draft-001.md) และ [supplied-row contract](learning-sheet-import-001.md)
