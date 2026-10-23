# ใบงาน023 — arch รับ source จริงและ topology ผ่าน gateway

วันที่2026-10-23 · arch t1 read-only · Claude→AGY→Codexสุดท้าย --no-fallback

อ่านindex-first school-bot/index.md,design/index.md,plan/index.md แล้ว planning/user-context-001.md (คำตอบผู้ใช้ตรง), legacy-auth-response-002.json (sysอ่านต้นฉบับจริง, source-revision a8c5dc62), auth-evidence-001.md Rev2, des-004/012, security-disposition-response-001.json และ test-plan/tp-001.json เฉพาะgaps. ตอนนี้req-025/027ปรับตามspec-test-gaps-response-001แล้ว ไม่เปลี่ยน44/180; inspectจะรับcase007/019แยก. jpoกำลังตอบmitigationจากใบงาน025 ไม่อ้างผลที่ยังไม่ได้เห็น

งานเฉพาะauth/topology ไม่regenerateDES/model/planทั้งก้อน: ผู้ใช้ระบุSchoolBotเป็น1serviceผ่าน C:/src/schoolbright/target/sb-api-gateway. ให้ปรับbaselineให้browser/BFF/desktopเข้าผ่านgatewayตามที่ผู้ใช้ยืนยัน โดยตรวจactualgatewayroutingก่อน เลือกimplementationที่เรียบง่ายตามconventionเดิม ไม่เปลี่ยนนโยบายtokenexchange C/introspection/Channel/IsAdmin/License/four-eyes. แบบเก่าเลือกCเพราะgatewayไม่มีforwarder นั่นเป็นข้อเท็จจริงณตอนตรวจ ไม่ใช่สิทธิ์ละเลย topologyล่าสุด. ระบุ gateway route/proxy/BFF/SchoolBot/privateintrospection/trustheaders/ไม่ส่งSchoolBotBearerเข้าlegacy-validator, TLS/origin/rate/audit และเจ้าของ/envที่ต้องเตรียมเป็นartifact. ไม่ถือว่ามีdeploy/publichostจริงจากคำตอบนี้. ไม่สร้างgatewayowner/hostname/envvaluesแทนคน

รับlegacyหลักฐาน: nSystemIDเป็นสิทธิ์พนักงานในต้นฉบับ ไม่มีfallbackSId; WorkStatusใช้คนละkeyตั้งแต่ต้นฉบับ; legacy session IsAdminของกลุ่ม vs JWT bypassgarde IsAdminเฉพาะsuperadmin. ตรวจsource:lineสำคัญจากC:/src/sb-web-academic-dev-1ตามที่ผู้ใช้อนุญาต (อ่านAGENTS/CLAUDEก่อน) แยกเป็นverifiedfact/legacybug/externalevidence. ไม่ลอกstacktrace/q/password/null/tenantbugs. ห้ามเปลี่ยนIsAdminpolicyเอง: เสนอconcreteทางเลือกตามความหมายมติ025เดิมและใครตัดสิน ถ้าclarificationจำเป็นจริง ให้คำถามสั้น1ข้อพร้อมผลต่อครูแอดมิน/legacyadmin. ถ้ายืนยันจากมติได้อยู่แล้วให้ดำเนินทางนั้นโดยไม่ถามซ้ำ

นอกขอบเขต: Guest/trash/importเต็ม, updaterdisposition, discovery/hardware, ETagในDESอื่น (TPgaps03/04/07/08ยังส่งคิวSA-001/002/003ภายหลัง), sourcewrites/SQL/DB/login/probe/role/gitmutations. ไม่physicalschema. คืนcompactpatchเฉพาะDES-004/012/auth-evidence/indexและnewgatewayintegration.mdถ้าช่วยอ่าน ไม่คัดทั้งDESซ้ำ. ผู้คุมarchiveก่อนapply

คืนfencedJSONเดียว<=6500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_HUMAN","summary":"...","verified":[{"topic":"...","evidence":["source:line"],"result":"..."}],"edits":[{"path":"knowledge/school-bot/design/...","old":"uniqueexact","new":"..."}],"new_files":[{"path":"knowledge/school-bot/design/gateway-integration-001.md","content":"... พร้อมChangeLog"}],"resolved_requests":["..."],"remaining_evidence":[{"id":"...","needed":"...","owner":"..."}],"human_question":null,"handoff":["..."]}. ถ้ามีquestionให้object{question,options:[label+impact],recommendation,basis}. ไม่มีriskacceptance/taskverdictหรือการปิดgate

## Change Log
- 2026-10-23 — รับข้อมูลใหม่จากผู้ใช้และsysต้นฉบับ แก้route/authfactsตามสิ่งที่ยืนยันได้
