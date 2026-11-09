import { execSync, spawnSync } from "node:child_process";
import { loadLocalConfig, isAgentEnabled, TEAM_DIR } from "./config.mjs";

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

export async function updateClis({ clis = SUPPORTED_CLIS, localConfig = null, onLog = console.log } = {}) {
  const local = localConfig ?? loadLocalConfig(TEAM_DIR);
  const results = [];
  onLog("🔄 Checking and updating AI CLIs (agy, claude, codex)...");

  for (const item of clis) {
    if (!isAgentEnabled(item.name, local)) {
      onLog(`\n[${item.label}] ⏭️ ข้าม: ปิดใช้งานใน local.json (close)`);
      results.push({
        name: item.name,
        label: item.label,
        ok: true,
        skipped: true,
        reason: "disabled_in_local_config",
        beforeVersion: null,
        afterVersion: null,
      });
      continue;
    }

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
    const status = r.skipped ? "⏭️ SKIPPED" : !r.ok ? "❌ FAILED" : r.updated ? "✨ UPDATED" : "✓ OK";
    onLog(`  ${r.label.padEnd(14, " ")}: ${status} (${r.skipped ? "disabled in local.json" : r.afterVersion || "N/A"})`);
  }

  return { ok: results.every((r) => r.ok), results };
}
