import test from "node:test";
import assert from "node:assert/strict";
import {
  toSessions, diffSessions, resolveEnded, findCallEnd, quotaWindows, quotaLevel, providerQuotaLevels,
  connectionStatus, pipelineView, projectsOf, activityToUiState, stateMeta, PACKAGE_STATES, VERDICT_WAIT_MS,
} from "../src/monitor-ui/telemetry.js";
import * as telemetry from "../src/monitor-ui/telemetry.js";
import { Director } from "../src/monitor-ui/director.js";
import * as world from "../src/monitor-ui/world.js";
import { createPanels, formatCompactTokens, formatDisplayPath, formatFeedType } from "../src/monitor-ui/panels.js";
import { Engine } from "../src/monitor-ui/engine.js";
import * as sprites from "../src/monitor-ui/sprites.js";

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

test("pixel-ui: liveSessions (live-chat + nested subagents) route CHAT_ROLES onto desks in Director", () => {
  const st = {
    workspaceName: "schoolbright",
    activeRuns: [],
    liveSessions: [
      {
        source: "hook", isSubagent: false, parentSessionId: null, sessionId: "conv-parent",
        provider: "agy", model: "gemini-4-hydrogen", role: null, roleLabel: "live chat",
        title: "เก็บ requirement standalone login", repoName: "schoolbright", repoPath: "C:/src/schoolbright",
        startedAt: T0, updatedAt: T0, recentActivity: { type: "tool", name: "invoke_subagent", detail: "spec" },
      },
      {
        source: "hook", isSubagent: true, parentSessionId: "conv-parent", sessionId: "conv-child",
        provider: "agy", model: "gemini-3.8-flash", role: "spec", roleLabel: "spec: standalone",
        title: "Survey auth flow", repoName: "sb-web-school-robot", repoPath: "C:/src/schoolbright/target/sb-web-school-robot",
        startedAt: T0, updatedAt: T0, recentActivity: { type: "tool", name: "read_file", detail: "auth.ts" },
      },
    ],
    usage: { agents: {}, total: {}, projects: {} },
    recentRuns: [],
  };

  const sessions = toSessions(st);
  assert.equal(sessions.length, 2);
  assert.equal(sessions[0].isSubagent, false);
  assert.equal(sessions[0].station, "cli");
  assert.equal(sessions[1].isSubagent, true);
  assert.equal(sessions[1].role, "spec");
  assert.equal(sessions[1].station, "spec");
  assert.equal(sessions[1].uiState, "READING");
  assert.deepEqual(projectsOf(st), ["sb-web-school-robot"]);

  const chars = new Map();
  const fakeEngine = {
    addCharacter: (cfg) => {
      const c = { ...cfg, moving: false, mode: "idle", goTo() {}, setWork() {}, setBubble(b) { c.bubble = b; }, startIdle() { c.mode = "idle"; }, stopIdle() {}, setOffline() {}, react() {} };
      chars.set(cfg.id, c);
      return c;
    },
    getCharacter: (id) => chars.get(id) ?? null,
    removeCharacter: (id) => chars.delete(id),
    characters: () => [...chars.values()],
    reserve() {}, release() {}, setStationActive() {}, requestRender() {},
  };

  const d = new Director(fakeEngine, { world, telemetry });
  d.init();
  d.update({ sessions, now: Date.now() });
  assert.equal(d._inspectRole("spec").status, "WORKING");
  assert.equal(d._inspectRole("spec").telemetry, "live");
  assert.match(chars.get("role:spec").bubble, /GATHERING SPEC/);

  d.update({ sessions: [], now: Date.now(), reconcile: true });
  assert.equal(d._inspectRole("spec").status, "IDLE");
  assert.equal(d._inspectRole("spec").telemetry, "hook");
});

