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

// The monitor re-reads every run every second; run.json holds MBs of snapshots, so parse a file only when it
// changed and keep just the small projection the monitor uses (holding whole runs would grow memory per run).
const projections = new Map();
function readProjected(file, project) {
  let st;
  try { st = statSync(file); } catch { projections.delete(file); return null; }
  const hit = projections.get(file);
  if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.value;
  let value = null;
  try { value = project(readFileSync(file, "utf8")); } catch { /* half-written file: retry on the next change */ }
  projections.set(file, { mtimeMs: st.mtimeMs, size: st.size, value });
  return value;
}

export function readRunSummary(file) {
  return readProjected(file, (text) => {
    const run = JSON.parse(text);
    return { id: run.id, createdAt: run.createdAt, mode: run.mode, executionMode: run.executionMode,
      packages: (run.packages ?? []).map((p) => ({ id: p.id, title: p.title ?? "", state: p.state ?? null, failureClass: p.failureClass ?? null, repo: { path: p.repo?.path } })) };
  });
}

export function readCallEnds(file) {
  return readProjected(file, (text) => text.split(/\r?\n/).flatMap((line) => {
    if (!line.includes('"call_end"')) return [];
    try { const ev = JSON.parse(line); return ev.type === "call_end" ? [ev] : []; } catch { return []; }
  })) ?? [];
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

      const runJson = readRunSummary(path.join(runDir, "run.json")) ?? {};
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
    costCalls: 0,
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
      costCalls: 0,
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

    const runJson = readRunSummary(runJsonFile);
    if (runJson && runJson.packages?.length && runJson.packages.every((p) => p.state === "done")) {
      summary.total.completedRuns++;
    }

    const projectsInRun = new Set();
    const projectOfPackage = new Map();
    if (runJson?.packages) {
      for (const p of runJson.packages) {
        if (!p.repo?.path) continue;
        projectsInRun.add(path.basename(p.repo.path));
        projectOfPackage.set(p.id, path.basename(p.repo.path));
      }
    }
    const onlyProject = projectsInRun.size === 1 ? [...projectsInRun][0] : null;

    if (existsSync(ledgerFile)) {
      try {
        for (const ev of readCallEnds(ledgerFile)) {
          if (ev.agent) {
            const agent = ev.agent.toLowerCase();
            const targetAgent = summary.agents[agent] ?? (summary.agents[agent] = initialAgentStats());
            targetAgent.calls++;
            if (ev.ok) targetAgent.successfulCalls++;
            else targetAgent.failedCalls++;

            const u = ev.usage ?? {};
            // A provider that reports no price is unknown, not free: count priced calls separately.
            const priced = Number.isFinite(u.costUsd);
            targetAgent.inputTokens += u.inputTokens ?? 0;
            targetAgent.outputTokens += u.outputTokens ?? 0;
            targetAgent.cacheReadTokens += u.cacheReadTokens ?? 0;
            targetAgent.cacheWriteTokens += u.cacheWriteTokens ?? 0;
            if (priced) { targetAgent.costUsd += u.costUsd; targetAgent.costCalls++; }
            targetAgent.turns += u.turns ?? 0;
            targetAgent.durationMs += ev.durationMs ?? 0;

            summary.total.calls++;
            summary.total.inputTokens += u.inputTokens ?? 0;
            summary.total.outputTokens += u.outputTokens ?? 0;
            summary.total.cacheReadTokens += u.cacheReadTokens ?? 0;
            summary.total.cacheWriteTokens += u.cacheWriteTokens ?? 0;
            if (priced) { summary.total.costUsd += u.costUsd; summary.total.costCalls++; }
            summary.total.durationMs += ev.durationMs ?? 0;

            // Credit only the repo of the package that made the call; crediting every repo in a multi-repo run
            // made project totals add up to more than the workspace total.
            const proj = projectOfPackage.get(ev.package) ?? onlyProject;
            if (proj) {
              const pStats = summary.projects[proj] ?? (summary.projects[proj] = {
                runs: 0,
                calls: 0,
                inputTokens: 0,
                outputTokens: 0,
                cacheReadTokens: 0,
                costUsd: 0,
                costCalls: 0,
              });
              pStats.calls++;
              pStats.inputTokens += u.inputTokens ?? 0;
              pStats.outputTokens += u.outputTokens ?? 0;
              pStats.cacheReadTokens += u.cacheReadTokens ?? 0;
              if (priced) { pStats.costUsd += u.costUsd; pStats.costCalls++; }
            }
          }
        }
      } catch {}
    }

    for (const proj of projectsInRun) {
      if (summary.projects[proj]) summary.projects[proj].runs++;
    }
  }

  for (const stats of [...Object.values(summary.agents), ...Object.values(summary.projects), summary.total]) {
    if (stats.calls > 0 && stats.costCalls === 0) stats.costUsd = null;
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
    const run = readRunSummary(path.join(runDir, "run.json"));
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
      for (const ev of readCallEnds(ledgerFile)) {
        const at = Date.parse(ev.at ?? "");
        if (!Number.isFinite(at) || at < cutoff) continue;
        out.push({ at: ev.at, runId: name, package: ev.package ?? null, role: ev.role ?? null, agent: ev.agent ?? null, ok: ev.ok === true });
      }
    } catch {}
  }
  return out.sort((a, b) => String(a.at).localeCompare(String(b.at))).slice(-limit);
}
