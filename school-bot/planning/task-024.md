# ใบงาน024 — spec รับ requirement gaps จาก TP-001

วันที่2026-10-23 · spec t2 read-only · Claude→AGY→Codexสุดท้าย --no-fallback

อ่านindex-first school-bot/index.md,requirement/index.md,design/index.md,plan/index.md แล้ว test-plan/tp-001.json เฉพาะsummary/gaps/casesที่เกี่ยว และ req-025/027/011, decisions-025/026/030. inspectสร้าง77cases180AC (ผู้คุมตรวจIDS/ownerjoinผ่าน) แต่พบ9gaps ไม่ใช่QAPASS.

รับ GAP-01/02 เป็นงานทันที: 16384 'ตัวอักษร' ในAC-025-03 เทียบDES-003 UTF8 bytes; 'admin key' ในAC-027-01..04 เทียบมติปิดv1/adminใช้staff_admin+StaffRole. ตรวจ sourceเฉพาะจุดที่จำเป็น/อ้างอิงต้นฉบับuserในdecisionsให้ชัด. ทำamendเฉพาะถ้อยคำที่ตามมติเดิมได้ ไม่มีscopeใหม่/IDsเปลี่ยน ไม่เลือกหน่วยธุรกิจใหม่แทนผู้ใช้. ถ้าหลักฐานยืนยันตัวอักษรอยู่แล้วคงREQแล้วส่งarchแก้DES ไม่เปลี่ยนREQให้ตามdesignผิด. ระบุUTF16/codepoint/graphemeเฉพาะเมื่อมีหลักฐาน ไม่ invent. คงจำนวน44REQ180AC ถ้าไม่ต้องเพิ่มACตามนโยบายเดิม; ห้ามใช้DESเป็นbusinessapproval.

สำหรับGAP-05 hardwareและGAP-09 content ให้ระบุtask BA-003/BA-002/005/006+artifactที่จะเตรียมต่อ ไม่ต้องถามคนให้เดาเกณฑ์และไม่ถือว่ารอบนี้ทำinventory/UX/hardwareเสร็จ. Gapsอื่นเป็นarch ไม่แก้ข้ามเจ้าของ. ไม่เขียนไฟล์/source/git/SQLหรือเรียกrole

คืนfencedJSONเดียว<=3500tokens {"state":"DONE|NEEDS_REQUIREMENT_CHANGE|NEEDS_HUMAN","summary":"...","dispositions":[{"gap":"GAP-...","basis":["..."],"resolution":"...","remaining":"..."}],"edits":[{"path":"knowledge/school-bot/requirement/...","old":"uniqueexact","new":"..."}],"handoff":[{"role":"arch|inspect|...","task":"...","action":"..."}],"questions":[]}. ผู้คุมจะเก็บฉบับเดิมก่อนapply พร้อมChangeLogลงวันที่ ไม่แก้StatusของREQ/task

## Change Log
- 2026-10-23 — รับTP-001gapsเพื่อปิดข้อขัดแย้งที่ทำได้จากมติเดิม
