# timetableai — Review Round 7 — FE-011, FE-012, FE-013, FE-015, FE-016

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · ไฟล์นี้ = 1 round · รอบที่ปิดแล้วคงอยู่เป็นไฟล์ของตัวเอง verbatim (ไฟล์เก่า = archive) · open findings ที่ยังไม่จบให้ current อยู่ในไฟล์รอบล่าสุดเท่านั้น

## Findings

None.

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|

## Round 7

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-011 | PASS |
| FE-012 | PASS |
| FE-013 | PASS |
| FE-015 | PASS |
| FE-016 | PASS |

### Review Notes per Task

- **FE-011 (Sidebar disabled / loading / checkFailed, UX-006, DES-022):**
  - `src/components/layout/sidebar.tsx`: `useTimetableMenuPermissions` จัดการดึงสิทธิ์เมนู 5 MenuID {401, 402, 403, 404, 422} และ map เข้าสู่เมนูย่อย Teaching Schedule ใน Sidebar ผ่าน `applyTimetableMenuPermissions`
  - มี `TimetableMenuHeaderIndicator` แสดงสถานะ `loading` และ `checkFailed` ตามสัญญา UX-006
  - มี `TimetableMenuClosedItem` ปิดกั้นการกดเมื่อไม่มีสิทธิ์ (`noPermission`) หรือตรวจสอบไม่สำเร็จ (`checkFailed`)
  - Unit/Hook tests ใน `tests/hooks/use-timetable-menu-permissions.test.tsx` (21 tests) และ `tests/config/timetable-menu-permissions.test.ts` (7 tests) ผ่านครบถ้วน

- **FE-012 (Post-Generate shortfall report UI, UX-001, DES-020):**
  - `src/app/[locale]/timetable/manage-teaching-schedule/_components/generate-result-panel.tsx`: แสดง shortfall report หลัง Generate/Regenerate
  - แสดงจำนวนรวมที่ค้าง, รายการขาดรายห้อง/วิชา, หมวด `ExcludedFromAutoGenerate` แยก, สถานะ `UNVERIFIABLE` ("ตรวจผลการจัดไม่ได้")
  - ถูก mount ใน `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx` ใต้ทูลบาร์กริดเมื่อ `resultPanelArmed && generateResult` เป็นจริง

- **FE-013 (Intensity summary + recommendations UI, UX-001, DES-019):**
  - `src/app/[locale]/timetable/manage-teaching-schedule/_components/intensity-summary-block.tsx`: แสดงสรุปความเข้มข้น `L`, ตารางหนัก/เบารายวันทุกห้อง, วิชาหนัก, ข้อเสนอแนะห้อง/วันที่เกินเกณฑ์
  - L0 ไม่แสดงข้อเสนอแนะ, แสดงสถานะ "จำแนกวิชาหนักไม่ได้" / "ไม่มีวิชาหนักตามสูตร" ชัดเจน
  - แสดงร่วมกับ shortfall report หลัง Generate และแสดงเดี่ยวเมื่อเปิดตารางที่บันทึกไว้ (Flow D) ผ่าน `restoreIntensitySummary`

- **FE-015 (Non-blocking intensity warning toast on manual edit, UX-003, BR-80):**
  - `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`: รับ `latestManualEditWarning` จาก hook `useManualEditIntensityWarning`
  - ยิง toast warning ผ่าน `react-hot-toast` พร้อมไอคอน ⚠️ และ duration 6 วินาที โดยไม่ปฏิเสธหรือเปลี่ยนกริด
  - ข้อความคำนำ "แก้ไขตารางสำเร็จ แต่..." ตามด้วยรายการคู่ (สูงสุด 3 คู่ + "และอีก k คู่" ตาม UX-003)

- **FE-016 (Dedicated 403 copy + page-level 403, UX-004, DES-018):**
  - ทุกจุด action ที่ได้รับ 403 แสดงข้อความภาษาไทยตรงตาม UX-004 (เช่น `ไม่มีสิทธิ์บันทึกตารางสอน`, `ไม่มีสิทธิ์ลบคาบเรียน`, `ไม่มีสิทธิ์แก้ไขคาบเรียน`, `ไม่มีสิทธิ์เข้าถึงแผนการเรียน`)
  - 401 ส่งสัญญาณ SessionExpired เสมอโดยไม่มีข้อความ toast หรือ Alert แสดงขึ้นมาผิดกติกา
  - Integration tests 9 ไฟล์ 173 tests ใน `tests/integration/` ผ่าน 100%

## Reviewed

- `src/components/layout/sidebar.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/_components/generate-result-panel.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/_components/intensity-summary-block.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`
- `src/app/[locale]/timetable/create-class-period/[year]/page.tsx`
- `src/app/[locale]/timetable/create-class-period/[year]/_components/create-class-period-form.tsx`
- `src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-select-curriculum.ts`
- `src/components/modals/home/create-teaching-schedule/link-subjects-modal.tsx`
- `src/components/layout/home/manage-teaching-schedule/timetable-grid.tsx`
- `src/app/[locale]/timetable/[year]/page.tsx`

## Change Log

- 2026-10-09 — Round 7 (FE-011, FE-012, FE-013, FE-015, FE-016) — PASS ทั้ง 5 tasks

Back-links: `plan\index.md` · `..\index.md`
