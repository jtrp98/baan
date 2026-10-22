# P4 — สาม Labs และ native transport

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## BE-011 — เพิ่ม Darwin HID transport

- Owner: be/t3; effort: 2 person-days
- Depends: BE-010
- Gates: ไม่มี
- Outputs: Darwin HID source/tests
- Acceptance: 2arch build; discoveryไม่motion; mock timeout/cancel/cleanup
- REQ: REQ-014, REQ-024, REQ-032
- AC: ตาม acceptance/test plan
- DES: DES-006

## BE-012 — เพิ่ม Darwin Serial transport

- Owner: be/t3; effort: 2 person-days
- Depends: BE-010
- Gates: ไม่มี
- Outputs: Darwin serial source/tests
- Acceptance: mock bounded read/write/probe/disconnect/cleanup; native sourceจริง
- REQ: REQ-014, REQ-024, REQ-032
- AC: ตาม acceptance/test plan
- DES: DES-006

## BE-013 — คุม engine profile/pose/group

- Owner: be/t3; effort: 2 person-days
- Depends: BE-010
- Gates: ไม่มี
- Outputs: engine validation/tests
- Acceptance: engineบังคับ6ID/PWM/time/10000poses/batch4/run bounds; invalidไม่write
- REQ: REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-019, REQ-020
- AC: ตาม acceptance/test plan
- DES: DES-006

## BE-014 — คุม stop/read/torque/error

- Owner: be/t3; effort: 2 person-days
- Depends: BE-013
- Gates: ไม่มี
- Outputs: engine action tests
- Acceptance: cancelแยกstop; drain/readครบ/torque/errorไม่retry; ไม่มีpartial commit
- REQ: REQ-021, REQ-022, REQ-023, REQ-024
- AC: ตาม acceptance/test plan
- DES: DES-006

## FE-006 — ทำ Code Lab ตาม bounded DSL

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-004, BE-010, UX-003
- Gates: G-UX-LABS
- Outputs: Code Lab/trace
- Acceptance: DSL traceไม่สั่งหุ่น; rejectนอกDSL; 64commands/100steps/16384bytes; load16384chars
- REQ: REQ-025
- AC: AC-025-01, AC-025-02
- DES: DES-005

## FE-007 — ทำ Block Lab พร้อม bounds

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-004, BE-010, UX-003
- Gates: G-UX-LABS
- Outputs: Block Lab/compiler
- Acceptance: repeat traceตรง; reject2สาย/>64commands/>8nest; workspace roundtrip/schema
- REQ: REQ-026
- AC: AC-026-01, AC-026-02, AC-026-03
- DES: DES-005

## FE-008 — เชื่อม discovery/profile/probe

- Owner: fe/t2; effort: 2 person-days
- Depends: BE-013, UX-003
- Gates: G-UX-LABS
- Outputs: native connect UI
- Acceptance: disconnected→เลือก/ยืนยัน/probe; invalid profileปฏิเสธ; reverseได้; แก้ยืนยันใหม่; no motion
- REQ: REQ-014, REQ-015
- AC: AC-014-01, AC-014-02, AC-014-03, AC-015-01, AC-015-02, AC-015-03
- DES: DES-006

## FE-009 — เชื่อม pose editor/send queue

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-008, FE-004
- Gates: ไม่มี
- Outputs: pose workspace
- Acceptance: disconnected/torque-offไม่ส่ง; failureไม่animate; queueทีละงานค่าสุดท้าย; predictedชัด; presetไม่calibrateไม่ส่ง
- REQ: REQ-016, REQ-017
- AC: AC-016-01, AC-016-02, AC-016-03
- DES: DES-006

## FE-010 — เชื่อม app sequence/cancel/stop

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-009, BE-014
- Gates: ไม่มี
- Outputs: sequence/stop workflow
- Acceptance: 2ท่า×2=4; failหยุด; drain→stop; staleไม่ส่งต่อ; exitขอstop; ไม่อ้างphysical stop
- REQ: REQ-018, REQ-021
- AC: AC-018-01, AC-018-02, AC-018-03, AC-021-01, AC-021-02, AC-021-03, AC-021-04
- DES: DES-006

## FE-011 — เชื่อม board upload/run

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-010
- Gates: ไม่มี
- Outputs: board workflow
- Acceptance: 5ท่า=4+1; progressหลังreply; failหยุด; session upload/finite run; ไม่จบด้วยtimer
- REQ: REQ-019, REQ-020
- AC: AC-019-01, AC-019-02, AC-019-03, AC-020-01, AC-020-02, AC-020-03
- DES: DES-006

## FE-012 — เชื่อม read/torque/lost

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-010
- Gates: ไม่มี
- Outputs: servo/reconnect workflow
- Acceptance: readครบ6ก่อนcommit; wrong ID/rangeไม่แทน; torqueกันmotion; stop→relock; lostไม่retry
- REQ: REQ-022, REQ-023, REQ-024
- AC: AC-022-01, AC-022-02, AC-022-03, AC-023-01, AC-023-02, AC-023-03, AC-024-01, AC-024-02, AC-024-03
- DES: DES-006

## BE-019 — คง update check แยก install

- Owner: be/t2; effort: 1 person-days
- Depends: BE-018, BE-007
- Gates: ไม่มี
- Outputs: update bridge
- Acceptance: none=false/null/install_supported=false; checkไม่download/execute; errorไม่ขวางlocalในlease
- REQ: REQ-030
- AC: AC-030-01, AC-030-02, AC-030-03
- DES: DES-007

## QA-002 — ตรวจ projects/shell/i18n/sample

- Owner: qa/t2; effort: 2 person-days
- Depends: FE-005, QA-001
- Gates: ไม่มี
- Outputs: project/UI evidence
- Acceptance: matrix:2งานทุกโหมด/บัญชี; migrate/failure/close/3ภาษา/preview
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-001, DES-003

## QA-003 — ตรวจ Labs/IPC regression

- Owner: qa/t2; effort: 2 person-days
- Depends: FE-006, FE-007, FE-011, FE-012, BE-011, BE-012, TP-002
- Gates: ไม่มี
- Outputs: dry-run/bridge traces
- Acceptance: dry-run bounds/stale/drain/stop/read/torque/lost; ไม่อ้างhardware proof
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-001, DES-006


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
