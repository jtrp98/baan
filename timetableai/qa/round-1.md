# QA — timetableai — Phase 4 archive

## Round 1 — 2026-10-01 — ❌ Failed (FULL) — archived verbatim (superseded by round 2 in `qa.md`)

## Verification Summary

- **Mode:** FULL ตามที่ขอ — แต่**รอบนี้ไม่มีหลักฐานที่รันได้จริง**: ไม่มี evidence package / `deterministic_gate` (เรียกแบบ interactive ผ่าน `sta execute`) · `node .claude/scripts/static-analysis-gate.js`, `dotnet build`, `sta context` ถูกปฏิเสธสิทธิ์ใน session นี้ · ไม่รัน git (ข้อห้ามของบทบาท) → แยกไฟล์ที่เปลี่ยนในรอบนี้ด้วย diff ไม่ได้ · ผลทุกข้อมาจากการอ่านโค้ด + ไล่ตัวอย่างคำนวณของ BR-81b ด้วยมือ
- **Deterministic sweep:** unverified (ไม่ได้รัน) — ไม่นับเป็นผ่าน
- **Schema-contract checker:** ไม่ได้รัน · ไม่มี schema change ใน Phase 4 (BE-005 อ่าน school DB อย่างเดียว) — ตรวจกับ design ~L2421 แล้วตรงสัญญา
- **Security:** ไม่มี auth/PII/upload ใหม่ · endpoint เดิมอยู่ใต้ DES-018 → security n/a ไม่เพิ่ม 🔒
- [sb-api-academic-timetable-ai] BE-005 — ⚠️ โค้ดตรงสัญญา, ไม่มีหลักฐานรัน
- [sb-tech-upgrade-web-system] FE-007 ❌ · FE-008 ❌ · FE-009 ⚠️

## Verified File Manifest

(อ่านเท่านั้น — ไม่มีไฟล์ใดผ่านการ build/typecheck ในรอบนี้)

- sb-api-academic-timetable-ai:AITimeTableBackend/Models/Response.cs (L43-45)
- sb-api-academic-timetable-ai:AITimeTableBackend/Controllers/WebAPIController.cs (`GetSubjectsByPlan` L492-528)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/_lib/course-weight.ts
- sb-tech-upgrade-web-system:…/_lib/intensity-config.ts
- sb-tech-upgrade-web-system:…/_lib/intensity-evaluation.ts
- sb-tech-upgrade-web-system:…/_lib/solver-intensity.ts
- sb-tech-upgrade-web-system:…/_lib/intensity-summary.ts
- sb-tech-upgrade-web-system:…/_lib/use-manual-edit-intensity-warning.ts
- sb-tech-upgrade-web-system:…/_lib/use-timetable-generation.ts (L194-221, 483-502, 605-639, 652-900)
- sb-tech-upgrade-web-system:…/_lib/use-select-curriculum.ts (L151-163)
- sb-tech-upgrade-web-system:…/_lib/use-schedule-summary.ts (L69-104)
- sb-tech-upgrade-web-system:…/page.tsx (L300-313, 1073-1207, 1260-1280, 1424)
- sb-tech-upgrade-web-system:src/components/layout/home/manage-teaching-schedule/TimetableGrid.tsx (L239-398, 680-717, 1071-1108, 1253-1265)
- sb-tech-upgrade-web-system:src/types/course.ts

## Per-Task Results

- **BE-005** [sb-api-academic-timetable-ai] — ⚠️ Partial · `sCourseGroupDescTh = cg != null ? (cg.Description ?? "") : ""` (WebAPIController.cs:526) ไม่ขึ้นกับ `isEn` · ไม่ trim · ไม่เพิ่มตัวกรอง `cDel` · `sCourseGroupDesc`/`sCourseGroupDescEn` (L524-525) ไม่เปลี่ยน · DTO additive (Response.cs:45) · **ไม่มี** response 2 ภาษา / ผล query / build
  - AC-054 (BE-005) — ⚠️ Partial: อ่านแล้วตรง, ไม่ได้เรียก endpoint
  - DES-019 (Rev 11 additive field) — ✅ Verified (อ่านสัญญาเทียบโค้ด)
- **FE-007** [sb-tech-upgrade-web-system] — ❌ Failed
  - ตัวตัดสิน `isCoreOrElectiveGroup` (course-weight.ts:71-85) ตรง BR-77: trim + `startsWith("พื้นฐาน"|"เพิ่มเติม")`, ไม่มี `includes`, ไม่จับคำอังกฤษ, ไม่มี fallback `sCourseTypeDesc`, ไม่มีฟิลด์ + `en` → false ทั้งแผน → `UNCLASSIFIED`, ไม่มีฟิลด์ + th → `sCourseGroupDesc` · `""` จาก BE-005 ไม่ trigger fallback (ถูก)
  - **แต่** objective "map `sCourseGroupDescTh` เข้า model วิชาของหน้า" ไม่สำเร็จ: map ถึงแค่ `subjectList.objects` (use-select-curriculum.ts:161) · `use-schedule-summary.ts:87-92` สร้าง `derivedCourses: Course[]` เหลือแค่ `id/name/dotColor/subCourses` · เส้นทางเปิดตารางเดิม (page.tsx:1073-1078, 1198-1203) ก็เหมือนกัน · `Course` (types/course.ts:14-26) ไม่มี `credits`/`sCourseGroupDesc*` · ผู้เรียก `courseWeightByClass` ทุกจุด (use-timetable-generation.ts:483, intensity-summary.ts:56, use-manual-edit-intensity-warning.ts:100) ส่ง `Course[]` → `qualifying.length === 0` เสมอ → **ทุกแผน `UNCLASSIFIED`** (FIND-P4-01)
  - AC-054 / BR-77 (FE-007) — ❌ Failed: "ผลจำแนกเท่ากันเมื่อ UI ไทยและอังกฤษ" เป็นจริงเพราะไม่มีวิชาหนักเลยทั้งสอง locale
  - DES-019 — ❌ Failed (เส้นทางของหน้าไม่เป็นไปตาม BR-77)
  - FE-002 re-verification — ❌ Failed บนเส้นทางของหน้า; ตัวตัดสินแบบ pure ผ่านทุกกรณี (μ_P, `nCredit = μ_P` → เบา, `nCredit = 0` ไม่นับใน μ, หน่วยกิตเท่ากัน → `EQUAL_CREDITS`) — ดู FIND-P4-06
- **FE-008** [sb-tech-upgrade-web-system] — ❌ Failed
  - ✅ `heavyDayThreshold` ฟังก์ชันเดียว (intensity-config.ts:75-78) คืน `null` เมื่อ H ≤ 0 หรือ D ≤ 0 · grep `Math.ceil` ใน `manage-teaching-schedule`: เหลือที่ intensity-config.ts:77 + timetable-helpers.ts:252 (ปัดเวลาหัวตาราง ไม่เกี่ยว) · นิยาม D เดิม 2 แบบ (`cells.length > 0`, `rows.length`) หายไป · `countTeachingDays` ตัวเดียว (intensity-evaluation.ts:43) ใช้โดย solver/สรุป/ตัวประเมิน
  - ✅ ตัวอย่าง BR-81b ไล่ด้วยมือกับ `evaluateClassRecommendations`: (1) F [2,2,1,0,0] → D5 T1 จ/อ เกิน + แถว ศ 0/0 · (2) G ส. club+พัก → ไม่นับ/ไม่แสดง · (3) การเลือก attempt ประเมินกริด (solver-intensity.ts:159-172) · (4) ลบหนักตัวเดียว D คงที่ (นับช่อง `empty`) · (5) `null` → ไม่มีแถว/penalty (`?? Infinity`) · (6) ต่อห้อง
  - ✅ value ordering ใช้ H จากโควตาคงที่ต่อ attempt (computeClassHeavyTotals ใน `buildGenerationBase` ต่อ attempt) · `isAttemptBetter` shortfall ก่อน, เท่ากันคง attempt แรก · ไม่มีการปฏิเสธเพราะ intensity · L0 → `[]`
  - ✅ `lstClassDays` ใช้ `isTeachingDay` predicate เดียวกับ D_c (intensity-summary.ts:102)
  - ❌ RNG ฉีดได้ไม่ครบ (FIND-P4-02) → หลักฐาน "Generate L0/L1/L2 ด้วย RNG ลำดับเดียวกัน" ทำไม่ได้
  - ⚠️ `sSuggestion` hard-code อังกฤษ (FIND-P4-03)
  - ❌ ในหน้าจริงไม่มีวิชาหนักเลย (FIND-P4-01) → ไม่มี penalty/ข้อเสนอแนะจริง
  - AC-055 (BR-81/81a/81b) — ⚠️ Partial: ตรรกะ pure ตรง oracle, เส้นทางจริงไม่มีวิชาหนัก
  - AC-055 (BR-81 Rev 16 ชุดวัน `lstClassDays`) — ✅ Verified (อ่านโค้ด)
  - AC-054 (BR-78/BR-80 ฟังก์ชันเดียว + RNG) — ❌ Failed (RNG)
  - AC-017 — ✅ Verified (อ่าน `isAttemptBetter` + loop :870-877)
  - DES-019 — ❌ Failed (RNG ~L2420) · DES-020 — ✅ Verified (`generateResult` ไม่เปลี่ยนความหมาย)
