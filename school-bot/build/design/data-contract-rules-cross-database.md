# การตรวจข้ามฐานข้อมูลและ idempotency replay

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (กำหนด idempotency ส่วนกลางและขอบเขตการย้าย)

[กลับกฎข้อมูล](data-contract-rules.md) · [สัญญา idempotency ส่วนกลาง Rev1](idempotency-001.md)

## ฐานข้อมูลและการตรวจซ้ำ

ตาม [มติ 027 (ที่ตั้งฐานข้อมูล)](../../shared/decisions/decisions-027.md) และ [มติ 029 (ใช้บัญชีเดิม ไม่เพิ่ม GRANT)](../../shared/decisions/decisions-029.md):

- SQL คง PRIMARY KEY 32 รายการ ไม่มี UNIQUE/FK/CHECK application ตรวจแถวอ้างอิง ความไม่ซ้ำ SchoolId และ MissionId/CriteriaId เอง
- SchoolBot ทั้ง 32 ตารางอยู่ SchoolBot DB (`10.0.0.128:9499`) จึง commit domain+SchoolBotIdempotency+SchoolBotAuditEvent ใน transaction เดียวได้
- legacy ใน Master DB/School DB: TUser, TEmployees, TCompany, TPlanCourse*, TTerm, TStudentClassroomHistory อ่าน connection แยก บัญชีเดิม ไม่มี transaction ข้าม DB คำสั่งที่ขึ้นกับสิทธิ์ครู/ผู้ดูแล รายชื่อนักเรียน (roster)/ภาคเรียน (term) ต้อง re-check School DB/SchoolBotLicense ก่อนเปิด/commit SchoolBot transaction ไม่เพิ่ม role/GRANT ใน School DB/PGGradeDB
- PGGradeDB เขียนผ่านบัญชีเดิมโดย SchoolBotScoreOutbox + durable receipt ใน PGTGradeAuditLog + xmin Compare-and-Swap (CAS) ตาม [DES-009 (ยืนยันและส่งคะแนน)](des-009.md) เปิดเขียนหลังผ่าน release gates ทั้งห้า

Progress อ่านจาก Submission/Assessment/Attempt ไม่มีตารางแก้คะแนนเอง ไม่รวมผลข้าม revision อัตโนมัติ

## อายุและความลับของผล replay

ทั่วไปใช้ encrypted replay 24 ชั่วโมง; เฉพาะ create-license ไม่เกิน 900 วินาทีจาก CompletedAt ตาม [มติ 046 (ระยะกู้ License Key)](../../shared/decisions/decisions-046.md) และ [DES-002 (License/device binding)](des-002.md) store กำหนดอายุตาม operation ไม่รับอายุจาก client ไม่ต่ออายุจาก retry

ตรวจสิทธิ์ปัจจุบันและ tuple/hash ใต้ lock ก่อนเปิดเผยผล hash ต่างคืน `409 IDEMPOTENCY_CONFLICT`; hash ตรงแต่ `now >= ReplayUntil` คืน `409 IDEMPOTENCY_EXPIRED` พร้อม details.resource_id เมื่อมีสิทธิ์ แม้ purge ยังไม่รัน create-license ต้องตรวจว่า License ไม่ถูก revoke ไม่คืนผล actor/operation/โรงเรียนอื่น

หมดอายุล้าง ResultCipher/ResultKeyId พร้อมกัน คง tuple/hash/tombstone/ResourceId ไม่ลบหลังอ่านครั้งแรกหรือใช้ IsDelete เปิดให้สร้างซ้ำ envelope key แยกจาก DB; backup ตาม [custody](signing-custody-001.md) ล้าง live DB ไม่เท่ากับลบ backup Retention tombstone/audit รอเจ้าของข้อมูล ไม่ purge เอง ใช้ SchoolBotIdempotency เดิมไม่เพิ่มคอลัมน์

## การพิสูจน์และขอบเขตการย้าย

### BE-027 บน stub

BE-027 ใช้ของกลางทั้งสี่ mutation คง AC-044-01..05 (revision/edit/publish), AC-043-01 (สิทธิ์), AC-037-05/06 (approval/ย้อนอ้างอิง) บน stub

setup สำหรับ inspect: หนึ่ง process สอง service/adapter/FileSchoolBotBackingStore directory resolve เป็น path เดียว เริ่มว่าง actor staff เดียวมีสิทธิ์ UUID/body ถูกชนิด พัก A หลังได้ lock/อ่าน ledger ก่อน durable replace ยืนยัน B ถึง store call และรอ ใช้ barrier/hook ปล่อย A แล้วเปิด service/adapter ใหม่ตรวจดิสก์

