# TP-001 — concurrency และ negative ของคลังข้อสอบ BE-030

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — shared-store race, replay และ atomic failure)

ใช้ [setup actors/stores/fixture](tp-001-cases-quiz-grade-bank.md#เงื่อนไขก่อนตรวจร่วม) ทั้งหมดร่วมกับแต่ละ case; AC-046-01 หมายถึงอ่าน policy สี่ด้าน และ AC-046-04 หมายถึง revision ใหม่ไม่เปลี่ยน snapshot/ผลเดิม ระดับ integration ของ service/adapter ใช้ทั้ง memory และ file แยกผล ทุกผลจริง NOT_RUN

## TP001-094 — สองผู้แก้ใช้ ETag เดียว

AC: AC-046-04 · References: DES-010 Rev7, bank draft Rev3, HTTP contract (ETag), idempotency Rev1

หนึ่ง process สอง bank service/adapter objects ใช้ store ร่วม actor staffAuthor/staffEditor ต่างคน seed v2 draft เพิ่มจาก fixture bank v1/history โดย audit/ledger ของ seed=0 ทั้งสองอ่าน v2 ได้ ETag เดียว ใช้คนละ Idempotency-Key; A PUT questions v2, B PUT questions v2 แต่เปลี่ยน prompt ข้อ 201 เป็น `คำขอสอง` พัก A หลังได้ store lock และตรวจ ETag ก่อน swap/replace ให้ B ถึง store call และรอ จากนั้นปล่อย A

response A=200 พร้อม ETag ใหม่; B=412 VERSION_CONFLICT พร้อม current_etag ของ A ไม่ใช่ last-writer-wins เปิด adapter ใหม่/disk: bank=2 revisions (v1 published/v2 draft), questions v2 ตรง A ทั้งชุด ไม่ปน B, QuestionBank.Updated=1, ledger=1; curriculum=1/Lesson=2/Activity=2/Attempt=2 และ Attempt ทั้งสองเท่า baseline

ทำ fixture ใหม่ให้ B ไม่มี If-Match →428 PRECONDITION_REQUIRED; stale →412 VERSION_CONFLICT ทั้งคู่ audit/ledger/domain เพิ่ม 0 จาก baseline ทำกรณี A publish โดย staffApprover ก่อน B PUT ที่ถือ ETag เก่า: B ต้องปฏิเสธ ไม่ย้อนแก้ published; ทดสอบ published PUT อีกครั้งด้วย ETag สด →409 STATE_CONFLICT ทุกครั้ง v1/Attempt เดิมไม่เปลี่ยน ใช้ variant นี้แยก fixtureจาก race แรก ไม่รวม counts ปะปนกัน

## TP001-095 — replay ของ bank และ atomic failure

AC: AC-046-04 (revision และประวัติไม่เปลี่ยน) · References: DES-010 API Rev6, bank draft Rev3, idempotency Rev1

หนึ่ง process สอง service/adapter objects store ร่วม actor เดียวกันต่อ operation เตรียมแต่ละแถวในตารางใหม่ทั้งหมด seed audit/ledger=0 ไม่มี operation ของเคสอื่นปะปน; ใช้ TimeProvider คงที่และ test cipher เลื่อน clock เฉพาะเวลาสร้าง ETag

| Operation | actor / state ก่อนตรวจ | success response / ส่วนเพิ่ม state ต่อหนึ่ง success |
|---|---|---|
| POST bank v2 | staffAuthor; มี v1 published และ Attempt เดิม | 201 id/ETag; bank +1 draft, Created audit +1, ledger +1 |
| PUT v2 | staffAuthor; seed v1 published/v2 draft | 200 id/ETag; bank +0 questions แทนทั้งชุด, Updated audit +1, ledger +1 |
| publish v2 | staffApprover ไม่เคยแก้; seed v2 draft และ contributors staffAuthor | 200 id/published_at/ETag; bank +0 v2 published, Published audit +1, ledger +1 Reason ตรง approval_ref |

ทำทุก operation ครบรูปแบบต่อไปนี้ แต่ละรูปแบบ reset fixture พัก A หลัง lock/อ่าน ledger ก่อน replace ให้ B ถึง store call และรอ; ทั้งสอง actor เดียว key เดียว body เดียว (publish ใช้ If-Match เดิม) แล้วปล่อย A → ทั้งคู่ได้ status/body/id/ETag เดิม ไม่เพิ่ม state เกินหนึ่ง success ในตาราง จากนั้น retry ต่อเนื่องหลังเปิด adapter ใหม่ต้องได้ผลเดิม แม้ If-Match stale ไม่คืน 412 ก่อน replay

ทำรูปแบบ body ต่างด้วย key เดิม: create เปลี่ยน title, PUT เปลี่ยนเฉลยใน options ที่ valid, publish เปลี่ยน approval_ref → A success, B=409 IDEMPOTENCY_CONFLICT ไม่เปิด body เดิม state เพิ่มเฉพาะ A; SchoolId=null Principal จาก server Operation แยกตาม endpoint ไม่ใช้ชื่อ operation ของ curriculum แทน ชื่อ/สูตร hash ภายในต้องคงที่สำหรับ request เดิมและรวมเนื้อหาที่เปลี่ยน ไม่รับจาก client

inject ก่อน durable replace (memory ก่อน swap) หลัง mutate/encode ทั้ง create/PUT/publish → service fault ไม่คืน 2xx; error ที่ส่งถึง HTTP boundary ใช้ 500 INTERNAL_ERROR ตาม envelope, domain/audit/ledger เพิ่ม 0 ไม่มีผลบางส่วน เปิด adapter ใหม่แล้ว retry เดิม success เพิ่มตามตารางหนึ่งครั้ง inject ตัด response หลัง durable commit → client ไม่ได้รับ response; restart adapter แล้ว retry เดิมได้ success เดิม state เพิ่มหนึ่งครั้งเท่านั้น ไม่ทำ operation ซ้ำ

ทุก variant curriculum/Lesson/Activity/Attempt counts คง baseline และ Attempt snapshot/result/ETag เดิมทั้งสองไม่เปลี่ยน ตรวจ disk snapshot และ read-back ใหม่พร้อมกัน memory พิสูจน์ได้แค่ adapter ใหม่บน store object เดิม ไม่ใช่ process crash/power loss

## TP001-096 — ปฏิเสธร่างผิดรูปและสิทธิ์ไม่ครบ

AC: AC-046-01/04 · References: bank draft Rev3, DES-010 API Rev6, DES-012 Rev9, มติ 054 · ระดับ unit สำหรับ validator และ integration สำหรับสิทธิ์/atomicity

หนึ่ง process หนึ่ง service/adapter file store directory ใหม่ต่อ variant actor staffAuthor seed v1 published/v2 draft และ Attempt สองแถวเดิม ไม่มีจุดพัก/inject baseline audit/ledger=0

| คำขอ | response ที่คาด | state หลัง adapter ใหม่/ดิสก์ |
|---|---|---|
| PUT questions: ข้อแรกแก้ได้แต่ข้อสอง correct key ไม่อยู่ options; duplicate question UUID; options ว่าง; score=0; malformed/empty body | 400 INVALID_INPUT ตาม field; unknown kind แยกเป็น 409 QUESTION_KIND_UNSUPPORTED | ไม่มี partial replace, bank=2/Lesson=2/Attempt=2, audit=ledger=0; bank/Attempt เดิมครบ |
| staffAuthor publish v2 ที่ตนสร้าง ใช้ ref 1,000 ตัว | 409 FOUR_EYES_REQUIRED | v2 draft เหมือนเดิม audit=ledger=0 |
| staffApprover publish v2 ใช้ approval_ref 1,001 ตัว หรือผิดชนิด | 400 INVALID_INPUT | v2 draft ไม่ตัด ref/ไม่เก็บ hash แทน audit=ledger=0 |
| staffWithoutRole mutation หรืออ่าน admin detail | 403 STAFF_ROLE_REQUIRED | ไม่มี success body/เฉลย domain/audit/ledger ไม่เปลี่ยน |
| schoolTeacher/schoolAdmin/student/employee desktop อ่าน admin detail หรือ mutate | 403 CHANNEL_NOT_ALLOWED | ไม่เปิดเฉลย ไม่ใช้ ID ชนเพื่อเปิดสิทธิ์ counts ไม่เปลี่ยน |

อีก fixture ให้ staffAuthor create v2 success ก่อน ถอน role แล้ว retry tuple/body เดิม →403 STAFF_ROLE_REQUIRED; session หมดอายุ →401 SESSION_EXPIRED ตรวจสิทธิ์ก่อนเปิด replay ผลครั้งแรกคงเดิม เพิ่ม bank/audit/ledger จาก baselineเพียง 1 ไม่สร้าง ledger ของ rejection ไม่ให้ school actor ขโมยผล staff แม้ใช้ key เดียวกัน การตีความ HTTP error ตรวจที่ boundary fake ตาม contract ไม่ถือว่าผ่าน Gateway จริง

## ขอบเขตหลักฐานและช่องว่าง

เคสเหล่านี้ต้องเห็น barrier B รอ lock จริงและ snapshot หลัง adapter ใหม่ ไม่ยอมรับสอง tasks บน service cache เดียวแทนสอง adapters การอ่าน operation/hash บน ledger ต้องสัมพันธ์กับ endpoint ไม่เผย ResultCipher หรือ key

PostgreSQL ต้องตรวจซ้ำสอง OS processes/สอง connections store จริงเดียวกัน รวม lock เมื่อ tuple ยังไม่มีแถวและ rollback domain+audit+ledger รอ DBA-003/G-CORE; schema ไม่มี UQ/FK/CHECK จึงไม่อ้าง constraint ที่ไม่มี เนื้อหาจริงรอ G-LEARN, authority/transport จริงรอ H5 ไม่ยอมรับความเสี่ยงเพื่อปิดประตูเหล่านี้ การแข่งสร้าง bank identity/revision ด้วย key ต่างและ retention/cipher custody จริงยังไม่มี case เฉพาะในชุดนี้ ให้ check พิจารณาเพิ่มภายใน AC ไม่เพิ่ม release scope เอง

## หลักฐาน

- [DES-010 Rev7](../design/des-010.md), [API Rev6](../design/des-010-api.md), [bank draft Rev3](../design/learning-bank-draft-001.md), [HTTP/ETag/errors](../design/data-contract-rules-http.md)
- [idempotency Rev1](../design/idempotency-001.md), [stub/PostgreSQL Rev1](../design/data-contract-rules-cross-database.md), [DES-012 Rev9](../design/des-012.md), [มติ 054 (ref)](../../shared/decisions/decisions-054.md)
