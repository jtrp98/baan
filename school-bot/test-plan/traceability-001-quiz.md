# Traceability — ข้อสอบและ Level

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-045-01 (นำเข้าแถว D=TRUE แล้วเห็นเป็น draft…)](../requirement/req-045.md) | [TP001-062](tp-001-cases-learning-3.md#tp001-062) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-045-02 (เปลี่ยนเฉพาะ O ในข้อมูลทดสอบแล้วข้อมูลหลักสูตรที่นำเข้าไม่เปลี่ยน)](../requirement/req-045.md) | [TP001-062](tp-001-cases-learning-3.md#tp001-062) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-045-03 (แถวที่มีสื่อทั้งสองชุดแสดงสื่อครบภายใต้ Lesson เดิม โดยไม่เกิด…)](../requirement/req-045.md) | [TP001-062](tp-001-cases-learning-3.md#tp001-062) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-045-04 (นำเข้าแถวที่เลข C ไม่ตรง Unit ในชื่อแผนแล้วแสดงรหัส Lesson แยกจากทั้งสองค่า)](../requirement/req-045.md) | [TP001-062](tp-001-cases-learning-3.md#tp001-062) | BE-028/sys, FE-019/front, UX-005/int | QA-012/check | NOT_RUN |
| [AC-046-01 (เปิด Quiz และ Test แล้วตรวจ policy ทั้งสี่ด้านที่กำหนดไว้ของแต่ละรายการได้)](../requirement/req-046.md) | [TP001-063](tp-001-cases-quiz-grade.md#tp001-063) | BE-030/sys, FE-020/front, UX-005/int, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-02 (Quiz/Test ที่ไม่ปรับค่าใช้ BR-046-05)](../requirement/req-046.md) | [TP001-063](tp-001-cases-quiz-grade.md#tp001-063) | BE-031/sys, FE-021/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-03 (รายการที่กำหนดสุ่มข้อ แสดงประวัติชุดและลำดับข้อที่ผู้เรียนได้รับจริงได้)](../requirement/req-046.md) | [TP001-064](tp-001-cases-quiz-grade.md#tp001-064) | BE-031/sys, FE-021/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-04 (แก้คลังเป็น revision ใหม่แล้วประวัติการทำเดิมยังอ้าง snapshot…)](../requirement/req-046.md) | [TP001-064](tp-001-cases-quiz-grade.md#tp001-064) | BE-030/sys, FE-020/front, FE-021/front, UX-005/int, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-05 (ครูแก้เวลาสอบ/ช่วงเปิด–ปิดได้)](../requirement/req-046.md) | [TP001-063](tp-001-cases-quiz-grade.md#tp001-063) | BE-032/sys, FE-022/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-06 (เปิดซ่อมให้ A แล้ว B ไม่ได้สิทธิ์)](../requirement/req-046.md) | [TP001-065](tp-001-cases-quiz-grade.md#tp001-065) | BE-032/sys, FE-022/front, UX-007/int | QA-013/check | NOT_RUN |
| [AC-046-07 (Test 10 ข้อละ 1)](../requirement/req-046.md) | [TP001-081](tp-001-cases-boundary-2.md#tp001-081) | ไม่ระบุ owner เพิ่มในเอกสารต้นฉบับ; อ้าง plan/index.md | check | NOT_RUN |
| [AC-047-01 (ครูตั้ง A ให้นับ Quiz และ B ไม่นับ แล้วเห็นค่ารายหลักสูตร)](../requirement/req-047.md) | [TP001-066](tp-001-cases-quiz-grade.md#tp001-066) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-02 (Quiz ของ B มีผลให้ดูและน้ำหนัก 0)](../requirement/req-047.md) | [TP001-066](tp-001-cases-quiz-grade.md#tp001-066) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-03 (ครูกำหนดสัดส่วน A แล้วเรียกดูสัดส่วนที่บันทึกได้ โดยไม่เปลี่ยน B)](../requirement/req-047.md) | [TP001-066](tp-001-cases-quiz-grade.md#tp001-066) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-04 (กิจกรรม 8/10 น้ำหนัก 20%, Quiz 6/10 น้ำหนัก 30%, Test 18/20 น้ำหนัก 50%…)](../requirement/req-047.md) | [TP001-067](tp-001-cases-quiz-grade.md#tp001-067) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-047-05 (เปลี่ยนน้ำหนักจาก 20/30/50 เป็น 30/20/50 แล้ว CourseRun เดิมยังได้…)](../requirement/req-047.md) | [TP001-067](tp-001-cases-quiz-grade.md#tp001-067) | BE-033/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-01 (สิ้นเทอม roster 2 คนได้คะแนนรวม 80 และ 0 เพราะขาดทุกงาน ระบบแสดงเฉลี่ย…)](../requirement/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-02 (ก่อนครูยืนยัน Level ของห้องและนักเรียนทุกคนยังไม่เปลี่ยน)](../requirement/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-03 (ครูยืนยันข้อเสนอสิ้นเทอมแล้ว เทอมปัจจุบันไม่เปลี่ยน)](../requirement/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |
| [AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level…)](../requirement/req-048.md) | [TP001-068](tp-001-cases-quiz-grade-2.md#tp001-068) | BE-034/sys, FE-022/front, UX-007/int | QA-014/check | NOT_RUN |

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ
