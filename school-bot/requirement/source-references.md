# Source References — school-bot

พาธด้านล่างอ้างจาก source repository:

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
- หลักฐาน source เฉพาะเรื่องอยู่ในแต่ละ REQ
- [มติผู้ใช้](decisions-001.md) — คำตอบที่ยืนยันในแชต


## มติที่ใช้ amend ปัจจุบัน

ผู้ยืนยัน: ผู้ใช้ในแชต 2026-10-21; [Guest](decisions-014.md), [ถังขยะ/เนื้อหา/ครู](decisions-015.md), [ผู้อนุมัติ/ทีมเสนอหุ่น](decisions-016.md), [OS](decisions-019.md); decisions-017/018 เป็นประวัติ

หลักฐาน source ข้างต้นคงช่วงตรวจเดิม ไม่ใช่การ audit ใหม่; รายการเต็มที่ย้ายจาก scope อยู่ [scope-baseline-001.md](scope-baseline-001.md)

## Change Log

- 2026-10-22 — เพิ่มมติปัจจุบันและอ้างหลักฐานเดิมที่แยกจาก scope

- 2026-10-21 — เพิ่มหลักฐานข้าม repository ของบัญชี/4 DB เดิมใน [source-review-002.md](../design/source-review-002.md); พาธใน review นั้นอ้าง academic root ไม่ใช่ school-bot-v2

- 2026-10-21 — ย้าย References จาก scope.md แบบคงเนื้อหาเดิมเพื่อลดขนาดไฟล์
