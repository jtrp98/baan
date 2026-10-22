# timetableai — QA Round 24 — BE-011

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ถูกแทนคงอยู่เป็นไฟล์ของตัวเอง verbatim · live Open Issues / Unverified Behaviour ให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น
> B = C:/src/schoolbright/target/sb-api-academic-timetable-ai. วันที่ผู้ใช้ 2026-10-11 / jtrp98

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| — | — | — | ไม่มี active open issue ของ BE-011 |

## Round 24

**Status:** ✅ Verified

Output PASS / BE-011 verified: การตรวจสอบการทำงานและชุดทดสอบของ BE-011 (`Timetable/Copy/Preview|Apply`) ผ่านตามเกณฑ์ทั้งหมด:
- `dotnet build` ผ่าน exit 0 (0 errors, 74 warnings)
- `dotnet test` ผ่าน exit 0 ครบ 275/275 tests (0 failed) รวมถึง 13 tests ใน `CopyBackendTests.cs`
- ตรวจสอบลำดับการ Validate ทั้ง 8 ขั้นตอน (§35.8), Single-tx atomic execution, Non-destructive copy, SHA256 preview token fingerprint, และ M(scope) authorization filter ถูกต้องครบถ้วน

### Checks run

| Check | Command | Result |
|---|---|---|
| build | `dotnet build` | pass exit 0 (0 errors, 74 warnings) |
| tests | `dotnet test` | pass exit 0 (275/275 passed, 0 failed, Duration 14s) |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| BE-011 | verified | DES-010 §35, VR-8, BR-66, BR-67, BR-68, BR-70: `CopyBackendTests.cs` 13 tests green, `dotnet test` 275/275 green, endpoints `Timetable/Copy/Preview` และ `Timetable/Copy/Apply` ตรวจสอบแล้ว |

### Data Model check

| Model / Contract | สอดคล้องสเปก | รายละเอียด |
|---|---|---|
| `RequestCopyPreview` / `RequestCopyApply` | ✅ ผ่าน | สืบทอด `RequestBase`, มี `scope`, `src`, `dst`, `lstTimetableIDs`, `sPreviewToken`, `isConfirmOverwrite`, `isConfirmPartial` ตรงตาม DES-010 §35.2, §35.3 |
| `TimetableCopyHelper` | ✅ ผ่าน | ฟังก์ชัน ValidateRequest, CheckNothingToCopy, ComputePreviewToken, CheckMissingTemplates, CheckDependentsWouldBeOrphaned, CheckExistingDestinationArtifacts, CheckNaturalKeyMatches, ApplyCopy |
| `TimetableEndpointPolicy` / `Filter` | ✅ ผ่าน | `EndpointAccessType.CopyScopeWrite` กำหนดสิทธิ์ต่อ scope (401, 403, 404, 422, 402) และ validate scope ก่อน resolve สิทธิ์ |

### Issues Found

- ไม่มี defect ใหม่ในรอบนี้

## Unverified Behaviour — undeployed phases

- การคัดลอกข้อมูลในสภาพแวดล้อม production หรือ staging ที่มีปริมาณข้อมูลจริง (load/performance ของ single-tx copy ขนาดใหญ่) จะตรวจสอบในการทดสอบ integration ระดับระบบต่อไป

## Change Log

- 2026-10-11 — Round 24 — BE-011 ✅ Verified (dotnet build 0 errors, dotnet test 275/275 passed, Copy Preview/Apply validation order & atomicity verified)

Back-links: `plan\index.md` · `..\index.md`
