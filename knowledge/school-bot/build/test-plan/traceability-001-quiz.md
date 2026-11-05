# Traceability — ข้อสอบและ Level

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — เพิ่มเคส normal ของ BE-031 และ FE-020 และปรับสถานะสัญญา BE-028/030)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) และ [ตาราง normal](tp-001-normal-index.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-045-01 (นำเข้าแถว D=TRUE แล้วเห็นเป็น draft…)](../../modules/quiz/shared/requirements/req-045.md) | [TP001-062](tp-001-cases-quiz-grade-import-cases.md#tp001-062-detail), [TP001-093](tp-001-cases-quiz-grade-import-cases.md#tp001-093) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-045-02 (เปลี่ยนเฉพาะ O ในข้อมูลทดสอบแล้วข้อมูลหลักสูตรที่นำเข้าไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-045.md) | [TP001-062](tp-001-cases-quiz-grade-import-cases.md#tp001-062-detail), [TP001-093](tp-001-cases-quiz-grade-import-cases.md#tp001-093) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-045-03 (แถวที่มีสื่อทั้งสองชุดแสดงสื่อครบภายใต้ Lesson เดิม โดยไม่เกิด…)](../../modules/quiz/shared/requirements/req-045.md) | [TP001-062](tp-001-cases-quiz-grade-import-cases.md#tp001-062-detail), [TP001-093](tp-001-cases-quiz-grade-import-cases.md#tp001-093) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-045-04 (นำเข้าแถวที่เลข C ไม่ตรง Unit ในชื่อแผนแล้วแสดงรหัส Lesson แยกจากทั้งสองค่า)](../../modules/quiz/shared/requirements/req-045.md) | [TP001-062](tp-001-cases-quiz-grade-import-cases.md#tp001-062-detail), [TP001-093](tp-001-cases-quiz-grade-import-cases.md#tp001-093) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-046-01 (เปิด Quiz และ Test แล้วตรวจ policy ทั้งสี่ด้านที่กำหนดไว้ของแต่ละรายการได้)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-063](tp-001-cases-quiz-grade-bank-cases.md#tp001-063-detail), [TP001-119](tp-001-normal-learning-quiz.md#tp001-119), [TP001-096](tp-001-cases-quiz-grade-negative.md#tp001-096) | BE-030/sys, FE-020/front, UX-005/int, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-02 (Quiz/Test ที่ไม่ปรับค่าใช้ BR-046-05)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-117](tp-001-normal-learning-quiz.md#tp001-117), [TP001-063](tp-001-cases-quiz-grade.md#tp001-063) | BE-031/sys, FE-021/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-03 (รายการที่กำหนดสุ่มข้อ แสดงประวัติชุดและลำดับข้อที่ผู้เรียนได้รับจริงได้)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-118](tp-001-normal-learning-quiz.md#tp001-118), [TP001-064](tp-001-cases-quiz-grade.md#tp001-064) | BE-031/sys, FE-021/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-04 (แก้คลังเป็น revision ใหม่แล้วประวัติการทำเดิมยังอ้าง snapshot…)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-064](tp-001-cases-quiz-grade-bank-cases.md#tp001-064-detail), [TP001-120](tp-001-normal-learning-quiz.md#tp001-120), [TP001-094](tp-001-cases-quiz-grade-races.md#tp001-094), [TP001-095](tp-001-cases-quiz-grade-races.md#tp001-095), [TP001-096](tp-001-cases-quiz-grade-negative.md#tp001-096) | BE-030/sys, FE-020/front, FE-021/front, UX-005/int, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-05 (ครูแก้เวลาสอบ/ช่วงเปิด–ปิดได้)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-063](tp-001-cases-quiz-grade.md#tp001-063) | BE-032/sys, FE-022/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-06 (เปิดซ่อมให้ A แล้ว B ไม่ได้สิทธิ์)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-065](tp-001-cases-quiz-grade.md#tp001-065) | BE-032/sys, FE-022/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-07 (Test 10 ข้อละ 1)](../../modules/quiz/shared/requirements/req-046.md) | [TP001-081](tp-001-cases-boundary-2.md#tp001-081) ([normal](tp-001-normal-learning-quiz.md#tp001-081-normal)) | BE-031/sys (ตามใบงาน 097; ต้นฉบับอ้าง plan/index.md) | check | NOT_RUN |
| [AC-047-01 (ครูตั้ง A ให้นับ Quiz และ B ไม่นับ แล้วเห็นค่ารายหลักสูตร)](../../modules/quiz/shared/requirements/req-047.md) | [TP001-066](tp-001-cases-quiz-grade.md#tp001-066) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-02 (Quiz ของ B มีผลให้ดูและน้ำหนัก 0)](../../modules/quiz/shared/requirements/req-047.md) | [TP001-066](tp-001-cases-quiz-grade.md#tp001-066) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-03 (ครูกำหนดสัดส่วน A แล้วเรียกดูสัดส่วนที่บันทึกได้ โดยไม่เปลี่ยน B)](../../modules/quiz/shared/requirements/req-047.md) | [TP001-066](tp-001-cases-quiz-grade.md#tp001-066) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-04 (กิจกรรม 8/10 น้ำหนัก 20%, Quiz 6/10 น้ำหนัก 30%, Test 18/20 น้ำหนัก 50%…)](../../modules/quiz/shared/requirements/req-047.md) | [TP001-067](tp-001-cases-quiz-grade.md#tp001-067) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-05 (เปลี่ยนน้ำหนักจาก 20/30/50 เป็น 30/20/50 แล้ว CourseRun เดิมยังได้…)](../../modules/quiz/shared/requirements/req-047.md) | [TP001-067](tp-001-cases-quiz-grade.md#tp001-067) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-01 (สิ้นเทอม roster 2 คนได้คะแนนรวม 80 และ 0 เพราะขาดทุกงาน ระบบแสดงเฉลี่ย…)](../../modules/quiz/shared/requirements/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-02 (ก่อนครูยืนยัน Level ของห้องและนักเรียนทุกคนยังไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-03 (ครูยืนยันข้อเสนอสิ้นเทอมแล้ว เทอมปัจจุบันไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level…)](../../modules/quiz/shared/requirements/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |

## ขอบเขตตรวจรับ BE-028 / BE-030 / BE-031 / FE-020

- BE-028 ใช้ [fixture importer](tp-001-cases-quiz-grade-import.md) และ [เคส TP001-062/093](tp-001-cases-quiz-grade-import-cases.md) ตามสัญญา [import Rev2](../design/des-005-import.md) และ [state Rev1](../design/des-005-import-state.md)
- BE-030 ใช้ [fixture/stores](tp-001-cases-quiz-grade-bank.md) และ [TP001-063/064](tp-001-cases-quiz-grade-bank-cases.md) สำหรับระดับ normal ส่วน race/replay/input ผิดอยู่ใน [TP001-094/095](tp-001-cases-quiz-grade-races.md) และ [TP001-096](tp-001-cases-quiz-grade-negative.md)
- BE-031 และ FE-020 ใช้ [เคส normal บน stub (TP001-117..120, TP001-081 และ TP001-024)](tp-001-normal-learning-quiz.md) ร่วมกับ [การเก็บบน stub store ของ DES-010 Rev1](../design/des-010-stub-persistence.md) (`attempts` อยู่ใน `CurriculumStoreSnapshot`) ทุกผลจริงยังเป็น NOT_RUN

G-LEARN รอเนื้อหาที่มนุษย์เซ็นรับ; PostgreSQL/หลาย OS processes รอ DBA-003/G-CORE; authority/transport จริงรอ H5 ตามมติ 053 ไม่มีการรับความเสี่ยงแทนการปิดประตู ส่วนที่เริ่มบน stub ได้ไม่ต้องรอประตูระบบจริง

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ


## หลักฐาน

- [DES-005 Rev12](../design/des-005.md), [import Rev2](../design/des-005-import.md), [DES-010 Rev8](../design/des-010.md), [API Rev6](../design/des-010-api.md), [stub persistence Rev1](../design/des-010-stub-persistence.md), [bank draft Rev3](../design/learning-bank-draft-001.md), [DES-012 Rev9](../design/des-012.md), [idempotency Rev4](../design/idempotency-001.md)
- [UX-005 ที่อนุมัติแล้ว (int-006)](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-curriculum.md), [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../shared/decisions/decisions-042.md), [มติ 053 (stub และประตูจริง)](../../shared/decisions/decisions-053.md), [มติ 054 (ref ไม่เกิน 1,000 ตัว)](../../shared/decisions/decisions-054.md)
