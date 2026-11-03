# Traceability — fixture และผลบันทึกของ revision หลักสูตร

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (setup TP001-061 แบบรันตามได้)

เอกสารนี้เป็นส่วนรายละเอียดของ [TP001-061 (reorder/edit/publish/revision)](tp-001-cases-learning-2.md#tp001-061) ระดับ integration ระหว่าง service/adapter/file stub ครอบ AC-044-01 (ลำดับ Lesson), AC-044-02 (อ่านร่างใหม่), AC-044-03 (หลักฐานอนุมัติ), AC-044-04 (ฉบับและผลเก่ายังอ่านได้), AC-044-05 (แก้ผ่าน revision ใหม่) ผลจริงยัง NOT_RUN

<a id="tp001-061-detail"></a>
เงื่อนไขก่อนตรวจ: หนึ่ง process สอง CurriculumService/adapter instances แต่ละ adapter ใช้ FileSchoolBotBackingStore คนละ object ที่ resolve directory เดียวกัน; เริ่ม directory ว่าง ใช้ clock/cipher ทดสอบ staffAuthor/staffEditor เป็น staff_admin มี content_author, staffAuthor มี content_approver ด้วยเพื่อทดสอบ self-approval, staffApprover/staffSecondApprover มี content_approver ไม่เคยแก้ร่าง, staffWithoutRole มี staff session ไม่มี role, schoolAdmin เป็นบัญชีโรงเรียนอ่าน public ได้ ทุก revision กลาง SchoolId=NULL

staffAuthor create revision 1 ใส่สอง Lesson พร้อม stable keys และ missions/criteria สามโหมดที่อนุมัติแบบ synthetic ครบ staffAuthor สลับ ordinal/แก้ objective, staffEditor แก้ metadata ต่อ; ใช้ UUID ใหม่ทุก mutation เว้น case replay ที่แยกไว้ บันทึก baseline จำนวน revision/children/audit/ledger และ ETag ก่อนแต่ละขั้น สร้าง fixture ผู้เรียนและผลเก่าที่ชี้ revision 1 สำหรับเปรียบเทียบ snapshot เท่านั้น ไม่อ้างเป็นผลผู้เรียนจริง

จุดพักสำหรับการแข่งขัน (ใช้ fixture ใหม่แยกแต่ละรูปแบบ): พัก service แรกก่อนเข้า CommitWithIdempotencyAsync แล้วให้ service สอง commit ก่อนปล่อยคำขอแรก เพื่อพิสูจน์ reload snapshot สด; (ก) staffApprover/staffSecondApprover publish revision 1 ด้วยคนละ UUID และ ETag เดียวกัน (ข) staffApprover publish revision 1 แข่งกับ staffEditor create revision 2 (ค) staffApprover publish แข่งกับ staffAuthor content PUT ด้วย ETag เดียวกัน ทำทั้งสองลำดับผู้ชนะ ไม่ inject fail ใน case นี้ ทิ้งทั้งคู่แล้วสร้าง adapter/store ใหม่และอ่านดิสก์หลังทุกการแข่งขัน

ขั้นตอน: สลับลำดับ Lesson; แก้ draftแล้วอ่านใหม่; publish ไม่มี approval_ref/ผิดชนิด/ยาว 1001 ตัว และขอบเขต 1000 ตัว; staffAuthor (ผู้แก้ก่อน staffEditor) อนุมัติเอง; staffWithoutRole อนุมัติ; staffApprover อนุมัติ; create และ publish revision 2 โดยคง stable keys; พยายาม PUT metadata/content ของ published revision 1; If-Match ขาด/stale; รันการแข่งขันทั้งสามรูปแบบตาม setup

ผลที่คาด: ลำดับเปลี่ยน stable keys/ผลอ้างเดิมคงเดิม ไม่แก้โค้ด; draft อ่านได้ objective ใหม่; approval_ref ขาด/ผิดชนิด/1001 ตัวได้ 400 INVALID_INPUT, 1000 ตัวได้ 200 และ Reason อ่านกลับตรงตัว; staffAuthor แม้ไม่ใช่ผู้แก้ล่าสุดได้ FOUR_EYES_REQUIRED, staffWithoutRole ได้ STAFF_ROLE_REQUIRED; audit ผู้แก้ไม่ครบต้อง FOUR_EYES_REQUIRED ไม่เดาผู้อนุมัติ ผู้อนุมัติจาก session ไม่ใช่ body; staffApprover publish ได้ 200 มี actor/time/ref ตรง PublishedAt

อ่าน adapter ใหม่: การ create revision 2 เพิ่มหนึ่ง revision พร้อม Created audit/ledger อย่างละหนึ่ง; การแก้ draft/publish สำเร็จแต่ละครั้งไม่เพิ่มจำนวน revision แต่เพิ่ม audit ของ operation/ledger อย่างละหนึ่ง PUT published เดิมถูกปฏิเสธไม่เปลี่ยน children; ต้อง create revision ใหม่ก่อนแก้ ฉบับเดิมและ reference ผลเก่าไม่เปลี่ยน ขาด If-Match ได้ 428; stale ได้ 412 VERSION_CONFLICT จาก UpdateDate ทุก rejection ไม่เพิ่ม audit/ledger สำเร็จและไม่เปลี่ยน domain เทียบ baseline

การแข่งขัน (ก) มี publish success เดียว อีกคำขอได้ 412 VERSION_CONFLICT หรือ 409 STATE_CONFLICT ตาม state สด; เพิ่ม Published audit/ledger อย่างละหนึ่งเท่านั้น (ข) ทั้งสองคำขอสำเร็จ มี revision 1 published และ revision 2 draft; Created และ Published audit/ledger ที่เพิ่มอย่างละหนึ่งไม่สูญหาย (ค) ผู้ชนะสำเร็จ ผู้แพ้ได้ 412/409 ตาม state สด; content ของ published ห้ามถูกเขียนทีหลัง audit/ledger เพิ่มเฉพาะผู้ชนะ จำนวน revision เท่าเดิม ห้าม snapshot เก่าทับ audit/children/ledger ของอีก instance

ขอบเขตพิสูจน์: service/file stub สอง instances ใน process เดียว ไม่ใช่สอง OS hosts; snapshot/references เก่าพิสูจน์บน fixture เท่านั้น ผลผู้เรียน/CourseRun จริงและ G-LEARN ยังรอ, PostgreSQL และหลาย OS processes รอ DBA-003/G-CORE, Gateway/ตัวตนจริงรอ H5 การล้มระหว่าง commit อยู่ [TP001-087](tp-001-cases-learning-3.md#tp001-087)

## หลักฐาน

- [DES-005 Rev10 (หลักสูตรและผลประเมิน)](../design/des-005.md), [draft Rev3 (ผู้แก้ทุกคนและ four-eyes)](../design/learning-curriculum-draft-001.md), [idempotency Rev1](../design/idempotency-001.md), [stub/PostgreSQL Rev1](../design/data-contract-rules-cross-database.md)
- normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md finding 5 (reports): ใช้วางการแข่งขันสอง instances ไม่ได้รัน tests เพิ่ม