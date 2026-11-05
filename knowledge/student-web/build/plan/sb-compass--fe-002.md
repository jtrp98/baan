# FE-002 — Fix WORD-01-violating wording in the MyCompass mockup

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

แก้ถ้อยคำที่ละเมิด WORD-01 ใน `Views/Compass/MyCompass.cshtml` + `assets/js/compass-design.js`/`compass-design-data.js`/`compass-design-engine.js` + `Views/Compass/Analytics.cshtml` (บรรทัด 75 และ 110 — เพิ่ม 2026-09-15 ตาม UXUI sign-off หลังพบviolationจริงในหน้า REQ-004 ซึ่ง DES-020 ผูกไว้ในขอบเขต): ห้ามใช้ "เทียบเครือข่ายทั่วประเทศ"/"ระดับประเทศ"/ถ้อยคำที่สื่อความหมายเดียวกัน — ใช้กรอบ "เทียบกับนักเรียนในระบบ SchoolBright" แทน (สำเนาสุดท้ายเป็นของ `uxui-designer`; `business-analyst` ตรวจไม่ให้อ้างเกินฐานข้อมูลจริง) — WORD-01 เป็นข้อกำหนดจากการปิด RISK-09 — ฐานเทียบจริงคือนักเรียนในระบบ SchoolBright ไม่ใช่ทั้งประเทศ และ v11 ขยายขอบเขตครอบไฟล์ MyCompass แล้ว · task นี้ anchor ที่ DES-020 (WORD-01 — addressable แล้วตาม design.md amend 2026-09-13) กับ `Contract:StatWordingRules.v1`/`DEC-020` ของหัวข้อเดียวกัน — สำเนาสุดท้ายยังรอ `uxui-designer` (EVD-021 unresolved)

## References

REQ-019, AC-019.2, DES-020, DEC-020

## Scope

แก้เฉพาะถ้อยคำอธิบายฐานเทียบ — ความหมายที่ต้องสื่อคือ "เทียบกับฐานนักเรียนในระบบ SchoolBright" ไม่ใช่ทั้งประเทศ;
ถ้อยคำสุดท้ายรอ `uxui-designer` เขียนและ `business-analyst` ตรวจ — task นี้ apply สำเนาที่ผ่านการตรวจแล้วเท่านั้น

- Security-sensitive: yes

## Out of Scope

ไม่แตะตัวเลขมอคอัปอื่น (`"อันดับ 3,693 จาก 4,191 คน"` ฯลฯ — ยังเป็น mock data ไม่ต่อ backend จริง และไม่ใช่ขอบเขต WORD-01),
สูตร/ตรรกะการจัดอันดับของมอคอัป, schema/payload ใด ๆ; ห้ามแตะไฟล์อื่นนอกเหนือจากที่ระบุ

## Expected Output

none

## Acceptance

AC-019.2: การแก้เป็นการแก้ชั้นข้อความแสดงผลของหน้า MyCompass เท่านั้น — ฟีเจอร์/ตรรกะเดิมของมอคอัปคงอยู่ครบ (ไม่ใช่การตัดฟีเจอร์)

## Dependencies

—

## Handoff

ตรวจ AC-019.2 ด้วยการ grep ยืนยันว่าไม่เหลือถ้อยคำต้องห้าม ("ทั่วประเทศ"/"ระดับประเทศ" และความหมายเดียวกัน) ในทั้ง 5 ไฟล์
และ diff แสดงว่ามีการแก้เฉพาะข้อความ — ไม่มีตัวเลข/ตรรกะ/schema ถูกแตะ; แนบสำเนาที่ `uxui-designer`/`business-analyst` อนุมัติ
ถอดกลับได้โดย revert ข้อความ — ไม่มี logic/schema เปลี่ยนจึงไม่มีผลข้างเคียง; ห้ามถอดเป็นบางไฟล์ (ข้อความเดียวกันต้องสอดคล้องทั้ง 4 ไฟล์)

## Sequencing Notes

- Phase 1 has no dependency and must finish before Phase 3 and Phase 4 (both consume the weighted
  aggregation method Phase 1 creates).
