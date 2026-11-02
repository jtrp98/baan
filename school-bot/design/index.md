# school-bot — สารบัญ design

เอกสาร design กำหนดขอบเขตโมดูล สัญญา API ข้อมูล สิทธิ์ Desktop/หุ่น การเรียน และการส่งมอบ แยกข้อกำหนดเป้าหมายออกจากหลักฐาน implementation; การมีเอกสารหรือผลตรวจ local ไม่ได้ยืนยันการเชื่อมระบบจริงหรือ release

## วิธีอ่าน

เริ่มจาก [ขอบเขตโมดูล](modules.md), [แบบข้อมูล](data-model.md) และ DES ของงาน แล้วตามไฟล์ย่อยของสัญญานั้น เกณฑ์คุณภาพอยู่ใน [quality-attributes.md](quality-attributes.md) และเรื่องรอผู้รับผิดชอบอยู่ใน [risks.md](risks.md) ตารางด้านล่างเก็บสถานะปัจจุบันของเอกสาร ประวัติอยู่ใน Git; ไฟล์ที่ไม่เคยระบุ Rev ใช้ “ไม่ระบุ” โดยไม่กำหนดเลขใหม่

## ความเป็นไปได้และขอบเขตหลักฐาน

ต่อยอด Desktop Go/Wails, engine routing, ฐานบัญชี/profile และ schema เดิมได้ งานที่ต้องเติมคือ authorization/session, License persistence/entitlement, หลาย Project, curriculum/ผลประเมิน, Darwin robot transport และ trusted update ตัวเลข bounds ในแบบเป็นข้อเสนอ ไม่ใช่ performance SLA ที่ผู้ใช้อนุมัติ

ฐาน logical model ได้รับการยืนยันตาม [มติ 013 (ใช้ DBML เป็นฐานขั้นถัดไป)](../requirement/decisions-013.md) เป้าหมาย OS คือ Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon ตาม [มติ 019 (เป้าหมาย OS)](../requirement/decisions-019.md) Windows 10 เป็นหลักฐานประวัติ การเลือก target ไม่ใช่ผลทดสอบ runtime/hardware

## Transport และ Gateway

Desktop/Web → HTTP API Gateway → gRPC SchoolBot service; เว็บผ่าน same-origin Backend for Frontend (BFF) ไม่มี direct public SchoolBot fallback ใช้ controller/service และ module-owned channel สำหรับ local logout รายละเอียดเอกสารทุกฉบับอยู่ใน [สารบัญ Transport/Login](index-transport-login.md)

local logout มี implementation และผลตรวจเฉพาะ local; Login/exchange/private introspection และ production integration ยังไม่มีหลักฐานรับรองครบ ยังต้องพิสูจน์ TLS/mTLS/peer, wire headers, production registration, private build, PostgreSQL/atomicity, BFF CSRF และ Light review จึงไม่ปิดเงื่อนไข auth หรือ release จากผล logout

## สัญญาหลัก

### Desktop, Project และหุ่น

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-001.md](des-001.md) | 1 | DES-001: Desktop host และ Inter-Process Communication (IPC) | PROPOSED — รอ breaking review |
| [des-003.md](des-003.md) | 4 | DES-003: บันทึก/เปิดหลาย Project ระหว่าง Local และ Cloud | PROPOSED — รอ schema/migration review |
| [des-006.md](des-006.md) | 2 | DES-006: ควบคุมหุ่นจริงบน Windows/macOS | PROPOSED — รอ platform/hardware proof |

รายละเอียด Guest, Project API, robot และ OS อยู่ใน [สารบัญ Desktop/License/Release](index-desktop-release.md)

### Login และสิทธิ์

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-004.md](des-004.md) | 12 | DES-004: ตัวตน, session และสิทธิ์แยกตามช่องทาง | PROPOSED — รอ identity/directory และ integration proof |
| [des-012.md](des-012.md) | 9 | DES-012: แลก token เว็บและ authorization ข้ามระบบ | PROPOSED — ยืนยัน topology/admin policy แล้ว; รอ mapping/implementation/H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ) |

