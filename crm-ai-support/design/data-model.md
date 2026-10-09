# crm-ai-support — Data Model

> Budget ≤ 15 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · นี่คือ **schema contract** — `qa-engineer` อ่านเต็มทุกรอบ, engineers implement verbatim

## Data Model

ทุก model อยู่ใน **jabjai-master-single-db** — ไม่มี `@relation` ในสคีมานี้ (ตามธรรมเนียมเดิมของ DB นี้) ทุก reference คือ logical ref ที่ join เองที่ app layer

```prisma
// ── ส่วนขยายของ TCrmSupport เดิม (เพิ่ม 3 คอลัมน์) ──
// เพิ่มในโมเดล TCrmSupport ที่มีอยู่แล้วใน prisma/jabjai-master-single-db/schema.prisma
// ทุกคอลัมน์เป็น nullable ไม่มี default — แถวเก่าจะเป็น NULL จนกว่าจะถูกจำแนกหรือจำแนกไม่ได้เลย
// NULL ห้ามตีความว่า "จำแนกแล้วว่าไม่เข้าพวกไหน" เด็ดขาด — ต้องแยกจาก "ยังไม่จำแนก"
model TCrmSupport {
  // ...fields เดิมทั้งหมดคงไว้ ไม่แตะ...
  MenuId     Int?    // Logical ref -> TMenu.MenuId (เมนูที่ AI จำแนกเคสนี้เข้า)
  AiCategory String? @db.VarChar(20) // BUG | FEATURE | TASK | QA เท่านั้น
  Severity   String? @db.VarChar(20) // CRITICAL | HIGH | MEDIUM | LOW
}

// ── ผลการจำแนกของ AI ต่อเคส (1:1 กับ TCrmSupport) ──
model TCrmCaseAiAssessment {
  CrmCaseAiAssessmentId Int      @id @default(autoincrement())
  CrmSupportId          Int      @unique // Logical ref -> TCrmSupport.CrmSupportId (1:1)

  // มิติ AiCategory
  AiConfidence   Float?
  AiReasoning    String?
  ReviewStatus   String?   @db.VarChar(20) // PENDING_REVIEW | CONFIRMED | OVERRIDDEN | NEEDS_HUMAN
  ReviewedBy     Int?      // Logical ref -> TAdmin.id2
  ReviewedAt     DateTime? @db.Timestamptz
  SafetyOverride Boolean   @default(false) // true = ถูกบังคับเป็น BUG โดย TCrmSafetyKeyword

  // มิติ MenuId
  MenuConfidence   Float?
  MenuReasoning    String?
  MenuReviewStatus String?   @db.VarChar(20)
  MenuReviewedBy   Int?
  MenuReviewedAt   DateTime? @db.Timestamptz

  // มิติ Severity
  SeverityConfidence   Float?
  SeverityReasoning    String?
  SeverityReviewStatus String?   @db.VarChar(20)
  SeverityReviewedBy   Int?
  SeverityReviewedAt   DateTime? @db.Timestamptz

  // ข้อสันนิษฐาน root cause ของ AI — ไม่ใช่ความจริง (ดู TCrmIssue.RootCause)
  AiHypothesis           String?
  AiHypothesisConfidence Float?

  IssueId               Int?      // Logical ref -> TCrmIssue.CrmIssueId (เคสนี้ถูกรวมเข้าเรื่องไหน)
  SlaRuleVersion        String?   @db.VarChar(20) // ระบุ version ของ CRM_SLA_RULES ตอนคำนวณ
  ComputedPriorityScore Int?
  ComputedAt            DateTime? @db.Timestamptz
  ModelVersion           String?  @db.VarChar(50)

  CreateDate DateTime  @default(now()) @db.Timestamptz
  UpdateDate DateTime? @db.Timestamptz
}

// ── Audit log แบบ append-only ของทุกการตัดสินใจ AI ──
// **(ปิดแล้ว 2026-08-17 รอบที่ 4 — ผู้ใช้ยืนยันชุดค่าที่อนุญาตครบแล้ว)**
// ชุดค่าด้านล่างคือลิสต์ที่อนุญาตอย่างเป็นทางการ — เทียบกับ `hkt-5-crm-ai-script.txt` (บรรทัด 94/96)
// คืน `MENU_RELATION` (SubjectType) และ `DEDUP_MATCH` (DecisionType) เข้ามาแล้ว
// และ **ตั้งใจไม่คืน `QUEUE_INTERRUPT`** เพราะการแทรกคิวเป็นการตัดสินใจของ *คน* ล้วน
// (`TCrmQueueInterrupt.ApprovedBy`/`Decision`/`DecisionReason` เก็บ audit ครบในตัวเองอยู่แล้ว)
// ตารางนี้เป็น audit ของการตัดสินใจ **AI** เท่านั้น — ดู § การตัดสินใจรอบที่ 4 (2026-08-17)
// **ไม่ใช่การเปลี่ยน schema ไม่ต้องรัน DDL**: คอลัมน์เป็น VarChar(20)/VarChar(30) รับค่าใหม่ได้อยู่แล้ว
// (`MENU_RELATION`=13, `DEDUP_MATCH`=11 ตัวอักษร) เป็นการแก้เอกสาร + validate ที่ app layer เท่านั้น
// `backend-engineer` เขียนได้เฉพาะค่าที่อยู่ในลิสต์ด้านล่าง (กติกาปกติของ contract นี้ ไม่ใช่สถานะรอตัดสินใจ)
// ค่าที่ต้องการเพิ่มใหม่นอกลิสต์ = ส่งกลับ `system-analyst` ก่อนเสมอ
model TCrmAiDecisionLog {
  CrmAiDecisionLogId Int      @id @default(autoincrement())
  SubjectType        String   @db.VarChar(20) // CASE | ISSUE | KNOWLEDGE | MENU_RELATION   (ไม่มี QUEUE_INTERRUPT — เจตนา)
  SubjectId          Int      // Polymorphic — join ตาม SubjectType
  DecisionType       String   @db.VarChar(30) // CLASSIFICATION | MENU_CLASSIFICATION | SEVERITY_CLASSIFICATION | PRIORITY | DEDUP_MATCH | ISSUE_LINK | KNOWLEDGE_MATCH | SAFETY_OVERRIDE
  // หมายเหตุ `DEDUP_MATCH` (นิยามใหม่ 2026-08-17): หมายถึง **"AI เสนอรวมเคส/คำขอเข้าเรื่องเดียวกัน"**
  // คู่กับ `TCrmAiSuggestion.SuggestionType = MERGE_ISSUE`/`MERGE_REQUEST` เท่านั้น
  // **ไม่ใช่** ความหมายเดิมใน DDL ต้นฉบับ (dedup ระดับเคส "เคสนี้ซ้ำกับเคส X" ตอน classify)
  // — ความหมายเดิมต้องใช้ `IsDuplicate`/`DuplicateOfCaseId` ซึ่ง `requirement.md` § Declined ตัดทิ้งแล้ว
  // ห้ามเขียนแถว `DEDUP_MATCH` จากเส้นทาง classify ปกติ ถ้าต้องการ dedup ระดับเคสจริงต้องกลับไป `business-analyst`
  AiOutput           String   // JSON string (confidence, reasoning, matched entity ฯลฯ)
  Confidence         Float?
  ModelVersion       String?  @db.VarChar(50)
  CreateDate         DateTime @default(now()) @db.Timestamptz
  ReviewStatus       String?  @db.VarChar(20) // PENDING | CONFIRMED | OVERRIDDEN
  ReviewedBy         Int?     // Logical ref -> TAdmin.id2
  ReviewReason       String?  @db.VarChar(500)
  ReviewedAt         DateTime? @db.Timestamptz
}

// ── คำที่บังคับ AiCategory = BUG เสมอ ──
model TCrmSafetyKeyword {
  CrmSafetyKeywordId Int      @id @default(autoincrement())
  Keyword            String   @db.VarChar(200)
  Active             Boolean  @default(true)
  CreateBy           Int?     // Logical ref -> TAdmin.id2
  CreateDate         DateTime @default(now()) @db.Timestamptz
}

// ── "เรื่อง" ถาวร (แยกจาก "เคส") — เต็มรูปแบบตาม hkt-5-crm-ai-script.txt (แก้ 2026-08-16: คืน ProductFeatureId/BacklogProjectID/BacklogIssueID ที่เคยตัดออก) ──
model TCrmIssue {
  CrmIssueId       Int       @id @default(autoincrement())
  Title            String    @db.VarChar(300)
  Description      String?
  Category         String    @db.VarChar(20) // BUG | FEATURE เท่านั้น (TASK/QA ไม่ต้องรวมเรื่อง)
  Status           String    @db.VarChar(20) // OPEN | INVESTIGATING | PLANNED | IN_PROGRESS | RESOLVED | DECLINED | ON_HOLD
  MenuId           Int?      // Logical ref -> TMenu.MenuId
  ProductFeatureId Int?      // Logical ref -> TCrmProductFeature.CrmProductFeatureId (เมื่อยังไม่มีเมนูจริง)
  RootCause        String?   // Freeform, ยืนยันโดยคน (SA) เท่านั้น — AI ไม่เขียนตรงนี้
  Severity         String?   @db.VarChar(20) // human-confirmed, แยกจาก TCrmSupport.Severity ที่เป็นผล AI ต่อเคส
  BacklogProjectID Int?
  BacklogIssueID   Int?
  DecisionReason   String?   @db.VarChar(500) // บังคับกรอกตอน Status = DECLINED (บังคับที่ app layer)
  DecidedBy        Int?      // Logical ref -> TAdmin.id2
  DecidedAt        DateTime? @db.Timestamptz
  CreateDate       DateTime  @default(now()) @db.Timestamptz
  CreateBy         Int?
  UpdateDate       DateTime? @db.Timestamptz
  UpdateBy         Int?
}

// ── ความรู้พร้อมตอบ — เต็มรูปแบบตาม hkt-5-crm-ai-script.txt (แก้ 2026-08-16: คืน Version/SupersededById/ProductFeatureId ที่เคยตัดออก) ──
model TCrmKnowledgeEntry {
  CrmKnowledgeEntryId Int       @id @default(autoincrement())
  Title               String    @db.VarChar(300)
  AnswerBody          String
  Category            String?   @db.VarChar(50)
  MenuId              Int?      // Logical ref -> TMenu.MenuId (primary scoping)
  ProductFeatureId    Int?      // Logical ref -> TCrmProductFeature.CrmProductFeatureId
  Status              String    @db.VarChar(20) // DRAFT | APPROVED | NEEDS_REVIEW | ARCHIVED (มีแค่ APPROVED ที่ AI ดึงไปตอบ QA ได้)
  Version             Int       @default(1)
  SupersededById      Int?      // Self-ref -> TCrmKnowledgeEntry.CrmKnowledgeEntryId (เวอร์ชันใหม่กว่า)
  SourceCrmSupportId  Int?      // Logical ref -> TCrmSupport.CrmSupportId
  ApprovedBy          Int?      // Logical ref -> TAdmin.id2
  ApprovedAt          DateTime? @db.Timestamptz
  CreateDate          DateTime  @default(now()) @db.Timestamptz
  CreateBy            Int?
  UpdateDate          DateTime? @db.Timestamptz
  UpdateBy            Int?
}

// ── แคตตาล็อกฟีเจอร์กลาง (เฉพาะฟีเจอร์ที่ยังไม่มี TMenu row จริง) — เพิ่ม 2026-08-16 ──
model TCrmProductFeature {
  CrmProductFeatureId Int       @id @default(autoincrement())
  Name                String    @db.VarChar(200)
  Description         String?
  GroupName           String?   @db.VarChar(100) // ให้ตรงคำกับ TGroupMenu.groupmenu เพื่ออ่านง่าย
  Status              String    @db.VarChar(20)  // IN_PROGRESS | PLANNED | NOT_PLANNED | DECLINED (ไม่มี AVAILABLE — ของจริงแล้วจะกลายเป็นแถว TMenu แทน)
  StatusReason        String?   @db.VarChar(500)
  OwnerAdminId        Int?      // Logical ref -> TAdmin.id2 (PM เจ้าของ)
  MenuId              Int?      // Logical ref -> TMenu.MenuId (ผูกกลับเมื่อ ship จริงเป็นเมนู)
  CreateDate          DateTime  @default(now()) @db.Timestamptz
  CreateBy            Int?
  UpdateDate          DateTime? @db.Timestamptz
  UpdateBy            Int?
}

// ── ความสัมพันธ์ระหว่างเมนู (ประกาศเองหรือ AI ค้นพบ) — เพิ่ม 2026-08-16 ──
model TCrmMenuRelation {
  CrmMenuRelationId Int       @id @default(autoincrement())
  MenuAId           Int       // Logical ref -> TMenu.MenuId
  MenuBId           Int       // Logical ref -> TMenu.MenuId
  RelationType      String    @db.VarChar(20) // RELATED | CAUSES | DEPENDS_ON
  Source            String    @db.VarChar(20) // DECLARED | AI_SUGGESTED
  Status            String    @db.VarChar(20) // CONFIRMED | PENDING_REVIEW | REJECTED (AI_SUGGESTED เริ่มที่ PENDING_REVIEW เสมอ)
  ConfirmedBy       Int?      // Logical ref -> TAdmin.id2
  ConfirmedAt       DateTime? @db.Timestamptz
  CreateDate        DateTime  @default(now()) @db.Timestamptz
}

// ── inbox กลางของ "สัญญาณเรียนรู้เบื้องหลัง" ที่ AI ค้นพบ — เพิ่ม 2026-08-16 ──
model TCrmAiSuggestion {
  CrmAiSuggestionId Int       @id @default(autoincrement())
  SuggestionType    String    @db.VarChar(30) // NEW_KNOWLEDGE | STALE_KNOWLEDGE | MERGE_ISSUE | MERGE_REQUEST | NEW_MENU_RELATION
  Payload           String    // JSON string
  Status            String    @default("PENDING") @db.VarChar(20) // PENDING | ACCEPTED | REJECTED
  ReviewedBy        Int?      // Logical ref -> TAdmin.id2
  ReviewReason      String?   @db.VarChar(500)
  ReviewedAt        DateTime? @db.Timestamptz
  CreateDate        DateTime  @default(now()) @db.Timestamptz
}

// ── บันทึกการแทรกคิวงานเร่งด่วน — เพิ่ม 2026-08-16 ──
model TCrmQueueInterrupt {
  CrmQueueInterruptId   Int       @id @default(autoincrement())
  CrmIssueId            Int       // Logical ref -> TCrmIssue.CrmIssueId
  RequestedBy           Int       // Logical ref -> TAdmin.id2
  BusinessJustification String
  EstimatedDelayDays    Int?
  BumpedItems           String    // JSON snapshot: [{issue_id, school_count, delay_days}]
  ApprovedBy            Int       // Logical ref -> TAdmin.id2 — NOT NULL โดยตั้งใจ ห้ามอนุมัติแบบไม่มีเจ้าของ
  ApprovedAt            DateTime? @db.Timestamptz
  Decision              String    @db.VarChar(20) // APPROVED | REJECTED
  DecisionReason        String?   @db.VarChar(500)
  CreateDate            DateTime  @default(now()) @db.Timestamptz
}

// ── คำสัญญาที่รับปากลูกค้า (Sales-facing) — เพิ่ม 2026-08-16 ──
model TCrmCustomerPromise {
  CrmCustomerPromiseId     Int       @id @default(autoincrement())
  SchoolId                 Int       // Logical ref -> TCompany.nCompany
  PromisedBy               Int       // Logical ref -> TAdmin.id2 (Sales admin)
  PromiseType              String    @db.VarChar(20) // FEATURE | BUG_FIX | SLA | DISCOUNT | OTHER
  MenuId                   Int?      // Logical ref -> TMenu.MenuId
  ProductFeatureId         Int?      // Logical ref -> TCrmProductFeature.CrmProductFeatureId
  Description              String
  PromisedDate             DateTime  @db.Timestamptz
  TargetDate               DateTime? @db.Timestamptz
  Status                   String    @default("PENDING") @db.VarChar(20) // PENDING | FULFILLED | BROKEN | EXPIRED
  FulfilledAt              DateTime? @db.Timestamptz
  ContractRenewalAlertDate DateTime? @db.Timestamptz
  SourceCrmSupportId       Int?      // Logical ref -> TCrmSupport.CrmSupportId
  CreateDate               DateTime  @default(now()) @db.Timestamptz
}

// ── บทบาทหน้าที่เฉพาะฟีเจอร์นี้ (ไม่ใช่กลไกตรวจสิทธิ์ — ดูหมายเหตุด้านล่าง) — เพิ่ม 2026-08-16 ──
model TCrmStaffRole {
  CrmStaffRoleId Int      @id @default(autoincrement())
  AdminId        Int      // Logical ref -> TAdmin.id2
  FunctionalRole String   @db.VarChar(20) // CS | SA | UX_UI | PM | DEV | SALES
  AssignedBy     Int?     // Logical ref -> TAdmin.id2
  AssignedAt     DateTime @default(now()) @db.Timestamptz
  Active         Boolean  @default(true)
}
```