- **FE-009** [sb-tech-upgrade-web-system] — ⚠️ Partial
  - ✅ `diffManualEditWarnings` เทียบระดับคู่ (ห้อง, วัน) ก่อน/หลังด้วยตัวประเมินของ FE-008 · คู่ที่ละเมิดอยู่แล้วไม่เตือนซ้ำ (รวม Heavy อยู่แล้ว + Consecutive เพิ่ม = ไม่เตือน) · T_c ลด → วันอื่นถูกเตือน (ตัวอย่าง 4 [2,1,1,1,1]) · แนบ `reasons` ทุกตัว · L0 → `[]`
  - ✅ ทริกเกอร์: `markManualEdit()` ก่อน drop (:294), AddCourseModal (:351), swap (:684, :1088), remove (:705) · ถูกปฏิเสธ → `prev` → ไม่รายงาน · Generate/restore/period fetch ล้าง ref · ไม่ปฏิเสธ/ไม่แก้กริด · ไม่ persist · ไม่มี UI (`void latestManualEditWarning`)
  - ⚠️ FIND-P4-05 (ref ค้าง) · ⚠️ ไม่มีผลจริงจนกว่า FIND-P4-01 แก้
  - AC-054 / BR-80 (FE-009) — ⚠️ Partial: ตรรกะ diff/ทริกเกอร์ตรง, ไม่ได้รันสคริปต์ลำดับการแก้, เส้นทางจริงไม่มีวิชาหนัก
  - DES-019 — ⚠️ Partial

## Contract Checks

- `ItemPlanSubject.sCourseGroupDescTh` (design ~L2421) — ตรง (อ่าน)
- `lstRecommendations:[{nClassID, sClassName, sDay, nHeavy, nThreshold: number|null, sReason, sSuggestion}]` — รูปฟิลด์ตรง · `sSuggestion` ไม่ใช่ key+พารามิเตอร์ (FIND-P4-03)
- Data Model: Phase 4 ไม่แตะสคีมา · schema-contract checker ไม่ได้รัน (สิทธิ์)

## Issues Found

- → **frontend-engineer** (FE-007): ส่ง `credits`, `sCourseGroupDescTh`, `sCourseGroupDesc` ผ่าน `derivedCourses` (use-schedule-summary.ts:87-92) และเส้นทาง restore (page.tsx:1073-1078, 1198-1203 — `planSubjectResults` มีฟิลด์อยู่แล้ว) ไปยังวัตถุที่ `courseWeightByClass` อ่าน (หรือป้อนตัวจำแนกด้วยรายการวิชาจาก `GetSubjectsByPlan` ตรงๆ) — FIND-P4-01 · ห้ามแก้สูตร μ_P
- → **frontend-engineer** (FE-008): รับ `rng?: () => number` ที่ solver (`handleCpGenerate`/`runCpAttempt`/`buildGenerationBase`/`handleAiGenerate`) ส่งต่อให้ `shuffleArray` ทุกจุด (use-timetable-generation.ts:219, 221, 537, 549, 559, 779), ค่าเริ่มต้น `Math.random` — FIND-P4-02
- → **frontend-engineer** (FE-008): `sSuggestion` เป็น key + พารามิเตอร์ — FIND-P4-03 · ส่ง `gridColumnMetas`/`courseWeightMap` ให้สรุปใน `handleCpGenerate` — FIND-P4-04
- → **frontend-engineer** (FE-009): ล้าง `pendingManualEditRef` เมื่อ updater ปฏิเสธ หรือที่ `setRows` ทุกจุดที่ไม่ใช่การแก้มือ (name-column modal :1255) — FIND-P4-05
- §21 (comment): ไม่พบ what-comment ใหม่ที่ต้องแก้ในโค้ดที่อ่าน; comment ใหม่ (TimetableGrid.tsx:239-241, intensity-summary.ts:101, solver-intensity.ts:159-160) บอก why · ข้อจำกัด: ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมไม่ได้
- §22 (ไฟล์ใหม่): `_lib/intensity-evaluation.ts` — yes (kebab-case + doc header เหมือน `intensity-config.ts`) · `_lib/use-manual-edit-intensity-warning.ts` — yes (hook `use-*.ts` เหมือน `use-schedule-summary.ts`)

## Review Outcome

**Status:** ❌ Failed (FULL)

- FE-007 ❌ (FIND-P4-01 Critical) · FE-008 ❌ (FIND-P4-02, FIND-P4-01) · FE-009 ⚠️ (ขึ้นกับ FE-008 + FIND-P4-01) · BE-005 ⚠️ (โค้ดถูก แต่ไม่มีหลักฐาน build/endpoint)
- `plan.md`: FE-007, FE-008, FE-009 → `blocked` · BE-005 คง `pending` จนกว่าจะมีหลักฐาน build + response 2 ภาษา
- ต้องให้คนตัดสิน: (1) ส่งกลับ frontend-engineer ตาม Issues Found (2) FIND-P4-06 สถานะของ FE-002 (3) BE-005 ยอมรับด้วยการอ่านโค้ด หรือรอหลักฐานรัน

## Round 2 — 2026-10-01 — ❌ Failed (FULL) — archived verbatim (superseded by round 3 in `qa.md`)

## Verification Summary

- **Round:** R2 (re-check ครั้งที่ 1 หลัง frontend-engineer แก้ FIND-P4-01..05) · R1 อยู่ที่ [qa/phase-4.md](round-1.md)
- **Mode:** FULL ตามที่ขอ — **ไม่มี evidence package / `deterministic_gate`** (เรียกผ่าน `sta execute`, interactive) · ใน session นี้ `node .claude/scripts/static-analysis-gate.js`, `dotnet build`, `npx tsc --noEmit`, `sta context` และ `generate-status.js` **ถูกปฏิเสธสิทธิ์ทั้งหมด** · ไม่รัน git (ข้อห้ามของบทบาท) → ผลทุกข้อมาจากการอ่านโค้ด
- **Deterministic sweep:** unverified (ไม่ได้รัน) — ไม่นับเป็นผ่าน · จากการอ่าน: typecheck ของ frontend **จะไม่ผ่าน** (FIND-P4-07)
- **หลักฐานที่ผู้เรียกส่งมา:** "`dotnet build` ผ่าน 0 errors" ของ BE-005 — เป็นข้อความของผู้เรียก ไม่มี log และ QA ไม่ได้รันเอง → บันทึกไว้ ไม่นับเป็นหลักฐานที่ตรวจได้
- **Schema-contract checker:** ไม่ได้รัน (สิทธิ์) · Phase 4 ไม่แตะสคีมา
- **Security:** ไม่มี auth/PII/upload ใหม่ · endpoint เดิมอยู่ใต้ DES-018 → ไม่เพิ่ม 🔒
- [sb-api-academic-timetable-ai] BE-005 ⚠️ (ไม่เปลี่ยนจาก R1)
- [sb-tech-upgrade-web-system] FE-007 ⚠️ · FE-008 ❌ · FE-009 ⚠️

## Verified File Manifest

(อ่านเท่านั้น — ไม่มีไฟล์ใดผ่าน build/typecheck ที่ QA รันเองในรอบนี้)

