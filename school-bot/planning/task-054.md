# ใบงาน054 — jpo ตรวจเอกสาร security ที่เกี่ยวข้องกับ transport (docs-only)

วันที่2026-10-24 · jpo/Codex t2 read-only. K=C:/src/schoolbright/knowledge/school-bot ผู้ใช้ขอปรับทุกเอกสารเกี่ยวข้องและย้ำทำเฉพาะเอกสารยังไม่implement

อ่านK/index→plan/index→design/indexแล้วsecurity.md, design/gateway-integration-001.md Rev3, planning/auth-flow-handoff001, security/mitigationเอกสารที่เกี่ยว. ใช้rgfile inventoryเฉพาะsecurity/mitigation ไม่อ่านrawhugetranscripts. ไม่ตรวจsourceใหม่/ไม่re-audit/ไม่network/legalresearchรอบนี้

Audit currentsecurityguidance/mitigationกับclient→HTTP G→gRPC B ไม่มีHTTPrelay/directpublicB. GHTTPLoginเดิมแยกจากnewserviceRPC; BHTTPlogout/local4032testsยังไม่ยืนยันGateway/gRPC/DBintegration. มาตรฐานgRPCทราบแล้ว คงtrust/JWTtenant/opaque/session/metadata/privateexposure/TLS/Light/H5เป็นdesignimplementationgapsจริง ห้ามเดารายละเอียดเพื่อให้ดูพร้อม. คงdecisions035/cType/C/License/device ไม่มีbusinessquestionซ้ำ

คืนexactdocamendmentsถ้าต้องแก้currentsecurityguidance/reading precedenceเท่านั้น ห้ามแก้findingsseverity/status/counters/actualQA verdictหรืออ้างre-auditแล้ว. Important6/Medium6/Minor3เดิมOPEN, SEC040001closedเฉพาะlocalperprocessscope ไม่ยืมผลไปdistributed/gRPC. เก็บsourceobservationsวันที่เดิม/rawsecurityresponses/historicalverdictเป็นหลักฐานเดิม พร้อมcurrentnoticeที่ลิงก์ขอบเขตใหม่เมื่อจำเป็น. ไม่เพิ่มfindingใหม่เพียงเพราะgRPCยังไม่implement ไม่ขอhumanapprovalใหม่

คืน fencedJSON <=4000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","coverage":[{"paths":[],"action":"amend|consistent|historical_preserve","reason":"..."}],"edits":[{"path":"knowledge/school-bot/security.md|knowledge/school-bot/...security...md","old":"uniqueexact","new":"exactreplacement"}],"invariants":[],"handoff":"..."}. datedchangelog ไม่regenerate. ห้ามknowledge/sourcewrites/rolechain/gitmutations/tests/SQL/network. ผู้คุมarchiveก่อนapplyเอง

## Change Log
- 2026-10-24 — ส่งjpoตรวจความสอดคล้องของเอกสารsecurityที่เกี่ยวข้อง คงverdictและไม่มีimplementation
