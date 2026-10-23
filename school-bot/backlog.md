# SchoolBot — Backlog

## กติกา

Append-only เพิ่ม BL-NNN พร้อมวันที่ ที่มา ความสำคัญ ผลกระทบต่อ AC และผู้เสนอ ห้ามแก้แถวเก่าหรือ renumber Findings ที่ไม่บล็อก AC เก็บที่นี่ ไม่เปิด task หรือเพิ่ม frozen release scope เอง การย้ายเข้า plan ต้องมีคำสั่งผู้ใช้เมื่อกระทบ scope

## รายการ

ยังไม่มี BL entry จากการรับแผนนี้ ไม่สร้าง speculative feature เพื่อเติม backlog ประเด็น DES-007/BE-019 เป็น contract coverage precondition ของ SA-001/G-RELEASE-DB จึงติดตามในแผน ส่วน human decisions เดิมติดตาม Waiting on Human โดยไม่สร้าง backlog ซ้ำ

### BL-001 — แก้คำอธิบายและตรวจยอด constraints ในเอกสาร

- วันที่: 2026-10-23
- ที่มา: vault review-006 advisory V012-09 (`db/review-006.md`) และข้อจำกัดที่บันทึกใน `planning/arch-review-001.md`; ผู้เสนอ: vault; ผู้บันทึก: gm
- ความสำคัญ: advisory ไม่บล็อก AC จากตัวเลขเอกสารเพียงอย่างเดียว
- งานติดตาม: arch แก้คำอธิบาย `schema-notes.md`; vault ตรวจยอดและเพิ่มคำชี้แจงใน `db/review-005.md` โดยรักษาประวัติเดิม อ้างผลนับปัจจุบันจาก review-006: 32 ตาราง/450 ฟิลด์/40 FK/24 UQ/80 CHECK/13 unique indexes/0 non-unique indexes พร้อมตรวจความตรงกันอีกครั้งตอนทบทวนสัญญาก่อน implementation
- ขอบเขต: งานเอกสารและตรวจยอดเท่านั้น ไม่เพิ่ม task หรือ frozen release feature ไม่เปลี่ยนสถานะตรวจรับหรือปิด gates และ finding นี้ไม่อนุญาตให้รัน SQL

## Change Log

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract
- 2026-10-23 — เพิ่ม BL-001 จาก V012-09 แบบ append-only ส่ง arch/vault แก้คำอธิบายและตรวจยอด โดยคง release scope และสถานะเดิม
