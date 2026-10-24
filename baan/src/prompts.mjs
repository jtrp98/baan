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
// ไม่ใส่วันที่ใน prompt = role ต้องหยุดด้วย NEEDS_HUMAN หรือเดาวันที่ลง Change Log เอง
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
  return `## วันที่ของงาน (date of work): ${date}\nUse this date for the Change Log and every dated entry (the controller already specified it per CONVENTIONS §4 — do not ask the user again).`;
}

// งานที่ไม่ผูก role (baan-role ไม่ส่ง --role) ก็ยังต้องมีป้าย — ไม่งั้น session ใน workspace จะสวมบท นายช่าง
// และอาจเปิด baan-role ซ้อนต่อเอง
export function adhocDirective(task) {
  return `${roleSessionHeader("adhoc")}\n\n${task}`;
}

export function roleDirective(roleName, task, ctxBlocks, projectCtx, date = localDate()) {
  const id = resolveRoleName(roleName);
  const roleContent = readFileSync(path.join(ROLES_DIR, `${id}.md`), "utf8").trim();
  const conv = `\n\n---\n\n## Shared conventions every role must follow (binding contract):\n${readConventions()}\n\n---\n\n${dateSection(date)}`;
  const pc = projectCtx ? `\n\n---\n\n## Project context:\n${projectCtx}` : "";
  const ctx = ctxBlocks?.length ? `\n\n---\n\n## Output from previous tasks:\n${ctxBlocks.join("\n\n")}` : "";
  return `${roleSessionHeader(id)}\n\nYou are now operating in a software development team, strictly under the following role:\n\n${roleContent}${conv}${pc}\n\n---\n\n## Your assignment:\n${task}${ctx}`;
}

export function pmPrompt(goal, projectCtx, date = localDate()) {
  return `${roleDirective("gm", `The user sent you (the site manager) a goal. Digest it and write a concise "brief for the master planner" (max 10 lines): what must be delivered, scope in/out, known constraints, and things to watch out for — do not plan it yourself, that is the master planner's job.\n\n## Goal from the user:\n${goal}`, null, projectCtx, date)}

Reply with the brief text only (no JSON). Write it in Thai.`;
}

export function plannerPrompt(pmDirective, goal, cfg, projectCtx, date = localDate()) {
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
4. Every task works read-only (no file edits yet) — output is documents/text.
5. Related-impact sweep: if a task changes an existing contract, name, value, revision, or status that other artifacts reference, the plan must also include a follow-up task for each affected document's owner (knowledge categories, index revision/status cells, target-repo docs) — a plan that changes the referenced thing but leaves referencing documents stale is defective. If nothing references the change, say so in the task so it is a decision, not an oversight.
6. Anything that must be a "human gate" (e.g. UX sign-off, running SQL, a business decision) goes into humanGates.

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
  "humanGates": ["what needs a human decision (use [] if none) — in Thai"]
}
(Do not specify agent — the system assigns it to every task.)`;
}
