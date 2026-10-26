// แผน DAG: นิยาม schema, การ normalize และ validation (ตรวจก่อน spawn ใดๆ)
// id ของ task ถูกใช้ประกอบชื่อไฟล์ใน runDir ทั้งอ่านและเขียน จึงต้องจำกัดด้วย pattern
export const TASK_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

import { resolveRoleName } from "./config.mjs";

// tier คงที่ของ role ที่ไม่ใช่งาน implement — planner เลือกเองไม่ได้ ยกเว้น front/sys
// เป็นแหล่งจริงเดียว: บรรทัด "> tier:" ใน roles/*.md และตาราง role ใน BAAN.md/README ถูก test ให้ตรงกับค่านี้
export const FIXED_ROLE_TIER = {
  plan: "t2",
  gm: "t2",
  spec: "t2",
  arch: "t1",
  int: "t2",
  vault: "t2",
  inspect: "t2",
  check: "t2",
  jpo: "t2",
};
// ช่วงที่ นายช่าง/planner ควรเลือกให้งาน implement (คำแนะนำใน prompt/เอกสาร — ไม่บังคับในโค้ด
// เพราะผู้ใช้อาจตั้งใจรัน front/sys ที่ t0/t1 ผ่าน --plan-file)
export const IMPLEMENT_TIER_RANGE = "t2–t5";
export const IMPLEMENT_ROLES = ["front", "sys"];

// ลำดับสลับตัวรันเริ่มต้นเมื่อ tier ไม่ได้ประกาศ _fallback เอง
// opencode (Z.AI coding plan เหมาจ่าย) อยู่ก่อน agy/claude ที่กินโควตารายเรียก
export const DEFAULT_AGENT_FALLBACK_ORDER = ["codex", "opencode", "agy", "claude"];

// ลำดับตัวรันจริงของงานหนึ่งงาน: agent ที่เลือกมาเป็นตัวแรกเสมอ แล้วไล่ตาม _fallback ของ tier
// (ข้าม agent ที่ไม่รู้จักหรือเป็น null ใน tier นั้น) — ใช้ทั้งตอน validate แผน (เลือกตัวแรกที่ใช้ได้)
// และตอน execute เมื่อตัวปัจจุบันติดโควตา/limit กลางคัน
export function fallbackChainFor(cfg, tierName, chosenAgent) {
  const tierConf = cfg.tiers[tierName] ?? {};
  const order = Array.isArray(tierConf._fallback) && tierConf._fallback.length ? tierConf._fallback : DEFAULT_AGENT_FALLBACK_ORDER;
  const usable = (a) => a in cfg.agents && tierConf[a] !== null;
  return [...new Set([chosenAgent, ...order].filter(usable))];
}

export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("ไม่พบ JSON ในคำตอบของนักวางผัง");
  return JSON.parse(raw.slice(start, end + 1));
}

// คืนรายการ id ที่วนลูป เช่น ["A","B","A"] หรือ null — ต้องจับตรงนี้ ไม่ใช่ตอน execute
// เพราะแผนที่วนลูปอาจมีงานอิสระปนอยู่ ซึ่งจะรันไปก่อนรู้ว่าแผนใช้ไม่ได้
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

// แปลง task จากแผนได้หลายรูป (แผน runtime ของ baan / tasks JSON ของ gm ที่ใช้ owner+depends_on+gate_ids)
// ให้ lint ตัวเดียวตรวจได้ทั้งคู่ — แผนโปรเจกต์ใน knowledge ไม่มี schema กลาง แต่ละโปรเจกต์ตั้งชื่อฟิลด์เอง
export function normalizeDagTasks(tasks) {
  const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "");
  return tasks.map((t) => ({
    id: t.id,
    role: resolveRoleName(t.role ?? t.owner),
    dependsOn: Array.isArray(t.dependsOn ?? t.depends_on) ? (t.dependsOn ?? t.depends_on) : [],
    gated: nonEmpty(t.gateIds ?? t.gate_ids) || nonEmpty(t.humanGate),
  }));
}

