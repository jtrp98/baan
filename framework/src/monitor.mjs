import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scanActiveRuns, aggregateWorkspaceUsage, getRecentRuns, getRecentCallEnds } from "./usage-aggregator.mjs";
import { getWorkspaceQuota } from "./quota-tracker.mjs";
import { loadLocalConfig, isAgentEnabled } from "./config.mjs";

function readAgentsEnabled() {
  try {
    const local = loadLocalConfig();
    return Object.fromEntries(["claude", "codex", "agy"].map((a) => [a, isAgentEnabled(a, local)]));
  } catch {
    return null;
  }
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return "0";
  return Number(num).toLocaleString();
}

export function formatCost(num) {
  if (num == null || isNaN(num)) return "$0.00";
  return `$${Number(num).toFixed(3)}`;
}

export function openBrowser(url) {
  try {
    if (process.platform === "win32") {
      spawn("cmd.exe", ["/c", "start", '""', url], { windowsHide: true, stdio: "ignore" });
    } else if (process.platform === "darwin") {
      spawn("open", [url], { stdio: "ignore" });
    } else {
      spawn("xdg-open", [url], { stdio: "ignore" });
    }
  } catch {}
}

export async function getMonitorState(workspaceRoot, forceRefreshQuota = false) {
  const activeRuns = scanActiveRuns(workspaceRoot);
  const usage = aggregateWorkspaceUsage(workspaceRoot);
  const recentRuns = getRecentRuns(workspaceRoot, 10);
  let quota = null;
  try {
    quota = await getWorkspaceQuota(forceRefreshQuota);
  } catch {}
  return {
    workspaceRoot,
    workspaceName: path.basename(workspaceRoot),
    activeRuns,
    usage,
    quota,
    recentRuns,
    recentCallEnds: getRecentCallEnds(workspaceRoot),
    agentsEnabled: readAgentsEnabled(),
    timestamp: new Date().toISOString(),
  };
}

