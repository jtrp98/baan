# SchoolBot — Canonical Plan

> สถานะปัจจุบันของแผน — เขียนทับให้เป็นความจริงวันนี้ ไม่มี Change Log (ประวัติดู `git log` ของไฟล์นี้) · เจ้าของ: gm

## Release Scope

Frozen: ระบบเต็ม 44 REQ / 187 AC (AC-036-06 logout ผูกตามคำสั่งผู้ใช้ 2026-10-28 — พฤติกรรมเดิม ไม่ใช่ feature ใหม่) / 82 TP cases (TP001-082 ครอบ AC-036-06 ตาม [Amendment005](../test-plan/tp-001-amendment-005.md)) ตาม [มติ042](../requirement/decisions-042.md) และ [scope](scope-001.md) — ไม่เพิ่ม/ลด feature เว้นผู้ใช้สั่ง · 110 tasks (74 งานเดิม + [36 งานส่วนต่อ](extension/index.md)) · 8 phases / 17 gates · ข้อมูลต่อ task อยู่ที่ [tasks-001.json](tasks-001.json)

## Waiting on Human

คิวปัจจุบัน: [Queue 007](queue-007.md) — GMตรวจ63tasksมี21localready/5partial/37waiting · กำลังทำต่อ [091](../planning/task-091.md) หลัง090 · ชุดส่งต่อเจ้าของ: [owner-packet-001](owner-packet-001.md)

- **G/Light/infra/B/BFF**: ผู้ใช้อนุญาตGatewaydevแล้วตาม046; implementation review/H5ยังรอหลักฐาน — fullLogin NOT_READY; logout transport local slice **ผ่านครบ**: B rework3 [check PASS](../planning/check-092-grpc-r3-001.md) 2234/0 + G controller r4 ตาม[มติ050](../requirement/decisions-050.md) + [JPO092](../planning/jpo-092-logout-r4-001.md) SEC001-016 CLOSED local — ลงใน JSON เป็น slice `done-local` ของ BE-006/BE-039 ผูก AC-036-06 แล้ว (ครอบเฉพาะส่วน local) — `verified` รอ full Login/H5/production · production/H5/fullLogin ยังปิด · ไม่ถามอนุญาตdevซ้ำ
- **pilot SB-W1 (ใบงาน093) ปิดแล้ว — 4 task verified**; ข้อรอคนที่เปิด: H1 (G/infra) · H2 (DB+infra privileges, license_admin) · H4 (cert/pins/custody) · H5 (DPO) · TR-AUTH-03/04 (DBA Master) · TR-AUTH-06 (legacy) · GAP-AUTH-006 (roster) — ป้อน gate ที่ QA ไม่ขวาง SB-W2 บน stub ([ผลวัด+ตาราง](../planning/pilot-093-metrics-001.md))
- **ผู้ใช้**: forward [DB cover](../db/db-safe-evidence-cover-001.md) ให้เจ้าของ DB → เจ้าของ DB ส่ง EV-01..03 → 04/05 → 06 (optional) · ยังไม่มีหลักฐานว่าส่ง/ได้รับแล้ว
- **UX เซ็นแล้ว**: ผู้ใช้อนุมัติ UX-005/007 และ expired-copy delta Q39–Q46 ตาม [decisions-043](../requirement/decisions-043.md) วันที่ 2026-10-26; ไม่อยู่ในรายการรอคนแล้ว
- **ยังเปิด**: spec Q3 (รุ่นหุ่น/firmware/calibration/stop-unplug-emergency) · ผู้ถือ cert/ช่องทางแจกจ่าย · gates security/SQL/runtime · ทดสอบหุ่นจริงยังไม่อนุญาต (decisions-038)
- **ตอบแล้ว ห้ามถามซ้ำ**: Guest/Level/ข้อสอบ/สูตร/mapping/Learner A, แบบ H4, พาธ legacy `C:\src\schoolbright\target\sb-web-academic` (clone ใหม่ 2026-10-26 branch `release/beta` อยู่ใน workspace ให้ agy โหมดเขียนอ่านได้ · 13 ไฟล์ใน [legacy-source-check-001](../planning/legacy-source-check-001.json) hash ตรงกับพาธเดิม `C:\src\sb-web-academic-dev-1` ทุกไฟล์ — evidence เก่าที่อ้างพาธเดิมยังใช้ได้), SchoolBot = 1 service ผ่าน `sb-api-gateway`, gRPC/035/cType, expired attempt = A (มติ042)

