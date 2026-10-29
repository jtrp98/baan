# ผลตรวจ 094 — SB-W2 wave gate รอบ 1

วันที่ของงาน: 2026-10-29 · ผู้ตรวจ: check · **BE-002 S1-db-adapters: FAIL**

Oracle ตรึง: `plan/BE-002.md:39` — AC-027-04, AC-036-02, AC-036-03, AC-033-05; DES-004 Rev11; TP001-008/022/023/052/053 และ Amendment002. อ่าน data-model Rev8 ครบ พร้อม dictionary ของ 6 records, legacy Account/Profile และนิยามชนิด/JSON ที่เกี่ยวข้อง. data-contract-rules Rev10 ใช้ประกอบการอ่านเท่านั้น ไม่เพิ่มเส้นชัยจาก revision ภายหลัง pack.

ขอบเขต: S1 บน stub/persistent adapter; ไม่ตรวจ AC ของ DBA-002/004 หรือ BE-039 S2 ซ้ำ ไม่รัน DB/SQL จริง ไม่เปลี่ยน production code, repo tests, plan Status หรือ gates. ไม่ใช้การขาด DB จริง/full Login เป็นเหตุ FAIL.

## ผลรันเอง

หลักฐานดิบทั้งหมดอยู่ใน `reports/school-bot/normal-094/` ไม่คัดลอกเข้า knowledge.

| ชุด | ผ่าน | ไม่ผ่าน | ข้าม | หลักฐาน |
|---|---:|---:|---:|---|
| ชุดเดิม B ทั้งหมด | 4,176 | 0 | 0 | `check-wave2-runner/run-contentroot.log`; `bin/Debug/net10.0/xunit-results.json` |
| contract เดิม (รวมใน 4,176) | 7 | 0 | 0 | JSON เดียวกัน `ContractPassed=7` |
| scoped ที่ check เขียน | 5 | 3 | 0 | `check-wave2-gate/independent.log`; `bin/Debug/net10.0/results.json` |
| extra | 1 | 2 | 0 | JSON เดียวกัน; เพิ่มเพียง 3 เคส ≤20 |

VSTest สองครั้ง abort เพราะเชื่อม testhost ไม่ได้ใน 90 วินาที (exit 1); ไม่ถือเป็น regression. จึงใช้ `XunitTestFramework.GetExecutor(...).RunAll(...)` ของ xUnit เดิมผ่าน console ชั่วคราว ตั้ง `DOTNET_CLI_TELEMETRY_OPTOUT=1` และ `ASPNETCORE_TEST_CONTENTROOT_SCHOOLBOT_API=C:\src\schoolbright\target\school-bot\web\src\SchoolBot.Api`. รัน `dotnet build <reports>/check-wave2-runner/Runner.csproj --no-restore --disable-build-servers -m:1 -v:quiet` และ `dotnet <reports>/check-wave2-runner/bin/Debug/net10.0/Runner.dll` จาก `target/school-bot/web`: exit 0.

ชุดอิสระ: `dotnet build <reports>/check-wave2-gate/GateChecks.csproj --no-restore --disable-build-servers -m:1` แล้ว `dotnet <reports>/check-wave2-gate/bin/Debug/net10.0/GateChecks.dll`: exit 1. มี fixture JSON บน disk และแต่ละเคสอ่านด้วย adapter+FileSchoolBotBackingStore instance ใหม่; ไม่ใช้ static store เดิม. `<reports>` ในคำสั่งคือ `C:\src\schoolbright\reports\school-bot\normal-094`.

## Coverage ตาม pack

| AC / TP | expected → ผลจริงใน S1 |
|---|---|
| AC-027-04 / TP001-008 | License+สถานะคงเดิม: ผ่าน `LicenseStatusSurvivesNewStore`; commit fail ต้องไม่ค้าง: **ไม่ผ่าน F1** |
| AC-036-02 / TP001-022 | student/employee เลขเดียวกัน save/open เนื้อหาตน แยก school/kind: ผ่านสองเคส `ProjectContentSurvivesNewStore_*`; error path: **ไม่ผ่าน F1/F2** |
| AC-036-03 / TP001-008 | restart แล้วได้เนื้อหาที่บันทึก: ผ่านสองเคสข้างบน; revision commit fail ต้องไม่มีครึ่งรายการ: **ไม่ผ่าน F2** |
| AC-033-05 / TP001-052 | 6 records/82 properties/PK6 เป็น int32 ตรง DDL; value-type NULL และ UpdateDate ตรง: ผ่าน `SixRecordMappingsMatchDdl` |
| AC-033-05 / TP001-053 | catalog จริงส่งต่อ DBA-003/G-CORE ตามใบงาน; **ยังไม่รัน** ไม่อ้าง static เป็น catalog acceptance |
| AC-036-02 / TP001-023 | S1 ตรวจ active profile ทั้งสองชนิด, cross-school, ถอน License: ผ่าน `ActiveProfilesAndRevocationRecheck`; Login/device proof/channel/bind/rate limit จริงอยู่งาน auth downstream ไม่อ้างว่าพิสูจน์จาก adapter tests |

