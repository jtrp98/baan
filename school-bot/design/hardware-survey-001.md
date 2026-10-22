# หลักฐานและแผนสำรวจอุปกรณ์ — Rev1

วันที่ตรวจ source: 2026-10-21; สนับสนุน BA-003/SA-003 ตาม [decisions-016](../requirement/decisions-016.md) ไม่เปลี่ยน DES/REQ หรือปิด gate สถานะเอกสารดู [index](index.md)

## ขอบเขตหลักฐาน

พาธ source อ้าง C:/src/schoolbright/target/school-bot-v2; ชื่อ .cpp ที่ย่ออยู่ engines/zide/src/ อ่านเฉพาะ allowlist ไม่มี physical access ที่ยืนยัน ไม่เปิด/probe/สั่งอุปกรณ์ ไม่ build/tests/UI หรือรับรองความปลอดภัย

## ข้อเท็จจริงจากโค้ด

| เรื่อง | หลักฐานและความหมาย |
|---|---|
| Engine identity | engines/zide/engine.json:3–12 ระบุ zide 0.1.0, protocol 1.0, stdio-json-lines, default dry-run, hardware_platforms=[windows]; entrypoint Darwin/Linux ไม่ใช่ native hardware support |
| HID identity | engines/zide/src/discovery.cpp:20–43 กรอง hardware ID 0483:5750; :47–85 ใช้ SetupAPI และตั้งชื่อ ZIDE USB HID เอง ไม่ได้อ่านรุ่นสินค้า; transport_hid.cpp:43–57 ตรวจ path อยู่ในรายการก่อนเปิด |
| Serial identity | engines/zide/src/discovery.cpp:87–108 อ่าน SERIALCOMM registry ทุก COM ที่รูปแบบถูก ไม่กรอง VID/PID/รุ่น; transport_serial.cpp:9–34 รับ COM1–COM9999 เปิด exclusive, 8N1 ปิด flow control/DTR/RTS ไม่มี CHECK_FW แบบ HID |
| Serial options | engines/zide/src/request.cpp:54–69 default 115200; baud allowlist 9600/19200/38400/57600/115200/128000/230400/256000/460800/512000/921600; read_ms 1–1500 default 1000 |
| HID wire | engines/zide/src/protocol.cpp:105–135: report 64 bytes, report ID=2, TRAN_DATA=2, payload ≤56 bytes; command ยาวตั้งแต่ 56 bytes ใช้ length ใน address big-endian ไม่ใช่ protocol USB servo ทั่วไป |
| Firmware guard | engines/zide/src/transport_hid.cpp:18–37 ส่ง CHECK_FW [2,1,4,55,55,55,55] (55 เป็น hex); AA ตอบกลับปฏิเสธ bootloader, คำตอบอื่นผิดรูปปฏิเสธ; silence ≤1500 ms จึงผ่าน ไม่ได้อ่าน firmware version หรือ authenticate firmware |
| ASCII commands | engines/zide/src/protocol.cpp:90–98 สร้าง #IDP…T…!; actions.cpp:63–111 สร้าง PRAD, PSCK/PULK (default ID 255 broadcast), $DST!, $DRS!, $DGT:start-end,times!; protocol.cpp:47–68 แยก live {G…} กับ download <G…> |
| Bounds | engines/zide/src/protocol.cpp:37–67,90–98: ID 0–254, PWM รวม bias 500–2500, time 0–9999, ≤32 servo/group; actions.cpp:79–101 download 1–8 groups/request, index 0–9999 ไม่ใช่หลักฐานความจุบอร์ดจริง |
| Reply/stop | engines/zide/src/request.cpp:83–116: board.info/servo.read/group.read ต้องมี bytes เท่านั้น ไม่มี parser ยืนยันรุ่น/firmware; written และ acknowledged=false ไม่ยืนยันการเคลื่อน/หยุด; actions.cpp:105–111 แยก stop_requested กับ board probe |
| Deadline/error | engines/zide/src/transport.cpp:7–12 กำหนด 4 s; transport_hid.cpp:65–81 และ transport_serial.cpp:48–68 pacing 200 ms/command, HID 1 ms/report ตรวจ partial write; request.cpp:107–116 คืน TRANSPORT_ERROR/DEVICE_TIMEOUT ไม่ retry movement |
| macOS | engines/zide/src/discovery.cpp:122–128 และ transport.cpp:11–13 ปฏิเสธ native; CMakeLists.txt:13–17 รวม HID backend เฉพาะ Windows |

ชื่อ zide/VID/PID/commands ไม่ยืนยันยี่ห้อ รุ่นหุ่น board revision firmware หรือ servo จึงยังเสนอรุ่นสินค้าหรือรับรองรุ่นไม่ได้

## เทียบเอกสารเดิม

