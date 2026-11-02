# school-bot — DB Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · convention เฉพาะโปรเจกต์ (SQL ของ vault + บันทึก review) · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · **ผู้ใช้ยืนยันรัน schoolbot_db.sql สร้างตารางแล้วตาม [บันทึก045](../requirement/decisions-045.md); ยังไม่ตรวจ catalog/revision/API integration — การรัน SQL เพิ่มเติมเป็นประตูมนุษย์เสมอ**

## ไฟล์ปัจจุบัน

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| ผลรีวิวรายรอบของ vault (`review-001..008*`), หลักฐาน connection / db-safe และ `proposal-learnerkind` (ตัดสินแล้วตาม decisions-032) | ย้ายไป memory `db/` เมื่อ 2026-11-02 — ข้อสรุปที่ยังใช้อยู่ในตารางนี้และใน design | ประวัติ (memory) |
| `schoolbot_db.sql` | DDL รวมไฟล์เดียวของ SchoolBot DB 10.0.0.128:9499 (32 ตาราง, standalone indexes 0; PK32/UQ0/FK0/CHECK0; audit fields4ตัว nullable DEFAULT NULL; backing indexes เฉพาะ PK) | physical Rev7; ใบงาน094 ให้ CREATE หยุดเมื่อตารางมีอยู่ ใช้เฉพาะฐานใหม่ — ผู้ใช้ยืนยันสร้างตารางแล้ว แต่ revision/catalog จริงยังไม่ตรวจ ([045](../requirement/decisions-045.md)) |
| `schoolbot_db_rollback.sql` | rollback ของ `schoolbot_db.sql` | รอคน review/รัน — physical Rev7; เพิ่ม guard ล็อก+ตรวจว่างครบ32ก่อน DROP (094); ไม่มีผล rollback |
| `schoolbot_catalog_review.sql` | C0–C5: inventory/คอลัมน์/PK/constraints/indexes จาก snapshot read-only เดียว เพื่อ AC-033-01..05 | เตรียมแล้ว 2026-10-29 — รอมนุษย์ review/รันบนฐานที่ API ทดสอบใช้ |
| `pii-inventory-001.md` | ตารางจำแนก PII รายคอลัมน์ 32 ตาราง + ตารางข้อมูลเด็ก 9 ตาราง + flag F1–F7 ส่ง jpo — ตอบ SEC001-010 | สร้างแล้ว — รอ jpo พิจารณา |

## หมายเหตุ

- ไม่แตะ School DB และ PGGradeDB — ใช้บัญชี DB เดิมตาม [decisions-029](../requirement/decisions-029.md)
- ผู้เขียน SQL = `vault` (DBA) · นายช่าง/SA ส่งมอบและตรวจ · ห้าม role ใดรัน SQL เอง (ประตูมนุษย์)

Back-links: `..\index.md`
