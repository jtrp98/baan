import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import { scanActiveRuns, aggregateWorkspaceUsage, getRecentRuns, getRecentCallEnds } from "../src/usage-aggregator.mjs";
import { formatNumber, formatCost, renderTui, startMonitor, getAvailableWorkspaces } from "../src/monitor.mjs";
import { parse } from "../src/cli.mjs";

function makeFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "baan-monitor-test-"));
  const runsDir = path.join(root, ".baan", "runs");
  mkdirSync(runsDir, { recursive: true });

  const run1 = path.join(runsDir, "2026-11-08T10-00-00-run1");
  mkdirSync(run1, { recursive: true });
  writeFileSync(
    path.join(run1, "run.json"),
    JSON.stringify({
      id: "run1",
      mode: "planned",
      packages: [{ id: "WP-1", title: "Add auth", state: "done", repo: { path: path.join(root, "school-bot") } }],
    })
  );
  writeFileSync(
    path.join(run1, "ledger.jsonl"),
    [
      JSON.stringify({ type: "run_created" }),
      JSON.stringify({
        type: "call_end",
        agent: "claude",
        role: "worker",
        durationMs: 5000,
        ok: true,
        usage: { inputTokens: 1000, outputTokens: 200, cacheReadTokens: 500, costUsd: 0.05, turns: 2 },
      }),
      JSON.stringify({
        type: "call_end",
        agent: "codex",
        role: "verifier",
        durationMs: 3000,
        ok: true,
        usage: { inputTokens: 800, outputTokens: 100, cacheReadTokens: 200, costUsd: 0.02, turns: 1 },
      }),
    ].join("\n") + "\n"
  );

  const run2 = path.join(runsDir, "2026-11-08T10-10-00-run2");
  mkdirSync(run2, { recursive: true });
  writeFileSync(
    path.join(run2, "run.json"),
    JSON.stringify({
      id: "run2",
      mode: "direct",
      packages: [{ id: "WP-2", title: "Update gateway", state: "running", repo: { path: path.join(root, "sb-api-gateway") } }],
    })
  );
  writeFileSync(
    path.join(run2, "active-WP-2.json"),
    JSON.stringify({
      runId: "run2",
      packageId: "WP-2",
      title: "Update gateway",
      repoName: "sb-api-gateway",
      role: "worker",
      agent: "claude",
      recentActivity: { type: "tool", name: "bash", detail: "npm test" },
      recentThought: "Verifying router endpoint",
      history: [{ type: "tool", name: "bash", detail: "npm test" }],
      usage: { inputTokens: 500, outputTokens: 50, costUsd: 0.01 },
    })
  );

  return {
    root,
    cleanup: () => {
      try { rmSync(root, { recursive: true, force: true }); } catch {}
    },
  };
}

test("monitor: scanActiveRuns detects in-flight package state", (t) => {
  const { root, cleanup } = makeFixture();
  t.after(cleanup);

  const active = scanActiveRuns(root);
  assert.equal(active.length, 1);
  assert.equal(active[0].runId, "2026-11-08T10-10-00-run2");
  assert.equal(active[0].repoName, "sb-api-gateway");
  assert.equal(active[0].role, "worker");
  assert.equal(active[0].activePackages[0].recentActivity.name, "bash");
});

test("monitor: aggregateWorkspaceUsage computes multi-CLI metrics across runs", (t) => {
  const { root, cleanup } = makeFixture();
  t.after(cleanup);

  const summary = aggregateWorkspaceUsage(root);
  assert.equal(summary.total.runs, 2);
  assert.equal(summary.total.completedRuns, 1);
  assert.equal(summary.agents.claude.calls, 1);
  assert.equal(summary.agents.claude.inputTokens, 1000);
  assert.equal(summary.agents.codex.calls, 1);
  assert.equal(summary.agents.codex.inputTokens, 800);
  assert.equal(summary.agents.agy.calls, 0);
  assert.equal(summary.total.inputTokens, 1800);
  assert.equal(summary.total.costUsd, 0.07);
});

test("monitor: getRecentRuns lists sorted recent history", (t) => {
  const { root, cleanup } = makeFixture();
  t.after(cleanup);

  const recent = getRecentRuns(root, 5);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].id, "run2");
  assert.equal(recent[1].id, "run1");
  assert.equal(recent[1].isDone, true);
});

test("monitor: CLI parse supports monitor, ui, and flags", () => {
  const parsed1 = parse(["monitor", "--port", "4000", "--no-open"]);
  assert.equal(parsed1.command, "monitor");
  assert.equal(parsed1.port, "4000");
  assert.equal(parsed1["no-open"], true);

  const parsed2 = parse(["ui", "--tui"]);
  assert.equal(parsed2.command, "ui");
  assert.equal(parsed2.tui, true);
});

test("monitor: renderTui and formatting helpers generate valid display", () => {
  assert.equal(formatNumber(15420), "15,420");
  assert.equal(formatCost(0.1256), "$0.126");

  const tuiText = renderTui({
    workspaceName: "schoolbright",
    activeRuns: [],
    usage: {
      agents: {
        claude: { calls: 2, inputTokens: 1000, outputTokens: 200, cacheReadTokens: 100, costUsd: 0.05 },
        codex: { calls: 1, inputTokens: 500, outputTokens: 50, cacheReadTokens: 0, costUsd: 0.01 },
        agy: { calls: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, costUsd: 0 },
      },
      total: { calls: 3, inputTokens: 1500, outputTokens: 250, cacheReadTokens: 100, costUsd: 0.06 },
    },
  });
  assert.ok(tuiText.includes("BAAN MONITOR"));
  assert.ok(tuiText.includes("Claude Code"));
  assert.ok(tuiText.includes("Codex CLI"));
  assert.ok(tuiText.includes("Google AGY"));
});

