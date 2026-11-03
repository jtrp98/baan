# LUX-03 — bank draft read/edit และ visibility

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (ใบงาน 095 — storage หลักฐานและผลรับกฎ learning)

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
  approval:{actor:A,approved_at:D,approval_ref:T2048}|null
}
```

- read detail/full answers เฉพาะ `staff_admin` ที่มี `content_author` หรือ `content_approver`; mutation เฉพาะ author
- `school_web`/Desktop ห้ามเรียก admin bank detail แม้ถือ bank ID ถูกต้อง
- `bank_key`/`revision` immutable หลัง create; PUT ใช้ replace questions ทั้งชุดใน transaction เดียว ไม่แก้บางข้อแล้วปล่อยบางข้อไม่ผ่าน
- ตรวจ UUID ซ้ำ, kind, จำนวน options, เฉลยอยู่ใน options และมีหนึ่งคำตอบตาม DES-010 (กฎชนิดคำถามและเฉลย); unknown kind → `409 QUESTION_KIND_UNSUPPORTED`, รูปข้อมูลผิด → `400 INVALID_INPUT`
- lock bank revision, ตรวจ draft/ETag, เขียน questions/audit/idempotency พร้อมกัน
- publish ใช้ audit contributors แบบเดียวกับ curriculum: `QuestionBank.Created`, `.Updated`, `.Published`; เสนอเก็บ approval_ref ตรงตัวใน Reason ของ QuestionBank.Published ตาม [storage ร่วม](audit-evidence-storage-001.md) และ [delta/rollback](audit-evidence-migration-001.md) ต้องให้มนุษย์อนุมัติขยาย column ก่อน
- Attempt อ่านจาก snapshot ของตนเสมอ ไม่ lookup เฉลยจาก bank ล่าสุด

**พร้อม local:** list/detail/edit, validation, concurrency, visibility และ immutable revision  
**ยังไม่พร้อมเต็มเส้น:** publish/read-back หลักฐาน T2048 จนแก้ storage mismatch ผ่าน gate

## ชนิดข้อมูลที่ใช้

ชนิดย่ออ้าง [สัญญาชนิดข้อมูลกลาง](data-dictionary/contract-001.md): `K` คือรหัส int4 ช่วง 1–2147483647; `I` คือ signed int32; `N` คือ integer ≥1; `U` คือ UUID; `B` คือ boolean; `D` คือเวลา UTC; `H` คือ SHA-256 hex 64 ตัว; `Tn` คือ Unicode string ยาวไม่เกิน n; `A` คือตัวตนผู้ทำรายการตามช่องทาง; `?`/`null` คือค่าว่าง และ `[]` คือ array ส่วน `DecimalString` เป็นเลขฐานสิบไม่ติดลบใน JSON string ไม่เกินหกตำแหน่งทศนิยม

## หลักฐาน

- E01 — ที่มาของขอบเขตและเงื่อนไขร่วม: planning/arch-091-learning-001.md (memory) เอกสารนี้คงข้อเสนอเดิม ไม่ได้ตรวจ source หรือ runtime ใหม่

ตำแหน่งอ้างอิงเดิม: `design/des-010.md:26–35`
