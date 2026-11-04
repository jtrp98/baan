// สถานะงาน + dependency + การ execute แผน DAG (เติม slot ทันทีที่ว่าง)
import path from "node:path";
import { classifyFailure } from "./failure-class.mjs";
import { appendEvent } from "./ledger.mjs";
import { roleDirective } from "./prompts.mjs";
import { buildArgs, runCli } from "./runner.mjs";
import { fallbackChainFor, transitiveFanOut } from "./plan.mjs";
import { readCheckpoint, writeAtomic, writeCheckpoint } from "./run-store.mjs";
import { resolveTimeout } from "./timeout.mjs";

const CONTEXT_CHAR_CAP = 6000; // ตัดรายละเอียด output ของ task ก่อนหน้ายาวเกิน (ส่ง path ฉบับเต็มแทน)
// สแกน state marker เฉพาะท้ายคำตอบตามสัญญา CONVENTIONS §8 "จบ handoff ด้วยสถานะเดียว" —
// marker ที่อยู่กลางเนื้อความอาจเป็นการพูดถึงเฉยๆ
const MARKER_WINDOW_CHARS = 800;
// output states ตาม CONVENTIONS §8 — DONE/PASS = สำเร็จ, ที่เหลือ = งานไม่สำเร็จ
export const STATE_MARKERS = ["DONE", "PASS", "FAIL", "BLOCKED", "NEEDS_DESIGN_CHANGE", "NEEDS_REQUIREMENT_CHANGE", "NEEDS_HUMAN"];

// หา marker ตัวสุดท้ายในหน้าต่างท้ายคำตอบ — ตัวสุดท้ายชนะเพราะบรรทัดจบคือคำตอบสุดท้ายของ role
export function detectStateMarker(answer) {
  if (!answer) return null;
  const tail = answer.slice(-MARKER_WINDOW_CHARS);
  let best = null;
  let bestIdx = -1;
  for (const m of STATE_MARKERS) {
    const re = new RegExp(`(?<![A-Za-z0-9_])${m}(?![A-Za-z0-9_])`, "g");
    let match;
    let last = -1;
    while ((match = re.exec(tail)) !== null) last = match.index;
    if (last > bestIdx) { bestIdx = last; best = m; }
  }
  return best;
}

// แปลงผลการรัน CLI หนึ่งงานเป็นสถานะงาน — แยกจาก exit code เพราะ role ตอบ NEEDS_*/FAIL
// ได้แม้รันจบ exit 0 (เคยทำให้ pipeline ปล่อยงานลูกต่อทั้งที่งานต้นไม่สำเร็จจริง)
export function classifyOutcome(r) {
  if (r.timedOut) return { state: "timeout", ok: false, marker: null };
  if (!r.ok) return { state: "failed", ok: false, marker: null };
  if (!r.answer || !r.answer.trim()) return { state: "failed", ok: false, marker: null };
  const marker = detectStateMarker(r.answer);
  if (marker && marker !== "DONE" && marker !== "PASS") return { state: marker.toLowerCase(), ok: false, marker };
  return { state: "completed", ok: true, marker };
}

export function statusLabel(rec) {
  if (rec.state === "completed") return "OK";
  if (rec.state === "timeout") return "TIMEOUT";
  if (rec.state === "failed") return `FAIL(exit=${rec.exitCode ?? "?"})`;
  if (rec.state === "blocked") return `BLOCKED(by=${(rec.blockedBy ?? []).join(",")})`;
  return (rec.marker ?? rec.state).toUpperCase();
}

// context ส่งต่อให้ task ถัดไป: สถานะ + เนื้อหา + path ฉบับเต็ม และต้องบอกเมื่อถูกตัด
// (acceptance criteria หรือ NEEDS_* มักอยู่ท้ายคำตอบ การตัดเงียบๆ เคยทำให้ task ถัดไปไม่รู้สถานะจริง)
function buildCtxBlocks(runDir, t, states) {
  return (t.dependsOn ?? []).map((d) => {
    const prev = states.get(d);
    const answerFile = path.join(runDir, `${d}.answer.txt`);
    if (!prev || prev.state !== "completed") {
      return `### Result of task ${d}: **this task did not succeed (${prev?.state ?? "no state"})** — do your work using information from the other tasks, and state the assumptions you used.`;
    }
    const full = prev.answer ?? "";
    const clipped = full.length > CONTEXT_CHAR_CAP;
    const body = clipped
      ? `${full.slice(0, CONTEXT_CHAR_CAP)}\n\n(⚠ truncated from the full ${full.length.toLocaleString()} characters — read the full version at ${answerFile})`
      : `${full}\n\n(the full version of this task's output is at ${answerFile})`;
    return `### Result of task ${d} (state: completed):\n${body}`;
  });
}

