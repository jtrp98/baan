# Plan

PlanTask format: 1

## Plan Summary

21 tasks in 5 phases turn the confirmed design (Modules A–D plus the REQ-019 wording-only slice) into an
independently verifiable task DAG: weighted score aggregation (Phase 1), premium entitlement/API
authorization (Phase 2, the 🔒 security-gated phase), national-stats alignment (Phase 3), premium subject
breakdown (Phase 4), and the MyCompass WORD-01 wording fix (Phase 5). Every task starts `pending` because
this plan is an explicit restart that discards prior implementation/QA state by user decision (see Change
Log 2026-09-02); Phase 2's `CheckEntitlement` step-4 chain stays blocked at OQ-15(a1)/(a2)/PRE-06, and the
remainder of REQ-019 beyond its wording slice is deliberately not task-able until `design.md` gains a
contract section for it.

## Phase 1: Module A — Score Aggregation (REQ-012)

### Task BE-001 — Add AggregateByCanonicalSubjectWeighted to CompassScoreService

Objective: เพิ่มเมธอดใหม่ `AggregateByCanonicalSubjectWeighted` ใน `CompassScoreService` แยกจากเมธอดเดิม `AggregateByCanonicalSubject` (ห้ามแก้ทับ) ตามกฎข้อ 0–5 ของสัญญา aggregation: สูตรถ่วงน้ำหนักด้วยหน่วยกิต, ตัดวิชาที่หน่วยกิต null/<=0 ออกจากทั้งตัวตั้งและตัวหาร, ตัดวิชาที่ไม่มีคะแนนเป็นตัวเลข, fallback เป็นค่าเฉลี่ยดิบเมื่อหน่วยกิตรวม = 0 (fallback ต้องอยู่ในเมธอดเดียวกัน ห้ามให้ caller ทำเอง), ปัดผลลัพธ์เป็นทศนิยม 2 ตำแหน่ง
Why: REQ-012 บังคับสูตรถ่วงน้ำหนักสำหรับ consumer ฝั่ง Premium ขณะที่ฝั่งฟรีต้องคงค่าเฉลี่ยดิบ — เมธอดเดิมถูกเรียกร่วมทั้งสองฝั่งจึงต้องเพิ่มเมธอดใหม่แทนการแก้ทับ (DES-015 กฎข้อ 0)
Owner: backend-engineer
Tier: T4
Depends on: none
Traceability: REQ-012, AC-012.1, AC-012.2, AC-012.3, AC-012.4, DES-015
Produces: Contract:SubjectScoreAggregation.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

หนึ่งเมธอดครบทุกกฎ: คะแนนกลุ่มสาระ = Σ(คะแนน × หน่วยกิต) / Σ(หน่วยกิต) เฉพาะวิชาที่มีคะแนนตัวเลขและหน่วยกิตใช้ได้
(null หรือ <=0 ถือว่าใช้ไม่ได้ ตัดทั้งตัวตั้งและตัวหาร — ไม่นับเป็น 0); กลุ่มที่หน่วยกิตรวม = 0 → ค่าเฉลี่ยดิบของวิชาที่มีคะแนน
ในกลุ่มนั้น (ห้ามหารด้วยศูนย์ ห้าม error ห้ามคืน 0); กลุ่มที่ไม่มีวิชาที่มีคะแนนเลย → ไม่มีค่า ตัดกลุ่มทิ้ง; กลุ่มที่บางวิชามีหน่วยกิต
บางวิชาไม่มี → ไม่เข้า fallback ใช้ถ่วงน้ำหนักกับวิชาที่หน่วยกิตใช้ได้; ปัดเป็นทศนิยม 2 ตำแหน่งภายในเมธอด

#### Retrieval hints

Hypothesis: ขอบเขตหลักคือ `CompassScoreService.AggregateByCanonicalSubject` และ `GetCanonicalSubjectAveragesAsync`; ตรรกะหน่วยกิตปัจจุบัน (`TotalCredit = Sum(Credit ?? 0)`) ต้องแยกให้ชัดระหว่าง "หน่วยกิต 0" กับ "ไม่มีข้อมูลหน่วยกิต" — ยืนยัน symbol/path กับ source ปัจจุบันก่อนแก้ การอ้างบรรทัดเป็นสมมติฐาน
Query: หา definition/references ของ AggregateByCanonicalSubject, AggregateByCanonicalSubjectWeighted, CompassSubjectScore.Credit ใน ClassOnlineWeb/Helper/CompassScoreService.cs
Provenance: DES-015, Contract:SubjectScoreAggregation.v1

#### Do not modify

เมธอดเดิม `AggregateByCanonicalSubject` และ caller ฝั่งฟรี (`analyst/{sID}`) ทุกจุด — ค่าเฉลี่ยดิบและการปัดจำนวนเต็มของฝั่งฟรีคงเดิมทุกอย่าง;
ตรรกะ fallback ห้ามย้ายไปให้ caller ทำเอง; ที่มาหน่วยกิตเดิม (`PGTGradeDetail.nCredit` fallback `TPlane.nCredit`) ห้ามแก้

#### Acceptance criteria

AC-012.1: กรณีถ่วงน้ำหนักปกติ (60 ที่ 1.5 นก. + 90 ที่ 0.5 นก.) ต้องได้ 67.5 แบบทศนิยม 2 ตำแหน่ง ไม่ใช่ 68 จากการปัดจำนวนเต็ม
AC-012.2: สลับหน่วยกิตเป็น 0.5/1.5 ต้องได้ 82.5 และเปลี่ยนระดับได้จริง — หน่วยกิตต้องมีน้ำหนักในผล
AC-012.3: วิชาที่ไม่มีคะแนนเป็นตัวเลขถูกตัดออกจากทั้งตัวตั้งและตัวหารเสมอ (วิชา non-core ที่ `CanonicalSubject` เป็น null ถูกตัดด้วย)
AC-012.4: กลุ่มที่หน่วยกิตรวม = 0 → ค่าเฉลี่ยดิบของวิชาที่มีคะแนน (ไม่ error ไม่คืน 0) และกลุ่มที่ไม่มีวิชาที่มีคะแนนเลยถูกตัดทิ้ง (ไม่มีค่า ไม่ใช่ 0)

#### Required validation and expected evidence

ตรวจ AC-012.1, AC-012.2, AC-012.3, AC-012.4 กับกรณีทดสอบทั้งสี่กรณีของสัญญา (ถ่วงน้ำหนักปกติ, หน่วยกิตสลับ, fallback, ไม่มีคะแนนเลย)
บันทึกค่าที่ได้ทุกกรณีพร้อมคำสั่ง/exit code; diff ต้องแสดงว่าไม่มีการแตะเมธอดเดิมและไม่มีการเปลี่ยนพฤติกรรมฝั่งฟรี

#### Rollback/compatibility notes

เป็นการเพิ่มเมธอดใหม่ล้วน (additive) ถอดกลับได้โดยไม่กระทบ caller เดิม — แต่ BE-002/BE-003/BE-014/BE-018 อ้างเมธอดนี้
จึงต้องถอดพร้อมกับ task ที่พึ่งพา มิฉะนั้น consumer ใหม่จะชี้เมธอดที่ไม่มีอยู่

### Task BE-002 — Switch calculate/score to the weighted method with 2-decimal rounding

Objective: เปลี่ยน `calculate/score` (Premium, REQ-004/REQ-016) ให้เรียก `AggregateByCanonicalSubjectWeighted` แทนเมธอดเดิม และแก้การปัดเศษจาก `Math.Round(a.AverageScore, 0)` เป็นทศนิยม 2 ตำแหน่ง (จุดอ้างอิงใน row: `CompassApiController.cs:269` — ยืนยันบรรทัดกับ source ปัจจุบันก่อนแก้)
Why: REQ-016 AC1 ผ่าน AC-012.1 บังคับว่าค่าที่แสดงฝั่ง Premium ต้องเป็นทศนิยม 2 ตำแหน่ง (เช่น 67.5) — การปัดจำนวนเต็มทำให้ได้ 68 (DES-015 กฎข้อ 5)
Owner: backend-engineer
Depends on: BE-001
Traceability: REQ-004, REQ-016, AC-012.1, DES-015
Produces: none
Consumes: Contract:SubjectScoreAggregation.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แก้เฉพาะจุดเรียกใช้และจุดปัดเศษของ `calculate/score` — ค่าที่ส่งออกทาง API ฝั่ง Premium ต้องเป็นทศนิยม 2 ตำแหน่ง
การตัดระดับ strong/normal/weak ใช้ค่าหลังปัด 2 ตำแหน่ง เทียบเกณฑ์เดิม (≥80 strong, <60 weak, 60–79.99 normal)

#### Retrieval hints

Hypothesis: จุดปัดเศษและจุดเรียก aggregation ของ `calculate/score` อยู่ใน `CompassApiController` แถวบรรทัดที่ row อ้าง — เป็นสมมติฐานจนกว่า source ปัจจุบันจะยืนยัน
Query: หา CalculateScore handler และ references ของ Math.Round กับ AverageScore ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-015, Contract:SubjectScoreAggregation.v1

#### Do not modify

การปัดจำนวนเต็มของฝั่งฟรี (`analyst/{sID}`) ห้ามแตะ; เมธอด aggregation ห้ามแก้ (เป็นขอบเขต BE-001); เกณฑ์ตัดระดับเดิมห้ามเปลี่ยน

#### Acceptance criteria

AC-012.1: response ของ `calculate/score` แสดงคะแนนกลุ่มสาระถ่วงน้ำหนักเป็นทศนิยม 2 ตำแหน่ง — ตัวอย่าง 60/1.5 + 90/0.5 ต้องได้ 67.5 ไม่ใช่ 68

#### Required validation and expected evidence

ตรวจ AC-012.1 ด้วยข้อมูลตัวอย่างเดียวกับสัญญาแล้วอ่านค่าจาก response จริงของ `calculate/score` (ไม่ใช่ค่ากลาง) — บันทึก response JSON ก่อน/หลัง;
ยืนยันว่า response ฝั่งฟรีไม่เปลี่ยน

#### Rollback/compatibility notes

คืนค่า caller กลับไปเรียกเมธอดเดิมและคืน `Math.Round(..., 0)` ได้ทันทีเป็นการถอดเดี่ยว — ค่าที่เคยแสดงจะกลับไปเป็นจำนวนเต็มตามพฤติกรรมเดิม

### Task BE-003 — Switch GetSubjectAveragesAsync to the weighted method and preserve 2-decimal rounding in Gap Report (ISS-01)

Objective: (1) เปลี่ยน `GetSubjectAveragesAsync` (ข้อมูลที่ Fit Score/Gap Report ใช้ — REQ-005, REQ-006) ให้เรียก `AggregateByCanonicalSubjectWeighted` แทนเมธอดเดิม เพื่อให้กลุ่ม consumer นี้ได้ค่าและ fallback เดียวกับ consumer อื่น (2) ปรับปรุง `CompassPathCatalog.BuildAdvice` (`ClassOnlineWeb/Helper/CompassPathCatalog.cs:105`) สำหรับ Gap Report (`AI_advice/path`, REQ-006) ไม่ให้ re-round คะแนนเฉลี่ยกลุ่มสาระเป็น 0 dp (`Math.Round(avg[kv.Key], 0)`) โดยให้เก็บ `VMGapItem.Current` เป็นทศนิยม 2 ตำแหน่ง (`Math.Round(avg[kv.Key], 2)`), คำนวณ `VMGapItem.Gap = Math.Round(Math.Max(0.0, target - cur), 2)` จากค่า 2 ตำแหน่ง, และปรับ format ข้อความ `advice` แสดงทศนิยมตามจริง (`{m.Gap:0.##}`) ตามสัญญา DES-015 กฎข้อที่ 5 (ปิด ISS-01)
Why: REQ-012 ระบุ Fit Score/Gap Report เป็น consumer ตรงของสูตรถ่วงน้ำหนัก, AC-012.4 บังคับว่าทุกที่ที่สูตรถูกใช้ต้องได้เลขเดียวกันจาก fallback เดียวกัน, และสัญญา DES-015 กฎข้อที่ 5 บังคับว่าทุก endpoint ฝั่ง Premium ต้องส่งค่าเป็นทศนิยม 2 ตำแหน่ง (ไม่ re-round เป็น 0 dp ใน Gap Report เพื่อไม่ให้คะแนน 67.5 กลายเป็น 68 และ Gap เพี้ยน — ปิด ISS-01 จาก review.md)
Owner: backend-engineer
Depends on: BE-001
Traceability: REQ-012, REQ-005, REQ-006, AC-012.4, DES-015, DEC-015
Produces: none
Consumes: Contract:SubjectScoreAggregation.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

(1) เปลี่ยนแหล่งค่าของ `GetSubjectAveragesAsync` ให้เรียก `AggregateByCanonicalSubjectWeighted` — ห้ามเพิ่ม fallback ที่ caller; ผลลัพธ์ต้องเป็นค่าจากเมธอดกลางเสมอ
(2) ใน `CompassPathCatalog.BuildAdvice` (`Helper/CompassPathCatalog.cs:105`): ห้าม re-round `avg[kv.Key]` เป็นจำนวนเต็ม 0 dp โดยให้เก็บ `VMGapItem.Current` เป็นทศนิยม 2 ตำแหน่ง (`Math.Round(avg[kv.Key], 2)`), คำนวณ `VMGapItem.Gap = Math.Round(Math.Max(0.0, target - cur), 2)`, และปรับ format string ใน `parts.Add(...)` ให้แสดงทศนิยมตามจริง (`{m.Gap:0.##}`) เพื่อรองรับค่า Gap ที่มีทศนิยม เช่น 7.5

