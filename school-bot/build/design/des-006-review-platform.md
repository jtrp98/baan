# DES-006 — ทบทวน compatibility ของ Windows/Darwin

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — แยก platform baseline จากข้อเสนอ)

ส่วนของ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md) เป้าหมายเดิมคือ Windows 11 25H2 x64 และ macOS 15+ Intel/Apple Silicon การระบุเป้าหมายหรือ compile ได้ไม่ใช่ผล native hardware acceptance

## Baseline ที่อ่านพบ

| Platform / ส่วน | สิ่งที่โค้ดมีจริง | หลักฐานที่ยังไม่มีจากงานนี้ |
|---|---|---|
| Windows HID | discovery กรอง VID:PID 0483:5750, path ต้องตรง enumeration ก่อน open; report 64 bytes, CHECK_FW ทุก open, ตรวจ partial write | runtime บน Windows 11 25H2 กับรุ่นบอร์ด/firmware ที่ผู้ใช้รับรอง |
| Windows Serial | discovery จาก registry SERIALCOMM; รับ COM1–COM9999, open แบบ exclusive, baud allowlist, 8N1 ไม่ใช้ flow control, partial-write checks | การยืนยัน board identity จาก COM; runtime/driver/unplug/permission จริง |
| Darwin Intel x86_64 | protocol/command builders/dry-run ใช้โค้ดร่วม; discovery กับ exchange ปฏิเสธ non-Windows | ไม่มี Darwin native discovery/HID/Serial implementation ในโค้ดที่ตรวจ |
| Darwin Apple Silicon arm64 | เหมือน Intel ในระดับ source | ไม่มี native transport proof หรือ Universal package acceptance จากงานนี้ |

CMake รวม third_party/hidapi/windows/hid.c และ setupapi/advapi32 เฉพาะ WIN32 ไม่ได้เพิ่ม Darwin backend ด้วยการ build บน APPLE; engine.info ยังรายงาน hardware_platforms:["windows"] และ Host ไม่เปิด action นี้ให้ UI

Windows HID ใช้ report ID=2, TRAN_DATA type=2, payload ต่อ frame ≤56 bytes, command <56 bytes ใช้ address 0 ส่วน ≥56 ใช้ความยาว command เป็น address ตาม protocol เดิม pacing ระหว่าง commands 200 ms และ frames 1 ms CHECK_FW มีหน้าต่างสูงสุด 1500 ms ภายใน deadline exchange 4 วินาที; silence เป็น application-mode signal เดิม ถ้าตอบ bootloader 0xaa หรือรูปผิดให้ปฏิเสธ การคง silence rule ไม่ใช่รับรอง firmware รุ่นใหม่

Serial ส่ง command ASCII โดยตรง รับ reply สะสม; ไม่ retry short write การตรวจ COM syntax ไม่เท่ากับยืนยันว่าเป็น ZIDE board และ serial backend ปัจจุบันไม่ได้ revalidate กับ discovery ทุกครั้งก่อน open

## C5 — สิ่งที่เสนอเพิ่มและผลต่อ consumer

เพิ่ม Darwin implementations เป็น **non-breaking** ต่อ Windows wire format: คง TransportOptions, ExchangeResult, Device {transport,path,name}, command builders, reply semantics และ bounds เดิม แยก helper เวลา/รับข้อมูลออกจาก transport_windows.hpp; Darwin HID ใช้ backend ที่รองรับ macOS กับ IOKit discovery, serial ใช้ POSIX/termios ตามแนว DES-006 เดิม ไม่ rewrite engine

path เป็น opaque OS token จาก discovery ไม่ใช่ช่องรับ path อิสระ HID token อยู่ใน device ส่วน serial callout token อยู่ใน port; baud/read_ms คงเดิม เปิดเฉพาะ identity ที่ยังอยู่ในการ enumeration ก่อน open ไม่เปิด arbitrary /dev path

