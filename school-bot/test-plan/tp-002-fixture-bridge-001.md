# TP-002 — รายละเอียด Bridge fixtures

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [แผน TP-002](tp-002-fixture-plan-001.md) ทุก actual เป็น NOT_RUN ใช้ PF (Test Profile: สภาพแวดล้อมตรวจ) และรหัสหลักฐาน E ตาม [TP-001](tp-001.md#profiles)

## FX-03 late callback / drain-stop / idle lost (fake engine เท่านั้น)

| id | จำลอง | จุดตรวจ · cases/AC | Expected หลัก |
| --- | --- | --- | --- |
| FX-03a | fake engine process หน่วง reply จนเลย stop; ปล่อย callback หลัง unmount/generation เปลี่ยน | TP001-037/040 · [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ…)](../requirement/req-021.md)..04, [AC-024-01 (จำลองอุปกรณ์หายจาก discovery ขณะ idle แล้วสถานะเปลี่ยนเป็น lost…)](../requirement/req-024.md)..03 | cancel+drain ก่อนคำขอ stop (ลำดับใน trace); stop ซ้ำ join งานเดิมไม่สร้างคิวใหม่; รอ child reaped+stdout/stderr drained; callback ผลเก่าถูกทิ้งไม่เริ่ม movement ถัดไป; deadline host 5 วินาที |
| FX-03b | partial write แล้ว cancel; stop request ล้มเหลว | TP001-037/039 · [AC-021-03 (เมื่อส่ง stop ล้มเหลว ผู้ใช้เห็นข้อผิดพลาดและไม่มีข้อความยืนยันว่าหุ่นหย…)](../requirement/req-021.md), [AC-023-03 (ขอ stop ขณะอยู่ในสถานะปลดแรงบิด แล้วพบคำขอ stop ก่อนคำขอล็อก)](../requirement/req-023.md) | ไม่รับประกันไม่มี movement; stop fail→error ไม่ยืนยันหยุดจริง; relock เฉพาะ stop request ส่งสำเร็จ; คง lost/unknown delivery ไม่ replay command |
| FX-03c | discovery inject หาย 1 ผลขณะ idle; poll ทับขณะ busy/stopping | TP001-040 · AC-024-01 | poll 3000 ms/debounce 0 หนึ่งผลสำเร็จที่ไม่พบ target→DEVICE_NOT_FOUND/lost ; ไม่ซ้อน poll; busy/cancelled ไม่เปลี่ยน connected; lost invalidate uploaded session |
| FX-03d | fake transport รับคำขอท่า M แล้วคืน TRANSPORT_ERROR ระหว่าง write; variation รับบางส่วนแล้ว timeout; ปล่อย delayed reply/กด reconnect | TP001-040 · [AC-024-02 (จำลอง transport error ระหว่างส่งท่าแล้วเห็นข้อผิดพลาดและไม่มีการส่งท่าเด…)](../requirement/req-024.md) (TP001-045 เฉพาะซ้อม logic) | แสดงข้อผิดพลาด; dispatch M=1 ไม่มี retry เองแม้ reconnect/timer; ไม่อ้างส่งไม่ถึงหรือหยุดจริงเมื่อ partial write; probe ใหม่ไม่ replay ท่า |
| FX-03e | stop ระหว่าง drain; stdout/stderr ยังไม่ EOF, child ยังไม่ reaped; กด stop/navigation ซ้ำและปล่อย timer เก่า | TP001-037 · [AC-021-02 (หลังหยุดแล้วปล่อยคำตอบเก่าหรือ timer ค้าง ไม่มีคำสั่งท่าถัดไปออกไป)](../requirement/req-021.md) | stop operation เดียว; ไม่ส่ง stop ก่อน drain/reap ครบ; ไม่มี next movement; failure/timeout แสดงเหตุผลไม่ยืนยัน physical stop |

วิธี: fake engine process/test bridge ตาม PF-HOST (spawn จริงเป็นโปรเซสจำลอง ส่ง JSON Lines ตามสคริปต์ delay/drop/dup/partial) — **ไม่เปิด HID/Serial จริง ไม่มีคำสั่งถึงหุ่นใด ๆ (dry-run เท่านั้น)**; cadence 3000 ms เป็นสมมติฐาน ไม่ใช้วัด stop latency

[การเตรียม การกระตุ้นเหตุการณ์ และสิ่งที่วัด](tp-002-fixture-bridge-001-setup.md)


## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · HID = Human Interface Device


## ยังไม่ยืนยัน

poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ให้ arch/เจ้าของสัญญายืนยันก่อน runtime และไม่ใช้เป็น stop latency
