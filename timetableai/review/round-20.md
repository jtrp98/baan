# timetableai — Review Round 20 — FE-025

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (REV-019, REV-020 ได้รับการแก้ไขและตรวจสอบแล้ว; REV-021..REV-023 คงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-019 | Important | `…/_lib/use-select-curriculum.ts:134` | frontend-engineer | resolved |
| REV-020 | Important | `…/settings/[year]/page.tsx:712` | frontend-engineer | resolved |
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 20

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-025 | PASS |

ผลการตรวจสอบข้อแก้รอบ 20:
- `REV-019` (resolved): ใน `use-select-curriculum.ts` คำนวณ `planClassesAll = unionPlanClasses(plans)` และสร้าง `eligibleClassesMap` ให้ครูทุกคนจาก union ของห้องเรียนทุกแผนก่อน map แสดงผล ทำให้ไม่ถูกแผนสุดท้ายเขียนทับ สอดคล้องกับ AC-045 / DES-015 BR-41 และตรงกับพฤติกรรมของ restore flow มี integration test ครอบคลุมใน `tests/integration/timetable-fe025-eligibility.test.tsx`
- `REV-020` (resolved): ใน `settings/[year]/page.tsx` ส่ง `teacherOptions` และ `preselectedTeacherId={editingIndividualIndex === null ? pendingIndividualTeacherId : null}` ให้กับ `SetIndividuallyModal` และใน `set-individually-modal.tsx` รองรับ `preselectedTeacherId` เมื่อไม่มี `initialData` ทำให้สามารถเพิ่มเพดานรายคนให้ครูใหม่และกดบันทึกได้จริง สอดคล้องกับ AC-043 / AC-043a และ UX-011 มี integration test ครอบคลุมใน `tests/integration/timetable-fe025-teaching-settings.test.tsx`
- Scoped eslint และ type-check ผ่าน exit 0 ไม่มี lint error

## Reviewed

- `FE/src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts`
- `FE/src/app/[locale]/timetable/settings/[year]/page.tsx`
- `FE/src/components/modals/home/create-teaching-schedule/set-individually-modal.tsx`
- `FE/tests/integration/timetable-fe025-eligibility.test.tsx`
- `FE/tests/integration/timetable-fe025-teaching-settings.test.tsx`

## Change Log

- 2026-10-11 — Round 20 — FE-025 PASS (REV-019, REV-020 resolved; ไม่มี finding ใหม่; REV-021..023 คง backlog)

Back-links: `plan\index.md` · `..\index.md`
