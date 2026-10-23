# ใบงาน036 — vault ตรวจ account mapping จาก source ที่มี ก่อนถามเจ้าของDB

Exact knowledge root K=C:/src/schoolbright/knowledge/school-bot; index-first คือ C:/src/schoolbright/knowledge/school-bot/index.md → C:/src/schoolbright/knowledge/school-bot/plan/index.md → C:/src/schoolbright/knowledge/school-bot/design/index.md. ทุก planning/,design/ ที่อ้างด้านล่าง relative ต่อ K ไม่ใช่ knowledge/ เปล่า; moduleชื่อschool-bot ตามpathนี้

วันที่2026-10-23 · vault/Codex t2 read-only · ต่อflowผู้ใช้หลังarch034 พบว่า G Master.TUser.SId ยังไม่พิสูจน์relationกับ canonical TMasterDBUser.sID ของ B. ตรวจแคบเพื่อปิดหลักฐานที่หาได้ในworkspace ไม่ออกschemaใหม่/ไม่ทำSQL

อ่านindex-first module/plan/design และ planning/desktop-login-evidence-001.json เฉพาะidentity_mapping, design/desktop-auth-review-packet-001.md, design/data-dictionary/legacy-001.md, planning/legacy-auth-review-002.md/legacy-source-check-001.json. มติ035คงservergroup+superadminเดิม ไม่เลือกpolicyซ้ำ

แหล่ง: G=C:/src/schoolbright/target/sb-api-gateway, A=C:/src/schoolbright/target/sb-tech-upgrade-academic, legacy=C:/src/sb-web-academic-dev-1. อ่านAGENTS/CLAUDEของrepoที่จะใช้; Gใช้requiredreading/graphify-first/skillตามrepo ก่อนsource; ใช้existinggraphread-only+fallbackinline ไม่install/rebuild/graphwrites/aiack. ห้ามอ่านcredentialconfigs/env/connectionstringค่าจริง. legacyหน้าต้นฉบับอยู่ตามpath/hashที่legacy-source-check-001ชี้ **ไม่สมมติว่ามีโฟลเดอร์FingerprintPayment/**

ตรวจ entities/DbContext/source migration/SQLdefinitionที่มีอยู่แบบread-only: มีview/alias/ETL/explicit relationใดพิสูจน์ Master.TUser↔TMasterDBUser หรือเปลี่ยนชื่อหลังmigrationหรือไม่; นับIDnamespaces/SchoolIdและprofilekeysตามหลักฐานจริง ไม่เอาเลขตรงกันเป็นproof. ถ้าเจอmappingให้แยกdeclared relation/code contractจากactual-data proof. ตรวจtenant-qualified active profile/history/current salary เฉพาะrulesที่sourceยืนยัน, sentinelNSystemId null/0/1/>1 และambiguity; ไม่ออกpredicateเอง

ส่งexact mapping decisionที่พิสูจน์ได้/พิสูจน์ไม่ได้ + source:line, สิ่งที่Bไม่ต้องรู้เมื่อreuseGhash, และหากยังขาด ให้prepareคำถามtechnicalสั้นหนึ่งข้อถึงเจ้าของMaster พร้อมcolumns/fixturesขั้นต่ำที่ต้องยืนยัน (ไม่ขอcredential/rawPII/algorithmchoice). อย่าคืนownerblockerก่อนค้นsourceที่ระบุพอสมควร; ไม่ค้นทั้งC:/srcแบบกว้าง

ไม่SQL execution/DBconnection/network/login/tests/build/source/knowledgewrite/gitmutation/rolechain. No physicalschema/DDL/newmappingtables/DBML changes. ผู้คุมจะตรวจGitmetadataให้ถ้าchildpermissionขวาง

คืนfencedJSON<=4000tokens {"state":"DONE|BLOCKED|NEEDS_DESIGN_CHANGE","summary":"...","mapping_facts":[{"relation":"...","proof":"declared|code-only|unproven","evidence":[],"limits":"..."}],"active_rules":[],"compatibility_dependencies_removed":[],"remaining_evidence":[{"owner":"...","needed":"...","blocks":"..."}],"owner_question":{"needed":true,"question":"...","options":[]},"checks":[],"handoff":[]}. ไม่PASSหรือปิดgate ผลตรวจ sourceไม่เท่ากับdata proof

## Change Log
- 2026-10-23 — นายช่างส่งvaultตรวจmappingจากsource/definitionก่อนถามข้อมูลที่เจ้าของต้องยืนยัน
