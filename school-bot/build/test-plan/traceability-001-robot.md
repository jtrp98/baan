# Traceability — หุ่นและ Code Lab

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ตาราง AC หลัก](traceability-001.md) ความหมาย case และระดับตรวจอยู่ใน [TP-001](tp-001.md) ทุกผลจริงเป็น NOT_RUN; owner เดิมคงตามต้นฉบับ

| AC และความหมาย | Case IDs | Implementation / role | Validation | Actual |
|---|---|---|---|---|
| [AC-018-01 (ให้สองท่าและสองรอบผ่าน test bridge แล้วพบการส่งตามลำดับเดิมครบสี่ท่า)](../../modules/arm-lab/shared/requirements/req-018.md) | [TP001-034](tp-001-cases-robot.md#tp001-034) | [FE-010 (Sequence/stop)](../plan/index.md)/front | [QA-003 (Labs QA)](../plan/index.md)/check | NOT_RUN |
| [AC-018-02 (เมื่อการส่งท่าแรกผิดพลาด ไม่มีการส่งท่าที่สองต่อ และผู้ใช้เห็นข้อผิดพลาด)](../../modules/arm-lab/shared/requirements/req-018.md) | [TP001-034](tp-001-cases-robot.md#tp001-034) | FE-010/front | QA-003/check | NOT_RUN |
| [AC-018-03 (เมื่อส่งครบและเวลาครบ แอปแสดงจบการส่งลำดับ…)](../../modules/arm-lab/shared/requirements/req-018.md) | [TP001-034](tp-001-cases-robot.md#tp001-034) | FE-010/front | QA-003/check | NOT_RUN |
| [AC-019-01 (อัปโหลดห้าท่าผ่าน test bridge แล้วพบสองคำขอ ขนาดสี่และหนึ่งท่า ตามลำดับ)](../../modules/arm-lab/shared/requirements/req-019.md) | [TP001-035](tp-001-cases-robot.md#tp001-035) | [FE-011 (Board workflow)](../plan/index.md)/front | QA-003/check | NOT_RUN |
| [AC-019-02 (ระหว่างรอคำตอบ progress ยังไม่เพิ่ม)](../../modules/arm-lab/shared/requirements/req-019.md) | [TP001-035](tp-001-cases-robot.md#tp001-035) | FE-011/front | QA-003/check | NOT_RUN |
| [AC-019-03 (เมื่อชุดแรกผิดพลาด ไม่มีชุดที่สอง และไม่มีผลยืนยันว่าข้อมูลครบหรือ…)](../../modules/arm-lab/shared/requirements/req-019.md) | [TP001-035](tp-001-cases-robot.md#tp001-035), [TP001-045](tp-001-cases-robot-3.md#tp001-045) | FE-011/front | QA-003/check | NOT_RUN |
| [AC-020-01 (เมื่อยังไม่มีชุดอัปโหลดใน session การเลือกเล่นจากบอร์ดไม่ส่งคำสั่งเริ่ม)](../../modules/arm-lab/shared/requirements/req-020.md) | [TP001-036](tp-001-cases-robot-2.md#tp001-036) | FE-011/front | QA-003/check | NOT_RUN |
| [AC-020-02 (เมื่อเลือกวนไม่สิ้นสุด ระบบไม่ส่ง group.run และแจ้งให้ระบุจำนวนรอบ)](../../modules/arm-lab/shared/requirements/req-020.md) | [TP001-036](tp-001-cases-robot-2.md#tp001-036) | FE-011/front | QA-003/check | NOT_RUN |
| [AC-020-03 (เมื่อ test bridge รับคำสั่งเริ่มสำเร็จ…)](../../modules/arm-lab/shared/requirements/req-020.md) | [TP001-036](tp-001-cases-robot-2.md#tp001-036) | FE-011/front | QA-003/check | NOT_RUN |
| [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ…)](../../modules/arm-lab/shared/requirements/req-021.md) | [TP001-037](tp-001-cases-robot-2.md#tp001-037), [TP001-045](tp-001-cases-robot-3.md#tp001-045) | FE-010/front | QA-003/check | NOT_RUN |
| [AC-021-02 (หลังหยุดแล้วปล่อยคำตอบเก่าหรือ timer ค้าง ไม่มีคำสั่งท่าถัดไปออกไป)](../../modules/arm-lab/shared/requirements/req-021.md) | [TP001-037](tp-001-cases-robot-2.md#tp001-037) | FE-010/front | QA-003/check | NOT_RUN |
| [AC-021-03 (เมื่อส่ง stop ล้มเหลว ผู้ใช้เห็นข้อผิดพลาดและไม่มีข้อความยืนยันว่าหุ่นหย…)](../../modules/arm-lab/shared/requirements/req-021.md) | [TP001-037](tp-001-cases-robot-2.md#tp001-037), [TP001-045](tp-001-cases-robot-3.md#tp001-045) | FE-010/front | QA-003/check | NOT_RUN |
| [AC-021-04 (เมื่อออกจาก native workspace ที่เชื่อมต่ออยู่ พบคำขอ stop…)](../../modules/arm-lab/shared/requirements/req-021.md) | [TP001-037](tp-001-cases-robot-2.md#tp001-037) | FE-010/front | QA-003/check | NOT_RUN |
| [AC-022-01 (เมื่อ test device ตอบ PWM ที่ถูกต้องของ ID ที่ขอ…)](../../modules/arm-lab/shared/requirements/req-022.md) | [TP001-038](tp-001-cases-robot-2.md#tp001-038) | [FE-012 (Servo/lost)](../plan/index.md)/front | QA-003/check | NOT_RUN |
| [AC-022-02 (เมื่ออ่านครบหกข้อแล้วสร้างท่าใหม่ ท่านั้นมีค่าจากคำตอบทั้งหกข้อ)](../../modules/arm-lab/shared/requirements/req-022.md) | [TP001-038](tp-001-cases-robot-2.md#tp001-038) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-022-03 (เมื่อข้อใดข้อหนึ่งไม่ตอบ ตอบผิด ID หรือเกินช่วง…)](../../modules/arm-lab/shared/requirements/req-022.md) | [TP001-038](tp-001-cases-robot-2.md#tp001-038) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-023-01 (กดปลดและล็อกผ่าน test bridge แล้วพบคำสั่ง enabled=false และ enabled=true…)](../../modules/arm-lab/shared/requirements/req-023.md) | [TP001-039](tp-001-cases-robot-2.md#tp001-039) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-023-02 (หลังปลดสำเร็จ การส่งท่า เล่น และอัปโหลดถูกกันไว้พร้อมข้อความให้ล็อกก่อน)](../../modules/arm-lab/shared/requirements/req-023.md) | [TP001-039](tp-001-cases-robot-2.md#tp001-039) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-023-03 (ขอ stop ขณะอยู่ในสถานะปลดแรงบิด แล้วพบคำขอ stop ก่อนคำขอล็อก)](../../modules/arm-lab/shared/requirements/req-023.md) | [TP001-039](tp-001-cases-robot-2.md#tp001-039) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-024-01 (จำลองอุปกรณ์หายจาก discovery ขณะ idle แล้วสถานะเปลี่ยนเป็น lost…)](../../modules/arm-lab/shared/requirements/req-024.md) | [TP001-040](tp-001-cases-robot-3.md#tp001-040), [TP001-045](tp-001-cases-robot-3.md#tp001-045) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-024-02 (จำลอง transport error ระหว่างส่งท่าแล้วเห็นข้อผิดพลาดและไม่มีการส่งท่าเด…)](../../modules/arm-lab/shared/requirements/req-024.md) | [TP001-040](tp-001-cases-robot-3.md#tp001-040), [TP001-045](tp-001-cases-robot-3.md#tp001-045) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-024-03 (เชื่อมต่อใหม่หลัง lost แล้วไม่มีคำสั่งเคลื่อนไหวจนผู้ใช้สั่ง)](../../modules/arm-lab/shared/requirements/req-024.md) | [TP001-040](tp-001-cases-robot-3.md#tp001-040) | FE-012/front | QA-003/check | NOT_RUN |
| [AC-025-01 (รันชุด move_right, jump, move_left ที่ถูกต้องแล้วได้รายการคำสั่ง จำนวน…)](../../modules/code-lab/shared/requirements/req-025.md) | [TP001-019](tp-001-cases-desktop-3.md#tp001-019) | [FE-006 (Code Lab)](../plan/index.md)/front | QA-003/check | NOT_RUN |
| [AC-025-02 (ส่งคำสั่งนอก DSL แล้วแสดงข้อผิดพลาด ไม่ดำเนินเป็น Python ทั่วไป)](../../modules/code-lab/shared/requirements/req-025.md) | [TP001-019](tp-001-cases-desktop-3.md#tp001-019) | FE-006/front | QA-003/check | NOT_RUN |
| [AC-025-03 (บันทึกแล้วเปิด source เดิมได้)](../../modules/code-lab/shared/requirements/req-025.md) | [TP001-019](tp-001-cases-desktop-3.md#tp001-019) | [FE-004 (Mode adapters)](../plan/index.md)/front | QA-003/check | NOT_RUN |

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ
