# มติผู้ใช้ — PK int4 และไฟล์ DBML

## ที่มา — 2026-10-21

ผู้ใช้กำหนด: "PK เป้น int4 นะ ทำ DBML ไว้เปิดใน https://dbdiagram.io/ ด้วยสิ" และอนุญาตให้แก้ `C:/src/AICode/project-ai` พร้อมปรับ timeout ให้พองาน

- PK ของตาราง SchoolBot ใหม่เป็น PostgreSQL `int4` (integer 32 บิต); FK ที่อ้าง PK ต้องใช้ชนิดเดียวกัน
- จัดทำ DBML ของ SchoolBot เพื่อเปิดใน dbdiagram.io พร้อมชื่อ/ฟิลด์มาตรฐานและความสัมพันธ์
- User/DB เดิม, API ทั้งหมดใน SchoolBot/web และมติ License/โหมดเดิมยังคงตาม decisions-004..011
- ไม่ตีความว่าต้องเปลี่ยน UUID ทุกประเภท เช่น request correlation, idempotency key หรือ ID ภายในไฟล์โครงงานซึ่งไม่ใช่ PK ตาราง
- อนุญาตแก้ timeout ของตัวรัน นายช่าง และ config ที่ใช้จริง; ไม่ใช่คำสั่ง release, commit หรือรัน SQL

## Change Log

- 2026-10-21 — MYCELIUM บันทึกคำสั่งผู้ใช้และส่ง SA/DBA ทำแบบและ DBML ตาม PK int4

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
