// Pure adapter: BAAN monitor state -> presentation model. No DOM, so node:test can import it.
// Rule of thumb in this file: anything telemetry does not say stays null/unknown.

export const PROVIDERS = ["claude", "codex", "agy"];
export const EXEC_ROLES = ["planner", "worker", "verifier"];
// Live-chat roles from roles/*.md: BAAN writes no runtime telemetry for them.
export const CHAT_ROLES = ["spec", "arch", "pm", "build", "check", "survey", "ui", "review"];

export const PROVIDER_META = {
  claude: { name: "Claude Code", short: "CLAUDE", color: "#F97316" },
  codex: { name: "Codex CLI", short: "CODEX", color: "#10B981" },
  agy: { name: "Google Antigravity", short: "AGY", color: "#8B5CF6" },
};

export const ROLE_META = {
  orchestrator: { name: "Orchestrator", short: "ORCH", duty: "ประสานงาน run: จัดคิว ล็อก repo, snapshot, gate และ approval" },
  planner: { name: "Planner", short: "PLANNER", duty: "แตกงานเป็นแผนเมื่อจำเป็น (ข้ามได้ตามความเสี่ยง)" },
  worker: { name: "Worker", short: "WORKER", duty: "ลงมือแก้โค้ด/รันคำสั่งในขอบเขต package" },
  verifier: { name: "Verifier", short: "VERIFIER", duty: "ตรวจหลักฐานผลงานตามความเสี่ยง (มีเงื่อนไข)" },
  spec: { name: "Spec", short: "SPEC", duty: "ทีมสร้าง: เก็บ requirement และ acceptance criteria" },
  arch: { name: "Architect", short: "ARCH", duty: "ทีมสร้าง: ออกแบบสถาปัตยกรรม" },
  pm: { name: "PM", short: "PM", duty: "ทีมสร้าง: แตกงานและติดตาม milestone" },
  build: { name: "Build", short: "BUILD", duty: "ทีมสร้าง: พัฒนาแบบคุยสด" },
  check: { name: "Check", short: "CHECK", duty: "ทีมสร้าง: ตรวจคุณภาพแบบคุยสด" },
  survey: { name: "Survey", short: "SURVEY", duty: "ทีมออกแบบ: สำรวจโครงการ/โครงสร้าง repo" },
  ui: { name: "UI Designer", short: "UI", duty: "ทีมออกแบบ: ออกแบบหน้าจอ" },
  review: { name: "Review", short: "REVIEW", duty: "ทีมออกแบบ: รีวิวงานออกแบบและเอกสาร" },
};

// Every documented package state keeps its own meaning; none collapses into generic success/failure.
export const PACKAGE_STATES = {
  pending: { label: "PENDING", tone: "muted" },
  probing: { label: "PROBING", tone: "info" },
  running: { label: "RUNNING", tone: "active" },
  gating: { label: "GATING", tone: "active" },
  verifying: { label: "VERIFYING", tone: "active" },
  done: { label: "DONE", tone: "success" },
  waiting_human: { label: "HUMAN DECISION NEEDED", tone: "human" },
  stale: { label: "STALE", tone: "warn" },
  env_failed: { label: "ENV FAILED", tone: "error" },
  blocked: { label: "BLOCKED", tone: "error" },
  cancelled: { label: "CANCELLED", tone: "muted" },
};

export function stateMeta(state) {
  return PACKAGE_STATES[state] ?? { label: state ? String(state).toUpperCase() : "UNKNOWN", tone: "muted" };
}

export function normalizeProvider(agent) {
  const a = typeof agent === "string" ? agent.trim().toLowerCase() : "";
  return PROVIDERS.includes(a) ? a : null;
}

export function normalizeRole(role) {
  const r = typeof role === "string" ? role.trim().toLowerCase() : "";
  return EXEC_ROLES.includes(r) ? r : null;
}

const READ_TOOLS = /^(read|view|cat|grep|glob|ls|list|search|find|web_?fetch|web_?search|read_file|open)/i;
const EDIT_TOOLS = /(edit|write|patch|apply|create|replace|multi_?edit|notebook)/i;
const EXEC_TOOLS = /^(bash|shell|exec|command|run|powershell|terminal|local_shell)/i;

