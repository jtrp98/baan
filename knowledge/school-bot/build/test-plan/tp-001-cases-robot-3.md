# TP-001 — การเชื่อมต่อและควบคุมหุ่น (TP001-040–TP001-045)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-040"></a>

## TP001-040 — หายขณะ idle

AC: [AC-024-01 (จำลองอุปกรณ์หายจาก discovery ขณะ idle แล้วสถานะเปลี่ยนเป็น lost…)](../../modules/arm-lab/shared/requirements/req-024.md), [AC-024-02 (จำลอง transport error ระหว่างส่งท่าแล้วเห็นข้อผิดพลาดและไม่มีการส่งท่าเด…)](../../modules/arm-lab/shared/requirements/req-024.md), [AC-024-03 (เชื่อมต่อใหม่หลัง lost แล้วไม่มีคำสั่งเคลื่อนไหวจนผู้ใช้สั่ง)](../../modules/arm-lab/shared/requirements/req-024.md) · References: [DES-006 (หุ่นจริง Windows/macOS)](../design/des-006.md) · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: discovery inject หายขณะ idle; TRANSPORT_ERROR/DEVICE_TIMEOUT/ENGINE_TIMEOUT/ENGINE_BUSY/ENGINE_CANCELLED

ขั้นตอน: หายขณะ idle; error ระหว่างส่งท่า; reconnect

ผลที่คาด: สถานะ lost+ทางเชื่อมใหม่; error แล้วไม่ส่งท่าเดิมซ้ำ (นับ=1); reconnect probe ใหม่ ไม่ replay upload/ไม่เคลื่อนจนผู้ใช้สั่ง; busy/cancelled อย่างเดียวไม่เป็น lost; ตาม robot-boundary Rev1 — poll **3000 ms/debounce 0 หนึ่งผลสำเร็จที่ไม่พบ target→DEVICE_NOT_FOUND/lost **; ไม่ซ้อน poll ขณะ busy/stopping; ผลเก่าหลังสลับ target/unmount/generation เปลี่ยนต้องถูกทิ้ง; lost invalidate uploaded session/งานค้าง+แสดง reconnect; reconnect probe ใหม่ ไม่ auto movement; poll failure แสดง discovery error โดยไม่ตีความ cable loss; busy/cancelled ไม่เปลี่ยน connected

หลักฐานที่ต้องเก็บ: E-TRACE

ผลจริง: NOT_RUN


<a id="tp001-041"></a>

## TP001-041 — ตามขั้นตอนที่ผู้อนุญาตกำหนด: probe→connect→คำสั่งควบคุมที่อนุญาตผ

AC: [AC-031-05 (บน Windows 11 25H2 x64 กับหุ่นที่ผ่านการยืนยันรุ่นแล้ว…)](../../modules/app-shell/shared/requirements/req-031.md) · References: DES-006, OQ-008 · Level: manual · Profiles: PF-HW-WIN-SRC

เงื่อนไขก่อนตรวจ: หุ่นรุ่นที่ผู้รับรองยืนยัน; profile+calibration ที่ลงนาม; HID และ Serial; emergency-stop พร้อม

ขั้นตอน: ตามขั้นตอนที่ผู้อนุญาตกำหนด: probe→connect→คำสั่งควบคุมที่อนุญาตผ่าน native transport (ไม่ใช้ dry-run)

ผลที่คาด: เชื่อมต่อและส่งคำสั่งจริงได้ ผล exchange delivery=written acknowledged=false bytes_written/read>0; ไม่ใช่ simulated

หลักฐานที่ต้องเก็บ: E-HW

ผลจริง: NOT_RUN

<a id="tp001-042"></a>

## TP001-042 — เช่น TP001-041 จากแอปที่ติดตั้ง

AC: AC-031-05 · References: DES-006, [DES-007 (Release และ trusted update)](../design/des-007.md) · Level: manual · Profiles: PF-HW-WIN-INST

เงื่อนไขก่อนตรวจ: เช่น TP001-041 แต่ติดตั้งจาก signed installer

ขั้นตอน: เช่น TP001-041 จากแอปที่ติดตั้ง

ผลที่คาด: เช่น TP001-041 (หลักฐานแยกจาก source-built)

