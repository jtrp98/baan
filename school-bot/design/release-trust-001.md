# Manifest signer และ publisher pin

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## เอกสารอ้างอิง

[DES-007 (Release และ trusted update)](des-007.md) · [SEC001-003 (ความเชื่อถือ signer และ artifact registry)](release-trust-001.md) · [SEC001-006 (ผู้ถือและสิทธิ์ใช้ signing keys)](signing-custody-001.md)

ต่อจาก [DES-007](des-007.md); SEC001-003/SEC001-006. สถานะอยู่ที่ [index](index.md); API เดิมผ่าน HTTP API Gateway ไม่เพิ่ม public signer

## ผู้ลงนามและ pipeline registry

Server ตรวจ manifest signature/fields/artifact identity ก่อน publish; เลือกทาง **signer เทียบ trusted pipeline registry** ตาม SEC001-003 เพื่อคง API จัดสรร release_id เดิม. Continuous Integration (CI) protected environment ลงทะเบียน immutable artifact entry หลัง signing/notarization; registry ต้องยืนยัน exact tuple version/channel/platform/url/sha256/size/package_kind/min_os/engine_hashes และหลักฐาน pipeline. ไม่รับการลงทะเบียนจาก release_publisher/API เอง. evidence_ref ต้อง resolve เป็น entry นี้ ไม่ใช่ URL ที่ client อ้างลอย ๆ; signer ปฏิเสธ tuple ไม่ตรง/entry ถูกถอน/หมดอายุโดยไม่ sign และ API ไม่ fetch arbitrary URL ไป execute

`ReleaseManifestInput` คือ payload ข้างต้นที่ไม่มี release_id; client ไม่ส่ง primary key/JSON Web Signature (JWS). API จัดสรร release_id (PostgreSQL int4 ช่วง 1–2147483647) แล้วเรียก signer แยก process/identity ซึ่งตรวจ registry ด้วยตนเองก่อนลงนาม payload ที่เติม release_id; ไม่ sign input จาก API โดยเชื่อว่า API ตรวจแล้ว. Signer กำหนด/ตรวจ issued_at/expires_at ตาม policy ที่เจ้าของ signing ยืนยัน; ไม่ให้ API ต่ออายุ artifact ที่ CI ถอน. เก็บ Manifest หลังตรวจกลับ; signer/commit ล้มเหลวไม่คืนสำเร็จ. Retry key เดิมคืน release เดิม ไม่สร้างใหม่. IDs ใน path/summary/check/PrepareUpdate เป็น release_id ชนิดเดียวกัน; download_id เป็น UUID เป็น host handle ไม่ใช่ primary key ของฐานข้อมูล. Audit publish/withdraw ผูก sEmp+release_id+evidence_ref (withdraw ใช้ registry ref ของ release เดิมพร้อม reason)

ปัดตก unrestricted online signer เพราะ API ที่ถูกยึดสั่ง sign artifact ใดก็ได้. ทาง sign manifest ทั้งก้อนใน Continuous Integration (CI) protected env แล้ว API verify/store ใช้ได้เชิง security แต่ชนขั้นตอน server-assigned release_id จึงต้องเปลี่ยน create/publish flow; งานนี้เลือก registry check เพื่อคง flow เดิม ไม่เพิ่ม endpoint/คอลัมน์. CI required reviewer/four-eyes เพิ่มเติมกับ release ยังเป็นทางเลือกให้คนตาม disposition security เดิม ไม่ขยาย H6 เอง. Custody/ผู้ถือ OS cert และค่าที่จะ pin ยังต้องมีหลักฐานตาม [custody matrix](signing-custody-001.md)

## Host publisher identity

Desktop host ต้อง pin publisher identity ใน trust configuration ที่แจกพร้อม host: Windows ตรวจ Authenticode chain พร้อม expected subject และ certificate thumbprint allowlist; macOS ตรวจ Developer ID/notarization พร้อม expected Apple Team ID ทั้ง package/app/engines. ลายเซ็น valid ของผู้เผยแพร่อื่นต้อง `ARTIFACT_UNTRUSTED`; ห้ามอ่าน expected subject/thumbprint/Team ID จาก manifest ที่กำลังตรวจ. ค่า pin จริงยังไม่ทราบ จึง fail closed เมื่อไม่มี ไม่ใช้ wildcard. Rotation เปลี่ยนผ่าน trusted host/keyset rollout ที่ตรวจแล้ว ไม่ fallback ยอมทุก publisher. ตรวจซ้ำก่อน install จาก protected staging รวม origin allowlist, ไม่ตาม cross-origin redirect, downgrade/expiry/withdraw; ไม่อ้างว่า hash+JWS อิสระจาก signer

Negative proof: signature ถูกแต่ publisher อื่น, registry tuple ไม่ตรง, API พยายามลงทะเบียนเอง, expired/withdrawn entry, cross-origin redirect, downgrade และไฟล์ถูกสลับหลัง verify. ไม่ปิด Important finding จน implementation/jpo re-audit; ยังไม่มีค่าของ cert/Team ID ที่ยืนยัน
