# แผน sb-helper

แผนเดียวของ project; Task ID และ Depends ใช้คู่กับ module ในแถวเดียวกันเพื่อแยก ID เดิมที่ซ้ำกัน รายละเอียดขอบเขตและประวัติเดิม:

- [crm-ai-support](crm-ai-support--index.md)
- [crm-case-dashboard](crm-case-dashboard--index.md)

## Tasks

| module | Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|---|
| sb-helper/crm-ai-support | BE-101 | 3 คอลัมน์จำแนกบน TCrmSupport | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-102 | model TCrmCaseAiAssessment | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-103 | model TCrmSafetyKeyword | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-104 | model TCrmAiDecisionLog (append-only) | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-105 | PERMISSIONS.CRM_AI_CS/SA/PM | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-106 | CRM_SLA_RULES constant (v1) | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-107 | POST /safety-keywords | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-108 | GET /safety-keywords list | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-109 | PATCH /safety-keywords/[id] | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-110 | DELETE /safety-keywords/[id] | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-111 | POST /cases/[id]/classify pipeline | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-112 | GET /review-queue | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-113 | PATCH /review-queue/[id] confirm/override | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-114 | GET /decision-log audit trail | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-115 | เมนู ตรวจสอบการจำแนกเคส AI | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-116 | scaffold review-queue page | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-117 | case-review-filter component | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-118 | case-review-table component | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-119 | case-review-detail-drawer component | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-120 | use-case-review-store | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-121 | case-review-service API layer | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-122 | scaffold safety-keywords page | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-123 | safety-keyword table + form modal | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-124 | safety-keyword store + service | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-125 | ผูกสิทธิ์ 2 หน้าเข้า permission page | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-126 | auto-trigger classify หลัง createCase | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-127 | ค่า REJECTED ทุกคอลัมน์ review status | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-128 | menu catalog เข้า prompt จำแนก | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-129 | anti-hallucination ของ menuId | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-130 | เขียนผลจำแนกเมนูลง assessment/เคส | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-131 | safety override path เรียก menu classification | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-132 | แถว log MENU_CLASSIFICATION | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-133 | ReviewCaseSchema รับ 3 มิติแยก | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-134 | apply การตัดสินใจรายมิติ | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-135 | POST /backfill ทีละชุด | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-136 | GET /backfill remaining | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-137 | drawer รีวิว 3 มิติแยก | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-138 | คอลัมน์เมนูในตารางรีวิว | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-139 | backfill panel + progress | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-140 | menu-only path (Mode B) | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-141 | ค่า MenuReviewStatus NO_MENU | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-142 | backfill query แยก Mode A/B | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-143 | SeverityReviewStatus จาก confidence ตัวเอง | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | FE-144 | แสดง NO_MENU แยกจากยังไม่จำแนก | frontend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-145 | BACKFILL_CLOSED_ALIASES constant | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-146 | overrideReviewStatuses เฉพาะมิติรอตรวจ | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-147 | priority score v2 constant | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-148 | query นับ distinctSchoolCount | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-149 | ย้าย call site ไป v2 ทั้ง 3 จุด | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-150 | อัปเดต spec ของ crm-sla-rule | backend-engineer | 1 | — | verified |
| sb-helper/crm-ai-support | BE-201 | model TCrmIssue | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-202 | model TCrmKnowledgeEntry | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-203 | POST /issues (SA/PM) | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-204 | GET /issues list | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-205 | GET /issues/[id] detail | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-206 | PATCH /issues/[id] + DecisionReason | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-207 | POST /issues/[id]/link-case | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-208 | POST /knowledge (DRAFT) | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-209 | GET /knowledge list | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-210 | PATCH /knowledge/[id] approve | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-211 | wire knowledge retrieval เข้า classify (QA) | backend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-212 | scaffold issues page (SA/PM) | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-213 | issue table + detail drawer | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-214 | issue-link-case modal | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-215 | issue store + service | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-216 | scaffold knowledge page (CS-facing) | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-217 | knowledge table + form modal | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-218 | knowledge store + service | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-219 | เมนู จัดการเรื่อง/ความรู้ AI | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | FE-220 | ผูกสิทธิ์หน้าเรื่อง/ความรู้ | frontend-engineer | 2 | — | verified |
| sb-helper/crm-ai-support | BE-301 | PERMISSIONS.CRM_AI_UX_UI/DEV/SALES | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-302 | ตรวจ model TCrmProductFeature | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-303 | POST /product-features (PM) | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-304 | GET /product-features list | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-305 | GET /product-features/[id] | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-306 | PATCH /product-features/[id] | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-307 | ตรวจ model TCrmMenuRelation | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-308 | POST /menu-relations (DECLARED) | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-309 | GET /menu-relations list | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-310 | PATCH /menu-relations/[id] confirm/reject | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-311 | เมนู ฟีเจอร์ที่วางแผนไว้ | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-312 | scaffold product-features page | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-313 | product-feature table + form modal | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-314 | product-feature store + service | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-315 | เมนู ความสัมพันธ์ระหว่างเมนู | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-316 | scaffold menu-relations page | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-317 | menu-relation table + form modal | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-318 | menu-relation store + service | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-319 | ผูกสิทธิ์หน้า feature/menu-relation | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-320 | ตรวจ model TCrmAiSuggestion | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-321 | GET /ai-suggestions inbox | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-322 | PATCH /ai-suggestions/[id] accept/reject | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-323 | REJECTED ไม่เขียน decision log | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-324 | accept ซ้ำ → AppError(409) | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-325 | accept NEW_MENU_RELATION → แถว + log คู่ | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-326 | accept MERGE_* → log คู่ ISSUE/DEDUP_MATCH | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-327 | accept NEW/STALE_KNOWLEDGE → log คู่ | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-328 | ค่าที่เหลือของแถวคู่ | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-329 | detection threshold — แถวเดิม (ปลดล็อกแล้ว) | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-330 | accept มีผลจริงตามกติกาข้อ 6 | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-331 | prerequisite: log KNOWLEDGE_MATCH จากเส้นทางตอบ QA | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-332 | crm-ai-suggestion-rule constant v1 | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-333 | POST /ai-suggestions/detect | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-334 | กฎ MERGE_ISSUE | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-335 | กฎ MERGE_REQUEST (MenuId-only) | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-336 | กฎ NEW_KNOWLEDGE | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-337 | กฎ STALE_KNOWLEDGE | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-338 | กฎ NEW_MENU_RELATION | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-339 | กันแถวซ้ำ group_key + cooldown | backend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-340 | เมนู กล่องข้อเสนอ AI | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-341 | scaffold ai-suggestions inbox page | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-342 | ai-suggestion table + detail drawer | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-343 | ai-suggestion store + service | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | FE-344 | ผูกสิทธิ์หน้า inbox | frontend-engineer | 3 | — | verified |
| sb-helper/crm-ai-support | BE-401 | ตรวจ model TCrmQueueInterrupt | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-402 | POST /queue-interrupts | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-403 | GET /queue-interrupts list | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-404 | BumpedItems snapshot ตอน POST | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-405 | เมนู คำขอแทรกคิวงาน | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-406 | scaffold queue-interrupts page | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-407 | queue-interrupt table + form modal | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-408 | queue-interrupt store + service | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-409 | ผูกสิทธิ์หน้าแทรกคิว | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-410 | ตรวจ model TCrmCustomerPromise | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-411 | POST /customer-promises (SALES) | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-412 | GET /customer-promises list | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-413 | GET /customer-promises/renewal-alerts | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-414 | PATCH /customer-promises/[id] สถานะด้วยมือ | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-415 | ContractRenewalAlertDate กรอกเอง + validate อนาคต | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-416 | ตรวจ model TCrmStaffRole | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-417 | POST /staff-roles (PM) | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-418 | GET /staff-roles list | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-419 | PATCH /staff-roles/[id] toggle Active | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-420 | เมนู คำมั่นสัญญาลูกค้า | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-421 | scaffold customer-promises page | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-422 | customer-promise table + form (date picker) | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-423 | customer-promise store + service | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-424 | constant map สิทธิ์→บทบาท 6 คู่ | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-425 | ฟังก์ชัน sync กลาง (findFirst+update/create) | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-426 | hook: แก้สิทธิ์ role → sync ทุก user ของ role | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-427 | hook: เปลี่ยน role_id ของ user → sync คนนั้น | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | BE-428 | POST /staff-roles/sync เต็มระบบ | backend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-429 | เมนู จัดการบทบาทพนักงาน CRM AI | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-430 | scaffold staff-roles settings page | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-431 | staff-role table + form modal | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-432 | staff-role store + service | frontend-engineer | 4 | — | verified |
| sb-helper/crm-ai-support | FE-433 | ผูกสิทธิ์หน้าบทบาท 2 หน้า | frontend-engineer | 4 | — | verified |
| sb-helper/crm-case-dashboard | BE-101 | SLA settings constant | backend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | BE-102 | CSAT settings constant | backend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | BE-103 | GET /settings/sla read endpoint | backend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | BE-104 | GET /settings/csat read endpoint | backend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | FE-105 | settings/sla page display-only | frontend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | FE-106 | settings/csat page display-only | frontend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | FE-107 | remove unused settings mock data | frontend-engineer | 1 | — | verified |
| sb-helper/crm-case-dashboard | BE-201 | dashboard endpoint scaffold | backend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | BE-202 | dashboard metrics repository | backend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | BE-203 | MTTR + CSAT aggregation rules | backend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | BE-204 | subsystem tiles + type breakdown buckets | backend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | BE-205 | top urgent cases payload | backend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | FE-206 | wire dashboard cards to GET /dashboard | frontend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | FE-207 | dashboard card details (theme/buckets/badges) | frontend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | FE-208 | dashboard filter bar (segmented days) | frontend-engineer | 2 | — | verified |
| sb-helper/crm-case-dashboard | BE-301 | GET /groups/[type] ranked list | backend-engineer | 3 | — | verified |
| sb-helper/crm-case-dashboard | BE-302 | GET /groups/[type]/[groupId] detail + cases | backend-engineer | 3 | — | verified |
| sb-helper/crm-case-dashboard | BE-303 | GET /cases/[id] case detail | backend-engineer | 3 | — | verified |
| sb-helper/crm-case-dashboard | BE-304 | GET /schools + /schools/[schoolId] | backend-engineer | 3 | — | verified |
| sb-helper/crm-case-dashboard | FE-305 | groups/[type] page wiring | frontend-engineer | 3 | — | pending |
| sb-helper/crm-case-dashboard | FE-306 | group detail + case detail pages wiring | frontend-engineer | 3 | — | pending |
| sb-helper/crm-case-dashboard | FE-307 | schools route [schoolName] → [schoolId] + wiring | frontend-engineer | 3 | — | pending |
| sb-helper/crm-case-dashboard | FE-308 | sidebar path check after refactor | frontend-engineer | 3 | — | pending |
| sb-helper/crm-case-dashboard | BE-401 | prerequisite: INSIGHT_% filter at crm-ai-support retrieval | backend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | BE-402 | insight AnswerBody Zod schemas | backend-engineer | 4 | — | verified |
| sb-helper/crm-case-dashboard | BE-403 | insights.repository.ts CRUD on TCrmKnowledgeEntry | backend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | BE-404 | bottlenecks endpoints | backend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | BE-405 | recurring-tasks endpoints + sopStatus derive | backend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | BE-406 | feature-requests endpoints + live derive counts | backend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | BE-407 | insight API spec docs | backend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | FE-408 | insights page + forms + permission-gated buttons | frontend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | FE-409 | delete insights mock data | frontend-engineer | 4 | — | pending |
| sb-helper/crm-case-dashboard | BE-501 | CSAT repeat suppress helper | backend-engineer | 5 | — | pending |
| sb-helper/crm-case-dashboard | BE-502 | CSAT escalation hook | backend-engineer | 5 | — | pending |
| sb-helper/crm-case-dashboard | BE-503 | feedback summary returns CES flag/scale | backend-engineer | 5 | — | pending |
| sb-helper/crm-case-dashboard | FE-504 | LIFF CES question toggle | frontend-engineer | 5 | — | pending |
| sb-helper/crm-case-dashboard | BE-505 | unit tests for metric/CSAT helpers | backend-engineer | 5 | — | pending |
