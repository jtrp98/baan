# timetableai — Review Round 25 — FE-022

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (FE-022 implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 25

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-022 | PASS |

ผลการตรวจสอบ FE-022 (Copy UI on 5 entry points + proxies, read real results, OD-1 decision):
- `5 Entry Points (UX-008, REQ-013 AC-029..AC-030)`:
  - `/timetable` → ล็อกขอบเขต `scope: all` (คัดลอกทุกกติกา + ตารางสอนที่สร้างเสร็จแล้ว)
  - `/timetable/manage-timetable` → ล็อกขอบเขต `scope: teacherConditions`
  - `/timetable/settings` → ล็อกขอบเขต `scope: systemConditions`
  - `/timetable/create-class-period` → ล็อกขอบเขต `scope: classPeriods`
  - `/timetable/subject-settings` → ล็อกขอบเขต `scope: subjectConditions`
  - ทุกจุดเข้ามี Action Bar trigger button และ row trigger button เรียก `TimetableCopyModal` พร้อม scope ที่ถูกต้อง
- `Proxies & Endpoints`:
  - `/api/timetable/copy/preview` เชื่อมต่อไปยัง `/WebAPI/Timetable/Copy/Preview` ผ่าน `proxyToBackend`
  - `/api/timetable/copy/apply` เชื่อมต่อไปยัง `/WebAPI/Timetable/Copy/Apply` ผ่าน `proxyToBackend`
  - ไม่มีทางลัดข้าม Preview: Apply บังคับใช้ `sPreviewToken` จาก Preview เท่านั้น
- `Preview Validation & Blockers (BR-67, BR-68, BR-70, AC-031)`:
  - ตรวจสอบ `lstMissingTemplates` (BR-67) บล็อกปุ่ม Apply และแสดงเหตุผลชัดเจน
  - ตรวจสอบ `lstDependents` (BR-70) บล็อกปุ่ม Apply และแสดงเหตุผลชัดเจน
  - กรณีปลายทางมีข้อมูล บังคับติ๊กรับทราบการเขียนทับ (`isConfirmOverwrite`) ก่อนปลดล็อก Apply
  - กรณีมีรายการจับคู่ไม่ได้ (`lstUnmatched` / BR-68) บังคับติ๊กยืนยันคัดลอกเฉพาะส่วนที่จับคู่ได้ (`isConfirmPartial`)
- `Result Presentation & OD-1 Decision (AC-032, OD-1 signed jtrp98 2026-10-11)`:
  - อ่านผลลัพธ์จริงจาก backend (`lstCreated`, `lstOverwritten`, `lstSkipped`)
  - คัดลอกสำเร็จแล้วผู้ใช้อยู่ที่หน้าเดิม แสดงสรุปผลลัพธ์ และมีปุ่มเลือกไปปี/เทอมปลายทางตามต้องการ ไม่เปลี่ยน context อัตโนมัติ
- `Checks & Verification`:
  - `npm run type-check` ผ่าน exit 0 (0 errors)
  - Scoped `eslint` บน changed files ผ่าน exit 0 (0 errors, 0 warnings)
  - Approved SWC cache `npm run build` ผ่าน exit 0
  - Vitest test suite ผ่านครบ 99/99 files (1,165/1,165 tests passed, 0 failed), รวมทั้ง 9 tests ใน `timetable-fe022-copy.test.tsx`

## Reviewed

- `src/app/[locale]/timetable/timetable-copy-modal.tsx`
- `src/app/[locale]/timetable/_components/timetable-year-list-page.tsx`
- `src/app/[locale]/timetable/page.tsx`
- `src/app/[locale]/timetable/manage-timetable/page.tsx`
- `src/app/[locale]/timetable/settings/page.tsx`
- `src/app/[locale]/timetable/create-class-period/page.tsx`
- `src/app/[locale]/timetable/subject-settings/page.tsx`
- `src/app/api/timetable/copy/preview/route.ts`
- `src/app/api/timetable/copy/apply/route.ts`
- `messages/th.json`
- `messages/en.json`
- `tests/integration/timetable-fe022-copy.test.tsx`

## Change Log

- 2026-10-11 — Round 25 — FE-022 PASS (Copy UI on 5 entry points, locked scopes, preview/apply flow, blockers, overwrite/partial confirmations, OD-1 destination navigation choice verified; 1,165 tests passing; no new findings)

Back-links: `plan\index.md` · `..\index.md`
