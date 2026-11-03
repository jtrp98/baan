# TP-001 — นำเข้าและ idempotency หลักสูตร (TP001-062, TP001-083–086)

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (เพิ่ม cases idempotency ตามสัญญา Rev1 สำหรับ BE-027)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-062"></a>

## TP001-062 — import

AC: [AC-045-01 (นำเข้าแถว D=TRUE แล้วเห็นเป็น draft…)](../../modules/quiz/shared/requirements/req-045.md), [AC-045-02 (เปลี่ยนเฉพาะ O ในข้อมูลทดสอบแล้วข้อมูลหลักสูตรที่นำเข้าไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-045.md), [AC-045-03 (แถวที่มีสื่อทั้งสองชุดแสดงสื่อครบภายใต้ Lesson เดิม โดยไม่เกิด…)](../../modules/quiz/shared/requirements/req-045.md), [AC-045-04 (นำเข้าแถวที่เลข C ไม่ตรง Unit ในชื่อแผนแล้วแสดงรหัส Lesson แยกจากทั้งสองค่า)](../../modules/quiz/shared/requirements/req-045.md) · References: [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), BR-045, source-review-003 · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: Course Plan Sheet sanitized: D=TRUE/FALSE, เปลี่ยนเฉพาะ O, มีสื่อ P–X, C ไม่ตรง Unit, สลับลำดับแถว, แถวว่าง/คอลัมน์ขาด

ขั้นตอน: import

ผลที่คาด: ทุกแถว draft; D=TRUE ติดป้ายอนุมัติจากต้นทาง ไม่ publish เอง; O เปลี่ยนไม่กระทบ; P–X เป็นสื่อชุดสองของ Lesson เดิม ไม่สร้าง Course/Level; รหัส Lesson แยกจาก C และ Unit คงเดิมเมื่อสลับ; แถวผิดรูปแบบรายงานรายแถว

หลักฐานที่ต้องเก็บ: E-API+sheet hash

ผลจริง: NOT_RUN



## Setup ร่วมของ TP001-083–086

ใช้ integration ระหว่าง service/adapter กับ stub ไม่เรียก Gateway หรือ DB จริง ทุกกรณีเริ่ม fixture ใหม่หนึ่ง process สอง CurriculumService และสอง adapters; รันทั้ง (1) MemorySchoolBotBackingStore object เดียวใช้ร่วมสอง adapters และ (2) FileSchoolBotBackingStore สอง objects ชี้ directory absolute เดียวกัน เริ่มว่าง สำหรับ file จบแล้วทิ้ง service/adapter/store ทั้งคู่ สร้างชุดที่สามอ่านดิสก์ curricula_snapshot.json; memory ใช้ adapter ใหม่บน store object เดิม พิสูจน์ restart ได้เฉพาะ file

actor A/E เป็น staff_admin มี content_author; B/D มี content_approver และไม่เคยสร้าง/แก้ revision ที่ตน publish; C มี staff session ไม่มี role; S เป็น school_web admin โรงเรียน 101 และ T เป็นครูโรงเรียน 102 ใช้เลข PrincipalId ของ S ให้ชน A ได้แต่ channel ต่าง Session/authority/clock/cipher เป็น test doubles; SchoolId ของ curriculum และ ledger ส่วนกลางต้อง NULL, Principal จาก session เป็น staff_admin:{PrincipalId} ไม่รับจาก body

ใช้ UUID K เดียวภายในแถวทดสอบ นอกนั้นใช้ UUID ใหม่และ ETag ล่าสุด; สร้าง Level และโครงสร้าง valid ตาม DES-005 ไว้ก่อน ค่าที่เลือกเป็น fixture ทดสอบ ไม่ใช่กฎธุรกิจ บันทึกจำนวน revision/children/audit/ledger และ hash snapshot หลัง setup เป็น baseline ไม่รวม events/ledger ของ setup ในจำนวนที่คาดด้านล่าง ทุกแถวทดสอบแยก fixture ไม่ต่อผลข้ามแถว

| Operation / actor | Fixture ก่อนเริ่ม / body สำเร็จ | ผล success / ส่วนเพิ่มจาก baseline |
|---|---|---|
| create_curriculum / A | ยังไม่มี curriculum; revision=1 และ curriculum_key ใหม่ | 201 body id/update_date + ETag; revision +1, Curriculum.Created +1, ledger +1 |
| update_curriculum_metadata / A | draft หนึ่ง revision; title ใหม่พร้อม metadata เต็มตาม draft contract | 200 id/update_date + ETag; revision +0, Curriculum.MetadataUpdated +1, ledger +1 |
| update_curriculum_content / A | draft หนึ่ง revision สอง Lesson มี missions/criteria block/arm/code ครบ; เปลี่ยน objective แต่คง keys | 200 id/update_date + ETag; revision +0, Curriculum.ContentUpdated +1, ledger +1; children เท่าชุด body ไม่มีเพิ่มซ้ำ |
| publish_curriculum / B | draft ที่ A เขียน มี approved criteria และ audit ผู้แก้ครบ; approval_ref ไม่ว่าง ≤1000 ตัว | 200 id/update_date/published_at + ETag; revision +0, Curriculum.Published +1, ledger +1; state=published |

ledger หมายถึง SchoolBotIdempotency: หนึ่งแถวต่อ (SchoolId,Principal,Operation,RequestKey); hash ตามสูตร Rev1 รวม nested body, ResultCipher/ResultKeyId ไม่เป็น NULL และไม่ใช่ plaintext, status/resource/ETag ที่ถอดด้วย fake cipher ตรง response; CompletedAt/ReplayUntil ใช้ clock ของ store ไม่ต่ออายุเพราะ retry ไม่มี nonce สำหรับ BE-027

<a id="tp001-083"></a>

## TP001-083 — key/body เดิมและ body ต่าง ทั้งต่อเนื่องและซ้อน

AC: AC-043-01 (ส่วนกลางสร้าง/แก้และโรงเรียนแก้ไม่ได้), AC-044-03 (publish มีหลักฐาน), AC-044-05 (แก้ผ่าน revision ใหม่) · References: DES-005 Rev10, idempotency Rev1, cross-database Rev1 · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: ใช้ setup ร่วมทั้ง memory/file และทำครบสี่ operations ตามตาราง actor เดิมภายในแต่ละแถว ทดสอบสี่รูปแบบต่อ operation: ต่อเนื่อง body เดิม, ซ้อน body เดิม, ต่อเนื่อง body ต่าง, ซ้อน body ต่าง สำหรับ body ต่างเปลี่ยนเฉพาะ create Revision 1→2, metadata title, content objective ใน Lesson ที่สอง, publish ApprovalRef ตามลำดับ

จุดพักแบบซ้อน: พักคำขอแรกหลังได้ store lock และอ่าน ledger ว่าง แต่ก่อน durable replace (memory ก่อน swap); เริ่มคำขอสองจาก service/adapter อีก instance ด้วย K เดิม ยืนยันถึง store call และยังรอ lock แล้วปล่อยแรกให้ commit ไม่ใช้ sleep เดา scheduling แบบต่อเนื่องไม่พัก; replay PUT/publish ส่ง If-Match เดิมที่ stale หลัง success เพื่อยืนยัน replay ก่อนตรวจ domain precondition

ผลที่คาด: body เดิมทั้งสองรูปแบบได้ status/body/resource ID/ETag เดิม (create 201, อื่น 200) ไม่ใช่ STATE_CONFLICT; body ต่างคำขอแรกสำเร็จ อีกคำขอได้ 409 IDEMPOTENCY_CONFLICT ไม่เปิดผลเดิม หลังเปิด adapter ใหม่ส่วนเพิ่ม revision/audit/ledger เท่าหนึ่ง success ในตารางเท่านั้น create มีหนึ่ง revision แม้คำขอสองใช้ Revision=2; update ไม่แทน children ซ้ำ; publish มี event เดียวและ Reason เป็น ref แรก; snapshot ของคำขอสองไม่ทับผลแรก

ขอบเขตพิสูจน์: stub สอง instances/หนึ่ง process ตาม setup; OS หลาย process และ transaction PostgreSQL รอ DBA-003/G-CORE ต้องรันสอง process/สอง connections ใช้ store จริงเดียวกันและ tuple lock รวมกรณียังไม่มีแถว ไม่ถือผล local เป็นหลักฐานนั้น

หลักฐานที่ต้องเก็บ: ลำดับ barrier/lock, response สองคำขอ, snapshot ก่อน/หลังและ read-back ใหม่ แยก memory/file/operation/รูปแบบ · ผลจริง: NOT_RUN

<a id="tp001-084"></a>

## TP001-084 — UUID เดียวแยก actor และ operation

AC: AC-043-01 (ขอบเขตผู้แก้ส่วนกลาง), AC-044-03 (ผู้อนุมัติที่ถูกต้อง), AC-044-05 (revision แยกกัน) · References/Level/Profiles: สัญญาและ integration เดียวกับ TP001-083

เงื่อนไขก่อนตรวจ: setup ร่วมทั้งสอง stores ไม่พักหรือ inject fail; แยก fixture (ก) actor ต่าง (ข) operation ต่าง คำขอต่อเนื่องและใช้ ETag สดสำหรับ mutation ใหม่

(ก) ทำสี่ operations: A/E create ด้วย K แต่ curriculum_key ต่างกัน; A/E metadata บน draft คนละ resource; A/E content บน draft คนละ resource; B/D publish บน draft คนละ resource ที่ A สร้าง ใช้ K เดียวและ body ถูกต้องภายใน operation คำขอสองต้องทำงานของตน ไม่ replay ของคนแรก เพิ่มกรณี create A/E ใช้ curriculum_key/revision เดียวกันเพื่อชน domain uniqueness

(ข) A คนเดียวมี author+approver: ใช้ K สร้าง curriculum ของตน → metadata → content ส่วน publish ใช้ K เดียวบนอีก draft ที่ E สร้าง/แก้และ A ไม่เคยแก้ เพื่อไม่ละเมิด four-eyes; replay แต่ละ operation ของ A อีกครั้งด้วย body เดิมและ If-Match เดิม

ผลที่คาด response+state: (ก) success ของ actor สองได้ resource ของตน status ตามตาราง ไม่เผย response ของอีก actor; เพิ่ม audit/ledger สองรายการ Principal ต่างกัน create เพิ่มสอง revisions, operations อื่นไม่เพิ่ม revision; กรณีชน domain ต้อง STATE_CONFLICT ไม่มี success/replay/ledger ของ actor สอง และคงหนึ่ง revision/Created event/ledger (ข) ทั้งสี่ success และ replay คืนผลของ operation นั้น; เพิ่ม revision หนึ่ง, audit สี่ events และ ledger สี่แถว Principal เดียว Operation ต่างครบสี่ชื่อ ไม่เพิ่มเพราะ replay Published audit บันทึก A บน draft ของ E เท่านั้น ตรวจด้วย adapter ใหม่ตาม setup ร่วม

ขอบเขตพิสูจน์: namespace/operation และ domain rules บน stub; auth จริงรอ H5, PostgreSQL/หลาย process รอ DBA-003/G-CORE ใช้สอง process ร่วม DB เดียว ตรวจ tuple จริงรวม SchoolId=NULL ไม่ใช่ dictionary ต่อ process

หลักฐานที่ต้องเก็บ: actor/channel ที่ server resolve, response/ledger แยก tuple, disk read-back · ผลจริง: NOT_RUN

<a id="tp001-085"></a>

## TP001-085 — โรงเรียนและผู้หมดสิทธิ์ขอ replay ผล staff

AC: AC-043-01 (โรงเรียนแก้เนื้อหากลางไม่ได้), AC-044-03 (ผู้อนุมัติมีสิทธิ์) · References/Level/Profiles: สัญญาและ integration เดียวกับ TP001-083

เงื่อนไขก่อนตรวจ: setup ร่วมทั้งสอง stores; ให้ actor ที่ถูกสิทธิ์ทำสี่ operations สำเร็จแยก fixture แล้ว C/S/T ส่ง K/body/If-Match เดียวกับ staff; อีก fixture ถอน role ของ staff เดิมหลัง success แล้ว retry และอีก fixture ทำ session หมดอายุ ไม่พักหรือ inject fail; อ่าน adapter ใหม่หลังทุก rejection

ผลที่คาด: C/S/T และ staff ถูกถอน role ได้ 403 ตามสิทธิ์ endpoint; session หมดอายุได้ 401 ไม่มี success body/ID/ETag ของคำขอเดิม ไม่เปิด cipher ก่อนตรวจสิทธิ์ Snapshot domain/revision/children/audit/ledger เท่า baseline หลัง success แรก ทุกแถวยังคง Principal เดิม SchoolId=NULL ไม่มี ledger success ของ C/S/T โรงเรียนยังอ่าน public published ได้ตามสิทธิ์ แต่ใช้ K ยกสิทธิ์ไม่ได้

ขอบเขตพิสูจน์: authority/session fake + store; Gateway/BFF/real session/License รอ H5; PostgreSQL/หลาย process รอ DBA-003/G-CORE ไม่เปิดประตูด้วยผล stub

หลักฐานที่ต้องเก็บ: response ปฏิเสธและ snapshot ก่อน/หลังโดยไม่เผย token/key · ผลจริง: NOT_RUN

<a id="tp001-086"></a>

## TP001-086 — atomic failure การยกเลิกผู้รอ และ expiry

AC: AC-043-01 (mutation ส่วนกลาง), AC-044-03 (publish/audit หลักฐาน), AC-044-05 (revision ไม่ถูกสร้างซ้ำ) · References/Level/Profiles: สัญญาและ integration เดียวกับ TP001-083

เงื่อนไขก่อนตรวจ: setup ร่วม ทำครบสี่ operations แยก fixture ต่อจุด inject; UUID/body เดิม; baseline หลัง setup ก่อน mutation อ่านผลจาก adapter ใหม่ตามชนิด store

| จุด inject / ขั้นตอน | ผลที่คาด response + persisted state |
|---|---|
| throw ระหว่าง encode result และก่อน file replace/memory swap หลัง mutate candidate | คำขอล้มเหลว ไม่คืน success; revision/children/audit/ledger เท่า baseline ทั้งสามส่วนไม่หลุดบางส่วน retry K เดิมโดยถอด fault สำเร็จหนึ่งครั้ง ส่วนเพิ่มตามตารางร่วม |
| commit replace/swap สำเร็จแล้วทำ response สูญหายก่อนถึงผู้เรียก; ทิ้ง service/adapter และเปิดใหม่ retry K เดิม | ผู้เรียกแรกไม่มี response; retry คืน success เดิม ID/ETag เดิม ส่วนเพิ่มเท่าหนึ่ง success มี ledger กู้ผลได้จาก store ไม่พึ่ง static dictionary |
| พักคำขอแรกใต้ lock ก่อน replace/swap; คำขอสองถึง store แล้วรอ ยกเลิก CancellationToken เฉพาะผู้รอ จากนั้นปล่อยแรก | ผู้รอถูกยกเลิก ไม่คืน success; แรกสำเร็จ ส่วนเพิ่มเท่าหนึ่ง success retry เดิมภายหลัง replay ไม่มีเพิ่ม ผู้รอไม่ยกเลิก/ลบ ledger ของแรก |
| หลัง success ล็อก store ด้วย fixture barrier; retry รออยู่ แล้วถอน role หรือเลื่อน clock ให้ session หมดอายุก่อนปล่อย lock | retry ได้ error สิทธิ์ 403/401 ตามกรณี ไม่เปิดผลเดิม ตรวจ clock/สิทธิ์สดเมื่อได้ lock; snapshot เท่าหลัง success แรก |
| หลัง success ใช้ clock ที่ ReplayUntil−1 tick, เท่ากับ ReplayUntil, และมากกว่า; แยก body เดิม/ต่าง | ก่อนหมดอายุ replay ได้; now≥ReplayUntil body เดิมได้ 409 IDEMPOTENCY_EXPIRED, body ต่างได้ 409 IDEMPOTENCY_CONFLICT; ไม่ mutate/เพิ่ม audit/ledger/ต่ออายุ คง tuple/hash/ResourceId และ tombstone แม้ยังไม่ purge |

ขอบเขตพิสูจน์: deterministic fault ของ stub ใน process เดียว; memory ไม่พิสูจน์ process restart; file replace fault ไม่พิสูจน์ power-loss/OS lock หลาย process PostgreSQL rollback/response loss/expiry และ tuple lock ข้ามสอง process/shared DB รอ DBA-003/G-CORE; custody/retention จริงยังไม่รับรอง ไม่ purge เอง

หลักฐานที่ต้องเก็บ: จุด inject/barrier/clock และ response พร้อม state ทั้งสามส่วนก่อน/หลัง · ผลจริง: NOT_RUN

## ช่องว่างและประตูที่ยังเปิด

AC ของ BE-027 ทั้งแปดข้อมี case แล้ว แต่ยังไม่มีผลรัน cases ใหม่ ส่วน PostgreSQL/หลาย OS processes, Gateway/BFF/gRPC, ผลผู้เรียน/CourseRun และเนื้อหาอนุมัติจริงต้องตรวจเมื่อประตูพร้อมตามแต่ละ case; ไม่ถือว่าได้รับการยอมรับความเสี่ยงหรือผ่าน release การกู้ cipher ที่เสีย/tombstone หลัง purge และ ciphertext custody จริงยังไม่มี case เฉพาะในชุดนี้ ส่งให้ check รับทราบโดยไม่เพิ่ม AC หรือขยาย scope เอง

## หลักฐาน

- [สัญญา idempotency Rev1](../design/idempotency-001.md), [stub และ PostgreSQL Rev1](../design/data-contract-rules-cross-database.md), [SchoolBotIdempotency (หนึ่งแถวต่อคำสั่ง)](../design/data-dictionary/table-004.md), [DES-005 Rev10](../design/des-005.md), [draft Rev3](../design/learning-curriculum-draft-001.md)
- [มติ 025 H6 (คนที่สองอนุมัติ)](../../shared/decisions/decisions-025.md) และ [มติ 054 (เลขอ้างอิงไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md)
- normal-096/ac-verbatim.txt หัวข้อ BE-027 และ normal-095/snapshot-rw1-027/check/round-095-be027-rw1-finding.md (reports): ใช้กำหนด scope และ regression คำขอ create ซ้อน ไม่ใช่หลักฐานรันใหม่
## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
