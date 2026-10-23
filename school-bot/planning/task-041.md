# ใบงาน041 — check ตรวจอิสระ logout และ Gateway outcome component

วันที่2026-10-23 · check/Codex t2 write **tests only** · เริ่มหลังsys038/039เขียนจบแล้วเท่านั้น. ผู้คุมจะบันทึกresponse039ก่อนdispatch. Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot

อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/design/gateway-outcome-component-001.md ทั้งไฟล์, K/design/des-004.md เฉพาะlogout, K/design/data-contract-rules.md, K/planning/logout-implementation-response-001.json, logout-build-check-001.json, K/planning/gateway-outcome-implementation-response-001.json. ถ้ามี K/planning/logout-security-response-001.json ให้อ่านfindingsด้วย. อ่านB/AGENTS.md/README/testseamsตามปกติ. ไม่ยึดsysDONEเป็นPASS ต้องสร้างadversarialtestsจากสัญญา

หลัง039และ042จบอ่าน K/planning/logout-limiting-response-001.json เพิ่ม: SEC040-001ต้องมีregressiontest rate/source/concurrency. ใช้capsในconfigของtestให้เล็ก/ไม่ต้องรอwindowจริง; held fake-store callsพิสูจน์requestเกินcapคืน429/v2error+no-store+UUIDและไม่callstoreเพิ่ม ไม่มีunboundedqueue. spoofX-Forwarded-For/bodyidentityไม่สร้างtrustedsourcepartitionใหม่. Releaseleaseเมื่อfail/cancel/completeแล้วรับงานต่อได้. ตรวจทั้งper-sourcewindowและprocess-localDBconcurrencyตามimplementationที่บันทึก ไม่อ้างcrosspodcapacity. รอไฟล์ผล042ก่อนเริ่มเพราะผู้คุมจะdispatchหลังสองwriterจบ

Scope A: web outcome decoder ตาม037ครบ acceptance8หมวด: operation×stage×outcomeCartesian, required/forbidden/null/type/conflicts, HTTP/codeerrors, unknownpresentation/duplicatesทั้งtree/escapedcase/strictUTF8+Unicode, bytes/depth/secret/challengeboundaries, dates/leap/offset/epoch/expiryไม่auth, resendinteger, noleakToString/serialization/exceptions, CopyTo/disposal. เรียกDecodeจริงไม่mockdecoder/testแต่helper. ใช้syntheticsecretsและตรวจexactnormalizedfields + rejectedไม่มีsecret. sourceillustrations035ใช้อ้างwireเท่านั้น closedparsercontract037เป็นoracle; ไม่แปลงTerminalCandidateเป็นidentity/session

Scope B: POST /v2/auth/logout ผ่านWebApplicationFactory→productionendpoint+usecaseจริง. ใช้testdoubleของISessionLogoutStoreเพื่อไม่ต่อDBจริง: missing/malformed/oversized/multipleBearer/canonicalbase64url/invalidJWT/noLicense/headers, canonicaltokenส่งเฉพาะSHA256hash/storecalledถูกต้อง, missing/expired/revoked204, unavailable503/v2UUID/error/no-store/no rawtoken/PII/connectionstring, cancellation/repeat/concurrencyที่พิสูจน์ได้. ตรวจproductionrepositorySQL/parameters/transaction+rollback/staticDDLparityโดยsource. **DBruntime/realPostgreSQLatomicity NOT_RUN** ห้ามกล่าวว่าทดสอบสำเร็จด้วยfake. ไม่ทดสอบdefaultstoreกับconnectionstringจริงหรือเปิดsocketDBแม้localhost; factoryต้องreplaceISessionLogoutStoreชัดเจนก่อนเรียกvalidtoken

เขียน B/web/tests/SchoolBot.Tests/*Tests.cs และfixture/helperที่จำเป็นเท่านั้นตามหน้าที่ ไม่เพิ่มpackage/เปลี่ยนproduction/contract/disablewarnings/ลดtests/SQL/knowledge/gitstate/network/hardware. ถ้าproductionbugให้FAILพร้อมpath:line/repro/expected ไม่แก้เอง. ไม่สร้างspecificationใหม่เพียงเพราะสะดวกtest. ต้องไม่เรียกsecret.AsStringที่ไม่มีAPI; ใช้CopyToที่กำหนดไว้. แยกtestsเกิน300/500ตามAGENTSเมื่อหลายหน้าที่จริงไม่ยัด500บรรทัด

รันจาก B/web: dotnet test SchoolBot.slnx --disable-build-servers -m:1 (ใช้--no-restoreได้เพราะผู้คุมrestoreผ่านแล้ว Npgsql10.0.2; no manifestchanges). ถ้าNuGetfeed/sandboxขวาง ส่งexactcommand/error ผู้คุมจะรันให้ ไม่ปิดauditหรือเปลี่ยนSDK. เอาtestoutput/logที่มีค่าลงคำตอบให้ผู้คุมเก็บknowledge ไม่เขียนreportsในsource

ข้อจำกัดenvironmentที่พบแล้วจาก039: childsandbox compileผ่าน5projectsแต่vstestต่อtesthostไม่ได้90วินาที; ผู้คุมrunนอกsandboxได้70casesก่อนหน้า. หลังเขียนtestsให้รันครั้งเดียวถ้าติดแบบเดียวกัน **ไม่retryรอ90วินาทีซ้ำ** ส่งBLOCKEDพร้อมtests/buildที่ได้และบอกverdictต้องรอparentrun. ผู้คุมจะรันทดสอบนอกsandboxเก็บactualoutputให้ แล้วส่งcheckตรวจผลต่อ; ห้ามแปลงcompilepassเป็นtestPASS. ทำstaticreview/findingsให้ครบได้ระหว่างนั้น

Verdictเฉพาะ scope/local: อาจPASS localAPI+component criteria และคงPGintegration NOT_RUNอย่างชัดเจน; ถ้าcomponent/HTTPbehaviorไม่ครบให้FAIL. ไม่ให้PASSแก่canonicalBE-002/BE-006/BE-039, fullLogin/G-AUTH/H5/SQL/security; 110tasks pending/77TPcases NOT_RUNเดิมไม่เปลี่ยนจากunittestsชุดใหม่นี้. หากมีsecurityfindingใหม่ที่ต้องแก้ให้อ้างriskreview ไม่ปิดImportant6เอง

คืนfencedJSON<=4000tokens {"state":"PASS|FAIL|BLOCKED","summary":"...","scope_verdicts":[{"scope":"...","verdict":"PASS|FAIL|NOT_RUN","evidence":"..."}],"tests_added":[],"checks":[{"command":"...","exit_code":0,"passed":0,"failed":0,"result":"..."}],"findings":[{"id":"...","file":"...","line":1,"repro":"...","expected":"...","actual":"...","fix_owner":"sys|arch"}],"limitations":[],"handoff":[]}. ไม่rolechain

## Change Log
- 2026-10-23 — นายช่างเตรียมcheckอิสระหลังwritersจบ รักษาเส้นแบ่งlocalproof/PGintegration/fullLoginและไม่ปิดgateจากunitresult
- 2026-10-23 — เพิ่มregressionSEC040-001จากjpo; รอ039/042จบก่อนเขียน/รันtestsรวม
