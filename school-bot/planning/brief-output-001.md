# Planner brief — รูปแบบผลส่งมอบ

แยกจาก task-003.md เพื่อคุมขนาดไฟล์หลังเปิด command แล้ว วันที่2026-10-21

## รูปแบบผลส่งมอบ

ส่งข้อความ full artifacts ไม่เขียนไฟล์เอง ให้ MYCELIUM บันทึกนอก plan/ จน PM รับช่วง:

1. `=== FILE: planning/proposal-001.md ===` ... `=== END FILE ===` ภาษาไทย <=8KiB: ภาพรวม phases, sequencing/parallelism, critical path, first wave ที่เริ่มได้โดยไม่รอ gate, assumptions/effort bounds/ความเสี่ยง และ handoff PM
2. `=== FILE: planning/tasks-001.json ===` ... `=== END FILE ===` valid JSON ไม่ใส่ markdown fence ภายใน; machine artifact ใช้งบมากกว่า markdown ได้ แต่รวม output ทั้งหมดเป้าหมาย <=40KiB

JSON ใช้ schema นี้: `{revision:1,work_date:"2026-10-21",kind:"planner_proposal",phases:[{id,name}],gates:[{id,description,refs,close_evidence}],tasks:[{id,owner,tier,phase,depends_on:[],gate_ids:[],effort_days,goal,outputs:[],acceptance,req_ids:[],ac_ids:[],des_refs:[]}],first_wave:[],assumptions:[]}`

Task IDs ตาม role เช่น BE-001, FE-001, DBA-001, QA-001, UX-001, TP-001, SEC-001, SA-001, BA-001 ไม่ชนและไม่ renumber REQ/DES. owner ใช้ role ID จริง; fixed tier ตาม charter (SA t1, อื่น t2; BE/FE เสนอ t2..t5 ตามความยาก). effort_days ตัวเลข >0 และ <=2 พร้อมติดป้ายสมมติฐานในภาพรวม. dependency/gate ID ต้องมีจริง ไม่มี cycle; gate เป็น precondition ไม่ใช่ role human ที่เรียก CLI ได้

ทุก REQ และ AC ทั้ง 109 ข้อต้องมี task รับผิดชอบพร้อมหลักฐานตรวจใน acceptance (ซ้ำหลาย task ได้ แต่ห้ามแค่ใส่ REQ รวบใน QA task อย่างเดียวแล้วไม่มี implementation). ครอบคลุม installation/update/signing/หุ่นจริงและการส่งมอบครบ ไม่ตีความ phase แรกเป็น release scope ใหม่หรือตัดของออก

Markdown มี Rev1 และ Change Log วันที่2026-10-21; JSON มี work_date. จบด้วย handoff สั้นและ output state ตามบทบาท Planner. ไม่เปิด PM หรือทีมเอง

## Change Log

- 2026-10-21 — MYCELIUM ย้ายข้อกำหนด output แบบ verbatim; Planner ได้รับเนื้อหาครบใน prompt เดิมแล้ว
