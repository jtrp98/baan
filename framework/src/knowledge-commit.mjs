import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { memoryRootOf } from "./config.mjs";

export function gitIn(root, args) {
  const r = spawnSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true });
  return { ok: r.status === 0, out: r.stdout ?? "", err: (r.stderr ?? "").trim() };
}

const UNMERGED = new Set(["DD", "AU", "UD", "UA", "DU", "AA", "UU"]);
const IN_PROGRESS = ["rebase-merge", "rebase-apply", "MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD"];

export function unfinishedOperation(root) {
  const gitDir = gitIn(root, ["rev-parse", "--git-dir"]);
  if (!gitDir.ok) return null;
  const dir = path.resolve(root, gitDir.out.trim());
  return IN_PROGRESS.find((name) => existsSync(path.join(dir, name))) ?? null;
}

// `git add -A` marks conflicted files as resolved, so committing now would store the conflict markers.
export function conflictState(root, changes) {
  return unfinishedOperation(root) ?? (changes.some((c) => UNMERGED.has(c.code)) ? "unmerged files" : null);
}

const MAX_AUTO_COMMIT_BYTES = 10 * 1024 * 1024;
const SECRET_NAME = /(?:^|\/)(?:\.env(?:\..*)?|[^/]*\.(?:pem|key|p12|pfx|keystore)|id_(?:rsa|dsa|ecdsa|ed25519)|\.?credentials(?:\.json)?|\.npmrc|\.netrc)$/i;
const SECRET_TEXT = /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{30,}|sk-(?:proj-|ant-)?[A-Za-z0-9_-]{40,}|AKIA[0-9A-Z]{16}/;

// Sync pushes whatever it commits, so anything that looks like a secret, a huge file or another repository stays for a human.
export function screenChanges(root, entries) {
  const kept = [], skipped = [];
  for (const e of entries) {
    const full = path.join(root, e.file);
    let reason = null;
    if (e.code === "??" && e.file.endsWith("/")) reason = "เป็น git repo ซ้อนหรือโฟลเดอร์ที่ git ไม่เปิดดู";
    else if (SECRET_NAME.test(e.file)) reason = "ชื่อไฟล์เหมือนไฟล์ลับ";
    else if (classifyChange(e.code) !== "remove" && existsSync(full)) {
      const size = statSync(full).size;
      if (size > MAX_AUTO_COMMIT_BYTES) reason = `ใหญ่ ${(size / 1024 / 1024).toFixed(1)} MB เกินเพดาน auto-commit`;
      else if (statSync(full).isFile() && SECRET_TEXT.test(readFileSync(full, "latin1"))) reason = "เนื้อหามีรูปแบบ key/token";
    }
    (reason ? skipped : kept).push(reason ? { ...e, reason } : e);
  }
  return { kept, skipped };
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
  const changes = parsePorcelain(status.out);
  const blocked = conflictState(kr.path, changes);
  if (blocked) {
    log(`⚠ ${kr.name}: ค้าง ${blocked} — แก้ conflict ให้เสร็จก่อน จึงจะ commit อัตโนมัติ`);
    return { repo: true, commits: [], blocked };
  }
  const { kept, skipped } = screenChanges(kr.path, changes);
  for (const s of skipped) log(`⚠ ${kr.name}: ไม่ auto-commit ${s.file} — ${s.reason} (ตรวจแล้ว commit เองหรือใส่ .gitignore)`);
  const plans = planCommits(kept, kr.name, kr.layout === "project" ? "project" : "module");
  const commits = [];
  for (const p of plans) {
    // A whole-folder `git add -A` would sweep the skipped files back in, so list the kept files instead.
    const holdsSkipped = p.scope && skipped.some((s) => s.file === p.scope || s.file.startsWith(`${p.scope}/`));
    const scope = kr.layout === "project" || !p.scope || holdsSkipped ? p.paths : [p.scope];
    const add = gitIn(kr.path, ["add", "-A", "--", ...scope]);
    const commit = add.ok ? gitIn(kr.path, ["commit", "-m", p.message, "--", ...scope]) : add;
    if (!commit.ok) {
      log(`⚠ ${kr.name}: commit "${p.message}" ไม่สำเร็จ — ${commit.err.split("\n")[0]}`);
      continue;
    }
    commits.push(p.message);
    log(`${kr.name}: ${p.message}`);
  }
  return { repo: true, commits, skipped: skipped.map(({ file, reason }) => ({ file, reason })) };
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
