# ใบงาน029 — arch ปิดGatewayหลังClaudequota/AGYtimeout (Codexสุดท้าย)

วันที่2026-10-23 · arch t1 read-only. ผู้ใช้ให้Codexเป็นอันดับสุดท้าย: Claude task023 FAIL weeklylimit (report2026-10-23-05-20-54-arch-tier-t1-1agents-Po5MY0), AGY task023 TIMEOUT1200s ไม่มีreportคำตอบ (2026-10-23-05-26-46-arch-tier-t1-1agents-aQeiRc). ผู้คุมจึงใช้Codexลำดับสุดท้ายเฉพาะงานที่ค้าง ห้ามเรียกroleเอง

กู้งานให้จบแบบจำกัดscope ไม่เริ่มสำรวจทุกระบบใหม่. อ่าน index-first school-bot/index.md,design/index.md,plan/index.md แล้ว planning/user-context-001.md,legacy-auth-review-002.md,legacy-source-check-001.json,design/des-012.md,auth-evidence-001.md,planning/security-mitigation-001.md. ใช้sourceauthของsysที่ตรวจ13ไฟล์กับHEAD/hashแล้วเป็นupstream evidence ไม่ต้องอ่านlegacy外workspaceซ้ำหรือขอสิทธิ์git. ตรวจsourcegatewayเฉพาะrouting/authที่จำเป็น อ่านAGENTS/CLAUDEก่อน. ไม่อ่านconfig/secret/env. ผลsysอยู่legacy-auth-response-002.jsonถ้าต้องการlineละเอียด

ผลที่ต้องจบ: topologyตามผู้ใช้ 'SchoolBotเป็น1serviceผ่านsb-api-gateway' สำหรับbrowser/BFF/Desktop; แยกpublicgatewayservice-routeจากprivateweb-principal/introspection,ไม่ส่งSchoolBotBearerเข้าlegacySmartScheme,trustheader/SchoolIdมาจากsessionไม่ชื่อheaderbody,ไม่forwardcookie/secretเกินจำเป็น, no loop, upstreamallowlist/TLS,เจ้าของ/env/statusที่ต้องเตรียม. ไม่อ้างว่ามีdeployment/proxyพร้อมแล้วถ้าsourceยังไม่มี; เสนอทางimplementเล็กสุดตามgatewayเดิม ไม่เพิ่มframework/dependencyเว้นจำเป็นและไม่ลงมือimplement

เก็บมติC tokenexchange/introspection/Channel/License/IsAdminเดิม (025/026) และusercontextล่าสุด; อย่าเปิดroutingchoiceถามซ้ำ. Sourceเก่ายืนยันIsAdminในserversessionของกลุ่มแอดมิน/ผู้บริหาร ต่างจากJWTbypassgardeที่1เฉพาะsuperadmin. ระบุความต่างนี้และผลต่อweb-principalอย่างตรงไปตรงมา ไม่รับclaimปลอมจากbody ไม่เปลี่ยนนโยบายเอง. ถ้าอนุมานตามมติเดิมไม่ได้จริง ให้1คำถามสั้นที่มีทางเลือกและแนะนำ ไม่ถามsourcepath/deployedhostรวมซ้ำ

คืนสั้นfencedJSONเดียวประมาณ<=3500tokens: {"state":"DONE|NEEDS_HUMAN|NEEDS_DESIGN_CHANGE","summary":"...","edits":[{"path":"knowledge/school-bot/design/des-012.md หรือ auth-evidence-001.md หรือ index.md","old":"uniqueexact","new":"..."}],"new_files":[{"path":"knowledge/school-bot/design/gateway-integration-001.md","content":"Markdownไทยพร้อมChangeLog; topology/source:line/implementationvsunknown/remainingauthfacts"}],"human_question":null,"remaining_evidence":["..."],"handoff":["..."]}. แก้เฉพาะfacts/links/routeอธิบายตามคำสั่งuser ไม่คัดDESทั้งก้อน; DES004/Guest/units/ETag/updater/hardware/retentionเป็นคิวต่อจากqueue003 ไม่รวมscopeนี้. ให้ชี้addendumoverrideส่วนrouteเก่าในDES012ชัดเจน ถ้าบางคำอ้างgateway'ไม่มีHTTPforwarder'เป็นasbuiltจริงคงไว้แล้วระบุว่าเป็นimplementationneeded ไม่ใช้เหตุนี้ตัดgatewayออกจากtopology

ถ้าhuman_questionให้object{question,options:["label:impact"],recommendation,basis}. ไม่มีphysicalschemachange/sourcewrite/SQL/DB/login/tests/networkprobe/gitmutation/rolechaining. ทุก110taskpending,ทุก77caseNOT_RUN,Important6OPEN ไม่รับrisk/ปิดgate. ผู้คุมarchiveก่อนapplyและfinalknowledgecommitหลังบันทึกครบ

## Change Log
- 2026-10-23 — recoveryเฉพาะส่วนค้างหลังClaude/AGYล้มเหลวตามลำดับ ไม่ละทิ้งผลทีมอื่นหรือเริ่มสเปกใหม่
