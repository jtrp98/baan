# ใบงาน052 — inspect sync เอกสารทดสอบกับ Gateway→gRPC (docs-only)

วันที่2026-10-24 · inspect/Codex t2 read-only · ผู้ใช้ให้ปรับทุกเอกสารเกี่ยวข้องและย้ำยังไม่implement

K=C:/src/schoolbright/knowledge/school-bot อ่านK/index→plan/index→test-plan/indexแล้ว design/gateway-integration-001.md Rev3, design/des-012.md Rev8 เฉพาะtransport, test-plan/tp001md/traceability001md+JSONที่เกี่ยว, qa/index/round001 และ planning/auth-flow-handoff001. ตอนนี้client→HTTP G→gRPC B เป็นbaselineชัด ไม่มีHTTPrelay/directpublicB. HTTPLoginเดิมG/internaldecoderแยกจากserviceRPC. codeBHTTPlogoutและ4032localtestsไม่ใช่G/gRPC/DBintegration

Auditทุกเอกสารtest-planและQAที่เกี่ยวข้อง ให้test environment/procedure/integrationcoverageเส้นทางRPC/HTTP boundary/trust/cancellation/error/limitsไม่สั่งยิงBHTTPตรงแล้วนับเป็นผ่านGateway. ใส่ข้อทดสอบที่ขาดเป็นsteps/coverageภายใต้77casesเดิมหรือprerequisite checklistไม่เพิ่มcaseIDs/ACcoveragebusiness ห้ามเดาRPC/proto/ports/metadata/errorcontractซึ่งยังรอdesign. cType/035เดิมไม่เปิดhumanquestionซ้ำ

คืนexacteditsเฉพาะtest-planเอกสารที่inspectเป็นเจ้าของ; qaเป็นactualcheckverdictเก็บเดิม ให้scopeannotationเสนอได้แต่ห้ามแก้verdict/actualcounts. tp001jsonเป็นrawowneroutputไม่rewriteถ้าเป็นหลักฐานimmutable; joinedtraceabilityถ้าactivefieldsจำเป็นให้patchตามschemaจริงและsyncmd ไม่เพิ่มsummaryfieldแบบเดา. คง77casesNOT_RUN/180AC/110pendingและ4032local/staticPASScasesเดิม ไม่อ้างรันทดสอบใดในรอบนี้. classifyhistoricalrawpreserveและเหตุผลให้ครบ

คืน fencedJSON <=5500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","coverage":[{"paths":[],"action":"amend|consistent|historical_preserve","reason":"..."}],"edits":[{"path":"knowledge/school-bot/test-plan/...|knowledge/school-bot/qa/...","old":"uniqueexact","new":"exactreplacement"}],"design_prerequisites":[],"invariants":[],"handoff":"..."}. datedchangelogและprecedence ไม่regenerate/noIDrenumber. ห้ามknowledge/sourcewrites/tests/SQL/network/Gitmutation/rolechain. ผู้คุมarchiveก่อนapplyเอง

## Change Log
- 2026-10-24 — ส่งinspectตรวจเอกสารtestcoverageให้รับGateway→gRPCโดยไม่เปลี่ยนผลทดสอบเดิมหรือเริ่มimplementation
