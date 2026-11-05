import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { loadWorkspace, loadAgentsConfig, resolveWorkspaceConfig, resolveTarget, resolveModules } from "../config.mjs";
import { fromPlan, validatePacket, assertId, readiness, checkDag, documentBasis } from "./packet.mjs";
import { loadRun, save, persist, event, readJson } from "./store.mjs";
import { callSession } from "./session.mjs";
import { schedule } from "./scheduler.mjs";
import { triage } from "./triage.mjs";
import { lock, alive } from "./repolock.mjs";
import { integrate } from "./integrate.mjs";
import { applyPlanning } from "./planner.mjs";

export function parse(argv) {
  const o = { command: ["run", "status", "report", "inbox", "decide"].includes(argv[0]) ? argv.shift() : "run" };
  const flags = new Set(["direct", "dry-run", "write", "approve", "allow-dirty"]);
  const values = new Set(["goal", "goal-file", "target", "cwd", "workspace", "config", "plan", "plan-file", "packet", "select", "resume", "run", "cancel", "owns", "acceptance", "source", "build", "test", "test-full", "setup", "agent", "tier", "planner-tier", "timeout", "max-parallel", "decision", "by", "module"]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { if (o.subject) throw new Error(`unexpected argument ${a}`); o.subject = a; continue; }
    const name = a.slice(2);
    if (flags.has(name)) o[name] = true;
    else if (values.has(name)) { if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`${a} requires a value`); o[name] = argv[++i]; }
    else throw new Error(`unknown option ${a}`);
  }
  return o;
}
export function report(run) {
  return { id: run.id, dir: run.dir, mode: run.mode, ok: run.packages.every((p) => p.state === "done"),
    packages: run.packages.map((p) => ({ id: p.id, tasks: p.tasks, state: p.state, failureClass: p.failureClass, durationMs: p.durationMs,
      evidence: p.gate ? path.join(run.dir, `${p.id}.evidence.json`) : null, verdict: p.verdict, questions: p.questions ?? [], acceptance: p.acceptance })) };
}
export function decide(run, id, o) {
  const p = run.packages.find((p) => p.id === id);
  if (!p) throw new Error(`unknown package ${id}`);
  if (!o.source || !o.decision) throw new Error("decide requires --decision and --source");
  if ((o.approve || o["allow-dirty"]) && o.by !== "user") throw new Error("approval requires --by user");
  if (o.approve) Object.assign(p, { acceptance_approved: true, approved_by: o.by, approved_at: new Date().toISOString() });
  if (o["allow-dirty"]) p.dirty_approved = true;
  p.decisions = [...(p.decisions ?? []), { text: o.decision, source: o.source, by: o.by ?? "source", at: new Date().toISOString() }];
  p.rev = (p.rev ?? 0) + 1; p.questions = []; p.state = "pending";
  if (p.basis) delete p.basis;
  const cancelFile = path.join(run.dir, `cancel-${p.id}.json`);
  if (existsSync(cancelFile)) unlinkSync(cancelFile);
  event(run, "decision", { package: p.id, ...p.decisions.at(-1), rev: p.rev }); persist(run);
}
export async function cli(argv, options = {}) {
  const o = parse([...argv]);
  const configFile = resolveWorkspaceConfig(o.config);
  const ws = loadWorkspace(configFile);
  const root = path.resolve(o.workspace || (configFile ? path.dirname(configFile) : process.cwd()));
  const cfg = options.cfg ?? loadAgentsConfig();
  if (["status", "report", "inbox", "decide"].includes(o.command) || o.resume || o.cancel) {
    const run = loadRun(root, o.resume || o.run || (["status", "report", "inbox"].includes(o.command) ? o.subject : ""));
    if (o.cancel) {
      const id = assertId(o.cancel);
      const p = run.packages.find((p) => p.id === id);
      if (!p) throw new Error(`unknown package ${id}`);
      save(path.join(run.dir, `cancel-${id}.json`), { at: new Date().toISOString() });
      if (!run.pid || !alive(run.pid)) {
        if (Number.isInteger(p.childPid) && p.childPid > 0 && p.childPid !== process.pid && alive(p.childPid)) {
          if (process.platform === "win32") execFileSync("taskkill", ["/PID", String(p.childPid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
          else process.kill(p.childPid, "SIGKILL");
        }
        if (p.state !== "done") p.state = "cancelled";
        persist(run);
      }
      return { cancelled: id, dir: run.dir };
    }
    if (o.command === "decide") {
      const release = lock(run.root, `run:${run.dir}`);
      try { decide(run, assertId(o.subject), o); } finally { release(); }
      return report(run);
    }
    if (o.command === "inbox") return report(run).packages.filter((p) => p.questions.length || p.state === "waiting_human");
    if (!o.resume) return report(run);
    return executeRun(run, cfg, options, o["dry-run"]);
  }
  const hit = o.target ? resolveTarget(ws, o.target) : null;
  if (o.target && !hit) throw new Error(`unknown target ${o.target}`);
  const modules = o.module ? resolveModules(ws, o.module) : [];
  const moduleTargets = [...new Set(modules.map((m) => m.target?.path).filter(Boolean))];
  if (!o.target && !o.cwd && moduleTargets.length > 1 && !o.plan && !o.packet) throw new Error("หลาย repo: เตรียม --plan ที่ระบุ repo ของแต่ละ package ก่อน");
  const repo = path.resolve(hit?.target.path || o.cwd || moduleTargets[0] || process.cwd());
  const planFile = o.plan || o["plan-file"] || o.packet;
  let packages, integration = [];
  if (planFile) {
    const input = readJson(path.resolve(planFile));
    const plan = o.packet ? { packages: [input] } : input;
    packages = fromPlan(plan, { repo, select: o.select, baseDir: path.dirname(path.resolve(planFile)), knowledgeRoot: hit?.knowledgeRoot.path || modules[0]?.knowledgeRoot.path });
    integration = plan.integration ?? [];
    if (!Array.isArray(integration) || integration.some((x) => typeof x.command !== "string" || !x.command || !Array.isArray(x.packages) || !x.packages.length || x.packages.some((id) => !packages.some((p) => p.id === id)))) throw new Error("invalid integration command/packages");
  } else {
    const goal = o.goal || (o["goal-file"] ? readFileSync(o["goal-file"], "utf8").trim() : "");
    if (!goal) throw new Error("ระบุ --goal / --plan / --packet; ขั้น 0: /pencil เพื่อเตรียม acceptance");
    const ac = o.acceptance || goal;
    const p = { id: "WP-1", title: goal.slice(0, 100), goal, tasks: [], repo: { path: repo },
      owns: o.owns?.split(",") ?? ["**"], read_first: [], depends_on: [], risk: "low",
      acceptance: [{ id: "AC-1", text: ac, source: o.source || "user goal (awaiting confirmation)" }],
      commands: { setup: o.setup || "", build: o.build || "", test_targeted: o.test || "", test_full: o["test-full"] || o.test || "" } };
    validatePacket(p); packages = [p];
  }
  const run = { version: 2, id: `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`, root,
    packages: packages.map((p) => ({ ...p, basis: { docs: documentBasis(p) }, state: "pending" })), tier: o.tier || "t2", plannerTier: o["planner-tier"] || ws.defaults.planner_tier,
    agent: o.agent || ws.defaults.agent, timeoutSec: Number(o.timeout || ws.defaults.timeout_sec), maxParallel: Number(o["max-parallel"] || ws.defaults.max_parallel),
    direct: !!o.direct, integration, createdAt: new Date().toISOString() };
  if (!cfg.agents[run.agent] || !cfg.tiers[run.tier] || !cfg.tiers[run.plannerTier]) throw new Error("unknown agent/tier");
  if (!Number.isInteger(run.maxParallel) || run.maxParallel < 1 || run.maxParallel > 64 || !(run.timeoutSec > 0)) throw new Error("invalid --max-parallel/--timeout");
  run.dir = path.join(root, ".baan", "runs", run.id);
  if (o["dry-run"]) return { ...triage(packages, run.direct), packages: packages.map((p) => ({ ...p, readiness: readiness(p) })) };
  mkdirSync(run.dir, { recursive: true }); persist(run);
  event(run, "run_created");
  return executeRun(run, cfg, options);
}
async function executeRun(run, cfg, options, dry = false) {
  if (dry) return report(run);
  const release = lock(run.root, `run:${run.dir}`);
  run.pid = process.pid;
  try {
    const selection = triage(run.packages, run.direct); run.mode = selection.mode;
    event(run, "triage", selection); persist(run);
    if (run.packages.some((p) => readiness(p).length)) { await schedule(run, cfg, options); return report(run); }
    if (run.mode !== "direct" && !run.planned) {
      let result, error;
      const context = { packages: run.packages, questions: [] };
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          result = await (options.session ?? callSession)(run, run.packages[0], "planner", cfg, { ...options, context: { ...context, validation_error: error?.message } });
          const revised = applyPlanning(run.packages, result);
          const replacements = new Map(run.packages.map((p) => [p.id, revised.filter((r) => r.id === p.id || r.parent_id === p.id).map((r) => r.id)]));
          for (const test of run.integration ?? []) test.packages = [...new Set(test.packages.flatMap((id) => replacements.get(id) ?? [id]))];
          run.sourcePackages ??= run.packages;
          run.packages = revised;
          for (const q of result.questions) q.blocks = [...new Set(q.blocks.flatMap((id) => replacements.get(id) ?? [id]))];
          error = null; break;
        } catch (e) { error = e; }
      }
      if (error) { for (const p of run.packages) { p.state = "blocked"; p.questions = [error.message]; } persist(run); return report(run); }
      for (const q of result.questions) for (const p of run.packages.filter((p) => q.blocks.includes(p.id))) { p.state = "waiting_human"; p.questions = [...(p.questions ?? []), q.text]; }
      run.planned = true;
      if (result.questions.length) { event(run, "inbox_ready"); persist(run); return report(run); }
    }
    do {
      await schedule(run, cfg, options);
      if (run.packages.some((p) => p.state === "pending")) break;
      await integrate(run, options);
    } while (run.packages.some((p) => p.state === "pending"));
    return report(run);
  } finally { delete run.pid; persist(run); release(); }
}