export function renderTui(state) {
  const { activeRuns, usage, quota, workspaceName } = state;
  const lines = [];
  lines.push(`\x1b[1;36m========================================================================\x1b[0m`);
  lines.push(`\x1b[1;32m 🏗️  BAAN MONITOR  \x1b[0m — Workspace: \x1b[1m${workspaceName}\x1b[0m | Active: \x1b[1;33m${activeRuns.length} run(s)\x1b[0m`);
  lines.push(`\x1b[1;36m========================================================================\x1b[0m`);
  lines.push("");

  if (quota) {
    const { claude, codex, agy } = quota;
    lines.push(`\x1b[1mACCOUNT LIMITS & REMAINING QUOTA:\x1b[0m`);
    const tuiRow = (label, used, reset) => {
      if (used == null) return null;
      const left = Math.max(0, 100 - Math.round(used));
      const col = left > 40 ? "[32m" : left > 15 ? "[33m" : "[31m";
      return `${label}: ${col}${Math.round(used)}% used (${left}% left)[0m${/[0-9]/.test(reset ?? "") ? ` [Resets: ${reset}]` : ""}`;
    };
    const usedOf = (used, remaining) => used ?? (remaining != null ? 100 - remaining : null);
    const tuiLine = (name, ...rows) => lines.push(` ▶ ${name.padEnd(12)} ${rows.filter(Boolean).join(" | ")}`);
    if (claude?.available) {
      tuiLine("Claude Code",
        tuiRow("5-Hour Limit", usedOf(claude.sessionUsedPct, claude.sessionRemainingPct), claude.sessionResetsAt),
        tuiRow("Weekly Limit", usedOf(claude.weeklyUsedPct, claude.weeklyRemainingPct), claude.weeklyResetsAt));
    }
    if (codex?.available) {
      tuiLine("OpenAI Codex",
        tuiRow("5-Hour Limit", usedOf(codex.sessionUsedPct, codex.sessionRemainingPct), codex.sessionResetsAt),
        tuiRow("Weekly Limit", usedOf(codex.weeklyUsedPct, codex.weeklyRemainingPct), codex.weeklyResetsAt));
    }
    if (agy?.available) {
      tuiLine("Google AGY",
        tuiRow("5-Hour Limit", usedOf(null, agy.gemini5hRemainingPct), agy.gemini5hResetsAt),
        tuiRow("Weekly Limit", usedOf(null, agy.geminiWeeklyRemainingPct), agy.geminiWeeklyResetsAt),
        tuiRow("Argon Weekly Limit", usedOf(null, agy.argonWeeklyRemainingPct), agy.argonWeeklyResetsAt));
    }
    lines.push("");
  }

  lines.push(`\x1b[1m3-CLI USAGE BREAKDOWN (WORKSPACE TOTALS):\x1b[0m`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  lines.push(`| CLI Provider     | Calls  | In Tokens   | Out Tokens  | Cache Read | Cost     |`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  for (const [key, name] of [["claude", "Claude Code"], ["codex", "Codex CLI"], ["agy", "Google AGY"]]) {
    const s = usage.agents[key] ?? {};
    const cName = name.padEnd(16);
    const calls = String(s.calls ?? 0).padStart(6);
    const inTok = formatNumber(s.inputTokens ?? 0).padStart(11);
    const outTok = formatNumber(s.outputTokens ?? 0).padStart(11);
    const cache = formatNumber(s.cacheReadTokens ?? 0).padStart(10);
    const cost = formatCost(s.costUsd ?? 0).padStart(8);
    lines.push(`| ${cName} | ${calls} | ${inTok} | ${outTok} | ${cache} | ${cost} |`);
  }
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  const tot = usage.total ?? {};
  lines.push(`| TOTAL COMBINED   | ${String(tot.calls ?? 0).padStart(6)} | ${formatNumber(tot.inputTokens ?? 0).padStart(11)} | ${formatNumber(tot.outputTokens ?? 0).padStart(11)} | ${formatNumber(tot.cacheReadTokens ?? 0).padStart(10)} | ${formatCost(tot.costUsd ?? 0).padStart(8)} |`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  lines.push("");

  if (activeRuns.length) {
    lines.push(`\x1b[1;32mACTIVE RUNS & LIVE ACTIVITY:\x1b[0m`);
    for (const r of activeRuns) {
      const p = r.activePackages?.[0] ?? {};
      const act = p.recentActivity ? `[${p.recentActivity.name}] ${p.recentActivity.detail}` : "Starting...";
      lines.push(` ▶ \x1b[1m[${r.repoName}]\x1b[0m Run: ${r.runId.slice(0, 16)} | Role: \x1b[33m${r.role ?? "unknown"}\x1b[0m (${r.agent ?? "unknown"})`);
      lines.push(`   Task: ${r.title.slice(0, 60)}`);
      lines.push(`   Live Tool: \x1b[36m${act}\x1b[0m`);
      if (p.recentThought) lines.push(`   Thought: \x1b[90m${p.recentThought.slice(0, 70)}\x1b[0m`);
      lines.push("");
    }
  } else {
    lines.push(`\x1b[90m(No active runs right now — standing by for next command...)\x1b[0m`);
    lines.push("");
  }

  lines.push(`\x1b[90mPress Ctrl+C to exit monitor.\x1b[0m`);
  return lines.join("\n");
}


const UI_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "monitor-ui");
// Fixed whitelist: the browser picks a name, never a path, so nothing outside monitor-ui is reachable.
const UI_FILES = {
  "app.js": "text/javascript",
  "telemetry.js": "text/javascript",
  "world.js": "text/javascript",
  "sprites.js": "text/javascript",
  "engine.js": "text/javascript",
  "director.js": "text/javascript",
  "panels.js": "text/javascript",
  "pixel.css": "text/css",
};

export function getHtmlDashboard() {
  return readFileSync(path.join(UI_DIR, "index.html"), "utf8");
}

function serveUiFile(name, res) {
  const type = Object.hasOwn(UI_FILES, name) ? UI_FILES[name] : null;
  if (!type) return false;
  try {
    const body = readFileSync(path.join(UI_DIR, name));
    res.writeHead(200, { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-cache" });
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

export function startMonitor({ workspaceRoot, port = 3456, tui = false, openBrowser: shouldOpen = true, runId = null }) {
  if (tui) {
    console.log(`Starting BAAN TUI Monitor for ${workspaceRoot}... (Press Ctrl+C to exit)`);
    let rendering = false;
    const render = async () => {
      if (rendering) return;
      rendering = true;
      try {
        const state = await getMonitorState(workspaceRoot);
        process.stdout.write("\x1b[2J\x1b[H");
        process.stdout.write(renderTui(state));
      } catch {} finally {
        rendering = false;
      }
    };
    render();
    const interval = setInterval(render, 1000);
    process.on("SIGINT", () => {
      clearInterval(interval);
      process.exit(0);
    });
    return new Promise(() => {}); // Keep alive in terminal
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

      if (url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(getHtmlDashboard());
        return;
      }

      if (url.pathname.startsWith("/ui/") && serveUiFile(url.pathname.slice(4), res)) return;

      if (url.pathname === "/api/quota/refresh" && req.method === "POST") {
        const state = await getMonitorState(workspaceRoot, true);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state));
        return;
      }

      if (url.pathname === "/api/stats") {
        const state = await getMonitorState(workspaceRoot);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state));
        return;
      }

      if (url.pathname === "/api/runs") {
        const runs = getRecentRuns(workspaceRoot, 30);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(runs));
        return;
      }

      if (url.pathname === "/api/stream") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });

        let sending = false;
        const send = async () => {
          if (sending) return;
          sending = true;
          try {
            const state = await getMonitorState(workspaceRoot);
            res.write(`data: ${JSON.stringify(state)}\n\n`);
          } catch {} finally {
            sending = false;
          }
        };

        send();
        const timer = setInterval(send, 1000);
        req.on("close", () => clearInterval(timer));
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Try a different port with --port <number>`);
      }
      reject(err);
    });

    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(`\n======================================================`);
      console.log(`🏗️  BAAN Live Monitor Dashboard running at: ${url}`);
      console.log(`   Workspace: ${workspaceRoot}`);
      console.log(`   Press Ctrl+C to stop monitor.`);
      console.log(`======================================================\n`);
      if (shouldOpen) {
        openBrowser(url);
      }
      resolve({ server, port, url });
    });
  });
}
