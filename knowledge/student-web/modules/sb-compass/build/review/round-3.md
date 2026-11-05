# Phase 3: Module C — National Stats Alignment (REQ-004 → REQ-012) — archived rounds

> Archived on 2026-08-26 when the phase closed (Review Outcome: ✅ Verified FULL). Moved verbatim
> per `policies/documentation.md` §4 — not summarized, not pruned. Live material (Open Issues, the
> Phase 1 current round, the Knowledge sync relay table, `## Unverified Behaviour`) stayed in
> `review.md` and is not duplicated here.

## Verification Summary (current round) — Phase 3

**Phase 3 (Module C — National Stats Alignment, REQ-004 × REQ-012), sb-compass — Mode: FULL**

ตรวจครบทั้ง 4 task (BE-014, BE-015, BE-016, BE-017) ใน `ClassOnlineWeb\Helper\CompassRankingService.cs`
เทียบกับ `## National Stats Batch Rules` ใน `design.md` ทีละแถวของตาราง "สิ่งที่เปลี่ยน" บวกกับ
scope-discipline check ทั้งโปรเจกต์ (`Grep` หา caller ทั้งหมดของ `AggregateByCanonicalSubject` และ
`AggregateByCanonicalSubjectWeighted`)

**Build/compile check — รันซ้ำจริงในรอบนี้ตามที่ backend-engineer รายงานว่าทำไม่ได้ใน sandbox
ของตัวเอง** ("solution's other projects fail to restore — missing NuGet packages/VS web-application
targets"): รัน `MSBuild.exe` (VS2022 Community) กับ `ClassOnlineWeb\sb-web-student.sln` แบบเต็ม
(`-t:Build -p:Configuration=Debug -m`) เหมือน Phase 1 round ทุกประการ — **ผลลัพธ์: สำเร็จ, exit
code 0**, ทุก dependency project (`SchoolBright.DTO`, `PostgreSQL`, `JabjaiSchoolHistoryEntity`,
`AccountingDB`, `PostgreSQLLogs`, `JabjaiEntity`, `TemplateBuilder`, `Jabjai.Object`, `MasterEntity`,
`Jabjai.Common`, `JabjaiAttendance`, `SchoolBright.Helper`, ฯลฯ) restore และ build ผ่านหมด ไม่มี
error แม้แต่บรรทัดเดียว (`grep -i error` ทั้งไฟล์ log ไม่พบ error ใด ๆ นอกจากคำว่า "error" ที่อยู่ใน
ข้อความ warning เรื่อง assembly binding redirect) `ClassOnlineWeb -> ...\bin\ClassOnlineWeb.dll`
compile ผ่าน ไม่มี warning ใดพาดพิง `CompassRankingService.cs`, `CompassScoreService.cs`, หรือ
`CompassApiController.cs` เลย — **ข้อกล่าวอ้างของ backend-engineer ไม่เป็นจริงในสภาพแวดล้อมนี้**
เช่นเดียวกับที่พบใน Phase 1 round เป๊ะ (สภาพแวดล้อม sandbox ของ backend-engineer เองมีปัญหาบางอย่าง
ที่ไม่เกี่ยวกับโค้ดที่แก้ในรอบนี้ — ยืนยันด้วยหลักฐาน build จริงสองรอบติดต่อกันแล้วว่าโค้ด Phase 3
compile ผ่านสมบูรณ์)

**`node .claude/scripts/static-analysis-gate.js`**: รันแล้ว — เหมือน Phase 1 ทุกประการ:
`lint`/`format`/`typecheck`/`build`/`test` ทั้งหมด **skip** (โปรเจกต์ ASP.NET/.NET Framework ไม่มี
`package.json` ของแอปจริง) `security_scan`/`dependency_scan` ผ่าน (`PASS`) แต่ไม่มีความหมายกับแอป
.NET — ไม่ถือเป็น security sign-off

**`node .claude/scripts/check-schema-contract.js`**: รันแล้ว — รายงาน "No schema.prisma found yet"
ตรงตามบริบทเดิม (module นี้ไม่ใช้ Prisma โดยเจตนา, DEP-04) **Phase 3 นี้เป็น "data break ไม่ใช่
schema break" ตามที่ `design.md`'s `## National Stats Batch Rules` ระบุไว้เอง** — ยืนยันด้วยการอ่าน
`EnsureTables()` ในโค้ดจริงว่าโครงสร้างตาราง `compass_level_subject_stat`/`compass_student_level_score`
ไม่เปลี่ยนแปลงจาก Phase 1 เลย (คอลัมน์เดิมทุกคอลัมน์) — มีแต่ **สูตรคำนวณค่าที่เขียนลงตารางเปลี่ยน**
ตรงตามที่ design คาดไว้

**ไม่มี automated test framework** (เหมือน Phase 1) — การตรวจรอบนี้คือการอ่านโค้ดจริงเทียบกับ
`## National Stats Batch Rules` บวก compile check จริง ไม่ใช่การรันเทสต์ — ดู `## Unverified
Behaviour` ด้านล่าง

**พบไฟล์ที่ใช้ร่วมกันข้าม phase เปลี่ยนแปลงระหว่างรอบ (shared-code watchlist)**:
`ClassOnlineWeb\Controllers\Api\CompassApiController.cs` มีขนาดใหญ่ขึ้นจาก manifest ของ Phase 1
(859 บรรทัด/54171 bytes → **872 บรรทัด/54946 bytes**) ตรวจแล้วว่าเป็นงาน **Phase 2 (Module B) ที่
กำลังทำอยู่จริง** (`IsRecomputeNetworkAllowed`/`CompassNetworkAccessGuard` — IP allowlist ชั้นที่ 1
ของ `recompute/national-stats`/`recompute/status` ตาม DES-005/REQ-014 พร้อม TODO comment ระบุชัดว่า
รอ BE-004/BE-013 สำหรับชั้น entitlement ที่ 2) **ไม่กระทบ Phase 3**: จุดที่ Phase 1/Phase 3 แตะ
(`CalculateScore` บรรทัด 249-286 เรียก `AggregateByCanonicalSubjectWeighted` บรรทัด 257,
`Math.Round(a.AverageScore, 2)` บรรทัด 270) **ยังเหมือนเดิมทุกตัวอักษร** ไม่ถูกแก้ทับ — บันทึกไว้
เป็นข้อมูลสำหรับรอบ Phase 2 ในอนาคต ไม่ใช่ finding ของ Phase 3 นี้

## Verified File Manifest — Phase 3 (sb-compass)

| File | Bytes | Lines | Round |
|---|---:|---:|---|
| `ClassOnlineWeb\Helper\CompassRankingService.cs` | 29303 | 583 | Phase 3 FULL (this round) |
| `ClassOnlineWeb\Helper\CompassScoreService.cs` | 16125 | 316 | Phase 3 FULL (this round) — เหมือนเดิมจาก Phase 1 manifest ทุกไบต์ (ไม่ถูกแตะ) |
| `ClassOnlineWeb\Controllers\Api\CompassApiController.cs` | 54946 | 872 | Phase 3 FULL (this round) — **เปลี่ยนจาก Phase 1 manifest** (54171→54946 bytes, 859→872 บรรทัด) เพราะงาน Phase 2 (WIP) ไม่ใช่ Phase 3 — ดู Verification Summary |

## Per-Task Results — Phase 3 (this round)

- ✅ **[backend]** `BE-014` (DES-003) — `RecomputeAsync` บรรทัด 362: `var subjAvgs =
  AggregateByCanonicalSubjectWeighted(rows);` แทนที่ `AggregateByCanonicalSubject` เดิม
  ตรงตำแหน่งที่ `plan.md`/`design.md` ระบุ (`:362`) เป๊ะ — ยืนยันแล้วว่าเป็นเมธอดถ่วงน้ำหนักตัวเดียวกับ
  ที่ BE-001 สร้างและผ่านการตรวจแล้วใน Phase 1 (ไม่ใช่การคัดลอกสูตรใหม่)
- ✅ **[backend]** `BE-015` (DES-003) — `RecomputeAsync` บรรทัด 365: `double overall =
  Math.Round(subjAvgs.Average(a => a.AverageScore), 2);` **โค้ดไม่ถูกแก้** ตามที่
  backend-engineer รายงาน — ตรวจเหตุผลแล้วว่าถูกต้อง: `design.md`'s `## National Stats Batch
  Rules` ระบุไว้ตรง ๆ ว่า "`overall_avg` = ค่าเฉลี่ยธรรมดาของคะแนนกลุ่มสาระ (ที่ถ่วงน้ำหนักมาแล้ว
  ในชั้นก่อนหน้า) ไม่ใช่การถ่วงน้ำหนักซ้ำอีกชั้น — หน่วยกิตถูกใช้ไปแล้วตอนยุบวิชาย่อยเข้ากลุ่มสาระ"
  เพราะ `subjAvgs` (ตัวแปรที่ `.Average()` ทำงานอยู่) ตอนนี้มาจาก `AggregateByCanonicalSubjectWeighted`
  (BE-014) ซึ่งแต่ละสมาชิกเป็นคะแนนกลุ่มสาระที่ถ่วงน้ำหนักด้วยหน่วยกิตแล้ว การเรียก `.Average()`
  ทับอีกชั้นจึงเป็น**ค่าเฉลี่ยธรรมดาของค่าที่ถ่วงน้ำหนักแล้ว** ตรงตามสัญญาเป๊ะ ไม่ใช่การถ่วงน้ำหนักซ้ำ
  (double-weighting จะเกิดก็ต่อเมื่อมีการเอาหน่วยกิตมาคูณอีกรอบที่ชั้นนี้ ซึ่งไม่มี) — **ยืนยัน:
  ข้อสรุปของ backend-engineer ถูกต้อง ไม่ต้องแก้บรรทัดนี้**
- ✅ **[backend]** `BE-016` (DES-003) — `RecomputeAsync` บรรทัด 375-384 (`sub.Sum +=
  sa.AverageScore; sub.Count++;`) และบรรทัด 409 (`Math.Round(sub.Value.Sum / sub.Value.Count, 2)`)
  **โค้ดไม่ถูกแก้เช่นกัน** ด้วยเหตุผลเดียวกัน — ตรวจแล้วว่าถูกต้อง: `sa` ใน `foreach (var sa in
  subjAvgs)` วนอยู่บน `subjAvgs` ตัวเดียวกับ BE-014/BE-015 (มาจาก `AggregateByCanonicalSubjectWeighted`
  แล้ว) ดังนั้น `sub.Sum`/`sub.Count` ที่สะสมข้ามนักเรียนทุกคนในระดับชั้น×กลุ่มสาระเดียวกัน จึงเป็น
  ผลรวม/จำนวนของ**ค่าที่ถ่วงน้ำหนักแล้ว** และ `mean_score` ที่คำนวณบรรทัด 409 คือ**ค่าเฉลี่ยของค่าที่
  ถ่วงน้ำหนักแล้ว** ตรงตามที่ design.md ระบุ ("เปลี่ยนจากเฉลี่ยของค่าเฉลี่ยดิบ เป็นเฉลี่ยของค่าที่
  ถ่วงน้ำหนักแล้ว") — ไม่มีการถ่วงน้ำหนักซ้ำที่ชั้นนี้เช่นกัน
- ✅ **[backend]** `BE-017` (DES-003) — `GetStudentNationalStatsAsync` บรรทัด 173: `var agg =
  AggregateByCanonicalSubjectWeighted(scores);` แทนที่ `AggregateByCanonicalSubject` เดิม
  ตรงตำแหน่งที่ระบุ (`:173`, design.md อ้าง `:175` ซึ่งเป็นบรรทัดที่ใช้ `agg` จริง — ทั้งสองจุดตรวจ
  แล้วว่าถูกต้อง) บรรทัด 175 (`Math.Round(agg.Average(a => a.AverageScore), 2)`) ไม่ถูกแก้ ด้วย
  เหตุผลเดียวกับ BE-015 (ถูกต้อง — `agg` ตอนนี้เป็นค่าถ่วงน้ำหนักแล้วตั้งแต่ต้นทาง) ผลคือ **live
  request-time `overall` ตอนนี้ใช้สูตรเดียวกับที่ batch (`RecomputeAsync`) ใช้ทุกประการ** ซึ่งเป็น
  จุดประสงค์หลักของ Phase นี้ (ป้องกัน `RankInLevel` เพี้ยนจากการเทียบเลขถ่วงน้ำหนักกับเลขไม่ถ่วงน้ำหนัก
  ตามที่ design.md อธิบายไว้ใน "ทำไมต้องเปลี่ยนทั้งคู่พร้อมกัน")

**ตรวจ scope discipline** (`Grep` หา caller ทั้งหมดของทั้งสองเมธอดในทั้งโปรเจกต์ — ผลลัพธ์ครบ 8 จุด):
- ฝั่งฟรี/debug ที่ยังใช้ unweighted ถูกต้องตามที่ควร: `CompassApiController.cs:41`
  (`analyst/{sID}` ฟีเจอร์ฟรี — DES-001 ห้ามแตะ), `CompassApiController.cs:762` (`debug/scores`),
  `CompassRankingService.cs:240` (`GetStudentStatDiagnosticAsync`, ใช้โดย `debug/my-stat` เท่านั้น)
- ฝั่ง premium ที่ใช้ weighted ถูกต้องตามที่ควร: `CompassApiController.cs:256`
  (`calculate/score`, Phase 1 BE-002), `CompassApiController.cs:804` (helper Phase 1 BE-003),
  `CompassRankingService.cs:173` (BE-017, รอบนี้), `CompassRankingService.cs:362` (BE-014, รอบนี้)

**เรื่องที่ backend-engineer flag ว่าจงใจไม่แตะ — `GetStudentStatDiagnosticAsync` (บรรทัด 237-311,
เรียก `AggregateByCanonicalSubject` เดิมที่บรรทัด 240)**: ตรวจแล้ว **ถูกต้อง** — เมธอดนี้เป็น
debug-only tool (ใช้โดย `debug/my-stat` เท่านั้น, docstring ระบุชัดว่า "DIAGNOSTIC: reports exactly
why a given student's calculate/score is returning zeros") ไม่ใช่ path ที่ REQ-004/REQ-012 หรือ
`## National Stats Batch Rules` ผูกไว้ — ตารางทั้ง 4 แถวใน `## National Stats Batch Rules` (ที่
BE-014–017 ครอบคลุมครบแล้ว) ไม่มีแถวใดพาดพิงเมธอดนี้เลย และ `plan.md`'s Phase 3 task table ก็ไม่ได้
ตั้งชื่อเมธอดนี้ไว้ — **ไม่ใช่งานที่ตกหล่น เป็นขอบเขตที่ถูกต้องแล้ว**

