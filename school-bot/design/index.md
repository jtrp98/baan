# school-bot — Design Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · เขียนโดย system-analyst เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ des-*.md / data-model.md ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Feasibility

ข้อเสนอเพื่อทบทวนจาก working tree และ REQ-009–039 รวม 31 REQ / 109 AC ไม่ใช่การอนุมัติ implementation, migration หรือ release

2026-10-21 ผู้ใช้ยืนยัน DBML/latest logical model เป็นฐานขั้นถัดไป ดู [decisions-013.md](../requirement/decisions-013.md); physical DDL และรายละเอียดที่ยัง pending เป็นงานถัดไป

2026-10-21 ผู้ใช้เลือก Windows11 25H2 x64 ตามข้อเสนอแรก; macOS15+ Intel/AppleSilicon คงเดิม ดู [มติ OS ปัจจุบัน](../requirement/decisions-019.md) แทน Windows10 target ในร่าง OS/Win10 review ด้านล่าง ซึ่งเก็บเป็นหลักฐานก่อนมติใหม่ การเลือก target ยังไม่ใช่ผลทดสอบ runtime/hardware

| ส่วน | ข้อเท็จจริงจากโค้ด | ข้อเสนอ |
|---|---|---|
| Identity/DB | academic มีบัญชี/profile และ Npgsql 4 context; [review](source-review-002.md) | web ทำ Login/API บนข้อมูลเดิม |
| Desktop | มี Go/Wails, React และ trusted engine routing | ใช้โครงสร้างเดิม เพิ่ม host authorization และหลายโครงงาน |
| License/API | Memory Store, device limit ปรับได้, ไม่มี signed entitlement | persistent transactions, 1 binding ปัจจุบัน, สิทธิ์ออฟไลน์ 3 วัน |
| การเรียน | Code/Block มี bounded execution; Lessons ยังมี sample | curriculum ที่มี version, submission และผลประเมินจริง |
| หุ่น | Windows HID/Serial; macOS ปฏิเสธ native transport | ใช้ command builders เดิม เพิ่ม Darwin transport |
| แจกจ่าย | มีเอกสาร installer; update เป็น metadata | เพิ่ม artifact trust และคำสั่งติดตั้งแยกจาก check |

ทำได้โดยต่อยอดระบบเดิม แต่ยังไม่มีหลักฐาน runtime, Mac/hardware acceptance หรือ production signing ในงานนี้

### กติกาการอ่านและขอบเขตหลักฐาน

1. อ่าน `modules.md` และ `data-model.md` ก่อน DES ที่เกี่ยวข้อง
2. “ข้อเท็จจริง” อ้าง source; “ข้อเสนอ” เป็นสัญญาที่รออนุมัติ
3. อ่าน `quality-attributes.md` สำหรับเกณฑ์พิสูจน์ และ `risks.md` สำหรับประตูมนุษย์
4. API ใหม่ใช้ `/v2`, JSON `snake_case`; DB ใช้ชื่อใน data-model ตรงตัว
5. ตัวเลข bounds ใหม่เป็นข้อเสนอ SA ไม่ใช่ performance SLA ที่ผู้ใช้อนุมัติ
6. ฉบับก่อน amendment เก็บแบบ verbatim ที่ [archive.md](archive.md)
7. เปิด [schoolbot.dbml](schoolbot.dbml) ใน dbdiagram.io; ขอบเขต/ข้อจำกัดของภาพอยู่ใน [schema-notes.md](schema-notes.md)

สถานะเอกสารอยู่ใน index นี้เท่านั้น

พาธ source อ้างจาก `C:/src/schoolbright/target/school-bot` ส่วน REQ/มติอยู่ที่ `C:/src/schoolbright/knowledge/school-bot/requirement`

หลักฐานหลัก: `app/desktopservice.go:98`, `app/desktopstorage.go:103`, `app/internal/engine/manager.go:43`, `web/src/SchoolBot.Api/Program.cs:43`, `engines/zide/src/transport.cpp:7`

อ่านเฉพาะรายการที่อนุญาต ไม่ตามไฟล์ implementation ที่ถูก import เพิ่ม เช่น `poseEditing`, C++ request validation และ installer scripts จึงไม่อ้างว่าตรวจทุกเส้นทางครบ ไม่มี build/tests/UI/hardware หรือการเขียนไฟล์ในงานนี้

## Design Contracts

