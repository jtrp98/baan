# หลักฐานและแผนสำรวจอุปกรณ์ — หลักฐาน source และข้อจำกัดเดิม

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [หลักฐานและแผนสำรวจอุปกรณ์](hardware-survey-001.md) อธิบายหลักฐาน source และข้อจำกัดเดิม.

## เอกสารอ้างอิง

[DES-006 (หุ่นจริง Windows/macOS)](des-006.md) · [REQ-015 (โปรไฟล์หุ่นหกข้อต่อ)](../../modules/arm-lab/shared/requirements/req-015.md) · [BA-003 (งานสำรวจอุปกรณ์และเกณฑ์ความปลอดภัย)](hardware-survey-001.md) · [OQ-008 (ขอบเขตหุ่นและการยอมรับความปลอดภัย)](../../shared/open-questions/oq-008.md) · [SA-003 (งานทบทวน native hardware และ OS)](os-compatibility-001.md) · [DES-001 (Desktop host และ IPC)](des-001.md)

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

พาธ source อ้าง C:/src/schoolbright/target/school-bot-v2; ชื่อ .cpp ที่ย่ออยู่ engines/zide/src/ อ่านเฉพาะ allowlist ไม่มี physical access ที่ยืนยัน ไม่เปิด/probe/สั่งอุปกรณ์ ไม่ build/tests/UI หรือรับรองความปลอดภัย

| เรื่อง | หลักฐานและความหมาย |
|---|---|
| Engine identity | engines/zide/engine.json:3–12 ระบุ zide 0.1.0, protocol 1.0, stdio-json-lines, default dry-run, hardware_platforms=[windows]; entrypoint Darwin/Linux ไม่ใช่ native hardware support |
| HID identity | engines/zide/src/discovery.cpp:20–43 กรอง hardware ID 0483:5750; :47–85 ใช้ SetupAPI และตั้งชื่อ ZIDE USB HID เอง ไม่ได้อ่านรุ่นสินค้า; transport_hid.cpp:43–57 ตรวจ path อยู่ในรายการก่อนเปิด |
| Serial identity | engines/zide/src/discovery.cpp:87–108 อ่าน SERIALCOMM registry ทุก COM ที่รูปแบบถูก ไม่กรอง VID/PID/รุ่น; transport_serial.cpp:9–34 รับ COM1–COM9999 เปิด exclusive, 8N1 ปิด flow control/DTR/RTS ไม่มี CHECK_FW แบบ HID |
| Serial options | engines/zide/src/request.cpp:54–69 default 115200; baud allowlist 9600/19200/38400/57600/115200/128000/230400/256000/460800/512000/921600; read_ms 1–1500 default 1000 |
| HID wire | engines/zide/src/protocol.cpp:105–135: report 64 bytes, report ID=2, TRAN_DATA=2, payload ≤56 bytes; command ยาวตั้งแต่ 56 bytes ใช้ length ใน address big-endian ไม่ใช่ protocol USB servo ทั่วไป |
| Firmware guard | engines/zide/src/transport_hid.cpp:18–37 ส่ง CHECK_FW [2,1,4,55,55,55,55] (55 เป็น hex); AA ตอบกลับปฏิเสธ bootloader, คำตอบอื่นผิดรูปปฏิเสธ; silence ≤1500 ms จึงผ่าน ไม่ได้อ่าน firmware version หรือ authenticate firmware |
| ASCII commands | engines/zide/src/protocol.cpp:90–98 สร้าง #IDP…T…!; actions.cpp:63–111 สร้าง PRAD, PSCK/PULK (default ID 255 broadcast), $DST!, $DRS!, $DGT:start-end,times!; protocol.cpp:47–68 แยก live {HTTP API Gateway…} กับ download <HTTP API Gateway…> |
| Bounds | engines/zide/src/protocol.cpp:37–67,90–98: ID 0–254, PWM รวม bias 500–2500, time 0–9999, ≤32 servo/group; actions.cpp:79–101 download 1–8 groups/request, index 0–9999 ไม่ใช่หลักฐานความจุบอร์ดจริง |
| Reply/stop | engines/zide/src/request.cpp:83–116: board.info/servo.read/group.read ต้องมี bytes เท่านั้น ไม่มี parser ยืนยันรุ่น/firmware; written และ acknowledged=false ไม่ยืนยันการเคลื่อน/หยุด; actions.cpp:105–111 แยก stop_requested กับ board probe |
| Deadline/error | engines/zide/src/transport.cpp:7–12 กำหนด 4 s; transport_hid.cpp:65–81 และ transport_serial.cpp:48–68 pacing 200 ms/command, HID 1 ms/report ตรวจ partial write; request.cpp:107–116 คืน TRANSPORT_ERROR/DEVICE_TIMEOUT ไม่ retry movement |
| macOS | engines/zide/src/discovery.cpp:122–128 และ transport.cpp:11–13 ปฏิเสธ native; CMakeLists.txt:13–17 รวม HID backend เฉพาะ Windows |

- DES-006:22–33 เสนอ Darwin adapter/revalidate identity เป็นแบบอนาคต; Serial จริงตรวจเพียงรูปแบบ COM ก่อน open ไม่ได้ยืนยันว่าเป็นบอร์ดเดิม
- DES-006:37 กับ REQ-015:16 กำหนด profile หก servo; engine รับถึง 32/group และมี legacy servo+angle 1–4 (actions.cpp:41–60) จึงห้ามอนุมานจำนวนข้อต่อจริงจาก engine limits
- INTEGRATION.md:71–80 อธิบาย cancel/drain→stop และ host 5 s; งานนี้ยืนยัน C++ stop/CHECK_FW แต่ไม่ได้อ่าน manager/frontend lifecycle นอก allowlist จึงไม่รับรอง drain/callback ทั้งเส้นทาง

Task BA-003 / Reference OQ-008, G-HW / Reason: ขาด physical evidence ให้ทีมเติม matrix/เกณฑ์ stop/calibration/disconnect/ผู้รับรองเฉพาะด้าน/สิทธิ์ test cases แล้วส่งผู้ใช้ตรวจรับตามมติเดิม

Task SA-003 / Reference DES-001/DES-006, G-ROBOT-CONTRACT / Reason: ตรวจ drain/interleaving, reply identity, stale COM, Darwin framing/permissions และ partial-write buffering ต่อ งานนี้ไม่เปลี่ยน payload/schema ไม่มี SQL ส่ง DBA

เลือกสำรวจอุปกรณ์จริงเทียบ protocol เดิม; ปัดตกเดารุ่นจาก VID/PID, ข้าม CHECK_FW และใช้ dry-run/write success รับรอง stop เพราะไม่มีหลักฐาน ข้อจำกัดนี้ขวาง hardware approval ไม่ขวางการส่ง source survey
