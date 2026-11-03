# TP-001 — ทางหลักบทเรียน การส่งภารกิจ ข้อสอบ และหน้าจอคลังข้อสอบ

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — เคส normal ของ BE-015, BE-031 และ FE-020 บน stub)

เอกสารนี้กำหนดเคสระดับ `normal` (ทางหลักและผลปฏิเสธตามเกณฑ์ตรวจรับ) สำหรับงาน [BE-015 (ทำ API การเรียน)](../plan/index-delivery.md), [BE-031 (ทำ attempt/snapshot/เวลา/สุ่ม/ตรวจข้อสอบ)](../plan/extension/index.md) และ [FE-020 (เชื่อม admin คลังข้อสอบ/policy)](../plan/extension/index.md) ใช้คู่กับ [ตาราง normal แยกตาม task](tp-001-normal-index.md) และ [ขอบเขต normal/full](tp-001-normal-scope.md) ทุกผลจริงยังเป็น NOT_RUN

คำย่อในเอกสาร: AC = Acceptance Criteria (เกณฑ์ตรวจรับ) · BR = Business Rule (กฎธุรกิจ) · API = Application Programming Interface · UI = User Interface · UX = User Experience · UUID = Universally Unique Identifier · UTC = Coordinated Universal Time · ETag = Entity Tag สำหรับตรวจข้อมูลชน

## Setup ร่วมบน stub (Setup M สำหรับ BE-015 และ Setup A สำหรับ BE-031/FE-020)

รันระดับ component/integration ในหนึ่ง host/process มีสอง service/adapter instances ต่อ backing store ร่วม แยกการทดสอบเป็นสองรอบต่อเคส: รอบแรกใช้ `MemorySchoolBotBackingStore` object เดียว และรอบที่สองใช้ `FileSchoolBotBackingStore` สอง object ที่ชี้ directory เดียวกัน อ่านตรวจ persisted state ด้วย adapter ตัวที่สามหรือเปิด file store ใหม่โดยไม่พึ่ง service cache ใช้ fake UTC clock เริ่ม `T = 2026-11-03T02:00:00Z`, fake cipher และ directory/authority fake ไม่ต่อฐานข้อมูลจริงและไม่ inject storage fault ในระดับ `normal` ทุกคำขอที่เปลี่ยนข้อมูลส่ง `X-Request-Id` และ `Idempotency-Key` เป็น UUID ใหม่พร้อม `If-Match` ล่าสุดเมื่อสัญญากำหนด

- **Setup M (สำหรับ BE-015 ต่อจาก Setup L และ C):** seed เนื้อหากลาง `SchoolId = null` ใน `curricula_snapshot.json` มี `cur1` (`CurriculumKey = K_CUR`, `revision = 1`, `Lifecycle = published`, `Level = Beginner`) ประกอบด้วย 2 บทเรียน (`L1`, `L2`): `L1` มี `objective`, `instructions`, กิจกรรม `instruction` (`A0`, `mode = null`) และกิจกรรม `project` สามโหมด (`A1` `mode = block`, `A2` `mode = arm`, `A3` `mode = code`) ผูกภารกิจ `M1` (`method = automatic`, เกณฑ์ `C1` แบบ `automatic-v1` ที่มี expected trace ฝั่ง server), `M2` (`method = teacher`, เกณฑ์ `C2` แบบ `teacher-v1`), `M3` (`method = automatic`, เกณฑ์ `C3` แบบ `automatic-v1`); `L2` มีเป้าหมาย คำแนะนำ และกิจกรรมแยกจาก `L1` พร้อม seed `cur2` (`CurriculumKey = K_CUR`, `revision = 2`, `Lifecycle = published`) ที่ใช้ `LessonKey`/`MissionKey`/`ActivityKey` เดิมแต่ได้รหัสแถวใหม่ (`M1_v2`, `C1_v2`) มี `CourseRun` `run1` (`Lifecycle = active`, `SchoolId = 1`, `ClassroomId = 401`, `NYear = 101`, `NTerm = "term-1"`, `CurriculumId = cur1`, `EffectiveAt = T`) และ `student` (`desktop`, `P = student`, `LearnerId = 301`, `SchoolId = 1`) อยู่ในรายชื่อห้องของ `run1` พร้อม seed โครงงาน Cloud ของ `student` (`OwnerKind = "student"`, `OwnerId = 301`, `SchoolId = 1`) แยกสามโหมด (`revBlock`, `revArm`, `revCode`) ปิด worker ตรวจอัตโนมัติใน harness เพื่อแยกขอบเขต BE-015 ออกจาก BE-016 และ BE-017
- **Setup A (สำหรับ BE-031 และ FE-020 ต่อจาก Setup L และ [Setup Q ของคลังข้อสอบ](tp-001-cases-quiz-grade-bank.md)):** ใช้ `CurriculumStoreSnapshot` (`curricula_snapshot.json`) เก็บ `question_banks`, `course_runs`, `course_run_activities`, `attempts`, `audit_events` และ `idempotency` ในหน่วยเดียวกันตาม [การเก็บบน stub store ของ DES-010 Rev1](../design/des-010-stub-persistence.md) สำหรับ BE-031 เริ่มต้น `attempts = []`, `idempotency = []` บน `run11` (`SchoolId = 11`, `Lifecycle = active`, `ClassroomId = 401`, `NYear = 2569`, `NTerm = "1"`), `student` (`desktop`, `P = student`, `LearnerId = 301`, `SchoolId = 11`), `employeeDesktop` (`desktop`, `P = employee`, `sEmp = 301` ชนเลข `LearnerId = 301`) และ `schoolTeacher` (`school_web`, `SchoolId = 11`, `sEmp = 201`) มีคลัง `bank v1` published 3 ข้อ (`Q201` ปรนัยเต็ม 2 เฉลย `211`, `Q202` ถูก/ผิดเต็ม 3 เฉลย `221`, `Q203` ปรนัยเต็ม 5 เฉลย `231` ตัวเลือก `[231,232,233]`; รวมเต็ม 10) และ `bankTest10` published 10 ข้อ (`Q1..Q10` ข้อละ 1 คะแนน รวมเต็ม 10) ผูกกิจกรรมในหลักสูตร `revision = 1` ได้แก่ `quizDefault` (ไม่ปรับค่า ใช้ค่าเริ่มตาม `BR-046-05`), `testDefault` (ค่าเริ่ม `BR-046-05` ตั้ง `time_limit_seconds = 120`), `quizCustom` (`max_attempts = 2, selection = latest, time_limit_seconds = 90, reveal = after_close, shuffle_questions = true, shuffle_options = true`) และ `test10` (10 ข้อละ 1 คะแนน, `max_attempts = 1, selection = first, time_limit_seconds = 120, reveal = after_submit, shuffle = false`) ทุกกิจกรรมเปิดช่วง `01:00:00Z–03:00:00Z`

