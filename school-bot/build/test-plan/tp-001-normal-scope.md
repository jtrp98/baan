# TP-001 — ขอบเขต normal และงาน full ที่คงไว้

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — ขอบเขตหลักฐานและความเสี่ยง)

ใช้คู่กับ [ตาราง normal](tp-001-normal-index.md)

## สิ่งที่ส่งต่อและช่องว่าง

normal ใช้ 14 case IDs: TP001-004/007/008/060/063/064/082 และ TP001-097–103 ไม่มี AC ในขอบเขตที่ขาด normal ส่วน full ที่คงไว้: TP001-002/003/005/006/009/010/083/088/094/095/096 และส่วน full ของเคสผสม ขอบ ref 1,000 ตัวของ bank คงตรวจใน TP001-095/096; normal ใช้ ref สั้น

for the full pass: License/identity มีความเสี่ยงสูงเรื่อง race, cache/replay, storage failure และสิทธิ์ข้าม scope; ทำซ้ำตาม full IDs เดิม ไม่ขยาย setup ของ full ในงานนี้ BE-029 wrong tenant/profile/term และ Level/Activity ผิดชุดคงเป็น full ภายใต้ TP001-060 ไม่ใช่เงื่อนไข normal

stub ไม่พิสูจน์ PostgreSQL/หลาย host, OS secure storage, process kill durability, H5 (เงื่อนไข route/env/network/trust), BFF/TLS/CSRF ของจริง, staff bootstrap โดยเจ้าของสิทธิ์, เนื้อหาเซ็นจริง หรือ UI/หุ่นจริง ผลส่วนนี้รอ owner/gate เดิม ไม่มีการยอมรับความเสี่ยงแทนคน BE-029 แถวอ่าน run ใช้ fixture ที่เปิดใช้แล้ว ไม่รับรอง public API เปิด/ปิด run เพิ่มจากสัญญา; BE-030 ประวัติ seed ไม่รับรอง attempt engine ของ BE-031

## หลักฐาน

- AC ต้นฉบับ: [REQ-027 (admin License)](../../modules/app-shell/shared/requirements/req-027.md), [REQ-028 (activate/validate)](../../modules/app-shell/shared/requirements/req-028.md), [REQ-034 (สิทธิ์ออนไลน์และออฟไลน์)](../../modules/app-shell/shared/requirements/req-034.md), [REQ-035 (ย้าย Key เดิม)](../../modules/app-shell/shared/requirements/req-035.md), [REQ-036 (บัญชีและ logout)](../../modules/app-shell/shared/requirements/req-036.md), [REQ-043 (Level และ Activity)](../../modules/quiz/shared/requirements/req-043.md), [REQ-046 (policy และคลังข้อสอบ)](../../modules/quiz/shared/requirements/req-046.md)
- [tasks-001.json](../plan/tasks-001.json) ac_ids/acceptance และ task cards ของทั้ง 8 งาน อ่านเท่านั้น
- [DES-004 Rev13](../design/des-004.md), [DES-012 Rev9](../design/des-012.md), [DES-005 Rev11](../design/des-005.md)/[API Rev10](../design/des-005-api.md), [CourseRun](../design/data-dictionary/table-018.md), [DES-010 Rev7](../design/des-010.md), [idempotency Rev2](../design/idempotency-001.md)
- [License setup](traceability-001-license-setup.md), [host setup](traceability-001-license-host-setup.md), [bank fixtures](tp-001-cases-quiz-grade-bank.md), [ข้อจำกัด logout](tp-001-logout-evidence.md)
