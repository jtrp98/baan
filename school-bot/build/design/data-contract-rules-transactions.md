# การล็อกและการ commit ข้อมูลร่วม

> Rev 12 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (กำหนด authoritative CAS และหลักประกัน stub สำหรับ License writers)

[กลับเอกสารหลัก](data-contract-rules.md)

application/repository ต้องใช้ transaction-scoped lock บน stable key ที่ serialize ทุก writer ของ logical scope เดียวกันข้าม process รวมกรณียังไม่มีแถว: ล็อกก่อนอ่านตรวจซ้ำและถือจน commit/rollback. ทุกเส้นทาง create/update/restore/เปลี่ยนสถานะต้องใช้ protocol เดียวกัน; key มี namespace/canonical encoding และแยก global (`SchoolId=null`) จาก tenant; หลาย locks ใช้ลำดับเดียวกัน. select-before-insert, row lock ของแถวที่ยังไม่มี และ `If-Match` เพียงอย่างเดียวไม่ป้องกัน create race

lock ของ finalized proposal และ successor ใช้ namespace/key ของ CourseRun ต้นทางร่วมกัน ไม่ล็อกเฉพาะ proposal ID. คง predicates เดิม: active run = `Lifecycle IN ('planned','active','closing') AND IsDelete=false`; successor ของ run = `PreviousRunId IS NOT NULL AND IsDelete=false`; finalized proposal = `State IN ('promoted','retained','max_level') AND IsDelete=false`; successor ของ proposal = `SuccessorRunId IS NOT NULL AND IsDelete=false`. GradeSlot ownership ใช้ `RetiredAt=null` โดยไม่กรอง `IsDelete`; active mapping ใช้ `RetiredAt=null AND IsDelete=false`. กฎห้ามหลบประวัติด้วย retire/soft-delete/hard-delete ยังคงแยกจาก predicates เหล่านี้

กฎเหล่านี้เป็นสัญญา ไม่ใช่ผล runtime; หลักฐาน License แยกด้านล่าง Domain mutation/idempotency/audit ต้อง atomic ใน SchoolBot DB transaction เดียว คง replay window/tombstone/nonce/ownership/promotion semantics สำหรับ `SchoolBotProject` + `SchoolBotProjectRevision` + `CurrentRevision` ตาม [มติ 051 — บันทึก Project และ Revision เป็นหน่วยเดียว](../../shared/decisions/decisions-051.md) และ [Project API Rev2](project-api-001.md) ใช้ `CommitProjectAsync`: **ห้ามเผยแพร่ Project/เลื่อน pointer ใน store/cache ก่อน Revision commit พร้อมกัน ห้ามใช้ save สองขั้นแล้ว compensation/rollback in catch** ล้มก่อน commit ต้องคง store/cache เดิม; ผล commit ไม่แน่ชัดให้ invalidate/reload authoritative store

## Protocol ของ License บน stub และ DB

