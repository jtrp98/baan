# 4. Audit trail — มุมมองครู/admin

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับint-005-mapping](int-005-mapping.md) · ส่วนหนึ่งของ UX ชุดเดียวกับตาราง Sign-off ในไฟล์ทางเข้า

## 4. Audit trail — มุมมองครู/admin

อ้างอิง: [BR-052-03 (audit อ้างต้นทางและ revision, mapping ที่ใช้, ปลายทาง, เดิม/ใหม่, ผู้ยืนยัน, เวลา, การแก้ชน และผลส่ง)](../requirement/req-052.md) · [AC-052-05 (ตรวจรายการส่งแล้วพบ audit ครบ BR-052-03)](../requirement/req-052.md) · [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md) (AuditEvent/PgtgradeAuditLog) · [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../design/des-008.md) (audit การจัด mapping)

- หน้า "ประวัติการส่งคะแนน" — state ของหน้า: **loading** "กำลังโหลดประวัติ…" · **empty** "ยังไม่มีประวัติการส่งคะแนน" · **error** ระบุสาเหตุ/รหัสอังกฤษ + ปุ่ม "ลองโหลดอีกครั้ง" — แยกจากสถานะรายรายการ (applied/skipped/...)
- ครูเห็นรายการที่ตนเป็นผู้ยืนยัน · admin โรงเรียนเห็นทั้งโรงเรียน (school_admin อ่าน GET score-exports ได้ — DES-009) — Q38 (ขอบเขตประวัติครูและ admin)
- คอลัมน์ต่อรายการ export (ครบ BR-052-03): ผู้ยืนยัน · เวลายืนยัน · กิจกรรมต้นทาง + curriculum revision · mapping ที่ใช้ (id + update_date) · ปลายทาง (โรงเรียน/เทอม/วิชา/ห้อง/ชื่อช่อง + score_identifier) · สรุปผล (applied/skipped/conflict/blocked)
- drill-down รายคน: ค่าเดิม → ค่าใหม่ · **ตัวตน/รุ่นของผลต้นทางที่ใช้ส่งจริง: `kind` (assessment|attempt), `id`, `update_date` ตาม SourceResultRef ควบคู่กิจกรรมและ curriculum revision** · receipt_id (Application="SchoolBot") · การแก้ชน (เลือกอะไร + เหตุผล) · ผลส่งรายช่อง
- แท็บ "ประวัติ mapping" (admin): ถือครองช่อง/สร้าง/แก้/retire/ล็อก พร้อมผู้กระทำและเวลา (DES-008 AuditEvent)
- ผลรวม/เกรด: หน้า SchoolBot ไม่คำนวณ/ไม่แสดงผลรวมเอง — ดูที่หน้า score-record/รายงานเดิม ซึ่งต้องได้ค่าตรงกัน (parity — [BR-052-04 (แก้เฉพาะช่อง SchoolBot)](../requirement/req-052.md), [BR-052-05 (backend ที่เขียนคะแนนอยู่ฝั่ง SchoolBot ไม่เรียก service score-record เดิม)](../requirement/req-052.md)) · ป้ายกำกับ "ผลรวม/เกรดคำนวณตามระบบเดิม" พร้อมลิงก์

## 5. a11y ของ int-005 (ต่อมาตรฐานที่อนุมัติแล้วของ int-001/int-002)

- ตารางทุกตารางมี caption + th scope · เซลล์สถานะ (ข้าม/ชน/ถูกกั้น/ส่งแล้ว) มีข้อความ+ไอคอนเสมอ ไม่ใช้สีเพียงอย่างเดียว · ความคมชัด ≥ 4.5:1
- visible focus ทุกปุ่ม/ตัวเลือก · dialog ยืนยัน (ถือครองช่อง/ยืนยันส่ง/retire) ทำ focus management ตามมาตรฐานเดิม · Esc ปิด dialog ได้
- สถานะ export ที่อัปเดตอัตโนมัติประกาศด้วย `aria-live="polite"` เฉพาะเมื่อสถานะเปลี่ยน (ไม่ประกาศทุกรอบ poll) · ตัวนับอายุพรีวิวประกาศเมื่อเหลือ 2 นาที และเมื่อหมดอายุ
- คีย์บอร์ด: ไล่ตามลำดับ · ตารางใหญ่เลื่อนได้ทั้งสองแกนโดยหัวแถว/หัวคอลัมน์คงที่ · ปุ่มลัด "คงค่าปัจจุบันทั้งหมด" อยู่หลังรายการ conflict ในลำดับ tab
- reduced-motion ปิดอนิเมชัน progress/นับถอยหลัง · ตัวเลขคะแนนใช้รูปแบบอ่านง่าย

## หลักฐาน

- (อ้างอิง: plan/UX-006 (memory: plan/UX-006.md) · [REQ-049 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../requirement/req-049.md)..[REQ-052 (สิทธิ์ การส่งซ้ำ และ audit คะแนน)](../requirement/req-052.md) · [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../design/des-008.md)/[DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md) · [grade-rules](../design/grade-rules-032-034.md))
