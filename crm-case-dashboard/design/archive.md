# CRM Case Monitor Dashboard — Feasibility & Design

Design evidence format: 1

> **Rev 2 (2026-08-23 เย็น)** — เขียนใหม่จาก Rev 1 หลังมติผู้ใช้ "**ไม่เพิ่มตารางใหม่**" (ตารางถูกออกแบบไว้ครบแล้วใน `hkt-5-crm-ai-script` 11 ตาราง) + ยืนยันด้วย `npx prisma db pull` จริง (194 models) ว่า DB มีอะไรพร้อมใช้ — **โมดูลนี้ไม่มี DDL ใด ๆ ทั้งสิ้น**

## Feasibility Summary

ทำได้ครบทุกฟีเจอร์ด้วย stack ปัจจุบัน ไม่เพิ่ม dependency ไม่เพิ่มตาราง — ทุกความต้องการใช้ตารางที่มีอยู่จริงใน jabjai-master-single-db (ยืนยันจาก introspection 2026-08-23: `prisma/jabjai-master-single-db/schema.prisma`) UI ไม่ต้องออกแบบใหม่ — งานคือ "ผูกข้อมูลจริงแทน mock"

**Discovery จาก db pull 2026-08-23 (ใช้ต่อได้ทันที):**

| ตารางที่มีอยู่จริง | บทบาทในโมดูลนี้ |
|---|---|
| `TCrmSupport` (+`MenuId`/`AiCategory`/`Severity`) | แหล่งเคสหลัก — อ่านอย่างเดียว |
| `TCrmCaseAiAssessment` (`ComputedPriorityScore`/`IssueId`) | อันดับความเร่งด่วน — อ่านอย่างเดียว |
| `TCrmFeedback` | คลังคะแนน CSAT รายเคส (`Score 1–5`+`Reasons`+`Comment`) |
| `TCrmKnowledgeEntry` | **ที่เก็บ Insights ×3** — Category กันไว้ `INSIGHT_*`, ได้ Version/Status workflow ฟรี |
| `TCrmCustomerPromise` | **แหล่งคอลัมน์ "ดีล"** ของ Feature Request (`PromiseType=FEATURE` ผูก `ProductFeatureId`/`MenuId`) |
| `TMenu` → `TGroupMenu` | subsystem tiles (ผูกผ่าน `TCrmSupport.MenuId → TMenu.groupmenuid`) |
| `TCompany` | ชื่อโรงเรียน (`sCompany`) |

**Discovery ที่ต้องระวังสับสน:** DB มี **`TQueueCsatSurvey`** (+`TQueueChat.CSatScore`/`CSatFeedback`) — เป็น CSAT ของ**คิวแชท LINE** (ผูก `QueueChatId → TQueueChat`) **ไม่ใช่ CSAT รายเคส CRM** — ห้ามใช้แทน `TCrmFeedback` · ต่อยอด metric "ความพึงพอใจภาพรวม (แชท)" ได้ใน Later · (นอกจากนี้ DB มี temp/junk tables `crm_temp499..2000`, `indexupdated` — ไม่เกี่ยวกับโมดูลนี้)

**Cross-module dependency (read-only เด็ดขาด):** อ่าน `MenuId`/`AiCategory`/`Severity`/`ComputedPriorityScore`/`IssueId` จากของที่ `crm-ai-support` เป็นเจ้าของ — ห้ามเขียน/คำนวณทับ (priority score ใช้ v2 ของ `crm-ai-support/design.md` § SLA & Priority Score Rules)

## DES-001 — การตัดสินใจที่ผู้ใช้ยืนยันแล้ว (2026-08-23)

| # | ประเด็น | มติ |
|---|---|---|
| 1 | Subsystem/module บน dashboard ผูกกับอะไร | ผูก `TMenu` → รวมระดับ `TGroupMenu` (`active=true`) — `ModuleKey` hardcode ใน mockup เลิกใช้ |
| 2 | สูตร MTTR | avg(`UpdateDate` − `IssueDate`) เฉพาะเคส Status ปิด (alias CLOSED+RESOLVED) — raw elapsed |
| 3 | สิทธิ์ settings | ~~ค่าใหม่~~ → **Rev 2: ไม่มี write แล้ว** — หน้า settings เป็น display-only ใช้ `MENU_SUPPORT_CRM` อ่านเหมือนทั้งโมดูล |
| 4 | CSAT MVP ส่งจริงไหม | ส่ง LINE จริง + เก็บจริง — reuse ลูปเดิม (`crm-line-notify` → `/liff/crm-feedback` → `POST /api/v1/support/crm/feedback` → `TCrmFeedback`) |
| 5 | **เพิ่มตารางใหม่ไหม** | **ไม่เพิ่มเด็ดขาด** — ใช้ของที่ออกแบบไว้แล้วทั้งหมด (ยกเลิก 7 ตารางที่เคยเสนอใน Rev 1) |
| 6 | SLA/CSAT settings เก็บไหน | **Code constant + deploy** — หน้า settings เป็น display-only (ผู้ใช้ยอมรับ trade-off ที่ admin แก้เองผ่าน UI ไม่ได้แล้ว — ย้อนข้อความเดิมใน requirement § Core Features 4–5) |
| 7 | Insights ×3 เก็บไหน | **`TCrmKnowledgeEntry`** Category `INSIGHT_BOTTLENECK` / `INSIGHT_RECURRING_TASK` / `INSIGHT_FEATURE_REQUEST` + เนื้อหา structured JSON ใน `AnswerBody` |
| 8 | จำนวนใน Feature Request | **derive จากเคสจริง** (`AiCategory=FEATURE` + `IssueId` → distinct SchoolId) — ไม่ให้ PM พิมพ์เลขซ้ำกับของจริง (กัน data drift) |
| 9 | DB access ของ agent | read-only เท่านั้น (introspect/read query) — DDL/write เป็นหน้าที่ DBA/user |

