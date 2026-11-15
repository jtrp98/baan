import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scanActiveRuns, aggregateWorkspaceUsage, getRecentRuns, getRecentCallEnds } from "./usage-aggregator.mjs";
import { loadLocalConfig, isAgentEnabled } from "./config.mjs";

function readAgentsEnabled() {
  try {
    const local = loadLocalConfig();
    return Object.fromEntries(["claude", "codex", "agy"].map((a) => [a, isAgentEnabled(a, local)]));
  } catch {
    return null;
  }
}

const LOCAL_HOST = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
const MAX_BODY = 64 * 1024;

export function getAvailableWorkspaces(currentWorkspaceRoot) {
  const currentNormalized = path.resolve(currentWorkspaceRoot);
  const result = [];
  const seen = new Set();
  try {
    const local = loadLocalConfig();
    for (const ws of local.workspaces || []) {
      const p = path.resolve(ws.path);
      if (!seen.has(p.toLowerCase()) && existsSync(p)) {
        seen.add(p.toLowerCase());
        result.push({ name: ws.name || path.basename(p), path: p });
      }
    }
  } catch {}

  if (!seen.has(currentNormalized.toLowerCase())) {
    result.unshift({ name: path.basename(currentNormalized), path: currentNormalized });
  }

  return result;
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return "0";
  return Number(num).toLocaleString();
}

