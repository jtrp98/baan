# ใบงาน087 — ค่าเริ่มต้น NULL ของ audit fields

วันที่ 2026-10-26 · นายช่างแก้ตาม sweep เชิงกล · DONE (static)

ผู้ใช้ระบุ CreateBy/CreateDate/UpdateBy/UpdateDate และสั่ง “defult null”. ตั้งทั้ง4คอลัมน์ใน32ตารางเป็น nullable DEFAULT NULL: CreateBy/UpdateBy คง integer; CreateDate/UpdateDate คง timestamptz แต่ถอน NOT NULL. ไม่ตั้ง timestamp default หรือเปลี่ยน logic ฝั่ง application

ก่อนแก้ `baan --sweep` ด้วยนิยาม SQL ของทั้ง4คอลัมน์และ DBML CreateDate/UpdateDate แบบ not null พบ3ไฟล์/218บรรทัด: SQL, full DBML และ amendment-proposal-001 (ประวัติ). แก้ SQL128นิยาม/DBML128ฟิลด์ พร้อม dictionary128แถว, common-column contract, คู่มือและสถานะอ้างอิงปัจจุบัน. ข้อเสนอ/มติ/ผลตรวจเดิมคงเป็นประวัติตามวันที่; ไม่เปิด role เพิ่มเพราะเป็นการแทนค่าและแก้ references ตรงตามคำสั่งผู้ใช้

ตรวจด้วย Node assertions + @dbml/core10.3.1 (postgres/dbmlv2) แบบ offline เทียบ baseline54c6767: SQL/DBML parse ผ่าน32ตาราง450ฟิลด์PK32; audit fields ทั้ง128จุดต่อแบบเป็น nullable/default NULL; metadata อื่นเหมือน baseline. Rollback และภาพ integration ไม่เปลี่ยน. Dictionary128แถวระบุรับ NULL/default NULL และ SQL line links32จุดถูกต้อง. `git -C knowledge diff --check` ผ่าน; รายงานดิบอยู่ reports/school-bot/validation-087.json

Sweep หลังแก้ด้วยรูปนิยามเก่าที่มี comma และ DBML not null เหลือเฉพาะ amendment-proposal-001.md 26บรรทัด ซึ่งเป็นข้อเสนอเดิมตามวันที่ ไม่มีนิยามเก่าค้างใน SQL/DBML ปัจจุบัน

ร่าง SQL ยังไม่รันบน DB จริง. การกำหนดค่าเวลา/ผู้ทำจาก server ใน workflow เดิมเป็นหน้าที่ application ไม่ใช่ default ของฐานข้อมูล. ไม่เปลี่ยน source/แผน/task verdict หรืออ้างผล runtime

## Change Log

- 2026-10-26 — ตั้ง audit fields ทั้ง4เป็น nullable DEFAULT NULL ตามคำสั่งผู้ใช้ และตรวจ metadata/เอกสารที่เกี่ยวข้อง