<a id="tp001-054-normal"></a>
## TP001-054 (ส่วน normal ของ BE-015) — เปิดบทเรียนและส่งงานภารกิจตรงโหมดและฉบับ

ระดับ: normal

อ้าง [AC-037-02 (เปิด Lesson แล้วเห็นเป้าหมาย คำแนะนำ และรายการ Activity ตรงกับบทเรียนที่เลือก)](../../modules/quiz/shared/requirements/req-037.md) และ [AC-037-03 (งานและผลภารกิจอ้าง Activity, Mode, Lesson และ revision ที่เรียนถูกต้อง ไม่ปะปนข้ามโหมดหรือฉบับ)](../../modules/quiz/shared/requirements/req-037.md) · BE-015 · [DES-005 Rev12](../design/des-005.md), [API Rev11](../design/des-005-api.md), [โครงสร้างเนื้อหา Rev9](../design/des-005-content.md), [การประเมิน Rev8](../design/des-005-grading.md), [กฎผลเรียน Rev2](../design/learning-rules-032-034.md)

Setup และขั้นตอน: ใช้ Setup M; (1) `student` เรียก `GET /v2/curricula?mode=block` และ `GET /v2/curricula/{cur1}` เพื่อเปิดอ่านบทเรียน `L1` และ `L2`; (2) `student` ส่งงานภารกิจด้วย `POST /v2/submissions` แยกสามโหมด: `M1`คู่กับ `C1` และ `revBlock`, `M2` คู่กับ `C2`, `revArm` และ `evidence`, `M3` คู่กับ `C3` และ `revCode`; (3) ทดลองส่ง `M1` (`mode = block`) ด้วย `revArm` (`mode = arm`) และทดลองส่ง `M1` คู่กับ `C1_v2` ของ `cur2` เพื่อตรวจการกันปะปนข้ามโหมดและข้ามฉบับตาม AC-037-03; (4) เรียก `GET /v2/submissions/{id}` และ `GET /v2/progress?course_run_id=run1&curriculum_id=cur1` เทียบกับ `curriculum_id=cur2` และ `mode=block` แล้วเปิด file store ใหม่อ่านซ้ำ

