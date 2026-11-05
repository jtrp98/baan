# timetableai — Review Round 13 — FE-021

> Budget ≤ 10 KB (`policies\documentation.md` §4) · reviewer · additional fixture-only round ตามคำอนุมัติ jtrp98 2026-10-11; ไม่ reset fix count และ closed rounds คง verbatim

## Findings

ไม่พบ Critical/Important หรือ finding ใหม่ในขอบเขต fixture รอบนี้; รายการเดิมด้านล่างเป็น carry เท่านั้น ไม่เปิดงานเพิ่มหรืออ้างว่าได้ตรวจ fix เดิมซ้ำ

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-006 | Important | `round-10.md` → `[year]/page.tsx:105` (หลักฐานเดิม) | frontend-engineer | resolved |
| REV-007 | Important | `round-10.md` → `src/lib/timetable-request-failure.ts:43` (หลักฐานเดิม) | frontend-engineer | resolved |
| REV-008 | Important | `round-10.md` → `subject-settings/[year]/page.tsx:208` (หลักฐานเดิม) | frontend-engineer | resolved |
| REV-009 | Important | `round-10.md` → `settings/[year]/page.tsx:496` (หลักฐานเดิม) | frontend-engineer | resolved |
| REV-010 | Minor | `round-8.md` → `timetable/page.tsx:71` (หลักฐานเดิม) | frontend-engineer | → backlog |
| REV-011 | Minor | `round-8.md` → `create-class-period-form.tsx:223` (หลักฐานเดิม) | frontend-engineer | → backlog |
| REV-012 | Minor | `round-8.md` → `timetable-grid.tsx:459` (หลักฐานเดิม) | frontend-engineer | → backlog |
| REV-013 | Minor | `round-8.md` → `settings/[year]/page.tsx:745` (หลักฐานเดิม) | frontend-engineer | → backlog |
| REV-014 | Minor | `round-8.md` → `uxui/UX-007-term-context.md:3` (หลักฐานเดิม) | uxui-designer | → backlog |
| REV-015 | Important | `manage-teaching-schedule/page.tsx:1626` (หลักฐาน round11) | frontend-engineer | resolved |
| REV-016 | Minor | `uxui/UX-009-continuity-and-subject-groups.md:75` (historical metadata จาก driver; ไม่ตรวจซ้ำ) | uxui-designer | → backlog |

## Round 13

**Verdict:** PASS

| Task | Verdict |
|---|---|
| FE-021 (fixture-only round) | PASS |

