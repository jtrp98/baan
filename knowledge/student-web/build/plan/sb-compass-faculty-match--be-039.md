# BE-039 — Final identity/entitlement audit

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

audit รอบสุดท้ายของการยึดตัวตนทั้ง Module H + I-b (รวม Target Major Rules endpoints) — ยืนยันไม่มี endpoint ไหนรับ `SID`/`school_id` จาก body/header ของ client, fail-closed เมื่อตรวจสิทธิ์ไม่ได้, entitlement ถูกกั้นครบทุก endpoint ตาม BE-037/BE-038 — การกั้นที่ทำรายจุดมีโอกาสตกหล่น endpoint เดียวได้ — audit ปิดท้ายคือการยืนยันว่าครบทุกตัวก่อนเปิดใช้จริง

## References

REQ-010, AC-010.1, DES-018, DEC-018

## Scope

เป็นการตรวจ + แก้จุดที่ตกหล่นเท่านั้น ไม่ใช่งานใหม่ · ตรวจราย endpoint ครบทั้งสองโมดูล (รวมชุดเป้าหมาย) · บันทึกผลราย endpoint ไว้เป็นหลักฐาน

- Security-sensitive: yes

## Out of Scope

กลไกตัวตน/entitlement เดิม (แก้เฉพาะจุดที่ audit เจอว่าตกหล่น) · สคีมา · payload ธุรกิจ

## Expected Output

none

## Acceptance

AC-010.1 (ฐาน audit): ไม่มี endpoint ใดของ Module H/I-b รับตัวเลขนักเรียนจาก client และทุก endpoint fail-closed เมื่อตรวจสิทธิ์ไม่ได้ — ผลตรวจราย endpoint ถูกบันทึกครบ

## Dependencies

BE-037, BE-038, BE-044

## Handoff

ตรวจ AC-010.1 (ฐาน audit) ด้วยการไล่ตรวจทุก endpoint ตามรายการ (ซอร์ส + ทดสอบยิงจริง) และเก็บตารางผลราย endpoint (ผ่าน/พบ/แก้แล้ว) เป็นหลักฐาน
audit แก้เฉพาะจุด — revert ต่อจุดได้ · ผล audit เป็นเอกสารหลักฐานก่อนเปิดใช้จริง

## Sequencing Notes

- Phase order follows `design.md`'s Module dependency chain: **E → F → G → I-a**, and separately **E →
  H** (with the flagged Module K gap — see Phase 7) and **G → I-a/I-b** (shared SSO + screen frame).
  Phase 5 (I-b) itself doesn't strictly need Phase 7 (H) to finish first, but Phase 8 needs both.
- **Phase 2 (Module F) is blocked end-to-end on the `glm-5.2` API key (RISK-F01/PRE-F01)** — BE-008
  onward cannot be tested for real until the key exists; BE-002/003/004 can proceed without it.
- **Phase 3 (Module G) auth requirement is closed per OQ-F08** (2026-09-15) — BE-013 uses the existing SchoolBright Staff/Admin Login session, unblocking Phase 3 tasks.
- **Phase 5's new Target Major Rules tasks (BE-040–044, FE-011) depend on Phase 5's own RIASEC-submission
  work being complete** (see the dependency-uncertainty bullet below) — do not start BE-041 before
  confirming which existing task actually writes `TCompassRiasecResult`.
- **Phase 8 is cross-cutting and depends on `sb-compass` OQ-15(a1)/(a2)/PRE-06** (a different module's
  open question) for BE-037/038 — this plan cannot resolve that; it's tracked in `sb-compass/plan.md`.
- **The 100%-submission reversion (BE-028) and the `ConsistencyScore` re-scope (BE-029b) are corrections
  to this round's understanding, not new features** — `design.md` v8 (2026-09-02) explicitly rejected the
  "allow partial submission" proposal that was under consideration in OQ-F11, and re-scoped the old
  "confidence from completion %" mechanic into "confidence from cross-format consistency" because the
  100% rule makes completion-based confidence structurally impossible to trigger. Any assumption in
  earlier drafts/discussions that partial submission would be allowed is now known-wrong and must not be
  implemented.
