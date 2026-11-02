# DES-002 — License และ device binding — การบันทึกเป็นหน่วยเดียวและการลองซ้ำ

> Rev 3 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-002 — License และ device binding](des-002.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `S` = SchoolId; `U` = UUID; `N` = integer ≥1 ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## อ้างอิง

- [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](../requirement/decisions-046.md)

## การบันทึกเป็นหน่วยเดียวและการลองซ้ำ

Transaction ล็อก License และตรวจ key hash, expiry, revoke, current binding, idempotency แล้วจึงเปลี่ยน binding/ออกสิทธิ์/เขียน audit/result พร้อมกัน Signer หรือ commit ล้มเหลวไม่ส่งผลสำเร็จ

- Activate เครื่องเดิมที่ยังผูก: ไม่เพิ่ม binding; ตรวจออนไลน์ใหม่ได้
- สองเครื่อง activate พร้อมกัน: สำเร็จหนึ่ง อีกเครื่อง `409 DEVICE_LIMIT`
- Validate ไม่สร้าง binding; ไม่เคย activate → `403 DEVICE_NOT_ACTIVATED`
- Unbind เพิ่ม BindingEpoch, detach เครื่องเก่า และเปิดให้เครื่องใหม่ activate ทันที ไม่รอ 3 วัน
- Fingerprint ที่เคย detached ห้าม activate กลับเอง แม้ช่วงยังไม่มีเครื่องใหม่; ผู้ดูแลระบุ `next_device_jkt` จึงอนุญาตตัวนั้นได้ หากระบุแล้วรับเฉพาะตัวนั้นจน activate
- Retry เดิมคืนผลเดิมและ expiry เดิม ไม่ถือเป็น online check ใหม่; ตรวจ authorization/current binding ก่อน replay entitlement เสมอ
- Create key replay ตาม [license admin security](license-admin-security-001.md): TTL 15 นาที (ผู้ใช้อนุมัติตาม decisions-046), ตรวจ ReplayUntil ตอนอ่านและล้าง ResultCipher/ResultKeyId เมื่อหมดอายุ; คง tombstone และไม่ลบหลังอ่านครั้งแรก
- Timeout/5xx retry key เดิม; 429 รอ Retry-After; 4xx ไม่ retry อัตโนมัติ; idempotency payload ต่าง → 409

## Signed entitlement

JSON Web Signature (JWS) ES256 header `{typ:"schoolbot-entitlement+jwt",alg:"ES256",kid}`; claims:
`{iss,aud:"schoolbot-desktop",jti:U,license_id:K,school_id:S,binding_id:K,binding_epoch:N,cnf:{jkt},modes:["block","arm","code"],iat,nbf,checked_at,exp,license_expires_at}`

เวลาเป็น UTC epoch seconds; `iat=nbf=checked_at`; `exp=min(checked_at+259200,license_expires_at)` ครบกำหนดเมื่อ now≥exp ไม่มี grace ต่อจากการเปิดแอป

Signer อยู่ server Key Management Service (KMS)/Hardware Security Module (HSM) ที่เสนอ ใช้ key แยกจาก update/content signing Desktop ฝัง public trust root; rotation keyset ต้อง root-sign และมี version/expiry; เก็บ verifier key เก่าจน entitlement สุดท้ายหมด Unknown/revoked kid ต้อง online ไม่รับ keyset จาก URL ใน token

