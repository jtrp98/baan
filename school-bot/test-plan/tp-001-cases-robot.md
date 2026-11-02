# TP-001 — การเชื่อมต่อและควบคุมหุ่น (TP001-031–TP001-035)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-031"></a>

## TP001-031 — เปิด native ใหม่

AC: [AC-014-01 (เปิด native ใหม่แล้วไม่แสดงว่าหุ่นเชื่อมต่ออยู่โดยอัตโนมัติ)](../requirement/req-014.md), [AC-014-02 (เมื่อไม่เลือกอุปกรณ์หรือไม่ยืนยันโปรไฟล์ การกดเชื่อมต่อไม่สำเร็จ)](../requirement/req-014.md), [AC-014-03 (ใช้ test device ที่ไม่ตอบ probe แล้วไม่เข้าสถานะ connected)](../requirement/req-014.md) · References: [DES-006 (หุ่นจริง Windows/macOS)](../design/des-006.md) · Level: integration · Profiles: PF-HOST, PF-UI-WIN

เงื่อนไขก่อนตรวจ: fake device list; profile ยังไม่ยืนยัน/ยืนยัน; device ไม่ตอบ/ตอบ probe

ขั้นตอน: เปิด native ใหม่; กด connect โดยไม่เลือกอุปกรณ์/ไม่ยืนยันโปรไฟล์; probe ไม่ตอบ/ตอบ

ผลที่คาด: ไม่ connected อัตโนมัติ; connect fail; probe ไม่ตอบไม่เข้า connected ตอบจึงเข้า; trace มีแค่ device.list/board.info ไม่มี servo.set/group/torque

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-032"></a>

## TP001-032 — validate

AC: [AC-015-01 (โปรไฟล์ที่มี ID ซ้ำ, servo ไม่ครบหก, PWM นอกช่วง หรือปลาย PWM เท่ากัน…)](../requirement/req-015.md), [AC-015-02 (โปรไฟล์ที่ถูกต้องและกำหนด PWM กลับทิศผ่านการตรวจรูปแบบได้)](../requirement/req-015.md), [AC-015-03 (เมื่อแก้ชื่อโปรไฟล์หรือค่า servo หลังยืนยัน ต้องยืนยันใหม่ก่อนเชื่อมต่อ)](../requirement/req-015.md) · References: DES-006 · Level: unit · Profiles: PF-UNIT, PF-UI-WIN

เงื่อนไขก่อนตรวจ: profile: ID ซ้ำ; servo 5/6/7; ID 0/254/255; PWM 499/500/2500/2501; pwmMin==pwmMax; กลับทิศ (min>max)

ขั้นตอน: validate; แก้ชื่อ/ค่า servo หลังยืนยัน

ผลที่คาด: ซ้ำ/≠6/นอกช่วง/ปลายเท่ากัน→ปฏิเสธก่อนเชื่อมต่อ; ถูกต้องและกลับทิศผ่าน; แก้แล้วต้องยืนยันใหม่ก่อน connect

หลักฐานที่ต้องเก็บ: unit log+E-UI

ผลจริง: NOT_RUN

<a id="tp001-033"></a>

## TP001-033 — ส่งท่า

AC: [AC-016-01 (เมื่อ disconnected หรือปลดแรงบิด…)](../requirement/req-016.md), [AC-016-02 (เมื่อจำลองการส่งล้มเหลว ภาพไม่เริ่มเคลื่อนไปตามท่าราวกับส่งสำเร็จ…)](../requirement/req-016.md), [AC-016-03 (ปรับข้อต่อถี่ผ่าน test bridge แล้ว trace มีคำสั่งทำงานครั้งละหนึ่งรายการ)](../requirement/req-016.md) · References: DES-006 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: สถานะ disconnected/torque released; send fail inject; fake engine หน่วงตอบ

ขั้นตอน: ส่งท่า; ปรับข้อต่อถี่ N≥20 ครั้งระหว่างงานค้าง

ผลที่คาด: ไม่มีคำสั่งเคลื่อนไหว+ข้อความอธิบาย; fail→ภาพไม่เคลื่อนราวสำเร็จ+error; trace มีครั้งละ 1 คำขอ coalesce ค่าล่าสุด ค่าสุดท้าย=ค่าล่าสุดที่ยอมรับ; servo.set ต้อง pwm+bias อยู่ 500–2500, time_ms 0–9999; baud จาก allowlist (default 115200); read_ms 1–1500 (UI movement/stop=1, probe/read=1000); unknown envelope keys/float แทน integer/NaN→ปฏิเสธก่อนส่ง

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-034"></a>

## TP001-034 — เล่นลำดับ

AC: [AC-018-01 (ให้สองท่าและสองรอบผ่าน test bridge แล้วพบการส่งตามลำดับเดิมครบสี่ท่า)](../requirement/req-018.md), [AC-018-02 (เมื่อการส่งท่าแรกผิดพลาด ไม่มีการส่งท่าที่สองต่อ และผู้ใช้เห็นข้อผิดพลาด)](../requirement/req-018.md), [AC-018-03 (เมื่อส่งครบและเวลาครบ แอปแสดงจบการส่งลำดับ…)](../requirement/req-018.md) · References: DES-006 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: 2 ท่า 2 รอบ; ท่าแรก send fail; loops 1/9999; 0 ท่า

ขั้นตอน: เล่นลำดับ

ผลที่คาด: ส่ง 4 ท่าตามลำดับเดิม; ท่าแรกผิดไม่ส่งท่า 2 แสดง error; จบแสดงจบการส่ง ไม่อ้างหุ่นยืนยันเคลื่อนจบ; 0 ท่าเล่นไม่ได้

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-035"></a>

## TP001-035 — upload

AC: [AC-019-01 (อัปโหลดห้าท่าผ่าน test bridge แล้วพบสองคำขอ ขนาดสี่และหนึ่งท่า ตามลำดับ)](../requirement/req-019.md), [AC-019-02 (ระหว่างรอคำตอบ progress ยังไม่เพิ่ม)](../requirement/req-019.md), [AC-019-03 (เมื่อชุดแรกผิดพลาด ไม่มีชุดที่สอง และไม่มีผลยืนยันว่าข้อมูลครบหรือ…)](../requirement/req-019.md) · References: DES-006 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: 5 ท่า; ชุดแรก fail/ตอบช้า/ตอบซ้ำ; 1,4,5,8,10000,10001 ท่า

ขั้นตอน: upload

ผลที่คาด: 2 คำขอขนาด 4 และ 1; progress คงเดิมจนชุดแรกตอบแล้วเป็น 4; ชุดแรก fail→ไม่มีชุดสอง ไม่มี verified/complete และ session บอร์ด invalid; 10001→ปฏิเสธ; envelope หนึ่งบรรทัด ≤65536 UTF-8 bytes; group.index 0–9999 ไม่ซ้ำใน batch; items ≤32; invalid→`INVALID_INPUT`/`SAFETY_LIMIT` ก่อนส่ง ห้าม clamp ให้เคลื่อนเงียบ; UI แบ่ง ≤4 groups/คำขอ

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN



## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ
