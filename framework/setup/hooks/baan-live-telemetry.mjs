#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PROVIDERS = new Set(["agy", "claude", "codex"]);
const KNOWN_ROLES = new Set([
  "orchestrator", "planner", "worker", "verifier",
  "spec", "arch", "pm", "build", "check", "survey", "ui", "review",
]);
const SUBAGENT_TOOLS = new Set(["invoke_subagent", "agent", "task", "spawn_agent", "collaboration.spawn_agent"]);
const STALE_PENDING_MS = 10 * 60 * 1000;

function hashKey(...parts) {
  return createHash("sha1").update(parts.map((p) => String(p ?? "")).join("|")).digest("hex").slice(0, 16);
}

function oneLine(text, max = 140) {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function summarizeToolDetail(name, args) {
  if (!args || typeof args !== "object") return "";
  const candidate =
    args.Role ?? args.role ?? args.description ?? args.CommandLine ?? args.command ??
    args.Path ?? args.path ?? args.file_path ?? args.TargetFile ?? args.AbsolutePath ??
    args.Query ?? args.query ?? args.pattern ?? args.Prompt ?? args.prompt ?? "";
  return oneLine(candidate, 180);
}

export function inferBaanRole({ prompt = "", roleLabel = "", agentType = "" } = {}) {
  const tag = String(prompt ?? "").match(/\[baan:\s*([a-z0-9_-]+)\]/i);
  if (tag && KNOWN_ROLES.has(tag[1].toLowerCase())) return tag[1].toLowerCase();

  for (const raw of [agentType, roleLabel]) {
    const clean = String(raw ?? "").trim().toLowerCase().replace(/^baan[-:]/, "");
    if (KNOWN_ROLES.has(clean)) return clean;
    const prefix = clean.match(/^([a-z]+)\s*(?::|-|\||\]|\()/);
    if (prefix && KNOWN_ROLES.has(prefix[1])) return prefix[1];
  }
  return null;
}

export function resolveWorkspaceRoot(cwd, workspacePaths = []) {
  const candidates = [];
  if (Array.isArray(workspacePaths)) {
    for (const p of workspacePaths) if (typeof p === "string" && p.trim()) candidates.push(path.resolve(p));
  }
  if (typeof cwd === "string" && cwd.trim()) candidates.push(path.resolve(cwd));

  // Prefer baan.config.json along the entire parent chain first so a stray folder inside target/ never wins.
  for (const marker of ["baan.config.json", ".baan"]) {
    for (const start of candidates) {
      let cur = start;
      while (cur) {
        if (existsSync(path.join(cur, marker))) return cur;
        const parent = path.dirname(cur);
        if (parent === cur) break;
        cur = parent;
      }
    }
  }
  return null;
}

function detectProvider(payload, providerHint) {
  if (providerHint && PROVIDERS.has(providerHint)) return providerHint;
  if ("conversationId" in payload || "toolCall" in payload || "workspacePaths" in payload) return "agy";
  if ("agent_id" in payload || "agent_type" in payload || "tool_use_id" in payload) return "claude";
  if ("call_id" in payload) return "codex";
  return null;
}

export function normalizeHookEvent(payload, { providerHint = null } = {}) {
  if (!payload || typeof payload !== "object") return null;
  const provider = detectProvider(payload, providerHint);
  const rawEvent = payload.hookEventName ?? payload.hook_event_name ?? "";
  if (!rawEvent) return null;

  const sessionId = String(payload.conversationId ?? payload.session_id ?? "").trim();
  if (!sessionId) return null;

  const toolCall = payload.toolCall && typeof payload.toolCall === "object" ? payload.toolCall : null;
  const toolName = String(toolCall?.name ?? payload.tool_name ?? "").trim();
  const toolArgs = (toolCall?.args ?? payload.tool_input ?? {}) || {};
  const toolId = String(toolCall?.id ?? payload.tool_use_id ?? payload.call_id ?? "").trim();

  const workspacePaths = Array.isArray(payload.workspacePaths) ? payload.workspacePaths : [];
  const cwd = String(payload.cwd ?? workspacePaths[0] ?? "").trim();
  const model = String(payload.modelName ?? payload.model ?? "").trim() || null;
  const userInput = String(payload.lastUserInput ?? payload.prompt ?? "").trim();

  return {
    provider,
    event: String(rawEvent),
    sessionId,
    cwd,
    workspacePaths,
    model,
    userInput,
    fullyIdle: payload.fullyIdle,
    error: payload.error ? oneLine(payload.error, 180) : null,
    subagentId: payload.agent_id ? String(payload.agent_id) : null,
    agentType: payload.agent_type ? String(payload.agent_type) : null,
    tool: toolName ? {
      id: toolId || null,
      name: toolName,
      detail: summarizeToolDetail(toolName, toolArgs),
      args: typeof toolArgs === "object" ? toolArgs : {},
    } : null,
  };
}

function readJsonSafe(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function writeAtomic(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  renameSync(tmp, file);
}

function safeUnlink(file) {
  try { if (existsSync(file)) unlinkSync(file); } catch {}
}

function pushHistory(existing, item) {
  const list = Array.isArray(existing) ? existing.slice(-24) : [];
  list.push(item);
  return list;
}

function findPendingMatch(liveDir, promptText, nowMs = Date.now()) {
  if (!promptText || !existsSync(liveDir)) return null;
  const sig = hashKey(oneLine(promptText, 120));
  const now = Number.isFinite(nowMs) ? nowMs : Date.now();
  try {
    for (const f of readdirSync(liveDir)) {
      if (!f.startsWith("sub-") || !f.endsWith(".json")) continue;
      const full = path.join(liveDir, f);
      const rec = readJsonSafe(full);
      if (!rec || !rec.pendingLaunch) continue;
      const age = now - (Date.parse(rec.updatedAt ?? "") || 0);
      if (age > STALE_PENDING_MS) continue;
      if (rec.promptSig === sig) return { file: full, record: rec };
    }
  } catch {}
  return null;
}

function cleanupChildLaunches(liveDir, parentSessionId) {
  if (!parentSessionId || !existsSync(liveDir)) return;
  try {
    for (const f of readdirSync(liveDir)) {
      if (!f.startsWith("sub-") || !f.endsWith(".json")) continue;
      const full = path.join(liveDir, f);
      const rec = readJsonSafe(full);
      if (rec?.parentSessionId === parentSessionId && rec?.pendingLaunch) safeUnlink(full);
    }
  } catch {}
}

export function processHookEvent(payload, { providerHint = null, workspaceRoot = null, now = new Date().toISOString() } = {}) {
  const ev = normalizeHookEvent(payload, { providerHint });
  if (!ev) return { handled: false, reason: "invalid_payload" };

  const root = workspaceRoot || resolveWorkspaceRoot(ev.cwd, ev.workspacePaths);
  if (!root) return { handled: false, reason: "no_workspace" };

  const liveDir = path.join(root, ".baan", "live");
  const provider = ev.provider || "unknown";
  const sessFile = path.join(liveDir, `sess-${hashKey(provider, ev.sessionId)}.json`);

  if (ev.event === "SubagentStart") {
    const subKey = ev.subagentId || `${ev.sessionId}-sub`;
    const subFile = path.join(liveDir, `sub-${hashKey(provider, ev.sessionId, subKey)}.json`);
    const role = inferBaanRole({ roleLabel: ev.agentType, agentType: ev.agentType });
    const record = {
      source: "hook",
      kind: "subagent",
      isSubagent: true,
      sessionId: subKey,
      parentSessionId: ev.sessionId,
      provider,
      model: ev.model,
      role,
      roleLabel: ev.agentType || "subagent",
      title: ev.agentType ? `Subagent: ${ev.agentType}` : "Subagent",
      repoPath: ev.cwd || root,
      repoName: path.basename(ev.cwd || root),
      startedAt: now,
      updatedAt: now,
      recentActivity: { type: "tool", name: "subagent", detail: ev.agentType || "active", at: now },
      history: [{ type: "tool", name: "subagent", detail: ev.agentType || "started", at: now }],
    };
    writeAtomic(subFile, record);
    return { handled: true, action: "subagent_start", file: subFile };
  }

  if (ev.event === "SubagentStop") {
    const subKey = ev.subagentId || `${ev.sessionId}-sub`;
    const subFile = path.join(liveDir, `sub-${hashKey(provider, ev.sessionId, subKey)}.json`);
    safeUnlink(subFile);
    return { handled: true, action: "subagent_stop", file: subFile };
  }

  if (ev.event === "Stop" || ev.event === "SessionEnd") {
    if (ev.event === "Stop" && ev.fullyIdle === false) {
      const prev = readJsonSafe(sessFile);
      if (prev) {
        writeAtomic(sessFile, { ...prev, updatedAt: now, waitingSubagents: true });
        return { handled: true, action: "waiting_subagents", file: sessFile };
      }
      return { handled: true, action: "noop" };
    }
    safeUnlink(sessFile);
    cleanupChildLaunches(liveDir, ev.sessionId);
    return { handled: true, action: "stop", file: sessFile };
  }

  // Upgrade a pending launch stub when the child subagent fires its own session/invocation hook.
  let existing = readJsonSafe(sessFile);
  if (!existing && ev.userInput) {
    const nowMs = Date.parse(now);
    const match = findPendingMatch(liveDir, ev.userInput, Number.isFinite(nowMs) ? nowMs : Date.now());
    if (match) {
      existing = {
        ...match.record,
        sessionId: ev.sessionId,
        pendingLaunch: false,
      };
      safeUnlink(match.file);
    }
  }

  const toolNameLower = ev.tool?.name?.toLowerCase() ?? "";
  const isSubagentTool = Boolean(ev.tool && SUBAGENT_TOOLS.has(toolNameLower));

  if (ev.event === "PreToolUse" && isSubagentTool) {
    const args = ev.tool.args || {};
    const subPrompt = String(args.Prompt ?? args.prompt ?? "");
    const subRoleLabel = String(args.Role ?? args.role ?? args.description ?? args.TypeName ?? args.subagent_type ?? "").trim();
    const subAgentType = String(args.TypeName ?? args.subagent_type ?? args.agent_type ?? "").trim();
    const subRole = inferBaanRole({ prompt: subPrompt, roleLabel: subRoleLabel, agentType: subAgentType });
    const callKey = ev.tool.id || `${ev.sessionId}-${Date.now()}`;
    const subFile = path.join(liveDir, `sub-${hashKey(provider, ev.sessionId, callKey)}.json`);

    writeAtomic(subFile, {
      source: "hook",
      kind: "subagent",
      isSubagent: true,
      pendingLaunch: true,
      subagentCallId: ev.tool.id || null,
      promptSig: subPrompt ? hashKey(oneLine(subPrompt, 120)) : null,
      sessionId: callKey,
      parentSessionId: ev.sessionId,
      provider,
      model: String(args.Model ?? args.model ?? "") || ev.model,
      role: subRole,
      roleLabel: subRoleLabel || subAgentType || "subagent",
      title: oneLine(subRoleLabel || subPrompt || subAgentType || "Subagent", 100),
      repoPath: ev.cwd || root,
      repoName: path.basename(ev.cwd || root),
      startedAt: now,
      updatedAt: now,
      recentActivity: { type: "tool", name: ev.tool.name, detail: ev.tool.detail, at: now },
      history: [{ type: "tool", name: ev.tool.name, detail: ev.tool.detail, at: now }],
    });
  } else if (ev.event === "PostToolUse" && isSubagentTool && ev.tool?.id) {
    const subFile = path.join(liveDir, `sub-${hashKey(provider, ev.sessionId, ev.tool.id)}.json`);
    // Synchronous subagent tools (Claude Agent/Task) finish on PostToolUse; async tools (AGY invoke_subagent)
    // only return a handle unless an immediate error occurred.
    if (ev.error || provider === "claude") safeUnlink(subFile);
  }

  const inferredRole = existing?.role ?? inferBaanRole({ prompt: ev.userInput, agentType: ev.agentType });
  const activity = ev.tool ? {
    type: "tool",
    name: ev.tool.name,
    detail: ev.error ? `ERROR: ${ev.error}` : ev.tool.detail,
    at: now,
  } : existing?.recentActivity ?? null;

  const next = {
    source: "hook",
    kind: existing?.isSubagent ? "subagent" : "live_chat",
    isSubagent: Boolean(existing?.isSubagent),
    parentSessionId: existing?.parentSessionId ?? null,
    sessionId: ev.sessionId,
    provider,
    model: ev.model ?? existing?.model ?? null,
    role: inferredRole,
    roleLabel: existing?.roleLabel ?? (inferredRole || (existing?.isSubagent ? "subagent" : "live chat")),
    title: existing?.title || oneLine(ev.userInput, 100) || (existing?.isSubagent ? "Subagent" : "Live chat session"),
    repoPath: ev.cwd || existing?.repoPath || root,
    repoName: path.basename(ev.cwd || existing?.repoPath || root),
    startedAt: existing?.startedAt ?? now,
    updatedAt: now,
    recentActivity: activity,
    history: ev.tool ? pushHistory(existing?.history, activity) : (existing?.history ?? []),
  };
  writeAtomic(sessFile, next);
  return { handled: true, action: "upsert", file: sessFile };
}

function parseProviderArg(argv) {
  for (const a of argv) {
    if (a.startsWith("--provider=")) return a.slice("--provider=".length).trim().toLowerCase();
  }
  return null;
}

async function readStdin(timeoutMs = 500) {
  return new Promise((resolve) => {
    let raw = "";
    const timer = setTimeout(() => resolve(raw), timeoutMs);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { raw += chunk; });
    process.stdin.on("end", () => { clearTimeout(timer); resolve(raw); });
    process.stdin.on("error", () => { clearTimeout(timer); resolve(raw); });
  });
}

async function main() {
  // Never duplicate BAAN headless runs (session.mjs sets BAAN_READONLY=0/1 and BAAN_HEADLESS=1).
  if (process.env.BAAN_HEADLESS === "1" || process.env.BAAN_READONLY === "0" || process.env.BAAN_READONLY === "1") {
    process.stdout.write("{}\n");
    return;
  }
  const providerHint = parseProviderArg(process.argv.slice(2));
  const raw = await readStdin();
  try {
    const payload = JSON.parse(raw || "{}");
    processHookEvent(payload, { providerHint });
  } catch { /* Fail-open: never block IDE/CLI on malformed telemetry input. */ }
  process.stdout.write("{}\n");
}

const isEntry = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isEntry) {
  main().catch(() => {
    try { process.stdout.write("{}\n"); } catch {}
    process.exit(0);
  });
}
