# crm-case-dashboard — Data Model

> Budget ≤ 15 KB (`policies\documentation.md` §4) · เขียนโดย `system-analyst` เท่านั้น · นี่คือ **schema contract** — `qa-engineer` อ่านเต็มทุกรอบ, engineers implement verbatim

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


## Change Log

- 2026-10-07 — Migrated to split layout

Back-links: `design\index.md` · `..\index.md`
