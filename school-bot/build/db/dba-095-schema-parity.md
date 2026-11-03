# ผลเทียบ physical schema และข้อแก้เอกสารส่ง arch

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 095)

การตรวจนี้อาศัยไฟล์ DDL/DBML/dictionary เท่านั้น ไม่ใช่ catalog ของฐานที่ deploy และไม่อนุญาตรัน SQL

## Physical delta และผลต่อข้อมูลเดิม

**ไม่มี delta ที่ส่งให้รัน**: ไม่มีเพิ่ม/ลบ/rename table/column ไม่มีเปลี่ยนชนิด NULL/default/generated key/PK/FK/UNIQUE/CHECK/index หรือ JSON/status meanings; DDL/rollback hash คงเดิมตาม [handoff](dba-095-review.md#หลักฐาน) จึงไม่มี rollback เพิ่มและไม่แตะข้อมูลที่ผู้ใช้สร้างแล้ว

จุดสำคัญที่คงไว้: ทุก PK เป็น integer ALWAYS identity NOT NULL; CreateBy/UpdateBy integer NULL DEFAULT NULL และ CreateDate/UpdateDate timestamptz NULL DEFAULT NULL; reference IDs เป็น integer เดิม ยกเว้น Outbox.ReceiptId bigint NULL ไม่มี default อ้าง receipt ข้ามฐานแบบ logical ไม่ใช่ SQL FK

ScoringPolicy ไม่มี CurriculumId ซ้ำ อ่านผ่าน CourseRun.CurriculumId; Outbox ไม่มี ScorePreviewId ซ้ำ อ่านผ่าน ScoreExport/PreviewItem โดยแอปตรวจว่าเป็น preview และ SchoolId เดียวกัน ห้ามเพิ่ม composite FK หรือ unique เพื่อแทน tenant checks โดยพลการ

JSON เดิมที่ตรวจ: Activity.Config(kind/mission_id/bank_id), QuestionBank.Questions/Attempt.Answers+Snapshot, ScoringPolicy.Policy(activity_weights/formula_version), ScoreMapping.Sources หนึ่ง source ต่อ mapping, PreviewItem.Snapshot(skipped_cells), LevelProposal.Snapshot ไม่มี JSON schema CHECK ใน SQL; ผลจริง 0 แยกจาก missing และ expired attempt เก็บ EarnedScore ตาม snapshot ไม่เพิ่ม state ใหม่

## Performance และ integrity

ไม่มี index ใหม่ เพราะยังไม่มี real query plan/cardinality ให้เลือกจาก workload; PK backing indexes 32 ตัวมี write cost เดิม การอ่านตาม CourseRunId/LearnerId/State/NextAttemptAt อาจ scan เมื่อข้อมูลโต ส่งเป็นข้อเสนอ backlog ให้เก็บ query/EXPLAIN evidence โดยมนุษย์ก่อนเลือก index ทุก index เพิ่มต้นทุน insert/update และพื้นที่ ไม่สร้างจากชื่อ field อย่างเดียว

ไม่มี FK/UNIQUE/CHECK จึงต้องใช้ stable-scope transaction locks ข้าม process ก่อนตรวจและเขียน รวมกรณียังไม่มีแถว โดยทุก writer ใช้ protocol เดียวกัน ETag/If-Match หรือ select-before-insert อย่างเดียวกัน create race ไม่ได้ Snapshot/history/tenancy/four-eyes ต้องตรวจใน transaction; งานนี้ไม่รับรองว่าแอปทำแล้ว

## DBML / dictionary parity และ representation limits

ตรวจแบบ static ครบ 32 ตาราง/450 field: dictionary ตรง DDL ด้านชื่อ/ลำดับ/ชนิด/NULL; DBML ตรงชื่อ/ชนิด/NULL/default/PK/increment ไม่มี refs หรือ index blocks ในแบบเต็ม PK32/UQ0/FK0/CHECK0 และ standalone indexes0 ตรง DDL; backing indexes ของ PK32 เป็นผลที่ PostgreSQL ต้องสร้าง ไม่ใช่ index declaration ใน DBML

DBML ใช้ int4/int8 เทียบ integer/bigint และ timestamptz เทียบ timestamp with time zone เป็นชนิดเดียวกัน ส่วน increment ไม่แสดง ALWAYS/start/min/max/no-cycle ครบ จึงต้องตรวจ Q06 ไม่ตีความว่า DBML พิสูจน์ sequence settings ได้ และ DEFAULT NULL อาจ normalize เป็นไม่มี default ใน catalog ได้โดยมีความหมายเหมือนกัน

Integration เป็น subset 24 ตาราง/112 fields (SchoolBot 10 + legacy 14), logical refs16 ไม่มี physical FK endpoint/action ที่ต้องนำเข้าจากภาพ ไม่สร้าง migration จากไฟล์นี้ การโยง PlanCourseIds/JSON IDs และ legacy endpoints เป็น logical mapping เท่านั้น ไม่อ้างว่าชนิด/NULL/key ของ legacy ทั้งฐานผ่าน static parity เพราะภาพเลือกเฉพาะ field ที่เกี่ยวข้อง

## Deltas ที่ขอ arch แก้ใน canonical documents

| ประเด็น | สิ่งที่พบ / สิ่งที่ควรแก้ |
|---|---|
| สถานะฐานที่สร้างแล้ว | data-model/schema-notes/full DBML ยังกล่าวว่าไม่ได้รันทั้งหมด ควรแยก “ผู้ใช้แจ้งสร้างแล้ว พบ32ตาราง” จาก “ยังไม่มี catalog revision/runtime verification” ไม่เปลี่ยนเป็นผ่าน |
| field note ใน integration | CourseRun.CurriculumId, Submission.MissionId/ProjectRevisionId, Assessment.SubmissionId และ Attempt.CourseRunId ยังใช้คำว่า FK; table notes ของ CourseRun/Submission ยังกล่าว DEFERRABLE INITIALLY DEFERRED ทั้งที่ไม่มี FK ใน Rev7 แม้ legend บอก logical ให้แก้ note เป็น logical reference/application check ชัดเจน |
| PlanCourseIds note | integration ยังกล่าว physical DDL มี cardinality>=1 แต่ไม่มี CHECK ดังกล่าวใน Rev7; เป็นกฎแอป |
| ช่อง approval/trust evidence | DES-005/010 approval_ref:T2048 กับ AuditEvent.Reason varchar(1000) ไม่ตรง; DES-007 evidence_ref:T2048 ยังไม่มี storage mapping ที่เก็บครบ ส่ง arch สรุปและ spec หากเปลี่ยน business bound |
| เส้นทางคู่มือเดิม | header SQL อ้าง review-008.md แต่ build/db ไม่มีไฟล์นี้ ให้เจ้าของระบุว่าเป็น memory reference หรือแก้ path โดยคงหลักฐาน SQL hash ก่อน/หลัง; ไม่สร้างสำเนา review เก่ามาเติมเอง |

ขอบเขต read/write เดิมคงเดิมทั้งหมด: ใช้ SchoolBot DB เดิม; Master/School อ่านผ่าน adapter, PGGradeDB เขียนคะแนนและ receipt เฉพาะหลัง gates; ไม่มี SQL relation ภายในหรือข้ามฐาน ไม่มี field/table/JSON/status เพิ่มหรือลดในชุดนี้

## หลักฐาน

- SQL physical Rev7 และ SHA-256 ใน [handoff](dba-095-review.md#หลักฐาน); dictionary/table-001..032 และ schoolbot.dbml ตรวจด้วย Node assert ตามคำสั่งที่ handoff ระบุ
- schoolbot-integration.dbml:1–25 (ขอบเขต/legend), :48–67 (CourseRun/Submission notes), :226–255 (logical refs ทั้ง16); count จากข้อความ DBML ไม่ใช่การรัน parser ของ dbdiagram
- data-fields-001.md, schema-notes-placement.md, data-json-001.md และ contract-002/004 ใช้ทบทวนความหมาย/ชนิด/JSON/legacy; ข้อเสนอ storage ยังไม่กลายเป็น SQL