#### Retrieval hints

Hypothesis: (1) `GetSubjectAveragesAsync` เรียกเมธอด aggregation เดิมอยู่ภายใน `CompassScoreService` (2) จุด re-round 0 dp ของ Gap Report อยู่ที่ `CompassPathCatalog.BuildAdvice` บรรทัด 105 (`Helper/CompassPathCatalog.cs`) ซึ่งสร้าง `VMGapItem` และข้อความ advice ที่บรรทัด 125 — ยืนยัน symbol และ caller กับ source ปัจจุบัน
Query: หา definition ของ GetSubjectAveragesAsync ใน ClassOnlineWeb/Helper/CompassScoreService.cs และ BuildAdvice, VMGapItem ใน ClassOnlineWeb/Helper/CompassPathCatalog.cs
Provenance: DES-015, Contract:SubjectScoreAggregation.v1, DEC-015, Evidence EVD-022

#### Do not modify

ฝั่งฟรี (`analyst/{sID}`) ห้ามแตะ; เมธอด aggregation ใน `CompassScoreService` ห้ามแก้ (เป็นขอบเขต BE-001); กติกา fallback ห้ามทำซ้ำที่ caller; โครงสร้าง DTO `VMGapItem` และ `VMAiAdviceResult` ไม่ต้องแก้ type (ฟิลด์เป็น `double` อยู่แล้ว)

#### Acceptance criteria

AC-012.4: Fit Score/Gap ที่อ้างกลุ่มสาระที่เข้า fallback ต้องใช้ค่าเฉลี่ยดิบตัวเดียวกับทุกจุดอื่น — ตัวอย่าง ศิลปะ 70 และ 80 ไม่มีหน่วยกิต → ใช้ 75 ตัวเดียว ไม่ error ไม่ใช่ 0; และ Gap Report (`AI_advice/path`, REQ-006 ผ่าน `CompassPathCatalog.BuildAdvice`, ปิด ISS-01) ต้องคงทศนิยม 2 ตำแหน่งสำหรับคะแนนกลุ่มสาระถ่วงน้ำหนัก ไม่ re-round เป็น 0 dp — ตัวอย่าง คะแนนคณิตศาสตร์ 67.5 และเป้าหมาย 75.0 ต้องได้ `Current = 67.5` (ไม่ใช่ 68) และ `Gap = 7.5` (ไม่ใช่ 7) พร้อมข้อความแนะนำระบุห่างเกณฑ์ 7.5 คะแนน (`{m.Gap:0.##}`)

#### Required validation and expected evidence

ตรวจ AC-012.4 ด้วย (1) ชุดข้อมูล fallback (กลุ่มที่หน่วยกิตรวม = 0) เทียบค่าที่ Fit Score/Gap ใช้กับค่าจากเมธอดกลาง — ต้องตรงกันทุกจุด และ (2) ชุดข้อมูลทดสอบ Gap Report (ISS-01) ที่มีทศนิยม (เช่น 67.5 ต่อเป้าหมาย 75.0) ผ่าน `BuildAdvice` / `AI_advice/path` ยืนยันว่า `VMGapItem.Current` ได้ 67.5, `Gap` ได้ 7.5, และ advice text แสดงตัวเลขทศนิยมถูกต้อง — บันทึกหลักฐานการเทียบ

#### Rollback/compatibility notes

ถอดกลับได้โดยชี้ `GetSubjectAveragesAsync` กลับไปเมธอดเดิม และคืน `Math.Round(avg[kv.Key], 0)` ใน `CompassPathCatalog.BuildAdvice` — ค่า Fit Score/Gap Report จะกลับไปเป็นพฤติกรรมเดิม

## Phase 2: Module B — Premium Entitlement & API Authorization (REQ-013, REQ-014, REQ-015) 🔒 Security gate

### Task BE-013 — Verify SB PLUS column names for TSubscription and TPlan_Feature (PRE-05)

Objective: ยืนยันชื่อคอลัมน์จริงของ 2 ตาราง SB PLUS ที่ยังไม่ยืนยันกับ DB จริงก่อน BE-004 เขียน query — `TSubscription` (`subscription_id`, `sID`, `parent_code`, `status`, `expire_at`, `subscription_plan_id`) · `TPlan_Feature` (`plan_id`, `feature_id`, คอลัมน์ `display_*` ถ้ามี) · ผลที่ไม่ตรงเอกสารต้องส่งกลับ `system-analyst` ไม่ใช่เดาคอลัมน์ใกล้เคียงเอง
Why: เป็นเนื้องาน PRE-05 ภายใต้ DES-019 — เอกสาร handoff SB PLUS เคยผิดกับ DB จริงมาแล้ว 2 จุด (RISK-03) และ OQ-15(b)/(c) ยังเปิดอยู่ ผลตรวจจึงเป็นตัวกำหนดว่า query ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ (AC-013.1) จะเขียนถูกตัวได้หรือไม่
Owner: backend-engineer
Depends on: none
Traceability: REQ-013, AC-013.1, DES-019
Produces: none
Consumes: none
Risk: medium
Human gate: design-ambiguity
Status: verified

#### Scope and constraints

ตรวจกับ DB จริงรายคอลัมน์แล้วรายงานผลตรง/ไม่ตรงพร้อมหลักฐาน — งานตรวจเท่านั้น ไม่เขียน query ของ BE-004 แทน;
คำถาม "กลไกการระบุตัว feature" คือ OQ-15(a1)/(a2) เป็นการตัดสินของผู้ใช้ + ทีม SB PLUS เท่านั้น

#### Retrieval hints

Hypothesis: ชื่อตาราง/คอลัมน์ใน row มาจากเอกสาร handoff ที่เชื่อไม่ได้ทั้งฉบับ — ต้องตรวจกับ schema จริงของ `JabjaiSchoolSingleDB` ก่อนใช้
Query: หา schema จริงของ TSubscription และ TPlan_Feature ใน Target/เอกสาร SB PLUS ที่เข้าถึงได้ แล้วเทียบรายคอลัมน์
Provenance: DES-019

#### Do not modify

ห้ามเดา/สันนิษฐานชื่อคอลัมน์ใกล้เคียงเอง; `TSubcriptionPlan` ถูกถอดออกจาก Data Model แล้ว (v3) ห้ามเอากลับเข้ามา;
`TFeatureSBPlus` ไม่อยู่ในขอบเขตของ BE-013 อีกต่อไป (ยืนยันครบทั้งตารางแล้วใน v4); ห้ามตอบ OQ-15(a1)/(a2) แทนผู้ใช้/ทีม SB PLUS

#### Acceptance criteria

AC-013.1: รายงานผลตรวจคอลัมน์จริงครบ 2 ตารางถูกส่งต่อให้ BE-004 ใช้เขียน query ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ได้ทันทีโดยไม่ต้องเดา — คอลัมน์ใดไม่ตรงเอกสารต้องถูกส่งกลับ `system-analyst` แทนการเขียนต่อ

#### Required validation and expected evidence

ตรวจ AC-013.1 โดยแนบหลักฐานการตรวจรายคอลัมน์ (ผล query โครงสร้างตารางจริง) และรายการความต่างจากเอกสาร handoff ถ้ามี — งานถือเสร็จเมื่อ BE-004 รับผลตรวจไปเขียน query ได้

#### Rollback/compatibility notes

งานตรวจไม่แก้โค้ดจึงไม่มีผลย้อนกลับต่อ runtime — ถ้าผลตรวจชี้ว่าโครงสร้างจริงต่างจากที่ design บันทึก ต้องให้ `system-analyst` amend `design.md` ก่อน BE-004 เขียนต่อ

### Task BE-004 — Implement CheckEntitlement steps 1-3 (fail-closed, parameterized SQL)

Objective: implement ขั้นตอนที่ 1–3 ของ `CheckEntitlement(sID)`: raw parameterized SQL (`NpgsqlParameter` เท่านั้น ห้ามต่อ string) ผ่าน `ApiBaseController.GetSchoolConnection()` — query `TSubscription` เงื่อนไข `status IN ('Active','PendingCancel')` คู่กับ `expire_at >= NOW()` เสมอ (`expire_at IS NULL` = ไม่ผ่าน), join `TPlan_Feature` ⋈ `TFeatureSBPlus` ด้วย `pf.plan_id = @subscription_plan_id`, fail-closed เมื่อ query error/ไม่พบ record — ขั้นตอนที่ 4 ยืนยันค่า FeatureCode ฝั่งธุรกิจแล้วคือ `compass_premium` และ `compass_admin_ops` (ปิด OQ-15(a2) 2026-09-15) โดยโค้ด `CompassEntitlementService.cs` มีค่าคงที่รองรับแล้ว; การ query คอลัมน์ `"FeatureCode"` รอ devops/ทีม SB PLUS รันสคริปต์ PRE-06 ก่อน deploy จริง
Why: ปิดความเสี่ยง entitlement fail-open ของ REQ-013 (Module B Security Considerations) — ขั้นตอนที่ 4 ตัดสินทิศทางแล้วด้วยคอลัมน์ `"FeatureCode"` และยืนยันรหัสจริงแล้ว แต่คอลัมน์ใน DB จริงยังต้องรอ PRE-06 (DES-016 ขั้นตอนที่ 4) — 🔴 task นี้เป็นงาน security-grade ของเฟสที่ติดป้าย 🔒
Owner: backend-engineer
Tier: T2
Depends on: BE-013
Traceability: REQ-013, AC-013.1, AC-013.2, DES-016
Produces: Contract:PremiumEntitlement.v1
Consumes: none
Risk: security
Human gate: security, design-ambiguity
Status: verified

#### Scope and constraints

ขั้นตอนที่ 1–3 เท่านั้น: หาแถว subscription ที่ยังมีผล (เอาแถวล่าสุดแถวเดียว — `ORDER BY subscription_id DESC LIMIT 1`),
ไม่เจอ → `{ entitled: false, features: [] }`, เจอ → ดึงรายการ feature ด้วยการ join 2 ตาราง (ห้าม join สาม) ·
คำอธิบาย (`feature_description`) เป็นข้อมูลแสดงผลล้วน ไม่มีผลต่อการอนุญาต; คอลัมน์ `display_*` ยังไม่ยืนยัน → อ่านจาก
`f.feature_description` อย่างเดียวแล้วแจ้งกลับ `system-analyst` ให้ amend · ผล CheckEntitlement cache ได้ต่อ request เท่านั้น ห้าม cache ข้าม request

#### Retrieval hints

Hypothesis: `CheckEntitlement` ยังไม่มี implementation เต็มในโค้ด — จุดเชื่อมคือ `ApiBaseController.GetSchoolConnection()` และ raw SQL กับตาราง SB PLUS; ยืนยัน symbol/path กับ source ปัจจุบัน
Query: หา GetSchoolConnection ใน ClassOnlineWeb/Controllers/ApiBaseController.cs และตำแหน่งที่เหมาะสำหรับ CompassEntitlementService
Provenance: DES-016, Contract:PremiumEntitlement.v1

#### Do not modify

ห้ามต่อ string เข้า SQL เด็ดขาด; ห้าม join `TSubcriptionPlan`; ห้ามเขียน query อ้างคอลัมน์ `"FeatureCode"` ก่อน PRE-06 ยืนยันว่าถูกสร้างจริง;
ห้ามใส่เลข `feature_id` ลงโค้ดหรือ config เพื่อ "ไปต่อก่อน"; `status` ต้องรับทั้ง `'Active'` และ `'PendingCancel'` (การออกแบบที่ตั้งใจ ห้ามแก้เป็นเฉพาะ Active);
flow ผู้ปกครอง (`type=parent`) ห้าม implement รอบนี้

#### Acceptance criteria

AC-013.1: `CheckEntitlement` ตัดสินสิทธิ์จาก SB PLUS ฝั่งเซิร์ฟเวอร์เสมอ (ขั้นตอนที่ 1–3) — ไม่เชื่อ flag/ค่าใดจาก client
AC-013.2: กรณี DB ล่ม/query throw/ไม่พบ record/`expire_at` เป็น NULL → ถือว่าไม่มีสิทธิ์ทั้งหมด (fail-closed ไม่มีเส้นทาง fail-open)

#### Required validation and expected evidence

ตรวจ AC-013.1 และ AC-013.2 ด้วยกรณี: มี subscription Active, PendingCancel, หมดอายุ, expire_at NULL, query throw —
บันทึกผลตัดสินของแต่ละกรณี (ทุกกรณีล่มต้องจบที่ "ไม่มีสิทธิ์"); แสดงหลักฐานว่า SQL ทุก statement ใช้ parameter เท่านั้น;
ยืนยันว่าขั้นตอนที่ 4 ไม่ถูกเขียนและงานถูกส่งกลับ `system-analyst` ตามเงื่อนไข

#### Rollback/compatibility notes

การ implement ขั้นตอนที่ 1–3 เป็น additive ต่อระบบเดิม (ยังไม่มีใครเรียก CheckEntitlement ก่อน BE-005/006/007/012) —
ถอดได้โดยไม่กระทบ endpoint เดิม; ห้ามถอดโดยทิ้ง fail-closed ค้างเป็นครึ่ง ๆ

### Task BE-005 — Gate Premium endpoints with compass_premium (HTTP 403, Data = null)

