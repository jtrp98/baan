# school-bot — requirement แต่ละข้ออยู่ในแบบไหน

[กลับสารบัญ design](index.md) · ตารางนี้บอกว่า requirement (REQ) แต่ละข้อมีสัญญาหลักหรือสัญญาร่วมอยู่ใน design (DES) ไฟล์ไหน ใช้หาว่าต้องอ่านแบบไหนเมื่อทำงานของ REQ นั้น · รายชื่อ REQ ทั้งหมดอยู่ที่[สารบัญ requirement](../../shared/requirements-index.md)

## DES ที่อ้างในตาราง

- [DES-001](des-001.md) — Desktop host และ Inter-Process Communication (IPC)
- [DES-002](des-002.md) — License และหนึ่ง Key ต่อหนึ่ง device binding
- [DES-003](des-003.md) — บันทึก/เปิดหลาย Project ระหว่าง Local และ Cloud
- [DES-004](des-004.md) — ตัวตน, session และสิทธิ์แยกตามช่องทาง
- [DES-005](des-005.md) — หลักสูตร ภารกิจ และผลประเมินสามโหมด
- [DES-006](des-006.md) — ควบคุมหุ่นจริงบน Windows/macOS
- [DES-007](des-007.md) — release และ trusted update
- [DES-008](des-008.md) — mapping หลักสูตรกับช่องคะแนน SchoolBright
- [DES-009](des-009.md) — preview/ยืนยันส่งคะแนนและป้องกันคะแนนชน
- [DES-010](des-010.md) — คลังข้อสอบ Attempt และนโยบายคะแนน
- [DES-011](des-011.md) — เสนอเลื่อน Level และครูยืนยันทั้งห้อง
- [DES-012](des-012.md) — แลก token เว็บและ authorization ข้ามระบบ

## ตาราง

