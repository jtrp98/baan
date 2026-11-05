import { checkDag, validatePacket, assertId, validate, schemaFor, approvalBasis, readiness } from "./packet.mjs";

export function applyPlanning(packages, result) {
  validate(result, schemaFor("plan.result"));
  for (const item of [...result.questions, ...result.decisions]) {
    if (!item.blocks.length || item.blocks.some((id) => !packages.some((p) => p.id === id))) throw new Error("Planner returned unknown/empty question blocks");
  }
  const approved = new Set(packages.filter((p) => !readiness(p).length).map((p) => p.id));
  packages = structuredClone(packages);
  const seen = new Set();
  const replacements = new Map();
  const planned = [];
  for (const row of result.packages) {
    const original = packages.find((p) => p.id === row.id);
    if (!original || seen.has(row.id)) throw new Error(`Planner changed/duplicated trusted package ${row.id}`);
    seen.add(row.id);
    if (JSON.stringify(row.depends_on) !== JSON.stringify(original.depends_on)) throw new Error(`Planner changed trusted dependencies ${row.id}`);
    const slices = row.subpackages ?? [];
    if (["done", "cancelled"].includes(original.state) && slices.length) throw new Error(`Planner split terminal package ${original.id}`);
    if (!slices.length) { planned.push(original); replacements.set(original.id, [original.id]); continue; }
    const children = slices.map((s) => {
      assertId(s.id);
      if (!s.owns.length || s.owns.some((g) => !original.owns.includes(g))) throw new Error(`${s.id}: expanded owns`);
      if (!s.acceptance_ids.length || s.acceptance_ids.some((id) => !original.acceptance.some((a) => a.id === id))) throw new Error(`${s.id}: invented acceptance`);
      if (s.tasks.some((id) => !original.tasks.includes(id))) throw new Error(`${s.id}: invented task`);
      if (packages.some((p) => p.id === s.id)) throw new Error(`${s.id}: subpackage id collides with parent package`);
      return validatePacket({ ...structuredClone(original), id: s.id, parent_id: original.id, title: s.title, goal: s.goal,
        tasks: s.tasks, owns: s.owns, acceptance: original.acceptance.filter((a) => s.acceptance_ids.includes(a.id)),
        depends_on: [...new Set([...original.depends_on, ...s.depends_on])], state: "pending" });
    });
    for (const id of [...original.tasks, ...original.acceptance.map((a) => a.id)])
      if (!children.some((c) => c.tasks.includes(id) || c.acceptance.some((a) => a.id === id))) throw new Error(`Planner dropped ${id}`);
    replacements.set(original.id, children.map((p) => p.id));
    planned.push(...children);
  }
  if (seen.size !== packages.length) throw new Error("Planner dropped packages");
  for (const p of planned) p.depends_on = [...new Set(p.depends_on.flatMap((id) => replacements.get(id) ?? [id]))].filter((id) => id !== p.id);
  checkDag(planned);
  // The core derives narrower assignments from the recorded parent approval; the model cannot approve them.
  for (const p of planned) if (approved.has(p.parent_id ?? p.id)) {
    p.approved_basis = approvalBasis(p);
    for (const a of Object.values(p.gate_approvals ?? {})) a.basis = p.approved_basis;
  }
  return planned;
}
