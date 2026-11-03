# TP-001 — setup คลังข้อสอบและประวัติสำหรับ BE-030

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — policy สี่ด้านและ snapshot ข้าม revision)

เอกสารนี้ขยาย TP001-063 (อ่าน policy) เฉพาะ AC-046-01 และ TP001-064 (ประวัติไม่เปลี่ยน) เฉพาะ AC-046-04; AC ส่วนทำข้อสอบ/override ในเคสเดิมเป็นงาน BE-031/032 คงเดิมไม่เพิ่มเกณฑ์ให้ BE-030 ใช้ DES-010 Rev7, API Rev6, bank draft Rev3, DES-012 Rev9 และ idempotency Rev1 ทุกผลจริงยัง NOT_RUN

## เงื่อนไขก่อนตรวจร่วม

ระดับ component/integration ของ service กับ adapter ใช้หนึ่ง process สอง service/adapter objects ชี้ backing store ร่วม ทำสองรอบแยก fixture: memory store object เดียว; file store objects สองตัว resolve directory เดียว ไม่แชร์ service cache ใช้ session/authority/clock/cipher fake ไม่มี SQL หรือ network เวลาเริ่ม `2026-11-03T02:00:00Z` ทุก mutation ส่ง X-Request-Id และ Idempotency-Key เป็น UUID ใหม่ เว้น retry ที่ระบุ; PUT/publish ใช้ If-Match ที่อ่านล่าสุด

actor staffAuthor (`staff_admin`, principal 1001, sEmp=101) และ staffEditor (1002/102) มี content_author; staffApprover (1003/103) มี content_approver ไม่เคยแก้ร่าง; staffWithoutRole (1004/104) ไม่มี role; schoolTeacher มี school_web, SchoolId=11, employee=201 และ authority ของ run; schoolAdmin มี school_web SchoolId=11; student มี desktop, SchoolId=11, profile=student, learner=301, classroom=401, NYear=2569, NTerm=`1` อยู่ roster ของ run; employee desktop ใช้เลข 301 ชนกับ learner แต่ kind=employee ห้ามยกสิทธิ์จากเลขที่ตรงกัน

## fixture ที่ harness ต้องสร้าง

ชื่อ `bank-096-v1.json`, `bank-096-v2.json`, `policy-096.json`, `attempt-096-history.json` เป็นชื่อ fixture ใน temporary directory ไม่ใช่ไฟล์ knowledge ที่มีแล้ว ใช้ UUID prefix `00000000-0000-4000-8000-` ต่อเลข 12 หลัก: BankKey=200, QuestionKey=201/202, option keys ข้อแรก=211/212 ข้อสอง=221/222; Text ทุกค่าใช้ `{th:ข้อความ}`

| ข้อมูล | revision 1 | revision 2 |
|---|---|---|
| ข้อ 201 single_choice | prompt=`คำถามเดิม`, options A/B; correct=211; max_score=`2` | prompt=`คำถามใหม่`, options key เดิมข้อความ A2/B2; correct=212; max_score=`7` |
| ข้อ 202 boolean | options จริง/เท็จ; correct=221; max_score=`3` | options key เดิม; correct=222; max_score=`11` |
| bank | BankKey เดียวกัน revision=1, source_ref=`fixture:bank-096-v1` | revision=2, source_ref=`fixture:bank-096-v2` |

seed ผ่าน fixture builder ก่อนเริ่มวัด: bank v1 published หนึ่งแถว, curriculum published revision 1 หนึ่งแถว, Level หนึ่ง, Lesson สอง, Activity quiz/test อย่างละหนึ่ง mode=null config question-v1 อ้าง bank v1 และ question keys ทั้งสอง; SchoolId ของเนื้อหากลาง=null มี CourseRun active หนึ่งรายการใน scope นักเรียนข้างต้น CurrentPolicyId ชี้ ScoringPolicy ที่ valid หนึ่งแถว; ไม่สร้าง row ด้วย public mutation ระหว่าง seed audit/ledger เริ่ม 0 ชัดเจน นับเฉพาะ events ของการตรวจหลัง seed

