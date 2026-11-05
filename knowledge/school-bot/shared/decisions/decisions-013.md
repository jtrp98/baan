---
owner: spec
---
# การยืนยัน DBML และขั้นถัดไป
> ถูกแทนด้วย มติ 026 (อนุมัติแบบข้อมูลที่ปรับใหม่) — [มติ 026](decisions-026.md)

## คำตอบผู้ใช้ — 2026-10-21

ผู้ใช้: "ยืนยัน ต่อไปทำอะไร"

บริบทที่ผู้ใช้ยืนยันคือผลส่งมอบล่าสุด: DBML ของ SchoolBot 16 ตารางพร้อม PK/FK int4 และผลแก้ timeout นายช่าง

รับ DBML/latest logical model เป็นฐานสำหรับการวางแผนพัฒนาถัดไป ไม่ถามยืนยัน PK หรือขออนุมัติสร้าง diagram เดิมซ้ำ รายละเอียดที่ diagram ระบุ conditional/pending ไม่กลายเป็นคำตอบธุรกิจใหม่โดยอัตโนมัติ

## ขั้นถัดไปตาม charter

เป้าหมายเป็นระบบเต็มหลาย feature จึงให้ Planner แตกงานและ dependencies จาก 31 REQ / 109 AC แล้ว PM รับเป็นเจ้าของ plan/backlog ก่อนเปิด implementation หลายส่วน

ในแผนต้องมีงาน DBA ตรวจ physical constraints/เขียน SQL พร้อม rollback, ตรวจ credential compatibility จาก source เดิม, UX flows และ test plan; งานที่ไม่พึ่งกันเดินขนานได้ งานฐานสำหรับเริ่มเขียนโค้ดคือ backend/DB integration, License และ Login ใน SchoolBot/web แล้วเชื่อม Desktop ตาม dependencies

การรัน SQL จริง, UX sign-off และ release ยังเป็นขั้นตอนเฉพาะของงานนั้น ไม่บันทึกว่าทำแล้วจากคำยืนยัน DBML นี้

## Change Log

- 2026-10-21 — MYCELIUM บันทึกคำยืนยันผู้ใช้และลำดับส่งมอบจากงานออกแบบไปสู่แผนพัฒนาระบบเต็ม; ยังไม่สร้าง plan แทน PM

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
