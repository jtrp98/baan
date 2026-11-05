# TP-002 — การเตรียมและวัดผล Bridge

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ร่วมกับ [ชุดข้อมูล Bridge](tp-002-fixture-bridge-001.md) และ [แผนหลัก](tp-002-fixture-plan-001.md) ทุกผลจริงยัง NOT_RUN

## การเตรียมและกระตุ้นเหตุการณ์

- ใช้ PF-HOST integration กับ child จำลอง protocol 1.0 ของ [DES-001 (Desktop host และ IPC)](../design/des-001.md) Rev1; UI/component ตรวจว่าผู้ใช้เห็น error ผ่าน fake bridge. executable จำลองไม่มี HID/Serial/network adapter; ห้ามโหลด engine ที่คุมอุปกรณ์จริง
- FX-03a/e: seed queue [M1,M2] และ timer ของ generation G; child ถือ reply M1 ไว้ที่ barrier. กด stop→บันทึก admission closed/generation invalidated/cancel; ปล่อย reply และ timer ทั้งระหว่าง drain กับหลัง stop จบ โดยทดสอบแยกและพร้อมกัน
- ตรวจ order cancel→child exit+reap+stdout/stderr EOF→stop เป้าหมายเดิม; นับ M2=0, callback เก่าแก้ state=0, concurrent stop ใช้ operation เดียว. แยก request_id/generation/project/session ใน trace เพื่อไม่สับสนผลคนละรอบ
- FX-03d: seed ท่า M เพียงหนึ่งครั้ง; เลือก failpoint ก่อนส่งครบ/หลัง partial write/รอ reply. advance fake scheduler จน timer เดิมพร้อมทำงาน, ปล่อย callback เก่า แล้ว reconnect ผ่าน fake probe; ตรวจทุกจุด dispatch M รวม=1 และ next movement=0 จนผู้ใช้สั่งใหม่
- แยก TRANSPORT_ERROR, DEVICE_TIMEOUT, ENGINE_TIMEOUT จาก ENGINE_BUSY/ENGINE_CANCELLED ตาม TP001-040; busy/cancelled อย่างเดียวไม่ทำให้ lost. ตรวจ visible error event แยกจาก stderr เพื่อไม่ถือว่า log อย่างเดียวทำให้ผู้ใช้เห็น
- E-TRACE เก็บ event order, timestamp, request/action/target สมมติ, จำนวน spawn/write/dispatch/stop และ fault point; E-UI เมื่อมี component/UI จริงและ prerequisites พร้อม. deadline host 5 วินาทีอ้าง TP001-037; poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ไม่วัด physical SLA
- TP001-045 เป็น manual hardware case: ใช้ FX-03d ซ้อม logic ได้ แต่ actual ของเคสยัง NOT_RUN; E-TRACE ใช้แทน E-HW ไม่ได้. unplug/replug/แรงบิด/การหยุดจริงรอ G-HW และผู้อนุญาตตาม [แผนหลัก](tp-002-fixture-plan-001.md#ข้อรอคนและข้อจำกัด)

## คำย่อ

DES = Design หรือสัญญาออกแบบ · IPC = Inter-Process Communication · HID = Human Interface Device · SLA = Service Level Agreement
