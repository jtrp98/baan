# CONVENTIONS — binding rules every role must follow

> The system attaches this file to every role automatically (paired with the role's own file) — it is part of the contract.

## 1. Read index-first

Read the index of the category you're pointed to first (`requirement\index.md`, `design\index.md`, `plan\index.md` etc.), then open **only the files the brief/task names by exact path** — no `ls` hunting, no reading across categories · grep within permitted files · **status lives in the index only**.

## 2. Write only what you own

Each role writes only the files/folders it owns (the table in the role file) — **engineers write only in code roots and never write anywhere under `knowledge\`** · if you think you must edit someone else's file = stop and route it back, don't edit it yourself.

## 3. Amend, don't regenerate

An existing file = edit only the changed spots (`Edit`), never `Write` over the whole file · add a dated `## Change Log` line every time · append-only files (backlog, security findings) never have old rows edited · **IDs are never renumbered** (REQ-NNN, AC-NNN, DES-NNN, OQ-NNN, BL-NNN, TP-NNN, UX-NNN).

## 4. Dates come from the user

If the prompt has a **"วันที่ของงาน" (date of work)** heading, use that date for every dated entry (the controller already specified it — don't ask again) · if absent, ask the user once per session; format `YYYY-MM-DD` — **never guess a date, never copy one from another row**.

## 5. Facts and assumptions stay separated

A number/fact with no source gets tagged `(สมมติฐาน — ยังไม่ยืนยัน)` until a human confirms · **the real thing beats memory** — if your recollection contradicts a file/the actual code, the file wins, and always verify the as-built code before citing it.

## 6. No state-changing git

`status/log/diff/show` are readable — `commit/push/branch/merge/rebase/reset` always belong to the user.

## 7. Never chain roles yourself

End with a **short handoff**: the result (lead with it) → evidence (files/lines changed or read) → blockers → which role should receive it next — then stop · never assume your output was accepted.

## 8. Output state — end the handoff with exactly one status

`DONE` · `PASS` · `FAIL` · `BLOCKED` · `NEEDS_DESIGN_CHANGE` · `NEEDS_REQUIREMENT_CHANGE` · `NEEDS_HUMAN`
- engineers use: DONE / BLOCKED / NEEDS_DESIGN_CHANGE / NEEDS_REQUIREMENT_CHANGE / NEEDS_HUMAN
- check uses: PASS / FAIL (per task) in its own round file
- blocker formats: `NEEDS_DESIGN_CHANGE` (cite DES-id) / `NEEDS_REQUIREMENT_CHANGE` (cite REQ/AC-id) / `NEEDS_HUMAN` (a direct question) — every one states **Task / Reference / Reason**
- If part of the work is blocked, finish the unblocked parts and report exactly where you stopped
- **Cannot do it because of the environment** (no permission to run a command/write a file · tooling or sandbox broken · a required file unreadable) = `BLOCKED`, stating what's missing and the command/file that failed — **`DONE` only when the assigned work is genuinely complete**; never end `DONE` merely because you reported you couldn't do it.

## 9. Human gates (7 points — stop and ask in both modes)

1. A major business choice or missing owner confirmation · 2. schema/migration/breaking contract · 3. UX sign-off before FE work depending on it · 4. QA: Critical, or the same task failing its 3rd round · 5. Security: every Critical/Important item (fix, or accept the risk in writing) · 6. real deploy/migration on a shared environment · 7. cutting release scope.
Approval/signing is a human act — an agent only records it (who/when) as the user stated, never writes it on their behalf.

## 10. Finish rules

**Done = released** (not verified) · release scope frozen — new items go to backlog, not the plan, unless the user moves them · non-blocking findings = backlog, never self-opened tasks · **at most 2 rework rounds per task, then a human decides** (accept / re-scope / drop) · work waiting on a human answer is reported immediately — never queue work behind an open question · documents over budget (~4–10 KB per file by type) = archive/split, not write longer.

## 11. Language

**Every answer and every document you produce is in Thai.** Technical terms, code, commands, and IDs stay in English — unless the target project's own convention says otherwise.
