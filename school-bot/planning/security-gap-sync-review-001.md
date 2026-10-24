# ผลตรวจ jpo ใบงาน060f — ตรวจรับฝั่ง security/PDPA ของผลงานรอบใบงาน060

วันที่ 2026-10-24 · รันโดย runner ภายนอก (codex t2 ผ่าน baan-role — ตรวจข้ามโมเดล) · read-only · ต้นฉบับ: `C:/src/AICode/baan/baan/reports/2026-10-24-05-38-52-jpo-tier-t2-1agents-SDGcFn/codex.answer.txt` · output state: NEEDS_HUMAN (หยุดที่ human gates เดิม)

## ผลตรวจฉบับเต็ม (verbatim)

ผลตรวจใบงาน060f วันที่ **2026-10-24: ยังรับรองผ่านทั้งชุดไม่ได้** พบ inventory ตกหล่นและคำขอหลักฐานที่อาจเปิดเผยส่วนของ hash ส่วนแนวทาง signer/publisher pin และ replay TTL ฝังเงื่อนไขหลักแล้ว รับได้ในระดับแบบเท่านั้น

ตรวจแบบ read-only เทียบ DDL และสัญญา JSON ไม่แก้ไฟล์ ไม่ตรวจ runtime ไม่เปลี่ยน status/severity และไม่ปิด gate ใด Important6/Medium6/Minor3 เดิมยัง OPEN

**1. PII inventory — รับได้บางส่วน ต้องแก้ก่อนใช้เป็นฐานปิด SEC001-010**

ข้อบกพร่องระดับ **Medium ภายใต้ขอบเขต SEC001-010 เดิม** มีดังนี้

| จุดตรวจ | ผลและข้อแก้ |
|---|---|
| F1 — "ไม่มี direct identifier" | inventory:10 สรุปเกินหลักฐาน ควรระบุว่า "ไม่มีคอลัมน์เฉพาะสำหรับชื่อ/อีเมล/เลขบัตร" เพราะ free-text และ JSON ยังบรรจุข้อมูลเหล่านี้ได้ |
| F2 — identifiers | เห็นด้วยว่ารหัสที่ join กลับ legacy ได้เป็น PII แต่การยกเว้น device identifiers และค่า crypto ทั้งกลุ่ม (บรรทัด58) ไม่ถูกเสมอ โดยเฉพาะ `Session.DeviceJkt` ซึ่งอยู่ร่วมกับ Account/Profile โดยตรง ส่วน hash/request/resource identifiers ต้องจำแนกตามสิ่งที่เชื่อมถึง |
| F3 — ข้อมูลเด็ก 9 ตาราง | **ไม่ครบ** ต้องเพิ่ม `ScorePreview.Context.roster` และ `LevelProposal.Snapshot.roster[].learner_id/total` ตาม JSON contract-003:46 และเพิ่ม `GradingJob.SubmissionId`, `ScoreExport.ScorePreviewId` ทางอ้อมตาม SQL:715/SQL:1001 จึงอย่างน้อย **13 ตารางตามนิยามตรง/อ้อมเดิม** ยังไม่นับ AuditEvent/Idempotency ที่ขึ้นกับ operation |
| F4 — free-text | ตก `LevelPromotionPolicy.Reason` และ `GradeSlot.OwnershipReason` (SQL:379/889) และควรครอบ `Evidence.note` ตามชนิด `ArmEvidence` ด้วย |
| F5 — hash/cipher | เห็นด้วยกับการห้าม log แต่ `TokenHash` ยังเกี่ยวข้องกับบุคคล และ `ResultCipher` เป็นช่องเก็บ response ทั่วไป ไม่ควรจำแนกว่าไม่มี PII ทุก operation เพียงเพราะ create-license เก็บ secret |
| F6 — JSON/ผลประเมิน | ต้องลงรายการ `Context`, `LevelProposal.Snapshot`, `Assessment.RuleResults/Outcome/EarnedScore/MaxScore` รวมคะแนน เวลา และสถานะที่ผูกผู้เรียน ไม่จำกัด inventory เฉพาะคอลัมน์ระบุตัวตน |
| F7 — retention | ถูกที่ยังไม่มีนโยบายครบ แต่ตก `Session.ExpiresAt` (SQL:226) ทั้งนี้ expiry ของ session/preview/replay **ไม่ใช่หลักฐานว่าลบข้อมูลแล้ว** และ `IsDelete` ก็ไม่ใช่การทำลายข้อมูล |

ข้อคลาดเคลื่อนระดับ **Minor**: inventory ระบุ `Session.AccountId` เสมือนบังคับมีค่า แต่ DDL กำหนด `integer NULL` (SQL:219)

