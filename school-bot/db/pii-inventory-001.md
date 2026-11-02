# PII Inventory 001 — ตารางจำแนกข้อมูลส่วนบุคคลรายคอลัมน์ ใน 32 ตาราง SchoolBot

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ทะเบียนนี้จำแนก PII (Personally Identifiable Information หรือข้อมูลที่ระบุบุคคลได้) จากร่าง DDL (Data Definition Language) และความหมายฟิลด์ ขอบเขตหลักฐานฉบับที่ใช้ตรวจอยู่ท้ายไฟล์
ขอบเขต: เฉพาะคอลัมน์ที่เป็น PII/identifier ของบุคคล — คอลัมน์อื่นไม่ลิสต์ · ปิดท้ายด้วย flag ส่งต่อ jpo
ตอบ finding: [SEC001-010](../security.md) (data inventory/retention/masking ของข้อมูลผู้เยาว์ — owner DBA-002/005 ตาม routing ของ security.md)

## 1. สรุปก่อนรายละเอียด

- **ไม่มีคอลัมน์เฉพาะสำหรับ direct identifier** (ชื่อ-นามสกุล/เลขบัตร/อีเมล/เบอร์โทร) ใน 32 ตาราง — แต่ free-text (Reason/Feedback/Name/note) และ jsonb ยังบรรจุข้อมูลเหล่านี้ได้ ; ตัวตนจริงของบุคคลอยู่ใน legacy DB (Master/School) ตาม data-model.md
- ตัวตนบุคคลใน SchoolBot DB เป็น **pseudonymous identifier** (integer ชี้ sId/sEmp/AccountId ใน legacy) และ **quasi-identifier** (สตริง principal/actor ของระบบ auth)
- ตารางที่เก็บข้อมูลเด็ก: **ตรง 8 ตาราง + ทางอ้อม 5 ตาราง = อย่างน้อย 13 ตาราง** (รายการ §4) การเป็นนักเรียนไม่ได้พิสูจน์อายุ ดูข้อที่ยังไม่ยืนยันท้ายไฟล์

## 2. คอลัมน์ร่วมทุก 32 ตาราง (PII เชิง pseudonymous)

| คอลัมน์ | ชนิด | ประเภท | หมายเหตุ |
|---|---|---|---|
| CreateBy | integer NULL | pseudonymous identifier | sEmp (พนักงาน/ครู) หรือ sId (นักเรียน=เด็ก) ของผู้ทำ; NULL=ระบบ (หัวไฟล์ SQL บรรทัด 14) |
| UpdateBy | integer NULL | pseudonymous identifier | เช่นเดียวกัน |

## 3. รายคอลัมน์

อ่าน [ตารางจำแนก PII รายคอลัมน์](pii-inventory-001-columns.md) ซึ่งเก็บรายการคอลัมน์เดิมครบ รวมตารางที่ไม่มี PII เฉพาะตัว

## 4. ตารางที่เก็บข้อมูลเด็ก

| แบบ | ตาราง | จุดข้อมูล |
|---|---|---|
| ตรง | SchoolBotSession | ProfileKind='student' + ProfileId |
| ตรง | SchoolBotProject | OwnerKind='student' + OwnerId |
| ตรง | SchoolBotSubmission | LearnerId, Evidence (รวม note) |
| ตรง | SchoolBotAttempt | LearnerId, Snapshot, Answers |
| ตรง | SchoolBotRetakeGrant | LearnerId |
| ตรง | SchoolBotScorePreviewItem | LearnerId, Snapshot |
| ตรง | SchoolBotScorePreview | Context.roster (PreviewContext.roster:I[]) |
| ตรง | SchoolBotLevelProposal | Snapshot.roster[].learner_id/total |
| ทางอ้อม | SchoolBotProjectRevision | Content — ผ่าน Project.Owner |
| ทางอ้อม | SchoolBotAssessment | Feedback/ผลตรวจ (รวม RuleResults/Outcome/คะแนน) — ผ่าน Submission.LearnerId |
| ทางอ้อม | SchoolBotScoreOutbox | คะแนนรายคน — ผ่าน ScorePreviewItem.LearnerId |
| ทางอ้อม | SchoolBotGradingJob | SubmissionId (SQL:715) — ผ่าน Submission.LearnerId |
| ทางอ้อม | SchoolBotScoreExport | ScorePreviewId (SQL:1001) — ผ่าน ScorePreviewItem.LearnerId |

รวมอย่างน้อย **13 ตาราง** ตามนิยามตรง/อ้อม (ยังไม่นับ AuditEvent/Idempotency ที่ขึ้นกับ operation ว่าใส่อะไร)

## 5. ข้อพิจารณาที่ต้องส่งต่อ

อ่าน [ข้อพิจารณา F1–F8](pii-inventory-001-considerations.md) เรื่องการระบุตัวตน ข้อมูลผู้เยาว์ free-text, JSON, credential และ retention

## ยังไม่ยืนยัน

- การถือว่านักเรียนทั้งหมดเป็นเด็กยังไม่มีหลักฐานอายุ ต้องให้เจ้าของข้อมูลยืนยันขอบเขตผู้เยาว์
- ข้อความเดิมส่วนจำแนกทั่วไป: ไม่ใช่ PII บุคคล (ระบุกันเข้าใจผิด — ไม่นับใน inventory): `SchoolId`/`SchoolName` (องค์กร), `License.KeyHash/KeyHint/AllowedNextJkt` (credential องค์กร), `DeviceJkt`/`PublicJwk` (อุปกรณ์), `NonceHash/RequestHash/RequestKey/ContentHash/SnapshotHash/PayloadHash/ArtifactHash` (ค่า crypto), `LeaseOwner` (worker instance), `GraderVersion`
- ข้อความเดิม F2 ระบุว่าการยกเว้น device/crypto identifiers ว่าไม่ใช่ PII ไม่ถูกเสมอไป เพราะ `Session.DeviceJkt` อยู่ร่วมแถวกับ Account/Profile และ hash/request/resource identifiers ต้องจำแนกตามข้อมูลที่เชื่อมถึงได้ ต้องให้ jpo และเจ้าของข้อมูลยืนยันการจัดประเภท โดยงานนี้ไม่ตัดสินแทน
