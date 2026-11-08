export const TASK_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

import { existsSync } from "node:fs";
import path from "node:path";
import { resolveRoleName } from "./config.mjs";

const TEST_LEVELS = ["normal", "full"];
const IMPLEMENT_ROLES = ["front", "sys", "build"];

export const TIER_LEVELS = { t0: 0, t1: 1, t2: 2, t3: 3, t4: 4, t5: 5 };
export function isTierLower(a, b) {
  if (!a || !b) return false;
  return (TIER_LEVELS[a] ?? 99) > (TIER_LEVELS[b] ?? 99);
}

const DEFAULT_AGENT_FALLBACK_ORDER = ["codex", "agy", "claude"];

export function fallbackChainFor(cfg, tierName, chosenAgent) {
  const tierConf = cfg.tiers[tierName] ?? {};
  const order = Array.isArray(tierConf._fallback) && tierConf._fallback.length ? tierConf._fallback : DEFAULT_AGENT_FALLBACK_ORDER;
  const usable = (a) => a in cfg.agents && tierConf[a] !== null;
  return [...new Set([chosenAgent, ...order].filter(usable))];
}

export function extractJson(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("ไม่พบข้อความ JSON ในคำตอบ");
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("ไม่พบ JSON ในคำตอบของนักวางผัง");
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (err) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i];
      if (inString) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === '"') inString = false;
      } else {
        if (ch === '"') inString = true;
        else if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            try {
              return JSON.parse(raw.slice(start, i + 1));
            } catch {
              // Ignore partial JSON matches until balanced boundary is valid
            }
          }
        }
      }
    }
    throw err;
  }
}

export function findDependencyCycle(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const visiting = new Set();
  const finished = new Set();
  let cycle = null;
  const visit = (id, stack) => {
    if (cycle || finished.has(id)) return;
    if (visiting.has(id)) { cycle = [...stack.slice(stack.indexOf(id)), id]; return; }
    visiting.add(id);
    stack.push(id);
    for (const d of byId.get(id)?.dependsOn ?? []) if (byId.has(d)) visit(d, stack);
    stack.pop();
    visiting.delete(id);
    finished.add(id);
  };
  for (const t of tasks) visit(t.id, []);
  return cycle;
}

export function normalizeDagTasks(tasks) {
  const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "");
  const list = (v) => (Array.isArray(v) ? v : []);
  const level = (o) => {
    const v = o?.test_level ?? o?.testLevel ?? null;
    return typeof v === "string" ? v.trim().toLowerCase() : v;
  };
  return tasks.map((t) => ({
    id: t.id,
    role: resolveRoleName(t.role ?? t.owner),
    dependsOn: Array.isArray(t.dependsOn ?? t.depends_on) ? (t.dependsOn ?? t.depends_on) : [],
    gated: nonEmpty(t.gateIds ?? t.gate_ids) || nonEmpty(t.humanGate),
    status: typeof t.status === "string" ? t.status.trim().toLowerCase() : "",
    acIds: list(t.acIds ?? t.ac_ids),
    risk: typeof t.risk === "string" ? t.risk.trim().toLowerCase() : (t.risk ?? null),
    wave: t.wave ?? null,
    tier: typeof t.tier === "string" ? t.tier.trim().toLowerCase() : null,
    workerTier: typeof (t.worker_tier ?? t.workerTier) === "string" ? (t.worker_tier ?? t.workerTier).trim().toLowerCase() : null,
    kind: typeof t.kind === "string" ? t.kind.trim().toLowerCase() : (IMPLEMENT_ROLES.includes(resolveRoleName(t.role ?? t.owner)) ? "code" : "docs"),
    contracts: Array.isArray(t.contracts) ? t.contracts : [],
    oracle: nonEmpty(t.oracle),
    ref: nonEmpty(t.ref),
    level: level(t),
    slices: list(t.slices).map((s) => ({
      id: s?.id,
      acIds: list(s?.acIds ?? s?.ac_ids),
      status: typeof s?.status === "string" ? s.status.trim().toLowerCase() : "",
      oracle: nonEmpty(s?.oracle),
      ref: nonEmpty(s?.ref),
      level: level(s),
    })),
  }));
}