ในมุม PDPA รหัสที่ระบุตัวบุคคลทางอ้อมได้ยังเป็นข้อมูลส่วนบุคคลตามมาตรา 6 การเป็นนักเรียนไม่ได้พิสูจน์อายุ และไม่ทำให้ต้องใช้ consent ทุกกิจกรรมโดยอัตโนมัติ ต้องผูกฐานประมวลผลกับวัตถุประสงค์ก่อน หากใช้ consent ของผู้เยาว์จึงดำเนินการตามมาตรา 20 (รวมกรณีอายุไม่เกินสิบปี/ผู้ใช้อำนาจปกครองร่วม) และมาตรา 24; F7 ต้องให้เจ้าของข้อมูล/กฎหมายรับรองระยะเก็บ/จุดเริ่มนับ/การลบ/ข้อยกเว้น/backup ตามมาตรา 23 และ 37 — จป. เสนอและตรวจ ไม่กำหนดแทนเจ้าของ

**SEC001-010 ยังปิดไม่ได้แม้เฉพาะ inventory ทั้งส่วน** รับเป็นหลักฐานตั้งต้นได้ ต้องเติมรายการข้างต้นและขอบเขต legacy/local files/logs พร้อมนโยบาย masking/encryption/access และเส้นทางลบ/ส่งออกข้อมูลรายคน ส่วน GDPR ยังไม่มีหลักฐานพอตัดสิน applicability ตาม Article 3; ห้ามนำเกณฑ์ child consent ของ Article 8 มาใช้ครอบทุกกิจกรรมโดยอัตโนมัติ

**2. เงื่อนไขของ arch — พอใจในระดับสัญญา ยังไม่ใช่ remediation**

- **SEC001-003:** release-trust-001:7 และ DES-007:33 แก้ข้อขัดเดิมเรื่องผู้ลงนามแล้ว Signer ตรวจ immutable CI registry เอง ไม่เชื่อการตรวจของ API; publisher/API ลงทะเบียน artifact เองไม่ได้ มี evidence binding, origin/redirect/downgrade/expiry/withdraw และ audit ผูกบุคคลครบ Host pin มาจาก trusted configuration และ fail closed เมื่อไม่มี pin (release-trust:15) ยังต้องพิสูจน์สิทธิ์ registry/custody, ค่า pin จริง, negative tests และลายเซ็น RC จริงก่อนพิจารณาปิด
- **SEC001-009:** DES-002:53, rules:41 และ license-admin-security:11 ครอบ MUST-1..5 แล้ว (TTL สั้นเฉพาะ create-license, ตรวจหมดอายุขณะอ่าน, ไม่ต่อ TTL จาก retry, ตรวจผู้เรียก/สิทธิ์/license, ล้างคู่ฟิลด์, no-store/ไม่ log และ backup residual) ค่า 15 นาทียังเป็นข้อเสนอติดสมมติฐาน ไม่มีหลักฐาน implementation หรือ backup expiry จึงยังปิดไม่ได้

ไม่พบเหตุจากเอกสารรอบนี้ให้เพิ่ม Critical/Important ใหม่ หรือบังคับ four-eyes เกิน disposition เดิม

**3. Credential/custody/export proof pack — โครงพร้อมให้เจ้าของกรอก แต่ต้องเติมเกณฑ์ตรวจบางจุด**

- credential-matrix:20 ครอบ process/account/สิทธิ์จริง/mount/service identity/deploy unit และแยก PG read/write ออกจาก B API ถูกทิศทางแล้ว — ควรขยายสิทธิ์จริงให้ครอบ **effective privileges** ผ่าน inherited/PUBLIC roles, ownership, superuser/BYPASSRLS และ executable functions ที่เกี่ยวข้อง พร้อมแยกแถวเมื่อเป็นคนละ deploy unit/account
- custody-matrix:16 มีผู้ถือ/store/caller/rotation/revoke/backup ครบมิติ แต่ยังต้องเติมในเกณฑ์ตรวจให้ชัดตาม mitigation เดิม: rate limit ของ entitlement signer พร้อมหลักฐานทดสอบ · ผลสแกน repo/payload/CI/log ว่าไม่มี private key · ผู้มีสิทธิ์เขียน registry เทียบกับผู้ publish/sign และผู้เข้าถึง recovery material จริง
- export-proof-pack:7 แยก expected/actual และห้า gate ได้ดี แต่คำว่า fixture "ปิดบังข้อมูล" ยังไม่พอ ควรกำหนด **synthetic fixtures เป็นหลัก** และให้ตรวจ JSON/screenshots/receipt/logs รวมถึง before/after documents ก่อนนำเข้า knowledge
- ผู้ที่ต้องรับรองคือเจ้าของ DB (บัญชี/สิทธิ์จริง) เจ้าของ infra (process/secret isolation) เจ้าของ release (custody/pins/rotation/backup) ส่วนผู้มีอำนาจรับ residual ต้องลงชื่อ วันที่ และขอบเขตเอง — จป. ไม่รับแทน

