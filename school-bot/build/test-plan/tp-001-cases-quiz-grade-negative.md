# TP-001 — ข้อมูลผิดและสิทธิ์คลังข้อสอบ BE-030

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — negative และ replay หลังหมดสิทธิ์)

ใช้ [setup actors/stores/fixture](tp-001-cases-quiz-grade-bank.md) ทุกส่วน ทุกผลจริง NOT_RUN

<a id="tp001-096"></a>

## TP001-096 — ปฏิเสธร่างผิดรูปและสิทธิ์ไม่ครบ

AC: AC-046-01/04 · References: bank draft Rev3, DES-010 API Rev6, DES-012 Rev9, มติ 054 · ระดับ unit สำหรับ validator และ integration สำหรับสิทธิ์/atomicity

หนึ่ง process หนึ่ง service/adapter file store directory ใหม่ต่อ variant actor staffAuthor seed v1 published/v2 draft และ Attempt สองแถวเดิม ไม่มีจุดพัก/inject baseline audit=3/ledger=0

| คำขอ | response ที่คาด | state หลัง adapter ใหม่/ดิสก์ |
|---|---|---|
| PUT questions: ข้อแรกแก้ได้แต่ข้อสอง correct key ไม่อยู่ options; duplicate question UUID; options ว่าง; score=0; malformed/empty body | 400 INVALID_INPUT ตาม field; unknown kind แยกเป็น 409 QUESTION_KIND_UNSUPPORTED | ไม่มี partial replace, bank=2/Lesson=2/Attempt=2, audit=3/ledger=0; bank/Attempt เดิมครบ |
| staffAuthor publish v2 ที่ตนสร้าง ใช้ ref 1,000 ตัว | 409 FOUR_EYES_REQUIRED | v2 draft เหมือนเดิม audit=ledger=0 |
| staffApprover publish v2 ใช้ approval_ref 1,001 ตัว หรือผิดชนิด | 400 INVALID_INPUT | v2 draft ไม่ตัด ref/ไม่เก็บ hash แทน audit=ledger=0 |
| staffWithoutRole mutation หรืออ่าน admin detail | 403 STAFF_ROLE_REQUIRED | ไม่มี success body/เฉลย domain/audit/ledger ไม่เปลี่ยน |
| schoolTeacher/schoolAdmin/student/employee desktop อ่าน admin detail หรือ mutate | 403 CHANNEL_NOT_ALLOWED | ไม่เปิดเฉลย ไม่ใช้ ID ชนเพื่อเปิดสิทธิ์ counts ไม่เปลี่ยน |

อีก fixture เริ่มเฉพาะ v1 published (audit=2/ledger=0) ให้ staffAuthor create v2 success ก่อน ถอน role แล้ว retry tuple/body เดิม →403 STAFF_ROLE_REQUIRED; session หมดอายุ →401 SESSION_EXPIRED ตรวจสิทธิ์ก่อนเปิด replay ผลครั้งแรกคงเดิม เพิ่ม bank/audit/ledger จาก baseline เพียง 1 (bank=2/audit=3/ledger=1) ไม่สร้าง ledger ของ rejection ไม่ให้ school actor ขโมยผล staff แม้ใช้ key เดียวกัน การตีความ HTTP error ตรวจที่ boundary fake ตาม contract ไม่ถือว่าผ่าน Gateway จริง

## ขอบเขตหลักฐานและช่องว่าง

เคสเหล่านี้ต้องเห็น barrier B รอ lock จริงและ snapshot หลัง adapter ใหม่ ไม่ยอมรับสอง tasks บน service cache เดียวแทนสอง adapters การอ่าน operation/hash บน ledger ต้องสัมพันธ์กับ endpoint ไม่เผย ResultCipher หรือ key

PostgreSQL ต้องตรวจซ้ำสอง OS processes/สอง connections store จริงเดียวกัน รวม lock เมื่อ tuple ยังไม่มีแถวและ rollback domain+audit+ledger รอ DBA-003/G-CORE; schema ไม่มี UQ/FK/CHECK จึงไม่อ้าง constraint ที่ไม่มี เนื้อหาจริงรอ G-LEARN, authority/transport จริงรอ H5 ไม่ยอมรับความเสี่ยงเพื่อปิดประตูเหล่านี้ การแข่งสร้าง bank identity/revision ด้วย key ต่างและ retention/cipher custody จริงยังไม่มี case เฉพาะในชุดนี้ ให้ check พิจารณาเพิ่มภายใน AC ไม่เพิ่ม release scope เอง

## หลักฐาน

- [DES-010 Rev7](../design/des-010.md), [API Rev6](../design/des-010-api.md), [bank draft Rev3](../design/learning-bank-draft-001.md), [HTTP/ETag/errors](../design/data-contract-rules-http.md)
- [idempotency Rev1](../design/idempotency-001.md), [stub/PostgreSQL Rev1](../design/data-contract-rules-cross-database.md), [DES-012 Rev9](../design/des-012.md), [มติ 054 (ref)](../../shared/decisions/decisions-054.md)
