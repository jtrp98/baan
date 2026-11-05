// Inspect summarized errors and the answer tail: raw CLI transcripts may quote task instructions.
const TAIL_CHARS = 1500;
const ENV_PATTERNS = /sandbox|permission|access is denied|read-only|writable|NU1900|NuGet|feed|socket|couldn.t reach|getaddrinfo|ENOTFOUND|no data of the requested type|failed to write file|เขียนไม่ได้|นอกขอบเขตเขียน|ไม่มีสิทธิ์/i;

const BY_STATE = {
  fail: "VERDICT_FAIL",
  needs_design_change: "NEEDS_DESIGN",
  needs_requirement_change: "NEEDS_REQUIREMENT",
  needs_human: "NEEDS_HUMAN",
  blocked: "BLOCKED_OTHER",
  failed: "RUNNER_FAILURE",
};

export const ENVIRONMENT_FAILURE = "ENVIRONMENT_FAILURE";

export function looksLikeEnvironmentFailure(text) {
  return ENV_PATTERNS.test(String(text ?? ""));
}

export function classifyFailure({ state, answer = "", error = "" } = {}) {
  if (!state || state === "completed") return null;
  if (state === "timeout") return "TIMEOUT";
  if (looksLikeEnvironmentFailure(`${error ?? ""}\n${String(answer ?? "").slice(-TAIL_CHARS)}`)) return ENVIRONMENT_FAILURE;
  return BY_STATE[state] ?? "OTHER";
}

// Only recognized provider failures may trigger another paid call.
const LIMIT_ERROR_PATTERNS = ["usage limit", "rate limit", "ratelimit", "quota", "limit reached", "credits balance", "too low to continue"];

export function looksLikeLimitError(r) {
  if (r.ok || r.timedOut) return false;
  const hay = `${r.error ?? ""}\n${r.stderr ?? ""}\n${r.answer ?? ""}`.toLowerCase();
  return LIMIT_ERROR_PATTERNS.some((p) => hay.includes(p));
}

// Answers may describe missing project commands; only process errors identify a missing CLI.
const MISSING_CLI_PATTERNS = [/spawn \S+ enoent/i, /command not found/i, /is not recognized as/i];
export function looksLikeMissingCli(r) {
  if (r.ok || r.timedOut) return false;
  const hay = `${r.error ?? ""}\n${r.stderr ?? ""}`;
  return MISSING_CLI_PATTERNS.some((p) => p.test(hay));
}

// CLI transcripts may quote errors, so require an error-line prefix.
const CAPACITY_ERROR_RE = /^(?:ERROR|AGY_ERROR|API Error|Error):.*\b(?:at capacity|overloaded)\b/im;

export function looksLikeCapacityError(r) {
  if (r.ok || r.timedOut) return false;
  return CAPACITY_ERROR_RE.test(`${r.error ?? ""}\n${r.stderr ?? ""}`);
}

// A late network failure may follow partial edits; only early failures allow fallback.
const STARTUP_ERROR_PATTERNS = [/failed to initialize .*access is denied/i, /couldn.t reach .* settings/i];
const NETWORK_ERROR_RE = /getaddrinfo|ENOTFOUND|no data of the requested type|ECONNREFUSED/i;
export const STARTUP_WINDOW_MS = 60_000;

export function looksLikeStartupError(r) {
  if (r.ok || r.timedOut) return false;
  const hay = `${r.error ?? ""}\n${r.stderr ?? ""}`;
  if (STARTUP_ERROR_PATTERNS.some((p) => p.test(hay))) return true;
  return (r.durationMs ?? Infinity) < STARTUP_WINDOW_MS && NETWORK_ERROR_RE.test(hay);
}
