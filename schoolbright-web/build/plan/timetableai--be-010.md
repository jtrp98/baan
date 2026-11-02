# BE-010 — Term dimension backend: additive `sTermID` + VR-8/VR-9 + BR-17a conflict scope (DES-009)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

Term dimension backend: additive `sTermID` + VR-8/VR-9 + BR-17a conflict scope (DES-009)

## References

REQ-012, AC-026, AC-027, AC-028, AC-065, DES-009, DEC-009

## Scope

มิติเทอมฝั่ง backend ตาม design §34.1–§34.4: model/request เพิ่ม `sTermID` แบบ **additive** บน 4 ตาราง (`Tbl_Setting`, `Tbl_ClassPeriod`, `Tbl_TeacherClassAssignment`, `Tbl_Timetable` — §27.5) — **ไม่มี DDL ใน task นี้** (DDL/backfill = Waiting on Human #11 โดย `devops`) · endpoint ครบทุกกลุ่มของตาราง §34.2 — Setting/Get|Set (**เงื่อนไข lookup รวม sTermID ไม่ใช่แค่เก็บค่า** — EVD-033), SubjectSettings/Get, ClassContinuity/Get|Set, LinkSubjectSetting/Get|Set|Delete (ผูกผ่าน `nSettingID` — ไม่เพิ่มคอลัมน์ EVD-039), ClassPeriod/Get|Set|Delete, TeacherGroup/GetAll|GetAllByYear (`periodIDsInYear` → ชุด period ของ (year, term)), TeacherClassAssignment/GetAll|GetAllByYear|GetTeachersByClass|Set, Timetable/GetAllByYear|Get|Set · read school DB **กรองเทอม** ผ่าน `TTermSubLevel2.nTerm` — `School/{id}/Year/{y}/Plans` และ `LevelClasses` (D36 — จุดที่ AC-026 พังง่ายที่สุด) · endpoint `School/{id}/Year/{y}/Terms` มีอยู่แล้ว **ไม่แก้** (EVD-026) · BR-22..BR-26 (แถว `sTermID IS NULL` = legacy ทั้งปี — อ่านได้ นับใน conflict ทุกเทอม; ห้ามสร้าง/แก้ `TTerm`) · **VR-8** `TermNotInYear` (เทียบ `TTerm` ทุกครั้ง — `sTermID` เป็น identity จาก client เหมือน nSchoolID/nYear), **VR-9** `TermRequired` (มีผลตั้งแต่ release — ไม่มี grace ตาม AC-065) · **BR-17a** — `Timetable/GetAllByYear` รับ `sTermID` เป็นพารามิเตอร์ขอบเขต conflict (S1 — เทอมเดียวกัน + แถว NULL) ยกเว้นตัวเอง; ตัวเทียบเวลาจริงไม่เปลี่ยน · เกณฑ์ = AC-026 (ตาราง §34.2 = รายการจุดที่ต้องครบ) · AC-028 เป็นผลของ backfill (#11) — task นี้ต้องอ่านแถว NULL ได้ · AC-065 = VR-9 ไม่มีช่วงผ่อนผัน

- Security-sensitive: yes

## Out of Scope

schema จริง (DDL เป็นของ Waiting on Human #11) · `TTerm` และ endpoint Terms (อ่านอย่างเดียว — BR-23) · DES-018 auth ทั้งหมด (BE-001..BE-009) · validation/envelope เดิมของ DES-002 · `Tbl_TeacherGroup`, `Tbl_TimetableClass`, `Tbl_LinkSubjectSetting(+Detail)` (derive ตามแม่ — ไม่เพิ่มคอลัมน์) · solver/validateDrop (BR-17a เป็นพารามิเตอร์ของ query ไม่ใช่ตรรกะ solver)

## Expected Output

none

## Acceptance

AC-026: ทุกจุดอ่าน-เขียนในตาราง §34.2 ผูก (nSchoolID, nYear, sTermID) — ไม่มีจุดใดทำงานข้ามเทอมโดยไม่ตั้งใจ (รวม read ของ school DB ที่กรองเทอมแล้ว)
AC-027: เทอมมาจาก `TTerm` อย่างเดียวผ่าน endpoint Terms — ไม่มี hardcode
AC-065: request ที่ละเว้น `sTermID` → `TermRequired` (VR-9) ทันทีตั้งแต่ release — ไม่มี grace; `sTermID` นอกชุดเทอมของปี → `TermNotInYear` (VR-8) ไม่เขียนอะไร
AC-028 (เตรียมพร้อม): อ่านแถว `sTermID IS NULL` ได้ (legacy ทั้งปี) — การ backfill เป็นของ #11

## Dependencies

—

## Handoff

`dotnet build` + `dotnet test` · test ของ VR-8/VR-9 (รวมกรณี NULL ของ `TTerm` เทียบ) · test BR-17a — ชุด conflict ของเทอมเดียวกัน + แถว NULL นับทุกเทอม + ตัดตัวเอง · grep ยืนยัน endpoint ครบทุกแถวของตาราง §34.2 (รวม Plans/LevelClasses กรอง `TTermSubLevel2.nTerm`) · `[manual-API]` หลัง cutover (ผูก #11) · *(PM code check 2026-10-09)* ประตู schema (#10) ปิดแล้ว (2026-10-04) · โค้ดของ task นี้ลง repo แล้วใน commit `2941f43` (2026-10-09): `sTermID` บน 4 model + query param กลุ่ม endpoint ของ §34.2 + VR-8/VR-9 (Messages + จุด enforce กลาง `WebAPIController.cs:55-67`) + `sTermID` ใน Request ฝั่ง Set — **ยังไม่มี test VR-8/VR-9/BR-17a ใน `AITimeTableBackend.Tests` และยังไม่ผ่าน review/QA** → รอบถัดไป: reviewer → `qa-engineer` (ช่อง Status เป็นของ `qa-engineer`)

DES-018 regression: term parameter ไม่ข้าม tenant/resource ownership; claims และ existing menu mapping คงเดิม
additive ที่ระดับ API แต่ **breaking** ที่พฤติกรรม — release window เดียวกับ FE-021 (AC-065); release ล้มกลางทาง → ถอย release ทั้งชุด ห้ามเปิดโหมดบังคับเทอมบางส่วน · revert แล้วกลับ as-built (ไม่มีเทอม) · ไม่มีสคีมาเปลี่ยนใน task นี้
ส่งต่อ reviewer

Back-links: `INDEX.md`
