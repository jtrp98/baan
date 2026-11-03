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

seed ผ่าน fixture builder ก่อนเริ่มวัด: bank v1 published หนึ่งแถว, curriculum published revision 1 หนึ่งแถว, Level หนึ่ง, Lesson สอง, Activity quiz/test อย่างละหนึ่ง mode=null config question-v1 อ้าง bank v1 และ question keys ทั้งสอง; SchoolId ของเนื้อหากลาง=null มี CourseRun active หนึ่งรายการใน scope นักเรียนข้างต้น CurrentPolicyId ชี้ ScoringPolicy หนึ่งแถว: quiz_counts=true, activity_weights quiz/test อย่างละ 5000 bps, formula_version=weighted-normalized-v1; ไม่สร้าง row ด้วย public mutation ระหว่าง seed seed audit ประวัติครบ 2 events: QuestionBank.Created โดย staffAuthor และ QuestionBank.Published โดย staffApprover (approval_ref=fixture:approved-v1, CreateDate ตรง PublishedAt) พร้อม CreateBy/UpdateBy ตามจริง; ledger เริ่ม 0; เรียกจำนวน audit baseline นี้ว่า 2 ไม่ใช่ 0 หาก case seed v2 draft เพิ่ม ต้องมี Created ของ staffAuthor อีก 1 event และ CreateBy/UpdateBy=101 จึงมี baseline audit=3 ใช้ baseline นี้ตรวจ four-eyes ไม่ทำให้ audit ขาดเพื่อให้ publish ผ่าน

`policy-096.json` กำหนด quiz `{max_attempts:3,selection:latest,time_limit_seconds:90,reveal:after_close,shuffle_questions:true,shuffle_options:true}`; test `{max_attempts:2,selection:best,time_limit_seconds:120,reveal:after_submit,shuffle_questions:false,shuffle_options:false}` เพื่อจับการ hardcode ตามชื่อ ทั้งคู่ opens_at=`2026-11-03T01:00:00Z`, closes_at=`2026-11-03T03:00:00Z`, policy_override=null ไม่ต้องใช้ policy default ของ Test ที่ขาดเวลา

seed Attempt สองแถวของ student ใน quiz เดียว: แถวแรก submitted ตอบ 211/222 ได้ `2/5`; แถวสอง started, Answers=[], EarnedScore=null, MaxScore=5, deadline=`2026-11-03T02:01:30Z` ทั้งคู่ Snapshot สำเนา bank v1/คำถาม/เฉลย/ลำดับ `[202,201]`/ตัวเลือก/คะแนนเต็ม/policy ข้างต้น/curriculum revision1/policy_id/evaluator_version=`fixture-evaluator-v1` เริ่มเวลา 02:00:00Z; แถว submitted มี SubmittedAt=02:00:01Z นี่คือ stub ประวัติ ไม่อ้างว่าได้พิสูจน์ engine ของ BE-031

ใช้ setup นี้กับ [TP001-063/064](tp-001-cases-quiz-grade-bank-cases.md), [TP001-094/095](tp-001-cases-quiz-grade-races.md) และ [TP001-096](tp-001-cases-quiz-grade-negative.md)

## ยังไม่ยืนยัน

ข้อความข้อสอบ/policy เป็น `(สมมติฐาน — ยังไม่ยืนยัน)` สำหรับทดสอบ รอ content owner และผู้ใช้เซ็นเนื้อหาจริง ไม่อ้างว่ามี file persistence ของ bank/attempt แล้ว

## หลักฐาน

- [DES-010 Rev7](../design/des-010.md), [API Rev6](../design/des-010-api.md), [bank draft Rev3](../design/learning-bank-draft-001.md), [policy Rev5](../design/des-010-policy.md), [อ่าน policy/history Rev1](../design/learning-attempt-read-001.md)
- [SchoolBotQuestionBank (หนึ่งแถวต่อ revision)](../design/data-dictionary/table-017.md), [SchoolBotAttempt (snapshot และคะแนน)](../design/data-dictionary/table-024.md), [Question และ immutable revision](../design/des-010-question-bank.md)
- [DES-012 Rev9 (ตัวตน/ช่องทาง)](../design/des-012.md), [idempotency Rev1](../design/idempotency-001.md), [มติ 054 (ref ไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md), [มติ 053 (stub/ประตู)](../../shared/decisions/decisions-053.md)
