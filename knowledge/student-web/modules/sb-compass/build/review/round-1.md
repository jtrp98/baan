# Phase 1: Module A — Score Aggregation (REQ-012) — archived rounds

> Archived by `qa-engineer` on 2026-08-26 when the FULL re-verification round for Phase 1 (BE-001,
> BE-002, BE-003) superseded this content. Moved verbatim per `policies/documentation.md` §4 — not
> summarized, not pruned. The still-open/outlive-your-round material (Knowledge sync status,
> `## Unverified Behaviour — undeployed phases` for Phase 1) stayed in `review.md` and is not
> duplicated here.

## Verification Summary (current round) — Phase 1 (original round, 2026-08-25)

**Phase 1 (Module A — Score Aggregation, REQ-012), sb-compass — Mode: FULL**

รอบแรกของ module นี้ (ไม่มี `review.md` มาก่อน) และ Phase 1 คือ phase แรกที่ backend-engineer
รายงานว่า implement เสร็จ — ตรวจครบทั้ง 3 task (BE-001, BE-002, BE-003) เทียบกับ
`## Subject Score Aggregation Rules` และ REQ-012 acceptance criteria ใน `requirement.md`

**Build/compile check — ทำได้จริงในสภาพแวดล้อมนี้** (ต่างจากที่ backend-engineer รายงานว่าทำไม่ได้
ใน sandbox ของตัวเอง): พบ `MSBuild.exe` (VS2022 Community, `C:\Program Files\Microsoft Visual
Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe`) บนเครื่องนี้ และรัน build จริงกับ
`ClassOnlineWeb\sb-web-student.sln` (`msbuild sb-web-student.sln -t:Build -p:Configuration=Debug`)
— **ผลลัพธ์: สำเร็จ, exit code 0**, `ClassOnlineWeb -> ...\bin\ClassOnlineWeb.dll` compile ผ่าน
ไม่มี error เลยสักบรรทัด (มีแต่ warning เดิมของโปรเจกต์ที่ไม่เกี่ยวกับไฟล์ที่แก้ — ไม่มี warning ใดพาดพิง
`CompassScoreService.cs` หรือ `CompassApiController.cs`) นี่คือหลักฐานที่แน่นกว่าการอ่านโค้ดอย่างเดียว
และควรใช้แทน "ไม่สามารถ compile ได้" ในรายงานของ backend-engineer นับจากนี้

**`node .claude/scripts/static-analysis-gate.js`**: รันแล้ว — `lint`/`format`/`typecheck`/`build`/`test`
ทั้งหมด **skip** เพราะ gate นี้มองหา script ใน `package.json` ของ Node/npm package เท่านั้น
โปรเจกต์นี้เป็น ASP.NET/.NET Framework (ไม่มี `package.json` ของแอปจริง มีแต่ของ `.claude/scripts`
เอง) — จึง**ไม่ครอบคลุมสแตกนี้เลย** การ build ตัวจริงคือ MSBuild ด้านบน `security_scan` และ
`dependency_scan` ของ gate เดียวกันนี้ผ่าน (`PASS`) แต่ก็เช็คกับ `package.json` เดียวกันที่ไม่มีความหมาย
กับแอป .NET — **ไม่ถือเป็น security sign-off ใด ๆ**

**`node .claude/scripts/check-schema-contract.js`**: รันแล้ว — รายงาน "No schema.prisma found yet"
ตรงตามที่คาด เพราะ module นี้ประกาศไว้ชัดใน `design.md`/`plan.md` (DEP-04) ว่า**ไม่ใช่ Prisma โดย
เจตนา** ใช้ DDL/EF6 ต่อ PostgreSQL ตรง ๆ และ **Phase 1 นี้ไม่มี schema change ใด ๆ เลย** (ยืนยันด้วย
การอ่านโค้ดจริง — ไม่มี `CREATE TABLE` ใหม่ ไม่มี EF model ใหม่ ไม่มีการแก้ที่มาของ `Credit`) จึงไม่มี
อะไรให้ script นี้ตรวจกับ Data Model ของ Phase 1 ในทางกลไก — ดูหัวข้อ "Design/requirement contract
checks" ด้านล่างสำหรับการตรวจด้วยมือแทน

