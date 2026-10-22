# P0 — ฐานและข้อเสนอปิด gate

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## SA-001 — จัด contracts/backend boundaries

- Owner: sa/t1; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: contract review pack
- Acceptance: แยก core/projects/release contracts; web/HTTPS/4DB เดิม ไม่มี SchoolBotUser
- REQ: REQ-027, REQ-029, REQ-033, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-002, DES-003, DES-004, DES-007

## BE-001 — ตรวจ legacy auth จาก source เดิม

- Owner: be/t3; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: compatibility matrix/fixtures
- Acceptance: source:line พิสูจน์ hash/profile/role/tenant; sanitized fixtures ไม่ใช้รหัสจริง
- REQ: REQ-036, REQ-038, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-004

## DBA-001 — เสนอ physical placement/constraints

- Owner: dba/t2; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: physical mapping review
- Acceptance: เทียบ16ตาราง; pending/cross-DB/null/default/audit ระบุชัด
- REQ: REQ-033
- AC: AC-033-01, AC-033-02, AC-033-03, AC-033-04
- DES: design/index.md:35

## DBA-002 — เตรียม core DDL/rollback

- Owner: dba/t2; effort: 2 person-days
- Depends: DBA-001, SA-001, BE-001
- Gates: ไม่มี
- Outputs: core SQL/rollback/runbook
- Acceptance: core SQL/rollback review ได้; int4/FK/audit ครบ; ยังไม่รัน shared
- REQ: REQ-027, REQ-028, REQ-033, REQ-034, REQ-035, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-002

## BA-001 — เตรียมคำตัดสิน Guest

- Owner: ba/t2; effort: 1 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: Guest decision pack
- Acceptance: ทางเลือกและผู้ตอบ shared-machine/recovery/import/history; ไม่ตัดสินแทน
- REQ: REQ-011, REQ-036, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-003

## BA-002 — เตรียม criteria/scope ครู

- Owner: ba/t2; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: inventory/rubric decision pack
- Acceptance: inventoryสามโหมดมีที่มา; criteria/ดาว/scope พร้อมคู่ผ่าน-ไม่ผ่านให้คนยืนยัน
- REQ: REQ-037, REQ-038, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-005

## BA-003 — เตรียมเกณฑ์หุ่นจริง

- Owner: ba/t2; effort: 1 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: hardware acceptance pack
- Acceptance: ระบุรุ่น/firmware/calibration/stop/disconnect/ผู้รับรอง/สิทธิ์ทดสอบ
- REQ: REQ-014, REQ-015, REQ-021, REQ-032
- AC: ตาม acceptance/test plan
- DES: DES-006

## BA-004 — เตรียมเกณฑ์ส่งมอบ

- Owner: ba/t2; effort: 1 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: delivery acceptance pack
- Acceptance: min OS/signing/performance/วิธีวัด/ผู้รับรองให้คนยืนยัน ไม่ถือเป้าเดิมเป็น SLA
- REQ: REQ-009, REQ-030, REQ-031, REQ-032
- AC: ตาม acceptance/test plan
- DES: DES-007

## UX-001 — ออกแบบ entry/shell ตามระบบเดิม

- Owner: ux/t2; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: entry flows/prototype
- Acceptance: flow License/Guest/Login/error/close ใช้ components/tokens เดิม พร้อม sign-off
- REQ: REQ-009, REQ-012, REQ-028, REQ-034, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-002

## UX-003 — ทบทวน UX สาม Labs

- Owner: ux/t2; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: Lab flows
- Acceptance: sample/native และสถานะหุ่นครบ; ใช้ skill/components เดิม พร้อม sign-off
- REQ: REQ-013, REQ-014, REQ-015, REQ-016, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-025, REQ-026
- AC: ตาม acceptance/test plan
- DES: DES-006

## TP-001 — จัด traceability/test matrix

- Owner: tp/t2; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: 109-AC/platform matrix
- Acceptance: 109AC มีวิธี/fixture/หลักฐาน/ผู้ตรวจ; แยก bridge/hardware/installer
- REQ: REQ-009, REQ-032, REQ-038
- AC: ตาม acceptance/test plan
- DES: design/index.md:46

## SEC-001 — ทบทวน threat/trust

- Owner: sec/t2; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: security review pack
- Acceptance: tenant/auth/lease/replay/device/key/update trust; ระบุข้อรอคน
- REQ: REQ-027, REQ-028, REQ-029, REQ-033, REQ-034, REQ-035, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-001, DES-002, DES-004, DES-007

## SA-003 — เตรียม Host/robot contract review

- Owner: sa/t1; effort: 2 person-days
- Depends: ไม่มี
- Gates: ไม่มี
- Outputs: IPC/transport review
- Acceptance: drain→stop; written/predicted/measured; Darwin HID/Serial/compatibilityชัด
- REQ: REQ-013, REQ-014, REQ-021, REQ-022, REQ-024, REQ-032
- AC: ตาม acceptance/test plan
- DES: DES-001


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
