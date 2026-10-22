# timetableai — QA Round 6 — BE-010

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ถูกแทนคงอยู่เป็นไฟล์ของตัวเอง verbatim (ไฟล์เก่า = archive) · live Open Issues / Unverified Behaviour ให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|

## Round 6

**Status:** ✅ Verified

### Checks run

| Check | Command | Result |
|---|---|---|
| build | `dotnet build AITimeTableBackend.sln` | pass (0 errors) |
| test | `dotnet test AITimeTableBackend.sln` | pass (125/125 passed) |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-010 | verified | `AITimeTableBackend/Controllers/WebAPIController.cs:55-78, 458-520, 707-730, 2810-2825`, `AITimeTableBackend.Tests/TermValidationTests.cs` (16 tests pass, 125 total pass) |

### Data Model check

- `Tbl_Setting.sTermID`: `string?` (additive varchar NULL) — ตรง `design\des-009.md` §27.5
- `Tbl_ClassPeriod.sTermID`: `string?` (additive varchar NULL) — ตรง `design\des-009.md` §27.5
- `Tbl_TeacherClassAssignment.sTermID`: `string?` (additive varchar NULL) — ตรง `design\des-009.md` §27.5
- `Tbl_Timetable.sTermID`: `string?` (additive varchar NULL) — ตรง `design\des-009.md` §27.5
- `Request.cs`: `sTermID` เพิ่มบน Request Models ของ SetSetting, SetClassPeriod, SetTeacherClassAssignment, SetTimetable, SetAllTimetables — ตรงกับสัญญา

### Issues Found (defect packet)

None.

## Unverified Behaviour — undeployed phases

- Phase 8 (BE-010 / REQ-012): การรัน DDL บนฐานข้อมูลจริง (Waiting on Human #2: DDL `sTermID` บน 4 ตารางราก) และ backfill ข้อมูล legacy เป็นของ DevOps ก่อน deploy จริง

## Change Log

- 2026-10-09 — Round 6 (BE-010) — ✅ Verified (VR-8, VR-9, BR-17a, School DB term filter, model sTermID ผ่านการทดสอบอัตโนมัติครบ 125/125 assertions)

Back-links: `plan\index.md` · `..\index.md`
