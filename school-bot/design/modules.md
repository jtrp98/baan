# ขอบเขตโมดูล — Rev3

## ข้อเท็จจริง

`app/frontend/src/app/appData.tsx:17` แยก Lessons/CodeLab/Blocks/Robot; `AppView.tsx:247` render คนละ entry ส่วน `app/internal/engine/manager.go:43` ใช้สอง engine ไม่ใช่สอง product modes

## ข้อเสนอ SA

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
             └─ HTTPS → G → gRPC → B API → Application → Domain
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

มติ decisions-010/011: API ทั้งหมดรวม Login อยู่ `C:/src/schoolbright/target/school-bot/web` (C# API → Application → Domain; Infrastructure ผ่าน ports). Desktop→HTTPS G→gRPC B; browser→same-origin BFF→HTTP G→gRPC B. B อยู่ใน school-bot/web รับผิดชอบ session/directory/authorization; reuse HTTP Login เดิมของ G ตาม DES-004/012 ไม่สร้าง verifier ซ้ำ. ไม่อ่าน DB จาก client. RPC mapping/trusted JWT tenant กับ opaque session ยัง design pending ตาม [Gateway Rev3](gateway-integration-001.md); ไม่เปลี่ยน engine IPC/local hardware

Login ไม่ activate License; License ไม่สร้างบัญชีหรือสิทธิ์ครู Offline entitlement เปิด local runtime ได้ แต่ไม่ใช้แทน user token ของ Cloud

Sample อยู่ใน namespace และ execution path แยก ไม่เขียนผลเรียนจริงหรือเรียก hardware/API จริง ข้อมูลที่แชร์ข้ามโหมดมีเพียงโครงงานตามเจ้าของ, curriculum reference และบริการกลาง ไม่แชร์สถานะการเชื่อมต่อจาก sample

ทางเลือก: คง modular monolith กับ engine เดิม; ปัดตก microservices และ engine ต่อหนึ่งหน้า เพราะเพิ่ม deployment/contract โดยไม่มีความต้องการรองรับ

## Change Log
- 2026-10-24 — Rev3: แก้ topology/diagram และ Login reuse ตาม049; คง engine/DB/schema
- 2026-10-23 — แก้พาธ `school-bot-v2` → `school-bot` ตาม [decisions-031](../requirement/decisions-031.md)
- 2026-10-21 — Rev2: web เป็นเจ้าของ API/Login; 4 DB ผ่าน backend
- 2026-10-21 — Rev1: กำหนดสาม product modes, routing และ integration boundaries
