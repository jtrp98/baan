# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PII คือ ข้อมูลที่ระบุตัวบุคคลได้; TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; DDL คือ Data Definition Language; DPO คือ Data Protection Officer.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-010 — ยังไม่มี data inventory/retention/masking สำหรับข้อมูลนักเรียน (ผู้เยาว์) ใน Session, Submission, Attempt, Project, Audit และ log

**สถานะปัจจุบัน:** เปิด · Medium. inventory ตั้งต้นครอบ 13 ตารางเด็ก, free-text, jsonb ผลประเมิน, DeviceJkt/ResultCipher และ Session.ExpiresAt โดย expiry ไม่เท่ากับ deletion. ยังขาด legacy/local files/logs, masking/encryption/access/retention และลบ/ส่งออกรายคน. Generated record ToString มี raw Token แต่ยังไม่มี log sink/caller; เป็นข้อระวังในข้อนี้ ไม่เพิ่ม finding ซ้ำ.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ข้อมูลที่จะเข้ามาคือ credential flow ของนักเรียนและครู, ผลงาน/ผลสอบรายบุคคล, รหัสผู้เรียนที่ผูกคะแนน, และ audit ที่ผูกตัวตนครู. ถ้าไม่ระบุ PII ต่อคอลัมน์, retention, การลบและการ mask ใน log ก่อนเขียน SQL จะแก้ย้อนหลังยาก. Desktop เก็บ project JSON แบบไม่เข้ารหัสในโปรไฟล์ผู้ใช้. ไม่ได้ตัดสินฐานทางกฎหมายหรือ cross-border เพราะตรวจแหล่งทางการไม่ได้

วิธีแก้: จป. จัดทำตาราง PII ต่อคอลัมน์ (ผ่านการ review SQL ของ vault) พร้อม retention ที่คนตัดสิน, บังคับ mask/ไม่ log: password, token, key, school/user id ใน header, เนื้อหา submission; กำหนดว่า AuditEvent เก็บอะไรได้; ระบุเส้นทางลบ/ส่งออกข้อมูลรายคน; ให้ DPO ตัดสินฐานกฎหมายสำหรับผู้เยาว์ ที่ตั้ง hosting และการส่งข้อมูลข้ามประเทศ

ผู้รับ: arch/vault (schema) และ DPO/เจ้าของกฎหมาย (ผู้ตัดสิน)

การตรวจซ้ำ: jpo ตรวจ DDL review และตัวอย่าง log จริงหลัง implement ว่าไม่มี PII ที่ห้าม พร้อมรายการที่เจ้าของกฎหมายตอบ

## SEC001-011 — ยังไม่ทราบสถานะการตั้งค่า LegacyWebJwt:Secret ของ gateway และการแชร์ key กับระบบเว็บเดิม

**สถานะปัจจุบัน:** เปิด · Medium. ยังต้องยืนยันการแยก secret; routing ไม่ยืนยัน secret.

ลักษณะข้อค้นพบ: deployment_unknown. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ถ้าไม่ตั้ง LegacyWebJwt:Secret โค้ดจะใช้ Jwt:Secret ซึ่งเป็น key เซ็น Bearer ของ gateway ทำให้ key เดียวเซ็นทั้ง token เว็บเดิมที่ไม่มี exp และ Bearer ปกติ. ถ้ารั่ว/แชร์ผลกระทบกว้าง และ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](design/des-012.md) ทาง D (SchoolBot ถือ secret ร่วม) ถูกปัดตกด้วยเหตุผลนี้

วิธีแก้: ยืนยันว่าตั้ง LegacyWebJwt:Secret แยกจาก Jwt:Secret ใน production, อยู่ใน secret store, SchoolBot ไม่ได้รับ secret นี้ (ใช้ introspection ทางเดียว), มีแผน rotation. ห้ามส่งค่ามาให้ jpo ให้ตอบเพียงสถานะ

ผู้รับ: เจ้าของ sb-api-gateway/infra

การตรวจซ้ำ: jpo รับคำตอบสถานะจากคนและตรวจ config template ว่าไม่มีค่าจริงก่อนเปิด web-principal

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- SEC001-010: app/desktopstorage.go:46-52,103-141; knowledge/school-bot/design/des-004.md:76; knowledge/school-bot/design/des-009.md:131-135; knowledge/school-bot/requirement/decisions-015.md
- งานที่รับข้อค้นพบนี้: DBA-002, DBA-005, BE-006, BE-024
- planning/security-gap-sync-review-001.md (memory)
- planning/jpo-094-BE-039-001.md (memory)
- SEC001-011: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JwtTokenService.cs:44-45; sb-api-gateway/src/ApiGateway.API/Hosting/StartupDiagnostics.cs:15-22; knowledge/school-bot/design/des-012.md:22-24
- งานที่รับข้อค้นพบนี้: BE-039
