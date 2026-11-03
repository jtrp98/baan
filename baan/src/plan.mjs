// แผน DAG: นิยาม schema, การ normalize และ validation (ตรวจก่อน spawn ใดๆ)
// id ของ task ถูกใช้ประกอบชื่อไฟล์ใน runDir ทั้งอ่านและเขียน จึงต้องจำกัดด้วย pattern
export const TASK_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

import { existsSync } from "node:fs";
import path from "node:path";
import { TEST_LEVELS, resolveRoleName } from "./config.mjs";

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
// ทีมออกแบบ — คุยกับผู้ใช้สดและแตะ canvas จึงไม่มี tier ของตัวรัน ("> tier: interactive" ในหัวไฟล์)
export const DESIGN_ROLES = ["survey", "ui", "review"];

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
  const list = (v) => (Array.isArray(v) ? v : []);
  // ระดับที่ verdict ใช้ตัดสิน (charter ข้อ 14) — ไม่มีฟิลด์ = null: ledger ก่อนมีระดับตรวจแบบเต็มเสมอ
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
    // ค่าดิบเก็บไว้ให้ lint บอกค่าผิดได้ — ไม่มีฟิลด์ = null (แผนเก่า)
    risk: typeof t.risk === "string" ? t.risk.trim().toLowerCase() : (t.risk ?? null),
    wave: t.wave ?? null,
    tier: typeof t.tier === "string" ? t.tier.trim().toLowerCase() : null,
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

// จำนวนงานที่พึ่ง task นี้ทั้งทางตรงและทางอ้อม = ขนาดความเสียหายถ้า task นี้ผิดแล้วเจอช้า
export function transitiveFanOut(tasks) {
  const children = new Map(tasks.map((t) => [t.id, []]));
  for (const t of tasks) for (const d of t.dependsOn) children.get(d)?.push(t.id);
  const memo = new Map();
  const reach = (id) => {
    if (memo.has(id)) return memo.get(id);
    memo.set(id, new Set()); // กันวนลูป — cycle ถูกรายงานแยกโดย findDependencyCycle
    const all = new Set();
    for (const c of children.get(id) ?? []) { all.add(c); for (const x of reach(c)) all.add(x); }
    memo.set(id, all);
    return all;
  };
  return new Map(tasks.map((t) => [t.id, reach(t.id).size]));
}

export const RISK_LEVELS = ["high", "low"];

// lint การตรวจตามความเสี่ยง (risk-gated waves, charter ข้อ 13) — ที่มา: school-bot (2026-10-29) มี 35/110 task
// ไม่มี ac_ids รวมงานฐานรากที่มีงานพึ่งทางอ้อม 79–89 งาน จึงตรึงเส้นชัยไม่ได้และตัดสินไม่ได้ว่าต้องตรวจทันทีหรือรอ gate
// error เกิดเฉพาะเมื่อแผนใส่ risk/wave ค่าผิด แผนเก่าที่ไม่มีฟิลด์จึงไม่ตก
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
  // ไม่มี oracle ถูกเตือนบรรทัดบนแล้ว — บรรทัดนี้เฉพาะ ledger ที่มีครึ่งเดียว
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
  // รอบตกของงาน high = writer + check บนคิว writer เดียว แพงกว่าส่วนต่างค่า model (charter ข้อ 2) — school-bot
  // 2026-11-03 งาน high ฝั่ง backend ทุกงานตั้ง t3 และเวลา rework รวมมากกว่าเวลาเขียนรอบแรก
  const weakHigh = open.filter((t) => t.risk === "high" && ["sys", "front"].includes(t.role) && /^t[3-5]$/.test(t.tier ?? ""));
  if (weakHigh.length) warnings.push(`task high ที่ writer ใช้ tier ต่ำกว่า t2 ${weakHigh.length} งาน — ตกหนึ่งรอบเสีย writer + check บนคิวเดียว ตั้ง t2 ขึ้นไป: ${labels(weakHigh.map((t) => `${t.id}@${t.tier}`))}`);
  const waveSizes = new Map();
  for (const t of tasks) if (isWave(t.wave)) waveSizes.set(t.wave, (waveSizes.get(t.wave) ?? 0) + 1);
  // 6 = เพดานขนาด wave (3–6 task) ใน roles/gm.md — diff ทั้ง wave ใหญ่กว่านี้ผู้ตรวจ gate ใบเดียวเริ่มหลุด (recall ตกตามขนาดก้อน)
  const bigWaves = [...waveSizes].filter(([, n]) => n > 6).sort(([a], [b]) => a - b);
  if (bigWaves.length) warnings.push(`wave ที่มีเกิน 6 task: ${bigWaves.map(([w, n]) => `wave ${w} (${n})`).join(", ")} — แบ่ง wave ให้ check ใบเดียวต่อ gate ยังตรวจทั่วถึง`);
  const riskCounts = { high: 0, low: 0, unrated: 0 };
  for (const t of tasks) riskCounts[RISK_LEVELS.includes(t.risk) ? t.risk : "unrated"]++;
  const waves = new Set(tasks.map((t) => t.wave).filter(isWave)).size;
  const used = tasks.some((t) => t.risk !== null || t.wave !== null);
  return { errors, warnings, fanOut, foundations, riskCounts, waves, used };
}

