# DBA-005 — ตรวจ learning DDL และ rollback

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 095)

ผล review: ต้องแก้แบบก่อน freeze (NEEDS_DESIGN_CHANGE) เพราะ approval_ref:T2048 ไม่พอดี AuditEvent.Reason varchar(1000) และยังไม่ได้รับ exact path/ผลยอมรับ task-012/013 คง SQL รวม/rollback เดิม ไม่เพิ่ม LearnerKind หรือ constraints ที่ผู้ใช้ถอนตามมติ 044 ไม่อ้างว่า schema/runtime ผ่าน

## Acceptance ที่ตรึง

| Criterion | Deliverable / expected | Actual | ข้อจำกัด |
|---|---|---|---|
| curriculum/Level/question | 8 ตารางเนื้อหากลาง ชนิด/NULL/identity ตรง dictionary/DBML | ครบเฉพาะ static review | publish approval storage ยังติดความยาว |
| attempt/results/policy | 8 ตารางเปิดเรียน/ผลเรียน snapshot และ numerical score เดิม | ครบเฉพาะ static review | expiry/retake/ผู้ตรวจ/atomic history เป็นกฎแอป ยังไม่ทดสอบ |
| mapping/outbox | 6 ตารางคะแนนเดิม; ยึด immutable snapshot และ ReceiptId=int8 | ครบเฉพาะ static review | export runtime pack เป็น DBA-007; ไม่พิสูจน์ legacy writer |
| promotion | LevelPromotionPolicy + LevelProposal และ PreviousRunId/SuccessorRunId เดิม | ครบเฉพาะ static review | roster/สิ้นเทอมและการยืนยันทั้งห้องต้องพิสูจน์ภายนอก SQL |
| SQL รวม/rollback เดิม | ไม่เปลี่ยน physical Rev7; rollback ครอบ 32 ตารางครบ | ครบ | ไม่รัน; DROP guard ห้ามใช้กับฐานปัจจุบัน |
| UpdateDate / single FK + tenant | ไม่มี Version; ใช้ UpdateDate และ reference ID เดิม + ตรวจ SchoolId | ครบเฉพาะแบบ | single FK เป็นขอบเขต reference เดิม ปัจจุบันไม่มี SQL FK แม้แต่ single-column ตามมติ 044 |
| Learner A ไม่เพิ่ม LearnerKind | LearnerId=student.sId เท่านั้น; ครูทดลอง local และเก็บ Project Cloud ได้ | ครบเฉพาะแบบ | server ต้องปฏิเสธ employee Submission/Attempt/import/worker ไม่ใช้เลข ID ตัดสินชนิด |
| รับ task-012/013 ก่อน freeze | มี exact path/revision/ผลรับเข้าและเทียบ delta | รอคน | ใบงานไม่ระบุ path และ pack ที่อ่านไม่มีหลักฐานรับเข้า จึงยัง freeze ไม่ได้ |
| version/reviewer/tenant/history/int4/audit | revision แยกฉบับ; ผลเดิม immutable; PK int4/ALWAYS; audit/domain commit ร่วม | บางส่วน | approval length mismatch; ไม่พิสูจน์ locks/runtime |

## ตารางที่ตรวจและข้อมูลเดิมที่ใช้

