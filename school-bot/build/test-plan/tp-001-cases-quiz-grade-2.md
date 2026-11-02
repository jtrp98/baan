# TP-001 — ข้อสอบและการส่งคะแนน (TP001-068–TP001-071)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-068"></a>

## TP001-068 — สิ้นเทอม ตรวจข้อเสนอ

AC: [AC-048-01 (สิ้นเทอม roster 2 คนได้คะแนนรวม 80 และ 0 เพราะขาดทุกงาน ระบบแสดงเฉลี่ย…)](../../modules/quiz/shared/requirements/req-048.md), [AC-048-02 (ก่อนครูยืนยัน Level ของห้องและนักเรียนทุกคนยังไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-048.md), [AC-048-03 (ครูยืนยันข้อเสนอสิ้นเทอมแล้ว เทอมปัจจุบันไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-048.md), [AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level…)](../../modules/quiz/shared/requirements/req-048.md) · References: [DES-011 (ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง)](../design/des-011.md), BR-048 · Level: integration · Profiles: PF-API, PF-WEB

เงื่อนไขก่อนตรวจ: roster [80,0 ขาดทุกงาน]; เฉลี่ย 70.00 / 70.004 / 70.01; roster ว่าง; roster เปลี่ยนระหว่างเสนอ-ยืนยัน; ครูนอกห้อง; confirm ซ้ำ

ขั้นตอน: สิ้นเทอม ตรวจข้อเสนอ; ยืนยัน

ผลที่คาด: เฉลี่ย 40 ไม่เสนอที่เกณฑ์ 70; > เกณฑ์ (strict ก่อนปัด) เสนอพร้อมเฉลี่ย/เกณฑ์; =เกณฑ์ไม่เสนอ ส่วนขาด 0; ก่อนยืนยัน Level ไม่เปลี่ยน; ยืนยันแล้วเทอมปัจจุบันเดิม เทอมถัดไปทั้งห้อง Level เดียวกัน ไม่เลือกบางคน; ROSTER_EMPTY; ไม่เปลี่ยน revision/ผลเดิม; confirm ซ้ำ idempotent; ครูนอกสิทธิ์ถูกปฏิเสธ

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-069"></a>

## TP001-069 — ดูบริบท

AC: [AC-049-01 (admin เห็นโรงเรียน/เทอม คาบ/กิจกรรม/ตัวชี้วัด วิชา/ช่องเดิม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md), [AC-049-03 (สลับโรงเรียน/เทอมแล้ว mapping ไม่ถูกใช้ข้ามบริบทอัตโนมัติ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md), [AC-049-04 (Preview ตรงคู่กิจกรรม–ช่องที่แมพ ไม่เพิ่มช่อง/เดาหมวดเอง)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) · References: [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../design/des-008.md), grade-rules-032-034, BR-049 · Level: integration · Profiles: PF-WEB, PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: school_admin จาก trusted server ตาม [มติ 035 (มติแหล่งสิทธิ์แอดมินโรงเรียน)](../../shared/decisions/decisions-035.md) รวมสมาชิกกลุ่ม active แม้ JWT IsAdmin=0, ไม่เป็นสมาชิก/ถูกถอน, superadmin เดิม และ forged body/header (Gateway Rev3 ส่วนย่อยของขอบเขตความปลอดภัย); ครู/license โรงเรียน active vs ไม่; 2 โรงเรียน/2 เทอม; ช่องเดิม. ตรวจสิทธิ์ตามสัญญา ไม่ถือ JWT/cType เป็นสิทธิ์ admin; mapping/runtime proof ยังเป็น prerequisite

ขั้นตอน: ดูบริบท; สร้างช่องใหม่; ครูสร้าง/แก้ mapping; สลับโรงเรียน/เทอม; preview

ผลที่คาด: admin เห็นโรงเรียน/เทอม/คาบ/กิจกรรม/ตัวชี้วัด/วิชา/ช่องเดิม; สร้างช่องใหม่ไม่ได้; ครูแก้ไม่ได้ (403); mapping ไม่ใช้ข้ามบริบทอัตโนมัติ; preview ตรงคู่ที่แมพ ไม่เดาหมวดจาก Quiz/Test

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-070"></a>

## TP001-070 — แมพซ้ำ (แก้ชุดเดิม/สร้างชุดใหม่)

AC: [AC-049-02 (กิจกรรม A แมพช่องวิชา X และ Y ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md), [AC-049-05 (mapping ที่ส่งแล้วแก้คู่เดิมไม่ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md) · References: DES-008, grade-rules-032-034 · Level: integration · Profiles: PF-API, PF-LEGACY

เงื่อนไขก่อนตรวจ: กิจกรรม A→ช่อง X,Y; B→X; 2 processes สร้างพร้อมกัน; mapping ที่ส่งแล้ว; retire/soft-delete/hard-delete; ชุดใหม่

ขั้นตอน: แมพซ้ำ (แก้ชุดเดิม/สร้างชุดใหม่); race; แก้/ลบคู่ที่ล็อก

ผลที่คาด: A แมพหลายช่องได้; B ซ้ำช่อง A→ปฏิเสธทั้งสองทาง; race เหลือหนึ่ง; ล็อกแล้วแก้/retire/ลบ→409 MAPPING_LOCKED; ชุดใหม่คู่/คะแนนเดิมคงเดิมยังห้ามซ้ำ

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-071"></a>

## TP001-071 — preview แล้ว confirm

AC: [AC-050-01 (preview ตรวจค่าเดิม/ใหม่และปลายทางตาม BR-050-02/03 ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md), [AC-050-03 (กิจกรรม 8/10 ไปช่องเต็ม 20 ได้ 16)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md), [AC-050-04 (เปลี่ยนคะแนนต้นทางหรือ mapping หลัง preview แล้วส่งค่าใหม่ด้วยการยืนยัน…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md) · References: [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md), grade-rules-032-034, BR-050 · Level: unit · Profiles: PF-UNIT, PF-API

เงื่อนไขก่อนตรวจ: 8/10→20; 3/4→10; 3/4→12; 7.4/7.5 boundary; ผลจริง 0; ไม่มีผล; target max parse ไม่ได้; แก้ source/mapping หลัง preview

ขั้นตอน: preview แล้ว confirm

ผลที่คาด: แสดงเดิม→ใหม่/ต้นทาง/ปลายทาง; 16, 8 (7.5 half-up), 9; 7.4→7; แต่ละช่องคำนวณจากต้นทางครั้งเดียว ค่าส่ง=preview; ผล 0 จริงส่ง 0 ไม่มีผลข้าม+เหตุผล ไม่เสนอ 0; max ผิด→TARGET_NOT_READY; แก้หลัง preview→PREVIEW_STALE ใช้ preview เก่าไม่ได้ (mock target ไม่ปิด G-PARITY/G-TARGET)

หลักฐานที่ต้องเก็บ: unit log+E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · JWT = JSON Web Token
