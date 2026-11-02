# DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright — การได้มาซึ่ง GradeSlot และการตรวจซ้ำข้าม DB ก่อน Commit

> Rev 6 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 044 — SQL constraints เหลือเฉพาะ Primary Key)

ส่วนต่อของ [DES-008 — Mapping หลักสูตรกับช่องคะแนน SchoolBright](des-008.md)

## การได้มาซึ่ง GradeSlot และการตรวจซ้ำข้าม DB ก่อน Commit

1. อ่านช่องเดิมจาก PGGradeDB และ resolve context แผนการเรียน/ห้อง/เทอมจาก School DB ฝั่ง server ผ่าน connection แยก
2. ต้องพบ header/assessment/identifier ที่ไม่กำกวมและยังใช้งาน
3. admin โรงเรียนยืนยันว่าช่องนั้นเป็นช่องเฉพาะ SchoolBot
4. ตรวจว่าไม่มีคะแนนครูหรือเจ้าของช่องอื่นอยู่ก่อนเริ่มถือครอง
5. **Re-check ก่อน Commit ([decisions-027](../requirement/decisions-027.md))**: เนื่องจากไม่มี transaction เดียวครอบ SchoolBot DB กับ School DB / PGGradeDB ก่อนเปิดและ commit transaction ใน **SchoolBot DB** ต้อง re-check สิทธิ์ `school_admin`, สถานะ `SchoolBotLicense` active ของโรงเรียน, การมีอยู่ของ `PlanCourseId`/เทอมใน School DB และสถานะช่องว่างใน PGGradeDB อีกครั้ง แล้วจึงบันทึก ownership (`SchoolBotGradeSlot`) พร้อม `SchoolBotAuditEvent` และ `SchoolBotIdempotency` ใน **SchoolBot DB** transaction เดียว (application/repository ต้องถือ transaction lock บน stable ownership key `(SchoolId,NGradeId,AssessmentId,ScoreIdentifier)` ก่อนตรวจ ownership และประวัติซ้ำ จน commit/rollback รวมกรณียังไม่มี GradeSlot; active ownership ใช้ `RetiredAt=null` โดยไม่กรอง `IsDelete=false`; คงกฎล็อกประวัติหลัง confirm ไม่มี partial unique index บังคับ)

การบังคับทดแทนด้วย application/repository locks: NOT_IMPLEMENTED — ไม่มี runtime evidence; คง errors และ re-check ข้าม DB เดิม การล็อก SchoolBot DB ไม่ serialize writer ใน PGGradeDB โดยอัตโนมัติ

ชื่อช่องที่มีคำว่า SchoolBot ไม่ใช่หลักฐาน ownership ห้ามยึดช่องของครูด้วยการตั้งชื่อใหม่หรือเลือก force หากไม่พบช่องว่างที่จัดสรรได้ ให้ SLOT_UNAVAILABLE การสร้าง Pgtassessment ใหม่ทำผ่านระบบเกรดเท่านั้น ตาม [มติ 033 (ช่องคะแนนเดิม การแปลงคะแนนเต็ม และผลประเมินที่ยังไม่มี)](../requirement/decisions-033.md) ห้ามใช้ MAX(id)+1 หรือเดา ScoreIdentifier จาก ordinal

