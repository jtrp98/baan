import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const OWNER_BY_CATEGORY = {
  requirement: "spec",
  "open-questions": "spec",
  design: "worker",
  plan: "นายช่าง",
  "test-plan": "worker",
  uxui: "ui",
  db: "worker",
  qa: "นายช่าง",
  check: "นายช่าง",
  review: "review",
};
const OWNER_BY_ROOT_FILE = { "backlog.md": "นายช่าง", "security.md": "worker" };
const CONTROLLER = "นายช่าง";

const SKIP_DIRS = new Set([".git", "node_modules", "archive", "changelog", "bin", "obj", "dist", "reports", ".vs", ".idea"]);
const skip = (name, kind) => SKIP_DIRS.has(name) || name.startsWith(".") || kind === "target" && name === "build";
const MAX_FILE_BYTES = 2 * 1024 * 1024;

export function ownerOf(relPath, kind) {
  if (kind === "target") return "worker";
  const parts = relPath.split(/[\\/]/);
  const modules = parts.indexOf("modules");
  if (modules >= 0) {
    const slot = parts[modules + 2], file = parts.at(-1);
    if (slot === "build") return "worker";
    if (slot === "design") return /review|handoff/.test(file) ? "review" : /feasibility/.test(file) ? "survey" : "ui";
    if (slot === "shared" && /requirements|oq/.test(file)) return "spec";
    return CONTROLLER;
  }
  if (parts.length <= 2) return OWNER_BY_ROOT_FILE[parts.at(-1)] ?? CONTROLLER;
  return OWNER_BY_CATEGORY[parts[1]] ?? CONTROLLER;
}

function* walk(dir, kind) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!skip(e.name, kind)) yield* walk(full, kind); }
    else if (e.isFile()) yield full;
  }
}

function listFiles(dir, kind) {
  const r = spawnSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: dir, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0 || r.error) return [...walk(dir, kind)];
  return r.stdout.split("\0").filter(Boolean)
    .filter((f) => !f.split("/").slice(0, -1).some((d) => skip(d, kind)))
    .map((f) => path.join(dir, f));
}

function readText(file) {
  if (statSync(file).size > MAX_FILE_BYTES) return null;
  const buf = readFileSync(file);
  if (buf.subarray(0, 8000).includes(0)) return null;
  return buf.toString("utf8");
}

// roots: [{ path, kind: "knowledge" | "target", label }]
export function sweep(roots, terms) {
  const hits = [];
  for (const root of roots) {
    for (const file of listFiles(root.path, root.kind)) {
      let text;
      try { text = readText(file); } catch { continue; } // Git may still list a deleted file.
      if (text === null || !terms.some((t) => text.includes(t))) continue;
      const rel = path.relative(root.path, file);
      const lines = [];
      text.split(/\r?\n/).forEach((l, i) => { if (terms.some((t) => l.includes(t))) lines.push(i + 1); });
      hits.push({ file: path.join(root.label, rel), owner: ownerOf(root.kind === "target" ? rel : path.join(root.label, rel), root.kind), lines });
    }
  }
  return hits.sort((a, b) => a.owner.localeCompare(b.owner) || a.file.localeCompare(b.file));
}

export function formatSweep(hits, terms) {
  const out = [`related-impact sweep: ${terms.map((t) => JSON.stringify(t)).join(", ")}`];
  if (!hits.length) {
    out.push("ไม่มีผู้อ้างอิง — บันทึกในใบงานว่าตรวจแล้วไม่มี (ข้าม archive/ และ changelog/)");
    return out.join("\n");
  }
  const byOwner = new Map();
  for (const h of hits) byOwner.set(h.owner, [...(byOwner.get(h.owner) ?? []), h]);
  out.push(`พบ ${hits.length} ไฟล์ · ${hits.reduce((n, h) => n + h.lines.length, 0)} บรรทัด (ข้าม archive/ และ changelog/)`, "", "| เจ้าของ | ไฟล์ | บรรทัด |", "|---|---|---|");
  for (const h of hits) out.push(`| ${h.owner} | ${h.file.replaceAll("\\", "/")} | ${h.lines.join(", ")} |`);
  out.push("", `ต่อเจ้าของ: ${[...byOwner].map(([o, hs]) => `${o} ${hs.length} ไฟล์`).join(" · ")}`);
  return out.join("\n");
}
