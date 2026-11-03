# LUX-01 — draft curriculum และหลักฐานอนุมัติ

> Rev 3 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 054 — approval_ref/evidence_ref ไม่เกิน 1,000 ตัวอักษรและไม่ขยาย schema)

เอกสารนี้เป็นสัญญาทางเทคนิคสำหรับพัฒนาและทดสอบ local โดยใช้ขอบเขตและเงื่อนไขหยุดร่วมเดิม ยังไม่ใช่การอนุมัติ schema หรือหลักฐาน runtime ของระบบจริง

เพิ่ม HTTP semantics ต่อ [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](des-005.md):

| Route | Input / output | สิทธิ์ |
|---|---|---|
| `GET /v2/admin/curricula` | `lifecycle:ContentState?`, `level_id:K?`, pagination → summaries | `staff_admin` + `content_author` หรือ `content_approver` |
| `GET /v2/admin/curricula/{id}` | → `CurriculumDraftView` + ETag | สิทธิ์อ่านเดียวกัน |
| `PUT /v2/admin/curricula/{id}` | metadata เต็มชุดด้านล่าง + If-Match → `{id,update_date}` + ETag | `content_author`, เฉพาะ draft |

```text
CurriculumMetadataInput = {
  level_id:K,
  title:Text,
  source_ref:T2048,
  recommended_grades:T16[],
  subjects:CurriculumSubject[]
}

CurriculumSummary = {
  id:K, curriculum_key:U, revision:N, level_id:K,
  title:Text, lifecycle:ContentState,
  source_ref:T2048, published_at:D|null, update_date:D
}

CurriculumDraftView = {
  ...CurriculumSummary,
  recommended_grades:T16[],
  subjects:CurriculumSubject[],
  lessons:LessonInput[],
  approval:{
    actor:A,
    approved_at:D,
    approval_ref:T1000
  }|null
}
```

`curriculum_key`/`revision` เปลี่ยนไม่ได้ผ่าน metadata PUT; เปลี่ยนฉบับใช้ create เดิม ชื่อและโครงสร้าง `LessonInput`/children ใช้ DES-005 เดิม ไม่เพิ่ม clone endpoint

การบันทึก metadata/content ต้องล็อก curriculum เดียวกัน ตรวจ global scope, lifecycle และ ETag ก่อนเขียน หาก publish แข่งกับแก้ร่าง ต้องมีผู้ชนะเพียง transaction เดียว อีกคำขอรับ `412 VERSION_CONFLICT` หรือ `409 STATE_CONFLICT` ตาม state ที่พบ ห้ามแก้ child ของ published revision

**Four-eyes ต้องตรวจผู้แก้ทุกคนใน revision** ไม่ใช่ดู `UpdateBy` คนล่าสุดอย่างเดียว เพราะผู้แก้ A อาจให้ B แก้ต่อแล้ว A กลับมา publish ได้ ใช้ audit เดิมแบบ append-only:

- `Curriculum.Created`, `Curriculum.MetadataUpdated`, `Curriculum.ContentUpdated` อ้าง curriculum ID
- `Curriculum.Published` เก็บ authenticated `Actor`, server `CreateDate` และ `Reason=approval_ref` ตรงตัว
- ผู้ publish ต้องไม่อยู่ในชุดผู้สร้าง/ผู้แก้จาก audit พร้อมตรวจ CreateBy/UpdateBy ประกอบ
- audit ไม่ครบหรือพิสูจน์ผู้แก้ไม่ได้ → `409 FOUR_EYES_REQUIRED`; ไม่เดาว่าผู้ที่ไม่ปรากฏชื่ออนุมัติได้

Read-back `approval` อ่านเฉพาะ publication event ของ resource นี้ และตรวจเวลาให้ตรง `PublishedAt`; ไม่มีหลักฐานให้คืน `null` ไม่สร้างผู้อนุมัติจากผู้แก้ล่าสุด

Publish รับ `approval_ref:T1000` ตาม [มติ 054 (จำกัดเลขอ้างอิงไม่เกิน 1,000 ตัวอักษรโดยไม่ขยาย schema)](../../shared/decisions/decisions-054.md) ผิดชนิดหรือเกิน 1,000 ตัวอักษร → `400 INVALID_INPUT` ก่อนเปลี่ยนข้อมูล เก็บและอ่านกลับตรงตัว ห้าม truncate, เก็บเฉพาะ hash หรือแบ่ง approval เป็นหลาย audit events

ใช้ Reason `varchar(1000)` เดิมร่วมกับ bank/release ตาม [mapping/reader/error](audit-evidence-storage-001.md) และ [ผลทบทวนว่าไม่มี migration](audit-evidence-migration-001.md) ไม่เปลี่ยนตาราง ฟิลด์ หรือ API bounds อื่น การรับรอง implementation/ฐานจริงดูสถานะที่ [สารบัญ Learning](index-learning.md)

## ชนิดข้อมูลที่ใช้

ชนิดย่ออ้าง [สัญญาชนิดข้อมูลกลาง](data-dictionary/contract-001.md): `K` คือรหัส int4 ช่วง 1–2147483647; `I` คือ signed int32; `N` คือ integer ≥1; `U` คือ UUID; `B` คือ boolean; `D` คือเวลา UTC; `H` คือ SHA-256 hex 64 ตัว; `Tn` คือ Unicode string ยาวไม่เกิน n; `A` คือตัวตนผู้ทำรายการตามช่องทาง; `?`/`null` คือค่าว่าง และ `[]` คือ array ส่วน `DecimalString` เป็นเลขฐานสิบไม่ติดลบใน JSON string ไม่เกินหกตำแหน่งทศนิยม

## หลักฐาน

- E01 — ที่มาของขอบเขตและเงื่อนไขร่วม: planning/arch-091-learning-001.md (memory) ข้อเท็จจริงเดิมคงตามหลักฐานนี้; การตรวจ source ของ storage วันที่ 2026-11-03 อยู่ใน [สัญญา storage ร่วม](audit-evidence-storage-001.md) ไม่ได้ตรวจ runtime

- `knowledge/school-bot/shared/decisions/decisions-054.md`: มติผู้ใช้วันที่ 2026-11-03 กำหนด approval_ref ไม่เกิน 1,000 ตัวอักษรโดยไม่ขยาย schema