TP001-008 kill ระหว่าง commit และ TP001-022 lost response/Idempotency-Key ยังไม่ถูกพิสูจน์โดย S1 harness นี้; ทดสอบ commit fail แล้วพบความผิดจริงก่อน ไม่สรุปว่าครบ TP แบบ end-to-end. contract เดิม `SchoolBotDbAdapterContractTests.cs:38,85,158,201,257` พิสูจน์ happy-path restart/owner/type/recheck แต่ไม่ฉีด commit failure หรือ Login จริง.

## ข้อบกพร่องที่ทำให้ FAIL — ส่ง sys

[ขั้นตอนทำซ้ำ expected/actual และ source:line ของ F1/F2](check-094-wave2-gate-findings-001.md)

- **F1 · Important · TP001-008/022:** License create และ Project update แจ้ง commit fail แต่ cache คงข้อมูลที่ล้มเหลว และคำขอถัดไป commit ติดลง disk (สองเคสไม่ผ่าน).
- **F2 · Important · TP001-008/022:** revision commit fail แล้ว restart ยังเหลือ Project ชี้ revision ที่ไม่มี (หนึ่งเคสไม่ผ่าน).

แก้แล้วรัน failing cases ทั้งสามและ scoped suite เดิมซ้ำ.

## ผลข้าม task

- **DDL mapping ผ่านแบบ static:** 6 records/82 properties ตรงชื่อตาราง/คอลัมน์ใน `db/schoolbot_db.sql:30,50,141,163,181,198`; PK6=int4, legacy refs=int32, audit dates nullable. PublicJwk/Content ใช้ string แทน JSON payload ใน stub; ยังไม่พิสูจน์ Npgsql jsonb binding. `static-summary.json` บันทึก DDL32/PK32/UQ0/FK0/CHECK0 เพื่อยืนยัน mapping ไม่พึ่ง constraints; ไม่ใช่ตรวจรับ DBA ซ้ำ.
- **school context ไม่พบข้อขัดใน valid int32 domain:** `TenantRecheckService.cs:12,58` ใช้ SchoolId และ kind/profile แยก; `CurriculumAuthContracts.cs:23` ใช้ SchoolId แบบ long? จึงต้อง range-check ตอนต่อ adapter จริง. `CurriculumAuthorizationService.cs:124,136` ตรวจโรงเรียนและ active License; เคส `SchoolPrincipalAndLicenseContextRemainConsistent` ผ่านทั้งก่อน/หลัง revoke. ยังไม่มี caller เชื่อมสองบริการ จึงไม่อ้าง integration principal mapping สำเร็จ.
- **shared errors ไม่ชน:** `ErrorCodes.cs:29` เป็นต้นไป มี constants26 ไม่ซ้ำชื่อ/ค่า; `ApiErrors.cs:38` เพิ่ม VERSION_CONFLICT→412, SCHOOL_MISMATCH→403 โดยไม่เปลี่ยน mapping เดิม. Curriculum ส่ง status ใน result ของตน; ไม่มีเส้นทางที่ slice นี้โยน LICENSE_REQUIRED/FOUR_EYES_REQUIRED เข้า StatusFor. ชุด B เขียวครบ.
- **config/layers:** `DatabaseConnectionConfig.cs:20,32` แยก 5 connection keys ผ่าน env/config; ตรวจ 9 ไฟล์ scoped ไม่พบ embedded password/credential pattern. git tracked env มีเพียง example; ไม่อ่านหรือเผยค่า secret จริง. Application อ้าง abstractions/Domain และ Infrastructure implement ports. `Program.cs:45` ยังเลือก memory store จึงไม่อ้าง API จริงคงข้อมูลหลัง restart.

## Backlog และข้อจำกัด — ไม่ใช้ FAIL เพิ่ม

extra ไม่ผ่านสองเคส: (1) สอง adapter โหลด store เดียวก่อนเขียน แล้วสร้าง License สำเร็จสองครั้ง แต่ disk เหลือหนึ่งใบ (`TwoInstancesDoNotLoseAcknowledgedLicense`); lock/cache เป็นราย instance (`SchoolBotDbAdapter.cs:14,35`, `FileSchoolBotBackingStore.cs:10`). (2) session profile51 กลับผ่าน recheck สำหรับ profile50 ใน school เดียวกัน (`SessionProfileCannotAuthorizeAnotherProfile`; `TenantRecheckService.cs:58` ตรวจเพียง school). ปัจจุบัน helper ยังไม่มี production caller และ file store ไม่ใช่ deployment DB adapter; ยังไม่พิสูจน์เส้นทาง reachable ผ่าน gateway จึงส่ง sys/arch เป็นความเสี่ยงตอนต่อ integration ไม่ยกระดับเป็นเหตุ FAIL/security gate ของรอบนี้.

ไม่รัน DB/catalog/SQL, full Login/device integration, crash ระหว่าง filesystem write หรือ deploy. ไม่เปิด Security gate ใหม่ ไม่พบ Critical และเป็นการตรวจ S1 รอบแรก. ส่งนายช่าง→sys แก้ F1/F2; สถานะ verified เดิมของ DBA-002/004 และ BE-039 S2 คงเดิม.

## Change Log

- 2026-10-29 — check บันทึกผล wave gate อิสระและ verdict S1 พร้อมหลักฐานรันจริง.

FAIL