- **Phase 6 (Module K) is code-writable in parallel with Phases 5/7** — it doesn't depend on either
  finishing (BE-047's T-Score calc only needs Module E/BE-001; BE-049's `InterestFit` needs Phase 5's
  RIASEC `studentLevel` calc, BE-029, not the whole phase). **It cannot run end-to-end against real data
  until `sb-compass` ships DEP-F09** (`"StddevScore"` column, that module's Phase 3/Module C) — this is
  a cross-module runtime dependency this plan cannot resolve, tracked in `sb-compass/plan.md` instead.
- **Phase 7's BE-022 now depends on Phase 6 (BE-052)** instead of standing alone on the old
  `CompassPathCatalog` 8-path mechanism — Module H cannot ship ahead of Module K per `design.md`'s own
  dependency chain. The exact fate of the old mechanism (retired vs. kept as fallback) still needs a
  `system-analyst` confirmation, noted on the task itself rather than assumed either way.
- **Phase 1 coordination note**: `sb-compass` Phase 1 (Module A) touches the same file as BE-001 —
  sequence with that module's Phase 1 rather than in parallel (DEP-F05).
- **Phase 4 dependency note**: Module G (Staff auth + review console) must exist first — this uses the same auth
  layer and screen frame (BE-013).
- **Phase 5 Target Major Rules cardinality note**: **OQ-F14 ปิดแล้ว 2026-09-15** — ผู้ใช้ยืนยันกำหนดให้เลือกเป้าหมาย active ได้สูงสุด 1 สาขาต่อคน บังคับด้วย Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` ใน BE-040 และการ supersede แถวเดิมก่อน insert ใหม่ใน BE-042
- **Phase 5 Development Plan note (REQ-018 / DES-026)**: BE-054 และ FE-013 ทำหน้าที่คำนวณ Gap Analysis รายกลุ่มสาระเทียบกับเกณฑ์ `TARGET_SCORE = 75.0` พร้อมแบบฝึกหัดทบทวน 4 ข้อ และการ์ดแนะนำ Orbit Tutor บนแท็บ `tab=gap` ของ MyCompass โดยมี Precondition คือนักเรียนต้องมี active target major
- **Phase 5/6 `"DisplayScore"` note**: **OQ-F16 ปิดแล้ว 2026-09-15** — กำหนดค่า Engineering Default `CONSISTENCY_MIN = 0.60` ปลดล็อกการคำนวณและบันทึก `"DisplayScore"` ใน BE-051 ไม่ต้องเขียนค่า NULL อีกต่อไป
- **Phase 7 note (dependency gap closed this round)**: Module H now depends on **Phase 6 (Module K)** — see BE-022's
  corrected `Depends on` above. BE-022's exact interaction with the pre-existing `CompassPathCatalog`
  mechanism still needs a `system-analyst` confirmation pass (flagged in the task row itself) since
  `design.md` never explicitly says the old 8-path contract is retired — that's a smaller, scoped
  question now, not an open "Module K doesn't exist" gap.
- **Not planned as a separate task**: point §5 (`TARGET_SCORE` vs. T-Score staying two separate mechanisms)
  is a hard constraint written into BE-047's task note, not an endpoint of its own — nothing to implement,
  only something to not accidentally merge.

## Unresolved Open Questions

- **OQ-F08** — **ปิดแล้ว 2026-09-15**: ผู้ใช้ยืนยันใช้ SchoolBright Staff/Admin Login session เดิมของระบบปัจจุบัน ไม่ต้องทำ SSO หรือ auth provider ใหม่ (ปลดบล็อก BE-013)
- **OQ-F09** — PDF original-file storage location, blocks only BE-005's storage step (placeholder
  allowed elsewhere in Phase 2). Owner: user + `devops`.
- **OQ-F14** — **ปิดแล้ว 2026-09-15**: ผู้ใช้ยืนยันโควตาเป้าหมาย active ได้สูงสุด 1 สาขาต่อคน บังคับด้วย Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` ใน BE-040 และการ supersede แถวเดิมก่อน insert ใหม่ใน BE-042
- **OQ-F15** — "ตั้งเป็นเป้าหมาย" button placement/copy, blocks FE-011 only. Owner: `uxui-designer`.
- **OQ-F16** — **ปิดแล้ว 2026-09-15**: กำหนดค่า Engineering Default `CONSISTENCY_MIN = 0.60` ปลดล็อกการคำนวณและบันทึก `"DisplayScore"` ใน BE-051
- **sb-compass OQ-15(a1)/(a2)** — blocks Phase 8 (BE-037/038). Tracked in `sb-compass/plan.md`, not
  owned here.
- **OQ-F17** *(new, opened by `design.md` v9, 2026-09-15)* — integer PK width for the 11 tables the PK
  change did *not* touch (`bigserial`/`bigint` in `## Data Model` vs `serial`/`integer` in the real
  bootstrap script). **No task's Owner/Depends-on/Tier/gate changes because of it**: it is a capacity
  decision, not a plan-affecting fact, and `design.md` already tells engineers to follow the real DDL
  and never `ALTER TABLE` the width themselves — recorded as a constraint inside BE-003 rather than as
  a new task. It does block anyone claiming doc-vs-database parity, which is QA-visible. Owner: user
  (or `system-analyst` under an engineering-judgment grant, as with OQ-F12/OQ-F13).
- **RISK-F22** *(new, opened by `design.md` v9, 2026-09-15 — user-confirmed 2026-09-14, not yet
  reconciled)* — the module's tables actually live in a **new database `SB_Compass`**, not `PGGradeDB`
  as `## Data Model`'s "ที่อยู่" paragraph, `## DES-018`, PRE-F03/PRE-F04, RISK-F10/F11 and `## DES-024`
  still say. **Not fixable from the plan side**: it changes DB ownership/grants, network prerequisites,
  and possibly forces a new `ClassOnlineWeb` connection string — an SA amend round of its own, and a
  `devops` prerequisite, not a task rewrite. Recorded as a "confirm the target database before running
  the migration" constraint on BE-003; no Owner/Depends-on/Tier/gate changed, because until SA
  reconciles DES-018/DES-024 nobody can say whether PRE-F03/PRE-F04 grow a new prerequisite task.
  Owner: `system-analyst` (amend) then `devops`.
- **Raised for `system-analyst`, not resolved here (1)** — `## Data Model`'s **วิธีสร้าง** still says the
  catalog tables may be created **only** by the Curriculum Service's migration and that `ClassOnlineWeb`
  must never create or alter them, yet the same section's v9 status note names
  `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql` as the schema's ground truth and
  the database has already been built from it. BE-003 keeps the migration-only rule as written, so the
  two statements now contradict each other on who owns table creation. This planner did not pick a side:
  it is a `DES-018`/`Contract:DatabaseOwnershipBoundary.v1` ownership question, and picking either way
  silently would either invalidate a real, user-run script or weaken the ownership contract. (Read from
  `design.md`'s current `## Data Model` v9 status note; the Target file itself was not opened in this
  session.)
- **Raised for `system-analyst`, not resolved here (2)** — v9 fixes what identifies a cluster/dimension
  **in the database** and **towards AI/seed files**, but says nothing about what identifies a cluster in
  the **student-facing payloads** (BE-052/FE-012, BE-022's ordering input). RISK-F21 forbids Ids in
  seeds/prompts/code, not in API responses, so the honest state is "unspecified". BE-052 was left
  unchanged rather than have this plan invent a payload rule. Owner: `system-analyst` (DES-022 §/DES-020
  contract text).

## Change Log

- 2026-09-02 — Wrote `plan.md` fresh (file did not exist in the working tree; prior version existed only
  in git history and the user declined restoring it). Rebuilt Phases 1–7 verbatim from `design.md`
  Contract Version 8's Modules E/F/G/I-a/H/I-b and the task bodies already captured in
  `knowledge/sb-compass-faculty-match/task/*.yaml` (same 49 task IDs, same `DES-NNN`/dependency
  references, `Status` = `pending` throughout — matches this module's real state, all Phases were
  `implemented ⬜` per `_docs/status.md` already). Added Phase 6 amendment (BE-040–044, FE-011) for
  REQ-017/DES-017 Target Major Rules, new this round — flagged `🔒 Security gate` given the IDOR failure
  mode `design.md` already calls out for Module I-b, and added BE-044 specifically for ownership
  enforcement on the three new write endpoints. Corrected BE-028's description to reflect the confirmed
  100%-submission rule (partial-submission proposal rejected) and added BE-029b for the `ConsistencyScore`
  re-scope (OQ-F13) — no task IDs renumbered. Flagged the Module K gap (no tasks exist for
  `DES-011`/`DES-013`/`DES-015` anywhere in the source data) and a dependency-uncertainty note on BE-041
  rather than resolving either without a design/test-plan pass. Did not create tasks for OQ-23 (new
  "แผนพัฒนา" REQ, not yet defined) or OQ-24 (whether the mockup's 4-question exercise replaces REQ-008) —
  both are real but explicitly not yet specified; noted here only as pointers for a future
  `business-analyst`/`system-analyst` round.
- 2026-09-02 (same day, follow-up) — Added **Phase 8: Module K — Cluster Determination** (BE-045–053,
  FE-012), closing the gap flagged in the prior round: `design.md`'s `## Cluster Determination Rules`
  (`DES-011`/`DES-013`/`DES-015`) is fully closed business-rule-wise and was legitimate backed work, not
  invented scope. Split into migration (BE-045/046), T-Score calc + fallback (BE-047/048, 🔴 blocked at
  runtime on `sb-compass` DEP-F09), the 11-cluster combined-score formula (BE-049), ClarityIndex/Band
  (BE-050), Confidence/shrinkage + `DisplayScore` (BE-051, ⬜ blocked on OQ-F16 for its final step only),
  the read endpoint (BE-052), ownership enforcement (🔴 BE-053, same IDOR discipline as BE-026/BE-036/
  BE-044), and the results screen (FE-012). Flagged `🔒 Security gate` per `design.md`'s Module K
  Security Considerations (ownership over `TCompassStudentClusterScore`, same pattern as Modules H/I-b).
  Corrected Phase 5's BE-022 to depend on Phase 8 instead of standing alone on the old 8-path mechanism,
  per `design.md`'s explicit Module H → Module K dependency — removed the prior round's "gap" flag from
  Phase 5 and Plan Summary accordingly, replacing it with a smaller scoped question (old-mechanism
  retirement) for `system-analyst` to confirm.
- 2026-09-07 — Reconciliation fix: corrected the "Phase 6 amendment — Target Major Rules" heading from
  `###` (H3) to `##` (H2) to match every other phase heading's level in this file. `sta --check-plan`
  only recognizes `##`-level headings as phase boundaries, so the mis-leveled heading had caused the
  entire table under it (BE-040–044, FE-011) to be silently skipped when building the task DAG,
  surfacing as false "depends on a task not in this plan" errors for BE-038→BE-041 and BE-039→BE-044.
  No task content, IDs, or dependencies changed.
- 2026-09-07 (same day, follow-up) — **Reordered phase blocks to match true dependency order**, closing
  a genuine circular dependency `sta --check-plan` reported: `BE-022 -> BE-023 -> BE-024 -> FE-006 ->
  BE-027 -> ... -> BE-052 -> BE-022`. Root cause: the 2026-09-02 change made Module H's BE-022 depend on
  Module K's BE-052 (a legitimate, already-confirmed design decision per `design.md` v8 — Module H's
  ranking now reads Module K's cluster results instead of the old 8-path mechanism), but the document
  still listed Module K's phase (old Phase 8) *after* Module H's phase (old Phase 5). Because 🔒
  Security-gated phases are enforced to run in strict document order, and Module K's own tasks depend on
  Module I-b's RIASEC output (old Phase 6) and Module E (old Phase 1), the old ordering (E, F, G, I-a, H,
  I-b, Entitlement Wiring, K) combined with the new H→K edge was unsatisfiable. Physically reordered the
  whole phase blocks (tables intact, no task content/Status/Owner/Depends-on/DES-NNN changed) to: 1)
  Module E, 2) Module F, 3) Module G, 4) Module I-a, 5) Module I-b (+ its Target Major Rules amendment,
  renumbered from "Phase 6 amendment" to "Phase 5 amendment"), 6) Module K (was Phase 8), 7) Module H
  (was Phase 5), 8) Module H + I-b Entitlement Wiring (was Phase 7, unchanged position as the last
  phase). Updated all phase-number prose references in Plan Summary, the Phase 5/5-amendment/6/7 body
  notes, Sequencing Notes, and Unresolved Open Questions to the new numbering; left references to a
  *different* module's own phase numbers (e.g. `sb-compass` Phase 1/Phase 3) untouched since those are
  not this plan's numbering. No task IDs, dependency edges, or acceptance criteria changed — only phase
  position and heading numbers/labels.
