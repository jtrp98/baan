# timetableai — Review Round 10 — FE-021

> Budget ≤ 10 KB (`policies\documentation.md` §4) · reviewer · หลัง fix1 · รอบ 8 คงเดิม verbatim; รอบ 9 เป็น remediation:SEC-03 ไม่ใช่รอบแก้ FE-021

## Findings

### REV-006

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/[year]/page.tsx:105`
- **Problem:** ปัญหา status -1 เงียบจากรอบ 8 แก้แล้ว: ใช้ settleRequiredLoad ตรวจ status/array และ notifyRequestError เมื่อ request ล้ม
- **Reference:** AC-067 · DES-018 §43.2b ข้อ 2/4(a)
- **Disposition:** resolved หลังอ่านโค้ด :96–131 และ helper :17–40

### REV-007

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/lib/timetable-request-failure.ts:43`
- **Problem:** substring ของข้อความ localize จากรอบ 8 แก้แล้ว: match literals ทั้งไทย/อังกฤษตรง Messages.cs:39–40; helper เรียก onTermRejected และ list ล้าง selectedTerm
- **Reference:** DES-009 §34.4 VR-8/VR-9 · UX-007 approved failure behavior
- **Disposition:** resolved; หลักฐาน `timetable-required-load.ts:35`, `[year]/page.tsx:110`

### REV-008

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/subject-settings/[year]/page.tsx:208`
- **Problem:** required load ที่ status 0/-1 เงียบจากรอบ 8 แก้แล้ว: subject-settings, class-period, teacher-groups และ assignment ใช้ settleRequiredLoad; ล้างข้อมูล/ไม่เปิด write gate เมื่อโหลดไม่สำเร็จ; stale result ไม่เปิด gate ของบริบทใหม่
- **Reference:** AC-067/AC-068 · DES-018 §43.2b ข้อ 2/3/4
- **Disposition:** resolved; เพิ่มหลักฐาน `create-class-period/[year]/page.tsx:61–84,199`, `manage-timetable/[year]/teacher-groups-tab.tsx:210–218,354`, `main-teaching-grade-tab.tsx:108–113,157`

### REV-009

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/settings/[year]/page.tsx:496`
- **Problem:** dirty dialog ที่ไม่ได้ wire จากรอบ 8 แก้แล้ว: settings ตรวจ snapshot/modal/isSaving; subject-settings และ class-period ตรวจ draft modal; manage-timetable รับ dirty จากทั้งสอง tab; confirm เปลี่ยน context/reset ส่วน cancel ไม่เปลี่ยน selection/draft
- **Reference:** DES-009 §34.2a · UX-007 approved dirty behavior
- **Disposition:** resolved; หลักฐาน subject-settings:202,888; class-period:192,219; manage-timetable:92,128–131; context-bar:57–65,94–119; hook:107–128. หน้ารายการไม่มี editable form ค้าง; การเลือกใหม่ล้าง delete target (:238)