## Design/requirement contract checks — Phase 3

**Data Model**: Phase 3/Module C **ไม่มี schema change ใด ๆ** — ยืนยันทั้งจาก `design.md`
(`## National Stats Batch Rules`: "นี่เป็น data break ไม่ใช่ schema break — โครงสร้างตารางเหมือนเดิม
ทุกคอลัมน์") และการอ่านโค้ดจริง (`EnsureTables()` ใน `CompassRankingService.cs` ไม่เปลี่ยนแปลงจาก
Phase 1 — ยังเป็น 2 ตาราง + 1 index เดิมทุกคอลัมน์) `check-schema-contract.js` รายงาน "No
schema.prisma found yet" ตรงตามบริบทเดิม (DEP-04) — schema comparison ที่มีความหมายสำหรับ Phase 3
คือการยืนยันว่า**โครงสร้างตารางไม่เปลี่ยน มีแต่สูตรคำนวณค่าที่เขียนลงตารางเปลี่ยน** ซึ่งตรวจแล้วว่าจริง

**Business rule contract** (`## National Stats Batch Rules` ใน `design.md`, REQ-004 + REQ-012
ใน `requirement.md`): ตรวจครบทั้ง 4 แถวของตาราง "สิ่งที่เปลี่ยน" (batch subject-group score, batch
`overall_avg`, batch `mean_score`, request-time `overall`) — ดู Per-Task Results ด้านบน โดยเฉพาะ
BE-015/BE-016 ที่ backend-engineer เลือกไม่แก้โค้ดแต่พึ่งพาผลจาก BE-014 แทน — ตรวจแล้วว่าเหตุผลถูกต้อง
ทั้งสองจุด ไม่ใช่การ double-weight และไม่มีข้อใดขาดหรือเบี่ยงจาก contract อีกทั้งยืนยัน "ทำไมต้องเปลี่ยน
ทั้งคู่พร้อมกัน" (batch + request-time) ครบทั้งสองฝั่งแล้วจริง (BE-014/015/016 ฝั่ง batch, BE-017 ฝั่ง
request-time) ซึ่งเป็นเงื่อนไขที่ design.md ย้ำว่าจำเป็นเพื่อไม่ให้ `RankInLevel` เพี้ยน

