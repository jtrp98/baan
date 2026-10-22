# timetableai — Review Round 23 — BE-011

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (BE-011 implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 23

**Verdict:** PASS

| Task | Verdict |
|---|---|
| BE-011 | PASS |

ผลการตรวจสอบ BE-011 (Timetable Copy Backend — `Timetable/Copy/Preview|Apply`):
- `Endpoint Contracts & Models (§35.2, §35.3)`:
  - `RequestCopyPreview` และ `RequestCopyApply` สืบทอด `RequestBase` (`nSchoolID`, `nTeacherID`) พร้อมฟิลด์ `scope`, `src`, `dst`, `lstTimetableIDs`, `sPreviewToken`, `isConfirmOverwrite`, `isConfirmPartial`
  - มี endpoint `[HttpPost("Timetable/Copy/Preview")]` และ `[HttpPost("Timetable/Copy/Apply")]` ใน `WebAPIController.cs`
- `Validation Order (§35.8, fail-closed)`:
  - ลำดับการตรวจสอบถูกจัดเรียงตามสเปกอย่างเคร่งครัด:
    1. `InvalidCopyScope` (scope ไม่ถูกต้อง หรือระบุ `lstTimetableIDs` สำหรับ scope ที่ไม่ใช่ `all`, หรือ `lstTimetableIDs` ไม่ได้อยู่ใน school/src)
    2. `TermNotInYear` (VR-8: เทอมต้นทางหรือปลายทางไม่มีใน `TTerm` ของโรงเรียน)
    3. `NothingToCopy` (ต้นทางไม่มี artifacts สำหรับ scope นั้น)
    4. `DestinationChanged` (ใน Apply: previewToken ว่างหรือไม่ตรงกับ fingerprint ของ destination ปัจจุบัน)
    5. `MissingTemplate` (BR-67: เมื่อ copy subjectConditions หรือ teacherConditions แต่ปลายทางไม่มี template ชื่อเดียวกัน)
    6. `DependentsWouldBeOrphaned` (BR-70: เมื่อ copy classPeriods แต่ปลายทางมี dependents ผูกกับ template ปัจจุบันอยู่แล้ว)
    7. `ConfirmationRequired` (BR-66: ปลายทางมี artifacts อยู่เดิมและไม่ได้ยืนยัน overwrite)
    8. `PartialMatchConfirmationRequired` (BR-68: มีห้องเรียน/หลักสูตรที่ไม่ตรงกันและไม่ได้ยืนยัน partial match)
- `Security Policy & Tenant Isolation`:
  - `TimetableEndpointPolicy.cs` ผูกทั้งสอง endpoint ด้วย `EndpointAccessType.CopyScopeWrite`
  - `TimetableAuthorizationFilter.cs` จัดการ validation ของ `scope` ล่วงหน้า (invalid คืน HTTP 200 `{ status: 0, message: "InvalidCopyScope" }` ก่อน resolve สิทธิ์)
  - แม็ป `M(scope)` ตามสเปก: `all` → 401, `systemConditions` → 403, `subjectConditions` → 422, `classPeriods` → 404, `teacherConditions` → 402
  - บังคับตรวจทั้ง read และ write permission บน `M(scope)` (403 หากไม่มีสิทธิ์) และ tenant isolation ป้องกันข้ามโรงเรียน
- `Transactional Atomicity & Non-Destructive Copy`:
  - `ApplyCopy` ทำงานภายใต้ single DB transaction (`BeginTransactionAsync` / rollback เมื่อล้มเหลว)
  - Soft-deletes ข้อมูลปลายทางเดิมเฉพาะส่วนของโมดูลตามลำดับ
  - คำนวณ re-pointing foreign keys สำหรับ Class Periods, Period Configs, Timetables, Timetable Classes
  - คงค่า snapshot subject lists และไม่แตะต้อง capacity/caretakers ใน School DB (C1′ read-only) และไม่แตะต้อง `Tbl_TeacherClassAssignment`
- `Test Coverage`:
  - ชุดทดสอบ `CopyBackendTests.cs` (11 tests) ครอบคลุม error conditions ครบทั้ง 8 กรณี, successful flows ทุก scope, partial match logic, และ security filter; ผลการรัน `dotnet test` ผ่านครบ 275/275 tests (0 failed)

## Reviewed

- `AITimeTableBackend/Models/Request.cs`
- `AITimeTableBackend/Security/TimetableEndpointPolicy.cs`
- `AITimeTableBackend/Security/TimetableAuthorizationFilter.cs`
- `AITimeTableBackend/Helpers/TimetableCopyHelper.cs`
- `AITimeTableBackend/Controllers/WebAPIController.cs`
- `AITimeTableBackend.Tests/CopyBackendTests.cs`

## Change Log

- 2026-10-11 — Round 23 — BE-011 PASS (Copy Preview/Apply endpoints, TimetableCopyHelper validation pipeline, single-tx atomicity, M(scope) security authorization filter, verified with 275 passing tests; no new findings)

Back-links: `plan\index.md` · `..\index.md`
