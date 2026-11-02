# TP-001 — Release และแบบข้อมูล (TP001-051–TP001-053)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-051"></a>

## TP001-051 — ติดตั้ง

AC: [AC-032-01 (ติดตั้งแพ็กเกจเดียวบนเครื่องทดสอบ macOS 15+ ทั้ง Intel และ Apple Silicon…)](../requirement/req-032.md), [AC-032-03 (ถอนแอปจาก Applications แล้วข้อมูลโครงงานใน Application Support ยังคงอยู่)](../requirement/req-032.md) · References: [DES-007 (Release และ trusted update)](../design/des-007.md), [มติ 019 (มติ Windows 11 ตามข้อเสนอแรก)](../requirement/decisions-019.md) · Level: manual · Profiles: PF-INST-MAC

เงื่อนไขก่อนตรวจ: macOS 15+ Intel และ Apple Silicon; PKG เดียว; มีโครงงานใน Application Support

ขั้นตอน: ติดตั้ง; เปิดแอปและงาน local; ถอนจาก Applications

ผลที่คาด: เปิดแอป/งาน local ได้ทั้งสอง arch จากแพ็กเกจเดียว; ถอนแล้ว Application Support ยังอยู่

หลักฐานที่ต้องเก็บ: E-INST ต่อ arch

ผลจริง: NOT_RUN

<a id="tp001-052"></a>

## TP001-052 — เทียบชื่อ/PK/ฟิลด์ร่วมหกตัว/ชนิดทุกตาราง และยืนยันไม่มี UNIQUE/FK

AC: [AC-033-01 (ตรวจหลักฐาน catalog ของ DB ที่ระบบทดสอบใช้งานแล้วพบชื่อตาราง License…)](../requirement/req-033.md), [AC-033-02 (ตรวจ catalog ของ DB เดียวกันแล้วพบ SchoolBotLicenseId เป็น Primary Key…)](../requirement/req-033.md), [AC-033-03 (ตรวจ catalog ของ DB เดียวกันแล้วพบฟิลด์มาตรฐานครบทั้งหกชื่อ…)](../requirement/req-033.md), [AC-033-04 (ตรวจ catalog ของ DB ที่ระบบทดสอบใช้งานแล้วทุกตารางข้อมูลของผลิตภัณฑ์ใช้…)](../requirement/req-033.md), [AC-033-05 (จาก catalog เดียวกัน PK ของตาราง SchoolBot ใหม่เป็น int4…)](../requirement/req-033.md) · References: data-model, BR-033, [มติ 012 (PK int4 และไฟล์ DBML)](../requirement/decisions-012.md), [มติ 030 (มติถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md) · Level: static · Profiles: PF-STATIC

เงื่อนไขก่อนตรวจ: db/schoolbot_db.sql และ schoolbot.dbml revision ปัจจุบัน (32ตาราง/450ฟิลด์/PK32; UQ0/FK0/CHECK0)

ขั้นตอน: เทียบชื่อ/PK/ฟิลด์ร่วมหกตัว/ชนิดทุกตาราง และยืนยันไม่มี UNIQUE/FK/CHECK ในร่าง

ผลที่คาด: ผลเบื้องต้นเท่านั้น ไม่ปิด AC: SchoolBotLicense/SchoolBotLicenseId int4 ตรงตัวพิมพ์; ทุกตารางขึ้นต้น SchoolBot+หกฟิลด์; PK32เป็นint4 คอลัมน์อ้างอิงเดิมชนิดคงเดิม และ UQ0/FK0/CHECK0

หลักฐานที่ต้องเก็บ: ตาราง diff+revision

ผลจริง: NOT_RUN


<a id="tp001-053"></a>

## TP001-053 — ตรวจ catalog ตาม AC

AC: AC-033-01, AC-033-02, AC-033-03, AC-033-04, AC-033-05 · References: BR-033, decisions-012 · Level: integration · Profiles: PF-CATALOG

เงื่อนไขก่อนตรวจ: catalog output จาก test DB ที่ระบบใช้ (information_schema/pg_catalog)

ขั้นตอน: ตรวจ catalog ตาม AC

ผลที่คาด: ตรงตาม AC-033-01..05 ทุกตารางจริงใน DB ทดสอบ

หลักฐานที่ต้องเก็บ: E-CAT

ผลจริง: NOT_RUN



## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · DBML = Database Markup Language · FK = Foreign Key · PK = Primary Key


## ยังไม่ยืนยัน

TP001-052 ระบุ 32 ตาราง/450 ฟิลด์/PK32 และ UQ0/FK0/CHECK0 พร้อมขั้นตอนยืนยันว่าไม่มี UNIQUE/FK/CHECK แต่ข้อความสรุปเดิมเรื่อง BL-001 ระบุ schema-notes Rev5 เป็น PK32/UQ24/CHECK80/FK40/unique index13 และบอกว่าตรง fixture เดิมของ TP001-052/053 จึงไม่แก้ case เก็บทั้งสองข้อความโดยไม่เลือกเกณฑ์แทน ต้องให้ arch/vault ยืนยัน revision และเกณฑ์ของ AC-033-01–05 ก่อนตรวจจริง