**4. DB safe evidence — ยังไม่พร้อมส่งตามข้อความปัจจุบัน**

- ข้อบกพร่องระดับ **Medium** ที่ EV-05:48: `left(PasswordHash,3)` เปิดเผยส่วนของค่าจริงจาก credential แม้แสดงเป็นกลุ่ม ≥5 จึงขัดกับเงื่อนไขไม่ส่ง hash จริง — ให้เปลี่ยนเป็นป้ายประเภทคงที่ที่คำนวณภายใน DB (SHA1_HEX_40/V2_FORMAT/NULL_OR_EMPTY/OTHER) ส่งเฉพาะจำนวน ห้ามส่ง prefix/suffix จริง ความยาวใช้ช่วงที่กำหนดล่วงหน้า
- EV-04/06 ต้องป้องกันการอนุมานกลุ่มเล็กจากยอดรวมและผลนับที่ทับซ้อนกัน — ใช้กลุ่มไม่ทับซ้อนและตรวจ complementary suppression ทั้งชุดก่อนส่ง
- EV-01..03 รับแนวทาง schema-only ได้ แต่ต้องถอนคำว่า "ปลอด PII 100%" (บรรทัด62): DEFAULT/CHECK/index expressions/comments อาจมี literal ที่ไม่ควรเปิดเผย ให้ส่ง metadata ตามรายการอนุญาตและตรวจ literal ก่อนส่ง ไม่ส่ง raw dump โดยไม่ทบทวน

**5. review-007 — เห็นชอบว่าไม่ต้องแก้ DDL โดยมีข้อแก้ข้อความ**

- SQL:150 รองรับ NULL ทั้งสองฟิลด์ และ pair CHECK บังคับความสอดคล้องจริง จึงใช้ application read-time gate กับ cleanup ได้โดยไม่เพิ่ม schema/index
- ให้ vault แก้ review-007:30 และเงื่อนไข cleanup เป็น `now() >= ReplayUntil` / `ReplayUntil <= now()` ให้ตรงสัญญา ณ จุดหมดอายุพอดี พร้อมคง tombstone ไม่ออก key ใหม่จาก retry และไม่บันทึก key/cipher ใน log/audit/error
- ต้องระบุเพิ่มว่า `UPDATE ... NULL` ไม่พิสูจน์การทำลายสำเนาใน MVCC/WAL/replica/backup และ tombstone ที่ยังมี Principal/ResourceId ก็ยังอาจเป็น PII — การรับข้อสรุปทาง DDL จึงไม่ปิด SEC001-009

**ข้อเสนอให้นายช่าง append ใน security.md** (บันทึกแล้วใน security.md ส่วน "รอบตรวจรับฝั่ง security ของใบงาน060")

**Handoff:** นายช่าง → vault แก้ inventory/EV/review-007 (แก้แล้ว 2026-10-24 โดยนายช่างสวมบท vault) → arch เติมเกณฑ์ evidence → เจ้าของ DB/infra/release และกฎหมายรับรองข้อเท็จจริงตาม gate เดิม → จป. ตรวจซ้ำ

| Task / Reference | Blocker และสิ่งที่รอ |
|---|---|
| SA-004 / SEC001-002, SEC001-006 | Important เดิมยังขาดหลักฐานสิทธิ์/process/custody จริง ต้องแก้และ re-audit หรือผู้มีอำนาจรับ residual เป็นลายลักษณ์อักษร |
| BE-018/019/022 / SEC001-003 | แบบครบขึ้น แต่ยังไม่มี implementation/RC proof ห้ามใช้ผลนี้อนุมัติ trusted update |
| DBA-002/005 / SEC001-010, EV-01..06 | แก้ชุดเอกสารก่อนส่งคำขอหลักฐาน (แก้แล้ว 2026-10-24); เจ้าของกฎหมาย/ข้อมูลยังต้องรับรองฐานประมวลผลและ retention ตามรายการค้างเดิม |

ยังไม่พบหลักฐานจากการอ่านเอกสารเพียงพอให้ประกาศว่าเกิดการละเมิดกฎหมายแล้ว และยังรับรอง compliance ไม่ได้ งานตรวจ read-only รอบนี้ครบตามขอบเขต; หยุดที่ human gates เดิม

**NEEDS_HUMAN**

## Change Log

- 2026-10-24 — นายช่างบันทึกผล jpo (runner ภายนอก codex t2) พร้อมหมายเหตุสถานะการแก้ตาม findings ของฝั่ง vault
