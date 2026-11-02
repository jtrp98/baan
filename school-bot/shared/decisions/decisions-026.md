---
owner: spec
---
# มติอนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่
> ถูกแทนด้วย มติ 044 (เฉพาะข้อบังคับฐานข้อมูล คง PRIMARY KEY และถอน UNIQUE/FOREIGN KEY/CHECK) — [มติ 044](decisions-044.md)

## คำตอบผู้ใช้ — 2026-10-22

ผู้ตอบ: ผู้ใช้ในแชตนี้ หลังอ่านสรุปตาราง 33 ตารางและ breaking change 6 จุด

"อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่ โดยแก้ 2 จุดให้ตรง decisions-025 (หน้าเว็บตรวจ License ของโรงเรียน, Desktop ให้ทั้งนักเรียนและครู) แล้วให้ SA sync เข้า data-model/DBML และ DBA ปรับ SQL"

## ข้อกำหนดที่ยืนยัน

- amendment-proposal-001 (memory) + amendment-proposal-002 (memory) เป็น logical baseline ใหม่ แทน data-model Rev3 / schoolbot.dbml Rev1 ที่ยืนยันใน decisions-013 (ปิดประตู H4 ฝั่งการอนุมัติแบบ)
- รับ breaking change ทั้ง 6 จุด: ถอน `Curriculum.Mode`; เนื้อหากลาง `SchoolId=null`; รูปแบบ ScoringPolicy ใหม่; Session มี Channel และ DeviceJkt/AccountId บังคับเฉพาะ desktop; `/v1/admin` → `/v2/admin`; SchoolBot เขียนเฉพาะช่องเกรดที่เป็นเจ้าของหลังผ่าน gate DES-009
- แก้ 2 จุดของ amendment-002 ให้ตรง decisions-025:
  1. session channel `school_web` ต้องตรวจว่าโรงเรียนมี SchoolBot License ที่ active (ไม่ใช่เฉพาะ login desktop) — ไม่ต้องมี device binding
  2. Desktop bind ได้ทั้งนักเรียนและครู (P=student หรือ employee) ใช้เรียน/ลองเท่านั้น — ถอนข้อเสนอ "Desktop bind เฉพาะ P=student"
- baseline เดิมเก็บ verbatim ที่ `design/archive/2026-10-22-before-rev4/`

## ไม่ได้อนุมัติในมตินี้

- การรัน SQL ใดๆ (001–007) — ยังต้องให้คนรันบนฐานทดสอบและส่ง DBA-003 ตรวจ
- ไฟล์ 007 GRANT PGGradeDB — ยังรอ gate ทั้งห้าของ DES-009
- การสร้าง `SchoolBotTeacherGrant` (ทางสำรองตาม DES-004) — ยังไม่ได้ตัดสิน
- endpoint `web-principal` ใน gateway และ env/network (H5)

## ส่งต่อ

- SA: sync เข้า data-model Rev4, data-contract-rules Rev4, DES-004 Rev4, DES-005 Rev4, schoolbot.dbml Rev2, schema-notes พร้อมแก้ 2 จุด
- DBA: ปรับ SQL db/001–007 ตาม 2 จุด และ baseline ที่อนุมัติ

## Change Log

- 2026-10-22 — MYCELIUM บันทึกการอนุมัติของผู้ใช้; archive baseline เดิมก่อน sync
