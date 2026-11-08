import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadWorkspace, loadAgentsConfig, resolveWorkspaceConfig, resolveTarget, resolveModules, collectWorkspaceAddDirs } from "./config.mjs";
import { fromPlan, validatePacket, assertId, readiness, documentBasis, approvalBasis } from "./packet.mjs";
import { loadRun, save, persist, event, readJson } from "./store.mjs";
import { callSession, nativeCommand } from "./session.mjs";
import { schedule } from "./scheduler.mjs";
import { triage } from "./triage.mjs";
import { lock, alive, repoLock } from "./repolock.mjs";
import { snapshot, sameState, changedFiles, matches } from "./snapshot.mjs";
import { integrate } from "./integrate.mjs";
import { applyPlanning } from "./planner.mjs";
import { validateTimeout, resolveTimeout } from "./timeout.mjs";
import { utility, utilityFlags } from "./utilities.mjs";
import { moduleContext } from "./workspace.mjs";
import { getAdapter } from "./adapters/registry.mjs";
import { runParityCommand } from "./parity.mjs";
import { runInteractiveCli } from "./runner.mjs";

export function parse(argv) {
  const o = { command: ["run", "status", "report", "inbox", "decide", "sync", "survey", "scan", "parity", "attach", "update-clis"].includes(argv[0]) ? argv.shift() : "run" };
  if (o.command === "sync") o.sync = true;
  if (o.command === "survey" || o.command === "scan") o.survey = true;
  const flags = new Set(["direct", "dry-run", "approve", "allow-dirty", "help", "version", "init", "list", "commit", "index", "lint-knowledge", "sync", "pull-only", "push", "no-self-update", "all", "survey", "scan", "json", "drift", "interactive", "allow-bypass", "allow-fallback", "native-defaults", "worktree"]);
  const values = new Set(["goal", "goal-file", "target", "cwd", "workspace", "config", "plan", "plan-file", "packet", "select", "resume", "run", "cancel", "owns", "acceptance", "source", "build", "test", "test-full", "setup", "agent", "tier", "planner-tier", "timeout", "max-parallel", "decision", "by", "module", "gate", "knowledge-git", "memory-git", "lint-plan", "repair-mojibake", "sweep", "sweep-in", "scaffold-module", "scaffold-project", "project", "execution-mode", "permission-policy", "approval-policy", "model", "effort", "idle-timeout", "provider-arg", "provider-env"]);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { if (o.subject) throw new Error(`unexpected argument ${a}`); o.subject = a; continue; }
    const name = a.slice(2);
    if (flags.has(name)) o[name] = true;
    else if (values.has(name)) {
      if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`${a} requires a value`);
      const value = argv[++i];
      if (["sweep", "sweep-in", "provider-arg", "provider-env"].includes(name)) (o[name] ??= []).push(value);
      else { if (Object.hasOwn(o, name)) throw new Error(`duplicate option ${a}`); o[name] = value; }
    }
    else throw new Error(`unknown option ${a}`);
  }
  const inputs = [o.goal, o["goal-file"], o.plan, o["plan-file"], o.packet].filter(Boolean);
  if (utilityFlags.some((f) => o[f]) && (inputs.length || o.resume || o.cancel || (!["run", "sync", "survey", "scan"].includes(o.command)))) throw new Error("workspace utilities cannot be combined with execution commands");
  if (inputs.length > 1 || (o.resume && inputs.length) || (o.cancel && (inputs.length || o.resume))) throw new Error("choose one input: goal / plan / packet / resume / cancel");
  if (o.timeout !== undefined) validateTimeout(Number(o.timeout));
  if (o["max-parallel"] !== undefined && (!Number.isInteger(Number(o["max-parallel"])) || Number(o["max-parallel"]) < 1 || Number(o["max-parallel"]) > 64)) throw new Error("invalid --max-parallel (1–64)");
  if (o["dry-run"] && (o.cancel || o.command === "decide" || (utilityFlags.some((f) => o[f]) && !o.sync && !o["repair-mojibake"]))) throw new Error("--dry-run applies only to run/resume");
  if (o.command !== "decide" && (o.approve || o["allow-dirty"] || o.gate)) throw new Error("approvals require decide");
  if (["survey", "scan"].includes(o.command) && o.subject && !o.target) {
    o.target = o.subject;
    delete o.subject;
  }
  if (o.subject && !["status", "report", "inbox", "decide", "attach"].includes(o.command)) throw new Error(`unexpected argument ${o.subject}`);
  return o;
}

