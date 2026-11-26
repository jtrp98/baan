import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  inferBaanRole, normalizeHookEvent, resolveWorkspaceRoot, processHookEvent,
} from "../setup/hooks/baan-live-telemetry.mjs";
import { scanLiveSessions } from "../src/live-telemetry.mjs";

const FRAMEWORK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOOK_SCRIPT = path.join(FRAMEWORK_DIR, "setup", "hooks", "baan-live-telemetry.mjs");

test("live-telemetry: normalizes Antigravity, Claude Code, and Codex hook payloads", () => {
  const agy = normalizeHookEvent({
    hookEventName: "PreToolUse",
    conversationId: "conv-1",
    workspacePaths: ["C:/src/ws"],
    modelName: "gemini-4-hydrogen",
    toolCall: { id: "t1", name: "invoke_subagent", args: { Role: "spec: collect reqs", Prompt: "Check auth" } },
    cwd: "C:/src/ws/target/app",
  }, { providerHint: "agy" });
  assert.equal(agy.provider, "agy");
  assert.equal(agy.event, "PreToolUse");
  assert.equal(agy.sessionId, "conv-1");
  assert.equal(agy.tool.name, "invoke_subagent");
  assert.equal(agy.model, "gemini-4-hydrogen");

  const claude = normalizeHookEvent({
    hook_event_name: "SubagentStart",
    session_id: "sess-c1",
    cwd: "/ws",
    agent_id: "sub-99",
    agent_type: "survey",
  }, { providerHint: "claude" });
  assert.equal(claude.provider, "claude");
  assert.equal(claude.subagentId, "sub-99");
  assert.equal(claude.agentType, "survey");

  const codex = normalizeHookEvent({
    hook_event_name: "PostToolUse",
    session_id: "sess-x1",
    cwd: "/ws",
    call_id: "call-7",
    tool_name: "apply_patch",
    tool_input: { path: "src/app.mjs" },
  }, { providerHint: "codex" });
  assert.equal(codex.provider, "codex");
  assert.equal(codex.tool.name, "apply_patch");
  assert.equal(codex.tool.detail, "src/app.mjs");
});

test("live-telemetry: infers explicit BAAN roles only, never guesses ambiguous titles", () => {
  assert.equal(inferBaanRole({ prompt: "[baan: spec]\nCollect requirements" }), "spec");
  assert.equal(inferBaanRole({ agentType: "survey" }), "survey");
  assert.equal(inferBaanRole({ roleLabel: "spec: standalone login" }), "spec");
  assert.equal(inferBaanRole({ roleLabel: "arch - API design" }), "arch");
  assert.equal(inferBaanRole({ agentType: "research" }), "research");
  assert.equal(inferBaanRole({ agentType: "browser" }), "browser");
  assert.equal(inferBaanRole({ roleLabel: "Survey current auth flow" }), null);
  assert.equal(inferBaanRole({ roleLabel: "Inventory features by role" }), null);
});

