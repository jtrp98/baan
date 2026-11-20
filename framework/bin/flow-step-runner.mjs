#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAgentsConfig, TEAM_DIR } from "../src/config.mjs";
import { getAdapter } from "../src/adapters/registry.mjs";
import { nativeCommand } from "../src/session.mjs";
import { runCli } from "../src/runner.mjs";
import { createStreamParser } from "../src/events.mjs";
import { extractJson } from "../src/plan.mjs";
import { save, writeAtomic } from "../src/store.mjs";
import { looksLikeCapacityError, looksLikeLimitError, looksLikeMissingCli } from "../src/failure-class.mjs";

function appendLedger(runDir, type, data = {}) {
  mkdirSync(runDir, { recursive: true });
  appendFileSync(path.join(runDir, "ledger.jsonl"), JSON.stringify({ at: new Date().toISOString(), type, ...data }) + "\n", "utf8");
}

function normalizeStepResult(parsed, fallbackText = "") {
  const base = parsed && typeof parsed === "object" ? parsed : {};
  const status = ["done", "needs_input", "escalate_upstream", "failed"].includes(base.status)
    ? base.status
    : (Array.isArray(base.tickets) && base.tickets.length ? "needs_input" : "failed");
  const ki = base.knowledge_impact && typeof base.knowledge_impact === "object"
    ? {
        required: Boolean(base.knowledge_impact.required),
        plan: String(base.knowledge_impact.plan ?? ""),
        affected_paths: Array.isArray(base.knowledge_impact.affected_paths) ? base.knowledge_impact.affected_paths : [],
      }
    : { required: false, plan: "", affected_paths: [] };
  return {
    status,
    summary: String(base.summary ?? (fallbackText ? fallbackText.slice(0, 400) : "")),
    artifacts_written: Array.isArray(base.artifacts_written) ? base.artifacts_written : [],
    tickets: Array.isArray(base.tickets) ? base.tickets : [],
    knowledge_impact: ki,
    has_db_changes: Boolean(base.has_db_changes),
    failed_tests: Array.isArray(base.failed_tests) ? base.failed_tests : [],
    ...(base.upstream_issue ? { upstream_issue: base.upstream_issue } : {}),
  };
}

function parseStepOutcome(adapter, parsedStream, cliResult, answerFile) {
  const candidates = [
    parsedStream?.answer,
    cliResult?.stdout,
    cliResult?.answer,
  ];
  for (const cand of candidates) {
    if (!cand) continue;
    if (typeof cand === "object") return normalizeStepResult(cand);
    try {
      return normalizeStepResult(extractJson(String(cand)));
    } catch {}
  }
  try {
    const viaAdapter = adapter.extractFinalResult(cliResult?.stdout ?? "", answerFile);
    if (viaAdapter) return normalizeStepResult(viaAdapter);
  } catch {}
  return null;
}