export function report(run) {
  return { id: run.id, dir: run.dir, mode: run.mode, executionMode: run.executionMode ?? "headless", permissionPolicy: run.permissionPolicy ?? "native-safe", ok: run.packages.length > 0 && run.packages.every((p) => p.state === "done") && (run.integration ?? []).every((check) => check.evidence?.ok), integration: run.integration ?? [],
    packages: run.packages.map((p) => ({ id: p.id, tasks: p.tasks, state: p.state, failureClass: p.failureClass, durationMs: p.durationMs,
      evidence: p.gate?.evidence_file ?? (p.gate ? path.join(run.dir, `${p.id}.evidence.json`) : null), verdict: p.verdict, questions: p.questions ?? [], acceptance: p.acceptance })) };
}

export function decide(run, id, o) {
  const p = run.packages.find((p) => p.id === id);
  if (!p) throw new Error(`unknown package ${id}`);
  if (!o.source?.trim() || !o.decision?.trim()) throw new Error("decide requires --decision and --source");
  if (o.by !== "user") throw new Error("human decision/approval requires --by user");
  if (o.gate && !p.human_gates?.some((g) => g.id === o.gate)) throw new Error(`unknown human gate ${o.gate}`);
  const at = new Date().toISOString();
  if (o.approve) Object.assign(p, { acceptance_approved: true, approved_by: o.by, approved_at: at, approved_source: o.source, approved_basis: approvalBasis(p) });
  if (o.gate) (p.gate_approvals ??= {})[o.gate] = { by: "user", at, source: o.source, basis: approvalBasis(p) };
  if (o["allow-dirty"]) p.dirty_approved = true;
  p.decisions = [...(p.decisions ?? []), { text: o.decision, source: o.source, by: o.by ?? "source", at: new Date().toISOString() }];
  p.rev = (p.rev ?? 0) + 1; p.questions = []; p.state = "pending";
  if (o.approve) delete p.basis;
  const cancelFile = path.join(run.dir, `cancel-${p.id}.json`);
  if (existsSync(cancelFile)) unlinkSync(cancelFile);
  event(run, "decision", { package: p.id, ...p.decisions.at(-1), rev: p.rev }); persist(run);
}

