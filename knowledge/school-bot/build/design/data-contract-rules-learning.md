# กฎเนื้อหากลางและผลเรียน

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](data-contract-rules.md)

กฎในตารางเป็น invariants ที่ application ต้องรักษา ร่าง SQL คงเฉพาะ PRIMARY KEY และไม่มี UNIQUE/FK/CHECK การบังคับด้วย repository locks ยังไม่มี runtime evidence อ่าน [กฎการล็อกและ commit](data-contract-rules-transactions.md) ร่วมด้วย

| กลุ่ม | กฎ |
|---|---|
| Level / PromotionPolicy | global (`SchoolId=null`); `LevelKey`, `Code`, `Ordinal` unique (`RULE_UNIQUE_SchoolBotLevel_*`); `LevelPromotionPolicy` unique `(LevelId,Revision)` (`RULE_UNIQUE_SchoolBotLevelPromotionPolicy_Level_Revision`), `Threshold` ช่วง `0..100`, Level ใหม่ต้องมี revision 1 = `70`; immutable ต่อ revision |
| Curriculum | global (`SchoolId=null`); ถอน `Curriculum.Mode`; unique `(CurriculumKey,Revision)` (`RULE_UNIQUE_SchoolBotCurriculum_Key_Revision`); อ้าง `LevelId`; published content และ children immutable; publish ต้องผ่าน four-eyes (ผู้สร้างอนุมัติเองไม่ได้ ตาม [มติ 025 ( auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../../shared/decisions/decisions-025.md)) |
| Lesson/Mission/Activity | global (`SchoolId=null`); unique `(CurriculumId,LessonKey)`, `(CurriculumId,Ordinal)`, `(LessonId,MissionKey)`, `(LessonId,Ordinal)`, `(LessonId,ActivityKey)`, `(LessonId,Ordinal)` ของ Activity; `Activity.Type=project` ⇔ `Mode` not null (`instruction\|quiz\|test` ใช้ `Mode=null`) |
| Criteria | global (`SchoolId=null`); unique `(MissionId,Revision)` (`RULE_UNIQUE_SchoolBotCriteria_Mission_Revision`); publish ต้อง `ApprovedBy/At` ครบและ `Method` ตรง `Activity.Mode` ของ project mission; numeric rubric ต้องมี approved scorer ก่อนใช้ส่งคะแนน; immutable เมื่อถูก publish/ใช้ส่งงาน |
| QuestionBank | global (`SchoolId=null`); unique `(BankKey,Revision)` (`RULE_UNIQUE_SchoolBotQuestionBank_BankKey_Revision`); ชนิดข้อสอบรุ่นแรก `single_choice\|boolean`; publish ต้องผ่าน four-eyes; immutable เมื่อ publish |
| CourseRun / Policy / RunActivity | tenant (`SchoolId>0`); `PlanCourseIds` มี ≥1 รายการ ไม่ซ้ำ ไม่มี `NULL` และอยู่ในห้อง/เทอมของ run; มี active run (`planned\|active\|closing`) ได้หนึ่งเดียวต่อ `(SchoolId,ClassroomId,NYear,NTerm)` (กฎ active run ผ่าน transaction lock บน `(SchoolId,ClassroomId,NYear,NTerm)`) และมี successor ได้หนึ่งเดียวต่อ `PreviousRunId` (กฎ successor ผ่าน transaction lock บน CourseRun ต้นทางที่ `PreviousRunId` อ้าง); `ScoringPolicy` (ไม่มี `CurriculumId` เพราะอ่านจาก `CourseRun.CurriculumId` ตาม review-005) unique `(CourseRunId,Revision)` (`RULE_UNIQUE_SchoolBotScoringPolicy_CourseRun_Revision`) และ immutable; `CourseRunActivity` unique `(CourseRunId,ActivityId)` (`RULE_UNIQUE_SchoolBotCourseRunActivity_Run_Activity`) และ `ClosesAt>OpensAt` เมื่อมีทั้งคู่ |
| Submission / GradingJob | tenant (`SchoolId>0`); ใน schema ปัจจุบันอนุญาตเฉพาะนักเรียน (`ProfileKind=student`, `LearnerId=sId`) โดย application ต้องตรวจว่า `ProjectRevisionId` เป็นของ `SchoolBotProject` ที่ `OwnerKind='student'`, `OwnerId=LearnerId` และ `SchoolId` เดียวกัน (เพื่อป้องกัน `sEmp` ของครูบน Desktop ชนกับ `sId` นักเรียน — ดูข้อเสนอทางเลือกในหลักฐานท้ายไฟล์), ตรวจว่า `CriteriaId` เป็นของ `MissionId` เดียวกัน และ `Project.Mode` ตรง `Activity.Mode` ของ mission นั้น; `GradingJob` unique `SubmissionId` (`RULE_UNIQUE_SchoolBotGradingJob_SubmissionId`) |
| Assessment | tenant (`SchoolId>0`); การสร้างผลประเมินใหม่ต้องล็อกแถวแม่ `SchoolBotSubmission` (`SELECT ... FOR UPDATE`) เพื่อกำหนด `Sequence` ถัดไปและตรวจว่า `SupersedesId` อยู่ `SubmissionId` เดียวกันและ `SchoolId` เดียวกัน (ใน SQL ตัด `RULE_UNIQUE_SchoolBotAssessment_Submission_Sequence` ตาม review-005); `CurrentAssessmentId` ชี้ผลล่าสุด (ตรวจในแอป ไม่ใช่ FK); `EarnedScore/MaxScore` ต้อง null พร้อมกัน หรือ `0<=EarnedScore<=MaxScore` และ `MaxScore>0`; automatic มี `GraderVersion` และ `AssessorId=null`; teacher กลับกัน |
| Attempt / RetakeGrant | tenant (`SchoolId>0`); ใน schema ปัจจุบันอนุญาตเฉพาะนักเรียน (`ProfileKind=student`, `LearnerId=sId` ในห้องของ `CourseRun`) เพื่อกัน `sEmp` ครูชน `sId` นักเรียน; ก่อนเริ่ม `Attempt` ต้องล็อกแถว/counter ของผู้เรียนเพื่อตรวจเพดานและกำหนด `Sequence` ถัดไป (ใน SQL ตัด `RULE_UNIQUE_SchoolBotAttempt_Learner_Seq` ตาม review-005), `Snapshot` immutable; `RetakeGrant` เพิ่มสิทธิ์สอบซ่อม 1 ครั้งต่อใบ โดยสอบซ่อม Test ใช้คะแนนสูงสุดระหว่างครั้งจริงกับครั้งซ่อม ไม่มีเพดาน (decisions-025) |

## หลักฐาน

- db/proposal-learnerkind.md (memory): ทางเลือกที่เคยพิจารณาเพื่อแยกรหัสครูกับนักเรียน
- db/review-005.md (memory): การถอนคอลัมน์ซ้ำและข้อบังคับ Sequence
