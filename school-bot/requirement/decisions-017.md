# มติให้รองรับ Windows 10 x64 และทบทวนขั้นต่ำ
> ถูกแทนด้วย มติ 019 (ใช้เป้าหมาย Windows 11 แทน Windows 10) — [มติ 019](decisions-019.md)

## คำตอบผู้ใช้ — 2026-10-21

ผู้ตอบ: ผู้ใช้ในแชตนี้ ผ่าน request_user_input_async ของ คำถามตรวจ OS (memory: planning/human-questions-004.md)

คำตอบ: "ต้องรองรับ Windows 10 x64 ด้วย ให้ทีมตรวจ edition/build และปรับข้อเสนอขั้นต่ำก่อนยืนยัน"

## สิ่งที่ยืนยัน

มติปัจจุบันถูกแทนโดย [decisions-019](decisions-019.md): ผู้ใช้เปลี่ยนฝั่ง Windows เป็น Windows11 ตามข้อเสนอแรก เก็บเนื้อหาด้านล่างเป็นลำดับการตัดสินใจก่อนหน้า

- Windows 10 x64 ต้องอยู่ในขอบเขต SchoolBot เพิ่มจาก Windows/macOS ที่ยืนยันไว้แล้ว ไม่เลือกขั้นต่ำเฉพาะ Windows 11 25H2 ตาม candidate แรก
- มอบหมายทีมตรวจ edition/build, ข้อจำกัด Desktop/engines, ตัวติดตั้ง และ dependencies แล้วจัดทำข้อเสนอขั้นต่ำใหม่ให้ตรวจยืนยัน
- ยังไม่ยืนยันว่า Windows 10 ทุก edition/build ใช้ได้ และยังไม่อนุมัติเลข build ขั้นต่ำที่ยังไม่ได้เสนอ
- Windows 11 และ macOS รวมควบคุมหุ่นจริงยังคงตามมติเดิม การเลือก Windows 10 ไม่ใช่การตัด macOS หรือยกเว้นการตรวจ hardware/install จริง

## ส่งต่อ

ให้ SA ทบทวน OS proposal และแยก runtime/API compatibility ออกจาก vendor support policy รวม setup EXE/MSI/WebView2/native drivers และ source ของ dependencies ที่ pin ไม่ใช้ OS support lifecycle เพียงอย่างเดียวสรุปว่าโปรแกรมรันได้หรือไม่ได้

BA/PM ใช้มตินี้กับ REQ-009/031 และ BA-004/BE-020/QA-008/QA-010 ตาม ownership โดยรักษา IDs และไม่อ้าง QA PASS จากมติ ผู้ใช้ยังเป็นผู้อนุมัติภาพรวมตาม decisions-016

G-DELIVERY/OQ-011 ยังรอข้อเสนอ edition/build และหลักฐานตรวจรับ จึงยังไม่ปิดทั้งหมด

## Change Log

- 2026-10-21 — ผู้ใช้เปลี่ยน Windows target ตาม decisions-019 ยุติสาขา Windows10 โดยรักษามติเดิมเป็นประวัติ
- 2026-10-21 — MYCELIUM บันทึกคำตอบผู้ใช้ให้รองรับ Windows 10 x64 และส่ง SA ปรับข้อเสนอ
