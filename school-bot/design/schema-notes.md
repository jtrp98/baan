# หมายเหตุ schema — Rev6

อ่าน [คู่มือ DBML](dbml-guide-001.md) สำหรับแบบเต็ม Rev4 และภาพ integration ที่เลือกเฉพาะจุดเชื่อมตารางเดิม; ชนิดของเส้นและจำนวนตารางในสองภาพต่างกันตามขอบเขตภาพ ไม่ได้เพิ่ม schema

## ขอบเขตและหลักฐาน

ครบ **32 ตาราง** ตาม [data-model.md](data-model.md) Rev5, [db/schoolbot_db.sql](../db/schoolbot_db.sql) และผลการตัดทอนใน [db/review-005.md](../db/review-005.md) ภายใต้มติ [decisions-026.md](../requirement/decisions-026.md)..[decisions-030.md](../requirement/decisions-030.md) (ตาราง `SchoolBotTeacherGrant` เป็นทางสำรองตาม [des-004.md](des-004.md) ที่ยังไม่ได้ตัดสินให้สร้าง จึงไม่รวมใน 32 ตารางของ SQL และ DBML).

คงไว้ในไฟล์ [schoolbot.dbml](schoolbot.dbml) ไฟล์เดียวเพื่อให้คัดลอกหรือนำเข้าไปเปิดใน [dbdiagram.io](https://dbdiagram.io) ได้ครบทั้ง 32 ตาราง (40 Foreign Keys) ทันทีโดยไม่ต้องรวมไฟล์เอง.

มติ [decisions-012.md](../requirement/decisions-012.md) ใช้ PK/FK domain `int4`; Cloud keys ออกโดย server (`GENERATED ALWAYS AS IDENTITY`). `ResourceId`/`EntityId` เป็น `int4` ส่วน `SchoolBotScoreOutbox.ReceiptId` เป็น `int8` (`bigint`) อ้าง `PGTGradeAuditLog.GradeAuditLogId` แบบ logical. UUID คงเฉพาะ `RequestKey`/`RequestId`, `OperationKey`, logical keys (`*Key`) และ embedded IDs.

ตาม [decisions-028.md](../requirement/decisions-028.md) คอลัมน์ `CreateBy` และ `UpdateBy` ของทุกตารางเป็น `integer NULL` (`int4 null` — เก็บ `sEmp` ของพนักงาน/ครู หรือ `sId` ของนักเรียน; `NULL` = ระบบทำเอง). ตาม [decisions-030.md](../requirement/decisions-030.md) ถอนคอลัมน์ `Version` ออกจากทุกตารางและถอน `PreviousVersion`/`NewVersion` ออกจาก `SchoolBotAuditEvent` โดยใช้ `UpdateDate` (ที่ server ตั้งด้วย `clock_timestamp()`) เป็น optimistic concurrency token (`ETag`/`If-Match` แบบ opaque string).

ยืนยันชนิดข้อมูล legacy จาก source: Academic `TmasterDbuser.cs:8`; School `Tuser.cs:8,142`, `Temployee.cs:8,92`, `TPlanCourse`, `TPlanCourseTeacher`, `TTerm`; PGGradeDB `Pgtgrade.cs`, `PgtgradeDetail.cs`, `Pgtassessment.cs`, `PgtgradeAuditLog.cs` (ดูรายละเอียดใน [source-review-002.md](source-review-002.md) และ [db/review-001.md](../db/review-001.md)).

## Placement และ integrity

ตามมติ [decisions-027.md](../requirement/decisions-027.md) และ [decisions-029.md](../requirement/decisions-029.md):
- วางทุกตารางของ SchoolBot (**32 ตาราง**) ใน **SchoolBot DB** (host `10.0.0.128` port `9499`, ชื่อ DB `SchoolBot` เป็นสมมติฐาน, schema `public`) เพื่อ commit domain + `SchoolBotIdempotency` + `SchoolBotAuditEvent` แบบ atomic ในฐานข้อมูลเดียว ([db/schoolbot_db.sql](../db/schoolbot_db.sql) ไม่สร้าง database role หรือกำหนดสิทธิ์ฐานข้อมูล).
- การเชื่อมต่อกับ 4 ฐานข้อมูลเดิมของ SchoolBright (Master, School, Logs, PGGradeDB) ใช้ connection แยกด้วย**บัญชี DB เดิม**ของระบบ โดย**ไม่รัน GRANT/REVOKE หรือสร้าง role ใหม่**ใน School DB หรือ PGGradeDB ([decisions-029.md](../requirement/decisions-029.md)).
- เนื่องจากตาราง SchoolBot อยู่คนละฐานข้อมูลกับ School DB จึง**ไม่มี transaction เดียวครอบข้าม DB**: การตรวจสิทธิ์ครูรายวิชา/ผู้ดูแลโรงเรียน, รายชื่อนักเรียนในห้อง (roster) และสถานะภาคเรียน (term) จาก School DB ต้องอ่านผ่าน connection แยกและ **re-check ก่อน commit** ใน SchoolBot DB ทุกครั้ง (ส่วนการตรวจ `SchoolBotLicense` และ `SchoolBotStaffRole` อยู่ใน SchoolBot DB เดียวกัน).

ขอบเขต `SchoolId` และการอ้างอิง FK ตาม [db/review-005.md](../db/review-005.md):
1. **Global เท่านั้น (`SchoolId IS NULL` — 8 ตาราง)**: `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank`
2. **Mixed Global/Tenant (`SchoolId IS NULL OR SchoolId > 0` — 3 ตาราง)**: `SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent` — Release และ Idempotency คงกฎไม่ซ้ำผ่าน application/repository transaction locks แยก global/tenant ตาม data-contract-rules.md; AuditEvent คง append-only ไม่มี partial unique index บังคับกฎดังกล่าว.
3. **Tenant เท่านั้น (`SchoolId > 0` — 21 ตาราง)**: ตารางอื่นทั้งหมด.
4. **การตัดทอน Index, Composite FK และคอลัมน์ซ้ำซ้อน (`db/review-005.md`)**:
   - ถอน standalone indexes ทั้ง unique/non-unique ออกทั้งหมด (0 ตัว); คง backing indexes ของ PK/UQ
   - ตัด composite UNIQUE `(SchoolId, ...)` สำหรับทำ composite FK ออกทั้งหมด และใช้ **single-column FK ชี้ PK คอลัมน์เดียว** ทั้งหมด 39 เส้น + 1 natural composite FK `FK_SchoolBotProject_CurrentRevision` (`(SchoolBotProjectId, CurrentRevision) -> (ProjectId, Revision)`) รวม **40 เส้น**; ชั้น application รับผิดชอบตรวจว่า parent และ child อยู่ `SchoolId` เดียวกัน (และ `CriteriaId` อยู่ใน `MissionId` เดียวกัน)
   - ตัดคอลัมน์ `SchoolBotScoringPolicy.CurriculumId` (อ่านจาก `CourseRun.CurriculumId` แทน) และ `SchoolBotScoreOutbox.ScorePreviewId`
   - ตัด `UQ_SchoolBotAssessment_Submission_Sequence` และ `UQ_SchoolBotAttempt_Learner_Seq` (ใช้ row/learner lock ก่อนจัดสรร `Sequence` แทน)

วง FK ของ current pointer ทั้ง 4 คู่ (`SchoolBotLicense.CurrentBindingId`, `SchoolBotProject.CurrentRevision`, `SchoolBotSubmission.CurrentAssessmentId`, `SchoolBotCourseRun.CurrentPolicyId`) กำหนดใน physical DDL เป็น `DEFERRABLE INITIALLY DEFERRED` เพื่อให้สร้างแถวหลัก/แถวลูกและอัปเดต pointer ใน transaction เดียวกันได้.

`Owner`/`Profile` เป็น polymorphic; ใช้ `SchoolId`+`kind`+legacy ID ตรวจใน trusted adapter ห้าม FK ไปสองตารางพร้อมกัน. ใน schema ปัจจุบัน `LearnerId` รับเฉพาะ `student` (`sId`) เพื่อกัน `sEmp` ของครูชนกับ `sId` นักเรียน (ดูข้อเสนอทางเลือกใน [db/proposal-learnerkind.md](../db/proposal-learnerkind.md)).

## สิ่งที่ diagram ยังไม่บังคับ (บังคับใน physical DDL และ application contract)

- ถอน standalone unique indexes 13 ตัว; กฎ binding, release, idempotency/nonce, staff role, active run/successor, ownership/mapping และ finalized proposal/successor คงเดิมผ่าน application/repository transaction locks ตาม [กฎข้อมูลร่วม](data-contract-rules.md) โดยต้อง serialize logical scope เดียวกันแม้ยังไม่มีแถว
- คง PK/UQ constraints และ FK; DBML คง inline unique และ `[unique, name: 'UQ_…']` ที่แทน constraints เดิม ถอน partial placeholders และ composite FK-source pseudo-index โดยไม่ถอน composite FK
- ยอด declaration ปัจจุบัน: standalone unique indexes 0, standalone non-unique indexes 0; PK 32, UQ 24, CHECK 80 และ FK 40. PostgreSQL ยังสร้าง backing indexes ของ PK/UQ; ไม่ใช่การถอน physical indexes ทุกชนิด
- การบังคับทดแทนด้วย application/repository locks: NOT_IMPLEMENTED — ไม่มี runtime evidence; SQL ยังคง DRAFT ไม่ได้รัน
- **คอลัมน์ Array และ Enum**:
  - `SchoolBotCourseRun.PlanCourseIds` แสดงใน DBML เป็น `jsonb` เพื่อไม่ให้ชนกับ syntax `[...]` ของ DBML parser ส่วน physical SQL ใน `db/schoolbot_db.sql` ใช้ `integer[]` (`int4[]`) พร้อม `CHECK (cardinality("PlanCourseIds") >= 1 AND array_position("PlanCourseIds", NULL) IS NULL)`
  - Enum ใน DBML แสดงค่าที่เป็นไปได้เพื่อการรีวิว ส่วน physical SQL ใช้ `varchar` คู่กับ `CHECK (... IN (...))`

## สถานะการอนุมัติและสิ่งที่ยังรอ

- **อนุมัติแล้ว**: Logical/physical baseline 32 ตารางบน SchoolBot DB (`10.0.0.128:9499`), `CreateBy`/`UpdateBy` เป็น `integer NULL`, การไม่แตะ School DB/PGGradeDB ด้วย GRANT และการใช้ `UpdateDate` แทน `Version` ตาม [decisions-026.md](../requirement/decisions-026.md)..[decisions-030.md](../requirement/decisions-030.md) และ [db/review-005.md](../db/review-005.md).
- **ยังไม่อนุมัติ / รอประตูมนุษย์**:
  - การรัน `db/schoolbot_db.sql` บนฐานทดสอบโดยมนุษย์และส่งผลให้ `DBA-003` ตรวจ
  - ~~การตัดสินใจเลือกแนวทางป้องกัน `LearnerId` ครู/นักเรียนชนกันตาม [db/proposal-learnerkind.md](../db/proposal-learnerkind.md)~~ — ตัดสินแล้ว: ผู้ใช้เลือก**ทาง A** ตาม [decisions-032](../requirement/decisions-032.md) (ส่ง arch sync/app authorization ต่อ)
  - การเปิดเขียนคะแนนลง PGGradeDB (รอผ่าน release gates ทั้งห้า `G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, `G-DB` ของ [des-009.md](des-009.md))
  - การเปิด endpoint `web-principal` ใน gateway และ config `H5`

## Change Log

- 2026-10-26 — ถอนส่วนสร้าง role/กำหนดสิทธิ์จากร่าง SQL และส่วนถอนสิทธิ์ใน rollback ตามคำสั่งผู้ใช้; โครงสร้างตารางและ constraints คงเดิม

- 2026-10-26 — Rev6: ถอน standalone indexes ตามคำสั่งผู้ใช้ คง PK/UQ/FK และกฎธุรกิจ; application/repository locks ทดแทนยัง NOT_IMPLEMENTED ไม่มี runtime evidence
- 2026-10-24 — แก้ตามข้อเสนอ check-061c: ปรับแถว Learner ใน "ยังไม่อนุมัติ" เป็น "ตัดสินแล้ว ทาง A ตาม decisions-032" ให้ตรง data-model; เพิ่มหลักฐาน parser 10.3.1 ที่ dbml-parser-evidence-002.json

- 2026-10-24 — Rev5: ใบงาน060a/BL-001 แก้ยอด declaration ให้ตรง review-006 และ SQL จริง; ไม่แก้ DDL/DBML/สถานะอนุมัติ

- 2026-10-23 — Rev4: เพิ่ม DBML notes/กลุ่มสี และภาพ integration แยก; คง 32 ตาราง/450 ฟิลด์/40 FK และข้อจำกัดเดิม ตรวจเทียบ semantic model ก่อน/หลังแล้ว

- 2026-10-22 — Rev3: sync ตาม `db/schoolbot_db.sql` (32 ตาราง, 40 FKs) และ `db/review-005.md` ภายใต้มติ decisions-027..030; อัปเดตที่ตั้งเป็น SchoolBot DB (10.0.0.128:9499), การใช้บัญชี DB เดิมบน School DB/PGGradeDB, การ re-check ข้าม DB ก่อน commit, การใช้ `UpdateDate` แทน `Version`, single-column FK + application tenant check และการถอน `SchoolBotTeacherGrant`/`ScoringPolicy.CurriculumId`/`ix_*`
- 2026-10-22 — Rev2: sync ครบ 33 ตารางตามมติอนุมัติ decisions-026 และ physical design ใน db/review-001.md; อัปเดตกฎ global/tenant FK, deferred pointers, partial unique indexes และกฎ Session/Desktop/License ตาม decisions-025/026
- 2026-10-21 — MYCELIUM บันทึกผล SA/DBA, ตรวจ parser ทั้งสองแบบ และคงส่วนที่ต้องทบทวนใน index
- 2026-10-21 — จัดทำ diagram handoff ตามมติ PK int4 โดยไม่แก้ไฟล์หรือฐานข้อมูล
