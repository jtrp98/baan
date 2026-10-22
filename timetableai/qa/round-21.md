# timetableai — QA Round 21 — FE-025

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ถูกแทนคงอยู่เป็นไฟล์ของตัวเอง verbatim · live Open Issues / Unverified Behaviour ให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น
> F = C:/src/schoolbright/target/sb-tech-upgrade-web-system; B = C:/src/schoolbright/target/sb-api-academic-timetable-ai. วันที่ผู้ใช้ 2026-10-11 / jtrp98

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| — | — | — | ไม่มี active open issue ของ FE-025 (QA-006 resolved ใน QA16; REV-019, REV-020 resolved ใน review round 20) |

## Round 21

**Status:** ✅ Verified

Output PASS / FE-025 verified: checks จริงครบถ้วนตามเกณฑ์ solo mode: typecheck ผ่าน, scoped lint ผ่าน, approved SWC cache build exit 0, และ vitest tests ของ FE-025 และ integration tests ที่เกี่ยวข้องผ่านครบ 108/108 tests (REV-019 multi-plan eligibility union และ REV-020 new teacher individual hour caps ผ่านจริง).

### Checks run

| Check | Command | Result |
|---|---|---|
| typecheck | `npm run type-check` | pass exit 0 (tsc --noEmit) |
| scoped lint | `npx eslint src/app/[locale]/timetable/settings/[year]/page.tsx src/components/modals/home/create-teaching-schedule/set-individually-modal.tsx src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts src/app/[locale]/timetable/manage-teaching-schedule/_lib/teaching-caps.ts` | pass exit 0 |
| approved-cache build | process `SWC_NATIVE_BINDING_CACHE=\\?\C:\Users\jabja\.codex\visualizations\2026\10\09\01a1201c-fd22-72d1-8682-50bca437e488\swc-native-cache npm run build` | pass exit 0 (compiled, typed, static pages 77/77 generated) |
| tests (FE-025 write paths) | `npx vitest run tests/app/timetable/teaching-caps.test.ts tests/integration/timetable-fe025-eligibility.test.tsx tests/integration/timetable-fe025-teaching-settings.test.tsx tests/integration/timetable-401-silent.test.tsx tests/integration/timetable-401-silent-settings.test.tsx tests/integration/timetable-fe021-term-context.test.tsx` | pass exit 0 (6 files, 108/108 passed) |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| FE-025 | verified | AC-041..045, AC-043a/b, AC-046: 108 tests green, typecheck/build/lint pass, REV-019 และ REV-020 resolved ใน review round 20 |

### Data Model check

- `FE-025` อ่านและส่งฟิลด์ตาม contract จริงของ BE-013 (`nMaxTeachingHoursPerDay`, `nMaxTeachingHoursPerWeek`, `jHomeroomRestrictedTeachers`, `jSetMaxPeriodIndividually`, `homeroomResponsibility`) ตรงตาม `design\data-model.md` §27.6 และ DES-014/DES-015 ไม่ส่ง projection กลับใน Save และไม่แปลง/ไม่อ่านฟิลด์คาบเดิม

### Issues Found

- ไม่มี defect ใหม่ที่ขัดขวาง AC ในรอบนี้

## Unverified Behaviour — undeployed phases

- Phase 12: การทำงานร่วมกับ School DB จริงและการทดสอบ E2E ในเบราว์เซอร์จริงบน production 환경ยังไม่ได้ deploy (รอ release window และ cutover คู่กับ BE-013 ตาม SA-Q8)

## Change Log

- 2026-10-11 — Round 21 — FE-025 ✅ Verified (typecheck/lint/build/108 tests pass; REV-019, REV-020 resolved)

Back-links: `plan\index.md` · `..\index.md`
