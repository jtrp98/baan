# กฎ mapping/export — Rev1

Canonical ของ DES-008/009/dictionary ตาม032/033; อ่าน [ผลเรียน](learning-rules-032-034.md) และ ../db/review-006.md; SQL=../db/schoolbot_db.sql

## ช่องและล็อก
Sources ยาว1ถาวร: {activity_id:PK,indicator_key:UUID|null,weight_bps:10000}; null ไม่เจาะตัวชี้วัด หนึ่ง activity หลายช่องได้ หนึ่งช่องกิจกรรมเดียว คีย์ช่อง=(SchoolId,NGradeId,AssessmentId,ScoreIdentifier) ตรวจ NYear/NTerm/ClassroomId/PlanCourseId/CourseId จริง ห้าม alias ด้วย identifier/run ใหม่ ScoreIdentifier resolve จาก ScoreData ไม่เดาจาก NameIdentifier/MaxScoreIdentifier/ordinal ช่องใหม่สร้างผ่านระบบเกรดก่อนเท่านั้น

ทุก mutation slot/mapping และ confirm ใช้ transaction-scoped advisory lock คีย์ช่อง canonical เรียงเหมือนกันทุก writer แล้วล็อก CourseRun/GradeSlot/Mapping ตาม PK ตรวจ If-Match/สิทธิ์และอ่านประวัติซ้ำหลัง lock แม้ยังไม่มี slot ต้องกัน create race ข้าม process
SQL:911–941 คุม active เท่านั้น แอปตรวจประวัติทุก run รวม IsDelete/RetiredAt ก่อน confirm แก้ได้และ invalidate preview จุดล็อกถาวร=confirm commit Export/Outbox/confirmed Preview ก่อน worker เขียน ครอบทุก mapping ใน Context.mapping_versions รวม pending/partial/failed/unknown/skipped ไม่เพิ่ม flag
หลังล็อกห้ามแก้ Sources/CourseRunId/GradeSlotId/ตัวตนปลายทาง รวม retire/soft-delete/hard-delete เพื่อเปิดช่องเดิม:409 MAPPING_LOCKED เก็บ mapping/slot/snapshots/outbox/receipt/audit linkage
ชุดใหม่ใช้ mapping ใหม่กับช่องอื่นไม่ถูกจอง หรือบริบทใหม่ที่ resolve เป็นคนละช่องจริง ไม่ใช่ PK/run ใหม่ทับช่องล็อก แม้ source เดิมให้ใช้ mapping เดิมส่งเพิ่ม ไม่ย้าย/ล้างคะแนน คะแนนเต็มปลายทางเปลี่ยนต้อง preview/recheck ใหม่ ไม่เปลี่ยนคู่

## สูตรและ skip
CellPreview เพิ่ม sources:SourceResultRef[] ตาม [นิยามเดิม](data-dictionary/contract-003.md) เพื่อแสดง earned/max ต้นทางคู่กับ target_max/raw_target/new_score; server สร้างจาก authoritative results ไม่รับคะแนนจาก client
raw_target=earned/max*target_max decimal ปัด integer half-up ครั้งเดียวต่อช่องจากต้นทาง เช่น3/4ไปเต็ม10=7.5→8 เต็ม12=9 max ปลายทางต้อง parse ได้และ>0 ผิด/กำกวม409 TARGET_NOT_READY ไม่เดา0/clamp/แปลง passed
ไม่มีผล/ยังไม่ตรวจ/error ข้ามรายช่อง คงค่าเดิม ผลจริง0ยังพร้อมส่ง PreviewItemSnapshot/View เพิ่ม skipped_cells:[{mapping_id:K,grade_slot_id:K,reason_code:SOURCE_RESULT_MISSING|SOURCE_RESULT_UNGRADED|SOURCE_RESULT_ERROR,old_score:T128|null}]; server สร้าง []เมื่อไม่มีข้าม null คือไม่มีค่าเดิม cells เดิมเก็บเฉพาะผลตัวเลข คงชนิด raw_target/new_score; SOURCE_SCOPE_UNPROVEN เป็น blocked แยกจาก missing
State เดิม ready/conflict/blocked: missing อย่างเดียว ready พร้อม ReasonCodes แม้ cells=[] UI แสดงข้าม apply เฉพาะ cells; ทั้งคนข้ามให้ Outbox skipped/LastErrorCode=SOURCE_RESULT_MISSING รายละเอียดใน snapshot ไม่เขียน PG/สร้าง receipt ปลอม Export มีข้ามให้ completed_with_skips เมื่อไม่มี pending/conflict/blocked ค้าง

## Recheck และ partial
hash ครอบ skipped_cells; missing กลายเป็นมีผลหรือ source/mapping/policy/roster/target/สิทธิ์เปลี่ยนก่อน confirm:409 PREVIEW_STALE ต้อง preview ใหม่ Worker recheck source/policy/mapping/สิทธิ์/License/locks ก่อน apply ไม่เติมผลใหม่ลงช่องที่ยืนยันให้ข้าม
confirm commit export/outbox/idempotency/audit ใน SchoolBot DB เดียว ตรวจ Export→Preview ตรง PreviewItem.ScorePreviewId และ SchoolId ทุกคู่ FK เดี่ยวไม่รับประกัน ข้าม DB ไม่อ้าง distributed transaction

pending/running/unknown ซ้อนช่อง+learner:409 EXPORT_IN_PROGRESS; reconcile ก่อน operation ใหม่ retry ใช้ OperationKey/PayloadHash เดิม payload ต่าง409 IDEMPOTENCY_CONFLICT สำเร็จอ่าน receipt ไม่เขียนซ้ำ key ใหม่ไม่ข้ามงานค้าง
partial คง applied และหยุดที่ยังไม่เริ่ม resolve/preview ใหม่ส่งเฉพาะส่วนค้าง: ล็อก outbox เก่า ไม่มี lease ทำงาน/receipt ไม่ทราบ; unknown ต้อง reconcile เมื่อพิสูจน์ว่ายังไม่ apply จึง mark เก่า blocked/LastErrorCode=SUPERSEDED_BY_PREVIEW และ audit อ้าง preview ใหม่ก่อน confirm ใหม่ worker ห้าม claim เก่า นี่คือชุดส่งใหม่ ไม่ใช่ mapping ใหม่
PG transaction บันทึกคะแนน+PgtgradeAuditLog receipt พร้อมกัน ผูก OperationKey/PayloadHash/context/learner/cells ที่เขียน/before-after hashes/calculator version/ผู้ยืนยัน ReceiptId/Hash ใน Outbox ใช้ reconcile หลัง crash รูป JSON/ขนาด receipt ยังต้องพิสูจน์ G-TARGET/G-DB unknown ไม่ใช่ failed ห้ามส่งใหม่ทันที

SQL:879–1059 เดิม cardinality/history/immutable/skip/สิทธิ์เป็นกฎแอป คง G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB ปัดตกหลาย source/flag table/ปลดล็อก partial/ลบหลบ ownership/missing=0

## Change Log
- 2026-10-23 — Rev1: sync032/033/review-006; physical เดิม
