// การประกอบ prompt: ไฟล์ role + CONVENTIONS.md (สัญญากลาง) + บริบทโปรเจกต์ + คำสั่งงาน
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROLES_DIR, TEAM_DIR, listRoles, resolveRoleName, tierMatrixText } from "./config.mjs";
import { FIXED_ROLE_TIER, IMPLEMENT_TIER_RANGE } from "./plan.mjs";
import { roleSessionHeader } from "./role-guard.mjs";

// CONVENTIONS.md เป็นสัญญาบังคับของทุก role — อ่านไม่ได้ให้หยุด ไม่ข้ามเงียบๆ
// (มิฉะนั้น package ที่ติดตั้งแล้วขาดไฟล์นี้จะทำงานโดยไร้กติกากลางโดยไม่มีใครรู้)
export function readConventions() {
  const file = path.join(TEAM_DIR, "CONVENTIONS.md");
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    console.error(`อ่าน CONVENTIONS.md ไม่ได้ (${file}) — ไฟล์นี้เป็นสัญญาบังคับของทุก role ระบบจึงหยุด (ติดตั้ง package ให้ครบ หรือรันจากตำแหน่งที่มีไฟล์นี้)`);
    process.exit(2);
  }
}

// role รันแบบ non-interactive จึงถามวันที่จากผู้ใช้ตาม CONVENTIONS §4 ไม่ได้ —
// ไม่ใส่วันที่ใน prompt = role ต้องหยุดด้วย NEEDS_HUMAN หรือเดาวันที่ลง changelog เอง
// ค่าเริ่มต้นคือวันที่ตามนาฬิกาเครื่องแบบ local (ไม่ใช่ UTC — ช่วงเช้าในไทย UTC ยังเป็นเมื่อวาน)
export function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseWorkDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (!d || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) throw new Error(`--date ต้องเป็นวันที่จริงรูปแบบ YYYY-MM-DD (ได้: ${JSON.stringify(s ?? "")})`);
  return s;
}

function dateSection(date) {
  return `## วันที่ของงาน (date of work): ${date}\nUse this date for the header line, the changelog and every dated entry (the controller already specified it per CONVENTIONS §4 — do not ask the user again).`;
}

// งานที่ไม่ผูก role (baan-role ไม่ส่ง --role) ก็ยังต้องมีป้าย — ไม่งั้น session ใน workspace จะสวมบท นายช่าง
// และอาจเปิด baan-role ซ้อนต่อเอง
export function adhocDirective(task) {
  return `${roleSessionHeader("adhoc")}\n\n${task}`;
}

// role ที่ระดับการตรวจเปลี่ยนวิธีทำงาน — writer ต้องรู้ด้วย ไม่งั้นลองเคสเต็มเองแล้วงานช้าเท่าเดิม
export const TEST_LEVEL_ROLES = ["inspect", "check", "sys", "front"];

function testLevelSection(level) {
  return `## Test level of this assignment: ${level}\nApply the \`${level}\` rules in the "Test level" section of your role (the controller set it — do not widen or narrow it yourself).`;
}

export function roleDirective(roleName, task, ctxBlocks, projectCtx, date = localDate(), testLevel = "") {
  const id = resolveRoleName(roleName);
  const roleContent = readFileSync(path.join(ROLES_DIR, `${id}.md`), "utf8").trim();
  const level = testLevel && TEST_LEVEL_ROLES.includes(id) ? `\n\n${testLevelSection(testLevel)}` : "";
  const conv = `\n\n---\n\n## Shared conventions every role must follow (binding contract):\n${readConventions()}\n\n---\n\n${dateSection(date)}${level}`;
  const pc = projectCtx ? `\n\n---\n\n## Project context:\n${projectCtx}` : "";
  const ctx = ctxBlocks?.length ? `\n\n---\n\n## Output from previous tasks:\n${ctxBlocks.join("\n\n")}` : "";
  return `${roleSessionHeader(id)}\n\nYou are now operating in a software development team, strictly under the following role:\n\n${roleContent}${conv}${pc}\n\n---\n\n## Your assignment:\n${task}${ctx}`;
}

