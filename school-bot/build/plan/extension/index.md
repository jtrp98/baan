# SchoolBot — งานส่วนต่อ

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เป็น 36 งานของขอบเขตเดิมใน [แผนหลัก](../index.md) สถานะใช้ตารางด้านล่าง คง scope, ID, dependency, effort, owner, tier และเงื่อนไขอนุมัติเดิม จำนวน REQ/AC/TP ใช้แผนหลัก BFF คือ Backend for Frontend; CAS คือ Compare-and-Swap; DDL คือคำสั่งกำหนดโครงสร้างฐานข้อมูล

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-024 | ทำ Guest export/ถังขยะ 30 วัน | sys | P3 | BE-009 | pending |
| BE-025 | ทำ explicit project import กันซ้ำ | sys | P3 | BE-008, BE-009 | pending |
| BE-026 | ทำ Guest local history และตรวจใหม่ | sys | P5 | BE-025, BE-016, BE-017 | pending |
| BE-027 | ทำหลักสูตรกลาง revision/publish | sys | P5 | BE-002, DBA-005, BE-039 | verified |
| BE-028 | ทำ Course Plan Sheet importer | sys | P5 | BE-027 | pending |
| BE-029 | ทำ CourseRun/Level/Activity รายห้อง | sys | P5 | BE-027, BE-006 | pending |
| BE-030 | ทำคลังข้อสอบ revision/policy ส่วนกลาง | sys | P5 | BE-027 | done-local |
| BE-031 | ทำ attempt/snapshot/เวลา/สุ่ม/ตรวจข้อสอบ | sys | P5 | BE-030, BE-029 | pending |
| BE-032 | ทำ teacher override และซ่อมรายคน | sys | P5 | BE-031 | pending |
| BE-033 | ทำ ScoringPolicy snapshot/สูตรรวม | sys | P5 | BE-029, BE-031, BE-016 | pending |
| BE-034 | ทำเสนอ/ยืนยันเลื่อน Level ทั้งห้อง | sys | P5 | BE-033, BE-017 | pending |
| BE-035 | ทำ GradeSlot/ScoreMapping ช่องเดิม | sys | P5 | BE-029, BE-039, DBA-007, SA-004 | pending |
| BE-036 | ทำ preview snapshot/แปลงคะแนน | sys | P5 | BE-035, BE-033 | pending |
| BE-037 | ทำ grade writer/ชน/CAS/receipt | sys | P5 | BE-036, SA-004, DBA-007, TP-003 | pending |
| BE-038 | ทำ export outbox/authz/replay/recovery | sys | P5 | BE-037, BE-032 | pending |
| BE-039 | ทำ web-principal/BFF/session และ staff bootstrap | sys | P0 | BE-001, SA-001, SEC-001 | verified (normal) |
| FE-017 | เชื่อม Guest export/ถังขยะ | front | P3 | FE-003, BE-024, UX-002 | pending |
| FE-018 | เชื่อมเลือกนำเข้า project/history | front | P5 | FE-017, BE-025, BE-026, UX-002, UX-004 | pending |
| FE-019 | เชื่อม admin หลักสูตร/revision/นำเข้า | front | P5 | BE-027, BE-028, UX-005 | pending |
| FE-020 | เชื่อม admin คลังข้อสอบ/policy | front | P5 | BE-030, UX-005 | pending |
| FE-021 | เชื่อมข้อสอบ Desktop/ผล attempt | front | P5 | BE-031, FE-013, UX-007 | pending |
| FE-022 | เชื่อมเว็บครู CourseRun/policy/เลื่อน Level | front | P5 | BE-029, BE-032, BE-033, BE-034, UX-007 | pending |
| FE-023 | เชื่อมเว็บ admin โรงเรียน mapping | front | P5 | BE-035, UX-006 | pending |
| FE-024 | เชื่อมเว็บครู preview/ชน/export status | front | P5 | FE-023, BE-038, UX-006 | pending |
| QA-011 | ตรวจ Guest recovery/import/history | check | P5 | FE-018, TP-002 | pending |
| QA-012 | ตรวจ curriculum/revision/Sheet | check | P5 | FE-019, BE-029, TP-001 | pending |
| QA-013 | ตรวจข้อสอบ/policy/ซ่อม | check | P5 | FE-020, FE-021, FE-022, TP-002 | pending |
| QA-014 | ตรวจสูตรรวมและเลื่อน Level | check | P5 | FE-022, QA-013 | pending |
| QA-015 | ตรวจ mapping/preview/คะแนนชน | check | P5 | FE-024, TP-003, DBA-007 | pending |
| QA-016 | ตรวจ export authz/outbox/receipt recovery | check | P5 | QA-015, BE-038 | pending |
| UX-005 | เตรียม UX admin หลักสูตร/คลังข้อสอบ | int | P5 | BA-002, SA-002 | pending |
| UX-006 | เตรียม UX mapping/preview/ชน/export | int | P5 | SA-004, BA-001 | verified |
| UX-007 | เตรียม UX attempt/นโยบาย/เลื่อน Level | int | P5 | SA-002, BA-002 | pending |
| SA-004 | เตรียม export contract และ proof pack | arch | P0 | SA-001 | verified |
| TP-003 | เตรียม grade parity/coexist/crash fixtures | inspect | P1 | TP-001, SA-004 | verified |
| DBA-007 | เตรียม cross-DB/export runtime evidence pack | vault | P1 | DBA-001, SA-004 | verified |

## หลักฐาน

- BE-039 (ทำ web-principal/BFF/session และ staff bootstrap): **done-local** (ส่วน Gateway logout AC-036-06 local — ส่วน r4 (memory: planning/slice-092-gateway-r4-001.md)/jpo092 (memory: planning/jpo-092-logout-r4-001.md); web-principal/BFF ยังค้าง)
- UX-006 (เตรียม UX mapping/preview/ชน/export): **verified** (งาน061 — signed int-005 ครบ + check PASS รอบ 10)
- SA-004 (เตรียม export contract และ proof pack): **verified** (งาน061 — check PASS docs-only)
- TP-003 (เตรียม grade parity/coexist/crash fixtures): **verified** (งาน061 — check PASS)
- DBA-007 (เตรียม cross-DB/export runtime evidence pack): **verified** (งาน061 — check PASS)

- plan/queue-006.md (memory), planning/status-sync-062-001.json (memory): เดิมสรุปส่วนต่อ verified 4/pending 32 และรวมทั้งแผน verified 15/pending 95 ก่อนสถานะใหม่ในตาราง ไม่ใช้ตัวเลขเก่าแทนสถานะปัจจุบัน
- เดิมอ้าง 44 REQ/187 AC รวม AC-036-06 (logout ปลอดภัย) และ 82 TP รวม TP001-082 ตามมติ 042 (ผลข้อสอบหมดเวลา) และงาน 078 ดู [แผนหลัก](../index.md#release-scope)
