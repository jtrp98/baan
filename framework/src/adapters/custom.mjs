import { existsSync, readFileSync } from "node:fs";
import { BaseAdapter } from "./base.mjs";
import { buildArgs } from "../runner.mjs";
import { extractJson } from "../plan.mjs";

// Adapter for custom fixtures specified in BAAN_AGENTS_FILE (e.g. synthetic test runners).
export class CustomAdapter extends BaseAdapter {
  constructor(id, label = "Custom Agent") {
    super(id, label);
  }

  async probe(def, opts = {}) {
    return {
      cliVersion: "custom",
      available: Boolean(def?.command),
      entitledModels: null,
      supportedReasoningLevels: null,
      customInstructions: false,
      skills: false,
      mcpServers: false,
      hooks: false,
      subagents: false,
      parentSandbox: { detected: false, type: "", warning: null },
      details: { custom: true },
    };
  }

  buildHeadless(spec) {
    const { def, model = "", effort = "", role, answerFile, workspaceRoot = "", usage = true, schema } = spec;
    const isWrite = role === "worker";
    let args = buildArgs(def, model, effort, isWrite, answerFile, workspaceRoot, usage);
    return {
      command: def.command,
      prefix: [],
      args,
      promptVia: def.promptVia ?? "stdin",
      env: {},
      streamFormat: def.usage?.format ?? "text",
      answerFrom: def.answerFrom ?? "stdout",
      deviations: ["custom fixture adapter active"],
      sessionId: null,
    };
  }

  buildInteractive(spec) {
    const headless = this.buildHeadless(spec);
    return {
      command: headless.command,
      prefix: headless.prefix,
      args: headless.args,
      env: headless.env,
      deviations: ["custom fixture does not provide native interactive TUI"],
    };
  }

  extractFinalResult(rawStdout, answerFile) {
    if (answerFile && existsSync(answerFile)) {
      try { return extractJson(readFileSync(answerFile, "utf8").trim()); } catch { /* fallback to stdout */ }
    }
    if (typeof rawStdout === "string" && rawStdout.trim()) {
      try { return extractJson(rawStdout); } catch {}
    }
    return null;
  }
}