// UI animation states (not BAAN statuses): IDLE WALKING READING CODING EXECUTING PLANNING VERIFYING THINKING
export function activityToUiState(activity, thought, role) {
  const name = activity?.name ?? "";
  if (name) {
    if (EXEC_TOOLS.test(name)) return "EXECUTING";
    if (EDIT_TOOLS.test(name)) return "CODING";
    if (READ_TOOLS.test(name)) return "READING";
  }
  if (thought && !name) return "THINKING";
  if (role === "planner") return "PLANNING";
  if (role === "verifier") return "VERIFYING";
  if (role === "worker") return "CODING";
  return "PROCESSING";
}

export function bubbleFor(session) {
  const p = session.provider ? PROVIDER_META[session.provider].short : "CLI";
  const r = session.role ? ROLE_META[session.role].short : "ROLE UNKNOWN";
  const verb = {
    READING: "READING FILE", CODING: "EDITING CODE", EXECUTING: "RUNNING COMMAND", THINKING: "THINKING",
    PLANNING: "PLANNING", VERIFYING: "VERIFYING", PROCESSING: "PROCESSING",
  }[session.uiState] ?? session.uiState;
  return `${r} + ${p} — ${verb}`;
}

export function sessionKey(runId, packageId, role) {
  return `${runId ?? "?"}|${packageId ?? "?"}|${role ?? "?"}`;
}

export function projectsOf(state) {
  const names = new Set();
  for (const r of state?.activeRuns ?? []) if (r.repoName) names.add(r.repoName);
  for (const p of Object.keys(state?.usage?.projects ?? {})) names.add(p);
  for (const run of state?.recentRuns ?? []) for (const p of run.projects ?? []) names.add(p);
  names.delete("unknown");
  return [...names].filter(Boolean).sort();
}

export function inScope(project, scope) {
  return !scope || scope === "all" || project === scope;
}

