# ข้อพิจารณาข้อมูลส่วนบุคคลสำหรับ jpo

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](pii-inventory-001.md)

## ข้อพิจารณาที่ส่งต่อ jpo

jpo คือผู้ทบทวนด้านข้อมูลส่วนบุคคล ส่วน PDPA คือกฎหมายคุ้มครองข้อมูลส่วนบุคคล รหัส F1–F8 ด้านล่างเป็นรหัสข้อพิจารณาของทะเบียนนี้

- ข้อพิจารณา F1 ไม่มีคอลัมน์เฉพาะสำหรับ direct identifier ใน SchoolBot DB — แต่ free-text/jsonb ยังบรรจุได้; ตัวตนจริงอยู่ legacy DB; การประเมิน PDPA ต้องครอบทั้งสองฝั่ง
- ข้อพิจารณา F2 pseudonymous IDs ทุกตัว re-identify ได้เมื่อ join กับ legacy DB ร่วมกับ SchoolId → ให้ถือเป็น PII ในทางปฏิบัติ · การยกเว้น "ไม่ใช่ PII" ของ device/crypto identifiers ไม่ถูกเสมอไป: `Session.DeviceJkt` อยู่ร่วมแถวกับ Account/Profile จึงเชื่อมถึงบุคคลโดยตรง ส่วน hash/request/resource identifiers ต้องจำแนกตามสิ่งที่เชื่อมถึงได้
- ข้อพิจารณา F3 ข้อมูลเด็กอย่างน้อย 13 ตารางตาม [รายการข้อมูลเด็ก](pii-inventory-001.md#4-ตารางที่เก็บข้อมูลเด็ก) — พิจารณาข้อกำหนดผู้เยาว์ของ PDPA (มาตรา 20/24 เรื่องความยินยอม/ผู้ใช้อำนาจปกครอง) — ประเด็นให้ jpo และเจ้าของข้อมูลตัดสิน; การเป็นนักเรียนไม่ได้พิสูจน์อายุ และไม่บังคับ consent ทุกกิจกรรมโดยอัตโนมัติ — ต้องผูกฐานประมวลผลกับวัตถุประสงค์ก่อน
- ข้อพิจารณา F4 free-text 8 คอลัมน์ + jsonb serializer (AuditEvent.Reason, StaffRole.Reason, Project.Name, Assessment.Feedback, RetakeGrant.Reason, LevelProposal.Reason, LevelPromotionPolicy.Reason, GradeSlot.OwnershipReason, Evidence.note) เสี่ยงซ้อน PII โดยไม่ตั้งใจ — ต้องมีแนวทางการเขียน/ตรวจฝั่ง application
- ข้อพิจารณา F5 TokenHash (credential-derived ของบุคคล) และ ResultCipher (secret ของทุก operation) — คุม log/backup/ETag ตาม [SEC001-009 (การคุ้มครอง key/token และผล replay)](../security.md) MUST-4/5
- ข้อพิจารณา F6 โครงสร้างภายใน jsonb ไม่ถูกบังคับที่ DDL — PII ฝังใน JSON ต้องคุมที่ serializer/DTO · รายการที่ต้องลงเพิ่ม: PreviewContext(Context), LevelSnapshot(LevelProposal.Snapshot), ArmEvidence.note, Assessment.RuleResults (jsonb) และคอลัมน์ผลประเมิน Outcome/EarnedScore/MaxScore (จำแนกชนิดจริงไว้ใน [รายการคอลัมน์](pii-inventory-001-columns.md) — คะแนน/สถานะผูกผู้เรียน ไม่จำกัดเฉพาะคอลัมน์ระบุตัวตน)
- ข้อพิจารณา F7 retention: กลไกหมดอายุที่มี = Idempotency.ReplayUntil, ScorePreview.ExpiresAt และ Session.ExpiresAt — **expiry ไม่ใช่หลักฐานว่าลบข้อมูลแล้ว** และ IsDelete ไม่ใช่การทำลายข้อมูล; Attempt.Answers/Evidence/ScorePreviewItem.Snapshot ของเด็กไม่มีนโยบายเก็บ/ลบ — เจ้าของข้อมูล/กฎหมายต้องรับรองระยะเก็บ/จุดเริ่มนับ/วิธีลบ/ข้อยกเว้น/backup ตามมาตรา 23/37 (jpo เสนอและตรวจ ไม่กำหนดแทน)
- ข้อพิจารณา F8 ผลพิจารณาของ jpo (ผู้ทบทวนด้านข้อมูลส่วนบุคคล): inventory นี้รับเป็นหลักฐานตั้งต้นได้ แต่ [SEC001-010 (ทะเบียนข้อมูลผู้เยาว์ การเก็บรักษา และ masking)](../security.md) ยังปิดไม่ได้ — ต้องเติมขอบเขต legacy/local files/logs พร้อมนโยบาย masking/encryption/access และเส้นทางลบ/ส่งออกข้อมูลรายคน

## หลักฐาน

- ผลประเมินและ retention: SQL:747–750
- ผลประเมินและ retention: SQL:226
