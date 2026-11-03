# DES-005 — คำตัดสิน Course Plan importer ก่อนทำ persistence

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 096 — ตัดสิน BE-028 ก่อนเปิดงาน)

BE-028 (นำเข้า Course Plan Sheet) ยังใช้ schema เดิมไม่ได้ครบ AC-045-01 (อ่าน draft พร้อมที่มาและความหมาย D ว่าอนุมัติจากต้นทาง) จึงหยุด commit/read-back ที่ human gate โดยคง AC เดิมทั้งหมด ส่วน transformation/preview บน stub ทำต่อได้

## 1. Storage ที่ใช้ได้และส่วนที่ขาด

`SchoolBotCurriculum.SourceRef` เป็น `varchar(2048) NOT NULL` เก็บ source_ref ระดับ revision; `Lifecycle=draft` และ `PublishedAt=null` แสดงว่ายังไม่เผยแพร่ `SchoolBotLesson.LessonKey` เป็น UUID ถาวร ใช้ supplied source_row_key ตาม manifest ได้ แต่ไม่เก็บ D หรือ source_ref รายแถว และไม่ใช่หลักฐานอนุมัติ

ไม่มี field ตามสัญญา Rev8 สำหรับ provenance/D ราย Lesson ให้ writer และ reader ใช้ร่วมกัน ตารางนี้ประเมินทางเลือก ไม่ใช่ schema ใหม่

| ทางเลือก | คำตัดสินและเหตุผล |
|---|---|
| SourceRef ของ revision + LessonKey | ใช้ได้เฉพาะที่มาระดับ revision/identity; ขาด D รายแถว |
| ซ่อน metadata ใน Text หรือ SourceRef envelope | ไม่ใช้: เปลี่ยนความหมายข้อความ/เลขอ้างอิงและ reader เดิม |
| เพิ่ม property ใน Activity.Config หรือใช้ Indicators/Subjects | ไม่ใช้โดยพลการ: JSON มีสัญญาธุรกิจเดิม ไม่ใช่ metadata อิสระ |
| Criteria.ApprovedBy/ApprovedAt หรือ publication approval | ไม่ใช้: การอนุมัติเกณฑ์/เผยแพร่ของ SchoolBot คนละความหมายกับ D |
| Audit.Reason หรือ idempotency result เป็นข้อมูลหลัก | ไม่ใช้: ไม่มี read model/dedup รายแถว; Reason จำกัด 1,000 ตัวอักษร |
| ข้อเสนอ ImportSource ใน supplied-row contract | ต้องผ่านผู้ใช้และ vault ก่อน ยังไม่เป็น baseline |

## 2. Operation และการอ่านกลับ

Operation เดิมคือ `create_curriculum` สำหรับสร้าง draft เปล่า และ `update_curriculum_content` สำหรับแทนเนื้อหาทั้งชุด metadata ใช้ `update_curriculum_metadata` ทั้งหมดอยู่ใต้ [idempotency ส่วนกลาง](idempotency-001.md) ไม่ตั้งชื่อ import Operation เพิ่มในงานนี้

สอง mutation แรกไม่ใช่ atomic import หนึ่งครั้ง และ content DTO ไม่รับ provenance/D จึงยังไม่เลือกเป็น import commit ส่วน `GET /v2/admin/curricula/{id}` อ่าน `CurriculumDraftView` เดิมได้เพียง metadata/children ไม่มี D รายแถว ต้องตัดสิน storage ก่อนตรึง import input, hash, success response และ read-back โดยไม่ลดทอน AC

## 3. Persisted state และการนำเข้าซ้ำ

นับแถวที่เก็บอยู่จริง ไม่ใช่ค่า sequence ที่ใช้ไป เริ่มตาม fixture: Level=1; revision/Lesson/Activity/audit/ledger=0

