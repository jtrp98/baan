# crm-ai-support — Modules

## Modules

### Module: Case Classification & Safety
`TCrmSupport` (3 คอลัมน์ใหม่), `TCrmCaseAiAssessment`, `TCrmSafetyKeyword`, `TCrmAiDecisionLog`, Gemini API integration route ใหม่ (รวม Menu classification), human review queue UI แบบ per-dimension (CS-facing), legacy backfill job/script (~70k เคส)
**Sensitive**: รับ input จากลูกค้าภายนอกโดยตรง (untrusted external input ผ่านช่องทางแจ้งเคส) + อาจมีข้อมูลส่วนบุคคลปนอยู่ใน `Question`/`Answer` — ต้องผ่าน `security` agent ก่อน deploy — backfill job เองไม่ใช่ external input แต่แก้ข้อมูลจำนวนมาก (~70k แถว) เข้าเกณฑ์เดียวกัน
**Dependency**: ไม่มี — เป็นฐานให้ module ถัดไป

### Module: Issue & Knowledge Management
`TCrmIssue`, `TCrmKnowledgeEntry`, PM approve/decline UI, SA issue-grouping UI, CS knowledge-answer UI
**Sensitive**: ไม่มี input จากภายนอกโดยตรง (เป็นงานของ SA/PM/CS ภายใน) แต่ `TCrmIssue.DecisionReason`/audit trail ต้องถูกต้อง เพราะเป็นหลักฐานการตัดสินใจทางธุรกิจ
**Dependency**: ต้องมี `TCrmCaseAiAssessment.IssueId`/`AiCategory` จาก Module 1 ก่อน — ทำหลัง Module 1 เท่านั้น

### Module: Feature Registry, Menu Relation & Learning Loop (เพิ่ม 2026-08-16)
`TCrmProductFeature`, `TCrmMenuRelation`, `TCrmAiSuggestion` — Sales-facing feature search UI, PM feature registry management UI, SA/UX-UI menu-relation confirm UI, Support Lead/SA/PM suggestion-inbox review UI
**Sensitive**: ไม่มี input จากภายนอกโดยตรง แต่เป็นจุดที่ AI เสนอการเปลี่ยนแปลงเชิงโครงสร้าง (menu relation, merge suggestion) — ต้องมี audit trail ที่ตรวจสอบย้อนกลับได้ว่าใคร accept/reject เมื่อไหร่
**Dependency**: ต้องมี `TCrmIssue`/`TCrmKnowledgeEntry` จาก Module 2 ก่อน (suggestion บางประเภทอ้างถึงตารางเหล่านี้) — ทำหลัง Module 2

### Module: Queue Interrupt & Customer Promise (เพิ่ม 2026-08-16)
`TCrmQueueInterrupt`, `TCrmCustomerPromise`, `TCrmStaffRole` — PM approve/reject interrupt UI, Sales customer-promise UI + renewal alert list
**Sensitive**: `TCrmQueueInterrupt.ApprovedBy`/`TCrmCustomerPromise` เป็นหลักฐานการตัดสินใจทางธุรกิจ/สัญญากับลูกค้า ต้องมี audit trail ที่แก้ไขย้อนหลังไม่ได้
**Dependency**: `TCrmQueueInterrupt` ต้องมี `TCrmIssue` จาก Module 2 ก่อน — `TCrmCustomerPromise`/`TCrmStaffRole` ไม่ผูกกับ module อื่น ทำคู่ขนานได้


Back-links: `index.md`
