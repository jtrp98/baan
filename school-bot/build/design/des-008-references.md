# DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright — เอกสารอ้างอิง

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 044 — SQL constraints เหลือเฉพาะ Primary Key)

ส่วนต่อของ [DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright](des-008.md) รวมข้อกำหนดและมติที่สัญญานี้อ้าง แต่ละรายการระบุความหมายจากชื่อเรื่องต้นทาง

- [REQ-049 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [REQ-043 (หลักสูตรกลางแบบ Level และ Activity)](../../modules/quiz/shared/requirements/req-043.md)
- [มติ 020 (หลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../../shared/decisions/decisions-020.md)
- [มติ 021 (การส่งคะแนนเข้าระบบเกรด SchoolBright)](../../shared/decisions/decisions-021.md)
- [มติ 022 (ที่อยู่ของหน้าจอ Admin / ครู / Desktop)](../../shared/decisions/decisions-022.md)
- [มติ 023 (writer คะแนน, ปัดเศษ, นำเข้า Sheet และเจ้าของ mapping)](../../shared/decisions/decisions-023.md)
- [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../../shared/decisions/decisions-024.md)
- [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../../shared/decisions/decisions-025.md)
- [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../../shared/decisions/decisions-026.md)
- [มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../../shared/decisions/decisions-027.md)
- [มติ 028 (ชนิดคอลัมน์ CreateBy/UpdateBy)](../../shared/decisions/decisions-028.md)
- [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md)
- [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../../shared/decisions/decisions-030.md)
- [BR-049-01 (แมพคาบ/กิจกรรม/ตัวชี้วัด→วิชา/Pgtassessment ตามโรงเรียน/เทอม; ใช้ช่องเดิม ช่องใหม่สร้างผ่านระบบเกรดก่อน)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [AC-049-01 (admin เห็นโรงเรียน/เทอม คาบ/กิจกรรม/ตัวชี้วัด วิชา/ช่องเดิม; สร้างช่องใหม่ไม่ได้ ครูสร้าง/แก้ mapping ไม่ได้)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [BR-043-02 (Course หนึ่งชุดเป็นหนึ่ง Level ต่อภาคเรียนประมาณ 22 สัปดาห์; Level เรียงจาก Beginner ถึง Expert เป็นแกน ระดับชั้นเป็นค่าเริ่มต้น และผูกวิชาได้)](../../modules/quiz/shared/requirements/req-043.md)
- [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](des-005.md)
- [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md)
- [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md)
- [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

- [BR-049-02 (กิจกรรมหนึ่งได้หลายช่องข้ามวิชา แต่ช่องหนึ่งในบริบทโรงเรียน/เทอม/วิชารับกิจกรรมเดียว ไม่รวมหลายกิจกรรม (decisions-032))](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [BR-049-03 (Pgtassessment คือช่องคะแนน ไม่ใช่ตัวชี้วัดมาตรฐาน; แสดงตาม mapping)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [BR-049-04 (ส่งเฉพาะช่องที่แมพ ไม่เดาหมวดจาก Quiz/Test หรือแก้โครงสร้างเกรด)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [BR-049-05 (ตำแหน่งหน้า mapping/ส่งคะแนนในเว็บครู)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [BR-049-06 (เฉพาะ admin โรงเรียนสร้าง/แก้ mapping ครูแก้ไม่ได้ (decisions-023))](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [AC-049-02 (กิจกรรม A แมพช่องวิชา X และ Y ได้; แมพ B ซ้ำช่องใดของ A ในบริบทเดียวกันถูกปฏิเสธ ทั้งแก้ชุดเดิมและสร้างชุดใหม่)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [AC-049-03 (สลับโรงเรียน/เทอมแล้ว mapping ไม่ถูกใช้ข้ามบริบทอัตโนมัติ)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)
- [AC-049-04 (Preview ตรงคู่กิจกรรม–ช่องที่แมพ ไม่เพิ่มช่อง/เดาหมวดเอง)](../../../schoolbright-web/modules/school-bot/shared/requirements/req-049.md)

- [OQ-016 (Mapping: ผู้ดูแล ช่องเดิม จำนวนกิจกรรม และการล็อกหลังส่ง)](../../shared/open-questions/oq-016.md) เป็นคำถามที่เอกสารเดิมอ้าง; ใช้ข้อสรุปตามมติที่ระบุในเนื้อหาสัญญา.
