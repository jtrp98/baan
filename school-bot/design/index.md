# school-bot — Design Index — Rev5

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · เขียนโดย system-analyst เท่านั้น · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ des-*.md / data-model.md ที่ packet/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · ตาราง DES ด้านล่างคือรายชื่อไฟล์ contract ทั้งหมด

## Transport — precedence ใบงาน049 (2026-10-24)

Local dev slice ปัจจุบัน: [Gateway logout packet](gateway-logout-slice-001.md) ตาม arch088/มติ046 — [Bแก้รอบ1](../planning/slice-089-grpc-r1-001.md) parent4032ผ่านรอwirecheck; [GhelperPASS433](../planning/check-089-gateway-r1-001.md); Gtypedadapterกำลังทำใน089แต่fullbuildติดpackages; production registration ปิด

ใบงาน057: [gRPC contract Rev1](gateway-grpc-contract-001.md) — PROPOSED; RPC/DTO, HTTP/error mapping และ trust boundary รอ G/Light/H5 โดยเฉพาะข้อยกเว้น JWT-only สำหรับ opaque session. Gateway integration Rev4 เพิ่ม pointer เท่านั้น ฐาน transport Rev3 และ gates เดิมคงอยู่.

อ่าน [Gateway integration Rev3](gateway-integration-001.md) ก่อนข้อความ transport เก่า: Desktop/Web→HTTP G→gRPC B. ฉบับปัจจุบันคือ DES-004 Rev11, DES-012 Rev9, Login reuse Rev4, review packet Rev6, auth-evidence Rev4, modules Rev3 และ HTTP rules Rev10/contract-005 Rev1; adapter Rev4 คงเดิมเพราะ HTTP/JSON outcomes เป็น Login เดิมของ G. คำอ้าง revision เก่าด้านล่างเป็นประวัติเมื่อขัดกับส่วนนี้. มาตรฐาน transport ยืนยันแล้ว; implementation/trust/tenant/H5/Light ยังต้องพิสูจน์. HTTP logout และ 4032 local tests ไม่ปิด Gateway/gRPC/DB integration.

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
4. API ใหม่ใช้ `/v2`, JSON `snake_case` เป็น client-facing HTTP ผ่าน G; G→B ใช้ gRPC ที่ยังรอ RPC/trust mapping ตาม Gateway Rev3; DB ใช้ชื่อใน data-model ตรงตัว
5. ตัวเลข bounds ใหม่เป็นข้อเสนอ SA ไม่ใช่ performance SLA ที่ผู้ใช้อนุมัติ
6. ฉบับก่อน amendment อยู่ใน git history (ไม่คัดลอกเก็บแล้ว — ของเดิมก่อนเคลียร์ดูที่ tag `school-bot-pre-cleanup-2026-10-26`)
7. เปิด [schoolbot.dbml](schoolbot.dbml) ใน dbdiagram.io; ขอบเขต/ข้อจำกัดของภาพอยู่ใน [schema-notes.md](schema-notes.md)

สถานะเอกสารอยู่ใน index นี้เท่านั้น

พาธ source อ้างจาก `C:/src/schoolbright/target/school-bot` ส่วน REQ/มติอยู่ที่ `C:/src/schoolbright/knowledge/school-bot/requirement`

หลักฐานหลัก: `app/desktopservice.go:98`, `app/desktopstorage.go:103`, `app/internal/engine/manager.go:43`, `web/src/SchoolBot.Api/Program.cs:43`, `engines/zide/src/transport.cpp:7`

อ่านเฉพาะรายการที่อนุญาต ไม่ตามไฟล์ implementation ที่ถูก import เพิ่ม เช่น `poseEditing`, C++ request validation และ installer scripts จึงไม่อ้างว่าตรวจทุกเส้นทางครบ ไม่มี build/tests/UI/hardware หรือการเขียนไฟล์ในงานนี้

## Design Contracts