หลักฐานที่ต้องเก็บ: E-HW+E-INST

ผลจริง: NOT_RUN

<a id="tp001-043"></a>

## TP001-043 — probe→connect→ส่งคำสั่งตามที่อนุญาต

AC: [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon…)](../../modules/app-shell/shared/requirements/req-032.md) · References: DES-006, [มติ 008 (Windows และ macOS ควบคุมหุ่นจริง — 2026-10-21)](../../shared/decisions/decisions-008.md) · Level: manual · Profiles: PF-HW-MAC-INTEL-SRC, PF-HW-MAC-ARM-SRC

เงื่อนไขก่อนตรวจ: หุ่นรุ่นที่ยืนยัน; Darwin HID และ Serial; แยกผลต่อ arch

ขั้นตอน: probe→connect→ส่งคำสั่งตามที่อนุญาต; ลอง path พิมพ์เอง/device ที่ถูกถอด (negative)

ผลที่คาด: เชื่อมต่อและส่งคำสั่งจริงผ่าน native transport บนทั้ง Intel และ ARM แยกผล; ไม่ใช้ simulator; path นอก enumeration ถูกปฏิเสธ

หลักฐานที่ต้องเก็บ: E-HW ต่อ arch

ผลจริง: NOT_RUN

<a id="tp001-044"></a>

## TP001-044 — เช่น TP001-043 จากแอปที่ติดตั้ง Intel และ ARM

AC: AC-032-02 · References: DES-006, DES-007 · Level: manual · Profiles: PF-HW-MAC-INST

เงื่อนไขก่อนตรวจ: เช่น TP001-043 จาก signed/notarized PKG

ขั้นตอน: เช่น TP001-043 จากแอปที่ติดตั้ง Intel และ ARM

ผลที่คาด: เช่น TP001-043 (แยกหลักฐานจาก source-built)

หลักฐานที่ต้องเก็บ: E-HW+E-INST

ผลจริง: NOT_RUN

<a id="tp001-045"></a>

## TP001-045 — unplug/replug ขณะ idle และส่งท่า

AC: [AC-014-03 (ใช้ test device ที่ไม่ตอบ probe แล้วไม่เข้าสถานะ connected)](../../modules/arm-lab/shared/requirements/req-014.md), [AC-019-03 (เมื่อชุดแรกผิดพลาด ไม่มีชุดที่สอง และไม่มีผลยืนยันว่าข้อมูลครบหรือ…)](../../modules/arm-lab/shared/requirements/req-019.md), [AC-021-01 (ระหว่างเล่นผ่าน test bridge เมื่อกดหยุด พบการยกเลิกและจบงานค้างก่อนคำขอ…)](../../modules/arm-lab/shared/requirements/req-021.md), [AC-021-03 (เมื่อส่ง stop ล้มเหลว ผู้ใช้เห็นข้อผิดพลาดและไม่มีข้อความยืนยันว่าหุ่นหย…)](../../modules/arm-lab/shared/requirements/req-021.md), AC-024-01, AC-024-02 · References: DES-006, quality-attributes · Level: manual · Profiles: PF-HW-WIN-SRC, PF-HW-MAC-INTEL-SRC, PF-HW-MAC-ARM-SRC

เงื่อนไขก่อนตรวจ: หุ่นจริง HID/Serial; ผู้รับรองอนุญาต motion/upload/torque เป็นลายลักษณ์อักษร

ขั้นตอน: unplug/replug ขณะ idle และส่งท่า; ดาวน์โหลดไม่ครบ; stale serial reply; stop ระหว่างเล่น (วัด latency)

ผลที่คาด: พฤติกรรม logic ตรง AC ตามจริง (lost, ไม่ retry, ไม่ verified, stop_requested ≠ stopped); latency/พฤติกรรมกายภาพ = observation ไม่มี threshold (GAP-05)

หลักฐานที่ต้องเก็บ: E-HW

ผลจริง: NOT_RUN



## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · HID = Human Interface Device · SLA = Service Level Agreement


## ยังไม่ยืนยัน

poll 3000 ms/debounce 0 ยังเป็นสมมติฐาน ต้องให้ arch/เจ้าของสัญญายืนยันก่อน runtime; cadence ไม่ใช่ stop latency หรือ hardware SLA
