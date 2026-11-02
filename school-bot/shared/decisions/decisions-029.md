---
owner: spec
---
# มติไม่แตะ School DB / PGGradeDB ด้วย GRANT

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้ ชี้ไฟล์ `db/schoolbot_pggradedb_grants.sql` และ `db/schoolbot_schooldb_grants.sql`

"ไม่ทำได้ไหมไม่อยากยุ่งกับ db นี้"

## ข้อกำหนดที่ยืนยัน

- ไม่รัน GRANT/REVOKE หรือสร้าง role ใดๆ ใน School DB และ PGGradeDB — ถอนไฟล์ grants ทั้งสองคู่ออกจากชุด SQL (เก็บที่ `db/archive/grants-not-used/`)
- SQL ที่ต้องรันมีเฉพาะ SchoolBot DB (10.0.0.128:9499) ตาม decisions-027
- SchoolBot backend ต่อ School DB / PGGradeDB ด้วยบัญชี DB เดิมที่ระบบ SchoolBright ใช้อยู่แล้ว สอดคล้องกับ decisions-010/011 ("db เราจะใช้ 4 ตัวนี้ด้วย") — credential อยู่ใน config ของ backend ไม่บันทึกใน knowledge

## ผลกระทบที่ยอมรับ (สมมติฐาน — ยังไม่ยืนยัน)

- บัญชี DB เดิมน่าจะมีสิทธิ์กว้างกว่าที่ SchoolBot ต้องใช้ (เช่น เขียนได้ทุกตารางเกรด) → ไม่มี least privilege ระดับ DB; การจำกัดให้เขียนเฉพาะช่องที่ SchoolBot เป็นเจ้าของต้องบังคับในโค้ด (DES-009 adapter) และตรวจใน code review/test
- gate G-DB ของ DES-009 เหลือเรื่อง "ใช้บัญชี DB เดิมตัวไหน + เจ้าของระบบเกรดยอมให้ใช้" แทนการอนุมัติ GRANT; gate G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ คงเดิม
- receipt ใน `PgtgradeAuditLog` ยังเขียนได้ถ้าบัญชีเดิมมีสิทธิ์ INSERT — ต้องตรวจตอนทดสอบ

## ส่งต่อ

- SA amend DES-009 (G-DB) และ data-model/schema-notes ที่อ้าง role `schoolbot_app` บน School DB/PGGradeDB
- DBA: SchoolBot DB ยังสร้าง role ของตัวเองได้ตามเดิม (เป็น DB ของ SchoolBot)

## Change Log

- 2026-10-22 — MYCELIUM บันทึกคำสั่งผู้ใช้; archive ไฟล์ grants ทั้งสองคู่
