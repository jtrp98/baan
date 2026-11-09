import * as telemetry from "./telemetry.js";
import * as world from "./world.js";
import * as sprites from "./sprites.js";
import { Engine } from "./engine.js";
import { Director } from "./director.js";
import { createPanels } from "./panels.js";

const PREF_KEY = "baan.pixel.anim";
const panels = createPanels(document);
const canvas = document.getElementById("office-canvas");
const wrap = document.getElementById("office-wrap");
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

let lastState = null;
let connected = false;
let scope = "all";
// First state after load/reconnect/scope change must not replay reactions for things we never watched.
let needsReconcile = true;
let animOn = readPref() ?? !reducedMotion;
let engine = null;
let director = null;
let scale = 1;

function readPref() {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return v === "on" ? true : v === "off" ? false : null;
  } catch {
    return null;
  }
}

function writePref(on) {
  try { localStorage.setItem(PREF_KEY, on ? "on" : "off"); } catch {}
}

// The office is a visualization layer: if it fails to start, monitoring panels must keep working.
try {
  engine = new Engine(canvas, { sprites, world });
  director = new Director(engine, { world, telemetry });
  director.init({ agentsEnabled: null });
  engine.setAnimationEnabled(animOn);
  engine.start?.();
  engine.onPick = (hit) => {
    if (hit) panels.openDetail(director.inspect(hit));
  };
} catch (err) {
  console.error("BAAN Pixel HQ: office failed to start", err);
  engine = null;
  director = null;
  const note = document.createElement("p");
  note.className = "office-error";
  note.textContent = "PIXEL OFFICE UNAVAILABLE — monitoring data below is still live.";
  wrap.replaceChildren(note);
}

function sizeCanvas() {
  if (!engine) return;
  const w = world.COLS * world.TILE;
  const h = world.ROWS * world.TILE;
  const avail = wrap.clientWidth;
  // Integer scale keeps pixels crisp; below 1× the wrap scrolls instead of shrinking sprites.
  scale = Math.max(1, Math.floor(avail / w));
  canvas.style.width = `${w * scale}px`;
  canvas.style.height = `${h * scale}px`;
  engine.requestRender?.();
}

if (typeof ResizeObserver === "function") new ResizeObserver(sizeCanvas).observe(wrap);
else window.addEventListener("resize", sizeCanvas);
sizeCanvas();

function conn() {
  return telemetry.connectionStatus({ hasState: Boolean(lastState), connected });
}

function render() {
  const status = conn();
  if (!lastState) {
    panels.renderHeader({ workspaceName: "", workspaceRoot: "", workspaces: [], projects: [], scope, conn: status, activeCount: null, animOn });
    panels.renderWorkshop([], null, scope, status);
    return;
  }
  const sessions = telemetry.toSessions(lastState, scope);
  const pipeline = telemetry.pipelineView(lastState, sessions, scope);
  const quotaLevels = telemetry.providerQuotaLevels(lastState.quota);

  if (director) {
    try {
      director.update({
        sessions,
        callEnds: lastState.recentCallEnds ?? [],
        agentsEnabled: lastState.agentsEnabled ?? null,
        quotaLevels,
        pipeline,
        now: Date.now(),
        reconcile: needsReconcile,
      });
      needsReconcile = false;
    } catch (err) {
      console.error("BAAN Pixel HQ: director update failed", err);
    }
  }

  panels.renderHeader({
    workspaceName: lastState.workspaceName,
    workspaceRoot: lastState.workspaceRoot,
    workspaces: lastState.workspaces,
    projects: telemetry.projectsOf(lastState),
    scope,
    conn: status,
    activeCount: sessions.length,
    animOn,
  });
  panels.renderPipeline(pipeline);
  panels.renderWorkshop(sessions, lastState, scope, status);
  panels.renderUsage(lastState, scope, quotaLevels);
  panels.renderQuests(lastState.recentRuns ?? [], scope);
  if (director) panels.renderRoster(director.roster());
}

panels.on("selectWorkspace", async (workspacePath) => {
  try {
    const res = await fetch("/api/workspace/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: workspacePath }),
    });
    if (res.ok) {
      lastState = await res.json();
      scope = "all";
      needsReconcile = true;
      render();
    }
  } catch (err) {
    console.error("Failed to switch workspace", err);
  }
});

panels.on("scope", (next) => {
  if (next === scope) return;
  scope = next;
  needsReconcile = true;
  render();
});

panels.on("refreshQuota", async () => {
  panels.setRefreshing(true);
  try {
    const res = await fetch("/api/quota/refresh", { method: "POST" });
    if (res.ok) {
      lastState = await res.json();
      render();
    }
  } catch {}
  panels.setRefreshing(false);
});

panels.on("toggleAnim", () => {
  animOn = !animOn;
  writePref(animOn);
  engine?.setAnimationEnabled(animOn);
  render();
});

panels.on("inspect", (id) => {
  if (director) panels.openDetail(director.inspect({ kind: "character", id }));
});

panels.on("inspectSession", (key) => {
  const fromDirector = director?.inspectSession?.(key);
  const session = telemetry.toSessions(lastState, "all").find((s) => s.key === key);
  const info = fromDirector ?? (session ? { kind: "session", session } : null);
  if (info) panels.openDetail(info);
});

panels.on("zone", (zoneId) => {
  const z = world.ZONES[zoneId];
  if (!z) return;
  wrap.scrollTo({ left: Math.max(0, (z.x - 1) * world.TILE * scale), top: Math.max(0, (z.y - 1) * world.TILE * scale), behavior: reducedMotion ? "auto" : "smooth" });
});

function connect() {
  const es = new EventSource("/api/stream");
  es.onopen = () => {
    if (!connected) needsReconcile = true;
    connected = true;
    render();
  };
  es.onmessage = (e) => {
    try {
      lastState = JSON.parse(e.data);
    } catch {
      return;
    }
    connected = true;
    render();
  };
  es.onerror = () => {
    // EventSource retries by itself; we only reflect that the data is no longer live.
    if (connected) needsReconcile = true;
    connected = false;
    render();
  };
}

render();
connect();

// Debug hook for long-running stability checks (frame/transition counters), read-only.
window.__baanPixel = { get engine() { return engine; }, get director() { return director; } };
