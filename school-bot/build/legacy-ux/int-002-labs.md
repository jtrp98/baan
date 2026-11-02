---
legacy: true
---
# int-002-labs — UX ราย feature: Labs สามโหมด Arm / Block / Code (Task UX-003)

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ข้อกำหนดที่ใช้ในไฟล์นี้: [REQ-015 (โปรไฟล์หุ่นหกข้อต่อ)](../../modules/arm-lab/shared/requirements/req-015.md) · [REQ-016 (ส่งท่าและปรับข้อต่อ)](../../modules/arm-lab/shared/requirements/req-016.md) · [REQ-022 (อ่านค่าตำแหน่ง servo)](../../modules/arm-lab/shared/requirements/req-022.md) · [REQ-023 (ปลดและล็อกแรงบิด)](../../modules/arm-lab/shared/requirements/req-023.md) · [REQ-018 (เล่นลำดับจากแอป)](../../modules/arm-lab/shared/requirements/req-018.md) · [REQ-019 (อัปโหลดท่าไปบอร์ด)](../../modules/arm-lab/shared/requirements/req-019.md) · [REQ-020 (เล่นชุดท่าบนบอร์ด)](../../modules/arm-lab/shared/requirements/req-020.md) · [REQ-021 (ขอหยุดหุ่นและยกเลิกงานค้าง)](../../modules/arm-lab/shared/requirements/req-021.md) · [REQ-017 (ข้อมูลท่า ลำดับ และกลุ่ม)](../../modules/arm-lab/shared/requirements/req-017.md)
เอกสารนี้เป็นทางเข้าสำหรับการสร้างและทดลองงาน Arm, Block และ Code รวมการเชื่อมต่อหุ่น การขอหยุด และสถานะผิดปกติ รายละเอียดแยกตามงาน และผลอนุมัติเดิมอยู่ในตาราง §7

> ฐานอ้างอิง: [REQ-013 (ขอบเขต sample/preview/mock)](../../modules/app-shell/shared/requirements/req-013.md) · [REQ-014 (ค้นหาและเชื่อมต่อหุ่น)](../../modules/arm-lab/shared/requirements/req-014.md) ถึง [REQ-024 (การเชื่อมต่อขาดและคำสั่งล้มเหลว)](../../modules/arm-lab/shared/requirements/req-024.md) · [REQ-025 (Code Lab: เขียนและรันโปรแกรม)](../../modules/code-lab/shared/requirements/req-025.md) · [REQ-026 (สร้างและทดลองโปรแกรมบล็อก)](../../modules/block-lab/shared/requirements/req-026.md) · [DES-006 (หุ่นจริง Windows/macOS)](../design/des-006.md) Rev1
> ออกแบบต่อยอดจาก component เดิมที่มีจริง: `RobotMode/NativeConnectScreen/NativeReconnectOverlay/NativeWorkspace/ArmSimulator/BlockMode/CodeLabMode` (frontend จริงอยู่ `target/school-bot/app/frontend/src`)

## เนื้อหาแยกตามงาน

เลขหัวข้อ § เดิมคงไว้ให้เทียบขอบเขตในตาราง Sign-off

