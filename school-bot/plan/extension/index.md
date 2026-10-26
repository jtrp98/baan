# SchoolBot — Index งานย่อย Rev2

เป็นส่วนต่อของ [plan/index](../index.md); คง pending ทุกงาน ไม่มี check verdict; แตก scope ที่ยืนยันแล้วเพื่อคุม1–2วัน ไม่เพิ่มfeature/phase; dependencies/gate preconditions ฉบับเต็มใช้ [JSON](../tasks-001.json)

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| [BE-024](../BE-024.md) | ทำ Guest export/ถังขยะ 30 วัน | sys | P3 | BE-009 | pending |
| [BE-025](../BE-025.md) | ทำ explicit project import กันซ้ำ | sys | P3 | BE-008, BE-009 | pending |
| [BE-026](../BE-026.md) | ทำ Guest local history และตรวจใหม่ | sys | P5 | BE-025, BE-016, BE-017 | pending |
| [BE-027](../BE-027.md) | ทำหลักสูตรกลาง revision/publish | sys | P5 | BE-002, DBA-005, BE-039 | pending |
| [BE-028](../BE-028.md) | ทำ Course Plan Sheet importer | sys | P5 | BE-027 | pending |
| [BE-029](../BE-029.md) | ทำ CourseRun/Level/Activity รายห้อง | sys | P5 | BE-027, BE-006 | pending |
| [BE-030](../BE-030.md) | ทำคลังข้อสอบ revision/policy ส่วนกลาง | sys | P5 | BE-027 | pending |
| [BE-031](../BE-031.md) | ทำ attempt/snapshot/เวลา/สุ่ม/ตรวจข้อสอบ | sys | P5 | BE-030, BE-029 | pending |
| [BE-032](../BE-032.md) | ทำ teacher override และซ่อมรายคน | sys | P5 | BE-031 | pending |
| [BE-033](../BE-033.md) | ทำ ScoringPolicy snapshot/สูตรรวม | sys | P5 | BE-029, BE-031, BE-016 | pending |
| [BE-034](../BE-034.md) | ทำเสนอ/ยืนยันเลื่อน Level ทั้งห้อง | sys | P5 | BE-033, BE-017 | pending |
| [BE-035](../BE-035.md) | ทำ GradeSlot/ScoreMapping ช่องเดิม | sys | P5 | BE-029, BE-039, DBA-007, SA-004 | pending |
| [BE-036](../BE-036.md) | ทำ preview snapshot/แปลงคะแนน | sys | P5 | BE-035, BE-033 | pending |
| [BE-037](../BE-037.md) | ทำ grade writer/ชน/CAS/receipt | sys | P5 | BE-036, SA-004, DBA-007, TP-003 | pending |
| [BE-038](../BE-038.md) | ทำ export outbox/authz/replay/recovery | sys | P5 | BE-037, BE-032 | pending |
| [BE-039](../BE-039.md) | ทำ web-principal/BFF/session และ staff bootstrap | sys | P0 | BE-001, SA-001, SEC-001 | pending |
| [FE-017](../FE-017.md) | เชื่อม Guest export/ถังขยะ | front | P3 | FE-003, BE-024, UX-002 | pending |
| [FE-018](../FE-018.md) | เชื่อมเลือกนำเข้า project/history | front | P5 | FE-017, BE-025, BE-026, UX-002, UX-004 | pending |
| [FE-019](../FE-019.md) | เชื่อม admin หลักสูตร/revision/นำเข้า | front | P5 | BE-027, BE-028, UX-005 | pending |
| [FE-020](../FE-020.md) | เชื่อม admin คลังข้อสอบ/policy | front | P5 | BE-030, UX-005 | pending |
| [FE-021](../FE-021.md) | เชื่อมข้อสอบ Desktop/ผล attempt | front | P5 | BE-031, FE-013, UX-007 | pending |
| [FE-022](../FE-022.md) | เชื่อมเว็บครู CourseRun/policy/เลื่อน Level | front | P5 | BE-029, BE-032, BE-033, BE-034, UX-007 | pending |
| [FE-023](../FE-023.md) | เชื่อมเว็บ admin โรงเรียน mapping | front | P5 | BE-035, UX-006 | pending |
| [FE-024](../FE-024.md) | เชื่อมเว็บครู preview/ชน/export status | front | P5 | FE-023, BE-038, UX-006 | pending |
| [QA-011](../QA-011.md) | ตรวจ Guest recovery/import/history | check | P5 | FE-018, TP-002 | pending |
| [QA-012](../QA-012.md) | ตรวจ curriculum/revision/Sheet | check | P5 | FE-019, BE-029, TP-001 | pending |
| [QA-013](../QA-013.md) | ตรวจข้อสอบ/policy/ซ่อม | check | P5 | FE-020, FE-021, FE-022, TP-002 | pending |
| [QA-014](../QA-014.md) | ตรวจสูตรรวมและเลื่อน Level | check | P5 | FE-022, QA-013 | pending |
| [QA-015](../QA-015.md) | ตรวจ mapping/preview/คะแนนชน | check | P5 | FE-024, TP-003, DBA-007 | pending |
| [QA-016](../QA-016.md) | ตรวจ export authz/outbox/receipt recovery | check | P5 | QA-015, BE-038 | pending |
| [UX-005](../UX-005.md) | เตรียม UX admin หลักสูตร/คลังข้อสอบ | int | P5 | BA-002, SA-002 | pending |
| [UX-006](../UX-006.md) | เตรียม UX mapping/preview/ชน/export | int | P5 | SA-004, BA-001 | pending |
| [UX-007](../UX-007.md) | เตรียม UX attempt/นโยบาย/เลื่อน Level | int | P5 | SA-002, BA-002 | pending |
| [SA-004](../SA-004.md) | เตรียม export contract และ proof pack | arch | P0 | SA-001 | **verified** (ใบงาน061 — check PASS docs-only) |
| [TP-003](../TP-003.md) | เตรียม grade parity/coexist/crash fixtures | inspect | P1 | TP-001, SA-004 | pending |
| [DBA-007](../DBA-007.md) | เตรียม cross-DB/export runtime evidence pack | vault | P1 | DBA-001, SA-004 | pending |

## Change Log
- 2026-10-23 — Rev2: เพิ่ม36งานย่อยของscopeเดิมตามspec-review-001; statusเปลี่ยนได้จากcheckผ่านผู้คุมเท่านั้น