| ID | ชื่อ | สถานะ | ไฟล์ |
|---|---|---|---|
| DES-001 | Desktop host และ IPC (Rev1) | PROPOSED — รอ breaking review | [des-001.md](des-001.md) |
| DES-002 | License และ device binding (Rev3) | PROPOSED — รอ schema/security review | [des-002.md](des-002.md) |
| DES-003 | หลายโครงงาน Local/Cloud (Rev4) | PROPOSED — รอ schema/migration review | [des-003.md](des-003.md) |
| DES-004 | Identity และ school authorization (Rev11) | PROPOSED — ทาง A ยืนยันแล้ว; รอ credential compatibility ([หลักฐาน](auth-evidence-001.md)) | [des-004.md](des-004.md) |
| DES-005 | หลักสูตร ภารกิจ และผลประเมิน (Rev7) | PROPOSED — ทาง A ยืนยันแล้ว; รอ numeric rubric/evaluator | [des-005.md](des-005.md) |
| DES-006 | หุ่นจริง Windows/macOS (Rev2) | PROPOSED — รอ platform/hardware proof | [des-006.md](des-006.md) |
| DES-007 | Release และ trusted update (Rev3) | PROPOSED — รอ schema/trust approval | [des-007.md](des-007.md) |
| DES-008 | Mapping หลักสูตรกับช่องคะแนน SchoolBright (Rev4) | PROPOSED — OQ-016 ตอบแล้ว; คง H5/web-principal | [des-008.md](des-008.md) |
| DES-009 | Preview ยืนยัน และส่งคะแนนกลับ SchoolBright (Rev4) | PROPOSED — sync decisions-027..030 (G-DB ใช้บัญชี DB เดิมตาม decisions-029) และ db/review-005; export ปิดจนผ่าน G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB | [des-009.md](des-009.md) |
| DES-010 | Question Bank, Attempt และนโยบายคะแนน (Rev4) | PROPOSED — สูตร/freeze/ขอบเขตครู/ทาง A ตอบแล้ว; รอ implementation proof | [des-010.md](des-010.md) |
| DES-011 | ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง (Rev4) | PROPOSED — สูตรตอบแล้ว; รอตรวจ roster/วันสิ้นเทอม | [des-011.md](des-011.md) |
| DES-012 | Auth ข้ามระบบ: web-system / admin web / Desktop ↔ SchoolBot API (Rev9) | PROPOSED — topology และแหล่ง is_admin ยืนยันแล้ว ([decisions-035](../requirement/decisions-035.md)); รอพิสูจน์ mapping/implementation และ H5 | [des-012.md](des-012.md), [routing addendum](gateway-integration-001.md) |

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
| [data-model.md](data-model.md) | คู่มือข้อมูล Rev8 — หน้าที่ตาราง/450 ฟิลด์ ตัวอย่าง และตารางเก่า; ตรง SQL Rev7: 32ตาราง/PK32 บน SchoolBot DB |
| [data-dictionary/index.md](data-dictionary/index.md) | สารบัญ 32 ตาราง: ทุกฟิลด์ ชนิด/NULL หน้าที่ ตัวอย่าง และ FK จาก SQL |
| [data-legacy-001.md](data-legacy-001.md) | ตารางเดิมที่ใช้ ฟิลด์เชื่อม ขอบเขตอ่าน/เขียน และหลักฐาน source |
| [data-fields-001.md](data-fields-001.md) | วิธีอ่าน PK/FK/NULL/JSON และฟิลด์ร่วม |
| [data-terms-001.md](data-terms-001.md) | แยกชื่อใกล้กัน: Mission/Activity, Submission/Attempt, Assessment และชุดส่งคะแนน |
| [data-dictionary/contract-index.md](data-dictionary/contract-index.md) | สัญญา Rev5 เดิม แบ่งส่วนโดยคงชนิด/enum/JSON/กฎครบ |
| [data-json-001.md](data-json-001.md) | อธิบาย JSON: Text, กิจกรรม, ข้อสอบ/คำตอบ, นโยบาย, น้ำหนัก และ snapshot |
| [data-relations-001.md](data-relations-001.md) | แผนภาพเส้นทางข้อมูล: เนื้อหา → งาน/ข้อสอบ → ส่งคะแนนเดิม |
| [data-contract-rules.md](data-contract-rules.md) | Invariants/กติกาข้อมูล Rev8 — baseline CONFIRMED เดิม; create-license TTL 15 นาทีผู้ใช้อนุมัติตาม decisions-046, ไม่มี schema delta; UpdateDate/tenant/re-check เดิม |
| [schema-notes.md](schema-notes.md) | หมายเหตุ schema Rev7 — PK32/UQ0/FK0/CHECK0; relationships/validation เป็นกฎ application |
| [risks.md](risks.md) | สิ่งที่ต้องยืนยันก่อน implementation และประตูมนุษย์ (Rev5 · PROPOSED) |
| [hardware-survey-001.md](hardware-survey-001.md) | ผลสำรวจ hardware/OS (Rev1 · EVIDENCE/PROPOSAL — รอ physical evidence และตรวจรับรุ่น) |
| [os-compatibility-001.md](os-compatibility-001.md) | ผลสำรวจความเข้ากันได้ของ OS (Rev2 · EVIDENCE — target ถูกแทนโดย decisions-019; runtime proof ยังรอ) |
| [windows10-compatibility-001.md](windows10-compatibility-001.md) | ผลสำรวจความเข้ากันได้ของ Windows 10 (Rev1 · HISTORICAL — ผู้ใช้ยุติ Windows10 target ตาม decisions-019) |
| [amendment-proposal-001.md](amendment-proposal-001.md) | ข้อเสนอแก้แบบ (Rev1 · APPLIED — sync เข้า Rev4/DBML Rev2 ตาม decisions-026) |
| [amendment-proposal-002.md](amendment-proposal-002.md) | ข้อเสนอแก้แบบ (Rev1 · APPLIED — sync เข้า Rev4/DBML Rev2 ตาม decisions-026 (แก้ 2 จุดตาม decisions-025)) |
| [schoolbot.dbml](schoolbot.dbml) | DBML Rev7 — 32ตาราง/450ฟิลด์/PK32; ไม่มี UNIQUE/index blocks/FK; ผลตรวจล่าสุดใน planning/task-087.md; audit fields4ตัว nullable DEFAULT NULL |
| [schoolbot-integration.dbml](schoolbot-integration.dbml) | ภาพเชื่อม legacy Rev3 — 24ตาราง/112ฟิลด์; physical FK0/logical16; ห้ามใช้สร้าง SQL |
| [dbml-guide-001.md](dbml-guide-001.md) | วิธีอ่านกลุ่มสี เส้นทึบ/ประ และข้อจำกัดของภาพ |
| [dbml-review-001.md](dbml-review-001.md) | ผลตรวจ parser/ความครบถ้วน/เทียบ contract ก่อนและหลัง |
| [dbml-review-002.md](dbml-review-002.md) | ผู้คุมตรวจ parser/semantic หลัง sync032..034; structural model/SQL เดิม |
| [source-review-001.md](source-review-001.md) | หลักฐาน as-built จากการตรวจ source จริง: รายงาน as-built โหมด Block/Arm/Code และเส้นทางบทเรียน/สร้างงาน (ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-002.md](source-review-002.md) | หลักฐาน as-built จากการตรวจ source จริง: บัญชี/profile และ EF context ใน academic (Rev2 · ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-003.md](source-review-003.md) | หลักฐาน as-built จากการตรวจ source จริง: โครงสร้าง Course Plan จาก Google Sheet (ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-004.md](source-review-004.md) | หลักฐาน as-built จากการตรวจ source จริง: ระบบเกรด SchoolBright บน PGGradeDB (ย้ายมาจาก root วันที่ 2026-10-22) |
| [source-review-005.md](source-review-005.md) | หลักฐาน as-built จากการตรวจ source จริง: writer คะแนนเดิม score-record (ย้ายมาจาก root วันที่ 2026-10-22) |
| [auth-evidence-001.md](auth-evidence-001.md) | รับหลักฐาน BE-001: matrix ที่รับ/หักล้าง, policy ที่ยังไม่ยืนยัน, trust boundary, H5 checklist, TR-AUTH-01..07 + legacy รอบ002 (Rev4 · EVIDENCE — ไม่ใช่ verdict) |
| [modules.md](modules.md) | โครงสร้างโมดูลและขอบเขตระบบ (Rev3 · PROPOSED) |
| [quality-attributes.md](quality-attributes.md) | เกณฑ์คุณภาพและเกณฑ์พิสูจน์ (Rev1 · PROPOSED) |
| [data-model-history-001.md](data-model-history-001.md) | Change Log เดิม Rev1–Rev5 |
| [data-evidence-001.md](data-evidence-001.md) / [ส่วน 2](data-evidence-002.md) | ผลเทียบ source กับแบบและขอบเขตสิ่งที่ยังไม่ยืนยัน |
| [data-model-review-001.md](data-model-review-001.md) | ผลตรวจความครบถ้วนของคู่มือและหลักฐาน arch ใบงาน 009 |
| [gateway-integration-001.md](gateway-integration-001.md) | Rev3 — client HTTP→G→gRPC B; รอ implementation/trust/tenant และ G/Light review; override routing/แหล่ง is_admin ของ DES-012/auth-evidence ตาม [decisions-035](../requirement/decisions-035.md); รอพิสูจน์ mapping/implementation และ H5 |