หน่วยข้อมูล/ผลเมื่อ CAS ไม่ผ่านอยู่ใน [DES-002 Rev4](des-002.md#เงื่อนไขร่วมก่อน-commit); fields ที่เขียนได้อยู่ใน [หน่วย commit Rev4](des-002-entitlement.md#หน่วย-commit-ของแต่ละ-writer) ใช้ร่วมกับกฎ stable key ด้านบน ไม่เพิ่ม schema หรือ API error ใหม่

1. Store รับ LicenseId, identity, expected pointer/epoch หรือ ETag และ patch; lock ก่อนอ่าน authoritative License/Binding/idempotency/history และตรวจ CAS ซ้ำ ถ้ารับ snapshot ต้องเทียบ expected กับ store และสร้าง candidate จาก state ล่าสุดใต้ lock ห้ามแทน lists เก่าจาก adapter
2. ตรวจ authorization/proof/inactive ก่อน mutation เตรียม candidate, signed response, audit/idempotency; ไม่เผยแพร่ store/cache ถ้าปฏิเสธหรือ signer/write ล้มก่อน publish ต้องคงข้อมูลเดิม
3. Publish ทั้งหน่วยครั้งเดียว แล้วปรับ cache/ตอบ success Reader ต้องเห็น generation สมบูรณ์; ผล commit ไม่แน่ชัดให้ invalidate/reload ห้ามเขียน snapshot เก่าชดเชย

Memory ใช้ lock ของ store object เดียวกัน ครอบคลุม read–compare–patch–publish และ snapshot reader FileSchoolBotBackingStore แชร์ lock ของ canonical directory ข้าม store object: อ่าน generation ล่าสุด, CAS และ publish License/Binding/ผลร่วมเป็น generation เดียวที่ restart อ่านได้ ใช้ single-snapshot แบบ Project ได้; ย้ายสองไฟล์แยกกันไม่ atomic หาก move ที่สองล้ม

ถ้าเขียน snapshot ทั้ง store ต้องล็อกทั้ง store จน publish เพื่อไม่ทับ License อื่น; lock ราย LicenseId ใช้ได้เมื่อเขียนเฉพาะ aggregate อย่างปลอดภัย ทุก writer รวม create/update/raw Save ต้องร่วม protocol หรือปิดทาง runtime ห้าม service/management cache หรือ adapter เก่าข้าม protocol; fixture seed ก่อนเริ่มคำขอ

## Invariants ที่ต้องบังคับ

- Live คือ `LicenseId` เดียวกัน, `DetachedAt=null AND IsDelete=false`; นับจากทุก binding ไม่ใช่เฉพาะ CurrentBindingId และต้องไม่เกินหนึ่ง แม้ License ถูก revoke หาก pointer มีค่าต้องชี้ live binding ของ License/School/epoch เดียวกัน
- Store/repository บังคับขณะ commit; service ตรวจล่วงหน้าเพื่อคืน error ได้แต่แทน store check ไม่ได้ ถ้าข้อมูลเดิมหลาย live ให้ปฏิเสธ lease/activation ไม่ซ่อมประวัติโดยเงียบ
- DetachedAt ของประวัติไม่ย้อนเป็น null และห้ามลบ/soft-delete เพื่อเลี่ยง detached history ตรวจประวัติ key เดิมซ้ำใน transaction; กลับมาได้เมื่อ admin ตั้ง AllowedNextJkt ตรงกับ key นั้นและ activate สร้าง binding ใหม่เท่านั้น การ unbind โดยไม่ระบุ next key อนุญาตเครื่องใหม่ที่ไม่เคยถูกถอด ไม่อนุญาตเครื่องเก่ากลับเอง

## Setup พิสูจน์

ใช้ [setup สำหรับ writer และผู้ตรวจ](des-002-recovery.md#setup-สำหรับ-writer-และผู้ตรวจ) Rev4: สอง adapter ต่อ store เดียว, แยก memory/file, พักก่อนเข้า store lock และตรวจผลด้วย instance ที่สาม

## ขอบเขต PostgreSQL และประตูเดิม

ผล stub ไม่พิสูจน์หลาย process/host, PostgreSQL isolation หรือ physical constraint งาน DBA-003 (ตรวจ core หลังมนุษย์รัน SQL) ภายใต้ G-CORE ต้องรับหลักฐาน lock/CAS/rollback จาก PostgreSQL 15.19 ตาม [มติ 053 — เปิดงานบน stub และประตูของจริง](../../shared/decisions/decisions-053.md); QA-001 (ตรวจ DB/License/Login) นำไปตรวจ restart/race/การย้าย/denial ของจริง

Vault ทวน stable-key/License row lock หรือ SERIALIZABLE ว่า serialize ทุก writer รวม create; ตรวจ serialization failure/retry ไม่เปลี่ยน expected state/เลี่ยง authorization และ catalog unique/FK จริง ร่าง SQL มีเพียง primary keys ไม่อ้าง unique live-binding constraint การเพิ่ม constraint/schema/migration ต้องเสนอและรอคนที่ประตูเดิม งานนี้ไม่เสนอ SQL ใหม่

## หลักฐาน

- Source ตรวจ 2026-11-03 ใต้ `C:/src/schoolbright/target/school-bot/web/src/`: cache/lock/CAS ใน `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:17–68,270–315,340–416,447–492`; default commit ที่ save สองขั้นใน `ISchoolBotBackingStore.cs:15–29`
- Memory load/commit: `SchoolBot.Infrastructure/Persistence/MemorySchoolBotBackingStore.cs:28–65`; file lock และสอง moves: `FileSchoolBotBackingStore.cs:14–15,97–132`; single-snapshot Project: `FileSchoolBotBackingStore.cs:148–170`
- Source แสดงช่องว่าง ไม่ใช่ผล runtime ใหม่; setup finding เดิมอยู่ใน `C:/src/schoolbright/reports/school-bot/normal-095/snapshot-rw1/check/round-095-rw1-findings.md`
- ขอบเขต DBA-003/G-CORE และ QA-001 อ้าง `build/plan/tasks-001.json` ของโครงการ; ไม่แก้แผน/ประตูและไม่รัน SQL