Contract:CrmCaseDashboardScope.v1 — ขอบเขตสัญญาของโมดูล: อ่านอย่างเดียวจากสคีมา jabjai-master-single-db เดิม + SLA/CSAT settings เป็น code constant + insights เก็บบน TCrmKnowledgeEntry
DEC-001 — ยึดชุดมติ 9 ข้อข้างบนเป็นข้อผูกพันของ design: ไม่เพิ่มตาราง/DDL เด็ดขาด (มติ #5), settings display-only (มติ #3/#6), จำนวน FR/ดีล derive จากเคสจริง (มติ #8), DB access อ่านอย่างเดียว (มติ #9)
Evidence EVD-001: claim=DES-001 | state=confirmed | path=prisma/jabjai-master-single-db/schema.prisma | symbol=model TCrmSupport | line=1163 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=ba2c80b9b245d697140188fb753648ff4a6f38c93caf66d70e30eb0cb06f8ee1
Evidence EVD-002: claim=Contract:CrmCaseDashboardScope.v1 | state=confirmed | path=src/constants/crm-case-sla-setting.constant.ts | symbol=CRM_CASE_SLA_SETTING_VERSION | line=5 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=09d19611cd75f4a38e1a07403ba213973dca279f88b511a597c9e9f42c19d624
Evidence EVD-003: claim=DEC-001 | state=confirmed | path=src/constants/crm-case-insight.constant.ts | symbol=CRM_INSIGHT_CATEGORIES | line=12 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=ba60166fa2f85abccd09d0b0dc6661d87fae0f824f7d3fac8348fae126c01fc4
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: ถ้า model ที่อ้าง (TCrmSupport/TCrmFeedback/TCrmKnowledgeEntry/TCrmCustomerPromise/TMenu/TGroupMenu/TCompany) หายไปจาก prisma/jabjai-master-single-db/schema.prisma — หยุด implement ส่วนนั้น, บันทึก drift ใน review.md และเปิด amend design ก่อน (ห้ามสร้างตาราง/คอลัมน์เอง)
Material ambiguity: none

## Feature-by-Feature Feasibility

| Feature (requirement § Core Features) | สถานะ | แหล่งข้อมูลจริง |
|---|---|---|
| 1. ภาพรวมเคส (dashboard) | ตรงไปตรงมา | Aggregate server-side ทั้งหมด — `GET /api/v2/support/crm-case/dashboard` คืน payload ครบทุกการ์ด |
| 2. จัดกลุ่มเคสตามประเภท + จัดอันดับ | ตรงไปตรงมา | group ด้วย `AiCategory`, อันดับด้วย `ComputedPriorityScore` (v2) — ห้ามคิดสูตรใหม่ |
| 3. สรุปตามโรงเรียน | ตรงไปตรงมา | Filter `SchoolId` + join `TCompany.sCompany` — route param เปลี่ยน `[schoolName]` → `[schoolId]` |
| 4. ตั้งค่า SLA | ตรงไปตรงมา (display-only) | Constant `CRM_CASE_SLA_SETTING` — seed default จาก mockup ที่ยืนยันแล้ว |
| 5. ตั้งค่า CSAT | ตรงไปตรงมา (display-only) | Constant `CRM_CASE_CSAT_SETTING` + ลูปส่ง/เก็บ reuse ของเดิม |
| 6. Insights (กรอกเอง) | ตรงไปตรงมา | `TCrmKnowledgeEntry` Category `INSIGHT_*` + ฟอร์ม CRUD ของ SA/PM |

## Data Model

ไม่มีตารางใหม่ — สัญญาอยู่ที่ app layer (โมดูลนี้ไม่มี DDL ใด ๆ — อ่านอย่างเดียวจากตารางเดิมของ jabjai-master-single-db)

### A. Settings constants (`src/constants/`)

```ts
// crm-case-sla-setting.constant.ts — default จาก sla-mock.data.ts (ค่าจริงที่ยืนยันแล้ว 2026-08-16)
export const CRM_CASE_SLA_SETTING_VERSION = "v1";
export const CRM_CASE_SLA_CLOCK = { workDays: "MON-FRI", start: "08:30", end: "17:30", criticalCount24h: true, timezone: "Asia/Bangkok" };
export const CRM_CASE_SLA_EXCLUSIONS = ["wait", "offhours", "holiday"]; // thirdparty=false ตาม mockup
export const CRM_CASE_SLA_TARGETS = [
  { severity: "CRITICAL", label: "Critical (P1)", firstResponseMinutes: 15,   closeMinutes: 1440 },
  { severity: "HIGH",     label: "High (P2)",     firstResponseMinutes: 60,   closeMinutes: 4320 },
  { severity: "MEDIUM",   label: "Medium (P3)",   firstResponseMinutes: 240,  closeMinutes: 10080 },
  { severity: "LOW",      label: "Low (P4)",      firstResponseMinutes: 1440, closeMinutes: 20160 },
] as const;

// crm-case-csat-setting.constant.ts — default จาก csat-mock.data.ts
export const CRM_CASE_CSAT_SETTING_VERSION = "v1";
export const CRM_CASE_CSAT_CONFIG = {
  scaleMin: 1, scaleMax: 5, satisfiedThreshold: 4,
  repeatSuppressDays: 7,
  trigger: "closed",                    // MVP active เฉพาะ closed (verified/delay1d เก็บไว้ ยังไม่มี hook)
  channels: { line: true, email: true, inapp: false }, // ส่งจริงเฉพาะ line
  cesQuestionEnabled: true,
} as const;
export const CRM_CASE_CSAT_RULES = [
  { minStars: 1, maxStars: 2, action: "เปิดงานติดตามทันที และแจ้งหัวหน้า Support ในวันเดียวกัน", owner: "หัวหน้า Support", flag: "immediate" },
  { minStars: 3, maxStars: 3, action: "รวมเข้ารายงานรายสัปดาห์เพื่อทบทวนสาเหตุ", owner: "ทีม Support", flag: "weekly" },
  { minStars: 1, maxStars: 2, repeatCount: 2, windowDays: 30, action: "ยกระดับเป็นเคส Rank A และแจ้ง Sale เจ้าของโรงเรียน", owner: "Support + Sale", flag: "immediate" },
] as const;
```

- การแก้ settings = แก้ constant + bump `*_VERSION` + deploy (code review gate ตามปรัชญาของ `crm-sla-rule.constant.ts`)
- **ห้าม reuse ค่า `CRM_SLA_RULES` v2 ของ crm-ai-support** (สูตร priority) — คนละ concept: ของ crm-ai-support = น้ำหนักคำนวณคะแนน, ของโมดูลนี้ = เป้าเวลาตอบ/ปิด + นาฬิกาทำการ

### B. Insights = `TCrmKnowledgeEntry` (Category namespace กันไว้)

| Field ของ `TCrmKnowledgeEntry` | การใช้งาน |
|---|---|
| `Category` | `INSIGHT_BOTTLENECK` \| `INSIGHT_RECURRING_TASK` \| `INSIGHT_FEATURE_REQUEST` (VarChar(50) พอ, prefix `INSIGHT_` = reserved) |
| `Title` | หัวข้อรายการ ("ตั้งค่าปีการศึกษาใหม่ไม่ครบ") |
| `AnswerBody` | **JSON string ตาม contract ด้านล่าง** (Zod validate ฝั่ง app เสมอ) |
| `Status` | editorial gate — `DRAFT`/`APPROVED`/`ARCHIVED` ใช้เป็นสถานะการตรวจของ SA/PM |
| `Version` + `SupersededById` | ประวัติแก้ไขฟรีตามที่ตารางออกแบบไว้ |
| `MenuId` | scoping optional (ผูกระบบที่เกี่ยวข้องได้) |
| `CreateBy`/`UpdateBy` | Logical ref → TAdmin.id2 |

**Contract ของ `AnswerBody` ต่อ Category (Zod schema ฝั่ง app):**

```jsonc
// INSIGHT_BOTTLENECK
{ "cause": "...", "fix": "...", "ownerText": "CS / Onboarding", "caseCount": 214, "reportMonth": "2026-08" }

// INSIGHT_RECURNING_TASK  (sopStatus derive จาก Status ของ entry เอง: ไม่มี=none · DRAFT=drafting · APPROVED=ready)
{ "moduleLabel": "บัญชี/การเงิน · ตั้งค่า", "taskCount": 26, "seasonPeriodText": "มี.ค.–เม.ย. (ปิดปีการศึกษา)" }

// INSIGHT_FEATURE_REQUEST  (requestCount/schoolCount ห้ามเก็บ — derive จริง, dealCount derive จาก TCrmCustomerPromise)
{ "issueId": 123, "productFeatureId": 45 }   // identity link อย่างน้อย 1 ค่า — ใช้ join หาเคส FEATURE ที่ IssueId นี้
```

- **Feature Request**: จำนวน request = นับเคส `AiCategory=FEATURE` ที่ `IssueId` ตรง · จำนวนโรงเรียน = distinct non-null `SchoolId` ของเคสชุดนั้น · จำนวนดีล = นับ `TCrmCustomerPromise` ที่ `PromiseType=FEATURE` และ `ProductFeatureId`/`MenuId` ตรงกับที่ link · trend % = เทียบเคส 30 วันล่าสุด vs 30 วันก่อนหน้า (คำนวณสด ไม่เก็บ)
- **Recurring Task SOP**: "มี SOP แล้ว" = entry `APPROVED` (หรือมี `SupersededById` chain ถึง approved) — ไม่ต้องมี field แยก

## DES-002 — Subsystem & Grouping Rules

1. **Subsystem tile** = `TGroupMenu` ที่ `active=true` (ไม่ใช่ `actvice`) — path `TCrmSupport.MenuId → TMenu.groupmenuid → TGroupMenu`, filter `DeleteDate IS NULL` ทุกชั้น
2. **เคส `MenuId IS NULL`** → bucket **"ไม่ระบุระบบ"** แสดงท้ายเสมอ — ห้าม drop เงียบ ๆ
3. **Tab ของ `groups/[type]`** = `AiCategory` 4 ค่า — mapping จาก mockup: `bug→BUG`, `feature→FEATURE`, `task→TASK`, `question→QA`
4. **นิยาม "กลุ่ม"** = เคส `AiCategory` เดียวกัน + `MenuId` เดียวกัน (groupId = `MenuId` หรือ `"none"`)
5. **อันดับกลุ่ม** = max → avg ของ `ComputedPriorityScore` ในกลุ่ม (score NULL ห้ามนับ, กลุ่มไม่มี score ไปท้าย + badge "รอคะแนน")
6. **Case detail**: thread = `TCrmSupportComment`, timeline จาก timestamp ที่มีจริง (`IssueDate`/`StartDate`/`DueDate`/`UpdateDate`), CSAT เคสจาก `TCrmFeedback` — ข้อจำกัด: ไม่มี status-history audit ในระบบเดิม แสดงได้แค่สถานะปัจจุบัน

Contract:CrmCaseSubsystemGrouping.v1 — สัญญาการจัดกลุ่ม: subsystem = TGroupMenu (active=true) ผ่าน TCrmSupport.MenuId → TMenu.groupmenuid, groupId = MenuId หรือ "none", อันดับกลุ่ม = max→avg ComputedPriorityScore (score NULL ท้ายสุด)
DEC-002 — ผูก subsystem จากสคีมาเดิมเท่านั้น (ไม่เพิ่มตาราง/คอลัมน์) และคง bucket "ไม่ระบุ" สำหรับเคส MenuId IS NULL ไว้ท้ายเสมอ — ไม่ drop เงียบ ๆ
Evidence EVD-004: claim=DES-002 | state=confirmed | path=src/app/api/v2/support/crm-case/groups/groups.repository.ts | symbol=findGroupSummaries | line=18 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=8f038b58b503087c156f63d113b7b49fccdc1da348c184e15137c0d16b574563
Evidence EVD-005: claim=Contract:CrmCaseSubsystemGrouping.v1 | state=confirmed | path=src/app/api/v2/support/crm-case/groups/groups.repository.ts | symbol=findMenuLabels | line=34 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=8f038b58b503087c156f63d113b7b49fccdc1da348c184e15137c0d16b574563
Evidence EVD-006: claim=DEC-002 | state=confirmed | path=src/app/api/v2/support/crm-case/groups/groups.service.ts | symbol=getGroupsPayload | line=22 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=c75ad156c42415dedfd69786ecbe0ceb7a6cebbdaec346ee765b551bcd7e27b8
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: query กลุ่มล้มเหลวหรือสคีมาไม่ตรง — groups API คืนรายการว่าง + flag pendingScore ทุกกลุ่ม และ log ผ่าน handleError(err, "[CRM_CASE_DASHBOARD_...]") ห้าม crash หน้า groups
Material ambiguity: none

## DES-003 — Metrics & Ranking Rules (ห้ามตีความเอง)

Filter ร่วมทุก metric: `DeleteDate IS NULL` + ช่วงวันที่จาก query param

| Metric | สูตร |
|---|---|
| เคสเปิดค้าง | นับ `Status IN STATUS_ALIASES.OPEN + IN_PROGRESS` |
| MTTR | `avg(UpdateDate − IssueDate)` เฉพาะเคสปิด (CLOSED+RESOLVED aliases) ที่ timestamp ครบ · delta < 0 ตัดออก+log · raw elapsed ไม่ปรับ business-hours (MVP) |
| CSAT Score | `% satisfied (Score ≥ SatisfiedThreshold)` + avg stars จาก `TCrmFeedback` join เคสที่ปิดในช่วง (dedupe ต่อเคส เลือก `CrmFeedbackId` มากสุด — ตารางไม่มี unique constraint) · 0 คำตอบ = empty state ห้ามแสดง 0% |
| กราฟรายวัน | นับสร้าง (`IssueDate`) vs ปิด (`UpdateDate` ของเคสปิด) — pattern `crm.repository.ts:380-391` |
| Top schools | group by `SchoolId` + join `TCompany.sCompany`, NULL → "ไม่ระบุ" |
| Top subsystems | § Subsystem ข้อ 1–2 |
| Top urgent | เคสเปิด sort `ComputedPriorityScore DESC NULLS LAST` take N |
| Type breakdown | นับตาม `AiCategory` + bucket "ยังไม่จำแนก" — ผลรวมต้องเท่าเคสในช่วง |
| SLA level กลุ่ม | อายุเคสเปิดเก่าสุด เทียบ `closeMinutes` ของ `CRM_CASE_SLA_TARGETS` ที่ severity สูงสุดในกลุ่ม: >100%=danger, >70%=warn, else ok · ไม่มี severity → ok |

KPI ทุกใบ aggregate server-side — ห้ามคำนวณจาก `dataSource` ของตารางที่ถูก filter/pagination

Contract:CrmCaseDashboardMetrics.v1 — สัญญาเมตริก: สูตรตามตารางข้างบนเท่านั้น (MTTR = raw elapsed ของเคสปิด · CSAT = % satisfied + avg stars หลัง dedupe ต่อเคส · SLA level กลุ่ม = >100% danger / >70% warn) — ห้ามตีความ/คิดสูตรใหม่
DEC-003 — ทุก KPI aggregate server-side ที่ dashboard route เดียว (GET /api/v2/support/crm-case/dashboard) — ห้ามคำนวณ/สรุปจาก dataSource ที่ถูก filter/pagination ฝั่ง frontend
Evidence EVD-007: claim=DES-003 | state=confirmed | path=src/app/api/v2/support/crm-case/dashboard/dashboard-metrics.helper.ts | symbol=computeMttrFromClosedCases | line=11 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=2468168bc3d2bb89e361626556da92a8f12f45a867858938d0d9c027dc739efa
Evidence EVD-008: claim=Contract:CrmCaseDashboardMetrics.v1 | state=confirmed | path=src/app/api/v2/support/crm-case/dashboard/dashboard-metrics.helper.ts | symbol=dedupeFeedbackScores | line=30 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=2468168bc3d2bb89e361626556da92a8f12f45a867858938d0d9c027dc739efa
Evidence EVD-009: claim=DEC-003 | state=confirmed | path=src/app/api/v2/support/crm-case/dashboard/route.ts | symbol=GET | line=9 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=30b231bb7695879d0c43a3802cb3a064832ce4592d0ad9fe359fd74834a62db9
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: metric ใดคำนวณไม่ได้ (timestamp ขาด / score NULL / 0 คำตอบ) คืน null ให้หน้าแสดง empty state ห้ามแสดง 0 หลอกตา; ถ้า aggregate ทั้ง payload ล้มเหลว → handleError(err, "[CRM_CASE_DASHBOARD_...]") คืน error มาตรฐาน
Material ambiguity: none

## DES-004 — SLA Settings Rules (display-only)

1. `GET /settings/sla` อ่านจาก `CRM_CASE_SLA_SETTING*` คืนค่าให้หน้าแสดง — **ไม่มี PATCH**
2. หน้าแสดง hint ชัด: "แก้ไขค่านี้ผ่าน code review (`crm-case-sla-setting.constant.ts`) แล้ว deploy"
3. `StartEvent/StopEvent` option อื่นที่ไม่ใช่ `IssueDate→UpdateDate` ยังไม่มี timestamp ต้นทางรองรับ — MTTR ล็อกสูตรเดิมเสมอ ไม่ว่า constant จะระบุอะไร

Contract:CrmCaseSlaSetting.v1 — สัญญา settings SLA: ค่าเดียวจาก CRM_CASE_SLA_SETTING* (clock/exclusions/targets/timing options) คืนผ่าน GET เดียว — ไม่มี write path
DEC-004 — settings เป็น versioned code constant + deploy (display-only) และ MTTR ล็อกสูตร IssueDate→UpdateDate เสมอ ไม่ว่า StartEvent/StopEvent ใน constant จะระบุ option อื่น
Evidence EVD-010: claim=DES-004 | state=confirmed | path=src/app/api/v2/support/crm-case/settings/sla/route.ts | symbol=GET | line=8 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=ea47073c08374993d553ff33cd5d83be4a7d45df7d047bca4f72be1eae6dfbeb
Evidence EVD-011: claim=Contract:CrmCaseSlaSetting.v1 | state=confirmed | path=src/constants/crm-case-sla-setting.constant.ts | symbol=CRM_CASE_SLA_TARGETS | line=60 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=09d19611cd75f4a38e1a07403ba213973dca279f88b511a597c9e9f42c19d624
Evidence EVD-012: claim=DEC-004 | state=confirmed | path=src/constants/crm-case-sla-setting.constant.ts | symbol=CRM_CASE_MTTR_FORMULA_NOTE | line=107 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=09d19611cd75f4a38e1a07403ba213973dca279f88b511a597c9e9f42c19d624
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: อ่าน/ตรวจ constant ไม่ผ่าน — GET /settings/sla คืน 500 ผ่าน handleError(err, "GET /api/v2/support/crm-case/settings/sla") และหน้า settings แสดง error state ต่อ (ห้าม upsert ค่า default ลง DB เพราะไม่มีตาราง config)
Material ambiguity: none

## DES-005 — CSAT Rules

1. **Reuse ลูปเดิมทั้งหมด** — ไม่แตะ `crm-line-notify.service.ts` ยกเว้นจุดเดียว: เพิ่ม suppress check (ข้อ 3)
2. Trigger MVP = `closed` (ตรงของเดิม) — `verified`/`delay1d` อยู่ใน constant แต่ยังไม่มี hook (Later)
3. **Suppress ถามซ้ำ**: ก่อนแนบปุ่ม feedback เช็คว่าโรงเรียนนี้มี `TCrmFeedback` ของเคสที่ปิดใน `repeatSuppressDays` วันล่าสุด — best-effort: เช็คล้ม = ส่งปกติ ห้ามบล็อกการแจ้งเตือนปิดเคส
4. Channels: ส่งจริงเฉพาะ `line` — email/inapp แสดงใน settings แต่ inactive (Later)
5. **Escalation**: ใน `POST /feedback` หลัง insert (ห้าม rollback การรับคะแนน) ถ้าตรง rule `flag=immediate` → push LINE หากลุ่ม Support (group id จาก env/config ของทีม — ถ้าไม่มีตั้งค่า = ข้าม) · rule "ต่ำซ้ำ 2 ครั้ง" นับ feedback ต่ำของ SchoolId ใน 30 วัน
6. CES question toggle อ่านจาก constant — LIFF form ซ่อนคำถามเมื่อปิด (เก็บลง `Reasons` เดิม)
7. Known risk รับมาจากของเดิม: endpoint รับคะแนนไม่มี token/auth (`?id=` ทายได้) — fix ต้องอยู่ที่ v1 crm ไม่ใช่ scope นี้

Contract:CrmCaseCsatSetting.v1 — สัญญา CSAT: config/rules/channels มาจาก CRM_CASE_CSAT_* เดียว — trigger MVP = closed · ส่งจริงเฉพาะ line · satisfiedThreshold = 4 · repeatSuppressDays = 7
DEC-005 — reuse ลูปเดิมทั้งหมด (crm-line-notify → /liff/crm-feedback → POST /api/v1/support/crm/feedback → TCrmFeedback) แตะจุดเดียวคือ suppress check ก่อนแนบปุ่ม feedback — best-effort ห้ามบล็อกการแจ้งเตือนปิดเคส
Evidence EVD-013: claim=DES-005 | state=confirmed | path=src/constants/crm-case-csat-setting.constant.ts | symbol=CRM_CASE_CSAT_CONFIG | line=46 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=6c2f51bedddb53a50644db2f6d2c87795d272fae8fcd88026173c7a2d994ae46
Evidence EVD-014: claim=Contract:CrmCaseCsatSetting.v1 | state=confirmed | path=src/constants/crm-case-csat-setting.constant.ts | symbol=CRM_CASE_CSAT_CHANNELS | line=62 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=6c2f51bedddb53a50644db2f6d2c87795d272fae8fcd88026173c7a2d994ae46
Evidence EVD-015: claim=Contract:CrmCaseCsatSetting.v1 | state=confirmed | path=src/constants/crm-case-csat-setting.constant.ts | symbol=CRM_CASE_CSAT_RULES | line=69 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=6c2f51bedddb53a50644db2f6d2c87795d272fae8fcd88026173c7a2d994ae46
Evidence EVD-016: claim=DEC-005 | state=confirmed | path=src/app/api/v1/support/crm/crm-line-notify.service.ts | symbol=shouldSuppressCsatAsk | line=243 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=ddc1e51b63796adde5b513fa580d6c5fe875013688b933dd3403caebd276c17b
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: suppress check throw → ข้าม suppression รอบนั้นและส่ง LINE ปกติ (log ต่อท้าย pushAndLog เดิม); escalation push ล้มเหลว → log เท่านั้น ห้าม rollback การ insert คะแนน
Material ambiguity: none

## DES-006 — Insights Rules

1. กรอกเองล้วน (ไม่ auto-detect) — ผ่านฟอร์ม CRUD บน `TCrmKnowledgeEntry` Category `INSIGHT_*` ตาม § Data Contracts B
2. **สิทธิ์เขียน**: `INSIGHT_BOTTLENECK` + `INSIGHT_RECURRING_TASK` = `CRM_AI_SA` · `INSIGHT_FEATURE_REQUEST` = `CRM_AI_PM` (reuse ค่าเดิมจาก `permission.constant.ts`) · อ่าน = `MENU_SUPPORT_CRM`
3. Soft delete = `Status=ARCHIVED` (workflow ของตาราง) — ไม่ลบแถว
4. `reportMonth` format `YYYY-MM` validate ด้วย Zod
5. ⚠️ **Cross-module guard (บังคับก่อนปล่อย insights)**: retrieval QA ของ crm-ai-support ดึง entry `Status=APPROVED` ไปตอบลูกค้า — ต้องเพิ่ม filter `Category NOT LIKE 'INSIGHT_%'` ที่ query นั้น กัน insight โดนดึงไปตอบคำถาม (แตะโค้ด cross-module 1 จุด — ต้องประสาน owner crm-ai-support)
6. หน้า insights แสดงเดือนล่าสุด default + เลือกย้อนได้ · ตัวเลขทั้งหมด format ฝั่ง frontend

Contract:CrmCaseInsightEntry.v1 — สัญญา insights: TCrmKnowledgeEntry Category ∈ {INSIGHT_BOTTLENECK, INSIGHT_RECURRING_TASK, INSIGHT_FEATURE_REQUEST} · AnswerBody = JSON ตาม contract ต่อ kind ตรวจด้วย Zod ทุกครั้ง · soft delete = Status ARCHIVED
DEC-006 — ใช้ workflow ของตารางเดิม (DRAFT/APPROVED + SupersededById) แบ่งสิทธิ์เขียน SA (bottleneck/recurring) และ PM (feature request) และห้ามเก็บ counts/deals — derive สดจากเคส + TCrmCustomerPromise; ก่อนปล่อย insights ต้องลง filter Category NOT LIKE 'INSIGHT_%' ที่ QA retrieval ของ crm-ai-support (แตะโค้ด cross-module 1 จุด — ประสาน owner)
Evidence EVD-017: claim=DES-006 | state=confirmed | path=src/constants/crm-case-insight.constant.ts | symbol=CRM_INSIGHT_CATEGORIES | line=12 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=ba60166fa2f85abccd09d0b0dc6661d87fae0f824f7d3fac8348fae126c01fc4
Evidence EVD-018: claim=Contract:CrmCaseInsightEntry.v1 | state=confirmed | path=src/constants/crm-case-insight.constant.ts | symbol=FeatureRequestBodySchema | line=41 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=ba60166fa2f85abccd09d0b0dc6661d87fae0f824f7d3fac8348fae126c01fc4
Evidence EVD-019: claim=DEC-006 | state=confirmed | path=src/app/api/v2/support/crm-case/insights/[kind]/route.ts | symbol=KIND_WRITE_GUARD | line=20 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=b9c0ed2871d4a472b02151b000841adcbc92c916eed6f342b5502d1573ed27af
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: AnswerBody ไม่ผ่าน Zod → คืน 400 ผ่าน handleError พร้อม issue ที่ผิด; ถ้า filter INSIGHT_% ฝั่ง crm-ai-support ยังไม่ deploy — คง entry ไว้ที่ DRAFT เท่านั้น (block การ APPROVED ใช้จริง) จนกว่า owner จะลง filter
Material ambiguity: none

## DES-007 — Permission & API Surface

| หน้า/ทรัพยากร | อ่าน | เขียน |
|---|---|---|
| Dashboard, groups, schools, case detail, insights, **settings (display-only)** | `MENU_SUPPORT_CRM` | — |
| Insights CRUD | `MENU_SUPPORT_CRM` | `CRM_AI_SA` (bottleneck/recurring) · `CRM_AI_PM` (feature request) |

```
GET   /api/v2/support/crm-case/dashboard                      # payload ครบทุกการ์ด — query: from, to (z.coerce)
GET   /api/v2/support/crm-case/groups/[type]                  # กลุ่ม + อันดับ
GET   /api/v2/support/crm-case/groups/[type]/[groupId]        # รายละเอียดกลุ่ม + เคส (pagination บังคับ)
GET   /api/v2/support/crm-case/cases/[id]                     # header + thread + csat + assignee
GET   /api/v2/support/crm-case/schools                        # search + pagination
GET   /api/v2/support/crm-case/schools/[schoolId]             # สรุป + เคส (pagination บังคับ)
GET   /api/v2/support/crm-case/settings/sla                   # อ่าน constant → display
GET   /api/v2/support/crm-case/settings/csat                  # อ่าน constant → display
GET/POST       /api/v2/support/crm-case/insights/bottlenecks       # + [id] PATCH/ARCHIVE → TCrmKnowledgeEntry
GET/POST       /api/v2/support/crm-case/insights/recurring-tasks   # + [id] PATCH/ARCHIVE
GET/POST       /api/v2/support/crm-case/insights/feature-requests  # + [id] PATCH/ARCHIVE (counts/deals compute สด)
```

- ทุก list pagination ด้วย `buildPagination` · error ผ่าน `handleError(err, "[CRM_CASE_DASHBOARD_...]")` · guard แยกไฟล์ `{resource}.guard.ts`
- ไม่มี endpoint write ของ settings — ตัดค่า permission `support.crm_case.settings_manage` ที่เคยเสนอใน Rev 1 (ไม่จำเป็นแล้ว)
- Form flow ที่เหลือ (insights) เดิน Modal confirm → API → StatusModal success/error ตาม CLAUDE.md

Contract:CrmCaseDashboardApi.v1 — สัญญา API surface: ทุก route ใต้ /api/v2/support/crm-case/* ผ่าน guardCrmCase (session + MENU_SUPPORT_CRM) · list pagination ด้วย buildPagination · error ผ่าน handleError(err, "[CRM_CASE_DASHBOARD_...]") · guard แยกไฟล์ {resource}.guard.ts
DEC-007 — ใช้สิทธิ์เดิม MENU_SUPPORT_CRM (อ่านทุกหน้า รวม settings display-only) และ CRM_AI_SA / CRM_AI_PM (เขียน insights ตาม kind) — ไม่สร้าง permission ใหม่ (ตัด support.crm_case.settings_manage ของ Rev 1 แล้ว)
Evidence EVD-020: claim=DES-007 | state=confirmed | path=src/app/api/v2/support/crm-case/crm-case.guard.ts | symbol=guardCrmCase | line=19 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=b4822b03f567a913631e02474e3ff3155a395c2d6f618216c7d3c4cd52b797ef
Evidence EVD-021: claim=Contract:CrmCaseDashboardApi.v1 | state=confirmed | path=src/app/api/v2/support/crm-case/dashboard/route.ts | symbol=GET | line=9 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=30b231bb7695879d0c43a3802cb3a064832ce4592d0ad9fe359fd74834a62db9
Evidence EVD-022: claim=DEC-007 | state=confirmed | path=src/constants/permission.constant.ts | symbol=MENU_SUPPORT_CRM | line=64 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=2f65119e28364ea2d8c78ca22af45285b0d6af6e0dfa7a351e8e2a51c0d67830
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: sensitive
Fallback: session ไม่ผ่าน → guardCrmCase คืน 401/403 มาตรฐานทันที; error ภายใน route ใด → handleError(err, "[CRM_CASE_DASHBOARD_...]") คืน response รูปแบบเดียวกันทุก endpoint ไม่ปล่อย stack trace ออกนอก API
Material ambiguity: none

## DES-008 — Frontend Wiring Notes (mockup → ของจริง)

| จุดที่แตะ | การเปลี่ยนแปลง |
|---|---|
| `_data/crm.types.ts` + `crm-mock.data.ts` | ลบเมื่อ wire เสร็จ — type infer จาก Zod (z.infer) |
| `ModuleKey` (fin/acct/…) | dynamic จาก `TGroupMenu` (key=`groupmenuid`) |
| `CaseTypeKey "question"` | แก้เป็น `QA` |
| Route `schools/[schoolName]` | → `schools/[schoolId]` |
| `SchoolRow.region`/`size` | ซ่อน chip (ไม่มี column ต้นทาง — ดู Open Questions) |
| `CaseStatus` mockup | map alias จริง OPEN/In Progress/Resolved/Closed — "Ready for test" ตัด |
| หน้า settings/sla + csat | จากฟอร์มแก้ไข → **display-only card** + hint แก้ผ่าน code |
| Charts | ส่ง `theme` prop ผูก dark mode ทุกตัว |

Contract:CrmCaseDashboardWiring.v1 — สัญญาการ wire: type ของหน้ามาจาก payload API จริง · ModuleKey dynamic จาก TGroupMenu (key=groupmenuid) · route โรงเรียนใช้ [schoolId] · settings เป็น display-only card — mock/_data ถูกลบเมื่อ wire เสร็จ
DEC-008 — wire ข้อมูลจริงแทน mock ทั้งหมดตามตารางข้างบน — ไม่มี mock fallback หลัง wire; ตัวเลขทุกตัว format ฝั่ง frontend จาก payload server
Evidence EVD-023: claim=DES-008 | state=confirmed | path=src/app/pages/support/crm/schools/[schoolId]/page.tsx | symbol=CrmSchoolCasesPage | line=17 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=92743cd3ab776d7aa20876f013fa8eb052c03d0dcbed647692a83943a61e2b24
Evidence EVD-024: claim=Contract:CrmCaseDashboardWiring.v1 | state=confirmed | path=src/app/pages/support/crm/_api/crm-dashboard-service.ts | symbol=DASHBOARD_URL | line=80 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=6cbeccfdb33a5d61b77240ed64fcf80ece7dff83faa8173824f7b42b137f0a37
Evidence EVD-025: claim=DEC-008 | state=confirmed | path=src/app/pages/support/crm/settings/sla/page.tsx | symbol=CrmSlaSettingsPage | line=22 | revision=d98d4e5db59acdb0363a1c12eae3bd22993340da | basis=source | tool=rg-read | hash=4d2f925c9bd47aa4a1e08a08c7998587eca1d1c9be011d7fb3186d382cc5b718
Compatibility: additive-internal
Data/schema: unchanged
Migration/backfill: none
Security: none
Fallback: endpoint ใดยังไม่พร้อม/คืน error — หน้านั้นแสดง loading/empty state จาก service layer ต่อ (ห้าม fallback กลับไป mock data ที่ลบไปแล้ว); ต้องย้อนจริงให้ revert wiring commit ทั้งชุดพร้อมกัน
Material ambiguity: none

## Modules

Feature groupings ภายใน module เดียวนี้ (policies/documentation.md §1) — derive จาก § Feature-by-Feature Feasibility และกติกาที่ผูกกับ contract section ข้างบน:

1. ภาพรวมเคส (dashboard KPI ทุกการ์ด) — กติกาเมตริก: DES-003 · API/guard: DES-007
2. จัดกลุ่มเคสตามประเภท + จัดอันดับ (groups/[type]/[groupId]) — DES-002
3. สรุปตามโรงเรียน (schools, schools/[schoolId]) — API: DES-007 · wiring: DES-008
4. ตั้งค่า SLA (display-only) — DES-004
5. ตั้งค่า CSAT + ลูปส่ง/เก็บ/escalation — DES-005
6. Insights ×3 (bottlenecks / recurring-tasks / feature-requests) — DES-006
7. ขอบเขตร่วมของโมดูล — มติผู้ใช้: DES-001 · permission/API: DES-007 · frontend wiring: DES-008

## Risks & Dependencies

1. **Dependency บน deploy/backfill ของ crm-ai-support**: dashboard/groups อ่าน `AiCategory`/`ComputedPriorityScore` — ยังไม่ deploy = แสดง empty-state ("ยังไม่มีข้อมูลจำแนก") ห้าม crash/ห้ามแสดง 0 หลอกตา (settings/insights ไม่ block — ทำก่อนได้)
2. **Noise ของ MTTR**: `UpdateDate` เขียนทุกครั้งที่แก้เคส — MTTR อาจสูงเกินจริง (ยอมรับตามมติ #2) แก้ภายหลังต้องเพิ่มคอลัมน์ `ClosedAt` = ต้องมี DDL + DBA
3. **68k+ เคสเก่า `AiCategory IS NULL`**: bucket "ยังไม่จำแนก" ต้องชัดเจน อย่าให้ภาพรวมดูครบเมื่อยังไม่ backfill
4. **`TCrmFeedback` ไม่มี unique constraint**: aggregation ต้อง dedupe ต่อเคสที่ app layer ทุกจุด — ลืม = CSAT เพี้ยนเงียบ
5. **Knowledge pollution (ใหม่ — จาก Rev 2)**: insight entry `APPROVED` ต้องไม่โดน QA retrieval ของ crm-ai-support ดึงไปตอบคำถาม — filter `Category NOT LIKE 'INSIGHT_%'` เป็น pre-launch gate
6. **Settings เป็น constant**: เปลี่ยน target = deploy — ความเสี่ยงคือ doc/UI บอกไม่ชัดว่าแก้ที่ไหน (mitigate ด้วย hint ในหน้า + comment หัวไฟล์ constant)
7. **Performance**: aggregate ~10 metric บน 68k+ แถว — ใช้ index ที่มี (`idx_tcrmsupport_issue`, `IX_TCrmSupport_AiCategory_Severity`, partial indexes), รวม query เป็น `$transaction` read-only, ช้าค่อยแตก endpoint (ห้าม cache table ใน MVP)

## Unresolved Open Questions

1. Region/ขนาดโรงเรียน — `TCompany` ไม่มีคอลัมน์ต้นทางชัดเจน → MVP ซ่อน chip
2. Timeline รายจุด — ไม่มี status-history table → เปิด requirement ใหม่ถ้าต้องการ
3. CSAT trigger `verified`/`delay1d` + channel email/inapp — ยังไม่มี hook (Later)
4. Chat-CSAT (`TQueueCsatSurvey`) จะรวมเข้า metric "ความพึงพอใจภาพรวม" ไหม — Later (คนละ entity ต้องแยกนิยามชัดก่อน)

## Change Log

- 2026-09-13: ผูกโครงสร้าง design evidence กับ sb-web-helper @ d98d4e5db59acdb0363a1c12eae3bd22993340da (branch dev/golf) — เพิ่ม DES-001..DES-008 พร้อม Contract/DEC/EVD-001..EVD-025 ครบทุก contract section, เปลี่ยนหัวข้อ "Data Contracts" เป็นหัวข้อ Data Model (เนื้อหาเดิมคงครบ), เพิ่มหัวข้อ Modules — เป็นการจัดโครงสร้าง/ผูกหลักฐานเท่านั้น ไม่แก้กติกาหรือมติใด
- 2026-08-23 (Rev 2): **ยกเลิก 7 ตารางใหม่ทั้งหมด** ตามมติผู้ใช้ "ไม่เพิ่มตาราง เพราะออกแบบตารางมาแล้ว" — ยืนยันสิ่งที่มีจริงด้วย `npx prisma db pull` (194 models) + regenerate schema-map: SLA/CSAT settings → code constants (ผู้ใช้ยอมรับ trade-off admin แก้ UI ไม่ได้ — ย้อน requirement § Core Features 4–5), insights ×3 → `TCrmKnowledgeEntry` Category `INSIGHT_*` + JSON contract, FR counts derive จากเคสจริง, ดีล derive จาก `TCrmCustomerPromise` — เพิ่ม pre-launch gate: filter `Category NOT LIKE 'INSIGHT_%'` ที่ QA retrieval ของ crm-ai-support · ตัด permission ใหม่ `settings_manage` (ไม่มี write settings แล้ว) · จด discovery `TQueueCsatSurvey` = CSAT คิวแชท (คนละ entity)
- 2026-08-23 (Rev 1): เขียน design ชุดแรก + ปิด Open Questions 3+1 ข้อ (subsystem=TGroupMenu · MTTR=UpdateDate−IssueDate เฉพาะเคสปิด · settings permission ใหม่ · CSAT ส่ง LINE จริง) — ข้อความเดิมถูกแทนที่ด้วย Rev 2 นี้
