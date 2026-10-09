# Plan

PlanTask format: 1

## Plan Summary

แผน 5 เฟสผูก UI mockup เดิมที่ `src/app/pages/support/crm/**` เข้ากับข้อมูลจริงโดยไม่มี DDL/ตารางใหม่เด็ดขาด (มติผู้ใช้ 2026-08-23): settings เป็น code constant แบบ display-only, dashboard/groups/schools aggregate ฝั่ง server ตามสัญญาเมตริก, insights เก็บบน `TCrmKnowledgeEntry` และ CSAT reuse ลูปเดิม — ทุก route ใหม่อยู่ใต้ guard `MENU_SUPPORT_CRM` ตามสัญญา API ของโมดูล การ์ดที่อ่าน `AiCategory`/`ComputedPriorityScore` ต้อง implement empty-state จนกว่า `crm-ai-support` จะ deploy + backfill (ไม่ block การเขียนโค้ด) และมี cross-module touch จำกัดวง 2 จุด (INSIGHT_% filter ฝั่ง crm-ai-support + hooks ใน v1 crm) ตามรายละเอียดใน Sequencing Notes

## Phase 1: Constants & Settings Pages (display-only)

### Task BE-crm-case-dashboard-P1-01 — SLA settings constant

Objective: สร้าง `src/constants/crm-case-sla-setting.constant.ts` ตาม design § Data Contracts A — `CRM_CASE_SLA_SETTING_VERSION="v1"` + `CRM_CASE_SLA_CLOCK` + `CRM_CASE_SLA_EXCLUSIONS` + `CRM_CASE_SLA_TARGETS` (default จาก `sla-mock.data.ts`: P1 15นาที/1วัน · P2 1ชม./3วัน · P3 4ชม./7วัน · P4 1วันทำการ/14วัน · จ.–ศ. 08:30–17:30 · Critical 24ชม.) พร้อม comment หัวไฟล์ว่าแก้ค่า = bump version + deploy
Why: SLA targets/clock/นาฬิกาทำการต้องมีแหล่งเดียวเป็น versioned code constant ที่ settings API และหน้าแสดงผลอ่านจากค่าเดียวกัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, DES-001, DES-004, DEC-004
Produces: Contract:CrmCaseSlaSetting.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

สร้าง constant ใหม่เฉพาะไฟล์เดียว ค่า default ตาม mockup ที่ยืนยันแล้ว — comment หัวไฟล์ระบุวิธีแก้ค่า (แก้ constant → bump `*_VERSION` → deploy)

#### Retrieval hints

Hypothesis: ไฟล์ constant ใหม่อยู่คู่กับ constant อื่นของโมดูลใน `src/constants/` และควรแยก concept ออกจาก constant priority ของ crm-ai-support — ยืนยัน path/symbol กับซอร์สจริงก่อนใช้
Query: หา `CRM_CASE_SLA_SETTING_VERSION`, `CRM_CASE_SLA_TARGETS`, `crm-case-sla-setting.constant.ts` และ `crm-sla-rule.constant.ts` ใน Target
Provenance: DES-004, DEC-004, Contract:CrmCaseSlaSetting.v1

#### Do not modify

`crm-sla-rule.constant.ts` ของ crm-ai-support (คนละ concept — ห้าม reuse/แก้) · สคีมา/ตารางใด ๆ · ไฟล์ constant อื่นของโมดูลอื่น

#### Acceptance criteria

