// DOM panels around the pixel office. Telemetry strings only ever reach the DOM via textContent.
import {
  PROVIDERS, PROVIDER_META, ROLE_META, PACKAGE_STATES, stateMeta,
  quotaWindows, quotaLevel, scopedUsage,
} from "./telemetry.js";

export function formatNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString("en-US") : "0";
}

// null = the provider reports no price (codex, agy): show that, never "$0.000" which reads as free.
export function formatCost(n) {
  if (n === null || n === undefined) return "n/a";
  const v = Number(n);
  return Number.isFinite(v) ? "$" + v.toFixed(3) : "n/a";
}

// Some calls priced, some not: the dollar figure is a lower bound, so say how much of it is known.
const costCoverage = (s) => (s?.calls > 0 && Number.isFinite(s.costCalls) && s.costCalls < s.calls ? ` · COST ${s.costCalls}/${s.calls}` : "");

export function formatCompactTokens(inputTokens, outputTokens) {
  const inp = Number.isFinite(Number(inputTokens)) ? Math.max(0, Number(inputTokens)) : 0;
  const out = Number.isFinite(Number(outputTokens)) ? Math.max(0, Number(outputTokens)) : 0;
  const total = inp + out;
  if (total >= 1_000_000_000) return `${(total / 1_000_000_000).toFixed(2)}B TOKENS`;
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(2)}M TOKENS`;
  if (total >= 10_000) return `${(total / 1_000).toFixed(1)}K TOKENS`;
  return `${formatNumber(total)} TOKENS`;
}

export function formatDisplayPath(rawPath, workspaceRoot) {
  const raw = String(rawPath ?? "");
  if (!raw || !workspaceRoot) return raw;
  const norm = (p) => String(p).replace(/\\/g, "/").replace(/\/+$/, "");
  const root = norm(workspaceRoot);
  if (!root) return raw;
  const normRaw = norm(raw);
  const winDrive = /^[a-z]:\//i.test(root);
  const eq = (a, b) => (winDrive ? a.toLowerCase() === b.toLowerCase() : a === b);
  if (eq(normRaw, root)) {
    const base = root.split("/").pop() || root;
    return `. (${base})`;
  }
  const prefix = root + "/";
  if (winDrive ? normRaw.toLowerCase().startsWith(prefix.toLowerCase()) : normRaw.startsWith(prefix)) {
    return normRaw.slice(prefix.length);
  }
  const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\//g, "[\\\\/]");
  const rx = new RegExp(`${escaped}[\\\\/]`, winDrive ? "gi" : "g");
  return raw.replace(rx, "");
}

export function formatFeedType(nameOrType, detailOrThought) {
  const base = String(nameOrType || "?").trim() || "?";
  const hasDetail = detailOrThought != null && String(detailOrThought).trim() !== "";
  return hasDetail ? `${base}:` : base;
}

function formatStandardDate(d) {
  const m = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${m}, ${t}`;
}

// Providers report resets as epoch seconds, ISO strings or free text like "Nov 9, 3:00pm (Asia/Bangkok)".
export function normalizeResetDate(input) {
  if (input == null || input === "") return "";
  try {
    if (typeof input === "number" || /^\d{10}$/.test(String(input).trim())) {
      return formatStandardDate(new Date(Number(input) * 1000));
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(String(input))) {
      const d = new Date(input);
      if (!Number.isNaN(d.getTime())) return formatStandardDate(d);
    }
    const m = String(input).match(/([a-zA-Z]+ \d+)[,\s]+(\d+:\d+\s*[apmAPM]+)/i);
    if (m) return `${m[1]}, ${m[2].toUpperCase().replace(/\s+/, " ")}`;
    const d = new Date(input);
    if (!Number.isNaN(d.getTime())) return formatStandardDate(d);
    return String(input).replace(/\s*\([^)]*\)/, "");
  } catch {
    return String(input);
  }
}

