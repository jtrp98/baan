---
owner: spec
---
# ข้อกำหนด SchoolBot

> แก้ล่าสุด 2026-11-02 · แก้โดย spec · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่)

SchoolBot มีข้อกำหนด 44 รายการและเกณฑ์ตรวจรับ 187 ข้อ ครอบคลุมแอป Desktop การควบคุมหุ่น การเรียนรู้ License และการเชื่อมระบบโรงเรียน สถานะข้อกำหนดเก็บในตารางนี้เท่านั้น

REQ (Requirement) คือข้อกำหนด ส่วน AC (Acceptance Criteria) คือเกณฑ์ตรวจรับ เปิดไฟล์แต่ละรายการเพื่ออ่านกฎธุรกิจ เกณฑ์ตรวจรับ แหล่งยืนยัน และสมมติฐานที่ยังไม่ยืนยัน

| ID | ชื่อ | สถานะ | จำนวน AC | ไฟล์ |
|---|---|---|---:|---|
| REQ-009 | Desktop และการใช้งานออฟไลน์ | DRAFT | 3 | [req-009.md](../modules/app-shell/shared/requirements/req-009.md) |
| REQ-010 | ภาษาของแอปและข้อมูลผู้ใช้ | DRAFT | 3 | [req-010.md](../modules/app-shell/shared/requirements/req-010.md) |
| REQ-011 | บันทึกและเปิดหลายโครงงาน | DRAFT | 4 | [req-011.md](../modules/my-work/shared/requirements/req-011.md) |
| REQ-012 | ออกจากงานและปิดหน้าต่าง | DRAFT | 3 | [req-012.md](../modules/app-shell/shared/requirements/req-012.md) |
| REQ-013 | ขอบเขต sample/preview/mock | DRAFT | 3 | [req-013.md](../modules/app-shell/shared/requirements/req-013.md) |
| REQ-014 | ค้นหาและเชื่อมต่อหุ่น | DRAFT | 3 | [req-014.md](../modules/arm-lab/shared/requirements/req-014.md) |
| REQ-015 | โปรไฟล์หุ่นหกข้อต่อ | DRAFT | 3 | [req-015.md](../modules/arm-lab/shared/requirements/req-015.md) |
| REQ-016 | ส่งท่าและปรับข้อต่อ | DRAFT | 3 | [req-016.md](../modules/arm-lab/shared/requirements/req-016.md) |
| REQ-017 | ข้อมูลท่า ลำดับ และกลุ่ม | DRAFT | 3 | [req-017.md](../modules/arm-lab/shared/requirements/req-017.md) |
| REQ-018 | เล่นลำดับจากแอป | DRAFT | 3 | [req-018.md](../modules/arm-lab/shared/requirements/req-018.md) |
| REQ-019 | อัปโหลดท่าไปบอร์ด | DRAFT | 3 | [req-019.md](../modules/arm-lab/shared/requirements/req-019.md) |
| REQ-020 | เล่นชุดท่าบนบอร์ด | DRAFT | 3 | [req-020.md](../modules/arm-lab/shared/requirements/req-020.md) |
| REQ-021 | ขอหยุดหุ่นและยกเลิกงานค้าง | DRAFT | 4 | [req-021.md](../modules/arm-lab/shared/requirements/req-021.md) |
| REQ-022 | อ่านค่าตำแหน่ง servo | DRAFT | 3 | [req-022.md](../modules/arm-lab/shared/requirements/req-022.md) |
| REQ-023 | ปลดและล็อกแรงบิด | DRAFT | 3 | [req-023.md](../modules/arm-lab/shared/requirements/req-023.md) |
| REQ-024 | การเชื่อมต่อขาดและคำสั่งล้มเหลว | DRAFT | 3 | [req-024.md](../modules/arm-lab/shared/requirements/req-024.md) |
| REQ-025 | Code Lab — เขียนและรันโปรแกรม | DRAFT | 3 | [req-025.md](../modules/code-lab/shared/requirements/req-025.md) |
| REQ-026 | สร้างและทดลองโปรแกรมบล็อก | DRAFT | 4 | [req-026.md](../modules/block-lab/shared/requirements/req-026.md) |
| REQ-027 | จัดการ license ผ่าน admin API | DRAFT | 4 | [req-027.md](../modules/app-shell/shared/requirements/req-027.md) |
| REQ-028 | Activate, validate และจำกัดอุปกรณ์ | DRAFT | 4 | [req-028.md](../modules/app-shell/shared/requirements/req-028.md) |
| REQ-029 | จัดการ release metadata | DRAFT | 3 | [req-029.md](../modules/app-shell/shared/requirements/req-029.md) |
| REQ-030 | ตรวจข้อมูลอัปเดตจาก Desktop | DRAFT | 8 | [req-030.md](../modules/app-shell/shared/requirements/req-030.md) |
| REQ-031 | ติดตั้งและดูแลแอปบน Windows | DRAFT | 5 | [req-031.md](../modules/app-shell/shared/requirements/req-031.md) |
| REQ-032 | ติดตั้งแอปบน macOS | DRAFT | 3 | [req-032.md](../modules/app-shell/shared/requirements/req-032.md) |
| REQ-033 | ชื่อและฟิลด์ข้อมูล SchoolBot | DRAFT | 5 | [req-033.md](../modules/app-shell/shared/requirements/req-033.md) |
| REQ-034 | ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน | DRAFT | 6 | [req-034.md](../modules/app-shell/shared/requirements/req-034.md) |
| REQ-035 | ผู้ดูแลปลดเครื่องและย้าย Key เดิม | DRAFT | 5 | [req-035.md](../modules/app-shell/shared/requirements/req-035.md) |
| REQ-036 | Guest Local และ Login Cloud | DRAFT | 6 | [req-036.md](../modules/app-shell/shared/requirements/req-036.md) |
| REQ-037 | หลักสูตรและภารกิจสามโหมด | DRAFT | 6 | [req-037.md](../modules/quiz/shared/requirements/req-037.md) |
| REQ-038 | ประเมิน Code/Block อัตโนมัติและ Arm โดยครู | DRAFT | 5 | [req-038.md](../modules/quiz/shared/requirements/req-038.md) |
| REQ-039 | ความคืบหน้าและการติดตามโดยครู | DRAFT | 5 | [req-039.md](../modules/quiz/shared/requirements/req-039.md) |
| REQ-040 | พื้นที่ร่วมและถังขยะ Guest | DRAFT | 6 | [req-040.md](../modules/my-work/shared/requirements/req-040.md) |
| REQ-041 | เลือกนำเข้าโครงงาน Guest | DRAFT | 5 | [req-041.md](../modules/my-work/shared/requirements/req-041.md) |
| REQ-042 | ประวัติเรียน Guest และตรวจผลใหม่ | DRAFT | 6 | [req-042.md](../modules/my-work/shared/requirements/req-042.md) |
| REQ-043 | หลักสูตรกลางแบบ Level และ Activity | DRAFT | 4 | [req-043.md](../modules/quiz/shared/requirements/req-043.md) |
| REQ-044 | รหัสบทเรียนและ revision หลักสูตร | DRAFT | 5 | [req-044.md](../modules/quiz/shared/requirements/req-044.md) |
| REQ-045 | นำเข้า Course Plan Sheet | DRAFT | 4 | [req-045.md](../modules/quiz/shared/requirements/req-045.md) |
| REQ-046 | Quiz/Test และคลังข้อสอบแบบ revision | DRAFT | 7 | [req-046.md](../modules/quiz/shared/requirements/req-046.md) |
| REQ-047 | การนับคะแนน Quiz รายหลักสูตร | DRAFT | 5 | [req-047.md](../modules/quiz/shared/requirements/req-047.md) |
| REQ-048 | เสนอและยืนยันเลื่อน Level ทั้งห้อง | DRAFT | 4 | [req-048.md](../modules/quiz/shared/requirements/req-048.md) |
| REQ-049 | Mapping หลักสูตรกับช่องคะแนน SchoolBright | DRAFT | 5 | [req-049.md](../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) |
| REQ-050 | Preview และยืนยันส่งคะแนนกิจกรรม | DRAFT | 4 | [req-050.md](../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) |
| REQ-051 | คะแนนชนและการคุ้มครองคะแนนครู | DRAFT | 5 | [req-051.md](../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) |
| REQ-052 | สิทธิ์ การส่งซ้ำ และ audit คะแนน | DRAFT | 5 | [req-052.md](../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) |

