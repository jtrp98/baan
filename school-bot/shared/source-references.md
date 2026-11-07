---
owner: spec
---
# แหล่งอ้างอิงข้อกำหนด SchoolBot

> แก้ล่าสุด 2026-11-02 · แก้โดย spec · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้รวมตำแหน่ง source และมติที่ใช้กลั่นข้อกำหนด พร้อมทางเข้าอ่านสัญญา transport แยกจากหลักฐานความสามารถฐานเดิม ตำแหน่ง source เก็บตามช่วงที่ตรวจและไม่ยืนยันว่าการเชื่อมระบบปัจจุบันพร้อมใช้งาน


คำย่อในเอกสาร: OS = Operating System หรือระบบปฏิบัติการ; API = Application Programming Interface หรือส่วนเชื่อมต่อบริการ

## Source ปัจจุบัน

เริ่มจาก [ขอบเขตโมดูล](../build/design/modules.md) และ [runtime/configuration](../build/design/service-runtime-001.md) ของ `sb-web-school-robot` โดย Desktop และ engines อยู่ใต้ `app/` กับ `engines/` เว็บครูและ Admin อยู่ใต้ `frontend/` และบริการ .NET กับ Protobuf contracts อยู่ใต้ `backend/` พาธในหัวข้อหลักฐานด้านล่างอ้างตำแหน่งในช่วงที่ตรวจเดิม

## ข้อกำหนดและขอบเขต

อ่านกฎธุรกิจและเกณฑ์ตรวจรับจาก [สารบัญ requirement](requirements-index.md) และอ่านขอบเขตวันนี้จาก [scope.md](scope.md) รายการความสามารถฐานเดิมอยู่ใน [scope-baseline-001.md](scope-baseline-001.md)

## มติประกอบแหล่งอ้างอิง

ผู้ใช้ในแชต 2026-10-21 ยืนยัน [มติ 001 (จากคำตอบผู้ใช้)](decisions/decisions-001.md), [มติ 014 (Guest พื้นที่ร่วม การนำงานและประวัติเข้าบัญชี)](decisions/decisions-014.md), [มติ 015 (ถังขยะ Guest ผู้ร่างหลักสูตร และขอบเขตครู)](decisions/decisions-015.md), [มติ 016 (ผู้อนุมัติภาพรวมและการจัดทำข้อเสนอหุ่น/OS)](decisions/decisions-016.md) และ [มติ 019 (Windows 11 25H2 x64)](decisions/decisions-019.md) ส่วน [มติ 017 (ให้รองรับ Windows 10 x64 และทบทวนขั้นต่ำ)](decisions/decisions-017.md) และ [มติ 018 (ทดสอบแพ็กเกจเดิมก่อนปรับ Setup)](decisions/decisions-018.md) เป็นประวัติที่ถูกแทนแล้ว ไม่ใช้กำหนดเป้าหมาย OS วันนี้

## สัญญา transport

เส้นทาง client ใช้ HTTP API Gateway (`sb-api-gateway`) แล้วเรียก SchoolBot gRPC service รายละเอียดอ่าน Gateway integration (เส้นทางและ controller) และ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../build/design/des-012.md) ข้อความ API จากฐานเดิมใช้เป็นหลักฐานช่วงตรวจ ส่วนสัญญาที่ลิงก์กำหนดเส้นทาง transport ที่ใช้วันนี้

## ยังไม่ยืนยัน

รายการแหล่งอ้างอิงไม่ใช่ผล audit หรือหลักฐานว่าการเชื่อมระบบพร้อม ต้องใช้หลักฐานตรวจระบบที่รันจริงเพื่อยืนยันความสามารถปัจจุบัน

## หลักฐาน

พาธต่อไปนี้อ้างจาก source repository ของ SchoolBot ตามช่วงตรวจเดิม งานนี้ไม่ได้ตรวจโค้ดหรือ schema ปัจจุบันซ้ำ

- `README.md:3`, `README.md:84`, `README.md:97`, `README.md:199` — PoC, ความสามารถและข้อจำกัด
- `app/README.md:41`, `app/README.md:49` — ภาษา, DSL และหนึ่ง slot ต่อ mode
- `docs/ARCHITECTURE.md:49`, `docs/ARCHITECTURE.md:71` — native robot และ offline/storage
- `app/frontend/src/Home.tsx:26`, `app/frontend/src/Home.tsx:49` — ข้อมูลตัวอย่างและรายการงานจริง
- `app/frontend/src/modes/robot-control/works/WorksScreen.tsx:182` — USB จำลอง
- `app/frontend/src/modes/robot-control/teacher/TeacherMenu.tsx:136`, `app/frontend/src/modes/robot-control/teacher/TeacherMenu.tsx:201` — งานดูแลหุ่นจำลอง
- `app/frontend/src/modes/coding-adventure/LearnMap.tsx:225`, `app/frontend/src/modes/coding-adventure/LearnMap.tsx:237` — ดาวและการเชื่อมต่อจำลอง
- `engines/zide/docs/INTEGRATION.md:31`, `engines/zide/docs/INTEGRATION.md:65` — โปรไฟล์ การควบคุม และ stop
- `engines/zide/docs/API.md:147` — ความหมายการส่งคำสั่งและข้อจำกัดฮาร์ดแวร์
- `docs/API.md:9`, `web/README.md:29` — API และ Memory Store
- `docs/INSTALLERS.md:3`, `docs/INSTALLERS.md:125` — แพ็กเกจและข้อจำกัดการแจกจ่าย

- หลักฐาน source เฉพาะเรื่องอยู่ในแต่ละ REQ (Requirement หรือข้อกำหนด)
- source-review-002 (หลักฐานบัญชีและฐานข้อมูลเดิมสี่ฐาน) อ้างพาธจาก Academic repository
- ตำแหน่งอ้างอิง transport เดิมตรึง Gateway integration Rev3 และ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../build/design/des-012.md) Rev9 ปัจจุบันไฟล์ Gateway integration ระบุ Rev5 ส่วน [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](../build/design/des-012.md) ยังคง Rev9 การเรียบเรียงนี้ไม่แก้ Rev ของสัญญาเหล่านั้น
