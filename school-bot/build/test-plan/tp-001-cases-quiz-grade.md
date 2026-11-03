# TP-001 — ข้อสอบและการส่งคะแนน (TP001-063–TP001-067)

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — แยกเคส normal/full ก่อนพัฒนาและตรวจรับ)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-063"></a>

## TP001-063 — เปิด/ทำ

ระดับ: normal

เฉพาะ BE-030/AC-046-01: อ่าน policy สี่ด้านตามรายละเอียด TP001-063 ใน tp-001-cases-quiz-grade-bank-cases.md; ไม่จัดระดับใหม่ให้ AC-046-02/05 ของ BE-031/032 อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-046-01 (เปิด Quiz และ Test แล้วตรวจ policy ทั้งสี่ด้านที่กำหนดไว้ของแต่ละรายการได้)](../../modules/quiz/shared/requirements/req-046.md), [AC-046-02 (Quiz/Test ที่ไม่ปรับค่าใช้ BR-046-05)](../../modules/quiz/shared/requirements/req-046.md), [AC-046-05 (ครูแก้เวลาสอบ/ช่วงเปิด–ปิดได้)](../../modules/quiz/shared/requirements/req-046.md) · References: [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](../design/des-010.md), learning-rules-032-034, BR-046 · Level: integration · Profiles: PF-API, PF-WEB

