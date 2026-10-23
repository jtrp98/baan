# ใบงาน022 — sys ตรวจ legacy ต้นฉบับที่ผู้ใช้ชี้

วันที่2026-10-23 · sys t3 read-only · ผู้คุม Claude → AGY → Codexสุดท้าย --no-fallback

อ่านindex-first school-bot/index.md,design/index.md,plan/index.md แล้ว planning/user-context-001.md, legacy-auth-response-001.json, design/auth-evidence-001.md. ผู้ใช้ระบุ source จริง C:/src/sb-web-academic-dev-1 และอนุญาตให้อ่าน. อ่าน AGENTS.md/CLAUDE.md ของ repo และเฉพาะ inherited rulesที่เกี่ยว (คุณเป็นsysตามrolemarker ไม่ใช่นายช่าง). ห้ามเขียนภายนอกหรือเปลี่ยนstategit/อ่านค่าsecret/configcredential.

ไฟล์พบแล้ว: C:/src/sb-web-academic-dev-1/jabjaiuniversity/FingerprintPayment/Default.aspx.cs, bypassgarde.aspx.cs, Class/ComFunction.cs. Trace helperที่จำเป็นเท่านั้น. เป้าหมายปิด TR-AUTH-01..06 จากต้นฉบับ: username lookup/normalization, hash/plaintext/birthdate, active flags, studentและemployee mapping sID/nSystemID/sEmp, IsAdmin/admin_id producer. ตรวจว่าต้นฉบับตรง/ต่างกับportgatewayอย่างไร พร้อมlineจริง. อ่านrepo HEAD/statusได้เท่านั้น ไม่scanทั้งC:/src.

หลักฐานต้องเป็นsourceจริง ไม่ใช้commentคำอ้างอย่างเดียว. ไม่รับรอง deployeddata/collation/cultureจากEFmodel. ไม่เปิดconfig/envหรือค่าtoken/password/keyจริงในoutput. fixture ใช้syntheticเท่านั้น. ไม่DB/SQL/login/request/tests/codewrite/knowledgewrite/rolechaining. ถ้ามีstudentstatusquerybug ให้ระบุพฤติกรรม ไม่ลอกเป็นข้อกำหนดใหม่. ผลเป็นcompatibility evidenceไม่ใช่เลือกverifierแทนarch.

คืนfencedJSONเดียวประมาณ<=6500tokens {"state":"DONE|BLOCKED|NEEDS_DESIGN_CHANGE","summary":"...","source_revision":"gitHEADหรือunknown","verified":[{"topic":"...","legacy_behavior":"...","gateway_delta":"...","evidence":["absolute/source:line"],"confidence":"source-proven|candidate|unknown"}],"fixtures":[{"id":"AUTH-L001","synthetic_input":{},"expected":"...","basis":["source:line"]}],"resolved_requests":["TR-AUTH-..."],"remaining":[{"id":"...","needed":"...","technical_owner":"...","blocks":["..."]}],"handoff":["..."]}. ไม่มีacceptedrisk/taskverdictใหม่; แยกต้นฉบับที่อ่านได้จากสิ่งที่ต้องขอเจ้าของฐานจริง

## Change Log
- 2026-10-23 — ผู้ใช้ให้sourceต้นฉบับ นายช่างส่งsysตรวจแทนการถามpolicyเดิม