| ID | ชื่อ | สถานะ | ไฟล์ |
|---|---|---|---|
| DES-001 | Desktop host และ IPC (Rev1) | PROPOSED — รอ breaking review | [des-001.md](des-001.md) |
| DES-002 | License และ device binding (Rev2) | PROPOSED — รอ schema/security review | [des-002.md](des-002.md) |
| DES-003 | หลายโครงงาน Local/Cloud (Rev3) | PROPOSED — รอ schema/migration review | [des-003.md](des-003.md) |
| DES-004 | Identity และ school authorization (Rev7) | PROPOSED — ทาง A ยืนยันแล้ว; รอ credential compatibility ([หลักฐาน](auth-evidence-001.md)) | [des-004.md](des-004.md) |
| DES-005 | หลักสูตร ภารกิจ และผลประเมิน (Rev6) | PROPOSED — ทาง A ยืนยันแล้ว; รอ numeric rubric/evaluator | [des-005.md](des-005.md) |
| DES-006 | หุ่นจริง Windows/macOS (Rev1) | PROPOSED — รอ platform/hardware proof | [des-006.md](des-006.md) |
| DES-007 | Release และ trusted update (Rev2) | PROPOSED — รอ schema/trust approval | [des-007.md](des-007.md) |
| DES-008 | Mapping หลักสูตรกับช่องคะแนน SchoolBright (Rev4) | PROPOSED — OQ-016 ตอบแล้ว; คง H5/web-principal | [des-008.md](des-008.md) |
| DES-009 | Preview ยืนยัน และส่งคะแนนกลับ SchoolBright (Rev4) | PROPOSED — sync decisions-027..030 (G-DB ใช้บัญชี DB เดิมตาม decisions-029) และ db/review-005; export ปิดจนผ่าน G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB | [des-009.md](des-009.md) |
| DES-010 | Question Bank, Attempt และนโยบายคะแนน (Rev4) | PROPOSED — สูตร/freeze/ขอบเขตครู/ทาง A ตอบแล้ว; รอ implementation proof | [des-010.md](des-010.md) |
| DES-011 | ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง (Rev4) | PROPOSED — สูตรตอบแล้ว; รอตรวจ roster/วันสิ้นเทอม | [des-011.md](des-011.md) |
| DES-012 | Auth ข้ามระบบ: web-system / admin web / Desktop ↔ SchoolBot API (Rev4) | PROPOSED — sync decisions-025..030 และ db/review-005; รอ H5 env/network และ endpoint web-principal ใน gateway | [des-012.md](des-012.md) |

### REQ mapping

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

