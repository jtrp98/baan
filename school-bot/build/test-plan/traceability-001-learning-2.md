# Traceability — บทเรียนและ Guest

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ผูก cases idempotency ของหลักสูตรกับ AC เดิม)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-041-04 (นำเข้างานเดิมซ้ำในบัญชีเดิม รวม retry หลังคำตอบสูญหาย/เปิดแอปใหม่…)](../../modules/my-work/shared/requirements/req-041.md) | [TP001-028](tp-001-cases-guest-3.md#tp001-028), [TP001-078](tp-001-cases-boundary.md#tp001-078) | BE-025/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-041-05 (เมื่อบันทึกนำเข้าล้มเหลว ไม่แสดงว่างานนั้นสำเร็จ ต้นฉบับยังเปิดได้…)](../../modules/my-work/shared/requirements/req-041.md) | [TP001-028](tp-001-cases-guest-3.md#tp001-028), [TP001-078](tp-001-cases-boundary.md#tp001-078) | BE-025/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-042-01 (Guest ทำภารกิจแล้วเปิดแอปใหม่ ยังเรียกประวัติและความคืบหน้า local…)](../../modules/my-work/shared/requirements/req-042.md) | [TP001-029](tp-001-cases-guest-3.md#tp001-029) | BE-026/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-042-02 (Login หรือนำเข้าเฉพาะโครงงาน ไม่สร้างผลจากประวัติ Guest…)](../../modules/my-work/shared/requirements/req-042.md) | [TP001-029](tp-001-cases-guest-3.md#tp001-029) | BE-026/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-042-03 (เลือกย้ายประวัติ staffAuthor เท่านั้น แล้วมีเฉพาะ staffAuthor…)](../../modules/my-work/shared/requirements/req-042.md) | [TP001-029](tp-001-cases-guest-3.md#tp001-029) | BE-026/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-042-04 (เปลี่ยน client ให้รายงานผ่าน แต่ชิ้นงาน Code/Block ไม่ผ่านเกณฑ์…)](../../modules/my-work/shared/requirements/req-042.md) | [TP001-030](tp-001-cases-guest-4.md#tp001-030) | BE-026/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-042-05 (ย้ายประวัติ Arm แล้วแสดงรอครูตรวจ ไม่นับผ่านก่อนครูที่มีสิทธิ์บันทึกผล)](../../modules/my-work/shared/requirements/req-042.md) | [TP001-030](tp-001-cases-guest-4.md#tp001-030) | BE-026/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-042-06 (เปิดประวัติที่ย้ายแล้วแยกผล Guest กับผลตรวจใหม่ได้ อ้างภารกิจ/งานถูกต้อง…)](../../modules/my-work/shared/requirements/req-042.md) | [TP001-030](tp-001-cases-guest-4.md#tp001-030) | BE-026/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-043-01 (ส่วนกลางสร้าง/แก้หลักสูตรได้)](../../modules/quiz/shared/requirements/req-043.md) | [TP001-060](tp-001-cases-learning-2.md#tp001-060), [TP001-084](tp-001-cases-learning-3.md#tp001-084), [TP001-085](tp-001-cases-learning-3.md#tp001-085), [TP001-086](tp-001-cases-learning-3.md#tp001-086), [TP001-087](tp-001-cases-learning-3.md#tp001-087) | BE-027/sys, [BE-039 (เชื่อม SchoolBot ผ่าน Gateway)](../plan/index.md)/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-043-02 (เปิด Course แล้วเห็น Level ระดับชั้นเริ่มต้น วิชาที่ผูก และ…)](../../modules/quiz/shared/requirements/req-043.md) | [TP001-060](tp-001-cases-learning-2.md#tp001-060) | BE-029/sys, FE-022/front | QA-012/check | NOT_RUN |
| [AC-043-03 (ห้องใช้ Level ต่างจากค่าเริ่มต้นของระดับชั้นได้ โดยยังอ้าง Level ที่เลือก)](../../modules/quiz/shared/requirements/req-043.md) | [TP001-060](tp-001-cases-learning-2.md#tp001-060) | BE-029/sys, FE-022/front | QA-012/check | NOT_RUN |
| [AC-043-04 (Lesson เดียวเปิด Activity ครบชนิดใน BR-043-03 และภารกิจสาม Mode ได้…)](../../modules/quiz/shared/requirements/req-043.md) | [TP001-060](tp-001-cases-learning-2.md#tp001-060) | BE-029/sys, FE-022/front | QA-012/check | NOT_RUN |
| [AC-044-01 (สลับลำดับ Lesson ผ่านข้อมูลแล้วลำดับเปลี่ยน รหัสและการอ้างผลเดิมคงเดิม…)](../../modules/quiz/shared/requirements/req-044.md) | [TP001-061](tp-001-cases-learning-2.md#tp001-061) | BE-027/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-044-02 (แก้เนื้อหาฉบับร่างแล้วเปิดดูเนื้อหาใหม่ได้โดยไม่แก้โค้ด)](../../modules/quiz/shared/requirements/req-044.md) | [TP001-061](tp-001-cases-learning-2.md#tp001-061) | BE-027/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-044-03 (revision ที่ไม่มีหลักฐานอนุมัติเผยแพร่ไม่ได้)](../../modules/quiz/shared/requirements/req-044.md) | [TP001-061](tp-001-cases-learning-2.md#tp001-061), [TP001-084](tp-001-cases-learning-3.md#tp001-084), [TP001-085](tp-001-cases-learning-3.md#tp001-085), [TP001-086](tp-001-cases-learning-3.md#tp001-086), [TP001-087](tp-001-cases-learning-3.md#tp001-087) | BE-027/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-044-04 (เมื่อ publish revision ใหม่ ผู้เรียนเดิมยังเปิดฉบับเดิมและดูผลเดิมได้)](../../modules/quiz/shared/requirements/req-044.md) | [TP001-061](tp-001-cases-learning-2.md#tp001-061) | BE-027/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-044-05 (ขอแก้ฉบับ publish แล้วฉบับเดิมไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-044.md) | [TP001-061](tp-001-cases-learning-2.md#tp001-061), [TP001-084](tp-001-cases-learning-3.md#tp001-084), [TP001-085](tp-001-cases-learning-3.md#tp001-085), [TP001-087](tp-001-cases-learning-3.md#tp001-087) | BE-027/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |

รายละเอียด setup, response และ persisted state ของ BE-027 อยู่ใน [matrix ส่งต่อ check](traceability-001-learning-idempotency.md#matrix-ส่งต่อ-check) ระดับ integration บน stub แยกจาก PostgreSQL/หลาย process และประตูจริง ผลจริงยัง NOT_RUN

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ
