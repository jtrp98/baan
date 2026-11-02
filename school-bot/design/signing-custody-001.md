# Custody matrix — Rev2

ร่าง SEC001-006/003/009; อ่าน [DES-002](des-002.md), [DES-007](des-007.md), mitigation ล่าสุด (memory: planning/security-mitigation-001.md). สถานะที่ [index](index.md); ตารางไม่บรรจุ key/certificate ส่วน private

| Key / การใช้ | ผู้ถือ / ที่เก็บ | ใครสั่งใช้ได้ | Rotation / revoke | Backup / หลักฐานที่ขาด |
|---|---|---|---|---|
| Entitlement ES256 | เจ้าของ infra/release ยังไม่ระบุ; เสนอ KMS sign-only หรือ signer แยก process/identity ห้ามไฟล์ key บน API host | B identity ที่อนุญาต; signer ตรวจ typ/aud/kid/license expiry และ exp≤min(now+259200,license_expires_at) เอง | root-signed keyset มี version/expiry; revoke kid แล้ว online recovery; เก็บ verifier เก่าจน lease สุดท้ายหมด | ชื่อผู้ถือ/service/store, policy, restore access ยังไม่ทราบ; audit ทุก sign และ test exp>3วัน/revoke kid ต้องมี |
| Release manifest ES256 | owner ยังไม่ระบุ; signer นอก API host | ตรวจ immutable CI registry ด้วยตนเองตาม DES-007 ก่อน sign; release_publisher ไม่มีสิทธิ์เขียน registry | root-signed rotation; withdraw registry entry/release ไม่อนุญาต sign/install ใหม่ | แยกจาก entitlement; ต้องมี access audit, recovery/backup owner, การ revoke หลัง incident |
| Windows Authenticode | ผู้ถือ OS cert ยังไม่ระบุ; protected CI/token ที่องค์กรเลือก | pipeline identity ที่มีสิทธิ์ sign artifact หลังตรวจ build | host pin subject+thumbprint; เปลี่ยน pin ผ่าน trusted rollout ก่อน cert เก่าหมดอายุ/ถอน | ต้องเติม subject/thumbprint สาธารณะและ owner; เก็บ recovery material เข้ารหัสตามวิธีที่เจ้าของรับรอง |
| Apple Developer ID Application/Installer | ผู้ถือ account/cert ยังไม่ระบุ; protected CI/token | pipeline sign/notarize app/engines/PKG | host pin Apple Team ID; ตรวจ Developer ID/notarization ไม่รับ Team ID จาก manifest | ต้องเติม Team ID, ผู้ดูแล account/notarization และ restore/revoke procedure; ไม่มี secret ใน proof pack |
| Public trust-root/keyset signing | ผู้ถือ root ยังไม่ระบุ; เสนอแยกสิทธิ์จาก online signer | เฉพาะผู้ดูแล rotation ที่ระบุจริง | version/expiry/revoked kid; client ไม่เชื่อ key จาก URL ใน token | ต้องระบุ custodian/backup/กู้กรณี root สูญหาย; offline root/HSM/dual control เป็นทางเลือกไม่ใช่มติใหม่ |
| Idempotency envelope สำหรับ create-license | owner ยังไม่ระบุ; encryption service/KMS นอก DB และ API host | เฉพาะ operation/Principal เดิมที่ผ่าน authz และยังไม่ถึง ReplayUntil | rotation ตาม ResultKeyId; หลัง TTL ทำให้ ciphertext เก่าถอดไม่ได้พร้อมล้าง ResultCipher/ResultKeyId | ต้องพิสูจน์ backup residual ไม่เกิน TTL; key ที่ใช้ร่วมระยะยาวไม่พอ ต้องมี expiry ของ material ต่อช่วง/ผลตอบและห้าม restore material ที่หมดอายุ |
| Device P-256 / License key | OS credential store ของเครื่อง; ไม่ใช่ server signing key | Desktop host เท่านั้น; renderer ไม่ได้รับ private key | unbind/epoch/revoke ตาม DES-002 | shared OS user/cloned VM/rollback เป็นข้อจำกัดเดิม; วิธี custody ที่องค์กรใช้ยังต้องยืนยัน |
| Content bundle key (conditional) | ยังไม่มีผู้ถือ/ที่เก็บที่ยืนยัน | ใช้เมื่อเลือก implement signed published bundle ใน DES-005 เท่านั้น | แยก key/rotation จากสอง signer หลัก | ไม่สร้าง key เพียงเพราะมีแถวนี้; รอ scoped contract เดิม |

