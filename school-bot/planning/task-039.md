# ใบงาน039 — sys implement web Gateway outcome component

วันที่2026-10-23 · sys/Codex t2 writeเฉพาะBcomponent · ผู้ใช้สั่งตามflow; arch037 DONE/implementation.ready=trueเฉพาะinternalcomponent ไม่ใช่fullLogin. อีกงานlogout038เขียนแล้ว ผู้คุมกำลังจบbuildก่อนเริ่มงานนี้ ไม่มีwriterอื่นในsourceเมื่อdispatchจริง

Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/design/gateway-outcome-component-001.md **ทั้งไฟล์** และ K/planning/gateway-outcome-contract-response-001.json, K/planning/desktop-login-wire-evidence-001.json เฉพาะwire_fixtures/contract_deltas. sourceillustrations035ไม่ใช่runtimeproof; ให้ใช้closedparsercontract037 ไม่เพิ่มfieldจากupstreamเอง. อ่านB/AGENTS.md/READMEและprojectAPIที่เกี่ยวตามปกติ

Implementexact callableAPI/types/enums/truth-table/parserbounds/Unicode/duplicates/date/status/stage/secretcustodyตามcomponentRev1ทุกข้อ. Namespace SchoolBot.Infrastructure.Authentication; ไม่มีHTTPcalls/session/JWTdecode/validated=true/DB/DIregistration/newpublicendpoint. TerminalCandidateแค่โครงสร้างห้ามอ้างauthenticate. การทดสอบbytesโดยตรงเป็นbehaviorของcomponent ไม่สร้างcallerปลอม/successstub. ไม่เพิ่มrequestvalidator/newpackage/framework. งานlogoutไม่อยู่scopeนี้

เขียน B/web/src/SchoolBot.Infrastructure/Authentication/GatewayOutcomeDecoder.cs,GatewayOutcome.cs,GatewaySecret.cs ตามแบบ; ถ้าparservalidation/date/Unicodeทำให้ไฟล์ใหญ่ให้แยกhelperภายในfolderนี้ตามหน้าที่จริงและบอกเหตุผล ไม่เปลี่ยนpublicAPI/contracts. ทุกknownkeycaseผิด/duplicateทั้งtree/invalidUTF8และunpairedescapedsurrogateต้องfailclosed; ห้ามใช้JsonDocumentที่ยอมreplacementโดยไม่มีstrictvalidation. ผลไม่มีrawbody/upstreammessages/PII; secretToStringredacted/serializationthrows/disposezero/copyboundsตามแบบ. ห้ามลดกฎเพื่อให้testsผ่าน

Sysไม่เขียนtestใหม่ รอcheckเขียนadversarialtestsจากspecอย่างอิสระ. รันexistingC#checksจากB/web: dotnet test SchoolBot.slnx --disable-build-servers -m:1 (ใช้--no-restoreได้หลังผู้คุมrestoreผ่านแล้วและไม่มีproject/packagechanges). หากsandboxNuGetขวางให้รายงานexacterror ผู้คุมรันนอกsandboxต่อ ห้ามปิดaudit/ลดwarnings/เปลี่ยนSDK. .NET10SDKมีในเครื่องแล้ว. ไม่มีDB/network/hardware/SQL/installer/Go/UI/sourcegitmutation/knowledgewrite. ไม่แก้ csproj/Program/README/logoutsources เพื่อหลบcompileerror; ถ้าพบerrorของ038ให้แยกแจ้ง

คืนfencedJSON<=3000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","files_changed":[],"file_analysis":"...","checks":[{"command":"...","exit_code":0,"result":"..."}],"contract_questions":[],"limitations":[],"handoff":[]}. DONEเฉพาะcomponentcodeพร้อมcheck ไม่ใช่PASS/fullLogin/gateclose. code/dev docsอ้างcontractผ่านknowledgeที่มีแล้ว ไม่เพิ่มรายงานชั่วคราวในsource/comments

## Change Log
- 2026-10-23 — นายช่างรับ037และบันทึกcontractแล้ว ส่งsysลงcomponentจริงตามสัญญา รอcheckตรวจอิสระหลังเขียนจบ
