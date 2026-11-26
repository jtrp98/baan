import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { BaseAdapter } from "./base.mjs";
import { extractJson } from "../plan.mjs";

let cachedVersion = null;
let cachedAgyCommand = null;

export function isOrchestratorModel(model = "") {
  return /^gemini-pro-orchestrator/i.test(String(model ?? "").trim());
}

export function resolveAgyCommand(def) {
  const configured = def?.command || "agy";
  if (configured !== "agy") return configured;
  if (cachedAgyCommand) return cachedAgyCommand;
  if (process.platform === "win32") {
    try {
      execFileSync("where.exe", ["agy"], { stdio: "ignore", windowsHide: true });
      cachedAgyCommand = "agy";
      return cachedAgyCommand;
    } catch {
      const localAgy = path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe");
      if (existsSync(localAgy)) {
        cachedAgyCommand = localAgy;
        return cachedAgyCommand;
      }
    }
  }
  return configured;
}

export class AgyAdapter extends BaseAdapter {
  constructor() {
    super("agy", "Google Antigravity");
  }

  async probe(def, opts = {}) {
    const agyCmd = resolveAgyCommand(def);
    let cliVersion = cachedVersion;
    let available = false;
    if (!cliVersion) {
      try {
        const out = execFileSync(agyCmd, ["--version"], { encoding: "utf8", windowsHide: true });
        cliVersion = out.trim().split(/\r?\n/)[0];
        cachedVersion = cliVersion;
        available = true;
      } catch {
        cliVersion = "unavailable";
      }
    } else {
      available = cliVersion !== "unavailable";
    }

    const homeSettingsPath = path.join(homedir(), ".gemini", "antigravity-cli", "settings.json");
    let entitledModels = null;
    let orchestratorModels = [];
    let baseModels = [];
    let settings = {};
    if (existsSync(homeSettingsPath)) {
      try { settings = JSON.parse(readFileSync(homeSettingsPath, "utf8")); } catch {}
    }

    if (available) {
      try {
        const modelsOut = execFileSync(agyCmd, ["models"], { encoding: "utf8", windowsHide: true });
        entitledModels = modelsOut
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("Available") && !l.startsWith("---") && !l.startsWith("Fetching"))
          .map((l) => l.split(/\t/)[0].trim())
          .filter(Boolean);
        orchestratorModels = entitledModels.filter((m) => isOrchestratorModel(m));
        baseModels = entitledModels.filter((m) => !isOrchestratorModel(m));
      } catch {}
    }

    const cwd = opts.cwd || process.cwd();
    const wsRoot = opts.workspaceRoot || "";
    const checkRoots = [...new Set([cwd, wsRoot].filter(Boolean))];
    const hasInstructions = checkRoots.some((d) => existsSync(path.join(d, "GEMINI.md")) || existsSync(path.join(d, "AGENTS.md")));
    const hooksFile = path.join(homedir(), ".gemini", "config", "hooks.json");
    const hasWorkspaceHooks = checkRoots.some((d) => existsSync(path.join(d, ".agents", "hooks.json")));
    const hasSkills = checkRoots.some((d) => existsSync(path.join(d, ".agents", "skills")));

    return {
      cliVersion,
      available,
      entitledModels,
      supportedReasoningLevels: ["low", "medium", "high", "xhigh", "max"],
      customInstructions: hasInstructions,
      skills: hasSkills || true,
      mcpServers: true,
      hooks: existsSync(hooksFile) || hasWorkspaceHooks,
      subagents: true,
      parentSandbox: {
        detected: false,
        type: "",
        warning: null,
      },
      details: {
        command: agyCmd,
        modelFromConfig: settings.model ?? null,
        orchestratorModels,
        baseModels,
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
      workspaceRoot = "",
      addDirs = [],
      session,
      schemaFile,
      agentProfile = "",
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const deviations = [];
    const args = ["--input-format", "stream-json", "--output-format", "stream-json"];

    if (agentProfile) args.push("--agent", agentProfile);
    if (model) args.push("--model", model);
    // Orchestrator models do not accept a separate --effort flag.
    if (effort && !isOrchestratorModel(model)) args.push("--effort", effort);

    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
    for (const d of allDirs) {
      args.push("--add-dir", d);
    }

    if (isWorker) {
      if (permissionPolicy === "bypass") {
        args.push("--mode", "auto", "--dangerously-skip-permissions");
        deviations.push("permission_policy: bypass active (--mode auto --dangerously-skip-permissions)");
      } else {
        // Native safe default
        args.push("--mode", "accept-edits", "--sandbox");
      }
    } else {
      // Planner and verifier use native plan mode.
      args.push("--mode", "plan", "--sandbox");
      deviations.push(`${role} using native plan mode for read-only isolation`);
    }

    if (session?.id) {
      args.push("--conversation", session.id);
    }

    if (schemaFile) {
      args.push("--json-schema", schemaFile);
    }

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    args.push("--print");

    return {
      command: resolveAgyCommand(def),
      prefix: [],
      args,
      promptVia: "stdin",
      env: {},
      streamFormat: "agy-stream-json",
      answerFrom: "stdout",
      deviations,
      sessionId: session?.id ?? null,
      usesSystemPromptChannel: false,
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
      initialPrompt = "",
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const deviations = [];
    const args = [];

    if (model) args.push("--model", model);
    if (effort && !isOrchestratorModel(model)) args.push("--effort", effort);

    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
    for (const d of allDirs) {
      args.push("--add-dir", d);
    }

    if (isWorker) {
      if (permissionPolicy === "bypass") {
        args.push("--mode", "auto", "--dangerously-skip-permissions");
        deviations.push("interactive permission_policy: bypass active");
      } else {
        args.push("--mode", "accept-edits");
      }
    } else {
      args.push("--mode", "plan", "--sandbox");
      deviations.push(`interactive ${role} using native plan mode`);
    }

    if (isWorker && session?.id) {
      args.push("--conversation", session.id);
    }

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    if (initialPrompt) {
      args.push(initialPrompt);
    }

    return {
      command: resolveAgyCommand(def),
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
        const j = JSON.parse(rawStdout.trim());
        if (typeof j.response === "string") return extractJson(j.response);
        if (j.response && typeof j.response === "object") return j.response;
      } catch {}
      try {
        return extractJson(rawStdout);
      } catch {}
    }
    return null;
  }
}
