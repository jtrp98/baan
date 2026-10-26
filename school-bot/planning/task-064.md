# ใบงาน064 — int ร่าง UX-007 attempt/นโยบาย/เลื่อน Level

วันที่ 2026-10-26 · int / codex t2 / read-only · ผู้คุมจะบันทึกไฟล์เอง

K=C:/src/schoolbright/knowledge/school-bot. อ่าน K/index.md → uxui/index.md → requirement/index.md → design/index.md → plan/index.md และ plan/extension/index.md ก่อนเอกสารต่อไปนี้เท่านั้น:

- plan/UX-007.md และ plan/tasks-001.json เฉพาะ UX-007
- requirement/req-046.md, req-047.md, req-048.md, req-036.md, req-039.md, req-043.md; decisions-020.md, decisions-021.md, decisions-022.md, decisions-023.md, decisions-024.md, decisions-032.md, decisions-033.md, decisions-034.md, decisions-038.md, decisions-039.md, decisions-040.md, decisions-041.md (ข้ามส่วนไม่เกี่ยว)
- design/des-005.md, des-010.md, des-011.md, des-012.md, data-contract-rules.md; ตาม exact links ของสัญญาที่เกี่ยวได้
- uxui/int-001-entry.md, int-004-learning.md, int-005-mapping.md เฉพาะขอบเขตที่เชื่อม; ไม่เปลี่ยนส่วนที่เซ็นแล้ว
- plan/evidence-002.md เฉพาะ UX/auth preconditions
- skill C:/Users/jabja/.codex/plugins/cache/claude-cowork/anthropic-skills/1.0.0/skills/school-bright-design/SKILL.md ต้องอ่านและใช้สำหรับเว็บ SchoolBright; ไม่ย้าย stack
- อ่าน source UI แบบ read-only C:/src/schoolbright/target/school-bot/app/frontend/src/App.tsx; ถ้าไม่มีหน้าจริงให้บอกข้อจำกัด ไม่อ้างว่าตรวจ component ที่ไม่ได้อ่าน

ร่างใหม่ `knowledge/school-bot/uxui/int-007-attempt-policy.md` + ถ้าเกิน10KB แยก state/trace เป็น companion ที่ลิงก์ชัด. ต้องครอบ AC ของ UX-007 ทั้ง15 จาก JSONจริง: Quiz/Test/Guest rules, random/time authoritative/revision snapshots/resume/submit unknown and retryตามสัญญา, ครู override/repair policy/time, ผลคะแนน attemptและ aggregate snapshotตามมติ034, ขอบเขตครูรายห้อง, เสนอ/ยืนยันเลื่อน Levelทั้งห้อง เฉลี่ย > threshold (ไม่ใช่ >=), roster/missing=0/max level/term rollover. loading/empty/error/disabled/abnormal/auth/conflict/unknown mutation/a11y ทุก flow. ไม่เพิ่ม endpoint/datafield/businessrule. แยก Desktopเรียน/เว็บครู/admin ให้ตรง REQ. กฎ already-signed ของ int004คงเดิม แสดงรายละเอียดต่อโดยไม่เปิดคำถามซ้ำ

ข้อเสนอ UX ทั้งหมดรอผู้ใช้เซ็น; ใช้ Q43–Q46 รวม 4 คำถามที่ตัดสินชัด ไม่ซ้ำ Q1–Q42. คำถามอ่านรู้เรื่องสำหรับคนไม่ใช่ programmer มีตัวอย่าง 1–2 กรณี ไม่ผลักคำถามเทคนิคให้คนตัดสิน. ตรวจ path:line ของ spec/contract ด้วยตนเอง

ใช้กฎ SchoolBright (TH Sarabun New, spacing8/radius12, web cyan และ app orangeตามแพลตฟอร์ม, focus/48px, contrast>=4.5:1, copyไทย, emptyไม่มี CTA/spinner/stateครบ)

ส่ง fenced JSON อย่างเดียว <=7500tokens: {"state":"NEEDS_HUMAN|NEEDS_DESIGN_CHANGE|NEEDS_REQUIREMENT_CHANGE|BLOCKED","summary":"...","new_files":[{"path":"knowledge/school-bot/uxui/int-007-attempt-policy.md","content":"markdown เต็ม"}],"coverage":[{"ac":"...","section":"..."}],"signoff_questions":[{"id":"Q43","question":"...","recommendation":"..."}],"limitations":[],"handoff":"..."}. companion ใส่ new_files เพิ่ม; ไฟล์ละ~4–10KB. ห้ามเขียนไฟล์จริงทุก repo, แก้ index/status/sign-off เดิม, test/build/SQL/network/rolechain/Git. จบ output state เดียวใน JSON

## Change Log
- 2026-10-26 — เปิดใบงานจาก task-062; runner codex ตามผู้ใช้
