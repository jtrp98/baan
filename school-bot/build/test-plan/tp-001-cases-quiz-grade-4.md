# TP-001 — ข้อสอบและการส่งคะแนน (TP001-076–TP001-076)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-076"></a>

## TP001-076 — ส่งแล้วตรวจ audit ฝั่ง SchoolBot และ PgtgradeAuditLog

AC: [AC-052-05 (ตรวจรายการส่งแล้วพบ audit ครบ BR-052-03)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) · References: [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md), [BR-052-03 (audit อ้างต้นทางและ revision, mapping ที่ใช้, ปลายทาง, เดิม/ใหม่,…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md), [BR-052-04 (แก้เฉพาะช่อง SchoolBot)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md), [BR-052-05 (backend ที่เขียนคะแนนอยู่ฝั่ง SchoolBot ไม่เรียก service score-record เดิม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md) · Level: integration · Profiles: PF-GRADE

เงื่อนไขก่อนตรวจ: ข้อมูลที่มี override/ผลพิเศษ; ตัวอย่างกฎเดิม derived totals/เกรด เทียบ score-record และรายงานเดิม

ขั้นตอน: ส่งแล้วตรวจ audit ฝั่ง SchoolBot และ PgtgradeAuditLog

ผลที่คาด: audit ครบ BR-052-03 (ต้นทาง+revision, mapping, ปลายทาง, เดิม/ใหม่, ผู้ยืนยัน, เวลา, การแก้ชน, ผลส่ง); ผลรวม/เกรดตรงกฎเดิม; ช่องอื่นคงเดิม; ไม่เรียก score-record service

หลักฐานที่ต้องเก็บ: E-API+PG diff+parity report

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ
