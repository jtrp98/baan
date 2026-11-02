# สัญญาอ้างอิง — Legacy refs / placement

[กลับคู่มือ](../data-model.md) · [สารบัญสัญญา](contract-index.md)

ข้อความจาก data-model Rev5 คงชื่อฟิลด์ ชนิด และกฎเดิม ใช้คู่กับคำอธิบายรายตาราง

## Legacy refs / placement

ถอน `SchoolBotUser` ไม่คัดลอกบัญชี/password หรือเพิ่ม identity mapping table; `SchoolBotSession` เก็บสิทธิ์เข้าใช้งานที่เพิกถอนได้แยกตาม `Channel` (`desktop|school_web|staff_admin`) ไม่ใช่บัญชีใหม่ ทุกตารางข้างต้นมี prefix/PK และ common columns ครบ

`Owner=(SchoolId,OwnerKind,OwnerId)`; ใน schema ปัจจุบัน `LearnerId` ใน `SchoolBotSubmission`, `SchoolBotAttempt`, `SchoolBotRetakeGrant` และ `SchoolBotScorePreviewItem` คือ `student` (`TUser.SId`) เท่านั้น (ป้องกัน `sEmp` ของครูบน Desktop ชนกับ `sId` นักเรียน — ดูข้อเสนอทางเลือกใน `db/proposal-learnerkind.md` (memory)); `TeacherId`/`AssessorId`/`EmployeeId` คือ `employee` (`TEmployees.SEmp`) ใช้ `SchoolId` ของ row ประกอบ `P`; API legacy `*_id:I` ใช้ context/kind เดียวกัน (`owner` มี `owner_kind`); resource IDs ของ SchoolBot เป็น `K`

`SchoolBotTeacherGrant` (`TeacherId:I, LearnerId:I, Mode:Mode, CanView:B, CanAssess:B, ValidFrom:D, ValidUntil:D?`) เป็นทางสำรอง (conditional fallback) ตาม [des-004.md](../des-004.md) ซึ่งยังไม่ได้ตัดสินให้สร้างและถอนออกจาก DDL ปัจจุบันตาม [decisions-026.md](../../requirement/decisions-026.md) และ `db/review-005.md` (memory)

ที่ตั้งฐานข้อมูลตาม [decisions-027.md](../../requirement/decisions-027.md) และ [decisions-029.md](../../requirement/decisions-029.md):
- **SchoolBot DB (`10.0.0.128:9499`, ชื่อ DB `SchoolBot` เป็นสมมติฐาน, schema `public`)**: วาง **ทุกตารางของ SchoolBot (32 ตาราง)** ในฐานข้อมูลของ SchoolBot เอง ([db/schoolbot_db.sql](../../db/schoolbot_db.sql)) เพื่อให้การ commit domain + `SchoolBotIdempotency` + `SchoolBotAuditEvent` (รวมถึงการตรวจ `SchoolBotLicense` และ `SchoolBotStaffRole`) อยู่ใน transaction เดียวของ SchoolBot DB
- **4 DB เดิมของ SchoolBright (Master, School, Logs, PGGradeDB)**: ต่อผ่าน connection แยกด้วย**บัญชี DB เดิม**ที่ระบบ SchoolBright ใช้อยู่แล้ว โดย**ไม่รัน GRANT/REVOKE หรือสร้าง role ใหม่**ใน School DB และ PGGradeDB ([decisions-029.md](../../requirement/decisions-029.md)):
  - **Master DB**: อ่านบัญชี (`TMasterDBUser`) ตอน login ช่อง `desktop`
  - **School DB (`JabjaiSchoolSingleDB`)**: อ่าน profile (`TUser`, `TEmployees`), สถานะโรงเรียน (`TCompany`), แผนการเรียน/สิทธิ์ครูรายวิชา (`TPlanCourse`, `TPlanCourseTeacher`, `TPlanCourseTerm`, `TPlanTermSubLevel2`), เทอม (`TTerm`) และรายชื่อนักเรียนในห้อง (`TStudentClassroomHistory`) — เนื่องจากอยู่คนละ DB กับ SchoolBot DB จึง**ไม่มี transaction เดียวครอบข้าม DB**; ทุก mutation ที่พึ่งข้อมูลจาก School DB ต้อง **re-check สิทธิ์ครู/roster/term ก่อน commit ใน SchoolBot DB**
  - **Logs DB**: ใช้ตามกรณีที่ระบุ
  - **PGGradeDB**: SchoolBot เขียนเฉพาะช่องเกรดที่เป็นเจ้าของตาม [des-009.md](../des-009.md) หลังผ่าน release gates ทั้งห้า (`G-PARITY`, `G-COEXIST`, `G-TARGET`, `G-AUTHZ`, และ `G-DB` ซึ่งหมายถึงการยืนยันบัญชี DB เดิมที่ใช้และเจ้าของระบบเกรดยอมให้ใช้ตาม [decisions-029.md](../../requirement/decisions-029.md)) โดยบังคับขอบเขตการเขียนเฉพาะช่องที่เป็นเจ้าของในโค้ด adapter
