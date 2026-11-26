import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { getAdapter, listSupportedAdapters, isNativeAdapter } from "../src/adapters/registry.mjs";
import { ClaudeAdapter } from "../src/adapters/claude.mjs";
import { CodexAdapter } from "../src/adapters/codex.mjs";
import { AgyAdapter } from "../src/adapters/agy.mjs";
import { evaluateParity, PARITY_STATUS } from "../src/parity.mjs";
import { validateTimeout } from "../src/timeout.mjs";
import { createStreamParser } from "../src/events.mjs";
import { evaluateApprovalRequest, createApprovalBridge } from "../src/approval-bridge.mjs";

test("registry: registers exactly 3 native adapters and rejects opencode", () => {
  const supported = listSupportedAdapters();
  assert.deepEqual(supported.sort(), ["agy", "claude", "codex"]);
  assert.ok(isNativeAdapter("claude"));
  assert.ok(isNativeAdapter("codex"));
  assert.ok(isNativeAdapter("agy"));
  assert.ok(!isNativeAdapter("opencode"));

  assert.throws(() => getAdapter("opencode"), /opencode has been removed from BAAN/);
  assert.ok(getAdapter("claude") instanceof ClaudeAdapter);
  assert.ok(getAdapter("codex") instanceof CodexAdapter);
  assert.ok(getAdapter("agy") instanceof AgyAdapter);
});

test("registry: supports custom test fixture when declared in agents config", () => {
  const cfg = { agents: { my_test_fixture: { label: "Test Fixture", command: "node" } } };
  const adapter = getAdapter("my_test_fixture", cfg);
  assert.equal(adapter.id, "my_test_fixture");
  assert.equal(adapter.label, "Test Fixture");
});

test("claude adapter: safe defaults vs opt-in bypass", () => {
  const adapter = new ClaudeAdapter();

  // Safe default
  const safe = adapter.buildHeadless({
    def: { command: "claude" },
    role: "worker",
    permissionPolicy: "native-safe",
    addDirs: ["C:/src/schoolbright/knowledge", "C:/src/schoolbright/memory"],
  });
  assert.ok(safe.args.includes("--permission-mode"));
  assert.equal(safe.args[safe.args.indexOf("--permission-mode") + 1], "acceptEdits");
  assert.ok(!safe.args.includes("bypassPermissions"));
  assert.ok(safe.args.includes("--add-dir"));
  assert.ok(safe.args.includes("C:/src/schoolbright/knowledge"));

  // Opt-in bypass
  const bypass = adapter.buildHeadless({
    def: { command: "claude" },
    role: "worker",
    permissionPolicy: "bypass",
  });
  assert.equal(bypass.args[bypass.args.indexOf("--permission-mode") + 1], "bypassPermissions");
  assert.ok(bypass.deviations.some((d) => d.includes("bypass active")));

  // Read-only role (verifier) uses plan mode and native --append-system-prompt-file when provided
  const readOnly = adapter.buildHeadless({
    def: { command: "claude" },
    role: "verifier",
    systemPromptFile: "C:/ws/.baan/runs/r1/WP-1-verifier.system.md",
  });
  assert.equal(readOnly.args[readOnly.args.indexOf("--permission-mode") + 1], "plan");
  assert.equal(readOnly.args[readOnly.args.indexOf("--append-system-prompt-file") + 1], "C:/ws/.baan/runs/r1/WP-1-verifier.system.md");
  assert.equal(readOnly.usesSystemPromptChannel, true);
  assert.ok(!readOnly.args.includes("--strict-mcp-config"));
});

