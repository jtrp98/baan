import test from "node:test";
import assert from "node:assert/strict";
import {
  toSessions, diffSessions, resolveEnded, findCallEnd, quotaWindows, quotaLevel, providerQuotaLevels,
  connectionStatus, pipelineView, projectsOf, activityToUiState, stateMeta, PACKAGE_STATES, VERDICT_WAIT_MS,
} from "../src/monitor-ui/telemetry.js";
import * as world from "../src/monitor-ui/world.js";

const T0 = "2026-11-09T10:00:00.000Z";

function pkg(over = {}) {
  return {
    runId: "run-a", packageId: "WP-1", title: "Add auth", repoName: "school-bot", repoPath: "/w/school-bot",
    role: "worker", agent: "codex", startedAt: T0, updatedAt: T0,
    recentActivity: null, recentThought: "", history: [], ...over,
  };
}

function stateWith(...packages) {
  const byRun = new Map();
  for (const p of packages) {
    const run = byRun.get(p.runId) ?? { runId: p.runId, repoName: p.repoName, title: p.title, activePackages: [], runInfo: { packages: [] } };
    run.activePackages.push(p);
    run.runInfo.packages.push({ id: p.packageId, state: p._state ?? "running", repoName: p.repoName });
    byRun.set(p.runId, run);
  }
  return { activeRuns: [...byRun.values()], usage: { agents: {}, total: {}, projects: {} }, recentRuns: [] };
}

test("pixel-ui: all idle → no sessions, empty pipeline, NO DATA differs from idle", () => {
  const s = toSessions(stateWith());
  assert.deepEqual(s, []);
  const pv = pipelineView(stateWith(), s);
  assert.equal(pv.orchestrator, false);
  assert.equal(pv.planner || pv.worker || pv.verifier, false);
  assert.equal(connectionStatus({ hasState: true, connected: true }), "LIVE");
  assert.equal(connectionStatus({ hasState: false, connected: false }), "NO DATA");
  assert.equal(connectionStatus({ hasState: true, connected: false }), "RECONNECTING");
  assert.deepEqual(toSessions(null), []);
});

test("pixel-ui: role + provider pairs come from telemetry (claude planner, codex worker, agy verifier)", () => {
  const st = stateWith(
    pkg({ runId: "r1", role: "planner", agent: "claude" }),
    pkg({ runId: "r2", role: "worker", agent: "codex", recentActivity: { type: "tool", name: "edit_file", detail: "src/a.js" } }),
    pkg({ runId: "r3", role: "verifier", agent: "agy" }),
  );
  const s = toSessions(st);
  assert.deepEqual(s.map((x) => [x.role, x.provider, x.station]), [["planner", "claude", "planner"], ["worker", "codex", "worker"], ["verifier", "agy", "verifier"]]);
  assert.equal(s[0].uiState, "PLANNING");
  assert.equal(s[1].uiState, "CODING");
  assert.equal(s[1].bubble, "WORKER + CODEX — EDITING CODE");
  assert.equal(s[2].uiState, "VERIFYING");
  const pv = pipelineView(st, s);
  assert.ok(pv.orchestrator && pv.planner && pv.worker && pv.verifier);
  assert.equal(pv.activeRunCount, 3);
});

test("pixel-ui: tool activity maps to UI states", () => {
  assert.equal(activityToUiState({ name: "read_file" }, "", "worker"), "READING");
  assert.equal(activityToUiState({ name: "Edit" }, "", "worker"), "CODING");
  assert.equal(activityToUiState({ name: "bash", detail: "npm test" }, "", "verifier"), "EXECUTING");
  assert.equal(activityToUiState(null, "hmm", "worker"), "THINKING");
  assert.equal(activityToUiState(null, "", null), "PROCESSING");
});

test("pixel-ui: provider changing role = one ended + one started in the same diff", () => {
  const a = toSessions(stateWith(pkg({ role: "planner", agent: "claude" })));
  const prev = new Map(a.map((x) => [x.key, x]));
  const b = toSessions(stateWith(pkg({ role: "worker", agent: "claude" })));
  const d = diffSessions(prev, b);
  assert.equal(d.ended.length, 1);
  assert.equal(d.ended[0].role, "planner");
  assert.equal(d.started.length, 1);
  assert.equal(d.started[0].station, "worker");
  assert.equal(d.started[0].provider, "claude");
});

test("pixel-ui: multiple sessions of one provider stay separate; multiple providers coexist", () => {
  const s = toSessions(stateWith(
    pkg({ runId: "r1", packageId: "WP-1", role: "worker", agent: "codex", repoName: "project-a" }),
    pkg({ runId: "r2", packageId: "WP-9", role: "verifier", agent: "codex", repoName: "project-b" }),
    pkg({ runId: "r3", packageId: "WP-3", role: "planner", agent: "claude" }),
    pkg({ runId: "r4", packageId: "WP-4", role: "worker", agent: "agy" }),
  ));
  assert.equal(s.filter((x) => x.provider === "codex").length, 2);
  assert.equal(new Set(s.map((x) => x.key)).size, 4);
  assert.deepEqual(new Set(s.map((x) => x.provider)), new Set(["claude", "codex", "agy"]));
});

test("pixel-ui: unknown role / provider are never guessed", () => {
  const s = toSessions(stateWith(pkg({ role: undefined, agent: "codex" }), pkg({ runId: "r2", role: "worker", agent: "mystery" })));
  const noRole = s.find((x) => x.provider === "codex");
  assert.equal(noRole.role, null);
  assert.equal(noRole.station, "cli");
  assert.match(noRole.bubble, /ROLE UNKNOWN/);
  const noProv = s.find((x) => x.role === "worker");
  assert.equal(noProv.provider, null);
  assert.equal(noProv.providerLabel, "mystery");
});

