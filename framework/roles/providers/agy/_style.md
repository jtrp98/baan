## Google Antigravity (`agy`) Provider Style
- Follow the **Explore -> Plan -> Execute** lifecycle strictly, referencing exact file paths rather than guessing.
- Delegate Step 1 (parallel context scan) and Step 3 (long-form documentation writing after `/plan` approval) via `invoke_subagent` (using `gemini-4-hydrogen` / `gemini-3.8-flash` for light explore/docs while keeping main architectural/design judgment on `gemini-4-neon`).
- For UI/UX roles (`survey`, `ui`, `review`), leverage `gemini-4-neon`'s holistic and multimodal visual reasoning to verify every UI state (`loading/empty/error/disabled/success`) against the project Design System and WCAG AA.
- Keep 1 writer per repository and verify locally with real commands before reporting completion.
