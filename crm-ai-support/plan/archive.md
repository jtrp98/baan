# Plan

PlanTask format: 1

## Plan Summary

แผน 4 เฟสของโมดูล CRM AI Support & Product Intelligence (จำแนกเคส + safety override · เรื่อง/ความรู้ · feature registry/menu relation/learning loop · queue interrupt/customer promise) ทำบนตารางทั้ง 11 ตารางที่มีอยู่จริงแล้วใน `jabjai-master-single-db` — ไม่มี DDL ค้างและไม่ต้องเปิด Prisma instance เพิ่ม. ทุก task (147 ชิ้น) สถานะ verified ผ่านรอบ FULL verification ปิดงาน 2026-08-23 หลังแก้ตาม CR 3 รอบ (ดู Change Log). เอกสารถูกแปลงเป็น canonical `PlanTask format: 1` ให้ `sta --check-plan` ตรวจ DAG ได้ — ตัวตน task/status/owner/dependency คงเดิมทุกแถว โดย task sections เป็น task authority เดียวของโมดูล.

## Phase 1: Case Classification & Safety 🔒 Security gate

### Task BE-crm-ai-support-P1-01 — 3 คอลัมน์จำแนกบน TCrmSupport

Objective: เพิ่ม 3 คอลัมน์ `MenuId` Int?, `AiCategory` String? @db.VarChar(20), `Severity` String? @db.VarChar(20) บน model `TCrmSupport` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — nullable ไม่มี default (NULL = ยังไม่จำแนก)
Why: ผลจำแนกทั้ง 3 มิติต้องมีช่องเก็บบนเคสตารางเดิมโดยไม่เปลี่ยนช่องทางรับเคส และ NULL ต้องแยกจากค่าจำแนกแล้วเสมอเพื่อให้ backfill กวาดซ้ำได้ถูกเป้า
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.1, DES-001, DEC-001, DES-002, DEC-002
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แตะเฉพาะ model `TCrmSupport` ใน schema เดียว — เพิ่ม 3 คอลัมน์ nullable ตรง § Data Model ไม่แก้ field เดิม ไม่เพิ่ม relation/ตารางใหม่ (ธรรมเนียม DB นี้ไม่ใช้ FK)

#### Retrieval hints

Hypothesis: schema จริงถูก introspect แล้วและมี 3 คอลัมน์นี้อยู่จริง (design § Feasibility ยืนยัน 2026-08-17) — งานคือยืนยัน mapping/type ตรง § Data Model ก่อนปิดงาน
Query: หา `model TCrmSupport`, `AiCategory`, `MenuId`, `Severity` ใน `prisma/jabjai-master-single-db/schema.prisma`
Provenance: DES-001, DEC-001, DES-002, DEC-002

#### Do not modify

model อื่นทั้งหมด · field เดิมของ `TCrmSupport` · การใส่ default ให้คอลัมน์ใหม่ (ทำให้ NULL หมายความเดียวกับ ยังไม่จำแนก ไม่ได้อีก)

#### Acceptance criteria

AC-002.1: เคสมีช่องเก็บผลจำแนก 4 หมวดจริง (`AiCategory`) พร้อม `MenuId`/`Severity` ตาม § Data Model — โครงเก็บผลพร้อมใช้

#### Required validation and expected evidence

ตรวจ AC-002.1 ด้วยการเทียบ field/type ใน schema กับ § Data Model ทีละคอลัมน์ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

คอลัมน์ nullable additive — ถอนออกจาก schema แล้วตรวจซ้ำด้วย `prisma db pull` ได้ ไม่มีข้อมูลเดิมสูญ (ค่าเป็น NULL ตามธรรมชาติ)

### Task BE-crm-ai-support-P1-02 — model TCrmCaseAiAssessment

Objective: เพิ่ม model `TCrmCaseAiAssessment` ใน `prisma/jabjai-master-single-db/schema.prisma` ครบตาม § Data Model — ผลจำแนก/confidence/reasoning, คอลัมน์ review status แยกมิติ, `IssueId`, `SlaRuleVersion`/`ComputedPriorityScore`
Why: เป็นตารางกลางที่ classify/review-queue/backfill/priority ทุกเส้นทางอ่าน-เขียนร่วมกัน โครงต้องตรง design ทุก field จึงไม่เกิดสองแหล่งความจริง
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.2, DES-001, DEC-001
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม model เดียวตรง § Data Model ทุก field — ไม่มี `@relation` (reference เป็น logical ref ที่ app layer ตามธรรมเนียม DB นี้)

#### Retrieval hints

Hypothesis: model มีอยู่จริงแล้วในฐานข้อมูล (introspect ยืนยัน) — ตรวจว่า schema.prisma ตรง design ทุก field รวมคอลัมน์ที่ restore ทีหลัง
Query: หา `model TCrmCaseAiAssessment`, `ReviewStatus`, `MenuReviewStatus`, `SlaRuleVersion`, `ComputedPriorityScore` ใน schema
Provenance: DES-001, DEC-001

#### Do not modify

model/ตารางอื่น · field เดิมของ `TCrmSupport` · การเพิ่ม `@relation`/FK ใน DB ที่ตั้งใจไม่ใช้

#### Acceptance criteria

AC-002.2: โครงตารางเก็บเหตุผลและความมั่นใจของ AI ครบ (`AiReasoning`/`AiConfidence` ฯลฯ) — audit ย้อนหลังได้ตาม § Data Model

#### Required validation and expected evidence

ตรวจ AC-002.2 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

model additive — ลบออกจาก schema ได้โดยข้อมูลเดิมใน DB ไม่กระทบ

### Task BE-crm-ai-support-P1-03 — model TCrmSafetyKeyword

Objective: เพิ่ม model `TCrmSafetyKeyword` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — คำสำคัญความเสี่ยงร้ายแรงที่ใช้บังคับ BUG + `SafetyOverride=true`
Why: safety override ต้องมีตารางคำสำคัญที่สั่งการได้จริง (แถว Active=true เท่านั้น) ก่อนเชื่อผล AI ตามกติกา DES-001
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม model เดียวตรง § Data Model — กติกาใช้เฉพาะแถว `Active=true` อยู่ที่ app layer (classify) ไม่ฝังใน schema

#### Retrieval hints

Hypothesis: model มีอยู่จริงแล้วใน DB (introspect ยืนยัน) — ยืนยัน mapping/type กับ § Data Model ก่อนปิดงาน
Query: หา `model TCrmSafetyKeyword`, `Active` ใน `prisma/jabjai-master-single-db/schema.prisma`
Provenance: DES-001, DEC-001

#### Do not modify

model อื่น · กติกาบังคับ BUG (เขียนที่ classify เท่านั้น ไม่ใช่ใน schema)

#### Acceptance criteria

AC-004.1: มีโครงเก็บคำสำคัญความเสี่ยงร้ายแรงที่ classify อ่านไปบังคับ BUG เสมอได้ — ตารางพร้อมใช้ตาม § Data Model

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วยการเทียบ schema กับ § Data Model + ยืนยันเส้นทางอ่านของ classify อ้างตารางนี้ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

model additive — ลบออกได้ ไม่กระทบตารางอื่น

### Task BE-crm-ai-support-P1-04 — model TCrmAiDecisionLog (append-only)

Objective: เพิ่ม model `TCrmAiDecisionLog` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — audit trail append-only ของการตัดสินใจ AI/คน ทุก `SubjectType`/`DecisionType`
Why: ทุกการตัดสินใจ (จำแนก/override/รีวิว/merge) ต้องมีแถว audit คู่กันเสมอ โครงตารางต้องรองรับชุดค่าที่ design ปิดครบไว้
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.2, DES-001, DEC-001
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม model เดียวตรง § Data Model — ธรรมชาติ append-only บังคับที่ app layer (`createDecisionLog` เท่านั้น ห้าม update คอลัมน์ตายตัว) ตาม DEC-001

#### Retrieval hints

Hypothesis: model มีอยู่จริงแล้วใน DB — ยืนยันชุด enum `SubjectType`/`DecisionType` ใน § Data Model ตรง schema
Query: หา `model TCrmAiDecisionLog`, `createDecisionLog`, `SubjectType`, `DecisionType` ใน schema และซอร์สโมดูล
Provenance: DES-001, DEC-001

#### Do not modify

model อื่น · การเปิด update คอลัมน์ append-only (ขัด DEC-001 โดยตรง)

#### Acceptance criteria

AC-002.2: มี audit log เก็บทุกการตัดสินใจแบบ append-only — ตรวจย้อนหลังได้ว่าใคร/อะไร/เพราะอะไร

#### Required validation and expected evidence

ตรวจ AC-002.2 ด้วยการเทียบ schema กับ § Data Model + อ่านเส้นทางเขียนที่ผ่าน `createDecisionLog` เท่านั้น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

model additive — ลบออกได้ ไม่กระทบตารางอื่น

### Task BE-crm-ai-support-P1-05 — PERMISSIONS.CRM_AI_CS/SA/PM

Objective: เพิ่ม `PERMISSIONS.CRM_AI_CS` / `PERMISSIONS.CRM_AI_SA` / `PERMISSIONS.CRM_AI_PM` ใน `src/constants/permission.constant.ts` — แทนตาราง staff-role แยกตามมติ design
Why: การตรวจสิทธิ์ทุก endpoint ของโมดูลต้องอ้างค่า constant เดียวกัน — ใช้ตารางแยกจะทำให้สองแหล่งความจริงเรื่องสิทธิ์
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 3 ค่า constant ในไฟล์ permission เดิม — guard ของทุก route ในโมดูลอ้างชื่อค่าเหล่านี้เสมอ ไม่ hardcode string ซ้ำ

#### Retrieval hints

Hypothesis: `permission.constant.ts` มีโครง PERMISSIONS รวมอยู่แล้ว — ยืนยันชื่อค่าที่ใช้จริงใน guard ของโมดูลก่อนใช้
Query: หา `PERMISSIONS`, `CRM_AI_CS`, `CRM_AI_SA`, `CRM_AI_PM` ใน `src/constants/permission.constant.ts` และ guard ของโมดูล
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission ของโมดูลอื่น · การผูก constant กับตาราง `TCrmStaffRole` (derive ทางเดียวเป็นของ DES-006 ภายหลัง)

#### Acceptance criteria

AC-016.2: การตรวจสิทธิ์เข้าถึง API ยังใช้ `PERMISSIONS.CRM_AI_*` เดิม — constant ครบ 3 ค่าสำหรับ CS/SA/PM และ guard อ้างผ่านค่าเดียว

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการอ่าน guard ของ routes โมดูลว่าอ้าง constant นี้เท่านั้น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

constant additive — ลบรายค่าได้ แต่ต้องไม่ลบขณะ guard ยังอ้างอยู่

### Task BE-crm-ai-support-P1-06 — CRM_SLA_RULES constant (v1)

Objective: เพิ่ม `CRM_SLA_RULES` code constant แบบ versioned (version tag ตรงกับ `TCrmCaseAiAssessment.SlaRuleVersion`) — ค่าเริ่มต้น: severity weight CRITICAL/HIGH/MEDIUM/LOW = 100/70/40/10, contract-tier multiplier 1.0–2.0, `AiConfidence` threshold ส่งเข้า `NEEDS_HUMAN` = 0.6
Why: สูตรคะแนนและ threshold ต้องมาจากค่าเดียวที่แก้ได้โดย deploy ไม่ใช่ค่ากระจายในโค้ด — ผู้ใช้ยืนยันให้ตั้งค่าเริ่มต้นชั่วคราวเพื่อไม่ให้ Phase 1 ค้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, AC-003.3, DES-005, DEC-005
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ไฟล์ constant ใหม่ 1 ไฟล์ (`crm-sla-rule.constant.ts`) — เก็บ version tag คู่กับค่าทุกตัว ห้ามให้ไฟล์นี้รู้จัก Prisma (การนับข้อมูลเป็นงาน repository/service ตาม DEC-005)

#### Retrieval hints

Hypothesis: ไฟล์ constant วางคู่กับ constant อื่นใน `src/constants/` — ยืนยัน symbol ที่ classify/review-queue import จริงก่อนใช้
Query: หา `CRM_SLA_RULES`, `CRM_SLA_RULE_VERSION`, `crm-sla-rule.constant.ts`, `CRM_AI_CONFIDENCE_THRESHOLD` ใน Target
Provenance: DES-005, DEC-005

#### Do not modify

schema/ตาราง · call site ที่คำนวณคะแนน (import ค่าเท่านั้น) · ค่า threshold ที่ยืนยันไว้ (แก้ = ผ่าน version bump ตามกติกา)

#### Acceptance criteria

AC-003.1: น้ำหนัก severity และตัวคูณอยู่ใน constant ตรงชุดที่ยืนยันไว้ ณ งานนี้ (คะแนน = weight × multiplier) — ค่ามาจาก constant เดียว
AC-003.3: constant มี version tag ผูกกับ `TCrmCaseAiAssessment.SlaRuleVersion` — อ่านคะแนนเก่าย้อนตามเวอร์ชันได้

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วยการเทียบค่า constant กับชุดที่ยืนยัน · ตรวจ AC-003.3 ด้วยการอ่านจุดเขียน `SlaRuleVersion` ว่าอ่านจาก constant — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ constant ใหม่ additive — แก้ค่าหลังใช้งานต้อง bump version ตามกติกา ไม่แก้ข้ามเวอร์ชัน

### Task BE-crm-ai-support-P1-07 — POST /safety-keywords

Objective: เพิ่ม `POST /api/v2/support/crm-ai/safety-keywords` — สร้าง safety keyword (guard `auth()` + `CRM_AI_SA`/`CRM_AI_PM`)
Why: SA/PM ต้องเพิ่มคำสำคัญความเสี่ยงได้เองโดยไม่แก้โค้ด — safety override จึงตามของจริงได้ทันที
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern ของโมดูล — write สงวน `CRM_AI_SA`/`CRM_AI_PM` · error ผ่าน `handleError(err, "[CRM_AI_...]")` · ไม่แตะ schema

#### Retrieval hints

Hypothesis: route อยู่ใต้ `src/app/api/v2/support/crm-ai/safety-keywords/` ตาม flat pattern route.ts + .service.ts ของโมดูล — ยืนยัน path/guard กับซอร์สจริง
Query: หา `safety-keywords/route.ts`, `CRM_AI_SA`, `handleError` ใน Target
Provenance: DES-001, DEC-001

#### Do not modify

กติกาบังคับ BUG ที่ classify (จัดการที่ BE-crm-ai-support-P1-11) · schema/ตาราง · permission เดิม

#### Acceptance criteria

AC-004.1: เพิ่มคำสำคัญความเสี่ยงผ่าน endpoint ได้จริงโดยเฉพาะผู้มีสิทธิ์ SA/PM — คำสำคัญใหม่มีผลกับการจำแนกเคสถัดไปทันที

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วย dev server: สร้าง keyword สำเร็จ + 401/403 เมื่อสิทธิ์ไม่พอ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบ endpoint อื่น

### Task BE-crm-ai-support-P1-08 — GET /safety-keywords list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/safety-keywords` — list พร้อม pagination
Why: หน้าจัดการคำสำคัญต้องอ่านรายการผ่าน API เดียวกับที่เขียน — pagination บังคับทุก list ตาม contract ของโมดูล
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint เดียว พร้อม pagination — ไม่มี write path ใน route นี้

#### Retrieval hints

Hypothesis: route อยู่คู่กับ POST ของ area เดียวกัน — ยืนยัน pattern pagination ที่โมดูลใช้จริงก่อนใช้
Query: หา `safety-keywords/route.ts`, `buildPagination` ใน Target
Provenance: DES-001, DEC-001

#### Do not modify

