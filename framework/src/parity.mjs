import { getAdapter, listSupportedAdapters } from "./adapters/registry.mjs";
import { loadAgentsConfig, isAgentEnabled, applyLocalAgents } from "./config.mjs";

export const PARITY_STATUS = {
  SUPPORTED: "supported",
  ENABLED: "enabled",
  DISABLED_BY_CONFIG: "disabled_by_config",
  UNSUPPORTED_BY_PROVIDER: "unsupported_by_provider",
  UNSUPPORTED_BY_ADAPTER: "unsupported_by_adapter",
  UNVERIFIED: "unverified",
};

export function evaluateParity({ adapter, probeResult, invocationSpec = {}, mode = "headless", role = "worker" }) {
  const isAvailable = Boolean(probeResult?.available);
  const isBypass = invocationSpec.permissionPolicy === "bypass";
  const matrix = {};

  function assign(dimension, status, reason = "") {
    matrix[dimension] = { status, reason };
  }

  // Model and Reasoning Effort
  if (!isAvailable) {
    assign("model_and_effort", PARITY_STATUS.UNVERIFIED, "CLI probe failed or CLI not installed");
  } else {
    assign("model_and_effort", PARITY_STATUS.SUPPORTED, "Native model and reasoning effort passed without arbitrary limits");
  }

  // Native Tools
  if (!isAvailable) {
    assign("native_tools", PARITY_STATUS.UNVERIFIED, "CLI probe failed");
  } else {
    assign("native_tools", PARITY_STATUS.SUPPORTED, "All native file and shell tools accessible");
  }

  // Skills
  if (!isAvailable) {
    assign("skills", PARITY_STATUS.UNVERIFIED);
  } else if (probeResult.skills) {
    assign("skills", PARITY_STATUS.ENABLED, "Native skills discovered and preserved");
  } else {
    assign("skills", PARITY_STATUS.SUPPORTED, "No workspace skills found");
  }

  // MCP Servers
  if (!isAvailable) {
    assign("mcp", PARITY_STATUS.UNVERIFIED);
  } else if (invocationSpec.strictMcpInReadonly) {
    assign("mcp", PARITY_STATUS.DISABLED_BY_CONFIG, "Strict MCP isolation requested in configuration");
  } else if (probeResult.mcpServers) {
    assign("mcp", PARITY_STATUS.ENABLED, "MCP servers preserved in native harness");
  } else {
    assign("mcp", PARITY_STATUS.SUPPORTED, "No custom MCP servers configured");
  }

  // Hooks
  if (!isAvailable) {
    assign("hooks", PARITY_STATUS.UNVERIFIED);
  } else if (probeResult.hooks) {
    assign("hooks", PARITY_STATUS.ENABLED, "Native hooks preserved");
  } else {
    assign("hooks", PARITY_STATUS.SUPPORTED, "No custom hooks configured");
  }

  // Custom Instructions (CLAUDE.md / AGENTS.md)
  if (!isAvailable) {
    assign("custom_instructions", PARITY_STATUS.UNVERIFIED);
  } else if (probeResult.customInstructions) {
    assign("custom_instructions", PARITY_STATUS.ENABLED, "Custom instructions file loaded natively by harness");
  } else {
    assign("custom_instructions", PARITY_STATUS.SUPPORTED, "No custom instructions file in repository root");
  }

  // Subagents
  if (!isAvailable) {
    assign("subagents", PARITY_STATUS.UNVERIFIED);
  } else if (probeResult.subagents) {
    assign("subagents", PARITY_STATUS.SUPPORTED, "Native subagents supported and preserved across all roles");
  } else {
    assign("subagents", PARITY_STATUS.UNSUPPORTED_BY_PROVIDER);
  }

  // Parallel Subagents
  if (!isAvailable) {
    assign("parallel_subagents", PARITY_STATUS.UNVERIFIED);
  } else if (adapter.id === "codex" || adapter.id === "agy") {
    assign("parallel_subagents", PARITY_STATUS.SUPPORTED, "Parallel subagents supported when triggered by native harness");
  } else {
    assign("parallel_subagents", PARITY_STATUS.SUPPORTED, "Subagent concurrency managed natively");
  }

  // Session Resume
  if (!isAvailable) {
    assign("session_resume", PARITY_STATUS.UNVERIFIED);
  } else if (role !== "worker") {
    assign("session_resume", PARITY_STATUS.DISABLED_BY_CONFIG, "Planner/Verifier runs in fresh session for independent review");
  } else {
    assign("session_resume", PARITY_STATUS.SUPPORTED, "Native session ID tracked and resumed across rework cycles");
  }

  // Permissions and Sandbox
  if (!isAvailable) {
    assign("permissions_and_sandbox", PARITY_STATUS.UNVERIFIED);
  } else if (isBypass) {
    assign("permissions_and_sandbox", PARITY_STATUS.ENABLED, "Workspace opt-in bypass active (safe default overridden explicitly)");
  } else {
    assign("permissions_and_sandbox", PARITY_STATUS.SUPPORTED, "Native sandbox and safe permissions preserved");
  }

  // Native Configuration Preservation
  if (!isAvailable) {
    assign("native_config_preservation", PARITY_STATUS.UNVERIFIED);
  } else {
    assign("native_config_preservation", PARITY_STATUS.SUPPORTED, "User configs (~/.codex, ~/.claude, ~/.gemini) respected by default");
  }

  // Streaming Events
  if (!isAvailable) {
    assign("streaming_events", PARITY_STATUS.UNVERIFIED);
  } else {
    assign("streaming_events", PARITY_STATUS.SUPPORTED, "Streaming NDJSON / JSONL events captured in real-time");
  }

  // Approval Bridge
  if (!isAvailable) {
    assign("approval_bridge", PARITY_STATUS.UNVERIFIED);
  } else if (mode === "interactive") {
    assign("approval_bridge", PARITY_STATUS.DISABLED_BY_CONFIG, "Interactive Mode A uses direct native TTY approval prompts");
  } else if (isBypass) {
    assign("approval_bridge", PARITY_STATUS.DISABLED_BY_CONFIG, "Bypass mode auto-approves actions without bridge prompts");
  } else {
    assign("approval_bridge", PARITY_STATUS.SUPPORTED, "Approval bridge routes escalation requests safely");
  }

  const deviations = [...(invocationSpec.deviations ?? [])];
  if (isBypass) {
    deviations.push("WARNING: permission_policy is set to 'bypass'. Native security sandbox and approval checks are bypassed.");
  }
  if (probeResult?.parentSandbox?.detected) {
    deviations.push(`PARENT SANDBOX DETECTED: ${probeResult.parentSandbox.warning}`);
  }

  return {
    agent: adapter.id,
    label: adapter.label,
    cliVersion: probeResult?.cliVersion ?? "unknown",
    mode,
    role,
    matrix,
    deviations: [...new Set(deviations)],
    parentSandbox: probeResult?.parentSandbox ?? { detected: false, type: "", warning: null },
  };
}

