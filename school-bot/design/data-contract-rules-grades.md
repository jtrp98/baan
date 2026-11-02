# กฎช่องคะแนน การส่งคะแนน และงานระบบ

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](data-contract-rules.md)

กฎในตารางเป็น invariants ที่ application ต้องรักษา ร่าง SQL คงเฉพาะ PRIMARY KEY และไม่มี UNIQUE/FK/CHECK การบังคับด้วย repository locks ยังไม่มี runtime evidence อ่าน [กฎการล็อกและ commit](data-contract-rules-transactions.md) ร่วมด้วย

| กลุ่ม | กฎ |
|---|---|
| GradeSlot / ScoreMapping | tenant (`SchoolId>0`); หนึ่ง active `GradeSlot` ต่อ `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` เมื่อ `RetiredAt=null` (กฎ ownership ผ่าน transaction lock บน `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` — **ไม่กรอง `IsDelete=false` เพื่อห้ามหลบ ownership ด้วย soft-delete**); หนึ่ง active `ScoreMapping` ต่อ `(CourseRunId,GradeSlotId)` เมื่อ `RetiredAt=null` และ `IsDelete=false` (กฎ active mapping ผ่าน transaction lock บน `(CourseRunId,GradeSlotId)` ร่วมกับ lock ช่อง ownership) |
| Preview / Export / Outbox | tenant (`SchoolId>0`); CourseRun/Policy/Slot/Mapping/Preview/Export/Outbox ต้องอยู่ `SchoolId` เดียวกัน (ตรวจใน application คู่กับ single-column FK ชี้ PK ตาม review-005; `ScoreOutbox` ไม่เก็บ `ScorePreviewId` ซ้ำซ้อน); unique `(ScorePreviewId,LearnerId)` (`RULE_UNIQUE_SchoolBotScorePreviewItem_Preview_Learner`), unique `ScoreExport.ScorePreviewId` (`RULE_UNIQUE_SchoolBotScoreExport_ScorePreviewId`), unique `Outbox.OperationKey` (`RULE_UNIQUE_SchoolBotScoreOutbox_OperationKey`), unique `(ScoreExportId,ScorePreviewItemId)` (`RULE_UNIQUE_SchoolBotScoreOutbox_Export_Item`); immutable snapshot ห้ามแก้ business data แม้ workflow `State/UpdateDate` เปลี่ยน; ห้าม hard delete ของ receipt linkage, preview ที่ยืนยัน หรือผลประเมินเพื่อทำให้ส่งซ้ำได้ |
| LevelProposal | tenant (`SchoolId>0`); หนึ่ง finalized proposal (`promoted\|retained\|max_level`) ต่อ `CourseRunId` (กฎ finalized proposal ผ่าน transaction lock บน `CourseRunId` ต้นทาง) และ `SuccessorRunId` ไม่ซ้ำ (กฎ successor ไม่ซ้ำผ่าน transaction lock บน CourseRun ที่ `SuccessorRunId` อ้าง); snapshot immutable |
| Release | unique `(SchoolId,VersionText,Channel,Platform)` รวม null-global; application/repository serialize ด้วย transaction lock บน `(global,VersionText,Channel,Platform)` หรือ `(tenant,SchoolId,VersionText,Channel,Platform)` แล้วตรวจซ้ำก่อนเขียน ไม่มี partial unique index บังคับ |
| Idempotency | unique `(SchoolId,Principal,Operation,RequestKey)` โดย transaction lock แยก global/tenant; `NonceHash` เมื่อมีต้องไม่ซ้ำทั้งระบบและมี transaction lock ของ nonce ร่วมด้วย ตรวจ request hash/replay/expiry/สิทธิ์ภายใต้ lock ตามสัญญาเดิม; ผล, domain mutation และ audit commit ใน transaction เดียวกันบน SchoolBot DB ไม่มี partial unique index บังคับ |
| Audit | append-only; `Event` เป็นชื่อ operation ใน DES; ไม่มี `PreviousVersion`/`NewVersion` ([มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md)); `Reason` ไม่เก็บ key/token/claims ทั้งก้อน/password/source นักเรียน; common columns ยังครบ |
