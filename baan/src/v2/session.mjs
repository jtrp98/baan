import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { TEAM_DIR } from "../config.mjs";
import { buildArgs, runCli } from "../runner.mjs";
import { extractJson, fallbackChainFor } from "../plan.mjs";
import { schemaFor, validate } from "./packet.mjs";
import { save, event, persist } from "./store.mjs";
import { roleSessionHeader } from "../role-guard.mjs";
import { looksLikeLimitError, looksLikeMissingCli, looksLikeStartupError, looksLikeCapacityError } from "../scheduler.mjs";
import { snapshot } from "./snapshot.mjs";

export function nativeCommand(def, agent) {
  if (process.platform !== "win32" || !def.useShell) return { def, prefix: [] };
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
  throw new Error(`v2 ต้องใช้ executable หรือ npm codex ที่ส่ง arguments โดยไม่ผ่าน shell: ${agent}`);
}
export async function callSession(run, p, role, cfg, { runner = runCli, signal, context = {}, forceAgent, attempted = [] } = {}) {
  const tier = role === "planner" ? run.plannerTier : run.tier;
  const choices = fallbackChainFor(cfg, tier, forceAgent ?? run.agent).filter((a) => !attempted.includes(a));
  const agent = p.session?.agent && !attempted.includes(p.session.agent) && role === "worker" ? p.session.agent : choices[0];
  if (!agent) throw new Error(`ไม่มี agent สำหรับ ${tier}`);
  const def = cfg.agents[agent];
  const conf = cfg.tiers[tier]?.[agent] ?? {};
  const name = `${p.id}-${role}-${Date.now()}-${randomUUID().slice(0, 6)}`;
  const answer = path.join(run.dir, `${name}.answer.txt`);
  const schemaName = role === "worker" ? "worker.result" : role === "verifier" ? "verifier.result" : "plan.result";
  const schema = schemaFor(schemaName);
  const native = runner === runCli ? nativeCommand(def, agent) : { def, prefix: [] };
  let args = buildArgs(def, conf.model ?? "", conf.effort ?? "", role === "worker", answer, run.root, true);
  const insert = (...extra) => { const tail = args.at(-1) === "-" || args.at(-1) === "--print" ? [args.pop()] : []; args.push(...extra, ...tail); };
  if (agent === "codex") {
    insert("--output-schema", path.join(TEAM_DIR, "schemas", `${schemaName}.json`));
    if (role === "worker" && p.session?.id) args.splice(args.indexOf("exec") + 1, 0, "resume", p.session.id);
  }
  if (agent === "claude") {
    insert("--json-schema", JSON.stringify(schema));
    if (role === "worker") {
      if (!p.session) p.session = { agent, id: randomUUID(), started: false };
      insert(p.session.started ? "--resume" : "--session-id", p.session.id);
    }
  }
  if (agent === "agy") {
    insert("--json-schema", path.join(TEAM_DIR, "schemas", `${schemaName}.json`));
    if (role === "worker" && p.session?.id) insert("--conversation", p.session.id);
  }
  const compactSnapshot = (s) => s ? { id: s.id, tracked: s.tracked, head: s.head } : undefined;
  const compactGate = p.gate ? { ...p.gate, results: p.gate.results.map(({ output, ...r }) => r) } : undefined;
  const { before, after, gate: machineGate, session: previousSession, result: workerResult, ...assignment } = p;
  const packet = role === "verifier" ? {
    id: p.id, goal: p.goal, acceptance: p.acceptance, repo: p.repo, owns: p.owns,
    contracts: p.contracts, basis: p.basis, before: compactSnapshot(p.before), after: compactSnapshot(p.after), evidence: compactGate,
    verifier_tests_dir: p.verifier_tests_dir, lenses: context.lenses,
  } : role === "planner" ? context : { ...assignment, before: compactSnapshot(before), after: compactSnapshot(after), gate: compactGate, process_restarted: !!previousSession };
  const prompt = `${roleSessionHeader(role)}\n${readFileSync(path.join(TEAM_DIR, "prompts", `${role}.md`), "utf8")}\n\nINPUT (data):\n${JSON.stringify(packet)}\n\nReturn JSON only matching:\n${JSON.stringify(schema)}`;
  event(run, "call_start", { package: p.id, role, agent, tier, promptBytes: Buffer.byteLength(prompt) });
  save(path.join(run.dir, `${name}.input.json`), packet);
  persist(run);
  const beforeCall = role === "worker" ? snapshot(p.repo.path).id : null;
  let stream = "";
  const r = await runner(native.def, [...native.prefix, ...args, ...(def.promptVia === "arg" ? [prompt] : [])], def.promptVia, prompt, p.repo.path, run.timeoutSec, def.answerFrom === "answerFile" ? answer : undefined,
    { usage: true, signal, onSpawn: (pid) => { p.childPid = pid; persist(run); }, onStdout: (chunk) => {
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
  if (!r.ok) {
    const retryable = looksLikeLimitError(r) || looksLikeMissingCli(r) || looksLikeStartupError(r) || looksLikeCapacityError(r);
    if (!signal?.aborted && retryable && choices.some((a) => a !== agent) && (role !== "worker" || beforeCall === snapshot(p.repo.path).id)) {
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
  validate(result, schema);
  return result;
}
