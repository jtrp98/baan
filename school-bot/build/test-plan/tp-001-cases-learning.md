# TP-001 — บทเรียนและผลประเมิน (TP001-054–TP001-057)

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (เติม setup ตรวจหลักสูตรกลางตามใบงาน 096)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-054"></a>

## TP001-054 — เลือก Activity แต่ละ mode

AC: [AC-037-01 (เลือก Activity ภารกิจ Block, Arm และ Code แล้วเข้าถึงเนื้อหาและภารกิจตรง…)](../../modules/quiz/shared/requirements/req-037.md), [AC-037-02 (เปิด Lesson แล้วเห็นเป้าหมาย คำแนะนำ และรายการ Activity…)](../../modules/quiz/shared/requirements/req-037.md), [AC-037-03 (งานและผลภารกิจอ้าง Activity, Mode, Lesson และ revision ที่เรียนถูกต้อง…)](../../modules/quiz/shared/requirements/req-037.md) · References: [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), [BR-043-04 (Mode อยู่ที่ Activity ภารกิจ)](../../modules/quiz/shared/requirements/req-043.md) · Level: integration · Profiles: PF-API, PF-UI-WIN

เงื่อนไขก่อนตรวจ: synthetic published curriculum test-only: Course/Lesson เดียวมี Block/Arm/Code mission; revision 1 และ 2

ขั้นตอน: เลือก Activity แต่ละ mode; เปิด Lesson; ส่งงานผิด mode/ผิด revision

ผลที่คาด: เข้าเนื้อหา/ภารกิจตรง mode; เห็นเป้าหมาย/คำแนะนำ/Activity ตรง; งาน/ผลอ้าง Activity/Mode/Lesson/revision ถูก ไม่ข้ามโหมด/ฉบับ; ผิด mode→ASSESSMENT_METHOD_MISMATCH/ปฏิเสธ

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-055"></a>

## TP001-055 — เปิด/ปิดบทเรียน

AC: [AC-037-04 (เพียงเปิดหรือกดปิดบทเรียนไม่สร้างผลผ่านจริงโดยไม่มีการประเมินตาม REQ-038)](../../modules/quiz/shared/requirements/req-037.md), [AC-037-05 (เมื่อยังไม่มีหลักฐานอนุมัติเนื้อหาและเกณฑ์…)](../../modules/quiz/shared/requirements/req-037.md), [AC-037-06 (กิจกรรมภารกิจจริงทุกโหมดอ้างกลับไปยังเนื้อหา ภารกิจ เกณฑ์…)](../../modules/quiz/shared/requirements/req-037.md) · References: DES-005, [BR-044-02 (revision ผ่าน draft → อนุมัติโดยมนุษย์ → publish พร้อมที่มา ผู้อนุมัติ…)](../../modules/quiz/shared/requirements/req-044.md) · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจสำหรับ AC-037-05 (ไม่เสนอเนื้อหาที่ยังไม่อนุมัติ) / AC-037-06 (ย้อนอ้าง revision และหลักฐานได้): หนึ่ง process หนึ่ง CurriculumService/adapter ใช้ FileSchoolBotBackingStore ใน directory ทดสอบใหม่ ไม่ใช้ DB จริง; staff A มี content_author, B มี content_approver และไม่เคยแก้ร่าง, C มี staff session แต่ไม่มี role; บัญชีโรงเรียน S มี school_web session ที่ valid สำหรับอ่าน public content ทุก curriculum ใช้ SchoolId=NULL ใช้ clock/cipher ทดสอบและข้อมูล synthetic ติดป้าย test-only

เตรียมหนึ่ง revision มีสอง Lesson แต่ละบทมี Activity/Mission/Criteria ครบ block/arm/code และ key ไม่ซ้ำ; automatic criteria มี rules/source_ref ส่วน arm ใช้ teacher-v1 ตาม DES-005 ทดลองแยก fixture ใหม่สี่ชุด: ApprovedBy/At เป็น NULL ทั้งคู่, ขาด By อย่างเดียว, ขาด At อย่างเดียว และครบทั้งคู่ A แทน content ทั้งชุดสองครั้งแล้วอ่านกลับเพื่อจับ parent link สูญหาย บันทึก baseline จำนวน revision/audit/idempotency หลัง setup ทุก mutation ใช้ UUID ใหม่ ไม่มีการพักหรือ inject fail ใน case นี้

ขั้นตอน: ให้ B publish ด้วย approval_ref ที่ไม่ว่างในแต่ละ fixture; ให้ S เรียก public list/detail ก่อนและหลัง publish; ทิ้ง service/adapter/store แล้วสร้างใหม่จาก directory เดิม อ่าน curricula_snapshot.json เทียบทุก Activity → Mission → Criteria → Lesson → Curriculum revision และ publication audit โดยไม่อาศัย cache เดิม ขั้นตอนเปิด/ปิดบทเรียนตาม AC-037-04 คงเดิมและอยู่นอก BE-027 ในใบงานนี้

