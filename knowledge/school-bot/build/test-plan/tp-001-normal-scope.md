# TP-001 — ขอบเขต normal และงาน full ที่คงไว้

> Rev 3 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — เพิ่มขอบเขต normal/full ของ BE-015, BE-031, BE-035 และ FE-020)

ใช้คู่กับ [ตาราง normal](tp-001-normal-index.md)

## สิ่งที่ส่งต่อและช่องว่าง

normal ใช้ 26 case IDs: TP001-004/007/008/024/054/060/062/063/064/069/070/081/082/093, TP001-097–103 และ TP001-116–120 ไม่มี AC (Acceptance Criteria: เกณฑ์ตรวจรับ) ในขอบเขตทั้ง 13 งานที่ขาดเคส normal ส่วน full ที่คงไว้: TP001-002/003/005/006/009/010/055/083/088/094/095/096 และส่วน full ของเคสผสม ขอบ ref 1,000 ตัวของ bank คงตรวจใน TP001-095/096; normal ใช้ ref สั้น

for the full pass: License/identity มีความเสี่ยงสูงเรื่อง race, cache/replay, storage failure และสิทธิ์ข้าม scope; ทำซ้ำตาม full IDs เดิม ไม่ขยาย setup ของ full ในงานนี้ BE-029 wrong tenant/profile/term และ Level/Activity ผิดชุดคงเป็น full ภายใต้ TP001-060 ไม่ใช่เงื่อนไข normal

