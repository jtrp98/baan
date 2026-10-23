# ใบงาน045 — check แก้ test fixtures ตาม actual run และเก็บหลักฐาน security ที่ขาด

วันที่2026-10-24 · check/Codex t2 write **tests only**. Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/planning/auth-flow-check-response-001.json, auth-flow-test-check-001.json (actual4011:4004pass/7fail), K/planning/logout-security-response-002.json/runtimecriteriaทั้ง8 และcomponentcontractเดิม. อ่านB/AGENTS/README/testfilesที่ตนเพิ่มก่อนแก้

แก้สิ่งที่อยู่ในtest-own scopeจากactual evidence ไม่แก้production/ไม่เปลี่ยนoracleให้รับbug:
1. SecretLimitMeasuresUtf8AfterUnescapingสามfailureเกิด JsonObjectที่ใช้ซ้ำถูกenvelopeparentไปแล้ว ที่GatewayOutcomeFixtures.Decode:43. ให้fixtureสร้างclone/ownershipใหม่อย่างถูกต้องเพื่อให้แต่ละcaseเรียกDecodeจริงด้วยpayloadที่ตั้งไว้; คงboundaryassertionsเดิม
2. malformedBearer4caseมีstorecallเพราะต้องวินิจฉัยtransportnormalizationกับactualservice ไม่เหมารวมว่าproductionwrong. HttpClientอาจnormalize whitespaceก่อนส่ง ให้รักษาการทดสอบrawinvalidAuthorizationผ่านTestServer.SendAsync/HttpContext **productionpipelineเดิม** โดยไม่ให้HttpClientnormalizeก่อนapp หรือแยกwire-normalized合法inputจากrawvalidatorให้ตรงlayer. ห้ามบังคับsourceให้rejectสิ่งที่clientnormalizeเป็นcanonicalแล้ว และห้ามลดassertioninvalidrawต้องไม่callstore. หากsourceมีbugจริงให้reportFAIL/sysownerพร้อมreproไม่แก้เอง
3. เติมruntimecriteriaSEC040-001ที่ยังไม่มี โดยเฉพาะdefaultcaps/configทุกkey/renewalของfixedwindow. ตั้งtestwindowสั้นเช่น1วินาทีและwaitboundไม่เกินไม่กี่วินาทีเพื่อยืนยันrenewalผ่านproductionpathได้ ไม่รอ60วินาที/ไม่แก้limiterภายในหรือClockproduction. ตรวจทุกpeer/header spoof/queue0/permitleaseจนtaskจบและคืนหลังsuccess/failure/exception/cancel + no secrets/logตาม043; ใช้fake storeไม่มีDB

Sys044กำลังแก้เฉพาะPostgresSessionLogoutStore.cs Actor; อย่าแก้หรือรันbuild/testsพร้อมกัน รอparentรันรวมหลังwriterสองตัวจบ. รอบนี้จัดtestsourceให้ครบและreportstaticchanges/remainingfindings; ไม่เสีย90วินาทีtesthostsocketในchildsandboxซ้ำ knownblocked. Parentจะสร้างTRX002และactualproof002 แล้วส่งcheckให้verdictจากผลจริงต่อ. ไม่ลดwarnings/testcoverage/เพิ่มpackages/แก้source/SQL/DB/network/login/hardware/knowledge/gitmutation/rolechain

คืนfencedJSON<=2500tokens {"state":"DONE|FAIL|BLOCKED","summary":"...","tests_changed":[],"diagnosis":[],"security_criteria_coverage":[{"criterion":1,"tests":[],"runtime":"PENDING_PARENT_RUN"}],"checks":[],"findings":[],"handoff":[]}. DONEหมายถึงtestsพร้อมparentrun ไม่ใช่PASS; 110tasks/77TPcases/Important6ยังเดิม

## Change Log
- 2026-10-24 — นายช่างส่งcheckแก้fixturesตามactual7failและเพิ่มwindow/securitycoverageที่ยังไม่รัน ไม่เปลี่ยนproductionเพื่อหลบtestbug
