# Traceability — ขอบเขต actor/operation ของหลักสูตรกลาง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (รายละเอียด TP001-085 แบบรันตามได้)

เอกสารนี้เป็นส่วนของ [TP001-085](tp-001-cases-learning-3.md#tp001-085) ระดับ integration บน stub ครอบ AC-043-01 (ขอบเขตผู้แก้ส่วนกลาง), AC-044-03 (ผู้อนุมัติที่ถูกต้อง), AC-044-05 (revision แยกกัน) ต้องใช้ [setup ร่วมและตาราง mutation](traceability-001-learning-idempotency.md#setup) ผลจริงยัง NOT_RUN

<a id="tp001-085-detail"></a>

เงื่อนไขก่อนตรวจ: setup ร่วมทั้งสอง stores ไม่พักหรือ inject fail; แยก fixture (ก) actor ต่าง (ข) operation ต่าง คำขอต่อเนื่องและใช้ ETag สดสำหรับ mutation ใหม่

(ก) ทำสี่ operations: staffAuthor/staffEditor create ด้วย requestKey แต่ curriculum_key ต่างกัน; staffAuthor/staffEditor metadata บน draft คนละ resource; staffAuthor/staffEditor content บน draft คนละ resource; staffApprover/staffSecondApprover publish บน draft คนละ resource ที่ staffAuthor สร้าง ใช้ requestKey เดียวและ body ถูกต้องภายใน operation คำขอสองต้องทำงานของตน ไม่ replay ของคนแรก เพิ่มกรณี create staffAuthor/staffEditor ใช้ curriculum_key/revision เดียวกันเพื่อชน domain uniqueness

เพิ่มรูปแบบ actor ต่างแต่ body/target เดิมครบสี่ operations: หลัง success แรก ให้ staffEditor retry create/metadata/content และ staffSecondApprover retry publish ด้วย requestKey/body/resource เดิม ใช้ ETag สดกับ mutation ใหม่และเลื่อน fake clock หนึ่ง tick ก่อนคำขอสอง create ต้องชน domain uniqueness; metadata/content บน draft ยังทำ mutation ของ actor สองได้ (200 ไม่ใช่ replay) audit Actor ต้องเป็น staffEditor, ETag ใหม่ และ ledger Principal แยกสองแถว; revision เท่าเดิม/children ไม่เพิ่มซ้ำ publish บนฉบับที่ published แล้วต้อง STATE_CONFLICT ไม่ได้ success ของ staffApprover ไม่เพิ่ม Published audit/ledger จำนวนยังอย่างละหนึ่งจาก baseline
(ข) staffAuthor คนเดียวมี author+approver: ใช้ requestKey สร้าง curriculum ของตน → metadata → content ส่วน publish ใช้ requestKey เดียวบนอีก draft ที่ staffEditor สร้าง/แก้และ staffAuthor ไม่เคยแก้ เพื่อไม่ละเมิด four-eyes; replay แต่ละ operation ของ staffAuthor อีกครั้งด้วย body เดิมและ If-Match เดิม

ผลที่คาด response+state: (ก) success ของ actor สองได้ resource ของตน status ตามตาราง ไม่เผย response ของอีก actor; เพิ่ม audit/ledger สองรายการ Principal ต่างกัน create เพิ่มสอง revisions, operations อื่นไม่เพิ่ม revision; กรณีชน domain ต้อง STATE_CONFLICT ไม่มี success/replay/ledger ของ actor สอง และคงหนึ่ง revision/Created event/ledger (ข) ทั้งสี่ success และ replay คืนผลของ operation นั้น; เพิ่ม revision หนึ่ง, audit สี่ events และ ledger สี่แถว Principal เดียว Operation ต่างครบสี่ชื่อ ไม่เพิ่มเพราะ replay Published audit บันทึก staffAuthor บน draft ของ staffEditor เท่านั้น ตรวจด้วย adapter ใหม่ตาม setup ร่วม

ขอบเขตพิสูจน์: namespace/operation และ domain rules บน stub; auth จริงรอ H5, PostgreSQL/หลาย process รอ DBA-003/G-CORE ใช้สอง process ร่วม DB เดียว ตรวจ tuple จริงรวม SchoolId=NULL ไม่ใช่ dictionary ต่อ process

หลักฐานที่ต้องเก็บ: actor/channel ที่ server resolve, response/ledger แยก tuple, disk read-back · ผลจริง: NOT_RUN


## หลักฐาน

- [idempotency Rev1 (scope/lock/atomic commit)](../design/idempotency-001.md), [cross-database Rev1 (ขอบเขต stub/ประตูจริง)](../design/data-contract-rules-cross-database.md)
- normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md finding 3/4 (reports): ใช้วาง regression ไม่มีการรันใหม่
