# ใบงาน084 — ถอน standalone database indexes

วันที่ 2026-10-26 · นายช่างคุมงานเล็ก · DONE (static เท่านั้น)

## คำสั่งและขอบเขต

ผู้ใช้: “Module school-bot เอา index ออกให้หมด ฉันไม่ใช้” และยืนยันว่า “Database indexes ใน SQL/DBML ทั้งหมด”. ถอน standalone CREATE INDEX/CREATE UNIQUE INDEX และรายการแทน index เหล่านั้นใน DBML; คง PK/UNIQUE/FK/CHECK constraints เดิม รวม DBML unique entries ที่แทน UNIQUE constraints. PostgreSQL ยังสร้าง backing indexes ของ PK/UNIQUE จึงไม่อ้างว่าไม่มี physical indexes ทุกชนิด. ไม่รัน SQL หรือเปลี่ยนฐานจริง

## Coverage ก่อนแก้

`baan --sweep 'CREATE UNIQUE INDEX' --sweep 'ux_schoolbot_' --sweep 'indexes {' --target school-bot`: 13 ไฟล์/112 บรรทัด รวมผลจากโมดูลอื่น. งานนี้แก้ SQL, DBML, rules, schema-notes, DES-008/011, runtime evidence, GF-03c และสารบัญสถานะปัจจุบัน. ค้นเสริมยอด unique index และแก้ลิงก์เลขบรรทัดตารางใน data dictionary ที่เลื่อนตาม SQL

ตั้งใจคง: decisions/review/amendment-proposal/ใบงาน/หลักฐาน parser และ validation เดิม/Change Log เป็นประวัติผล ณ วันที่เดิม; UNIQUE constraints ใน DBML; ผลจากโมดูลอื่นและข้อมูล index ของฐาน legacy นอก SchoolBot. ไม่สร้าง snapshot/archive และไม่เปลี่ยน release scope หรือ task verdict

## ผู้ตรวจแบบและผู้บันทึก

- vault: `2026-10-26-07-07-37-vault-tier-t2-1agents-Vlllw3` · Codex t2, read-only, DONE; ยืนยัน index 13 ตัว, placeholder 13 รายการ + FK-source pseudo-index 1 รายการ และ constraints คงเดิม
- arch: `2026-10-26-07-08-07-arch-tier-t1-1agents-khFa7c` · Codex t1, read-only, DONE; ส่ง amendment ของ rules/schema-notes/DES-008/011/DBML/GF-03c และข้อกำหนด lock ข้าม process
- นายช่างบันทึกการแก้จากผล role; ไม่แก้ source repository

## ผลตรวจ

- ตรวจด้วย Node + `@dbml/core 10.3.1`, `Parser.parse(text, 'dbmlv2')`: แบบเต็ม PASS 32 ตาราง/450 ฟิลด์/40 FK; ภาพ integration PASS และไม่เปลี่ยน. เทียบ semantic model กับ commit `9a1aed2`: fields/types/NULL/default/PK, 24 UQ representations, enums และ refs เดิมตรงกัน; ถอด placeholders 14 รายการตามขอบเขต
- ตรวจ SQL แบบไม่รันฐานจริง: standalone indexes 13 → 0; PK32/UQ24/FK40/CHECK80 คงเดิม. เทียบ tokens หลังละ comments/whitespace/index statements พบ SQL ส่วนอื่นเหมือน baseline ทุกตัว. Rollback เดิมเหมือน baseline และไม่มี DROP INDEX ที่ต้องถอน
- ตรวจ dictionary links ทั้ง 32 จุดชี้บรรทัด CREATE TABLE ของตารางตัวเองครบ. เปลี่ยนเลขบรรทัดอ้างอิงในเอกสาร active เป็นชื่อตารางเพื่อลดการคลาดเคลื่อนเมื่อ SQL เลื่อน; ปรับ revision references ที่เป็นสถานะปัจจุบันโดยคง Change Log/review เดิม
- `git -C knowledge diff --check` ผ่าน. ไม่รัน build/test แอปหรือ SQL เพราะแก้ร่าง schema/เอกสารและไม่มี source delta. รายงานตรวจดิบอยู่ `reports/school-bot/schema-check-084/validation.json`; dependency parser อยู่ใน reports ไม่ได้เพิ่มในแอป
- Sweep หลังแก้ด้วยชุดเดิมร่วม `13 unique indexes`/`unique index13`: 12 ไฟล์/63 บรรทัด. คงเฉพาะ UQ representation ใน DBML, ข้อความอธิบายขอบเขตใน SQL/ใบงาน, ประวัติ review/backlog/TP amendment/Change Log/ข้อเสนอเดิม และโมดูลอื่น. ไม่เหลือ ux_schoolbot_ ใน DBML หรือสัญญาปัจจุบัน
- Sweep revision เพิ่มก่อนแก้พบ 8 ไฟล์/13 บรรทัด: แก้ module/design index และ UX references ปัจจุบัน; คง review/ใบงาน/Change Log/ผล security inspection และ TP amendment เดิมตามวันที่ ไม่มีการอ้างว่าเคยตรวจฉบับใหม่แล้ว

การบังคับกฎเดิมที่ถอน partial unique indexes ต้องทำแบบ atomic ใน application/repository; งานนี้ไม่ได้ implement หรือพิสูจน์ runtime ของการป้องกันดังกล่าว. ไม่เปลี่ยน task verdict/release gates. ผู้ใช้ถามความหมาย PK/UQ/FK/CHECK ระหว่างงาน จึงอธิบายว่าคง constraints เหล่านี้และ backing indexes ของ PK/UQ; ยังไม่มีคำสั่งให้ถอน constraints

## Change Log

- 2026-10-26 — รับคำสั่งและคำยืนยันขอบเขตจากผู้ใช้; ถอน index ในร่าง SQL/DBML และตรวจเอกสารที่เกี่ยวข้อง