- Phase 2 has no dependency on Phase 1 and can start in parallel — **but its `CheckEntitlement` step-4
  chain (BE-004 → BE-005/006/007/012) is blocked at OQ-15(a1)/(a2)/PRE-06, not at BE-013.** BE-008
  (IP allowlist) and BE-009/010/011 (identity fix) are not blocked and can start immediately.
- Phase 4 needs both Phase 1 (weighted values) and Phase 2 (BE-005, so breakdown data can't leak to
  non-Premium users) — REQ-016 AC5.
- Phase 3's DES-012 renaming work should happen in the same pass as its REQ-017/DES-011 work (see task
  note on BE-014) — do not land snake_case columns first and rename later.
- Phase 5 (REQ-019 wording) is **not blocked by and does not block Phases 1–4** — it can run any time.
  **OQ-25 (REQ-019's timeline) is explicitly assigned to `project-manager` to resolve as sequencing, not
  a business question** (`requirement.md` OQ-25) — resolved here as: no calendar trigger exists, so
  Phase 5 is sequenced last only because its scope (wording-only) is currently the smallest actionable
  slice of REQ-019; the rest of REQ-019 waits on a `system-analyst` amend (see Phase 5 note above), not
  on a date.
- **REQ-018 (retiring REQ-005/REQ-007) has no phase and is not sequenced anywhere in this plan.** Per
  `design.md` DES-014, the trigger (N=4 weeks after `sb-compass-faculty-match` REQ-011/REQ-012 reaches
  production) hasn't occurred. When it does, `devops`/`project-manager` re-open this plan to add the
  retirement task(s) — this is a tracking responsibility, not a standing task.
- **REQ-006 (Gap Report, old form)** retires per REQ-019's decision but its replacement ("แผนพัฒนา" step
  after target-setting) is defined in `sb-compass-faculty-match`, not here (see that module's OQ-23) —
  no task in this plan represents the replacement; `sb-compass`'s existing REQ-006 code
  (`CompassPathCatalog.cs`) continues to exist and is gated by Phase 2/REQ-018 exactly as before, unaffected
  by this plan.
- OQ-21/OQ-22 (closed 2026-09-02) did not unblock any previously-blocked task in this plan — OQ-21's
  closure unblocks `sb-compass-faculty-match`'s RIASEC/Confidence contracts (that module's plan), and
  OQ-22's closure produced REQ-018/DES-009/DES-014 (the deferred item above), not a task here.
