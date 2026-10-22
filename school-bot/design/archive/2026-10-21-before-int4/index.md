# School Bot — Design Rev2

ข้อเสนอเพื่อทบทวนจาก working tree และ REQ-009–039 รวม 31 REQ / 109 AC ไม่ใช่การอนุมัติ implementation, migration หรือ release

## Feasibility

| ส่วน | ข้อเท็จจริงจากโค้ด | ข้อเสนอ |
|---|---|---|
| Identity/DB | academic มีบัญชี/profile และ Npgsql 4 context; [review](../source-review-002.md) | web ทำ Login/API บนข้อมูลเดิม |
| Desktop | มี Go/Wails, React และ trusted engine routing | ใช้โครงสร้างเดิม เพิ่ม host authorization และหลายโครงงาน |
| License/API | Memory Store, device limit ปรับได้, ไม่มี signed entitlement | persistent transactions, 1 binding ปัจจุบัน, สิทธิ์ออฟไลน์ 3 วัน |
| การเรียน | Code/Block มี bounded execution; Lessons ยังมี sample | curriculum ที่มี version, submission และผลประเมินจริง |
| หุ่น | Windows HID/Serial; macOS ปฏิเสธ native transport | ใช้ command builders เดิม เพิ่ม Darwin transport |
| แจกจ่าย | มีเอกสาร installer; update เป็น metadata | เพิ่ม artifact trust และคำสั่งติดตั้งแยกจาก check |

ทำได้โดยต่อยอดระบบเดิม แต่ยังไม่มีหลักฐาน runtime, Mac/hardware acceptance หรือ production signing ในงานนี้

## วิธีอ่าน

1. อ่าน `modules.md` และ `data-model.md` ก่อน DES ที่เกี่ยวข้อง
2. “ข้อเท็จจริง” อ้าง source; “ข้อเสนอ” เป็นสัญญาที่รออนุมัติ
3. อ่าน `quality-attributes.md` สำหรับเกณฑ์พิสูจน์ และ `risks.md` สำหรับประตูมนุษย์
4. API ใหม่ใช้ `/v2`, JSON `snake_case`; DB ใช้ชื่อใน data-model ตรงตัว
5. ตัวเลข bounds ใหม่เป็นข้อเสนอ SA ไม่ใช่ performance SLA ที่ผู้ใช้อนุมัติ
6. ฉบับก่อน amendment เก็บแบบ verbatim ที่ [archive.md](archive.md)

สถานะเอกสารอยู่ใน index นี้เท่านั้น

| เอกสาร | Rev | สถานะ |
|---|---:|---|
| [modules.md](modules.md) | 2 | PROPOSED |
| [data-model.md](data-model.md) | 2 | PROPOSED — รอ schema/DBA |
| [data-contract-rules.md](data-contract-rules.md) | 2 | PROPOSED — แยกจาก data-model ของ SA |
| [des-001.md](des-001.md) — Host/IPC | 1 | PROPOSED — รอ breaking review |
| [des-002.md](des-002.md) — License | 1 | PROPOSED — รอ schema/security review |
| [des-003.md](des-003.md) — Projects | 2 | PROPOSED — รอ schema/migration review |
| [des-004.md](des-004.md) — Identity | 2 | PROPOSED — รอ credential compatibility/schema |
| [des-005.md](des-005.md) — Learning | 2 | PROPOSED — รอ schema/criteria/scope |
| [des-006.md](des-006.md) — Robot | 1 | PROPOSED — รอ platform/hardware proof |
| [des-007.md](des-007.md) — Release | 1 | PROPOSED — รอ schema/trust approval |
| [quality-attributes.md](quality-attributes.md) | 1 | PROPOSED |
| [risks.md](risks.md) | 2 | PROPOSED |

## REQ mapping

| REQ | DES หลัก/ร่วม |
|---|---|
| REQ-009 | 001, 002 |
| REQ-010 | 001 |
| REQ-011 | 003 |
| REQ-012 | 001, 003, 006 |
| REQ-013 | 001, 005, 006 |
| REQ-014 | 006 |
| REQ-015 | 006 |
| REQ-016 | 006 |
| REQ-017 | 003, 006 |
| REQ-018 | 006 |
| REQ-019 | 006 |
| REQ-020 | 006 |
| REQ-021 | 001, 006 |
| REQ-022 | 006 |
| REQ-023 | 006 |
| REQ-024 | 006 |
| REQ-025 | 001, 003, 005 |
| REQ-026 | 001, 003, 005 |
| REQ-027 | 002, 004 |
| REQ-028 | 002 |
| REQ-029 | 007 |
| REQ-030 | 007 |
| REQ-031 | 007 |
| REQ-032 | 006, 007 |
| REQ-033 | data-model; 002–005, 007 |
| REQ-034 | 001, 002 |
| REQ-035 | 002 |
| REQ-036 | 003, 004 |
| REQ-037 | 005 |
| REQ-038 | 004, 005 |
| REQ-039 | 004, 005 |

## หลักฐานและขอบเขต

พาธ source อ้างจาก `C:/src/schoolbright/target/school-bot-v2` ส่วน REQ/มติอยู่ที่ `C:/src/schoolbright/knowledge/school-bot/requirement`

หลักฐานหลัก: `app/desktopservice.go:98`, `app/desktopstorage.go:103`, `app/internal/engine/manager.go:43`, `web/src/SchoolBot.Api/Program.cs:43`, `engines/zide/src/transport.cpp:7`

อ่านเฉพาะรายการที่อนุญาต ไม่ตามไฟล์ implementation ที่ถูก import เพิ่ม เช่น `poseEditing`, C++ request validation และ installer scripts จึงไม่อ้างว่าตรวจทุกเส้นทางครบ ไม่มี build/tests/UI/hardware หรือการเขียนไฟล์ในงานนี้

## Change Log
- 2026-10-21 — Rev2: amend ตาม decisions-010/011; API รวม Login อยู่ web, ใช้ 4 DB เดิม; ยัง PROPOSED รอ schema/implementation approval
- 2026-10-21 — Rev1: เสนอระบบเต็มตาม decisions-001–009 และตรวจ source จริงก่อนออกแบบ
- 2026-10-21 — MYCELIUM บันทึกผล SA จาก session จริง; แยกกฎข้อมูล/HTTP จาก data-model จึงมี 13 ไฟล์ โดยคง DES-001..007 และเนื้อหาข้อเสนอเดิม
