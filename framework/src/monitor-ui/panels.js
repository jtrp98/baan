// DOM panels around the pixel office. Telemetry strings only ever reach the DOM via textContent.
import {
  PROVIDERS, PROVIDER_META, ROLE_META, PACKAGE_STATES, stateMeta,
  quotaWindows, quotaLevel, scopedUsage,
} from "./telemetry.js";

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function formatNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString("en-US") : "0";
}

export function formatCost(n) {
  const v = Number(n);
  return "$" + (Number.isFinite(v) ? v.toFixed(3) : "0.000");
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
    ws: $("ws-label"), tabs: $("tab-container"), refresh: $("btn-refresh-quota"), anim: $("btn-anim"),
    conn: $("conn-status"), count: $("active-count"), roster: $("roster"), pipeline: $("pipeline"),
    workshop: $("workshop"), usage: $("usage-cards"), quests: $("quest-log"), zones: $("zone-tabs"),
    dialog: $("detail-dialog"), dTitle: $("detail-title"), dBody: $("detail-body"), dClose: $("detail-close"),
  };

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
        if (node) node.replaceWith(fresh);
        node = fresh;
      }
      if (node !== cursor) container.insertBefore(node, cursor);
      else cursor = cursor.nextElementSibling;
    }
    for (const [key, node] of existing) if (!seen.has(key)) node.remove();
  }

  // ---------- event delegation on stable containers ----------
  dom.tabs?.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-scope]");
    if (b) emit("scope", b.dataset.scope);
  });
  dom.refresh?.addEventListener("click", () => emit("refreshQuota"));
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
    // Expanding the activity stream or selecting text in it must not open the inspector.
    if (e.target.closest?.("summary, .feed")) return;
    const card = e.target.closest?.("[data-session-key]");
    if (card) emit("inspectSession", card.dataset.sessionKey);
  });
  dom.workshop?.addEventListener("toggle", (e) => {
    const d = e.target;
    const card = d?.closest?.("[data-session-key]");
    if (card && d.classList?.contains("sc-history")) historyOpen.set(card.dataset.sessionKey, d.open);
  }, true);

  let opener = null;
  dom.dClose?.addEventListener("click", () => closeDetail());
  dom.dialog?.addEventListener("click", (e) => {
    if (e.target === dom.dialog) { closeDetail(); return; }
    const b = e.target.closest?.("[data-session-key]");
    if (b) emit("inspectSession", b.dataset.sessionKey);
  });
  dom.dialog?.addEventListener("close", () => {
    const o = opener;
    opener = null;
    if (o && o.isConnected && typeof o.focus === "function") o.focus();
  });

  // ---------- header ----------
  let lastConn = "NO DATA";
  function renderHeader({ workspaceName, projects = [], scope = "all", conn = "NO DATA", activeCount = 0, animOn = true } = {}) {
    lastConn = conn;
    if (dom.ws) dom.ws.textContent = workspaceName || "…";
    if (dom.conn) {
      dom.conn.textContent = conn;
      dom.conn.dataset.state = conn;
    }
    // null = no data yet; showing "0" would claim a known-idle state.
    if (dom.count) dom.count.textContent = activeCount == null ? "— ACTIVE" : `${activeCount} ACTIVE`;
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

  function setRefreshing(on) {
    if (!dom.refresh) return;
    dom.refresh.disabled = !!on;
    dom.refresh.setAttribute("aria-busy", String(!!on));
    dom.refresh.textContent = on ? "⏳ CHECKING…" : "🔄 REFRESH QUOTA";
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

  const QUOTA_HINTS = {
    claude: 'พร้อมตรวจจับโควตาจาก ~/.claude.json หรือ claude -p "/usage"',
    codex: "พร้อมตรวจจับโควตาจาก ~/.codex/auth.json",
    agy: 'พร้อมตรวจจับโควตาจาก agy -p "/usage"',
  };

  function planLine(p, q) {
    if (p === "claude") {
      const plan = q?.planType ? String(q.planType).replace(/_/g, " ").toUpperCase() : "SUBSCRIPTION";
      const account = q?.accountLabel || "Anthropic Subscription";
      return { plan, account };
    }
    if (p === "codex") return { plan: q?.planType ? String(q.planType).toUpperCase() : "PLUS", account: q?.accountLabel || "ChatGPT Plus Account" };
    return { plan: "ANTIGRAVITY", account: "Google Antigravity / Gemini" };
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
    const right = el("span");
    if (low) right.append(badge(level === "low" ? "⚠ LOW QUOTA" : "⚠ QUOTA WARN", level === "low" ? "error" : "warn"));
    if (off) right.append(badge("OFF", "off", "Disabled in local.json agents"));
    title.append(right);
    card.append(title);

    card.append(el("div", "card-big", formatCost(agent.costUsd)));
    card.append(el("div", "card-sub", `${formatNumber(agent.calls)} CALLS`));
    card.append(statGrid([
      ["INPUT", formatNumber(agent.inputTokens)],
      ["OUTPUT", formatNumber(agent.outputTokens)],
      ["CACHE READ", formatNumber(agent.cacheReadTokens)],
      ["TURNS", formatNumber(agent.turns)],
    ]));
    if (scoped) card.append(el("div", "scope-note", "Workspace-wide (not per-project)"));

    const qb = el("div", "quota-box");
    const { plan, account } = planLine(p, quota);
    qb.append(el("div", "plan-line", `${plan} · 👤 ${account}`));
    if (windows.length) {
      for (const w of windows) qb.append(energyBar(w));
    } else {
      const empty = el("div", "energy lvl-unknown quota-empty");
      const head = el("div", "energy-head");
      head.append(el("span", null, "QUOTA"), el("strong", null, "UNAVAILABLE"));
      const cells = el("div", "energy-cells", "QUOTA UNAVAILABLE");
      empty.append(head, cells);
      qb.append(empty);
      qb.append(el("div", "quota-hint", quota?.error ? String(quota.error) : QUOTA_HINTS[p]));
    }
    card.append(qb);
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
    tot.append(title);
    tot.append(el("div", "card-big", formatCost(total?.costUsd)));
    tot.append(el("div", "card-sub", `${formatNumber(total?.calls)} CALLS`));
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
    return [s.runId, s.packageId, s.title, s.project, s.repoPath, s.role, s.roleLabel, s.provider, s.providerLabel,
      s.tier, s.tool, s.thought, s.history?.slice(-8), s.usage, s.packageState, s.startedAt, s.stale];
  }

  function buildSessionCard(s, old) {
    const card = el("article", "session-card px-box");
    card.dataset.sessionKey = s.key;
    if (s.provider) setColorVar(card, "--pc", PROVIDER_META[s.provider].color);

    const head = el("div", "sc-head");
    const left = el("div");
    left.append(el("div", "sc-project", s.project || "UNKNOWN PROJECT"));
    left.append(el("div", "sc-title", [s.packageId, s.title].filter(Boolean).join(" · ") || "(untitled package)"));
    head.append(left);
    const dur = el("span", "badge tone-muted");
    dur.dataset.since = s.startedAt ?? "";
    dur.title = "Running time";
    head.append(dur);
    card.append(head);

    const badges = el("div", "sc-badges");
    const roleText = s.role ? ROLE_META[s.role].short : s.roleLabel ? truncate(s.roleLabel, 20) : "UNKNOWN ROLE";
    badges.append(badge(roleText, s.role ? "info" : "muted"));
    const prov = badge(s.provider ? PROVIDER_META[s.provider].short : s.providerLabel ? truncate(s.providerLabel, 16) : "UNKNOWN PROVIDER",
      s.provider ? "provider" : "muted");
    if (s.provider) setColorVar(prov, "--pc", PROVIDER_META[s.provider].color);
    badges.append(prov);
    if (s.packageState) {
      const m = stateMeta(s.packageState);
      badges.append(badge(m.label, m.tone));
    }
    if (s.tier) badges.append(badge(`TIER ${s.tier}`, "muted"));
    if (s.stale) {
      const st = badge("NO UPDATE", "warn", "No telemetry update recently");
      st.dataset.updated = s.updatedAt ?? "";
      badges.append(st);
    }
    card.append(badges);

    card.append(el("div", "sc-meta", `RUN ${shortRunId(s.runId)}`));
    if (s.repoPath) {
      const cwd = el("div", "sc-meta", `CWD ${s.repoPath}`);
      cwd.title = s.repoPath;
      card.append(cwd);
    }

    const action = el("div", "sc-action");
    const at = el("div", "sc-action-text");
    if (s.tool && (s.tool.name || s.tool.detail)) {
      at.append(el("span", "sc-tool", `[${s.tool.name || "tool"}] `));
      at.append(doc.createTextNode(truncate(s.tool.detail, 240)));
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
      det.append(el("summary", null, `ACTIVITY (${hist.length})`));
      const feed = el("div", "feed");
      for (const h of hist) {
        const row = el("div", "feed-item");
        row.append(el("span", "feed-time", timeOf(h.at)));
        row.append(el("span", `feed-type ${h.type === "thought" ? "thought" : "tool"}`, `${h.name || h.type || "?"}:`));
        row.append(el("span", "feed-detail", truncate(h.detail || h.thought || "", 300)));
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
    ins.setAttribute("aria-label", `Inspect session ${s.packageId ?? ""} ${s.title ?? ""}`.trim());
    card.append(ins);
    return card;
  }

  function emptyState(cls, title, lines, robot) {
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
    return box;
  }

  function refreshClocks(now = Date.now()) {
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
    const c = conn ?? (state ? lastConn : "NO DATA");
    const list = Array.isArray(sessions) ? sessions : [];
    if (changed("workshop", { conn: c, scope, n: list.map(sessionSig), keys: list.map((s) => s.key) })) {
      const w = dom.workshop;
      if (!list.length) {
        let box;
        if (c === "LIVE") {
          box = emptyState("state-ok", "ALL SYSTEMS READY", ["__cursor",
            scope === "all" ? "สั่งงานในเทอร์มินัล (เช่น baan WP-1) แล้ว session จะขึ้นที่นี่สดๆ"
              : `ไม่มีงานรันอยู่ใน ${scope} ตอนนี้`], true);
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
    if (p.unknownRole) frag.append(el("div", "pipe-note", "ℹ 1+ session with unknown role"));
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
    const st = questStatus(run);
    sum.append(el("span", "quest-id", shortRunId(run.id)));
    sum.append(badge(st.label, st.tone));
    const created = new Date(run.createdAt ?? "");
    const metaBits = [
      Number.isNaN(created.getTime()) ? null : formatStandardDate(created),
      (run.projects ?? []).join(", ") || "-",
      [run.mode, run.executionMode].filter(Boolean).join(" / ") || null,
    ].filter(Boolean);
    sum.append(el("span", "quest-meta", metaBits.join(" · ")));

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
      li.append(badge(m.label, m.tone));
      li.append(el("span", "pkg-id", pk.id ?? "?"));
      if (pk.title) li.append(el("span", null, pk.title));
      if (pk.failureClass) li.append(el("span", "muted", `(${pk.failureClass})`));
      ul.append(li);
    }
    d.append(ul);
    return d;
  }

  function renderQuests(recentRuns = [], scope = "all") {
    if (!dom.quests) return;
    const runs = Array.isArray(recentRuns) ? recentRuns : [];
    if (!changed("quests", { runs, scope })) return;
    const first = seenRuns === null;
    const prevSeen = seenRuns ?? new Set();
    // Track all runs (not only the visible scope) so switching tabs never flags old quests as new.
    seenRuns = new Set(runs.map((r) => String(r.id)));
    const visible = runs.filter((r) => !scope || scope === "all" || (r.projects ?? []).includes(scope));
    if (!visible.length) {
      dom.quests.replaceChildren(el("div", "quest-empty px-box", scope === "all" ? "NO RUNS YET — ยังไม่มีประวัติ run" : `NO RUNS FOR ${scope}`));
      return;
    }
    dom.quests.querySelector(".quest-empty")?.remove();
    reconcile(dom.quests, visible, (r) => r.id, questSig, (r, old) => buildQuest(r, old, !first && !old && !prevSeen.has(String(r.id))));
  }

  // ---------- roster ----------
  function renderRoster(roster = []) {
    if (!dom.roster) return;
    const list = Array.isArray(roster) ? roster : [];
    if (!changed("roster", list)) return;
    reconcile(dom.roster, list, (r) => r.id, (r) => [r.kind, r.label, r.status, r.color], (r) => {
      const b = el("button", `px-btn chip kind-${r.kind === "provider" ? "provider" : "role"}`);
      b.type = "button";
      b.dataset.rosterId = r.id;
      setColorVar(b, "--chip", r.color);
      const dot = el("span", "chip-dot");
      dot.setAttribute("aria-hidden", "true");
      b.append(dot, el("span", null, r.label));
      if (r.status) b.append(el("span", "chip-status", String(r.status)));
      b.setAttribute("aria-label", `${r.label}${r.status ? ` — ${r.status}` : ""}. Inspect`);
      return b;
    });
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
    frag.append(dl([
      ["Project", s.project || "unknown"],
      ["Run", s.runId],
      ["Package", [s.packageId, s.title].filter(Boolean).join(" · ")],
      ["Role", s.role ? ROLE_META[s.role].name : `UNKNOWN${s.roleLabel ? ` (${s.roleLabel})` : ""}`],
      ["Provider", s.provider ? PROVIDER_META[s.provider].name : `UNKNOWN${s.providerLabel ? ` (${s.providerLabel})` : ""}`],
      ["Tier", s.tier],
      ["State", m ? badge(m.label, m.tone) : "unknown"],
      ["CWD", s.repoPath],
      ["Running", Number.isFinite(started) ? formatDuration(Date.now() - started) : null],
      ["Stale", s.stale ? "yes — no recent telemetry update" : null],
      ["Action", s.tool ? `[${s.tool.name}] ${s.tool.detail}` : "Starting…"],
      ["Thought", s.thought ? `💭 ${s.thought}` : null],
      ["Usage", s.usage ? `in ${formatNumber(s.usage.inputTokens)} · out ${formatNumber(s.usage.outputTokens)} · cache ${formatNumber(s.usage.cacheReadTokens)} · ${formatCost(s.usage.costUsd)}` : null],
    ]));
    const hist = (s.history ?? []).slice().reverse();
    frag.append(el("div", "detail-sub", `ACTIVITY (${hist.length})`));
    const feed = el("div", "feed");
    if (!hist.length) feed.append(el("div", "muted", "No activity recorded yet."));
    for (const h of hist) {
      const row = el("div", "feed-item");
      row.append(el("span", "feed-time", timeOf(h.at)));
      row.append(el("span", `feed-type ${h.type === "thought" ? "thought" : "tool"}`, `${h.name || h.type || "?"}:`));
      row.append(el("span", "feed-detail", h.detail || h.thought || ""));
      feed.append(row);
    }
    frag.append(feed);
    return frag;
  }

  function openDetail(info) {
    if (!dom.dialog || !info) return;
    const body = doc.createDocumentFragment();
    let title = "DETAILS";
    if (info.kind === "role") {
      const meta = ROLE_META[info.id];
      title = `${info.name || meta?.name || info.id}`.toUpperCase();
      body.append(dl([
        ["Duty", info.duty || meta?.duty],
        ["Status", info.status],
        ["Telemetry", info.telemetry === "live" ? "LIVE — from BAAN active session files" : "NONE"],
        ["Providers", (info.providers ?? []).map((p) => PROVIDER_META[p]?.short ?? p).join(", ") || null],
      ]));
      if (info.telemetry === "none") {
        body.append(el("p", "detail-note", "LIVE-CHAT ROLE — BAAN records no runtime telemetry for this role; animation is decorative."));
      } else body.append(sessionList(info.sessions));
    } else if (info.kind === "provider") {
      const meta = PROVIDER_META[info.id];
      title = (info.name || meta?.name || info.id).toUpperCase();
      const lvl = info.quotaLevel ?? "unknown";
      body.append(dl([
        ["Enabled", info.enabled === false ? "OFF (local.json)" : info.enabled === true ? "ON" : "unknown"],
        ["Quota", lvl === "unknown" ? "UNAVAILABLE" : lvl.toUpperCase()],
        ["Instances", info.instances != null ? String(info.instances) : null],
        ["Roles", (info.roles ?? []).map((r) => ROLE_META[r]?.short ?? r).join(", ") || null],
      ]));
      body.append(sessionList(info.sessions));
    } else if (info.kind === "station") {
      title = String(info.label || info.id || "STATION").toUpperCase();
      body.append(sessionList(info.sessions));
    } else if (info.kind === "session" && info.session) {
      const s = info.session;
      title = `SESSION · ${s.packageId ?? "?"}`;
      body.append(sessionDetail(s));
    } else {
      body.append(el("p", "muted", "Nothing to show."));
    }
    dom.dTitle.textContent = title;
    dom.dBody.replaceChildren(body);
    if (!dom.dialog.open) {
      opener = doc.activeElement;
      if (typeof dom.dialog.showModal === "function") dom.dialog.showModal();
      else dom.dialog.setAttribute("open", "");
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

  function on(name, fn) {
    if (!handlers.has(name)) handlers.set(name, new Set());
    handlers.get(name).add(fn);
    return () => handlers.get(name)?.delete(fn);
  }

  return { renderHeader, renderUsage, renderWorkshop, renderPipeline, renderQuests, renderRoster, openDetail, closeDetail, on, setRefreshing };
}
