import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { BaseAdapter } from "./base.mjs";
import { extractJson } from "../plan.mjs";

let cachedVersion = null;

export class CodexAdapter extends BaseAdapter {
  constructor() {
    super("codex", "Codex CLI");
  }

  async probe(def, opts = {}) {
    let cliVersion = cachedVersion;
    let available = false;
    if (!cliVersion) {
      try {
        let cmd = def?.command || "codex";
        let prefix = [];
        if (process.platform === "win32") {
          try {
            const { nativeCommand } = await import("../session.mjs");
            const resolved = nativeCommand(def || { command: cmd, useShell: true }, "codex");
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

    const codexHome = process.env.CODEX_HOME || path.join(homedir(), ".codex");
    let entitledModels = null;
    let supportedReasoningLevels = ["low", "medium", "high", "xhigh"];

    const modelsCachePath = path.join(codexHome, "models_cache.json");
    if (existsSync(modelsCachePath)) {
      try {
        const cache = JSON.parse(readFileSync(modelsCachePath, "utf8"));
        if (Array.isArray(cache.models)) {
          entitledModels = cache.models.map((m) => m.slug || m.name || m.id).filter(Boolean);
        }
      } catch {}
    }

    const configTomlPath = path.join(codexHome, "config.toml");
    let hasConfigToml = existsSync(configTomlPath);
    let tomlModel = null;
    let tomlEffort = null;
    let tomlSandbox = null;
    if (hasConfigToml) {
      try {
        const text = readFileSync(configTomlPath, "utf8");
        const mModel = text.match(/^\s*model\s*=\s*"([^"]+)"/m);
        if (mModel) tomlModel = mModel[1];
        const mEffort = text.match(/^\s*model_reasoning_effort\s*=\s*"([^"]+)"/m);
        if (mEffort) tomlEffort = mEffort[1];
        const mSandbox = text.match(/^\s*\[windows\][\s\S]*?sandbox\s*=\s*"([^"]+)"/m);
        if (mSandbox) tomlSandbox = mSandbox[1];
      } catch {}
    }

    // Check parent sandbox / environment restrictions
    let parentSandboxDetected = false;
    let parentWarning = null;
    if (process.env.CODEX_SANDBOX || process.env.SANDBOX_MODE || process.env.ORIGINATOR === "Codex Desktop") {
      parentSandboxDetected = true;
      parentWarning = "Parent process is running in a restricted sandbox; Windows loopback and .NET vstest may hang unless escalated.";
    }

    const cwd = opts.cwd || process.cwd();
    const hasAgentsMd = existsSync(path.join(cwd, "AGENTS.md")) || (opts.workspaceRoot && existsSync(path.join(opts.workspaceRoot, "AGENTS.md")));

    return {
      cliVersion,
      available,
      entitledModels,
      supportedReasoningLevels,
      customInstructions: hasAgentsMd,
      skills: existsSync(path.join(codexHome, "skills")) || existsSync(path.join(homedir(), ".agents", "skills")),
      mcpServers: true,
      hooks: existsSync(path.join(codexHome, "hooks.json")),
      subagents: true,
      parentSandbox: {
        detected: parentSandboxDetected,
        type: tomlSandbox || "mxc",
        warning: parentWarning,
      },
      details: {
        modelFromConfig: tomlModel,
        effortFromConfig: tomlEffort,
        sandboxFromConfig: tomlSandbox,
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
      answerFile,
      schemaFile,
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const isResume = isWorker && Boolean(session?.id && session?.started);
    const deviations = [];
    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];

    if (!isResume) {
      const args = ["exec"];

      if (spec.skipGitCheck) {
        args.push("--skip-git-repo-check");
      }

      if (model) args.push("-m", model);
      if (effort) args.push("-c", `model_reasoning_effort=${effort}`);

      if (isWorker) {
        if (permissionPolicy === "bypass") {
          args.push("--dangerously-bypass-approvals-and-sandbox");
          deviations.push("permission_policy: bypass active (--dangerously-bypass-approvals-and-sandbox)");
        } else {
          // Native safe default
          args.push("-s", "workspace-write");
          if (approvalPolicy === "auto-safe") {
            args.push("--approve-for-me");
          }
        }
      } else {
        // Planner and verifier use native read-only sandbox.
        args.push("-s", "read-only");
        deviations.push(`${role} using native read-only sandbox`);
      }

      // Add directories for multi-repo workspace & knowledge
      for (const d of allDirs) {
        args.push("--add-dir", d);
      }

      if (schemaFile) {
        args.push("--output-schema", schemaFile);
      }

      if (answerFile) {
        args.push("-o", answerFile);
      }

      args.push("--json");

      if (Array.isArray(providerArgs) && providerArgs.length) {
        args.push(...providerArgs);
      }

      args.push("-");

      return {
        command: def?.command || "codex",
        prefix: [],
        args,
        promptVia: "stdin",
        env: {},
        streamFormat: "codex-jsonl",
        answerFrom: "answerFile",
        deviations,
        sessionId: session?.id ?? null,
      };
    }

    // Resume branch: codex exec resume [OPTIONS] [SESSION_ID] [PROMPT]
    const args = ["exec", "resume"];

    if (spec.skipGitCheck) {
      args.push("--skip-git-repo-check");
    }

    if (model) args.push("-m", model);
    if (effort) args.push("-c", `model_reasoning_effort=${effort}`);

    if (permissionPolicy === "bypass") {
      args.push("--dangerously-bypass-approvals-and-sandbox");
      deviations.push("permission_policy: bypass active on session resume");
    } else {
      args.push("-c", 'sandbox_mode="workspace-write"');
      if (allDirs.length) {
        // Translate writable roots into config override since resume lacks --add-dir.
        args.push("-c", `writable_roots=${JSON.stringify(allDirs)}`);
      }
    }

    if (schemaFile) {
      args.push("--output-schema", schemaFile);
    }

    if (answerFile) {
      args.push("-o", answerFile);
    }

    args.push("--json");

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    args.push(session.id, "-");

    return {
      command: def?.command || "codex",
      prefix: [],
      args,
      promptVia: "stdin",
      env: {},
      streamFormat: "codex-jsonl",
      answerFrom: "answerFile",
      deviations,
      sessionId: session.id,
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
    const isResume = Boolean(session?.id && session?.started);
    const args = isResume ? ["resume", session.id] : [];

    if (model) args.push("-m", model);
    if (effort) args.push("-c", `model_reasoning_effort=${effort}`);

    if (permissionPolicy === "bypass") {
      args.push("--dangerously-bypass-approvals-and-sandbox");
      deviations.push("interactive permission_policy: bypass active");
    } else if (!isResume) {
      args.push("-s", "workspace-write");
    }

    if (!isResume) {
      const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
      for (const d of allDirs) {
        args.push("--add-dir", d);
      }
    }

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    return {
      command: def?.command || "codex",
      prefix: [],
      args,
      env: {},
      deviations,
      sessionId: session?.id ?? null,
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
        return extractJson(rawStdout);
      } catch {}
    }
    return null;
  }
}
