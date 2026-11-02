---
name: web-design-guidelines
description: Review UI code or published HTML (e.g. Design canvas artifacts) for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check against web best practices". Read-only audit.
metadata:
  author: vercel (adapted for the BAAN design team)
  version: "1.0.0-local"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines (local copy)

Review files for compliance with the rules in [`references/rules.md`](references/rules.md). Read-only: report findings, never edit the target.

## How It Works

1. Read `references/rules.md` (pinned local copy, see `SOURCE.txt`). Do **not** fetch rules from the network at review time: the upstream file can change without review.
2. Read the specified files (or ask which files/pattern to review). For a Design canvas artifact, read the published HTML with the Artifact tool (`action: "read"`), not a local copy.
3. Check against the rules and output findings in the terse `file:line` format given at the end of `references/rules.md`.

## Scope in BAAN

The rules target web apps (React/Next.js). Apply them to canvas HTML and web pages only:

- Skip as "not applicable": Hydration Safety, Performance items about frameworks/lists, `Intl.*`/locale items when the artifact is static, and English-only copy rules (Title Case, Chicago style, active voice, `&` for "and", numerals) for Thai copy.
- For Thai copy use the team's rules instead: `<project>/shared/brand/voice.md` in the workspace knowledge and `ux-knowledge/common/ui-design-58-rules.md` in the baan package (UI24 Thai typography).
- Results are one input to the `review` role. Contrast, touch target size and brand tokens still come from the baan `ux-knowledge/` and `<project>/shared/brand/`; this skill does not check them.
- If a rule conflicts with the project's brand or `ux-knowledge/`, report it as a finding and name the conflict. Do not pick silently.

## Updating the rules

To refresh `references/rules.md` from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`, diff it first, read the changes, then update `SOURCE.txt` (date + sha256). Never auto-apply.