## Phases


| Phase | ขอบเขต | Tasks | Effort* |
|---|---|---:|---:|
| P0 | ฐานและเตรียม gates | 15 | 27 |
| P1 | DB integration | 5 | 8 |
| P2 | License | 5 | 9 |
| P3 | Login/Projects | 16 | 30 |
| P4 | Labs/native | 14 | 27 |
| P5 | Learning | 42 | 83 |
| P6 | Packages/acceptance | 11 | 21 |
| P7 | ส่งมอบ | 2 | 2 |

*207 person-days (สมมติฐาน — ยังไม่ยืนยัน) ไม่ใช่ deadline; phase ไม่ใช่ barrier ใช้ [DAG/คิว](dispatch-001.md)

## Tasks

ตารางนี้คือ 74 งานเดิม · อีก 36 งานอยู่ที่ [extension/index.md](extension/index.md) (รวม 110) · Owner ใช้ชื่อ role เดิม (sa/be/fe/…) resolve ผ่าน role_aliases ใน [tasks-001.json](tasks-001.json) · dependencies ในตารางย่อ — gate preconditions อยู่ในไฟล์ต่อ task และ JSON

ตรวจตามความเสี่ยง (BAAN ข้อ 13): `risk`/`wave` อยู่ใน [tasks-001.json](tasks-001.json) — slice DB→License→Login→Projects แบ่ง 5 wave · `high` ตรวจทันทีก่อนงานต่อยอด · `low` รอ wave gate · สรุปด้วย `baan --lint-plan`

