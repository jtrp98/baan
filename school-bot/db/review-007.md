# DB Review 007 — ยืนยันแนวทาง SEC001-009 (replay TTL ของ create-license) ไม่ต้องแก้ physical DDL

วันที่: 2026-10-24
บทบาท: vault (ผู้ดูแลห้องนิรภัย) — ตรวจเชิงเอกสารจาก DDL ร่างเท่านั้น ไม่รันคำสั่งใดต่อฐานข้อมูลใดทั้งสิ้น
อ้างอิง: db/schoolbot_db.sql (Rev5 DRAFT) บรรทัด 141–179 · planning/security-mitigation-001.md §SEC001-009 · db/review-005.md §2 (แถว ix_schoolbot_idempotency_replay_expiry) · decisions-030
สถานะ: PASS — ไม่ต้องแก้ physical DDL

## 1. คำถามของการตรวจ

SEC001-009 เสนอ: (1) หน้าต่าง replay สั้นเฉพาะ operation `create-license` (ข้อเสนอ ≤15 นาที) แทน 24 ชม. ทั่วไป (2) ใช้ envelope ผ่าน `ResultKeyId` ที่มีแล้ว (3) ลบ/เสื่อมอายุ `ResultCipher`/`ResultKeyId` เมื่อพ้น `ReplayUntil` และตรวจเวลาตอนอ่าน (4) หลังหน้าต่างคืน `IDEMPOTENCY_EXPIRED` + `resource_id` — แนวทางนี้ต้องแก้ physical DDL หรือไม่

## 2. หลักฐานจาก DDL จริง (db/schoolbot_db.sql)

ตาราง `"SchoolBotIdempotency"` — `CREATE TABLE` บรรทัด 142–167 (ตรงช่วงที่ SEC001-009 อ้าง):

| สิ่งที่แนวทางต้องการ | หลักฐานใน DDL (บรรทัด) | ผลตรวจ |
|---|---|---|
| เก็บ ciphertext + key id ของ response | `"ResultCipher" bytea NULL` (150), `"ResultKeyId" varchar(128) NULL` (151) | มีอยู่แล้ว |
| เก็บเวลาหมดอายุ replay | `"ReplayUntil" timestamptz NOT NULL` (154), `"CompletedAt"` (153) | มีอยู่แล้ว |
| TTL สั้น "เฉพาะ operation" | ไม่มี CHECK ใดอ้างถึง `ReplayUntil`/`CompletedAt` — ในตารางมี CHECK 2 ตัว: `CK_..._SchoolId_Scope` (162) และ `CK_..._CipherKeyPair` (163–166) | ตั้ง `ReplayUntil` ตาม operation ได้ในชั้น application ตอน INSERT ไม่ต้องแก้ DDL |
| ค่า Operation = create-license | `"Operation" varchar(200) NOT NULL` (145) | รองรับความยาว/ค่า |
| ลบ cipher เมื่อพ้น TTL | ทั้งสองคอลัมน์เป็น NULL-able — `UPDATE` ตั้ง NULL ทั้งคู่ผ่าน `CK_..._CipherKeyPair` (NULL+NULL ถูกอนุญาต) | ทำได้ด้วย UPDATE |
| กันสถานะ "กึ่งล้าง" (ลบ cipher ค้าง key id) | `CK_..._CipherKeyPair` บังคับ NULL หรือ NOT NULL เป็นคู่ | DDL บังคับ integrity ของ cleanup เอง — purge job ต้อง SET ทั้งสองคอลัมน์ในคำสั่งเดียว มิฉะนั้นชน CHECK |
| job เขียนโดยบัญชีแอป | `GRANT SELECT, INSERT, UPDATE ... TO schoolbot_app` (200–206); `CreateBy/UpdateBy NULL` = ระบบทำเอง (หัวไฟล์ บรรทัด 14) | cleanup job ใช้บัญชีเดิมได้ ไม่ต้องขยายสิทธิ์ |

ความยืนยันเพิ่มเติม: ข้อความใน SEC001-009 ว่า "DDL ร่าง db/schoolbot_db.sql:142-167 มี ResultCipher/ResultKeyId/ReplayUntil อยู่แล้วและไม่มี CHECK จำกัด ReplayUntil" — ตรวจแล้วถูกต้องทุกประเด็น uniqueness ที่เกี่ยว: `ux_schoolbot_idempotency_global`/`_tenant` (169–175) ใช้ `(Principal, Operation, RequestKey)` ไม่ขัดกับ TTL ราย operation; `ux_schoolbot_idempotency_nonce` (177–179) เป็นเรื่อง device challenge nonce แยกอิสระจาก key replay ของ create-license

