# ใบงาน040 — jpo ตรวจ logout subset ที่เพิ่งเพิ่ม แบบ static

วันที่2026-10-23 · jpo/Codex t2 read-only. Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/security.md เฉพาะfindingsที่เกี่ยวauth/PII/token, K/planning/logout-implementation-response-001.json, logout-build-check-001.json, logout-source-hashes-001.json, K/design/des-004.md เฉพาะlogout และK/design/data-contract-rules.md/v2errors; DDLอ่านเฉพาะSession/Auditเพื่อstaticparity ไม่execute

ตรวจโค้ดใหม่038ทั้ง10ไฟล์ตามhashreport (B/AGENTS+READMEก่อนsource). ตรวจ boundarypubliclogout, bounded/multiple/ambiguousBearer/canonicalbase64url/hash-only, response204/503/no-store/UUID/secretredaction, productionPostgresparameterizedSQL/revoke+audittransaction/cancellation/concurrency และconfigfailclosed. ไม่อ่านsecret/envค่าจริง. ห้ามขยายไปG/authidentity/H5ที่ยังไม่implementหรือสร้างhypotheticalwarningsนอกthreatsurface

ตอนนี้sys039เขียนเฉพาะ B/web/src/SchoolBot.Infrastructure/Authentication/* ซึ่งไม่อยู่scopeรีวิวนี้; ไม่อ่านหรือแก้ส่วนที่กำลังเปลี่ยน ไม่build/testขณะมีwriter. Rootรันexisting70casesผ่านแล้ว แต่ยังไม่ใช่authnewbehavioracceptance. เน้นactionable defectsจากsourceจริง ไม่รับความเสี่ยงแทนuser/ไม่ยกfullsecuritygateผ่าน ไม่มีPASS/FAILแบบcheck

คืนfencedJSON<=3000tokens {"state":"DONE|BLOCKED","summary":"...","findings":[{"id":"proposed new finding","severity":"Important|Medium|Minor","file":"...","line":1,"issue":"concrete trigger/impact","fix":"...","blocks":"..."}],"checked":[],"limitations":[],"handoff":[]}. ไม่knowledge/sourcewrite/SQL/DB/network/login/tests/build/Gitmutation/rolechain. Important6เดิมยังOPEN ไม่มีการre-auditทั้งระบบ

## Change Log
- 2026-10-23 — นายช่างส่งjpoรีวิวstaticlogoutที่buildผ่านแล้วคู่ขนานกับcomponent039 เตรียมส่งcheckหลังwriterจบ
