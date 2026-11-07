# school-bot — สารบัญ design

> แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจ implementation และหลักฐาน Git)

เอกสาร design กำหนดขอบเขตโมดูล สัญญา API ข้อมูล สิทธิ์ Desktop/หุ่น การเรียน และการส่งมอบ แยกข้อกำหนดเป้าหมายออกจากหลักฐาน implementation; การมีเอกสารหรือผลตรวจ local ไม่ได้ยืนยันการเชื่อมระบบจริงหรือ release

## วิธีอ่าน

เริ่มจาก [ขอบเขตโมดูล](modules.md), [แบบข้อมูล](data-model.md) และ DES ของงาน แล้วตามไฟล์ย่อยของสัญญานั้น เกณฑ์คุณภาพอยู่ใน [quality-attributes.md](quality-attributes.md) และเรื่องรอผู้รับผิดชอบอยู่ใน [risks.md](risks.md) ตารางด้านล่างเก็บสถานะปัจจุบันของเอกสาร ประวัติอยู่ใน Git; ไฟล์ที่ไม่เคยระบุ Rev ใช้ “ไม่ระบุ” โดยไม่กำหนดเลขใหม่ · REQ แต่ละข้ออยู่ในแบบไหน ดูที่[ตาราง REQ → DES](index-requirements.md)

## ความเป็นไปได้และขอบเขตหลักฐาน

ต่อยอด Desktop Go/Wails, engine routing, ฐานบัญชี/profile และ schema เดิมได้ Backend repositories/entitlement และหลาย resource RPC มี implementationแล้ว; ต้องต่อ Desktop/BFF, ตรวจ auth/Assessment authorityจริง, Darwin robot transport และ trusted update ตัวเลข bounds ในแบบเป็นข้อเสนอ ไม่ใช่ performance SLA ที่ผู้ใช้อนุมัติ

ฐาน logical model ได้รับการยืนยันตาม [มติ 013 (ใช้ DBML เป็นฐานขั้นถัดไป)](../../shared/decisions/decisions-013.md) เป้าหมาย OS คือ Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon ตาม [มติ 019 (เป้าหมาย OS)](../../shared/decisions/decisions-019.md) Windows 10 เป็นหลักฐานประวัติ การเลือก target ไม่ใช่ผลทดสอบ runtime/hardware

## Transport และ Gateway

Desktop/Web → HTTP API Gateway → gRPC SchoolBot service; เว็บผ่าน same-origin Backend for Frontend (BFF) ไม่มี direct public SchoolBot fallback ใช้ controller/service และ module-owned channel สำหรับ local logout รายละเอียดเอกสารทุกฉบับอยู่ใน [สารบัญ Transport/Login](index-transport-login.md)

ปัจจุบันมี resource gRPC ห้าบริการและ Gateway JWT pipeline พร้อมผล TestServer; opaque logout/exchangeเป็นหลักฐานรุ่นก่อน Desktop/BFFและproduction integrationยังไม่มีหลักฐานครบ ยังต้องพิสูจน์ TLS/mTLS/peer, wire headers, production registration, private build, PostgreSQL/atomicity, BFF CSRF และ Light review จึงไม่ปิดเงื่อนไข auth หรือ release จากผล logout

อ่าน [runtime/database/scripts ปัจจุบัน](service-runtime-001.md) และ [ผลตรวจพร้อมข้อแตกต่าง](gateway-integration-evidence.md) ก่อนใช้หลักฐาน baselineเก่า

## สัญญาหลัก

### Desktop, Project และหุ่น

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-001.md](des-001.md) | 1 | DES-001: Desktop host และ Inter-Process Communication (IPC) | PROPOSED — รอ breaking review |
| [des-003.md](des-003.md) | 4 | DES-003: บันทึก/เปิดหลาย Project ระหว่าง Local และ Cloud | PROPOSED — รอ schema/migration review |
| [des-006.md](des-006.md) | 3 | DES-006: ควบคุมหุ่นจริงบน Windows/macOS และผลทบทวน Host/IPC | เตรียม review แล้ว — breaking contract รอคนก่อน BE-010; platform/hardware proof ยังขาด |

รายละเอียด Guest, Project API, robot และ OS อยู่ใน [สารบัญ Desktop/License/Release](index-desktop-release.md)

### Login และสิทธิ์

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-004.md](des-004.md) | 13 | DES-004: ตัวตน, session และสิทธิ์แยกตามช่องทาง | PROPOSED — ยืนยันอายุ Desktop 8 ชั่วโมงหลัง bind แล้ว; รอ identity/directory และ integration proof |
| [learning-write-rpc-001.md](learning-write-rpc-001.md) | 1 | RPC เขียนของงานเรียน: ส่งงานภารกิจ (BE-015) และทำ Quiz/Test (BE-031) ผ่าน gRPC + Gateway | ตัดสินแล้ว 2026-11-04 — ยังไม่ลงโค้ด |
| [course-run-selection-001.md](course-run-selection-001.md) | 1 | โรงเรียนเลือกหลักสูตรลงห้อง: 3 RPC CourseRun + ตัวตรวจห้อง/ปี/เทอม (AC-043-01) | สัญญาตามมติ 2026-11-04 · ผู้ใช้ยืนยันที่อยู่หน้า Admin 2026-11-05 |
| [des-012.md](des-012.md) | 9 | DES-012: แลก token เว็บและ authorization ข้ามระบบ | PROPOSED — ยืนยัน topology/admin policy แล้ว; รอ mapping/implementation/H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ) |