## Issues Found — Phase 3

ไม่มี — ทั้ง 4 task (BE-014, BE-015, BE-016, BE-017) ผ่านครบตาม contract รวมถึงการตรวจสอบเหตุผลของ
backend-engineer ที่เลือกไม่แก้โค้ดบางบรรทัด (BE-015/BE-016) ก็ถูกต้อง ไม่มีอะไรต้องส่งกลับ

## Review Outcome — Phase 3

**Status:** ✅ Verified (FULL)

**Phase 3 (Module C — National Stats Alignment, REQ-004 × REQ-012) ผ่านครบทุก task (BE-014, BE-015,
BE-016, BE-017)** — ตรวจด้วยการอ่านโค้ดจริงเทียบกับ `## National Stats Batch Rules` ทีละแถวของตาราง
"สิ่งที่เปลี่ยน" รวมถึงตรวจเหตุผลของ backend-engineer ที่เลือก**ไม่แก้โค้ด**สองจุด (BE-015 บรรทัด 365,
BE-016 บรรทัด 375-384/409) เพราะพึ่งพาผลจาก BE-014 แทน — ยืนยันแล้วว่าเหตุผลถูกต้องทั้งสองจุด ไม่ใช่
การ double-weight และยืนยันด้วย **compile จริง** (`MSBuild.exe` เต็ม solution — สำเร็จ, exit 0,
ไม่มี error) ซึ่งหักล้างข้อกล่าวอ้างของ backend-engineer ว่า sandbox ของตัวเองทำไม่ได้เพราะ
"solution's other projects fail to restore" — build จริงในสภาพแวดล้อมนี้ (เหมือน Phase 1 round)
ไม่พบปัญหานี้เลย ทุก dependency project restore/build ผ่านหมด ไม่มี error หรือ warning ใดพาดพิงไฟล์
ที่แก้ในรอบนี้

