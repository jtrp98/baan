# ใบงาน035 — sys ปิด wire fixtures และ prerequisite ก่อน implement

**Exact roots / retry correction:** K=C:/src/schoolbright/knowledge/school-bot; G=C:/src/schoolbright/target/sb-api-gateway; B=C:/src/schoolbright/target/school-bot. อ่าน C:/src/schoolbright/knowledge/school-bot/index.md → C:/src/schoolbright/knowledge/school-bot/plan/index.md → C:/src/schoolbright/knowledge/school-bot/design/index.md. ทุก path planning/,design/,plan/ ด้านล่าง relative ต่อ K ไม่ใช่ knowledge/ เปล่า. facts033=K/planning/desktop-login-evidence-001.json, facts034=K/planning/desktop-login-contract-response-001.json. ครบแล้ว ไม่ต้องค้น module ใหม่หรือส่ง path question กลับ. ผู้คุมแก้ความกำกวมของใบงานจาก attempt001 ที่ยังไม่ได้อ่านsource

วันที่2026-10-23 · sys/Codex t3 read-only · ผู้ใช้สั่งตามflow; arch034ยัง ready=false ด้วย code prerequisitesจริง ไม่ใช่ขาดdeploymentอย่างเดียว. ต่อเฉพาะหลักฐานที่ทีมทำเองได้ ไม่ถามนโยบายใหม่ ไม่ฝืนสร้าง503-onlyroute/unuseddecoder

อ่านindex-first module/plan/design แล้ว planning/desktop-login-evidence-001.json, desktop-login-contract-response-001.json, design/desktop-login-adapter-001.md และ desktop-auth-review-packet-001.md. ใช้ facts033/034 ไม่สำรวจLoginใหม่ทั้งหมด. อ่านG/B AGENTSและlocalskills/requiredreadingก่อนsourceตามกติกา ใช้graphifyfirstในG; no graphwrites/install/aiack/preflightในงานread. skillapi-engineer+api-documentation local contracts

1. ปิดnested wire shapeจาก G/src/ApiGateway.API/Controllers/WebAuthController.cs:265–348 และ DTOที่อ้าง: exact keys/types/null/optional ของpasswordchange/twofactor/contact/terminal/send/error โดยเฉพาะ channels/missing/user. สร้างsanitized synthetic JSON fixtures จาก source เป็นตัวอย่างwire (ไม่mockว่ารันLoginผ่าน) พร้อม status/error/discriminant. ตรวจsourceจริงนับanchor ไม่ใช้JWTจริง/password/PII. แยกresponseที่มีจริงจากnegative fixtureที่ออกแบบเพื่อcheck
2. เทียบ DES adapterกับwire/serviceจริง ชี้contradictionที่ต้องกลับarch เช่น bounds/newPassword/flags/expiresAt/requestId/errorcode. ไม่แก้contractเอง
3. จาก B/sourceที่034ตรวจแล้วและ canonical plan/index/tasks-001.json เฉพาะงานauth/session/License/device/persistence: map prerequisiteที่ขาด → taskIDเดิม/owner/output/precondition โดยไม่เขียนแผน/เพิ่มscope/newtasks. ไม่inventoryทั้งrepoซ้ำ; แค่ยืนยันไม่มี productionseamและบอกว่า prerequisiteใดเป็นimplementationได้เลยหรือมีgateSQL/schema/ownerreviewที่บล็อกจริง. แยกcode-firstที่ทำด้วยlocalunit testsได้จากrunsharedDB; อย่าสรุปว่ารันSQLไม่ได้จึงห้ามเขียนpersistenceทั้งหมดโดยอัตโนมัติ. เสนอ exact next concrete work itemที่ลดblockerจริง ไม่ใช่ขอinventproductioncaller

ไม่code/knowledgewrite/sourcegitmutation/SQL/DB/network/login/tests/build/hardware/install/rolechain. Userอนุญาตflow ไม่ใช่SQL/deploy. G HEAD9a03c9428a47150aa960e61ca91eedad6d0196af; B noHEAD+703preexistinguntracked ผู้คุมถือbaseline. childGitpermissionไม่ส่งถามuser

คืนfencedJSON<=4500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","wire_fixtures":[{"name":"...","http_status":200,"kind":"source|adversarial","body":{},"expected":"...","evidence":[]}],"contract_deltas":[],"prerequisites":[{"task_id":"...","owner":"...","missing":"...","code_ready":true,"gate_before_code":"...","gate_before_enable":"...","basis":[]}],"next_work_item":"...","checks":[],"handoff":[]}. ผลfixtures=sourceillustrationเท่านั้น ไม่testPASSและไม่ปิด110tasks/77cases/security

## Change Log
- 2026-10-23 — รับ034แล้วส่งsysปิดfixtures/ชี้task prerequisiteที่ลงงานต่อได้จริง ไม่ส่งblockerกว้างกลับคน
- 2026-10-23 — retryแก้ exactroots/index paths ให้ครบ; attempt001เก็บไว้ตามจริง ไม่ถือว่าได้ตรวจsourceแล้ว
