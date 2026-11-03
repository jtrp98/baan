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

normalize D ไป source_approved และ source_ref/identity ตาม manifest โดยไม่รวม O; manifest ทดสอบระบุ J/L/N เป็นสื่อชุดแรก T/X เป็นชุดสอง แถวละ LessonInput: ordinal=1..3, title={th:E}, objective={th:B}, instructions={th:G}; missions=[] และหนึ่ง instruction Activity, mode=null, indicators=[], ActivityKey ใช้ UUID prefix เดิมเลขท้าย 103..105; config.kind=instruction-v1, instructions={th:Q หรือ G}, media_refs เรียง J,L,N,T,X เฉพาะ supplied links นี่เป็น mapping fixture `(สมมติฐาน — ยังไม่ยืนยัน)` ไม่ใช่ mapping Sheet/เนื้อหาจริง

สร้าง variants จาก base: `course-plan-096-o.json` เปลี่ยนเฉพาะ O เป็น 999,-1,ข้อความ; `course-plan-096-reorder.json` เรียงแถว 5,3,4 เปลี่ยน position/ordinal แต่ identity เดิม; `course-plan-096-invalid.json` ให้แถว 4 ขาด source_row_key และแถว 3 มีสื่อเป็นข้อความที่ไม่ใช่ URL

ขั้นตอนและผลอยู่ใน [รายละเอียด TP001-062/093](tp-001-cases-quiz-grade-import-cases.md) พร้อมช่องว่างสัญญาที่ส่ง arch

## ยังไม่ยืนยัน

mapping/identity/เนื้อหา fixture เป็นสมมติฐานทดสอบ รอ manifest จาก content owner และเนื้อหาที่ผู้ใช้เซ็นรับ

## หลักฐาน

- [REQ-045 (กฎและ AC นำเข้า)](../../modules/quiz/shared/requirements/req-045.md), [DES-005 Rev10](../design/des-005.md), [โครงเนื้อหา Rev8](../design/des-005-content.md)
- [supplied rows และ storage stopline Rev1](../design/learning-sheet-import-001.md), [ความหมายคอลัมน์ต้นทาง](../design/source-review-003.md), [idempotency Rev1](../design/idempotency-001.md)
- [มติ 053 (stub และประตูจริง)](../../shared/decisions/decisions-053.md)
