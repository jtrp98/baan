# QA — timetableai — Phase 5 archive

## Round 1 — 2026-10-01 — ⚠️ Partial (FULL) — archived verbatim (superseded by round 2 in `qa.md`)

## Verification Summary

- **Phase / Round:** Phase 5 (Module G — DES-022 🔒 Security gate) · R1 · 2026-10-01 (วันที่ผู้เรียกระบุ) · Phase 4 R1–R4 อยู่ที่ [qa/phase-4.md](round-1.md)
- **Mode:** FULL · ทุก task ในเฟส (BE-006, BE-007, FE-017, FE-010) + ตรวจ AC-063 ของ FE-001 ซ้ำตาม Sequencing Notes · STA run `run-mupjoyd7-8ab34689` — ไม่มี evidence package / `deterministic_gate` → ถือเป็น interactive · ไม่รัน git
- **Deterministic sweep:** QA สั่ง `node .claude/scripts/static-analysis-gate.js` และ `sta context` — **ถูกปฏิเสธสิทธิ์ (ต้องขออนุมัติ)** · ผู้เรียกแจ้งว่า gate บน Knowledge repo PASS (caller-run, QA ไม่ได้รันซ้ำ) — gate นี้**ไม่ครอบ Target** จึงไม่นับเป็น sweep ของโค้ด Phase 5
- **หลักฐานการรัน (caller-run ใน session นี้ · QA ไม่ได้รันซ้ำ):** [sb-api-academic-timetable-ai] `dotnet test AITimeTableBackend.Tests` 42/42 (QA นับจากซอร์ส: ResolverTests 15 = 9 Fact + Theory 6, FilterTests 10, IntegrationTests 17 = 42 ✓) · [sb-tech-upgrade-web-system] vitest ทั้ง suite 272/272 · `tsc --noEmit` exit 0 · eslint ไฟล์ Phase 5 exit 0 · `npm run build` exit 0 · lint ทั้ง repo 444 error เดิมนอก Phase 5 · backend deps NU1903/NU1904 เดิม → ของ `security`
- **TP-D3:** resolved ด้วยการตัดสินของคน = (c) — มี `AITimeTableBackend.Tests` ใน `AITimeTableBackend.sln:8` (in-process host, test secret ผ่าน config override `IntegrationTests.cs:28-31`, ไม่ใช้ค่า `appsettings.json:13` ✓)
- **TP-D1 (ของ QA):** `AuthTests` **ไม่มีจริง** — grep `*.cs/*.csproj/*.sln` ทั้ง Target backend ไม่พบ · บันทึก "AuthTests 17/17" ใน `review.md` รอบ 2026-09-29 ไม่มีหลักฐานรองรับ · baseline `[manual-API]` ก่อน refactor ไม่ได้เก็บ และย้อนกลับไม่ได้โดยไม่มีการกระทำ git ของคน → AC-062 "เท่ากับก่อน refactor" พิสูจน์ไม่ได้
- **TP-D2 / SA-Q14:** ไม่มีบัญชี U0–U6 และไม่ได้ตรวจ `TMenu` จริง → S1 บน master DB จริงตรวจไม่ได้
- **Schema-contract checker:** ไม่ได้รัน (สิทธิ์) · Phase 5 ไม่เปลี่ยนสคีมาของโมดูล — entity master DB (`MasterDataContext.cs:28-37`) เป็นของระบบ SB อ่านอย่างเดียว
- **Security:** 🔒 Security gate ของ Phase 5 อยู่ที่หัวเฟสใน `plan.md` แล้ว — คงไว้ · ประตูมนุษย์ยังเปิด (รอบ `security` ของ DES-018 + ข้อยกเว้น BR-74 ของ BE-007 + SEC-01) · รอบนี้ไม่ใช่ security sign-off
- [sb-api-academic-timetable-ai] BE-006 ⚠️ · BE-007 ⚠️
- [sb-tech-upgrade-web-system] FE-017 ✅ · FE-010 ✅ · FE-001 (ตรวจ AC-063 ซ้ำ) ❌

## Verified File Manifest

(อ่านโดย QA รอบนี้ · ผลรันเป็น caller-run)

