# ใบงาน053 — spec ตรวจข้อกำหนด/คำถามที่เกี่ยวกับ transport (docs-only)

วันที่2026-10-24 · spec/Codex t2 read-only. K=C:/src/schoolbright/knowledge/school-bot ผู้ใช้ย้ำปรับทุกเอกสารเกี่ยวข้องและทำเฉพาะเอกสารยังไม่implement

อ่านK/index→requirement/index→requirement/scope และopen-questions/index แล้ว design/gateway-integration-001.md Rev3/des012Rev8 เฉพาะtransport. Audit requirement44REQ/180AC, source-references, scope/currentconstraints/openquestions ที่เกี่ยวกับเส้นทางAPI. Baseline client→HTTP Gateway→gRPC B; ไม่มีHTTPrelay/directpublicB. GHTTPLoginเดิมแยกจากservice transport B; asbuiltHTTPlogout/4032localtestsยังไม่ยืนยันintegration. cTypecategory/035และserviceเดียวผ่านGผู้ใช้ตอบแล้ว ไม่เปิดถามซ้ำ

แก้เฉพาะความชัดเจนของเอกสารข้อกำหนดตามbaselineเดิม ถ้าACเขียนHTTP paths/statusให้ระบุเป็นclientboundaryที่Gไม่บังคับBHTTP ไม่มีbusinesschange/noACnew/noIDrenumber/noacceptancepassed. ถ้าข้อกำหนดไม่ขัดก็เก็บเดิม พร้อมclassificationในcoverageไม่ต้องเติมทุกไฟล์แบบซ้ำ ๆ. Scope-history/source evidence/decisions/rawoutputsคงverbatim ห้ามแก้ย้อนหลัง. ตรวจindex/scopecurrentถ้าเป็นcurrententryให้ชี้latesttransportและdocs-only/fullLoginnotreadyตามจริง. ไม่เพิ่มhumanquestion/ownerchoiceที่ตอบแล้ว ไม่อ้างว่าระบุRPC/proto/metadataแล้ว

คืน fencedJSON <=4000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","coverage":[{"paths":[],"action":"amend|consistent|historical_preserve|unrelated","reason":"..."}],"edits":[{"path":"knowledge/school-bot/requirement/...|knowledge/school-bot/open-questions/...","old":"uniqueexact","new":"exactreplacement"}],"invariants":[],"handoff":"..."}. datedchangelog/precedence ไม่regenerate ห้ามknowledge/sourcewrites/rolechain/gitmutations/tests/SQL/network. ผู้คุมarchiveก่อนapplyเอง

## Change Log
- 2026-10-24 — ส่งspecตรวจขอบเขตข้อกำหนดที่เกี่ยวข้องให้ครบ โดยไม่เปลี่ยนbusinessscopeหรือเริ่มimplementation