BE-015 ครอบ AC-037-02..04 ด้วย [TP001-054 ส่วน normal](tp-001-normal-learning-quiz.md#tp001-054-normal) และ [TP001-116](tp-001-normal-learning-quiz.md#tp001-116); worker ตรวจอัตโนมัติ (BE-016) และการตรวจ Arm โดยครู (BE-017) แยกงานออกไป ส่วน replay/ข้ามโรงเรียน/รอบเรียนกำกวมเป็น full ภายใต้ TP001-054/055

BE-031 ครอบ AC-046-02/03/07 และ AC-036-05 ด้วย [TP001-117, TP001-118, TP001-081 ส่วน normal และ TP001-024 ส่วน normal](tp-001-normal-learning-quiz.md) โดยเก็บ `attempts` ใน `CurriculumStoreSnapshot` เดียวกับคลังข้อสอบตาม [การเก็บบน stub store ของ DES-010 Rev1](../design/des-010-stub-persistence.md); การแก้เวลา/เปิดซ่อมรายคนเป็นงาน BE-032 ส่วนขอบเวลา `t_accept == deadline_at`, response สูญหายหลัง finalize, การแข่งเริ่ม attempt และการนำเข้าประวัติ Guest (BE-026) คงเป็น full

BE-035 ครอบ AC-049-01..05 ด้วย [TP001-069 และ TP001-070 ส่วน normal](tp-001-normal-grade-mapping.md) บน stub คู่กับตัวจำลองอ่าน School DB/PGGradeDB (`PGGradeDB writes = 0`); การคำนวณคะแนน preview (BE-036) และการเขียนคะแนนจริง (BE-037/038) แยกงานออกไป ส่วนการแข่งจองช่องพร้อมกัน 2 processes, If-Match เก่า/ขาดหาย และ token/สิทธิ์ปลอมคงเป็น full

FE-020 ครอบ AC-046-01 และ AC-046-04 ฝั่ง UI ด้วย [TP001-119 และ TP001-120](tp-001-normal-learning-quiz.md#tp001-119) เชื่อม API ของ BE-030 ตาม [UX-005 ที่อนุมัติแล้ว](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md); ส่วนฟอร์มผิด S2/S4, ข้อมูลชน `412 VERSION_CONFLICT`, แถบค้างเมื่อไม่ทราบผล S3 และการตรวจ accessibility เต็มชุด S6 คงเป็น full

stub ไม่พิสูจน์ PostgreSQL/หลาย host, OS secure storage, process kill durability, H5 (เงื่อนไข route/env/network/trust), BFF/TLS/CSRF ของจริง, staff bootstrap โดยเจ้าของสิทธิ์, เนื้อหาเซ็นจริง, PGGradeDB/School DB จริง หรือ UI/หุ่นจริง ผลส่วนนี้รอ owner/gate เดิม ไม่มีการยอมรับความเสี่ยงแทนคน BE-029 แถวอ่าน run ใช้ fixture ที่เปิดใช้แล้ว ไม่รับรอง public API เปิด/ปิด run เพิ่มจากสัญญา; BE-030 ประวัติ seed ไม่รับรอง attempt engine ของ BE-031

BE-028 ครอบ AC-045-01..04 ด้วย TP001-062 A/D/E/P และ TP001-093 B/C ตาม [ตารางเคส](tp-001-cases-quiz-grade-import-cases.md); B/C เป็น normal ตามใบงานแม้เกี่ยวข้องกับ replay ไม่มี fault injection ส่วน F–O และ ImportSource ผิดรูป → 500 เป็นชื่อเคสระดับ full รอ check ขยาย setup ใน full pass ความเสี่ยงสำคัญคือข้าม codec/lock แล้วซ้ำหรือ provenance เสีย; ยังไม่มีผู้รับความเสี่ยง การตรวจ PostgreSQL/หลาย host และ migration จริงคงรอเจ้าของประตู ไม่กีดขวาง stub normal

## หลักฐาน

- AC ต้นฉบับ: [REQ-027 (admin License)](../../modules/app-shell/shared/requirements/req-027.md), [REQ-028 (activate/validate)](../../modules/app-shell/shared/requirements/req-028.md), [REQ-034 (สิทธิ์ออนไลน์และออฟไลน์)](../../modules/app-shell/shared/requirements/req-034.md), [REQ-035 (ย้าย Key เดิม)](../../modules/app-shell/shared/requirements/req-035.md), [REQ-036 (บัญชีและ logout)](../../modules/app-shell/shared/requirements/req-036.md), [REQ-037 (หลักสูตรและภารกิจสามโหมด)](../../modules/quiz/shared/requirements/req-037.md), [REQ-043 (Level และ Activity)](../../modules/quiz/shared/requirements/req-043.md), [REQ-045 (นำเข้า Course Plan)](../../modules/quiz/shared/requirements/req-045.md), [REQ-046 (policy และคลังข้อสอบ)](../../modules/quiz/shared/requirements/req-046.md), [REQ-049 (mapping ช่องคะแนน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [tasks-001.json](../plan/tasks-001.json) ac_ids/acceptance และ task cards ในแผน; BE-028, BE-015, BE-031, BE-035 และ FE-020 เพิ่มตามใบงาน 097 อ่านเท่านั้น
- [DES-004 Rev13](../design/des-004.md), [DES-012 Rev9](../design/des-012.md), [DES-005 Rev12](../design/des-005.md)/[API Rev11](../design/des-005-api.md), [CourseRun](../design/data-dictionary/table-018.md), [DES-008 Rev6](../design/des-008.md)/[HTTP Rev6](../design/des-008-api.md), [DES-010 Rev8](../design/des-010.md)/[API Rev6](../design/des-010-api.md)/[stub persistence Rev1](../design/des-010-stub-persistence.md), [idempotency Rev4](../design/idempotency-001.md)
- [License setup](traceability-001-license-setup.md), [host setup](traceability-001-license-host-setup.md), [bank fixtures](tp-001-cases-quiz-grade-bank.md), [ข้อจำกัด logout](tp-001-logout-evidence.md), [เคส normal BE-015/031/FE-020](tp-001-normal-learning-quiz.md), [เคส normal BE-035](tp-001-normal-grade-mapping.md)
- BE-028: [import Rev2](../design/des-005-import.md), [state Rev1](../design/des-005-import-state.md), [migration-002 Rev2](../db/migration-002-lesson-import-source.md); FE-020: [UX-005 ที่อนุมัติแล้ว (int-006)](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md), [มติ 043 (อนุมัติ UX-005/007)](../../shared/decisions/decisions-043.md)
