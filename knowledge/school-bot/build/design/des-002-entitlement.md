# DES-002 — License และ device binding — การบันทึกเป็นหน่วยเดียวและการลองซ้ำ

> Rev 4 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (กำหนดหน่วย commit และ lease patch ของทุก License writer)

ส่วนต่อของ [DES-002 — License และ device binding](des-002.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `S` = SchoolId; `U` = UUID; `N` = integer ≥1 ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## การบันทึกเป็นหน่วยเดียวและการลองซ้ำ

Transaction ล็อก License และตรวจ key hash, expiry, revoke, current binding, idempotency ตาม [เงื่อนไข CAS](des-002.md#เงื่อนไขร่วมก่อน-commit) แล้วเตรียม binding/สิทธิ์/audit/result เป็นหน่วยเดียว Signer หรือ commit ล้มเหลวไม่ส่งผลสำเร็จ

### หน่วย commit ของแต่ละ writer

| Writer | License | Binding | ผลร่วมในหน่วยเดียว |
|---|---|---|---|
| Activate เครื่องใหม่ | ตั้ง `CurrentBindingId` เป็น ID ใหม่, ล้าง `AllowedNextJkt`, เปลี่ยน `UpdateDate`; คง BindingEpoch ล่าสุด | เพิ่มหนึ่งแถว: `Epoch=License.BindingEpoch`, `DetachedAt=null`, key/School/License ตรงกัน; ตั้ง ActivatedAt, LastCheckedAt, LastEntitlementExpiresAt และ metadata สร้างแถว | activation audit และ idempotency result ที่ผูก binding/epoch/response เดียวกัน |
| Activate เครื่องเดิม | ไม่เปลี่ยน License ทุก field | lease patch เช่น validate; ไม่เพิ่มแถว | audit ของ operation และ activation idempotency result; replay ไม่เป็น online check ใหม่ |
| Validate | ไม่เปลี่ยน License ทุก field | เปลี่ยนได้เฉพาะ `LastCheckedAt`, `LastEntitlementExpiresAt`, `UpdateDate` ของ current live binding | validation audit/result ของครั้งนี้; idempotency ถ้ามีตาม surface อยู่ในหน่วยเดียว ไม่เพิ่ม header ใหม่ให้ validate |
| Unbind | `CurrentBindingId=null`, `BindingEpoch=ค่าล่าสุด+1`, `AllowedNextJkt=next_device_jkt` หรือ null; เปลี่ยน UpdateBy/UpdateDate | current binding ตั้ง DetachedAt และ UpdateBy/UpdateDate; คง epoch/key/ActivatedAt/lease เดิม; ไม่มี current ก็ยังบันทึกสิทธิ์เครื่องถัดไปได้ | admin audit รวม actor/reason และ idempotency result; ไม่ต่อสิทธิ์ออฟไลน์ |
| Revoke | ตั้ง RevokedAt และ UpdateBy/UpdateDate; คง pointer/epoch/AllowedNextJkt ล่าสุด | ไม่เปลี่ยน binding/lease/DetachedAt; License inactive ปฏิเสธทุก online writer | admin audit รวม actor/reason และ idempotency result; ไม่เขียน binding snapshot เก่า |

ใช้ `SchoolBotAuditEvent` และ `SchoolBotIdempotency` ตาม [กฎเดิม](data-contract-rules-grades.md) ไม่เสนอ schema ใหม่ แถว audit/idempotency ที่ operation ต้องสร้างหรือเปลี่ยนอยู่ใน commit เดียวกับ domain mutation ไม่เขียนตามหลัง success ผลตอบกลับต้องสร้างจากข้อมูลชุดที่ commit ยืนยัน การปฏิเสธไม่เพิ่ม success audit, ไม่เลื่อน replay expiry และไม่เก็บผลสำเร็จ

### Lease patch และผลตอบกลับ

Repository รับ identity/ค่าที่คาดหวังและ lease patch ไม่ใช้ record ทั้งแถวแทนที่ แม้ signature เดิมรับ record ก็ต้องละทิ้ง fields อื่นและห้าม bypass CAS ทุก field ต่อไปนี้ห้าม validate/activate เครื่องเดิมเปลี่ยน: ID, LicenseId, SchoolId, DeviceJkt, PublicJwk, Epoch, ActivatedAt, DetachedAt, IsDelete, CreateBy/CreateDate และ UpdateBy

แถวที่ DetachedAt มีค่าแล้วห้ามต่อ lease หรือแก้ metadata ด้วย validate เมื่อ admin อนุญาต key เดิมผ่าน next_device_jkt ให้ activate สร้างแถวใหม่ตาม epoch ปัจจุบัน ไม่ล้าง DetachedAt ของประวัติ

กำหนด checked_at ฝั่ง server ภายในหน่วย commit จากเวลาปัจจุบันและ LastCheckedAt ล่าสุดโดยไม่ถอยหลัง; คำนวณ expiry จาก checked_at และ License.ExpiresAt ล่าสุด เตรียม signed response ก่อนเผยแพร่ commit ถ้า signer ล้มเหลวคงข้อมูลเดิมทั้งหมด หน่วย commit คืน License/Binding/checked_at/expiry ที่ยืนยันให้ service ใช้ ห้ามออก token จาก snapshot ก่อน CAS

ถ้า unbind/revoke commit ก่อน lease writer ต้องปฏิเสธตาม DES-002 ถ้า lease commit ก่อน unbind สิทธิ์นั้นเป็นสิทธิ์เดิมจน exp ตาม REQ-035 (ผู้ดูแลย้ายเครื่อง) ไม่ใช่การต่อหลังถอดเครื่อง

- Activate เครื่องเดิมที่ยังผูก: ไม่เพิ่ม binding; ตรวจออนไลน์ใหม่ได้
- สองเครื่อง activate พร้อมกัน: สำเร็จหนึ่ง อีกเครื่อง `409 DEVICE_LIMIT`
- Validate ไม่สร้าง binding; ไม่เคย activate → `403 DEVICE_NOT_ACTIVATED`
- Unbind เพิ่ม BindingEpoch, detach เครื่องเก่า และเปิดให้เครื่องใหม่ activate ทันที ไม่รอ 3 วัน
- Fingerprint ที่เคย detached ห้าม activate กลับเอง แม้ช่วงยังไม่มีเครื่องใหม่; ผู้ดูแลระบุ `next_device_jkt` จึงอนุญาตตัวนั้นได้ หากระบุแล้วรับเฉพาะตัวนั้นจน activate
- Retry เดิมคืนผลเดิมและ expiry เดิม ไม่ถือเป็น online check ใหม่; ตรวจ authorization/current binding ก่อน replay entitlement เสมอ
- Create key replay ตาม [license admin security](license-admin-security-001.md): TTL 15 นาที (ผู้ใช้อนุมัติตาม [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](../../shared/decisions/decisions-046.md)), ตรวจ ReplayUntil ตอนอ่านและล้าง ResultCipher/ResultKeyId เมื่อหมดอายุ; คง tombstone และไม่ลบหลังอ่านครั้งแรก
- Timeout/5xx retry key เดิม; 429 รอ Retry-After; 4xx ไม่ retry อัตโนมัติ; idempotency payload ต่าง → 409

## Signed entitlement

JSON Web Signature (JWS) ES256 header `{typ:"schoolbot-entitlement+jwt",alg:"ES256",kid}`; claims:
`{iss,aud:"schoolbot-desktop",jti:U,license_id:K,school_id:S,binding_id:K,binding_epoch:N,cnf:{jkt},modes:["block","arm","code"],iat,nbf,checked_at,exp,license_expires_at}`

เวลาเป็น UTC epoch seconds; `iat=nbf=checked_at`; `exp=min(checked_at+259200,license_expires_at)` ครบกำหนดเมื่อ now≥exp ไม่มี grace ต่อจากการเปิดแอป

Signer อยู่ server Key Management Service (KMS)/Hardware Security Module (HSM) ที่เสนอ ใช้ key แยกจาก update/content signing Desktop ฝัง public trust root; rotation keyset ต้อง root-sign และมี version/expiry; เก็บ verifier key เก่าจน entitlement สุดท้ายหมด Unknown/revoked kid ต้อง online ไม่รับ keyset จาก URL ใน token

## หลักฐาน

- ตรวจ source 2026-11-03 ใต้ `C:/src/schoolbright/target/school-bot/web/src/`: fields ใน `SchoolBot.Domain/Licensing/SchoolBotLicenseRecord.cs:3–53`; mutation ใน `SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:171–219,270–335,385–439,462–515`
- Service ยังใช้เวลา/record ก่อน commit และไม่ใช้ค่าที่ UpdateBindingAsync คืน: `SchoolBot.Application/Licensing/LicenseDeviceService.cs:156–170,217–228,301–318`; admin reason ยังไม่เข้า commit audit: `SchoolBot.Application/Licensing/LicenseAdminService.cs:169–217`
- ตาราง/patch เป็นสัญญา ไม่ใช่ผล runtime; [ช่องว่างจาก source](des-002.md#ข้อเท็จจริงจาก-source-และข้อที่ต้องแก้) และ [setup พิสูจน์](data-contract-rules-transactions.md)