- sb-api-academic-timetable-ai:AITimeTableBackend/Security/TimetableMenuPermissionResolver.cs (1-140) · ITimetableMenuPermissionResolver.cs (1-48) · TimetableAuthorizationFilter.cs (1-215) · TimetableEndpointPolicy.cs (1-129) · TimetableMenuSettings.cs (1-18)
- sb-api-academic-timetable-ai:AITimeTableBackend/Startup.cs (1-149) · Controllers/WebAPIController.cs (25-59, 2837-2866) · appsettings.json (grep :16-21) · Helpers/MasterDataContext.cs (grep DbSet)
- sb-api-academic-timetable-ai:AITimeTableBackend.Tests/{ResolverTests,FilterTests,IntegrationTests,TestSupport}.cs (ทั้งไฟล์) · AITimeTableBackend.sln (grep)
- sb-tech-upgrade-web-system:src/lib/authHeaders.ts (1-54) · src/lib/backendProxy.ts (1-142)
- sb-tech-upgrade-web-system:src/hooks/useTimetableMenuPermissions.ts (1-261) · src/config/timetable-menu-permissions.ts (1-73) · src/app/api/menu-permissions/get/route.ts (1-5)
- sb-tech-upgrade-web-system:src/components/layout/Sidebar.tsx (88-109 + grep) · src/contexts/AuthContext.tsx (1-172)
- sb-tech-upgrade-web-system:tests/lib/authHeaders.test.ts · tests/integration/timetable-session-expired.test.tsx · tests/hooks/useTimetableMenuPermissions.test.tsx · tests/app/api/menu-permissions.test.ts · tests/config/timetable-menu-permissions.test.ts (ทั้งไฟล์)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/** — grep `timetableFetch(` (53 จุด/12 ไฟล์) และ `fetch(` ตรง (7 จุด) + อ่าน TeacherGroupsTab.tsx:55-89, manage-teaching-schedule/page.tsx:1120-1159, add-class-period-modal.tsx:170-204, create-class-period-form.tsx:245-294, 450-479

## Per-Task Results

- **BE-006** [sb-api-academic-timetable-ai] — ⚠️ Partial: query `TGroupPermissionUser`/`TGroupPermissionMenu` และกติกา admin อยู่จุดเดียว (`TimetableMenuPermissionResolver.cs:61-137`; grep ไม่พบ query อื่น) · filter เรียกเฉพาะ resolver (`TimetableAuthorizationFilter.cs:166`) · `AddScoped` (`Startup.cs:87`) = cache ต่อ request · ไม่มีแถว → `HasUserGroup=false` → 403 (`:180-184`); exception ไม่ถูกกลืนใน resolver → 403 (`:205-210`) — รันใน `FilterTests` (fake) + `ResolverTests.LookupFailure_Throws_NotReportedAsNoRow` (caller-run) · **ขาด:** baseline ก่อน refactor (TP-D1), resolver จริงผ่าน filter end-to-end (RV-4), บัญชี U0–U6 (TP-D2), เงื่อนไขที่เข้มกว่าสัญญา (RV-2)
  - AC-062 — ⚠️ Partial: เมทริกซ์ S1-A **หลัง** refactor ถูกต้องเมื่ออ่าน และครอบด้วย test ส่วนใหญ่ (ไม่มี token/ลายเซ็นผิด → 401; U0 → 403; อ่านได้เขียนไม่ได้; W เขียนได้เฉพาะเมนูเจ้าของ; admin ผ่าน/ไม่ผ่าน; lookup ล้ม → 403; นอกตาราง/controller อื่น → 403; `IsActive=false`/`IsDel`/โรงเรียนอื่น = ไม่มีแถว; `Type` ไม่รู้จัก/ตัวเล็ก → อ่านได้เขียนไม่ได้) · ส่วน "**เท่ากับก่อน refactor**" ไม่มีหลักฐาน (TP-D1)
- **BE-007** [sb-api-academic-timetable-ai] — ⚠️ Partial: endpoint (`WebAPIController.cs:2837-2866`) ไม่มีพารามิเตอร์, identity จาก claims, คืน 5 MenuID จาก `TimetableMenuSettings` เท่านั้น (`RawPermissions` ไม่ถูกคืน) · authenticated-only ใช้ที่ action เดียว (`TimetableEndpointPolicy.cs:122`; assert `IntegrationTests.cs:236-243`) · BR-72 (`Startup.cs:80-85`, `[Authorize]` `WebAPIController.cs:33`) และ BR-73 (`Filter.cs:41-132` ก่อน bypass `:157`) ยังบังคับ · admin ไม่ผ่าน BR-76 → 200 + false (`Resolver.cs:77-88`) · exception → 403 (`:2861-2865`) · **ขาด:** S1-B/S1-C บนบัญชีจริง (TP-D2), resolver จริงและเส้น admin ผ่าน BR-76 ที่ชั้น integration (RV-4), SA-Q14 (admin ได้ true ทั้ง 5 โดยไม่ตรวจ `TMenu` active)
  - AC-064 (ส่วน API) — ⚠️ Partial: รันแล้ว (caller-run, resolver ปลอม) — U0 → 200 + false ×5, อ่านบางเมนู, เขียนบางเมนู, admin ไม่ผ่าน → 200 + false, token ผิด/ไม่มี → 401, lookup ล้ม → 403, `?nSchoolID` อื่น → 403, ครบ 5 MenuID · "ตรงกับการตัดสินของ filter" อ่านแล้วตรง (ใช้ `MenuPermissions` ชุดเดียว `ITimetableMenuPermissionResolver.cs:24-40`) แต่ไม่ได้ execute ผ่าน resolver จริง (S1-C)
  - AC-062 (regression ของ BE-007) — ✅ Verified (caller-run): `OtherEndpoints_StillDenyNoRowUser_AC062` — U0 ยังได้ 403 ที่ endpoint อื่น
- **FE-017** [sb-tech-upgrade-web-system] — ✅ Verified: `TimetableFetchInit` + `suppressSessionExpired?` (`authHeaders.ts:27-29`) additive, signature 2 อาร์กิวเมนต์เดิม (รูปบน `init` แทนอาร์กิวเมนต์ที่ 3 — ผลเท่ากัน), ค่าเริ่มต้นยังเรียก `notifySessionExpired` (`:49-51`), ตัวเลือกถูกถอดก่อน `fetch` (`:43`), `notifySessionExpired` ไม่ถูกแก้ · grep: ผู้ใช้ opt-out มีเฉพาะ `useTimetableMenuPermissions.ts:107` · tsc/eslint/build exit 0 + vitest (caller-run)
  - AC-063 (regression จาก FE-017) — ✅ Verified (caller-run): ค่าเริ่มต้น 401 ลบ token + `sb_user_data` + event 1 ครั้ง; `false` ชัดเจน = ค่าเริ่มต้น; 200/403/404/500 ไม่แตะ session; ไม่มี token + 401 → ไม่มี header แต่ยัง SessionExpired; ผู้เรียกเดิม 7 routes ใน `AuthProvider` จริง → `SessionExpiredScreen` · **FE-017 ไม่ทำให้ AC-063 ถดถอย** — ช่องว่างที่พบเป็นของ FE-001
  - AC-064 (ฐานของ FE-010) — ✅ Verified (caller-run): opt-out 401 → ได้ 401, token/`sb_user_data` อยู่, ไม่มี event, ยังมี Bearer; opt-out 403/404/500 ส่งผ่าน; opt-out 401 แล้วค่าเริ่มต้น 401 → ไม่มีสถานะค้าง · signal ถึง `fetch` (hook Case 12)
- **FE-001** [sb-tech-upgrade-web-system] (ตรวจซ้ำตาม Sequencing Notes) — ❌ Failed: FIND-P5-01 — 7 call ตรงไม่ผ่าน wrapper ขัด AC "ไม่มีจุดใดแสดงสำเร็จหรือเงียบเมื่อได้ 401/403" · `plan.md` → `blocked`
  - AC-063 (ของ FE-001) — ❌ Failed: Bearer ครบ ✓ (53 จุดผ่าน wrapper + 7 จุดแนบ `user.token` เอง) · 401 → SessionExpired ✗ ที่ `create-class-period-form.tsx:254, 279, 461`, `add-class-period-modal.tsx:182`, `TeacherGroupsTab.tsx:69` · 403 เงียบ ✗ ที่ `TeacherGroupsTab.tsx:69`, `create-class-period-form.tsx:254, 279`, `manage-teaching-schedule/page.tsx:1135, 1139`
- **FE-010** [sb-tech-upgrade-web-system] — ✅ Verified: proxy ใช้ `proxyToBackend` เดิม (`route.ts:3-5`) — ส่ง `Authorization` (`backendProxy.ts:100, 107`) และคืน status ของ backend (`:72-76`) · hook เรียก `timetableFetch` + opt-out + `AbortController` 10 วินาทีค่าคงที่จุดเดียว (`timetable-menu-permissions.ts:41`; timer ล้างหลังอ่าน body `:144-146`) · `ready` เฉพาะ 2xx + `status === 1` + ชุด 5 MenuID ตรงตัวที่เป็น boolean (`:41-93, 112-137`) นอกนั้น `checkFailed` + `console.error` · cache ระดับ module ต่อ `(schoolId, empId)` + dedupe in-flight, `checkFailed` ถูก cache (ไม่ retry) · ไม่มี `localStorage.setItem` · map BR-86 จุดเดียว (`:14-28`) · ฟังก์ชันสถานะ fail-closed (`:50-73`) · `Sidebar.tsx` เพิ่มเฉพาะ type (`:98-99, 107`), ไม่มี JSX/hook ใหม่ (grep) · tsc/eslint/build exit 0 (caller-run)
  - AC-064 (ส่วนข้อมูล) — ✅ Verified (caller-run, mock): S2-A #1–#12 และ #13(a)(d)(e) · #13(b)(c) ไม่มี test ตรงตัว แต่โค้ดปฏิเสธความยาว ≠ 5 (อ่าน — FIND-P5-02) · S2-B: remount ไม่เรียกซ้ำ, identity ใหม่เรียกใหม่, `checkFailed` ไม่ retry, ไม่มีสิทธิ์ใน `localStorage` · เปลี่ยนภาษา — อ่านเท่านั้น (cache ระดับ module) · นับ network ในเบราว์เซอร์/proxy จริง → Unverified Behaviour
- **DES-022** — ⚠️ Partial: frontend (BR-86, BR-89, 47.2, 47.3) ตรงสัญญา · backend BR-88 ตรงเมื่ออ่าน + test ด้วย resolver ปลอม · ขาด S1-C/S2-C บนข้อมูลจริง (TP-D2) และ resolver จริงใน integration (RV-4)
- **DES-018** — ⚠️ Partial: ข้อยกเว้นเดียวของ BR-74 ถูกต้องและจำกัดที่ action เดียว · BR-72/BR-73/VR-20 คงบังคับ · ฝั่ง frontend §43.2 ("ตรวจครบทุก call รวม fire-and-forget") ไม่ครบ — FIND-P5-01 · RV-2 ค้างที่ SA
- **RV-1** — ⚠️ Partial (ยังเปิด, ไม่บล็อก) · **RV-2** — ⚠️ Partial (ยังเปิด → system-analyst) · **RV-3** — ✅ Verified (closed) · **RV-4** — ⚠️ Partial (ยังเปิด, ไม่บล็อก) — รายละเอียดใน Open Issues
- **FIND-P5-01** — ❌ Failed (open, Important) · **FIND-P5-02** — ⚠️ Partial (open, Minor) · **FIND-P5-03** — ⚠️ Partial (open, Minor, นอก Phase 5)
- **FIND-P4-08** (ส่วน `locale`) — นอกขอบเขตรอบนี้ ไม่ได้ตรวจซ้ำ คงเปิด

## Contract Checks

- `GET WebAPI/MenuPermissions/Get` → `{status:1, message:"", data:{lstMenus:[{nMenuID, isRead, isWrite}]}}` (design §47.2) — ตรง (`WebAPIController.cs:2844-2859`; ชื่อฟิลด์ camelCase ยืนยันโดย `IntegrationTests.GetMenus`, caller-run)
- 401/403 body `{status:-1, message}` (§43.3) — ตรง (`TimetableAuthorizationFilter.cs`, `WebAPIController.cs:2864`)
- hook result `{status, permissions}` + 4 สถานะรายรายการ (§47.2/§47.3) — ตรง
- MenuID ข้าม repo: `appsettings.json:17-21` = `TimetableMenuSettings.cs:5-9` = `timetable-menu-permissions.ts:5, 14-28` — ตรง
- Data Model: Phase 5 ไม่เปลี่ยนสคีมาของโมดูล · schema-contract checker ไม่ได้รัน (สิทธิ์)

## Unverified Behaviour — Phase 5 R1 (คงไว้ใน `qa.md` ด้วยจนกว่า Phase 5 deploy)

- Phase 5 — deterministic sweep ของ **Target** ไม่ได้รัน (gate ของ Knowledge repo ไม่ครอบ Target) · QA รัน gate/`sta context` ไม่ได้ (สิทธิ์) · schema-contract checker ไม่ได้รัน
- AC-062 "ผลเท่ากับก่อน refactor" ของ BE-006 (S1-A before/after) — ไม่มี baseline (TP-D1: `AuthTests` ไม่มีจริง) · เหลือเพียงอ่านโค้ด + test หลัง refactor
- Target sb-api-academic-timetable-ai — resolver จริงไม่เคยถูกเรียกผ่าน filter/endpoint ใน test (integration ใช้ fake — RV-4); เส้น admin ผ่าน BR-76 ที่ชั้น integration ไม่ได้ทดสอบ
- S1-A/S1-B/S1-C บน master DB จริงด้วยบัญชี U0–U6 (TP-D2) — ไม่ได้ทำ · รวม "ถอนสิทธิ์ระหว่างสอง request → request ที่สองเห็นทันที"
- SA-Q14 — MenuID 401/402/403/404/422 มีใน `TMenu` (active) หรือไม่ · admin ได้ true ทั้ง 5 ตัวโดยไม่ตรวจ `TMenu`
- timeout จริงของ `MasterDataContext` (Npgsql) → 403 — test จำลองด้วย exception ปลอมเท่านั้น
- S2-C — response จริงของ BE-007 ป้อน hook ผ่าน Next proxy จริง (Bearer + ส่งผ่าน 401/403/404/5xx) — `menu-permissions.test.ts` mock `proxyToBackend` ทั้งตัว
- timeout 10 วินาทีบน proxy/backend ที่ค้างจริงในเบราว์เซอร์ (vitest ใช้ fake timers; proxy ไม่มี timeout — D27)
- 1 request ต่อ full page load / เปลี่ยน route / เปลี่ยนภาษา นับใน DevTools — ไม่ได้ทำ
- S10-A `[manual-API]` ผ่าน proxy จริงด้วย token หมดอายุ — ไม่ได้ทำ · vitest ครอบผู้เรียกตัวแทน ไม่ใช่ทุก 53 call site
- FIND-P5-01 — พฤติกรรม 401/403 ของ 7 call ตรง ยืนยันจากการอ่าน ไม่ได้รัน

## Issues Found

- → **frontend-engineer** (FE-001, Important — FIND-P5-01): ย้าย 7 call ตรง (`TeacherGroupsTab.tsx:69`, `create-class-period-form.tsx:254, 279, 461`, `add-class-period-modal.tsx:182`, `manage-teaching-schedule/page.tsx:1135, 1139`) ไปใช้ `timetableFetch` ค่าเริ่มต้น และให้ 403 แสดงผ่านทางแสดงข้อผิดพลาดเดิมของหน้า (fire-and-forget ต้อง rollback/แจ้งเมื่อไม่สำเร็จ) · เพิ่มเคสใน `tests/integration/timetable-session-expired.test.tsx` ที่ 401 มาจาก call เหล่านี้เท่านั้น
- → **backend-engineer** (BE-006/BE-007 — RV-1, RV-4): ผูก cache กับอาร์กิวเมนต์ · เพิ่มกรณี in-process ที่ใช้ resolver จริงบน in-memory `MasterDataContext` + fake แบบ admin (`IsAdmin=true`)
- → **system-analyst** (RV-2): ยืนยันว่า BR-74/BR-76 รวม `admin.active`/`admin.del`/`TGroupPermissionUser.IsDel` หรือไม่ แล้ว amend ข้อความ (ไม่ตรง → กลับไป engineer)
- → **frontend-engineer** (FE-010, Minor — FIND-P5-02): แก้ Case 13b/13c ให้เป็น "ครบ 5 + 401 ซ้ำ" 6 แถว (ค่าเดียวกัน / ค่าขัดกัน)
- → **frontend-engineer** (Minor — FIND-P5-03): ป้องกัน `initAuth` เขียน token กลับหลัง `sb-session-expired` (ไม่ใช่งาน Phase 5)
- → **devops / เจ้าของระบบ SB** (TP-D2, SA-Q14): บัญชี U0–U6 + ตรวจ `TMenu` ก่อนรัน S1 จริง
- Phase 4 (คงจาก R4 — ยอมรับโดยคน ไม่บล็อก): lint/build frontend, oracle BR-81b 1–6 + RNG, สคริปต์แก้มือ FE-009, `locale` dependency FIND-P4-08, response 2 ภาษา BE-005 — รายละเอียดใน [qa/phase-4.md](round-1.md) R4
- §21 (comment) ในไฟล์ที่รอบนี้แก้ — Minor, ไม่บล็อก: what-comment ที่ทวนโค้ด → ลบหรือเปลี่ยนเป็นเหตุผล · **backend-engineer**: `TimetableAuthorizationFilter.cs:134` `// 4. Endpoint Policy Lookup`, `:163` `// 5 & 6. Permission Resolution via Shared Resolver` (เลขขั้นค้างจากโครงเดิม) · `ResolverTests.cs:59` `// unrelated menu` · **frontend-engineer**: `useTimetableMenuPermissions.ts:70` `// Duplicate MenuID found` · `tests/lib/authHeaders.test.ts:124, 127, 130` (`// Verify …`) · `tests/hooks/useTimetableMenuPermissions.test.tsx:349, 356, 506, 516, 519, 525, 603` · comment ที่บอกเหตุผล (เก็บได้): `useTimetableMenuPermissions.ts:22, 26, 111, 198-199, 211-213`, `ResolverTests.cs:157`, `IntegrationTests.cs:18-19, 222` · ไม่พบ workaround ที่ขาดเหตุผล · ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมจากการอ่านเท่านั้น
- §22 (ไฟล์ใหม่ตามแบบเพื่อนบ้าน): `Security/ITimetableMenuPermissionResolver.cs`, `Security/TimetableMenuPermissionResolver.cs` — ใช่ (แบบ `TimetableAuthorizationFilter.cs`) · `src/app/api/menu-permissions/get/route.ts` — ใช่ (แบบ `src/app/api/setting/get/route.ts`) · `src/hooks/useTimetableMenuPermissions.ts` — ใช่ (แบบ `useLocaleStorage.ts`) · `src/config/timetable-menu-permissions.ts` — ใช่ (typed const ตาม `src/config/README.md`) · test ใหม่ใต้ `tests/**` — ใช่ · `AITimeTableBackend.Tests/` — ไม่มีเพื่อนบ้าน (โปรเจกต์ test แรก)

## Review Outcome

**Status:** ⚠️ Partial (FULL)

- **FULL แต่ไม่ครบ:** ตรวจทุก task ในเฟส แต่ BE-006/BE-007 ขาดหลักฐานที่ plan บังคับ (TP-D1 baseline, TP-D2 บัญชีจริง) ซึ่งยังไม่มีใครผลิตได้ — QA ไม่ประทับ ✅ แทน
- FE-017 ✅ และ FE-010 ✅ (caller-run + อ่านโค้ด/test ครบ) · BE-006 ⚠️ · BE-007 ⚠️ · **FE-001 ❌ จากการตรวจ AC-063 ซ้ำ** (FIND-P5-01 — ไม่ใช่ regression ของ FE-017)
- RV-3 closed · RV-1, RV-2, RV-4 ยังเปิด (ไม่บล็อก)
- `plan.md`: FE-017 → `verified` · FE-010 → `verified` · BE-006 → `blocked` · BE-007 → `blocked` · **FE-001 `verified` → `blocked`**
- 🔒 Security gate ของ Phase 5 คงเปิด (ประตูมนุษย์: รอบ `security` ของ DES-018 + ข้อยกเว้น BR-74 + SEC-01 + NU1903/NU1904) — รอบนี้ไม่ใช่ security sign-off
- **ต้องให้คนตัดสิน (HUMAN-P5-R1, แยกทีละข้อได้):** (1) BE-006/BE-007 — **ยอมรับ** บนหลักฐานปัจจุบันโดยให้ TP-D1/TP-D2/RV-4 ติดไปเป็นประตู deploy · หรือ **ส่งกลับ** backend-engineer (RV-4 + RV-1) และรอ TP-D2 · หรือ **ปรับขอบเขต** validation ผ่าน `project-manager` (2) FIND-P5-01 — **ส่งกลับ** frontend-engineer แก้ FE-001 · หรือ **รับความเสี่ยง** · หรือให้ `project-manager` เปิด task ใหม่ (3) RV-2 → `system-analyst` · ไม่ไปต่อเองจนกว่าคนตัดสิน

## Round 2 — 2026-10-01 — ❌ Failed (TARGETED: FE-001) — archived verbatim (superseded by round 3 in qa.md)

## Verification Summary

- **Phase / Round:** Phase 5 · **R2** (ตรวจ FE-001 ซ้ำหลังแก้ FIND-P5-01 + RV-5/RV-6) · 2026-10-01 (วันที่ผู้เรียกระบุ) · R1 อยู่ที่ [qa/phase-5.md](round-2.md) · Phase 4 อยู่ที่ [qa/phase-4.md](round-1.md)
- **Mode:** **TARGETED**: FE-001 (AC-063, DES-018 §43.2) ใน Target sb-tech-upgrade-web-system เท่านั้น · BE-006/BE-007/FE-017/FE-010 ไม่ได้ตรวจซ้ำ ผลคงตาม R1 · STA run `run-mupmfag4-e95902df` ไม่มี evidence package / `deterministic_gate` จึงถือเป็น interactive · ไม่รัน git · ไม่มีสิทธิ์เขียน Target
- **Deterministic sweep:** QA สั่ง `sta context` แล้ว**ถูกปฏิเสธสิทธิ์** (shell ยอมแค่คำสั่งอ่านอย่างง่าย) · gate ไม่ได้รันซ้ำ · ผู้เรียกแจ้งว่า `static-analysis-gate.js` ผ่าน (PASS) บน Knowledge repo แต่ gate นี้**ไม่ครอบ Target** จึงไม่นับเป็น sweep ของโค้ด FE-001
- **หลักฐานการรันของรอบนี้ (ผู้เรียกรัน · QA ไม่ได้รันซ้ำ):** [sb-tech-upgrade-web-system] vitest ทั้ง suite 300/300 · `tsc --noEmit` exit 0 · `npm run build` exit 0 · eslint ไฟล์ที่แตะ 0 error / 9 warning (QA ไม่ได้ดู warning) · [sb-api-academic-timetable-ai] `dotnet test` 42/42 (backend ไม่ถูกแตะในรอบนี้)
- **การตรวจของ QA เอง (อ่าน + grep ทั้ง `src/`):** `fetch(` ตรงทั้ง `src/` → ไม่มี call ไป route ของ timetable-ai บนเส้นทางที่ render · ไม่มี axios/XHR บนเส้นทางนี้ (`lib/api/client.ts` ไม่มีผู้ import ใน `src/` นอกจาก README) · route ทั้ง 7 ไม่ import `@/services/*` · `suppressSessionExpired` มีที่เดียวคือ `useTimetableMenuPermissions.ts:107` (FE-010, BR-89) · Bearer ยังส่งครบ: ทุกจุดแนบ `user.token` เอง และ wrapper เติมให้เมื่อไม่มี (`authHeaders.ts:38-42`) · ผลการตัดสินข้อยกเว้นอยู่ใน Per-Task Results
- **Schema-contract checker:** ไม่ได้รัน · FE-001 ไม่แตะสคีมา
- **Security:** 🔒 Security gate ของ Phase 3 และ Phase 5 คงเปิด (ประตูมนุษย์) · รอบนี้ไม่ใช่ security sign-off
- [sb-tech-upgrade-web-system] FE-001 ❌ (FIND-P5-01 resolved · FIND-P5-04 ใหม่ บล็อก)
- [sb-api-academic-timetable-ai] BE-006 ⚠️ · BE-007 ⚠️ (คงตาม R1 ไม่ได้ตรวจซ้ำ) · [sb-tech-upgrade-web-system] FE-017 ✅ · FE-010 ✅ (คงตาม R1)

## Verified File Manifest

(R2 · QA อ่านเอง · ผลรันมาจากผู้เรียก · ไฟล์ของ R1 อยู่ที่ [qa/phase-5.md](round-2.md))

- sb-tech-upgrade-web-system:src/lib/authHeaders.ts (1-54) — ตรงกับ R1 ทุกบรรทัด
- sb-tech-upgrade-web-system:src/components/modals/home/create-teaching-schedule/LinkSubjectsModal.tsx (150-219)
- sb-tech-upgrade-web-system:src/components/layout/home/manage-teaching-schedule/TimetableGrid.tsx (445-484)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-timetable/[year]/TeacherGroupsTab.tsx (55-124, 140-269, 500-534, 745-784)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-timetable/[year]/MainTeachingGradeTab.tsx (355-454)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/page.tsx (108-139, 1120-1164)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/_components/timetable-year-list-page.tsx (55-72)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/create-class-period/[year]/_components/{create-class-period-form,add-class-period-modal}.tsx (grep `timetableFetch(`/`.ok`/`toast.error`)
- sb-tech-upgrade-web-system:src/app/api/timetable-pdf-import/route.ts (1-20)
- sb-tech-upgrade-web-system:src/** — grep `fetch(` ตรง (ทั้ง `src/`) · `timetableFetch(` (62 จุด/16 ไฟล์) · `suppressSessionExpired` · axios/XHR/SWR · `.catch(() => {}|null)` ใน 7 routes + `components/{layout,modals}/home` · ผู้ import ของ `ClassDropdown`/`CourseInformationTimetablePage`/`schedule-ocr-import-service` · `@/services` ใน routes timetable

## Per-Task Results

- **FE-001** [sb-tech-upgrade-web-system] — ❌ Failed (R2): ส่วนที่ส่งกลับใน R1 แก้ครบแล้ว แต่ AC-063 ยังไม่ผ่านเพราะ FIND-P5-04 (403 เงียบ / write แสดงสำเร็จเมื่อได้ 403 ใน call ที่ผ่าน wrapper อยู่แล้ว) · `plan.md` คง `blocked`
  - AC-063 — ❌ Failed: **Bearer ✓**: ทุก call ของ 7 routes แนบ `Authorization` จาก `user.token` และ `timetableFetch` เติมจาก `localStorage` เมื่อไม่มี (`authHeaders.ts:38-42`) · **ทุก call ผ่าน `timetableFetch` ค่าเริ่มต้น ✓**: grep `fetch(` ตรงทั้ง `src/` ไม่มี call ไป route ของ timetable-ai บนเส้นทางที่ render · **401 → SessionExpired ✓**: wrapper เรียก `notifySessionExpired` เมื่อ 401 ทุก call ยกเว้น opt-out ของ FE-010 (`useTimetableMenuPermissions.ts:107`, BR-89) · vitest `timetable-session-expired.test.tsx` 300/300 (ผู้เรียกรัน) · **403 มองเห็นได้ ✗**: เฉพาะจุดที่แก้ใน R1/R2 และ `[year]/page.tsx:96-97`, `create-class-period/[year]/page.tsx:37-40, 60-63` · ที่ยังเงียบอยู่ดู FIND-P5-04 · **ไม่มีจุดใดแสดงสำเร็จเมื่อได้ 403 ✗**: `TeacherGroupsTab.tsx:519-529` และ `:765-777`
  - การตัดสินข้อยกเว้น: `services/academic/schedule-ocr-import-service.ts:60` → `/api/timetable-pdf-import` → `TIMETABLE_OCR_BACKEND_URL` ซึ่งเป็น legacy `api-grade.schoolbright.co` (`route.ts:11-15`) ไม่ใช่ backend timetable-ai · ผู้ import มีที่เดียวคือ `app/[locale]/academic/schedule/schedule-import-modal.tsx:20` อยู่นอก 7 routes → **ยกเว้นถูกต้อง** · `components/ui/ClassDropdown.tsx:32` → `/api/school/{id}/level/{levelId}/level-classes` เป็น route ของ timetable-ai แต่ผู้ import มีที่เดียวคือ `CourseInformationTimetablePage.tsx:6` และ grep ทั้ง `src/` ไม่พบใคร import หน้านี้ → **ยกเว้นถูกต้องในวันนี้** (ถ้ามีคนนำหน้านี้มาใช้ข้อบกพร่องเดียวกับ RV-5 จะกลับมา ให้รวมไว้กับการล้างโค้ดตาย RV-9)
- **DES-018** — ⚠️ Partial: ฝั่ง frontend §43.2 ครบเรื่อง "ทุก call (รวม fire-and-forget) ผ่าน wrapper + Bearer + 401" แต่ยังไม่ครบเรื่อง "403 = ความล้มเหลวที่ผู้ใช้เห็น" (FIND-P5-04) · ฝั่ง backend คงตาม R1 · RV-2 ยังค้างที่ SA
- **FIND-P5-01** — ✅ Verified (resolved): 7 จุดเดิมอ่านแล้วถูกต้อง · ดู Open Issues
- **FIND-P5-04** — ❌ Failed (open, Important, ใหม่)
- **FIND-P5-02** — ⚠️ Partial (open, Minor, ไม่ได้ตรวจซ้ำ) · **FIND-P5-03** — ⚠️ Partial (open, Minor, นอก Phase 5, ไม่ได้ตรวจซ้ำ)
- **RV-5** — ✅ Verified (closed) · **RV-6** — ✅ Verified (closed) · **RV-7** — ⚠️ Partial (open) · **RV-8** — ❌ ยกระดับเป็น FIND-P5-04 · **RV-9** — ⚠️ Partial (open) · **RV-10** — ⚠️ Partial (open → SA) · **RV-11** — ⚠️ Partial (open → SA, คำถามพฤติกรรม) · **RV-1/RV-2/RV-4** — ⚠️ Partial (open, คงตาม R1)
- **รายการด้านล่างคงตาม R1 (ไม่ได้ตรวจซ้ำในรอบ TARGETED นี้):**
- **BE-006** [sb-api-academic-timetable-ai] — ⚠️ Partial: query `TGroupPermissionUser`/`TGroupPermissionMenu` และกติกา admin อยู่จุดเดียว (`TimetableMenuPermissionResolver.cs:61-137`; grep ไม่พบ query อื่น) · filter เรียกเฉพาะ resolver (`TimetableAuthorizationFilter.cs:166`) · `AddScoped` (`Startup.cs:87`) = cache ต่อ request · ไม่มีแถว → `HasUserGroup=false` → 403 (`:180-184`); exception ไม่ถูกกลืนใน resolver → 403 (`:205-210`) — รันใน `FilterTests` (fake) + `ResolverTests.LookupFailure_Throws_NotReportedAsNoRow` (caller-run) · **ขาด:** baseline ก่อน refactor (TP-D1), resolver จริงผ่าน filter end-to-end (RV-4), บัญชี U0–U6 (TP-D2), เงื่อนไขที่เข้มกว่าสัญญา (RV-2)
  - AC-062 — ⚠️ Partial: เมทริกซ์ S1-A **หลัง** refactor ถูกต้องเมื่ออ่าน และครอบด้วย test ส่วนใหญ่ (ไม่มี token/ลายเซ็นผิด → 401; U0 → 403; อ่านได้เขียนไม่ได้; W เขียนได้เฉพาะเมนูเจ้าของ; admin ผ่าน/ไม่ผ่าน; lookup ล้ม → 403; นอกตาราง/controller อื่น → 403; `IsActive=false`/`IsDel`/โรงเรียนอื่น = ไม่มีแถว; `Type` ไม่รู้จัก/ตัวเล็ก → อ่านได้เขียนไม่ได้) · ส่วน "**เท่ากับก่อน refactor**" ไม่มีหลักฐาน (TP-D1)
- **BE-007** [sb-api-academic-timetable-ai] — ⚠️ Partial: endpoint (`WebAPIController.cs:2837-2866`) ไม่มีพารามิเตอร์, identity จาก claims, คืน 5 MenuID จาก `TimetableMenuSettings` เท่านั้น (`RawPermissions` ไม่ถูกคืน) · authenticated-only ใช้ที่ action เดียว (`TimetableEndpointPolicy.cs:122`; assert `IntegrationTests.cs:236-243`) · BR-72 (`Startup.cs:80-85`, `[Authorize]` `WebAPIController.cs:33`) และ BR-73 (`Filter.cs:41-132` ก่อน bypass `:157`) ยังบังคับ · admin ไม่ผ่าน BR-76 → 200 + false (`Resolver.cs:77-88`) · exception → 403 (`:2861-2865`) · **ขาด:** S1-B/S1-C บนบัญชีจริง (TP-D2), resolver จริงและเส้น admin ผ่าน BR-76 ที่ชั้น integration (RV-4), SA-Q14 (admin ได้ true ทั้ง 5 โดยไม่ตรวจ `TMenu` active)
  - AC-064 (ส่วน API) — ⚠️ Partial: รันแล้ว (caller-run, resolver ปลอม) — U0 → 200 + false ×5, อ่านบางเมนู, เขียนบางเมนู, admin ไม่ผ่าน → 200 + false, token ผิด/ไม่มี → 401, lookup ล้ม → 403, `?nSchoolID` อื่น → 403, ครบ 5 MenuID · "ตรงกับการตัดสินของ filter" อ่านแล้วตรง (ใช้ `MenuPermissions` ชุดเดียว `ITimetableMenuPermissionResolver.cs:24-40`) แต่ไม่ได้ execute ผ่าน resolver จริง (S1-C)
  - AC-062 (regression ของ BE-007) — ✅ Verified (caller-run): `OtherEndpoints_StillDenyNoRowUser_AC062` — U0 ยังได้ 403 ที่ endpoint อื่น
- **FE-017** [sb-tech-upgrade-web-system] — ✅ Verified: `TimetableFetchInit` + `suppressSessionExpired?` (`authHeaders.ts:27-29`) additive, signature 2 อาร์กิวเมนต์เดิม (รูปบน `init` แทนอาร์กิวเมนต์ที่ 3 — ผลเท่ากัน), ค่าเริ่มต้นยังเรียก `notifySessionExpired` (`:49-51`), ตัวเลือกถูกถอดก่อน `fetch` (`:43`), `notifySessionExpired` ไม่ถูกแก้ · grep: ผู้ใช้ opt-out มีเฉพาะ `useTimetableMenuPermissions.ts:107` · tsc/eslint/build exit 0 + vitest (caller-run)
  - AC-063 (regression จาก FE-017) — ✅ Verified (caller-run): ค่าเริ่มต้น 401 ลบ token + `sb_user_data` + event 1 ครั้ง; `false` ชัดเจน = ค่าเริ่มต้น; 200/403/404/500 ไม่แตะ session; ไม่มี token + 401 → ไม่มี header แต่ยัง SessionExpired; ผู้เรียกเดิม 7 routes ใน `AuthProvider` จริง → `SessionExpiredScreen` · **FE-017 ไม่ทำให้ AC-063 ถดถอย** — ช่องว่างที่พบเป็นของ FE-001
  - AC-064 (ฐานของ FE-010) — ✅ Verified (caller-run): opt-out 401 → ได้ 401, token/`sb_user_data` อยู่, ไม่มี event, ยังมี Bearer; opt-out 403/404/500 ส่งผ่าน; opt-out 401 แล้วค่าเริ่มต้น 401 → ไม่มีสถานะค้าง · signal ถึง `fetch` (hook Case 12)
- **FE-010** [sb-tech-upgrade-web-system] — ✅ Verified: proxy ใช้ `proxyToBackend` เดิม (`route.ts:3-5`) — ส่ง `Authorization` (`backendProxy.ts:100, 107`) และคืน status ของ backend (`:72-76`) · hook เรียก `timetableFetch` + opt-out + `AbortController` 10 วินาทีค่าคงที่จุดเดียว (`timetable-menu-permissions.ts:41`; timer ล้างหลังอ่าน body `:144-146`) · `ready` เฉพาะ 2xx + `status === 1` + ชุด 5 MenuID ตรงตัวที่เป็น boolean (`:41-93, 112-137`) นอกนั้น `checkFailed` + `console.error` · cache ระดับ module ต่อ `(schoolId, empId)` + dedupe in-flight, `checkFailed` ถูก cache (ไม่ retry) · ไม่มี `localStorage.setItem` · map BR-86 จุดเดียว (`:14-28`) · ฟังก์ชันสถานะ fail-closed (`:50-73`) · `Sidebar.tsx` เพิ่มเฉพาะ type (`:98-99, 107`), ไม่มี JSX/hook ใหม่ (grep) · tsc/eslint/build exit 0 (caller-run)
  - AC-064 (ส่วนข้อมูล) — ✅ Verified (caller-run, mock): S2-A #1–#12 และ #13(a)(d)(e) · #13(b)(c) ไม่มี test ตรงตัว แต่โค้ดปฏิเสธความยาว ≠ 5 (อ่าน — FIND-P5-02) · S2-B: remount ไม่เรียกซ้ำ, identity ใหม่เรียกใหม่, `checkFailed` ไม่ retry, ไม่มีสิทธิ์ใน `localStorage` · เปลี่ยนภาษา — อ่านเท่านั้น (cache ระดับ module) · นับ network ในเบราว์เซอร์/proxy จริง → Unverified Behaviour
- **DES-022** — ⚠️ Partial: frontend (BR-86, BR-89, 47.2, 47.3) ตรงสัญญา · backend BR-88 ตรงเมื่ออ่าน + test ด้วย resolver ปลอม · ขาด S1-C/S2-C บนข้อมูลจริง (TP-D2) และ resolver จริงใน integration (RV-4)
- DES-018 ฝั่ง backend (R1): ข้อยกเว้นเดียวของ BR-74 ถูกต้องและจำกัดที่ action เดียว · BR-72/BR-73/VR-20 คงบังคับ
- **FIND-P4-08** (ส่วน `locale`) — นอกขอบเขตรอบนี้ ไม่ได้ตรวจซ้ำ คงเปิด

## Contract Checks

- `GET WebAPI/MenuPermissions/Get` → `{status:1, message:"", data:{lstMenus:[{nMenuID, isRead, isWrite}]}}` (design §47.2) — ตรง (`WebAPIController.cs:2844-2859`; ชื่อฟิลด์ camelCase ยืนยันโดย `IntegrationTests.GetMenus`, caller-run)
- 401/403 body `{status:-1, message}` (§43.3) — ตรง (`TimetableAuthorizationFilter.cs`, `WebAPIController.cs:2864`)
- hook result `{status, permissions}` + 4 สถานะรายรายการ (§47.2/§47.3) — ตรง
- MenuID ข้าม repo: `appsettings.json:17-21` = `TimetableMenuSettings.cs:5-9` = `timetable-menu-permissions.ts:5, 14-28` — ตรง
- Data Model: Phase 5 ไม่เปลี่ยนสคีมาของโมดูล · schema-contract checker ไม่ได้รัน (สิทธิ์)

## Unverified Behaviour — undeployed phases

**ประตู deploy ของ Phase 4** — คนยอมรับ Phase 4 (HUMAN-P4-R4) โดยให้รายการนี้ติดไปถึง deploy · `devops` ต้องแสดงรายการนี้ต่อผู้ใช้ก่อน deploy · vitest 29/29 และ typecheck ผ่านตาม log ของผู้เรียก — กติกาต่อไปนี้ยัง**อ่านอย่างเดียว ไม่ได้ execute**:

- Phase 4 — deterministic sweep (`static-analysis-gate.js`) ไม่ได้รัน (R4 ถูกปฏิเสธสิทธิ์อีก) · typecheck/vitest/`dotnet build` เป็น log ของผู้เรียก QA ไม่ได้รันซ้ำ · schema-contract checker ไม่ได้รัน
- Target sb-tech-upgrade-web-system — ไม่มีหลักฐาน lint และ build
- Target sb-api-academic-timetable-ai — ไม่มีการเรียก `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description`
- BR-81b ตัวอย่าง 1–6 (oracle ของ FE-008) — อ่าน/ไล่มือใน R1 เท่านั้น
- BR-81 Rev 16 ชุดวันของ `lstClassDays` (วันว่าง = 0/0, วัน club-only ไม่แสดง) — อ่านเท่านั้น
- BR-80(4) การเทียบ L0/L1/L2 บน RNG ลำดับเดียวกัน — ไม่ได้ทำ
- BR-80 คำเตือนการแก้มือของ FE-009 (คู่ใหม่เท่านั้น, T_c ลดจนวันอื่นเกิน, `AddCourseModal`, การแก้ที่ถูกปฏิเสธ, L0 ไม่มีคำเตือน) — อ่านเท่านั้น
- BR-77 trim/startsWith กับค่าจริงของ `TCourseGroup.Description` (SA-Q18 ยังเปิด)
- BR-77 บนเส้นทาง restore เมื่อ catalog fetch ล้ม: `SubjectSlot` ของ `Timetable/Get` อาจไม่มี `nCredit`/`sCourseGroupDesc*` (โค้ดอ่านผ่าน `as unknown as`) → แผนนั้นอาจได้ `UNCLASSIFIED` — ไม่ได้ยืนยันรูป response
- BR-79 "บล็อกต่อเนื่องนับตามจำนวนคาบ" — ตัวประเมินนับต่อ cell; ไม่ได้ยืนยันว่า cell หนึ่งช่องอาจแทนหลายคาบหรือไม่
- BR-81b (ค2) โควตา H "รวมคาบ seed จากล็อก/link ไม่รวมวิชาที่ถูกตัด" — ไม่ได้ไล่ข้อมูลจริง
- ลำดับ React ของ `TimetableGrid` (updater ถูกเรียกตอน render/StrictMode เรียกซ้ำ, snapshot ก่อน/หลังผ่าน `useEffect`) — ไม่ได้รันในเบราว์เซอร์
- FIND-P4-08 ส่วน `locale` dependency (Minor, ยังเปิด) — ไม่ได้ทดสอบการสลับภาษาโดยไม่ remount

**Phase 5 (R1)** — ผลรันทั้งหมดเป็น caller-run (QA ไม่ได้รันซ้ำ) · รายการต่อไปนี้**ไม่มีการ execute ที่พิสูจน์ได้**:

- Phase 5 — deterministic sweep ของ **Target** ไม่ได้รัน (gate ของ Knowledge repo ไม่ครอบ Target) · QA รัน gate/`sta context` ไม่ได้ (สิทธิ์) · schema-contract checker ไม่ได้รัน
- AC-062 "ผลเท่ากับก่อน refactor" ของ BE-006 (S1-A before/after) — ไม่มี baseline (TP-D1: `AuthTests` ไม่มีจริง) · เหลือเพียงอ่านโค้ด + test หลัง refactor
- Target sb-api-academic-timetable-ai — resolver จริงไม่เคยถูกเรียกผ่าน filter/endpoint ใน test (integration ใช้ fake — RV-4); เส้น admin ผ่าน BR-76 ที่ชั้น integration ไม่ได้ทดสอบ
- S1-A/S1-B/S1-C บน master DB จริงด้วยบัญชี U0–U6 (TP-D2) — ไม่ได้ทำ · รวม "ถอนสิทธิ์ระหว่างสอง request → request ที่สองเห็นทันที"
- SA-Q14 — MenuID 401/402/403/404/422 มีใน `TMenu` (active) หรือไม่ · admin ได้ true ทั้ง 5 ตัวโดยไม่ตรวจ `TMenu`
- timeout จริงของ `MasterDataContext` (Npgsql) → 403 — test จำลองด้วย exception ปลอมเท่านั้น
- S2-C — response จริงของ BE-007 ป้อน hook ผ่าน Next proxy จริง (Bearer + ส่งผ่าน 401/403/404/5xx) — `menu-permissions.test.ts` mock `proxyToBackend` ทั้งตัว
- timeout 10 วินาทีบน proxy/backend ที่ค้างจริงในเบราว์เซอร์ (vitest ใช้ fake timers; proxy ไม่มี timeout — D27)
- 1 request ต่อ full page load / เปลี่ยน route / เปลี่ยนภาษา นับใน DevTools — ไม่ได้ทำ
- S10-A `[manual-API]` ผ่าน proxy จริงด้วย token หมดอายุ — ไม่ได้ทำ · vitest ครอบผู้เรียกตัวแทน ไม่ใช่ทุก 53 call site
- FIND-P5-01 — พฤติกรรม 401/403 ของ 7 call ตรง ยืนยันจากการอ่าน ไม่ได้รัน · R2: ตอนนี้ผ่าน wrapper แล้ว และ vitest ครอบ (ผู้เรียกรัน) แต่ยังไม่ได้รันในเบราว์เซอร์จริง

**Phase 5 (R2: FE-001)** — ผลรันทั้งหมดผู้เรียกเป็นคนรัน (QA ไม่ได้รันซ้ำ) · รายการต่อไปนี้**ไม่ได้ execute**:

- **S10-A `[manual-API]` กับเบราว์เซอร์จริง + Next proxy จริง + backend ที่เปิด auth ด้วย token หมดอายุ** ไม่ได้ทำ · การที่ 401 นำไป SessionExpired ยืนยันได้จาก vitest (stub `fetch` ระดับ global, `AuthProvider` จริง) และจากการอ่านโค้ดเท่านั้น
- "ใช้ flow หลักทุกหน้ากับ backend ที่เปิด auth โดยไม่มี 401" และ "ผู้ใช้ไม่มีสิทธิ์เมนู → ทุก call ที่ได้ 403 แสดงความล้มเหลว" (Required validation ของ FE-001) ไม่ได้ทำ เพราะไม่มีบัญชี U0–U6 (TP-D2)
- รายการ call ครบทุกตัวในรูป "ไฟล์:บรรทัด → endpoint → Bearer? → 401/403?" ตามที่ FE-001 กำหนดเป็นหลักฐาน ยังไม่มีเป็นเอกสาร · QA ใช้ grep แทน (62 จุด `timetableFetch(` ใน 16 ไฟล์)
- eslint 9 warning ในไฟล์ที่แตะ QA ไม่ได้ดู · lint ทั้ง repo ไม่ได้รันในรอบนี้
- deterministic sweep ของ Target ไม่ได้รัน

## Issues Found

- → **frontend-engineer** (FE-001, Important, **FIND-P5-04**, บล็อก): ทำให้ทุก call ของ 7 routes ที่ยังไม่ตรวจ `res.ok` แสดง 403/อื่นผ่านทางแสดงข้อผิดพลาดเดิมของหน้า (toast `Request failed: <status>` ใช้ id ร่วม แบบเดียวกับ R2 · ไม่ toast เมื่อ 401 · ไม่เพิ่ม copy ใหม่เพราะเป็นงานของ FE-016) · **เร่งด่วน:** `TeacherGroupsTab.tsx:519-529` และ `:765-777` (write `set-times` ที่ตอนนี้แสดงสำเร็จเมื่อได้ 403 ต้อง rollback หรือแจ้ง และต้องไม่เปิด modal สำเร็จ) · `manage-teaching-schedule/page.tsx:117-139` (403 ของ settings ต้องไม่ปล่อย `settingsLoaded` ไปเป็นค่าเริ่มต้นแบบเงียบ) · loader ที่เหลือตามรายการใน Open Issues · เพิ่มเคส 403 ใน `tests/integration/timetable-session-expired.test.tsx` ทุกจุดที่แก้ · ทางเลือกของคน: ให้ `project-manager` ย้าย 403 ของ loader (ไม่ใช่ write) ไปรวมกับ FE-016
- → **system-analyst** (RV-11, คำถามพฤติกรรม): เมื่อ period load ของ `TimetableGrid` ล้ม (403/network) Generate ที่รออยู่ควรถูกยกเลิกหรือระงับหรือไม่ (ตอนนี้รันบนแถว placeholder) · (RV-10) 401 ควรแสดง toast ของหน้าด้วยหรือไม่ · ตัดสินแล้ว engineer จึงปรับตาม
- → **frontend-engineer** (RV-7, non-blocking): rollback ของ `persistGroupTeachers` และ side effect ใน updater · (RV-9) → `project-manager`: `CreateClassPeriodForm`/`CourseInformationTimetablePage`/`ClassDropdown` ไม่มีผู้ import ควรลบหรือนำมาใช้
- (R1, resolved R2) FIND-P5-01: 7 call ตรงย้ายไป `timetableFetch` เรียบร้อย
- → **backend-engineer** (BE-006/BE-007 — RV-1, RV-4): ผูก cache กับอาร์กิวเมนต์ · เพิ่มกรณี in-process ที่ใช้ resolver จริงบน in-memory `MasterDataContext` + fake แบบ admin (`IsAdmin=true`)
- → **system-analyst** (RV-2): ยืนยันว่า BR-74/BR-76 รวม `admin.active`/`admin.del`/`TGroupPermissionUser.IsDel` หรือไม่ แล้ว amend ข้อความ (ไม่ตรง → กลับไป engineer)
- → **frontend-engineer** (FE-010, Minor — FIND-P5-02): แก้ Case 13b/13c ให้เป็น "ครบ 5 + 401 ซ้ำ" 6 แถว (ค่าเดียวกัน / ค่าขัดกัน)
- → **frontend-engineer** (Minor — FIND-P5-03): ป้องกัน `initAuth` เขียน token กลับหลัง `sb-session-expired` (ไม่ใช่งาน Phase 5)
- → **devops / เจ้าของระบบ SB** (TP-D2, SA-Q14): บัญชี U0–U6 + ตรวจ `TMenu` ก่อนรัน S1 จริง
- Phase 4 (คงจาก R4 — ยอมรับโดยคน ไม่บล็อก): lint/build frontend, oracle BR-81b 1–6 + RNG, สคริปต์แก้มือ FE-009, `locale` dependency FIND-P4-08, response 2 ภาษา BE-005 — รายละเอียดใน [qa/phase-4.md](round-1.md) R4
- §21 (comment) ในไฟล์ที่รอบนี้แก้ — Minor, ไม่บล็อก: what-comment ที่ทวนโค้ด → ลบหรือเปลี่ยนเป็นเหตุผล · **backend-engineer**: `TimetableAuthorizationFilter.cs:134` `// 4. Endpoint Policy Lookup`, `:163` `// 5 & 6. Permission Resolution via Shared Resolver` (เลขขั้นค้างจากโครงเดิม) · `ResolverTests.cs:59` `// unrelated menu` · **frontend-engineer**: `useTimetableMenuPermissions.ts:70` `// Duplicate MenuID found` · `tests/lib/authHeaders.test.ts:124, 127, 130` (`// Verify …`) · `tests/hooks/useTimetableMenuPermissions.test.tsx:349, 356, 506, 516, 519, 525, 603` · comment ที่บอกเหตุผล (เก็บได้): `useTimetableMenuPermissions.ts:22, 26, 111, 198-199, 211-213`, `ResolverTests.cs:157`, `IntegrationTests.cs:18-19, 222` · ไม่พบ workaround ที่ขาดเหตุผล · ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมจากการอ่านเท่านั้น
- §21 (comment) ในไฟล์ที่ R2 แก้ (`LinkSubjectsModal.tsx:169-171`, `TimetableGrid.tsx:459-461`, `TeacherGroupsTab.tsx:68-69`, `manage-teaching-schedule/page.tsx:1131-1133`): ทุกจุดอธิบาย**เหตุผล** (401 ไม่ toast เพราะหน้า SessionExpired มาแทน, id ร่วมเพื่อไม่ให้ toast ซ้อนกัน, ทำไมยังเรียก `onReady`) ไม่ใช่ what-comment · ไม่พบ workaround ที่ขาดเหตุผล · ไม่มีปัญหา · §22: R2 ไม่ได้เพิ่มไฟล์ใหม่ใต้ `src/` (เป็นการแก้ไฟล์เดิม) · test ที่เพิ่มอยู่ในไฟล์เดิม `tests/integration/timetable-session-expired.test.tsx`
- (R1) §22 (ไฟล์ใหม่ตามแบบเพื่อนบ้าน): `Security/ITimetableMenuPermissionResolver.cs`, `Security/TimetableMenuPermissionResolver.cs` — ใช่ (แบบ `TimetableAuthorizationFilter.cs`) · `src/app/api/menu-permissions/get/route.ts` — ใช่ (แบบ `src/app/api/setting/get/route.ts`) · `src/hooks/useTimetableMenuPermissions.ts` — ใช่ (แบบ `useLocaleStorage.ts`) · `src/config/timetable-menu-permissions.ts` — ใช่ (typed const ตาม `src/config/README.md`) · test ใหม่ใต้ `tests/**` — ใช่ · `AITimeTableBackend.Tests/` — ไม่มีเพื่อนบ้าน (โปรเจกต์ test แรก)

## Review Outcome

**Status:** ❌ Failed (TARGETED)

- **FE-001 ❌ (R2):** สิ่งที่ส่งกลับใน R1 ถูกแก้ครบ คือ FIND-P5-01 และ RV-5/RV-6 ✅ · ทุก call ของ 7 routes ผ่าน `timetableFetch` ค่าเริ่มต้น · Bearer ยังส่ง · 401 นำไป SessionExpired · ข้อยกเว้น 2 จุด (`schedule-ocr-import-service.ts:60`, `ClassDropdown.tsx:32`) ถูกต้อง · แต่ AC-063 ข้อ "403 มองเห็นได้ ไม่มีจุดใดแสดงสำเร็จหรือเงียบ" **ยังไม่ผ่าน** เพราะ FIND-P5-04 (write `set-times` 2 จุดแสดงสำเร็จเมื่อได้ 403, loader ≥ 14 จุดเงียบ) · **QA R1 พลาดชุดนี้** ไม่ใช่ regression ของการแก้รอบนี้
- **`plan.md`:** FE-001 **คง `blocked`** (ไม่เปลี่ยน cell) · BE-006/BE-007 คง `blocked` ตาม HUMAN-P5-R1 · FE-017/FE-010 คง `verified`
- **ยังไม่ได้ execute:** S10-A `[manual-API]` ด้วย token หมดอายุในเบราว์เซอร์จริงกับ backend จริง, flow ของผู้ใช้ไม่มีสิทธิ์ (TP-D2) · หลักฐาน 401 มาจาก vitest ที่ผู้เรียกรันและการอ่านโค้ด
- **การนับรอบ:** นี่เป็นรอบตรวจซ้ำครั้งแรกของ FE-001 ที่ไม่ผ่าน (R1 คือรอบตรวจ) · ถ้ารอบถัดไปไม่ผ่านอีก QA จะส่งเรื่องให้คนตัดสิน ไม่ส่งกลับ engineer อีก
- 🔒 Security gate ของ Phase 3 และ Phase 5 คงเปิด (ประตูมนุษย์คือรอบ `security` ของ DES-018 + ข้อยกเว้น BR-74 + SEC-01 + NU1903/NU1904) · รอบนี้ไม่ใช่ security sign-off
- **ต้องให้คนตัดสิน:** (1) FIND-P5-04: **ส่งกลับ** frontend-engineer (QA แนะนำ อย่างน้อยต้องแก้ 2 write `set-times` และ settings loader) · หรือ**รับความเสี่ยง** · หรือให้ `project-manager` **ปรับขอบเขต** ย้าย 403 ของ loader ไปรวมกับ FE-016 แล้วให้ FE-001 รับผิดชอบเฉพาะ write (2) HUMAN-P5-R1 ส่วน BE-006/BE-007 ยังเปิด (3) RV-11/RV-10/RV-2 → `system-analyst` · QA ไม่ไปต่อเองจนกว่าคนตัดสิน

## Round 3 — 2026-10-01 — ✅ Verified (TARGETED: FE-001) — archived verbatim 2026-10-02 (superseded by Phase 7 R1 in `qa.md`; Open Issues and Unverified Behaviour stay live in `qa.md`)

## Verification Summary

- **Phase / Round:** Phase 5 · **R3** (ตรวจ FE-001 ซ้ำหลังแก้ FIND-P5-04 · reviewer Round 4 ✅ Approved) · 2026-10-01 (วันที่ผู้เรียกระบุ) · R1 และ R2 อยู่ที่ [qa/phase-5.md](round-2.md) · Phase 4 อยู่ที่ [qa/phase-4.md](round-1.md)
- **Mode:** **TARGETED**: FE-001 (AC-063, DES-018 §43.2) ใน Target sb-tech-upgrade-web-system + อ่าน backend sb-api-academic-timetable-ai เฉพาะ `Setting/Get` (อ่านอย่างเดียว เพื่อตัดสินว่ามี regression ที่โรงเรียนใหม่หรือไม่) · BE-006/BE-007/FE-017/FE-010 ไม่ได้ตรวจซ้ำ ผลคงตาม R1 · STA run `run-mupoc22l-9230c9ea` ไม่มี evidence package / `deterministic_gate` จึงถือเป็น interactive · ไม่รัน git · ไม่มีสิทธิ์เขียน Target
- **Deterministic sweep:** `sta context` และ `$STA_CONTEXT_CMD` **ถูกปฏิเสธสิทธิ์** (ต้องขออนุมัติ) · `static-analysis-gate.js` และ `generate-status.js` QA ไม่ได้รัน · ผู้เรียกแจ้งว่า gate ผ่าน (PASS) บน Knowledge repo แต่ gate นี้**ไม่ครอบ Target** จึงไม่นับเป็น sweep ของโค้ด FE-001
- **หลักฐานการรันของรอบนี้ (ผู้เรียกรัน · QA ไม่ได้รันซ้ำ):** [sb-tech-upgrade-web-system] vitest ทั้ง suite **313/313** · `tsc --noEmit` exit 0 · `npm run build` exit 0 · eslint ของ `src/lib/timetableRequestFailure.ts` + `tests/integration` ไม่มี error (lint ทั้ง repo มี error เดิมนอก Phase 5) · [sb-api-academic-timetable-ai] `dotnet test` 42/42 (backend ไม่ถูกแตะในการแก้นี้)
- **การตรวจของ QA เอง (อ่าน + grep):** grep `timetableFetch\(` ทั้ง `src/` → 62 hit = นิยาม (`authHeaders.ts:37`) + **61 call site** ตรงกับ engineer และ reviewer · อ่านการจัดการ non-OK ของทุก call site ใน 7 routes + `TimetableGrid`/`LinkSubjectsModal` · grep `.catch(() => {}|null|undefined|[])` และ `catch {}` ทั้ง `src/` → ที่เหลือในเส้นทาง timetable มีเพียง `page.tsx:1258` (ครอบการประมวลผลหลัง `Promise.all` ที่ทุกตัว `.catch(notifyFailed)` แล้ว) และ `TimetableGrid.tsx:1127, 1134, 1204` (parse JSON ของ drag-and-drop ไม่ใช่ fetch) · grep `.then(r => r.json())` → ที่เหลือมีแค่ `ClassDropdown.tsx:35` (ข้อยกเว้นโค้ดตายจาก R2) และ `services/portfolio-service.ts` (นอก timetable) · `authHeaders.ts` 1-54 อ่านแล้วเหมือน R1/R2
- **Backend (อ่านอย่างเดียว):** `WebAPIController.cs:1810-1876` `Setting/Get` — ไม่มีแถว `Tbl_Setting` → `Ok(new { status = 1, message = "", data = <ค่าเริ่มต้น> })` (:1846-1870) · exception → `Ok(new { status = -1 … })` (:1872-1875) · ไม่มีเส้นทางคืน non-200 จาก action นี้ · non-200 มาจากชั้น auth เท่านั้น (`TimetableEndpointPolicy.cs:80` `GetSetting` = `ForRead(m403, m401)`)
- **Schema-contract checker:** ไม่ได้รัน · FE-001 ไม่แตะสคีมา
- **Security:** 🔒 Security gate ของ Phase 3 และ Phase 5 คงเปิด (ประตูมนุษย์) · รอบนี้ไม่ใช่ security sign-off
- [sb-tech-upgrade-web-system] FE-001 ✅ (FIND-P5-04 resolved · ไม่มี regression ที่โรงเรียนใหม่)
- [sb-api-academic-timetable-ai] BE-006 ⚠️ · BE-007 ⚠️ (คงตาม R1 ไม่ได้ตรวจซ้ำ · รอ HUMAN-P5-R1) · [sb-tech-upgrade-web-system] FE-017 ✅ · FE-010 ✅ (คงตาม R1)

## Verified File Manifest

(R3 · QA อ่านเอง · ผลรันมาจากผู้เรียก · ไฟล์ของ R1/R2 อยู่ที่ [qa/phase-5.md](round-2.md))

- sb-tech-upgrade-web-system:src/lib/timetableRequestFailure.ts (1-35) — ไฟล์ใหม่
- sb-tech-upgrade-web-system:src/lib/authHeaders.ts (1-54) — ตรงกับ R1/R2 ทุกบรรทัด
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/page.tsx (100-164, 280-344, 586-742, 870-1019, 1150-1369, 1405-1444)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-timetable/[year]/TeacherGroupsTab.tsx (60-279, 485-566, 740-849, 985-1029)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-timetable/[year]/MainTeachingGradeTab.tsx (48-217, 368-587)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/[year]/page.tsx (86-190)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/subject-settings/[year]/page.tsx (178-474)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/settings/[year]/page.tsx (160-296)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/create-class-period/[year]/page.tsx (30-157)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/_components/timetable-year-list-page.tsx (50-74)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts (45-124)
- sb-tech-upgrade-web-system:src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts (84-154)
- sb-tech-upgrade-web-system:src/components/layout/home/manage-teaching-schedule/TimetableGrid.tsx (455-484)
- sb-tech-upgrade-web-system:src/app/api/setting/get/route.ts (1-7)
- sb-tech-upgrade-web-system:tests/integration/timetable-403-visible.test.tsx (1-353) — ไฟล์ใหม่
- sb-tech-upgrade-web-system:src/** — grep `timetableFetch\(` (62 hit / 61 call site) · `.catch(() => {}|null|undefined|[])` / `catch {}` · `.then(r => r.json())` · `.catch(` ใน `src/app/[locale]/timetable` · `readJsonOrNotify|.ok` (68 จุด/12 ไฟล์) · `isScheduleDataReady|settingsLoaded` ใน `page.tsx`
- sb-api-academic-timetable-ai:AITimeTableBackend/Controllers/WebAPIController.cs (780-819, 1805-1879) — อ่านอย่างเดียว · grep `Setting/Get|GetSetting` (`TimetableEndpointPolicy.cs:80`)

## Per-Task Results

- **FE-001** [sb-tech-upgrade-web-system] — ✅ Verified (R3): FIND-P5-04 แก้ครบ · ทุก call site 61 จุดผ่าน `timetableFetch` พร้อม Bearer · 401 → SessionExpired · 403/อื่น → toast/Alert/rollback ที่ผู้ใช้เห็น · ไม่มีจุดใดแสดงสำเร็จหรือเงียบเมื่อได้ 401/403 · ไม่มี regression ที่โรงเรียนใหม่ · `plan.md` `blocked` → `verified` · ส่วนที่ต้องลองด้วยมือ (S10-A ผ่าน proxy/backend จริง, flow ผู้ใช้ไม่มีสิทธิ์ TP-D2) **ไม่ได้ execute** → Unverified Behaviour (ประตู deploy)
  - AC-063 — ✅ Verified (อ่านโค้ด + vitest caller-run): **Bearer ✓**: ทุก call site แนบ `Authorization` จาก `user.token`/`authHeaders()` และ wrapper เติมให้เมื่อไม่มี (`authHeaders.ts:38-42`) · **401 → SessionExpired ✓**: `authHeaders.ts:49-51` ทุก call ยกเว้น opt-out ตามสัญญา `useTimetableMenuPermissions.ts:106` (BR-89) · helper ไม่ toast เมื่อ 401 (`timetableRequestFailure.ts:16`) · **403 มองเห็นได้ ✓**: loader ทุกตัวใช้ `readJsonOrNotify` (toast `Request failed: <status>` id ร่วมต่อหน้า) หรือตรวจ 403 แบบเดิม (`[year]/page.tsx:98-100`, `create-class-period/[year]/page.tsx:41-44, 65-68`) และทุก chain มี `.catch` → `notifyRequestError` · write: delete/toggle rollback + toast (`[year]/page.tsx:145-151, 181-189`, `TeacherGroupsTab.tsx:141-149`, `MainTeachingGradeTab.tsx:210-216`, `create-class-period/[year]/page.tsx:119-127`), `add-teacher` rollback (`TeacherGroupsTab.tsx:100-103`), `set-all` toast (`page.tsx:727-734`), `teacher-class-assignment/set` toast (`MainTeachingGradeTab.tsx:569-571`), `class-period/set` throw → toast (`create-class-period/[year]/page.tsx:150`), `class-continuity/set`/`link-subject-setting/*`/`setting/set` throw → Alert `saveError` (`subject-settings/[year]/page.tsx:274, 362, 387, 434, 454, 473`; `settings/[year]/page.tsx:289`), `add-multiple`/`update` อ่าน body 403 `{status:-1}` → toast (`TeacherGroupsTab.tsx:762, 844, 1007, 1022`) · **ไม่มีจุดใดแสดงสำเร็จเมื่อได้ 403 ✓**: `set-times` modal (`TeacherGroupsTab.tsx:554-561`) `!res.ok`/network → `rollbackTimes()` คืน `groupTimesMap` + label `active/total` + toast id เดียว · wizard (`:799-842`) เก็บผลต่อ group → มี group ใดล้ม ⇒ rollback เฉพาะ group นั้นเป็น `wizardTimesTemplate`, toast 1 ครั้ง, **ไม่เรียก** `setCreatedGroupsSummary`, ปิด wizard (กันสร้างซ้ำ) · settings gate (`page.tsx:131-135, 154-158`) non-OK/network/body อ่านไม่ได้ → `setSettingsLoaded(false)` + toast (401 ไม่ toast) · **test (caller-run 313/313):** `tests/integration/timetable-403-visible.test.tsx` ใช้ `AuthProvider` + `<Toaster/>` + `timetableFetch` + component จริง stub เฉพาะ `fetch` · ทุกเคสล้มมีเคสคุม 200 (`:192-203, 245-260, 301-309, 328-333`) · 403 modal rollback (`:162-174`), network (`:176-190`), wizard ไม่มีสรุปสำเร็จ + `add-multiple` 1 ครั้ง (`:222-243`), settings 403 ค้าง loading (`:277-290`), 401 → SessionExpired ไม่มี toast (`:292-299, 321-326`), loader 3 ตัวได้ toast เดียว (`:335-351`)
  - **คำตัดสินเรื่องโรงเรียนใหม่ (คำถามที่ reviewer ตรวจไม่ได้) — ไม่มี regression:** `Setting/Get` ของ backend (`WebAPIController.cs:1816-1870`) คืน **HTTP 200 `{status:1, data:<ค่าเริ่มต้น>}` เมื่อไม่มีแถว `Tbl_Setting`** และ HTTP 200 `{status:-1}` เมื่อ exception · ทั้งสองกรณี `res.ok` = true → frontend ข้าม `!res.ok` ไปถึง `setSettingsLoaded(true)` (`page.tsx:152`) → gate เปิด · non-200 มาจากชั้น auth เท่านั้น (401 token, 403 ไม่มีสิทธิ์อ่านเมนู 403/401 — `TimetableEndpointPolicy.cs:80`) ซึ่งผู้ใช้ที่ถูกต้องของหน้านี้ (เมนู 401) ได้ผ่าน · กรณีที่ยังไม่มีปีที่เลือก gate ก็ปิดอยู่แบบนี้มาตั้งแต่ก่อนแก้ (`page.tsx:121` return ก่อน fetch; `isScheduleDataReady` :342 มี `settingsLoaded` อยู่ก่อนแล้ว) — การแก้เปลี่ยนเพียงว่าความล้มเหลวของ fetch ไม่เปิด gate อีกต่อไป · ที่ยังค้างได้คือ 5xx/network ชั่วคราวของผู้ใช้ที่ถูกต้อง → เห็น toast แล้วค้าง "loading" จนกว่าจะ reload — **มองเห็นได้ จึงผ่าน AC-063** · จะบล็อกทั้งหน้าหรือแค่ Generate + retry เป็นคำถามของ SA (RV-12 → SA-P5-Q1) ไม่ใช่ defect · ข้อสังเกต: เมื่อ backend exception (200 `{status:-1}`) gate **เปิด**ด้วยค่าเริ่มต้นแบบเงียบ (ไม่ toast) — เป็นพฤติกรรมเดิมก่อนแก้ อยู่นอก 401/403 ของ AC-063 และเป็นคลาสเดียวกับ RV-15 · รวมไว้ใน SA-P5-Q1 (3)
  - การตัดสินข้อยกเว้น: `services/academic/schedule-ocr-import-service.ts:60` → `/api/timetable-pdf-import` → `TIMETABLE_OCR_BACKEND_URL` ซึ่งเป็น legacy `api-grade.schoolbright.co` (`route.ts:11-15`) ไม่ใช่ backend timetable-ai · ผู้ import มีที่เดียวคือ `app/[locale]/academic/schedule/schedule-import-modal.tsx:20` อยู่นอก 7 routes → **ยกเว้นถูกต้อง** · `components/ui/ClassDropdown.tsx:32` → `/api/school/{id}/level/{levelId}/level-classes` เป็น route ของ timetable-ai แต่ผู้ import มีที่เดียวคือ `CourseInformationTimetablePage.tsx:6` และ grep ทั้ง `src/` ไม่พบใคร import หน้านี้ → **ยกเว้นถูกต้องในวันนี้** (ถ้ามีคนนำหน้านี้มาใช้ข้อบกพร่องเดียวกับ RV-5 จะกลับมา ให้รวมไว้กับการล้างโค้ดตาย RV-9)
- **DES-018** — ⚠️ Partial: ฝั่ง frontend §43.2 ✅ ครบแล้วใน R3 (ทุก call ผ่าน wrapper + Bearer + 401 → SessionExpired + 403 ไม่ถูกอ่านเป็น `{status}` ปกติ) · ยังเป็น ⚠️ เพราะฝั่ง backend คงตาม R1 (BE-006/BE-007 ⚠️, RV-2 ค้างที่ SA) ไม่ได้ตรวจซ้ำในรอบนี้
- **FIND-P5-04** — ✅ Verified (resolved R3): ดู AC-063 และ Open Issues
- **FIND-P5-01** — ✅ Verified (resolved R2, ไม่เปลี่ยน — `timetableFetch` ยังครอบ 7 จุดเดิม)
- **FIND-P5-02** — ⚠️ Partial (open, Minor, FE-010, ไม่ได้ตรวจซ้ำ) · **FIND-P5-03** — ⚠️ Partial (open, Minor, นอก Phase 5, ไม่ได้ตรวจซ้ำ)
- **RV-8** — ✅ Verified (closed กับ FIND-P5-04) · **RV-7** — ⚠️ Partial (open, + snapshot ของ `set-times`) · **RV-9** — ⚠️ Partial (open) · **RV-10 / RV-11 / RV-12** — ⚠️ Partial (open → SA รวมเป็น SA-P5-Q1) · **RV-13 / RV-14 / RV-15** — ⚠️ Partial (open, ใหม่, non-blocking, QA อ่านยืนยัน) · **RV-1/RV-2/RV-4** — ⚠️ Partial (open, คงตาม R1) · **RV-5/RV-6** — ✅ (closed R2)
- **รายการด้านล่างคงตาม R1 (ไม่ได้ตรวจซ้ำในรอบ TARGETED นี้):**
- **BE-006** [sb-api-academic-timetable-ai] — ⚠️ Partial: query `TGroupPermissionUser`/`TGroupPermissionMenu` และกติกา admin อยู่จุดเดียว (`TimetableMenuPermissionResolver.cs:61-137`; grep ไม่พบ query อื่น) · filter เรียกเฉพาะ resolver (`TimetableAuthorizationFilter.cs:166`) · `AddScoped` (`Startup.cs:87`) = cache ต่อ request · ไม่มีแถว → `HasUserGroup=false` → 403 (`:180-184`); exception ไม่ถูกกลืนใน resolver → 403 (`:205-210`) — รันใน `FilterTests` (fake) + `ResolverTests.LookupFailure_Throws_NotReportedAsNoRow` (caller-run) · **ขาด:** baseline ก่อน refactor (TP-D1), resolver จริงผ่าน filter end-to-end (RV-4), บัญชี U0–U6 (TP-D2), เงื่อนไขที่เข้มกว่าสัญญา (RV-2)
  - AC-062 — ⚠️ Partial: เมทริกซ์ S1-A **หลัง** refactor ถูกต้องเมื่ออ่าน และครอบด้วย test ส่วนใหญ่ (ไม่มี token/ลายเซ็นผิด → 401; U0 → 403; อ่านได้เขียนไม่ได้; W เขียนได้เฉพาะเมนูเจ้าของ; admin ผ่าน/ไม่ผ่าน; lookup ล้ม → 403; นอกตาราง/controller อื่น → 403; `IsActive=false`/`IsDel`/โรงเรียนอื่น = ไม่มีแถว; `Type` ไม่รู้จัก/ตัวเล็ก → อ่านได้เขียนไม่ได้) · ส่วน "**เท่ากับก่อน refactor**" ไม่มีหลักฐาน (TP-D1)
- **BE-007** [sb-api-academic-timetable-ai] — ⚠️ Partial: endpoint (`WebAPIController.cs:2837-2866`) ไม่มีพารามิเตอร์, identity จาก claims, คืน 5 MenuID จาก `TimetableMenuSettings` เท่านั้น (`RawPermissions` ไม่ถูกคืน) · authenticated-only ใช้ที่ action เดียว (`TimetableEndpointPolicy.cs:122`; assert `IntegrationTests.cs:236-243`) · BR-72 (`Startup.cs:80-85`, `[Authorize]` `WebAPIController.cs:33`) และ BR-73 (`Filter.cs:41-132` ก่อน bypass `:157`) ยังบังคับ · admin ไม่ผ่าน BR-76 → 200 + false (`Resolver.cs:77-88`) · exception → 403 (`:2861-2865`) · **ขาด:** S1-B/S1-C บนบัญชีจริง (TP-D2), resolver จริงและเส้น admin ผ่าน BR-76 ที่ชั้น integration (RV-4), SA-Q14 (admin ได้ true ทั้ง 5 โดยไม่ตรวจ `TMenu` active)
  - AC-064 (ส่วน API) — ⚠️ Partial: รันแล้ว (caller-run, resolver ปลอม) — U0 → 200 + false ×5, อ่านบางเมนู, เขียนบางเมนู, admin ไม่ผ่าน → 200 + false, token ผิด/ไม่มี → 401, lookup ล้ม → 403, `?nSchoolID` อื่น → 403, ครบ 5 MenuID · "ตรงกับการตัดสินของ filter" อ่านแล้วตรง (ใช้ `MenuPermissions` ชุดเดียว `ITimetableMenuPermissionResolver.cs:24-40`) แต่ไม่ได้ execute ผ่าน resolver จริง (S1-C)
  - AC-062 (regression ของ BE-007) — ✅ Verified (caller-run): `OtherEndpoints_StillDenyNoRowUser_AC062` — U0 ยังได้ 403 ที่ endpoint อื่น
- **FE-017** [sb-tech-upgrade-web-system] — ✅ Verified: `TimetableFetchInit` + `suppressSessionExpired?` (`authHeaders.ts:27-29`) additive, signature 2 อาร์กิวเมนต์เดิม (รูปบน `init` แทนอาร์กิวเมนต์ที่ 3 — ผลเท่ากัน), ค่าเริ่มต้นยังเรียก `notifySessionExpired` (`:49-51`), ตัวเลือกถูกถอดก่อน `fetch` (`:43`), `notifySessionExpired` ไม่ถูกแก้ · grep: ผู้ใช้ opt-out มีเฉพาะ `useTimetableMenuPermissions.ts:107` · tsc/eslint/build exit 0 + vitest (caller-run)
  - AC-063 (regression จาก FE-017) — ✅ Verified (caller-run): ค่าเริ่มต้น 401 ลบ token + `sb_user_data` + event 1 ครั้ง; `false` ชัดเจน = ค่าเริ่มต้น; 200/403/404/500 ไม่แตะ session; ไม่มี token + 401 → ไม่มี header แต่ยัง SessionExpired; ผู้เรียกเดิม 7 routes ใน `AuthProvider` จริง → `SessionExpiredScreen` · **FE-017 ไม่ทำให้ AC-063 ถดถอย** — ช่องว่างที่พบเป็นของ FE-001
  - AC-064 (ฐานของ FE-010) — ✅ Verified (caller-run): opt-out 401 → ได้ 401, token/`sb_user_data` อยู่, ไม่มี event, ยังมี Bearer; opt-out 403/404/500 ส่งผ่าน; opt-out 401 แล้วค่าเริ่มต้น 401 → ไม่มีสถานะค้าง · signal ถึง `fetch` (hook Case 12)
- **FE-010** [sb-tech-upgrade-web-system] — ✅ Verified: proxy ใช้ `proxyToBackend` เดิม (`route.ts:3-5`) — ส่ง `Authorization` (`backendProxy.ts:100, 107`) และคืน status ของ backend (`:72-76`) · hook เรียก `timetableFetch` + opt-out + `AbortController` 10 วินาทีค่าคงที่จุดเดียว (`timetable-menu-permissions.ts:41`; timer ล้างหลังอ่าน body `:144-146`) · `ready` เฉพาะ 2xx + `status === 1` + ชุด 5 MenuID ตรงตัวที่เป็น boolean (`:41-93, 112-137`) นอกนั้น `checkFailed` + `console.error` · cache ระดับ module ต่อ `(schoolId, empId)` + dedupe in-flight, `checkFailed` ถูก cache (ไม่ retry) · ไม่มี `localStorage.setItem` · map BR-86 จุดเดียว (`:14-28`) · ฟังก์ชันสถานะ fail-closed (`:50-73`) · `Sidebar.tsx` เพิ่มเฉพาะ type (`:98-99, 107`), ไม่มี JSX/hook ใหม่ (grep) · tsc/eslint/build exit 0 (caller-run)
  - AC-064 (ส่วนข้อมูล) — ✅ Verified (caller-run, mock): S2-A #1–#12 และ #13(a)(d)(e) · #13(b)(c) ไม่มี test ตรงตัว แต่โค้ดปฏิเสธความยาว ≠ 5 (อ่าน — FIND-P5-02) · S2-B: remount ไม่เรียกซ้ำ, identity ใหม่เรียกใหม่, `checkFailed` ไม่ retry, ไม่มีสิทธิ์ใน `localStorage` · เปลี่ยนภาษา — อ่านเท่านั้น (cache ระดับ module) · นับ network ในเบราว์เซอร์/proxy จริง → Unverified Behaviour
- **DES-022** — ⚠️ Partial: frontend (BR-86, BR-89, 47.2, 47.3) ตรงสัญญา · backend BR-88 ตรงเมื่ออ่าน + test ด้วย resolver ปลอม · ขาด S1-C/S2-C บนข้อมูลจริง (TP-D2) และ resolver จริงใน integration (RV-4)
- DES-018 ฝั่ง backend (R1): ข้อยกเว้นเดียวของ BR-74 ถูกต้องและจำกัดที่ action เดียว · BR-72/BR-73/VR-20 คงบังคับ
- **FIND-P4-08** (ส่วน `locale`) — นอกขอบเขตรอบนี้ ไม่ได้ตรวจซ้ำ คงเปิด

## Contract Checks

- `GET WebAPI/MenuPermissions/Get` → `{status:1, message:"", data:{lstMenus:[{nMenuID, isRead, isWrite}]}}` (design §47.2) — ตรง (`WebAPIController.cs:2844-2859`; ชื่อฟิลด์ camelCase ยืนยันโดย `IntegrationTests.GetMenus`, caller-run)
- 401/403 body `{status:-1, message}` (§43.3) — ตรง (`TimetableAuthorizationFilter.cs`, `WebAPIController.cs:2864`)
- hook result `{status, permissions}` + 4 สถานะรายรายการ (§47.2/§47.3) — ตรง
- MenuID ข้าม repo: `appsettings.json:17-21` = `TimetableMenuSettings.cs:5-9` = `timetable-menu-permissions.ts:5, 14-28` — ตรง
- Data Model: Phase 5 ไม่เปลี่ยนสคีมาของโมดูล · schema-contract checker ไม่ได้รัน (สิทธิ์)
- (R3) `GET WebAPI/Setting/Get` — business result เป็น HTTP 200 เสมอ (DES-002): ไม่มีแถว → `{status:1, data:<ค่าเริ่มต้น>}`, exception → `{status:-1}` (`WebAPIController.cs:1846-1875`) · non-200 มาจากชั้น auth เท่านั้น (§43.2) — ตรงกับที่ gate fail-closed ของ frontend สมมติไว้ · Next proxy `src/app/api/setting/get/route.ts:3-6` ส่งผ่าน `proxyToBackend`

## Unverified Behaviour — undeployed phases

**ประตู deploy ของ Phase 4** — คนยอมรับ Phase 4 (HUMAN-P4-R4) โดยให้รายการนี้ติดไปถึง deploy · `devops` ต้องแสดงรายการนี้ต่อผู้ใช้ก่อน deploy · vitest 29/29 และ typecheck ผ่านตาม log ของผู้เรียก — กติกาต่อไปนี้ยัง**อ่านอย่างเดียว ไม่ได้ execute**:

- Phase 4 — deterministic sweep (`static-analysis-gate.js`) ไม่ได้รัน (R4 ถูกปฏิเสธสิทธิ์อีก) · typecheck/vitest/`dotnet build` เป็น log ของผู้เรียก QA ไม่ได้รันซ้ำ · schema-contract checker ไม่ได้รัน
- Target sb-tech-upgrade-web-system — ไม่มีหลักฐาน lint และ build
- Target sb-api-academic-timetable-ai — ไม่มีการเรียก `GetSubjectsByPlan` ทั้ง `sblanguage: en/th` + ผล query `TCourseGroup.Description`
- BR-81b ตัวอย่าง 1–6 (oracle ของ FE-008) — อ่าน/ไล่มือใน R1 เท่านั้น
- BR-81 Rev 16 ชุดวันของ `lstClassDays` (วันว่าง = 0/0, วัน club-only ไม่แสดง) — อ่านเท่านั้น
- BR-80(4) การเทียบ L0/L1/L2 บน RNG ลำดับเดียวกัน — ไม่ได้ทำ
- BR-80 คำเตือนการแก้มือของ FE-009 (คู่ใหม่เท่านั้น, T_c ลดจนวันอื่นเกิน, `AddCourseModal`, การแก้ที่ถูกปฏิเสธ, L0 ไม่มีคำเตือน) — อ่านเท่านั้น
- BR-77 trim/startsWith กับค่าจริงของ `TCourseGroup.Description` (SA-Q18 ยังเปิด)
- BR-77 บนเส้นทาง restore เมื่อ catalog fetch ล้ม: `SubjectSlot` ของ `Timetable/Get` อาจไม่มี `nCredit`/`sCourseGroupDesc*` (โค้ดอ่านผ่าน `as unknown as`) → แผนนั้นอาจได้ `UNCLASSIFIED` — ไม่ได้ยืนยันรูป response
- BR-79 "บล็อกต่อเนื่องนับตามจำนวนคาบ" — ตัวประเมินนับต่อ cell; ไม่ได้ยืนยันว่า cell หนึ่งช่องอาจแทนหลายคาบหรือไม่
- BR-81b (ค2) โควตา H "รวมคาบ seed จากล็อก/link ไม่รวมวิชาที่ถูกตัด" — ไม่ได้ไล่ข้อมูลจริง
- ลำดับ React ของ `TimetableGrid` (updater ถูกเรียกตอน render/StrictMode เรียกซ้ำ, snapshot ก่อน/หลังผ่าน `useEffect`) — ไม่ได้รันในเบราว์เซอร์
- FIND-P4-08 ส่วน `locale` dependency (Minor, ยังเปิด) — ไม่ได้ทดสอบการสลับภาษาโดยไม่ remount

**Phase 5 (R1)** — ผลรันทั้งหมดเป็น caller-run (QA ไม่ได้รันซ้ำ) · รายการต่อไปนี้**ไม่มีการ execute ที่พิสูจน์ได้**:

- Phase 5 — deterministic sweep ของ **Target** ไม่ได้รัน (gate ของ Knowledge repo ไม่ครอบ Target) · QA รัน gate/`sta context` ไม่ได้ (สิทธิ์) · schema-contract checker ไม่ได้รัน
- AC-062 "ผลเท่ากับก่อน refactor" ของ BE-006 (S1-A before/after) — ไม่มี baseline (TP-D1: `AuthTests` ไม่มีจริง) · เหลือเพียงอ่านโค้ด + test หลัง refactor
- Target sb-api-academic-timetable-ai — resolver จริงไม่เคยถูกเรียกผ่าน filter/endpoint ใน test (integration ใช้ fake — RV-4); เส้น admin ผ่าน BR-76 ที่ชั้น integration ไม่ได้ทดสอบ
- S1-A/S1-B/S1-C บน master DB จริงด้วยบัญชี U0–U6 (TP-D2) — ไม่ได้ทำ · รวม "ถอนสิทธิ์ระหว่างสอง request → request ที่สองเห็นทันที"
- SA-Q14 — MenuID 401/402/403/404/422 มีใน `TMenu` (active) หรือไม่ · admin ได้ true ทั้ง 5 ตัวโดยไม่ตรวจ `TMenu`
- timeout จริงของ `MasterDataContext` (Npgsql) → 403 — test จำลองด้วย exception ปลอมเท่านั้น
- S2-C — response จริงของ BE-007 ป้อน hook ผ่าน Next proxy จริง (Bearer + ส่งผ่าน 401/403/404/5xx) — `menu-permissions.test.ts` mock `proxyToBackend` ทั้งตัว
- timeout 10 วินาทีบน proxy/backend ที่ค้างจริงในเบราว์เซอร์ (vitest ใช้ fake timers; proxy ไม่มี timeout — D27)
- 1 request ต่อ full page load / เปลี่ยน route / เปลี่ยนภาษา นับใน DevTools — ไม่ได้ทำ
- S10-A `[manual-API]` ผ่าน proxy จริงด้วย token หมดอายุ — ไม่ได้ทำ · vitest ครอบผู้เรียกตัวแทน ไม่ใช่ทุก 53 call site
- FIND-P5-01 — พฤติกรรม 401/403 ของ 7 call ตรง ยืนยันจากการอ่าน ไม่ได้รัน · R2: ตอนนี้ผ่าน wrapper แล้ว และ vitest ครอบ (ผู้เรียกรัน) แต่ยังไม่ได้รันในเบราว์เซอร์จริง

**Phase 5 (R2 + R3: FE-001)** — ผลรันทั้งหมดผู้เรียกเป็นคนรัน (QA ไม่ได้รันซ้ำ) · FE-001 ตั้ง `verified` บนการอ่านโค้ดทุก call site + vitest · รายการต่อไปนี้**ไม่ได้ execute** — `devops` ต้องแสดงต่อผู้ใช้ก่อน deploy:

- **S10-A `[manual-API]` กับเบราว์เซอร์จริง + Next proxy จริง + backend ที่เปิด auth ด้วย token หมดอายุ** ไม่ได้ทำ · การที่ 401 นำไป SessionExpired ยืนยันได้จาก vitest (stub `fetch` ระดับ global, `AuthProvider` จริง) และจากการอ่านโค้ดเท่านั้น
- "ใช้ flow หลักทุกหน้ากับ backend ที่เปิด auth โดยไม่มี 401" และ "ผู้ใช้ไม่มีสิทธิ์เมนู → ทุก call ที่ได้ 403 (รวมปุ่มลบ/toggle) แสดงความล้มเหลว" (Required validation ของ FE-001) ไม่ได้ทำ เพราะไม่มีบัญชี U0–U6 (TP-D2)
- 403 ของ 61 call site ยืนยันด้วยการอ่าน · vitest 403 ครอบเฉพาะตัวแทน: `set-times` modal + wizard, `setting/get` gate, `TimetableYearListPage`, `MainTeachingGradeTab`/`TeacherGroupsTab` loader (`timetable-403-visible.test.tsx`) และจุดของ R2 (`timetable-session-expired.test.tsx`) · **ไม่มีเคส 403 ที่รันจริง** สำหรับ `subject-settings/[year]`, `settings/[year]`, `[year]` (นอกจากเคสเดิม), `create-class-period/[year]`, `use-select-curriculum`, loader 2 ตัวของ `use-timetable-generation`, write ส่วนใหญ่ (delete/toggle/`set-all`/`setting/set`/`link-subject-setting/*`)
- พฤติกรรม "โรงเรียนใหม่ไม่มีแถว `Tbl_Setting` → gate เปิด" ยืนยันจากการอ่าน backend + frontend · test คุม (`:301-309`) ใช้ body `{status:1, data:{}}` ไม่ใช่ response จริงของ backend · ไม่ได้รันกับ DB ที่ไม่มีแถวจริง
- ค้าง "loading" เมื่อ `setting/get` ได้ 5xx/network ชั่วคราว (ไม่มี retry) — อ่านแล้ว รอ SA-P5-Q1
- รายการ call ครบทุกตัวในรูป "ไฟล์:บรรทัด → endpoint → Bearer? → 401/403?" ตามที่ FE-001 กำหนดเป็นหลักฐาน มีใน review Round 4 (61 site แบ่ง loader 36 / write 24 / opt-out 1) และ QA grep ซ้ำแล้วตรง — ไม่ได้มีเป็นตารางแยกของ engineer
- lint ทั้ง repo ไม่ผ่าน (error เดิมนอก Phase 5 ตามผู้เรียก) · eslint รันเฉพาะ helper + `tests/integration` · deterministic sweep ของ Target ไม่ได้รัน

**ประตู deploy ของ Phase 5 — BE-006/BE-007 (HUMAN-P5-R1, 2026-10-02)** — ผู้ใช้ยอมรับ BE-006/BE-007 เป็น `verified` บนหลักฐาน R1 ("ยอมรับ ไปต่อได้") โดยให้รายการนี้ติดไปถึง deploy · `devops` ต้องแสดงรายการนี้ต่อผู้ใช้ก่อน deploy · หลักฐานที่มีคือ `dotnet test` 42/42 (in-memory, caller-run, QA ไม่ได้รันซ้ำ) + QA อ่านโค้ด — ต่อไปนี้**ไม่ได้ execute**:

- **TP-D1 — baseline ก่อน refactor ไม่มีและทำไม่ได้แล้ว:** AC-062 "ผลเท่ากับก่อน refactor" ของ BE-006 พิสูจน์ได้เพียงจากการอ่านโค้ด + test in-memory หลัง refactor (เทียบกับ baseline ข้อความ BR-74/BR-76 Rev 18 ของ plan)
- **TP-D2 — S1-A / S1-B บน master DB จริงด้วยบัญชี U0–U6 ไม่ได้รัน** (รวม S1-C, "ถอนสิทธิ์ระหว่างสอง request → request ที่สองเห็นทันที" และ SA-Q14 การตรวจ `TMenu`)
- **RV-4 — integration ใช้ `FakePermissionResolver`** (`IntegrationTests.cs:33-38`): resolver จริงไม่เคยถูกเรียกผ่าน filter/endpoint ใน test และเส้น admin ผ่าน BR-76 ที่ชั้น integration ไม่ได้ทดสอบ (งานแก้อยู่ที่ BE-009)

## Issues Found

- (R2, **resolved R3**) FIND-P5-04: 61 call site แสดง 403/อื่นผ่านทางแสดงข้อผิดพลาดเดิมของหน้าแล้ว · write `set-times` ทั้ง 2 จุด rollback และไม่แสดงสำเร็จ · settings gate fail closed · ไม่มี finding บล็อกใหม่ในรอบนี้
- → **system-analyst** (**SA-P5-Q1** = RV-10 + RV-11 + RV-12, คำถามพฤติกรรมเดียว, non-blocking): (1) 401 ควรแสดง toast/Alert ของหน้าคู่กับ SessionExpired หรือไม่ (2) period load ของ `TimetableGrid` ล้ม → ยกเลิก/ระงับ Generate ที่รออยู่หรือไม่ (3) load ที่ Generate/Save ต้องใช้ล้ม → บล็อกทั้งหน้า (แบบ `setting/get` วันนี้) หรือบล็อกเฉพาะ Generate/Save พร้อมปุ่ม retry — ให้ใช้กฎเดียวกันกับ `subject-settings/get`, `get-all-by-year`, `teacher-group/get-all`, `settings/[year]` form และกรณี 200 `{status:-1}` ของ `Setting/Get` · ตัดสินแล้ว engineer ปรับทุกจุดให้ตรง (ห้าม engineer เลือกเอง)
- → **frontend-engineer** (non-blocking): RV-7 (rollback แบบ absolute snapshot ของ `persistGroupTeachers` และ `set-times` modal + side effect ใน updater) · RV-13 (เรียก `loadSubjectSettings()` ใน `catch` ของ `handleGroupModalSave` อย่างน้อย; replace แบบ atomic ต้องผ่าน SA) · RV-14 (ใช้ helper ที่ import ด้วย id `restore-schedule-data` หรือเปลี่ยนชื่อตัว local) · RV-15 → `project-manager` จัดคิว: write ที่ถือ 200 ทุกตัวว่าสำเร็จ (`set-all`, `set-times`) ควรตรวจ `status` ใน body · (RV-9) → `project-manager`: `CreateClassPeriodForm`/`CourseInformationTimetablePage`/`ClassDropdown` ไม่มีผู้ import ควรลบหรือนำมาใช้
- → **frontend-engineer** (FE-001 evidence gap, non-blocking): เพิ่มเคส 403 ที่รันจริงสำหรับ `subject-settings/[year]`, `settings/[year]`, `create-class-period/[year]`, `use-select-curriculum`, loader ของ `use-timetable-generation` และ write delete/toggle (ตามช่องว่างที่ reviewer R4 ระบุ) · เคส network ของ modal (`timetable-403-visible.test.tsx:176-190`) ควร assert ว่าไม่ขึ้น SessionExpired
- (R1, resolved R2) FIND-P5-01: 7 call ตรงย้ายไป `timetableFetch` เรียบร้อย
- → **backend-engineer** (BE-006/BE-007 — RV-1, RV-4): ผูก cache กับอาร์กิวเมนต์ · เพิ่มกรณี in-process ที่ใช้ resolver จริงบน in-memory `MasterDataContext` + fake แบบ admin (`IsAdmin=true`)
- → **system-analyst** (RV-2): ยืนยันว่า BR-74/BR-76 รวม `admin.active`/`admin.del`/`TGroupPermissionUser.IsDel` หรือไม่ แล้ว amend ข้อความ (ไม่ตรง → กลับไป engineer)
- → **frontend-engineer** (FE-010, Minor — FIND-P5-02): แก้ Case 13b/13c ให้เป็น "ครบ 5 + 401 ซ้ำ" 6 แถว (ค่าเดียวกัน / ค่าขัดกัน)
- → **frontend-engineer** (Minor — FIND-P5-03): ป้องกัน `initAuth` เขียน token กลับหลัง `sb-session-expired` (ไม่ใช่งาน Phase 5)
- → **devops / เจ้าของระบบ SB** (TP-D2, SA-Q14): บัญชี U0–U6 + ตรวจ `TMenu` ก่อนรัน S1 จริง
- Phase 4 (คงจาก R4 — ยอมรับโดยคน ไม่บล็อก): lint/build frontend, oracle BR-81b 1–6 + RNG, สคริปต์แก้มือ FE-009, `locale` dependency FIND-P4-08, response 2 ภาษา BE-005 — รายละเอียดใน [qa/phase-4.md](round-1.md) R4
- §21 (comment) ในไฟล์ที่รอบนี้แก้ — Minor, ไม่บล็อก: what-comment ที่ทวนโค้ด → ลบหรือเปลี่ยนเป็นเหตุผล · **backend-engineer**: `TimetableAuthorizationFilter.cs:134` `// 4. Endpoint Policy Lookup`, `:163` `// 5 & 6. Permission Resolution via Shared Resolver` (เลขขั้นค้างจากโครงเดิม) · `ResolverTests.cs:59` `// unrelated menu` · **frontend-engineer**: `useTimetableMenuPermissions.ts:70` `// Duplicate MenuID found` · `tests/lib/authHeaders.test.ts:124, 127, 130` (`// Verify …`) · `tests/hooks/useTimetableMenuPermissions.test.tsx:349, 356, 506, 516, 519, 525, 603` · comment ที่บอกเหตุผล (เก็บได้): `useTimetableMenuPermissions.ts:22, 26, 111, 198-199, 211-213`, `ResolverTests.cs:157`, `IntegrationTests.cs:18-19, 222` · ไม่พบ workaround ที่ขาดเหตุผล · ไม่มี git diff จึงแยกบรรทัดใหม่/เดิมจากการอ่านเท่านั้น
- §21 (comment) ในไฟล์ที่ R2 แก้ (`LinkSubjectsModal.tsx:169-171`, `TimetableGrid.tsx:459-461`, `TeacherGroupsTab.tsx:68-69`, `manage-teaching-schedule/page.tsx:1131-1133`): ทุกจุดอธิบาย**เหตุผล** (401 ไม่ toast เพราะหน้า SessionExpired มาแทน, id ร่วมเพื่อไม่ให้ toast ซ้อนกัน, ทำไมยังเรียก `onReady`) ไม่ใช่ what-comment · ไม่พบ workaround ที่ขาดเหตุผล · ไม่มีปัญหา · §22: R2 ไม่ได้เพิ่มไฟล์ใหม่ใต้ `src/` (เป็นการแก้ไฟล์เดิม) · test ที่เพิ่มอยู่ในไฟล์เดิม `tests/integration/timetable-session-expired.test.tsx`
- §21 (comment) ในไฟล์ที่ R3 แก้ — Minor, ไม่บล็อก, **frontend-engineer**: `use-timetable-generation.ts:95` "see the report for the open decision on failing closed" ชี้ไปยังรายงานของ engineer ที่ไม่อยู่ใน repo → เปลี่ยนเป็นเหตุผลในตัว (gate ยังเปิดใน `finally` โดยตั้งใจ รอ SA-P5-Q1) · `TeacherGroupsTab.tsx:526` `// Persist to server` เป็น what-comment (ไม่มี diff — อาจมีมาก่อน) · comment ใหม่อื่นบอก**เหตุผล** (เก็บได้): `timetableRequestFailure.ts:3-12, 14, 24-27`, `page.tsx:126-130, 155, 595`, `TeacherGroupsTab.tsx:73-74, 157-158, 500, 552-553, 798, 820-823`, `subject-settings/[year]/page.tsx:361, 433, 453` · ไม่พบ workaround ที่ขาดเหตุผล
- §22 (R3 ไฟล์ใหม่ตามแบบเพื่อนบ้าน): `src/lib/timetableRequestFailure.ts` — **ใช่** (แบบ `src/lib/authHeaders.ts`: camelCase `.ts`, JSDoc หัวไฟล์, named export) · `tests/integration/timetable-403-visible.test.tsx` — **ใช่** (แบบ `tests/integration/timetable-session-expired.test.tsx`: harness, `AuthProvider` จริง, stub `matchMedia`)
- (R1) §22 (ไฟล์ใหม่ตามแบบเพื่อนบ้าน): `Security/ITimetableMenuPermissionResolver.cs`, `Security/TimetableMenuPermissionResolver.cs` — ใช่ (แบบ `TimetableAuthorizationFilter.cs`) · `src/app/api/menu-permissions/get/route.ts` — ใช่ (แบบ `src/app/api/setting/get/route.ts`) · `src/hooks/useTimetableMenuPermissions.ts` — ใช่ (แบบ `useLocaleStorage.ts`) · `src/config/timetable-menu-permissions.ts` — ใช่ (typed const ตาม `src/config/README.md`) · test ใหม่ใต้ `tests/**` — ใช่ · `AITimeTableBackend.Tests/` — ไม่มีเพื่อนบ้าน (โปรเจกต์ test แรก)

## Review Outcome

**Status:** ✅ Verified (TARGETED)

- **ขอบเขต:** TARGETED เฉพาะ FE-001 (AC-063, DES-018 §43.2 ฝั่ง frontend) · ✅ นี้**ไม่ใช่**การผ่านของ Phase 5 ทั้งเฟส — BE-006/BE-007 ยัง ⚠️ (HUMAN-P5-R1) และ TARGETED ไม่พาไปต่ออัตโนมัติ
- **FE-001 ✅ (R3):** FIND-P5-04 resolved · QA grep ซ้ำแล้วได้ 61 call site ตรงกับ engineer/reviewer และอ่านการจัดการทุกจุดเอง: Bearer ✓ · 401 → SessionExpired ✓ · 403/อื่น มองเห็นได้ ✓ · ไม่มีจุดใดแสดงสำเร็จหรือเงียบเมื่อได้ 401/403 ✓ · `set-times` modal/wizard rollback และไม่แสดงสำเร็จ ✓ · settings gate fail closed ✓
- **คำถามที่ reviewer ตรวจไม่ได้ — ตัดสินแล้ว: ไม่มี regression ที่โรงเรียนใหม่.** backend `Setting/Get` คืน HTTP 200 `{status:1}` พร้อมค่าเริ่มต้นเมื่อไม่มีแถว (`WebAPIController.cs:1846-1870`) → gate เปิด · ค้าง "loading" ได้เฉพาะเมื่อ 401/403 (ถูกต้องตามสัญญา) หรือ 5xx/network ชั่วคราว (มี toast — มองเห็นได้) · บล็อกทั้งหน้าหรือแค่ Generate + retry เป็นคำถามของ SA (SA-P5-Q1) ไม่ใช่ defect
- **`plan.md`:** FE-001 `blocked` → **`verified`** · BE-006/BE-007 **ไม่แตะ** (คง `blocked` รอ HUMAN-P5-R1) · FE-017/FE-010 คง `verified`
- **(2026-10-02) คำตัดสินของคน HUMAN-P5-R1 ส่วน BE-006/BE-007 — "ยอมรับ ไปต่อได้":** BE-006/BE-007 `blocked` → **`verified` ตามคำตัดสินของผู้ใช้** บนหลักฐาน R1 (dotnet test 42/42 in-memory caller-run + QA อ่านโค้ด) **พร้อมช่องว่างหลักฐาน** — TP-D1 (ทำไม่ได้แล้ว), TP-D2 (บัญชี U0–U6) และ RV-4 (resolver ปลอมใน integration) ย้ายไป Unverified Behaviour เป็นประตู deploy · ไม่ใช่รอบตรวจใหม่และไม่ได้ตรวจซ้ำ · BE-008/BE-009 เดินต่อได้ · RV-1/RV-2/RV-4 คงเปิด (RV-2 มีหมายเหตุ OQ-39) · **ไม่ใช่ security sign-off**
- **ยังไม่ได้ execute (ประตู deploy, ดู Unverified Behaviour):** S10-A `[manual-API]` ด้วย token หมดอายุผ่าน proxy/backend จริง · flow ผู้ใช้ไม่มีสิทธิ์เมนู (ต้องใช้บัญชี TP-D2) · เคส 403 ที่รันจริงของหลายหน้า · หลักฐานการรันทั้งหมดผู้เรียกรัน (vitest 313/313, tsc/build exit 0, eslint helper+tests ไม่มี error, dotnet test 42/42) QA ไม่ได้รันซ้ำ
- **non-blocking ที่ยังเปิด:** SA-P5-Q1 (RV-10 + RV-11 + RV-12) → `system-analyst` · RV-7, RV-13, RV-14 → frontend-engineer · RV-15, RV-9 → `project-manager` · RV-1, RV-4 → backend-engineer · RV-2 → `system-analyst` · FIND-P5-02/03, FIND-P4-08 (`locale`) Minor
- 🔒 Security gate ของ Phase 3 และ Phase 5 **คงเปิด** (ประตูมนุษย์คือรอบ `security` ของ DES-018 + ข้อยกเว้น BR-74 + SEC-01 + NU1903/NU1904) · รอบนี้ไม่ใช่ security sign-off
- **ต้องให้คนตัดสิน:** (1) ยอมรับ FE-001 `verified` โดยให้ S10-A/TP-D2 ติดไปเป็นประตู deploy — หรือสั่งให้รัน S10-A ด้วยมือก่อน (2) ~~HUMAN-P5-R1 ส่วน BE-006/BE-007 ยังเปิด~~ — ตัดสินแล้ว 2026-10-02 ("ยอมรับ ไปต่อได้") (3) ส่ง SA-P5-Q1 และ RV-2 ให้ `system-analyst` · QA ไม่ไปต่อเอง
- 🔒 หลังคำตัดสิน 2026-10-02: Security gate ของ Phase 3 และ Phase 5 **ยังเปิด** — การยอมรับ BE-006/BE-007 ไม่ปิด gate และไม่ใช่การ sign-off ของ `security`

## Closed Open Issues — moved verbatim from `qa.md` 2026-10-04

| ID | Phase | Severity | Owner | Summary | State |
|---|---|---|---|---|---|
| FIND-P5-01 | 3 (พบใน Phase 5 R1 ขณะตรวจ AC-063 ซ้ำ) | Important | frontend-engineer (FE-001) | AC-063 ของ FE-001 ไม่ครบ: 7 call ใน routes timetable เรียก `fetch(` ตรง ไม่ผ่าน `timetableFetch` → 401 ไม่พาไป SessionExpired และบางจุดเงียบเมื่อได้ 401/403 · `manage-timetable/[year]/TeacherGroupsTab.tsx:69` (fire-and-forget `teacher-group/add-teacher` — `.catch` จับแค่ network error, UI อัปเดตแบบ optimistic ไปแล้ว → 401/403 **เงียบ**) · `create-class-period/[year]/_components/create-class-period-form.tsx:254, 279` (`.catch(() => {})` → 401/403 เงียบ, รายการว่าง) · `create-class-period-form.tsx:461` และ `_components/add-class-period-modal.tsx:182` (401 → toast "Request failed: 401" แทน SessionExpired) · `manage-teaching-schedule/page.tsx:1135, 1139` (`.catch(() => null)` → 403 เงียบ; 401 ได้ SessionExpired เพียงเพราะ `timetableFetch` ตัวข้าง ๆ ใน `Promise.all` เดียวกัน :1132) · ทุกจุดแนบ Bearer จาก `user.token` แล้ว · **ไม่ใช่ regression ของ FE-017** (FE-017 แก้เฉพาะ `authHeaders.ts`; ขอบเขตห้ามแตะผู้เรียกเดิม) — เป็นช่องว่างของ FE-001 ตั้งแต่ Phase 3 | **resolved R2 (อ่านโค้ด + vitest caller-run)** — ทั้ง 7 จุดเรียก `timetableFetch` ค่าเริ่มต้นแล้ว (`TeacherGroupsTab.tsx:81-98` rollback + toast เมื่อ `!res.ok`/network · `create-class-period-form.tsx:255-273, 283-299, 468-485` · `add-class-period-modal.tsx:183-197` · `manage-teaching-schedule/page.tsx:1134-1156` toast เมื่อ 403/อื่น, ไม่ toast เมื่อ 401) · รวม RV-5/RV-6 ที่ reviewer พบเพิ่ม · grep `fetch(` ตรงทั้ง `src/` ไม่เหลือ call ไป route timetable บนเส้นทางที่ render · ช่องว่าง 403 ที่เหลือของ AC-063 แยกเป็น FIND-P5-04 |
| RV-2 | 5 | non-blocking | system-analyst | resolver เข้มกว่าข้อความสัญญา (`admin.active != false`, `admin.del != true`, `TGroupPermissionUser.IsDel` — `Resolver.cs:71-72, 95`) — ไม่รู้ว่า BE-006 เพิ่มหรือยกมาจาก filter เดิม | open — ทำให้ AC-062 "เท่ากับก่อน refactor" พิสูจน์ไม่ได้ (คู่กับ TP-D1) · related: OQ-39 answered 2026-10-02 — admin passes when `TAdmin.active != false` and `TAdmin.del != true`, `IsActive` not used; matches resolver · ยังเปิดจนกว่า `system-analyst` amend ข้อความสัญญา (รวม `TGroupPermissionUser.IsDel`) |
| RV-3 | 5 | non-blocking | frontend-engineer | ช่องว่าง test-plan §S10 ของ FE-017 | **closed — QA ยืนยัน R1:** `tests/lib/authHeaders.test.ts:158-250` เพิ่ม S10-A #4, #6, S10-B #2, #5 · `tests/integration/timetable-session-expired.test.tsx` render ผู้เรียกเดิมใน `AuthProvider` จริงครบ 7 routes + hook `use-select-curriculum` + fire-and-forget + `Promise.all` + กรณีคุม 403 |
| HUMAN-P5-R1 | 5 | — (decision) | human | ยอมรับ / ส่งกลับ / ปรับขอบเขต: BE-006/BE-007 ขาดหลักฐานที่ plan บังคับ (TP-D1 baseline ก่อน refactor, TP-D2 บัญชี U0–U6) และ FIND-P5-01 ทำให้ FE-001 ไม่ผ่าน AC-063 | ส่วน FE-001 ตัดสินแล้วโดยปริยาย (ส่งกลับ frontend-engineer → แก้แล้ว R2) · **ส่วน BE-006/BE-007 ยังเปิด** · R2 เพิ่มข้อ FE-001/FIND-P5-04 — ดู Review Outcome · R3: ส่วน FIND-P5-04 แก้แล้ว (ส่งกลับ engineer → แก้ → QA ปิด) · **ส่วน BE-006/BE-007: resolved with user decision (2026-10-02), "ยอมรับ ไปต่อได้"** — คำอธิบายตัวเลือกที่ผู้ใช้เห็น: "QA บันทึกว่า verified ส่วน TP-D1 (ทำไม่ได้แล้ว) กับ TP-D2 ย้ายไปเป็นเงื่อนไขก่อน deploy และ BE-008/BE-009 เดินต่อได้" · ยอมรับบนหลักฐานของ R1 (dotnet test 42/42 in-memory caller-run + QA อ่านโค้ด) **พร้อมช่องว่าง** — TP-D1 baseline ทำไม่ได้แล้ว, TP-D2 บัญชี U0–U6 ไม่มี, RV-4 resolver จริงไม่ถูกรันผ่าน integration → ย้ายไป Unverified Behaviour เป็นประตู deploy · ไม่ได้ตรวจซ้ำ · **ไม่ใช่ security sign-off** (🔒 Phase 3/5 คงเปิด) |
| FIND-P5-04 | 3 (พบใน Phase 5 R2 ขณะตรวจ AC-063 ซ้ำ) | Important | frontend-engineer (FE-001) | ผู้เรียก `timetableFetch` หลายจุดใน 7 routes ไม่ตรวจ `res.ok` → 401 ได้ SessionExpired ถูกต้อง แต่ **403 เงียบ** (body `{status:-1}` ตก `status === 1` แล้วจบที่ `.catch(() => {})`) ขัด AC-063 "403 ปรากฏเป็นความล้มเหลวที่ผู้ใช้เห็น — ไม่มีจุดใดแสดงสำเร็จหรือเงียบ" และ validation "ทุก call ที่ได้ 403 แสดงความล้มเหลว" · **write ที่แสดงสำเร็จเมื่อ 403:** `manage-timetable/[year]/TeacherGroupsTab.tsx:519-529` (`set-times` หลัง UI อัปเดตเวลาแล้ว ปิด modal :503) และ `:765-777` (`set-times` ใน `Promise.all` แล้วเปิดสรุปสำเร็จ `setCreatedGroupsSummary`) · **loader ที่เงียบเมื่อ 403 (อ่านแล้ว):** `_components/timetable-year-list-page.tsx:57-71` · `TeacherGroupsTab.tsx:152-163, 166-268` · `MainTeachingGradeTab.tsx:369-378, 440-449` · `subject-settings/[year]/page.tsx:180-191, 198-217` · `settings/[year]/page.tsx:163-175` · `create-class-period/[year]/page.tsx:83-94` · `manage-teaching-schedule/page.tsx:117-139` (`/api/setting/get` — 403 เงียบแล้ว `.finally` ตั้ง `settingsLoaded=true` :139 → gate ของ Regenerate (:109-112) ปล่อยให้รันด้วยค่าตั้งเริ่มต้น `false`/0 แทนค่าจริงของโรงเรียนโดยไม่แจ้ง) · **จาก grep `.catch(() => {})` ยังไม่ได้อ่านทีละจุด:** `MainTeachingGradeTab.tsx:61, 79, 103` · `[year]/page.tsx:121` · `use-timetable-generation.ts:96, 146` · `use-select-curriculum.ts:52, 104, 109` · `settings/[year]/page.tsx:225` · `create-class-period/[year]/page.tsx:48, 77` (2 จุดหลังมี 403 toast แล้วที่ :37-40, :60-63) · `manage-teaching-schedule/page.tsx:582, 874, 923, 1340` · ตรงกับ RV-8 ของ reviewer (non-blocking ในมุม review) แต่ QA จัดเป็น**บล็อก AC-063** · **QA R1 พลาดชุดนี้** (R1 ตรวจเฉพาะ call ตรง ไม่ได้ตรวจ 403 ของ 53 call ที่ผ่าน wrapper) · ไม่ใช่ regression — มีมาตั้งแต่ Phase 3 · ตัวอย่างที่ถูกต้องในโค้ดเดียวกัน: `[year]/page.tsx:96-97`, `create-class-period/[year]/page.tsx:37-40` | **resolved R3 (QA อ่านโค้ดเอง + vitest caller-run)** — grep `timetableFetch(` ทั้ง `src/` = 62 hit = นิยาม `authHeaders.ts:37` + **61 call site** · QA อ่านการจัดการทุกจุด: loader ผ่าน `readJsonOrNotify`/ตรวจ `res.ok` + `.catch` ที่ toast ทุก chain · write ตรวจ `!res.ok` แล้ว rollback/toast/Alert · opt-out ที่เดียว `useTimetableMenuPermissions.ts:106` (BR-89) · `set-times` modal `TeacherGroupsTab.tsx:500-562` rollback + toast id เดียว · wizard `:798-842` ไม่แสดงสรุปสำเร็จเมื่อ group ใดล้ม + rollback เฉพาะ group ที่ล้ม + ปิด wizard · settings gate `manage-teaching-schedule/page.tsx:120-159` fail closed · grep `.catch(() => {}\|null)`/`catch {}` ใน 7 routes ไม่เหลือจุดที่กลืน fetch · **backend ยืนยัน: โรงเรียนใหม่ไม่ค้าง** (ดู Per-Task Results) |
| RV-5 | 5 | blocking (review) | frontend-engineer | `LinkSubjectsModal.tsx` 4 call ตรง | **closed — QA ยืนยัน R2:** `:172-213` ผ่าน `loadJson` → `timetableFetch(url, { headers })` ค่าเริ่มต้น · 401 → ไม่ toast (SessionExpired จาก wrapper) · 403/อื่น → toast id เดียว · ไม่มี `fetch(` ตรงในไฟล์ |
| RV-6 | 5 | blocking (review) | frontend-engineer | `TimetableGrid.tsx` call ตรง `/api/class-period/get` | **closed — QA ยืนยัน R2:** `:462-477` `timetableFetch` ค่าเริ่มต้น + Bearer + `signal` คงไว้ · 403 → toast id เดียว (ข้ามเมื่อ abort) · 401 → ไม่ toast |
| RV-8 | 5 | non-blocking (review) | frontend-engineer | `set-times` + loader ไม่ตรวจ `res.ok` | ยกระดับเป็น **FIND-P5-04** (บล็อก AC-063 ในมุม QA) · **closed R3** พร้อม FIND-P5-04 (reviewer R4 resolved + QA ยืนยัน) |
| RV-10 | 5 | non-blocking | system-analyst | 401 แสดงทั้ง SessionExpired และ toast "Request failed: 401" ที่ `add-class-period-modal.tsx:191-197`, `create-class-period-form.tsx:259, 287, 477-485` ขณะที่จุดอื่นไม่ toast เมื่อ 401 | open — §43.2 ไม่ได้กำหนด · R3: Alert `saveError` ของ `subject-settings`/`settings` ก็แสดงคู่กับ SessionExpired เมื่อ 401 (แบบเดียวกัน) → **SA-P5-Q1** · **resolved Phase 7 R1 (2026-10-02, QA อ่านยืนยัน)** — SA ตัดสิน design Rev 17 §43.2b ข้อ 1 / AC-066 → FE-018: ทุกจุดที่ระบุ + จุดอื่นของ 7 routes ไม่ toast/Alert/`saveError` เมื่อ 401 (`add-class-period-modal.tsx:192`, `create-class-period-form.tsx:259, :288, :479`, `settings :289`, `subject-settings :276, :366, :391, :440, :461, :480, :502, :521`) |

## Change Log entries — moved verbatim from `qa.md` 2026-10-04

- 2026-10-01 — Phase 5 R1 (BE-006, BE-007, FE-017, FE-010 + ตรวจ AC-063 ของ FE-001 ซ้ำ) — ⚠️ Partial (FULL) · หลักฐานรันเป็น caller-run (dotnet test 42/42, vitest 272/272, tsc/eslint Phase-5/build exit 0) — QA ไม่ได้รันซ้ำเพราะ `sta context`/gate/shell ถูกปฏิเสธสิทธิ์ · TP-D1: `AuthTests` ไม่มีจริง · TP-D2/SA-Q14 ยังไม่มี · RV-3 closed · เพิ่ม FIND-P5-01 (Important — FE-001 call ตรง 7 จุด), FIND-P5-02 (Minor), FIND-P5-03 (Minor, race AuthContext ที่ผู้เรียกแจ้ง), RV-1/RV-2/RV-4 ลง Open Issues, HUMAN-P5-R1 · `plan.md` FE-017/FE-010 → `verified`, BE-006/BE-007 → `blocked`, FE-001 `verified` → `blocked` · Phase 4 R4 ย้ายไป `qa/phase-4.md` · 🔒 Phase 5 คงเปิด · วันที่ 2026-10-01 จากผู้เรียก
- 2026-10-01 — Phase 5 R2 (TARGETED: FE-001 / AC-063 / DES-018 §43.2) — ❌ Failed (TARGETED) · FIND-P5-01 resolved · RV-5/RV-6 closed (QA ยืนยัน) · เพิ่ม FIND-P5-04 (Important: 403 เงียบใน call ที่ผ่าน wrapper, write `set-times` แสดงสำเร็จ, R1 พลาด) · RV-8 ยกระดับเป็น FIND-P5-04 · RV-7/RV-9/RV-10/RV-11 ลง Open Issues (RV-11 → SA) · หลักฐานรันมาจากผู้เรียก (vitest 300/300, tsc/build exit 0, eslint 0 error/9 warning, dotnet test 42/42) QA ไม่ได้รันซ้ำเพราะ `sta context` ถูกปฏิเสธสิทธิ์ · `plan.md` ไม่เปลี่ยน (FE-001 คง `blocked`) · R1 ย้ายไป `qa/phase-5.md` · 🔒 Phase 3/5 คงเปิด · วันที่ 2026-10-01 จากผู้เรียก
- 2026-10-01 — Phase 5 R3 (TARGETED: FE-001 / AC-063 / DES-018 §43.2) — ✅ Verified (TARGETED) · FIND-P5-04 resolved + RV-8 closed (QA grep ซ้ำ 61 call site + อ่านทุกจุด) · อ่าน backend `Setting/Get` (read-only): ไม่มีแถว → 200 `{status:1}` ⇒ ไม่มี regression ที่โรงเรียนใหม่ · RV-12..RV-15 ลง Open Issues (QA อ่านยืนยัน) · เพิ่ม SA-P5-Q1 (RV-10 + RV-11 + RV-12 → SA) · หลักฐานรันมาจากผู้เรียก (vitest 313/313, tsc/build exit 0, eslint helper+tests ไม่มี error, dotnet test 42/42) QA ไม่ได้รันซ้ำเพราะ `sta context` ถูกปฏิเสธสิทธิ์ · `plan.md` FE-001 `blocked` → `verified` · BE-006/BE-007 ไม่แตะ · R2 ย้ายไป `qa/phase-5.md` · 🔒 Phase 3/5 คงเปิด · วันที่ 2026-10-01 จากผู้เรียก
- 2026-10-02 — บันทึกคำตัดสินของคน (ไม่ใช่รอบตรวจ ไม่ได้ตรวจซ้ำ ไม่เขียน Target): HUMAN-P5-R1 ส่วน BE-006/BE-007 → resolved with user decision "ยอมรับ ไปต่อได้" · `plan.md` BE-006/BE-007 `blocked` → `verified` บนหลักฐาน R1 พร้อมช่องว่าง · เพิ่มประตู deploy ของ Phase 5 (TP-D1, TP-D2, RV-4) ใน Unverified Behaviour · RV-2 เพิ่มหมายเหตุ OQ-39 (answered 2026-10-02) คงเปิดที่ SA · RV-1/RV-4 คงเปิด · 🔒 Phase 3/5 คงเปิด — ไม่ใช่ security sign-off · `sta context` ถูกปฏิเสธสิทธิ์ · วันที่ 2026-10-02 จากผู้ใช้

## Phase 5 — Round 4 (BE-008) — archived verbatim from `qa.md` 2026-10-04 (superseded by Phase 5 R5 BE-009; Open Issues and Unverified Behaviour stay live in `qa.md`)

## Round 4 — Phase 5 — BE-008 (TARGETED · 2026-10-04)

**Status:** ✅ Verified

ขอบเขต: BE-008 เท่านั้น (AC-072, AC-071, regression AC-062/AC-064 · DES-018 BR-74 (ข) / BR-76 (ก) · DES-022 BR-88) · reviewer Round 8 ✅ Approved · BE-009, FE-019, FE-020, Phase 6 ไม่อยู่ในรอบนี้ · โค้ดที่ตรวจ = `sb-api-academic-timetable-ai` HEAD `0beb200` (commit "ACA-5111", 2026-10-03 โดยผู้ใช้) · `git status` ว่าง (worktree ตรง HEAD) · QA ไม่แก้โค้ด ไม่รัน git ที่เปลี่ยนสถานะ · วันที่ 2026-10-04 จากผู้ใช้

### Checks run

| Check | Command | Result |
|---|---|---|
| typecheck | (C# — รวมใน build) | pass — 0 error |
| lint | — | not run (ไม่มีคำสั่ง lint ของ backend ใน `CLAUDE.md`) |
| build | `dotnet build AITimeTableBackend.sln` | **pass** — `0 Error(s)`, `69 Warning(s)` (CS8618/CS0168/CS0169/CS0618 เดิม) · QA รันเอง |
| test | `dotnet test AITimeTableBackend.sln` | **pass** — `Passed! - Failed: 0, Passed: 109, Skipped: 0, Total: 109` (net10.0) · QA รันเอง · ต่อคลาส: `SchoolPredicateResolverTests` 35 · `SchoolPredicateFilterTests` 16 · `SchoolPredicateIntegrationTests` 16 · `ResolverTests` 15 · `IntegrationTests` 17 · `FilterTests` 10 |

restore แสดง NU1903/NU1904 (`System.Linq.Dynamic.Core` 1.2.20 critical/high, `Newtonsoft.Json` 10.0.3 high) — มีมาก่อน ไม่ใช่ของ BE-008 → Issues Found (Minor → backlog)

### Per-Task Results

- **BE-008** — ✅ Verified — `TimetableMenuPermissionResolver.cs:159-177`: predicate เดียว `IsSchoolEligible(SchoolFlags?)` (:163-164) = พบแถว **และ** `IsActive != false` **และ** `CDel != true` · ผู้เรียกเดียวคือ `SchoolPassesAsync` (:176) ที่ทั้งเส้น admin (:68) และเส้นผู้ใช้ (:93) เรียก (grep `SchoolPasses|IsSchoolEligible|TCompany` ทั้ง `AITimeTableBackend/` → มีที่ resolver + `MasterDataContext.cs:28` เท่านั้น) · เส้นผู้ใช้ตรวจโรงเรียน (:93) **ก่อน** query `TGroupPermissionUser` (:113-116) · ไม่ผ่าน → `HasUserGroup=false` + 5 MenuID false (:95-109) = การตัดสิน ไม่ throw · lookup ล้ม → exception ออกจาก resolver → `catch` ของ filter (`TimetableAuthorizationFilter.cs:205-209`) และ `MenuPermissions/Get` (`WebAPIController.cs:2861-2865`) → 403 `{status:-1, message:"Forbidden"}` · query เลือกเฉพาะ `isActive`/`cDel` (:172-175 — RV-19) · Do-not-modify: filter/policy/handler/`ITimetableMenuPermissionResolver`/`FilterTests`/`IntegrationTests`/`TestSupport` mtime 2026-09-29..10-01 (ก่อนงาน BE-008) · lookup กลุ่ม (:114) ไม่เปลี่ยน · ไม่มี DDL · `plan.md` `pending` → **`verified`**
- **AC-072** — ✅ Verified — U: `D1_User_InactiveSchool…`, `D2_User_DeletedSchool…`, `D3_User_SchoolNotFoundInRegister_NoPermission_NotLookupFailure` (test ของตัวเอง — OQ-41 = A), `A6_…` · filter (resolver จริง): `User_SchoolInactiveDeletedMissing_403_NoNext` × `GetYears`/`GetTimetable`/`SetTimetable`/`SetSetting` (action เดียวกันผ่านใน `User_NullSchoolFlags_Pass_NextCalled` → 403 ไม่ได้มาจาก action ที่ไม่มีใน policy) · I (host จริง + resolver จริง): `D1D2_…_403_And_MenusAllFalse`, `D3_…_403_And_Menus200AllFalse` → `School/{id}/Years` 403 body `Forbidden` + `MenuPermissions/Get` 200 `status:1` ครบและเฉพาะ 401/402/403/404/422 false/false (`SchoolPredicateTests.cs:491-515`) · null (OQ-39): `D5toD7_User_NullSchoolFlags_Pass` (U), `User_NullSchoolFlags_Pass_NextCalled` (filter), `D5toD7_…_MenusAllTrue` (I), เส้น admin `D14_Admin_NullSchoolFlags_Pass` (U) · predicate จุดเดียวเชิงพฤติกรรม: `D15_SameSchoolOutcome_OnBothPaths` 10 กรณี ({ไม่พบ} + {true,false,null}²)
- **AC-071** — ✅ Verified — U: `D8D9_Admin_InactiveOrDeleted_NoPermission`, `D10D11_Admin_NullActiveOrDel_Pass` (3 กรณี), `D12_Admin_IsActiveColumnNotRead` (`IsActive` false/null → ยังผ่าน) + `ResolverTests.InvalidAdmin_Br76_NotValid_AllFalse` 6 กรณี · filter: `Admin_InactiveOrDeletedAdmin_403_NullAdminPasses` × 4 action · I: `D8D9_…_403_And_MenusAllFalse`, `D10D11_…_MenusAllTrue`, `D13_Admin_OfInactiveSchool…` · grep `IsActive` ใน `AITimeTableBackend/Security` → เฉพาะ `TGroupPermissionUser`/`TGroupPermissionMenu` (:114, :138) — ไม่มีการอ่าน `TAdmin.IsActive`
- **AC-062 / AC-064 (regression)** — ✅ Verified — lookup ล้ม → 403 ทั้งสองแบบ: `D4_User_…`/`D4_Admin_…` (U — `TimeoutException` ถึงผู้เรียก แยกจาก D3), `SchoolLookupThrows_403_BothPaths` (filter), `D4_SchoolLookupThrows_403_OnCheckingEndpoint_And_MenuPermissionsGet` (I) · BR-73 ก่อนเงื่อนไขโรงเรียน: `SchoolMismatch_StillRejectedBeforeSchoolCondition` · SA-Q23 (ปิด) regression: `D16`/`D17`/`D18` ทั้ง U และ I · **S1-A/S1-B ของ BE-007 รันซ้ำหลัง BE-008:** `FilterTests` 10/10 + `IntegrationTests` 17/17 ผ่าน (ใช้ `FakePermissionResolver` — โค้ด filter/endpoint ไม่เปลี่ยน) · บน resolver จริงที่โรงเรียน active: U0 `NoGroupRow…` (มี `ActiveSchool` แล้ว — RV-20), U1 `GroupWithoutModuleMenus…`, U2/U3 `ReadAndWriteRows…`, U4 `ValidAdmin…`, U5 `InvalidAdmin_Br76…`, `IsActive=false`/`IsDel` `InactiveOrDeleted…`/`InactiveMenuRow_Ignored`, lookup ล้ม `LookupFailure_Throws…` — assertion เดิมไม่ลด (อ่าน `ResolverTests.cs:34-183` — เพิ่มเฉพาะ `ActiveSchool(db)`) · **ผลที่เปลี่ยนตามเจตนา:** ผู้ใช้ทั่วไปของโรงเรียนไม่ active/ถูกลบ/ไม่พบ ได้ S1-A = 403 ทุกช่อง และ S1-B = 200 + false (ไม่ใช่ U2/U3 เดิม) — ตรง AC-072 และ OQ-40 (รับทราบแล้ว 2026-10-02)
- **RV-19** — ✅ Verified (resolved) — `:172-175` select เฉพาะ `SchoolFlags(c.isActive, c.cDel)` · `single_authen`/`double_authen` (`TCompany.cs:18, :20` ยัง `bool`) ไม่ถูก materialize · code note :168-171 · พิสูจน์บน Npgsql จริงไม่ได้ → Unverified
- **RV-20** — ✅ Verified (resolved) — `ResolverTests.cs:38` `ActiveSchool(db)` · assertion :42-45 เดิม
- **RV-2** — ✅ Verified (resolved, ย้ายไป `qa/phase-5.md`) — สัญญาปิดด้วย OQ-39 + SA-Q23 (design Rev 19) · โค้ดตรง: admin :70-72, กลุ่ม :114 (`IsDel == null || IsDel == false` ≡ `IsDel != true`)
- **RV-1, RV-4** — ⚠️ Partial (open, BE-009) · **RV-21** — ⚠️ Partial (open, non-blocking, backlog)

### Data Model check

อ่าน `design.md` `## Data Model` (§27.1–§27.7) ครบ — §27.7 "DES-018 … **ไม่มี DDL**" · BE-008 แก้เฉพาะ mapping: `TCompany.isActive`/`cDel` `bool` → `bool?` (`TCompany.cs:24, :26`; diff ใน `0beb200`) ตาม AC-072 "null = ผ่าน" และ `school_db.sql` `BOOLEAN NULL` · `TAdmin.active`/`del`/`IsActive` `bool?` (`TAdmin.cs:14-16`) ตรง AC-071 · `MasterDataContext.OnModelCreating` ไม่มี config nullability ของ `TCompany` · ไม่มี DDL/migration → ตรงกับ design · nullability จริงของ master DB ไม่ได้ยืนยัน (D24) → Unverified

### Issues Found

- ไม่มี finding บล็อก · ไม่มี Critical
- Minor — `AITimeTableBackend.csproj`/`AITimeTableBackend.Tests.csproj` — backend-engineer/security — NU1904 `System.Linq.Dynamic.Core` 1.2.20 (critical), NU1903 `Newtonsoft.Json` 10.0.3 (high) จาก restore · มีมาก่อน ไม่ผูก AC ใน scope → **backlog** (แจ้ง `security` ในรอบ DES-018)
- Minor — `SchoolPredicateTests.cs` — backend-engineer — ชั้น I ใช้ `School/{id}/Years` เป็น endpoint ตรวจเมนูตัวเดียว (อีก 3 ตัวแทนอยู่ชั้น filter) · D4 ไม่ assert body ของ `MenuPermissions/Get` 403 · D16/D18 assert เฉพาะ `isRead` · D14 ไม่มีชั้น I → เติมได้พร้อม BE-009 (RV-4) → **backlog**
- RV-21 (non-blocking) → **backlog**

## Closed Open Issues — moved verbatim from `qa.md` 2026-10-04 (Phase 5 R5, BE-009)

| ID | Phase | Severity | Owner | Summary | State |
|---|---|---|---|---|---|
| RV-1 | 5 | non-blocking | backend-engineer | cache ต่อ request ของ resolver (`TimetableMenuPermissionResolver.cs:47-50`) ไม่ผูกกับ `(schoolId, userId, adminId)` | open — QA ยืนยัน: วันนี้ทุก request เรียก resolver ครั้งเดียว (filter ข้าม resolver เมื่อเป็น authenticated-only `TimetableAuthorizationFilter.cs:157-161`) จึงยังถูก · Phase 5 R4 (2026-10-04): ยังไม่แก้ — cache อยู่ที่ `TimetableMenuPermissionResolver.cs:18, :48-51` (@`0beb200`) · งานของ **BE-009** · **Phase 5 R5 (2026-10-04): resolved โดย BE-009 — QA verified (`qa.md` Round 5), ย้ายมา archive** |
| RV-4 | 5 | non-blocking | backend-engineer | integration host แทน resolver จริงด้วย `FakePermissionResolver` singleton (`IntegrationTests.cs:33-38`) และ `MenuPermissions_ValidAdmin_AllTrue` (`:174-181`) ป้อน `Grants(...)` (`IsAdmin=false`) | open — QA ยืนยัน: ไม่มีกรณี in-process ที่ใช้ resolver จริง และชั้น integration ไม่ทดสอบเส้น admin ที่ผ่าน BR-76 · Phase 5 R4 (2026-10-04): **แก้บางส่วนโดย BE-008** — `SchoolPredicateTests.cs:443-472` `RealResolverApiFactory` ใช้ resolver จริง (เปลี่ยนเฉพาะ master DB) และรันเส้น admin D8–D11, D13 ผ่าน host จริง (QA รันผ่าน) · ที่เหลือของ **BE-009**: เมทริกซ์ S1-C ต่อ MenuID และ input `Grants(...)` ของ `MenuPermissions_ValidAdmin_AllTrue` (`IntegrationTests.cs:174`) ที่ยังไม่เปลี่ยน · **Phase 5 R5 (2026-10-04): resolved โดย BE-009 — QA verified (`qa.md` Round 5), ย้ายมา archive** |

## Round 5 — Phase 5 — BE-009 (TARGETED · 2026-10-04)

**Status:** ✅ Verified

ขอบเขต: BE-009 เท่านั้น (RV-1, RV-4 · AC-062/AC-064 regression, AC-071/AC-072 coverage · DES-018 BR-74/BR-76, DES-022 BR-88) · reviewer Round 9 ✅ Approved · FE-019, FE-020, Phase 6 ไม่อยู่ในรอบนี้ · โค้ดที่ตรวจ = HEAD `0beb200` + worktree (`git status --short`: `M AITimeTableBackend.Tests/IntegrationTests.cs`, `M AITimeTableBackend/Security/TimetableMenuPermissionResolver.cs`, `?? AITimeTableBackend.Tests/Be009Tests.cs`) · QA ไม่แก้โค้ด ไม่รัน git ที่เปลี่ยนสถานะ · วันที่ 2026-10-04 จากผู้ใช้

### Checks run

| Check | Command | Result |
|---|---|---|
| typecheck | (C# — รวมใน build) | pass — 0 error |
| lint | — | not run (ไม่มีคำสั่ง lint ของ backend ใน `CLAUDE.md`) |
| build | `dotnet build AITimeTableBackend.sln` | **pass** — `0 Error(s)`, `10 Warning(s)` (NU1903/NU1904 เดิมทั้งหมด; build แบบ incremental) · QA รันเอง |
| test | `dotnet test AITimeTableBackend.sln` | **pass** — `Total tests: 138 · Passed: 138` · QA รันเอง · ต่อคลาส: ชุดเดิม `SchoolPredicateResolverTests` 35 · `SchoolPredicateFilterTests` 16 · `SchoolPredicateIntegrationTests` 16 · `ResolverTests` 15 · `IntegrationTests` 17 · `FilterTests` 10 (= 109 เท่ากับ R4) · ใหม่ `ResolverCacheIdentityTests` 5 · `S1cRealResolverFilterTests` 12 · `S1cRealResolverApiTests` 12 (= 29) · บรรทัด "Failed to determine the https port for redirect." ×3 = log ของ host ทดสอบ ไม่ใช่ test ล้ม |
| diff | `git diff --stat 0beb200` | เฉพาะ `IntegrationTests.cs` (+5/−1) และ `TimetableMenuPermissionResolver.cs` (+18/−15) · `Be009Tests.cs` untracked · ไม่มีไฟล์ test อื่น/`Models/` เปลี่ยน |
| QA probe (นอก repo) | สำเนา repo ใน scratchpad ของ QA + `QaProbeTests.cs` · `dotnet test --filter QaProbe` | `Passed! - Failed: 0, Passed: 4` — admin ผ่าน → admin `active=false` / `del=true` / ทั้งคู่ ใน resolver เดียว และลำดับกลับ · admin ไม่ active → ผู้ใช้ทั่วไปคน/โรงเรียนเดียวกันได้ผลของตัวเอง · `adminId` `null` กับ `""` ได้ instance เดียวกัน · **ไม่ใช่ test ของ repo** (RV-22 ยังเป็นงาน backlog) |

### Per-Task Results

- **BE-009** — ✅ Verified — การเปลี่ยน production มีเพียง key ของ cache + แยก `ResolveUncachedAsync` (`git diff 0beb200`) · `plan.md` `pending` → **`verified`**
- **RV-1** — ✅ Verified (resolved) — `TimetableMenuPermissionResolver.cs:20` `Dictionary<(SchoolId, UserId, AdminId), …>` · key `:50` รวม `null`/`""` ตรงกับ `IsNullOrEmpty` ที่ `:74` · exception ไม่ถูก cache (`:56-57` เก็บหลัง await สำเร็จ) → lookup ล้มยังถึง `catch` VR-20 → 403 · overload `ClaimsPrincipal` (`:30-46`) delegate ไปตัวที่มี key · resolver `AddScoped` (`Startup.cs:87`) = cache ต่อ request (BR-74) · S13-D (1)–(5): `PassingIdentity_ThenSchoolNotInRegister`, `FailingIdentity_ThenPassingIdentity`, `ActiveAdmin_ThenUserWithoutRows`, `SameUserId_DifferentSchool` (`Be009Tests.cs:38-103`), `SameIdentity_TwiceReturnsSameInstance` (:105-116) + `ResolverTests.PerRequestCache_SecondCallDoesNotRequery` — ผ่าน
- **RV-4** — ✅ Verified (resolved) — S1-C บน resolver จริง + filter จริง ครบ 5 MenuID × `W`/`R` (`Be009Tests.cs:167-201`, 10 กรณีผ่าน) เทียบ `isRead`/`isWrite` กับการตัดสินของ filter บน action ตัวแทน + ค่าสัมบูรณ์ · กรณีลบ "402 เท่านั้น → `Setting/Get` 403, `isRead(403)=false`" ทั้ง in-process (:203-215) และ HTTP (:298-308 — 403 จริง) · `MenuPermissions/Get` ผ่าน HTTP บน `RealResolverApiFactory` ต่อผู้ใช้เมนูเดียว 10 กรณี (:272-296) · admin บน resolver จริง (:217-232, :310-321) · `MenuPermissions_ValidAdmin_AllTrue` — `git diff` ยืนยันว่าเปลี่ยนเฉพาะ input (`IsAdmin=true`, `IsAdminValid=true`; `IntegrationTests.cs:177-181`) assertion เดิม
- **AC-062 (regression)** — ✅ Verified — 109 test เดิมผ่านโดยไฟล์ test เดิมไม่เปลี่ยน (ยกเว้น input ข้างบน) = S1-A/S1-B ของ BE-006/BE-007 + ชุด BE-008 · ข้อ cache สอง identity ใน scope เดียว → RV-1 ข้างบน
- **AC-064 (ส่วน API)** — ✅ Verified — ดู RV-4 · admin ผ่าน BR-76 → true ทุกตัวในชั้น integration (`ValidAdmin_RealResolver_MenusAllTrue`)
- **AC-071 (coverage)** — ✅ Verified — integration บน resolver จริงอ้าง test ของ BE-008 (`SchoolPredicateIntegrationTests` D8D9/D10D11/D13 — 16/16 ผ่าน; plan อนุญาตให้อ้าง) · ข้อ cache สลับ admin ผ่าน/ไม่ผ่าน: **ไม่มี test ใน repo** (RV-22) → QA probe 4/4 ผ่าน + อ่าน key `:50`
- **AC-072 (coverage)** — ✅ Verified — integration: D1D2/D3 ของ BE-008 · cache สลับผ่าน/ไม่ผ่าน ทั้งสองทิศ + โรงเรียนไม่ active (`Be009Tests.cs:38-103`)
- **RV-23** — ✅ Verified (resolved) — `git diff 0beb200 -- AITimeTableBackend/Models/TCompany.cs` ว่าง และไม่อยู่ใน `git status` → **BE-009 ไม่ได้แตะ `TCompany.cs`** · ใน `0beb200` เองมี `isActive` :24 / `cDel` :26 `bool?` (`git show 0beb200`: `bool` → `bool?` ของ BE-008) ตรงกับที่ QA R4 อ้าง → ความหมายไม่เปลี่ยน · การเลื่อนบรรทัด/mtime ที่ reviewer เห็นเกิดก่อน commit
- **RV-22** — ⚠️ open (non-blocking) → backlog · **RV-21** — open (non-blocking, ไม่แตะ — ตอนนี้ `:76-77`) → backlog

### Data Model check

`git diff 0beb200` ไม่แตะ `Models/` หรือ `MasterDataContext` · §27.7 DES-018 ไม่มี DDL → ไม่มีอะไรต้องเทียบเพิ่มจาก R4 (การเทียบ `TCompany`/`TAdmin` ทีละ field อยู่ใน R4 — `qa/phase-5.md`)

### Issues Found

- ไม่มี finding บล็อก · ไม่มี Critical
- RV-22 (non-blocking) — backend-engineer — เพิ่ม `[Fact]` สลับ admin ผ่าน ↔ admin ไม่ active/ถูกลบ ใน `ResolverCacheIdentityTests` (QA probe ทำแบบเดียวกันแล้วผ่าน) → **backlog**
- Minor — `Be009Tests.cs:136-152` — backend-engineer — การเทียบ filter ต่อหน้าขับ filter ด้วย `ActionExecutingContext` สร้างมือ ไม่ผ่าน HTTP routing (ยกเว้นกรณีลบ 402) — reviewer ยอมรับ → **backlog** (ใน Unverified)
- NU1903/NU1904 ยังอยู่ (มีมาก่อน) → backlog เดิม


## ประวัติข้อกำหนดเอกสารที่ยกเลิก — 2026-10-05

ข้อความต่อไปนี้เป็นประวัติเดิมเท่านั้น; ผู้ใช้ยกเลิกเพดานขนาดเอกสารแล้ว 2026-10-05

### qa.md — Change Log เดิม

- 2026-10-04 — Phase 5 R5 (TARGETED: BE-009 · RV-1, RV-4 · AC-062/AC-064 regression, AC-071/AC-072 coverage) — ✅ Verified · QA รันเอง: `dotnet build` 0 error/10 warning, `dotnet test` 138/138 (109 เดิม + 29 ใหม่) · `git diff 0beb200`: เฉพาะ resolver + `IntegrationTests.cs` (input เท่านั้น) + `Be009Tests.cs` ใหม่ · RV-1/RV-4 resolved (ย้ายไป `qa/phase-5.md`) · RV-23 resolved (`TCompany.cs` ไม่ถูกแตะ — diff ว่าง) · เพิ่ม RV-22 (non-blocking → backlog; QA probe นอก repo 4/4 ผ่าน) · R4 ย้าย verbatim ไป `qa/phase-5.md` · `plan.md` BE-009 `pending` → `verified` · 🔒 SEC-GATE-P5 คงเปิด — ไม่ใช่ security sign-off · `qa.md` ยังเกิน budget 30 KB (ส่วนที่เหลือเป็น Open Issues + Unverified ของเฟสที่ยังไม่ deploy) · วันที่ 2026-10-04 จากผู้ใช้