- sb-api-academic-timetable-ai:AITimeTableBackend/Controllers/WebAPIController.cs (L526) · Models/Response.cs (L45)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-schedule-summary.ts (L69-122)
- sb-tech-upgrade-web-system:…/page.tsx (L1045-1095, 1178-1222, 1274-1295)
- sb-tech-upgrade-web-system:…/_lib/use-select-curriculum.ts (L151-163)
- sb-tech-upgrade-web-system:src/app/api/school/[schoolId]/plan/[planId]/subjects/route.ts (proxy ตรง ไม่ตัดฟิลด์)
- sb-tech-upgrade-web-system:…/_lib/course-weight.ts (ทั้งไฟล์)
- sb-tech-upgrade-web-system:…/_lib/use-timetable-generation.ts (L193-227, 483-502, 524-639, 652-658, 776-904)
- sb-tech-upgrade-web-system:…/_lib/timetable-helpers.ts (L42-44)
- sb-tech-upgrade-web-system:…/_lib/intensity-evaluation.ts (ทั้งไฟล์)
- sb-tech-upgrade-web-system:…/_lib/intensity-config.ts (grep: `SolverIntensityConfig` ไม่มี `computeDailyThreshold`)
- sb-tech-upgrade-web-system:src/components/layout/home/manage-teaching-schedule/TimetableGrid.tsx (L239-269, 290-406, 424-430, 525-533, 688-726, 1092-1100, 1260-1268)
- sb-tech-upgrade-web-system:tests/app/timetable/solver-intensity.test.ts (L1-77) · tests/app/timetable/intensity-summary.test.ts (L125-145)
- sb-tech-upgrade-web-system:tsconfig.json

## Per-Task Results

- **BE-005** [sb-api-academic-timetable-ai] — ⚠️ Partial · โค้ดไม่เปลี่ยนจาก R1 (`sCourseGroupDescTh = cg != null ? (cg.Description ?? "") : ""`, WebAPIController.cs:526) · build ผ่านตามคำของผู้เรียก (ไม่มี log) · ยังไม่มี response `sblanguage: en/th` + ผล query ที่ Required validation กำหนด
  - AC-054 (BE-005) — ⚠️ Partial: อ่านแล้วตรง, ไม่ได้เรียก endpoint
  - DES-019 — ✅ Verified (อ่านสัญญาเทียบโค้ด)
- **FE-007** [sb-tech-upgrade-web-system] — ⚠️ Partial
  - FIND-P4-01 — ✅ Verified (อ่าน): เส้นทาง Generate `use-schedule-summary.ts:81-108` เก็บ `credits`/`sCourseGroupDescTh`/`sCourseGroupDesc` จาก `subjectList.objects` (use-select-curriculum.ts:157-161) แล้วแนบทั้งที่ course และ sub-course · restore `page.tsx:1052-1095` (จากวิชาที่วาง) และ `1189-1218` (catalog จาก `GetSubjectsByPlan` ผ่าน proxy ที่ไม่ตัดฟิลด์) ใช้ `toCourse` ตัวเดียวกัน · `course-weight.ts` อ่านได้ทั้งสองระดับ (`:82, 85, 96`) · ผู้เรียก `courseWeightByClass` ทั้ง 3 จุดส่งวัตถุเดิมต่อ (ไม่ map ทิ้งฟิลด์) → แผนที่มีหมวดพื้นฐาน/เพิ่มเติม + หน่วยกิตต่างกันได้ `OK` · type `Course` ยังไม่มีฟิลด์เหล่านี้ (ใช้ `as Course`) — runtime ใช้ได้ plan ไม่ได้บังคับ
  - ตัวตัดสิน `isCoreOrElectiveGroup` (`course-weight.ts:71-89`) ตรง BR-77 ตามที่ตรวจใน R1 · ไม่มี `sCourseTypeDesc` ในเส้นทางจำแนก (`subject: c.sCourseTypeDesc` ใช้แสดงผลเท่านั้น)
  - AC-054 / BR-77 (FE-007) — ⚠️ Partial: อ่านแล้วตรงทุกกรณี (trim+startsWith, ""/null → ไม่อยู่ในกลุ่ม, ไม่มีฟิลด์+en → `UNCLASSIFIED`, ไม่มีฟิลด์+th → `sCourseGroupDesc`) แต่ไม่ได้รันตารางเทียบ th/en และ typecheck/lint ของโปรเจกต์ไม่ผ่าน (FIND-P4-07)
  - DES-019 — ✅ Verified (อ่าน)
  - FE-002 re-verification — ⚠️ Partial: ตัวตัดสิน + เส้นทางของหน้าตรงแล้ว (อ่าน) · ยังไม่ได้รันชุด BR-77 ของ FE-002 — สถานะ FE-002 รอคนตัดสิน (FIND-P4-06)
- **FE-008** [sb-tech-upgrade-web-system] — ❌ Failed
  - FIND-P4-02 — ✅ Verified (อ่าน): `rng?: () => number` ที่ `buildGenerationBase` (:193), `handleAiGenerate` (:524→529), `runCpAttempt` (:652→658), `handleCpGenerate` (:868→874) · ส่งให้ `shuffleArray` ทุกจุด (:219, 221, 537, 549, 559, 779) · ค่าเริ่มต้น `Math.random` ที่ `timetable-helpers.ts:42` · ไม่มี `Math.random` อื่นใน `manage-teaching-schedule`
  - FIND-P4-03 — ✅ Verified (อ่าน): `sSuggestion: { key, params: { day, threshold?, diff? } }` (`intensity-evaluation.ts:24-27, 115-118, 129`)
  - FIND-P4-04 — ✅ Verified (อ่าน): `handleCpGenerate` ส่ง `gridColumnMetas: best.gridColumnMetas` + `courseWeightMap: best.weightMap` (:883-891) · `handleAiGenerate` ส่งเหมือนกัน (:608-616) · เส้นทาง restore ยังไม่ส่ง — FIND-P4-08 (Minor)
  - ส่วนที่ผ่านใน R1 (ฟังก์ชัน T_c/ตัวนับ D_c เดียว, oracle BR-81b 1–6, การเลือก attempt, `lstClassDays`) ไม่เปลี่ยน
  - ❌ FIND-P4-07: test ของ FE-003/FE-004 ไม่ได้ปรับตาม refactor → typecheck ของโปรเจกต์ error + test 2 ไฟล์ล้ม — ข้อ "typecheck/lint/build ผ่าน" ใน Required validation ไม่ผ่าน
  - AC-055 (BR-81/81a/81b) — ⚠️ Partial: ตรรกะตรง oracle (อ่าน + ไล่มือใน R1) แต่ไม่ได้ execute
  - AC-055 (BR-81 Rev 16 `lstClassDays`) — ✅ Verified (อ่าน)
  - AC-054 (BR-78/BR-80 ฟังก์ชันเดียว + RNG) — ⚠️ Partial: RNG ฉีดได้แล้ว (อ่าน) แต่ยังไม่มีการเทียบ L0/L1/L2 บน RNG ลำดับเดียวกัน
  - AC-017 — ✅ Verified (อ่าน `isAttemptBetter` + loop :872-879)
  - DES-019 — ⚠️ Partial (สัญญาตรง, typecheck ไม่ผ่าน) · DES-020 — ✅ Verified
- **FE-009** [sb-tech-upgrade-web-system] — ⚠️ Partial
  - FIND-P4-05 — ✅ Verified (อ่าน): updater ที่ปฏิเสธทุกทางล้าง ref ก่อน `return prev` (`TimetableGrid.tsx:299, 306, 314, 323, 359, 365, 371, 378`) · name-column modal ล้าง ref ก่อน `setRows` (:1264) · `setRows` ทั้ง 10 จุดเป็นการแก้มือที่เรียก `markManualEdit()` หรือการเขียนจากภายนอกที่ล้าง ref
  - AC-054 / BR-80 (FE-009) — ⚠️ Partial: ตรรกะ diff/ทริกเกอร์ตรง (อ่าน) แต่ไม่ได้รันสคริปต์ลำดับการแก้ · ขึ้นกับ FE-008 (FIND-P4-07)
  - DES-019 — ⚠️ Partial

## Contract Checks