AC-004.1: ค่า default ใน constant ตรงชุด mockup ที่ยืนยันแล้วทุกแถว (targets/clock/exclusions) เป็นค่าเริ่มต้นจริง ไม่ใช่ placeholder

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วยการเทียบค่า constant กับ `sla-mock.data.ts` เดิมทีละแถว + `tsc`/`eslint` ผ่าน — บันทึก diff/ผลคำสั่งไว้เป็นหลักฐาน (งานนี้ verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

constant เป็นไฟล์ใหม่ additive — ลบไฟล์คืนสภาพเดิมได้ ไม่กระทบ consumer ภายนอก

### Task BE-crm-case-dashboard-P1-02 — CSAT settings constant

Objective: สร้าง `src/constants/crm-case-csat-setting.constant.ts` — `CRM_CASE_CSAT_CONFIG` (scale 1–5, threshold ≥4, repeatSuppressDays 7, trigger "closed", channels line=true/email=true/inapp=false, cesQuestionEnabled=true) + `CRM_CASE_CSAT_RULES` 3 แถวตาม mockup
Why: config/rules/channels ของ CSAT ต้องมาจากค่าเดียวเสมอ เพราะ settings API, suppress helper และ escalation hook จะอ่านร่วมกัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-005, AC-005.1, DES-001, DES-005, DEC-005
Produces: Contract:CrmCaseCsatSetting.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

ไฟล์ constant เดียว ค่าตาม mockup `csat-mock.data.ts` — trigger MVP คือ `closed` ส่วน `verified`/`delay1d` เก็บค่าไว้แต่ยังไม่มี hook (Later)

#### Retrieval hints

Hypothesis: วางคู่กับ `crm-case-sla-setting.constant.ts` ใน `src/constants/` — ยืนยัน symbol จริงก่อนใช้
Query: หา `CRM_CASE_CSAT_CONFIG`, `CRM_CASE_CSAT_RULES`, `CRM_CASE_CSAT_CHANNELS` ใน Target
Provenance: DES-005, DEC-005, Contract:CrmCaseCsatSetting.v1

#### Do not modify

ลูปส่ง/เก็บ CSAT เดิม (`crm-line-notify.service.ts`, `/liff/crm-feedback`, `POST /api/v1/support/crm/feedback`) · สคีมาใด ๆ

#### Acceptance criteria

AC-005.1: constant seed ค่า default ตาม mockup จริง (มาตรวัด 1–5, เกณฑ์พอใจ ≥4 ดาว, rules 3 แถว) ไม่ใช่ placeholder

#### Required validation and expected evidence

ตรวจ AC-005.1 ด้วยการเทียบค่า constant กับ mockup เดิม + `tsc`/`eslint` ผ่าน — เก็บผลเป็นหลักฐาน (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

ไฟล์ใหม่ additive — ลบคืนได้โดยไม่กระทบ consumer ภายนอก

### Task BE-crm-case-dashboard-P1-03 — GET /settings/sla read endpoint

Objective: เพิ่ม `GET /api/v2/support/crm-case/settings/sla` — guard `auth()` + `MENU_SUPPORT_CRM`, อ่าน constant คืน JSON (flat pattern: `route.ts` + `.service.ts`; ไม่มี repository/schema เพราะไม่แตะ DB) + `_docs/get-spec.md` — verify แล้ว: dev server ตอบ 401 เมื่อไม่ผ่าน guard + tsc/eslint ผ่าน (2026-08-24)
Why: หน้า display-only ต้องมี read path เดียวที่คืนค่าจาก constant โดยไม่มี write path ใด ๆ
Owner: backend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, AC-004.2, DES-004, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmCaseSlaSetting.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

route อ่าน constant อย่างเดียว — ห้ามมี PATCH/POST และห้าม upsert ค่าลง DB (ไม่มีตาราง config) ตาม contract API ของโมดูล

#### Retrieval hints

Hypothesis: โครง route/service ควรเลียน pattern flat ของ v2 routes เดิมและ guard แยกไฟล์ `{resource}.guard.ts` — ยืนยันกับซอร์สจริง
Query: หา `settings/sla/route.ts`, `guardCrmCase`, `MENU_SUPPORT_CRM` ใน Target
Provenance: DES-004, DES-007, Contract:CrmCaseSlaSetting.v1

#### Do not modify

constant SLA (แก้ที่ task BE-crm-case-dashboard-P1-01 เท่านั้น) · สคีมา/ตาราง · route ของ crm-ai-support

#### Acceptance criteria

AC-004.1: endpoint คืนชุดค่า default เดียวกับ constant ครบทุก field
AC-004.2: endpoint มีเฉพาะ GET — ไม่มีทางแก้ค่าผ่าน API ใด ๆ

#### Required validation and expected evidence

ตรวจ AC-004.1 ด้วยการเทียบ response กับ constant · ตรวจ AC-004.2 ด้วย dev server: ไม่ล็อกอินต้องได้ 401 และไม่มี write method — บันทึกแล้ว 2026-08-24 (401 guard ถูกต้อง + tsc/eslint ผ่าน)

#### Rollback/compatibility notes

route ใหม่ additive —  revert ไฟล์ route/service/spec ของ task นี้ได้โดยไม่กระทบ endpoint อื่น

### Task BE-crm-case-dashboard-P1-04 — GET /settings/csat read endpoint

Objective: เพิ่ม `GET /api/v2/support/crm-case/settings/csat` — รูปแบบเดียวกับ settings/sla: guard `auth()` + `MENU_SUPPORT_CRM`, อ่าน CSAT constant คืน JSON + `_docs/get-spec.md` — verify เดียวกันแล้ว (2026-08-24)
Why: หน้า settings/csat ต้องมี read path เดียวเช่นเดียวกับ SLA — ไม่มี write path
Owner: backend-engineer
Depends on: none
Traceability: REQ-005, AC-005.1, DES-005, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmCaseCsatSetting.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

route อ่าน constant อย่างเดียว — ห้ามมี write method และห้ามแตะ DB

#### Retrieval hints

Hypothesis: ใช้ pattern เดียวกับ `settings/sla/route.ts` ที่เพิ่งทำ — ยืนยัน path/symbol กับซอร์สจริง
Query: หา `settings/csat/route.ts`, `CRM_CASE_CSAT_CONFIG`, `guardCrmCase` ใน Target
Provenance: DES-005, DES-007, Contract:CrmCaseCsatSetting.v1

#### Do not modify

CSAT constant (แก้ที่ task BE-crm-case-dashboard-P1-02 เท่านั้น) · ลูปส่ง/เก็บ CSAT เดิม · สคีมาใด ๆ

#### Acceptance criteria

AC-005.1: endpoint คืนค่า config/rules ชุดเดียวกับ constant ครบทุก field

#### Required validation and expected evidence

ตรวจ AC-005.1 ด้วยการเทียบ response กับ constant + dev server 401 guard + tsc/eslint — บันทึกแล้ว 2026-08-24

#### Rollback/compatibility notes

route ใหม่ additive — revert เฉพาะไฟล์ของ task นี้ได้

### Task FE-crm-case-dashboard-P1-01 — settings/sla page display-only

Objective: เขียนใหม่ `src/app/pages/support/crm/settings/sla/page.tsx` จากฟอร์ม mockup เป็น display-only: Card (`CardSectionHeader`) แสดง targets table + clock rows + exclusions พร้อม Alert/hint "แก้ไขค่านี้ผ่าน code review (`crm-case-sla-setting.constant.ts`) แล้ว deploy" — ลบ state/form ของ mock
Why: มติ Rev 2 คือค่า settings แก้ผ่าน constant + deploy หน้าเว็บจึงต้องไม่มีปุ่ม/ฟอร์มแก้ไขเหลืออยู่
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, AC-004.1, AC-004.2, DES-004, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseSlaSetting.v1, Contract:CrmCaseDashboardWiring.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

แก้เฉพาะหน้า settings/sla + component ประกอบที่หน้าใช้ — แสดงค่าจาก API/constant อย่างเดียว ต้องมี hint บอกผู้ใช้ชัดว่าแก้ค่าที่ไหน

#### Retrieval hints

Hypothesis: หน้าเดิมมีฟอร์ม/state ของ mock อยู่แล้ว — ลบทิ้งแล้ววาด card แบบอ่านอย่างเดียว ยืนยัน path/page component กับซอร์สจริง
Query: หา `settings/sla/page.tsx`, `CardSectionHeader`, `sla-mock.data.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

constant SLA · endpoint settings/sla · หน้าอื่นของโมดูล

#### Acceptance criteria

AC-004.2: หน้าแสดงค่าอย่างเดียว ไม่มีฟอร์ม/ปุ่มบันทึก — การเปลี่ยนค่าทำผ่าน constant + deploy เท่านั้น
AC-004.1: ค่าที่แสดงตรงกับชุด default ที่ seed ไว้ครบทุกแถว

#### Required validation and expected evidence

ตรวจ AC-004.2 ด้วยการอ่านโค้ดหน้าว่าไม่เหลือ form/state การแก้ไข · ตรวจ AC-004.1 ด้วยการเทียบข้อมูลที่ render กับ API — บันทึก tsc/eslint เป็นหลักฐาน (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

revert commit ของหน้านี้คืนฟอร์ม mockup เดิมได้ — ไม่กระทบ endpoint

### Task FE-crm-case-dashboard-P1-02 — settings/csat page display-only

Objective: เขียนใหม่ `settings/csat/page.tsx` เป็น display-only (scale/rules/channels + preview card คงไว้เป็นตัวอย่าง static) + hint เดียวกับหน้า SLA
Why: เหตุผลเดียวกับหน้า SLA — มติ Rev 2 ทำให้หน้า CSAT เป็นการแสดงผลล้วน
Owner: frontend-engineer
Depends on: none
Traceability: REQ-005, AC-005.1, DES-005, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseCsatSetting.v1, Contract:CrmCaseDashboardWiring.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

แก้เฉพาะหน้า settings/csat + component ประกอบ — คง preview card เป็น static ตามแถวงาน ไม่มีฟอร์มแก้ค่า

#### Retrieval hints

Hypothesis: โครงหน้าคล้าย settings/sla ที่ทำไปแล้ว — ยืนยัน path/component จริงก่อนแก้
Query: หา `settings/csat/page.tsx`, `csat-mock.data.ts`, `CardSectionHeader` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

CSAT constant · endpoint settings/csat · ลูปส่ง/เก็บ CSAT เดิม

#### Acceptance criteria

AC-005.1: หน้าแสดงชุด default ตาม constant ครบ (scale/rules/channels) และไม่มีทางแก้ค่าบนหน้าเว็บ

#### Required validation and expected evidence

ตรวจ AC-005.1 ด้วยการเทียบข้อมูลที่ render กับ API/constant + tsc/eslint — บันทึกเป็นหลักฐาน (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

revert commit ของหน้านี้ได้เป็นเอกภาพ — ไม่กระทบ endpoint

### Task FE-crm-case-dashboard-P1-03 — remove unused settings mock data

Objective: ลบ mock data ที่ไม่ถูกใช้แล้วของ 2 หน้า settings (sla-mock.data.ts / csat-mock.data.ts → ค่าย้ายเป็น constant แล้ว) — ลบแล้วทั้ง sla-timing-options.tsx (แทนด้วย setting-options-card.tsx ที่ settings/_components)
Why: สัญญา wiring กำหนดให้ mock/_data ถูกลบเมื่อ wire เสร็จ เพื่อไม่ให้เหลือสองแหล่งค่า
Owner: frontend-engineer
Depends on: none
Traceability: REQ-004, REQ-005, AC-004.2, AC-005.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseDashboardWiring.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

ลบเฉพาะไฟล์ mock ที่หน้า settings เลิกใช้แล้ว — ต้องเช็คว่าไม่มี import ค้างก่อนลบทุกไฟล์

#### Retrieval hints

Hypothesis: เหลือ import จากหน้า settings เท่านั้นหลัง wire เสร็จ — ค้นยืนยันว่าไม่มีที่อื่นอ้างถึงก่อนลบ
Query: หา import ของ `sla-mock.data.ts`, `csat-mock.data.ts`, `sla-timing-options.tsx`, `setting-options-card.tsx` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

`crm-mock.data.ts` (ยังถูกใช้โดย groups/schools — อยู่ใน Phase 2/3) · หน้า settings ที่ wire แล้ว

#### Acceptance criteria

AC-004.2: หน้า settings/sla ยังแสดงค่าจาก constant ถูกต้องหลังลบ mock
AC-005.1: หน้า settings/csat ยังแสดงค่าจาก constant ถูกต้องหลังลบ mock

#### Required validation and expected evidence

ตรวจ AC-004.2 และ AC-005.1 ด้วย build/tsc ผ่านหลังลบ + grep ไม่เหลือ import ค้าง — เก็บผลเป็นหลักฐาน (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

ไฟล์ที่ลบอยู่ใน git history — restore รายไฟล์ได้หากพบ consumer ที่พลาด

## Phase 2: Dashboard Aggregation API + Wiring

### Task BE-crm-case-dashboard-P2-01 — dashboard endpoint scaffold

Objective: scaffold `src/app/api/v2/support/crm-case/dashboard/route.ts` + `dashboard.repository.ts` + `dashboard.schema.ts` (Zod query: `from`/`to` `z.coerce.date()` optional default 30 วัน) + `dashboard.service.ts` — guard `MENU_SUPPORT_CRM` — verify 2026-08-24 (401 guard ถูกต้อง, tsc/eslint ผ่าน)
Why: ทุก KPI ต้อง aggregate server-side ที่ route เดียวนี้ — scaffold คือจุดที่เมตริกทั้งหมดจะถูกประกอบ
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, DES-003, DES-007, DEC-003
Produces: Contract:CrmCaseDashboardApi.v1
Consumes: none
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

สร้างโครง route/repository/schema/service ตาม pattern v2 — query รับ `from`/`to` optional (default 30 วัน) ผ่าน `z.coerce.date()` — ยังไม่ implement สูตรเมตริก (อยู่ที่ task ถัดไปของเฟสนี้)

#### Retrieval hints

Hypothesis: โครงควรเลียน flat pattern ของ v2 routes เดิม + guard แยกไฟล์ — ยืนยัน path/symbol กับซอร์สจริง
Query: หา `dashboard/route.ts`, `dashboard.schema.ts`, `guardCrmCase`, `z.coerce.date` ใน Target
Provenance: DES-003, DES-007, DEC-003, Contract:CrmCaseDashboardApi.v1

#### Do not modify

สูตรเมตริกใน task อื่นของเฟสนี้ · สคีมา/ตาราง · route ของโมดูลอื่น

#### Acceptance criteria

AC-001.1: endpoint พร้อมรับช่วงวันที่และคืน payload โครงสร้างเดียวสำหรับทุกการ์ดของหน้าภาพรวม (เนื้อค่าจะตามจาก task เมตริก)

#### Required validation and expected evidence

ตรวจ AC-001.1 ด้วย dev server: 401 เมื่อไม่ผ่าน guard + response โครงถูกต้อง + tsc/eslint — บันทึกแล้ว 2026-08-24

#### Rollback/compatibility notes

ไฟล์ scaffold ใหม่ทั้งหมด — revert รายไฟล์ได้ ไม่มี consumer ภายนอกยัง wire

### Task BE-crm-case-dashboard-P2-02 — dashboard metrics repository

Objective: repository implement metric ครบตาม design § Metrics — ทุก where clause: `DeleteDate IS NULL` + ช่วงวันที่ · สถานะปิดใช้ `STATUS_ALIASES.CLOSED+RESOLVED` **import จาก** `src/app/api/v1/support/crm/crm.repository.ts` ห้าม copy string ซ้ำ
Why: ความถูกต้องของทุกเมตริกขึ้นกับ filter ร่วมและแหล่ง alias สถานะเดียว — copy string จะทำให้นิยาม "ปิด" เพี้ยนเงียบ
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.2, DES-003, DEC-003
Produces: Contract:CrmCaseDashboardMetrics.v1
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

implement ใน repository ของ dashboard route เท่านั้น — ทุก query ต้องมี `DeleteDate IS NULL` + ช่วงวันที่จาก query param และ alias สถานะต้อง import จากที่เดียว

#### Retrieval hints

Hypothesis: `STATUS_ALIASES` มีอยู่แล้วใน `crm.repository.ts` ของ v1 — import ใช้ ไม่สร้างใหม่ ยืนยัน symbol กับซอร์สจริง
Query: หา `dashboard.repository.ts`, `STATUS_ALIASES`, `DeleteDate IS NULL` ใน Target
Provenance: DES-003, DEC-003, Contract:CrmCaseDashboardMetrics.v1

#### Do not modify

`crm.repository.ts` ของ v1 (แค่ import) · สูตรที่ design ล็อกไว้ (ห้ามตีความใหม่) · สคีมาใด ๆ

#### Acceptance criteria

AC-001.2: MTTR ใช้ avg(`UpdateDate` − `IssueDate`) เฉพาะเคสสถานะปิดตาม alias เดียวกับ v1 — raw elapsed ไม่ปรับ business-hours ใน MVP

#### Required validation and expected evidence

ตรวจ AC-001.2 ด้วยการอ่าน query ที่ implement + เทียบ alias ที่ import กับต้นทาง + tsc/eslint — บันทึกเป็นหลักฐาน (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

เพิ่ม method ใน repository ของโมดูลเอง — revert ได้โดยไม่กระทบ v1 (ไม่แก้ไฟล์ต้นทาง alias)

### Task BE-crm-case-dashboard-P2-03 — MTTR + CSAT aggregation rules

Objective: MTTR: avg(`UpdateDate − IssueDate`) เฉพาะเคสปิด timestamp ครบ · delta<0 ตัด+นับ log · raw elapsed · CSAT: `%≥threshold` + avg stars จาก `TCrmFeedback` join เคสปิดในช่วง **dedupe ต่อเคส (CrmFeedbackId มากสุด)** · 0 คำตอบ → null (frontend แสดง empty state ไม่ใช่ 0%) — หมายเหตุ: dedupe ใช้ลำดับ fetch แรกต่อเคส (ยังไม่ sort by CrmFeedbackId — เพียงพอเชิง MVP เพราะ feedback ต่อเคสแทบไม่ซ้ำ; ถ้าต้องการ deterministic ให้เพิ่ม orderBy id desc)
Why: `TCrmFeedback` ไม่มี unique constraint — ถ้าไม่ dedupe ต่อเคส CSAT จะเพี้ยนเงียบ และ 0 คำตอบต้องเป็น null ไม่ใช่ 0%
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.2, DES-003
Produces: none
Consumes: Contract:CrmCaseDashboardMetrics.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

คำนวณใน service/repository ของ dashboard เท่านั้น — สูตรล็อกตาม contract เมตริก ห้ามตีความใหม่ · ค่าที่คำนวณไม่ได้ (timestamp ขาด/score NULL/0 คำตอบ) คืน null

#### Retrieval hints

Hypothesis: helper dedupe น่าจะอยู่เป็น function แยกใน dashboard helper — ยืนยัน symbol/บรรทัดกับซอร์สจริง
Query: หา `dashboard-metrics.helper.ts`, `dedupeFeedbackScores`, `CrmFeedbackId` ใน Target
Provenance: DES-003, Contract:CrmCaseDashboardMetrics.v1

#### Do not modify

สูตร MTTR ที่ design ล็อก (IssueDate→UpdateDate เสมอ) · `TCrmFeedback`/สคีมา · ตัวเลขที่ frontend ควร format เอง

#### Acceptance criteria

AC-001.2: MTTR นับเฉพาะเคสปิดที่ timestamp ครบ ตัด delta ติดลบออกพร้อม log — และ CSAT dedupe ต่อเคสก่อนคิด % satisfied + avg stars, 0 คำตอบได้ null

#### Required validation and expected evidence

ตรวจ AC-001.2 ด้วยชุดข้อมูลทดสอบ: เคสปิด/ไม่ปิด, feedback ซ้ำต่อเคส, 0 คำตอบ — เทียบผลลัพธ์กับสูตร + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

เป็นส่วนคำนวณภายใน dashboard service — revert ได้โดยไม่กระทบ endpoint อื่น

### Task BE-crm-case-dashboard-P2-04 — subsystem tiles + type breakdown buckets

Objective: subsystem tiles: `TGroupMenu active=true` ← `TMenu.groupmenuid` ← `TCrmSupport.MenuId` + bucket "ไม่ระบุระบบ" (`MenuId IS NULL`) ท้ายรายการเสมอ · type breakdown รวม bucket "ยังไม่จำแนก" (`AiCategory IS NULL`) ผลรวมทุก bucket = เคสในช่วง
Why: การผูก subsystem ต้องเดินตามสคีมาเดิมเท่านั้น และเคสที่ยังไม่จำแนกต้องไม่ถูก drop เงียบ ๆ ไม่งั้นภาพรวมดูครบเกินจริง
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.3, DES-002, DEC-002
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

ผูกผ่าน path `MenuId → TMenu.groupmenuid → TGroupMenu` พร้อม filter `DeleteDate IS NULL` ทุกชั้น — bucket "ไม่ระบุระบบ"/"ยังไม่จำแนก" ต้องอยู่ในผลลัพธ์เสมอ (ท้ายรายการ)

#### Retrieval hints

Hypothesis: join ผ่าน prisma include/raw query ตาม pattern ของ repository เดิม — ยืนยันชื่อ field ใน schema จริงก่อนใช้
Query: หา `TGroupMenu`, `groupmenuid`, `AiCategory`, `MenuId` ใน schema และ repository ของ dashboard
Provenance: DES-002, DEC-002

#### Do not modify

สคีมา/ตาราง (อ่านอย่างเดียว) · นิยามกลุ่มที่ใช้ร่วมกับ groups API ของ Phase 3

#### Acceptance criteria

AC-001.3: subsystem รวมระดับ `TGroupMenu` (`active=true`) ผ่าน `MenuId → groupmenuid` — ไม่ใช้ `ModuleKey` hardcode และมี bucket สำหรับเคสที่ไม่ระบุระบบ

#### Required validation and expected evidence

ตรวจ AC-001.3 ด้วยการเทียบ join path กับ schema + ทดสอบผลรวม bucket เท่าจำนวนเคสในช่วง + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

เป็น query ภายใน repository ของโมดูล — revert ได้ ไม่กระทบตารางจริง

### Task BE-crm-case-dashboard-P2-05 — top urgent cases payload

Objective: top urgent = เคสเปิด sort `ComputedPriorityScore DESC NULLS LAST` take N · SLA level ของกลุ่ม (danger/warn/ok) อยู่ใน Phase 3 groups endpoint — dashboard payload ครอบ overdue_count (open card) แทน
Why: อันดับความเร่งด่วนต้องใช้คะแนนที่ crm-ai-support คำนวณไว้แล้วเท่านั้น และต้องไม่ไปซ้ำ logic SLA ระดับกลุ่มที่อยู่ของ Phase 3
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, DES-003
Produces: none
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

เฉพาะ payload ของ dashboard card — score NULL ต้องไปท้าย (NULLS LAST) และ payload ต้องมี overdue_count สำหรับ open card ส่วน SLA level กลุ่มอย่าเพิ่งทำใน dashboard

#### Retrieval hints

Hypothesis: sort ผ่าน raw SQL/orderBy ของ prisma ที่รองรับ NULLS LAST — ยืนยันรูปแบบที่ใช้ได้จริงกับ datasource
Query: หา `ComputedPriorityScore`, `TCrmCaseAiAssessment`, `NULLS LAST` ใน repository ของ dashboard
Provenance: DES-003

#### Do not modify

คะแนน/การประเมินของ crm-ai-support (อ่านอย่างเดียว) · สูตร SLA level กลุ่มที่เป็นของ Phase 3

#### Acceptance criteria

AC-001.1: การ์ดเคสเร่งด่วนอันดับต้นได้รายการจากเคสเปิดจริงเรียงตาม score ที่มีอยู่ — score NULL ไม่ขึ้นหน้าและ card มี overdue_count

#### Required validation and expected evidence

ตรวจ AC-001.1 ด้วยชุดข้อมูลที่มี/ไม่มี score — เทียบลำดับผลลัพธ์ + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

ส่วน query ภายใน dashboard — revert ได้ ไม่กระทบ assessment ต้นทาง

### Task FE-crm-case-dashboard-P2-01 — wire dashboard cards to GET /dashboard

Objective: ผูก `crm/page.tsx` + `crm-dashboard-view.tsx` ทุกการ์ดเข้า `GET /dashboard` ผ่าน `_api/crm-dashboard-service.ts` + Zustand `_stores/use-crm-dashboard-store.ts` (days 7/30/90 + refresh) — ทุกการ์ด prop-driven พร้อม empty-state — verify tsc/eslint (2026-08-24)
Why: หน้าภาพรวมต้องแสดงข้อมูลจริงจาก payload server เดียว แทน mock data และต้องรองรับช่วงวันที่เลือกได้
Owner: frontend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

type ของหน้ามาจาก payload API จริง (ไม่มี mock fallback หลัง wire) — ทุกการ์ดต้องมี empty-state สำหรับค่า null/ยังไม่มีข้อมูลจำแนก

#### Retrieval hints

Hypothesis: service layer เดิมมีจุดรวม URL/การเรียก API อยู่แล้ว — ต่อที่นั่น และ store เก็บ days/refresh — ยืนยัน path กับซอร์สจริง
Query: หา `crm-dashboard-service.ts`, `use-crm-dashboard-store.ts`, `crm-dashboard-view.tsx` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

endpoint/dashboard repository ฝั่ง BE · การ์ดที่หน้าอื่น reuse ร่วมกันโดยไม่ได้อยู่ในแถวงานนี้

#### Acceptance criteria

AC-001.1: การ์ดทุกใบของหน้าภาพรวม (เคสเปิดค้าง, MTTR, CSAT, แนวโน้มรายวัน, โรงเรียน, subsystem, เคสเร่งด่วน, ประเภทเคส) ผูกข้อมูลจริงจาก API แล้ว ไม่ใช่ mock

#### Required validation and expected evidence

ตรวจ AC-001.1 ด้วยการรัน dev server เทียบการ์ดกับ payload + tsc/eslint — บันทึกแล้ว 2026-08-24

#### Rollback/compatibility notes

revert wiring commit ทั้งชุดพร้อมกัน (service/store/view) — ห้ามค้างครึ่ง ๆ ระหว่าง mock กับ API

### Task FE-crm-case-dashboard-P2-02 — dashboard card details (theme/buckets/badges)

Objective: `daily-trend-chart` ส่ง theme ครบ (2 series เคสใหม่/ปิดแล้ว) · `top-subsystems-card` dynamic TGroupMenu · `type-breakdown-tiles` QA + tile "ยังไม่จำแนก" (ไม่มีลิงก์, "รอการจำแนกด้วย AI") · `top-urgent-cases-card` badge "รอคะแนน" เมื่อ score NULL
Why: รายละเอียดการ์ดต้องสื่อสารสถานะจริง (ยังไม่จำแนก/รอคะแนน) แทนการซ่อน และกราฟต้องรองรับ dark mode
Owner: frontend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, AC-001.3, DES-002, DES-008
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

แก้เฉพาะ component การ์ดที่ระบุ — subsystem dynamic จาก `TGroupMenu` (key=`groupmenuid`) ไม่ใช้ key hardcode และ tile "ยังไม่จำแนก" ไม่มีลิงก์

#### Retrieval hints

Hypothesis: component การ์ดอยู่ใต้โฟลเดอร์ components ของ crm page — ยืนยันชื่อไฟล์จริงก่อนแก้
Query: หา `daily-trend-chart`, `top-subsystems-card`, `type-breakdown-tiles`, `top-urgent-cases-card` ใน Target
Provenance: DES-002, DES-008, Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

payload ฝั่ง BE · mock data · การ์ดของหน้า groups/schools

#### Acceptance criteria

AC-001.1: กราฟแนวโน้ม/การ์ดย่อยแสดงข้อมูลจริงจาก payload ครบทั้ง 2 series และ theme ถูกต้อง
AC-001.3: subsystem card แสดงตาม TGroupMenu จริง (dynamic) ไม่ใช้ ModuleKey hardcode

#### Required validation and expected evidence

ตรวจ AC-001.1 และ AC-001.3 ด้วย dev server เทียบการ์ดกับ payload จริง (เคสที่ score NULL ต้องขึ้น badge "รอคะแนน") + tsc/eslint — บันทึกเป็นหลักฐาน (verified แล้ว)

#### Rollback/compatibility notes

revert ราย component ได้ — ไม่กระทบโครง store/service

### Task FE-crm-case-dashboard-P2-03 — dashboard filter bar (segmented days)

Objective: `dashboard-filter-bar` → Segmented days ใน view (region filter ตัด — ไม่มี data source, Open Question) — **crm-mock.data.ts ยังไม่ลบ** เพราะ groups/schools pages (Phase 3) ยัง import อยู่; crm.types.ts คงไว้เช่นกัน
Why: filter ที่ไม่มีแหล่งข้อมูลจริงต้องถูกตัดออก แต่ mock ที่ยังถูก import โดยหน้า Phase 3 ต้องคงไว้จนกว่าจะ wire เสร็จ
Owner: frontend-engineer
Depends on: none
Traceability: REQ-001, AC-001.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

เปลี่ยน filter เป็น Segmented days (7/30/90) ผูกกับ store — region filter ตัดออก และห้ามลบ `crm-mock.data.ts`/`crm.types.ts` ใน task นี้

#### Retrieval hints

Hypothesis: filter bar component มี prop/state เดิมผูก mock — แก้ที่ view ให้เรียกผ่าน store — ยืนยันชื่อ component จริงก่อนแก้
Query: หา `dashboard-filter-bar`, `crm-mock.data.ts`, `crm.types.ts` และ import ที่ยังอ้างถึงใน Target
Provenance: DES-008, DEC-008

#### Do not modify

`crm-mock.data.ts` / `crm.types.ts` (ยังถูก import) · BE payload

#### Acceptance criteria

AC-001.1: การ์ดทุกใบตอบสนองการเลือก days 7/30/90 ด้วย payload จริงจาก API

#### Required validation and expected evidence

ตรวจ AC-001.1 ด้วยการเปลี่ยนค่า days บนหน้าแล้ว payload ที่เรียกเปลี่ยนตาม + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

revert ราย component ได้ — การคง mock ไว้ไม่กระทบหน้าที่ wire แล้ว

## Phase 3: Groups & Schools Drill-down

### Task BE-crm-case-dashboard-P3-01 — GET /groups/[type] ranked list

Objective: `GET /api/v2/support/crm-case/groups/[type]` — list กลุ่ม (type ∈ BUG\|FEATURE\|TASK\|QA ตรวจด้วย Zod enum) จัดอันดับ max→avg `ComputedPriorityScore` (NULL ไม่นับ · กลุ่มไม่มี score ท้ายสุด + flag `pendingScore`) + slaLevel chip ✅ (groups.repository/service, raw SQL LEFT JOIN assessment, slaLevel = oldest open vs closeMinutes)
Why: การจัดอันดับกลุ่มต้อง reuse คะแนนที่ crm-ai-support คำนวณไว้ ไม่คิดสูตรใหม่ และกลุ่มที่ยังไม่มี score ต้องถูก flag ไม่ใช่หายไป
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.1, AC-002.2, DES-002, DES-003, DEC-002
Produces: Contract:CrmCaseSubsystemGrouping.v1
Consumes: none
Risk: medium
Human gate: none
Status: verified

#### Scope and constraints

type ตรวจด้วย Zod enum 4 ค่า — กลุ่ม = เคส `AiCategory` เดียวกัน + `MenuId` เดียวกัน (groupId = `MenuId` หรือ `"none"`) — slaLevel ใช้ `closeMinutes` ของ `CRM_CASE_SLA_TARGETS` (>100% danger / >70% warn / else ok)

#### Retrieval hints

Hypothesis: raw SQL LEFT JOIN assessment ต่อเคสแล้วรวมฝั่ง app — ยืนยัน query/symbol กับซอร์สจริงก่อนใช้
Query: หา `groups.repository.ts`, `findGroupSummaries`, `pendingScore`, `slaLevel` ใน Target
Provenance: DES-002, DEC-002, Contract:CrmCaseSubsystemGrouping.v1

#### Do not modify

คะแนน/assessment ต้นทางของ crm-ai-support · สคีมาใด ๆ · constant SLA

#### Acceptance criteria

AC-002.1: กลุ่มถูกจัดตาม `AiCategory` ที่ crm-ai-support คำนวณไว้ ครบ 4 type ที่ enum รับ
AC-002.2: อันดับใช้ max→avg ของ `ComputedPriorityScore` เท่านั้น — score NULL ไม่ถูกนับและกลุ่มที่ไม่มี score ไปท้ายพร้อม flag `pendingScore`

#### Required validation and expected evidence

ตรวจ AC-002.1 และ AC-002.2 ด้วยชุดข้อมูลที่มี/ไม่มี score — เทียบลำดับ + flag + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบตารางจริง

### Task BE-crm-case-dashboard-P3-02 — GET /groups/[type]/[groupId] detail + cases

Objective: `GET /api/v2/support/crm-case/groups/[type]/[groupId]` — groupId = MenuId หรือ `"none"` · รายละเอียดกลุ่ม + เคส pagination บังคับ (`buildPagination`) ✅
Why: drill-down จากกลุ่มไปรายการเคสต้องระบุกลุ่มได้ทั้งกรณีมี/ไม่มี MenuId และ list ทุกใบต้อง pagination เสมอ
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.3, DES-002, DES-007
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseSubsystemGrouping.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

groupId รับค่า `MenuId` หรือ literal `"none"` — pagination บังคับด้วย `buildPagination` ตาม contract API ของโมดูล

#### Retrieval hints

Hypothesis: query รายการเคสต่อยอดจาก repository กลุ่มเดิม — ยืนยัน pattern กับซอร์สจริง
Query: หา `groups/[type]/[groupId]`, `buildPagination`, `"none"` ใน Target
Provenance: DES-002, Contract:CrmCaseSubsystemGrouping.v1

#### Do not modify

นิยามกลุ่ม/อันดับ (task BE-crm-case-dashboard-P3-01) · สคีมาใด ๆ

#### Acceptance criteria

AC-002.3: ไล่จากกลุ่มเข้ารายการเคสได้ทั้งกรณีกลุ่มมี MenuId และกลุ่ม "none" — รายการเคสแบ่งหน้าได้จริง

#### Required validation and expected evidence

ตรวจ AC-002.3 ด้วยการเรียก endpoint ทั้ง 2 รูปแบบ groupId + ตรวจ pagination params + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-case-dashboard-P3-03 — GET /cases/[id] case detail

Objective: `GET /api/v2/support/crm-case/cases/[id]` — header + thread (`TCrmSupportComment` sort CreateDate asc) + CSAT ของเคส (`TCrmFeedback` dedupe) + assignee (tAdmin FirstName/LastName) + assessment ✅
Why: หน้ารายละเอียดเคสต้องได้ข้อมูลครบชุดเดียวจาก endpoint เดียว เพื่อให้ drill-down ถึงเคสเดี่ยวจบใน payload เดียว
Owner: backend-engineer
Depends on: none
Traceability: REQ-002, AC-002.3, DES-002, DES-007
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

thread เรียง `CreateDate` asc — CSAT เคสต้อง dedupe ต่อเคสก่อนใช้ (ตาราง feedback ไม่มี unique constraint) — timeline ใช้ timestamp ที่มีจริงเท่านั้น

#### Retrieval hints

Hypothesis: join comment/feedback/admin ใน repository เดียว — ยืนยันชื่อตาราง/field กับ schema จริง
Query: หา `TCrmSupportComment`, `cases/[id]`, `TCrmFeedback`, `TAdmin` ใน Target
Provenance: DES-002, DES-007, Contract:CrmCaseDashboardApi.v1

#### Do not modify

สคีมา/ตาราง (อ่านอย่างเดียว) · endpoint อื่นของโมดูล

#### Acceptance criteria

AC-002.3: รายละเอียดเคสเดี่ยวคืบ header/thread/CSAT/assignee ครบ — ใช้ไปเป็น message thread, timeline, ผู้รับผิดชอบ และคะแนน CSAT ของเคสนั้นได้

#### Required validation and expected evidence

ตรวจ AC-002.3 ด้วยการเรียก endpoint กับเคสที่มี/ไม่มี feedback ซ้ำ — เทียบโครง response + tsc/eslint (verified แล้วตามแถวเดิม)

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-case-dashboard-P3-04 — GET /schools + /schools/[schoolId]

Objective: `GET /api/v2/support/crm-case/schools` — list โรงเรียนที่มีเคส (pagination, join `TCompany.sCompany` app-layer) · `GET .../schools/[schoolId]` — สรุปโรงเรียน + เคส pagination ✅ verify tsc/eslint/401 (2026-08-24) — ⚠️ frontend wiring ของ groups/schools ยังค้าง (mockup pages ยัง render mock)
Why: มุมมองตามโรงเรียนต้องใช้ id ที่เทียบกับ `TCompany` ได้จริง และ list/summary ทุกใบต้อง pagination บังคับ
Owner: backend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, DES-007
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1
Risk: low
Human gate: none
Status: verified

#### Scope and constraints

join `TCompany.sCompany` ทำ app-layer — โรงเรียนที่ไม่ระบุ (NULL) ต้องมี label "ไม่ระบุ" ไม่หายไป — wiring ฝั่ง frontend ยังไม่เสร็จ (อยู่ Phase 3 FE tasks)

#### Retrieval hints

Hypothesis: list โรงเรียน group by `SchoolId` แล้ว join ชื่อจาก TCompany ฝั่ง app — ยืนยัน field กับ schema จริง
Query: หา `schools/route.ts`, `TCompany`, `sCompany`, `buildPagination` ใน Target
Provenance: DES-007, Contract:CrmCaseDashboardApi.v1

#### Do not modify

สคีมา/ตาราง (อ่านอย่างเดียว) · endpoint groups

#### Acceptance criteria

AC-003.1: เลือกโรงเรียนหนึ่งๆ แล้วดึงรายการ/สรุปเคสของโรงเรียนนั้นได้ผ่าน endpoint พร้อม pagination จริง

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วยการเรียกทั้ง 2 endpoint (มี/ไม่มี pagination params) + 401 guard + tsc/eslint — บันทึกแล้ว 2026-08-24

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task FE-crm-case-dashboard-P3-01 — groups/[type] page wiring

Objective: `groups/[type]/page.tsx` — `type-tabs` ใช้ QA · `ranked-group-card` ผูก score/urgency-rank-badge (เพิ่ม badge "รอคะแนน") · `group-filters-bar` due buckets คำนวณจาก `closeMinutes` − อายุเคส (overdue/d1/d2/d3/normal)
Why: หน้ากลุ่มต้องแสดงผลจาก groups API จริง (type จาก AiCategory จริง + อันดับจาก score จริง) แทน mock
Owner: frontend-engineer
Depends on: none
Traceability: REQ-002, AC-002.1, AC-002.2, DES-002, DES-008
Produces: none
Consumes: Contract:CrmCaseSubsystemGrouping.v1, Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

type-tabs ต้อง mapping ค่าจริง (question→QA) — badge "รอคะแนน" สำหรับกลุ่ม flag `pendingScore` — due buckets คำนวณฝั่ง client จาก `closeMinutes` ที่ payload ให้

#### Retrieval hints

Hypothesis: mockup component (type-tabs/ranked-group-card/group-filters-bar) มีอยู่แล้วเหลือผูกข้อมูล — ยืนยันชื่อไฟล์จริงก่อนแก้
Query: หา `groups/[type]/page.tsx`, `ranked-group-card`, `group-filters-bar`, `closeMinutes` ใน Target
Provenance: DES-002, DES-008, Contract:CrmCaseSubsystemGrouping.v1, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

groups API ฝั่ง BE · หน้า dashboard · mock ที่หน้าอื่นยังใช้

#### Acceptance criteria

AC-002.1: tabs แสดง 4 type ตาม AiCategory จริงจาก API (BUG/FEATURE/TASK/QA)
AC-002.2: การ์ดกลุ่มเรียงตามอันดับ score จาก API — กลุ่ม pendingScore ขึ้น badge "รอคะแนน" และอยู่ท้าย

#### Required validation and expected evidence

ตรวจ AC-002.1 และ AC-002.2 ด้วย dev server เทียบหน้ากับ groups API จริง (กลุ่มมี/ไม่มี score) + tsc/eslint — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

revert wiring ของหน้านี้ได้เป็นชุด — mock ยังอยู่จนกว่าจะยืนยันว่า wire เสร็จ

### Task FE-crm-case-dashboard-P3-02 — group detail + case detail pages wiring

Objective: `groups/[type]/[groupId]/page.tsx` + `groups/[type]/[groupId]/[caseId]/page.tsx` — case-list-table (pagination) · case-header-card/message-thread/case-timeline/case-csat-card/case-assignee-panel ผูก API จริง
Why: drill-down กลุ่ม → เคสเดี่ยวต้องใช้ข้อมูลจริงจาก API ทั้ง list และรายละเอียด
Owner: frontend-engineer
Depends on: none
Traceability: REQ-002, AC-002.3, DES-002, DES-008
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

type ของหน้ามาจาก payload API จริง — timeline แสดงเฉพาะ timestamp ที่ระบบมีจริง (ไม่มี status-history audit) — pagination ของ case-list-table ต้องเดินตาม API

#### Retrieval hints

Hypothesis: mockup pages + case components มีอยู่แล้วเหลือผูก service layer — ยืนยัน path/ชื่อ component จริงก่อนแก้
Query: หา `groups/[type]/[groupId]/page.tsx`, `[caseId]/page.tsx`, `case-list-table`, `message-thread` ใน Target
Provenance: DES-008, Contract:CrmCaseDashboardApi.v1

#### Do not modify

endpoint ฝั่ง BE · หน้า dashboard/settings · mock ที่หน้าอื่นยังใช้

#### Acceptance criteria

AC-002.3: จากหน้ากลุ่มกดเข้ารายการเคสและเคสเดี่ยวได้จริง — thread/timeline/CSAT/assignee แสดงจาก API จริงครบ

#### Required validation and expected evidence

ตรวจ AC-002.3 ด้วย dev server เดิน drill-down จริงทั้งสาย (groups → groupId → caseId) เทียบกับ API + tsc/eslint — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

revert wiring สองหน้าได้เป็นชุด — ห้ามค้างครึ่ง ๆ ระหว่าง mock กับ API

### Task FE-crm-case-dashboard-P3-03 — schools route [schoolName] → [schoolId] + wiring

Objective: เปลี่ยน route param `schools/[schoolName]` → `schools/[schoolId]` (folder rename + link ที่ชี้มาทั้งหมด) — `school-summary-header` ซ่อน chip region/size · `school-case-table` ผูก API + pagination
Why: route ต้องอ้าง id ที่ join กับ `TCompany` ได้จริง และ region/size ยังไม่มี column ต้นทาง (Open Question) จึงต้องซ่อน chip
Owner: frontend-engineer
Depends on: none
Traceability: REQ-003, AC-003.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

rename folder + อัปเดต link ที่ชี้มาทั้งหมดในครั้งเดียว (ไม่ทิ้ง route เก่าคู่ขนาน) — chip region/size ซ่อนจนกว่าจะมีแหล่งข้อมูลจริง

#### Retrieval hints

Hypothesis: มี link ที่ชี้ `[schoolName]` กระจายหลายจุด — ต้อง grep ให้ครบก่อน rename — ยืนยันรายการจุดที่อ้างถึงกับซอร์สจริง
Query: หา `schools/[schoolName]`, `schools/[schoolId]`, `school-summary-header`, `school-case-table` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

BE endpoint (ใช้ schoolId อยู่แล้ว) · หน้าอื่นที่ไม่เกี่ยวกับ schools

#### Acceptance criteria

AC-003.1: เข้าหน้าโรงเรียนผ่าน `[schoolId]` แล้วเห็นสรุป + ตารางเคสของโรงเรียนนั้นจาก API จริงแบ่งหน้าได้ — link ทุกจุดชี้ route ใหม่ถูกต้อง

#### Required validation and expected evidence

ตรวจ AC-003.1 ด้วย dev server: เดิน link จาก dashboard/groups เข้าหน้าโรงเรียนจริง + grep ไม่เหลือ reference route เก่า + tsc/eslint — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

rename route ต้อง revert ทั้งชุด (folder + links) พร้อมกัน — ห้ามค้างสอง route

### Task FE-crm-case-dashboard-P3-04 — sidebar path check after refactor

Objective: ตรวจ sidebar entries เดิม (`sidebar-menu-constant.tsx` ใต้ `MENU_SUPPORT_CRM`) ยังชี้ path ถูกหลัง refactor — ไม่เพิ่มเมนูใหม่ (มีอยู่แล้ว)
Why: การ rename route/ผูกหน้าใหม่ต้องไม่ทำให้ทางเข้าเดิมในเมนูพัง — เป็นการตรวจเท่านั้น ไม่เพิ่มของใหม่
Owner: frontend-engineer
Depends on: none
Traceability: REQ-002, REQ-003, AC-002.3, AC-003.1, DES-008
Produces: none
Consumes: none
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

เป็น task ตรวจ/แก้ path ใน constant เท่านั้น — ห้ามเพิ่ม/ลบเมนู (โครงเมนูเดิมคงอยู่)

#### Retrieval hints

Hypothesis: sidebar constant มี path ของหน้า crm ทั้งหมดรวมอยู่แล้ว — เทียบกับ route จริงหลัง refactor
Query: หา `sidebar-menu-constant.tsx`, `MENU_SUPPORT_CRM` และ route ของหน้า groups/schools ใน Target
Provenance: DES-008

#### Do not modify

โครง sidebar ส่วนอื่นที่ไม่ใช่ crm · route ของหน้า

#### Acceptance criteria

AC-002.3: ทางเข้าหน้ากลุ่ม/เคสจาก sidebar เดิน drill-down ได้ครบหลัง refactor
AC-003.1: ทางเข้าหน้าโรงเรียนจาก sidebar ชี้ `[schoolId]` ถูกต้อง

#### Required validation and expected evidence

ตรวจ AC-002.3 และ AC-003.1 ด้วยการคลิกทางเข้าจาก sidebar จริงทุก entry ใต้ MENU_SUPPORT_CRM — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

แก้เฉพาะค่า path ใน constant — revert รายบรรทัดได้

## Phase 4: Insights (TCrmKnowledgeEntry `INSIGHT_*`)

### Task BE-crm-case-dashboard-P4-01 — prerequisite: INSIGHT_% filter at crm-ai-support retrieval

Objective: **prerequisite (ต้องเสร็จก่อน task APPROVED แรกของ insights)**: แก้ knowledge retrieval ของ crm-ai-support (จุดที่ query `Status=APPROVED` ไปตอบ QA — Phase 2 ของ crm-ai-support) เพิ่ม filter `Category NOT LIKE 'INSIGHT_%'` — additive 1 จุด ประสาน owner crm-ai-support + อัปเดต spec ฝั่งนั้นด้วย (กัน insight โดนดึงไปตอบคำถามลูกค้า)
Why: ถ้าไม่กรอง entry `APPROVED` ของ insights จะถูกดึงไปตอบคำถามลูกค้าผ่าน QA retrieval (knowledge pollution — design Risk 5) จึงเป็นเงื่อนไขบังคับก่อนปล่อย insights ใช้จริง
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.2, DES-006, DEC-006
Produces: none
Consumes: none
Risk: shared-contract
Human gate: none
Status: pending

#### Scope and constraints

แตะโค้ด crm-ai-support จุดเดียวแบบ additive (เพิ่มเงื่อนไข filter) — ต้องประสาน owner crm-ai-support และอัปเดต spec ฝั่งนั้นให้ตรง — จนกว่า filter จะ deploy ให้คง entry ไว้ `DRAFT` เท่านั้น

#### Retrieval hints

Hypothesis: จุด query `Status=APPROVED` อยู่ใน knowledge retrieval ของ crm-ai-support Phase 2 — ค้นหา query นั้นและยืนยันกับซอร์สจริงของ repo นั้นก่อนแก้
Query: หา `Status=APPROVED` หรือ `status: "APPROVED"` ใน knowledge retrieval ของ crm-ai-support และจุดที่ select `Category`
Provenance: DES-006, DEC-006

#### Do not modify

logic อื่นของ crm-ai-support นอกจากจุด filter เดียว · `TCrmKnowledgeEntry` schema · entry ที่เป็น knowledge ปกติ (non-INSIGHT)

#### Acceptance criteria

AC-006.2: retrieval ของ crm-ai-support ไม่ดึง entry ที่ `Category` ขึ้นต้น `INSIGHT_` ไปตอบ QA อีกต่อไป ในขณะที่ entry ปกติยังถูกดึงเหมือนเดิม

#### Required validation and expected evidence

ตรวจ AC-006.2 ด้วยการรัน retrieval กับชุดข้อมูลที่มีทั้ง knowledge ปกติและ INSIGHT_* — INSIGHT ต้องไม่ปรากฏในคำตอบ — บันทึกการประสาน owner + spec ที่อัปเดตเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

filter เป็นเงื่อนไขเพิ่มจุดเดียว — revert ได้ทันที แต่ต้องไม่ revert หลังเริ่ม `APPROVED` ใช้จริงโดยไม่มีทางเลือกกัน pollution

### Task BE-crm-case-dashboard-P4-02 — insight AnswerBody Zod schemas

Objective: Zod schemas 3 contract ของ `AnswerBody` — ✅ 2026-08-24 `src/constants/crm-case-insight.constant.ts` (BottleneckBody/RecurringTaskBody/FeatureRequestBody + CRM_INSIGHT_CATEGORIES, reportMonth regex YYYY-MM, FR identity refine ≥1 link)
Why: ทุกการเขียน/แก้ entry ต้อง validate `AnswerBody` ด้วย Zod ตาม contract ต่อ kind — ตัว schema คือรูปธรรมของสัญญา insights ที่ route/service ทุกจุดใช้ร่วมกัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.2, DES-006, DEC-006
Produces: Contract:CrmCaseInsightEntry.v1
Consumes: none
Risk: shared-contract
Human gate: none
Status: verified

#### Scope and constraints

สร้าง constant/schema ในไฟล์เดียว — `reportMonth` ตรวจ regex `YYYY-MM` — FeatureRequestBody ต้องมี identity link (issueId/productFeatureId) อย่างน้อย 1 ค่า — ห้ามมี field counts/deals ใน schema (derive สดเสมอ)

#### Retrieval hints

Hypothesis: ไฟล์ constant วางคู่กับ constant settings อื่นใน `src/constants/` — ยืนยัน symbol จริงก่อนใช้
Query: หา `crm-case-insight.constant.ts`, `BottleneckBody`, `FeatureRequestBody`, `CRM_INSIGHT_CATEGORIES` ใน Target
Provenance: DES-006, DEC-006, Contract:CrmCaseInsightEntry.v1

#### Do not modify

`TCrmKnowledgeEntry` schema · endpoint อื่น · ค่า permission

#### Acceptance criteria

AC-006.2: schema 3 kind ตรวจ `AnswerBody` ของ Category `INSIGHT_BOTTLENECK`/`INSIGHT_RECURRING_TASK`/`INSIGHT_FEATURE_REQUEST` ได้ตรงตาม contract (รวม reportMonth YYYY-MM และ FR identity ≥1 link)

#### Required validation and expected evidence

ตรวจ AC-006.2 ด้วยการรัน Zod parse ตัวอย่างผ่าน/ไม่ผ่านต่อ kind + tsc/eslint — บันทึกแล้ว 2026-08-24

#### Rollback/compatibility notes

ไฟล์ schema ใหม่ additive — แก้หลัง route ใช้งานแล้วต้อง bump ระวัง consumer — ควรเปลี่ยนแบบ additive เท่านั้น

### Task BE-crm-case-dashboard-P4-03 — insights.repository.ts CRUD on TCrmKnowledgeEntry

Objective: service/repository กลาง `insights.repository.ts` — CRUD บน `TCrmKnowledgeEntry` (`Category=INSIGHT_*`, create default `Status=DRAFT`, update bump `Version`+set `SupersededById` chain ตามธรรมเนียมตาราง, delete = `Status=ARCHIVED` soft เท่านั้น)
Why: workflow ของตารางเดิม (DRAFT/APPROVED + SupersededById) ต้องถูกใช้ให้ตรง — soft delete เท่านั้น ห้ามลบแถว
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.2, DES-006
Produces: none
Consumes: Contract:CrmCaseInsightEntry.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

CRUD ผ่าน repository กลางเดียว — create ตั้ง `Status=DRAFT` เสมอ · update เพิ่ม `Version` และผูก `SupersededById` · delete = set `Status=ARCHIVED` (ห้าม hard delete) · `AnswerBody` ผ่าน Zod ทุกครั้ง

#### Retrieval hints

Hypothesis: ธรรมเนียม Version/SupersededById ของตารางมีตัวอย่างใน code เดิม — หาตัวอย่างยืนยันก่อน implement
Query: หา `insights.repository.ts`, `SupersededById`, `TCrmKnowledgeEntry`, `ARCHIVED` ใน Target
Provenance: DES-006, Contract:CrmCaseInsightEntry.v1

#### Do not modify

`TCrmKnowledgeEntry` schema · entry ของระบบอื่น (non-INSIGHT categories) · endpoint route (task ถัดไป)

#### Acceptance criteria

AC-006.2: ข้อมูล insights ถูกเก็บบน `TCrmKnowledgeEntry` ด้วย Category `INSIGHT_*` ตาม workflow เดิม — DRAFT default, update bump version พร้อม supersede chain, ลบ = ARCHIVED เท่านั้น

#### Required validation and expected evidence

ตรวจ AC-006.2 ด้วยการทดสอบ CRUD จริงบน dev database (create → ได้ DRAFT, update → Version+SupersededById ถูกต้อง, delete → Status=ARCHIVED แถวยังอยู่) — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

repository ใหม่ additive — ข้อมูลที่สร้างเป็นแถว DRAFT ปกติ ลบ task ไม่ทำให้ข้อมูลเสีย

### Task BE-crm-case-dashboard-P4-04 — bottlenecks endpoints

Objective: `GET/POST /api/v2/support/crm-case/insights/bottlenecks` + `[id]` PATCH/ARCHIVE — guard `CRM_AI_SA` (write) / `MENU_SUPPORT_CRM` (read)
Why: การเขียน insight bottleneck สงวนให้ SA เท่านั้น — การแยก guard read/write ต้องตรงตามสิทธิ์ที่ design กำหนด
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, AC-006.2, DES-006, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardApi.v1
Risk: authorization
Human gate: none
Status: pending

#### Scope and constraints

guard แยกไฟล์ตาม contract API — write ใช้ `CRM_AI_SA`, read ใช้ `MENU_SUPPORT_CRM` — POST/PATCH ต้อง validate ผ่าน schema ของ kind นี้และ error ผ่าน `handleError(err, "[CRM_CASE_DASHBOARD_...]")`

#### Retrieval hints

Hypothesis: guard pattern มีอยู่แล้วในโมดูล (crm-case.guard.ts + resource guard) — ต่อแบบเดียวกัน — ยืนยันกับซอร์สจริง
Query: หา `insights/bottlenecks`, `CRM_AI_SA`, `guardCrmCase`, `handleError` ใน Target
Provenance: DES-006, DES-007, DEC-007, Contract:CrmCaseInsightEntry.v1

#### Do not modify

ค่า permission เดิม (ไม่สร้าง permission ใหม่) · repository ของ kind อื่น · สคีมาใด ๆ

#### Acceptance criteria

AC-006.1: bottleneck ถูกกรอก/แก้ผ่าน endpoint ได้จริง (ฟอร์มฝั่ง SA จะใช้ endpoint นี้) — ไม่มี auto-detect
AC-006.2: ทุก write ผ่าน Zod ตาม contract และเก็บบน `TCrmKnowledgeEntry` Category `INSIGHT_BOTTLENECK` ด้วย workflow เดิม

#### Required validation and expected evidence

ตรวจ AC-006.1/AC-006.2 ด้วย dev server: 401/403 เมื่อสิทธิ์ไม่พอ (ทั้ง read/write), 400 เมื่อ AnswerBody ไม่ผ่าน Zod, CRUD สำเร็จเก็บถูก Category — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบข้อมูลเดิม

### Task BE-crm-case-dashboard-P4-05 — recurring-tasks endpoints + sopStatus derive

Objective: `GET/POST .../insights/recurring-tasks` + `[id]` — guard เดียวกัน — sopStatus derive จาก Status entry (DRAFT=drafting / APPROVED=ready / อื่น=none) ไม่เก็บ field แยก
Why: สถานะ SOP ต้องมาจาก workflow ของ entry เอง — เก็บ field ซ้ำจะทำให้สองแหล่งความจริงเบี่ยงกัน
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, AC-006.2, DES-006, DES-007, DEC-007
Produces: none
Consumes: Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardApi.v1
Risk: authorization
Human gate: none
Status: pending

#### Scope and constraints

guard CRM_AI_SA (write) / MENU_SUPPORT_CRM (read) เหมือน bottlenecks — `sopStatus` คำนวณสดตอนอ่าน ห้ามเขียนลง field ใหม่

#### Retrieval hints

Hypothesis: โครง route เลียน bottlenecks ที่ทำก่อนหน้า — ยืนยัน pattern และจุด derive กับซอร์สจริง
Query: หา `insights/recurring-tasks`, `sopStatus`, `RecurringTaskBody` ใน Target
Provenance: DES-006, DES-007, Contract:CrmCaseInsightEntry.v1

#### Do not modify

`TCrmKnowledgeEntry` schema (ห้ามเพิ่ม field) · permission เดิม · endpoint kind อื่น

#### Acceptance criteria

AC-006.1: recurring task ถูกกรอก/แก้ผ่าน endpoint ได้จริง พร้อมสถานะ SOP ที่ derive จาก Status ของ entry
AC-006.2: ทุก write ผ่าน Zod และเก็บบน `TCrmKnowledgeEntry` Category `INSIGHT_RECURRING_TASK` — ไม่มี field sopStatus ถูกเก็บลงตาราง

#### Required validation and expected evidence

ตรวจ AC-006.1/AC-006.2 ด้วย dev server: CRUD สำเร็จ + เปลี่ยน Status (DRAFT/APPROVED) แล้ว sopStatus ที่ response เปลี่ยนถูกต้อง + guard 401/403 — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้

### Task BE-crm-case-dashboard-P4-06 — feature-requests endpoints + live derive counts

Objective: `GET/POST .../insights/feature-requests` + `[id]` — guard write `CRM_AI_PM` · response **derive สด**: requestCount/schoolCount (เคส FEATURE ที่ IssueId ตรง distinct SchoolId) + dealCount (นับ `TCrmCustomerPromise` `PromiseType=FEATURE` ที่ ProductFeatureId/MenuId ตรง) + trendPct (30 วันล่าสุด vs ก่อนหน้า) — ห้ามรับค่า count จาก request body
Why: จำนวนที่ PM พิมพ์เองจะเพี้ยนจากของจริง (data drift) — ทุกตัวเลขต้อง derive จากเคสและ promise จริงทุกครั้งที่อ่าน
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.3, DES-006, DES-007, DEC-006
Produces: none
Consumes: Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardApi.v1
Risk: authorization
Human gate: none
Status: pending

#### Scope and constraints

write guard `CRM_AI_PM` (คนละ kind กับ SA) — ทุก count/trend คำนวณสดตอนอ่าน ห้ามเก็บและห้ามรับจาก body — identity link ของ FR ใช้ issueId/productFeatureId ที่ schema refine แล้ว

#### Retrieval hints

Hypothesis: query นับจาก `TCrmSupport` (AiCategory=FEATURE + IssueId) และ `TCrmCustomerPromise` (PromiseType=FEATURE) — ยืนยัน field กับ schema จริงก่อน implement
Query: หา `insights/feature-requests`, `TCrmCustomerPromise`, `PromiseType`, `requestCount` ใน Target
Provenance: DES-006, DES-007, DEC-006, Contract:CrmCaseInsightEntry.v1

#### Do not modify

`TCrmCustomerPromise`/`TCrmSupport` (อ่านอย่างเดียว) · permission เดิม · Sales pipeline ของระบบอื่น

#### Acceptance criteria

AC-006.3: จำนวน request/โรงเรียน/ดีลของ Feature Request derive จากเคสจริง + `TCrmCustomerPromise` เสมอ — ไม่มีเส้นทางใดให้รับค่านับจากภายนอก

#### Required validation and expected evidence

ตรวจ AC-006.3 ด้วย dev server: ส่ง body แปลก (มี count) ต้องไม่มีผล — response ตรงกับการนับ SQL จริง + guard CRM_AI_PM 401/403 — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบข้อมูล promise จริง

### Task BE-crm-case-dashboard-P4-07 — insight API spec docs

Objective: `_docs/create-spec.md` + `_docs/update-spec.md` ของ 3 resource (bottlenecks / recurring-tasks / feature-requests)
Why: engineer/QA คนถัดไปต้องมี spec request/response ที่ตรงกับ endpoint จริงทั้ง 3 resource รวมกติกา derive ที่ห้ามรับจาก body
Owner: backend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, DES-006, DES-007
Produces: none
Consumes: Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardApi.v1
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

เขียน spec ตาม endpoint จริงที่ implement แล้วเท่านั้น — ครบทั้ง guard, body schema, response รวม derive fields

#### Retrieval hints

Hypothesis: รูปแบบ spec มีตัวอย่างจาก settings/dashboard ที่ทำก่อนหน้า (`_docs/get-spec.md`) — ยืนยันรูปแบบกับไฟล์จริง
Query: หา `_docs/create-spec.md`, `_docs/update-spec.md`, `get-spec.md` ที่เกี่ยวกับ crm-case ใน Target
Provenance: DES-006, DES-007, Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardApi.v1

#### Do not modify

endpoint/code ใด ๆ (task นี้แตะเอกสารเท่านั้น) · spec ของ resource อื่น

#### Acceptance criteria

AC-006.1: spec ของ 3 resource ครบตามพฤติกรรม endpoint จริง (create/update) — ผู้อ่าน implement ต่อได้โดยไม่ต้องเดา

#### Required validation and expected evidence

ตรวจ AC-006.1 ด้วยการเทียบ spec กับ route/schema จริงทีละ field — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

เอกสารอย่างเดียว — revert ได้ปลอดภัย

### Task FE-crm-case-dashboard-P4-01 — insights page + forms + permission-gated buttons

Objective: `insights/page.tsx` — เลือกเดือน (ReportMonth default เดือนปัจจุบัน) + 3 section (process-bottleneck-card / recurring-tasks-table / feature-request-table) ผูก API จริง + ฟอร์ม modal กรอก/แก้ (Form Workflow: Modal confirm → API → StatusModalComponent success/error) · ปุ่มเขียนแสดงเฉพาะผู้มีสิทธิ์ (`useHasPermission` CRM_AI_SA / CRM_AI_PM)
Why: insights ทั้ง 3 ประเภทกรอกเองโดย SA/PM — หน้าต้องผูก API จริงและซ่อนปุ่มเขียนจากผู้ไม่มีสิทธิ์ตาม kind
Owner: frontend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, AC-006.2, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardApi.v1, Contract:CrmCaseDashboardWiring.v1
Risk: medium
Human gate: none
Status: pending

#### Scope and constraints

Form Workflow ใช้ Modal confirm → API → StatusModalComponent เสมอ — ปุ่มเขียนแสดงตาม kind: CRM_AI_SA (bottleneck/recurring), CRM_AI_PM (feature request) — ตัวเลข derive (requestCount/schoolCount/dealCount) แสดงจาก response ฝั่ง server อย่างเดียว ไม่กรอกเอง

#### Retrieval hints

Hypothesis: mockup insights page + components มีอยู่แล้วเหลือผูก API/ฟอร์ม — ยืนยัน path/ชื่อ component จริงก่อนแก้
Query: หา `insights/page.tsx`, `process-bottleneck-card`, `recurring-tasks-table`, `feature-request-table`, `useHasPermission` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseInsightEntry.v1, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

endpoint/BE repository · หน้าอื่น · mock ที่หน้าอื่นยังใช้

#### Acceptance criteria

AC-006.1: กรอก insights ทั้ง 3 ประเภทผ่านฟอร์มบนหน้าได้จริง (ผ่าน endpoint จริง) — ผู้ไม่มีสิทธิ์เห็นอ่านอย่างเดียว
AC-006.2: ข้อมูลที่กรอกไปปรากฏบน `TCrmKnowledgeEntry` ด้วย Category `INSIGHT_*` ที่ถูก kind — ฟอร์มไม่มี란ให้กรอกตัวเลข derive

#### Required validation and expected evidence

ตรวจ AC-006.1/AC-006.2 ด้วย dev server: กรอก/แก้ผ่าน modal จริงทุก kind (สำเร็จ + error path) + ตรวจสิทธิ์ซ่อน/แสดงปุ่ม + tsc/eslint — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

revert wiring ของหน้า insights ได้เป็นชุด — mock ยังอยู่จน task ลบ mock ทำ

### Task FE-crm-case-dashboard-P4-02 — delete insights mock data

Objective: ลบ `insights-mock.data.ts` เมื่อ wire เสร็จ
Why: สัญญา wiring ให้ลบ mock/_data เมื่อ wire เสร็จ — เหลือไว้จะเป็นแหล่งข้อมูลปลอมที่หลงเหลืออยู่
Owner: frontend-engineer
Depends on: none
Traceability: REQ-006, AC-006.1, DES-008, DEC-008
Produces: none
Consumes: Contract:CrmCaseDashboardWiring.v1
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

ลบได้เฉพาะเมื่อ FE-crm-case-dashboard-P4-01 wire เสร็จและตรวจแล้วว่าไม่มี import ค้าง

#### Retrieval hints

Hypothesis: หลัง wire หน้า insights จะไม่มีจุดอ้างถึง mock เหลือ — grep ยืนยันก่อนลบทุกครั้ง
Query: หา import ของ `insights-mock.data.ts` ใน Target
Provenance: DES-008, DEC-008, Contract:CrmCaseDashboardWiring.v1

#### Do not modify

mock ของหน้าอื่นที่ยังใช้ (`crm-mock.data.ts` จนกว่า Phase 3 จะเสร็จ) · หน้า insights ที่ wire แล้ว

#### Acceptance criteria

AC-006.1: หน้า insights ยังทำงานถูกต้องจาก API จริงหลังลบ mock — ไม่มี import ค้าง

#### Required validation and expected evidence

ตรวจ AC-006.1 ด้วย tsc/build ผ่านหลังลบ + grep ไม่เหลือ reference — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

ไฟล์อยู่ใน git history — restore ได้ทันทีหากพบ consumer ที่พลาด

## Phase 5: CSAT Loop Enhancements (reuse ลูปเดิม)

### Task BE-crm-case-dashboard-P5-01 — CSAT repeat suppress helper

Objective: suppress helper: query `TCrmFeedback` ของ SchoolId ที่เคสปิดภายใน `repeatSuppressDays` (7) วัน — integrate ใน `crm-line-notify.service.ts` ก่อนเลือก Flex แบบมีปุ่ม feedback — **best-effort try/catch: ล้ม = ส่งแบบมีปุ่มตามปกติ ห้ามบล็อกการแจ้งปิดเคส** (design § CSAT Rules ข้อ 3)
Why: กันถามซ้ำโรงเรียนที่เพิ่งให้คะแนน แต่การแจ้งปิดเคสต้องไม่เคยล้มเพราะ suppress check
Owner: backend-engineer
Depends on: none
Traceability: REQ-005, AC-005.2, DES-005, DEC-005
Produces: none
Consumes: Contract:CrmCaseCsatSetting.v1
Risk: security
Human gate: none
Status: pending

#### Scope and constraints

แตะ `crm-line-notify.service.ts` จุดเดียว (ก่อนเลือก Flex มีปุ่ม) — suppress check ทุกกรณี best-effort: throw = ข้ามการ suppress และส่ง LINE ปกติ + log ต่อท้าย pushAndLog เดิม

#### Retrieval hints

Hypothesis: มี helper suppress ใน crm-line-notify.service.ts อยู่แล้ว (shouldSuppressCsatAsk) — ยืนยัน symbol/บรรทัดกับซอร์สจริงก่อนแก้
Query: หา `crm-line-notify.service.ts`, `shouldSuppressCsatAsk`, `repeatSuppressDays` ใน Target
Provenance: DES-005, DEC-005, Contract:CrmCaseCsatSetting.v1

#### Do not modify

ส่วนอื่นของลูปแจ้งเตือน (การปิดเคสต้องส่งเสมอ) · `TCrmFeedback` schema · endpoint รับคะแนน

#### Acceptance criteria

AC-005.2: ลูปส่ง/เก็บเดิมยังทำงานเหมือนเดิมทุกกรณี — มีเพียงการข้ามปุ่ม feedback เมื่อโรงเรียนมี feedback ในหน้าต่าง 7 วัน และ suppress ล้มก็ยังส่งแจ้งปิดเคสปกติ

#### Required validation and expected evidence

ตรวจ AC-005.2 ด้วยกรณีทดสอบ: โรงเรียนมี/ไม่มี feedback ล่าสุดใน 7 วัน + จำลอง suppress check throw ต้องยังส่งแจ้งเตือน — เก็บ log/ผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

การเปลี่ยนแปลงอยู่ในจุดเดียวของ notify service — revert ได้ และพฤติกรรม default (ส่งแบบมีปุ่ม) เหมือนเดิมเมื่อ revert

### Task BE-crm-case-dashboard-P5-02 — CSAT escalation hook

Objective: escalation hook ใน `POST /api/v1/support/crm/feedback` **หลัง insert สำเร็จ (best-effort แยก try/catch ห้าม rollback การรับคะแนน)**: ตรง rule `flag=immediate` ของ `CRM_CASE_CSAT_RULES` → push LINE หากลุ่ม Support ผ่าน env `CRM_CSAT_ESCALATION_LINE_GROUP_ID` (ไม่ตั้ง = ข้ามเงียบ ๆ) · rule repeatCount=2 นับ feedback ต่ำของ SchoolId ใน windowDays 30
Why: คะแนนต่ำ/ต่ำซ้ำต้องเดินเข้าทีม Support ทันที แต่ endpoint รับคะแนนเป็น no-auth เดิม — hook ต้องไม่มีทางทำให้การบันทึกคะแนนล้ม
Owner: backend-engineer
Depends on: none
Traceability: REQ-005, AC-005.2, DES-005, DEC-005
Produces: none
Consumes: Contract:CrmCaseCsatSetting.v1
Risk: security
Human gate: none
Status: pending

#### Scope and constraints

แตะ `POST /api/v1/support/crm/feedback` หลัง insert สำเร็จเท่านั้น — best-effort แยก try/catch: push ล้ม = log อย่างเดียว — ไม่ตั้ง env = ข้ามเงียบ ๆ — นับ feedback ต่ำของ SchoolId ใน 30 วันสำหรับ rule ต่ำซ้ำ

#### Retrieval hints

Hypothesis: จุด insert คะแนนใน v1 feedback route เป็นจุดเดียวที่ต้องต่อ — ยืนยันชื่อ route/handler กับซอร์สจริงก่อนแก้
Query: หา `support/crm/feedback`, `CRM_CASE_CSAT_RULES`, `CRM_CSAT_ESCALATION_LINE_GROUP_ID` ใน Target
Provenance: DES-005, DEC-005, Contract:CrmCaseCsatSetting.v1

#### Do not modify

พฤติกรรมการ insert คะแนน/response เดิมของ endpoint · สิทธิ์/token ของ endpoint (known risk รับมาจากของเดิม — fix ต้องอยู่ที่ v1 crm ไม่ใช่ scope นี้) · constant rules

#### Acceptance criteria

AC-005.2: คะแนนถูกบันทึกเหมือนเดิมทุกกรณี (hook ล้มก็ตาม) และคะแนนที่ตรง rule immediate มี LINE แจ้งกลุ่ม Support เมื่อ env ถูกตั้ง

#### Required validation and expected evidence

ตรวจ AC-005.2 ด้วยกรณีทดสอบ: คะแนนต่ำตรง rule / ต่ำซ้ำครบ repeatCount ใน 30 วัน / env ไม่ตั้ง / จำลอง push ล้ม — คะแนนต้อง insert สำเร็จทุกกรณี — เก็บ log/ผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

hook อยู่หลัง insert แยก try/catch — revert ได้โดยพฤติกรรมการรับคะแนนไม่เปลี่ยน

### Task BE-crm-case-dashboard-P5-03 — feedback summary returns CES flag/scale

Objective: ขยาย `GET .../feedback` (summary endpoint เดิม) คืน `cesQuestionEnabled`/scale จาก constant ให้ LIFF `/liff/crm-feedback` ใช้ซ่อน/แสดงคำถามเสริม — additive field ไม่ break consumer เดิม
Why: LIFF ต้องอ่าน flag/scale จากค่าเดียวกับ settings โดยไม่แตะ constant ตรง ๆ และ consumer เดิมของ endpoint ต้องไม่พัง
Owner: backend-engineer
Depends on: none
Traceability: REQ-005, AC-005.2, DES-005, DES-007
Produces: none
Consumes: Contract:CrmCaseCsatSetting.v1
Risk: shared-contract
Human gate: none
Status: pending

#### Scope and constraints

เพิ่ม field ใน response เดิมแบบ additive เท่านั้น — ค่ามาจาก CSAT constant เสมอ — ไม่เปลี่ยน field/รูปร่างเดิมของ response

#### Retrieval hints

Hypothesis: summary endpoint เดิมมี response shape อยู่แล้ว — เพิ่ม field ท้ายโดยไม่แตะโครงเดิม — ยืนยัน handler จริงก่อนแก้
Query: หา `GET .../feedback` handler ของ v1 crm, `cesQuestionEnabled`, `/liff/crm-feedback` ใน Target
Provenance: DES-005, DES-007, Contract:CrmCaseCsatSetting.v1

#### Do not modify

field เดิมของ response · LIFF form (task FE-crm-case-dashboard-P5-01) · constant

#### Acceptance criteria

AC-005.2: LIFF ได้ flag/scale จาก endpoint เดิมเพิ่มเติมโดย consumer เดิมของ endpoint ยังทำงานเหมือนเดิมทุกจุด

#### Required validation and expected evidence

ตรวจ AC-005.2 ด้วยการเรียก endpoint เทียบ response เดิม (ไม่หาย field) + field ใหม่ตรง constant + consumer เดิมยัง parse ได้ — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

additive field — revert ได้โดย consumer เดิมไม่เคยรู้สึก

### Task FE-crm-case-dashboard-P5-01 — LIFF CES question toggle

Objective: LIFF form อ่าน flag ใหม่แสดง/ซ่อนคำถาม CES (score/reasons/comment flow เดิมไม่แตะ)
Why: คำถาม CES เสริมต้องเปิด/ปิดจากค่า settings โดยไม่ deploy ใหม่ทุกครั้งที่อยากซ่อน และ flow หลักของ LIFF ต้องคงเดิม
Owner: frontend-engineer
Depends on: none
Traceability: REQ-005, AC-005.2, DES-005
Produces: none
Consumes: Contract:CrmCaseCsatSetting.v1
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

แก้เฉพาะการอ่าน flag และการแสดง/ซ่อนคำถาม CES — score/reasons/comment flow เดิมห้ามเปลี่ยน — ค่าที่ใช้มาจาก summary endpoint (BE-crm-case-dashboard-P5-03)

#### Retrieval hints

Hypothesis: LIFF form มี component คำถามแยกอยู่แล้ว — ควบคุมด้วย flag จาก API — ยืนยัน path/ชื่อ component จริงก่อนแก้
Query: หา `/liff/crm-feedback`, `cesQuestionEnabled` ใน Target
Provenance: DES-005, Contract:CrmCaseCsatSetting.v1

#### Do not modify

endpoint ฝั่ง BE (แตะที่ BE-crm-case-dashboard-P5-03) · flow ให้คะแนนหลัก · constant

#### Acceptance criteria

AC-005.2: LIFF form แสดง/ซ่อนคำถาม CES ตาม flag จริง — flow ให้คะแนนหลัก (ดาว/reasons/comment) ทำงานเหมือนเดิมทุกกรณี

#### Required validation and expected evidence

ตรวจ AC-005.2 ด้วย dev/LIFF: เปิด flag → คำถาม CES แสดง, ปิด flag → ซ่อน — ส่งคะแนนปกติได้ทั้งสองกรณี — เก็บผลเป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

แก้เฉพาะส่วนแสดง/ซ่อน — revert ได้ ค่า default (แสดง) ตาม constant

### Task BE-crm-case-dashboard-P5-04 — unit tests for metric/CSAT helpers

Objective: unit test (`bun:test` วางคู่ helper): MTTR delta filter + CSAT dedupe + suppress window + escalation rule match — วางใน `src/app/api/v2/support/crm-case/_helpers/*.test.ts`
Why: สูตรเมตริกและกติกา CSAT เป็นจุดที่พังเงียบ (dedupe ลืม = CSAT เพี้ยน) — ต้องมี test คู่ helper เพื่อ regression
Owner: backend-engineer
Depends on: none
Traceability: REQ-001, AC-001.2, REQ-005, AC-005.2, DES-003, DES-005
Produces: none
Consumes: Contract:CrmCaseDashboardMetrics.v1, Contract:CrmCaseCsatSetting.v1
Risk: low
Human gate: none
Status: pending

#### Scope and constraints

test วางคู่ helper ใน `_helpers/*.test.ts` เท่านั้น — ครบ 4 กลุ่มกรณี: MTTR delta ติดลบถูกตัด, dedupe ต่อเคส, หน้าต่าง suppress 7 วัน, rule match (immediate/ต่ำซ้ำ 30 วัน)

#### Retrieval hints

Hypothesis: helper ที่ test อยู่ใน dashboard helper + notify service — ยืนยัน symbol ที่ export จริงก่อนเขียน test
Query: หา `dashboard-metrics.helper.ts`, `*.test.ts`, `bun:test` ที่เกี่ยวกับ crm-case ใน Target
Provenance: DES-003, DES-005, Contract:CrmCaseDashboardMetrics.v1, Contract:CrmCaseCsatSetting.v1

#### Do not modify

ตัว helper ที่ test (แก้ที่ task เจ้าของเท่านั้น) · test อื่นที่มีอยู่

#### Acceptance criteria

AC-001.2: test MTTR ยืนยัน delta ติดลบถูกตัดและนับเฉพาะเคสปิด timestamp ครบ
AC-005.2: test CSAT dedupe/suppress window/escalation rule match ยืนยันพฤติกรรมตาม contract (dedupe ต่อเคส · 7 วัน · immediate/repeatCount ใน 30 วัน)

#### Required validation and expected evidence

ตรวจ AC-001.2 และ AC-005.2 ด้วยการรัน `bun test` ผ่านทั้งหมด — เก็บผลรัน (จำนวน case/ผล) เป็นหลักฐานก่อนปิด task

#### Rollback/compatibility notes

test เป็นไฟล์ใหม่ additive — ลบ/revert ได้ไม่กระทบ runtime

## Sequencing Notes

- **Phase 1 ทำก่อนเสมอ** — Phase 2 (SLA level chip) และ Phase 5 (CSAT rules) อ่าน constant จาก Phase 1 โดยตรง
- Phase 2/3/4/5 อิสระต่อกันหลัง Phase 1 — ทำขนานได้ตามกำลังคน · ภายใน Phase 3: groups → caseId → schools ตามลำดับ UI drill-down
- **Phase 4 prerequisite เป็นลำดับบังคับ**: task filter `INSIGHT_%` ต้อง merge ก่อน insights แรกถูก `APPROVED` (entry ยัง DRAFT อยู่ได้ระหว่างรอ — DRAFT ไม่ถูก retrieval ดึงอยู่แล้ว)
- **ไม่มี Security gate ใหม่ใน module นี้** (read-heavy, ไม่รับ input ภายนอกใหม่) — ยกเว้น Phase 5 ที่แตะเส้นทางรับคะแนนจากลูกค้า (no-auth endpoint เดิม): ให้ `security` agent ตรวจรอบเดียวตอน Phase 5 เสร็จ
- การ์ดที่พึ่ง AI data ต้อง empty-state จนกว่า crm-ai-support deploy + Backfill เสร็จ — ห้ามแสดง 0 หลอกตา (Risk ข้อ 1/3 ของ design.md)
- ทุก route ใหม่ผ่าน `auth()` + guard แยกไฟล์ · ทุก error ผ่าน `handleError(err, "[CRM_CASE_DASHBOARD_...]")` · HTTP status ครบทุก NextResponse · logging ผ่าน `logger.server` / `ApiLogMiddleware.withLogging`
- **DB read-only discipline**: module นี้ไม่มี DDL — ห้าม `db push`/`migrate` จาก session agent (มติผู้ใช้ 2026-08-23); ถ้า implement ไปเจอว่าต้องการ column ใหม่ หยุดแล้วกลับมาที่ `system-analyst` ก่อนเสมอ

## Unresolved Open Questions

- Region/ขนาดโรงเรียน บน `school-summary-header` — ไม่มี column ต้นทางใน `TCompany` (MVP ซ่อน chip) — ถ้า BA เจอแหล่งข้อมูลจริงค่อยเปิด task
- Timeline รายจุดของเคส — ไม่มี status-history audit ในระบบเดิม แสดงเฉพาะ timestamp หลัก (ต้องการเต็ม = requirement ใหม่)
- CSAT trigger `verified`/`delay1d` + channel email/inapp — constant เก็บค่าไว้แต่ยังไม่มี hook (Later)
- รวม chat-CSAT (`TQueueCsatSurvey` — คิวแชท LINE) เข้า metric ภาพรวมไหม — Later คนละ entity ต้องนิยามแยก

## Change Log

- 2026-08-23: เขียน `plan.md` จาก `design.md` Rev 2 (Zero New Tables) — 5 phases (constants/settings display-only · dashboard aggregation · groups & schools · insights บน `TCrmKnowledgeEntry` · CSAT loop enhancements) รวม cross-module touch 2 จุดที่จำกัดวงไว้ (INSIGHT_% filter prerequisite + v1 crm hooks) — ไม่มี task DDL ใด ๆ สอดคล้องมติ "ไม่เพิ่มตาราง" และ DB read-only discipline
- 2026-08-28 — Format reconciliation: converted legacy `[x]` checkbox task lists to the standard `| Task | Status | Owner | Depends on |` table; task ids adopted verbatim from the knowledge store (`knowledge/crm-case-dashboard/task/*.yaml`, mapped 1:1 by document order — backend series → `BE-…`, frontend series → `FE-…`; per-phase counts matched exactly, no line without a task yaml); Status mirrors each task yaml's `payload.plan_status` — `verified` for delivered rows (Phases 1–2 + BE-crm-case-dashboard-P3-01..04 + BE-crm-case-dashboard-P4-02), `pending` for rows still `[ ]` in the legacy plan (FE Phase 3, most of Phases 4–5) since those tasks are not yet delivered; no dependency graph was recorded in the legacy plan so Depends on = — throughout; design traceability uses named `design.md` sections in parentheses (module has no `DES-NNN` ids); no task added, removed, re-scoped, or re-ordered.
- 2026-09-13: Structure-only conversion to canonical `PlanTask format: 1` — the `| Task | Status | Owner | Depends on |` tables under each `## Phase N` were converted 1:1 into canonical task sections (37 tasks, ids/statuses/owners/dependencies kept verbatim — all "Depends on" cells were "—" and stay `none`); Traceability now cites the DES-001..008 / Contract / DEC / REQ / AC ids added to `requirement.md`+`design.md` on 2026-09-13; Produces/Consumes/Risk derived from each row's own text (no gate triggers exist in this design — all sections are additive-internal/schema-unchanged/no-migration, `Security: sensitive` on DES-005/006/007 only, which does not trigger a gate); residual task tables removed — the canonical task sections are now the sole task authority; no task added, dropped, merged, re-scoped, or re-ordered.
