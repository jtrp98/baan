# school-bot — UX/UI Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · เจ้าของหมวด: int (ร่าง) — การเซ็นเป็นพระราชกิจของมนุษย์เสมอ · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · front implement ได้เฉพาะจากส่วนที่ "เซ็นแล้ว"

## ไฟล์ปัจจุบัน

| ไฟล์ | ขอบเขต | สถานะ |
|---|---|---|
| [int-001-entry.md](int-001-entry.md) | UX-001 Entry/License/Guest-Login/Shell/Close — ครบทุก state + error→copy mapping + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-036/037/038) — signed int artifact |
| [int-002-labs.md](int-002-labs.md) | UX-003 Labs สามโหมด Arm/Block/Code — ค้นหา/เชื่อมต่อ/โปรไฟล์/ส่งท่า/เล่น/อัปโหลด/หยุด/ขาดการเชื่อมต่อ/Code+Block ทุก state + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-037/038) — signed int artifact |

| [int-003-projects.md](int-003-projects.md) | UX-002 โครงงาน/พื้นที่ร่วม Guest/ถังขยะ 30 วัน/export/import หลัง Login/ประวัติเรียน Guest — ครบทุก state | ร่าง — รอเซ็น (Q14–Q21 · 2026-10-24) |
| [int-004-learning.md](int-004-learning.md) | UX-004 บทเรียน/ภารกิจสามโหมด/ผลประเมิน/ดาว/ความคืบหน้า/Quiz-Test/เลื่อน Level — ครบทุก state | ร่าง — รอเซ็น (Q22–Q29 · 2026-10-24) |

## จุดที่รอมนุษย์เซ็น

**ผ่านแล้ว:** UX-001 (int-001) และ UX-003 (int-002) อนุมัติครบทุกส่วน (ผู้ใช้ 2026-10-24 · decisions-036/037/038)

**ค้าง — int-003 (UX-002):** Q14 หน้าเดียว+แท็บสามโหมด/ทางเข้า · Q15 banner พื้นที่ผู้เยี่ยมชมคงที่ · Q16 close guard สลับงาน + VERSION_CONFLICT สองทางเลือก · Q17 ถังขยะ (คำยืนยัน/วันหมดอายุ/ไม่มีปุ่มลบถาวร) · Q18 export (cancel เงียบ/PROJECT_EXISTS dialog) · Q19 import explicit (รายงานรายชิ้น/ลองใหม่คำขอเดิม) · Q20 ผลในเครื่องแยกผลตรวจใหม่/ครู disabled · Q21 a11y

**ค้าง — int-004 (UX-004):** Q22 ปุ่ม "บทเรียน" แยก Labs + แท็บโหมด · Q23 empty state จริง/ป้ายเนื้อหาตัวอย่าง Arm · Q24 ดาวเฉพาะมีผลจริง+กำกับไม่ใช่เกณฑ์เลื่อนระดับ · Q25 chip สถานะผลงาน/ครู disabled · Q26 Quiz/Test ตาม policy มติ · Q27 นักเรียนเห็นเฉพาะผลตน (ไม่มีค่าเฉลี่ยห้อง) · Q28 Desktop แสดงแค่สถานะเลื่อน Level · Q29 a11y

หมายเหตุข้อจำกัด: ร่างทั้งสองอ้างหลักฐาน path:line จาก requirement/DES เป็นหลัก (frontend จริงอยู่ `target/school-bot/app/frontend/src` — ยังไม่ได้อ่านโค้ดรายบรรทัด) · Login flow เขียนตาม target contract มติ035 (fullLogin ยัง NOT_READY) · ยังไม่มี design system กลาง — กติกากลางเฉพาะจุดอยู่ใน int-002 §1

## Change Log

- 2026-10-24 — ใบงาน060d: สร้างหมวด uxui พร้อมร่างแรก int-001/int-002 (UX-001/UX-003 ตามคิว queue-003 §3.4) — รันโดย นายช่าง solo (subagent role int); ทุกส่วนรอเซ็น ไม่มีการอนุมัติใดเกิดขึ้น
