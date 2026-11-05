import { existsSync, mkdirSync, readFileSync, readdirSync, appendFileSync } from "node:fs";
import path from "node:path";
import { writeAtomic } from "../run-store.mjs";
import { validatePacket, checkDag } from "./packet.mjs";

export const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
export function save(file, data) { mkdirSync(path.dirname(file), { recursive: true }); writeAtomic(file, JSON.stringify(data, null, 2)); }
export function event(run, type, data = {}) {
  appendFileSync(path.join(run.dir, "ledger.jsonl"), JSON.stringify({ at: new Date().toISOString(), type, ...data }) + "\n");
}
export function persist(run) {
  save(path.join(run.dir, "run.json"), run);
  const rows = run.packages.map((p) => `| ${p.id} | ${p.state} | ${p.failureClass || ""} | ${p.durationMs ?? 0} |`);
  // Generated state is kept in the run, so existing memory files remain historical evidence.
  writeAtomic(path.join(run.dir, "status.md"), `# BAAN ${run.id}\n\n| Package | State | Failure | ms |\n|---|---|---|---|\n${rows.join("\n")}\n`);
  for (const p of run.packages) {
    save(path.join(run.dir, "packets", `${p.id}.json`), p);
    writeAtomic(path.join(run.dir, `task-${p.id}.md`), `# ${p.title}\n\n${p.goal}\n\n${p.acceptance.map((a) => `- ${a.id}: ${a.text} (${a.source})`).join("\n")}\n`);
  }
}
export function loadRun(root, name) {
  const dir = name ? path.resolve(existsSync(name) ? name : path.join(root, ".baan", "runs", name)) : latest(root);
  const run = readJson(path.join(dir, "run.json"));
  if (run.version !== 2) throw new Error("run เก่า: resume ด้วย BAAN รุ่นก่อน v2");
  if (!Array.isArray(run.packages) || !run.packages.length) throw new Error("run ไม่มี packages");
  run.packages.forEach(validatePacket); checkDag(run.packages);
  run.dir = dir;
  return run;
}
function latest(root) {
  const dir = path.join(root, ".baan", "runs");
  const name = existsSync(dir) && readdirSync(dir).filter((n) => existsSync(path.join(dir, n, "run.json"))).sort().at(-1);
  if (!name) throw new Error("ยังไม่มี v2 run");
  return path.join(dir, name);
}
