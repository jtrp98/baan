import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { homedir } from "node:os";
import { TEAM_DIR, collectWorkspaceAddDirs } from "./config.mjs";
import { runCli } from "./runner.mjs";
import { extractJson, fallbackChainFor, isTierLower } from "./plan.mjs";
import { schemaFor, validateResult } from "./packet.mjs";
import { save, event, persist } from "./store.mjs";
import { roleSessionHeader } from "./role-guard.mjs";
import { looksLikeLimitError, looksLikeMissingCli, looksLikeStartupError, looksLikeCapacityError } from "./failure-class.mjs";
import { snapshot, sameState } from "./snapshot.mjs";
import { getAdapter } from "./adapters/registry.mjs";
import { createStreamParser } from "./events.mjs";
import { evaluateParity } from "./parity.mjs";

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
  const assignment = Object.fromEntries(["id", "title", "goal", "tasks", "repo", "owns", "read_first", "contracts", "acceptance", "commands", "decisions", "questions", "risk", "risk_tags", "budget", "knowledge_context", "rework", "verdict"]
    .filter((key) => p[key] !== undefined).map((key) => [key, p[key]]));
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

export function resolveWorkerTier(run, p) {
  const baseTier = p?.tier || run.tier;
  const explicit = p?.worker_tier ?? p?.workerTier;
  if (explicit) {
    if (p.kind === "code" && p.risk === "high" && /^t[3-5]$/.test(explicit)) {
      return "t2";
    }
    if (p.kind === "code" && isTierLower(explicit, baseTier)) {
      const hasContract = (p.contracts?.length > 0) || (p.read_first?.some((r) => r.pin));
      if (!hasContract) return baseTier;
    }
    return explicit;
  }
  if (p?.kind === "docs") {
    const text = [p?.goal, p?.title, ...(p?.risk_tags ?? [])].join(" ");
    const isCritical = (p.contracts?.length > 0) || p.risk === "high" || /adr|contract|security|auth|pii|password|token|สิทธิ์|สัญญาร่วม|สถาปัตยกรรม|database|schema/i.test(text);
    if (!isCritical && /^t[0-3]$/.test(baseTier)) {
      return "t4";
    }
  }
  return baseTier;
}

