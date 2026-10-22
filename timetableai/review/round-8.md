# timetableai — Review Round 8 — FE-021

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim (ไฟล์เก่า = archive) · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

### REV-006

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/[year]/page.tsx:118`
- **Problem:** list load จัดการเฉพาะ `json.status === 0` — backend exception ตอบ 200 + `status: -1` (`WebAPIController.cs:165,186`) หลุดไป guard `status === 1` (:130) แล้วเงียบ: ไม่มี toast รายการค้างว่าง ผู้ใช้เห็น "ยังไม่มีตารางในภาคเรียนนี้" แทนความล้มจริง
- **Reference:** DES-018 §43.2b ข้อ 2/4(a) (AC-067) · plan fe-021 Scope (กติกา 200 + `status !== 1` ของ FE-018/19)

### REV-007

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/[year]/page.tsx:119,122`
- **Problem:** ตรวจ VR-8/VR-9 ด้วย substring ของ message ที่ localize แล้ว — ข้อความจริงคือ "ภาคเรียนไม่อยู่ในปีการศึกษานี้"/"The term does not belong to this school year" (`Messages.cs:40`) และ "กรุณาระบุภาคเรียน (sTermID)"/"Term is required (sTermID)" (`Messages.cs:39`) โดย proxy เติม `sblanguage` จาก `NEXT_LOCALE` (`src/server/upstream/json-proxy.ts:161`) → สาขา VR-9 (:122) dead ทุก locale, สาขา VR-8 (:119) dead เมื่อ locale = en → เทอมที่ backend ปฏิเสธยังแสดงว่าเลือกอยู่ ไม่ล้าง + copy เฉพาะไม่เกิด
- **Reference:** UX-007 §ความผิดพลาดจากการส่งเทอม (VR-8/VR-9; artifact verified ตาม `plan\index.md:71`) · DES-009 §34.4

### REV-008

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/subject-settings/[year]/page.tsx:204`
- **Problem:** load ที่ FE-021 ผูก `sTermID` ใหม่ใช้ `readJsonOrNotify` + guard `json?.status === 1` — helper จัดการเฉพาะ HTTP ไม่ 2xx เท่านั้น `status: 0` (VR-8/VR-9 จาก BE-010) และ `-1` เงียบทุกจุด: subject-settings (required load ตาม §43.2b 3 — ข้อมูลเทอมเดิมค้างแสดงใต้แถบเทอมใหม่) · `create-class-period/[year]/page.tsx:62,85,104` · `manage-timetable/[year]/teacher-groups-tab.tsx:201-202` (guard `:208,:249`) · `main-teaching-grade-tab.tsx:96` (guard `:99`) — ควรใช้ `settleRequiredLoad` ของ FE-019 เหมือน `settings/[year]/page.tsx:220`
- **Reference:** DES-018 §43.2b ข้อ 2/4(a)/(d) (AC-067/AC-068) · plan fe-021 Scope

### REV-009

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/settings/[year]/page.tsx:475`
- **Problem:** dialog ยืนยันก่อนสลับเทอมเมื่อมีการแก้ไม่บันทึกไม่ถูก wire ที่หน้าใด — component รองรับแล้ว (`timetable-term-context-bar.tsx:24,87-93,203-217`) แต่ทั้ง 5 หน้า (`settings/[year]:475`, `subject-settings/[year]:858`, `create-class-period/[year]:204`, `manage-timetable/[year]:78`, `[year]:250`) ไม่ส่ง `hasUnsavedChanges` → สลับเทอมแล้ว form/section ที่แก้ค้างถูก overwrite เงียบ ๆ (settings :216-249, subject-settings :216-244)
- **Reference:** UX-007 §ผลของการเปลี่ยนเทอมต่อ state ของหน้า ("dialog ก่อนสลับ") · plan fe-021 Scope (UX ตาม UX-007)

### REV-010

