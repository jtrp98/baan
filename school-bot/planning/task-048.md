# ใบงาน048 — รับคำชี้แจง cType สำหรับ Desktop Login

วันที่ 2026-10-24 · arch/Codex t1 read-only · งานแคบ 1 session ไม่มี code/SQL/runtime/network/source Git mutation

K=C:/src/schoolbright/knowledge/school-bot อ่าน index.md → plan/index.md → design/index.md แล้วเฉพาะ planning/desktop-login-owner-question-001.md, planning/desktop-login-evidence-001.json, planning/desktop-login-mapping-evidence-001.json, planning/desktop-login-wire-contract-response-001.json, design/desktop-login-adapter-001.md, design/desktop-auth-review-packet-001.md และ DES-004/012 เฉพาะข้อ actor ที่เกี่ยวถ้าจำเป็น ไม่สำรวจ source ใหม่รอบนี้

ผู้ใช้เพิ่งตอบตรงว่า “อ่อ แยก cType อะ ว่าใครนักเรียน ใครครู” หลังคำอธิบายว่าต้องรู้ว่า Login แล้วคือนักเรียนหรือครูคนใด รับเป็น category clarification ให้ใช้ trusted server cType แยก actor. Source เดิมมี CType "0" student / "1" employee; user ไม่ได้ระบุตัวเลขเอง แยกที่มานี้ให้ชัด ตรวจ exact evidence จาก033/036 ไม่ถือ unknown เป็นครู ไม่เชื่อ body/header cType เป็น authority ไม่ยก cType เป็น admin/active/tenant/device หรือ proof ว่า AccountId=ProfileId

ออก amendment สั้นเฉพาะที่จำเป็น ให้ actor/category issue นี้ชัดและไม่ถาม user ซ้ำเรื่อง column/migration. ชี้ให้ชัดว่า trusted cType ใช้ได้เมื่อใดเทียบกับการเลือก upstream ก่อน authentication; หากยังเลือก route ก่อนมี trusted cType ไม่ได้ ให้ระบุ exact technical next step จาก facts เดิม ไม่สร้าง public actor field/ลอง password หลาย routeเอง. ไม่ขยาย admission หรือเปลี่ยน canonical AccountId เงียบ ๆ ไม่สร้าง human gate ใหม่. แยกสิ่งที่คำตอบนี้ยืนยันแล้วจาก exact profile linkage ที่ทีมยังต้องตรวจให้ผู้ใช้ ไม่เรียก category clarification นี้ว่ายังไม่ได้คำตอบ

คืน fencedJSON <=2200tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","evidence":[],"edits":[{"path":"knowledge/school-bot/design/desktop-login-adapter-001.md|desktop-auth-review-packet-001.md|index.md","old":"unique exact text","new":"exact replacement"}],"next_role":"...","next_action":"concrete next technical action","remaining_evidence":[]}. ใช้ append override+precedence+Change Log; bump revision เท่าที่จำเป็นและsync design index. ผู้คุม archive ก่อนapply ห้าม role เขียน knowledge/เรียก role ต่อ/รัน SQLหรือLoginจริง. ไม่เปลี่ยน 44REQ/180AC/110pending/77TP NOT_RUN หรืออ้าง4032testsเป็น fullLogin acceptance

## Change Log
- 2026-10-24 — นายช่างรับ cType clarification แล้วส่ง arch ปรับสัญญาแคบตาม flow โดยใช้ Codex ตามคำสั่งผู้ใช้
