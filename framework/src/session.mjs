import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { homedir } from "node:os";
import { TEAM_DIR, collectWorkspaceAddDirs } from "./config.mjs";
import { runCli } from "./runner.mjs";
import { extractJson, isTierLower } from "./plan.mjs";
import { schemaFor, validateResult } from "./packet.mjs";
import { save, event, persist } from "./store.mjs";
import { looksLikeLimitError, looksLikeMissingCli, looksLikeStartupError, looksLikeCapacityError } from "./failure-class.mjs";
import { snapshot, sameState, changedFiles, matches } from "./snapshot.mjs";
import { getAdapter } from "./adapters/registry.mjs";
import { createStreamParser } from "./events.mjs";
import { evaluateParity } from "./parity.mjs";
import { resolveRoleRoute, effectiveRoutingRole, normalizeRoleTier, escalateRoleTier, isCriticalDocsPacket } from "./routing.mjs";
import { compileExecutionPrompt, compileInteractiveBrief } from "./prompt-compiler.mjs";
import { runInteractiveWindow } from "./window-launcher.mjs";

export function nativeCommand(def, agent) {
  if (process.platform !== "win32" || !def.useShell) return { def: { ...def, useShell: false }, prefix: [] };
  let found = [];
  try { found = execFileSync("where.exe", [def.command], { encoding: "utf8", windowsHide: true }).trim().split(/\r?\n/); } catch { /* runCli reports a missing executable */ }
  const exe = found.find((f) => f.endsWith(".exe"));
  if (exe) return { def: { ...def, command: exe, useShell: false }, prefix: [] };
  if (agent === "codex") {
    for (const f of found) {
      const js = path.join(path.dirname(f), "node_modules", "@openai", "codex", "bin", "codex.js");
      if (existsSync(js)) return { def: { ...def, command: process.execPath, useShell: false }, prefix: [js] };
    }
  }
  if (agent === "agy") {
    const localAgy = path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe");
    if (existsSync(localAgy)) return { def: { ...def, command: localAgy, useShell: false }, prefix: [] };
  }
  throw new Error(`missing native CLI: ${agent}; shell wrappers are not supported`);
}

export function assertAgyReadonly(def, configDir = path.join(homedir(), ".gemini", "config")) {
  const profile = def.readArgs?.[def.readArgs.indexOf("--agent") + 1];
  if (profile !== "baan-readonly") return;
  const normalize = (s) => s.replaceAll("\r\n", "\n").trim();
  const files = ["agents/baan-readonly/agent.md", "baan-readonly-guard.js"];
  const correct = files.every((file) => {
    const installed = path.join(configDir, file);
    return existsSync(installed) && normalize(readFileSync(installed, "utf8")) === normalize(readFileSync(path.join(TEAM_DIR, "setup", "agy", file), "utf8"));
  });
  let guarded = false;
  try {
    const hooks = JSON.parse(readFileSync(path.join(configDir, "hooks.json"), "utf8"));
    const guard = path.join(configDir, "baan-readonly-guard.js").replaceAll("\\", "/");
    guarded = hooks["baan-readonly-guard"]?.PreToolUse?.some((entry) => entry.matcher === ".*" && entry.hooks?.some((hook) => hook.type === "command" && [`node ${guard}`, `node "${guard}"`].includes(hook.command?.replaceAll("\\", "/"))));
  } catch { /* Missing or malformed hooks cannot authorize a read-only call. */ }
  if (!correct || !guarded) throw new Error("agy read-only profile/guard missing or outdated: reinstall setup/agy profile and hook before verification");
}

function commandSummary({ output, ...result }) { return result; }

