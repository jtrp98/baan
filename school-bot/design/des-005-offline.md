# DES-005 — หลักสูตร ภารกิจ และผลประเมิน — การใช้ออฟไลน์ Guest และข้อผิดพลาด

> Rev 8 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-005 — หลักสูตร ภารกิจ และผลประเมิน](des-005.md)

## อ้างอิง

- [REQ-040 (พื้นที่ร่วมและถังขยะ Guest)](../requirement/req-040.md)
- [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../requirement/decisions-032.md)
- [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md)

## การใช้ออฟไลน์ Guest และข้อผิดพลาด

เสนอ signed published content bundle สำหรับ local lessons; local Code/Block result ระบุ `authority:"local"` ไม่เป็น Cloud assessment จน server ตรวจ snapshot ใหม่

การนำเข้าโครงงานและตรวจผลใหม่ของ Guest ใช้ REQ-040, [REQ-041 (เลือกนำเข้าโครงงาน Guest)](../requirement/req-041.md), [REQ-042 (ประวัติเรียน Guest และตรวจผลใหม่)](../requirement/req-042.md): [workspace/trash/export](guest-workspace-001.md), [Project import/receipt](guest-import-001.md), [local history/recheck/provenance](guest-history-001.md). Login/import Project ไม่สร้างผลเรียน; history recheck ใช้ snapshot ที่เลือก, idempotency และผล server/ครูใหม่ ไม่รับ local score. SubmissionView มี origin ที่ derive จาก audit ตาม guest-history; ไม่เพิ่มคอลัมน์. Employee ห้ามส่งงานรวม Guest history ตาม decisions-032

ครูอ่าน/ตรวจ Arm ใช้ authority ตารางเดียวใน [DES-004 §Authority](des-004-permissions.md#authority-เดียวของรายชื่อนักเรียนที่ได้รับมอบหมาย): course-teacher ∩ roster ∩ term บน School DB ตรวจ tenant ทุก join และ re-check ก่อน commit; ไม่สร้าง TeacherGrant หรือให้ครูทั้งโรงเรียนจากชื่อเมนู. Unknown roster/status/time resolver ต้อง fail closed ไม่ใช้ผล local มาทดแทน

ข้อผิดพลาด: `403 FORBIDDEN, CHANNEL_NOT_ALLOWED, PROFILE_NOT_ALLOWED, STAFF_ROLE_REQUIRED, SUBJECT_PERMISSION_REQUIRED, LICENSE_REQUIRED`; `409 CONTENT_NOT_PUBLISHED, CRITERIA_NOT_APPROVED, FOUR_EYES_REQUIRED, ASSESSMENT_METHOD_MISMATCH, STATE_CONFLICT`; `412 VERSION_CONFLICT` (`UpdateDate` ไม่ตรง `If-Match`); `503 GRADER_UNAVAILABLE`

## ทางเลือกและการตรวจ

เลือก global immutable curriculum (`SchoolId=null`) + แยก `Mode` ไปไว้ที่ `Activity` + server grading + four-eyes publish; ปัดตก client stars, run-success=passed, การผูก `Curriculum` กับโหมดเดียว และการแก้เกณฑ์ย้อนหลัง ทดสอบตัวอย่างผ่าน/ไม่ผ่านที่เจ้าของเนื้อหาให้, การนำเข้า Sheet เป็นร่าง, ผู้สร้างกด publish เองถูกปฏิเสธ (`FOUR_EYES_REQUIRED`), queue restart, duplicated submit, ครูสองคนตรวจชนกัน (`412 VERSION_CONFLICT` จาก `UpdateDate`) และ isolation ตาม [AC-037 (เกณฑ์ตรวจรับเรื่องหลักสูตรและภารกิจสามโหมด)](../requirement/req-037.md), [AC-038 (เกณฑ์ตรวจรับเรื่องประเมิน Code/Block อัตโนมัติและ Arm โดยครู)](../requirement/req-038.md), [AC-039 (เกณฑ์ตรวจรับเรื่องความคืบหน้าและการติดตามโดยครู)](../requirement/req-039.md) และ [AC-043 (เกณฑ์ตรวจรับเรื่องหลักสูตรกลางแบบ Level และ Activity)](../requirement/req-043.md), [AC-044 (เกณฑ์ตรวจรับเรื่องรหัสบทเรียนและ revision หลักสูตร)](../requirement/req-044.md), [AC-045 (เกณฑ์ตรวจรับเรื่องนำเข้า Course Plan Sheet)](../requirement/req-045.md) ทุกข้อ

อ่าน canonical [กฎผลเรียน](learning-rules-032-034.md)
