# Migration 002 — physical delta และข้อเสนอให้ arch ตรึงสัญญา

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 097 — ทบทวน BE-028 การนำเข้าแผนรายวิชา)

เอกสารนี้ส่ง delta ให้ arch ผู้ดูแลแบบข้อมูลและ DBML; [คู่มือรันและ rollback](migration-002-lesson-import-source.md) แยกขั้นของมนุษย์ออกจากข้อเสนอ API ที่ยังต้องตรึง

## ฟิลด์และหน่วยข้อมูล

ใช้ตาราง `public.SchoolBotLesson` ใน SchoolBot DB เดิม หนึ่งแถวคือหนึ่งบทเรียนใน curriculum revision เดียว เพิ่มหนึ่งคอลัมน์ `ImportSource jsonb NULL` ไม่มี DEFAULT expression, generated key หรือ identity ใหม่ ใช้ PK `SchoolBotLessonId` และ LessonKey UUID เดิม ไม่เพิ่ม/ลบ/เปลี่ยนชื่อตารางหรือฟิลด์เดิม และคง common columns หกฟิลด์เดิมทั้งหมด

| ตำแหน่ง | ชนิด/NULL/กฎ | ความหมายและเหตุผล |
|---|---|---|
| ImportSource ทั้ง field | SQL NULL หรือ object ที่มีสี่ key พอดี | NULL = ไม่มีหลักฐานนำเข้าที่ยืนยันได้; object = snapshot ของแถวต้นทาง ไม่ใช่ event log |
| source_ref | JSON string, 1–2048 ตัวอักษร, ไม่ว่างหลัง btrim | ที่มาของ Lesson ณ import เก็บตรงตัว; ไม่บังคับเป็น URL หรือ FK; source_ref ระดับ batch คัดลอกลงแต่ละ Lesson |
| source_row_key | JSON string รูป UUID canonical lowercase เท่ากับ LessonKey::text | identity จาก supplied manifest ที่ผ่านการรับรอง คงเดิมเมื่อ reorder ไม่ใช้ C/Unit/O หรือตำแหน่งเป็นรหัส |
| source_approved | ต้องมี key; JSON boolean หรือ JSON null | true=D=TRUE ณ import, false=D=FALSE, null=ต้นทางไม่ระบุ ห้าม null→false; ไม่ใช่สถานะ publish หรือการอนุมัติของ SchoolBot |
| row_hash | JSON string SHA-256 hex lowercase 64 ตัว | server คำนวณจาก normalized supplied row รวม D/เนื้อหา/สื่อ ไม่รวม O/source_position; เป็น snapshot hash ไม่ใช่ unique identity |

`source_ref` ไม่ trim ก่อนเก็บเพียงเพื่อให้ผ่านข้อกำหนด; ผิด bounds ให้ validation error บน API คอลัมน์ Curriculum.SourceRef เดิมยังเป็นที่มาระดับ revision ไม่มี envelope และไม่ต้องเท่ากับทุก Lesson.SourceRef เพราะ revision อาจรวมหลายแหล่งตามสัญญาที่ arch ตรึง

## ข้อบังคับ SQL และข้อจำกัด

- `CK_SchoolBotLesson_ImportSource_v1` บังคับชนิด/จำนวน key/ค่าที่ตารางข้างบน และ `SchoolId IS NULL` เฉพาะแถวที่มี provenance ใช้ CASE และ IS TRUE ปิดช่อง CHECK ผ่านเพราะค่าที่หายกลายเป็น SQL NULL; JSON null ทั้งคอลัมน์ไม่ผ่าน
- `UX_SchoolBotLesson_ImportSource_Row_v1` เป็น partial unique btree บน `(CurriculumId,LessonKey) WHERE ImportSource IS NOT NULL` จึงเทียบเท่ากันซ้ำ `(CurriculumId,source_row_key)` ตาม CHECK รวมแถว IsDelete=true; revision ใหม่ใช้ CurriculumId ใหม่จึง reuse logical key ได้
- Query dedup คือ `WHERE CurriculumId=$1 AND LessonKey=$2 AND ImportSource IS NOT NULL` คืน row ID/hash ก่อนตัดสินซ้ำ; index เพิ่มงานตรวจ uniqueness/เขียน index สำหรับ imported rows และมีต้นทุนสแกนตอนสร้าง ไม่เพิ่ม GIN หรือ index บน D/hash เพราะไม่มี query pattern รองรับ
- ไม่มี SQL FK ใหม่: Lesson.CurriculumId→Curriculum.SchoolBotCurriculumId และ Activity.LessonId→Lesson.SchoolBotLessonId ยังเป็น application relationships; source_row_key/source_ref ไม่ใช่ legacy/cross-database FK
- Partial index ไม่กันแถว ImportSource=NULL ที่มี LessonKey เดียวกัน ไม่ห้ามถอด provenance และไม่ตรวจ SHA-256 ตรงเนื้อหา ไม่ตรวจ parent existence/published state อัตโนมัติ เป็นข้อจำกัดที่ต้องปิดด้วย transaction contract ก่อนเปิด import writer

