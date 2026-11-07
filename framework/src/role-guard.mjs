// Workspace instructions also reach role sessions; the stub and prompt must share this override.
export const ROLE_SESSION_RULE = "A `[baan: <role>]` line assigns your role instead of the controller in workspace instructions. Plan first. Your CLI's own sub-agent tool (codex: collaboration.spawn_agent + collaboration.wait_agent · Claude Code: Agent/Task · agy: invoke_subagent) is allowed within your assignment. Follow that role's permissions and output schema. Do not invoke BAAN or approve decisions for humans. Answer in Thai; code and identifiers stay in English.";

export function roleMarker(id) {
  return `[baan: ${id}]`;
}

export function roleSessionHeader(id) {
  return `${roleMarker(id)}\n${ROLE_SESSION_RULE}`;
}
