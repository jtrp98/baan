import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { BaseAdapter } from "./base.mjs";
import { extractJson } from "../plan.mjs";

let cachedVersion = null;

function listEntries(dir, keep) {
  try {
    return readdirSync(dir, { withFileTypes: true }).filter(keep).map((e) => e.name);
  } catch {
    return [];
  }
}

function settingsHookCommands(file) {
  let hooks;
  try {
    hooks = JSON.parse(readFileSync(file, "utf8"))?.hooks;
  } catch {
    return [];
  }
  if (!hooks || typeof hooks !== "object") return [];
  return Object.values(hooks).flatMap((groups) => (Array.isArray(groups) ? groups : []))
    .flatMap((group) => (Array.isArray(group?.hooks) ? group.hooks : []))
    .map((hook) => String(hook?.command ?? ""));
}

export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super("claude", "Claude Code");
  }

  async probe(def, opts = {}) {
    const cwd = opts.cwd || process.cwd();
    let cliVersion = cachedVersion;
    let available = false;
    if (!cliVersion) {
      try {
        let cmd = def?.command || "claude";
        let prefix = [];
        if (process.platform === "win32") {
          try {
            const { nativeCommand } = await import("../session.mjs");
            const resolved = nativeCommand(def || { command: cmd, useShell: true }, "claude");
            cmd = resolved.def.command;
            prefix = resolved.prefix;
          } catch {}
        }
        let out;
        if (prefix.length) {
          out = execFileSync(cmd, [...prefix, "--version"], { encoding: "utf8", windowsHide: true });
        } else if (process.platform === "win32" && (cmd.endsWith(".cmd") || cmd.endsWith(".bat"))) {
          out = execFileSync("cmd.exe", ["/d", "/s", "/c", cmd, "--version"], { encoding: "utf8", windowsHide: true });
        } else {
          out = execFileSync(cmd, ["--version"], { encoding: "utf8", windowsHide: true });
        }
        cliVersion = out.trim().split(/\r?\n/)[0];
        cachedVersion = cliVersion;
        available = true;
      } catch {
        cliVersion = "unavailable";
      }
    } else {
      available = cliVersion !== "unavailable";
    }

    const homeSettings = path.join(homedir(), ".claude", "settings.json");
    let hasHomeSettings = existsSync(homeSettings);
    let settings = {};
    if (hasHomeSettings) {
      try { settings = JSON.parse(readFileSync(homeSettings, "utf8")); } catch {}
    }

    // Headless runs start inside target/*, while BAAN installs CLAUDE.md/.claude only at the workspace root.
    const roots = [...new Set([cwd, opts.workspaceRoot].filter(Boolean))];
    const hasClaudeMd = roots.some((d) => existsSync(path.join(d, "CLAUDE.md")));
    const hasMcp = roots.some((d) => existsSync(path.join(d, ".mcp.json")));
    const skills = [...new Set(roots.flatMap((d) => listEntries(path.join(d, ".claude", "skills"), (e) => e.isDirectory())))].sort();
    const agents = [...new Set(roots.flatMap((d) => listEntries(path.join(d, ".claude", "agents"), (e) => e.isFile() && e.name.endsWith(".md"))
      .map((name) => name.slice(0, -3))))].sort();
    // Claude Code reads hooks from settings files, not from a `.claude/hooks/` folder.
    const hookCommands = roots.flatMap((d) => ["settings.json", "settings.local.json"]
      .flatMap((f) => settingsHookCommands(path.join(d, ".claude", f))));

    return {
      cliVersion,
      available,
      entitledModels: null,
      supportedReasoningLevels: ["low", "medium", "high", "xhigh", "max"],
      customInstructions: hasClaudeMd,
      skills: skills.length > 0,
      mcpServers: hasMcp || (settings.mcpServers && Object.keys(settings.mcpServers).length > 0),
      hooks: hookCommands.length > 0,
      subagents: true,
      parentSandbox: {
        detected: false,
        type: "",
        warning: null,
      },
      details: {
        modelFromConfig: settings.model ?? null,
        effortFromConfig: settings.effortLevel ?? null,
        baanTelemetryHook: hookCommands.some((c) => c.includes("baan-live-telemetry")),
        agents,
        skills,
      },
    };
  }

  buildHeadless(spec) {
    const {
      def,
      role = "worker",
      model = "",
      effort = "",
      permissionPolicy = "native-safe",
      approvalPolicy = "auto-safe",
      workspaceRoot = "",
      addDirs = [],
      session,
      schema,
      systemPromptFile = "",
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const deviations = [];
    const args = ["-p", "--output-format", "stream-json", "--verbose"];

    // Model and effort (Native Config First: only supply flags when explicitly configured).
    if (model) args.push("--model", model);
    if (effort) args.push("--effort", effort);
    if (systemPromptFile) args.push("--append-system-prompt-file", systemPromptFile);

    // Permission mode
    if (isWorker) {
      if (permissionPolicy === "bypass") {
        args.push("--permission-mode", "bypassPermissions");
        deviations.push("permission_policy: bypass active (bypassPermissions)");
      } else {
        // Native safe default
        args.push("--permission-mode", "acceptEdits");
        if (approvalPolicy === "bridge") {
          args.push("--permission-prompts", "host");
        }
      }
    } else {
      // Planner and Verifier run in native plan mode.
      args.push("--permission-mode", "plan");
      deviations.push(`${role} using native plan mode for read-only isolation`);
      if (spec.strictMcpInReadonly) {
        args.push("--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}');
        deviations.push("strict MCP isolation enforced by configuration");
      }
    }

    // Add directories for multi-repo & knowledge access across read and write modes.
    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
    for (const d of allDirs) {
      args.push("--add-dir", d);
    }

    // Session tracking and persistence
    let sessionId = session?.id;
    if (isWorker) {
      if (!sessionId) sessionId = randomUUID();
      args.push(session?.started ? "--resume" : "--session-id", sessionId);
    } else {
      deviations.push("verifier/planner runs in independent session per verification contract");
    }

    // Output schema
    if (schema) {
      // Claude CLI's validator has no 2020-12 meta-schema and rejects the whole call when "$schema" names it.
      const { $schema, ...accepted } = typeof schema === "string" ? JSON.parse(schema) : schema;
      args.push("--json-schema", JSON.stringify(accepted));
    }

    // Passthrough provider-specific arguments
    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    return {
      command: def?.command || "claude",
      prefix: [],
      args,
      promptVia: "stdin",
      env: {},
      streamFormat: "claude-stream-json",
      answerFrom: "stdout",
      deviations,
      sessionId,
      usesSystemPromptChannel: Boolean(systemPromptFile),
    };
  }

  buildInteractive(spec) {
    const {
      def,
      role = "worker",
      model = "",
      effort = "",
      permissionPolicy = "native-safe",
      workspaceRoot = "",
      addDirs = [],
      session,
      systemPromptFile = "",
      initialPrompt = "",
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const deviations = [];
    const args = [];

    if (model) args.push("--model", model);
    if (effort) args.push("--effort", effort);
    if (systemPromptFile) args.push("--append-system-prompt-file", systemPromptFile);

    if (isWorker) {
      if (permissionPolicy === "bypass") {
        args.push("--permission-mode", "bypassPermissions");
        deviations.push("interactive permission_policy: bypass active");
      } else {
        args.push("--permission-mode", "acceptEdits");
      }
    } else {
      args.push("--permission-mode", "plan");
      deviations.push(`interactive ${role} using native plan mode`);
    }

    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
    for (const d of allDirs) {
      args.push("--add-dir", d);
    }

    let sessionId = session?.id;
    if (isWorker) {
      if (session?.started && sessionId) {
        args.push("--resume", sessionId);
      } else if (sessionId) {
        args.push("--session-id", sessionId);
      }
    }

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    if (initialPrompt) {
      args.push(initialPrompt);
    }

    return {
      command: def?.command || "claude",
      prefix: [],
      args,
      env: {},
      deviations,
      sessionId,
    };
  }

  extractFinalResult(rawStdout, answerFile) {
    if (answerFile && existsSync(answerFile)) {
      try {
        const text = readFileSync(answerFile, "utf8").trim();
        if (text) return extractJson(text);
      } catch {}
    }
    if (typeof rawStdout === "string" && rawStdout.trim()) {
      try {
        const j = JSON.parse(rawStdout.trim());
        if (j.structured_output && typeof j.structured_output === "object") return j.structured_output;
        if (typeof j.result === "string") return extractJson(j.result);
      } catch {}
      try {
        return extractJson(rawStdout);
      } catch {}
    }
    return null;
  }
}