Response และ persisted state ที่คาด: `GET /v2/curricula/{cur1}` ได้ 200 คืน `objective`, `instructions`, `activities` และ `missions` ตรง `L1` และ `L2` ตามลำดับ `ordinal` พร้อม ETag โดย public criteria ไม่ส่ง expected trace ลับของ server; `POST /v2/submissions` สามโหมดได้ 201 พร้อม `SubmissionView` ที่อ้าง `mission_id`, `criteria_id`, `project_revision_id` ตรงโหมด โดย `M1` และ `M3` มี `state = "queued"`, `M2` มี `state = "awaiting_teacher"` และ `assessment = null`; คำขอที่ส่งผิดโหมดหรือข้ามฉบับถูกปฏิเสธด้วย 400/409 โดยไม่สร้างแถวเพิ่ม; `GET /v2/progress` บน `cur1` แสดง `latest_submission` แยกตรง `activity_id`, `mode` และ `mission_id` ของ `cur1` ส่วนการถามบน `cur2` ได้ `latest_submission = null` ไม่ดึงผลจาก `cur1` ข้ามฉบับ ใน store มี `SchoolBotSubmission = 3`, `SchoolBotGradingJob = 2` (เฉพาะ `M1`, `M3` สถานะ `queued`), `SchoolBotAssessment = 0`, `SchoolBotAuditEvent` เพิ่ม `Submission.Accepted` 3 รายการ (`Reason = "{\"course_run_id\":1}"`) และ `SchoolBotIdempotency = 3` คงเดิมหลัง reopen

<a id="tp001-116"></a>
## TP001-116 — เปิดและปิดบทเรียนโดยไม่ประเมินไม่สร้างผลผ่าน

ระดับ: normal

อ้าง [AC-037-04 (เพียงเปิดหรือกดปิดบทเรียนไม่สร้างผลผ่านจริงโดยไม่มีการประเมินตาม REQ-038)](../../modules/quiz/shared/requirements/req-037.md) · BE-015 · [DES-005 Rev12](../design/des-005.md), [API Rev11](../design/des-005-api.md), [การประเมิน Rev8](../design/des-005-grading.md)

Setup และขั้นตอน: ใช้ Setup M เริ่มจากยังไม่มีการส่งงาน (`Submission = 0, GradingJob = 0, Assessment = 0`); (1) `student` เปิดอ่านรายการหลักสูตร บทเรียน กิจกรรม และความคืบหน้า (`GET /v2/curricula`, `GET /v2/curricula/{cur1}`, `GET /v2/progress?course_run_id=run1&curriculum_id=cur1`) ซ้ำหลายครั้ง แล้วจำลองการปิดบทเรียน/ปิดแอปด้วยการทิ้ง adapter และเปิดอ่านใหม่โดยไม่เรียก `POST /v2/submissions`; (2) จากนั้นส่ง `M1` (`queued`) และ `M2` (`awaiting_teacher`) อย่างละหนึ่งรายการ แล้วเปิดอ่านบทเรียนและ `GET /v2/progress` ซ้ำโดยยังไม่มีผลตรวจจาก BE-016 หรือ BE-017

Response และ persisted state ที่คาด: ทุกการอ่านได้ 200; ในขั้นที่ (1) `ProgressView` มี `latest_submission = null` ทุกกิจกรรมและภารกิจ ไม่มีสถานะ `passed` หรือ `evaluated` และ persisted state คง `Submission = 0, GradingJob = 0, Assessment = 0`, audit และ idempotency เท่ากับ baseline; ในขั้นที่ (2) การเปิดและอ่านบทเรียนซ้ำคงสถานะ `queued` และ `awaiting_teacher` พร้อม `assessment = null` ไม่สร้าง `SchoolBotAssessment` หรือเปลี่ยนผลเป็น `passed` เอง

<a id="tp001-117"></a>
## TP001-117 — ใช้ค่าเริ่ม BR-046-05 และบังคับจำนวนครั้ง เวลา และการเปิดเฉลยตาม policy

ระดับ: normal

อ้าง [AC-046-02 (Quiz/Test ที่ไม่ปรับค่าใช้ BR-046-05; เมื่อใช้ policy ที่กำหนด ระบบจำกัดครั้ง/เวลาและเปิดเฉลยตรงค่า)](../../modules/quiz/shared/requirements/req-046.md) · BE-031 · [DES-010 Rev8](../design/des-010.md), [API Rev6](../design/des-010-api.md), [นโยบาย Rev5](../design/des-010-policy.md), [การอ่าน Attempt Rev1](../design/learning-attempt-read-001.md), [การเก็บบน stub store Rev1](../design/des-010-stub-persistence.md)