export async function runFlowStepJob(job, { runner = runCli, cfg: explicitCfg = null, onActivity = null } = {}) {
  const cfg = explicitCfg ?? loadAgentsConfig(job.agentsFile);
  const def = cfg.agents?.[job.agent];
  if (!def) {
    throw Object.assign(new Error(`ไม่พบ provider '${job.agent}' ใน agents.json`), { failureClass: "PROVIDER_UNAVAILABLE" });
  }
  const adapter = getAdapter(job.agent, cfg);
  const native = runner === runCli ? nativeCommand(def, job.agent) : { def, prefix: [] };

  const adapterRole = job.writeMode ? "worker" : "planner";
  const schemaFile = job.schemaFile || path.join(TEAM_DIR, "schemas", "flow-step.result.json");
  const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
  const promptText = readFileSync(job.promptFile, "utf8");
  const systemPromptText = job.systemPromptFile && existsSync(job.systemPromptFile)
    ? readFileSync(job.systemPromptFile, "utf8")
    : "";

  const invocation = adapter.buildHeadless({
    def: native.def,
    role: adapterRole,
    model: job.model || "",
    effort: job.effort || "",
    permissionPolicy: job.permissionPolicy || "native-safe",
    approvalPolicy: "auto-safe",
    workspaceRoot: job.workspaceRoot,
    addDirs: job.addDirs ?? [],
    answerFile: job.answerFile,
    schema,
    schemaFile,
    systemPromptFile: job.agent === "claude" ? (job.systemPromptFile || "") : "",
    developerInstructions: job.agent === "codex" ? systemPromptText : "",
    skipGitCheck: !existsSync(path.join(job.cwd, ".git")),
    providerArgs: job.providerArgs ?? [],
  });

  const activeFile = path.join(job.runDir, `active-${job.stepId}.json`);
  const activeMainFile = path.join(job.runDir, "active.json");
  const startedAt = new Date().toISOString();
  const history = [];

  const writeActive = (act = null, liveUsage = null) => {
    try {
      if (act && (act.type === "tool" || act.type === "thought")) {
        history.push(act);
        if (history.length > 25) history.shift();
        if (act.type === "tool") {
          console.log(`[${job.role}/${job.agent}] ${act.name}${act.detail ? `: ${act.detail}` : ""}`);
        } else if (act.type === "thought") {
          console.log(`[${job.role}/${job.agent}] ... ${act.thought.replace(/\s+/g, " ").slice(0, 120)}`);
        }
      }
      onActivity?.(act, liveUsage);
      const payload = {
        runId: job.runId,
        packageId: job.stepId,
        title: job.title || job.stepId,
        repoPath: job.cwd,
        repoName: job.project || path.basename(job.cwd),
        role: job.role,
        routingRole: job.role,
        agent: job.agent,
        tier: job.tier || "t2",
        model: job.model || "",
        effort: job.effort || "",
        startedAt,
        updatedAt: new Date().toISOString(),
        recentActivity: act?.type === "tool" ? act : history.filter((h) => h.type === "tool").at(-1) ?? null,
        recentThought: act?.type === "thought" ? act.thought : history.filter((h) => h.type === "thought").at(-1)?.thought ?? "",
        history: [...history],
        usage: liveUsage || { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, turns: 0, costUsd: null },
      };
      save(activeFile, payload);
      save(activeMainFile, payload);
    } catch {}
  };

  const clearActive = () => {
    for (const f of [activeFile, activeMainFile]) {
      try { if (existsSync(f)) unlinkSync(f); } catch {}
    }
  };

  appendLedger(job.runDir, "call_start", {
    package: job.stepId,
    role: job.role,
    agent: job.agent,
    tier: job.tier,
    model: job.model,
    effort: job.effort,
    flowStage: job.stage,
  });
  writeActive();

  const streamLogFile = path.join(job.runDir, "streams", `${job.stepId}.jsonl`);
  const streamParser = createStreamParser(invocation.streamFormat, {
    streamLogFile,
    onActivity: (act, liveUsage) => writeActive(act, liveUsage),
  });

  const effectivePrompt = invocation.usesSystemPromptChannel || !systemPromptText
    ? promptText
    : `${systemPromptText}\n\n${promptText}`;

  let r;
  try {
    r = await runner(
      native.def,
      [...native.prefix, ...invocation.args, ...(invocation.promptVia === "arg" ? [effectivePrompt] : [])],
      invocation.promptVia,
      effectivePrompt,
      job.cwd,
      Number(job.timeoutSec ?? 0),
      invocation.answerFrom === "answerFile" ? job.answerFile : undefined,
      {
        usage: true,
        env: { ...invocation.env, BAAN_READONLY: job.writeMode ? "0" : "1", BAAN_HEADLESS: "1", BAAN_FLOW_STAGE: job.stage },
        onStdout: (chunk) => streamParser.feed(chunk),
      },
    );
  } finally {
    clearActive();
  }

  const parsedStream = streamParser.flush();
  const usage = {
    ...(parsedStream.usage ?? {}),
    ...(r.usage ?? {}),
    commands: parsedStream.usage?.commands ?? r.usage?.commands ?? 0,
    toolOutputBytes: parsedStream.usage?.toolOutputBytes ?? r.usage?.toolOutputBytes ?? 0,
  };

  const rawErr = [r.error, r.stderr, ...(parsedStream.errors ?? [])].filter(Boolean).join("\n");
  if (looksLikeLimitError(rawErr) || looksLikeCapacityError(rawErr)) {
    appendLedger(job.runDir, "call_end", {
      package: job.stepId, role: job.role, agent: job.agent, model: job.model, effort: job.effort,
      ok: false, durationMs: r.durationMs ?? 0, usage, failureClass: "PROVIDER_LIMIT",
    });
    const failure = { ok: false, failureClass: "PROVIDER_LIMIT", error: rawErr || "Provider quota/rate limit reached" };
    writeAtomic(job.resultFile, JSON.stringify(failure, null, 2) + "\n");
    return failure;
  }
  if (looksLikeMissingCli(rawErr)) {
    appendLedger(job.runDir, "call_end", {
      package: job.stepId, role: job.role, agent: job.agent, model: job.model, effort: job.effort,
      ok: false, durationMs: r.durationMs ?? 0, usage, failureClass: "ENVIRONMENT_FAILURE",
    });
    const failure = { ok: false, failureClass: "ENVIRONMENT_FAILURE", error: rawErr || "CLI missing" };
    writeAtomic(job.resultFile, JSON.stringify(failure, null, 2) + "\n");
    return failure;
  }

  const parsed = parseStepOutcome(adapter, parsedStream, r, job.answerFile);
  if (!parsed) {
    appendLedger(job.runDir, "call_end", {
      package: job.stepId, role: job.role, agent: job.agent, model: job.model, effort: job.effort,
      ok: false, durationMs: r.durationMs ?? 0, usage, failureClass: "OUTPUT_CONTRACT",
    });
    const failure = {
      ok: false,
      failureClass: r.ok ? "OUTPUT_CONTRACT" : "ENVIRONMENT_FAILURE",
      error: rawErr || `Step ${job.stage} did not emit valid flow-step JSON`,
    };
    writeAtomic(job.resultFile, JSON.stringify(failure, null, 2) + "\n");
    return failure;
  }

  appendLedger(job.runDir, "call_end", {
    package: job.stepId, role: job.role, agent: job.agent, model: job.model, effort: job.effort,
    ok: parsed.status !== "failed", durationMs: r.durationMs ?? 0, usage,
  });
  const outcome = { ok: true, result: parsed, usage, durationMs: r.durationMs ?? 0 };
  writeAtomic(job.resultFile, JSON.stringify(outcome, null, 2) + "\n");
  return outcome;
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  const jobFile = process.argv[2];
  if (!jobFile) {
    console.error("Usage: flow-step-runner.mjs <job.json>");
    process.exit(1);
  }
  const job = JSON.parse(readFileSync(path.resolve(jobFile), "utf8"));
  runFlowStepJob(job)
    .then((res) => {
      if (!res.ok) {
        console.error(`[BAAN FLOW] ${res.failureClass || "ERROR"}: ${res.error}`);
        process.exit(res.failureClass === "PROVIDER_LIMIT" ? 2 : 1);
      }
      console.log(`[BAAN FLOW] Step ${job.stage} -> ${res.result.status}: ${res.result.summary}`);
      process.exit(0);
    })
    .catch((err) => {
      try {
        writeAtomic(job.resultFile, JSON.stringify({
          ok: false,
          failureClass: err.failureClass || "ENVIRONMENT_FAILURE",
          error: err.message,
        }, null, 2) + "\n");
      } catch {}
      console.error(`[BAAN FLOW] Fatal: ${err.message}`);
      process.exit(1);
    });
}