## Amendment 076 — 2026-10-26

[DES-010 Rev4](des-010.md), [learning-rules Rev1](learning-rules-032-034.md), [DES-011 Rev5](des-011.md) และ [gap receipt Rev1](learning-ux-contract-gaps-001.md) มี dated amendment076 ตาม042/AC-046-07; คง PROPOSED รอ technical proof ไม่เปิด implementation/gates

## ช่องว่าง Learning/UX — ใบงาน071

[Gap receipt Rev1](learning-ux-contract-gaps-001.md) — LUX-01..07: technical gaps OPEN ทั้งหมด; LUX-05 ธุรกิจตอบแล้วตาม042 เหลือ technical proof ไม่ใช่ gate passed. คิวปัจจุบันใช้ [Queue 004](../plan/queue-004.md) และ [ใบงาน062](../planning/task-062.md). อ้าง requirement/index.md หลัง042: 44 REQ/186 AC; คง 15 verified/95 pending, 32 ตาราง, DES revisions/PROPOSED และ 17 gates เดิม.

## ภาคผนวก canonical

### ใบงาน060a — สัญญาเฉพาะเรื่องและชุดหลักฐาน

อ่าน DES หลักแล้วตามลิงก์ในตารางนี้; เป็นส่วนต่อสัญญาเดียวกัน ไม่เพิ่ม DES ID/AC/task. [ผลตรวจและส่งต่อ](gap-sync-review-001.md) ระบุข้อขัดกับ as-built/ขอบเขตและรายการรอคน. คง 110 tasks pending/Release Scope/dependencies/gates และ security findings เดิม; เอกสารพร้อมส่ง review ไม่ใช่ runtime acceptance

