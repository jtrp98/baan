# DES-006 — หุ่นจริง Windows/macOS — คำสั่งและผลลัพธ์

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-006 — หุ่นจริง Windows/macOS](des-006.md)

## คำสั่งและผลลัพธ์

คง engine protocol 1.0; action payload เพิ่ม transport `hid/device` หรือ `serial/port/baud`; read_ms 1–1500

อ่าน [robot-boundary-001.md](robot-boundary-001.md) สำหรับ envelope/errors/bounds ที่ยึด source เดิม

| Action | Inputs / semantics |
|---|---|
| device.list | `{}` → devices; ไม่ส่งคำสั่งอุปกรณ์ |
| board.info | target → ต้องมี reply จึง connected |
| servo.set | id integer 0–254, pwm integer 500–2500, time_ms integer 0–9999 (default 1000), bias integer −500..500 (default 0); pwm+bias ต้อง 500–2500; host แปลงจาก profile และ coalesce ข้อต่อล่าสุดทีละคำขอ |
| group.execute | `{group:{index,items:[{id,pwm,time_ms}]}}`; live หนึ่ง pose |
| group.download | group หรือ groups อย่างใดอย่างหนึ่ง; engine รับ 1–8 groups/คำขอ แต่ UI แบ่ง ≤4 และต้องผ่าน 65536-byte envelope; 1–10000 poses รวม |
| group.run | start/end 0–9999, times 1–9999; ต้องมี upload session เดิม |
| servo.read | id; ตรวจ reply ID/PWM ครบก่อน commit |
| servo.torque | enabled; default broadcast 255; explicit user action |
| robot.stop | target เดิม; คืน stop_requested ไม่ใช่ stopped measured |

Engine duration 0–9999; UI project จำกัด 1000–9000 ไม่ลด validation ของ engine ผลจริงมี `delivery:"written",acknowledged:false,exchange:{received,received_hex,bytes_written,bytes_read}`; dry-run เป็น simulated และห้ามปะปน telemetry

รายละเอียด group/servo/baud bounds อยู่ใน [robot boundary](robot-boundary-001.md#ขอบเขต-payload)

## วงจรงานและความล้มเหลว

`off → probing → connected → busy → connected|lost`
board playback คง active จน stop/error ไม่ตั้งจบจากเวลา

Stop: host ปิด admission → generation++/ล้าง timers/คิว → cancel child → reap/drain → `$DST!` เป้าหมายเดิม → relock เฉพาะคำขอที่ระบุไว้ การส่ง stop ล้มเหลวไม่แสดง stopped/locked สำเร็จ ห้ามงานใหม่แทรกก่อน stop เสร็จ

การ join stop/drain และ idle discovery ทุก 3000 ms, debounce 0 ms ซึ่งยังต้องยืนยัน ตาม [robot boundary](robot-boundary-001.md); cadence ไม่ใช่ stop latency/hardware SLA

CHECK_FW ทุก HID open คงไว้ แม้เพิ่ม latency; การข้ามอาจส่งข้อมูลเข้า bootloader ไม่ใช่ optimization ที่อนุญาตเอง App loop รอผลส่งและระยะท่าก่อนท่าถัดไป; upload failure หยุด batches และ invalidates board session

TRANSPORT_ERROR/DEVICE_TIMEOUT/ENGINE_TIMEOUT → lost/unknown delivery ไม่ retry movement; ENGINE_BUSY/ENGINE_CANCELLED ไม่เท่ากับ cable loss แต่ cancellation อาจเกิดหลังส่งบางส่วน ต้องไม่อ้างว่าไม่มีผลทางกายภาพ Reconnect ต้อง probe ใหม่ ไม่ replay/restore upload session อัตโนมัติ

## ทางเลือก / release guard / การตรวจ

เลือกต่อ C++ platform adapter; ปัดตก rewrite engine, simulator-only Mac, skip CHECK_FW และ timer-confirmed stop

Dry-run/fake bridge ตรวจ [AC-014 (เกณฑ์ตรวจรับเรื่องค้นหาและเชื่อมต่อหุ่น)](../../modules/arm-lab/shared/requirements/req-014.md), [AC-015 (เกณฑ์ตรวจรับเรื่องโปรไฟล์หุ่นหกข้อต่อ)](../../modules/arm-lab/shared/requirements/req-015.md), [AC-016 (เกณฑ์ตรวจรับเรื่องส่งท่าและปรับข้อต่อ)](../../modules/arm-lab/shared/requirements/req-016.md), [AC-017 (เกณฑ์ตรวจรับเรื่องข้อมูลท่า ลำดับ และกลุ่ม)](../../modules/arm-lab/shared/requirements/req-017.md), [AC-018 (เกณฑ์ตรวจรับเรื่องเล่นลำดับจากแอป)](../../modules/arm-lab/shared/requirements/req-018.md), [AC-019 (เกณฑ์ตรวจรับเรื่องอัปโหลดท่าไปบอร์ด)](../../modules/arm-lab/shared/requirements/req-019.md), [AC-020 (เกณฑ์ตรวจรับเรื่องเล่นชุดท่าบนบอร์ด)](../../modules/arm-lab/shared/requirements/req-020.md), [AC-021 (เกณฑ์ตรวจรับเรื่องขอหยุดหุ่นและยกเลิกงานค้าง)](../../modules/arm-lab/shared/requirements/req-021.md), [AC-022 (เกณฑ์ตรวจรับเรื่องอ่านค่าตำแหน่ง servo)](../../modules/arm-lab/shared/requirements/req-022.md), [AC-023 (เกณฑ์ตรวจรับเรื่องปลดและล็อกแรงบิด)](../../modules/arm-lab/shared/requirements/req-023.md), [AC-024 (เกณฑ์ตรวจรับเรื่องการเชื่อมต่อขาดและคำสั่งล้มเหลว)](../../modules/arm-lab/shared/requirements/req-024.md) ได้เฉพาะ logic ต้องตรวจจริงบน Windows/Mac ทั้ง HID/Serial ที่ประกาศรองรับ: calibration, unplug/replug, partial download, stale serial reply, stop latency และ emergency-stop provisions รุ่น/เกณฑ์/ผู้รับรองรอ [OQ-008 (ขอบเขตหุ่นและการยอมรับความปลอดภัย)](../../shared/open-questions/oq-008.md) ห้ามส่งมอบ Mac simulator แทน [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon กับหุ่นรุ่นที่ผ่านการยืนยันแล้ว เชื่อมต่อและส่งคำสั่งควบคุมหุ่นผ่าน native transport ได้จริง โดยไม่ใช้ผลจำลองแทนการส่งคำสั่ง)](../../modules/app-shell/shared/requirements/req-032.md)
