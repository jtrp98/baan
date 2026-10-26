# ใบงาน085 — ถอน GRANT และส่วนจัดการสิทธิ์ฐานข้อมูล

วันที่ 2026-10-26 · นายช่างบันทึกตามผล vault · DONE (static)

ผู้ใช้สั่ง “ไม่ต้องมีหรอก เอาออก” ต่อจากคำอธิบาย GRANT SELECT. ถอน GRANT ทั้ง 7 statements (schema USAGE 1 และ SELECT/INSERT/UPDATE บนตาราง 6), ส่วนสร้าง role schoolbot_app ที่ไม่มีผู้ใช้งานเหลือ และ REVOKE ที่คู่กันใน rollback. ไม่มีการรัน SQL/เชื่อม DB หรือเปลี่ยนสิทธิ์ฐานจริง

## หลักฐานและ coverage

- อ่านสถานะ module/DB/plan เดิม; baseline knowledge `89c8220`
- ก่อนแก้: `baan --sweep 'GRANT' --sweep 'schoolbot_app' --sweep 'REVOKE' --target school-bot` พบ 40 ไฟล์/92 บรรทัด รวมโมดูลอื่นและคำอ้างอิงสิทธิ์ทั่วไป. แก้ SQL/rollback, schema-notes, credential-matrix, export-runtime-evidence และ SQL table links ใน dictionary 32 จุด
- vault ผ่าน `baan-role`, Codex t2, read-only, DONE: `2026-10-26-07-23-18-vault-tier-t2-1agents-WQ7E1Z`; นายช่างบันทึก exact mechanical removal จากผล role ไม่เปิด role ต่อเจ้าของสำหรับการแก้ references เชิงกล
- คง decisions/review/ใบงานเดิมเป็นประวัติ; ข้อห้ามสร้างสิทธิ์ในฐาน legacy, เกณฑ์ตรวจสิทธิ์ของบัญชีจริง และคำทั่วไปที่ใช้ GRANT/REVOKE ไม่ใช่คำสั่งที่ต้องลบ. ไม่แก้ role/permission ระดับแอป, RetakeGrant หรือการ revoke license/session

## การตรวจ

Node assertions ผ่าน: GRANT 7 → 0; ไม่เหลือ schoolbot_app/CREATE ROLE/GRANT/REVOKE ใน SQL สองไฟล์. เทียบ tokens หลังละเฉพาะส่วนที่ถอน, comments และ whitespace แล้ว SQL ส่วนอื่นตรง baseline. คง 32 ตาราง / PK32 / UQ24 / FK40 / CHECK80; rollback คง DROP TABLE 32 รายการและ FK rollback เดิม. Dictionary links 32 จุดตรง CREATE TABLE เดิมหลังบรรทัดเลื่อน. DBML ไม่เปลี่ยน ไม่ต้องรัน parser หรือ build/test แอปซ้ำ

ตรวจ `git -C knowledge diff --check` ผ่าน. Sweep หลังแก้ด้วยชื่อ role และรูปคำสั่งที่ถอน เหลือเฉพาะ decisions/review เดิมและใบงานนี้; ไม่มีคำอ้างว่าสร้าง role หรือให้สิทธิ์ด้วย DDL ในเอกสารปัจจุบัน

## Change Log

- 2026-10-26 — รับคำสั่งผู้ใช้ ถอนส่วนจัดการสิทธิ์จากร่าง SQL และปรับ references ที่เกี่ยวข้อง
