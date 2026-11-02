# DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง — การเปลี่ยนสถานะและการตรวจข้ามฐานข้อมูลก่อน commit

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง](des-011.md)

## การเปลี่ยนสถานะและการตรวจข้ามฐานข้อมูลก่อน commit

- เนื่องจากไม่มี transaction เดียวครอบ SchoolBot DB กับ School DB ([decisions-027](../requirement/decisions-027.md)): ก่อน `POST /level-proposals` และก่อน `confirm`/`decline` ต้องอ่านและ **re-check สิทธิ์ครูรายวิชา, roster นักเรียน และข้อมูลเทอมถัดไป (`NYear`/`NTerm`) จาก School DB** รวมทั้ง re-check `SchoolBotLicense` active, source results, policy revisions และ current/target curriculum ใน SchoolBot DB
- เปลี่ยนแม้หนึ่งส่วนให้ `409 PROPOSAL_STALE` ต้องเสนอใหม่; เทอมถัดไปยังไม่มีใน School DB → `409 NEXT_TERM_NOT_AVAILABLE` ไม่สร้าง successor
- ชั้น application ตรวจว่า `CourseRun`, `LevelProposal` และ `SuccessorRun` อยู่ `SchoolId` เดียวกัน (คู่กับ single-column FK ชี้ PK ตาม
- ทุกเส้นทางที่สร้าง finalized proposal (`promoted`, `retained`, `max_level`) หรือ successor รวม create/confirm/decline ต้องใช้ transaction lock บน CourseRun ต้นทางร่วมกัน ตรวจ finalized proposal และ successor ซ้ำภายใต้ lock; เมื่อมี SuccessorRunId ต้องใช้ lock ของ run ที่อ้าง และเมื่อสร้าง successor ต้องถือ lock ของห้อง/ปี/เทอมปลายทางด้วย ตาม predicates และลำดับ lock ใน data-contract-rules.md บันทึก LevelProposal (`UpdateDate = clock_timestamp()`), successor เมื่อมี, AuditEvent และ Idempotency ใน SchoolBot DB transaction เดียว คง errors/replay/If-Match เดิม ไม่มี partial unique index บังคับ การบังคับทดแทนด้วย application/repository locks: NOT_IMPLEMENTED — ไม่มี runtime evidence

## ข้อผิดพลาด

401 UNAUTHORIZED, SESSION_EXPIRED
403 FORBIDDEN, SCHOOL_MISMATCH, SUBJECT_PERMISSION_REQUIRED, STAFF_ROLE_REQUIRED, CHANNEL_NOT_ALLOWED, LICENSE_REQUIRED
409 LEVEL_POLICY_NOT_CONFIGURED, POLICY_NOT_CONFIGURED, TERM_NOT_ENDED, NEXT_TERM_NOT_AVAILABLE, PROPOSAL_STALE, LEVEL_NOT_ELIGIBLE, SUCCESSOR_EXISTS, STATE_CONFLICT
412 VERSION_CONFLICT (`UpdateDate` ไม่ตรง `If-Match`)
428 PRECONDITION_REQUIRED

อ่าน canonical [กฎผลเรียน](learning-rules-032-034.md)
