# school-bot — UX/UI Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · เจ้าของหมวด: int (ร่าง) — การเซ็นเป็นพระราชกิจของมนุษย์เสมอ · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · front implement ได้เฉพาะจากส่วนที่ "เซ็นแล้ว"

## ไฟล์ปัจจุบัน

| ไฟล์ | ขอบเขต | สถานะ |
|---|---|---|
| [int-001-entry.md](int-001-entry.md) | UX-001 Entry/License/Guest-Login/Shell/Close — ครบทุก state + error→copy mapping + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-036/037/038) — signed int artifact |
| [int-002-labs.md](int-002-labs.md) | UX-003 Labs สามโหมด Arm/Block/Code — ค้นหา/เชื่อมต่อ/โปรไฟล์/ส่งท่า/เล่น/อัปโหลด/หยุด/ขาดการเชื่อมต่อ/Code+Block ทุก state + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-037/038) — signed int artifact |

## จุดที่รอมนุษย์เซ็น

**ไม่มีค้างสำหรับ UX-001/UX-003** — อนุมัติครบทุกส่วนแล้ว (Q1–Q13 ตอบครบผ่านแบบฟอร์มคำถาม 2026-10-24) · gate G-UX-ENTRY (UX-001) และ G-UX-LABS (UX-003) มีหลักฐาน sign-off ครบ · front เริ่ม implement จากสองไฟล์นี้ได้ · UX-002/004..007 ยังไม่ได้ร่าง (รอ BA-001 output/SA-002/SA-004 ตาม dependency เดิม) — เมื่อร่างจะขอเซ็นแยกตามแต่ละไฟล์

หมายเหตุข้อจำกัด: ร่างทั้งสองอ้างหลักฐาน path:line จาก requirement/DES เป็นหลัก (frontend จริงอยู่ `target/school-bot/app/frontend/src` — ยังไม่ได้อ่านโค้ดรายบรรทัด) · Login flow เขียนตาม target contract มติ035 (fullLogin ยัง NOT_READY) · ยังไม่มี design system กลาง — กติกากลางเฉพาะจุดอยู่ใน int-002 §1

## Change Log

- 2026-10-24 — ใบงาน060d: สร้างหมวด uxui พร้อมร่างแรก int-001/int-002 (UX-001/UX-003 ตามคิว queue-003 §3.4) — รันโดย นายช่าง solo (subagent role int); ทุกส่วนรอเซ็น ไม่มีการอนุมัติใดเกิดขึ้น
