# ขอบเขตโมดูล

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ข้อเท็จจริงจากหลักฐานเดิม

Frontend แยกหน้า Lessons, CodeLab, Blocks และ Robot ออกจากกัน โดย AppView render คนละ entry ส่วน engine manager ใช้สอง engine ไม่ใช่สอง product modes ข้อเท็จจริงนี้อ้างหลักฐานเดิมท้ายไฟล์

## ขอบเขตและสัญญาตามแบบ

| Product/หน้า | View ปัจจุบัน | Host/store mode | Engine |
|---|---|---|---|
| Block Lab | block-programming | block-programming | demo |
| Arm Lab | robot-control | robot-control | zide |
| Code Lab | code-lab | coding-adventure | demo |
| Lessons | coding-adventure + block/arm/code | อ้าง product mode ของภารกิจ | เลือกตามงาน ไม่เป็น engine ใหม่ |

Product mode ใน API ใหม่เป็น `block|arm|code`; host เป็นเจ้าของ mapping ข้างต้น ห้าม rename store เก่าเป็น `code-lab` โดยไม่มี migration

```text
React: Lessons / Labs / Projects / Identity
             ↓ core/client.ts
Go Host: LicenseGate / Session / Projects / Robot lifecycle / Updates
             ├─ local files + OS credential store
             ├─ trusted manager → demo | zide → platform transport
             └─ HTTPS → HTTP API Gateway → SchoolBot gRPC service → API → Application → Domain
                                 ↑
                    Persistence / Identity / Signer / Grader adapters
```

| ขอบเขต | สัญญา |
|---|---|
| Frontend | แสดงข้อมูลและผูก handlers; ไม่เข้าถึง DB, shell, private keys หรือเลือก executable |
| Host | ตรวจสิทธิ์ทุก operation, เก็บ credential, เลือก local/cloud, serialize robot lifecycle |
| Engine | ตรวจ payload ซ้ำ, bounded execution; stdout เป็น protocol; ไม่มี login/DB |
| API | ตรวจ identity, school, ownership, license binding และส่ง coded errors |
| Application | orchestration/transactions ผ่าน ports; ไม่ขึ้นกับ ASP.NET/Infrastructure |
| Domain | invariants ของ license, project revision, learning และ release |
| Infrastructure | repositories ของ 4 DB เดิม, legacy credential/profile adapters, session store, signer และ grader; ไม่แก้ Academic generated entities |
| Platform | Windows/Darwin transport และ credential adapters; ไม่แตก business rules ตาม OS |

[มติ 010 (ใช้ข้อมูล Login/User ที่มีอยู่แล้ว)](../../shared/decisions/decisions-010.md) และ [มติ 011 (ใช้ฐานข้อมูลเดิมทั้ง 4 ตัวร่วมกับ SchoolBot)](../../shared/decisions/decisions-011.md) กำหนดให้ API ทั้งหมดรวม Login อยู่ที่ `C:/src/schoolbright/target/school-bot/web` โดยแยก C# API, Application และ Domain ส่วน Infrastructure เชื่อมผ่าน ports Desktop เรียก HTTPS ไปยัง HTTP API Gateway (`sb-api-gateway`) แล้วส่ง gRPC ต่อให้ SchoolBot gRPC service ส่วน browser ผ่าน same-origin BFF (Backend for Frontend) ก่อนเข้า Gateway

SchoolBot gRPC service ใน `school-bot/web` รับผิดชอบ session, directory และ authorization ใช้ HTTP Login เดิมของ Gateway ตาม [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](des-004.md) และ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md) โดยไม่สร้าง verifier ซ้ำ Client ไม่อ่าน DB โดยตรง การกำหนด RPC (Remote Procedure Call) และ mapping ระหว่าง trusted JWT (JSON Web Token) tenant กับ opaque session ยังรอการออกแบบตาม [Gateway Rev3](gateway-integration-001.md) ส่วน IPC (Inter-Process Communication) ของ engine และ local hardware คงเดิม

Login ไม่ activate License; License ไม่สร้างบัญชีหรือสิทธิ์ครู Offline entitlement เปิด local runtime ได้ แต่ไม่ใช้แทน user token ของ Cloud

Sample อยู่ใน namespace และ execution path แยก ไม่เขียนผลเรียนจริงหรือเรียก hardware/API จริง ข้อมูลที่แชร์ข้ามโหมดมีเพียงโครงงานตามเจ้าของ, curriculum reference และบริการกลาง ไม่แชร์สถานะการเชื่อมต่อจาก sample

ทางเลือก: คง modular monolith กับ engine เดิม; ปัดตก microservices และ engine ต่อหนึ่งหน้า เพราะเพิ่ม deployment/contract โดยไม่มีความต้องการรองรับ

## หลักฐาน

- `app/frontend/src/app/appData.tsx:17`
- `AppView.tsx:247`
- `app/internal/engine/manager.go:43`

หลักฐาน source ข้างต้นคงจากฉบับก่อน งานเรียบเรียงนี้ไม่ได้เปิดตรวจ implementation เพิ่ม
