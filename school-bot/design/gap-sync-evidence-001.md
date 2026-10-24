# หลักฐาน as-built ใบงาน060a — Rev1

[ผลตรวจและส่งต่อ](gap-sync-review-001.md) · สถานะอยู่ที่ [index](index.md)

## As-built ที่ตรวจจริงและข้อขัดกับแบบเก่า

ราก `B=C:/src/schoolbright/target/school-bot`; `A=C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure`. เป็น source/DDL ใน checkout ไม่ใช่ผลจากฐาน deploy

| หลักฐาน | ข้อเท็จจริง / ผลต่อแบบ |
|---|---|
| B/app/frontend/src/modes/coding-adventure/useCodeLab.ts:56; B/app/internal/engine/demo.go:66 | String.length กับ len(string) ใช้คนละหน่วยจริง; ข้อเสนอเดิมให้เพิ่ม byte-check ที่ load ถูกถอน |
| B/app/desktopstorage.go:46–130 | local ยังเป็น slot `<mode>.json` พร้อม temp/sync/rename; ไม่มีหลักฐานว่า shared multi-project/trash/import/history ที่ร่างพร้อมใช้แล้ว |
| B/web/src/SchoolBot.Api/Program.cs:43,45–46,107–122 | management ใช้ Memory Store/v1 static bearer; logout ใช้ key ชื่อ SCHOOL_BOT_DB_CONNECTION_STRING. ไม่ได้อ่านค่า secret และไม่อ้างว่ามี staff_admin implementation |
| B/web/src/SchoolBot.Application/ManagementService.cs:24–30,74–95; B/app/desktopservice.go:109–115; Program.cs:96–99 | create key คืนครั้งเดียวใน PoC, publish เปลี่ยน flag, update metadata-only; ไม่ใช่ encrypted replay/signer/Prepare/Install proof |
| B/app/frontend/src/modes/robot-control/robotContext.tsx:119–129; engineAdapter.ts:31–69,95–125 | poll3วินาที/ไม่มี debounceเพิ่ม; profile/servo bounds, cancel→drain→stop→explicit relock มีจริง |
| B/app/internal/engine/manager.go:115–127,188–189; B/engines/zide/src/request.cpp:32–69,122–156; actions.cpp:45–100; protocol.cpp:38–65,90–96; line_reader.cpp:7 | host drain/protocol/bounds ตาม robot-boundary; ไม่ได้สั่งหุ่นหรือวัด physical stop |
| A/Repositories/Databases/TeacherRepository.cs:24–32,111–124; PlanCourseRepository.cs:194–215 | มี teacher/course/term และ room joins แต่ query ห้องกรอง SchoolId ไม่ครบทุก alias จึงไม่ใช้ query เดิมเป็น authorization proof |
| A/Entities/JabjaiSchoolSingleDB/TstudentClassroomHistory.cs:8–38; Tterm.cs:8–24; Common/Databases/JabjaiSchoolSingleDBPostgreSQLDBContext.cs:7895–7918,9435–9472,9991 | ยืนยันชื่อ physical/property/keys ของ assignment/history/term; ไม่ยืนยัน active/move/status resolver หรือ timezone ที่ใช้งานจริง |
| db/schoolbot_db.sql:142–175,182–197,284–335,680–709 | reuse idempotency/audit/projects/submission เดิม; ไม่มี Version. ReplayUntil และ nullable cipher/key-id มีแล้ว; ไม่ต้องเสนอ migration สำหรับรอบนี้ |

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a บันทึกหลักฐานไฟล์/บรรทัดที่อ่านจริง; ไม่ใช่ runtime/DB/hardware proof

