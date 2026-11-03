# TP-001 — setup นำเข้า Course Plan สำหรับ BE-028

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — setup นำเข้าและช่องว่าง persistence)

เอกสารนี้เป็นรายละเอียด TP001-062 (นำเข้า Sheet) เดิม ครอบ AC-045-01..04 (draft/ที่มา, ตัด O, สื่อชุดสอง, identity ถาวร) และ BR-045-01..05 (กฎนำเข้า) ตาม DES-005 Rev10 (หลักสูตร) กับ supplied-row contract Rev1 ทุกผลจริงยัง NOT_RUN ส่วน preview เริ่มได้ แต่ commit/read-back ขาดสัญญา จึงยังตรวจรับ AC ทั้งสี่ข้อไม่ได้

## เงื่อนไขก่อนตรวจ TP001-062

ระดับ unit สำหรับ normalization และ component สำหรับ supplied validator ใช้หนึ่ง process หนึ่ง validator/store ทดสอบว่าง เริ่ม revision/Lesson/Activity/audit/idempotency ledger อย่างละ 0 และ seed Level 1 รายการ ไม่มี network/Google Sheet/DB actor staffAuthor เป็น staff_admin มี content_author ชื่อไฟล์ต่อไปนี้เป็น fixture ที่ harness ต้องสร้างใน temporary directory ไม่ใช่ไฟล์ที่มีอยู่แล้วใน knowledge

สร้าง `course-plan-096-base.json` เป็น raw rows พร้อม manifest ของ fixture: source_ref=`fixture:course-plan-096`; source_row_key และ lesson_key ใช้ UUID `00000000-0000-4000-8000-` ต่อเลขแถว 12 หลัก (3,4,5) เหมือนกัน source_position เริ่ม 3,4,5 ห้าม derive key จาก C/O/Unit/ตำแหน่ง

| แถว | D / O / C / ชื่อแผน J | สื่อ |
|---|---|---|
| 3 | true / 90 / 6 / `Unit 7: How AI Learns` | J/L/N ใช้ refs `/plan-1`,`/slide-1`,`/exercise-1`; P=`เรื่องชุดสอง`, Q=`รายละเอียดชุดสอง`, R/S ว่าง, T=`/slide-2`, U/V ว่าง, W=`แบบฝึกชุดสอง`, X=`/exercise-2` |
| 4 | false / 91 / 13 / `Unit 6` | J มีชื่อแต่ไม่มี supplied hyperlink; P–X ว่าง ไม่มีสื่อ |
| 5 | null / ว่าง / 2 / `Unit 2` | J มีชื่อแต่ไม่มี supplied hyperlink; P–X ว่าง ไม่มีสื่อ |

refs ทุกตัวใช้ prefix `https://example.invalid` โดย J เก็บ display text กับ supplied hyperlink แยกกัน ทุกแถว A=`ป.1`, B=`fixture`, E=`บทเรียนทดสอบ`, F=1, G=`รายละเอียดทดสอบ`, H/I/K/M ว่าง ไม่ต้อง forward-fill

manifest ทดสอบระบุ J/L/N เป็นสื่อชุดแรก T/X เป็นชุดสอง แถวละ LessonInput: ordinal=1..3, title={th:E}, objective={th:B}, instructions={th:G}; หนึ่ง instruction Activity, mode=null, indicators=[], ActivityKey ใช้ UUID prefix เดิมเลขท้าย 103..105; config.kind=instruction-v1, instructions={th:Q หรือ G}, media_refs เรียง J,L,N,T,X เฉพาะ supplied links นี่เป็น mapping fixture `(สมมติฐาน — ยังไม่ยืนยัน)` ไม่ใช่ mapping Sheet/เนื้อหาจริง

สร้าง variants จาก base: `course-plan-096-o.json` เปลี่ยนเฉพาะ O เป็น 999,-1,ข้อความ; `course-plan-096-reorder.json` เรียงแถว 5,3,4 เปลี่ยน position/ordinal แต่ identity เดิม; `course-plan-096-invalid.json` ให้แถว 4 ขาด source_row_key และแถว 3 มีสื่อเป็นข้อความที่ไม่ใช่ URL

## ขั้นตอนและผล response + state

| Case → AC | ขั้นตอน/จุดพักหรือ inject | ผลที่ต้องอ่าน |
|---|---|---|
| TP001-062 → AC-045-01 (draft พร้อมที่มา) | normalize base เรียก supplied validator ไม่มีจุดพักหรือ inject | valid=true, 3 แถว errors=[]; normalized D=true/false/null ตรงต้นทาง ไม่มี publish; durable revision/Lesson/Activity/audit/ledger คง 0; response draft พร้อม provenance หลัง commit **ยังตรึงไม่ได้** |
| TP001-062 → AC-045-02 (ตัด O) | normalize base/o จาก store ว่างแยกกัน เทียบ canonical payload หลังตัด O | payload/hash ถ้ามีตรงกันทุกค่า validation ตรงกัน store ไม่เปลี่ยน ไม่ใช้ key เดิมกับ raw body ต่างเพื่อเดา replay |
| TP001-062 → AC-045-03 (สื่อครบ Lesson เดิม) | ตรวจ normalized base ก่อน validator | แถว 3 LessonKey เดียว instruction เดียวมี media refs ครบ 5 ค่า; ไม่สร้าง Course/Level จาก P–X; Level คง 1 durable domain/audit/ledger คง 0; read-back รอ contract |
| TP001-062 → AC-045-04 (key แยก C/Unit) | normalize base/reorder เทียบโดย source_row_key | แถว 3 C=6/Unit=7 มี UUID แยกจากสองค่า; ทั้ง 3 LessonKey เดิม ต่างเฉพาะ position/ordinal; valid=true ทั้งคู่ durable counts คงเดิม |
| TP001-062 → AC-045-01/03/04 (ผิดรูป) | ส่ง invalid ไม่มีจุดพัก | valid=false errors ชี้ field/แถวที่ขาด identity กับสื่อผิด; แถวไม่มีสื่อใน base ไม่เป็น error แบบเดียวกัน; counts ไม่เปลี่ยน ไม่เดา HTTP status เพราะไม่มี endpoint |

เก็บ raw/normalized fixture กับ hash และผล validator ทิ้ง validator/adapter เปิด adapter ใหม่ directory เดิมตรวจดิสก์ว่า preview ไม่เขียน หากยังไม่มี file adapter ใช้ store spy ยืนยัน write=0 และระบุว่ายังไม่ได้พิสูจน์ดิสก์ ไม่อ้างว่า storage รองรับ import แล้ว

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
