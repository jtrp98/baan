# school-bot — DB Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · convention เฉพาะโปรเจกต์ (SQL ของ vault + บันทึก review) · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · **DDL ทุกไฟล์เป็น DRAFT ยังไม่เคยรันบน DB จริง — การรัน SQL เป็นประตูมนุษย์เสมอ**

## ไฟล์ปัจจุบัน

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| `schoolbot_db.sql` | DDL รวมไฟล์เดียวของ SchoolBot DB 10.0.0.128:9499 (32 ตาราง, ไม่มี index, FK คอลัมน์เดียว) | DRAFT Rev5 — ยังไม่รัน |
| `schoolbot_db_rollback.sql` | rollback ของ `schoolbot_db.sql` | DRAFT Rev5 — ยังไม่รัน |
| `review-005.md` | รอบ review ล่าสุดของ SQL (Rev5 ตามคำสั่ง "อะไรไม่จำเป็นไม่ต้องใส่ / เอา index ออก") | ล่าสุด |
| `review-004.md` | รอบแยก SQL ตาม database (decisions-027 วางตารางที่ SchoolBot DB ของตัวเอง) | ประวัติ |
| `review-003.md` | รอบถอน index license + รวม SQL หนึ่งไฟล์ต่อ database | ประวัติ |
| `review-002.md` | รอบ Rev2 (partial index license active ต่อโรงเรียน) + ประเด็น LearnerId ครู/นักเรียนชนกัน | ประวัติ |
| `review-001.md` | รอบแรก บันทึก db/001–007 + rollback (DRAFT ไม่รัน) และประเด็นส่ง sec ตรวจ PII | ประวัติ |
| `proposal-learnerkind.md` | ข้อเสนอแก้ `LearnerId` ครู/นักเรียนชนกัน (SA) | รอผู้ใช้เลือก A/B |
| `archive\` | DDL/rollback ฉบับก่อนหน้า (rev1, rev4, rev5 เก่า, split-rev1, grants ที่ถอน) — verbatim | ประวัติ |

## หมายเหตุ

- ไม่แตะ School DB และ PGGradeDB — ใช้บัญชี DB เดิมตาม [decisions-029](../requirement/decisions-029.md)
- ผู้เขียน SQL = `vault` (DBA) · นายช่าง/SA ส่งมอบและตรวจ · ห้าม role ใดรัน SQL เอง (ประตูมนุษย์)

## Change Log

- 2026-10-22 — สร้างสารบัญหมวด db ตามมาตรฐาน baan (นายช่าง — งานปรับโครงสร้างเอกสารทุก module)

Back-links: `..\index.md`
