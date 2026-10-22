# timetableai — Review Round 24 — FE-023

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (FE-023 implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 24

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-023 | PASS |

ผลการตรวจสอบ FE-023 (Solver/validateDrop enforce continuity + subjectGroups, single parser, BR-53 warnings):
- `Class Continuity (DES-012, BR-29..32, BR-52..53)`:
  - ตัวแปลงข้อมูล `parseSubjectSettingsExtra` และ `serializeSubjectSettingsExtra` รองรับทั้ง legacy array และ new object structure พร้อม preserve extra fields อย่างสมบูรณ์ ไม่ overwrite หรือลบข้อมูลส่วนอื่น
  - Solver และ validateDrop บังคับใช้ contiguous block (N คาบติดกันโดยไม่มีคาบพักคั่น) ตาม BR-29
  - การกระทำบนตาราง (drag, drop, lock, unlock, delete) ทำงานเป็น atomic whole-block
- `Subject Groups (DES-017, BR-62..65, VR-17)`:
  - `validateSubjectGroups` ตรวจสอบความถูกต้องของกลุ่มวิชา (ชื่อไม่ซ้ำ, รหัสวิชาไม่ซ้ำ, จำนวนวิชา) ป้องกันคำขอผิดพลาดก่อนเรียก Save
  - ข้อจำกัดการลงตารางของกลุ่มวิชาบังคับใช้ถูกต้องใน solver และ validateDrop
- `Validation & Error Handling`:
  - `saveSubjectSettingsExtra` รักษา message และ status จาก API ถูกต้อง, รองรับ 401 SessionExpired silent handler ตาม AC-066 และแสดง error เมื่อบันทึกไม่สำเร็จ
- `Checks & Verification`:
  - `npm run type-check` ผ่าน exit 0 (0 errors)
  - Scoped `eslint` บน changed files ผ่าน exit 0 (0 errors)
  - Approved SWC cache `npm run build` ผ่าน exit 0
  - Vitest test suite ผ่านครบ 98/98 files (1,156/1,156 tests passed, 0 failed), รวมทั้ง 37 tests ใน `timetable-fe023-continuity.test.tsx` และ `timetable-fe023-subject-groups.test.tsx`

## Reviewed

- `src/app/[locale]/timetable/subject-settings/[year]/page.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts`
- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/timetable-helpers.ts`
- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/subject-constraints.ts`
- `src/lib/timetable-subject-settings-extra.ts`
- `tests/integration/timetable-fe023-continuity.test.tsx`
- `tests/integration/timetable-fe023-subject-groups.test.tsx`
- `tests/integration/timetable-401-silent-subject-settings.test.tsx`

## Change Log

- 2026-10-11 — Round 24 — FE-023 PASS (Class continuity & subject groups constraints, whole-block operations, single parser preservation, error reporting verified; 1,156 tests passing; no new findings)

Back-links: `plan\index.md` · `..\index.md`