Data Transfer Object (DTO), decoder, trusted completion, private introspection และส่วนย่อยของ DES อยู่ใน [สารบัญ Transport/Login](index-transport-login.md)

### ข้อมูลและฐานข้อมูล

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [data-model.md](data-model.md) | 8 | คู่มือ schema: 32 ตาราง 450 ฟิลด์และการใช้ข้อมูลเดิม | ฐานแบบข้อมูล — runtime/catalog/API integration ยังไม่ยืนยัน |
| [modules.md](modules.md) | 3 | ขอบเขตและความรับผิดชอบแต่ละโมดูล | PROPOSED |
| [quality-attributes.md](quality-attributes.md) | 1 | เกณฑ์คุณภาพและสิ่งที่ต้องพิสูจน์ | PROPOSED |
| [risks.md](risks.md) | 5 | ความเสี่ยงและเงื่อนไขที่ต้องให้ผู้รับผิดชอบยืนยัน | PROPOSED |

พจนานุกรม ตาราง legacy, JSON, DBML และวิธีอ่านภาพอยู่ใน [สารบัญข้อมูล](index-data.md)

### การเรียนและคะแนน

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-005.md](des-005.md) | 8 | DES-005: หลักสูตร ภารกิจ และผลประเมินสามโหมด | PROPOSED — รอ numeric rubric/evaluator |
| [des-008.md](des-008.md) | 5 | DES-008: mapping หลักสูตรกับช่องคะแนน SchoolBright | PROPOSED — ยืนยันนโยบายแล้ว; รอ web-principal/H5 |
| [des-009.md](des-009.md) | 4 | DES-009: preview/ยืนยันส่งคะแนนและป้องกันคะแนนชน | PROPOSED — export ปิดจนผ่าน parity/coexistence/target/authz/DB gates |
| [des-010.md](des-010.md) | 5 | DES-010: คลังข้อสอบ Attempt และนโยบายคะแนน | PROPOSED — สูตรและขอบเขตครูยืนยันแล้ว; รอ implementation proof |
| [des-011.md](des-011.md) | 6 | DES-011: เสนอเลื่อน Level และครูยืนยันทั้งห้อง | PROPOSED — รอ roster/วันสิ้นเทอม |

กฎร่วมและ API เฉพาะเรื่องอยู่ใน [สารบัญ Learning/คะแนน](index-learning.md)

### License และ Release

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [des-002.md](des-002.md) | 3 | DES-002: License และหนึ่ง Key ต่อหนึ่ง device binding | PROPOSED — รอ schema/security review |
| [des-007.md](des-007.md) | 3 | DES-007: release และ trusted update | PROPOSED — รอ schema/trust approval |

สิทธิ์ License admin, signer/custody, updater และชุดหลักฐานอยู่ใน [สารบัญ Desktop/License/Release](index-desktop-release.md)

## หลักฐาน

- Source baseline ที่ index เดิมอ้าง: `app/desktopservice.go:98`, `app/desktopstorage.go:103`, `app/internal/engine/manager.go:43`, `web/src/SchoolBot.Api/Program.cs:43`, `engines/zide/src/transport.cpp:7` ใต้ `C:/src/schoolbright/target/school-bot`; งานนี้อ่านเฉพาะเอกสารที่อนุญาต ไม่ยืนยัน code/schema ปัจจุบันเพิ่ม
- รายงาน local logout ล่าสุด 2026-10-28 (memory: planning/jpo-092-logout-r4-001.md) รับรองเฉพาะขอบเขตที่รายงาน; auth-flow-handoff-001 และ qa/round-001 (memory) แยก local component/logout ออกจาก integration
- [มติ 051 (commit Project + Revision ในหน่วยเดียว)](../requirement/decisions-051.md) ลงสัญญาใน DES-004 Rev12, Project API Rev2 และกฎข้อมูล Rev11 แล้ว
