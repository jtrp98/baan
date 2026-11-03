# TP-001 — บทเรียนและผลประเมิน (TP001-058–TP001-061)

> Rev 3 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยกเคส normal/full ก่อนพัฒนาและตรวจรับ)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-062-detail"></a>

## รายละเอียด TP001-062 — นำเข้า Course Plan

ใช้ [fixture/actors TP001-062](tp-001-cases-quiz-grade-import.md) และ [ผล response+state พร้อม TP001-093](tp-001-cases-quiz-grade-import-cases.md) สำหรับ AC-045-01..04 (draft/ที่มา, ตัด O, สื่อชุดสอง, identity ถาวร) ส่วน preview เริ่มได้ แต่ persistence รอ arch ตรึง storage provenance และ commit/read-back endpoint; ทุกผลจริง NOT_RUN ไม่เปลี่ยน TP001-060/061 หรือ TP001-084–087 ที่ใช้อยู่

<a id="tp001-058"></a>

## TP001-058 — ขอรายชื่อ/ผลนักเรียน

AC: [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../../modules/quiz/shared/requirements/req-038.md), [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../../modules/quiz/shared/requirements/req-039.md) · References: [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md), [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), learning-rules-032-034 · Level: integration · Profiles: PF-WEB, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: ครู X ไม่ได้ assigned; นักเรียนห้องเดียวกัน; นักเรียนต่างโรงเรียน; รู้ submission/learner ID; สิทธิ์ถูกถอนระหว่างทำรายการ

ขั้นตอน: ขอรายชื่อ/ผลนักเรียน; ตรวจ Arm; ถอนสิทธิ์ก่อน commit; เรียก desktop token กับ endpoint ครู

ผลที่คาด: ไม่เห็นข้อมูล/ตรวจไม่ได้ (403/404) ผลเดิมไม่เปลี่ยน; recheck ก่อน commit ปฏิเสธ in-flight; CHANNEL_NOT_ALLOWED; ใช้ authority `course-teacher ∩ roster ∩ term` ตาม teacher-authority Rev1 — ครูไม่มี TPlanCourseTeacher active ใน scope→ไม่เห็น/ตรวจไม่ได้ (`403 SUBJECT_PERMISSION_REQUIRED` หรือ 404); การเป็นครูอีกคนในห้องเดียวกันหรืออยู่ใน PlanCourseIds ของ run ไม่เปิดสิทธิ์; ถอนสิทธิ์ก่อน commit→re-check ปฏิเสธ in-flight; ผลเดิมไม่เปลี่ยน

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-059"></a>

## TP001-059 — restart แล้วเปิดใหม่

AC: [AC-039-01 (นักเรียน Login ทำภารกิจและได้ผลแล้ว…)](../../modules/quiz/shared/requirements/req-039.md), [AC-039-02 (ครูที่มีสิทธิ์เห็นสถานะและผลตรงกับประวัติจริงของผู้เรียนที่รับผิดชอบ)](../../modules/quiz/shared/requirements/req-039.md), [AC-039-03 (ภารกิจ Arm ที่ยังไม่ตรวจแสดงแยกจากภารกิจที่ครูยืนยันผลแล้ว)](../../modules/quiz/shared/requirements/req-039.md), [AC-039-04 (ผล Block/Arm/Code ของผู้เรียนไม่ปะปนกับบัญชีอื่นหรือค่าจาก scenario)](../../modules/quiz/shared/requirements/req-039.md) · References: DES-005, BR-039 · Level: integration · Profiles: PF-API, PF-WEB, PF-LEGACY

เงื่อนไขก่อนตรวจ: นักเรียน Block/Arm/Code ผลหลายสถานะ; scenario/sample; ผลครูทดลอง; บัญชีอื่น

ขั้นตอน: restart แล้วเปิดใหม่; ครูดู /learners/{id}/progress; logout/login บัญชีอื่น

ผลที่คาด: นักเรียนเห็นผลของตนไม่ปนครู; ครูที่มีสิทธิ์เห็นตรงประวัติ; Arm ยังไม่ตรวจแยกจากยืนยันแล้ว; ไม่ปนข้ามบัญชี/โหมด/scenario

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-060"></a>

## TP001-060 — สร้าง/แก้ (staff vs school)

ระดับ: normal

เฉพาะ BE-039/BE-029: staff สร้าง/แก้ โรงเรียนเลือกอ่าน published และผู้เรียนอ่าน CourseRun ที่เลือก Level/Activity; โรงเรียนขอแก้หนึ่งครั้งเป็นผลสิทธิ์หลัก AC-043-01 งาน BE-027 นอกขอบเขตคงเดิม อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-043-01 (ส่วนกลางสร้าง/แก้หลักสูตรได้)](../../modules/quiz/shared/requirements/req-043.md), [AC-043-02 (เปิด Course แล้วเห็น Level ระดับชั้นเริ่มต้น วิชาที่ผูก และ…)](../../modules/quiz/shared/requirements/req-043.md), [AC-043-03 (ห้องใช้ Level ต่างจากค่าเริ่มต้นของระดับชั้นได้ โดยยังอ้าง Level ที่เลือก)](../../modules/quiz/shared/requirements/req-043.md), [AC-043-04 (Lesson เดียวเปิด Activity ครบชนิดใน BR-043-03 และภารกิจสาม Mode ได้…)](../../modules/quiz/shared/requirements/req-043.md) · References: DES-005, BR-043 · Level: integration · Profiles: PF-ADMIN, PF-WEB, PF-API

