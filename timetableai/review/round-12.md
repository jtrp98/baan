# timetableai — Review Round 12 — UX-008..UX-013

> Budget ≤ 10 KB (`policies\documentation.md` §4) · เขียนโดย `reviewer` เท่านั้น · static review ของ draft deliverables; ไม่ใช่ human sign-off หรือ runtime verification

## Findings

### REV-016

- **Severity:** Minor → backlog
- **Task:** UX-009
- **Location:** `uxui/UX-009-continuity-and-subject-groups.md:75`
- **Problem:** คำว่า "เวลาติดกันจริง" อาจถูกอ่านว่า end ของคาบแรกต้องเท่ากับ start ของคาบถัดไป ทั้งที่ DES-012 BR-29 ระบุว่าช่องว่างเวลาเปลี่ยนคาบที่ template ไม่ประกาศเป็นคอลัมน์พักไม่ทำให้ขาด continuity. ควรเติมถ้อยคำอ้างช่องเรียนลำดับถัดกันและตัวแบ่งพัก/lunch ให้ชัดเมื่อปรับ copy. Flow และ error copy ของ draft ระบุไม่มีคาบพักคั่นแล้ว จึงยังไม่มีหลักฐานว่าร่างสั่งปฏิเสธช่องว่างดังกล่าวหรือทำให้ AC ไม่ผ่าน; เป็นการลดความกำกวมของถ้อยคำ ไม่บล็อก draft และไม่เพิ่มกติกาธุรกิจ.
- **Reference:** UX-009 Acceptance; REQ-015 AC-036/AC-037; DES-012 §37.1 BR-29
- **Owner:** uxui-designer; project-manager รับรายการ → backlog ตาม scope เดิม

## Open Findings

| ID | Severity | path:line | Owner | Status (open/resolved/→ backlog) |
|---|---|---|---|---|
| REV-016 | Minor | `uxui/UX-009-continuity-and-subject-groups.md:75` | uxui-designer | → backlog |

## Round 12

**Verdict:** PASS

| Task | Verdict |
|---|---|
| UX-008 | PASS |
| UX-009 | PASS |
| UX-010 | PASS |
| UX-011 | PASS |
| UX-012 | PASS |
| UX-013 | PASS |

- UX-008: ครบ 5 จุดเข้า/เลือก source-destination, all เลือก 0..ทุกตาราง, Preview→Confirm→Apply, overwrite/partial แยกการยืนยัน, missing-template/dependents บล็อกทั้งคำสั่ง, token invalidation และผล Apply จริง/อิสระจากต้นทาง ตรง AC-029..032/050/051 และ DES-010 §35.7/8/9.
- UX-009: whole-block ย้าย/สลับ/ลบ/ล็อก, link exception, ครูชนะ N, warnings BR-53 ครบสี่ตัวไม่บล็อก, G2/รหัสเดียวกัน/ครูไม่ทราบ, VR-17 และ preserve blob ตรง AC-036..037c และ DES-012/017; REV-016 ไม่บล็อก.
- UX-010: mapping 1:1/read-only ต่อเซลล์, capacity นับห้องต่างกันพร้อมกัน, ผู้ดูแลเป็นตัวจำกัดสิทธิ์, cross-system/fail-closed และ warning/ผล save จริง ครบ AC-038/038a/039/040. C2 editor กับ C1′ read-only แยก conditional ตาม DES-013; ไม่ถือ K=1/SA-Q5/9/10 หรือ §27.6 เป็น human approval.
- UX-011: ชั่วโมงเต็มทั้งวัน/สัปดาห์, fallback รายคน→รวมต่อฟิลด์/ค่า 0, VR-12/13, M1/ไม่ migrate flag, ห้องรับผิดชอบอ่านอย่างเดียวสามบทบาท และ BR-44 tooltip ถูกต้อง ครบ AC-041..046a/ DES-014/015. คง schema/breaking/cutover gates ไม่ถาม BR-42 ซ้ำ.
- UX-012: ตรวจก่อน solver ทุก sub-course ของทุกแผน×ห้อง, blockers สองเหตุ/RoomCaretaker detail, รายการเปิดครบ, shortcut runtime+fallback, recheck คงกริด/ล็อกและไม่ปลดด้วย failed/stale loads, warnings ไม่บล็อก ตรง AC-033..035/ DES-011.
- UX-013: entry [year], active gate/หลายชุด, BR-60 บล็อกเฉพาะคู่ซ้ำ, เตือนแทนที่ทุกครั้งรวม retry, ผลรายคู่/invalid rows, unknown commit และ record-only recovery ครบ AC-047..049/052/053. calculate=true เป็นธุรกิจยืนยัน; defaults/mapping/pure preview/T1/receipt เป็น proposal ตาม DES-016 §41.4a รอ owner ไม่อ้าง DTO/transaction ที่ยืนยันแล้ว.
- ทุก draft มี flow, fields, loading/empty/error/success/no-permission, copy, layout/responsive, keyboard/focus/long-text/token notes และ Sign-off ว่าง. README ลงทะเบียนครบและไม่ขยาย UX-007 partial approval. ความครบของ unsigned draft เป็นเกณฑ์ task รอบนี้; ไม่ได้ใช้ human UX/schema gates เป็นเหตุ FAIL.

