# LUX-03 — bank draft read/edit และ visibility — Rev1

วันที่2026-10-26 · archCodexT1 runGN9DS5 · technicalproposal/localcontract ไม่schemaapproval/runtimeproof. ใช้[sharedboundaryและstoplines](../planning/arch-091-learning-001.md)ร่วมกับสัญญานี้.

เพิ่มต่อ DES-010:

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
- ตรวจ UUID ซ้ำ, kind, จำนวน options, เฉลยอยู่ใน options และมีหนึ่งคำตอบตาม DES-010:26–35; unknown kind → `409 QUESTION_KIND_UNSUPPORTED`, รูปข้อมูลผิด → `400 INVALID_INPUT`
- lock bank revision, ตรวจ draft/ETag, เขียน questions/audit/idempotency พร้อมกัน
- publish ใช้ audit contributors แบบเดียวกับ curriculum: `QuestionBank.Created`, `.Updated`, `.Published`; ติด approval length stopline เดียวกัน
- Attempt อ่านจาก snapshot ของตนเสมอ ไม่ lookup เฉลยจาก bank ล่าสุด

**พร้อม local:** list/detail/edit, validation, concurrency, visibility และ immutable revision  
**ยังไม่พร้อมเต็มเส้น:** publish/read-back หลักฐาน T2048 จนแก้ storage mismatch ผ่าน gate

## Change Log

- 2026-10-26 — นายช่างสกัดสัญญาย่อยจากarchGN9DS5; schema/sourceidentity/owner/H5 gatesคงอยู่ ไม่เพิ่มfieldphysicalbaselineหรือexecuteSQL.
