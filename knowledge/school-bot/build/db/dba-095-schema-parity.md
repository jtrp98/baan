# ผลเทียบ physical schema และข้อแก้เอกสารส่ง arch

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 095 — ทบทวนตามมติ 054)

ผล DBA-005/006: ไม่มี physical delta ตาม [มติ 054 (จำกัด reference ไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)](../../shared/decisions/decisions-054.md) ตรวจ DDL/DBML/dictionary แบบ static ซ้ำ และอ่านผล catalog ที่มนุษย์ส่งแล้วตรง 32/32 ตาราง รวม 450 ฟิลด์ ผลนี้ไม่พิสูจน์ runtime transaction/API หรือสิทธิ์ระบบจริง vault ไม่เชื่อม DB หรือรัน SQL

## Physical delta และผลต่อข้อมูลเดิม

**ไม่มี delta**: ไม่เพิ่ม/ลบ/rename table/column ไม่เปลี่ยนชนิด NULL/default/identity/keys/constraints/index/JSON/status; [hash](dba-095-review.md#หลักฐาน) เดิม ไม่มี migration/backfill/rollback เพิ่ม ไม่แตะข้อมูลเดิม

จุดสำคัญที่คงไว้: ทุก PK เป็น integer ALWAYS identity NOT NULL; CreateBy/UpdateBy integer NULL DEFAULT NULL และ CreateDate/UpdateDate timestamptz NULL DEFAULT NULL; reference IDs เป็น integer เดิม ยกเว้น Outbox.ReceiptId bigint NULL ไม่มี default อ้าง receipt ข้ามฐานแบบ logical ไม่ใช่ SQL FK

ScoringPolicy อ่าน CurriculumId ผ่าน CourseRun; Outbox อ่าน ScorePreviewId ผ่าน Export/PreviewItem แอปตรวจ preview/SchoolId เดียวกัน ไม่เพิ่ม composite FK/UQ แทน tenant checks

JSON เดิม: Activity.Config, QuestionBank.Questions, Attempt.Answers/Snapshot, ScoringPolicy.Policy, ScoreMapping.Sources(หนึ่ง source), PreviewItem.Snapshot(skipped_cells), LevelProposal.Snapshot คงเดิม ไม่มี JSON CHECK; ศูนย์จริงต่างจาก missing และ expired ใช้ EarnedScore snapshot ไม่เพิ่ม state

## ฟิลด์เดิมที่ใช้เก็บหลักฐาน

| ตาราง/ฟิลด์จริง | Type / NULL / default / key | การใช้และผลต่อข้อมูลเดิม |
|---|---|---|
| public.SchoolBotAuditEvent.Reason | varchar(1000) NOT NULL; ไม่มี default/key/index | approval_ref/evidence_ref:T1000 ตรงตัว; ไม่เพิ่ม field, wrapper หรือ backfill |
| SchoolBotAuditEventId | integer GENERATED ALWAYS AS IDENTITY, NOT NULL, PK | คีย์เหตุการณ์เดิม ไม่รับจาก client; identity start/inc/min=1 max=2147483647 no cycle |
| Event / EntityType / EntityId | varchar(64) / varchar(64) / integer, NOT NULL ไม่มี default | เลือก publish event ของ revision/resource จริง ไม่มี SQL FK; ตรวจในแอป |
| Actor / RequestId | varchar(512) / uuid, NOT NULL ไม่มี default | ตัวตนจาก server และ UUID คำขอ; ไม่ใช่สิทธิ์ที่ client กำหนดเอง |
| CreateDate / SchoolId | timestamptz NULL DEFAULT NULL / integer NULL ไม่มี default | แอปตั้ง CreateDate=PublishedAt; NULL SchoolId คือ global ไม่แทนด้วย0; tenant ต้องตรง |

ใช้ SchoolBot DB/Release/Curriculum/QuestionBank/AuditEvent/Idempotency เดิม API เขียนและ reader อ่านฐานเดียวกัน ตรวจ Event/EntityType/EntityId/SchoolId/เวลาในแอป; withdraw อ่าน evidence เดิม เก็บเหตุผลถอนอีกแถว ไม่เปลี่ยน JSON/status/read-write หรือ common-column exceptions

## Performance และ integrity

ไม่มี index ใหม่เพราะไม่มี query plan/cardinality จริง; PK backing indexes32คงเดิม เสนอ backlog เก็บ query/EXPLAIN โดยมนุษย์สำหรับ CourseRunId/LearnerId/State/NextAttemptAt ก่อนเลือก index ซึ่งเพิ่มต้นทุน insert/update และพื้นที่

ไม่มี FK/UNIQUE/CHECK ทุก writer ต้องใช้ stable-scope transaction locks ข้าม process รวมกรณีแถวยังไม่มี ETag/select-before-insert อย่างเดียวกัน create race ไม่ได้; snapshot/history/tenant/four-eyes ตรวจใน transaction ยังไม่พิสูจน์ implementation

## DBML / dictionary parity และ representation limits

ตรวจแบบ static ซ้ำครบ 32 ตาราง/450 field: dictionary ตรง DDL ด้านชื่อ/ลำดับ/ชนิด/NULL; DBML ตรงชื่อ/ชนิด/NULL/default/PK/increment ไม่มี refs หรือ index blocks ในแบบเต็ม PK32/UQ0/FK0/CHECK0 และ standalone indexes0 ตรง DDL; backing indexes ของ PK32 เป็นผลที่ PostgreSQL ต้องสร้าง ไม่ใช่ index declaration ใน DBML

DBML int4/int8 คือ integer/bigint และ timestamptz คือ timestamp with time zone; increment ไม่แทน ALWAYS/start/min/max/no-cycle ใช้ Q06 ยืนยัน identity; DEFAULT NULL อาจ normalize เป็นไม่มี default ใน catalog

Integration เป็น subset24ตาราง/112fields (SchoolBot10+legacy14), logical refs16 ไม่มี physical FK endpoint/action ห้ามสร้าง migration จากภาพ PlanCourseIds/JSON/legacy เป็น logical mapping ไม่รับรอง legacy ทั้งฐาน

## Deltas ที่ขอ arch แก้ใน canonical documents

| ประเด็น | สิ่งที่พบ / สิ่งที่ควรแก้ |
|---|---|
| สถานะฐาน | data-model/dictionary index/full DBML/header SQL ยังกล่าวยังไม่รัน/ไม่ทราบ catalog ให้ arch แก้เป็น catalog Q01–Q07 ตรงแล้ว แต่ execution receipt/concurrency/rollback/API ยังไม่ครบ |
| integration notes | CourseRun.CurriculumId, Submission.MissionId/ProjectRevisionId, Assessment.SubmissionId, Attempt.CourseRunId ยังใช้คำ FK; CourseRun/Submission ยังอ้าง DEFERRABLE INITIALLY DEFERRED ให้แก้เป็น logical/application checks ตาม Rev7 |
| PlanCourseIds note | integration ยังกล่าว physical DDL มี cardinality>=1 แต่ไม่มี CHECK ดังกล่าวใน Rev7; เป็นกฎแอป |
| ความจุหลักฐาน | ปิดแล้ว: DES-005 Rev10/010 Rev7/007 Rev5 และ storage Rev2 ใช้ T1000 ตรง Reason เดิม ไม่แก้ dictionary/DBML/migration; รอ implementation proof |
| task-012/013 | reconciliation Rev2 รับแล้ว; grade-rules-032-034 ยังอ้าง SQL คุม active rows และ des-009-delivery อ้าง UQ เก่า ให้ arch แก้เป็น application invariants ตามมติ044 |
| คู่มือ SQL | header อ้าง review-008.md ที่ไม่ใช่ไฟล์ใน build/db ให้เจ้าของระบุ memory reference หรือแก้ path พร้อม hash ก่อน/หลัง ไม่สร้างสำเนาเก่า |

ขอบเขต read/write เดิมคงเดิมทั้งหมด: ใช้ SchoolBot DB เดิม; Master/School อ่านผ่าน adapter, PGGradeDB เขียนคะแนนและ receipt เฉพาะหลัง gates; ไม่มี SQL relation ภายในหรือข้ามฐาน ไม่มี field/table/JSON/status เพิ่มหรือลดในชุดนี้

## หลักฐาน

- SQL physical Rev7 และ SHA-256 ใน [handoff](dba-095-review.md#หลักฐาน); dictionary/table-001..032 และ schoolbot.dbml ตรวจด้วย Node assert ตามคำสั่งที่ handoff ระบุ
- schoolbot-integration.dbml:1–25 (ขอบเขต/legend), :48–67 (CourseRun/Submission notes), :226–255 (logical refs ทั้ง16); count จากข้อความ DBML ไม่ใช่การรัน parser ของ dbdiagram
- data-fields-001.md, schema-notes-placement.md, data-json-001.md และ contract-002/004 ใช้ทบทวนความหมาย/ชนิด/JSON/legacy; ข้อเสนอ storage ยังไม่กลายเป็น SQL

- มติ054; audit-evidence-storage-001 Rev2 และ audit-evidence-migration-001 Rev2; DES-005 Rev10, DES-010 Rev7, DES-007 Rev5; dictionary/table-005.md และ SQL:116–130 ตรงกันเรื่อง Reason/type/NULL/default
- dba-003-catalog-evidence-001.md (memory): Q04 PK32/FK0/UQ0/CHECK0, Q05 PK backing indexes32 ไม่มีอื่น, Q06 identity32 ALWAYS, Q07 diff ว่าง32/32 รวม450ฟิลด์; เป็นหลักฐานที่มนุษย์รัน ไม่ใช่การเชื่อม DB ของ vault
- คำสั่ง `node -` แบบอ่านไฟล์อย่างเดียวผ่าน6กลุ่ม/ตก0 ตาม handoff; ไม่มี DBML/PostgreSQL parser ใหม่