Objective: กั้นทั้ง endpoint ด้วย feature key `compass_premium` โดยใช้ `CheckEntitlement` ตัวเดียวกัน — ไม่มีสิทธิ์ → คืน HTTP 403 พร้อม `VMResponseModel` ที่ `Data = null` ไม่คืน payload ให้หน้าจอซ่อนเอง: `calculate/score` (REQ-004/016), `AI_calculate/path` (REQ-005), `AI_advice/path` (REQ-006), `AI_mbti/questions`·`AI_mbti/answer`·`AI_mbti/latest` (REQ-007), `AI_exercise/path`·`AI_exercise/submit` (REQ-008), `certificate/issue` (REQ-011)
Why: การกั้นเดิมอยู่เฉพาะฝั่งหน้าจอ คนยิง API ตรงได้ข้อมูล Premium ฟรี — REQ-013 บังคับให้ตรวจฝั่งเซิร์ฟเวอร์และห้ามคืนข้อมูลให้หน้าจอซ่อน (DES-016 ตาราง endpoint ที่ต้องกั้น)
Owner: backend-engineer
Depends on: BE-004
Traceability: REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-011, REQ-013, AC-013.1, AC-013.2, DES-016
Produces: none
Consumes: Contract:PremiumEntitlement.v1
Risk: authorization
Human gate: security, design-ambiguity
Status: verified

#### Scope and constraints

กั้นทั้ง endpoint ทุกตัวในรายการ (แม้ฟีเจอร์บางตัวยังไม่เสร็จ — `AI_exercise/*`, `certificate/issue`);
ค่าที่ใช้ตรวจคือ feature key `compass_premium` เท่านั้น — กรณี DB ล่ม/ไม่พบ record ให้ผล fail-closed จาก CheckEntitlement (403)

#### Retrieval hints

