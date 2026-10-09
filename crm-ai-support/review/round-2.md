# Phase 1 — Case Classification & Safety

## Verification Summary

**Phase 1 — Case Classification & Safety, TARGETED round** (re-check of the 3 items the FULL round below flagged; the FULL round's own summary/results follow this one, kept in place since no later phase has superseded it yet).

- Fixed items re-inspected directly, not taken on the engineer's word:
  - `review-queue/page.tsx` and `settings/safety-keywords/page.tsx` rewritten: icon+`HeaderBar` extracted into new `"use client"` components (`case-review-header.component.tsx`, `safety-keyword-header.component.tsx`), matching the existing `api-check-header.tsx` pattern exactly. Confirmed both files no longer import `@ant-design/icons` directly.
  - `case-review-detail-drawer.component.tsx` restructured: split into an outer `CaseReviewDetailDrawer` (no state) and an inner `CaseReviewDetailDrawerContent` keyed by `item.supportCase.CrmSupportId`, so per-item state resets via remount instead of a `useEffect` calling `setState`. Confirmed the `useEffect` import and the effect itself are both gone.
- Files touching the same area: `case-review-table.component.tsx` (imports `CaseReviewDetailDrawer`, default export/props unchanged) — re-inspected, still compiles and wires correctly (confirmed by the clean build below, which would fail on a broken import).
- Shared-code watchlist checked: `crm-ai.guard.ts`, `sb-helper.axios.ts`, `BackendLayout`/`PermissionLayout`/`HeaderBar`/`StatusModalComponent` — none touched by this fix, no regressions expected or found.
- Full contract check re-run: `schema.prisma` vs `design.md` Data Model — unchanged since the FULL round (this fix touched no schema), still matches exactly.
- **`bun run lint`** (whole project): 341 problems (315 errors/26 warnings) — one fewer than the FULL round's 342, and zero matches for `crm-ai` in the output (previously 1). The remaining 341 are pre-existing, unrelated to this phase.
- **`bun run build`** (whole project): **exit 0 — passes.** Both `/pages/support/crm-ai/review-queue` and `/pages/support/crm-ai/settings/safety-keywords` appear in the build output as successfully generated routes, along with all 6 `/api/v2/support/crm-ai/*` routes.
- Surface sweep: every Phase 1 route/page appears in the build's route list; nothing deleted or orphaned by the fix.

**Phase 1 — Case Classification & Safety, FULL round** (first verification of this phase).

- Read `requirement.md`, `design.md` (Data Model + Classification & Safety Override Rules + Modules in full), `plan.md` (Phase 1 block + Plan Summary + Sequencing Notes + Unresolved Open Questions).
- Inspected every Phase 1 task's actual code with Read/Glob/Grep — not just checking files exist, but checking logic against `design.md`'s rules line by line.
- Compared `schema.prisma` (jabjai-master-single-db) against `design.md`'s Data Model field-by-field for the 4 models Phase 1 touches (`TCrmSupport`'s 3 new columns, `TCrmCaseAiAssessment`, `TCrmSafetyKeyword`, `TCrmAiDecisionLog`) — all match exactly, no renamed/missing/invented fields.
  - Note: `schema.prisma` also already has `TCrmIssue`/`TCrmKnowledgeEntry` with extra columns (`ProductFeatureId`, `BacklogProjectID`/`BacklogIssueID`, `Version`, `SupersededById`) that `design.md` explicitly excluded from MVP scope. This is real DB state confirmed by the user (a prior DDL run), not something this phase's code touches or introduced — irrelevant to Phase 1, will matter when Phase 2 is verified.
- Ran automated checks:
  - **`bun run lint`**: exited 1. Project-wide it already has 316 pre-existing errors/26 warnings unrelated to this phase. Of those, **one is in Phase 1 code**: `case-review-detail-drawer.component.tsx:49`. Everything else in the lint output belongs to files this phase never touched.
  - **`bun run build`**: exited 1 — **fails**, and the failure is caused directly by this phase's code (not pre-existing). Compilation itself succeeded ("✓ Compiled successfully in 2.4min", TypeScript validation skipped per this repo's `ignoreBuildErrors: true`), but page-data collection crashed on `/pages/support/crm-ai/review-queue`. Build never reached `/pages/support/crm-ai/settings/safety-keywords`, but source inspection confirms the identical bug is present there too (same import pattern, same missing `"use client"`).
  - No `bun test` run for this phase — Phase 1 doesn't touch `src/helpers/overtime/` or `src/helpers/payroll/`, the only two directories with test coverage in this repo. Verification here is code inspection against `requirement.md`/`design.md`, not test-covered.

## Verified File Manifest — Phase 1

