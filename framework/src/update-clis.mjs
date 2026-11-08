import { execSync, spawnSync } from "node:child_process";

export const SUPPORTED_CLIS = [
  {
    name: "agy",
    label: "Agy",
    checkCmd: "agy --version",
    updateCmd: "agy update",
  },
  {
    name: "claude",
    label: "Claude Code",
    checkCmd: "claude --version",
    updateCmd: "claude update",
  },
  {
    name: "codex",
    label: "Codex CLI",
    checkCmd: "codex --version",
    updateCmd: "codex update",
  },
];

export async function updateClis({ clis = SUPPORTED_CLIS, onLog = console.log } = {}) {
  const results = [];
  onLog("🔄 Checking and updating AI CLIs (agy, claude, codex)...");

  for (const item of clis) {
    onLog(`\n[${item.label}] Checking current version...`);
    let beforeVersion = "unknown";
    try {
      beforeVersion = execSync(item.checkCmd, { shell: true, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
      onLog(`  Current: ${beforeVersion}`);
    } catch (e) {
      onLog(`  ⚠️ Command not found or check failed: ${e.message}`);
      results.push({ name: item.name, label: item.label, ok: false, error: "not_found", beforeVersion: null, afterVersion: null });
      continue;
    }

    onLog(`  Running '${item.updateCmd}'...`);
    let updateOk = false;
    let output = "";
    try {
      const res = spawnSync(item.updateCmd, { shell: true, encoding: "utf8", timeout: 120000 });
      output = ((res.stdout || "") + "\n" + (res.stderr || "")).trim();
      updateOk = res.status === 0;
      if (!updateOk) {
        onLog(`  ⚠️ Update exited with code ${res.status}: ${output}`);
      }
    } catch (e) {
      onLog(`  ⚠️ Update failed: ${e.message}`);
    }

    let afterVersion = beforeVersion;
    try {
      afterVersion = execSync(item.checkCmd, { shell: true, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    } catch {}

    const updated = beforeVersion !== afterVersion;
    if (updated) {
      onLog(`  ✅ Updated: ${beforeVersion} ➜ ${afterVersion}`);
    } else if (updateOk) {
      onLog(`  ✓ Up to date (${afterVersion})`);
    }

    results.push({
      name: item.name,
      label: item.label,
      ok: updateOk,
      updated,
      beforeVersion,
      afterVersion,
      output,
    });
  }

  onLog("\n📊 Summary:");
  for (const r of results) {
    const status = !r.ok ? "❌ FAILED" : r.updated ? "✨ UPDATED" : "✓ OK";
    onLog(`  ${r.label.padEnd(14, " ")}: ${status} (${r.afterVersion || "N/A"})`);
  }

  return { ok: results.every((r) => r.ok), results };
}