- `ItemPlanSubject.sCourseGroupDescTh` (design ~L2421) — ตรง (อ่าน)
- `lstRecommendations:[{nClassID, sClassName, sDay, nHeavy, nThreshold: number|null, sReason, sSuggestion}]` — ตรง · `sSuggestion` = key + พารามิเตอร์ ตาม Scope ของ FE-008
- Data Model: Phase 4 ไม่แตะสคีมา · schema-contract checker ไม่ได้รัน (สิทธิ์)

## Unverified Behaviour — undeployed phases

มี vitest ใน `tests/` แต่ไม่ได้รัน และอย่างน้อย 2 ไฟล์ล้าสมัย (FIND-P4-07) — กติกาต่อไปนี้**อ่านอย่างเดียว ไม่ได้ execute**:

- Phase 4 — deterministic sweep / `typecheck` / `lint` / `build` ของทั้ง 2 Target ไม่ได้รันโดย QA (frontend: คาดว่า typecheck ไม่ผ่านจาก FIND-P4-07)
- Target sb-api-academic-timetable-ai — `dotnet build` ผ่านตามคำของผู้เรียกเท่านั้น (ไม่มี log) · ไม่มีการเรียก `GetSubjectsByPlan` ทั้ง `sblanguage: en/th`
- Target sb-tech-upgrade-web-system — ไม่มีหลักฐาน: typecheck/lint/build, ตาราง BR-77 th/en, oracle BR-81b, สคริปต์การแก้มือ L0/L1/L2, การเทียบ L0/L1/L2 บน RNG เดียวกัน
- BR-77 trim/startsWith กับค่าจริงของ `TCourseGroup.Description` (SA-Q18 ยังเปิด)
- BR-77 บนเส้นทาง restore เมื่อ catalog fetch ล้ม: `SubjectSlot` ของ `Timetable/Get` อาจไม่มี `nCredit`/`sCourseGroupDesc*` (โค้ดอ่านผ่าน `as unknown as`) → แผนนั้นอาจได้ `UNCLASSIFIED` — ไม่ได้ยืนยันรูป response
- BR-79 "บล็อกต่อเนื่องนับตามจำนวนคาบ" — ตัวประเมินนับต่อ cell; ไม่ได้ยืนยันว่า cell หนึ่งช่องอาจแทนหลายคาบหรือไม่
- BR-81b (ค2) โควตา H "รวมคาบ seed จากล็อก/link ไม่รวมวิชาที่ถูกตัด" — ไม่ได้ไล่ข้อมูลจริง
- ลำดับ React ของ `TimetableGrid` (updater ถูกเรียกตอน render/StrictMode เรียกซ้ำ, snapshot ก่อน/หลังผ่าน `useEffect`) — ไม่ได้รันในเบราว์เซอร์

## Issues Found

- → **frontend-engineer** (FE-008): ปรับ `tests/app/timetable/solver-intensity.test.ts` ให้ทดสอบ `heavyDayThreshold` (คืน `null` เมื่อ H/D ≤ 0) แทน `computeDailyThreshold` และปรับ `tests/app/timetable/intensity-summary.test.ts:134-145` ให้ตรง `lstRecommendations` ของ FE-008 (L0 → `[]` ฯลฯ) แล้วส่ง log `tsc --noEmit` + lint + build + vitest ที่ผ่าน — FIND-P4-07
- → **frontend-engineer** (FE-008, Minor): ส่ง `gridColumnMetas` ให้สรุปตอน restore (`page.tsx:1286`) และเพิ่ม `locale` ใน dependency ที่ขาด — FIND-P4-08
- → **backend-engineer** (BE-005): แนบ log `dotnet build` + response `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description` ตาม Required validation
- → **human**: FIND-P4-06 (สถานะ FE-002)
- §21 (comment) ในไฟล์ที่แก้รอบนี้: comment ใหม่บอก why ทั้งหมด (`use-schedule-summary.ts:99-100`, `page.tsx:1051`, `TimetableGrid.tsx:297-298, 1263`) — ไม่พบ what-comment ที่ต้องแก้ · ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมได้จากการอ่านเท่านั้น
- §22: ไม่มีไฟล์ใหม่ในรอบนี้

## Review Outcome

**Status:** ❌ Failed (FULL)

- FIND-P4-01..05 แก้แล้วในโค้ด (อ่าน) → ปิดเป็น resolved R2
- FE-008 ❌ (FIND-P4-07 — typecheck/test ของโปรเจกต์พัง) · FE-007 ⚠️ · FE-009 ⚠️ (ไม่มีหลักฐาน typecheck/lint ที่ plan กำหนด + ขึ้นกับ FE-008) · BE-005 ⚠️ (build ตามคำผู้เรียก, ไม่มี response 2 ภาษา)
- **ไม่ตั้ง Verified ตามที่ผู้เรียกขอ:** ไม่ได้รัน deterministic sweep, ไม่มีหลักฐานจากการ execute และพบ defect ใหม่ — QA จึงไม่ประทับผ่าน
- `plan.md`: ไม่เปลี่ยน — FE-007, FE-008, FE-009 คง `blocked` · BE-005 คง `pending`
- นี่คือ re-check ที่ล้มครั้งที่ 1 (ยังไม่ถึงเกณฑ์ escalate ที่ 2 ครั้ง)
- ต้องให้คนตัดสิน: (1) ส่ง FE-008 กลับ frontend-engineer ตาม FIND-P4-07/08 (2) FIND-P4-06 (3) เปิดสิทธิ์ให้ QA รัน gate/`tsc`/`dotnet build` หรือส่ง log มาให้ ก่อนรอบ R3

## Round 3 — 2026-10-01 — ⚠️ Partial (FULL) — archived verbatim (superseded by round 4 in `qa.md`)

## Verification Summary

- **Round:** R3 (re-check ครั้งที่ 2 หลังแก้ FIND-P4-07/08) · R1, R2 อยู่ที่ [qa/phase-4.md](round-1.md)
- **Mode:** FULL ตามที่ขอ · ตรวจทุก task ในเฟส · เรียกในชื่อ STA run `run-mup836mh-a1180033` แต่ **ไม่มี evidence package / ฟิลด์ `deterministic_gate`** จึงถือเป็น interactive · QA ลองรัน `node .claude/scripts/static-analysis-gate.js`, `npx vitest run`, `sta context` และ `generate-status.js` เอง — **ถูกปฏิเสธสิทธิ์ทั้งหมด** · ไม่รัน git (ข้อห้ามของบทบาท)
- **Deterministic sweep:** unverified — gate ไม่ได้รัน ไม่นับเป็นผ่าน
- **หลักฐานการรันที่ผู้เรียกส่งมา (บันทึกตามที่รายงาน QA ไม่ได้รันซ้ำ):** [sb-tech-upgrade-web-system] `npm run type-check` (`tsc --noEmit`) 0 error exit 0 · `npx vitest run tests/app/timetable/` 4 ไฟล์ 29/29 ผ่าน (course-weight 10, shortfall-report 5, solver-intensity 7, intensity-summary 7) · [sb-api-academic-timetable-ai] `dotnet build` 0 error exit 0 · **ไม่มีรายงาน lint/build ของ frontend**
- **QA ตรวจเอง (อ่าน):** ไฟล์ test ตรงกับที่รายงาน (มี `heavyDayThreshold`, `lstRecommendations`) · ไม่มี `computeDailyThreshold` เหลือใน `tests/app/timetable/` · ไฟล์ test มี 4 ไฟล์ตรงกับ log
- **Schema-contract checker:** ไม่ได้รัน (สิทธิ์) · Phase 4 ไม่แตะสคีมา
- **Security:** ไม่มี auth/PII/upload ใหม่ · endpoint เดิมอยู่ใต้ DES-018 → ไม่เพิ่ม 🔒
- [sb-api-academic-timetable-ai] BE-005 ⚠️
- [sb-tech-upgrade-web-system] FE-007 ⚠️ (ขาดแค่ lint) · FE-008 ⚠️ · FE-009 ⚠️

## Verified File Manifest

(อ่านในรอบนี้ · ผล typecheck/test/build มาจาก log ของผู้เรียก)

