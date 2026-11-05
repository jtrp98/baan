# DES-006 — กรณีทดสอบ fake ที่ต้องส่งต่อ

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — เตรียม scenarios ไม่ใช้หุ่นจริง)

ใช้ร่วมกับ [แบบ fake transport/simulator](des-006-review-simulator.md) และ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md)

## กรณีทดสอบที่ต้องส่งต่อ

ตารางนี้เป็น expected scenarios ไม่ใช่ผลรันทดสอบ และไม่สร้าง AC ใหม่

| กรณี | การควบคุม fixture | ผลที่ต้องตรวจ |
|---|---|---|
| Payload/validation | boundary min/max, ต่ำ/สูงกว่าหนึ่ง, float/string/null, unknown key, group ซ้ำ/ว่าง/เกิน 8 หรือ 32 | input ผิดไม่ dispatch; ขอบเขตที่มี default ใช้ default ถูก; C2 ปฏิเสธ field ข้าม action |
| JSONL/bounds/matching | 65536/65537 UTF-8 bytes ของ envelope, invalid UTF-8, หลาย response, protocol/ID ผิด, null/unknown response, stdout >1MiB, stderr >8192 | ไม่ใช้ผลผิดคำขอ; C1 คืน ENGINE_FAILED สำหรับ response เสีย; oversized request ไม่ start child; diagnostic จำกัด |
| Timeout/cancel | helper ไม่จบ, ถือ pipe หลัง child จบ, cancel ก่อน/หลัง fake write | ENGINE_TIMEOUT/CANCELLED แยกกัน; cancel รอ reap/drain; delivery หลัง write เป็น unknown ไม่ retry |
| AC-021-01/02 | ค้าง active แล้ว stop; ปล่อย callback/timer เก่าหลังหยุด; ยิง direct caller ในช่วง drain | drain_complete มาก่อน robot.stop; ไม่มี movement ใหม่; C3 กัน caller ทั้ง Host ไม่ใช่เฉพาะ adapter |
| AC-021-03/04 | stop failure และ exit ขณะ connected แต่ idle | แสดง error ไม่รับรอง physical stop; exit ยังขอ stop target เดิม; close guard await/reject ได้ |
| Stop ซ้ำ/close/relock | stop หลายผู้เรียกและ cancel ระหว่าง stop | join operation เดิม ไม่ cancel stop; relock เฉพาะ user intent หลัง stop success; ไม่ส่งหลัง stop failure |
| AC-014-01..03 | เริ่ม off, ไม่มี target/profile confirmation, probe ไม่ตอบ/ตอบ fixture | connected เฉพาะผ่านเงื่อนไข; trace มีเพียง discovery/probe ไม่มี movement; fixture ไม่ใช่ board proof |
| AC-022-01..03 | profile ปกติ/กลับทิศ, reply ID ถูก/ผิด, PWM นอกช่วง, หายข้อที่หก | แปลงผลถูก; commit/create ครบหก; ถ้าพลาดหนึ่งคงท่าเดิม ไม่ใช้ predicted เติม |
| AC-024-01..03 | virtual tick 3000, ลบ target จาก successful discovery, inject transport error/busy/cancelled, reconnect | lost เมื่อ target หาย/error; busy/cancelled เพียงอย่างเดียวไม่ lost; ไม่มี retry/replay; poll ไม่ซ้อน busy/stopping |
| AC-013-01..03 | browser ไม่มี bridge/preview flag, preview activate/update, LearnMap/Teacher/USB ตัวอย่าง | missing bridge เป็น error ไม่ fallback; counters ของ API/USB/copy/ผลเรียนจริงทั้งหมดเป็น 0 และแสดงป้ายจำลอง |
| Windows/Darwin | enumeration fixtures ของ COM/HID/callout token, token เปลี่ยน/หาย, short write/bootloader/permission error | mapping/error ถูก, ไม่เปิด arbitrary target, command bytes เดิม; เป็น logic evidence ไม่ใช่ hardware acceptance |

Host tests ต้องเก็บ event ของ executable selection/child start/stdout/stderr/reap ไว้ในผลทดสอบเอง ไม่ส่ง fake hooks เป็น public bridge ให้ frontend เลือก binary ปัดตก mock success ทุก action เพราะซ่อน matching/timeout/drain และปัดตกการเรียก device.list ของจริงเพื่อเตรียม fake

## หลักฐาน

เกณฑ์อ้าง Acceptance ของ SA-003 และ close_evidence ของ G-ROBOT-CONTRACT; test seams และ source ที่อ่านอ้างใน [แบบ simulator](des-006-review-simulator.md#หลักฐาน) งานนี้ไม่ได้รัน scenarios เหล่านี้
