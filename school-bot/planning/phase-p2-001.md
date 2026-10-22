# P2 — License

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## BE-003 — ทำ persistent admin License

- Owner: be/t3; effort: 2 person-days
- Depends: BE-002, SEC-001
- Gates: ไม่มี
- Outputs: admin API/tests
- Acceptance: tests:503/401/201/invalid/1device/restart; keyครั้งเดียว; listไม่รั่ว
- REQ: REQ-027
- AC: AC-027-01, AC-027-02, AC-027-03, AC-027-04
- DES: DES-002

## BE-004 — ทำ activate/validate/lease

- Owner: be/t3; effort: 2 person-days
- Depends: BE-003
- Gates: ไม่มี
- Outputs: license API/signed lease
- Acceptance: raceเหลือ1binding; validateไม่เพิ่ม; inactiveปฏิเสธ; signed leaseผูกเครื่องจากonline success
- REQ: REQ-028, REQ-034
- AC: AC-028-01, AC-028-02, AC-028-03
- DES: DES-002

## BE-005 — ทำ admin ย้าย Key

- Owner: be/t3; effort: 1 person-days
- Depends: BE-004
- Gates: ไม่มี
- Outputs: unbind API/tests
- Acceptance: unauthorizedปฏิเสธ; A→BทันทีKeyเดิม; Aไม่ต่อlease; expiryเดิม
- REQ: REQ-035
- AC: AC-035-01, AC-035-02, AC-035-04
- DES: DES-002

## BE-007 — ทำ host entitlement/secure storage

- Owner: be/t3; effort: 2 person-days
- Depends: BE-005, SEC-001
- Gates: ไม่มี
- Outputs: host authorization
- Acceptance: first-online/3วัน; restartไม่ต่อ; denialชนะcache; tamper/copyข้ามเครื่องปฏิเสธ
- REQ: REQ-009, REQ-028, REQ-034, REQ-035
- AC: AC-034-01, AC-034-02, AC-034-03, AC-034-04, AC-034-05, AC-034-06, AC-035-03, AC-035-05
- DES: DES-002

## FE-001 — เชื่อม License UI

- Owner: fe/t2; effort: 2 person-days
- Depends: BE-007, UX-001
- Gates: G-UX-ENTRY
- Outputs: activation UI
- Acceptance: ไม่มีLicenseเข้า3โหมดไม่ได้ทั้งGuest/Login; invalidกรอกใหม่; leaseตรงhost
- REQ: REQ-009, REQ-028, REQ-034
- AC: AC-009-01, AC-009-02, AC-028-04
- DES: DES-002


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
