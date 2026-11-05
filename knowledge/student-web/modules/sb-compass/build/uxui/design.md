# sb-compass — UXUI lane artifact (FE-001, FE-002)

- **Module**: sb-compass
- **Date**: 2026-09-15
- **Status**: **✅ Approved — signed off by `dev` (user), 2026-09-15.** (`sta roles signoff uxui` unavailable in this installation's orchestrator — no knowledge store — so this header is the auditable sign-off record.) Open questions resolved per user direction "ทำตามคำแนะนำ": Q1 → (a) Analytics.cshtml added to FE-002 scope via plan amend; Q2 → drop mock counts; Q3 → `เทียบเครือข่าย SchoolBright`
- **Scope**: FE-001 (Premium subject-breakdown screen, REQ-016 / DES-018 / AC-016.1–016.7) and FE-002 (WORD-01 final copy, REQ-019 / DES-020)
- **Role**: `uxui-designer` — read-only consultant; this document is draft copy + UX spec only. It does not amend `design.md`, `plan.md`, or `requirement.md`, and records no approvals.

---

## FE-001 — Premium subject-breakdown screen (REQ-016, DES-018)

The layout question is **settled and closed** (OQ-16, user-confirmed 2026-09-15): **Table in Card** — one card per subject group (กลุ่มสาระ), each card containing a table of per-course rows — and `Credit == null` renders the exact string `"ไม่มีข้อมูลหน่วยกิต"`. This section turns that decision into an implementable spec. It re-opens nothing.

### 1. Placement and context

- Screen: the Premium stat section that renders the `calculate/score` response (today: `Views/Compass/Analytics.cshtml` `#cp-premium` / `cp-stat-*` slots, populated by `assets/js/compass.js` `renderStat`).
- The breakdown extends the existing "คะแนนน้อง เทียบค่าเฉลี่ยเครือข่าย" comparison panel: each subject group the student already sees as one row now carries its per-course table directly beneath/beside it, inside the group's own card block. The subject-level row itself (group name, network mean, student's credit-weighted score) stays exactly as today — the breakdown is **additive**, never a replacement (AC-016.1: both levels shown together).
- Data source: `VMSubjectStat.Courses` (`List<VMCourseBreakdown>`) only. **The screen renders what the backend sends — it never computes, re-aggregates, or infers any value client-side** (plan.md FE-001 "Scope and constraints"). Sort order comes from the backend (DES-018: score desc, ties by course name); the client does not re-sort.

### 2. Card anatomy (per subject group)

```
┌─────────────────────────────────────────────────────────┐
│ คณิตศาสตร์            ค่าเฉลี่ย 68.5      78.25  ← group header (existing row:  │
│                                                    Subject / Mean / StudentScore)│
│ ┌───────────────────────────────────────────────────┐   │
│ │ รายวิชา              คะแนนดิบ (0–100)    หน่วยกิต │   │
│ │ คณิตศาสตร์ (เทอม 1)        90                1.0  │   │
│ │ คณิตศาสตร์ (เทอม 2)        75                1.0  │   │
│ │ คณิตศาสตร์เพิ่มเติม          88   ไม่มีข้อมูลหน่วยกิต│   │
│ └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

1. **Group header** — the existing subject row (group name + network mean + credit-weighted student score, colored `is-better`/`is-below` as today). Unchanged.
2. **Breakdown table** — sits inside the same group card, visually nested (soft background `#f7f7fb`, radius 8px, slightly smaller type — the `cp-course-table` conventions already present in `compass.css`).

### 3. Table columns and data bindings

| Column (Thai header) | Binds to (`VMCourseBreakdown`) | Rendering rule |
|---|---|---|
| รายวิชา | `CourseName` | Plain text. If `Term` is non-empty, append a muted suffix `(เทอม {Term})`. `CourseCode` is **not** displayed — it is an internal identifier and null-tolerant; showing it adds noise for a student audience. |
| คะแนนดิบ | `Score` | Raw 0–100 as sent. Right-aligned, tabular numerals (`font-variant-numeric: tabular-nums`). No decimal manipulation, no re-rounding, no color coding (better/worse coloring is a subject-level affordance; per-course rows stay neutral). |
| หน่วยกิต | `Credit` | If number: render as sent, right-aligned. If `null`: render the **exact string `ไม่มีข้อมูลหน่วยกิต`** — muted color, italic — **never `0`, never blank, and the row is never hidden** (DES-018 AC4 / AC-016.7, OQ-16 closure). |

### 4. Row and ordering rules (from DES-018 — restated, not re-decided)

- Every course in `Courses` is a row; the client filters nothing.
- Same course across terms → **separate rows per term**, each with its `Term` label (DES-018: never merged — each row is a real unit of the weighting formula).
- Groups with a single course still show the one-row table (AC-016.2 — never suppress the breakdown).
- Non-numeric-score courses and non-core courses never arrive in `Courses` (filtered server-side); the client does not re-implement those filters.
- Fallback groups (total credit = 0): table renders normally with `ไม่มีข้อมูลหน่วยกิต` in every credit cell; the group's `StudentScore` shown is the plain average — as sent, with no special UI treatment (DES-018 last rule).

