# มติชนิดคอลัมน์ CreateBy/UpdateBy

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้

- "CreateBy UpdateBy เป็น int นะ เพราะจะ ใส่ semp , sid ที่เป็น int"
- แถวที่ระบบสร้างเองโดยไม่มีคนกด: "ให้เป็น NULL"
- แยก sEmp กับ sId: "ไม่ต้องแยก ดูจากตาราง"

## ข้อกำหนดที่ยืนยัน

- `CreateBy` และ `UpdateBy` ของทุกตาราง SchoolBot เป็น `integer NULL` (เดิม actor string `varchar(512) NOT NULL`)
- ค่า = sEmp ของพนักงาน/ครู หรือ sId ของนักเรียนที่ทำรายการ; `NULL` = ระบบทำเอง (เช่น ตัวตรวจอัตโนมัติ, worker, งานลบตามกำหนด)
- ไม่เพิ่มคอลัมน์บอกชนิดผู้ทำ — ตีความจากตาราง; รายละเอียดชนิดผู้ทำเต็มอยู่ใน `SchoolBotAuditEvent.Actor` (string เดิม)
- คอลัมน์ actor อื่น (`Actor`, `Principal`, `ConfirmedBy`, `DecisionBy`) คงเป็น string ตาม baseline

## ข้อสังเกต (สมมติฐาน — ยังไม่ยืนยัน)

- admin โรงเรียน (IsAdmin) ที่ DES-012 ระบุ id เป็น `T64` ต้องมีค่า int ที่ใช้ใส่ CreateBy ได้ — ถ้าไม่มี จะเป็น NULL และพึ่ง AuditEvent
- พนักงาน SchoolBright ส่วนกลาง (staff_admin) ใช้ sEmp ของตัวเอง

## Change Log

- 2026-10-22 — MYCELIUM บันทึก; ปรับ db/schoolbot_db.sql (33 ตาราง), schoolbot.dbml Rev2.1, data-model Rev4.1
