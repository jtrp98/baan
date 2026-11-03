# Migration 002 — ผลเทียบเอกสารและข้อรอผู้รับผิดชอบ

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (ใบงาน 097 — ทบทวน BE-028 การนำเข้าแผนรายวิชา)

ผลนี้ประกอบ [physical delta และข้อเสนอ API](migration-002-lesson-import-source-contract.md) โดยตรวจไฟล์เท่านั้น ไม่เชื่อมฐานข้อมูล

## Documentation parity ที่ต้องส่ง arch

ฐานปัจจุบันจาก SQL และ DBML เต็มมี 32 ตาราง/450 ฟิลด์/PK32 ไม่มี UNIQUE/FK/CHECK ทาง SQL scoped fields ของ Curriculum, Lesson และ Activity ตรงชนิด/NULL/default และ PK; ไม่มี physical FK endpoints/actions ให้เทียบ ค่า identity start/max/no-cycle และ conditional CHECK/index ต้องอธิบายใน notes เมื่อ DBML แสดงรายละเอียดแทน DDL ไม่ได้

เมื่อรับ migration นี้ inventory เป็น 32/451/PK32/FK0/CHECK1/unique constraint0 และ unique index เพิ่มหนึ่ง ไม่แก้ยอดของไฟล์ schoolbot_db.sql เดิมให้ดูเหมือนมีคอลัมน์แล้ว ให้แบบอ้าง baseline + migration ที่คนรันจริง

arch ต้องเพิ่ม ImportSource และ JSON สี่ฟิลด์ใน data-model.md, dictionary table-013/contract-002/contract-003, data-json, schoolbot.dbml และคำอธิบาย schema/index ที่เกี่ยว ยกเว้นกฎ “ไม่มี CHECK/unique index” เฉพาะที่เปลี่ยน อย่าวาด source_ref/JSON key เป็น Ref SQL บน diagram

พบข้อความคลาดเคลื่อนเดิม: dictionary Curriculum/Activity และ DBML บาง notes ใช้คำ FK/CHECK ทั้งที่ท้ายไฟล์/DDL ระบุ logical-only; ระบุให้สม่ำเสมอ นอกจากนี้ dictionary table-013 อ้าง SQL บรรทัด267 แต่ CREATE TABLE จริงอยู่บรรทัด273 และ design/index.md ระบุ DES-005 Rev10 ขณะที่ไฟล์จริงเป็น Rev11 ให้ arch แก้ลิงก์/Rev ตามปัจจุบัน

integration DBML ระบุชัดว่าเป็น subset และเส้น logical/cross-database ไม่ใช่ DDL ไม่ต้องเพิ่ม Lesson provenance เข้า legacy subset ที่ไม่มี Lesson นี้; ห้ามนำเส้น logical/JSON mapping ไปสร้าง FK ใน migration

## ความเสี่ยงและสิ่งที่รอมนุษย์

Task: BE-028 · Reference: DES-005 / AC-045-01..04 · Reason: ต้องให้ผู้ใช้อนุมัติ schema/constraint/index นี้ และ arch ตรึง commit/read-back/immutability ก่อนมนุษย์อนุมัติการรันแยกอีกครั้ง

ส่ง jpo พิจารณา PII: source_ref อาจมีชื่อบุคคล/เลขเอกสาร/URL ที่มี token; UUID/hash อาจเชื่อมกลับต้นทางได้ ให้ประเมิน masking/encryption, สิทธิ์อ่านและ retention ไม่เก็บ credential ใน reference ไม่ยืนยันว่าแหล่งจริงไม่มี PII

## หลักฐาน

- [DES-005 importer Rev1](../design/des-005-import.md), [supplied-row Rev1](../design/learning-sheet-import-001.md), [API Rev10](../design/des-005-api.md), [draft read-back Rev3](../design/learning-curriculum-draft-001.md), [REQ-045](../../modules/quiz/shared/requirements/req-045.md)
- [dictionary Curriculum](../design/data-dictionary/table-012.md), [Lesson](../design/data-dictionary/table-013.md), [Activity](../design/data-dictionary/table-016.md), contract-001/002/003 และ data-json-001.md; data-legacy-001.md และ schoolbot-integration.dbml ตรวจเฉพาะขอบเขต reference/subset
- ตรวจ Node.js แบบอ่านไฟล์: ชื่อ/ลำดับฟิลด์ SQL↔DBML ครบ32ตาราง450ฟิลด์; ชนิด/NULL/default scoped3ตารางไม่พบ mismatch ไม่ใช่ DBML parser หรือผล catalog จริง
