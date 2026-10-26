# LUX-06 — snapshot reconciliation และ projection — Rev1

วันที่2026-10-26 · archCodexT1 runGN9DS5 · technicalproposal/localcontract ไม่schemaapproval/runtimeproof. ใช้[sharedboundaryและstoplines](../planning/arch-091-learning-001.md)ร่วมกับสัญญานี้.

ต้องแยก **live progress** จาก **proposal snapshot**:

- live progress เลือก source ตาม run/revision/selection เดิม แล้วคืน breakdown พร้อม `computed_at`
- proposal GET อ่านหลักฐานที่ตรึงไว้เท่านั้น ไม่ดึงผลล่าสุดมาตกแต่งเป็นอดีต
- missing result สำหรับ Level เป็น contribution 0; ไม่ใช่สร้าง Assessment/Attempt คะแนน 0
- ผล project ที่พิสูจน์ run binding ไม่ได้ยังเป็น `SOURCE_SCOPE_UNPROVEN` ตามกฎเดิม; ห้ามจัดเป็น “งานขาด” เพื่อทำ proposal ต่อ

เสนอ reconcile `LevelSnapshot` เดิมกับ DES-011:30 โดยเพิ่มรายละเอียด JSON ที่ DES กำหนดให้ตรึงอยู่แล้ว:

```text
scoring_policy_revision:N
scoring_policy:ScoringPolicy
current_curriculum_id:K

roster[] เพิ่ม:
  sources:SourceResultRef[]
```

ใช้ `SourceResultRef` **เดิม** จาก `contract-003.md:47` ซึ่งมี `kind,id,update_date,activity_id,earned,max_score,weight_bps` ไม่สร้าง ref type คู่ขนาน ส่วน target curriculum ใช้ `SchoolBotLevelProposal.TargetCurriculumId` ที่ตรึงกับ proposal

`scoring_policy` ต้องเป็นสำเนา frozen policy ณ สร้าง snapshot ไม่ใช่ policy ล่าสุดตอน GET รายการกิจกรรมที่ไม่มี source หาได้จาก weights ในสำเนานี้ ไม่เติม source ref ปลอม

เพิ่ม read projection:

```text
GET /v2/level-proposals/{id}/snapshot
→ {
  proposal_id:K,
  course_run_id:K,
  target_curriculum_id:K,
  snapshot_hash:H,
  snapshot:LevelSnapshot
}
```

ใช้สิทธิ์เดียวกับ proposal GET; ไม่เปิดให้ Desktop และตรวจ hash ครบทั้ง snapshot กับ context ที่ตรึง หาก snapshot เก่าไม่มี source refs **ห้าม backfill ด้วยข้อมูลสด** อ่าน summary เดิมได้ แต่ detail/reconfirm ที่ต้องใช้หลักฐานนี้ต้องหยุดด้วย `409 PROPOSAL_STALE` และสร้าง proposal ใหม่ตาม workflow เดิม

สำหรับ breakdown เพิ่ม projection แยกต่อ `ProgressView` ของ run ที่ resolve ได้:

```text
aggregate:{
  policy_id:K,
  policy_revision:N,
  formula_version:T64,
  activities:[{
    activity_id:K,
    weight_bps:int0..10000,
    source:SourceResultRef|null,
    contribution:DecimalString|null
  }],
  total:DecimalString|null
}
```

live progress ที่ยังไม่มีผลครบใช้ null ตามความหมาย “ยังไม่มีผลรวมครบ”; การนับ missing เป็น 0 ใช้เฉพาะ Level calculation ไม่แอบนำไปใช้ export

คำนวณโดยใช้ helper เดิม ตรวจ K ที่ boundary และไม่ปัดรายส่วนก่อนรวม/เทียบ strict `>` การแสดง `DecimalString` จำกัดหกตำแหน่งเป็น representation; `eligible` ต้องมาจากค่าก่อนปัด ห้าม UI เปรียบเทียบค่าที่แสดงใหม่เอง

**พร้อม local:** calculator/projection จาก fixture ที่มี refs ครบ, stale detection, strict threshold และ tenant isolation  
**ยังไม่พร้อม:** เขียน snapshot แบบใหม่จน canonical JSON reconciled และตรวจ reader compatibility; สร้าง/confirm จาก roster จริงจน authority มีหลักฐาน

การเพิ่มคำอธิบาย JSON ที่ DES กำหนดไว้แล้วไม่ใช่เหตุให้เพิ่ม schema gate อัตโนมัติ แต่หากพบ reader เก่าที่ reject additional fields หรือจำเป็นต้อง rewrite stored snapshots ต้องหยุดที่ breaking/migration review ก่อน

## Change Log

- 2026-10-26 — นายช่างสกัดสัญญาย่อยจากarchGN9DS5; schema/sourceidentity/owner/H5 gatesคงอยู่ ไม่เพิ่มfieldphysicalbaselineหรือexecuteSQL.
