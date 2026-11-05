# timetableai — Review Round 11 — FE-021

> Budget ≤ 10 KB (`policies\documentation.md` §4) · reviewer · หลัง fix2 · รอบที่ปิดแล้วคง verbatim; รอบ 9 เป็น remediation:SEC-03 ไม่ใช่รอบแก้ FE-021

## Findings

### REV-015

- **Severity:** Important
- **Task:** FE-021
- **Location:** `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx:1626`
- **Problem:** spinner หลัง required load ล้มก่อนมีกริดจากรอบ 10 แก้แล้ว: loading branch ตรวจ `!requiredLoadFailed` ก่อนทั้ง `isRestoringSchedule` และ `!isScheduleDataReady`; empty branch :1757 ตรวจ failed state เดียวกัน จึงคง header/toast และไม่แสดง `noDataFound` แทน failure
- **Reference:** REQ-021 AC-067/AC-068 · DES-018 §43.2b ข้อ 4(a)–(d),5.4 · FE-021 Scope required-load fail-closed
- **Owner:** frontend-engineer
- **Disposition:** resolved หลังอ่าน fix และ action gates ปัจจุบัน: failed flags :346 → `generationBlocked` ของ hook :963 → `requiredLoadFailed` :440; missing-term restore :1009–1013 และ class-period failure :1439–1443 ออกจาก spinner ได้โดยไม่เปิด write gate

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-006 | Important | `round-10.md` → `[year]/page.tsx:105` (หลักฐานรอบเดิม) | frontend-engineer | resolved |
| REV-007 | Important | `round-10.md` → `src/lib/timetable-request-failure.ts:43` | frontend-engineer | resolved |
| REV-008 | Important | `round-10.md` → `subject-settings/[year]/page.tsx:208` (หลักฐานรอบเดิม) | frontend-engineer | resolved |
| REV-009 | Important | `round-10.md` → `settings/[year]/page.tsx:496` (หลักฐานรอบเดิม) | frontend-engineer | resolved |
| REV-010 | Minor | `round-8.md` → `timetable/page.tsx:71` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-011 | Minor | `round-8.md` → `create-class-period-form.tsx:223` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-012 | Minor | `round-8.md` → `timetable-grid.tsx:459` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-013 | Minor | `round-8.md` → `settings/[year]/page.tsx:745` (หลักฐานรอบเดิม) | frontend-engineer | → backlog |
| REV-014 | Minor | `round-8.md` → `uxui/UX-007-term-context.md:3` (หลักฐานรอบเดิม) | uxui-designer | → backlog |
| REV-015 | Important | `manage-teaching-schedule/page.tsx:1626` | frontend-engineer | resolved |

## Round 11

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-021 | PASS |

- ไม่พบ Critical/Important ใหม่ในขอบเขต fix2; review:REV-015 resolved จาก source ปัจจุบัน. review:REV-006..009 คง resolved ตาม round10; ไม่อ้างว่าได้ตรวจทั้ง 7 routes ใหม่ในรอบนี้. review:REV-010..014 คง backlog ไม่เปิดงานเพิ่ม
- ไม่มีกริด + failure → spinner/empty state ไม่ render; header และ failure toast เดิมไม่ถูกย้าย/ลบ. หาก shell มี classes/control แล้ว `actionsBlocked={generationBlocked}` (:1641) ปิด Save/Generate ที่ `course-list-panel.tsx:280,296`; `handleSave` :720 กัน request ซ้ำ และ Generate :548 ตรวจ gate เดิม. hook :1036–1051 ยังคงยกเลิก pending Generate และไม่เริ่ม run ใหม่เมื่อ blocked
- Test source เพิ่ม/แก้ oracle ตรง AC: term-context :298–315 ตรวจ bridge ไม่มีเทอม/ไม่มี loading/empty/mutation; :319–342 ตรวจ class-period status 0/-1; 403-visible :286–324 ตรวจ loading จบ, header คงอยู่, ไม่มี empty state, Save/Generate disabled และไม่ส่ง write เมื่อ shell มี classes. อ่าน source เท่านั้น ไม่อ้างว่า tests ผ่าน
- ขอบเขต UX-007 คงคำอนุมัติ jtrp98 วันที่ 09/10/2026 เฉพาะ layout/flow/dirty behavior/URL/preselect; full artifact/precise copy/UX-005 ยัง draft. fix นี้ใช้ failure surface/gates เดิม ไม่มี retry control หรือ approval ใหม่
- ข้อจำกัด: static review; ไม่รัน tests/typecheck/lint/build/browser/manual-E2E/git; ไม่อ่าน QA/security/implementer conversation หรือ logs. ไม่ตรวจ deploy/DDL/cutover จริงหรือ schema ใหม่; AC-065 ยังเป็นการตรวจร่วม BE-010 ในขั้นถัดไป. Review PASS ไม่เปลี่ยน Status ของ plan และไม่เท่ากับ released

## Reviewed

- Pack: `AGENTS.md`, `CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/README.md`, `coding.md` §4–6, `documentation.md` §1–5, `templates/review-round.md`; skill `anthropic-skills:school-bright-design/SKILL.md`
- Docs (index-first): module `index.md` Documents; `../../../../build/plan/INDEX.md` Release Scope/Waiting on Human/FE-021, `../../../../build/plan/timetableai--fe-021.md`; `../../shared/requirement/index.md`, `req-012.md`, `req-021.md` AC-066..070/restore clarification; `../design/index.md`, `des-009.md` term contract, `des-018.md` §43.2b, `data-model.md` term/provenance sections; `../uxui/README.md`, `UX-007-term-context.md` flow/approval/draft scope; `index.md`, `round-10.md` เต็ม
- Frontend root = `C:/src/schoolbright/target/sb-tech-upgrade-web-system`; changed files อ่านเต็ม: `src/app/[locale]/timetable/manage-teaching-schedule/page.tsx`, `tests/integration/timetable-fe021-term-context.test.tsx`, `tests/integration/timetable-403-visible.test.tsx`
- Import neighbours อ่านเฉพาะ action/load contract ที่เกี่ยว: `src/lib/timetable-required-load.ts`, `src/lib/timetable-request-failure.ts`, `src/app/[locale]/timetable/manage-teaching-schedule/_lib/use-timetable-generation.ts` :943–1066, `src/components/layout/home/manage-teaching-schedule/course-list-panel.tsx` action guards

## Change Log

- 2026-10-09 — Round 11 หลัง FE-021 fix2 — PASS; REV-015 resolved, REV-006..009 carry resolved, REV-010..014 คง backlog; static review ไม่อ้างผล tests และไม่แก้ code/plan/closed rounds

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`
