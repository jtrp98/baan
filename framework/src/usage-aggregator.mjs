import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const STALE_ACTIVE_MS = 10 * 60 * 1000;

export function readJsonSafe(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function scanActiveRuns(workspaceRoot) {
  const runsDir = path.join(workspaceRoot, ".baan", "runs");
  if (!existsSync(runsDir)) return [];

  const activeRuns = [];
  let entries = [];
  try {
    entries = readdirSync(runsDir);
  } catch {
    return [];
  }

  for (const name of entries) {
    const runDir = path.join(runsDir, name);
    try {
      const files = readdirSync(runDir);
      const activeFiles = files.filter((f) => f.startsWith("active-") && f.endsWith(".json"));
      if (files.includes("active.json") && !activeFiles.length) {
        activeFiles.push("active.json");
      }

      if (!activeFiles.length) continue;

      const runJson = readJsonSafe(path.join(runDir, "run.json")) ?? {};
      const activePackages = [];

      for (const af of activeFiles) {
        const act = readJsonSafe(path.join(runDir, af));
        if (act) activePackages.push(act);
      }

      if (activePackages.length) {
        const now = Date.now();
        for (const act of activePackages) {
          const t = Date.parse(act.updatedAt ?? "");
          // A killed process can leave its active file behind; flag it instead of hiding or trusting it.
          if (Number.isFinite(t) && now - t > STALE_ACTIVE_MS) act.stale = true;
        }
        const primary = activePackages[0];
        activeRuns.push({
          runId: name,
          dir: runDir,
          title: primary.title ?? name,
          repoName: primary.repoName ?? (runJson.packages?.[0]?.repo?.path ? path.basename(runJson.packages[0].repo.path) : "unknown"),
          repoPath: primary.repoPath ?? runJson.packages?.[0]?.repo?.path ?? "",
          // Missing identity stays null so the UI reports UNKNOWN rather than guessing an assignment.
          role: primary.role ?? null,
          agent: primary.agent ?? runJson.agent ?? null,
          tier: primary.tier ?? runJson.tier ?? "t2",
          activePackages,
          runInfo: {
            mode: runJson.mode ?? "planned",
            executionMode: runJson.executionMode ?? "headless",
            totalPackages: runJson.packages?.length ?? 1,
            completedPackages: runJson.packages?.filter((p) => p.state === "done").length ?? 0,
            packages: (runJson.packages ?? []).map((p) => ({
              id: p.id,
              title: p.title,
              state: p.state,
              repoName: p.repo?.path ? path.basename(p.repo.path) : "",
              failureClass: p.failureClass,
            })),
          },
        });
      }
    } catch {}
  }

  return activeRuns;
}

export function aggregateWorkspaceUsage(workspaceRoot) {
  const runsDir = path.join(workspaceRoot, ".baan", "runs");
  const initialAgentStats = () => ({
    calls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    costUsd: 0,
    turns: 0,
    durationMs: 0,
  });

  const summary = {
    agents: {
      claude: initialAgentStats(),
      codex: initialAgentStats(),
      agy: initialAgentStats(),
    },
    projects: {},
    total: {
      runs: 0,
      completedRuns: 0,
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      costUsd: 0,
      durationMs: 0,
    },
  };

  if (!existsSync(runsDir)) return summary;

  let entries = [];
  try {
    entries = readdirSync(runsDir);
  } catch {
    return summary;
  }

  for (const name of entries) {
    const runDir = path.join(runsDir, name);
    const ledgerFile = path.join(runDir, "ledger.jsonl");
    const runJsonFile = path.join(runDir, "run.json");

    if (!existsSync(ledgerFile) && !existsSync(runJsonFile)) continue;
    summary.total.runs++;

    const runJson = readJsonSafe(runJsonFile);
    if (runJson && runJson.packages?.length && runJson.packages.every((p) => p.state === "done")) {
      summary.total.completedRuns++;
    }

    const projectsInRun = new Set();
    if (runJson?.packages) {
      for (const p of runJson.packages) {
        if (p.repo?.path) projectsInRun.add(path.basename(p.repo.path));
      }
    }

    if (existsSync(ledgerFile)) {
      try {
        const text = readFileSync(ledgerFile, "utf8");
        for (const line of text.split(/\r?\n/)) {
          if (!line.trim().startsWith("{")) continue;
          let ev;
          try { ev = JSON.parse(line); } catch { continue; }

          if (ev.type === "call_end" && ev.agent) {
            const agent = ev.agent.toLowerCase();
            const targetAgent = summary.agents[agent] ?? (summary.agents[agent] = initialAgentStats());
            targetAgent.calls++;
            if (ev.ok) targetAgent.successfulCalls++;
            else targetAgent.failedCalls++;

            const u = ev.usage ?? {};
            targetAgent.inputTokens += u.inputTokens ?? 0;
            targetAgent.outputTokens += u.outputTokens ?? 0;
            targetAgent.cacheReadTokens += u.cacheReadTokens ?? 0;
            targetAgent.cacheWriteTokens += u.cacheWriteTokens ?? 0;
            targetAgent.costUsd += u.costUsd ?? 0;
            targetAgent.turns += u.turns ?? 0;
            targetAgent.durationMs += ev.durationMs ?? 0;

            summary.total.calls++;
            summary.total.inputTokens += u.inputTokens ?? 0;
            summary.total.outputTokens += u.outputTokens ?? 0;
            summary.total.cacheReadTokens += u.cacheReadTokens ?? 0;
            summary.total.cacheWriteTokens += u.cacheWriteTokens ?? 0;
            summary.total.costUsd += u.costUsd ?? 0;
            summary.total.durationMs += ev.durationMs ?? 0;

            for (const proj of projectsInRun) {
              const pStats = summary.projects[proj] ?? (summary.projects[proj] = {
                runs: 0,
                calls: 0,
                inputTokens: 0,
                outputTokens: 0,
                cacheReadTokens: 0,
                costUsd: 0,
              });
              pStats.calls++;
              pStats.inputTokens += u.inputTokens ?? 0;
              pStats.outputTokens += u.outputTokens ?? 0;
              pStats.cacheReadTokens += u.cacheReadTokens ?? 0;
              pStats.costUsd += u.costUsd ?? 0;
            }
          }
        }
      } catch {}
    }

    for (const proj of projectsInRun) {
      if (summary.projects[proj]) summary.projects[proj].runs++;
    }
  }

  return summary;
}

export function getRecentRuns(workspaceRoot, limit = 15) {
  const runsDir = path.join(workspaceRoot, ".baan", "runs");
  if (!existsSync(runsDir)) return [];

  let entries = [];
  try {
    entries = readdirSync(runsDir);
  } catch {
    return [];
  }

  const list = [];
  for (const name of entries.sort().reverse().slice(0, limit)) {
    const runDir = path.join(runsDir, name);
    const run = readJsonSafe(path.join(runDir, "run.json"));
    if (!run) continue;

    const projects = [...new Set((run.packages ?? []).map((p) => p.repo?.path ? path.basename(p.repo.path) : "").filter(Boolean))];
    const isDone = (run.packages ?? []).length > 0 && run.packages.every((p) => p.state === "done");
    list.push({
      id: run.id ?? name,
      createdAt: run.createdAt ?? name,
      mode: run.mode ?? "planned",
      executionMode: run.executionMode ?? "headless",
      projects,
      totalPackages: run.packages?.length ?? 0,
      completedPackages: run.packages?.filter((p) => p.state === "done").length ?? 0,
      isDone,
      packageStates: (run.packages ?? []).map((p) => ({ id: p.id, title: p.title ?? "", state: p.state ?? null, failureClass: p.failureClass ?? null })),
    });
  }

  return list;
}

// Only call_end from recently touched runs: the browser uses these to play a finish/error reaction
// for a session it just watched disappear, never to replay history.
export function getRecentCallEnds(workspaceRoot, { limit = 20, withinMs = 60 * 60 * 1000 } = {}) {
  const runsDir = path.join(workspaceRoot, ".baan", "runs");
  if (!existsSync(runsDir)) return [];
  let entries = [];
  try {
    entries = readdirSync(runsDir);
  } catch {
    return [];
  }
  const cutoff = Date.now() - withinMs;
  const out = [];
  for (const name of entries) {
    const ledgerFile = path.join(runsDir, name, "ledger.jsonl");
    try {
      if (statSync(ledgerFile).mtimeMs < cutoff) continue;
      for (const line of readFileSync(ledgerFile, "utf8").split(/\r?\n/)) {
        if (!line.includes('"call_end"')) continue;
        let ev;
        try { ev = JSON.parse(line); } catch { continue; }
        const at = Date.parse(ev.at ?? "");
        if (ev.type !== "call_end" || !Number.isFinite(at) || at < cutoff) continue;
        out.push({ at: ev.at, runId: name, package: ev.package ?? null, role: ev.role ?? null, agent: ev.agent ?? null, ok: ev.ok === true });
      }
    } catch {}
  }
  return out.sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-limit);
}
