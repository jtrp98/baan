# ใบงาน088 — CONTINUE-NORMAL: เดินงานที่พร้อมโดยรวมประตูมนุษย์ตอนจบ

วันที่ 2026-10-26 · ผู้คุม: นายช่าง · โมดูลที่ผู้ใช้เลือก: school-bot

## ขอบเขตและสถานะตั้งต้น

ทำตาม CONTINUE-NORMAL.md ในโหมดปกติ ทุก role ผ่าน baan-role; T0–T2 Codex / T3–T5 AGY, --no-fallback. งานอิสระขนานไม่เกิน 3, เขียน repo เดียวกัน serialize. ผู้คุมไม่ implement งาน role เอง

ฐาน 110 tasks: 15 verified / 95 pending; UX 7/7 signed. Decisions-045: ผู้ใช้สร้างตารางแล้ว; connection-001: direct DB connection/SELECT1/32 tables ผ่าน แต่ไม่ใช่ API/schema parity. Decisions-046 อนุญาต Gateway dev บน branch ที่เตรียมไว้และ replay15นาที; decisions-047 พัก signer/custody. ไม่ถามเรื่องที่ตอบแล้วหรือเรื่อง signer ที่ผู้ใช้พักไว้

Lint canonical plan exit1: implement63, ติด human gate62, พร้อม1 (BE-001). เปิด gm เพื่อเสนอคิว local/stub กับ integration แยกกัน ไม่อนุมัติเปลี่ยน release scope/DAG/gates เอง และเดินส่วนที่ไม่พึ่งของจริงต่อ

## คิวเริ่มรอบ

1. gm Codex T2 read-only: เสนอ local/integration slicing และรายการ ready/waiting ครบจากแผนเดิม พร้อมข้อเสนอแก้ lint สำหรับถามผู้ใช้ตอนจบ
2. sys AGY T3 write target/school-bot: BE-001 legacy compatibility + sanitized fixtures/adapter ที่สัญญารองรับ ไม่ใช้ข้อมูลจริงหรือเชื่อม DB/network
3. arch Codex T1 read-only: ตรึง slice Gateway/gRPC logout ที่เล็กที่สุดจากสัญญาปัจจุบัน พร้อม exact code-facing contract/AC และแยก implementation review/H5 ที่ยังต้องมีหลักฐาน

บันทึกผลแต่ละ slice ลง knowledge และ commit ทันที; tests ของ engineer ต้องผู้คุมรันซ้ำก่อนนับ done-local, verified เฉพาะ check verdict ครบ task. ไม่ใช้ผล subset ปิด canonical task ทั้งงาน

## ข้อห้ามและรายการรอคำตัดสิน

ไม่รัน SQL จริง/deploy/migrate shared/hardware, ไม่ mutate Git target, ไม่อนุมัติแทนคนหรือรับความเสี่ยง. Gates ที่พบเก็บคำถาม/ทางเลือก/ข้อแนะนำ/งานที่ปลดล็อกเพื่อถามพร้อมกันตอนท้าย; signer/custody ที่พักไว้คง deferred

## Change Log

- 2026-10-26 — รับคำสั่ง CONTINUE-NORMAL และการเลือกโมดูล พร้อม lint จริงก่อน dispatch

## Execution checkpoint

- gm Codex T2 ครั้งแรกไม่ได้ output: Selected model is at capacity; รายงาน `2026-10-26-08-33-29-gm-tier-t2-1agents-b7xh5p`. ลอง runner/tier เดิมใหม่ ไม่สลับโมเดลเอง
- sys AGY T3 ครั้งแรกไม่ได้ output เพราะ native read_file ต้องขอ permission ที่ headless ตอบไม่ได้; รายงาน `2026-10-26-08-33-28-sys-tier-t3-1agents-QlMJDV`. ลองใหม่โดยใช้ command tool ที่มีสิทธิ์อยู่แล้วอ่านเฉพาะ source/knowledge ที่อนุญาต ไม่แก้ settings หรือปิด permission guard และห้ามอ่าน .env
- arch Codex T1 กำลังทำ code-facing Gateway packet. ยังไม่มี code/test/verdict ใหม่จากสามงาน ณ checkpoint นี้
