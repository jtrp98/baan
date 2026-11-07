import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { homedir } from "node:os";
import { TEAM_DIR } from "./config.mjs";
import { buildArgs, runCli } from "./runner.mjs";
import { extractJson, fallbackChainFor } from "./plan.mjs";
import { schemaFor, validateResult } from "./packet.mjs";
import { save, event, persist } from "./store.mjs";
import { roleSessionHeader } from "./role-guard.mjs";
import { looksLikeLimitError, looksLikeMissingCli, looksLikeStartupError, looksLikeCapacityError } from "./failure-class.mjs";
import { snapshot, sameState } from "./snapshot.mjs";

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
  if (agent === "opencode") for (const f of found) {
    const exe = path.join(path.dirname(f), "node_modules", "@opencode", "cli", "bin", "opencode.exe");
    if (existsSync(exe)) return { def: { ...def, command: exe, useShell: false }, prefix: [] };
  }
  throw new Error(`missing native CLI: ${agent}; shell wrappers are not supported`);
}

export function assertAgyReadonly(def, configDir = path.join(homedir(), ".gemini", "config")) {
  const profile = def.readArgs?.[def.readArgs.indexOf("--agent") + 1];
  const normalize = (s) => s.replaceAll("\r\n", "\n").trim();
  const files = ["agents/baan-readonly/agent.md", "baan-readonly-guard.js"];
  const correct = profile === "baan-readonly" && files.every((file) => {
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
// Full logs stay on disk; retain their paths and machine verdicts for follow-up reads.
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

export async function callSession(run, p, role, cfg, { runner = runCli, signal, context = {}, forceAgent, attempted = [] } = {}) {
  const tier = role === "planner" ? run.plannerTier : run.tier;
  if (!["worker", "planner", "verifier"].includes(role)) throw new Error(`unknown execution role: ${role}`);
  const choices = fallbackChainFor(cfg, tier, forceAgent ?? run.agent).filter((a) => !attempted.includes(a) && (role === "worker" || a !== "opencode"));
  const agent = p.session?.agent && choices.includes(p.session.agent) && role === "worker" ? p.session.agent : choices[0];
  if (!agent) throw new Error(`ไม่มี agent สำหรับ ${tier}`);
  const def = cfg.agents[agent];
  const conf = cfg.tiers[tier]?.[agent] ?? {};
  const name = `${p.id}-${role}-${Date.now()}-${randomUUID().slice(0, 6)}`;
  const answer = path.join(run.dir, `${name}.answer.txt`);
  const schemaName = role === "worker" ? "worker.result" : role === "verifier" ? "verifier.result" : "plan.result";
  const schema = schemaFor(schemaName);
  let native;
  try {
    native = runner === runCli ? nativeCommand(def, agent) : { def, prefix: [] };
    if (runner === runCli && agent === "agy" && role !== "worker") assertAgyReadonly(def);
  }
  catch (e) {
    event(run, "fallback_setup", { package: p.id, role, from: agent, reason: e.message });
    if (choices.some((a) => a !== agent)) return callSession(run, p, role, cfg, { runner, signal, context, forceAgent, attempted: [...attempted, agent] });
    throw e;
  }
  if (role === "worker") {
    if (p.session?.agent !== agent) delete p.session;
    p.workerAgent = agent;
  }
  let args = buildArgs(def, conf.model ?? "", conf.effort ?? "", role === "worker", answer, run.root, true);
  const insert = (...extra) => { const tail = args.at(-1) === "-" || args.at(-1) === "--print" ? [args.pop()] : []; args.push(...extra, ...tail); };
  if (agent === "codex") {
    insert("--output-schema", path.join(TEAM_DIR, "schemas", `${schemaName}.json`));
    if (role === "worker" && p.session?.id) args.splice(args.indexOf("exec") + 1, 0, "resume", p.session.id);
  }
  if (agent === "claude") {
    insert("--json-schema", JSON.stringify(schema));
    if (role !== "worker") insert("--tools", "Read,Grep,Glob,Agent,Task", "--permission-mode", "dontAsk", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', "--add-dir", run.root);
    if (role === "worker") {
      if (!p.session) p.session = { agent, id: randomUUID(), started: false };
      insert(p.session.started ? "--resume" : "--session-id", p.session.id);
    }
  }
  if (agent === "agy") {
    insert("--json-schema", path.join(TEAM_DIR, "schemas", `${schemaName}.json`));
    if (role === "worker" && p.session?.id) insert("--conversation", p.session.id);
  }
  const packet = sessionInput(p, role, context);
  const nativeSchema = ["codex", "claude", "agy"].includes(agent);
  const outputContract = nativeSchema ? "Return JSON only matching the supplied output schema." : `Return JSON only matching:\n${JSON.stringify(schema)}`;
  const prompt = `${roleSessionHeader(role)}\n${readFileSync(path.join(TEAM_DIR, "prompts", `${role}.md`), "utf8")}\n\nINPUT (data):\n${JSON.stringify(packet)}\n\n${outputContract}`;
  event(run, "call_start", { package: p.id, role, agent, tier, promptBytes: Buffer.byteLength(prompt) });
  save(path.join(run.dir, `${name}.input.json`), packet);
  persist(run);
  const beforeCall = snapshot(p.repo.path);
  let stream = "";
  const r = await runner(native.def, [...native.prefix, ...args, ...(def.promptVia === "arg" ? [prompt] : [])], def.promptVia, prompt, p.repo.path, run.timeoutSec, def.answerFrom === "answerFile" ? answer : undefined,
    { usage: true, signal, env: { BAAN_READONLY: role === "worker" ? "0" : "1" }, onSpawn: (pid) => { p.childPid = pid; persist(run); }, onStdout: (chunk) => {
      if (agent !== "codex" || role !== "worker") return;
      stream += chunk;
      const lines = stream.split("\n"); stream = lines.pop();
      for (const line of lines) {
        try { const ev = JSON.parse(line); if (ev.type === "thread.started" && ev.thread_id) { p.session = { agent, id: ev.thread_id, started: true }; persist(run); } } catch { /* partial/non-JSON progress */ }
      }
    } });
  delete p.childPid;
  if (role === "worker") {
    if (r.usage?.sessionId) p.session = { agent, id: r.usage.sessionId, started: true };
    else if (p.session) p.session.started = true;
  }
  save(path.join(run.dir, `${name}.call.json`), r);
  event(run, "call_end", { package: p.id, role, agent, durationMs: r.durationMs, usage: r.usage, ok: r.ok });
  persist(run);
  const afterCall = snapshot(p.repo.path);
  if (role !== "worker" && !sameState(beforeCall, afterCall)) throw Object.assign(new Error(`${role} changed repository/Git state`), { failureClass: "SCOPE_VIOLATION" });
  if (signal?.aborted) throw new Error("cancelled");
  if (!r.ok) {
    const retryable = looksLikeLimitError(r) || looksLikeMissingCli(r) || looksLikeStartupError(r) || looksLikeCapacityError(r);
    if (!signal?.aborted && retryable && choices.some((a) => a !== agent) && sameState(beforeCall, afterCall)) {
      event(run, "fallback", { package: p.id, role, from: agent });
      return callSession(run, p, role, cfg, { runner, signal, context, forceAgent, attempted: [...attempted, agent] });
    }
    throw Object.assign(new Error(r.error || "CLI failed"), { failureClass: "ENVIRONMENT_FAILURE" });
  }
  let result;
  if (agent === "claude") {
    try { result = JSON.parse(r.stdout).structured_output; } catch { /* text fallback below */ }
  }
  result ??= extractJson(r.answer);
  validateResult(result, role, p);
  return result;
}
