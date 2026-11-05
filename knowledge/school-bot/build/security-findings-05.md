# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PII คือ ข้อมูลที่ระบุตัวบุคคลได้; TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; KMS คือ Key Management Service; HSM คือ Hardware Security Module.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-006 — ยังไม่ทราบว่าใครถือและเก็บ signing key ของ entitlement/release (KMS/HSM เป็นเพียงข้อเสนอ)

**สถานะปัจจุบัน:** เปิด · Important. โครง signing custody และชุดพิสูจน์การส่งคะแนนพร้อมให้เจ้าของกรอก ต้องมี rate limit ของ signer, ผลสแกน private key, ผู้เขียน registry เทียบผู้ sign/publish และ synthetic fixtures. เรื่อง signer/custody ของ License พักตาม [มติ 047 (พักเรื่องกุญแจเซ็น License)](../shared/decisions/decisions-047.md) ไม่ขอคำตอบซ้ำ และไม่ใช่ risk acceptance.

ลักษณะข้อค้นพบ: deployment_unknown. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ถ้า key อยู่เป็นไฟล์บน server เดียวกับ API ผู้ยึด API จะออก lease ปลอมและลงนาม update ที่ถูกรันบนเครื่องนักเรียนได้ ผลกระทบเกินกว่าตัว API

วิธีแก้: ตัดสิน custody ก่อน [BE-004 (Signed lease)](plan/index.md)/[BE-018 (Release API)](plan/index.md)/[BE-022 (Signing/assets)](plan/index.md): key แยกกันสามชุด (license, release, content), release signing แยกจาก API ตาม baseline ด้านล่าง โดย HSM และ dual control เป็นทางเลือก, private key ห้ามอยู่ใน repo/payload/log, มี rotation และ revoke kid ด้วย keyset ที่ root เซ็น, backup มีการเข้ารหัสและบันทึกผู้เข้าถึง

ผู้รับ: arch และ infra/release owner (ผู้ตัดสินเป็นคน)

การตรวจซ้ำ: jpo ตรวจ runbook/คำตอบ custody ที่คนระบุ และตรวจ source/CI ว่าไม่มี private key ใน payload ก่อนปิด เงื่อนไขฐานข้อมูลและ signing ก่อน release

เงื่อนไขลดความเสี่ยงและปิดข้อค้นพบ: entitlement: รับเป็น baseline ได้ ถ้า API ถูกยึดจะออก lease ปลอมอายุ ≤3 วันให้ device key ของผู้โจมตีได้ (กระทบสิทธิ์ใช้งาน ไม่ใช่ PII หรือโค้ดบนเครื่องนักเรียน) เมื่อครบเงื่อนไข custody และ signer จำกัดอายุ lease เองแล้วส่วนนี้อาจต่ำกว่า Important หลัง re-audit แต่ห้ามเป็นไฟล์ key บน host/process ของ API และ signer ต้องบังคับ exp cap เอง release: CI protected env + required reviewer = dual control ในทางปฏิบัติ และเป็นแบบที่แนะนำ hardware token ที่คนเดียวถือ รับเป็น baseline ได้เฉพาะเมื่อ ครบเงื่อนไขที่ signer ตรวจ pipeline registry เองและ host pin ผู้เผยแพร่ตาม [SEC001-003 (update trust ยังต้องพิสูจน์)](security-findings-03.md) เพราะคนเดียวยังเซ็น artifact อันตรายได้ (insider) ให้คนตัดสินว่ารับหรือไม่ jpo ไม่รับแทน HSM/dual control เป็น optional ส่วน release key คง Important จน custody ถูกระบุและ re-audit

ข้อมูลที่ยังต้องระบุ: เจ้าของ release/infra เลือก: KMS/signer ที่องค์กรมี, CI protected env หรือ token, ผู้ถือ root/token (ตอบเป็นสถานะ ไม่ส่งค่า)

## SEC001-007 — /v1/admin ใช้ static bearer เดียวร่วมกัน ไม่มี throttle, ไม่มี identity รายบุคคล, ไม่มี audit; มี fallback ชื่อ env เดิมและ /healthz เปิดเผยสถานะ PoC

**สถานะปัจจุบัน:** เปิด · Medium. ผู้ใช้ประสาน infra ยืนยันว่ามี PoC API เข้าถึงจากนอกเครื่อง dev หรือไม่, ตั้ง SCHOOL_BOT_ADMIN_KEY หรือ ARM_ADMIN_KEY หรือไม่ และ reverse proxy/TLS เป็นอย่างไร; ตอบเฉพาะสถานะ ห้ามส่งค่า key. ต้องปิด admin เดิมตามแบบ.

ลักษณะข้อค้นพบ: actual_defect. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ถ้า deploy จริง ผู้ถือ key เดียวสร้าง/เพิกถอน license และ publish release ได้โดยไม่มีผู้ใช้ผูกกับการกระทำ และไม่ถูกจำกัดการเดา key (key ยาว ≥32 ตัวอักษรแต่ตรวจเฉพาะความยาว). ผลกระทบจริงขึ้นกับว่า deploy หรือไม่ (ดูคำถามที่รอคน) และ [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../shared/decisions/decisions-025.md) สั่งปิด /v1/admin อยู่แล้ว

วิธีแก้: ก่อนปิด /v1/admin ตาม [BE-003 (Admin License)](plan/index.md): ห้ามเปิดนอก loopback/ชั้น proxy ที่มี IP allowlist, ใส่ rate limit กลุ่ม admin, ลบ fallback ARM_ADMIN_KEY, log จำนวนการ auth ล้มเหลว (ไม่ log ค่า), ตัด poc/storage ออกจาก /healthz ใน production. ถาวร: ย้ายไป /v2/admin ด้วย staff session และ StaffRole ตาม [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](design/des-012.md) แล้วปิด v1

ผู้รับ: be

การตรวจซ้ำ: jpo re-audit: /v1/admin ต้องไม่ตอบหรือถูกปิดใน build ที่ release, admin ทุกเส้นต้องผูก staff identity และมี audit

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- ต้นฉบับ mitigation ผูก baseline hardware token กับ SEC001-003 MUST-1/2.

- SEC001-006: knowledge/school-bot/design/des-002.md:61; knowledge/school-bot/design/des-007.md:35; knowledge/school-bot/plan/gates-001.md:25
- งานที่รับข้อค้นพบนี้: BE-004, BE-018, BE-022, DBA-006
- planning/security-mitigation-001.md (memory)
- planning/security-gap-sync-review-001.md (memory)
- SEC001-007: Program.cs:96-118; Program.cs:84; knowledge/school-bot/requirement/decisions-025.md:23
- งานที่รับข้อค้นพบนี้: BE-003
