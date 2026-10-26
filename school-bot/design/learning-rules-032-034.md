# กฎผลเรียน/policy — Rev1

Canonical ของ DES-004/005/010/011/012 และ dictionary ตาม032..034; หลักฐานแบบคือ ตาราง SchoolBotCourseRun ถึง SchoolBotRetakeGrant ใน ../db/schoolbot_db.sql และ ../db/review-006.md ไม่ใช่ runtime

## ตัวตนและรอบเรียน
employee ทดลอง local/เก็บ Project Cloud ได้ แต่ห้ามผล Cloud รวม Submission/Attempt, direct API, Guest import, retry/worker: 403 PROFILE_NOT_ALLOWED ก่อนสร้างผล/job; import ที่มีประวัติผลปฏิเสธทั้งคำขอ โครงงานนำเข้าแยกได้ ครู school_web ตรวจงานนักเรียนได้ตามสิทธิ์เดิม ตรวจ session/profile/SchoolId/Project.OwnerKind=student/OwnerId/roster ก่อน commit ไม่เชื่อ ID จาก client

Submission ไม่มี CourseRunId: รับงานโดย resolve active run เดียวจาก school/roster/ห้อง/เทอม/curriculum ของ mission และ EffectiveAt<=SubmittedAt ล็อก CourseRun แล้ว commit submission/job/idempotency กับ AuditEvent เดิม: Event=Submission.Accepted, EntityType=SchoolBotSubmission, EntityId=PK, Actor=นักเรียน, Reason เป็น JSON text {"course_run_id":K} ใน varchar(1000); K=รหัสจริง ไม่เพิ่ม FK ไม่พบ/กำกวมคืน409 COURSE_RUN_NOT_RESOLVED

เลือก project result เฉพาะหลักฐาน run/learner/mission/revision ตรง เลือก submission ล่าสุดตาม SubmittedAt,PK แล้ว CurrentAssessmentId ไม่ fallback ผลเก่าเมื่อยังไม่ตรวจ การตรวจใหม่คง run เดิม ผลไร้หลักฐาน run เป็น SOURCE_SCOPE_UNPROVEN และ block export/proposal ไม่เดาจากเวลา/sId เก็บ audit ตลอดอายุผล Attempt ใช้ CourseRunId จริงและผลที่ตรวจเสร็จของ submitted หรือ expired ตาม selection (decisions-042); NULL ไม่ใช่ผลศูนย์ที่ตรวจแล้ว Test รวมซ่อมใช้ best ไม่มีเพดานลดคะแนน รวมผล expired ด้วย; ProgressView.selected_attempt ใช้ผลที่เลือกนี้โดยคง DTO เดิม

## สูตรและ freeze
Policy คง {quiz_counts,activity_weights:[{activity_id,weight_bps}],formula_version}; activity ให้คะแนนต้องครบ/ไม่ซ้ำ/อยู่ curriculum ของ run น้ำหนัก int0..10000 รวม10000=100%; instruction ไม่เป็น source; quiz_counts=false ให้ quiz น้ำหนัก0
weighted-normalized-v1: total=SUM((earned/max)*weight_bps/100) สเกล0..100 เทียบเท่า normalized0..100*weight_bps/10000; decimal, max>0, 0<=earned<=max ไม่ปัดรายส่วน ตัวอย่างสมมติ 8/10*20+6/10*30+18/20*50=79; น้ำหนัก30/20/50ได้81 ไม่มีน้ำหนักเริ่มที่กำหนดแทนผู้ใช้

policy revision/pointer แก้ได้เฉพาะ planned ที่ไม่เคยเริ่ม ภายใต้ CourseRun lock+If-Match ตรวจ same-run/tenant/weights เริ่มรอบ=planned→active transaction ตรึง CurrentPolicyId พร้อม audit/idempotency บันทึก Event=CourseRun.Started, EntityType=SchoolBotCourseRun, EntityId=PK, Reason={"policy_id":K,"policy_hash":H}; H=SHA-256 canonical Policy ต้องพร้อมก่อนเริ่ม Lifecycle ไป active→closing→closed ห้ามย้อน planned/ลบหลบ freeze
หลังเริ่มห้ามแก้ quiz_counts/weights/formula/pointer หรือลบ policy ที่อ้าง:409 SCORING_POLICY_FROZEN น้ำหนักใหม่ใช้ run ใหม่ planned ตาม unique ห้อง/เทอม/successor เดิม ไม่ปิดรอบเพื่อย้อนคิดผล NULL สูตรคือร่างเปิดไม่ได้:409 POLICY_NOT_CONFIGURED; weights ผิด409 SCORING_WEIGHT_INVALID

## ข้อสอบและ Level
PolicyOverride คง AssessmentPolicy เต็ม object หรือ null ครูเปลี่ยนเฉพาะ time_limit_seconds field อื่นต้องเท่าค่าส่วนกลาง มิฉะนั้น403 POLICY_OVERRIDE_NOT_ALLOWED ไม่บันทึกบางส่วน null กลับ default; Test ต้องมีเวลา ครูปรับ OpensAt/ClosesAt ตาม window validation เดิม
AttemptSnapshot ใน JSON เดิมเพิ่ม effective_policy:AssessmentPolicy, opens_at:UTC ISO8601|null, closes_at:UTC ISO8601|null โดย server ตอนเริ่ม; policy_id เดิมคือ ScoringPolicy ไม่แทน effective_policy; override ใหม่ไม่เปลี่ยน attempt/deadline/เฉลยเดิม
RetakeGrant หนึ่งใบเพิ่มหนึ่งครั้งเฉพาะคน/activity/run ล็อก CourseRun ก่อนนับ Sequence/เพดาน/consume และ commit พร้อม attempt/audit/idempotency; retry ไม่กิน grant ซ้ำ
Level ใช้ทุกคนใน roster งานขาด/ไม่มีผล=0 quiz ไม่นับน้ำหนัก0 ไม่ renormalize; average=SUM(total)/member_count เทียบ strict> ก่อนปัด; roster ว่าง409 ROSTER_EMPTY ไม่สร้าง successor; snapshot/recheck ตาม DES-011; export ใช้ skip แยกต่างหาก

SQL คุม FK/UQ/state/bounds; profile/JSON/freeze/weights/run-binding เป็น application invariants Recheck สิทธิ์/License/roster ข้าม DB ก่อน commit ไม่อ้าง atomic ข้ามฐาน ปัดตก LearnerKind B, ผูกผลด้วยเวลา/sId อย่างเดียว, policy ย้อนหลัง และ flag/counter ใหม่

## Amendment 076 — 2026-10-26
ผล expired ตาม [DES-010 amendment076](des-010.md) ใช้ earned/max เต็มทั้งชุดเข้าสูตร weighted-normalized-v1 เดิม ภายใต้ policy ที่ freeze; quiz_counts=false ยังคงน้ำหนัก0 ผล 0 ที่ตรวจแล้วต่างจากไม่มีผล ไม่ skip เพียงเพราะ expired ไม่มีการคืนครั้ง/สิทธิ์ซ่อม ไม่เปลี่ยน weights/roster/Level threshold

## Change Log
- 2026-10-26 — Amendment076: แก้ submitted-only ให้รวม expired ที่ตรวจเสร็จตาม042; คง Rev1 และสูตรเดิม
- 2026-10-23 — Rev1: sync032..034/review-006; physical เดิม