export function formatParityReport(parity) {
  const lines = [
    `=== BAAN Native Harness Parity: ${parity.label} (${parity.agent}) ===`,
    `CLI Version : ${parity.cliVersion}`,
    `Mode        : ${parity.mode}`,
    `Role        : ${parity.role}`,
    "",
    "Dimensions:",
  ];

  for (const [key, val] of Object.entries(parity.matrix)) {
    const pad = key.padEnd(28, " ");
    const reason = val.reason ? ` — ${val.reason}` : "";
    lines.push(`  ${pad}: [${val.status}]${reason}`);
  }

  if (parity.deviations.length) {
    lines.push("");
    lines.push("Deviations / Warnings:");
    for (const d of parity.deviations) {
      lines.push(`  - ${d}`);
    }
  }

  return lines.join("\n");
}

export async function runParityCommand({ agent, cwd = process.cwd(), workspaceRoot = "", json = false, cfg = null, localConfig = null }) {
  const agentsCfg = cfg ?? loadAgentsConfig();
  if (localConfig) applyLocalAgents(agentsCfg, localConfig);
  const agentsToProbe = agent ? [agent] : listSupportedAdapters();
  const results = [];

  for (const a of agentsToProbe) {
    if (localConfig && !isAgentEnabled(a, localConfig)) {
      if (agent) {
        throw new Error(`agent '${a}' ถูกปิดการใช้งานใน local.json (close)`);
      }
      results.push({
        agent: a,
        label: a,
        cliVersion: "disabled (local.json)",
        mode: "headless",
        role: "worker",
        matrix: {
          execution: { status: PARITY_STATUS.DISABLED_BY_CONFIG, reason: "Agent ถูกปิดใช้งานใน local.json (close)" },
        },
        deviations: ["Agent is closed in local.json"],
        parentSandbox: { detected: false, type: "", warning: null },
      });
      continue;
    }
    const adapter = getAdapter(a, agentsCfg);
    const def = agentsCfg.agents?.[a] ?? {};
    const probeResult = await adapter.probe(def, { cwd, workspaceRoot });
    const parity = evaluateParity({ adapter, probeResult, invocationSpec: { permissionPolicy: "native-safe" }, mode: "headless", role: "worker" });
    results.push(parity);
  }

  if (json) return results.length === 1 ? results[0] : results;
  return results.map(formatParityReport).join("\n\n");
}
