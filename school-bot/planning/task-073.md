# ใบงาน073 — check เอกสาร UX ฉบับแบ่งไฟล์และกฎเว็บครู

วันที่ 2026-10-26 · check / codex t2 / read-only · sessionผู้ตรวจใหม่

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→design/index.md→uxui/index.md→plan/index.md แล้วspec:
- plan/tasks-001.json เฉพาะ UX-005/007 (12+15 AC entries/25unique)
- requirement/req-043.mdถึงreq-048.md, req-036.md; decisions-023.md,025.md,034.md,039.mdถึง041.md
- design/data-model.mdตามขอบเขตroleและexactlinkedcontractsที่ต้องใช้; des-005.md,010.md,011.md,012.md; data-contract-rules.md
- projectinstructionสำหรับเว็บครู: target/sb-tech-upgrade-web-system/AGENTS.md→_docs/policy/project-policy.md→CLAUDE.md→DESIGN.md→.claude/rules/loading.md. skillSchoolBrightใช้เฉพาะส่วนที่ไม่ขัดprojectinstruction; ไม่เปลี่ยนstack

savedartifactsที่ตรวจ: uxui/int-006-admin-curriculum.md, int-006-admin-import-bank.md, int-006-admin-states.md, int-006-admin-errors-a11y.md, int-006-admin-trace.md, int-006-admin-review-signoff.md; int-007-attempt-policy.md, int-007-teacher-score.md, int-007-states.md, int-007-recovery-a11y.md, int-007-trace.md; uxui/index.md. ทุกไฟล์รวมเป็น2ชุด

artifactcomparison: planning/archive/2026-10-26-task-062-before-split/uxui/ มีต้นฉบับก่อนแบ่ง4ไฟล์ (int006main/states/trace,int007states). ตรวจsectionที่ย้ายกับไฟล์ประกอบจริงให้เนื้อหาตรง ไม่มีAC/state/Qหาย. planning/archive/2026-10-26-task-062/uxui/int-006-admin-trace.md,int-006-admin-states.md,int-007-states.md,int-007-trace.md เป็นต้นฉบับก่อนแก้rulepriority. ไม่อ่านwriterresponse/task070หรือข้ออ้างของผู้เขียน

ตรวจเฉพาะfinaldocumentcompletenessและreworkที่มีผล: filebudget<=11000UTF8B; links/sectionrefsชี้ถูกหลังย้าย; ทุกACมีflowstateในr่างไม่ใช่แค่ID; Q39–Q46ยังรอเซ็นครบ; กฎbusinessเดิมคงอยู่และcontractgapยังแจ้งตรง; เว็บครู/Level/เกณฑ์ในweb-systemใช้P9Skeletonเฉพาะloading/ปุ่มdisabledหรือprogressตอนsave/ตามDESIGNsharedtokens ไม่เหมารวมSpinnerจากskill; Desktop/adminส่วนกลางไม่ลากกฎweb-systemข้ามrepo. สำรวจkeyboard/aria/empty/error/reducedmotionตามเอกสารเท่านั้น ไม่อ้างUIruntime. ไม่ยกระดับstylisticpreferenceเป็นFAIL

ส่งfencedJSON<=2500tokens {"state":"PASS|FAIL|NEEDS_HUMAN","summary":"...","tasks":[{"id":"UX-005","verdict":"PASS|FAIL","scope":"final draft completeness; awaiting human sign-off"},{"id":"UX-007","verdict":"PASS|FAIL","scope":"final draft completeness; awaiting human sign-off"}],"findings":[],"checks_run":[],"limitations":[],"new_files":[{"path":"knowledge/school-bot/planning/check-073-ux-final-001.md","content":"รายงานพร้อมหลักฐานย่อและขอบเขต"}],"handoff":"..."}. ห้ามเขียนจริง/SQL/DB/network/build/producttests/sourceGit/rolechain/indexstatus. PASSไม่ใช่humanapprovalหรือปิดgates. ถ้าFAILระบุAC/DES/pathline+actualexpectedexactและrouteกลับowner

## Change Log
- 2026-10-26 — ตรวจฉบับsavedหลังแยกไฟล์และใช้กฎrepoที่เกี่ยวข้อง; จากAC/spec+artifactpathsเท่านั้น
