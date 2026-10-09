# crm-ai-support — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-101, BE-102, BE-103, BE-104, BE-105, BE-106, BE-107, BE-108, BE-109, BE-110, BE-111, BE-112, BE-113, BE-114, FE-115, FE-116, FE-117, FE-118, FE-119, FE-120, FE-121, FE-122, FE-123, FE-124, FE-125, FE-126, BE-127, BE-128, BE-129, BE-130, BE-131, BE-132, BE-133, BE-134, BE-135, BE-136, FE-137, FE-138, FE-139, BE-140, BE-141, BE-142, BE-143, FE-144, BE-145, BE-146, BE-147, BE-148, BE-149, BE-150, BE-201, BE-202, BE-203, BE-204, BE-205, BE-206, BE-207, BE-208, BE-209, BE-210, BE-211, FE-212, FE-213, FE-214, FE-215, FE-216, FE-217, FE-218, FE-219, FE-220, BE-301, BE-302, BE-303, BE-304, BE-305, BE-306, BE-307, BE-308, BE-309, BE-310, FE-311, FE-312, FE-313, FE-314, FE-315, FE-316, FE-317, FE-318, FE-319, BE-320, BE-321, BE-322, BE-323, BE-324, BE-325, BE-326, BE-327, BE-328, BE-329, BE-330, BE-331, BE-332, BE-333, BE-334, BE-335, BE-336, BE-337, BE-338, BE-339, FE-340, FE-341, FE-342, FE-343, FE-344, BE-401, BE-402, BE-403, BE-404, FE-405, FE-406, FE-407, FE-408, FE-409, BE-410, BE-411, BE-412, BE-413, BE-414, BE-415, BE-416, BE-417, BE-418, BE-419, FE-420, FE-421, FE-422, FE-423, BE-424, BE-425, BE-426, BE-427, BE-428, FE-429, FE-430, FE-431, FE-432, FE-433
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Case Classification & Safety 🔒 Security gate | BE-101, BE-102, BE-103, BE-104, BE-105, BE-106, BE-107, BE-108, BE-109, BE-110, BE-111, BE-112, BE-113, BE-114, FE-115, FE-116, FE-117, FE-118, FE-119, FE-120, FE-121, FE-122, FE-123, FE-124, FE-125, FE-126, BE-127, BE-128, BE-129, BE-130, BE-131, BE-132, BE-133, BE-134, BE-135, BE-136, FE-137, FE-138, FE-139, BE-140, BE-141, BE-142, BE-143, FE-144, BE-145, BE-146, BE-147, BE-148, BE-149, BE-150 | 🔒 security gate |
| 2 | Issue & Knowledge Management | BE-201, BE-202, BE-203, BE-204, BE-205, BE-206, BE-207, BE-208, BE-209, BE-210, BE-211, FE-212, FE-213, FE-214, FE-215, FE-216, FE-217, FE-218, FE-219, FE-220 | — |
| 3 | Feature Registry, Menu Relation & Learning Loop | BE-301, BE-302, BE-303, BE-304, BE-305, BE-306, BE-307, BE-308, BE-309, BE-310, FE-311, FE-312, FE-313, FE-314, FE-315, FE-316, FE-317, FE-318, FE-319, BE-320, BE-321, BE-322, BE-323, BE-324, BE-325, BE-326, BE-327, BE-328, BE-329, BE-330, BE-331, BE-332, BE-333, BE-334, BE-335, BE-336, BE-337, BE-338, BE-339, FE-340, FE-341, FE-342, FE-343, FE-344 | — |
| 4 | Queue Interrupt & Customer Promise | BE-401, BE-402, BE-403, BE-404, FE-405, FE-406, FE-407, FE-408, FE-409, BE-410, BE-411, BE-412, BE-413, BE-414, BE-415, BE-416, BE-417, BE-418, BE-419, FE-420, FE-421, FE-422, FE-423, BE-424, BE-425, BE-426, BE-427, BE-428, FE-429, FE-430, FE-431, FE-432, FE-433 | — |

