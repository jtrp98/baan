# DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright — Lock และกลไกกันชนกับ writer เดิม (xmin ของ PGGradeDB)

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright](des-009.md)

## Lock และกลไกกันชนกับ writer เดิม (xmin ของ PGGradeDB)

- ตารางของ SchoolBot DB ใช้ `UpdateDate` (`clock_timestamp()`) เป็น optimistic concurrency token ([decisions-030](../../shared/decisions/decisions-030.md))
- ตารางปลายทางใน **PGGradeDB** (`PgtgradeDetail` ฯลฯ) คงการใช้ system column **`xmin`** เป็น Compare-and-Swap (CAS) ระยะสั้นภายในอายุ preview เพื่อกันชนกับ writer เดิม: ตอน apply ใช้ `SELECT ... FOR UPDATE` แล้ว `UPDATE` โดยมีเงื่อนไข PK ตรงและ `xmin` ตรงค่าใน snapshot ร่วมกับ `before_document_hash`; affected rows = 0 → conflict ของนักเรียนคนนั้น
- เกณฑ์ผ่าน G-COEXIST และ G-PARITY (inventory trigger/function, fixtures ที่ปิดบังข้อมูลส่วนบุคคล, เทียบผลกับระบบเดิม 100%) คงตามสัญญาเดิมทุกข้อ

## Atomicity / outbox / replay ข้าม DB (SchoolBot DB ↔ School DB ↔ PGGradeDB)

หน่วย atomic: นักเรียนหนึ่งคนใน PGGradeDB เดียวกัน ไม่อ้าง atomic ทั้งห้องหรือข้าม SchoolBot DB ↔ School DB ↔ PGGradeDB ([decisions-027](../../shared/decisions/decisions-027.md)):
1. ก่อน confirm: re-check สิทธิ์ครูรายวิชา/roster/term จาก **School DB** และสถานะ target ใน **PGGradeDB** ผ่าน connection แยก แล้วเปิด **SchoolBot DB transaction** ตรวจ `UpdateDate` ของ `ScorePreview` (`If-Match`), บันทึก `ScoreExport`, `ScoreOutbox` รายคน (`UQ_SchoolBotScoreOutbox_OperationKey`, `UQ_SchoolBotScoreOutbox_Export_Item`), `Idempotency` และ `AuditEvent` พร้อมกัน (และตรวจใน application ว่าทุกแถวอยู่ `SchoolId` เดียวกันตาม
2. Worker claim `SchoolBotScoreOutbox` ใน **SchoolBot DB** ด้วย lease + `UpdateDate = clock_timestamp()` (`CreateBy/UpdateBy = null` ตาม [decisions-028](../../shared/decisions/decisions-028.md)) และ serialize ต่อ `SchoolId`/grade context/learner
3. Worker **re-check สิทธิ์ครู ([DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)) และเงื่อนไขปัจจุบันจาก School DB** และตรวจ `SchoolBotLicense` active ใน SchoolBot DB ก่อนเริ่ม PGGradeDB transaction
4. **PGGradeDB transaction**: ใช้ transaction-scoped operation lock, ตรวจ receipt เดิมใน `PgtgradeAuditLog`, lock/CAS (`xmin`), merge เฉพาะช่องที่เป็นเจ้าของ, คำนวณด้วยสูตรที่ผ่าน G-PARITY และ INSERT durable receipt ลง `PgtgradeAuditLog` (`Application="SchoolBot"`, `MethodName="ScoreExport.Apply"`, `SEmp` = `sEmp` ของครูผู้ยืนยัน) พร้อมคะแนนใน transaction เดียว
5. **SchoolBot DB transaction**: บันทึก `ReceiptId`, `ReceiptHash`, `State='applied'` และ `AuditEvent`
6. Crash หลังข้อ 4 ก่อนข้อ 5: worker อ่าน receipt ใน `PgtgradeAuditLog` เพื่อ reconcile ลง SchoolBot DB โดยไม่เขียนคะแนนซ้ำ; เมื่อเกิด conflict ของนักเรียนคนใดให้ rollback คนนั้น หยุดแถวที่ยังไม่เริ่ม คงผลคนที่สำเร็จ และให้ครู resolve/confirm เฉพาะส่วนที่เหลือ

## Idempotency, Audit และ ข้อผิดพลาด

คงรหัสและความหมายเดิมทั้งหมด (`UQ_SchoolBotScoreExport_ScorePreviewId` บังคับ 1 preview ต่อ 1 export; `412 VERSION_CONFLICT` เมื่อ `UpdateDate` ไม่ตรง `If-Match`; `503 WRITER_NOT_VERIFIED | CALCULATOR_NOT_VERIFIED | COEXISTENCE_NOT_VERIFIED | GRADE_SOURCE_UNAVAILABLE | RECEIPT_UNAVAILABLE`)

อ่าน canonical [กฎคะแนน](grade-rules-032-034.md)
