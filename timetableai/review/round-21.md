# timetableai — Review Round 21 — BE-012

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (BE-012 full implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 21

**Verdict:** PASS

| Task | Verdict |
|---|---|
| BE-012 | PASS |

ผลการตรวจสอบ BE-012 (Rooms backend: SubjectRoom mapping + C1′ School DB read-only):
- `C1′ School DB read-only`: โมเดล `TClass`, `TClassSetting`, `TClassSettingCaretaker` ถูกแมปใน `StudentDataContext` เป็น read-only ไม่มีการทำ Add/Update/Delete ต่อ School DB
- `Data Minimization`: `TClass.cs` และ query ใน `GetRooms` ไม่ select หรือส่งต่อ `sClassIP` (DES-013 §38.1 / §140)
- `Active Room Predicate (BR-33)`: กรองห้อง active ด้วย `cDel == null || cDel == "0"` ห้องที่ `cDel == "1"` ถูกตัดออก
- `K=1 Absence Contract (BR-54)`: เมื่อไม่มีแถวการตั้งค่าใน `TClassSetting` คืนค่า `nCapacity: null`
- `VR-15 Validation`: กรณี `nCapacity < 1`, ครูผู้ดูแลไม่อยู่ใน `TEmployees` ของโรงเรียน, หรือห้องไม่อยู่ในโรงเรียน คืน `{ status: 0, message: "InvalidRoomSetting", data: null }` แบบ fail-closed
- `Caretakers & isInPlan (BR-71)`: คืน `lstCaretakers` พร้อมสถานะ `isInPlan` ที่คำนวณผ่านสายสัมพันธ์ `TPlanCourseTeacher -> TPlanCourse -> TPlanTermSubLevel2 -> TTermSubLevel2 (nTerm == sTermID)`; ครูที่ถูกลบ (`cDel != null`) คืน `sTeacherName: null` และ `isInPlan: false`
- `SubjectRoom Mapping (BR-34)`: `SubjectRoom/Set` แทนที่ข้อมูลแบบ atomic transaction; ตรวจสอบ `VR-10 (RoomNotFound)` และ `VR-11 (DuplicateSubjectRoom)` ถูกต้อง; `SubjectRoom/Get` คืน `sRoomName` ที่แปลงจาก `TClass.sClass`
- `Authorization Filter`: `TimetableEndpointPolicy` กำหนดสิทธิ์ครบถ้วน (`GetRooms` อ่านได้ทั้ง 5 เมนู, `SubjectRoom/Get` อ่าน 422/401, `SubjectRoom/Set` เขียน 422)
- `Test Coverage`: ชุดทดสอบ `RoomsBackendTests.cs` (7 tests) ครอบคลุม validation, business rules, และ security policies; `dotnet test` ผ่านทั้งหมด 258/258 tests (0 failed)

## Reviewed

- `AITimeTableBackend/Models/Tbl_SubjectRoom.cs`
- `AITimeTableBackend/Models/TClass.cs`
- `AITimeTableBackend/Models/TClassSetting.cs`
- `AITimeTableBackend/Models/TClassSettingCaretaker.cs`
- `AITimeTableBackend/Models/Request.cs`
- `AITimeTableBackend/Controllers/WebAPIController.cs`
- `AITimeTableBackend/Helpers/DataContext.cs`
- `AITimeTableBackend/Helpers/StudentDataContext.cs`
- `AITimeTableBackend/Security/TimetableEndpointPolicy.cs`
- `class-setting-school-db.sql`
- `subject-room-module-db.sql`
- `AITimeTableBackend.Tests/RoomsBackendTests.cs`

## Change Log

- 2026-10-11 — Round 21 — BE-012 PASS (full implementation verified with 258 passing tests; no new findings)

Back-links: `plan\index.md` · `..\index.md`
