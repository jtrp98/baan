# SchoolBot — Index งานย่อย Rev2

เป็นส่วนต่อของ [plan/index](../index.md); Amendment065 (2026-10-26): ส่วนต่อนี้ verified4/pending32 ตาม verdict061 รวมทั้งแผน verified15/pending95. ข้อความ pending ทุกงานเป็นฐาน Rev2 ที่ถูก supersede; คง scope/IDs/DAG/effort/owner/tier/gates. คิวปัจจุบัน queue-006 (memory); JSON sync15verified/95pendingแล้วตาม status-sync (memory: planning/status-sync-062-001.json); ไม่เพิ่ม verdict. ปัจจุบัน44REQ/187AC(+AC-036-06)/82TP(+TP001-082) ตาม042/078; อ้าง [หลักฐานปัจจุบัน](../index.md#release-scope).

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-024 (memory) | ทำ Guest export/ถังขยะ 30 วัน | sys | P3 | BE-009 | pending |
| BE-025 (memory) | ทำ explicit project import กันซ้ำ | sys | P3 | BE-008, BE-009 | pending |
| BE-026 (memory) | ทำ Guest local history และตรวจใหม่ | sys | P5 | BE-025, BE-016, BE-017 | pending |
| BE-027 (memory) | ทำหลักสูตรกลาง revision/publish | sys | P5 | BE-002, DBA-005, BE-039 | pending |
| BE-028 (memory) | ทำ Course Plan Sheet importer | sys | P5 | BE-027 | pending |
| BE-029 (memory) | ทำ CourseRun/Level/Activity รายห้อง | sys | P5 | BE-027, BE-006 | pending |
| BE-030 (memory) | ทำคลังข้อสอบ revision/policy ส่วนกลาง | sys | P5 | BE-027 | pending |
| BE-031 (memory) | ทำ attempt/snapshot/เวลา/สุ่ม/ตรวจข้อสอบ | sys | P5 | BE-030, BE-029 | pending |
| BE-032 (memory) | ทำ teacher override และซ่อมรายคน | sys | P5 | BE-031 | pending |
| BE-033 (memory) | ทำ ScoringPolicy snapshot/สูตรรวม | sys | P5 | BE-029, BE-031, BE-016 | pending |
| BE-034 (memory) | ทำเสนอ/ยืนยันเลื่อน Level ทั้งห้อง | sys | P5 | BE-033, BE-017 | pending |
| BE-035 (memory) | ทำ GradeSlot/ScoreMapping ช่องเดิม | sys | P5 | BE-029, BE-039, DBA-007, SA-004 | pending |
| BE-036 (memory) | ทำ preview snapshot/แปลงคะแนน | sys | P5 | BE-035, BE-033 | pending |
| BE-037 (memory) | ทำ grade writer/ชน/CAS/receipt | sys | P5 | BE-036, SA-004, DBA-007, TP-003 | pending |
| BE-038 (memory) | ทำ export outbox/authz/replay/recovery | sys | P5 | BE-037, BE-032 | pending |
| BE-039 (memory) | ทำ web-principal/BFF/session และ staff bootstrap | sys | P0 | BE-001, SA-001, SEC-001 | **done-local** (slice Gateway logout AC-036-06 local — slice r4 (memory: planning/slice-092-gateway-r4-001.md)/jpo092 (memory: planning/jpo-092-logout-r4-001.md); web-principal/BFF ยังค้าง) |
| FE-017 (memory) | เชื่อม Guest export/ถังขยะ | front | P3 | FE-003, BE-024, UX-002 | pending |
| FE-018 (memory) | เชื่อมเลือกนำเข้า project/history | front | P5 | FE-017, BE-025, BE-026, UX-002, UX-004 | pending |
| FE-019 (memory) | เชื่อม admin หลักสูตร/revision/นำเข้า | front | P5 | BE-027, BE-028, UX-005 | pending |
| FE-020 (memory) | เชื่อม admin คลังข้อสอบ/policy | front | P5 | BE-030, UX-005 | pending |
| FE-021 (memory) | เชื่อมข้อสอบ Desktop/ผล attempt | front | P5 | BE-031, FE-013, UX-007 | pending |
| FE-022 (memory) | เชื่อมเว็บครู CourseRun/policy/เลื่อน Level | front | P5 | BE-029, BE-032, BE-033, BE-034, UX-007 | pending |
| FE-023 (memory) | เชื่อมเว็บ admin โรงเรียน mapping | front | P5 | BE-035, UX-006 | pending |
| FE-024 (memory) | เชื่อมเว็บครู preview/ชน/export status | front | P5 | FE-023, BE-038, UX-006 | pending |
| QA-011 (memory) | ตรวจ Guest recovery/import/history | check | P5 | FE-018, TP-002 | pending |
| QA-012 (memory) | ตรวจ curriculum/revision/Sheet | check | P5 | FE-019, BE-029, TP-001 | pending |
| QA-013 (memory) | ตรวจข้อสอบ/policy/ซ่อม | check | P5 | FE-020, FE-021, FE-022, TP-002 | pending |
| QA-014 (memory) | ตรวจสูตรรวมและเลื่อน Level | check | P5 | FE-022, QA-013 | pending |
| QA-015 (memory) | ตรวจ mapping/preview/คะแนนชน | check | P5 | FE-024, TP-003, DBA-007 | pending |
| QA-016 (memory) | ตรวจ export authz/outbox/receipt recovery | check | P5 | QA-015, BE-038 | pending |
| UX-005 (memory) | เตรียม UX admin หลักสูตร/คลังข้อสอบ | int | P5 | BA-002, SA-002 | pending |
| UX-006 (memory) | เตรียม UX mapping/preview/ชน/export | int | P5 | SA-004, BA-001 | **verified** (ใบงาน061 — signed int-005 ครบ + check PASS รอบ 10) |
| UX-007 (memory) | เตรียม UX attempt/นโยบาย/เลื่อน Level | int | P5 | SA-002, BA-002 | pending |
| SA-004 (memory) | เตรียม export contract และ proof pack | arch | P0 | SA-001 | **verified** (ใบงาน061 — check PASS docs-only) |
| TP-003 (memory) | เตรียม grade parity/coexist/crash fixtures | inspect | P1 | TP-001, SA-004 | **verified** (ใบงาน061 — check PASS) |
| DBA-007 (memory) | เตรียม cross-DB/export runtime evidence pack | vault | P1 | DBA-001, SA-004 | **verified** (ใบงาน061 — check PASS) |

## Change Log
- 2026-10-26 — 079: sync coverage042/078; คงตารางStatus/DAG/owner/tier/effort/gates.
- 2026-10-26 — 074: แก้ notice JSON; คง Status/ประวัติ.
- 2026-10-26 — ใบงาน065: แก้คำสรุปที่ขัดตาราง; ไม่แตะ Status/verdict.
- 2026-10-23 — Rev2: เพิ่ม36งานย่อยของscopeเดิมตามspec-review-001; statusเปลี่ยนได้จากcheckผ่านผู้คุมเท่านั้น