| กรณี | ผลคาดหมาย |
|---|---|
| create key/body เดิมซ้อน | ผล/ID/ETag เดิม หนึ่ง revision/Created audit/ledger ไม่มี STATE_CONFLICT |
| key เดิม เปลี่ยน Revision 1→2 | หนึ่ง success อีกคำขอ IDEMPOTENCY_CONFLICT หนึ่ง revision/audit/ledger |
| metadata/content/publish ซ้อน | setup เดิมมี approval; hash เดิม replay ไม่เพิ่ม children/audit; hash ต่าง conflict |
| ล้มก่อน replace / response ขาดหลัง replace | ก่อน replace ไม่เหลือทั้งสามส่วน; หลัง replace เปิด service/adapter ใหม่ replay ได้ |
| ผู้รอยกเลิก/สิทธิ์หมดขณะรอ/expiry | A ไม่สูญหาย/ซ้ำ; ใช้ clock สด ไม่เผยผลเมื่อหมดสิทธิ์; now=ReplayUntil ต้อง expired |
| actor/operation ต่าง/โรงเรียน replay | ไม่ได้ผลคนอื่น scope ใหม่ผ่าน domain rules; โรงเรียนแก้ส่วนกลางไม่ได้ |

Memory ใช้สอง adapters บน store object เดียว ทั้งสอง stub ต้อง lock ตั้งแต่ reload ถึง commit รักษา ledger ทุก writer ไม่พิสูจน์ OS multi-process/power-loss/PostgreSQL/Gateway

### PostgreSQL และประตูจริง

G-CORE อยู่ที่ DBA-003 (ตรวจ core หลังมนุษย์รัน SQL) ตาม [มติ 053 (เปิดงานบน stub)](../../shared/decisions/decisions-053.md) ต้องพิสูจน์หลาย process/connection, rollback, tuple เดียวรวม NULL-global/tombstone vault เตรียม query/catalog ไม่รัน DB

SQL ไม่มี composite unique constraint จึงใช้ transaction-scoped tuple lock ข้าม process **รวมเมื่อยังไม่มีแถว** อ่านสดหลัง lock แล้ว commit domain+audit+result ใน transaction เดียว ทุก writer ใช้ protocol เดียว advisory key ต้องคงที่ แยก global/tenant; collision ทำให้รอเพิ่มแต่ยังเทียบ tuple จริง ใช้ snapshot สดหลังรอ หรือ retry transaction ที่ถือ snapshot เก่า ห้าม retry mutation ที่ commit แล้ว

เพิ่ม unique constraint ต้องผ่านคน/vault ตรวจ migration/NULL-global/tombstone ก่อน งานนี้คง schema ไม่เพิ่มเกณฑ์ constraint ให้ BE-027 บน stub

### การย้าย consumer

เสนอ task ถัดไปให้ sys ย้าย BE-008 (Cloud Projects) และ BE-003/004 (License admin/activate) หลังจบเกณฑ์เดิม ต้อง sweep callers/fakes/DI และ regression ownership/payload/restart/expiry/device proof/nonce/audit ไม่แก้แผน

Projects ผ่านเฉพาะเกณฑ์เดิม ไม่พิสูจน์ shared-store atomicity dictionary เดิมปฏิเสธ UUID ข้าม actor/operation ต่างจาก tuple เป้าหมาย ต้องตรวจ compatibility ตอนย้าย ไม่เปลี่ยนผลผ่าน/เกณฑ์ย้อนหลัง

License คงอายุ replay/nonce/revoke/lease ที่ตรึง activate 900 วินาทีใน source ไม่ใช่มติ 046 ที่อนุมัติเฉพาะ create-license ต้อง reconcile ก่อนย้าย ไม่ใช้ default ยืดอายุ

## ยังไม่ยืนยัน

ต้องได้ผล stub/PostgreSQL แยกกัน ใช้ Memory ใน Dependency Injection (DI); ไม่ยืนยันข้อมูล File จริง ledger ว่างกู้ key เก่าไม่ได้ พบข้อมูลจริงต้องกำหนดการเปลี่ยนผ่าน

## หลักฐาน

- db/review-005.md (memory): การแยกฐาน/tenant ก่อน commit; `../db/schoolbot_db.sql:92` และ data-contract-rules-grades.md: schema/locks เดิม
- Source ใต้ `C:/src/schoolbright/target/school-bot/web/src/`: `SchoolBot.Application/Projects/ProjectService.cs:23,163,192`; `SchoolBot.Application/Licensing/LicenseAdminService.cs:18,133,149`; `LicenseDeviceService.cs:18,105,196,228` ใน Licensing เดียวกัน — dictionaries/commit แยกกัน
- `SchoolBot.Api/Program.cs:50` — DI; store ดูหลักฐานท้าย idempotency-001.md และ `SchoolBot.Infrastructure/Persistence/MemorySchoolBotBackingStore.cs:158`
- card BE-027/tasks-001.json (memory): AC/ประตู; `C:/src/schoolbright/reports/school-bot/normal-095/snapshot-rw1-027/check/round-095-be027-rw1-finding.md` และ round-095-be027-rw1.md ข้อ 4: ผลตรวจเดิม