async function runRoleTask(cfg, opts, runDir, t, ctxBlocks, agent = t.agent) {
  const def = cfg.agents[agent];
  const conf = cfg.tiers[t.tier]?.[agent] ?? {};
  const answerFile = path.join(runDir, `${t.id}.answer.txt`);
  const timeoutSec = opts.timeoutSec;
  const prompt = roleDirective(t.role, t.task, ctxBlocks, opts.projectCtx, opts.date || undefined, t.testLevel ?? opts.testLevel);
  const args = buildArgs(def, conf.model ?? "", conf.effort ?? "", opts.write, answerFile, opts.workspaceRoot, opts.usage);
  if (def.promptVia === "arg") args.push(prompt);
  const base = { run: path.basename(runDir), taskIds: [t.id], role: t.role, tier: t.tier, agent, model: conf.model ?? "", effort: conf.effort ?? "", mode: opts.write ? "write" : "read-only" };
  appendEvent(opts.ledgerDir, { type: "call_start", ...base, promptBytes: Buffer.byteLength(prompt, "utf8") });
  const r = await runCli(def, args, def.promptVia, prompt, opts.cwd, timeoutSec, answerFile, { usage: opts.usage });
  appendEvent(opts.ledgerDir, { type: "call_end", ...base, startedAt: r.startedAt, durationMs: r.durationMs, cliOk: r.ok, exitCode: r.exitCode, timedOut: r.timedOut, usage: r.usage });
  return r;
}

// ตรวจว่าความล้มเหลวเกิดจากโควตา/limit หรือไม่ — ใช้ข้อความจริงที่แต่ละ CLI แจ้ง
// (claude: "usage limit reached" · codex: "usage limit" · agy: "credits balance ... too low to continue")
// จำกัดไว้เฉพาะรูปแบบเหล่านี้ เพราะ fail ด้วยเหตุอื่นต้องไม่สลับตัวรัน (กันเผาโควตาซ้ำหลายเท่า)
const LIMIT_ERROR_PATTERNS = ["usage limit", "rate limit", "ratelimit", "quota", "limit reached", "credits balance", "too low to continue"];

export function looksLikeLimitError(r) {
  if (r.ok || r.timedOut) return false;
  const hay = `${r.error ?? ""}\n${r.stderr ?? ""}\n${r.answer ?? ""}`.toLowerCase();
  return LIMIT_ERROR_PATTERNS.some((p) => hay.includes(p));
}

// ตัวรันไม่ได้ติดตั้งบนเครื่อง (spawn ตรงล้ม ENOENT หรือ shell ตอบ command not found / not recognized) —
// งานยังไม่ได้เริ่มรันจริงจึงสลับตัวถัดไปได้โดยไม่เสี่ยงเผาโควตาค่ายอื่นด้วยงานที่พัง (เหตุผลเดียวกับกรณีโควตา)
// ดูเฉพาะ error/stderr ของ process ไม่รวมคำตอบ — role อย่าง check อาจรายงาน "command not found"
// ของงานที่ตรวจ ซึ่งไม่ใช่อาการของตัวรันเอง
const MISSING_CLI_PATTERNS = [/spawn \S+ enoent/i, /command not found/i, /is not recognized as/i];
export function looksLikeMissingCli(r) {
  if (r.ok || r.timedOut) return false;
  const hay = `${r.error ?? ""}\n${r.stderr ?? ""}`;
  return MISSING_CLI_PATTERNS.some((p) => p.test(hay));
}

// โมเดลเต็มชั่วคราว (codex: "ERROR: Selected model is at capacity") หายเองในไม่กี่นาที — รอแล้วลองตัวเดิมซ้ำก่อน
// แทนการสลับค่ายทันที งานที่สั่ง --no-fallback จึงยังรอดได้เพราะไม่เปลี่ยนตัวรัน · ลองครบแล้วยังเต็มค่อยนับเป็นเหตุสลับ
// จับเฉพาะบรรทัดที่ CLI ประกาศ error เอง เพราะ stderr ของ codex มี transcript ของงานปนอยู่
const CAPACITY_ERROR_RE = /^(?:ERROR|AGY_ERROR|API Error|Error):.*\b(?:at capacity|overloaded)\b/im;
export const CAPACITY_RETRY_DELAYS_MS = [30_000, 90_000];

