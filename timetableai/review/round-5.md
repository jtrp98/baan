# timetableai — Review Round 5 — FE-014

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` · run `r-20261007-214754-954d` session `s-89-febb` (attempt 1) · วันที่ 2026-10-07 (จาก packet)

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-014 | PASS |

ตรวจอิสระเทียบ `plan\fe-014.md` (Goal/Scope/Acceptance), REQ-002 AC-054, DES-019 BR-78 / §44.3 / D51 / Fallback · diff ของ session `s-87-cbf0` เป็น numstat โดยประมาณ (worktree ยังไม่ commit) จึงอ่านไฟล์จริงแทน · ไม่ได้อ่าน `qa\` / `security.md` · ไม่รันอะไร

## ผลตรวจ

1. **ตัวเลือก 0/1/2 ใน modal ✔** — `SelectCurriculumModal.tsx:48-51` สร้าง options จาก `[0,1,2]` เท่านั้น (VR-21 ฝั่ง UI) · ค่าที่ส่งกลับเป็น `0|1|2` (:136) · วางท้าย modal พร้อม help text แบบ soft (:128-140)
2. **ส่ง `nCourseIntensity` ✔** — `page.tsx:670` ใส่ใน body ของ `/api/timetable/set-all` ซึ่ง proxy ไป `/WebAPI/Timetable/Set` (`src/app/api/timetable/set-all/route.ts:7`) · dependency array อัปเดต (:680)
3. **Prefill ตารางใหม่จาก `Tbl_Setting` ✔** — `page.tsx:112-115` อ่าน `nCourseIntensity` ของ `/api/setting/get` (คีย์ (โรงเรียน, ปี)) · รับเฉพาะ 1/2 ที่เหลือคง 0 · ไม่ทับเมื่อผู้ใช้เลือกเองหรือ restore แล้ว (`courseIntensityLockedRef` :85-89)
4. **ตารางเดิม NULL → 0 ✔** — `page.tsx:933-934` restore จาก `Timetable/Get` · ค่าที่ไม่ใช่ 1/2 (รวม NULL/ค่าไม่รู้จัก) → 0 ตาม BR-78 + Fallback · type `TimetableRestoreData.nCourseIntensity?: number | null` (`timetable-helpers.ts:158`) · ลำดับ race: setting มาก่อน → restore ทับ; restore มาก่อน → lock กัน setting ✔
5. **ป้ายตรง BR-78 + key ไม่เลื่อน (D51) ✔** — `/settings` คง `INTENSITY_MAP {low:0, medium:1, high:2}` (`settings/[year]/page.tsx:27-28`) และป้ายใหม่ low = ไม่กระจาย, medium = กระจายวิชาหนัก, high = + ไม่ติดกัน (`messages/th.json:578-580`, `en.json:579-581`) → key ↔ ป้ายตรงกันแล้ว · ป้าย modal `level0..2` (`th.json:460-462`, `en.json:461-463`) ใช้ถ้อยคำเดียวกัน · ไม่มีถ้อยคำ "พื้นฐาน ↔ เพิ่มเติม" แล้ว · tooltip `/settings` ระบุว่าเป็นค่าตั้งต้นของตารางใหม่ (`th.json:577`) ตรง §44.3
6. **ขอบเขต ✔** — ไม่แตะ API/solver/`Setting/Set` · ไม่มีโหมดกรอกความหนักรายวิชา · comment ที่เพิ่ม (`page.tsx:82-83`, `SelectCurriculumModal.tsx:128`) เป็น why/อ้าง DES — ตาม convention

## Findings

### REV-005
- **Severity:** Minor → backlog
- **Task:** FE-014
- **Location:** `C:\src\sb-tech-upgrade-web-system_v2\messages\th.json:461` (และ `:579`)
- **Problem:** ป้ายระดับ 1 ภาษาไทย "พยายามกระจายวิชาหนักให้**ทั่ววัน**" อ่านได้ว่ากระจายภายในวัน ขณะที่ BR-78 L1 = กระจายข้ามวันของสัปดาห์ และป้ายอังกฤษเขียน "across days" (`en.json:462`) — th/en ไม่ตรงกัน · ไม่ได้เทียบถ้อยคำกับ UX-002 ฉบับเซ็น (ไม่อยู่ใน readSections) — ถ้า UX-002 ใช้คำนี้ verbatim ให้ `uxui-designer` พิจารณาแก้ในรอบหน้า ถ้าไม่ใช่ engineer แก้เป็น "ให้ทั่วทุกวัน/ข้ามวัน"
- **Reference:** DES-019 BR-78, D51 · AC-054 (ป้ายตรง BR-78)
- **Owner:** frontend-engineer (ตรวจกับ UX-002) / uxui-designer

## Open Findings

| ID | Severity | Location | Owner | Status |
|---|---|---|---|---|
| REV-005 | Minor | `messages/th.json:461` | frontend-engineer / uxui-designer | → backlog |

## Could not review

- **"Generate ใช้ระดับนั้น" (AC-054):** grep `intensity` ใน `manage-teaching-schedule\` ของ target นี้พบเฉพาะ 3 ไฟล์ของ task นี้ — ไม่พบ solver intensity (`intensity-config.ts`/`solver-intensity.ts` ที่ DES-019 Rev 15 อ้าง) และไม่มีโค้ดใดส่ง `courseIntensity` เข้า generation · solver อยู่นอกขอบเขต FE-014 (FE-003/FE-008) จึงไม่ใช่ finding ของ task นี้ แต่ `qa-engineer` จะพิสูจน์ส่วนนี้ของ AC-054 ไม่ได้จนกว่า FE-003/FE-008 จะลงที่ target นี้ — driver ควรตรวจสถานะ FE-003 ใน `plan\index.md`
- ถ้อยคำ UX-002 ฉบับเซ็น — ไม่อยู่ใน readSections
- การบันทึกจริง/อ่านกลับ `Timetable/Get` และ DDL (PRE-01) — runtime เป็นงาน QA/devops

## Reviewed

- `src\app\[locale]\timetable\manage-teaching-schedule\_components\SelectCurriculumModal.tsx` (1-155)
- `src\app\[locale]\timetable\manage-teaching-schedule\page.tsx` (70-139, 630-689, 890-949, grep intensity)
- `src\app\[locale]\timetable\manage-teaching-schedule\_lib\timetable-helpers.ts` (145-164)
- `messages\th.json` · `messages\en.json` (grep courseIntensity — 457-463, 575-581)
- `src\app\api\timetable\set-all\route.ts` · `src\app\[locale]\timetable\settings\[year]\page.tsx` (grep INTENSITY_MAP)
- `sessions\s-87-cbf0\diff.patch` · `plan\fe-014.md` · `requirement\req-002.md` · `design\des-019.md` · `review\index.md`

Back-links: `index.md`