ผลที่คาด: เปิด/ปิดไม่สร้าง submission/passed; ร่างไม่ปรากฏใน public list และเปิดเป็นบทเรียนอนุมัติไม่ได้ (CONTENT_NOT_PUBLISHED); criteria ที่ขาด By หรือ At แม้เพียงค่าเดียว publish ไม่ได้ (CRITERIA_NOT_APPROVED) state ยัง draft, PublishedAt/approval ยัง NULL, revision เท่า baseline ไม่เพิ่ม Published audit หรือ idempotency แถวสำเร็จ fixture ครบได้ 200 พร้อม id/update_date/published_at และ ETag; revision ยังหนึ่งฉบับ เพิ่ม Curriculum.Published หนึ่ง event และ idempotency หนึ่งแถวจาก baseline อ่านใหม่พบ actor=B, เวลาและ approval_ref ตรง event/PublishedAt; children ของสองบทไม่ปนกัน ทุกโหมดย้อนถึงเนื้อหา ภารกิจ เกณฑ์ และ approval ของ revision เดียวกันได้

ขอบเขตพิสูจน์: integration ระหว่าง service กับ file stub และ persisted snapshot ใน slice นี้; PostgreSQL/หลาย process รอ DBA-003/G-CORE, เนื้อหาและเกณฑ์จริงรอ G-LEARN, Gateway/ตัวตนจริงรอหลักฐาน H5 ตามกลยุทธ์ transport ไม่ใช้ผล stub ปิดประตูเหล่านี้

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-056"></a>

## TP001-056 — ส่งภารกิจ

AC: [AC-038-01 (Code/Block ที่มีเกณฑ์ภารกิจกำหนดแล้วได้รับผลอัตโนมัติตรงกับตัวอย่างผ่านแ…)](../../modules/quiz/shared/requirements/req-038.md) · References: DES-005, [BR-042-03 (ก่อนนับผลในบัญชีต้องตรวจใหม่: Code/Block อัตโนมัติตามเกณฑ์ที่อนุมัติ)](../../modules/my-work/shared/requirements/req-042.md) · Level: unit · Profiles: PF-UNIT, PF-API

เงื่อนไขก่อนตรวจ: golden vectors: trace_equals, steps_at_most 100/101, uses_op, combine all/any; Code และ Block; client อ้างผ่าน; grader ล้ม; submit ซ้ำ; worker restart; pass/fail pairs ของเจ้าของเนื้อหา (G-LEARN)

ขั้นตอน: ส่งภารกิจ

ผลที่คาด: ผลอัตโนมัติตรงตัวอย่างผ่าน/ไม่ผ่าน; host/server vectors เท่ากัน; ไม่เชื่อ client; grader ล้ม=error ไม่ใช่ not_yet; replay คืน ID เดิม

หลักฐานที่ต้องเก็บ: unit log+E-API

ผลจริง: NOT_RUN

<a id="tp001-057"></a>

## TP001-057 — ส่ง

AC: [AC-038-02 (ส่งภารกิจ Arm แล้วไม่กลายเป็นผ่านเองก่อนมีผลตรวจจากครู)](../../modules/quiz/shared/requirements/req-038.md), [AC-038-03 (ครูที่มีสิทธิ์บันทึกผล Arm แล้วเรียกดูผลที่บันทึก…)](../../modules/quiz/shared/requirements/req-038.md), [AC-038-04 (ผล Cloud อ้างนักเรียน Activity/Mode/revision และงานถูกต้อง…)](../../modules/quiz/shared/requirements/req-038.md) · References: DES-005, [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md) · Level: integration · Profiles: PF-WEB, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: นักเรียนส่ง Arm; ครูมีสิทธิ์วิชา/ห้อง ×2; ผลครูทดลอง/ดาวตัวอย่าง

ขั้นตอน: ส่ง; ครูบันทึกผล; เรียกดู; แก้ผล; ครู 2 คนตรวจพร้อมกัน; stale If-Match

ผลที่คาด: Arm=awaiting_teacher ไม่ผ่านเอง; ครูบันทึก/ดูผล+ผู้ตรวจ+งานได้; แก้=sequence ใหม่ supersedes ไม่ overwrite; ชนกัน→412 VERSION_CONFLICT; ผลอ้างนักเรียน Activity/Mode/revision/งานถูก ไม่ปนผลครู/ดาวตัวอย่าง; 412 VERSION_CONFLICT มาจาก If-Match(UpdateDate) ไม่ใช่ version field; ขาด If-Match→428

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ

## หลักฐาน

- สัญญา: [DES-005 Rev10 (หลักสูตรและผลประเมิน)](../design/des-005.md), [API Rev9](../design/des-005-api.md), [content Rev8](../design/des-005-content.md) และ [idempotency Rev1](../design/idempotency-001.md)
- รายงานที่ใช้วาง regression: normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md ข้อ 1–2 (reports); เอกสารนี้ไม่ได้รัน tests หรือรับรองผลเดิมใหม่