# TP-001 — ผลตรวจนำเข้าและช่องว่างสัญญา BE-028

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — expected นำเข้าและประตู persistence)

ใช้ [setup/fixture TP001-062](tp-001-cases-quiz-grade-import.md) ทุกส่วน ระดับ unit/component สำหรับ preview และ integration สำหรับ persistence ทุกผลจริง NOT_RUN

<a id="tp001-062-detail"></a>

## ขั้นตอนและผล response + state

| Case → AC | ขั้นตอน/จุดพักหรือ inject | ผลที่ต้องอ่าน |
|---|---|---|
| TP001-062 → AC-045-01 (draft พร้อมที่มา) | normalize base เรียก supplied validator ไม่มีจุดพักหรือ inject | valid=true, 3 แถว errors=[]; normalized D=true/false/null ตรงต้นทาง ไม่มี publish; durable revision/Lesson/Activity/audit/ledger คง 0; response draft พร้อม provenance หลัง commit **ยังตรึงไม่ได้** |
| TP001-062 → AC-045-02 (ตัด O) | normalize base/o จาก store ว่างแยกกัน เทียบ canonical payload หลังตัด O | payload/hash ถ้ามีตรงกันทุกค่า validation ตรงกัน store ไม่เปลี่ยน ไม่ใช้ key เดิมกับ raw body ต่างเพื่อเดา replay |
| TP001-062 → AC-045-03 (สื่อครบ Lesson เดิม) | ตรวจ normalized base ก่อน validator | แถว 3 LessonKey เดียว instruction เดียวมี media refs ครบ 5 ค่า; ไม่สร้าง Course/Level จาก P–X; Level คง 1 durable domain/audit/ledger คง 0; read-back รอ contract |
| TP001-062 → AC-045-04 (key แยก C/Unit) | normalize base/reorder เทียบโดย source_row_key | แถว 3 C=6/Unit=7 มี UUID แยกจากสองค่า; ทั้ง 3 LessonKey เดิม ต่างเฉพาะ position/ordinal; valid=true ทั้งคู่ durable counts คงเดิม |
| TP001-062 → AC-045-01/03/04 (ผิดรูป) | ส่ง invalid ไม่มีจุดพัก | valid=false errors ชี้ field/แถวที่ขาด identity กับสื่อผิด; แถวไม่มีสื่อใน base ไม่เป็น error แบบเดียวกัน; counts ไม่เปลี่ยน ไม่เดา HTTP status เพราะไม่มี endpoint |

เก็บ raw/normalized fixture กับ hash และผล validator ทิ้ง validator/adapter เปิด adapter ใหม่ directory เดิมตรวจดิสก์ว่า preview ไม่เขียน หากยังไม่มี file adapter ใช้ store spy ยืนยัน write=0 และระบุว่ายังไม่ได้พิสูจน์ดิสก์ ไม่อ้างว่า storage รองรับ import แล้ว

<a id="tp001-093"></a>

## TP001-093 — นำเข้าซ้ำและ batch แข่งกัน

AC: AC-045-01..04 ความหมายข้างต้น · ระดับ integration · **รอตรึง expected persistence**

เมื่อ arch ตรึง contract ใช้หนึ่ง process สอง importer service/adapter objects ชี้ file store directory เดียว actor staffAuthor เดียว SchoolId=null target draft เดียว base เดียว พัก A หลังได้ store lock/อ่าน ledger ก่อน durable replace ให้ B ถึง store call และรอจริงแล้วปล่อย A ไม่ใช้ sleep ทำทั้ง UUID/body เดิม, UUID ใหม่ row identity เดิม, identity เดิมเปลี่ยน D/สื่อ, batch มี conflict หนึ่งแถว และตัด response หลัง commit แล้วเปิด adapter ใหม่ retry key เดิม

idempotency Rev1 บังคับ tuple/hash เดิมคืน status/body/ID/ETag เดิม ไม่เพิ่ม audit/ledger; hash ต่างคืน 409 IDEMPOTENCY_CONFLICT แต่ operation/hash/import success DTO และ dedup ของ key ใหม่ยังไม่ตรึง กฎ dedup/rollback ใน supplied-row contract เป็นข้อเสนอ จึงยังไม่กำหนดจำนวน revision/Lesson/audit/ledger หลัง import ไม่ยกข้อเสนอเป็นเกณฑ์รับรอง

## ช่องว่างที่ส่ง arch

Task BE-028 / Reference DES-005 Rev10 และ learning-sheet-import-001 Rev1 / Reason: AC-045-01 ต้องอ่าน draft พร้อม provenance/D ถาวร แต่ storage ยังเป็น new-column proposal และไม่มี commit/read-back endpoint ขอ arch ตรึง storage/read model โดยผ่าน gate schema ตามจำเป็น, source identity/mapping manifest, operation/hash/success response และ atomic/dedup พร้อม audit/ledger counts ก่อนเติม expected persistence ของ TP001-062/093 ไม่ต้องเปลี่ยน AC

## ประตูและความเสี่ยง

validator/normalization บน stub เริ่มได้; persistence ยังตรวจรับไม่ได้ เนื้อหาจริงรอ G-LEARN (ผู้ใช้เซ็นเนื้อหา BA-005/006 ตามมติ 053); PostgreSQL สอง OS processes/สอง connections ใช้ store ร่วมและ rollback รอ DBA-003/G-CORE; ตัวตน/transport จริงรอ H5 ไม่ปิดประตูจาก preview ไม่มีการยอมรับความเสี่ยงแทนสัญญาที่ยังขาด

## ยังไม่ยืนยัน

mapping/identity/เนื้อหา fixture เป็นสมมติฐานทดสอบ ยืนยันของจริงด้วย manifest/mapping จาก content owner และเนื้อหาที่มนุษย์เซ็นรับ; provenance/endpoint รอ arch และการตัดสิน schema ของมนุษย์

## หลักฐาน

- [REQ-045 (กฎและ AC นำเข้า)](../../modules/quiz/shared/requirements/req-045.md), [DES-005 Rev10](../design/des-005.md), [โครงเนื้อหา Rev8](../design/des-005-content.md)
- [supplied rows และ storage stopline Rev1](../design/learning-sheet-import-001.md), [ความหมายคอลัมน์ต้นทาง](../design/source-review-003.md), [idempotency Rev1](../design/idempotency-001.md)
- [มติ 053 (stub และประตูจริง)](../../shared/decisions/decisions-053.md)