**เรื่องที่ backend-engineer flag ว่าจงใจไม่แตะ** (`GetStudentStatDiagnosticAsync`, debug-only,
ใช้ `AggregateByCanonicalSubject` เดิม) — ตรวจแล้วว่า**ถูกต้อง** ไม่ใช่งานที่ตกหล่น เมธอดนี้ไม่ได้
ถูกตั้งชื่อใน BE-014–017 และไม่ปรากฏในตาราง "สิ่งที่เปลี่ยน" ของ `## National Stats Batch Rules` เลย

**ไม่มี Security gate บน Phase 3** — `plan.md` ไม่ flag ไว้ และตรวจอิสระแล้วว่า Phase 3 เปลี่ยนแค่
สูตรคำนวณค่าที่เขียนลงตารางสถิติที่มีอยู่แล้ว ไม่เพิ่ม endpoint ใหม่ ไม่เปลี่ยนกลไก auth/สิทธิ์ ไม่รับ
input จากภายนอกใหม่ ไม่เปิดเผยข้อมูลส่วนบุคคลเพิ่มเติมเกินกว่าที่ Phase 1 เปิดเผยไว้แล้ว — ตรงกับ
`design.md`'s DES-003 ที่ระบุไว้เองว่า "straightforward แต่มี deployment step บังคับ" (ไม่ใช่ sensitive
ด้าน auth/data exposure) ไม่ต้องส่งต่อ `security` สำหรับ phase นี้

