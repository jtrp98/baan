# LUX-01 — draft curriculum และหลักฐานอนุมัติ — Rev1

วันที่2026-10-26 · archCodexT1 runGN9DS5 · technicalproposal/localcontract ไม่schemaapproval/runtimeproof. ใช้[sharedboundaryและstoplines](../planning/arch-091-learning-001.md)ร่วมกับสัญญานี้.

เพิ่ม HTTP semantics ต่อ DES-005:

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
    approval_ref:T2048
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

**Stopline:** full publish contract ยังไม่พร้อม เพราะ `T2048 → varchar(1000)` เก็บไม่ครบ ส่วน draft list/detail/edit ทำ local ได้ทันที ห้าม truncate, แบ่ง approval เป็นหลาย audit events หรือจำกัดเหลือ 1,000 เงียบ ๆ

ทางเลือกที่เสนอให้ gate พิจารณา: ขยาย `SchoolBotAuditEvent.Reason` เป็น `varchar(2048)` โดยคง business bounds 1,000 ของ operation อื่นไว้ นี่เป็น **schema proposal เท่านั้น**; ให้ vault ตรวจผลกระทบก่อนทำ migration อีกทางคือแก้ `approval_ref` เป็น T1000 ซึ่งเป็น contract narrowing ต้อง review เช่นกัน

## Change Log

- 2026-10-26 — นายช่างสกัดสัญญาย่อยจากarchGN9DS5; schema/sourceidentity/owner/H5 gatesคงอยู่ ไม่เพิ่มfieldphysicalbaselineหรือexecuteSQL.
