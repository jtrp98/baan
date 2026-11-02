# หลักฐานและแผนสำรวจอุปกรณ์

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [หลักฐาน source และข้อจำกัดเดิม](hardware-survey-001-evidence.md)

## เอกสารอ้างอิง

[BA-003 (งานสำรวจอุปกรณ์และเกณฑ์ความปลอดภัย)](hardware-survey-001.md) · [SA-003 (งานทบทวน native hardware และ OS)](os-compatibility-001.md) · [AC-014-03 (ใช้ test device ที่ไม่ตอบ probe แล้วไม่เข้าสถานะ connected; เมื่อตอบถูกต้องจึงเชื่อมต่อ โดย trace ไม่มีคำสั่งเคลื่อนไหวระหว่างเ…)](../../modules/arm-lab/shared/requirements/req-014.md) · [REQ-015 (โปรไฟล์หุ่นหกข้อต่อ)](../../modules/arm-lab/shared/requirements/req-015.md) · [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ stop)](../../modules/arm-lab/shared/requirements/req-021.md) · [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon กับหุ่นรุ่นที่ผ่านการยืนยันแล้ว เชื่อมต่อและส่งคำสั่งควบคุมหุ่นผ่าน native transport …)](../../modules/app-shell/shared/requirements/req-032.md)

วันที่ตรวจ source: 2026-10-21; สนับสนุน BA-003/SA-003 ตาม [decisions-016](../../shared/decisions/decisions-016.md) ไม่เปลี่ยน DES/REQ หรือปิด gate สถานะเอกสารดู [index](index.md)

## ข้อเท็จจริงจากโค้ด

ชื่อ zide/VID/PID/commands ไม่ยืนยันยี่ห้อ รุ่นหุ่น board revision firmware หรือ servo จึงยังเสนอรุ่นสินค้าหรือรับรองรุ่นไม่ได้

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
