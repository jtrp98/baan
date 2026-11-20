import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { TEAM_DIR } from "./config.mjs";
import { roleSessionHeader } from "./role-guard.mjs";

const NATIVE_PROVIDERS = new Set(["claude", "codex", "agy"]);

export function resolveModelFamily(provider, model = "") {
  const m = String(model ?? "").trim().toLowerCase();
  if (!m) return null;
  if (provider === "claude") {
    if (m.includes("opus")) return "opus";
    if (m.includes("sonnet")) return "sonnet";
    if (m.includes("haiku")) return "haiku";
  } else if (provider === "codex") {
    if (m.includes("astra")) return "gpt-6.2-astra";
    if (m.includes("sol")) return "gpt-6.2-sol";
    if (m.includes("terra")) return "gpt-6.1-terra";
  } else if (provider === "agy") {
    if (m.includes("neon")) return "gemini-4-neon";
    if (m.includes("hydrogen")) return "gemini-4-hydrogen";
    if (m.includes("flash")) return "gemini-3.8-flash";
  }
  return m;
}

export function loadModelGuidance(provider, model = "", teamDir = TEAM_DIR) {
  if (!NATIVE_PROVIDERS.has(provider)) return { family: null, label: model || "", guidance: "" };
  const file = path.join(teamDir, "prompts", provider, "models.json");
  if (!existsSync(file)) return { family: null, label: model || "", guidance: "" };
  try {
    const map = JSON.parse(readFileSync(file, "utf8"));
    const family = resolveModelFamily(provider, model);
    const entry = (family && map[family]) || (model && map[model]) || null;
    if (!entry) return { family, label: model || "", guidance: "" };
    return { family, label: entry.label ?? family, guidance: entry.guidance ?? "" };
  } catch {
    return { family: null, label: model || "", guidance: "" };
  }
}

export function compileExecutionPrompt({
  provider,
  role,
  model = "",
  effort = "",
  tier = "",
  tierLabel = "",
  packet = {},
  schema = null,
  nativeSchema = true,
  teamDir = TEAM_DIR,
} = {}) {
  const corePath = path.join(teamDir, "prompts", "_core", `${role}.md`);
  if (!existsSync(corePath)) {
    throw new Error(`missing core execution contract: ${corePath}`);
  }
  const coreContract = readFileSync(corePath, "utf8").trim();
  const isNative = NATIVE_PROVIDERS.has(provider);
  const effectiveProvider = isNative ? provider : "codex";
  const providerPath = path.join(teamDir, "prompts", effectiveProvider, `${role}.md`);
  if (!existsSync(providerPath)) {
    throw new Error(`missing provider execution prompt: ${providerPath}`);
  }
  const template = readFileSync(providerPath, "utf8").trim();
  const modelInfo = loadModelGuidance(effectiveProvider, model, teamDir);
  const modelLine = modelInfo.guidance
    ? `${modelInfo.label || model}${effort ? ` (effort: ${effort})` : ""}${tier ? ` · ${tier}${tierLabel ? ` — ${tierLabel}` : ""}` : ""}: ${modelInfo.guidance}`
    : `${model || "default"}${effort ? ` (effort: ${effort})` : ""}${tier ? ` · ${tier}` : ""}`;

  const body = template
    .replaceAll("{{CORE_CONTRACT}}", coreContract)
    .replaceAll("{{MODEL_GUIDANCE}}", modelLine);

  const header = roleSessionHeader(role, isNative ? provider : null);
  const systemPrompt = `${header}\n\n${body}`;
  const outputContract = nativeSchema
    ? "Return JSON only matching the supplied output schema."
    : `Return JSON only matching:\n${JSON.stringify(schema)}`;

  let userPrompt;
  if (effectiveProvider === "claude") {
    userPrompt = `<context>\n${JSON.stringify(packet)}\n</context>\n\n<output_requirements>\n${outputContract}\n</output_requirements>`;
  } else if (effectiveProvider === "codex") {
    userPrompt = `## Input Data (JSON)\n${JSON.stringify(packet)}\n\n## Output Requirement\n${outputContract}`;
  } else {
    userPrompt = `## INPUT (data)\n${JSON.stringify(packet)}\n\n## OUTPUT CONTRACT\n${outputContract}`;
  }

  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  return {
    systemPrompt,
    userPrompt,
    combinedPrompt,
    metadata: {
      provider: effectiveProvider,
      role,
      modelFamily: modelInfo.family,
      corePath,
      providerPath,
    },
  };
}

