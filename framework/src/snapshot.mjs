import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import path from "node:path";

export const hash = (value) => createHash("sha256").update(value).digest("hex");
export function git(repo, ...args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
}
export function repoRoot(repo) { return realpathSync(git(repo, "rev-parse", "--show-toplevel").trim()); }
const runtime = (f) => /^(?:\.baan|reports\/baan)(?:\/|$)/.test(f);
// Re-reading every file cost ~2 s per snapshot on a 3,000-file repo, about 20 snapshots per package attempt.
// A hash is reused only while size, mtime, ctime and mode all match, and never for a file touched within the
// last RACY_MS (an edit in the same timestamp tick could otherwise keep its old stat; git guards the same way).
const hashCache = new Map();
const RACY_MS = 2000;
export function fileHash(file) {
  try {
    const stat = lstatSync(file);
    if (stat.isDirectory()) {
      const nested = snapshot(file);
      return hash(JSON.stringify([nested.id, nested.head, nested.branch, nested.index, nested.stash]));
    }
    const key = `${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}:${stat.mode}`;
    const hit = hashCache.get(file);
    if (hit?.key === key) return hit.value;
    // Format unchanged on purpose: approvals store these digests, so a new format would make every approval stale.
    const value = hash(`${stat.mode & 0o777}:` + (stat.isSymbolicLink() ? readlinkSync(file) : readFileSync(file).toString("base64")));
    if (Date.now() - Math.max(stat.mtimeMs, stat.ctimeMs) > RACY_MS) hashCache.set(file, { key, value });
    else hashCache.delete(file);
    return value;
  } catch (e) { if (e.code === "ENOENT") { hashCache.delete(file); return null; } throw e; }
}
export function snapshot(repo) {
  repo = repoRoot(repo);
  const files = Object.create(null);
  for (const f of git(repo, "ls-files", "-z", "--cached", "--others", "--exclude-standard").split("\0").filter(Boolean)) {
    if (!runtime(f)) files[f] = fileHash(path.join(repo, f));
  }
  const changes = git(repo, "diff", "--name-only", "-z", "HEAD").split("\0").filter(Boolean);
  const untracked = git(repo, "ls-files", "--others", "--exclude-standard", "-z").split("\0").filter((f) => f && !runtime(f));
  const untracked_blobs = Object.create(null);
  const untracked_links = Object.fromEntries(untracked.filter((f) => lstatSync(path.join(repo, f)).isSymbolicLink()).map((f) => [f, readlinkSync(path.join(repo, f))]));
  for (let i = 0; i < untracked.length; i += 64) {
    const chunk = untracked.slice(i, i + 64).filter((f) => !Object.hasOwn(untracked_links, f));
    if (!chunk.length) continue;
    const blobs = git(repo, "hash-object", "-w", "--", ...chunk).trim().split(/\r?\n/);
    chunk.forEach((f, j) => { untracked_blobs[f] = blobs[j]; });
  }
  // stash create writes a recovery object, without changing the index, working tree or stash list.
  const tracked = git(repo, "stash", "create").trim() || git(repo, "rev-parse", "HEAD").trim();
  return { repo, tracked, head: git(repo, "rev-parse", "HEAD").trim(), branch: git(repo, "rev-parse", "--abbrev-ref", "HEAD").trim(), files, untracked, untracked_blobs, untracked_links,
    index: git(repo, "write-tree").trim(), stash: hash(git(repo, "stash", "list")),
    preexisting_changes: [...new Set([...changes, ...untracked])],
    id: hash(JSON.stringify(Object.entries(files).sort())) };
}
// Enough to identify and recover a snapshot (tracked = recovery commit); the full file map stays in *.snapshots.json.
export const snapshotRef = (s) => s && { id: s.id, head: s.head, branch: s.branch, index: s.index, stash: s.stash, tracked: s.tracked };
export function sameState(a, b) { return ["id", "head", "branch", "index", "stash"].every((key) => a[key] === b[key]); }
export function changedFiles(before, after) {
  return [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].filter((f) => before.files[f] !== after.files[f]);
}
export function matches(file, glob) {
  const pattern = glob.replaceAll("\\", "/");
  let regex = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "*" && pattern[i + 1] === "*") { i++; if (pattern[i + 1] === "/") { i++; regex += "(?:.*/)?"; } else regex += ".*"; }
    else if (c === "*") regex += "[^/]*";
    else if (c === "?") regex += "[^/]";
    else regex += c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${regex}$`).test(file.replaceAll("\\", "/"));
}