เงื่อนไขก่อนตรวจเฉพาะ AC-043-01 (ส่วนกลางแก้ได้ โรงเรียนเลือกใช้ได้แต่แก้ไม่ได้): หนึ่ง process หนึ่ง service/adapter/FileSchoolBotBackingStore ใน directory ใหม่; actor staffAuthor เป็น staff_admin มี content_author, staffApprover เป็น content_approver ไม่เคยแก้ร่าง, staffWithoutRole มี staff session ไม่มี role; schoolAdmin เป็น admin โรงเรียนและ schoolTeacher เป็นครูโรงเรียนเดียวกัน มี school_web session ที่ valid ทุก mutation กลางใช้ SchoolId=NULL เตรียม Level/Subject ถูกชนิด ใช้ clock/cipher ทดสอบ ไม่พักหรือ inject fail; mutation แต่ละขั้นใช้ UUID ใหม่

ให้ staffAuthor create revision 1, PUT metadata และ content ที่มี Lesson/Activity/Mission/Criteria ถูกต้อง ให้ staffApprover publish โดยมีหลักฐาน; บันทึก baseline ก่อนแต่ละ mutation จากนั้น staffWithoutRole/schoolAdmin/schoolTeacher ทดลอง create, metadata, content, publish (ใช้ If-Match ปัจจุบัน) และ schoolAdmin/schoolTeacher อ่าน published/เลือกใช้ ทิ้ง service/adapter/store แล้วสร้างใหม่จาก directory เดิมและอ่านดิสก์ กรณี AC-043-02..04 คง fixture เดิม: Course/Level/Subject/RecommendedGrades; Lesson มี slide/แผนครู/งาน/mission×3/quiz/test อยู่นอก BE-027 ของใบงานนี้

ขั้นตอน: สร้าง/แก้ (staff vs school); เลือกใช้; CourseRun ใช้ Level ต่างจากค่าเริ่ม

ผลที่คาด: staffAuthor create ได้ 201, metadata/content ได้ 200; staffApprover publish ได้ 200 ทุก success เพิ่ม audit ของ operation และ idempotency หนึ่งแถว; หลังขั้นหลักครบมีหนึ่ง published revision และ audit Created/MetadataUpdated/ContentUpdated/Published อย่างละหนึ่ง event พร้อม ledger สี่แถว staffWithoutRole/schoolAdmin/schoolTeacher mutation ได้ 403 ตามสิทธิ์ endpoint ไม่ได้ผลสำเร็จของ staff และจำนวน revision/children/audit/idempotency ไม่เปลี่ยนจาก baseline ของคำขอที่ปฏิเสธ schoolAdmin/schoolTeacher อ่าน published ได้ 200 โรงเรียนเลือกใช้ได้; เห็น Level/ชั้นเริ่มต้น/วิชา/Lesson/Activity; Level ต่างจากค่าเริ่มต้นได้และอ้าง Level ที่เลือก; mission แต่ละอันใช้ Mode ตน

ขอบเขตพิสูจน์: slice นี้ตรวจ staff vs school ด้วย session/authority stub และ file persistence; การเลือกใช้จริงผ่าน CourseRun และ AC-043-02..04 คงงานเดิม; PostgreSQL/หลาย process รอ DBA-003/G-CORE, ตัวตน/License/transport จริงรอ H5 และ integration ตาม index ไม่ใช้ stub รับรอง UI หรือการเลือกใช้จริง

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-061"></a>

## TP001-061 — สลับลำดับ Lesson

AC: [AC-044-01 (สลับลำดับ Lesson ผ่านข้อมูลแล้วลำดับเปลี่ยน รหัสและการอ้างผลเดิมคงเดิม…)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-02 (แก้เนื้อหาฉบับร่างแล้วเปิดดูเนื้อหาใหม่ได้โดยไม่แก้โค้ด)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-03 (revision ที่ไม่มีหลักฐานอนุมัติเผยแพร่ไม่ได้)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-04 (เมื่อ publish revision ใหม่ ผู้เรียนเดิมยังเปิดฉบับเดิมและดูผลเดิมได้)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-05 (ขอแก้ฉบับ publish แล้วฉบับเดิมไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-044.md) · References: DES-005, BR-044 · Level: integration · Profiles: PF-ADMIN, PF-API

เงื่อนไขก่อนตรวจ: หนึ่ง process สอง service/adapter/FileSchoolBotBackingStore objects ชี้ directory เดียว; staffAuthor/staffEditor เป็นผู้แก้, staffApprover/staffSecondApprover เป็น approver ที่ไม่เคยแก้, staffWithoutRole ไม่มี role; ใช้ fixture revision/ETag และ barrier ตาม [setup ขั้นตอน และผล response+state ของ TP001-061](traceability-001-learning-revision.md#tp001-061-detail) ทั้งหมด รายละเอียดนี้เป็นส่วนของ case เดียวกัน ไม่ลด setup เหลือหนึ่ง instance

ขอบเขตพิสูจน์: stub หนึ่ง process เท่านั้น; PostgreSQL/หลาย process รอ DBA-003/G-CORE, ผลผู้เรียน/CourseRun และเนื้อหาจริงรอ G-LEARN/integration; Gateway/ตัวตนจริงรอ H5
หลักฐานที่ต้องเก็บ: E-API+audit

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ

## หลักฐาน

- [DES-005 Rev10 (หลักสูตรและผลประเมิน)](../design/des-005.md), [draft Rev3](../design/learning-curriculum-draft-001.md), [idempotency Rev1](../design/idempotency-001.md), [ขอบเขต stub/PostgreSQL Rev1](../design/data-contract-rules-cross-database.md)
- [มติ 054 (เลขอ้างอิงไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md), [มติ 025 H6 (คนที่สองอนุมัติ)](../../shared/decisions/decisions-025.md)
- normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md ข้อ 3/5 และตาราง AC (reports): ใช้วาง regression ไม่มีการรัน tests ใหม่ในเอกสารนี้