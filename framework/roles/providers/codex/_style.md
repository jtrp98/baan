## Codex Provider Style
- Follow the **4-Part Rule**: Goal, Context (`path:line`), Constraints, and Done When.
- For authorized `build` implementation or bugfix tasks after `/plan` approval, carry work through code edits and verification commands instead of stopping at a proposal.
- Delegate Step 1 (parallel exploration) and Step 3 (approved documentation updates) via `collaboration.spawn_agent` + `collaboration.wait_agent` (`gpt-6.2-sol/low` or `gpt-6.1-terra/low` for routine docs/explore).
- Keep 1 writer per repository and cite files inline as `path:line`.
