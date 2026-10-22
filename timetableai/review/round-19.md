# timetableai — Review Round 19 — FE-025

> Budget ≤ 10 KB · เขียนโดย `reviewer` · 1 round · static (ไม่รัน build/test) · FE = `sb-tech-upgrade-web-system` · BE = `sb-api-academic-timetable-ai`

## Findings

### REV-019

- **Severity:** Important
- **Task:** FE-025
- **Location:** `FE/src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts:138`
- **Problem:** `eligibleClassesMap[tid] = getEligibleClasses(t, …, planClassesByIdx[idx])` อยู่ในลูปต่อแผน และครูทุกคนอยู่ทุกแผน (:123) → ห้องของแผน**สุดท้าย**ทับแผนก่อนหน้า. ตารางหลายแผน: ครูไม่มี flag ได้เฉพาะห้องแผนสุดท้าย → solver (`use-timetable-generation.ts:507,645,793`), picker/AddCourseModal (`timetable-grid.tsx:166`), `page.tsx:313` ปฏิเสธห้องแผนอื่นที่ครูมีชื่อ. ขัดกับ restore ที่ union ทุกแผน (`page.tsx:1364–1380`); ไม่มี test หลายแผน
- **Reference:** AC-045 / DES-015 BR-41 · §40.3 + R5 (สิทธิ์จุดเดียว ผลเท่ากันทุกชั้น)

### REV-020

- **Severity:** Important
- **Task:** FE-025
- **Location:** `FE/src/app/[locale]/timetable/settings/[year]/page.tsx:709`
- **Problem:** เพิ่มเพดานรายคนให้ครูใหม่ไม่ได้: `onAdd` (:528–532) ตั้ง `pendingIndividualTeacherId` แต่เปิด modal โดยไม่มี `initialData`/`teacherOptions` (:709–713); modal ตั้ง `selectedTeachers` จาก `initialData` เท่านั้น (`set-individually-modal.tsx:44`) และ `canSave` ต้องมีครู (:55–56), dropdown ว่าง → บันทึกไม่ได้เสมอ (แก้แถวเดิมได้). test modal (`timetable-fe025-teaching-settings.test.tsx:286–291`) ส่ง props เองจึงไม่จับ. ยืนยัน baseline ด้วย git ไม่ได้ แต่ทั้งสองไฟล์อยู่ใน Write paths และเป็น UI ของ AC-043
- **Reference:** AC-043 / AC-043a · DES-014 BR-39 · UX-011 Flow 1 ส่วนที่ 2

### REV-021

- **Severity:** Minor (→ backlog)
- **Task:** FE-025
- **Location:** `FE/src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts:137`
- **Problem:** Schedule Summary แสดงครูทุกคนของโรงเรียนในทุกแผน พร้อม `classes` = ทุกห้องของแผน (:150) แม้ไม่มีวิชาในแผนนั้น — การบังคับจริงยังกรองด้วย `teacherSubjectsInChargeMap` จึงเป็นปัญหาแสดงผล; กรองต่อแผนจริงต้องรอ `lstSubjects` ผูกแผน (BL-031)
- **Reference:** DES-015 BR-41 · BL-031

### REV-022

- **Severity:** Minor (→ backlog)
- **Task:** FE-025
- **Location:** `FE/src/app/[locale]/timetable/settings/[year]/page.tsx:453`
- **Problem:** a11y ไม่ครบ: (ก) `Input` ชั่วโมงรวม (:453, :473) ไม่มี id/`aria-describedby` ผูก error (ใช้ label ห่อ — มีชื่อแต่ไม่ผูก error) (ข) tooltip BR-44 (:567) เปิดด้วย hover เท่านั้น (`Tooltip` ร่วมอยู่นอก Write paths) (ค) VR-12 ปิด Save แทน error summary + focus จุดผิดแรก. ข้อความ BR-44 ถูกแล้ว th/en → AC-044 (ค) ไม่ผิด
- **Reference:** UX-011 §Accessibility + layout/a11y draft

### REV-023