เงื่อนไขก่อนตรวจ AC-046-01 ของ BE-030: ใช้ [actors/stores/fixture](tp-001-cases-quiz-grade-bank.md) และ [TP001-063 แบบรันตามได้](tp-001-cases-quiz-grade-bank-cases.md#tp001-063-detail) พร้อม response/state counts ทุกส่วน; AC-046-02/05 ของ BE-031/032 คง fixture Quiz/Test ไม่ปรับ และ PolicyOverride ครูเปลี่ยนเวลา/OpensAt/ClosesAt เทียบ attempts/random/reveal/ข้อ/เฉลย ไม่ขยาย scope BE-030

ขั้นตอน: เปิด/ทำ; ลองเกินจำนวนครั้ง/เกินเวลา; ครูปรับค่าต่าง ๆ; null; Test ไม่มีเวลา; OpensAt>=ClosesAt

ผลที่คาด: policy สี่ด้านตรวจได้; ค่าเริ่ม Quiz ไม่จำกัด/เฉลยทันที/สูงสุด, Test 1 ครั้ง/จับเวลา/สุ่ม/เฉลยหลังปิด; จำกัดครั้ง/เวลา/เฉลยตรงค่า (server); ครูแก้ได้เฉพาะเวลา/ช่วงเปิด–ปิด; อื่น→403 POLICY_OVERRIDE_NOT_ALLOWED ไม่บันทึกบางส่วน; null กลับ default

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-064"></a>

## TP001-064 — ทำ attempt

ระดับ: normal

เฉพาะ BE-030/AC-046-04: แก้และ publish revision ใหม่แล้วอ่านประวัติเดิมตามรายละเอียด TP001-064 ใน tp-001-cases-quiz-grade-bank-cases.md; AC-046-03 ของ BE-031 คงเดิม อ่าน [ตาราง normal พร้อม setup/ผล](tp-001-normal-index.md)


AC: [AC-046-03 (รายการที่กำหนดสุ่มข้อ แสดงประวัติชุดและลำดับข้อที่ผู้เรียนได้รับจริงได้)](../../modules/quiz/shared/requirements/req-046.md), [AC-046-04 (แก้คลังเป็น revision ใหม่แล้วประวัติการทำเดิมยังอ้าง snapshot…)](../../modules/quiz/shared/requirements/req-046.md) · References: DES-010, [BR-046-02 (คลังข้อสอบมี revision)](../../modules/quiz/shared/requirements/req-046.md), [BR-046-03 (แต่ละการทำเก็บ snapshot ข้อที่ได้รับ ลำดับ เกณฑ์ตรวจ และ policy ที่ใช้)](../../modules/quiz/shared/requirements/req-046.md) · Level: integration · Profiles: PF-API

เงื่อนไขก่อนตรวจ AC-046-04 ของ BE-030: ใช้ [actors/stores/fixture](tp-001-cases-quiz-grade-bank.md) และ [TP001-064 แบบรันตามได้](tp-001-cases-quiz-grade-bank-cases.md#tp001-064-detail) พร้อม seeded history/read-back ใหม่; AC-046-03 ของ BE-031 คงรายการสุ่มข้อและ override หลัง attempt เริ่ม แยกการเริ่ม/ส่ง attempt จริงจาก bank contract stub

ขั้นตอน: ทำ attempt; แก้ bank/override

ผลที่คาด: แสดงชุดและลำดับที่ได้รับจริงต่อ attempt; ประวัติเดิมอ้าง snapshot/เกณฑ์เดิม ผลเดิมไม่เปลี่ยน; override ใหม่ไม่เปลี่ยน deadline/เฉลยของ attempt ที่เริ่มแล้ว

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-065"></a>

## TP001-065 — เปิดซ่อมให้ A

AC: [AC-046-06 (เปิดซ่อมให้ A แล้ว B ไม่ได้สิทธิ์)](../../modules/quiz/shared/requirements/req-046.md) · References: DES-010, [BR-046-06 (Test ใช้คะแนนสูงสุดครั้งจริง/ซ่อม ไม่มีเพดาน (decisions-025))](../../modules/quiz/shared/requirements/req-046.md), [มติ 025 (มติ auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../../shared/decisions/decisions-025.md) · Level: integration · Profiles: PF-API

เงื่อนไขก่อนตรวจ: นักเรียน A,B; Test 1 ครั้ง; ผล A=6/10; ซ่อม 9/10 และ 4/10; grant 1 ใบ

ขั้นตอน: เปิดซ่อมให้ A; A/B เริ่ม attempt; A ส่ง 2 requests พร้อมกัน/retry

ผลที่คาด: B ไม่ได้สิทธิ์; A ใช้ 9/10 ไม่มีเพดาน; ซ่อมต่ำกว่าเดิมคงสูงสุด 6/10; grant ถูกใช้ 1 ครั้ง (lock CourseRun) retry ไม่กินซ้ำ

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-066"></a>

## TP001-066 — ตั้งค่า/เรียกดู

AC: [AC-047-01 (ครูตั้ง A ให้นับ Quiz และ B ไม่นับ แล้วเห็นค่ารายหลักสูตร)](../../modules/quiz/shared/requirements/req-047.md), [AC-047-02 (Quiz ของ B มีผลให้ดูและน้ำหนัก 0)](../../modules/quiz/shared/requirements/req-047.md), [AC-047-03 (ครูกำหนดสัดส่วน A แล้วเรียกดูสัดส่วนที่บันทึกได้ โดยไม่เปลี่ยน B)](../../modules/quiz/shared/requirements/req-047.md) · References: DES-010, BR-047 · Level: integration · Profiles: PF-API, PF-WEB

เงื่อนไขก่อนตรวจ: หลักสูตร A,B; weights 99.99/100/100.01/ติดลบ/ซ้ำ/ขาดกิจกรรม/instruction เป็น source; quiz_counts true/false

ขั้นตอน: ตั้งค่า/เรียกดู; เปลี่ยนคะแนน Quiz ของ B

ผลที่คาด: เห็นค่ารายหลักสูตร; บันทึกได้เมื่อรวม 100% เท่านั้น (อื่น→SCORING_WEIGHT_INVALID); Quiz ไม่นับน้ำหนัก 0 ยังดูผลได้ คะแนนรวม B ไม่เปลี่ยน; ตั้ง A ไม่กระทบ B

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-067"></a>

## TP001-067 — คำนวณ

AC: [AC-047-04 (กิจกรรม 8/10 น้ำหนัก 20%, Quiz 6/10 น้ำหนัก 30%, Test 18/20 น้ำหนัก 50%…)](../../modules/quiz/shared/requirements/req-047.md), [AC-047-05 (เปลี่ยนน้ำหนักจาก 20/30/50 เป็น 30/20/50 แล้ว CourseRun เดิมยังได้…)](../../modules/quiz/shared/requirements/req-047.md) · References: DES-010, learning-rules-032-034, [BR-047-04 (คะแนนรวม 0–100 = SUM((earned_i/max_i) × weight_i) โดย weight…)](../../modules/quiz/shared/requirements/req-047.md) · Level: unit · Profiles: PF-UNIT, PF-API

เงื่อนไขก่อนตรวจ: 8/10@20, 6/10@30, 18/20@50; แล้ว 30/20/50; ค่าหารไม่ลงตัว; max=0; earned>max; CourseRun planned/active; policy NULL

ขั้นตอน: คำนวณ; แก้น้ำหนักก่อน/หลังเริ่ม run

ผลที่คาด: 79/100 แสดง 16+18+45; run เดิมยัง 79 (แก้หลังเริ่ม→409 SCORING_POLICY_FROZEN); run ใหม่ 30/20/50 ได้ 81; ไม่ปัดรายส่วน; max<=0/earned>max ปฏิเสธ; NULL→POLICY_NOT_CONFIGURED (ตัวเลขทดสอบ ไม่ใช่ค่าเริ่ม)

หลักฐานที่ต้องเก็บ: unit log+E-API

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
