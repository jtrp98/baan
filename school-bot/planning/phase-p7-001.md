# P7 — ส่งมอบระบบเต็ม

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## PM-001 — รวบรวม release readiness

- Owner: pm/t2; effort: 1 person-days
- Depends: QA-010, SEC-002, BE-023
- Gates: ไม่มี
- Outputs: full-scope release pack
- Acceptance: ครบ31REQ/109AC evidence; scopeเดิม; RC/SQL/rollback/signing/hardware/คู่มือพร้อม
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: ตามแผนรวม

## PM-002 — ประสานส่งมอบ/บันทึก released

- Owner: pm/t2; effort: 1 person-days
- Depends: PM-001
- Gates: G-SEC, G-QA, G-RELEASE
- Outputs: deployment/publication receipts; handover
- Acceptance: คนรันshared SQL/deploy/publish; smokeรุ่นจริง; ผู้ตรวจรับยอมรับ; receiptsพิสูจน์released
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: ตามแผนรวม


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
