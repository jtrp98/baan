# LUX-02 — supplied-row import และ storage stopline — Rev1

วันที่2026-10-26 · archCodexT1 runGN9DS5 · technicalproposal/localcontract ไม่schemaapproval/runtimeproof. ใช้sharedboundaryและstoplines (memory: planning/arch-091-learning-001.md)ร่วมกับสัญญานี้.

ส่วนที่เริ่ม local ได้คือ **validator/preview ที่รับ supplied rows** ไม่มี Google Sheet fetch, SQL หรือการแปลง business mapping โดยเดา

```text
SuppliedImport = {
  source_ref:T2048,
  rows:[{
    source_row_key:U,
    source_position:N,
    source_approved:B|null,
    lesson:LessonInput
  }]
}
```

- `source_row_key` เป็น technical identity ที่ต้นทางหรือ manifest ที่ได้รับรองผูกกับแถวนั้นอย่างถาวร; `source_position` มีไว้ชี้ข้อผิดพลาดเท่านั้น
- สำหรับ fixture ใช้ `lesson.lesson_key = source_row_key` ได้โดยตรง ไม่ต้อง hash/สร้าง mapping ใหม่
- ห้ามอ้างว่า Sheet ปัจจุบันมี key นี้: `D/source-review-003.md:20–28` บันทึกปัญหา C/Unit/O และการเพิ่ม key ยังเป็นข้อเสนอ
- raw adapter ต้องตัด O ก่อน normalize/hash ทุกกรณี; D ไม่เป็น true ยังคงนำเข้าเป็น draft ตามมติเดิม
- P–X ต้องอยู่ใน Lesson เดียวกัน และใช้ `instruction-v1`/media refs เดิมตาม mapping ที่ content owner ให้มา ไม่แปลงใบงานเป็น quiz/test
- merged cells, ข้อความที่ไม่ใช่ URL, hyperlink ที่ไม่ได้ส่งมา และการจับคู่แถวข้าม revision ต้องมีผล validation ชัดเจน ไม่ forward-fill หรือแต่ง mapping โดยเงียบ

ผล local validation:

```text
{
  valid:B,
  rows:[{
    source_row_key:U,
    source_position:N,
    lesson_key:U,
    errors:[{field:T128,code:T64}]
  }]
}
```

ใช้ `INVALID_INPUT`/domain codes เดิม ไม่เพิ่ม code ธุรกิจใหม่ รายการถูกต้องแต่ไม่มีสื่อกับ supplied link ที่ invalid ต้องแยกกันผ่าน field/error ไม่อ้างว่าได้ตรวจ remote reachability

**หน่วย atomic ที่เสนอ:** supplied batch หนึ่งชุดลง curriculum draft revision เป้าหมายเดียว ถ้าแถวใดผิด ทุกแถวไม่เปลี่ยนข้อมูล; หากเกิน body limit ให้ปฏิเสธทั้งชุด ไม่แบ่ง HTTP หลายคำขอแล้วเรียกว่า atomic

**storage เดิมยังไม่พอ**

`SchoolBotLesson` มี key/ordinal/title/objective/instructions แต่ไม่มี source-row provenance/D; `SchoolBotIdempotency` กันเฉพาะ request key เดิม ไม่ตอบว่าต้นทางเดียวกันถูก import ด้วย key ใหม่แล้วหรือยัง

ข้อเสนอที่ต้องให้มนุษย์/vault ตรวจอย่างเปิดเผย:

```text
SchoolBotLesson.ImportSource
  physical proposal: jsonb NULL, default NULL

{
  source_ref:T2048,
  source_row_key:U,
  source_approved:B|null,
  row_hash:H
}
```

- NULL ทั้ง field = ไม่ใช่ lesson ที่มี import provenance ที่ยืนยันได้
- `source_approved=true` = D=TRUE ณ import; false/null ไม่ใช่ SchoolBot approval
- `row_hash` = hash ของ normalized supplied row รวม D และเนื้อหา/สื่อที่นำเข้า แต่ไม่รวม O หรือตำแหน่งแสดง
- ไม่เก็บลง `Title`, `Instructions`, `SourceRef` string แบบ envelope หรือ `Audit.Reason` เพื่อหลบ schema approval

**นี่เป็น new-column proposal จึงหยุดก่อนกำหนด persistence implementation/DDL/DBML baseline ใหม่**

เมื่อ proposal ได้รับอนุมัติแล้ว กฎ dedup ที่ควรใช้คือ scope `(CurriculumId,source_row_key)` ภายใต้ parent curriculum lock:

- key ใหม่แต่ row identity/hash เดิม → คืน resource เดิม ไม่สร้าง Lesson/Activity ซ้ำ
- row identity เดิมแต่ hash ต่าง → `409 STATE_CONFLICT`; ไม่เลือก overwrite/merge/skip แทนผู้ใช้
- revision เป้าหมายใหม่ → สร้าง row ID ใหม่แต่คง logical LessonKey
- key เดิม/request ต่าง → `409 IDEMPOTENCY_CONFLICT`
- batch มี conflict แม้หนึ่งแถว → rollback ทั้ง batch

**ยังไม่พร้อม import persistence:** ต้องได้ source identity manifest/mapping และคำตัดสิน storage ก่อน จึงค่อยตรึง commit/read-back endpoint; validator fake ไม่ต้องรอ DB query

## Change Log

- 2026-10-26 — นายช่างสกัดสัญญาย่อยจากarchGN9DS5; schema/sourceidentity/owner/H5 gatesคงอยู่ ไม่เพิ่มfieldphysicalbaselineหรือexecuteSQL.