ค่า keyword ใน DB (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-004.1: อ่านรายการคำสำคัญทั้งหมดผ่าน endpoint แบ่งหน้าได้ — ข้อมูลตรงตารางจริง

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วย dev server: list สำเร็จ + pagination ทำงาน + 401 เมื่อไม่ล็อกอิน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P1-09 — PATCH /safety-keywords/[id]

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/safety-keywords/[id]` — แก้ไข/ปิดใช้งาน (`Active`)
Why: คำสำคัญที่ผิด/หมดใช้ต้องปิดด้วย `Active=false` ไม่ลบแถว — ประวัติ keyword จึงตามรอบ audit ได้
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

update เฉพาะ field ที่อนุญาต (`Active` และค่า keyword) — ปิดใช้งาน = `Active=false` เท่านั้น ไม่มี hard delete ใน route นี้

#### Retrieval hints

Hypothesis: route แยกไฟล์ `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน schema (Zod) ที่ route ใช้ก่อนแก้
Query: หา `safety-keywords/[id]`, `Active`, `handleError` ใน Target
Provenance: DES-001, DEC-001

#### Do not modify

แถว audit อื่นที่ไม่เกี่ยว · schema · การลบแถวจาก route PATCH

#### Acceptance criteria

AC-004.1: ปิดใช้งานคำสำคัญผ่าน endpoint ได้ — keyword ที่ `Active=false` ไม่ถูกใช้บังคับ BUG อีกต่อไป

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วย dev server: PATCH `Active=false` สำเร็จ + classify ไม่ตรงคำสำคัญที่ปิดแล้ว — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ สถานะ `Active` แก้กลับได้ผ่าน PATCH เดียวกัน

### Task BE-crm-ai-support-P1-10 — DELETE /safety-keywords/[id]

Objective: เพิ่ม `DELETE /api/v2/support/crm-ai/safety-keywords/[id]`
Why: คำสำคัญที่สร้างผิดต้องลบออกได้โดยเฉพาะผู้มีสิทธิ์ — คงปุ่มเดียวจบสำหรับข้อมูลสกปรกก่อนถูกใช้จริง
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

delete เฉพาะแถว keyword — guard `CRM_AI_SA`/`CRM_AI_PM` เดียวกับ write อื่นของ area นี้

#### Retrieval hints

Hypothesis: route แยกไฟล์ `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน method DELETE ที่ export จริงก่อนแก้
Query: หา `safety-keywords/[id]`, `DELETE` ใน Target
Provenance: DES-001, DEC-001

#### Do not modify

แถว `TCrmAiDecisionLog` (append-only แตะไม่ได้เลย) · schema · endpoint อื่น

#### Acceptance criteria

AC-004.1: ลบคำสำคัญที่ผิดผ่าน endpoint ได้โดยเฉพาะผู้มีสิทธิ์ — คำสำคัญที่ถูกลบไม่มีผลกับการจำแนกอีก

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วย dev server: DELETE สำเร็จ + 403 เมื่อสิทธิ์ไม่พอ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ (ข้อมูลที่ลบอยู่ใน DB backup ปกติ)

### Task BE-crm-ai-support-P1-11 — POST /cases/[id]/classify pipeline

Objective: เพิ่ม `POST /api/v2/support/crm-ai/cases/[id]/classify` — เช็ค `TCrmSafetyKeyword` (Active=true) ก่อนเสมอ (ตรง = บังคับ `AiCategory=BUG` + `SafetyOverride=true`) → ไม่ตรงเรียก Gemini จำแนก 4 หมวดพร้อม confidence/reasoning → เขียน `TCrmCaseAiAssessment` + แถว `TCrmAiDecisionLog` (`CLASSIFICATION`/`SAFETY_OVERRIDE`) — confidence ต่ำกว่า threshold ตั้ง `ReviewStatus=NEEDS_HUMAN`
Why: เป็นหัวใจการจำแนกของโมดูล — ลำดับ keyword-ก่อน-AI และ audit คู่ทุกผลต้องผูกเป็นสัญญาเดียวที่เส้นทางอื่น (backfill/review/trigger) อ้างอิง
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.1, AC-002.2, REQ-004, AC-004.1, AC-004.2, DES-001, DEC-001
Produces: Contract:CrmAiClassificationSafety.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

pipeline เดียวจบใน endpoint นี้ — เขียน assessment + decision log คู่กันทุกครั้ง ไม่มีทางเขียนครึ่ง ๆ ด้วยค่าเดา · TASK ส่งตรงเข้า Dev ไม่ผ่าน safety gate (AC-004.3 เป็นพฤติกรรมของ flow ปลายทาง)

#### Retrieval hints

Hypothesis: โค้ง pipeline อยู่ใน `cases/` (classification.service.ts + classify-with-gemini.ts) — ยืนยัน symbol/ลำดับเช็คกับซอร์สจริง
Query: หา `cases/[id]/classify`, `classificationService.classify`, `SafetyOverride`, `TCrmAiDecisionLog` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

ลำดับเช็ค keyword ก่อน Gemini (DEC-001 ห้ามสลับ) · คอลัมน์ append-only ของ decision log หลัง insert · ช่องทางบันทึกเคสเดิมใน backlog/crm

#### Acceptance criteria

AC-002.1: เคสถูกจำแนกเป็นหนึ่งใน BUG/FEATURE/TASK/QA เสมอ — ไม่มีหมวดที่ห้า
AC-002.2: ทุกผลจำแนกมีเหตุผล/ความมั่นใจเก็บครบและมีแถว decision log คู่กัน
AC-004.1: คำสำคัญความเสี่ยงร้ายแรงบังคับ BUG ก่อนเชื่อผล AI เสมอ (เช็คก่อนเรียก Gemini)
AC-004.2: confidence ต่ำกว่า threshold หรืออ่านผลไม่ได้ → `NEEDS_HUMAN` — ไม่ปิดเคสอัตโนมัติ

#### Required validation and expected evidence

ตรวจ AC-002.1/AC-002.2/AC-004.1/AC-004.2 ด้วย dev server ต่อกรณี: ตรง keyword / ไม่ตรง + confidence สูง / confidence ต่ำ — เทียบ assessment + log ที่เขียน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้ เคสที่จำแนกไปแล้วคงค่าใน assessment (ลบ endpoint ไม่ลบข้อมูล)

### Task BE-crm-ai-support-P1-12 — GET /review-queue

Objective: เพิ่ม `GET /api/v2/support/crm-ai/review-queue` — list เคสที่ `ReviewStatus IN (PENDING_REVIEW, NEEDS_HUMAN)` พร้อม pagination + filter (`AiCategory`/`Severity`)
Why: คิวตรวจต้องดึงเฉพาะเคสที่รอคนตัดสินใจ — เคสปกติที่ CONFIRMED ต้องไม่ปนมาให้คนตรวจซ้ำ
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.2, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint เดียว — เงื่อนไขคิวคือสถานะรอตรวจเท่านั้น + pagination/filter ครบ

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/review-queue/` ตาม pattern โมดูล — ยืนยัน where clause กับซอร์สจริง
Query: หา `review-queue/route.ts`, `PENDING_REVIEW`, `NEEDS_HUMAN` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

สถานะของเคส (อ่านอย่างเดียว) · คิวของโมดูลอื่น · schema

#### Acceptance criteria

AC-004.2: เคสที่ AI ไม่มั่นใจปรากฏในคิวตรวจสอบและไม่ถูกปิดอัตโนมัติ — list แบ่งหน้า/กรองได้จริง

#### Required validation and expected evidence

ตรวจ AC-004.2 ด้วย dev server: เคส NEEDS_HUMAN ขึ้นคิว, เคส CONFIRMED ไม่ขึ้น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P1-13 — PATCH /review-queue/[id] confirm/override

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/review-queue/[id]` — คนยืนยัน (`CONFIRMED`) หรือแก้ไข (`OVERRIDDEN`) ผลจำแนก เขียน `ReviewedBy`/`ReviewedAt` + แถวใหม่ลง `TCrmAiDecisionLog` (คอลัมน์ append-only เดิมห้ามแก้)
Why: การตัดสินใจของคนต้องมีตัวตน+เวลา+audit คู่ทุกครั้ง และห้ามแก้ประวัติเดิม — คิวตรวจจึงเชื่อถือได้
Owner: backend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-001, DEC-001, DES-003, DEC-003
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

endpoint ตัดสินใจของคน — เขียน `{Dim}ReviewStatus` + `{Dim}ReviewedBy` + `{Dim}ReviewedAt` พร้อมกัน · กลไกอัตโนมัติห้ามเขียน `*ReviewedBy`/`*ReviewedAt` (DEC-003)

#### Retrieval hints

Hypothesis: route อยู่คู่กับ GET คิว — ยืนยัน Zod schema ของ body และจุดเขียน log กับซอร์สจริง
Query: หา `review-queue/[id]`, `OVERRIDDEN`, `ReviewedBy` ใน Target
Provenance: DES-001, DEC-001, DES-003, DEC-003

#### Do not modify

แถว decision log เดิม (append-only) · การให้กลไกอัตโนมัติเขียน `*ReviewedBy`/`*ReviewedAt` แทนคน

#### Acceptance criteria

AC-009.1: คนตรวจตัดสินผลจำแนกบนคิวได้จริง — ทุกการตัดสินมีผู้รีวิว/เวลา/audit คู่กัน

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วย dev server: CONFIRMED/OVERRIDDEN เขียนสถานะ+ผู้รีวิวถูกต้อง + decision log มีแถวใหม่ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ (การตัดสินที่บันทึกแล้วเป็นข้อมูลของคน ไม่ย้อนอัตโนมัติ)

### Task BE-crm-ai-support-P1-14 — GET /decision-log audit trail

Objective: เพิ่ม `GET /api/v2/support/crm-ai/decision-log` — audit trail read-only พร้อม pagination + filter (`SubjectType`/`DecisionType`)
Why: audit ต้องอ่านได้จาก API เดียวแบบ read-only เท่านั้น — ห้ามมี write path ปนใน endpoint นี้เด็ดขาด
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.2, DES-001, DEC-001
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint เดียว — ไม่มี POST/PATCH/DELETE และไม่ join แก้ข้อมูลต้นทาง

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/decision-log/` — ยืนยัน filter field กับชุด enum ใน § Data Model ก่อนใช้
Query: หา `decision-log/route.ts`, `SubjectType`, `DecisionType` ใน Target
Provenance: DES-001, DEC-001

#### Do not modify

แถว log (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-002.2: ตรวจ audit ย้อนหลังได้ผ่าน endpoint — กรองตาม SubjectType/DecisionType และแบ่งหน้าได้จริง

#### Required validation and expected evidence

ตรวจ AC-002.2 ด้วย dev server: กรองได้ทุกค่า enum หลัก + 401 เมื่อไม่ล็อกอิน + ไม่มี write method — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-01 — เมนู ตรวจสอบการจำแนกเคส AI

Objective: เพิ่มเมนู "ตรวจสอบการจำแนกเคส AI" (`news: true`) ใน `sidebar-component.tsx`
Why: คนตรวจต้องมีทางเข้าคิวจากเมนูปกติ — ไม่สร้างทางเข้านอกโครง sidebar เดิม
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, AC-004.2, DES-001, DEC-001
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant ใต้กลุ่มเมนูที่กำหนด — ไม่แตะเมนูอื่นและไม่แก้โครง sidebar

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง (`sidebar-menu-constant.tsx`) + component เดิม — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-001, DEC-001

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า (สร้างที่ task scaffold)

#### Acceptance criteria

AC-004.2: ทางเข้าคิวตรวจสอบปรากฏบนเมนูและพาไปถึงหน้า review-queue ได้จริง

#### Required validation and expected evidence

ตรวจ AC-004.2 ด้วยการคลิกเมนูจริงเข้าหน้าคิว — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P1-02 — scaffold review-queue page

Objective: scaffold `src/app/pages/support/crm-ai/review-queue/page.tsx` (Filter → Table → รายละเอียด ตาม /table skill)
Why: โครงหน้าต้องเป็น pattern มาตรฐานของโปรเจกต์ (page.tsx + _components/_stores/_api) จึงต่อยอดได้โดยไม่แตก pattern
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, AC-004.2, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้าตาม /table skill — ยังไม่รวม component รายละเอียดที่แตกเป็น task ถัดไปของเฟสนี้

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/review-queue` มีแค่โฟลเดอร์ว่าง — สร้างไฟล์จริงตาม pattern หน้าอื่น ยืนยันก่อนแก้
Query: หา `crm-ai/review-queue/page.tsx`, `_components`, `_stores` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

หน้าอื่นของโมดูล · route guard ฝั่ง API · mockup เดิมที่ใช้อ้างรูปแบบ

#### Acceptance criteria

AC-004.2: หน้าคิวตรวจสอบเปิดได้จริงด้วยโครง Filter → Table → รายละเอียด — พร้อมต่อข้อมูลจาก API

#### Required validation and expected evidence

ตรวจ AC-004.2 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-03 — case-review-filter component

Objective: `_components/case-review-filter.component.tsx` — กรองตาม `AiCategory`/`ReviewStatus`/`Severity`
Why: คิวตรวจมีเคสหลายมิติ — กรองให้ตรงมิติที่คนรับผิดชอบลดเวลาไล่หา
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component filter เดี่ยว — ค่า filter ผูกกับ store ของหน้า ไม่เรียก API เอง

#### Retrieval hints

Hypothesis: component วางใต้ `_components/` ของหน้า review-queue — ยืนยันชื่อไฟล์จริงก่อนแก้
Query: หา `case-review-filter.component.tsx`, `AiCategory` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

ตาราง/drawer (task อื่น) · endpoint ฝั่ง BE

#### Acceptance criteria

AC-009.1: กรองคิวตามมิติ (ประเภท/สถานะรีวิว/ความรุนแรง) ได้จริง — ผลกรองตรงกับ query ที่ API รับ

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วยการเลือก filter จริงเทียบกับผล list — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-04 — case-review-table component

Objective: `_components/case-review-table.component.tsx` — ตาราง pagination, คอลัมน์ลำดับ, ปุ่ม refresh, action icon-only
Why: คิวตรวจใช้ตารางเป็นหลัก — ต้องเป็น pattern ตารางมาตรฐาน (pagination/sort/refresh) จึงคุม UX เดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตารางเดี่ยว — action เป็น icon-only ตามมาตรฐาน /table skill

#### Retrieval hints

Hypothesis: มี table component กลางของโปรเจกต์ให้ reuse — ยืนยัน component กลางจริงก่อนเขียนใหม่
Query: หา `case-review-table.component.tsx` และ table component กลางของ /table skill ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

filter/drawer (task อื่น) · endpoint ฝั่ง BE

#### Acceptance criteria

AC-009.1: ตารางคิวแบ่งหน้า/เรียงคอลัมน์/refresh ได้จริง — action เป็น icon-only ครบ

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วยการใช้ตารางจริง (แบ่งหน้า/เรียง/refresh) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-05 — case-review-detail-drawer component

Objective: `_components/case-review-detail-drawer.component.tsx` — แสดง `AiReasoning`/`AiConfidence` พร้อมปุ่มยืนยัน/แก้ไข (ใช้ `StatusModalComponent` type "confirm" ตาม Form Workflow มาตรฐาน)
Why: คนตรวจต้องเห็นเหตุผล/ความมั่นใจของ AI ก่อนกด — การยืนยัน/แก้ไขต้องผ่าน confirm modal เดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

drawer + ปุ่มตัดสินใจผ่าน StatusModalComponent — ยังเป็นการตัดสินรวมทั้งเคส (แยกมิติเป็นของ amendment ภายหลัง)

#### Retrieval hints

Hypothesis: drawer pattern มีตัวอย่างจากหน้าอื่น — ยืนยัน component กลาง StatusModalComponent ก่อนใช้
Query: หา `case-review-detail-drawer.component.tsx`, `StatusModalComponent`, `AiReasoning` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

flow ตัดสินใจฝั่ง API (PATCH) · component ตาราง/filter

#### Acceptance criteria

AC-009.1: เหตุผล/ความมั่นใจของ AI แสดงครบใน drawer และกดยืนยัน/แก้ไขผ่าน confirm modal ได้จริง

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วยการเปิด drawer จริง + กดผ่าน modal — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-06 — use-case-review-store

Objective: `_stores/use-case-review-store.ts` — store กลางของหน้า review-queue
Why: filter/ตาราง/drawer ต้องแชร์ state ผ่าน store เดียว ไม่ยก state ข้าม component
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store เดียวของหน้า — pattern Zustand เดียวกับหน้าอื่นของโปรเจกต์

#### Retrieval hints

Hypothesis: โปรเจกต์ใช้ Zustand ใน `_stores/` ทุกหน้า — ยืนยัน pattern store จริงก่อนเขียน
Query: หา `use-case-review-store.ts`, `create(` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

store ของหน้าอื่น · service layer (task ถัดไป)

#### Acceptance criteria

AC-009.1: state ของหน้าคิว (filter/ข้อมูล/ตัวเลือก) รวมอยู่ที่ store เดียว — component ทุกตัวอ่าน-เขียนผ่าน store

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วย tsc/eslint + การใช้งานหน้าจริงผ่าน store — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ store ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-07 — case-review-service API layer

Objective: `_api/case-review-service.ts` — service เรียก review-queue API ของหน้าคิว
Why: URL/การเรียก API รวมที่ service เดียว — หน้าไม่ fetch เองกระจัดกระจาย
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

service เดียวสำหรับ GET คิว + PATCH ตัดสินใจ — ตาม pattern `_api/` ของโปรเจกต์

#### Retrieval hints

Hypothesis: มี helper เรียก API กลางของโปรเจกต์ — ยืนยัน base URL/handler จริงก่อนเขียน
Query: หา `case-review-service.ts`, `_api` pattern ของหน้าอื่นใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

endpoint ฝั่ง BE · service ของหน้าอื่น

#### Acceptance criteria

AC-009.1: หน้าคิวโหลดข้อมูล/ส่งการตัดสินใจผ่าน service เดียว — ไม่มีการเรียก API กระจายใน component

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ service ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-08 — scaffold safety-keywords page

Objective: scaffold `src/app/pages/support/crm-ai/settings/safety-keywords/page.tsx` (Filter → Table CRUD)
Why: หน้าจัดการคำสำคัญต้องเป็น CRUD มาตรฐานเดียวกับทั้งโมดูล — SA/PM จัดการเองได้โดยไม่แก้โค้ด
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า CRUD ตาม /table skill — ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `settings/safety-keywords` มีแค่โฟลเดอร์ว่าง — สร้างไฟล์จริงตาม pattern หน้าอื่น
Query: หา `settings/safety-keywords/page.tsx` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · permission constant

#### Acceptance criteria

AC-004.1: หน้าจัดการคำสำคัญเปิดได้จริงด้วยโครง CRUD มาตรฐาน — พร้อมต่อข้อมูลจาก API

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-09 — safety-keyword table + form modal

Objective: `_components/safety-keyword-table.component.tsx` + `_components/safety-keyword-form-modal.component.tsx` (ใช้ `StatusModalComponent`/Form Workflow มาตรฐาน)
Why: CRUD คำสำคัญต้องผ่าน Form Workflow เดียวกันทั้งโมดูล (Modal confirm → API → StatusModalComponent) — UX และ error path เดียวกัน
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal เดี่ยว — เพิ่ม/แก้/ปิดใช้/ลบ ผ่าน endpoint ของ area เดียวกัน

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยัน component กลางก่อนเขียน
Query: หา `safety-keyword-table.component.tsx`, `safety-keyword-form-modal.component.tsx`, `StatusModalComponent` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

endpoint ฝั่ง BE · หน้า scaffold (task อื่น)

#### Acceptance criteria

AC-004.1: เพิ่ม/แก้ไข/ปิดใช้งานคำสำคัญผ่านฟอร์มบนหน้าได้จริงตาม Form Workflow มาตรฐาน

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วย CRUD จริงบนหน้า (สำเร็จ + error path) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-10 — safety-keyword store + service

Objective: `_stores/use-safety-keyword-store.ts`, `_api/safety-keyword-service.ts`
Why: state และการเรียก API ของหน้าคำสำคัญรวมที่ store/service เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า settings/safety-keywords — pattern เดียวกับหน้า review-queue

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าคิว — ยืนยันก่อนเขียน
Query: หา `use-safety-keyword-store.ts`, `safety-keyword-service.ts` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-004.1: หน้าคำสำคัญโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-11 — ผูกสิทธิ์ 2 หน้าเข้า permission page

Objective: ผูกสิทธิ์หน้า review-queue และ settings/safety-keywords เข้า `src/app/pages/admin/permission/page.tsx` ตาม `PERMISSIONS.CRM_AI_*` (feature จริง ไม่ใช่ POC — ต้อง sync ตาม CLAUDE.md § 5.6)
Why: สิทธิ์ที่ไม่ผูกหน้าจริงจะกลายเป็น POC — ผู้ดูแลต้องมอบ/ถอนสิทธิ์จากหน้า permission กลางได้จริง
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

แตะเฉพาะการผูก label/ค่า permission เข้าหน้า admin/permission — ไม่สร้าง permission ใหม่ (ใช้ constant จาก BE-crm-ai-support-P1-05)

#### Retrieval hints

Hypothesis: หน้า permission มีโครงผูก feature อยู่แล้ว — ยืนยันวิธี sync ตาม CLAUDE.md § 5.6 ก่อนแก้
Query: หา `admin/permission/page.tsx`, `CRM_AI_CS`, `CRM_AI_SA`, `CRM_AI_PM` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission constant (task BE-crm-ai-support-P1-05) · หน้า workflow อื่น · guard ฝั่ง API

#### Acceptance criteria

AC-016.2: มอบ/ถอนสิทธิ์ CRM AI จากหน้า permission กลางแล้วผลถึงการเข้าถึงหน้าจอ 2 หน้านี้จริง

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

การผูกเป็นข้อมูล/ไฟล์ของหน้า permission — revert รายจุดได้

### Task FE-crm-ai-support-P1-12 — auto-trigger classify หลัง createCase

Objective: เชื่อม auto-trigger `POST /api/v2/support/crm-ai/cases/[id]/classify` เข้ากับ `createCase` ใน `src/app/pages/support/backlog/crm/_stores/crm-store.ts` (fire-and-forget หลังสร้างเคสสำเร็จ) — เป็นจุดที่ CS สร้างเคสจริง ไม่สร้างหน้าสร้างเคสใหม่ซ้ำ
Why: ทุกเคสต้องถูกจำแนกทันทีที่บันทึก — ต่อที่จุดสร้างเคสจริงเดิมจึงไม่มีเคสไหนหลุดและไม่สร้างช่องทางใหม่แย่งความหมาย
Owner: frontend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, REQ-002, AC-002.1, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แตะ store ของ backlog/crm จุดเดียว (หลังสร้างเคสสำเร็จ) — fire-and-forget: classify ล้มห้ามทำให้การบันทึกเคสล้ม

#### Retrieval hints

Hypothesis: `createCase` ใน crm-store.ts คือจุดเดียวที่ CS สร้างเคสจริง — ยืนยัน flow สร้างเคสกับซอร์สจริงก่อนต่อ
Query: หา `createCase`, `crm-store.ts`, `cases/[id]/classify` ใน Target
Provenance: DES-001, DEC-001, Contract:CrmAiClassificationSafety.v1

#### Do not modify

flow สร้างเคสเดิม (ห้ามบล็อก/ห้ามรอ classify) · type-tag/severity-tag/status-tag mockup เดิมของ backlog (casing คนละแบบกับ `AiCategory` จริง)

#### Acceptance criteria

AC-001.1: เคสทุกใบที่สร้างจากฟอร์มเดิมถูกบันทึกปกติและถูกส่งจำแนกทันที — ไม่มีเคสที่ข้ามการจำแนก
AC-002.1: ผลจำแนกปรากฏบนเคสใหม่ผ่านเส้นทาง auto-trigger จริง

#### Required validation and expected evidence

ตรวจ AC-001.1/AC-002.1 ด้วยการสร้างเคสจริงผ่านฟอร์มเดิมแล้วเห็น assessment ถูกสร้าง + กรณี classify ล้มการบันทึกเคสยังสำเร็จ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ต่อที่จุดเดียวแบบ fire-and-forget — ถอด trigger คืนได้ทันทีโดย flow สร้างเคสไม่เปลี่ยน

### Task BE-crm-ai-support-P1-15 — ค่า REJECTED ทุกคอลัมน์ review status

Objective: เพิ่มค่า `REJECTED` ในทุกคอลัมน์ review status (`ReviewStatus`/`MenuReviewStatus`/`SeverityReviewStatus` บน `TCrmCaseAiAssessment`) — คง VARCHAR เดิม ไม่ต้องแก้ schema แค่ app-layer รับค่านี้เพิ่ม
Why: ตัวเลือก ไม่ใช้ ของการรีวิวรายมิติต้องมีค่าสถานะของตัวเอง ไม่ปนกับ OVERRIDDEN (แก้ไข) — ค่า NULL จึงยังหมายถึง ยังไม่เคยตัดสิน เท่านั้น
Owner: backend-engineer
Depends on: none
Traceability: REQ-009, AC-009.2, AC-009.3, DES-003, DEC-003
Produces: Contract:CrmAiPerDimensionReview.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

app-layer enum เท่านั้น — ไม่แตะ schema (VARCHAR รับค่าใหม่ได้ทันที) · ค่าใหม่ต้องไหลผ่าน schema/service ของ review-queue ด้วย

#### Retrieval hints

Hypothesis: ชุดค่า review status ประกาศกระจายใน schema/service ของ review-queue — ยืนยันจุดประกาศทั้งหมดก่อนเพิ่ม
Query: หา `REJECTED`, `ReviewStatus`, `MenuReviewStatus`, `SeverityReviewStatus` ใน Target
Provenance: DES-003, DEC-003, Contract:CrmAiPerDimensionReview.v1

#### Do not modify

schema/ตาราง · ความหมายค่า NULL · ค่า enum เดิม (CONFIRMED/OVERRIDDEN/PENDING_REVIEW/NEEDS_HUMAN)

#### Acceptance criteria

AC-009.2: มิติรีวิวมีตัวเลือก ไม่ใช้ (REJECTED) ครบทั้ง 3 มิติ — ค่าถูกรับและเก็บได้จริง
AC-009.3: ค่า REJECTED แยกจาก OVERRIDDEN และจาก NULL — ความหมายไม่ปนกัน

#### Required validation and expected evidence

ตรวจ AC-009.2/AC-009.3 ด้วยการส่งค่า REJECTED ผ่าน review-queue และอ่านกลับจาก DB ทั้ง 3 คอลัมน์ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ค่า enum ใหม่ additive — ถอนการรับค่าได้ แถวที่เคยเก็บ REJECTED อ่านคืนได้จาก VARCHAR เดิม

### Task BE-crm-ai-support-P1-16 — menu catalog เข้า prompt จำแนก

Objective: แก้ `classify-with-gemini.ts` ให้ดึง catalog เมนู (`TMenu` active=true join `TGroupMenu` active=true ผ่าน `groupmenuid`, label `{groupmenu} > {MenuName}`) ส่งเข้า prompt เดียวกับ category/severity ขอ `menuId`/`menuConfidence`/`menuReasoning` คืนมาด้วย
Why: AI จำแนกเมนูได้แม่นเพราะเห็น catalog จริงในรอบเดียวกับ category/severity — ไม่ต้อง vector search และไม่เพิ่มรอบเรียก
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.2, DES-002, DEC-002
Produces: Contract:CrmAiMenuClassification.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

แก้ prompt/request ของ classify เดิมเท่านั้น — catalog มาจาก `TMenu`/`TGroupMenu` active=true เท่านั้น ผ่าน join `groupmenuid` ตามสคีมา

#### Retrieval hints

Hypothesis: join path `TMenu.groupmenuid → TGroupMenu` มีให้ใช้ใน schema จริง — ยืนยันชื่อ field กับ schema ก่อนแก้
Query: หา `classify-with-gemini.ts`, `groupmenuid`, `TGroupMenu`, `menuConfidence` ใน Target
Provenance: DES-002, DEC-002, Contract:CrmAiMenuClassification.v1

#### Do not modify

รอบเรียก Gemini เดิมของ category/severity (ส่งรวมใน prompt เดียว ไม่เพิ่มรอบ) · schema/ตาราง · เส้นทาง safety override ที่เหลือ (task ถัดไป)

#### Acceptance criteria

AC-006.2: catalog ที่ส่งให้ AI สร้างจาก `TMenu` active=true เท่านั้นใน prompt เดียวกับ category/severity — ผลกลับมามี menuId/menuConfidence/menuReasoning ครบ

#### Required validation and expected evidence

ตรวจ AC-006.2 ด้วยการอ่าน prompt ที่สร้างจริง (catalog ครบ/label ถูกรูปแบบ) + ผลจำแนกมี 3 ค่าเมนู — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ไฟล์ classify เดิม — revert ได้ ผลจำแนกเก่าคงอยู่ใน assessment

### Task BE-crm-ai-support-P1-17 — anti-hallucination ของ menuId

Objective: เพิ่ม validation กัน hallucination — `menuId` ที่ Gemini ตอบต้องอยู่ใน catalog ที่ส่งไปจริง ถ้าไม่ตรงปฏิบัติเหมือนไม่ได้คำตอบ (`MenuId=null`, log เหตุผลลง `TCrmAiDecisionLog`)
Why: AI ตอบ id ที่ไม่มีจริงได้ — ยอมรับเลยจะผูกเคสกับเมนูผิดเงียบ ๆ ต้อง fail-closed เป็น ยังไม่จำแนก
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.2, DES-002, DEC-002
Produces: none
Consumes: Contract:CrmAiMenuClassification.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่มเงื่อนไขตรวจหลังรับผล — เทียบกับ catalog ชุดเดียวกับที่ส่งไป · กรณีไม่ตรงเขียน log อธิบายเหตุผลว่า invalid ตามสัญญา

#### Retrieval hints

Hypothesis: จุดรับผล menuId อยู่ใน classify pipeline เดียวกับ task catalog — ยืนยันจุด validate กับซอร์สจริง
Query: หา `menuId`, `TCrmAiDecisionLog`, `MENU_CLASSIFICATION` ใน classification pipeline ของ Target
Provenance: DES-002, DEC-002, Contract:CrmAiMenuClassification.v1

#### Do not modify

catalog ที่ส่งให้ AI (สร้างที่ task ก่อนหน้า) · การอนุญาต id ที่ไม่อยู่ใน catalog ภายใต้เงื่อนไขใด

#### Acceptance criteria

AC-006.2: menuId ที่ไม่อยู่ใน catalog ถูกปฏิบัติเป็น ไม่ได้คำตอบ เสมอ — MenuId=null + มี log เหตุผล ไม่ผูกเมนูผิด

#### Required validation and expected evidence

ตรวจ AC-006.2 ด้วยกรณีทดสอบ: ตอบ id นอก catalog → MenuId null + log invalid — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เงื่อนไข validate เพิ่มจุดเดียว — revert ได้ แต่การปิด guard ทำให้ยอมรับ id ปลอม จึงห้าม revert โดยไม่มีทางเลือกแทน

### Task BE-crm-ai-support-P1-18 — เขียนผลจำแนกเมนูลง assessment/เคส

Objective: แก้ `classification.service.ts`: เขียน `MenuConfidence`/`MenuReasoning`/`MenuReviewStatus` ลง `TCrmCaseAiAssessment` และ `MenuId` ลง `TCrmSupport` — ใช้ threshold เดียวกับ category (`CRM_AI_CONFIDENCE_THRESHOLD`) ตัดสิน `NEEDS_HUMAN` ของมิตินี้แยกอิสระจากมิติอื่น
Why: ผลจำแนกเมนูต้องถูกเก็บและถูกตัดสินด้วยเกณฑ์ของมิติตัวเอง — ยืมสถานะข้ามมิติทำให้คิวตรวจเพี้ยนเงียบ
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, REQ-009, AC-009.1, DES-002, DEC-002, DES-003, DEC-003
Produces: none
Consumes: Contract:CrmAiMenuClassification.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เขียนผลทั้ง 3 ค่าบน assessment + MenuId บนเคส ณ จุด classify เดียว — ตัดสิน NEEDS_HUMAN ของมิติเมนูจาก menuConfidence เทียบ threshold เดียวกัน

#### Retrieval hints

Hypothesis: จุดเขียน assessment รวมอยู่ใน classification.service.ts เดิม — ยืนยัน field mapping กับ schema จริงก่อนแก้
Query: หา `classification.service.ts`, `MenuConfidence`, `MenuReviewStatus`, `CRM_AI_CONFIDENCE_THRESHOLD` ใน Target
Provenance: DES-002, DEC-002, DES-003, DEC-003, Contract:CrmAiMenuClassification.v1

#### Do not modify

สถานะมิติอื่น (ตัดสินแยกอิสระ) · schema · การเขียน `*ReviewedBy`/`*ReviewedAt` จากกลไกอัตโนมัติ

#### Acceptance criteria

AC-006.1: ทุกเคสที่ classify สำเร็จมีผลเมนูเก็บครบ (MenuId + confidence/reasoning/สถานะรีวิว)
AC-009.1: สถานะรีวิวมิติเมนูตัดสินจากความมั่นใจของมิตินี้เอง — ไม่ยืมจากประเภทเคส/ความรุนแรง

#### Required validation and expected evidence

ตรวจ AC-006.1/AC-009.1 ด้วยกรณี confidence สูง/ต่ำของมิติเมนูเทียบสถานะที่เขียน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เพิ่มการเขียน field ใหม่ใน service เดิม — revert ได้ ข้อมูลที่เขียนแล้วคงอยู่

### Task BE-crm-ai-support-P1-19 — safety override path เรียก menu classification

Objective: แก้เส้นทาง Safety Override ให้เรียก menu classification ด้วย (เดิมข้าม) — best-effort แยก try/catch จาก category/severity หลัก ห้าม error จากส่วนนี้บล็อกการบันทึก BUG+CRITICAL เด็ดขาด
Why: REQ-006 กำหนดจำแนกเมนูทุกเคสรวมเคสที่โดน safety override — แต่การบันทึกเคสฉุกเฉิน BUG+CRITICAL ต้องไม่เคยล้มเพราะส่วนเสริม
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, AC-006.3, DES-002, DEC-002
Produces: none
Consumes: Contract:CrmAiMenuClassification.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ต่อ menu classification เข้าเส้นทาง override แบบ best-effort แยก try/catch — ล้ม = log + ปล่อย MenuId NULL ให้ backfill กวาดทีหลัง

#### Retrieval hints

Hypothesis: เส้นทาง override แยก branch ใน classification.service.ts — ยืนยันจุดต่อและขอบเขต try/catch กับซอร์สจริง
Query: หา `SafetyOverride`, `classifyMenuBestEffort`, `EMPTY_MENU_OUTCOME` ใน Target
Provenance: DES-002, DEC-002, Contract:CrmAiMenuClassification.v1

#### Do not modify

ผล safety override หลัก (BUG + ความรุนแรง) — ห้าม error ของส่วนเมนูบล็อกเด็ดขาด · ลำดับเช็ค keyword ก่อน Gemini

#### Acceptance criteria

AC-006.1: เคสที่โดน safety override ก็ถูกพยายามจำแนกเมนูเช่นกัน — ไม่ข้าม
AC-006.3: จำแนกเมนูล้มในเส้นทางนี้ไม่บล็อกการบันทึก BUG+CRITICAL — MenuId ค้าง NULL รอกวาด

#### Required validation and expected evidence

ตรวจ AC-006.1/AC-006.3 ด้วยการจำลอง menu classification ล้มบนเส้นทาง override — การบันทึกหลักยังสำเร็จ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

try/catch แยกจุดเดียว — revert ได้ พฤติกรรมหลักของ override ไม่เคยเปลี่ยน

### Task BE-crm-ai-support-P1-20 — แถว log MENU_CLASSIFICATION

Objective: เขียน `TCrmAiDecisionLog` แถวใหม่แยก `DecisionType=MENU_CLASSIFICATION` ทุกครั้งที่มีผลจำแนกเมนู (ไม่ปนกับ `CLASSIFICATION`/`SEVERITY_CLASSIFICATION` เดิม)
Why: audit รายมิติต้องแยกชนิดการตัดสินใจ — ปนกันจะกรอง/ตรวจย้อนหลังไม่ได้ว่ามิติไหนถูกตัดสินด้วยอะไร
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.2, DES-002, DEC-002
Produces: none
Consumes: Contract:CrmAiMenuClassification.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่มแถว log ที่ทุกจุดที่มีผลเมนู (classify ปกติ / override / menu-only) — ผ่าน `createDecisionLog` เท่านั้น

#### Retrieval hints

Hypothesis: จุดเขียน log รวมอยู่ใน classify pipeline — ยืนยันชุด DecisionType ที่อนุญาตใน § Data Model ก่อนใช้
Query: หา `MENU_CLASSIFICATION`, `createDecisionLog` ใน Target
Provenance: DES-002, DEC-002, Contract:CrmAiMenuClassification.v1

#### Do not modify

ชนิด log เดิม (CLASSIFICATION/SEVERITY_CLASSIFICATION) · คอลัมน์ append-only · แถว log ของมิติอื่น

#### Acceptance criteria

AC-002.2: ทุกผลจำแนกเมนูมีแถว audit ชนิด MENU_CLASSIFICATION คู่กัน — กรองแยกจากชนิดอื่นได้จริง

#### Required validation and expected evidence

ตรวจ AC-002.2 ด้วยการจำแนกจริงแล้วกรอง log ตาม MENU_CLASSIFICATION — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เพิ่มแถว log additive — revert ได้ (แถวเดิม append-only ไม่ถูกแก้)

### Task BE-crm-ai-support-P1-21 — ReviewCaseSchema รับ 3 มิติแยก

Objective: แก้ `review-queue.schema.ts` (`ReviewCaseSchema`) จากตัดสินใจเดียวทั้งเคส เป็นรับ 3 ชุดแยกอิสระ (เมนู/ประเภท/ความรุนแรง) แต่ละชุด `decision: CONFIRMED | OVERRIDDEN | REJECTED` — มิติประเภทเคส: `REJECTED` ต้องมี `overridden_category` เสมอและ `review_reason` บังคับ; มิติเมนู/ความรุนแรง: `REJECTED` ตั้ง NULL ได้ `review_reason` optional
Why: รีวิวรายมิติต้องส่งการตัดสินแยกชุดได้ — กติกา mandatory ต่างกันต่อมิติต้องล็อกที่ Zod schema จึงไม่มีทางส่งข้อมูลไม่ครบ
Owner: backend-engineer
Depends on: none
Traceability: REQ-009, AC-009.2, AC-009.3, DES-003, DEC-003
Produces: none
Consumes: Contract:CrmAiPerDimensionReview.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แก้ schema ของ route เดียว — 3 ชุด decision อิสระ · ความต่าง mandatory ของ review_reason ล็อกที่ refine ของ Zod

#### Retrieval hints

Hypothesis: ReviewCaseSchema อยู่ใน `review-queue.schema.ts` เดิม — ยืนยันโครง body ปัจจุบันก่อนแก้
Query: หา `review-queue.schema.ts`, `ReviewCaseSchema`, `overridden_category`, `review_reason` ใน Target
Provenance: DES-003, DEC-003, Contract:CrmAiPerDimensionReview.v1

#### Do not modify

service/repository (task ถัดไป) · ค่า enum decision · การผ่อน mandatory ของมิติประเภทเคส

#### Acceptance criteria

AC-009.2: ส่งการตัดสิน 3 มิติแยกกันได้จริง (ใช้/ใช้แต่แก้ไข/ไม่ใช้ ต่อมิติ)
AC-009.3: ไม่ใช้ มิติประเภทเคสต้องมีค่าแทน+เหตุผลเสมอ ส่วนเมนู/ความรุนแรงปล่อย NULL ได้ — schema ปฏิเสธข้อมูลไม่ตรงกติกา

#### Required validation and expected evidence

ตรวจ AC-009.2/AC-009.3 ด้วยการ parse ตัวอย่างผ่าน/ไม่ผ่านต่อมิติด้วย Zod จริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ schema ไฟล์เดียว — revert ได้ (request รูปแบบใหม่จะไม่ผ่าน schema เดิม จึงต้อง revert พร้อม service)

### Task BE-crm-ai-support-P1-22 — apply การตัดสินใจรายมิติ

Objective: แก้ `review-queue.service.ts`/`review-queue.repository.ts` ให้ apply การตัดสินแต่ละมิติอิสระต่อกัน อัปเดต `TCrmSupport`/`TCrmCaseAiAssessment` เฉพาะมิติที่เปลี่ยน เขียน `TCrmAiDecisionLog` แยกต่อมิติที่ถูกรีวิว (ไม่รวมเป็นก้อนเดียวเหมือนเดิม)
Why: คนตัดสินเฉพาะมิติที่เห็นปัญหา — ถ้า apply รวมก้อนเดียวจะทับมิติอื่นที่คนยังไม่ได้ตัดสิน
Owner: backend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, AC-009.2, DES-003, DEC-003
Produces: none
Consumes: Contract:CrmAiPerDimensionReview.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

apply เฉพาะมิติที่ส่งมา — มิติที่ไม่ส่งคงค่าเดิมทุกคอลัมน์ · log แยกแถวต่อมิติที่ถูกตัดสิน

#### Retrieval hints

Hypothesis: จุดอัปเดตรวมอยู่ใน review-queue service/repository เดิม — ยืนยันเงื่อนไข update ต่อมิติกับซอร์สจริง
Query: หา `review-queue.service.ts`, `review-queue.repository.ts`, `REVIEW_PERMISSION_BY_TYPE` ใน Target
Provenance: DES-003, DEC-003, Contract:CrmAiPerDimensionReview.v1

#### Do not modify

มิติที่ไม่ได้ส่งใน request (ห้ามเขียนทับ) · `*ReviewedBy`/`*ReviewedAt` ของกลไกอัตโนมัติ · แถว log เดิม

#### Acceptance criteria

AC-009.1: การตัดสินแต่ละมิติ apply อิสระ — มิติอื่นไม่ถูกแตะ
AC-009.2: ทุกมิติที่ถูกตัดสินมี log แยกของตัวเอง — audit ต่อมิติได้จริง

#### Required validation and expected evidence

ตรวจ AC-009.1/AC-009.2 ด้วยการส่งการตัดสินบางมิติแล้วเทียบ DB ว่ามิติอื่นคงเดิม + log แยก — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ service/repository เดิม — revert ได้ (ข้อมูลที่ apply แล้วเป็นการตัดสินของคน ไม่ย้อนอัตโนมัติ)

### Task BE-crm-ai-support-P1-23 — POST /backfill ทีละชุด

Objective: เพิ่ม `POST /api/v2/support/crm-ai/backfill` — endpoint กดเองประมวลผลทีละชุด 100–150 เคส: query เคส `AiCategory IS NULL` (หลัก ~70k) รวมเคส `AiCategory IS NOT NULL AND MenuId IS NULL` (กวาดเมนูที่ล้ม) เรียก pipeline classify เดิมทีละเคส แยกกติกา NEEDS_HUMAN ตามสถานะปิด/ไม่ปิด (ใช้ `STATUS_ALIASES` ที่ export แล้วจาก `crm.repository.ts`)
Why: เคสเก่า ~70k ต้องได้ผลจำแนกโดยไม่รบกวนระบบปกติ — ปุ่มกดเองทีละชุดคุมต้นทุน Gemini และหยุดกลางทางได้เสมอ
Owner: backend-engineer
Depends on: none
Traceability: REQ-007, AC-007.1, DES-004, DEC-004
Produces: Contract:CrmAiLegacyBackfill.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

endpoint กดเอง (ไม่ใช่ background job) — batch 100–150 · กันกดซ้ำซ้อน · เขียนผ่าน pipeline classify เดิมเท่านั้น ไม่เขียนตรง

#### Retrieval hints

Hypothesis: `STATUS_ALIASES` มีอยู่แล้วใน `src/app/api/v1/support/crm/crm.repository.ts` — import ใช้ ไม่ copy string
Query: หา `backfill/route.ts`, `backfill.service.ts`, `STATUS_ALIASES`, `BACKFILL_BATCH_SIZE` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmAiLegacyBackfill.v1

#### Do not modify

ผลจำแนกของเคสที่คนตรวจแก้ไว้แล้ว (มิติที่ `{Dim}ReviewedAt IS NOT NULL`) · `STATUS_ALIASES` ต้นทาง (import เท่านั้น) · schema

#### Acceptance criteria

AC-007.1: กด backfill ทีละชุด 100–150 เคสได้จริง (กดซ้ำจนครบ) — ไม่ใช่ job อัตโนมัติและกวาดเคสที่เมนูล้มได้ด้วย

#### Required validation and expected evidence

ตรวจ AC-007.1 ด้วยการกด batch จริงบนชุดทดสอบ (เคสจำแนกแล้ว/ยังไม่จำแนก/เมนูล้ม) + กดซ้อนต้องถูกกัน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert ได้ ผลที่เขียนแล้วเป็นข้อมูลจำแนกปกติบนเคส

### Task BE-crm-ai-support-P1-24 — GET /backfill remaining

Objective: เพิ่ม `GET /api/v2/support/crm-ai/backfill` (endpoint เดียวกันหรือแยก GET) คืนจำนวนเคสที่เหลือต้อง backfill ให้ frontend แสดง progress
Why: ผู้กดต้องเห็นความคืบหน้าจริงจึงจะรู้ว่าเมื่อไรจบ — ตัวเลขต้องมาจากเงื่อนไขเดียวกับที่ endpoint เลือกเคส
Owner: backend-engineer
Depends on: none
Traceability: REQ-007, AC-007.1, DES-004, DEC-004
Produces: none
Consumes: Contract:CrmAiLegacyBackfill.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — นับด้วยเงื่อนไขเลือกเคสชุดเดียวกัน (ต่อมาแยก Mode A+B ตาม CR 2026-08-17/18) ไม่มี write

#### Retrieval hints

Hypothesis: count query อยู่คู่กับ service ของ backfill — ยืนยัน where clause ตรงกับตัวเลือกเคสจริงก่อนใช้
Query: หา `backfill/route.ts`, `countRemaining`, `remaining` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmAiLegacyBackfill.v1

#### Do not modify

ข้อมูลเคส (อ่านอย่างเดียว) · เงื่อนไขเลือกเคสของ POST (ต้อง sync กันเสมอ)

#### Acceptance criteria

AC-007.1: จำนวนที่เหลือแสดงผลได้จริงและลดลงตามที่กด — ตัวเลขตรงกับเงื่อนไขเลือกเคส

#### Required validation and expected evidence

ตรวจ AC-007.1 ด้วยการกด batch แล้วเทียบ remaining ก่อน/หลัง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint read additive — revert รายไฟล์ได้

### Task FE-crm-ai-support-P1-13 — drawer รีวิว 3 มิติแยก

Objective: แก้ `case-review-detail-drawer.component.tsx` จากตัดสินใจเดียวทั้งเคส เป็นแสดง 3 มิติแยกกัน (เมนู/ประเภท/ความรุนแรง) แต่ละมิติมีปุ่ม 3 ทาง (ใช้/ใช้แต่แก้ไข/ไม่ใช้) ตาม Form Workflow มาตรฐาน — มิติประเภทเคสบังคับกรอกเหตุผลเมื่อเลือก ไม่ใช้
Why: คนตรวจตัดสินเฉพาะมิติที่ผิด — UI ต้องส่งการตัดสินแยกมิติและบังคับเหตุผลตรงกติกาของ schema
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, AC-009.2, DES-003, DEC-003
Produces: none
Consumes: Contract:CrmAiPerDimensionReview.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

แก้ drawer เดิมเป็น 3 กลุ่มตัดสินอิสระ — บังคับเหตุผลของมิติประเภทเคสเมื่อ ไม่ใช้ ให้ตรง Zod schema

#### Retrieval hints

Hypothesis: drawer มีโครงตัดสินเดิมอยู่แล้ว — แปลงเป็น 3 ชุด ยืนยัน component กลาง Form Workflow ก่อนแก้
Query: หา `case-review-detail-drawer.component.tsx`, `REJECTED`, `review_reason` ใน Target
Provenance: DES-003, DEC-003, Contract:CrmAiPerDimensionReview.v1

#### Do not modify

endpoint/schema ฝั่ง BE (task BE-crm-ai-support-P1-21/22) · component ตาราง/filter

#### Acceptance criteria

AC-009.1: drawer แสดงผลจำแนก 3 มิติแยกกัน — คนตรวจเลือกทีละมิติอิสระได้จริง
AC-009.2: ปุ่ม 3 ทางครบทุกมิติ — การตัดสินส่งแยกชุดตาม schema

#### Required validation and expected evidence

ตรวจ AC-009.1/AC-009.2 ด้วยการตัดสินจริงทั้ง 3 มิติ (สำเร็จ + error path เมื่อไม่กรอกเหตุผล) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ component เดียว — revert ได้เป็นรูปแบบตัดสินรวมเดิม (ต้อง revert คู่กับ BE schema)

### Task FE-crm-ai-support-P1-14 — คอลัมน์เมนูในตารางรีวิว

Objective: เพิ่มคอลัมน์เมนูใน `case-review-table.component.tsx`
Why: คนตรวจต้องเห็นผลเมนูที่ AI เสนอในรายการโดยไม่ต้องเปิด drawer ทุกแถว
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-002, DEC-002
Produces: none
Consumes: Contract:CrmAiMenuClassification.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 คอลัมน์ — อ่านค่าเมนูจาก payload ของคิว ไม่เรียก API เพิ่ม

#### Retrieval hints

Hypothesis: payload คิวมี field เมนูอยู่แล้วหลัง BE เขียนผล — ยืนยัน field จริงก่อนแก้
Query: หา `case-review-table.component.tsx`, `MenuId` ใน Target
Provenance: DES-002, DEC-002, Contract:CrmAiMenuClassification.v1

#### Do not modify

drawer (task อื่น) · payload ฝั่ง BE

#### Acceptance criteria

AC-009.1: คอลัมน์เมนูแสดงผลจำแนกเมนูของแต่ละเคสในรายการคิว — ตรงข้อมูลจริง

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วยการเทียบคอลัมน์กับข้อมูลเคสจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เพิ่มคอลัมน์ — ลบรายคอลัมน์คืนได้

### Task FE-crm-ai-support-P1-15 — backfill panel + progress

Objective: เพิ่มปุ่ม Backfill + progress indicator ในหน้า review-queue (`backfill-panel.component.tsx` — ซ่อนอัตโนมัติเมื่อ remaining=0) เรียก `POST /backfill` ทีละชุด แสดงจำนวนที่เหลือ กดซ้ำได้จนครบ
Why: ผู้ดูแลต้องกดกวาดเคสเก่าเองแบบคุมจังหวะ — progress ที่ซ่อนเมื่อจบป้องกันการกดซ้ำโดยไม่จำเป็น
Owner: frontend-engineer
Depends on: none
Traceability: REQ-007, AC-007.1, DES-004, DEC-004
Produces: none
Consumes: Contract:CrmAiLegacyBackfill.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component panel เดียวบนหน้า review-queue — กด = เรียก batch แล้วรีเฟรช remaining · ยังไม่จบกดซ้ำได้

#### Retrieval hints

Hypothesis: remaining มาจาก GET /backfill — ยืนยัน response จริงก่อนผูก
Query: หา `backfill-panel.component.tsx`, `remaining` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmAiLegacyBackfill.v1

#### Do not modify

endpoint ฝั่ง BE · ส่วนอื่นของหน้าคิว

#### Acceptance criteria

AC-007.1: กดกวาดทีละชุดจากหน้าจอได้จริง เห็นจำนวนที่เหลือลดลง และ panel ซ่อนเมื่อ remaining=0

#### Required validation and expected evidence

ตรวจ AC-007.1 ด้วยการกดจริงจน remaining=0 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task BE-crm-ai-support-P1-25 — menu-only path (Mode B)

Objective: แยก menu-only classification path ออกจาก `classificationService.classify()` เต็มรูปแบบ — เขียนเฉพาะ `MenuId` (บน `TCrmSupport`) + `MenuConfidence`/`MenuReasoning`/`MenuReviewStatus` (บน assessment) + แถว log `MENU_CLASSIFICATION` เท่านั้น ห้ามแตะ `AiCategory`/`Severity`/`AiConfidence`/`AiReasoning`/`ReviewStatus`/`SeverityReviewStatus`/`SafetyOverride`/`ComputedPriorityScore`/คอลัมน์ `*ReviewedBy`/`*ReviewedAt` ใด ๆ (Mode B) ใช้ `classifyMenuOnlyWithGemini()` ที่มีอยู่แล้ว
Why: กวาดเมนูซ้ำต้องไม่เขียนทับผลจำแนกหลักที่คนตรวจแก้ไว้แล้ว — path แยกเด็ดขาดจึงเป็นเกราะของ Mode B
Owner: backend-engineer
Depends on: none
Traceability: REQ-007, AC-007.1, REQ-006, AC-006.3, DES-004, DEC-004, DES-002, DEC-002
Produces: none
Consumes: Contract:CrmAiLegacyBackfill.v1, Contract:CrmAiMenuClassification.v1
Risk: high
Human gate: none
Status: verified

#### Scope and constraints

path ใหม่แยกจาก classify เต็ม — ขอบเขตเขียนล็อกเฉพาะ field เมนูทุกจุด · error จัดการแบบ best-effort แยก (DEC-002) ไม่ retry ในจุดเดียวกัน

#### Retrieval hints

Hypothesis: `classifyMenuOnlyWithGemini()` มีอยู่แล้ว — ยืนยันขอบเขต field ที่ path นี้เขียนกับซอร์สจริง
Query: หา `classifyMenuOnlyWithGemini`, `MENU_ONLY`, `findModeBCandidates` ใน Target
Provenance: DES-004, DEC-004, DES-002, DEC-002, Contract:CrmAiLegacyBackfill.v1, Contract:CrmAiMenuClassification.v1

#### Do not modify

`AiCategory`/`Severity`/`ReviewStatus`/`SeverityReviewStatus`/`SafetyOverride`/`ComputedPriorityScore`/`*ReviewedBy`/`*ReviewedAt` — ห้ามเขียนเด็ดขาด · schema

#### Acceptance criteria

AC-007.1: กวาดเมนูที่ล้มได้ผ่าน path menu-only จริง — กลไกเดียวกับ backfill
AC-006.3: การกวาดซ้ำไม่แตะผลจำแนกหลัก/สถานะที่คนตัดสินไว้ — MenuId เท่านั้นที่เปลี่ยน

#### Required validation and expected evidence

ตรวจ AC-007.1/AC-006.3 ด้วยการรัน Mode B บนชุดทดสอบแล้ว diff ทุกคอลัมน์ — ต้องเปลี่ยนเฉพาะ field เมนู — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

path แยก additive — revert ได้ (ผลที่เขียนเป็นค่าเมนูปกติ)

### Task BE-crm-ai-support-P1-26 — ค่า MenuReviewStatus NO_MENU

Objective: เพิ่มค่า `MenuReviewStatus = 'NO_MENU'` เมื่อจำแนกเมนูสำเร็จแต่ได้ null (ทั้งกรณี AI ตอบ `menuId: null` และถูกปฏิเสธจาก anti-hallucination check) — ใช้ทุกเส้นทาง: classify ปกติ, Safety Override, menu-only path · เขียน `MenuReasoning` ถ้า AI ให้มา (`MenuConfidence` ปล่อย NULL ได้) และยังเขียนแถว log `MENU_CLASSIFICATION` ตามเดิม — NULL เหลือความหมายเดียวคือ ยังไม่เคยได้คำตอบ
Why: แยก AI ตอบว่า ไม่เกี่ยวกับเมนู ออกจาก เรียกไม่สำเร็จ — ถ้าปนกัน remaining ของ backfill จะไม่ถึง 0 และความหมาย NULL เพี้ยน
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.3, DES-002, DEC-002
Produces: none
Consumes: Contract:CrmAiMenuClassification.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่มค่า app-layer ทุกเส้นทางเขียนผลเมนู — NULL สงวนเฉพาะกรณีไม่เคยได้คำตอบ/ล้ม (ยังอยู่คิว Mode B)

#### Retrieval hints

Hypothesis: จุดตัดสินผล null อยู่ใน classify/menu-only path — ยืนยันทั้ง 3 เส้นทางกับซอร์สจริง
Query: หา `NO_MENU`, `MenuReviewStatus`, `EMPTY_MENU_OUTCOME` ใน Target
Provenance: DES-002, DEC-002, Contract:CrmAiMenuClassification.v1

#### Do not modify

ความหมาย NULL (ยังไม่เคยได้คำตอบ) · schema · แถว log เดิม

#### Acceptance criteria

AC-006.3: กรณีจำแนกสำเร็จแต่ไม่มีเมนู สถานะเป็น NO_MENU ไม่ใช่ NULL — การกวาดซ้ำเลือกเฉพาะ NULL จึงไม่กวาดซ้ำไม่รู้จบ

#### Required validation and expected evidence

ตรวจ AC-006.3 ด้วยกรณีทดสอบ: AI ตอบ null / ถูกปฏิเสธ id / Gemini ล้ม — เทียบสถานะที่เขียนแยกกันจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ค่า enum ใหม่ additive — revert ได้ แต่ต้องคงการแยก NULL ไม่งั้น remaining ไม่ถึง 0

### Task BE-crm-ai-support-P1-27 — backfill query แยก Mode A/B

Objective: แก้ query เลือกเคสของ backfill (`backfillWhereClause()`/`countRemaining()` หรือชื่อเทียบเท่า) แยก 2 โหมดเด็ดขาด: **Mode A** = `AiCategory IS NULL` (full classify) · **Mode B** = `AiCategory IS NOT NULL AND MenuId IS NULL AND MenuReviewStatus IS NULL AND MenuReviewedAt IS NULL` (menu-only เท่านั้น) — `runBatch()` เลือก pipeline ตรงโหมดต่อเคส ห้ามใช้ `notIn` ยัด id หมื่นตัว (เริ่มจาก assessment แล้วกรอง `CrmSupportId IN (...)` ของชุด หรือ `$queryRaw` LEFT JOIN) — `remaining`/GET นับด้วยเงื่อนไข Mode A+B รวมกัน
Why: query เดิม merge 2 เงื่อนไขทำให้กวาดเมนูซ้ำเรียก classify เต็มรูปแบบเขียนทับสิ่งที่คนตรวจแก้ไว้ — แยกโหมดจึงปิดช่องเขียนทับเงียบ ๆ
Owner: backend-engineer
Depends on: none
Traceability: REQ-007, AC-007.1, DES-004, DEC-004
Produces: none
Consumes: Contract:CrmAiLegacyBackfill.v1, Contract:CrmAiMenuClassification.v1
Risk: high
Human gate: none
Status: verified

#### Scope and constraints

แก้ query/เลือก pipeline ใน backfill service/repository เดิม — โหมดตัดสินจากสถานะของเคสเอง ไม่รับจาก client · นับ remaining ตรง Mode A+B

#### Retrieval hints

Hypothesis: ชื่อ helper (`backfillWhereClause`/`countRemaining`) อ้างจากแถวเดิม — ยืนยันชื่อจริงใน `backfill.service.ts` ก่อนแก้
Query: หา `backfillWhereClause`, `countRemaining`, `runBatch`, `findModeBCandidates` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmAiLegacyBackfill.v1, Contract:CrmAiMenuClassification.v1

#### Do not modify

เงื่อนไข Mode B ตามสัญญา (ทั้ง 4 เงื่อนไขพร้อมกัน) · pipeline ที่เลือกต่อโหมด · schema

#### Acceptance criteria

AC-007.1: เคสแต่ละใบเข้า pipeline ตามโหมดของตัวเอง (A หรือ B) — กวาดซ้ำไม่เขียนทับมิติอื่นและ remaining ตรงเงื่อนไขรวม

#### Required validation and expected evidence

ตรวจ AC-007.1 ด้วยชุดทดสอบ 4 กลุ่ม (ยังไม่จำแนก / จำแนกแล้ว+เมนูครบ / เมนูล้ม / คนรีวิวแล้ว) — เทียบ pipeline ที่ถูกเรียกต่อเคส + remaining — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ query ใน backfill เท่านั้น — revert ได้ แต่เป็น hard prerequisite ก่อนกด backfill กับข้อมูลจริง (ดู Sequencing Notes)

### Task BE-crm-ai-support-P1-28 — SeverityReviewStatus จาก confidence ตัวเอง

Objective: แก้ `classification.service.ts` ให้ `SeverityReviewStatus` ที่ classify-time คำนวณจาก `severityConfidence` ของตัวเองเทียบ `CRM_AI_CONFIDENCE_THRESHOLD` (0.6) เท่านั้น — เลิกยืมจาก `reviewStatus` ของมิติประเภทเคส (`severity` มีค่า + confidence ≥ 0.6 หรือ NULL → `PENDING_REVIEW`, < 0.6 → `NEEDS_HUMAN`, `severity` NULL → `SeverityReviewStatus = NULL`) — เส้นทาง Safety Override ตั้ง `SeverityReviewStatus = NEEDS_HUMAN` เสมอ (CRITICAL มาจากกฎ keyword ไม่ใช่การประเมิน AI จริง)
Why: คิวตรวจต้องจับเคสที่ความรุนแรงไม่มั่นใจได้เอง — ยืมสถานะข้ามมิติทำให้เคสเสี่ยงหลุดคิวเงียบ ๆ
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.2, REQ-009, AC-009.2, DES-003, DEC-003
Produces: none
Consumes: Contract:CrmAiPerDimensionReview.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แก้การตัดสินมิติความรุนแรงที่ classify เท่านั้น — กติกา 3 กรณี + override เป็น NEEDS_HUMAN เสมอ ตาม design § Per-Dimension Review (ส่วน 2026-08-17)

#### Retrieval hints

Hypothesis: ฟังก์ชันตัดสินรวมอยู่ใน classification.service.ts (`computeSeverityReviewStatus`) — ยืนยันกติกาปัจจุบันก่อนแก้
Query: หา `SeverityReviewStatus`, `computeSeverityReviewStatus`, `severityConfidence` ใน Target
Provenance: DES-003, DEC-003, Contract:CrmAiPerDimensionReview.v1

#### Do not modify

สถานะมิติอื่น (ตัดสินแยกอยู่แล้ว) · threshold 0.6 (แก้ผ่าน constant + version) · schema

#### Acceptance criteria

AC-004.2: ความรุนแรงที่ AI ไม่มั่นใจถูกส่งคนตรวจเสมอ — ไม่หลุดคิวจากการยืมสถานะข้ามมิติ
AC-009.2: สถานะมิติความรุนแรงตัดสินจากของตัวเอง — ตรงกติกา 3 กรณี + override

#### Required validation and expected evidence

ตรวจ AC-004.2/AC-009.2 ด้วยชุดทดสอบครบ 3 กรณี + เส้นทาง override — เทียบสถานะที่เขียน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ฟังก์ชันตัดสินจุดเดียว — revert ได้ แต่การ revert ทำให้กลับไปยืมสถานะข้ามมิติ (ช่องโหว่เดิม) จึงต้องมีทางเลือกแทนก่อน

### Task FE-crm-ai-support-P1-16 — แสดง NO_MENU แยกจากยังไม่จำแนก

Objective: แก้ `case-review-detail-drawer.component.tsx` และคอลัมน์ เมนู ใน `case-review-table.component.tsx` ให้แสดงค่า `NO_MENU` แยกจากกรณียังไม่จำแนก — ข้อความแนว AI ระบุว่าไม่เกี่ยวกับเมนูใด ไม่ใช่ปล่อยว่างเหมือน NULL — คนตรวจยังกดตัดสิน 3 ทางทับค่านี้ได้ตามเดิม
Why: ถ้า NO_MENU โผล่เป็นช่องว่างเหมือน NULL คนตรวจจะไม่รู้ว่า AI ตัดสินแล้ว — ความหมายสองค่าต้องต่างกันบนหน้าจอ
Owner: frontend-engineer
Depends on: none
Traceability: REQ-009, AC-009.1, DES-002, DEC-002, DES-003, DEC-003
Produces: none
Consumes: Contract:CrmAiPerDimensionReview.v1, Contract:CrmAiMenuClassification.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

แก้การแสดงผล 2 จุด — คงปุ่มตัดสิน 3 ทางเดิมไว้บนค่า NO_MENU

#### Retrieval hints

Hypothesis: ค่า NO_MENU มาจาก payload คิวหลัง BE เพิ่ม — ยืนยัน field จริงก่อนแก้
Query: หา `NO_MENU`, `case-review-detail-drawer.component.tsx`, `case-review-table.component.tsx` ใน Target
Provenance: DES-002, DEC-002, DES-003, DEC-003, Contract:CrmAiPerDimensionReview.v1, Contract:CrmAiMenuClassification.v1

#### Do not modify

ความหมาย NULL (ยังไม่จำแนก) · ปุ่มตัดสิน 3 ทางเดิม · endpoint

#### Acceptance criteria

AC-009.1: หน้าจอแยก NO_MENU ออกจากยังไม่จำแนกชัดเจน — คนตรวจตัดสินทับได้เหมือนเดิม

#### Required validation and expected evidence

ตรวจ AC-009.1 ด้วยเคส 3 สถานะ (NO_MENU / NULL / มีเมนู) เทียบการแสดงผลจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้การแสดงผล — revert ราย component ได้

### Task BE-crm-ai-support-P1-29 — BACKFILL_CLOSED_ALIASES constant

Objective: แก้ `backfill.repository.ts`: เพิ่ม `BACKFILL_CLOSED_ALIASES = [...STATUS_ALIASES.CLOSED, ...STATUS_ALIASES.RESOLVED]` (= CLOSED/Closed/RESOLVED/Resolved) วางในไฟล์ backfill เอง ห้ามแก้/re-export ทับ `CLOSED_ALIASES` เดิมใน `crm.repository.ts` (CRM v1 `tab=upcoming`/`overdue` ใช้ค่าเดิมคนละความหมาย) — เทียบ case-sensitive 4 ค่านี้เท่านั้น ไม่ normalize case · ใช้กับ Mode A เท่านั้น
Why: นิยาม ปิดแล้ว ของ backfill ต่างจากของ CRM v1 — ใช้ alias ร่วมกันจะพาเคสที่ควรรีวิวหลุดคิวหรือกลับกัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-007, AC-007.2, DES-004, DEC-004
Produces: none
Consumes: Contract:CrmAiLegacyBackfill.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

constant ใหม่ในไฟล์ backfill เอง (spread จาก `STATUS_ALIASES` ตาม DEC-004) — case-sensitive เทียบ 4 ค่า ใช้เฉพาะ Mode A

#### Retrieval hints

Hypothesis: `STATUS_ALIASES` export ค่า CLOSED/RESOLVED อยู่แล้ว — ยืนยันค่าที่ export จริงก่อน spread
Query: หา `BACKFILL_CLOSED_ALIASES`, `STATUS_ALIASES`, `CLOSED_ALIASES` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmAiLegacyBackfill.v1

#### Do not modify

`CLOSED_ALIASES` เดิมใน `crm.repository.ts` (ห้ามแก้/re-export) · การ normalize case · schema

#### Acceptance criteria

AC-007.2: เคสเก่าสถานะ CLOSED/RESOLVED (รวมสะกดต่างตัวพิมพ์ 4 รูปแบบที่กำหนด) เชื่อผล AI ตามที่คำนวณได้ — นอกนั้นไม่นับเป็นปิด

#### Required validation and expected evidence

ตรวจ AC-007.2 ด้วยเคสสถานะครบ 4 ค่า + ค่าอื่น/NULL — เทียบสถานะที่ backfill ตัดสิน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

constant ใหม่ในไฟล์เดียว — revert ได้ ไม่กระทบ CRM v1

### Task BE-crm-ai-support-P1-30 — overrideReviewStatuses เฉพาะมิติรอตรวจ

Objective: แก้ `overrideReviewStatuses()` ใน `backfill.repository.ts` (Mode A) ให้ครอบทั้ง 3 มิติ แต่เขียนทับเฉพาะมิติที่สถานะปัจจุบันเป็น `PENDING_REVIEW` หรือ `NEEDS_HUMAN` เท่านั้น (โดยไม่ดูว่ามิตินั้นมีค่าหรือไม่) — ห้ามแตะสถานะ `NULL`/`NO_MENU` และห้ามแตะมิติที่ `{Dim}ReviewedAt IS NOT NULL` (คงเกราะเดิม) · `Status` NULL หรือนอก 4 ค่าของ `BACKFILL_CLOSED_ALIASES` → นับเป็น ยังไม่ปิด เสมอ
Why: ปิดช่องเคสปิดแล้วที่ Severity=NULL ค้าง NEEDS_HUMAN ตลอดไป โดยไม่ทำลายเกราะห้ามทับสิ่งที่คนตัดสินแล้ว — hard prerequisite ก่อนกด backfill กับข้อมูลจริง
Owner: backend-engineer
Depends on: none
Traceability: REQ-007, AC-007.2, AC-007.3, DES-004, DEC-004
Produces: none
Consumes: Contract:CrmAiLegacyBackfill.v1
Risk: high
Human gate: none
Status: verified

#### Scope and constraints

แก้ฟังก์ชัน override จุดเดียว — เงื่อนไขเขียนทับล็อกตามสถานะปัจจุบันต่อมิติ · กรณีอื่นคงเดิมทุกคอลัมน์

#### Retrieval hints

Hypothesis: ฟังก์ชันอยู่ใน `backfill.repository.ts` — ยืนยันเงื่อนไขปัจจุบันก่อนแก้
Query: หา `overrideReviewStatuses`, `BACKFILL_CLOSED_ALIASES`, `MenuReviewedAt` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmAiLegacyBackfill.v1

#### Do not modify

สถานะ NULL/NO_MENU (ความหมายตาม DES-002) · มิติที่คนรีวิวแล้ว (`*ReviewedAt IS NOT NULL`) · ค่านอก alias 4 ตัว (นับยังไม่ปิดเสมอ)

#### Acceptance criteria

AC-007.2: เคสปิดแล้วตาม alias ได้รับการตัดสินอัตโนมัติเฉพาะมิติที่ยังรอตรวจ — สิ่งที่คนตัดสินแล้วไม่ถูกทับ
AC-007.3: เคสสถานะว่าง/นอก 4 ค่าถูกบังคับ NEEDS_HUMAN ตามกติกา — ไม่เคยถูกเชื่อผลอัตโนมัติ

#### Required validation and expected evidence

ตรวจ AC-007.2/AC-007.3 ด้วยชุดทดสอบ: มิติ PENDING_REVIEW/NEEDS_HUMAN/NULL/NO_MENU/ReviewedAt มีค่า × สถานะเคสปิด/ไม่ปิด — เทียบผลทับ/ไม่ทับรายมิติ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ฟังก์ชันเดียว — revert ได้ แต่เป็น hard prerequisite ก่อนกด backfill กับข้อมูลจริง ~70k ครั้งแรก (ดู Sequencing Notes)

### Task BE-crm-ai-support-P1-31 — priority score v2 constant

Objective: แก้ `crm-sla-rule.constant.ts`: เพิ่ม `CRM_SCHOOL_REPEAT_MULTIPLIER` (1 โรงเรียน ×1.0 · 2–4 ×1.3 · 5–9 ×1.6 · ≥10 ×2.0) + `computeCrmPriorityScoreV2(severity, distinctSchoolCount)` + bump `CRM_SLA_RULE_VERSION = "v2"` — ห้ามลบ/เขียนทับ `computeCrmPriorityScore`/`CRM_CONTRACT_TIER_MULTIPLIER` เดิม เก็บไว้พร้อม comment ว่าเลิกใช้แล้วไม่มี call site (dead path ถาวร)
Why: สูตร v2 แทนตัวคูณสัญญา (dead path) ด้วยจำนวนโรงเรียนที่แจ้งเรื่องเดียวกัน — คงของเก่าไว้ตามธรรมเนียม CLAUDE.md เพื่ออ่านคะแนน v1 ย้อนหลังได้
Owner: backend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, AC-003.3, DES-005, DEC-005
Produces: Contract:CrmAiPriorityScore.v2
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

เพิ่มค่า/ฟังก์ชันใหม่ในไฟล์เดิม + bump version — ไฟล์ constant ต้องไม่รู้จัก Prisma (การนับเป็นงาน repository ตาม DEC-005)

#### Retrieval hints

Hypothesis: ไฟล์ constant เดิมมี v1 อยู่แล้ว — เพิ่มเทียบเคียง ไม่แตะ v1
Query: หา `CRM_SCHOOL_REPEAT_MULTIPLIER`, `computeCrmPriorityScoreV2`, `CRM_SLA_RULE_VERSION` ใน Target
Provenance: DES-005, DEC-005, Contract:CrmAiPriorityScore.v2

#### Do not modify

`computeCrmPriorityScore`/`CRM_CONTRACT_TIER_MULTIPLIER` เดิม (คงไว้ ไม่มี call site) · schema · การนับโรงเรียนในไฟล์ constant

#### Acceptance criteria

AC-003.1: คะแนน v2 = น้ำหนักความรุนแรง × ตัวคูณจำนวนโรงเรียน (1→×1.0, 2–4→×1.3, 5–9→×1.6, ≥10→×2.0) — ไม่มีตัวคูณสัญญาในสูตรแล้ว
AC-003.3: version bump เป็น v2 — คะแนนเก่า v1 อ่านย้อนได้โดยไม่คำนวณใหม่

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วยตารางกรณีตัวคูณครบ 4 ช่วง + Math.round · ตรวจ AC-003.3 ด้วยการเทียบแถว v1/v2 ใน DB — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เพิ่มคู่ขนานในไฟล์เดิม — revert ได้ (v1 ไม่เคยถูกลบจึงไม่มีอะไรหาย)

### Task BE-crm-ai-support-P1-32 — query นับ distinctSchoolCount

Objective: เพิ่ม query นับ `distinctSchoolCount` ที่ repository layer: มี `IssueId` → นับ `SchoolId` ไม่ซ้ำไม่ NULL ของทุกเคสในเรื่องเดียวกัน (ไม่มีหน้าต่างเวลา) · ยังไม่มี `IssueId` → นับเคส `MenuId`+`AiCategory` เดียวกันใน 30 วันย้อนหลัง (นับตัวเองด้วย) · `MenuId IS NULL` และไม่มี `IssueId` → ตัวคูณ 1.0 · นับได้ 0 → ตัวคูณ 1.0 (ไม่ใช่ 0) · นับเฉพาะ `DeleteDate IS NULL`
Why: ความแม่นของสูตร v2 ขึ้นกับนิยาม เรื่องเดียวกัน — นับผิดที่ใดสูตรเพี้ยนเงียบทั้งโมดูล
Owner: backend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, DES-005, DEC-005
Produces: none
Consumes: Contract:CrmAiPriorityScore.v2
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

query ที่ repository layer เท่านั้น (ไม่ใช่ไฟล์ constant) — เงื่อนไขนับตามสัญญา v2 ทุกข้อ รวมกรณีขอบ 0 โรงเรียน/NULL MenuId

#### Retrieval hints

Hypothesis: repository ของโมดูลมีจุดรวม query — ยืนยัน field `SchoolId`/`IssueId` กับ schema จริงก่อนเขียน
Query: หา `resolveDistinctSchoolCount`, `distinctSchoolCount`, `SchoolId` ใน Target
Provenance: DES-005, DEC-005, Contract:CrmAiPriorityScore.v2

#### Do not modify

สูตรตัวคูณใน constant (task BE-crm-ai-support-P1-31) · schema · การนับเคสที่ `DeleteDate IS NOT NULL`

#### Acceptance criteria

AC-003.1: ตัวคูณใช้จำนวนโรงเรียนที่นับตามนิยาม เรื่องเดียวกัน ของ v2 — ครบทุกกรณีขอบ (0 โรงเรียน/ไม่มีเมนู) ได้ ×1.0 ไม่ใช่ 0

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วยชุดข้อมูล: เคสมี/ไม่มี IssueId, MenuId NULL, 0 โรงเรียน, เคสลบ — เทียบจำนวนที่นับ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

query ใหม่ใน repository — revert รายฟังก์ชันได้

### Task BE-crm-ai-support-P1-33 — ย้าย call site ไป v2 ทั้ง 3 จุด

Objective: ย้าย call site ทั้งหมดของ `computeCrmPriorityScore` มาใช้ `computeCrmPriorityScoreV2` + เขียน `SlaRuleVersion="v2"`+`ComputedAt` คู่กันทุกจุดคำนวณ: (ก) classify/re-classify (`classification.service.ts`), (ข) คนตรวจเปลี่ยน Severity ผ่าน review-queue (`review-queue.service.ts`), (ค) ผูกเคสเข้า `TCrmIssue` ทั้งจาก SA group มือ (link-case) และ accept `MERGE_ISSUE`/`MERGE_REQUEST` — จุด (ค) best-effort หลัง commit ห้าม rollback — แถวเก่า v1 ไม่ต้อง migrate
Why: คะแนนต้องคำนวณใหม่ทุกจังหวะที่ข้อมูลตั้งต้นเปลี่ยน — พลาดจุดเดียวคะแนนค้างเก่าเงียบ ๆ
Owner: backend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, AC-003.3, DES-005, DEC-005
Produces: none
Consumes: Contract:CrmAiPriorityScore.v2
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แก้ call site 3 กลุ่มตามสัญญา — เขียน `ComputedAt`+`SlaRuleVersion` คู่กันเสมอ · จุด (ค) best-effort หลัง commit ล้ม = log เท่านั้น · ไม่มีการ migrate แถวเก่า

#### Retrieval hints

Hypothesis: call site v1 มีอยู่ในไฟล์เดิม 3 กลุ่ม — grep ให้ครบก่อนย้าย
Query: หา `computeCrmPriorityScore`, `SlaRuleVersion`, `ComputedAt` ใน Target
Provenance: DES-005, DEC-005, Contract:CrmAiPriorityScore.v2

#### Do not modify

สูตรใน constant (แก้ที่ task BE-crm-ai-support-P1-31) · แถว v1 เดิม (ไม่ migrate) · การ rollback การผูกเรื่องเมื่อคำนวณคะแนนล้ม

#### Acceptance criteria

AC-003.1: ทุกจังหวะที่กำหนดคำนวณด้วย v2 จริง — ไม่เหลือ call site v1
AC-003.3: ทุกแถวที่คำนวณใหม่มี v2+ComputedAt คู่กัน — ย้อนอ่านเวอร์ชันได้ทุกจุด

#### Required validation and expected evidence

ตรวจ AC-003.1/AC-003.3 ด้วยการไล่ 3 จังหวะจริง (classify/เปลี่ยน Severity/ผูกเรื่อง) และ grep ไม่เหลือ call site v1 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ย้าย call site — revert ได้รายจุด (แถวที่คำนวณด้วย v2 คงค่า+เวอร์ชันของตัวเอง)

### Task BE-crm-ai-support-P1-34 — อัปเดต spec ของ crm-sla-rule

Objective: อัปเดต `_docs/create-spec.md`/spec ที่เกี่ยวข้องของ `crm-sla-rule.constant.ts` ให้ตรงสูตร v2
Why: spec ที่ยังอ้าง v1 ทำให้ engineer/QA คนถัดไป implement ผิดสูตร — เอกสารต้องตามสัญญาที่ใช้จริง
Owner: backend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, DES-005, DEC-005
Produces: none
Consumes: Contract:CrmAiPriorityScore.v2
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

แตะเอกสารเท่านั้น — เขียนตาม endpoint/constant ที่ implement แล้ว ไม่แก้โค้ด

#### Retrieval hints

Hypothesis: spec เดิมอยู่ที่ `_docs/create-spec.md` ของโมดูล — ยืนยันไฟล์ที่เกี่ยวข้องก่อนแก้
Query: หา `create-spec.md`, `CRM_SLA_RULE_VERSION`, `computeCrmPriorityScoreV2` ที่เกี่ยวกับโมดูลใน Target
Provenance: DES-005, DEC-005, Contract:CrmAiPriorityScore.v2

#### Do not modify

โค้ดใด ๆ (งานนี้เอกสารเท่านั้น) · spec ของ area อื่น

#### Acceptance criteria

AC-003.1: spec ระบุสูตร v2 ครบ (น้ำหนัก/ตัวคูณ 4 ช่วง/กรณีขอบ) ตรง constant จริง — ผู้อ่าน implement ต่อได้โดยไม่ต้องเดา

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วยการเทียบ spec กับ constant จริงทีละค่า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เอกสารเท่านั้น — revert ปลอดภัย

## Phase 2: Issue & Knowledge Management

### Task BE-crm-ai-support-P2-01 — model TCrmIssue

Objective: เพิ่ม model `TCrmIssue` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — เรื่อง (ปัญหา/ฟีเจอร์ตัวตนถาวร) ที่รวบหลายเคส
Why: การแยกเคสกับเรื่องต้องมีตารางเรื่องของตัวเอง — เคสอ้างผ่าน `TCrmCaseAiAssessment.IssueId` (logical ref) ตามธรรมเนียม DB นี้
Owner: backend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม model เดียวตรง § Data Model — ไม่มี `@relation` · เคสผูกผ่าน assessment เท่านั้น

#### Retrieval hints

Hypothesis: model มีอยู่จริงแล้วใน DB (introspect ยืนยัน) — ยืนยัน mapping/type กับ § Data Model ก่อนปิดงาน
Query: หา `model TCrmIssue` ใน `prisma/jabjai-master-single-db/schema.prisma`
Provenance: DES-008, DEC-008

#### Do not modify

model อื่น · การเพิ่ม FK/`@relation` · field เดิมของ `TCrmSupport`

#### Acceptance criteria

AC-010.1: มีตารางเรื่องแยกจากเคสตาม § Data Model — รวบหลายเคสเข้าเรื่องเดียวได้ผ่านการผูกของ app layer

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

model additive — ลบออกได้ ไม่กระทบตารางอื่น

### Task BE-crm-ai-support-P2-02 — model TCrmKnowledgeEntry

Objective: เพิ่ม model `TCrmKnowledgeEntry` ใน `prisma/jabjai-master-single-db/schema.prisma` ตาม § Data Model — คลังความรู้ที่ AI ดึงไปตอบ QA ได้
Why: เส้นทางตอบ QA จากความรู้เดิมและกลไก learning loop (NEW/STALE_KNOWLEDGE) ต้องมีตารางความรู้เป็นปลายทางร่วม
Owner: backend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม model เดียวตรง § Data Model รวมคอลัมน์ workflow เดิม (`Version`/`SupersededById`/`ApprovedBy` ฯลฯ)

#### Retrieval hints

Hypothesis: model มีอยู่จริงแล้วใน DB — ยืนยัน field workflow กับ § Data Model ก่อนปิดงาน
Query: หา `model TCrmKnowledgeEntry`, `SupersededById`, `ApprovedBy` ใน schema
Provenance: DES-008, DEC-008

#### Do not modify

model อื่น · workflow ของตารางอื่น · การเพิ่ม FK

#### Acceptance criteria

AC-008.1: มีคลังความรู้ที่เคส QA ตอบจากได้จริง — โครงตารางพร้อมตาม § Data Model

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วยการเทียบ schema กับ § Data Model — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

model additive — ลบออกได้

### Task BE-crm-ai-support-P2-03 — POST /issues (SA/PM)

Objective: เพิ่ม `POST /api/v2/support/crm-ai/issues` — สร้างเรื่องใหม่ (SA/PM) ตาม design § Classification & Safety Override Rules ข้อ 6 ที่ระบุ SA/PM เป็นคน group เข้า `TCrmIssue` เอง (แก้จาก SA เท่านั้น เดิม)
Why: การ group เป็นการตัดสินใจของคนสองบทบาทตาม design — ล็อกสิทธิ์ตรง design จึงไม่มีทางต่างกันระหว่างเอกสารกับโค้ด
Owner: backend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern โมดูล — guard สิทธิ์ SA/PM (`CRM_AI_SA`/`CRM_AI_PM`) · ไม่แตะ schema

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/issues/` — ยืนยัน guard ที่ implement จริงก่อนใช้
Query: หา `issues/route.ts`, `CRM_AI_SA`, `CRM_AI_PM` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

schema · permission constant · endpoint อื่น

#### Acceptance criteria

AC-010.1: สร้างเรื่องใหม่ผ่าน endpoint ได้โดย SA/PM — เคสยังไม่ถูกผูกจนกว่าจะใช้ link-case

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วย dev server: สร้างเรื่องสำเร็จ + 403 เมื่อสิทธิ์ไม่ใช่ SA/PM — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-04 — GET /issues list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/issues` — list พร้อม pagination + filter (`Category`/`Status`/`MenuId`)
Why: หน้าจัดการเรื่องต้องอ่านรายการผ่าน API เดียวแบ่งหน้าได้
Owner: backend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination บังคับ + filter 3 field

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน filter field กับ schema จริงก่อนใช้
Query: หา `issues/route.ts`, `buildPagination` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

ข้อมูลเรื่อง (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-010.1: อ่านรายการเรื่องแบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-05 — GET /issues/[id] detail

Objective: เพิ่ม `GET /api/v2/support/crm-ai/issues/[id]` — รายละเอียดเรื่อง + เคสที่ผูกอยู่ (join ผ่าน `TCrmCaseAiAssessment.IssueId` ที่ app layer เพราะ DB นี้ไม่มี FK)
Why: drill-down เรื่อง → เคสต้องได้จาก endpoint เดียว — join ที่ app layer ตามธรรมเนียม DB ที่ไม่ใช้ FK
Owner: backend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — รวมรายการเคสที่ผูกผ่าน assessment · ไม่แตะข้อมูลต้นทาง

#### Retrieval hints

Hypothesis: join ผ่าน `TCrmCaseAiAssessment.IssueId` — ยืนยัน field กับ schema จริงก่อนใช้
Query: หา `issues/[id]/route.ts`, `IssueId` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

schema · เคส/assessment (อ่านอย่างเดียว) · endpoint อื่น

#### Acceptance criteria

AC-010.1: รายละเอียดเรื่อง + เคสที่ผูกอยู่คืบครบใน payload เดียว — เคสที่ถูกติดป้ายซ้ำยังถูกนับตามปกติ

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วย dev server: เรื่องที่มี/ไม่มีเคสผูก — เทียบ payload — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-06 — PATCH /issues/[id] + DecisionReason

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/issues/[id]` — อัปเดต `Status`/`RootCause`/`Severity` — บังคับ `DecisionReason` ที่ app layer เมื่อ `Status=DECLINED` (PM เท่านั้นที่ approve/decline ได้)
Why: การปฏิเสธเรื่องต้องมีเหตุผลตาม AC-008.3 — บังคับที่ app layer จึงไม่มีทางปิดเรื่องเงียบ ๆ
Owner: backend-engineer
Depends on: none
Traceability: REQ-008, AC-008.3, DES-008, DEC-008
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

update field ที่อนุญาต — approve/decline สงวน PM · `DecisionReason` บังคับเมื่อ DECLINED

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน Zod schema และเงื่อนไข reason ก่อนแก้
Query: หา `issues/[id]`, `DecisionReason`, `DECLINED` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

เคส/assessment ที่ผูกอยู่ · schema · permission constant

#### Acceptance criteria

AC-008.3: เรื่องที่ปฏิเสธ (DECLINED) มีเหตุผลบันทึกเสมอ และการตัดสินเป็นของ PM เท่านั้น

#### Required validation and expected evidence

ตรวจ AC-008.3 ด้วย dev server: DECLINED ไม่มี reason ต้องถูกปฏิเสธ + สิทธิ์ non-PM ต้อง 403 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-07 — POST /issues/[id]/link-case

Objective: เพิ่ม `POST /api/v2/support/crm-ai/issues/[id]/link-case` — ผูกเคสเข้าเรื่อง (เขียน `TCrmCaseAiAssessment.IssueId`)
Why: การรวบเคสเข้าเรื่องเป็นการเขียน pointer บน assessment — จุดเดียวจึงควบคุมลำดับการผูกและการคำนวณซ้ำที่ตามมาได้
Owner: backend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เขียน `IssueId` บน assessment ของเคสเป้าหมายเท่านั้น — ไม่แตะแถวเรื่อง/เคสอื่น (การคำนวณ priority ซ้ำของจุดนี้มาจาก DES-005 ภายหลัง)

#### Retrieval hints

Hypothesis: จุดเขียน `IssueId` อยู่ใน repository ของ issues — ยืนยัน field กับ schema จริงก่อนแก้
Query: หา `link-case`, `IssueId`, `TCrmCaseAiAssessment` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

แถว assessment อื่น · เรื่องต้นทางอื่น · schema

#### Acceptance criteria

AC-010.1: ผูกเคสเข้าเรื่องได้จริง — เคสที่ถูกติดป้ายซ้ำยังถูกนับครั้ง/โรงเรียนตามปกติ (ติดป้ายไม่ใช่การตัดออก)

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วย dev server: ผูกแล้วเคสปรากฏในเรื่อง + รายละเอียดเรื่องเห็นเคส — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ (การผูกที่แล้วยกเลิกได้ผ่านการแก้ค่า pointer ปกติ)

### Task BE-crm-ai-support-P2-08 — POST /knowledge (DRAFT)

Objective: เพิ่ม `POST /api/v2/support/crm-ai/knowledge` — สร้าง knowledge entry (`Status=DRAFT`)
Why: ความรู้ใหม่ต้องเริ่ม DRAFT เสมอ — ไม่ถูก AI ดึงไปตอบจนกว่าจะ approve ตาม workflow ของตาราง
Owner: backend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern โมดูล — create ตั้ง `Status=DRAFT` เสมอ ไม่รับค่าสถานะจาก client

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/knowledge/` — ยืนยัน workflow เริ่มต้นของตารางก่อนใช้
Query: หา `knowledge/route.ts`, `Status=DRAFT` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

workflow ของตาราง (DRAFT→APPROVED) · schema · endpoint อื่น

#### Acceptance criteria

AC-008.1: ความรู้ใหม่ถูกสร้างเป็น DRAFT เสมอ — ยังไม่ถูกใช้ตอบ QA จนกว่าจะ approve

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วย dev server: สร้างแล้วได้ DRAFT เสมอ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-09 — GET /knowledge list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/knowledge` — list พร้อม pagination + filter (`Status`/`Category`/`MenuId`)
Why: จัดการความรู้ต้องอ่านรายการกรองตามสถานะ/หมวดได้จาก API เดียว
Owner: backend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination + filter 3 field ตาม pattern โมดูล

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน filter field กับ schema จริง
Query: หา `knowledge/route.ts`, `buildPagination` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

ข้อมูลความรู้ (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-008.1: อ่านรายการความรู้แบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-10 — PATCH /knowledge/[id] approve

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/knowledge/[id]` — แก้ไข/approve (`ApprovedBy`/`ApprovedAt`) — เฉพาะ `Status=APPROVED` เท่านั้นที่ AI ดึงไปตอบ QA ได้
Why: จุด approve เป็นด่านเดียวที่ปลดล็อกความรู้เข้าสู่การตอบ QA — ผู้อนุมัติ/เวลาต้องถูกเก็บทุกครั้ง
Owner: backend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

update workflow ของ entry — approve เขียน `ApprovedBy`/`ApprovedAt` · ความหมาย APPROVED ผูกกับเส้นทาง retrieval ของ classify (task ถัดไป)

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน field workflow กับ § Data Model
Query: หา `knowledge/[id]`, `ApprovedBy`, `APPROVED` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

แถว supersede chain เดิมของตาราง · schema · endpoint อื่น

#### Acceptance criteria

AC-008.1: approve ความรู้ผ่าน endpoint ได้จริง — เฉพาะแถว APPROVED ที่มีสิทธิ์ถูก AI ใช้ตอบ

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วย dev server: approve แล้วสถานะ/ผู้อนุมัติถูกต้อง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P2-11 — wire knowledge retrieval เข้า classify (QA)

Objective: เชื่อม knowledge retrieval เข้ากับ `classify` endpoint (Phase 1): เมื่อ `AiCategory=QA` ค้นหาใน `TCrmKnowledgeEntry` ที่ `Status=APPROVED` ก่อนตอบ
Why: เคส QA ต้องตอบเร็วจากความรู้ที่อนุมัติแล้ว — retrieval ผูกที่ classify จุดเดียวจึงครอบทุกเส้นทางที่เรียกจำแนก
Owner: backend-engineer
Depends on: none
Traceability: REQ-005, AC-005.1, REQ-008, AC-008.1, DES-001, DEC-001, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiClassificationSafety.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ต่อ retrieval ที่เส้นทาง classify เมื่อหมวด QA เท่านั้น — ดึงเฉพาะ `Status=APPROVED` · หาไม่เจอไหลตาม flow เดิม (ต่อมา P3-22 เพิ่มการเขียน log KNOWLEDGE_MATCH)

#### Retrieval hints

Hypothesis: จุดตัดสิน AiCategory=QA อยู่ใน classify pipeline — ยืนยันเงื่อนไข retrieval กับซอร์สจริง
Query: หา `TCrmKnowledgeEntry`, `APPROVED`, `AiCategory=QA` ใน classification pipeline ของ Target
Provenance: DES-001, DEC-001, DES-008, DEC-008, Contract:CrmAiClassificationSafety.v1

#### Do not modify

DRAFT/ARCHIVED entry (ห้ามดึง) · flow จำแนกหมวดอื่น · schema

#### Acceptance criteria

AC-005.1: การค้นหารันครบชุดแหล่งที่ design กำหนดสำหรับเคส QA — เริ่มที่ความรู้ที่อนุมัติแล้ว
AC-008.1: เคส QA ตอบจากความรู้เดิมได้จริงและปิดได้โดยไม่เข้า Backlog

#### Required validation and expected evidence

ตรวจ AC-005.1/AC-008.1 ด้วยเคส QA ที่มี/ไม่มีความรู้ APPROVED — เทียบผล retrieval — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ต่อที่จุดเดียว — revert ได้ แต่ต้องคงการกรอง APPROVED ไม่งั้น DRAFT จะหลุดไปตอบลูกค้า

### Task FE-crm-ai-support-P2-01 — scaffold issues page (SA/PM)

Objective: scaffold `src/app/pages/support/crm-ai/issues/page.tsx` (SA/PM-facing — Filter → Table → รายละเอียด)
Why: หน้าจัดการเรื่องต้องเป็น pattern มาตรฐานของโปรเจกต์จึงต่อยอดได้โดยไม่แตก pattern
Owner: frontend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — ตาราง/drawer/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/issues` ยังไม่มี — สร้างตาม pattern หน้าอื่น ยืนยันก่อนแก้
Query: หา `crm-ai/issues/page.tsx` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-010.1: หน้าจัดการเรื่องเปิดได้จริงด้วยโครงมาตรฐาน — พร้อมต่อข้อมูลจาก API

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-02 — issue table + detail drawer

Objective: `_components/issue-table.component.tsx`, `_components/issue-detail-drawer.component.tsx` (ปุ่ม approve/decline ใช้ `StatusModalComponent` type "confirm"/"delete")
Why: approve/decline เป็นการตัดสินของ PM — ต้องผ่าน confirm modal มาตรฐานและแสดงรายละเอียดครบก่อนกด
Owner: frontend-engineer
Depends on: none
Traceability: REQ-008, AC-008.3, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + drawer — ตาม Form Workflow มาตรฐานของโมดูล

#### Retrieval hints

Hypothesis: component กลาง (table/StatusModalComponent) มีตัวอย่างจากหน้าคิว — ยืนยันก่อนเขียน
Query: หา `issue-table.component.tsx`, `issue-detail-drawer.component.tsx` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

endpoint ฝั่ง BE · หน้า scaffold (task อื่น)

#### Acceptance criteria

AC-008.3: PM กด approve/decline จากหน้าจอได้จริงผ่าน modal มาตรฐาน — ข้อมูลเรื่องแสดงครบใน drawer

#### Required validation and expected evidence

ตรวจ AC-008.3 ด้วยการกดจริงทั้งสองทาง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-03 — issue-link-case modal

Objective: `_components/issue-link-case-modal.component.tsx` — ผูกเคสเข้าเรื่อง
Why: การผูกเคสเป็น action ของ SA/PM บนหน้าจอ — ต้องมี modal เดียวชี้เป้าเคสและเรื่องชัดเจน
Owner: frontend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

modal เดียว — เรียก link-case endpoint ผ่าน service ของหน้า

#### Retrieval hints

Hypothesis: pattern modal มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `issue-link-case-modal.component.tsx`, `link-case` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

endpoint ฝั่ง BE · drawer/ตาราง (task อื่น)

#### Acceptance criteria

AC-010.1: ผูกเคสเข้าเรื่องจากหน้าจอได้จริง — เคสปรากฏในรายการของเรื่องหลังผูก

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการผูกจริงผ่าน modal — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-04 — issue store + service

Objective: `_stores/use-issue-store.ts`, `_api/issue-service.ts`
Why: state และการเรียก API ของหน้าเรื่องรวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า issues — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าคิว — ยืนยันก่อนเขียน
Query: หา `use-issue-store.ts`, `issue-service.ts` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-010.1: หน้าเรื่องโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-05 — scaffold knowledge page (CS-facing)

Objective: scaffold `src/app/pages/support/crm-ai/knowledge/page.tsx` (CS-facing — ค้นหา/จัดการความรู้)
Why: หน้าคลังความรู้ต้องเป็น pattern มาตรฐาน — CS ค้นหา/จัดการความรู้ได้จากทางเข้าเดียว
Owner: frontend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/knowledge` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `crm-ai/knowledge/page.tsx` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-008.1: หน้าคลังความรู้เปิดได้จริงด้วยโครงมาตรฐาน — พร้อมต่อข้อมูลจาก API

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-06 — knowledge table + form modal

Objective: `_components/knowledge-table.component.tsx`, `_components/knowledge-form-modal.component.tsx`
Why: จัดการความรู้ต้องผ่าน Form Workflow มาตรฐานเดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal — สร้าง/แก้ผ่าน endpoint ของ area เดียวกัน

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `knowledge-table.component.tsx`, `knowledge-form-modal.component.tsx` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-008.1: เพิ่ม/แก้ความรู้ผ่านฟอร์มบนหน้าได้จริงตาม Form Workflow มาตรฐาน

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วย CRUD จริงบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-07 — knowledge store + service

Objective: `_stores/use-knowledge-store.ts`, `_api/knowledge-service.ts`
Why: state และการเรียก API ของหน้าความรู้รวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า knowledge — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าคิว — ยืนยันก่อนเขียน
Query: หา `use-knowledge-store.ts`, `knowledge-service.ts` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-008.1: หน้าความรู้โหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-008.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P2-08 — เมนู จัดการเรื่อง/ความรู้ AI

Objective: เพิ่มเมนู "จัดการเรื่อง/ความรู้ AI" (`news: true`) ใน `sidebar-component.tsx` (แยก 2 เมนูย่อย "จัดการเรื่อง (Issue)" และ "คลังความรู้ (AI)" ใน `sidebar-menu-constant.tsx`)
Why: สองหน้าใหม่ต้องมีทางเข้าจากเมนูปกติ — แยกเมนูย่อยตามผู้ใช้ (SA/PM กับ CS)
Owner: frontend-engineer
Depends on: none
Traceability: REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 2 เมนูย่อยใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-menu-constant.tsx`, `sidebar-component.tsx` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-010.1: ทางเข้าหน้าเรื่อง/ความรู้ปรากฏบนเมนูและพาไปถึงหน้าจริงได้

#### Required validation and expected evidence

ตรวจ AC-010.1 ด้วยการคลิกเมนูจริงทั้งสองทางเข้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P2-09 — ผูกสิทธิ์หน้าเรื่อง/ความรู้

Objective: ผูกสิทธิ์เข้า `src/app/pages/admin/permission/page.tsx` (ไม่ต้องเพิ่ม constant ใหม่ — ใช้ `PERMISSIONS.CRM_AI_*`/`MENU_SUPPORT_CRM_AI` เดิมที่มี label จาก Phase 1)
Why: หน้าใหม่ต้องควบคุมสิทธิ์จากหน้า permission กลางโดยใช้ค่าเดิม — เพิ่ม constant ซ้ำจะทำให้สองแหล่งความจริงเรื่องสิทธิ์
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

ผูก label/ค่า permission เข้าหน้า permission — reuse constant เดิมเท่านั้น

#### Retrieval hints

Hypothesis: constant จาก Phase 1 มีอยู่แล้ว — ยืนยัน label ที่หน้า permission ใช้ก่อนแก้
Query: หา `admin/permission/page.tsx`, `MENU_SUPPORT_CRM_AI` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission constant (ห้ามเพิ่มใหม่) · หน้า workflow อื่น · guard ฝั่ง API

#### Acceptance criteria

AC-016.2: สิทธิ์เข้าถึงหน้าเรื่อง/ความรู้ควบคุมจากหน้า permission กลางด้วยค่าเดิม — ไม่มี constant ซ้ำ

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้

## Phase 3: Feature Registry, Menu Relation & Learning Loop

### Task BE-crm-ai-support-P3-01 — PERMISSIONS.CRM_AI_UX_UI/DEV/SALES

Objective: เพิ่ม `PERMISSIONS.CRM_AI_UX_UI` / `CRM_AI_DEV` / `CRM_AI_SALES` ใน `src/constants/permission.constant.ts` — ยังไม่มี constant สำหรับ 3 role ใหม่นี้ (ดู design § Risks & Dependencies)
Why: Phase 3 เป็นเฟสแรกที่ role UX-UI/Dev/Sales ถูกใช้จริง — ค่า constant ต้องมีก่อน guard ของ endpoints/หน้าจอในเฟสนี้อ้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 3 ค่า constant ในไฟล์เดิม — guard ของ endpoints/หน้า Phase 3 อ้างชื่อค่าเหล่านี้เสมอ (Phase 4 ใช้ชุดเดียวกัน ไม่เพิ่มซ้ำ)

#### Retrieval hints

Hypothesis: `permission.constant.ts` มีโครง PERMISSIONS รวมอยู่แล้ว — ยืนยันชื่อค่าที่ guard อ้างจริงก่อนใช้
Query: หา `CRM_AI_UX_UI`, `CRM_AI_DEV`, `CRM_AI_SALES` ใน `src/constants/permission.constant.ts` และ guard ของโมดูล
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission ของโมดูลอื่น · การผูก constant กับตาราง staff-role (derive เป็นของ DES-006)

#### Acceptance criteria

AC-016.1: บทบาท UX_UI/DEV/SALES มีค่า permission รองรับ — `FunctionalRole` ครบ 6 ค่าที่กำหนด
AC-016.2: การตรวจสิทธิ์ API ยังใช้ `PERMISSIONS.CRM_AI_*` — role ใหม่อยู่ในชุดเดียวกัน

#### Required validation and expected evidence

ตรวจ AC-016.1/AC-016.2 ด้วยการอ่าน guard ที่อ้างค่าใหม่ + ทดสอบ 403 ตามบทบาท — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

constant additive — ลบรายค่าได้เมื่อไม่มี guard อ้างแล้ว

### Task BE-crm-ai-support-P3-02 — ตรวจ model TCrmProductFeature

Objective: ตรวจ model `TCrmProductFeature` ใน `prisma/jabjai-master-single-db/schema.prisma` ตรงกับ § Data Model ทุก field — ตารางมีอยู่จริงแล้วจาก `phase3-schema-ddl.sql` + `prisma db pull` งานที่เหลือคือยืนยัน mapping/type ตรงกัน ไม่ใช่สร้างใหม่
Why: แคตตาล็อกฟีเจอร์เป็นข้อมูลอ้างอิงของ Sales/PM — โครงตารางต้องตรง design ทุก field ก่อน endpoints อื่นอ้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-013, AC-013.1, DES-007, DEC-007
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

งานยืนยัน/แก้ mapping ใน schema เท่านั้น — ไม่มี DDL ใหม่ (ตารางอยู่แล้ว)

#### Retrieval hints

Hypothesis: schema.prisma ถูก pull หลัง DDL — เทียบกับ § Data Model ทีละ field ก่อนปิดงาน
Query: หา `model TCrmProductFeature`, `OwnerAdminId`, `StatusReason` ใน schema
Provenance: DES-007, DEC-007

#### Do not modify

DDL/ตารางใน DB (มีอยู่แล้ว) · model อื่น · การเพิ่ม field นอก § Data Model

#### Acceptance criteria

AC-013.1: โครงแคตตาล็อกตรง § Data Model — ชุดสถานะรองรับ `IN_PROGRESS`/`PLANNED`/`NOT_PLANNED`/`DECLINED` (ไม่มี `AVAILABLE`)

#### Required validation and expected evidence

ตรวจ AC-013.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema (การแก้ทำแบบ field-by-field พร้อม pull ตรวจซ้ำ)

### Task BE-crm-ai-support-P3-03 — POST /product-features (PM)

Objective: เพิ่ม `POST /api/v2/support/crm-ai/product-features` — สร้าง feature ใหม่ (auth + `CRM_AI_PM` เท่านั้น)
Why: แคตตาล็อกเป็นของ PM (`OwnerAdminId`) — จุดสร้างเดียวล็อกสิทธิ์และสถานะเริ่มต้นของ registry ตามสัญญา
Owner: backend-engineer
Depends on: none
Traceability: REQ-013, AC-013.1, DES-007, DEC-007
Produces: Contract:CrmAiFeatureMenuRelation.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern โมดูล — guard `CRM_AI_PM` · สถานะเริ่ม PLANNED ตามสัญญา · ไม่แตะ schema

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/product-features/` — ยืนยัน guard/สถานะเริ่มต้นที่ implement จริง
Query: หา `product-features/route.ts`, `productFeatureService`, `CRM_AI_PM` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

สถานะเริ่มต้นนอก PLANNED · schema · permission constant (task BE-crm-ai-support-P3-01)

#### Acceptance criteria

AC-013.1: สร้างฟีเจอร์ใหม่ได้โดย PM เท่านั้น — สถานะเริ่มต้นตามชุดที่กำหนด ไม่มีค่า AVAILABLE

#### Required validation and expected evidence

ตรวจ AC-013.1 ด้วย dev server: สร้างสำเร็จ + 403 non-PM + สถานะเริ่มต้นถูกต้อง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-04 — GET /product-features list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/product-features` — list พร้อม pagination + filter (`Status`/`GroupName`) — `CRM_AI_SALES` เข้าถึงได้แบบ read-only (ค้นหาฟีเจอร์ตอบลูกค้า)
Why: Sales ต้องค้นสถานะฟีเจอร์จากแคตตาล็อกกลางได้ทันที — read-only ตามสัญญา ไม่มีปุ่มแก้สำหรับ Sales
Owner: backend-engineer
Depends on: none
Traceability: REQ-013, AC-013.2, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination + filter · สิทธิ์อ่านครอบ Sales · ไม่มี write path

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน guard ที่ครอบ Sales จริงก่อนใช้
Query: หา `product-features/route.ts`, `CRM_AI_SALES` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

แถวฟีเจอร์ (อ่านอย่างเดียวจาก endpoint นี้) · schema · endpoint อื่น

#### Acceptance criteria

AC-013.2: Sales ค้นสถานะฟีเจอร์ (มี/กำลังทำ/มีแผน/ยังไม่มีแผน) จาก list ได้จริง — แบ่งหน้า/กรองได้

#### Required validation and expected evidence

ตรวจ AC-013.2 ด้วย dev server: filter/pagination + บัญชี Sales อ่านได้แต่เขียนไม่ได้ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-05 — GET /product-features/[id]

Objective: เพิ่ม `GET /api/v2/support/crm-ai/product-features/[id]`
Why: มุมมองรายฟีเจอร์สำหรับ drawer/หน้ารายละเอียด — อ่านจาก API เดียวกับ list
Owner: backend-engineer
Depends on: none
Traceability: REQ-013, AC-013.2, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint เดี่ยว — ไม่มี write

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน payload จริงก่อนใช้
Query: หา `product-features/[id]` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

แถวฟีเจอร์ (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-013.2: อ่านรายละเอียดฟีเจอร์หนึ่งแถวได้จริง — ครบ field ที่หน้าแสดง

#### Required validation and expected evidence

ตรวจ AC-013.2 ด้วย dev server: GET รายฟีเจอร์ + 404 เมื่อไม่มี — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-06 — PATCH /product-features/[id]

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/product-features/[id]` — แก้ `Status`/`StatusReason`/`OwnerAdminId`/`MenuId` (`CRM_AI_PM`) — บังคับ `StatusReason` ที่ app layer เมื่อ `Status=DECLINED` ตาม design § Feature Registry & Menu Relation Rules ข้อ 1
Why: สถานะแคตตาล็อกเดินตามลำดับที่สัญญากำหนด — การปฏิเสธต้องมีเหตุผล และการ ship จริงผูก MenuId กลับมาที่แถวฟีเจอร์
Owner: backend-engineer
Depends on: none
Traceability: REQ-013, AC-013.1, AC-013.3, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

update field ที่อนุญาตโดย PM — `StatusReason` บังคับเมื่อ DECLINED · `MenuId` ผูกเมื่อ ship จริง

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน Zod refine เงื่อนไข reason ก่อนแก้
Query: หา `product-features/[id]`, `StatusReason`, `DECLINED` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

ชุดสถานะ (ไม่มี AVAILABLE/DORMANT) · schema · permission constant

#### Acceptance criteria

AC-013.1: สถานะเปลี่ยนภายในชุด 4 ค่าที่กำหนด — DECLINED มี StatusReason เสมอ
AC-013.3: เมื่อฟีเจอร์ ship จริง ระบบผูก `MenuId` กลับมาที่แถวฟีเจอร์นั้นได้จริง

#### Required validation and expected evidence

ตรวจ AC-013.1/AC-013.3 ด้วย dev server: เปลี่ยนสถานะทุกทาง + DECLINED ไม่มี reason ต้อง 4xx — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-07 — ตรวจ model TCrmMenuRelation

Objective: ตรวจ model `TCrmMenuRelation` ใน `prisma/jabjai-master-single-db/schema.prisma` ตรงกับ § Data Model
Why: ความสัมพันธ์เมนูรองรับทั้ง DECLARED และ AI_SUGGESTED — โครงตารางต้องตรง design ก่อน endpoints อ้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, DES-007, DEC-007
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

งานยืนยัน/แก้ mapping ใน schema เท่านั้น — ไม่มี DDL ใหม่

#### Retrieval hints

Hypothesis: ตารางมีอยู่จริงจาก DDL — เทียบกับ § Data Model ทีละ field ก่อนปิดงาน
Query: หา `model TCrmMenuRelation`, `Source`, `RelationType` ใน schema
Provenance: DES-007, DEC-007

#### Do not modify

DDL/ตารางใน DB · model อื่น · การเพิ่ม field นอก § Data Model

#### Acceptance criteria

AC-014.1: โครงตารางรองรับแหล่งที่มา `DECLARED`/`AI_SUGGESTED` และ `RelationType` ใน 3 ค่าที่กำหนด

#### Required validation and expected evidence

ตรวจ AC-014.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema

### Task BE-crm-ai-support-P3-08 — POST /menu-relations (DECLARED)

Objective: เพิ่ม `POST /api/v2/support/crm-ai/menu-relations` — สร้างแบบ `Source=DECLARED` เท่านั้นในรอบนี้ (`CRM_AI_SA`/`CRM_AI_UX_UI`) — ตั้ง `Status=CONFIRMED` ทันทีพร้อม `ConfirmedBy`/`ConfirmedAt` ตาม design ข้อ 2(ก)
Why: คนประกาศความสัมพันธ์เองเริ่ม CONFIRMED ทันที — แยกจากแถว AI_SUGGESTED ที่ต้องรอยืนยัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, AC-014.2, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

create เฉพาะ `Source=DECLARED` — สิทธิ์ SA/UX-UI · ตั้ง CONFIRMED พร้อมตัวตนผู้ยืนยัน ห้ามรับสถานะจาก client

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/menu-relations/` — ยืนยัน guard และค่าเริ่มต้นที่ implement จริง
Query: หา `menu-relations/route.ts`, `DECLARED`, `ConfirmedBy` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

แถว AI_SUGGESTED (สร้างเฉพาะจาก accept suggestion ตามสัญญา) · schema · permission constant

#### Acceptance criteria

AC-014.1: สร้างความสัมพันธ์แบบ DECLARED ได้จริง — `RelationType` อยู่ใน 3 ค่าที่กำหนด
AC-014.2: แถว DECLARED เริ่ม CONFIRMED พร้อมผู้ยืนยัน — แยกชัดจาก AI_SUGGESTED

#### Required validation and expected evidence

ตรวจ AC-014.1/AC-014.2 ด้วย dev server: สร้างสำเร็จ + 403 non-SA/UX-UI + สถานะเริ่มต้นถูกต้อง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-09 — GET /menu-relations list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/menu-relations` — list พร้อม pagination + filter (`MenuAId`/`MenuBId`/`Status`/`RelationType`)
Why: คิวยืนยันและหน้าแสดงผลอ่านรายการจาก API เดียว — filter ตามมิติของตาราง
Owner: backend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination + filter 4 field ตาม pattern โมดูล

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน filter field กับ schema จริง
Query: หา `menu-relations/route.ts`, `buildPagination` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

แถวความสัมพันธ์ (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-014.1: อ่านรายการความสัมพันธ์แบ่งหน้า/กรองได้จริง — ทั้งแถว DECLARED และ AI_SUGGESTED

#### Required validation and expected evidence

ตรวจ AC-014.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-10 — PATCH /menu-relations/[id] confirm/reject

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/menu-relations/[id]` — confirm/reject แถว `Status=PENDING_REVIEW` (ใช้กับแถว `Source=AI_SUGGESTED` ที่ Phase 3b จะสร้าง) เขียน `ConfirmedBy`/`ConfirmedAt` — ต้องมีคำเตือน/บล็อกไม่ให้ใช้ผลปรับ priority score/severity อัตโนมัติ — **ห้ามเขียนแถวใหม่ใน `TCrmAiDecisionLog` ที่ขั้นตอนนี้เด็ดขาด** (ตัดสินใจของคน มีตัวตนกำกับในตารางตัวเองแล้ว ตาม design § AI Suggestion & Learning Loop Rules ข้อ 4 กรณีขอบ)
Why: การยืนยันเป็นการตัดสินของคนที่ตารางเก็บตัวตนเองไว้ — เขียน log ซ้ำจะทำให้ audit มีสองแหล่งตัดสินสำหรับเหตุการณ์เดียว
Owner: backend-engineer
Depends on: none
Traceability: REQ-014, AC-014.2, AC-014.3, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

confirm/reject เฉพาะแถว PENDING_REVIEW — เขียน `ConfirmedBy`/`ConfirmedAt` ที่ตารางเอง · ตัดสินซ้ำ → AppError(409) ตาม DEC-007 · ห้ามเขียน decision log

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยันเงื่อนไขสถานะที่ implement จริง
Query: หา `menu-relations/[id]`, `PENDING_REVIEW`, `ConfirmedBy` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

`TCrmAiDecisionLog` (ห้ามเขียนแถวใหม่ที่ขั้นตอนนี้เด็ดขาด) · priority/severity ของเคส (ห้ามปรับอัตโนมัติ) · schema

#### Acceptance criteria

AC-014.2: แถว AI_SUGGESTED ที่ยืนยันเป็น CONFIRMED พร้อมตัวตนผู้ยืนยัน — ก่อนหน้านั้นเป็น hint เท่านั้น
AC-014.3: แถว PENDING_REVIEW ไม่ถูกใช้ปรับ priority/severity อัตโนมัติในทางใด

#### Required validation and expected evidence

ตรวจ AC-014.2/AC-014.3 ด้วย dev server: confirm/reject แถว PENDING_REVIEW + ตัดสินซ้ำ 409 + ไม่มีแถว log ใหม่ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-01 — เมนู ฟีเจอร์ที่วางแผนไว้

Objective: เพิ่มเมนู "ฟีเจอร์ที่วางแผนไว้" (`news: true`) ใน `sidebar-component.tsx`
Why: แคตตาล็อกฟีเจอร์ต้องมีทางเข้าจากเมนูปกติสำหรับ PM/Sales
Owner: frontend-engineer
Depends on: none
Traceability: REQ-013, AC-013.2, DES-007, DEC-007
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-007, DEC-007

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-013.2: ทางเข้าแคตตาล็อกฟีเจอร์ปรากฏบนเมนูและพาไปถึงหน้าจริง

#### Required validation and expected evidence

ตรวจ AC-013.2 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P3-02 — scaffold product-features page

Objective: scaffold `src/app/pages/support/crm-ai/product-features/page.tsx` (PM CRUD เต็มรูปแบบ, Sales เห็นแบบ read-only ไม่มีปุ่มแก้ไข)
Why: สองบทบาทใช้หน้าเดียวกันต่างสิทธิ์ — ซ่อนปุ่มแก้จาก Sales ตามสัญญา read-only
Owner: frontend-engineer
Depends on: none
Traceability: REQ-013, AC-013.2, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — สิทธิ์กำหนดปุ่มแก้ (PM เท่านั้น) · ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/product-features` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `crm-ai/product-features/page.tsx`, `useHasPermission` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · permission constant

#### Acceptance criteria

AC-013.2: หน้าแคตตาล็อกเปิดได้จริง — PM เห็นปุ่มแก้ Sales อ่านอย่างเดียว

#### Required validation and expected evidence

ตรวจ AC-013.2 ด้วยบัญชี PM และ Sales จริงเทียบปุ่มที่เห็น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-03 — product-feature table + form modal

Objective: `_components/product-feature-table.component.tsx`, `_components/product-feature-form-modal.component.tsx` (ใช้ `StatusModalComponent`/Form Workflow มาตรฐาน)
Why: CRUD แคตตาล็อกต้องผ่าน Form Workflow มาตรฐานเดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-013, AC-013.1, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal — สร้าง/แก้/เปลี่ยนสถานะผ่าน endpoints ของ area เดียวกัน

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `product-feature-table.component.tsx`, `product-feature-form-modal.component.tsx` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-013.1: เพิ่ม/แก้/เปลี่ยนสถานะฟีเจอร์ผ่านฟอร์มได้จริง — ชุดสถานะตามที่กำหนด ไม่มี AVAILABLE

#### Required validation and expected evidence

ตรวจ AC-013.1 ด้วย CRUD จริงบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-04 — product-feature store + service

Objective: `_stores/use-product-feature-store.ts`, `_api/product-feature-service.ts`
Why: state และการเรียก API ของหน้าแคตตาล็อกรวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-013, AC-013.2, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า product-features — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `use-product-feature-store.ts`, `product-feature-service.ts` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-013.2: หน้าแคตตาล็อกโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-013.2 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-05 — เมนู ความสัมพันธ์ระหว่างเมนู

Objective: เพิ่มเมนู "ความสัมพันธ์ระหว่างเมนู" (`news: true`) ใน `sidebar-component.tsx`
Why: หน้าจัดการความสัมพันธ์ต้องมีทางเข้าจากเมนูปกติสำหรับ SA/UX-UI
Owner: frontend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, DES-007, DEC-007
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-007, DEC-007

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-014.1: ทางเข้าหน้าความสัมพันธ์เมนูปรากฏบนเมนูและพาไปถึงหน้าจริง

#### Required validation and expected evidence

ตรวจ AC-014.1 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P3-06 — scaffold menu-relations page

Objective: scaffold `src/app/pages/support/crm-ai/menu-relations/page.tsx` (SA/UX-UI-facing — สร้าง Declared + confirm/reject คิว Pending)
Why: หน้าเดียวรวมการประกาศและคิวยืนยัน — คนตัดสินเห็นทั้งสองส่วนในที่เดียว
Owner: frontend-engineer
Depends on: none
Traceability: REQ-014, AC-014.2, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — คิว Pending แสดงเฉพาะแถว PENDING_REVIEW · ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/menu-relations` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `crm-ai/menu-relations/page.tsx` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · permission constant

#### Acceptance criteria

AC-014.2: หน้าความสัมพันธ์เปิดได้จริง — คิวแถว PENDING_REVIEW พร้อมให้ยืนยัน/ปฏิเสธ

#### Required validation and expected evidence

ตรวจ AC-014.2 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-07 — menu-relation table + form modal

Objective: `_components/menu-relation-table.component.tsx`, `_components/menu-relation-form-modal.component.tsx`
Why: ประกาศ/ยืนยันความสัมพันธ์ผ่าน Form Workflow มาตรฐานเดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal — สร้าง DECLARED / confirm-reject PENDING ผ่าน endpoints ของ area เดียวกัน

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `menu-relation-table.component.tsx`, `menu-relation-form-modal.component.tsx` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-014.1: ประกาศ/ยืนยันความสัมพันธ์ผ่านฟอร์มได้จริง — RelationType ตาม 3 ค่าที่กำหนด

#### Required validation and expected evidence

ตรวจ AC-014.1 ด้วย CRUD จริงบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-08 — menu-relation store + service

Objective: `_stores/use-menu-relation-store.ts`, `_api/menu-relation-service.ts`
Why: state และการเรียก API ของหน้าความสัมพันธ์รวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiFeatureMenuRelation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า menu-relations — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `use-menu-relation-store.ts`, `menu-relation-service.ts` ใน Target
Provenance: DES-007, DEC-007, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-014.1: หน้าความสัมพันธ์โหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-014.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-09 — ผูกสิทธิ์หน้า feature/menu-relation

Objective: ผูกสิทธิ์ทั้งสองหน้าเข้า `src/app/pages/admin/permission/page.tsx` ตาม `PERMISSIONS.CRM_AI_*` ใหม่
Why: สิทธิ์ role ใหม่ 3 ตัวต้องผูกหน้าจอจริงจากหน้า permission กลาง — ไม่มีทางเข้านอกการมอบสิทธิ์
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

ผูก label/ค่า permission เข้าหน้า permission — ใช้ constant จาก BE-crm-ai-support-P3-01 เท่านั้น

#### Retrieval hints

Hypothesis: constant ใหม่มีอยู่แล้วจาก task แรกของเฟส — ยืนยัน label ที่หน้า permission ใช้ก่อนแก้
Query: หา `admin/permission/page.tsx`, `CRM_AI_UX_UI`, `CRM_AI_SALES` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission constant (task BE-crm-ai-support-P3-01) · หน้า workflow อื่น · guard ฝั่ง API

#### Acceptance criteria

AC-016.2: มอบ/ถอนสิทธิ์ role ใหม่จากหน้า permission กลางแล้วผลถึงหน้าจอ 2 หน้าจริง

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้

### Task BE-crm-ai-support-P3-11 — ตรวจ model TCrmAiSuggestion

Objective: ตรวจ model `TCrmAiSuggestion` ใน `prisma/jabjai-master-single-db/schema.prisma` ตรงกับ § Data Model
Why: กลไกเรียนรู้ทั้งหมดผูกกับตารางนี้ — โครงตารางต้องตรง design ก่อน inbox/accept/detect อ้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

งานยืนยัน/แก้ mapping ใน schema เท่านั้น — ไม่มี DDL ใหม่ (ตารางมีอยู่จริง)

#### Retrieval hints

Hypothesis: ตารางมีอยู่จริงจาก DDL — เทียบกับ § Data Model ทีละ field ก่อนปิดงาน
Query: หา `model TCrmAiSuggestion`, `SuggestionType`, `group_key` ใน schema
Provenance: DES-008, DEC-008

#### Do not modify

DDL/ตารางใน DB · model อื่น · การเพิ่ม field นอก § Data Model

#### Acceptance criteria

AC-011.1: โครงตารางรองรับแถว suggestion `Status=PENDING` พร้อม `ReviewedBy` ก่อนมีผลจริง — ตรง § Data Model

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema

### Task BE-crm-ai-support-P3-12 — GET /ai-suggestions inbox

Objective: เพิ่ม `GET /api/v2/support/crm-ai/ai-suggestions` — inbox list พร้อม pagination + filter (`SuggestionType`/`Status=PENDING` default)
Why: คิวข้อเสนอต้องดึงเฉพาะแถวที่รอคนตัดสินเป็นค่าเริ่มต้น — แถวที่ตัดสินแล้วไม่ปนคิว
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: Contract:CrmAiLearningLoop.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — default filter `Status=PENDING` · pagination + filter ตาม pattern โมดูล

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/ai-suggestions/` — ยืนยัน default filter ที่ implement จริง
Query: หา `ai-suggestions/route.ts`, `PENDING`, `SuggestionType` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

แถว suggestion (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-011.1: ทุกสัญญาณที่ตรวจพบปรากฏใน inbox เป็น PENDING — ไม่มีแถวถูก auto-apply ก่อนคนตัดสิน

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วย dev server: inbox เห็นเฉพาะ PENDING เป็นค่าเริ่มต้น + filter/pagination ทำงาน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-13 — PATCH /ai-suggestions/[id] accept/reject

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/ai-suggestions/[id]` — accept/reject (`ReviewedBy`/`ReviewReason`/`ReviewedAt`) — ผู้กดตาม `SuggestionType` ต่างกัน (SA: MERGE_ISSUE/NEW_MENU_RELATION, PM: MERGE_REQUEST, Support Lead: NEW_KNOWLEDGE/STALE_KNOWLEDGE) — เช็คสิทธิ์ 2 ชั้น: broad reviewer set (`CRM_AI_SUGGESTION_REVIEWERS`) ที่ guard + เช็ค per-type ต่อแถวใน service (อ่านแถวก่อนตัดสิน) ก่อนเริ่มทรานแซกชัน → `AppError(403)`
Why: สิทธิ์ขึ้นกับ SuggestionType ของแถวที่ต้องอ่านก่อน — เช็ค 2 ชั้นจึงทั้งกันเรียกโดยไม่ใช่ reviewer และกันกดผิดชนิด
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

guard ชั้นแรก broad reviewer set · service ชั้นสอง per-type ก่อนทรานแซกชัน · บันทึก `ReviewedBy`/`ReviewReason`/`ReviewedAt` ทุกครั้ง

#### Retrieval hints

Hypothesis: guard pattern ของโมดูลมีตัวอย่าง — ยืนยันจุดเช็ค 2 ชั้นกับซอร์สจริง (wording ตามรอบแก้ 2026-08-23)
Query: หา `ai-suggestions/[id]`, `CRM_AI_SUGGESTION_REVIEWERS`, `REVIEWER_PERMISSION_BY_TYPE` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

ผลจริงของการ accept (เป็นของ amendment ภายหลัง) · schema · permission constant

#### Acceptance criteria

AC-011.1: การ accept/reject บันทึกผู้รีวิว/เหตุผล/เวลา — แถวไม่มีผลจริงก่อนมี `ReviewedBy` และผู้ไม่มีสิทธิ์ถูกปฏิเสธ 403

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วย dev server: accept/reject สำเร็จ + 403 ทั้งกรณี non-reviewer และ type ไม่ตรงบทบาท — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P3-14 — REJECTED ไม่เขียน decision log

Objective: แก้เส้นทาง reject ให้ไม่เขียนแถวใน `TCrmAiDecisionLog` เลย (`TCrmAiSuggestion.Status`/`ReviewedBy`/`ReviewedAt` พอแล้ว) ตาม design § AI Suggestion & Learning Loop Rules ข้อ 4 กรณีขอบ
Why: การปฏิเสธไม่ใช่ผลจริงต่อระบบปลายทาง — เขียน log จะสร้าง audit ลอย ๆ ที่ไม่มีผลจริงคู่กัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เงื่อนไขบนเส้นทาง reject ของ PATCH — ยืนยันว่าไม่มีจุดเขียน log ใน branch นี้

#### Retrieval hints

Hypothesis: จุดเขียน log รวมใน ai-suggestion service — อ่าน branch reject จริงก่อนแก้
Query: หา `REJECTED`, `review`, `createDecisionLog` ใน ai-suggestion service ของ Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

แถว log ของเส้นทาง accept (ยังต้องเขียน) · สถานะ/ตัวตนที่ reject เขียนบน suggestion เอง

#### Acceptance criteria

AC-011.1: การ reject ตัดสินบนตาราง suggestion เท่านั้น — ไม่มีแถว audit ที่ไม่มีผลจริงคู่

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วยการ reject จริงแล้วนับแถว log (ต้องไม่เพิ่ม) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เงื่อนไข branch เดียว — revert ได้ (แต่การ revert สร้าง audit ลอย จึงต้องมีเหตุผลชัด)

### Task BE-crm-ai-support-P3-15 — accept ซ้ำ → AppError(409)

Objective: แก้เส้นทาง accept กรณีแถว `Status != 'PENDING'` แล้ว (กดซ้ำ) ให้ตอบ `AppError(409)` — ไม่เขียนทั้งผลจริงและ decision log รอบสอง (append-only ลบแถวซ้ำทีหลังไม่ได้)
Why: แถว audit append-only ล้างซ้ำไม่ได้ — กันซ้ำที่ปากทางจึงไม่มี audit ปลอมเกิดเลย
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เช็คสถานะปัจจุบันก่อนทรานแซกชัน — ไม่ใช่ PENDING → 409 ทันที ไม่เขียนอะไรทั้งสองตาราง

#### Retrieval hints

Hypothesis: จุดเช็คสถานะอยู่หัวฟังก์ชัน review — ยืนยันกับซอร์สจริง
Query: หา `review`, `409`, `PENDING` ใน ai-suggestion service ของ Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

แถวที่ตัดสินไปแล้ว (ห้ามแก้) · การเขียน log รอบสองในทางใด · schema

#### Acceptance criteria

AC-011.1: กด accept ซ้ำถูกปฏิเสธ 409 — ไม่มีแถว audit ซ้ำเกิดขึ้นในตาราง append-only

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วยการกด accept สองครั้งจริง — ครั้งสอง 409 + นับแถว log ไม่เพิ่ม — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

เงื่อนไข branch เดียว — revert ได้ (แต่ต้องคงกันซ้ำเพราะ append-only)

### Task BE-crm-ai-support-P3-16 — accept NEW_MENU_RELATION → แถว + log คู่

Objective: เมื่อ accept `SuggestionType=NEW_MENU_RELATION` — สร้างแถวใหม่ `TCrmMenuRelation` (`Source=AI_SUGGESTED`, `Status=PENDING_REVIEW` เสมอ ไม่ auto-confirm) ให้ไหลเข้าคิว confirm ของ Phase 3a **และ** ในทรานแซกชันเดียวกันเขียนแถวคู่ `TCrmAiDecisionLog` (`SubjectType=MENU_RELATION`, `SubjectId=CrmMenuRelationId` ที่เพิ่งสร้าง, `DecisionType=MENU_CLASSIFICATION`) — log ล้ม rollback การ accept ทั้งก้อน
Why: ข้อเสนอความสัมพันธ์ต้องเกิดทั้งแถวรอยืนยันและ audit คู่กันในทรานแซกชันเดียว — ขาดใดขาดหนึ่ง audit ไม่ครบ
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, REQ-014, AC-014.2, DES-008, DEC-008, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1, Contract:CrmAiFeatureMenuRelation.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ทรานแซกชันเดียว: สร้างแถว AI_SUGGESTED/PENDING_REVIEW + แถวคู่ log ตามตารางแมป — ใช้ payload ที่ขาด menu_a_id/menu_b_id/relation_type → AppError(422) ตาม DEC-007

#### Retrieval hints

Hypothesis: จุด accept แยก branch ตาม SuggestionType — ยืนยันตารางแมปกับ design § ข้อ 4 ก่อนแก้
Query: หา `NEW_MENU_RELATION`, `AI_SUGGESTED`, `MENU_RELATION`, `$transaction` ใน Target
Provenance: DES-008, DEC-008, DES-007, DEC-007, Contract:CrmAiLearningLoop.v1, Contract:CrmAiFeatureMenuRelation.v1

#### Do not modify

การ auto-confirm แถวใหม่ (ห้ามเด็ดขาด ต้องผ่านคิว 3a) · แถว log เดิม · schema

#### Acceptance criteria

AC-011.1: accept ข้อเสนอสร้างแถวรอยืนยัน + audit คู่กันในทรานแซกชันเดียว — ไม่มี auto-apply
AC-014.2: แถวที่สร้างเป็น AI_SUGGESTED เริ่ม PENDING_REVIEW เสมอ

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-014.2 ด้วย accept จริง: แถว relation + log คู่กัน, log ล้ม rollback ทั้งก้อน, payload ขาด 422 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

branch ของเส้นทาง accept — revert ได้ราย branch (แถวที่สร้างแล้วเป็นข้อมูล PENDING_REVIEW ปกติ)

### Task BE-crm-ai-support-P3-17 — accept MERGE_* → log คู่ ISSUE/DEDUP_MATCH

Objective: เมื่อ accept `SuggestionType=MERGE_ISSUE`/`MERGE_REQUEST` — ในทรานแซกชันเดียวกับผลจริงของการรวม เขียนแถวคู่ `TCrmAiDecisionLog` (`SubjectType=ISSUE`, `SubjectId=CrmIssueId` ของเรื่อง/คำขอ**ปลายทาง**การรวม ไม่ใช่ตัวที่ถูกรวมเข้าไป, `DecisionType=DEDUP_MATCH`) — ปลายทางหาไม่เจอ → `AppError(404)` ไม่ accept ไม่เขียน log ชี้ของที่ไม่มีอยู่ (DB นี้ไม่มี FK คอยจับ)
Why: audit การรวมต้องชี้เรื่องปลายทางที่ยังมีอยู่จริง — ชี้ผิดตัวจะตามรอบย้อนหลังไม่เจอ
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แถวคู่ในทรานแซกชันเดียวกับการรวม — SubjectId ปลายทางเสมอ · ตรวจมีอยู่จริงก่อนเขียน ไม่ผ่าน 404

#### Retrieval hints

Hypothesis: ตารางแมปอยู่ใน design § ข้อ 4 — ยืนยัน branch MERGE_* กับซอร์สจริง
Query: หา `MERGE_ISSUE`, `DEDUP_MATCH`, `SubjectType=ISSUE` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

SubjectId (ต้องเป็นปลายทาง ไม่ใช่ตัวถูกรวม) · แถว log เดิม · schema

#### Acceptance criteria

AC-011.1: การรวมมี audit คู่ในทรานแซกชันเดียว — ไม่มี audit หลุดจากผลจริง
AC-010.1: ผลการรวมชี้เรื่องปลายทางที่มีอยู่จริง — รวบหลายเคสเข้าเรื่องเดียวได้ถูกตัว

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-010.1 ด้วย accept จริง: log คู่ชี้ปลายทางถูกตัว + กรณีปลายทางหาย 404 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

branch ของเส้นทาง accept — revert ได้ราย branch

### Task BE-crm-ai-support-P3-18 — accept NEW/STALE_KNOWLEDGE → log คู่

Objective: เมื่อ accept `SuggestionType=NEW_KNOWLEDGE`/`STALE_KNOWLEDGE` — ในทรานแซกชันเดียวกับผลจริงที่ `TCrmKnowledgeEntry` เขียนแถวคู่ `TCrmAiDecisionLog` (`SubjectType=KNOWLEDGE`, `SubjectId=CrmKnowledgeEntryId` ที่เกี่ยวข้อง, `DecisionType=KNOWLEDGE_MATCH`) — subject หาย → กติกา `AppError(404)` เดียวกัน
Why: audit ความรู้ต้องชี้ entry จริงที่ผลจริงเกิด — ใช้กติกา 404 เดียวกันทุกกลุ่มจึงไม่มี branch เฉพาะตัว
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, REQ-008, AC-008.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แถวคู่ในทรานแซกชันเดียวกับผลจริง — ตรวจ subject มีจริงก่อนเขียน

#### Retrieval hints

Hypothesis: branch NEW/STALE_KNOWLEDGE อยู่ใน accept flow — ยืนยันกับซอร์สจริง
Query: หา `NEW_KNOWLEDGE`, `STALE_KNOWLEDGE`, `KNOWLEDGE_MATCH` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

แถว log เดิม · workflow ของ `TCrmKnowledgeEntry` (DRAFT/approve) · schema

#### Acceptance criteria

AC-011.1: การ accept กลุ่มความรู้มี audit คู่ในทรานแซกชันเดียว — ไม่มี audit หลุดจากผลจริง
AC-008.1: ผลจริงต่อคลังความรู้ (สร้าง/ตั้งตรวจซ้ำ) ยังเดินตาม workflow ของตาราง

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-008.1 ด้วย accept จริงทั้งสอง type: log คู่ + subject หาย 404 — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

branch ของเส้นทาง accept — revert ได้ราย branch

### Task BE-crm-ai-support-P3-19 — ค่าที่เหลือของแถวคู่

Objective: ค่าที่เหลือของทุกแถวคู่ decision log (บังคับไม่มีข้อยกเว้น ตาม design § ข้อ 4): `AiOutput = { suggestionId, suggestionType, payload }` copy `Payload` มาทั้งก้อน (ไม่ join ตอนอ่านทีหลัง), `Confidence`/`ModelVersion` = ค่าที่ detection ใช้ตอนสร้าง — rule-based ให้ `Confidence=null`/`ModelVersion="rule-based"` (ห้ามใส่ 1.0 ลอย ๆ), `ReviewStatus="CONFIRMED"`, `ReviewedBy`/`ReviewedAt` = คนกด/เวลากด accept, `ReviewReason` ไม่บังคับ
Why: แถว audit ต้องอ่านยืนยันตัวเองได้โดยไม่ต้อง join ตาราง suggestion ที่ payload เปลี่ยนได้ — ค่า rule-based ต้องไม่ปลอมเป็นค่า AI
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

กำหนดค่าตายตัวของแถวคู่ทุกกลุ่ม SuggestionType — ผ่าน `createDecisionLog` เดียวกัน · ห้ามค่าปลอม (1.0 ลอย ๆ)

#### Retrieval hints

Hypothesis: จุดเขียนแถวคู่อยู่ใน ai-suggestion repository — ยืนยัน field mapping กับซอร์สจริง
Query: หา `AiOutput`, `rule-based`, `ModelVersion` ใน ai-suggestion repository ของ Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

ค่า confidence ปลอม (ห้าม 1.0 ลอย ๆ) · การ join ตอนอ่านทีหลังแทนการ copy · แถว log เดิม

#### Acceptance criteria

AC-011.1: แถวคู่ทุกกลุ่มมีตัวตนผู้ accept/เวลา/สถานะ CONFIRMED ครบ
AC-011.2: แถวคู่เก็บหลักฐานที่ detection ใช้จริง (AiOutput copy Payload + เวอร์ชัน/ชนิดของกฎ)

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-011.2 ด้วยการ accept จริงทุกกลุ่ม type — เทียบค่าแถวคู่กับ Payload ต้นทาง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กำหนดค่าในจุดเขียนเดียว — revert ได้ (แถวเดิม append-only ไม่แตะ)

### Task BE-crm-ai-support-P3-20 — detection threshold — แถวเดิม (ปลดล็อกแล้ว)

Objective: แถวเดิมถูกแทนด้วยงาน detection job ใน "Phase 3b amendment — CR 2026-08-18" — ผู้ใช้ยืนยันชุด threshold ครบแล้วตาม design § AI Suggestion & Learning Loop Rules ข้อ 7 (งานจริงอยู่ที่ BE-crm-ai-support-P3-23..30)
Why: แถวนี้เคยถูกบล็อกเพราะรอคำตอบ threshold — เมื่อปลดล็อกแล้ว งานจริงแตกเป็น task ชุด amendment แถวนี้จึงเป็นตัวชี้ทางเท่านั้น
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

แถวชี้ทาง — ไม่มีงานโค้ดใหม่ของตัวเอง (งานจริงครอบด้วย task P3-23..P3-30 ในกลุ่ม amendment เดียวกัน)

#### Retrieval hints

Hypothesis: งาน detection ทั้งหมด implement ใน amendment ชุด CR 2026-08-18 — ยืนยันครบทุกกฎก่อนปิดกลุ่ม
Query: หา `CRM_AI_SUGGESTION_RULE_VERSION`, `detection.service.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

โค้ดใด ๆ (แถวนี้ไม่มีงานโค้ดของตัวเอง) · threshold ที่ยืนยันแล้ว

#### Acceptance criteria

AC-011.2: ชุดเกณฑ์ของทั้ง 5 SuggestionType ถูกยืนยันและ implement ตาม design § ข้อ 7 (ผ่าน task ชุด amendment)

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยการติดตามงานจริงที่ task P3-23..P3-30 ของกลุ่มเดียวกัน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แถวชี้ทาง — ไม่มีผลต่อ runtime

### Task BE-crm-ai-support-P3-21 — accept มีผลจริงตามกติกาข้อ 6

Objective: แก้ `ai-suggestion.service.ts`/`.repository.ts` ให้ accept **มีผลจริง** (ของเดิมเป็นการตีความอนุรักษ์นิยม) — ทุกข้อในทรานแซกชันเดียวกับ `Status=ACCEPTED` + แถวคู่ log (ข้อ 4) ล้ม = rollback ทั้งก้อน ตาม design § ข้อ 6: MERGE_ISSUE/MERGE_REQUEST อ่าน `Payload.evidence_case_ids` (ว่าง → 422) เขียน `IssueId=subject_id` ตามกติกา 4 กลุ่ม (ไม่มี assessment → ข้าม / NULL → เขียน / ตรงอยู่แล้ว → ไม่ทำ / ชี้เรื่องอื่น → ห้ามเขียนทับ) สรุปผลนับลง AiOutput+response รวมได้ 0 → 422 · NEW_KNOWLEDGE สร้าง DRAFT (ห้าม APPROVED อัตโนมัติ, Title/AnswerBody จาก body ก่อน fallback Payload, เกิน 300 ตัวอักษร → 422, ห้ามรับ subject_id จาก request) · STALE_KNOWLEDGE เฉพาะ APPROVED → NEEDS_REVIEW (DRAFT/ARCHIVED → 422, NEEDS_REVIEW ซ้ำ idempotent) · ขอบร่วม: Payload parse ไม่ได้/type นอก 5 ค่า → 422 ไม่มี default branch เงียบ · สิทธิ์ก่อนทรานแซกชัน → 403 · อัปเดต update-spec ให้ตรง
Why: การ accept ต้องเปลี่ยนระบบจริงพร้อม audit ในทรานแซกชันเดียว — กติกา 4 กลุ่มกันการเขียนทับการผูกเรื่องที่คนตั้งใจไว้แล้ว
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, REQ-010, AC-010.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แก้ service/repository ของ accept — ทุก branch ตาม § ข้อ 6 ครบ 5 type · สิทธิ์ก่อนทรานแซกชัน · rollback ทั้งก้อนเมื่อส่วนใดล้ม · ไม่คำนวณ priority ในทรานแซกชัน (best-effort หลัง commit)

#### Retrieval hints

Hypothesis: โครง service/repository มีจาก task accept เดิม — ยืนยัน branch ต่อ type กับซอร์สจริงก่อนแก้
Query: หา `review`, `evidence_case_ids`, `merged`, `conflicted`, `NEEDS_REVIEW`, `$transaction` ใน ai-suggestion service ของ Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

การเขียนทับ `IssueId` ที่ชี้เรื่องอื่น (conflicted ห้ามเด็ดขาด) · `TCrmIssue` ฝั่งต้นทาง · การรับ `subject_id` จาก request · การ approve ความรู้ใหม่อัตโนมัติ

#### Acceptance criteria

AC-011.1: accept ทุก type มีผลจริง + audit คู่ในทรานแซกชันเดียว ล้ม rollback ทั้งก้อน — ไม่ auto-apply โดยไม่มีผู้รีวิว
AC-010.1: การรวมเขียน IssueId ตามกติกา 4 กลุ่ม — เคสที่ผูกเรื่องอื่นแล้วไม่ถูกทับ

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-010.1 ด้วยชุดทดสอบต่อ type ครบทุก branch (422/404/409/403/สำเร็จ) — เทียบ DB หลังทรานแซกชัน + กรณี rollback — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

แก้ service/repository เดิม — revert ได้ราย branch (ข้อมูลที่ accept ไปแล้วเป็นผลจริงของคน ไม่ย้อนอัตโนมัติ)

### Task BE-crm-ai-support-P3-22 — prerequisite: log KNOWLEDGE_MATCH จากเส้นทางตอบ QA

Objective: **prerequisite (ต้องเสร็จก่อน task detection job)**: แก้เส้นทางตอบเคส QA (จุดที่เชื่อม knowledge retrieval เข้า classify — Phase 2 เดิม, `AiCategory=QA`) ให้เขียนแถว `TCrmAiDecisionLog` ใหม่ (`SubjectType=KNOWLEDGE`, `DecisionType=KNOWLEDGE_MATCH`) ทุกครั้งที่ระบบเสนอ entry ให้ CS — `ReviewStatus=CONFIRMED` เมื่อ CS ใช้คำตอบ / `REJECTED` เมื่อ CS ตอบเอง — additive ล้วน · ถ้ายังไม่เสร็จ กฎ STALE_KNOWLEDGE ของ detection คืน 0 suggestion ไม่ใช่ error
Why: กฎ STALE_KNOWLEDGE นับจาก log REJECTED ที่เส้นทางนี้เขียน — ไม่มี log จึงไม่มีสัญญาณให้ detection ทำงาน
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008, DES-001, DEC-001
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1, Contract:CrmAiClassificationSafety.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แตะเส้นทางตอบ QA จุดเดียวแบบ additive — เขียน log เสนอ/ใช้/ไม่ใช้ · ห้ามแตะ logic จำแนกอื่น

#### Retrieval hints

Hypothesis: จุดตอบ QA อยู่ใน classify pipeline ที่ต่อ retrieval ไว้ (Phase 2) — ยืนยันจุดเขียนกับซอร์สจริงก่อนแก้
Query: หา `KNOWLEDGE_MATCH`, `AiCategory=QA`, `TCrmKnowledgeEntry` ใน classification pipeline ของ Target
Provenance: DES-008, DEC-008, DES-001, DEC-001, Contract:CrmAiLearningLoop.v1, Contract:CrmAiClassificationSafety.v1

#### Do not modify

logic จำแนกอื่นของ classify · workflow ของ `TCrmKnowledgeEntry` · แถว log เดิม

#### Acceptance criteria

AC-011.2: ทุกครั้งที่ระบบเสนอ/คนใช้/คนไม่ใช้ความรู้ มีแถว log KNOWLEDGE_MATCH สถานะตรงพฤติกรรมจริง — สัญญาณพร้อมให้ detection อ่าน

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยเคส QA จริงทั้ง 3 กรณี (เสนอ+ใช้ / เสนอ+ตอบเอง / ไม่มี entry) — เทียบแถว log — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

additive จุดเดียว — revert ได้ แต่ detection กฎ STALE_KNOWLEDGE จะคืน 0 เสมอ (เงื่อนไข prerequisite ตาม Sequencing Notes)

### Task BE-crm-ai-support-P3-23 — crm-ai-suggestion-rule constant v1

Objective: สร้างไฟล์ constant ใหม่ `src/constants/crm-ai-suggestion-rule.constant.ts` — `CRM_AI_SUGGESTION_RULE_VERSION = "v1"` เก็บ threshold ทั้ง 5 กฎเป็น versioned constant ตาม design § ข้อ 7.1
Why: ตัวเลขเกณฑ์ต้องมาจากค่าเดียวที่ bump version ได้ — กระจายในโค้ดจะแก้แล้วไม่รู้ว่าผลเก่าคำนวณด้วยกฎไหน
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

ไฟล์ constant เดียว — เก็บ threshold/หน้าต่างเวลาของ 5 กฎ + version + cooldown · ไฟล์นี้ไม่รู้จัก Prisma

#### Retrieval hints

Hypothesis: วางคู่กับ constant อื่นของโมดูลใน `src/constants/` — ยืนยัน symbol ที่ detection import จริงก่อนใช้
Query: หา `CRM_AI_SUGGESTION_RULE_VERSION`, `crm-ai-suggestion-rule.constant.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

ค่า threshold ที่ยืนยันแล้ว (แก้ = bump version) · ไฟล์ constant อื่น · schema

#### Acceptance criteria

AC-011.2: เกณฑ์และหน้าต่างเวลาของแต่ละกฎอ่านจาก constant versioned เดียว — ทุกแถวที่ตรวจพบอ้าง version ได้

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยการเทียบค่า constant กับ design § ข้อ 7.1 ทีละกฎ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ additive — แก้ค่าหลังใช้งานต้อง bump version ตามกติกา

### Task BE-crm-ai-support-P3-24 — POST /ai-suggestions/detect

Objective: เพิ่ม `POST /api/v2/support/crm-ai/ai-suggestions/detect` — endpoint กดเอง สิทธิ์ `CRM_AI_SA`/`CRM_AI_PM` ครอบด้วย Postgres advisory lock คนละ key กับ backfill กันกดซ้อน คืนจำนวนที่สร้าง/อัปเดต/ข้ามแยกตาม `SuggestionType` — ไม่เรียก Gemini เลย (rule-based ล้วน) ตาม design § ข้อ 7.4
Why: detection เป็นงานหนักที่กดเองตามจังหวะ — lock กันซ้อนและตอบสรุปรายกฎจึงคุมได้ว่ารอบนี้เกิดอะไร
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

endpoint กดเอง — advisory lock คนละ key กับ backfill (unlock ใน finally เสมอ) · ไม่มีการเรียก AI ใด · สร้างแถว PENDING เท่านั้น ไม่ auto-apply

#### Retrieval hints

Hypothesis: ค่า advisory lock ของ backfill มีอยู่แล้ว — ใช้ key คนละค่าตาม design ยืนยันก่อนใช้
Query: หา `ai-suggestions/detect`, `pg_try_advisory_lock`, `detection.service.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

key ของ backfill (คนละ key ตาม design) · การเรียก Gemini ในรอบ detect · การ auto-apply แถวใด

#### Acceptance criteria

AC-011.1: แถวที่ detect สร้างเป็น PENDING เสมอ — ห้าม auto-apply เด็ดขาด
AC-011.2: รอบกดตอบสรุปสร้าง/อัปเดต/ข้ามแยกตามกฎ — ตรวจย้อนรอบได้จริง

#### Required validation and expected evidence

ตรวจ AC-011.1/AC-011.2 ด้วยการกดจริง: สรุปรายกฎ + กดซ้อนต้องถูก lock กัน + ไม่มีการเรียก Gemini — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ (แถวที่สร้างเป็น PENDING ปกติ)

### Task BE-crm-ai-support-P3-25 — กฎ MERGE_ISSUE

Objective: implement กฎ `MERGE_ISSUE` — เคส `AiCategory=BUG` ที่ `MenuId` เดียวกัน (ไม่นับ NULL) จาก ≥3 `SchoolId` ต่างกัน (ไม่นับ NULL) ภายใน 30 วันย้อนหลัง นับเฉพาะ `DeleteDate IS NULL` ตาม design § ข้อ 7.1
Why: บั๊กเดียวกันจากหลายโรงเรียนคือสัญญาณควรรวมเป็นเรื่อง — เกณฑ์ต้องนับจากข้อมูลจริงตาม threshold ที่ยืนยัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

query กฎเดียวใน detection service — อ่านค่าเกณฑ์จาก constant ของ task ก่อนหน้า · สร้าง/อัปเดตแถว PENDING ผ่านกลไก group_key ร่วม

#### Retrieval hints

Hypothesis: โครง detection service มีจาก task endpoint — ยืนยันชื่อฟังก์ชันกฎจริงก่อนแก้
Query: หา `MERGE_ISSUE`, `detectMergeIssue`, `detection.service.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

ค่าเกณฑ์ (อ่านจาก constant เท่านั้น) · กฎอื่น · การนับเคสที่ `DeleteDate IS NOT NULL`

#### Acceptance criteria

AC-011.2: กฎ MERGE_ISSUE ตรวจตรงเกณฑ์ (≥3 โรงเรียน/เมนูเดียว/30 วัน) — ทุกแถวที่ตรวจพบมี version กฎกำกับ

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (2 โรงเรียน/3 โรงเรียน/เมนู NULL/เคสลบ/ข้าม 30 วัน) — เทียบผลตรวจพบ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กฎเป็นฟังก์ชันแยก — revert รายกฎได้

### Task BE-crm-ai-support-P3-26 — กฎ MERGE_REQUEST (MenuId-only)

Objective: implement กฎ `MERGE_REQUEST` — เคส `AiCategory=FEATURE` ≥3 เคส ที่ `MenuId` เดียวกัน (ตัด branch `ProductFeatureId` ออกตามมติผู้ใช้ 2026-08-23 ใช้ตารางปัจจุบันเท่านั้น ไม่มี DDL) กลุ่มใครกลุ่มมัน ภายใน 90 วัน — ปิดสมบูรณ์: implementation MenuId-only ใน `detection.service.ts` ตรง design ฉบับแก้ไข
Why: คำขอฟีเจอร์ซ้ำในเมนูเดียวกันคือสัญญาณรวมคำขอ — การตัด branch ProductFeatureId ทำให้เกณฑ์เป็นไปได้จริงบนตารางปัจจุบัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

query กฎเดียวใน detection service — MenuId-only เท่านั้น (มี comment อธิบายตามมติ 2026-08-23) · เกณฑ์อ่านจาก constant

#### Retrieval hints

Hypothesis: branch ProductFeatureId ถูกตัดแล้ว — ยืนยันว่า implementation ไม่เหลืออ้างอิง branch นั้น
Query: หา `MERGE_REQUEST`, `detectMergeRequest`, `ProductFeatureId` ใน detection service ของ Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

การกลับไปใช้ branch ProductFeatureId (ตัดแล้วตามมติผู้ใช้ ไม่มี DDL) · ค่าเกณฑ์ (จาก constant) · กฎอื่น

#### Acceptance criteria

AC-011.2: กฎ MERGE_REQUEST ตรวจตรงเกณฑ์ที่แก้แล้ว (≥3 เคส/เมนูเดียว/90 วัน) — ตรง design ฉบับปัจจุบันทุกข้อ

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (2/3 เคส, ข้าม 90 วัน, เมนู NULL) — เทียบผลตรวจพบ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กฎเป็นฟังก์ชันแยก — revert รายกฎได้

### Task BE-crm-ai-support-P3-27 — กฎ NEW_KNOWLEDGE

Objective: implement กฎ `NEW_KNOWLEDGE` — เคส `AiCategory=QA` ≥5 เคส ที่ `MenuId` เดียวกัน และไม่มี `TCrmKnowledgeEntry` ที่ `Status=APPROVED`+`MenuId` เดียวกัน+`SupersededById IS NULL` ภายใน 30 วัน
Why: คำถามซ้ำจากหลายโรงเรียนโดยไม่มีความรู้ครอบ = ควรเสนอเขียนความรู้ใหม่ — เงื่อนไข ไม่มี entry APPROVED กันเสนอซ้ำที่มีความรู้อยู่แล้ว
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

query กฎเดียวใน detection service — เงื่อนไข ไม่มี entry ตรวจจากตารางความรู้ตรง ๆ (APPROVED + เมนูเดียวกัน + ไม่ถูก supersede)

#### Retrieval hints

Hypothesis: field workflow ของ `TCrmKnowledgeEntry` มีจาก Phase 2 — ยืนยันเงื่อนไขกับ schema จริงก่อนเขียน
Query: หา `NEW_KNOWLEDGE`, `detectNewKnowledge`, `SupersededById` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

ค่าเกณฑ์ (จาก constant) · workflow ของตารางความรู้ · กฎอื่น

#### Acceptance criteria

AC-011.2: กฎ NEW_KNOWLEDGE ตรวจตรงเกณฑ์ (≥5 เคส/ไม่มีความรู้ APPROVED ครอบ/30 วัน) — ไม่เสนอเมื่อมีความรู้ครอบอยู่

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (4/5 เคส, มี/ไม่มี entry APPROVED, supersede) — เทียบผลตรวจพบ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กฎเป็นฟังก์ชันแยก — revert รายกฎได้

### Task BE-crm-ai-support-P3-28 — กฎ STALE_KNOWLEDGE

Objective: implement กฎ `STALE_KNOWLEDGE` — แถว `TCrmAiDecisionLog` (`SubjectType=KNOWLEDGE`, `DecisionType=KNOWLEDGE_MATCH`, `ReviewStatus=REJECTED`) ชี้ entry เดียวกัน ≥3 แถว ภายใน 90 วัน (พึ่ง prerequisite task BE-crm-ai-support-P3-22)
Why: ความรู้ที่คนไม่ใช้ซ้ำ ๆ คือความรู้ค้างสภาพ — สัญญาณมาจาก log ที่เส้นทางตอบ QA เขียนโดยตรง
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

query นับ log REJECTED ต่อ entry — ถ้าไม่มีแถว log เลย คืน 0 suggestion ไม่ใช่ error (ตามเงื่อนไข prerequisite)

#### Retrieval hints

Hypothesis: แถว log KNOWLEDGE_MATCH มีจาก task prerequisite — ยืนยันชุดค่าที่เขียนจริงก่อนนับ
Query: หา `STALE_KNOWLEDGE`, `detectStaleKnowledge`, `KNOWLEDGE_MATCH` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

แถว log (อ่านอย่างเดียว) · ค่าเกณฑ์ (จาก constant) · กฎอื่น

#### Acceptance criteria

AC-011.2: กฎ STALE_KNOWLEDGE นับเฉพาะ log REJECTED ที่ชี้ entry เดียวกันในหน้าต่างเวลา — ขาดสัญญาณคืน 0 ไม่ error

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (2/3 แถว, คนละ entry, ข้าม 90 วัน, ไม่มี log เลย) — เทียบผล — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กฎเป็นฟังก์ชันแยก — revert รายกฎได้

### Task BE-crm-ai-support-P3-29 — กฎ NEW_MENU_RELATION

Objective: implement กฎ `NEW_MENU_RELATION` — คู่เมนู (A→B) ที่คนกด `OVERRIDDEN` มิติเมนูจาก A ไปเป็น B (จาก `TCrmAiDecisionLog.AiOutput` ของแถว `MENU_CLASSIFICATION` เทียบกับ `TCrmSupport.MenuId` ปัจจุบัน) ≥5 ครั้ง นับคู่แบบไม่สนลำดับ ภายใน 60 วัน
Why: การแก้เมนูที่ AI เสนอซ้ำ ๆ ทางเดียวกันคือสัญญาณความสัมพันธ์ที่ระบบยังไม่รู้ — เสนอเป็นแถวรอยืนยัน ไม่ตัดสินแทนคน
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

query อ่าน `AiOutput` ของแถว MENU_CLASSIFICATION + สถานะเมนูปัจจุบัน — นับคู่ไม่สนลำดับ · สร้างแถว PENDING ผ่านกลไก group_key ร่วม

#### Retrieval hints

Hypothesis: โครง `AiOutput` ของแถว log เมนูมีจาก task P1-20 — ยืนยันรูปแบบ JSON จริงก่อน parse
Query: หา `NEW_MENU_RELATION`, `detectNewMenuRelation`, `MENU_CLASSIFICATION` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

แถว log (อ่านอย่างเดียว) · ค่าเกณฑ์ (จาก constant) · การสร้างแถวความสัมพันธ์โดยตรง (ต้องผ่าน accept เสมอ)

#### Acceptance criteria

AC-011.2: กฎ NEW_MENU_RELATION นับคู่จากการ override จริงตามเกณฑ์ (≥5 ครั้ง/60 วัน) — เสนอเป็นแถวรอ ไม่มีผลจริงเอง

#### Required validation and expected evidence

ตรวจ AC-011.2 ด้วยชุดข้อมูลขอบ (4/5 ครั้ง, คู่กลับทาง, ข้าม 60 วัน) — เทียบผล — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กฎเป็นฟังก์ชันแยก — revert รายกฎได้

### Task BE-crm-ai-support-P3-30 — กันแถวซ้ำ group_key + cooldown

Objective: กันแถวซ้ำของ detection: ทุกแถวมี `Payload.group_key` คงที่ (เช่น `MERGE_ISSUE:menu=123`, `NEW_MENU_RELATION:menu=12+34` เรียงเลขน้อยไปมาก) — มีแถว `PENDING` + `group_key` เดียวกันอยู่แล้ว → อัปเดต `Payload` แทนสร้างใหม่ (ไม่แตะ `CreateDate`) · กลุ่มที่เคย `REJECTED` ภายใน `CRM_AI_SUGGESTION_REJECT_COOLDOWN_DAYS` (90 วัน) → ห้ามสร้างซ้ำ · `Payload` ต้องมีอย่างน้อย `group_key`/`evidence_case_ids` (หรือ `knowledge_entry_id` สำหรับ STALE_KNOWLEDGE)/`rule_version`/`detected_at`/ตัวเลขเกณฑ์ ตาม design § ข้อ 7.3
Why: กด detect รอบต่อรอบต้องไม่แตกแถวซ้ำและต้องเคารพการปฏิเสธของคน — ไม่งั้น inbox ล้นและคนรู้สึกถูกถามซ้ำ
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, AC-011.2, AC-011.3, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

กลไกกลางของ detection ทุกกฎ — อัปเดต Payload บนแถว PENDING เดิม · cooldown 90 วันจาก constant · Payload ขั้นต่ำตามสัญญา

#### Retrieval hints

Hypothesis: กฎทั้ง 5 เรียกกลไกสร้าง/อัปเดตร่วมกัน — ยืนยันจุดรวมใน detection service ก่อนแก้
Query: หา `group_key`, `REJECT_COOLDOWN_DAYS`, `rule_version`, `detected_at` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

`CreateDate` ของแถว PENDING เดิม (ห้ามแตะ) · แถวที่ตัดสินแล้ว · ค่า cooldown (จาก constant)

#### Acceptance criteria

AC-011.2: ทุกแถวมี Payload ครบขั้นต่ำและ group_key คงที่ — ตรวจย้อนว่ากฎ/รอบไหนตรวจพบได้
AC-011.3: กลุ่มที่คนปฏิเสธไปแล้วไม่ถูกเสนอใหม่ภายใน 90 วัน — แถว PENDING เดิมถูกอัปเดตแทนการสร้างซ้ำ

#### Required validation and expected evidence

ตรวจ AC-011.2/AC-011.3 ด้วยการกด detect ซ้ำจริง: แถวรวมไม่แตก + เมื่อ reject แล้วกดใหม่ภายใน cooldown ต้องไม่สร้าง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

กลไกกลางของ detection — revert ได้ (แถวที่สร้างแล้วเป็นข้อมูล PENDING ปกติ)

### Task FE-crm-ai-support-P3-10 — เมนู กล่องข้อเสนอ AI

Objective: เพิ่มเมนู "กล่องข้อเสนอ AI" (`news: true`) ใน `sidebar-component.tsx`
Why: inbox ข้อเสนอต้องมีทางเข้าจากเมนูปกติสำหรับ reviewer ทุกบทบาท
Owner: frontend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-008, DEC-008

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-011.1: ทางเข้ากล่องข้อเสนอปรากฏบนเมนูและพาไปถึงหน้า inbox จริง

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P3-11 — scaffold ai-suggestions inbox page

Objective: scaffold `src/app/pages/support/crm-ai/ai-suggestions/page.tsx` (Support Lead/SA/PM-facing inbox, กรองตาม role ที่มีสิทธิ์ตัดสินใจ `SuggestionType` นั้น)
Why: inbox แสดงข้อเสนอที่ตัวเองมีสิทธิ์ตัดสิน — ลดคิวที่กดไม่ได้ปนมาให้เห็น
Owner: frontend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — กรองตามบทบาทผู้ใช้ที่ log in · ตาราง/drawer แตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/ai-suggestions` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `crm-ai/ai-suggestions/page.tsx`, `useHasPermission` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · permission constant

#### Acceptance criteria

AC-011.1: inbox เปิดได้จริงและกรองข้อเสนอตามสิทธิ์ตัดสินของผู้ใช้

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วยบัญชีแต่ละบทบาทเทียบรายการที่เห็น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-12 — ai-suggestion table + detail drawer

Objective: `_components/ai-suggestion-table.component.tsx`, `_components/ai-suggestion-detail-drawer.component.tsx` (แสดง `Payload` JSON แบบอ่านง่าย + ปุ่ม accept/reject ใช้ `StatusModalComponent`)
Why: reviewer ต้องเห็นหลักฐานใน Payload ก่อนตัดสิน — ปุ่มตัดสินผ่าน modal มาตรฐานเดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + drawer — render Payload ให้อ่านง่าย (ไม่แก้ข้อมูลต้นทาง)

#### Retrieval hints

Hypothesis: component กลาง (table/StatusModalComponent) มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `ai-suggestion-table.component.tsx`, `ai-suggestion-detail-drawer.component.tsx` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-011.1: reviewer เห็นหลักฐาน/เกณฑ์ของข้อเสนอครบและกด accept/reject ผ่าน modal ได้จริง

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วยการเปิด drawer จริง + กดตัดสินผ่าน modal — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-13 — ai-suggestion store + service

Objective: `_stores/use-ai-suggestion-store.ts`, `_api/ai-suggestion-service.ts`
Why: state และการเรียก API ของ inbox รวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-011, AC-011.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmAiLearningLoop.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า ai-suggestions — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `use-ai-suggestion-store.ts`, `ai-suggestion-service.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmAiLearningLoop.v1

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-011.1: inbox โหลด/ส่งการตัดสินผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-011.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P3-14 — ผูกสิทธิ์หน้า inbox

Objective: ผูกสิทธิ์เข้า `src/app/pages/admin/permission/page.tsx`
Why: หน้า inbox ต้องควบคุมสิทธิ์จากหน้า permission กลางด้วยค่าเดิมของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

ผูก label/ค่า permission เข้าหน้า permission — reuse constant เดิม

#### Retrieval hints

Hypothesis: constant จากเฟสก่อนหน้ามีอยู่แล้ว — ยืนยัน label ก่อนแก้
Query: หา `admin/permission/page.tsx`, `CRM_AI_SUGGESTION_REVIEWERS` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission constant (ห้ามเพิ่มใหม่) · หน้า workflow อื่น · guard ฝั่ง API

#### Acceptance criteria

AC-016.2: สิทธิ์เข้าถึง inbox ควบคุมจากหน้า permission กลางด้วยค่าเดิม — ไม่มี constant ซ้ำ

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้

## Phase 4: Queue Interrupt & Customer Promise

### Task BE-crm-ai-support-P4-01 — ตรวจ model TCrmQueueInterrupt

Objective: ตรวจ model `TCrmQueueInterrupt` ตรงกับ § Data Model — สังเกต `ApprovedBy`/`Decision` เป็น `NOT NULL` ระดับ schema ทั้งคู่ แถวถูกสร้างหลังตัดสินใจแล้วเท่านั้น (ไม่มี state รออนุมัติ) — form ฝั่ง frontend รวบ justification + การตัดสินใจใน submit เดียว ไม่ออกแบบ 2 ขั้นคนละ endpoint — **ไม่เขียนแถว `TCrmAiDecisionLog` เลยไม่ว่ากรณีใด** (การอนุมัติแทรกคิวเป็นการตัดสินของคนล้วน ไม่มี `SubjectType=QUEUE_INTERRUPT` — audit ครบในคอลัมน์ของตารางเอง)
Why: ข้อจำกัด NOT NULL และการไม่มี SubjectType เป็นเจตนาของ design — เข้าใจผิดตั้งแต่โครงจะแตกทั้ง endpoint และฟอร์ม
Owner: backend-engineer
Depends on: none
Traceability: REQ-012, AC-012.2, AC-012.3, DES-009, DEC-009
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

งานยืนยัน mapping/schema เท่านั้น — บันทึกข้อสรุปเรื่อง NOT NULL + ห้ามเขียน decision log ให้งานถัดไปใช้

#### Retrieval hints

Hypothesis: ตารางมีอยู่จริงจาก DDL — เทียบกับ § Data Model ทีละ field ก่อนปิดงาน
Query: หา `model TCrmQueueInterrupt`, `ApprovedBy`, `BumpedItems` ใน schema
Provenance: DES-009, DEC-009

#### Do not modify

DDL/ตารางใน DB · model อื่น · `TCrmAiDecisionLog` (ห้ามเขียนจาก flow นี้เด็ดขาด)

#### Acceptance criteria

AC-012.2: โครงตารางบังคับผู้อนุมัติ+การตัดสินใจระดับ schema — ไม่มีแถวที่อนุมัติโดยไม่ระบุตัวตนได้
AC-012.3: โครงตารางผูกกับ `TCrmIssue` ผ่าน `CrmIssueId` (NOT NULL) ตาม § Data Model

#### Required validation and expected evidence

ตรวจ AC-012.2/AC-012.3 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema

### Task BE-crm-ai-support-P4-02 — POST /queue-interrupts

Objective: เพิ่ม `POST /api/v2/support/crm-ai/queue-interrupts` — บันทึกคำขอ+ผลตัดสินใจพร้อมกัน (`CRM_AI_PM`) — validate `CrmIssueId` มีอยู่จริงใน `TCrmIssue`, บังคับ `BusinessJustification`/`ApprovedBy` ตาม design § Queue Interrupt Rules ข้อ 1, 3
Why: ตารางไม่มี state รออนุมัติ — บันทึกคำขอและผลตัดสินต้องเป็นทรานแซกชันเดียวจึงไม่มีแถวค้างครึ่ง
Owner: backend-engineer
Depends on: none
Traceability: REQ-012, AC-012.1, AC-012.2, AC-012.3, DES-009, DEC-009
Produces: Contract:CrmAiQueueInterrupt.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern โมดูล — guard `CRM_AI_PM` · เรื่องต้องมีจริง (404) · ตัวตนผู้ขอจาก session (401 ถ้าไม่มี) · ค่า decision นอก APPROVED/REJECTED ถูก Zod ปฏิเสธก่อน service

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/queue-interrupts/` — ยืนยัน guard/field บังคับที่ implement จริง
Query: หา `queue-interrupts/route.ts`, `BusinessJustification`, `ApprovedBy` ใน Target
Provenance: DES-009, DEC-009, Contract:CrmAiQueueInterrupt.v1

#### Do not modify

`TCrmAiDecisionLog` (ห้ามเขียนเด็ดขาด) · schema · การรับ school_count จาก client (ห้าม — snapshot เป็นของ task ถัดไป)

#### Acceptance criteria

AC-012.1: คำขอแทรกคิวเก็บต้นทุนก่อนอนุมัติครบ (justification/bumped items/วันล่าช้า)
AC-012.2: ทุกแถวมี `ApprovedBy` + `Decision` — ไม่มีคำขออนุมัติโดยไม่ระบุผู้อนุมัติ
AC-012.3: ทุกคำขอผูกกับเรื่องที่มีอยู่จริง — เรื่องไม่มีจริงถูกปฏิเสธ 404

#### Required validation and expected evidence

ตรวจ AC-012.1/AC-012.2/AC-012.3 ด้วย dev server: บันทึกสำเร็จครบ field + 403/401/404 ตามกรณี + Zod ปฏิเสธค่าผิด — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-03 — GET /queue-interrupts list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/queue-interrupts` — list พร้อม pagination + filter (`CrmIssueId`/`Decision`)
Why: สรุปเป็นรอบต้อง query ตรงจากตาราง (ไม่มีตารางสรุปแยกตาม design) — list จึงต้องกรองตามมิติที่ใช้สรุปได้
Owner: backend-engineer
Depends on: none
Traceability: REQ-012, AC-012.1, DES-009, DEC-009
Produces: none
Consumes: Contract:CrmAiQueueInterrupt.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination + filter 2 field ตาม pattern โมดูล

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน filter field กับ schema จริง
Query: หา `queue-interrupts/route.ts`, `buildPagination` ใน Target
Provenance: DES-009, DEC-009, Contract:CrmAiQueueInterrupt.v1

#### Do not modify

แถวคำขอ (อ่านอย่างเดียว) · schema · `TCrmAiDecisionLog`

#### Acceptance criteria

AC-012.1: อ่านรายการคำขอแบ่งหน้า/กรองได้จริง — ข้อมูลตรงตารางรวม snapshot ที่เก็บไว้

#### Required validation and expected evidence

ตรวจ AC-012.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-04 — BumpedItems snapshot ตอน POST

Objective: สร้าง `BumpedItems` (JSON snapshot งานที่กำลังถูกเบียด ณ ตอนขอจริง) ที่ service layer ตอน `POST` — ห้ามคำนวณย้อนหลังทีหลัง ตาม design § Queue Interrupt Rules ข้อ 2
Why: ต้นทุนก่อนอนุมัติต้องเป็นภาพจริง ณ ตอนขอ — คำนวณย้อนหลังจะได้ภาพที่เปลี่ยนไปแล้ว (DEC-009 ห้ามรับ school_count จาก client)
Owner: backend-engineer
Depends on: none
Traceability: REQ-012, AC-012.1, DES-009, DEC-009
Produces: none
Consumes: Contract:CrmAiQueueInterrupt.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ประกอบ snapshot ใน service ตอน POST — school_count คำนวณฝั่ง server จาก `TCrmSupport` ปัจจุบัน · เก็บครั้งเดียวไม่แก้ย้อน

#### Retrieval hints

Hypothesis: ข้อมูลคิวงานที่ถูกเบียดมาจากข้อมูลที่มี ณ ตอนขอ — ยืนยันแหล่งข้อมูลที่ใช้จริงก่อนเขียน
Query: หา `BumpedItems`, `school_count`, `queue-interrupts` service ใน Target
Provenance: DES-009, DEC-009, Contract:CrmAiQueueInterrupt.v1

#### Do not modify

การรับค่า snapshot จาก request body (ห้าม) · แถวที่บันทึกแล้ว (snapshot ห้ามแก้ย้อน) · `TCrmAiDecisionLog`

#### Acceptance criteria

AC-012.1: `BumpedItems` เป็น snapshot ของจริง ณ ตอนขอ — อ่านย้อนหลังการอนุมัติได้ตามภาพเวลานั้น

#### Required validation and expected evidence

ตรวจ AC-012.1 ด้วยการ POST จริง 2 ช่วงเวลา — เทียบ snapshot ที่เก็บต่างกันตามข้อมูลจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

logic ใน service ของ endpoint เดียว — revert ได้ (แถวที่เก็บแล้วคงค่า snapshot)

### Task FE-crm-ai-support-P4-01 — เมนู คำขอแทรกคิวงาน

Objective: เพิ่มเมนู "คำขอแทรกคิวงาน" (`news: true`) ใน `sidebar-component.tsx`
Why: PM ต้องเข้าถึงฟอร์มแทรกคิวจากเมนูปกติ
Owner: frontend-engineer
Depends on: none
Traceability: REQ-012, AC-012.1, DES-009, DEC-009
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-009, DEC-009

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-012.1: ทางเข้าคำขอแทรกคิวปรากฏบนเมนูและพาไปถึงหน้าจริง

#### Required validation and expected evidence

ตรวจ AC-012.1 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P4-02 — scaffold queue-interrupts page

Objective: scaffold `src/app/pages/support/crm-ai/queue-interrupts/page.tsx` (PM-facing — ฟอร์มเดียวกรอก justification + ตัดสินใจ, ตาราง history)
Why: ฟอร์มเดียวจบตรงกับข้อจำกัด schema (บันทึกคำขอ+ตัดสินพร้อมกัน) — ออกแบบ 2 ขั้นจะขัด NOT NULL ทันที
Owner: frontend-engineer
Depends on: none
Traceability: REQ-012, AC-012.2, DES-009, DEC-009
Produces: none
Consumes: Contract:CrmAiQueueInterrupt.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — ฟอร์มเดียวรวม justification + ผลตัดสิน · ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/queue-interrupts` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `crm-ai/queue-interrupts/page.tsx` ใน Target
Provenance: DES-009, DEC-009, Contract:CrmAiQueueInterrupt.v1

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · การแตกฟอร์มเป็น 2 ขั้น (ขัด schema)

#### Acceptance criteria

AC-012.2: หน้าแทรกคิวเปิดได้จริงด้วยฟอร์มเดียวจบ — พร้อมต่อ API บันทึกคำขอ+ตัดสินพร้อมกัน

#### Required validation and expected evidence

ตรวจ AC-012.2 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-03 — queue-interrupt table + form modal

Objective: `_components/queue-interrupt-table.component.tsx`, `_components/queue-interrupt-form-modal.component.tsx`
Why: บันทึกคำขอ+ตัดสินพร้อมกันผ่าน Form Workflow มาตรฐาน — ตาราง history แสดง snapshot ที่เก็บไว้
Owner: frontend-engineer
Depends on: none
Traceability: REQ-012, AC-012.1, DES-009, DEC-009
Produces: none
Consumes: Contract:CrmAiQueueInterrupt.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal เดียวจบ — ส่งครั้งเดียวต่อคำขอ

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `queue-interrupt-table.component.tsx`, `queue-interrupt-form-modal.component.tsx` ใน Target
Provenance: DES-009, DEC-009, Contract:CrmAiQueueInterrupt.v1

#### Do not modify

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-012.1: กรอกคำขอ/ดูประวัติผ่านหน้าจอได้จริง — ฟอร์มรวบ justification+ตัดสินใน submit เดียว

#### Required validation and expected evidence

ตรวจ AC-012.1 ด้วยการกรอกจริงผ่าน modal — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-04 — queue-interrupt store + service

Objective: `_stores/use-queue-interrupt-store.ts`, `_api/queue-interrupt-service.ts`
Why: state และการเรียก API ของหน้าแทรกคิวรวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-012, AC-012.1, DES-009, DEC-009
Produces: none
Consumes: Contract:CrmAiQueueInterrupt.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า queue-interrupts — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `use-queue-interrupt-store.ts`, `queue-interrupt-service.ts` ใน Target
Provenance: DES-009, DEC-009, Contract:CrmAiQueueInterrupt.v1

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-012.1: หน้าแทรกคิวโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-012.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-05 — ผูกสิทธิ์หน้าแทรกคิว

Objective: ผูกสิทธิ์เข้า `src/app/pages/admin/permission/page.tsx`
Why: หน้าแทรกคิวควบคุมสิทธิ์จากหน้า permission กลางด้วยค่าเดิมของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

ผูก label/ค่า permission เข้าหน้า permission — reuse constant เดิม (Phase 3 เพิ่ม CRM_AI_PM ไว้แล้ว)

#### Retrieval hints

Hypothesis: constant มีอยู่แล้วจากเฟสก่อน — ยืนยัน label ก่อนแก้
Query: หา `admin/permission/page.tsx`, `CRM_AI_PM` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission constant (ห้ามเพิ่มใหม่) · หน้า workflow อื่น · guard ฝั่ง API

#### Acceptance criteria

AC-016.2: สิทธิ์เข้าถึงหน้าแทรกคิวควบคุมจากหน้า permission กลางด้วยค่าเดิม

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้

### Task BE-crm-ai-support-P4-05 — ตรวจ model TCrmCustomerPromise

Objective: ตรวจ model `TCrmCustomerPromise` ตรงกับ § Data Model
Why: คำสัญญาลูกค้าเป็นข้อมูล Sales-facing — โครงตารางต้องตรง design ก่อน endpoints อ้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-015, AC-015.1, DES-010, DEC-010
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

งานยืนยัน mapping/schema เท่านั้น — ไม่มี DDL ใหม่ (ตารางมีอยู่จริง)

#### Retrieval hints

Hypothesis: ตารางมีอยู่จริงจาก DDL — เทียบกับ § Data Model ทีละ field ก่อนปิดงาน
Query: หา `model TCrmCustomerPromise`, `ContractRenewalAlertDate`, `PromiseType` ใน schema
Provenance: DES-010, DEC-010

#### Do not modify

DDL/ตารางใน DB · model อื่น · การเพิ่ม field นอก § Data Model

#### Acceptance criteria

AC-015.1: โครงตารางรองรับ `PromiseType` 5 ค่าและผูกกับฟีเจอร์/เมนูได้ — ตรง § Data Model

#### Required validation and expected evidence

ตรวจ AC-015.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema

### Task BE-crm-ai-support-P4-06 — POST /customer-promises (SALES)

Objective: เพิ่ม `POST /api/v2/support/crm-ai/customer-promises` — บันทึกคำมั่นสัญญา (`CRM_AI_SALES`) — validate `SchoolId` ผ่าน `TCompany.nCompany`, เมื่อ `PromiseType=FEATURE` แนะนำ (ไม่บังคับ schema) ให้กรอก `MenuId` หรือ `ProductFeatureId` อย่างใดอย่างหนึ่งที่ app layer ตาม design § Customer Promise Rules ข้อ 1
Why: Sales ต้องบันทึกคำสัญญาทันทีตอนขาย — ตัวตนผู้สัญญามาจาก session และโรงเรียนต้องมีจริงจึงไม่เกิดคำสัญญาลอย
Owner: backend-engineer
Depends on: none
Traceability: REQ-015, AC-015.1, DES-010, DEC-010
Produces: Contract:CrmAiCustomerPromise.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern โมดูล — guard `CRM_AI_SALES` · `PromisedBy` จาก session ไม่รับจาก payload · school ไม่มีจริง → 404

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/customer-promises/` — ยืนยัน guard/การตรวจ school กับซอร์สจริง
Query: หา `customer-promises/route.ts`, `CRM_AI_SALES`, `TCompany`, `nCompany` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

schema · การรับ `PromisedBy` จาก payload (ห้าม) · permission constant

#### Acceptance criteria

AC-015.1: บันทึกคำสัญญาทันทีได้จริง — `PromiseType` ใน 5 ค่าที่กำหนด ผูกฟีเจอร์/เมนูได้เมื่อเกี่ยวข้อง

#### Required validation and expected evidence

ตรวจ AC-015.1 ด้วย dev server: บันทึกสำเร็จ + 403 non-Sales + 404 school ไม่มีจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-07 — GET /customer-promises list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/customer-promises` — list พร้อม pagination + filter (`SchoolId`/`Status`/`TargetDate`)
Why: Sales ทบทวนคำสัญญาที่ตัวเองเคยบันทึกได้จาก API เดียว
Owner: backend-engineer
Depends on: none
Traceability: REQ-015, AC-015.1, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination + filter 3 field ตาม pattern โมดูล

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน filter field กับ schema จริง
Query: หา `customer-promises/route.ts`, `buildPagination` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

แถวคำสัญญา (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-015.1: อ่านรายการคำสัญญาแบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

#### Required validation and expected evidence

ตรวจ AC-015.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-08 — GET /customer-promises/renewal-alerts

Objective: เพิ่ม `GET /api/v2/support/crm-ai/customer-promises/renewal-alerts` — query แยกสำหรับหน้ารายการเตือนต่อสัญญา (`Status=PENDING AND ContractRenewalAlertDate IS NOT NULL`, เรียงใกล้ถึงก่อน)
Why: รายการเตือนเป็น upcoming view ที่ Sales เปิดดูเอง (pull) — query แยกจึงไม่ปน list หลักและไม่มี job แจ้งเตือน
Owner: backend-engineer
Depends on: none
Traceability: REQ-015, AC-015.2, AC-015.3, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — upcoming view ตามนิยามที่ยืนยัน 2026-08-23 (PENDING + มีวันเตือน เรียง asc) · ไม่มี job/การแจ้งอัตโนมัติ

#### Retrieval hints

Hypothesis: query แยกอยู่ใน repository เดียวกับ list — ยืนยัน where/orderBy จริงก่อนใช้
Query: หา `renewal-alerts`, `findRenewalAlerts`, `ContractRenewalAlertDate` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

การสร้าง job/อีเมลแจ้งเตือน (นอก scope ตามมติ) · แถวที่ Sales ไม่กรอกวัน (ไม่มีการเตือนตลอดไป — ผลที่ยอมรับแล้ว) · schema

#### Acceptance criteria

AC-015.2: รายการเตือนแสดงคำสัญญา PENDING ที่มีวันเตือนเรียงใกล้ถึงก่อนจริง
AC-015.3: แถวที่ไม่ได้กรอกวันเตือนไม่ปรากฏในรายการ — ผลที่ยอมรับแล้ว ไม่มีการแจ้งอัตโนมัติ

#### Required validation and expected evidence

ตรวจ AC-015.2/AC-015.3 ด้วยชุดข้อมูล: PENDING/ปิดแล้ว × มี/ไม่มีวันเตือน — เทียบรายการและลำดับ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-09 — PATCH /customer-promises/[id] สถานะด้วยมือ

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/customer-promises/[id]` — แก้ `Status` ด้วยมือ (`FULFILLED`/`BROKEN`/`EXPIRED`) — ไม่มี auto job ปิดสถานะในรอบนี้ ตาม design § Customer Promise Rules ข้อ 3
Why: สถานะคำสัญญาเป็นการตัดสินของ Sales — ปิดอัตโนมัติจะสร้างสถานะที่ไม่มีคนรับผิดชอบ
Owner: backend-engineer
Depends on: none
Traceability: REQ-015, AC-015.1, AC-015.2, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

update สถานะด้วยมือในชุด 3 ค่า — ไม่มี job ใด · ค่าสถานะถูก Zod ปฏิเสธก่อน service

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยันชุดค่าที่ implement จริง
Query: หา `customer-promises/[id]`, `FULFILLED`, `BROKEN`, `EXPIRED` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

การสร้าง auto job ปิดสถานะ (นอก scope) · schema · endpoint อื่น

#### Acceptance criteria

AC-015.1: สถานะเปลี่ยนด้วยมือภายในชุดค่าที่กำหนด — ไม่มีเส้นทางอัตโนมัติ
AC-015.2: คำสัญญา PENDING ที่ทำจริงแล้วปิดได้จริงจนหลุดรายการเตือน

#### Required validation and expected evidence

ตรวจ AC-015.1/AC-015.2 ด้วย dev server: เปลี่ยนสถานะทุกค่า + เทียบรายการเตือนหลังเปลี่ยน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-10 — ContractRenewalAlertDate กรอกเอง + validate อนาคต

Objective: ปลดล็อกแล้ว (2026-08-18): `ContractRenewalAlertDate` **ไม่มีสูตรคำนวณ — Sales กรอกวันที่เอง** เสมอ (ห้ามอนุมานจาก `TargetDate`/`PromisedDate`) คอลัมน์ nullable/ไม่บังคับ — ที่ `POST`/`PATCH` เพิ่ม validation: ถ้ากรอกต้องเป็นวันที่**ในอนาคตนับจากวันที่บันทึก** ไม่งั้น `AppError(422)` (ยืนยันว่า `GET .../renewal-alerts` เป็นรายการ pull ตามที่ต้องการแล้ว ไม่ต้องมี job เพิ่ม)
Why: ระบบไม่มีวันหมดสัญญาเก็บอยู่เลยจึงคำนวณอัตโนมัติไม่ได้ (มติ 2026-08-18) — validate วันอนาคตกันข้อมูลเตือนที่ผ่านมาแล้วตั้งแต่ปากทาง
Owner: backend-engineer
Depends on: none
Traceability: REQ-015, AC-015.2, AC-015.3, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

validation ที่ POST/PATCH เดิม — nullable ไม่บังคับ · วันปัจจุบัน/ย้อนหลัง → 422 · ห้าม default วันแทน Sales

#### Retrieval hints

Hypothesis: จุด validate อยู่ใน Zod schema/service ของ area เดียวกัน — ยืนยันเงื่อนไขที่ implement จริงก่อนแก้
Query: หา `ContractRenewalAlertDate`, `AppError(422)`, `customer-promise.service` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

การอนุมานวันจาก field อื่น (ห้ามตาม DEC-010) · การบังคับกรอก (nullable คงเดิม) · schema

#### Acceptance criteria

AC-015.2: วันเตือนมาจาก Sales เท่านั้น — กรอกอดีต/วันนี้ถูกปฏิเสธ 422
AC-015.3: ไม่กรอกได้ — แถวนั้นไม่มีการเตือนใดตลอดไป (ผลที่ยอมรับแล้ว)

#### Required validation and expected evidence

ตรวจ AC-015.2/AC-015.3 ด้วย dev server: กรอกอนาคตผ่าน / อดีต-วันนี้ 422 / ไม่กรอกผ่าน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

validation เพิ่มที่ schema/service — revert ได้ (แถวเก่าที่ผ่านมาแล้วไม่ถูกตรวจย้อน)

### Task BE-crm-ai-support-P4-11 — ตรวจ model TCrmStaffRole

Objective: ตรวจ model `TCrmStaffRole` ตรงกับ § Data Model
Why: บทบาทหน้าที่ใช้มอบหมายงาน/แสดงรายชื่อ — โครงตารางต้องตรง design ก่อน endpoints/งาน sync อ้าง
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

งานยืนยัน mapping/schema เท่านั้น — ไม่มี DDL ใหม่ (ตารางมีอยู่จริง)

#### Retrieval hints

Hypothesis: ตารางมีอยู่จริงจาก DDL — เทียบกับ § Data Model ทีละ field ก่อนปิดงาน
Query: หา `model TCrmStaffRole`, `FunctionalRole`, `Active` ใน schema
Provenance: DES-006, DEC-006

#### Do not modify

DDL/ตารางใน DB · model อื่น · การเพิ่ม unique constraint บน AdminId+FunctionalRole (ห้าม — ขัด DEC-006)

#### Acceptance criteria

AC-016.1: โครงตารางรองรับหลายแถวต่อคน — `FunctionalRole` ครบ 6 ค่าที่กำหนด

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วยการเทียบ schema กับ § Data Model ทีละ field — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

งานยืนยัน — ไม่มีผลข้างเคียงถ้าไม่แก้ schema

### Task BE-crm-ai-support-P4-12 — POST /staff-roles (PM)

Objective: เพิ่ม `POST /api/v2/support/crm-ai/staff-roles` — assign functional role ให้ admin คนหนึ่ง (`CRM_AI_PM`) — อนุญาตหลายแถวต่อ `AdminId` ตาม design (คนละความหมายกับ Timesheet `User.role_id`)
Why: หนึ่งคนถือได้หลายบทบาท — ห้ามอาศัย unique ต่อคนและห้ามสับสนกับระบบ role ของ Timesheet
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, AC-016.3, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

route/service ตาม pattern โมดูล — guard `CRM_AI_PM` · หลายแถวต่อ AdminId ได้ · ไม่เพิ่ม constraint ใด

#### Retrieval hints

Hypothesis: route อยู่ใต้ `crm-ai/staff-roles/` — ยืนยัน guard/field ที่ implement จริง
Query: หา `staff-roles/route.ts`, `CRM_AI_PM`, `AdminId` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

unique constraint ใหม่ (ห้ามเพิ่มเอง) · Timesheet `User.role_id` (คนละความหมาย) · schema

#### Acceptance criteria

AC-016.1: assign หลายบทบาทให้คนเดียวได้จริง — แต่ละแถว FunctionalRole ใน 6 ค่าที่กำหนด
AC-016.3: ผู้ใช้ที่ยังไม่มีสิทธิ์ CRM AI จะไม่มีแถวบทบาทเกิดขึ้นผ่าน flow ปกติ (derive จากสิทธิ์)

#### Required validation and expected evidence

ตรวจ AC-016.1/AC-016.3 ด้วย dev server: assign สำเร็จ + หลายแถวต่อคน + 403 non-PM — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-13 — GET /staff-roles list

Objective: เพิ่ม `GET /api/v2/support/crm-ai/staff-roles` — list พร้อม pagination + filter (`AdminId`/`FunctionalRole`/`Active`)
Why: มอบหมายงาน/แสดงรายชื่อต้องอ่านรายการกรองตามคน/บทบาท/สถานะได้จาก API เดียว
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

read endpoint — pagination + filter 3 field ตาม pattern โมดูล

#### Retrieval hints

Hypothesis: route คู่กับ POST — ยืนยัน filter field กับ schema จริง
Query: หา `staff-roles/route.ts`, `buildPagination` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

แถวบทบาท (อ่านอย่างเดียว) · schema · endpoint อื่น

#### Acceptance criteria

AC-016.1: อ่านรายการบทบาทแบ่งหน้า/กรองได้จริง — ตรงข้อมูลตาราง

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วย dev server: filter/pagination ทำงานจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-14 — PATCH /staff-roles/[id] toggle Active

Objective: เพิ่ม `PATCH /api/v2/support/crm-ai/staff-roles/[id]` — toggle `Active`
Why: ปิดบทบาทด้วย `Active=false` ไม่ลบแถว — ประวัติการถือบทบาทคงอยู่ (แถวเดิมของเฟส ก่อนงาน derive ทางเดียวภายหลัง)
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

toggle ค่า `Active` เท่านั้น — ห้ามลบแถว (คงธรรมเนียม ถอน = Active=false ของ DES-006)

#### Retrieval hints

Hypothesis: route `[id]/route.ts` ตาม pattern โมดูล — ยืนยัน field ที่ implement จริงก่อนแก้
Query: หา `staff-roles/[id]`, `Active` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

การลบแถว (ห้าม) · การเขียน `AssignedBy`/`AssignedAt` จาก endpoint นี้ (เป็นของ flow sync) · schema

#### Acceptance criteria

AC-016.1: ปิด/เปิดบทบาทรายแถวได้จริง — แถวคงอยู่ (ไม่ลบ) อ่านประวัติย้อนได้

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วย dev server: toggle จริง + ยืนยันแถวไม่ถูกลบ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-06 — เมนู คำมั่นสัญญาลูกค้า

Objective: เพิ่มเมนู "คำมั่นสัญญาลูกค้า" (`news: true`) ใน `sidebar-component.tsx`
Why: Sales ต้องเข้าถึงฟอร์มบันทึกคำสัญญาจากเมนูปกติ
Owner: frontend-engineer
Depends on: none
Traceability: REQ-015, AC-015.2, DES-010, DEC-010
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-010, DEC-010

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-015.2: ทางเข้าคำมั่นสัญญาปรากฏบนเมนูและพาไปถึงหน้าจริง

#### Required validation and expected evidence

ตรวจ AC-015.2 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P4-07 — scaffold customer-promises page

Objective: scaffold `src/app/pages/support/crm-ai/customer-promises/page.tsx` (Sales-facing — ฟอร์มบันทึก + ตารางหลัก + tab/filter "ใกล้ถึงกำหนดเตือนต่อสัญญา")
Why: หน้าเดียวรวมการบันทึกและรายการเตือน — Sales เปิดดูเองตาม upcoming view ที่ยืนยัน
Owner: frontend-engineer
Depends on: none
Traceability: REQ-015, AC-015.2, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า — tab/filter เตือนต่อสัญญาอ่านจาก renewal-alerts endpoint · ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `crm-ai/customer-promises` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `crm-ai/customer-promises/page.tsx`, `renewal-alerts` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · permission constant

#### Acceptance criteria

AC-015.2: หน้าคำมั่นสัญญาเปิดได้จริง — มีทางเข้ารายการเตือนต่อสัญญาแบบเปิดดูเอง

#### Required validation and expected evidence

ตรวจ AC-015.2 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-08 — customer-promise table + form (date picker)

Objective: `_components/customer-promise-table.component.tsx`, `_components/customer-promise-form-modal.component.tsx` — ฟอร์มมีช่อง `ContractRenewalAlertDate` เป็น date picker แบบไม่บังคับ (nullable) พร้อม client-side validate ว่าต้องเป็นวันในอนาคตถ้ากรอก (สะท้อน validation ฝั่ง backend ไม่ใช่สูตรคำนวณอัตโนมัติ)
Why: ฟอร์มต้องตรงกติกา backend (กรอกเอง/ไม่บังคับ/ต้องเป็นอนาคต) — client validate ให้ error เกิดก่อนยิง API
Owner: frontend-engineer
Depends on: none
Traceability: REQ-015, AC-015.2, AC-015.3, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal — date picker nullable + client validation ตรงกติกา backend · ไม่มีการคำนวณวันแทนผู้ใช้

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยัน component กลางก่อนเขียน
Query: หา `customer-promise-table.component.tsx`, `customer-promise-form-modal.component.tsx`, `ContractRenewalAlertDate` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

endpoint ฝั่ง BE · การอนุมาน/default วันเตือน (ห้าม) · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-015.2: กรอกวันเตือนผ่าน date picker ได้จริง — ค่าอดีต/วันนี้ถูกกันทั้งฝั่ง client และ backend
AC-015.3: ไม่กรอกได้จริง — ฟอร์มไม่บังคับและไม่มีค่า default แทนผู้ใช้

#### Required validation and expected evidence

ตรวจ AC-015.2/AC-015.3 ด้วยการกรอกจริงทั้ง 3 กรณี (อนาคต/อดีต/ไม่กรอก) — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-09 — customer-promise store + service

Objective: `_stores/use-customer-promise-store.ts`, `_api/customer-promise-service.ts`
Why: state และการเรียก API ของหน้าคำสัญญารวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-015, AC-015.1, DES-010, DEC-010
Produces: none
Consumes: Contract:CrmAiCustomerPromise.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า customer-promises (รวม renewal-alerts) — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `use-customer-promise-store.ts`, `customer-promise-service.ts` ใน Target
Provenance: DES-010, DEC-010, Contract:CrmAiCustomerPromise.v1

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-015.1: หน้าคำสัญญาโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-015.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task BE-crm-ai-support-P4-15 — constant map สิทธิ์→บทบาท 6 คู่

Objective: สร้าง constant map ตัวเดียว (map 6 คู่ตรงตัว): `CRM_AI_CS→CS` · `CRM_AI_SA→SA` · `CRM_AI_PM→PM` · `CRM_AI_UX_UI→UX_UI` · `CRM_AI_DEV→DEV` · `CRM_AI_SALES→SALES` — ใช้ร่วมกันทุกจุด sync ห้ามเขียน string ซ้ำ (`PERMISSIONS.ADMIN_ACCESS` ไม่ derive อะไรทั้งสิ้น) ตาม design § Staff Role Sync Rules ข้อ 1/2
Why: map ตรงตัวเป็นสัญญาของการ derive ทางเดียว — กระจาย string จะเพี้ยนจุดใดจุดหนึ่งโดยไม่รู้ตัว
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: Contract:CrmAiStaffRoleSync.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

ไฟล์ constant เดียว — map 6 คู่เท่านั้น · `ADMIN_ACCESS` ไม่อยู่ใน map · ทุกจุด sync import จากที่นี่เดียว

#### Retrieval hints

Hypothesis: วางคู่กับ constant อื่นของโมดูล — ยืนยัน symbol ที่ sync service import จริงก่อนใช้
Query: หา `CRM_STAFF_ROLE_PERMISSION_MAP`, `staff-role-sync` ใน Target
Provenance: DES-006, DEC-006, Contract:CrmAiStaffRoleSync.v1

#### Do not modify

ค่า permission constant (อ่านอย่างเดียว) · การเพิ่มคู่นอก 6 ค่า · Timesheet `User.role_id`

#### Acceptance criteria

AC-016.1: การแปลสิทธิ์เป็นบทบาทใช้ map ตรงตัว 6 คู่จากที่เดียว — `FunctionalRole` ตรงชุด 6 ค่าที่กำหนด

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วยการเทียบ map กับ design § ข้อ 1 ทีละคู่ — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ additive — แก้ map ภายหลังต้องผ่าน design amend ก่อน (เป็นสัญญา)

### Task BE-crm-ai-support-P4-16 — ฟังก์ชัน sync กลาง (findFirst+update/create)

Objective: เขียนฟังก์ชัน sync กลาง (`findFirst` แล้ว `update`/`create` — **ห้ามใช้ `upsert`** เพราะไม่มี unique constraint บน `(AdminId, FunctionalRole)` และห้ามเพิ่ม index เอง): มีสิทธิ์+ไม่มีแถว → สร้าง `Active=true`/`AssignedBy`/`AssignedAt=now()` · มีสิทธิ์+แถว `Active=false` → ตั้งกลับ `Active=true` อัปเดต `AssignedBy`/`AssignedAt` · มีสิทธิ์+แถว `Active=true` → ไม่ทำอะไร (ห้ามเขียนทับ `AssignedAt`) · ถูกถอนสิทธิ์ → `Active=false` เท่านั้น **ห้าม `delete`** · แถวซ้ำจากข้อมูลเก่า → เก็บ `CrmStaffRoleId` น้อยสุดเป็นตัวจริง ปิดที่เหลือ `Active=false` ตาม design § ข้อ 5
Why: สถานะเครื่องของ sync ต้องคาดเดาได้และ idempotent — upsert บนตารางไม่มี unique จะเสี่ยงสร้างแถวซ้ำเอง
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, AC-016.3, DES-006, DEC-006
Produces: none
Consumes: Contract:CrmAiStaffRoleSync.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ฟังก์ชันกลางเดียวของทุกจุด sync — กติกา 4 สถานะ + จัดการแถวซ้ำ · ข้ามฐานข้อมูลจึงไม่มีทรานแซกชันร่วม (DEC-006)

#### Retrieval hints

Hypothesis: ตารางไม่มี unique constraint — ยืนยันจริงก่อนเลือก findFirst แทน upsert
Query: หา `syncAdminRoles`, `findFirst`, `staff-role-sync.service.ts` ใน Target
Provenance: DES-006, DEC-006, Contract:CrmAiStaffRoleSync.v1

#### Do not modify

`upsert`/การเพิ่ม unique constraint/index (ห้าม) · `delete` แถว (ห้าม — ถอน = Active=false) · `AssignedAt` ของแถวที่ active อยู่แล้ว (ห้ามเขียนทับ)

#### Acceptance criteria

AC-016.1: บทบาทตามสิทธิ์ปรากฏ/ปิดถูกต้องทุกสถานะเริ่มต้น — ไม่มีแถวถูกลบ
AC-016.3: ผู้ใช้ที่ไม่มีสิทธิ์ไม่มีบทบาท active — การถอนสิทธิ์สะท้อนเป็น Active=false

#### Required validation and expected evidence

ตรวจ AC-016.1/AC-016.3 ด้วยชุดทดสอบครบทุกสถานะเริ่มต้น (ไม่มีแถว/Active=false/Active=true/ถอนสิทธิ์/แถวซ้ำ) — เทียบ DB — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ฟังก์ชันใหม่ใน sync service — revert ได้ (แถวที่ sync แล้วกลับสภาพด้วยการ sync ซ้ำ)

### Task BE-crm-ai-support-P4-17 — hook: แก้สิทธิ์ role → sync ทุก user ของ role

Objective: hook เข้าจุดอัปเดตชุดสิทธิ์ของ role (`role-management.service.ts` — `PrismaTimesheet.rolePermission` ลบทั้งชุดแล้วสร้างใหม่) → sync ทุก `user` ที่ `role_id` นั้น (`is_deleted=false`) หลังเขียนสิทธิ์สำเร็จ
Why: การแก้สิทธิ์ระดับ role กระทบคนทั้งชุดพร้อมกัน — hook หลังเขียนสำเร็จจึงไม่ทำให้การแก้สิทธิ์เป็นโมฆะ
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.3, DES-006, DEC-006
Produces: none
Consumes: Contract:CrmAiStaffRoleSync.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ต่อ hook หลังเขียนสิทธิ์สำเร็จ — best-effort: sync ล้ม log error แล้วปล่อยการแก้สิทธิ์สำเร็จตามปกติ (ห้าม throw กลับ)

#### Retrieval hints

Hypothesis: จุดลบ-สร้าง rolePermission รวมอยู่ใน role-management.service.ts — ยืนยันจุดต่อกับซอร์สจริงก่อนแก้
Query: หา `role-management.service.ts`, `rolePermission`, `CRM_AI_STAFF_ROLE_SYNC` ใน Target
Provenance: DES-006, DEC-006, Contract:CrmAiStaffRoleSync.v1

#### Do not modify

พฤติกรรมลบ-สร้างสิทธิ์เดิม (ห้ามแก้) · การ throw เมื่อ sync ล้ม (ห้าม — ทำให้แก้สิทธิ์ล้มตาม) · schema สองฐาน

#### Acceptance criteria

AC-016.3: แก้สิทธิ์ role แล้วบทบาทของผู้ใช้ทุกคนใน role สะท้อนถูกต้อง โดยการแก้สิทธิ์ยังสำเร็จแม้ sync ล้ม

#### Required validation and expected evidence

ตรวจ AC-016.3 ด้วยการแก้สิทธิ์ role จริง (ได้/เสีย CRM_AI_*) — เทียบตารางบทบาท + จำลอง sync ล้ม — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

hook ต่อหลังจุดเดียว — ถอด hook ได้โดยการแก้สิทธิ์ไม่เปลี่ยน (แต่ตารางบทบาทจะไม่ sync — ใช้ endpoint sync เต็มระบบกู้)

### Task BE-crm-ai-support-P4-18 — hook: เปลี่ยน role_id ของ user → sync คนนั้น

Objective: hook เข้าจุดเปลี่ยน `role_id` ของ user คนหนึ่ง → sync เฉพาะคนนั้น (ทั้งบทบาทที่ได้ใหม่และที่ต้องปิด) — รวมกรณี `user.is_deleted=true` → ปิดทุกบทบาทของคนนั้นเป็น `Active=false`
Why: การย้ายทีม/ลาออกเปลี่ยนบทบาทเฉพาะบุคคล — ห้ามลามไป sync คนอื่นและห้ามทิ้งบทบาทค้างของคนที่ลบไปแล้ว
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.3, DES-006, DEC-006
Produces: none
Consumes: Contract:CrmAiStaffRoleSync.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ต่อ hook ที่จุดเปลี่ยน role_id — sync ขอบเขตคนเดียว · is_deleted ปิดทุกบทบาท · best-effort log error เท่านั้น

#### Retrieval hints

Hypothesis: จุดเปลี่ยน role_id ของ user มีจุดเดียวในระบบ — ยืนยันจุดต่อกับซอร์สจริงก่อนแก้
Query: หา `role_id`, `is_deleted`, `syncAdminRoles` ใน Target
Provenance: DES-006, DEC-006, Contract:CrmAiStaffRoleSync.v1

#### Do not modify

พฤติกรรมเปลี่ยน role เดิม · การ sync คนอื่นใน role (ขอบเขตคนเดียว) · การ delete แถวบทบาท

#### Acceptance criteria

AC-016.3: เปลี่ยน/ถอดบทบาทของคนหนึ่งแล้วเฉพาะคนนั้นสะท้อนถูกต้อง — คนที่ลบไปแล้วบทบาทถูกปิดทั้งหมด

#### Required validation and expected evidence

ตรวจ AC-016.3 ด้วยการเปลี่ยน role จริง + soft-delete user จริง — เทียบตารางบทบาทเฉพาะคนนั้น — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

hook ต่อหลังจุดเดียว — ถอดได้ (กู้สภาพด้วย endpoint sync เต็มระบบ)

### Task BE-crm-ai-support-P4-19 — POST /staff-roles/sync เต็มระบบ

Objective: เพิ่ม `POST /api/v2/support/crm-ai/staff-roles/sync` — endpoint sync ทั้งระบบแบบกดเอง (สิทธิ์ `CRM_AI_PM`/`ADMIN_ACCESS`) ไว้กู้สภาพเมื่อ sync เคยล้ม — idempotent เต็มรูปแบบ รันซ้ำได้ผลเท่ากันทุกครั้ง — sync ล้ม → log error แล้วปล่อยให้การแก้สิทธิ์สำเร็จตามปกติ (ห้ามทำให้การแก้สิทธิ์ล้มเพราะ sync พัง) ตาม design § Staff Role Sync Rules ข้อ 4/6
Why: เมื่อ hook รายจุดล้ม ต้องมีปุ่มกู้สภาพทั้งระบบที่ idempotent — รันซ้ำได้จึงกล้ากดซ้ำจนตรง
Owner: backend-engineer
Depends on: none
Traceability: REQ-016, AC-016.3, DES-006, DEC-006
Produces: none
Consumes: Contract:CrmAiStaffRoleSync.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

endpoint กดเอง — เดินผู้ใช้ทั้งระบบผ่านฟังก์ชัน sync กลาง (ไม่มี upsert/ลบแถว) · error รายคนถูกกลืน log ต่อเดิน · ผลรันซ้ำเท่าเดิม

#### Retrieval hints

Hypothesis: ฟังก์ชัน sync กลางมีจาก task ก่อนหน้า — ยืนยัน idempotence ของกติกา 4 สถานะก่อนใช้
Query: หา `staff-roles/sync`, `syncFullSystem`, `CRM_AI_PM`, `ADMIN_ACCESS` ใน Target
Provenance: DES-006, DEC-006, Contract:CrmAiStaffRoleSync.v1

#### Do not modify

การแก้สิทธิ์ฝั่ง Timesheet (อ่านอย่างเดียว) · การ delete แถว · การ throw ทำลายผู้เรียก

#### Acceptance criteria

AC-016.3: กด sync เต็มระบบซ้ำได้ผลเท่ากันทุกครั้ง — ตารางบทบาทตรงสิทธิ์จริงหลังกด

#### Required validation and expected evidence

ตรวจ AC-016.3 ด้วยการกดสองรอบติดกัน — เทียบ DB รอบหนึ่ง/สองตรงกัน + กรณี sync รายคนล้มระบบยังเดิน — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ (สถานะที่ sync แล้วถูกต้องตามสิทธิ์ ไม่ต้องย้อน)

### Task FE-crm-ai-support-P4-10 — เมนู จัดการบทบาทพนักงาน CRM AI

Objective: เพิ่มเมนู "จัดการบทบาทพนักงาน CRM AI" (`news: true`) ใน `sidebar-component.tsx` (ตั้งค่า ไม่ใช่หน้า workflow หลัก)
Why: หน้าบทบาทเป็น settings — ทางเข้าต้องอยู่กลุ่มตั้งค่าตามลักษณะงาน
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เพิ่ม 1 entry ใน sidebar constant — ไม่แตะเมนูอื่น

#### Retrieval hints

Hypothesis: sidebar ใช้ constant กลาง — ยืนยันโครง entry จริงก่อนแก้
Query: หา `sidebar-component.tsx`, `sidebar-menu-constant.tsx` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

เมนูอื่นทั้งหมด · route ของหน้า

#### Acceptance criteria

AC-016.1: ทางเข้าหน้าบทบาทปรากฏบนเมนูและพาไปถึงหน้าจริง

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วยการคลิกเมนูเข้าหน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

entry เมนู additive — ลบรายบรรทัดคืนได้

### Task FE-crm-ai-support-P4-11 — scaffold staff-roles settings page

Objective: scaffold `src/app/pages/support/crm-ai/settings/staff-roles/page.tsx` (PM-facing settings)
Why: หน้าดูบทบาทที่ derive แล้วเป็น settings ของ PM — อ่าน/เข้าใจสภาพตารางได้จากทางเข้าเดียว
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

scaffold โครงหน้า settings — แสดงสภาพตาราง (อ่านหลัก) · ตาราง/ฟอร์มแตกเป็น task ถัดไป

#### Retrieval hints

Hypothesis: โฟลเดอร์ `settings/staff-roles` ยังไม่มี — สร้างตาม pattern หน้าอื่น
Query: หา `settings/staff-roles/page.tsx` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

หน้าอื่น · endpoint ฝั่ง BE · จุดเขียนแถวตรง (derive ทางเดียวจากสิทธิ์)

#### Acceptance criteria

AC-016.1: หน้า settings บทบาทเปิดได้จริง — แสดงรายการตามตารางจริง

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วยการรันหน้าจริง + tsc/eslint — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ — ลบ/revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-12 — staff-role table + form modal

Objective: `_components/staff-role-table.component.tsx`, `_components/staff-role-form-modal.component.tsx`
Why: ดู/จัดการบทบาทผ่าน component มาตรฐานเดียวกันทั้งโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

component ตาราง + ฟอร์ม modal — เรียก endpoints ของ area เดียวกัน (toggle Active ผ่าน PATCH)

#### Retrieval hints

Hypothesis: Form Workflow มาตรฐานมีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `staff-role-table.component.tsx`, `staff-role-form-modal.component.tsx` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

endpoint ฝั่ง BE · scaffold หน้า (task อื่น)

#### Acceptance criteria

AC-016.1: ดู/ปิด-เปิดบทบาทผ่านหน้าจอได้จริง — ไม่มีปุ่มลบแถว

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วยการใช้งานจริงบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

component ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-13 — staff-role store + service

Objective: `_stores/use-staff-role-store.ts`, `_api/staff-role-service.ts`
Why: state และการเรียก API ของหน้าบทบาทรวมที่เดียวเหมือนทุกหน้าของโมดูล
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.1, DES-006, DEC-006
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

store + service ของหน้า settings/staff-roles — pattern เดียวกับหน้าอื่น

#### Retrieval hints

Hypothesis: pattern store/service มีตัวอย่างจากหน้าอื่น — ยืนยันก่อนเขียน
Query: หา `use-staff-role-store.ts`, `staff-role-service.ts` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

store/service ของหน้าอื่น · endpoint ฝั่ง BE

#### Acceptance criteria

AC-016.1: หน้าบทบาทโหลด/เขียนข้อมูลผ่าน service เดียว — state รวมที่ store เดียว

#### Required validation and expected evidence

ตรวจ AC-016.1 ด้วย tsc/eslint + ใช้หน้าจริง — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

ไฟล์ใหม่ — revert รายไฟล์ได้

### Task FE-crm-ai-support-P4-14 — ผูกสิทธิ์หน้าบทบาท 2 หน้า

Objective: ผูกสิทธิ์ทั้ง 2 หน้าเข้า `src/app/pages/admin/permission/page.tsx`
Why: หน้า settings บทบาทและหน้า workflow ที่เกี่ยวข้องควบคุมสิทธิ์จากหน้า permission กลางด้วยค่าเดิม
Owner: frontend-engineer
Depends on: none
Traceability: REQ-016, AC-016.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: authorization
Human gate: none
Status: verified

#### Scope and constraints

ผูก label/ค่า permission เข้าหน้า permission — reuse constant เดิมของโมดูล

#### Retrieval hints

Hypothesis: constant มีอยู่แล้วจากเฟสก่อน — ยืนยัน label ก่อนแก้
Query: หา `admin/permission/page.tsx`, `CRM_AI_PM` ใน Target
Provenance: DES-006, DEC-006

#### Do not modify

ค่า permission constant (ห้ามเพิ่มใหม่) · หน้า workflow อื่น · guard ฝั่ง API

#### Acceptance criteria

AC-016.2: สิทธิ์เข้าถึงหน้าบทบาทควบคุมจากหน้า permission กลางด้วยค่าเดิม

#### Required validation and expected evidence

ตรวจ AC-016.2 ด้วยการเปิด/ปิดสิทธิ์จริงแล้วเห็นผลบนหน้า — สถานะ verified ตามแถวเดิม หลักฐานรอบตรวจเก็บอยู่กับโมดูล (review.md/review/ และ Change Log)

#### Rollback/compatibility notes

การผูกเป็นข้อมูลของหน้า permission — revert รายจุดได้

## Sequencing Notes

- Phase 2 ต้องทำหลัง Phase 1 เสมอ — พึ่ง `TCrmCaseAiAssessment.IssueId`/`AiCategory` ที่ Phase 1 สร้างโดยตรง (ตาม `design.md` § Modules)
- Phase 1 ตั้ง 🔒 Security gate เพราะรับ input จากลูกค้าภายนอกโดยตรงผ่าน `TCrmSupport`/`classify` endpoint และอาจมีข้อมูลส่วนบุคคลปนใน `Question`/`Answer` — ต้องผ่าน `security` agent ก่อน `devops` จะ deploy ได้
- **Legacy cleanup ~500 รายการ** (จาก `requirement.md`) เป็น pre-launch operational gate ของทีม ops/data ไม่ใช่ engineering task ในแผนนี้ — `devops` ต้องเช็คว่าเสร็จก่อนจะถือว่า Phase 1 พร้อม deploy จริง แม้ทุก task ในแผนนี้จะ ✅ แล้วก็ตาม
- ค่าเริ่มต้นของ `CRM_SLA_RULES`/threshold ที่ตั้งไว้ใน Phase 1 เป็นค่าชั่วคราวที่ผู้ใช้ยืนยันแล้วเพื่อไม่ให้ Phase 1 ค้าง — เก็บเป็น versioned constant เพื่อให้ PM ปรับตัวเลขทีหลังได้โดยไม่กระทบ schema/migration
- **Phase 1 amendment (Menu/Per-Dimension Review/Backfill) ทำหลัง task เดิม 25 อันของ Phase 1 เสมอ** — แก้ไฟล์เดิม (`classify-with-gemini.ts`/`classification.service.ts`/`review-queue.*`/`case-review-detail-drawer.component.tsx`) โดยตรง ไม่ใช่ไฟล์ใหม่แยก ต้องอ่านโค้ดปัจจุบันก่อนแก้เสมอ ไม่ใช่เขียนทับจากศูนย์
- Menu classification เป็น **best-effort** ทุกเส้นทางรวม Safety Override — ห้าม error จากส่วนนี้ทำให้การบันทึก category/severity/safety override หลักล้มเหลวไปด้วย (ดู `design.md` § Menu Classification Rules ข้อ 7)
- Backfill endpoint (~70k เคส) เป็นปุ่มกดเองทีละชุด 100–150 เคส **ไม่ใช่ automatic background job** — กดซ้ำได้จนครบ ใช้กลไกเดียวกันกวาดเคสที่ menu classification ล้มเหลวได้ด้วย (query คนละเงื่อนไขเริ่มต้น endpoint เดียวกัน)
- Backfill amendment ยังอยู่ใต้ 🔒 Security gate เดิมของ Phase 1 — เป็น bulk data operation ~70k แถว ต้องผ่าน `security` อีกรอบก่อน deploy แม้จะ verify ผ่านแล้วก่อนหน้า (โค้ดเปลี่ยนใหม่)
- **CR 2026-08-17 (Backfill Data-Integrity & Severity Independence) เป็น hard blocker ก่อนกดปุ่ม Backfill กับข้อมูลจริง ~70k แถวครั้งแรก** — ทั้ง 5 task ต้องปิดให้ครบก่อน (query เดิมของ Backfill เขียนทับ `AiCategory`/`Severity`/`ReviewStatus` ที่คนตรวจแก้ไว้แล้วอย่างเงียบๆ ถ้ายังไม่แก้) ยังอยู่ใต้ 🔒 Security gate เดิมของ Phase 1 เช่นกัน — แก้ 4 จุด backend ให้ครบก่อนส่งให้ `security` ตรวจ จะได้ตรวจของชุดเดียวจบไม่ต้องตรวจซ้ำสองรอบ
- **Phase 3 ทำหลัง Phase 2 เสมอ** — `design.md` § Modules ระบุ Module 3 (`Feature Registry, Menu Relation & Learning Loop`) พึ่ง `TCrmIssue`/`TCrmKnowledgeEntry` จาก Module 2 (บาง `SuggestionType` อ้างถึงตารางเหล่านี้โดยตรง)
- **Phase 3b ทำหลัง Phase 3a เสมอ** — `TCrmMenuRelation` แถว `Source=AI_SUGGESTED` ถูกสร้างจากการ accept `TCrmAiSuggestion` (Phase 3b) แต่ endpoint confirm/reject ของแถวนั้นคือ endpoint เดียวกับที่ Phase 3a สร้างไว้แล้ว (`PATCH .../menu-relations/[id]`) — เขียน 3a ให้เสร็จก่อนจะมี endpoint ให้ 3b เรียกใช้
- **Phase 4 ทำหลัง Phase 2 เสมอ แต่ทำคู่ขนานกับ Phase 3 ได้** — ตาม `design.md` § Modules ระบุชัดว่า `TCrmQueueInterrupt` พึ่ง `TCrmIssue` (Module 2) เท่านั้น ไม่พึ่ง Module 3, ส่วน `TCrmCustomerPromise`/`TCrmStaffRole` ไม่พึ่ง module ไหนเลยนอกจาก schema ที่มีอยู่แล้ว — **ไม่ต้องรอ Phase 3 เสร็จก่อนเริ่ม Phase 4** ถ้ามีกำลังคนพอทำพร้อมกัน
- **Phase 4a**: `TCrmQueueInterrupt.ApprovedBy`/`Decision` เป็น `NOT NULL` ระดับ schema ทั้งคู่ (ไม่มี default) — หมายความว่าไม่มี "สถานะรออนุมัติ" ถูกเก็บไว้ในตารางนี้เลย แถวจะถูกสร้างก็ต่อเมื่อมีการตัดสินใจ (อนุมัติหรือปฏิเสธ) แล้วเท่านั้น ต้องออกแบบ UI/endpoint ให้สอดคล้อง อย่าสมมติว่ามี draft state ระหว่างทาง
- ~~**Phase 3b และ Phase 4b มีงาน backend 1 task ต่อ phase ที่ยังเขียนไม่ได้จริง**~~ — **ปลดล็อกแล้ว (2026-08-18, รอบที่ 6)**: ทั้ง detection threshold ของ `TCrmAiSuggestion` (3b) และสูตร `ContractRenewalAlertDate` (4b, คำตอบคือ "ไม่มีสูตร กรอกเอง") ถูกปิดครบแล้ว ดู "Phase 3b amendment — CR 2026-08-18" และ task ที่แก้ในหัวข้อ Phase 4b — Customer Promise ด้านบน
- **Phase 3b amendment (CR 2026-08-18) มีลำดับภายในบังคับ**: task "prerequisite KNOWLEDGE_MATCH" (แก้เส้นทางตอบเคส QA ให้เขียน decision log) **ต้องเสร็จก่อน** task "detection job" เสมอ เพราะกฎ `STALE_KNOWLEDGE` ของ detection job อ่าน log ที่ prerequisite เขียนโดยตรง — ถ้า implement detection job ก่อน กฎนี้จะคืน 0 suggestion เสมอ (ไม่ error แต่ silently ไม่ทำงาน) task แก้ `ai-suggestion.service.ts`/`.repository.ts` (accept ให้มีผลจริง) เป็นอิสระจากสองงานนี้ ทำคู่ขนานได้
- **`backfill.repository.ts`'s `BACKFILL_CLOSED_ALIASES` (CR 2026-08-18) เป็น hard prerequisite ก่อนกดปุ่ม Backfill กับข้อมูลจริง ~70k แถวครั้งแรก เช่นเดียวกับ CR 2026-08-17** — ต้องปิดทั้งสอง CR (2026-08-17 และ 2026-08-18) ให้ครบก่อนกดปุ่มจริงครั้งแรก ไม่ใช่แค่ CR ใดอันหนึ่ง
- **`crm-sla-rule.constant.ts`'s `computeCrmPriorityScoreV2` (CR 2026-08-18) แตะ call site ใน 3 phase**: Phase 1 (`classification.service.ts`/`review-queue.service.ts` — ไฟล์เดิมที่ task ✅ ไว้แล้ว), Phase 2 (`link-case` endpoint — ✅ ไว้แล้วเช่นกัน), Phase 3b (`MERGE_ISSUE`/`MERGE_REQUEST` accept — task ใหม่ในกลุ่มเดียวกัน) — การแก้ไฟล์ที่มี task ✅ อยู่แล้วเป็นส่วนหนึ่งของ CR นี้โดยเจตนา ไม่ใช่การแก้ scope เดิม ไม่ต้อง uncheck task เดิม แค่เพิ่ม task ใหม่ที่ระบุการแก้เพิ่ม
- **`TCrmStaffRole` sync (Phase 4b amendment CR 2026-08-18) ข้ามฐานข้อมูล** — เขียนฝั่งสิทธิ์ (Timesheet DB) ให้เสร็จก่อนแล้วค่อย sync ตาราง (jabjai-master) แยกทรานแซกชัน sync ที่ล้มไม่ทำให้การแก้สิทธิ์เป็นโมฆะ
- `PERMISSIONS.CRM_AI_UX_UI`/`CRM_AI_DEV`/`CRM_AI_SALES` ถูกเพิ่มไว้ที่ task แรกของ Phase 3a เพราะเป็น phase แรกที่ role เหล่านี้ถูกใช้งานจริง — Phase 4 (Sales-facing ทั้งคู่) อ้างอิง constant ชุดเดียวกันนี้ ไม่ต้องเพิ่มซ้ำ
- **Phase 3b (2026-08-17): แถวคู่ `TCrmAiDecisionLog` ตอน accept suggestion เขียนในทรานแซกชันเดียวกับผลจริงที่ตารางปลายทางเท่านั้น** — `NEW_MENU_RELATION` → `MENU_RELATION`/`MENU_CLASSIFICATION`, `MERGE_ISSUE`/`MERGE_REQUEST` → `ISSUE`/`DEDUP_MATCH` (ใช้ `CrmIssueId` ปลายทางการรวม ไม่ใช่ตัวที่ถูกรวมเข้าไป), `NEW_KNOWLEDGE`/`STALE_KNOWLEDGE` → `KNOWLEDGE`/`KNOWLEDGE_MATCH` ตาม `design.md` § AI Suggestion & Learning Loop Rules ข้อ 4 (เพิ่ม 2026-08-17 รอบที่ 4) — **Phase 3a's `TCrmMenuRelation` confirm/reject endpoint และ Phase 4a's `TCrmQueueInterrupt` approval ทั้งคู่ต้อง**ไม่**เขียนแถวใน `TCrmAiDecisionLog` เด็ดขาด** (คนละขั้นตอนการตัดสินใจ มี audit column ของตัวเองอยู่แล้ว) — งานนี้ถูกเพิ่มเข้า Phase 3b **หลัง** `qa-engineer` เคยเห็น Phase 3b ในสภาพยังไม่มี implementation ใดๆ (ทุก task ยัง `[ ]` ทั้งหมด) จึงยังไม่กระทบสถานะ verify ใดๆ ที่มีอยู่ — แต่เมื่อ `backend-engineer` เริ่ม implement Phase 3b ให้ `qa-engineer` ตรวจรวมทุก task ในรอบเดียว (ไม่ใช่แยกตรวจเฉพาะ task เดิม)

- `_docs/create-spec.md` ของ backfill และ `_docs/classify-spec.md` ต้องอัปเดตให้ตรงกติกาใหม่ด้วย (spec เดิมยังอ้าง query แบบเก่าที่ merge 2 เงื่อนไขเข้าด้วยกัน) — หมายเหตุเดิมของ Phase 1 amendment CR 2026-08-17 (ย้ายมาไว้ที่นี่ตอนแปลงรูปแบบเอกสาร เพราะเนื้อหาใต้ `## Phase N` ต้องมีเฉพาะ task sections ตามฟอร์แมต canonical)

## Unresolved Open Questions

- ปริมาณเคสต่อวัน/เดือนจริง (ผลต่อ Gemini rate-limit/cost) — ไม่บล็อก Phase 1 แต่ควรเช็คก่อน production traffic สูง
- ~~**Detection threshold ของแต่ละ `TCrmAiSuggestion.SuggestionType`**~~ — **ปิดแล้ว (2026-08-18)**: ใช้ชุดตั้งต้นที่ `system-analyst` เสนอทั้งชุดเป็น code constant versioned (`CRM_AI_SUGGESTION_RULE_VERSION = "v1"`) ดู `design.md` § AI Suggestion & Learning Loop Rules ข้อ 7 และ task ใน "Phase 3b amendment — CR 2026-08-18"
- ~~**สูตรคำนวณ `ContractRenewalAlertDate`**~~ — **ปิดแล้ว (2026-08-18)**: ยืนยันว่า **ไม่มีสูตร** Sales กรอกวันที่เองเสมอ ดู `design.md` § Customer Promise Rules ข้อ 2 และ task ที่แก้ในหัวข้อ Phase 4b — Customer Promise ด้านบน
- ~~**`TCrmStaffRole` sync กับ `PERMISSIONS.CRM_AI_*`**~~ — **ปิดแล้ว (2026-08-18)**: derive อัตโนมัติจากสิทธิ์ ไม่มีหน้า UI แยก ถอนสิทธิ์ → `Active=false` ดู `design.md` § Staff Role Sync Rules และ "Phase 4b amendment — CR 2026-08-18"
- **แอปมือถือ (sb-app) ไม่มี menu catalog** — ไม่กระทบ Phase 3/4 โดยตรง (คนละ dimension กับ `MenuId` ของเคส) แต่ยังเป็น gap ที่ค้างจาก Phase 1 — ยืนยันเลื่อนโดยเจตนา (`design.md` § การตัดสินใจรอบที่ 6) ผูกกับ "การกวาดเคส `NO_MENU` ใหม่" ต้องเปิดพร้อมกันถ้าวันหนึ่งมี catalog จริง
- **ไม่มี alert/ตัวนับสำหรับ `confidenceParse != "OK"`** และ**ไม่มีตัวนับความพยายามของเคสที่ Gemini ล้มถาวร** — ยืนยันว่ายังไม่ทำโดยเจตนา (`design.md` § Amendment 2026-08-18 ส่วน ค.) ไม่บล็อกงานใดในแผนนี้
- **4 มติเชิงธุรกิจจากรอบที่ 6 ยังต้องให้ `business-analyst` บันทึกลง `requirement.md`** (น้ำหนัก/ตัวคูณ SLA v2, detection threshold ทั้ง 5 กฎ, `ContractRenewalAlertDate` กรอกเอง, `RESOLVED` = ปิดแล้วสำหรับ backfill) — ไม่บล็อก Phase ใดในแผนนี้ (`design.md` เก็บรูปแบบทางเทคนิคไว้ครบแล้ว) แต่เป็นงานเอกสารที่ค้างอยู่นอก engineering

- ~~**(ใหม่ 2026-08-23) กฎ detection `MERGE_REQUEST` กลุ่ม `ProductFeatureId` ยังทำไม่ได้** — `TCrmSupport`/`TCrmCaseAiAssessment` ไม่มีคอลัมน์ `ProductFeatureId` (feature-level id มีเฉพาะตารางปลายทาง `TCrmIssue`/`TCrmKnowledgeEntry`/`TCrmCustomerPromise` ซึ่งเคสที่ยังไม่ถูก group ยังไม่ผูกด้วย) ปัจจุบัน `detection.service.ts` จำแนก FEATURE ด้วย `MenuId` อย่างเดียวพร้อม comment อธิบาย — ต้องการ `system-analyst`/ผู้ใช้ตัดสินใจ: (ก) เพิ่มคอลัมน์ `ProductFeatureId` บนตารางเคส (DDL) หรือ (ข) ยืนยันตัด branch นี้ออกจาก design.md § ข้อ 7.1 อย่างเป็นทางการ~~ — **ปิดแล้ว (2026-08-23): ผู้ใช้เลือก (ข) ตัด branch ProductFeatureId ออก — "ใช้ตารางปัจจุบันเท่านั้น" ไม่มี DDL; design.md §ข้อ 7 แก้แล้ว, task MERGE_REQUEST ติ๊กสมบูรณ์**
- ~~**(ใหม่ 2026-08-23) นิยามรายการ "ใกล้ถึงกำหนดเตือนต่อสัญญา" ขัดกันระหว่าง design/plan** — `design.md` § Customer Promise Rules ข้อ 2 นิยามเป็น "เตือน" (`ContractRenewalAlertDate <= today` + สถานะยังเปิด) แต่ plan.md task เขียนเป็นรายการ upcoming (`Status=PENDING AND ContractRenewalAlertDate IS NOT NULL` เรียงใกล้ถึงก่อน) ซึ่งตรง label tab frontend "ใกล้ถึงกำหนด" — implementation ปฏิบัติตาม plan.md (upcoming view) ต้องการผู้ใช้/`system-analyst` ยืนยันวิวที่ต้องการ หรือแก้ design.md ให้ตรง~~ — **ปิดแล้ว (2026-08-23): ผู้ใช้ยืนยันคง upcoming view — แก้ design.md § Customer Promise Rules ข้อ 2 ให้ตรง implementation แล้ว ไม่แตะโค้ด/UI**

## Change Log

- 2026-08-16: เขียน `plan.md` ฉบับแรกจาก `design.md` ที่ confirm แล้ว — 2 phases ตามการแบ่ง module ยืนยันกับผู้ใช้ 2 จุด: (1) ตั้งค่าเริ่มต้นชั่วคราวของ `CRM_SLA_RULES`/threshold ทันทีแทนการปล่อยเป็น task ค้าง (2) ลำดับ phase ตาม `design.md` ไม่มีการปรับ
- 2026-08-16: เพิ่ม task เชื่อม auto-trigger classify เข้ากับ `createCase` ใน `backlog/crm` ตามที่ผู้ใช้ชี้ให้ไปดู `support/crm` (dashboard mockup) และ `support/backlog/crm` (ฟอร์มสร้างเคสจริง) เป็นจุดอ้างอิง — ยืนยันแล้วว่าไม่รีแฟคเตอร์ type-tag/severity-tag/status-tag ของ mockup เดิม (casing คนละแบบกับ `AiCategory` จริง) เก็บ tag ของ `crm-ai` แยกต่างหากตามเดิม
- 2026-08-16: เพิ่ม "Phase 1 amendment" — 13 task ใหม่ (9 backend, 4 frontend) จาก `design.md` 3 Contract sections ใหม่ (Menu Classification/Per-Dimension Review/Legacy Backfill) task เดิม 25 อันของ Phase 1 ไม่แตะ ไม่แก้ checkbox ที่ ✅ ไว้แล้วเลยสักอัน
- 2026-08-16: เพิ่ม Phase 3 (`Feature Registry, Menu Relation & Learning Loop`, sub-phase 3a/3b) และ Phase 4 (`Queue Interrupt & Customer Promise`, sub-phase 4a/4b) จาก `design.md` 2 module ใหม่ + 4 Contract sections ใหม่ (Feature Registry & Menu Relation/AI Suggestion & Learning Loop/Queue Interrupt/Customer Promise) — แบ่ง sub-phase ตาม dependency จริงที่ `design.md` § Modules ระบุ (3b พึ่ง 3a ผ่าน endpoint confirm ร่วมกัน, 4a พึ่ง Phase 2 เท่านั้น, 4b เป็นอิสระทำคู่ขนานได้) ไม่แยกเป็น module ใหม่ตามที่ผู้ใช้ถามไว้ก่อนหน้า เพราะ schema เกาะกันแน่นเกินจะแยกได้จริง — 2 task (detection threshold ใน 3b, renewal-alert formula ใน 4b) ยังเขียนไม่ได้เพราะรอคำตอบตัวเลข/สูตรจากผู้ใช้ ไม่บล็อก task อื่นในแผน
- 2026-08-16: แก้ wording task `POST /issues` ใน Phase 2 จาก "สร้างเรื่องใหม่ (SA เท่านั้น)" เป็น "SA/PM" — `qa-engineer`'s FULL verify round พบว่า wording เดิมขัดกับ `design.md` § Classification & Safety Override Rules ข้อ 6 ที่ระบุชัดว่า "SA/PM เป็นคน group เข้า TCrmIssue เอง" โค้ดที่ implement ไปแล้วยึดตาม design.md (ถูกต้อง) จึงแก้ wording ใน plan.md ให้ตรงแทน ไม่แก้โค้ด
- 2026-08-17: เพิ่ม "Phase 1 amendment — CR 2026-08-17 (Backfill Data-Integrity & Severity Independence)" — 5 task ใหม่ (4 backend, 1 frontend) จาก `design.md` § Amendment 2026-08-17 ต่อท้าย Phase 1 amendment เดิม (13 task 2026-08-16 ทั้งหมด checked ไม่แตะ) ปิด 2 ช่องโหว่ที่ `qa-engineer` FULL round พบใน `design.md` เอง: (1) แยก Backfill เป็น Mode A/Mode B เด็ดขาด กัน sweep เรียก `classify()` เต็มรูปแบบเขียนทับ `AiCategory`/`Severity`/`ReviewStatus` ที่คนตรวจแก้ไว้แล้ว (2) เพิ่ม `MenuReviewStatus = 'NO_MENU'` แยกจาก NULL กัน `remaining` ไม่ถึง 0 (3) `SeverityReviewStatus` ที่ classify-time คำนวณจาก `severityConfidence` ของตัวเอง ไม่ยืมจากมิติประเภทเคส — ไม่มีการแก้ schema (VarChar เดิมรับค่าใหม่ได้) เพิ่ม note ใน Sequencing Notes ว่าเป็น hard blocker ก่อนกดปุ่ม Backfill กับข้อมูลจริงครั้งแรก
- 2026-08-17: แก้ Phase 3b ตาม `design.md` § AI Suggestion & Learning Loop Rules ข้อ 4/5 (เพิ่ม 2026-08-17 รอบที่ 4 — ปิดค่า enum ของ `TCrmAiDecisionLog` ครบ) — เพิ่ม 6 task ใหม่ (ทั้งหมด `[backend]`): แถวคู่ `TCrmAiDecisionLog` ตอน accept `NEW_MENU_RELATION`/`MERGE_ISSUE`/`MERGE_REQUEST`/`NEW_KNOWLEDGE`/`STALE_KNOWLEDGE` ตามตารางแมป (แยก task ต่อกลุ่ม `SuggestionType` ตามปลายทางที่ต่างกัน), กรณีขอบ `REJECTED` ไม่เขียน log / accept ซ้ำ → `AppError(409)` / subject ปลายทางหาย → `AppError(404)`, และค่าที่เหลือของทุกแถวคู่ (`AiOutput` copy `Payload` ไม่ join, `Confidence=null`+`ModelVersion="rule-based"` เมื่อไม่ใช่ AI, `ReviewStatus="CONFIRMED"`) — เพิ่มโน้ตกันพลาดใน Phase 3a's menu-relation confirm/reject task และ Phase 4a's queue-interrupt task ว่าห้ามเขียน `TCrmAiDecisionLog` ที่ 2 จุดนั้นเด็ดขาด (คนละขั้นตอนการตัดสินใจ) — Phase 3b ทุก task ยัง `[ ]` ทั้งหมดตั้งแต่ต้น ไม่มี `[x]` ใดถูกแตะ ไม่กระทบสถานะ verify เดิม; เพิ่ม 1 บรรทัดใน Sequencing Notes สรุปตารางแมปและจุดที่ห้ามเขียน ไม่มีการเปลี่ยน `🔒 Security gate` ของ Phase 1 (ไม่กระทบ Phase 3b)
- 2026-08-18 (รอบที่ 6): เพิ่ม 7 กลุ่ม task จาก `design.md` § Amendment 2026-08-18 (หลังปิด Open Question ค้างครบ 8 ข้อ) — **ไม่มีการเปลี่ยน Data Model ไม่ต้องรัน DDL ทุกข้อ ไม่แตะ `[x]` เดิมสักอัน**:
  - **"Phase 1 amendment — CR 2026-08-18"** (ใหม่ ต่อท้าย CR 2026-08-17): (1) `backfill.repository.ts` เพิ่ม `BACKFILL_CLOSED_ALIASES = CLOSED+RESOLVED` (ไม่แตะ `CLOSED_ALIASES` เดิม) และแก้ `overrideReviewStatuses()` ให้เขียนทับเฉพาะมิติที่เป็น `PENDING_REVIEW`/`NEEDS_HUMAN` โดยไม่ดูว่ามีค่าหรือไม่ (ปิดช่องเคสปิดแล้วที่ `Severity=NULL` ค้างคิวตลอดไป) — ตั้งเป็น hard prerequisite ก่อนกด Backfill จริงครั้งแรก เท่ากับ CR 2026-08-17 (2) `crm-sla-rule.constant.ts` เพิ่ม `CRM_SCHOOL_REPEAT_MULTIPLIER`/`computeCrmPriorityScoreV2()`/bump `CRM_SLA_RULE_VERSION="v2"` (เก็บของเดิมไว้ตาม `CLAUDE.md`) + query นับ `distinctSchoolCount` + ย้าย call site 3 จุด (classify/re-classify, review-queue severity change, ผูกเข้า `TCrmIssue`)
  - **"Phase 3b amendment — CR 2026-08-18"** (ใหม่ ท้าย Phase 3b แทนที่ placeholder เดิมที่บล็อกไว้): แก้ `ai-suggestion.service.ts`/`.repository.ts` ให้ accept มีผลจริงตาม § AI Suggestion & Learning Loop Rules ข้อ 6 (`MERGE_ISSUE`/`MERGE_REQUEST` เขียน `IssueId` พร้อมกติกา 4 กลุ่ม, `NEW_KNOWLEDGE` สร้าง entry `DRAFT`, `STALE_KNOWLEDGE` ตั้ง `NEEDS_REVIEW`) — เพิ่ม task prerequisite เขียน `KNOWLEDGE_MATCH` log จากเส้นทางตอบเคส QA (ต้องเสร็จก่อน task ถัดไป) — เพิ่ม detection job เต็มรูปแบบ (constant file, `POST /ai-suggestions/detect`, 5 กฎ + กันแถวซ้ำด้วย `group_key`) ตามข้อ 7 ที่ปลดล็อกแล้ว
  - **Phase 4b — Customer Promise**: ปลดล็อก task ที่เคยบล็อกเรื่องสูตร `ContractRenewalAlertDate` เป็น "ไม่มีสูตร Sales กรอกเอง + validate ต้องเป็นวันในอนาคต" พร้อมเพิ่ม note ในฟอร์ม frontend ให้มี date picker แบบ nullable + client validate
  - **"Phase 4b amendment — CR 2026-08-18"** (ใหม่): `TCrmStaffRole` sync จาก `PERMISSIONS.CRM_AI_*` แบบ derive ทางเดียว — constant map 6 คู่, ฟังก์ชัน sync กลาง (`findFirst`+`update`/`create`, ห้าม `upsert`), hook เข้าจุดแก้สิทธิ์ role และเปลี่ยน role ของ user, endpoint sync ทั้งระบบแบบกดเอง (idempotent) — ข้ามฐานข้อมูล (Timesheet↔jabjai-master) sync ที่ล้มไม่ทำให้แก้สิทธิ์เป็นโมฆะ
  - อัปเดต Sequencing Notes: ลำดับบังคับ prerequisite-ก่อน-detection-job ใน Phase 3b, CR 2026-08-18 ของ backfill เป็น hard prerequisite เพิ่มเติมจาก CR 2026-08-17 (ต้องปิดทั้งคู่), SLA v2 แตะ call site ข้าม Phase 1/2/3b โดยเจตนา (ไม่ต้อง uncheck task เดิม), staff-role sync ข้ามฐานข้อมูล — ปิด 3 ข้อใน Unresolved Open Questions (detection threshold, `ContractRenewalAlertDate` formula, `TCrmStaffRole` sync) เหลือเฉพาะข้อที่ยืนยันเลื่อนโดยเจตนา (sb-app catalog, confidenceParse counter, Gemini ล้มถาวร counter) และงานเอกสารที่ยังค้างให้ `business-analyst` บันทึกลง `requirement.md`
- 2026-08-23 (closure round): **FULL verification ทุก task ที่ยังไม่ติ๊กครบทุก phase** (Phase 1 CR 2026-08-18 ×6, Phase 3a ×19, Phase 3b ×10, Phase 3b amendment ×15, Phase 4a ×9, Phase 4b ×14, Phase 4b amendment ×10 — 83 checkbox) โดยอ่านโค้ดจริงเทียบ design.md/plan.md ทีละ task + รัน `bun run lint` (349 problems เป็นของเก่าทั้งหมด, 0 รายการในไฟล์ crm-ai), `bun test` (211/211 ผ่าน), `bun run build` (exit 0, route crm-ai ครบทุก endpoint) — ผล: 82/83 ✅ ผ่านตรงตาม task, เหลือ 1 task (`MERGE_REQUEST` ProductFeatureId branch) ปิดบางส่วนติด schema blocker (เพิ่มเป็น Open Question ใหม่ 2 ข้อพร้อมเรื่อง renewal-alerts view) — แก้บั๊กจริง 2 จุดจากรอบ verify: (1) `staff-role.schema.ts` filter `active=false` พังเพราะ `z.coerce.boolean()` กับ query string (2) `UpdateCustomerPromiseSchema` รับ body ว่างแล้ว Prisma throw 500 → refine บังคับ ≥1 field; security fix 1 จุด: Gemini API key ย้ายจาก URL query string ไป header `x-goog-api-key` (ปิด finding 🟡 ของ security Round 2); แก้ wording task PATCH ai-suggestions เรื่อง guard/service 2 ชั้นให้ตรง pattern จริง (behavior ไม่เปลี่ยน) — รายละเอียดรอบตรวจอยู่ใน `review/closure-2026-08-23.md`, security Round 3 อยู่ใน `security.md`
- 2026-08-23 (ผู้ใช้ตัดสินใจปิด Open Questions): **2 ข้อที่เปิดจาก closure round ปิดสมบูรณ์ — module crm-ai-support ไม่มี task ค้างแล้ว (checkbox ครบทุกตัว)**: (1) MERGE_REQUEST ProductFeatureId branch → ผู้ใช้เลือก "ใช้ตารางปัจจุบันเท่านั้น" — ตัด branch ออกจาก design.md §ข้อ 7, implementation MenuId-only ที่มีอยู่กลายเป็นตรง design เต็ม, task ติ๊ก [x] (2) renewal-alerts view → ผู้ใช้เลือกคง upcoming view — แก้ design.md § Customer Promise Rules ข้อ 2 ให้ตรง implementation/หน้าจอ, โค้ดไม่แตะ — อัพเดต comment `detection.service.ts` + addendum ใน `review/closure-2026-08-23.md` + status.md ถอด Blocked-on
- 2026-08-28 — Format reconciliation: converted legacy `[x]` checkbox task lists to the standard `| Task | Status | Owner | Depends on |` table; task ids adopted verbatim from the knowledge store (`knowledge/crm-ai-support/task/*.yaml`, mapped 1:1 by document order — backend series → `BE-…`, frontend series → `FE-…`; per-phase counts matched exactly: P1 34 BE / 16 FE, P2 11 BE / 9 FE, P3 30 BE / 14 FE, P4 19 BE / 14 FE — no checkbox line without a task yaml); all rows Status=verified (delivered — every legacy checkbox was `[x]`, closure round 2026-08-23); no dependency graph was recorded in the legacy plan so Depends on = — throughout; design traceability uses named `design.md` rule sections in parentheses (module has no `DES-NNN` ids); the nested sub-bullets under the former "accept มีผลจริง" checkbox were folded into BE-crm-ai-support-P3-21's Task cell (joined with `<br>·`) verbatim; all `### Phase N amendment` headings and narrative paragraphs kept unchanged; no task added, removed, re-scoped, or re-ordered.

- 2026-09-13: Structure-only conversion to canonical `PlanTask format: 1` — แถวตาราง `| Task | Status | Owner | Depends on |` ทั้งหมดใต้ `## Phase 1..4` (รวมหัวข้อ `### Phase N amendment` ที่ครอบอยู่) ถูกแปลง 1:1 เป็น canonical task sections 147 task ตามลำดับเอกสารเดิม — task ids/statuses/owners/dependencies คงเดิมทุกแถว (Status=verified ทั้งหมด, Depends on เดิมเป็น — จึงเป็น `none` ทั้งหมด) ไม่มีการเพิ่ม/ลด/merge/เรียงใหม่/แก้ scope ของ task ใด; Traceability เพิ่มเป็นครั้งแรกโดยอ้าง DES-001..010/DEC-001..010/Contract ids ของ `design.md` (ตาม § rules ที่แต่ละแถวอ้างอยู่แล้ว: Classification & Safety=DES-001 … Customer Promise=DES-010) และ REQ/AC ที่มีอยู่จริงใน `requirement.md` (REQ-001..016, AC-001.1..016.3); Produces/Consumes ผูกสัญญา 10 ตัวให้มีผู้ผลรายตัวเดียวและผู้บริโภคอยู่หลังผู้ผลตามลำดับ, Risk สืบเชิงจากข้อความแถว (authorization/shared-contract/medium/high/low) — ไม่มี design trigger ใด (ทุก DES section additive-internal/schema-unchanged/no-migration/ambiguity-none, Security=sensitive ไม่ trigger gate) จึง `Human gate: none` ทุก task; หัวเรื่องเอกสารเป็น `# Plan` ตามฟอร์แมต (module identity อยู่ที่ Plan Summary) และบริบทของแต่ละ amendment คงอยู่ใน Change Log รายวันที่เดิม + หมายเหตุ spec ย้ายไป Sequencing Notes; ตาราง task ถูกลบออกทั้งหมด — canonical task sections เป็น task authority เดียว
