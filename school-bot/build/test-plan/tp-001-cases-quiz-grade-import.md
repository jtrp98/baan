# TP-001 — setup นำเข้า Course Plan สำหรับ BE-028

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — setup importer บน stub ตามสัญญาที่ตรึงแล้ว)

เอกสารนี้เป็น setup ของ TP001-062 (นำเข้า Sheet) และ TP001-093 (นำเข้าซ้ำข้าม adapter) ครอบ AC-045-01..04 (draft/ที่มา, ตัด O, สื่อชุดสอง, identity ถาวร) และ BR-045-01..05 (กฎนำเข้า) ใช้ des-005-import Rev2, des-005-import-state Rev1 §1, des-005-api Rev11, idempotency-001 Rev4 และ migration-002 Rev2 ทุกผล runtime ยัง NOT_RUN

## เงื่อนไขก่อนตรวจ TP001-062

ระดับ unit สำหรับ normalization และ integration ระหว่าง service/adapter/stub ใช้ 1 host/1 process มี importer services/adapters A/B สองชุด รัน memory/file แยกกัน: memory ใช้ store object เดียวร่วมกัน; file ใช้ store objects สองตัวชี้ absolute temporary directory เดียวกัน อ่านด้วย adapter/reader C ที่สาม (memory ใช้ object เดิม; file สร้าง object ใหม่/reopen directory เดิม) ไม่มี network/Google Sheet/PostgreSQL ใช้ auth/directory double; actor staffAuthor เป็น staff_admin มี content_author, SchoolId=NULL ไม่มี fault injection ใน normal

seed S0 ด้วย snapshot builder โดยตรง: CurriculumKey UUID คงที่ revision=1, lifecycle=draft, published_at=null, approval=null, SchoolId=NULL; Curriculum 1, Level 1, Lesson/Activity/Mission/Criteria/audit/idempotency ledger=0 ไม่ใช้ create endpoint ใน baseline เวลา fake UTC T0=2026-11-03T00:00:00Z; A import ที่ T0+1 นาที แล้ว C อ่านเก็บเป็น S1 รวม IDs, UpdateDate/ETag, provenance, audit/ledger แต่ละกรณีเริ่ม S0/S1 ใหม่ ไม่ต่อ counts ของกรณีอื่น

เรียก `POST /v2/admin/curricula/{id}/import` ด้วย normalized DTO และ Idempotency-Key ไม่ใช้ If-Match; k1..k4 เป็น UUID คนละค่า เรียกซ้ำภายใน 1 นาทีจาก S1 ด้วย fake clock เพื่ออยู่ใน replay window คง test cipher/key เมื่อ reopen; Operation=`import_curriculum_lessons`, Principal=`staff_admin:{PrincipalId}` ชื่อไฟล์ต่อไปนี้เป็น fixture ที่ harness ต้องสร้างใน temporary directory

สร้าง `course-plan-096-base.json` เป็น raw rows พร้อม manifest ของ fixture: source_ref=`fixture:course-plan-096`; source_row_key และ lesson_key ใช้ UUID `00000000-0000-4000-8000-` ต่อเลขแถว 12 หลัก (3,4,5) เหมือนกัน source_position เริ่ม 3,4,5 ห้าม derive key จาก C/O/Unit/ตำแหน่ง

| แถว | D / O / C / ชื่อแผน J | สื่อ |
|---|---|---|
| 3 | true / 90 / 6 / `Unit 7: How AI Learns` | J/L/N ใช้ refs `/plan-1`,`/slide-1`,`/exercise-1`; P=`เรื่องชุดสอง`, Q=`รายละเอียดชุดสอง`, R/S ว่าง, T=`/slide-2`, U/V ว่าง, W=`แบบฝึกชุดสอง`, X=`/exercise-2` |
| 4 | false / 91 / 13 / `Unit 6` | J มีชื่อแต่ไม่มี supplied hyperlink; P–X ว่าง ไม่มีสื่อ |
| 5 | null / ว่าง / 2 / `Unit 2` | J มีชื่อแต่ไม่มี supplied hyperlink; P–X ว่าง ไม่มีสื่อ |

refs ทุกตัวใช้ prefix `https://example.invalid` โดย J เก็บ display text กับ supplied hyperlink แยกกัน ทุกแถว A=`ป.1`, B=`fixture`, E=`บทเรียนทดสอบ`, F=1, G=`รายละเอียดทดสอบ`, H/I/K/M ว่าง ไม่ต้อง forward-fill

normalize D ไป source_approved และ source_ref/identity ตาม manifest โดยไม่รวม O; manifest ทดสอบระบุ J/L/N เป็นสื่อชุดแรก T/X เป็นชุดสอง แถวละ LessonInput: ordinal=1..3, title={th:E}, objective={th:B}, instructions={th:G}; missions=[] และหนึ่ง instruction Activity, mode=null, indicators=[], ActivityKey ใช้ UUID prefix เดิมเลขท้าย 103..105; config.kind=instruction-v1, instructions={th:Q หรือ G}, media_refs เรียง J,L,N,T,X เฉพาะ supplied links นี่เป็น mapping fixture `(สมมติฐาน — ยังไม่ยืนยัน)` ไม่ใช่ mapping Sheet/เนื้อหาจริง

สร้าง variants จาก base: `course-plan-096-o.json` เปลี่ยนเฉพาะ O เป็น 999,-1,ข้อความ; `course-plan-096-reorder.json` เรียงแถว 5,3,4 เปลี่ยน position/ordinal แต่ identity เดิม; `course-plan-096-invalid.json` ให้แถว 4 ขาด source_row_key และแถว 3 มีสื่อเป็นข้อความที่ไม่ใช่ URL

ขั้นตอนและผลอยู่ใน [รายละเอียด TP001-062/093](tp-001-cases-quiz-grade-import-cases.md) โดยอ่าน state ผ่าน C ไม่ใช้ response/cache ของ A แทน persisted state

## ยังไม่ยืนยัน

mapping/identity/เนื้อหา fixture เป็นสมมติฐานทดสอบ รอ manifest จาก content owner และเนื้อหาที่ผู้ใช้เซ็นรับ

## หลักฐาน

- [REQ-045 (กฎและ AC นำเข้า)](../../modules/quiz/shared/requirements/req-045.md), [import Rev2](../design/des-005-import.md), [state Rev1 §1](../design/des-005-import-state.md#1-ผลที่คาดราย-case)
- [API Rev11](../design/des-005-api.md), [idempotency Rev4](../design/idempotency-001.md), [migration-002 Rev2](../db/migration-002-lesson-import-source.md)
- [มติ 053 (stub และประตูจริง)](../../shared/decisions/decisions-053.md)