## Delta ที่ arch ต้องตรึงใน DES-005

1. `GET /v2/admin/curricula/{id}`: เพิ่ม read model แยกจาก input เช่น `LessonView.import_source:{source_ref,source_row_key,source_approved,row_hash}|null` ใต้ `CurriculumDraftView.lessons[]` อ่านค่าทั้งสี่จาก ImportSource ของ Lesson จริง ไม่ fallback จาก publication approval/Audit.Reason คืน null สำหรับแถวเดิม Public GET `/v2/curricula/{id}` ให้ arch ระบุชัดว่าจะเปิดเฉพาะป้าย D/ที่มาหรือไม่ ก่อนส่ง source_ref ให้ผู้เรียน
2. เลือก import commit endpoint/Operation และ DTO หลัง review นี้ ห้ามถือว่า create+content PUT สองคำขอเป็น atomic batch หนึ่งครั้ง เก็บ batch, children, audit และ durable idempotency result ใน transaction เดียว; คง rule replay/hash conflict เดิม
3. ล็อก parent Curriculum ด้วย SELECT FOR UPDATE ก่อนอ่าน lifecycle/ETag และก่อน dedup/เขียน child ทุกช่องทาง รวม content replacement, import, publish และการลบ ตรวจ global/ไม่ถูกลบ/`Lifecycle=draft` และ `PublishedAt IS NULL` ภายใต้ lock เดียวกัน Published/retired children รวม ImportSource ห้ามเปลี่ยน; migration นี้ไม่ backfill แม้รู้ D ภายหลัง ต้องใช้ revision ใหม่
4. ตรวจทุก LessonKey ใน revision รวมแถว provenance=NULL และ soft delete ก่อน import: มี imported identity/hash เดิมให้คืน resource เดิมโดยไม่เพิ่ม Lesson/Activity; hash ต่างหรือชนแถวไม่มี provenance ให้ `409 STATE_CONFLICT` ทั้ง batch ไม่ auto-attach/overwrite/merge/skip แถวเดิม ทุก read-write path ต้องรักษา provenance และห้ามล้าง/แทนด้วย NULL ผ่าน content PUT โดยเงียบ
5. ตรึง hash canonicalization ให้ writer/reader ใช้ร่วมกัน รวม true/false/null แยกกัน, content/media เดิม, source_ref และ identity ตาม normalized supplied-row contract ตัด O และ source_position ก่อน hash; ส่ง hash จาก client ไม่ได้แทนการคำนวณ server ผลเปลี่ยน D/สื่อ/ref ต้อง conflict เมื่อ identity เดิม
6. P–X คงสื่อชุดสองใน Lesson เดิมผ่าน Activity.Config แบบ instruction-v1 เดิม; ไม่เพิ่ม Level/Course/quiz จากเอกสารแบบฝึกหัด การสลับลำดับไม่เปลี่ยน LessonKey; source_position ใช้ชี้ validation error ไม่ persist ใน provenance

ข้อ 1–6 เป็นข้อเสนอให้ arch ตรึงและตรวจ implementation ไม่ใช่สัญญาที่แก้แล้ว ห้ามปลด gate persistence จากการมี migration เพียงอย่างเดียว Source manifest จริงยังรอ content owner; ไม่เดาว่า Sheet มี UUID แล้ว

## หลักฐาน

อ่านสัญญาและพจนานุกรมที่ระบุใน [ผลเทียบเอกสารและสิ่งที่รอผู้รับผิดชอบ](migration-002-lesson-import-source-review.md) ซึ่งแยก mismatch และข้อพิจารณา PII สำหรับ jpo ไว้ครบ