**ไม่มี automated test framework ในโปรเจกต์นี้** (`backend-engineer.md`: "Testing: none in this
project" · `plan.md` เองก็ระบุไว้แล้วว่าไม่เขียน task ทดสอบแยก) — การตรวจสอบรอบนี้คือการอ่านโค้ดจริง
เทียบกับ `## Subject Score Aggregation Rules` ใน `design.md` และ acceptance criteria ของ REQ-012 ใน
`requirement.md` บวกกับการ trace สูตรด้วยมือผ่านตัวอย่างทั้ง 4 กรณีที่ต้องผ่าน ไม่ใช่การรันเทสต์จริง

## Verified File Manifest — Phase 1 (sb-compass) (original round, 2026-08-25)

| File | Bytes | Lines | Round |
|---|---:|---:|---|
| `ClassOnlineWeb\Helper\CompassScoreService.cs` | 16125 | 316 | Phase 1 FULL (2026-08-25) |
| `ClassOnlineWeb\Controllers\Api\CompassApiController.cs` | 54171 | 859 | Phase 1 FULL (2026-08-25) |

## Per-Task Results — Phase 1 (original round, 2026-08-25)

- ✅ **[backend]** `BE-001` — เพิ่ม `AggregateByCanonicalSubjectWeighted` ใน `CompassScoreService.cs`
  (บรรทัด 250-278) แยกจาก `AggregateByCanonicalSubject` เดิมอย่างสมบูรณ์ (เมธอดเดิมไม่ถูกแก้ทับ,
  ยังใช้ค่าเฉลี่ยดิบเหมือนเดิมที่บรรทัด 214-231 และยังถูกเรียกจาก `analyst/{sID}` ตามเดิม) ตรวจกฎ
  ข้อ 0-5 ทีละข้อ:
  - **กฎข้อ 0** (ต้องมีสองสูตร): ✅ เมธอดใหม่แยกต่างหาก ไม่กระทบ caller ฝั่งฟรี
  - **กฎข้อ 1** (สูตร Σ(score×credit)/Σ(credit)): ✅ `weightable.Sum(x => x.Score100.Value *
    x.Credit.Value) / totalCredit`
  - **กฎข้อ 2** (หน่วยกิต null/≤0 = ใช้ไม่ได้ ตัดออกจากทั้งตัวตั้งและตัวหาร): ✅
    `weightable = scored.Where(x => x.Credit.HasValue && x.Credit.Value > 0)` — วิชาที่ไม่เข้าเงื่อนไข
    นี้ไม่ได้อยู่ทั้งใน `weightable.Sum(...)` (ตัวตั้ง) และ `totalCredit` (ตัวหาร) เป็นการตัดออกจริง
    ไม่ใช่นับเป็น 0 ที่ยังอยู่ในตัวตั้ง — **ถูกต้องตรงตามที่ design.md เน้นว่าเป็นจุดต่างจากโค้ดเดิม**
    (โค้ดเดิม `TotalCredit = gr.Sum(x => x.Credit ?? 0)` ในเมธอดเก่ายังอยู่ที่เดิม ไม่ถูกเอามาใช้ในเมธอด
    ใหม่)
  - **กฎข้อ 3** (วิชาไม่มีคะแนนตัวเลข/non-core ตัดออกเสมอ): ✅ ตัดตั้งแต่ `Where` ชั้นนอกสุดของเมธอด
    (`s.CanonicalSubject` ไม่ null และ `s.Score100.HasValue`) ก่อนเข้า `GroupBy` เลย
  - **กฎข้อ 4** (fallback เมื่อหน่วยกิตรวม = 0 → ค่าเฉลี่ยดิบธรรมดาของ**ทุกวิชาที่มีคะแนน**ในกลุ่มนั้น,
    ต้องอยู่ในเมธอดเดียวกัน, กลุ่มที่ไม่มีคะแนนเลยต้องถูกตัดทิ้งไม่ใช่ 0, กลุ่มที่บางวิชามีหน่วยกิตบางวิชา
    ไม่มีต้องไม่เข้า fallback): ✅ ทั้งสี่ข้อ — `average = totalCredit > 0 ? (ถ่วงน้ำหนัก) :
    scored.Average(x => x.Score100.Value)` ใช้ `scored` (ทุกวิชาที่มีคะแนนในกลุ่ม ก่อนกรอง credit)
    ไม่ใช่ `weightable` เป็นฐานของ fallback ตรงตาม design.md เป๊ะ · fallback อยู่ในเมธอดเดียวกับสูตร
    หลัก ไม่มีการให้ caller ทำเอง · กลุ่มที่ไม่มีวิชาซึ่งมีคะแนนเลยไม่มีทางเป็น key ใน `GroupBy` เพราะกรอง
    `Score100.HasValue` ไปแล้วตั้งแต่ก่อน group จึงถูกตัดทิ้งจริง ไม่ใช่ปรากฏเป็น 0 · กรณี "บางวิชามี
    หน่วยกิต บางวิชาไม่มี" → `totalCredit` คำนวณจาก `weightable` เท่านั้นซึ่งจะ > 0 ถ้ามีอย่างน้อย 1 วิชา
    ที่หน่วยกิตใช้ได้ จึงไม่เข้า fallback และใช้สูตรถ่วงน้ำหนักกับเฉพาะวิชาที่หน่วยกิตใช้ได้ ตรงตามกฎ
  - **กฎข้อ 5** (ปัด 2 ตำแหน่ง): ✅ `Math.Round(average, 2)`
  - **ตัวอย่างที่ต้องผ่าน (trace ด้วยมือ)**:
    - คณิตพื้นฐาน 60(1.5nก.)+เพิ่มเติม 90(0.5nก.) → (60×1.5+90×0.5)/2 = 135/2 = **67.5** ✅
    - สลับหน่วยกิต 60(0.5)+90(1.5) → (60×0.5+90×1.5)/2 = 165/2 = **82.5** ✅
    - ศิลปะ 70,80 ไม่มีหน่วยกิตทั้งคู่ → totalCredit=0 → fallback (70+80)/2 = **75** ✅
    - กลุ่มที่ไม่มีวิชาที่มีคะแนนเลย → ไม่ปรากฏใน `GroupBy` เลย = ตัดทิ้ง ไม่ใช่ 0 ✅
  - ที่มาของหน่วยกิต (`PGTGradeDetail.nCredit` fallback `TPlane.nCredit`, บรรทัด 199) ไม่ถูกแตะ
    ตามที่กฎข้อ 2 สั่งไว้ ✅ ไม่มี schema change/`CREATE TABLE` ใหม่ใด ๆ ✅
- ✅ **[backend]** `BE-002` — `CompassApiController.CalculateScore` (`calculate/score`, บรรทัด
  249-285) เรียก `AggregateByCanonicalSubjectWeighted` แทนเมธอดเดิมแล้ว (บรรทัด 256) และ
  `StudentScore = Math.Round(a.AverageScore, 2)` (บรรทัด 269) เปลี่ยนจาก `Math.Round(..., 0)` เดิม
  ตรงตำแหน่งที่ `plan.md` ระบุ (`CompassApiController.cs:269`) แล้ว — ตรวจแล้วว่า `analyst/{sID}`
  (ฟีเจอร์ฟรี, บรรทัด 31-58) ยังคงเรียก `AggregateByCanonicalSubject` เดิมและปัดเป็นจำนวนเต็ม
  (`Math.Round(a.AverageScore, 0)`, บรรทัด 45) ไม่ถูกแตะ ตรงตามที่ design.md สั่งห้ามไว้ (DES-001)
- ✅ **[backend]** `BE-003` — `GetSubjectAveragesAsync` (helper บรรทัด 801-806, ใช้โดย
  `AI_calculate/path` และ `AI_advice/path`) เรียก `AggregateByCanonicalSubjectWeighted` แทนเมธอดเดิม
  แล้ว (บรรทัด 804) — ตรวจ caller ทั้งสองจุด (`AI_calculate/path` บรรทัด 319, `AI_advice/path`
  บรรทัด ~337) ยืนยันว่าเรียกผ่าน helper ตัวนี้จริง

**ตรวจ scope discipline เพิ่มเติม** (`Grep` หา caller ทั้งหมดของทั้งสองเมธอดในทั้งโปรเจกต์):
`CompassRankingService.cs` (บรรทัด 173, 240, 362) ยังเรียก `AggregateByCanonicalSubject` เดิมอยู่ —
**ถูกต้องแล้ว** เพราะการเปลี่ยนจุดเหล่านี้เป็นของ BE-014/BE-016/BE-017 (Phase 3, ยังไม่เริ่ม) ไม่ใช่
ขอบเขตของ BE-001/002/003 — backend-engineer ไม่ได้ทำเกินขอบเขตหรือทำขาดจุดใดใน Phase 1

## Design/requirement contract checks — Phase 1 (original round, 2026-08-25)

**Data Model**: Phase 1/Module A **ไม่มี schema change ใด ๆ** (ยืนยันทั้งจาก `design.md`, `plan.md`
Plan Summary, และการอ่านโค้ดจริง — ไม่มี `CREATE TABLE` ใหม่ ไม่มี EF entity ใหม่ ไม่มีการแก้ที่มา
ของ `Credit`) `node .claude/scripts/check-schema-contract.js` รายงาน "No schema.prisma found yet"
ซึ่งถูกต้องตามบริบท เพราะ module นี้ประกาศไว้ชัดว่าใช้ DDL/EF6 ต่อ PostgreSQL โดยเจตนา ไม่ใช่ Prisma
(DEP-04) — schema comparison ที่มีความหมายสำหรับ Phase 1 คือการยืนยันว่า**ไม่มีอะไรเปลี่ยน** ซึ่ง
ตรวจแล้วว่าจริง ไม่ใช่การ diff field ตาม schema.prisma

**Business rule contract** (`## Subject Score Aggregation Rules` ใน `design.md`, REQ-012 acceptance
criteria ใน `requirement.md`): ตรวจครบทั้ง 5 กฎ + 4 ตัวอย่างที่ต้องผ่าน — ดู Per-Task Results ด้านบน
รายละเอียดครบทุกข้อ ไม่มีข้อใดขาดหรือเบี่ยงจาก contract

## Issues Found — Phase 1 (original round, 2026-08-25)

ไม่มี — ทั้ง 3 task ผ่านครบตาม contract ไม่มีอะไรต้องส่งกลับ

## Review Outcome — Phase 1 (original round, 2026-08-25)

**Status:** ✅ Verified (FULL)

**Phase 1 (Module A) ผ่านครบทุก task (BE-001, BE-002, BE-003)** — ตรวจด้วยการอ่านโค้ดจริงเทียบกับ
`## Subject Score Aggregation Rules` + REQ-012 acceptance criteria ทีละข้อ, trace สูตรด้วยมือผ่าน
ทั้ง 4 ตัวอย่างที่ต้องผ่าน, และยืนยันด้วยการ **compile จริง** (`MSBuild.exe` บนเครื่องนี้ — สำเร็จ,
exit 0, ไม่มี error) ซึ่งเป็นสิ่งที่ backend-engineer ทำไม่ได้ใน sandbox ของตัวเอง

**ไม่มี Security gate บน Phase 1** — `plan.md` ไม่ flag ไว้ และตรวจอิสระแล้วว่า Module A เป็นการ
คำนวณล้วน ไม่แตะ auth/สิทธิ์ ไม่รับ input จากภายนอกใหม่ ไม่เปิดเผยข้อมูลส่วนบุคคลเพิ่ม (ใช้ข้อมูล
คะแนนที่มีอยู่แล้ว เปลี่ยนแค่วิธีคำนวณ) ตรงกับที่ `design.md`'s Module A entry ระบุไว้เองว่า "ไม่ใช่
sensitive" — ไม่ต้องส่งต่อ `security` สำหรับ phase นี้

**Deploy eligibility**: รอบนี้เป็น FULL round แรกของ phase นี้ — ผ่านเกณฑ์ FULL ที่จำเป็นก่อนส่งต่อ
`devops` แล้ว (ยังต้องรอ `plan.md` Status cell ถูก sync จริงก่อน) แต่ต้องเตือนว่า Phase 3 (Module C)
ต้อง recompute สถิติทั้งเครือข่ายทันทีหลัง deploy ตาม `## National Stats Batch Rules`/RISK-01 —
เป็นเงื่อนไข deploy ของ Phase 3 ไม่ใช่ Phase 1 (Phase 1 เองไม่มี deployment prerequisite พิเศษ)

**สถานะ three-repo sync ณ เวลานั้น**: การตัดสินใจนี้ยังไม่ปรากฏใน `plan.md` จริงจนกว่า BA-lane
session จะ apply ตาราง `## Knowledge sync — three-repo mode` — ดูรอบล่าสุดใน `review.md` สำหรับ
สถานะ sync ปัจจุบัน

**ขั้นต่อไปตาม `plan.md` Sequencing Notes` (ณ เวลานั้น)**: Phase 1 (Module A) เสร็จแล้ว (รอ sync) →
Phase 3 (Module C) ถูกปลดล็อกแล้วเพราะขึ้นกับ BE-001 เท่านั้น (DEP-01) · Phase 2 (Module B) ไม่เคย
ขึ้นกับ Phase 1 อยู่แล้ว จึงเริ่มได้เช่นกัน · Phase 4 (Module D) ยังล็อกอยู่ ต้องรอทั้ง Phase 1 และ
Phase 2 ตาม DEP-02

---

# Phase 1: Module A — Score Aggregation (REQ-012) — Round 1 (post-restart, 2026-09-02)

> Archived by `qa-engineer` on 2026-09-15 when Phase 2 verification (Round 2 FULL) became the active round in `review.md`. Moved verbatim per `policies/documentation.md` §4 — not summarized, not pruned. Live material (Open Issues, the Phase 2 current round, the Knowledge sync relay table, `## Unverified Behaviour`) stayed in `review.md` and is not duplicated here.
## Verification Summary

- **Mode: FULL** — all three in-scope tasks (BE-001, BE-002, BE-003) of Phase 1 were verified; nothing
  in the phase was deferred. This round closes Phase 1 only.
- **Round**: 1 (post-restart). `plan.md`'s Plan Summary declares a genuine restart: prior QA state in
  `review/phase-1.md`, `review/phase-3.md`, `_docs/status.md` and `knowledge/sb-compass/task/*.yaml`
  is **not** imported. This round starts from `pending` regardless of those files.
- **Deterministic gate**: the evidence package carried **no** structured `deterministic_gate` result, so
  the complete mechanical sweep was executed here before verifying. Results:

| Check | Command | Result |
|---|---|---|
| build / typecheck / lint / test (real toolchain) | `"C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" ClassOnlineWeb/sb-web-student.sln -t:Rebuild -p:Configuration=Debug -m` | **PASS** — `Build succeeded. 114 Warning(s) 0 Error(s)`. Re-run after the concurrent Phase 2 edits landed: still 0 errors. **Zero warnings in any Compass file** (grep for `CompassScoreService`/`CompassApiController`/`CompassPathCatalog`/`CompassRankingService` in the warning list returns nothing). |
| static analysis gate | `node .claude/scripts/static-analysis-gate.js` | **FAIL — environmental, not the change.** `lint`/`typecheck`/`build`/`test` all shell out to `dotnet msbuild`, which cannot build .NET Framework 4.x web projects; all 78 compile errors are in the **separate** repo `C:\src\schoolbright-backend` on files this change never touches, plus 5×MSB4019. `security_scan` = ok. `format`/`dependency_scan` = skip (no such command / no manifest for profile `dotnet`). Compensating evidence: the row above. Routed as ISS-03; **not** treated as a pass, and **not** treated as a defect in BE-001/002/003. |
| schema contract | `node .claude/scripts/check-schema-contract.js` | **n/a** — no `schema.prisma`; `stack.schema_paths: []`. Phase 1 changes no schema, table or column, so there is no owned model to diff against `design.md`'s Data Model this round. |
| status sync | `node .claude/scripts/check-status-sync.js` | **n/a** — "No `_docs/status.md` found yet", before and after this round. Correct for three-repo mode: `status.md` lives in the read-only Knowledge repo and is never written from here. Status generation was attempted as required and its output discarded as false — see ISS-07. |
| behavioural execution (see below) | `dotnet run` on an extracted-verbatim harness | **PASS** — all 4 design worked examples + 8 edge cases. |
| security scan | via gate | ok |

- **No test suite exists** in this project (org policy; `stack.commands.test` is an alias for the build).
  To get *executed* evidence instead of read-only evidence, `AggregateByCanonicalSubjectWeighted` and
  `AggregateByCanonicalSubject` were extracted **verbatim** (`sed -n '245,272p'` / `'214,231p'` of the
  real file — no retyping) into a standalone console project and run against the design's worked
  examples. Harness:
  `C:\Users\jabja\AppData\Local\Temp\claude\C--src-sb-web-student\9cef48ba-24f8-44f0-bb62-5250241c1b6d\scratchpad\agg\`
  (`Program.cs`, `agg.csproj`). This executes the real method text, but **not** the deployed assembly
  and **not** the DB/HTTP path — see `## Unverified Behaviour`.

### Executed results vs `design.md` "ตัวอย่างที่ต้องผ่าน" (rules 0-5)

| Case (design.md:490-497) | Required | Executed | Verdict |
|---|---|---|---|
| ถ่วงน้ำหนักปกติ — 60 @1.5 นก. + 90 @0.5 นก. | **67.5** → `normal` | `avg=67.5 totalCredit=2 level=normal` | ✅ |
| หน่วยกิตสลับ — 60 @0.5 + 90 @1.5 | **82.5** → `strong` | `avg=82.5 level=strong` | ✅ |
| fallback — ศิลปะ 70 และ 80 ทั้งคู่ไม่มีหน่วยกิต | **75** (plain average), same number for every consumer | `avg=75 totalCredit=0 level=normal`, produced **inside** the method | ✅ |
| ไม่มีคะแนนเลย — ศิลปะไม่มีวิชาที่มีคะแนน | **ไม่มีค่า** — drop the group (not 0, not fallback) | `WEIGHTED: <no groups>` | ✅ |
| rule 2 — credit `0.0` excluded from numerator **and** denominator (60@0 + 90@1.0) | 90, not 75 and not 30 | `avg=90 totalCredit=1` | ✅ |
| rule 2 — negative credit excluded (60@-2 + 90@1.0) | 90 | `avg=90 totalCredit=1` (old method's `TotalCredit` would be `-1`) | ✅ |
| rule 4 last bullet — mixed credit (60@null + 90@1.0) must **not** enter fallback | 90, not 75 | `avg=90 totalCredit=1` | ✅ |
| rule 3 — null score / `CanonicalSubject` null or `""` excluded | only the scored core course counts | `avg=80 count=1` (null-score row, `null` subject "ชุมนุม" and `""` subject all dropped) | ✅ |
| rule 4 — every credit exactly `0.0` | fallback, no divide-by-zero, no error | `avg=75 totalCredit=0` | ✅ |
| rule 5 — 2 dp (70@1 + 80@2 = 76.666…) | `76.67` | `avg=76.67` | ✅ |
| rule 5 — threshold from the **post-round** value (79.995) | consistent `strong`/`normal` cut on the rounded number | `avg=80 level=strong` | ✅ |
| defensive — `null` input / empty input | no throw | `count=0` / `count=0` | ✅ |
| ordering | descending by score | `90, 70, 50` | ✅ |

## Verified File Manifest

In scope for this round (Phase 1 only):

| Path | Lines verified | Change |
|---|---|---|
| `C:\src\sb-web-student\ClassOnlineWeb\Helper\CompassScoreService.cs` | `233-272` (new method + XML doc); `214-231` re-read to confirm **byte-identical** to HEAD | **+41 lines, 0 deletions.** New `AggregateByCanonicalSubjectWeighted`. |
| `C:\src\sb-web-student\ClassOnlineWeb\Controllers\Api\CompassApiController.cs` | `256`, `269`, `825` (was `801-806` before the concurrent Phase 2 insertions) | 3 changed lines: weighted call in `calculate/score`, `Math.Round(…, 2)`, weighted call in `GetSubjectAveragesAsync`. |
| `C:\src\sb-web-student\ClassOnlineWeb\VMModels\Compass\VMCompass.cs` | `62-68` | Unchanged — read to confirm `VMSubjectStat.StudentScore` is `double`, so 2 dp actually survives to the API (an `int` field would have silently truncated the fix). |
| `C:\src\sb-web-student\ClassOnlineWeb\Helper\CompassPathCatalog.cs` | `96-177` | Unchanged — read as BE-003's downstream consumer. Source of ISS-01. |
| `C:\src\sb-web-student\ClassOnlineWeb\Helper\CompassRankingService.cs` | `169-176`, `237-241`, `362` | Unchanged — read to confirm Phase 3 boundaries. Source of ISS-02/ISS-04. |

Present in the working tree but **out of scope and not reviewed** (no QA round covers them):
`Helper\InternalNetworkAccessGuard.cs` + the `recompute/*` and `AI_exercise/*`/`certificate/issue`
hunks in `CompassApiController.cs` (in-flight Phase 2: BE-008/009/010/011) · `Controllers\CompassController.cs`
`MyCompass` route · `Views\Compass\MyCompass.cshtml` · `assets\css\compass-design.css` ·
`assets\js\compass-design*.js` (Phase 5 / earlier design work) · `configSource-prod.config`,
`.gitignore`, `_Layout.cshtml`, `ClassOnlineWeb.csproj` (repo/config; `csproj` line 331 adds the
Phase 2 file to the compile list). Nothing in Phase 1 depends on any of these.

## Per-Task Results

### BE-001 (DES-002) — new `AggregateByCanonicalSubjectWeighted` — ✅ Verified

Method at `Helper/CompassScoreService.cs:245-272`. Checked line by line against `design.md` rules 0-5
and then executed (table above).

1. **Excludes null/`<=0` credit from BOTH numerator and denominator** — ✅. `var weighted = gr.Where(x => x.Credit.HasValue && x.Credit.Value > 0).ToList();`
   and *both* sides are computed from `weighted` only: numerator `weighted.Sum(x => x.Score100.Value * x.Credit.Value)`,
   denominator `weighted.Sum(x => x.Credit.Value)`. No `?? 0` coercion anywhere — the rule-2 trap
   ("`TotalCredit = gr.Sum(x => x.Credit ?? 0)`" in the old method) is not repeated. Executed: 60@0 + 90@1.0 → 90.
2. **Excludes courses without a numeric score** — ✅. Pre-filter `s.Score100.HasValue`, applied before
   `GroupBy`, so an unscored course cannot reach either side. `CanonicalSubject` null/`""` also filtered
   (rule 3 second sentence). Executed.
3. **Zero-total-credit fallback is inside the method** — ✅. `totalCredit > 0 ? weighted-formula : gr.Average(x => x.Score100.Value)`
   sits in the method body, not in any caller; both Phase 1 callers therefore get the same number from
   the same fallback (REQ-012 AC4). No divide-by-zero is reachable: `totalCredit` is a sum of strictly
   positive values, so `totalCredit > 0` is false exactly when `weighted` is empty, and the fallback
   branch averages the group, which `GroupBy` guarantees is non-empty — so `Average()` cannot throw
   `InvalidOperationException` either.
4. **Rounding is exactly 2 dp** — ✅. `AverageScore = Math.Round(average, 2)`, matching rule 5's literal
   `Math.Round(x, 2)`. Executed: 76.666… → `76.67`.
5. **Group with no scored course is dropped** — ✅ (rule 4 final bullet). The pre-filter removes unscored
   rows, so such a group never materialises: no `0`, no fallback, no row. Executed: `<no groups>`.
6. **Compile risk** — ✅ none. Statement-bodied `Select` lambda with an explicit `return`, braces
   balanced, `Sum`/`Average` over `double` (never `decimal`/`int` mixing), `var totalCredit` infers
   `double` and assigns to a `double` field, `System`/`System.Linq` already imported, XML doc escapes
   `&lt;=0` correctly. Confirmed by a real compile: `Build succeeded … 0 Error(s)`, no warning in this file.

### BE-002 (DES-002) — `calculate/score` uses the weighted method + 2 dp — ✅ Verified

- `CompassApiController.cs:256` — `AggregateByCanonicalSubjectWeighted(scores)`. ✅
- `CompassApiController.cs:269` — `StudentScore = Math.Round(a.AverageScore, 2)` (was `, 0`). ✅ This is
  the exact line `design.md` rule 5 and `plan.md` BE-002 name. Rounding twice at 2 dp is idempotent, so
  the value the DTO carries is the method's own 67.5, not 68.
- `VMSubjectStat.StudentScore` is `double` (`VMModels/Compass/VMCompass.cs:65`) — the 2 dp value is not
  truncated by the DTO. REQ-012 AC1's "ตัวเลขที่แสดงต้องเป็น 67.5" is satisfied on the server side.
- `Mean = Math.Round(mean, 0)` was deliberately left at 0 dp; rule 5 constrains the *subject score*, and
  `Mean` is Phase 3's value anyway. Not a Phase 1 defect (but see ISS-02 for the pairing risk).

### BE-003 (DES-002) — `GetSubjectAveragesAsync` uses the weighted method — ✅ Verified

- `CompassApiController.cs:825` — `AggregateByCanonicalSubjectWeighted(scores).ToDictionary(a => a.CanonicalSubject, a => a.AverageScore)`. ✅
- Both consumers confirmed by call-site inspection: `AI_calculate/path` (line 319 pre-shift) and
  `AI_advice/path` (line 341 pre-shift) — Fit Score / Gap, REQ-005/REQ-006, exactly the rule 0 row.
- No caller-side fallback exists (grep for `?? 0` / re-averaging around these call sites): the dictionary
  values come straight from the method, so the design's "Fit Score ที่อ้างศิลปะต้องใช้ 75 ตัวเดียวกัน"
  holds. `ComputeFit` (`CompassPathCatalog.cs:163-177`) consumes the unrounded-past-2-dp value directly.
- **Caveat that does not fail the task**: the Gap report's `Current` field re-rounds to 0 dp — ISS-01.
  BE-003's wording covers the call swap only, and neither `design.md` nor `plan.md` assigns that line to
  an engineer, so it is routed as a contract gap rather than counted against BE-003.

### Regression check — old method + free tier unchanged — ✅ Verified

- `AggregateByCanonicalSubject` (`CompassScoreService.cs:214-231`): the staged diff for this file is
  **+41 / -0** — it contains no deletion line at all, so the old method is byte-identical to HEAD.
  Rule 0's "ห้ามแก้เมธอดนี้ทับ" is honoured.
- Free tier `analyst/{sID}` (`CompassApiController.cs:31-58`): still `AggregateByCanonicalSubject(raw)`
  at line 41 and still `Math.Round(a.AverageScore, 0)` at line 45, with the 60/80 thresholds untouched —
  exactly what rule 0 row 1 and rule 5 bullet 3 require ("ฝั่งฟรี … ห้ามแตะ"). Not in the diff at all.
- `debug/scores` (line 783): still unweighted. Correct — rule 0 says change *only* the callers in its
  table, and `debug/scores` is not in it.
- `CompassRankingService` (`:173`, `:240`, `:362`): still unweighted → Phase 3 (BE-014/BE-017) and
  ISS-04, not Phase 1 omissions.
- Executed side-by-side in the harness (`OLD/FREE` column): the old method returns the pre-change
  unweighted values on every case (75 where the weighted method returns 67.5/82.5/90), confirming the
  two formulas are genuinely independent.

## Contract checks

| Contract | Source | Result |
|---|---|---|
| `## Subject Score Aggregation Rules` rules 0-5 + worked examples | `design.md:424-497` | ✅ all satisfied — evidence in `## Verification Summary` and BE-001 |
| REQ-012 AC1-AC4 (AC5 struck) | `requirement.md:245-271` | ✅ AC1 (67.5 displayed, not 68) · AC2 (82.5 → strong) · AC3 (non-numeric excluded both sides) · AC4 (one fallback, one number for every weighted consumer — enforced structurally by living inside the method) |
| Data Model / schema | `design.md` Data Model, read in full | **n/a this round** — Phase 1 adds no table, column or relation and reads only existing `PGTGradeDetail.nCredit` → `TPlane.nCredit` (`CompassScoreService.cs:199`, unchanged, per rule 2's "ตรรกะนี้ไม่ต้องแก้"). Nothing to diff. |
| Credit source (OQ-12) | `design.md` rule 2 / `requirement.md` OQ-12 | ✅ unchanged as instructed. The remaining OQ-12 question is *data quality*, not schema — see `## Unverified Behaviour`. |
| Scope discipline | `plan.md` Phase 1 | ✅ no scope invented: the implementer changed exactly the 2 files / 4 lines the three tasks describe and nothing else. |

## Unverified Behaviour — undeployed phases

Phase 1 has no automated test suite (org policy). The following were verified by **reading** plus
execution of the extracted method text — never by running the shipped application. `devops` must put
this list in front of a human before deploying Phase 1.

1. **End-to-end `POST /calculate/score`** with real grade-DB data was never executed (no runtime, no DB,
   no auth context in this workspace). The DB→`CompassSubjectScore` projection, `UserData` resolution
   and JSON serialisation of the 2 dp value are read-only evidence. In particular, nothing here proves
   the client renders `67.5` rather than reformatting it (`assets/js/compass.js:246-250` prints
   `s.StudentScore` raw, which suggests it will, but that is inspection, not execution).
2. **End-to-end `AI_calculate/path` / `AI_advice/path`** Fit% and Gap numbers computed from the new
   weighted dictionary were not executed. ISS-01's 0 dp re-round is a *read* finding.
3. **Rule 5's strong/normal/weak cut** is applied on the Premium side by consumers of `StudentScore`,
   not inside `calculate/score`; the level string is only produced server-side on the **free** path
   (line 46-48, unchanged). The claim "the Premium cut uses the post-2 dp value" is therefore verified
   only at the value level (the method rounds before anyone reads it), not at a Premium call site.
4. **How often the fallback actually fires in production** (OQ-12 data-quality) is unmeasured. If credits
   are widely blank, the weighted result silently equals the old unweighted one and REQ-012 delivers
   less than intended. This is not a defect — the code is correct in both branches — but it is unknown.
5. **Banker's rounding at exact midpoints.** `Math.Round(x, 2)` is `MidpointRounding.ToEven`; the design
   specifies `Math.Round(x, 2)` literally, so the implementation matches the contract. The behaviour at
   `.005` midpoints was executed once (79.995 → 80) but no business rule confirms half-even vs
   half-away-from-zero. Read, not decided.
6. **Free-tier non-regression** rests on the diff (zero deletions, endpoint absent from the diff) and a
   green compile — not on executing `analyst/{sID}` against real data.
7. **Phase 2 code now sitting in this tree** (`InternalNetworkAccessGuard`, `recompute/*` guards,
   identity fixes) is entirely unverified — see ISS-06. It compiles; nothing more is claimed.

## Issues Found

No defect was found in BE-001, BE-002 or BE-003. The implementer's report matched the real code on every
point I checked, including the two claims most likely to be wrong in a report (the old method untouched;
the fallback inside the method rather than at the callers). Everything raised above is either a contract
gap the tasks did not cover (ISS-01, ISS-04), a cross-phase sequencing risk (ISS-02), workspace tooling
(ISS-03) or process (ISS-06). Two observations recorded for later phases, neither actionable now:

- **Aggregate metadata semantics differ between the two methods.** New `TotalCredit` = sum of *usable*
  credits only (null/`<=0` excluded), whereas the old one coerced null→0 and would include a negative
  credit. New `CourseCount` still counts every *scored* course in the group, including ones excluded
  from the weighted math (executed: 60@0 + 90@1.0 → `count=2 totalCredit=1`). No Phase 1 consumer reads
  either field (`calculate/score` and `GetSubjectAveragesAsync` read `AverageScore` only), so this is
  harmless today — but BE-014 and BE-018 (Phases 3/4) will read these aggregates, and `design.md` does
  not define either field for the weighted method.
- `Mean` in `calculate/score` stays 0 dp while `StudentScore` is now 2 dp; visually the Premium table
  will show `67.5` against `70`. Cosmetic, and it belongs to Phase 3's contract if anyone cares.

## Review Outcome

**Status:** ✅ Verified (FULL)

Phase 1 (Module A — Score Aggregation, REQ-012) is functionally complete and matches
`design.md`'s `## Subject Score Aggregation Rules` on every rule and every worked example, with
executed evidence and a clean real-toolchain build. BE-001/BE-002/BE-003 → `verified`.

**This is not a deploy authorisation.** Two things must reach a human first: ISS-02 (deploying Phase 1
without Phase 3 pairs weighted scores with unweighted ranks — `design.md` rule 0 calls that "อันดับเพี้ยน")
and the whole `## Unverified Behaviour` list (no test suite; nothing has run against a real database).
Phase 2's `🔒 Security gate` remains open and untouched by this round, and the in-flight Phase 2 code now
in this tree has had no QA round at all (ISS-06).

## Knowledge sync — three-repo mode

For a **BA-workspace** session to apply verbatim to
`C:\src\schoolbright-knowledge\_docs\module\sb-compass\plan.md` → `## Phase 1` Status cells. This is a
relay of a decision already made here (T-LV3) — not an invitation to re-review.

| Task id | Current Status in `plan.md` | New Status | Basis |
|---|---|---|---|
| BE-001 | `pending` | `verified` | This round, FULL — `## Per-Task Results` → BE-001 |
| BE-002 | `pending` | `verified` | This round, FULL — `## Per-Task Results` → BE-002 |
| BE-003 | `pending` | `verified` | This round, FULL — `## Per-Task Results` → BE-003 |

Also for the BA workspace (documents only, no Status change): ISS-01 and ISS-04 need a `system-analyst`
amend round on `design.md`; ISS-02 needs a `project-manager` sequencing note in `plan.md`'s Sequencing
Notes / Phase 3 deploy prerequisite. No `🔒 Security gate` is added to Phase 1 — it introduces no auth,
personal-data, payment, upload or untrusted-input surface; it changes an arithmetic formula on data the
same endpoints already returned. Phase 2's existing gate stays.

## Archived rounds

- `C:\src\schoolbright-knowledge\_docs\module\sb-compass\review\phase-1.md` (2026-08-26) — **historical,
  superseded.** `plan.md`'s Plan Summary explicitly declines to import prior QA state; that round verified
  a pre-restart plan. Read-only Knowledge repo; not amended from here.
- `C:\src\schoolbright-knowledge\_docs\module\sb-compass\review\phase-3.md` (2026-08-26) — same.
- Nothing was archived by this round: it is the first round after the restart, so there is no superseded
live phase in this file yet.

---

## TARGETED Round — BE-003 part 2 (Gap Report 0-dp re-round) — 2026-09-15

*(Moved verbatim from `review.md` on 2026-09-15 by the Phase 3 FULL round.)*

**Mode: TARGETED.** Named fix (ISS-01 / BE-003 part 2: `BuildAdvice` 0-dp re-round) plus its blast
radius only. Prerequisite met: Phase 1 had a FULL round (2026-09-02, archived in
`review/phase-1.md`) whose file manifest this round compared against. **Not covered**: no
re-verification of Phase 2 or Phase 3, no runtime/DB/auth execution (still no test suite — org
policy), no re-run of the full static-analysis sweep (ISS-03: gate cannot build .NET Framework;
MSBuild is the accepted mechanical gate).

Scope note: the task brief said the engineer's fix was uncommitted, but the working tree shows the
Compass files clean vs HEAD — the fix is already committed. Verified against the current working
tree either way.

### Per-check evidence

1. **2 dp, no 0-dp re-round** — ✅ `ClassOnlineWeb/Helper/CompassPathCatalog.cs:105`:
   `double cur = Math.Round(avg[kv.Key], 2);` — a 67.5 subject → `Current = 67.5` (not 68);
   with target 75.0 the gap is 7.5 (not 7). Design rule 5 bullet 2 (Premium values 2 dp) satisfied.
2. **Gap computed from the 2-dp value** — ✅ `CompassPathCatalog.cs:107`:
   `Gap = Math.Round(Math.Max(0.0, target - cur), 2)` uses `cur` from line 105.
3. **Advice text truthful for decimal gaps** — ✅ `CompassPathCatalog.cs:125`:
   `$"{m.Subject} (ห่างเกณฑ์ {m.Gap:0.##} คะแนน)"` — `0.##` renders 7.5 as "7.5", not "8".
4. **Blast radius / do-not-modify invariants** — ✅ all four:
   - Free tier `analyst/{sID}` untouched: `CompassApiController.cs:48` still calls
     `AggregateByCanonicalSubject(raw)`; `:52` still `Math.Round(a.AverageScore, 0)`; 60/80
     thresholds unchanged (`:36-37`).
   - `AggregateByCanonicalSubject` unchanged: `CompassScoreService.cs:214-231`, byte-matches the
     form the 2026-09-02 FULL round verified.
   - No fallback duplicated at any caller: both Premium endpoints
     (`CompassApiController.cs:368` `AI_calculate/path`, `:392` `AI_advice/path`) obtain their
     dictionary exclusively via `CompassScoreService.GetCanonicalSubjectAveragesAsync`
     (`CompassScoreService.cs:282-287`), which delegates to the shared weighted method; no
     `?? 0` / re-averaging at any call site.
   - `AggregateByCanonicalSubjectWeighted` itself unchanged: `CompassScoreService.cs:245-272`
     matches the method the 2026-09-02 FULL round verified line for line (rules 0-5 + fallback
     inside the method).
5. **Fallback consistency (AC-012.4)** — ✅ the total-credit-0 fallback lives inside
   `AggregateByCanonicalSubjectWeighted` (`CompassScoreService.cs:258-260`), so a fallback subject
   flows through the same dictionary and `BuildAdvice`/`ComputeFit` see the identical value every
   other consumer sees.
6. **Mechanical gate** — ✅ `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build
   -p:Configuration=Debug -clp:ErrorsOnly -nologo` from `C:\src\sb-web-student` → **exit code 0**.

### Outcome — ✅ Passed (TARGETED)

ISS-01 closed. BE-003 part 2 verified; with the plan.md sync relay applied, Phase 1 is fully closed
(BE-001/BE-002 verified 2026-09-02; BE-003 both parts now verified).

