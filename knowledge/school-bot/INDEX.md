---
project: school-bot
platform: desktop
os: [windows, mac]
target: school-bot
status: released
---
# SchoolBot — ระบบเรียนเขียนโปรแกรมและควบคุมหุ่น (SchoolBot Studio)

> วิธีใช้เอกสารกับ BAAN ปัจจุบัน: ดู [คู่มือ knowledge](../README.md#baan-0290) ชื่อผู้ทำงาน สถานะ และผลตรวจเดิมคงตาม source; การปรับคู่มือไม่ใช่ผลตรวจรับหรือ approval ใหม่

> แก้ล่าสุด: 2026-11-05 · สถานะ: **ปิดโครงการส่งมอบเสร็จสมบูรณ์ (Phase 7 Complete / Handover & Release Ready)**  
> รับผิดชอบโดย: Lead Technical Engineer

SchoolBot เป็นระบบสำหรับการเรียนรู้การเขียนโปรแกรมและควบคุมแขนกลหุ่นยนต์สำหรับนักเรียนและครูในโรงเรียน ครอบคลุมพื้นที่สร้างสรรค์ 3 รูปแบบ: **Block Lab** (โปรแกรมบล็อก), **Arm Lab** (ควบคุมและจำลองแขนกล 6 แกน), และ **Code Lab** (เขียนโปรแกรม Python) พร้อมระบบบทเรียน การสอบวัดผล การตรวจอัตโนมัติ และการส่งคะแนนเข้าสู่ระบบทะเบียน SchoolBright

**Source ปัจจุบัน** อยู่ที่ [target/sb-web-school-robot](../../target/sb-web-school-robot/) ดู [ตำแหน่งโค้ดของแต่ละโมดูล](build/design/modules.md) และ [runtime/configuration](build/design/service-runtime-001.md) ข้อมูลผลทดสอบและสถานะส่งมอบในหัวข้อถัดไปอ้างชุดหลักฐานของการส่งมอบเดิม

---

## 1. สถานะการส่งมอบโครงการ (Project Handover Status)

- **สถานะการตรวจรับงานในแผนงานหลัก (`build/plan/tasks-001.json`):**
  - งานทั้งหมด **110 งาน ใน 8 ระยะ (Phase 0 ถึง Phase 7) ผ่านการตรวจรับครบ 100% (Status: verified 110/110)**
  - ครอบคลุม **44 ข้อกำหนด (Requirements)**, **187 เกณฑ์ตรวจรับ (Acceptance Criteria)** และ **82 กรณีทดสอบ (TP001 ถึง TP082)**
- **ผลการทดสอบเชิงระบบ (Automated Test Suites):**
  - Backend .NET Tests: **4,447 Tests ผ่าน 100%** (0 Failed) ครอบคลุม Domain, Application, Repository และ gRPC Integration
  - Node.js Engine & Workspace Tests: **68 Tests ผ่าน 100%** ครอบคลุม Zide C++ IPC, Kinematics, Bounded Loop และ Safety Failsafe
  - Frontend Localization (i18n): **14 Tests ผ่าน 100%** รองรับภาษาไทย (th), อังกฤษ (en), และจีน (zh) สมบูรณ์
  - Go Host & Storage Tests: **6 Packages ผ่าน 100%** รองรับการบันทึกโปรเจกต์ออฟไลน์, ถังขยะ, และตัวอัปเดตแบบ Atomic
  - Windows MSI Lifecycle: ผ่านการทดสอบบน Windows Installer จริง ครบทั้ง Clean Install, MajorUpgrade, Downgrade Protection, Self-Repair, และ Mid-Update Rollback (AC-030-07)
  - ความปลอดภัยระดับ Release Candidate: ตรวจสอบไม่พบช่องโหว่ระดับวิกฤต (Zero Critical / Zero High Vulnerabilities)

---

## 2. ชุดเอกสารส่งมอบโครงการ (Handover Package & Release Documentation)

| เอกสาร | พาธไฟล์ | รายละเอียดและขอบเขตเนื้อหา |
|---|---|---|
| **คู่มือการติดตั้งระบบ (Installation Guide)** | docs/INSTALLATION_GUIDE.md (หลักฐานภายนอก: `../../target/school-bot/docs/INSTALLATION_GUIDE.md`) | ข้อกำหนดเครื่อง, การติดตั้ง Windows MSI/Setup Bootstrapper, คำสั่ง Silent Install, macOS PKG, และการ Deploy Backend Kubernetes |
| **คู่มือการเชื่อมต่อ API (API Integration Guide)** | docs/API_INTEGRATION_GUIDE.md (หลักฐานภายนอก: `../../target/school-bot/docs/API_INTEGRATION_GUIDE.md`) | สถาปัตยกรรม Gateway-to-gRPC, Protobuf contracts 5 บริการ, มาตรฐาน Metadata, สิทธิ์ Multi-tenancy, และการจัดการ Error |
| **เอกสารสถาปัตยกรรมระบบ (Architecture Document)** | docs/ARCHITECTURE.md (หลักฐานภายนอก: `../../target/school-bot/docs/ARCHITECTURE.md`) | ไดอะแกรมระบบ Multi-tier, Wails Go Host, Zide C++ Engine, .NET gRPC Core, โครงสร้าง 32 ตารางฐานข้อมูล, และ Process Isolation |
| **รายงานผลการทดสอบระบบ (Test Results Report)** | docs/TEST_RESULTS_REPORT.md (หลักฐานภายนอก: `../../target/school-bot/docs/TEST_RESULTS_REPORT.md`) | สรุปผลการรันชุดทดสอบ 4,555+ รายการ, การทดสอบฮาร์ดแวร์จำลอง, ความปลอดภัย, และ Traceability Matrix สู่ 187 ACs |
| **บันทึกการปล่อยระบบ (Release Notes v1.0)** | docs/RELEASE_NOTES_v1.0.md (หลักฐานภายนอก: `../../target/school-bot/docs/RELEASE_NOTES_v1.0.md`) | ฟีเจอร์เด่น 3 โหมด, ระบบการสอบจับเวลา, เวิร์กโฟลว์ครูและตัดเกรด, รายการ SHA-256 Hashes และ Deployment Runbook |
| **รายการตรวจสอบความพร้อมขึ้นระบบ (Go-Live Readiness)** | [build/plan/PM-001.md](build/plan/PM-001.md) | ผลการตรวจประเมินความพร้อมรอบด้าน (PM-001 Checklist) ครอบคลุม 8 Gate Preconditions |
| **บันทึกส่งมอบและปิดโครงการ (Handover & Closure)** | [build/plan/PM-002.md](build/plan/PM-002.md) | บันทึกการส่งมอบงานอย่างเป็นทางการ (PM-002 Handover Sign-off) และใบเสร็จค่า Hash |
| **แผนงานและสถานะงานฉบับสมบูรณ์ (Canonical Plan)** | [build/plan/tasks-001.json](build/plan/tasks-001.json) | ไฟล์ JSON ควบคุมสถานะงาน 110 งานที่ผ่านการตรวจรับ (`verified: 110`) |

---

## 3. สรุปความพร้อมการนำขึ้นระบบจริง (Operational Readiness)

ตารางนี้เป็นสถานะที่บันทึกไว้ในชุดส่งมอบเดิม ดู [runtime ปัจจุบัน](build/design/service-runtime-001.md) สำหรับสิ่งที่ตรวจจาก checkout ใหม่

| ส่วนงาน | สถานะความพร้อม | แนวทางดำเนินการสำหรับทีมปฏิบัติการ (Operations Team) |
|---|:---:|---|
| **ฐานข้อมูล (PostgreSQL 15.19)** | พร้อมใช้งาน | รันสคริปต์ [schoolbot_db.sql](build/db/schoolbot_db.sql) บนฐานข้อมูล `SchoolBotDB` แยกต่างหากจาก 4 ฐานเดิม |
| **Backend & Worker (Kubernetes)** | พร้อมใช้งาน | ใช้ Kustomize Manifests ใน deploy/overlays/prod (หลักฐานภายนอก: `../../target/school-bot/deploy/overlays/prod`) โดยตั้งค่า Secret ตามคู่มือการติดตั้ง |
| **API Gateway (`sb-api-gateway`)** | พร้อมใช้งาน | เปิด Route ส่งต่อคำขอภายนอกเข้าสู่ gRPC ServiceSchoolBot (:8080) พร้อมตรวจสอบ Trusted Headers |
| **Desktop Client (Windows/macOS)** | พร้อมใช้งาน | แจกจ่ายตัวติดตั้ง MSI ให้โรงเรียน หรือติดตั้งผ่าน Group Policy / MDM ตามคู่มือ INSTALLATION_GUIDE.md (หลักฐานภายนอก: `../../target/school-bot/docs/INSTALLATION_GUIDE.md`) |

---

## 4. โครงสร้างโมดูลย่อย (Submodules)

ตารางนี้บันทึกสถานะในชุดส่งมอบ ส่วนตาราง `Modules` ด้านล่างแสดงสถานะเอกสารจากหัวไฟล์ของแต่ละโมดูล

| Module | สรุป | สถานะ | พึ่งพา | ไฟล์ |
|---|---|---|---|---|
| app-shell | Desktop Host, Wails Adapter, Local Store, Updater | **released** | - | [modules/app-shell](modules/app-shell/INDEX.md) |
| arm-lab | Arm Lab (หุ่นยนต์แขนกล 6 แกน, 3D Kinematics, Zide C++) | **released** | app-shell, my-work | [modules/arm-lab](modules/arm-lab/INDEX.md) |
| block-lab | Block Lab (การเขียนโปรแกรมบล็อก Blockly, Bounded DSL) | **released** | app-shell, my-work | [modules/block-lab](modules/block-lab/INDEX.md) |
| code-lab | Code Lab (การเขียนโค้ด Python ผจญภัย) | **released** | app-shell, my-work | [modules/code-lab](modules/code-lab/INDEX.md) |
| my-work | ระบบจัดเก็บโครงงาน, ออฟไลน์แคช, ถังขยะและประวัติ | **released** | app-shell | [modules/my-work](modules/my-work/INDEX.md) |
| quiz | ระบบบทเรียน แบบทดสอบ การสอบจับเวลา และการตรวจอัตโนมัติ | **released** | app-shell | [modules/quiz](modules/quiz/INDEX.md) |
| web/school-bot | ระบบเว็บครู จัดการหลักสูตร เลื่อน Level และส่งออกคะแนน | **released** | quiz | [schoolbright-web](../schoolbright-web/modules/school-bot/INDEX.md) |

## Modules

<!-- baan:modules:start -->
<!-- ตารางนี้สร้างจากหัวไฟล์ INDEX.md ของแต่ละ module ด้วย `baan --index` — แก้ที่หัวไฟล์ของ module ไม่ใช่ที่นี่ -->

| Module | สรุป | สถานะ | อัปเดต | พึ่งพา | ไฟล์ |
|---|---|---|---|---|---|
| app-shell | App Shell (สารบัญ module) | draft | 2026-11-06 | - | [modules/app-shell](modules/app-shell/INDEX.md) |
| arm-lab | Arm Lab (สารบัญ module) | draft | 2026-11-06 | app-shell, my-work | [modules/arm-lab](modules/arm-lab/INDEX.md) |
| block-lab | Block Lab (สารบัญ module) | draft | 2026-11-04 | app-shell, my-work | [modules/block-lab](modules/block-lab/INDEX.md) |
| code-lab | Code Lab | draft | 2026-11-02 | app-shell, my-work | [modules/code-lab](modules/code-lab/INDEX.md) |
| game-library | game-library (สารบัญ module) | draft | 2026-11-06 | app-shell, my-work, quiz | [modules/game-library](modules/game-library/INDEX.md) |
| my-work | my-work (สารบัญ module) | draft | 2026-11-04 | app-shell | [modules/my-work](modules/my-work/INDEX.md) |
| quiz | บทเรียนและ Quiz (สารบัญ module) | draft | 2026-11-06 | app-shell, schoolbright-web/school-bot | [modules/quiz](modules/quiz/INDEX.md) |

**module ที่อยู่ project อื่นแต่เกี่ยวกับ project นี้**

| Module | สรุป | สถานะ | อัปเดต | เกี่ยวข้อง | อยู่ที่ |
|---|---|---|---|---|---|
| school-bot | เว็บครู School Bot (สารบัญ module) | draft | 2026-11-02 | ขอโดย school-bot · พึ่ง school-bot/quiz | [schoolbright-web/modules/school-bot](../schoolbright-web/modules/school-bot/INDEX.md) |
<!-- baan:modules:end -->
