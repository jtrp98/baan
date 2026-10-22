# SchoolBot — แนวทางตัวติดตั้งบน Windows 10 Home/Pro

## สถานะ

- วันที่: 2026-10-21
- คำถามตรวจ OS ชุด 4 ผู้ใช้เลือกให้รองรับ Windows 10 x64 ดู [decisions-017](../requirement/decisions-017.md)
- SA ตรวจ source/pinned cache/official docs และส่ง [Windows 10 review](../design/windows10-compatibility-001.md) กับ [OS proposal Rev2](../design/os-compatibility-001.md) แล้ว
- ผู้ใช้เลือกทดสอบแพ็กเกจเดิมก่อนตาม [decisions-018](../requirement/decisions-018.md) แล้วปรับ Windows target เป็น Windows11 ตาม [decisions-019](../requirement/decisions-019.md) คำถาม Home/Pro จึงยุติในสาขานี้
- G-DELIVERY/OQ-011; SA ระบุ NEEDS_HUMAN สำหรับทางเลือก Home/Pro ไม่ใช่การตัด Windows 10 ออกจาก scope

## คำถามที่ส่ง

จากร่าง Windows 10 ที่ปรับแล้ว: Home/Pro 22H2 อยู่นอก .NET 10 support matrix ของตัว Setup แต่ยังไม่ได้พิสูจน์ว่า Setup รันไม่ได้ ต้องการให้ทีมดำเนินการทางใดต่อ? ทุกทางยังต้องทดสอบจริง และไม่ถือเป็นการยอมรับความเสี่ยงล่วงหน้า

1. ทดสอบแพ็กเกจเดิมและสำรวจเครื่องก่อน แล้วเสนอผลกับข้อจำกัดให้ตัดสินอีกครั้ง (แนะนำ)
2. คง Home/Pro เป็นเป้าหมาย และประเมินตัว Setup ที่ไม่พึ่ง .NET 10 โดยรักษา UX/signing/updater เดิม
3. ประเมินใช้ Enterprise LTSC 2019/2021 พร้อมผลต่อเครื่องและค่า license ก่อนจำกัด edition

## การใช้คำตอบ

ตัวเลือกเป็นแนวทางเตรียมข้อเสนอและหลักฐาน ไม่ใช่ยืนยัน minimum build หรือ risk acceptance ไม่จำกัด edition หรือลด UX โดยไม่มีคำตอบจริง การทดสอบต้องใช้ environment Windows 10 ที่ระบุได้ เครื่องปัจจุบันเป็น Windows 11 ไม่ใช้แทนผล Win10 และไม่ติดตั้งทับแอปที่ผู้ใช้กำลังใช้อยู่

## Change Log

- 2026-10-21 — บันทึกคำตอบข้อ 1 และมติถัดมายกเลิก Windows10 target ไม่รอคำตอบ Setup Home/Pro เพิ่ม
- 2026-10-21 — MYCELIUM ส่งคำถามตามผล SA โดยปรับคำให้เข้าใจง่าย รอคำตอบก่อนดำเนินงานที่พึ่งทางเลือก