| ไฟล์ / Rev | เนื้อหา / สถานะ |
|---|---|
| [license-admin-security-001.md](license-admin-security-001.md) Rev1 | PROPOSED — License role/error/replay TTL/cleanup ต่อ DES-002 |
| [project-api-001.md](project-api-001.md) Rev1 | PROPOSED — API/ETag/immutable revision ต่อ DES-003 |
| [guest-workspace-001.md](guest-workspace-001.md) Rev1 | PROPOSED — นโยบาย Guest ยืนยันแล้ว; รายละเอียดเวลา/trash/export รอ implementation proof |
| [guest-import-001.md](guest-import-001.md) Rev1 | PROPOSED — explicit Project import/receipt/dedup ใช้ schema เดิม |
| [guest-history-001.md](guest-history-001.md) Rev1 | PROPOSED — local history/recheck/provenance; คง employee ไม่สร้างผล Cloud |
| [teacher-authority-001.md](teacher-authority-001.md) Rev1 | PROPOSED — authority intersection; roster/status/time resolver ยังขาดหลักฐาน |
| [robot-boundary-001.md](robot-boundary-001.md) Rev1 | PROPOSED — payload/drain-stop; poll 3000ms/debounce0 ติดสมมติฐาน ไม่ใช่ physical SLA |
| [release-trust-001.md](release-trust-001.md) Rev1 | PROPOSED — registry-gated signer/publisher pin; รอ custody และ re-audit |
| [update-disposition-001.md](update-disposition-001.md) Rev1 | ประวัติ disposition เดิม — ผู้ใช้เลือก explicit PrepareUpdate/InstallPreparedUpdate แล้วตาม [decisions-036](../requirement/decisions-036.md) บรรทัด 11 และตรวจรับ AC-030-04..08 ตาม [decisions-037](../requirement/decisions-037.md) บรรทัด 7; คงเอกสารเดิมและ gates/implementation เดิม |
| [credential-matrix-001.md](credential-matrix-001.md) Rev1 | DRAFT EVIDENCE PACK — process/account/สิทธิ์ที่ต้องใช้; actual grants/account names ยังไม่ยืนยัน |
| [signing-custody-001.md](signing-custody-001.md) Rev1 | DRAFT EVIDENCE PACK — ผู้ถือ/ที่เก็บ/sign/rotate/revoke/backup รอเจ้าของเติม |
| [export-proof-pack-001.md](export-proof-pack-001.md) Rev1 | DRAFT EVIDENCE PACK — outline SA-004 ครบ19ACเดิม/ห้าgate; ไม่ใช่ผลทดสอบ |
| [gap-sync-review-001.md](gap-sync-review-001.md) Rev1 | EVIDENCE — coverage ใบงาน060a และผลตรวจเอกสาร; ไม่ปิด findings/gates |
| [gap-sync-evidence-001.md](gap-sync-evidence-001.md) Rev1 | EVIDENCE — source/DDL ที่ตรวจจริงและข้อขัดกับเอกสารเดิม |

