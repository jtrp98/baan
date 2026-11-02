# DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright — HTTP

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright](des-009.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `I` = signed int32 ของระบบเดิม; `B` = boolean; `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## HTTP

ใช้ SchoolBot session channel `school_web` ([DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md))
ผู้ preview/confirm/resolve = ครูรายวิชาของทุก plan_course ในชุดที่เลือก ตรวจจาก School DB ตาม DES-012 ณ create, re-check ณ confirm และ re-check ณ worker apply ([AC-052-02 (สิทธิ์/ล็อกเปลี่ยนหลัง preview แล้วการยืนยันเดิมเขียนคะแนนไม่ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md)) พร้อมตรวจ `SchoolBotLicense` active ใน SchoolBot DB
school_admin ไม่ preview/confirm ได้ แต่อ่าน GET score-exports ของโรงเรียนได้ ทุก mutation ใช้ Idempotency-Key/X-Request-Id

POST /v2/score-previews
{course_run_id:K,mapping_ids:K[],learner_ids:I[]}
201 PreviewView (+ ETag จาก `UpdateDate`) — ไม่มี PGGradeDB write

PreviewView={
id:K,update_date:D,snapshot_hash:H,expires_at:D,
counts:{ready:integer>=0,conflict:integer>=0,blocked:integer>=0},
items_url:T512,
export_gates:{parity:B,coexistence:B,target:B,authz:B,db:B}
}

GET /v2/score-previews/{id} → 200 PreviewView (+ ETag)
GET /v2/score-previews/{id}/items (query: limit,cursor) → 200 {items:[PreviewItemView],next_cursor}

PreviewItemView={
id:K,learner_id:I,state:ready|conflict|blocked,
reason_codes:T64[],cells:CellPreview[]
}

CellPreview={
mapping_id:K,grade_slot_id:K,assessment_id:I,
score_identifier:T128,category:Category,
old_score:T128|null,last_exported_score:T128|null,
raw_target:DecimalString,new_score:integer>=0,
target_max:DecimalString,source_hash:H,
special_result:T128|null,has_grade_edit:B
}

POST /v2/score-previews/{id}/confirm
{snapshot_hash:H} + If-Match (`ETag`)
202 {export_id:K,state:"queued",update_date:D}
gate ใดยังไม่ผ่าน → 503 ตามรหัส gate ไม่สร้าง export
ถ้าพบ target เปลี่ยนระหว่าง preview กับ confirm: 409 TARGET_CHANGED, details.resource_id = preview_id

POST /v2/score-previews/{id}/resolve
{decisions:[{preview_item_id:K,action:"keep_destination"|"replace_owned",reason:T1000}]} + If-Match (`ETag`)
201 PreviewView ของใบใหม่ (+ ETag)
resolve ใช้ได้กับรายการ conflict ที่ server ตรวจพบแล้วเท่านั้น สร้าง `ScorePreview` แถวใหม่ (`SupersedesId` ชี้ใบเดิม) ครูต้อง confirm preview ใหม่อีกครั้ง; `replace_owned` ไม่ override lock/สิทธิ์/ผลพิเศษ/PgtgradeEdit

GET /v2/score-exports/{id}
200 {id:K,update_date:D,state:queued|running|paused_conflict|reconciling|completed|completed_with_skips|failed,counts:{applied:integer>=0,skipped:integer>=0,conflict:integer>=0,blocked:integer>=0,pending:integer>=0}}

GET /v2/score-exports/{id}/items (query: limit,cursor)
200 {items:[{preview_item_id:K,learner_id:I,state:queued|applied|skipped|conflict|blocked|unknown,reason_code:T64|null,receipt_id:T32|null}],next_cursor}

## การรักษาช่องครูและผลพิเศษ (บังคับในโค้ดตาม [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md))

เนื่องจากใช้บัญชี DB เดิมต่อ PGGradeDB โค้ด adapter ต้องบังคับอย่างเคร่งครัด:
- ระบุช่องด้วยคู่ AssessmentId + ScoreIdentifier ภายใต้ grade context ต้องพบตรงกันหนึ่งรายการและตรงกับ `SchoolBotGradeSlot` ที่ active; duplicate/ambiguous ให้หยุด ห้ามเลือก array index จาก Ordinal
- อ่าน ScoreData ล่าสุดใน transaction แล้วเปลี่ยนเฉพาะ Score ของช่องที่มี ownership ถูกต้อง; รักษารายการอื่น unknown properties ลำดับรายการ และผลพิเศษ
- ไม่มี detail/header/assessment ที่ต้องใช้: ให้ TARGET_NOT_READY ห้ามสร้าง implicit zero rows
- พบ PgtgradeEdit ที่เกี่ยวข้อง หรือผลพิเศษที่ไม่ใช่ none: block นักเรียนคนนั้น ห้าม clear override/แปลงผลพิเศษเป็นศูนย์

