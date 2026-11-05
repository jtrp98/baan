# Traceability — Desktop และโครงงาน

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-009-01 (เริ่มแอปโดยไม่เคยใส่ License แล้วเข้าใช้งาน Block Lab, Arm Lab และ Code…)](../../modules/app-shell/shared/requirements/req-009.md) | [TP001-001](tp-001-cases-license.md#tp001-001), [TP001-077](tp-001-cases-boundary.md#tp001-077) | [FE-001 (License UI)](../plan/index.md)/front | [QA-001 (License QA)](../plan/index.md)/check | NOT_RUN |
| [AC-009-02 (เลือก Guest หรือ Login โดยยังไม่มี License แล้วไม่สามารถข้ามข้อกำหนด…)](../../modules/app-shell/shared/requirements/req-009.md) | [TP001-001](tp-001-cases-license.md#tp001-001) | FE-001/front | QA-001/check | NOT_RUN |
| [AC-009-03 (ใน Desktop ผู้ใช้ย่อ สลับเต็มจอ และขอปิดหน้าต่างจากแอปได้)](../../modules/app-shell/shared/requirements/req-009.md) | [TP001-011](tp-001-cases-desktop.md#tp001-011), [TP001-077](tp-001-cases-boundary.md#tp001-077) | [FE-005 (Shell/i18n)](../plan/index.md)/front | [QA-002 (Projects QA)](../plan/index.md)/check | NOT_RUN |
| [AC-010-01 (ผู้ใช้เปลี่ยนไทย/อังกฤษ/จีนได้โดยไม่ต่อเครือข่าย…)](../../modules/app-shell/shared/requirements/req-010.md) | [TP001-012](tp-001-cases-desktop.md#tp001-012), [TP001-077](tp-001-cases-boundary.md#tp001-077) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-010-02 (หลังเปลี่ยนภาษา งานที่ยังไม่บันทึก ลำดับบล็อก…)](../../modules/app-shell/shared/requirements/req-010.md) | [TP001-012](tp-001-cases-desktop.md#tp001-012) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-010-03 (เมื่อ storage ใช้งานได้ เปิดแอปใหม่แล้วใช้ภาษาที่เลือกครั้งล่าสุด)](../../modules/app-shell/shared/requirements/req-010.md) | [TP001-012](tp-001-cases-desktop.md#tp001-012) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-011-01 (บันทึกอย่างน้อยสองงานต่อโหมด Block/Arm/Code ทั้ง Guest และ Login…)](../../modules/my-work/shared/requirements/req-011.md) | [TP001-015](tp-001-cases-desktop.md#tp001-015), [TP001-016](tp-001-cases-desktop-2.md#tp001-016) | [BE-008 (Cloud projects)](../plan/index.md)/sys | QA-002/check | NOT_RUN |
| [AC-011-02 (บันทึกการแก้ไขงาน A แล้วเปิดใหม่ได้ค่าล่าสุดของ A โดยงาน B…)](../../modules/my-work/shared/requirements/req-011.md) | [TP001-015](tp-001-cases-desktop.md#tp001-015), [TP001-016](tp-001-cases-desktop-2.md#tp001-016), [TP001-077](tp-001-cases-boundary.md#tp001-077) | BE-008/sys | QA-002/check | NOT_RUN |
| [AC-011-03 (เปิดไฟล์ JSON เสียหรือเกิน 1 MiB แล้วมีข้อผิดพลาด)](../../modules/my-work/shared/requirements/req-011.md) | [TP001-017](tp-001-cases-desktop-2.md#tp001-017) | BE-008/sys | QA-002/check | NOT_RUN |
| [AC-011-04 (เมื่อมีข้อมูลทั้งชื่อแอปเก่าและใหม่ การเริ่มแอปไม่ทับข้อมูลใหม่)](../../modules/my-work/shared/requirements/req-011.md) | [TP001-017](tp-001-cases-desktop-2.md#tp001-017) | [BE-009 (Local projects)](../plan/index.md)/sys | QA-002/check | NOT_RUN |
| [AC-012-01 (เมื่ออยู่ระหว่างทำงานใน mode แล้วเลือก mode อื่น มีคำยืนยัน)](../../modules/app-shell/shared/requirements/req-012.md) | [TP001-013](tp-001-cases-desktop.md#tp001-013) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-012-02 (เมื่อเลือก Save แล้วออกและจำลอง storage ล้มเหลว…)](../../modules/app-shell/shared/requirements/req-012.md) | [TP001-013](tp-001-cases-desktop.md#tp001-013) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-012-03 (เมื่อจำลอง close guard ล้มเหลว หน้าต่างยังเปิดและแสดงเหตุผลให้ผู้ใช้เห็น)](../../modules/app-shell/shared/requirements/req-012.md) | [TP001-013](tp-001-cases-desktop.md#tp001-013) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-013-01 (เปิด browser โดยไม่มี preview=1 และไม่มี bridge แล้วพบข้อผิดพลาด native…)](../../modules/app-shell/shared/requirements/req-013.md) | [TP001-014](tp-001-cases-desktop.md#tp001-014) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-013-02 (ใน preview บันทึกงานได้ใน browser แต่ activate และตรวจอัปเดตไม่เรียก API…)](../../modules/app-shell/shared/requirements/req-013.md) | [TP001-014](tp-001-cases-desktop.md#tp001-014) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-013-03 (ทดลอง LearnMap, Teacher restart/reset/console และ USB…)](../../modules/app-shell/shared/requirements/req-013.md) | [TP001-014](tp-001-cases-desktop.md#tp001-014) | FE-005/front | QA-002/check | NOT_RUN |
| [AC-014-01 (เปิด native ใหม่แล้วไม่แสดงว่าหุ่นเชื่อมต่ออยู่โดยอัตโนมัติ)](../../modules/arm-lab/shared/requirements/req-014.md) | [TP001-031](tp-001-cases-robot.md#tp001-031) | [FE-008 (Connect/profile)](../plan/index.md)/front | [QA-003 (Labs QA)](../plan/index.md)/check | NOT_RUN |
| [AC-014-02 (เมื่อไม่เลือกอุปกรณ์หรือไม่ยืนยันโปรไฟล์ การกดเชื่อมต่อไม่สำเร็จ)](../../modules/arm-lab/shared/requirements/req-014.md) | [TP001-031](tp-001-cases-robot.md#tp001-031) | FE-008/front | QA-003/check | NOT_RUN |
| [AC-014-03 (ใช้ test device ที่ไม่ตอบ probe แล้วไม่เข้าสถานะ connected)](../../modules/arm-lab/shared/requirements/req-014.md) | [TP001-031](tp-001-cases-robot.md#tp001-031), [TP001-045](tp-001-cases-robot-3.md#tp001-045) | FE-008/front | QA-003/check | NOT_RUN |
| [AC-015-01 (โปรไฟล์ที่มี ID ซ้ำ, servo ไม่ครบหก, PWM นอกช่วง หรือปลาย PWM เท่ากัน…)](../../modules/arm-lab/shared/requirements/req-015.md) | [TP001-032](tp-001-cases-robot.md#tp001-032) | FE-008/front | QA-003/check | NOT_RUN |
| [AC-015-02 (โปรไฟล์ที่ถูกต้องและกำหนด PWM กลับทิศผ่านการตรวจรูปแบบได้)](../../modules/arm-lab/shared/requirements/req-015.md) | [TP001-032](tp-001-cases-robot.md#tp001-032) | FE-008/front | QA-003/check | NOT_RUN |
| [AC-015-03 (เมื่อแก้ชื่อโปรไฟล์หรือค่า servo หลังยืนยัน ต้องยืนยันใหม่ก่อนเชื่อมต่อ)](../../modules/arm-lab/shared/requirements/req-015.md) | [TP001-032](tp-001-cases-robot.md#tp001-032) | FE-008/front | QA-003/check | NOT_RUN |
| [AC-016-01 (เมื่อ disconnected หรือปลดแรงบิด…)](../../modules/arm-lab/shared/requirements/req-016.md) | [TP001-033](tp-001-cases-robot.md#tp001-033) | [FE-009 (Pose queue)](../plan/index.md)/front | QA-003/check | NOT_RUN |
| [AC-016-02 (เมื่อจำลองการส่งล้มเหลว ภาพไม่เริ่มเคลื่อนไปตามท่าราวกับส่งสำเร็จ…)](../../modules/arm-lab/shared/requirements/req-016.md) | [TP001-033](tp-001-cases-robot.md#tp001-033) | FE-009/front | QA-003/check | NOT_RUN |
| [AC-016-03 (ปรับข้อต่อถี่ผ่าน test bridge แล้ว trace มีคำสั่งทำงานครั้งละหนึ่งรายการ)](../../modules/arm-lab/shared/requirements/req-016.md) | [TP001-033](tp-001-cases-robot.md#tp001-033) | FE-009/front | QA-003/check | NOT_RUN |

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ
