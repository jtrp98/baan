# DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง — เอกสารอ้างอิง

> Rev 7 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 044 — SQL constraints เหลือเฉพาะ Primary Key)

ส่วนต่อของ [DES-011 — ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง](des-011.md) รวมข้อกำหนดและมติที่สัญญานี้อ้าง แต่ละรายการระบุความหมายจากชื่อเรื่องต้นทาง

- [REQ-048 (เสนอและยืนยันเลื่อน Level ทั้งห้อง)](../../modules/quiz/shared/requirements/req-048.md)
- [REQ-037 (หลักสูตรและภารกิจสามโหมด)](../../modules/quiz/shared/requirements/req-037.md)
- [REQ-039 (ความคืบหน้าและการติดตามโดยครู)](../../modules/quiz/shared/requirements/req-039.md)
- [มติ 020 (หลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../../shared/decisions/decisions-020.md)
- [มติ 024 (เกณฑ์เลื่อน Level และ policy Quiz/Test)](../../shared/decisions/decisions-024.md)
- [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../../shared/decisions/decisions-025.md)
- [มติ 026 (อนุมัติ amendment-proposal-001/002 เป็น baseline ใหม่)](../../shared/decisions/decisions-026.md)
- [มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../../shared/decisions/decisions-027.md)
- [มติ 028 (ชนิดคอลัมน์ CreateBy/UpdateBy)](../../shared/decisions/decisions-028.md)
- [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md)
- [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../../shared/decisions/decisions-030.md)
- [BR-048-01 (ใช้ค่าเฉลี่ยคะแนนรวมของห้องที่สูงกว่าเกณฑ์เป็นเงื่อนไขเสนอเลื่อน Level)](../../modules/quiz/shared/requirements/req-048.md)
- [AC-048-01 (สิ้นเทอม roster 2 คนได้คะแนนรวม 80 และ 0 เพราะขาดทุกงาน ระบบแสดงเฉลี่ย 40 ไม่เสนอเลื่อนที่เกณฑ์ 70; ถ้าเฉลี่ยสูงกว่าเกณฑ์จึงเสนอพร้อมค่าเฉลี่ย/เกณฑ์)](../../modules/quiz/shared/requirements/req-048.md)
- [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](des-010.md)
- [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)

- [BR-048-02 (ระบบเสนอ ครูกดยืนยันก่อนเลื่อน; เลื่อนทั้งห้องพร้อมกัน ไม่เลือกเลื่อนรายบุคคล)](../../modules/quiz/shared/requirements/req-048.md)
- [BR-048-03 (เฉลี่ยคะแนนรวมตาม REQ-047 จากทุกคนใน roster; งานขาด = 0 เฉพาะการเลื่อน Level ไม่ใช่ export (decisions-024/033/034))](../../modules/quiz/shared/requirements/req-048.md)
- [BR-048-04 (การเลื่อน Level ไม่ให้สิทธิ์เปลี่ยน revision หรือผลเดิมย้อนหลัง ข้อกำหนด revision ตาม REQ-044)](../../modules/quiz/shared/requirements/req-048.md)
- [BR-048-05 (หน้าครูยืนยันเลื่อน Level อยู่ใน sb-tech-upgrade-web-system ตาม decisions-022)](../../modules/quiz/shared/requirements/req-048.md)
- [BR-048-06 (admin ตั้งเกณฑ์ราย Level เริ่ม 70%; ประเมินสิ้นเทอม มีผลเทอมถัดไป; ไม่ผ่านอยู่ Level เดิมพร้อมส่วนที่ขาด (decisions-024))](../../modules/quiz/shared/requirements/req-048.md)
- [AC-048-02 (ก่อนครูยืนยัน Level ของห้องและนักเรียนทุกคนยังไม่เปลี่ยน)](../../modules/quiz/shared/requirements/req-048.md)
- [AC-048-03 (ครูยืนยันข้อเสนอสิ้นเทอมแล้ว เทอมปัจจุบันไม่เปลี่ยน; เทอมถัดไปทั้งห้องเริ่ม Level ใหม่เดียวกัน ไม่เลือกบางคน)](../../modules/quiz/shared/requirements/req-048.md)
- [AC-048-04 (เฉลี่ยเท่ากับหรือต่ำกว่าเกณฑ์ไม่เสนอเลื่อน เทอมถัดไปอยู่ Level เดิมและแสดงส่วนที่ขาด (เท่ากันแสดง 0))](../../modules/quiz/shared/requirements/req-048.md)

- [OQ-014 (สูตรรวมรายกิจกรรมและการแปลงคะแนน)](../../shared/open-questions/oq-014.md) เป็นคำถามที่เอกสารเดิมอ้าง; ใช้ข้อสรุปตามมติที่ระบุในเนื้อหาสัญญา.