test("claude adapter: probe reads hooks from .claude/settings.json and workspace-root skills/agents", async () => {
  const ws = mkdtempSync(path.join(tmpdir(), "baan-claude-probe-"));
  try {
    const target = path.join(ws, "target", "app");
    mkdirSync(path.join(target, ".claude", "hooks"), { recursive: true });
    const def = { command: "nonexistent-claude-binary-xyz" };
    const adapter = new ClaudeAdapter();

    const bare = await adapter.probe(def, { cwd: target });
    assert.equal(bare.hooks, false, "a .claude/hooks/ folder is not where Claude Code reads hooks");
    assert.equal(bare.skills, false);
    assert.equal(bare.customInstructions, false);

    mkdirSync(path.join(ws, ".claude", "skills", "bug-fix"), { recursive: true });
    mkdirSync(path.join(ws, ".claude", "agents"), { recursive: true });
    writeFileSync(path.join(ws, ".claude", "agents", "scout.md"), "---\nname: scout\n---\n", "utf8");
    writeFileSync(path.join(ws, "CLAUDE.md"), "# ws\n", "utf8");
    writeFileSync(path.join(ws, ".claude", "settings.json"), JSON.stringify({
      hooks: { Stop: [{ matcher: ".*", hooks: [{ type: "command", command: "node .baan/hooks/baan-live-telemetry.mjs claude" }] }] },
    }), "utf8");

    const res = await adapter.probe(def, { cwd: target, workspaceRoot: ws });
    assert.equal(res.hooks, true);
    assert.equal(res.details.baanTelemetryHook, true);
    assert.equal(res.skills, true);
    assert.equal(res.customInstructions, true);
    assert.deepEqual(res.details.skills, ["bug-fix"]);
    assert.deepEqual(res.details.agents, ["scout"]);
  } finally {
    rmSync(ws, { recursive: true, force: true });
  }
});

test("codex adapter: safe defaults vs opt-in bypass and resume grammar", () => {
  const adapter = new CodexAdapter();

  // Safe default
  const safe = adapter.buildHeadless({
    def: { command: "codex" },
    role: "worker",
    permissionPolicy: "native-safe",
    addDirs: ["C:/src/knowledge"],
    answerFile: "answer.txt",
    schemaFile: "schema.json",
  });
  assert.ok(safe.args.includes("-s"));
  assert.equal(safe.args[safe.args.indexOf("-s") + 1], "workspace-write");
  assert.ok(!safe.args.includes("--approve-for-me"), "codex exec rejects --approve-for-me combined with -s");
  assert.ok(!safe.args.includes("--dangerously-bypass-approvals-and-sandbox"));
  assert.ok(safe.args.includes("--add-dir"));
  assert.ok(safe.args.includes("C:/src/knowledge"));

  // Opt-in bypass
  const bypass = adapter.buildHeadless({
    def: { command: "codex" },
    role: "worker",
    permissionPolicy: "bypass",
  });
  assert.ok(bypass.args.includes("--dangerously-bypass-approvals-and-sandbox"));
  assert.ok(!bypass.args.includes("-s"));
  assert.ok(bypass.deviations.some((d) => d.includes("bypass active")));

  // Resume grammar: codex exec resume has no -s and no --add-dir
  const resumeSafe = adapter.buildHeadless({
    def: { command: "codex" },
    role: "worker",
    permissionPolicy: "native-safe",
    session: { id: "01a1aefd-9adb-7480-a326-9ea15566bd9e", started: true },
    addDirs: ["C:/src/knowledge"],
  });
  assert.equal(resumeSafe.args[0], "exec");
  assert.equal(resumeSafe.args[1], "resume");
  assert.ok(!resumeSafe.args.includes("-s"), "resume cannot have -s flag");
  assert.ok(!resumeSafe.args.includes("--add-dir"), "resume cannot have --add-dir flag");
  assert.ok(resumeSafe.args.includes("-c"));
  assert.ok(resumeSafe.args.includes('sandbox_mode="workspace-write"'));
  assert.ok(resumeSafe.args.includes("01a1aefd-9adb-7480-a326-9ea15566bd9e"));

  // Verifier read-only with native developer_instructions channel + 4KB Windows guard
  const verifier = adapter.buildHeadless({
    def: { command: "codex" },
    role: "verifier",
    developerInstructions: "# BAAN Verifier\nRead-only.",
  });
  assert.equal(verifier.args[verifier.args.indexOf("-s") + 1], "read-only");
  assert.equal(verifier.usesSystemPromptChannel, true);
  assert.ok(verifier.args.some((a) => a.startsWith("developer_instructions=")));

  const oversized = adapter.buildHeadless({
    def: { command: "codex" },
    role: "worker",
    developerInstructions: "x".repeat(5000),
  });
  assert.equal(oversized.usesSystemPromptChannel, false);
  assert.ok(oversized.deviations.some((d) => d.includes("4KB")));
});

