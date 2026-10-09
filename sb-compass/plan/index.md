# sb-compass — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-001, BE-002, BE-003, BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012, BE-014, BE-015, BE-016, BE-017, BE-018, BE-019, FE-001, FE-002
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Module A — Score Aggregation (REQ-012) | BE-001, BE-002, BE-003 | — |
| 2 | Module B — Premium Entitlement & API Authorization (REQ-013, REQ-014, REQ-015) 🔒 Security gate | BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012 | 🔒 security gate |
| 3 | Module C — National Stats Alignment (REQ-004 × REQ-012 + REQ-017 + DES-012) | BE-014, BE-015, BE-016, BE-017 | — |
| 4 | Module D — Premium Subject Breakdown (REQ-016) | BE-018, BE-019, FE-001 | — |
| 5 | MyCompass Consolidation — Wording Scope Only (REQ-019, WORD-01 extension) 🔒 Security gate n/a | FE-002 | 🔒 security gate |

## Tasks

| Task | Name | Owner | Phase | Depends | Status |
|---|---|---|---|---|---|
| BE-001 | Add AggregateByCanonicalSubjectWeighted to CompassScoreService | backend-engineer | 1 | — | verified |
| BE-002 | Switch calculate/score to the weighted method with 2-decimal rounding | backend-engineer | 1 | BE-001 | verified |
| BE-003 | Switch GetSubjectAveragesAsync to the weighted method and preserve 2-decimal rounding in Gap Report (ISS-01) | backend-engineer | 1 | BE-001 | verified |
| BE-013 | Verify SB PLUS column names for TSubscription and TPlan_Feature (PRE-05) | backend-engineer | 2 | — | verified |
| BE-004 | Implement CheckEntitlement steps 1-3 (fail-closed, parameterized SQL) | backend-engineer | 2 | BE-013 | verified |
| BE-005 | Gate Premium endpoints with compass_premium (HTTP 403, Data = null) | backend-engineer | 2 | BE-004 | verified |
| BE-006 | Field-level gating at analyst/{sID}: Boost null without entitlement | backend-engineer | 2 | BE-004 | verified |
| BE-007 | Gate recompute/* with compass_admin_ops entitlement | backend-engineer | 2 | BE-004 | verified |
| BE-008 | IP/internal-network allowlist in front of recompute/* | backend-engineer | 2 | — | verified |
| BE-009 | AI_exercise/path: identity from JWT only | backend-engineer | 2 | — | verified |
| BE-010 | AI_exercise/submit: identity from JWT only | backend-engineer | 2 | — | verified |
| BE-011 | certificate/issue: identity-only fix | backend-engineer | 2 | — | verified |
| BE-012 | Gate the three debug endpoints with compass_admin_ops | backend-engineer | 2 | BE-004 | verified |
| BE-014 | Batch recompute: weighted scores + StddevScore + PascalCase rename | backend-engineer | 3 | BE-001 | verified |
| BE-015 | RecomputeAsync OverallAvg from already-weighted values | backend-engineer | 3 | BE-014 | verified |
| BE-016 | RecomputeAsync MeanScore per level x subject from weighted values | backend-engineer | 3 | BE-014 | verified |
| BE-017 | GetStudentNationalStatsAsync: request-time overall matches batch formula | backend-engineer | 3 | BE-001 | verified |
| BE-018 | Add VMCourseBreakdown and VMSubjectStat.Courses | backend-engineer | 4 | BE-001 | verified |
| BE-019 | Assemble Courses in calculate/score after the premium check | backend-engineer | 4 | BE-018, BE-005 | verified |
| FE-001 | Premium subject-breakdown screen reading Courses | frontend-engineer | 4 | BE-019 | verified |
| FE-002 | Fix WORD-01-violating wording in the MyCompass mockup | frontend-engineer | 5 | — | verified |

## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `..\index.md`
