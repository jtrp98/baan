# TP-001 — policy และผลเดิมข้าม revision ของ BE-030

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — response/state TP001-063/064)

ใช้ [setup actors/stores/fixture](tp-001-cases-quiz-grade-bank.md) ทุกส่วน ระดับ component/integration บน stub ทุกผลจริง NOT_RUN

<a id="tp001-063-detail"></a>

## TP001-063 → AC-046-01 — อ่าน policy ที่กำหนด

ไม่มีจุดพักหรือ inject ให้ student อ่าน `GET /v2/course-runs/{id}/activities/{activity_id}` ทั้ง quiz/test ผ่าน service test adapter และอ่านด้วย schoolTeacher ผู้มีสิทธิ์อีกครั้ง

response 200 มี effective_policy ตรง fixture ครบจำนวนครั้ง/เวลา/สุ่มข้อและตัวเลือก/เปิดเฉลย พร้อม selection และ windows; quiz แสดง 3/90/true,true/after_close และ test 2/120/false,false/after_submit จึงพิสูจน์ว่าไม่ผูกค่าตายตัวกับชื่อ ห้ามมี correct_option_keys ใน pre-start response

state หลังอ่านทุกครั้ง: bank revision=1, curriculum revision=1, Lesson=2, Activity=2, Attempt=2, audit=2, ledger=0 ทุก payload/ETag เดิม ใช้ adapter ใหม่อ่านซ้ำและเปิด file snapshot เทียบ หากไม่มี file persistence ของ bank/attempt ให้รายงาน prerequisite ขาด ไม่ทดแทนด้วย cache

<a id="tp001-064-detail"></a>

## TP001-064 → AC-046-04 — revision ใหม่ไม่เปลี่ยนประวัติ

ไม่มีจุดพักหรือ inject บันทึก baseline ของ Attempt ทั้งสองจาก adapter จากนั้น staffAuthor POST bank v2 → 201 เก็บ id/ETag, PUT v2 เปลี่ยน title=`คลังใหม่ที่แก้ร่าง` โดยคง questions v2 → 200, staffApprover publish v2 ด้วย approval_ref เป็น `ก` ซ้ำ 1,000 ตัว → 200 อ่าน admin detail → 200 draft ก่อน publish/published หลัง publish พร้อม ref ตรงตัว; ref ไม่ใช่หลักฐานอนุมัติเนื้อหาจริง

ทิ้ง services/adapters/store objects แล้วเปิดใหม่จาก directory เดิม (memory สร้าง adapter ใหม่บน store เดิม ไม่เรียกว่า restart process) อ่าน bank v1/v2 และประวัติ student ผ่าน GET attempts/detail เวลา 02:00:02Z แล้วเลื่อน fake clock ถึง 03:00:00Z อ่านอีกครั้ง

response ก่อน close: quiz after_close ซ่อน earned/feedback; หลัง close แถว submitted ยังได้ `2/5` เฉลยเดิม 211/221 ลำดับเดิม, bank_revision=1/curriculum_revision=1/policy/evaluator_version เดิม; แถว started EarnedScore ยัง null ไม่กลายเป็น 0 หรือถูก regrade จาก v2 ปิด worker ใน harness ตลอด case เพื่อแยกการอ่าน snapshot จากการ finalization แม้เลื่อน clock เลย deadline

state หลัง bank mutations: bank=2 revisions (v1/v2 published), curriculum=1, Lesson=2, Activity=2, Attempt=2; เพิ่ม QuestionBank.Created/Updated/Published อย่างละ 1 event รวม audit=5 และ ledger=3 จาก baseline audit=2/ledger=0; audit Published.Reason ตรง ref 1,000 ตัว SchoolId=null; Snapshot/Answers/EarnedScore/MaxScore/ETag ของ Attempt เดิมทั้งสองไม่เปลี่ยน คลัง v1 ไม่เปลี่ยน ไม่ repoint Activity/CourseRun อัตโนมัติ ไม่ใช้ bank ล่าสุดคำนวณผล 0/18 แทน 2/5

ขอบเขต BE-030 พิสูจน์การคง snapshot ด้วย seeded Attempt และ reader/evaluator fake ที่อ่าน Snapshot เท่านั้น การเริ่ม/submit/random จริงของ BE-031 และ CourseRun integration ต้องตรวจต่างหาก ไม่อ้างผล seeded fixture เป็นหลักฐาน engine จริง

## ประตูและหลักฐานที่ต้องส่ง check

เก็บ fixture hash, response/status/ETag, barrier ถ้ามี, state ก่อน/หลังพร้อม counts และอ่านผ่าน adapter ใหม่กับ file snapshot โดยไม่เผย token/cipher plaintext ผล memory/file แยกกัน การเรียก service stub ไม่ใช่ Gateway/gRPC integration

เนื้อหาจริงรอ G-LEARN/ผู้ใช้เซ็น BA-005/006; PostgreSQL หลาย process/shared DB/rollback รอ DBA-003/G-CORE โดยผู้ใช้รัน query ที่ vault เตรียมตามมติ 053; authority/BFF/Gateway/gRPC จริงรอ H5 ไม่มีการรับความเสี่ยงเพื่อปิด gate จากผล stub เคส concurrency/negative อยู่ใน [TP001-094/095](tp-001-cases-quiz-grade-races.md) และ [TP001-096](tp-001-cases-quiz-grade-negative.md)

## ยังไม่ยืนยัน

ข้อความข้อสอบ/fixture evaluator/policy เป็น `(สมมติฐาน — ยังไม่ยืนยัน)` สำหรับทดสอบ ยืนยันเนื้อหาใช้งานจริงด้วย content owner และการเซ็นของผู้ใช้; ไม่อ้างว่ามี file adapter ของ bank/attempt แล้ว sys ต้องส่ง implementation ที่อ่านกลับได้ตาม setup

## หลักฐาน

- [DES-010 Rev7](../design/des-010.md), [API Rev6](../design/des-010-api.md), [bank draft Rev3](../design/learning-bank-draft-001.md), [policy Rev5](../design/des-010-policy.md), [อ่าน policy/history Rev1](../design/learning-attempt-read-001.md)
- [SchoolBotQuestionBank (หนึ่งแถวต่อ revision)](../design/data-dictionary/table-017.md), [SchoolBotAttempt (snapshot และคะแนน)](../design/data-dictionary/table-024.md), [Question และ immutable revision](../design/des-010-question-bank.md)
- [DES-012 Rev9 (ตัวตน/ช่องทาง)](../design/des-012.md), [idempotency Rev1](../design/idempotency-001.md), [มติ 054 (ref ไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md), [มติ 053 (stub/ประตู)](../../shared/decisions/decisions-053.md)