export function compileInteractiveBrief({
  provider = "codex",
  role = "worker",
  model = "",
  effort = "",
  tier = "",
  tierLabel = "",
  packet = {},
  answerFile = "",
  teamDir = TEAM_DIR,
} = {}) {
  const corePath = path.join(teamDir, "prompts", "_core", `${role}.md`);
  const coreContract = existsSync(corePath) ? readFileSync(corePath, "utf8").trim() : "";
  const modelInfo = loadModelGuidance(NATIVE_PROVIDERS.has(provider) ? provider : "codex", model, teamDir);

  const lines = [
    `# BAAN Interactive Brief — ${packet.id || "WP"} (${role.toUpperCase()})`,
    `- **Provider / Model**: \`${provider}\` / \`${model || "default"}\`${effort ? ` (effort: \`${effort}\`)` : ""}${tier ? ` · \`${tier}\`${tierLabel ? ` (${tierLabel})` : ""}` : ""}`,
  ];
  if (modelInfo.guidance) lines.push(`- **Model Guidance**: ${modelInfo.guidance}`);
  if (packet.repo?.path) lines.push(`- **Repo**: \`${packet.repo.path}\``);
  if (packet.goal) lines.push("", "## Goal", packet.goal);
  if (Array.isArray(packet.owns) && packet.owns.length) {
    lines.push("", `## Owns (${packet.owns.length})`, ...packet.owns.map((o) => `- \`${o}\``));
  }
  if (Array.isArray(packet.read_first) && packet.read_first.length) {
    lines.push("", "## Read First", ...packet.read_first.map((r) => `- \`${r.path}\`${r.pin ? " *(pinned)*" : ""}`));
  }
  if (Array.isArray(packet.contracts) && packet.contracts.length) {
    lines.push("", "## Contracts", ...packet.contracts.map((c) => `- \`${c.ref}\``));
  }
  if (Array.isArray(packet.acceptance) && packet.acceptance.length) {
    lines.push("", "## Acceptance Criteria", ...packet.acceptance.map((a) => `- **${a.id}**: ${a.text} *(source: \`${a.source}\`)*`));
  }
  if (packet.commands) {
    lines.push("", "## Verification Commands");
    for (const k of ["setup", "build", "test_targeted", "test_full"]) {
      if (packet.commands[k]) lines.push(`- **${k}**: \`${packet.commands[k]}\``);
    }
  }
  if (packet.gate && !packet.gate.ok) {
    lines.push("", "## Previous Gate Failure", `- **Failure Class**: \`${packet.gate.failureClass}\``);
    if (packet.gate.outside?.length) lines.push(`- **Outside Owns**: ${packet.gate.outside.map((f) => `\`${f}\``).join(", ")}`);
    if (packet.gate.unmapped?.length) lines.push(`- **Unmapped AC**: ${packet.gate.unmapped.join(", ")}`);
    for (const r of packet.gate.results ?? []) {
      if (!r.ok) lines.push(`- **Failed Command**: \`${r.command}\` → log: \`${r.output_file}\``);
    }
  }
  if (packet.verdict && packet.verdict.verdict !== "PASS") {
    lines.push("", "## Previous Verifier Findings");
    for (const f of packet.verdict.findings ?? []) {
      lines.push(`- ${typeof f === "string" ? f : JSON.stringify(f)}`);
    }
  }
  if (role === "verifier" || role === "planner") {
    lines.push("", "## Read-Only Evidence",
      ...(packet.evidence?.diff_file ? [`- **diff_file**: \`${packet.evidence.diff_file}\``] : []),
      ...(packet.evidence?.snapshots_file ? [`- **snapshots_file**: \`${packet.evidence.snapshots_file}\``] : []),
      ...(packet.evidence?.evidence_file ? [`- **evidence_file**: \`${packet.evidence.evidence_file}\``] : []),
      ...(packet.lenses?.length ? [`- **lenses**: ${packet.lenses.join(", ")}`] : []),
    );
  }
  if (answerFile) {
    lines.push(
      "",
      "## Output File (Optional for Interactive Exit)",
      `When finished, write valid JSON matching the \`${role}.result\` schema to \`${answerFile}\`, then run \`/exit\` so BAAN Core can immediately evaluate the Machine Gate / next step.`
    );
  }
  if (coreContract) {
    lines.push("", "## Core Contract", coreContract);
  }
  return lines.join("\n") + "\n";
}
