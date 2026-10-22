# P6 — แพ็กเกจและตรวจรับ

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## BE-020 — เตรียม Windows MSI ครบ engines

- Owner: be/t2; effort: 2 person-days
- Depends: FE-005, FE-016, FE-012, BE-019
- Gates: G-DELIVERY
- Outputs: MSI candidate
- Acceptance: repo scripts/outputแยก; consent/repair/upgrade/downgrade/retention; ไม่รวมAPI
- REQ: REQ-031
- AC: AC-031-01, AC-031-02, AC-031-03, AC-031-04
- DES: DES-007

## BE-021 — เตรียม Universal macOS PKG

- Owner: be/t3; effort: 2 person-days
- Depends: FE-005, FE-016, FE-012, BE-011, BE-012, BE-019
- Gates: G-DELIVERY
- Outputs: Universal PKG candidate
- Acceptance: Universal Intel/ARMรวมnative engines; Applications; ถอนคงProjects
- REQ: REQ-032
- AC: AC-032-01, AC-032-02, AC-032-03
- DES: DES-007

## BE-022 — เตรียม signing/notarization/assets

- Owner: be/t3; effort: 2 person-days
- Depends: BE-020, BE-021, SEC-001
- Gates: G-RELEASE-DB
- Outputs: signed artifacts/manifest/notices
- Acceptance: คนให้signingสิทธิ์; chain/notarization/hashจริง; payloadสะอาด; noticesครบ
- REQ: REQ-029, REQ-031, REQ-032
- AC: ตาม acceptance/test plan
- DES: DES-007

## BE-023 — เตรียม API deploy/restore

- Owner: be/t2; effort: 1 person-days
- Depends: BE-018, BE-017
- Gates: ไม่มี
- Outputs: deployment/rollback pack
- Acceptance: HTTPS/secrets/4DB/backup/health/restoreพร้อมreview; ยังไม่deploy shared
- REQ: REQ-027, REQ-036, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-004

## QA-005 — ตรวจหุ่นจริง Windows

- Owner: qa/t2; effort: 2 person-days
- Depends: FE-011, FE-012, BE-014, TP-002, BA-003
- Gates: G-HW
- Outputs: Windows hardware evidence
- Acceptance: source buildล่าสุด: รุ่นที่อนุญาต: calibration/stop latency/disconnect/servo/board; คนรับรอง
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-006

## QA-006 — ตรวจหุ่นจริง macOS Intel

- Owner: qa/t2; effort: 2 person-days
- Depends: QA-003, BA-003
- Gates: G-HW
- Outputs: Intel hardware evidence
- Acceptance: source buildล่าสุด: Intel native HID/Serialตามรุ่น: calibration/stop/disconnect/servo/board; คนรับรอง
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-006

## QA-007 — ตรวจหุ่นจริง macOS ARM

- Owner: qa/t2; effort: 2 person-days
- Depends: QA-003, BA-003
- Gates: G-HW
- Outputs: ARM hardware evidence
- Acceptance: source buildล่าสุด: Apple Silicon nativeตามmatrix Windows; มีค่าจริงและคนรับรอง
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-006

## QA-008 — ตรวจ Windows install lifecycle

- Owner: qa/t2; effort: 2 person-days
- Depends: BE-022, QA-004, QA-005
- Gates: G-DELIVERY
- Outputs: MSI clean-machine evidence
- Acceptance: clean:WebView2มี/ไม่มี/cancel; 3โหมด; repair/uninstallคงProjects/DeviceID; upgradeกันdowngrade; nativeหุ่นจริงจากsigned MSI
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-007

## QA-009 — ตรวจ macOS install lifecycle

- Owner: qa/t2; effort: 2 person-days
- Depends: BE-022, QA-004, QA-006, QA-007
- Gates: G-DELIVERY
- Outputs: PKG Intel/ARM evidence
- Acceptance: signed PKGเดียว:local/engines/หุ่นจริง2arch; ถอนคงdata; notarization
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-006, DES-007

## QA-010 — ตรวจ performance/update/assets

- Owner: qa/t2; effort: 2 person-days
- Depends: QA-008, QA-009, BE-019
- Gates: G-DELIVERY
- Outputs: benchmark/trust report
- Acceptance: signed RC benchmarkตามเกณฑ์; updateไม่install; hash/signature/payload/notices
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-007

## SEC-002 — ตรวจ security บน RC

- Owner: sec/t2; effort: 2 person-days
- Depends: QA-001, QA-004, BE-022, BE-023
- Gates: ไม่มี
- Outputs: findings/retest evidence
- Acceptance: RCตรวจauth/tenant/tamper/replay/key/IPC/artifact; Critical/Importantส่งคน
- REQ: REQ-027, REQ-028, REQ-029, REQ-033, REQ-034, REQ-035, REQ-036, REQ-038, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-001, DES-002, DES-004, DES-007


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
