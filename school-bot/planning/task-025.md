# ใบงาน025 — jpo ตอบ mitigation review ก่อนขอคนตัดสิน

วันที่2026-10-23 · jpo t2 read-only · Claude→AGY→Codexสุดท้าย --no-fallback

อ่านindex-first school-bot/index.md,design/index.md,plan/index.md แล้ว security.md,planning/security-disposition-response-001.json (archใบงาน021), planning/user-context-001.md. งานtargeted review ไม่ต้องauditทั้งrepoซ้ำ. archตอบว่าcontrolส่วนใหญ่อยู่ในสัญญาแล้ว แต่ข้อเสนอprocess/credential separation, four-eyes release และHSM/dualcontrol/keysสามชุดต้องแยกจากapprovedbaseline. ตอบ questions_for_jpo ทั้ง5ข้อตามหลักฐานDESที่จำเป็นและsourceถ้าจำเป็น. คุณมีอำนาจคงseverity ไม่ต้องยอมตามarch; อย่าสร้างriskacceptanceแทนคนหรือประกาศfixedจากdesignreview

เน้นวิธีแก้เรียบง่ายที่อยู่ในสัญญาเดิม: replay license key SEC001-009 เป็นMedium ไม่จำเป็นต้องขอbreakingchangeถ้ารักษาสัญญาเดิมด้วยenvelope/TTLที่ตรวจได้; บอกเหตุผลว่าจำเป็นจริงหรือไม่. แยก must-fix acceptance criteria กับ optional hardeningชัดเจน. ระบุว่าข้อไหนยังต้องให้ownerเลือกinfrastructure/custodyและหลักฐานที่ต้องเตรียมก่อนถาม.

ผู้ใช้ตอบSchoolBotเป็น1serviceผ่าน C:/src/schoolbright/target/sb-api-gateway และให้legacy source C:/src/sb-web-academic-dev-1. คำตอบนี้ยืนยันroutingตามที่บอก ไม่ยืนยันhost/TLS/publicexposure/deployedinstance/secret. sysกำลังอ่านlegacyต้นฉบับ ผลยังไม่ส่ง ห้ามอ้างปิดauthgaps. archจะปรับtopologyภายหลัง. ไม่ขอให้ผู้ใช้ตอบคำถามpathเดิมอีก. ไม่อ่านconfigค่าsecretหรือcredentials. ไม่sourcewrite/knowledgewrite/SQL/DB/networkprobe/rolechaining. CVE/กฎหมายปัจจุบันยังunverifiedจากรอบก่อน ไม่สรุปจากความจำ

คืนfencedJSONเดียว<=3000tokens {"state":"DONE|NEEDS_HUMAN","summary":"...","answers":[{"finding":"SEC001-...","question":"...","judgment":"...","minimum_evidence":["..."],"optional_hardening":["..."],"human_decision_needed":"..."}],"finding_status_changes":[],"accepted_risk_changes":[],"remaining_human_inputs":[{"topic":"...","artifact_before_asking":"...","owner":"..."}],"handoff":["..."]}. ทุกImportantยังOPENจนcodeจริงแก้+reaudit ไม่เติมPASS/DONEให้plan ความเห็นเรื่อง mitigationไม่ใช่การปิดfinding. ผู้คุมappendรายงานนี้ในsecurity.mdและบันทึกJSONต้นฉบับ

## Change Log
- 2026-10-23 — นายช่างส่งคำถามarchให้jpoตอบก่อนเพิ่มgateหรือถามriskacceptance
