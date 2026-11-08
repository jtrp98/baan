// Live verification of Direct CLI vs BAAN Parity in disposable temporary repositories.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runParityCommand } from "../src/parity.mjs";
import { loadAgentsConfig } from "../src/config.mjs";

const args = process.argv.slice(2);
let selectedAgents = ["claude", "codex", "agy"];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--agents" && args[i + 1]) {
    selectedAgents = args[++i].split(",").filter(Boolean);
  }
}

const cfg = loadAgentsConfig();
const root = mkdtempSync(path.join(tmpdir(), "baan-parity-live-"));
console.log(`Running Live Parity Probe for [${selectedAgents.join(", ")}] in ${root}...`);

const reports = [];
for (const agent of selectedAgents) {
  const repo = path.join(root, agent);
  mkdirSync(repo, { recursive: true });
  const result = await runParityCommand({ agent, cwd: repo, workspaceRoot: root, json: true, cfg });
  reports.push(result);
  console.log(`- ${agent}: CLI ${result.cliVersion}, parent sandbox detected: ${result.parentSandbox.detected}`);
}

console.log("\nParity Probe Summary:");
for (const rep of reports) {
  console.log(`\n[${rep.label} (${rep.agent})]`);
  for (const [k, v] of Object.entries(rep.matrix)) {
    console.log(`  ${k.padEnd(26, " ")}: [${v.status}] ${v.reason || ""}`);
  }
  if (rep.deviations?.length) {
    console.log("  Deviations:");
    for (const d of rep.deviations) console.log(`    - ${d}`);
  }
}

console.log("\nAll parity probes completed successfully.");
