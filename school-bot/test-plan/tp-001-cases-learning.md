# TP-001 — บทเรียนและผลประเมิน (TP001-054–TP001-057)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-054"></a>

## TP001-054 — เลือก Activity แต่ละ mode

AC: [AC-037-01 (เลือก Activity ภารกิจ Block, Arm และ Code แล้วเข้าถึงเนื้อหาและภารกิจตรง…)](../requirement/req-037.md), [AC-037-02 (เปิด Lesson แล้วเห็นเป้าหมาย คำแนะนำ และรายการ Activity…)](../requirement/req-037.md), [AC-037-03 (งานและผลภารกิจอ้าง Activity, Mode, Lesson และ revision ที่เรียนถูกต้อง…)](../requirement/req-037.md) · References: [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), [BR-043-04 (Mode อยู่ที่ Activity ภารกิจ)](../requirement/req-043.md) · Level: integration · Profiles: PF-API, PF-UI-WIN

เงื่อนไขก่อนตรวจ: synthetic published curriculum test-only: Course/Lesson เดียวมี Block/Arm/Code mission; revision 1 และ 2

ขั้นตอน: เลือก Activity แต่ละ mode; เปิด Lesson; ส่งงานผิด mode/ผิด revision

ผลที่คาด: เข้าเนื้อหา/ภารกิจตรง mode; เห็นเป้าหมาย/คำแนะนำ/Activity ตรง; งาน/ผลอ้าง Activity/Mode/Lesson/revision ถูก ไม่ข้ามโหมด/ฉบับ; ผิด mode→ASSESSMENT_METHOD_MISMATCH/ปฏิเสธ

หลักฐานที่ต้องเก็บ: E-API+E-UI

ผลจริง: NOT_RUN

<a id="tp001-055"></a>

## TP001-055 — เปิด/ปิดบทเรียน

AC: [AC-037-04 (เพียงเปิดหรือกดปิดบทเรียนไม่สร้างผลผ่านจริงโดยไม่มีการประเมินตาม REQ-038)](../requirement/req-037.md), [AC-037-05 (เมื่อยังไม่มีหลักฐานอนุมัติเนื้อหาและเกณฑ์…)](../requirement/req-037.md), [AC-037-06 (กิจกรรมภารกิจจริงทุกโหมดอ้างกลับไปยังเนื้อหา ภารกิจ เกณฑ์…)](../requirement/req-037.md) · References: DES-005, [BR-044-02 (revision ผ่าน draft → อนุมัติโดยมนุษย์ → publish พร้อมที่มา ผู้อนุมัติ…)](../requirement/req-044.md) · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: revision ไม่มี approval/criteria ไม่มี approved_by/at; revision มีหลักฐาน; (เนื้อหาจริง G-LEARN)

ขั้นตอน: เปิด/ปิดบทเรียน; ขอ publish; เรียก list; ตรวจ trace ย้อนกลับ

ผลที่คาด: เปิด/ปิดไม่สร้าง submission/passed; ไม่มีหลักฐาน→CONTENT_NOT_PUBLISHED/CRITERIA_NOT_APPROVED ไม่เสนอเป็นบทเรียนจริง; กิจกรรมจริงอ้างเนื้อหา/ภารกิจ/เกณฑ์/ผู้อนุมัติ revision ได้

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-056"></a>

## TP001-056 — ส่งภารกิจ

AC: [AC-038-01 (Code/Block ที่มีเกณฑ์ภารกิจกำหนดแล้วได้รับผลอัตโนมัติตรงกับตัวอย่างผ่านแ…)](../requirement/req-038.md) · References: DES-005, [BR-042-03 (ก่อนนับผลในบัญชีต้องตรวจใหม่: Code/Block อัตโนมัติตามเกณฑ์ที่อนุมัติ)](../requirement/req-042.md) · Level: unit · Profiles: PF-UNIT, PF-API

เงื่อนไขก่อนตรวจ: golden vectors: trace_equals, steps_at_most 100/101, uses_op, combine all/any; Code และ Block; client อ้างผ่าน; grader ล้ม; submit ซ้ำ; worker restart; pass/fail pairs ของเจ้าของเนื้อหา (G-LEARN)

ขั้นตอน: ส่งภารกิจ

ผลที่คาด: ผลอัตโนมัติตรงตัวอย่างผ่าน/ไม่ผ่าน; host/server vectors เท่ากัน; ไม่เชื่อ client; grader ล้ม=error ไม่ใช่ not_yet; replay คืน ID เดิม

หลักฐานที่ต้องเก็บ: unit log+E-API

ผลจริง: NOT_RUN

<a id="tp001-057"></a>

## TP001-057 — ส่ง

AC: [AC-038-02 (ส่งภารกิจ Arm แล้วไม่กลายเป็นผ่านเองก่อนมีผลตรวจจากครู)](../requirement/req-038.md), [AC-038-03 (ครูที่มีสิทธิ์บันทึกผล Arm แล้วเรียกดูผลที่บันทึก…)](../requirement/req-038.md), [AC-038-04 (ผล Cloud อ้างนักเรียน Activity/Mode/revision และงานถูกต้อง…)](../requirement/req-038.md) · References: DES-005, [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md) · Level: integration · Profiles: PF-WEB, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: นักเรียนส่ง Arm; ครูมีสิทธิ์วิชา/ห้อง ×2; ผลครูทดลอง/ดาวตัวอย่าง

ขั้นตอน: ส่ง; ครูบันทึกผล; เรียกดู; แก้ผล; ครู 2 คนตรวจพร้อมกัน; stale If-Match

ผลที่คาด: Arm=awaiting_teacher ไม่ผ่านเอง; ครูบันทึก/ดูผล+ผู้ตรวจ+งานได้; แก้=sequence ใหม่ supersedes ไม่ overwrite; ชนกัน→412 VERSION_CONFLICT; ผลอ้างนักเรียน Activity/Mode/revision/งานถูก ไม่ปนผลครู/ดาวตัวอย่าง; 412 VERSION_CONFLICT มาจาก If-Match(UpdateDate) ไม่ใช่ version field; ขาด If-Match→428

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