Status: `pending` · `done-local` (โค้ด+test ผ่านในเครื่อง นายช่างลงหลังรัน test ซ้ำ ไม่ปิด gate) · `verified`/`blocked` (มาจาก verdict ของ check ผ่าน นายช่าง เท่านั้น)

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| [SA-001](SA-001.md) | Contracts/update | sa | P0 | — | **verified** (ใบงาน093 — [check PASS](../planning/check-093-SA-001-001.md) · [contract-review-sa-001](../design/contract-review-sa-001.md) Rev1) |
| [BE-001](BE-001.md) | Legacy auth | be | P0 | — | **verified** (ใบงาน093 — [check PASS รอบ 3](../planning/check-093-BE-001-003.md) · [auth-evidence-001](../design/auth-evidence-001.md) Rev7 · ข้อรอคน TR-AUTH-03/04/06, GAP-AUTH-006) |
| [DBA-001](DBA-001.md) | Physical map | dba | P0 | — | **verified** (ใบงาน061 — check PASS static + parser 10.3.1 evidence) |
| [DBA-002](DBA-002.md) | Core DDL | dba | P0 | DBA-001, SA-001, BE-001 | **verified** (ใบงาน094 — [check PASS](../planning/check-094-DBA-002-004-001.md) static · รัน SQL/catalog C0–C5 = คน → DBA-003) |
| [DBA-003](DBA-003.md) | Core evidence | dba | P1 | DBA-002 | pending |
| [BE-002](BE-002.md) | DB integration | be | P1 | DBA-002 (stub DB; ต่อ DB จริงหลัง DBA-003) | pending |
| [BA-001](BA-001.md) | Guest policy | ba | P0 | — | **verified** (ใบงาน061 ตาม check-060 + decisions-038) |
| [BA-002](BA-002.md) | Learning criteria | ba | P0 | — | **verified** (ใบงาน061 ตาม check-060 + decisions-038) |
| [BA-003](BA-003.md) | Robot criteria | ba | P0 | — | **verified** (ใบงาน061 ตาม check-060 + decisions-038) |
| [BA-004](BA-004.md) | Delivery criteria | ba | P0 | — | **verified** (ใบงาน061 ตาม check-060 + decisions-037/038) |
| [UX-001](UX-001.md) | Entry UX | ux | P0 | — | **verified** (ใบงาน061 — signed int-001 + check-060 PASS) |
| [UX-002](UX-002.md) | Projects UX | ux | P3 | BA-001 | **verified** (ใบงาน061 — signed int-003 + check PASS รอบ 3) |
| [UX-003](UX-003.md) | Labs UX | ux | P0 | — | **verified** (ใบงาน061 — signed int-002 + check-060 PASS) |
| [UX-004](UX-004.md) | Learning UX | ux | P5 | BA-002 | **verified** (ใบงาน061 — signed int-004 ครบ + check PASS รอบ 7) |
| [TP-001](TP-001.md) | AC matrix | tp | P0 | — | **verified** (ใบงาน061 — Amendment002/003 + check-060 PASS) |
| [TP-002](TP-002.md) | Failure fixtures | tp | P1 | TP-001 | **verified** (ใบงาน093 — [wave gate PASS](../planning/check-093-wave1-gate-001.md) · tp-002-fixture-*) |
| [SEC-001](SEC-001.md) | Trust review | sec | P0 | — | **verified** (ใบงาน093 — [check PASS](../planning/check-093-SEC-001-001.md) · [security-review-093-001](../design/security-review-093-001.md) · ข้อรอคน H1/H2/H4/H5) |
| [BE-003](BE-003.md) | Admin License | be | P2 | BE-002, SEC-001, BE-039 | pending |
| [BE-004](BE-004.md) | Signed lease | be | P2 | BE-003 | pending |
| [BE-005](BE-005.md) | Key transfer | be | P2 | BE-004 | pending |
| [BE-006](BE-006.md) | Login/session | be | P3 | BE-007, BE-001 | **done-local** (slice gRPC logout AC-036-06 local — [check092](../planning/check-092-grpc-r3-001.md)/[jpo092](../planning/jpo-092-logout-r4-001.md); full Login ยังค้าง) |
| [BE-007](BE-007.md) | Host entitlement | be | P2 | BE-005, SEC-001 | pending |
| [DBA-004](DBA-004.md) | Projects DDL | dba | P3 | DBA-001, SA-001, BA-001 | **verified** (ใบงาน094 — [check PASS](../planning/check-094-DBA-002-004-001.md) static · SQL จริง = G-PROJECT-DB ที่ QA-002) |
| [BE-008](BE-008.md) | Cloud projects | be | P3 | BE-006, DBA-004 | pending |
| [BE-009](BE-009.md) | Local projects | be | P3 | BE-007, BA-001 | pending |
| [BE-010](BE-010.md) | Host/IPC | be | P3 | BE-007, SA-003 | pending |
| [SA-003](SA-003.md) | Robot contracts | sa | P0 | — | pending |
| [BE-011](BE-011.md) | Darwin HID | be | P4 | BE-010 | pending |
| [BE-012](BE-012.md) | Darwin Serial | be | P4 | BE-010 | pending |
| [BE-013](BE-013.md) | Engine bounds | be | P4 | BE-010 | pending |
| [BE-014](BE-014.md) | Stop/read/torque | be | P4 | BE-013 | pending |
| [FE-001](FE-001.md) | License UI | fe | P2 | BE-007, UX-001 | pending |
| [FE-002](FE-002.md) | Login UI | fe | P3 | BE-006, FE-001 | pending |
| [FE-003](FE-003.md) | Projects UI | fe | P3 | BE-008, BE-009, FE-002, UX-002 | pending |
| [FE-004](FE-004.md) | Mode adapters | fe | P3 | FE-003 | pending |
| [FE-005](FE-005.md) | Shell/i18n | fe | P3 | FE-004, BE-010 | pending |
| [FE-006](FE-006.md) | Code Lab | fe | P4 | FE-004, BE-010, UX-003 | pending |
| [FE-007](FE-007.md) | Block Lab | fe | P4 | FE-004, BE-010, UX-003 | pending |
| [FE-008](FE-008.md) | Connect/profile | fe | P4 | BE-013, UX-003 | pending |
| [FE-009](FE-009.md) | Pose queue | fe | P4 | FE-008, FE-004 | pending |
| [FE-010](FE-010.md) | Sequence/stop | fe | P4 | FE-009, BE-014 | pending |
| [FE-011](FE-011.md) | Board workflow | fe | P4 | FE-010 | pending |
| [FE-012](FE-012.md) | Servo/lost | fe | P4 | FE-010 | pending |
| [SA-002](SA-002.md) | Learning contracts | sa | P5 | BA-001, BA-002, BE-001 | **verified** (ใบงาน061 — check PASS: สัญญาสามโหมด/Level/ข้อสอบ/ส่งคะแนน sync มติครบ) |
| [DBA-005](DBA-005.md) | Learning DDL | dba | P5 | SA-002, DBA-001 | pending |
| [BE-015](BE-015.md) | Learning API | be | P5 | BE-008, DBA-005, BA-005, BA-006, BE-027, BE-029 | pending |
| [BA-005](BA-005.md) | Block/Code content | ba | P5 | BA-002 | pending |
| [BA-006](BA-006.md) | Arm content | ba | P5 | BA-002 | pending |
| [BE-016](BE-016.md) | Auto grading | be | P5 | BE-015, BA-005 | pending |
| [BE-017](BE-017.md) | Teacher API | be | P5 | BE-015, BA-006 | pending |
| [FE-013](FE-013.md) | Lessons UI | fe | P5 | BE-015, BA-005, BA-006, UX-004 | pending |
| [FE-014](FE-014.md) | Auto result UI | fe | P5 | FE-013, FE-006, FE-007, BE-016 | pending |
| [FE-015](FE-015.md) | Teacher UI | fe | P5 | FE-013, FE-011, FE-012, BE-017 | pending |
| [FE-016](FE-016.md) | Progress UI | fe | P5 | FE-014, FE-015 | pending |
| [DBA-006](DBA-006.md) | Release DDL | dba | P3 | DBA-001, SA-001, SEC-001 | pending |
| [BE-018](BE-018.md) | Release API | be | P3 | BE-005, DBA-006 | pending |
| [BE-019](BE-019.md) | Update check/Prepare/Install | be | P4 | BE-018, BE-007, SA-001 | pending |
| [BE-020](BE-020.md) | Windows MSI | be | P6 | FE-005, FE-016, FE-012, BE-019 | pending |
| [BE-021](BE-021.md) | macOS PKG | be | P6 | FE-005, FE-016, FE-012, BE-011, BE-012, BE-019 | pending |
| [BE-022](BE-022.md) | Signing/assets | be | P6 | BE-020, BE-021, SEC-001 | pending |
| [BE-023](BE-023.md) | API deploy pack | be | P6 | BE-018, BE-017, BE-038, BE-039, FE-019, FE-020, FE-022, FE-024 | pending |
| [QA-001](QA-001.md) | License QA | qa | P3 | BE-005, BE-006, BE-007, FE-001, FE-002, TP-002 | pending |
| [QA-002](QA-002.md) | Projects QA | qa | P4 | FE-005, QA-001 | pending |
| [QA-003](QA-003.md) | Labs QA | qa | P4 | FE-006, FE-007, FE-011, FE-012, BE-011, BE-012, TP-002 | pending |
| [QA-004](QA-004.md) | Learning QA | qa | P5 | FE-016, QA-002 | pending |
| [QA-005](QA-005.md) | Windows robot QA | qa | P6 | FE-011, FE-012, BE-014, TP-002, BA-003 | pending |
| [QA-006](QA-006.md) | Intel robot QA | qa | P6 | QA-003, BA-003 | pending |
| [QA-007](QA-007.md) | ARM robot QA | qa | P6 | QA-003, BA-003 | pending |
| [QA-008](QA-008.md) | Windows install QA | qa | P6 | BE-022, QA-004, QA-005 | pending |
| [QA-009](QA-009.md) | macOS install QA | qa | P6 | BE-022, QA-004, QA-006, QA-007 | pending |
| [QA-010](QA-010.md) | Update/assets QA | qa | P6 | QA-008, QA-009, BE-019 | pending |
| [SEC-002](SEC-002.md) | RC Security | sec | P6 | QA-001, QA-004, BE-022, BE-023, QA-011, QA-012, QA-013, QA-014, QA-015, QA-016 | pending |
| [PM-001](PM-001.md) | Release readiness | pm | P7 | QA-010, SEC-002, BE-023, QA-011, QA-012, QA-013, QA-014, QA-015, QA-016 | pending |
| [PM-002](PM-002.md) | Release receipts | pm | P7 | PM-001 | pending |
