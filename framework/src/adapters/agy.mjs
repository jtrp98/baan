import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { BaseAdapter } from "./base.mjs";
import { extractJson } from "../plan.mjs";

let cachedVersion = null;

export class AgyAdapter extends BaseAdapter {
  constructor() {
    super("agy", "Google Antigravity");
  }

  async probe(def, opts = {}) {
    let cliVersion = cachedVersion;
    let available = false;
    if (!cliVersion) {
      try {
        const out = execFileSync(def?.command || "agy", ["--version"], { encoding: "utf8", windowsHide: true });
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
    let settings = {};
    if (existsSync(homeSettingsPath)) {
      try { settings = JSON.parse(readFileSync(homeSettingsPath, "utf8")); } catch {}
    }

    if (available) {
      try {
        const modelsOut = execFileSync(def?.command || "agy", ["models"], { encoding: "utf8", windowsHide: true });
        entitledModels = modelsOut
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("Available") && !l.startsWith("---"));
      } catch {}
    }

    const hooksFile = path.join(homedir(), ".gemini", "config", "hooks.json");
    const cwd = opts.cwd || process.cwd();
    const hasInstructions = existsSync(path.join(cwd, "AGENTS.md")) || (opts.workspaceRoot && existsSync(path.join(opts.workspaceRoot, "AGENTS.md")));

    return {
      cliVersion,
      available,
      entitledModels,
      supportedReasoningLevels: ["low", "medium", "high", "xhigh", "max"],
      customInstructions: hasInstructions,
      skills: true,
      mcpServers: true,
      hooks: existsSync(hooksFile),
      subagents: true,
      parentSandbox: {
        detected: false,
        type: "",
        warning: null,
      },
      details: {
        modelFromConfig: settings.model ?? null,
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
      providerArgs = [],
    } = spec;

    const isWorker = role === "worker";
    const deviations = [];
    const args = ["--input-format", "stream-json", "--output-format", "stream-json"];

    if (model) args.push("--model", model);
    if (effort) args.push("--effort", effort);

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
      command: def?.command || "agy",
      prefix: [],
      args,
      promptVia: "stdin",
      env: {},
      streamFormat: "agy-stream-json",
      answerFrom: "stdout",
      deviations,
      sessionId: session?.id ?? null,
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

    const allDirs = [...new Set([workspaceRoot, ...addDirs].filter(Boolean))];
    for (const d of allDirs) {
      args.push("--add-dir", d);
    }

    if (permissionPolicy === "bypass") {
      args.push("--mode", "auto", "--dangerously-skip-permissions");
      deviations.push("interactive permission_policy: bypass active");
    } else {
      args.push("--mode", "accept-edits");
    }

    if (session?.id) {
      args.push("--conversation", session.id);
    }

    if (Array.isArray(providerArgs) && providerArgs.length) {
      args.push(...providerArgs);
    }

    return {
      command: def?.command || "agy",
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
