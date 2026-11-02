# TP-001 — บทเรียนและผลประเมิน (TP001-058–TP001-061)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-058"></a>

## TP001-058 — ขอรายชื่อ/ผลนักเรียน

AC: [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../requirement/req-038.md), [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../requirement/req-039.md) · References: [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md), [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), learning-rules-032-034 · Level: integration · Profiles: PF-WEB, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: ครู X ไม่ได้ assigned; นักเรียนห้องเดียวกัน; นักเรียนต่างโรงเรียน; รู้ submission/learner ID; สิทธิ์ถูกถอนระหว่างทำรายการ

ขั้นตอน: ขอรายชื่อ/ผลนักเรียน; ตรวจ Arm; ถอนสิทธิ์ก่อน commit; เรียก desktop token กับ endpoint ครู

ผลที่คาด: ไม่เห็นข้อมูล/ตรวจไม่ได้ (403/404) ผลเดิมไม่เปลี่ยน; recheck ก่อน commit ปฏิเสธ in-flight; CHANNEL_NOT_ALLOWED; ใช้ authority `course-teacher ∩ roster ∩ term` ตาม teacher-authority Rev1 — ครูไม่มี TPlanCourseTeacher active ใน scope→ไม่เห็น/ตรวจไม่ได้ (`403 SUBJECT_PERMISSION_REQUIRED` หรือ 404); การเป็นครูอีกคนในห้องเดียวกันหรืออยู่ใน PlanCourseIds ของ run ไม่เปิดสิทธิ์; ถอนสิทธิ์ก่อน commit→re-check ปฏิเสธ in-flight; ผลเดิมไม่เปลี่ยน

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-059"></a>

## TP001-059 — restart แล้วเปิดใหม่

AC: [AC-039-01 (นักเรียน Login ทำภารกิจและได้ผลแล้ว…)](../requirement/req-039.md), [AC-039-02 (ครูที่มีสิทธิ์เห็นสถานะและผลตรงกับประวัติจริงของผู้เรียนที่รับผิดชอบ)](../requirement/req-039.md), [AC-039-03 (ภารกิจ Arm ที่ยังไม่ตรวจแสดงแยกจากภารกิจที่ครูยืนยันผลแล้ว)](../requirement/req-039.md), [AC-039-04 (ผล Block/Arm/Code ของผู้เรียนไม่ปะปนกับบัญชีอื่นหรือค่าจาก scenario)](../requirement/req-039.md) · References: DES-005, BR-039 · Level: integration · Profiles: PF-API, PF-WEB, PF-LEGACY

เงื่อนไขก่อนตรวจ: นักเรียน Block/Arm/Code ผลหลายสถานะ; scenario/sample; ผลครูทดลอง; บัญชีอื่น

ขั้นตอน: restart แล้วเปิดใหม่; ครูดู /learners/{id}/progress; logout/login บัญชีอื่น

ผลที่คาด: นักเรียนเห็นผลของตนไม่ปนครู; ครูที่มีสิทธิ์เห็นตรงประวัติ; Arm ยังไม่ตรวจแยกจากยืนยันแล้ว; ไม่ปนข้ามบัญชี/โหมด/scenario

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-060"></a>

## TP001-060 — สร้าง/แก้ (staff vs school)

AC: [AC-043-01 (ส่วนกลางสร้าง/แก้หลักสูตรได้)](../requirement/req-043.md), [AC-043-02 (เปิด Course แล้วเห็น Level ระดับชั้นเริ่มต้น วิชาที่ผูก และ…)](../requirement/req-043.md), [AC-043-03 (ห้องใช้ Level ต่างจากค่าเริ่มต้นของระดับชั้นได้ โดยยังอ้าง Level ที่เลือก)](../requirement/req-043.md), [AC-043-04 (Lesson เดียวเปิด Activity ครบชนิดใน BR-043-03 และภารกิจสาม Mode ได้…)](../requirement/req-043.md) · References: DES-005, BR-043 · Level: integration · Profiles: PF-ADMIN, PF-WEB, PF-API

เงื่อนไขก่อนตรวจ: staff content_author; admin/ครูโรงเรียน; Course/Level/Subject/RecommendedGrades; Lesson มี slide/แผนครู/งาน/mission×3/quiz/test

ขั้นตอน: สร้าง/แก้ (staff vs school); เลือกใช้; CourseRun ใช้ Level ต่างจากค่าเริ่ม

ผลที่คาด: ส่วนกลางแก้ได้ โรงเรียนเลือกใช้แต่แก้เนื้อหากลางไม่ได้ (403); เห็น Level/ชั้นเริ่มต้น/วิชา/Lesson/Activity; Level ต่างจากค่าเริ่มต้นได้และอ้าง Level ที่เลือก; mission แต่ละอันใช้ Mode ตน

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-061"></a>

## TP001-061 — สลับลำดับ Lesson

AC: [AC-044-01 (สลับลำดับ Lesson ผ่านข้อมูลแล้วลำดับเปลี่ยน รหัสและการอ้างผลเดิมคงเดิม…)](../requirement/req-044.md), [AC-044-02 (แก้เนื้อหาฉบับร่างแล้วเปิดดูเนื้อหาใหม่ได้โดยไม่แก้โค้ด)](../requirement/req-044.md), [AC-044-03 (revision ที่ไม่มีหลักฐานอนุมัติเผยแพร่ไม่ได้)](../requirement/req-044.md), [AC-044-04 (เมื่อ publish revision ใหม่ ผู้เรียนเดิมยังเปิดฉบับเดิมและดูผลเดิมได้)](../requirement/req-044.md), [AC-044-05 (ขอแก้ฉบับ publish แล้วฉบับเดิมไม่เปลี่ยน)](../requirement/req-044.md) · References: DES-005, BR-044 · Level: integration · Profiles: PF-ADMIN, PF-API

เงื่อนไขก่อนตรวจ: staff A (author), B (approver), C ไม่มี role; ผู้เรียนอยู่ revision 1

ขั้นตอน: สลับลำดับ Lesson; แก้ draft; publish ไม่มี approval_ref; A อนุมัติเอง; C อนุมัติ; B อนุมัติ; publish rev 2; พยายามแก้ rev 1; If-Match stale

ผลที่คาด: ลำดับเปลี่ยนรหัส/ผลอ้างเดิมคงเดิม ไม่แก้โค้ด; draft แก้แล้วเห็นใหม่; ไม่มีหลักฐาน→เผยแพร่ไม่ได้; A→FOUR_EYES_REQUIRED, C→STAFF_ROLE_REQUIRED, ผู้อนุมัติจาก session ไม่ใช่ body; ผู้เรียนเดิมยังเปิด rev 1/ผลเดิม; แก้ฉบับ publish→revision ใหม่ ฉบับเดิมไม่เปลี่ยน; 412 VERSION_CONFLICT มาจาก If-Match(UpdateDate) ไม่ใช่ version field; ขาด If-Match→428

หลักฐานที่ต้องเก็บ: E-API+audit

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
