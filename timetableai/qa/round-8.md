# timetableai — QA Round 8 — remediation:SEC-03

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` · direct fix ตามคำอนุมัติ jtrp98 วันที่ 09/10/2026; ไม่ใช่ canonical plan task

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|

ไม่มี QA defect ใหม่ใน SEC-03; security finding เดิมต้องให้ security ตัดสินหลัง re-audit

## Round 8

**Status:** ✅ Verified

### Checks run

รันจาก `C:\src\schoolbright\target\sb-api-academic-timetable-ai`:

| Check | Command | Result |
|---|---|---|
| typecheck | — | not run แยกจาก build |
| lint | — | not run; ไม่มีคำสั่งใน brief |
| build | — | not run ใน QA; driver แจ้ง build ผ่านก่อน handoff |
| test | `dotnet test AITimeTableBackend.sln --no-build --no-restore --nologo` | pass, exit 0; 125 passed / 0 failed / 0 skipped |
| graph | `dotnet list AITimeTableBackend/AITimeTableBackend.csproj package --include-transitive --no-restore` | pass, exit 0; Newtonsoft.Json requested/resolved 13.0.4; ไม่มี Dynamic.Core |
| advisory | `dotnet list AITimeTableBackend.sln package --vulnerable --include-transitive --no-restore` | exit 0; backend และ tests ไม่มี vulnerable packages ตาม current sources |
| production symbols | `rg -n 'System\.Linq\.Dynamic\.Core\|DynamicQueryableExtensions\|DynamicExpressionParser\|ParsingConfig\|Dynamic\.Core\.Tokenizer' AITimeTableBackend -g '*.cs' -g '*.csproj' -g '!bin/**' -g '!obj/**' -g '!**/bin/**' -g '!**/obj/**'` | rg exit 1 = ไม่มี matches; ไม่ค้น appsettings |

คำสั่ง test ครั้งแรกใน sandbox คืน exit 1 ไม่มี output (ไม่ถือว่าทดสอบผ่าน); retry คำสั่งเดิมด้วย `require_escalated` ตามสิทธิ์ผู้ใช้ได้ผลข้างต้น. graph/advisory ใช้ `require_escalated`; audit ใช้ `https://api.nuget.org/v3/index.json` และ local NuGetPackages. ผล test/audit ไม่มี warning หรือ advisory เพิ่ม.

ตรวจ metadata ด้วย PowerShell `ConvertFrom-Json` เฉพาะ dependency: `obj/project.assets.json`, production/test `bin/Debug/net10.0/*.deps.json` ระบุ `Newtonsoft.Json/13.0.4` ไม่มี Dynamic.Core; DLL ทั้งสอง output มี FileVersion `13.0.4.30916`, ProductVersion `13.0.4+4e13299d4b0ec96bd4df9954ef646bd2d1b5bf2a`; AssemblyName.Version ของ production DLL = `13.0.0.0` (assembly version ไม่ใช่ NuGet package version).

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| remediation:SEC-03 | verified | tests 125/125, graph/assets/runtime output 13.0.4, production rg ไม่มี matches; review round 9 PASS |

| เกณฑ์ direct fix | ผล | หลักฐาน |
|---|---|---|
| ไม่มี Dynamic.Core dependency/using/symbol ใน production | ✅ Verified | graph + production rg; csproj มีเพียง direct Newtonsoft.Json ที่เพิ่ม |
| Newtonsoft.Json resolve 13.0.4 | ✅ Verified | `AITimeTableBackend/AITimeTableBackend.csproj:14`, graph, assets/deps และ DLL metadata |
| behavior เดิมใน automated suite | ✅ Verified | 125 tests ผ่าน; รวม staged `AITimeTableBackend.Tests/TermValidationTests.cs` ซึ่งเป็นงานเดิมของผู้ใช้ ไม่อ่าน/แก้ไฟล์นี้ |
| review findings ใน SEC-03 | ✅ Verified | `review/round-9.md` ไม่มี finding ใหม่; QA ไม่ตัดสิน FE-021 ใหม่ |

### Feature QA flows

ไม่ใช่ Feature QA; ไม่รัน live HTTP/shared DB. ก่อน test ตรวจ test csproj ใช้ EF InMemory 9.0.11 และ `TestSupport.cs:64` override master context เป็น `UseInMemoryDatabase`; fake permission resolver คืน canned results. ใช้ suite ที่ build แล้วตาม brief.

### Data Model check

อ่าน `design/data-model.md` เต็มแล้ว; SEC-03 เปลี่ยน package/using ไม่แตะ entity/schema/DDL จึงไม่มี changed field ให้เทียบใน direct fix นี้. ไม่ตรวจ schema ของงานอื่นซ้ำ.

### Issues Found (defect packet — 1 ข้อ = 1 QA-NNN)

ไม่มี defect ใหม่; ไม่พบ additional advisory จาก current sources. `WebAPIController.cs:32,105,110` ยังมี Authorize, verify:true และ typed token JSON; `MenuController.cs:34,79` ยังมี Authorize และ menu JSON; period JSON ที่ `WebAPIController.cs:739,767` ยังคงอยู่. ไม่แก้ code/plan Status/UX และไม่ใช้ state-changing git.

🔒 Security gate: auth/untrusted JSON ใน code ที่ตรวจ → next role `security` re-audit SEC-03. QA ไม่ปิด security finding หรืออนุมัติ production deploy; gate ของ SEC-01/SEC-02 และการพัก production ตาม Waiting on Human คงเดิม.

## Unverified Behaviour — undeployed phases

- SEC-03: suite ที่ผ่านไม่พิสูจน์ทุก production payload; menu upstream/period JSON/live DB และ deeply nested JSON ไม่ได้ทดสอบ end-to-end. DLL/deps ยืนยัน artifact version ไม่ใช่การสังเกต production process.
- Phase 6 (FE-011): Menu ID 401..404, 422 deployment cutover ใน master DB (`SA-Q14`) ต้องได้รับการตรวจสอบโดย DevOps/เจ้าของระบบ SB ก่อน deploy production (carry forward จาก round 7).
- ยังไม่ deploy/migrate หรือรับงานแทนผู้ใช้; security re-audit เป็นขั้นถัดไป.

## Change Log

- 2026-10-09 — Round 8 remediation:SEC-03 ✅ Verified; tests 125/125, resolved Newtonsoft.Json 13.0.4, ไม่พบ Dynamic.Core/current advisory; ส่ง security re-audit. วันที่จากผู้ใช้ jtrp98 09/10/2026.

Back-links: `plan\index.md` · `..\index.md`