## การบันทึกร่างโปรแกรมบล็อก

[REQ-026 (สร้างและทดลองโปรแกรมบล็อก)](../modules/block-lab/shared/requirements/req-026.md) บันทึกร่างที่โครงสร้างถูกต้องได้ ส่วนขีดจำกัด fuel 1000 ตรวจในขั้นก่อน Run

## เอกสารประกอบ

| เอกสาร | ใช้อ่านเรื่องใด |
|---|---|
| [ขอบเขตโมดูล](scope.md) | ภาพรวม ผู้ใช้ ขอบเขต ข้อจำกัด และสิ่งที่ไม่รองรับ |
| [มติที่ใช้อยู่](decisions/INDEX.md) | ข้อสรุปจากผู้ใช้ แยกตามหัวข้อ พร้อมมติที่ถูกแทนแล้ว |
| [คำถามค้าง](open-questions/index.md) | เรื่องที่ต้องได้คำตอบหรือหลักฐานจากผู้รับผิดชอบ |
| [นโยบาย Guest](pack-guest-001.md) | พื้นที่ร่วม การเก็บงาน และการย้ายเข้าบัญชี |
| [รายการเนื้อหาและเกณฑ์ประเมิน](pack-content-inventory-001.md) | เนื้อหาสามโหมด เกณฑ์ผ่าน ดาว และผู้อนุมัติ |
| [เกณฑ์ตรวจรับหุ่น](pack-hardware-001.md) | อุปกรณ์ แพลตฟอร์ม และข้อมูลที่รอผู้รับผิดชอบยืนยัน |
| [เกณฑ์ส่งมอบ](pack-delivery-001.md) | การส่งมอบและผู้มีอำนาจตัดสินแต่ละเรื่อง |
| [ความสามารถฐานเดิม](scope-baseline-001.md) | ความสามารถจริงและส่วนจำลอง ณ วันที่ตรวจฐานเดิม |
| [แหล่งอ้างอิงต้นทาง](source-references.md) | โค้ดและเอกสารที่ใช้กลั่นข้อกำหนด |

## หลักฐาน

เกณฑ์ดาวน์โหลด เตรียมติดตั้ง ติดตั้ง และกู้คืนแอปทั้งห้าข้อได้รับการตรวจรับจากผู้ใช้ตาม [มติ 037 (เกณฑ์อัปเดตแอปและสมรรถนะ)](decisions/decisions-037.md) สถานะ REQ ในตารางยังคงตามต้นฉบับ คำอธิบายการบันทึกร่างอ้าง planning/spec-090-draft-fuel-001.md (memory) ประวัติการแก้ข้อกำหนดข้อสอบอยู่ที่ requirement/req-046-history-001.md (memory)
