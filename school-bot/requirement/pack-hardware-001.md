# pack-hardware-001 — hardware acceptance pack (BA-003)

> Task: BA-003 · วันที่ 2026-10-24 · รันโดย นายช่าง solo (subagent role spec) · ครอบ GAP-05 · ค่าเสนอติดป้าย (สมมติฐาน — ยังไม่ยืนยัน) ทั้งหมด · ไม่สั่งหุ่นจริงจนมีคำสั่งอนุญาต

## 0. เงื่อนไขก่อนใช้ pack (ยืนยันจาก GAP-05 และ gates)

- ยังไม่มีรุ่นหุ่นที่ยืนยัน (ชื่อ zide/VID 0483:5750 จาก source ไม่ยืนยันยี่ห้อ/รุ่น/firmware — hardware-survey-001) · คำสั่งอนุญาตทดสอบอุปกรณ์จริงยังไม่มี → ทุกแถว "actual" ยังเติมไม่ได้; งาน robot ใช้ dry-run จนมีคำสั่งอนุญาต
- ข้อเท็จจริง as-built ที่ใช้อ้างอิง (hardware-survey-001): engine default dry-run; native HID/Serial เป็น Windows-only (Darwin ปฏิเสธ); CHECK_FW silence ≤ 1,500 ms; transport deadline 4 s; pacing 200 ms/คำสั่ง; serial COM1–COM9999 + baud allowlist; download 1–8 กลุ่ม/คำขอ; host drain 5 s ก่อน stop (INTEGRATION.md:71–80)

## 1. ตาราง AC → วิธีตรวจ → expected/actual → evidence → ผู้รับรอง

| AC | สิ่งตรวจ | วิธีตรวจ | Expected | Actual/Evidence (กรอก) | ผู้รับรอง (กรอก) |
|---|---|---|---|---|---|
| AC-014-03 | probe กับ test device | ใช้ test device ไม่ตอบ probe / ตอบถูก; เก็บ trace raw bytes+timestamp | ไม่ตอบ → ไม่เข้า connected; ตอบถูก → เชื่อมต่อ; trace ไม่มีคำสั่งเคลื่อนไหวระหว่างเชื่อม | ______ | ______ |
| AC-019-03 | partial download | บังคับ error ที่ชุดแรกระหว่างอัปโหลด (เช่น unplug) | ไม่มีชุดที่สอง; ไม่มีผลยืนยัน verified บนบอร์ด | ______ | ______ |
| AC-021-01 | หยุดระหว่างเล่น | วัดแยกช่วงเวลา user trigger→cancel/drain→write stop→physical rest + วิดีโอ/เครื่องมือวัด | พบการยกเลิกและจบงานค้างก่อนคำขอ stop; physical rest ภายในเกณฑ์ที่ยืนยัน (ดู §3) | ______ | ______ |
| AC-021-03 | stop ล้มเหลว | ถอดสายก่อน stop / stale reply | ผู้ใช้เห็น error; ไม่มีข้อความยืนยันว่าหุ่นหยุดจริง | ______ | ______ |
| AC-024-01 | อุปกรณ์หายขณะ idle | unplug ขณะ idle | สถานะเปลี่ยนเป็น lost + แสดงทางเชื่อมต่อใหม่; ค่าเวลาถึง lost ขึ้นกับ polling ของ SA-003 (GAP-08 — ไม่เสนอค่าใน pack นี้) | ______ | ______ |
| AC-024-02 | transport error ระหว่างส่งท่า | จำลอง error กลางท่า | เห็นข้อผิดพลาด; ไม่มีการส่งท่าเดิมซ้ำเอง | ______ | ______ |
| AC-031-05 | หุ่นจริงบน Windows | tuple หุ่นยืนยันแล้ว บน Win11 25H2 x64 (decisions-019) | เชื่อมต่อ + ส่งคำสั่งควบคุมผ่าน native transport ได้จริง ไม่ใช่ผลจำลอง | ______ | ______ |
| AC-032-02 | หุ่นจริงบน macOS | tuple เดียวกัน บน macOS 15+ Intel และ arm64 แยกแถว | เช่น AC-031-05; ปัจจุบันบล็อก: Darwin backend ยังไม่มี (รอ arch/SA-003 ตาม DES-006) | ______ (Intel) / ______ (arm64) | ______ |