**พบไฟล์ที่ใช้ร่วมกัน (`CompassApiController.cs`) มีงาน Phase 2 (WIP) อยู่ระหว่างตรวจ** — ตรวจแล้วว่า
ไม่กระทบจุดที่ Phase 1/Phase 3 แตะเลย (`CalculateScore` ยังเรียก `AggregateByCanonicalSubjectWeighted`
เหมือนเดิมทุกตัวอักษร) บันทึกไว้เป็นข้อมูลสำหรับรอบ Phase 2 ในอนาคต ไม่ใช่ finding ของรอบนี้

**Deploy eligibility**: รอบนี้เป็น FULL round แรกของ Phase 3 — **ผ่านเกณฑ์ FULL ที่จำเป็นก่อนส่งต่อ
`devops` แล้ว** (ยังต้องรอ `plan.md` Status cell ถูก sync จริงก่อน) **แต่ Phase 3 มีเงื่อนไข deploy
บังคับที่ไม่ใช่ QA gate**: หลัง deploy Phase 3 ต้องสั่ง recompute สถิติทั้งเครือข่ายทันที (`?limit=0`)
ก่อนเปิดหน้า Premium ให้ผู้ใช้ ตาม `## National Stats Batch Rules`/RISK-01 — เป็นหน้าที่ `devops`
อ่านจาก `design.md` โดยตรง ไม่ผ่านการยืนยันของ `devops` แล้วไม่ถือว่า deploy ได้