function makeFakeDom(ids = []) {
  const byId = new Map();
  const matchSel = (node, sel) => {
    if (!node || node.nodeType !== 1) return false;
    return sel.split(",").map((s) => s.trim()).some((part) => {
      const clean = part.replace(/^:scope\s*>\s*/, "");
      if (clean.startsWith(".")) return node.classList.contains(clean.slice(1));
      if (clean.startsWith("[")) {
        const m = clean.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
        if (!m) return false;
        const val = node.getAttribute(m[1]);
        return m[2] !== undefined ? val === m[2] : val !== null;
      }
      return node.tagName.toLowerCase() === clean.toLowerCase();
    });
  };
  const makeNode = (tagName, nodeType = 1) => {
    const attrs = new Map();
    const listeners = new Map();
    const toAttr = (k) => "data-" + String(k).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    const toProp = (a) => a.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const dataset = new Proxy({}, {
      get: (_, k) => (typeof k === "string" ? (attrs.has(toAttr(k)) ? attrs.get(toAttr(k)) : undefined) : undefined),
      set: (_, k, v) => { attrs.set(toAttr(k), String(v)); return true; },
      deleteProperty: (_, k) => attrs.delete(toAttr(k)),
      has: (_, k) => typeof k === "string" && attrs.has(toAttr(k)),
      ownKeys: () => [...attrs.keys()].filter((k) => k.startsWith("data-")).map(toProp),
      getOwnPropertyDescriptor: (_, k) => (typeof k === "string" && attrs.has(toAttr(k))
        ? { enumerable: true, configurable: true, value: attrs.get(toAttr(k)) } : undefined),
    });
    const node = {
      nodeType,
      tagName: String(tagName || "DIV").toUpperCase(),
      parentNode: null,
      children: [],
      childNodes: [],
      dataset,
      style: { setProperty(k, v) { this[k] = v; } },
      _text: "",
      open: false,
      hidden: false,
      value: "",
      title: "",
      type: "",
      scrollTop: 0,
      isConnected: true,
      get className() { return attrs.get("class") ?? ""; },
      set className(v) { attrs.set("class", String(v)); },
      classList: {
        _list() { return (attrs.get("class") ?? "").split(/\s+/).filter(Boolean); },
        add(...cs) { const s = new Set(this._list()); for (const c of cs) if (c) s.add(c); attrs.set("class", [...s].join(" ")); },
        remove(...cs) { const rm = new Set(cs); attrs.set("class", this._list().filter((c) => !rm.has(c)).join(" ")); },
        toggle(c, force) { const has = this.contains(c); const on = force !== undefined ? !!force : !has; if (on) this.add(c); else this.remove(c); return on; },
        contains(c) { return this._list().includes(c); },
      },
      setAttribute(k, v) { attrs.set(k, String(v)); if (k === "id") byId.set(String(v), node); },
      getAttribute(k) { return attrs.has(k) ? attrs.get(k) : null; },
      hasAttribute(k) { return attrs.has(k); },
      removeAttribute(k) { attrs.delete(k); },
      get id() { return attrs.get("id") ?? ""; },
      set id(v) { attrs.set("id", String(v)); byId.set(String(v), node); },
      get textContent() {
        if (node.nodeType === 3 || node.nodeType === 11 && !node.childNodes.length) return node._text;
        return node.childNodes.length ? node.childNodes.map((c) => c.textContent).join("") : node._text;
      },
      set textContent(v) {
        node.childNodes = [];
        node.children = [];
        node._text = String(v ?? "");
      },
      get firstElementChild() { return node.children[0] ?? null; },
      get nextElementSibling() {
        if (!node.parentNode) return null;
        const idx = node.parentNode.children.indexOf(node);
        return idx >= 0 ? (node.parentNode.children[idx + 1] ?? null) : null;
      },
      _detach(c) {
        if (!c.parentNode) return;
        const p = c.parentNode;
        p.childNodes = p.childNodes.filter((x) => x !== c);
        p.children = p.children.filter((x) => x !== c);
        c.parentNode = null;
      },
      _insertAt(c, idx) {
        if (c.nodeType === 11) {
          const kids = [...c.childNodes];
          c.childNodes = [];
          c.children = [];
          for (let i = 0; i < kids.length; i++) node._insertAt(kids[i], idx + i);
          return c;
        }
        node._detach(c);
        node.childNodes.splice(idx, 0, c);
        if (c.nodeType === 1) node.children = node.childNodes.filter((x) => x.nodeType === 1);
        c.parentNode = node;
        return c;
      },
      appendChild(c) { return node._insertAt(c, node.childNodes.length); },
      append(...items) { for (const x of items) node.appendChild(typeof x === "string" ? doc.createTextNode(x) : x); },
      prepend(...items) { for (let i = items.length - 1; i >= 0; i--) node._insertAt(typeof items[i] === "string" ? doc.createTextNode(items[i]) : items[i], 0); },
      insertBefore(newNode, refNode) {
        if (refNode == null) return node.appendChild(newNode);
        if (refNode.parentNode !== node) {
          throw new DOMException("Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.", "NotFoundError");
        }
        const idx = node.childNodes.indexOf(refNode);
        return node._insertAt(newNode, idx);
      },
      replaceWith(other) {
        if (!node.parentNode) return;
        const p = node.parentNode;
        const idx = p.childNodes.indexOf(node);
        p._detach(node);
        p._insertAt(other, idx);
      },
      replaceChildren(...items) {
        for (const c of [...node.childNodes]) node._detach(c);
        node._text = "";
        node.append(...items);
      },
      remove() { node.parentNode?._detach(node); },
      addEventListener(type, fn) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(fn);
      },
      dispatchEvent(ev) {
        ev.target = ev.target ?? node;
        for (const fn of listeners.get(ev.type) ?? []) fn(ev);
      },
      focus() { doc.activeElement = node; },
      showModal() { node.open = true; },
      close() { node.open = false; node.dispatchEvent({ type: "close" }); },
      closest(sel) {
        let cur = node;
        while (cur) { if (matchSel(cur, sel)) return cur; cur = cur.parentNode; }
        return null;
      },
      querySelector(sel) { return node.querySelectorAll(sel)[0] ?? null; },
      querySelectorAll(sel) {
        const out = [];
        const walk = (n) => {
          for (const c of n.children ?? []) {
            if (matchSel(c, sel)) out.push(c);
            walk(c);
          }
        };
        walk(node);
        return out;
      },
    };
    return node;
  };
  const doc = {
    activeElement: null,
    createElement: (tag) => makeNode(tag, 1),
    createTextNode: (t) => { const n = makeNode("#text", 3); n._text = String(t ?? ""); return n; },
    createDocumentFragment: () => makeNode("#fragment", 11),
    getElementById: (id) => byId.get(id) ?? null,
  };
  for (const id of ids) {
    const tag = id === "detail-dialog" ? "dialog" : id === "quest-search" ? "input" : "div";
    const el = makeNode(tag, 1);
    el.id = id;
  }
  return { doc, byId };
}