Data Transfer Object (DTO), decoder, trusted completion, private introspection และส่วนย่อยของ DES อยู่ใน [สารบัญ Transport/Login](index-transport-login.md)

### ข้อมูลและฐานข้อมูล

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [audit-evidence-storage-001.md](audit-evidence-storage-001.md) | 2 | เก็บ approval_ref/evidence_ref ตรงตัวไม่เกิน 1,000 ตัวอักษรร่วม DES-005/010/007 | ใช้ Reason เดิมตามมติ 054; รอ implementation proof |
| [audit-evidence-migration-001.md](audit-evidence-migration-001.md) | 2 | ไม่มี physical delta หรือ migration ตามมติ 054 | ส่ง vault ทบทวน DBA-005/DBA-006 ว่าไม่มี delta |
| [learning-design-reconciliation-001.md](learning-design-reconciliation-001.md) | 2 | หลักฐานรับกฎ learning/คะแนนก่อน freeze ของ DBA-005 | กฎนำเข้าแบบแล้ว; ไม่มี audit storage delta ตามมติ 054; runtime/คำอธิบาย constraints เก่ายังค้าง |
| [data-model.md](data-model.md) | 8 | คู่มือ schema: 32 ตาราง 450 ฟิลด์และการใช้ข้อมูลเดิม | ฐานแบบข้อมูล — runtime/catalog/API integration ยังไม่ยืนยัน |
| [modules.md](modules.md) | 4 | ตำแหน่งโค้ดปัจจุบันและขอบเขตตามแบบของแต่ละโมดูล | PROPOSED |
| [quality-attributes.md](quality-attributes.md) | 1 | เกณฑ์คุณภาพและสิ่งที่ต้องพิสูจน์ | PROPOSED |
| [risks.md](risks.md) | 5 | ความเสี่ยงและเงื่อนไขที่ต้องให้ผู้รับผิดชอบยืนยัน | PROPOSED |

พจนานุกรม ตาราง legacy, JSON, DBML และวิธีอ่านภาพอยู่ใน [สารบัญข้อมูล](index-data.md)

### การเรียนและคะแนน

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-005.md](des-005.md) | 10 | DES-005: หลักสูตร ภารกิจ และผลประเมินสามโหมด | PROPOSED — รอ numeric rubric/evaluator และ implementation proof; audit ใช้ T1000 ตามมติ 054 |
| [des-008.md](des-008.md) | 6 | DES-008: mapping หลักสูตรกับช่องคะแนน SchoolBright | PROPOSED — ยืนยันนโยบายแล้ว; รอ web-principal/H5 |
| [des-009.md](des-009.md) | 4 | DES-009: preview/ยืนยันส่งคะแนนและป้องกันคะแนนชน | PROPOSED — export ปิดจนผ่าน parity/coexistence/target/authz/DB gates |
| [des-010.md](des-010.md) | 8 | DES-010: คลังข้อสอบ Attempt และนโยบายคะแนน | PROPOSED — สูตรและขอบเขตครูยืนยันแล้ว; audit ใช้ T1000 ตามมติ 054; รอ implementation proof |
| [des-011.md](des-011.md) | 7 | DES-011: เสนอเลื่อน Level และครูยืนยันทั้งห้อง | PROPOSED — รอ roster/วันสิ้นเทอม |

กฎร่วมและ API เฉพาะเรื่องอยู่ใน [สารบัญ Learning/คะแนน](index-learning.md)

### License และ Release

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-002.md](des-002.md) | 3 | DES-002: License และหนึ่ง Key ต่อหนึ่ง device binding | PROPOSED — รอ schema/security review |
| [des-007.md](des-007.md) | 5 | DES-007: release และ trusted update | PROPOSED — audit ใช้ T1000 โดยไม่มี schema delta ตามมติ 054; รอ trust/implementation proof |

สิทธิ์ License admin, signer/custody, updater และชุดหลักฐานอยู่ใน [สารบัญ Desktop/License/Release](index-desktop-release.md)

## หลักฐาน

- Source baseline ที่ index เดิมอ้าง: `app/desktopservice.go:98`, `app/desktopstorage.go:103`, `app/internal/engine/manager.go:43`, `web/src/ServiceSchoolBot.API/Program.cs`, `engines/zide/src/transport.cpp:7` ใต้ `C:/src/schoolbright/target/school-bot`; ส่วน Host/IPC/robot ตรวจ source วันที่ 2026-11-03 ใน [ผลทบทวน DES-006](des-006-review.md); ไม่ตรวจ DB/runtime เพิ่ม
- รายงาน local logout ล่าสุด 2026-10-28 (memory: planning/jpo-092-logout-r4-001.md) รับรองเฉพาะขอบเขตที่รายงาน; auth-flow-handoff-001 และ qa/round-001 (memory) แยก local component/logout ออกจาก integration
- สัญญาปัจจุบัน DES-004 Rev13 คงขอบเขต persistence ตาม [มติ 051 (commit Project + Revision ในหน่วยเดียว)](../../shared/decisions/decisions-051.md) ร่วมกับ Project API Rev2 และกฎข้อมูล Rev11 และนับอายุ Desktop session จากเวลา bind ตาม [มติ 052 (อายุ Desktop session นับจากเวลา bind)](../../shared/decisions/decisions-052.md)
