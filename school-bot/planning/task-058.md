# ใบงาน058 — sys เตรียม H5 artifact bundle ของ BE-039 (docs-only)

วันที่2026-10-24 · sys/Codex t3 read-only · คิว override ใบงาน051 ขั้นสุดท้าย: "ส่ง implementation review ให้ G/Light และเตรียม H5" — ฝั่ง review packet G/Light ได้จาก arch057 §7 แล้ว งานนี้เตรียมชุด artifact ให้มนุษย์ตอบ H5 (env/host/TLS/secret/peer) ตามขอบเขต BE-039 "web-principal/BFF/session และ staff bootstrap"

K=C:/src/schoolbright/knowledge/school-bot. อ่านก่อน: planning/gateway-grpc-contract-response-001.json (arch057 — โดยเฉพาะ open_items และ §3/§6/§7) → design/gateway-grpc-contract-001.md Rev1 → design/gateway-integration-001.md Rev4 (ตาราง "เจ้าของและหลักฐานก่อนเปิดใช้") → design/des-012.md Rev9 (H5 checklist เดิม) → planning/evidence-002.md (แถว G-AUTH)

งาน: รวบรวมเป็น **H5 questionnaire artifact** รายการเดียวที่มนุษย์/เจ้าของระบบตอบได้โดยไม่ต้องเดา — แต่ละรายการระบุ: คำถาม · เหตุผลที่ต้องถาม (อ้างสัญญา/ส่วนที่ค้าง) · ผู้ที่ต้องตอบ (infra/G owner/B owner/BFF owner/ผู้ใช้ธุรกิจ) · รูปแบบคำตอบที่ยอมรับ · ผลกระทบเมื่อไม่มีคำตอบ (fail-closed อะไรเปิดไม่ได้) ครอบอย่างน้อย:
1. host/origin และ listener: gateway public origin, private web-principal listener, B upstream origin (ไม่ส่งค่าลับ ขอเฉพาะชื่อ env key/owner/สถานะ)
2. TLS/peer authentication ระหว่าง G↔B และ B→private G (รวม service identity ที่จะใช้ และวิธีพิสูจน์ peer)
3. secret/env matrix: ชื่อ key ที่ต้องมีต่อ process (G/B/BFF) ใครเป็นเจ้าของ สถานะปัจจุบัน (ยังไม่ตั้ง/ตั้งแล้ว) — ห้ามขอค่าจริง
4. tenant/rate-limit propagation: การส่ง source rate-limit key ต่อ (trusted ingress peer) และข้อยกเว้น opaque-session ที่ G/Light ต้องรับรอง (แยกเป็นคำถาม G/Light ชัด)
5. staff_admin bootstrap ตั้งต้น: ใครเป็น staff_admin คนแรก ตั้งค่าอย่างไรตาม DES-012
6. BFF/web-system และ admin BFF: env ชื่ออะไร (คง GATEWAY_API_URL ตามหลักฐานเดิม) ใครเป็นเจ้าของ repo/route mapping
7. ลำดับการเปิดใช้: อะไรเปิดก่อนหลัง (service-route หลัง G/Light รับรอง, .proto หลัง owner ตรึง contract ตาม contract §7)

คืน fenced JSON <=5000 tokens: {"state":"DONE|BLOCKED","summary":"...","artifact_path":"knowledge/school-bot/planning/h5-questionnaire-001.md","content":"markdown เต็มของ questionnaire","unanswerable":["จุดที่ทีมเองยังไม่มีข้อมูลประกอบ ระบุว่าต้องรออะไร"],"handoff":"..."} · ห้าม: เดาค่าตอบ แทนมนุษย์ตอบ, เขียน/แก้ไฟล์จริง, ถามผู้ใช้ซ้ำเรื่องที่ตอบแล้ว (transport/cType/มติ035/GATEWAY path), อ้างว่า H5 ปิดแล้วเพราะมี questionnaire

## Change Log
- 2026-10-24 — เปิดใบงาน sys เตรียม H5 artifact ตามคิว override 051 ขั้นสุดท้าย (docs-only)
- 2026-10-24 — รับผล: state=BLOCKED เฉพาะจุดอ้างอิง — questionnaire 7 หัวข้อสร้างครบ แต่ส่งคืนก่อนอ่าน evidence-002 เพราะใบงานระบุพาธ `planning/evidence-002.md` ผิด (จริงอยู่ที่ `plan/` ความผิดของนายช่าง); นายช่างบันทึก [h5-questionnaire-001.md](h5-questionnaire-001.md) พร้อมแก้พาธและยืนยันแถว G-AUTH ครอบครบเอง; ต้นฉบับที่ [h5-questionnaire-response-001.json](h5-questionnaire-response-001.json); H5 ยังเปิด — รอเจ้าของ/มนุษย์ตอบ