function resetLabel(v) {
  const t = normalizeResetDate(v);
  return /[0-9]/.test(t) ? t : "";
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

function shortRunId(id) {
  const s = String(id ?? "");
  return s.length > 22 ? s.slice(0, 22) + "…" : s || "?";
}

function truncate(s, n) {
  const t = String(s ?? "");
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function timeOf(at) {
  const d = new Date(at ?? "");
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-GB", { hour12: false });
}

const SAFE_COLOR = /^#[0-9a-f]{3,8}$/i;
const ACTIVE_STATES = new Set(["running", "gating", "verifying", "probing"]);

// Mirrors truth only: a run with no package states is "UNKNOWN", never a guessed DONE/IN PROGRESS beyond isDone.
export function questStatus(run) {
  const states = (run?.packageStates ?? []).map((p) => p.state);
  if (!states.length) return run?.isDone ? stateMeta("done") : { label: "UNKNOWN", tone: "muted" };
  if (states.every((s) => s === "done")) return stateMeta("done");
  if (states.includes("waiting_human")) return stateMeta("waiting_human");
  if (states.includes("env_failed")) return stateMeta("env_failed");
  if (states.includes("blocked")) return stateMeta("blocked");
  if (states.some((s) => ACTIVE_STATES.has(s))) return { label: "IN PROGRESS", tone: "active" };
  if (states.includes("cancelled")) return stateMeta("cancelled");
  return stateMeta(states.find((s) => s !== "done"));
}

export function createPanels(doc = document) {
  const $ = (id) => doc.getElementById(id);
  const dom = {
    ws: $("ws-label"), tabs: $("tab-container"), anim: $("btn-anim"),
    conn: $("conn-status"), lastSync: $("last-sync"), count: $("active-count"), roster: $("roster"), pipeline: $("pipeline"),
    workshop: $("workshop"), usage: $("usage-cards"), quests: $("quest-log"),
    qFilters: $("quest-filters"), qSearch: $("quest-search"), zones: $("zone-tabs"),
    dialog: $("detail-dialog"), dTitle: $("detail-title"), dBody: $("detail-body"), dBack: $("detail-back"), dClose: $("detail-close"),
  };

  let currentWorkspaceRoot = "";
  let lastSyncAt = null;
  let lastRuns = [];
  let lastQuestScope = "all";
  let questFilter = "all";
  let questQuery = "";

  const handlers = new Map();
  const emit = (name, ...args) => {
    for (const fn of handlers.get(name) ?? []) {
      try { fn(...args); } catch (err) { console.error(err); }
    }
  };
  const sigs = {};
  const changed = (key, value) => {
    const s = JSON.stringify(value ?? null);
    if (sigs[key] === s) return false;
    sigs[key] = s;
    return true;
  };

  function el(tag, cls, text) {
    const n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  }
  function badge(label, tone = "muted", title) {
    const b = el("span", `badge tone-${tone}`, label);
    if (title) b.title = title;
    return b;
  }
  function setColorVar(node, name, color) {
    if (typeof color === "string" && SAFE_COLOR.test(color)) node.style.setProperty(name, color);
  }

  // Keyed list update: untouched children keep their DOM node, so focus, open <details> and scroll survive ticks.
  function reconcile(container, items, keyOf, sigOf, build) {
    const existing = new Map();
    for (const child of [...container.children]) {
      if (child.dataset?.key != null) existing.set(child.dataset.key, child);
      else child.remove();
    }
    let cursor = container.firstElementChild;
    const seen = new Set();
    for (const item of items) {
      const key = String(keyOf(item));
      seen.add(key);
      const sig = JSON.stringify(sigOf(item));
      let node = existing.get(key);
      if (!node || node.dataset.sig !== sig) {
        const fresh = build(item, node ?? null);
        fresh.dataset.key = key;
        fresh.dataset.sig = sig;
        if (node) {
          // Why: if node IS cursor, removing it detaches cursor from container, causing insertBefore(fresh, cursor) to throw NotFoundError.
          if (node === cursor) cursor = cursor.nextElementSibling;
          node.remove();
        }
        node = fresh;
      }
      if (node !== cursor) {
        if (cursor && cursor.parentNode === container) container.insertBefore(node, cursor);
        else container.appendChild(node);
      } else {
        cursor = cursor.nextElementSibling;
      }
    }
    for (const [key, node] of existing) if (!seen.has(key)) node.remove();
  }

  // ---------- event delegation on stable containers ----------
  dom.ws?.addEventListener("change", (e) => {
    const sel = e.target.closest?.("select.hq-ws-select");
    if (sel) emit("selectWorkspace", sel.value);
  });
  dom.ws?.addEventListener("click", (e) => {
    const pill = e.target.closest?.("[data-ws-path]");
    if (pill) emit("selectWorkspace", pill.dataset.wsPath);
  });
  dom.tabs?.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-scope]");
    if (b) emit("scope", b.dataset.scope);
  });
  dom.anim?.addEventListener("click", () => emit("toggleAnim"));
  dom.roster?.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-roster-id]");
    if (b) emit("inspect", b.dataset.rosterId);
  });
  dom.zones?.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-zone]");
    if (b) emit("zone", b.dataset.zone);
  });
  dom.workshop?.addEventListener("click", (e) => {
    const sc = e.target.closest?.("[data-scope]");
    if (sc) { emit("scope", sc.dataset.scope); return; }
    // Expanding the activity stream or selecting text in it must not open the inspector.
    if (e.target.closest?.("summary, .feed")) return;
    const card = e.target.closest?.("[data-session-key]");
    if (card) emit("inspectSession", card.dataset.sessionKey);
  });
  dom.workshop?.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d?.tagName === "DETAILS") {
      d.querySelector(":scope > summary")?.setAttribute("aria-expanded", String(d.open));
    }
    const card = d?.closest?.("[data-session-key]");
    if (card && d.classList?.contains("sc-history")) historyOpen.set(card.dataset.sessionKey, d.open);
  }, true);
  dom.quests?.addEventListener("click", (e) => {
    const sc = e.target.closest?.("[data-scope]");
    if (sc) { emit("scope", sc.dataset.scope); return; }
    const rst = e.target.closest?.("[data-reset-qfilter]");
    if (rst) {
      questFilter = "all";
      questQuery = "";
      if (dom.qSearch) dom.qSearch.value = "";
      if (dom.qFilters) for (const b of dom.qFilters.querySelectorAll("[data-qfilter]")) b.setAttribute("aria-pressed", String(b.dataset.qfilter === "all"));
      renderQuests(lastRuns, lastQuestScope);
    }
  });
  dom.quests?.addEventListener("toggle", (e) => {
    const d = e.target;
    if (d?.tagName === "DETAILS") {
      d.querySelector(":scope > summary")?.setAttribute("aria-expanded", String(d.open));
    }
  }, true);
  dom.qFilters?.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-qfilter]");
    if (!b) return;
    questFilter = b.dataset.qfilter || "all";
    for (const btn of dom.qFilters.querySelectorAll("[data-qfilter]")) {
      btn.setAttribute("aria-pressed", String(btn.dataset.qfilter === questFilter));
    }
    renderQuests(lastRuns, lastQuestScope);
  });
  dom.qSearch?.addEventListener("input", () => {
    questQuery = dom.qSearch.value ?? "";
    renderQuests(lastRuns, lastQuestScope);
  });

  let opener = null;
  let currentDetail = null;
  let detailStack = [];
  dom.dClose?.addEventListener("click", () => closeDetail());
  dom.dBack?.addEventListener("click", () => {
    const prev = detailStack.pop();
    if (prev) openDetail(prev, { push: false });
  });
  dom.dialog?.addEventListener("click", (e) => {
    if (e.target === dom.dialog) { closeDetail(); return; }
    const b = e.target.closest?.("[data-session-key]");
    if (b) emit("inspectSession", b.dataset.sessionKey);
  });
  dom.dialog?.addEventListener("close", () => {
    const o = opener;
    opener = null;
    currentDetail = null;
    detailStack = [];
    if (dom.dBack) dom.dBack.hidden = true;
    emit("detailClosed");
    if (o && o.isConnected && typeof o.focus === "function") o.focus();
  });

  // ---------- header ----------
  let lastConn = "NO DATA";
  function renderHeader({ workspaceName, workspaceRoot, workspaces = [], projects = [], scope = "all", conn = "NO DATA", activeCount = 0, animOn = true, timestamp = null } = {}) {
    lastConn = conn;
    if (workspaceRoot) currentWorkspaceRoot = workspaceRoot;
    const parsedTs = timestamp ? Date.parse(timestamp) : NaN;
    if (Number.isFinite(parsedTs)) lastSyncAt = parsedTs;
    else if (!timestamp && conn !== "LIVE") lastSyncAt = null;
    if (dom.ws) {
      const labelOf = (w) => (w.activeCount > 0 ? `${w.name} (${w.activeCount} active)` : w.name);
      if (workspaces && workspaces.length > 1) {
        let select = dom.ws.querySelector("select.hq-ws-select");
        if (!select) {
          dom.ws.replaceChildren();
          select = el("select", "hq-ws-select");
          select.setAttribute("aria-label", "Switch workspace");
          for (const w of workspaces) {
            const opt = el("option", null, labelOf(w));
            opt.value = w.path;
            select.appendChild(opt);
          }
          dom.ws.appendChild(select);
        } else {
          const currentOpts = Array.from(select.options).map((o) => `${o.value}|${o.textContent}`);
          const nextOpts = workspaces.map((w) => `${w.path}|${labelOf(w)}`);
          if (JSON.stringify(currentOpts) !== JSON.stringify(nextOpts)) {
            select.replaceChildren();
            for (const w of workspaces) {
              const opt = el("option", null, labelOf(w));
              opt.value = w.path;
              select.appendChild(opt);
            }
          }
        }
        if (workspaceRoot && select.value !== workspaceRoot) {
          select.value = workspaceRoot;
        }
        let pills = dom.ws.querySelector(".ws-other-active");
        const otherActive = workspaces.filter((w) => w.activeCount > 0 && w.path !== workspaceRoot);
        if (otherActive.length) {
          if (!pills) {
            pills = el("span", "ws-other-active");
            dom.ws.appendChild(pills);
          }
          reconcile(pills, otherActive, (w) => w.path, (w) => [w.name, w.activeCount], (w) => {
            const b = el("button", "ws-pill", `⚡ ${w.name} (${w.activeCount})`);
            b.type = "button";
            b.dataset.wsPath = w.path;
            b.title = `Switch to ${w.name} (${w.activeCount} active)`;
            return b;
          });
        } else if (pills) {
          pills.remove();
        }
      } else {
        dom.ws.textContent = workspaceName || "…";
      }
    }
    if (dom.conn) {
      dom.conn.textContent = conn;
      dom.conn.dataset.state = conn;
      const connTitle = {
        LIVE: "Real-time SSE stream connected (1s tick)",
        WAITING: "Stream connected, waiting for initial monitor snapshot",
        RECONNECTING: "Stream disconnected, retrying connection automatically",
        "NO DATA": "Not connected to monitor server",
      }[conn];
      if (connTitle) dom.conn.title = connTitle;
    }
    // null = no data yet; showing "0" would claim a known-idle state.
    if (dom.count) dom.count.textContent = activeCount == null ? "— ACTIVE" : `${activeCount} ACTIVE`;
    refreshSyncLabel();
    if (dom.anim) {
      dom.anim.textContent = `ANIMATION: ${animOn ? "ON" : "OFF"}`;
      dom.anim.setAttribute("aria-pressed", String(!!animOn));
    }
    if (dom.tabs && changed("tabs", { projects, scope })) {
      const tabs = [{ id: "all", label: "🌐 ALL" }, ...projects.map((p) => ({ id: p, label: p }))];
      reconcile(dom.tabs, tabs, (t) => t.id, (t) => t.label, (t) => {
        const b = el("button", "px-btn tab-btn", t.label);
        b.type = "button";
        b.dataset.scope = t.id;
        return b;
      });
      // Pressed state is patched in place so the clicked tab keeps keyboard focus.
      for (const b of dom.tabs.querySelectorAll("[data-scope]")) b.setAttribute("aria-pressed", String(b.dataset.scope === scope));
    }
  }

  // ---------- usage ----------
  function energyBar(win) {
    const pct = win.remainingPct;
    const lvl = quotaLevel(pct);
    const wrap = el("div", `energy lvl-${lvl}`);
    const head = el("div", "energy-head");
    head.append(el("span", null, win.label));
    head.append(el("strong", null, pct == null ? "UNAVAILABLE" : `${pct}% LEFT`));
    wrap.append(head);
    const cells = el("div", "energy-cells");
    if (pct == null) {
      cells.textContent = "UNAVAILABLE";
      cells.setAttribute("aria-label", `${win.label} quota unavailable`);
    } else {
      cells.setAttribute("role", "meter");
      cells.setAttribute("aria-label", `${win.label} quota remaining`);
      cells.setAttribute("aria-valuemin", "0");
      cells.setAttribute("aria-valuemax", "100");
      cells.setAttribute("aria-valuenow", String(pct));
      const on = Math.round(pct / 5);
      for (let i = 0; i < 20; i++) {
        const c = el("i", i < on ? "on" : null);
        c.setAttribute("aria-hidden", "true");
        cells.append(c);
      }
    }
    wrap.append(cells);
    const reset = resetLabel(win.resetsAt);
    if (reset) wrap.append(el("div", "energy-reset", `Resets: ${reset}`));
    if (lvl === "low" || lvl === "warn") wrap.append(el("div", "low-warn", `⚠ ONLY ${pct}% LEFT`));
    return wrap;
  }

  function statGrid(rows) {
    const g = el("div", "stat-grid");
    for (const [label, value] of rows) {
      g.append(el("span", "stat-label", label));
      g.append(el("strong", null, value));
    }
    return g;
  }

  function planLine(p, q) {
    if (p === "claude") {
      const plan = q?.planType ? String(q.planType).replace(/_/g, " ").toUpperCase() : "SUBSCRIPTION";
      const account = q?.accountLabel || "Anthropic Subscription";
      return { plan, account };
    }
    if (p === "codex") return { plan: q?.planType ? String(q.planType).toUpperCase() : "PLUS", account: q?.accountLabel || "ChatGPT Plus Account" };
    return { plan: "ANTIGRAVITY", account: "Google Antigravity / Gemini" };
  }

  function costBadge(s) {
    const calls = Number(s?.calls) || 0;
    const costCalls = Number(s?.costCalls);
    const hasUsd = s?.costUsd !== null && s?.costUsd !== undefined && Number.isFinite(Number(s?.costUsd));
    if (calls > 0 && (!hasUsd || (Number.isFinite(costCalls) && costCalls === 0))) {
      return badge("UNPRICED", "muted", "Subscription or CLI calls did not report USD pricing");
    }
    if (calls === 0 && !hasUsd) {
      return badge("$0.000", "muted", "No API calls recorded");
    }
    const hint = calls > 0 && Number.isFinite(costCalls) && costCalls < calls
      ? `Priced ${costCalls}/${calls} calls`
      : "Reported USD cost";
    return badge(formatCost(s?.costUsd ?? 0), calls > 0 ? "info" : "muted", hint);
  }

  function tokenBar(inputTokens, outputTokens, cacheReadTokens) {
    const i = Number.isFinite(Number(inputTokens)) ? Math.max(0, Number(inputTokens)) : 0;
    const o = Number.isFinite(Number(outputTokens)) ? Math.max(0, Number(outputTokens)) : 0;
    const c = Number.isFinite(Number(cacheReadTokens)) ? Math.max(0, Number(cacheReadTokens)) : 0;
    const sum = i + o + c;
    const bar = el("div", "token-bar");
    bar.title = `IN ${formatNumber(i)} · OUT ${formatNumber(o)} · CACHE ${formatNumber(c)}`;
    bar.setAttribute("aria-hidden", "true");
    if (sum > 0) {
      const seg = (cls, val) => {
        if (val <= 0) return null;
        const s = el("span", cls);
        s.style.width = `${Math.max(2, (val / sum) * 100).toFixed(1)}%`;
        return s;
      };
      for (const s of [seg("tb-in", i), seg("tb-out", o), seg("tb-cache", c)]) if (s) bar.append(s);
    } else {
      bar.classList.add("is-empty");
    }
    return bar;
  }

  function providerCard(p, agent, quota, windows, level, enabled, scoped) {
    const meta = PROVIDER_META[p];
    const card = el("article", "usage-card px-box");
    setColorVar(card, "--pc", meta.color);
    const off = enabled === false;
    const low = level === "warn" || level === "low";
    if (low) card.classList.add("is-low");
    if (off) card.classList.add("is-off");

    const title = el("h3", "card-title");
    title.append(el("span", null, meta.name));
    const right = el("span", "card-title-right");
    right.append(costBadge(agent));
    if (low) right.append(badge(level === "low" ? "⚠ LOW QUOTA" : "⚠ QUOTA WARN", level === "low" ? "error" : "warn"));
    if (off) right.append(badge("OFF", "off", "Disabled in local.json agents"));
    title.append(right);
    card.append(title);

    const big = el("div", "card-big", formatCompactTokens(agent.inputTokens, agent.outputTokens));
    big.title = `${formatNumber((Number(agent.inputTokens) || 0) + (Number(agent.outputTokens) || 0))} tokens (${formatNumber(agent.inputTokens)} in + ${formatNumber(agent.outputTokens)} out)`;
    card.append(big);
    card.append(el("div", "card-sub", `${formatNumber(agent.calls)} CALLS · ${formatNumber(agent.turns)} TURNS${costCoverage(agent)}`));
    card.append(tokenBar(agent.inputTokens, agent.outputTokens, agent.cacheReadTokens));
    card.append(statGrid([
      ["IN TOKENS", formatNumber(agent.inputTokens)],
      ["OUT TOKENS", formatNumber(agent.outputTokens)],
      ["CACHE READ", formatNumber(agent.cacheReadTokens)],
      ["TURNS", formatNumber(agent.turns)],
    ]));
    if (scoped) card.append(el("div", "scope-note", "Workspace-wide (not per-project)"));

    if (quota && windows.length) {
      const qb = el("div", "quota-box");
      const { plan, account } = planLine(p, quota);
      qb.append(el("div", "plan-line", `${plan} · 👤 ${account}`));
      for (const w of windows) qb.append(energyBar(w));
      card.append(qb);
    }
    return card;
  }

  function renderUsage(state, scope = "all", quotaLevels = {}) {
    if (!dom.usage) return;
    const { agents, total, scoped } = scopedUsage(state, scope);
    const windows = quotaWindows(state?.quota ?? null);
    const enabled = state?.agentsEnabled ?? null;
    if (!changed("usage", { agents, total, scoped, scope, quota: state?.quota ?? null, enabled, quotaLevels, has: !!state })) return;

    const frag = doc.createDocumentFragment();
    for (const p of PROVIDERS) {
      frag.append(providerCard(p, agents?.[p] ?? {}, state?.quota?.[p] ?? null, windows[p] ?? [], quotaLevels?.[p], enabled?.[p], scoped));
    }
    const tot = el("article", "usage-card px-box");
    setColorVar(tot, "--pc", "#38BDF8");
    const title = el("h3", "card-title");
    title.append(el("span", null, scoped ? scope : "WORKSPACE TOTAL"));
    const right = el("span", "card-title-right");
    right.append(costBadge(total));
    title.append(right);
    tot.append(title);
    const totBig = el("div", "card-big", formatCompactTokens(total?.inputTokens, total?.outputTokens));
    totBig.title = `${formatNumber((Number(total?.inputTokens) || 0) + (Number(total?.outputTokens) || 0))} tokens (${formatNumber(total?.inputTokens)} in + ${formatNumber(total?.outputTokens)} out)`;
    tot.append(totBig);
    tot.append(el("div", "card-sub", `${formatNumber(total?.calls)} CALLS · ${formatNumber(total?.runs)} RUNS${costCoverage(total)}`));
    tot.append(tokenBar(total?.inputTokens, total?.outputTokens, total?.cacheReadTokens));
    tot.append(statGrid([
      ["IN TOKENS", formatNumber(total?.inputTokens)],
      ["OUT TOKENS", formatNumber(total?.outputTokens)],
      ["CACHE READ", formatNumber(total?.cacheReadTokens)],
      ["RUNS", formatNumber(total?.runs)],
    ]));
    if (!state) tot.append(el("div", "scope-note", "NO DATA YET"));
    frag.append(tot);
    dom.usage.replaceChildren(frag);
  }

  // ---------- workshop ----------
  const historyOpen = new Map();

  function sessionSig(s) {
    return [s.source, s.isSubagent, s.parentSessionId, s.model, s.runId, s.packageId, s.title, s.project, s.repoPath, s.role, s.roleLabel, s.provider, s.providerLabel,
      s.tier, s.tool, s.thought, s.history?.slice(-8), s.usage, s.packageState, s.startedAt, s.stale];
  }

  function buildSessionCard(s, old) {
    const card = el("article", `session-card px-box${s.isSubagent ? " is-subagent" : ""}`);
    card.dataset.sessionKey = s.key;
    if (s.provider) setColorVar(card, "--pc", PROVIDER_META[s.provider].color);

    const roleDisp = s.role ? ROLE_META[s.role].short : s.roleLabel ? truncate(s.roleLabel, 20).toUpperCase() : s.source === "hook" ? "GENERAL" : "UNKNOWN ROLE";
    const taskTitle = [s.packageId && s.packageId !== "LIVE CHAT" && s.packageId !== "SUBAGENT" ? s.packageId : null, s.title].filter(Boolean).join(" · ") || "(untitled session)";

    const head = el("div", "sc-head");
    const left = el("div", "sc-head-main");
    left.append(el("div", "sc-title-main", `${roleDisp} · ${taskTitle}`));
    const projLine = el("div", "sc-project-line");
    projLine.append(el("span", "sc-project", s.project || "workspace"));
    left.append(projLine);
    head.append(left);
    const dur = el("span", "badge tone-muted");
    dur.dataset.since = s.startedAt ?? "";
    dur.title = "Running time";
    head.append(dur);
    card.append(head);

    const badges = el("div", "sc-badges");
    if (s.source === "hook") {
      badges.append(badge(s.isSubagent ? "↳ SUBAGENT" : "LIVE CHAT", s.isSubagent ? "active" : "info"));
    } else {
      badges.append(badge("BAAN RUN", "muted"));
    }
    badges.append(badge(roleDisp, s.role ? "info" : "muted"));
    const prov = badge(s.provider ? PROVIDER_META[s.provider].short : s.providerLabel ? truncate(s.providerLabel, 16) : "UNKNOWN PROVIDER",
      s.provider ? "provider" : "muted");
    if (s.provider) setColorVar(prov, "--pc", PROVIDER_META[s.provider].color);
    badges.append(prov);
    if (s.packageState) {
      const m = stateMeta(s.packageState);
      badges.append(badge(m.label, m.tone));
    }
    if (s.tier) badges.append(badge(`TIER ${s.tier}`, "muted"));
    if (s.model) badges.append(badge(truncate(s.model, 22), "muted"));
    if (s.stale) {
      const st = badge("NO UPDATE", "warn", "No telemetry update recently");
      st.dataset.updated = s.updatedAt ?? "";
      badges.append(st);
    }
    card.append(badges);

    const metaLabel = s.source === "hook"
      ? (s.isSubagent && s.parentSessionId ? `PARENT ${shortRunId(s.parentSessionId)}` : `SESSION ${shortRunId(s.sessionId || s.runId)}`)
      : `RUN ${shortRunId(s.runId)}`;
    card.append(el("div", "sc-meta", metaLabel));
    if (s.repoPath) {
      const dispCwd = formatDisplayPath(s.repoPath, currentWorkspaceRoot);
      const cwd = el("div", "sc-meta", `CWD ${dispCwd}`);
      cwd.title = s.repoPath;
      card.append(cwd);
    }

    const action = el("div", "sc-action");
    const at = el("div", "sc-action-text");
    if (s.tool && (s.tool.name || s.tool.detail)) {
      at.append(el("span", "sc-tool", `[${s.tool.name || "tool"}] `));
      const detailDisp = formatDisplayPath(s.tool.detail, currentWorkspaceRoot);
      at.append(doc.createTextNode(truncate(detailDisp, 240)));
      if (s.tool.detail && detailDisp !== s.tool.detail) at.title = s.tool.detail;
    } else {
      at.textContent = "Starting…";
    }
    action.append(at);
    if (s.thought) {
      const th = el("div", "sc-thought", `💭 ${truncate(s.thought, 280)}`);
      th.title = s.thought;
      action.append(th);
    }
    card.append(action);

    const u = s.usage;
    if (u && (u.inputTokens || u.outputTokens || u.costUsd)) {
      card.append(el("div", "sc-usage",
        `IN ${formatNumber(u.inputTokens)} · OUT ${formatNumber(u.outputTokens)} · CACHE ${formatNumber(u.cacheReadTokens)}` +
        (u.turns ? ` · ${formatNumber(u.turns)} TURNS` : "") + (u.costUsd ? ` · ${formatCost(u.costUsd)}` : "")));
    }

    const hist = (s.history ?? []).slice(-8).reverse();
    if (hist.length) {
      const det = el("details", "sc-history");
      det.open = historyOpen.get(s.key) ?? true;
      const sum = el("summary", null, `ACTIVITY (${hist.length})`);
      sum.setAttribute("aria-expanded", String(!!det.open));
      det.append(sum);
      const feed = el("div", "feed");
      for (const h of hist) {
        const rawDetail = h.detail || h.thought || "";
        const dispDetail = formatDisplayPath(rawDetail, currentWorkspaceRoot);
        const row = el("div", "feed-item");
        row.append(el("span", "feed-time", timeOf(h.at)));
        row.append(el("span", `feed-type ${h.type === "thought" ? "thought" : "tool"}`, formatFeedType(h.name || h.type, rawDetail)));
        row.append(el("span", "feed-detail", truncate(dispDetail, 300)));
        feed.append(row);
      }
      det.append(feed);
      card.append(det);
      const oldFeed = old?.querySelector?.(".feed");
      if (oldFeed) {
        const top = oldFeed.scrollTop;
        // Restore after insertion; scrollTop on a detached node is ignored.
        queueMicrotask(() => { feed.scrollTop = top; });
      }
    }

    const ins = el("button", "px-btn px-btn-sm sc-inspect", "🔍 INSPECT");
    ins.type = "button";
    ins.setAttribute("aria-haspopup", "dialog");
    ins.setAttribute("aria-label", `Inspect session ${roleDisp} ${s.packageId ?? ""} ${s.title ?? ""}`.trim());
    card.append(ins);
    return card;
  }

  function emptyState(cls, title, lines, robot, action = null) {
    const box = el("div", `ws-empty px-box ${cls}`);
    box.dataset.key = `__empty_${title}`;
    if (robot) {
      const r = el("div", "robot");
      r.setAttribute("aria-hidden", "true");
      r.append(el("span", "zz", "z Z"));
      box.append(r);
    }
    box.append(el("h3", null, title));
    for (const l of lines) {
      if (l === "__cursor") {
        const t = el("div", "term-line", "WAITING FOR AI TASKS... ");
        const c = el("span", "cursor");
        c.setAttribute("aria-hidden", "true");
        t.append(c);
        box.append(t);
      } else box.append(el("p", null, l));
    }
    if (action?.scope) {
      const btn = el("button", "px-btn px-btn-sm", action.label);
      btn.type = "button";
      btn.dataset.scope = action.scope;
      box.append(btn);
    }
    return box;
  }

  function refreshSyncLabel(now = Date.now()) {
    if (!dom.lastSync) return;
    if (!lastSyncAt) {
      dom.lastSync.textContent = "";
      return;
    }
    const sec = Math.max(0, Math.floor((now - lastSyncAt) / 1000));
    dom.lastSync.textContent = sec < 3 ? "SYNCED JUST NOW" : sec < 60 ? `SYNCED ${sec}S AGO` : `SYNCED ${Math.floor(sec / 60)}M AGO`;
  }

  function refreshClocks(now = Date.now()) {
    refreshSyncLabel(now);
    if (!dom.workshop) return;
    for (const n of dom.workshop.querySelectorAll("[data-since]")) {
      const t = Date.parse(n.dataset.since);
      n.textContent = Number.isFinite(t) ? `⏱ ${formatDuration(now - t)}` : "⏱ —";
    }
    for (const n of dom.workshop.querySelectorAll("[data-updated]")) {
      const t = Date.parse(n.dataset.updated);
      n.textContent = Number.isFinite(t) ? `NO UPDATE ${Math.max(1, Math.floor((now - t) / 60000))}m` : "NO UPDATE";
    }
  }

  function renderWorkshop(sessions = [], state = null, scope = "all", conn) {
    if (!dom.workshop) return;
    if (state?.workspaceRoot) currentWorkspaceRoot = state.workspaceRoot;
    const c = conn ?? (state ? lastConn : "NO DATA");
    const list = Array.isArray(sessions) ? sessions : [];
    if (changed("workshop", { conn: c, scope, root: currentWorkspaceRoot, n: list.map(sessionSig), keys: list.map((s) => s.key) })) {
      const w = dom.workshop;
      if (!list.length) {
        let box;
        if (c === "LIVE") {
          box = emptyState("state-ok", "ALL SYSTEMS READY", ["__cursor",
            scope === "all" ? "สั่งงานผ่าน baan (เช่น baan WP-1) หรือเปิดแชท/Subagent ใน IDE แล้ว session จะขึ้นที่นี่สดๆ"
              : `ไม่มีงานรันอยู่ใน ${scope} ตอนนี้`], true,
            scope !== "all" ? { label: "🌐 SHOW ALL PROJECTS", scope: "all" } : null);
        } else if (c === "WAITING") {
          box = emptyState("state-warn", "CONNECTED — WAITING FOR FIRST STATE", ["เชื่อมต่อแล้ว กำลังรอข้อมูลชุดแรกจาก baan monitor"]);
        } else if (c === "RECONNECTING") {
          box = emptyState("state-warn", "RECONNECTING…", ["การเชื่อมต่อหลุด — ยังยืนยันไม่ได้ว่ามีงานรันอยู่หรือไม่"]);
        } else {
          box = emptyState("state-error", "NO DATA", ["ยังไม่ได้รับข้อมูลจาก baan monitor — ตรวจว่า server ยังทำงานอยู่"]);
        }
        w.replaceChildren(box);
      } else {
        let host = w.querySelector(":scope > .ws-list");
        let banner = w.querySelector(":scope > .ws-banner");
        for (const child of [...w.children]) if (child !== host && child !== banner) child.remove();
        if (!host) {
          host = el("div", "ws-list");
          w.append(host);
        }
        if (c !== "LIVE") {
          if (!banner) {
            banner = el("div", "ws-banner");
            banner.setAttribute("role", "status");
            w.prepend(banner);
          }
          banner.textContent = c === "RECONNECTING" ? "⚠ RECONNECTING — showing last known sessions, may be stale" : `⚠ ${c} — showing last known sessions`;
        } else banner?.remove();
        reconcile(host, list, (s) => s.key, sessionSig, buildSessionCard);
      }
    }
    refreshClocks();
  }

  // ---------- pipeline ----------
  function renderPipeline(pipeline) {
    if (!dom.pipeline || !changed("pipeline", pipeline)) return;
    const p = pipeline ?? {};
    const frag = doc.createDocumentFragment();
    const row = el("div", "pipe-row");
    const stages = [
      { on: !!p.orchestrator, name: "ORCHESTRATOR", sub: p.orchestrator ? `${p.activeRunCount ?? 1} active` : "idle" },
      { on: !!p.planner, name: "PLANNER", sub: p.planner ? "active" : "optional · idle" },
      { on: !!p.worker, name: "WORKER", sub: p.worker ? "active" : "idle" },
      { on: !!p.verifier, name: "VERIFIER", sub: p.verifier ? "active" : "conditional · idle" },
    ];
    stages.forEach((s, i) => {
      if (i) {
        const a = el("span", "pipe-arrow", "▶");
        a.setAttribute("aria-hidden", "true");
        row.append(a);
      }
      const box = el("div", `pipe-box${s.on ? " is-on" : ""}`, s.name);
      box.append(el("small", null, s.sub));
      box.setAttribute("aria-label", `${s.name}: ${s.on ? "active" : s.sub}`);
      row.append(box);
    });
    frag.append(row);

    const states = p.states ?? {};
    const keys = [...Object.keys(PACKAGE_STATES).filter((k) => states[k]), ...Object.keys(states).filter((k) => !(k in PACKAGE_STATES))];
    const sb = el("div", "pipe-states");
    if (keys.length) {
      sb.append(el("span", "stat-label", "PACKAGES: "));
      for (const k of keys) {
        const m = stateMeta(k === "unknown" ? null : k);
        sb.append(badge(`${m.label} × ${states[k]}`, m.tone));
      }
    } else sb.append(el("span", "pipe-note", "NO ACTIVE PACKAGES"));
    frag.append(sb);

    if (states.waiting_human) {
      const call = el("div", "human-callout");
      call.setAttribute("role", "status");
      call.append(el("strong", null, `✋ HUMAN DECISION NEEDED (${states.waiting_human}) — `));
      call.append(doc.createTextNode("run "));
      call.append(el("code", null, "baan decide"));
      call.append(doc.createTextNode(" in terminal. หน้าจอนี้ไม่อนุมัติอะไรแทนคุณ"));
      frag.append(call);
    }
    if (p.unknownRole) {
      frag.append(el("div", "pipe-note", p.liveChatOnlyUnknown
        ? "ℹ Live chat session active (interactive mode)"
        : "ℹ 1+ session with unknown role"));
    }
    dom.pipeline.replaceChildren(frag);
  }

  // ---------- quests ----------
  let seenRuns = null;
  function questSig(run) {
    return [run.createdAt, run.mode, run.executionMode, run.projects, run.totalPackages, run.completedPackages, run.isDone, run.packageStates];
  }
  function buildQuest(run, old, isNew) {
    const d = el("details", "quest px-box");
    if (old?.open) d.open = true;
    if (isNew) d.classList.add("is-new");
    const sum = el("summary");
    sum.setAttribute("aria-expanded", String(!!d.open));
    const st = questStatus(run);
    const created = new Date(run.createdAt ?? "");
    const datePart = Number.isNaN(created.getTime()) ? null : formatStandardDate(created);
    const projPart = (run.projects ?? []).join(", ") || null;
    const primaryTitle = [datePart, projPart].filter(Boolean).join(" · ") || shortRunId(run.id);
    sum.append(el("span", "quest-title", primaryTitle));
    sum.append(badge(st.label, st.tone));
    const modePart = [run.mode, run.executionMode].filter(Boolean).join(" / ");
    const idBadge = el("span", "quest-id", shortRunId(run.id));
    idBadge.title = String(run.id ?? "");
    sum.append(idBadge);
    if (modePart) sum.append(el("span", "quest-meta", modePart));

    const pips = el("span", "pips");
    const pkgs = run.packageStates ?? [];
    const MAX = 24;
    for (const pk of pkgs.slice(0, MAX)) {
      const m = stateMeta(pk.state);
      const pip = el("i", `pip tone-${m.tone}`);
      pip.title = `${pk.id ?? "?"}: ${m.label}`;
      pip.setAttribute("aria-hidden", "true");
      pips.append(pip);
    }
    if (pkgs.length > MAX) pips.append(el("span", "pip-more", `+${pkgs.length - MAX}`));
    pips.append(el("span", "pip-count", ` ${formatNumber(run.completedPackages)}/${formatNumber(run.totalPackages)} DONE`));
    sum.append(pips);
    d.append(sum);

    const ul = el("ul", "quest-pkgs");
    if (!pkgs.length) ul.append(el("li", "muted", "No package states recorded."));
    for (const pk of pkgs) {
      const li = el("li");
      const m = stateMeta(pk.state);
      const rowHead = el("span", "pkg-head");
      rowHead.append(badge(m.label, m.tone), el("span", "pkg-id", pk.id ?? "?"));
      li.append(rowHead);
      if (pk.title) li.append(el("span", "pkg-title", pk.title));
      if (pk.failureClass) li.append(el("span", "muted", `(${pk.failureClass})`));
      ul.append(li);
    }
    d.append(ul);
    return d;
  }

  function matchesQuestFilter(run, filter) {
    const pkgs = run?.packageStates ?? [];
    if (filter === "human") return pkgs.some((p) => p.state === "waiting_human");
    if (filter === "done") return questStatus(run).label === "DONE";
    if (filter === "failed") {
      return pkgs.some((p) => p.state === "env_failed" || p.state === "blocked" || p.state === "stale" || p.state === "cancelled");
    }
    return true;
  }

  function matchesQuestQuery(run, q) {
    if (!q) return true;
    const needle = q.toLowerCase();
    const parts = [run.id, ...(run.projects ?? []), run.mode, run.executionMode];
    for (const pk of run.packageStates ?? []) parts.push(pk.id, pk.title, pk.state, pk.failureClass);
    return parts.some((p) => p && String(p).toLowerCase().includes(needle));
  }

  function renderQuests(recentRuns = [], scope = "all") {
    if (!dom.quests) return;
    const runs = Array.isArray(recentRuns) ? recentRuns : [];
    lastRuns = runs;
    lastQuestScope = scope;
    const q = questQuery.trim();
    if (!changed("quests", { runs, scope, questFilter, q })) return;
    const first = seenRuns === null;
    const prevSeen = seenRuns ?? new Set();
    // Track all runs (not only the visible scope) so switching tabs never flags old quests as new.
    seenRuns = new Set(runs.map((r) => String(r.id)));
    const scopeVisible = runs.filter((r) => !scope || scope === "all" || (r.projects ?? []).includes(scope));
    const visible = scopeVisible.filter((r) => matchesQuestFilter(r, questFilter) && matchesQuestQuery(r, q));
    if (!visible.length) {
      const box = el("div", "quest-empty px-box");
      if (!scopeVisible.length) {
        box.append(el("span", null, scope === "all" ? "NO RUNS YET — ยังไม่มีประวัติ run" : `NO RUNS FOR ${scope}`));
        if (scope !== "all") {
          const btn = el("button", "px-btn px-btn-sm", "🌐 SHOW ALL PROJECTS");
          btn.type = "button";
          btn.dataset.scope = "all";
          box.append(btn);
        }
      } else {
        box.append(el("span", null, "NO MATCHING RUNS"));
        const btn = el("button", "px-btn px-btn-sm", "CLEAR SEARCH / FILTER");
        btn.type = "button";
        btn.dataset.resetQfilter = "1";
        box.append(btn);
      }
      dom.quests.replaceChildren(box);
      return;
    }
    dom.quests.querySelector(".quest-empty")?.remove();
    reconcile(dom.quests, visible, (r) => r.id, questSig, (r, old) => buildQuest(r, old, !first && !old && !prevSeen.has(String(r.id))));
  }

  // ---------- roster ----------
  function ensureRosterGroups() {
    let rolesHost = dom.roster.querySelector('[data-roster-group="roles"]');
    let provHost = dom.roster.querySelector('[data-roster-group="providers"]');
    if (!rolesHost || !provHost) {
      dom.roster.replaceChildren();
      const makeGroup = (key, title, label) => {
        const g = el("div", "roster-group");
        g.append(el("span", "roster-group-label", title));
        const items = el("div", "roster-items");
        items.dataset.rosterGroup = key;
        items.setAttribute("role", "group");
        items.setAttribute("aria-label", label);
        g.append(items);
        dom.roster.append(g);
        return items;
      };
      rolesHost = makeGroup("roles", "ROLES", "BAAN Roles");
      provHost = makeGroup("providers", "PROVIDERS", "AI Providers");
    }
    return { rolesHost, provHost };
  }

  function renderRoster(roster = []) {
    if (!dom.roster) return;
    const list = Array.isArray(roster) ? roster : [];
    if (!changed("roster", list)) return;
    const { rolesHost, provHost } = ensureRosterGroups();
    const buildChip = (r) => {
      const b = el("button", `px-btn chip kind-${r.kind === "provider" ? "provider" : "role"}`);
      b.type = "button";
      b.dataset.rosterId = r.id;
      setColorVar(b, "--chip", r.color);
      const dot = el("span", "chip-dot");
      dot.setAttribute("aria-hidden", "true");
      b.append(dot, el("span", null, r.label));
      if (r.status) b.append(doc.createTextNode(" "), el("span", "chip-status", String(r.status)));
      b.setAttribute("aria-haspopup", "dialog");
      const namePart = r.fullName && r.fullName.toUpperCase() !== String(r.label).toUpperCase()
        ? `${r.fullName} (${r.label})`
        : r.label;
      b.setAttribute("aria-label", `${namePart}${r.status ? ` — ${r.status}` : ""}. Inspect details`);
      return b;
    };
    const sigOf = (r) => [r.kind, r.label, r.fullName, r.status, r.color];
    reconcile(rolesHost, list.filter((r) => r.kind !== "provider"), (r) => r.id, sigOf, buildChip);
    reconcile(provHost, list.filter((r) => r.kind === "provider"), (r) => r.id, sigOf, buildChip);
  }

  // ---------- detail dialog ----------
  function dl(rows) {
    const d = el("dl");
    for (const [k, v] of rows) {
      if (v == null || v === "") continue;
      d.append(el("dt", null, k));
      const dd = el("dd");
      if (typeof v === "object" && v.nodeType) dd.append(v); else dd.textContent = String(v);
      d.append(dd);
    }
    return d;
  }

  function sessionList(sessions) {
    const frag = doc.createDocumentFragment();
    frag.append(el("div", "detail-sub", `LIVE SESSIONS (${sessions?.length ?? 0})`));
    if (!sessions?.length) {
      frag.append(el("p", "muted", "No live session right now."));
      return frag;
    }
    const ul = el("ul", "detail-list");
    for (const s of sessions) {
      const li = el("li");
      const b = el("button", "px-btn px-btn-sm");
      b.type = "button";
      b.dataset.sessionKey = s.key;
      b.textContent = `${s.bubble || s.key} — ${s.project ?? "?"} · ${s.packageId ?? "?"} ${truncate(s.title, 60)}`;
      li.append(b);
      ul.append(li);
    }
    frag.append(ul);
    return frag;
  }

  function sessionDetail(s) {
    const frag = doc.createDocumentFragment();
    const m = s.packageState ? stateMeta(s.packageState) : null;
    const started = Date.parse(s.startedAt ?? "");
    const roleStr = s.role
      ? ROLE_META[s.role].name
      : s.source === "hook"
        ? `GENERAL${s.roleLabel ? ` (${s.roleLabel})` : ""}`
        : `UNKNOWN${s.roleLabel ? ` (${s.roleLabel})` : ""}`;
    const stateNode = m ? badge(m.label, m.tone) : s.source === "hook" ? badge("LIVE SESSION", "info") : "unknown";
    const cwdDisp = s.repoPath ? formatDisplayPath(s.repoPath, currentWorkspaceRoot) : "";
    const toolText = s.tool ? `[${s.tool.name}] ${formatDisplayPath(s.tool.detail, currentWorkspaceRoot)}`.trim() : "Starting…";
    frag.append(dl([
      ["Project", s.project || "unknown"],
      ["Run", s.runId],
      ["Package", [s.packageId, s.title].filter(Boolean).join(" · ")],
      ["Role", roleStr],
      ["Provider", s.provider ? PROVIDER_META[s.provider].name : `UNKNOWN${s.providerLabel ? ` (${s.providerLabel})` : ""}`],
      ["Tier", s.tier],
      ["State", stateNode],
      ["CWD", cwdDisp && cwdDisp !== s.repoPath ? `${cwdDisp} (${s.repoPath})` : s.repoPath],
      ["Running", Number.isFinite(started) ? formatDuration(Date.now() - started) : null],
      ["Stale", s.stale ? "yes — no recent telemetry update" : null],
      ["Action", toolText],
      ["Thought", s.thought ? `💭 ${s.thought}` : null],
      ["Usage", s.usage ? `in ${formatNumber(s.usage.inputTokens)} · out ${formatNumber(s.usage.outputTokens)} · cache ${formatNumber(s.usage.cacheReadTokens)} · ${formatCost(s.usage.costUsd)}` : null],
    ]));
    const hist = (s.history ?? []).slice().reverse();
    frag.append(el("div", "detail-sub", `ACTIVITY (${hist.length})`));
    const feed = el("div", "feed");
    if (!hist.length) feed.append(el("div", "muted", "No activity recorded yet."));
    for (const h of hist) {
      const rawDetail = h.detail || h.thought || "";
      const row = el("div", "feed-item");
      row.append(el("span", "feed-time", timeOf(h.at)));
      row.append(el("span", `feed-type ${h.type === "thought" ? "thought" : "tool"}`, formatFeedType(h.name || h.type, rawDetail)));
      row.append(el("span", "feed-detail", formatDisplayPath(rawDetail, currentWorkspaceRoot)));
      feed.append(row);
    }
    frag.append(feed);
    return frag;
  }

  function openDetail(info, { push = true } = {}) {
    if (!dom.dialog || !info) return;
    if (dom.dialog.open && push && currentDetail) {
      const sameSession = currentDetail.kind === "session" && info.kind === "session" && currentDetail.session?.key === info.session?.key;
      if (!sameSession) detailStack.push(currentDetail);
    } else if (!dom.dialog.open) {
      detailStack = [];
    }
    currentDetail = info;
    if (dom.dBack) dom.dBack.hidden = detailStack.length === 0;

    const body = doc.createDocumentFragment();
    let title = "DETAILS";
    if (info.kind === "role") {
      const meta = ROLE_META[info.id];
      title = `${info.name || meta?.name || info.id}`.toUpperCase();
      body.append(dl([
        ["Duty", info.duty || meta?.duty],
        ["Status", info.status],
        ["Telemetry", info.telemetry === "live" ? "LIVE — active session detected" : info.telemetry === "hook" ? "HOOK READY — waiting for IDE/CLI session" : "NONE"],
        ["Providers", (info.providers ?? []).map((p) => PROVIDER_META[p]?.short ?? p).join(", ") || null],
      ]));
      if (info.telemetry === "none") {
        body.append(el("p", "detail-note", "LIVE-CHAT ROLE — BAAN records no runtime telemetry for this role; animation is decorative."));
      } else {
        if (info.telemetry === "hook") {
          body.append(el("p", "detail-note", "LIVE-CHAT ROLE — tracks IDE/CLI sessions and subagents via workspace hooks when active."));
        }
        body.append(sessionList(info.sessions));
      }
    } else if (info.kind === "provider") {
      const meta = PROVIDER_META[info.id];
      title = (info.name || meta?.name || info.id).toUpperCase();
      const lvl = info.quotaLevel ?? "unknown";
      body.append(dl([
        ["Enabled", info.enabled === false ? "OFF (local.json)" : info.enabled === true ? "ON" : "unknown"],
        ["Quota", lvl === "unknown" ? "LOCAL CLI (UNTRACKED)" : lvl.toUpperCase()],
        ["Instances", info.instances != null ? String(info.instances) : null],
        ["Roles", (info.roles ?? []).map((r) => ROLE_META[r]?.short ?? r).join(", ") || null],
      ]));
      body.append(sessionList(info.sessions));
    } else if (info.kind === "station") {
      title = String(info.label || info.id || "STATION").toUpperCase();
      body.append(sessionList(info.sessions));
    } else if (info.kind === "zone") {
      title = `ZONE · ${String(info.label || info.id || "ROOM").toUpperCase()}`;
      if (info.stations?.length) {
        body.append(dl([["Stations", info.stations.map((st) => st.label).join(", ")]]));
      }
      body.append(sessionList(info.sessions));
    } else if (info.kind === "session" && info.session) {
      const s = info.session;
      title = `SESSION · ${s.packageId ?? "?"}`;
      body.append(sessionDetail(s));
    } else {
      body.append(el("p", "muted", "Nothing to show."));
    }
    const wasOpen = dom.dialog.open;
    dom.dTitle.textContent = title;
    dom.dBody.replaceChildren(body);
    if (!wasOpen) {
      opener = doc.activeElement;
      if (typeof dom.dialog.showModal === "function") dom.dialog.showModal();
      else dom.dialog.setAttribute("open", "");
    } else {
      // Keep focus inside the modal when replacing body nodes on drill-down or back.
      const focusTarget = dom.dBack && !dom.dBack.hidden ? dom.dBack : dom.dClose;
      focusTarget?.focus?.();
    }
  }

  function closeDetail() {
    if (!dom.dialog?.open) return;
    if (typeof dom.dialog.close === "function") dom.dialog.close();
    else {
      dom.dialog.removeAttribute("open");
      dom.dialog.dispatchEvent(new Event("close"));
    }
  }

  function setHighlight({ rosterIds = [], sessionKeys = [] } = {}) {
    const rSet = new Set(rosterIds);
    const sSet = new Set(sessionKeys);
    if (dom.roster) {
      for (const b of dom.roster.querySelectorAll("[data-roster-id]")) {
        b.classList.toggle("is-highlighted", rSet.has(b.dataset.rosterId));
      }
    }
    if (dom.workshop) {
      for (const c of dom.workshop.querySelectorAll("[data-session-key]")) {
        c.classList.toggle("is-highlighted", sSet.has(c.dataset.sessionKey));
      }
    }
  }

  function on(name, fn) {
    if (!handlers.has(name)) handlers.set(name, new Set());
    handlers.get(name).add(fn);
    return () => handlers.get(name)?.delete(fn);
  }

  return { renderHeader, renderUsage, renderWorkshop, renderPipeline, renderQuests, renderRoster, openDetail, closeDetail, setHighlight, on };
}