- 2026-09-08 — Added the optional `Tier` column to all 8 phase tables (plus the Phase 5 amendment table,
  which shares Phase 5's cast) per `policies/architecture.md`/the PM role contract. Exactly one
  phase-level cast per phase, on the row judged most representative of that phase's overall risk; every
  other row's `Tier` cell left blank. No `T1` used (reserved), no analysis phase cast (this plan has none
  — all 8 phases are implementation phases; QA runs per `review.md`, not as a plan phase here). No task
  IDs, Status, Owner, `Depends on`, or other content changed. Rationale per phase: **Phase 1 (Module
  E)** → `T6` on BE-001 — a pure mechanical move of an existing method to a new home, explicitly no new
  logic. **Phase 2 (Module F)** → `T2` on BE-008 — the highest-risk task of the plan's highest-risk
  phase: a brand-new microservice's first live external-AI call (`glm-5.2`) with secret-store key
  handling and retry logic, sitting downstream of untrusted PDF upload/sandboxed conversion; warrants the
  planning/security-grade tier. **Phase 3 (Module G)** → `T3` on BE-013 — SSO auth middleware is the
  security-load-bearing task every other Phase 3/4 task depends on transitively; risky but narrower in
  blast radius than Phase 2's external-AI/untrusted-upload surface. **Phase 4 (Module I-a)** → `T5` on
  BE-020 — plain CRUD authoring endpoints, no security gate, lowest-risk implementation phase alongside
  Phase 1. **Phase 5 (Module I-b + Target Major Rules amendment)** → `T3` on BE-036 — chosen over the
  formula-heavy tasks because ownership/IDOR enforcement across the whole module (including the new
  Target Major Rules write endpoints) is this phase's dominant risk, on top of several new business-rule
  formulas (combined Likert+ranking scoring, `ConsistencyScore`) and a student-facing submission surface;
  the Phase 5 amendment table shares this single cast rather than casting again. **Phase 6 (Module K)** →
  `T4` on BE-047 — hard implementation explicitly spanning a cross-module contract (`sb-compass`'s
  `"StddevScore"` column, DEP-F09) underneath an 11-cluster weighted-combination formula; chosen over
  `T3` because the cross-module contract dependency, not just formula complexity, is the defining risk.
  **Phase 7 (Module H)** → `T4` on BE-022 — hard implementation reading another module's contract output
  (Module K's cluster results replacing the old 8-path mechanism), the same "across a contract" profile
  as Phase 6. **Phase 8 (Entitlement Wiring & Ownership Audit)** → `T3` on BE-039 — smaller in task count
  than Phases 2/5/6/7 but security-critical and cross-cutting: the final ownership/entitlement audit
  across both Module H and Module I-b (including the new Target Major Rules endpoints), fail-closed by
  design.
- 2026-09-08 (same day, follow-up) — Added the `## Execution Runbook` section below (mechanical addition
  only): copy-pasteable `sta run` commands grouped into rounds by phase/cast Tier, cross-checked against
  this file's own `## Unresolved Open Questions` and `## Sequencing Notes` for which tasks are actually
  runnable vs. blocked as of 2026-09-08. No task IDs, Status, Owner, `Depends on`, or Tier values changed;
  no phases reordered; no task table content touched.
- 2026-09-13 — Structure-only conversion to canonical `PlanTask format: 1` (no task id, status, owner,
  dependency, or Tier change): every task row of the former `| Task | Status | Owner | Depends on | Tier |`
  tables under `## Phase 1..8` plus the Phase 5 amendment table — 66 tasks in total, including BE-029b and
  the amendment rows BE-040–044/FE-011 — became a canonical `### Task` section keeping the same id,
  Status (`pending` throughout), Owner, `Depends on` edges and the 8 Tier values (BE-001 T6, BE-008 T2,
  BE-013 T3, BE-020 T5, BE-022 T4, BE-036 T3, BE-047 T4, BE-039 T3); rows with blank Tier cells omit the
  Tier line, per the parser. The `## Phase 5 amendment — …` H2 became regular task sections inside
  `## Phase 5` (the parser accepts `## Phase N: …` headings only), and the prose notes that lived under
  phase tables (Phase 1 coordination, Phase 4 dependency, Phase 5 cardinality/dependency-uncertainty/
  DisplayScore notes, Phase 6 status note, Phase 7 dependency-gap note, the TARGET_SCORE-vs-T-Score note)
  moved into `## Sequencing Notes` as prose bullets — the parser forbids prose between task sections;
  `## Unresolved Open Questions (tracked here, not owned here)` was renamed to the exact
  `## Unresolved Open Questions`. Traceability now cites the REQ/AC ids of `requirement.md` and the
  addressable `DES-018..024`/`DEC-018..024`/`Contract:*.vN` claims of `design.md` (renumbered 2026-09-07),
  mapped from each row's old DES-001..017 citation by section title: Import Rules → DES-019, Program
  Matching Rules → DES-020, Target Major Rules → DES-021, Cluster Determination Rules → DES-022, Admin &
  Review Rules → DES-023, identity/ownership (old DES-010/015) → DES-018; rows whose rules live in the
  standalone `## RIASEC Fit Rules` section (Module I-b student-side rows) anchor on DES-018, the
  addressable ownership contract those endpoints implement, because that section carries no DES claim of
  its own (BE-029b anchors on DES-022, which is where §7.2 `ConsistencyScore` actually lives in the
  current design). Risk/Human gate per row, honest picks from each row's own text: rows marked 🔴 carry
  `Risk: security` + `Human gate: security` inside their 🔒 phases (BE-005, BE-008, BE-013, BE-026,
  BE-036, BE-044, BE-053, BE-037, BE-038, plus the final audit BE-039); every task selecting DES-022 or
  DES-024 claims declares `Human gate: design-ambiguity` (matching `Material ambiguity: unresolved` —
  OQ-F16 `CONSISTENCY_MIN` for DES-022, OQ-F08 SSO / OQ-F09 PDF storage for DES-024 on BE-005/BE-013);
  and every task whose selected DES section declares `Data/schema: additive` (DES-018/019/021/022/023/024 —
  all 60 tasks except the six DES-020-only rows BE-001/BE-022/BE-023/BE-024/BE-025/FE-006) declares
  `Human gate: schema` per design-trigger gate parity (the checker's diagnostics demanded it, and schema
  confirmation is one of this workspace's human gates — the module adds its catalog/cluster/target
  tables); BE-047/BE-048 carry `Risk: shared-contract` for the cross-module `"StddevScore"` dependency (DEP-F09);
  stale row terminology was reconciled to the current design in Objectives only (8 แกน → 6 มิติ RIASEC,
  `trait_code` → `dimension_code`, `path_code` 8 → `cluster_code` 11, snake_case → `public."T<PascalCase>"`)
  with no scope change. Residual task tables deleted — the canonical task sections are now the sole task
  authority. No requirement.md/design.md/knowledge change; no state-changing git.
- 2026-09-14 — Drift check only, **no task section touched**. Re-read `design.md`'s working-tree
  `Design evidence format: 1` backfill (structured `Contract:*.v1`/`DEC-0NN`/`Evidence EVD-001..021`/
  `Compatibility`/`Data/schema`/`Migration/backfill`/`Security`/`Fallback`/`Material ambiguity` blocks
  under `## DES-018`..`## DES-024`, plus the `## <Title> (DES-0NN)` → `## DES-0NN — <Title>` heading
  rename) against all 66 tasks. The pass adds evidence/metadata on top of claim ids this plan already
  cites; it closes no open question, renumbers nothing, and changes no rule — so no Traceability,
  Consumes, Produces, Provenance, Risk, Human gate, `Depends on` edge, Tier, or acceptance criterion
  needs to change. Specifically re-checked the two sections still marked `Material ambiguity:
  unresolved`: **DES-022 Cluster Determination Rules** (still open via OQ-F16 `CONSISTENCY_MIN`, per
  `design.md` `## Unresolved Open Questions` and RISK-F19) and **DES-024 Deployment Prerequisites**
  (still open via OQ-F08 SSO details and OQ-F09 PDF storage; PRE-F09 remains a cross-module runtime
  blocker, not a new one) — the 12 tasks carrying `Human gate: design-ambiguity` are exactly the 12
  tasks selecting a DES-022 or DES-024 claim (BE-029b, BE-045–053, FE-012 for DES-022; BE-005, BE-013
  for DES-024), so the gate mapping is unchanged and still 1:1. Also re-verified `Data/schema` parity:
  DES-020 remains `unchanged` and its six DES-020-only tasks (BE-001, BE-022, BE-023, BE-024, BE-025,
  FE-006) correctly carry no schema gate, while the other 60 tasks select an `additive` section and
  carry `Human gate: schema`. `Compatibility`/`Migration/backfill: none` contradicts no task's
  rollback/compatibility note. Two observations handed back to `system-analyst` rather than resolved
  here: (1) `## RIASEC Fit Rules` is the one contract section the pass left without a `DES-0NN`/
  `Contract:*.v1`/evidence block, which is why the Module I-b student-side tasks still anchor on
  DES-018 as recorded on 2026-09-13; (2) `Contract:DeploymentPrerequisites.v1` is cited by no task's
  `Consumes` — BE-005/BE-013 reference DES-024/DEC-024 as a prerequisite blocker, not as an
  implementation contract they consume. No requirement.md/design.md/knowledge change; no
  state-changing git; `sta --check-plan` not run in this session (no shell access).
- 2026-09-14 (same day, follow-up) — **Re-pointed the Module I-b student-side citations from the
  DES-018 fallback to the now-addressable `## DES-025 — RIASEC Fit Rules`** — closing observation (1)
  of the entry immediately above, which this planner raised on 2026-09-14 and `system-analyst` has now
  resolved by giving that section a `DES-025`/`DEC-025`/`Contract:RiasecFitRules.v1` claim with evidence
  `EVD-022..EVD-024` (`ClassOnlineWeb/Helper/CompassRiasecService.cs` — `ComputeDimensionLevels:314`,
  `SubmitAsync:181`, `ComputeMatchPercent:423`). Section re-read in full before amending; no rule text
  changed. **13 tasks touched, Traceability/`Consumes`/Provenance only** — no Status, Owner,
  `Depends on`, Tier, Risk, Human gate, acceptance criterion or task id changed, nothing renumbered:
  · **`DES-025, DEC-025` added alongside the retained `DES-018, DEC-018` (6 tasks)** — BE-027, BE-028,
  BE-030, BE-031, BE-033, BE-034: each implements a DES-025 rule **and** genuinely reads a
  Curriculum-Service-owned table cross-service read-only (question bank, program RIASEC profile,
  cluster mapping, quest bank), so the ownership-boundary claim is a real second concern, not a fallback.
  · **`DES-018, DEC-018` replaced by `DES-025, DEC-025` (7 tasks)** — BE-029 (studentLevel §3.1-3.4),
  BE-032 (forbidden wording §6), BE-035 (profile-only mode §8), FE-007 (§1 completeness in UI),
  FE-008 (§4/§5/§6 display), FE-009 (§9 quest flow), FE-010 (§8 profile-only screen): these compute or
  render over payloads produced upstream and touch no cross-service DB access, so DES-018 was a pure
  fallback anchor there and is now wrong to keep. · All 13 now declare
  `Consumes: Contract:RiasecFitRules.v1` (previously `Consumes: none`), matching this plan's convention
  that a task consumes the contract whose rules it implements; `Produces` stays `none` throughout —
  this plan uses no producer convention. Retrieval `Hypothesis`/`Query` lines of the same 13 tasks now
  name the exact DES-025 sub-section each rule comes from (§1-§9), and the three Objectives that cited
  the section by its old heading (BE-032 §6, BE-033 §9, BE-035 §8) plus the Phase 5 `TCompassRiasecResult`
  sequencing note now use the renamed `## DES-025 — RIASEC Fit Rules` heading — citation labels only,
  no scope change. **Deliberately not re-pointed**: BE-036/BE-044/BE-053/BE-026/BE-037/BE-038/BE-039
  (identity/IDOR/entitlement — their rules really are DES-018), BE-029b (DES-022 §7.2 `ConsistencyScore`),
  BE-003 (catalog migration/quoting, DES-018), and BE-020/BE-021/FE-004/FE-005 (Module I-a admin side —
  anchored on the genuine DES-023 Admin & Review Rules, not on a DES-018 fallback, even though BE-020's
  Hypothesis and BE-021's Objective reference RIASEC Fit Rules for column shape and the §9
  `program_id IS NULL` constraint). **Two gate-parity consequences observed and deliberately left
  unchanged, not silently applied** — they change human-gate behaviour, which is not a citation fix:
  (a) DES-025 declares `Material ambiguity: unresolved` (its §0 — real RIASEC question content still
  unverified, `uxui-designer` before any seed), so by the 2026-09-13 parity rule the 13 tasks now
  selecting DES-025 would also warrant `Human gate: design-ambiguity`, which none of them carries today;
  (b) DES-025 declares `Data/schema: unchanged`, so the 7 tasks that no longer select any `additive`
  section keep a `Human gate: schema` that the same parity rule would no longer require (over-gating,
  safe direction). Both are decisions for the user/`system-analyst`, not for this amend.
  No requirement.md/design.md/knowledge change; no state-changing git; `sta --check-plan` not run in this
  session (no shell access) — `Depends on` edges were not touched, so the DAG is unchanged.
- 2026-09-14 (same day, gate fix on the entry above) — **Human-gate parity for the 13 re-pointed tasks,
  after the coordinator ran `sta --check-plan --module sb-compass-faculty-match` and it failed on all 13
  with "design trigger material-ambiguity requires human gate design-ambiguity"**. This closes both
  parity consequences the previous entry recorded as open, in the direction the deterministic rule
  dictates — not a new planning decision, the checker's verdict on an existing rule. (a) **`design-ambiguity`
  added to all 13** (BE-027, BE-028, BE-029, BE-030, BE-031, BE-032, BE-033, BE-034, BE-035, FE-007,
  FE-008, FE-009, FE-010), because DES-025 declares `Material ambiguity: unresolved` (§0 — real RIASEC
  question content unverified until `uxui-designer` signs off, per DES-012); appended to the existing
  value in the file's established `security, design-ambiguity, schema` order, never replacing one.
  (b) **`schema` dropped from the 7 tasks that no longer select any `additive` section** — BE-029,
  BE-032, BE-035, FE-007, FE-008, FE-009, FE-010 now anchor on DES-025 alone, which declares
  `Data/schema: unchanged`, so under the same parity rule that leaves the six DES-020-only tasks
  (BE-001/022/023/024/025/FE-006) ungated for schema, these seven no longer qualify either; they carry
  `Human gate: design-ambiguity` only. The 6 dual-anchor tasks (BE-027, BE-028, BE-030, BE-031, BE-033,
  BE-034) keep `schema` because they still select DES-018, which is `additive`, and now read
  `Human gate: design-ambiguity, schema`. Nothing else changed: no Status, Owner, `Depends on`, Tier,
  Risk, Traceability, `Consumes`, Provenance, acceptance criterion or task id, and no id renumbered.
  **Not changed and flagged instead**: DES-025 also declares `Security: sensitive`, and these 13 tasks
  carry no `security` gate of their own — Phase 5 is a phase-level 🔒 Security gate and BE-036 carries
  the Module I-b `Risk: security` + `Human gate: security`; the checker did not flag this, so whether
  the sensitive-data gate should also land per task is left to `system-analyst`/the user, not decided
  here. `sta --check-plan` still not runnable in this session (no shell access) — coordinator to re-run.
- 2026-09-15 — **Schema reconciliation round: re-pointed the tasks that named a text-code column the
  `## Data Model` no longer has.** Trigger: `system-analyst` amended `## Data Model` to **Contract
  Version 9** (`Contract:CompassDataModel.v9` / `DEC-026` / `EVD-025..027`, `Compatibility: breaking`,
  `Migration/backfill: none`) to reconcile it against the user's own DDL change in
  `ClassOnlineWeb/DatabaseScripts/Compass/bootstrap-sb-compass-db.sql` — 7 master tables moved from a
  text-code PK to `serial "<Name>ID"` int identity, the old codes stayed as `text NOT NULL UNIQUE`
  (renamed to `"FacultyGroupCode"`/`"StudyPlanCode"`/`"CareerCode"` where they collided), 16 dependent
  tables were re-pointed to integer FKs, and `DES-019` §5's AI-contract field `faculty_group_id` became
  `faculty_group_code`. `## Data Model`, `## DES-019` §5, `## DES-023` §2/§3/§5 and `## DES-025` §3/§9
  were re-read in full before amending; no plan rule was invented on top of them.
  **13 tasks changed, no id renumbered, no Status/Owner/`Depends on`/Tier touched**: **BE-003**
  (master-table PK/code shape + seed-by-`INSERT ... SELECT ... JOIN` rule + AC-015.1 and its validation
  now observe both), **BE-005** (stale index name `ux_cpsource_sha` → the real
  `"UX_TCompassProgramSource_UniversityID_OriginalSha256"`, and `"UniversityCode"` → `"UniversityID"`
  resolution before the source row is written), **BE-009** (`faculty_group_id` → `faculty_group_code`
  plus the explicit "AI contract stays text code, service resolves to Id" rule and a resolve-failure
  case in its evidence), **BE-014** (queue filter now joins `"UniversityID"` from
  `public."TCompassProgramSource"` while the API still takes `"UniversityCode"`), **BE-015** + **FE-002**
  (DES-023 §3 edit path: cluster/dimension/faculty-group edited by code, stored as Id; the screen picks
  from a code+Thai-name list and never accepts a typed Id), **BE-017** (approval condition 4 now checks
  row count with `"ClusterID"` resolving into the 11 clusters, not `cluster_code`), **BE-020** and
  **BE-021** (`dimension_code` column → `"DimensionID"` integer FK, API still speaks `"DimensionCode"`),
  **BE-033** (quest selected by `"DimensionID"` per DES-025 §9), **FE-001** (filter value stays the text
  code; no Ids in the client), **BE-045** (`"ClusterCode"` FK → `"ClusterID"` FK on
  `public."TCompassStudentClusterScore"`), **BE-046** (weight seeds now need code→Id joins instead of
  direct code FKs, with a no-Ids-in-seed-files check in the evidence).
  **Checked and deliberately left unchanged**: BE-011/BE-012/BE-016/BE-018/BE-019 (their tables —
  `TCompassProgramIntake`, `TCompassProgram` status/`dedup_key`/`source_id` — are in v9's "nothing
  changed" set and they name no altered column), FE-003 (refers to the 6 conditions as a group, no
  column names), BE-031 and BE-022/BE-023/BE-024 (speak of "cluster" as a concept, never of
  `"ClusterCode"`), BE-049/BE-050/BE-051/BE-052 (`"ClusterCount"`/`"ClarityIndex"`/`"DisplayScore"` are
  untouched columns), FE-004/FE-005 (no column names), and the Module I-b student-side tasks other than
  BE-033 (DES-025's formulas changed their join key only, which none of those task texts names).
  **Gate parity applied, not discretionary**: the 13 tasks above now select the `DEC-026` claim, whose
  `## Data Model` block declares `Material ambiguity: unresolved` (OQ-F17 + RISK-F22) — so under the
  same deterministic rule `sta --check-plan` enforced on 2026-09-14, the 9 of them that carried
  `Human gate: schema` alone (BE-003, BE-009, BE-014, BE-015, BE-017, BE-020, BE-021, FE-001, FE-002)
  now read `Human gate: design-ambiguity, schema`; the other 4 already had it. **No `Human gate: schema`
  needed adding anywhere** — every task touched already carried it, and the six DES-020-only tasks
  (BE-001/022/023/024/025/FE-006) still select no schema-bearing section, so `Data/schema: breaking`
  does not reach them. `Risk` values unchanged: the breaking-ness lands on documents and unwritten code,
  not on live data (`Migration/backfill: none` — the database was dropped and rebuilt with no real rows).
  **Flagged, not resolved** (added to `## Unresolved Open Questions`): **OQ-F17** (int4 vs int8 for the
  11 untouched PKs) and **RISK-F22** (the tables actually live in a new `SB_Compass` database, not
  `PGGradeDB`) — neither changes any task's Owner/`Depends on`/Tier/gate on this planner's own reading,
  so both are recorded as constraints inside BE-003 and as open items for `system-analyst`; plus two
  observations this round surfaced and did not decide: `## Data Model`'s "migration-only" creation rule
  now contradicts the real bootstrap script's location under `ClassOnlineWeb`, and v9 never says what
  identifies a cluster in student-facing payloads. No requirement.md/design.md/knowledge change; no
  state-changing git; `sta --check-plan` not run in this session (no shell access) — `Depends on` edges
  untouched, so the DAG is unchanged; coordinator to re-run the checker.
- 2026-09-15 (same day, correction to the entry above) — **`DEC-026` / `Contract:CompassDataModel.v9` /
  `EVD-025..027` were retracted by `system-analyst` and every citation of them was repointed to
  `DES-018` / `DEC-018` / `Contract:DatabaseOwnershipBoundary.v1`.** Trigger: the coordinator ran
  `sta --check-plan --module sb-compass-faculty-match` and it failed — `DEC-026` is not a valid
  addressable claim, because SA had attached that block to the plain `## Data Model` heading, which the
  parser only recognises under a `## DES-NNN — Title` heading (no module's Data Model section ever
  carries a formal claim). SA has since removed the block; `design.md`'s current `## Data Model` records
  the v9 PK change as **prose only** and states explicitly that work needing an addressable contract
  binds to `DES-018`/`DEC-018`/`Contract:DatabaseOwnershipBoundary.v1`, which already owns the
  DDL/ownership rules. Section re-read in full before amending, as were `## DES-018` and its claim block.
  **The 13 tasks keep every rule change from the entry above** — this is a citation repoint, not a
  re-planning: **BE-003** (already cited DES-018/DEC-018 — the duplicate ids were simply dropped),
  **BE-005**, **BE-009**, **BE-014**, **BE-015**, **BE-017**, **FE-001**, **FE-002**, **BE-020**,
  **BE-021**, **BE-045**, **BE-046** (gained `DES-018, DEC-018` +
  `Contract:DatabaseOwnershipBoundary.v1` alongside their existing section), and **BE-033** (already had
  DES-018/DEC-018; the dead pair was dropped and its `Consumes`/Provenance repointed). Three prose spots
  carrying dead-id text were repointed with their substance intact: BE-003's retrieval hint (the
  bootstrap-script reference now cites the file and the line numbers `## Data Model` itself records,
  not `EVD-025..027`), BE-003's rollback note (the breaking-compatibility warning now states the fact
  without the retracted claim id), and BE-005's scope note. Four more `Contract Version 9` labels
  (BE-003 Objective/AC/do-not-modify, BE-045 Objective/AC/hint) became "สถานะ v9 (2026-09-15) ของ
  `## Data Model`", and the `## Unresolved Open Questions` bullet that cited `EVD-025..027` now cites the
  section's own v9 status note.
  **Gate parity reverted with the claim**: the 9 tasks that gained `Human gate: design-ambiguity` in the
  previous entry (BE-003, BE-009, BE-014, BE-015, BE-017, BE-020, BE-021, FE-001, FE-002) are back to
  `Human gate: schema` alone. The addition was derived solely from the retracted block's
  `Material ambiguity: unresolved`; the sections they actually select — `DES-018`, `DES-019`, `DES-023` —
  each declare `Material ambiguity: none`, so the design trigger no longer exists and the gate would be
  unbacked. BE-005 (DES-024), BE-033 (DES-025) and BE-045/BE-046 (DES-022) keep the
  `design-ambiguity` gate they already had for their own sections' unresolved ambiguity. `Human gate:
  schema` still holds everywhere it did, and `DES-018` is `Data/schema: additive`, so adding it creates
  no new schema-gate obligation. **Observed and deliberately not acted on**: `DES-018` is
  `Security: sensitive`, and the tasks that newly select it carry no per-task `security` gate — exactly
  the situation recorded on 2026-09-14 for DES-025/DES-019/DES-023 (the checker did not flag it; it is
  an SA/user call, not this planner's). **OQ-F17 and RISK-F22 remain open and still have no
  addressable claim of their own** now that the block is gone — they live as prose in `## Data Model`,
  as constraints inside BE-003, and as items in `## Unresolved Open Questions`; if they should gate
  anything, SA must first give them a home under a `DES-NNN` section. Not touched, per SA's explicit
  instruction: `DES-026 — Development Plan Contract` and its `Contract:DevelopmentPlan.v1`/`DEC-027`/
  `EVD-028..030` (a different, valid section added concurrently) — nothing was renumbered or reused.
  Historical Change Log entries that narrate the retracted ids were left verbatim as an accurate record
  of what happened. No Status, Owner, `Depends on`, Tier or task id changed; no id renumbered; no
  requirement.md/design.md/knowledge change; no state-changing git; `sta --check-plan` not runnable in
  this session (no shell access) — coordinator to re-run.