test("monitor: HTTP server responds with HTML, stats, and stream endpoints", async (t) => {
  const { root, cleanup } = makeFixture();
  t.after(cleanup);

  const port = 34560 + Math.floor(Math.random() * 500);
  const monitorInstance = await startMonitor({
    workspaceRoot: root,
    port,
    openBrowser: false,
    tui: false,
  });
  t.after(() => monitorInstance.server.close());

  const fetchGet = (urlPath) =>
    new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${urlPath}`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      }).on("error", reject);
    });

  const htmlRes = await fetchGet("/");
  assert.equal(htmlRes.statusCode, 200);
  assert.ok(htmlRes.body.includes("BAAN Live Monitor"));

  const statsRes = await fetchGet("/api/stats");
  assert.equal(statsRes.statusCode, 200);
  const stats = JSON.parse(statsRes.body);
  assert.equal(stats.activeRuns.length, 1);
  assert.equal(stats.activeRuns[0].repoName, "sb-api-gateway");
  assert.equal(stats.usage.total.calls, 2);

  const runsRes = await fetchGet("/api/runs");
  assert.equal(runsRes.statusCode, 200);
  const runs = JSON.parse(runsRes.body);
  assert.equal(runs.length, 2);
  assert.equal(runs[0].packageStates[0].state, "running");

  assert.ok(Array.isArray(stats.recentCallEnds));
  assert.ok("agentsEnabled" in stats);

  for (const f of ["app.js", "telemetry.js", "world.js", "pixel.css"]) {
    const r = await fetchGet(`/ui/${f}`);
    assert.equal(r.statusCode, 200, f);
  }
  assert.match((await fetchGet("/ui/app.js")).headers["content-type"], /javascript/);
  for (const bad of ["/ui/../package.json", "/ui/..%2Fmonitor.mjs", "/ui/index.html", "/ui/", "/ui/nope.js"]) {
    assert.equal((await fetchGet(bad)).statusCode, 404, bad);
  }
});

test("monitor: recent call_end events and missing identity are reported truthfully", (t) => {
  const { root, cleanup } = makeFixture();
  t.after(cleanup);
  const runDir = path.join(root, ".baan", "runs", "2026-11-08T10-10-00-run2");
  const now = new Date().toISOString();
  writeFileSync(path.join(runDir, "ledger.jsonl"), JSON.stringify({ at: now, type: "call_end", package: "WP-2", role: "planner", agent: "claude", ok: false }) + "\n");
  writeFileSync(path.join(runDir, "active-WP-2.json"), JSON.stringify({ runId: "run2", packageId: "WP-2", title: "x", repoName: "sb-api-gateway", updatedAt: "2020-01-01T00:00:00.000Z" }));

  const ends = getRecentCallEnds(root);
  assert.equal(ends.length, 1);
  assert.deepEqual([ends[0].role, ends[0].agent, ends[0].ok, ends[0].runId], ["planner", "claude", false, "2026-11-08T10-10-00-run2"]);

  const [active] = scanActiveRuns(root);
  assert.equal(active.role, null, "no fabricated role");
  assert.equal(active.agent, null, "no fabricated provider");
  assert.equal(active.activePackages[0].stale, true);

  const tui = renderTui({ workspaceName: "w", activeRuns: [active], usage: { agents: {}, total: {} } });
  assert.match(tui, /Role: .*unknown/);
});

test("monitor: workspace switcher updates active workspace and telemetry", async (t) => {
  const f1 = makeFixture();
  const f2 = makeFixture();
  t.after(() => { f1.cleanup(); f2.cleanup(); });

  const port = 34600 + Math.floor(Math.random() * 500);
  const monitorInstance = await startMonitor({
    workspaceRoot: f1.root,
    port,
    openBrowser: false,
    tui: false,
  });
  t.after(() => monitorInstance.server.close());

  const fetchGet = (urlPath) =>
    new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${urlPath}`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      }).on("error", reject);
    });

  const fetchPost = (urlPath, data) =>
    new Promise((resolve, reject) => {
      const payload = JSON.stringify(data);
      const req = http.request(`http://localhost:${port}${urlPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
      }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      });
      req.on("error", reject);
      req.write(payload);
      req.end();
    });

  const initialStats = JSON.parse((await fetchGet("/api/stats")).body);
  assert.equal(initialStats.workspaceRoot, f1.root);
  assert.ok(initialStats.workspaces.length >= 1);

  const switchRes = await fetchPost("/api/workspace/select", { path: f2.root });
  assert.equal(switchRes.statusCode, 200);
  const switchedState = JSON.parse(switchRes.body);
  assert.equal(switchedState.workspaceRoot, f2.root);

  const newStats = JSON.parse((await fetchGet("/api/stats")).body);
  assert.equal(newStats.workspaceRoot, f2.root);
});