`policy-096.json` กำหนด quiz `{max_attempts:3,selection:latest,time_limit_seconds:90,reveal:after_close,shuffle_questions:true,shuffle_options:true}`; test `{max_attempts:2,selection:best,time_limit_seconds:120,reveal:after_submit,shuffle_questions:false,shuffle_options:false}` เพื่อจับการ hardcode ตามชื่อ ทั้งคู่ opens_at=`2026-11-03T01:00:00Z`, closes_at=`2026-11-03T03:00:00Z`, policy_override=null ไม่ต้องใช้ policy default ของ Test ที่ขาดเวลา

seed Attempt สองแถวของ student ใน quiz เดียว: แถวแรก submitted ตอบ 211/222 ได้ `2/5`; แถวสอง started, Answers=[], EarnedScore=null, MaxScore=5, deadline=`2026-11-03T02:01:30Z` ทั้งคู่ Snapshot สำเนา bank v1/คำถาม/เฉลย/ลำดับ `[202,201]`/ตัวเลือก/คะแนนเต็ม/policy ข้างต้น/curriculum revision1/policy_id/evaluator_version=`fixture-evaluator-v1` เริ่มเวลา 02:00:00Z; แถว submitted มี SubmittedAt=02:00:01Z นี่คือ stub ประวัติ ไม่อ้างว่าได้พิสูจน์ engine ของ BE-031

## TP001-063 → AC-046-01 — อ่าน policy ที่กำหนด

ไม่มีจุดพักหรือ inject ให้ student อ่าน `GET /v2/course-runs/{id}/activities/{activity_id}` ทั้ง quiz/test ผ่าน service test adapter และอ่านด้วย schoolTeacher ผู้มีสิทธิ์อีกครั้ง

response 200 มี effective_policy ตรง fixture ครบจำนวนครั้ง/เวลา/สุ่มข้อและตัวเลือก/เปิดเฉลย พร้อม selection และ windows; quiz แสดง 3/90/true,true/after_close และ test 2/120/false,false/after_submit จึงพิสูจน์ว่าไม่ผูกค่าตายตัวกับชื่อ ห้ามมี correct_option_keys ใน pre-start response

state หลังอ่านทุกครั้ง: bank revision=1, curriculum revision=1, Lesson=2, Activity=2, Attempt=2, audit=0, ledger=0 ทุก payload/ETag เดิม ใช้ adapter ใหม่อ่านซ้ำและเปิด file snapshot เทียบ หากไม่มี file persistence ของ bank/attempt ให้รายงาน prerequisite ขาด ไม่ทดแทนด้วย cache

## TP001-064 → AC-046-04 — revision ใหม่ไม่เปลี่ยนประวัติ

ไม่มีจุดพักหรือ inject บันทึก baseline ของ Attempt ทั้งสองจาก adapter จากนั้น staffAuthor POST bank v2 → 201 เก็บ id/ETag, PUT v2 เปลี่ยน title=`คลังใหม่ที่แก้ร่าง` โดยคง questions v2 → 200, staffApprover publish v2 ด้วย approval_ref เป็น `ก` ซ้ำ 1,000 ตัว → 200 อ่าน admin detail → 200 draft ก่อน publish/published หลัง publish พร้อม ref ตรงตัว; ref ไม่ใช่หลักฐานอนุมัติเนื้อหาจริง

ทิ้ง services/adapters/store objects แล้วเปิดใหม่จาก directory เดิม (memory สร้าง adapter ใหม่บน store เดิม ไม่เรียกว่า restart process) อ่าน bank v1/v2 และประวัติ student ผ่าน GET attempts/detail เวลา 02:00:02Z แล้วเลื่อน fake clock ถึง 03:00:00Z อ่านอีกครั้ง

