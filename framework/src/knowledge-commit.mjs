import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { memoryRootOf } from "./config.mjs";

export function gitIn(root, args) {
  const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true });
  return { ok: r.status === 0, out: r.stdout ?? "", err: (r.stderr ?? "").trim() };
}

export function parsePorcelain(raw) {
  const parts = raw.split("\0");
  const entries = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    const code = parts[i].slice(0, 2);
    let file = parts[i].slice(3);
    if (code[0] === "R" || code[0] === "C") i++; // Porcelain emits the old path after the destination.
    entries.push({ code, file });
  }
  return entries;
}

export function classifyChange(code) {
  if (code.includes("?") || code.includes("A")) return "add";
  if (code.replace(/\s/g, "") === "D") return "remove";
  return "update";
}

function fileList(paths) {
  const names = [...paths].sort().map((p) => p.split(/[\\/]/).pop());
  const head = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${head} +${names.length - 2} more` : head;
}

function groupOf(seg, layout) {
  if (layout === "project" && seg.length > 3 && seg[1] === "modules") return { key: `${seg[0]}/${seg[2]}`, scope: `${seg[0]}/modules/${seg[2]}` };
  return { key: seg[0], scope: seg[0] };
}

export function planCommits(entries, rootName, layout = "module") {
  const groups = new Map();
  const scopes = new Map();
  for (const e of entries) {
    const seg = e.file.split(/[\\/]/);
    const g = seg.length > 1 ? groupOf(seg, layout) : { key: rootName, scope: null };
    const mod = g.key;
    if (g.scope) scopes.set(mod, g.scope);
    if (!groups.has(mod)) groups.set(mod, []);
    groups.get(mod).push(e);
  }
  return [...groups.entries()].map(([mod, es]) => {
    const kinds = new Set(es.map((e) => classifyChange(e.code)));
    const verb = kinds.size === 1 ? [...kinds][0] : "update";
    const paths = es.map((e) => e.file);
    return { module: mod, scope: scopes.get(mod) ?? null, verb, paths, message: `${mod}: ${verb} ${fileList(paths)}` };
  });
}

export function commitKnowledgeRoot(kr, log = () => {}) {
  if (!kr.path || !existsSync(path.join(kr.path, ".git"))) return { repo: false, commits: [] };
  const status = gitIn(kr.path, ["status", "--porcelain", "-z", "--untracked-files=all"]);
  if (!status.ok) {
    log(`⚠ ${kr.name}: อ่าน git status ไม่ได้ — ${status.err.split("\n")[0]}`);
    return { repo: true, commits: [], error: status.err };
  }
  const plans = planCommits(parsePorcelain(status.out), kr.name, kr.layout === "project" ? "project" : "module");
  const commits = [];
  for (const p of plans) {
    const scope = kr.layout === "project" ? p.paths : p.scope ? [p.scope] : p.paths;
    const add = gitIn(kr.path, ["add", "-A", "--", ...scope]);
    const commit = add.ok ? gitIn(kr.path, ["commit", "-m", p.message, "--", ...scope]) : add;
    if (!commit.ok) {
      log(`⚠ ${kr.name}: commit "${p.message}" ไม่สำเร็จ — ${commit.err.split("\n")[0]}`);
      continue;
    }
    commits.push(p.message);
    log(`${kr.name}: ${p.message}`);
  }
  return { repo: true, commits };
}

export function commitKnowledge(ws, log = () => {}) {
  const all = [];
  for (const kr of ws.knowledge_roots ?? []) {
    all.push(...commitKnowledgeRoot(kr, log).commits);
    const mem = memoryRootOf(kr);
    if (mem) all.push(...commitKnowledgeRoot({ name: `${kr.name}-memory`, path: mem, layout: kr.layout }, log).commits);
  }
  return all;
}