export const PLAN_STATUSES = ["pending", "done-local", "verified", "blocked"];

// สถานะที่ task ควรเป็นตาม slices — task ที่ไม่มี slices ใช้สถานะของตัวเอง (แผนเก่าไม่มีฟิลด์นี้)
export function deriveTaskStatus(t) {
  if (!t.slices.length) return t.status;
  const covered = new Set(t.slices.filter((s) => s.status === "verified").flatMap((s) => s.acIds));
  if (t.acIds.length && t.acIds.every((a) => covered.has(a))) return "verified";
  if (t.slices.some((s) => s.status === "done-local" || s.status === "verified")) return "done-local";
  return "pending";
}

// lint ความคืบหน้า — ที่มา: school-bot (2026-10-28) คิวบอก 21 งาน local ready แต่ JSON ไม่มี done-local สักงาน
// และ verified ต้องครอบทั้ง task ขณะที่งานจริงเดินทีละ slice จึงไม่มีงานโค้ดไหนดูเหมือนเสร็จเลย
// error = สถานะอ้างเกินหลักฐาน (กระทบ exit code) · warning = ความคืบหน้าที่มีจริงแต่ไม่ถูกลง (ไม่กระทบ)
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
  // 5 = ค่าเดียวกับ time-box ใบงานเอกสารล้วน 5 ใบในกติกาข้อ 10 ของ charter
  if (impl.length && implProgress.verified + implProgress.doneLocal === 0 && docsVerified >= 5) {
    warnings.push(`งานเอกสาร verified แล้ว ${docsVerified} งาน แต่งาน implement ${impl.length} งานยังไม่มี done-local/verified เลย — ลง done-local ให้งานที่ test ผ่านในเครื่องแล้ว หรือเปิด slice โค้ดถัดไป`);
  }
  const slices = tasks.flatMap((t) => t.slices);
  return { errors, warnings, implProgress, slices: { verified: slices.filter((s) => s.status === "verified").length, total: slices.length } };
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
    // งานที่ verified แล้วผ่านประตูของมันมาแล้ว — ที่มา: school-bot (2026-10-29) SA-002/UX-002/UX-004 ตรวจผ่านแล้ว
    // แต่ยังถูกนับว่าขวางงานที่พึ่ง 31 งาน
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

// แผนของ project (layout "project": <project>/build/plan/) — task บอก module ที่ทำด้วยช่อง `module`
// (ข้าม module = array · ข้าม project = "<project>/<module>") ให้ run ราย module หยิบเฉพาะงานของตัวเองได้
// หา project จากตำแหน่งไฟล์: โฟลเดอร์แม่ตัวแรกที่มี modules/ · ไม่เจอ = แผนแบบเดิม ไม่ตรวจ
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

// lint แผนโปรเจกต์ (เช่น plan\tasks-*.json ของ gm) — คืน exit code: 0 ผ่าน · 1 มี error
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