// One entry per in-flight CLI call (= one active-<pkg>.json), which is BAAN's only live session record.
export function toSessions(state, scope = "all") {
  const out = [];
  for (const run of state?.activeRuns ?? []) {
    const pkgs = run.activePackages?.length ? run.activePackages : [];
    for (const p of pkgs) {
      const project = p.repoName ?? run.repoName ?? null;
      if (!inScope(project, scope)) continue;
      const rawRole = p.role ?? null;
      const role = normalizeRole(rawRole);
      const provider = normalizeProvider(p.agent);
      const activity = p.recentActivity ?? null;
      const thought = p.recentThought ?? "";
      const pkgInfo = run.runInfo?.packages?.find((x) => x.id === p.packageId);
      const s = {
        key: sessionKey(p.runId ?? run.runId, p.packageId, rawRole),
        runId: run.runId,
        packageId: p.packageId ?? null,
        title: p.title ?? run.title ?? "",
        project,
        repoPath: p.repoPath ?? run.repoPath ?? "",
        role,
        roleLabel: rawRole ? String(rawRole) : null,
        provider,
        providerLabel: p.agent ? String(p.agent) : null,
        tier: p.tier ?? run.tier ?? null,
        tool: activity ? { name: activity.name ?? "", detail: activity.detail ?? "" } : null,
        thought,
        history: Array.isArray(p.history) ? p.history : [],
        usage: p.usage ?? null,
        packageState: pkgInfo?.state ?? null,
        startedAt: p.startedAt ?? null,
        updatedAt: p.updatedAt ?? null,
        stale: p.stale === true,
        station: role ?? "cli",
      };
      s.uiState = activityToUiState(activity, thought, role);
      s.bubble = bubbleFor(s);
      out.push(s);
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

// Only these fields decide whether a character must change what it is doing (Rule 5: no flicker).
const VISUAL_FIELDS = ["uiState", "provider", "role", "stale", "packageState"];

export function diffSessions(prevMap, nextList) {
  const prev = prevMap instanceof Map ? prevMap : new Map();
  const next = new Map(nextList.map((s) => [s.key, s]));
  const started = [];
  const changed = [];
  const ended = [];
  for (const [k, s] of next) {
    const old = prev.get(k);
    if (!old) started.push(s);
    else {
      const fields = VISUAL_FIELDS.filter((f) => old[f] !== s[f]);
      if (fields.length) changed.push({ prev: old, next: s, fields });
    }
  }
  for (const [k, s] of prev) if (!next.has(k)) ended.push(s);
  return { started, changed, ended, next };
}

// session.mjs deletes the active file *before* appending call_end, so a verdict may lag a tick.
export function findCallEnd(callEnds, session) {
  const since = Date.parse(session.startedAt ?? "") || 0;
  const hit = [...(callEnds ?? [])].reverse().find((e) =>
    e.runId === session.runId && e.package === session.packageId &&
    (e.role ?? null) === (session.roleLabel ?? null) && (Date.parse(e.at) || 0) >= since);
  if (!hit) return null;
  return hit.ok ? "success" : "error";
}

export const VERDICT_WAIT_MS = 4000;

// pending: [{session, endedAt}] -> {resolved:[{session, verdict}], pending:[...]}; verdict null = unknown outcome.
export function resolveEnded(pending, callEnds, now = Date.now()) {
  const resolved = [];
  const still = [];
  for (const item of pending) {
    const verdict = findCallEnd(callEnds, item.session);
    if (verdict) resolved.push({ session: item.session, verdict });
    else if (now - item.endedAt >= VERDICT_WAIT_MS) resolved.push({ session: item.session, verdict: null });
    else still.push(item);
  }
  return { resolved, pending: still };
}

function remainingOf(used, remaining) {
  if (remaining != null && Number.isFinite(Number(remaining))) return Math.max(0, Math.min(100, Math.round(Number(remaining))));
  if (used != null && Number.isFinite(Number(used))) return Math.max(0, Math.min(100, 100 - Math.round(Number(used))));
  return null;
}

// remainingPct null means UNAVAILABLE — never rendered as 0.
export function quotaWindows(quota) {
  const c = quota?.claude;
  const x = quota?.codex;
  const g = quota?.agy;
  const win = (label, used, remaining, resetsAt) => ({ label, remainingPct: remainingOf(used, remaining), resetsAt: resetsAt ?? null });
  return {
    claude: c?.available ? [
      win("5-HOUR", c.sessionUsedPct, c.sessionRemainingPct, c.sessionResetsAt),
      win("WEEKLY", c.weeklyUsedPct, c.weeklyRemainingPct, c.weeklyResetsAt),
    ] : [],
    codex: x?.available ? [
      win("5-HOUR", x.sessionUsedPct, x.sessionRemainingPct, x.sessionResetsAt),
      win("WEEKLY", x.weeklyUsedPct, x.weeklyRemainingPct, x.weeklyResetsAt),
    ] : [],
    agy: g?.available ? [
      win("5-HOUR", null, g.gemini5hRemainingPct, g.gemini5hResetsAt),
      win("WEEKLY", null, g.geminiWeeklyRemainingPct, g.geminiWeeklyResetsAt),
      win("ARGON WEEKLY", null, g.argonWeeklyRemainingPct, g.argonWeeklyResetsAt),
    ] : [],
  };
}

export function quotaLevel(remainingPct) {
  if (remainingPct == null) return "unknown";
  if (remainingPct > 30) return "ok";
  if (remainingPct >= 10) return "warn";
  return "low";
}

// Worst known window per provider; "unknown" only when no window has data.
export function providerQuotaLevels(quota) {
  const w = quotaWindows(quota);
  const out = {};
  for (const p of PROVIDERS) {
    const known = w[p].map((x) => x.remainingPct).filter((v) => v != null);
    out[p] = known.length ? quotaLevel(Math.min(...known)) : "unknown";
  }
  return out;
}

// NO DATA (never received state) and RECONNECTING (lost stream) are both distinct from an idle office.
export function connectionStatus({ hasState, connected }) {
  if (connected && hasState) return "LIVE";
  if (!hasState) return connected ? "WAITING" : "NO DATA";
  return "RECONNECTING";
}

// Pipeline highlights come only from live sessions + package states, so skipped stages stay dim.
export function pipelineView(state, sessions, scope = "all") {
  const runs = (state?.activeRuns ?? []).filter((r) => (r.activePackages ?? []).some((p) => inScope(p.repoName ?? r.repoName, scope)));
  const activeRoles = new Set(sessions.map((s) => s.role).filter(Boolean));
  const states = {};
  for (const r of runs) for (const p of r.runInfo?.packages ?? []) {
    if (!inScope(p.repoName || r.repoName, scope)) continue;
    const k = p.state ?? "unknown";
    states[k] = (states[k] ?? 0) + 1;
  }
  return {
    orchestrator: runs.length > 0,
    activeRunCount: runs.length,
    planner: activeRoles.has("planner"),
    worker: activeRoles.has("worker"),
    verifier: activeRoles.has("verifier"),
    unknownRole: sessions.some((s) => !s.role),
    states,
  };
}

export function scopedUsage(state, scope = "all") {
  if (!scope || scope === "all") return { agents: state?.usage?.agents ?? {}, total: state?.usage?.total ?? {}, scoped: false };
  return { agents: state?.usage?.agents ?? {}, total: state?.usage?.projects?.[scope] ?? {}, scoped: true };
}
