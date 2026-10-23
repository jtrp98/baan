# SchoolBot — ข้อมูลเครื่องปัจจุบันประกอบการสำรวจ

## วิธีและผลที่อ่านได้ — 2026-10-21

นายช่าง อ่าน Win32_OperatingSystem และ Win32_SerialPort ผ่าน Get-CimInstance เท่านั้น หลัง sandbox ปฏิเสธ CIM จึงใช้การเรียกแบบ require_escalated ที่ auto-review อนุมัติ สำเร็จ exit 0 ไม่มีการเปิดพอร์ต ส่ง probe หรือเปลี่ยนสถานะอุปกรณ์

| รายการ | ค่าที่ได้ |
|---|---|
| OS caption | Microsoft Windows 11 Home Single Language |
| OS version | 10.0.26300 |
| OS architecture | 64-bit |
| COM3 | Standard Serial over Bluetooth link (COM3), Status OK |
| COM4 | Standard Serial over Bluetooth link (COM4), Status OK |

## ขอบเขตหลักฐาน

นี่คือเครื่องที่รันงานปัจจุบัน ไม่ใช่การยืนยันรายการเครื่องของโรงเรียน ไม่พิสูจน์ CPU architecture ของทุกเครื่องเป้าหมายหรือความเข้ากันได้ของแอป ไม่ได้สำรวจ HID ทั้งระบบและไม่ได้ตรวจหุ่น/รุ่นบอร์ด/firmware จริง รายการ Serial ที่เห็นไม่ใช่หลักฐานว่ามีหรือไม่มีหุ่นเชื่อมต่อทางอื่น

ยังต้องมีเครื่องเป้าหมายจริงตามข้อเสนอ SA และการยืนยันของผู้ใช้ก่อนลง OS/platform acceptance ไม่มี runtime/hardware/install test หรือการอนุมัติ min OS จากผลนี้

## Change Log

- 2026-10-21 — MYCELIUM เก็บผลอ่าน inventory ของเครื่องปัจจุบันตามการมอบหมายสำรวจ OS/อุปกรณ์ แยกจาก source review ของ SA

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
