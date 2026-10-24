# Custody matrix — Rev1

ร่าง SEC001-006/003/009; อ่าน [DES-002](des-002.md), [DES-007](des-007.md), [mitigation ล่าสุด](../planning/security-mitigation-001.md). สถานะที่ [index](index.md); ตารางไม่บรรจุ key/certificate ส่วน private

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

ข้อเสนอ TTL create-license 15 นาที (สมมติฐาน — ยังไม่ยืนยัน) ไม่ใช่การพิสูจน์ว่า backup ถูกทำลายแล้ว. ถ้า infrastructure ยังบังคับ ciphertext expiry ไม่ได้ให้บันทึก evidence gap ไว้ใน SEC001-009 ห้ามอ้างว่าการ purge live DB อย่างเดียวปิด finding; ไม่เปลี่ยน replay เป็น key:null โดยไม่มี human gate ของ breaking contract

Proof ที่ต้องแนบ: key inventory เฉพาะ metadata, sign/decrypt policy, negative tests (caller ผิด/expเกิน/registryไม่ตรง/publisherอื่น), access audit ปิดบังข้อมูล, rotation+revoke rehearsal และ backup/restore-expiry test. งานนี้ไม่มีการสร้าง key/sign artifact หรือ re-audit

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a ร่าง custody ครบผู้ถือ/ที่เก็บ/สิทธิ์/rotation/revoke/backup และแยก unknown จากข้อเสนอ
