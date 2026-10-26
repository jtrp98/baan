# ใบงาน063 — int ร่าง UX-005 admin หลักสูตร/คลังข้อสอบ

วันที่ 2026-10-26 · int / codex t2 / read-only · ผู้คุมจะบันทึกไฟล์เอง

K=C:/src/schoolbright/knowledge/school-bot. อ่าน K/index.md → uxui/index.md → requirement/index.md → design/index.md → plan/index.md และ plan/extension/index.md ก่อนเอกสารต่อไปนี้เท่านั้น:

- plan/UX-005.md และ plan/tasks-001.json เฉพาะ UX-005
- requirement/req-043.md, req-044.md, req-045.md, req-046.md; decisions-020.md, decisions-021.md, decisions-022.md, decisions-023.md, decisions-024.md, decisions-032.md, decisions-034.md, decisions-038.md, decisions-039.md, decisions-040.md, decisions-041.md (ข้ามส่วนไม่เกี่ยว)
- design/des-005.md, des-010.md, des-012.md, gateway-integration-001.md, data-contract-rules.md; ตาม exact links ของสัญญาที่เกี่ยวข้องได้
- uxui/int-004-learning.md, uxui/int-005-mapping.md เฉพาะขอบเขตเชื่อมและหมายเลข Q ล่าสุด
- plan/evidence-002.md เฉพาะ UX/admin/auth preconditions
- skill C:/Users/jabja/.codex/plugins/cache/claude-cowork/anthropic-skills/1.0.0/skills/school-bright-design/SKILL.md ต้องอ่านและใช้สำหรับเว็บ SchoolBright; ห้ามย้าย stack/สร้างสีใหม่
- อ่าน source UI ที่เกี่ยวข้องแบบ read-only: C:/src/schoolbright/target/school-bot/app/frontend/src/App.tsx และ C:/src/schoolbright/target/sb-tech-upgrade-web-system/AGENTS.md (ถ้ามี); ไม่ค้นทั้ง repo ถ้าไม่พบหน้าจริงให้แจ้งข้อจำกัด ไม่อ้างตรวจ component ที่ไม่ได้อ่าน

ร่างใหม่ `knowledge/school-bot/uxui/int-006-admin-curriculum.md` + ถ้าเกิน 10KB แยกส่วน state/trace เป็นไฟล์ companion ที่ลิงก์ชัด. ต้องครอบ AC ของ UX-005 ทั้ง 12 (ใช้ JSON จริง), task flows admin หลักสูตร/revision/publish/nonretroactive, ลำดับ lesson stable ID, import Course Plan Sheet preview/validate/atomic failure/duplicate, QuestionBank revision/policy, auth/role/tenant, empty/loading/error/disabled/abnormal/ไม่ทราบผล mutation/retry/conflict ตามสัญญา. ห้ามสร้าง endpoint/data field/business choice ใหม่. แยก Desktop เรียน/เว็บครู/admin ตาม REQ. ข้อเสนอ UX ทั้งหมดรอผู้ใช้เซ็น; ใช้ Q39–Q42 รวม 4 ข้อที่ตัดสินชัด ไม่ซ้ำ Q1–Q38. โปรดตรวจ constraints/references ด้วยตนเองและอ้าง path:line ในร่าง

ใช้กฎ SchoolBright (TH Sarabun New, spacing8, radius12, web cyan, focus/48px, contrast>=4.5:1, Thai copy, empty ไม่มี CTA, spinner, state ครบ). คำถามเซ็นต้องเข้าใจได้โดยคนไม่ใช่ programmer พร้อมตัวอย่าง 1–2 กรณี ไม่สอดแทรกคำถามเทคนิคที่ทีมต้องแก้เอง

ส่ง fenced JSON อย่างเดียว <=7500 tokens: {"state":"NEEDS_HUMAN|NEEDS_DESIGN_CHANGE|NEEDS_REQUIREMENT_CHANGE|BLOCKED","summary":"...","new_files":[{"path":"knowledge/school-bot/uxui/int-006-admin-curriculum.md","content":"markdown เต็ม"}],"coverage":[{"ac":"...","section":"..."}],"signoff_questions":[{"id":"Q39","question":"...","recommendation":"..."}],"limitations":[],"handoff":"..."}. ถ้ามี companion ใช้ new_files เพิ่ม; แต่ละไฟล์ ~4–10KB. ไม่เขียนไฟล์จริงทุก repo, ไม่แก้ index/status/sign-off เดิม, ไม่รัน test/build/SQL/network/role chain/Git. จบด้วย output state เดียวใน JSON

## Change Log
- 2026-10-26 — เปิดใบงานจาก task-062; runner codex ตามผู้ใช้