## 3. ข้อสังเกต integrity (สิ่งที่ต้องมี "นอก" DDL)

1. read-time gate เป็นหลัก: ปฏิเสธ replay เมื่อ `now() >= ReplayUntil` (คืน IDEMPOTENCY_EXPIRED + resource_id) แม้ cleanup job ยังไม่รัน (SEC001-009 MUST-1) — เป็นเงื่อนไขของ application ไม่ใช่ schema (แก้ตาม jpo 060f: เดิมเขียน `>` ให้ตรงสัญญา ณ จุดหมดอายุพอดี)
2. ต้องมี cleanup job (MUST-2): `UPDATE ... SET "ResultCipher"=NULL, "ResultKeyId"=NULL WHERE "ReplayUntil" <= now() AND "ResultCipher" IS NOT NULL` — DDL ไม่มีกลไกอัตโนมัติ (ไม่มี trigger/partition/TTL policy) และไม่เสนอเพิ่มกลไกใดในรอบนี้ · คง tombstone ไม่ออก key ใหม่จาก retry และไม่บันทึก key/cipher ใน log/audit/error
3. performance: index `ix_schoolbot_idempotency_replay_expiry` เดิมถูกตัดออกตามมติผู้ใช้ 2026-10-22 (review-005 §2 แถวที่ 3) — cleanup job จะใช้ Seq Scan ยอมรับได้ตามมติ "ข้อมูลไม่เยอะ" และตาม review-006 (ห้ามเสนอเพิ่ม index/constraint สวนมติเดิม) — ถ้าอนาคตตารางโตจน purge กระทบ ต้องขอมติใหม่จากคนก่อน
4. ไม่มี CHECK บังคับ `ReplayUntil > CompletedAt` — คุมใน application ตอน INSERT; ไม่เสนอเพิ่ม CHECK ยิบย่อยสวนแนวตัดทอน Rev5
5. ตารางนี้ไม่มี FK จากตารางอื่นชี้มา — การ purge/update ไม่กระทบ referential integrity
6. retention: `schoolbot_app` ไม่มีสิทธิ์ DELETE — การลบแถว idempotency เก่า (ถ้าทำ) เป็นพระราชกิจของมนุษย์/DBA; การ audit การ purge (AuditEvent) เป็น optional ฝั่ง application — ห้ามบันทึก key/cipher ใน AuditEvent/log ตาม SEC001-009 MUST-4
7. แถวที่ purge แล้วยังคง Principal/RequestHash/ResourceId — เป็น metadata ไม่ใช่ key; จัดอยู่ใน [pii-inventory-001](pii-inventory-001.md) แล้ว

## 4. Verdict

**pass** — แนวทาง SEC001-009 ใช้ physical schema ปัจจุบันได้ทันที ไม่ต้องแก้ DDL; งานที่เหลือเป็นของ application (read-time gate + cleanup job + จำกัด TTL ตอน INSERT) และเอกสารสัญญา (arch/SA-001 ระบุค่า TTL เฉพาะ create-license ใน DES-002:51/data-contract-rules:41 ตามที่ SEC001-009 ส่งต่อ — ไม่ใช่งาน vault)

**ข้อจำกัดของข้อสรุปนี้ (เพิ่มตาม jpo 060f):** `UPDATE ... NULL` ไม่พิสูจน์การทำลายสำเนาใน MVCC/WAL/replica/backup และ tombstone ที่ยังคง Principal/ResourceId ก็ยังอาจเป็น PII — ข้อสรุป "ไม่ต้องแก้ DDL" จึง**ไม่ถือว่าปิด SEC001-009** (รอ backup expiry proof และ re-audit ตาม gate เดิม)

## Change Log

- 2026-10-24 — สร้างครั้งแรก (ใบงาน060c): ยืนยันไม่ต้องแก้ physical DDL พร้อมหลักฐานบรรทัดจริงจาก schoolbot_db.sql — รันโดย นายช่าง solo (subagent role vault)
- 2026-10-24 — แก้ตามผลตรวจ jpo ใบงาน060f (สวมบท vault โดยนายช่าง solo ตรง): เงื่อนไข read-time gate/cleanup เป็น `now() >= ReplayUntil`, คง tombstone/ไม่ออก key ใหม่/ไม่ log key, และระบุข้อจำกัด MVCC/WAL/backup ว่าไม่ปิด SEC001-009
