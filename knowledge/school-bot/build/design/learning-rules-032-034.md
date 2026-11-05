# กฎผลเรียน/policy

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ไฟล์นี้กำหนดกฎผลเรียน Profile, CourseRun, สูตรรวม การตรึง policy และ Level ใช้ร่วมกับ [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md)/[DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](des-005.md)/[DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md)/[DES-011 (ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง)](des-011.md)/[DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md) และพจนานุกรมข้อมูลตาม [มติ 032 (ผลทดลองครูและการจับคู่/ล็อกช่องคะแนน)](../../shared/decisions/decisions-032.md), [มติ 033 (ช่องคะแนนเดิม การแปลงคะแนนเต็ม และผลที่ยังไม่มี)](../../shared/decisions/decisions-033.md) และ [มติ 034 (สูตรรวม น้ำหนักรอบเรียน และขอบเขตครูปรับข้อสอบ)](../../shared/decisions/decisions-034.md) ส่วน [กฎ mapping/export](grade-rules-032-034.md) กำหนดช่องคะแนน การล็อก การข้ามผล และ recovery ของการส่งคะแนน จึงเป็นคนละสัญญา

## ตัวตนและรอบเรียน

Profile แบบ `employee` ทดลอง local และเก็บ Project Cloud ได้ แต่ห้ามสร้างผล Cloud ทั้ง Submission/Attempt รวม direct API, Guest import และ retry/worker ต้องคืน `403 PROFILE_NOT_ALLOWED` ก่อนสร้างผลหรือ job หาก import มีประวัติผลให้ปฏิเสธทั้งคำขอ แต่ผู้ใช้แยกนำเข้าเฉพาะโครงงานได้ ครูช่อง `school_web` ตรวจงานนักเรียนได้ตามสิทธิ์เดิม ก่อน commit ต้องตรวจ session, profile, SchoolId, Project.OwnerKind=student, OwnerId และ roster ไม่เชื่อ ID จาก client

Submission ไม่มี CourseRunId จึงต้อง resolve active run เพียงรอบเดียวจาก school, roster, ห้อง, เทอม และ curriculum ของ mission โดยมี EffectiveAt<=SubmittedAt จากนั้นล็อก CourseRun และ commit submission, job, idempotency กับ AuditEvent เดิม: Event=Submission.Accepted, EntityType=SchoolBotSubmission, EntityId=PK, Actor=นักเรียน, Reason เป็น JSON text {"course_run_id":K} ใน varchar(1000); K=รหัสจริง ไม่เพิ่ม FK หากไม่พบหรือกำกวม ให้คืน `409 COURSE_RUN_NOT_RESOLVED`

เลือก project result เฉพาะที่มีหลักฐาน run, learner, mission และ revision ตรงกัน เลือก submission ล่าสุดตาม SubmittedAt,PK แล้วใช้ CurrentAssessmentId หากยังไม่ตรวจต้องไม่ fallback ไปผลเก่า การตรวจใหม่คง run เดิม ผลไร้หลักฐาน run เป็น SOURCE_SCOPE_UNPROVEN และ block export/proposal ไม่เดาจากเวลา/sId เก็บ audit ตลอดอายุผล Attempt ใช้ CourseRunId จริงและผลที่ตรวจเสร็จของ submitted หรือ expired ตาม selection ([มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../shared/decisions/decisions-042.md)); NULL ไม่ใช่ผลศูนย์ที่ตรวจแล้ว Test รวมซ่อมใช้ best ไม่มีเพดานลดคะแนน รวมผล expired ด้วย; ProgressView.selected_attempt ใช้ผลที่เลือกนี้โดยคง DTO เดิม

## สูตรและการตรึง policy

สูตร weighted-normalized-v1 น้ำหนัก และการตรึง policy อยู่ใน [กฎสูตรคะแนนและ policy](learning-rules-032-034-policy.md) ซึ่งเป็นส่วนหนึ่งของสัญญานี้

## ข้อสอบและ Level

PolicyOverride คง AssessmentPolicy เต็ม object หรือ null ครูเปลี่ยนเฉพาะ time_limit_seconds field อื่นต้องเท่าค่าส่วนกลาง มิฉะนั้น 403 POLICY_OVERRIDE_NOT_ALLOWED ไม่บันทึกบางส่วน null กลับ default; Test ต้องมีเวลา ครูปรับ OpensAt/ClosesAt ตาม window validation เดิม

AttemptSnapshot ใน JSON เดิมเพิ่ม effective_policy:AssessmentPolicy, opens_at:UTC ISO8601|null, closes_at:UTC ISO8601|null โดย server ตอนเริ่ม; policy_id เดิมคือ ScoringPolicy ไม่แทน effective_policy; การปรับ policy ใหม่ไม่เปลี่ยน attempt/deadline/เฉลยเดิม

RetakeGrant หนึ่งใบเพิ่มหนึ่งครั้งเฉพาะคน/activity/run ล็อก CourseRun ก่อนนับ Sequence/เพดาน/consume และ commit พร้อม attempt/audit/idempotency; retry ไม่กิน grant ซ้ำ

Level ใช้ทุกคนใน roster งานขาด/ไม่มีผล=0 quiz ไม่นับน้ำหนัก 0 ไม่ renormalize; average=SUM(total)/member_count เทียบ strict> ก่อนปัด; roster ว่าง 409 ROSTER_EMPTY ไม่สร้าง successor; snapshot/recheck ตาม DES-011; export ใช้ skip แยกต่างหาก

ฐาน SQL คงเฉพาะ Primary Key (PK) ส่วน application ต้อง serialize และตรวจ relationships, uniqueness, state, bounds, profile, JSON, freeze, weights และ run binding เองผ่าน transaction locks ตาม [กฎข้อมูล](data-contract-rules.md) ก่อน commit ต้อง recheck สิทธิ์, License และ roster ข้าม DB โดยไม่อ้าง atomic ข้ามฐาน ทางเลือกที่ไม่ใช้คือ LearnerKind B, ผูกผลด้วยเวลา/sId อย่างเดียว, policy ย้อนหลัง และ flag/counter ใหม่

## การใช้ผลที่หมดเวลา

ผล expired ตาม [DES-010 (คลังข้อสอบ Attempt และนโยบายคะแนน)](des-010.md) ใช้ earned/max เต็มทั้งชุดเข้าสูตร weighted-normalized-v1 เดิม ภายใต้ policy ที่ freeze; quiz_counts=false ยังคงน้ำหนัก 0 ผล 0 ที่ตรวจแล้วต่างจากไม่มีผล ไม่ skip เพียงเพราะ expired ไม่มีการคืนครั้ง/สิทธิ์ซ่อม ไม่เปลี่ยน weights/roster/Level threshold

## หลักฐาน

- E01 — ตาราง `SchoolBotCourseRun` ถึง `SchoolBotRetakeGrant` ใน `../db/schoolbot_db.sql` และ db/review-006.md (memory) เป็นหลักฐานแบบ ไม่ใช่ runtime
- การตรึงกฎผลหมดเวลามาจาก DES-010 และมติ 042; สัญญาเทคนิคแยกใน [finalization](learning-attempt-finalization-001.md) และ [snapshot projection](learning-snapshot-projection-001.md)
