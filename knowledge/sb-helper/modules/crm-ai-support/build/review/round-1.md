# Closure Verification Round — ทุก phase ที่เหลือ (2026-08-23)

FULL round ปิด module: ตรวจ **83 checkbox ที่ยังไม่ติ๊กครบทุก phase** (Phase 1 CR 2026-08-18 ×6, Phase 3a ×19, Phase 3b ×10, Phase 3b amendment ×15, Phase 4a ×9, Phase 4b ×14, Phase 4b amendment ×10) + re-confirm Phase 2 (20 checkbox เดิม) — อ่านโค้ดจริงเทียบ `design.md`/`plan.md` ทีละ task (logic-level ไม่ใช่เช็คชื่อไฟล์), schema เทียบ Data Model field-by-field, และรัน automated checks เองทุกตัว

## Automated checks (ผลจริงจากรอบนี้)

- `bun run lint`: exit 1 — **349 problems (323 errors / 26 warnings) เป็นของเก่านอก module ทั้งหมด, 0 รายการตรง "crm-ai"**
- `bun test`: **211 pass / 0 fail** (485 assertions, 19 files)
- `bun run build`: **exit 0** — route `/api/v2/support/crm-ai/*` และ `/pages/support/crm-ai/*` ถูก generate ครบทุก endpoint

## Per-Phase Results

### Phase 1 amendment — CR 2026-08-18 (6/6 ✅)

implement ครบแล้วก่อนหน้านี้ (พร้อม comment กำกับวันแก้ในโค้ด) — รอบนี้ยืนยัน logic ตรง task:

| Task | Verdict | Evidence |
|---|---|---|
| `BACKFILL_CLOSED_ALIASES` = CLOSED+RESOLVED case-sensitive, Mode A only, ไม่แตะ `CLOSED_ALIASES` เดิม | ✅ | `backfill.repository.ts:7` |
| `overrideReviewStatuses()` เขียนทับเฉพาะมิติ PENDING_REVIEW/NEEDS_HUMAN, ไม่แตะ NULL/NO_MENU, เกราะ `{Dim}ReviewedAt` คงอยู่ | ✅ | `backfill.repository.ts:94-118` (`OVERRIDABLE_REVIEW_STATUSES`) |
| SLA v2: `CRM_SCHOOL_REPEAT_MULTIPLIER` + `computeCrmPriorityScoreV2` + version "v2" + เก็บ v1 พร้อม deprecation comment | ✅ | `crm-sla-rule.constant.ts:6,40-74` |
| `distinctSchoolCount` query ที่ repository layer ตามนิยาม IssueId / MenuId+AiCategory 30 วัน / count 0 → 1.0 / DeleteDate IS NULL | ✅ | `priority-score.service.ts:7-22`, `priority-score.repository.ts` |
| Call site ย้ายไป V2 + `SlaRuleVersion="v2"`+`ComputedAt` คู่กัน: classify, review-queue severity change, link-case, MERGE accept (best-effort หลัง commit) | ✅ | `classification.service.ts:235-255`, `review-queue.service.ts:132`, `issue.service.ts:92`, `ai-suggestion.service.ts:167` |
| Spec อัปเดตสูตร v2 | ✅ | `cases/_docs/classify-spec.md:13`, `review-queue/_docs/update-spec.md:27`, `issues/_docs/create-spec.md:29`, `ai-suggestions/_docs/update-spec.md:50` |

### Phase 2 (20/20 ✅ — re-confirm checkbox เดิมทั้งหมดยังถูกต้อง)

Models `TCrmIssue`/`TCrmKnowledgeEntry` ตรง design, endpoints issues/knowledge ครบ (create SA/PM, DECLINED บังคับ DecisionReason PM-only 403, knowledge approve → APPROVED เท่านั้นที่ AI ดึง, QA retrieval best-effort), frontend ครบทั้ง 2 หน้า + เมนู news:true + permission labels

### Phase 3a (19/19 ✅)

`PERMISSIONS.CRM_AI_UX_UI/DEV/SALES` ครบ · models `TCrmProductFeature`/`TCrmMenuRelation` no drift · product-features CRUD (PM write / PM_SALES read-only, DECLINED บังคับ StatusReason app layer) · menu-relations POST Source=DECLARED → CONFIRMED ทันที + ConfirmedBy/At, PATCH confirm/reject เฉพาะ PENDING_REVIEW และ **ไม่เขียน TCrmAiDecisionLog** (grep ยืนยันศูนย์ reference) · frontend 2 หน้า + เมนู + permission page ครบ

### Phase 3b (10/10 ✅ — 1 task เป็น placeholder ที่ถูกแทนด้วย amendment แล้ว)

