# Migration 002 — ผลเทียบเอกสารและข้อรอผู้รับผิดชอบ

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (มติ 2026-11-03 — เพิ่มเฉพาะคอลัมน์)

ผลทบทวน Rev2: forward เพิ่มเฉพาะ ImportSource jsonb NULL ตามมติผู้ใช้ ไม่เพิ่ม CHECK/index/trigger หรือวัตถุอื่น รูปทรง JSON การกันนำเข้าซ้ำและรหัสคงเดิมย้ายเป็นหน้าที่ application ทั้งหมดตาม [physical delta และข้อเสนอ API](migration-002-lesson-import-source-contract.md) ตรวจไฟล์เท่านั้น ไม่เชื่อมฐานข้อมูล และยังไม่ได้ยืนยัน implementation

## Documentation parity ที่ต้องส่ง arch

ผลตรวจ baseline ที่บันทึกใน Rev1 ระบุว่า SQL และ DBML เต็มมี 32 ตาราง/450 ฟิลด์/PK32 ไม่มี UNIQUE/FK/CHECK ทาง SQL scoped fields ของ Curriculum, Lesson และ Activity ตรงชนิด/NULL/default และ PK; ไม่มี physical FK endpoints/actions ให้เทียบ ค่า identity start/max/no-cycle ต้องอธิบายใน notes เมื่อ DBML แสดงรายละเอียดแทน DDL ไม่ได้; migration Rev2 ไม่มี conditional CHECK/index ให้แสดง

เมื่อรับ migration Rev2 นี้ inventory ที่คาดจาก baseline เป็น 32 ตาราง/451 ฟิลด์/PK32/FK0/CHECK0/unique constraint0/index32 เฉพาะ PK ไม่มี index ใหม่ ไม่แก้ยอดของไฟล์ schoolbot_db.sql เดิมให้ดูเหมือนมีคอลัมน์แล้ว ให้แบบอ้าง baseline + migration ที่คนรันจริง

arch ต้องเพิ่ม ImportSource และ JSON สี่ฟิลด์ใน data-model.md, dictionary table-013/contract-002/contract-003, data-json, schoolbot.dbml และคำอธิบาย schema/index ที่เกี่ยว คงกฎ “ไม่มี CHECK/unique index” และระบุทุก JSON rule/dedup/immutability เป็น application check อย่าวาด source_ref/JSON key เป็น Ref SQL บน diagram

Rev1 บันทึกข้อความคลาดเคลื่อนเดิมไว้เพื่อให้ arch ตรวจยืนยันกับไฟล์ปัจจุบัน: dictionary Curriculum/Activity และ DBML บาง notes ใช้คำ FK/CHECK ทั้งที่ท้ายไฟล์/DDL ระบุ logical-only; ระบุให้สม่ำเสมอ นอกจากนี้ dictionary table-013 อ้าง SQL บรรทัด267 แต่ CREATE TABLE จริงอยู่บรรทัด273 และ design/index.md ระบุ DES-005 Rev10 ขณะที่ไฟล์จริงเป็น Rev11 ให้ arch แก้ลิงก์/Rev ตามปัจจุบัน

integration DBML ระบุชัดว่าเป็น subset และเส้น logical/cross-database ไม่ใช่ DDL ไม่ต้องเพิ่ม Lesson provenance เข้า legacy subset ที่ไม่มี Lesson นี้; ห้ามนำเส้น logical/JSON mapping ไปสร้าง FK ใน migration

## ความเสี่ยงและสิ่งที่รอมนุษย์

ผู้ใช้ตัดสินใจเพิ่มเฉพาะคอลัมน์แล้ว ไม่ขออนุมัติ CHECK/index ซ้ำ รายการที่ arch ต้องตรึงคือ validation ก่อนเขียน, idempotency-001 Rev2, ค้นก่อนเขียนและ commit ภายใต้ coordination ร่วมในหน่วยเดียว, รหัสคงเดิม, read-back และ immutability ทุกช่องทาง รายละเอียดอยู่ใน contract; รอ arch จัดสัญญา ไม่ถือว่า migration พิสูจน์การกันซ้ำแล้ว

ความเสี่ยงที่เพิ่มขึ้น: ฐานรับ JSON ผิดรูป/รหัสไม่ตรง/ข้อมูลซ้ำได้เมื่อ writer ข้ามกฎหรือหลาย instance ไม่ใช้ lock ร่วม คำขอต่าง RequestKey/actor ยังต้องตรวจ domain identity และการค้นไม่มี index ใหม่อาจสแกนข้อมูลมากขึ้น ไม่มี DB uniqueness เป็นด่านสุดท้าย ความเสี่ยงยังเปิด ไม่ใช่การรับความเสี่ยงแทนผู้ใช้

Task: BE-028 · Reference: DES-005 / AC-045-01..04 / migration-002 Rev2 · Reason: มนุษย์เป็นผู้ยืนยันฐานและเวลารัน รัน forward/catalog/rollback ทุกชิ้นเอง และส่งหลักฐาน; ต้องยืนยันที่มาคอลัมน์ก่อน rollback เพราะไม่มี marker หาก Rev1 เคยรันแล้วให้หยุดและส่ง DDL ที่เกี่ยวให้ vault ทบทวน ห้ามใช้ Rev2 ถอน CHECK/index โดยอัตโนมัติ

ส่ง jpo พิจารณา PII: source_ref อาจมีชื่อบุคคล/เลขเอกสาร/URL ที่มี token; UUID/hash อาจเชื่อมกลับต้นทางได้ ให้ประเมิน masking/encryption, สิทธิ์อ่านและ retention ไม่เก็บ credential ใน reference ไม่ยืนยันว่าแหล่งจริงไม่มี PII

## หลักฐาน

- [DES-005 importer Rev1](../design/des-005-import.md), [supplied-row Rev1](../design/learning-sheet-import-001.md), [API Rev10](../design/des-005-api.md), [draft read-back Rev3](../design/learning-curriculum-draft-001.md), [REQ-045](../../modules/quiz/shared/requirements/req-045.md)
- [dictionary Curriculum](../design/data-dictionary/table-012.md), [Lesson](../design/data-dictionary/table-013.md), [Activity](../design/data-dictionary/table-016.md), contract-001/002/003 และ data-json-001.md; data-legacy-001.md และ schoolbot-integration.dbml ตรวจเฉพาะขอบเขต reference/subset
- หลักฐานที่ Rev1 บันทึกจาก Node.js แบบอ่านไฟล์ (รอบนี้ไม่ได้รันซ้ำ): ชื่อ/ลำดับฟิลด์ SQL↔DBML ครบ32ตาราง450ฟิลด์; ชนิด/NULL/default scoped3ตารางไม่พบ mismatch ไม่ใช่ DBML parser หรือผล catalog จริง

- Rev2 อ่านกติการ่วม normal-097/_common.txt, รายงาน normal-097/vault-A.out, index โครงการ/design, migration ทั้งห้าไฟล์ และ idempotency-001 Rev2; เทียบ forward กับ physical delta แบบ static ไม่ได้อ่าน baseline/DBML/dictionary ซ้ำ ผล mismatch ข้างต้นเป็นรายการส่งต่อจาก Rev1 ไม่ใช่หลักฐานว่า arch ยังไม่ได้แก้

