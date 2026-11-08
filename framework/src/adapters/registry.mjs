import { ClaudeAdapter } from "./claude.mjs";
import { CodexAdapter } from "./codex.mjs";
import { AgyAdapter } from "./agy.mjs";
import { CustomAdapter } from "./custom.mjs";

const NATIVE_ADAPTERS = new Map([
  ["claude", new ClaudeAdapter()],
  ["codex", new CodexAdapter()],
  ["agy", new AgyAdapter()],
]);

export function listSupportedAdapters() {
  return Array.from(NATIVE_ADAPTERS.keys());
}

export function isNativeAdapter(name) {
  return NATIVE_ADAPTERS.has(name);
}

export function getAdapter(name, cfg = null) {
  if (name === "opencode") {
    throw new Error("opencode has been removed from BAAN per Native Harness Preservation Requirements (§2). Please choose 'claude', 'codex', or 'agy'.");
  }

  const native = NATIVE_ADAPTERS.get(name);
  if (native) return native;

  // Custom fixtures declared in custom agents config (e.g. BAAN_AGENTS_FILE in release-check or unit tests)
  if (cfg?.agents && Object.hasOwn(cfg.agents, name)) {
    return new CustomAdapter(name, cfg.agents[name].label || name);
  }

  throw new Error(`unknown agent: ${name}; supported native agents: ${listSupportedAdapters().join(", ")}`);
}
