# ใบงาน 016 — gm แก้ metadata สองจุดก่อนบันทึกแผน

วันที่ของงาน: 2026-10-23 · ต่อ task-015 gm DONE/accept_recovered=true แล้วที่ planning/gm-response-001.json; ไม่ต้องสร้างหรือยืนยันแผนใหม่ซ้ำ

ผู้คุมตรวจ final draft พบ fixed tier ผิดจุดเดียว: SA-004 (index107 ของ proposed tasks) owner arch แต่ tier=t2 ขัด charter BAAN ที่ arch=t1 คงที่ ส่วนอื่นถูกทั้งหมด ขอเจ้าของแผนคืน correction /tasks/107/tier t2→t1 ตามกติกา ไม่เปลี่ยนscope/dependencies/status/gates จำนวนยัง110/180

อีกข้อ advisory จาก vault review-006 V012-09: schema-notes.md/review-005 มีตัวเลขconstraintsเก่า ต่างจากSQLปัจจุบัน (32ตาราง/450ฟิลด์/40FK/24UQ/80CHECK/13unique indexes/0nonunique); ปัจจุบันมีreview-006บอกตัวเลขที่ถูกและarch-review-001ระบุข้อจำกัดแล้ว ให้ gm เพิ่ม BL-001 แบบappend-onlyในbacklogเดิมเป็นงานแก้คำอธิบาย/ตรวจยอด ไม่เพิ่มfrozenreleasefeatureหรือtask ไม่บล็อกACจากตัวเลขเอกสารเพียงอย่างเดียว และไม่ให้ใครรันSQLจากfindingนี้ ส่งarch/vaultตามเจ้าของ

อ่าน index-first knowledge/school-bot/index.md, plan/index.md, db/index.md แล้ว planning/gm-response-001.json, arch-review-001.md, db/review-006.md, backlog.md; ตรวจ SA-004จาก .tmp-schoolbot-handoff/gm-preview/knowledge/school-bot/plan/tasks-001.json ด้วยโปรแกรมได้ ไม่ต้องอ่านdraft117kซ้ำ

คืน fenced JSON เดียว<=3500ตัวอักษร:
{"state":"DONE","summary":"...","json_edits":[{"path":"knowledge/school-bot/plan/tasks-001.json","pointer":"/tasks/107/tier","old":"t2","new":"t1"}],"edits":[{"path":"knowledge/school-bot/backlog.md","old":"ข้อความตรงหนึ่งตำแหน่ง","new":"ข้อความเดิมพร้อมBL-001และChangeLogวันที่"},{"path":"knowledge/school-bot/plan/index.md","old":"ข้อความตรงในpreviewหนึ่งตำแหน่ง","new":"เพิ่มChangeLog metadataตามเหมาะสม"}],"new_files":[],"questions":[]}

ไม่เขียนไฟล์/เรียกrole/SQL/implement ห้ามเปลี่ยนstatusเดิม นี่คือfixedmetadataตามcharterและบันทึกfindingเดิม ไม่ถามธุรกิจ/approvalเพิ่ม บันทึกจะทำหลังapplyร่างที่คุณรับแล้ว จึงอ้างoldของplan/indexจากpreviewที่รับแล้ว

## Change Log

- 2026-10-23 — gm DONE บันทึก gm-response-002.json และ applyแล้ว; SA-004tier=t1, BL-001append-only จำนวนงาน/AC/สถานะ/dependencies/gatesคงเดิม

- 2026-10-23 — นายช่างตรวจ fixed role tiers หลัง gm รับร่าง พบ SA-004 จุดเดียว และส่ง advisory เก่าลง backlog โดยเจ้าของ