inbox list default PENDING · REJECTED ไม่เขียน decision log · accept ซ้ำ → AppError(409) · paired decision-log rows ตารางแมปครบ 4 กลุ่ม (MENU_RELATION/MENU_CLASSIFICATION, ISSUE/DEDUP_MATCH ที่ปลายทาง, KNOWLEDGE/KNOWLEDGE_MATCH) เขียนใน `$transaction` เดียว rollback ได้จริง (`ai-suggestion.repository.ts`) · ค่าบังคับของแถวคู่ครบ (AiOutput copy Payload ทั้งก้อน, rule-based → Confidence=null/ModelVersion="rule-based", ReviewStatus=CONFIRMED, ReviewedBy/At จากคนกด)

### Phase 3b amendment — CR 2026-08-18 (14/15 ✅, 1 ⚠️ ปิดบางส่วน)

accept มีผลจริงครบ: MERGE_* evidence_case_ids→422, กติกา 4 กลุ่มไม่เขียนทับ conflicted, merged+already=0→422, recompute priority best-effort หลัง commit · NEW_KNOWLEDGE DRAFT Version=1 ไม่ auto-APPROVED, Title>300→422, ห้ามรับ subject_id→422 · STALE_KNOWLEDGE APPROVED→NEEDS_REVIEW idempotent, DRAFT/ARCHIVED→422 · prerequisite KNOWLEDGE_MATCH log จากเส้นทางตอบ QA (`classification.service.ts:333-343` + `recordKnowledgeMatchOutcome`) · constant v1 ครบ 5 threshold · detect endpoint advisory lock key ต่างจาก backfill (823_501_002 vs 823_501_001) ไม่เรียก Gemini · กฎ MERGE_ISSUE/NEW_KNOWLEDGE/STALE_KNOWLEDGE/NEW_MENU_RELATION ครบตาม §7.1 · group_key/dedup/cooldown 90 วันครบ
**⚠️ 1 task**: `MERGE_REQUEST` implement เฉพาะกลุ่ม `MenuId` — กลุ่ม `ProductFeatureId` บล็อกที่ schema (ไม่มีคอลัมน์บนตารางเคส) เปิดเป็น Open Question ใน plan.md แล้ว

### Phase 4a (9/9 ✅)

POST รวม justification+decision ใน submit เดียว (schema NOT NULL ตรงโมเดลข้อมูล), validate CrmIssueId→404, BumpedItems snapshot คำนวณฝั่ง service ตอน POST (`school_count` จาก server ไม่รับจาก client), **ไม่เขียน TCrmAiDecisionLog เด็ดขาด**, guard CRM_AI_PM, GET pagination+filter, frontend ครบ

### Phase 4b (13/14 ✅, 1 ⚠️ เชิงเอกสาร)

models ตรง design (ไม่มี unique constraint บน AdminId+FunctionalRole ตามที่ design ห้าม) · customer-promises: SchoolId validate ผ่าน TCompany.nCompany, renewal-alerts GET แยก, PATCH manual statuses, ContractRenewalAlertDate nullable + future-date validation ทั้ง POST/PATCH + client-side mirror · staff-roles CRUD/toggle · frontend ครบ
**⚠️ 1 จุด**: นิยาม renewal-alerts ของ design.md (≤ today) ขัด plan.md/implementation (upcoming view = NOT NULL เรียงใกล้ถึงก่อน ตรง label tab "ใกล้ถึงกำหนด") — เปิด Open Question ให้ผู้ใช้ตัดสิน ไม่แก้โค้ดเงียบๆ
หมายเหตุ (accepted deviation): PATCH ยังรับ `status=PENDING` ไว้เพราะฟอร์มแก้ไข pre-fill ค่าปัจจุบันและ required — การตัดสินใจจริงคือ 3 สถานะ terminal ตาม plan

### Phase 4b amendment — Staff Role Sync (10/10 ✅)

constant map 6 คู่ตรงตัว (ADMIN_ACCESS derive  nothing) · sync กลาง findFirst+update/create ห้าม upsert, duplicate → canonical row น้อยสุด · hooks หลัง rolePermission rewrite (เฉพาะเมื่อ `permission_ids !== undefined`) และเปลี่ยน role_id รายคน (ครบ update/delete/bulkUpdateRole, is_deleted=true → ปิดทุกบทบาท) · sync ล้มไม่ทำการแก้สิทธิ์ล้ม (try/catch ครอบใน sync service เอง logger.error ไม่ rethrow) · endpoint sync ทั้งระบบ idempotent guard CRM_AI_PM/ADMIN_ACCESS · frontend settings หน้า + permission ครบ

