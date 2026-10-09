# crm-case-dashboard — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-101, BE-102, BE-103, BE-104, FE-105, FE-106, FE-107, BE-201, BE-202, BE-203, BE-204, BE-205, FE-206, FE-207, FE-208, BE-301, BE-302, BE-303, BE-304, FE-305, FE-306, FE-307, FE-308, BE-401, BE-402, BE-403, BE-404, BE-405, BE-406, BE-407, FE-408, FE-409, BE-501, BE-502, BE-503, FE-504, BE-505
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Constants & Settings Pages (display-only) | BE-101, BE-102, BE-103, BE-104, FE-105, FE-106, FE-107 | — |
| 2 | Dashboard Aggregation API + Wiring | BE-201, BE-202, BE-203, BE-204, BE-205, FE-206, FE-207, FE-208 | — |
| 3 | Groups & Schools Drill-down | BE-301, BE-302, BE-303, BE-304, FE-305, FE-306, FE-307, FE-308 | — |
| 4 | Insights (TCrmKnowledgeEntry `INSIGHT_*`) | BE-401, BE-402, BE-403, BE-404, BE-405, BE-406, BE-407, FE-408, FE-409 | — |
| 5 | CSAT Loop Enhancements (reuse ลูปเดิม) | BE-501, BE-502, BE-503, FE-504, BE-505 | — |

## Tasks

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-101 | SLA settings constant | backend-engineer | 1 | — | verified |
| BE-102 | CSAT settings constant | backend-engineer | 1 | — | verified |
| BE-103 | GET /settings/sla read endpoint | backend-engineer | 1 | — | verified |
| BE-104 | GET /settings/csat read endpoint | backend-engineer | 1 | — | verified |
| FE-105 | settings/sla page display-only | frontend-engineer | 1 | — | verified |
| FE-106 | settings/csat page display-only | frontend-engineer | 1 | — | verified |
| FE-107 | remove unused settings mock data | frontend-engineer | 1 | — | verified |
| BE-201 | dashboard endpoint scaffold | backend-engineer | 2 | — | verified |
| BE-202 | dashboard metrics repository | backend-engineer | 2 | — | verified |
| BE-203 | MTTR + CSAT aggregation rules | backend-engineer | 2 | — | verified |
| BE-204 | subsystem tiles + type breakdown buckets | backend-engineer | 2 | — | verified |
| BE-205 | top urgent cases payload | backend-engineer | 2 | — | verified |
| FE-206 | wire dashboard cards to GET /dashboard | frontend-engineer | 2 | — | verified |
| FE-207 | dashboard card details (theme/buckets/badges) | frontend-engineer | 2 | — | verified |
| FE-208 | dashboard filter bar (segmented days) | frontend-engineer | 2 | — | verified |
| BE-301 | GET /groups/[type] ranked list | backend-engineer | 3 | — | verified |
| BE-302 | GET /groups/[type]/[groupId] detail + cases | backend-engineer | 3 | — | verified |
| BE-303 | GET /cases/[id] case detail | backend-engineer | 3 | — | verified |
| BE-304 | GET /schools + /schools/[schoolId] | backend-engineer | 3 | — | verified |
| FE-305 | groups/[type] page wiring | frontend-engineer | 3 | — | pending |
| FE-306 | group detail + case detail pages wiring | frontend-engineer | 3 | — | pending |
| FE-307 | schools route [schoolName] → [schoolId] + wiring | frontend-engineer | 3 | — | pending |
| FE-308 | sidebar path check after refactor | frontend-engineer | 3 | — | pending |
| BE-401 | prerequisite: INSIGHT_% filter at crm-ai-support retrieval | backend-engineer | 4 | — | pending |
| BE-402 | insight AnswerBody Zod schemas | backend-engineer | 4 | — | verified |
| BE-403 | insights.repository.ts CRUD on TCrmKnowledgeEntry | backend-engineer | 4 | — | pending |
| BE-404 | bottlenecks endpoints | backend-engineer | 4 | — | pending |
| BE-405 | recurring-tasks endpoints + sopStatus derive | backend-engineer | 4 | — | pending |
| BE-406 | feature-requests endpoints + live derive counts | backend-engineer | 4 | — | pending |
| BE-407 | insight API spec docs | backend-engineer | 4 | — | pending |
| FE-408 | insights page + forms + permission-gated buttons | frontend-engineer | 4 | — | pending |
| FE-409 | delete insights mock data | frontend-engineer | 4 | — | pending |
| BE-501 | CSAT repeat suppress helper | backend-engineer | 5 | — | pending |
| BE-502 | CSAT escalation hook | backend-engineer | 5 | — | pending |
| BE-503 | feedback summary returns CES flag/scale | backend-engineer | 5 | — | pending |
| FE-504 | LIFF CES question toggle | frontend-engineer | 5 | — | pending |
| BE-505 | unit tests for metric/CSAT helpers | backend-engineer | 5 | — | pending |

## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
