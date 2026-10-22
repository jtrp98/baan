# School Bot — Design Rev3

ข้อเสนอเพื่อทบทวนจาก working tree และ REQ-009–039 รวม 31 REQ / 109 AC ไม่ใช่การอนุมัติ implementation, migration หรือ release

2026-10-21 ผู้ใช้ยืนยัน DBML/latest logical model เป็นฐานขั้นถัดไป ดู [decisions-013.md](../requirement/decisions-013.md); physical DDL และรายละเอียดที่ยัง pending เป็นงานถัดไป

2026-10-21 ผู้ใช้เลือก Windows11 25H2 x64 ตามข้อเสนอแรก; macOS15+ Intel/AppleSilicon คงเดิม ดู [มติ OS ปัจจุบัน](../requirement/decisions-019.md) แทน Windows10 target ในร่าง OS/Win10 review ด้านล่าง ซึ่งเก็บเป็นหลักฐานก่อนมติใหม่ การเลือก target ยังไม่ใช่ผลทดสอบ runtime/hardware

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
7. เปิด [schoolbot.dbml](schoolbot.dbml) ใน dbdiagram.io; ขอบเขต/ข้อจำกัดของภาพอยู่ใน [schema-notes.md](schema-notes.md)

สถานะเอกสารอยู่ใน index นี้เท่านั้น

| เอกสาร | Rev | สถานะ |
|---|---:|---|
| [modules.md](modules.md) | 2 | PROPOSED |
| [data-model.md](data-model.md) | 4.1 | CONFIRMED logical baseline 33 ตาราง ตาม decisions-026; CreateBy/UpdateBy = int null ตาม decisions-028; placement ยังเขียนว่า School DB — ต้อง amend ตาม decisions-027 (SchoolBot DB 10.0.0.128:9499) |
| [data-contract-rules.md](data-contract-rules.md) | 4 | CONFIRMED baseline ตาม decisions-026 |
| [schoolbot.dbml](schoolbot.dbml) | 2.1 | CONFIRMED baseline 33 ตาราง ตาม decisions-026/028; ผ่าน @dbml/core parser (33 tables / 41 refs) |
| [schema-notes.md](schema-notes.md) | 2 | CONFIRMED baseline notes — อ้าง physical design ใน db/review-001.md |
| [des-001.md](des-001.md) — Host/IPC | 1 | PROPOSED — รอ breaking review |
| [des-002.md](des-002.md) — License | 2 | PROPOSED — รอ schema/security review |
| [des-003.md](des-003.md) — Projects | 3 | PROPOSED — รอ schema/migration review |
| [des-004.md](des-004.md) — Identity | 4 | PROPOSED — sync decisions-025/026 แล้ว; รอหลักฐาน credential compatibility และการตัดสิน TeacherGrant |
| [des-005.md](des-005.md) — Learning | 4 | PROPOSED — sync decisions-020..026 แล้ว; รอเกณฑ์ numeric rubric/evaluator |
| [des-006.md](des-006.md) — Robot | 1 | PROPOSED — รอ platform/hardware proof |
| [des-007.md](des-007.md) — Release | 2 | PROPOSED — รอ schema/trust approval |
| [des-008.md](des-008.md) — Score mapping | 2 | PROPOSED — schema/H3 อนุมัติแล้ว (decisions-025/026); รอ OQ-016 และ H5/web-principal |
| [des-009.md](des-009.md) — Score export | 2 | PROPOSED — schema อนุมัติแล้ว (decisions-026); export ปิดจนผ่าน G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB และอนุมัติ 007 |
| [des-010.md](des-010.md) — Question Bank/Attempt/ScoringPolicy | 2 | PROPOSED — schema/สอบซ่อม/four-eyes อนุมัติแล้ว (decisions-025/026); รอ OQ-014 สูตรรวม และกรอบครูปรับ policy |
| [des-011.md](des-011.md) — Level promotion | 2 | PROPOSED — schema อนุมัติแล้ว (decisions-026); รอ OQ-014 สูตรรวม และตรวจแหล่ง roster/วันสิ้นเทอม |
| [des-012.md](des-012.md) — Auth ข้ามระบบ | 1 | PROPOSED — H1–H4, H6–H8 อนุมัติแล้ว (decisions-025/026); รอ H5 env/network และ endpoint web-principal ใน gateway |
| [amendment-proposal-002.md](amendment-proposal-002.md) | 1 | APPLIED — sync เข้า Rev4/DBML Rev2 ตาม decisions-026 (แก้ 2 จุดตาม decisions-025) |
| [amendment-proposal-001.md](amendment-proposal-001.md) | 1 | APPLIED — sync เข้า Rev4/DBML Rev2 ตาม decisions-026 |
| [quality-attributes.md](quality-attributes.md) | 1 | PROPOSED |
| [risks.md](risks.md) | 3 | PROPOSED |
| [hardware-survey-001.md](hardware-survey-001.md) | 1 | EVIDENCE/PROPOSAL — รอ physical evidence และตรวจรับรุ่น |
| [os-compatibility-001.md](os-compatibility-001.md) | 2 | EVIDENCE — target ถูกแทนโดย decisions-019; runtime proof ยังรอ |
| [windows10-compatibility-001.md](windows10-compatibility-001.md) | 1 | HISTORICAL — ผู้ใช้ยุติ Windows10 target ตาม decisions-019 |

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
| REQ-033 | data-model; 002–005, 007–012 |
| REQ-034 | 001, 002 |
| REQ-035 | 002 |
| REQ-036 | 003, 004 |
| REQ-037 | 005 |
| REQ-038 | 004, 005 |
| REQ-039 | 004, 005 |
| REQ-040 | 001, 003 |
| REQ-041 | 003, 004 |
| REQ-042 | 004, 005 |
| REQ-043 | 005, 010, 012 |
| REQ-044 | 005, 010 |
| REQ-045 | 005 |
| REQ-046 | 010 |
| REQ-047 | 010 |
| REQ-048 | 011, 012 |
| REQ-049 | 008, 012 |
| REQ-050 | 009, 012 |
| REQ-051 | 009, 012 |
| REQ-052 | 009, 012 |

