# TP-001 — บทเรียนและผลประเมิน (TP001-058–TP001-061)

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (เติม setup สิทธิ์ revision และการแข่งขันของหลักสูตรกลาง)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

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

AC: [AC-043-01 (ส่วนกลางสร้าง/แก้หลักสูตรได้)](../../modules/quiz/shared/requirements/req-043.md), [AC-043-02 (เปิด Course แล้วเห็น Level ระดับชั้นเริ่มต้น วิชาที่ผูก และ…)](../../modules/quiz/shared/requirements/req-043.md), [AC-043-03 (ห้องใช้ Level ต่างจากค่าเริ่มต้นของระดับชั้นได้ โดยยังอ้าง Level ที่เลือก)](../../modules/quiz/shared/requirements/req-043.md), [AC-043-04 (Lesson เดียวเปิด Activity ครบชนิดใน BR-043-03 และภารกิจสาม Mode ได้…)](../../modules/quiz/shared/requirements/req-043.md) · References: DES-005, BR-043 · Level: integration · Profiles: PF-ADMIN, PF-WEB, PF-API

เงื่อนไขก่อนตรวจเฉพาะ AC-043-01 (ส่วนกลางแก้ได้ โรงเรียนเลือกใช้ได้แต่แก้ไม่ได้): หนึ่ง process หนึ่ง service/adapter/FileSchoolBotBackingStore ใน directory ใหม่; actor A เป็น staff_admin มี content_author, B เป็น content_approver ไม่เคยแก้ร่าง, C มี staff session ไม่มี role; S เป็น admin โรงเรียนและ T เป็นครูโรงเรียนเดียวกัน มี school_web session ที่ valid ทุก mutation กลางใช้ SchoolId=NULL เตรียม Level/Subject ถูกชนิด ใช้ clock/cipher ทดสอบ ไม่พักหรือ inject fail; mutation แต่ละขั้นใช้ UUID ใหม่

ให้ A create revision 1, PUT metadata และ content ที่มี Lesson/Activity/Mission/Criteria ถูกต้อง ให้ B publish โดยมีหลักฐาน; บันทึก baseline ก่อนแต่ละ mutation จากนั้น C/S/T ทดลอง create, metadata, content, publish (ใช้ If-Match ปัจจุบัน) และ S/T อ่าน published/เลือกใช้ ทิ้ง service/adapter/store แล้วสร้างใหม่จาก directory เดิมและอ่านดิสก์ กรณี AC-043-02..04 คง fixture เดิม: Course/Level/Subject/RecommendedGrades; Lesson มี slide/แผนครู/งาน/mission×3/quiz/test อยู่นอก BE-027 ของใบงานนี้

ขั้นตอน: สร้าง/แก้ (staff vs school); เลือกใช้; CourseRun ใช้ Level ต่างจากค่าเริ่ม

ผลที่คาด: A create ได้ 201, metadata/content ได้ 200; B publish ได้ 200 ทุก success เพิ่ม audit ของ operation และ idempotency หนึ่งแถว; หลังขั้นหลักครบมีหนึ่ง published revision และ audit Created/MetadataUpdated/ContentUpdated/Published อย่างละหนึ่ง event พร้อม ledger สี่แถว C/S/T mutation ได้ 403 ตามสิทธิ์ endpoint ไม่ได้ผลสำเร็จของ staff และจำนวน revision/children/audit/idempotency ไม่เปลี่ยนจาก baseline ของคำขอที่ปฏิเสธ S/T อ่าน published ได้ 200 โรงเรียนเลือกใช้ได้; เห็น Level/ชั้นเริ่มต้น/วิชา/Lesson/Activity; Level ต่างจากค่าเริ่มต้นได้และอ้าง Level ที่เลือก; mission แต่ละอันใช้ Mode ตน

ขอบเขตพิสูจน์: slice นี้ตรวจ staff vs school ด้วย session/authority stub และ file persistence; การเลือกใช้จริงผ่าน CourseRun และ AC-043-02..04 คงงานเดิม; PostgreSQL/หลาย process รอ DBA-003/G-CORE, ตัวตน/License/transport จริงรอ H5 และ integration ตาม index ไม่ใช้ stub รับรอง UI หรือการเลือกใช้จริง

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-061"></a>

## TP001-061 — สลับลำดับ Lesson

