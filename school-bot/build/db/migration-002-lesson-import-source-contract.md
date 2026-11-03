# Migration 002 — physical delta และข้อเสนอให้ arch ตรึงสัญญา

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (มติ 2026-11-03 — เพิ่มเฉพาะคอลัมน์)

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

## ข้อบังคับ SQL และความเสี่ยงเมื่อไม่มี constraint

มติผู้ใช้ 2026-11-03: "เพิ่ม column ได้ แต่ไม่เพิ่ม index หรืออะไรทั้งนั้น เพิ่มได้ คอลลั่ม" จึงเพิ่มเฉพาะ `ImportSource jsonb NULL` ไม่มี DEFAULT, generated key, CHECK, UNIQUE, index, trigger, FK หรือ COMMENT ใหม่ PK เดิมคงเดิม ทุกกฎในตาราง JSON ข้างบนเป็นหน้าที่ application; PostgreSQL ตรวจเพียงว่าเป็นค่า jsonb ที่ถูกต้องตามชนิด จึงรับ scalar, array, JSON null และ object ผิดรูปได้

รายการที่ arch ต้องตรึงให้ application รับผิดชอบก่อนเปิด writer (รวมตรวจ LessonKey ซ้ำภายใน batch ก่อนเขียน):

1. ตรวจรูปทรงก่อนเขียน: SQL NULL หรือ object สี่ key พอดี ชนิด/ความยาว/ค่าตรงตารางข้างบน ไม่รับ JSON null ทั้งคอลัมน์ ตรวจ `SchoolId IS NULL` สำหรับ imported Lesson และ `source_row_key = LessonKey::text` รูป UUID canonical lowercase; คำนวณ hash ฝั่ง server และตรวจ parent/lifecycle ภายใต้ coordination เดียว
2. กันนำเข้าซ้ำตาม [idempotency-001 Rev2 (สัญญา idempotency ส่วนกลาง)](../design/idempotency-001.md): จอง/ค้น replay ภายใต้ store lock และ commit domain/audit/result ในหน่วยเดียว คง actor/SchoolId/Operation/RequestKey/hash/expiry ตามสัญญา ให้ arch ตรึง Operation และ hash ของ import โดยไม่เดาชื่อ ใช้ transaction-scoped facade ไม่แยกจำผลหลัง commit
3. ค้นก่อนเขียนในหน่วยเดียว: ล็อก parent Curriculum ด้วย coordination ร่วมทุก writer แล้วค้นทุก LessonKey ของ revision รวม provenance=NULL และ soft delete ก่อน insert แม้ RequestKey/actor ต่างกันก็ต้องตรวจ identity ของ domain เดิม imported identity/hash เดิมคืน resource เดิม; hash ต่างหรือชนแถวไม่มี provenance ตอบ `409 STATE_CONFLICT` ทั้ง batch การใช้ transaction อย่างเดียวโดยไม่มี lock/coordination ร่วมยังแข่งกัน insert ซ้ำได้
4. รักษารหัสคงเดิม: ใช้ LessonKey จาก supplied manifest ที่รับรองและคงเดิมเมื่อ reorder; ห้ามใช้ตำแหน่ง/O เป็นรหัส ตรวจความตรงกับ source_row_key ทุกครั้ง ห้ามล้าง provenance ผ่าน content replacement และห้ามแก้ published/retired children ทุกช่องทาง

ไม่มี DB constraint คอยปฏิเสธ JSON ผิดรูป/identity ไม่ตรง/นำเข้าซ้ำ ผู้เขียนตรงฐานหรือ writer ที่ข้าม validation/coordination สามารถทำให้ข้อมูลผิดหรือซ้ำได้ รวมหลาย instance ที่ล็อกไม่ร่วมกัน idempotency ของคำขอไม่แทน domain dedup และไม่รับประกัน writer นอกสัญญา ความเสี่ยงนี้ยังเปิด ไม่ใช่การรับความเสี่ยงแทนผู้ใช้

Query dedup คือ `WHERE CurriculumId=$1 AND LessonKey=$2` แล้วอ่าน ID/ImportSource/hash รวมทุกสถานะ ไม่มี index ใหม่รองรับ จึงอาจสแกนข้อมูลมากขึ้นและถือ lock นานขึ้น ไม่มีต้นทุนเขียน/สร้าง index เพิ่ม แต่ jsonb เพิ่มขนาดแถวและต้นทุนเขียนข้อมูลจริง ต้องวัดจาก query จริงภายหลัง การเพิ่ม index ต้องผ่านมติใหม่