## หลักฐานและขอบเขต

พาธ source อ้างจาก `C:/src/schoolbright/target/school-bot-v2` ส่วน REQ/มติอยู่ที่ `C:/src/schoolbright/knowledge/school-bot/requirement`

หลักฐานหลัก: `app/desktopservice.go:98`, `app/desktopstorage.go:103`, `app/internal/engine/manager.go:43`, `web/src/SchoolBot.Api/Program.cs:43`, `engines/zide/src/transport.cpp:7`

อ่านเฉพาะรายการที่อนุญาต ไม่ตามไฟล์ implementation ที่ถูก import เพิ่ม เช่น `poseEditing`, C++ request validation และ installer scripts จึงไม่อ้างว่าตรวจทุกเส้นทางครบ ไม่มี build/tests/UI/hardware หรือการเขียนไฟล์ในงานนี้

## Change Log
- 2026-10-21 — บันทึกการเลือก OS ของผู้ใช้ตาม decisions-019; เก็บ survey เดิมเป็นหลักฐาน ไม่แก้ข้อเท็จจริง source หรืออ้าง QA ผ่าน
- 2026-10-21 — amend OS survey Rev2 และเพิ่ม Windows10 review ตาม decisions-017; ไม่ปิด G-DELIVERY/OQ-011
- 2026-10-21 — เพิ่ม hardware-survey-001 และ os-compatibility-001 เพื่อ BA-003/004 และ SA-003; ไม่ปิด human gates
- 2026-10-21 — บันทึกผู้ใช้ยืนยัน DBML เป็น baseline; คงประเด็น pending ตามขอบเขตจริง ไม่ถือว่า SQL/UX/release เสร็จแล้ว
- 2026-10-21 — Rev3: PK int4 ตาม decisions-012; คงประตู schema/compatibility เดิม
- 2026-10-21 — Rev2: amend ตาม decisions-010/011; API รวม Login อยู่ web, ใช้ 4 DB เดิม; ยัง PROPOSED รอ schema/implementation approval
- 2026-10-21 — Rev1: เสนอระบบเต็มตาม decisions-001–009 และตรวจ source จริงก่อนออกแบบ
- 2026-10-21 — MYCELIUM บันทึกผล SA จาก session จริง; แยกกฎข้อมูล/HTTP จาก data-model จึงมี 13 ไฟล์ โดยคง DES-001..007 และเนื้อหาข้อเสนอเดิม
