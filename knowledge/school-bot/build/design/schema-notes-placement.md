# ตำแหน่งฐานข้อมูลและขอบเขตการอ้างอิง

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับหมายเหตุ schema Rev7](schema-notes.md)

## Placement และ integrity

ตาม[มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../../shared/decisions/decisions-027.md) และ [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md):
- วางทุกตารางของ SchoolBot (**32 ตาราง**) ใน **SchoolBot DB** (host `10.0.0.128` port `9499`, ชื่อ DB ยังต้องยืนยันตามรายการท้ายไฟล์, schema `public`) เพื่อ commit domain + `SchoolBotIdempotency` + `SchoolBotAuditEvent` แบบ atomic ในฐานข้อมูลเดียว ([db/schoolbot_db.sql](../db/schoolbot_db.sql) ไม่สร้าง database role หรือกำหนดสิทธิ์ฐานข้อมูล).
- การเชื่อมต่อกับ 4 ฐานข้อมูลเดิมของ SchoolBright (Master, School, Logs, PGGradeDB) ใช้ connection แยกด้วย **บัญชี DB เดิม** ของระบบ โดย**ไม่รัน GRANT/REVOKE หรือสร้าง role ใหม่**ใน School DB หรือ PGGradeDB ([มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md)).
- เนื่องจากตาราง SchoolBot อยู่คนละฐานข้อมูลกับ School DB จึง**ไม่มี transaction เดียวครอบข้าม DB**: การตรวจสิทธิ์ครูรายวิชา/ผู้ดูแลโรงเรียน, รายชื่อนักเรียนในห้อง (roster) และสถานะภาคเรียน (term) จาก School DB ต้องอ่านผ่าน connection แยกและ **re-check ก่อน commit** ใน SchoolBot DB ทุกครั้ง (ส่วนการตรวจ `SchoolBotLicense` และ `SchoolBotStaffRole` อยู่ใน SchoolBot DB เดียวกัน).

ขอบเขต `SchoolId` และการอ้างอิง FK ตามผลตรวจที่ระบุท้ายไฟล์:
1. **Global เท่านั้น (`SchoolId IS NULL` — 8 ตาราง)**: `SchoolBotLevel`, `SchoolBotLevelPromotionPolicy`, `SchoolBotCurriculum`, `SchoolBotLesson`, `SchoolBotMission`, `SchoolBotCriteria`, `SchoolBotActivity`, `SchoolBotQuestionBank`
2. **Mixed Global/Tenant (`SchoolId IS NULL OR SchoolId > 0` — 3 ตาราง)**: `SchoolBotRelease`, `SchoolBotIdempotency`, `SchoolBotAuditEvent` — Release และ Idempotency คงกฎไม่ซ้ำผ่าน application/repository transaction locks แยก global/tenant ตาม data-contract-rules.md; AuditEvent คง append-only ไม่มี partial unique index บังคับกฎดังกล่าว.
3. **Tenant เท่านั้น (`SchoolId > 0` — 21 ตาราง)**: ตารางอื่นทั้งหมด.
4. **การตัดทอน Index, Composite FK และคอลัมน์ซ้ำซ้อน**:
   - ถอน standalone indexes ทั้ง unique/non-unique ออกทั้งหมด (0 ตัว); คงเฉพาะ backing indexes ของ PK
   - ถอน FOREIGN KEY ทั้ง 40 เส้นและ UNIQUE/CHECK ทั้งหมด; relationships เดิมเป็น logical references ใน dictionary และภาพ integration ไม่ใช่ SQL constraints
   - ตัดคอลัมน์ `SchoolBotScoringPolicy.CurriculumId` (อ่านจาก `CourseRun.CurriculumId` แทน) และ `SchoolBotScoreOutbox.ScorePreviewId`
   - ตัด `UQ_SchoolBotAssessment_Submission_Sequence` และ `UQ_SchoolBotAttempt_Learner_Seq` (ใช้ row/learner lock ก่อนจัดสรร `Sequence` แทน)

current pointers ทั้ง 4 คู่ยังมีคอลัมน์เดิม แต่ไม่มี FK/DEFERRABLE เพิ่มผ่าน DO block; application ต้องตรวจความถูกต้องเอง

`Owner`/`Profile` เป็น polymorphic; ใช้ `SchoolId`+`kind`+legacy ID ตรวจใน trusted adapter ห้าม FK ไปสองตารางพร้อมกัน. ใน schema ปัจจุบัน `LearnerId` รับเฉพาะ `student` (`sId`) เพื่อกัน `sEmp` ของครูชนกับ `sId` นักเรียน (ดูข้อเสนอทางเลือกในหลักฐานท้ายไฟล์).

## ยังไม่ยืนยัน

ชื่อ database `SchoolBot` ยังต้องยืนยันจาก configuration หรือ catalog จริง

## หลักฐาน

- db/review-005.md (memory): ขอบเขต tenant และการตัดคอลัมน์ซ้ำ
- db/proposal-learnerkind.md (memory): ทางเลือกเดิมเรื่องรหัสผู้เรียน