| REQ | แบบที่ครอบ |
|---|---|
| [REQ-009](../../modules/app-shell/shared/requirements/req-009.md) Desktop และการใช้งานออฟไลน์ | [DES-001](des-001.md), [DES-002](des-002.md) |
| [REQ-010](../../modules/app-shell/shared/requirements/req-010.md) ภาษาของแอปและข้อมูลผู้ใช้ | [DES-001](des-001.md) |
| [REQ-011](../../modules/my-work/shared/requirements/req-011.md) บันทึกและเปิดหลายโครงงาน | [DES-003](des-003.md) |
| [REQ-012](../../modules/app-shell/shared/requirements/req-012.md) ออกจากงานและปิดหน้าต่าง | [DES-001](des-001.md), [DES-003](des-003.md), [DES-006](des-006.md) |
| [REQ-013](../../modules/app-shell/shared/requirements/req-013.md) ขอบเขต sample/preview/mock | [DES-001](des-001.md), [DES-005](des-005.md), [DES-006](des-006.md) |
| [REQ-014](../../modules/arm-lab/shared/requirements/req-014.md) ค้นหาและเชื่อมต่อหุ่น | [DES-006](des-006.md) |
| [REQ-015](../../modules/arm-lab/shared/requirements/req-015.md) โปรไฟล์หุ่นหกข้อต่อ | [DES-006](des-006.md) |
| [REQ-016](../../modules/arm-lab/shared/requirements/req-016.md) ส่งท่าและปรับข้อต่อ | [DES-006](des-006.md) |
| [REQ-017](../../modules/arm-lab/shared/requirements/req-017.md) ข้อมูลท่า ลำดับ และกลุ่ม | [DES-003](des-003.md), [DES-006](des-006.md) |
| [REQ-018](../../modules/arm-lab/shared/requirements/req-018.md) เล่นลำดับจากแอป | [DES-006](des-006.md) |
| [REQ-019](../../modules/arm-lab/shared/requirements/req-019.md) อัปโหลดท่าไปบอร์ด | [DES-006](des-006.md) |
| [REQ-020](../../modules/arm-lab/shared/requirements/req-020.md) เล่นชุดท่าบนบอร์ด | [DES-006](des-006.md) |
| [REQ-021](../../modules/arm-lab/shared/requirements/req-021.md) ขอหยุดหุ่นและยกเลิกงานค้าง | [DES-001](des-001.md), [DES-006](des-006.md) |
| [REQ-022](../../modules/arm-lab/shared/requirements/req-022.md) อ่านค่าตำแหน่ง servo | [DES-006](des-006.md) |
| [REQ-023](../../modules/arm-lab/shared/requirements/req-023.md) ปลดและล็อกแรงบิด | [DES-006](des-006.md) |
| [REQ-024](../../modules/arm-lab/shared/requirements/req-024.md) การเชื่อมต่อขาดและคำสั่งล้มเหลว | [DES-006](des-006.md) |
| [REQ-025](../../modules/code-lab/shared/requirements/req-025.md) Code Lab — เขียนและรันโปรแกรม | [DES-001](des-001.md), [DES-003](des-003.md), [DES-005](des-005.md) |
| [REQ-026](../../modules/block-lab/shared/requirements/req-026.md) สร้างและทดลองโปรแกรมบล็อก | [DES-001](des-001.md), [DES-003](des-003.md), [DES-005](des-005.md) |
| [REQ-027](../../modules/app-shell/shared/requirements/req-027.md) จัดการ license ผ่าน admin API | [DES-002](des-002.md), [DES-004](des-004.md) |
| [REQ-028](../../modules/app-shell/shared/requirements/req-028.md) Activate, validate และจำกัดอุปกรณ์ | [DES-002](des-002.md) |
| [REQ-029](../../modules/app-shell/shared/requirements/req-029.md) จัดการ release metadata | [DES-007](des-007.md) |
| [REQ-030](../../modules/app-shell/shared/requirements/req-030.md) ตรวจข้อมูลอัปเดตจาก Desktop | [DES-007](des-007.md) |
| [REQ-031](../../modules/app-shell/shared/requirements/req-031.md) ติดตั้งและดูแลแอปบน Windows | [DES-007](des-007.md) |
| [REQ-032](../../modules/app-shell/shared/requirements/req-032.md) ติดตั้งแอปบน macOS | [DES-006](des-006.md), [DES-007](des-007.md) |
| [REQ-033](../../modules/app-shell/shared/requirements/req-033.md) ชื่อและฟิลด์ข้อมูล SchoolBot | [แบบข้อมูล](data-model.md), [DES-002](des-002.md), [DES-003](des-003.md), [DES-004](des-004.md), [DES-005](des-005.md), [DES-007](des-007.md), [DES-008](des-008.md), [DES-009](des-009.md), [DES-010](des-010.md), [DES-011](des-011.md), [DES-012](des-012.md) |
| [REQ-034](../../modules/app-shell/shared/requirements/req-034.md) ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน | [DES-001](des-001.md), [DES-002](des-002.md) |
| [REQ-035](../../modules/app-shell/shared/requirements/req-035.md) ผู้ดูแลปลดเครื่องและย้าย Key เดิม | [DES-002](des-002.md) |
| [REQ-036](../../modules/app-shell/shared/requirements/req-036.md) Guest Local และ Login Cloud | [DES-003](des-003.md), [DES-004](des-004.md) |
| [REQ-037](../../modules/quiz/shared/requirements/req-037.md) หลักสูตรและภารกิจสามโหมด | [DES-005](des-005.md) |
| [REQ-038](../../modules/quiz/shared/requirements/req-038.md) ประเมิน Code/Block อัตโนมัติและ Arm โดยครู | [DES-004](des-004.md), [DES-005](des-005.md) |
| [REQ-039](../../modules/quiz/shared/requirements/req-039.md) ความคืบหน้าและการติดตามโดยครู | [DES-004](des-004.md), [DES-005](des-005.md) |
| [REQ-040](../../modules/my-work/shared/requirements/req-040.md) พื้นที่ร่วมและถังขยะ Guest | [DES-001](des-001.md), [DES-003](des-003.md) |
| [REQ-041](../../modules/my-work/shared/requirements/req-041.md) เลือกนำเข้าโครงงาน Guest | [DES-003](des-003.md), [DES-004](des-004.md) |
| [REQ-042](../../modules/my-work/shared/requirements/req-042.md) ประวัติเรียน Guest และตรวจผลใหม่ | [DES-004](des-004.md), [DES-005](des-005.md) |
| [REQ-043](../../modules/quiz/shared/requirements/req-043.md) หลักสูตรกลางแบบ Level และ Activity | [DES-005](des-005.md), [DES-010](des-010.md), [DES-012](des-012.md) |
| [REQ-044](../../modules/quiz/shared/requirements/req-044.md) รหัสบทเรียนและ revision หลักสูตร | [DES-005](des-005.md), [DES-010](des-010.md) |
| [REQ-045](../../modules/quiz/shared/requirements/req-045.md) นำเข้า Course Plan Sheet | [DES-005](des-005.md) |
| [REQ-046](../../modules/quiz/shared/requirements/req-046.md) Quiz/Test และคลังข้อสอบแบบ revision | [DES-010](des-010.md) |
| [REQ-047](../../modules/quiz/shared/requirements/req-047.md) การนับคะแนน Quiz รายหลักสูตร | [DES-010](des-010.md) |
| [REQ-048](../../modules/quiz/shared/requirements/req-048.md) เสนอและยืนยันเลื่อน Level ทั้งห้อง | [DES-011](des-011.md), [DES-012](des-012.md) |
| [REQ-049](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) Mapping หลักสูตรกับช่องคะแนน SchoolBright | [DES-008](des-008.md), [DES-012](des-012.md) |
| [REQ-050](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) Preview และยืนยันส่งคะแนนกิจกรรม | [DES-009](des-009.md), [DES-012](des-012.md) |
| [REQ-051](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) คะแนนชนและการคุ้มครองคะแนนครู | [DES-009](des-009.md), [DES-012](des-012.md) |
| [REQ-052](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) สิทธิ์ การส่งซ้ำ และ audit คะแนน | [DES-009](des-009.md), [DES-012](des-012.md) |
