# ผลตรวจ 094 — SB-W2 re-check หลัง rework รอบ 1/2

วันที่ของงาน: 2026-10-29 · ผู้ตรวจ: check · **BE-002 S1-db-adapters: FAIL**

Oracle ตรึงเดิมจาก `plan/BE-002.md` หัวข้อ Oracle pack: AC-027-04, AC-036-02, AC-036-03, AC-033-05; **DES-004 Rev11**; TP001-008/022/023/052/053 และ Amendment002 ตาม [รอบก่อน](check-094-wave2-gate-001.md). ไม่เพิ่มเกณฑ์จาก revision ภายหลัง ไม่ตัดสิน BE-002 ทั้ง task หรือ AC แบบ end-to-end จาก slice นี้

อ่าน data-model Rev8 เต็ม พร้อม dictionary หก records และ legacy Account/student/employee, ชนิด/enum ที่เกี่ยวข้องอีกครั้ง. ชุด mapping เดิมตรวจ 6 records/82 properties ผ่าน; ไม่ใช่การตรวจรับ data documentation หรือ catalog จริงใหม่

## ผลรันเอง

หลักฐานดิบทั้งหมดอยู่ใต้ `reports/school-bot/normal-094/`

| ชุด | ผ่าน | ไม่ผ่าน | ข้าม | หลักฐานใต้ run folder |
|---|---:|---:|---:|---|
| B ทั้งหมดผ่าน xUnit runner เดิม | 4,179 | 0 | 0 | `check-wave2-runner/recheck-r1.log`, `recheck-r1-results.json` |
| contract (รวมใน B) | 10 | 0 | 0 | JSON เดียวกัน; `Errors=[]` |
| scoped เดิม | 8 | 0 | 0 | `check-wave2-gate/recheck-r1.log`, `recheck-r1-results.json` |
| extra เดิมที่ติดมากับ harness | 1 | 2 | 0 | JSON เดียวกัน; backlog เดิม ไม่ใช้ตัดสินซ้ำ |
| extra เพิ่มเฉพาะตัว fix | 1 | 1 | 0 | `check-wave2-fix-r1/run.log`, `bin/Debug/net10.0/results.json` |

เพิ่มเพียง 2 เคสเกี่ยวกับ rollback ของ F2 (รวม extra เดิม 5 เคส ไม่เกิน 20). ไม่แก้ production code, repo tests, plan Status หรือ gates

คำสั่งใช้ absolute path โดย `<run>` = `C:\src\schoolbright\reports\school-bot\normal-094`:

- `dotnet build <run>\check-wave2-gate\GateChecks.csproj --no-restore --disable-build-servers -m:1 -v:quiet`: exit 0; `dotnet <run>\check-wave2-gate\bin\Debug\net10.0\GateChecks.dll`: exit 1 เพราะ extra backlog เดิมสองเคส; scoped ผ่านครบ
- `dotnet build <run>\check-wave2-runner\Runner.csproj --no-restore --disable-build-servers -m:1 -v:quiet`: exit 0; `dotnet <run>\check-wave2-runner\bin\Debug\net10.0\Runner.dll` จาก `target/school-bot/web`: exit 0 ใช้ xUnit executor เดิม รันทุก test โดยไม่ filter
- `dotnet build <run>\check-wave2-fix-r1\GateChecks.csproj --disable-build-servers -m:1 -v:quiet --ignore-failed-sources`: exit 0; `dotnet <run>\check-wave2-fix-r1\bin\Debug\net10.0\GateChecks.dll`: exit 1

ตั้ง `DOTNET_CLI_TELEMETRY_OPTOUT=1` และสำหรับ runner ตั้ง `ASPNETCORE_TEST_CONTENTROOT_SCHOOLBOT_API=C:\src\schoolbright\target\school-bot\web\src\SchoolBot.Api` เหมือนรอบก่อน. Build แรกก่อนปิด telemetry ล้มเหลวใน .NET CLI initialization; ตั้ง env แล้ว build ผ่าน. มี NU1900 เพราะดึง vulnerability feed ไม่ได้ ไม่ใช่ test failure. รอบนี้ไม่ใช้ VSTest/testhost

## F1/F2 → ผลตรวจ

