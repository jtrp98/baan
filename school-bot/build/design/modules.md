# ขอบเขตโมดูล

> Rev 4 · แก้ล่าสุด 2026-11-05 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจตำแหน่งและ implementation ปัจจุบัน)

## Implementation ปัจจุบัน

ตรวจจาก `target/sb-web-school-robot` ที่ commit `d8f27d3` รายละเอียด runtime และการตั้งค่าอยู่ใน [service-runtime-001.md](service-runtime-001.md)

| ส่วน | ตำแหน่งและเส้นทางการทำงาน |
|---|---|
| Desktop | [app/main.go](../../../../target/sb-web-school-robot/app/main.go) เปิด Wails และฝัง React frontend จาก `app/frontend/dist` หน้า Lab เรียก typed client ที่ [core/client.ts](../../../../target/sb-web-school-robot/app/frontend/src/core/client.ts) เพื่อเข้าถึง Go host |
| Block Lab | Host route `block-programming` ไป Mixly สำหรับสร้างโค้ด คอมไพล์ และ Serial monitor โดย `program.upload` เปิดใน route บน Windows |
| Arm Lab | Host route `robot-control` ไป Zide สำหรับค้นหาอุปกรณ์และควบคุมแขนกล เส้นทางจำลองเลือกจากการตั้งค่าของ Go host |
| Code Lab | Host route `coding-adventure/program.run` ไป demo engine ซึ่งแปลงชุดคำสั่ง DSL แบบจำกัดเป็นคำสั่งสำหรับตัวจำลอง |
| เว็บครู | [frontend/app/management](../../../../target/sb-web-school-robot/frontend/app/management/) มี UI จัดการการเรียนรู้และเรียก HTTP ผ่าน [learning-api.ts](../../../../target/sb-web-school-robot/frontend/lib/api/learning-api.ts) |
| Admin | [frontend/app/admin](../../../../target/sb-web-school-robot/frontend/app/admin/) มีหน้า TAdmin login แยกและใช้ Admin BFF ส่ง staff assertion ไป Gateway |
| Backend | [backend/ServiceSchoolBot.slnx](../../../../target/sb-web-school-robot/backend/ServiceSchoolBot.slnx) แยก API, Application, Domain และ Infrastructure การเข้า backend ผ่าน gRPC อ้าง [Protobuf contracts](../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Protos/ServiceSchoolBot/) |

การเลือก engine ตรวจจาก [routes.go](../../../../target/sb-web-school-robot/app/internal/engine/routes.go) และ [manager.go](../../../../target/sb-web-school-robot/app/internal/engine/manager.go) ขอบเขตคำสั่ง Code Lab อยู่ใน [demo.go](../../../../target/sb-web-school-robot/app/internal/engine/demo.go)

## ข้อเท็จจริงจากหลักฐานเดิม

Frontend แยกหน้า Lessons, CodeLab, Blocks และ Robot ออกจากกัน โดย AppView render คนละ entry ส่วน engine manager ใช้สอง engine ไม่ใช่สอง product modes ข้อเท็จจริงนี้อ้างหลักฐานเดิมท้ายไฟล์

## ขอบเขตและสัญญาตามแบบ

ตารางและผังในส่วนนี้อ้างการออกแบบรุ่นเดิมก่อนย้าย repository ตารางด้านบนใช้ดูตำแหน่งและการเลือก engine ในโค้ดปัจจุบัน

| Product/หน้า | View ตามแบบเดิม | Host/store mode | Engine ตามแบบเดิม |
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

[มติ 010 (ใช้ข้อมูล Login/User ที่มีอยู่แล้ว)](../../shared/decisions/decisions-010.md) และ [มติ 011 (ใช้ฐานข้อมูลเดิมทั้ง 4 ตัวร่วมกับ SchoolBot)](../../shared/decisions/decisions-011.md) อ้างตำแหน่ง backend ใน repo เดิม แบบแยก C# API, Application, Domain และ Infrastructure ซึ่งเชื่อมผ่าน ports ตามแบบ Desktop เรียก HTTPS ไปยัง HTTP API Gateway (`sb-api-gateway`) แล้ว Gateway ส่ง gRPC ต่อให้ SchoolBot ส่วน browser ใช้ same-origin BFF (Backend for Frontend) ก่อนเข้า Gateway

สัญญาเรื่อง session, directory, authorization และการใช้ HTTP Login ของ Gateway อยู่ใน [DES-004](des-004.md), [DES-012](des-012.md) และ [Gateway integration](gateway-integration-001.md) หลักฐานของ repo ปัจจุบันครอบคลุมฝั่ง SchoolBot ส่วนเส้นทางที่ผ่าน Gateway และระบบยืนยันตัวตนภายนอกต้องตรวจจาก integration ที่รันจริง

Login ไม่ activate License; License ไม่สร้างบัญชีหรือสิทธิ์ครู Offline entitlement เปิด local runtime ได้ แต่ไม่ใช้แทน user token ของ Cloud

Sample อยู่ใน namespace และ execution path แยก ไม่เขียนผลเรียนจริงหรือเรียก hardware/API จริง ข้อมูลที่แชร์ข้ามโหมดมีเพียงโครงงานตามเจ้าของ, curriculum reference และบริการกลาง ไม่แชร์สถานะการเชื่อมต่อจาก sample

ทางเลือก: คง modular monolith กับ engine เดิม; ปัดตก microservices และ engine ต่อหนึ่งหน้า เพราะเพิ่ม deployment/contract โดยไม่มีความต้องการรองรับ

## หลักฐาน

- `app/frontend/src/app/appData.tsx:17`
- `AppView.tsx:247`
- `app/internal/engine/manager.go:43`

สามรายการด้านบนเป็นหลักฐานของฉบับก่อน ส่วนลิงก์ในหัวข้อ Implementation ปัจจุบันอ้าง checkout ที่ผู้ใช้ระบุเมื่อ 2026-11-05
