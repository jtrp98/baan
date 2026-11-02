# TP-001 — Desktop และโครงงาน (TP001-011–TP001-015)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-011"></a>

## TP001-011 — ย่อ สลับเต็มจอ ปิดหน้าต่างจากปุ่มในแอป

AC: [AC-009-03 (ใน Desktop ผู้ใช้ย่อ สลับเต็มจอ และขอปิดหน้าต่างจากแอปได้)](../requirement/req-009.md) · References: [DES-001 (Desktop host และ IPC)](../design/des-001.md), BR-009 · Level: manual · Profiles: PF-UI-WIN, PF-UI-MAC

เงื่อนไขก่อนตรวจ: entitlement valid

ขั้นตอน: ย่อ สลับเต็มจอ ปิดหน้าต่างจากปุ่มในแอป; ปิดขณะ dirty

ผลที่คาด: ทำได้ครบ; ปิดผ่าน close guard

หลักฐานที่ต้องเก็บ: E-UI วิดีโอ

ผลจริง: NOT_RUN

<a id="tp001-012"></a>

## TP001-012 — สลับ th→en→zh

AC: [AC-010-01 (ผู้ใช้เปลี่ยนไทย/อังกฤษ/จีนได้โดยไม่ต่อเครือข่าย…)](../requirement/req-010.md), [AC-010-02 (หลังเปลี่ยนภาษา งานที่ยังไม่บันทึก ลำดับบล็อก…)](../requirement/req-010.md), [AC-010-03 (เมื่อ storage ใช้งานได้ เปิดแอปใหม่แล้วใช้ภาษาที่เลือกครั้งล่าสุด)](../requirement/req-010.md) · References: DES-001 · Level: E2E · Profiles: PF-UI-WIN, PF-PREVIEW

เงื่อนไขก่อนตรวจ: network ปิด; Block ที่ยังไม่บันทึก มีลำดับบล็อก/ชื่อที่ผู้ใช้ตั้ง; storage ปกติ/ใช้ไม่ได้; ค่าภาษาที่เก็บ: th/en/zh/ค่าไม่รองรับ/ว่าง

ขั้นตอน: สลับ th→en→zh; เปิดแอปใหม่ในแต่ละกรณี

ผลที่คาด: ข้อความควบคุมเปลี่ยนตาม offline; งาน/ลำดับ/ชื่อไม่เปลี่ยน ไม่ remount (instance เดิม); เปิดใหม่ใช้ภาษาล่าสุด; ค่าไม่รองรับ/ว่าง/storage ล้ม→ไทย; i18n keys ครบสามภาษา

หลักฐานที่ต้องเก็บ: E-UI+E-TRACE

ผลจริง: NOT_RUN

<a id="tp001-013"></a>

## TP001-013 — เลือก mode อื่น→ยกเลิก/ยืนยัน

AC: [AC-012-01 (เมื่ออยู่ระหว่างทำงานใน mode แล้วเลือก mode อื่น มีคำยืนยัน)](../requirement/req-012.md), [AC-012-02 (เมื่อเลือก Save แล้วออกและจำลอง storage ล้มเหลว…)](../requirement/req-012.md), [AC-012-03 (เมื่อจำลอง close guard ล้มเหลว หน้าต่างยังเปิดและแสดงเหตุผลให้ผู้ใช้เห็น)](../requirement/req-012.md) · References: DES-001, [DES-003 (หลายโครงงาน Local/Cloud)](../design/des-003.md) · Level: integration · Profiles: PF-HOST, PF-UI-WIN

เงื่อนไขก่อนตรวจ: งาน dirty; inject storage fail; inject close-guard fail

ขั้นตอน: เลือก mode อื่น→ยกเลิก/ยืนยัน; Save แล้วออกเมื่อ storage fail; ปิดหน้าต่างเมื่อ guard fail

ผลที่คาด: มีคำยืนยัน ยกเลิกแล้วอยู่เดิม; save fail→ไม่ออก แสดงข้อความล้มเหลว; guard fail→หน้าต่างเปิด แสดงเหตุผล; ไม่มีสูญเสีย draft

หลักฐานที่ต้องเก็บ: E-TRACE+E-UI

ผลจริง: NOT_RUN

<a id="tp001-014"></a>

## TP001-014 — เปิดไม่มี preview

AC: [AC-013-01 (เปิด browser โดยไม่มี preview=1 และไม่มี bridge แล้วพบข้อผิดพลาด native…)](../requirement/req-013.md), [AC-013-02 (ใน preview บันทึกงานได้ใน browser แต่ activate และตรวจอัปเดตไม่เรียก API…)](../requirement/req-013.md), [AC-013-03 (ทดลอง LearnMap, Teacher restart/reset/console และ USB…)](../requirement/req-013.md) · References: DES-001, [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md) · Level: E2E · Profiles: PF-PREVIEW, PF-UI-WIN

เงื่อนไขก่อนตรวจ: browser ไม่มี preview=1/ไม่มี bridge; preview=1; network spy+device-command spy+FS spy

ขั้นตอน: เปิดไม่มี preview; ใน preview บันทึก/activate/check update; LearnMap, Teacher restart/reset/console, USB ตัวอย่าง

ผลที่คาด: ไม่มี preview→ข้อผิดพลาด native bridge ไม่มีผลสำเร็จจำลอง; preview บันทึกใน browser ได้ activate/check ไม่เรียก API จริง (request=0); ไม่มีคำสั่งอุปกรณ์ ไม่มีไฟล์ USB คัดลอก ไม่มีผลประเมินถาวร

หลักฐานที่ต้องเก็บ: E-TRACE+E-UI

ผลจริง: NOT_RUN

<a id="tp001-015"></a>

## TP001-015 — บันทึก/เปิดทุกงาน

AC: [AC-011-01 (บันทึกอย่างน้อยสองงานต่อโหมด Block/Arm/Code ทั้ง Guest และ Login…)](../requirement/req-011.md), [AC-011-02 (บันทึกการแก้ไขงาน A แล้วเปิดใหม่ได้ค่าล่าสุดของ A โดยงาน B…)](../requirement/req-011.md) · References: DES-003 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: Guest local: 2+ งานต่อ Block/Arm/Code

ขั้นตอน: บันทึก/เปิดทุกงาน; แก้ A แล้วเปิดใหม่; บันทึกพร้อมกัน 2 writers; kill ระหว่างเขียน

ผลที่คาด: เปิดครบไม่ปะปน; A ได้ค่าล่าสุด B ไม่เปลี่ยน; per-project lock+atomic replace ไม่มีไฟล์เสีย; ผลตอบเก่าไม่ล้าง dirty ใหม่

หลักฐานที่ต้องเก็บ: E-TRACE+ไฟล์ before/after hash

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · E2E = End-to-End หรือการตรวจครบเส้นทาง · IPC = Inter-Process Communication