**(แก้ 2026-08-16) ใช้ครบทั้ง 11 ตารางแล้ว ไม่มีตารางไหนถูกตัดออกอีกต่อไป** — ประวัติการตัดสินใจเดิม (ตอนยัง MVP-trim อยู่) เก็บไว้ใน § การตัดสินใจที่ผู้ใช้ยืนยันแล้ว ด้านบนเป็นบริบทเท่านั้น ไม่ใช่การตัดสินใจปัจจุบัน

**หมายเหตุ `TCrmStaffRole` vs `PERMISSIONS.CRM_AI_*`**: สองระบบอยู่คู่กัน ไม่ทับซ้อน — `PERMISSIONS.CRM_AI_CS`/`SA`/`PM` (และคอนสแตนต์ใหม่ที่ต้องเพิ่มสำหรับ `UX_UI`/`DEV`/`SALES`) ยังคงเป็นกลไก**ตรวจสิทธิ์เข้าถึง API** เหมือนเดิม ส่วน `TCrmStaffRole` เป็นตาราง**ข้อมูลธุรกิจ**สำหรับการมอบหมายงาน/แสดงรายชื่อ (เช่น "มี SA คนไหนบ้างที่มอบหมาย Issue นี้ได้") — การเขียนแถวใน `TCrmStaffRole` ไม่ได้ให้สิทธิ์เข้าถึง API ใดๆ โดยอัตโนมัติ ต้องเพิ่ม `PERMISSIONS.CRM_AI_*` ที่เกี่ยวข้องให้ admin คนนั้นแยกต่างหากเสมอ **(ปิดแล้ว 2026-08-18 — วิธี sync ยืนยันครบ)**: ทิศทางการ sync เป็นทางเดียวเสมอ **สิทธิ์ → ตาราง** ไม่ใช่ทางกลับ — `TCrmStaffRole` เป็นภาพสะท้อนของสิทธิ์ที่ derive อัตโนมัติ ไม่มีหน้า UI ให้แก้แถวตรง ๆ กติกาเต็ม (จุด trigger, การ map, ข้ามฐานข้อมูล, กรณีขอบ) อยู่ที่ § Staff Role Sync Rules


## Change Log

- 2026-10-07 — Migrated to split layout

Back-links: `design\index.md` · `..\index.md`
