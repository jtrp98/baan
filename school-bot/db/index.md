# school-bot — DB Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · convention เฉพาะโปรเจกต์ (SQL ของ vault + บันทึก review) · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · **ผู้ใช้ยืนยันรัน schoolbot_db.sql สร้างตารางแล้วตาม [บันทึก045](../requirement/decisions-045.md); ยังไม่ตรวจ catalog/revision/API integration — การรัน SQL เพิ่มเติมเป็นประตูมนุษย์เสมอ**

## ไฟล์ปัจจุบัน

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| [connection-001.md](connection-001.md) | ผลเชื่อมต่อโดยตรงจาก web/.env และ SELECT แบบอ่านอย่างเดียว | สำเร็จ 2026-10-26: SELECT 1 ผ่าน, public SchoolBot* 32 ตาราง, PostgreSQL 15.19; ยังไม่ตรวจ schema parity/API integration |
| `schoolbot_db.sql` | DDL รวมไฟล์เดียวของ SchoolBot DB 10.0.0.128:9499 (32 ตาราง, standalone indexes 0; PK32/UQ0/FK0/CHECK0; audit fields4ตัว nullable DEFAULT NULL; backing indexes เฉพาะ PK) | physical Rev7; ใบงาน094 ให้ CREATE หยุดเมื่อตารางมีอยู่ ใช้เฉพาะฐานใหม่ — ผู้ใช้ยืนยันสร้างตารางแล้ว แต่ revision/catalog จริงยังไม่ตรวจ ([045](../requirement/decisions-045.md)) |
| `schoolbot_db_rollback.sql` | rollback ของ `schoolbot_db.sql` | รอคน review/รัน — physical Rev7; เพิ่ม guard ล็อก+ตรวจว่างครบ32ก่อน DROP (094); ไม่มีผล rollback |
| `schoolbot_catalog_review.sql` | C0–C5: inventory/คอลัมน์/PK/constraints/indexes จาก snapshot read-only เดียว เพื่อ AC-033-01..05 | เตรียมแล้ว 2026-10-29 — รอมนุษย์ review/รันบนฐานที่ API ทดสอบใช้ |
| [review-008.md](review-008.md) | ใบงาน094 DBA-002/004: runbook + [ACครบ11รายการแยกtask](review-008-ac.md) + [parity/ข้อแก้เอกสาร](review-008-parity.md) + [physical Project fields](review-008-project.md) | พร้อมคน review — static32ตาราง/450ฟิลด์/PK32; ยังรอ catalog/rollback/API evidence ไม่ปิด gate |
| `review-007.md` | vault ยืนยัน SEC001-009 replay TTL ของ create-license ไม่ต้องแก้ physical DDL (ใบงาน060c) | PASS (static) — read-time gate + cleanup job เป็นงาน application |
| `pii-inventory-001.md` | ตารางจำแนก PII รายคอลัมน์ 32 ตาราง + ตารางข้อมูลเด็ก 9 ตาราง + flag F1–F7 ส่ง jpo — ตอบ SEC001-010 | สร้างแล้ว — รอ jpo พิจารณา |
| `db-safe-evidence-001.md` | ชุดคำขอหลักฐาน EV-01..06 จากเจ้าของ Master DB (schema-only + aggregate ปลอด PII ตาม TR-AUTH-03..06) | พร้อมส่งมนุษย์/เจ้าของ DB — มติ decisions-036: ผู้ใช้เป็นคนส่ง |
| `db-safe-evidence-cover-001.md` | ข้อความพร้อม forward ถึงเจ้าของ Master DB (สรุป EV-01..06 + เงื่อนไขปลอด PII) | ผู้ใช้ยังไม่ได้ส่ง — รอยืนยัน |
| `review-006.md` | vault เทียบมติ 032..034: SQL เดิมรองรับทาง A; ช่องว่าง mapping lock/น้ำหนัก/partial apply/ขอบเขตผลต่อรอบเรียน ส่ง arch | NEEDS_DESIGN_CHANGE — static เท่านั้น ไม่มี SQL delta ในรอบนี้ |
| `review-005.md` | รอบ SQL Rev5 ตามคำสั่ง "อะไรไม่จำเป็นไม่ต้องใส่ / เอา index ออก"; แนบคำชี้แจงยอดปัจจุบัน BL-001 (delta D1–D7) แล้ว | ประวัติ + คำชี้แจงยอด 2026-10-24 |
| `review-004.md` | รอบแยก SQL ตาม database (decisions-027 วางตารางที่ SchoolBot DB ของตัวเอง) | ประวัติ |
| `review-003.md` | รอบถอน index license + รวม SQL หนึ่งไฟล์ต่อ database | ประวัติ |
| `review-002.md` | รอบ Rev2 (partial index license active ต่อโรงเรียน) + ประเด็น LearnerId ครู/นักเรียนชนกัน | ประวัติ |
| `review-001.md` | รอบแรก บันทึก db/001–007 + rollback (DRAFT ไม่รัน) และประเด็นส่ง sec ตรวจ PII | ประวัติ |
| `proposal-learnerkind.md` | ข้อเสนอแก้ `LearnerId` ครู/นักเรียนชนกัน (SA) | ผู้ใช้เลือก A ตาม decisions-032; ส่ง arch sync/app authorization |

## หมายเหตุ

- ไม่แตะ School DB และ PGGradeDB — ใช้บัญชี DB เดิมตาม [decisions-029](../requirement/decisions-029.md)
- ผู้เขียน SQL = `vault` (DBA) · นายช่าง/SA ส่งมอบและตรวจ · ห้าม role ใดรัน SQL เอง (ประตูมนุษย์)

Back-links: `..\index.md`