test("pixel-ui: helper formatters handle tokens, workspace paths, and empty feed details", () => {
  assert.equal(formatCompactTokens(43103280, 183844), "43.29M TOKENS");
  assert.equal(formatCompactTokens(12000, 300), "12.3K TOKENS");
  assert.equal(formatCompactTokens(100, 50), "150 TOKENS");
  assert.equal(formatCompactTokens(null, undefined), "0 TOKENS");

  assert.equal(formatDisplayPath("C:\\src\\schoolbright\\knowledge\\a.md", "C:\\src\\schoolbright"), "knowledge/a.md");
  assert.equal(formatDisplayPath("C:\\src\\schoolbright", "C:\\src\\schoolbright"), ". (schoolbright)");
  assert.equal(formatDisplayPath("C:\\other\\file.md", "C:\\src\\schoolbright"), "C:\\other\\file.md");

  assert.equal(formatFeedType("AskUserQuestion", ""), "AskUserQuestion");
  assert.equal(formatFeedType("Read", "src/a.js"), "Read:");
});

test("pixel-ui: panels reconcile survives in-place cursor update, formats usage tokens, and supports modal back stack", () => {
  const ids = [
    "ws-label", "tab-container", "btn-anim", "conn-status", "last-sync", "active-count",
    "roster", "pipeline", "workshop", "usage-cards", "quest-log", "quest-filters", "quest-search",
    "zone-tabs", "detail-dialog", "detail-title", "detail-body", "detail-back", "detail-close",
  ];
  const { doc, byId } = makeFakeDom(ids);
  const fDone = doc.createElement("button"); fDone.dataset.qfilter = "done"; fDone.setAttribute("aria-pressed", "false");
  const fAll = doc.createElement("button"); fAll.dataset.qfilter = "all"; fAll.setAttribute("aria-pressed", "true");
  byId.get("quest-filters").append(fAll, fDone);

  const panels = createPanels(doc);

  // Regression test for P0.1 NotFoundError: first item changes sig right at reconcile cursor.
  const run1 = { id: "r1", createdAt: T0, mode: "planned", executionMode: "headless", projects: ["p1"], totalPackages: 1, completedPackages: 0, isDone: false, packageStates: [{ id: "WP-1", state: "running", title: "One" }] };
  const run2 = { id: "r2", createdAt: T0, mode: "direct", executionMode: "headless", projects: ["p2"], totalPackages: 1, completedPackages: 1, isDone: true, packageStates: [{ id: "WP-2", state: "done", title: "Two" }] };
  panels.renderQuests([run1, run2], "all");
  const run1Updated = { ...run1, completedPackages: 1, isDone: true, packageStates: [{ id: "WP-1", state: "done", title: "One" }] };
  panels.renderQuests([run1Updated, run2], "all");
  assert.equal(byId.get("quest-log").children.length, 2);
  assert.equal(byId.get("quest-log").querySelectorAll("summary")[0].getAttribute("aria-expanded"), "false");

  // Filter to DONE only, then search
  fDone.dispatchEvent({ type: "click" });
  assert.equal(byId.get("quest-log").children.length, 2);
  byId.get("quest-search").value = "WP-2";
  byId.get("quest-search").dispatchEvent({ type: "input" });
  assert.equal(byId.get("quest-log").children.length, 1);

  // Usage & Telemetry shows compact token hero instead of n/a
  panels.renderUsage({
    usage: {
      agents: {
        claude: { calls: 4, costCalls: 0, costUsd: null, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, turns: 0 },
        codex: { calls: 20, costCalls: 0, costUsd: null, inputTokens: 43103280, outputTokens: 183844, cacheReadTokens: 41615360, turns: 16 },
        agy: { calls: 0, costCalls: 0, costUsd: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, turns: 0 },
      },
      total: { calls: 24, costCalls: 0, costUsd: null, inputTokens: 43103280, outputTokens: 183844, cacheReadTokens: 41615360, runs: 2 },
    },
  }, "all", {});
  const bigTexts = byId.get("usage-cards").querySelectorAll(".card-big").map((n) => n.textContent);
  assert.ok(bigTexts.includes("43.29M TOKENS"));
  assert.ok(!bigTexts.includes("n/a"));

  // Workshop active session card shortens paths, drops empty colon on tool without detail, and renders Show All in scoped empty state
  panels.renderHeader({ workspaceName: "schoolbright", workspaceRoot: "C:\\src\\schoolbright", conn: "LIVE", activeCount: 1, timestamp: new Date().toISOString() });
  panels.renderWorkshop([{
    key: "k1", source: "hook", isSubagent: false, sessionId: "s1", runId: "s1", packageId: "LIVE CHAT",
    title: "Survey auth", project: "schoolbright", repoPath: "C:\\src\\schoolbright",
    role: "arch", provider: "claude", tool: { name: "AskUserQuestion", detail: "" },
    history: [{ at: T0, type: "tool", name: "AskUserQuestion", detail: "" }, { at: T0, type: "tool", name: "Read", detail: "C:\\src\\schoolbright\\knowledge\\adr.md" }],
    startedAt: T0, updatedAt: T0,
  }], { workspaceRoot: "C:\\src\\schoolbright" }, "all", "LIVE");
  const card = byId.get("workshop").querySelector(".session-card");
  assert.match(card.querySelector(".sc-title-main").textContent, /^ARCH · Survey auth/);
  assert.ok(card.querySelectorAll(".feed-type").some((n) => n.textContent === "AskUserQuestion"));
  assert.ok(card.querySelectorAll(".feed-detail").some((n) => n.textContent === "knowledge/adr.md"));

  panels.renderWorkshop([], { workspaceRoot: "C:\\src\\schoolbright" }, "sb-api-gateway", "LIVE");
  assert.ok(byId.get("workshop").querySelector('[data-scope="all"]'));

  // Roster groups ROLES and PROVIDERS separately with accessible labels and spacing
  panels.renderRoster([
    { id: "role:spec", kind: "role", label: "SPEC", fullName: "Spec", status: "IDLE", color: "#A3E635" },
    { id: "prov:claude#1", kind: "provider", label: "CLAUDE", fullName: "Claude Code", status: "1 ACTIVE", color: "#F97316" },
  ]);
  const chips = byId.get("roster").querySelectorAll("button");
  assert.equal(chips.length, 2);
  assert.equal(chips[0].getAttribute("aria-haspopup"), "dialog");
  assert.match(chips[0].textContent, /SPEC IDLE/);

  // Nested modal drill-down and Back button stack
  panels.openDetail({ kind: "role", id: "spec", name: "Spec", status: "WORKING", telemetry: "live", sessions: [] });
  assert.equal(byId.get("detail-back").hidden, true);
  panels.openDetail({ kind: "session", session: { key: "s1", source: "hook", packageId: "LIVE CHAT", role: "spec", provider: "claude", history: [] } });
  assert.equal(byId.get("detail-back").hidden, false);
  assert.match(byId.get("detail-title").textContent, /SESSION/);
  byId.get("detail-back").dispatchEvent({ type: "click" });
  assert.equal(byId.get("detail-back").hidden, true);
  assert.equal(byId.get("detail-title").textContent, "SPEC");
});