- sb-api-academic-timetable-ai:AITimeTableBackend/Controllers/WebAPIController.cs (L526) · Models/Response.cs (L45) — อ่าน R2 + `dotnet build` (log)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/page.tsx (L1275-1306)
- sb-tech-upgrade-web-system:…/_lib/use-timetable-generation.ts (grep `locale`, dependency arrays :502, 639, 858, 904)
- sb-tech-upgrade-web-system:tests/app/timetable/solver-intensity.test.ts (L1-80 + รายชื่อ `it`)
- sb-tech-upgrade-web-system:tests/app/timetable/intensity-summary.test.ts (L120-210)
- sb-tech-upgrade-web-system:tests/app/timetable/course-weight.test.ts (L10-44 + รายชื่อ `it`)
- sb-tech-upgrade-web-system: ไฟล์อื่นของ Phase 4 — ตามรายการ R2 ใน [qa/phase-4.md](round-1.md) (ไม่มีรายงานว่าเปลี่ยนในรอบนี้)

## Per-Task Results

- **BE-005** [sb-api-academic-timetable-ai] — ⚠️ Partial: โค้ดตรง (`WebAPIController.cs:526`, อ่านใน R1/R2) · `dotnet build` 0 error (log ของผู้เรียก) · **ยังไม่มี** response `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description` ตามที่ Required validation กำหนด
  - AC-054 (BE-005) — ⚠️ Partial: อ่านโค้ดแล้วตรง + build ผ่าน แต่ไม่ได้เรียก endpoint
  - DES-019 — ✅ Verified (เทียบสัญญากับโค้ด)
- **FE-007** [sb-tech-upgrade-web-system] — ⚠️ Partial (ขาดแค่ lint)
  - AC-054 / BR-77 — ✅ Verified (รันแล้วตาม log ของผู้เรียก): `course-weight.test.ts:12-41` ครอบ trim, ขึ้นต้นด้วย "พื้นฐาน"/"เพิ่มเติม", "รายวิชาพื้นฐาน" → ไม่อยู่ในกลุ่ม, ""/null/{} → ไม่อยู่ในกลุ่ม, ไม่มีฟิลด์ + th → `sCourseGroupDesc`, ไม่มีฟิลด์ + en → ไม่อยู่ในกลุ่ม, มี `sCourseGroupDescTh` + en → อยู่ในกลุ่ม · ชุดของ FE-002 (`:46-133`: μ_P, `nCredit` = μ_P, `nCredit = 0`, หน่วยกิตเท่ากัน, `UNCLASSIFIED`) ผ่าน · ยังไม่มีเคสค่า "Core" และเคส "หมวดว่าง + `sCourseTypeDesc` พื้นฐาน" (ตัวตัดสินไม่อ่าน `sCourseTypeDesc` — ตรวจด้วย grep ใน R2)
  - FIND-P4-06 — ✅ Verified (คนตัดสิน: ไม่เปิด FE-002 ใหม่)
  - Required validation "typecheck/lint ผ่าน" — typecheck ✅ (log) · lint ไม่มีหลักฐาน
  - (R2, ยังจริง) FIND-P4-01 — ✅ Verified (อ่าน): เส้นทาง Generate `use-schedule-summary.ts:81-108` เก็บ `credits`/`sCourseGroupDescTh`/`sCourseGroupDesc` จาก `subjectList.objects` (use-select-curriculum.ts:157-161) แล้วแนบทั้งที่ course และ sub-course · restore `page.tsx:1052-1095` (จากวิชาที่วาง) และ `1189-1218` (catalog จาก `GetSubjectsByPlan` ผ่าน proxy ที่ไม่ตัดฟิลด์) ใช้ `toCourse` ตัวเดียวกัน · `course-weight.ts` อ่านได้ทั้งสองระดับ (`:82, 85, 96`) · ผู้เรียก `courseWeightByClass` ทั้ง 3 จุดส่งวัตถุเดิมต่อ (ไม่ map ทิ้งฟิลด์) → แผนที่มีหมวดพื้นฐาน/เพิ่มเติม + หน่วยกิตต่างกันได้ `OK` · type `Course` ยังไม่มีฟิลด์เหล่านี้ (ใช้ `as Course`) — runtime ใช้ได้ plan ไม่ได้บังคับ
  - DES-019 — ✅ Verified
- **FE-008** [sb-tech-upgrade-web-system] — ⚠️ Partial
  - FIND-P4-07 — ✅ Verified (อ่าน test + log `tsc`/vitest)
  - FIND-P4-08 — ⚠️ Partial: ส่วน `gridColumnMetas` แก้แล้ว `page.tsx:1288-1299` · `locale` ยังไม่อยู่ใน dependency (`use-timetable-generation.ts:639, 904`, `page.tsx:1306`) — Minor; น่าจะไม่เปลี่ยนผลเพราะการเปลี่ยนภาษาผ่าน route `[locale]` จะ remount หน้า (อ่าน ไม่ได้รัน)
  - FIND-P4-02, FIND-P4-03, FIND-P4-04 — ✅ Verified (อ่านใน R2 · R3: test assert `sSuggestion: { key }`)
  - AC-055 (BR-81/81a) — ⚠️ Partial: รันแล้วแค่กริดเดียว (`intensity-summary.test.ts:134-195`: L0 → `[]`, L1 → 1 แถว `HeavyDayOverThreshold`, L2 → + `ConsecutiveHeavy`) · `heavyDayThreshold(0,5)` → `null` · **ยังไม่ได้รัน oracle BR-81b ตัวอย่าง 1–6** (ห้อง F/G/K, ตัวอย่าง 4, D = 0, ห้อง A/D แยกกัน) และตาราง ≥ 2 ห้อง × ทุกวัน
  - AC-055 (BR-81 Rev 16 `lstClassDays`) — ⚠️ Partial: อ่านแล้วตรง (R2) · ไม่มี test (F, ศ) = 0/0 และห้อง G ไม่มีแถว ส.
  - AC-054 (BR-78/BR-80) — ⚠️ Partial: RNG ฉีดได้ (อ่าน R2) · `isAttemptBetter` รันแล้ว (`solver-intensity.test.ts:292`) · ยังไม่มีการเทียบ L0/L1/L2 บน RNG ลำดับเดียวกัน (BR-80(4))
  - AC-017 — ✅ Verified (`isAttemptBetter`: shortfall มาก่อน — รันใน test)
  - DES-019 — ✅ Verified (สัญญา `lstRecommendations` ตรง + typecheck ผ่าน) · DES-020 — ✅ Verified
  - Required validation "typecheck/lint/build" — typecheck ✅ (log) · lint/build ของ frontend ไม่มีหลักฐาน
- **FE-009** [sb-tech-upgrade-web-system] — ⚠️ Partial
  - AC-054 / BR-80 (FE-009) — ⚠️ Partial: ตรรกะ diff/ทริกเกอร์ตรง (อ่าน R2) · **ไม่มี test หรือสคริปต์ลำดับการแก้มือ** (วาง/`AddCourseModal`/สลับ/ย้าย/ลบ ที่ L0/L1/L2) ตามที่ Required validation กำหนด
  - FIND-P4-05 — ✅ Verified (อ่าน R2)
  - DES-019 — ✅ Verified (เรียกฟังก์ชันของ FE-008, typecheck ผ่าน)
  - Required validation "typecheck/lint" — typecheck ✅ (log) · lint ไม่มีหลักฐาน

## Contract Checks

- `ItemPlanSubject.sCourseGroupDescTh` (design ~L2421) — ตรง (อ่าน)
- `lstRecommendations:[{nClassID, sClassName, sDay, nHeavy, nThreshold: number|null, sReason, sSuggestion}]` — ตรง · `sSuggestion` = key + พารามิเตอร์ ตาม Scope ของ FE-008
- Data Model: Phase 4 ไม่แตะสคีมา · schema-contract checker ไม่ได้รัน (สิทธิ์)

## Issues Found

