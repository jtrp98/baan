# BE-014 — Academic sync record backend: `Tbl_TimetableAcademicSync` + `Timetable/SetAcademicSyncResult|GetAcademicSyncResults` (DES-016 §41.4)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Academic sync record backend: `Tbl_TimetableAcademicSync` + `Timetable/SetAcademicSyncResult|GetAcademicSyncResults` (DES-016 §41.4)

## References

REQ-019, AC-048, DES-016, DEC-016, REQ-021, AC-060, AC-061, AC-062, DES-018, DEC-018

## Scope

ตาม design §41.4: model ตารางใหม่ `Tbl_TimetableAcademicSync` (§27.6 **ง**; 1 แถวต่อ (ตาราง, ห้องเรียน, เทอม): สถานะล่าสุด, `jScheduleIDs` ที่ Service Academic คืน, ผลรายแถว, ผู้ส่ง/เวลา) · DDL เขียนเป็น artifact `academic-sync-table-module-db.sql` · `Timetable/SetAcademicSyncResult` `{nSchoolID, nTimetableID, lstResults:[{nClassID, sTermID, nStatus, lstScheduleIDs, jDetail}], nTeacherID}` — upsert ต่อคู่ใน **DB transaction เดียว** · `Timetable/GetAcademicSyncResults?nSchoolID&nYear[&sTermID]` — ผลทุกคู่ของปี (ใช้โดยหน้าผลการส่งและ BR-56 ของ FE-024) · **VR-16** `InvalidSyncResult` — `nTimetableID` ไม่ใช่ของ `nSchoolID` / `nClassID` ไม่อยู่ในตาราง / `sTermID` ไม่ใช่เทอมที่ derive ได้ (BR-46) / `nStatus` นอก enum (1=Sent, 2=Rejected, 3=Failed) → `status 0` ไม่เขียนอะไร.

ลงทะเบียน endpoint ใหม่ใน authorization policy/filter ตาม DES-018 §43.2(a) ใน task เดียวกัน; คง fail-closed/claims/school-resource ownership และ audit identity จาก claims (BR-73); ไม่เชื่อ audit identity จาก client.

**Implementation ปลดล็อกแล้ว (Gate #5 ปิดโดย jtrp98 2026-10-11):**
- สัญญา T1 Atomic Replace API (`POST api/gateway/timetables/atomic-replace`) และ schema `Tbl_TimetableAcademicSync` (§27.6 ง) ยืนยันแล้ว.
- Write paths: Target C:/src/schoolbright/target/sb-api-academic-timetable-ai —
  `AITimeTableBackend/Models/Tbl_TimetableAcademicSync.cs`
  `AITimeTableBackend/Controllers/WebAPIController.cs`
  `AITimeTableBackend/Helpers/AITimetableDataContext.cs`
  `academic-sync-table-module-db.sql`
- Security-sensitive: yes

## Out of Scope

`TSchedule`/`TTermTimeTable` (ห้ามเขียน school DB — BR-45) · สัญญาของ Service Academic (SA-Q6) · DES-018 auth ของ endpoint เดิม/claims/tenant/predicate; อนุญาตเพิ่ม mapping ของ endpoint ใหม่ใน task นี้ตาม §43.2(a) โดยคง semantics เดิม

## Expected Output

Model `Tbl_TimetableAcademicSync` + DbSet ใน `AITimetableDataContext` + endpoints `Timetable/SetAcademicSyncResult` และ `GetAcademicSyncResults` พร้อม VR-16 + DDL artifact `academic-sync-table-module-db.sql` + Tests ครบถ้วน

## Acceptance

AC-048 (ส่วนบันทึกผล): ทุกคู่ที่ส่งถูกบันทึกสถานะล่าสุด + `jScheduleIDs` + ผลรายแถว — อ่านย้อนได้ครบของปี
VR-16: ข้อมูลไม่ตรงเจ้าของ/สัญญา → ปฏิเสธโดยไม่เขียน (กันบันทึกเท็จที่ทำให้ BR-56 ตัดการใช้ห้องจริงออก)
`dotnet build` และ `dotnet test` ผ่าน

## Dependencies

BE-010

## Handoff

`dotnet build` + `dotnet test` · test VR-16 ทุกเงื่อนไข + upsert transaction + การอ่านย้อนต่อปี/เทอม · ส่งต่อ reviewer → qa-engineer → security.

## Change Log

- 2026-10-11 — BE-014 verified: Review round 22 PASS, QA round 23 verified (262/262 tests pass), security audit Phase 13 backend pass. Model Tbl_TimetableAcademicSync, endpoints SetAcademicSyncResult/GetAcademicSyncResults, VR-16 validation, และ DDL artifact academic-sync-table-module-db.sql สมบูรณ์.

- 2026-10-11 — Gate #5 ปิดโดย jtrp98: ปลดล็อก implementation (สัญญา T1 Atomic Replace + schema Tbl_TimetableAcademicSync ยืนยันแล้ว); ระบุ Write paths ชัดเจน.

- 2026-10-11 — แยก chosenA/T1direction จาก remainingconcreteowner/sync schemagates; คง implementationHOLD/Dependencies/Status ไม่สร้าง writescope ที่ยังไม่ยืนยัน.

Back-links: `INDEX.md`
