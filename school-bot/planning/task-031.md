# ใบงาน031 — sys ตรวจเส้น Login Gateway ที่มีอยู่ก่อน (Codexตามผู้ใช้)

วันที่2026-10-23 · sys t3 read-only · ผู้ใช้ล่าสุด: "งั้นต่อเลย api gateway มีเส้น login อยู่แล้วนะ ลองดูก่อน ใช้ codex นะ". รอบนี้ใช้Codexตรงตามคำสั่งล่าสุด ไม่ต้องลองClaude/AGYก่อน ไม่เรียกroleต่อเอง

เป้าหมาย: ตรวจentrypoint Login Gatewayที่มีอยู่จริงและการ reuseให้SchoolBotก่อนสร้างอะไรใหม่. ไม่ตั้งข้อสรุปว่าต้องเขียนcredentialverifier/loginใหม่เองตามDESเก่า ให้เทียบกับfactsและเสนอส่วนใช้เดิม/ช่องขาดชัดเจน. ไม่implementหรือเปลี่ยนนโยบายในงานตรวจนี้

อ่านindex-first knowledge/school-bot/index.md,plan/index.md,design/index.md แล้ว requirement/decisions-035.md, planning/admin-source-receipt-001.md, planning/legacy-auth-review-001/002.md และ design/des-004.md/des-012.md/gateway-integration-001.mdเฉพาะauth. รายงานก่อนหน้าเจอWebLoginServiceและAuthServiceแต่ยังไม่ได้ทำreuse decision; อย่าสำรวจlegacyนอกworkspaceซ้ำถ้าไม่จำเป็น

targetคือ C:/src/schoolbright/target/sb-api-gateway. อ่านAGENTS/CLAUDEครบและrepo/localskillที่เกี่ยว. skillที่ตรงคือ `.claude/skills/graphify/SKILL.md` (มีgraphify-out/graph.jsonจริง): **ก่อนgrep/search/readsourceครั้งแรก ให้expandvocabจากgraphจริง เลือก<=12tokensและรายงาน แล้วรัน graphify query ก่อน**. ใช้query/path/explainที่จำเป็นเป็นlocator แล้วอ่านsourceจริงเฉพาะไฟล์ที่graphหรือหลักฐานก่อนหน้าชี้. graphify CLIไม่พร้อมให้ใช้inline traversalread-onlyจากgraph JSONตามreferences/query.md ไม่ติดตั้ง/ดาวน์โหลด. ไม่build/update/save-result/reflectหรือสร้าง.vocabในsourceในงานread-onlyนี้; อ่านlessonsเดิมถ้ามีและบันทึกfeedback/querytraceในoutputให้ผู้คุมเก็บknowledgeแทน. ชี้ขอบเขตgraphที่ไม่ครบ ไม่สมมติedgeจากชื่อ

เคารพpreflight/handbook/releaseของrepo: งานนี้ไม่มีproductwritesจึงไม่รันimplementpreflight/ai-ackที่เขียนไฟล์ ไม่createbranch/release/tag/push. อ่านrequiredhandbookตามข้อที่ใช้ได้กับงานreadก่อนsourceถ้ากติกากำหนด ห้ามอ่านsecrets.env/.env/appsettingscredential/environmentค่าจริง; ดูได้ชื่อconfigในโค้ด ไม่เผยค่าtoken/password/hashหรือPIIจริง

สิ่งที่ตรวจจากactualsource/test/declaration:
1. Routes HTTP method/pathเต็มรวมApiPrefixConvention/controller/action (web/mobile/student/staff/admin/refresh/session/handoffที่มีจริง). Input fields, authscheme/policy/rate limit, responseรูปร่าง/status/tokenชนิด/expiry. ไม่เหมาว่าAuthenticationSchemeครอบทุกroute
2. Trace controller→service→lookup/hash/profile→tokenออก และconsumerในweb-systemเฉพาะจุดที่อ้างได้ (ถ้าข้ามrepoอ่านAGENTSและgraph-firstของrepoนั้นก่อน). แยกexistingtestsจากผลtestsจริง (ไม่รันlogin/network/DB); routeที่ใช้ได้เฉพาะteacherกับstudentอย่าสลับ
3. reuse matrixสำหรับDesktopนักเรียน,Desktopครู,school_webครู/admin และstaff_admin. บอกว่าcall/adapter/tokenexchangeส่วนใดใช้existingrouteได้; ถ้ามีgRPCauth/reusableportเดิมให้ระบุcontract/packageที่มีจริง. ไม่มีmockPASSหรือclaimruntimecompatibility
4. สัญญาSchoolBotอะไรที่ควรกลับarchเพราะมีLoginอยู่แล้ว เช่นdirectDBLegacyCredentials.VerifyในDES004 เทียบGatewaylogin. ห้ามออกแบบLoginซ้ำหรือเลือกbreakingauthแทนarch. ใช้นโยบาย035ตรวจกลุ่มserver+superadminเดิม ไม่เปิดคำถามpolicyเดิมใหม่; ยอมรับtokenไม่มีexpเฉพาะขอบเขตมติ025เดิม ไม่ขยายriskacceptance
5. ช่องที่ยังขาดเช่นSchoolBot-specificsession/Channel/License/devicebinding, principal/profile/tenant/scopes/IsAdminfreshnessและH5. แยกstaticproofจากowner/runtimeevidence. SourcebaselineHEAD9a03c9428a47150aa960e61ca91eedad6d0196af/statuscleanก่อนเริ่ม ตรวจread-onlyอีกครั้งเมื่อจบถ้าเป็นไปได้

ไม่code/knowledgewrites, no install, noDB/SQL/login/request/networkprobe/tests/build, no state-changinggit/role. ไม่ทดสอบกับบัญชีจริง. ผู้คุมเป็นคนบันทึกผล

คืนfencedJSONเดียว<=5500tokens ไม่ซ้ำMarkdown: {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","graph_trace":{"selected_vocab":[],"queries":[],"locator_evidence":[],"limitations":[]},"routes":[{"method":"...","path":"...","actor":"...","input":"...","auth_and_limits":"...","output":"...","flow":"...","evidence":["source:line"]}],"reuse":[{"schoolbot_actor":"...","existing_entrypoint":"...","can_reuse":"...","missing":"...","evidence":["..."]}],"contract_deltas":[{"des":"...","issue":"...","recommendation":"...","needs_arch":"..."}],"remaining_evidence":["..."],"checks":["..."],"handoff":["..."]}. DONE=ตรวจsourceและส่งหลักฐาน ไม่ใช่Taskverifiedหรือเปิดใช้จริง. ห้ามคืนsecret/testcredentialsliteralที่อ่านพบ

## Change Log
- 2026-10-23 — ผู้ใช้ย้ำให้ดูLoginGatewayเดิมก่อนและระบุใช้Codex; นายช่างส่งsysตรวจเส้นจริงก่อนแก้สัญญา/ลงมือ
