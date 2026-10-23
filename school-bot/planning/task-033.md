# ใบงาน033 — sys ปิดหลักฐาน Desktop Login adapter ก่อนลงโค้ด

วันที่ 2026-10-23 · sys / Codex t3 / read-only · ผู้ใช้สั่ง "ทำตาม flow เลย": sys ตรวจหลักฐาน → arch ยืนยันสัญญา → sys implement ส่วนที่พร้อม → check ตรวจรับ. ใช้ Codex ตรง ไม่ fallback. รอบนี้ต้องให้ข้อสรุปที่นำไปทำงานได้ ไม่สำรวจ Login ทั้งหมดซ้ำหรือส่ง blocker กว้าง ๆ

อ่าน index-first knowledge/school-bot/index.md, plan/index.md, design/index.md และเฉพาะ planning/gateway-login-receipt-001.md, gateway-login-response-001.json, gateway-login-architecture-response-001.json, design/gateway-login-reuse-001.md, DES-004/012, requirement/decisions-035.md. ตรวจ backlog BL002/004 เพื่อไม่ลอก query/สิทธิ์ที่ยังไม่พิสูจน์. มติ035และธุรกิจเดิมไม่เปิดคำถามใหม่

Code roots: G=C:/src/schoolbright/target/sb-api-gateway, B=C:/src/schoolbright/target/school-bot; legacy C:/src/sb-web-academic-dev-1 อ่านเฉพาะจุดที่จำเป็น/หลักฐานก่อนหน้าชี้. อ่าน AGENTS/CLAUDE/README ของส่วนที่จะตรวจ; G ทำ required handbook reading ตามกติกาก่อน source. ใช้ graphify skill ของ G + find-skills policy, expand vocabulary จาก graph จริง <=12 tokens, query ก่อน grep/source; CLI ใช้ไม่ได้ให้ inline JSON traversalตามskill บันทึก querytraceในผลแทนการเขียน graph/.vocab. ไม่ install/rebuildgraph/ai-ack/preflightที่เขียนไฟล์ในงานอ่านนี้. ใช้ postman:api-engineer สำหรับเทียบ local contract; ไม่ต้อง init/publish/connect. ไม่อ่าน secrets/env/credential values

สิ่งที่ต้องส่งให้ arch ตัดสินให้จบ:
1. Student mobile IMEI lifecycle: Login → verify/reset/approval มี endpoint/serviceจริงใด, terminal states/AccessLevel/force-reset, อายุ token/refresh ที่มีจริง, desktop hardware identity ที่มีใน B เทียบ mobile IMEI ได้หรือไม่ได้ (ห้าม fake IMEI/สมมติ DeviceJkt=IMEI). บอกเส้นที่พร้อม reuse และ gap ที่หลีกเลี่ยงไม่ได้ พร้อม source:line
2. Teacher web completion: DTO/status/discriminant ของ login/first-password/2FA/contact, state/TTL/binding/resend/attempt/rate limits, terminal token trusted validation/purpose/aud. สรุป wire contract ที่ callerต้องทำตาม ไม่อนุมาน HTTP200=success ไม่ fallback mobile เพื่อหลบ challenge. ระบุว่า reuse browser flow/system browser ใน Desktop มี seamจริงหรือจำเป็นต้องออกแบบใหม่
3. Identity/tenant: ค่า tokenจากทั้งสองเส้นมี keysอะไร → TUser SId/NSystemId/CType/SchoolId → B AccountId/profile และ employee/student active predicates. ตรวจ entities/query/join ของ sourceที่จำเป็น; แยก code equality/declaredFK กับ actual data proof, ไม่แต่งว่าพิสูจน์ dataแล้ว. ส่วนที่ใช้ Gatewayผลแล้วไม่จำเป็นต้องรู้ hashให้ระบุว่าปลด dependencyได้ ไม่ส่งผู้ใช้ไปเลือกhash
4. Source B มี controller/application/infra/Go clientและ tests seamใดจริงสำหรับ implement. ระบุชื่อไฟล์/functionsที่จะเปลี่ยน, prerequisiteที่ครบแล้ว/ยังขาด, คำสั่งtestsจากREADME/AGENTS. ให้เสนอ smallest complete behavior slice ที่ลงโค้ดได้หลัง arch ยืนยัน (พร้อม meaningful adversarial tests) ไม่สร้าง scaffolding/mock success/persistenceหรือcredentialsverifierซ้ำ. ถ้าไม่มี sliceที่ครบจริงให้บอก exactly why พร้อมทางเลือกให้ arch ไม่ถือ H5 deployment unknownเป็นเหตุห้าม unit-tested coreทุกส่วนโดยอัตโนมัติ
5. ทำ readiness table: desktop student/teacher/server exchange; ข้อใด static evidenceพอ implement ข้อใดต้อง owner/runtimeก่อนenable. ไม่เลือก transportเองหรือแก้ G protectedpathsโดยไม่มี review. คง C/opaque session/License/Channel/DeviceJkt/035/freshauthorizationทั้งหมด

งานนี้ห้าม code/knowledgewrite/gitmutation/network/login/DB/SQL/tests/build/hardware/role chaining. source baseline G HEAD9a03c9428a47150aa960e61ca91eedad6d0196af; B noHEAD/preexisting untracked ไม่ถือเป็นงานของตนและห้าม clean/reset. ถ้า childGitติด permission ผู้คุมจะตรวจให้ ไม่ส่งคำถามนี้ให้user

คืน fenced JSONเดียว <=6500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","graph_trace":{},"student_flow":[...],"teacher_flow":[...],"identity_mapping":[{"actor":"...","keys":"...","proven":"...","gap":"...","evidence":[]}],"implementation_slices":[{"name":"...","ready":"yes|conditional|no","files":[],"behavior":"...","prerequisites":[],"tests":[],"evidence":[]}],"contract_questions_for_arch":[],"remaining_external_evidence":[],"checks":[],"handoff":[]}. source evidenceใช้ path:line, ไม่คืน secret/PII. DONEหมายถึงตรวจครบ ไม่ใช่ check verdict

## Change Log

- 2026-10-23 — นายช่างเดิน flow ตามผู้ใช้ ส่ง sysตรวจสามช่อง Desktopและหาส่วนที่ลงโค้ดได้จริงก่อนส่ง arch
