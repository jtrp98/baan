# school-bot — DB Index

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สารบัญนี้รวมร่าง SQL และทะเบียนข้อมูลส่วนบุคคล ผู้ใช้ยืนยันสร้างฐานข้อมูลและตารางแล้วตาม [มติ 045 (ยืนยันสร้างฐานข้อมูลและตาราง)](../../shared/decisions/decisions-045.md) แต่ยังไม่ตรวจ catalog, revision และ API integration การรัน SQL เพิ่มเติมต้องได้รับอนุญาตจากมนุษย์

## ไฟล์ปัจจุบัน

| ไฟล์ | เนื้อหา | สถานะ |
|---|---|---|
| ผลตรวจโครงสร้างและทางเลือกของ vault | ข้อสรุปปัจจุบันอยู่ในตารางนี้และเอกสาร design; แหล่งประวัติอยู่ในหลักฐานท้ายไฟล์ | ประวัติ |
| `schoolbot_db.sql` | DDL รวมไฟล์เดียวของ SchoolBot DB 10.0.0.128:9499 (32 ตาราง, standalone indexes 0; PRIMARY KEY 32 รายการ, UNIQUE 0, FK 0, CHECK 0; audit fields 4 ตัว nullable DEFAULT NULL; backing indexes เฉพาะ PK) | physical Rev7; CREATE ต้องหยุดเมื่อตารางมีอยู่ ใช้เฉพาะฐานใหม่ — ผู้ใช้ยืนยันสร้างตารางแล้ว แต่ revision/catalog จริงยังไม่ตรวจ ([มติ 045 (ผู้ใช้ยืนยันสร้างฐานข้อมูลและตารางแล้ว)](../../shared/decisions/decisions-045.md)) |
| `schoolbot_db_rollback.sql` | rollback ของ `schoolbot_db.sql` | รอคน review/รัน — physical Rev7; เพิ่ม guard ที่ล็อกและตรวจว่าทั้ง 32 ตารางว่างก่อน DROP; ไม่มีผล rollback |
| `schoolbot_catalog_review.sql` | C0–C5: inventory/คอลัมน์/PK/constraints/indexes จาก snapshot read-only เดียว เพื่อ [AC-033-01 (ชื่อและฟิลด์ข้อมูล SchoolBot)](../../modules/app-shell/shared/requirements/req-033.md)..05 | เตรียมแล้ว 2026-10-29 — รอมนุษย์ review/รันบนฐานที่ API ทดสอบใช้ |
| [pii-inventory-001.md](pii-inventory-001.md) | ทะเบียน PII รายคอลัมน์ของ 32 ตารางสำหรับ [SEC001-010 (ทะเบียนข้อมูลผู้เยาว์ การเก็บรักษา และ masking)](../security.md) พร้อม [รายการคอลัมน์](pii-inventory-001-columns.md) และ [ข้อพิจารณาให้ jpo](pii-inventory-001-considerations.md); จำนวนตารางข้อมูลเด็กเดิมขัดกันตามรายการท้ายไฟล์ | สร้างแล้ว — รอ jpo พิจารณา |

## หมายเหตุ

- ไม่แตะ School DB และ PGGradeDB — ใช้บัญชี DB เดิมตาม [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md)
- ผู้เขียน SQL = `vault` (DBA) · นายช่าง/SA ส่งมอบและตรวจ · ห้าม role ใดรัน SQL เอง (ประตูมนุษย์)

[กลับสารบัญโมดูล](../../INDEX.md)

## ยังไม่ยืนยัน

แถว inventory เดิมในสารบัญระบุข้อมูลเด็ก 9 ตารางและข้อพิจารณา F1–F7 แต่ตัว inventory ระบุอย่างน้อย 13 ตาราง (ตรง 8 และทางอ้อม 5) พร้อมข้อพิจารณา F1–F8 ต้องให้ vault และ jpo ยืนยันการปรับสารบัญให้ตรงกัน งานนี้เก็บทั้งสองข้อความโดยไม่เลือกยอดแทน

## หลักฐาน

- ผล review-001..008, connection/db-safe และ proposal-learnerkind ย้ายไป db/ (memory) เมื่อ 2026-11-02; ทางเลือก LearnerId ตัดสินตาม [มติ 032 (ผลทดลองของครูและการล็อก mapping คะแนน)](../../shared/decisions/decisions-032.md)