- → **frontend-engineer** (FE-007/FE-008/FE-009): แนบ log lint + build ของ frontend
- → **frontend-engineer** (FE-008): test oracle BR-81b ตัวอย่าง 1–6 + `lstClassDays` Rev 16 ((F, ศ) = 0/0; ห้อง G ไม่มีแถว ส.) + การเทียบ L0/L1/L2 บน RNG ที่ฉีดลำดับเดียวกัน
- → **frontend-engineer** (FE-009): test/สคริปต์ลำดับการแก้มือ L0/L1/L2 พร้อมตาราง "ลำดับการแก้ → คำเตือนที่คาด/ที่ได้"
- → **frontend-engineer** (Minor, FIND-P4-08 ส่วนที่เหลือ): เพิ่ม `locale` ใน dependency `use-timetable-generation.ts:639, 904` และ `page.tsx:1306`
- → **backend-engineer** (BE-005): response `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description`
- §21 (comment) ในไฟล์ที่แก้รอบนี้: `page.tsx:1285-1303` ไม่มี comment ใหม่ · `intensity-summary.test.ts:135` บอกที่มาของค่าที่คาด (เก็บได้) · `solver-intensity.test.ts:42-43, 50` (`// ceil(10 / 5) = 2` ฯลฯ) เป็น what-comment ที่ทวนสิ่งที่ assert อยู่แล้ว — Minor → **frontend-engineer** ลบ หรือเปลี่ยนเป็นที่มาของ oracle · ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมได้จากการอ่านเท่านั้น
- §22: ไม่มีไฟล์ใหม่ในรอบนี้ (ไฟล์ test 4 ไฟล์มีอยู่แล้ว)

## Review Outcome

**Status:** ⚠️ Partial (FULL)

- FIND-P4-01..07 → resolved (FIND-P4-06 resolved with user decision) · FIND-P4-08 ส่วน `gridColumnMetas` resolved, ส่วน `locale` ยังเปิดเป็น Minor ไม่บล็อก
- typecheck ผ่านและ 29 test ผ่าน (log ของผู้เรียก) → FE-008 ไม่ใช่ ❌ อีกแล้ว
- **ไม่ตั้ง ✅ Verified ตามที่ผู้เรียกขอ:** QA รัน gate เองไม่ได้ และยังไม่มีหลักฐานที่ Required validation ใน plan กำหนด: lint/build ของ frontend (ทุก task FE), oracle BR-81b 1–6 + เทียบ RNG (FE-008), สคริปต์การแก้มือ (FE-009), response 2 ภาษา (BE-005) · การยอมรับทั้งที่ยังขาดหลักฐานต้องเป็นการตัดสินของคน QA ประทับแทนไม่ได้
- `plan.md`: BE-005 `pending` → `blocked` · FE-007, FE-008, FE-009 คง `blocked` — **ไม่ตั้ง `verified`**
- นี่คือ re-check ที่ไม่ผ่านครั้งที่ 2 → **escalate ถึงคน** ไม่ส่งรอบใหม่เอง
- ต้องให้คนตัดสิน (แยกทีละ task ได้): (1) **ยอมรับ** ตามหลักฐานที่มี โดยรายการ Unverified Behaviour ข้างบนติดไปจนถึง deploy (2) **ส่งกลับ** engineer ตาม Issues Found (3) **ปรับขอบเขต** Required validation ผ่าน `project-manager` · ถ้าเลือก (1) QA ตั้ง `verified` ในรอบถัดไปพร้อมบันทึกคำตัดสินนั้น

## Round 4 (Final) — 2026-10-01 — ✅ Verified (FULL) — archived verbatim (superseded by Phase 5 round 1 in `qa.md`; Open Issues and Phase 4 Unverified Behaviour stay live in `qa.md`)

## Verification Summary

- **Round:** R4 (Final — บันทึกคำตัดสินของคน) · R1, R2, R3 อยู่ที่ [qa/phase-4.md](round-1.md)
- **Mode:** FULL · ตรวจทุก task ในเฟส (BE-005, FE-007, FE-008, FE-009) · STA run `run-mup8cm1t-e0a29316` — **ไม่มี evidence package / ฟิลด์ `deterministic_gate`** จึงถือเป็น interactive · QA ลองรัน `sta context` และ `node .claude/scripts/static-analysis-gate.js` อีกครั้ง — **ถูกปฏิเสธสิทธิ์** · ไม่รัน git (ข้อห้ามของบทบาท)
- **Deterministic sweep:** unverified — gate ไม่ได้รัน ไม่นับเป็นผ่าน (ระบุใน Unverified Behaviour)
- **คำตัดสินของคน (R4):** ผู้ใช้ "ยอมรับผล Phase 4 ตามหลักฐานปัจจุบัน (tsc ผ่าน 0 error, vitest ผ่าน 29/29, dotnet build ผ่าน) และให้ QA บันทึก Verified (FULL) พร้อมรายการ Unverified Behaviour สำหรับตรวจสอบตอน Deploy" → ตามทางเลือก (1) ของ R3 · ผล ✅ ในรอบนี้คือ **การยอมรับของคนบนหลักฐานที่มี** ไม่ใช่ QA รับรองว่าข้อที่ขาดหลักฐานผ่าน
- **หลักฐานการรันที่ใช้ (log ของผู้เรียกใน R3 · QA ไม่ได้รันซ้ำ · ไม่มีรายงานว่าโค้ดเปลี่ยนหลัง R3):** [sb-tech-upgrade-web-system] `tsc --noEmit` 0 error · vitest `tests/app/timetable/` 29/29 ผ่าน · [sb-api-academic-timetable-ai] `dotnet build` 0 error · ไม่มี lint/build ของ frontend
- **Schema-contract checker:** ไม่ได้รัน (สิทธิ์) · Phase 4 ไม่แตะสคีมา
- **Security:** ไม่มี auth/PII/upload ใหม่ · endpoint เดิมอยู่ใต้ DES-018 → ไม่เพิ่ม 🔒
- [sb-api-academic-timetable-ai] BE-005 ✅ (ยอมรับโดยคน)
- [sb-tech-upgrade-web-system] FE-007 ✅ · FE-008 ✅ · FE-009 ✅ (ยอมรับโดยคน)

## Verified File Manifest

(ชุดเดียวกับ R3 — R4 ไม่มีโค้ดเปลี่ยน · ผล typecheck/test/build มาจาก log ของผู้เรียก)

- sb-api-academic-timetable-ai:AITimeTableBackend/Controllers/WebAPIController.cs (L526) · Models/Response.cs (L45) — อ่าน R2 + `dotnet build` (log)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/page.tsx (L1275-1306)
- sb-tech-upgrade-web-system:…/_lib/use-timetable-generation.ts (grep `locale`, dependency arrays :502, 639, 858, 904)
- sb-tech-upgrade-web-system:tests/app/timetable/solver-intensity.test.ts (L1-80 + รายชื่อ `it`)
- sb-tech-upgrade-web-system:tests/app/timetable/intensity-summary.test.ts (L120-210)
- sb-tech-upgrade-web-system:tests/app/timetable/course-weight.test.ts (L10-44 + รายชื่อ `it`)
- sb-tech-upgrade-web-system: ไฟล์อื่นของ Phase 4 — ตามรายการ R2 ใน [qa/phase-4.md](round-1.md) (ไม่มีรายงานว่าเปลี่ยนในรอบนี้)

## Per-Task Results

คำตัดสินของคน (HUMAN-P4-R4) ยอมรับทุก task บนหลักฐานที่มี · "ยอมรับโดยคน" = ข้อที่ Required validation ยังขาดหลักฐาน — รายการเต็มอยู่ใน Unverified Behaviour

- **BE-005** [sb-api-academic-timetable-ai] — ✅ Verified (ยอมรับโดยคน): โค้ดตรง (`WebAPIController.cs:526`, `Response.cs:45`, อ่านใน R1/R2) · `dotnet build` 0 error (log ของผู้เรียก) · ยังไม่มี response `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description` → Unverified Behaviour
  - AC-054 (BE-005) — ✅ Verified (ยอมรับโดยคน): อ่านโค้ดแล้วตรง + build ผ่าน · ไม่ได้เรียก endpoint
  - DES-019 — ✅ Verified (เทียบสัญญากับโค้ด)
