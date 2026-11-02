# DES-006 — หุ่นจริง Windows/macOS — ผู้ใช้และเงื่อนไขก่อนเริ่ม

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-006 — หุ่นจริง Windows/macOS](des-006.md)

ชนิดข้อมูลที่ใช้: `D` = UTC instant; `H` = SHA-256 hex 64 ตัว; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## ผู้ใช้และเงื่อนไขก่อนเริ่ม

ผู้ใช้เลือกอุปกรณ์และ profile ที่ผู้ดูแลตรวจแล้ว สั่ง connect/move/read/play/upload/stop; ต้องมี License เว้น stop/recovery ตาม [DES-001 (Desktop host และ Inter-Process Communication (IPC))](des-001.md)

ค้นพบไม่เท่ากับ connected; ต้อง probe จริงโดยไม่ส่ง movement ห้ามใช้ sample connection หรือเพียงยืนยัน checkbox แทน calibration

## ข้อเสนอ platform boundary

ใช้ `TransportOptions`, `ExchangeResult`, command builders/actions เดิม เพิ่ม Darwin discovery/HID/serial implementations:

| ใช้ร่วม | เพิ่ม/เปลี่ยน |
|---|---|
| command text, group bounds, HID packet format, reply semantics | แยก platform helper ออกจาก transport_windows.hpp |
| 4 วินาที transport / 5 วินาที host budget | Darwin HID backend และ IOKit discovery; serial ใช้ POSIX/termios adapter |
| CHECK_FW guard และ partial-write failure | ตรวจ report-ID framing/permissions บน Intel และ ARM64 จริง |
| no movement retry | target validation จาก enumeration ของ OS |

Darwin serial รับเฉพาะ enumerated callout device identity ไม่เปิด arbitrary `/dev` path; Windows คง COM policy และตรวจ target ปัจจุบัน ทุก request revalidate target ก่อน open ป้องกัน stale/replaced path

UI device shape คง `{transport:"hid"|"serial",path,name}` โดย path เป็น opaque OS token ไม่ให้ผู้ใช้พิมพ์ filesystem path Capability ของ engine ต้องรายงานตาม backend ที่ build ได้จริง; ไม่อ้าง darwin hardware support ก่อน acceptance

## Profile และการรับรอง

Profile `{name,servos:[{id,pwmMin,pwmMax}]}` มีหกตัว, ID 0–254 ไม่ซ้ำ, PWM 500–2500, endpoints ไม่เท่ากันและกลับทิศได้ UI ranges ตาม [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md)

เสนอ local signed acceptance record:
`{schema:1,profile_hash:H,model:T128,board_identity:T256,platform:Platform,approved_by:T200,approved_at:D,evidence_ref:T2048,valid_until:D}`
ผู้รับผิดชอบจริงต้องยืนยันข้อมูลก่อนออก signature ผ่าน admin process ที่มี authority; ไม่มี agent สร้างผลรับรองเอง เกณฑ์/อายุ validity รอ [OQ-008 (ขอบเขตหุ่นและการยอมรับความปลอดภัย)](../open-questions/oq-008.md)

แก้ profile/เปลี่ยนอุปกรณ์ทำให้ confirmation เดิมใช้ไม่ได้ เปิด project ไม่ restore connection หรือ acceptance ให้หุ่นอื่น ไม่มี calibrated HOME/BOX/POSE0 จนมี record ที่ตรงกัน