- DES-006:22–33 เสนอ Darwin adapter/revalidate identity เป็นแบบอนาคต; Serial จริงตรวจเพียงรูปแบบ COM ก่อน open ไม่ได้ยืนยันว่าเป็นบอร์ดเดิม
- DES-006:37 กับ REQ-015:16 กำหนด profile หก servo; engine รับถึง 32/group และมี legacy servo+angle 1–4 (actions.cpp:41–60) จึงห้ามอนุมานจำนวนข้อต่อจริงจาก engine limits
- INTEGRATION.md:71–80 อธิบาย cancel/drain→stop และ host 5 s; งานนี้ยืนยัน C++ stop/CHECK_FW แต่ไม่ได้อ่าน manager/frontend lifecycle นอก allowlist จึงไม่รับรอง drain/callback ทั้งเส้นทาง

## ข้อเสนอ SA: matrix สำรวจจริง

หนึ่งแถวต่อรุ่น+board+firmware+transport+OS build/arch ไม่รวมผลข้าม tuple ตารางนี้เป็นแบบเก็บข้อมูล

| กลุ่มสำรวจ | รุ่นหุ่น/board rev/firmware | VID/PID | transport | OS/arch | calibration | stop/disconnect | ผู้รับรอง |
|---|---|---|---|---|---|---|---|
| HID ที่เข้า filter | ยังไม่ทราบทั้งหมด | ค่าคาดจาก source 0483:5750; ต้องวัด | HID 64 bytes | Windows x64 | ยังไม่ตรวจ | ยังไม่ตรวจ | ยังไม่บันทึก |
| Serial ที่มีอยู่จริง | ยังไม่ทราบทั้งหมด | ต้องอ่าน descriptor; อาจเป็น USB bridge | COM/baud ต้องยืนยัน | Windows x64 | ยังไม่ตรวจ | ยังไม่ตรวจ | ยังไม่บันทึก |
| อุปกรณ์เดียวกันบน Mac | ผูก inventory ID เดิม | ต้องตรวจใหม่ | HID/Serial แยกแถว | Intel/arm64 แยกแถว | ยังไม่ตรวจ | ยังไม่ตรวจ; backend ยังไม่มี | ยังไม่บันทึก |

แนบรูปฉลาก/บอร์ด, inventory ID, คู่มือ/revision, firmware source/hash, OS build/driver, สาย/hub/แหล่งจ่าย, app/engine/package hash, ผู้ตรวจและวันที่ทดสอบจริงทุกแถว

| วิธีเก็บภายหลัง | หลักฐาน/เกณฑ์ที่ต้องเตรียม |
|---|---|
| ตรวจฉลากและคู่มือก่อนต่อ | รุ่น/board/servo/firmware จากแหล่งจริง; descriptor VID/PID และ interface/report layout จากเครื่องมือ OS เมื่อได้รับอนุญาต |
| Probe โดยอนุญาตเฉพาะกรณี | raw bytes+timestamp ของ $DRS!/CHECK_FW, mapping firmware ที่ผู้ผลิตยืนยัน; trace ไม่มี motion (AC-014-03); ไม่ใช้ any bytes เป็น model proof |
| Calibration | หก ID, direction, PWM endpoints, ช่วงกายภาพ/โหลด/เครื่องมือวัด, profile hash, measured เทียบ predicted (REQ-015); bounds engine ไม่ใช่ safe travel |
| Stop และ disconnect | วัด user trigger→cancel/drain→write→physical rest แยกเวลา; app/board playback, unplug/replug, timeout, partial HID download แล้ว stop, Serial stale reply; เก็บ trace+วิดีโอ/เครื่องมือวัดและวิธีฉุกเฉินอิสระ (AC-021-01–04) |
| ทดสอบ platform | tuple เดิมบน Windows/Mac Intel/Mac arm64; ใช้ source build และ installer แยกหลักฐาน; macOS ต้องผ่าน AC-032-02 จริง |

## ส่ง BA-003/SA-003 และผู้ใช้ตรวจเมื่อมีหลักฐาน

Task BA-003 / Reference OQ-008, G-HW / Reason: ขาด physical evidence ให้ทีมเติม matrix/เกณฑ์ stop/calibration/disconnect/ผู้รับรองเฉพาะด้าน/สิทธิ์ test cases แล้วส่งผู้ใช้ตรวจรับตามมติเดิม

Task SA-003 / Reference DES-001/006, G-ROBOT-CONTRACT / Reason: ตรวจ drain/interleaving, reply identity, stale COM, Darwin framing/permissions และ partial-write buffering ต่อ งานนี้ไม่เปลี่ยน payload/schema ไม่มี SQL ส่ง DBA

เลือกสำรวจอุปกรณ์จริงเทียบ protocol เดิม; ปัดตกเดารุ่นจาก VID/PID, ข้าม CHECK_FW และใช้ dry-run/write success รับรอง stop เพราะไม่มีหลักฐาน ข้อจำกัดนี้ขวาง hardware approval ไม่ขวางการส่ง source survey

## Change Log

- 2026-10-21 — Rev1: ตรวจ source และจัด matrix/หลักฐานที่ต้องเก็บเพื่อ BA-003/SA-003; ไม่อนุมัติรุ่นหุ่นหรือปิด human gates