ข้อจำกัด: ตรวจเอกสารและ source excerpts ของ pages ที่ draft อ้างเท่านั้น ไม่รัน git/tests/build/browser/live API ไม่อ่าน QA/security/implementer logs ไม่วัด contrast และไม่ตรวจ solver child files/DB จริง. Page sources ยืนยัน hub ปี/เทอม, toggle isActive ที่ [year], continuity/group parser/serializer, settings mock/เพดานคาบเดิมและ workspace readiness/legacy room snapshot; การไม่พบ target reason/endpoint ใน page ไม่พิสูจน์ว่าไม่มีทั้ง repository. Backend claims ของ Academic ใช้ current DES-016 เป็นหลักฐานอ้างต่อ ไม่ได้ตรวจ backend ใหม่เอง.

ประตูที่คงอยู่: คนเซ็น UX ก่อน FE ใช้ draft; owner ยืนยัน §27.6/SA-Q5/9/10, H1/ชั่วโมง/breaking/cutover และ T1 concrete contract ตาม Waiting on Human. archive:2717 ไม่ใช่คำอนุมัติ. คำอนุมัติ UX-007 ของ jtrp98 09/10/2026 คงขอบเขตเดิม. Round นี้ไม่เปลี่ยน Status/sign-off/contract/code/risk acceptance; findings เดิมของ FE-021 คงผลตาม round-11 ไม่ตัดสินใหม่. ส่งต่อ qa-engineer ตรวจ draft deliverable AC และตั้ง Status ตาม solo ownership; PASS ของร่างไม่ใช่ release/การรับงานโดยมนุษย์.

## Reviewed

Paths ใต้ `C:/src/schoolbright/knowledge/timetableai/` เว้นแต่ระบุอื่น; อ่านเฉพาะส่วนที่ใช้/คำค้นตาม brief:

- `index.md`; `plan/index.md` Release Scope/Waiting on Human/UX task rows; `plan/ux-008.md`..`plan/ux-013.md`
- `requirement/index.md`; `requirement/req-013.md`..`requirement/req-019.md`; `requirement/req-021.md` auth/failure AC
- `design/index.md`; `design/des-009.md` §34.2a/34.6; `design/des-010.md`..`design/des-017.md` task contracts; `design/des-018.md` §43.2b/auth refs; `design/data-model.md` §27.6 approval provenance/M1
- `uxui/README.md`; `uxui/UX-007-term-context.md` approved subset/unsigned details
- `uxui/UX-008-copy-across-term-year.md`; `uxui/UX-009-continuity-and-subject-groups.md`; `uxui/UX-010-subject-rooms.md`; `uxui/UX-011-teaching-caps-and-homeroom.md`; `uxui/UX-012-generate-precheck.md`; `uxui/UX-013-academic-push.md` — ทุก changed artifact อ่านครบ
- `review/index.md`; `review/round-11.md` Open Findings
- Source excerpts/คำค้นใต้ `C:/src/schoolbright/target/sb-tech-upgrade-web-system/src/app/[locale]/timetable/`: `page.tsx`, `[year]/page.tsx`, `settings/[year]/page.tsx`, `subject-settings/[year]/page.tsx`, `create-class-period/[year]/page.tsx`, `manage-timetable/[year]/page.tsx`, `manage-teaching-schedule/page.tsx`
- Pack `C:/src/schoolbright/rong-ngang-workspace/`: `CLAUDE.md`, `.claude/agents/reviewer.md`, `policies/README.md`, `policies/coding.md` §4–6, `policies/documentation.md` §4–5, `policies/ux.md` §1, `templates/review-round.md`
- Skill `C:/Users/jabja/.codex/plugins/cache/claude-cowork/anthropic-skills/1.0.0/skills/school-bright-design/SKILL.md`

## Change Log

- 2026-10-09 — Round 12 — PASS ทุก UX-008..013 draft; REV-016 Minor → backlog, ไม่มี Critical/Important ใหม่; static review ไม่ใช่ runtime verification/sign-off

Back-links: `plan\index.md` · `..\index.md`