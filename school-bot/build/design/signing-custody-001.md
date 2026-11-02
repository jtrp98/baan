# Custody matrix

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [Matrix การถือและใช้ key](signing-custody-001-matrix.md)

## เอกสารอ้างอิง

[SEC001-006 (ผู้ถือและสิทธิ์ใช้ signing keys)](signing-custody-001.md) · [SEC001-003 (ความเชื่อถือ signer และ artifact registry)](release-trust-001.md) · [SEC001-009 (อายุข้อมูลลับที่เก็บเพื่อ replay License key)](license-admin-security-001.md) · [DES-002 (License และ device binding)](des-002.md) · [DES-007 (Release และ trusted update)](des-007.md)

## เงื่อนไข custody

ทุกแถวต้องเติม **ผู้รับผิดชอบจริง, store/service identifier, identities ที่ sign/decrypt ได้, ผู้ rotate/revoke, รอบ/trigger, ผู้เข้าถึง backup และ evidence_ref** ก่อนใช้เป็นหลักฐาน custody. ไม่กำหนดชื่อบุคคลแทนเจ้าของ. ไม่มีหลักฐาน runtime ว่า KMS/CI/token/backup isolation นี้มีแล้ว

SEC001-003 เลือก registry-gated signer เพื่อคง server-assigned release_id; ทาง manifest ลงนามใน CI ทั้งก้อนต้องปรับ API flow จึงไม่เลือกในรอบนี้. Release publisher รายบุคคล+audit ไม่ทดแทน OS publisher pin. CI required reviewer/four-eyes หรือ hardware token มีผลเรื่องผู้ควบคุม signing; เจ้าของ release/infra ต้องระบุของที่มีและผู้มีอำนาจตัดสิน residual ตามเงื่อนไข jpo ไม่ขยาย H6/รับความเสี่ยงเอง

Time to Live (TTL หรืออายุข้อมูล) create-license 15 นาที (ผู้ใช้อนุมัติตาม [มติ 046 (Gateway dev และ replay License 15 นาที)](../../shared/decisions/decisions-046.md)) ไม่ใช่การพิสูจน์ว่า backup ถูกทำลายแล้ว. ถ้า infrastructure ยังบังคับ ciphertext expiry ไม่ได้ให้บันทึก evidence gap ไว้ใน SEC001-009 ห้ามอ้างว่าการ purge live DB อย่างเดียวปิด finding; ไม่เปลี่ยน replay เป็น key:null โดยไม่มี human gate ของ breaking contract

Proof ที่ต้องแนบ: key inventory เฉพาะ metadata, sign/decrypt policy, negative tests (caller ผิด/exp เกิน/registry ไม่ตรง/publisher อื่น), access audit ที่ตรวจข้อมูลก่อนนำเข้า knowledge ตาม [export proof pack](export-proof-pack-001.md), rotation+revoke rehearsal และ backup/restore-expiry test. เติมเกณฑ์ตาม mitigation เดิมดังนี้:

ทุกผลตรวจผูก environment, expected/actual และ evidence_ref; เจ้าของรับรองข้อเท็จจริงตามหน้าที่เดิม. งานนี้ไม่มีการสร้าง key/sign artifact หรือ re-audit


## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

ร่าง SEC001-006/SEC001-003/SEC001-009; อ่าน [DES-002](des-002.md), [DES-007](des-007.md), mitigation ล่าสุด (memory: planning/security-mitigation-001.md). สถานะที่ [index](index.md); ตารางไม่บรรจุ key/certificate ส่วน private

- **Entitlement signer rate limit:** ระบุ policy/config, caller/identity, limit/window และจุดบังคับจริง พร้อมผลทดสอบต่ำกว่า/เกิน limit/กลับมาใช้ได้ตาม policy และ audit ว่าคำขอที่ถูกจำกัดไม่เกิด sign; ไม่กำหนดตัวเลขใหม่. ข้อเท็จจริง as-built: `C:/src/schoolbright/target/school-bot/web/src/SchoolBot.Api/Program.cs:49–62,101–105` มี rate limit ของ HTTP license endpoints ยังไม่พิสูจน์ rate limit ที่ entitlement signer
- **ไม่พบ private key:** แนบผลสแกน repo/payload/CI/log แยกครบสี่พื้นที่ ระบุ source revision, artifact/run, เครื่องมือ/version/rules, ขอบเขต/ข้อยกเว้น และเวลาตรวจ. ห้ามแนบค่า key/snippet; ส่วนที่ไม่ได้สแกนเป็น evidence gap ไม่ใช่ผลว่าไม่พบ และสรุปเฉพาะขอบเขตที่ตรวจจริง
- **สิทธิ์ custody จริง:** เทียบบุคคล/service identity ที่เขียน registry กับผู้ publish, ผู้สั่ง sign/ผู้ลงนาม และผู้เข้าถึง recovery material รวม restore/decrypt/สิทธิ์ผ่านกลุ่มหรือ role. แนบ access policy/audit และ negative test ว่า publisher/API เขียน registry เองไม่ได้; ระบุสิทธิ์ซ้อน/ข้อจำกัดให้เจ้าของ release/infra และ jpo ตรวจตาม gate เดิม ไม่สรุปการแยกสิทธิ์จากชื่อตำแหน่ง และไม่เพิ่ม four-eyes