response ก่อน close: quiz after_close ซ่อน earned/feedback; หลัง close แถว submitted ยังได้ `2/5` เฉลยเดิม 211/221 ลำดับเดิม, bank_revision=1/curriculum_revision=1/policy/evaluator_version เดิม; แถว started EarnedScore ยัง null ไม่กลายเป็น 0 หรือถูก regrade จาก v2 ไม่เลื่อนเวลาเกิน deadline ในขั้นนี้โดย worker จริง ให้ปิด worker ใน harness เพื่อแยกการอ่าน snapshot จากการ finalization

state หลัง bank mutations: bank=2 revisions (v1/v2 published), curriculum=1, Lesson=2, Activity=2, Attempt=2; เพิ่ม QuestionBank.Created/Updated/Published อย่างละ 1 event และ ledger=3 จาก baseline; audit Published.Reason ตรง ref 1,000 ตัว SchoolId=null; Snapshot/Answers/EarnedScore/MaxScore/ETag ของ Attempt เดิมทั้งสองไม่เปลี่ยน คลัง v1 ไม่เปลี่ยน ไม่ repoint Activity/CourseRun อัตโนมัติ ไม่ใช้ bank ล่าสุดคำนวณผล 0/18 แทน 2/5

ขอบเขต BE-030 พิสูจน์การคง snapshot ด้วย seeded Attempt และ reader/evaluator fake ที่อ่าน Snapshot เท่านั้น การเริ่ม/submit/random จริงของ BE-031 และ CourseRun integration ต้องตรวจต่างหาก ไม่อ้างผล seeded fixture เป็นหลักฐาน engine จริง

## ประตูและหลักฐานที่ต้องส่ง check

เก็บ fixture hash, response/status/ETag, barrier ถ้ามี, state ก่อน/หลังพร้อม counts และอ่านผ่าน adapter ใหม่กับ file snapshot โดยไม่เผย token/cipher plaintext ผล memory/file แยกกัน การเรียก service stub ไม่ใช่ Gateway/gRPC integration

เนื้อหาจริงรอ G-LEARN/ผู้ใช้เซ็น BA-005/006; PostgreSQL หลาย process/shared DB/rollback รอ DBA-003/G-CORE โดยผู้ใช้รัน query ที่ vault เตรียมตามมติ 053; authority/BFF/Gateway/gRPC จริงรอ H5 ไม่มีการรับความเสี่ยงเพื่อปิด gate จากผล stub เคส concurrency/negative อยู่ใน [รายละเอียด TP001-094–096](tp-001-cases-quiz-grade-races.md)

## ยังไม่ยืนยัน

ข้อความข้อสอบ/fixture evaluator/policy เป็น `(สมมติฐาน — ยังไม่ยืนยัน)` สำหรับทดสอบ ยืนยันเนื้อหาใช้งานจริงด้วย content owner และการเซ็นของผู้ใช้; ไม่อ้างว่ามี file adapter ของ bank/attempt แล้ว sys ต้องส่ง implementation ที่อ่านกลับได้ตาม setup

## หลักฐาน

- [DES-010 Rev7](../design/des-010.md), [API Rev6](../design/des-010-api.md), [bank draft Rev3](../design/learning-bank-draft-001.md), [policy Rev5](../design/des-010-policy.md), [อ่าน policy/history Rev1](../design/learning-attempt-read-001.md)
- [SchoolBotQuestionBank (หนึ่งแถวต่อ revision)](../design/data-dictionary/table-017.md), [SchoolBotAttempt (snapshot และคะแนน)](../design/data-dictionary/table-024.md), [Question และ immutable revision](../design/des-010-question-bank.md)
- [DES-012 Rev9 (ตัวตน/ช่องทาง)](../design/des-012.md), [idempotency Rev1](../design/idempotency-001.md), [มติ 054 (ref ไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md), [มติ 053 (stub/ประตู)](../../shared/decisions/decisions-053.md)
