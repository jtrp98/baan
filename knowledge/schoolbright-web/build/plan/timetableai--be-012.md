# BE-012 — Rooms backend: SubjectRoom mapping + C1′ School DB read-only; SQL draft (DES-013 §38.3)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Rooms backend: SubjectRoom mapping + C1′ School DB read-only (`TClass` + `TClassSetting`); SQL draft (DES-013 §38.3)

## References

REQ-016, AC-038, AC-038a, AC-039, AC-040, DES-013, DEC-013, data-model §27.6 ก/ก2, OQ-43, OQ-44, SA-Q5, SA-Q10, SA-Q25, REQ-021, AC-060, AC-061, AC-062, DES-018, DEC-018

## Scope

## Scope

C1′ School DB read-only (DES-013 §38.3/§27.6 ก2): ห้อง = `TClass` active (BR-33, cDel NULL/'0'); capacity จาก `TClassSetting`, ผู้ดูแลเป็นชุดจาก `TClassSettingCaretaker` → DTO `lstCaretakers` (BR-71); mapping `Tbl_SubjectRoom` ของ module (§27.6 ก, 1 วิชา : 1 ห้อง); ไม่มี RoomSetting/Set/editor/proxy/copy ใน School DB.

**Full implementation ปลดล็อกแล้ว (Gate #4 ปิดโดย jtrp98 2026-10-11):**
1. Model & DbSet: `Tbl_SubjectRoom` ใน `AITimetableDataContext` (PK int `nSubjectRoomID`, `nSchoolID`, `nYear`, `sTermID`, `sCourseCode`, `sRoomID` varchar(10), `isDeleted`, audit fields)
2. Read-only Models ใน `StudentDataContext`: `TClassSetting` (PK `SchoolID,nYear,nTerm,sClassID`), `TClassSettingCaretaker` (PK `SchoolID,nYear,nTerm,sClassID,sEmp`)
3. Snapshot: `ItemTimetableSubject` ใน `Request.cs` + `sRoomID`, `sRoomName`
4. Endpoints:
   - `SubjectRoom/Set`: upsert mapping 1:1 ต่อ `(nSchoolID, nYear, sTermID, sCourseCode)`
   - `SubjectRoom/Get` & `SubjectRoom/GetAllByYear`: ดึง mapping ของวิชา
   - `School/{id}/Rooms`: อ่าน `TClass` active + join `TClassSetting` & `TClassSettingCaretaker` คืนห้องพร้อม `nCapacity` และ `lstCaretakers` (active `isInPlan`)
   - X2 Room Usage client: ดึงการใช้ห้องจาก Academic Gateway (`GET api/gateway/timetables/room-usage`), fail-closed ตาม BR-57
5. SQL artifacts (artifact-only): `class-setting-school-db.sql` (School DB) และ `subject-room-module-db.sql` (Module DB)

- Write paths: Target C:/src/schoolbright/target/sb-api-academic-timetable-ai —
  `AITimeTableBackend/Models/Tbl_SubjectRoom.cs`
  `AITimeTableBackend/Models/TClassSetting.cs`
  `AITimeTableBackend/Models/TClassSettingCaretaker.cs`
  `AITimeTableBackend/Models/Request.cs`
  `AITimeTableBackend/Controllers/WebAPIController.cs`
  `AITimeTableBackend/Helpers/StudentDataContext.cs`
  `AITimeTableBackend/Helpers/AITimetableDataContext.cs`
  `class-setting-school-db.sql`
  `subject-room-module-db.sql`
- Security-sensitive: yes

## Out of Scope

SQL execution ต่อ live DB; ALTER `TClass`/FK/UNIQUE; School DB writes (C1′ read-only); C2/RoomSetting editor ใน School DB.

## Expected Output

โค้ดและ endpoints `SubjectRoom/*` + `School/{id}/Rooms` + snapshot `sRoomID/sRoomName` + model `Tbl_SubjectRoom` + EF read-only entities ใน `StudentDataContext` ครบตาม DES-013 + Unit/Integration tests build/test ผ่าน

## Acceptance

Full AC-038/038a/039/040:
- `TClass` active (`cDel IS NULL OR cDel = '0'`)
- mapping 1 วิชา : 1 ห้อง (uniqueness ใน module DB)
- C1′ read-only: absence/NULL capacity คืน `nCapacity: null` (K=1+RoomSettingMissing); read failure/invalid คืน error BLOCK
- X2 Academic room usage: fail-closed ตาม BR-57
- `dotnet build` และ `dotnet test` ผ่าน

## Dependencies

BE-010

## Handoff

backend-engineer → reviewer → qa-engineer → security (Phase 11). ผู้ใช้รัน SQL artifacts เอง.

## Change Log

- 2026-10-11 — Full implementation เสร็จสมบูรณ์ (review round 21 PASS, QA round 22 verified): dotnet build 0 errors, dotnet test 258/258 tests pass ครบทุกเกณฑ์ AC-038..AC-040; ส่งต่อความปลอดภัย Phase 11.

- 2026-10-11 — Gate #4 ปิดโดย jtrp98: ปลดล็อก full implementation (schema Tbl_SubjectRoom + X2 API contract ยืนยันแล้ว); ขยาย Write paths ครอบคลุม backend models, endpoints และ helpers.

- 2026-10-11 — #8 answered jtrp98 (TClassSetting+TClassSettingCaretaker/`lstCaretakers`/nYear/cDel): stage SQL artifact-only พร้อม dispatch + เกณฑ์ static; full ยังรอ SA-Q5/SA-Q10; Write paths/Depends/Status คงเดิม.

- 2026-10-11 — TRoom→TClass+TClassSetting (DES-013): SQL ใหม่ class-setting-school-db.sql HOLD #8; ไฟล์เดิมล้าสมัยห้ามรัน; review14/16+QA17/18 ประวัติ; Depends/Status คงเดิม.

- 2026-10-11 — รับjtrp98exactC1′schema/read/K1จริง; existingSQLheadercomment-only/SQLbodyunchanged/file-only; closedreview14/QA17partialและliveTRoom/Academic/modulemapping/DDLexecutionholdsคงเดิม.

- 2026-10-11 — เปิด bounded SQL-artifact-only stage ตามคำขอ jtrp98/C1′; exactnewrootSQLpath จาก repoconventions; full implementation/QAcompletion ยังค้าง gates ไม่แก้ Status.

Back-links: `INDEX.md`
