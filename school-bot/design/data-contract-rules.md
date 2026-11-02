# กฎข้อมูลและ HTTP contract ร่วม

> Rev 11 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สัญญานี้กำหนดความสัมพันธ์ ความไม่ซ้ำ การบันทึกแบบ atomic และ HTTP ที่ใช้ร่วมกัน อ่านคู่กับ [แบบข้อมูลปัจจุบัน](data-model.md) และ [นิยามชนิดข้อมูล](data-dictionary/contract-001.md): `K` คือรหัสแถว int4, `I` คือ signed int32, `U` คือ UUID, `N` คือจำนวนเต็มตั้งแต่ 1, `Tn` คือข้อความไม่เกิน n ตัว และ `D` คือเวลา UTC

## Relations / uniqueness / invariants

Canonical เพิ่มเติม: [ผลเรียน/policy](learning-rules-032-034.md), [mapping/export](grade-rules-032-034.md); เป็น application invariants เพิ่มจาก SQL ด้านล่าง โดยกฎไม่ซ้ำเฉพาะ active ไม่เท่ากับกฎล็อกประวัติ

ร่าง SQL ปัจจุบันคง PRIMARY KEY 32 รายการ; UNIQUE/FK/CHECK เป็น 0. ความสัมพันธ์ ความไม่ซ้ำ และเงื่อนไขข้อมูลเดิมเป็นกฎเชิงตรรกะของ application; งานนี้ไม่เพิ่มหรือพิสูจน์ implementation ทดแทน (NOT_IMPLEMENTED). ชนิดข้อมูลและ identity เดิมคงอยู่; CreateBy/CreateDate/UpdateBy/UpdateDate รับ NULL และ DEFAULT NULL ทุกตาราง; ฟิลด์อื่นคง nullability/default เดิม; ยังไม่ได้รันฐานจริง

## เลือกอ่านตามสัญญา

- [การล็อกและ commit](data-contract-rules-transactions.md): stable key, predicates และการบันทึก Project พร้อม Revision
- [สิทธิ์ ตัวตน และโครงงาน](data-contract-rules-identity.md): License, Binding, Session, StaffRole, TeacherGrant และ Project
- [เนื้อหากลางและผลเรียน](data-contract-rules-learning.md): Level, หลักสูตร, กิจกรรม, Submission, Assessment และ Attempt
- [ช่องคะแนนและงานระบบ](data-contract-rules-grades.md): ownership, mapping, preview/export/outbox, promotion, release, idempotency และ audit
- [การตรวจข้ามฐานและ replay](data-contract-rules-cross-database.md): tenant, re-check, Progress และ replay window
- [HTTP contract](data-contract-rules-http.md): error envelope, ETag, headers, pagination และขนาดข้อมูล

## หลักฐาน

ฐานสัญญาเดิมอ้าง data-model Rev5, db/schoolbot_db.sql และ db/review-005.md (memory) ภายใต้ [มติ 026 (อนุมัติแบบข้อมูลที่ปรับใหม่)](../requirement/decisions-026.md) ถึง [มติ 030 (ใช้ UpdateDate แทน Version)](../requirement/decisions-030.md) การเรียบเรียงนี้ไม่ยืนยัน implementation หรือผลการรันฐานจริง
