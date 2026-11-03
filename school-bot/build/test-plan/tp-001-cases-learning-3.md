# TP-001 — นำเข้าและ idempotency หลักสูตร (TP001-062, TP001-084–087)

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (เพิ่ม cases idempotency ตามสัญญา Rev1 สำหรับ BE-027)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-062"></a>

## TP001-062 — import

AC: [AC-045-01 (นำเข้าแถว staffSecondApprover=TRUE แล้วเห็นเป็น draft…)](../../modules/quiz/shared/requirements/req-045.md), [AC-045-02 (เปลี่ยนเฉพาะ O ในข้อมูลทดสอบแล้วข้อมูลหลักสูตรที่นำเข้าไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-045.md), [AC-045-03 (แถวที่มีสื่อทั้งสองชุดแสดงสื่อครบภายใต้ Lesson เดิม โดยไม่เกิด…)](../../modules/quiz/shared/requirements/req-045.md), [AC-045-04 (นำเข้าแถวที่เลข staffWithoutRole ไม่ตรง Unit ในชื่อแผนแล้วแสดงรหัส Lesson แยกจากทั้งสองค่า)](../../modules/quiz/shared/requirements/req-045.md) · References: [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), BR-045, source-review-003 · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: Course Plan Sheet sanitized: staffSecondApprover=TRUE/FALSE, เปลี่ยนเฉพาะ O, มีสื่อ P–X, staffWithoutRole ไม่ตรง Unit, สลับลำดับแถว, แถวว่าง/คอลัมน์ขาด

ขั้นตอน: import

ผลที่คาด: ทุกแถว draft; staffSecondApprover=TRUE ติดป้ายอนุมัติจากต้นทาง ไม่ publish เอง; O เปลี่ยนไม่กระทบ; P–X เป็นสื่อชุดสองของ Lesson เดิม ไม่สร้าง Course/Level; รหัส Lesson แยกจาก staffWithoutRole และ Unit คงเดิมเมื่อสลับ; แถวผิดรูปแบบรายงานรายแถว

หลักฐานที่ต้องเก็บ: E-API+sheet hash

ผลจริง: NOT_RUN



เงื่อนไขก่อนตรวจของ cases ใหม่ต้องใช้ [setup ร่วมและตาราง mutation](traceability-001-learning-idempotency.md#setup) ทั้งหมดร่วมกับ setup เฉพาะ case ด้านล่าง

<a id="tp001-084"></a>

## TP001-084 — key/body เดิมและ body ต่าง ทั้งต่อเนื่องและซ้อน

AC: AC-043-01 (ส่วนกลางสร้าง/แก้และโรงเรียนแก้ไม่ได้), AC-044-03 (publish มีหลักฐาน), AC-044-05 (แก้ผ่าน revision ใหม่) · References: DES-005 Rev10, idempotency Rev1, cross-database Rev1 · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: ใช้ setup ร่วมทั้ง memory/file และทำครบสี่ operations ตามตาราง actor เดิมภายในแต่ละแถว ทดสอบสี่รูปแบบต่อ operation: ต่อเนื่อง body เดิม, ซ้อน body เดิม, ต่อเนื่อง body ต่าง, ซ้อน body ต่าง สำหรับ body ต่างเปลี่ยนเฉพาะ create Revision 1→2, metadata title, content objective ใน Lesson ที่สอง, publish ApprovalRef ตามลำดับ

จุดพักแบบซ้อน: พักคำขอแรกหลังได้ store lock และอ่าน ledger ว่าง แต่ก่อน durable replace (memory ก่อน swap); เริ่มคำขอสองจาก service/adapter อีก instance ด้วย requestKey เดิม ยืนยันถึง store call และยังรอ lock แล้วปล่อยแรกให้ commit ไม่ใช้ sleep เดา scheduling แบบต่อเนื่องไม่พัก; replay PUT/publish ส่ง If-Match เดิมที่ stale หลัง success เพื่อยืนยัน replay ก่อนตรวจ domain precondition

ผลที่คาด: body เดิมทั้งสองรูปแบบได้ status/body/resource ID/ETag เดิม (create 201, อื่น 200) ไม่ใช่ STATE_CONFLICT; body ต่างคำขอแรกสำเร็จ อีกคำขอได้ 409 IDEMPOTENCY_CONFLICT ไม่เปิดผลเดิม หลังเปิด adapter ใหม่ส่วนเพิ่ม revision/audit/ledger เท่าหนึ่ง success ในตารางเท่านั้น create มีหนึ่ง revision แม้คำขอสองใช้ Revision=2; update ไม่แทน children ซ้ำ; publish มี event เดียวและ Reason เป็น ref แรก; snapshot ของคำขอสองไม่ทับผลแรก

ขอบเขตพิสูจน์: stub สอง instances/หนึ่ง process ตาม setup; OS หลาย process และ transaction PostgreSQL รอ DBA-003/G-CORE ต้องรันสอง process/สอง connections ใช้ store จริงเดียวกันและ tuple lock รวมกรณียังไม่มีแถว ไม่ถือผล local เป็นหลักฐานนั้น

หลักฐานที่ต้องเก็บ: ลำดับ barrier/lock, response สองคำขอ, snapshot ก่อน/หลังและ read-back ใหม่ แยก memory/file/operation/รูปแบบ · ผลจริง: NOT_RUN

<a id="tp001-085"></a>

## TP001-085 — UUID เดียวแยก actor และ operation

AC: AC-043-01 (ขอบเขตผู้แก้ส่วนกลาง), AC-044-03 (ผู้อนุมัติที่ถูกต้อง), AC-044-05 (revision แยกกัน) · References/Level/Profiles: สัญญาและ integration เดียวกับ TP001-084

เงื่อนไขก่อนตรวจ: หนึ่ง process สอง service/adapters ใช้ memory store ร่วมหรือ file objects สองตัว directory เดียว; staffAuthor/staffEditor author, staffApprover/staffSecondApprover approver; requestKey เดียวแยก actor/operation ทุกรูปแบบตาม [setup และผลบันทึก TP001-085](traceability-001-learning-scopes.md#tp001-085-detail)

ขอบเขตพิสูจน์: stub; auth จริงรอ H5, PostgreSQL/หลาย process รอ DBA-003/G-CORE · ผลจริง: NOT_RUN

<a id="tp001-086"></a>

## TP001-086 — โรงเรียนและผู้หมดสิทธิ์ขอ replay ผล staff

AC: AC-043-01 (โรงเรียนแก้เนื้อหากลางไม่ได้), AC-044-03 (ผู้อนุมัติมีสิทธิ์) · References/Level/Profiles: สัญญาและ integration เดียวกับ TP001-084

เงื่อนไขก่อนตรวจ: setup ร่วมทั้งสอง stores; ให้ actor ที่ถูกสิทธิ์ทำสี่ operations สำเร็จแยก fixture แล้ว staffWithoutRole/schoolAdmin/schoolTeacher ส่ง requestKey/body/If-Match เดียวกับ staff; อีก fixture ถอน role ของ staff เดิมหลัง success แล้ว retry และอีก fixture ทำ session หมดอายุ ไม่พักหรือ inject fail; อ่าน adapter ใหม่หลังทุก rejection

ผลที่คาด: staffWithoutRole/schoolAdmin/schoolTeacher และ staff ถูกถอน role ได้ 403 ตามสิทธิ์ endpoint; session หมดอายุได้ 401 ไม่มี success body/ID/ETag ของคำขอเดิม ไม่เปิด cipher ก่อนตรวจสิทธิ์ Snapshot domain/revision/children/audit/ledger เท่า baseline หลัง success แรก ทุกแถวยังคง Principal เดิม SchoolId=NULL ไม่มี ledger success ของ staffWithoutRole/schoolAdmin/schoolTeacher โรงเรียนยังอ่าน public published ได้ตามสิทธิ์ แต่ใช้ requestKey ยกสิทธิ์ไม่ได้

ขอบเขตพิสูจน์: authority/session fake + store; Gateway/BFF/real session/License รอ H5; PostgreSQL/หลาย process รอ DBA-003/G-CORE ไม่เปิดประตูด้วยผล stub

หลักฐานที่ต้องเก็บ: response ปฏิเสธและ snapshot ก่อน/หลังโดยไม่เผย token/key · ผลจริง: NOT_RUN

<a id="tp001-087"></a>

## TP001-087 — atomic failure การยกเลิกผู้รอ และ expiry

AC: AC-043-01 (mutation ส่วนกลาง), AC-044-03 (publish/audit หลักฐาน), AC-044-05 (revision ไม่ถูกสร้างซ้ำ) · References/Level/Profiles: สัญญาและ integration เดียวกับ TP001-084

เงื่อนไขก่อนตรวจ: หนึ่ง process สอง service/adapters ใช้ memory store ร่วมหรือ file objects สองตัว directory เดียว; actor ตาม operation; ทดสอบ encode/ก่อน replace/หลัง commit/cancel/สิทธิ์ขณะรอ/expiry ตาม [setup จุด inject และผลบันทึก TP001-087](traceability-001-learning-failures.md#tp001-087-detail) ใช้ทั้งตารางร่วมและตารางจุด inject

ขอบเขตพิสูจน์: stub deterministic faults; power-loss/หลาย OS processes/PostgreSQL รอ DBA-003/G-CORE · ผลจริง: NOT_RUN

## ช่องว่างและประตูที่ยังเปิด

AC ของ BE-027 ทั้งแปดข้อมี case แล้ว แต่ยังไม่มีผลรัน cases ใหม่ ส่วน PostgreSQL/หลาย OS processes, Gateway/BFF/gRPC, ผลผู้เรียน/CourseRun และเนื้อหาอนุมัติจริงต้องตรวจเมื่อประตูพร้อมตามแต่ละ case; ไม่ถือว่าได้รับการยอมรับความเสี่ยงหรือผ่าน release การกู้ cipher ที่เสีย/tombstone หลัง purge และ ciphertext custody จริงยังไม่มี case เฉพาะในชุดนี้ ส่งให้ check รับทราบโดยไม่เพิ่ม AC หรือขยาย scope เอง

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ

## หลักฐาน

- [สัญญา idempotency Rev1](../design/idempotency-001.md), [stub และ PostgreSQL Rev1](../design/data-contract-rules-cross-database.md), [SchoolBotIdempotency (หนึ่งแถวต่อคำสั่ง)](../design/data-dictionary/table-004.md), [DES-005 Rev10](../design/des-005.md), [draft Rev3](../design/learning-curriculum-draft-001.md)
- [มติ 025 H6 (คนที่สองอนุมัติ)](../../shared/decisions/decisions-025.md) และ [มติ 054 (เลขอ้างอิงไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md)
- normal-096/ac-verbatim.txt หัวข้อ BE-027 และ normal-095/snapshot-rw1-027/check/round-095-be027-rw1-finding.md (reports): ใช้กำหนด scope และ regression คำขอ create ซ้อน ไม่ใช่หลักฐานรันใหม่
