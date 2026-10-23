# ใบงาน 017 — sys / BE-001 หลักฐาน legacy auth

วันที่ 2026-10-23 · ผู้ใช้สั่งต่อจาก handoff-001 และให้ใช้ Codex เป็นลำดับสุดท้าย: ผู้คุมเลือก Claude → AGY → Codex ด้วย --no-fallback ไม่เปลี่ยน tier

งาน read-only BE-001, sys tier t3. อ่าน index-first knowledge/school-bot/index.md, plan/index.md, design/index.md แล้ว plan/BE-001.md และแถว BE-001 ใน plan/tasks-001.json (revision2). อ่าน design/source-review-002.md, des-004.md, des-012.md, requirement/decisions-025.md และ 032.md ที่เกี่ยว. ผลรอบก่อนที่ planning/handoff-001.md; เอกสาร 44REQ/180AC/110tasks เป็น baseline ไม่ใช่ runtime PASS.

ตรวจ source จริงใน target/sb-api-gateway, target/sb-tech-upgrade-academic, target/sb-tech-upgrade-web-system ตามเส้นทาง login ที่พบ อ่าน AGENTS/CLAUDE ของ target ก่อน ไม่สแกน secrets/env/config credentials ไม่เผย literal password/token/key จริง. เป้าหมายพิสูจน์ username lookup/normalization, password encoding/hash/verification, active flags, account→student/employee mapping, SchoolId/tenant และ roles/scope. Source-review-002 ให้เพียง entity/keys ไม่พิสูจน์ verifier/JWT. ไม่สมมติ SId account เท่ากับ student/employee; ไม่สร้างตารางชดเชย.

ส่ง compatibility matrix พร้อม source:line และ sanitized synthetic fixtures ที่ derive ได้จริง แยก proven / unproven / proposed. หากขาด source ระบุ path/service/เจ้าของเทคนิคและหลักฐานที่ต้องขอ ห้ามให้คนเดา algorithm. ไม่เชื่อม DB/SQL, ไม่รันระบบหรือส่ง login จริง, ไม่แก้ source/knowledge/git ไม่เรียก role.

ตอบ JSON เดียวใน fenced json เพื่อผู้คุมบันทึก ไม่คืนทั้ง Markdown และ JSON ซ้ำ ไม่เกินประมาณ 7,000 tokens:
{"state":"DONE|BLOCKED|NEEDS_DESIGN_CHANGE","summary":"...","waiting_on_human":[],"checks":[{"command_or_read":"...","result":"..."}],"matrix":[{"topic":"...","status":"proven|unproven","behavior":"...","evidence":["relative/source:line"],"impact":"..."}],"fixtures":[{"id":"AUTH-F001","purpose":"...","synthetic_input":{},"expected":"...","basis":["source:line"],"status":"derived|needs_owner_confirmation"}],"gaps":[{"id":"...","missing":"...","owner":"...","needed_evidence":"...","blocks":["BE-006","G-AUTH"]}],"handoff":[{"role":"arch|vault|inspect","task":"...","action":"..."}]}

ไม่มี task verdict หรือ accepted risk ใหม่; DONE หมายถึงส่งหลักฐานเท่านั้น. ข้อเท็จจริงไม่พอให้ส่งเฉพาะส่วนที่ไม่พอพร้อมหลักฐาน ส่วนอิสระทำให้ครบ.

## Change Log
- 2026-10-23 — นายช่างเปิดคิว BE-001 ตาม queue-002; บันทึกลำดับ agent ที่ผู้ใช้สั่ง
