# หมายเหตุ schema — Rev2

## ขอบเขตและหลักฐาน

ครบ **33 ตาราง** ตาม [data-model.md](data-model.md) Rev4 และมติอนุมัติ baseline [decisions-026.md](../requirement/decisions-026.md) (รวม `amendment-proposal-001` และ `amendment-proposal-002` พร้อมแก้ 2 จุดตาม [decisions-025.md](../requirement/decisions-025.md)); รวม `SchoolBotTeacherGrant` แบบ conditional fallback ที่ยังไม่ได้ตัดสินให้สร้าง. อ้างอิง physical design ของ DBA ใน [db/review-001.md](../db/review-001.md) เพื่อใช้ชื่อตาราง คอลัมน์ ชนิดข้อมูล และขอบเขต constraint ให้ตรงกันทั้งหมด.

คงไว้ในไฟล์ [schoolbot.dbml](schoolbot.dbml) ไฟล์เดียวเพื่อให้คัดลอกหรือนำเข้าไปเปิดใน [dbdiagram.io](https://dbdiagram.io) ได้ครบทั้ง 33 ตารางทันทีโดยไม่ต้องรวมไฟล์เอง.

มติ [decisions-012.md](../requirement/decisions-012.md) ใช้ PK/FK domain `int4`; Cloud keys ออกโดย server (`GENERATED ALWAYS AS IDENTITY`). `ResourceId`/`EntityId` เป็น `int4` ส่วน `SchoolBotScoreOutbox.ReceiptId` เป็น `int8` (`bigint`) อ้าง `PGTGradeAuditLog.GradeAuditLogId` แบบ logical. UUID คงเฉพาะ `RequestKey`/`RequestId`, `OperationKey`, logical keys (`*Key`) และ embedded IDs.

ยืนยันชนิดข้อมูล legacy จาก source: Academic `TmasterDbuser.cs:8`; School `Tuser.cs:8,142`, `Temployee.cs:8,92`, `TPlanCourse`, `TPlanCourseTeacher`, `TTerm`; PGGradeDB `Pgtgrade.cs`, `PgtgradeDetail.cs`, `Pgtassessment.cs`, `PgtgradeAuditLog.cs` (ดูรายละเอียดใน [source-review-002.md](../source-review-002.md) และ [db/review-001.md](../db/review-001.md)).

## Placement และ integrity

วางทุกตารางของ SchoolBot (33 ตาราง) ใน **School DB** (`JabjaiSchoolSingleDB`, schema `public`) ที่เดียวเพื่อ commit domain+idempotency+audit แบบ atomic; Master/School/Logs/PGGradeDB เป็น 4 connections แยกกัน ไม่เพิ่ม DB ที่ห้า และไม่เพิ่ม/แก้ตารางใน PGGradeDB.

ขอบเขต `SchoolId` และการอ้างอิง FK แบ่งเป็น 3 กลุ่มตาม `decisions-026.md` และ `db/review-001.md`:
1. **Global เท่านั้น (`SchoolId IS NULL` — 8 ตาราง)**: `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank` — ความสัมพันธ์ระหว่างตาราง Global และการอ้างจากตารางของโรงเรียนมายังตาราง Global ใช้ single-column FK (และ `(MissionId, CriteriaId)` สำหรับ `SchoolBotSubmission` → `SchoolBotCriteria`) ไม่ใช้ composite FK ที่มี `SchoolId` เพราะ SQL `MATCH SIMPLE` จะข้ามการตรวจทันทีเมื่อ `SchoolId` เป็น `NULL`.
2. **Mixed Global/Tenant (`SchoolId IS NULL OR SchoolId > 0` — 3 ตาราง)**: `SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent` — ใน physical DDL ใช้ partial unique index แยก 2 ตัว (`WHERE "SchoolId" IS NULL` และ `WHERE "SchoolId" IS NOT NULL`).
3. **Tenant เท่านั้น (`SchoolId > 0` — 22 ตาราง)**: ความสัมพันธ์ภายในโรงเรียนเดียวกันใช้ composite FK `(SchoolId, ...)` คู่กับ unique constraint `(SchoolId, <PK>)` เพื่อบังคับระดับฐานข้อมูลว่า parent และ child อยู่โรงเรียนเดียวกันเสมอ.

วง FK ของ current pointer ทั้ง 4 คู่ (`SchoolBotLicense.CurrentBindingId`, `SchoolBotProject.CurrentRevision`, `SchoolBotSubmission.CurrentAssessmentId`, `SchoolBotCourseRun.CurrentPolicyId`) กำหนดใน physical DDL เป็น `DEFERRABLE INITIALLY DEFERRED` เพื่อให้สร้างแถวหลัก/แถวลูกและอัปเดต pointer ใน transaction เดียวกันได้.

`Owner`/`Profile` เป็น polymorphic; ใช้ `SchoolId`+`kind`+legacy ID ตรวจใน trusted adapter ห้าม FK ไปสองตารางพร้อมกัน. `ResourceId`/`EntityId` ไม่มี physical FK เพราะเลือกชนิดตาม `Operation`/`EntityType`.

## สิ่งที่ diagram ยังไม่บังคับ (บังคับใน physical DDL และ application contract)

- **Partial unique indexes**:
  - 1 active binding ต่อ License (`WHERE "DetachedAt" IS NULL AND "IsDelete" = false`)
  - live uniqueness ของ `SchoolBotStaffRole` และ `SchoolBotTeacherGrant` (`WHERE "IsDelete" = false`)
  - 1 active `SchoolBotCourseRun` ต่อห้อง/ปี/เทอม (`WHERE "Lifecycle" IN ('planned','active','closing') AND "IsDelete" = false`) และ 1 successor ต่อ `PreviousRunId`
  - 1 active ownership ของ `SchoolBotGradeSlot` ต่อ `(SchoolId, NGradeId, AssessmentId, ScoreIdentifier)` เมื่อ `"RetiredAt" IS NULL` (**ไม่กรอง `IsDelete = false`** เพื่อห้ามหลบ ownership ด้วย soft-delete)
  - 1 active `SchoolBotScoreMapping` ต่อ `(CourseRunId, GradeSlotId)` เมื่อ `"RetiredAt" IS NULL AND "IsDelete" = false`
  - 1 finalized `SchoolBotLevelProposal` (`promoted|retained|max_level`) ต่อ `CourseRunId`
- **กฎ `SchoolBotSession` ตาม `decisions-025/026`**:
  - `Channel = 'desktop'` ต้องมี `DeviceJkt IS NOT NULL` และ `AccountId IS NOT NULL`; อนุญาตให้ bind `ProfileKind` ได้ทั้ง `'student'` และ `'employee'` (ใช้เรียน/ลองเท่านั้น ไม่มีเมนูครู/ส่งคะแนนใน Desktop)
  - `Channel IN ('school_web', 'staff_admin')` ต้อง `DeviceJkt IS NULL`; โดยช่อง `school_web` ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ไม่ต้องมี device binding)
