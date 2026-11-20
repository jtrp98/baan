import { existsSync, mkdirSync, readFileSync, readdirSync, appendFileSync, writeFileSync, renameSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { validatePacket, checkDag } from "./packet.mjs";
import { validateTimeout } from "./timeout.mjs";
import { snapshotRef } from "./snapshot.mjs";

export const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
export function writeAtomic(file, data) {
  const tmp = `${file}.tmp-${randomUUID()}`;
  writeFileSync(tmp, data, "utf8");
  renameSync(tmp, file);
}
export function save(file, data) { mkdirSync(path.dirname(file), { recursive: true }); writeAtomic(file, JSON.stringify(data, null, 2)); }
export function event(run, type, data = {}) {
  appendFileSync(path.join(run.dir, "ledger.jsonl"), JSON.stringify({ at: new Date().toISOString(), type, ...data }) + "\n");
}
// Earlier attempts keep their recovery points by reference; the full file maps are in the gate's snapshots_file.
export const previousAttempt = (p) => ({ before: snapshotRef(p.before), after: snapshotRef(p.after), snapshots_file: p.gate?.snapshots_file, gate: p.gate, verdict: p.verdict });
// packets/ is a readable copy for people; repeating every snapshot's file map there doubled each persist.
const packetView = (p) => ({ ...p, before: snapshotRef(p.before), after: snapshotRef(p.after) });

export function summarizeRunUsage(runDir) {
  const ledgerPath = path.join(runDir, "ledger.jsonl");
  const totals = { calls: 0, interactiveCalls: 0, failedCalls: 0, commands: 0, inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, byPackage: {} };
  if (!existsSync(ledgerPath)) return totals;
  try {
    const lines = readFileSync(ledgerPath, "utf8").split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      let ev;
      try { ev = JSON.parse(line); } catch { continue; }
      if (ev.type !== "call_end") continue;
      totals.calls++;
      if (ev.interactive) totals.interactiveCalls++;
      if (ev.ok === false) totals.failedCalls++;
      const pkg = ev.package || "unknown";
      const cur = (totals.byPackage[pkg] ??= { calls: 0, commands: 0, inputTokens: 0, cacheReadTokens: 0, outputTokens: 0, models: [] });
      cur.calls++;
      if (ev.model) {
        const tag = `${ev.agent || ""}:${ev.model}${ev.effort ? `/${ev.effort}` : ""}`;
        if (!cur.models.includes(tag)) cur.models.push(tag);
      }
      const u = ev.usage ?? {};
      const cmds = Number(u.commands ?? ev.commands ?? 0);
      const inT = Number(u.inputTokens ?? 0);
      const cR = Number(u.cacheReadTokens ?? 0);
      const cW = Number(u.cacheWriteTokens ?? 0);
      const outT = Number(u.outputTokens ?? 0);
      totals.commands += cmds;
      totals.inputTokens += inT;
      totals.cacheReadTokens += cR;
      totals.cacheWriteTokens += cW;
      totals.outputTokens += outT;
      cur.commands += cmds;
      cur.inputTokens += inT;
      cur.cacheReadTokens += cR;
      cur.outputTokens += outT;
    }
  } catch {}
  return totals;
}

export function persist(run) {
  save(path.join(run.dir, "run.json"), run);
  const usage = summarizeRunUsage(run.dir);
  const rows = run.packages.map((p) => {
    const pu = usage.byPackage[p.id];
    const tokSummary = pu ? `${pu.calls} (${pu.commands} cmds · in=${pu.inputTokens} cR=${pu.cacheReadTokens} out=${pu.outputTokens})` : "0";
    return `| ${p.id} | ${p.state} | ${p.failureClass || ""} | ${p.durationMs ?? 0} | ${tokSummary} |`;
  });
  const usageNote = usage.calls
    ? `\n## Usage Summary\n- Calls: ${usage.calls} (interactive: ${usage.interactiveCalls}, failed: ${usage.failedCalls}) · Commands: ${usage.commands}\n- Tokens: input=${usage.inputTokens} · cacheRead=${usage.cacheReadTokens} · cacheWrite=${usage.cacheWriteTokens} · output=${usage.outputTokens}\n`
    : "";
  // Generated state is kept in the run, so existing memory files remain historical evidence.
  writeAtomic(path.join(run.dir, "status.md"), `# BAAN ${run.id}\n\nMode: ${run.executionMode ?? "interactive"} · Parallel: ${run.maxParallel ?? 4}\n\n| Package | State | Failure | ms | Calls / Usage |\n|---|---|---|---|---|\n${rows.join("\n")}\n${usageNote}`);
  for (const p of run.packages) {
    save(path.join(run.dir, "packets", `${p.id}.json`), packetView(p));
    writeAtomic(path.join(run.dir, `task-${p.id}.md`), `# ${p.title}\n\n${p.goal}\n\n${p.acceptance.map((a) => `- ${a.id}: ${a.text} (${a.source})`).join("\n")}\n`);
  }
}
export function loadRun(root, name) {
  const dir = name ? path.resolve(existsSync(name) ? name : path.join(root, ".baan", "runs", name)) : latest(root);
  const run = readJson(path.join(dir, "run.json"));
  if (run.version !== 2) throw new Error("unsupported run format: ใช้ BAAN รุ่นที่สร้าง run นี้; ไม่แก้ประวัติเดิม");
  if (!Array.isArray(run.packages) || !run.packages.length) throw new Error("run ไม่มี packages");
  validateTimeout(run.timeoutSec, "run.timeoutSec", true);
  if (!Number.isInteger(run.maxParallel) || run.maxParallel < 1 || run.maxParallel > 64) throw new Error("invalid run.maxParallel");
  run.packages.forEach(validatePacket); checkDag(run.packages);
  run.dir = dir;
  return run;
}
function latest(root) {
  const dir = path.join(root, ".baan", "runs");
  const name = existsSync(dir) && readdirSync(dir).filter((n) => existsSync(path.join(dir, n, "run.json"))).sort().at(-1);
  if (!name) throw new Error("ยังไม่มี run");
  return path.join(dir, name);
}
