# DBA-005 — ตรวจ learning DDL และ rollback

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 095 — ทบทวนตามมติ 054)

ผล review DBA-005: ผ่านขอบเขตเตรียม learning DDL/rollback ไม่มี physical delta หรือ SQL ที่ต้องรันเพิ่ม ตาม [มติ 054 (จำกัดเลขอ้างอิงไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)](../../shared/decisions/decisions-054.md) และ [ผลรับกฎ learning Rev2](../design/learning-design-reconciliation-001.md) ที่นำผล task-012/013 เข้าแบบแล้ว คง SQL รวม/rollback เดิม ไม่เพิ่ม LearnerKind หรือ constraints ที่ถอนตามมติ 044 (คงเฉพาะ Primary Key) ผลนี้ไม่ปิด runtime หรือ release gate

## Acceptance ที่ตรึง

| Criterion | Deliverable / expected | Actual | ข้อจำกัด |
|---|---|---|---|
| curriculum/Level/question | 8 ตารางเนื้อหากลาง ชนิด/NULL/identity ตรง dictionary/DBML | ครบเฉพาะ static review | approval_ref:T1000 พอดี Reason เดิม; รอ implementation |
| attempt/results/policy | 8 ตารางเปิดเรียน/ผลเรียน snapshot และ numerical score เดิม | ครบเฉพาะ static review | expiry/retake/ผู้ตรวจ/atomic history เป็นกฎแอป ยังไม่ทดสอบ |
| mapping/outbox | 6 ตารางคะแนนเดิม; ยึด immutable snapshot และ ReceiptId=int8 | ครบเฉพาะ static review | export runtime pack เป็น DBA-007; ไม่พิสูจน์ legacy writer |
| promotion | LevelPromotionPolicy + LevelProposal และ PreviousRunId/SuccessorRunId เดิม | ครบเฉพาะ static review | roster/สิ้นเทอมและการยืนยันทั้งห้องต้องพิสูจน์ภายนอก SQL |
| SQL รวม/rollback เดิม | ไม่เปลี่ยน physical Rev7; rollback ครอบ 32 ตารางครบ | ครบ | ไม่รัน; DROP guard ห้ามใช้กับฐานปัจจุบัน |
| UpdateDate / single FK + tenant | ไม่มี Version; ใช้ UpdateDate และ reference ID เดิม + ตรวจ SchoolId | ครบเฉพาะแบบ | single FK เป็นขอบเขต reference เดิม ปัจจุบันไม่มี SQL FK แม้แต่ single-column ตามมติ 044 |
| Learner A ไม่เพิ่ม LearnerKind | LearnerId=student.sId เท่านั้น; ครูทดลอง local และเก็บ Project Cloud ได้ | ครบเฉพาะแบบ | server ต้องปฏิเสธ employee Submission/Attempt/import/worker ไม่ใช้เลข ID ตัดสินชนิด |
| รับ task-012/013 ก่อน freeze | ผลรับเข้าและเทียบ delta ใน learning-design-reconciliation-001.md Rev2 | ครบ | อ่าน task-012/013 และ review-006 (memory) แล้ว; ไม่ใช่อนุมัติ runtime |
| version/reviewer/tenant/history/int4/audit | revision แยกฉบับ; ผลเดิม immutable; PK int4/ALWAYS; audit/domain commit ร่วม | ครบเฉพาะแบบ/SQL | T1000 ตรง Reason; reviewer/tenant/history/locks เป็นกฎแอป ยังไม่พิสูจน์ runtime |

## ตารางที่ตรวจและข้อมูลเดิมที่ใช้

| กลุ่ม | ตาราง (ทุกชื่อมี prefix SchoolBot) | ความหมาย/การใช้ข้อมูลเดิม |
|---|---|---|
| เนื้อหากลาง 8 | Level, LevelPromotionPolicy, Curriculum, Lesson, Mission, Criteria, Activity, QuestionBank | global 8 ตาราง SchoolId nullable; SQL ไม่บังคับว่าต้อง NULL; ใช้ SourceRef/JSON เดิม ไม่คัดลอกบัญชี |
| เปิดเรียน/ผลเรียน 8 | CourseRun, ScoringPolicy, CourseRunActivity, Submission, GradingJob, Assessment, Attempt, RetakeGrant | tenant; อ่าน School DB เพื่อยืนยัน roster/ห้อง/เทอม/วิชาและผู้ตรวจ; re-check ก่อน commit |
| คะแนน 6 | GradeSlot, ScoreMapping, ScorePreview, ScorePreviewItem, ScoreExport, ScoreOutbox | tenant; mapping ไป PGGradeDB เป็น logical/cross-database; ไม่สร้าง FK หรือ GRANT ข้ามฐาน |
| เลื่อน Level 1 | LevelProposal | tenant; Snapshot ตรึง roster/policy/results; ไม่แก้ทะเบียนชั้นเรียนเดิม |

