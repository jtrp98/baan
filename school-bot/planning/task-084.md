# ใบงาน084 — ถอน standalone database indexes

วันที่ 2026-10-26 · นายช่างคุมงานเล็ก · กำลังตรวจปลายทาง

## คำสั่งและขอบเขต

ผู้ใช้: “Module school-bot เอา index ออกให้หมด ฉันไม่ใช้” และยืนยันว่า “Database indexes ใน SQL/DBML ทั้งหมด”. ถอน standalone CREATE INDEX/CREATE UNIQUE INDEX และรายการแทน index เหล่านั้นใน DBML; คง PK/UNIQUE/FK/CHECK constraints เดิม รวม DBML unique entries ที่แทน UNIQUE constraints. PostgreSQL ยังสร้าง backing indexes ของ PK/UNIQUE จึงไม่อ้างว่าไม่มี physical indexes ทุกชนิด. ไม่รัน SQL หรือเปลี่ยนฐานจริง

## Coverage ก่อนแก้

`baan --sweep 'CREATE UNIQUE INDEX' --sweep 'ux_schoolbot_' --sweep 'indexes {' --target school-bot`: 13 ไฟล์/112 บรรทัด รวมผลจากโมดูลอื่น. งานนี้แก้ SQL, DBML, rules, schema-notes, DES-008/011, runtime evidence, GF-03c และสารบัญสถานะปัจจุบัน. ค้นเสริมยอด unique index และแก้ลิงก์เลขบรรทัดตารางใน data dictionary ที่เลื่อนตาม SQL

ตั้งใจคง: decisions/review/amendment-proposal/ใบงาน/หลักฐาน parser และ validation เดิม/Change Log เป็นประวัติผล ณ วันที่เดิม; UNIQUE constraints ใน DBML; ผลจากโมดูลอื่นและข้อมูล index ของฐาน legacy นอก SchoolBot. ไม่สร้าง snapshot/archive และไม่เปลี่ยน release scope หรือ task verdict

## ผู้ตรวจแบบและผู้บันทึก

- vault: `2026-10-26-07-07-37-vault-tier-t2-1agents-Vlllw3` · Codex t2, read-only, DONE; ยืนยัน index 13 ตัว, placeholder 13 รายการ + FK-source pseudo-index 1 รายการ และ constraints คงเดิม
- arch: `2026-10-26-07-08-07-arch-tier-t1-1agents-khFa7c` · Codex t1, read-only; รอผล
- นายช่างบันทึกการแก้จากผล role; ไม่แก้ source repository

## ผลตรวจ

รอตรวจ diff, DBML parser, constraints และ related-impact sweep หลังแก้. การบังคับกฎเดิมที่ถอน partial unique indexes ต้องทำแบบ atomic ใน application/repository; งานนี้ไม่ได้ implement หรือพิสูจน์ runtime ของการป้องกันดังกล่าว

## Change Log

- 2026-10-26 — รับคำสั่งและคำยืนยันขอบเขตจากผู้ใช้; ถอน index ในร่าง SQL/DBML และตรวจเอกสารที่เกี่ยวข้อง
