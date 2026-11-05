import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { TEAM_DIR } from "../config.mjs";
import { TASK_ID_RE, findDependencyCycle, normalizeDagTasks } from "../plan.mjs";
import { fileHash, repoRoot } from "./snapshot.mjs";

export function validate(value, schema, location = "result") {
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${location}: expected ${schema.enum.join("/")}`);
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${location}: expected object`);
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) throw new Error(`${location}.${key}: required`);
    for (const [key, v] of Object.entries(value)) {
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
  return value;
}
export const schemaFor = (name) => JSON.parse(readFileSync(path.join(TEAM_DIR, "schemas", `${name}.json`), "utf8"));
export function assertId(id) { if (!TASK_ID_RE.test(id)) throw new Error(`invalid id: ${id}`); return id; }
export function validatePacket(p) {
  validate(p, schemaFor("packet.schema"), "packet");
  assertId(p.id);
  if (!p.owns.length || p.owns.some((f) => typeof f !== "string" || !f || path.isAbsolute(f) || f.includes(":") || f.split(/[\\/]/).includes("..") || /^\.git(?:[\\/]|$)/.test(f))) throw new Error(`${p.id}: owns must be repository-relative globs`);
  for (const name of ["build", "test_targeted", "test_full"]) if (!p.commands[name]?.trim()) throw new Error(`${p.id}: commands.${name} required`);
  p.repo = { ...p.repo, path: repoRoot(p.repo.path) };
  return p;
}
export function readiness(p) {
  const reasons = [];
  if (!p.acceptance.length || p.acceptance.some((a) => !a.text.trim() || !a.source.trim())) reasons.push("ต้องมี acceptance พร้อมแหล่งอ้างอิง: ทำขั้น 0 /pencil และ survey หากมีหน้าจอ");
  if (!p.acceptance_approved || !p.approved_by || !p.approved_at) reasons.push("รอผู้ใช้ยืนยัน acceptance ด้วย baan decide --approve");
  for (const ref of [...p.read_first, ...(p.contracts ?? []).filter((c) => c.ref).map((c) => ({ path: c.ref }))]) {
    if (!existsSync(path.resolve(p.repo.path, ref.path))) reasons.push(`ไม่พบ reference: ${ref.path}`);
  }
  return reasons;
}
export function documentBasis(p) {
  const sources = p.acceptance.map((a) => a.source.split("#")[0]).filter((f) => existsSync(path.resolve(p.repo.path, f)));
  return Object.fromEntries([...p.read_first.map((r) => r.path), ...(p.contracts ?? []).map((c) => c.ref).filter(Boolean), ...sources]
    .map((f) => { const full = path.resolve(p.repo.path, f); return [full, fileHash(full)]; }));
}
export function checkDag(packages, externalDone = []) {
  const ids = new Set(packages.map((p) => p.id));
  if (ids.size !== packages.length) throw new Error("duplicate package id");
  for (const p of packages) for (const id of p.depends_on) if (!ids.has(id) && !externalDone.includes(id)) throw new Error(`${p.id}: unknown dependency ${id}`);
  const cycle = findDependencyCycle(packages.map((p) => ({ id: p.id, dependsOn: p.depends_on })));
  if (cycle) throw new Error(`dependency cycle: ${cycle.join(" → ")}`);
}
export function fromPlan(plan, { repo, commands, select = "", baseDir = process.cwd(), knowledgeRoot } = {}) {
  if (Array.isArray(plan.packages)) {
    const packages = structuredClone(plan.packages).map((p) => validatePacket({ ...p, repo: { ...p.repo, path: path.resolve(baseDir, p.repo.path) } }));
    checkDag(packages);
    return selectPackages(packages, select);
  }
  if (!Array.isArray(plan.tasks)) throw new Error("plan requires packages or tasks");
  const tasks = normalizeDagTasks(plan.tasks);
  if (new Set(tasks.map((t) => t.id)).size !== tasks.length) throw new Error("duplicate task id");
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
    const normalized = tasks.find((t) => t.id === task.id);
    const similar = task.owns?.length && [...groups.values()].find((g) => g.module === task.module && task.module && JSON.stringify(g.owns) === JSON.stringify(task.owns) && g.repo.path === (task.repo?.path ?? repo) && JSON.stringify(g.commands) === JSON.stringify(task.commands ?? commands ?? plan.commands));
    const key = task.package ?? similar?.id ?? task.id;
    const pkg = groups.get(key) ?? {
      id: assertId(key), title: task.title ?? task.name ?? task.id, goal: task.goal ?? task.description ?? plan.goal ?? task.id,
      tasks: [], repo: { path: task.repo?.path ?? repo }, owns: task.owns ?? plan.owns ?? [],
      read_first: task.read_first ?? [], contracts: task.contracts ?? [], commands: task.commands ?? commands ?? plan.commands,
      acceptance: [], depends_on: [], risk: task.risk ?? "low", budget: task.budget,
      acceptance_approved: plan.acceptance_approved === true, approved_by: plan.approved_by ?? "", approved_at: plan.approved_at ?? "",
      module: task.module,
    };
    pkg.tasks.push(task.id);
    if (pkg.tasks.length > 1) {
      pkg.goal += `\n${task.goal ?? task.description ?? task.title ?? task.id}`;
      if (task.risk === "high") pkg.risk = "high";
      for (const ref of task.read_first ?? []) if (!pkg.read_first.some((r) => r.path === ref.path)) pkg.read_first.push(ref);
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
  for (const p of packages) {
    p.depends_on = [...new Set(p.depends_on.map((id) => packages.find((g) => g.tasks.includes(id))?.id ?? id))].filter((id) => id !== p.id);
    p.acceptance = [...new Map(p.acceptance.map((a) => [a.id, a])).values()];
    p.repo.path = path.resolve(baseDir, p.repo.path ?? repo ?? ".");
    validatePacket(p);
  }
  checkDag(packages);
  return selectPackages(packages, select);
}
function selectPackages(packages, select) {
  if (!select || select === "ready") return packages;
  const requested = select.split(",");
  for (const id of requested) if (!packages.some((p) => p.id === id || p.tasks.includes(id))) throw new Error(`unknown selection ${id}`);
  const kept = packages.filter((p) => requested.some((id) => id === p.id || p.tasks.includes(id)));
  const dropped = packages.filter((p) => !kept.includes(p));
  for (const p of kept) for (const d of p.depends_on) if (dropped.some((p) => p.id === d)) throw new Error(`${p.id}: select dependency ${d} ด้วย`);
  return kept;
}