AC: [AC-044-01 (สลับลำดับ Lesson ผ่านข้อมูลแล้วลำดับเปลี่ยน รหัสและการอ้างผลเดิมคงเดิม…)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-02 (แก้เนื้อหาฉบับร่างแล้วเปิดดูเนื้อหาใหม่ได้โดยไม่แก้โค้ด)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-03 (revision ที่ไม่มีหลักฐานอนุมัติเผยแพร่ไม่ได้)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-04 (เมื่อ publish revision ใหม่ ผู้เรียนเดิมยังเปิดฉบับเดิมและดูผลเดิมได้)](../../modules/quiz/shared/requirements/req-044.md), [AC-044-05 (ขอแก้ฉบับ publish แล้วฉบับเดิมไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-044.md) · References: DES-005, BR-044 · Level: integration · Profiles: PF-ADMIN, PF-API

เงื่อนไขก่อนตรวจ: หนึ่ง process สอง CurriculumService/adapter instances แต่ละ adapter ใช้ FileSchoolBotBackingStore คนละ object ที่ resolve directory เดียวกัน; เริ่ม directory ว่าง ใช้ clock/cipher ทดสอบ A/E เป็น staff_admin มี content_author, A มี content_approver ด้วยเพื่อทดสอบ self-approval, B/D มี content_approver ไม่เคยแก้ร่าง, C มี staff session ไม่มี role, S เป็นบัญชีโรงเรียนอ่าน public ได้ ทุก revision กลาง SchoolId=NULL

A create revision 1 ใส่สอง Lesson พร้อม stable keys และ missions/criteria สามโหมดที่อนุมัติแบบ synthetic ครบ A สลับ ordinal/แก้ objective, E แก้ metadata ต่อ; ใช้ UUID ใหม่ทุก mutation เว้น case replay ที่แยกไว้ บันทึก baseline จำนวน revision/children/audit/ledger และ ETag ก่อนแต่ละขั้น สร้าง fixture ผู้เรียนและผลเก่าที่ชี้ revision 1 สำหรับเปรียบเทียบ snapshot เท่านั้น ไม่อ้างเป็นผลผู้เรียนจริง

จุดพักสำหรับการแข่งขัน (ใช้ fixture ใหม่แยกแต่ละรูปแบบ): พัก service แรกก่อนเข้า CommitWithIdempotencyAsync แล้วให้ service สอง commit ก่อนปล่อยคำขอแรก เพื่อพิสูจน์ reload snapshot สด; (ก) B/D publish revision 1 ด้วยคนละ UUID และ ETag เดียวกัน (ข) B publish revision 1 แข่งกับ E create revision 2 (ค) B publish แข่งกับ A content PUT ด้วย ETag เดียวกัน ทำทั้งสองลำดับผู้ชนะ ไม่ inject fail ใน case นี้ ทิ้งทั้งคู่แล้วสร้าง adapter/store ใหม่และอ่านดิสก์หลังทุกการแข่งขัน

ขั้นตอน: สลับลำดับ Lesson; แก้ draftแล้วอ่านใหม่; publish ไม่มี approval_ref/ผิดชนิด/ยาว 1001 ตัว และขอบเขต 1000 ตัว; A (ผู้แก้ก่อน E) อนุมัติเอง; C อนุมัติ; B อนุมัติ; create และ publish revision 2 โดยคง stable keys; พยายาม PUT metadata/content ของ published revision 1; If-Match ขาด/stale; รันการแข่งขันทั้งสามรูปแบบตาม setup

ผลที่คาด: ลำดับเปลี่ยน stable keys/ผลอ้างเดิมคงเดิม ไม่แก้โค้ด; draft อ่านได้ objective ใหม่; approval_ref ขาด/ผิดชนิด/1001 ตัวได้ 400 INVALID_INPUT, 1000 ตัวได้ 200 และ Reason อ่านกลับตรงตัว; A แม้ไม่ใช่ผู้แก้ล่าสุดได้ FOUR_EYES_REQUIRED, C ได้ STAFF_ROLE_REQUIRED; audit ผู้แก้ไม่ครบต้อง FOUR_EYES_REQUIRED ไม่เดาผู้อนุมัติ ผู้อนุมัติจาก session ไม่ใช่ body; B publish ได้ 200 มี actor/time/ref ตรง PublishedAt

อ่าน adapter ใหม่: การ create revision 2 เพิ่มหนึ่ง revision พร้อม Created audit/ledger อย่างละหนึ่ง; การแก้ draft/publish สำเร็จแต่ละครั้งไม่เพิ่มจำนวน revision แต่เพิ่ม audit ของ operation/ledger อย่างละหนึ่ง PUT published เดิมถูกปฏิเสธไม่เปลี่ยน children; ต้อง create revision ใหม่ก่อนแก้ ฉบับเดิมและ reference ผลเก่าไม่เปลี่ยน ขาด If-Match ได้ 428; stale ได้ 412 VERSION_CONFLICT จาก UpdateDate ทุก rejection ไม่เพิ่ม audit/ledger สำเร็จและไม่เปลี่ยน domain เทียบ baseline

การแข่งขัน (ก) มี publish success เดียว อีกคำขอได้ 412 VERSION_CONFLICT หรือ 409 STATE_CONFLICT ตาม state สด; เพิ่ม Published audit/ledger อย่างละหนึ่งเท่านั้น (ข) ทั้งสองคำขอสำเร็จ มี revision 1 published และ revision 2 draft; Created และ Published audit/ledger ที่เพิ่มอย่างละหนึ่งไม่สูญหาย (ค) ผู้ชนะสำเร็จ ผู้แพ้ได้ 412/409 ตาม state สด; content ของ published ห้ามถูกเขียนทีหลัง audit/ledger เพิ่มเฉพาะผู้ชนะ จำนวน revision เท่าเดิม ห้าม snapshot เก่าทับ audit/children/ledger ของอีก instance

ขอบเขตพิสูจน์: service/file stub สอง instances ใน process เดียว ไม่ใช่สอง OS hosts; snapshot/references เก่าพิสูจน์บน fixture เท่านั้น ผลผู้เรียน/CourseRun จริงและ G-LEARN ยังรอ, PostgreSQL และหลาย OS processes รอ DBA-003/G-CORE, Gateway/ตัวตนจริงรอ H5 การล้มระหว่าง commit อยู่ [TP001-086](tp-001-cases-learning-3.md#tp001-086)

หลักฐานที่ต้องเก็บ: E-API+audit

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ

## หลักฐาน

- [DES-005 Rev10 (หลักสูตรและผลประเมิน)](../design/des-005.md), [draft Rev3](../design/learning-curriculum-draft-001.md), [idempotency Rev1](../design/idempotency-001.md), [ขอบเขต stub/PostgreSQL Rev1](../design/data-contract-rules-cross-database.md)
- [มติ 054 (เลขอ้างอิงไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md), [มติ 025 H6 (คนที่สองอนุมัติ)](../../shared/decisions/decisions-025.md)
- normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md ข้อ 3/5 และตาราง AC (reports): ใช้วาง regression ไม่มีการรัน tests ใหม่ในเอกสารนี้