# P5 — หลักสูตรและผลเรียนจริง

สำเนาสำหรับอ่านข้อเสนอ Planner Rev1 จาก [tasks-001.json](tasks-001.json); รอ PM รับเป็นแผนหลัก Effort เป็นสมมติฐาน ไม่ใช่กำหนดส่ง

## UX-004 — ออกแบบ Lessons/teacher/progress

- Owner: ux/t2; effort: 2 person-days
- Depends: BA-002
- Gates: G-LEARN
- Outputs: learning flows
- Acceptance: LessonsแยกLabs; pending Arm/ผลจริง/scopeตรงมติ พร้อม sign-off
- REQ: REQ-037, REQ-038, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-005

## SA-002 — สรุป learning contracts

- Owner: sa/t1; effort: 2 person-days
- Depends: BA-001, BA-002, BE-001
- Gates: G-GUEST, G-LEARN
- Outputs: learning contract review
- Acceptance: version/submit/grading/ครู/Guest historyอิงมติ; ไม่เชื่อclientผ่านเอง
- REQ: REQ-037, REQ-038, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-005

## DBA-005 — เตรียม learning DDL/rollback

- Owner: dba/t2; effort: 2 person-days
- Depends: SA-002, DBA-001
- Gates: ไม่มี
- Outputs: learning SQL/review
- Acceptance: version/learner/reviewer/tenant/history/int4/audit/rollback reviewได้
- REQ: REQ-033, REQ-037, REQ-038, REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-005

## BE-015 — ทำ curriculum/submission API

- Owner: be/t3; effort: 2 person-days
- Depends: BE-008, DBA-005, BA-005, BA-006
- Gates: G-LEARN-DB
- Outputs: learning API/tests
- Acceptance: seedเนื้อหาจริงครบinventory/version; submitผูกงาน/ผู้เรียน; เปิด/ปิดไม่ผ่าน
- REQ: REQ-037, REQ-038
- AC: AC-037-02, AC-037-03, AC-037-04
- DES: DES-005

## BA-005 — จัดเนื้อหา Block/Code จริง

- Owner: ba/t2; effort: 2 person-days
- Depends: BA-002
- Gates: G-LEARN
- Outputs: Block/Code content specification
- Acceptance: ครบapproved inventory: เป้าหมาย/คำแนะนำ/ภารกิจ/คู่ผ่าน-ไม่ผ่าน
- REQ: REQ-037, REQ-038
- AC: ตาม acceptance/test plan
- DES: DES-005

## BA-006 — จัดเนื้อหา Arm/rubric

- Owner: ba/t2; effort: 2 person-days
- Depends: BA-002
- Gates: G-LEARN
- Outputs: Arm content/rubric specification
- Acceptance: ครบapproved inventory: Arm/rubric/ที่มาcalibrationและsafety
- REQ: REQ-037, REQ-038
- AC: ตาม acceptance/test plan
- DES: DES-005

## BE-016 — ทำ Code/Block grading

- Owner: be/t3; effort: 2 person-days
- Depends: BE-015, BA-005
- Gates: ไม่มี
- Outputs: server grader/tests
- Acceptance: serverใช้criteria/version; คู่ผ่าน-ไม่ผ่านตรง; bounded; ไม่เชื่อclient
- REQ: REQ-038
- AC: AC-038-01
- DES: DES-005

## BE-017 — ทำ Arm review/progress API

- Owner: be/t3; effort: 2 person-days
- Depends: BE-015, BA-006
- Gates: ไม่มี
- Outputs: teacher/progress API/tests
- Acceptance: Arm pendingจนauthorized review; auditผู้ตรวจ/งาน; restartคง; scopeไม่ข้ามผู้เรียน
- REQ: REQ-038, REQ-039
- AC: AC-038-02, AC-038-03, AC-038-04, AC-039-01, AC-039-02, AC-039-03, AC-039-04
- DES: DES-005

## FE-013 — เชื่อม Lessons สามโหมด

- Owner: fe/t2; effort: 2 person-days
- Depends: BE-015, BA-005, BA-006, UX-004
- Gates: G-UX-LEARN
- Outputs: lesson navigation/content
- Acceptance: LessonsแยกLabs; เนื้อหาตรงmode; เปิด/ปิดไม่สร้างผ่าน
- REQ: REQ-037
- AC: AC-037-01
- DES: DES-005

## FE-014 — เชื่อม submit/ผล Code/Block

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-013, FE-006, FE-007, BE-016
- Gates: ไม่มี
- Outputs: automatic result UI
- Acceptance: ผลจริงตามcriteria ผูกผู้เรียน/ภารกิจ/งาน ไม่มีsampleดาว
- REQ: REQ-038
- AC: ตาม acceptance/test plan
- DES: DES-005

## FE-015 — เชื่อม Arm review/teacher

- Owner: fe/t2; effort: 2 person-days
- Depends: FE-013, FE-011, FE-012, BE-017
- Gates: ไม่มี
- Outputs: teacher review UI
- Acceptance: Armไม่ผ่านเอง; authorized reviewผูกผู้ตรวจ/งาน; unauthorizedปฏิเสธ
- REQ: REQ-038
- AC: ตาม acceptance/test plan
- DES: DES-005

## FE-016 — เชื่อม progress ตามบัญชี/โหมด

- Owner: fe/t2; effort: 1 person-days
- Depends: FE-014, FE-015
- Gates: ไม่มี
- Outputs: progress UI
- Acceptance: restartคงผล; teacher scope; pendingแยกผ่าน; ไม่ปนscenario/บัญชี
- REQ: REQ-039
- AC: ตาม acceptance/test plan
- DES: DES-005

## QA-004 — ตรวจ curriculum/grading/progress

- Owner: qa/t2; effort: 2 person-days
- Depends: FE-016, QA-002
- Gates: ไม่มี
- Outputs: learning E2E evidence
- Acceptance: ครบinventory; criteriaผ่าน-ไม่ผ่าน/Arm pending/scope/restart/cross-account
- REQ: ตาม refs
- AC: ตาม acceptance/test plan
- DES: DES-005


## Change Log

- 2026-10-21 — MYCELIUM จัดรูปข้อมูล Planner โดยคง IDs/dependencies/acceptance เดิม