Hypothesis: ทุก endpoint ในรายการอยู่ใน `CompassApiController` — แต่ละตัวต้องแทรกการตรวจก่อนบรรทัดที่ประกอบ payload; ยืนยันชื่อ action/เส้นทางกับ source ปัจจุบัน
Query: หา actions ของ calculate/score, AI_calculate/path, AI_advice/path, AI_mbti/*, AI_exercise/*, certificate/issue ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-016, Contract:PremiumEntitlement.v1

#### Do not modify

ห้ามคืน payload Premium แล้วให้หน้าจอซ่อน; `analyst/{sID}` ไม่อยู่ในรายการนี้ (กั้นระดับ field ต่างหากที่ BE-006 — ห้ามกั้น 403 ทั้ง endpoint ตัวนั้น);
ห้ามสร้างกลไกตรวจสิทธิ์ใหม่แทน `CheckEntitlement`

#### Acceptance criteria

AC-013.1: ทุก endpoint ในรายการตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ก่อนคืนข้อมูลเสมอ
AC-013.2: ผู้ไม่มีสิทธิ์ยิง API ตรงต้องได้ 403 พร้อม `Data = null` — ไม่ได้ข้อมูล Premium กลับไปเลยแม้หน้าจอจะซ่อนได้

#### Required validation and expected evidence

ตรวจ AC-013.1 และ AC-013.2 ต่อ endpoint ทั้งรายการด้วย request ที่มี/ไม่มีสิทธิ์ — บันทึก status code และ response body
(ต้องเป็น 403 + Data null ทุกตัวเมื่อไม่มีสิทธิ์); ยืนยันว่าไม่มี payload Premium หลุดใน response กรณีไม่มีสิทธิ์

#### Rollback/compatibility notes

การถอดต้องถอดครบทุก endpoint พร้อมกัน — ถอดเฉพาะบางตัวจะทำให้การกั้น Premium ไม่สม่ำเสมอ (บาง endpoint ยิงตรงได้);
ไม่มี schema/payload เดิมถูกเปลี่ยนรูป ฝั่งผู้มีสิทธิ์ไม่ควรเห็นความต่าง

### Task BE-006 — Field-level gating at analyst/{sID}: Boost null without entitlement

Objective: กั้นระดับ field ที่ `analyst/{sID}`: ไม่มีสิทธิ์ `compass_premium` → คืน 200 ตามปกติ (ฟีเจอร์ฟรียังทำงาน) แต่ `Subjects[].Boost` (REQ-003) ต้องเป็น `null` ทุกวิชา — ห้ามคืน 403 ทั้ง endpoint เพราะ endpoint นี้เสิร์ฟทั้งฟรีและ Premium ใน response เดียว
Why: REQ-013 กำหนดให้กั้นฝั่งเซิร์ฟเวอร์ แต่ endpoint นี้เป็นกรณีพิเศษ — การ 403 ทั้ง endpoint จะทำให้ฟีเจอร์ฟรีพัง ขัดกับการคงหน้าฟรีเดิมไว้ (DES-016 หัวข้อกรณีพิเศษ analyst/{sID})
Owner: backend-engineer
Depends on: BE-004
Traceability: REQ-003, REQ-013, AC-013.1, AC-016.6, DES-016
Produces: none
Consumes: Contract:PremiumEntitlement.v1
Risk: authorization
Human gate: security, design-ambiguity
Status: verified

#### Scope and constraints

ตัดสินเฉพาะ field `Boost` จากผล `CheckEntitlement` — ไม่มีสิทธิ์: `Boost` เป็น `null` ทุกวิชา ไม่ใช่คำนวณแล้วให้หน้าจอซ่อน;
มีสิทธิ์: ค่า `Boost` ตามปกติ · ฟิลด์ฟรีอื่น (`Subjects[].Subject/Score/Level/HighlightTopic`, `AiSummary`, `PassScore`) ไม่เกี่ยวกับการกั้นนี้

#### Retrieval hints

Hypothesis: จุดประกอบ `Boost` อยู่ใน action ของ `analyst/{sID}` ใน `CompassApiController` (row อ้าง `CompassApiController.cs:56` เป็นสมมติฐาน) — ยืนยันกับ source ปัจจุบัน
Query: หา Analyst action และ references ของ Boost ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-016

#### Do not modify

ห้ามคืน 403 ทั้ง endpoint; ห้ามแตะฟิลด์ฝั่งฟรี (`Subject/Score/Level/HighlightTopic`, `AiSummary`, `PassScore`) — คงค่าเฉลี่ยดิบและพฤติกรรมเดิมทุกอย่าง;
ห้ามใช้ flag ฝั่ง client (`localStorage['compass_premium']`) เป็นแหล่งตัดสิน

#### Acceptance criteria

AC-013.1: ค่า `Boost` ถูกตัดสินจากการตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์เสมอ (ไม่ใช่ค่าที่ client อ้าง)
AC-016.6: ส่วนฟรีของ `analyst/{sID}` ไม่เปลี่ยนแปลง — ผู้ไม่มีสิทธิ์ยังได้ 200 พร้อมฟิลด์ฟรีครบเหมือนเดิม โดย `Boost` เป็น `null` ทุกวิชา

#### Required validation and expected evidence

ตรวจ AC-013.1 และ AC-016.6 ด้วย request สองชุด (มี/ไม่มีสิทธิ์) — ชุดไม่มีสิทธิ์ต้องได้ 200, ฟิลด์ฟรีครบ, `Boost` เป็น null ทุกวิชา;
ชุดมีสิทธิ์ต้องได้ `Boost` ตามปกติ — บันทึก response ทั้งสองชุดเทียบกัน

#### Rollback/compatibility notes

ถอดการกั้น field ได้เดี่ยวโดย response กลับไปเป็นพฤติกรรมเดิม (มีค่า Boost เสมอ) — ไม่กระทบ endpoint อื่น;
ห้ามถอดโดยทิ้งสภาพ "Boost ว่างบางวิชา" ให้ต้องอ่านโค้ดเดาต่อ

### Task BE-007 — Gate recompute/* with compass_admin_ops entitlement

Objective: เพิ่มการตรวจ feature key `compass_admin_ops` (คนละ key กับ `compass_premium` โดยเจตนา) ให้ `recompute/national-stats` และ `recompute/status` โดยใช้ `CheckEntitlement` ตัวเดียวกัน — ชั้นที่ 1 จากสองชั้นของ REQ-014
Why: endpoint นี้สั่ง `TRUNCATE` สถิติทั้งเครือข่าย — ถ้าผูกกับ `compass_premium` นักเรียนที่จ่ายเงินทุกคนจะสั่งลบได้ ขัด REQ-014 ที่บังคับว่านักเรียนทั่วไปเรียกไม่ได้เด็ดขาด (DES-016 REQ-014 ชั้นที่ 1)
Owner: backend-engineer
Depends on: BE-004
Traceability: REQ-014, AC-014.1, AC-014.2, DES-016
Produces: none
Consumes: Contract:PremiumEntitlement.v1
Risk: authorization
Human gate: security, design-ambiguity
Status: verified

#### Scope and constraints

ใช้ `CheckEntitlement` ตัวเดียวกันแต่ตรวจ key `compass_admin_ops` เท่านั้น — ห้ามใช้ `compass_premium`;
`recompute/status` ต้องถูกกั้นด้วย (เปิดเผยสถานะงาน batch ระดับเครือข่าย ไม่ควรให้นักเรียนเห็น) ·
ชั้นนี้ต้องทำงานร่วมกับชั้น IP allowlist ของ BE-008 (ตรวจ IP ก่อน entitlement) — ห้ามตัดชั้นใดชั้นหนึ่ง

#### Retrieval hints

Hypothesis: `recompute/national-stats` และ `recompute/status` อยู่ใน `CompassApiController` โดยมี `TODO(BE-007)` คาไว้ที่จุดตรวจ entitlement — ยืนยันกับ source ปัจจุบัน
Query: หา RecomputeNationalStats, RecomputeStatus และ TODO(BE-007) ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-016

#### Do not modify

ห้ามผูก key นี้เข้าแพ็กเกจที่ขายให้นักเรียน/ผู้ปกครอง (เป็นการตั้งค่าฝั่ง SB PLUS — PRE-02); ห้ามใช้ key เดียวกับ `compass_premium`;
ห้ามถอดชั้น IP allowlist หรือสลับลำดับการตรวจทั้งสองชั้น

#### Acceptance criteria

AC-014.1: `recompute/national-stats` ถูกจำกัดด้วยการตรวจ `compass_admin_ops` ฝั่งเซิร์ฟเวอร์ก่อนสั่งงาน
AC-014.2: นักเรียนทั่วไปที่ล็อกอินอยู่เรียก `recompute/national-stats` และ `recompute/status` ไม่ได้เด็ดขาด

#### Required validation and expected evidence

ตรวจ AC-014.1 และ AC-014.2 ด้วย request ของบัญชีที่มี/ไม่มี `compass_admin_ops` ต่อ endpoint ทั้งสอง — บันทึก status code;
ยืนยันว่าการตรวจเกิดก่อนการเริ่ม batch จริงและไม่มีเส้นทางข้ามการตรวจ

#### Rollback/compatibility notes

ถอดชั้น entitlement นี้ได้เดี่ยว แต่ห้ามถอดโดยที่ชั้น IP allowlist (BE-008) ยังไม่ทำงาน — สองชั้นต้องมีอย่างน้อยหนึ่งชั้นเสมอ;
ผู้มีสิทธิ์จริง (staff/internal) ต้องยังเรียกได้หลังถอด/แก้

### Task BE-008 — IP/internal-network allowlist in front of recompute/*

Objective: เพิ่มชั้นตรวจ IP/internal-network allowlist หน้า `recompute/*` (ตรวจก่อนชั้น entitlement) — อ่านรายการที่อนุญาตจาก configuration (`Web.config`/environment) เท่านั้น ห้าม hardcode; ไม่ได้ตั้งค่า = ปฏิเสธทุก request (fail-closed); ไม่ผ่าน → 404/403 โดยไม่เปิดเผยว่ามี endpoint นี้อยู่
Why: REQ-014 บังคับสองชั้น — ชั้น IP เป็นตัวกันไม่ให้ความผิดพลาดฝั่งการตั้งค่า SB PLUS (ผูก key ผิดแพ็กเกจ) กลายเป็นการลบข้อมูลทั้งเครือข่ายจริง (DES-016 REQ-014 ชั้นที่ 2; RISK-07)
Owner: backend-engineer
Depends on: none
Traceability: REQ-014, AC-014.1, AC-014.2, DES-016
Produces: none
Consumes: none
Risk: security
Human gate: security, design-ambiguity
Status: verified

#### Scope and constraints

ชั้นนี้รันก่อนการตรวจ entitlement เสมอ — ความซ้ำซ้อนของสองชั้นคือจุดประสงค์ ห้ามตัดชั้นใดชั้นหนึ่ง ·
ค่าเริ่มต้นเมื่อไม่ได้ตั้งค่า = ปฏิเสธทุก request (ปลอดภัยแต่ใช้งานไม่ได้ จึงต้องตั้งค่า PRE-03 ก่อน deploy) ·
หมายเหตุ: task นี้เองไม่ขึ้นกับ OQ-15(a1)/(a2) — gate design-ambiguity มาจาก parity ของหัวข้อ DES-016 ทั้งหัวข้อ ไม่ใช่เงื่อนไขบล็อกของงานนี้

#### Retrieval hints

Hypothesis: มี guard ฝั่ง network access อยู่แล้วใน Target (row เดิมของ design อ้าง `InternalNetworkAccessGuard`/`CompassNetworkAccessGuard`) — งานนี้อาจเป็นการเชื่อม/ปรับให้ครบ ไม่ใช่เขียนใหม่ทั้งหมด; ยืนยันกับ source ปัจจุบัน
Query: หา InternalNetworkAccessGuard, CompassNetworkAccessGuard, IsRecomputeNetworkAllowed ใน ClassOnlineWeb/Helper และจุดเรียกหน้า recompute/*
Provenance: DES-016

#### Do not modify

ห้าม hardcode รายการ IP/ช่วง network ในโค้ด; ห้ามเปลี่ยนพฤติกรรม fail-closed เมื่อไม่ได้ตั้งค่า;
ห้ามเปิดเผยการมีอยู่ของ endpoint ใน response เมื่อไม่ผ่าน (404/403 ตามที่ design กำหนด)

#### Acceptance criteria

AC-014.1: request ที่มาจาก IP ภายในรายการอนุญาตเท่านั้นที่ผ่านชั้นนี้ไปถึงการตรวจ entitlement ของ `recompute/*`
AC-014.2: request จากนักเรียน/IP ภายนอก และกรณีที่ config ไม่ได้ตั้งค่า ต้องถูกปฏิเสธทุกกรณี (fail-closed) โดยไม่เปิดเผยว่ามี endpoint

#### Required validation and expected evidence

ตรวจ AC-014.1 และ AC-014.2 ด้วยกรณี: IP ในรายการ, IP นอกรายการ, config ว่าง — บันทึก status code และ response ของแต่ละกรณี;
ยืนยันลำดับการตรวจว่าชั้น IP รันก่อนชั้น entitlement; ยืนยันว่าไม่มี IP ใดถูกเขียนในโค้ด (grep หาค่าคงที่)

#### Rollback/compatibility notes

ถอดชั้นนี้ได้เดี่ยว แต่ต้องเหลือชั้น entitlement (BE-007) คุม `recompute/*` อย่างน้อยหนึ่งชั้นเสมอ —
การตั้งค่า PRE-03 ใน config ไม่ถูกแตะโดยการถอดโค้ด

### Task BE-009 — AI_exercise/path: identity from JWT only

Objective: `AI_exercise/path` (`CompassApiController.cs:643` — ยืนยันบรรทัดกับ source ปัจจุบัน): เปลี่ยนจากอ่าน `request.SID` เป็น `UserData.UserID` (JWT); เพิ่มตรวจ `ud == null → 401`; คง field `SID` ไว้ใน request DTO ตามเดิมแต่ server ต้องไม่อ่านค่านั้นเลย; `SID` ใน response ต้องเป็น `UserData.UserID` เสมอ
Why: REQ-015 — endpoint นี้ยังรับ `SID` จาก client เป็นช่อง IDOR และยังไม่มีการตรวจ `ud == null` ต่างจาก endpoint หลักที่แก้แล้ว (DES-017)
Owner: backend-engineer
Depends on: none
Traceability: REQ-009, REQ-015, AC-009.2, AC-015.1, DES-017
Produces: none
Consumes: none
Risk: authorization
Human gate: security
Status: verified

#### Scope and constraints

แก้เฉพาะเรื่องตัวตนของ endpoint นี้ — ตรรกะที่เหลือของ `AI_exercise/path` (ยังไม่เสร็จตาม REQ-008) ไม่อยู่ในขอบเขต;
พฤติกรรม "IGNORED by design" ต้องเหมือน endpoint หลักที่ทำไว้แล้ว

#### Retrieval hints

Hypothesis: จุดที่อ่าน `request.SID` อยู่ที่บรรทัดที่ row/design อ้างใน `CompassApiController` — เป็นสมมติฐานจนกว่า source ปัจจุบันจะยืนยันบรรทัดจริง
Query: หา AiExercisePath และการอ่าน request.SID ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs พร้อม pattern "IGNORED by design" ที่ endpoint หลักใช้
Provenance: DES-017

#### Do not modify

ห้ามถอด field `SID` ออกจาก request DTO (`VMAdvicePathRequest`/`VMExerciseSubmitRequest` กลุ่มนี้) เพราะหน้าจอปัจจุบันยังส่งมา —
แต่ server ห้ามอ่านค่านั้น; `SID` ใน response ห้ามสะท้อนค่าที่ client ส่งมา

#### Acceptance criteria

AC-015.1: `AI_exercise/path` ใช้ตัวตนจาก `UserData.UserID` (JWT) เสมอ — ค่า `SID` ที่ client ส่งมาถูกละเว้นทุกครั้ง และ `ud == null` → 401
AC-009.2: การแก้เลขนักเรียนใน request ต้องไม่ทำให้เห็น/ส่งผลของเด็กคนอื่นได้

#### Required validation and expected evidence

ตรวจ AC-015.1 และ AC-009.2 ด้วย request สองชุด (ส่ง `SID` ของตัวเอง / ส่ง `SID` ของคนอื่น พร้อมไม่ส่ง) — ผลต้องเป็นข้อมูลของ
ผู้ใช้จาก JWT เสมอ ไม่ต่างตามค่าที่ส่งมา; บันทึก response และกรณี 401 เมื่อไม่มี session

#### Rollback/compatibility notes

เป็นการแก้จุดเดียวต่อ endpoint — ถอดกลับได้เดี่ยว แต่การถอดจะเปิดช่อง IDOR เดิมคืน จึงต้องถอดพร้อมกันทั้ง BE-009/BE-010/BE-011
ถ้ามีเหตุถอน; field `SID` คงอยู่ใน DTO ทำให้หน้าจอเดิมไม่พัง

### Task BE-010 — AI_exercise/submit: identity from JWT only

Objective: แก้แบบเดียวกับ BE-009 ให้ `AI_exercise/submit` (`CompassApiController.cs:675` — ยืนยันบรรทัดกับ source ปัจจุบัน): ใช้ `UserData.UserID` (JWT) แทน `request.SID`, เพิ่มตรวจ `ud == null → 401`, คง field `SID` ใน request DTO แต่ server ไม่อ่าน, `SID` ใน response เป็น `UserData.UserID` เสมอ
Why: REQ-015 บังคับปิดให้ครบทุกจุด ไม่ใช่แค่จุดเดียว — endpoint นี้เป็นหนึ่งในสามจุดที่ยังรับ `SID` จาก client (DES-017)
Owner: backend-engineer
Depends on: none
Traceability: REQ-009, REQ-015, AC-009.2, AC-015.1, DES-017
Produces: none
Consumes: none
Risk: authorization
Human gate: security
Status: verified

#### Scope and constraints

แก้เฉพาะเรื่องตัวตน — logic การตรวจให้คะแนน/บันทึกผลของ submit ไม่อยู่ในขอบเขต (ยังเป็น TODO ของ REQ-008 ตามเดิม)

#### Retrieval hints

Hypothesis: จุดอ่าน `request.SID` ของ submit อยู่ติดกับของ `AI_exercise/path` ในไฟล์เดียวกัน — ยืนยันบรรทัดจริงกับ source ปัจจุบัน
Query: หา AiExerciseSubmit และการอ่าน request.SID ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-017

#### Do not modify

ห้ามถอด field `SID` ออกจาก `VMExerciseSubmitRequest`; server ห้ามอ่านค่าที่ client ส่งมา; response ห้ามสะท้อนค่า client

#### Acceptance criteria

AC-015.1: `AI_exercise/submit` ใช้ `UserData.UserID` เสมอ — ค่า `SID` จาก client ถูกละเว้น และ `ud == null` → 401
AC-009.2: การแก้เลขนักเรียนใน request ต้องไม่ทำให้เห็น/ส่งผลของเด็กคนอื่นได้

#### Required validation and expected evidence

ตรวจ AC-015.1 และ AC-009.2 แบบเดียวกับ BE-009 (ส่ง SID ตัวเอง/คนอื่น/ไม่ส่ง) — บันทึกผลว่าผลลัพธ์ผูกกับ JWT เสมอ;
ยืนยันบันทึกผล (ถ้ามี) ผูกกับ `UserData.UserID` ไม่ใช่ค่าที่ส่งมา

#### Rollback/compatibility notes

เหมือน BE-009 — ถอด/คงต้องตัดสินร่วมกันทั้งสาม endpoint (BE-009/010/011) เพราะ REQ-015 นับเป็นชุดเดียว;
หน้าจอเดิมไม่พังเพราะ field `SID` คงอยู่ใน DTO

### Task BE-011 — certificate/issue: identity-only fix

Objective: แก้แบบเดียวกับ BE-009 ให้ `certificate/issue` (`CompassApiController.cs:729` — ยืนยันบรรทัดกับ source ปัจจุบัน): ใช้ `UserData.UserID` (JWT) แทน `request.SID`, เพิ่มตรวจ `ud == null → 401`, คง field `SID` ใน request DTO แต่ server ไม่อ่าน, `SID` ใน response เป็น `UserData.UserID` เสมอ — **แก้เฉพาะเรื่อง identity เท่านั้น ห้ามแตะ business logic การออกใบรับรอง** (ขอบเขตของ module `sb-compass-certificate` แยก)
Why: REQ-015 ระบุใช้กับ endpoint ใบรับรองด้วยแม้ module จะแยกไปทำภายหลัง เพราะโค้ด stub อยู่ไฟล์เดียวกัน ต้องไม่ทิ้งช่องโหว่ค้าง (DES-017)
Owner: backend-engineer
Depends on: none
Traceability: REQ-011, REQ-015, AC-011.1, AC-015.1, DES-017
Produces: none
Consumes: none
Risk: authorization
Human gate: security
Status: verified

#### Scope and constraints

แก้เฉพาะแหล่งตัวตน — การตรวจว่าสอบผ่านจริง/เลขใบรับรองที่เดาได้ เป็นขอบเขต `sb-compass-certificate` ห้ามแก้ในรอบนี้

#### Retrieval hints

Hypothesis: `certificate/issue` เป็น stub ใน `CompassApiController` ที่อ่าน `request.SID` เหมือนสอง endpoint ข้างบน — ยืนยันบรรทัดจริงกับ source ปัจจุบัน
Query: หา IssueCertificate และการอ่าน request.SID ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-017

#### Do not modify

ห้ามแตะ business logic การออกใบรับรอง (เงื่อนไขอนุมัติ/เลขใบรับรอง/รหัสตรวจสอบ) — ไม่ใช่ขอบเขตโมดูลนี้;
ห้ามถอด field `SID` ออกจาก `VMCertificateRequest`; response ห้ามสะท้อนค่า client

#### Acceptance criteria

AC-015.1: `certificate/issue` ใช้ `UserData.UserID` เสมอ — ค่า `SID` จาก client ถูกละเว้น และ `ud == null` → 401
AC-011.1: งานนี้ไม่พัฒนากติกาใบรับรองต่อในโมดูลนี้ — แก้แค่ identity ตามขอบเขต REQ-015

#### Required validation and expected evidence

ตรวจ AC-015.1 และ AC-011.1 ด้วย request ที่ส่ง `SID` ต่างคน/ไม่ส่ง — ผลออกใบรับรองต้องผูกกับผู้ใช้จาก JWT เสมอ;
diff ต้องแสดงว่าไม่มีการแตะ logic การอนุมัติ/เลขใบรับรอง

#### Rollback/compatibility notes

ถอด/คงตัดสินร่วมกับ BE-009/BE-010 (ชุด REQ-015 เดียวกัน) — การถอดจะเปิดช่อง IDOR ของ endpoint ใบรับรองคืน;
business logic เดิมไม่ถูกแตะจึงไม่มีผลต่อกติกาใบรับรอง

### Task BE-012 — Gate the three debug endpoints with compass_admin_ops

Objective: กั้น debug endpoints ทั้ง 3 ตัว (`debug/scores`, `debug/my-stat`, `debug/national-stats`) ด้วย feature key `compass_admin_ops` ตามข้อเสนอของ `system-analyst` ที่ผู้ใช้ยืนยันปิด OQ-17 (2026-09-01)
Why: `debug/my-stat` คืนข้อมูลอันดับ/ระดับชั้นซึ่งเป็นเนื้อหา Premium โดยไม่ผ่านการเช็ค → ทางอ้อมข้าม REQ-013 และ `debug/national-stats` คืนสถิติทั้งเครือข่ายให้นักเรียนที่ล็อกอินทุกคน — การเช็คเดิมมีแค่ `ud == null` (ล็อกอินหรือยัง) ไม่ใช่การเช็คสิทธิ์ (OQ-17; กลไก DES-016)
Owner: backend-engineer
Depends on: BE-004
Traceability: REQ-013, AC-013.1, DES-016
Produces: none
Consumes: Contract:PremiumEntitlement.v1
Risk: authorization
Human gate: security, design-ambiguity
Status: verified

#### Scope and constraints

กั้นครบทั้ง 3 ตัวด้วย `compass_admin_ops` (ไม่ถอดออก ไม่คงไว้แบบเดิม) — การปิด OQ-17 คือการตัดสิน "จะกั้นแบบไหน"
การยืนยันว่า implement ครบจริงเป็นของ `security` ตอน audit Module B

#### Retrieval hints

Hypothesis: debug endpoints ทั้งสามอยู่ใน `CompassApiController` (row อ้าง `:761`, `:782`, `:793` เป็นสมมติฐาน) — ตรวจด้วยว่ามี `ud == null` เท่านั้น ไม่มีการเช็คสิทธิ์
Query: หา DebugScores, DebugMyStat, DebugNationalStats ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-016

#### Do not modify

ห้ามถอด debug endpoints ออก (มติ OQ-17 คือกั้น ไม่ใช่ลบ); ห้ามใช้ `compass_premium` แทน `compass_admin_ops`;
พฤติกรรมเนื้อหาของทั้งสาม endpoint ไม่เปลี่ยน — เพิ่มการกั้นหน้าเข้าเท่านั้น

#### Acceptance criteria

AC-013.1: debug endpoints ทั้ง 3 ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ด้วย `compass_admin_ops` ก่อนคืนข้อมูลเสมอ

#### Required validation and expected evidence

ตรวจ AC-013.1 ต่อ endpoint ทั้งสามด้วยบัญชีที่มี/ไม่มี `compass_admin_ops` — บันทึก status code (ไม่มีสิทธิ์ต้องไม่ได้ข้อมูล);
ยืนยันว่า `debug/national-stats` ไม่คืนสถิติเครือข่ายให้บัญชีนักเรียนอีกต่อไป

#### Rollback/compatibility notes

ถอดการกั้นได้เดี่ยวต่อ endpoint แต่ต้องไม่ทำให้เกิดช่องข้าม REQ-013 ค้างช่วงถอด — ถอดควรทำครบทั้งสามพร้อมกัน;
ไม่มี payload/schema เดิมถูกเปลี่ยน

## Phase 3: Module C — National Stats Alignment (REQ-004 × REQ-012 + REQ-017 + DES-012)

### Task BE-014 — Batch recompute: weighted scores + StddevScore + PascalCase rename

Objective: `CompassRankingService.RecomputeAsync` (batch, `:362`): เปลี่ยนการคำนวณคะแนนกลุ่มสาระต่อนักเรียนจาก `AggregateByCanonicalSubject` เป็น `AggregateByCanonicalSubjectWeighted` — **รวมงาน REQ-017** (คอลัมน์ `"StddevScore"` ใหม่บน `TCompassLevelSubjectStat` ต้องอยู่ใน `CREATE TABLE IF NOT EXISTS` ของ `EnsureTables` ตั้งแต่แรก, population stddev หาร `n` (ใน C# หารด้วย `n` ไม่ใช่ `n−1` — ห้าม sample stddev), `MIN_N_FOR_STDDEV = 30` เก็บเป็นค่าคงที่มีชื่อ, `n < 30` → `"StddevScore"` เป็น `NULL` ไม่ใช่ 0, `n ≥ 30` ทุกคนเท่ากันจริง → `0`, ประชากร/ค่าที่ใช้ต้องเป็นชุดถ่วงน้ำหนักเดียวกับ `"MeanScore"` ของแถวเดียวกัน, ห้าม backfill แยก ห้าม incremental) **และงาน rename PascalCase** (เปลี่ยนชื่อตาราง/คอลัมน์เป็น `public."TCompassXxx"`/`"PascalCase"` พร้อม quote ครบ ทั้ง `CompassRankingService.cs` 19 จุด และ `CompassMbtiStore.cs` 3 จุด — ทำ rename ก่อนหรือพร้อมกับงาน weighted ในรอบเดียว **ห้ามเขียน snake_case ไปก่อนแล้วค่อยแก้**; ห้ามคง `CREATE TABLE IF NOT EXISTS` ของชื่อเดิมไว้ในโค้ดคู่กับของใหม่) ตามที่ Module C รวมไว้
Why: batch ต้องใช้สูตรเดียวกับ request-time มิฉะนั้นอันดับเพี้ยนแบบเป็นระบบ (ผู้ใช้ยืนยัน 2026-08-25) — `"StddevScore"` เป็นตัวหาร T-Score ของ `sb-compass-faculty-match` ที่อ่านอย่างเดียว และ rename พังแบบเงียบได้ 2 ทาง (ลืม quote / แก้ไม่ครบทุกจุด — RISK-10) (DES-021)
Owner: backend-engineer
Tier: T3
Depends on: BE-001
Traceability: REQ-004, REQ-010, REQ-017, AC-004.2, AC-017.1, AC-017.2, AC-017.3, DES-021
Produces: Contract:NationalStatsBatch.v1
Consumes: Contract:SubjectScoreAggregation.v1
Risk: schema, breaking-contract
Human gate: schema, breaking-contract
Status: verified

#### Scope and constraints

ทั้งสามงาน (weighted / `"StddevScore"` / rename) ลงในรอบ implement เดียวของ `RecomputeAsync` — สูตร ตรรกะ และค่าคงที่ทุกตัว
ของ REQ-010 เดิมไม่เปลี่ยน (สถานะ idle/running/done/failed, กันสั่งซ้อน, failed แล้วไปต่อ, ตารางว่าง → คืนค่าว่าง/0 ไม่ล้ม);
rename เป็นการเปลี่ยนชื่อล้วน ห้ามถือเป็นโอกาสแก้พฤติกรรม

#### Retrieval hints

Hypothesis: จุดแก้อยู่ใน `CompassRankingService.cs` (`RecomputeAsync`, `EnsureTables`, `INSERT`, `TRUNCATE`, `SELECT`) และ `CompassMbtiStore.cs` (`EnsureTable`, `INSERT ... ON CONFLICT`, `SELECT`) — ระวัง `ON CONFLICT ("SchoolID", "SID") DO UPDATE SET` ต้อง quote ทุกคอลัมน์ในนั้นด้วย; ยืนยันบรรทัดกับ source ปัจจุบัน
Query: หา RecomputeAsync, EnsureTables, MinNForStddev, TCompassLevelSubjectStat, TCompassMbtiResult ใน ClassOnlineWeb/Helper/CompassRankingService.cs และ CompassMbtiStore.cs
Provenance: DES-021, Contract:NationalStatsBatch.v1

#### Do not modify

ห้ามเขียนชื่อ snake_case ใดค้างไว้ในโค้ดหรือคง DDL ชื่อเดิมคู่กับของใหม่; ห้าม sample stddev (หาร `n−1`) ห้ามแก้ `MIN_N_FOR_STDDEV`
โดยไม่ amend; ห้ามทำ `"StddevScore"` เป็น backfill/incremental; ห้ามแตะพฤติกรรม REQ-010 เดิม; ตารางของโมดูลอื่น
(`sb-compass-faculty-match` Module K) อ่านอย่างเดียว ห้ามนิยาม DDL แทนโมดูลนั้น

#### Acceptance criteria

AC-004.2: batch คำนวณล่วงหน้าเก็บลงตารางสถิติ (`public."TCompassLevelSubjectStat"`, `public."TCompassStudentLevelScore"`)
แล้ว request อ่านจากตารางนั้น — ค่ากลุ่มสาระต่อนักเรียนเป็นค่าถ่วงน้ำหนักแล้ว
AC-017.1: คอลัมน์ stddev เพิ่มแบบ additive เท่านั้น — คอลัมน์เดิมทุกคอลัมน์คงเดิม และ consumer เดิมที่อ่าน mean ทำงานเหมือนเดิม
AC-017.2: stddev ถูกคำนวณและเขียนพร้อม mean ในรอบ batch เดียวกัน (ล้างตารางแล้วเขียนใหม่ทุกครั้ง) — ไม่ใช่ backfill ไม่ใช่ incremental
AC-017.3: การเพิ่ม stddev ไม่กระทบพฤติกรรมเดิมของ REQ-010 (สถานะ batch, กันสั่งซ้อน, โรงเรียนพลาดไม่ล้มทั้ง batch)

#### Required validation and expected evidence

ตรวจ AC-004.2, AC-017.1, AC-017.2, AC-017.3 หลังรัน batch: ตารางใหม่มีแถวจริง, ค่ากลุ่มสาระเป็นค่าถ่วงน้ำหนัก, แถวที่ `n < 30`
มี stddev เป็น NULL (ไม่ใช่ 0) และแถวทุกคนเท่ากันจริงมี 0; **นับจำนวนจุด rename ครบ 22 จุดใน 2 ไฟล์** (ตรวจแบบนับจำนวน ไม่สุ่ม —
RISK-10) และตรวจว่า quote identifier ครบทุกจุด; บันทึก DDL ที่ `EnsureTables` สร้างจริง

#### Rollback/compatibility notes

ตารางทั้งสามยังไม่เคยถูกสร้างในฐานข้อมูลใด — ไม่มี migration/rename script; ถอดโค้ดกลับได้โดย `EnsureTables`/`EnsureTable`
ที่เหลืออยู่สร้างตารางชื่อใดชื่อหนึ่งได้เอง แต่ห้ามสลับข้ามรอบกับข้อมูลที่ recompute แล้ว — หลัง deploy ต้อง recompute ใหม่ทั้งเครือข่าย
(ดู Sequencing Notes) ก่อนเปิดใช้

### Task BE-015 — RecomputeAsync OverallAvg from already-weighted values

Objective: `RecomputeAsync` (`:365`): เปลี่ยนค่า overall ต่อนักเรียนจาก `subjAvgs.Average(a => a.AverageScore)` เป็นค่าเฉลี่ยธรรมดาของคะแนนกลุ่มสาระที่**ถ่วงน้ำหนักมาแล้ว** (ไม่ถ่วงน้ำหนักซ้ำอีกชั้น) — ผู้ implement ต้องยืนยันด้วยว่าจำเป็นต้องแก้บรรทัดจริงหรือไม่ (ขึ้นกับว่า `subjAvgs` มาจากเมธอดถ่วงน้ำหนักของ BE-014 แล้วหรือยัง)
Why: นิยามของ overall ใน batch คือเฉลี่ยของค่ากลุ่มสาระที่ถ่วงน้ำหนักแล้ว — หน่วยกิตถูกใช้ไปแล้วตอนยุบวิชาย่อยเข้ากลุ่มสาระ (DES-021 ตาราง `:365`); gate schema/breaking-contract มาจาก parity ของหัวข้อ DES-021 ทั้งหัวข้อ (Phase 3 ลง rename + DDL รอบเดียวกัน)
Owner: backend-engineer
Depends on: BE-014
Traceability: REQ-004, AC-004.1, AC-004.2, DES-021
Produces: none
Consumes: none
Risk: medium
Human gate: schema, breaking-contract
Status: verified

#### Scope and constraints

แก้เฉพาะสูตร overall ต่อนักเรียนใน batch — ค่าที่เขียนลง `public."TCompassStudentLevelScore"` ต้องมาจากค่ากลุ่มสาระถ่วงน้ำหนักชุดเดียวกับ
ที่ BE-014 คำนวณ; ยืนยันก่อนแก้ว่าค่าอินพุตเป็นค่าถ่วงน้ำหนักแล้วจริง กันการถ่วงซ้ำสองชั้น

#### Retrieval hints

Hypothesis: บรรทัด `subjAvgs.Average(a => a.AverageScore)` ใน `RecomputeAsync` คือจุดเปลี่ยน — อินพุต `subjAvgs` ต้องมาจาก `AggregateByCanonicalSubjectWeighted` ของ BE-014 แล้ว; ยืนยันบรรทัดกับ source ปัจจุบัน
Query: หา OverallAvg และการเรียก aggregation ภายใน RecomputeAsync ใน ClassOnlineWeb/Helper/CompassRankingService.cs
Provenance: DES-021

#### Do not modify

ห้ามถ่วงน้ำหนักซ้ำอีกชั้น; ห้ามแตะสูตรรายกลุ่มสาระของ BE-014; ห้ามแตะ `RankInLevel` นอกเหนือจากที่ค่าอินพุตเปลี่ยนตาม

#### Acceptance criteria

AC-004.1: อันดับ = จำนวนคนที่ overall สูงกว่า + 1 ภายในระดับชั้นเดียวกัน — ค่า overall ที่ใช้จัดอันดับต้องมาจากสูตรใหม่นี้
AC-004.2: ค่า overall ที่เขียนลงตารางมาจาก batch รอบนี้ ไม่ใช่ค่าคำนวณสดต่างสูตร

#### Required validation and expected evidence

ตรวจ AC-004.1 และ AC-004.2 ด้วยชุดข้อมูลที่ค่าถ่วงน้ำหนักต่างจากค่าดิบชัดเจน — เทียบ overall ก่อน/หลังแก้และยืนยันว่าไม่เท่ากับ
การถ่วงซ้ำ; บันทึกค่าที่เขียนลงตารางจริงหลัง batch

#### Rollback/compatibility notes

คืนสูตรเดิมได้เดี่ยว แต่ค่าในตารางที่ recompute ไปแล้วต้อง recompute ใหม่ให้สอดคล้อง — ห้ามปล่อยค่าสองสูตรปนกันในตารางเดียว;
เปลี่ยนต้องพร้อมกับ BE-014 ในรอบ deploy เดียวกัน

### Task BE-016 — RecomputeAsync MeanScore per level x subject from weighted values

Objective: `RecomputeAsync` (`:382`, `:409`): เปลี่ยน mean ต่อ (ระดับชั้น × กลุ่มสาระ) จากเฉลี่ยของค่าเฉลี่ยดิบ เป็นเฉลี่ยของค่าที่**ถ่วงน้ำหนักแล้ว**
Why: mean นี้ถูกเขียนลง `public."TCompassLevelSubjectStat"` เพื่อเทียบข้ามโรงเรียน และเป็นประชากรเดียวกับที่ `"StddevScore"` ใช้ — ต้องมาจากค่าถ่วงน้ำหนักชุดเดียวกันมิฉะนั้น T-Score ปลายทางเพี้ยนแบบไม่มีอะไรฟ้อง (DES-021 ตาราง `:382`/`:409` + § `"StddevScore"` ข้อ 1)
Owner: backend-engineer
Depends on: BE-014
Traceability: REQ-004, REQ-017, AC-004.1, AC-004.2, DES-021
Produces: none
Consumes: none
Risk: medium
Human gate: schema, breaking-contract
Status: verified

#### Scope and constraints

แก้เฉพาะสูตร mean ต่อ (ระดับชั้น × กลุ่มสาระ) — ประชากรที่ใช้ต้องเป็นชุดเดียวกับที่นับเข้า `"StudentCount"` และที่ stddev ใช้;
ค่าคะแนนรายนักเรียนที่เข้าสูตรคือค่าถ่วงน้ำหนักแล้วจาก BE-014

#### Retrieval hints

Hypothesis: สองจุดคำนวณ mean อยู่ใน `RecomputeAsync` (จุดเขียน `"MeanScore"` ของระดับชั้น × กลุ่มสาระ) — ยืนยันบรรทัดกับ source ปัจจุบัน
Query: หา MeanScore และจุด INSERT ลง TCompassLevelSubjectStat ใน ClassOnlineWeb/Helper/CompassRankingService.cs
Provenance: DES-021

#### Do not modify

ห้ามใช้ค่าเฉลี่ยดิบในสูตรใหม่; ห้ามแตะประชากร/`"StudentCount"` ให้ต่างจากที่ stddev ใช้; ห้ามแตะเกณฑ์/พฤติกรรม REQ-010 เดิม

#### Acceptance criteria

AC-004.1: ค่า mean ใหม่ต้องทำให้การเทียบ/อันดับที่อ่านจากตารางสอดคล้องกับค่าถ่วงน้ำหนักของ batch ทั้งระบบ
AC-004.2: mean ที่เขียนลงตารางคำนวณจากค่ากลุ่มสาระถ่วงน้ำหนักของ batch รอบเดียวกัน

#### Required validation and expected evidence

ตรวจ AC-004.1 และ AC-004.2 โดย recompute ด้วยชุดข้อมูลที่ค่าถ่วงน้ำหนักต่างจากค่าดิบชัดเจน แล้วอ่าน `"MeanScore"` จากตารางจริงเทียบกับการคำนวณด้วยมือ;
ยืนยันว่า stddev ของแถวเดียวกันใช้ประชากรชุดเดียวกัน

#### Rollback/compatibility notes

คืนสูตรเดิมต้อง recompute ใหม่ทั้งเครือข่ายให้ค่าในตารางสอดคล้อง — เปลี่ยน/ถอดต้องอยู่ในรอบ deploy เดียวกับ BE-014/BE-015/BE-017 และตามด้วย recompute (ดู Sequencing Notes)

### Task BE-017 — GetStudentNationalStatsAsync: request-time overall matches batch formula

Objective: `GetStudentNationalStatsAsync` (`:175`): เปลี่ยนการคำนวณ `overall` แบบสดตอน request จาก `agg.Average(a => a.AverageScore)` เป็นสูตรเดียวกับที่ batch ใช้ (`AggregateByCanonicalSubjectWeighted`) เพื่อไม่ให้อันดับเพี้ยนจากการเทียบเลขถ่วงน้ำหนักกับเลขไม่ถ่วงน้ำหนัก
Why: `RankInLevel` เทียบค่าสดตอน request กับกองค่า overall ในตาราง — ถ้าเปลี่ยนแค่ฝั่ง batch จะกลายเป็นการเอาเลขถ่วงน้ำหนักไปเทียบกับกองเลขไม่ถ่วงน้ำหนัก อันดับเพี้ยนอย่างเป็นระบบ (DES-021 "ทำไมต้องเปลี่ยนทั้งคู่พร้อมกัน")
Owner: backend-engineer
Depends on: BE-001
Traceability: REQ-004, AC-004.1, DES-021
Produces: none
Consumes: none
Risk: medium
Human gate: schema, breaking-contract
Status: verified

#### Scope and constraints

แก้เฉพาะสูตร `overall` ที่ใช้จัดอันดับตอน request — ต้องเป็นเมธอดกลางเดียวกับ batch ไม่ใช่สูตรเลียนแบบ;
ค่าที่เทียบกับตารางต้องมาจากสูตรเดียวกันทุกประการ

#### Retrieval hints

Hypothesis: จุดคำนวณสดและ `RankInLevel` อยู่ใน `GetStudentNationalStatsAsync` แถว `:175`/`:198-200` — ยืนยันบรรทัดกับ source ปัจจุบัน
Query: หา GetStudentNationalStatsAsync และ RankInLevel ใน ClassOnlineWeb/Helper/CompassRankingService.cs
Provenance: DES-021

#### Do not modify

ห้ามใช้สูตรคู่ขนานที่คล้ายแต่ไม่ใช่เมธอดกลาง; ห้ามแตะกฎการนับอันดับ (จำนวนคนที่สูงกว่า + 1); ห้ามแตะพฤติกรรมตารางว่าง (คืนค่าว่าง/0 ไม่ล้ม)

#### Acceptance criteria

AC-004.1: อันดับตอน request คำนวณจากค่า overall ที่ใช้สูตรถ่วงน้ำหนักเดียวกับ batch — เลขสองฝั่งเทียบกันได้โดยตรง

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วยชุดข้อมูลที่ค่าถ่วงน้ำหนักต่างจากค่าดิบชัดเจน — เทียบอันดับที่ request คืนกับการนับจากตารางโดยตรง ต้องตรงกัน;
บันทึกหลักฐานการเทียบก่อน/หลังแก้

#### Rollback/compatibility notes

คืนสูตรเดิมได้เดี่ยว แต่ห้ามคืนฝั่ง request โดยที่ฝั่ง batch ยังใช้สูตรใหม่ (หรือกลับกัน) — สองฝั่งต้องเปลี่ยน/ถอดพร้อมกันและตามด้วย recompute (ดู Sequencing Notes)

## Phase 4: Module D — Premium Subject Breakdown (REQ-016)

### Task BE-018 — Add VMCourseBreakdown and VMSubjectStat.Courses

Objective: เพิ่ม `VMCourseBreakdown` (`CourseName`, `CourseCode`, `Term`, `Score` เป็นคะแนนดิบ 0-100, `Credit` เป็น `double?` — ห้ามแปลง null เป็น 0) และ field `Courses` ใน `VMSubjectStat`; ประกอบข้อมูลจาก `CompassSubjectScore` ตามกฎของสัญญา: วิชาไม่มีคะแนนเป็นตัวเลขไม่แสดง, วิชาชื่อเดียวกันหลายเทอมแสดงแยกแถวต่อเทอมพร้อมฟิลด์ `Term` (ไม่ยุบรวม), เรียงคะแนนมากไปน้อย (เท่ากันเรียงตามชื่อวิชา), non-core (`CanonicalSubject == null`) ไม่แสดง, กลุ่มที่เข้า fallback ยังแสดงโดย `Credit` ทุกแถวเป็น null และ `StudentScore` คือค่าเฉลี่ยธรรมดา
Why: REQ-016 ให้ Premium แสดงระดับรายวิชาคู่กับระดับกลุ่มสาระ — ข้อมูล (`CourseName`/`Score100`/`Credit`) มีอยู่แล้วใน `CompassSubjectScore` ก่อนถูก aggregate จึงเป็นการเปิดดูข้อมูลเดิม ไม่ต้องเพิ่มแหล่งข้อมูล (DES-018)
Owner: backend-engineer
Tier: T5
Depends on: BE-001
Traceability: REQ-016, AC-016.1, AC-016.2, AC-016.3, AC-016.4, DES-018
Produces: Contract:PremiumSubjectBreakdown.v1
Consumes: Contract:SubjectScoreAggregation.v1
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

เป็นสัญญา response ที่ FE-001 จะอ่าน — รูปร่าง field/ชื่อ field ต้องตรงตามสัญญา; ค่า `StudentScore` ของกลุ่มสาระยังมาจาก
เมธอดถ่วงน้ำหนักของ BE-001 (ทศนิยม 2 ตำแหน่ง); `Percentile` คง 0 คงที่ตามเดิม

#### Retrieval hints

Hypothesis: `CompassSubjectScore` มี `CourseName`/`Score100`/`Credit` ต่อวิชาอยู่แล้วใน `CompassScoreService` — จุดประกอบ breakdown
อยู่ที่ caller ของ aggregation; ยืนยัน symbol/path กับ source ปัจจุบัน
Query: หา VMCourseBreakdown, VMSubjectStat, CompassSubjectScore ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs และ ClassOnlineWeb/Helper/CompassScoreService.cs
Provenance: DES-018, Contract:PremiumSubjectBreakdown.v1

#### Do not modify

`Credit` ห้ามแปลง null เป็น 0 และห้ามซ่อนวิชาที่ไม่มีหน่วยกิต; ห้ามแตะฝั่งฟรี (`analyst/{sID}`); ห้ามเปลี่ยน field เดิมของ
`VMSubjectStat` (ห้ามถอด/เปลี่ยนชนิด); ห้ามประกอบ breakdown ก่อนการตรวจสิทธิ์ (เป็นขอบเขต BE-019)

#### Acceptance criteria

AC-016.1: กลุ่มสาระที่มีหลายวิชาแสดงทุกวิชาแยกแถวพร้อมคะแนนดิบและหน่วยกิต นอกเหนือจากค่ากลุ่มสาระถ่วงน้ำหนักแล้ว
AC-016.2: กลุ่มสาระที่มีวิชาเดียวแสดงวิชานั้น 1 รายการ ไม่ซ่อน breakdown
AC-016.3: วิชาที่ไม่มีคะแนนเป็นตัวเลขไม่แสดงใน breakdown
AC-016.4: วิชาที่มีคะแนนแต่ไม่มีหน่วยกิตยังแสดง โดย `Credit` เป็น JSON `null` — ห้ามส่ง 0 และห้ามซ่อนวิชา

#### Required validation and expected evidence

ตรวจ AC-016.1, AC-016.2, AC-016.3, AC-016.4 ด้วย response จริงของ `calculate/score`: กลุ่มหลายวิชา/วิชาเดียว/วิชาไม่มีคะแนน/
วิชาไม่มีหน่วยกิต/หลายเทอม/non-core — บันทึก response JSON ทุกกรณีและตรวจลำดับการเรียงตามกฎ

#### Rollback/compatibility notes

เพิ่ม field ใหม่ (additive) — ถอดกลับได้โดย response เดิมไม่เปลี่ยนรูป แต่ FE-001 ต้องถอดพร้อมกันเพราะอ่าน field นี้;
ไม่มี schema ฐานข้อมูลถูกแตะ

### Task BE-019 — Assemble Courses in calculate/score after the premium check

Objective: ต่อ `Courses` เข้า response ของ `calculate/score` โดยประกอบ breakdown **หลัง** ผ่านการตรวจสิทธิ์ `compass_premium` เท่านั้น — ห้ามประกอบ payload เต็มก่อนแล้วค่อยกรองออก
Why: Module D Security Considerations — breakdown เปิดเผยคะแนนดิบ/หน่วยกิตรายเทอมที่ละเอียดกว่าเดิม ถ้าเติม field ก่อนตรวจสิทธิ์ข้อมูลอาจหลุดผ่าน response ที่ควรถูกกั้น (DES-018 Fallback กำหนดไว้ชัด)
Owner: backend-engineer
Depends on: BE-018, BE-005
Traceability: REQ-016, AC-016.5, DES-018
Produces: none
Consumes: Contract:PremiumSubjectBreakdown.v1
Risk: security
Human gate: none
Status: verified

#### Scope and constraints

จุดประกอบ `Courses` ต้องอยู่หลังจุดที่ BE-005 กั้น 403 — ผู้ไม่มีสิทธิ์ไม่ควรมี object ของ breakdown ถูกสร้างเลยในเส้นทาง response

#### Retrieval hints

Hypothesis: จุดประกอบ response ของ `calculate/score` อยู่ใน `CalculateScore` หลังจุดตรวจสิทธิ์ของ BE-005 — ยืนยันลำดับกับ source ปัจจุบัน
Query: หา CalculateScore และลำดับการเรียก CheckEntitlement/การประกอบ VMSubjectStat ใน ClassOnlineWeb/Controllers/Api/CompassApiController.cs
Provenance: DES-018, Contract:PremiumSubjectBreakdown.v1

#### Do not modify

ห้ามประกอบ payload เต็มแล้วกรอง/ตัดออกภายหลัง; ห้ามแตะกติกาประกอบข้อมูลรายวิชาของ BE-018; ห้ามแตะฝั่งฟรี

#### Acceptance criteria

AC-016.5: ผู้ใช้ที่ไม่มีสิทธิ์ Premium ยิง API ตรง → ไม่ได้ breakdown รายวิชากลับไปเลย (ทั้ง endpoint ถูกกั้น 403 จาก BE-005)

#### Required validation and expected evidence

ตรวจ AC-016.5 ด้วย request ไม่มีสิทธิ์ — response ต้องเป็น 403 และไม่มี field `Courses` ในเส้นทางประกอบเลย (ตรวจได้จากโค้ดว่า
การประกอบอยู่หลังจุด 403); บันทึก response และลำดับโค้ด

#### Rollback/compatibility notes

ถอดการต่อ `Courses` ได้เดี่ยว (response กลับไปไม่มี field ใหม่) — FE-001 ต้องถอดพร้อมกัน; การย้ายจุดประกอบไว้ก่อนการตรวจสิทธิ์
ถือเป็นการเปิดช่องข้อมูลหลุด ห้ามทำแม้ชั่วคราว

### Task FE-001 — Premium subject-breakdown screen reading Courses

Objective: สร้างหน้าจอแสดง breakdown รายวิชาใน Premium (การ์ดกลุ่มสาระ + รายการรายวิชาย่อยพร้อมคะแนนดิบ/หน่วยกิต) อ่านจาก field `Courses` ของ response `calculate/score`; รูปแบบการแสดงผลได้รับการยืนยันแล้วเป็น Table in Card (แบ่งกลุ่มสาระเป็นการ์ด แต่ละการ์ดบรรจุตารางรายวิชา); แสดง "ไม่มีข้อมูลหน่วยกิต" เมื่อ `Credit` เป็น null (ห้ามแสดง 0 หรือเว้นว่าง); ฝั่งฟรี (`analyst/{sID}`) ต้องไม่เปลี่ยนแปลงใด ๆ (ปิด OQ-16 แล้ว)
Why: REQ-016 ฝั่งแสดงผล — กติกา `Credit` null แสดงเป็น "ไม่มีข้อมูลหน่วยกิต" ไม่ใช่ 0 อยู่ในสัญญา response (DES-018 กฎ AC4); ปิด OQ-16 แล้ว (ผู้ใช้ยืนยันรูปแบบ Table in Card และข้อความ "ไม่มีข้อมูลหน่วยกิต" 2026-09-15)
Owner: frontend-engineer
Depends on: BE-019
Traceability: REQ-016, AC-016.1, AC-016.4, AC-016.6, DES-018
Produces: none
Consumes: Contract:PremiumSubjectBreakdown.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

อ่านข้อมูลจาก field `Courses` เท่านั้น — ห้ามคำนวณ/เดาค่าเองฝั่งหน้าจอ; รูปแบบการแสดงผลเป็น Table in Card ตามที่ OQ-16 ยืนยัน;
ค่า `Credit` null ต้องแสดงข้อความ "ไม่มีข้อมูลหน่วยกิต" ไม่ใช่เลข 0 หรือเว้นว่าง

#### Retrieval hints

Hypothesis: หน้า Premium ปัจจุบันอ่าน response ของ `calculate/score` อยู่แล้ว — จุดขยายคือบล็อกแสดงผลต่อจากการ์ดกลุ่มสาระ; ยืนยันไฟล์/route กับ source ปัจจุบัน
Query: หาหน้าจอที่เรียก calculate/score และโครงสร้างการ์ดกลุ่มสาระใน Views/Compass และ assets/js
Provenance: DES-018, Contract:PremiumSubjectBreakdown.v1

#### Do not modify

ห้ามแตะหน้าฟรี (`analyst/{sID}`) ทุกจุด; ห้ามแสดง 0 เมื่อ `Credit` เป็น null; ห้ามคำนวณค่าแทน backend;

#### Acceptance criteria

AC-016.1: หน้า Premium แสดงรายวิชาย่อยแยกแถวพร้อมคะแนนดิบและหน่วยกิต คู่กับค่ากลุ่มสาระถ่วงน้ำหนัก
AC-016.4: วิชาที่ไม่มีหน่วยกิตยังแสดง โดยช่องหน่วยกิตแสดง "ไม่มีข้อมูลหน่วยกิต" — ไม่แสดง 0 เป็นเลขจริง ไม่เว้นว่าง และไม่ซ่อนวิชา
AC-016.6: หน้าฟรีไม่เปลี่ยนแปลง — ยังเป็นกลุ่มสาระ + ค่าเฉลี่ยดิบธรรมดา

#### Required validation and expected evidence

ตรวจ AC-016.1, AC-016.4, AC-016.6 ด้วยข้อมูลจริงจาก `calculate/score`: กลุ่มหลายวิชา, วิชาไม่มีหน่วยกิต, และหน้าฟรีก่อน/หลัง —
บันทึกภาพ/DOM หน้าจอทุกกรณี; ยืนยันว่า request ฝั่งฟรีไม่ถูกแตะ

#### Rollback/compatibility notes

ถอดหน้าจอใหม่ได้เดี่ยว — หน้า Premium กลับไปแสดงระดับกลุ่มสาระอย่างเดียวเหมือนเดิม; ไม่มีการเปลี่ยน backend เมื่อถอดเฉพาะ UI

## Phase 5: MyCompass Consolidation — Wording Scope Only (REQ-019, WORD-01 extension) 🔒 Security gate n/a

### Task FE-002 — Fix WORD-01-violating wording in the MyCompass mockup

Objective: แก้ถ้อยคำที่ละเมิด WORD-01 ใน `Views/Compass/MyCompass.cshtml` + `assets/js/compass-design.js`/`compass-design-data.js`/`compass-design-engine.js` + `Views/Compass/Analytics.cshtml` (บรรทัด 75 และ 110 — เพิ่ม 2026-09-15 ตาม UXUI sign-off หลังพบviolationจริงในหน้า REQ-004 ซึ่ง DES-020 ผูกไว้ในขอบเขต): ห้ามใช้ "เทียบเครือข่ายทั่วประเทศ"/"ระดับประเทศ"/ถ้อยคำที่สื่อความหมายเดียวกัน — ใช้กรอบ "เทียบกับนักเรียนในระบบ SchoolBright" แทน (สำเนาสุดท้ายเป็นของ `uxui-designer`; `business-analyst` ตรวจไม่ให้อ้างเกินฐานข้อมูลจริง)
Why: WORD-01 เป็นข้อกำหนดจากการปิด RISK-09 — ฐานเทียบจริงคือนักเรียนในระบบ SchoolBright ไม่ใช่ทั้งประเทศ และ v11 ขยายขอบเขตครอบไฟล์ MyCompass แล้ว · task นี้ anchor ที่ DES-020 (WORD-01 — addressable แล้วตาม design.md amend 2026-09-13) กับ `Contract:StatWordingRules.v1`/`DEC-020` ของหัวข้อเดียวกัน — สำเนาสุดท้ายยังรอ `uxui-designer` (EVD-021 unresolved)
Owner: frontend-engineer
Tier: T6
Depends on: none
Traceability: REQ-019, AC-019.2, DES-020, DEC-020
Produces: none
Consumes: Contract:StatWordingRules.v1
Risk: business
Human gate: business
Status: verified

#### Scope and constraints

แก้เฉพาะถ้อยคำอธิบายฐานเทียบ — ความหมายที่ต้องสื่อคือ "เทียบกับฐานนักเรียนในระบบ SchoolBright" ไม่ใช่ทั้งประเทศ;
ถ้อยคำสุดท้ายรอ `uxui-designer` เขียนและ `business-analyst` ตรวจ — task นี้ apply สำเนาที่ผ่านการตรวจแล้วเท่านั้น

#### Retrieval hints

Hypothesis: ข้อความที่ละเมิดอยู่ใน `compass-design.js` แถวบรรทัด 379-394 (หัวข้อ "เทียบเครือข่ายทั่วประเทศ") และอาจซ้ำใน data/engine files — ยืนยันกับ source ปัจจุบันก่อนแก้
Query: ค้นหาข้อความ "ทั่วประเทศ" และ "ระดับประเทศ" ใน Views/Compass/MyCompass.cshtml และ assets/js/compass-design*.js
Provenance: DES-020, DEC-020, Contract:StatWordingRules.v1

#### Do not modify

ไม่แตะตัวเลขมอคอัปอื่น (`"อันดับ 3,693 จาก 4,191 คน"` ฯลฯ — ยังเป็น mock data ไม่ต่อ backend จริง และไม่ใช่ขอบเขต WORD-01),
สูตร/ตรรกะการจัดอันดับของมอคอัป, schema/payload ใด ๆ; ห้ามแตะไฟล์อื่นนอกเหนือจากที่ระบุ

#### Acceptance criteria

AC-019.2: การแก้เป็นการแก้ชั้นข้อความแสดงผลของหน้า MyCompass เท่านั้น — ฟีเจอร์/ตรรกะเดิมของมอคอัปคงอยู่ครบ (ไม่ใช่การตัดฟีเจอร์)

#### Required validation and expected evidence

ตรวจ AC-019.2 ด้วยการ grep ยืนยันว่าไม่เหลือถ้อยคำต้องห้าม ("ทั่วประเทศ"/"ระดับประเทศ" และความหมายเดียวกัน) ในทั้ง 5 ไฟล์
และ diff แสดงว่ามีการแก้เฉพาะข้อความ — ไม่มีตัวเลข/ตรรกะ/schema ถูกแตะ; แนบสำเนาที่ `uxui-designer`/`business-analyst` อนุมัติ

#### Rollback/compatibility notes

ถอดกลับได้โดย revert ข้อความ — ไม่มี logic/schema เปลี่ยนจึงไม่มีผลข้างเคียง; ห้ามถอดเป็นบางไฟล์ (ข้อความเดียวกันต้องสอดคล้องทั้ง 4 ไฟล์)

## Sequencing Notes

- Phase 1 has no dependency and must finish before Phase 3 and Phase 4 (both consume the weighted
  aggregation method Phase 1 creates).
- Phase 2 has no dependency on Phase 1 and can start in parallel — **but its `CheckEntitlement` step-4
  chain (BE-004 → BE-005/006/007/012) is blocked at OQ-15(a1)/(a2)/PRE-06, not at BE-013.** BE-008
  (IP allowlist) and BE-009/010/011 (identity fix) are not blocked and can start immediately.
- Phase 4 needs both Phase 1 (weighted values) and Phase 2 (BE-005, so breakdown data can't leak to
  non-Premium users) — REQ-016 AC5.
- Phase 3's DES-012 renaming work should happen in the same pass as its REQ-017/DES-011 work (see task
  note on BE-014) — do not land snake_case columns first and rename later.
- Phase 5 (REQ-019 wording) is **not blocked by and does not block Phases 1–4** — it can run any time.
  **OQ-25 (REQ-019's timeline) is explicitly assigned to `project-manager` to resolve as sequencing, not
  a business question** (`requirement.md` OQ-25) — resolved here as: no calendar trigger exists, so
  Phase 5 is sequenced last only because its scope (wording-only) is currently the smallest actionable
  slice of REQ-019; the rest of REQ-019 waits on a `system-analyst` amend (see Phase 5 note above), not
  on a date.
- **REQ-018 (retiring REQ-005/REQ-007) has no phase and is not sequenced anywhere in this plan.** Per
  `design.md` DES-014, the trigger (N=4 weeks after `sb-compass-faculty-match` REQ-011/REQ-012 reaches
  production) hasn't occurred. When it does, `devops`/`project-manager` re-open this plan to add the
  retirement task(s) — this is a tracking responsibility, not a standing task.
- **REQ-006 (Gap Report, old form)** retires per REQ-019's decision but its replacement ("แผนพัฒนา" step
  after target-setting) is defined in `sb-compass-faculty-match`, not here (see that module's OQ-23) —
  no task in this plan represents the replacement; `sb-compass`'s existing REQ-006 code
  (`CompassPathCatalog.cs`) continues to exist and is gated by Phase 2/REQ-018 exactly as before, unaffected
  by this plan.
- OQ-21/OQ-22 (closed 2026-09-02) did not unblock any previously-blocked task in this plan — OQ-21's
  closure unblocks `sb-compass-faculty-match`'s RIASEC/Confidence contracts (that module's plan), and
  OQ-22's closure produced REQ-018/DES-009/DES-014 (the deferred item above), not a task here.
- **Deploy prerequisite (not a QA gate) — Phase 1**: Phase 1 is `verified` (FULL QA round 2026-09-02)
  but **must not be deployed to users standing alone.** BE-001/BE-002/BE-003 make `calculate/score`
  return **weighted** subject scores, while `CompassRankingService.GetStudentNationalStatsAsync` and
  `RecomputeAsync` still derive the network **mean/rank from the unweighted** method — correct per this
  plan today (switching them is Phase 3's BE-014 batch + BE-017 request-time work), but exactly the
  pairing `design.md` `## Subject Score Aggregation Rules` rule 0 row 5 warns against
  ("ต้องตรงกับ batch ไม่งั้นอันดับเพี้ยน"). So Phase 1 ships **either** in the same release as Phase 3
  (BE-014 + BE-017 both on the weighted method, then Phase 3's `?limit=0` recompute below) **or** with an
  explicit weighted-score/unweighted-rank mismatch that is written down and **accepted by a human before
  release** — `devops` must put that choice in front of the user; no agent may accept it. Source:
  `review.md` ISS-02 (2026-09-02 round, Important — sequencing, not a code defect; owner
  `project-manager`/`devops`). This is a release-bundling constraint only: it adds no dependency edge
  (BE-014/BE-017 already depend on Phase 1) and changes no task's Status, Owner, Depends-on or Tier.
- **Deploy prerequisite (not a QA gate) — Phase 2**: PRE-06 (SB PLUS team adds `"FeatureCode"` column —
  script ready at `_docs/module/sb-compass/sql/pre-06-add-feature-code.sql`) must land before BE-004's
  step 4 / BE-005/006/007/012 can even be written, then PRE-01/02/03 before deploy.
- **Deploy prerequisite (not a QA gate) — Phase 3**: after deploy, must run network-wide recompute
  (`?limit=0`) before opening the Premium page to users — `## National Stats Batch Rules`/RISK-01.

## Unresolved Open Questions

- **OQ-15(a1)/(a2)** — ปิดฝั่งธุรกิจแล้ว 2026-09-15: ผู้ใช้ยืนยันรหัส FeatureCode ในระบบ SB PLUS แล้วคือ `compass_premium` และ `compass_admin_ops` (ตรงกับค่าคงที่ใน `CompassEntitlementService`) ปลดบล็อกฝั่งโค้ดของ BE-004; ยังคงรอทีม SB PLUS/devops รันสคริปต์เพิ่มคอลัมน์ `"FeatureCode"` (PRE-06) ในฐานข้อมูลจริงก่อน deploy
- **OQ-16** — ปิดแล้ว 2026-09-15: ผู้ใช้ยืนยันรูปแบบการแสดงผลเป็น Table in Card (การ์ดตามกลุ่มสาระ บรรจุตารางรายวิชา) และข้อความกรณีไม่มีหน่วยกิตคือ `"ไม่มีข้อมูลหน่วยกิต"` (ปลดบล็อก FE-001)
- **ISS-01 (ทศนิยมใน Gap Report)** — ปิดฝั่ง design แล้วใน `design.md` v16 (DES-015 กฎข้อ 5, Contract:SubjectScoreAggregation.v1, DEC-015, EVD-022); ขยายขอบเขตและ reopen Task BE-003 เป็น `Status: pending` ให้ครอบคลุมการแก้ `CompassPathCatalog.BuildAdvice` ไม่ให้ re-round เป็น 0 dp และส่ง 2 dp ใน Gap Report เพื่อให้ `backend-engineer` นำไป implement ต่อ
- **OQ-24/OQ-25** — see `sb-compass-faculty-match` and Sequencing Notes above; OQ-24 does not block this
  plan (REQ-008 replacement stays Later regardless of its answer).
- **REQ-019 remainder (no task in this plan)** — `requirement.md` confirms Analytics.cshtml/PathFinder.cshtml
  are actually retired in favor of `MyCompass.cshtml` and REQ-001–004/006(new form)/008 must still be served
  through the new page, but `design.md`'s only amendment covering it (WORD-01 §3) is wording alone — the page
  rewire and the content gaps (REQ-002/REQ-003 equivalents, REQ-006's "แผนพัฒนา" step — OQ-23 of
  `sb-compass-faculty-match`, REQ-008's replacement — OQ-24) have no `DES-NNN` contract section yet. Writing
  backend/frontend tasks for that now would invent scope no contract backs — needs a `system-analyst` amend
  before it is task-able.
- **RESOLVED 2026-09-13 — WORD-01 (`DES-020`) registration** (was: `DES-020` was not an addressable claim,
  so FE-002 anchored provisionally on DES-021 with that section's schema/breaking-contract gate parity):
  `system-analyst` registered `## DES-020 — WORD-01: …` in `design.md` (`Contract:StatWordingRules.v1`,
  `DEC-020`, evidence EVD-019..021 — EVD-021/DEC-020 stays `unresolved` until `uxui-designer`'s final copy)
  with no gate-triggering decisions. FE-002 is re-anchored on DES-020 and the forced gates are removed;
  nothing remains open from this item.

## Change Log

- 2026-09-02 — Wrote `plan.md` fresh (file did not exist in the working tree; prior version existed
  only in git history and the user declined restoring it, then confirmed a second time to also discard
  its tracked implementation/QA status). Rebuilt Phases 1–4 verbatim from `design.md` Contract Version 11
  Modules A–D and the task bodies already captured in `knowledge/sb-compass/task/*.yaml` (same task IDs,
  same `DES-NNN`/dependency references — content not altered, only `Status` reset to `pending` for all
  20 tasks per explicit user instruction to start fresh). Added Phase 5 (REQ-019 wording-only slice,
  WORD-01 §3) — the rest of REQ-019 intentionally left unplanned pending a `system-analyst` amend.
  Deliberately did not create a phase/task for REQ-018 (DES-009/DES-014 confirm no trigger date exists
  yet). Flagged Phase 2 as `🔒 Security gate` per Module B's Security Considerations.
- 2026-09-07 — Structure-reconciliation pass (Bucket F): `sta --check-plan --module sb-compass` flagged
  BE-013 and FE-002 as citing no `DES-NNN`. Added `DES-019` to BE-013 — `design.md`'s reconciliation
  pass (same date) registered `DES-019` for `## Deployment Prerequisites` (PRE-01..PRE-06), and BE-013's
  citation (`PRE-05`) is a row of that same section, so `DES-019` is the correct contract id (not
  `DES-004`, which covers `CheckEntitlement`'s actual query logic, not the prerequisite verification
  step feeding it). **FE-002 left unchanged** — `design.md`'s `## Feature-by-Feature Feasibility` table
  (`DES-001`..`DES-019`, confirmed complete, no `DES-020`+ exists) has no row for `WORD-01`/REQ-019;
  `WORD-01` is a real contract (`## Risks & Dependencies` § WORD-01) but was never assigned a `DES-NNN`
  during either the original authoring or the 2026-09-07 reconciliation pass, which covered five other
  contract sections but missed this one. Not a case of a task needing no citation — it's a `design.md`
  gap outside `project-manager`'s authority to fix; flagging for `system-analyst` to add the missing
  `DES-NNN` row (or confirm none is intended) before this citation can be completed here.
- 2026-09-07 — `system-analyst` registered `DES-020` in `design.md` (`## Feature-by-Feature Feasibility`
  + `## Risks & Dependencies` § WORD-01) for the WORD-01 contract, closing the gap flagged above. Added
  `DES-020` to FE-002's citation, now `FE-002 (DES-020, WORD-01 §3, REQ-019)`.
- 2026-09-08 — Added the optional `Tier` column to all five phase tables and cast exactly one
  phase-level `Tier` per table (all rows blank otherwise), per `policies/architecture.md`/this role's
  contract; no task IDs, Status, Owner, or Depends-on cells touched. Casts and rationale: **Phase 1
  (BE-001) → T4** — the new weighted-aggregation method is a shared dependency consumed by three
  separate call sites (`calculate/score`, Fit Score, Gap Report) with a six-rule fallback/edge-case
  contract, matching T4's "hard or risky implementation across a contract or several modules." **Phase 2
  (BE-004) → T2** — the phase carries the plan's only `🔒 Security gate`: raw parameterized SQL against
  entitlement/subscription tables, fail-closed authorization logic, IDOR/broken-access-control failure
  modes per Module B's Security Considerations; T2 is "the highest tier a plan may cast" and this is the
  security-grade work that tier exists for. **Phase 3 (BE-014) → T3** — batch national-stats recompute
  combines three concerns in one pass (weighted aggregation, new `StddevScore` population-stddev logic,
  and a 22-call-site PascalCase rename across two services) feeding network-wide rankings; analysis-grade/
  risky-implementation, not security-sensitive. **Phase 4 (BE-018) → T5** — additive view-model + UI work
  with a bounded, already-specified data-shaping contract (`## Premium Subject Breakdown Contract`); no
  security gate, moderate but not hard implementation. **Phase 5 (FE-002) → T6** — pure wording/copy
  change, no schema/logic/payload touched, matching T6's "fast mechanical work." Did not cast reserved
  `T1` anywhere and did not cast any analysis-only content (there is no separate analysis phase in this
  plan — all five phases are implementation phases).
- 2026-09-08 — Added `## Execution Runbook` (copy-pasteable `sta run` commands grouped into rounds by
  phase/Tier, with blocked-vs-runnable status per task as of today). Mechanical addition only — no task
  IDs, Status, Owner, Depends-on, or Tier values changed in any phase table.
- 2026-09-13 — แปลงตาราง task เป็น PlanTask format 1 — ไม่เปลี่ยน task id/status/owner/dependency/Tier ใด ๆ (โครงสร้างเท่านั้น)
- 2026-09-13 — FE-002 re-anchored to DES-020 after `system-analyst` registered WORD-01 as addressable
  `## DES-020` (`Contract:StatWordingRules.v1` / `DEC-020`) in `design.md`: Traceability now
  `REQ-019, AC-019.2, DES-020, DEC-020`, Consumes `Contract:StatWordingRules.v1`, retrieval Provenance cites
  the same claims, and the provisional DES-021 anchor plus its forced schema/breaking-contract gate parity are
  removed (`Human gate: business` only — `Risk: business` requires it). No other task changed.
- 2026-09-14 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim: BE-001,
  BE-002, BE-003 → `verified` (Phase 1 FULL QA round, 2026-09-02, `dev` workspace `C:\src\sb-web-student`).
  No other Status, Owner, Depends-on, or Tier value touched. ISS-02 (Phase 1 deploying alone pairs
  weighted scores with unweighted ranks) still needs a `project-manager` sequencing judgment in
  `## Sequencing Notes` — not resolved by this relay.
- 2026-09-14 — Sequencing-note-only amend answering ISS-02 from `review.md`'s 2026-09-02 Phase 1 round
  (`## Knowledge sync — three-repo mode`: "ISS-02 needs a `project-manager` sequencing note in
  `plan.md`'s Sequencing Notes / Phase 3 deploy prerequisite"). Added **Deploy prerequisite (not a QA
  gate) — Phase 1** to `## Sequencing Notes`, in the same style as the existing Phase 2/Phase 3 notes:
  verified Phase 1 must not be deployed to users on its own, because its weighted `calculate/score`
  pairs with the still-unweighted `CompassRankingService` mean/rank until Phase 3 (BE-014/BE-017) lands
  — the failure `design.md` `## Subject Score Aggregation Rules` rule 0 row 5 predicts
  ("อันดับเพี้ยน"). Resolution recorded as: release Phase 1 together with Phase 3, or obtain an explicit
  human-accepted, documented mismatch before release (`devops` surfaces the choice). Not a QA verdict and
  not a re-review of Phase 1 — no task Status, Owner, Depends-on, Tier, or dependency edge was touched,
  and ISS-02 stays `open` in `review.md` until a release decision is actually made there.
- 2026-09-15 — **Unblock FE-001 and BE-004 from OQ-16 and OQ-15(a2) closures**:
  - **FE-001**: ปลดบล็อกงาน frontend แสดง breakdown รายวิชา หลังผู้ใช้ยืนยันรูปแบบ Table in Card (การ์ดกลุ่มสาระ บรรจุตารางรายวิชา) และข้อความกรณีไม่มีหน่วยกิตคือ `"ไม่มีข้อมูลหน่วยกิต"` (ปิด OQ-16 ตาม `design.md` v15); ปรับ `Human gate: none`
  - **BE-004**: ปลดบล็อกขั้นตอนที่ 4 ฝั่งธุรกิจ หลังผู้ใช้ยืนยัน FeatureCode คือ `compass_premium` และ `compass_admin_ops` (ปิด OQ-15(a2) ฝั่งธุรกิจ); คง PRE-06 เป็น deployment prerequisite สำหรับการรัน DDL เพิ่มคอลัมน์ในฐานข้อมูลจริง
  - อัปเดต `## Unresolved Open Questions` บันทึกการปิด OQ-15(a2) และ OQ-16
- 2026-09-15 — **ขยายขอบเขต Task BE-003 และ reopen เป็น `pending` ตามการปิด ISS-01 ใน design.md v16**:
  - ขยาย Objective และ Scope ของ Task BE-003 ให้ครอบคลุมการปรับปรุง `CompassPathCatalog.BuildAdvice` (`ClassOnlineWeb/Helper/CompassPathCatalog.cs:105`) สำหรับ Gap Report (`AI_advice/path`, REQ-006) ไม่ให้ re-round คะแนนเป็น 0 dp (`Math.Round(avg[kv.Key], 0)`), เก็บ `VMGapItem.Current` เป็นทศนิยม 2 ตำแหน่ง, คำนวณ `VMGapItem.Gap` จากค่า 2 ตำแหน่ง, และปรับ format advice text (`{m.Gap:0.##}`) ตามสัญญา DES-015 กฎข้อที่ 5 และ DEC-015 (ปิด ISS-01)
  - เพิ่มเกณฑ์ยอมรับ AC-012.5 (ISS-01) และขั้นตอนการตรวจสอบความถูกต้องพร้อมหลักฐานที่ต้องบันทึก
  - ปรับ `Status: pending` ของ BE-003 เพื่อส่งต่องาน implementation ให้ `backend-engineer` และรอรอบตรวจรับจาก `qa-engineer`
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012 → `verified`
  (Phase 2 FULL QA round, 2026-09-15, `dev` workspace `C:\src\sb-web-student`). All 10 tasks in Phase 2
  verified and Phase 2 `🔒 Security gate` confirmed closed via `../../modules/sb-compass/build/security.md` Round 4 and functional gating.
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-003 → `verified` (Phase 1 TARGETED QA round, 2026-09-15, `dev` workspace `C:\src\sb-web-student`,
  part 2 — `CompassPathCatalog.BuildAdvice` 2-dp fix closing ISS-01; part 1 call swap was verified in the
  2026-09-02 FULL round). Phase 1 now fully closed.
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-014, BE-015, BE-016, BE-017 → `verified` (Phase 3 FULL QA round, 2026-09-15, `dev` workspace
  `C:\src\sb-web-student`). Phase 3 closed; ISS-02 and ISS-04 closed in `review.md`.
- 2026-09-15 — **Amend Task FE-002: เพิ่ม `Views/Compass/Analytics.cshtml:75,110` เข้าขอบเขต** หลัง UXUI lane sweep
  พบ WORD-01 violation จริง ("เทียบเครือข่ายทั่วประเทศ"; บรรทัด 110 static แสดงเสมอ) ในหน้า REQ-004 ซึ่ง DES-020
  ผูกไว้ในขอบเขตอยู่แล้ว — ตามมติ UXUI sign-off (by `dev`, 2026-09-15, `../../modules/sb-compass/build/uxui/design.md`): ตัดเลข mock "9 โรงเรียน",
  ใช้ถ้อยคำ "เทียบเครือข่าย SchoolBright", Analytics.cshtml บรรทัด 75 → "Stat เทียบเครือข่าย SchoolBright"
  และบรรทัด 110 → "อันดับ + percentile เทียบเครือข่าย SchoolBright" · สำเนาสุดท้ายอนุมัติแล้วใน `../../modules/sb-compass/build/uxui/design.md`
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-018, BE-019, FE-001 -> `verified` (Phase 4 FULL QA round, 2026-09-15, `dev` workspace
  `C:\src\sb-web-student`). Phase 4 closed. FE-001 verified against the signed UXUI artifact
  (`../../modules/sb-compass/build/uxui/design.md`, approved by `dev` 2026-09-15).
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  FE-002 -> `verified` (Phase 5 FULL QA round, 2026-09-15, `dev` workspace
  `C:\src\sb-web-student`). Phase 5 closed — all 5 phases of the plan are now verified.
  Post-round: ISS-09 (lock-overlay title deviation from signed copy) fixed by frontend-engineer
  same day at `compass-design.js:394` (string-only, MSBuild exit 0) — flagged for QA confirmation;
  ISS-10 (`compass.js:225` borderline wording outside FE-002 file list) awaits a system-analyst
  DES-020 scope ruling.
