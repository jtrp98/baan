import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { TEAM_DIR } from "./config.mjs";
import { TASK_ID_RE, findDependencyCycle, normalizeDagTasks } from "./plan.mjs";
import { fileHash, repoRoot, hash } from "./snapshot.mjs";

export function validate(value, schema, location = "result") {
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${location}: expected ${schema.enum.join("/")}`);
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location}: expected object`);
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) throw new Error(`${location}.${key}: required`);
    for (const [key, v] of Object.entries(value)) {
      if (v === undefined && !schema.required?.includes(key)) continue;
      const known = Object.hasOwn(schema.properties ?? {}, key);
      if (schema.additionalProperties === false && !known) throw new Error(`${location}.${key}: unknown field`);
      if (known) validate(v, schema.properties[key], `${location}.${key}`);
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value) || value.length < (schema.minItems ?? 0)) throw new Error(`${location}: expected array with >= ${schema.minItems ?? 0} items`);
    value.forEach((v, i) => validate(v, schema.items ?? {}, `${location}[${i}]`));
  } else if (schema.type === "string") {
    if (typeof value !== "string" || value.length < (schema.minLength ?? 0) || (schema.pattern && !new RegExp(schema.pattern).test(value))) throw new Error(`${location}: invalid string`);
  } else if (schema.type === "boolean" && typeof value !== "boolean") throw new Error(`${location}: expected boolean`);
  else if (schema.type === "integer" && !Number.isInteger(value)) throw new Error(`${location}: expected integer`);
  else if (schema.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) throw new Error(`${location}: expected finite number`);
  if (schema.minimum !== undefined && value < schema.minimum || schema.maximum !== undefined && value > schema.maximum) throw new Error(`${location}: out of range`);
  return value;
}
export const schemaFor = (name) => JSON.parse(readFileSync(path.join(TEAM_DIR, "schemas", `${name}.json`), "utf8"));
export function validateResult(result, role, packet) {
  try {
    validate(result, schemaFor(role === "worker" ? "worker.result" : role === "verifier" ? "verifier.result" : "plan.result"));
    if (role === "planner") return result;
    const ids = result.acceptance.map((a) => a.id);
    if (new Set(ids).size !== ids.length || ids.some((id) => !packet.acceptance.some((a) => a.id === id))) throw new Error(`${role}: unknown/duplicate acceptance id`);
    if (role === "worker" && result.state === "DONE" && (result.failure_class || result.questions.length || ids.length !== packet.acceptance.length || result.acceptance.some((a) => !a.proof.length))) throw new Error("worker: DONE requires evidence for all acceptance and no blockers");
    if (result.acceptance.some((a) => a.proof.some((proof) => !proof.trim()))) throw new Error(`${role}: empty evidence`);
    return result;
  } catch (error) { throw Object.assign(error, { failureClass: "OUTPUT_CONTRACT" }); }
}
export function assertId(id) { if (typeof id !== "string" || !TASK_ID_RE.test(id)) throw new Error(`invalid id: ${id}`); return id; }
export function validatePacket(p) {
  validate(p, schemaFor("packet.schema"), "packet");
  assertId(p.id);
  if (!p.owns.length || p.owns.some((f) => typeof f !== "string" || !f.trim() || path.isAbsolute(f) || f.includes(":") || f.split(/[\\/]/).some((s) => ["..", ".", ".git", ".baan"].includes(s.toLowerCase())) || /[\0\r\n]/.test(f))) throw new Error(`${p.id}: owns must be repository-relative globs`);
  if (new Set(p.acceptance.map((a) => a.id)).size !== p.acceptance.length) throw new Error(`${p.id}: duplicate acceptance id`);
  if (p.acceptance.some((a) => !a.text.trim() || !a.source.trim())) throw new Error(`${p.id}: empty acceptance text/source`);
  p.depends_on.forEach(assertId);
  p.tasks.forEach(assertId);
  if (p.depends_on.includes(p.id)) throw new Error(`${p.id}: self dependency`);
  for (const name of ["build", "test_targeted", "test_full"]) if (!p.commands[name]?.trim()) throw new Error(`${p.id}: commands.${name} required`);
  p.repo = { ...p.repo, path: repoRoot(p.repo.path) };
  return p;
}
export function approvalBasis(p) {
  return hash(JSON.stringify({ repo: p.repo, goal: p.goal, owns: p.owns, acceptance: p.acceptance,
    commands: p.commands, depends_on: p.depends_on, contracts: p.contracts ?? [], human_gates: p.human_gates ?? [], risk: p.risk,
    risk_tags: p.risk_tags ?? [], docs: documentBasis(p) }));
}
export function readiness(p) {
  const reasons = [];
  if (!p.acceptance.length || p.acceptance.some((a) => !a.text.trim() || !a.source.trim())) reasons.push("ต้องมี acceptance พร้อมแหล่งอ้างอิง: ทำขั้น 0 spec และ survey หากมีหน้าจอ");
  if (p.requires_dirty_confirmation && !p.dirty_approved) reasons.push("completed scope/Git state changed; decide --allow-dirty before resume");
  if (!p.acceptance_approved || p.approved_by !== "user" || !Number.isFinite(Date.parse(p.approved_at)) || !p.approved_source?.trim()) reasons.push("รอผู้ใช้ยืนยัน acceptance ด้วย baan decide --approve");
  else if (p.approved_basis !== approvalBasis(p)) reasons.push("stale approval: acceptance/scope/commands/references เปลี่ยน ต้องยืนยันใหม่");
  for (const g of p.human_gates ?? []) {
    const a = p.gate_approvals?.[g.id];
    if (a?.by !== "user" || !a.source?.trim() || !Number.isFinite(Date.parse(a.at)) || a.basis !== approvalBasis(p)) reasons.push(`human gate ${g.id}: ${g.text} — decide --gate ${g.id} --by user`);
  }
  for (const ref of [...p.read_first, ...(p.contracts ?? []).filter((c) => c.ref).map((c) => ({ path: c.ref }))]) {
    if (!existsSync(path.resolve(p.repo.path, ref.path.split("#")[0]))) reasons.push(`ไม่พบ reference: ${ref.path}`);
  }
  return reasons;
}
export function documentBasis(p) {
  const sources = p.acceptance.map((a) => a.source.split("#")[0]).filter((f) => existsSync(path.resolve(p.repo.path, f)));
  const pinned = p.read_first.filter((r) => r.pin || /\.(?:md|mdx|dbml)$/i.test(r.path.split("#")[0]));
  return Object.fromEntries([...pinned.map((r) => r.path), ...(p.contracts ?? []).map((c) => c.ref).filter(Boolean), ...sources]
    .map((f) => { const full = path.resolve(p.repo.path, f.split("#")[0]); return [full, fileHash(full)]; }));
}
export function checkDag(packages, externalDone = []) {
  const ids = new Set(packages.map((p) => p.id));
  if (ids.size !== packages.length) throw new Error("duplicate package id");
  for (const p of packages) for (const id of p.depends_on) if (!ids.has(id) && !externalDone.includes(id)) throw new Error(`${p.id}: unknown dependency ${id}`);
  const cycle = findDependencyCycle(packages.map((p) => ({ id: p.id, dependsOn: p.depends_on })));
  if (cycle) throw new Error(`dependency cycle: ${cycle.join(" → ")}`);
}
export function fromPlan(plan, { repo, commands, select = "", baseDir = process.cwd(), knowledgeRoot } = {}) {
  plan = structuredClone(plan);
  if (Array.isArray(plan.packages)) {
    const allowed = Object.keys(schemaFor("packet.schema").properties);
    const packages = structuredClone(plan.packages).map((p) => {
      validate(p, schemaFor("packet.schema"), "packet");
      return validatePacket({ ...Object.fromEntries(Object.entries(p).filter(([k]) => allowed.includes(k))), repo: { ...p.repo, path: path.resolve(baseDir, p.repo.path) } });
    });
    checkDag(packages);
    return selectPackages(packages, select);
  }
  if (!Array.isArray(plan.tasks)) throw new Error("plan requires packages or tasks");
  for (const t of plan.tasks) {
    assertId(t?.id);
    const deps = t.dependsOn ?? t.depends_on ?? [];
    if (!Array.isArray(deps)) throw new Error(`${t.id}: dependencies must be an array`);
    deps.forEach(assertId);
    if (deps.includes(t.id)) throw new Error(`${t.id}: self dependency`);
  }
  const tasks = normalizeDagTasks(plan.tasks);
  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  if (tasksById.size !== tasks.length) throw new Error("duplicate task id");
  const taskCycle = findDependencyCycle(tasks);
  if (taskCycle) throw new Error(`dependency cycle: ${taskCycle.join(" → ")}`);
  const groups = new Map();
  let documents;
  const findAcceptance = (id) => {
    const supplied = plan.acceptance?.find((a) => a.id === id);
    if (supplied) return supplied;
    if (!knowledgeRoot) return null;
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.name.startsWith(".") ? [] : entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.md$/i.test(entry.name) ? [path.join(dir, entry.name)] : []);
    documents ??= walk(knowledgeRoot).filter((f) => /req(?:uirements?)?[-.]/i.test(path.basename(f))).map((file) => ({ file, lines: readFileSync(file, "utf8").split(/\r?\n/) }));
    const number = id.match(/^AC-(\d+)-/)?.[1];
    const preferred = documents.filter((d) => !number || path.basename(d.file).includes(number));
    for (const doc of [...preferred, ...documents.filter((d) => !preferred.includes(d))]) {
      const i = doc.lines.findIndex((line) => line.includes(id) && !line.trim().startsWith("#"));
      if (i >= 0) return { id, text: doc.lines[i], source: `${doc.file}#L${i + 1}` };
    }
    return null;
  };
  for (const task of plan.tasks) {
    const normalized = tasksById.get(task.id);
    const similar = task.owns?.length && [...groups.values()].find((g) => g.module === task.module && task.module && JSON.stringify(g.owns) === JSON.stringify(task.owns) && g.repo.path === (task.repo?.path ?? repo) && JSON.stringify(g.commands) === JSON.stringify(task.commands ?? commands ?? plan.commands));
    const key = task.package ?? similar?.id ?? task.id;
    const workerTierVal = task.worker_tier ?? task.workerTier ?? plan.worker_tier ?? plan.workerTier;
    const pkg = groups.get(key) ?? {
      id: assertId(key), title: task.title ?? task.name ?? task.id, goal: task.goal ?? task.task ?? task.description ?? plan.goal ?? task.id,
      tasks: [], repo: { path: task.repo?.path ?? repo }, owns: task.owns ?? plan.owns ?? [],
      read_first: [...(task.read_first ?? [])], contracts: task.contracts ?? [], commands: task.commands ?? commands ?? plan.commands,
      acceptance: [], depends_on: [], risk: task.risk ?? "low", budget: task.budget,
      acceptance_approved: plan.acceptance_approved === true, approved_by: plan.approved_by ?? "", approved_at: plan.approved_at ?? "",
      module: task.module,
      human_gates: [],
      kind: task.kind ?? plan.kind ?? normalized?.kind ?? "code",
      ...(task.cross_cutting !== undefined || task.crossCutting !== undefined ? { cross_cutting: Boolean(task.cross_cutting ?? task.crossCutting) } : {}),
      ...(workerTierVal ? { worker_tier: workerTierVal } : {}),
    };
    pkg.tasks.push(task.id);
    if (JSON.stringify(pkg.owns) !== JSON.stringify(task.owns ?? plan.owns ?? []) || pkg.repo.path !== (task.repo?.path ?? repo) || JSON.stringify(pkg.commands) !== JSON.stringify(task.commands ?? commands ?? plan.commands)) throw new Error(`${task.id}: incompatible package scope/repo/commands`);
    const gateIds = task.gateIds ?? task.gate_ids ?? [];
    if (!Array.isArray(gateIds)) throw new Error(`${task.id}: gate ids must be an array`);
    const gates = [...gateIds.map((id) => ({ id: assertId(id), text: plan.human_gates?.find((g) => g.id === id)?.text || id })), ...(task.human_gates ?? [])];
    if (task.humanGate) gates.push({ id: assertId(`${task.id}-human`), text: task.humanGate });
    for (const g of gates) if (!pkg.human_gates.some((x) => x.id === g.id)) pkg.human_gates.push(g);
    if (pkg.tasks.length > 1) {
      pkg.goal += `\n${task.goal ?? task.task ?? task.description ?? task.title ?? task.id}`;
      if (task.risk === "high") pkg.risk = "high";
      for (const ref of task.read_first ?? []) if (!pkg.read_first.some((r) => r.path === ref.path)) pkg.read_first.push(ref);
      for (const c of task.contracts ?? []) if (!pkg.contracts.some((r) => JSON.stringify(r) === JSON.stringify(c))) pkg.contracts.push(c);
    }
    pkg.depends_on.push(...normalized.dependsOn);
    pkg.acceptance.push(...(task.acceptance ?? normalized.acIds.map((id) => {
      const ref = findAcceptance(id);
      if (!ref) throw new Error(`${task.id}: AC ${id} ต้องมีข้อความต้นฉบับใน plan.acceptance`);
      return ref;
    })));
    groups.set(key, pkg);
  }
  const packages = [...groups.values()];
  const packageByTask = new Map(packages.flatMap((p) => p.tasks.map((id) => [id, p.id])));
  for (const p of packages) {
    p.depends_on = [...new Set(p.depends_on.map((id) => packageByTask.get(id) ?? id))].filter((id) => id !== p.id);
    p.acceptance = [...new Map(p.acceptance.map((a) => [a.id, a])).values()];
    p.repo.path = path.resolve(baseDir, p.repo.path ?? repo ?? ".");
    validatePacket(p);
  }
  checkDag(packages);
  return selectPackages(packages, select);
}
function selectPackages(packages, select) {
  if (!select) return packages;
  const requested = select.split(",");
  for (const id of requested) if (!packages.some((p) => p.id === id || p.tasks.includes(id))) throw new Error(`unknown selection ${id}`);
  const kept = packages.filter((p) => requested.some((id) => id === p.id || p.tasks.includes(id)));
  const dropped = packages.filter((p) => !kept.includes(p));
  for (const p of kept) for (const d of p.depends_on) if (dropped.some((p) => p.id === d)) throw new Error(`${p.id}: select dependency ${d} ด้วย`);
  return kept;
}
