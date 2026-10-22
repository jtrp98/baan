# timetableai — QA Round 22 — BE-012

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ถูกแทนคงอยู่เป็นไฟล์ของตัวเอง verbatim · live Open Issues / Unverified Behaviour ให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น
> B = C:/src/schoolbright/target/sb-api-academic-timetable-ai. วันที่ผู้ใช้ 2026-10-11 / jtrp98

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| — | — | — | ไม่มี active open issue ของ BE-012 |

## Round 22

**Status:** ✅ Verified

Output PASS / BE-012 verified: การตรวจสอบการทำงานและชุดทดสอบของ BE-012 (Rooms backend) ทำงานผ่านตามเกณฑ์ทั้งหมด:
- `dotnet build` ผ่าน exit 0 (0 errors)
- `dotnet test` ผ่าน exit 0 ครบ 258/258 tests (0 failed) รวมถึง 7 unit tests ใหม่ใน `RoomsBackendTests.cs`
- Read-only C1′ queries และ mapping module endpoints ปฏิบัติตาม contract และ fail-closed behavior ครบถ้วน

### Checks run

| Check | Command | Result |
|---|---|---|
| build | `dotnet build` | pass exit 0 (0 errors, 64 warnings) |
| tests | `dotnet test` | pass exit 0 (258/258 passed, 0 failed, Duration 11s) |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-012 | verified | AC-038, AC-038a, AC-039, AC-040: `RoomsBackendTests.cs` 7 tests green, `dotnet test` 258/258 green, DDL artifacts `class-setting-school-db.sql` และ `subject-room-module-db.sql` ตรวจสอบแล้ว |

### Data Model check

- `Tbl_SubjectRoom`: PK `nSubjectRoomID`, `nSchoolID`, `nYear`, `sTermID`, `sCourseCode`, `sRoomID` (varchar(10)), `isDeleted`, audit fields ตรงกับ `data-model.md §27.6 ก`
- `TClass` (read-only): PK `(SchoolID, sClassID)`, `sClass`, `cDel`, audit fields ตรงกับ School DB contract; ไม่ select หรือ expose `sClassIP` (data minimization DES-013 §38.1)
- `TClassSetting` (read-only): PK `(SchoolID, nYear, nTerm, sClassID)`, `nCapacity`, audit fields ตรงกับ §27.6 ก2
- `TClassSettingCaretaker` (read-only): PK `(SchoolID, nYear, nTerm, sClassID, sEmp)`, audit fields ตรงกับ §27.6 ก2
- `Request.cs`: `ItemTimetableSubject` มี `sRoomID`, `sRoomName` สำหรับ snapshot; ไม่ใช้ `nClassroomID`

### Issues Found

- ไม่มี defect ใหม่ในรอบนี้

## Unverified Behaviour — undeployed phases

- Phase 11: SQL execution บน live database (ทั้ง School DB และ Module DB) ต้องรันด้วยมือโดยผู้ใช้ตามข้อตกลง ไม่มีการ execute DDL ผ่าน agent

## Change Log

- 2026-10-11 — Round 22 — BE-012 ✅ Verified (dotnet build 0 errors, dotnet test 258/258 passed, data model verified)

Back-links: `plan\index.md` · `..\index.md`
