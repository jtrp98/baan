# ใบงาน080 — check deltaหมดเวลาตามมติ042และAC04607

วันที่ 2026-10-26 · check / codex t2 / read-only · ผู้ตรวจsessionใหม่

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→design/index.md→uxui/index.md→test-plan/index.md→plan/index.md แล้วspec/artifactsเท่านั้น:
- requirement/decisions-042.md,req-046.md AC04607,req047/048เฉพาะสูตร/งานขาด; expiredproposalcurrentnotice
- design/data-model.mdตามrole+linkedExamAttempt/policy/scoreที่เกี่ยว; des010,learningrules032034,des011เฉพาะexpiredผลรวม/Level, LUX05gapreceipt; ไม่schemaaudit/DBMLนอกscope
- uxui/int004learningแถวTestหมดเวลาและsignoff; int007attempt-policy/states/recovery-a11y/teacher-score/trace + uxuiindex; ไม่อ่านwriterresponseหรือtask076/077/078/079
- test-plan/tp001currentAmendment004และtp001-amendment004.md, traceability001MDsnapshotnotice; plan/tasks001JSONเฉพาะ4taskBE031/FE021/UX007/QA013+metadata/status และplan/queue004/evidence002/ownerpacketcurrentnotices

ตรวจจาก042ก่อนartifact: หมดเวลาปิดattemptตรวจsavedanswersทันเวลาอัตโนมัติ ข้อว่าง0 เต็มทั้งชุด ตัวอย่าง10/6/4→4/10 ไม่กดส่งยังนับครั้งและสิทธิ์ซ่อมตามsnapshotเดิม ไม่รับค้างเครื่อง/ส่งช้า. Stateexpiredมีผลคะแนนที่serverยืนยันได้แต่NULLก่อนfinalizeไม่ตี0; เฉลยตามpolicy/maxretake/weights/rosterเดิม. UXหยุดแก้→pending→readserverผล; unknownไม่อ้างสำเร็จหรือคิดคะแนนเอง ไม่มีofflineส่งย้อนหลัง. Aตอบbusinessแล้วแต่deltaUX004และQ43ยังต้องรอเซ็น; Q39–Q46อื่นยังรอhuman ห้ามถือbusinessapprovalเป็นUXsignoff

ตรวจTP081expectedครบและactualNOT_RUN, coverage81/186; legacyJoined/raw180/77เก็บถูก ไม่อ้างreruntime. CanonicalAC07มี4taskตามscopeข้างต้น ไม่มีtask/DAG/tier/owner/gateใหม่; status15/95ก่อนhuman-signoff. clock/race/idempotentfinalization/recovery/read-revealยังPROPOSED/OPENตามสัญญา ไม่ให้PASSruntime. ตรวจpathlinks/tablecolumns/filebudgetใหม่006007<=11000B; int004เป็นsignedbaselineเดิมให้ตรวจdeltaเท่านั้น ไม่ขยายรีวิวlayoutเดิม

ส่งfencedJSON<=3000tokens {"state":"PASS|FAIL|NEEDS_HUMAN","summary":"...","findings":[{"id":"C080-01","reference":"AC/DES/path:line","actual":"...","expected":"...","fix":"..."}],"checks_run":[],"limitations":[],"new_files":[{"path":"knowledge/school-bot/planning/check-080-expired-delta-001.md","content":"รายงานความสอดคล้องของdeltaเอกสารพร้อมevidence ไม่ใช่productQA"}],"handoff":"..."}. PASSเฉพาะเอกสารตามมติ042 ไม่ปิดUX/gates/taskเอง ไม่เขียนจริง/code/tests/SQL/DB/runtime/network/Git/rolechain. ถ้าFAILชี้ข้อขัดแย้งจริงไม่เอาtechnicalproofที่ประกาศOPENมาเป็นFAILเพียงเพราะยังไม่implement

## Change Log
- 2026-10-26 — ตรวจ delta หลังมติAแยกจากbaseline073; spec/AC+savedartifactpathsเท่านั้น