test("agy adapter: safe defaults vs opt-in bypass and subagent support", () => {
  const adapter = new AgyAdapter();

  // Safe default
  const safe = adapter.buildHeadless({
    def: { command: "agy" },
    role: "worker",
    permissionPolicy: "native-safe",
    addDirs: ["C:/src/schoolbright"],
  });
  assert.ok(safe.args.includes("--mode"));
  assert.equal(safe.args[safe.args.indexOf("--mode") + 1], "accept-edits");
  assert.ok(safe.args.includes("--sandbox"));
  assert.ok(!safe.args.includes("--dangerously-skip-permissions"));
  assert.ok(safe.args.includes("--add-dir"));

  // Opt-in bypass (per decision A2: --mode auto --dangerously-skip-permissions)
  const bypass = adapter.buildHeadless({
    def: { command: "agy" },
    role: "worker",
    permissionPolicy: "bypass",
  });
  assert.equal(bypass.args[bypass.args.indexOf("--mode") + 1], "auto");
  assert.ok(bypass.args.includes("--dangerously-skip-permissions"));
  assert.ok(bypass.deviations.some((d) => d.includes("bypass active")));

  // Read-only verifier uses plan mode
  const readOnly = adapter.buildHeadless({
    def: { command: "agy" },
    role: "verifier",
  });
  assert.equal(readOnly.args[readOnly.args.indexOf("--mode") + 1], "plan");
  assert.ok(readOnly.args.includes("--sandbox"));
});

test("parity evaluation: reports 6 statuses and detects parent sandbox warnings", () => {
  const adapter = new CodexAdapter();
  const probeResult = {
    cliVersion: "codex-cli 0.166.0",
    available: true,
    skills: true,
    mcpServers: true,
    hooks: true,
    customInstructions: true,
    subagents: true,
    parentSandbox: {
      detected: true,
      type: "windows_mxc",
      warning: "Sandbox detected in parent environment",
    },
  };

  const parity = evaluateParity({
    adapter,
    probeResult,
    invocationSpec: { permissionPolicy: "bypass", deviations: ["test deviation"] },
    mode: "headless",
    role: "worker",
  });

  assert.equal(parity.agent, "codex");
  assert.equal(parity.matrix.native_tools.status, PARITY_STATUS.SUPPORTED);
  assert.equal(parity.matrix.skills.status, PARITY_STATUS.ENABLED);
  assert.equal(parity.matrix.permissions_and_sandbox.status, PARITY_STATUS.ENABLED);
  assert.ok(parity.deviations.some((d) => d.includes("bypass")));
  assert.ok(parity.deviations.some((d) => d.includes("PARENT SANDBOX DETECTED")));
});

test("timeout validator: accepts 0 as unlimited with allowZero option", () => {
  assert.equal(validateTimeout(0, "--timeout", true), 0);
  assert.equal(validateTimeout(1800), 1800);
  assert.throws(() => validateTimeout(0), /ต้องเป็นจำนวนเต็ม 1–86400 วินาที/);
  assert.throws(() => validateTimeout(-1), /ต้องเป็นจำนวนเต็ม/);
  assert.throws(() => validateTimeout(999999), /ต้องเป็นจำนวนเต็ม/);
});