// null = the provider reports no price (codex, agy); "$0.00" read as free.
export function formatCost(num) {
  if (num == null || isNaN(num)) return "n/a";
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

export async function getMonitorState(workspaceRoot) {
  const activeRuns = scanActiveRuns(workspaceRoot);
  const usage = aggregateWorkspaceUsage(workspaceRoot);
  const recentRuns = getRecentRuns(workspaceRoot, 10);
  const workspaces = getAvailableWorkspaces(workspaceRoot);
  return {
    workspaceRoot,
    workspaceName: path.basename(workspaceRoot),
    workspaces,
    activeRuns,
    usage,
    // Provider quotas are only readable from their private endpoints or auth files, which the ToS rules forbid;
    // the UI shows null as UNAVAILABLE rather than a guessed 0%.
    quota: null,
    recentRuns,
    recentCallEnds: getRecentCallEnds(workspaceRoot),
    agentsEnabled: readAgentsEnabled(),
    timestamp: new Date().toISOString(),
  };
}

// Telemetry carries text from models, commands and file names; an ESC sequence in it would drive the terminal
// (clear the screen, write the clipboard via OSC 52). Only BAAN's own colour codes may reach the TTY.
export const plain = (value) => String(value ?? "").replace(/[\u0000-\u001f\u007f-\u009f]/g, " ");

export function renderTui(state) {
  const { activeRuns, usage } = state;
  const workspaceName = plain(state.workspaceName);
  const lines = [];
  lines.push(`\x1b[1;36m========================================================================\x1b[0m`);
  lines.push(`\x1b[1;32m 🏗️  BAAN MONITOR  \x1b[0m — Workspace: \x1b[1m${workspaceName}\x1b[0m | Active: \x1b[1;33m${activeRuns.length} run(s)\x1b[0m`);
  lines.push(`\x1b[1;36m========================================================================\x1b[0m`);
  lines.push("");

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
    const cost = formatCost(s.calls ? s.costUsd : 0).padStart(8);
    lines.push(`| ${cName} | ${calls} | ${inTok} | ${outTok} | ${cache} | ${cost} |`);
  }
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  const tot = usage.total ?? {};
  lines.push(`| TOTAL COMBINED   | ${String(tot.calls ?? 0).padStart(6)} | ${formatNumber(tot.inputTokens ?? 0).padStart(11)} | ${formatNumber(tot.outputTokens ?? 0).padStart(11)} | ${formatNumber(tot.cacheReadTokens ?? 0).padStart(10)} | ${formatCost(tot.calls ? tot.costUsd : 0).padStart(8)} |`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  lines.push("");

  if (activeRuns.length) {
    lines.push(`\x1b[1;32mACTIVE RUNS & LIVE ACTIVITY:\x1b[0m`);
    for (const r of activeRuns) {
      const p = r.activePackages?.[0] ?? {};
      const act = p.recentActivity ? `[${plain(p.recentActivity.name)}] ${plain(p.recentActivity.detail)}` : "Starting...";
      lines.push(` ▶ \x1b[1m[${plain(r.repoName)}]\x1b[0m Run: ${plain(r.runId).slice(0, 16)} | Role: \x1b[33m${plain(r.role ?? "unknown")}\x1b[0m (${plain(r.agent ?? "unknown")})`);
      lines.push(`   Task: ${plain(r.title).slice(0, 60)}`);
      lines.push(`   Live Tool: \x1b[36m${act}\x1b[0m`);
      if (p.recentThought) lines.push(`   Thought: \x1b[90m${plain(p.recentThought).slice(0, 70)}\x1b[0m`);
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

export function startMonitor({ workspaceRoot, port = 3456, tui = false, openBrowser: shouldOpen = true }) {
  let currentWorkspaceRoot = workspaceRoot;
  if (tui) {
    console.log(`Starting BAAN TUI Monitor for ${workspaceRoot}... (Press Ctrl+C to exit)`);
    let rendering = false;
    const render = async () => {
      if (rendering) return;
      rendering = true;
      try {
        const state = await getMonitorState(currentWorkspaceRoot);
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

  // Every open tab polls each second; build the state once per tick and share it instead of once per client.
  let shared = { root: null, at: 0, promise: null };
  const sharedState = () => {
    if (shared.root !== currentWorkspaceRoot || Date.now() - shared.at >= 900) {
      shared = { root: currentWorkspaceRoot, at: Date.now(), promise: getMonitorState(currentWorkspaceRoot) };
    }
    return shared.promise;
  };

  return new Promise((resolve, reject) => {
    const handle = async (req, res) => {
      // Telemetry carries commands, paths and model thoughts; only a local page may read it (blocks DNS rebinding).
      if (!LOCAL_HOST.test(req.headers.host ?? "")) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }
      const url = new URL(req.url, "http://localhost");

      if (url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(getHtmlDashboard());
        return;
      }

      if (url.pathname.startsWith("/ui/") && serveUiFile(url.pathname.slice(4), res)) return;

      if (url.pathname === "/api/workspace/select") {
        // POST only: a GET could be fired by any <img> tag on another site.
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "text/plain", Allow: "POST" });
          res.end("Method Not Allowed");
          return;
        }
        const switchWorkspace = async (target) => {
          if (target) {
            // Only known workspaces: probing an arbitrary path (e.g. a UNC share) leaks credentials on Windows.
            const known = [...getAvailableWorkspaces(currentWorkspaceRoot), { path: path.resolve(workspaceRoot) }];
            const found = typeof target === "string" && known.find((w) => path.resolve(w.path).toLowerCase() === path.resolve(target).toLowerCase());
            if (!found) {
              res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
              res.end(JSON.stringify({ error: "workspace not registered in local.json" }));
              return;
            }
            currentWorkspaceRoot = found.path;
          }
          const state = await getMonitorState(currentWorkspaceRoot);
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(state));
        };

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
          if (body.length > MAX_BODY) req.destroy();
        });
        req.on("end", async () => {
          try {
            const data = JSON.parse(body || "{}");
            await switchWorkspace(data.path);
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      if (url.pathname === "/api/stats") {
        const state = await sharedState();
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state));
        return;
      }

      if (url.pathname === "/api/runs") {
        const runs = getRecentRuns(currentWorkspaceRoot, 30);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(runs));
        return;
      }

      if (url.pathname === "/api/stream") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        });

        let sending = false;
        const send = async () => {
          if (sending) return;
          sending = true;
          try {
            const state = await sharedState();
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
    };

    const server = http.createServer((req, res) => {
      handle(req, res).catch((err) => {
        if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: err.message }));
      });
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Try a different port with --port <number>`);
      }
      reject(err);
    });

    server.listen(port, "127.0.0.1", () => {
      const url = `http://127.0.0.1:${port}`;
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
