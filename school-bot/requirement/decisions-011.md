# มติผู้ใช้ — ใช้ฐานข้อมูลเดิมทั้ง 4 ตัวร่วมกับ SchoolBot
> ถูกแทนด้วย มติ 027 (ที่ตั้งตาราง SchoolBot แยกจาก School DB) และ มติ 021 (สิทธิ์เขียนช่องคะแนนย่อยที่จับคู่ไว้); การใช้ฐานข้อมูลเดิมสี่ตัวยังคงอยู่ — [มติ 027](decisions-027.md), [มติ 021](decisions-021.md)

## ที่มา — 2026-10-21

ผู้ใช้: "ระบบ login อะ ก็ทำที่เดิม แต่แค่ db เราจะใช้ 4 คัวนี้ด้วย"

ยืนยันให้ใช้ DB เดิมร่วมกับ SchoolBot; ผู้ใช้ตอบตำแหน่ง API แล้วว่าอยู่ `school-bot-v2/web` ทั้งหมดและแอปเรียกใช้ ดู [decisions-010.md](decisions-010.md) ไม่เปิดคำถามนี้ซ้ำ

## หลักฐานจาก source

ราก: `C:/src/schoolbright/target/sb-tech-upgrade-academic`

Entities มี 4 หมวด: `JabjaiMasterSingleDB`, `JabjaiSchoolSingleDB`, `JabjaiSchoolLogs`, `PGGradeDB`

`src/ServiceAcademic.Infrastructure/Extensions/InfrastructureServiceExtensions.cs` ลงทะเบียน context ผ่าน `UseNpgsql` ที่บรรทัด 80, 109, 138 และ 167 ตามลำดับ School, Master, Logs และ Grade เป็นหลักฐานโค้ด config ไม่ใช่การยืนยันการเชื่อม DB จริง

ไฟล์เดียวกันมี context Grade History แยกด้วย แต่ไม่รวมเพิ่มเป็น DB ตัวที่ 5 ในมติผู้ใช้โดยพลการ

## ผลต่อแบบ

- ห้ามถือว่าต้องสร้างบัญชีหรือย้ายข้อมูลผู้ใช้ไป DB ใหม่เพราะ SchoolBot แยกแอป
- การวางตาราง SchoolBot ใหม่ใน DB/schema ใด และ cross-database constraints/transaction ต้องระบุเป็นข้อเสนอให้ทบทวน โดยคงชื่อและฟิลด์มาตรฐานตาม decisions-004.md
- ไม่แก้ generated entities, ไม่สร้าง migration และไม่รัน SQL ในงานวิเคราะห์นี้

## Change Log

- 2026-10-21 — MYCELIUM บันทึกคำชี้แจงเรื่อง 4 DB และหลักฐาน config โดยไม่อนุมาน login protocol หรือที่ตั้งตารางใหม่
- 2026-10-21 — เชื่อมคำตอบล่าสุดที่ยืนยัน API ของ SchoolBot อยู่ web และใช้ DB เดิมจาก backend
