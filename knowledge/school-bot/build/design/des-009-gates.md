# DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright — เงื่อนไขก่อนเปิดส่งคะแนน

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-009 — Preview ยืนยัน และส่งคะแนนกลับ SchoolBright](des-009.md)

## เงื่อนไขก่อนเปิดส่งคะแนน

Release gates — export (confirm → apply) เปิดได้เมื่อผ่านทุกข้อและมนุษย์ลงนาม; ก่อนนั้น confirm ตอบ 503 ตามรหัสของ gate ที่ค้าง:
- G-PARITY: แผนพิสูจน์ parity ด้านล่างผ่าน 100% → ไม่งั้น CALCULATOR_NOT_VERIFIED
- G-COEXIST: กลไกกันชนกับ writer เดิมผ่าน → ไม่งั้น COEXISTENCE_NOT_VERIFIED
- G-TARGET: JSON shape/identifier ของ ScoreData และการมีอยู่ของ detail row พิสูจน์จาก fixtures → ไม่งั้น WRITER_NOT_VERIFIED
- G-AUTHZ: ความหมาย lock/period/SubmitPeriod/override จากข้อมูลจริง
- **G-DB (ปรับตาม [decisions-029](../../shared/decisions/decisions-029.md))**: ไม่รัน GRANT/สร้าง role ใหม่ใน PGGradeDB; เปลี่ยนเงื่อนไขเป็น **"ยืนยันว่าใช้บัญชี DB เดิมตัวไหนต่อ PGGradeDB + เจ้าของระบบเกรดยอมให้ใช้ และพิสูจน์บนฐานทดสอบว่าบัญชีนั้นเขียนคะแนนและ INSERT receipt ลง `PgtgradeAuditLog` ได้จริง"** → ไม่งั้น RECEIPT_UNAVAILABLE; การจำกัดให้เขียนเฉพาะช่องที่ SchoolBot เป็นเจ้าของต้องบังคับในโค้ด adapter และตรวจใน code review/test
Preview (อ่านอย่างเดียว) เปิดก่อน gate ได้ใน environment ที่ไม่ใช่ production เพื่อ UX/QA โดยแสดงสถานะ gate ให้เห็น

## ขอบเขตและ Placement

Public API และ worker อยู่ school-bot/web
หน้าครู preview/ยืนยัน/แก้ชนอยู่ `sb-tech-upgrade-web-system` โฟลเดอร์ school-bot ซึ่งยังต้องยืนยัน เรียกผ่าน Backend for Frontend (BFF) ด้วย session channel `school_web` ตาม [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](des-012.md)
**SchoolBot DB (`10.0.0.128:9499` ตาม [decisions-027](../../shared/decisions/decisions-027.md))** เก็บ `SchoolBotScorePreview`, `SchoolBotScorePreviewItem`, `SchoolBotScoreExport`, `SchoolBotScoreOutbox` (ตัดคอลัมน์ `ScorePreviewId` ที่ซ้ำซ้อนออกตาม, `SchoolBotIdempotency` และ `SchoolBotAuditEvent`
**School DB** และ **PGGradeDB** ต่อผ่าน connection แยกด้วย**บัญชี DB เดิม** ([decisions-029](../../shared/decisions/decisions-029.md)); PGGradeDB ใช้ schema เดิมเท่านั้น ไม่เพิ่มตาราง คอลัมน์ trigger หรือ function ใน PGGradeDB

Export เปลี่ยนคะแนนช่อง SchoolBot แบบ assignment ไม่ใช่ increment ไม่ส่งผลรวม SchoolBot ไปแทน GetScore100 การคำนวณ derived fields ต้องผ่านสูตรเดิมที่พิสูจน์ด้วย G-PARITY ไม่เรียก submit/close-grade เป็นผลข้างเคียงของ export

