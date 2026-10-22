# SchoolBot — ข้อเสนอแผนระบบเต็ม Rev1

ข้อเสนอให้ PM: 74 tasks / 17 gates ครอบคลุม 31 REQ / 109 AC ในงาน implementation ไม่ลดเป็น MVP และยังไม่เริ่มพัฒนา

P0 เตรียมฐาน/gates → P1 DB integration → P2 License → P3 Login/Projects → P4 Labs/native → P5 Learning → P6 ตรวจรับ/แพ็กเกจ → P7 ส่งมอบ

Critical path: physical core → DB → License/lease → Login/Cloud → project adapters/Arm → teacher/progress → signed packages → QA/Security/มนุษย์รับรอง → deploy/publish

Darwin, UX, TP, criteria และ release metadata ขนานได้ตาม dependencies; phase ไม่ใช่ barrier รวมทีม ตรวจหุ่นจาก source build ก่อน แล้วตรวจซ้ำผ่าน signed installer

First wave: SA-001, BE-001, DBA-001, BA-001..004, UX-001, UX-003, TP-001, SEC-001, SA-003 ทั้งหมดไม่มี dependency/gate

Effort รวม 136 person-days เป็นสมมติฐาน ไม่ใช่กำหนดส่ง แต่ละ task 1–2 วัน ไม่รวมรอคน/เครื่อง/credentials; BE/FE เสนอ t2/t3, SA t1 อื่น t2 หาก inventory หลักสูตรหรือ matrix เกิน 2 วัน PM แตกเพิ่มก่อนจ่ายงานโดยรักษา scope/IDs

ความเสี่ยงหลัก: legacy credentials, physical placement/constraints, Guest recovery/import, criteria/scope ครู, Darwin transport และเครื่องทดสอบ/signing ค้างตาม gates งานอิสระเดินต่อได้ SQL/rollback ต้อง review ก่อนมนุษย์รัน; DBML ไม่ใช่ผล SQL หรือ physical test

หลักฐาน: requirement/index.md:20–52; design/index.md:35–83; open-questions/index.md:9–14; requirement/decisions-013.md:9–17 ใช้ DES refs/สถานะจาก index ไม่ audit source เพิ่ม; tests ตัวรัน 85/85 ไม่ใช่ QA SchoolBot

ส่ง PM รับ/ปรับข้อเสนอและสร้าง plan/backlog ตามสิทธิ์ ยังไม่มี build/UI/hardware/SQL/release ในงานนี้

## Change Log

- 2026-10-21 — Rev1 เสนอ DAG ระบบเต็ม ตรวจ JSON, IDs, cycle และ mapping 31 REQ/109 AC ในหน่วยความจำ ไม่เขียนไฟล์