- **Severity:** Minor (→ backlog)
- **Task:** FE-025
- **Location:** `FE/src/app/[locale]/timetable/manage-teaching-schedule/_lib/teaching-caps.ts:223`
- **Problem:** `unionMinutes` ทิ้งช่วงไม่มีเวลาจริงของช่องที่**วางอยู่แล้ว** → นับ 0 นาทีในยอด; ห้ามนับ 0 บังคับเฉพาะช่องที่กำลังวาง (:262) — edge case ข้อมูลเก่า
- **Reference:** DES-014 Fallback

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-019 | Important | `…/_lib/use-select-curriculum.ts:138` | frontend-engineer | open |
| REV-020 | Important | `…/settings/[year]/page.tsx:709` | frontend-engineer | open |
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 19

**Verdict:** FAIL

| Task | Verdict |
|---|---|
| FE-025 | FAIL |

ผ่านแล้ว:
- นาทีจริง end−start, union ช่วงทับ/Link Subject ครั้งเดียว, 7 วัน (`WEEK_DAYS` ตรงชื่อวันกริด), ชม.×60, ช่องที่วางไม่มีเวลา → `teachingTimeUnknown`; solver (`use-timetable-generation.ts:352,514,676,821`), `validateDrop` (`page.tsx:547`), `validateProspectiveRows` (:604) ใช้ `checkTeachingCap` เดียว; ไม่เหลือ `getEffectiveMaxPeriod`/นับคาบ
- BR-39 ต่อฟิลด์รวม AC-043a; AC-043b: solver ไม่อ่านคาบเดิม — settings อ่าน `nMaxTeachingPeriodPerDay` (:215) เพื่อข้อความ M1 ที่เซ็นแล้วเท่านั้น
- `getEligibleClasses` (`timetable-helpers.ts:114`) BR-41/42/44, จับด้วย class id, flag ไม่มีห้อง → []; ใช้ร่วม solver/validators/picker
- ข้อ (4): รับ catalog ครูจาก BE (`WebAPIController.cs:2320–2330`) แล้วกรองที่ `getEligibleClasses` ถูกทิศตาม §40.3/SA-Q8 แต่ต้อง union ข้ามแผน (REV-019); แสดงครูเกิน = REV-021; สิทธิ์ต่อแผนละเอียดขึ้นกับ BL-031 (`WebAPIController.cs:2432–2452`)
- Settings: Save ปิดจน settings+roster+responsibility ครบ (:232, :741); malformed/missing/scope ผิด → failed ไม่ปลอม empty; Spinner จบ; stale guard; ไม่เรียก GetTeachersByClass; Save ไม่ส่ง projection/ฟิลด์เดิม; parser ตรง BE (`:1990–2072`). หน้า generate: parse ผิด → `settingsFailed` (`page.tsx:171–177`); H1 อ่านไม่ได้ → fallback+คำเตือน; 401/403 ผ่าน `settleRequiredLoad`
- i18n th/en key เท่ากัน (23/23), copy ตรง UX-011
- fixture 3 ไฟล์: เติมชั่วโมง + `homeroomResponsibility` §40.3a + testid ใหม่; assertion ที่เห็นคงเจตนา
- ไม่นับ test fail 4 ตัวของ subject-settings (FE-023)

ไม่ได้ตรวจ: ไม่มีเครื่องมือ git → **ไม่ได้แยก delta FE-025 จาก baseline FE-021/FE-023** (unrelated change/assertion ที่ถูกลบยืนยันไม่ได้); ไม่รัน checks; runtime/browser/a11y; id space `plan.lstClasses.nClassID` อ้างตาม comment/BE-013

## Reviewed

- FE `_lib/teaching-caps.ts`, `_lib/use-select-curriculum.ts`, `settings/[year]/page.tsx`, `set-individually-modal.tsx` (ทั้งไฟล์)
- FE `_lib/timetable-helpers.ts` :80–139 · `manage-teaching-schedule/page.tsx` :100–339, :380–617, :1335–1404 · `_lib/use-timetable-generation.ts` :280–380
- FE (grep) `add-course-modal.tsx`, `timetable-grid.tsx`, `types/timetable.ts`, `messages/th.json`, `messages/en.json`, `tests/app/timetable/teaching-caps.test.ts`, `tests/integration/timetable-fe025-eligibility.test.tsx`, fixture 3 ไฟล์
- FE `tests/integration/timetable-fe025-teaching-settings.test.tsx` (ทั้งไฟล์)
- BE `WebAPIController.cs` :1917–2090, :2290–2337, :2428–2452

## Change Log

- 2026-10-11 — Round 19 — FE-025 FAIL (REV-019, REV-020 Important open; REV-021..023 Minor → backlog)

Back-links: `plan\index.md` · `..\index.md`
