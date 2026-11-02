# TP-001 — บัญชีและพื้นที่ Guest (TP001-030–TP001-030)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-030"></a>

## TP001-030 — ย้ายประวัติแล้วตรวจใหม่

AC: [AC-042-04 (เปลี่ยน client ให้รายงานผ่าน แต่ชิ้นงาน Code/Block ไม่ผ่านเกณฑ์…)](../requirement/req-042.md), [AC-042-05 (ย้ายประวัติ Arm แล้วแสดงรอครูตรวจ ไม่นับผ่านก่อนครูที่มีสิทธิ์บันทึกผล)](../requirement/req-042.md), [AC-042-06 (เปิดประวัติที่ย้ายแล้วแยกผล Guest กับผลตรวจใหม่ได้ อ้างภารกิจ/งานถูกต้อง…)](../requirement/req-042.md) · References: [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), [BR-042-03 (ก่อนนับผลในบัญชีต้องตรวจใหม่: Code/Block อัตโนมัติตามเกณฑ์ที่อนุมัติ)](../requirement/req-042.md), [BR-042-04 (ไม่เชื่อผลผ่านจาก client)](../requirement/req-042.md) · Level: integration · Profiles: PF-API, PF-LEGACY, PF-WEB

เงื่อนไขก่อนตรวจ: client แก้ให้รายงานผ่านแต่ Code/Block ไม่ผ่านเกณฑ์; ประวัติ Arm; grader ล้ม

ขั้นตอน: ย้ายประวัติแล้วตรวจใหม่; ครูตรวจ Arm; เปิดประวัติที่ย้าย

ผลที่คาด: ไม่ผ่านตามค่าที่ client ส่ง; Arm รอครู ไม่นับผ่านก่อนครูมีสิทธิ์; ตรวจใหม่ล้มเหลวไม่ผ่านเอง; ประวัติแยกผล Guest/ผลตรวจใหม่ อ้างภารกิจ/งานถูก ไม่ติดป้ายตัวตนที่ยืนยันแล้ว; server **ไม่รับ** local_result/score/stars/learner_id/submitted_at จาก client; employee→`403 PROFILE_NOT_ALLOWED`; ตรวจ mission/criteria published+สัมพันธ์+mode ตรง Activity+hash ที่ server คำนวณ; ผิด→`409 CONTENT_NOT_PUBLISHED`/`CRITERIA_NOT_APPROVED`/`400 PROGRAM_INVALID`/`413`; transaction เดียวสร้าง Project สำเนา snapshot+ProjectRevision+Submission+GradingJob(Code/Block)+Idempotency+Audit; Arm เริ่ม awaiting_teacher; infra fail→error/`503 GRADER_UNAVAILABLE` ไม่ passed; retry history เดิมไม่สร้างซ้ำ; SubmissionView `origin=guest_recheck` derive จาก audit `Event=GuestHistory.Recheck` `Reason=guest-history:<UUID>;guest-project:<UUID>;snapshot:<SHA256>`; แยกผล local จากผลตรวจใหม่ ไม่เติม assessment ว่างด้วย passed เดิม; replay หมดอายุ→อ่าน Submission เดิมด้วย resource_id

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