test("stream parser: correctly extracts sessionId and usage across formats", () => {
  // Codex
  const codexParser = createStreamParser("codex-jsonl");
  codexParser.feed('{"type":"thread.started","thread_id":"thread-123"}\n');
  codexParser.feed('{"type":"turn.completed","usage":{"input_tokens":100,"output_tokens":50}}\n');
  const codexState = codexParser.flush();
  assert.equal(codexState.sessionId, "thread-123");
  assert.equal(codexState.usage.inputTokens, 100);
  assert.equal(codexState.usage.outputTokens, 50);

  // Claude
  const claudeParser = createStreamParser("claude-stream-json");
  claudeParser.feed('{"type":"result","session_id":"claude-session-456","structured_output":{"state":"DONE"},"usage":{"input_tokens":200,"output_tokens":30}}\n');
  const claudeState = claudeParser.flush();
  assert.equal(claudeState.sessionId, "claude-session-456");
  assert.deepEqual(claudeState.answer, { state: "DONE" });
});

test("approval bridge: distinguishes safe read/write from escalations", () => {
  const packet = {
    repo: { path: "C:/src/project" },
    owns: ["src/**", "tests/**"],
    commands: { test_targeted: "npm test" },
  };
  const bridge = createApprovalBridge("auto-safe", packet, ["C:/src/project", "C:/src/knowledge"]);

  // Safe read within allowed boundaries
  assert.equal(evaluateApprovalRequest({ type: "read", path: "C:/src/knowledge/spec.md" }, packet, ["C:/src/knowledge"]).decision, "allow");

  // Safe write within owns
  assert.equal(evaluateApprovalRequest({ type: "write", path: "C:/src/project/src/index.js" }, packet, ["C:/src/project"]).decision, "allow");

  // Write outside owns requires escalation
  assert.equal(evaluateApprovalRequest({ type: "write", path: "C:/src/project/package.json" }, packet, ["C:/src/project"]).decision, "escalate");

  // Whitelisted command
  assert.equal(evaluateApprovalRequest({ type: "command", command: "npm test" }, packet, []).decision, "allow");

  // Non-whitelisted command requires escalation
  assert.equal(evaluateApprovalRequest({ type: "command", command: "rm -rf /" }, packet, []).decision, "escalate");
});

test("interactive builders: role isolation (read-only/plan for verifier) and initialPrompt placement", () => {
  const codex = new CodexAdapter();
  const cWorker = codex.buildInteractive({ def: { command: "codex" }, role: "worker", model: "gpt-6.2-sol", effort: "medium", initialPrompt: "Do brief" });
  assert.equal(cWorker.args[cWorker.args.indexOf("-s") + 1], "workspace-write");
  assert.equal(cWorker.args.at(-1), "Do brief");

  const cVerifier = codex.buildInteractive({ def: { command: "codex" }, role: "verifier", initialPrompt: "Audit brief" });
  assert.equal(cVerifier.args[cVerifier.args.indexOf("-s") + 1], "read-only");
  assert.equal(cVerifier.args.at(-1), "Audit brief");

  const claude = new ClaudeAdapter();
  const kVerifier = claude.buildInteractive({ def: { command: "claude" }, role: "verifier", systemPromptFile: "sys.md", initialPrompt: "Audit" });
  assert.equal(kVerifier.args[kVerifier.args.indexOf("--permission-mode") + 1], "plan");
  assert.equal(kVerifier.args[kVerifier.args.indexOf("--append-system-prompt-file") + 1], "sys.md");
  assert.equal(kVerifier.args.at(-1), "Audit");

  const agy = new AgyAdapter();
  const aVerifier = agy.buildInteractive({ def: { command: "agy" }, role: "verifier", initialPrompt: "Audit" });
  assert.equal(aVerifier.args[aVerifier.args.indexOf("--mode") + 1], "plan");
  assert.ok(aVerifier.args.includes("--sandbox"));
  assert.equal(aVerifier.args.at(-1), "Audit");
});
