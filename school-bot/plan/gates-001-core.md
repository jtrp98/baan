# SchoolBot — เงื่อนไขฐานระบบและ UX เริ่มต้น

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [เงื่อนไขอนุมัติหลัก](gates-001.md) ทุกแถวคงหลักฐานปิดและงานที่พึ่งพาเดิม

| Gate | ผู้เตรียมหลักฐาน | ผู้ตัดสิน/ผู้ให้หลักฐานที่ต้องเป็นคน | หลักฐานปิดและงานที่พึ่งพา |
|---|---|---|---|
| G-CORE (ฐานข้อมูลหลัก) | arch/vault/sys/jpo | เจ้าของ schema/API/security และผู้รัน test DB | ยังไม่มีหลักฐานปิด G-CORE เพิ่มเติม ดูหลักฐานท้ายไฟล์ · **งานที่ต้องผ่านเงื่อนไขนี้:** [DBA-003 (รวบรวมหลักฐานฐานข้อมูลหลัก)](index-foundation.md) — งานอื่นทำบน stub DB |
| G-AUTH (บัญชีเดิมและการเชื่อม auth) | sys/arch | เจ้าของระบบเดิม/ผู้ตรวจ compatibility | ยังรอหลักฐานบัญชีเดิมและการเชื่อมต่อ ดูหลักฐานท้ายไฟล์ · **งานที่ต้องผ่านเงื่อนไขนี้:** [QA-001](index-delivery.md) (credential compatibility กับบัญชีจริง) + [QA-016](extension/index.md) (เดิม) + [BE-023](index-delivery.md) (ลงทะเบียน [DES-012 (Auth ข้ามระบบ)](../design/des-012.md) channel production) — งาน login/session ทำบน fixture |
| G-GUEST (นโยบายและ storage ของ Guest) | spec/arch | เจ้าของผลิตภัณฑ์/ผู้แทนผู้ใช้ | ยังไม่มีหลักฐานปิด G-GUEST เพิ่มเติม ดูหลักฐานท้ายไฟล์ · **งานที่ต้องผ่านเงื่อนไขนี้:** [QA-002 (ตรวจรับโครงงาน)](index-delivery.md) — [DBA-004 (เตรียม DDL โครงงาน)](index-foundation.md)/[BE-009 (ทำโครงงาน Local)](index-foundation.md)/[BE-024 (ทำ Guest export/ถังขยะ 30 วัน)](extension/index.md)–026 คือผู้ผลิต storage/migration contract ที่ gate รอ |
| G-LEARN (เกณฑ์การเรียน) | spec | เจ้าของการเรียนรู้/ผลิตภัณฑ์ | ยังไม่มีหลักฐานปิด G-LEARN เพิ่มเติม ดูหลักฐานท้ายไฟล์ · **งานที่ต้องผ่านเงื่อนไขนี้:** [QA-004 (ตรวจรับการเรียน)](index-delivery.md) — [BA-005 (จัดเนื้อหา Block/Code)](index-delivery.md)/006 คือผู้ผลิต criteria/rubric ที่ gate รอ |
| G-HW (ทดสอบหุ่นจริง) | [BA-003 (กำหนดเกณฑ์ควบคุมหุ่น)](index-foundation.md), TP | ผู้รับผิดชอบความปลอดภัย/ผลิตภัณฑ์และผู้รับรอง | รุ่น/firmware/calibration/stop/disconnect/ฉุกเฉิน/platform matrix พร้อมคำสั่งอนุญาต test cases ก่อน [QA-005 (ตรวจรับหุ่นบน Windows)](index-delivery.md)..007 |
| G-DELIVERY (ส่งมอบและ signing) | spec/inspect | เจ้าของส่งมอบ/signing/ผู้ตรวจรับ | ยังไม่มีหลักฐานปิด G-DELIVERY เพิ่มเติม ดูหลักฐานท้ายไฟล์ · **งานที่ต้องผ่านเงื่อนไขนี้:** [QA-008 (ตรวจรับตัวติดตั้ง Windows)](index-delivery.md)/009/010 — [BE-020 (ทำตัวติดตั้ง Windows MSI)](index-delivery.md)/021 ทำด้วย test cert |
| G-UX-ENTRY (อนุมัติ UX หน้าเข้าใช้งาน) | [UX-001 (ออกแบบ UX หน้าเข้าใช้งาน)](index-foundation.md) | ผู้มีอำนาจ UX | **ปิดแล้ว 2026-10-29** (ผู้ใช้ยืนยันจาก sign-off ที่มี): UX-001 signed int-001 + expired-copy delta ตาม [มติ 043 (อนุมัติ UX และยืนยัน runner)](../requirement/decisions-043.md) |
| G-UX-PROJECT (อนุมัติ UX โครงงาน) | [UX-002 (ออกแบบ UX โครงงาน)](index-foundation.md) | ผู้มีอำนาจ UX | **ปิดแล้ว 2026-10-29** (ผู้ใช้ยืนยันจาก sign-off ที่มี): UX-002 signed int-003 |
| G-UX-LABS (อนุมัติ UX ห้องทดลอง) | [UX-003 (ออกแบบ UX ห้องทดลอง)](index-foundation.md) | ผู้มีอำนาจ UX | **ปิดแล้ว 2026-10-29** (ผู้ใช้ยืนยันจาก sign-off ที่มี): UX-003 signed int-002 — ไม่ใช่ hardware approval (ยังอยู่ที่ G-HW) |