| หัวข้อและเนื้อหา |
|---|
| [1. กติกากลางของ Labs (ข้อเสนอ) · 2. Arm Lab · 2.1 ค้นหาและเชื่อมต่อหุ่น — REQ-014 (ค้นหาและเชื่อมต่อหุ่น) · DES-006 (หุ่นจริง Windows/macOS)](../../modules/arm-lab/build/legacy-ux/int-002-labs-rules-connect.md) |
| [2.2 โปรไฟล์หกข้อต่อ — REQ-015 · DES-006 · 2.3 Workspace — ส่งท่า / ปรับข้อต่อ (REQ-016) · 2.4 อ่านค่า servo (REQ-022)](../../modules/arm-lab/build/legacy-ux/int-002-labs-profile-workspace.md) |
| [2.5 ปลด/ล็อกแรงบิด (REQ-023) · 2.6 เล่นลำดับจากแอป (REQ-018) · 2.7 อัปโหลดท่าไปบอร์ด (REQ-019 · DES-006: ทีละ ≤4 ท่า, 1–10,000 ท่า) · 2.8 เล่นชุดท่าบนบอร์ด (REQ-020)](../../modules/arm-lab/build/legacy-ux/int-002-labs-playback-upload.md) |
| [2.9 หยุด / ยกเลิก / งานค้าง (REQ-021) · 2.10 การเชื่อมต่อขาดระหว่างใช้งาน (REQ-024)](../../modules/arm-lab/build/legacy-ux/int-002-labs-stop-reconnect.md) |
| [2.11 โครงงานท่า/ลำดับ/กลุ่ม (REQ-017) · 3. Code Lab — REQ-025](../../modules/code-lab/build/legacy-ux/int-002-labs-projects-code.md) |
| [4. Block Lab — REQ-026 · 5. กติกา preview/mock (REQ-013 — ใช้ร่วมทุก Lab)](../../modules/block-lab/build/legacy-ux/int-002-labs-block.md) |
| [6. a11y พื้นฐาน (int-002)](int-002-labs-a11y.md) |

## 7. Sign-off table

คำถามในตาราง: Q7 (overlay เมื่อขาดการเชื่อมต่อ) · Q8 (ปุ่มขอหยุดใหญ่สีแดงมุมขวาล่าง) · Q9 (ป้ายโหมดจำลองตลอด session) · Q2 (ข้อความไทยและ accessibility ของ Entry/Labs) · Q11 (validation โครงงาน Arm และชื่อซ้ำ) · Q10 (ตัวนับความยาวโค้ด)

| ส่วน | สถานะ | ผู้อนุมัติ | วันที่ |
|---|---|---|---|
| §1 กติกากลาง (chip สถานะ/ป้ายจำลอง/ปุ่มหยุด) | **อนุมัติ** (Q7 overlay เต็มจอ, Q8 ปุ่มใหญ่แดงมุมขวาล่าง, Q9 ป้ายจำลองตลอด session) | ผู้ใช้ | 2026-10-24 |
| §2.1–2.2 ค้นหา/เชื่อมต่อ/โปรไฟล์ | **อนุมัติ** (Q2) | ผู้ใช้ | 2026-10-24 |
| §2.3–2.8 Workspace ส่งท่า/อ่านค่า/แรงบิด/เล่น/อัปโหลด/บอร์ด | **อนุมัติ** (Q2, Q11) | ผู้ใช้ | 2026-10-24 |
| §2.9 หยุด/งานค้าง | **อนุมัติ** (Q8) | ผู้ใช้ | 2026-10-24 |
| §2.10 ขาดการเชื่อมต่อ | **อนุมัติ** (Q7) | ผู้ใช้ | 2026-10-24 |
| §2.11 โครงงาน/กลุ่ม | **อนุมัติ** (Q11 — ID ท่าซ้ำบล็อก/ชื่อซ้ำเตือน) | ผู้ใช้ | 2026-10-24 |
| §3 Code Lab | **อนุมัติ** (Q10 เพิ่มตัวนับความยาว) | ผู้ใช้ | 2026-10-24 |
| §4 Block Lab | **อนุมัติ** (Q2) | ผู้ใช้ | 2026-10-24 |
| §5 กติกา preview/mock | **อนุมัติ** (Q9) | ผู้ใช้ | 2026-10-24 |
| §6 a11y | **อนุมัติ** (Q2) | ผู้ใช้ | 2026-10-24 |

**สรุป: เอกสารนี้อนุมัติครบทุกส่วน** — front implement UX-003 จากไฟล์นี้ได้ (signed int artifact ตาม [decisions-038 (sign-off UX ครบทั้งสองไฟล์ + spec Q1/Q2/Q4/Q5)](../../shared/decisions/decisions-038.md))