export function pmPrompt(goal, projectCtx, date = localDate()) {
  return `${roleDirective("gm", `The user sent you (the site manager) a goal. Digest it and write a concise "brief for the master planner" (max 10 lines): what must be delivered, scope in/out, known constraints, and things to watch out for — do not plan it yourself, that is the master planner's job.\n\n## Goal from the user:\n${goal}`, null, projectCtx, date)}

Reply with the brief text only (no JSON). Write it in Thai.`;
}

export function plannerPrompt(pmDirective, goal, cfg, projectCtx, date = localDate(), write = false) {
  const roleContent = readFileSync(path.join(ROLES_DIR, "plan.md"), "utf8").trim();
  const roles = listRoles().map((r) => `- ${r.name} — ${r.title}: ${r.summary}${FIXED_ROLE_TIER[r.name] ? ` (fixed tier ${FIXED_ROLE_TIER[r.name]})` : ` (planner picks tier ${IMPLEMENT_TIER_RANGE} by difficulty)`}`).join("\n");
  const matrix = tierMatrixText(cfg.tiers, cfg.agents);
  const conv = `\n## Shared conventions every role must follow (binding contract):\n${readConventions()}\n\n${dateSection(date)}\n`;
  const pc = projectCtx ? `\n## Project context (attach to every task touching code/documents):\n${projectCtx}\n` : "";
  return `${roleSessionHeader("plan")}

You are now operating as the master planner, strictly under the following role:

${roleContent}

---

## Goal from the user:
${goal}

## Brief from the site manager:
${pmDirective}
${conv}${pc}
## Team you may call (roles — use the ID before the dash in the "role" field):
${roles}

## Runners (agents) and tiers actually available:
${matrix}

## Planning rules (important):
1. Easy work = few tasks (maybe 1–2, or a single task) — pick only the roles that are needed, never the whole team.
2. **Task tier is selectable only for roles = front / sys** (implementation work already designed by arch — pick within ${IMPLEMENT_TIER_RANGE} by real difficulty) — every other role uses its fixed tier from the list above.
3. Tasks without dependencies (empty dependsOn) run in parallel — add a dependency only when genuinely required. Two tasks writing to the same target repository must depend on each other unless they provably touch disjoint files/paths — sharing no contract is not the same as sharing no files.
4. Run mode of this run: ${write ? "**write** — front/sys tasks edit code in the target repository and must leave it buildable with its tests passing." : "**read-only** — no task can edit files, so front/sys tasks output the concrete code change (diff/patch + test command) for the controller to apply; never turn implementation into a description of what to build later."}
5. Walking skeleton first: if the goal builds or changes software, the plan must contain at least one front/sys task that produces something runnable and testable (a thin vertical slice), and that task must not wait on a human gate directly or through dependsOn — where a dependency is still unanswered (DB not provisioned, external contract unconfirmed, UX not signed), the slice uses a stub/fake/adapter and the gate stays on the later task that connects the real thing. Plans with no implementation task are rejected unless you set "docsOnly" with the reason (e.g. the user asked for documents only).
6. Time-box documents: spec/arch/int/inspect tasks cover only what the slice being built in this plan needs — never a full-system specification up front — and at most 3 document tasks sit in the dependency chain before the first implementation task.
7. Related-impact sweep: if a task changes an existing contract, name, value, revision, or status that other artifacts reference, state the old values in that task so the controller can run \`baan --sweep "<old value>"\` — finding referencers is mechanical and verbatim replacements are applied by the controller, so never create a task just to search or to replace text. Add a follow-up task only where a referencing document's meaning must change, one task per owner (not per file). If nothing references the change, say so in the task so it is a decision, not an oversight.
8. Development-first is the default across the whole plan, not just the first skeleton: build every ready implementation task toward a runnable main flow while QA runs in small batches. Separate development using pinned contracts and isolated development-only fakes from tasks connecting real systems and judging acceptance. Do not put the whole UI chain behind License/Login/DB QA when an adapter can supply its inputs. Preserve ACs, findings and release gates; record deferred QA with an owner and closure condition in the task brief. Production auth stays fail-closed; fakes must not reach real data/hardware. A failed QA task stops only work needing its real output, not independent development. Dependencies still serialize actual shared-file writes.
   QA while developing runs at test level **normal** (happy flow of each AC + automated tests). When the plan builds the whole scope, end it with one **full pass** — inspect + check per module/flow (+ jpo on security surfaces) with \`"testLevel": "full"\` — after the implementation tasks it covers, instead of a deep check after every task.
9. Anything that must be a "human gate" (e.g. UX sign-off, running SQL, a business decision) goes into humanGates.

## Reply with JSON only (no text outside the JSON):
{
  "summary": "one-line plan summary (Thai)",
  "tasks": [
    {
      "id": "T1",
      "role": "spec",
      "tier": "t2",
      "title": "short task title (Thai)",
      "task": "full work instruction for this role (in Thai, unambiguous, stating the required output)",
      "dependsOn": []
    }
  ],
  "humanGates": ["what needs a human decision (use [] if none) — in Thai"],
  "docsOnly": "only when the plan deliberately has no front/sys task — the reason (Thai); omit otherwise"
}
(Do not specify agent — the system assigns it to every task.)`;
}