| กลุ่ม | ตาราง (ทุกชื่อมี prefix SchoolBot) | ความหมาย/การใช้ข้อมูลเดิม |
|---|---|---|
| เนื้อหากลาง 8 | Level, LevelPromotionPolicy, Curriculum, Lesson, Mission, Criteria, Activity, QuestionBank | global 8 ตาราง SchoolId nullable; SQL ไม่บังคับว่าต้อง NULL; ใช้ SourceRef/JSON เดิม ไม่คัดลอกบัญชี |
| เปิดเรียน/ผลเรียน 8 | CourseRun, ScoringPolicy, CourseRunActivity, Submission, GradingJob, Assessment, Attempt, RetakeGrant | tenant; อ่าน School DB เพื่อยืนยัน roster/ห้อง/เทอม/วิชาและผู้ตรวจ; re-check ก่อน commit |
| คะแนน 6 | GradeSlot, ScoreMapping, ScorePreview, ScorePreviewItem, ScoreExport, ScoreOutbox | tenant; mapping ไป PGGradeDB เป็น logical/cross-database; ไม่สร้าง FK หรือ GRANT ข้ามฐาน |
| เลื่อน Level 1 | LevelProposal | tenant; Snapshot ตรึง roster/policy/results; ไม่แก้ทะเบียนชั้นเรียนเดิม |

รวม learning 23 ตาราง ใช้ AuditEvent/Idempotency/Session/Project/ProjectRevision เดิมประกอบ ไม่เพิ่มตารางบัญชี Master DB อ่าน TMasterDBUser; School DB อ่าน TUser/TEmployees/TPlanCourse/TPlanCourseTeacher/TTerm/roster ตามสัญญา PGGradeDB เขียนเฉพาะ PGTGradeDetail และเพิ่ม receipt ใน PGTGradeAuditLog เมื่อผ่าน gates ของ DBA-007; Logs DB ยังไม่มี use case ยืนยัน ไม่ขยายงานนี้

## ประเด็นต้องส่ง arch และ spec

DES-005/010 กำหนด approval_ref:T2048 และใช้ AuditEvent.Reason ตรงตัว แต่ field จริง varchar(1000) NOT NULL จึงเก็บครบไม่ได้ ทางขยายเป็น varchar(2048) เป็นข้อเสนอที่ arch ระบุ ยังไม่ใช่ delta ที่อนุมัติ ต้องรับ task-012/013 และข้อสรุปก่อนออก migration พร้อม rollback คู่ ห้าม truncate/split หลักฐาน หรือหด API bound เอง

หากเลือกขยาย field: คงข้อมูลเก่าทุกแถว/NULL/default/keys เดิม; downgrade กลับ 1000 ต้องหยุดเมื่อมีข้อความยาวกว่า 1000 และคงข้อมูลไว้ ห้ามใช้ substring/ตัดข้อมูลเพื่อ rollback การประเมินนี้ไม่ใช่ SQL สำหรับรันหรือการอนุมัติ schema

ส่ง jpo พิจารณาข้อมูลส่วนบุคคล: LearnerId/AssessorId/Actor/SchoolId และคำตอบ ผลเรียน snapshot roster/ผู้ตรวจ การปิดเฉลย การ masking/encryption/สิทธิ์อ่าน audit ยังไม่ผ่านการพิสูจน์ในงานนี้

Physical delta, field rules, DBML parity, performance และข้อแก้เอกสารส่ง arch อยู่ใน [ผลเทียบ physical schema](dba-095-schema-parity.md)

## หลักฐาน

- SQL:220–677 ครอบ learning 23 ตาราง; PK-only declaration32/UQ0/FK0/CHECK0/standalone index0 ทั้งชุด
- data-model.md Rev8; dictionary/table-001 ถึง table-032 ตรวจชื่อ/ชนิด/NULL ครบ450; schoolbot.dbml ตรวจชนิด/NULL/default/PK/increment ครบ450; ไม่ใช่ deployed evidence
- learning-curriculum-draft-001.md:38,56–58; learning-bank-draft-001.md:21,34; SQL AuditEvent.Reason:123
- REQ-033/037/038/039/043–052 อ่าน AC ที่เกี่ยวกับ schema; canonical tasks-001.json ตรึง acceptance ไม่มี AC association เพิ่มสำหรับ DBA-005
- data-contract-rules-learning.md, data-contract-rules-grades.md, learning-rules-032-034.md, grade-rules-032-034.md และ contract-002/004; คำสั่ง/ผลตรวจรวมอยู่ใน handoff
