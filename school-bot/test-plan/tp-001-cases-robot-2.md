# TP-001 — การเชื่อมต่อและควบคุมหุ่น (TP001-036–TP001-039)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-036"></a>

## TP001-036 — เล่นจากบอร์ด

AC: [AC-020-01 (เมื่อยังไม่มีชุดอัปโหลดใน session การเลือกเล่นจากบอร์ดไม่ส่งคำสั่งเริ่ม)](../requirement/req-020.md), [AC-020-02 (เมื่อเลือกวนไม่สิ้นสุด ระบบไม่ส่ง group.run และแจ้งให้ระบุจำนวนรอบ)](../requirement/req-020.md), [AC-020-03 (เมื่อ test bridge รับคำสั่งเริ่มสำเร็จ…)](../requirement/req-020.md) · References: [DES-006 (หุ่นจริง Windows/macOS)](../design/des-006.md) · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: ไม่มี upload session; loop ไม่สิ้นสุด; times 0/1/9999/10000; fake timer

ขั้นตอน: เล่นจากบอร์ด

ผลที่คาด: ไม่มี session→ไม่ส่ง start; วนไม่สิ้นสุด→ไม่ส่ง group.run แจ้งระบุรอบ; start สำเร็จ→ยังแสดงเล่นบนบอร์ดเลยเวลารวมจน stop/error

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-037"></a>

## TP001-037 — กด stop

AC: [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ…)](../requirement/req-021.md), [AC-021-02 (หลังหยุดแล้วปล่อยคำตอบเก่าหรือ timer ค้าง ไม่มีคำสั่งท่าถัดไปออกไป)](../requirement/req-021.md), [AC-021-03 (เมื่อส่ง stop ล้มเหลว ผู้ใช้เห็นข้อผิดพลาดและไม่มีข้อความยืนยันว่าหุ่นหย…)](../requirement/req-021.md), [AC-021-04 (เมื่อออกจาก native workspace ที่เชื่อมต่ออยู่ พบคำขอ stop…)](../requirement/req-021.md) · References: [DES-001 (Desktop host และ IPC)](../design/des-001.md), DES-006 · Level: integration · Profiles: PF-HOST, PF-UI-WIN

เงื่อนไขก่อนตรวจ: เล่นผ่าน fake process; late reply/timer; stop fail; stop ซ้อน 2 ครั้ง; ออก workspace ที่เชื่อมต่อ idle

ขั้นตอน: กด stop; ปล่อย callback เก่า; ออกจาก workspace

ผลที่คาด: cancel+drain ก่อนคำขอ stop (ลำดับใน trace); ไม่มีท่าถัดไปหลัง stop; stop fail→error ไม่ยืนยันหยุดจริง; ออก workspace→stop request แม้ไม่มีงานรอ; concurrent stop = operation เดียว; stop ซ้ำระหว่างหยุด join งานเดิม ไม่สร้างคิว movement/relock ใหม่; รอ child reaped และ stdout/stderr drained ก่อนส่ง stop; ไม่ยกเลิก robot.stop ที่กำลังทำจาก navigation/close ซ้ำ; deadline host 5 วินาที; cancel อาจเกิดหลัง partial write จึงไม่รับประกันว่าไม่มี movement; relock เฉพาะผู้ใช้ขอและ stop request ส่งสำเร็จ; failure คง lost/unknown delivery ให้ผู้ใช้ recovery ไม่ replay command

หลักฐานที่ต้องเก็บ: E-TRACE ลำดับ+timestamp

ผลจริง: NOT_RUN

<a id="tp001-038"></a>

## TP001-038 — อ่าน servo ครั้งเดียวและครบหก แล้วสร้างท่า

AC: [AC-022-01 (เมื่อ test device ตอบ PWM ที่ถูกต้องของ ID ที่ขอ…)](../requirement/req-022.md), [AC-022-02 (เมื่ออ่านครบหกข้อแล้วสร้างท่าใหม่ ท่านั้นมีค่าจากคำตอบทั้งหกข้อ)](../requirement/req-022.md), [AC-022-03 (เมื่อข้อใดข้อหนึ่งไม่ตอบ ตอบผิด ID หรือเกินช่วง…)](../requirement/req-022.md) · References: DES-006 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: profile ปกติ/กลับทิศ; reply PWM ถูก/ผิด ID/เกินช่วง/ไม่ตอบ/stale; ท่าเดิมมีค่า

ขั้นตอน: อ่าน servo ครั้งเดียวและครบหก แล้วสร้างท่า

ผลที่คาด: ค่าตามการแปลงโปรไฟล์; ท่าใหม่มีค่าหกข้อ; ข้อใดผิด/ไม่ตอบ/นอกช่วง→ไม่แทนท่าเดิมด้วยผลบางส่วน+error

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-039"></a>

## TP001-039 — ปลด/ล็อก

AC: [AC-023-01 (กดปลดและล็อกผ่าน test bridge แล้วพบคำสั่ง enabled=false และ enabled=true…)](../requirement/req-023.md), [AC-023-02 (หลังปลดสำเร็จ การส่งท่า เล่น และอัปโหลดถูกกันไว้พร้อมข้อความให้ล็อกก่อน)](../requirement/req-023.md), [AC-023-03 (ขอ stop ขณะอยู่ในสถานะปลดแรงบิด แล้วพบคำขอ stop ก่อนคำขอล็อก)](../requirement/req-023.md) · References: DES-006 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: สถานะ torque released; stop fail; broadcast 255

ขั้นตอน: ปลด/ล็อก; ส่งท่า/เล่น/อัปโหลดหลังปลด; stop ขณะปลด

ผลที่คาด: enabled=false แล้ว enabled=true ตามลำดับ; หลังปลดถูกกันพร้อมข้อความให้ล็อก; stop ก่อนคำขอล็อก ถ้า stop fail ไม่แสดงล็อกสำเร็จ; torque เฉพาะผู้ใช้สั่งชัดเจน

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN



## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · IPC = Inter-Process Communication
