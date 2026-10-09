# timetableai — QA Round 4 — FE-014

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `qa-engineer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ถูกแทนคงอยู่เป็นไฟล์ของตัวเอง verbatim · live Open Issues / Unverified Behaviour ให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-004 | FE-014 | Minor | open → backlog (lint baseline ไม่ใช่ของ FE-014) |
| QA-005 | FE-014 | Minor | open → backlog |

## Round 4

**Status:** ✅ Verified

โหมด: orchestrated (packet s-91-d8ba, phase 6) — ไม่เขียน `plan\index.md` · target `C:\src\sb-tech-upgrade-web-system_v2` (working tree ยังไม่ commit) · วันที่ 2026-10-07

### Checks run

| Check | Command | Result |
|---|---|---|
| typecheck | `npx tsc --noEmit` | pass (exit 0) |
| lint | `npx eslint <4 ไฟล์ของ FE-014: page.tsx, SelectCurriculumModal.tsx, timetable-helpers.ts, settings/[year]/page.tsx>` | fail (exit 1) — 7 errors / 6 warnings **ทั้งหมดอยู่นอก hunk ที่ FE-014 แก้** (page.tsx:141,830,1257,1287,1389 · settings page:119,125 — settings page ไม่มี diff) = หนี้เดิม → qa:QA-004 |
| build | `npm run build` | pass (exit 0) |
| test | `npx vitest run` | pass — 69 files / 634 tests |

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| FE-014 | verified | ดูตาราง AC ด้านล่าง · ส่วน live (อ่านกลับ `Timetable/Get`, Generate) อยู่ใน Unverified Behaviour — รอ PRE-01 DDL + BE-003 live |

### AC-054 (ส่วนของ FE-014)

| ข้อ | ผล | หลักฐาน |
|---|---|---|
| modal มี dropdown 0/1/2 ใต้การ์ดเทมเพลต (UX-002) | ✅ Verified (อ่านโค้ด) | `SelectCurriculumModal.tsx:128-140` — ใต้บล็อก standard/custom cards · ค่าเฉพาะ `[0,1,2]` (VR-21) `:48-51` |
| ป้าย modal ตรง UX-002 (TH/EN) + help text | ✅ Verified | `messages/th.json:457-463`, `messages/en.json:458-464` = UX-002 ตาราง §ข้อกำหนด UI ทุกคำ |
| ส่ง `nCourseIntensity` ใน `Timetable/Set` | ✅ Verified (อ่านโค้ด) | `page.tsx:670` → `/api/timetable/set-all` → proxy `/WebAPI/Timetable/Set` (`src/app/api/timetable/set-all/route.ts:7`) |
| ตารางใหม่ prefill จาก `Tbl_Setting.nCourseIntensity` | ✅ Verified (อ่านโค้ด) | `page.tsx:112-115` (ตั้งเมื่อผู้ใช้ยังไม่เลือก; ค่า 0 = default `:84`) |
| ตารางเดิม prefill จาก `Timetable/Get` · NULL → 0 | ✅ Verified (อ่านโค้ด) | `page.tsx:933-934` (≠1/2 → 0) · type `timetable-helpers.ts:158` `number \| null` · lock กัน prefill ทับ `:85-89,113` |
| ป้าย `/settings` ตรง BR-78 + UX-002 · label/tooltip ใหม่ | ✅ Verified | `messages/th.json:575-581`, `en.json:576-582` · ป้ายเดิม "ไม่กำหนดเงื่อนไข/ความเข้มข้นต่ำ…/ปานกลาง…" ถูกแทน (git diff) |
| key ↔ ป้ายไม่เลื่อน (D51) | ✅ Verified | `settings/[year]/page.tsx:27-28` low=0/medium=1/high=2 ↔ ป้าย low="ไม่กระจาย", medium="พยายามกระจาย…", high="กระจายข้ามวัน…" = 0/1/2 ตาม BR-78 |
| ไม่มีช่องกรอกความหนักรายวิชา | ✅ Verified | grep `[Ii]ntensity` ใน `src/` — ไม่มี input อื่น |

### Data Model check

`Tbl_Timetable.nCourseIntensity smallint NULL` (data-model.md:190 — NULL = 0): FE type `nCourseIntensity?: number | null` (`timetable-helpers.ts:158`) และ map NULL/อื่น → 0 (`page.tsx:934`) ตรง · `Tbl_Setting.nCourseIntensity` คงไว้ ใช้เป็น prefill เท่านั้น (data-model.md:193) ตรง (`page.tsx:112`) · request ส่งค่าเฉพาะ `0|1|2` (type `page.tsx:84`)

### Issues Found

#### QA-004

- **Task:** FE-014 · **Severity:** Minor (→ backlog — หนี้ lint เดิม ไม่ใช่ของ FE-014)
- **Expected:** task Handoff: lint ผ่าน
- **Actual:** eslint exit 1 — `react-hooks/set-state-in-effect` + `Cannot access refs during render` ที่บรรทัดนอก diff ของ FE-014 (settings page ไม่ถูกแก้เลย)
- **Reproduce:** null · รัน eslint ตาม Checks run
- **Evidence:** `page.tsx:141,830,1257,1287,1389` · `settings/[year]/page.tsx:119,125` · บรรทัดที่ FE-014 เพิ่ม (82-89, 112-115, 670, 680, 933-934, 1490-1491; modal 27-28, 43-44, 48-51, 127-140) ไม่มี error

#### QA-005

- **Task:** FE-014 · **Severity:** Minor (→ backlog)
- **Expected:** ตารางเดิม prefill จากค่าของตารางเสมอ (UX-002)
- **Actual:** ถ้า `restore.nClassPeriodID` ไม่พบใน class periods `tryRestore` return ก่อนตั้ง lock (`page.tsx:925-929` ก่อน `:933`) → ค่า prefill จาก `Tbl_Setting` อาจถูกใช้กับตารางเดิม (กรณีขอบ; ฟอร์มอื่นก็ไม่ถูก restore เช่นกัน)
- **Reproduce:** null · เปิดแก้ตารางที่ class period ถูกลบ แล้ว `Tbl_Setting.nCourseIntensity` = 1/2
- **Evidence:** `page.tsx:924-934`

## Unverified Behaviour — undeployed phases

- Phase 6 (FE-014): บันทึกด้วย 0/1/2 แล้วอ่านกลับจาก `Timetable/Get` — ไม่ได้รันจริง (ต้อง PRE-01 DDL โดย `devops` + BE-003 live) · ไม่มีภาพป้ายทั้งสองหน้า (ไม่ได้เปิด UI จริง)
- Phase 6: "Generate ใช้ระดับนั้น" — ไม่มีโค้ดฝั่ง FE-014 ที่ส่งระดับเข้าตัวจัด; เป็นของ FE-003 (Out of Scope ของ FE-014) — ต้องตรวจตอน Feature QA
- prefill ตารางใหม่ / NULL → 0 / lock — ยืนยันจากการอ่านโค้ดเท่านั้น ไม่มี unit test ครอบ

## Change Log

- 2026-10-07 — Round 4 — FE-014 verified (static + checks) · QA-004/QA-005 Minor → backlog · live readback/Generate ค้างใน Unverified Behaviour

Back-links: `plan\index.md` · `..\index.md`