- 2026-09-15 — **Unblock OQ-F08, OQ-F14, OQ-F16 and add Development Plan tasks (BE-054, FE-013) for REQ-018 / DES-026**:
  - **OQ-F14**: ผู้ใช้ยืนยันกำหนดโควตาเป้าหมาย active ได้สูงสุด 1 สาขาต่อคน — อัปเดต **BE-040** (เพิ่ม Partial Unique Index `"UX_TCompassTargetProgram_Active_Student"` บน `("SchoolID", "SID") WHERE "Status" = 'active'`) และ **BE-042** (บังคับ supersede แถวเดิมเป็น `'superseded'` ก่อน insert แถวใหม่ใน transaction เดียวกัน)
  - **OQ-F16**: ผู้ใช้ยืนยันค่า Engineering Default `CONSISTENCY_MIN = 0.60` — อัปเดต **BE-051** ปลดล็อกการคำนวณ Shrinkage Layer ดึงคะแนนเข้าหา 50 และบันทึกลงคอลัมน์ `"DisplayScore"` (ไม่ต้องเขียน NULL อีกต่อไป) พร้อมปรับ `Human gate: schema` หลัง DES-022 `Material ambiguity: none`
  - **OQ-F08**: ผู้ใช้ยืนยันใช้ SchoolBright Staff/Admin Login session ปัจจุบัน — อัปเดต **BE-013** ปลดล็อก Auth middleware สำหรับหน้าจอแอดมินโดยไม่ต้องสร้างระบบ SSO ใหม่
  - **REQ-018 / DES-026**: เพิ่ม 2 tasks ใหม่ใน Phase 5:
    - **BE-054** (Backend): คำนวณ Gap Analysis รายกลุ่มสาระเทียบเกณฑ์ `TARGET_SCORE = 75.0` (`Gap = max(0, TARGET_SCORE - StudentScore)`), ดึงโจทย์ทบทวน 4 ข้อ, และการ์ดแนะนำ Orbit Tutor (`Contract:DevelopmentPlan.v1`, `DEC-027`)
    - **FE-013** (Frontend): หน้าจอแท็บแผนพัฒนาตนเอง `tab=gap` ใน `MyCompass.cshtml` / `compass-design.js` (lines 579-627)
  - ปรับปรุง `Plan Summary` (ยอด task รวม 68 tasks), `Sequencing Notes`, และ `Unresolved Open Questions` บันทึกการปิด OQ-F08, OQ-F14, OQ-F16
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Two tables applied verbatim:
  (1) Round 1 FULL (2026-09-14, recovered from a mislocated DEV-repo copy — ISS-F13) mapping 25 tasks:
  BE-001/027/028/029b/032/033/034/035/040/041/042/043/045/048/050 -> `verified`; BE-029/030/031/036/044/047/049/051/052/053
  -> `blocked` (block reasons per that round: ISS-F02, open 🔒 gates, ISS-F03, OQ-F16, ISS-F09; note OQ-F16 has since
  closed 2026-09-15, lifting BE-051's specific blocker). BE-046 stays `pending` (weight seeds absent). All other tasks
  (Phases 2, 3, 4, 7, 8) stay `pending`. (2) Phase 1 FULL (2026-09-15, canonical `review.md` in the Knowledge repo):
  BE-001 re-verified against the current tree. Module remains NOT deployable: 3 Critical open issues (ISS-F01..F03).
- 2026-09-15 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `review.md`'s Round 3 (TARGETED + BE-002) sync row verbatim: BE-002 -> `verified` (Curriculum Service
  scaffold at `curriculum-service/`, ruff/mypy exit 0, config via service-own mechanism, no pipeline code).
  Same round closed ISS-F01 (nav removal per user decision 2026-09-15) and ISS-F02 (divisor already
  correct in current tree, verified independently); new: ISS-F14 (Important — missing §3.4/RISK-F18
  single-format logging), ISS-F15 (Minor — direct-URL residual of MyCompass, owner ruling pending).
  Phase 2 remains open: BE-003 (schema human gate + RISK-F22), BE-004 pending implementation.
  (Round 1's 24-row relay from the mislocated record was applied earlier today — ISS-F13's work item.)
