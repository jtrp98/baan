# TP-002 — รายละเอียด Bridge fixtures

วันที่ 2026-10-29 · inspect · ส่วนต่อของ [แผนหลัก](tp-002-fixture-plan-001.md) · ทุก actual=NOT_RUN

## FX-03 late callback / drain-stop / idle lost (fake engine เท่านั้น)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-03a | fake engine process หน่วง reply จนเลย stop; ปล่อย callback หลัง unmount/generation เปลี่ยน | TP001-037/040 · AC-021-01..04, AC-024-01..03 | cancel+drain ก่อนคำขอ stop (ลำดับใน trace); stop ซ้ำ join งานเดิมไม่สร้างคิวใหม่; รอ child reaped+stdout/stderr drained; callback ผลเก่าถูกทิ้งไม่เริ่ม movement ถัดไป; deadline host 5 วินาที |
| FX-03b | partial write แล้ว cancel; stop request ล้มเหลว | TP001-037/039 · AC-021-03, AC-023-03 | ไม่รับประกันไม่มี movement; stop fail→error ไม่ยืนยันหยุดจริง; relock เฉพาะ stop request ส่งสำเร็จ; คง lost/unknown delivery ไม่ replay command |
| FX-03c | discovery inject หาย 1 ผลขณะ idle; poll ทับขณะ busy/stopping | TP001-040 · AC-024-01 | poll 3000 ms/debounce 0 หนึ่งผลสำเร็จที่ไม่พบ target→DEVICE_NOT_FOUND/lost (สมมติฐาน); ไม่ซ้อน poll; busy/cancelled ไม่เปลี่ยน connected; lost invalidate uploaded session |
| FX-03d | fake transport รับคำขอท่า M แล้วคืน TRANSPORT_ERROR ระหว่าง write; variation รับบางส่วนแล้ว timeout; ปล่อย delayed reply/กด reconnect | TP001-040 · AC-024-02 (TP001-045 เฉพาะซ้อม logic) | แสดงข้อผิดพลาด; dispatch M=1 ไม่มี retry เองแม้ reconnect/timer; ไม่อ้างส่งไม่ถึงหรือหยุดจริงเมื่อ partial write; probe ใหม่ไม่ replay ท่า |
| FX-03e | stop ระหว่าง drain; stdout/stderr ยังไม่ EOF, child ยังไม่ reaped; กด stop/navigation ซ้ำและปล่อย timer เก่า | TP001-037 · AC-021-02 | stop operation เดียว; ไม่ส่ง stop ก่อน drain/reap ครบ; ไม่มี next movement; failure/timeout แสดงเหตุผลไม่ยืนยัน physical stop |

วิธี: fake engine process/test bridge ตาม PF-HOST (spawn จริงเป็นโปรเซสจำลอง ส่ง JSON Lines ตามสคริปต์ delay/drop/dup/partial) — **ไม่เปิด HID/Serial จริง ไม่มีคำสั่งถึงหุ่นใด ๆ (dry-run เท่านั้น)**; cadence 3000 ms เป็นสมมติฐาน ไม่ใช้วัด stop latency

## Setup / trigger / สิ่งที่วัด

- ใช้ PF-HOST integration กับ child จำลอง protocol 1.0 ของ DES-001 Rev1; UI/component ตรวจว่าผู้ใช้เห็น error ผ่าน fake bridge. executable จำลองไม่มี HID/Serial/network adapter; ห้ามโหลด engine ที่คุมอุปกรณ์จริง
- FX-03a/e: seed queue [M1,M2] และ timer ของ generation G; child ถือ reply M1 ไว้ที่ barrier. กด stop→บันทึก admission closed/generation invalidated/cancel; ปล่อย reply และ timer ทั้งระหว่าง drain กับหลัง stop จบ โดยทดสอบแยกและพร้อมกัน
- ตรวจ order cancel→child exit+reap+stdout/stderr EOF→stop เป้าหมายเดิม; นับ M2=0, callback เก่าแก้ state=0, concurrent stop ใช้ operation เดียว. แยก request_id/generation/project/session ใน trace เพื่อไม่สับสนผลคนละรอบ
- FX-03d: seed ท่า M เพียงหนึ่งครั้ง; เลือก failpoint ก่อนส่งครบ/หลัง partial write/รอ reply. advance fake scheduler จน timer เดิมพร้อมทำงาน, ปล่อย callback เก่า แล้ว reconnect ผ่าน fake probe; ตรวจทุกจุด dispatch M รวม=1 และ next movement=0 จนผู้ใช้สั่งใหม่
- แยก TRANSPORT_ERROR, DEVICE_TIMEOUT, ENGINE_TIMEOUT จาก ENGINE_BUSY/ENGINE_CANCELLED ตาม TP001-040; busy/cancelled อย่างเดียวไม่ทำให้ lost. ตรวจ visible error event แยกจาก stderr เพื่อไม่ถือว่า log อย่างเดียวทำให้ผู้ใช้เห็น
- E-TRACE เก็บ event order, timestamp, request/action/target สมมติ, จำนวน spawn/write/dispatch/stop และ fault point; E-UI เมื่อมี component/UI จริงและ prerequisites พร้อม. deadline host 5 วินาทีอ้าง TP001-037; poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ไม่วัด physical SLA
- TP001-045 เป็น manual hardware case: ใช้ FX-03d ซ้อม logic ได้ แต่ actual ของเคสยัง NOT_RUN; E-TRACE ใช้แทน E-HW ไม่ได้. unplug/replug/แรงบิด/การหยุดจริงรอ G-HW และผู้อนุญาตตาม [แผนหลัก](tp-002-fixture-plan-001.md#ข้อรอคนและข้อจำกัด)


## Change Log
- 2026-10-29 — ใบงาน093: แยกรายละเอียดจากแผนหลัก คง IDs เดิม และเติม setup/trigger/สิ่งที่วัด; fake เท่านั้น ไม่มี test execution
