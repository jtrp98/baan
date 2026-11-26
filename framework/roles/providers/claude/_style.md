<provider_style provider="claude">
<native_harness>
- Work natively in Claude Code's harness: enter plan mode (`/plan`) before non-trivial edits and leave it only through ExitPlanMode with an approved plan; batch open business/schema/security/UX questions into one `AskUserQuestion` call instead of guessing.
- Delegate with `Agent` (`Task`). Subagents may nest when `Agent` is in their tools, so keep each brief self-contained (goal, exact paths, expected answer shape) and dispatch independent subagents in one message so they run in parallel.
- Skills listed in this agent's `skills:` frontmatter (if any) are preloaded in full — follow them directly instead of re-deriving the procedure; invoke any other skill with `Skill` only when its moment arrives.
</native_harness>

<helper_agents>
- `scout` (haiku, read-only): every exploration, file lookup, and pattern scan. Prefer it over the built-in `Explore`, which runs on opus under subscription plans and burns quota. Ask for answers as `file:line`.
- `scribe` (haiku): long-form docs written inside the knowledge root under an already-approved outline — never `target/*`.
- `auditor` (opus, read-only + test commands): independent review. Pass only AC, contracts, diff, and file paths, never the implementer's narrative, so it does not inherit your assumptions.
</helper_agents>

<skills>
- The 9 skills in `.claude/skills/`:
  - Claude-native: `repo-map`, `coding-pattern`, `ui-design-system`, `api-db-contract`, `knowledge-handoff`. `repo-map` covers project surveying and `ui-design-system` covers web design rules.
  - Shared with Codex and `baan flow` (same files, so there is no Claude-only copy to drift): `bug-fix`, `feature-flow`, `req-grill`, `wave-plan`.
- Planning, review, and done-checks use Claude Code built-ins paired with `auditor`, so there is one procedure per job: plan in plan mode (`/plan`) and pass the Decision Quality Gate in `LEARNING.md` before ExitPlanMode; review with `/code-review` plus an independent `auditor` pass for risky changes; before reporting done, run `/verify` plus the real test commands.
- The skills read and write Neutral Knowledge (`<project>/repo-map.md`, `<project>/coding-pattern.md`, `<project>/ui-design-system.md`, `<project>/decisions/`, `<project>/defects/`, `<project>/features/`) so Codex and Antigravity sessions can pick up the same work without translation.
</skills>

<rules>
- Keep 1 writer per repository; helpers and parallel subagents only read unless the plan assigns them a disjoint write scope.
- Pick the model by difficulty: sonnet for day-to-day work, opus only for hard architecture, security, DB, or audit calls, haiku for `scout`/`scribe` volume work.
- Explain the "why" behind each design or constraint in explicit sections; rely on real executed test/command evidence before reporting completion instead of looping on self-verification.
</rules>
</provider_style>
