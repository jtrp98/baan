# timetableai — Review Round 9 — remediation:SEC-03

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim

## Findings

ไม่มี finding ใหม่ในขอบเขต remediation:SEC-03

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|

ตารางนี้ครอบเฉพาะ remediation:SEC-03; findings เดิมของ FE-021/UX-007 อยู่ใน `round-8.md` และไม่ได้รับการตัดสินใหม่ในรอบนี้

## Round 9

**Verdict:** PASS

| Task | Verdict |
|---|---|
| remediation:SEC-03 | PASS |

- **ขอบเขตยืนยัน:** well-specified direct fix ตามคำอนุมัติ jtrp98 วันที่ผู้ใช้ระบุ 09/10/2026 (Change Log 2026-10-09); ลบ System.Linq.Dynamic.Core ที่ไม่ใช้ และแก้ dependency advisory ของ Newtonsoft.Json พร้อมรักษา API/auth เดิม ไม่ใช่ canonical task ใน `plan\index.md`
- **Manifest:** `AITimeTableBackend/AITimeTableBackend.csproj:14` ลบ direct reference ของ System.Linq.Dynamic.Core 1.2.20 และเพิ่ม Newtonsoft.Json 13.0.4; target ยังคง net10.0 ไม่มีการเปลี่ยน framework/package อื่น
- **การใช้งานจริง:** `Controllers/MenuController.cs:79` deserialize upstream menu; `Controllers/WebAPIController.cs:110` deserialize TokenModel, `:739` deserialize period config และ `:767` serialize period config จึงต้องคง Newtonsoft.Json ไว้เป็น direct dependency
- **Using/LINQ:** ลบ namespace Dynamic.Core จากสอง controller และ Dynamic.Core.Tokenizer จาก helper; System.Linq ยังคงอยู่ (`MenuController.cs:23`, `WebAPIController.cs:22`, `HTTPHeaderParseService.cs:9`) query ที่ตรวจใช้ lambda/query syntax ไม่พึ่ง Dynamic LINQ การลบ using ไม่เปลี่ยน expression/query ที่ทำงานอยู่
- **API/auth:** exact diff ที่ driver ส่งระบุว่าการเปลี่ยน source มีเฉพาะ using และ newline; source ปัจจุบันยังมี [Authorize] ที่ controller, JWT Decode verify:true (`WebAPIController.cs:105`), typed token deserialization และ error handling เดิม; helper ยังคง lookup token/user/teacher จาก DB เดิม ไม่เปลี่ยน route, payload, permission หรือ token validation
- **Dependency resolution:** direct reference ที่ไม่เป็น floating version ทำให้ Newtonsoft.Json 13.0.4 เป็นตัวเลือกตรงใน graph ตาม [NuGet direct-dependency-wins](https://learn.microsoft.com/en-us/nuget/concepts/dependency-resolution#direct-dependency-wins); [NuGet package metadata](https://www.nuget.org/packages/Newtonsoft.Json/13.0.4) มี compatible net6.0 asset ใช้กับ net10.0 ได้ ทั้งนี้ restored graph จริงและ assembly ที่ runtime โหลดต้องยืนยันโดย QA
- **Advisory:** 13.0.4 สูงกว่า patched version 13.0.1 ของ [GHSA-5crp-9r3c-p9vr / CVE-2024-21907](https://github.com/advisories/GHSA-5crp-9r3c-p9vr); [release 13.0.1 ของ maintainer](https://github.com/JamesNK/Newtonsoft.Json/releases/tag/13.0.1) เปลี่ยน default MaxDepth เป็น 64 จึงคาดว่าจะปฏิเสธ deeply nested JSON ตามเจตนาการแก้ advisory ส่วน ordinary token/menu/period JSON ให้ QA ตรวจ regression
- **หลักฐานจาก driver:** exact diff ของทั้ง 4 ไฟล์มีเฉพาะ package reference, using และ newline; driver ส่งผล rg ใน production source หลังแก้ (`*.cs`/`*.csproj`, ไม่รวม bin/obj) สำหรับ Dynamic.Core/DynamicQueryableExtensions/DynamicExpressionParser/ParsingConfig/Tokenizer: exit 1 = NO_MATCHES โดย reviewer ไม่รัน git และไม่ขยายอ่านไฟล์ code นอก scope
- **ข้อจำกัด:** reviewer ไม่รัน restore/build/test หรือ vulnerability audit และไม่อ่าน `security.md`/`qa\`; ไม่แก้หรืออ่าน staged `AITimeTableBackend.Tests/TermValidationTests.cs` การ PASS นี้เป็น static code review ของ direct fix เท่านั้น ต้องส่ง qa-engineer แล้ว security re-audit ก่อนปิด SEC-03; production gate เดิมยังคงอยู่
- **เอกสารเดิม:** พบ `round-8.md` ของ FE-021 มีอยู่ก่อน แต่ขาด pointer ใน index; ตาม driver อนุญาตให้อ่าน metadata และเติม round/finding pointers ตามไฟล์จริงเท่านั้น ไม่แก้เนื้อหาหรือ verdict เดิม และไม่ได้ให้ PASS แก่ FE-021

## Reviewed

Code root: `C:\src\schoolbright\target\sb-api-academic-timetable-ai`

- `AITimeTableBackend/AITimeTableBackend.csproj`
- `AITimeTableBackend/Controllers/MenuController.cs`
- `AITimeTableBackend/Controllers/WebAPIController.cs` (source ในขอบเขต dependency/using/API/auth และจุด JsonConvert)
- `AITimeTableBackend/Helpers/HTTPHeaderParseService.cs`
- `index.md` ของ module; `plan/index.md` §Waiting on Human; `review/index.md`; `review/round-7.md`; `review/round-8.md` เฉพาะ metadata เพื่อซ่อม pointer
- `CLAUDE.md`; `.claude/agents/reviewer.md`; policies coding/documentation; `templates/review-round.md`; exact diff/usage evidence จาก driver และ primary sources ที่ลิงก์ใน Review Notes

## Change Log

- 2026-10-09 — Round 9 (remediation:SEC-03) — PASS; ไม่มี finding ใหม่ ใช้เลข 9 เพราะ round 8 มีอยู่แล้ว; next: qa-engineer → security re-audit

Back-links: `plan\index.md` · `..\index.md`