- **FE-007** [sb-tech-upgrade-web-system] — ✅ Verified (ยอมรับโดยคน — ขาดเพียงหลักฐาน lint)
  - AC-054 / BR-77 — ✅ Verified (รันแล้วตาม log ของผู้เรียก): `course-weight.test.ts:12-41` ครอบ trim, ขึ้นต้นด้วย "พื้นฐาน"/"เพิ่มเติม", "รายวิชาพื้นฐาน" → ไม่อยู่ในกลุ่ม, ""/null/{} → ไม่อยู่ในกลุ่ม, ไม่มีฟิลด์ + th → `sCourseGroupDesc`, ไม่มีฟิลด์ + en → ไม่อยู่ในกลุ่ม, มี `sCourseGroupDescTh` + en → อยู่ในกลุ่ม · ชุดของ FE-002 (`:46-133`: μ_P, `nCredit` = μ_P, `nCredit = 0`, หน่วยกิตเท่ากัน, `UNCLASSIFIED`) ผ่าน · ยังไม่มีเคสค่า "Core" และเคส "หมวดว่าง + `sCourseTypeDesc` พื้นฐาน" (ตัวตัดสินไม่อ่าน `sCourseTypeDesc` — ตรวจด้วย grep ใน R2)
  - FIND-P4-06 — ✅ Verified (คนตัดสิน: ไม่เปิด FE-002 ใหม่)
  - Required validation "typecheck/lint ผ่าน" — typecheck ✅ (log) · lint ไม่มีหลักฐาน → ยอมรับโดยคน
  - (R2, ยังจริง) FIND-P4-01 — ✅ Verified (อ่าน): เส้นทาง Generate `use-schedule-summary.ts:81-108` เก็บ `credits`/`sCourseGroupDescTh`/`sCourseGroupDesc` จาก `subjectList.objects` (use-select-curriculum.ts:157-161) แล้วแนบทั้งที่ course และ sub-course · restore `page.tsx:1052-1095` (จากวิชาที่วาง) และ `1189-1218` (catalog จาก `GetSubjectsByPlan` ผ่าน proxy ที่ไม่ตัดฟิลด์) ใช้ `toCourse` ตัวเดียวกัน · `course-weight.ts` อ่านได้ทั้งสองระดับ (`:82, 85, 96`) · ผู้เรียก `courseWeightByClass` ทั้ง 3 จุดส่งวัตถุเดิมต่อ (ไม่ map ทิ้งฟิลด์) → แผนที่มีหมวดพื้นฐาน/เพิ่มเติม + หน่วยกิตต่างกันได้ `OK` · type `Course` ยังไม่มีฟิลด์เหล่านี้ (ใช้ `as Course`) — runtime ใช้ได้ plan ไม่ได้บังคับ
  - DES-019 — ✅ Verified
- **FE-008** [sb-tech-upgrade-web-system] — ✅ Verified (ยอมรับโดยคน)
  - FIND-P4-07 — ✅ Verified (อ่าน test + log `tsc`/vitest)
  - FIND-P4-08 — ✅ Verified ส่วน `gridColumnMetas` (`page.tsx:1288-1299`) · ส่วน `locale` ยังไม่อยู่ใน dependency (`use-timetable-generation.ts:639, 904`, `page.tsx:1306`) — **คงเปิดเป็น Minor ไม่บล็อก ยอมรับโดยคน**; น่าจะไม่เปลี่ยนผลเพราะการเปลี่ยนภาษาผ่าน route `[locale]` จะ remount หน้า (อ่าน ไม่ได้รัน)
  - FIND-P4-02, FIND-P4-03, FIND-P4-04 — ✅ Verified (อ่านใน R2 · R3: test assert `sSuggestion: { key }`)
  - AC-055 (BR-81/81a) — ✅ Verified (ยอมรับโดยคน): รันแล้วแค่กริดเดียว (`intensity-summary.test.ts:134-195`: L0 → `[]`, L1 → 1 แถว `HeavyDayOverThreshold`, L2 → + `ConsecutiveHeavy`) · `heavyDayThreshold(0,5)` → `null` · **ยังไม่ได้รัน oracle BR-81b ตัวอย่าง 1–6** (ห้อง F/G/K, ตัวอย่าง 4, D = 0, ห้อง A/D แยกกัน) และตาราง ≥ 2 ห้อง × ทุกวัน
  - AC-055 (BR-81 Rev 16 `lstClassDays`) — ✅ Verified (ยอมรับโดยคน): อ่านแล้วตรง (R2) · ไม่มี test (F, ศ) = 0/0 และห้อง G ไม่มีแถว ส.
  - AC-054 (BR-78/BR-80) — ✅ Verified (ยอมรับโดยคน): RNG ฉีดได้ (อ่าน R2) · `isAttemptBetter` รันแล้ว (`solver-intensity.test.ts:292`) · ยังไม่มีการเทียบ L0/L1/L2 บน RNG ลำดับเดียวกัน (BR-80(4))
  - AC-017 — ✅ Verified (`isAttemptBetter`: shortfall มาก่อน — รันใน test)
  - DES-019 — ✅ Verified (สัญญา `lstRecommendations` ตรง + typecheck ผ่าน) · DES-020 — ✅ Verified
  - Required validation "typecheck/lint/build" — typecheck ✅ (log) · lint/build ของ frontend ไม่มีหลักฐาน → ยอมรับโดยคน
- **FE-009** [sb-tech-upgrade-web-system] — ✅ Verified (ยอมรับโดยคน)
  - AC-054 / BR-80 (FE-009) — ✅ Verified (ยอมรับโดยคน): ตรรกะ diff/ทริกเกอร์ตรง (อ่าน R2) · **ไม่มี test หรือสคริปต์ลำดับการแก้มือ** (วาง/`AddCourseModal`/สลับ/ย้าย/ลบ ที่ L0/L1/L2) ตามที่ Required validation กำหนด
  - FIND-P4-05 — ✅ Verified (อ่าน R2)
  - DES-019 — ✅ Verified (เรียกฟังก์ชันของ FE-008, typecheck ผ่าน)
  - Required validation "typecheck/lint" — typecheck ✅ (log) · lint ไม่มีหลักฐาน → ยอมรับโดยคน
- HUMAN-P4-R4 — ✅ Verified (บันทึกคำตัดสินของผู้ใช้ตามคำต่อคำใน Open Issues)

## Contract Checks

- `ItemPlanSubject.sCourseGroupDescTh` (design ~L2421) — ตรง (อ่าน)
- `lstRecommendations:[{nClassID, sClassName, sDay, nHeavy, nThreshold: number|null, sReason, sSuggestion}]` — ตรง · `sSuggestion` = key + พารามิเตอร์ ตาม Scope ของ FE-008
- Data Model: Phase 4 ไม่แตะสคีมา · schema-contract checker ไม่ได้รัน (สิทธิ์)

## Issues Found

R4: ไม่มี defect ใหม่ (ไม่มีโค้ดเปลี่ยน) · รายการข้างล่างคือหลักฐานที่ยังขาด **ยอมรับโดยคน ไม่บล็อก Phase 4** — เก็บไว้เป็นงานต่อ/ตรวจตอน deploy ไม่ส่งกลับ engineer ในรอบนี้

- → **frontend-engineer** (FE-007/FE-008/FE-009): แนบ log lint + build ของ frontend
- → **frontend-engineer** (FE-008): test oracle BR-81b ตัวอย่าง 1–6 + `lstClassDays` Rev 16 ((F, ศ) = 0/0; ห้อง G ไม่มีแถว ส.) + การเทียบ L0/L1/L2 บน RNG ที่ฉีดลำดับเดียวกัน
- → **frontend-engineer** (FE-009): test/สคริปต์ลำดับการแก้มือ L0/L1/L2 พร้อมตาราง "ลำดับการแก้ → คำเตือนที่คาด/ที่ได้"
- → **frontend-engineer** (Minor, FIND-P4-08 ส่วนที่เหลือ): เพิ่ม `locale` ใน dependency `use-timetable-generation.ts:639, 904` และ `page.tsx:1306`
- → **backend-engineer** (BE-005): response `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description`
- §21 (comment) ในไฟล์ที่แก้รอบนี้: `page.tsx:1285-1303` ไม่มี comment ใหม่ · `intensity-summary.test.ts:135` บอกที่มาของค่าที่คาด (เก็บได้) · `solver-intensity.test.ts:42-43, 50` (`// ceil(10 / 5) = 2` ฯลฯ) เป็น what-comment ที่ทวนสิ่งที่ assert อยู่แล้ว — Minor → **frontend-engineer** ลบ หรือเปลี่ยนเป็นที่มาของ oracle · ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมได้จากการอ่านเท่านั้น
- §22: ไม่มีไฟล์ใหม่ในรอบนี้ (ไฟล์ test 4 ไฟล์มีอยู่แล้ว)

