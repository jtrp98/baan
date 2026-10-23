# ใบงาน 018 — inspect / TP-001 ครอบคลุม 180 AC

วันที่ 2026-10-23 · read-only · inspect tier t2 · ผู้คุม dispatch Claude → AGY → Codex (สุดท้าย) ด้วย --no-fallback

อ่าน index-first knowledge/school-bot/index.md, requirement/index.md, design/index.md, plan/index.md แล้ว plan/TP-001.md และ canonical plan/tasks-001.json revision2 ซึ่งแทนจำนวนเก่า: 44REQ/180AC/110tasks/17gates. อ่าน req-009..052 ทุก AC และสัญญาที่ต้องใช้จาก DES/data-model/rules/quality-attributes รวม decisions-032..034. ใช้ gate evidence-002, gates-001 ตามจริง. ไม่ใช้ phase เป็น barrier.

เป็นเจ้าของแผนทดสอบ ไม่เขียน tests หรือรันระบบ ไม่แก้ไฟล์/plan/QA และไม่ให้ PASS. สร้าง case set ที่ครอบคลุมทุก AC แบบตรวจสอบได้ รวม negative/boundary/race/malformed/empty และ deeper grade/auth/lease/update trust. หนึ่ง case อาจครอบหลาย AC เมื่อ action/expected ตรวจได้จริงและระบุ AC ครบ ห้ามอ้างว่า strategy ทั่วไปเท่ากับ explicit coverage. ไม่ต้องทำ 180 cases ถ้าจัดกลุ่มแล้วตรวจครบจริง.

แยก unit/integration/E2E/manual และ bridge/source-built hardware/signed installer. เคสต้องบอก fixture, action, expected, platform/store/mode และ evidence ที่ check ต้องเก็บ. Actual ทุกเคส=NOT_RUN. ไม่มี signed UX/hardware/SQL/runtime evidence ให้เป็น prerequisite รอ ไม่สร้าง criterion หรือ risk acceptance เอง. Contract ที่ไม่พอส่ง arch; AC ที่ไม่ testable ส่ง spec. เตรียม TP-001 ให้จบส่วนอิสระและบอก dependency สำหรับ TP-003.

คืน JSON เดียว ไม่ซ้ำ Markdown โดยจัดเป็น cases พร้อม ac_ids; ผู้คุมจะตรวจครบ180และ join implementation task/QA owner จาก canonical JSON รวม render matrix ให้อ่าน ไม่ต้องคัด task objects ทั้งก้อน. เป้าหมายประมาณ 10,000 tokens:
{"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_REQUIREMENT_CHANGE","summary":"...","waiting_on_human":[],"strategy":["..."],"profiles":[{"id":"...","platform":"...","store":"...","mode":"...","prerequisites":["..."]}],"cases":[{"id":"TP001-001","ac_ids":["AC-..."],"refs":["DES-...","BR-..."],"level":"unit|integration|E2E|manual|static","profile_ids":["..."],"fixture":"...","action":"...","expected":"...","evidence":"...","actual":"NOT_RUN"}],"gaps":[{"id":"...","ac_ids":[],"owner":"arch|spec|...","issue":"...","required_evidence":"..."}],"handoff":["..."]}

ทุก AC ต้องอยู่ใน cases.ac_ids อย่างน้อยหนึ่งรายการ; ใช้ IDs จาก source จริง ไม่ใช้ range แทน explicit list. ถ้าคาด coverage ไม่ครบให้รายงานรายชื่อชัดเจน ห้ามกล่าวครบโดยไม่ตรวจ. ไม่อ่าน source แบบกว้างถ้า contractเพียงพอ ไม่เรียก role.

## Change Log
- 2026-10-23 — นายช่างเปิด TP-001 Rev2 ตาม queue-002; output dataset เดียวและไม่อ้างตรวจระบบจริง
