// แผน DAG: นิยาม schema, การ normalize และ validation (ตรวจก่อน spawn ใดๆ)
// id ของ task ถูกใช้ประกอบชื่อไฟล์ใน runDir ทั้งอ่านและเขียน จึงต้องจำกัดด้วย pattern
export const TASK_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

// tier คงที่ของ role ที่ไม่ใช่งาน implement — planner เลือกเองไม่ได้ ยกเว้น frontend/backend-engineer
export const FIXED_ROLE_TIER = {
  planner: "t2",
  "project-manager": "t2",
  "business-analyst": "t2",
  "system-analyst": "t1",
  "uxui-designer": "t2",
  "database-administrator": "t2",
  "test-planner": "t2",
  qa: "t2",
  security: "t2",
};

// ลำดับสลับตัวรันเริ่มต้นเมื่อ tier ไม่ได้ประกาศ _fallback เอง
export const DEFAULT_AGENT_FALLBACK_ORDER = ["codex", "agy", "claude"];

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
  if (start === -1 || end === -1) throw new Error("ไม่พบ JSON ในคำตอบของ planner");
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

export function validateAndFixPlan(plan, cfg, opts) {
  if (typeof plan !== "object" || plan === null || Array.isArray(plan)) throw new Error("แผนต้องเป็น object ที่มี tasks");
  if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) throw new Error("plan.tasks ว่างหรือไม่ใช่ array");
  if ("humanGates" in plan && !Array.isArray(plan.humanGates)) throw new Error("humanGates ต้องเป็น array ของ string");
  if (Array.isArray(plan.humanGates) && plan.humanGates.some((g) => typeof g !== "string")) throw new Error("humanGates ต้องเป็น array ของ string");
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
  return plan;
}

export function printPlan(plan) {
  console.log(`\nแผนของ planner: ${plan.summary ?? ""}`);
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
}
