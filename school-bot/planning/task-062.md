# ใบงาน062 — เดินคิว UX-005/UX-007 และเตรียมรับรอง Gateway/DB

วันที่ 2026-10-26 · ผู้คุม: นายช่าง · ต่อจากใบงาน061 (15 verified / 95 pending)

## คำสั่งและขอบเขต

- ผู้ใช้: "เริ่มกันเลย ถ้า T0,1,2 ใช้ codex นะ ส่วน 3,4,5 ใช้ agy"
- เลือก runner ตาม tier: t0/t1/t2 = codex; t3/t4/t5 = agy; ใช้ `--no-fallback` เพื่อไม่เปลี่ยนข้าม runner ที่สั่ง
- เดินคิวที่พร้อม: UX-005 และ UX-007 (BA-002/SA-002 verified แล้ว) → check ตรวจจาก AC/แบบ → ส่งผู้ใช้เซ็นฉบับที่ตรวจแล้ว
- คงขอบเขตเอกสารก่อนตามคำสั่งเดิม; ไม่เปิด implementation ที่รอ owner/UX/schema/security gates
- รวบ Gateway/DB owner packet จากหลักฐานปัจจุบันโดยไม่ถามธุรกิจที่มีมติแล้วซ้ำ ไม่เดา host/secret หรืออนุมัติแทนเจ้าของ

## Dispatch

| ใบงาน | Role/tier/runner | ผลที่ต้องส่ง |
|---|---|---|
| 063 | int / t2 / codex | ร่าง UX-005 admin หลักสูตร/คลังข้อสอบ (int-006) พร้อม AC trace และคำถามเซ็น |
| 064 | int / t2 / codex | ร่าง UX-007 attempt/นโยบาย/เลื่อน Level (int-007) พร้อม AC trace และคำถามเซ็น |
| ถัดไป | check / t2 / codex | ตรวจสองร่างจาก spec/contract และ artifact จริง; verdict เอกสารแยก human sign-off |
| ปิดรอบ | gm / t2 / codex | sync plan/queue จากหลักฐาน ตรวจผู้อ้างอิงทั้งหมด และทำ owner packet พร้อมรับคำตอบ |

## หลักฐานฐานและข้อจำกัด

- `plan/index.md` + `plan/extension/index.md`: 110 งาน; verified 15/pending 95; 44 REQ/185 AC/80 test cases
- `uxui/index.md`: signed 5/7; UX-005/007 ยังไม่ร่างและไม่เซ็น
- `planning/h5-questionnaire-001.md`, `design/gateway-grpc-contract-001.md` §7 และ `db/db-safe-evidence-cover-001.md`: รอเจ้าของ/หลักฐานเดิม
- ไม่มี SQL/DB/network login/หุ่นจริง/deploy/source Git mutation; 4,032 local tests เป็นผลเดิม ไม่ใช่ผลรันรอบนี้
- ผู้คุมบันทึก outputs ของ read-only roles เป็นหลักฐาน; snapshot ก่อน amend; ไม่เปลี่ยน status เป็น verified จนมี verdict และ sign-off ที่ task กำหนด

## Change Log

- 2026-10-26 — เปิดรอบตามคำสั่งผู้ใช้และกำหนด runner routing ข้างต้น