### 5. Empty states

- `Courses` empty or absent → render nothing extra for that group (no empty table, no placeholder row). The subject-level row remains.
- All groups lack `Courses` (e.g. entitlement edge or transient empty payload) → the comparison panel renders exactly as it does today; no new error copy is introduced by FE-001.

### 6. Free tier — untouched

FE-001 changes nothing on the free page (`analyst/{sID}`): still group-level rows with plain averages (AC-016.6). No shared CSS class used by the free page may be visually altered in a way that changes its rendering; the breakdown styles live in their own `cp-course-*` selectors, as the current CSS already organizes them.

### 7. Accessibility and Thai typography (match existing conventions)

- Table semantics: a real `<table>` with `<thead>`/`<th scope="col">` (the current `courseBreakdownHtml` in `compass.js:251-271` already does this) — screen readers announce it as a data table.
- `"ไม่มีข้อมูลหน่วยกิต"` is text content of the cell (not a tooltip or `title`), so it is announced by screen readers and visible at all font sizes.
- Numerals: tabular numerals for score/credit columns (already the CSS convention); Thai text in the course-name column uses the page's existing font stack — no new fonts.
- Contrast: muted gray (`var(--cp-muted)` `#6d6d82` on `#f7f7fb`) matches the existing `is-no-credit` style and passes the same contrast tier the current design tokens already use; do not lighten it further.
- Mobile: the table is 3 narrow columns and needs no horizontal scroll at 360px; keep it that way — do not add columns.

### 8. Relationship to current code (note for `frontend-engineer`)

`assets/js/compass.js:244-288` already contains `courseBreakdownHtml` with the exact null-credit copy and a nested `cp-course-table` under each subject row of the shared comparison table, and `compass.css:1038-1082` carries its styles. That markup realizes "table attached to each group row"; whether each group row + its table gets promoted to a standalone `.cp-card` block (strictest reading of "การ์ดกลุ่มสาระ บรรจุตาราง") is a **structural styling choice** — the spec's requirement is the visual outcome: each group's breakdown reads as one self-contained unit (header + its own table), clearly separated from the next group. The existing nesting inside one wide table meets the confirmed layout only if the per-group separation is visually unambiguous; otherwise wrap each group in its own card. QA checks the outcome, not the markup shape.

---

## FE-002 — WORD-01 final copy (REQ-019 / AC-019.2, DES-020)

**Meaning constraint (WORD-01, non-negotiable):** wording must convey comparison against the **student database in the SchoolBright network (เครือข่าย SchoolBright)** — never "ทั่วประเทศ", "ระดับประเทศ", "ทั้งประเทศ", or any phrasing with the same meaning. Mock numbers (e.g. "9 โรงเรียน", "อันดับ 3,693 จาก 4,191 คน") are **out of WORD-01 scope** and stay as-is.

### Current state (verified against source, 2026-09-15)

The four FE-002 files (`Views/Compass/MyCompass.cshtml`, `assets/js/compass-design.js`, `compass-design-data.js`, `compass-design-engine.js`) currently contain **no forbidden wording** — grep for "ทั่วประเทศ"/"ระดับประเทศ"/"ทั้งประเทศ" returns nothing. `compass-design.js:307` already reads `เทียบกับนักเรียนในระบบ SchoolBright` (the non-plus branch). What remains open (EVD-021, `state=unresolved`) is the **final `statTitle` copy** and the surrounding stat-card strings. All WORD-01-relevant wording points in the four files are in `compass-design.js` — `MyCompass.cshtml` and the data/engine files carry none.

### Final copy table (proposal — draft for sign-off)

