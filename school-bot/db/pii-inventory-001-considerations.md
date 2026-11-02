# ข้อพิจารณาข้อมูลส่วนบุคคลสำหรับ jpo

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](pii-inventory-001.md)

## 5. Flag ส่งต่อ jpo

- F1 ไม่มีคอลัมน์เฉพาะสำหรับ direct identifier ใน SchoolBot DB — แต่ free-text/jsonb ยังบรรจุได้; ตัวตนจริงอยู่ legacy DB; การประเมิน PDPA ต้องครอบทั้งสองฝั่ง
- F2 pseudonymous IDs ทุกตัว re-identify ได้เมื่อ join กับ legacy DB ร่วมกับ SchoolId → ให้ถือเป็น PII ในทางปฏิบัติ · การยกเว้น "ไม่ใช่ PII" ของ device/crypto identifiers ไม่ถูกเสมอไป: `Session.DeviceJkt` อยู่ร่วมแถวกับ Account/Profile จึงเชื่อมถึงบุคคลโดยตรง ส่วน hash/request/resource identifiers ต้องจำแนกตามสิ่งที่เชื่อมถึงได้
- F3 ข้อมูลเด็กอย่างน้อย 13 ตาราง (§4) — พิจารณาข้อกำหนดผู้เยาว์ของ PDPA (มาตรา 20/24 เรื่องความยินยอม/ผู้ใช้อำนาจปกครอง) — ประเด็นให้ jpo และเจ้าของข้อมูลตัดสิน; การเป็นนักเรียนไม่ได้พิสูจน์อายุ และไม่บังคับ consent ทุกกิจกรรมโดยอัตโนมัติ — ต้องผูกฐานประมวลผลกับวัตถุประสงค์ก่อน
- F4 free-text 8 คอลัมน์ + jsonb serializer (AuditEvent.Reason, StaffRole.Reason, Project.Name, Assessment.Feedback, RetakeGrant.Reason, LevelProposal.Reason, LevelPromotionPolicy.Reason, GradeSlot.OwnershipReason, Evidence.note) เสี่ยงซ้อน PII โดยไม่ตั้งใจ — ต้องมีแนวทางการเขียน/ตรวจฝั่ง application
- F5 TokenHash (credential-derived ของบุคคล) และ ResultCipher (secret ของทุก operation) — คุม log/backup/ETag ตาม SEC001-009 MUST-4/5
- F6 โครงสร้างภายใน jsonb ไม่ถูกบังคับที่ DDL — PII ฝังใน JSON ต้องคุมที่ serializer/DTO · รายการที่ต้องลงเพิ่ม: PreviewContext(Context), LevelSnapshot(LevelProposal.Snapshot), ArmEvidence.note, Assessment.RuleResults (jsonb) และคอลัมน์ผลประเมิน Outcome/EarnedScore/MaxScore (แยกชนิดจริงตาม SQL:747–750 แล้วใน §3 — คะแนน/สถานะผูกผู้เรียน ไม่จำกัดเฉพาะคอลัมน์ระบุตัวตน)
- F7 retention: กลไกหมดอายุที่มี = Idempotency.ReplayUntil, ScorePreview.ExpiresAt และ Session.ExpiresAt (SQL:226) — **expiry ไม่ใช่หลักฐานว่าลบข้อมูลแล้ว** และ IsDelete ไม่ใช่การทำลายข้อมูล; Attempt.Answers/Evidence/ScorePreviewItem.Snapshot ของเด็กไม่มีนโยบายเก็บ/ลบ — เจ้าของข้อมูล/กฎหมายต้องรับรองระยะเก็บ/จุดเริ่มนับ/วิธีลบ/ข้อยกเว้น/backup ตามมาตรา 23/37 (jpo เสนอและตรวจ ไม่กำหนดแทน)
- F8 ผลพิจารณาของ jpo (ผู้ทบทวนด้านข้อมูลส่วนบุคคล): inventory นี้รับเป็นหลักฐานตั้งต้นได้ แต่ SEC001-010 ยังปิดไม่ได้ — ต้องเติมขอบเขต legacy/local files/logs พร้อมนโยบาย masking/encryption/access และเส้นทางลบ/ส่งออกข้อมูลรายคน
