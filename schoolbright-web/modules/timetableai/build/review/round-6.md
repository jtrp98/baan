# timetableai — Review Round 6 — BE-010

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim (ไฟล์เก่า = archive) · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

None. All criteria and validations for BE-010 verified clean against DES-009, REQ-012, AC-026, AC-027, AC-028, AC-065.

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|

## Round 6

**Verdict:** PASS

| Task | Verdict |
|---|---|
| BE-010 | PASS |

### Review Notes — BE-010

- **VR-9 (TermRequired):** ตรวจสอบ `ValidateTerm` ใน `WebAPIController.cs:55-70` ปฏิเสธ request ที่ขาด `sTermID` หรือเป็นค่าว่างด้วย HTTP 200 + `{ status = 0, message = "กรุณาระบุภาคเรียน (sTermID)" }` (หรือภาษาอังกฤษ "Term is required (sTermID)") ครบทุก endpoint ของตาราง §34.2
- **VR-8 (TermNotInYear):** ตรวจสอบ `ValidateTerm` เทียบกับ `TTerm` ของ `(nSchoolID, nYear)` (เฉพาะที่ `cDel != "1"`) หากไม่พบจะปฏิเสธด้วย HTTP 200 + `{ status = 0, message = "ภาคเรียนไม่อยู่ในปีการศึกษานี้" }` (หรือภาษาอังกฤษ "The term does not belong to this school year") ก่อนอ่านหรือเขียนข้อมูลลงฐาน
- **BR-17a (Conflict Scope):** `GetAllTimetablesByYear` (`WebAPIController.cs:2810-2825`) กรอง `(x.sTermID == sTermID || x.sTermID == null)` และตัดตัวเองด้วย `(nExcludeTimetableID == null || x.nTimetableID != nExcludeTimetableID)` ถูกต้องตามสัญญา S1 และนับแถว legacy NULL ในทุกเทอม
- **School DB Term Filtering:** `GetPlansByYear` (`WebAPIController.cs:498`) และ `LevelClasses` กรอง `TTermSubLevel2.nTerm == sTermID` ไม่คืนห้องข้ามเทอม (ปิด D36)
- **Model & Request:** คอลัมน์ additive `sTermID varchar NULL` เพิ่มบน 4 ตารางราก (`Tbl_Setting`, `Tbl_ClassPeriod`, `Tbl_TeacherClassAssignment`, `Tbl_Timetable`) และ Request models ครบถ้วน
- **Tests:** `AITimeTableBackend.Tests/TermValidationTests.cs` มีชุดทดสอบครอบคลุม VR-8, VR-9, BR-17a และ School DB filter ครบถ้วน รันผ่าน 125/125 assertions

## Reviewed

- `AITimeTableBackend/Controllers/WebAPIController.cs`
- `AITimeTableBackend/Helpers/Messages.cs`
- `AITimeTableBackend/Models/Request.cs`
- `AITimeTableBackend/Models/Tbl_ClassPeriod.cs`
- `AITimeTableBackend/Models/Tbl_Setting.cs`
- `AITimeTableBackend/Models/Tbl_TeacherClassAssignment.cs`
- `AITimeTableBackend/Models/Tbl_Timetable.cs`
- `AITimeTableBackend.Tests/TermValidationTests.cs`

## Change Log

- 2026-10-09 — Round 6 (BE-010) — PASS (VR-8, VR-9, BR-17a, School DB term filtering ครบถ้วนพร้อมชุดทดสอบ 16 ข้อ)

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