test("live-telemetry: resolveWorkspaceRoot walks up from target/* to workspace baan.config.json", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-root-"));
  try {
    writeFileSync(path.join(ws, "baan.config.json"), "{}", "utf8");
    const deep = path.join(ws, "target", "my-repo", "src");
    mkdirSync(deep, { recursive: true });
    assert.equal(resolveWorkspaceRoot(deep), ws);
    assert.equal(resolveWorkspaceRoot(tmpdir()), null);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("live-telemetry: Antigravity parent + nested subagent upgrade & Stop(fullyIdle) lifecycle", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-agy-"));
  try {
    writeFileSync(path.join(ws, "baan.config.json"), "{}", "utf8");
    const t0 = "2026-11-18T10:00:00.000Z";
    const t1 = "2026-11-18T10:00:05.000Z";
    const t2 = "2026-11-18T10:00:10.000Z";

    processHookEvent({
      hookEventName: "PreInvocation",
      conversationId: "parent-1",
      workspacePaths: [ws],
      modelName: "gemini-4-hydrogen",
      lastUserInput: "เก็บ requirement standalone login",
      cwd: ws,
    }, { providerHint: "agy", now: t0 });

    processHookEvent({
      hookEventName: "PreToolUse",
      conversationId: "parent-1",
      workspacePaths: [ws],
      toolCall: {
        id: "call-sub-1",
        name: "invoke_subagent",
        args: { TypeName: "research", Role: "spec: standalone login", Prompt: "Survey auth flow in target" },
      },
      cwd: ws,
    }, { providerHint: "agy", now: t0 });

    // Async invoke_subagent returns handle immediately; child must stay visible.
    processHookEvent({
      hookEventName: "PostToolUse",
      conversationId: "parent-1",
      workspacePaths: [ws],
      toolCall: { id: "call-sub-1", name: "invoke_subagent", args: {} },
      cwd: ws,
    }, { providerHint: "agy", now: t0 });

    assert.equal(scanLiveSessions(ws, { now: Date.parse(t0) }).length, 2);

    // Child conversation starts with the same prompt -> upgrades pending stub without duplicate card.
    processHookEvent({
      hookEventName: "PreInvocation",
      conversationId: "child-conv-1",
      workspacePaths: [ws],
      lastUserInput: "Survey auth flow in target",
      cwd: path.join(ws, "target", "web"),
    }, { providerHint: "agy", now: t1 });

    // Parent stops turn while background subagent still runs.
    processHookEvent({
      hookEventName: "Stop",
      conversationId: "parent-1",
      workspacePaths: [ws],
      fullyIdle: false,
      cwd: ws,
    }, { providerHint: "agy", now: t1 });

    const mid = scanLiveSessions(ws, { now: Date.parse(t1) });
    assert.equal(mid.length, 2);
    const child = mid.find((s) => s.sessionId === "child-conv-1");
    assert.ok(child);
    assert.equal(child.isSubagent, true);
    assert.equal(child.parentSessionId, "parent-1");
    assert.equal(child.role, "spec");

    processHookEvent({
      hookEventName: "PreToolUse",
      conversationId: "parent-1",
      workspacePaths: [ws],
      toolCall: {
        id: "call-wf-1",
        name: "run_workflow",
        args: { Description: "Parallel lens audit" },
      },
      cwd: ws,
    }, { providerHint: "agy", now: t0 });
    assert.equal(scanLiveSessions(ws, { now: Date.parse(t0) }).some((s) => s.isSubagent && s.title === "Parallel lens audit"), true);

    // Child completes, then parent finishes fullyIdle.
    processHookEvent({ hookEventName: "Stop", conversationId: "child-conv-1", workspacePaths: [ws], fullyIdle: true, cwd: ws }, { providerHint: "agy", now: t2 });
    processHookEvent({ hookEventName: "Stop", conversationId: "parent-1", workspacePaths: [ws], fullyIdle: true, cwd: ws }, { providerHint: "agy", now: t2 });
    assert.deepEqual(scanLiveSessions(ws, { now: Date.parse(t2) }), []);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("live-telemetry: Claude SubagentStart/SubagentStop and Codex spawn_agent lifecycle", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-multi-"));
  try {
    writeFileSync(path.join(ws, "baan.config.json"), "{}", "utf8");
    const t0 = "2026-11-18T10:00:00.000Z";
    processHookEvent({ hook_event_name: "SessionStart", session_id: "c1", cwd: ws }, { providerHint: "claude", now: t0 });
    processHookEvent({ hook_event_name: "SubagentStart", session_id: "c1", agent_id: "a1", agent_type: "arch", cwd: ws }, { providerHint: "claude", now: t0 });
    processHookEvent({ hook_event_name: "SessionStart", session_id: "x1", cwd: ws }, { providerHint: "codex", now: t0 });
    processHookEvent({ hook_event_name: "PreToolUse", session_id: "x1", call_id: "k1", tool_name: "spawn_agent", tool_input: { role: "check: verify tests" }, cwd: ws }, { providerHint: "codex", now: t0 });

    const active = scanLiveSessions(ws, { now: Date.parse(t0) });
    assert.equal(active.length, 4);
    assert.equal(active.find((s) => s.sessionId === "a1")?.role, "arch");
    assert.equal(active.find((s) => s.provider === "codex" && s.isSubagent)?.role, "check");

    processHookEvent({ hook_event_name: "SubagentStop", session_id: "c1", agent_id: "a1", cwd: ws }, { providerHint: "claude", now: t0 });
    processHookEvent({ hook_event_name: "Stop", session_id: "c1", cwd: ws }, { providerHint: "claude", now: t0 });
    processHookEvent({ hook_event_name: "Stop", session_id: "x1", cwd: ws }, { providerHint: "codex", now: t0 });
    assert.deepEqual(scanLiveSessions(ws, { now: Date.parse(t0) }), []);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("live-telemetry: Claude Agent launch + SubagentStart is one record, child tools stay off the parent, background survives PostToolUse", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-claude-agent-"));
  try {
    writeFileSync(path.join(ws, "baan.config.json"), "{}", "utf8");
    const t0 = "2026-11-26T10:00:00.000Z";
    const opts = { providerHint: "claude", now: t0 };
    processHookEvent({ hook_event_name: "UserPromptSubmit", session_id: "p1", cwd: ws, prompt: "[baan: arch]\nออกแบบ API ใหม่" }, opts);
    let live = scanLiveSessions(ws, { now: Date.parse(t0) });
    assert.equal(live.length, 1);
    assert.equal(live[0].role, "arch");
    assert.match(live[0].title, /ออกแบบ API/);

    processHookEvent({
      hook_event_name: "PreToolUse", session_id: "p1", cwd: ws, tool_use_id: "tu1", tool_name: "Agent",
      tool_input: { description: "scan auth module", prompt: "อ่าน src/auth", subagent_type: "scout" },
    }, opts);
    const start = processHookEvent({ hook_event_name: "SubagentStart", session_id: "p1", cwd: ws, agent_id: "ag1", agent_type: "scout" }, opts);
    assert.equal(start.adopted, true);
    live = scanLiveSessions(ws, { now: Date.parse(t0) });
    assert.equal(live.length, 2, "launch stub and SubagentStart must collapse into one child record");
    const child = live.find((s) => s.isSubagent);
    assert.equal(child.sessionId, "ag1");
    assert.equal(child.role, "scout");

    processHookEvent({
      hook_event_name: "PostToolUse", session_id: "p1", cwd: ws, agent_id: "ag1", agent_type: "scout",
      tool_use_id: "tu2", tool_name: "Grep", tool_input: { pattern: "authorize" },
    }, opts);
    live = scanLiveSessions(ws, { now: Date.parse(t0) });
    assert.equal(live.find((s) => s.isSubagent).recentActivity.name, "Grep");
    assert.notEqual(live.find((s) => !s.isSubagent).recentActivity?.name, "Grep", "child tool activity must not overwrite the parent chat");

    // Background launch returns at once; the child must stay live until SubagentStop.
    processHookEvent({
      hook_event_name: "PostToolUse", session_id: "p1", cwd: ws, tool_use_id: "tu1", tool_name: "Agent",
      tool_input: { subagent_type: "scout" }, tool_response: { status: "async_launched", agentId: "ag1" },
    }, opts);
    assert.equal(scanLiveSessions(ws, { now: Date.parse(t0) }).filter((s) => s.isSubagent).length, 1);

    processHookEvent({ hook_event_name: "SubagentStop", session_id: "p1", cwd: ws, agent_id: "ag1", agent_type: "scout" }, opts);
    processHookEvent({ hook_event_name: "SessionEnd", session_id: "p1", cwd: ws }, opts);
    assert.deepEqual(scanLiveSessions(ws, { now: Date.parse(t0) }), []);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("live-telemetry: Claude built-in Explore maps to research; general-purpose adopts an untyped Agent launch", () => {
  assert.equal(inferBaanRole({ agentType: "Explore" }), "research");
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-claude-gp-"));
  try {
    writeFileSync(path.join(ws, "baan.config.json"), "{}", "utf8");
    const opts = { providerHint: "claude", now: "2026-11-26T10:00:00.000Z" };
    processHookEvent({ hook_event_name: "PreToolUse", session_id: "p2", cwd: ws, tool_use_id: "tu9", tool_name: "Agent", tool_input: { description: "check: run tests", prompt: "รันเทสต์" } }, opts);
    const start = processHookEvent({ hook_event_name: "SubagentStart", session_id: "p2", cwd: ws, agent_id: "ag9", agent_type: "general-purpose" }, opts);
    assert.equal(start.adopted, true);
    const kids = scanLiveSessions(ws, { now: Date.parse(opts.now) }).filter((s) => s.isSubagent);
    assert.equal(kids.length, 1);
    assert.equal(kids[0].role, "check");
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("live-telemetry: stale cleanup removes expired sessions and marks warning", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-stale-"));
  try {
    const liveDir = path.join(ws, ".baan", "live");
    mkdirSync(liveDir, { recursive: true });
    writeFileSync(path.join(liveDir, "sess-warn.json"), JSON.stringify({ sessionId: "w", updatedAt: "2026-11-18T10:00:00.000Z" }));
    writeFileSync(path.join(liveDir, "sess-dead.json"), JSON.stringify({ sessionId: "d", updatedAt: "2026-11-18T09:40:00.000Z" }));
    writeFileSync(path.join(liveDir, "sess-bad.json"), "{broken");

    const now = Date.parse("2026-11-18T10:05:00.000Z");
    const res = scanLiveSessions(ws, { now });
    assert.equal(res.length, 1);
    assert.equal(res[0].sessionId, "w");
    assert.equal(res[0].stale, true);
    assert.equal(existsSync(path.join(liveDir, "sess-dead.json")), false);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("live-telemetry CLI: skips headless BAAN calls and fails open on malformed input", () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-live-cli-"));
  try {
    writeFileSync(path.join(ws, "baan.config.json"), "{}", "utf8");
    const payload = JSON.stringify({ hookEventName: "PreInvocation", conversationId: "s1", workspacePaths: [ws], cwd: ws });

    const headless = spawnSync(process.execPath, [HOOK_SCRIPT, "--provider=agy"], {
      input: payload,
      encoding: "utf8",
      env: { ...process.env, BAAN_HEADLESS: "1" },
    });
    assert.equal(headless.status, 0);
    assert.equal(headless.stdout.trim(), "{}");
    assert.equal(existsSync(path.join(ws, ".baan", "live")), false, "headless runs must not create duplicate live files");

    const live = spawnSync(process.execPath, [HOOK_SCRIPT, "--provider=agy"], {
      input: payload,
      encoding: "utf8",
      env: { ...process.env, BAAN_HEADLESS: "", BAAN_READONLY: "" },
    });
    assert.equal(live.status, 0);
    assert.equal(live.stdout.trim(), "{}");
    assert.equal(readdirSync(path.join(ws, ".baan", "live")).length, 1);

    const broken = spawnSync(process.execPath, [HOOK_SCRIPT, "--provider=agy"], { input: "{not-json", encoding: "utf8" });
    assert.equal(broken.status, 0);
    assert.equal(broken.stdout.trim(), "{}");
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});