test("pixel-ui: quota warning levels and missing quota is unavailable, not zero", () => {
  assert.equal(quotaLevel(70), "ok");
  assert.equal(quotaLevel(30), "warn");
  assert.equal(quotaLevel(10), "warn");
  assert.equal(quotaLevel(9), "low");
  assert.equal(quotaLevel(null), "unknown");
  const q = {
    claude: { available: true, sessionUsedPct: 95, sessionRemainingPct: 5, weeklyUsedPct: 40, weeklyRemainingPct: 60 },
    codex: { available: false },
    agy: { available: true, gemini5hRemainingPct: null, geminiWeeklyRemainingPct: 80, argonWeeklyRemainingPct: null },
  };
  const w = quotaWindows(q);
  assert.equal(w.claude[0].remainingPct, 5);
  assert.deepEqual(w.codex, []);
  assert.equal(w.agy[0].remainingPct, null);
  assert.equal(w.agy[1].remainingPct, 80);
  assert.deepEqual(providerQuotaLevels(q), { claude: "low", codex: "unknown", agy: "ok" });
  assert.deepEqual(providerQuotaLevels(null), { claude: "unknown", codex: "unknown", agy: "unknown" });
});

test("pixel-ui: completion verdict comes only from call_end after the session started", () => {
  const [s] = toSessions(stateWith(pkg({ role: "worker", agent: "codex" })));
  const okEnd = { at: "2026-11-09T10:05:00.000Z", runId: "run-a", package: "WP-1", role: "worker", agent: "codex", ok: true };
  const oldFail = { ...okEnd, at: "2026-11-09T09:00:00.000Z", ok: false };
  assert.equal(findCallEnd([oldFail], s), null);
  assert.equal(findCallEnd([oldFail, okEnd], s), "success");
  assert.equal(findCallEnd([{ ...okEnd, ok: false }], s), "error");

  const now = Date.now();
  let r = resolveEnded([{ session: s, endedAt: now }], [], now + 100);
  assert.equal(r.resolved.length, 0, "waits for a late call_end instead of guessing");
  r = resolveEnded(r.pending, [], now + VERDICT_WAIT_MS + 1);
  assert.deepEqual(r.resolved.map((x) => x.verdict), [null], "no call_end → unknown outcome, not success");
  r = resolveEnded([{ session: s, endedAt: now }], [{ ...okEnd, ok: false }], now + 100);
  assert.deepEqual(r.resolved.map((x) => x.verdict), ["error"]);
});

test("pixel-ui: project scope filters sessions and pipeline", () => {
  const st = stateWith(pkg({ runId: "r1", repoName: "project-a" }), pkg({ runId: "r2", repoName: "project-b", role: "verifier", agent: "agy" }));
  assert.equal(toSessions(st, "project-a").length, 1);
  assert.equal(toSessions(st, "all").length, 2);
  const pv = pipelineView(st, toSessions(st, "project-b"), "project-b");
  assert.equal(pv.activeRunCount, 1);
  assert.equal(pv.verifier, true);
  assert.equal(pv.worker, false);
  assert.deepEqual(projectsOf(st), ["project-a", "project-b"]);
});

test("pixel-ui: unchanged telemetry produces an empty diff (no animation restarts)", () => {
  const st = stateWith(pkg({ recentActivity: { type: "tool", name: "bash", detail: "npm test" } }));
  const first = toSessions(st);
  const d1 = diffSessions(new Map(), first);
  assert.equal(d1.started.length, 1);
  const again = toSessions(JSON.parse(JSON.stringify(st)));
  const d2 = diffSessions(d1.next, again);
  assert.deepEqual([d2.started.length, d2.changed.length, d2.ended.length], [0, 0, 0]);
  const moved = toSessions(stateWith(pkg({ recentActivity: { type: "tool", name: "read_file", detail: "a" } })));
  const d3 = diffSessions(d1.next, moved);
  assert.deepEqual(d3.changed[0].fields, ["uiState"]);
});

test("pixel-ui: every BAAN package state keeps a distinct, non-success meaning", () => {
  for (const s of ["pending", "probing", "running", "gating", "verifying", "done", "waiting_human", "stale", "env_failed", "blocked", "cancelled"]) {
    assert.ok(PACKAGE_STATES[s], s);
  }
  assert.notEqual(stateMeta("stale").tone, "success");
  assert.notEqual(stateMeta("cancelled").tone, "success");
  assert.equal(stateMeta("waiting_human").tone, "human");
  assert.equal(stateMeta("weird").label, "WEIRD");
});

test("pixel-ui: office map — every seat and idle point reachable from every provider home, never through walls", () => {
  for (const home of Object.values(world.PROVIDER_HOME)) {
    assert.ok(world.isWalkable(home.x, home.y));
    for (const seat of world.allSeats()) {
      const path = world.findPath(home, seat);
      assert.ok(path, `no path to ${seat.station} seat ${seat.x},${seat.y}`);
      for (const t of path) assert.ok(world.isWalkable(t.x, t.y));
      for (let i = 1; i < path.length; i++) {
        assert.equal(Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y), 1);
      }
    }
    for (const [zone, pts] of Object.entries(world.IDLE_POINTS)) {
      for (const [x, y] of pts) {
        assert.equal(world.zoneAt(x, y), zone);
        assert.ok(world.findPath(home, { x, y }), `idle ${zone} ${x},${y}`);
      }
    }
  }
  assert.equal(world.findPath({ x: 1, y: 2 }, { x: 0, y: 0 }), null);
  const seats = world.allSeats().map((s) => `${s.x},${s.y}`);
  assert.equal(new Set(seats).size, seats.length, "no two seats share a tile");
});
