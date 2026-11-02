# DES-005 — หลักสูตร ภารกิจ และผลประเมิน — การประเมิน การเปลี่ยนสถานะ และการกันคำขอซ้ำ

> Rev 8 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-005 — หลักสูตร ภารกิจ และผลประเมิน](des-005.md)

ชนิดข้อมูลที่ใช้: `P` = profile ที่ระบุโรงเรียน kind และ id ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## อ้างอิง

- [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md)
- [มติ 028 (ชนิดคอลัมน์ CreateBy/UpdateBy)](../requirement/decisions-028.md)
- [มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../requirement/decisions-027.md)
- [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md)

## การประเมิน การเปลี่ยนสถานะ และการกันคำขอซ้ำ

Code/Block:
`queued → grading → evaluated` หรือ `error`
Arm:
`awaiting_teacher → evaluated`
การเปิด/ปิดบทเรียนไม่สร้าง submission หรือ passed

**การตรวจความสอดคล้องของ FK และ Tenant ใน Application:**
ฐานปัจจุบันในschoolbot_db.sqlคงเฉพาะPK ไม่มีSQL FK/UQ/CHECK; applicationต้องserializeด้วยtransactionlocksและตรวจความสัมพันธ์/ความไม่ซ้ำ/tenantก่อนบันทึกทุกครั้งว่า:
1. `Mission`/`Criteria`/`Activity`/`Curriculum` เป็น published global content (`SchoolId=null`) และ `Criteria.MissionId == Submission.MissionId`
2. `ProjectRevision` และ `Project` อยู่ `SchoolId` เดียวกับ session, เป็นของนักเรียนคนนั้นจริง (`Project.OwnerKind == 'student'` และ `Project.OwnerId == session.ProfileId`), และ `Project.Mode` ตรงกับ `Activity.Mode` ของ project activity ที่อ้าง `Mission` นั้น (ป้องกันครู `P=employee` ส่งงานปนกับนักเรียนที่มี `sId == sEmp`)
3. Server ไม่รับ commands/score ที่ UI อ้าง; Code parse Domain-Specific Language (DSL) ใหม่; Block compile normalized tree ใหม่ ใช้ bounds เดียวกับ DES-003 และ demo: 1–64 commands, ≤100 steps; ไม่ eval Python/JavaScript

Worker ใช้ durable `GradingJob`+lease (`CreateBy/UpdateBy = null` เมื่อ worker ทำเองตาม [decisions-028](../requirement/decisions-028.md)); infrastructure รัน trusted bounded evaluator โดยไม่มีสิทธิ์ network/files ของ source นักเรียน ระบบต้องมี golden vectors เทียบ host/server เพื่อกัน semantics ต่างกัน ผล automatic บันทึก evaluator version และ rule results; `passed` และคะแนนตัวเลข (เมื่อมี approved numeric rubric) คำนวณตามเกณฑ์ที่อนุมัติ

Business validation ของโปรแกรมผิดคืน `400 PROGRAM_INVALID` ก่อนรับ submission; infrastructure grader ล้มเหลวเป็น `error` ไม่ใช่ `not_yet` เสนอ retry transient สูงสุด 3 ครั้งด้วย lease เดิม หลังนั้นให้ผู้ดูแล retry โดยไม่สร้าง submission ซ้ำ

**Placement, Transaction และการ Re-check ข้าม DB ([decisions-027](../requirement/decisions-027.md), [decisions-030](../requirement/decisions-030.md)):**
- ตาราง `SchoolBotSubmission`, `SchoolBotGradingJob`, `SchoolBotAssessment`, `SchoolBotAuditEvent`, `SchoolBotIdempotency` อยู่ใน **SchoolBot DB (`10.0.0.128:9499`)**
- ตอนสร้าง `SchoolBotAssessment` (ทั้งจาก worker อัตโนมัติและจากครูตรวจ Arm) ต้องล็อกแถวแม่ `SchoolBotSubmission` (`SELECT ... FOR UPDATE`) ใน SchoolBot DB (สำหรับครูตรวจต้องตรวจ `UpdateDate` ตรงกับ `If-Match` แล้วตั้ง `UpdateDate = clock_timestamp()`), คำนวณ `Sequence` ถัดไป, ตรวจว่า `SupersedesId` (ถ้ามี) อยู่ใน `SubmissionId` เดียวกัน, และ commit `Assessment`, `Submission.CurrentAssessmentId`, `GradingJob` และ audit ใน **SchoolBot DB transaction เดียว**
- สำหรับการตรวจงาน Arm โดยครู (`POST /submissions/{id}/assessments` บน `school_web`): เนื่องจากสิทธิ์ครูรายวิชา (`TplanCourseTeacher`) และห้องเรียนของนักเรียนอยู่ใน **School DB** คนละฐานข้อมูลกับ SchoolBot DB จึงต้องอ่านและ **re-check สิทธิ์ครูจาก School DB (และสถานะ `SchoolBotLicense` ใน SchoolBot DB) ณ จุดก่อน commit ใน SchoolBot DB**

Arm ไม่ใช้ telemetry/write/timer เป็นผ่าน ครูตรวจผ่านหน้าเว็บใน `web-system` (`Channel=school_web`) เลือก `outcome` พร้อม `feedback` และ `rule_results` ครบ rubric; `AssessorId` และ `CreateBy/UpdateBy` มาจาก `sEmp` ของ auth การแก้ผลสร้าง `Assessment` sequence ใหม่พร้อม `supersedes_id` และเหตุผล ไม่ overwrite ผลเก่า

Progress derive จากผลล่าสุดของแต่ละ activity/mission revision แสดง `awaiting_teacher`/`error` แยกจาก `passed` มี history ให้ตรวจย้อนกลับ ไม่รวมดาว/คะแนนหรือ carry-forward ต่าง revision โดยอัตโนมัติ

