# ใบงาน 012 — vault ตรวจ SQL เทียบมติ 032..034

วันที่ของงาน: 2026-10-23 · งานต่อจากคำสั่งผู้ใช้ให้ส่งต่อ ทีมดำเนินเอกสารใน task-011

ตรวจแบบ read-only เป็นอิสระระหว่างรอ spec: อ่าน knowledge/school-bot/index.md, db/index.md, design/index.md ก่อน แล้วอ่าน requirement/decisions-032.md, decisions-033.md, decisions-034.md; db/schoolbot_db.sql, schoolbot_db_rollback.sql, review-005.md, proposal-learnerkind.md; design/des-004.md, des-005.md, des-008.md, des-009.md, des-010.md, des-011.md, data-contract-rules.md และ data-dictionary/table-012.md ถึง table-032.md เฉพาะที่เกี่ยว (ตามลิงก์ index ได้)

เป้าหมาย: ส่งข้อเท็จจริงให้ arch sync แบบโดยไม่ต้องรัน DB/แก้ SQL ตรวจว่าทาง A teacher ban ใช้ application authorization และ schemaเดิมได้; หนึ่งช่องหนึ่งกิจกรรม/หลายช่องหนึ่งกิจกรรม ช่องเดิมเท่านั้น mappingส่งแล้วimmutable/ชุดใหม่ และน้ำหนัก frozen ต่อCourseRun ข้อมูลเดิมรองรับหรือไม่ โดยเฉพาะ Sources JSON, Revision/IsDelete, ScoringPolicy, GradeSlot, Preview/Outbox/Export ตรวจ race/ประวัติ/กู้หลังpartial apply ให้เห็น gapจริง ไม่เสนอเพิ่ม index/constraint สวน decisions-029/030 หรือมติถอน indexโดยพลการ แยก SQLสิ่งที่บังคับจริงจาก app invariants และ runtime/DBที่ยังไม่พิสูจน์

ห้ามเขียนไฟล์/เรียกrole/รันSQL/ต่อDB/แตะsource Git ไม่ผลิตSQLdeltaก่อน arch แก้แบบ ขอ fenced JSON เดียว:
{"state":"DONE|NEEDS_DESIGN_CHANGE|NEEDS_HUMAN","summary":"...","findings":[{"id":"V012-01","severity":"blocking|advisory","reference":"file:line","fact":"...","required_action":"..."}],"schema_delta_required":false,"handoff_arch":["..."],"review_markdown":"เนื้อหาผลตรวจภาษาไทย พร้อมวันที่ ขอบเขต ตารางหลักฐาน SQL:line ข้อค้างผู้รับต่อ และ Change Log"}

หากพบ design gap ส่ง NEEDS_DESIGN_CHANGE ได้โดยยังรายงานข้อที่ตรวจครบ ไม่ตีความว่าปิดbusiness OQเท่ากับruntime acceptance มติ OQ014/016ปิดแล้ว ห้ามเปิดถามซ้ำ คงhuman gateการรันSQL/เกรดจริง ไม่ต้องรายงาน secrets

## Change Log

- 2026-10-23 — vault ส่ง NEEDS_DESIGN_CHANGE / CLI exit 0; บันทึก db/review-006.md และ planning/vault-response-001.json มี findings 10 ข้อ ยังไม่เสนอ physical delta ส่ง arch ปิดช่องว่างสัญญา

- 2026-10-23 — นายช่างส่ง vault ตรวจ SQL เทียบมติแบบ read-only คู่กับ spec เพื่อให้ arch ได้หลักฐานก่อนปรับสัญญา