- Darwin เพิ่ม backend ต้องตรวจ report-ID framing ว่า buffer API รวม/ไม่รวม ID อย่างไร ให้ command bytes คงเดิม ไม่สมมติ Windows buffer layout ใช้ได้ตรงๆ
- คง CHECK_FW/bootloader refusal และ deadline/partial-write checks บนทุก backend ไม่ยอมข้ามเพื่อให้ stop เร็วขึ้น
- Windows serial revalidation ที่เข้มกว่า COM syntax เป็น **breaking** ต่อ direct caller ที่เคยส่ง COM ที่ไม่มีในรายการ ต้อง review พร้อม C2 แยกจากการเพิ่ม Darwin
- ไม่เพิ่ม capability fields เข้า engine envelope หรือเปิด engine.info ผ่าน Host โดยไม่ review; ก่อนมี backend ให้คง error เดิม ห้ามตอบ hardware success จาก dry-run
- consumer เดิมยังใช้ transport+path+name และ explicit target; ไม่แปลง COM เป็น /dev token อัตโนมัติ ไม่ restore connection ข้าม OS/อุปกรณ์

ปัดตก simulator-only Mac เพราะไม่ผ่าน AC-032-02 (ควบคุมหุ่นจริงบน macOS), ปัดตก skip CHECK_FW, raw filesystem path และการ rewrite C++ เพราะไม่จำเป็นและเพิ่มความเสี่ยงต่อ semantics เดิม

## Matrix หลักฐานสำหรับต่อของจริง

ทุกช่องด้านล่างยังไม่ได้ทดสอบใน SA-003 ห้ามเติม PASS จาก fake ผู้ใช้/ทีมอุปกรณ์ต้องยืนยันรุ่น บอร์ด firmware profile calibration และกรณีอนุญาตก่อนสั่งจริงตามมติ 038

| ระบบ | HID | Serial |
|---|---|---|
| Windows 11 25H2 x64 | runtime+driver+permission+report framing+CHECK_FW | runtime+COM identity+baud/8N1+permission |
| macOS 15+ Intel | backend/build+IOKit+permission+report framing+CHECK_FW | backend/build+callout identity+termios/baud+permission |
| macOS 15+ Apple Silicon | หลักฐาน arm64 แยกจาก Intel ในหัวข้อเดียวกัน | หลักฐาน arm64 แยกจาก Intel ในหัวข้อเดียวกัน |

ทุกช่องที่ประกาศรองรับต้องมี connect แบบไม่เคลื่อนไหว, ID/PWM read, partial write/download, stale reply, unplug/replug, stop failure และ stop latency/emergency ตามเกณฑ์ที่คนกำหนด พร้อม binary hash, OS/arch, board/firmware/profile และ trace ที่ตัดข้อมูลส่วนบุคคลแล้ว การเซ็น contract ไม่อนุญาต motion; test fixture ไม่แทน runtime/installer/hardware

## ยังไม่ยืนยัน

- รุ่นบอร์ด/firmware ที่รับรอง, grammar ของ board.info และความสดของ serial reply ID เดิม ต้องได้ protocol/trace จากทีมอุปกรณ์ก่อนกำหนด parser หรืออ้าง freshness
- Darwin driver/permission/report layout และ baud ที่อุปกรณ์จริงรองรับ ต้องพิสูจน์ทั้งสอง architecture
- calibration, เกณฑ์ stop latency, disconnect/emergency และผู้รับรอง ต้องเป็นคำตอบมนุษย์ ไม่อนุมานจาก timeout ในโค้ด

## หลักฐาน

พาธ source ใต้ target/school-bot อ่านวันที่ 2026-11-03

- engines/zide/src/transport.cpp:7–12; discovery.cpp:20–77,82–125; CMakeLists.txt:8–17
- engines/zide/src/transport_hid.cpp:12–37,41–82; transport_serial.cpp:7–69; include/transport_windows.hpp:18–45
- engines/zide/src/protocol.cpp:105–135; src/actions.cpp:22–26; app/internal/engine/manager.go:61–68
- เป้าหมาย OS อ้าง design/index.md และ REQ-032; งานนี้ไม่ตรวจ installer หรืออนุมัติรายการอุปกรณ์
