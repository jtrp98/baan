# school-bot — UX/UI Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · เจ้าของหมวด: int (ร่าง) — การเซ็นเป็นพระราชกิจของมนุษย์เสมอ · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · front implement ได้เฉพาะจากส่วนที่ "เซ็นแล้ว"

## ไฟล์ปัจจุบัน

| ไฟล์ | ขอบเขต | สถานะ |
|---|---|---|
| [int-001-entry.md](int-001-entry.md) | UX-001 Entry/License/Guest-Login/Shell/Close — ครบทุก state + error→copy mapping + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-036/037/038) — signed int artifact |
| [int-002-labs.md](int-002-labs.md) | UX-003 Labs สามโหมด Arm/Block/Code — ค้นหา/เชื่อมต่อ/โปรไฟล์/ส่งท่า/เล่น/อัปโหลด/หยุด/ขาดการเชื่อมต่อ/Code+Block ทุก state + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-037/038) — signed int artifact |

| [int-003-projects.md](int-003-projects.md) | UX-002 โครงงาน/พื้นที่ร่วม Guest/ถังขยะ 30 วัน/export/import หลัง Login/ประวัติเรียน Guest — ครบทุก state | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-039) — signed int artifact; G-UX-PROJECT มีหลักฐาน sign-off |
| [int-004-learning.md](int-004-learning.md) | UX-004 บทเรียน/ภารกิจสามโหมด/ผลประเมิน/ดาว/ความคืบหน้า/Quiz-Test/เลื่อน Level — ครบทุก state | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-039/040) — G-UX-LEARN มีหลักฐาน sign-off |

| [int-005-mapping.md](int-005-mapping.md) | UX-006 GradeSlot mapping/Preview ยืนยัน/คะแนนชน/Export status (เว็บ admin โรงเรียน + ครู — web-system) | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-041) — signed int artifact |

## จุดที่รอมนุษย์เซ็น

**ผ่านแล้ว:** UX-001 (int-001) และ UX-003 (int-002) อนุมัติครบทุกส่วน (ผู้ใช้ 2026-10-24 · decisions-036/037/038)

**ผ่านแล้ว:** UX-001 (int-001) · UX-003 (int-002) · UX-002 (int-003) ครบทุกส่วน (decisions-039) · **UX-004 (int-004) ครบทุกส่วน (Q22–Q29 · decisions-039/040)**

**UX-006 (int-005) อนุมัติครบทุกส่วนแล้ว (decisions-041)** — UX ที่ผ่านการเซ็นรวม 5/7 ไฟล์; เหลือรอเซ็น: UX-005, UX-007 (กำลังร่าง)

หมายเหตุข้อจำกัด: ร่างทั้งสองอ้างหลักฐาน path:line จาก requirement/DES เป็นหลัก (frontend จริงอยู่ `target/school-bot/app/frontend/src` — ยังไม่ได้อ่านโค้ดรายบรรทัด) · Login flow เขียนตาม target contract มติ035 (fullLogin ยัง NOT_READY) · ยังไม่มี design system กลาง — กติกากลางเฉพาะจุดอยู่ใน int-002 §1

## Change Log

- 2026-10-24 — decisions-041: UX-006 (int-005) อนุมัติครบทุกส่วน (Q30–Q38)
- 2026-10-24 — decisions-040: UX-004 อนุมัติครบ (Q26–Q29) — G-UX-LEARN ครบหลักฐาน
- 2026-10-24 — ใบงาน061: เพิ่ม int-003 (UX-002 อนุมัติครบ Q14–Q21) / int-004 (UX-004 อนุมัติ Q22–Q25 เหลือ Q26–Q29) / int-005 (UX-006 ร่าง รอเซ็น Q30–Q38) — decisions-039
- 2026-10-24 — ใบงาน060d: สร้างหมวด uxui พร้อมร่างแรก int-001/int-002 (UX-001/UX-003 ตามคิว queue-003 §3.4) — รันโดย นายช่าง solo (subagent role int); ทุกส่วนรอเซ็น ไม่มีการอนุมัติใดเกิดขึ้น
