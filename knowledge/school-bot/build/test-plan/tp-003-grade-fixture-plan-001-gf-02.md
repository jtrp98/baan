# TP-003 — GF-02 derived totals/เกรด parity 100% + assignment semantics (G-PARITY)

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ประกอบ [TP-003 (แผน grade fixtures)](tp-003-grade-fixture-plan-001.md) ภายใต้หลักการและข้อรอระบบจริงเดียวกัน PF-GRADE คือสภาพแวดล้อมฐานคะแนนทดสอบใน [TP-001](tp-001.md#profiles) ทุก actual เป็น NOT_RUN

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-02a | เกรด/ผลรวมตรงกฎเดิม · [AC-051-04 (ส่งคะแนนในข้อมูลที่มีช่องครู override และผลพิเศษแล้วค่าคุ้มครองคงเดิม…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md), [AC-052-04 (เมื่อส่งสำเร็จบางรายการ ระบบแสดงผลจริงแยกรายการ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md)/05 | synthetic PgtgradeDetail rows บน test store ก่อน/หลังรัน writer path จริงของ SchoolBot แล้วคำนวณ derived totals/เกรด (GetScore100/ค่ารวมตาม [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md)) เทียบ golden before/after ที่คำนวณด้วยสูตรเดิม | เทียบตรง 100% ทุก cell รวมปัดเศษ/ผลพิเศษ/derived fields; รักษา override/PgtgradeEdit/ผลพิเศษ (ไม่แทนด้วยศูนย์); ช่องอื่นนอก mapping คงเดิม; before/after document hashes ตรง snapshot |
| GF-02b | assignment ไม่ใช่ increment · [AC-052-03 (ส่งรายการเดิมซ้ำรวมกรณีไม่ทราบผลครั้งก่อน คะแนนไม่บวกซ้ำและไม่เกิดผลซ้ำ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md)/04 | run export สองรอบด้วยผลเดิม/ผลใหม่ทับช่องเดิมที่มีค่าเดิมและค่าครูแก้ระหว่างรอบ | รอบสองได้ค่า assignment ใหม่ ไม่บวกซ้ำ ไม่สร้างผลซ้ำ; ไม่ส่งผลรวม SchoolBot ไปแทน GetScore100; ไม่เรียก submit/close-grade เป็นผลข้างเคียง |

วิธี/ห้ามแตะ: writer path จริงบน test store + test SchoolBot DB; เทียบ before/after hash + audit; ห้ามใช้ reader เท่านั้นเป็นหลักฐาน · ห้ามแตะ production PGGradeDB/SchoolBot DB

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ
