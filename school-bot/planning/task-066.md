# ใบงาน066 — check ตรวจเอกสาร UX-005 และ UX-007 (รอบแรก)

วันที่ 2026-10-26 · check / codex t2 / read-only · ผู้ตรวจอิสระ session ใหม่

ขอบเขต: ตรวจความครบถ้วนของร่าง UX เท่านั้น ไม่ใช่ product QA/runtime/implementation acceptance หรือ human sign-off. ไม่แก้ production/เอกสาร/status และไม่เปิด gates

K=C:/src/schoolbright/knowledge/school-bot. อ่าน K/index.md → requirement/index.md → design/index.md → uxui/index.md → plan/index.md และ plan/extension/index.md ก่อน artifact. จากนั้นอ่าน spec ก่อนร่าง:

- plan/UX-005.md, plan/UX-007.md, plan/tasks-001.json เฉพาะสอง task (12+15 AC entries; 25 unique AC)
- requirement/req-043.md ถึง req-048.md; req-036.md และ req-039.md สำหรับครู/Guest/ขอบเขต
- requirement/decisions-020.md ถึง decisions-025.md, decisions-032.md ถึง decisions-034.md, decisions-038.md ถึง decisions-041.md เฉพาะมติที่เกี่ยวข้อง
- design/data-model.md เต็มและ exact linked dictionary/JSON/rules ที่เกี่ยวกับหลักสูตร/revision/attempt/policy/CourseRun/promotion; design/des-005.md, des-010.md, des-011.md, des-012.md, data-contract-rules.md; gateway-integration-001.md เฉพาะ transport/authboundary. ไม่ audit schema/DBML นอกขอบเขต
- C:/Users/jabja/.codex/plugins/cache/claude-cowork/anthropic-skills/1.0.0/skills/school-bright-design/SKILL.md
- ร่างที่ตรวจ: uxui/int-006-admin-curriculum.md และ uxui/int-007-attempt-policy.md รวม companion ที่สองไฟล์ลิงก์ไว้โดยตรง
- ขอบเขต UX ที่เซ็นก่อน: uxui/int-004-learning.md, uxui/int-005-mapping.md เพื่อหาความขัดแย้ง; ไม่เปิดsign-offเดิมซ้ำ

ตรวจจาก saved artifacts จริง: trace AC ครบทุกข้อและมี state/flow จริงไม่ใช่แค่ใส่รหัส, role/tenant/แพลตฟอร์ม, immutable revision/four-eyes/publish, Sheet D/O/P–X/stable lesson ID, policy+attempt snapshots/random/time/resume/unknown submit, teacher overrideถูกขอบเขตและrepairรายคน, Guest/teacherCloudban, weights100/frozenRun/nonretroactive/example79→81, promotionstrict>/missing0/wholeclass/nextterm/maxlevel, empty/loading/error/disabled/abnormal/a11y/tokens. ตรวจ exactlink/path:lineหลักฐานที่ใช้ และ Markdown table cell integrity. แยกข้อเสนอUXที่เซ็นได้ออกจากcontractที่ยังPROPOSED; ห้ามอนุมัติแทนมนุษย์. ข้อขัดแย้งทางเทคนิคต้องระบุDES+actualเทียบexpected ไม่ยกระดับความชอบส่วนตัวเป็นFAIL. MissingrealUIเป็นlimitไม่ใช่FAILถ้าแจ้งตรงแล้ว

ผลคืน fencedJSON <=5000tokens {"state":"PASS|FAIL|NEEDS_HUMAN","summary":"...","tasks":[{"id":"UX-005","verdict":"PASS|FAIL","scope":"draft completeness only; awaiting human sign-off","ac_results":[{"id":"AC-...","verdict":"PASS|FAIL","evidence":"saved path:line/section"}]}],"findings":[{"id":"C066-01","task":"...","severity":"...","reference":"REQ/AC/DES:path:line","actual":"...","expected":"...","fix":"..."}],"checks_run":[],"limitations":[],"new_files":[{"path":"knowledge/school-bot/planning/check-066-ux-review-001.md","content":"รายงานตรวจฉบับเต็มภาษาไทย"}],"handoff":"..."}. ห้ามเขียนไฟล์จริง/แก้code/tests/SQL/DB/build/network/Git/rolechain. เอกสารใช้ staticverification ที่เกี่ยวข้อง ไม่สร้างunit testสมมติหรืออ้าง runtime. canonicalUXtask ยังpendingจนมีhuman-signoffที่ต้องใช้; ไม่ย้ายstatusเอง. ห้ามอ่านwriterresponse/task063/064/สรุปผู้เขียน

## Change Log
- 2026-10-26 — เตรียมใบตรวจจาก AC/spec และ artifact paths โดยไม่แนบข้ออ้างของผู้เขียน; เริ่มตรวจหลังบันทึก artifact ครบเท่านั้น