ทุกแถวต้องเติม **ผู้รับผิดชอบจริง, store/service identifier, identities ที่ sign/decrypt ได้, ผู้ rotate/revoke, รอบ/trigger, ผู้เข้าถึง backup และ evidence_ref** ก่อนใช้เป็นหลักฐาน custody. ไม่กำหนดชื่อบุคคลแทนเจ้าของ. ไม่มีหลักฐาน runtime ว่า KMS/CI/token/backup isolation นี้มีแล้ว

SEC001-003 เลือก registry-gated signer เพื่อคง server-assigned release_id; ทาง manifest ลงนามใน CI ทั้งก้อนต้องปรับ API flow จึงไม่เลือกในรอบนี้. Release publisher รายบุคคล+audit ไม่ทดแทน OS publisher pin. CI required reviewer/four-eyes หรือ hardware token มีผลเรื่องผู้ควบคุม signing; เจ้าของ release/infra ต้องระบุของที่มีและผู้มีอำนาจตัดสิน residual ตามเงื่อนไข jpo ไม่ขยาย H6/รับความเสี่ยงเอง

TTL create-license 15 นาที (ผู้ใช้อนุมัติตาม decisions-046) ไม่ใช่การพิสูจน์ว่า backup ถูกทำลายแล้ว. ถ้า infrastructure ยังบังคับ ciphertext expiry ไม่ได้ให้บันทึก evidence gap ไว้ใน SEC001-009 ห้ามอ้างว่าการ purge live DB อย่างเดียวปิด finding; ไม่เปลี่ยน replay เป็น key:null โดยไม่มี human gate ของ breaking contract

Proof ที่ต้องแนบ: key inventory เฉพาะ metadata, sign/decrypt policy, negative tests (caller ผิด/expเกิน/registryไม่ตรง/publisherอื่น), access audit ที่ตรวจข้อมูลก่อนนำเข้า knowledge ตาม [export proof pack](export-proof-pack-001.md), rotation+revoke rehearsal และ backup/restore-expiry test. เติมเกณฑ์ตาม mitigation เดิมดังนี้:

- **Entitlement signer rate limit:** ระบุ policy/config, caller/identity, limit/window และจุดบังคับจริง พร้อมผลทดสอบต่ำกว่า/เกิน limit/กลับมาใช้ได้ตาม policy และ audit ว่าคำขอที่ถูกจำกัดไม่เกิด sign; ไม่กำหนดตัวเลขใหม่. ข้อเท็จจริง as-built: `C:/src/schoolbright/target/school-bot/web/src/SchoolBot.Api/Program.cs:49–62,101–105` มี rate limit ของ HTTP license endpoints ยังไม่พิสูจน์ rate limit ที่ entitlement signer
- **ไม่พบ private key:** แนบผลสแกน repo/payload/CI/log แยกครบสี่พื้นที่ ระบุ source revision, artifact/run, เครื่องมือ/version/rules, ขอบเขต/ข้อยกเว้น และเวลาตรวจ. ห้ามแนบค่า key/snippet; ส่วนที่ไม่ได้สแกนเป็น evidence gap ไม่ใช่ผลว่าไม่พบ และสรุปเฉพาะขอบเขตที่ตรวจจริง
- **สิทธิ์ custody จริง:** เทียบบุคคล/service identity ที่เขียน registry กับผู้ publish, ผู้สั่ง sign/ผู้ลงนาม และผู้เข้าถึง recovery material รวม restore/decrypt/สิทธิ์ผ่านกลุ่มหรือ role. แนบ access policy/audit และ negative test ว่า publisher/API เขียน registry เองไม่ได้; ระบุสิทธิ์ซ้อน/ข้อจำกัดให้เจ้าของ release/infra และ jpo ตรวจตาม gate เดิม ไม่สรุปการแยกสิทธิ์จากชื่อตำแหน่ง และไม่เพิ่ม four-eyes

ทุกผลตรวจผูก environment, expected/actual และ evidence_ref; เจ้าของรับรองข้อเท็จจริงตามหน้าที่เดิม. งานนี้ไม่มีการสร้าง key/sign artifact หรือ re-audit

## Change Log
- 2026-10-24 — Rev2: ใบงาน060g ตาม jpo060f ข้อ 3 เติมหลักฐาน signer rate limit, สแกน private key และเทียบสิทธิ์ registry/publish/sign/recovery ตาม mitigation เดิม; ไม่เปลี่ยน task/gates
- 2026-10-24 — Rev1: ใบงาน060a ร่าง custody ครบผู้ถือ/ที่เก็บ/สิทธิ์/rotation/revoke/backup และแยก unknown จากข้อเสนอ

- 2026-10-26 — แก้ป้าย create-license TTL 15 นาทีตาม decisions-046 (แก้ตาม sweep); ไม่เปลี่ยน logic/ผลทดสอบ/สมมติฐานอื่น