| File | Bytes | Lines | Round |
|---|---:|---:|---|
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-header.component.tsx` (new, round 2) | 512 | 18 | 2 |
| `src/app/pages/support/crm-ai/settings/safety-keywords/_components/safety-keyword-header.component.tsx` (new, round 2) | 538 | 18 | 2 |
| `src/app/pages/support/crm-ai/review-queue/page.tsx` (rewritten, round 2) | 610 | 17 | 2 |
| `src/app/pages/support/crm-ai/settings/safety-keywords/page.tsx` (rewritten, round 2) | 614 | 17 | 2 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-detail-drawer.component.tsx` (rewritten, round 2) | 6,145 | 168 | 2 |
| `prisma/jabjai-master-single-db/schema.prisma` (TCrmSupport + 3 cols, TCrmCaseAiAssessment, TCrmSafetyKeyword, TCrmAiDecisionLog sections) | — | — | 1 |
| `src/constants/permission.constant.ts` | 5,392 | 140 | 1 |
| `src/constants/crm-sla-rule.constant.ts` | 1,146 | 33 | 1 |
| `src/app/api/v2/support/crm-ai/crm-ai.guard.ts` | 1,802 | 49 | 1 |
| `src/app/api/v2/support/crm-ai/safety-keywords/route.ts` | 2,148 | 69 | 1 |
| `src/app/api/v2/support/crm-ai/safety-keywords/[id]/route.ts` | 2,296 | 69 | 1 |
| `src/app/api/v2/support/crm-ai/safety-keywords/safety-keyword.schema.ts` | 913 | 22 | 1 |
| `src/app/api/v2/support/crm-ai/safety-keywords/safety-keyword.repository.ts` | 1,481 | 49 | 1 |
| `src/app/api/v2/support/crm-ai/safety-keywords/safety-keyword.service.ts` | 1,051 | 33 | 1 |
| `src/app/api/v2/support/crm-ai/cases/classify-with-gemini.ts` | 3,467 | 100 | 1 |
| `src/app/api/v2/support/crm-ai/cases/classification.repository.ts` | 1,652 | 56 | 1 |
| `src/app/api/v2/support/crm-ai/cases/classification.service.ts` | 4,196 | 120 | 1 |
| `src/app/api/v2/support/crm-ai/cases/[id]/classify/route.ts` | 1,441 | 41 | 1 |
| `src/app/api/v2/support/crm-ai/review-queue/route.ts` | 1,414 | 42 | 1 |
| `src/app/api/v2/support/crm-ai/review-queue/[id]/route.ts` | 1,675 | 43 | 1 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.schema.ts` | 1,043 | 21 | 1 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.repository.ts` | 3,072 | 84 | 1 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.service.ts` | 2,193 | 58 | 1 |
| `src/app/api/v2/support/crm-ai/decision-log/route.ts` | 1,321 | 43 | 1 |
| `src/app/api/v2/support/crm-ai/decision-log/decision-log.schema.ts` | 828 | 22 | 1 |
| `src/app/api/v2/support/crm-ai/decision-log/decision-log.repository.ts` | 1,006 | 27 | 1 |
| `src/constants/sidebar-menu-constant.tsx` | — | — | 1 |
| `src/locales/thai-menu.json`, `src/locales/eng-menu.json` | — | — | 1 |
| `src/app/pages/admin/permission/_stores/permission-management-store.ts` | — | — | 1 |
| `src/app/pages/support/crm-ai/review-queue/page.tsx` | 989 | 25 | 1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-overview.component.tsx` | 1,050 | 28 | 1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-filter.component.tsx` | 2,745 | 82 | 1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-table.component.tsx` | 4,586 | 134 | 1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-detail-drawer.component.tsx` | 5,873 | 158 | 1 |
| `src/app/pages/support/crm-ai/review-queue/_stores/use-case-review-store.ts` | 3,073 | 112 | 1 |
| `src/app/pages/support/crm-ai/review-queue/_api/case-review-service.ts` | 1,779 | 63 | 1 |
| `src/app/pages/support/crm-ai/settings/safety-keywords/page.tsx` | 993 | 25 | 1 |
| `src/app/pages/support/crm-ai/settings/safety-keywords/_components/*` (4 files) | — | — | 1 |
| `src/app/pages/support/crm-ai/settings/safety-keywords/_stores/use-safety-keyword-store.ts` | 3,357 | 124 | 1 |
| `src/app/pages/support/crm-ai/settings/safety-keywords/_api/safety-keyword-service.ts` | 1,241 | 33 | 1 |
| `src/app/pages/support/backlog/crm/_stores/crm-store.ts` | — | — | 1 |

## Per-Task Results — Phase 1

- ✅ [backend] `TCrmSupport` +3 columns (`MenuId`/`AiCategory`/`Severity`) — matches `design.md` exactly, all nullable, no default
- ✅ [backend] `TCrmCaseAiAssessment` model — all 26 fields match `design.md` exactly
- ✅ [backend] `TCrmSafetyKeyword` model — matches exactly
- ✅ [backend] `TCrmAiDecisionLog` model — matches exactly, append-only columns correctly limited to 4 mutable fields in code
- ✅ [backend] `PERMISSIONS.CRM_AI_CS`/`CRM_AI_SA`/`CRM_AI_PM` — present in `permission.constant.ts`, plus `MENU_SUPPORT_CRM_AI` for sidebar visibility (reasonable addition, not in plan.md literally but needed for the sidebar task)
- ✅ [backend] SLA rule constant — present as `crm-sla-rule.constant.ts` (`CRM_SEVERITY_WEIGHT`/`CRM_CONTRACT_TIER_MULTIPLIER`/`CRM_AI_CONFIDENCE_THRESHOLD`/`CRM_SLA_RULE_VERSION`/`computeCrmPriorityScore`) — values match plan.md exactly (100/70/40/10, 1.0–2.0, threshold 0.6). Named differently from plan.md's literal `CRM_SLA_RULES` — functionally equivalent, not a defect, just noting the name doesn't match plan.md's wording verbatim
- ✅ [backend] `POST /safety-keywords` — guard `CRM_AI_SA_PM`, Zod-validated, `withLogging` wrapped, 201 + explicit status
- ✅ [backend] `GET /safety-keywords` — pagination via `buildPagination`, search/active filter
- ✅ [backend] `PATCH /safety-keywords/[id]` — 404 via `AppError` if not found, partial update
- ✅ [backend] `DELETE /safety-keywords/[id]` — 404 check, then delete
- ✅ [backend] `POST /cases/[id]/classify` — matches Classification & Safety Override Rules exactly: safety-keyword check first (case-insensitive substring, `Active=true` only) → forces `BUG`+`CRITICAL`+`SafetyOverride=true`+`NEEDS_HUMAN` without calling Gemini; otherwise calls Gemini once for category+severity together; `NEEDS_HUMAN` set when confidence < 0.6; writes `TCrmAiDecisionLog` rows for `SAFETY_OVERRIDE`/`CLASSIFICATION`, `SEVERITY_CLASSIFICATION` (if severity present), `PRIORITY` (if score computed); upserts `TCrmCaseAiAssessment` (1:1, correct since re-classify replaces not duplicates); updates `TCrmSupport.AiCategory`/`Severity`. `MenuId` intentionally left untouched — correctly documented in `_docs/classify-spec.md` as deferred (no Contract section in `design.md` covers menu retrieval, so not guessed)
- ✅ [backend] `GET /review-queue` — filters `ReviewStatus IN (PENDING_REVIEW, NEEDS_HUMAN)` by default or exact match if `review_status` given; `ai_category`/`severity` filters correctly resolved via `TCrmSupport` lookup **before** pagination (avoids a pagination-count bug that would occur if filtered after `skip`/`take`)
- ✅ [backend] `PATCH /review-queue/[id]` — `CONFIRMED`/`OVERRIDDEN`, requires `overridden_category` when `OVERRIDDEN` (400 if missing), updates `TCrmSupport` only on override, always writes a new `TCrmAiDecisionLog` row, never mutates an existing one
- ✅ [backend] `GET /decision-log` — read-only, paginated, filters by `SubjectType`/`SubjectId`/`DecisionType`
- ✅ [frontend] Sidebar entry — both menu items present in `sidebar-menu-constant.tsx` with `news: true`, `PERMISSIONS.MENU_SUPPORT_CRM_AI`, correct `href`s, TH/EN labels added to `thai-menu.json`/`eng-menu.json`
- ✅ [frontend] `review-queue/page.tsx` scaffold — **(round 2)** fixed: icon+`HeaderBar` moved into new `case-review-header.component.tsx` (`"use client"`), `page.tsx` is now a plain Server Component again. `bun run build` passes.
- ✅ [frontend] `case-review-filter.component.tsx` — `"use client"`, 2-col filter, `CardSectionHeader`, matches `AiCategory`/`Severity`/`ReviewStatus` filter fields
- ✅ [frontend] `case-review-table.component.tsx` — sequence column, refresh button in `extra`, clickable case ID with tooltip, sortable columns, no `maxWidth`
- ✅ [frontend] `case-review-detail-drawer.component.tsx` — **(round 2)** fixed: split into outer/inner component, inner keyed by `CrmSupportId` so state resets via remount, no `useEffect`. Lint clean.
- ✅ [frontend] `use-case-review-store.ts` — Zustand store, draft/applied filter split, matches `api-check` store pattern
- ✅ [frontend] `case-review-service.ts` — `callApiService` calls match backend routes/params exactly
- ✅ [frontend] `settings/safety-keywords/page.tsx` scaffold — **(round 2)** fixed the same way as `review-queue/page.tsx`, via `safety-keyword-header.component.tsx`. Build now reaches and generates this route successfully.
- ✅ [frontend] `safety-keyword-table.component.tsx` + `safety-keyword-form-modal.component.tsx` — CRUD via `StatusModalComponent` (`"confirm"` for add/edit, `"delete"` for delete), sequence column, refresh+add buttons in `extra`, `Switch` for `Active` toggle
- ✅ [frontend] `use-safety-keyword-store.ts` + `safety-keyword-service.ts` — matches backend routes
- ✅ [frontend] Permission page wiring — `CRM_AI_CS`/`CRM_AI_SA`/`CRM_AI_PM`/`MENU_SUPPORT_CRM_AI` all have Thai labels in `permission-management-store.ts`
- ✅ [frontend] Auto-trigger classify — `crm-store.ts`'s `createCase` fires `POST /cases/${created.id}/classify` after success, `.catch(() => undefined)` so a Gemini failure never surfaces as a false "create failed" toast

## Design/requirement contract checks — Phase 1

- Schema field-by-field: **no drift** for the 4 models Phase 1 touches (see Verification Summary).
- Safety override rule (design.md rule 2): **matches** — BUG-only, keyword match forces `BUG`+`SafetyOverride=true` unconditionally.
- TASK skip-safety-gate rule (design.md rule 3 / requirement.md Change Log): **matches** — TASK only reachable via the non-safety-triggered Gemini branch, no special gate applied, consistent with "TASK routes like BUG minus the safety check."
- Append-only `TCrmAiDecisionLog` (design.md rule 5): **matches** — code only ever `create`s, `updateAssessmentReview`/`review` only touch the 4 allowed columns on `TCrmCaseAiAssessment`, never on `TCrmAiDecisionLog` itself.
- `NEEDS_HUMAN` threshold (design.md rule 4 + Unresolved Open Questions): implemented at `0.6` per `plan.md`'s locked default — **but `design.md` itself was never updated to reflect this**, so a future reader of `design.md` alone would still see it as unresolved. Doc-only gap, routed to `system-analyst` as non-blocking.
- MVP scope cut (design.md § Data Model "ตัดออกจาก draft DDL"): **respected** — no code references `TCrmProductFeature`/`TCrmMenuRelation`/`TCrmAiSuggestion`/`TCrmQueueInterrupt`/`TCrmCustomerPromise`/`TCrmStaffRole`, and `MenuId`/`ProductFeatureId`/`Version`/`SupersededById` on the Phase-2 models are untouched by Phase 1 code.

## Issues Found — Phase 1

_(all 3 items from the FULL round fixed and confirmed in the TARGETED round — see below. None open.)_

## Review Outcome — Phase 1

**Accepted.** TARGETED round (2026-08-16) confirmed all 3 previously-flagged items fixed: `bun run build` passes (exit 0, both pages + all 6 API routes generated), `bun run lint` shows zero `crm-ai` matches. All 25 Phase 1 tasks in `plan.md` are now ✅ and checked off.

**Deploy eligibility**: this acceptance is based on a TARGETED round, not a FULL one — per the rule that only a FULL round makes a phase eligible for `devops`, Phase 1 is **accepted, pending a FULL round before deploy**. Recommend running one more FULL round before handing to `devops` (cheap now, since everything is already fixed — it should come back clean).

Phase 1 is 🔒 Security-gated per `plan.md` — still needs a `security` round before `devops` will ship it, independent of the FULL-round requirement above (security audits don't need a FULL functional round to proceed).

## Change Log

- 2026-08-16: Phase 1 FULL verify round. 12/14 backend tasks + 9/11 frontend tasks ✅ Verified and checked off in `plan.md`. 2 frontend tasks ❌ Failed (build-breaking `"use client"` omission in both `page.tsx` scaffolds), 1 frontend task ⚠️ Partial (lint-only). `bun run lint` and `bun run build` both run for real; `bun run build` fails because of this phase's code. Routed to `frontend-engineer`.
- 2026-08-16: Phase 1 TARGETED re-verify round. All 3 previously-flagged items fixed and confirmed (`bun run build` exit 0, `bun run lint` clean of `crm-ai` matches). All 25 Phase 1 tasks now ✅ in `plan.md`. Accepted, pending a FULL round before `devops` per the deploy-eligibility rule, and still pending `security` (🔒 gate in `plan.md`).
- 2026-08-16: At the user's request, verified schema-vs-DB claim directly instead of trusting it — backed up `schema.prisma`, ran a real `prisma db pull` against jabjai-master-single-db, diffed against the pre-pull copy, then restored the original file (the pull touches 177 models across the whole app; a full-file replacement wasn't warranted just to answer this question — restoring keeps this round's blast radius to inspection only). Confirmed: **Phase 1's 4 models are byte-identical to the live DB** — solid. Also discovered: **all 8 models `design.md` deferred to Phase 2+ do not exist in the real database at all** — they were only ever written into `schema.prisma` by hand, never pushed. Logged as a new blocking Open Issue for Phase 2.
- 2026-08-17: Phase 1 Amendment (Menu Classification, Per-Dimension Review, Legacy Backfill) FULL verify round archived below — first `qa-engineer` pass on this amendment, which had been implemented directly on 2026-08-16 without going through the normal handoff (all 13 `plan.md` boxes were already checked before this round). All 13 tasks inspected from scratch against `design.md`/`requirement.md`; all 13 ✅ Verified. `bun run lint`/`build` re-run independently: 341 pre-existing problems (zero in `crm-ai` files), build exit 0; `bun test` 211/211 pass but doesn't cover this amendment's files. 2 non-blocking gaps found *in* `design.md` itself, routed to `system-analyst` — both since resolved by the CR 2026-08-17 round (see current `review.md`).

---

# Phase 1 Amendment — Menu Classification, Per-Dimension Review & Legacy Backfill (2026-08-17 round, archived)

_Archived here because the CR 2026-08-17 round in `review.md` supersedes this one for the same underlying phase (Phase 1). Moved verbatim, not summarized._

## Verification Summary

**Phase 1 Amendment — Menu Classification, Per-Dimension Review & Legacy Backfill, FULL round** (first `qa-engineer` verification of this amendment — it was implemented directly by the session driving the pipeline on 2026-08-16 without a handoff, and all 13 `plan.md` boxes were already checked before this round started. Treated as a first-time FULL verification of every task, not taken on the "already checked" boxes' word.)

- Read `_docs/hkt/status.md` (crm-ai-support section in full), `plan.md` (Plan Summary, Phase 1 amendment block in full — 13 tasks, Sequencing Notes, Unresolved Open Questions), `design.md` (§ Menu Classification Rules, § Per-Dimension Review Rules, § Legacy Backfill Rules, plus Data Model for `TCrmCaseAiAssessment`/`TCrmAiDecisionLog`/`TCrmSafetyKeyword`/`TCrmSupport`'s 3 new columns), `requirement.md` in full, `.claude/shared/conventions.md` in full.
- Inspected every one of the 13 tasks' actual code with Read/Glob/Grep — logic checked against `design.md`'s rules, not just file existence or the pre-checked boxes.
- Compared `schema.prisma` (jabjai-master-single-db) against `design.md`'s Data Model field-by-field for the 4 models this amendment touches: `TCrmSupport` (`MenuId`/`AiCategory`/`Severity` — 3/3 match), `TCrmCaseAiAssessment` (28 fields incl. all `Menu*`/`Severity*` review columns — match), `TCrmAiDecisionLog` (11 fields incl. `DecisionType` covering `MENU_CLASSIFICATION` — match), `TCrmSafetyKeyword` (5 fields — match). **No drift.**
- Confirmed the anti-trap requirement directly against `schema.prisma`: `classification.repository.ts`'s `findMenuCatalog()` filters `TMenu.active` (not the misspelled `TMenu.actvice`, which also exists in the schema and would have silently returned the wrong rows) — read both columns in `schema.prisma` to confirm the correct one was picked.
- Ran automated checks (all independently, not taken on any report):
  - **`bun run lint`** (whole project): 341 problems (315 errors/26 warnings) — identical count to the last recorded baseline in `status.md`, **zero matches for `crm-ai` anywhere in the output** (confirmed via a separate grep pass).
  - **`bun run build`** (whole project): **exit 0.** All 4 amendment-relevant API routes appear in the route list (`/api/v2/support/crm-ai/backfill`, `/cases/[id]/classify`, `/decision-log`, `/review-queue`, `/review-queue/[id]`), and `/pages/support/crm-ai/review-queue` appears in the page list.
  - **`bun test`**: 211 pass, 0 fail, 19 files — this suite does not cover any file this amendment touched (only `src/helpers/overtime/`/`src/helpers/payroll/` have coverage in this repo). Stated plainly: verification of this amendment's logic is code inspection against `requirement.md`/`design.md`, not test-covered.
- Two non-blocking-to-partial gaps found and logged in Open Issues above — neither is a case of the code contradicting `design.md`'s literal text; both are gaps *in* `design.md` itself (an interaction between two Contract sections it didn't anticipate, and an ambiguous scope boundary). Full detail in Issues Found below.

## Verified File Manifest — Phase 1 Amendment

| File | Bytes | Lines | Round |
|---|---:|---:|---|
| `src/app/api/v2/support/crm-ai/cases/[id]/classify/route.ts` | 1,694 | 41 | amendment-1 |
| `src/app/api/v2/support/crm-ai/cases/classification.repository.ts` | 3,476 | 85 | amendment-1 |
| `src/app/api/v2/support/crm-ai/cases/classification.service.ts` | 13,552 | 261 | amendment-1 |
| `src/app/api/v2/support/crm-ai/cases/classify-with-gemini.ts` (new) | 11,667 | 184 | amendment-1 |
| `src/app/api/v2/support/crm-ai/cases/_docs/classify-spec.md` | 5,181 | 32 | amendment-1 |
| `src/app/api/v2/support/crm-ai/review-queue/[id]/route.ts` | 1,853 | 42 | amendment-1 |
| `src/app/api/v2/support/crm-ai/review-queue/route.ts` | 1,673 | 41 | amendment-1 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.repository.ts` | 4,388 | 101 | amendment-1 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.service.ts` (new) | 6,511 | 145 | amendment-1 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.schema.ts` | 2,408 | 43 | amendment-1 |
| `src/app/api/v2/support/crm-ai/review-queue/_docs/update-spec.md` | 2,736 | 31 | amendment-1 |
| `src/app/api/v2/support/crm-ai/decision-log/decision-log.repository.ts` (new) | 942 | 27 | amendment-1 |
| `src/app/api/v2/support/crm-ai/decision-log/decision-log.schema.ts` (new) | 746 | 21 | amendment-1 |
| `src/app/api/v2/support/crm-ai/decision-log/route.ts` (new) | 1,736 | 42 | amendment-1 |
| `src/app/api/v2/support/crm-ai/backfill/backfill.repository.ts` (new) | 2,175 | 39 | amendment-1 |
| `src/app/api/v2/support/crm-ai/backfill/backfill.service.ts` (new) | 2,308 | 43 | amendment-1 |
| `src/app/api/v2/support/crm-ai/backfill/route.ts` (new) | 1,882 | 40 | amendment-1 |
| `src/app/api/v2/support/crm-ai/backfill/_docs/create-spec.md` (new) | 3,579 | 32 | amendment-1 |
| `src/app/api/v1/support/crm/crm.repository.ts` (`STATUS_ALIASES` export, pre-existing, reused) | 36,147 | 782 | amendment-1 |
| `prisma/jabjai-master-single-db/schema.prisma` (`TCrmSupport`, `TCrmCaseAiAssessment`, `TCrmAiDecisionLog`, `TCrmSafetyKeyword`, `TMenu`, `TGroupMenu` sections — verified against `design.md`, not written by this amendment) | — | — | amendment-1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-detail-drawer.component.tsx` (rebuilt) | 12,548 | 310 | amendment-1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-table.component.tsx` (extended: Menu column) | 5,792 | 145 | amendment-1 |
| `src/app/pages/support/crm-ai/review-queue/_components/backfill-panel.component.tsx` (new) | 2,748 | 65 | amendment-1 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-overview.component.tsx` (extended: wires in `BackfillPanel`) | 1,227 | 33 | amendment-1 |
| `src/app/pages/support/crm-ai/review-queue/_stores/use-case-review-store.ts` (extended: backfill actions) | 4,642 | 156 | amendment-1 |
| `src/app/pages/support/crm-ai/review-queue/_api/case-review-service.ts` (extended: backfill + 3-dimension review payload) | 3,417 | 97 | amendment-1 |

## Per-Task Results — Phase 1 Amendment

- ✅ [backend] `REJECTED` accepted at app layer on all 3 review-status columns — confirmed via `review-queue.schema.ts`'s `REVIEW_DECISIONS = ["CONFIRMED","OVERRIDDEN","REJECTED"]` used identically by `CategoryReviewSchema`/`MenuReviewSchema`/`SeverityReviewSchema`; `schema.prisma` columns stayed `VarChar(20)` untouched, as specified
- ✅ [backend] `classify-with-gemini.ts` catalog fetch + combined call — `classificationRepository.findMenuCatalog()` queries `TMenu` where `active=true` (confirmed correct field vs. the misspelled `actvice`), joins `TGroupMenu` (`active=true`) via `groupmenuid` at the app layer, labels as `{groupmenu} > {MenuName}`; `classifyWithGemini()` appends the catalog to the same prompt as category/severity and requests `menuId`/`menuConfidence`/`menuReasoning` in the same JSON response — one Gemini call, not two, matching design.md rule 3
- ✅ [backend] Anti-hallucination validation — `resolveMenuResult()` in `classify-with-gemini.ts` checks the returned `menuId` against the catalog array passed in; if absent or not found, returns `menuId: null` while preserving `rawMenuId` for audit. `classification.service.ts` logs this exact case (`rejectedInvalidId`) into `TCrmAiDecisionLog` with `AiOutput: {rejected: true, reason: "invalid menu id", rawMenuId}`
- ✅ [backend] `classification.service.ts` writes `MenuConfidence`/`MenuReasoning`/`MenuReviewStatus` to `TCrmCaseAiAssessment` and `MenuId` to `TCrmSupport`; `MenuReviewStatus` computed from `CRM_AI_CONFIDENCE_THRESHOLD` (0.6, confirmed in `crm-sla-rule.constant.ts`) independently of `ReviewStatus`/`SeverityReviewStatus` — see Design/requirement contract checks below for a related but distinct ambiguity about `SeverityReviewStatus`'s own independence
- ✅ [backend] Safety Override path calls menu classification — `classifyMenuBestEffort(caseText, menuCatalog, true)` invoked from the `safetyOverride` branch, calling `classifyMenuOnlyWithGemini()` (a separate Gemini request, since category/severity are already keyword-forced and don't need re-asking)
- ✅ [backend] Best-effort try/catch verified structurally, not just by reading the comment: `classifyMenuBestEffort()` wraps its entire body (both the `classifyMenuOnlyWithGemini` call and the `fullResultMenu` branch) in `try/catch`, logs via `logger.error`, and returns `EMPTY_MENU_OUTCOME` on any failure — the calling code in `classify()` has no further try/catch around this call because none is needed: the function itself never throws. Traced the call graph to confirm a thrown error inside `classifyMenuOnlyWithGemini` (e.g. `GOOGLE_GEMINI_API_KEY` missing, all model fallbacks failing) cannot propagate past `classifyMenuBestEffort` to reach the `upsertAssessment`/`updateSupportCaseClassification` calls that persist category/severity/safety-override — confirms design.md rule 7's requirement is structurally enforced, not just intended
- ✅ [backend] `TCrmAiDecisionLog` rows with `DecisionType=MENU_CLASSIFICATION` — written separately from `CLASSIFICATION`/`SEVERITY_CLASSIFICATION` rows in both `classification.service.ts` (classify-time, only when `menuOutcome.attempted`) and `review-queue.service.ts` (review-time, only when `data.menu` is present in the PATCH payload); `decision-log.schema.ts`'s filter enum includes `MENU_CLASSIFICATION` as a distinct value from `CLASSIFICATION`/`SEVERITY_CLASSIFICATION`
- ✅ [backend] `review-queue.schema.ts` — `category` dimension: `OVERRIDDEN`/`REJECTED` both require `overridden_category` (Zod-optional, service-enforced with `AppError 400`); `REJECTED` additionally requires `review_reason` (service-enforced, distinct from `OVERRIDDEN` where it stays optional). `menu`/`severity` dimensions: `REJECTED` needs neither a replacement value nor a reason (both optional) — matches design.md's asymmetric table exactly
- ✅ [backend] `review-queue.service.ts`/`review-queue.repository.ts` apply each dimension independently — `category` writes `ReviewStatus` + conditionally `TCrmSupport.AiCategory`; `menu` writes `MenuReviewStatus`/`MenuReviewedBy`/`MenuReviewedAt` via the new `updateAssessmentDimensionReview()` helper + conditionally `TCrmSupport.MenuId` (`null` on `REJECTED`, the override value on `OVERRIDDEN`); `severity` mirrors `menu`. Each dimension present in the payload writes its own `TCrmAiDecisionLog` row (`CLASSIFICATION`/`MENU_CLASSIFICATION`/`SEVERITY_CLASSIFICATION`) — confirmed these are 3 separate `create()` calls, not one combined row
- ⚠️ [backend] `POST /api/v2/support/crm-ai/backfill` — batch size 100 (within the 100–150 range), query correctly implements design.md rule 4's `AiCategory IS NULL OR (AiCategory IS NOT NULL AND MenuId IS NULL)` (verified the boolean simplification to `OR: [{AiCategory: null}, {MenuId: null}]` is logically equivalent, not a shortcut that changes behavior), `STATUS_ALIASES.CLOSED`/`RESOLVED` correctly used to branch `CONFIRMED` vs. `NEEDS_HUMAN`, per-case failures caught and counted without failing the whole batch. **Gap**: the query has no way to exclude cases where `MenuId=NULL` because a human already reviewed and `REJECTED` the menu dimension (a legitimate permanent state per Per-Dimension Review Rules) — every future Backfill click will re-classify and silently overwrite that decision. See Issues Found and Open Issues.
- ✅ [backend] `GET /api/v2/support/crm-ai/backfill` — returns `{remaining}` using the same query as the POST batch selection, correct guard (`CRM_AI_SA_PM`)
- ✅ [frontend] `case-review-detail-drawer.component.tsx` — 3 independent `DimensionReviewBlock`s (menu/category/severity), each with the 3-way ใช้/ใช้แต่แก้ไข/ไม่ใช้ buttons; category dimension client-side-blocks submission (`categoryReady`/`canSubmit`) unless a `REJECTED` decision has both a replacement value and a non-empty reason, matching design.md's asymmetry; uses `StatusModalComponent` for both the confirm step and the success/error result, matching the mandated Form Workflow; the outer component keys its stateful child by `CrmSupportId` to force a clean remount per case instead of resetting state in a `useEffect` (avoids the `react-hooks/set-state-in-effect` trap the codebase has hit before) — confirmed via `bun run lint` showing zero `crm-ai` matches
- ✅ [frontend] `case-review-table.component.tsx` — "เมนู" column added, rendering `#{MenuId}` or `-`
- ✅ [frontend] `backfill-panel.component.tsx` — `if (backfillRemaining === null || backfillRemaining === 0) return null;` correctly auto-hides at 0 (and while progress hasn't loaded yet); wired into `case-review-overview.component.tsx` above the filter/table, calls `POST /backfill` via the store's `runBackfillBatch()`, shows the batch result in a `StatusModalComponent`

## Design/requirement contract checks — Phase 1 Amendment

- Schema field-by-field for the 4 models touched: **no drift** — see Verification Summary above.
- Menu Classification Rules item 1 (catalog = `TMenu.active=true` only, not `actvice`): **matches** — verified against the actual `schema.prisma` field list, both columns exist and the correct one was queried.
- Menu Classification Rules item 3 (single Gemini call, not two, for the normal path): **matches**. Note: this means a total Gemini-call failure (timeout, malformed JSON, network error) in the normal (non-Safety-Override) path fails category/severity *and* menu together, since they're one atomic HTTP response — this is an inherent, correct consequence of rule 3's mandate to combine the calls for cost, not a violation of rule 7's best-effort principle (rule 7's best-effort guarantee is fully honored in the two places it's actually separable: the Safety Override path's independent Gemini call, and the anti-hallucination check within a *successful* combined response).
- Menu Classification Rules item 6/7 (Safety Override still attempts menu classification, best-effort, never blocks the main save): **matches**, confirmed structurally (see Per-Task Results).
- Per-Dimension Review Rules' REJECTED asymmetry table (category needs replacement+mandatory reason; menu/severity can go NULL with optional reason): **matches** exactly in both `review-queue.schema.ts` and `review-queue.service.ts`.
- Per-Dimension Review Rules' note that Phase 1 "ผูก `SeverityReviewStatus` ตาม `ReviewStatus` เดียวกันแบบง่ายเกินไป (ไม่อิสระจริง)": **partially addressed**. The amendment's explicit ask ("ต้องแก้ endpoint `PATCH /review-queue/[id]`") is done — the review-queue endpoint now treats all 3 dimensions independently. But `classification.service.ts`'s classify-time computation of `SeverityReviewStatus` still derives from the category dimension's `reviewStatus`/`confidence`, not from `severityConfidence` against the threshold the way `MenuReviewStatus` now does. Whether this was meant to be in scope for this amendment is ambiguous from the design text — logged as a non-blocking open question for `system-analyst`, not a task failure (Task 4's literal wording only asked for Menu's independence).
- Legacy Backfill Rules item 1/4 (query = `AiCategory IS NULL` main backfill, reused for the `MenuId IS NULL AND AiCategory IS NOT NULL` sweep): **matches literally** — `backfillWhereClause()`'s `{OR: [{AiCategory: null}, {MenuId: null}]}` is a correct boolean simplification of the two-part rule (verified by truth table, not just visual inspection). **Gap found in the design, not the code**: this literal query doesn't account for `MenuId=NULL` also being a legitimate terminal state from a human `REJECTED` review (Per-Dimension Review Rules), so the two Contract sections interact in a way neither anticipated. See Open Issues.
- Legacy Backfill Rules item 2 (closed cases → `CONFIRMED` unconditionally; open cases → `NEEDS_HUMAN` unconditionally, using `STATUS_ALIASES`): **matches** — `backfill.service.ts` branches exactly on this, and correctly treats both `CLOSED` and `RESOLVED` aliases as "closed" (design.md's rule 2 says "ปิดแล้ว" covers both).
- Legacy Backfill Rules item 3 (manual per-batch trigger, 100–150 cases, not an automatic job): **matches** — `BACKFILL_BATCH_SIZE = 100`, no scheduler/cron wired to this endpoint, frontend requires an explicit button click per batch.

## Issues Found — Phase 1 Amendment

1. **Backfill/sweep query can silently overwrite a human's `REJECTED` menu-dimension decision.** `design.md`'s Legacy Backfill Rules query (`AiCategory IS NULL OR MenuId IS NULL`) treats every `MenuId=NULL` row as "not yet classified/failed" — but Per-Dimension Review Rules legitimately produces the same DB state when a human clicks "ไม่ใช้" on the menu dimension with no replacement. Every future click of the Backfill button (which is explicitly designed to double as the ongoing "sweep failed menu classifications" mechanism, not just the one-time ~70k legacy run) will pick these rows back up, call Gemini again, and overwrite `MenuReviewStatus`/`MenuConfidence`/`MenuReasoning` with a fresh AI attempt — with no error, no warning, and no distinction in the UI between "never classified" and "human already decided no menu applies." This is a gap between two `design.md` Contract sections, not a case of the code contradicting either one read in isolation. **Recommended fix** (for `system-analyst` to confirm, then `backend-engineer` to implement): exclude `MenuReviewStatus: "REJECTED"` from `backfillWhereClause()`. Routes to `system-analyst` because it requires amending `design.md`'s Legacy Backfill Rules to state the exclusion explicitly — this is a design gap, not an implementation bug. **Recommend resolving before the Backfill button is used against real data** (the ~70k legacy run or ongoing sweep use), and before deploy.
2. **`SeverityReviewStatus` at classify-time is not computed independently from `severityConfidence`**, unlike `MenuReviewStatus` which the amendment made independent of the category dimension. `design.md`'s own text flags the underlying Phase 1 simplification but only explicitly asks to fix the review-queue endpoint (done); whether the classify-time computation needed the same treatment is not stated. Non-blocking — routed to `system-analyst` to clarify scope, not treated as a task failure since Task 4's literal wording didn't require it.

None of the above are cases of the code contradicting `design.md`'s literal text — both are gaps within/between `design.md`'s own Contract sections that need a `system-analyst` decision before being implemented as fixes.

## Review Outcome — Phase 1 Amendment

**✅ Accepted, with 2 non-blocking-to-the-round design gaps logged for `system-analyst`.** All 13 tasks in `plan.md`'s "Phase 1 amendment" section are ✅ Verified against `design.md`/`requirement.md` and remain checked off (`[x]`) — the two issues found above are gaps *in* `design.md` itself (an unanticipated interaction between two Contract sections, and an ambiguous scope boundary), not the code contradicting a clear, written rule, so no task was downgraded to ⚠️/❌ or unchecked.

This was a **FULL** round (every one of the 13 tasks inspected from scratch — first `qa-engineer` verification of this amendment). `bun run lint`/`build` both re-run independently by this agent: 341 pre-existing problems (zero in any `crm-ai` file), build exit 0 with all amendment routes/pages registered. `bun test`: 211/211 pass, but doesn't cover any file this amendment touched — stated plainly rather than implied.

**Important caveat before this ships or is relied upon**: Issue 1 above (Backfill/sweep silently overwriting human `REJECTED` menu decisions) should be resolved **before** the Backfill button is used against real data — this includes the ~70k legacy backfill run and any live use of the "sweep failed menu classifications" mechanism. Recommend `system-analyst` confirm the fix (excluding `MenuReviewStatus=REJECTED` from the query) before that happens, even though it doesn't block accepting this code-inspection round.

This amendment is still under Phase 1's existing `🔒 Security gate` (per `plan.md`'s Sequencing Notes: "Backfill amendment ยังอยู่ใต้ 🔒 Security gate เดิมของ Phase 1 ... ต้องผ่าน `security` อีกรอบก่อน deploy แม้จะ verify ผ่านแล้วก่อนหน้า") — `security` has not yet re-run against this amendment's new code (the original Phase 1 `security.md` findings predate this amendment entirely). Per the deploy-eligibility rule, this FULL round does make Phase 1 (now including the amendment) eligible for a `security` pass and, once that's done, for `devops` — but the Backfill data-integrity gap above should be resolved first regardless of the security gate, since it isn't a security finding, it's a correctness one.

**Superseded by**: the CR 2026-08-17 round (Backfill Data-Integrity & Severity Independence), which resolved both issues above via a Mode A/Mode B split and an independent `computeSeverityReviewStatus()` — see below for that round's detail, and its own new finding about `backfillRepository.overrideReviewStatuses()`.

---

# Phase 1 amendment — CR 2026-08-17 (Backfill Data-Integrity & Severity Independence) round, archived

_Archived here because the Security-fix re-verification round (2026-08-18) in `review.md` supersedes this one for the same underlying phase (Phase 1). Moved verbatim, not summarized._

## Verification Summary

**Phase 1 amendment — CR 2026-08-17 (Backfill Data-Integrity & Severity Independence), FULL round** (this CR's own `qa-engineer` acceptance round, superseding the amendment's previous FULL round above. All 5 `plan.md` boxes for this CR were already `[x]` before this round started, an irregularity per `.claude/shared/conventions.md` §4's "checkboxes belong to `qa-engineer` alone" rule — noted here, not silently accepted; every task was re-derived from `design.md`/`plan.md` and the real code, not taken on the pre-checked state's word.)

- Read `_docs/hkt/status.md` (crm-ai-support section in full), `design.md` (§ การตัดสินใจรอบ CR 2026-08-17, § Menu Classification Rules items 5/5a/5b/6/7/8, § Per-Dimension Review Rules' "ความอิสระของมิติ Severity" subsection, § Legacy Backfill Rules items 1–9 in full, plus the Data Model for `TCrmSupport`/`TCrmCaseAiAssessment`/`TCrmAiDecisionLog`/`TCrmSafetyKeyword`), `plan.md` (Plan Summary, the CR's 5-task block, Sequencing Notes, Unresolved Open Questions), `requirement.md` in full, `review.md`'s prior round in full, `.claude/shared/conventions.md` in full, `.claude/agents/backend-engineer.md`/`frontend-engineer.md` for stack conventions.
- Inspected all 5 tasks' actual code with Read/Grep, line by line against `design.md`'s rules — not file existence, not the pre-checked boxes:
  - `classification.service.ts` (rewritten: `computeSeverityReviewStatus()`, `classifyMenuBestEffort()`'s NO_MENU branch, new `classificationService.classifyMenuOnly()`)
  - `classification.repository.ts` (new `updateSupportCaseMenuOnly()`/`updateAssessmentMenuOnly()` helpers, unchanged `findMenuCatalog()`)
  - `classify-with-gemini.ts` (unchanged by this CR — read to confirm `resolveMenuResult()`'s anti-hallucination behavior still feeds `classifyMenuBestEffort()` correctly)
  - `backfill.repository.ts` (rewritten whole-file per `status.md`'s claim: `BackfillMode` type, `findModeACandidates()`/`findModeBCandidates()`/`countModeB()`, `findNextBatch()`, `countRemaining()`, `overrideReviewStatuses()`)
  - `backfill.service.ts` (rewritten: `runBatch()` branches pipeline by `item.mode`)
  - `case-review-detail-drawer.component.tsx`/`case-review-table.component.tsx`/`case-review-service.ts` (NO_MENU display)
  - `backfill/route.ts`, `cases/[id]/classify/route.ts`, `crm-ai.guard.ts`, `review-queue.service.ts`/`.repository.ts`, `use-case-review-store.ts`, `backfill-panel.component.tsx`, `case-review-overview.component.tsx` — shared-code/regression sweep, all unaffected and still correct
  - `_docs/create-spec.md` (backfill) and `_docs/classify-spec.md` — confirmed both were updated to match the new Mode A/B and NO_MENU/Severity-independence rules, per `plan.md`'s own note that they needed it
- Compared `schema.prisma` (jabjai-master-single-db) against `design.md`'s Data Model field-by-field for all 4 models this CR's code touches — `TCrmSupport`'s 3 columns (`MenuId`/`AiCategory`/`Severity`, all still nullable, no default), `TCrmCaseAiAssessment` (27/27 fields, incl. `MenuReviewStatus`/`SeverityReviewStatus` still `VarChar(20)` — confirmed no DDL was run, matching the CR's explicit "no schema change" claim), `TCrmAiDecisionLog` (11/11), `TCrmSafetyKeyword` (5/5). **No drift.**
- Ran automated checks (all independently, not taken on any report):
  - **`bun run lint`** (whole project): 341 problems (315 errors/26 warnings) — identical to the recorded baseline, **zero matches for `crm-ai` anywhere in the output** (confirmed via a separate grep pass over the full lint output).
  - **`bun run build`** (whole project): **exit 0.** All `/api/v2/support/crm-ai/*` routes (`backfill`, `cases/[id]/classify`, `decision-log`, `issues*`, `knowledge*`, `review-queue*`, `safety-keywords*`) and all 4 `/pages/support/crm-ai/*` pages appear in the build's route list.
  - **`bun test`**: 211 pass, 0 fail, 19 files — this suite does not cover any file this CR touched (only `src/helpers/overtime/`/`src/helpers/payroll/` have coverage in this repo). Stated plainly: verification of this CR's logic is code inspection against `design.md`, not test-covered.
- Both design gaps this CR set out to close are **confirmed fixed** — see Design/requirement contract checks below. One **new, narrower finding** surfaced while inspecting the rewritten `backfill.repository.ts` (`overrideReviewStatuses()` re-coupling Menu/Severity to the category's forced status for Mode A cases) — logged in Issues Found and Open Issues, not a failure of any of the 5 tasks' literal wording.

## Verified File Manifest — Phase 1 amendment CR 2026-08-17

| File | Bytes | Lines | Round |
|---|---:|---:|---|
| `src/app/api/v2/support/crm-ai/cases/[id]/classify/route.ts` (unchanged by this CR, re-inspected) | 1,694 | 41 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/cases/classification.repository.ts` (extended: `updateSupportCaseMenuOnly`/`updateAssessmentMenuOnly`) | 4,453 | 101 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/cases/classification.service.ts` (rewritten: `computeSeverityReviewStatus`, NO_MENU branch, new `classifyMenuOnly()`) | 18,817 | 331 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/cases/classify-with-gemini.ts` (unchanged by this CR, re-inspected) | 11,667 | 184 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/cases/_docs/classify-spec.md` (updated) | 8,957 | 51 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/backfill/backfill.repository.ts` (rewritten whole-file: Mode A/B split) | 5,613 | 99 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/backfill/backfill.service.ts` (rewritten: per-mode pipeline dispatch) | 3,030 | 49 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/backfill/route.ts` (unchanged by this CR, re-inspected) | 1,882 | 40 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/backfill/_docs/create-spec.md` (updated) | 7,400 | 51 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/crm-ai.guard.ts` (unchanged, shared-code watchlist) | 1,802 | 49 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.service.ts` (unchanged, shared-code watchlist — re-confirmed no regression from `SeverityReviewStatus` independence change) | 6,511 | 145 | CR-2026-08-17 |
| `src/app/api/v2/support/crm-ai/review-queue/review-queue.repository.ts` (unchanged, shared-code watchlist) | 4,388 | 101 | CR-2026-08-17 |
| `prisma/jabjai-master-single-db/schema.prisma` (`TCrmSupport`, `TCrmCaseAiAssessment`, `TCrmAiDecisionLog`, `TCrmSafetyKeyword` sections — re-confirmed byte-for-byte against `design.md`'s Data Model, no DDL run) | — | — | CR-2026-08-17 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-detail-drawer.component.tsx` (extended: NO_MENU label) | 13,988 | 331 | CR-2026-08-17 |
| `src/app/pages/support/crm-ai/review-queue/_components/case-review-table.component.tsx` (extended: NO_MENU tag in Menu column) | 6,276 | 155 | CR-2026-08-17 |
| `src/app/pages/support/crm-ai/review-queue/_api/case-review-service.ts` (extended: `CrmMenuReviewStatus` type) | 3,815 | 99 | CR-2026-08-17 |
| `src/app/pages/support/crm-ai/review-queue/_components/backfill-panel.component.tsx` (unchanged, shared-code watchlist — auto-hide-at-0 re-confirmed) | 2,748 | 65 | CR-2026-08-17 |
| `src/app/pages/support/crm-ai/review-queue/_stores/use-case-review-store.ts` (unchanged, shared-code watchlist) | 4,642 | 156 | CR-2026-08-17 |

## Per-Task Results — Phase 1 amendment CR 2026-08-17

- ✅ [backend] **Task 1 — menu-only classification path split out of `classify()`.** New `classificationService.classifyMenuOnly(crmSupportId)` in `classification.service.ts`: throws `AppError(404)` if no existing `TCrmCaseAiAssessment` (Mode B's precondition — case must have been through full classify before), calls the same `classifyMenuBestEffort()` used by every other path, writes **only** `MenuId` via the new `classificationRepository.updateSupportCaseMenuOnly()` (single-column update on `TCrmSupport`) and `MenuConfidence`/`MenuReasoning`/`MenuReviewStatus` via the new `updateAssessmentMenuOnly()` (3-column update on `TCrmCaseAiAssessment`, no `ReviewStatus`/`SeverityReviewStatus`/`SafetyOverride`/`ComputedPriorityScore`/any `*ReviewedBy`/`*ReviewedAt` field touched) — confirmed by reading both repository functions' Prisma `data` objects field-by-field. Writes a `MENU_CLASSIFICATION` decision-log row identically to the other paths. Never calls `classify()`. Matches `design.md` § Legacy Backfill Rules item 6 (Mode B) exactly.
- ✅ [backend] **Task 2 — `MenuReviewStatus = 'NO_MENU'` for a successful-but-empty menu result.** `classifyMenuBestEffort()`'s single computation point: `menuReviewStatus = result.menuId !== null ? (confidence-based NEEDS_HUMAN/PENDING_REVIEW) : "NO_MENU"` — covers both "AI said `menuId: null`" and "AI answered an id not in the catalog, rejected by `resolveMenuResult()`'s anti-hallucination check" (both leave `result.menuId === null` after resolution). `NULL` is only ever returned via the `catch` block (Gemini call itself failed) — confirmed structurally, this is the only path that returns `EMPTY_MENU_OUTCOME`. `MenuReasoning` is written even in the `NO_MENU` case (from `result.menuReasoning`, not discarded); `MenuConfidence` stays whatever Gemini returned (can be `null`) — matches design.md § Menu Classification Rules 5a/5b. Applied uniformly: `classify()`'s normal path, `classify()`'s Safety Override path, and `classifyMenuOnly()` (Mode B) all call the same `classifyMenuBestEffort()` — confirmed one computation point, not three.
- ✅ [backend] **Task 3 — Mode A/Mode B split in `backfill.repository.ts`/`backfill.service.ts`.** `backfillRepository.findModeACandidates()` = `AiCategory: null` (Prisma, ordered `CrmSupportId asc`); `findModeBCandidates()` = `$queryRaw` `INNER JOIN` between `TCrmSupport`/`TCrmCaseAiAssessment` on the exact 4-condition WHERE design.md specifies (`AiCategory IS NOT NULL AND MenuId IS NULL AND MenuReviewStatus IS NULL AND MenuReviewedAt IS NULL`) — no `notIn`/`IN` with unbounded ids, matching the explicit prohibition. `findNextBatch()` fills Mode A first, tops up the remainder with Mode B. `countRemaining()` sums `tCrmSupport.count({AiCategory: null})` (Mode A) + a separate `$queryRaw COUNT(*)` using the identical Mode B WHERE (`countModeB()`) — confirmed both counts use the same predicates as the selection queries, no looser condition. `backfill.service.ts`'s `runBatch()` branches on `item.mode`: `"FULL_CLASSIFY"` → `classificationService.classify()` (+ `overrideReviewStatuses()`, see Issues Found below), `"MENU_ONLY"` → `classificationService.classifyMenuOnly()` only — confirmed `classify()` is never reachable for a Mode B item. Verified the exclusion actually works: a case with `MenuReviewStatus="REJECTED"` (human decision) has `MenuReviewStatus IS NOT NULL`, so Mode B's WHERE excludes it — **this closes the previously-open "Backfill silently overwrites human REJECTED menu decisions" issue**, confirmed by re-deriving the truth table, not just reading the comment.
- ✅ [backend] **Task 4 — `SeverityReviewStatus` independent at classify-time.** `computeSeverityReviewStatus(severity, severityConfidence, safetyOverride)` in `classification.service.ts`: `!severity → null`; `safetyOverride → "NEEDS_HUMAN"` unconditionally (before checking confidence at all); otherwise `severityConfidence === null || severityConfidence >= CRM_AI_CONFIDENCE_THRESHOLD → "PENDING_REVIEW"`, else `"NEEDS_HUMAN"` — matches design.md's 3-branch spec exactly (0.6 confirmed in `crm-sla-rule.constant.ts`). `classify()` calls this instead of the old `severity ? reviewStatus : null` borrow from the category dimension — confirmed the old borrowing line is gone, replaced at the call site. Does **not** regress `review-queue.service.ts`'s human-review path (unchanged, still writes `SeverityReviewStatus` from the human's own decision independently — re-inspected, no coupling there either). **Related finding, not a failure of this task**: `backfill.repository.ts`'s `overrideReviewStatuses()` re-couples `SeverityReviewStatus` (and `MenuReviewStatus`) to the category dimension's forced status for Mode A backfilled cases — see Issues Found.
- ✅ [frontend] **Task 5 — NO_MENU display.** `case-review-service.ts`'s `CrmMenuReviewStatus = CrmAiReviewStatus | "NO_MENU"` type threaded through `CrmCaseAssessment.MenuReviewStatus`. `case-review-table.component.tsx`'s "เมนู" column: `MenuId !== null → "#{id}"`; else `MenuReviewStatus === "NO_MENU" → <Tag color="default">ไม่มีเมนูที่เกี่ยวข้อง</Tag>` with a tooltip explaining "AI จำแนกแล้วและสรุปว่าไม่มีเมนูที่เกี่ยวข้อง"; else `"รอจำแนก"` (distinct wording, confirmed NULL and NO_MENU never render the same string). `case-review-detail-drawer.component.tsx`: `REVIEW_STATUS_LABEL`/`REVIEW_STATUS_COLOR` maps include `NO_MENU` alongside the other statuses; the menu `DimensionReviewBlock`'s `noValueLabel` prop is conditional — `"AI ระบุว่าไม่เกี่ยวกับเมนูใด"` when `MenuReviewStatus === "NO_MENU"`, `"ยังไม่จำแนก"` otherwise; the 3-way ใช้/ใช้แต่แก้ไข/ไม่ใช้ buttons remain fully usable on a `NO_MENU` case (no special-casing that would block review) — matches design.md § Amendment 2026-08-17 item 5 exactly.

None of the 5 tasks required a schema change, confirmed against `schema.prisma` directly (§7 contract check) — `MenuReviewStatus`/`SeverityReviewStatus` stayed `VarChar(20)`, no migration/DDL evidence in the repository.

## Design/requirement contract checks — Phase 1 amendment CR 2026-08-17

- Schema field-by-field for all 4 models this CR's code touches: **no drift**, no DDL — see Verification Summary above.
- **Legacy Backfill Rules item 6 (Mode A/Mode B split, replacing old item 4)**: **matches exactly** — see Task 1/3 in Per-Task Results. The specific "REJECTED menu decision silently overwritten" scenario the previous round flagged is now provably excluded by Mode B's `MenuReviewStatus IS NULL AND MenuReviewedAt IS NULL` condition.
- **Legacy Backfill Rules item 7 (`{Dimension}ReviewedAt` is the untouchable boundary for every mode)**: **matches** — Mode B's query checks `MenuReviewedAt IS NULL` directly; Mode A can't violate this because `AiCategory IS NULL` means no assessment (and thus no `MenuReviewedAt`) could have existed before this classify pass.
- **Legacy Backfill Rules item 8 (`remaining` counts Mode A + Mode B with the same predicates as selection)**: **matches** — `countRemaining()` = `tCrmSupport.count({AiCategory:null})` + `countModeB()`, both provably the same WHERE as `findModeACandidates()`/`findModeBCandidates()`.
- **Menu Classification Rules items 5a/5b (`NO_MENU` value + its meaning table)**: **matches** — see Task 2 in Per-Task Results.
- **Per-Dimension Review Rules' 2026-08-17 subsection (`SeverityReviewStatus` independent at classify-time, Safety Override forces `NEEDS_HUMAN`)**: **matches** at the `classify()` call site — see Task 4. **New finding, not covered by this section's literal text**: `design.md`'s Legacy Backfill Rules item 2 (unrevised by this CR) is ambiguous about whether its "ตั้ง `ReviewStatus` = CONFIRMED/NEEDS_HUMAN" override is scoped to the category `ReviewStatus` column alone or extends to `MenuReviewStatus`/`SeverityReviewStatus` too — the current code (`overrideReviewStatuses()`) takes the broader reading, in tension with the independence principle this same CR just established for Severity. See Issues Found.

Both design gaps this CR was written to close (Backfill/sweep overwriting human REJECTED decisions; Severity not independent at classify-time) are **confirmed resolved** by the code as written — see the Task 3 and Task 4 rows above.

## Issues Found — Phase 1 amendment CR 2026-08-17

1. **`backfillRepository.overrideReviewStatuses()` (Mode A only) re-couples `MenuReviewStatus`/`SeverityReviewStatus` to the category dimension's forced status**, discarding the independently-computed value `classifyMenuBestEffort()`/`computeSeverityReviewStatus()` just wrote in the same `runBatch()` iteration. Concretely: for a closed legacy case, `classify()` correctly computes e.g. `SeverityReviewStatus="NEEDS_HUMAN"` because `severityConfidence=0.4` (below threshold) — then `overrideReviewStatuses(id, "CONFIRMED")` immediately overwrites it to `"CONFIRMED"` because `support.Severity` has a value, discarding the low-confidence signal entirely. The same happens to `MenuReviewStatus` whenever `MenuId` is non-null. For open legacy cases the override goes the other way (forces `NEEDS_HUMAN` on both dimensions regardless of confidence) — safety-conservative, so less concerning, but still not confidence-based. This is the same category of problem Task 4 fixed in `classify()` itself, just resurfacing one layer up in the Backfill pipeline that calls `classify()` and then immediately overrides its output. **Not a failure of Task 4's literal wording** (which only asked about `classification.service.ts`'s own computation, which is correct) — but it undercuts the same design principle for the ~68.9k closed + ~1.1k open legacy cases Backfill will process. `design.md`'s Legacy Backfill Rules item 2 (written 2026-08-16, never revised by this CR) says generically "ตั้ง `ReviewStatus` = CONFIRMED/NEEDS_HUMAN" without stating whether this is scoped to the category column alone. The engineer's own `_docs/create-spec.md` documents the current (broader) behavior explicitly, so this is a documented interpretation, not an oversight — but it's one `system-analyst` should confirm or correct given it directly follows from this CR's own reasoning. **Recommend resolving before the Backfill button is run against real data** (the ~70k legacy run), though it doesn't block accepting this round's 5 tasks since none of their literal text covers this function.

Both design gaps this CR was written to close (Backfill/sweep overwriting human `REJECTED` decisions; Severity not independent at classify-time) are **confirmed resolved** — full detail of the prior round that found them is archived above.

## Review Outcome — Phase 1 amendment CR 2026-08-17

**✅ All 5 tasks Verified.** Both design gaps this CR set out to close (Backfill/sweep overwriting human `REJECTED` menu decisions; `SeverityReviewStatus` not independent at classify-time) are confirmed fixed by inspection — Mode B's exclusion condition was re-derived via truth table rather than trusting the description. All 5 `plan.md` checkboxes for this CR remain `[x]` — they were already checked before this round started (an irregularity per `.claude/shared/conventions.md` §4, noted in the Verification Summary above), but each was independently re-derived from the real code against `design.md`, so the checked state is now genuinely earned.

One **new, narrower finding** surfaced (Issues Found item 1 above) while inspecting the rewritten `backfill.repository.ts`: `overrideReviewStatuses()` re-couples Menu/Severity review status to the category dimension for Mode A backfilled cases, in tension with the independence principle this CR established. This doesn't downgrade any of the 5 tasks (none of their literal wording covers this function), but is logged in Open Issues and recommended for resolution before the ~70k real Backfill run, for the same reason as the previous round's now-resolved issue.

This was a **FULL** round on this CR's 5-task block, plus a regression sweep of the shared-code watchlist and files this CR's changes touch transitively (`review-queue.service.ts`/`.repository.ts`, `crm-ai.guard.ts`, `backfill-panel.component.tsx`, `use-case-review-store.ts`, `cases/[id]/classify/route.ts`, `classify-with-gemini.ts`) — none regressed. `bun run lint`/`build` both re-run independently: 341 pre-existing problems (zero in any `crm-ai` file), build exit 0 with every `crm-ai` route/page registered. `bun test`: 211/211 pass, doesn't cover any file this CR touched — stated plainly rather than implied.

This CR is still under Phase 1's existing `🔒 Security gate` (per `plan.md`'s Sequencing Notes) — `security` has not yet run against this CR's code (the original `security.md` findings predate both this CR and the earlier 13-task amendment entirely). Per the deploy-eligibility rule, this FULL round makes Phase 1 (now including both the 13-task amendment and this 5-task CR) eligible for a `security` pass and, once that's done, for `devops`. The Backfill data-integrity gap this CR was meant to close is resolved — the new `overrideReviewStatuses()` finding is a correctness question, not a security one, and doesn't block the `security` handoff, but should ideally be resolved before the real ~70k Backfill run regardless.

**Superseded by**: the Security-fix re-verification round (2026-08-18), which confirmed `security` Round 2's 3 findings (severity whitelist, confidence fail-open, backfill lock) are all fixed correctly, but found `overrideReviewStatuses()` above is still unresolved and now has a fully-confirmed `design.md` answer (§ Legacy Backfill Rules 2b, 2026-08-18) that the code doesn't yet implement — see current `review.md` for that round's detail.
