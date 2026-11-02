# Traceability — บทเรียนและ Guest

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-037-01 (เลือก Activity ภารกิจ Block, Arm และ Code แล้วเข้าถึงเนื้อหาและภารกิจตรง…)](../requirement/req-037.md) | [TP001-054](tp-001-cases-learning.md#tp001-054) | [FE-013 (Lessons UI)](../plan/index.md)/front | [QA-004 (Learning QA)](../plan/index.md)/check | NOT_RUN |
| [AC-037-02 (เปิด Lesson แล้วเห็นเป้าหมาย คำแนะนำ และรายการ Activity…)](../requirement/req-037.md) | [TP001-054](tp-001-cases-learning.md#tp001-054) | [BE-015 (Learning API)](../plan/index.md)/sys | QA-004/check | NOT_RUN |
| [AC-037-03 (งานและผลภารกิจอ้าง Activity, Mode, Lesson และ revision ที่เรียนถูกต้อง…)](../requirement/req-037.md) | [TP001-054](tp-001-cases-learning.md#tp001-054) | BE-015/sys | QA-004/check | NOT_RUN |
| [AC-037-04 (เพียงเปิดหรือกดปิดบทเรียนไม่สร้างผลผ่านจริงโดยไม่มีการประเมินตาม REQ-038)](../requirement/req-037.md) | [TP001-055](tp-001-cases-learning.md#tp001-055) | BE-015/sys | QA-004/check | NOT_RUN |
| [AC-037-05 (เมื่อยังไม่มีหลักฐานอนุมัติเนื้อหาและเกณฑ์…)](../requirement/req-037.md) | [TP001-055](tp-001-cases-learning.md#tp001-055) | BE-027/sys | QA-004/check, QA-012/check | NOT_RUN |
| [AC-037-06 (กิจกรรมภารกิจจริงทุกโหมดอ้างกลับไปยังเนื้อหา ภารกิจ เกณฑ์…)](../requirement/req-037.md) | [TP001-055](tp-001-cases-learning.md#tp001-055) | BE-027/sys | QA-004/check, QA-012/check | NOT_RUN |
| [AC-038-01 (Code/Block ที่มีเกณฑ์ภารกิจกำหนดแล้วได้รับผลอัตโนมัติตรงกับตัวอย่างผ่านแ…)](../requirement/req-038.md) | [TP001-056](tp-001-cases-learning.md#tp001-056) | [BE-016 (Auto grading)](../plan/index.md)/sys | QA-004/check | NOT_RUN |
| [AC-038-02 (ส่งภารกิจ Arm แล้วไม่กลายเป็นผ่านเองก่อนมีผลตรวจจากครู)](../requirement/req-038.md) | [TP001-057](tp-001-cases-learning.md#tp001-057) | [BE-017 (Teacher API)](../plan/index.md)/sys | QA-004/check | NOT_RUN |
| [AC-038-03 (ครูที่มีสิทธิ์บันทึกผล Arm แล้วเรียกดูผลที่บันทึก…)](../requirement/req-038.md) | [TP001-057](tp-001-cases-learning.md#tp001-057) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-038-04 (ผล Cloud อ้างนักเรียน Activity/Mode/revision และงานถูกต้อง…)](../requirement/req-038.md) | [TP001-057](tp-001-cases-learning.md#tp001-057) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../requirement/req-038.md) | [TP001-058](tp-001-cases-learning-2.md#tp001-058), [TP001-079](tp-001-cases-boundary.md#tp001-079) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-039-01 (นักเรียน Login ทำภารกิจและได้ผลแล้ว…)](../requirement/req-039.md) | [TP001-059](tp-001-cases-learning-2.md#tp001-059) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-039-02 (ครูที่มีสิทธิ์เห็นสถานะและผลตรงกับประวัติจริงของผู้เรียนที่รับผิดชอบ)](../requirement/req-039.md) | [TP001-059](tp-001-cases-learning-2.md#tp001-059) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-039-03 (ภารกิจ Arm ที่ยังไม่ตรวจแสดงแยกจากภารกิจที่ครูยืนยันผลแล้ว)](../requirement/req-039.md) | [TP001-059](tp-001-cases-learning-2.md#tp001-059) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-039-04 (ผล Block/Arm/Code ของผู้เรียนไม่ปะปนกับบัญชีอื่นหรือค่าจาก scenario)](../requirement/req-039.md) | [TP001-059](tp-001-cases-learning-2.md#tp001-059) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../requirement/req-039.md) | [TP001-058](tp-001-cases-learning-2.md#tp001-058), [TP001-079](tp-001-cases-boundary.md#tp001-079) | BE-017/sys | QA-004/check | NOT_RUN |
| [AC-040-01 (ผู้ใช้สองคนใช้ Guest ใน OS account เดียวกัน…)](../requirement/req-040.md) | [TP001-025](tp-001-cases-guest-2.md#tp001-025) | BE-024/sys, FE-017/front | QA-011/check | NOT_RUN |
| [AC-040-02 (จบใช้งานและเปิดใหม่ รวมเมื่อผ่าน 30 วัน งานที่ไม่เคยสั่งลบยังเปิดได้)](../requirement/req-040.md) | [TP001-025](tp-001-cases-guest-2.md#tp001-025) | BE-024/sys, FE-017/front | QA-011/check | NOT_RUN |
| [AC-040-03 (ส่งออกงานแต่ละโหมดแล้วได้ไฟล์ที่เปิดกลับได้เนื้อหาเดิม และต้นฉบับ Guest…)](../requirement/req-040.md) | [TP001-025](tp-001-cases-guest-2.md#tp001-025) | BE-024/sys, FE-017/front | QA-011/check | NOT_RUN |
| [AC-040-04 (สั่งลบงานแล้วงานออกจากรายการปกติและอยู่ในถังขยะ ไม่แสดงว่าลบถาวรแล้ว)](../requirement/req-040.md) | [TP001-026](tp-001-cases-guest-2.md#tp001-026) | BE-024/sys, FE-017/front | QA-011/check | NOT_RUN |
| [AC-040-05 (กู้คืนงานก่อนครบ 30 วันนับจากสั่งลบ แล้วเปิดได้โหมด/เนื้อหาเดิม)](../requirement/req-040.md) | [TP001-026](tp-001-cases-guest-2.md#tp001-026) | BE-024/sys, FE-017/front | QA-011/check | NOT_RUN |
| [AC-040-06 (เปิดระบบโดยมีงานในถังขยะครบ 30 วันแล้ว…)](../requirement/req-040.md) | [TP001-026](tp-001-cases-guest-2.md#tp001-026) | BE-024/sys, FE-017/front | QA-011/check | NOT_RUN |
| [AC-041-01 (มีงาน Guest หลายงานแล้ว Login โดยไม่สั่งนำเข้า ไม่เกิดงานเหล่านั้นในบัญชี)](../requirement/req-041.md) | [TP001-027](tp-001-cases-guest-3.md#tp001-027) | BE-025/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-041-02 (เลือกงาน A แล้วนำเข้า บัญชีเปิด A ได้โหมดและเนื้อหาตรงต้นทาง)](../requirement/req-041.md) | [TP001-027](tp-001-cases-guest-3.md#tp001-027) | BE-025/sys, FE-018/front | QA-011/check | NOT_RUN |
| [AC-041-03 (หลังนำเข้าแต่ละโหมดสำเร็จ เปิดต้นฉบับใน Guest ได้เนื้อหาเดิม…)](../requirement/req-041.md) | [TP001-027](tp-001-cases-guest-3.md#tp001-027) | BE-025/sys, FE-018/front | QA-011/check | NOT_RUN |

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · OS = Operating System