### REV-015

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx:1626`
- **Problem:** workspace ค้าง spinner เมื่อ required load ล้มก่อนมีกริด: เปิด restore โดย bridge ไม่มี sTermID → :1009–1013 ตั้ง failed flags/ปิด isRestoringSchedule แต่ settingsLoaded/linkSubjectSettingsLoaded ยัง false; หรือ class-period/get ได้ status 0/-1 → :1439–1443 ปิด restore แต่ไม่มี pendingMount/levelClasses. ทั้งสองเส้นทางยังเข้า `!isScheduleDataReady && levelClasses.length === 0` ที่ :1626 จึงแสดง loading ต่อไปทั้งที่ failure จบแล้ว. ต้องออกจาก loading ตาม failed state โดยคง Generate/Save ปิดและใช้ failure surface เดิม. Test `tests/integration/timetable-403-visible.test.tsx:286–297` ยังยืนยัน loading หลัง setting failure ซึ่งขัด oracle เดียวกัน; term-context test :298–310 ตรวจเพียง notice/request ไม่ตรวจว่า spinner หาย
- **Reference:** REQ-021 AC-067 (ห้ามค้าง loading; restore failure = header + toast), AC-068 · DES-018 §43.2b 4(a),5.4 · FE-021 Scope required-load fail-closed
- **Owner:** frontend-engineer

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-006 | Important | `[year]/page.tsx:105` | frontend-engineer | resolved |
| REV-007 | Important | `src/lib/timetable-request-failure.ts:43` | frontend-engineer | resolved |
| REV-008 | Important | `subject-settings/[year]/page.tsx:208` | frontend-engineer | resolved |
| REV-009 | Important | `settings/[year]/page.tsx:496` | frontend-engineer | resolved |
| REV-010 | Minor | `round-8.md` → `timetable/page.tsx:71` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-011 | Minor | `round-8.md` → `create-class-period-form.tsx:223` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-012 | Minor | `round-8.md` → `timetable-grid.tsx:459` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-013 | Minor | `round-8.md` → `settings/[year]/page.tsx:745` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-014 | Minor | `round-8.md` → `uxui/UX-007-term-context.md:3` (หลักฐานรอบเดิม) | uxui-designer | → backlog |
| REV-015 | Important | `manage-teaching-schedule/page.tsx:1626` | frontend-engineer | open |

## Round 10

**Verdict:** FAIL

| Task | Verdict |
|---|---|
| FE-021 | FAIL |

- REV-006..009 resolved; ยังมี REV-015 Important. ส่ง frontend-engineer แก้ก่อน reviewer/QA รอบถัดไป; นี่คือ review หลัง fix1 ของ FE-021 ไม่รวมรอบงานอื่น
- URL opaque/คง query อื่น, school/year cache, singleton/preselect และ stale Terms guard ตรง DES-009 §34.2a จาก source; workspace bridge/read-only คงเดิม. Actual backend ตรวจ VR-8/VR-9 และ S1 รวม NULL
- REV-010..014 คง backlog จากรอบ 8 ไม่เปิด task เพิ่ม/ไม่ยืนยันว่าทุกส่วนแก้แล้ว. UX-007 มี partial human approval จริง; full artifact ยัง draft. precise copy, unsigned controls/UX-005 ไม่เป็น blocker ของ approved subset
- ข้อจำกัด: static review เท่านั้น; ไม่รัน tests/typecheck/lint/build/browser/manual-E2E; ไม่อ้าง test PASS. ไม่อ่าน QA/security/implementer logs. ไม่ตรวจ deploy/DDL/schema ใหม่/ไฟล์นอก brief. AC-065 ต้องตรวจ cutover คู่ BE-010 ในขั้น QA/deploy

## Reviewed

- Pack: `AGENTS.md`, `CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/README.md`, `coding.md` §4–6, `documentation.md` §1–5, `templates/review-round.md`; School Bright `SKILL.md`
- Docs: module `index.md`; `plan/index.md` Release Scope/Waiting on Human/FE-021 + `fe-021.md`; `requirement/index.md`, `req-012.md`, `req-021.md` AC-066..070; `design/index.md`, `des-009.md`, `des-018.md` §43.2b, `data-model.md` term/provenance sections; `uxui/README.md`, `UX-007-term-context.md`; `review/index.md`, `round-8.md`
- Frontend root = `C:/src/schoolbright/target/sb-tech-upgrade-web-system`. Prefix `src/app/[locale]/timetable/`: `page.tsx`, `[year]/page.tsx`, `settings/[year]/page.tsx`, `subject-settings/[year]/page.tsx`, `create-class-period/[year]/page.tsx`, `manage-timetable/[year]/page.tsx`, `manage-timetable/[year]/teacher-groups-tab.tsx`, `manage-timetable/[year]/main-teaching-grade-tab.tsx`, `manage-teaching-schedule/page.tsx`, `_hooks/use-timetable-terms.ts`, `_components/timetable-term-context-bar.tsx`
- Helpers: `src/lib/timetable-required-load.ts`, `src/lib/timetable-request-failure.ts`
- Test source (ไม่ได้รัน): `tests/integration/timetable-fe021-term-context.test.tsx`, `timetable-401-silent-subject-settings.test.tsx`, `timetable-401-silent-manage-timetable.test.tsx`, `timetable-403-visible.test.tsx`
- Backend read-only root = `C:/src/schoolbright/target/sb-api-academic-timetable-ai`: `AITimeTableBackend/Controllers/WebAPIController.cs` Terms/ValidateTerm/term-scoped reads; `Helpers/Messages.cs` term literals; `Models/Response.cs` field search

## Change Log

- 2026-10-09 — Round 10 หลัง FE-021 fix1 — FAIL; REV-006..009 resolved, REV-015 Important open; ไม่แก้ round8/code/plan

Back-links: `plan\index.md` · `..\index.md`