- **Severity:** Minor
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/page.tsx:71`
- **Problem:** hub: 401 แล้ว `!res.ok` throw → `termsError` (:96) เป็นสถานะ error ที่สองเหนือ SessionExpired (ขัด §43.2b 1/AC-066 — hook กันไว้แล้วที่ use-timetable-terms.ts:75) · error state (:211-218) ไม่มีปุ่ม "ลองใหม่" และ empty (:202-209) ไม่มี "เลือกปีอื่น" ตาม States ของ UX-007 · years loader (:36-41) ใช้ raw fetch 401 เงียบเป็นลิสต์ว่าง (น่าจะ as-built เดิม — ยืนยันตอนแก้)
- **Reference:** DES-018 §43.2b ข้อ 1 (AC-066) · UX-007 §States, route 1

### REV-011

- **Severity:** Minor
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/create-class-period/[year]/_components/create-class-period-form.tsx:223`
- **Problem:** component ไม่มี production importer (มีแต่ test import) — ยังยิง `plans` (:223), `level-classes` (:252), `class-period/set` (:438) ไม่พา `sTermID` — ทั้งสามต้องมีเทอมตั้งแต่ BE-010 (VR-9); mount ซ้ำจะได้ลิสต์ว่างเงียบ/save ล้ม — ลบทิ้งหรือ wire เทอม
- **Reference:** DES-009 §34.2 ตาราง (Plans, LevelClasses, ClassPeriod/Set) · VR-9

### REV-012

- **Severity:** Minor
- **Task:** FE-021
- **Location:** `src/components/layout/home/manage-teaching-schedule/timetable-grid.tsx:459`
- **Problem:** กริดอ่าน `localStorage["sTermID"]` (global) ตรง ๆ แทนรับเทอมของหน้าเป็น prop — context เทอมมีแหล่งความจริงสองที่ (route 7 วันนี้ค่าตรงกันเพราะไม่มี selector ไม่ใช่เพราะ data flow)
- **Reference:** DES-009 §34.2 ข้อ 2 · DES-018 §43.2b ข้อ 5.6

### REV-013