## ไฟล์อื่นในหมวดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| [data-model.md](data-model.md) | คู่มือข้อมูล Rev7 — หน้าที่ตาราง/450 ฟิลด์ ตัวอย่าง และตารางเก่า; คง baseline Rev5 ตาม SQL 32 ตารางบน SchoolBot DB |
| [data-dictionary/index.md](data-dictionary/index.md) | สารบัญ 32 ตาราง: ทุกฟิลด์ ชนิด/NULL หน้าที่ ตัวอย่าง และ FK จาก SQL |
| [data-legacy-001.md](data-legacy-001.md) | ตารางเดิมที่ใช้ ฟิลด์เชื่อม ขอบเขตอ่าน/เขียน และหลักฐาน source |
| [data-fields-001.md](data-fields-001.md) | วิธีอ่าน PK/FK/NULL/JSON และฟิลด์ร่วม |
| [data-terms-001.md](data-terms-001.md) | แยกชื่อใกล้กัน: Mission/Activity, Submission/Attempt, Assessment และชุดส่งคะแนน |
| [data-dictionary/contract-index.md](data-dictionary/contract-index.md) | สัญญา Rev5 เดิม แบ่งส่วนโดยคงชนิด/enum/JSON/กฎครบ |
| [data-json-001.md](data-json-001.md) | อธิบาย JSON: Text, กิจกรรม, ข้อสอบ/คำตอบ, นโยบาย, น้ำหนัก และ snapshot |
| [data-relations-001.md](data-relations-001.md) | แผนภาพเส้นทางข้อมูล: เนื้อหา → งาน/ข้อสอบ → ส่งคะแนนเดิม |
| [data-contract-rules.md](data-contract-rules.md) | Invariants/กติกาข้อมูล (Rev6 · CONFIRMED — sync single-column FK + application tenant check, UpdateDate concurrency (ETag/If-Match) และ re-check ข้าม DB ตาม decisions-027..030 และ db/review-005) |
| [schema-notes.md](schema-notes.md) | หมายเหตุ schema/ชนิดข้อมูล legacy (Rev3 · CONFIRMED — อ้าง db/schoolbot_db.sql และ db/review-005.md (SchoolBot DB 10.0.0.128:9499, 32 ตาราง, ใช้บัญชี DB เดิมบน School DB/PGGradeDB)) |
| [risks.md](risks.md) | สิ่งที่ต้องยืนยันก่อน implementation และประตูมนุษย์ (Rev4 · PROPOSED) |
| [hardware-survey-001.md](hardware-survey-001.md) | ผลสำรวจ hardware/OS (Rev1 · EVIDENCE/PROPOSAL — รอ physical evidence และตรวจรับรุ่น) |
| [os-compatibility-001.md](os-compatibility-001.md) | ผลสำรวจความเข้ากันได้ของ OS (Rev2 · EVIDENCE — target ถูกแทนโดย decisions-019; runtime proof ยังรอ) |
| [windows10-compatibility-001.md](windows10-compatibility-001.md) | ผลสำรวจความเข้ากันได้ของ Windows 10 (Rev1 · HISTORICAL — ผู้ใช้ยุติ Windows10 target ตาม decisions-019) |
| [amendment-proposal-001.md](amendment-proposal-001.md) | ข้อเสนอแก้แบบ (Rev1 · APPLIED — sync เข้า Rev4/DBML Rev2 ตาม decisions-026) |
| [amendment-proposal-002.md](amendment-proposal-002.md) | ข้อเสนอแก้แบบ (Rev1 · APPLIED — sync เข้า Rev4/DBML Rev2 ตาม decisions-026 (แก้ 2 จุดตาม decisions-025)) |
| [schoolbot.dbml](schoolbot.dbml) | DBML Rev5 — Notes032..034; ผู้คุมตรวจ parser/semantic ผ่านตาม dbml-review-002; 32 ตาราง/450 ฟิลด์/40 FK; คง schema baseline เดิม |
| [schoolbot-integration.dbml](schoolbot-integration.dbml) | ภาพเชื่อม legacy Rev2 (Notes; parser/semantic ผ่าน): SchoolBot 10 + ตารางเดิม 14; FK จริง 4 / logical เส้นประ 12; ใช้อธิบาย ไม่ใช้สร้าง SQL |
| [dbml-guide-001.md](dbml-guide-001.md) | วิธีอ่านกลุ่มสี เส้นทึบ/ประ และข้อจำกัดของภาพ |
| [dbml-review-001.md](dbml-review-001.md) | ผลตรวจ parser/ความครบถ้วน/เทียบ contract ก่อนและหลัง |
| [dbml-review-002.md](dbml-review-002.md) | ผู้คุมตรวจ parser/semantic หลัง sync032..034; structural model/SQL เดิม |
| [source-review-001.md](source-review-001.md) | หลักฐาน as-built จากการตรวจ source จริง: รายงาน as-built โหมด Block/Arm/Code และเส้นทางบทเรียน/สร้างงาน (ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-002.md](source-review-002.md) | หลักฐาน as-built จากการตรวจ source จริง: บัญชี/profile และ EF context ใน academic (Rev2 · ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-003.md](source-review-003.md) | หลักฐาน as-built จากการตรวจ source จริง: โครงสร้าง Course Plan จาก Google Sheet (ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-004.md](source-review-004.md) | หลักฐาน as-built จากการตรวจ source จริง: ระบบเกรด SchoolBright บน PGGradeDB (ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-005.md](source-review-005.md) | หลักฐาน as-built จากการตรวจ source จริง: writer คะแนนเดิม score-record (ย้ายมาจาก root วันที่ 2026-10-22) |
| [auth-evidence-001.md](auth-evidence-001.md) | รับหลักฐาน BE-001: matrix ที่รับ/หักล้าง, policy ที่ยังไม่ยืนยัน, trust boundary, H5 checklist, TR-AUTH-01..07 (Rev1 · EVIDENCE — ไม่ใช่ verdict) |
| [modules.md](modules.md) | โครงสร้างโมดูลและขอบเขตระบบ (Rev2 · PROPOSED) |
| [quality-attributes.md](quality-attributes.md) | เกณฑ์คุณภาพและเกณฑ์พิสูจน์ (Rev1 · PROPOSED) |
| [archive.md](archive.md) และโฟลเดอร์ `archive/` | Verbatim history (ฉบับก่อน amendment เก็บแบบ verbatim) |

