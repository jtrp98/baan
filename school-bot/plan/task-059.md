# ใบงาน059 — gm ปรับคิว/แผนตามผลรอบ transport contract (docs-only)

วันที่2026-10-24 · gm/Codex t2 read-only · related-impact sweep รอบใบงาน055–058: ผลรอบนี้เปลี่ยนสถานะคิว override 051 (สามขั้นของคิวทำครบแล้วในระดับเอกสาร) ต้องสะท้อนในไฟล์เจ้าของ gm

K=C:/src/schoolbright/knowledge/school-bot. อ่านก่อน: plan/index.md → plan/queue-003.md (ส่วน Override ใบงาน051) → planning/task-055..058.md (change log ผลรับ) → design/gateway-grpc-contract-001.md (Rev1 PROPOSED + open items) → planning/h5-questionnaire-001.md → planning/routing-linkage-evidence-001.json + 002.json

ข้อเท็จจริงรอบนี้ (ใช้เขียน ห้ามตีความเกิน):
- 055 sys: BLOCKED บน legacy (WebLoginService/FindAuthUserDetail ไม่อยู่ที่นั่น) → 056 sys ตรวจ G ต่อ: DONE — ไม่มี pre-auth cType selector จริง; legacy/web=employee-only เลือกแถวล่าสุดเงียบๆ; fullLogin คง NOT_READY
- 057 arch: NEEDS_HUMAN — gateway-grpc-contract-001.md Rev1 PROPOSED (RPC/DTO, mapping, trust, deadline/retry, review packet G/Light 7 ข้อ); Gateway integration เป็น Rev4 (pointer เท่านั้น); ไม่แก้ DES-012
- 058 sys: questionnaire H5 7 หัวข้อพร้อมส่งเจ้าของ/มนุษย์ตอบ (planning/h5-questionnaire-001.md)
- คงเดิมทั้งหมด: 110 tasks pending, 44 REQ/180 AC, 8 phases/17 gates, 77 TP cases NOT_RUN, Important6 OPEN, ไม่มี code/SQL/runtime ใหม่

งาน (คืน edits ให้นายช่าง apply — ห้ามเขียนไฟล์เอง):
1. plan/queue-003.md: เพิ่มส่วนสถานะสั้นหลัง Override 051 (หรือ amend ท้ายส่วน override) ระบุ: สามขั้นของคิว docs ทำแล้ว (055/056 → 057 → 058), ผลลัพธ์ไฟล์ไหน, สิ่งที่เหลือคือประตูเจ้าของ/มนุษย์ (G/Light รับรองข้อยกเว้น+mapper, H5 questionnaire 7 หัวข้อ, selector/cardinality พิสูจน์ต่อ) — ไม่ลบข้อความเดิม + change log ลงวันที่
2. plan/index.md: ปรับ "Waiting on Human" ให้ precedence ใหม่ชี้ผลรอบนี้ (queue-003 ฉบับปรับ059 + h5-questionnaire-001 + gateway-grpc-contract open items) โดยคงข้อความฐานเดิมไว้ + change log

คืน fenced JSON <=4000 tokens: {"state":"DONE","summary":"...","edits":[{"path":"...","old":"unique exact","new":"exact replacement"}],"invariants":["110 tasks pending ฯลฯ ที่ตรวจแล้ว"],"handoff":"..."} · ห้าม: เปลี่ยน Status/gates/dependency, เพิ่ม/ลด task, ถามผู้ใช้ซ้ำ, อ้างว่า gate ปิด

## Change Log
- 2026-10-24 — เปิดใบงาน gm sync แผน/คิวหลังรอบ 055–058 (docs-only)