- 2026-09-16 — **Knowledge sync (three-repo mode), relay only — not a second review.** Applied
  `review.md`'s Round 4 (TARGETED) sync rows verbatim: BE-003 -> `verified` (26-table catalog migration +
  seeds; all 88+66 weight cells verified against DES-022 §4a; validated on a throwaway local Postgres only —
  real-DB run is the schema human gate); BE-004 -> `blocked` (markitdown 0.1.3 + converter + spike verified;
  AC-001.1's ">=3 real KMUTT PDFs" pending from the user, RISK-F02 verdict honestly pending). Same round:
  ISS-F17 fixed post-round by backend-engineer (docstring citation, ruff/mypy re-run exit 0); new ISS-F16
  (Minor, system-analyst — DES-018 ownership table omissions). Phase 2 remains open pending the security
  gate and the first real-DB migration run (devops PRE-F10/ISS-F05 wiring incl. PGCompass_Password).
- 2026-09-16 — **Amend BE-008 + PRE-F01 ตามมติผู้ใช้ "รวม config ที่เดียวทั้งหมด" (design v13, relay of user decision)**:
  ยกเลิกข้อความเดิม "คีย์อยู่ใน secret store ของ service เอง ห้ามใส่ prod.config" — ที่เก็บ config ทั้งหมดของ
  Curriculum Service คือ `prod.config` กลุ่มคีย์ `ApiKey` / `Endpoint` / `Model` (ชื่อกลางทั้งชุด สำรองไว้เปลี่ยน vendor — ปรับครั้งที่สอง
  ตามมติผู้ใช้ 2026-09-16) / `Curriculum_DatabaseUrl` / `Curriculum_PdfStoreEndpoint` (slot ว่าง ผู้ใช้เติมเอง); service แยก XML
  `<appSettings>` ของ prod.config เอง (v14 — ไม่มี env injection; ลำดับค่า: env override > XML >
  `.env` local mirror > defaults; ค่าว่าง = ยังไม่ตั้ง; ไฟล์หาย = degrade พร้อม warning) · **คงไม่เปลี่ยน**: ห้าม hardcode ในซอร์สโค้ด · ฝั่ง
  ClassOnlineWeb ไม่มีโค้ดเรียก AI · ผู้ใช้ยอมรับความเสี่ยง RISK-F05 (plaintext prod.config) เอง 2026-09-16 ·
  `.env` ของ service เหลือเป็น local override mirror เท่านั้น
- 2026-09-16 — **Knowledge sync/relay (user decision, design v14)**: BE-008 กลไกการรับค่าเปลี่ยนเป็น
  "service อ่าน prod.config ตรง" — ตัดขั้น devops env-injection ออก (ทับข้อความ relay ก่อนหน้าของ v13) ·
  กติกาที่คงเดิม: ห้าม hardcode ในซอร์ส · ฝั่ง ClassOnlineWeb ไม่มีโค้ดเรียก AI · `/readyz` รายงานแค่ presence ·
  เงื่อนไขปลดล็อก BE-008 ไม่เปลี่ยน: ผู้ใช้เติม `ApiKey` + `Endpoint` ใน prod.config · RISK-F25 (Minor,
  file-path coupling) ยอมรับโดยมติผู้ใช้
ส่งต่อ reviewer

Back-links: `INDEX.md`
