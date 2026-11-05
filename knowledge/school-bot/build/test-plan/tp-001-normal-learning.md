# TP-001 — normal ของ curriculum/submission และครูทดลอง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — BE-015 และ AC-036-05 ของ BE-031)

ทุกเคสด้านล่างระดับ: normal · ชนิด integration ของ component กับ stub · ผลจริง NOT_RUN ใช้ 1 host/1 process, service/adapter สองชุด; memory ใช้ store object เดียว ส่วน file ใช้สอง store objects ที่ directory ทดสอบเดียวกัน อ่านด้วย adapter ที่สามและ file reopen หลังทิ้ง instance เดิม ไม่มี fault injection ใช้ fake clock T=2026-11-03T02:00:00Z, session/License active และ authority fake เฉพาะ test configuration ทุก mutation ใช้ UUID ใหม่และ ETag สด

## TP001-054 — Lesson และงานอ้างฉบับที่เรียน

AC-037-02 (เป้าหมาย คำแนะนำ และ Activity ตรงบทเรียน) และ AC-037-03 (งานและผลอ้าง Activity/Mode/Lesson/revision ถูกต้อง); BR-037-01–03 (โครงสร้างและหลักฐานฉบับ); DES-005 (หลักสูตรและผลประเมิน) Rev12/API Rev11

Seed published curriculum revision 1 และ 2 มี LessonKey เดียวแต่ PK/ข้อความต่างกัน ฉบับละสอง Lesson แต่ละ Lesson มี project Activity/Mission/Criteria ของ block/arm/code ที่ผูกกันแน่นอนและมีที่มา/approval fixture; SchoolId ของเนื้อหา=NULL นักเรียน student S1/sId=701 มี Cloud Project และ immutable ProjectRevision ที่ตนเป็นเจ้าของสามโหมด พร้อม roster/run ที่ผูก revision 1 Seed Submission/Assessment ที่ประเมินแล้วหนึ่งรายการต่อโหมดของ revision 1 เพื่ออ่านผลเดิม; ปิด grading worker

เรียก GET /v2/curricula/{id} ทั้งสองฉบับ แล้ว GET /v2/progress?course_run_id={runId}; ส่ง POST /v2/submissions ของแต่ละโหมดด้วย mission_id/criteria_id/project_revision_id ที่สัมพันธ์กัน อ่าน GET /v2/submissions/{id} ผ่าน reader ใหม่

คาด: GET 200 เป้าหมาย/คำแนะนำและ ordered activities ของ Lesson ตรง PK/ฉบับที่เลือก ผลเดิมย้อนผ่าน Mission→Activity→Lesson→Curriculum revision 1 และ Project.Mode ตรงโหมด POST 201 ได้ learner_id=701/mission/criteria/project revision ตามคำขอและ session; block/code เป็น queued, arm เป็น awaiting_teacher, assessment=null ไม่เปลี่ยนเป็น passed จากการส่งอย่างเดียว อ่านกลับได้ค่าเดียวกัน

Persisted state: เพิ่ม Submission สามรายการของ S1/student เท่านั้น; grading job สำหรับ automatic สองรายการ ไม่มี job automatic ของ Arm; audit/ผล idempotency ของแต่ละ submission commit ร่วมกันตาม DES-005 ไม่เพิ่ม Assessment ขณะ worker ปิด Seed ผลเดิมและเนื้อหาทั้งสองฉบับไม่เปลี่ยน ตรวจ parent links ทุกทอดจาก snapshot ไม่ถือ client score เป็นผลประเมิน

## TP001-055 — เปิด/ปิดบทเรียนไม่สร้างผล

AC-037-04 (ไม่มีผลผ่านหากยังไม่ประเมิน); BR-037-02 (บทเรียนไม่ใช่ผลการเรียน); DES-005 Rev12/grading Rev8

Fixture ใหม่จากข้างต้นแต่ไม่มี Submission/Assessment/job/Attempt เรียก GET curriculum detail และ progress จากนั้น component เปิดและปิด Lesson โดยไม่มีคำสั่งส่งงาน แล้ว GET progress ใหม่ ไม่เรียก endpoint ปิดบทเรียนที่สัญญาไม่ได้กำหนด

คาด: GET 200 เนื้อหาตรงบทเรียน progress ไม่มี latest_submission/selected_attempt ใหม่; network spy ไม่พบ POST submission/attempt และไม่แสดง passed Persisted state ของเนื้อหา/run และจำนวน Submission/Assessment/job/Attempt/audit/ledger เท่า baseline ทั้ง memory/file หลัง reopen

## TP001-024 — ครูทดลองได้แต่ไม่เกิดผล Cloud

AC-036-05 (ครูทดลอง local และเก็บ Project Cloud ได้ แต่ไม่มี submission/attempt Cloud รวม import); BR-036-04 (ไม่อัปโหลดผลครู); DES-010 Rev8/read Rev1 ร่วม DES-005 offline Rev8

ใช้ desktop employee S1/sEmp=801, License active, local host component กับ fake evaluator/engine; แยก student 701 Seed Project Cloud ของครูหนึ่งชิ้นที่บันทึกผ่านสัญญา Project ของ BE-008 แล้ว ทดลองภารกิจสามโหมดและข้อสอบ local บันทึก/เปิด Project ครูผ่าน adapter ที่ได้รับอนุญาต; ส่ง POST /v2/submissions และ /v2/attempts ด้วย payload ถูกต้องแต่ employee session และเรียก Guest history recheck/import ของ BE-026 ด้วยประวัติ local ที่ valid หนึ่งรายการ

คาด: ทดลอง local สำเร็จและผลระบุ authority local; Project Cloud อ่าน/บันทึกของตนได้ OwnerKind=employee ไม่มีการส่งผลอัตโนมัติ Direct submission/attempt และ import history ได้ 403 PROFILE_NOT_ALLOWED ก่อนเขียนผล หาก BE-026 ยังไม่เชื่อม ให้ใช้ contract adapter ส่ง actor เข้า guard เดียวกันและระบุว่าเป็น component coverage ไม่อ้าง full import integration

Persisted state: Project ของครูคงอยู่และเปลี่ยนเฉพาะเนื้อหาที่บันทึกโดยชัดแจ้ง; ไม่มี Submission/Attempt/Assessment/job/คะแนน Cloud ของครู ไม่มี success audit/idempotency ของคำขอที่ปฏิเสธ ไม่อัปโหลดบางส่วนของ history; local history คงเดิม

## สำหรับ full pass

- ระดับ: full · TP001-054 · BE-015 · สูง: ส่ง Project ผิด Mode/คน/tenant/revision และ Criteria คนละ Mission — AC-037-03
- ระดับ: full · TP001-055 · BE-015 · สูง: ปลอม client passed/score ตอนเปิดหรือปิด — AC-037-04
- ระดับ: full · TP001-024 · BE-031 · สูง: sId=sEmp ชนกัน, retry/worker/import bypass guard — AC-036-05

## หลักฐาน

[REQ-037](../../modules/quiz/shared/requirements/req-037.md) · [REQ-036](../../modules/app-shell/shared/requirements/req-036.md) · [DES-005 API](../design/des-005-api.md) · [grading](../design/des-005-grading.md) · [offline](../design/des-005-offline.md) · [DES-010/read](../design/learning-attempt-read-001.md) · [ตารางส่งต่อ](tp-001-normal-index.md)