| # | Point (file:line today) | Old text | **Proposed final copy** | Rationale (WORD-01) |
|---|---|---|---|---|
| C1 | `statTitle`, non-plus branch (`compass-design.js:307`) | `Stat เทียบกับนักเรียนในระบบ SchoolBright` | **`Stat เทียบเครือข่าย SchoolBright`** | Uses the sanctioned "เครือข่าย SchoolBright" frame; parallel to the plus branch so only the base description differs, not the structure. (Current text is already compliant — this proposal only tightens consistency; keeping the current string is also acceptable.) |
| C2 | `statTitle`, plus branch (`compass-design.js:307`) | `Stat เทียบเครือข่ายทั้ง 9 โรงเรียน` | **`Stat เทียบเครือข่าย SchoolBright`** (drop the mock count from the title) | The "9 โรงเรียน" count is mock data, out of WORD-01 scope — but titles should not hardcode a number that will change when real data lands. Same copy for both tiers is safe because the lock overlay (C6) already distinguishes them. If the number must stay for the mock, `Stat เทียบเครือข่าย SchoolBright ทั้ง N โรงเรียน` is the compliant pattern (`compass.js:294` already builds exactly this from real `SchoolCount`). |
| C3 | Stat card subtitle (`compass-design.js:382`) | `เห็นน้องอยู่ตรงไหนของ ป.5 ทั้งเครือข่าย SchoolBright · เทียบค่าเฉลี่ยรายวิชา` | **keep as-is** | Already framed as เครือข่าย SchoolBright; compliant and natural Thai. |
| C4 | Ranking panel title (`compass-design.js:384`) | `อันดับใน ป.5 · ทั้งเครือข่าย` | **`อันดับใน ป.5 · เครือข่าย SchoolBright`** | "ทั้งเครือข่าย" alone is borderline — it implies a complete network but never names the base. Naming SchoolBright removes any reading of "all schools nationwide" and matches C1/C2. |
| C5 | Compare panel footnote (`compass-design.js:391`) | `ค่าเฉลี่ยจากเครือข่ายโรงเรียน SchoolBright ปีการศึกษา 2569 — ไม่ใช่เกณฑ์คัดเลือกของมหาวิทยาลัย` | **keep as-is** | Explicitly names the SchoolBright network base and adds an honest anti-overclaim disclaimer — this is the model sentence for WORD-01. |
| C6 | Lock overlay (`compass-design.js:394`) | `สถิติเทียบเครือข่ายอยู่ใน SB Plus` / `อัปเกรดเพื่อดูอันดับและค่าเฉลี่ยเทียบทั้งเครือข่าย 9 โรงเรียน` | **`สถิติเทียบเครือข่าย SchoolBright อยู่ใน SB Plus`** / **`อัปเกรดเพื่อดูอันดับและค่าเฉลี่ยเทียบเครือข่าย SchoolBright`** (drop the mock "9 โรงเรียน") | Same rationale as C2/C4 — name the base, don't carry mock counts into upsell copy. |

**Fallback rule (already stated by DES-020, restated for the engineer):** if this copy is not yet signed off, keep the current on-screen wording at every point (it is already compliant) — the engineer never invents replacement wording. Any point found still using forbidden words must switch to the "เครือข่าย SchoolBright" frame immediately, without waiting for final copy.

**Out of scope for FE-002 (unchanged):** mock numbers, ranking logic, schema/payload, and every file other than the four named.

---

## Findings outside FE-002's file list (report, not acted on)

While sweeping for forbidden wording I found two live WORD-01 violations in **`Views/Compass/Analytics.cshtml`** (the REQ-004 Premium screen, not a FE-002 file):

- line 75: `<span id="cp-stat-title">Stat เทียบเครือข่ายทั่วประเทศ</span>` — overridden at runtime by `compass.js:294` (`Stat เทียบเครือข่ายทั้ง N โรงเรียน`, compliant), so it flashes only before JS runs / if JS fails.
- line 110 (gate upsell list, static HTML): `อันดับ + percentile เทียบเครือข่ายทั่วประเทศ` — **always visible**, never overridden.

DES-020 scope item (2) explicitly requires checking the existing REQ-004 screens, but plan task FE-002's "Do not modify" restricts edits to the four MyCompass files. This needs a routing decision (see open questions) — I changed nothing.

---

## Open questions for the user

*(All three resolved 2026-09-15 by the sign-off above — kept verbatim for the record.)*

1. **Analytics.cshtml violations (routing)**: `Views/Compass/Analytics.cshtml:75` and `:110` still carry "เทียบเครือข่ายทั่วประเทศ" (line 110 statically visible in the Premium upsell list). DES-020 says REQ-004 screens are in WORD-01's scope, but FE-002's file list excludes this file. Should this be (a) added to FE-002's scope by a `plan.md` amend, (b) a separate small task, or (c) left for the REQ-019 remainder round? Suggested fix copy if (a)/(b): line 75 → `Stat เทียบเครือข่าย SchoolBright` (matches C1); line 110 → `อันดับ + percentile เทียบเครือข่าย SchoolBright`.
2. **Mock counts in titles (C2/C6)**: I propose dropping "9 โรงเรียน" from `statTitle` and the lock overlay because it is mock data baked into headings. If you prefer keeping a count in the mock for demo realism, the compliant pattern is `เครือข่าย SchoolBright ทั้ง N โรงเรียน` — confirm which.
3. **C1/C4 phrasing**: confirm `เทียบเครือข่าย SchoolBright` (my proposal) vs keeping the current `เทียบกับนักเรียนในระบบ SchoolBright` / `ทั้งเครือข่าย`. Both are compliant; the choice is tone, and it is yours.

---

## Change Log

- 2026-09-15 — Initial draft (FE-001 spec from the closed OQ-16 decision; FE-002 final-copy proposal for `compass-design.js` wording points; reported Analytics.cshtml violations found during the sweep). Awaiting human sign-off.
- 2026-09-15 — **Approved by `dev` (user).** Resolutions: Q1(a) Analytics.cshtml:75,110 joins FE-002 scope via plan.md amend; Q2 drop mock "9 โรงเรียน" counts; Q3 use `เทียบเครือข่าย SchoolBright`.