**สถานะ three-repo sync**: การตัดสินใจนี้ (✅ Verified ทั้ง 4 task) ยังไม่ปรากฏใน `plan.md` จริง
จนกว่า BA-lane session จะ apply ตาราง `## Knowledge sync — three-repo mode` ด้านบนเข้ากับ Status
cell ของ BE-014/BE-015/BE-016/BE-017 ใน Knowledge repo (พร้อมกับแถว BE-001/002/003 ของ Phase 1 ที่
ยังค้าง sync อยู่จากรอบก่อน) และ `_docs/status.md` (Knowledge-side) ก็ต้องถูก regenerate หลังจากนั้น
ด้วย **จาก Knowledge workspace** (เครื่องนี้ไม่มีสิทธิ์เขียนไฟล์ฝั่ง Knowledge เลย)

**ขั้นต่อไปตาม `plan.md` Sequencing Notes**: Phase 3 (Module C) เสร็จแล้ว (รอ sync) **Phase 3 เอง
ไม่ได้ปลดล็อกอะไรเพิ่มเติม** — **Phase 4 (Module D) ยังคงถูกล็อกอยู่** เพราะต้องรอทั้ง Phase 1 (ผ่าน
แล้ว, รอ sync) **และ** Phase 2 (Module B — ยังไม่เสร็จ กำลัง WIP ตามที่พบใน `CompassApiController.cs`)
ตาม DEP-02 — **การที่ Phase 3 ผ่านไม่ได้ทำให้ Phase 4 ปลดล็อก** ต้องรอ Phase 2 เสร็จและผ่าน QA ก่อน
เท่านั้น

---

# Phase 3 FULL round (2026-09-15, Round 3) — moved verbatim from review.md by the Phase 4 round, 2026-09-15

## Verification Summary

- **Mode: FULL** — all 4 tasks in Phase 3 (BE-014, BE-015, BE-016, BE-017) verified. Closes Phase 3.
- **Round**: 3 (post-restart), 2026-09-15.
- **Mechanical Gate**:
  - `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -p:Configuration=Debug -clp:ErrorsOnly -nologo` from `C:\src\sb-web-student` → **PASS** (exit code 0).
  - Schema contract: **n/a** — no Prisma schema in this project; the SQL DDL contract (DES-012/DES-011) was verified by reading `EnsureTables`/`EnsureTable` against `design.md` `## Data Model` group 1 (see BE-014).
  - Security audit: Phase 3 adds no auth surface and touches no sensitive data beyond what Phases 1–2 already gated (`recompute/*` two-layer gating from Phase 2 still fronts this batch). No `🔒 Security gate` is flagged for Phase 3 in `plan.md`; none added.
- **Closed-round archives**: the Phase 2 FULL round and the BE-003 part-2 TARGETED round previously inline here moved verbatim to `review/phase-2.md` and `review/phase-1.md` (appended) by this round, per review.md's own archiving discipline.

## Verified File Manifest — Phase 3

