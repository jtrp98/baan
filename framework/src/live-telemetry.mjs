import { existsSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";

export const DEFAULT_LIVE_STALE_MS = 10 * 60 * 1000;
export const DEFAULT_LIVE_WARN_MS = 3 * 60 * 1000;

export function scanLiveSessions(workspaceRoot, { staleMs = DEFAULT_LIVE_STALE_MS, warnMs = DEFAULT_LIVE_WARN_MS, now = Date.now() } = {}) {
  const liveDir = path.join(workspaceRoot, ".baan", "live");
  if (!existsSync(liveDir)) return [];

  let entries = [];
  try {
    entries = readdirSync(liveDir);
  } catch {
    return [];
  }

  const sessions = [];
  for (const name of entries) {
    if (!name.endsWith(".json") || (!name.startsWith("sess-") && !name.startsWith("sub-"))) continue;
    const full = path.join(liveDir, name);
    let rec;
    try {
      rec = JSON.parse(readFileSync(full, "utf8"));
    } catch {
      continue;
    }
    if (!rec || typeof rec !== "object" || !rec.sessionId) continue;

    const updated = Date.parse(rec.updatedAt ?? rec.startedAt ?? "");
    const age = Number.isFinite(updated) ? now - updated : 0;
    if (Number.isFinite(updated) && age > staleMs) {
      try { unlinkSync(full); } catch {}
      continue;
    }

    sessions.push({
      ...rec,
      source: "hook",
      stale: Number.isFinite(updated) && age > warnMs,
    });
  }

  return sessions.sort((a, b) => String(a.startedAt ?? "").localeCompare(String(b.startedAt ?? "")) || String(a.sessionId).localeCompare(String(b.sessionId)));
}
