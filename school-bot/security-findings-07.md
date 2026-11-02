# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; KMS คือ Key Management Service; DDL คือ Data Definition Language.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-009 — [DES-002 (License และ device binding)](design/des-002.md) ให้ replay คืน license key เดิมจาก replay window ที่เข้ารหัส ทำให้ต้องเก็บ secret ไว้ในตาราง idempotency

**สถานะปัจจุบัน:** เปิด · Medium. [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](requirement/decisions-046.md) อนุมัติเพดาน replay 15 นาที (900 วินาที) แล้ว ใช้ TTL พร้อมจำกัดจำนวน replay แทนลบหลังอ่านครั้งแรก. ลบ ciphertext และปฏิเสธเมื่อ now()>=ReplayUntil. หลังหน้าต่างคืน IDEMPOTENCY_EXPIRED+resource_id แล้ว rotate. แบบ DES-002 Rev3, [License admin authorization และ replay](design/license-admin-security-001.md) และกฎข้อมูล Rev8 รวมเงื่อนไขแล้ว แต่ยังต้องพิสูจน์ implementation และ backup expiry. ข้อสรุปไม่แก้ DDL ไม่ปิดข้อนี้ และต้องคำนึงถึง MVCC (Multi-Version Concurrency Control), WAL (Write-Ahead Log) และ backup.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ตาราง SchoolBotIdempotency กลายเป็นที่เก็บ license key ที่ถอดรหัสได้ ถ้า DB หรือ key ของการเข้ารหัสรั่วจะได้ key ใช้งานได้จริง และ audit/log อาจพลอยบันทึกค่านั้น

วิธีแก้: ไม่เก็บ key ใน idempotency: ถ้า response หาย ให้ผู้ดูแลออก key ใหม่และเพิกถอนตัวเดิม (rotate); ถ้าต้องคง replay ให้ใช้ envelope encryption ด้วย KMS key แยก, TTL สั้น, ลบเมื่อหมด ReplayUntil และตรวจตอนอ่าน พร้อมจำกัดจำนวน replay และห้ามอยู่ใน audit/log/backup นานกว่า TTL

ผู้รับ: sa (แก้ contract) และ be

การตรวจซ้ำ: jpo ตรวจ DDL/ข้อมูลตัวอย่างว่าไม่มี key ถอดรหัสได้ค้างเกิน TTL และ list/audit ไม่คืน key

เงื่อนไขลดความเสี่ยงและปิดข้อค้นพบ: ถ้า implement แล้ว re-audit ผ่านจะแก้ได้ หากเลือกไม่เก็บ secret ใน idempotency จะตัดความเสี่ยงส่วนนี้ได้ แต่ไม่จำเป็นต้องเปลี่ยนสัญญาหากคง encrypted replay ตามเงื่อนไขต่อไปนี้ วิธีเรียบง่ายกว่าที่รักษา DES-002: กำหนด replay เฉพาะ create-license 15 นาทีที่อนุมัติแล้ว แทน 24 ชม. ทั่วไป (data-contract-rules) ใช้ envelope ผ่าน ResultKeyId ที่มีแล้ว ลบ ciphertext เมื่อหมด ReplayUntil และตรวจตอนอ่านด้วย หลังหน้าต่างให้ได้ IDEMPOTENCY_EXPIRED+resource_id แล้ว admin rotate DDL ร่าง db/schoolbot_db.sql (ดูหลักฐาน) มี ResultCipher/ResultKeyId/ReplayUntil อยู่แล้วและไม่มี CHECK จำกัด ReplayUntil จึงไม่น่าต้องเปลี่ยน schema (vault ยืนยัน) ไม่เป็น breaking เพราะเข้มกว่าเดิมและ DES-002 ยัง PROPOSED หน้าต่างสั้นจำเป็นจริง เพราะ 24 ชม. คือเก็บ key ใช้งานได้นานเกินเหตุ (retry จริงเกิดในวินาที–นาที) ใช้ TTL + จำกัดจำนวน replay เพื่อให้ retry กรณี response แรกหายยังได้ key คง Medium

ข้อมูลที่ยังต้องระบุ: ไม่ต้องให้คนตัดสินด้านความปลอดภัยถ้าใช้แบบ tightening ให้ arch/SA ระบุ TTL ใน DES-002/[กฎข้อมูลและ HTTP contract ร่วม](design/data-contract-rules.md) ให้ชัด เจ้าของ schema/API ตัดสินเฉพาะเมื่อเลือกไม่คืน key เดิมผ่าน replay ซึ่งเปลี่ยนสัญญา

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตามมติ 046.

## หลักฐาน

- SEC001-009: knowledge/school-bot/design/des-002.md:51
- งานที่รับข้อค้นพบนี้: BE-003, DBA-002, SA-001
- planning/security-mitigation-001.md (memory)
- planning/security-gap-sync-review-001.md (memory)
- db/schoolbot_db.sql:142-167
- DES-002:51 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
- data-contract-rules:41 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