| [data-model-history-001.md](data-model-history-001.md) | Change Log เดิม Rev1–Rev5 |
| [data-evidence-001.md](data-evidence-001.md) / [ส่วน 2](data-evidence-002.md) | ผลเทียบ source กับแบบและขอบเขตสิ่งที่ยังไม่ยืนยัน |
| [data-model-review-001.md](data-model-review-001.md) | ผลตรวจความครบถ้วนของคู่มือและหลักฐาน arch ใบงาน 009 |

## ภาคผนวก canonical

| ไฟล์ | เนื้อหา / สถานะ |
|---|---|
| [learning-rules-032-034.md](learning-rules-032-034.md) | Rev1 — profile/run/freeze/สูตร/override; มติยืนยันแล้ว รอตรวจ implementation |
| [grade-rules-032-034.md](grade-rules-032-034.md) | Rev1 — mapping/partial/skip/recovery; คง release gates |

## Change Log
- 2026-10-23 — เพิ่ม auth-evidence-001 (arch ใบงาน 020); DES-004 Rev7/DES-012 Rev4 แก้เฉพาะข้อเท็จจริง/ลิงก์ สัญญา/schema ไม่เปลี่ยน
- 2026-10-23 — นายช่างบันทึก dbml-review-002: @dbml/core10.3.1/dbmlv2 ผ่านทั้งสองไฟล์ โครงสร้างและ SQL ไม่เปลี่ยน ปิดเฉพาะข้อค้าง parser ของ arch
- 2026-10-23 — Rev4: sync44REQ/180AC และ review-006; ไม่เปิด gate SQL/QA/release
- 2026-10-23 — DBML Rev4 เพิ่ม notes ทุกตาราง/450 ฟิลด์ กลุ่มสี 10 กลุ่ม และ integration 24 ตารางจากผล arch ใบงาน 010; schema/index/40 FK เดิมไม่เปลี่ยน
- 2026-10-23 — เพิ่มคู่มือ data model Rev6, dictionary 32 ตาราง/450 ฟิลด์, แผนที่ legacy พร้อมฟิลด์เชื่อม และภาคผนวกสัญญาเดิมตามผล arch ใบงาน 009; ไม่เปลี่ยน schema/สถานะตรวจรับ
- 2026-10-23 — แก้พาธ `school-bot-v2` → `school-bot` ตาม [decisions-031](../requirement/decisions-031.md)
- 2026-10-22 — แปลง index เข้าโครงมาตรฐาน baan + รับ source-review-001..005 เข้าหมวด design (ย้ายจาก root โดยนายช่าง)
- 2026-10-21 — บันทึกการเลือก OS ของผู้ใช้ตาม decisions-019; เก็บ survey เดิมเป็นหลักฐาน ไม่แก้ข้อเท็จจริง source หรืออ้าง QA ผ่าน
- 2026-10-21 — amend OS survey Rev2 และเพิ่ม Windows10 review ตาม decisions-017; ไม่ปิด G-DELIVERY/OQ-011
- 2026-10-21 — เพิ่ม hardware-survey-001 และ os-compatibility-001 เพื่อ BA-003/004 และ SA-003; ไม่ปิด human gates
- 2026-10-21 — บันทึกผู้ใช้ยืนยัน DBML เป็น baseline; คงประเด็น pending ตามขอบเขตจริง ไม่ถือว่า SQL/UX/release เสร็จแล้ว
- 2026-10-21 — Rev3: PK int4 ตาม decisions-012; คงประตู schema/compatibility เดิม
- 2026-10-21 — Rev2: amend ตาม decisions-010/011; API รวม Login อยู่ web, ใช้ 4 DB เดิม; ยัง PROPOSED รอ schema/implementation approval
- 2026-10-21 — Rev1: เสนอระบบเต็มตาม decisions-001–009 และตรวจ source จริงก่อนออกแบบ
- 2026-10-21 — MYCELIUM บันทึกผล SA จาก session จริง; แยกกฎข้อมูล/HTTP จาก data-model จึงมี 13 ไฟล์ โดยคง DES-001..007 และเนื้อหาข้อเสนอเดิม