Setup และขั้นตอน: ใช้ Setup A ที่เวลา `T = 02:00:00Z`; (1) บน `quizDefault` (ค่าเริ่ม `BR-046-05`: ไม่จำกัดครั้ง, ไม่จับเวลา, เฉลยทันทีหลังส่ง, เลือกคะแนนสูงสุด, ไม่สุ่ม) ให้ `student` เรียก `POST /v2/attempts` และ `POST /v2/attempts/{id}/submit` สองครั้งติดกัน ครั้งแรกตอบได้ `5/10` ครั้งที่สองตอบได้ `8/10`; (2) บน `testDefault` (ค่าเริ่ม `BR-046-05`: 1 ครั้ง, จับเวลา 120 วินาที, เฉลยหลังปิดสอบ `after_close`, เลือกครั้งแรก, สุ่มข้อ) ให้ `student` เริ่มและส่งครั้งที่ 1 ตอบได้ `7/10` ที่ `02:00:30Z` อ่าน `GET /v2/attempts/{id}` ทันทีก่อนเวลาปิด `03:00:00Z` แล้วลอง `POST /v2/attempts` ครั้งที่ 2; (3) บน `quizCustom` (`max_attempts = 2, selection = latest, time_limit_seconds = 90, reveal = after_close, shuffle = true,true`) ให้ `student` เริ่มและส่งครั้งที่ 1 ได้ `8/10` และครั้งที่ 2 ได้ `5/10` ลองเริ่มครั้งที่ 3 และอ่านผลก่อนเวลาปิด (`02:05:00Z`) เทียบกับหลังเลื่อนเวลาไป `03:10:00Z` พร้อมเรียก `GET /v2/progress?course_run_id=run11`

Response และ persisted state ที่คาด: (1) `quizDefault` เริ่มและส่งได้ทั้ง 2 ครั้ง (`sequence = 1, 2`, `deadline_at = null`) หลังส่งคืน `earned` และ `feedback` พร้อม `correct_option_keys` ทันที และ `ProgressView.selected_attempt` เลือก `best = 8/10`; (2) `testDefault` ครั้งแรกได้ `deadline_at = 02:02:00Z` หลังส่งขณะ `02:00:30Z < closes_at` ซ่อน `earned = null` และ `feedback = null` การขอเริ่มครั้งที่ 2 ได้ `409 ATTEMPT_LIMIT_REACHED` และเมื่ออ่านหลัง `03:10:00Z` จึงเปิด `earned = 7, max_score = 10` พร้อม `feedback`; (3) `quizCustom` ครั้งที่ 1 และ 2 ได้ `deadline_at = StartedAt + 90s` ขอเริ่มครั้งที่ 3 ได้ `409 ATTEMPT_LIMIT_REACHED` ก่อนเวลาปิดซ่อนคะแนน/เฉลย หลัง `03:10:00Z` เปิดทั้งคู่และ `ProgressView.selected_attempt` เลือก `latest = 5/10` ใน `CurriculumStoreSnapshot.attempts` มี 5 แถว (`state = "submitted"`) พร้อม `EarnedScore` จริงที่คำนวณไว้และอ่านกลับตรงกันหลัง reopen

<a id="tp001-118"></a>
## TP001-118 — รายการที่สุ่มข้อแสดงประวัติชุดและลำดับข้อที่ผู้เรียนได้รับจริง

ระดับ: normal

อ้าง [AC-046-03 (รายการที่กำหนดสุ่มข้อ แสดงประวัติชุดและลำดับข้อที่ผู้เรียนได้รับจริงได้)](../../modules/quiz/shared/requirements/req-046.md) · BE-031 · [DES-010 Rev8](../design/des-010.md), [API Rev6](../design/des-010-api.md), [การอ่าน Attempt Rev1](../design/learning-attempt-read-001.md), [การเก็บบน stub store Rev1](../design/des-010-stub-persistence.md)

Setup และขั้นตอน: ใช้ Setup A บน `quizCustom` (`shuffle_questions = true, shuffle_options = true`); กำหนด shuffler ทดสอบให้ครั้งที่ 1 ได้ลำดับข้อ `[Q203, Q201, Q202]` และตัวเลือกของ `Q203` เป็น `[232, 231, 233]` ส่วนครั้งที่ 2 ได้ลำดับข้อ `[Q202, Q203, Q201]` และตัวเลือกของ `Q203` เป็น `[233, 231, 232]`; ให้ `student` เรียก `POST /v2/attempts`, `PUT /v2/attempts/{id}/answers` และ `POST /v2/attempts/{id}/submit` ทั้งสองครั้ง จากนั้นทิ้ง adapter/เปิด file store ใหม่แล้วเรียก `GET /v2/attempts?course_run_id=run11&activity_id=quizCustom` และ `GET /v2/attempts/{id}` ของแต่ละครั้งซ้ำสองรอบ

Response และ persisted state ที่คาด: `GET /v2/attempts` คืน 200 เรียง `StartedAt DESC, id DESC` เห็นประวัติครบทั้ง 2 ครั้ง (`sequence = 2` และ `sequence = 1`); `GET /v2/attempts/{id}` ของครั้งที่ 1 คืน `questions` เรียง `[Q203, Q201, Q202]` พร้อมตัวเลือก `[232, 231, 233]` และของครั้งที่ 2 คืน `[Q202, Q203, Q201]` พร้อมตัวเลือก `[233, 231, 232]` ตรงกับที่ได้รับจริงทุกครั้งที่อ่านโดยไม่สุ่มใหม่ตอน GET; ใน `CurriculumStoreSnapshot.attempts` ทั้ง 2 แถวเก็บ `Snapshot.question_order` และ `Snapshot.option_order` แยกกันอย่างถาวรข้ามการ reopen

