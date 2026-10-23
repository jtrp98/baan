# ใบงาน 014 — gm reconcile แผนโครงการ SchoolBot

วันที่ของงาน: 2026-10-23 · ผู้ใช้สั่งส่งต่อ spec→arch→gm; เป็นโครงการใหญ่เดิม 74 งาน ไม่ใช่สร้างแผนโครงการใหม่

spec DONE/bันทึกแล้ว planning/spec-review-001.md, spec-response-001.json; 44 REQ/180 AC, 3 PARTIAL/9 CLOSED; arch กำลัง sync เอกสาร task-013 ให้แผนคง precondition ตรวจcontractล่าสุด ไม่อ้างอนุมัติแล้ว vault กำลังตรวจtask-012 ไม่มีคำสั่งimplement/deploy/SQLในrunนี้

อ่าน index-first knowledge/school-bot/index.md, requirement/index.md, plan/index.md, design/index.md, db/index.md, open-questions/index.md แล้วอ่าน planning/spec-review-001.md, task-011.md,task-013.md; requirement/scope.md, decisions-014.md,015.md,016.md,019.md,020.md,021.md,022.md,023.md,024.md,025.md,026.md,027.md,028.md,029.md,030.md,031.md,032.md,033.md,034.md และ req-009.md..req-052.md เฉพาะเมื่อใช้เชื่อม AC; plan/tasks-001.json, scope-001.md, dispatch-001.md, gates-001.md และใบงานplan/<id>.mdที่canonicalJSONชี้ซึ่งต้องamendเท่านั้น; backlog.md; design/des-008.md,009.md,010.md,011.md,012.md และdb/review-005.md ไม่อ่านsource/secrets

เป้าหมายจัดแผนกับ requirementอนุมัติธุรกิจแล้วทั้งหมด โดยไม่เพิ่ม featureใหม่ ไม่ลดระบบเต็ม คงtaskIDsเดิม/phaseIDsเดิม/17gateIDsเดิม คงสถานะexistingtasksทุกตัวpendingตามเดิมเพราะไม่มีcheck verdict การปิดOQ014/016/เลือกLearnerAไม่เท่ากับตรวจรับSQL/UX/QA/security/release

แก้canonicalJSON, plan/index, scope, dispatch, gates และใบงานที่ได้รับผลให้ตรงกัน; ครอบคลุมACจริง180ทุกข้อรวมGuest040..042 และLevel/ข้อสอบ/นำเข้า/mapping/export043..052ที่แผน109ACเดิมขาด อย่าเพียงแปะทุกACในQAงานเดียว ให้มีเจ้าของimplementationและvalidationที่สมเหตุผล ถ้าขยายtaskเดิมจนเกิน1–2วันให้แตกtaskย่อยเลขถัดไปเริ่มpendingโดยมีเหตุผล เป็นการแตกงานscopeเดิมไม่ใช่เพิ่มfeature ไม่ต้องเพิ่มphases

gateที่ธุรกิจตอบแล้วให้แยก approved decision refs กับremaining artifact/evidence ไม่ถามเดิมซ้ำ: G-GUESTนโยบายตอบแล้วแต่storagecontract/testยังค้าง; G-LEARNนโยบายตอบแล้วรอเนื้อหา/criteria; G-CORE/H4แบบเคยอนุมัติแต่runtimeSQL/securityยังค้าง; G-AUTHcredentialfixturesไม่เดา; UX4กลุ่มไม่มีsignedartifact; หุ่น/ส่งมอบรอทีมเสนอ; DES009 export G-PARITY/COEXIST/TARGET/AUTHZ/DBยังอยู่จะเพิ่มcanonicalgatesตามความจำเป็นหรืออ้างpreconditionsย่อยชัดเจนก็ได้ ห้ามลงclosedโดยไม่มีหลักฐาน; H5infra/web-principal/staff_adminตั้งต้นยังค้างตามdecisions025; ไม่ถามรวมpermissionก่อนมีartifact

จัดคิวroleปัจจุบัน: aliasเจ้าของเดิมsa→arch,ba→spec,be→sys,fe→front,dba→vault,tp→inspect,qa→check,sec→jpo,ux→int,pm→gm ตามงานจริงไม่renumbertask; ชี้ชุดงานเตรียมหลักฐานที่เริ่มได้ทันทีและผู้รับต่อ เป้าระยะต้นDB/auth/License แต่implementationที่ติดgateคงห้ามเริ่ม

ห้ามเขียนไฟล์/เรียกroleซ้อน ส่ง fenced JSON เดียว โดยผู้คุมบันทึกตามoutputเจ้าของแผน:
{"state":"DONE|NEEDS_HUMAN","summary":"...","edits":[{"path":"knowledge/school-bot/plan/...","old":"ข้อความตรงหนึ่งตำแหน่ง","new":"ข้อความใหม่"}],"new_files":[{"path":"knowledge/school-bot/plan/...","content":"..."}],"json_edits":[{"path":"knowledge/school-bot/plan/tasks-001.json","pointer":"/tasks/43/ac_ids","old":["ค่าจริงเดิม"],"new":["ค่าที่แก้"]}],"task_count":74,"gate_count":17,"req_count":44,"ac_count":180,"ready_next":[{"task":"...","role":"...","reason":"..."}],"waiting_on_human":["..."],"questions":[]}

json_editsใช้replaceโดยdefaultต้องoldตรงจริง; เพิ่มpropertyหรือappendarrayใช้op:"add",pointer:"/tasks/-",new:{...} โดยไม่ส่งold ห้ามส่งโค้ดexecute ทั้งmdและJSONเพิ่มChangeLog/วันที่/refsและrevisionตามเหมาะสม ส่งexactpatchไม่ใช่เพียงข้อเสนอ archiveเดิมตามจำเป็น ไม่แก้Statuscolumn existing และห้ามแตะrequirement/design/source ผู้คุมจะตรวจ IDs/coverage180/DAG/จำนวนtasksก่อนบันทึกfinalcommit

## Change Log

- 2026-10-23 — gm timeout1800sก่อนfinal ไม่มีverdictรับรอง; กู้prepared workproductเป็น planning/gm-recovery-001.json และpreviewในscratch ตรวจ110tasks/44REQ/180AC/DAGผ่านแต่ยังไม่apply ส่งgmยืนยัน task-015

- 2026-10-23 — นายช่างส่ง gm รับผล spec 44/180 จัดแผนโครงการเดิมและgate ขณะ arch ปรับสัญญาคู่กัน
