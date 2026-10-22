# P3 — Login และหลายโครงงาน

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## UX-002 — ออกแบบหลายโครงงาน

- Owner: ux/t2; effort: 2 person-days
- Depends: BA-001
- Gates: G-GUEST
- Outputs: project flows
- Acceptance: local/cloudสามโหมด; save failure/recovery/import ตามมติ พร้อม sign-off
- REQ: REQ-011, REQ-017, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-003

## BE-006 — ทำ Login/session ใน web

- Owner: be/t3; effort: 2 person-days
- Depends: BE-007, BE-001
- Gates: G-AUTH
- Outputs: auth API/tests
- Acceptance: credential fixtureตรง; tenant/profile/logout/expiryถูก; LoginแยกLicense
- REQ: REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-004

## DBA-004 — เตรียม projects DDL/rollback

- Owner: dba/t2; effort: 2 person-days
- Depends: DBA-001, SA-001, BA-001
- Gates: G-GUEST
- Outputs: project SQL/review
- Acceptance: placement/ownership/version/constraints/rollback พร้อมคนreviewก่อนรัน
- REQ: REQ-011, REQ-033, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-003

## BE-008 — ทำหลายโครงงาน Cloud API

- Owner: be/t3; effort: 2 person-days
- Depends: BE-006, DBA-004
- Gates: G-PROJECT-DB
- Outputs: project API/tests
- Acceptance: 2งาน/โหมด Aไม่ทับB; restartคง; malformed/>1MiB/ownership/failure tests
- REQ: REQ-011, REQ-036
- AC: AC-011-01, AC-011-02, AC-011-03, AC-036-02, AC-036-03, AC-036-04
- DES: DES-003

## BE-009 — ทำหลายโครงงาน local/migration

- Owner: be/t3; effort: 2 person-days
- Depends: BE-007, BA-001
- Gates: G-GUEST
- Outputs: local store/migration
- Acceptance: 2งาน/โหมด; atomic save/error; invalid/>1MiBปฏิเสธ; migrateไม่ทับ/ไม่ลบ
- REQ: REQ-011, REQ-036
- AC: AC-011-04, AC-036-01
- DES: DES-003

## BE-010 — คุม host/IPC/lifecycle/sample

- Owner: be/t3; effort: 2 person-days
- Depends: BE-007, SA-003
- Gates: G-ROBOT-CONTRACT
- Outputs: host/engine guards
- Acceptance: trusted routing/UTF8 JSONL/matching/bounds/timeout/cancel; previewไม่แตะAPI/USB/หุ่น
- REQ: REQ-012, REQ-013, REQ-021, REQ-025, REQ-026
- AC: ตาม acceptance/test plan
- DES: DES-001

## FE-002 — เชื่อม Login/Guest entry

- Owner: fe/t2; effort: 1 person-days
- Depends: BE-006, FE-001
- Gates: G-UX-ENTRY
- Outputs: identity UI
- Acceptance: HTTPS Login; logout/expiryไม่รั่วบัญชี; Guestไม่ข้ามLicense
- REQ: REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-004

## FE-003 — เชื่อมรายการหลายโครงงาน

- Owner: fe/t2; effort: 2 person-days
- Depends: BE-008, BE-009, FE-002, UX-002
- Gates: G-UX-PROJECT
- Outputs: project library UI
- Acceptance: เลือก2งาน/โหมด local/cloud; Aไม่ทับB; errorไม่อ้างsaveสำเร็จ
- REQ: REQ-011, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-003

## FE-004 — ผูก project adapters สามโหมด

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-003
- Gates: ไม่มี
- Outputs: mode save/load adapters
- Acceptance: invalid schemaปฏิเสธ; Armท่า/กลุ่มครบ ไม่มีconnected/verified; failureไม่เปลี่ยนงาน
- REQ: REQ-011, REQ-017, REQ-025, REQ-026
- AC: AC-017-01, AC-017-02, AC-017-03, AC-025-03, AC-026-04
- DES: DES-003

## FE-005 — รักษา shell/ภาษา/close/sample

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-004, BE-010
- Gates: G-UX-ENTRY
- Outputs: shell lifecycle/i18n
- Acceptance: th/en/zh offlineคงงาน; persist/fallback; window controls; save/guard failไม่ออก
- REQ: REQ-009, REQ-010, REQ-012, REQ-013
- AC: AC-009-03, AC-010-01, AC-010-02, AC-010-03, AC-012-01, AC-012-02, AC-012-03, AC-013-01, AC-013-02, AC-013-03
- DES: DES-001

## DBA-006 — เตรียม release DDL/rollback

- Owner: dba/t2; effort: 1 person-days
- Depends: DBA-001, SA-001, SEC-001
- Gates: ไม่มี
- Outputs: release SQL/review
- Acceptance: unique version/channel/platform; audit/placement/rollback/trust reviewได้
- REQ: REQ-029, REQ-033
- AC: ตาม acceptance/test plan
- DES: DES-007

## BE-018 — ทำ persistent release API

- Owner: be/t2; effort: 2 person-days
- Depends: BE-005, DBA-006
- Gates: G-RELEASE-DB
- Outputs: release API/tests
- Acceptance: draft/duplicate/invalid/HTTPS/hash/signature tests; publishedใหม่สุดตรงplatform/channel
- REQ: REQ-029
- AC: AC-029-01, AC-029-02, AC-029-03
- DES: DES-007

## QA-001 — ตรวจ DB/License/Login

- Owner: qa/t2; effort: 2 person-days
- Depends: BE-005, BE-006, BE-007, FE-001, FE-002, TP-002
- Gates: ไม่มี
- Outputs: API/lease evidence
- Acceptance: ผลรายAC: restart/race/3วัน/denial/A→B/legacy/tenant
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-002, DES-004


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
