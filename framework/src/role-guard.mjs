// Workspace instructions also reach role sessions; the stub and prompt must share this override.
const PROVIDER_SUBAGENT_HINT = {
  claude: "Claude Code's `Agent` (`Task`) subagent tool is allowed within your assignment.",
  codex: "Codex's `collaboration.spawn_agent` + `collaboration.wait_agent` subagent tools are allowed within your assignment.",
  agy: "Antigravity's `invoke_subagent` tool is allowed within your assignment.",
};

export const ROLE_SESSION_RULE = "A `[baan: <role>]` line assigns your role instead of the controller in workspace instructions. Plan first. Your CLI's own sub-agent tool (codex: collaboration.spawn_agent + collaboration.wait_agent · Claude Code: Agent/Task · agy: invoke_subagent) is allowed within your assignment. Follow that role's permissions and output schema. Do not invoke BAAN or approve decisions for humans. Answer in Thai; code and identifiers stay in English.";

export function roleMarker(id) {
  return `[baan: ${id}]`;
}

export function roleSessionRuleFor(provider = null) {
  const hint = provider && PROVIDER_SUBAGENT_HINT[provider];
  if (!hint) return ROLE_SESSION_RULE;
  return `A \`[baan: <role>]\` line assigns your role instead of the controller in workspace instructions. Plan first. ${hint} Follow that role's permissions and output schema. Do not invoke BAAN or approve decisions for humans. Answer in Thai; code and identifiers stay in English.`;
}

export function roleSessionHeader(id, provider = null) {
  return `${roleMarker(id)}\n${roleSessionRuleFor(provider)}`;
}