## Tasks

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-101 | 3 คอลัมน์จำแนกบน TCrmSupport | backend-engineer | 1 | — | verified |
| BE-102 | model TCrmCaseAiAssessment | backend-engineer | 1 | — | verified |
| BE-103 | model TCrmSafetyKeyword | backend-engineer | 1 | — | verified |
| BE-104 | model TCrmAiDecisionLog (append-only) | backend-engineer | 1 | — | verified |
| BE-105 | PERMISSIONS.CRM_AI_CS/SA/PM | backend-engineer | 1 | — | verified |
| BE-106 | CRM_SLA_RULES constant (v1) | backend-engineer | 1 | — | verified |
| BE-107 | POST /safety-keywords | backend-engineer | 1 | — | verified |
| BE-108 | GET /safety-keywords list | backend-engineer | 1 | — | verified |
| BE-109 | PATCH /safety-keywords/[id] | backend-engineer | 1 | — | verified |
| BE-110 | DELETE /safety-keywords/[id] | backend-engineer | 1 | — | verified |
| BE-111 | POST /cases/[id]/classify pipeline | backend-engineer | 1 | — | verified |
| BE-112 | GET /review-queue | backend-engineer | 1 | — | verified |
| BE-113 | PATCH /review-queue/[id] confirm/override | backend-engineer | 1 | — | verified |
| BE-114 | GET /decision-log audit trail | backend-engineer | 1 | — | verified |
| FE-115 | เมนู ตรวจสอบการจำแนกเคส AI | frontend-engineer | 1 | — | verified |
| FE-116 | scaffold review-queue page | frontend-engineer | 1 | — | verified |
| FE-117 | case-review-filter component | frontend-engineer | 1 | — | verified |
| FE-118 | case-review-table component | frontend-engineer | 1 | — | verified |
| FE-119 | case-review-detail-drawer component | frontend-engineer | 1 | — | verified |
| FE-120 | use-case-review-store | frontend-engineer | 1 | — | verified |
| FE-121 | case-review-service API layer | frontend-engineer | 1 | — | verified |
| FE-122 | scaffold safety-keywords page | frontend-engineer | 1 | — | verified |
| FE-123 | safety-keyword table + form modal | frontend-engineer | 1 | — | verified |
| FE-124 | safety-keyword store + service | frontend-engineer | 1 | — | verified |
| FE-125 | ผูกสิทธิ์ 2 หน้าเข้า permission page | frontend-engineer | 1 | — | verified |
| FE-126 | auto-trigger classify หลัง createCase | frontend-engineer | 1 | — | verified |
| BE-127 | ค่า REJECTED ทุกคอลัมน์ review status | backend-engineer | 1 | — | verified |
| BE-128 | menu catalog เข้า prompt จำแนก | backend-engineer | 1 | — | verified |
| BE-129 | anti-hallucination ของ menuId | backend-engineer | 1 | — | verified |
| BE-130 | เขียนผลจำแนกเมนูลง assessment/เคส | backend-engineer | 1 | — | verified |
| BE-131 | safety override path เรียก menu classification | backend-engineer | 1 | — | verified |
| BE-132 | แถว log MENU_CLASSIFICATION | backend-engineer | 1 | — | verified |
| BE-133 | ReviewCaseSchema รับ 3 มิติแยก | backend-engineer | 1 | — | verified |
| BE-134 | apply การตัดสินใจรายมิติ | backend-engineer | 1 | — | verified |
| BE-135 | POST /backfill ทีละชุด | backend-engineer | 1 | — | verified |
| BE-136 | GET /backfill remaining | backend-engineer | 1 | — | verified |
| FE-137 | drawer รีวิว 3 มิติแยก | frontend-engineer | 1 | — | verified |
| FE-138 | คอลัมน์เมนูในตารางรีวิว | frontend-engineer | 1 | — | verified |
| FE-139 | backfill panel + progress | frontend-engineer | 1 | — | verified |
| BE-140 | menu-only path (Mode B) | backend-engineer | 1 | — | verified |
| BE-141 | ค่า MenuReviewStatus NO_MENU | backend-engineer | 1 | — | verified |
| BE-142 | backfill query แยก Mode A/B | backend-engineer | 1 | — | verified |
| BE-143 | SeverityReviewStatus จาก confidence ตัวเอง | backend-engineer | 1 | — | verified |
| FE-144 | แสดง NO_MENU แยกจากยังไม่จำแนก | frontend-engineer | 1 | — | verified |
| BE-145 | BACKFILL_CLOSED_ALIASES constant | backend-engineer | 1 | — | verified |
| BE-146 | overrideReviewStatuses เฉพาะมิติรอตรวจ | backend-engineer | 1 | — | verified |
| BE-147 | priority score v2 constant | backend-engineer | 1 | — | verified |
| BE-148 | query นับ distinctSchoolCount | backend-engineer | 1 | — | verified |
| BE-149 | ย้าย call site ไป v2 ทั้ง 3 จุด | backend-engineer | 1 | — | verified |
| BE-150 | อัปเดต spec ของ crm-sla-rule | backend-engineer | 1 | — | verified |
| BE-201 | model TCrmIssue | backend-engineer | 2 | — | verified |
| BE-202 | model TCrmKnowledgeEntry | backend-engineer | 2 | — | verified |
| BE-203 | POST /issues (SA/PM) | backend-engineer | 2 | — | verified |
| BE-204 | GET /issues list | backend-engineer | 2 | — | verified |
| BE-205 | GET /issues/[id] detail | backend-engineer | 2 | — | verified |
| BE-206 | PATCH /issues/[id] + DecisionReason | backend-engineer | 2 | — | verified |
| BE-207 | POST /issues/[id]/link-case | backend-engineer | 2 | — | verified |
| BE-208 | POST /knowledge (DRAFT) | backend-engineer | 2 | — | verified |
| BE-209 | GET /knowledge list | backend-engineer | 2 | — | verified |
| BE-210 | PATCH /knowledge/[id] approve | backend-engineer | 2 | — | verified |
| BE-211 | wire knowledge retrieval เข้า classify (QA) | backend-engineer | 2 | — | verified |
| FE-212 | scaffold issues page (SA/PM) | frontend-engineer | 2 | — | verified |
| FE-213 | issue table + detail drawer | frontend-engineer | 2 | — | verified |
| FE-214 | issue-link-case modal | frontend-engineer | 2 | — | verified |
| FE-215 | issue store + service | frontend-engineer | 2 | — | verified |
| FE-216 | scaffold knowledge page (CS-facing) | frontend-engineer | 2 | — | verified |
| FE-217 | knowledge table + form modal | frontend-engineer | 2 | — | verified |
| FE-218 | knowledge store + service | frontend-engineer | 2 | — | verified |
| FE-219 | เมนู จัดการเรื่อง/ความรู้ AI | frontend-engineer | 2 | — | verified |
| FE-220 | ผูกสิทธิ์หน้าเรื่อง/ความรู้ | frontend-engineer | 2 | — | verified |
| BE-301 | PERMISSIONS.CRM_AI_UX_UI/DEV/SALES | backend-engineer | 3 | — | verified |
| BE-302 | ตรวจ model TCrmProductFeature | backend-engineer | 3 | — | verified |
| BE-303 | POST /product-features (PM) | backend-engineer | 3 | — | verified |
| BE-304 | GET /product-features list | backend-engineer | 3 | — | verified |
| BE-305 | GET /product-features/[id] | backend-engineer | 3 | — | verified |
| BE-306 | PATCH /product-features/[id] | backend-engineer | 3 | — | verified |
| BE-307 | ตรวจ model TCrmMenuRelation | backend-engineer | 3 | — | verified |
| BE-308 | POST /menu-relations (DECLARED) | backend-engineer | 3 | — | verified |
| BE-309 | GET /menu-relations list | backend-engineer | 3 | — | verified |
| BE-310 | PATCH /menu-relations/[id] confirm/reject | backend-engineer | 3 | — | verified |
| FE-311 | เมนู ฟีเจอร์ที่วางแผนไว้ | frontend-engineer | 3 | — | verified |
| FE-312 | scaffold product-features page | frontend-engineer | 3 | — | verified |
| FE-313 | product-feature table + form modal | frontend-engineer | 3 | — | verified |
| FE-314 | product-feature store + service | frontend-engineer | 3 | — | verified |
| FE-315 | เมนู ความสัมพันธ์ระหว่างเมนู | frontend-engineer | 3 | — | verified |
| FE-316 | scaffold menu-relations page | frontend-engineer | 3 | — | verified |
| FE-317 | menu-relation table + form modal | frontend-engineer | 3 | — | verified |
| FE-318 | menu-relation store + service | frontend-engineer | 3 | — | verified |
| FE-319 | ผูกสิทธิ์หน้า feature/menu-relation | frontend-engineer | 3 | — | verified |
| BE-320 | ตรวจ model TCrmAiSuggestion | backend-engineer | 3 | — | verified |
| BE-321 | GET /ai-suggestions inbox | backend-engineer | 3 | — | verified |
| BE-322 | PATCH /ai-suggestions/[id] accept/reject | backend-engineer | 3 | — | verified |
| BE-323 | REJECTED ไม่เขียน decision log | backend-engineer | 3 | — | verified |
| BE-324 | accept ซ้ำ → AppError(409) | backend-engineer | 3 | — | verified |
| BE-325 | accept NEW_MENU_RELATION → แถว + log คู่ | backend-engineer | 3 | — | verified |
| BE-326 | accept MERGE_* → log คู่ ISSUE/DEDUP_MATCH | backend-engineer | 3 | — | verified |
| BE-327 | accept NEW/STALE_KNOWLEDGE → log คู่ | backend-engineer | 3 | — | verified |
| BE-328 | ค่าที่เหลือของแถวคู่ | backend-engineer | 3 | — | verified |
| BE-329 | detection threshold — แถวเดิม (ปลดล็อกแล้ว) | backend-engineer | 3 | — | verified |
| BE-330 | accept มีผลจริงตามกติกาข้อ 6 | backend-engineer | 3 | — | verified |
| BE-331 | prerequisite: log KNOWLEDGE_MATCH จากเส้นทางตอบ QA | backend-engineer | 3 | — | verified |
| BE-332 | crm-ai-suggestion-rule constant v1 | backend-engineer | 3 | — | verified |
| BE-333 | POST /ai-suggestions/detect | backend-engineer | 3 | — | verified |
| BE-334 | กฎ MERGE_ISSUE | backend-engineer | 3 | — | verified |
| BE-335 | กฎ MERGE_REQUEST (MenuId-only) | backend-engineer | 3 | — | verified |
| BE-336 | กฎ NEW_KNOWLEDGE | backend-engineer | 3 | — | verified |
| BE-337 | กฎ STALE_KNOWLEDGE | backend-engineer | 3 | — | verified |
| BE-338 | กฎ NEW_MENU_RELATION | backend-engineer | 3 | — | verified |
| BE-339 | กันแถวซ้ำ group_key + cooldown | backend-engineer | 3 | — | verified |
| FE-340 | เมนู กล่องข้อเสนอ AI | frontend-engineer | 3 | — | verified |
| FE-341 | scaffold ai-suggestions inbox page | frontend-engineer | 3 | — | verified |
| FE-342 | ai-suggestion table + detail drawer | frontend-engineer | 3 | — | verified |
| FE-343 | ai-suggestion store + service | frontend-engineer | 3 | — | verified |
| FE-344 | ผูกสิทธิ์หน้า inbox | frontend-engineer | 3 | — | verified |
| BE-401 | ตรวจ model TCrmQueueInterrupt | backend-engineer | 4 | — | verified |
| BE-402 | POST /queue-interrupts | backend-engineer | 4 | — | verified |
| BE-403 | GET /queue-interrupts list | backend-engineer | 4 | — | verified |
| BE-404 | BumpedItems snapshot ตอน POST | backend-engineer | 4 | — | verified |
| FE-405 | เมนู คำขอแทรกคิวงาน | frontend-engineer | 4 | — | verified |
| FE-406 | scaffold queue-interrupts page | frontend-engineer | 4 | — | verified |
| FE-407 | queue-interrupt table + form modal | frontend-engineer | 4 | — | verified |
| FE-408 | queue-interrupt store + service | frontend-engineer | 4 | — | verified |
| FE-409 | ผูกสิทธิ์หน้าแทรกคิว | frontend-engineer | 4 | — | verified |
| BE-410 | ตรวจ model TCrmCustomerPromise | backend-engineer | 4 | — | verified |
| BE-411 | POST /customer-promises (SALES) | backend-engineer | 4 | — | verified |
| BE-412 | GET /customer-promises list | backend-engineer | 4 | — | verified |
| BE-413 | GET /customer-promises/renewal-alerts | backend-engineer | 4 | — | verified |
| BE-414 | PATCH /customer-promises/[id] สถานะด้วยมือ | backend-engineer | 4 | — | verified |
| BE-415 | ContractRenewalAlertDate กรอกเอง + validate อนาคต | backend-engineer | 4 | — | verified |
| BE-416 | ตรวจ model TCrmStaffRole | backend-engineer | 4 | — | verified |
| BE-417 | POST /staff-roles (PM) | backend-engineer | 4 | — | verified |
| BE-418 | GET /staff-roles list | backend-engineer | 4 | — | verified |
| BE-419 | PATCH /staff-roles/[id] toggle Active | backend-engineer | 4 | — | verified |
| FE-420 | เมนู คำมั่นสัญญาลูกค้า | frontend-engineer | 4 | — | verified |
| FE-421 | scaffold customer-promises page | frontend-engineer | 4 | — | verified |
| FE-422 | customer-promise table + form (date picker) | frontend-engineer | 4 | — | verified |
| FE-423 | customer-promise store + service | frontend-engineer | 4 | — | verified |
| BE-424 | constant map สิทธิ์→บทบาท 6 คู่ | backend-engineer | 4 | — | verified |
| BE-425 | ฟังก์ชัน sync กลาง (findFirst+update/create) | backend-engineer | 4 | — | verified |
| BE-426 | hook: แก้สิทธิ์ role → sync ทุก user ของ role | backend-engineer | 4 | — | verified |
| BE-427 | hook: เปลี่ยน role_id ของ user → sync คนนั้น | backend-engineer | 4 | — | verified |
| BE-428 | POST /staff-roles/sync เต็มระบบ | backend-engineer | 4 | — | verified |
| FE-429 | เมนู จัดการบทบาทพนักงาน CRM AI | frontend-engineer | 4 | — | verified |
| FE-430 | scaffold staff-roles settings page | frontend-engineer | 4 | — | verified |
| FE-431 | staff-role table + form modal | frontend-engineer | 4 | — | verified |
| FE-432 | staff-role store + service | frontend-engineer | 4 | — | verified |
| FE-433 | ผูกสิทธิ์หน้าบทบาท 2 หน้า | frontend-engineer | 4 | — | verified |

## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
