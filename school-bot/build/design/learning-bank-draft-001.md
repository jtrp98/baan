# LUX-03 — bank draft read/edit และ visibility

> Rev 3 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — approval_ref/evidence_ref ไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)

เอกสารนี้เป็นสัญญาทางเทคนิคสำหรับพัฒนาและทดสอบ local โดยใช้ขอบเขตและเงื่อนไขหยุดร่วมเดิม ยังไม่ใช่การอนุมัติ schema หรือหลักฐาน runtime ของระบบจริง

เพิ่มต่อ [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md):

| Route | Contract |
|---|---|
| `GET /v2/admin/question-banks` | `lifecycle?`, `bank_key:U?`, pagination → summaries ไม่มี `questions` |
| `GET /v2/admin/question-banks/{id}` | → `QuestionBankDraftView` + ETag |
| `PUT /v2/admin/question-banks/{id}` | `{title:Text,questions:Question[],source_ref:T2048}` + If-Match → `{id,update_date}` + ETag |

```text
QuestionBankDraftView = {
  id:K, bank_key:U, revision:N,
  title:Text, questions:Question[],
  source_ref:T2048, lifecycle:ContentState,
  published_at:D|null, update_date:D,
  approval:{actor:A,approved_at:D,approval_ref:T1000}|null
}
```

- read detail/full answers เฉพาะ `staff_admin` ที่มี `content_author` หรือ `content_approver`; mutation เฉพาะ author
- `school_web`/Desktop ห้ามเรียก admin bank detail แม้ถือ bank ID ถูกต้อง
- `bank_key`/`revision` immutable หลัง create; PUT ใช้ replace questions ทั้งชุดใน transaction เดียว ไม่แก้บางข้อแล้วปล่อยบางข้อไม่ผ่าน
- ตรวจ UUID ซ้ำ, kind, จำนวน options, เฉลยอยู่ใน options และมีหนึ่งคำตอบตาม DES-010 (กฎชนิดคำถามและเฉลย); unknown kind → `409 QUESTION_KIND_UNSUPPORTED`, รูปข้อมูลผิด → `400 INVALID_INPUT`
- lock bank revision, ตรวจ draft/ETag, เขียน questions/audit/idempotency พร้อมกัน
- publish ใช้ audit contributors แบบเดียวกับ curriculum: `QuestionBank.Created`, `.Updated`, `.Published`; เก็บ `approval_ref:T1000` ตรงตัวใน Reason ของ QuestionBank.Published ตาม [storage ร่วม](audit-evidence-storage-001.md) และ [มติ 054 (จำกัดเลขอ้างอิงไม่เกิน 1,000 ตัวอักษรโดยไม่ขยาย schema)](../../shared/decisions/decisions-054.md) ผิดชนิดหรือเกิน 1,000 ตัวอักษร → `400 INVALID_INPUT` ก่อนเปลี่ยนข้อมูล ห้ามตัดข้อความหรือเก็บ hash แทน
- Attempt อ่านจาก snapshot ของตนเสมอ ไม่ lookup เฉลยจาก bank ล่าสุด

ขอบเขต local ครอบคลุม list/detail/edit, validation, concurrency, visibility และ immutable revision ตามสัญญานี้
publish/read-back ใช้ T1000 กับ Reason เดิมโดย [ไม่มี migration](audit-evidence-migration-001.md); การรับรอง implementation/ฐานจริงดูสถานะที่ [สารบัญ Learning](index-learning.md)

## ชนิดข้อมูลที่ใช้

ชนิดย่ออ้าง [สัญญาชนิดข้อมูลกลาง](data-dictionary/contract-001.md): `K` คือรหัส int4 ช่วง 1–2147483647; `I` คือ signed int32; `N` คือ integer ≥1; `U` คือ UUID; `B` คือ boolean; `D` คือเวลา UTC; `H` คือ SHA-256 hex 64 ตัว; `Tn` คือ Unicode string ยาวไม่เกิน n; `A` คือตัวตนผู้ทำรายการตามช่องทาง; `?`/`null` คือค่าว่าง และ `[]` คือ array ส่วน `DecimalString` เป็นเลขฐานสิบไม่ติดลบใน JSON string ไม่เกินหกตำแหน่งทศนิยม

## หลักฐาน

- E01 — ที่มาของขอบเขตและเงื่อนไขร่วม: planning/arch-091-learning-001.md (memory) ข้อเท็จจริงเดิมคงตามหลักฐานนี้; การตรวจ source ของ storage วันที่ 2026-11-03 อยู่ใน [สัญญา storage ร่วม](audit-evidence-storage-001.md) ไม่ได้ตรวจ runtime

ตำแหน่งอ้างอิงเดิม: `design/des-010.md:26–35`

- `knowledge/school-bot/shared/decisions/decisions-054.md`: มติผู้ใช้วันที่ 2026-11-03 กำหนด approval_ref ไม่เกิน 1,000 ตัวอักษรโดยไม่ขยาย schema