- **Severity:** Minor
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/settings/[year]/page.tsx:745`
- **Problem:** ข้อความบันทึกสำเร็จไม่ระบุเทอมที่เขียน ("บันทึกการตั้งค่าสำเร็จ" — `messages/th.json:650`; modal ของ workspace/subject-settings เช่นกัน) — data path ถูกต้องแล้ว ค้างเฉพาะ copy
- **Reference:** UX-007 §ผลของการเปลี่ยนเทอม (ย่อหน้าท้าย: ยืนยันการบันทึกทุกจุดต้องระบุเทอม)

### REV-014

- **Severity:** Minor
- **Task:** UX-007
- **Location:** `uxui/UX-007-term-context.md:3`
- **Problem:** artifact ยัง `Status: draft` และตาราง Sign-off (:92-96) ว่าง ขณะที่ `plan\index.md:71` บันทึก `verified` — เอกสารกับ index ขัดกัน ทำให้ gate "มีคนเซ็นก่อน engineer เริ่ม" ตรวจย้อนหลังจากตัว artifact ไม่ได้ (ให้คนเซ็นแล้ว uxui-designer อัปเดตตามความจริง)
- **Reference:** UX-007 §Sign-off (เฉพาะคนเปลี่ยนเป็น signed) · `policies\documentation.md` §3

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-006 | Important | `[year]/page.tsx:118` | frontend-engineer | open |
| REV-007 | Important | `[year]/page.tsx:119,122` | frontend-engineer | open |
| REV-008 | Important | `subject-settings/[year]/page.tsx:204` (+4 จุดใน Problem) | frontend-engineer | open |
| REV-009 | Important | `settings/[year]/page.tsx:475` | frontend-engineer | open |
| REV-010 | Minor | `timetable/page.tsx:71` | frontend-engineer | → backlog |
| REV-011 | Minor | `create-class-period-form.tsx:223` | frontend-engineer | → backlog |
| REV-012 | Minor | `timetable-grid.tsx:459` | frontend-engineer | → backlog |
| REV-013 | Minor | `settings/[year]/page.tsx:745` | frontend-engineer | → backlog |
| REV-014 | Minor | `uxui/UX-007-term-context.md:3` | uxui-designer | → backlog |

## Round 8

**Verdict:** FAIL

| Task | Verdict |
|---|---|
| FE-021 | FAIL |

- ผ่าน: proxy `years/[yearId]/terms` รูปเดียวกับ `plans` · เทอมมาจาก endpoint Terms เสมอ (`sTermNumber` ตรงตามได้ + `dStart` รอง, ไม่ sort/hardcode/localize, ไม่แตะ `api/directory/terms` — AC-027) · `sTermID` ครบทุก call ที่ backend บังคับ (ตรวจคู่ ValidateTerm ฝั่ง `WebAPIController.cs` ราย endpoint — ตัวที่ไม่บังคับ เช่น Timetable Delete/SetStatus ไม่ส่งก็ตรงสัญญา) · bridge เขียนที่ `[year]`+hub อ่านคู่ `nScheduleID`/`nYear` ที่ route 7 (`page.tsx:989-1014`) fail-closed ไม่เดาเทอม · chip อ่านอย่างเดียว route 7 · conflict = `get-all-by-year` + `sTermID` (BR-17a S1) · hook กัน race (loadSeq), preselect จากข้อมูล, 401 เงียบ, stale ล้าง+แจ้ง · VR-9 ไม่มีเทอม = ไม่ยิง call + block Generate/Save
- FAIL เพราะ REV-006..REV-009 (Important) — แก้ครบก่อนส่ง QA
- ข้อจำกัด: ไม่รัน typecheck/build/test (ผล vitest เป็นของ qa-engineer) · ไม่มี diff จึงแยกงาน FE-021 ออกจาก rename (`generate-result-panel`/`intensity-summary-block`) และไฟล์ stream อื่น (`sidebar.tsx`, `link-subjects-modal.tsx`, `teacher-group-row.tsx`, `trio-list-panel.tsx`, `timetable-helpers.ts`) ไม่ได้ = ไม่ได้ตรวจ · `[manual-E2E]` กับ BE-010 (AC-065) รอ QA/deploy

## Reviewed

- `plan\fe-021.md` · `plan\index.md` · `design\des-009.md` · `design\des-018.md` §43.2b · `requirement\req-012.md` · `uxui\UX-007-term-context.md` · `review\round-6.md` · `review\index.md`
- FE: `timetable/page.tsx`, `[year]/page.tsx`, `settings/[year]/page.tsx`, `subject-settings/[year]/page.tsx`, `create-class-period/[year]/page.tsx` + `_components/{add-class-period-modal,create-class-period-form}.tsx`, `manage-timetable/[year]/page.tsx` + `{teacher-groups-tab,main-teaching-grade-tab}.tsx`, `manage-teaching-schedule/page.tsx` + `_lib/{use-timetable-generation,use-select-curriculum}.ts`, `_components/timetable-term-context-bar.tsx`, `_hooks/use-timetable-terms.ts`
- proxy: `api/school/[schoolId]/years/[yearId]/{terms,plans}/route.ts`, `.../level-classes/route.ts`, `.../sub-level/[levelId]/teachers/route.ts`, `api/timetable/{get-all-by-year,get}/route.ts` · `components/layout/home/manage-teaching-schedule/timetable-grid.tsx` · `lib/{auth-headers,timetable-request-failure,timetable-required-load}.ts` · `server/upstream/json-proxy.ts` · `types/timetable.ts` · `messages/{en,th}.json` · `tests/integration/timetable-fe021-term-context.test.tsx` (หัวไฟล์ — ไม่รัน)
- Backend (อ่านอย่างเดียว): `WebAPIController.cs` (Terms :170-188, ValidateTerm :55-78, Timetable/Delete :2685, SetStatus :2730, SetAll :2868-2884), `Helpers/Messages.cs:39-40`, `Models/TTerm.cs`, `Models/Response.cs`

## Change Log

- 2026-10-09 — Round 8 (FE-021) — FAIL · REV-006..REV-009 Important (open) · REV-010..REV-014 Minor → backlog

Back-links: `plan\index.md` · `..\index.md`