- Task diff ที่ driver ส่งให้ตรวจ = test file เดียว 69 additions/7 deletions จาก staged baseline; อ่าน diff และไฟล์ปัจจุบันเต็มแล้ว พบเฉพาะ fixture/plumbing/assertions. ไม่มี production/deps/config ใน diff นี้; การยืนยันว่าไม่มี path อื่นเปลี่ยนเป็น scope audit ของ driver ไม่ใช่การรัน git ของ reviewer
- `tests/integration/timetable-session-expired.test.tsx:90` fixture มีสอง opaque terms; cache `:158` ผูก school 7/year 2569 แยก bridge. Terms200 ใช้เฉพาะสาม term-dependent targets `:187`; teachers/all-courses200 `:111` กัน 401 ของ lookup ที่เริ่มก่อน Terms ไม่ให้ซ่อน target. target ยังตอบ401 `:114`; `:193` ยืนยันถูกเรียกจริงและ `:198` ตรวจ nSchoolID/nYear/sTermID จาก URL. ตรง DES-009 §34.2/2a, AC-026/027; hook `use-timetable-terms.ts:78,84,88` validate Terms ก่อนเลือก
- Terms401 route `/timetable/[year]` `:177` ไม่เปิด allowTerms200; `:146` ตรวจ SessionExpired พร้อม token/user data ถูกล้าง. Toaster/ToastProbe อยู่นอก AuthProvider `:357` และ `:206,366` ตรวจไม่มี toast จึงไม่เป็น assertion ที่หายไปเมื่อ provider ถอด page. wrapper `src/lib/auth-headers.ts:79,109` และ receiver `src/contexts/auth-context.tsx:143` ใช้ auth semantics เดิม (AC-063/066)
- Empty/multiple-no-choice/malformed Terms `:209` ตัด cache ปัจจุบัน แต่ใส่ cache ผิด school/year และคง global bridge; รอ alert `:222` แล้วตรวจไม่ส่ง setting/get, Save disabled, คลิก Save และไม่ส่ง setting/set หรือ POST อื่น `:224`. ตรง DES-009 §34.2a และ AC-068; caller `settings/[year]/page.tsx:230,274,755` ยังกัน load/write เมื่อไม่มี term หรือ required load ยังไม่สำเร็จ
- Add-teacher401/403/200 `:411,427,444` ให้ class-period200 `{status:1,data:{lstPeriods:[]}}` ตรง DES-018 §43.2b ข้อ2/5.1 และ predicate จริง `teacher-groups-tab.tsx:211`. requiredLoaded `:216,354` จึงพร้อมให้ทดสอบ action; target response เดิมไม่เปลี่ยน. Assertions `:419,435,452` คง SessionExpired/no-toast, 403 visible+rollback เป็น0/token kept และ 200 optimistic count1/no-error. ไม่เปลี่ยน required-load/auth/toast/rollback production semantics
- `settleRequiredLoad` `src/lib/timetable-required-load.ts:26,32` ยังบังคับ HTTP success + status1 + caller shape; `src/lib/timetable-request-failure.ts:15` ยังข้าม toast เฉพาะ401. Neighbour term-context tests `:389,399,439` คง invalid/no-choice/non1 fail-closed oracle; รอบนี้ไม่มีการแก้ neighbour
- ข้อจำกัด: static review เท่านั้น ไม่รัน tests/typecheck/lint/build/browser/git และไม่อ่าน QA/security/implementer logs. ไม่ใช่ผล runtime, release acceptance หรือการปิด QA failure เดิม; plan Status เป็นของ QA. UX-007 ใช้เฉพาะ approved subset เดิม; unsigned details/schema/DDL/cutover/deploy/SWC environment holds ตาม plan คงเดิม. review:REV-010..014 และ review:REV-016 (UX-009) คง backlog ไม่ claim closed
- ส่งต่อ qa-engineer ตรวจ fixture targeted/full regression และ checks ตาม task; หากรอบเพิ่มเติมล้ม ให้กลับ gate4 ตามคำอนุมัติเพียง1รอบ ไม่แก้ต่ออัตโนมัติ

## Reviewed

- Pack `CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/README.md`, `coding.md` §4–6, `documentation.md` §1–5, `templates/review-round.md`; repo `AGENTS.md`, `CLAUDE.md`, `package.json`
- Docs index-first: module `index.md` Documents; `../../../../build/plan/INDEX.md` Release Scope/Waiting on Human/FE-021, `../../../../build/plan/timetableai--fe-021.md`; `../../shared/requirement/index.md`, `req-012.md`, `req-021.md` AC-063/066..070; `../design/index.md`, `des-009.md` §34.2/2a/3/4, `des-018.md` §43.2b, `data-model.md` §27.5 term fields; `../uxui/README.md`, `UX-007-term-context.md` approval/unsigned scope; `index.md`, `round-11.md`
- Frontend root `C:/src/schoolbright/target/sb-tech-upgrade-web-system`: changed file `tests/integration/timetable-session-expired.test.tsx` เต็ม; neighbours `_support/timetable-401-harness.tsx` และ `timetable-fe021-term-context.test.tsx` เฉพาะ context/oracle sections
- Actual prerequisites/callers: `src/app/[locale]/timetable/_hooks/use-timetable-terms.ts`, `src/lib/timetable-required-load.ts`, `src/lib/timetable-request-failure.ts`, settings/subject-settings/create-class-period `[year]/page.tsx` load/write guards; `manage-timetable/[year]/teacher-groups-tab.tsx` required loads/optimistic action; `src/lib/auth-headers.ts`, `src/contexts/auth-context.tsx` auth receiver sections
- Authorized readonly task diff `C:/Users/jabja/AppData/Local/Temp/codex-fe021-fixture3-20261011.diff`; ไม่ใช่ implementer check log

## Change Log

- 2026-10-11 — Round13 FE-021 additional fixture-only round — PASS static; ไม่มี finding ใหม่, carry เดิม; ไม่รัน checks หรือเปลี่ยน plan Status/closed rounds

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`