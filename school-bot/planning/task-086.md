# ใบงาน086 — SQL constraints เหลือเฉพาะ PK

วันที่ 2026-10-26 · นายช่างบันทึกตามคำยืนยันล่าสุดของผู้ใช้ · DONE (static เท่านั้น)

## ขอบเขตและผล

ผู้ใช้ยืนยัน “เหลือแค่ pk ก็พอ CONSTRAINT”. เก็บ PRIMARY KEY32 และถอน UNIQUE24 / FOREIGN KEY40 / CHECK80 รวม144รายการจากร่าง SQL. ถอน DO blocks ที่เพิ่ม FK4คู่ และ DROP CONSTRAINT4คำสั่งใน rollback. คง32ตาราง/450คอลัมน์ ชนิดข้อมูล NULL/NOT NULL ค่าเริ่มต้น และ identity เดิม ไม่เติม constraints/indexes/GRANT/triggers ทดแทน

DBML แบบเต็ม Rev7 คง PK32, ถอด unique markers/index blocks/FK refs; enum representations เปลี่ยนเป็น varchar เดิมตาม SQL โดยค่าที่แอปใช้ยังอธิบายใน Notes. ภาพ integration Rev3 คง PK ของ SchoolBot10ตาราง และเปลี่ยน4FKเดิมเป็น logical-only รวม16เส้น. Dictionary32ตารางคงข้อมูลอ้างอิงในฐานะ logical relationships และปรับ SQL line links32จุด. ไม่เปลี่ยน source แอปหรือฐานจริง

บันทึกคำยืนยันเป็น decisions-044; ปรับ REQ-033/TP001-052, schema-notes/rules/model/คู่มือ/เกณฑ์ runtime และสารบัญปัจจุบันให้ตรงกัน. คง REQ/AC IDs และจำนวนเดิม ไม่เปลี่ยน release scope/แผน/task verdict หรืออ้างผล runtime จากการตรวจร่าง

## ที่มาของคำแนะนำ

- vault (Codex t2, read-only, DONE): `2026-10-26-07-28-15-vault-tier-t2-1agents-mmVopA` — วิเคราะห์ขอบเขต constraints/DO/rollback และวิธีแยก comma โดยรักษาคอลัมน์
- arch (Codex t1, read-only, DONE): `2026-10-26-07-28-47-arch-tier-t1-1agents-yPM957` — แผนปรับ full DBML, integration, dictionary, canonical notes และเกณฑ์ตรวจ
- สอง role วิเคราะห์ก่อนผู้ใช้สั่งหยุดรอบก่อนและไม่เคยแก้ไฟล์. รอบนี้อ่านผลเดิมและใช้เฉพาะส่วนที่ตรงกับคำยืนยันล่าสุด: **รักษา PK** ไม่ใช้ข้อเสนอถอน PK จาก scope ก่อนหน้า. การแก้และตรวจรอบนี้ดำเนินการโดยนายช่าง ไม่มี role ใหม่หรือการอ้าง verdict ใหม่

## Coverage

ก่อนแก้: `baan --sweep 'CONSTRAINT' --sweep 'PK32/UQ24' --sweep 'FK40' --sweep 'CHECK80' --sweep '40 FK' --sweep '40 Foreign Keys' --target school-bot` พบ23ไฟล์/217บรรทัด. ค้นเสริมคำว่า SQL บังคับจริง/physical FK/ยอด constraints และ references ของ revision เพื่อครอบคลุม dictionary/คู่มือ/fixture

ตั้งใจคงประวัติ: decisions เก่า, reviews, parser evidence, backlog, ใบงาน/check round, Change Log และภาคประวัติ Amendment032..034; ผลรับรอง revision เก่าไม่ใช้รับรองฉบับใหม่. รายการ references ใน dictionary/ภาพ integration คงเป็น logical-only; Notes ที่มีรหัส CK/UQ เดิมระบุชัดว่าไม่มี SQL บังคับ. ไม่สร้าง snapshot/archive

## การตรวจ

- `node reports/school-bot/verify-constraints-086.cjs` ผ่าน โดยใช้ `@dbml/core 10.3.1` dialect postgres/dbmlv2 แบบ offline; baseline `ab44726`
- SQL parse ผ่าน32ตาราง/450ฟิลด์; named constraints เหลือ PK32 (ชื่อ/คอลัมน์เดิม), UQ0/FK0/CHECK0; ไม่มี DO/ALTER FK, standalone indexes, role หรือ GRANT กลับมา. เทียบ parsed column metadata ก่อน/หลังตรงทั้งหมด รวม type/NULL/default/identity
- Full DBML parse ผ่าน32/450/PK32/index0/ref0; PK/NULL/default/identity metadata เดิมคงอยู่; เปลี่ยน enum types เป็น varchar ตาม SQL ที่ไม่มี CHECK เดิมแล้ว. Notes450ฟิลด์ยังอยู่ครบ
- Integration parse ผ่าน24ตาราง/112ฟิลด์ คอลัมน์/PK metadata เดิมตรง baseline; logical refs16/physical refs0; ไม่ใช้ภาพนี้สร้าง SQL
- Dictionary line links32จุดถูกต้อง; rollback คง DROP TABLE32รายการและไม่มี DROP CONSTRAINT ที่ไม่มีใน migration. TP JSON parse ผ่านและ actual=NOT_RUN เดิม
- `git -C knowledge diff --check` ผ่าน. รายงานดิบอยู่ `reports/school-bot/validation-086.json`; ไม่รัน SQL/DB/runtime หรือ build แอปเพราะไม่มี source delta
- Sweep หลังแก้ด้วยยอดเดิมและ revision เก่าเหลือ18ไฟล์/22บรรทัดก่อนเพิ่มใบงานนี้: เฉพาะประวัติ/Change Log/จำนวนที่ระบุว่าได้ถอนในมติ044และรายการมติปัจจุบัน ไม่มีสัญญาปัจจุบันอ้างว่ายังคง UQ24/FK40/CHECK80

การตรวจนี้ยืนยันร่างและเอกสารเท่านั้น. งานนี้ไม่ implement หรือพิสูจน์การบังคับกฎความไม่ซ้ำ/การอ้างอิง/validation ทดแทนในแอป; ฐานที่ deploy แล้วไม่ได้เปลี่ยนตามการแก้ไฟล์

## Change Log

- 2026-10-26 — รับคำสั่งเริ่มงานใหม่หลังเคยหยุด; เก็บเฉพาะ PK ตามคำยืนยันล่าสุด บันทึกผล static และปรับ references