## Review Outcome

**Status:** ✅ Verified (FULL)

- **ฐานของผล:** คำตัดสินของผู้ใช้ (HUMAN-P4-R4) ยอมรับ Phase 4 บนหลักฐาน `tsc` 0 error, vitest 29/29, `dotnet build` 0 error — ทางเลือก (1) ของ R3 · QA บันทึกตามคำตัดสิน ไม่ได้อ้างว่าข้อที่ขาดหลักฐานผ่านการ execute
- FIND-P4-01..07 → resolved · FIND-P4-08 ส่วน `gridColumnMetas` resolved, ส่วน `locale` **ยังเปิด เป็น Minor ไม่บล็อก**
- ช่องว่างหลักฐาน (lint/build frontend, oracle BR-81b 1–6 + เทียบ RNG, สคริปต์แก้มือ FE-009, response 2 ภาษา BE-005, deterministic sweep) อยู่ใน **Unverified Behaviour — ประตู deploy** · `devops` ต้องแสดงต่อผู้ใช้ก่อน deploy
- `plan.md`: BE-005, FE-007, FE-008, FE-009 → `verified`
- ไม่มี 🔒 Security gate ใหม่ใน Phase 4
- ไม่ต้องให้คนตัดสินเพิ่มสำหรับ Phase 4 · การตัดสินที่เหลืออยู่ตอน deploy (รายการ Unverified Behaviour + SA-Q18)

## Closed Open Issues — moved verbatim from `qa.md` 2026-10-04

| ID | Phase | Severity | Owner | Summary | State |
|---|---|---|---|---|---|
| FIND-P4-01 | 4 | Critical | frontend-engineer | `sCourseGroupDescTh`, `credits` และ `sCourseGroupDesc` ไม่ไปถึง `courses: Course[]` ที่ตัวจำแนก BR-77 อ่าน → ทุกแผนเป็น `UNCLASSIFIED` ในหน้าจริง | resolved R2 (อ่านโค้ด) · R3: ตัวตัดสินผ่าน `course-weight.test.ts` 10/10 (log ของผู้เรียก) |
| FIND-P4-02 | 4 | Important | frontend-engineer | solver ไม่รับ RNG ที่ฉีดได้ | resolved R2 (อ่านโค้ด) |
| FIND-P4-03 | 4 | Minor | frontend-engineer | `sSuggestion` เป็นประโยคอังกฤษ hard-code | resolved R2 (อ่านโค้ด) |
| FIND-P4-04 | 4 | Minor | frontend-engineer | `handleCpGenerate` ไม่ส่ง `gridColumnMetas`/`courseWeightMap` ให้สรุป | resolved R2 (อ่านโค้ด) |
| FIND-P4-05 | 4 | Minor | frontend-engineer | `pendingManualEditRef` ค้างหลังการแก้ที่ถูกปฏิเสธ / name-column modal | resolved R2 (อ่านโค้ด) |
| FIND-P4-06 | 4 | — (decision) | human | สถานะ `verified` ของ FE-002 (และ `lstHeavyCourseCodes` ของ FE-004) บนเส้นทางของหน้า — R2: หลัง FIND-P4-01 แก้ เส้นทางของหน้าได้ `credits`/หมวดแล้ว (อ่านโค้ด) → คนตัดสินว่าจะถือว่า FE-007 ครอบการแก้ของ FE-002 หรือเปิด FE-002 ใหม่ | resolved with user decision (R3, "ส่งต่อเลย"): FE-007 ครอบการแก้ของ FE-002 · FE-002 ไม่เปิดใหม่ คง `verified` |
| FIND-P4-07 | 4 | Important | frontend-engineer | FE-008 ลบ `computeDailyThreshold` ออกจาก `SolverIntensityConfig` แต่ `tests/app/timetable/solver-intensity.test.ts:36,42-44,50` ยังเรียก `cfgN.computeDailyThreshold(...)` → `tsc` ของโปรเจกต์ (tsconfig `include: **/*.ts` รวม `tests/`) error TS2339 และ test ล้มตอนรัน · `tests/app/timetable/intensity-summary.test.ts:134-145` ยัง assert ว่า**ไม่มี** `lstRecommendations` ซึ่ง FE-008 ตั้งใจเพิ่ม → test ล้ม · ขัดข้อ "typecheck/lint/build ผ่าน" ของ FE-008 (และทำให้ typecheck ทั้งโปรเจกต์ของ FE-007/FE-009 ไม่ผ่านด้วย) | resolved R3: อ่านแล้ว `solver-intensity.test.ts:10,42-50` ใช้ `heavyDayThreshold` (รวม `toBeNull()` เมื่อ H = 0) · `intensity-summary.test.ts:134-195` ทดสอบ `lstRecommendations` L0/L1/L2 · log ของผู้เรียก: `tsc --noEmit` 0 error, vitest 29/29 |
| HUMAN-P4-R4 | 4 | — (decision) | human | การยอมรับ Phase 4 ทั้งที่ยังขาดหลักฐานบางข้อตาม Required validation (lint/build frontend, oracle BR-81b 1–6, เทียบ RNG, สคริปต์แก้มือ FE-009, response 2 ภาษาของ BE-005) | resolved with user decision (R4): "ยอมรับผล Phase 4 ตามหลักฐานปัจจุบัน (tsc ผ่าน 0 error, vitest ผ่าน 29/29, dotnet build ผ่าน) และให้ QA บันทึก Verified (FULL) พร้อมรายการ Unverified Behaviour สำหรับตรวจสอบตอน Deploy" · ช่องว่างหลักฐานย้ายไป Unverified Behaviour ให้ `devops` แสดงก่อน deploy |

## Change Log entries — moved verbatim from `qa.md` 2026-10-04

- 2026-10-01 — สร้างไฟล์ · รอบ verify Phase 4 (BE-005, FE-007, FE-008, FE-009) — ❌ Failed (FULL) · อ่านโค้ดอย่างเดียว (gate/build ถูกปฏิเสธสิทธิ์) · FIND-P4-01..06 · วันที่จาก environment ของ session
- 2026-10-01 — R2 re-check หลัง frontend-engineer แก้ FIND-P4-01..05 — ❌ Failed (FULL) · FIND-P4-01..05 resolved (อ่านโค้ด) · เพิ่ม FIND-P4-07 (Important — test/typecheck ล้าสมัยหลัง FE-008) และ FIND-P4-08 (Minor) · gate/`tsc`/`dotnet build`/`generate-status.js` ถูกปฏิเสธสิทธิ์อีก · R1 ย้ายไป `qa/phase-4.md` · `plan.md` ไม่เปลี่ยน · วันที่จาก environment ของ session
- 2026-10-01 — R3 re-check ครั้งที่ 2 — ⚠️ Partial (FULL) · ผู้ใช้ตัดสิน FIND-P4-06 แล้ว · FIND-P4-07 resolved และ FIND-P4-08 ส่วน `gridColumnMetas` resolved (อ่าน + log typecheck/vitest/`dotnet build` ของผู้เรียก) · FIND-P4-08 ส่วน `locale` ยังเปิด · gate/vitest/`sta context`/`generate-status.js` ถูกปฏิเสธสิทธิ์ · ไม่ตั้ง Verified เพราะยังขาดหลักฐาน Required validation · `plan.md` BE-005 → `blocked` · escalate ถึงคน · R2 ย้ายไป `qa/phase-4.md` · วันที่จาก environment ของ session
- 2026-10-01 — R4 (Final) — ✅ Verified (FULL) ตามคำตัดสินของผู้ใช้ (HUMAN-P4-R4) ยอมรับบนหลักฐาน tsc/vitest 29/29/`dotnet build` · ช่องว่างหลักฐานคงอยู่ใน Unverified Behaviour เป็นประตู deploy · FIND-P4-08 ส่วน `locale` คงเปิด (Minor) · `plan.md` BE-005/FE-007/FE-008/FE-009 → `verified` · `sta context`/gate ถูกปฏิเสธสิทธิ์อีก · R3 ย้ายไป `qa/phase-4.md` · วันที่จาก environment ของ session
