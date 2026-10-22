# P1 — DB integration

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## DBA-003 — ตรวจ core หลังมนุษย์รัน SQL

- Owner: dba/t2; effort: 1 person-days
- Depends: DBA-002
- Gates: G-CORE
- Outputs: catalog/rollback evidence
- Acceptance: catalog/constraints/concurrency/rollback ตรงแบบ พร้อมหลักฐานผู้รัน
- REQ: REQ-033
- AC: ตาม acceptance/test plan
- DES: design/index.md:35

## BE-002 — เชื่อม web กับ 4 DB เดิม

- Owner: be/t3; effort: 2 person-days
- Depends: DBA-003
- Gates: ไม่มี
- Outputs: repositories/config
- Acceptance: แยกcontext/tenant; restartคงข้อมูล; Clean Architecture; secrets ผ่าน config
- REQ: REQ-027, REQ-033, REQ-036
- AC: ตาม acceptance/test plan
- DES: DES-004

## TP-002 — เตรียม failure fixtures/harness

- Owner: tp/t2; effort: 2 person-days
- Depends: TP-001
- Gates: ไม่มี
- Outputs: bridge/API/clock fixtures
- Acceptance: late callback/drain/transport/DB failure/lease boundary จำลองได้ ไม่สั่งหุ่น
- REQ: REQ-013, REQ-021, REQ-024, REQ-034, REQ-035
- AC: ตาม acceptance/test plan
- DES: DES-001


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