function sessionInput(p, role, context) {
  const compactSnapshot = (s) => s ? { id: s.id, tracked: s.tracked, head: s.head } : undefined;
  const compactGate = p.gate ? { ...p.gate, results: p.gate.results.map(commandSummary) } : undefined;
  const { before, after, probe, session } = p;
  const assignment = Object.fromEntries(["id", "title", "goal", "tasks", "repo", "owns", "read_first", "contracts", "acceptance", "commands", "decisions", "questions", "risk", "risk_tags", "budget", "knowledge_context", "rework", "verdict", "kind", "cross_cutting"]
    .filter((key) => p[key] !== undefined).map((key) => [key, p[key]]));
  if (role === "worker" && p.kind === "bugfix") {
    assignment.bugfix_policy = "MANDATORY: Write or identify a reproduction test that fails (Red) before modifying code, fix code in owns to make it pass (Green), and ensure full regression pass.";
  }
  if (p.integrationFailure) assignment.integration_failure = commandSummary(p.integrationFailure);
  return role === "verifier" ? {
    id: p.id, goal: p.goal, acceptance: p.acceptance, repo: p.repo, owns: p.owns,
    contracts: p.contracts, basis: p.basis, before: compactSnapshot(p.before), after: compactSnapshot(p.after), evidence: compactGate,
    lenses: context.lenses,
  } : role === "planner" ? { ...context, packages: context.packages?.map((p) => Object.fromEntries(
    ["id", "title", "goal", "tasks", "repo", "owns", "read_first", "acceptance", "depends_on", "contracts", "commands", "budget", "risk", "state", "human_gates", "knowledge_context"]
      .filter((key) => p[key] !== undefined).map((key) => [key, p[key]]))) }
    : { ...assignment, before: compactSnapshot(before), after: compactSnapshot(after), gate: compactGate, probe: probe ? commandSummary(probe) : undefined, process_restarted: !!session };
}

function recordParity(runDir, parity) {
  try {
    const file = path.join(runDir, "parity.json");
    let current = [];
    if (existsSync(file)) {
      try { current = JSON.parse(readFileSync(file, "utf8")); } catch {}
    }
    if (!Array.isArray(current)) current = [current];
    current.push(parity);
    writeFileSync(file, JSON.stringify(current, null, 2) + "\n", "utf8");
  } catch {}
}

export function resolveWorkerTier(run, p, cfg = null) {
  const routingRole = effectiveRoutingRole("worker", p);
  const roleDef = cfg?.roles?.[routingRole];
  const baseTier = p?.tier || run.tier || roleDef?.defaultTier || (routingRole === "docs" ? "t2" : "t3");
  const explicit = p?.worker_tier ?? p?.workerTier;

  let chosen;
  if (roleDef) {
    const requested = explicit ?? (routingRole === "docs" ? (isCriticalDocsPacket(p) ? "t1" : (p?.tier || roleDef.defaultTier)) : baseTier);
    chosen = normalizeRoleTier(roleDef, requested, { routingRole, packet: p, baseTier }).tier;
  } else {
    const hasContract = (p?.contracts?.length > 0) || Boolean(p?.read_first?.some((r) => r.pin));
    if (explicit) {
      if ((p?.kind === "code" || p?.kind === "bugfix" || !p?.kind) && p?.risk === "high") {
        const floor = hasContract ? "t3" : "t2";
        chosen = isTierLower(explicit, floor) ? floor : explicit;
      } else if ((p?.kind === "code" || p?.kind === "bugfix" || !p?.kind) && isTierLower(explicit, baseTier)) {
        chosen = hasContract ? explicit : baseTier;
      } else {
        chosen = explicit;
      }
    } else if (p?.kind === "docs") {
      chosen = isCriticalDocsPacket(p) ? "t1" : "t2";
    } else {
      chosen = baseTier;
    }
  }

  // Rework escalation: step up 1 tier per rework cycle, but hold at t2 until rework >= 2 so t1 xhigh is only for repeated failure.
  const reworkCount = Number(p?.rework ?? 0);
  if (cfg?.roles && reworkCount > 0) {
    for (let i = 0; i < reworkCount; i++) {
      if (chosen === "t2" && reworkCount < 2) break;
      chosen = escalateRoleTier(cfg, "worker", chosen, p);
    }
  }
  return chosen;
}

