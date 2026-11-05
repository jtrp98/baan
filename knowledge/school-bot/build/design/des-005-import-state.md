# DES-005 — Course Plan importer: persisted state, stub และประตูระบบจริง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 097 — ผลที่คาดของนำเข้า/นำเข้าซ้ำ และขอบเขต stub ของ BE-028)

ส่วนต่อของ [สัญญา Course Plan importer](des-005-import.md) ไฟล์นี้บอกว่าแต่ละกรณีต้องเหลือข้อมูลอะไรใน store, stub พิสูจน์อะไรได้ และอะไรรอ PostgreSQL จริง

## 1. ผลที่คาดราย case

ใช้ fixture ของ [setup TP001-062](../test-plan/tp-001-cases-quiz-grade-import.md): สามแถว (ตำแหน่ง 3,4,5; D = true/false/null) แต่ละแถว missions=[] และหนึ่ง Activity `instruction-v1` แถว 3 มี media_refs 5 ค่า

**S0** = store ที่ seed ตรงด้วย snapshot builder (แบบ [seeded fixture ของ DES-010](des-010-stub-persistence.md#3-ข้อมูลตั้งต้นของ-test-seeded-fixture)): Curriculum draft 1 revision (`PublishedAt=NULL`), Lesson/Activity/Mission/audit/ledger = 0, Level 1 รายการ (อยู่นอก snapshot) · **S1** = ผลหลัง case A

| Case | เริ่มจาก · คำขอ | HTTP / outcome | Lesson · Activity · audit · ledger หลังจบ |
|---|---|---|---|
| A นำเข้าครั้งแรก | S0 · base, key k1 | 200; created ×3 | 3 · 3 · 1 (`Curriculum.LessonsImported`) · 1 (`import_curriculum_lessons`) |
| B replay | S1 · base, k1 | 200; status/body/ETag เดิมทุก byte | 3 · 3 · 1 · 1 |
| C ไฟล์เดิม key ใหม่ | S1 · base, k2 | 200; unchanged ×3, lesson_id เดิม, ETag เดิม | 3 · 3 · 1 · 2 |
| D เปลี่ยนเฉพาะ O | S1 · variant o หลัง normalize (body เท่ากับ base) , k3 | 200; unchanged ×3 (ถ้าใช้ k1 = replay แบบ B) | 3 · 3 · 1 · 2 |
| E สลับลำดับ | S1 · variant reorder, k4 | 200; unchanged ×3; Ordinal ที่เก็บคง 1..3 | 3 · 3 · 1 · 2 |
| F สลับลำดับด้วย key เดิม | S1 · variant reorder, k1 | `409 IDEMPOTENCY_CONFLICT` | เท่า S1 |
| G แถวเดิมเปลี่ยน D/สื่อ/source_ref | S1 · base แต่แถว 4 D=true, k5 | `409 STATE_CONFLICT` details แถว 4; แถว 3/5 ไม่ถูกเขียน | เท่า S1 |
| H เพิ่มแถวใหม่ | S1 · base + แถว 6 (key ใหม่, ordinal 4), k6 | 200; unchanged ×3 + created ×1 | 4 · 4 · 2 · 2 |
| I key ชน Lesson ไม่มี provenance | S0 + content PUT ที่มี LessonKey ของแถว 3 · base, k7 | `409 STATE_CONFLICT` | Lesson 1 (ImportSource NULL) · 0 จาก import · audit/ledger ของ PUT เท่านั้น |
| J revision เผยแพร่แล้ว | S0 ที่ publish แล้ว · base | `409 STATE_CONFLICT` | ไม่เปลี่ยน |
| K invalid | S0 · variant invalid | `400 INVALID_INPUT` details แถวแรกที่ผิด | 0 · 0 · 0 · 0 |
| L preview ทุก variant | S0 หรือ S1 | ผล validator; ไม่เรียก commit | ไม่เปลี่ยน (zero writes) |
| M แข่งกัน key ต่าง | S0 · A=base k1 กับ B=base k2 พร้อมกันบนสอง adapter directory เดียว | 200 ทั้งคู่; ผู้ได้ lock ก่อน created ×3 อีกฝ่าย unchanged ×3 | 3 · 3 · 1 · 2 |
| N ตัด response หลัง commit | หลัง A commit · เปิด adapter ใหม่ retry k1 | 200 replay ผลของ A | เท่า S1 |
| O content PUT หลังนำเข้า | S1 · PUT สาม Lesson เดิมด้วย ETag ล่าสุด | 200 | ImportSource ทั้งสามคงค่าเดิม (row ID ใหม่ตามพฤติกรรม PUT เดิม) · audit 2 · ledger 2 |
| P revision ใหม่ | S1 + create revision 2 · base เข้า revision 2 | 200; created ×3 | revision 2 มี 3 Lesson ใหม่ LessonKey เดียวกับ revision 1; revision 1 ไม่เปลี่ยน |

อ่านกลับหลัง A ผ่าน `GET /v2/admin/curricula/{id}`: `lifecycle=draft`, `published_at=null`, `approval=null`; `import_source.source_approved` ของแถว 3/4/5 = true/false/null; `source_ref="fixture:course-plan-096"`; `source_row_key` = LessonKey ของแต่ละแถวและไม่เท่าเลข C หรือ Unit; Activity แถว 3 มี media_refs 5 ค่าใน Lesson เดียว ไม่มี Level/Curriculum เพิ่ม · Public GET ของ revision เดียวกัน (หลัง publish) ไม่มี key `import_source`

## 2. stub รับประกันอะไร และอะไรรอ PostgreSQL จริง

Lesson อยู่ใน `curricula_snapshot.json` หน่วยเดียวกับ audit และ ledger อยู่แล้ว importer จึงใช้ `CommitWithIdempotencyAsync` เดิมโดยไม่แก้ helper เหมือนที่ DES-010 ตัดสินสำหรับคลังข้อสอบ

| stub รับประกัน (หนึ่ง process) | รอ PostgreSQL จริง |
|---|---|
| Lesson + Activity + audit + ledger + ผลเข้ารหัส ลงพร้อมกันหรือไม่ลงเลย | ผู้ใช้รัน migration-002 Rev2 บนฐานที่เจ้าของยืนยัน (ประตูแยก ยังไม่รัน) |
| ค้น LessonKey และเขียนใต้ store lock เดียว จึงไม่มี import ซ้ำระหว่าง adapter ใน process เดียวกัน | `SELECT … FOR UPDATE` ของแถว Curriculum ก่อนอ่าน Lesson และ transaction ข้าม connection/host (DBA-003 / G-CORE) |
| replay หลังเปิด adapter/store ใหม่บน directory เดิม | lock ข้าม OS process บนไฟล์เดียวกัน — ไม่รองรับ |
| รูป ImportSource และ `source_row_key = LessonKey` ตรวจด้วย codec เดียว | ชนิด jsonb จริง, identity `GENERATED ALWAYS`, เวลา `clock_timestamp()` และ durability |
| content PUT คง ImportSource ตาม LessonKey | manifest/เนื้อหาจริง (G-LEARN) และตัวตน/transport จริง (H5) |

ทั้งหมดไม่ใช่หลักฐาน schema หรือ runtime acceptance และไม่ปิด DBA-003/G-CORE เมื่อทำ PostgreSQL ทุก writer ของ Lesson ใน curriculum เดียวกัน (import, content PUT, publish, การลบ) ต้องล็อกแถว Curriculum แม่ก่อนอ่าน/เขียนตามลำดับเดียวกัน query ค้นอ้างจาก [ข้อเสนอของ vault](../db/migration-002-lesson-import-source-contract.md) SQL จริงเป็นงานของ vault

## 3. ความเสี่ยงที่เปิดอยู่เพราะไม่มี constraint ฝั่ง DB

ผู้ใช้เลือกเพิ่มเฉพาะคอลัมน์ ฐานจึงตรวจเพียงว่าเป็น jsonb ที่ถูกต้อง ความเสี่ยงต่อไปนี้ยังเปิดและไม่มีใครรับความเสี่ยงแทนผู้ใช้:

1. ผู้เขียนตรงฐานหรือ writer ที่ข้าม codec/lock เขียน JSON ผิดรูป, LessonKey ซ้ำ หรือ `source_row_key` ไม่ตรงได้ — reader admin จะตอบ 500 กับแถวผิดรูป แต่ไม่มีงานตรวจหาแถวซ้ำย้อนหลัง
2. หลาย instance ที่ไม่ได้ใช้ lock ร่วม (file store ข้าม process หรือ writer PostgreSQL ที่ไม่ `FOR UPDATE` แม่) นำเข้าซ้ำได้ idempotency ของคำขอไม่ช่วยเพราะ key ต่างกัน
3. ไม่มี index บน `CurriculumId`/`LessonKey` (ร่าง SQL มีเฉพาะ PK) การค้นก่อนเขียนอาจสแกนทั้งตารางขณะถือ lock แม่ ต้องวัดจาก query จริง การเพิ่ม index ต้องมีมติใหม่
4. `row_hash` ผูกกับรูป `RowHashPayload` และ serializer ถ้าเปลี่ยน แถวที่เคยนำเข้าจะ conflict ทั้งหมดเมื่อนำเข้าซ้ำ — เปลี่ยนได้เฉพาะผ่าน arch + ผู้ใช้
5. content PUT ที่ตัด Lesson ออกทำให้ provenance ของ Lesson นั้นหายไปพร้อมแถว (มี audit แต่ไม่มีสำเนา ImportSource)

## 4. สิ่งที่ inspect ต้องเติมใน TP001-062 / TP001-093 (ป้าย `ระดับ: normal`)

- **TP001-062 → AC-045-01/03/04:** case A แล้วอ่านกลับผ่าน admin GET ตามย่อหน้าท้ายข้อ 1 (D true/false/null แยกกัน, ไม่ publish, สื่อ 5 ค่าใน Lesson เดียว, Level คง 1, LessonKey ≠ C/Unit)
- **TP001-062 → AC-045-02:** case D — ยืนยันว่า normalized request ของ variant o เท่ากับ base ทุก byte และ commit ด้วย key ใหม่ได้ unchanged ×3, counts ตามตาราง
- **TP001-062 → AC-045-04:** case E และ case P (LessonKey เดิมข้าม revision)
- **TP001-093 (ทางหลัก):** case B และ C จาก S1 บน file store เปิด adapter ใหม่ directory เดิม
- ติดป้าย `ระดับ: full` (ไม่ใช่เหตุ FAIL ในรอบ normal): F, G, H, I, J, K, M, N, O, แถว ImportSource ผิดรูป → 500 และทุกอย่างที่ต้องใช้ PostgreSQL
- แก้ข้อความ "ยังตรึงไม่ได้/รอ arch" ในสองไฟล์ TP ให้ชี้สัญญานี้ (Rev2 ของ des-005-import) และ idempotency-001 Rev4

## หลักฐาน

- fixture/ลำดับแถว: [setup TP001-062](../test-plan/tp-001-cases-quiz-grade-import.md) และ [cases TP001-062/093](../test-plan/tp-001-cases-quiz-grade-import-cases.md)
- source ที่ใช้ตัดสินขอบเขต stub: [ผลเทียบกับโค้ดจริง Rev2](des-005-import-evidence.md)
- ความเสี่ยงฝั่งฐาน: [migration-002 Rev2](../db/migration-002-lesson-import-source.md) และ [physical delta](../db/migration-002-lesson-import-source-contract.md)
