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
export function fileHash(file) {
  try {
    const stat = lstatSync(file);
    return hash(`${stat.mode & 0o777}:` + (stat.isSymbolicLink() ? readlinkSync(file) : stat.isDirectory() ? git(file, "rev-parse", "HEAD").trim() : readFileSync(file).toString("base64")));
  } catch (e) { if (e.code === "ENOENT") return null; throw e; }
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
  for (let i = 0; i < untracked.length; i += 64) {
    const chunk = untracked.slice(i, i + 64).filter((f) => !lstatSync(path.join(repo, f)).isSymbolicLink());
    if (!chunk.length) continue;
    const blobs = git(repo, "hash-object", "-w", "--", ...chunk).trim().split(/\r?\n/);
    chunk.forEach((f, j) => { untracked_blobs[f] = blobs[j]; });
  }
  // stash create writes a recovery object, without changing the index, working tree or stash list.
  const tracked = git(repo, "stash", "create").trim() || git(repo, "rev-parse", "HEAD").trim();
  return { repo, tracked, head: git(repo, "rev-parse", "HEAD").trim(), files, untracked, untracked_blobs,
    index: git(repo, "write-tree").trim(), stash: hash(git(repo, "stash", "list")),
    preexisting_changes: [...new Set([...changes, ...untracked])],
    id: hash(JSON.stringify(Object.entries(files).sort())) };
}
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