| ไฟล์ | เนื้อหา / สถานะ |
|---|---|
| [learning-rules-032-034.md](learning-rules-032-034.md) | Rev1 — profile/run/freeze/สูตร/override; มติยืนยันแล้ว รอตรวจ implementation |
| [grade-rules-032-034.md](grade-rules-032-034.md) | Rev1 — mapping/partial/skip/recovery; คง release gates |

## Desktop authentication — ใบงาน037 มี precedence เฉพาะ component

| ไฟล์ | ขอบเขต / สถานะปัจจุบัน |
|---|---|
| [gateway-outcome-component-001.md](gateway-outcome-component-001.md) | Rev1 — internal decoder มีผล local ตาม auth-flow-handoff-001; ไม่ยืนยัน full Login/Gateway/gRPC |
| [desktop-login-adapter-001.md](desktop-login-adapter-001.md) | Rev4 — 048รับ cType category; รอ pre-auth routing/linkage proof; คง037/047; full Login ready=false |
| [desktop-auth-review-packet-001.md](desktop-auth-review-packet-001.md) | Rev6 — transport ตาม Gateway Rev3; category ตอบแล้ว; ทีมตรวจ routing/profile linkage ต่อ; device/session/H5เดิม ไม่บล็อก decoder |

อ่าน037ก่อนข้อความ readiness ของ034 รวม planning/desktop-login-contract-response-001.json และ Gateway Login reuse Rev2. ไม่แก้ plan status, public contract, schema หรือ gate เดิม.

## Desktop authentication — ใบงาน034 (ประวัติก่อน037)

| ไฟล์ | ขอบเขต / สถานะ |
|---|---|
| [desktop-login-adapter-001.md](desktop-login-adapter-001.md) | Rev1 — สัญญา outcome/continuation ภายใน; public completion และ complete implementation slice ยังขาด prerequisite ตาม packet |
| [desktop-auth-review-packet-001.md](desktop-auth-review-packet-001.md) | Rev1 — trusted identity/device/transport evidence ให้เจ้าของรับต่อ; ไม่ใช่ Light approval |

อ่าน override DES-004 Rev9/DES-012 Rev7/Gateway Login reuse Rev2 ก่อนข้อความเก่า. ข้อค้าง credential compatibility ของ DES-004 หมายถึง identity/directory proof ตาม packet; ไม่บังคับ B ทำ hash/verifier ซ้ำ. คง110tasks pending/77cases NOT_RUN/Important6 OPEN จน check มี verdict เฉพาะ scope.

## จุดอ่าน Login reuse

[gateway-login-reuse-001.md](gateway-login-reuse-001.md) Rev4 — PROPOSED: reuse HTTP Login เดิมแยกจาก G→B gRPC; อ่าน DES-012 Rev9 และ Gateway integration Rev3. Desktop adapter/identity และ H5 implementation ยังรอหลักฐาน.

## หลักฐานลงโค้ดและตรวจรับล่าสุด

