# SchoolBot — แพ็กเกจเดิมและมติ Windows 11

- วันที่: 2026-10-21
- ผู้ใช้เลือกทดสอบแพ็กเกจเดิมก่อนตาม decisions-018 แล้วปรับขอบเขตฝั่ง Windows เป็น Windows11 ตามข้อเสนอแรกใน decisions-019
- ทำ package inventory/hash/version/signature และ MSI structural checks สำเร็จ ดู [ผลจริง](planning/installer-preflight-001.md)
- พบเครื่องปัจจุบันเป็น Win11 และไม่พบ Win10 environment จากชุด inventory ที่ตรวจ จึงส่งคำถาม human-questions-006; ผู้ใช้ตอบให้ปรับ Windows target แทนการเตรียม Win10
- งานสาขา Win10 ยุติตามคำสั่งผู้ใช้ ไม่มีการติดตั้ง เปิดแอป รัน hardware หรือเปลี่ยน binary ไม่มี QA verdict ใหม่
- เป้าหมายปัจจุบัน: Windows11 25H2 x64; macOS15+ Intel/AppleSilicon คงเดิม รายละเอียดจาก [มติล่าสุด](requirement/decisions-019.md)
- ข้อกำหนดใหม่มีผลเหนือร่าง Windows10 เก่า ซึ่งเก็บเป็นประวัติ BA/SA/PM ต้องอ้างมติล่าสุดเมื่อทำงานตามแผน ไม่เปลี่ยน verified/blocked โดยไม่มี QA verdict

## Change Log

- 2026-10-21 — MYCELIUM บันทึกการตรวจแพ็กเกจที่ทำจริงและข้อยุติ Windows11 ของผู้ใช้