| กรณี | ผลที่ตรึงได้ตอนนี้ |
|---|---|
| preview base, เปลี่ยนเฉพาะ O, reorder, invalid หรือ preview ซ้อน | revision/Lesson/Activity/audit/ledger คง 0; Level คง 1 |
| import commit ครั้งแรก/ไฟล์เดิม key ใหม่/เปลี่ยน D หรือสื่อ/batch conflict | ยังไม่ตรึง success state เพราะขาด storage/commit contract ห้ามใช้ผล content PUT แทน |
| replay ของ mutation เดิม | tuple/hash เดิมคืน status/body/ID/ETag เดิม เพิ่ม domain/audit/ledger 0 ตามสัญญากลาง; hash ต่างเป็น `409 IDEMPOTENCY_CONFLICT` |

สัญญากลางให้ผู้ซ้อนรอ store lock และอ่าน replay หลังผู้แรก commit แต่ไม่ได้ dedup ตาม source row เมื่อใช้ request key ใหม่ โค้ดปัจจุบันยังใช้ dictionary ใน process และไม่มี durable ledger ใน curriculum snapshot จึงยังไม่รับรอง replay ข้าม adapter/restart

## 4. Stub และสิ่งที่ inspect ต้องเติม

- TP001-062 (ตรวจนำเข้า): แยก raw/normalized/transformer; transformer จริงคืน D เป็น boolean โดย `null → false` และไม่มี source_ref ต่างจาก supplied input ตรวจ O ไม่ส่งต่อ, LessonKey คงเดิมเมื่อ reorder และสื่อสองชุดอยู่ Lesson เดียวได้
- fixture คาด 5 refs เพราะรวม hyperlink J แต่ transformer แยก LessonPlan และ AllMedia มีเฉพาะ slide/exercise; validator จริงตรวจ key/position ยังไม่ตรวจ URL ต้องตรวจชั้น normalization ตามสัญญาเดิม ไม่ลด expected ให้ตรงข้อจำกัดโค้ด
- TP001-093 (นำเข้าซ้ำ/แข่งกัน): คง commit รอ storage; หลังผู้ใช้ตัดสินจึงเติม endpoint/Operation/hash และ counts ครั้งแรก/ซ้ำ/เปลี่ยนเฉพาะ O/key ใหม่/conflict ทั้ง batch/retry หลังตัด response ห้ามเดาจำนวน success
- stub ที่พัฒนาตามสัญญาพิสูจน์ fixture normalization/zero writes ได้; file-store race ใช้หนึ่ง process สอง adapter และ directory ร่วม ไม่อ้าง PostgreSQL/สอง OS processes จาก static semaphore
- เนื้อหา/identity manifest จริงรอ G-LEARN; PostgreSQL/transaction ข้าม connections รอ DBA-003/G-CORE; ตัวตนและ transport จริงยังรอ H5 ตามประตูเดิม

## คำตัดสินที่ต้องขอผู้ใช้

Task: BE-028 · Reference: DES-005 / AC-045-01 · Reason: ไม่มี field ตามสัญญาเดิมเก็บ provenance/D ราย Lesson การเปลี่ยน schema ต้องผ่านผู้ใช้และ vault

อนุมัติให้ส่งข้อเสนอ `SchoolBotLesson.ImportSource` จาก supplied-row contract ให้ vault ทบทวน schema/migration หรือไม่? หยุดก่อนเปลี่ยน dictionary/DBML/SQL หรือกำหนด persistence implementation หลังอนุมัติยังต้องคืน arch ตรึงสัญญาและให้ผู้ใช้รัน SQL ตามขั้นตอนเดิม

## หลักฐาน

- [ผลเทียบ schema/โค้ดจริง](des-005-import-evidence.md) ตรวจ 2026-11-03 พร้อม file/line ไม่มีการรันฐานจริง
- [supplied-row contract](learning-sheet-import-001.md) มีข้อเสนอ ImportSource และข้อห้ามใช้ Text/SourceRef envelope/Audit.Reason หลบ schema gate อยู่แล้ว งานนี้คง stopline นั้น
- inspect run iuY0az: normal-096/inspect-C-quiz.out (reports); [setup](../test-plan/tp-001-cases-quiz-grade-import.md) และ [TP001-062/093](../test-plan/tp-001-cases-quiz-grade-import-cases.md)
