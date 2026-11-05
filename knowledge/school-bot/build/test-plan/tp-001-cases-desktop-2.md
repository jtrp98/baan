# TP-001 — Desktop และโครงงาน (TP001-016–TP001-018)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-016"></a>

## TP001-016 — บันทึก/เปิด

AC: [AC-011-01 (บันทึกอย่างน้อยสองงานต่อโหมด Block/Arm/Code ทั้ง Guest และ Login…)](../../modules/my-work/shared/requirements/req-011.md), [AC-011-02 (บันทึกการแก้ไขงาน A แล้วเปิดใหม่ได้ค่าล่าสุดของ A โดยงาน B…)](../../modules/my-work/shared/requirements/req-011.md) · References: [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md), [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](../design/des-004.md) · Level: integration · Profiles: PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: Login นักเรียนและครู; 2+ งานต่อ mode; ผู้ใช้อื่น/โรงเรียนอื่น

ขั้นตอน: บันทึก/เปิด; PUT ด้วย If-Match ตรง/stale 2 clients; เปิดด้วย ID ของผู้อื่น

ผลที่คาด: ไม่ปะปน; A ใหม่ B เดิม; stale→412 VERSION_CONFLICT ไม่ last-write-wins ไม่สูญ draft; ID ผู้อื่น→404; ETag เป็น opaque จาก `UpdateDate` microsecond ตาม project-api Rev1/กฎกลาง Rev8; PUT ขาด If-Match→`428 PRECONDITION_REQUIRED`; ไม่ตรง→`412 VERSION_CONFLICT`+`details.current_etag`; client ห้าม parse ETag เป็นวันที่/สร้าง ETag เอง; ไม่มี version field; A ใหม่ B เดิม ไม่ last-write-wins; ID ผู้อื่น→404 (อ้างอิง: copy ใช้ `source_project_revision_id`+If-Match ของ Project ต้นทาง — สำหรับ check ใช้เมื่อรัน Save As ภายใต้ AC เดิม)

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-017"></a>

## TP001-017 — เปิดไฟล์

AC: [AC-011-03 (เปิดไฟล์ JSON เสียหรือเกิน 1 MiB แล้วมีข้อผิดพลาด)](../../modules/my-work/shared/requirements/req-011.md), [AC-011-04 (เมื่อมีข้อมูลทั้งชื่อแอปเก่าและใหม่ การเริ่มแอปไม่ทับข้อมูลใหม่)](../../modules/my-work/shared/requirements/req-011.md) · References: DES-003 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: JSON เสีย/ว่าง/BOM/UTF-8 ผิด; ขนาด 1048576 และ 1048577 bytes; มีทั้ง SchoolBotPoC/ArmStudioPoC และใหม่; มีเฉพาะเก่าที่ valid/เสีย

ขั้นตอน: เปิดไฟล์; เริ่มแอป/รัน migration ซ้ำ

ผลที่คาด: >1MiB หรือเสีย→ข้อผิดพลาดไม่แสดงสำเร็จ (=1MiB ผ่าน); มีใหม่ไม่ถูกทับ; ไม่มีปลายทาง→คัดลอกเก่าที่ valid ต้นฉบับยังอยู่; เสียแจ้งแยกไม่ขวางงานอื่น; rerun ไม่ทับงานที่ผู้ใช้แก้

หลักฐานที่ต้องเก็บ: E-TRACE+ไฟล์ hash

ผลจริง: NOT_RUN

<a id="tp001-018"></a>

## TP001-018 — load/validate

AC: [AC-017-01 (โหลดโครงงานถูกต้องที่มีสองท่าและกลุ่ม แล้วได้ชื่อ ค่า เวลา ลำดับ…)](../../modules/arm-lab/shared/requirements/req-017.md), [AC-017-02 (โหลดโครงงานที่มี ID ท่าซ้ำหรือค่าท่านอกช่วงแล้วมีข้อผิดพลาด)](../../modules/arm-lab/shared/requirements/req-017.md), [AC-017-03 (บันทึกและเปิดใหม่แล้วไม่มีสถานะยืนยันว่าอัปโหลดตรงกับบอร์ดหรืออยู่ตรงท่า…)](../../modules/arm-lab/shared/requirements/req-017.md) · References: DES-003, [DES-006 (หุ่นจริง Windows/macOS)](../design/des-006.md) · Level: unit · Profiles: PF-UNIT

เงื่อนไขก่อนตรวจ: Arm project: 2 ท่า+กลุ่ม; ID ท่าซ้ำ; ค่านอกช่วง (-180..180, สี่ค่า ±135, gripper 0..100 และขอบ ±1); กลุ่มอ้างท่าไม่มี/<2 ท่า

ขั้นตอน: load/validate; save แล้ว reopen

ผลที่คาด: ได้ชื่อ/ค่า/เวลา/ลำดับ/สมาชิกกลุ่มเดิม; ซ้ำ/นอกช่วง→error; กลุ่มอ้างท่าไม่มีไม่เป็นกลุ่มใช้งาน; reopen ไม่มี connected/uploaded/verified/torque

หลักฐานที่ต้องเก็บ: unit log

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ
