# ใบงาน 019 — jpo / SEC-001 ตรวจ trust จากพื้นผิวจริง

วันที่ 2026-10-23 · read-only · jpo tier t2 · ผู้คุมใช้ Claude → AGY → Codex (สุดท้าย), --no-fallback

อ่าน index-first knowledge/school-bot/index.md, requirement/index.md, design/index.md, plan/index.md แล้ว plan/SEC-001.md และแถว canonical plan/tasks-001.json revision2. อ่าน DES-001/002/004/007/012 และ des-008..011 ที่เกี่ยว auth/grade/channel/custody/H5, data-model/JSON/legacy dictionaries เฉพาะข้อมูลที่ต้องตรวจ, decisions-025..034 และ gate evidence-002/gates-001. อ่าน AGENTS/CLAUDE ของ target ก่อน actual code.

ตรวจ code จริง target/school-bot ตาม auth/license/device/replay/update และ actual dependency manifests รวมเส้น gateway/web-principal ที่จำเป็น. เริ่ม web/src/SchoolBot.Api/Program.cs, SchoolBot.Application/ManagementService.cs, SchoolBot.Infrastructure/Persistence/InMemoryManagementStore.cs, app/desktopservice.go แล้ว trace boundaryจริง. แยก actual exposed defect / planned implementation gap / deployment unknown. ห้ามใช้เอกสาร DES เป็นหลักฐานว่าระบบ implement แล้ว. Legacy no-exp token acceptance ของ decisions-025 มีขอบเขตเฉพาะเรื่องนั้น ไม่ขยายให้ข้ออื่น. ตรวจ PII/retention/logs/keys/licenses ตาม flowจริง ไม่อ่าน/เผย secrets literal, env หรือ credentials.

ไม่มี source/knowledge writes, DB/SQL, login/request จริง, network probing, hardware, code fixes หรือ role chaining. Static review ไม่เท่ากับ pentest. ถ้าประเมิน CVE/current legal status ต้อง verify แหล่ง official ปัจจุบัน; ถ้าเครื่องมือทำไม่ได้ให้บอกส่วนที่ยังไม่ได้ตรวจและหลักฐานที่ขาด ไม่ประกาศ compliant/vulnerable จากความจำ. อย่าเพิ่มข้อกำหนดกฎหมายเฉพาะโดยไม่มีฐาน.

ส่ง review สำหรับผู้คุมบันทึก security.md append-only. ข้อ Critical/Important ให้ fix + jpo re-audit เป็นทางเดินปกติ ไม่ขอคนยอมรับความเสี่ยงแทนการเตรียมวิธีแก้. ไม่ยอมรับ risk เอง. ส่ง finding→owner/task เดิม/contract ชัดเจน ไม่มี task verdict.

คืน fenced JSON เดียวไม่ซ้ำ Markdown ประมาณไม่เกิน 8,000 tokens:
{"state":"DONE|NEEDS_HUMAN","summary":"...","waiting_on_human":[],"scope":["..."],"checks":[{"check":"...","result":"...","evidence":["source:line"]}],"findings":[{"id":"SEC001-001","severity":"Critical|Important|Medium|Minor","kind":"actual_defect|planned_gap|deployment_unknown","title":"...","impact":"...","evidence":["source:line"],"fix":"...","owner":"...","task_ids":["..."],"verification":"...","status":"OPEN"}],"accepted_risks":[{"decision":"decisions-025","scope":"เฉพาะที่คนยืนยัน","limits":"..."}],"data_flows":[{"data":"...","flow":"...","controls":"...","gaps":"..."}],"unverified":["..."],"handoff":["..."]}

## Change Log
- 2026-10-23 — นายช่างเปิด SEC-001 ตาม queue-002; แยก defect/source gap/deployment unknown และคง human gates เดิม