export function transitiveFanOut(tasks) {
  const children = new Map(tasks.map((t) => [t.id, []]));
  for (const t of tasks) for (const d of t.dependsOn) children.get(d)?.push(t.id);
  const memo = new Map();
  const reach = (id) => {
    if (memo.has(id)) return memo.get(id);
    memo.set(id, new Set()); // Cycles are reported separately by findDependencyCycle.
    const all = new Set();
    for (const c of children.get(id) ?? []) { all.add(c); for (const x of reach(c)) all.add(x); }
    memo.set(id, all);
    return all;
  };
  return new Map(tasks.map((t) => [t.id, reach(t.id).size]));
}

const RISK_LEVELS = ["high", "low"];

export function lintPlanVerification(tasks) {
  const errors = [];
  const warnings = [];
  const fanOut = transitiveFanOut(tasks);
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const isWave = (w) => Number.isInteger(w) && w > 0;
  for (const t of tasks) {
    if (t.risk !== null && !RISK_LEVELS.includes(t.risk)) errors.push(`${t.id}: risk ต้องเป็น ${RISK_LEVELS.join("/")} (ได้ ${JSON.stringify(t.risk)})`);
    if (t.wave === null) continue;
    if (!isWave(t.wave)) { errors.push(`${t.id}: wave ต้องเป็นจำนวนเต็มบวก (ได้ ${JSON.stringify(t.wave)})`); continue; }
    const later = t.dependsOn.filter((d) => isWave(byId.get(d)?.wave) && byId.get(d).wave > t.wave);
    if (later.length) errors.push(`${t.id}: อยู่ wave ${t.wave} แต่พึ่งงานที่อยู่ wave หลังกว่า (${later.map((d) => `${d}@${byId.get(d).wave}`).join(", ")})`);
  }
  const open = tasks.filter((t) => deriveTaskStatus(t) !== "verified");
  const byFanOut = (a, b) => fanOut.get(b.id) - fanOut.get(a.id);
  const listIds = (list) => list.slice(0, 10).map((t) => `${t.id}(${fanOut.get(t.id)})`).join(", ") + (list.length > 10 ? ` +${list.length - 10}` : "");
  const noAc = open.filter((t) => !t.acIds.length).sort(byFanOut);
  if (noAc.length) warnings.push(`task ที่ยังไม่ verified และไม่มี ac_ids ${noAc.length} งาน — ตรึง oracle ไม่ได้ ส่ง spec ผูก AC ก่อนเปิดงาน (เรียงตามจำนวนงานที่พึ่ง): ${listIds(noAc)}`);
  const threshold = Math.max(3, Math.ceil(tasks.length / 4));
  const foundations = tasks.filter((t) => fanOut.get(t.id) >= threshold).sort(byFanOut).map((t) => t.id);
  const unrated = open.filter((t) => foundations.includes(t.id) && t.risk === null).sort(byFanOut);
  if (unrated.length) warnings.push(`task ฐานราก (งานพึ่ง ≥ ${threshold}) ยังไม่ระบุ risk ${unrated.length} งาน — high = ตรวจผลจริงก่อนเชื่อมใช้งาน แต่พัฒนาบนสัญญา + fake ต่อได้ · low = มี contract test กั้นแล้วรอ wave gate ได้: ${listIds(unrated)}`);
  const labels = (list) => `${list.slice(0, 10).join(", ")}${list.length > 10 ? ` +${list.length - 10}` : ""}`;
  const verifiedUnits = tasks.flatMap((t) => (t.slices.length
    ? t.slices.map((s, i) => ({ ...s, label: `${t.id}/${s.id ?? `slice#${i + 1}`}` }))
    : [{ ...t, label: t.id }])).filter((u) => u.status === "verified");
  const units = tasks.flatMap((t) => [{ ...t, label: t.id }, ...t.slices.map((s, i) => ({ ...s, label: `${t.id}/${s.id ?? `slice#${i + 1}`}` }))]);
  for (const u of units) if (u.level !== null && !TEST_LEVELS.includes(u.level)) errors.push(`${u.label}: test_level ต้องเป็น ${TEST_LEVELS.join("/")} (ได้ ${JSON.stringify(u.level)})`);
  const normalOnly = verifiedUnits.filter((u) => u.level === "normal").map((u) => u.label);
  if (normalOnly.length) warnings.push(`verified ระดับ normal (happy flow) ${normalOnly.length} จุด — ยังต้องผ่าน full pass ก่อน release: ${labels(normalOnly)}`);
  const noOracle = verifiedUnits.filter((u) => !u.oracle).map((u) => u.label);
  if (noOracle.length) warnings.push(`verified แต่ไม่มี oracle (revision ที่ใช้ตัดสิน) ${noOracle.length} จุด — เมื่อเอกสารเปลี่ยนจะบอกไม่ได้ว่าต้องตรวจซ้ำไหม: ${labels(noOracle)}`);
  const noRef = verifiedUnits.filter((u) => u.oracle && !u.ref).map((u) => u.label);
  if (noRef.length) warnings.push(`verified มี oracle แต่ไม่มี ref (commit ที่ตรวจ) ${noRef.length} จุด — เมื่อโค้ดเปลี่ยนจะบอกไม่ได้ว่าต้องตรวจซ้ำไหม: ${labels(noRef)}`);
  const unchecked = (id) => byId.get(id)?.risk === "high" && deriveTaskStatus(byId.get(id)) !== "verified";
  const qaDependencies = open.filter((t) => IMPLEMENT_ROLES.includes(t.role) && t.dependsOn.some((id) => {
    const dep = byId.get(id);
    return dep && ["check", "jpo"].includes(dep.role) && deriveTaskStatus(dep) !== "verified";
  }));
  if (qaDependencies.length) warnings.push(`งานพัฒนาที่รอ QA ${qaDependencies.length} งาน — ทบทวน dependency: ถ้าใช้สัญญาตรึง + fake ได้ ให้แยกงานเชื่อมจริงไว้รอ verdict แล้วเดินงานพัฒนาต่อ; ห้ามข้ามการตรวจสิทธิ์จริง: ${listIds(qaDependencies)}`);
  const builtEarly = tasks.filter((t) => ["done-local", "verified"].includes(deriveTaskStatus(t)) && t.dependsOn.some(unchecked));
  if (builtEarly.length) warnings.push(`งานที่ต่อยอดจาก task high ที่ยังไม่ผ่านการตรวจ ${builtEarly.length} งาน — แยกงานพัฒนาบนสัญญา + fake ออกจากงานเชื่อมจริง และเก็บ QA ค้าง; งานที่ต้องใช้พฤติกรรมจริงยังต้องรอ verdict: ${labels(builtEarly.map((t) => `${t.id}←${t.dependsOn.filter(unchecked).join("+")}`))}`);
  const weakHigh = open.filter((t) => t.risk === "high" && (t.kind === "code" || IMPLEMENT_ROLES.includes(t.role)) && /^t[3-5]$/.test(t.workerTier ?? t.tier ?? ""));
  if (weakHigh.length) warnings.push(`task high ที่ writer ใช้ tier ต่ำกว่า t2 ${weakHigh.length} งาน — ตกหนึ่งรอบเสีย writer + check บนคิวเดียว ตั้ง t2 ขึ้นไป: ${labels(weakHigh.map((t) => `${t.id}@${t.workerTier ?? t.tier}`))}`);
  const uncontractedStepDown = open.filter((t) => (t.kind === "code" || IMPLEMENT_ROLES.includes(t.role)) && isTierLower(t.workerTier, t.tier) && !t.oracle && !t.ref && (!t.contracts || !t.contracts.length));
  if (uncontractedStepDown.length) warnings.push(`task code ที่ลด worker_tier ต่ำกว่า tier โดยไม่มี contract/oracle/ref สเปกรองรับ ${uncontractedStepDown.length} งาน: ${labels(uncontractedStepDown.map((t) => `${t.id}(${t.tier}→${t.workerTier})`))}`);
  const waveSizes = new Map();
  for (const t of tasks) if (isWave(t.wave)) waveSizes.set(t.wave, (waveSizes.get(t.wave) ?? 0) + 1);
  const bigWaves = [...waveSizes].filter(([, n]) => n > 6).sort(([a], [b]) => a - b);
  if (bigWaves.length) warnings.push(`wave ที่มีเกิน 6 task: ${bigWaves.map(([w, n]) => `wave ${w} (${n})`).join(", ")} — แบ่ง wave ให้ check ใบเดียวต่อ gate ยังตรวจทั่วถึง`);
  const riskCounts = { high: 0, low: 0, unrated: 0 };
  for (const t of tasks) riskCounts[RISK_LEVELS.includes(t.risk) ? t.risk : "unrated"]++;
  const waves = new Set(tasks.map((t) => t.wave).filter(isWave)).size;
  const used = tasks.some((t) => t.risk !== null || t.wave !== null);
  return { errors, warnings, fanOut, foundations, riskCounts, waves, used };
}

const PLAN_STATUSES = ["pending", "done-local", "verified", "blocked"];

export function deriveTaskStatus(t) {
  if (!t.slices.length) return t.status;
  const covered = new Set(t.slices.filter((s) => s.status === "verified").flatMap((s) => s.acIds));
  if (t.acIds.length && t.acIds.every((a) => covered.has(a))) return "verified";
  if (t.slices.some((s) => s.status === "done-local" || s.status === "verified")) return "done-local";
  return "pending";
}

export function lintPlanProgress(tasks) {
  const errors = [];
  const warnings = [];
  for (const t of tasks) {
    if (t.status && !PLAN_STATUSES.includes(t.status)) warnings.push(`${t.id}: status "${t.status}" ไม่อยู่ใน ${PLAN_STATUSES.join("/")}`);
    t.slices.forEach((s, i) => {
      const sid = s.id ?? `slice#${i + 1}`;
      if (!PLAN_STATUSES.includes(s.status)) errors.push(`${t.id}/${sid}: status ของ slice ต้องเป็น ${PLAN_STATUSES.join("/")}`);
      else if (s.status !== "pending" && !s.acIds.length) errors.push(`${t.id}/${sid}: slice ที่ ${s.status} ต้องระบุ ac_ids ที่ verdict ครอบ`);
      const outside = t.acIds.length ? s.acIds.filter((a) => !t.acIds.includes(a)) : [];
      if (outside.length) errors.push(`${t.id}/${sid}: ac_ids นอก task (${outside.join(", ")}) — slice ครอบได้เฉพาะ AC ของ task ที่ตรึงไว้`);
    });
    if (!t.slices.length) continue;
    const derived = deriveTaskStatus(t);
    if (t.status === "verified" && derived !== "verified") {
      const covered = new Set(t.slices.filter((s) => s.status === "verified").flatMap((s) => s.acIds));
      const missing = t.acIds.filter((a) => !covered.has(a));
      errors.push(`${t.id}: status verified แต่ slice ที่ verified ยังไม่ครอบ AC ${missing.length ? missing.join(", ") : "(task ไม่มี ac_ids)"}`);
    } else if (derived !== "pending" && t.status !== "blocked" && PLAN_STATUSES.indexOf(derived) > PLAN_STATUSES.indexOf(t.status)) {
      warnings.push(`${t.id}: status "${t.status || "(ว่าง)"}" แต่ slices บอกว่าเป็น ${derived} แล้ว — ลงสถานะในแผนให้ตรง`);
    }
  }
  const impl = tasks.filter((t) => IMPLEMENT_ROLES.includes(t.role));
  const count = (list, st) => list.filter((t) => deriveTaskStatus(t) === st).length;
  const implProgress = { verified: count(impl, "verified"), doneLocal: count(impl, "done-local"), total: impl.length };
  const docsVerified = count(tasks.filter((t) => !IMPLEMENT_ROLES.includes(t.role)), "verified");
  if (impl.length && implProgress.verified + implProgress.doneLocal === 0 && docsVerified >= 5) {
    warnings.push(`งานเอกสาร verified แล้ว ${docsVerified} งาน แต่งาน implement ${impl.length} งานยังไม่มี done-local/verified เลย — ลง done-local ให้งานที่ test ผ่านในเครื่องแล้ว หรือเปิด slice โค้ดถัดไป`);
  }
  const slices = tasks.flatMap((t) => t.slices);
  return { errors, warnings, implProgress, slices: { verified: slices.filter((s) => s.status === "verified").length, total: slices.length } };
}

export function lintPlanDag(tasks, { docsOnly } = {}) {
  const errors = [];
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const blockedMemo = new Map();
  const isBlocked = (id, seen = new Set()) => {
    if (blockedMemo.has(id)) return blockedMemo.get(id);
    const t = byId.get(id);
    if (!t || seen.has(id)) return false;
    seen.add(id);
    const r = deriveTaskStatus(t) !== "verified" && (t.gated || t.dependsOn.some((d) => isBlocked(d, seen)));
    blockedMemo.set(id, r);
    return r;
  };
  const impl = tasks.filter((t) => IMPLEMENT_ROLES.includes(t.role)).map((t) => t.id);
  const blocked = impl.filter((id) => isBlocked(id));
  const free = impl.filter((id) => !blocked.includes(id));
  if (impl.length === 0) {
    if (!(typeof docsOnly === "string" && docsOnly.trim())) {
      errors.push(`แผนไม่มีงาน implement (${IMPLEMENT_ROLES.join("/")}) — ถ้าตั้งใจเป็นงานเอกสารล้วน ใส่ "docsOnly": "<เหตุผล>" ที่ระดับแผน`);
    }
  } else if (free.length === 0) {
    errors.push(`ไม่มี walking skeleton: งาน implement ทั้ง ${impl.length} งานติดประตูมนุษย์ (ตรงหรือผ่าน dependency) — แยกงาน slice แรกที่ใช้ stub/fake แทนของที่รอคน`);
  } else if (blocked.length * 2 > impl.length) {
    errors.push(`งาน implement ติดประตูมนุษย์ ${blocked.length}/${impl.length} งาน (เกินครึ่ง) — ย้าย gate ไปผูกที่ task ที่ต่อของจริง ให้งานที่ทำบน stub/fake เดินได้ · เริ่มได้ทันทีตอนนี้: ${free.join(", ")}`);
  }
  return { errors, impl, blocked, free };
}

export function lintPlanModules(rawTasks, file, isDirFn = (p) => existsSync(p)) {
  const errors = [];
  const warnings = [];
  let dir = path.dirname(path.resolve(file));
  let projectDir = "";
  for (;;) {
    if (isDirFn(path.join(dir, "modules"))) { projectDir = dir; break; }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  const withModule = rawTasks.filter((t) => t && t.module !== undefined);
  if (!projectDir) {
    if (withModule.length) warnings.push(`มี task ระบุ module ${withModule.length} งาน แต่ไฟล์แผนไม่ได้อยู่ใต้ project ที่มี modules/ — ตรวจไม่ได้ว่า module มีจริง`);
    return { errors, warnings, project: "" };
  }
  const project = path.basename(projectDir);
  const root = path.dirname(projectDir);
  const missing = [];
  for (const t of rawTasks) {
    if (!t || t.module === undefined) { missing.push(t?.id); continue; }
    const mods = Array.isArray(t.module) ? t.module : [t.module];
    if (!mods.length || mods.some((m) => typeof m !== "string" || !m.trim())) { errors.push(`${t.id}: module ต้องเป็นชื่อ module หรือ array ของชื่อ`); continue; }
    for (const m of mods) {
      const [p, mod] = m.includes("/") ? m.split("/") : [project, m];
      if (!isDirFn(path.join(root, p, "modules", mod))) errors.push(`${t.id}: module "${m}" ไม่มีจริง (${p}/modules/${mod})`);
    }
  }
  if (missing.length) warnings.push(`task ที่ยังไม่ระบุ module ${missing.length} งาน — run ราย module จะหยิบงานพวกนี้ไม่ได้: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " …" : ""}`);
  return { errors, warnings, project };
}

export function lintPlanFile(file, readFile, log = console.log, isDirFn) {
  const json = JSON.parse(readFile(file));
  const raw = Array.isArray(json) ? json : json.tasks;
  if (!Array.isArray(raw)) throw new Error(`${file}: ไม่พบ tasks (ต้องเป็น array หรือ object ที่มี tasks)`);
  const tasks = normalizeDagTasks(raw);
  const cycle = findDependencyCycle(tasks);
  const r = lintPlanDag(tasks, { docsOnly: json.docsOnly ?? json.docs_only });
  const p = lintPlanProgress(tasks);
  const v = lintPlanVerification(tasks);
  const mo = lintPlanModules(raw, file, isDirFn);
  p.warnings.push(...mo.warnings);
  const errors = [...(cycle ? [`dependency วนลูป: ${cycle.join(" → ")}`] : []), ...r.errors, ...p.errors, ...v.errors, ...mo.errors];
  log(`DAG lint: ${file}`);
  log(`  tasks ${tasks.length} · implement ${r.impl.length} · ติดประตูมนุษย์ ${r.blocked.length} · เริ่มได้ทันที ${r.free.length}${r.free.length ? ` (${r.free.join(", ")})` : ""}`);
  log(`  ความคืบหน้างาน implement: verified ${p.implProgress.verified} · done-local ${p.implProgress.doneLocal} / ${p.implProgress.total}${p.slices.total ? ` · slice verified ${p.slices.verified}/${p.slices.total}` : ""}`);
  if (v.used) log(`  ตรวจตามความเสี่ยง: high ${v.riskCounts.high} (ตรวจทันที) · low ${v.riskCounts.low} (รอ wave gate) · ยังไม่จัด ${v.riskCounts.unrated} · wave ${v.waves}`);
  for (const m of [...p.warnings, ...v.warnings]) log(`  ⚠ ${m}`);
  for (const m of errors) log(`  ✗ ${m}`);
  if (!errors.length) log("  ✓ ผ่าน");
  return errors.length ? 1 : 0;
}