- **คอลัมน์ Array และ Enum**:
  - `SchoolBotCourseRun.PlanCourseIds` แสดงใน DBML เป็น `jsonb` เพื่อไม่ให้ชนกับ syntax `[...]` ของ DBML parser บน `dbdiagram.io` ส่วน physical SQL ใน `db/004` ใช้ `integer[]` (`int4[]`) พร้อม `CHECK (cardinality("PlanCourseIds") >= 1)`
  - Enum ใน DBML แสดงค่าที่เป็นไปได้เพื่อการรีวิว ส่วน physical SQL ใช้ `varchar` คู่กับ `CHECK (... IN (...))` ตาม `db/review-001.md`

## สถานะการอนุมัติและสิ่งที่ยังรอ

- **อนุมัติแล้วตาม [decisions-026.md](../requirement/decisions-026.md)**: Logical baseline ทั้ง 33 ตาราง, breaking changes ทั้ง 6 จุด และการแก้ 2 จุดตาม `decisions-025.md` (ปิดประตู `H4` ฝั่งการอนุมัติแบบ).
- **ยังไม่อนุมัติในมตินี้**:
  - การรัน SQL `db/001–007` (ต้องให้มนุษย์รันบนฐานทดสอบและส่งผลให้ `DBA-003` ตรวจ)
  - การรัน `db/007_pggradedb_grants.sql` บน PGGradeDB (รอผ่าน release gates ทั้งห้า `G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, `G-DB` ของ [des-009.md](des-009.md))
  - การตัดสินใจสร้างตารางสำรอง `SchoolBotTeacherGrant`
  - การเปิด endpoint `web-principal` ใน gateway และ config `H5`

## Change Log

- 2026-10-22 — Rev2: sync ครบ 33 ตารางตามมติอนุมัติ decisions-026 และ physical design ใน db/review-001.md; อัปเดตกฎ global/tenant FK, deferred pointers, partial unique indexes และกฎ Session/Desktop/License ตาม decisions-025/026
- 2026-10-21 — MYCELIUM บันทึกผล SA/DBA, ตรวจ parser ทั้งสองแบบ และคงส่วนที่ต้องทบทวนใน index
- 2026-10-21 — จัดทำ diagram handoff ตามมติ PK int4 โดยไม่แก้ไฟล์หรือฐานข้อมูล