- **Deploy prerequisite (not a QA gate) — Phase 1**: Phase 1 is `verified` (FULL QA round 2026-09-02)
  but **must not be deployed to users standing alone.** BE-001/BE-002/BE-003 make `calculate/score`
  return **weighted** subject scores, while `CompassRankingService.GetStudentNationalStatsAsync` and
  `RecomputeAsync` still derive the network **mean/rank from the unweighted** method — correct per this
  plan today (switching them is Phase 3's BE-014 batch + BE-017 request-time work), but exactly the
  pairing `design.md` `## Subject Score Aggregation Rules` rule 0 row 5 warns against
  ("ต้องตรงกับ batch ไม่งั้นอันดับเพี้ยน"). So Phase 1 ships **either** in the same release as Phase 3
  (BE-014 + BE-017 both on the weighted method, then Phase 3's `?limit=0` recompute below) **or** with an
  explicit weighted-score/unweighted-rank mismatch that is written down and **accepted by a human before
  release** — `devops` must put that choice in front of the user; no agent may accept it. Source:
  `review.md` ISS-02 (2026-09-02 round, Important — sequencing, not a code defect; owner
  `project-manager`/`devops`). This is a release-bundling constraint only: it adds no dependency edge
  (BE-014/BE-017 already depend on Phase 1) and changes no task's Status, Owner, Depends-on or Tier.
- **Deploy prerequisite (not a QA gate) — Phase 2**: PRE-06 (SB PLUS team adds `"FeatureCode"` column —
  script ready at `_docs/module/sb-compass/sql/pre-06-add-feature-code.sql`) must land before BE-004's
  step 4 / BE-005/006/007/012 can even be written, then PRE-01/02/03 before deploy.
- **Deploy prerequisite (not a QA gate) — Phase 3**: after deploy, must run network-wide recompute
  (`?limit=0`) before opening the Premium page to users — `## National Stats Batch Rules`/RISK-01.

## Unresolved Open Questions

- **OQ-15(a1)/(a2)** — ปิดฝั่งธุรกิจแล้ว 2026-09-15: ผู้ใช้ยืนยันรหัส FeatureCode ในระบบ SB PLUS แล้วคือ `compass_premium` และ `compass_admin_ops` (ตรงกับค่าคงที่ใน `CompassEntitlementService`) ปลดบล็อกฝั่งโค้ดของ BE-004; ยังคงรอทีม SB PLUS/devops รันสคริปต์เพิ่มคอลัมน์ `"FeatureCode"` (PRE-06) ในฐานข้อมูลจริงก่อน deploy
- **OQ-16** — ปิดแล้ว 2026-09-15: ผู้ใช้ยืนยันรูปแบบการแสดงผลเป็น Table in Card (การ์ดตามกลุ่มสาระ บรรจุตารางรายวิชา) และข้อความกรณีไม่มีหน่วยกิตคือ `"ไม่มีข้อมูลหน่วยกิต"` (ปลดบล็อก FE-001)
- **ISS-01 (ทศนิยมใน Gap Report)** — ปิดฝั่ง design แล้วใน `design.md` v16 (DES-015 กฎข้อ 5, Contract:SubjectScoreAggregation.v1, DEC-015, EVD-022); ขยายขอบเขตและ reopen Task BE-003 เป็น `Status: pending` ให้ครอบคลุมการแก้ `CompassPathCatalog.BuildAdvice` ไม่ให้ re-round เป็น 0 dp และส่ง 2 dp ใน Gap Report เพื่อให้ `backend-engineer` นำไป implement ต่อ
- **OQ-24/OQ-25** — see `sb-compass-faculty-match` and Sequencing Notes above; OQ-24 does not block this
  plan (REQ-008 replacement stays Later regardless of its answer).
- **REQ-019 remainder (no task in this plan)** — `requirement.md` confirms Analytics.cshtml/PathFinder.cshtml
  are actually retired in favor of `MyCompass.cshtml` and REQ-001–004/006(new form)/008 must still be served
  through the new page, but `design.md`'s only amendment covering it (WORD-01 §3) is wording alone — the page
  rewire and the content gaps (REQ-002/REQ-003 equivalents, REQ-006's "แผนพัฒนา" step — OQ-23 of
  `sb-compass-faculty-match`, REQ-008's replacement — OQ-24) have no `DES-NNN` contract section yet. Writing
  backend/frontend tasks for that now would invent scope no contract backs — needs a `system-analyst` amend
  before it is task-able.
- **RESOLVED 2026-09-13 — WORD-01 (`DES-020`) registration** (was: `DES-020` was not an addressable claim,
  so FE-002 anchored provisionally on DES-021 with that section's schema/breaking-contract gate parity):
  `system-analyst` registered `## DES-020 — WORD-01: …` in `design.md` (`Contract:StatWordingRules.v1`,
  `DEC-020`, evidence EVD-019..021 — EVD-021/DEC-020 stays `unresolved` until `uxui-designer`'s final copy)
  with no gate-triggering decisions. FE-002 is re-anchored on DES-020 and the forced gates are removed;
  nothing remains open from this item.

## Change Log

- 2026-09-02 — Wrote `plan.md` fresh (file did not exist in the working tree; prior version existed
  only in git history and the user declined restoring it, then confirmed a second time to also discard
  its tracked implementation/QA status). Rebuilt Phases 1–4 verbatim from `design.md` Contract Version 11
  Modules A–D and the task bodies already captured in `knowledge/sb-compass/task/*.yaml` (same task IDs,
  same `DES-NNN`/dependency references — content not altered, only `Status` reset to `pending` for all
  20 tasks per explicit user instruction to start fresh). Added Phase 5 (REQ-019 wording-only slice,
  WORD-01 §3) — the rest of REQ-019 intentionally left unplanned pending a `system-analyst` amend.
  Deliberately did not create a phase/task for REQ-018 (DES-009/DES-014 confirm no trigger date exists
  yet). Flagged Phase 2 as `🔒 Security gate` per Module B's Security Considerations.
- 2026-09-07 — Structure-reconciliation pass (Bucket F): `sta --check-plan --module sb-compass` flagged
  BE-013 and FE-002 as citing no `DES-NNN`. Added `DES-019` to BE-013 — `design.md`'s reconciliation
  pass (same date) registered `DES-019` for `## Deployment Prerequisites` (PRE-01..PRE-06), and BE-013's
  citation (`PRE-05`) is a row of that same section, so `DES-019` is the correct contract id (not
  `DES-004`, which covers `CheckEntitlement`'s actual query logic, not the prerequisite verification
  step feeding it). **FE-002 left unchanged** — `design.md`'s `## Feature-by-Feature Feasibility` table
  (`DES-001`..`DES-019`, confirmed complete, no `DES-020`+ exists) has no row for `WORD-01`/REQ-019;
  `WORD-01` is a real contract (`## Risks & Dependencies` § WORD-01) but was never assigned a `DES-NNN`
  during either the original authoring or the 2026-09-07 reconciliation pass, which covered five other
  contract sections but missed this one. Not a case of a task needing no citation — it's a `design.md`
  gap outside `project-manager`'s authority to fix; flagging for `system-analyst` to add the missing
  `DES-NNN` row (or confirm none is intended) before this citation can be completed here.
- 2026-09-07 — `system-analyst` registered `DES-020` in `design.md` (`## Feature-by-Feature Feasibility`
  + `## Risks & Dependencies` § WORD-01) for the WORD-01 contract, closing the gap flagged above. Added
  `DES-020` to FE-002's citation, now `FE-002 (DES-020, WORD-01 §3, REQ-019)`.
- 2026-09-08 — Added the optional `Tier` column to all five phase tables and cast exactly one
  phase-level `Tier` per table (all rows blank otherwise), per `policies/architecture.md`/this role's
  contract; no task IDs, Status, Owner, or Depends-on cells touched. Casts and rationale: **Phase 1
  (BE-001) → T4** — the new weighted-aggregation method is a shared dependency consumed by three
  separate call sites (`calculate/score`, Fit Score, Gap Report) with a six-rule fallback/edge-case
  contract, matching T4's "hard or risky implementation across a contract or several modules." **Phase 2
  (BE-004) → T2** — the phase carries the plan's only `🔒 Security gate`: raw parameterized SQL against
  entitlement/subscription tables, fail-closed authorization logic, IDOR/broken-access-control failure
  modes per Module B's Security Considerations; T2 is "the highest tier a plan may cast" and this is the
  security-grade work that tier exists for. **Phase 3 (BE-014) → T3** — batch national-stats recompute
  combines three concerns in one pass (weighted aggregation, new `StddevScore` population-stddev logic,
  and a 22-call-site PascalCase rename across two services) feeding network-wide rankings; analysis-grade/
  risky-implementation, not security-sensitive. **Phase 4 (BE-018) → T5** — additive view-model + UI work
  with a bounded, already-specified data-shaping contract (`## Premium Subject Breakdown Contract`); no
  security gate, moderate but not hard implementation. **Phase 5 (FE-002) → T6** — pure wording/copy
  change, no schema/logic/payload touched, matching T6's "fast mechanical work." Did not cast reserved
  `T1` anywhere and did not cast any analysis-only content (there is no separate analysis phase in this
  plan — all five phases are implementation phases).
- 2026-09-08 — Added `## Execution Runbook` (copy-pasteable `sta run` commands grouped into rounds by
  phase/Tier, with blocked-vs-runnable status per task as of today). Mechanical addition only — no task
  IDs, Status, Owner, Depends-on, or Tier values changed in any phase table.
- 2026-09-13 — แปลงตาราง task เป็น PlanTask format 1 — ไม่เปลี่ยน task id/status/owner/dependency/Tier ใด ๆ (โครงสร้างเท่านั้น)
- 2026-09-13 — FE-002 re-anchored to DES-020 after `system-analyst` registered WORD-01 as addressable
  `## DES-020` (`Contract:StatWordingRules.v1` / `DEC-020`) in `design.md`: Traceability now
  `REQ-019, AC-019.2, DES-020, DEC-020`, Consumes `Contract:StatWordingRules.v1`, retrieval Provenance cites
  the same claims, and the provisional DES-021 anchor plus its forced schema/breaking-contract gate parity are
  removed (`Human gate: business` only — `Risk: business` requires it). No other task changed.
- 2026-09-14 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim: BE-001,
  BE-002, BE-003 → `verified` (Phase 1 FULL QA round, 2026-09-02, `dev` workspace `C:\src\sb-web-student`).
  No other Status, Owner, Depends-on, or Tier value touched. ISS-02 (Phase 1 deploying alone pairs
  weighted scores with unweighted ranks) still needs a `project-manager` sequencing judgment in
  `## Sequencing Notes` — not resolved by this relay.
- 2026-09-14 — Sequencing-note-only amend answering ISS-02 from `review.md`'s 2026-09-02 Phase 1 round
  (`## Knowledge sync — three-repo mode`: "ISS-02 needs a `project-manager` sequencing note in
  `plan.md`'s Sequencing Notes / Phase 3 deploy prerequisite"). Added **Deploy prerequisite (not a QA
  gate) — Phase 1** to `## Sequencing Notes`, in the same style as the existing Phase 2/Phase 3 notes:
  verified Phase 1 must not be deployed to users on its own, because its weighted `calculate/score`
  pairs with the still-unweighted `CompassRankingService` mean/rank until Phase 3 (BE-014/BE-017) lands
  — the failure `design.md` `## Subject Score Aggregation Rules` rule 0 row 5 predicts
  ("อันดับเพี้ยน"). Resolution recorded as: release Phase 1 together with Phase 3, or obtain an explicit
  human-accepted, documented mismatch before release (`devops` surfaces the choice). Not a QA verdict and
  not a re-review of Phase 1 — no task Status, Owner, Depends-on, Tier, or dependency edge was touched,
  and ISS-02 stays `open` in `review.md` until a release decision is actually made there.
- 2026-09-15 — **Unblock FE-001 and BE-004 from OQ-16 and OQ-15(a2) closures**:
  - **FE-001**: ปลดบล็อกงาน frontend แสดง breakdown รายวิชา หลังผู้ใช้ยืนยันรูปแบบ Table in Card (การ์ดกลุ่มสาระ บรรจุตารางรายวิชา) และข้อความกรณีไม่มีหน่วยกิตคือ `"ไม่มีข้อมูลหน่วยกิต"` (ปิด OQ-16 ตาม `design.md` v15); ปรับ `Human gate: none`
  - **BE-004**: ปลดบล็อกขั้นตอนที่ 4 ฝั่งธุรกิจ หลังผู้ใช้ยืนยัน FeatureCode คือ `compass_premium` และ `compass_admin_ops` (ปิด OQ-15(a2) ฝั่งธุรกิจ); คง PRE-06 เป็น deployment prerequisite สำหรับการรัน DDL เพิ่มคอลัมน์ในฐานข้อมูลจริง
  - อัปเดต `## Unresolved Open Questions` บันทึกการปิด OQ-15(a2) และ OQ-16
- 2026-09-15 — **ขยายขอบเขต Task BE-003 และ reopen เป็น `pending` ตามการปิด ISS-01 ใน design.md v16**:
  - ขยาย Objective และ Scope ของ Task BE-003 ให้ครอบคลุมการปรับปรุง `CompassPathCatalog.BuildAdvice` (`ClassOnlineWeb/Helper/CompassPathCatalog.cs:105`) สำหรับ Gap Report (`AI_advice/path`, REQ-006) ไม่ให้ re-round คะแนนเป็น 0 dp (`Math.Round(avg[kv.Key], 0)`), เก็บ `VMGapItem.Current` เป็นทศนิยม 2 ตำแหน่ง, คำนวณ `VMGapItem.Gap` จากค่า 2 ตำแหน่ง, และปรับ format advice text (`{m.Gap:0.##}`) ตามสัญญา DES-015 กฎข้อที่ 5 และ DEC-015 (ปิด ISS-01)
  - เพิ่มเกณฑ์ยอมรับ AC-012.5 (ISS-01) และขั้นตอนการตรวจสอบความถูกต้องพร้อมหลักฐานที่ต้องบันทึก
  - ปรับ `Status: pending` ของ BE-003 เพื่อส่งต่องาน implementation ให้ `backend-engineer` และรอรอบตรวจรับจาก `qa-engineer`
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-013, BE-004, BE-005, BE-006, BE-007, BE-008, BE-009, BE-010, BE-011, BE-012 → `verified`
  (Phase 2 FULL QA round, 2026-09-15, `dev` workspace `C:\src\sb-web-student`). All 10 tasks in Phase 2
  verified and Phase 2 `🔒 Security gate` confirmed closed via `../../modules/sb-compass/build/security.md` Round 4 and functional gating.
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-003 → `verified` (Phase 1 TARGETED QA round, 2026-09-15, `dev` workspace `C:\src\sb-web-student`,
  part 2 — `CompassPathCatalog.BuildAdvice` 2-dp fix closing ISS-01; part 1 call swap was verified in the
  2026-09-02 FULL round). Phase 1 now fully closed.
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-014, BE-015, BE-016, BE-017 → `verified` (Phase 3 FULL QA round, 2026-09-15, `dev` workspace
  `C:\src\sb-web-student`). Phase 3 closed; ISS-02 and ISS-04 closed in `review.md`.
- 2026-09-15 — **Amend Task FE-002: เพิ่ม `Views/Compass/Analytics.cshtml:75,110` เข้าขอบเขต** หลัง UXUI lane sweep
  พบ WORD-01 violation จริง ("เทียบเครือข่ายทั่วประเทศ"; บรรทัด 110 static แสดงเสมอ) ในหน้า REQ-004 ซึ่ง DES-020
  ผูกไว้ในขอบเขตอยู่แล้ว — ตามมติ UXUI sign-off (by `dev`, 2026-09-15, `../../modules/sb-compass/build/uxui/design.md`): ตัดเลข mock "9 โรงเรียน",
  ใช้ถ้อยคำ "เทียบเครือข่าย SchoolBright", Analytics.cshtml บรรทัด 75 → "Stat เทียบเครือข่าย SchoolBright"
  และบรรทัด 110 → "อันดับ + percentile เทียบเครือข่าย SchoolBright" · สำเนาสุดท้ายอนุมัติแล้วใน `../../modules/sb-compass/build/uxui/design.md`
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  BE-018, BE-019, FE-001 -> `verified` (Phase 4 FULL QA round, 2026-09-15, `dev` workspace
  `C:\src\sb-web-student`). Phase 4 closed. FE-001 verified against the signed UXUI artifact
  (`../../modules/sb-compass/build/uxui/design.md`, approved by `dev` 2026-09-15).
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `_docs/module/sb-compass/review.md`'s `## Knowledge sync — three-repo mode` table verbatim:
  FE-002 -> `verified` (Phase 5 FULL QA round, 2026-09-15, `dev` workspace
  `C:\src\sb-web-student`). Phase 5 closed — all 5 phases of the plan are now verified.
  Post-round: ISS-09 (lock-overlay title deviation from signed copy) fixed by frontend-engineer
  same day at `compass-design.js:394` (string-only, MSBuild exit 0) — flagged for QA confirmation;
  ISS-10 (`compass.js:225` borderline wording outside FE-002 file list) awaits a system-analyst
  DES-020 scope ruling.
ส่งต่อ reviewer

Back-links: `INDEX.md`