<a id="tp001-081-normal"></a>
## TP001-081 (ส่วน normal ของ BE-031) — หมดเวลาตรวจเฉพาะคำตอบที่บันทึกทันได้ 4/10 ไม่รับคำตอบช้าและนับครั้ง

ระดับ: normal

อ้าง [AC-046-07 (Test 10 ข้อละ 1; บันทึกทัน 6 ถูก 4; หมดเวลาไม่ส่งได้ 4/10 ไม่รับคำตอบช้า นับครั้ง/สิทธิ์ซ่อมตาม policy/snapshot เดิม)](../../modules/quiz/shared/requirements/req-046.md) และ [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../shared/decisions/decisions-042.md) · BE-031 · [DES-010 Rev8](../design/des-010.md), [ข้อผิดพลาดและผลหมดเวลา Rev5](../design/des-010-expiry.md), [finalization Rev1](../design/learning-attempt-finalization-001.md), [การเก็บบน stub store Rev1](../design/des-010-stub-persistence.md)

Setup และขั้นตอน: ใช้ Setup A บน `test10` (10 ข้อละ 1 คะแนน, `max_attempts = 1, time_limit_seconds = 120, reveal = after_submit`); (1) ที่ `02:00:00Z` `student` เรียก `POST /v2/attempts` ได้ `sequence = 1, deadline_at = 02:02:00Z`; (2) ที่ `02:01:00Z` (`t_accept < deadline_at`) เรียก `PUT /v2/attempts/{id}/answers` บันทึก 6 ข้อ (`Q1..Q4` ตอบถูก 4 ข้อ, `Q5..Q6` ตอบผิด 2 ข้อ, `Q7..Q10` ไม่ได้ส่งคำตอบ) ได้ 200; (3) เลื่อน fake clock ไป `02:02:01Z` (เลย `deadline_at`) โดยไม่กด submit แล้วเรียก `GET /v2/attempts/{id}`; (4) ที่ `02:02:05Z` ส่ง `PUT /v2/attempts/{id}/answers` และ `POST /v2/attempts/{id}/submit` พร้อมคำตอบที่ถูกของ `Q7..Q8` แล้วอ่านซ้ำ และลองเรียก `POST /v2/attempts` เพื่อเริ่มครั้งใหม่

Response และ persisted state ที่คาด: การอ่านหลังหมดเวลาในขั้นที่ (3) finalize การทำข้อสอบเป็น `state = "expired"`, `submitted_at = null`, `earned = "4"`, `max_score = "10"` (ตรวจเฉพาะ 6 ข้อที่บันทึกทันและให้ข้อว่างเป็น 0 บนคะแนนเต็ม 10); คำขอ `PUT answers` และ `POST submit` ที่ส่งหลังหมดเวลาในขั้นที่ (4) ได้ `409 ATTEMPT_EXPIRED` ไม่เปลี่ยนคำตอบหรือคะแนน; การขอเริ่มครั้งใหม่ได้ `409 ATTEMPT_LIMIT_REACHED` เพราะ `sequence = 1` ถูกนับตาม policy/snapshot เดิมไม่คืนสิทธิ์จากการไม่กดส่ง ใน `CurriculumStoreSnapshot` มี `attempts = 1` (`State = "expired", SubmittedAt = null, EarnedScore = 4, MaxScore = 10`, `Answers` คง 6 ข้อเดิม) พร้อม `Attempt.Expired` audit 1 รายการ (`Actor = "service:attempt-finalizer"`, `CreateBy = null, UpdateBy = null`) ไม่ประเมินหรือเขียนซ้ำเมื่ออ่านซ้ำหลัง reopen

<a id="tp001-024-normal"></a>
## TP001-024 (ส่วน normal ของ BE-031) — ครูเก็บโครงงาน Cloud ได้แต่ไม่สร้างหรืออ่าน Attempt บน Cloud

ระดับ: normal

อ้าง [AC-036-05 (ครูทดลองภารกิจ/ข้อสอบ local และเก็บโครงงาน Cloud ได้ แต่ส่ง submission/attempt ไป Cloud ทั้งทางตรงและนำเข้าประวัติไม่ได้; ไม่เกิดผลเรียนหรือคะแนน Cloud ของครู)](../../modules/app-shell/shared/requirements/req-036.md) · BE-031 · [DES-004 Rev13](../design/des-004.md), [DES-010 API Rev6](../design/des-010-api.md), [กฎผลเรียน Rev2](../design/learning-rules-032-034.md), [การเก็บบน stub store Rev1](../design/des-010-stub-persistence.md)