test("pixel-ui: 6 room signs, zone inspection, and canvas bubble clamping keep overlays in bounds", (t) => {
  for (const [id, z] of Object.entries(world.ZONES)) {
    if (id !== "corridor") assert.ok(z.shortSign, `${id} has shortSign`);
  }

  const stubCtx = () => ({
    imageSmoothingEnabled: false,
    globalAlpha: 1,
    fillStyle: "",
    fillRect() {},
    drawImage() {},
  });
  const makeStubCanvas = () => {
    const c = { width: 0, height: 0, style: {}, addEventListener() {}, removeEventListener() {}, getContext: () => stubCtx(), getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 384 }) };
    return c;
  };
  const prevDoc = globalThis.document;
  const prevRaf = globalThis.requestAnimationFrame;
  const prevCancel = globalThis.cancelAnimationFrame;
  globalThis.document = { createElement: () => makeStubCanvas(), addEventListener() {}, removeEventListener() {}, hidden: false };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  t.after(() => {
    globalThis.document = prevDoc;
    globalThis.requestAnimationFrame = prevRaf;
    globalThis.cancelAnimationFrame = prevCancel;
  });

  const engine = new Engine(makeStubCanvas(), { sprites, world });
  const director = new Director(engine, { world, telemetry });
  director.init();

  // Room sign hit testing for every non-corridor zone
  for (const [zoneId, z] of Object.entries(world.ZONES)) {
    if (zoneId === "corridor") continue;
    const rect = engine._roomSignRect(zoneId, z);
    const hit = engine.hitAt(rect.x + 2, rect.y + 2);
    assert.deepEqual(hit, { kind: "zone", id: zoneId });
    const inspected = director.inspect(hit);
    assert.equal(inspected.kind, "zone");
    assert.equal(inspected.label, z.name);
  }

  // Top-row and left-room speech bubbles must stay inside canvas and room bounds without stacking at y=0
  const planner = engine.getCharacter("role:planner");
  planner.setBubble("PLANNER + CLAUDE — PLANNING", "real");
  const arch = engine.getCharacter("role:arch");
  arch.setBubble("ARCH + CLAUDE — DESIGNING ARCH", "real");
  engine.render();
  assert.equal(engine._placed.length, 2);
  for (const b of engine._placed) {
    assert.ok(b.x >= 2 && b.x + b.w <= engine.width - 2, "bubble horizontally inside canvas");
    assert.ok(b.y >= 2 && b.y + b.h <= engine.height - 2, "bubble vertically inside canvas");
  }
  const archBubble = engine._placed[1];
  assert.ok(archBubble.x + archBubble.w <= 18 * world.TILE - 2, "left-side bubble stays inside left room");

  // New flow roles (dba, testplan) exist in world, director, telemetry and sprites
  assert.ok(engine.getCharacter("role:dba"));
  assert.ok(engine.getCharacter("role:testplan"));
  const flowSessions = telemetry.toSessions({
    workspaceName: "ws",
    activeRuns: [{
      runId: "flow-1",
      repoName: "school-bot",
      activePackages: [
        { packageId: "s1", role: "dba", agent: "codex", recentActivity: { type: "tool", name: "edit_file", detail: "build/db/schema.sql" } },
        { packageId: "s2", role: "testplan", agent: "claude", recentActivity: { type: "tool", name: "read_file", detail: "build/waves/INDEX.md" } },
      ],
    }],
    liveSessions: [],
  });
  assert.deepEqual(flowSessions.map((s) => [s.role, s.station]), [["dba", "dba"], ["testplan", "testplan"]]);
  engine.destroy();
});
