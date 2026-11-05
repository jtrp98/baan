# TP-001 — ความปลอดภัยและการกู้คืน (TP001-077–TP001-079)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-077"></a>

## TP001-077 — smoke: ไม่มี License ถูกล็อก

AC: [AC-009-01 (เริ่มแอปโดยไม่เคยใส่ License แล้วเข้าใช้งาน Block Lab, Arm Lab และ Code…)](../../modules/app-shell/shared/requirements/req-009.md), [AC-009-03 (ใน Desktop ผู้ใช้ย่อ สลับเต็มจอ และขอปิดหน้าต่างจากแอปได้)](../../modules/app-shell/shared/requirements/req-009.md), [AC-010-01 (ผู้ใช้เปลี่ยนไทย/อังกฤษ/จีนได้โดยไม่ต่อเครือข่าย…)](../../modules/app-shell/shared/requirements/req-010.md), [AC-011-02 (บันทึกการแก้ไขงาน A แล้วเปิดใหม่ได้ค่าล่าสุดของ A โดยงาน B…)](../../modules/my-work/shared/requirements/req-011.md) · References: [DES-001 (Desktop host และ IPC)](../design/des-001.md), [DES-007 (Release และ trusted update)](../design/des-007.md) · Level: E2E · Profiles: PF-INST-WIN, PF-INST-MAC

เงื่อนไขก่อนตรวจ: แอปที่ติดตั้งจาก signed artifact

ขั้นตอน: smoke: ไม่มี License ถูกล็อก; window controls; สลับภาษา offline; บันทึก/เปิดงานใหม่

ผลที่คาด: พฤติกรรมเดียวกับ source-built (TP001-001/011/012/015) บน installed artifact

หลักฐานที่ต้องเก็บ: E-INST+E-UI

ผลจริง: NOT_RUN

<a id="tp001-078"></a>

## TP001-078 — retry import ด้วย UUID เดิมภายใน window และพ้น window

AC: [AC-041-04 (นำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังคำตอบสูญหาย/เปิดแอปใหม่…)](../../modules/my-work/shared/requirements/req-041.md), [AC-041-05 (เมื่อบันทึกนำเข้าล้มเหลว ไม่แสดงว่างานนั้นสำเร็จ ต้นฉบับยังเปิดได้…)](../../modules/my-work/shared/requirements/req-041.md) · References: guest-import-001, [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md) Rev4, [BR-041-03 (ป้องกันนำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังไม่ทราบผล ไม่ทับงานอื่น)](../../modules/my-work/shared/requirements/req-041.md), [BR-041-04 (แสดงว่านำเข้าสำเร็จเฉพาะงานที่บันทึกสำเร็จจริง)](../../modules/my-work/shared/requirements/req-041.md) · Level: integration · Profiles: PF-HOST, PF-API

เงื่อนไขก่อนตรวจ: import A สำเร็จ (committed) แล้วมี tombstone; ลบใบรับ local; ล้าง Guest workspace และ run trash sweep; สร้างงาน Guest ใหม่ด้วย UUID เดิม (เนื้อหาเท่าเดิม และ เนื้อหาต่าง); fake clock พ้น replay window 24 ชม.

ขั้นตอน: retry import ด้วย UUID เดิมภายใน window และพ้น window; เทียบ RequestHash; ตรวจ DB idempotency/tombstone rows

ผลที่คาด: tombstone/unique `(SchoolId,Principal,Operation,RequestKey)` ยังกันซ้ำแม้ล้าง Guest/trash และ ciphertext ถูกล้าง; ภายใน window replay คืนผลเดิม; พ้น window→`409 IDEMPOTENCY_EXPIRED`+resource_id; Host GET ยืนยัน ไม่ POST ใหม่; เนื้อหาต่าง→`409 IDEMPOTENCY_CONFLICT`; ไม่เกิดสำเนา Cloud เพิ่ม; ใบรับสูญหายยังคำนวณ key จาก UUID งานเดิมได้; server ไม่เชื่อ local receipt เป็นหลักฐาน commit

หลักฐานที่ต้องเก็บ: E-API (DB rows, audit) · Actual: NOT_RUN

<a id="tp001-079"></a>

## TP001-079 — T ขอ `/learners/{id}/progress` และตรวจ Arm ของ R/S

AC: [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../../modules/quiz/shared/requirements/req-038.md), [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../../modules/quiz/shared/requirements/req-039.md) · References: teacher-authority-001, [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md) Rev11, [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md) Rev7, [BR-038-04 (ครูตรวจ Arm เฉพาะนักเรียนที่ผู้ดูแลกำหนดให้ครูคนนั้น…)](../../modules/quiz/shared/requirements/req-038.md), [BR-039-02 (ครูดูเฉพาะรายชื่อนักเรียนที่ผู้ดูแลกำหนดให้ครูแต่ละคนในโรงเรียน/บัญชีเดิ…)](../../modules/quiz/shared/requirements/req-039.md) · Level: integration · Profiles: PF-LEGACY, PF-WEB, PF-API
Fixture (sanitized School DB synthetic — ติดป้าย test-only จนมี resolver proof จริง): ครู T สอน PlanCourse A ห้อง 1 เทอม X; ครู U สอน PlanCourse B ห้อง 1 เทอม X; นักเรียน R อยู่ roster 1/X; นักเรียน S มีหลายแถว TStudentClassroomHistory/วันที่ย้ายทับเทอม; CourseRun PlanCourseIds=[A,B]; sId==sEmp ชนข้ามโรงเรียน; inject School DB resolver ล่ม

ขั้นตอน: T ขอ `/learners/{id}/progress` และตรวจ Arm ของ R/S; U ขอ R; ใช้ ID ข้ามโรงเรียน/เทอม; ยิง identity/tenant header ปลอม; inject resolver unavailable ระหว่าง read และก่อน commit

ผลที่คาด: เห็นเฉพาะ course-teacher∩roster∩term — T เห็น R (A∩1∩X) ไม่เห็นทั้งห้องหรือผลวิชา B; U ไม่เห็นผลวิชา A; S ตามผล resolver ที่พิสูจน์แล้วเท่านั้น ไม่ใช้ห้องปัจจุบันของ TUser แทน history และไม่เดา Max(nHistoryId); ข้ามโรงเรียน/เทอม→`403 SUBJECT_PERMISSION_REQUIRED` หรือ 404; resolver ล่ม→`503 AUTH_UNAVAILABLE`; resolve ไม่ได้/กำกวม→fail closed `503 AUTH_NOT_CONFIGURED` ไม่เปิดสิทธิ์จาก query; tenant (SchoolID) ครบทุก join/alias; re-check ก่อน commit; ผลเดิมไม่เปลี่ยน

หลักฐานที่ต้องเก็บ: E-API + fixture SQL hash · Actual: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · E2E = End-to-End หรือการตรวจครบเส้นทาง · IPC = Inter-Process Communication
