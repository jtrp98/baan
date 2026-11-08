import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { BaseAdapter } from "./base.mjs";
import { extractJson } from "../plan.mjs";

let cachedVersion = null;

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

    const hasClaudeMd = existsSync(path.join(cwd, "CLAUDE.md")) || (opts.workspaceRoot && existsSync(path.join(opts.workspaceRoot, "CLAUDE.md")));
    const dotClaude = path.join(cwd, ".claude");
    const hasDotClaude = existsSync(dotClaude);
    const hasMcp = existsSync(path.join(cwd, ".mcp.json")) || (opts.workspaceRoot && existsSync(path.join(opts.workspaceRoot, ".mcp.json")));

    return {
      cliVersion,
      available,
      entitledModels: null,
      supportedReasoningLevels: ["low", "medium", "high", "xhigh", "max"],
      customInstructions: hasClaudeMd,
      skills: hasDotClaude && existsSync(path.join(dotClaude, "skills")),
      mcpServers: hasMcp || (settings.mcpServers && Object.keys(settings.mcpServers).length > 0),
      hooks: hasDotClaude && existsSync(path.join(dotClaude, "hooks")),
      subagents: true,
      parentSandbox: {
        detected: false,
        type: "",
        warning: null,
      },
      details: {
        modelFromConfig: settings.model ?? null,
        effortFromConfig: settings.effortLevel ?? null,
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
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const deviations = [];
    const args = ["-p", "--output-format", "stream-json", "--verbose"];

    // Model and effort (Native Config First: only supply flags when explicitly configured).
    if (model) args.push("--model", model);
    if (effort) args.push("--effort", effort);

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
      const schemaStr = typeof schema === "string" ? schema : JSON.stringify(schema);
      args.push("--json-schema", schemaStr);
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
    };
  }

  buildInteractive(spec) {
    const {
      def,
      model = "",
      effort = "",
      permissionPolicy = "native-safe",
      workspaceRoot = "",
      addDirs = [],
      session,
      providerArgs = [],
    } = spec;

    const deviations = [];
    const args = [];

    if (model) args.push("--model", model);
    if (effort) args.push("--effort", effort);

    if (permissionPolicy === "bypass") {
      args.push("--permission-mode", "bypassPermissions");
      deviations.push("interactive permission_policy: bypass active");
    }

    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
    for (const d of allDirs) {
      args.push("--add-dir", d);
    }

    let sessionId = session?.id;
    if (session?.started && sessionId) {
      args.push("--resume", sessionId);
    } else if (sessionId) {
      args.push("--session-id", sessionId);
    }

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
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
