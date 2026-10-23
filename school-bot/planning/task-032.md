# ใบงาน032 — arch รับLoginGatewayเดิมและปรับจุดreuse (Codex)

วันที่2026-10-23 · arch t1 read-only · ผู้ใช้ล่าสุดสั่งใช้Codexและให้ตรวจLoginGatewayเดิมก่อน รอบนี้Codexตรง ไม่fallbackClaude/AGY

งานแคบ: รับหลักฐานsysจากtask031 เลือก/ระบุจุดreuseที่พิสูจน์ได้ และamendสัญญาSchoolBotก่อนสร้างverifierใหม่. ไม่สำรวจauthทั้งหมดใหม่ ไม่implement ไม่เปิดgm/plan ไม่ถามนโยบาย035ซ้ำ

อ่านindex-first school-bot/index.md,plan/index.md,design/index.md แล้ว planning/gateway-login-response-001.json + gateway-login-review-001.md + gateway-login-source-check-001.json, requirement/decisions-035.md และDES-004/012/Gatewayintegrationเฉพาะauth. **BLOCKEDของsysเป็นGitmetadataที่ผู้คุมตรวจให้แล้ว**: G HEAD9a03c9428a47150aa960e61ca91eedad6d0196af/status+diffว่าง, W HEAD7ae35eb4ed3123783afa04e70181eb3576503e45/statusว่าง; ใช้upstreamfactsที่อ่านแล้วได้ ไม่routeคำถามGitให้user. ไม่อ้างruntimeverified

skillที่ใช้: `C:/Users/jabja/.codex/plugins/cache/postman/postman/1.1.0/skills/api-engineer/SKILL.md` และapi-documentationตามส่วนที่เกี่ยว (อ่านก่อนใช้). ใช้localexistingDES/DTOเป็นcontract ไม่ต้องpostmaninit/install/publish/connectหรือใช้providerpublicAPI เพราะนี่คือlocalcontractreview ไม่มีsimulation/testexecution. ถ้าต้องอ่านsourceG/Wเพิ่ม ให้ทำตามrepoAGENTSและgraphify-first; ใช้sourceที่sysระบุแล้วแทนการgrepกว้าง ไม่รันgraphwrites/feedback/install/ai-ack/implementpreflight/branch/release

factsหลัก: POST/api/auth/login นักเรียน+บุคลากรมีIMEI/device verified ไม่ผ่านได้temporaryToken AccessLevel0; 200ไม่เท่ากับfullauth. POST/api/auth/web/login ครู+บุคลากรมีfirst-password/2FA/contactและ200อาจยังไม่มีsessiontoken. parse-legacy-token/handoffไม่ใช่SchoolBotprincipal; refresh/mobilecontrollerบางไฟล์เป็นcomment. LocalDIportsไม่ใช่gRPCremotecontract

ให้ทำreuse decision/tableทุกactor (Desktopstudent/teacher,school_web,staff_admin): ใช้Login/BFF/verifierเดิมตรงไหนแน่นอน, อะไรต้องadapter/SchoolBotopaqueSession+Channel/License/DeviceJkt/authorizationsเดิม, อะไรยังเป็นcandidateเพราะIMEI/temporary/challenges/identity. ห้ามfakeIMEI, ห้ามupgradeAccessLevel0หรือchallengeเป็นfullsession, ห้ามข้าม2FA/firstpassword/contact; ไม่ลอกpasswordhash/สร้างSchoolBotverifierใหม่/เพิ่มบัญชีDBชดเชย. ถ้าข้อมูลไม่พอเลือกdesktopentrypoint ให้ระบุtechnicalcontract/evidenceที่ขาดกับownerและคงfailclosedเฉพาะส่วน ไม่ผลักให้userเลือกalgorithmหรือเปิดpolicyใหม่. ไม่ให้superadminโรงเรียนได้staff_adminเอง

ปรับDES004ที่ปัจจุบันบังคับLegacyCredentials.Verifyอ่านMasterDBเองให้ไม่ขัดการreuseGateway: เลือกseam/adaptorที่sourceรองรับหรือระบุconditionalcandidateอย่างชัดเจน. อย่าอ้างว่าGatewayJWTแทนSchoolBotsessionครบ. คงCtokenexchangeสำหรับschool_web/staff_adminและมติ035. แยกreuseLoginจากH5service-transport: ตรวจข้อเสนอHTTPrelayเดิมกับrepoGREST→gRPCruleเป็นownerreviewgapถ้าขัด ไม่เพิ่มproxy/framework/proto/DBschemaเองและไม่สรุปว่าexistingloginทำให้SchoolBotservice-routeพร้อม

คืนfencedJSONเดียว<=4000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","reuse_decisions":[{"actor":"...","decision":"...","existing":"...","adapter_or_gap":"...","basis":["source/doc"]}],"edits":[{"path":"knowledge/school-bot/design/des-004.md|des-012.md|gateway-integration-001.md|index.md","old":"uniqueexact","new":"shortamendment"}],"new_files":[{"path":"knowledge/school-bot/design/gateway-login-reuse-001.md","content":"shortreadabledecision+contract+remainingevidence+ChangeLog"}],"remaining_evidence":[{"owner":"...","needed":"...","blocks":"..."}],"handoff":["..."]}. อย่าส่งcopyDESทั้งก้อน เลือกappendoverrideมีลำดับเหนือoldtextที่ขัด; เพิ่มlinkในindexให้หาได้. ไม่physicalschema/SQL/code/knowledgewrite/network/tests/gitmutation/rolechaining. ไม่PASS/ปิดgate; 110taskpending/77casesNOT_RUN/Important6OPENคงเดิม

## Change Log
- 2026-10-23 — รับผลLoginGatewayที่มีจริงและแก้Gitmetadatablockโดยผู้คุม ส่งarchเลือกreuseก่อนลงมือ