export async function callSession(run, p, role, cfg, { runner = runCli, signal, context = {}, forceAgent, attempted = [] } = {}) {
  const tier = role === "planner" ? run.plannerTier : role === "worker" ? resolveWorkerTier(run, p) : run.tier;
  if (!["worker", "planner", "verifier"].includes(role)) throw new Error(`unknown execution role: ${role}`);
  const choices = fallbackChainFor(cfg, tier, forceAgent ?? run.agent).filter((a) => !attempted.includes(a));
  const agent = p.session?.agent && choices.includes(p.session.agent) && role === "worker" ? p.session.agent : choices[0];
  if (!agent) throw new Error(`ไม่มี agent สำหรับ ${tier}`);
  const def = cfg.agents[agent];
  const conf = cfg.tiers[tier]?.[agent] ?? {};
  const adapter = getAdapter(agent, cfg);
  const name = `${p.id}-${role}-${Date.now()}-${randomUUID().slice(0, 6)}`;
  const answer = path.join(run.dir, `${name}.answer.txt`);
  const schemaName = role === "worker" ? "worker.result" : role === "verifier" ? "verifier.result" : "plan.result";
  const schema = schemaFor(schemaName);

  let native;
  try {
    native = runner === runCli ? nativeCommand(def, agent) : { def, prefix: [] };
    if (runner === runCli && agent === "agy" && def.readArgs?.includes("--agent")) assertAgyReadonly(def);
  }
  catch (e) {
    event(run, "fallback_setup", { package: p.id, role, from: agent, reason: e.message });
    if (run.allowFallback && choices.some((a) => a !== agent)) {
      return callSession(run, p, role, cfg, { runner, signal, context, forceAgent, attempted: [...attempted, agent] });
    }
    throw e;
  }

  if (role === "worker") {
    if (p.session?.agent !== agent) delete p.session;
    p.workerAgent = agent;
  }

  const addDirs = collectWorkspaceAddDirs(context.ws, p, run.root);
  const permissionPolicy = run.permissionPolicy ?? p.permissionPolicy ?? "native-safe";
  const probeResult = await adapter.probe(native.def, { cwd: p.repo.path, workspaceRoot: run.root });

  const invocation = adapter.buildHeadless({
    def: native.def,
    role,
    model: conf.model ?? run.model ?? "",
    effort: conf.effort ?? run.effort ?? "",
    permissionPolicy,
    approvalPolicy: run.approvalPolicy ?? "auto-safe",
    workspaceRoot: run.root,
    addDirs,
    session: p.session,
    answerFile: answer,
    schema,
    schemaFile: path.join(TEAM_DIR, "schemas", `${schemaName}.json`),
    skipGitCheck: !existsSync(path.join(p.repo.path, ".git")),
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

  const packet = sessionInput(p, role, context);
  const nativeSchema = ["codex", "claude", "agy"].includes(agent);
  const outputContract = nativeSchema ? "Return JSON only matching the supplied output schema." : `Return JSON only matching:\n${JSON.stringify(schema)}`;
  const prompt = `${roleSessionHeader(role)}\n${readFileSync(path.join(TEAM_DIR, "prompts", `${role}.md`), "utf8")}\n\nINPUT (data):\n${JSON.stringify(packet)}\n\n${outputContract}`;

  event(run, "call_start", { package: p.id, role, agent, tier, promptBytes: Buffer.byteLength(prompt) });
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
        agent,
        tier,
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

  const beforeCall = snapshot(p.repo.path);
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
  });

  let r;
  try {
    r = await runner(
      native.def,
      [...native.prefix, ...invocation.args, ...(invocation.promptVia === "arg" ? [prompt] : [])],
      invocation.promptVia,
      prompt,
      p.repo.path,
      run.timeoutSec,
      invocation.answerFrom === "answerFile" ? answer : undefined,
      {
        usage: true,
        signal,
        env: { ...invocation.env, BAAN_READONLY: role === "worker" ? "0" : "1" },
        onSpawn: (pid) => { p.childPid = pid; persist(run); },
        onStdout: (chunk) => streamParser.feed(chunk),
      }
    );
  } finally {
    clearActiveState();
  }

  const parsedStream = streamParser.flush();
  delete p.childPid;

  if (role === "worker") {
    if (parsedStream.sessionId) p.session = { agent, id: parsedStream.sessionId, started: true };
    else if (r.usage?.sessionId) p.session = { agent, id: r.usage.sessionId, started: true };
    else if (invocation.sessionId) p.session = { agent, id: invocation.sessionId, started: true };
    else if (p.session) p.session.started = true;
  }

  save(path.join(run.dir, `${name}.call.json`), r);
  event(run, "call_end", { package: p.id, role, agent, durationMs: r.durationMs, usage: r.usage ?? parsedStream.usage, ok: r.ok });
  persist(run);

  const afterCall = snapshot(p.repo.path);
  if (role !== "worker" && !sameState(beforeCall, afterCall)) {
    throw Object.assign(new Error(`${role} changed repository/Git state`), { failureClass: "SCOPE_VIOLATION" });
  }

  if (signal?.aborted) throw new Error("cancelled");

  if (!r.ok) {
    const retryable = looksLikeLimitError(r) || looksLikeMissingCli(r) || looksLikeStartupError(r) || looksLikeCapacityError(r);
    const allowFallback = Boolean(run.allowFallback || p.allowFallback);
    if (!signal?.aborted && retryable && allowFallback && choices.some((a) => a !== agent) && sameState(beforeCall, afterCall)) {
      event(run, "fallback", { package: p.id, role, from: agent });
      return callSession(run, p, role, cfg, { runner, signal, context, forceAgent, attempted: [...attempted, agent] });
    }
    // Fail loud and preserve existing session without silent provider replacement.
    throw Object.assign(new Error(r.error || "CLI failed"), { failureClass: "ENVIRONMENT_FAILURE" });
  }

  let result = adapter.extractFinalResult(r.stdout, answer);
  if (!result && parsedStream.answer) {
    result = typeof parsedStream.answer === "object" ? parsedStream.answer : extractJson(parsedStream.answer);
  }
  if (!result && r.answer) {
    result = typeof r.answer === "object" ? r.answer : extractJson(r.answer);
  }
  if (!result) throw new Error("ไม่พบ JSON ในคำตอบของผู้ให้บริการ");
  validateResult(result, role, p);
  return result;
}