ไม่มี SQL FK ใหม่: Lesson.CurriculumId→Curriculum.SchoolBotCurriculumId และ Activity.LessonId→Lesson.SchoolBotLessonId ยังเป็น application relationships; source_row_key/source_ref ไม่ใช่ legacy/cross-database FK ไม่มีการอ่าน/เขียนฐาน legacy

## Delta ที่ arch ต้องตรึงใน DES-005

1. `GET /v2/admin/curricula/{id}`: เพิ่ม read model แยกจาก input เช่น `LessonView.import_source:{source_ref,source_row_key,source_approved,row_hash}|null` ใต้ `CurriculumDraftView.lessons[]` อ่านค่าทั้งสี่จาก ImportSource ของ Lesson จริง ไม่ fallback จาก publication approval/Audit.Reason คืน null สำหรับแถวเดิม Public GET `/v2/curricula/{id}` ให้ arch ระบุชัดว่าจะเปิดเฉพาะป้าย D/ที่มาหรือไม่ ก่อนส่ง source_ref ให้ผู้เรียน
2. เลือก import commit endpoint/Operation และ DTO หลัง review นี้ ห้ามถือว่า create+content PUT สองคำขอเป็น atomic batch หนึ่งครั้ง เก็บ batch, children, audit และ durable idempotency result ใน transaction เดียว; คง rule replay/hash conflict เดิม
3. ล็อก parent Curriculum ด้วย SELECT FOR UPDATE ก่อนอ่าน lifecycle/ETag และก่อน dedup/เขียน child ทุกช่องทาง รวม content replacement, import, publish และการลบ ตรวจ global/ไม่ถูกลบ/`Lifecycle=draft` และ `PublishedAt IS NULL` ภายใต้ lock เดียวกัน Published/retired children รวม ImportSource ห้ามเปลี่ยน; migration นี้ไม่ backfill แม้รู้ D ภายหลัง ต้องใช้ revision ใหม่
4. ตรวจทุก LessonKey ใน revision รวมแถว provenance=NULL และ soft delete ก่อน import: มี imported identity/hash เดิมให้คืน resource เดิมโดยไม่เพิ่ม Lesson/Activity; hash ต่างหรือชนแถวไม่มี provenance ให้ `409 STATE_CONFLICT` ทั้ง batch ไม่ auto-attach/overwrite/merge/skip แถวเดิม ทุก read-write path ต้องรักษา provenance และห้ามล้าง/แทนด้วย NULL ผ่าน content PUT โดยเงียบ
5. ตรึง hash canonicalization ให้ writer/reader ใช้ร่วมกัน รวม true/false/null แยกกัน, content/media เดิม, source_ref และ identity ตาม normalized supplied-row contract ตัด O และ source_position ก่อน hash; ส่ง hash จาก client ไม่ได้แทนการคำนวณ server ผลเปลี่ยน D/สื่อ/ref ต้อง conflict เมื่อ identity เดิม
6. P–X คงสื่อชุดสองใน Lesson เดิมผ่าน Activity.Config แบบ instruction-v1 เดิม; ไม่เพิ่ม Level/Course/quiz จากเอกสารแบบฝึกหัด การสลับลำดับไม่เปลี่ยน LessonKey; source_position ใช้ชี้ validation error ไม่ persist ใน provenance

รายการ application ข้างต้นและข้อ 1–6 เป็นข้อเสนอให้ arch ตรึงและตรวจ implementation ไม่ใช่สัญญาที่แก้แล้ว ห้ามปลด gate persistence จากการมี migration เพียงอย่างเดียว Source manifest จริงยังรอ content owner; ไม่เดาว่า Sheet มี UUID แล้ว

## หลักฐาน

หลักฐานสัญญาและพจนานุกรมจากการตรวจ Rev1 และขอบเขตที่ตรวจซ้ำใน Rev2 ระบุใน [ผลเทียบเอกสารและสิ่งที่รอผู้รับผิดชอบ](migration-002-lesson-import-source-review.md) ซึ่งแยก mismatch และข้อพิจารณา PII สำหรับ jpo ไว้ครบ