## 2. Platform matrix (ตาม hardware-survey-001 — หนึ่งแถวต่อรุ่น+board+firmware+transport+OS)

| กลุ่ม | รุ่นหุ่น/board rev (กรอก) | Firmware+hash (กรอก) | VID/PID | Transport | OS | Calibration (กรอก) | ผู้รับรอง (กรอก) |
|---|---|---|---|---|---|---|---|
| HID | ______ | ______ | 0483:5750 (ค่าจาก source — ต้องวัดจริง) | HID 64 B | Windows 11 25H2 x64 | ______ | ______ |
| Serial | ______ | ______ | ต้องอ่าน descriptor | COM/baud ยืนยัน | Windows 11 25H2 x64 | ______ | ______ |
| อุปกรณ์เดียวบน Mac | ______ | ______ | ตรวจใหม่ | HID/Serial แยกแถว | macOS 15+ Intel; macOS 15+ arm64 (แยกแถว) | ______ | ______ |

แนบทุกแถว: รูปฉลาก/บอร์ด, inventory ID, คู่มือ/revision, OS build/driver, สาย/hub/แหล่งจ่าย, app/engine/package hash, ผู้ตรวจ+วันที่จริง

## 3. ค่าเกณฑ์ที่ต้องมีมนุษย์ยืนยัน (ค่าเสนอติดป้ายสมมติฐานทั้งหมด)

| เกณฑ์ | ค่าที่เสนอ | สถานะ/ที่มา |
|---|---|---|
| Stop latency (user trigger → physical rest) | ≤ 5,000 ms | (สมมติฐาน — ยังไม่ยืนยัน) ตั้งจาก host drain 5 s ปัจจุบัน (INTEGRATION.md) เป็นจุดตั้งต้นให้คนขึงเข้มขึ้น |
| Unplug → สถานะ lost | ไม่เสนอค่า | ผูกกับความถี่ discovery (GAP-08 ของ arch/SA-003) — รอค่าจาก arch แล้วให้คนยืนยัน |
| Partial download → หยุดชุดถัดไป | ไม่มีค่าตัวเลข (พฤติกรรมตาม AC-019-03) | ยืนยันแล้วในระดับพฤติกรรม; วิธีพิสูจน์ต้องมีหุ่นจริง |
| Emergency stop อิสระ | วิธี+เกณฑ์: ______ | (สมมติฐาน — ยังไม่ยืนยัน) ต้องกำหนดวิธีฉุกเฉินที่ไม่พึ่งซอฟต์แวร์ (เช่น ตัดไฟ/สวิตช์เฉพาะ) + ผู้รับรอง |
| Calibration 6 ข้อต่อ | ID/direction/PWM endpoints/ช่วงกายภาพ/โหลด: ______ | ตามรูปโปรไฟล์หก servo (REQ-015); ค่าจริงต้องวัด; bounds ของ engine ไม่ใช่ safe travel |
| สิทธิ์สั่งหุ่น | ผู้มีสิทธิ์สั่งทดสอบ: ______ · ผู้ออกคำสั่งอนุญาต: ______ · วันที่/ขอบเขต: ______ | ยังไม่มีคำสั่งอนุญาต — ทุกการทดสอบหุ่นจริงบล็อกจนมีช่องนี้ |

## 4. ผูก GAP-05

ครอบ AC ครบ 8 ตัวตามที่ GAP-05 ระบุ พร้อมช่องรุ่น/firmware/calibration/platform matrix/stop-unplug-partial-emergency/ผู้รับรอง/สิทธิ์; ค่าเสนอติดป้ายสมมติฐาน รอคนยืนยันก่อน QA-005/006/007 จึงจะตรวจ pass threshold ฝั่งกายภาพได้; case PF-HW ยังเป็นการเตรียมขั้นตอน

## Change Log

- 2026-10-24 — สร้าง hardware acceptance pack ตอบ GAP-05 ตาม BA-003; อ้าง hardware-survey-001/decisions-019; รันโดย นายช่าง solo (subagent role spec); read-only ไม่สร้าง AC ใหม่ ไม่สั่งหุ่นจริง