// lint รูปร่าง DAG — ที่มา: แผน school-bot (2026-10-26) ผูกงาน implement 61/63 งานไว้หลังประตูมนุษย์
// ผ่าน dependency ทางอ้อม จนไม่มีโค้ดชิ้นไหนเริ่มได้ ทั้งที่ validation เดิมผ่านหมด
// เกณฑ์ "เกินครึ่ง" ไม่ใช่ "ทุกงาน" เพราะแผนนั้นมีงาน sys ไม่ติดประตูอยู่หนึ่งงาน (ตรวจหลักฐาน ไม่ใช่โค้ด)
// เกณฑ์ทุกงานจึงปล่อยแผนที่เป็นต้นเหตุให้ผ่าน
export function lintPlanDag(tasks, { docsOnly } = {}) {
  const errors = [];
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const blockedMemo = new Map();
  const isBlocked = (id, seen = new Set()) => {
    if (blockedMemo.has(id)) return blockedMemo.get(id);
    const t = byId.get(id);
    if (!t || seen.has(id)) return false;
    seen.add(id);
    const r = t.gated || t.dependsOn.some((d) => isBlocked(d, seen));
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

export function validateAndFixPlan(plan, cfg, opts) {
  if (typeof plan !== "object" || plan === null || Array.isArray(plan)) throw new Error("แผนต้องเป็น object ที่มี tasks");
  if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) throw new Error("plan.tasks ว่างหรือไม่ใช่ array");
  if ("humanGates" in plan && !Array.isArray(plan.humanGates)) throw new Error("humanGates ต้องเป็น array ของ string");
  if (Array.isArray(plan.humanGates) && plan.humanGates.some((g) => typeof g !== "string")) throw new Error("humanGates ต้องเป็น array ของ string");
  if ("docsOnly" in plan && typeof plan.docsOnly !== "string") throw new Error("docsOnly ต้องเป็น string (เหตุผลที่แผนนี้ไม่มีงาน implement)");
  const errors = [];
  const ids = new Set();
  for (const t of plan.tasks) {
    if (typeof t !== "object" || t === null || Array.isArray(t)) { errors.push("task ต้องเป็น object"); continue; }
    if (typeof t.id !== "string" || !TASK_ID_RE.test(t.id)) {
      errors.push(`task id ไม่ถูกต้อง: ${JSON.stringify(t.id)} (ต้องขึ้นต้นด้วย A-Za-z0-9 ตามด้วย A-Za-z0-9_- ยาวรวมไม่เกิน 64 — id ถูกใช้เป็นชื่อไฟล์จึงห้ามมี / \\ .. หรือช่องว่าง)`);
      continue;
    }
    if (ids.has(t.id)) errors.push(`id ซ้ำ: ${t.id}`);
    ids.add(t.id);
    if (typeof t.task !== "string" || !t.task.trim()) errors.push(`${t.id}: ไม่มีคำสั่งงาน (task)`);
    const canonicalRole = resolveRoleName(t.role);
    if (canonicalRole !== t.role) {
      console.log(`  แก้ ${t.id}: role "${t.role}" → ${canonicalRole} (ชื่อเดิมก่อนย่อ ID)`);
      t.role = canonicalRole;
    }
    if ("title" in t && typeof t.title !== "string") errors.push(`${t.id}: title ต้องเป็น string`);
    if (!t.role || !cfg.roleNames.includes(t.role)) errors.push(`${t.id}: role ไม่รู้จัก "${t.role}"`);
    if (t.dependsOn === undefined || t.dependsOn === null) t.dependsOn = [];
    else if (!Array.isArray(t.dependsOn) || t.dependsOn.some((d) => typeof d !== "string")) errors.push(`${t.id}: dependsOn ต้องเป็น array ของ string (id ของงานที่ต้องสำเร็จก่อน)`);
    else {
      if (t.dependsOn.includes(t.id)) errors.push(`${t.id}: dependsOn ตัวเองไม่ได้`);
      t.dependsOn.forEach((d) => { if (!ids.has(d) && !plan.tasks.some((x) => x.id === d)) errors.push(`${t.id}: dependsOn ไม่มีจริง (${d})`); });
    }
    if (FIXED_ROLE_TIER[t.role] && t.tier !== FIXED_ROLE_TIER[t.role]) {
      console.log(`  แก้ ${t.id}: tier "${t.tier}" → ${FIXED_ROLE_TIER[t.role]} (role นี้ tier คงที่)`);
      t.tier = FIXED_ROLE_TIER[t.role];
    }
    if (!t.tier || !(t.tier in cfg.tiers)) errors.push(`${t.id}: tier ไม่รู้จัก "${t.tier}"`);
    const chain = fallbackChainFor(cfg, t.tier, opts.agent);
    if (chain.length === 0) errors.push(`${t.id}: tier ${t.tier} ไม่มี agent ที่ใช้ได้เลย (ทุกตัว null)`);
    t.agent = chain[0] ?? opts.agent;
    if (t.agent !== opts.agent) console.log(`  แก้ ${t.id}: agent "${opts.agent}" → ${t.agent} (ตามลำดับ fallback ของ tier ${t.tier})`);
  }
  const cycle = findDependencyCycle(plan.tasks);
  if (cycle) errors.push(`dependency วนลูป: ${cycle.join(" → ")}`);
  if (errors.length) throw new Error("แผนไม่ผ่าน validation:\n  " + errors.join("\n  "));
  // แผนสดจาก planner เท่านั้นที่ lint แบบปฏิเสธ — แผนจาก --plan-file/--resume อาจเขียนก่อนมีกติกานี้
  // ถ้าปฏิเสธจะ resume run เก่าไม่ได้ จึงเตือนอย่างเดียว
  const lint = lintPlanDag(normalizeDagTasks(plan.tasks), { docsOnly: plan.docsOnly });
  if (opts.lintStrict && lint.errors.length) throw new Error("แผนไม่ผ่าน DAG lint:\n  " + lint.errors.join("\n  "));
  for (const m of lint.errors) console.log(`  ⚠ DAG lint: ${m}`);
  return plan;
}

export function printPlan(plan) {
  console.log(`\nแผนของนักวางผัง: ${plan.summary ?? ""}`);
  console.log("┌─────┬─────────────────────┬─────────┬──────┬──────────┬─────────────────────────────┐");
  console.log("│ id  │ role                │ agent   │ tier │ depends  │ title                       │");
  console.log("├─────┼─────────────────────┼─────────┼──────┼──────────┼─────────────────────────────┤");
  for (const t of plan.tasks) {
    console.log(`│ ${String(t.id).padEnd(3)} │ ${String(t.role).padEnd(19)} │ ${String(t.agent).padEnd(7)} │ ${String(t.tier).padEnd(4)} │ ${String((t.dependsOn ?? []).join(",") || "-").padEnd(8)} │ ${String(t.title ?? "").slice(0, 27).padEnd(27)} │`);
  }
  console.log("└─────┴─────────────────────┴─────────┴──────┴──────────┴─────────────────────────────┘");
  const parallel = plan.tasks.filter((t) => (t.dependsOn ?? []).length === 0).map((t) => t.id);
  console.log(`รันขนานกันได้ตั้งแต่ต้น: ${parallel.join(", ") || "(ไม่มี)"}`);
  if (plan.humanGates?.length) console.log(`ประตูมนุษย์ (รอผู้ใช้ตัดสิน): ${plan.humanGates.join(" · ")}`);
  if (plan.docsOnly) console.log(`แผนเอกสารล้วน: ${plan.docsOnly}`);
}

// lint แผนโปรเจกต์ (เช่น plan\tasks-*.json ของ gm) — คืน exit code: 0 ผ่าน · 1 มี error
export function lintPlanFile(file, readFile, log = console.log) {
  const json = JSON.parse(readFile(file));
  const raw = Array.isArray(json) ? json : json.tasks;
  if (!Array.isArray(raw)) throw new Error(`${file}: ไม่พบ tasks (ต้องเป็น array หรือ object ที่มี tasks)`);
  const tasks = normalizeDagTasks(raw);
  const cycle = findDependencyCycle(tasks);
  const r = lintPlanDag(tasks, { docsOnly: json.docsOnly ?? json.docs_only });
  const errors = cycle ? [`dependency วนลูป: ${cycle.join(" → ")}`, ...r.errors] : r.errors;
  log(`DAG lint: ${file}`);
  log(`  tasks ${tasks.length} · implement ${r.impl.length} · ติดประตูมนุษย์ ${r.blocked.length} · เริ่มได้ทันที ${r.free.length}${r.free.length ? ` (${r.free.join(", ")})` : ""}`);
  for (const m of errors) log(`  ✗ ${m}`);
  if (!errors.length) log("  ✓ ผ่าน");
  return errors.length ? 1 : 0;
}
