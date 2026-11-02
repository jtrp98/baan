# Custody matrix

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

| Key / การใช้ | ผู้ถือ / ที่เก็บ | ใครสั่งใช้ได้ | Rotation / revoke | Backup / หลักฐานที่ขาด |
|---|---|---|---|---|
| Entitlement ES256 | เจ้าของ infra/release ยังไม่ระบุ; เสนอ KMS sign-only หรือ signer แยก process/identity ห้ามไฟล์ key บน API host | SchoolBot gRPC service identity ที่อนุญาต; signer ตรวจ typ/aud/kid/license expiry และ exp≤min(now+259200,license_expires_at) เอง | root-signed keyset มี version/expiry; revoke kid แล้ว online recovery; เก็บ verifier เก่าจน lease สุดท้ายหมด | ชื่อผู้ถือ/service/store, policy, restore access ยังไม่ทราบ; audit ทุก sign และ test exp>3วัน/revoke kid ต้องมี |
| Release manifest ES256 | owner ยังไม่ระบุ; signer นอก API host | ตรวจ immutable CI registry ด้วยตนเองตาม DES-007 ก่อน sign; release_publisher ไม่มีสิทธิ์เขียน registry | root-signed rotation; withdraw registry entry/release ไม่อนุญาต sign/install ใหม่ | แยกจาก entitlement; ต้องมี access audit, recovery/backup owner, การ revoke หลัง incident |
| Windows Authenticode | ผู้ถือ OS cert ยังไม่ระบุ; protected CI/token ที่องค์กรเลือก | pipeline identity ที่มีสิทธิ์ sign artifact หลังตรวจ build | host pin subject+thumbprint; เปลี่ยน pin ผ่าน trusted rollout ก่อน cert เก่าหมดอายุ/ถอน | ต้องเติม subject/thumbprint สาธารณะและ owner; เก็บ recovery material เข้ารหัสตามวิธีที่เจ้าของรับรอง |
| Apple Developer ID Application/Installer | ผู้ถือ account/cert ยังไม่ระบุ; protected CI/token | pipeline sign/notarize app/engines/PKG | host pin Apple Team ID; ตรวจ Developer ID/notarization ไม่รับ Team ID จาก manifest | ต้องเติม Team ID, ผู้ดูแล account/notarization และ restore/revoke procedure; ไม่มี secret ใน proof pack |
| Public trust-root/keyset signing | ผู้ถือ root ยังไม่ระบุ; เสนอแยกสิทธิ์จาก online signer | เฉพาะผู้ดูแล rotation ที่ระบุจริง | version/expiry/revoked kid; client ไม่เชื่อ key จาก URL ใน token | ต้องระบุ custodian/backup/กู้กรณี root สูญหาย; offline root/HSM/dual control เป็นทางเลือกไม่ใช่มติใหม่ |
| Idempotency envelope สำหรับ create-license | owner ยังไม่ระบุ; encryption service/KMS นอก DB และ API host | เฉพาะ operation/Principal เดิมที่ผ่าน authz และยังไม่ถึง ReplayUntil | rotation ตาม ResultKeyId; หลัง TTL ทำให้ ciphertext เก่าถอดไม่ได้พร้อมล้าง ResultCipher/ResultKeyId | ต้องพิสูจน์ backup residual ไม่เกิน TTL; key ที่ใช้ร่วมระยะยาวไม่พอ ต้องมี expiry ของ material ต่อช่วง/ผลตอบและห้าม restore material ที่หมดอายุ |
| Device P-256 / License key | OS credential store ของเครื่อง; ไม่ใช่ server signing key | Desktop host เท่านั้น; renderer ไม่ได้รับ private key | unbind/epoch/revoke ตาม DES-002 | shared OS user/cloned VM/rollback เป็นข้อจำกัดเดิม; วิธี custody ที่องค์กรใช้ยังต้องยืนยัน |
| Content bundle key (conditional) | ยังไม่มีผู้ถือ/ที่เก็บที่ยืนยัน | ใช้เมื่อเลือก implement signed published bundle ใน DES-005 เท่านั้น | แยก key/rotation จากสอง signer หลัก | ไม่สร้าง key เพียงเพราะมีแถวนี้; รอ scoped contract เดิม |

## วิธีอ่าน

อ่านส่วนต่อด้านล่างตามลำดับ สัญญาและหลักฐานคง Rev เดียวกัน ทุกตารางและเงื่อนไขเดิมอยู่ในส่วนต่อ.

1. [รายละเอียดสัญญา](signing-custody-001-contract.md)
2. [หลักฐาน](signing-custody-001-validation.md)