Setup และขั้นตอน: ใช้ Setup A โดยมี Attempt ของ `student` (`LearnerId = 301`) อยู่ 1 แถวใน `CurriculumStoreSnapshot.attempts`; ให้ `employeeDesktop` (`desktop`, `P = employee`, `sEmp = 301` ซึ่งเลขตรงกับ `LearnerId = 301` ของนักเรียนในห้อง) บันทึกและเปิดโครงงาน Cloud ของตนผ่านบริการโครงงาน (`OwnerKind = "employee"`) จากนั้นเรียก `POST /v2/attempts` บน `run11/quizDefault` และลองเรียก `GET /v2/attempts`, `GET /v2/attempts/{id}`, `PUT /v2/attempts/{id}/answers`, `POST /v2/attempts/{id}/submit` รวมทั้งให้ `BE-015` ตรวจ `POST /v2/submissions` ด้วย `employeeDesktop`

Response และ persisted state ที่คาด: โครงงาน Cloud ของครูบันทึกและเปิดได้ 201/200 ภายใต้ `OwnerKind = "employee"`; ทุกคำขอ `/v2/attempts` (และ `/v2/submissions`) ของ `employeeDesktop` ได้ `403 PROFILE_NOT_ALLOWED` ก่อนสร้างแถวหรือประเมินผล ใน `CurriculumStoreSnapshot` จำนวน `attempts` คงเท่าเดิม (ไม่มีแถวของครู และแถวของ `student` ที่ `LearnerId = 301` ไม่ถูกแก้ไขหรือเปิดเผยแม้ `sEmp == sId`) โดย `audit_events` และ `idempotency` ของการทำข้อสอบไม่เพิ่มขึ้น

<a id="tp001-119"></a>
## TP001-119 — หน้าจอ admin แสดงคลังข้อสอบและ policy สี่ด้านของ Quiz และ Test ตรงค่าจริง

ระดับ: normal

อ้าง [AC-046-01 (เปิด Quiz และ Test แล้วตรวจ policy ทั้งสี่ด้านที่กำหนดไว้ของแต่ละรายการได้)](../../modules/quiz/shared/requirements/req-046.md) · FE-020 · [DES-010 Rev8](../design/des-010.md), [DES-012 Rev9](../design/des-012.md), [UX-005 ที่อนุมัติแล้ว (int-006 §1/§5 และ Q41)](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md), [รายละเอียดคลังข้อสอบและ policy (int-006 companion §5)](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-import-bank.md)

Setup และขั้นตอน: ใช้ [Setup Q ของ BE-030](tp-001-cases-quiz-grade-bank.md) เชื่อม UI component/integration ของหน้าจัดการคลังข้อสอบและแผง policy กิจกรรมกับ API ของ BE-030 ที่มีแล้ว (`GET /v2/admin/question-banks`, `GET /v2/admin/question-banks/{id}` และข้อมูล policy กิจกรรม `quiz`/`test` จาก `policy-096.json` / `GET /v2/course-runs/{id}/activities/{activity_id}`) ภายใต้ session `staffAuthor` (`staff_admin` + `content_author`); เปิดหน้ารายการคลังข้อสอบ เปิดดูรายละเอียด `bank v1` (สถานะ `published`) และเปิดตรวจแผงตั้งค่า policy ของ Activity `quiz` และ `test`

Response และ persisted state ที่คาด: หน้าจอเปลี่ยนสถานะจาก `loading` (`aria-busy="true"`) เป็นแสดงข้อมูลจริงตาม [สถานะ S1 ของ UX-005](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-states.md) โดยแสดงตารางค่าเริ่มต้นเปรียบเทียบ Quiz กับ Test และแสดงค่าที่กำหนดจริงครบทั้ง 4 ด้านจากข้อมูล server โดยไม่สรุปจากชื่อกิจกรรม: `quiz` แสดงจำนวนครั้ง `3 ครั้ง` (`selection = latest`), เวลาสอบ `90 วินาที`, การเปิดเฉลย `หลังปิดสอบ (after_close)`, การสุ่ม `สุ่มข้อและสุ่มตัวเลือก (true, true)`; `test` แสดง `2 ครั้ง` (`selection = best`), เวลาสอบ `120 วินาที`, การเปิดเฉลย `หลังส่งคำตอบ (after_submit)`, การสุ่ม `ไม่สุ่มข้อและไม่สุ่มตัวเลือก (false, false)`; ฉบับ `bank v1` ที่เผยแพร่แล้วแสดงในโหมดอ่านอย่างเดียวพร้อมข้อความกำกับ และ persisted state ใน `CurriculumStoreSnapshot` คงเดิม (`bank = 1, curriculum = 1, Lesson = 2, Activity = 2, Attempt = 2, audit = 2, ledger = 0`)

