# TP-001 — บทเรียนและผลประเมิน (TP001-062–TP001-062)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-062"></a>

## TP001-062 — import

AC: [AC-045-01 (นำเข้าแถว D=TRUE แล้วเห็นเป็น draft…)](../requirement/req-045.md), [AC-045-02 (เปลี่ยนเฉพาะ O ในข้อมูลทดสอบแล้วข้อมูลหลักสูตรที่นำเข้าไม่เปลี่ยน)](../requirement/req-045.md), [AC-045-03 (แถวที่มีสื่อทั้งสองชุดแสดงสื่อครบภายใต้ Lesson เดิม โดยไม่เกิด…)](../requirement/req-045.md), [AC-045-04 (นำเข้าแถวที่เลข C ไม่ตรง Unit ในชื่อแผนแล้วแสดงรหัส Lesson แยกจากทั้งสองค่า)](../requirement/req-045.md) · References: [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md), BR-045, source-review-003 · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: Course Plan Sheet sanitized: D=TRUE/FALSE, เปลี่ยนเฉพาะ O, มีสื่อ P–X, C ไม่ตรง Unit, สลับลำดับแถว, แถวว่าง/คอลัมน์ขาด

ขั้นตอน: import

ผลที่คาด: ทุกแถว draft; D=TRUE ติดป้ายอนุมัติจากต้นทาง ไม่ publish เอง; O เปลี่ยนไม่กระทบ; P–X เป็นสื่อชุดสองของ Lesson เดิม ไม่สร้าง Course/Level; รหัส Lesson แยกจาก C และ Unit คงเดิมเมื่อสลับ; แถวผิดรูปแบบรายงานรายแถว

หลักฐานที่ต้องเก็บ: E-API+sheet hash

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
