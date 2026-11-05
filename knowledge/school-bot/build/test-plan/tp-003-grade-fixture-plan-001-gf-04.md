# TP-003 — GF-04 ScoreData/identifier/detail row/receipt shape (G-TARGET)

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ประกอบ [TP-003 (แผน grade fixtures)](tp-003-grade-fixture-plan-001.md) ภายใต้หลักการและข้อรอระบบจริงเดียวกัน PF-GRADE คือสภาพแวดล้อมฐานคะแนนทดสอบใน [TP-001](tp-001.md#profiles) ทุก actual เป็น NOT_RUN

| id | จุดตรวจ · AC ที่ครอบ | วิธีจำลอง | Expected หลัก |
| --- | --- | --- | --- |
| GF-04a | merge ScoreData JSON exact · [AC-051-04 (ส่งคะแนนในข้อมูลที่มีช่องครู override และผลพิเศษแล้วค่าคุ้มครองคงเดิม…)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md), [AC-052-04 (เมื่อส่งสำเร็จบางรายการ ระบบแสดงผลจริงแยกรายการ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md)/05 | synthetic detail rows ที่ ScoreData มีหลายช่อง+unknown properties+ลำดับรายการเฉพาะ+ผลพิเศษ; apply แล้ว diff JSON before/after บน test store | เปลี่ยนเฉพาะ Score ของช่อง (AssessmentId+ScoreIdentifier) ที่ ownership ถูกต้องและตรง SchoolBotGradeSlot active; คงรายการอื่น/unknown properties/ลำดับรายการ/ผลพิเศษ/ค่าครู; duplicate/ambiguous→หยุด; row cardinality รายคน/ช่องไม่เพิ่ม; before/after hashes ตรง snapshot |
| GF-04b | identifier resolve จากของจริง ไม่เดา ordinal · [AC-049-01 (admin เห็นโรงเรียน/เทอม คาบ/กิจกรรม/ตัวชี้วัด วิชา/ช่องเดิม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)/04 | synthetic ที่ ordinal สลับ, NameIdentifier/MaxScoreIdentifier คนละคู่, duplicate identifier สองแถว, ช่องที่ยังไม่มี identifier | resolve จาก ScoreData จริงภายใต้ grade context เท่านั้น พบตรงหนึ่งรายการ; ห้ามเลือก array index ตาม Ordinal ห้าม MAX(id)+1 ห้ามเดาจาก NameIdentifier/ordinal; duplicate/ambiguous→หยุดไม่เลือกเอง; server derive identifier/context ไม่รับค่าที่ client ประกอบ |
| GF-04c | ไม่มีปลายทาง/ไม่สร้าง zero row · AC-049-01, [AC-050-01 (preview ตรวจค่าเดิม/ใหม่และปลายทางตาม BR-050-02/03 ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-050.md), [AC-051-05 (A ยังไม่มีผลกิจกรรมแต่ช่องเดิมมี 5 ส่งแล้วคง 5 และแสดงข้าม)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-051.md) | synthetic ที่ไม่มี detail/header/assessment ครบชุด และแถวครบแต่ assessment ถูกปิด/ช่องไม่ active | 409 TARGET_NOT_READY; ไม่สร้าง implicit zero row/ช่องคะแนน/Pgtassessment ใหม่ (สร้างช่องผ่านระบบเกรดเท่านั้น ตาม [มติ 033 (มติช่องคะแนนเดิม การแปลงคะแนนเต็ม และผลประเมินที่ยังไม่มี)](../../shared/decisions/decisions-033.md)); ค่าเดิมคงเดิม ไม่เสนอ 0 ทับ |
| GF-04d | receipt shape/ขนาด · [AC-052-03 (ส่งรายการเดิมซ้ำรวมกรณีไม่ทราบผลครั้งก่อน คะแนนไม่บวกซ้ำและไม่เกิดผลซ้ำ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-052.md)/05 | หลัง apply บน test store อ่าน PgtgradeAuditLog receipt (Application="SchoolBot", MethodName="ScoreExport.Apply", SEmp=sEmp ครูผู้ยืนยัน) | receipt ผูก OperationKey/PayloadHash/context/learner/cells ที่เขียน/before-after hashes/calculator version/ผู้ยืนยัน ครบ; ขนาด/รูป JSON บันทึกเป็นผลสรุปจาก synthetic; ReceiptId/ReceiptHash กลับมาใน Outbox ใช้ reconcile ได้ |

วิธี/ห้ามแตะ: sanitized synthetic fixtures (ตรวจ JSON/logs/diff ก่อนเข้า knowledge ตาม SA-004 Rev2); test PG store เท่านั้น; ห้ามใช้ ScoreData/identifier/ขนาดจาก PGGradeDB จริง · ห้ามสร้าง Pgtassessment ใน test store นอกจาก restore schema เดิม

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · BR = Business Rule หรือกฎธุรกิจ