[Authflowreceipt](../planning/auth-flow-handoff-001.md) และ [QAround001](../qa/round-001.md) มีลำดับสถานะเหนือข้อความ037ว่าไม่มีผลimplementation/check เฉพาะlocalcomponent/logout: codeมีแล้วและcheckPASSlocalscope. คงfullLoginready=false, PG/H5/runtime/gatesเดิม

- 2026-10-24 — แก้ตาม check-061-verify4 (นายช่างสวมบท arch): schoolbot.dbml PlanCourseIds jsonb→integer[] ตรง DDL (schoolbot_db.sql:578) — annotation เท่านั้น schema ไม่เปลี่ยน; parser 10.3.1 ผ่านหลังแก้ ([evidence-003](dbml-parser-evidence-003.json): 32 ตาราง/450 ฟิลด์)

## Change Log
- 2026-10-26 — Amendment076: เพิ่ม pointers ผล expired ตาม042; LUX-05 เหลือ technical proof คง PROPOSED/schema/DTO/gates
- 2026-10-26 — ใบงาน071: เพิ่ม pointer gap receipt Learning/UX และ Queue 004; แก้ disposition pointer ตาม036/037 โดยคงฉบับเดิมเป็นประวัติ; ไม่เปลี่ยน DES revisions/PROPOSED, counts หรือ gates
- 2026-10-24 — Rev5: ใบงาน060a amend DES-002..007/rules/schema-notes และเชื่อมสัญญาย่อย/SA-004; เก็บก่อนแก้พร้อม SHA256; ไม่เปลี่ยน task status/scope/dependencies/gates
- 2026-10-24 — ใบงาน057: เพิ่ม pointer ไป gateway-grpc-contract-001 Rev1 และ Gateway Rev4 เฉพาะ pointer; ไม่เปลี่ยน task status/gates/QA verdict
- 2026-10-24 — ใบงาน050: sync operative routing/diagram/HTTP semantics และ Rev; คง schema/gates/QA และประวัติ049
- 2026-10-24 — ใบงาน049: Gateway Rev3/DES-012 Rev8/reuse Rev3/packet Rev5 ชี้ REST→gRPC และขอบเขต HTTP logout; adapter Rev4 คงเดิม ไม่เปลี่ยน counts/tasks/QA verdict
- 2026-10-24 — ใบงาน048: adapter/packet Rev4 override เฉพาะ cType/category/routing; คง44REQ/180AC/110pending/77TP NOT_RUN; 4032testsไม่ใช่ fullLogin acceptance
- 2026-10-24 — รับimplementation039/038/042และcheckเฉพาะscope; ไม่แก้สัญญาหรือschemaจากผลunit tests

- 2026-10-24 — ใบงาน047: adapter/packet Rev3 มี precedence เฉพาะ request bounds และ future public error mapper; component037ไม่เปลี่ยน, full Login ready=false และ plan statusเดิม
- 2026-10-23 — ใบงาน037: เพิ่ม gateway-outcome-component Rev1; adapter/packet Rev2 อนุญาต internal web decoder โดยไม่มี production caller; full Login ready=false, ไม่มี source/SQL/runtime/check verdict ใหม่
- 2026-10-23 — ใบงาน034: DES-004 Rev9/DES-012 Rev7/Login reuse Rev2 พร้อม Desktop adapter และ review packet; complete backend slice ยังไม่พร้อม ไม่มี source/SQL/runtime หรือ check verdict ใหม่
- 2026-10-23 — ใบงาน032 รับ task031/Git metadata; คง110tasks pending/77cases NOT_RUN/Important6 OPEN ไม่ปิด G-AUTH/H5
- 2026-10-23 — ใบงาน030: sync [decisions-035](../requirement/decisions-035.md) ปิดนโยบายแหล่ง is_admin (ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่ง server + คง superadmin เดิม); คง110tasks pending/77cases NOT_RUN/Important6 OPEN ไม่ปิด G-AUTH/H5
- 2026-10-23 — ใบงาน029: DES-012 Rev5/auth-evidence Rev3 และ gateway-integration Rev1; คง110tasks pending/77cases NOT_RUN/Important6 OPEN ไม่ปิด gate
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
- 2026-10-26 — ผู้คุมต่อแถวตารางสารบัญที่ถูกบรรทัดว่างคั่น ไม่เปลี่ยนเนื้อหา สถานะ หรือมติ
