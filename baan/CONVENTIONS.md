# CONVENTIONS — binding rules every role must follow

> The system attaches this file to every role automatically (paired with the role's own file) — it is part of the contract.

## 1. Read index-first

Read the index of the category you're pointed to first (`requirement\index.md`, `design\index.md`, `plan\index.md` etc.), then open **only the files the brief/task names by exact path** — no `ls` hunting, no reading across categories · grep within permitted files · **status lives in the index only**.

**An index is current state only**: when something changes, overwrite the cell/sentence in place so the index states today's truth — no `## Change Log` in index files, and no "Precedence/Amendment" paragraphs stacked above older text to override it (a reader must never have to work out which paragraph wins). The history of an index is `git log`.

**A knowledge index is written for people who never ran BAAN**: full sentences (what is done, what waits on whom, which risks are open) — no run shorthand such as `Localoverlay63pass26fail1skip`. Run detail (queue, per-slice PASS/FAIL, rework rounds) belongs in the memory `status.md`.

**Two stores, same module folders**: *knowledge* holds what other people need to know or decide from today (requirements/decisions, design/contracts/DBML/SQL, signed uxui, test plans, open questions, backlog, security findings, `plan\index.md`); *memory* (the workspace's `memory_root`, when configured) holds what the AI team needs to continue and the evidence that work was done or checked (task sheets, gm's per-task cards, queues, plan JSON, check rounds, evidence/validation files, `status.md`). Test before writing any file: does someone who doesn't run BAAN need it? No = memory. Knowledge cites memory as **text, not links** (`check-092 PASS 2026-10-29 (memory)`) because people who clone knowledge don't have memory. No `memory_root` configured = everything stays in knowledge as before.

When a named data model/index splits a contract across linked dictionaries or appendices, following those exact links for the assigned scope is allowed. This does not authorize directory hunting or unrelated categories.

## 2. Write only what you own

Each role writes only the files/folders it owns (the table in the role file) — **engineers write only in code roots and never write anywhere under `knowledge\` or `memory\`** · if you think you must edit someone else's file = stop and route it back, don't edit it yourself.

## 3. Amend, don't regenerate

An existing file = edit only the changed spots (`Edit`), never `Write` over the whole file · add a dated `## Change Log` line every time (except index files — §1) · **never copy a file into `archive\`, `archive.md` or a "before-xxx" snapshot before editing** — knowledge is a git repository, so the previous version is a commit; cite it when a reader needs it (snapshot only when the knowledge root has no git repository) · append-only files (backlog, security findings) never have old rows edited · **IDs are never renumbered** (REQ-NNN, AC-NNN, DES-NNN, OQ-NNN, BL-NNN, TP-NNN, UX-NNN).

## 4. Dates come from the user

If the prompt has a **"วันที่ของงาน" (date of work)** heading, use that date for every dated entry (the controller already specified it — don't ask again) · if absent, ask the user once per session; format `YYYY-MM-DD` — **never guess a date, never copy one from another row**.

## 5. Facts and assumptions stay separated

A number/fact with no source gets tagged `(สมมติฐาน — ยังไม่ยืนยัน)` until a human confirms · **the real thing beats memory** — if your recollection contradicts a file/the actual code, the file wins, and always verify the as-built code before citing it.

## 6. Git boundaries and knowledge commits

Source/target repositories: `status/log/diff/show` are readable; state-changing git belongs to the user unless explicitly authorized.

**Configured knowledge exception:** the built-in `commitKnowledge` workflow and `baan --commit --config <workspace-config>` may stage/commit document changes only inside configured `knowledge_roots` (and their configured `memory_root`) that have their own Git repository. This exception is part of the requested knowledge auto-commit workflow; it does not authorize source/target commits, push, branch changes, history rewriting, or arbitrary git operations. Keep the existing per-module grouping and report failures.

**Raw run output stays in the runner's `reports\`** — answer files, response/patch JSON, stdout/stderr and test result files (e.g. `.trx`) are never copied into knowledge or memory; they hold the distilled result (the document change itself, a test summary with command + pass/fail counts) plus the run folder name as the evidence pointer.

The controller must run the final knowledge commit **after saving all role outputs and its own knowledge edits**, including workflows where it writes the documents after a read-only role exits. A role-run completion hook cannot commit files that have not been written yet. Do not clear/replace `knowledge_roots` to bypass this workflow.

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
A gate blocks only the work that genuinely needs its answer: work that can run against a stub/fake/adapter proceeds, and the gate attaches to the task that connects the real thing (real DB, external system, hardware, signed UX in the shipped screen).

## 10. Finish rules

**Done = released** (not verified) · release scope frozen — new items go to backlog, not the plan, unless the user moves them · non-blocking findings = backlog, never self-opened tasks · **at most 2 rework rounds per task, then a human decides immediately** (accept / re-scope / drop) — the controller stops opening new work and asks now, never parks it until "the end of the round" · work waiting on a human answer is reported immediately — never queue work behind an open question · documents over budget (~4–10 KB per file by type) = split into linked parts, not write longer, never archive to shrink.
**The finish line is frozen per task**: a check/audit judges against the AC ids, test-plan cases and design/contract revisions named when the task (or slice) started; a rule added later — even one prompted by that task's own findings — applies to the next task, not this verdict.
Plan Status values: `pending` · `done-local` (code done and its automated tests pass locally, not yet connected to gated real systems — the controller sets it after re-running the tests) · `verified` / `blocked` (only from check's verdict) · `done-local` never closes a gate · a task built slice by slice records `slices` (id + exact `ac_ids` + status) and is `verified` only when verified slices cover all its ACs.

## 11. Language

**Every answer and every document you produce is in Thai.** Technical terms, code, commands, and IDs stay in English — unless the target project's own convention says otherwise.

## 12. Readable data documentation

When data/schema documentation is in scope, a list of table names, field names/types, or shorthand alone is not a complete handoff. `arch` owns the readable canonical model: table purpose/row meaning, field meaning and rules, nested JSON/enums, and legacy table/field mappings with evidence. `vault` reconciles physical SQL and supplies deltas; `inspect`/`check` verify the scoped contract. Split large documents with exact linked paths and keep unknowns explicit. Clarifying wording does not itself require schema approval, new ACs, or database execution.
Relational data-model work also includes a full, readable DBML artifact kept in sync by `arch`; add a focused legacy integration view when needed. `vault` reviews SQL parity, and `inspect`/`check` verify scoped coverage, parser evidence and physical/logical relationship distinctions. Link the artifacts and guide from the model/index. Diagram annotations and colors do not change schema approval or authorize database execution.


## Change Log

- 2026-11-02 — Split memory (task sheets, cards, queues, plan JSON, check rounds, evidence, run status) from knowledge (contracts + human-readable state) via `memory_root`; knowledge cites memory as text; knowledge indexes are written for people.

- 2026-10-28 — Rework cap reached = ask the human immediately (no end-of-round parking); finish line frozen per task; slice-level statuses with exact AC coverage.

- 2026-10-26 — Indexes are current state only (no Change Log, no Precedence layers); no archive/snapshot copies (git holds history); raw run output stays in `reports\`.

- 2026-10-26 — Gates block only work that needs their answer (stub/fake work proceeds); add the `done-local` plan status.

- 2026-10-23 — Require scoped DBML deliverables, readable Notes, physical/logical separation, and parser/parity verification.

- 2026-10-23 — Permit configured knowledge commits and require the controller to commit after its final document writes.

- 2026-10-23 — Clarify readable data-model documentation, linked dictionaries, legacy mappings, and scoped verification duties.
