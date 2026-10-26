# ใบงาน082 — check spot เฉพาะ C080-01..03

วันที่ 2026-10-26 · check/codex t2/read-only · เริ่มหลัง081applyแล้ว

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→uxui/index.md→requirement/index.md→design/index.md แล้วplanning/check-080-expired-delta-001.mdเพื่อเกณฑ์3finding; artifactเฉพาะ uxui/int-007-trace.md, requirement/req-046.md, design/des-010.mdAmendment076, design/learning-ux-contract-gaps-001.mdLUX05, test-plan/tp-001-amendment-004.md. ไม่อ่านwriterresponse081/คำอ้างผู้แก้

ตรวจactual3ข้อเท่านั้น: C08001trace/TPระบุว่า076บันทึกแล้วแต่clock/race/finalize/recovery/read-revealยังOPEN; C08002ตาราง16ACต่อเนื่องมีheader/separatorและ3columnsทุกrow ไม่มีบรรทัดว่างตัด; C08003AC04601..06อ้างreqบรรทัดตรงactual. ไม่รันfull080ใหม่เมื่อbusiness/artifactอื่นไม่เปลี่ยน ไม่เพิ่มscopeหรือหาfeatureใหม่. ไม่ตรวจUI/runtime/DB/schemaหรือเปลี่ยนverdictส่วนอื่นที่ผ่าน080แล้ว. ตามกติกาroleเรื่องdata-modelอ่านเท่าที่roleบังคับแต่ไม่ขยายmodelreview

ส่งfencedJSON<=1100tokens {"state":"PASS|FAIL","summary":"...","resolved":["C080-01","C080-02","C080-03"],"findings":[],"checks_run":[],"new_files":[{"path":"knowledge/school-bot/planning/check-082-expired-spot-001.md","content":"รายงานspotสั้นพร้อมactualevidence"}],"handoff":"..."}. ห้ามเขียนจริง/แก้เอกสาร/status/SQL/DB/tests/build/network/code/Git/rolechain. PASSเฉพาะ3findingเอกสาร ไม่ปิดhumanUX/owner/gates

## Change Log
- 2026-10-26 — ตรวจเฉพาะข้อที่ตกหลังownerแก้ ไม่ทำซ้ำส่วนที่ผ่านและไม่เปลี่ยน