<a id="tp001-120"></a>
## TP001-120 — หน้าจอ admin สร้าง แก้ และเผยแพร่คลังข้อสอบ revision ใหม่โดยคงประวัติและ snapshot เดิม

ระดับ: normal

อ้าง [AC-046-04 (แก้คลังเป็น revision ใหม่แล้วประวัติการทำเดิมยังอ้าง snapshot และเกณฑ์เดิม ผลเดิมไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-046.md) · FE-020 · [DES-010 Rev8](../design/des-010.md), [ร่างคลังข้อสอบ Rev3](../design/learning-bank-draft-001.md), [DES-012 Rev9](../design/des-012.md), [UX-005 ที่อนุมัติแล้ว (Q41/Q42)](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-import-bank.md)

Setup และขั้นตอน: ใช้ [Setup Q ของ BE-030](tp-001-cases-quiz-grade-bank.md) เชื่อม UI admin คลังข้อสอบกับ API ของ BE-030 (`POST /v2/admin/question-banks`, `PUT /v2/admin/question-banks/{id}`, `POST /v2/admin/question-banks/{id}/publish`, `GET /v2/admin/question-banks/{id}`); (1) `staffAuthor` (`content_author`) เปิด `bank v1` ที่เป็นหน้าอ่านอย่างเดียวแล้วกดสร้างฉบับแก้ไขใหม่ `revision = 2` (`bank-096-v2.json` เปลี่ยนเฉลยและคะแนนเต็มเป็น `7` และ `11`) จากนั้นแก้ชื่อเป็น `"คลังใหม่ที่แก้ร่าง"` แล้วกด `"บันทึกฉบับร่าง"` (ส่ง `If-Match` ล่าสุดและ `Idempotency-Key` ใหม่); (2) สลับ session เป็น `staffApprover` (`content_approver` คนที่สองที่ไม่เคยแก้ร่าง) เปิดหน้าตรวจ `v2` กรอกหลักฐานอนุมัติ `approval_ref = "fixture:approved-v2"` แล้วกด `"ตรวจร่างและเผยแพร่"`; (3) เปิดอ่านรายละเอียด `v1` และ `v2` ใน UI และอ่านประวัติ Attempt ของ `student` หลังเปิด store ใหม่

Response และ persisted state ที่คาด: ในขั้นที่ (1) ขณะเป็น `staffAuthor` ปุ่มเผยแพร่ถูกปิดใช้งาน (`disabled`) พร้อมคำอธิบาย `"ต้องให้ผู้ตรวจอีกคนเผยแพร่ฉบับนี้"` และหลังบันทึกสำเร็จแสดงข้อความยืนยัน inline `"บันทึกฉบับร่างแล้ว"` จากผลตอบ 201/200 ของ server; หน้าตรวจก่อนเผยแพร่แสดงข้อความตาม Q41 ว่า `"การแก้ข้อสอบนี้ใช้กับฉบับใหม่ การทำข้อสอบที่เริ่มแล้วคงคำถาม ลำดับ เกณฑ์ และ policy เดิม"` และไม่มีปุ่มสร้างการทำข้อสอบทดลองบน Cloud; ในขั้นที่ (2) หลัง `staffApprover` กดเผยแพร่ได้ 200 หน้าจอแสดงสถานะ `"เผยแพร่แล้ว"` พร้อมผู้อนุมัติ เวลา `published_at` และ `approval_ref = "fixture:approved-v2"` จาก server; ใน `CurriculumStoreSnapshot` มี `question_banks = 2` ฉบับ (`v1` และ `v2` สถานะ `published`), `audit = 5`, `ledger = 3` ส่วน `Attempt` เดิมทั้ง 2 แถวคง `Snapshot` ของ `v1` คะแนน `2/5` และแถว `started` คง `EarnedScore = null` ไม่ถูกคำนวณใหม่จาก `v2`

## รายการเคสระดับ full สำหรับ full pass

รายการด้านล่างบันทึกเป็นชื่อเคสบรรทัดเดียวตามกติการะดับ `normal` เพื่อให้ `check` ขยาย setup ในรอบ `full` โดยไม่ใช้เวลารอบนี้:

- `TP001-054 (ส่วน full)` · ระดับ: full — ส่งงานภารกิจซ้ำด้วย `Idempotency-Key` เดิม/ต่างเนื้อหา, นักเรียนส่งโครงงานของคนอื่นหรือต่างโรงเรียน, และส่งขณะที่ `CourseRun` ไม่พบหรือมีหลายรอบชนกัน (`409 COURSE_RUN_NOT_RESOLVED`) ตาม AC-037-02 และ AC-037-03
- `TP001-055 (ส่วน full ของ BE-015)` · ระดับ: full — ปฏิเสธการเปิดหรือส่งงานกับบทเรียน/เกณฑ์ที่ยังเป็น `draft` หรือขาดหลักฐานอนุมัติ (`409 CONTENT_NOT_PUBLISHED`) ตาม AC-037-04..06
- `TP001-063 (ส่วน full ของ BE-031)` · ระดับ: full — ขอเริ่มทำข้อสอบนอกช่วง `opens_at`/`closes_at` (`409 ACTIVITY_NOT_OPEN`/`ACTIVITY_CLOSED`) หรือเมื่อ `reveal = after_close` แต่ไม่มี `closes_at` (`409 POLICY_NOT_CONFIGURED`) และส่งคำตอบผิดรูป (`400 ANSWER_INVALID`) ตาม AC-046-02
- `TP001-064 (ส่วน full ของ BE-031)` · ระดับ: full — แข่งเริ่มทำข้อสอบพร้อมกันสองคำขอใต้เพดาน `max_attempts` และการเปลี่ยน policy รายห้องหลังเริ่มทำข้อสอบแล้วไม่เปลี่ยนเส้นตายหรือลำดับข้อของครั้งที่กำลังทำ ตาม AC-046-03 และ AC-046-04
- `TP001-081 (ส่วน full ของ BE-031)` · ระดับ: full — หมดเวลาโดยไม่มีคำตอบเลยได้ `0/10`, คำขอส่งคำตอบตรงจุด `t_accept == deadline_at` พอดีถูกถือว่าหมดเวลา, response สูญหายหลัง finalize แล้วอ่าน/กู้คืนซ้ำได้ผลเดิมโดยไม่เขียน audit ซ้ำ และ evaluator ล้มเหลวคืน `503 GRADER_UNAVAILABLE` ไม่เขียนคะแนน 0 แทน ตาม AC-046-07
- `TP001-024 (ส่วน full ของ BE-031/BE-026)` · ระดับ: full — ครูนำเข้างาน Guest ที่มีประวัติผลการเรียน/ข้อสอบถูกปฏิเสธทั้งคำขอโดยไม่เกิดบางส่วน และ worker/retry ไม่สร้างผลของครู ตาม AC-036-05
- `FE-020 (ส่วน full ร่วมกับ TP001-094..096)` · ระดับ: full — หน้าจอแสดงข้อผิดพลาดฟอร์ม S2/S4 (Test ไม่ตั้งเวลา, ชนิดคำถามไม่รองรับ `409 QUESTION_KIND_UNSUPPORTED`, ผู้สร้างกดเผยแพร่เอง `409 FOUR_EYES_REQUIRED`, `approval_ref` เกิน 1,000 ตัวอักษร `400 INVALID_INPUT`), ข้อมูลชน `412 VERSION_CONFLICT` โดยไม่ทับร่างอัตโนมัติ, แถบค้างเมื่อไม่ทราบผล S3 (`timeout`/502/504) พร้อมกดตรวจผลเดิมด้วย `Idempotency-Key` เดิม, สิทธิ์ 401/403 S5 และการเข้าถึงด้วยคีย์บอร์ด/คอนทราสต์ S6 ตาม AC-046-01 และ AC-046-04

## หลักฐาน

- ข้อกำหนด: [REQ-037 (หลักสูตรและภารกิจสามโหมด)](../../modules/quiz/shared/requirements/req-037.md), [REQ-046 (Quiz/Test และคลังข้อสอบแบบ revision)](../../modules/quiz/shared/requirements/req-046.md), [REQ-036 (Guest Local และ Login Cloud)](../../modules/app-shell/shared/requirements/req-036.md)
- สัญญาออกแบบ: [DES-005 Rev12](../design/des-005.md), [DES-005 API Rev11](../design/des-005-api.md), [DES-010 Rev8](../design/des-010.md), [DES-010 API Rev6](../design/des-010-api.md), [การเก็บบน stub store Rev1](../design/des-010-stub-persistence.md), [การอ่าน Attempt Rev1](../design/learning-attempt-read-001.md), [finalization Rev1](../design/learning-attempt-finalization-001.md), [ร่างคลังข้อสอบ Rev3](../design/learning-bank-draft-001.md), [DES-012 Rev9](../design/des-012.md), [idempotency Rev4](../design/idempotency-001.md)
- UX และมติ: [UX-005 ที่อนุมัติแล้ว (int-006)](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md), [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../shared/decisions/decisions-042.md), [มติ 043 (อนุมัติ UX-005/007)](../../shared/decisions/decisions-043.md), [มติ 053 (เปิดงานบน stub และประตูของจริง)](../../shared/decisions/decisions-053.md), [มติ 054 (เลขอ้างอิงไม่เกิน 1,000 ตัวอักษร)](../../shared/decisions/decisions-054.md)
