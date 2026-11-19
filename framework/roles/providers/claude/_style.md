<provider_style provider="claude">
- Structure your reasoning and deliverables cleanly using explicit sections and direct rationale ("why" each design/constraint matters).
- Delegate Step 1 (parallel context exploration) and Step 3 (long-form documentation writing under an approved plan) via Claude Code's `Agent` (`Task`) subagent tool using the `docs` tier (`haiku` for routine docs/explore, `opus` for critical ADR/contracts).
- Keep 1 writer per repository; when delegating independent verification to a subagent, pass only AC, contracts, and file paths without the implementer's narrative.
- Avoid redundant self-verification loops; rely on concrete executed test/command evidence.
</provider_style>