รวม learning 23 ตาราง ใช้ AuditEvent/Idempotency/Session/Project/ProjectRevision เดิมประกอบ ไม่เพิ่มตารางบัญชี Master DB อ่าน TMasterDBUser; School DB อ่าน TUser/TEmployees/TPlanCourse/TPlanCourseTeacher/TTerm/roster ตามสัญญา PGGradeDB เขียนเฉพาะ PGTGradeDetail และเพิ่ม receipt ใน PGTGradeAuditLog เมื่อผ่าน gates ของ DBA-007; Logs DB ยังไม่มี use case ยืนยัน ไม่ขยายงานนี้

## การปิดช่องว่างแบบและสิ่งที่ส่งต่อ

DES-005 Rev10 และ DES-010 Rev7 ใช้ approval_ref:T1000 เก็บตรงตัวใน AuditEvent.Reason varchar(1000) NOT NULL ไม่มี default; Event/EntityType/EntityId/SchoolId และ CreateDate=PublishedAt ระบุ publish event หนึ่งแถว Actor มาจาก server context อ่าน approval_ref/actor/approved_at จาก event ตาม [สัญญา storage Rev2](../design/audit-evidence-storage-001.md) ไม่ trim/normalize/truncate/hash/split หรือห่อ JSON; เกิน 1,000 ตัวอักษรคืน 400 INVALID_INPUT ก่อน mutation

ไม่ขยาย field ไม่มี migration/backfill/rollback ใหม่ ข้อมูลเดิมไม่ถูกแก้ การอ่านหลักฐานเดิมที่หายหรือกำกวมคืน approval=null ไม่อ้างว่าอนุมัติแล้ว ต้องพิสูจน์ 1,000/1,001 ตัวอักษรรวมไทยและ Unicode นอก BMP, audit failure rollback, retry event เดียว และ revision/tenant read-back ในงาน implementation

กฎ task-012/013 ครอบ employee ban ทุกช่องทาง, Sources เดียว weight_bps=10000, mapping ล็อกตั้งแต่ confirm รวม partial/unknown, freeze policy ต่อ CourseRun, teacher time/window allow-list, missing แยกจากศูนย์, Submission.Accepted ผูก course_run_id และ receipt/lease/reconcile แล้ว ข้อความ SQL active-row/UQ เก่าใน grade-rules/des-009-delivery ต้องให้ arch แก้คำอธิบายตามกฎ PK-only ปัจจุบัน ไม่ต้องเพิ่ม schema หรือเปิดนโยบายซ้ำ; export runtime pack ยังคง DBA-007

ส่ง jpo พิจารณาข้อมูลส่วนบุคคล: LearnerId/AssessorId/Actor/SchoolId และคำตอบ ผลเรียน snapshot roster/ผู้ตรวจ การปิดเฉลย การ masking/encryption/สิทธิ์อ่าน audit ยังไม่ผ่านการพิสูจน์ในงานนี้

Physical delta, field rules, DBML parity, performance และข้อแก้เอกสารส่ง arch อยู่ใน [ผลเทียบ physical schema](dba-095-schema-parity.md)

## หลักฐาน

- SQL:220–677 ครอบ learning 23 ตาราง; PK-only declaration32/UQ0/FK0/CHECK0/standalone index0 ทั้งชุด
- data-model.md Rev8; dictionary/table-001 ถึง table-032 ตรวจชื่อ/ชนิด/NULL ครบ450; schoolbot.dbml ตรวจชนิด/NULL/default/PK/increment ครบ450; ไม่ใช่ deployed evidence
- DES-005 Rev10, DES-010 Rev7, learning-curriculum-draft-001.md และ learning-bank-draft-001.md ใช้ T1000; audit-evidence-storage-001.md Rev2 และ audit-evidence-migration-001.md Rev2; SQL AuditEvent.Reason:123
- REQ-033/037/038/039/043–052 อ่าน AC ที่เกี่ยวกับ schema; canonical tasks-001.json ตรึง acceptance ไม่มี AC association เพิ่มสำหรับ DBA-005
- data-contract-rules-learning.md, data-contract-rules-grades.md, learning-rules-032-034.md, grade-rules-032-034.md และ contract-002/004; คำสั่ง/ผลตรวจรวมอยู่ใน handoff
- learning-design-reconciliation-001.md Rev2 เทียบกฎกับ task-012.md/task-013.md และ review-006.md (memory) ที่อ่านครบ; ตัวเลข constraints รุ่นเก่าไม่ใช้แทน Rev7
- dba-003-catalog-evidence-001.md (memory): ผู้ใช้รัน Q01–Q07; Q07 ตรง 32/32 รวม 450 ฟิลด์ และ Q04–Q06 ตรง PK-only/identity ปัจจุบัน ไม่พิสูจน์ transaction/runtime
