# timetableai — Review Round 27 — FE-026

> Budget ≤ 10 KB (`policies\policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

รอบนี้ไม่มี finding ใหม่ (FE-026 implementation ผ่านเกณฑ์การตรวจทั้งหมด; REV-021..REV-023 ยังคงอยู่ใน backlog)

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-021 | Minor | `…/_lib/use-select-curriculum.ts:137` | project-manager | → backlog |
| REV-022 | Minor | `…/settings/[year]/page.tsx:453` | project-manager | → backlog |
| REV-023 | Minor | `…/_lib/teaching-caps.ts:223` | project-manager | → backlog |

## Round 27

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-026 | PASS |

ผลการตรวจสอบ FE-026 (Phase 12 Generate Precheck — Blockers, Warnings, Shortcuts, Recheck flow, Revocation of silent drop):
- `Precheck Engine (generate-precheck.ts)`:
  - `BR-27 / BR-50`: คำนวณ `lstGenerateBlockers` ครอบคลุมทุกวิชาของทุกแผนใน `sPlanIDs` × ทุกห้องเรียนของแผน (ไม่ใช่เฉพาะวิชาที่เลือก)
  - Blocker Reason 1: `NoEligibleTeacher` — ตรวจสิทธิ์ครูประจำชั้น (BR-41/42) ร่วมกับตัวกรองผู้ดูแลห้อง $T_R$ (BR-71). เมื่อชุดครูว่างลงโดยเกิดจาก $T_R$ เพียงอย่างเดียว จะระบุ `sDetail: "RoomCaretaker"` พร้อมชื่อห้อง รายชื่อผู้ดูแลที่นับได้ (ผ่าน `formatCaretakerNames`) ทางลัดจัดการหลักสูตร (`/timetable`) และทางลัดห้องเรียน (`/timetable/subject-settings/${year}`)
  - Blocker Reason 2: `ZeroPeriodsPerWeek` — ตรวจสอบคาบต่อสัปดาห์ $\le 0$ หรือไม่มีค่า
  - **สองเหตุนี้เท่านั้นที่บล็อก** ไม่มี blocker code อื่นแปลกปลอม
  - Non-blocking Warnings: `RoomCaretakerNotInPlan` (1 แถวต่อห้อง per OD-5 ก, รายงานผู้ดูแลที่ไม่อยู่ในแผน พร้อมเตือนเรื่องการถอยกลับไปใช้ความจุ), `RoomSettingMissing` (ห้องที่ยังไม่ตั้งค่าความจุ เสนอใช้ความจุ 1)
- `Precheck Panel UI (generate-precheck-panel.tsx)`:
  - Accessible region: `role="region"`, `aria-label="แผงตรวจสอบความพร้อมก่อนจัดตารางสอน"`, `aria-live="polite"`
  - OD-1 (ก): แสดงตาราง scrollable แสดงรายการปัญหาครบทุกแถว ไม่ซ่อนหรือตัดทิ้ง
  - External shortcut links: มี `target="_blank" rel="noopener noreferrer"` และ fallback text กรณีไม่มีสิทธิ์
  - ปุ่มตรวจสอบข้อมูลใหม่ (Recheck button) พร้อม loading state และ icon หมุน
  - ส่วนแสดงคำเตือน (Warnings block) แยกชัดเจน ไม่ขัดขวางการจัดตาราง
- `Integration in Manage Teaching Schedule (page.tsx & course-list-panel.tsx)`:
  - `aiGenerateBlocked={precheckResult.isBlocked}` ปิดการใช้งานปุ่ม "Schedule Classes with AI" ใน CourseListPanel ขณะที่ปุ่ม บันทึก (Save) และการจัดตารางด้วยมือยังคงทำงานได้
  - `handleAiGenerateClick` และ `handleRegenerate` ตรวจสอบ `precheckResult.isBlocked` ก่อนเริ่ม generate
  - `handleRecheckPrecheck`: เรียก GET maps ใหม่ (`/api/school/[schoolId]/rooms`, `/api/subject-room/get`, `/api/teacher-class-assignment/get-by-class`) โดยไม่รีเซ็ตกริดและไม่ล้างช่องที่ล็อก (BR-28)
  - Fail-closed error handling: หาก fetch ล้มเหลว จะคงสถานะบล็อกเดิม ไม่ปลดบล็อกด้วยข้อมูลที่ล้มเหลว
  - ยกเลิกการตัดวิชาเงียบ (AC-016 revoked) — solver ไม่ตัดวิชาเงียบ แต่บล็อกตั้งแต่ precheck
- `Checks & Verification`:
  - `npm run type-check` ผ่าน exit 0 (0 errors)
  - Scoped `eslint` บน changed files ผ่าน exit 0 (0 errors, 0 warnings)
  - Approved SWC cache `npm run build` ผ่าน exit 0
  - Vitest test suite ผ่านครบ 11/11 tests ใน `timetable-fe026-precheck.test.tsx` และ 68 regression tests ผ่านทั้งหมด

## Reviewed

- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/generate-precheck.ts`
- `src/app/[locale]/timetable/manage-teaching-schedule/_components/generate-precheck-panel.tsx`
- `src/components/layout/home/manage-teaching-schedule/course-list-panel.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`
- `tests/integration/timetable-fe026-precheck.test.tsx`

---
Change Log:
- 2026-10-11 — Review Round 27: FE-026 PASS (Precheck blockers, warnings, shortcuts, recheck without clearing grid, no silent drop).