export function looksLikeCapacityError(r) {
  if (r.ok || r.timedOut) return false;
  return CAPACITY_ERROR_RE.test(`${r.error ?? ""}\n${r.stderr ?? ""}`);
}

// CLI เริ่มทำงานไม่ได้ — งานยังไม่ได้เริ่มจริง จึงสลับตัวถัดไปได้เหมือนกรณีไม่ได้ติดตั้ง
// school-bot 2026-11-03/04: codex "failed to initialize in-process app-server client: Access is denied" ล้มใน 0–1 วินาที
// 5 ครั้ง และ claude "couldn't reach Anthropic to load your organization's settings" — เดิมจบ failed ให้นายช่างสั่งใหม่เอง
// error เครือข่าย (DNS) นับเฉพาะเมื่อล้มเร็ว: ถ้าเกิดหลังทำงานไปนาน (agy เคยล้มหลัง 27 นาที) อาจแก้ไฟล์ไปแล้วบางส่วน
// การรันซ้ำด้วยค่ายอื่นจากศูนย์เสี่ยงทับงานครึ่งทาง ให้คนตัดสิน
const STARTUP_ERROR_PATTERNS = [/failed to initialize .*access is denied/i, /couldn.t reach .* settings/i];
const NETWORK_ERROR_RE = /getaddrinfo|ENOTFOUND|no data of the requested type|ECONNREFUSED/i;
export const STARTUP_WINDOW_MS = 60_000;

export function looksLikeStartupError(r) {
  if (r.ok || r.timedOut) return false;
  const hay = `${r.error ?? ""}\n${r.stderr ?? ""}`;
  if (STARTUP_ERROR_PATTERNS.some((p) => p.test(hay))) return true;
  return (r.durationMs ?? Infinity) < STARTUP_WINDOW_MS && NETWORK_ERROR_RE.test(hay);
}

export function switchReasonText(reason) {
  if (reason === "missing") return "ไม่ได้ติดตั้งบนเครื่อง";
  if (reason === "capacity") return "โมเดลยังเต็มหลังลองซ้ำครบ";
  if (reason === "startup") return "เริ่มทำงานไม่ได้ (สิทธิ์/เครือข่าย/ตั้งค่า)";
  return "ติดโควตา/limit";
}

const sleepMs = (ms) => new Promise((res) => setTimeout(res, ms));
export const capacityRetryText = (agent, n, total, delayMs) => `${agent} โมเดลเต็มชั่วคราว (at capacity) — รอ ${Math.round(delayMs / 1000)}s แล้วลองใหม่ (${n}/${total})`;
const logRetry = (...a) => console.log(capacityRetryText(...a));

// ลองตัวรันตามลำดับ chain — ไปตัวถัดไปเฉพาะเมื่อตัวปัจจุบันติดโควตา/limit, ไม่ได้ติดตั้งบนเครื่อง, เริ่มทำงานไม่ได้ หรือเต็มจนลองซ้ำครบ
// ใช้ร่วมทั้งงานในแผน, ขั้น planner และ baan-role เพื่อให้กติกาการสลับเป็นชุดเดียว
export async function runWithFallback(chain, attempt, onSwitch = () => {}, { retryDelaysMs = CAPACITY_RETRY_DELAYS_MS, sleep = sleepMs, onRetry = logRetry } = {}) {
  const trail = [];
  let r = null;
  let agent = chain[0];
  for (let i = 0; i < chain.length; i++) {
    agent = chain[i];
    r = await attempt(agent);
    for (let k = 0; k < retryDelaysMs.length && looksLikeCapacityError(r); k++) {
      onRetry(agent, k + 1, retryDelaysMs.length, retryDelaysMs[k]);
      await sleep(retryDelaysMs[k]);
      r = await attempt(agent);
    }
    const reason = looksLikeLimitError(r) ? "limit" : looksLikeMissingCli(r) ? "missing" : looksLikeStartupError(r) ? "startup" : looksLikeCapacityError(r) ? "capacity" : null;
    if (r.ok || reason === null || i + 1 >= chain.length) break;
    trail.push(`${chain[i]}→${chain[i + 1]}`);
    onSwitch(chain[i], chain[i + 1], reason);
  }
  return { r, agent, trail };
}

