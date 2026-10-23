# ใบงาน 021 — arch รับ SEC-001 เข้าสัญญาเดิมโดยไม่เพิ่ม scope

วันที่ 2026-10-23 · arch t1 read-only · Claude → AGY → Codex สุดท้าย (--no-fallback)

ต่อจากผลที่บันทึกแล้ว: planning/security-response-001.json และ security.md (jpo: Important6,Medium6,Minor3), planning/arch-auth-response-001.json และ design/auth-evidence-001.md (ของคุณจากtask020) ซึ่งผู้คุมapply13editsแล้วพร้อมarchive/hash. อ่าน index-first แล้วเฉพาะ DES/data-model/plan ที่จำเป็น. task018/inspectยังทำอยู่ อย่าอ้างว่ารับผลแล้ว.

ทำ targeted disposition ของ SEC001-001..006 และ009/010 ไม่regenerateเอกสารหรือplan ไม่ลดseverity/ยอมรับriskแทนjpo/คน. จัดแต่ละ control ว่า already-contracted / implementation-needed / design-proposal-needs-decision / external-evidence โดย citeDES/REQ. โดยเฉพาะ SEC001-002 เสนอแยก worker process/credential PGGradeDB, SEC001-003 four-eyes release, SEC001-006 keysสามชุดรวมcontent + HSM/dualcontrol: อย่าถือข้อเสนอเหล่านี้เป็นapprovedbaselineอัตโนมัติ ให้หาทางแก้ที่เรียบง่ายในสัญญาเดิมก่อน และส่ง jpo ประเมินว่ายอมรับหลักฐานแบบใดได้ (ไม่ใช่riskacceptance). ถ้าต้องเปลี่ยนสัญญาจริงให้อธิบาย tradeoff/ขอบเขต/ผู้ตัดสินเพื่อreview ห้ามเพิ่มtask/schemaหรือGRANT. ข้อมูลPDPA/CVEยังunverified ไม่ตัดสินกฎหมายจากความจำ.

ช่วยแก้คำอ้างอิงไม่ชัดเจนในauth-evidence-001 §6 'gate 6' ให้ใช้G-CORE/DBA-002/003 หรือ gateที่ถูกต้องจริงจากcanonical; แยกข้อเสนอenv/MenuPermissionในH5ให้ชัดว่าไม่อนุมัติendpointที่ต้องquerymenuเฉพาะแทนcontract. ไม่เปลี่ยนผลพิสูจน์ที่ผ่านมา. บันทึก findings ของport G/A เป็นhandoffให้gmพิจารณาbacklog ไม่เขียนbacklogเอง.

คืน fenced JSON เดียว <=4,000 tokens: {"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_HUMAN","summary":"...","dispositions":[{"finding":"SEC001-...","controls":[{"control":"...","classification":"already-contracted|implementation-needed|design-proposal-needs-decision|external-evidence","basis":["DES/REQ section"],"owner_task":"...","next_evidence":"..."}]}],"edits":[{"path":"knowledge/school-bot/design/auth-evidence-001.md","old":"unique exact","new":"..."}],"questions_for_jpo":["..."],"unresolved_decisions":[{"issue":"...","options":["..."],"recommends":"...","decider":"..."}],"handoff":["..."]}. ผู้คุมจะบันทึกsecurity-disposition-001ตามoutput ไม่ต้องส่งMarkdownซ้ำ. ไม่SQL/DB/codewrite/role/gitmutations. Statusทุกtaskยังpending; Importantทุกข้อยังOPENจนแก้และjpo re-audit.

## Change Log
- 2026-10-23 — รับSEC-001เพื่อเตรียมfix+re-audit; ผู้คุมถามเพียงdeployment/sourcepathแบบasync ไม่ขอriskacceptance