| Finding / AC / TP | เคสและผล | ข้อสรุป |
|---|---|---|
| F1 / AC-027-04 / TP001-008 | `FailedLicenseWriteDoesNotLeakIntoLaterCommit` ผ่าน | cache ไม่รับ License ที่ commit ล้มเหลว; instance ใหม่อ่าน disk พบเฉพาะใบสำเร็จ |
| F1 / AC-036-02 / TP001-022 | `FailedProjectUpdateDoesNotLeakIntoLaterCommit` ผ่าน | ชื่อที่ update ล้มเหลวไม่รั่วลง disk ผ่าน commit ถัดไป |
| F2 / AC-036-02/03 / TP001-008/022 | `RevisionCommitFailureLeavesNoHalfProjectAfterRestart` ผ่าน | rollback สำเร็จแล้วไม่เหลือ Project ครึ่งรายการ |
| F2 / AC และ TP เดิม | `ExistingProjectRevisionFailureRestoresReadableRevision` ผ่าน | งานที่มี revision เดิมเปิด revision 1 ได้หลังเขียน revision 2 ล้มเหลว |
| F2 / AC และ TP เดิม | `RevisionAndRollbackWriteFailureLeavesNoHalfProjectAfterRestart` **ไม่ผ่าน** | store ยังเขียนไม่ได้ทำให้ half-project ค้างหลัง restart |

## F2 ยังแก้ไม่ครบ — Important · ส่ง sys

ทำซ้ำใน `check-wave2-fix-r1/Program.cs`: สร้าง Project ใหม่ CurrentRevision=1 สำเร็จ → ให้ backing store ปฏิเสธ revision write และ project rollback write ด้วย IOException ต่อเนื่อง → เรียก SaveProjectRevisionAsync แล้วรับ exception → สร้าง adapter และ FileSchoolBotBackingStore ใหม่อ่าน path เดิม

Expected ตาม F2 เดิม: ไม่เหลือ Project ที่ชี้ revision ไม่มีอยู่หลัง restart. Actual: cache ไม่มี Project แต่ disk ยังมี SchoolBotProjectId=1, CurrentRevision=1; revision ไม่มี. อ่าน projects.json จริงยืนยันแถว และ Test-Path project_revisions.json = False. Fixture อยู่ที่ `check-wave2-fix-r1/bin/Debug/net10.0/fixtures/RevisionAndRollbackWriteFailureLeavesNoHalfProjectAfterRestart-40d78eb2768b496bbefe6d8bd0114c00/`

ต้นเหตุ: `target/school-bot/web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:250` catch ลบ Project ใน cache ที่บรรทัด 255 แล้ว SaveProjectsAsync ที่บรรทัด 269; catch ที่บรรทัด 271–274 กลืน rollback failure ทำให้ disk ยังเป็นสถานะก่อน rollback. เป็นเคสครอบกลไกแก้ F2 โดยตรง ไม่ใช่ finding คนละเรื่องหรือ oracle ใหม่. จำลอง storage outage ต่อเนื่องระหว่าง save กับ compensation บน persistent stub เส้นทางเดียวกับ scoped F2 เดิม; ไม่ใช่หลาย instance, input นอก deployment หรือ test-host artefact. ไม่ได้ทดลองทำให้ disk จริงเสียหรืออ้างว่าพิสูจน์ production DB

ให้ sys แก้ F2 ให้การบันทึก Project/revision ไม่พึ่ง compensation write สำเร็จเมื่อ store ล้มเหลว แล้วรันเคสเดิม + เคส fix + scoped/B regression ซ้ำ. เป็นผล FAIL สองรอบติดต่อกัน หลัง rework ครั้งที่ 1; ยังไม่ถึง gate ล้มเหลวครั้งที่ 3 และไม่พบ Critical

## Regression และข้อจำกัด

scoped เดิมครอบ License status หลัง restart, student/employee content และ owner/school isolation, active profile/revocation และ DDL mapping ผ่านทั้งหมด. TP001-053/catalog, full Login/device proof, kill ระหว่าง write และ lost-response/idempotency แบบ end-to-end ยังไม่รับรองจาก S1 เช่นรอบก่อน; DB จริงรอ DBA-003/G-CORE ไม่ใช่เหตุ FAIL รอบนี้

handoff sys ระบุแก้เฉพาะ adapter และ contract tests ไม่ระบุ rework ไฟล์ร่วม ErrorCodes/ApiErrors/Program.cs จึงไม่เปิดตรวจข้าม task ที่ผ่านแล้วใหม่. Working tree มีงานสะสม/ไฟล์ untracked จึงไม่ใช้ diff เทียบ HEAD อ้างว่า shared files เปลี่ยนใน rework นี้. B ทั้งชุดผ่าน ไม่พบ regression จากผลรัน

backlog เดิมสอง instance เขียนทับกัน และ session/profile helper ยังมีผลไม่ผ่านเดิมจาก harness โดยไม่ได้ขยายการตรวจ; ไม่ใช้เป็นเหตุ FAIL และไม่เปิด Security gate ใหม่. ส่งนายช่าง → sys พร้อมรายงานนี้; คง verdict ของ task อื่นตามรอบก่อน

## Change Log

- 2026-10-29 — check รัน failing/scoped/B suites ซ้ำ และเพิ่มสองเคสเฉพาะ rollback fix; F1 ผ่าน แต่ F2 ยังมี half-project เมื่อ rollback write ล้มเหลว

FAIL