## Fixes applied (2026-08-23)

1. **บั๊ก filter `active=false`** — `staff-role.schema.ts` เปลี่ยน `z.coerce.boolean()` (Boolean("false")===true) เป็น parse `z.enum(["true","false"]).transform(...)` — เดิมกรอง Active=false จาก UI แล้วเงียบๆ ได้แถว Active=true ทั้งหมด
2. **บั๊ก empty payload → Prisma 500** — `UpdateCustomerPromiseSchema` เพิ่ม `.refine` บังคับ ≥1 field → 400
3. **Security fix 🟡 (Round 2 finding)** — Gemini API key ย้ายจาก URL query `?key=` ไป header `x-goog-api-key` (`classify-with-gemini.ts`) กัน key หลุด access log/proxy log

## Issues Found / Routed

| # | ระดับ | รายการ | ไปที่ |
|---|---|---|---|
| 1 | ⚠️ blocker เชิง design | MERGE_REQUEST กลุ่ม ProductFeatureId ทำไม่ได้ (ไม่มีคอลัมน์บนตารางเคส — ต้อง DDL หรือตัด branch) | ผู้ใช้/system-analyst — Open Question ใหม่ใน plan.md |
| 2 | ⚠️ เชิงเอกสาร | renewal-alerts view semantics design vs plan/impl | ผู้ใช้/system-analyst — Open Question ใหม่ใน plan.md |
| 3 | ℹ️ observation | ApprovedBy ของ queue-interrupt เป็น free-input ไม่ derive จาก session (design บังคับแค่ NOT NULL — compliant) | บันทึกไว้ ไม่บล็อก |
| 4 | ℹ️ cosmetic | error state ตอนโหลด overview: customer-promises ใช้ antd Alert, queue-interrupts ใช้ StatusModalComponent | ปรับภายหลัง ไม่บล็อก |

## Addendum — Open Questions ปิดครบ (2026-08-23, มติผู้ใช้)

ทั้ง 2 open item จาก Issues Found ข้างบน **ปิดสมบูรณ์** — module ไม่มี task ค้าง (checkbox plan.md ครบทุกตัว):

| # | มติ | ผล |
|---|---|---|
| 1 | MERGE_REQUEST ProductFeatureId branch → **"ใช้ตารางปัจจุบันเท่านั้น"** (ไม่มี DDL) | design.md §ข้อ 7 ตัด branch ProductFeatureId ออก (MenuId-only); implementation เดิมกลายเป็นตรง design เต็ม; task ติ๊ก [x]; comment `detection.service.ts` อัพเดต |
| 2 | renewal-alerts view → **คง upcoming view** | design.md § Customer Promise Rules ข้อ 2 แก้เป็น "Status=PENDING AND AlertDate IS NOT NULL เรียงใกล้ถึงก่อน"; โค้ด/UI ไม่แตะเลย |

## Review Outcome

- **Phase 1 (รวมทุก amendment/CR): Accepted** — CR 2026-08-18 ผ่านครบ, security gate ผ่าน Round 3 (ดู `../security.md`)
- **Phase 2: Accepted** (re-confirm ครบ)
- **Phase 3a/3b + amendments: Accepted** — ~~open item 1 ชิ้น~~ ปิดสมบูรณ์แล้วตาม Addendum
- **Phase 4a/4b + amendments: Accepted** — ~~open item 1 ชิ้นเชิงเอกสาร~~ ปิดสมบูรณ์แล้วตาม Addendum
- **Deploy ⬜ ทุก phase**: รอ devops + ops legacy cleanup ~500 รายการ + การยอมรับ risk personal-data (~70k เคสส่งเข้า Gemini ครั้งแรกของ Backfill) ตาม security.md § Accepted Risks

## Change Log

- 2026-08-23: Closure round — FULL verify 83 checkbox + re-confirm Phase 2; แก้ 2 บั๊ก + security fix 1 จุด; เปิด Open Questions ใหม่ 2 ข้อ; ติ๊กครบยกเว้น 1 task (ปิดบางส่วนติด schema); ปรับ wording task ai-suggestions PATCH เรื่อง permission 2 ชั้น (behavior ไม่เปลี่ยน)
- 2026-08-23 (addendum): ผู้ใช้ตัดสินใจปิดทั้ง 2 Open Questions — MERGE_REQUEST ตัด branch ProductFeatureId (design.md §ข้อ 7 แก้), renewal-alerts คง upcoming view (design.md § Customer Promise Rules ข้อ 2 แก้) — checkbox plan.md ครบ 100%, module ปิดสมบูรณ์