// Precedence: --verifier-tier > --tier > packet verifier_tier > workspace/role default.
// A packet may raise the verifier tier freely, but may only lower it when the packet is not risk: high.
export function resolveVerifierTier(run, p, cfg = null) {
  if (run?.explicitVerifierTier && run.verifierTier) return run.verifierTier;
  if (run?.explicitTier && run.tier) return run.tier;
  const base = run?.verifierTier || cfg?.roles?.verifier?.defaultTier || "t2";
  const raw = p?.verifier_tier ?? p?.verifierTier;
  const explicit = typeof raw === "string" && /^t[0-5]$/i.test(raw.trim()) ? raw.trim().toLowerCase() : null;
  if (!explicit) return base;
  if (p?.risk === "high" && isTierLower(explicit, base)) return base;
  return explicit;
}

export async function callSession(run, p, role, cfg, { runner = runCli, interactiveRunner, signal, context = {}, forceAgent, localConfig = null, windowSlot = 0 } = {}) {
  if (!["worker", "planner", "verifier"].includes(role)) throw new Error(`unknown execution role: ${role}`);
  const requestedTier = role === "planner"
    ? (run.plannerTier || cfg?.roles?.planner?.defaultTier || "t3")
    : role === "worker"
      ? resolveWorkerTier(run, p, cfg)
      : resolveVerifierTier(run, p, cfg);

  // Explicit --agent targets worker/planner unless --verifier-agent is also specified; verifier preserves cross-provider independence.
  const pinnedSessionAgent = role === "worker" && p.session?.agent ? p.session.agent : null;
  const roleExplicitAgent = role === "verifier" ? (run.explicitVerifierAgent ?? null) : (run.explicitAgent ?? null);
  const forcedAgent = forceAgent ?? pinnedSessionAgent ?? roleExplicitAgent ?? null;
  const route = resolveRoleRoute(cfg, role, {
    forcedAgent,
    tier: requestedTier,
    localConfig,
    workerAgent: p.workerAgent ?? p.session?.agent ?? null,
    packet: p,
    baseTier: p?.tier || run.tier,
  });

  const agent = route.agent;
  const tier = route.tier;
  const def = cfg.agents[agent];
  const adapter = getAdapter(agent, cfg);
  const name = `${p.id}-${role}-${Date.now()}-${randomUUID().slice(0, 6)}`;
  const answer = path.join(run.dir, `${name}.answer.txt`);
  const schemaName = role === "worker" ? "worker.result" : role === "verifier" ? "verifier.result" : "plan.result";
  const schema = schemaFor(schemaName);
  const executionMode = run.executionMode ?? (runner !== runCli && !interactiveRunner ? "headless" : "interactive");
  const isInteractive = executionMode === "interactive" && (runner === runCli || Boolean(interactiveRunner)) && !forceAgent;

  let native;
  try {
    native = (runner === runCli && !interactiveRunner) ? nativeCommand(def, agent) : { def, prefix: [] };
    if (runner === runCli && !isInteractive && agent === "agy" && def.readArgs?.includes("--agent")) assertAgyReadonly(def);
  } catch (e) {
    event(run, "provider_setup_failed", { package: p.id, role, agent, model: route.model, effort: route.effort, reason: e.message });
    throw Object.assign(e, { failureClass: e.failureClass || "ENVIRONMENT_FAILURE" });
  }

  // Fresh Session Reset Guard: reset bloated worker sessions (>1.5M cached tokens) or fresh rework cycles carrying gate/verdict context.
  if (role === "worker") {
    if (p.session?.agent !== agent) delete p.session;
    else if (p.session?.id && ((p.lastWorkerUsage?.cacheReadTokens ?? 0) >= 1_500_000 || (Number(p.rework ?? 0) > 0 && ((p.gate && !p.gate.ok) || (p.verdict && p.verdict.verdict !== "PASS"))))) {
      event(run, "session_reset_for_budget", {
        package: p.id,
        prevSessionId: p.session.id,
        prevCacheRead: p.lastWorkerUsage?.cacheReadTokens ?? 0,
        rework: p.rework ?? 0,
      });
      delete p.session;
    }
    p.workerAgent = agent;
  }

  const workRepo = p.worktreePath || p.repo.path;
  const addDirs = collectWorkspaceAddDirs(context.ws, p, run.root);
  const permissionPolicy = run.permissionPolicy ?? p.permissionPolicy ?? "native-safe";
  const probeResult = await adapter.probe(native.def, { cwd: workRepo, workspaceRoot: run.root });

  const packet = sessionInput(p, role, context);
  const nativeSchema = ["codex", "claude", "agy"].includes(agent);
  const resolvedModel = run.model || route.model || "";
  const resolvedEffort = run.effort || route.effort || "";
  const compiled = compileExecutionPrompt({
    provider: agent,
    role,
    model: resolvedModel,
    effort: resolvedEffort,
    tier,
    tierLabel: route.tierLabel,
    packet,
    schema,
    nativeSchema,
  });

  const systemPromptFile = path.join(run.dir, `${name}.system.md`);
  writeFileSync(systemPromptFile, compiled.systemPrompt + "\n", "utf8");

  if (isInteractive) {
    const briefFile = path.join(run.dir, `${name}.brief.md`);
    const brief = compileInteractiveBrief({
      provider: agent,
      role,
      model: resolvedModel,
      effort: resolvedEffort,
      tier,
      tierLabel: route.tierLabel,
      packet: role === "verifier" ? { ...packet, evidence: p.gate } : packet,
      answerFile: answer,
    });
    writeFileSync(briefFile, brief, "utf8");
    const initialPrompt = role === "worker"
      ? `Read and execute the BAAN interactive brief at "${briefFile}" strictly within owns. When done, optionally write JSON to "${answer}" and run /exit.`
      : `Read-only BAAN ${role} audit. Read "${briefFile}" and verify diffs/evidence without editing files. Write JSON result to "${answer}" and run /exit.`;

    const inv = adapter.buildInteractive({
      def: native.def,
      role,
      model: resolvedModel,
      effort: resolvedEffort,
      permissionPolicy,
      workspaceRoot: run.root,
      addDirs,
      session: p.session,
      systemPromptFile: agent === "claude" ? systemPromptFile : "",
      initialPrompt,
      providerArgs: run.providerArgs,
    });

    event(run, "call_start", {
      package: p.id,
      role,
      routingRole: route.routingRole,
      agent,
      tier,
      model: resolvedModel,
      effort: resolvedEffort,
      clamped: route.clamped,
      interactive: true,
      windowSlot,
      briefFile,
    });
    save(path.join(run.dir, `${name}.input.json`), packet);
    persist(run);

    const beforeCall = snapshot(workRepo);
    const launch = interactiveRunner ?? (async (spec) => {
      if (run.interactiveWindow === "inline") {
        const { runInteractiveCli } = await import("./runner.mjs");
        return runInteractiveCli(spec.command, spec.args, spec.cwd, spec.env, { signal: spec.signal, onSpawn: spec.onSpawn });
      }
      return runInteractiveWindow(spec);
    });
    const r = await launch({
      command: inv.command,
      args: [...native.prefix, ...inv.args],
      cwd: workRepo,
      env: { ...inv.env, BAAN_READONLY: role === "worker" ? "0" : "1", BAAN_HEADLESS: "0" },
      runDir: run.dir,
      name,
      slot: windowSlot,
      title: `[BAAN #${windowSlot + 1}] ${p.id} (${role} · ${agent} ${resolvedModel || "default"}/${resolvedEffort || "default"})`,
      briefFile,
      bannerLines: [
        `Package: ${p.id} | Role: ${role} (${tier}) | Agent: ${agent} (${resolvedModel || "default"}/${resolvedEffort || "default"})`,
        `Repo: ${workRepo}`,
        `Owns (${p.owns?.length ?? 0}): ${(p.owns ?? []).slice(0, 4).join(", ")}${(p.owns?.length ?? 0) > 4 ? " ..." : ""}`,
        `Build: ${p.commands?.build || "-"} | Test: ${p.commands?.test_targeted || "-"}`,
      ],
      signal,
      onSpawn: (pid) => { p.childPid = pid; persist(run); },
    });
    delete p.childPid;

    event(run, "call_end", {
      package: p.id,
      role,
      agent,
      model: resolvedModel,
      effort: resolvedEffort,
      interactive: true,
      durationMs: r.durationMs ?? 0,
      ok: r.ok !== false,
    });
    persist(run);

    const afterCall = snapshot(workRepo);
    if (role !== "worker" && !sameState(beforeCall, afterCall)) {
      const external = Array.isArray(p.external_paths) ? p.external_paths : [];
      const gitMoved = ["head", "branch", "index", "stash"].some((key) => beforeCall[key] !== afterCall[key]);
      const changed = changedFiles(beforeCall, afterCall);
      const ownChange = changed.filter((f) => !external.some((g) => matches(f, g)));
      if (gitMoved || ownChange.length) {
        throw Object.assign(new Error(`${role} changed repository/Git state${ownChange.length ? `: ${ownChange.slice(0, 10).join(", ")}` : ""}`), { failureClass: "SCOPE_VIOLATION" });
      }
      if (changed.length) event(run, "external_changes", { package: p.id, role, files: changed.slice(0, 50) });
    }
    if (signal?.aborted) throw new Error("cancelled");

    if (existsSync(answer)) {
      try {
        const text = readFileSync(answer, "utf8").trim();
        if (text) {
          const parsed = extractJson(text);
          validateResult(parsed, role, p);
          return parsed;
        }
      } catch { /* fall through to interactive exit handling */ }
    }

    if (role === "worker") {
      const external = Array.isArray(p.external_paths) ? p.external_paths : [];
      const changed = changedFiles(beforeCall, afterCall).filter((f) => !external.some((g) => matches(f, g)));
      p.interactiveSession = true;
      if (changed.length) {
        return {
          state: "DONE",
          summary: `Interactive CLI session completed (${changed.length} changed file(s))`,
          acceptance: p.acceptance.map((a) => ({ id: a.id, proof: ["interactive"] })),
          test_changes: [],
          questions: [],
          failure_class: "",
        };
      }
      return {
        state: "NEEDS_HUMAN",
        summary: "Interactive CLI session closed with no file changes",
        acceptance: [],
        test_changes: [],
        questions: ["หน้าต่าง CLI ปิดลงโดยไม่มีการแก้ไขไฟล์ — ตรวจสอบผลแล้ว resume หรือ decide ต่อ"],
        failure_class: "",
      };
    }

    throw Object.assign(
      new Error(`Interactive ${role} ปิดโดยไม่ได้เขียนผล JSON — ตรวจหลักฐาน/diff แล้วตัดสินด้วย baan decide`),
      { failureClass: "INTERACTIVE_REVIEW" }
    );
  }

  const invocation = adapter.buildHeadless({
    def: native.def,
    role,
    model: resolvedModel,
    effort: resolvedEffort,
    permissionPolicy,
    approvalPolicy: run.approvalPolicy ?? "auto-safe",
    workspaceRoot: run.root,
    addDirs,
    session: p.session,
    answerFile: answer,
    schema,
    schemaFile: path.join(TEAM_DIR, "schemas", `${schemaName}.json`),
    systemPromptFile: agent === "claude" ? systemPromptFile : "",
    developerInstructions: agent === "codex" ? compiled.systemPrompt : "",
    skipGitCheck: !existsSync(path.join(workRepo, ".git")),
    providerArgs: run.providerArgs,
    worktree: p.worktree,
    strictMcpInReadonly: Boolean(run.strictMcpInReadonly),
  });

  const parity = evaluateParity({
    adapter,
    probeResult,
    invocationSpec: invocation,
    mode: run.executionMode ?? "headless",
    role,
  });
  recordParity(run.dir, parity);

  const prompt = invocation.usesSystemPromptChannel ? compiled.userPrompt : compiled.combinedPrompt;

  event(run, "call_start", {
    package: p.id,
    role,
    routingRole: route.routingRole,
    agent,
    tier,
    model: resolvedModel,
    effort: resolvedEffort,
    clamped: route.clamped,
    promptBytes: Buffer.byteLength(prompt),
    systemPromptBytes: Buffer.byteLength(compiled.systemPrompt),
    systemPromptChannel: Boolean(invocation.usesSystemPromptChannel),
  });
  save(path.join(run.dir, `${name}.input.json`), packet);
  persist(run);

  const activeFile = path.join(run.dir, `active-${p.id}.json`);
  const activeMainFile = path.join(run.dir, "active.json");
  const callStartedAt = new Date().toISOString();
  const history = [];

  function writeActiveState(act = null, liveUsage = null) {
    try {
      if (act && (act.type === "tool" || act.type === "thought")) {
        history.push(act);
        if (history.length > 25) history.shift();
      }
      const data = {
        runId: run.id,
        packageId: p.id,
        title: p.title || p.id,
        repoPath: p.repo.path,
        repoName: path.basename(p.repo.path),
        role,
        routingRole: route.routingRole,
        agent,
        tier,
        model: resolvedModel,
        effort: resolvedEffort,
        startedAt: callStartedAt,
        updatedAt: new Date().toISOString(),
        recentActivity: act?.type === "tool" ? act : history.filter((h) => h.type === "tool").at(-1) ?? null,
        recentThought: act?.type === "thought" ? act.thought : history.filter((h) => h.type === "thought").at(-1)?.thought ?? "",
        history: [...history],
        usage: liveUsage || { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, turns: 0, costUsd: 0 },
      };
      save(activeFile, data);
      save(activeMainFile, data);
    } catch {}
  }

  function clearActiveState() {
    try {
      if (existsSync(activeFile)) unlinkSync(activeFile);
      if (existsSync(activeMainFile)) unlinkSync(activeMainFile);
    } catch {}
  }

  writeActiveState();

  const rawCap = run.maxCommands ?? p.budget?.max_commands;
  const maxCommands = rawCap !== undefined && rawCap !== null ? Number(rawCap) : (role === "worker" ? 60 : role === "verifier" ? 40 : 0);
  const callController = new AbortController();
  const forwardAbort = () => callController.abort();
  signal?.addEventListener("abort", forwardAbort, { once: true });
  if (signal?.aborted) callController.abort();
  let budgetExceeded = null;

  const beforeCall = snapshot(workRepo);
  const streamLogFile = path.join(run.dir, "streams", `${p.id}-${role}-${Date.now()}.jsonl`);
  const streamParser = createStreamParser(invocation.streamFormat, {
    streamLogFile,
    onSessionId: (sid) => {
      if (role === "worker") {
        p.session = { agent, id: sid, started: true };
        persist(run);
      }
    },
    onActivity: (act, liveUsage) => {
      writeActiveState(act, liveUsage);
    },
    onUsage: (liveUsage) => {
      if (maxCommands > 0 && !budgetExceeded && (liveUsage?.commands ?? 0) > maxCommands) {
        budgetExceeded = { commands: liveUsage.commands, limit: maxCommands };
        callController.abort();
      }
    },
  });

  let r;
  try {
    r = await runner(
      native.def,
      [...native.prefix, ...invocation.args, ...(invocation.promptVia === "arg" ? [prompt] : [])],
      invocation.promptVia,
      prompt,
      workRepo,
      run.timeoutSec,
      invocation.answerFrom === "answerFile" ? answer : undefined,
      {
        usage: true,
        signal: callController.signal,
        env: { ...invocation.env, BAAN_READONLY: role === "worker" ? "0" : "1", BAAN_HEADLESS: "1" },
        onSpawn: (pid) => { p.childPid = pid; persist(run); },
        onStdout: (chunk) => streamParser.feed(chunk),
      }
    );
  } finally {
    signal?.removeEventListener("abort", forwardAbort);
    clearActiveState();
  }

  const parsedStream = streamParser.flush();
  delete p.childPid;
  const finalUsage = {
    ...(parsedStream.usage ?? {}),
    ...(r.usage ?? {}),
    commands: parsedStream.usage?.commands ?? r.usage?.commands ?? 0,
    toolOutputBytes: parsedStream.usage?.toolOutputBytes ?? r.usage?.toolOutputBytes ?? 0,
  };

  if (role === "worker") {
    p.lastWorkerUsage = finalUsage;
    if (parsedStream.sessionId) p.session = { agent, id: parsedStream.sessionId, started: true };
    else if (r.usage?.sessionId) p.session = { agent, id: r.usage.sessionId, started: true };
    else if (invocation.sessionId) p.session = { agent, id: invocation.sessionId, started: true };
    else if (p.session) p.session.started = true;
  }

  save(path.join(run.dir, `${name}.call.json`), r);
  event(run, "call_end", {
    package: p.id,
    role,
    agent,
    model: resolvedModel,
    effort: resolvedEffort,
    interactive: false,
    durationMs: r.durationMs,
    usage: finalUsage,
    ok: r.ok && !budgetExceeded,
    ...(budgetExceeded ? { budgetExceeded } : {}),
  });
  persist(run);

  const afterCall = snapshot(workRepo);
  if (role !== "worker" && !sameState(beforeCall, afterCall)) {
    // Changes confined to external_paths come from another writer, not from this read-only role.
    const external = Array.isArray(p.external_paths) ? p.external_paths : [];
    const gitMoved = ["head", "branch", "index", "stash"].some((key) => beforeCall[key] !== afterCall[key]);
    const changed = changedFiles(beforeCall, afterCall);
    const ownChange = changed.filter((f) => !external.some((g) => matches(f, g)));
    if (gitMoved || ownChange.length) {
      throw Object.assign(new Error(`${role} changed repository/Git state${ownChange.length ? `: ${ownChange.slice(0, 10).join(", ")}` : ""}`), { failureClass: "SCOPE_VIOLATION" });
    }
    if (changed.length) event(run, "external_changes", { package: p.id, role, files: changed.slice(0, 50) });
  }

  if (signal?.aborted) throw new Error("cancelled");

  if (budgetExceeded) {
    throw Object.assign(
      new Error(`[BUDGET_EXCEEDED] ${role} ใช้คำสั่งเกินเพดาน (${budgetExceeded.commands}/${budgetExceeded.limit}) — หยุดเพื่อป้องกัน context snowball/เผาโควตา (แตก packet หรือปรับ budget.max_commands ได้)`),
      { failureClass: "BUDGET_EXCEEDED" }
    );
  }

  if (!r.ok) {
    const isLimit = looksLikeLimitError(r) || looksLikeCapacityError(r);
    if (isLimit) {
      // Strict No-Impersonation: never silently switch provider or downgrade a model when quota/rate limit hits.
      event(run, "provider_limit_blocked", {
        package: p.id,
        role,
        routingRole: route.routingRole,
        agent,
        tier,
        model: resolvedModel,
        effort: resolvedEffort,
        reason: r.error || "rate limit / capacity reached",
        impersonationBlocked: true,
      });
      throw Object.assign(
        new Error(`[PROVIDER_LIMIT] บทบาท ${route.routingRole}/${tier} ใช้ ${agent} (${resolvedModel || "default"}/${resolvedEffort || "default"}) แต่ติดลิมิต/โควตา — BAAN ไม่สวมรอยสลับค่ายหรือลดรุ่นแทน กรุณารอรีเซ็ตโควตาแล้ว resume หรือปรับ local.json / ระบุ --agent เอง: ${r.error || "quota/rate limit"}`),
        { failureClass: "PROVIDER_LIMIT" }
      );
    }
    throw Object.assign(new Error(r.error || "CLI failed"), { failureClass: "ENVIRONMENT_FAILURE" });
  }

  let result;
  try {
    // Stream-json stdout holds many JSON events; scanning it raw picks the first (init) event, not the answer.
    const streamed = invocation.answerFrom === "answerFile" ? null : parsedStream.answer;
    result = streamed ? (typeof streamed === "object" ? streamed : extractJson(streamed)) : adapter.extractFinalResult(r.stdout, answer);
    if (!result && parsedStream.answer) {
      result = typeof parsedStream.answer === "object" ? parsedStream.answer : extractJson(parsedStream.answer);
    }
    if (!result && r.answer) {
      result = typeof r.answer === "object" ? r.answer : extractJson(r.answer);
    }
    if (!result) throw new Error("ไม่พบ JSON ในคำตอบของผู้ให้บริการ");
  } catch (e) {
    // An unreadable reply breaks the output contract; tagged as environment it sent resume into a full Worker re-run.
    throw Object.assign(e, { failureClass: "OUTPUT_CONTRACT" });
  }
  validateResult(result, role, p);
  return result;
}