| Path | Lines verified | Change / Purpose |
|---|---|---|
| `ClassOnlineWeb/Helper/CompassRankingService.cs` | `31-639` (whole file) | BE-014..BE-017: weighted batch + request-time aggregation, `"StddevScore"` population stddev, PascalCase DDL/queries |
| `ClassOnlineWeb/Helper/CompassMbtiStore.cs` | `1-103` (whole file) | BE-014 rename half: 3 `TCompassMbtiResult` points, PascalCase DDL, quoted `ON CONFLICT` |
| `ClassOnlineWeb/Helper/CompassScoreService.cs` | `214-287` | Blast radius: `AggregateByCanonicalSubject` and `AggregateByCanonicalSubjectWeighted` unchanged vs FULL-verified 2026-09-02 form |
| `ClassOnlineWeb/Controllers/Api/CompassApiController.cs` | `30-65` | Blast radius: free tier `analyst/{sID}` still raw average + 0-dp round + 60/80 thresholds |

## Per-Task Results — Phase 3

### BE-014 — Batch recompute: weighted scores + StddevScore + PascalCase rename — ✅ Verified
All three sub-jobs present in one implementation pass in `CompassRankingService.cs`:

1. **Weighted batch** (AC-004.2) — `RecomputeAsync` computes per-student subject scores via `AggregateByCanonicalSubjectWeighted(rows)` (`CompassRankingService.cs:393`), the same shared method `calculate/score` and Fit/Gap use (`CompassScoreService.cs:245`); no parallel/imitating formula anywhere in the file.
2. **`"StddevScore"`** (AC-017.1/017.2/017.3, DES-011/DES-021 §`"StddevScore"`):
   - Column is in `EnsureTables`' `CREATE TABLE IF NOT EXISTS public."TCompassLevelSubjectStat"` **from day one** (`CompassRankingService.cs:597`), `double precision NULL` — matches design.md Data Model group 1 DDL verbatim.
   - Population stddev divides by **n** (`:452-454`: `Math.Sqrt(values.Sum(x => (x - mean) * (x - mean)) / n)`) — never `n−1`; the in-code comment explicitly warns against PostgreSQL's `stddev_samp`.
   - `MinNForStddev = 30` is a named constant (`:39`), value matches the contract; `n < 30` → `NULL` (`(double?)null`), never 0; `n ≥ 30` all-equal legitimately yields 0 (natural result of the formula, not special-cased).
   - Population = the exact `SubAcc.Values` list built from the weighted `subjAvgs` (`:416`) — the same set that produced `"MeanScore"` and `"StudentCount"` of the same row. No backfill, no incremental: both tables are `TRUNCATE`d (`:434-435`) then fully rewritten in the same batch pass.
   - Additive (AC-017.1): `"MeanScore"`/`"StudentCount"`/`"SchoolCount"` columns and their computation (`:444`) unchanged in shape; `GetAllLevelStats`/`GetStudentNationalStatsAsync` still read only `"MeanScore"`.
   - REQ-010 behaviour intact (AC-017.3): idle/running/done/failed states (`:101-163`), concurrent-run guard (`:146`, `:349`), per-school failure counts and continues (`:421-425`).
