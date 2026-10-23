# ใบงาน043 — jpo re-audit SEC040-001 เฉพาะfix

วันที่2026-10-23 · jpo/Codex t2 read-only · Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/planning/logout-security-response-001.json, logout-limiting-response-001.json และfindingSEC040-001. อ่านB/AGENTS/READMEและ5filesที่042แก้รวมLogoutRateLimiterจริง. ไม่re-audit15findingsทั้งระบบ/ไม่อ่านcomponent039

ตรวจว่าfixผูกproductionpathจริง/ทุกroutevariantที่routerรับ, trustedpeerถูกจับก่อนUseForwardedHeaders, XFF/body/tokenไม่เลือกpartition, sharedmissingpeer/IPv4mappednormalization, validunknownBearerก่อนDBถูกจำกัดper-source+processconcurrencyจริง/queuebounded, leaseถือถึงstoreจบและคืนทุกerror/cancellationpath,429v2/no-store/UUID/RetryAfterไม่มีinventmetadata,configinvalidfailclosed/defaultsชัด/ไม่มีPIIsecretlog. แยกlocalperprocessจากcrosspoddeployment คงlogoutไม่ต้องauth/Licenseและinvalidtoken204ไม่เข้าDB

check041กำลังจะเขียนtestsแยก ไม่รันbuild/testsเองและไม่แตะsource ข้อสรุปstaticอย่าอ้างruntimeหรือSQL. กำหนดdispositionและruntimecriteriaที่ต้องผ่านเพื่อปิดfindingนี้ หากcodefixถูกและcheckพิสูจน์criteriaครบให้ระบุว่าปิดSEC040-001เฉพาะscopeได้โดยไม่reopenhumanriskdecision. ถ้าเจอbugconcreteให้path:line/trigger/impact/fixowner ไม่เพิ่มhypotheticalwarningนอกthreatsurface. Important6เดิมยังOPENทุกข้อ

คืนfencedJSON<=2200tokens {"state":"DONE|BLOCKED","summary":"...","finding_disposition":{"id":"SEC040-001","static":"REMEDIATED|OPEN","runtime_required":[],"close_when":"..."},"findings":[],"checked":[],"limitations":[],"handoff":[]}. noSQL/DB/network/login/tests/build/source/knowledgewrite/Gitmutation/rolechain

## Change Log
- 2026-10-23 — นายช่างส่งjpoอ่านfix042ซ้ำคู่ขนานกับchecktestsที่เขียนแยก รักษาstatic/runtimeproof
