# DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง — การคำนวณ, Snapshot และการป้องกัน LearnerId ชนกัน

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง](des-011.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `N` = integer ≥1; `B` = boolean; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## การคำนวณ, Snapshot และการป้องกัน LearnerId ชนกัน

- **การป้องกัน `LearnerId` ครูชนกับนักเรียน (`sEmp == sId`)**: สมาชิกที่นำมาคำนวณ `total` และ `average` ต้องมาจาก roster นักเรียน (`TUser.sID`) ของห้องเรียนใน School DB เท่านั้น และเมื่อดึงผลจาก `SchoolBotSubmission` ต้องกรองเฉพาะแถวที่อ้าง `SchoolBotProject` ที่ `OwnerKind = 'student'` เท่านั้น 
- `total` รายคน = คะแนนรวมหลักสูตร 0–100 ตาม `ScoringPolicy` revision และ `formula_version` ([DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md)) โดยกิจกรรมที่ไม่มีผลใช้ 0; ผล expired ที่ตรวจเสร็จตาม [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../requirement/decisions-042.md) เข้า selection และสูตรเดิม ไม่ถือว่าขาดผลเพราะไม่กดส่ง คง roster, strict threshold, snapshot/recheck และการยืนยันทั้งห้องเดิม
- `average = Σ total / member_count`; `eligible = average > threshold`; `gap` (เมื่อไม่ผ่าน) = `threshold − average`
- proposal เก็บ roster และผลของทุกคนเป็น immutable snapshot รวม source result refs (`id` + `update_date`), scoring policy revision, `formula_version`, promotion policy revision/threshold, current/target curriculum, average, gap, effective context และ hash

## API

| Endpoint | session / สิทธิ์ |
|---|---|
| GET /v2/admin/levels/{id}/promotion-policy | staff_admin, level_policy_admin |
| POST /v2/admin/levels/{id}/promotion-policies | staff_admin, level_policy_admin |
| POST /v2/course-runs/{id}/level-proposals | school_web, ครูรายวิชาของ CourseRun |
| GET /v2/level-proposals/{id} | school_web, ครูรายวิชา หรือ school_admin |
| POST /v2/level-proposals/{id}/confirm | school_web, ครูรายวิชา |
| POST /v2/level-proposals/{id}/decline | school_web, ครูรายวิชา |

GET /v2/admin/levels/{id}/promotion-policy
200 {id:K,level_id:K,revision:N,threshold:DecimalString,level_update_date:D} (+ ETag ของ Level)

POST /v2/admin/levels/{id}/promotion-policies
{threshold:DecimalString,reason:T1000} + If-Match (`ETag` ของ `SchoolBotLevel` ตาม [decisions-030](../requirement/decisions-030.md))
201 {id:K,revision:N,level_update_date:D} (+ ETag ของ Level)

POST /v2/course-runs/{id}/level-proposals
{} → 201 ProposalView (+ ETag จาก `UpdateDate`)
ใช้ได้เมื่อ `CourseRun.Lifecycle = closing|closed`; ไม่งั้น `409 TERM_NOT_ENDED`

GET /v2/level-proposals/{id} → 200 ProposalView (+ ETag)

ProposalView={
id:K,update_date:D,course_run_id:K,target_curriculum_id:K,
eligible:B,average:DecimalString|null,threshold:DecimalString,
gap:DecimalString|null,
member_count:integer>=0,complete_count:integer>=0,
snapshot_hash:H,effective_at:D,reason_codes:T64[],
state:proposed|promoted|retained|max_level|stale,
successor_run_id:K|null
}

state ตอนสร้าง:
- eligible และมี Level ถัดไป → `proposed` (รอครูยืนยัน)
- eligible แต่เป็น Level สูงสุด → `max_level` (เรียน Level เดิม)
- ไม่ eligible → `retained` ทันทีตามมติ (ไม่ต้องรอครู) และสร้าง successor Level เดิม

POST /v2/level-proposals/{id}/confirm
{snapshot_hash:H} + If-Match (`ETag`)
201 {proposal_id:K,successor_run_id:K,update_date:D,state:"promoted"} (+ ETag)

POST /v2/level-proposals/{id}/decline
{snapshot_hash:H,reason:T1000} + If-Match (`ETag`)
200 {id:K,update_date:D,state:"retained",successor_run_id:K} (+ ETag)