// execute คือจุดกัน --dry-run เดียวของทุก route (goal / --plan-file / --resume) —
// ให้ทุกทางเข้าต้องผ่าน funnels นี้ จึงไม่มี route ไหนหลุดไปเรียก provider จริงใน dry-run
// dependency ผ่านเฉพาะเมื่อ prerequisite state = completed; งานที่ dependency ล้ม = blocked
// (งานอิสระที่ไม่ติด blocker ยังทำต่อ) · runTask แทนที่ได้เพื่อทดสอบโดยไม่เรียก provider จริง
export async function execute(plan, opts, runDir, cfg, done, runTask = runRoleTask) {
  if (opts.dryRun) {
    const remaining = plan.tasks.filter((t) => !done.has(t.id)).length;
    console.log(`\n--dry-run: ยังไม่ execute (จะไม่เรียก provider เลย) — แผนมี ${plan.tasks.length} task, ค้างจาก run เดิม ${remaining} task · แผนอยู่ที่ ${path.join(runDir, "plan.json")}`);
    return { ok: true, dryRun: true, summary: null };
  }
  console.log(`\nเริ่ม execute (max ${opts.maxParallel} ขนาน, ${opts.write ? "write" : "read-only"})...`);
  const pending = plan.tasks.filter((t) => !done.has(t.id)).map((t) => ({ ...t }));
  const states = done; // id → record ที่มี state (preload ใส่เฉพาะ completed)
  // งานที่มีงานอื่นพึ่งมาก (ทั้งทางตรงและทางอ้อม) ได้ slot ก่อน — ปลดงานปลายทางเร็วกว่า · เท่ากันใช้ลำดับในแผน
  const fanOut = transitiveFanOut(plan.tasks.map((t) => ({ id: t.id, dependsOn: t.dependsOn ?? [] })));
  const running = new Map(); // id → Promise ของผลงาน
  let maxRunning = 0;

  const runOne = async (t) => {
    const startedAt = new Date().toISOString();
    const ctxBlocks = buildCtxBlocks(runDir, t, states);
    // ลำดับตัวรัน: ตัวที่เลือกมาก่อน — สลับตัวถัดไปเฉพาะเมื่อตัวปัจจุบันติดโควตา/limit กลางคัน
    // (cfg ที่ไม่รู้จัก agent เลย เช่นตอนทดสอบ = เรียกตัวเดิมหนึ่งครั้งตามปกติ)
    const tryChain = fallbackChainFor(cfg, t.tier, t.agent);
    const chain = tryChain.length ? tryChain : [t.agent];
    const { r, agent: usedAgent, trail: fallbackTrail } = await runWithFallback(
      chain,
      (agent) => runTask(cfg, { ...opts, timeoutSec: resolveTimeout(opts, cfg.tiers?.[t.tier]) }, runDir, t, ctxBlocks, agent),
      (from, to, reason) => console.log(`  ${t.id}: ${from} ${switchReasonText(reason)} — สลับไป ${to} (ตามลำดับ fallback ของ tier ${t.tier})`),
      { onRetry: (...a) => console.log(`  ${t.id}: ${capacityRetryText(...a)}`) },
    );
    t.agent = usedAgent;
    return { t, r, fallbackTrail, startedAt };
  };

  // เติม slot ทันทีที่ว่าง (charter ข้อ 7) — เดิมรอทั้ง wave จบก่อนคำนวณงานถัดไป งานที่ dependency ผ่านแล้ว
  // จึงต้องรองานที่ยาวที่สุดใน wave ทั้งที่มี slot ว่าง
  const fill = () => {
    const ready = pending
      .filter((t) => !running.has(t.id) && (t.dependsOn ?? []).every((d) => states.get(d)?.state === "completed"))
      .sort((a, b) => (fanOut.get(b.id) ?? 0) - (fanOut.get(a.id) ?? 0));
    for (const t of ready) {
      if (running.size >= opts.maxParallel) break;
      console.log(`\n── เริ่ม ${t.id}(${t.role}/${t.tier}@${t.agent})${running.size ? ` · กำลังรันอยู่: ${[...running.keys()].join(", ")}` : ""} ──`);
      running.set(t.id, runOne(t));
    }
    maxRunning = Math.max(maxRunning, running.size);
  };

  fill();
  while (running.size) {
    const { t, r, fallbackTrail, startedAt } = await Promise.race(running.values());
    running.delete(t.id);
    pending.splice(pending.findIndex((p) => p.id === t.id), 1);
    writeAtomic(path.join(runDir, `${t.id}.answer.txt`), r.answer ?? "");
    writeAtomic(path.join(runDir, `${t.id}.stderr.txt`), r.stderr ?? "");
    const cls = classifyOutcome(r);
    const prior = readCheckpoint(runDir, t.id);
    const rec = {
      id: t.id,
      agent: t.agent,
      state: cls.state,
      ok: cls.ok,
      marker: cls.marker,
      exitCode: r.exitCode ?? null,
      timedOut: !!r.timedOut,
      error: r.error || "",
      startedAt,
      durationMs: r.durationMs ?? 0,
      failureClass: classifyFailure({ state: cls.state, answer: r.answer, error: r.error }),
      usage: r.usage ?? null,
      attempt: (typeof prior?.attempt === "number" ? prior.attempt : 0) + 1,
      fallback: fallbackTrail,
      finishedAt: new Date().toISOString(),
      answerFile: path.join(runDir, `${t.id}.answer.txt`),
      stderrFile: path.join(runDir, `${t.id}.stderr.txt`),
    };
    writeCheckpoint(runDir, rec);
    appendEvent(opts.ledgerDir, { type: "task_result", run: path.basename(runDir), taskIds: [t.id], role: t.role, agent: rec.agent, state: rec.state, failureClass: rec.failureClass, fallback: fallbackTrail });
    states.set(t.id, { ...rec, answer: r.answer ?? "" });
    console.log(`  ${t.id} ${statusLabel(rec)} in ${((r.durationMs ?? 0) / 1000).toFixed(1)}s${fallbackTrail.length ? ` (สลับตัวรัน: ${fallbackTrail.join(", ")})` : ""} — ${t.title}`);
    if (!rec.ok) console.log(`    สถานะ: ${rec.state} · stderr: ${rec.stderrFile}`);
    fill();
  }
  // เหลือใน pending = ถูกกั้นด้วย dependency ที่ไม่สำเร็จ (cycle ถูกกันตอน validate แล้ว)

  for (const t of pending) {
    const blockedBy = (t.dependsOn ?? []).filter((d) => states.get(d)?.state !== "completed");
    const rec = { id: t.id, state: "blocked", ok: false, marker: null, blockedBy, finishedAt: new Date().toISOString() };
    writeCheckpoint(runDir, rec);
    states.set(t.id, rec);
    console.log(`  ${t.id} ${statusLabel(rec)} — ${t.title}`);
  }

  const summary = {
    finishedAt: new Date().toISOString(),
    tasks: plan.tasks.map((t) => {
      const s = states.get(t.id);
      return {
        id: t.id, role: t.role, agent: s?.agent ?? t.agent, tier: t.tier, title: t.title,
        state: s?.state ?? "pending", ok: s?.ok ?? false, marker: s?.marker ?? null,
        blockedBy: s?.blockedBy, startedAt: s?.startedAt ?? null, durationMs: s?.durationMs ?? 0, failureClass: s?.failureClass ?? null,
      };
    }),
    humanGates: plan.humanGates ?? [],
    runDir,
  };
  writeAtomic(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2));

  const allCompleted = plan.tasks.every((t) => states.get(t.id)?.state === "completed");
  const counts = {};
  for (const t of plan.tasks) { const s = states.get(t.id)?.state ?? "pending"; counts[s] = (counts[s] ?? 0) + 1; }
  console.log(`\n======== สรุป นายช่าง ========`);
  console.log(`สถานะ ${plan.tasks.length} task: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" · ")} · ขนานสูงสุด ${maxRunning} · รายงาน: ${runDir}`);
  const needs = plan.tasks.filter((t) => (states.get(t.id)?.state ?? "").startsWith("needs_"));
  if (needs.length) {
    console.log(`งานที่หยุดเพราะเจอปัญหาเหนืออำนาจ role (NEEDS_*):`);
    needs.forEach((t) => console.log(`  - ${t.id}: ${states.get(t.id).marker} — ${t.title}`));
  }
  const blockedList = plan.tasks.filter((t) => states.get(t.id)?.state === "blocked");
  if (blockedList.length) {
    console.log(`งานที่ถูกกั้นเพราะ dependency ไม่สำเร็จ:`);
    blockedList.forEach((t) => console.log(`  - ${t.id} (โดนกั้นด้วย ${(states.get(t.id).blockedBy ?? []).join(", ")}) — ${t.title}`));
  }
  if (summary.humanGates.length) {
    console.log(`ประตูมนุษย์ที่รอคำตัดสิน:`);
    summary.humanGates.forEach((g, i) => console.log(`  ${i + 1}. ${g}`));
  }
  if (!allCompleted) console.log(`แก้ปัญหาแล้วต่อได้ด้วย: baan --resume "${runDir}" (task ที่ completed แล้วจะถูกข้าม)`);
  return { ok: allCompleted, dryRun: false, summary };
}