export async function cli(argv, options = {}) {
  const o = parse([...argv]);
  if (!argv.length) o.help = true;
  if (o.help || o.version) return utility(o);
  const configFile = resolveWorkspaceConfig(o.config, o.workspace || o.cwd || process.cwd());
  const ws = loadWorkspace(configFile);
  const root = path.resolve(o.workspace || (configFile ? path.dirname(configFile) : process.cwd()));
  const cfg = options.cfg ?? loadAgentsConfig();
  if (utilityFlags.some((f) => o[f])) return utility(o, ws, cfg, root);

  if (o.command === "update-clis") {
    const { updateClis } = await import("./update-clis.mjs");
    return updateClis();
  }

  if (o.command === "parity") {
    const repo = o.cwd ? path.resolve(o.cwd) : root;
    return runParityCommand({ agent: o.agent, cwd: repo, workspaceRoot: root, json: o.json, cfg });
  }

  if (o.command === "attach") {
    if (!o.subject) throw new Error("attach requires a package id");
    const run = loadRun(root, o.run || o.resume || "");
    const p = run.packages.find((pkg) => pkg.id === assertId(o.subject));
    if (!p) throw new Error(`unknown package ${o.subject}`);
    if (!p.session?.id) throw new Error(`package ${p.id} has no saved native session to attach to`);
    const agent = p.session.agent || run.agent;
    const adapter = getAdapter(agent, cfg);
    const nativeDef = nativeCommand(cfg.agents[agent], agent).def;
    const inv = adapter.buildInteractive({
      def: nativeDef,
      model: o.model ?? run.model ?? "",
      effort: o.effort ?? run.effort ?? "",
      permissionPolicy: run.permissionPolicy,
      workspaceRoot: run.root,
      addDirs: collectWorkspaceAddDirs(ws, p, run.root),
      session: p.session,
      providerArgs: o["provider-arg"],
    });
    const res = await runInteractiveCli(inv.command, inv.args, p.repo.path, inv.env);
    p.after = snapshot(p.repo.path);
    persist(run);
    return { attached: p.id, sessionId: p.session.id, exitCode: res.exitCode, durationMs: res.durationMs };
  }

  if (["status", "report", "inbox", "decide"].includes(o.command) || o.resume || o.cancel) {
    const run = loadRun(root, o.resume || o.run || (["status", "report", "inbox"].includes(o.command) ? o.subject : ""));
    if (o.cancel) {
      const id = assertId(o.cancel);
      const p = run.packages.find((p) => p.id === id);
      if (!p) throw new Error(`unknown package ${id}`);
      if (p.state === "done") throw new Error(`package ${id} is already done`);
      save(path.join(run.dir, `cancel-${id}.json`), { at: new Date().toISOString() });
      if (!run.pid || !alive(run.pid)) {
        // An orphan PID may have been reused; only its owning live runner may kill it.
        if (Number.isInteger(p.childPid) && alive(p.childPid)) throw new Error(`cancel recorded; orphan CLI may still run: ${p.childPid}. Stop the original process before resume.`);
        if (p.state !== "done") p.state = "cancelled";
        persist(run);
      }
      return { cancelled: id, dir: run.dir };
    }
    if (o.command === "decide") {
      if (!o.subject) throw new Error("decide requires a package id");
      const release = lock(run.root, `run:${run.dir}`);
      try { decide(run, assertId(o.subject), o); } finally { release(); }
      return report(run);
    }
    if (o.command === "inbox") return report(run).packages.filter((p) => p.questions.length || p.state === "waiting_human");
    if (!o.resume) return report(run);
    for (const key of ["tier", "agent", "timeout", "max-parallel", "planner-tier"]) if (o[key] !== undefined) throw new Error(`resume retains saved configuration; ${key} is not supported`);
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
    if (!Array.isArray(integration) || integration.some((x) => typeof x?.command !== "string" || !x.command.trim() || !Array.isArray(x.packages) || !x.packages.length || x.packages.some((id) => !packages.some((p) => p.id === id)))) throw new Error("invalid integration command/packages");
    integration = integration.map(({ command, packages }) => ({ command, packages }));
  } else {
    const goal = o.goal || (o["goal-file"] ? readFileSync(o["goal-file"], "utf8").trim() : "");
    if (!goal) throw new Error("ระบุ --goal / --plan / --packet; ขั้น 0: spec เพื่อเตรียม acceptance");
    const ac = o.acceptance || goal;
    const p = { id: "WP-1", title: goal.slice(0, 100), goal, tasks: [], repo: { path: repo },
      owns: o.owns?.split(",").map((g) => g.trim()) ?? ["**"], read_first: [], depends_on: [], risk: "low",
      acceptance: [{ id: "AC-1", text: ac, source: o.source || "user goal (awaiting confirmation)" }],
      commands: { setup: o.setup || "", build: o.build || "", test_targeted: o.test || "", test_full: o["test-full"] || o.test || "" } };
    validatePacket(p); packages = [p];
  }
  if (!packages.length) throw new Error("plan requires at least one package");
  if (modules.length) for (const p of packages) {
    p.knowledge_context = moduleContext(modules);
    for (const m of modules) for (const name of ["INDEX.md", "shared/requirements.md", "design/handoff.md"]) {
      const file = path.join(m.dir, name);
      if (existsSync(file) && !p.read_first.some((r) => r.path === file)) p.read_first.push({ path: file });
    }
  }

  const executionMode = o["execution-mode"] || (o.interactive ? "interactive" : null) || ws.defaults.execution_mode || "headless";
  const permissionPolicy = o["permission-policy"] || (o["allow-bypass"] ? "bypass" : null) || ws.defaults.permission_policy || "native-safe";
  const allowFallback = Boolean(o["allow-fallback"] ?? ws.defaults.allow_fallback);
  const worktree = Boolean(o.worktree ?? ws.defaults.worktree);

  const run = { version: 2, id: `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`, root,
    packages: packages.map((p) => ({ ...p, basis: { docs: documentBasis(p) }, state: "pending" })), tier: o.tier || "t2", plannerTier: o["planner-tier"] || ws.defaults.planner_tier,
    agent: o.agent || ws.defaults.agent, timeoutSec: resolveTimeout({ timeoutSet: o.timeout !== undefined, timeoutSec: Number(o.timeout ?? ws.defaults.timeout_sec) }, cfg.tiers[o.tier || "t2"]), maxParallel: Number(o["max-parallel"] ?? ws.defaults.max_parallel),
    direct: !!o.direct, executionMode, permissionPolicy, allowFallback, worktree,
    model: o.model ?? ws.defaults.model ?? null, effort: o.effort ?? ws.defaults.effort ?? null,
    approvalPolicy: o["approval-policy"] ?? "auto-safe", providerArgs: o["provider-arg"] ?? [],
    integration, createdAt: new Date().toISOString() };

  if (run.permissionPolicy === "bypass") {
    console.warn("WARNING: permission_policy is set to 'bypass'. Native security sandbox and approval checks are bypassed.");
  }

  if (!cfg.agents[run.agent] || !cfg.tiers[run.tier] || !cfg.tiers[run.plannerTier]) throw new Error("unknown agent/tier");
  if (!Number.isInteger(run.maxParallel) || run.maxParallel < 1 || run.maxParallel > 64 || !(run.timeoutSec >= 0)) throw new Error("invalid --max-parallel/--timeout");
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
    for (const p of run.packages) if (existsSync(path.join(run.dir, `cancel-${p.id}.json`)) && p.state !== "done") p.state = "cancelled";
    if (run.packages.every((p) => p.state === "cancelled")) return report(run);
    for (const p of run.packages.filter((p) => p.state === "done" && p.after)) {
      const current = snapshot(p.repo.path);
      const changed = changedFiles(p.after, current).some((f) => p.owns.some((g) => matches(f, g)));
      if (changed || ["head", "branch", "index", "stash"].some((k) => p.after[k] !== current[k])) {
        (p.previous_attempts ??= []).push({ before: p.before, after: p.after, gate: p.gate, verdict: p.verdict });
        Object.assign(p, { state: "waiting_human", before: current, requires_dirty_confirmation: true, dirty_approved: false,
          questions: ["completed scope/Git state changed since evidence; inspect and confirm with decide --allow-dirty"] });
      }
    }
    const selection = triage(run.packages, run.direct); run.mode = selection.mode;
    event(run, "triage", selection); persist(run);
    if (run.packages.some((p) => readiness(p).length)) { await schedule(run, cfg, { ...options, deferPlanning: selection.needsPlanning && !run.planned }); return report(run); }
    if (run.mode !== "direct" && selection.needsPlanning && !run.planned) {
      let result, error;
      const context = { packages: run.packages, questions: [] };
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          result = await planSession(run, cfg, options, { ...context, validation_error: error?.message });
          const revised = applyPlanning(run.packages, result);
          result.questions.push(...result.decisions.map((d) => ({ text: `${d.text} (${d.source})`, blocks: d.blocks })));
          const replacements = new Map(run.packages.map((p) => [p.id, revised.filter((r) => r.id === p.id || r.parent_id === p.id).map((r) => r.id)]));
          for (const test of run.integration ?? []) test.packages = [...new Set(test.packages.flatMap((id) => replacements.get(id) ?? [id]))];
          run.sourcePackages ??= run.packages;
          run.packages = revised;
          for (const q of result.questions) q.blocks = [...new Set(q.blocks.flatMap((id) => replacements.get(id) ?? [id]))];
          error = null; break;
        } catch (e) { error = e; if (e.failureClass === "SCOPE_VIOLATION") break; }
      }
      if (error) { for (const p of run.packages) { p.state = "blocked"; p.failureClass = error.failureClass ?? "PLANNING_FAILURE"; p.questions = [error.message]; } persist(run); return report(run); }
      for (const q of result.questions) for (const p of run.packages.filter((p) => q.blocks.includes(p.id))) { p.state = "waiting_human"; p.questions = [...(p.questions ?? []), q.text]; }
      run.planned = true;
      if (result.questions.length) { event(run, "inbox_ready"); persist(run); }
    }
    do {
      await schedule(run, cfg, options);
      if (run.packages.some((p) => p.state === "pending")) break;
      await integrate(run, options);
    } while (run.packages.some((p) => p.state === "pending"));
    return report(run);
  } finally { delete run.pid; try { persist(run); } finally { release(); } }
}

async function planSession(run, cfg, options, context) {
  const releases = [], before = new Map();
  try {
    for (const repo of [...new Set(run.packages.map((p) => p.repo.path))].sort()) {
      releases.push(repoLock(run.root, repo)); before.set(repo, snapshot(repo));
    }
    return await (options.session ?? callSession)(run, run.packages[0], "planner", cfg, { ...options, context });
  } finally {
    try {
      for (const [repo, state] of before) if (!sameState(state, snapshot(repo))) throw Object.assign(new Error(`Planner changed repository/Git state: ${repo}`), { failureClass: "SCOPE_VIOLATION" });
    } finally { for (const release of releases.reverse()) release(); }
  }
}
