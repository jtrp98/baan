# การตรวจข้ามฐานข้อมูลและ idempotency replay

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](data-contract-rules.md)

**กฎ Foreign Key, การแยก DB และการ Re-check ก่อน Commit ([มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../../shared/decisions/decisions-027.md), [มติ 029 (ใช้บัญชี DB เดิมโดยไม่เพิ่ม GRANT)](../../shared/decisions/decisions-029.md)):**
- ใน `../db/schoolbot_db.sql` คง PRIMARY KEY 32 รายการ; ไม่มี UNIQUE/FK/CHECK. application ต้องตรวจแถวอ้างอิง ความไม่ซ้ำ SchoolId และ MissionId/CriteriaId เอง ไม่ใช้ FK หรือ constraint error เป็นหลักประกัน
- ทุกตารางของ SchoolBot (32 ตาราง) อยู่บน **SchoolBot DB (`10.0.0.128:9499`)** จึง commit domain + `SchoolBotIdempotency` + `SchoolBotAuditEvent` แบบ atomic ใน transaction เดียวของ SchoolBot DB
- ข้อมูล legacy ใน **Master DB** และ **School DB** (`TUser`, `TEmployees`, `TCompany`, `TPlanCourse*`, `TTerm`, `TStudentClassroomHistory`) อ่านผ่าน connection แยกด้วย **บัญชี DB เดิม** (ไม่สร้าง role/GRANT ใหม่ใน School DB หรือ PGGradeDB ตาม [มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](../../shared/decisions/decisions-029.md)) จึงไม่มี transaction เดียวครอบข้าม DB; ทุกคำสั่งแก้ไขที่ขึ้นกับสิทธิ์ครู/ผู้ดูแล, รายชื่อนักเรียนในห้อง (roster) หรือสถานะภาคเรียน (term) ต้อง **re-check ข้อมูลจาก School DB (และสถานะ `SchoolBotLicense` ใน SchoolBot DB) ณ จุดก่อนเปิด/commit transaction ใน SchoolBot DB**
- การเขียนคะแนนลง **PGGradeDB** ใช้บัญชี DB เดิมผ่าน `SchoolBotScoreOutbox` + durable receipt ใน `PGTGradeAuditLog` + `xmin` CAS ของตาราง PGGradeDB ตาม [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](des-009.md) (เปิดเขียนได้หลังผ่าน release gates ทั้งห้า)

Progress เป็น read model จาก `Submission`/`Assessment`/`Attempt` ไม่มีตาราง Progress ที่แก้คะแนนเอง ผลต่าง curriculum revision ไม่รวมอัตโนมัติ

Idempotency ทั่วไปคง encrypted replay window 24 ชั่วโมง; **ข้อยกเว้นเฉพาะ create-license** 15 นาที (ผู้ใช้อนุมัติตาม [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](../../shared/decisions/decisions-046.md)), `ReplayUntil ≤ CompletedAt+900 วินาที` ตาม [DES-002 (License และ device binding)](des-002.md). ตอนอ่านต้องตรวจเวลาฝั่ง server: `now >= ReplayUntil` คืน `409 IDEMPOTENCY_EXPIRED` พร้อม `details.resource_id` เมื่อเปิดเผยได้ แม้ purge ยังไม่รัน. ล้าง `ResultCipher`/`ResultKeyId` พร้อมกันเมื่อหมดหน้าต่าง และคง tombstone/ResourceId ป้องกันซ้ำ; ไม่ต่ออายุจาก retry และไม่ลบหลังอ่านครั้งแรก. ตรวจ Principal/RequestKey/RequestHash/สิทธิ์ปัจจุบันก่อน replay; create-license ตรวจ license ไม่ถูก revoke เพิ่มด้วย. envelope key แยกจาก DB และการหมดอายุของ backup ตาม [custody](signing-custody-001.md); ไม่อ้างว่าการล้าง live DB ลบ backup แล้ว. Retention tombstone/audit รอเจ้าของข้อมูล ไม่ purge โดยพลการ. DDL เดิม ตาราง `SchoolBotIdempotency` ใน `../db/schoolbot_db.sql` รองรับโดยไม่เพิ่มคอลัมน์

## หลักฐาน

- db/review-005.md (memory): การแยกฐานและการตรวจ tenant ก่อน commit