3. **PascalCase rename** (DES-012):
   - Counted, not sampled: **19 executable line-points** in `CompassRankingService.cs` (`:65, :67, :201, :205, :209, :213, :272, :277, :280, :285, :434, :435, :457, :595, :603, :609-610, :620`) + **3** in `CompassMbtiStore.cs` (`:44, :76, :96`) = **22 points across the 2 files** — exactly the count design.md DES-012 cites (line numbers shifted from the design's pre-edit positions; the count and coverage match).
   - Every identifier is quoted and schema-qualified (`public."TCompass…"`, `"LevelCode"`, `"MeanScore"`, …); `ON CONFLICT ("SchoolID", "SID") DO UPDATE SET` quotes all columns including the `EXCLUDED.` targets (`CompassMbtiStore.cs:47-50`).
   - Zero snake_case remnants: repo-wide grep for `compass_level_subject_stat` / `compass_student_level_score` / `compass_mbti_result` / `level_code` / `mean_score` / `stddev_score` / `student_count` / `school_count` / `updated_at` / `overall_avg` finds only two prose comment mentions (`CompassApiController.cs:867`, `CompassRankingService.cs:246`) — no executable SQL.
   - No dual DDL: `EnsureTables`/`EnsureTable` contain only the new names; no `CREATE TABLE` for the old names exists anywhere.
   - **Same-pass landing (no intermediate snake_case state)**: the working tree contains exactly one implementation state — new PascalCase DDL + weighted aggregation + StddevScore together, with the old-name DDL absent from the codebase entirely. Nothing observable (code, DDL, or the never-created tables) ever exposed a snake_case-only intermediate, satisfying the plan's "ห้ามเขียน snake_case ไปก่อนแล้วค่อยแก้".

### BE-015 — RecomputeAsync OverallAvg from already-weighted values — ✅ Verified
`CompassRankingService.cs:399`: `double overall = Math.Round(subjAvgs.Average(a => a.AverageScore), 2);` where `subjAvgs` comes from `AggregateByCanonicalSubjectWeighted` (`:393`). It is a **plain average of already-weighted subject scores** — credits are consumed once, inside the aggregation method; no second weighting layer exists in the file (AC-004.1/AC-004.2). The value written to `TCompassStudentLevelScore."OverallAvg"` (`:620`, `:400`) comes from this batch pass, not a live recompute.

### BE-016 — MeanScore per (level × subject) from weighted values — ✅ Verified
`CompassRankingService.cs:444`: `mean = Math.Round(values.Average(), 2)` over `SubAcc.Values`, which is populated exclusively from the weighted `subjAvgs` (`:409-417`). Population is one and the same list that feeds `n` (`"StudentCount"`, `:443`/`:465`) and the stddev (`:452-454`) — mean, count and stddev of a row all derive from the identical weighted population (AC-004.1/AC-004.2).

### BE-017 — GetStudentNationalStatsAsync: request-time overall matches batch formula — ✅ Verified
`CompassRankingService.cs:183`: `var agg = AggregateByCanonicalSubjectWeighted(scores);` then `:185` `double overall = Math.Round(agg.Average(a => a.AverageScore), 2);` — character-for-character the same formula as the batch's `:393`/`:399` (same method, same plain average, same 2-dp round), not an imitation. `RankInLevel = below + 1` unchanged (`:222`); empty/unbuilt-table fallback still returns zeros without throwing (`:228-241`). The live rank therefore compares a weighted overall against the stored weighted pile (AC-004.1; design rule 0 row 5).

## Blast-radius / do-not-modify checks — all ✅

- **Free tier unchanged**: `CompassApiController.cs:48` still `AggregateByCanonicalSubject(raw)`; `:52` still `Math.Round(a.AverageScore, 0)`; thresholds 60/80 at `:36-37`; `Boost` field-gating untouched.
- **`AggregateByCanonicalSubject` unchanged**: `CompassScoreService.cs:214-231` byte-matches the FULL-verified 2026-09-02 form.
- **`AggregateByCanonicalSubjectWeighted` unchanged**: `CompassScoreService.cs:245-272` matches the FULL-verified 2026-09-02 form (rules 0–5, fallback inside the method at `:258-260`).
- **Other consumers (observation, out of Phase 3 scope)**: `CompassClusterService.cs:87` (sb-compass-faculty-match Module K T-Score consumer) also calls `AggregateByCanonicalSubjectWeighted` and reads `"MeanScore"`/`"StddevScore"` with the NULL/0-cut rule (`:102-111`) — consistent with this module's contract; its verification belongs to that module's QA, not this round.
- **Mechanical gate**: MSBuild project Build → exit code 0.

## Review Outcome — Phase 3

**Status:** ✅ Passed (FULL)

Round date: 2026-09-15 · Scope: Phase 3 (Module C — National Stats Alignment, REQ-004 × REQ-012 + REQ-017 + DES-012).
All 4 tasks verified against `design.md` DES-011/DES-012/DES-015/DES-021 and `requirement.md` REQ-004/REQ-012/REQ-017.
Note on plan-vs-tree drift: `plan.md` still shows BE-014..BE-017 `pending` (no engineer handoff was relayed), but the
implementation is present and complete in the working tree — this round verified the real code, as required.
ISS-02 and ISS-04 closed (see Open Issues). Deploy prerequisite for devops unchanged: PRE-04 network-wide recompute
(`?limit=0`) after deploy, before opening Premium to users.

*(The Phase 2 FULL round and the BE-003 part-2 TARGETED round that were inline here moved verbatim to
`review/phase-2.md` and `review/phase-1.md` respectively.)*

