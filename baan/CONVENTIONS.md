# CONVENTIONS — binding rules every role must follow

> The system attaches this file to every role automatically (paired with the role's own file) — it is part of the contract.

## 1. Read index-first

Read the index of the category you're pointed to first (`requirement\index.md`, `design\index.md`, `plan\index.md` etc.), then open **only the files the brief/task names by exact path** — no `ls` hunting, no reading across categories · grep within permitted files · **status lives in the index only**.

**An index is current state only**: when something changes, overwrite the cell/sentence in place so the index states today's truth — no `## Change Log` in index files, and no "Precedence/Amendment" paragraphs stacked above older text to override it (a reader must never have to work out which paragraph wins). The history of an index is `git log`.

**A knowledge index follows §3 like every knowledge file**: what is done, what waits on whom, which risks are open — no run shorthand such as `Localoverlay63pass26fail1skip`. Run detail (queue, per-slice PASS/FAIL, rework rounds) belongs in the memory `status.md`.

**Two stores, same module folders**: *knowledge* holds what other people need to know or decide from today (requirements/decisions, design/contracts/DBML/SQL, signed uxui, test plans, open questions, backlog, security findings, `plan\index.md`); *memory* (the workspace's `memory_root`, when configured) holds what the AI team needs to continue and the evidence that work was done or checked (task sheets, gm's per-task cards, queues, plan JSON, check rounds, evidence/validation files, `status.md`). Test before writing any file: does someone who doesn't run BAAN need it? No = memory. Knowledge cites memory as **text, not links** (`check-092 PASS 2026-10-29 (memory)`) because people who clone knowledge don't have memory. No `memory_root` configured = everything stays in knowledge as before.

When a named data model/index splits a contract across linked dictionaries or appendices, following those exact links for the assigned scope is allowed. This does not authorize directory hunting or unrelated categories.

## 2. Write only what you own

Each role writes only the files/folders it owns (the table in the role file) — **engineers write only in code roots and never write anywhere under `knowledge\` or `memory\`** · if you think you must edit someone else's file = stop and route it back, don't edit it yourself · the module's `changelog\` is shared: whoever writes a knowledge file appends its own line there (§3) and never edits other lines.

## 3. Knowledge files: today's truth, written for a developer

The reader of every knowledge file is **a developer on the team who never ran BAAN**. They must understand a file in one read, without opening other files to decode it.

**Writing**
- Lead with what the thing is and what is decided now; details after. Full sentences.
- Every ID carries its meaning the first time it appears in a file — `มติ 051 (บันทึก Project + Revision เป็นหน่วยเดียว)`, never a bare `[051]` or `ตาม 046`; link it when the target is in knowledge.
- Explain each abbreviation at first use. No single-letter names (`G`, `B`) and no BAAN run vocabulary (wave, slice, rework round, oracle, `F2`/`S1`, check-round ids) — run detail belongs in memory.
- No process notes the reader doesn't need (why numbering starts at 009, "this is not an approval" disclaimers) unless they change what the reader may rely on.
- Evidence (`path:line`, run folders, memory citations) goes in a closing `## หลักฐาน` section, not inside the sentences; unconfirmed claims are handled per §5.

**Changing**
- An edit leaves the whole file stating today's truth: rewrite or delete superseded text where it stands. **Never append "Override RevN", "Amendment" or "Precedence" sections** — a reader must never work out which paragraph wins. `Edit` the parts that change; rewrite a whole file only when the task is to restructure it, and then drop nothing silently.
- One header line under the title, overwritten on every change: `> Rev 12 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 051 — บันทึก Project + Revision เป็นหน่วยเดียว)`. Bump the Rev when the contract's meaning changes (check pins revisions), not for wording fixes; index files carry no Rev.
- **History lives in the module's `changelog\YYYY-MM.md`** (one file per month, append-only), one line per change: `YYYY-MM-DD · <file> · Rev N · แก้โดย <role> · ขอโดย <who> · <what changed, one sentence>`. Knowledge files get **no `## Change Log` section**; an old one stays until the file is restructured, but never gets new lines. Read the changelog only when the task is about history. Memory files keep no change log at all — git holds their history.
- **Decisions**: each keeps its own record `requirement\decisions-NNN.md`; `requirement\decisions.md` lists the decisions in force today, grouped by topic, one line each (meaning + link). A replaced decision = update its line there and state in the old record which decision replaced it.
- **Never copy a file into `archive\`, `archive.md` or a "before-xxx" snapshot before editing** — the previous version is a git commit; cite it when a reader needs it (snapshot only when the knowledge root has no git repository) · append-only files (backlog, security findings, changelog) never have old rows edited · **IDs are never renumbered** (REQ-NNN, AC-NNN, DES-NNN, OQ-NNN, BL-NNN, TP-NNN, UX-NNN).

## 4. Dates come from the user

If the prompt has a **"วันที่ของงาน" (date of work)** heading, use that date for every dated entry (the controller already specified it — don't ask again) · if absent, ask the user once per session; format `YYYY-MM-DD` — **never guess a date, never copy one from another row**.

## 5. Facts and assumptions stay separated

A number/fact with no source gets tagged `(สมมติฐาน — ยังไม่ยืนยัน)` until a human confirms — in knowledge, also list it with what would confirm it under a closing `## ยังไม่ยืนยัน` section · **the real thing beats memory** — if your recollection contradicts a file/the actual code, the file wins, and always verify the as-built code before citing it.

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

**Every answer and every document you produce is in Thai.** Technical terms, code, commands, and IDs stay in English — use the English term whenever a Thai rendering would be less clear to a developer; never force a translation · unless the target project's own convention says otherwise.

## 12. Readable data documentation

When data/schema documentation is in scope, a list of table names, field names/types, or shorthand alone is not a complete handoff. `arch` owns the readable canonical model: table purpose/row meaning, field meaning and rules, nested JSON/enums, and legacy table/field mappings with evidence. `vault` reconciles physical SQL and supplies deltas; `inspect`/`check` verify the scoped contract. Split large documents with exact linked paths and keep unknowns explicit. Clarifying wording does not itself require schema approval, new ACs, or database execution.
Relational data-model work also includes a full, readable DBML artifact kept in sync by `arch`; add a focused legacy integration view when needed. `vault` reviews SQL parity, and `inspect`/`check` verify scoped coverage, parser evidence and physical/logical relationship distinctions. Link the artifacts and guide from the model/index. Diagram annotations and colors do not change schema approval or authorize database execution.
